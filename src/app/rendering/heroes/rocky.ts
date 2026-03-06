import { ISO_Y_RATIO } from "../../constants";

export function drawRockyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // EPIC ORNATE ROCKY - Legendary Golden Squirrel King with devastating tail whip attacks
  const hop = Math.abs(Math.sin(time * 6)) * 5;
  const isAttacking = attackPhase > 0;
  const tailWhip = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.8 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // === MULTI-LAYERED GOLDEN AURA ===
  const auraBase = isAttacking ? 0.45 : 0.25;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y - hop, size * (0.1 + layerOffset),
      x, y - hop, size * (0.95 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.05) * auraPulse;
    auraGrad.addColorStop(0, `rgba(218, 165, 32, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.4, `rgba(255, 200, 80, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.7, `rgba(255, 150, 50, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(218, 165, 32, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - hop, size * (0.9 + layerOffset * 0.2), size * (0.7 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating golden spark particles
  for (let p = 0; p < 12; p++) {
    const pAngle = (time * 2 + p * Math.PI * 2 / 12) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 3 + p * 0.8) * size * 0.15;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - hop + Math.sin(pAngle) * pDist * 0.55;
    const pAlpha = 0.6 + Math.sin(time * 4.5 + p * 0.7) * 0.3;
    ctx.fillStyle = p % 2 === 0 ? `rgba(255, 215, 0, ${pAlpha})` : `rgba(255, 180, 50, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ATTACK AURA RINGS ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.55 * attackIntensity;
      // Outer golden ring
      ctx.strokeStyle = `rgba(218, 165, 32, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y - hop, size * (0.55 + ringPhase * 0.5), size * (ISO_Y_RATIO + ringPhase * 0.45), 0, 0, Math.PI * 2);
      ctx.stroke();
      // Inner bright ring
      ctx.strokeStyle = `rgba(255, 235, 150, ${ringAlpha * 0.4})`;
      ctx.lineWidth = (1.5 - ring * 0.25) * zoom;
      ctx.stroke();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.45);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MAGNIFICENT MULTI-LAYERED FLUFFY TAIL ===
  const tailWave = Math.sin(time * 4.5 + tailWhip) * 7;
  const tailWave2 = Math.sin(time * 5.5 + tailWhip + 0.5) * 4;

  // Tail outer shadow layer
  ctx.fillStyle = "#4a3002";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.26 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.5 + tailWave * 0.9, y + size * 0.1 - hop * 0.35,
    x + size * 0.85 + tailWave, y - size * 0.2 - hop * 0.4,
    x + size * 0.62 + tailWave * 0.55, y - size * 0.75 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.4 + tailWave2 * 0.3, y - size * 0.45 - hop * 0.35,
    x + size * 0.28, y - size * 0.15 - hop * 0.3,
    x + size * 0.18, y + size * 0.15 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail outer layer (darker gold)
  ctx.fillStyle = "#6b4904";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.24 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.48 + tailWave * 0.85, y + size * 0.08 - hop * 0.35,
    x + size * 0.82 + tailWave, y - size * 0.18 - hop * 0.4,
    x + size * 0.6 + tailWave * 0.5, y - size * 0.72 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.38 + tailWave2 * 0.3, y - size * 0.42 - hop * 0.35,
    x + size * 0.26, y - size * 0.12 - hop * 0.3,
    x + size * 0.17, y + size * 0.14 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail middle layer (warm gold)
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.2 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.45 + tailWave * 0.8, y + size * 0.02 - hop * 0.35,
    x + size * 0.75 + tailWave * 0.9, y - size * 0.22 - hop * 0.4,
    x + size * 0.55 + tailWave * 0.45, y - size * 0.65 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.36 + tailWave2 * 0.25, y - size * 0.38 - hop * 0.35,
    x + size * 0.25, y - size * 0.08 - hop * 0.3,
    x + size * 0.18, y + size * 0.12 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail highlight layer (bright gold)
  const tailHighlightGrad = ctx.createLinearGradient(
    x + size * 0.2, y - hop, x + size * 0.6 + tailWave * 0.4, y - size * 0.6 - hop
  );
  tailHighlightGrad.addColorStop(0, "#b09030");
  tailHighlightGrad.addColorStop(0.5, "#d4b050");
  tailHighlightGrad.addColorStop(1, "#c0a040");
  ctx.fillStyle = tailHighlightGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.14 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.4 + tailWave * 0.7, y - size * 0.05 - hop * 0.35,
    x + size * 0.62 + tailWave * 0.8, y - size * 0.28 - hop * 0.4,
    x + size * 0.48 + tailWave * 0.38, y - size * 0.55 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.35 + tailWave2 * 0.2, y - size * 0.32 - hop * 0.35,
    x + size * 0.26, y - size * 0.02 - hop * 0.3,
    x + size * 0.2, y + size * 0.08 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail fur strands
  ctx.strokeStyle = "#5a4008";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let strand = 0; strand < 8; strand++) {
    const strandT = strand / 7;
    const strandX = x + size * 0.25 + strandT * (size * 0.3 + tailWave * 0.35);
    const strandY = y + size * 0.1 - strandT * (size * 0.55) - hop * (0.3 + strandT * 0.15);
    const strandWave = Math.sin(time * 5 + strand * 0.5) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(strandX, strandY);
    ctx.lineTo(strandX + size * 0.08 + strandWave, strandY - size * 0.06);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tail tip magical glow
  const tailTipX = x + size * 0.55 + tailWave * 0.45;
  const tailTipY = y - size * 0.68 - hop * 0.45;
  ctx.fillStyle = `rgba(255, 220, 80, ${0.4 + gemPulse * 0.3})`;
  ctx.shadowColor = "#ffc000";
  ctx.shadowBlur = 10 * zoom * (isAttacking ? 1 + attackIntensity : 0.6);
  ctx.beginPath();
  ctx.arc(tailTipX, tailTipY, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 200, ${0.5 + gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(tailTipX, tailTipY, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  // === HEROIC MUSCULAR BODY ===
  const bodyGrad = ctx.createRadialGradient(
    x - size * 0.05, y - hop - size * 0.05, size * 0.08,
    x, y - hop, size * 0.45
  );
  bodyGrad.addColorStop(0, "#e0b050");
  bodyGrad.addColorStop(0.3, "#d4a040");
  bodyGrad.addColorStop(0.6, "#a07020");
  bodyGrad.addColorStop(0.85, "#8b6914");
  bodyGrad.addColorStop(1, "#5a4008");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, size * 0.36, size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body fur texture
  ctx.strokeStyle = "rgba(90, 64, 8, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 6; i++) {
    const furAngle = -0.6 + i * 0.25;
    const furWave = Math.sin(time * 6 + i * 0.5) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(furAngle) * size * 0.15,
      y - hop + Math.sin(furAngle) * size * 0.22
    );
    ctx.lineTo(
      x + Math.cos(furAngle) * size * 0.32 + furWave,
      y - hop + Math.sin(furAngle) * size * 0.38
    );
    ctx.stroke();
  }

  // Royal chest fur tuft
  ctx.fillStyle = "#f0d890";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - hop - size * 0.2);
  ctx.quadraticCurveTo(x, y - hop - size * 0.28, x + size * 0.08, y - hop - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.06, y - hop - size * 0.12, x, y - hop - size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.06, y - hop - size * 0.12, x - size * 0.08, y - hop - size * 0.2);
  ctx.fill();

  // Soft belly
  const bellyGrad = ctx.createRadialGradient(
    x, y - hop + size * 0.06, size * 0.02,
    x, y - hop + size * 0.06, size * 0.24
  );
  bellyGrad.addColorStop(0, "#fffaf0");
  bellyGrad.addColorStop(0.5, "#fff8e8");
  bellyGrad.addColorStop(1, "#e8d0b0");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop + size * 0.07, size * 0.24, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // === HEROIC SQUIRREL ARMS ===
  // Arms hold the acorn and raise during tail whip attack
  const armSwingLeft = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.5 : Math.sin(time * 3) * 0.08;
  const armSwingRight = isAttacking ? Math.sin(attackPhase * Math.PI * 2 + 0.4) * 0.6 : Math.sin(time * 3 + 0.5) * 0.08;
  
  // Left arm (holding acorn from below)
  ctx.save();
  ctx.translate(x - size * 0.28, y - hop - size * 0.05);
  ctx.rotate(-0.8 - armSwingLeft * 0.8);
  
  // Left arm fur
  const leftArmGrad = ctx.createLinearGradient(0, 0, -size * 0.08, size * 0.22);
  leftArmGrad.addColorStop(0, "#c89828");
  leftArmGrad.addColorStop(0.5, "#a07020");
  leftArmGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = leftArmGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.08, -size * 0.04, size * 0.18);
  ctx.lineTo(size * 0.04, size * 0.16);
  ctx.quadraticCurveTo(size * 0.06, size * 0.08, 0, 0);
  ctx.closePath();
  ctx.fill();
  
  // Left paw
  const leftPawGrad = ctx.createRadialGradient(0, size * 0.2, 0, 0, size * 0.2, size * 0.06);
  leftPawGrad.addColorStop(0, "#e8d0b0");
  leftPawGrad.addColorStop(0.6, "#d4a040");
  leftPawGrad.addColorStop(1, "#a07020");
  ctx.fillStyle = leftPawGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.2, size * 0.055, size * 0.045, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Little paw pads
  ctx.fillStyle = "#a08070";
  ctx.beginPath();
  ctx.arc(-size * 0.02, size * 0.21, size * 0.012, 0, Math.PI * 2);
  ctx.arc(size * 0.015, size * 0.215, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  
  // Tiny claws
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  ctx.lineCap = "round";
  for (let c = 0; c < 4; c++) {
    const clawAngle = -0.8 + c * 0.35;
    ctx.beginPath();
    ctx.moveTo(Math.cos(clawAngle) * size * 0.04, size * 0.2 + Math.sin(clawAngle) * size * 0.035);
    ctx.lineTo(Math.cos(clawAngle) * size * 0.06, size * 0.2 + Math.sin(clawAngle) * size * 0.05);
    ctx.stroke();
  }
  ctx.restore();
  
  // Right arm (holding acorn from side)
  ctx.save();
  ctx.translate(x - size * 0.32, y - hop + size * 0.08);
  ctx.rotate(-1.2 - armSwingRight * 0.6);
  
  // Right arm fur
  const rightArmGrad = ctx.createLinearGradient(0, 0, -size * 0.06, size * 0.2);
  rightArmGrad.addColorStop(0, "#c89828");
  rightArmGrad.addColorStop(0.5, "#a07020");
  rightArmGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = rightArmGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.05, size * 0.07, -size * 0.03, size * 0.16);
  ctx.lineTo(size * 0.04, size * 0.14);
  ctx.quadraticCurveTo(size * 0.05, size * 0.07, 0, 0);
  ctx.closePath();
  ctx.fill();
  
  // Right paw
  const rightPawGrad = ctx.createRadialGradient(0, size * 0.18, 0, 0, size * 0.18, size * 0.055);
  rightPawGrad.addColorStop(0, "#e8d0b0");
  rightPawGrad.addColorStop(0.6, "#d4a040");
  rightPawGrad.addColorStop(1, "#a07020");
  ctx.fillStyle = rightPawGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.18, size * 0.05, size * 0.04, -0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Little paw pads
  ctx.fillStyle = "#a08070";
  ctx.beginPath();
  ctx.arc(-size * 0.015, size * 0.19, size * 0.01, 0, Math.PI * 2);
  ctx.arc(size * 0.012, size * 0.19, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  
  // Tiny claws
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let c = 0; c < 4; c++) {
    const clawAngle = -0.7 + c * 0.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(clawAngle) * size * 0.035, size * 0.18 + Math.sin(clawAngle) * size * 0.03);
    ctx.lineTo(Math.cos(clawAngle) * size * 0.055, size * 0.18 + Math.sin(clawAngle) * size * 0.045);
    ctx.stroke();
  }
  ctx.restore();

  // === ROYAL HEAD ===
  const headY = y - size * 0.5 - hop;
  const headGrad = ctx.createRadialGradient(
    x - size * 0.05, headY - size * 0.05, size * 0.05,
    x, headY, size * 0.32
  );
  headGrad.addColorStop(0, "#c89828");
  headGrad.addColorStop(0.4, "#b08020");
  headGrad.addColorStop(0.7, "#8b6914");
  headGrad.addColorStop(1, "#6b4904");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.3, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy cheeks with highlight
  const cheekGrad = ctx.createRadialGradient(
    x - size * 0.17, headY + size * 0.06, size * 0.02,
    x - size * 0.16, headY + size * 0.06, size * 0.14
  );
  cheekGrad.addColorStop(0, "#fff8e8");
  cheekGrad.addColorStop(0.6, "#f5deb3");
  cheekGrad.addColorStop(1, "#e0c8a0");
  ctx.fillStyle = cheekGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.17, headY + size * 0.06, size * 0.13, size * 0.11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.17, headY + size * 0.06, size * 0.13, size * 0.11, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "#4a3a20";
  ctx.lineWidth = 0.8 * zoom;
  ctx.globalAlpha = 0.6;
  for (let side = -1; side <= 1; side += 2) {
    for (let w = 0; w < 3; w++) {
      const whiskerWave = Math.sin(time * 4 + w * 0.5) * size * 0.01;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.12, headY + size * 0.08 + w * size * 0.03);
      ctx.lineTo(x + side * size * 0.32 + whiskerWave, headY + size * 0.05 + w * size * 0.04);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // === ORNATE ROYAL EARS (tufted) ===
  for (let side = -1; side <= 1; side += 2) {
    const earX = x + side * size * 0.22;
    const earY = y - size * 0.72 - hop;

    // Ear outer (dark)
    ctx.fillStyle = "#7a5910";
    ctx.beginPath();
    ctx.ellipse(earX, earY, size * 0.1, size * 0.16, side * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Ear middle (golden)
    ctx.fillStyle = "#9b7018";
    ctx.beginPath();
    ctx.ellipse(earX, earY + size * 0.01, size * 0.085, size * 0.14, side * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear (pink warmth)
    const innerEarGrad = ctx.createRadialGradient(earX, earY + size * 0.02, 0, earX, earY + size * 0.02, size * 0.1);
    innerEarGrad.addColorStop(0, "#f5d0b8");
    innerEarGrad.addColorStop(0.7, "#d4a040");
    innerEarGrad.addColorStop(1, "#b08020");
    ctx.fillStyle = innerEarGrad;
    ctx.beginPath();
    ctx.ellipse(earX, earY + size * 0.02, size * 0.065, size * 0.11, side * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Elaborate ear tufts
    ctx.fillStyle = "#c0a040";
    ctx.beginPath();
    ctx.moveTo(earX - side * size * 0.02, earY - size * 0.14);
    ctx.lineTo(earX + side * size * 0.03, earY - size * 0.24);
    ctx.lineTo(earX + side * size * 0.05, earY - size * 0.22);
    ctx.lineTo(earX + side * size * 0.06, earY - size * 0.28);
    ctx.lineTo(earX + side * size * 0.04, earY - size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#a08030";
    ctx.beginPath();
    ctx.moveTo(earX, earY - size * 0.12);
    ctx.lineTo(earX + side * size * 0.02, earY - size * 0.2);
    ctx.lineTo(earX + side * size * 0.03, earY - size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Ear gold jewelry ring
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(earX + side * size * 0.06, earY + size * 0.05, size * 0.025, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(earX + side * size * 0.06, earY + size * 0.075, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MAJESTIC MINI CROWN ===
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.22);
  ctx.lineTo(x - size * 0.14, headY - size * 0.32);
  ctx.lineTo(x - size * 0.08, headY - size * 0.26);
  ctx.lineTo(x - size * 0.04, headY - size * 0.35);
  ctx.lineTo(x, headY - size * 0.28);
  ctx.lineTo(x + size * 0.04, headY - size * 0.35);
  ctx.lineTo(x + size * 0.08, headY - size * 0.26);
  ctx.lineTo(x + size * 0.14, headY - size * 0.32);
  ctx.lineTo(x + size * 0.12, headY - size * 0.22);
  ctx.closePath();
  ctx.fill();
  // Crown highlight
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, headY - size * 0.23);
  ctx.lineTo(x - size * 0.11, headY - size * 0.28);
  ctx.lineTo(x - size * 0.06, headY - size * 0.25);
  ctx.lineTo(x - size * 0.03, headY - size * 0.31);
  ctx.lineTo(x, headY - size * 0.26);
  ctx.lineTo(x + size * 0.03, headY - size * 0.31);
  ctx.lineTo(x + size * 0.06, headY - size * 0.25);
  ctx.lineTo(x + size * 0.11, headY - size * 0.28);
  ctx.lineTo(x + size * 0.1, headY - size * 0.23);
  ctx.closePath();
  ctx.fill();
  // Crown gems
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.32, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, headY - size * 0.27, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.08, headY - size * 0.27, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === FIERCE EXPRESSIVE EYES ===
  const eyeScale = isAttacking ? 1.2 : 1;

  // Eye whites with slight gradient
  for (let side = -1; side <= 1; side += 2) {
    const eyeX = x + side * size * 0.11;
    const eyeGrad = ctx.createRadialGradient(eyeX, headY - size * 0.02, 0, eyeX, headY - size * 0.02, size * 0.1 * eyeScale);
    eyeGrad.addColorStop(0, "#ffffff");
    eyeGrad.addColorStop(0.7, "#f8f8f8");
    eyeGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, headY - size * 0.02, size * 0.1 * eyeScale, size * 0.12 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden iris (intense glow during attack)
  const irisColor = isAttacking
    ? `rgba(255, 200, 50, ${0.8 + attackIntensity * 0.2})`
    : "#c09040";
  if (isAttacking) {
    ctx.shadowColor = "#ffc000";
    ctx.shadowBlur = 8 * zoom;
  }
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(x - size * 0.11, headY - size * 0.02, size * 0.06 * eyeScale, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, headY - size * 0.02, size * 0.06 * eyeScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye highlights (sparkle)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.13, headY - size * 0.04, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, headY - size * 0.04, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - size * 0.095, headY, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.125, headY, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (fierce slits during attack)
  ctx.fillStyle = "#1a1a1a";
  if (isAttacking) {
    ctx.beginPath();
    ctx.ellipse(x - size * 0.11, headY - size * 0.02, size * 0.015, size * 0.045 * eyeScale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.11, headY - size * 0.02, size * 0.015, size * 0.045 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x - size * 0.11, headY - size * 0.02, size * 0.028, 0, Math.PI * 2);
    ctx.arc(x + size * 0.11, headY - size * 0.02, size * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }

  // Determined eyebrows
  ctx.strokeStyle = "#5a4008";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0));
  ctx.quadraticCurveTo(x - size * 0.11, headY - size * 0.14 - (isAttacking ? size * 0.03 : 0), x - size * 0.04, headY - size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0));
  ctx.quadraticCurveTo(x + size * 0.11, headY - size * 0.14 - (isAttacking ? size * 0.03 : 0), x + size * 0.04, headY - size * 0.1);
  ctx.stroke();

  // === DETAILED NOSE ===
  const noseGrad = ctx.createRadialGradient(x, headY + size * 0.1, 0, x, headY + size * 0.1, size * 0.05);
  noseGrad.addColorStop(0, "#4a2a15");
  noseGrad.addColorStop(0.6, "#3a1a0a");
  noseGrad.addColorStop(1, "#2a0a00");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.1, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "#6a4a3a";
  ctx.beginPath();
  ctx.arc(x - size * 0.015, headY + size * 0.085, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // === EXPRESSIVE MOUTH ===
  if (isAttacking) {
    // Fierce snarling mouth
    ctx.fillStyle = "#2a0a00";
    ctx.beginPath();
    ctx.ellipse(x, headY + size * 0.16, size * 0.06, size * 0.04 * attackIntensity, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fangs
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.035, headY + size * 0.13);
    ctx.lineTo(x - size * 0.02, headY + size * 0.2);
    ctx.lineTo(x - size * 0.005, headY + size * 0.13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.035, headY + size * 0.13);
    ctx.lineTo(x + size * 0.02, headY + size * 0.2);
    ctx.lineTo(x + size * 0.005, headY + size * 0.13);
    ctx.closePath();
    ctx.fill();
  } else {
    // Cute confident smile
    ctx.strokeStyle = "#3a1a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.arc(x, headY + size * 0.13, size * 0.055, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    // Little smile curl
    ctx.beginPath();
    ctx.arc(x - size * 0.04, headY + size * 0.14, size * 0.02, 0, Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size * 0.04, headY + size * 0.14, size * 0.02, Math.PI * 0.2, Math.PI);
    ctx.stroke();
  }

  // === LEGENDARY GOLDEN ACORN ===
  ctx.save();
  ctx.translate(x - size * 0.42, y - size * 0.06 - hop);
  ctx.rotate(-0.15);

  // Acorn powerful glow
  ctx.shadowColor = "#ffc000";
  ctx.shadowBlur = 12 * zoom * (isAttacking ? 1 + attackIntensity * 0.5 : gemPulse);

  // Acorn outer (dark)
  ctx.fillStyle = "#6b5010";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.11, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn body gradient
  const acornGrad = ctx.createRadialGradient(-size * 0.02, -size * 0.02, 0, 0, 0, size * 0.12);
  acornGrad.addColorStop(0, "#d4a030");
  acornGrad.addColorStop(0.5, "#c09030");
  acornGrad.addColorStop(0.8, "#8b6914");
  acornGrad.addColorStop(1, "#5a3a0a");
  ctx.fillStyle = acornGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn highlight
  ctx.fillStyle = "rgba(255, 230, 180, 0.4)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.03, -size * 0.04, size * 0.04, size * 0.06, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Elaborate acorn cap
  const capGrad = ctx.createLinearGradient(-size * 0.1, -size * 0.1, size * 0.1, -size * 0.08);
  capGrad.addColorStop(0, "#8a6818");
  capGrad.addColorStop(0.5, "#b08020");
  capGrad.addColorStop(1, "#8a6818");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.1, size * 0.095, size * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cap scallop pattern
  ctx.strokeStyle = "#5a4010";
  ctx.lineWidth = 0.8 * zoom;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(i * size * 0.025, -size * 0.1, size * 0.018, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Acorn stem
  ctx.fillStyle = "#6b5010";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.145, size * 0.015, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn magical sparkle
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.3;
  ctx.beginPath();
  ctx.arc(-size * 0.025, -size * 0.03, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 0;
  ctx.restore();

  // === EPIC SPEED LINES ===
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const lineAlpha = 0.5 - i * 0.08 + Math.sin(time * 10 + i) * 0.15;
    ctx.strokeStyle = `rgba(218, 165, 32, ${lineAlpha})`;
    ctx.lineWidth = (2.5 - i * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(
      x + size * 0.5 - i * size * 0.1,
      y + size * 0.1 + i * size * 0.1 - hop * 0.5
    );
    ctx.lineTo(
      x + size * 0.8 - i * size * 0.12,
      y + size * 0.1 + i * size * 0.1 - hop * 0.5
    );
    ctx.stroke();
  }

  // === GOLDEN DUST TRAIL ===
  for (let dust = 0; dust < 8; dust++) {
    const dustPhase = (time * 3 + dust * 0.4) % 1.5;
    const dustX = x - size * 0.4 - dustPhase * size * 0.5;
    const dustY = y + size * 0.1 + Math.sin(time * 6 + dust * 0.8) * size * 0.1 - hop * 0.3;
    const dustAlpha = (1 - dustPhase / 1.5) * 0.5;
    ctx.fillStyle = `rgba(218, 165, 32, ${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}
