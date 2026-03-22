import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import { drawPulsingGlowRings, drawPoisonBubbles, drawShiftingSegments, drawOrbitingDebris, drawAnimatedTendril, drawFloatingPiece } from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";

export function drawBogCreatureEnemy(
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
  const sway = Math.sin(time * 2) * 0.12;
  const drip = (time * 2) % 1;
  const pulse = 0.85 + Math.sin(time * 3) * 0.15;
  const breathe = Math.sin(time * 1.5) * 0.03;
  const bioGlow = 0.5 + Math.sin(time * 4) * 0.5;
  const attackLurch = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.08 : 0;
  size *= 1.4;

  // Toxic aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, "rgba(34, 197, 94, 0)");
  auraGrad.addColorStop(0.7, `rgba(34, 197, 94, ${pulse * 0.08})`);
  auraGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Toxic drip pool beneath
  const poolPulse = 0.3 + Math.sin(time * 2) * 0.1;
  const poolGrad = ctx.createRadialGradient(
    x, y + size * 0.5, size * 0.1,
    x, y + size * 0.5, size * 0.6,
  );
  poolGrad.addColorStop(0, `rgba(34, 197, 94, ${poolPulse})`);
  poolGrad.addColorStop(0.5, `rgba(22, 101, 52, ${poolPulse * 0.6})`);
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.6, size * 0.6 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();


  // Toxic ripples in the pool
  ctx.strokeStyle = `rgba(132, 204, 22, ${0.2 + Math.sin(time * 3) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  for (let rip = 0; rip < 3; rip++) {
    const ripPhase = (time * 0.8 + rip * 0.33) % 1;
    const ripRadius = size * (0.15 + ripPhase * 0.35);
    ctx.globalAlpha = (1 - ripPhase) * 0.4;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.5, ripRadius, ripRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Murky water reflection
  ctx.fillStyle = "rgba(34, 87, 22, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1, y + size * 0.48,
    size * 0.25, size * 0.25 * ISO_Y_RATIO, 0.2, 0, Math.PI * 2,
  );
  ctx.fill();

  // Bubbles popping from toxic surface
  for (let b = 0; b < 6; b++) {
    const bubblePhase = (time * 1.2 + b * 0.4) % 1;
    const bubbleX = x + Math.sin(b * 2.3) * size * 0.35;
    const bubbleBaseY = y + size * 0.45;
    const bubbleY = bubbleBaseY - bubblePhase * size * 0.25;
    const bubbleSize = size * (0.02 + Math.sin(b) * 0.01) * (1 - bubblePhase * 0.5);
    const bubbleAlpha = (1 - bubblePhase) * 0.6;
    ctx.fillStyle = `rgba(132, 204, 22, ${bubbleAlpha})`;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
    // Bubble highlight
    ctx.fillStyle = `rgba(200, 255, 150, ${bubbleAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(
      bubbleX - bubbleSize * 0.3, bubbleY - bubbleSize * 0.3,
      bubbleSize * 0.3, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Writhing tentacle roots emerging from below
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 4 * zoom;
  for (let t = 0; t < 5; t++) {
    const angle = (t / 5) * Math.PI * 2 + time * 0.5;
    const tentacleWave = Math.sin(time * 3 + t * 1.2) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * size * 0.3, y + size * 0.35);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * size * (0.45 + tentacleWave),
      y + size * 0.2,
      x + Math.cos(angle) * size * (0.5 + tentacleWave * 0.5),
      y + size * 0.4,
    );
    ctx.stroke();
  }

  // Major arm tendrils reaching outward
  const tendrilAngles = [-0.7, -0.2, 0.3, 0.8];
  for (let t = 0; t < 4; t++) {
    const baseAngle = tendrilAngles[t];
    const tendrilSway = Math.sin(time * 2.5 + t * 1.7) * 0.2;
    const lashForward = isAttacking ? Math.sin(attackPhase * Math.PI + t) * 0.3 : 0;
    const startX = x + Math.cos(baseAngle) * size * 0.35;
    const startY = y - size * 0.1 + Math.sin(baseAngle) * size * 0.1;
    const midX = startX + Math.cos(baseAngle + tendrilSway) * size * (0.25 + lashForward);
    const midY = startY + Math.sin(baseAngle + tendrilSway) * size * 0.15 + Math.sin(time * 3 + t) * size * 0.05;
    const endX = midX + Math.cos(baseAngle + tendrilSway * 1.5) * size * (0.2 + lashForward * 0.5);
    const endY = midY + Math.sin(time * 4 + t * 2) * size * 0.1;

    // Tendril body
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = (5 - t * 0.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();

    // Tendril suction cups
    ctx.fillStyle = "rgba(82, 54, 25, 0.6)";
    for (let s = 0; s < 3; s++) {
      const st = (s + 1) / 4;
      const sx = startX + (endX - startX) * st + Math.sin(time * 3 + s) * size * 0.02;
      const sy = startY + (endY - startY) * st;
      ctx.beginPath();
      ctx.arc(sx, sy, size * (0.025 - s * 0.005), 0, Math.PI * 2);
      ctx.fill();
    }

    // Tendril tip drip
    ctx.fillStyle = `rgba(132, 204, 22, ${0.5 + Math.sin(time * 5 + t) * 0.3})`;
    ctx.beginPath();
    ctx.arc(endX, endY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // Massive muddy legs with exposed bone/roots
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.22, y + size * 0.2,
    size * 0.18, size * 0.3, sway * 0.25, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.22, y + size * 0.2,
    size * 0.18, size * 0.3, -sway * 0.25, 0, Math.PI * 2,
  );
  ctx.fill();

  // Root-like veins on legs
  ctx.strokeStyle = "#1a2e05";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.05);
  ctx.lineTo(x - size * 0.25, y + size * 0.35);
  ctx.moveTo(x - size * 0.18, y + size * 0.1);
  ctx.lineTo(x - size * 0.15, y + size * 0.3);
  ctx.moveTo(x + size * 0.22, y + size * 0.05);
  ctx.lineTo(x + size * 0.25, y + size * 0.35);
  ctx.stroke();

  // Bog Creature arms — lurching swamp reach
  drawPathArm(ctx, x - size * 0.4, y - size * 0.2, size, time, zoom, -1, {
    color: bodyColor, colorDark: bodyColorDark,
    shoulderAngle: -0.8 + Math.sin(time * 1.5) * 0.12 + (isAttacking ? -attackPhase * 0.5 : 0),
    elbowAngle: 0.5 + Math.sin(time * 2 + 0.5) * 0.1,
    upperLen: 0.22, foreLen: 0.18, width: 0.08,
    handColor: "#84cc16", handRadius: 0.04,
    style: 'fleshy',
  });
  drawPathArm(ctx, x + size * 0.4, y - size * 0.2, size, time, zoom, 1, {
    color: bodyColor, colorDark: bodyColorDark,
    shoulderAngle: 0.4 + Math.sin(time * 1.8 + 1.2) * 0.08 + (isAttacking ? attackPhase * 0.4 : 0),
    elbowAngle: 0.7 + Math.sin(time * 2.2 + 2) * 0.1,
    upperLen: 0.22, foreLen: 0.18, width: 0.08,
    handColor: "#84cc16", handRadius: 0.04,
    style: 'fleshy',
  });

  // Sludge-dripping fleshy legs (behind body)
  drawPathLegs(ctx, x, y + size * 0.1, size, time, zoom, {
    color: bodyColor, colorDark: bodyColorDark,
    footColor: "#1a2e05",
    strideSpeed: 2, strideAmt: 0.2,
    legLen: 0.22, width: 0.07,
    shuffle: true, phaseOffset: 0,
    style: 'fleshy',
  });

  // Main body - twisted amorphous mass (lurches forward when attacking)
  const bodyGrad = ctx.createLinearGradient(
    x - size * 0.4, y - size * 0.5,
    x + size * 0.3, y + size * 0.2,
  );
  bodyGrad.addColorStop(0, bodyColorDark);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y);
  ctx.quadraticCurveTo(
    x - size * 0.55, y - size * 0.35,
    x - size * 0.25, y - size * 0.6,
  );
  ctx.quadraticCurveTo(
    x - size * 0.1, y - size * 0.72 + sway * size * 0.1 + breathe * size,
    x + attackLurch, y - size * 0.65,
  );
  ctx.quadraticCurveTo(
    x + size * 0.1, y - size * 0.72 + sway * size * 0.1 + breathe * size,
    x + size * 0.25, y - size * 0.6,
  );
  ctx.quadraticCurveTo(x + size * 0.55, y - size * 0.35, x + size * 0.45, y);
  ctx.quadraticCurveTo(x + size * 0.35, y + size * 0.15, x, y + size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.15, x - size * 0.45, y);
  ctx.fill();

  // Bubbling surface detail across body
  for (let bb = 0; bb < 8; bb++) {
    const bbPhase = (time * 1.8 + bb * 0.5) % 1;
    const bbX = x + Math.sin(bb * 1.9 + time * 0.5) * size * 0.3;
    const bbY = y - size * 0.4 + Math.cos(bb * 2.3) * size * 0.25 - bbPhase * size * 0.12;
    const bbSize = size * (0.015 + Math.sin(bb * 1.4) * 0.008) * (1 - bbPhase);
    const bbAlpha = (1 - bbPhase) * 0.5;
    ctx.fillStyle = `rgba(100, 180, 60, ${bbAlpha})`;
    ctx.beginPath();
    ctx.arc(bbX, bbY, bbSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(180, 255, 120, ${bbAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(bbX - bbSize * 0.3, bbY - bbSize * 0.3, bbSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Exposed rib-like structures
  ctx.strokeStyle = "#2d1f0d";
  ctx.lineWidth = 3 * zoom;
  for (let r = 0; r < 4; r++) {
    const ribY = y - size * 0.1 - r * size * 0.12;
    const ribCurve = Math.sin(time * 2 + r) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35 + ribCurve, ribY);
    ctx.quadraticCurveTo(x - size * 0.15, ribY - size * 0.05, x, ribY);
    ctx.quadraticCurveTo(
      x + size * 0.15, ribY - size * 0.05,
      x + size * 0.35 - ribCurve, ribY,
    );
    ctx.stroke();
  }

  // Embedded partial skull visible through flesh
  ctx.save();
  ctx.globalAlpha = 0.5 + Math.sin(time * 1.5) * 0.15;
  ctx.fillStyle = "#d4c9a0";
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.05, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.07, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y - size * 0.07, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.03);
  ctx.lineTo(x + size * 0.11, y - size * 0.01);
  ctx.lineTo(x + size * 0.13, y - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bone fragments protruding from body
  ctx.fillStyle = "#c8c0a0";
  ctx.strokeStyle = "#a09878";
  ctx.lineWidth = 1.5 * zoom;
  const bonePositions = [
    { bx: -0.3, by: -0.15, angle: -0.4, len: 0.12 },
    { bx: 0.28, by: 0.05, angle: 0.6, len: 0.1 },
    { bx: -0.1, by: 0.08, angle: -0.8, len: 0.08 },
  ];
  for (const bone of bonePositions) {
    const boneX = x + bone.bx * size;
    const boneY = y + bone.by * size;
    ctx.beginPath();
    ctx.moveTo(boneX, boneY);
    ctx.lineTo(
      boneX + Math.cos(bone.angle) * size * bone.len,
      boneY + Math.sin(bone.angle) * size * bone.len,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(boneX, boneY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      boneX + Math.cos(bone.angle) * size * bone.len,
      boneY + Math.sin(bone.angle) * size * bone.len,
      size * 0.015, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Rotting flesh patches with different textures
  ctx.fillStyle = "rgba(82, 54, 25, 0.6)";
  for (let i = 0; i < 7; i++) {
    const patchX = x + Math.sin(i * 1.2 + time * 0.3) * size * 0.25;
    const patchY = y - size * 0.25 + Math.cos(i * 1.7) * size * 0.2;
    const patchSize = size * (0.06 + Math.sin(i) * 0.03);
    ctx.beginPath();
    ctx.ellipse(patchX, patchY, patchSize, patchSize * 0.7, i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Oozing slime trails with bioluminescence
  ctx.fillStyle = `rgba(132, 204, 22, ${0.6 + Math.sin(time * 4) * 0.2})`;
  for (let d = 0; d < 5; d++) {
    const dripX = x - size * 0.25 + d * size * 0.12;
    const dripPhase = (drip + d * 0.2) % 1;
    const dripY = y - size * 0.1 + dripPhase * size * 0.5;
    const dripLength = size * (0.08 + dripPhase * 0.06);
    ctx.beginPath();
    ctx.ellipse(dripX, dripY, size * 0.025, dripLength, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dripping ooze trails from body edges
  for (let ot = 0; ot < 4; ot++) {
    const otX = x - size * 0.35 + ot * size * 0.22;
    const otPhase = (time * 0.8 + ot * 0.45) % 1;
    const otStartY = y + size * 0.1;
    const otEndY = otStartY + otPhase * size * 0.35;
    const otWidth = Math.max(0, size * (0.018 - otPhase * 0.008));
    const otHeight = Math.max(0, (otEndY - otStartY) * 0.5);
    const otAlpha = (1 - otPhase) * 0.7;
    ctx.fillStyle = `rgba(110, 180, 30, ${otAlpha})`;
    ctx.beginPath();
    ctx.ellipse(otX, (otStartY + otEndY) * 0.5, otWidth, otHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(132, 204, 22, ${otAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(otX, otEndY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shoulder growths/tumors
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x - size * 0.38, y - size * 0.35, size * 0.12, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y - size * 0.3, size * 0.1, 0, Math.PI * 2);
  ctx.arc(x - size * 0.32, y - size * 0.22, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Bioluminescent spots that pulse across body
  const bioSpots = [
    { sx: -0.28, sy: -0.2, sr: 0.035 },
    { sx: 0.2, sy: -0.1, sr: 0.03 },
    { sx: -0.05, sy: 0.05, sr: 0.025 },
    { sx: 0.32, sy: -0.25, sr: 0.028 },
    { sx: -0.35, sy: -0.05, sr: 0.032 },
    { sx: 0.1, sy: -0.35, sr: 0.022 },
    { sx: -0.18, sy: 0.1, sr: 0.02 },
  ];
  for (let bs = 0; bs < bioSpots.length; bs++) {
    const spot = bioSpots[bs];
    const spotPulse = 0.3 + Math.sin(time * 3.5 + bs * 1.3) * 0.7;
    const spotGrad = ctx.createRadialGradient(
      x + spot.sx * size, y + spot.sy * size, 0,
      x + spot.sx * size, y + spot.sy * size, size * spot.sr * 2,
    );
    spotGrad.addColorStop(0, `rgba(120, 255, 60, ${spotPulse * 0.9})`);
    spotGrad.addColorStop(0.5, `rgba(80, 200, 40, ${spotPulse * 0.4})`);
    spotGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(x + spot.sx * size, y + spot.sy * size, size * spot.sr * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(180, 255, 100, ${spotPulse})`;
    ctx.beginPath();
    ctx.arc(x + spot.sx * size, y + spot.sy * size, size * spot.sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing pustules
  ctx.fillStyle = `rgba(162, 255, 82, ${pulse * 0.8})`;
  setShadowBlur(ctx, 6 * zoom, "#84cc16");
  ctx.beginPath();
  ctx.arc(x - size * 0.38, y - size * 0.35, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.25, y - size * 0.15, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x - size * 0.15, y, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Eye stalks protruding from head
  const eyeStalkData = [
    { angle: -1.2, len: 0.2, eyeSize: 0.04 },
    { angle: -0.5, len: 0.25, eyeSize: 0.035 },
    { angle: 0.8, len: 0.18, eyeSize: 0.03 },
  ];
  for (let es = 0; es < eyeStalkData.length; es++) {
    const stalk = eyeStalkData[es];
    const stalkSway = Math.sin(time * 2.5 + es * 2) * 0.15;
    const stalkBaseX = x + Math.cos(stalk.angle) * size * 0.15;
    const stalkBaseY = y - size * 0.55;
    const stalkTipX = stalkBaseX + Math.cos(stalk.angle + stalkSway) * size * stalk.len;
    const stalkTipY = stalkBaseY - size * stalk.len * 0.8 + Math.sin(time * 3 + es) * size * 0.03;

    // Stalk body
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(stalkBaseX, stalkBaseY);
    ctx.quadraticCurveTo(
      stalkBaseX + Math.cos(stalk.angle + stalkSway * 0.5) * size * stalk.len * 0.5,
      stalkBaseY - size * stalk.len * 0.5,
      stalkTipX, stalkTipY,
    );
    ctx.stroke();

    // Eye on stalk
    ctx.fillStyle = "#84cc16";
    setShadowBlur(ctx, 8 * zoom, "#84cc16");
    ctx.beginPath();
    ctx.arc(stalkTipX, stalkTipY, size * stalk.eyeSize, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
    // Stalk eye pupil
    ctx.fillStyle = "#0a1f05";
    ctx.beginPath();
    ctx.ellipse(
      stalkTipX, stalkTipY,
      size * stalk.eyeSize * 0.35, size * stalk.eyeSize * 0.7,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Multiple glowing eyes in asymmetric positions
  ctx.fillStyle = "#84cc16";
  setShadowBlur(ctx, 12 * zoom, "#84cc16");
  ctx.beginPath();
  ctx.arc(x - size * 0.18, y - size * 0.42, size * 0.08, 0, Math.PI * 2);
  ctx.arc(x + size * 0.12, y - size * 0.4, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.35, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x - size * 0.08, y - size * 0.52, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.02, y - size * 0.38, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Slit pupils with vertical orientation
  ctx.fillStyle = "#0a1f05";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.18, y - size * 0.42,
    size * 0.025, size * 0.05, 0, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.12, y - size * 0.4,
    size * 0.02, size * 0.045, 0, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.25, y - size * 0.35,
    size * 0.012, size * 0.025, 0, 0, Math.PI * 2,
  );
  ctx.fill();

  // Gaping maw with visible fangs
  const mawOpen = isAttacking ? size * 0.08 : size * 0.02;
  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.27);
  ctx.quadraticCurveTo(x, y - size * 0.32 - mawOpen, x + size * 0.15, y - size * 0.27);
  ctx.quadraticCurveTo(x, y - size * 0.18 + mawOpen, x - size * 0.15, y - size * 0.27);
  ctx.fill();

  // Deep throat glow
  const throatGrad = ctx.createRadialGradient(
    x, y - size * 0.25, 0,
    x, y - size * 0.25, size * 0.1,
  );
  throatGrad.addColorStop(0, `rgba(132, 204, 22, ${0.4 + bioGlow * 0.3})`);
  throatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = throatGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Upper fangs
  ctx.fillStyle = "#c8c0a0";
  for (let f = 0; f < 5; f++) {
    const fangX = x - size * 0.1 + f * size * 0.05;
    const fangLen = size * (0.06 + (f === 1 || f === 3 ? 0.03 : 0));
    ctx.beginPath();
    ctx.moveTo(fangX - size * 0.01, y - size * 0.28);
    ctx.lineTo(fangX, y - size * 0.28 + fangLen);
    ctx.lineTo(fangX + size * 0.01, y - size * 0.28);
    ctx.fill();
  }
  // Lower fangs
  for (let f = 0; f < 4; f++) {
    const fangX = x - size * 0.08 + f * size * 0.05;
    const fangLen = size * (0.04 + (f === 1 ? 0.02 : 0));
    ctx.beginPath();
    ctx.moveTo(fangX - size * 0.008, y - size * 0.22);
    ctx.lineTo(fangX, y - size * 0.22 - fangLen);
    ctx.lineTo(fangX + size * 0.008, y - size * 0.22);
    ctx.fill();
  }

  // Drool/saliva strands from maw
  ctx.strokeStyle = `rgba(132, 204, 22, ${0.4 + Math.sin(time * 3) * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  for (let dr = 0; dr < 3; dr++) {
    const droolX = x - size * 0.06 + dr * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(droolX, y - size * 0.22);
    ctx.quadraticCurveTo(
      droolX + Math.sin(time * 4 + dr) * size * 0.02,
      y - size * 0.17,
      droolX, y - size * 0.14 + Math.sin(time * 2 + dr) * size * 0.02,
    );
    ctx.stroke();
  }

  // Fungal growths protruding from top - expanded cluster
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.62, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.6, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.2, y - size * 0.55, size * 0.045, 0, Math.PI * 2);
  ctx.arc(x - size * 0.05, y - size * 0.67, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Additional mushroom-cap fungal growths
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.22, y - size * 0.64, size * 0.06, size * 0.035, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.15, y - size * 0.63, size * 0.05, size * 0.03, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Mushroom cap spots
  ctx.fillStyle = `rgba(200, 255, 120, ${0.4 + Math.sin(time * 2.5) * 0.2})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.23, y - size * 0.65, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x - size * 0.19, y - size * 0.63, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.14, y - size * 0.64, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Fungal stalks
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55);
  ctx.lineTo(x - size * 0.15, y - size * 0.68);
  ctx.moveTo(x + size * 0.08, y - size * 0.52);
  ctx.lineTo(x + size * 0.1, y - size * 0.65);
  ctx.moveTo(x - size * 0.22, y - size * 0.57);
  ctx.lineTo(x - size * 0.22, y - size * 0.64);
  ctx.moveTo(x + size * 0.15, y - size * 0.56);
  ctx.lineTo(x + size * 0.15, y - size * 0.63);
  ctx.stroke();

  // Floating spores
  ctx.fillStyle = `rgba(132, 204, 22, ${0.5 + Math.sin(time * 2) * 0.3})`;
  for (let s = 0; s < 8; s++) {
    const sporeX = x + Math.sin(time * 1.5 + s * 1.1) * size * 0.55;
    const sporeY = y - size * 0.4 + Math.cos(time * 2 + s * 0.8) * size * 0.35;
    const sporeSize = size * (0.015 + Math.sin(time * 3 + s) * 0.008);
    ctx.beginPath();
    ctx.arc(sporeX, sporeY, sporeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Toxic poison bubbles
  drawPoisonBubbles(ctx, x, y - size * 0.2, size * 0.45, time, zoom, {
    color: "rgba(34, 197, 94, 0.5)",
    count: 5, speed: 1.0, maxAlpha: 0.4,
    spread: 0.8,
  });

  // Floating muck/debris segments
  drawShiftingSegments(ctx, x, y - size * 0.15, size, time, zoom, {
    color: "#2d3a1a", colorAlt: "#166534",
    count: 5, orbitRadius: 0.4, segmentSize: 0.035,
    orbitSpeed: 0.8, shape: "circle",
  });

  // Orbiting toxic debris
  drawOrbitingDebris(ctx, x, y - size * 0.2, size, time, zoom, {
    color: "#84cc16", glowColor: "rgba(132, 204, 22, 0.3)",
    count: 4, speed: 1.2, particleSize: 0.018,
    minRadius: 0.3, maxRadius: 0.5, trailLen: 2,
  });

  // Attack: toxic spray burst and body lurch
  if (isAttacking) {
    // Toxic spray from maw
    ctx.save();
    for (let spray = 0; spray < 8; spray++) {
      const sprayAngle = -Math.PI / 2 + (spray - 3.5) * 0.25;
      const sprayDist = attackPhase * size * (0.5 + Math.sin(spray * 1.7) * 0.2);
      const sprayAlpha = (1 - attackPhase) * 0.6;
      ctx.fillStyle = `rgba(132, 204, 22, ${sprayAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(sprayAngle) * sprayDist + attackLurch,
        y - size * 0.25 + Math.sin(sprayAngle) * sprayDist,
        size * (0.03 + Math.random() * 0.02) * (1 - attackPhase * 0.5),
        0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Toxic cloud around impact area
    const cloudGrad = ctx.createRadialGradient(
      x + attackLurch * 2, y - size * 0.25, 0,
      x + attackLurch * 2, y - size * 0.25, size * attackPhase * 0.6,
    );
    cloudGrad.addColorStop(0, `rgba(132, 204, 22, ${(1 - attackPhase) * 0.3})`);
    cloudGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(x + attackLurch * 2, y - size * 0.25, size * attackPhase * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawWillOWispEnemy(
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
  const float = Math.sin(time * 2.5) * size * 0.2;
  const pulse = 0.6 + Math.sin(time * 4) * 0.4;
  const flicker = 0.75 + Math.random() * 0.25;
  const spiralTime = time * 1.5;
  const colorShift = Math.sin(time * 1.8) * 0.5 + 0.5;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  size *= 1.5;

  // Color oscillation: green to yellow and back
  const rShift = Math.round(132 + colorShift * 88);
  const gShift = Math.round(204 + colorShift * 51);
  const bShift = Math.round(22 + colorShift * 10);
  const shiftColor = `rgba(${rShift}, ${gShift}, ${bShift}`;

  // Ethereal reflection pool on ground beneath
  const poolY = y + size * 0.55;
  const reflectPulse = 0.3 + Math.sin(time * 2.5) * 0.15;
  const reflPoolGrad = ctx.createRadialGradient(
    x, poolY, 0,
    x, poolY, size * 0.5,
  );
  reflPoolGrad.addColorStop(0, `${shiftColor}, ${reflectPulse * 0.4})`);
  reflPoolGrad.addColorStop(0.3, `rgba(74, 222, 128, ${reflectPulse * 0.25})`);
  reflPoolGrad.addColorStop(0.6, `${shiftColor}, ${reflectPulse * 0.1})`);
  reflPoolGrad.addColorStop(1, `${shiftColor}, 0)`);
  ctx.fillStyle = reflPoolGrad;
  ctx.beginPath();
  ctx.ellipse(x, poolY, size * 0.5, size * 0.5 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `${shiftColor}, ${reflectPulse * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  for (let rr = 0; rr < 3; rr++) {
    const rrPhase = (time * 0.6 + rr * 0.33) % 1;
    const rrRadius = size * (0.1 + rrPhase * 0.35);
    ctx.globalAlpha = (1 - rrPhase) * reflectPulse;
    ctx.beginPath();
    ctx.ellipse(x, poolY, rrRadius, rrRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ghostly ectoplasmic trail behind
  ctx.save();
  for (let trail = 0; trail < 6; trail++) {
    const trailOffset = trail * size * 0.08;
    const trailAlpha = (1 - trail / 6) * 0.2 * pulse * flicker;
    const trailSize = size * (0.35 - trail * 0.04);
    const trailGrad = ctx.createRadialGradient(
      x - trailOffset, y + float + trail * size * 0.02, 0,
      x - trailOffset, y + float + trail * size * 0.02, trailSize,
    );
    trailGrad.addColorStop(0, `${shiftColor}, ${trailAlpha})`);
    trailGrad.addColorStop(0.6, `${shiftColor}, ${trailAlpha * 0.4})`);
    trailGrad.addColorStop(1, `${shiftColor}, 0)`);
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.arc(x - trailOffset, y + float + trail * size * 0.02, trailSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Haunting aura - multiple layers
  for (let layer = 3; layer >= 0; layer--) {
    const layerSize = size * (0.9 + layer * 0.25) * (1 + attackIntensity * 0.3);
    const layerAlpha = pulse * 0.12 * (1 - layer * 0.2) * flicker;
    const glowGrad = ctx.createRadialGradient(
      x, y + float, 0,
      x, y + float, layerSize,
    );
    glowGrad.addColorStop(0, `rgba(${180 + colorShift * 40}, 255, ${120 + colorShift * 60}, ${layerAlpha * 0.8})`);
    glowGrad.addColorStop(0.3, `${shiftColor}, ${layerAlpha})`);
    glowGrad.addColorStop(0.6, `rgba(74, 222, 128, ${layerAlpha * 0.5})`);
    glowGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y + float, layerSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Light rays emanating from core
  ctx.save();
  const rayCount = 8;
  for (let r = 0; r < rayCount; r++) {
    const rayAngle = (r / rayCount) * Math.PI * 2 + time * 0.5;
    const rayLen = size * (0.5 + Math.sin(time * 3 + r * 1.5) * 0.15) * (1 + attackIntensity * 0.8);
    const rayAlpha = pulse * 0.2 * flicker * (1 + attackIntensity * 0.5);
    ctx.fillStyle = `${shiftColor}, ${rayAlpha})`;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(rayAngle - 0.05) * size * 0.1,
      y + float + Math.sin(rayAngle - 0.05) * size * 0.1,
    );
    ctx.lineTo(
      x + Math.cos(rayAngle) * rayLen,
      y + float + Math.sin(rayAngle) * rayLen,
    );
    ctx.lineTo(
      x + Math.cos(rayAngle + 0.05) * size * 0.1,
      y + float + Math.sin(rayAngle + 0.05) * size * 0.1,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Mesmerizing spiral pattern in the glow
  ctx.strokeStyle = `rgba(200, 255, 180, ${pulse * 0.25 * flicker})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let sp = 0; sp < 2; sp++) {
    const spOff = sp * Math.PI;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const angle = spiralTime * 2 + spOff + t * Math.PI * 4;
      const radius = t * size * 0.35;
      const sx = x + Math.cos(angle) * radius;
      const sy = y + float + Math.sin(angle) * radius * 0.6;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Spectral energy trails spiraling around
  ctx.strokeStyle = `rgba(180, 255, 150, ${pulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let spiral = 0; spiral < 3; spiral++) {
    const spiralOffset = spiral * ((Math.PI * 2) / 3);
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = spiralTime + spiralOffset + t * Math.PI * 2;
      const radius = size * (0.3 + t * 0.4);
      const sx = x + Math.cos(angle) * radius;
      const sy = y + float + Math.sin(angle) * radius * 0.5 - t * size * 0.3;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Outer flame wisps - organic irregular shapes
  for (let w = 0; w < 6; w++) {
    const wispAngle = (w / 6) * Math.PI * 2 + time * 1.2;
    const wispDist = size * (0.35 + Math.sin(time * 3 + w) * 0.1);
    const wispX = x + Math.cos(wispAngle) * wispDist;
    const wispY = y + float + Math.sin(wispAngle) * wispDist * 0.4;
    const flameH = size * (0.2 + Math.sin(time * 5 + w) * 0.08);
    const wispAlpha = pulse * 0.6 * flicker;

    // Irregular flame shape with multiple curves
    const wispGrad = ctx.createLinearGradient(wispX, wispY + size * 0.1, wispX, wispY - flameH);
    wispGrad.addColorStop(0, `${shiftColor}, ${wispAlpha * 0.3})`);
    wispGrad.addColorStop(0.5, `${shiftColor}, ${wispAlpha})`);
    wispGrad.addColorStop(1, `rgba(255, 255, 220, ${wispAlpha * 0.5})`);
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.moveTo(wispX, wispY + size * 0.12);
    ctx.bezierCurveTo(
      wispX + Math.cos(wispAngle) * size * 0.1,
      wispY + size * 0.02,
      wispX + Math.cos(wispAngle + 0.3) * size * 0.12,
      wispY - flameH * 0.4,
      wispX + Math.sin(time * 6 + w) * size * 0.03,
      wispY - flameH,
    );
    ctx.bezierCurveTo(
      wispX - Math.cos(wispAngle - 0.3) * size * 0.08,
      wispY - flameH * 0.5,
      wispX - Math.cos(wispAngle) * size * 0.08,
      wispY + size * 0.04,
      wispX, wispY + size * 0.12,
    );
    ctx.fill();
  }

  // Main ethereal body - more organic irregular flame
  const bodyGrad = ctx.createLinearGradient(
    x, y - size * 0.5 + float,
    x, y + size * 0.4 + float,
  );
  bodyGrad.addColorStop(0, `rgba(${220 + colorShift * 35}, 255, ${200 + colorShift * 40}, ${pulse * flicker})`);
  bodyGrad.addColorStop(0.3, bodyColorLight);
  bodyGrad.addColorStop(0.7, bodyColor);
  bodyGrad.addColorStop(1, `rgba(74, 222, 128, ${pulse * 0.3})`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  const tipWobble1 = Math.sin(time * 6) * size * 0.05;
  const tipWobble2 = Math.sin(time * 7 + 1) * size * 0.03;
  ctx.moveTo(x + tipWobble2, y - size * 0.55 + float + tipWobble1);
  ctx.bezierCurveTo(
    x + size * 0.15 + Math.sin(time * 5) * size * 0.05,
    y - size * 0.48 + float,
    x + size * 0.3, y - size * 0.35 + float,
    x + size * 0.35 + Math.sin(time * 4) * size * 0.04,
    y - size * 0.15 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.4, y + size * 0.05 + float,
    x + size * 0.25, y + size * 0.25 + float,
    x + size * 0.1, y + size * 0.35 + float,
  );
  ctx.quadraticCurveTo(
    x, y + size * 0.4 + float,
    x - size * 0.1, y + size * 0.35 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.25, y + size * 0.25 + float,
    x - size * 0.4, y + size * 0.05 + float,
    x - size * 0.35 - Math.sin(time * 4.5) * size * 0.04,
    y - size * 0.15 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.3, y - size * 0.35 + float,
    x - size * 0.15 - Math.sin(time * 5.5) * size * 0.05,
    y - size * 0.48 + float,
    x + tipWobble2, y - size * 0.55 + float + tipWobble1,
  );
  ctx.fill();

  // Inner spectral layers
  ctx.fillStyle = `rgba(200, 255, 180, ${pulse * 0.7 * flicker})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4 + float);
  ctx.quadraticCurveTo(
    x + size * 0.2, y - size * 0.15 + float,
    x + size * 0.15, y + size * 0.15 + float,
  );
  ctx.quadraticCurveTo(
    x, y + size * 0.25 + float,
    x - size * 0.15, y + size * 0.15 + float,
  );
  ctx.quadraticCurveTo(
    x - size * 0.2, y - size * 0.15 + float,
    x, y - size * 0.4 + float,
  );
  ctx.fill();

  // Spectral color shift layers
  const spectralPhase = Math.sin(time * 1.2) * 0.5 + 0.5;
  const spectralR = Math.round(120 + spectralPhase * 80);
  const spectralG = Math.round(200 + spectralPhase * 55);
  const spectralB = Math.round(100 + (1 - spectralPhase) * 80);
  ctx.fillStyle = `rgba(${spectralR}, ${spectralG}, ${spectralB}, ${pulse * 0.25 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(
    x + Math.sin(time * 1.8) * size * 0.05,
    y - size * 0.1 + float,
    size * 0.22, size * 0.18,
    time * 0.3, 0, Math.PI * 2,
  );
  ctx.fill();
  const shimmerPhase2 = Math.sin(time * 2.5 + 1.5) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(${Math.round(180 + shimmerPhase2 * 60)}, ${Math.round(220 + shimmerPhase2 * 35)}, ${Math.round(150 + shimmerPhase2 * 50)}, ${pulse * 0.15})`;
  ctx.beginPath();
  ctx.ellipse(
    x - Math.sin(time * 2.2) * size * 0.04,
    y - size * 0.15 + float,
    size * 0.15, size * 0.12,
    -time * 0.2, 0, Math.PI * 2,
  );
  ctx.fill();

  // Bright core with pulsing heart
  const coreGrad = ctx.createRadialGradient(
    x, y - size * 0.05 + float, 0,
    x, y - size * 0.05 + float, size * 0.2,
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${pulse * flicker})`);
  coreGrad.addColorStop(0.4, `rgba(220, 255, 200, ${pulse * 0.8})`);
  coreGrad.addColorStop(1, "rgba(132, 204, 22, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y - size * 0.05 + float,
    size * 0.18 * pulse, size * 0.22 * pulse,
    0, 0, Math.PI * 2,
  );
  ctx.fill();

  // Detailed skull face emerging from within
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.5})`;
  // Eye sockets - hollow and menacing
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1, y - size * 0.12 + float,
    size * 0.06, size * 0.08, -0.15, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1, y - size * 0.12 + float,
    size * 0.06, size * 0.08, 0.15, 0, Math.PI * 2,
  );
  ctx.fill();

  // Brow ridge
  ctx.strokeStyle = `rgba(0, 0, 0, ${pulse * 0.35})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.17 + float);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.21 + float, x, y - size * 0.19 + float);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.21 + float, x + size * 0.17, y - size * 0.17 + float);
  ctx.stroke();

  // Cheekbone shadows
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.13, y - size * 0.04 + float, size * 0.04, size * 0.025, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.13, y - size * 0.04 + float, size * 0.04, size * 0.025, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Inner eye glow - sinister
  ctx.fillStyle = `rgba(255, 255, 200, ${pulse * flicker})`;
  setShadowBlur(ctx, 8 * zoom, "#fff");
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.12 + float, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.12 + float, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Skull cracks
  ctx.strokeStyle = `rgba(0, 0, 0, ${pulse * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.2 + float);
  ctx.lineTo(x - size * 0.06, y - size * 0.13 + float);
  ctx.lineTo(x - size * 0.08, y - size * 0.1 + float);
  ctx.moveTo(x + size * 0.06, y - size * 0.18 + float);
  ctx.lineTo(x + size * 0.05, y - size * 0.12 + float);
  ctx.stroke();

  // Nose cavity
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.02 + float);
  ctx.lineTo(x - size * 0.025, y + size * 0.04 + float);
  ctx.lineTo(x + size * 0.025, y + size * 0.04 + float);
  ctx.closePath();
  ctx.fill();

  // Screaming mouth with visible teeth
  const mouthOpen = isAttacking ? size * 0.08 : size * 0.05;
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.45})`;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.12 + float,
    size * 0.08, mouthOpen, 0, 0, Math.PI * 2,
  );
  ctx.fill();

  // Skull teeth
  ctx.fillStyle = `rgba(200, 200, 180, ${pulse * 0.4})`;
  for (let tooth = 0; tooth < 5; tooth++) {
    const tx = x - size * 0.05 + tooth * size * 0.025;
    ctx.beginPath();
    ctx.rect(tx, y + size * 0.08 + float, size * 0.015, size * 0.025);
    ctx.fill();
  }

  // Orbiting satellite wisps
  const satelliteCount = 3;
  for (let sat = 0; sat < satelliteCount; sat++) {
    const satAngle = time * 2.5 + sat * ((Math.PI * 2) / satelliteCount);
    const satDist = size * (0.5 + Math.sin(time * 1.5 + sat) * 0.1);
    const satBob = Math.sin(time * 3 + sat * 2) * size * 0.08;
    const satX = x + Math.cos(satAngle) * satDist * (isAttacking ? 1.5 : 1);
    const satY = y + float + Math.sin(satAngle) * satDist * 0.35 + satBob;
    const satSize = size * (0.06 + Math.sin(time * 4 + sat) * 0.015);
    const satPulse = 0.5 + Math.sin(time * 5 + sat * 1.5) * 0.5;

    // Satellite glow
    const satGrad = ctx.createRadialGradient(satX, satY, 0, satX, satY, satSize * 2.5);
    satGrad.addColorStop(0, `rgba(255, 255, 240, ${satPulse * 0.7})`);
    satGrad.addColorStop(0.4, `${shiftColor}, ${satPulse * 0.5})`);
    satGrad.addColorStop(1, `${shiftColor}, 0)`);
    ctx.fillStyle = satGrad;
    setShadowBlur(ctx, 6 * zoom, `rgb(${rShift}, ${gShift}, ${bShift})`);
    ctx.beginPath();
    ctx.arc(satX, satY, satSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Satellite core
    ctx.fillStyle = `rgba(255, 255, 240, ${satPulse * 0.9})`;
    ctx.beginPath();
    ctx.arc(satX, satY, satSize, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    // Connecting thread to main body
    ctx.strokeStyle = `${shiftColor}, ${satPulse * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + float);
    ctx.quadraticCurveTo(
      x + Math.cos(satAngle) * satDist * 0.5,
      y + float + Math.sin(satAngle + 0.5) * satDist * 0.2,
      satX, satY,
    );
    ctx.stroke();
  }

  // Descending soul trails
  ctx.strokeStyle = `${shiftColor}, ${pulse * 0.35})`;
  ctx.lineWidth = 3 * zoom;
  for (let t = 0; t < 4; t++) {
    const trailPhase = (time * 1.5 + t * 0.5) % 1;
    const trailX = x + Math.sin(t * 2.1) * size * 0.25;
    ctx.beginPath();
    ctx.moveTo(trailX, y + size * 0.3 + float);
    ctx.quadraticCurveTo(
      trailX + Math.sin(time * 3 + t) * size * 0.15,
      y + size * 0.5 + trailPhase * size * 0.3 + float,
      trailX + Math.sin(time * 4 + t) * size * 0.2,
      y + size * 0.7 + trailPhase * size * 0.4 + float,
    );
    ctx.stroke();
  }

  // Floating ember particles
  ctx.fillStyle = `rgba(200, 255, 150, ${pulse * 0.8})`;
  for (let p = 0; p < 8; p++) {
    const particleAngle = time * 2 + p * 0.8;
    const particleDist = size * (0.4 + Math.sin(time * 3 + p) * 0.15);
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + float - size * 0.2 + Math.sin(particleAngle * 0.7) * size * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02 + Math.sin(time * 5 + p) * size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }

  // Animated tendrils trailing below
  for (let td = 0; td < 4; td++) {
    const tendrilAngle = Math.PI / 2 + (td - 1.5) * 0.4;
    drawAnimatedTendril(ctx, x + (td - 1.5) * size * 0.12, y + size * 0.25 + float, tendrilAngle, size, time, zoom, {
      color: `rgba(${rShift}, ${gShift}, ${bShift}, 0.4)`,
      tipColor: `rgba(255, 255, 200, ${pulse * 0.6})`,
      length: 0.25, width: 0.02, segments: 6,
      waveSpeed: 3, waveAmt: 0.05, tipRadius: 0.012,
    });
  }

  // Pulsing ethereal glow rings
  drawPulsingGlowRings(ctx, x, y + float, size * 0.3, time, zoom, {
    color: `rgba(${rShift}, ${gShift}, ${bShift}, 0.5)`,
    count: 4, speed: 2, maxAlpha: 0.3,
    expansion: 2, lineWidth: 1,
  });

  // Floating spirit shards
  drawShiftingSegments(ctx, x, y + float, size, time, zoom, {
    color: `rgba(200, 255, 180, ${pulse * 0.5})`,
    colorAlt: `rgba(255, 255, 200, ${pulse * 0.4})`,
    count: 5, orbitRadius: 0.45, segmentSize: 0.025,
    orbitSpeed: 1.8, shape: "shard",
  });


  // Attack: blinding light burst, rays extend, satellites scatter
  if (isAttacking) {
    // Blinding flash from core
    const flashGrad = ctx.createRadialGradient(
      x, y + float, 0,
      x, y + float, size * (0.6 + attackPhase * 0.8),
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${attackIntensity * 0.6})`);
    flashGrad.addColorStop(0.3, `rgba(255, 255, 200, ${attackIntensity * 0.4})`);
    flashGrad.addColorStop(0.6, `${shiftColor}, ${attackIntensity * 0.2})`);
    flashGrad.addColorStop(1, `${shiftColor}, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(x, y + float, size * (0.6 + attackPhase * 0.8), 0, Math.PI * 2);
    ctx.fill();

    // Extended attack rays
    ctx.save();
    for (let ar = 0; ar < 12; ar++) {
      const arAngle = (ar / 12) * Math.PI * 2 + time * 3;
      const arLen = size * (0.6 + attackPhase * 0.6);
      const arAlpha = attackIntensity * 0.5;
      ctx.strokeStyle = `rgba(255, 255, 220, ${arAlpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, y + float);
      ctx.lineTo(
        x + Math.cos(arAngle) * arLen,
        y + float + Math.sin(arAngle) * arLen,
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawSwampTrollEnemy(
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
  // SWAMP TROLL - Massive corrupted brute covered in parasitic growths and ancient rot
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 1.2) * 0.06;
  const stomp = Math.abs(Math.sin(time * 2.5)) * 4 * zoom;
  const rage = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.1 : 0;
  const muscleFlexPhase = Math.sin(time * 2) * 0.03;
  size *= 1.3; // Larger size


  // Murky footprint puddles
  ctx.fillStyle = "rgba(34, 87, 22, 0.35)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.25,
    y + size * 0.5,
    size * 0.15,
    size * 0.15 * ISO_Y_RATIO,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.3,
    y + size * 0.48,
    size * 0.12,
    size * 0.12 * ISO_Y_RATIO,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Massive tree-trunk legs with bark-like texture
  const legGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x - size * 0.2,
    y + size * 0.4,
  );
  legGrad.addColorStop(0, bodyColor);
  legGrad.addColorStop(0.5, bodyColorDark);
  legGrad.addColorStop(1, "#1a1a0a");
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.28,
    y + size * 0.25 - stomp * 0.4,
    size * 0.22,
    size * 0.35,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.28,
    y + size * 0.28,
    size * 0.22,
    size * 0.35,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Leg bark/skin texture
  ctx.strokeStyle = "#2d2a1a";
  ctx.lineWidth = 2 * zoom;
  for (let leg = -1; leg <= 1; leg += 2) {
    for (let line = 0; line < 4; line++) {
      ctx.beginPath();
      ctx.moveTo(x + leg * size * 0.18, y + size * 0.05 + line * size * 0.1);
      ctx.lineTo(x + leg * size * 0.35, y + size * 0.1 + line * size * 0.12);
      ctx.stroke();
    }
  }

  // Swamp Troll arms — heavy ground-slam fists
  drawPathArm(ctx, x - size * 0.48, y - size * 0.35, size, time, zoom, -1, {
    color: bodyColor, colorDark: bodyColorDark,
    shoulderAngle: -0.3 + Math.sin(time * 1.2) * 0.08 + (isAttacking ? -rage * 1.5 : 0),
    elbowAngle: 0.5 + Math.sin(time * 1.5 + 0.5) * 0.1,
    upperLen: 0.28, foreLen: 0.22, width: 0.1,
    handColor: "#2a2a1a", handRadius: 0.06,
    style: 'fleshy',
  });
  drawPathArm(ctx, x + size * 0.48, y - size * 0.35, size, time, zoom, 1, {
    color: bodyColor, colorDark: bodyColorDark,
    shoulderAngle: 0.3 + Math.sin(time * 1.2 + Math.PI) * 0.08 + (isAttacking ? rage * 1.5 : 0),
    elbowAngle: 0.5 + Math.sin(time * 1.5 + 2) * 0.1,
    upperLen: 0.28, foreLen: 0.22, width: 0.1,
    handColor: "#2a2a1a", handRadius: 0.06,
    style: 'fleshy',
  });

  // Stomping fleshy legs (behind body) — thick swollen organic legs
  drawPathLegs(ctx, x, y + size * 0.15, size, time, zoom, {
    color: bodyColor, colorDark: bodyColorDark,
    footColor: "#1a1a0a",
    strideSpeed: 2.5, strideAmt: 0.25,
    legLen: 0.28, width: 0.09,
    shuffle: false, phaseOffset: 0,
    style: 'fleshy',
  });

  // Massive hunched body with muscle definition
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - size * 0.2,
    0,
    x,
    y - size * 0.2,
    size * 0.7,
  );
  bodyGrad.addColorStop(0, bodyColor);
  bodyGrad.addColorStop(0.6, bodyColorDark);
  bodyGrad.addColorStop(1, "#1a2010");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y + size * 0.05);
  ctx.quadraticCurveTo(
    x - size * 0.65 + muscleFlexPhase * size,
    y - size * 0.35,
    x - size * 0.4,
    y - size * 0.6,
  );
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.75 + breathe * size,
    x,
    y - size * 0.72 + breathe * size,
  );
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.75 + breathe * size,
    x + size * 0.4,
    y - size * 0.6,
  );
  ctx.quadraticCurveTo(
    x + size * 0.65 - muscleFlexPhase * size,
    y - size * 0.35,
    x + size * 0.55,
    y + size * 0.05,
  );
  ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.2, x, y + size * 0.18);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y + size * 0.2,
    x - size * 0.55,
    y + size * 0.05,
  );
  ctx.fill();

  // Spine ridges along the back
  ctx.fillStyle = "#2d3a1a";
  for (let spine = 0; spine < 5; spine++) {
    const spineX = x - size * 0.15 + spine * size * 0.08;
    const spineY = y - size * 0.55 - Math.sin(spine * 0.8) * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(spineX - size * 0.03, spineY + size * 0.05);
    ctx.lineTo(
      spineX,
      spineY - size * 0.08 - Math.sin(time * 2 + spine) * size * 0.02,
    );
    ctx.lineTo(spineX + size * 0.03, spineY + size * 0.05);
    ctx.fill();
  }

  // Rotting belly with exposed ribs/wounds
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.08,
    size * 0.35,
    size * 0.28 + breathe * size,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Chest breathing expansion overlay
  const chestExpand = Math.sin(time * 1.2) * 0.04;
  const chestGrad = ctx.createRadialGradient(
    x, y - size * 0.18, size * 0.05,
    x, y - size * 0.18, size * 0.3,
  );
  chestGrad.addColorStop(0, `rgba(80, 100, 50, ${0.2 + chestExpand * 2})`);
  chestGrad.addColorStop(0.6, `rgba(50, 70, 30, ${0.1 + chestExpand})`);
  chestGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y - size * 0.18,
    size * (0.32 + chestExpand * 2), size * (0.22 + chestExpand * 3),
    0, 0, Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = `rgba(40, 50, 20, ${0.3 + chestExpand * 3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let cl = 0; cl < 3; cl++) {
    const clY = y - size * 0.25 + cl * size * 0.08;
    const clExpand = chestExpand * (3 - cl) * size;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.25 - clExpand, clY);
    ctx.quadraticCurveTo(x, clY - size * 0.02 * (1 + chestExpand * 8), x + size * 0.25 + clExpand, clY);
    ctx.stroke();
  }

  // Wound/scar marks on belly
  ctx.strokeStyle = "#4a1a1a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.05);
  ctx.moveTo(x + size * 0.05, y - size * 0.2);
  ctx.lineTo(x + size * 0.2, y);
  ctx.stroke();

  // Massive arms with exposed muscle
  ctx.fillStyle = bodyColor;
  // Left arm - raised for attack
  const leftArmRaise = isAttacking ? rage * size * 0.3 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.35);
  ctx.quadraticCurveTo(
    x - size * 0.7 - muscleFlexPhase * size,
    y - size * 0.1 - leftArmRaise,
    x - size * 0.65,
    y + size * 0.25 - leftArmRaise,
  );
  ctx.quadraticCurveTo(
    x - size * 0.55,
    y + size * 0.35 - leftArmRaise,
    x - size * 0.45,
    y + size * 0.28 - leftArmRaise,
  );
  ctx.quadraticCurveTo(x - size * 0.5, y, x - size * 0.42, y - size * 0.28);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y - size * 0.35);
  ctx.quadraticCurveTo(
    x + size * 0.7 + muscleFlexPhase * size,
    y - size * 0.05,
    x + size * 0.65,
    y + size * 0.3,
  );
  ctx.quadraticCurveTo(
    x + size * 0.55,
    y + size * 0.4,
    x + size * 0.45,
    y + size * 0.32,
  );
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y + size * 0.05,
    x + size * 0.42,
    y - size * 0.28,
  );
  ctx.fill();

  // Forearm muscle striations
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y - size * 0.15 - leftArmRaise);
  ctx.lineTo(x - size * 0.6, y + size * 0.1 - leftArmRaise);
  ctx.moveTo(x + size * 0.55, y - size * 0.1);
  ctx.lineTo(x + size * 0.58, y + size * 0.15);
  ctx.stroke();

  // Massive boulder-crushing fists with claws
  ctx.fillStyle = "#2a2a1a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.62,
    y + size * 0.32 - leftArmRaise,
    size * 0.15,
    0,
    Math.PI * 2,
  );
  ctx.arc(x + size * 0.62, y + size * 0.35, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Claws
  ctx.fillStyle = "#1a1a0a";
  for (let claw = 0; claw < 3; claw++) {
    // Left hand claws
    const clawAngle = -0.5 + claw * 0.3;
    ctx.beginPath();
    ctx.moveTo(
      x - size * 0.62 + Math.cos(clawAngle) * size * 0.12,
      y + size * 0.32 - leftArmRaise + Math.sin(clawAngle) * size * 0.12,
    );
    ctx.lineTo(
      x - size * 0.62 + Math.cos(clawAngle) * size * 0.22,
      y + size * 0.32 - leftArmRaise + Math.sin(clawAngle) * size * 0.18,
    );
    ctx.lineTo(
      x - size * 0.62 + Math.cos(clawAngle + 0.15) * size * 0.12,
      y + size * 0.32 - leftArmRaise + Math.sin(clawAngle + 0.15) * size * 0.12,
    );
    ctx.fill();
    // Right hand claws
    ctx.beginPath();
    ctx.moveTo(
      x + size * 0.62 + Math.cos(-clawAngle) * size * 0.12,
      y + size * 0.35 + Math.sin(-clawAngle) * size * 0.12,
    );
    ctx.lineTo(
      x + size * 0.62 + Math.cos(-clawAngle) * size * 0.22,
      y + size * 0.35 + Math.sin(-clawAngle) * size * 0.18,
    );
    ctx.lineTo(
      x + size * 0.62 + Math.cos(-clawAngle - 0.15) * size * 0.12,
      y + size * 0.35 + Math.sin(-clawAngle - 0.15) * size * 0.12,
    );
    ctx.fill();
  }

  // Hunched shoulders with moss/barnacle growths
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42,
    y - size * 0.45,
    size * 0.18,
    size * 0.14,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.42,
    y - size * 0.45,
    size * 0.18,
    size * 0.14,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Small brutish head sunk into shoulders
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Heavy brow ridge casting shadow
  ctx.fillStyle = "#1a2010";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.64,
    size * 0.25,
    size * 0.1,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.fill();

  // Brow ridge detail
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.62,
    size * 0.24,
    size * 0.08,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.fill();

  // Rage-filled glowing eyes
  ctx.fillStyle = "#ef4444";
  setShadowBlur(ctx, 10 * zoom, "#ef4444");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.58,
    size * 0.055,
    size * 0.04,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.58,
    size * 0.055,
    size * 0.04,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Tiny angry pupils
  ctx.fillStyle = "#1a0505";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.58, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.58, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Broken nose
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.55);
  ctx.lineTo(x - size * 0.04, y - size * 0.48);
  ctx.lineTo(x + size * 0.02, y - size * 0.46);
  ctx.closePath();
  ctx.fill();

  // Massive jaw with underbite and tusks
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.45, size * 0.18, size * 0.12, 0, 0, Math.PI);
  ctx.fill();

  // Yellowed tusks jutting upward
  ctx.fillStyle = "#d4c9a8";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.48);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    y - size * 0.55,
    x - size * 0.12,
    y - size * 0.62,
  );
  ctx.lineTo(x - size * 0.1, y - size * 0.55);
  ctx.quadraticCurveTo(
    x - size * 0.12,
    y - size * 0.5,
    x - size * 0.1,
    y - size * 0.48,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.48);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.55,
    x + size * 0.12,
    y - size * 0.62,
  );
  ctx.lineTo(x + size * 0.1, y - size * 0.55);
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.5,
    x + size * 0.1,
    y - size * 0.48,
  );
  ctx.fill();

  // Tusk cracks/age
  ctx.strokeStyle = "#8a7a5a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.52);
  ctx.lineTo(x - size * 0.14, y - size * 0.57);
  ctx.moveTo(x + size * 0.13, y - size * 0.53);
  ctx.lineTo(x + size * 0.12, y - size * 0.58);
  ctx.stroke();

  // Parasitic moss and fungal growths on body
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.5, size * 0.1, 0, Math.PI * 2);
  ctx.arc(x + size * 0.38, y - size * 0.48, size * 0.09, 0, Math.PI * 2);
  ctx.arc(x - size * 0.35, y - size * 0.58, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.45, y - size * 0.35, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x - size * 0.5, y - size * 0.25, size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Glowing fungal caps
  ctx.fillStyle = `rgba(132, 204, 22, ${0.6 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.52, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.38, y - size * 0.5, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Dripping slime/ichor
  ctx.fillStyle = `rgba(132, 204, 22, ${0.5 + Math.sin(time * 4) * 0.2})`;
  for (let drip = 0; drip < 4; drip++) {
    const dripX = x - size * 0.3 + drip * size * 0.2;
    const dripPhase = (time * 1.5 + drip * 0.3) % 1;
    const dripY = y - size * 0.3 + dripPhase * size * 0.4;
    ctx.beginPath();
    ctx.ellipse(
      dripX,
      dripY,
      size * 0.02,
      size * 0.05 + dripPhase * size * 0.03,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Falling moss clumps dislodged from body
  for (let mc = 0; mc < 5; mc++) {
    const mcPhase = (time * 0.6 + mc * 0.7) % 1;
    const mcStartX = x + Math.sin(mc * 2.8) * size * 0.4;
    const mcX = mcStartX + Math.sin(time * 2 + mc) * size * 0.05;
    const mcStartY = y - size * 0.4 + Math.cos(mc * 1.9) * size * 0.15;
    const mcY = mcStartY + mcPhase * size * 0.7;
    const mcSize = size * (0.025 + Math.sin(mc * 1.3) * 0.01) * (1 - mcPhase * 0.5);
    const mcAlpha = (1 - mcPhase) * 0.7;
    ctx.fillStyle = `rgba(22, 101, 52, ${mcAlpha})`;
    ctx.beginPath();
    ctx.ellipse(mcX, mcY, mcSize, mcSize * 0.7, mc * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(34, 120, 60, ${mcAlpha * 0.5})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(mcX, mcY);
    ctx.lineTo(mcX + size * 0.015, mcY + size * 0.02);
    ctx.moveTo(mcX, mcY);
    ctx.lineTo(mcX - size * 0.01, mcY + size * 0.015);
    ctx.stroke();
  }

  // Murky poison bubbles
  drawPoisonBubbles(ctx, x, y - size * 0.1, size * 0.5, time, zoom, {
    color: "rgba(100, 150, 80, 0.45)",
    count: 6, speed: 0.8, maxAlpha: 0.35,
    maxSize: 0.14, spread: 1.0,
  });

  // Floating bone/club fragments
  drawShiftingSegments(ctx, x, y - size * 0.3, size, time, zoom, {
    color: "#c8c0a0", colorAlt: "#8a7a5a",
    count: 4, orbitRadius: 0.5, segmentSize: 0.04,
    orbitSpeed: 0.6, shape: "shard",
  });

  // Floating moss and bone pieces
  drawFloatingPiece(ctx, x - size * 0.5, y - size * 0.4, size, time, 0, {
    width: 0.1, height: 0.06, color: "#2d3a1a", colorEdge: "#1a2010",
    bobSpeed: 2, bobAmt: 0.03,
  });
  drawFloatingPiece(ctx, x + size * 0.5, y - size * 0.35, size, time, 1.5, {
    width: 0.08, height: 0.05, color: "#d4c9a8", colorEdge: "#8a7a5a",
    bobSpeed: 2.5, bobAmt: 0.025,
  });

  // Rage attack: ground-shaking slam with shockwave and flying debris
  if (isAttacking) {
    const slamIntensity = Math.sin(attackPhase * Math.PI);

    // Ground shockwave ring
    const shockRadius = size * (0.3 + attackPhase * 0.8);
    const shockAlpha = (1 - attackPhase) * 0.4 * slamIntensity;
    ctx.strokeStyle = `rgba(100, 150, 80, ${shockAlpha})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.5, shockRadius, shockRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Flying rock/mud debris from slam
    for (let debris = 0; debris < 8; debris++) {
      const debrisAngle = (debris / 8) * Math.PI * 2;
      const debrisDist = attackPhase * size * 0.6;
      const debrisY = y + size * 0.3 - attackPhase * size * 0.3 + Math.sin(debrisAngle) * size * 0.1;
      const debrisAlpha = (1 - attackPhase) * 0.7;
      ctx.fillStyle = `rgba(60, 80, 30, ${debrisAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(debrisAngle) * debrisDist,
        debrisY,
        size * 0.025 * (1 - attackPhase * 0.5),
        0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Rage steam from nostrils
    ctx.fillStyle = `rgba(100, 150, 80, ${attackPhase * 0.4})`;
    for (let steam = 0; steam < 5; steam++) {
      const steamX = x + Math.sin(time * 8 + steam) * size * 0.15;
      const steamY =
        y - size * 0.45 - attackPhase * size * 0.25 - steam * size * 0.07;
      ctx.beginPath();
      ctx.arc(steamX, steamY, size * 0.05 * (1 - steam * 0.15), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// =====================================================
// DESERT REGION TROOPS
// =====================================================

