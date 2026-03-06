import type { Position } from "../../types";
import { resolveWeaponRotation } from "./helpers";

export function drawFScottHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  // ORNATE F. SCOTT FITZGERALD - The Great Gatsby Author, Jazz Age Literary Master
  const isAttacking = attackPhase > 0;
  const quillFlourish = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.2 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const writeGesture = Math.sin(time * 2) * 1.5;
  const breathe = Math.sin(time * 2) * 1;
  const goldPulse = Math.sin(time * 3) * 0.3 + 0.7;

  // === MULTI-LAYERED TEAL LITERARY AURA ===
  const auraBase = isAttacking ? 0.4 : 0.25;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x, y - size * 0.1, size * (0.1 + layerOffset),
      x, y - size * 0.1, size * (0.95 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.04) * auraPulse;
    auraGrad.addColorStop(0, `rgba(60, 200, 200, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.3, `rgba(40, 170, 170, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.6, `rgba(30, 140, 140, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(60, 200, 200, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.1, size * (0.85 + layerOffset * 0.15), size * (0.75 + layerOffset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating teal letter particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 2 / 10) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 2 + p * 0.7) * size * 0.1;
    const pRise = ((time * 0.5 + p * 0.4) % 1) * size * 0.25;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.1 + Math.sin(pAngle) * pDist * 0.4 - pRise;
    const pAlpha = (0.6 - pRise / (size * 0.25) * 0.4) * goldPulse;
    ctx.fillStyle = `rgba(80, 210, 210, ${pAlpha})`;
    ctx.font = `italic ${8 * zoom}px Georgia`;
    ctx.textAlign = "center";
    const letters = "GATSBY";
    ctx.fillText(letters[p % letters.length], px, py);
  }

  // === MAGICAL TEAL WORD ATTACK RINGS ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(80, 210, 210, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.6) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.12, size * (0.55 + ringPhase * 0.5), size * (0.65 + ringPhase * 0.5), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.45);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.2)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ORNATE 1920S THREE-PIECE SUIT ===
  // Main suit jacket
  const suitGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.1, x + size * 0.4, y + size * 0.3);
  suitGrad.addColorStop(0, "#1a1a28");
  suitGrad.addColorStop(0.25, "#2a2a3a");
  suitGrad.addColorStop(0.5, "#353548");
  suitGrad.addColorStop(0.75, "#2a2a3a");
  suitGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5 + breathe);
  ctx.lineTo(x - size * 0.42, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.28, x, y - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.28, x + size * 0.42, y - size * 0.1);
  ctx.lineTo(x + size * 0.38, y + size * 0.5 + breathe);
  ctx.closePath();
  ctx.fill();

  // Suit jacket border
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Suit pinstripes
  ctx.strokeStyle = "rgba(60, 60, 80, 0.3)";
  ctx.lineWidth = 0.8;
  for (let stripe = 0; stripe < 8; stripe++) {
    const stripeX = x - size * 0.32 + stripe * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(stripeX, y - size * 0.15);
    ctx.lineTo(stripeX - size * 0.02, y + size * 0.45);
    ctx.stroke();
  }

  // Suit lapels with satin finish
  const lapelGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.2, x - size * 0.08, y + size * 0.18);
  lapelGrad.addColorStop(0, "#1a1a28");
  lapelGrad.addColorStop(0.4, "#252535");
  lapelGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = lapelGrad;
  // Left lapel
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.24);
  ctx.lineTo(x - size * 0.28, y + size * 0.18);
  ctx.lineTo(x - size * 0.1, y + size * 0.2);
  ctx.lineTo(x - size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Teal lapel highlight
  ctx.strokeStyle = "#40b0b0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Right lapel
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.24);
  ctx.lineTo(x + size * 0.28, y + size * 0.18);
  ctx.lineTo(x + size * 0.1, y + size * 0.2);
  ctx.lineTo(x + size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#40b0b0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Lapel flower (carnation)
  ctx.fillStyle = "#cc2233";
  ctx.beginPath();
  ctx.arc(x - size * 0.22, y - size * 0.08, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dd4455";
  ctx.beginPath();
  ctx.arc(x - size * 0.215, y - size * 0.085, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Ornate brocade vest
  const vestGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.18, x + size * 0.15, y + size * 0.3);
  vestGrad.addColorStop(0, "#5a4530");
  vestGrad.addColorStop(0.3, "#7a6545");
  vestGrad.addColorStop(0.5, "#8b7555");
  vestGrad.addColorStop(0.7, "#7a6545");
  vestGrad.addColorStop(1, "#5a4530");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.14, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Vest brocade pattern
  ctx.strokeStyle = "rgba(180, 150, 100, 0.3)";
  ctx.lineWidth = 0.8;
  for (let pattern = 0; pattern < 4; pattern++) {
    const patternY = y - size * 0.1 + pattern * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, patternY);
    ctx.quadraticCurveTo(x, patternY - size * 0.02, x + size * 0.1, patternY);
    ctx.stroke();
  }

  // Vest border
  ctx.strokeStyle = "#4a3520";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.2);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.stroke();

  // Vest buttons (ornate gold)
  for (let i = 0; i < 4; i++) {
    const btnY = y - size * 0.1 + i * size * 0.095;
    // Button shadow
    ctx.fillStyle = "#8b6914";
    ctx.beginPath();
    ctx.arc(x + size * 0.005, btnY + size * 0.005, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Main button
    const btnGrad = ctx.createRadialGradient(x - size * 0.005, btnY - size * 0.005, 0, x, btnY, size * 0.022);
    btnGrad.addColorStop(0, "#ffec8b");
    btnGrad.addColorStop(0.5, "#daa520");
    btnGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.arc(x, btnY, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Button highlight
    ctx.fillStyle = "rgba(255, 255, 220, 0.5)";
    ctx.beginPath();
    ctx.arc(x - size * 0.008, btnY - size * 0.008, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp white dress shirt
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.2, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.14, x + size * 0.2, y - size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.22);
  ctx.closePath();
  ctx.fill();
  // Shirt collar points
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y - size * 0.16);
  ctx.lineTo(x - size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y - size * 0.16);
  ctx.lineTo(x + size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // === ELEGANT TEAL TIE ===
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = isAttacking ? 10 * zoom * attackIntensity : 4 * zoom;
  const tieGrad = ctx.createLinearGradient(x, y - size * 0.18, x, y + size * 0.22);
  tieGrad.addColorStop(0, "#40c0c0");
  tieGrad.addColorStop(0.2, "#35a5a5");
  tieGrad.addColorStop(0.5, "#2a8a8a");
  tieGrad.addColorStop(0.8, "#206a6a");
  tieGrad.addColorStop(1, "#185050");
  ctx.fillStyle = tieGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.07, y + size * 0.14);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.07, y + size * 0.14);
  ctx.closePath();
  ctx.fill();
  // Tie diagonal stripes - darker teal
  ctx.strokeStyle = "rgba(20, 60, 60, 0.4)";
  ctx.lineWidth = 1.5;
  for (let stripe = 0; stripe < 5; stripe++) {
    const stripeY = y - size * 0.1 + stripe * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, stripeY);
    ctx.lineTo(x + size * 0.04, stripeY + size * 0.03);
    ctx.stroke();
  }
  // Tie knot - glowing teal
  ctx.fillStyle = "#50d0d0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.16, size * 0.045, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === ELEGANT 1920S ARMS ===
  // Left arm - relaxed at side, gestures during attack
  const leftArmGesture = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.5 : Math.sin(time * 1.2) * 0.08;
  // Right arm - holds pen, flourishes when writing/attacking
  const rightArmFlourish = isAttacking ? Math.sin(attackPhase * Math.PI * 1.5) * 0.6 + 0.3 : 0.15 + Math.sin(time * 2) * 0.05;
  
  // Left arm (suit sleeve)
  ctx.save();
  ctx.translate(x - size * 0.4, y - size * 0.08);
  ctx.rotate(-0.25 - leftArmGesture * 0.9);
  
  // Left sleeve (suit jacket)
  const leftSleeveGrad = ctx.createLinearGradient(0, 0, size * 0.1, size * 0.35);
  leftSleeveGrad.addColorStop(0, "#2a2a3a");
  leftSleeveGrad.addColorStop(0.5, "#353548");
  leftSleeveGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = leftSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.07, size * 0.12, size * 0.04, size * 0.3);
  ctx.lineTo(-size * 0.06, size * 0.28);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  
  // Left shirt cuff
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, size * 0.29, size * 0.055, size * 0.022, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Left cufflink (gold)
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(-size * 0.01, size * 0.29, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffec8b";
  ctx.beginPath();
  ctx.arc(-size * 0.014, size * 0.286, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  
  // Left hand
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(-size * 0.005, size * 0.35, size * 0.04, size * 0.055, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Fingers - relaxed or gesturing during attack
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  if (isAttacking) {
    // Dramatic gesture with fingers spread
    for (let f = 0; f < 5; f++) {
      const fingerAngle = -0.5 + f * 0.25;
      const fingerLen = size * (0.035 + (f === 2 ? 0.01 : 0));
      ctx.beginPath();
      ctx.moveTo(-size * 0.005 + Math.cos(fingerAngle) * size * 0.025, size * 0.35 + Math.sin(fingerAngle) * size * 0.04);
      ctx.lineTo(-size * 0.005 + Math.cos(fingerAngle) * (size * 0.025 + fingerLen), size * 0.35 + Math.sin(fingerAngle) * (size * 0.04 + fingerLen * 0.5));
      ctx.stroke();
    }
  } else {
    // Relaxed fingers
    ctx.beginPath();
    ctx.arc(-size * 0.005, size * 0.38, size * 0.025, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
  
  // Right arm (holding pen - more forward)
  ctx.save();
  ctx.translate(x + size * 0.38, y - size * 0.1);
  ctx.rotate(0.4 + rightArmFlourish * 0.7);
  
  // Right sleeve (suit jacket)
  const rightSleeveGrad = ctx.createLinearGradient(0, 0, -size * 0.1, size * 0.35);
  rightSleeveGrad.addColorStop(0, "#2a2a3a");
  rightSleeveGrad.addColorStop(0.5, "#353548");
  rightSleeveGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = rightSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.12, -size * 0.04, size * 0.3);
  ctx.lineTo(size * 0.06, size * 0.28);
  ctx.quadraticCurveTo(size * 0.08, size * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  
  // Right shirt cuff
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.29, size * 0.055, size * 0.022, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Right cufflink (gold)
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(size * 0.01, size * 0.29, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffec8b";
  ctx.beginPath();
  ctx.arc(size * 0.014, size * 0.286, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  
  // Right hand (holding pen)
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(size * 0.005, size * 0.35, size * 0.04, size * 0.055, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Fingers gripping the pen
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  // Thumb
  ctx.beginPath();
  ctx.moveTo(size * 0.025, size * 0.33);
  ctx.quadraticCurveTo(size * 0.045, size * 0.35, size * 0.04, size * 0.38);
  ctx.stroke();
  // Index finger (pointing forward to hold pen)
  ctx.beginPath();
  ctx.moveTo(size * 0.015, size * 0.38);
  ctx.lineTo(size * 0.025, size * 0.44);
  ctx.stroke();
  // Other fingers curled
  ctx.beginPath();
  ctx.arc(-size * 0.005, size * 0.39, size * 0.025, 0.4 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // === DISTINGUISHED HEAD ===
  const headY = y - size * 0.5;
  // Face with subtle gradient
  const faceGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.05, 0, x, headY, size * 0.28);
  faceGrad.addColorStop(0, "#ffe8d0");
  faceGrad.addColorStop(0.5, "#ffe0bd");
  faceGrad.addColorStop(1, "#f0c8a0");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Chiseled jaw/chin
  ctx.fillStyle = "#f5d5b0";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, headY + size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.1, headY + size * 0.22, x, headY + size * 0.26);
  ctx.quadraticCurveTo(x + size * 0.1, headY + size * 0.22, x + size * 0.16, headY + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Subtle cheekbone shadows
  ctx.fillStyle = "rgba(200, 160, 120, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, headY + size * 0.02, size * 0.06, size * 0.04, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + size * 0.15, headY + size * 0.02, size * 0.06, size * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === SLICKED 1920S HAIR ===
  // Main hair
  const hairGrad = ctx.createLinearGradient(x - size * 0.2, headY - size * 0.2, x + size * 0.2, headY - size * 0.1);
  hairGrad.addColorStop(0, "#2a1810");
  hairGrad.addColorStop(0.3, "#3a2515");
  hairGrad.addColorStop(0.7, "#3a2515");
  hairGrad.addColorStop(1, "#2a1810");
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.27, size * 0.16, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Hair wave on left side
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.28, headY, x - size * 0.26, headY + size * 0.1);
  ctx.lineWidth = 5 * zoom;
  ctx.strokeStyle = "#3a2515";
  ctx.stroke();

  // Hair on right side
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.24, headY - size * 0.02, x + size * 0.22, headY + size * 0.06);
  ctx.lineWidth = 4 * zoom;
  ctx.stroke();

  // Hair shine
  ctx.strokeStyle = "rgba(80, 60, 40, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, headY - size * 0.22);
  ctx.quadraticCurveTo(x, headY - size * 0.26, x + size * 0.1, headY - size * 0.22);
  ctx.stroke();

  // Side part line
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, headY - size * 0.24);
  ctx.lineTo(x + size * 0.14, headY - size * 0.08);
  ctx.stroke();

  // === SOULFUL EYES ===
  // Eye socket shadows
  ctx.fillStyle = "rgba(180, 140, 100, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, headY - size * 0.02, size * 0.08, size * 0.05, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, headY - size * 0.02, size * 0.08, size * 0.05, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, headY - size * 0.02, size * 0.065, size * 0.055, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, headY - size * 0.02, size * 0.065, size * 0.055, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Irises (glowing golden during attack, otherwise deep blue-grey)
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 8 * zoom * attackIntensity;
    ctx.fillStyle = `rgba(218, 165, 32, ${0.85 + attackIntensity * 0.15})`;
  } else {
    ctx.fillStyle = "#4a6080";
  }
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Iris detail
  ctx.strokeStyle = isAttacking ? "#b8860b" : "#3a5070";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // Pupils
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.115, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (thoughtful, slightly furrowed)
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.1, headY - size * 0.11, x - size * 0.04, headY - size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.1, headY - size * 0.11, x + size * 0.04, headY - size * 0.08);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = "#c8a888";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.02);
  ctx.lineTo(x - size * 0.02, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.1, x + size * 0.02, headY + size * 0.08);
  ctx.stroke();

  // Subtle smile/contemplative expression
  ctx.strokeStyle = "#a08070";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, headY + size * 0.14);
  ctx.quadraticCurveTo(x, headY + size * 0.16, x + size * 0.08, headY + size * 0.14);
  ctx.stroke();

  // === ORNATE MAGICAL FOUNTAIN PEN ===
  // Pen follows the right arm movement
  const penArmAngle = 0.4 + rightArmFlourish * 0.7;
  const penBaseX = x + size * 0.38 + Math.sin(penArmAngle) * size * 0.35;
  const penBaseY = y - size * 0.1 + Math.cos(penArmAngle) * size * 0.35;
  const penBaseRotation = -0.5 + penArmAngle * 0.3 + quillFlourish * 0.25;
  const penRotation = resolveWeaponRotation(
    targetPos,
    penBaseX,
    penBaseY + writeGesture * 0.5,
    penBaseRotation,
    Math.PI / 2,
    isAttacking ? 1.2 : 0.66
  );
  ctx.save();
  ctx.translate(penBaseX, penBaseY + writeGesture * 0.5);
  ctx.rotate(penRotation);

  // Pen glow during attack
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  // Pen body (black lacquer with gold inlay)
  const penGrad = ctx.createLinearGradient(-size * 0.025, -size * 0.25, size * 0.025, -size * 0.25);
  penGrad.addColorStop(0, "#0a0a0a");
  penGrad.addColorStop(0.2, "#2a2a2a");
  penGrad.addColorStop(0.5, "#1a1a1a");
  penGrad.addColorStop(0.8, "#2a2a2a");
  penGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = penGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.03, -size * 0.25, size * 0.06, size * 0.32, size * 0.01);
  ctx.fill();

  // Pen body highlight
  ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.24);
  ctx.lineTo(-size * 0.02, size * 0.06);
  ctx.stroke();

  // Gold bands (ornate)
  const goldBandGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
  goldBandGrad.addColorStop(0, "#b8860b");
  goldBandGrad.addColorStop(0.3, "#daa520");
  goldBandGrad.addColorStop(0.5, "#ffec8b");
  goldBandGrad.addColorStop(0.7, "#daa520");
  goldBandGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = goldBandGrad;
  ctx.fillRect(-size * 0.035, -size * 0.2, size * 0.07, size * 0.025);
  ctx.fillRect(-size * 0.035, -size * 0.12, size * 0.07, size * 0.015);
  ctx.fillRect(-size * 0.035, -size * 0.04, size * 0.07, size * 0.015);
  ctx.fillRect(-size * 0.035, size * 0.04, size * 0.07, size * 0.025);

  // Gold clip
  ctx.fillStyle = goldBandGrad;
  ctx.fillRect(size * 0.025, -size * 0.18, size * 0.015, size * 0.15);
  ctx.beginPath();
  ctx.arc(size * 0.0325, -size * 0.18, size * 0.0075, 0, Math.PI * 2);
  ctx.fill();

  // Nib section
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.25);
  ctx.lineTo(-size * 0.02, -size * 0.3);
  ctx.lineTo(size * 0.02, -size * 0.3);
  ctx.lineTo(size * 0.025, -size * 0.25);
  ctx.closePath();
  ctx.fill();

  // Gold nib
  const nibGrad = ctx.createLinearGradient(-size * 0.015, -size * 0.3, size * 0.015, -size * 0.3);
  nibGrad.addColorStop(0, "#b8860b");
  nibGrad.addColorStop(0.5, "#ffd700");
  nibGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = nibGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(-size * 0.018, -size * 0.38);
  ctx.lineTo(0, -size * 0.42);
  ctx.lineTo(size * 0.018, -size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Nib slit
  ctx.strokeStyle = "#5a4010";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.32);
  ctx.lineTo(0, -size * 0.4);
  ctx.stroke();

  // Ink flow during attack
  if (isAttacking && attackPhase > 0.2) {
    const inkPhase = (attackPhase - 0.2) / 0.8;
    for (let drop = 0; drop < 3; drop++) {
      const dropY = -size * 0.44 - inkPhase * size * 0.2 - drop * size * 0.05;
      const dropAlpha = (1 - inkPhase) * (1 - drop * 0.3);
      ctx.fillStyle = `rgba(20, 15, 10, ${dropAlpha})`;
      ctx.beginPath();
      ctx.ellipse(Math.sin(time * 10 + drop) * size * 0.01, dropY, size * 0.012, size * 0.018, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // === FLOATING MAGICAL WORDS (enhanced) ===
  const wordCount = isAttacking ? 8 : 5;
  const words = ["dream", "green", "light", "hope", "glory", "jazz", "Gatsby", "beauty"];
  for (let i = 0; i < wordCount; i++) {
    const wordPhase = (time * 0.6 + i * 0.4) % 3.5;
    const wordAngle = -0.6 + (i / wordCount) * 1.2;
    const wordX = x - size * 0.3 + Math.sin(wordAngle + wordPhase * Math.PI * 0.4) * size * 0.65;
    const wordY = y - size * 0.6 - wordPhase * size * 0.3;
    const wordAlpha = (1 - wordPhase / 3.5) * (isAttacking ? 0.95 : 0.6);
    const wordScale = 1 + (isAttacking ? attackIntensity * 0.3 : 0);

    ctx.fillStyle = `rgba(218, 165, 32, ${wordAlpha})`;
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = isAttacking ? 8 * zoom : 4 * zoom;
    ctx.font = `italic ${(10 + (isAttacking ? 4 : 0)) * zoom * wordScale}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(words[i % words.length], wordX, wordY);
  }
  ctx.shadowBlur = 0;

  // === GOLDEN LITERARY AURA ===
  const auraGlow = 0.3 + Math.sin(time * 3.5) * 0.1 + attackIntensity * 0.3;
  ctx.strokeStyle = `rgba(218, 165, 32, ${auraGlow})`;
  ctx.lineWidth = (2 + attackIntensity * 2) * zoom;
  ctx.setLineDash([5 * zoom, 4 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner aura glow
  ctx.strokeStyle = `rgba(255, 215, 0, ${auraGlow * 0.4})`;
  ctx.lineWidth = (1.2 + attackIntensity * 1) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.5, size * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
}

