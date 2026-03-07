import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

export function drawCaptainHero(
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
  // LEGENDARY DRAGONLORD GENERAL - Epic Fantasy War Commander with Divine Fire
  const breathe = Math.sin(time * 2) * 2;
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) : 0;
  const commandPose = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const flamePulse = Math.sin(time * 6) * 0.15 + 0.85;
  const divineGlow = Math.sin(time * 1.5) * 0.2 + 0.8;

  // === DIVINE FLAME AURA - Radiating Power ===
  const auraBase = isAttacking ? 0.45 : 0.28;
  for (let auraLayer = 0; auraLayer < 6; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x, y - size * 0.1, size * (0.05 + layerOffset),
      x, y, size * (1.1 + layerOffset * 0.25)
    );
    const layerAlpha = (auraBase - auraLayer * 0.05) * divineGlow;
    auraGrad.addColorStop(0, `rgba(255, 200, 100, ${layerAlpha * 0.7})`);
    auraGrad.addColorStop(0.2, `rgba(255, 100, 50, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.5, `rgba(200, 30, 30, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.75, `rgba(150, 20, 50, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(100, 10, 30, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (1.0 + layerOffset * 0.18), size * (0.65 + layerOffset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating ember particles
  for (let p = 0; p < 18; p++) {
    const pAngle = (time * 1.2 + p * Math.PI * 2 / 18) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 3 + p * 0.9) * size * 0.2;
    const pHeight = Math.sin(time * 2 + p * 0.5) * size * 0.15;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.45 - pHeight;
    const pAlpha = 0.5 + Math.sin(time * 5 + p * 0.7) * 0.35;
    const pSize = size * (0.015 + Math.sin(time * 4 + p) * 0.008);
    
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 6 * zoom;
    ctx.fillStyle = p % 4 === 0 ? `rgba(255, 220, 100, ${pAlpha})` : 
                    p % 4 === 1 ? `rgba(255, 150, 50, ${pAlpha})` :
                    p % 4 === 2 ? `rgba(255, 80, 30, ${pAlpha})` :
                    `rgba(220, 38, 38, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Arcane rune circle
  ctx.save();
  ctx.translate(x, y + size * 0.05);
  ctx.rotate(time * 0.3);
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.25 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.75, size * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Rune symbols
  for (let rune = 0; rune < 8; rune++) {
    const runeAngle = rune * Math.PI / 4;
    const runeX = Math.cos(runeAngle) * size * 0.75;
    const runeY = Math.sin(runeAngle) * size * 0.35;
    ctx.fillStyle = `rgba(255, 200, 100, ${0.4 + Math.sin(time * 3 + rune) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(runeX, runeY - size * 0.03);
    ctx.lineTo(runeX + size * 0.02, runeY);
    ctx.lineTo(runeX, runeY + size * 0.03);
    ctx.lineTo(runeX - size * 0.02, runeY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.54, 0, x, y + size * 0.54, size * 0.6);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(50, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.54, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LEGENDARY FLAME CAPE ===
  const capeWave = Math.sin(time * 3) * 0.15;
  const capeWave2 = Math.sin(time * 4 + 0.7) * 0.1;

  // Cape inner glow layer
  const capeGlowGrad = ctx.createLinearGradient(x, y - size * 0.2, x, y + size * 0.7);
  capeGlowGrad.addColorStop(0, "rgba(255, 150, 50, 0.3)");
  capeGlowGrad.addColorStop(0.5, "rgba(200, 50, 30, 0.2)");
  capeGlowGrad.addColorStop(1, "rgba(100, 20, 20, 0.1)");
  ctx.fillStyle = capeGlowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.2);
  ctx.bezierCurveTo(
    x - size * 0.65 - capeWave * size, y + size * 0.2,
    x - size * 0.6 - capeWave2 * size, y + size * 0.5,
    x - size * 0.5, y + size * 0.72
  );
  ctx.lineTo(x + size * 0.5, y + size * 0.72);
  ctx.bezierCurveTo(
    x + size * 0.6 + capeWave2 * size, y + size * 0.5,
    x + size * 0.65 + capeWave * size, y + size * 0.2,
    x + size * 0.28, y - size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Cape main - deep crimson with gradient
  const capeGrad = ctx.createLinearGradient(x - size * 0.6, y, x + size * 0.6, y);
  capeGrad.addColorStop(0, "#3a0505");
  capeGrad.addColorStop(0.15, "#5a0808");
  capeGrad.addColorStop(0.3, "#8b1010");
  capeGrad.addColorStop(0.5, "#b81818");
  capeGrad.addColorStop(0.7, "#8b1010");
  capeGrad.addColorStop(0.85, "#5a0808");
  capeGrad.addColorStop(1, "#3a0505");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.6 - capeWave * size, y + size * 0.15,
    x - size * 0.55 - capeWave2 * size, y + size * 0.48,
    x - size * 0.45, y + size * 0.68
  );
  ctx.lineTo(x + size * 0.45, y + size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.48,
    x + size * 0.6 + capeWave * size, y + size * 0.15,
    x + size * 0.26, y - size * 0.22
  );
  ctx.closePath();
  ctx.fill();

  // Cape flame edge effect
  ctx.strokeStyle = "#ff6630";
  ctx.lineWidth = 3 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 8 * zoom * flamePulse;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.68);
  for (let flame = 0; flame < 12; flame++) {
    const flameX = x - size * 0.45 + flame * size * 0.075;
    const flameWave = Math.sin(time * 6 + flame * 0.8) * size * 0.04;
    const flameHeight = Math.sin(time * 5 + flame * 0.5) * size * 0.02 + size * 0.02;
    ctx.lineTo(flameX + size * 0.0375, y + size * 0.68 + flameHeight + flameWave);
    ctx.lineTo(flameX + size * 0.075, y + size * 0.68);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Cape gold dragon embroidery
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.2 * zoom;
  ctx.globalAlpha = 0.7;
  // Central dragon silhouette pattern
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.2, x - size * 0.1, y + size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.4, x - size * 0.15, y + size * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.2, x + size * 0.1, y + size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.4, x + size * 0.15, y + size * 0.5);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Cape gold trim with ornate pattern
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.66);
  ctx.bezierCurveTo(
    x - size * 0.55 - capeWave2 * size, y + size * 0.46,
    x - size * 0.6 - capeWave * size, y + size * 0.13,
    x - size * 0.26, y - size * 0.24
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.45, y + size * 0.66);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.46,
    x + size * 0.6 + capeWave * size, y + size * 0.13,
    x + size * 0.26, y - size * 0.24
  );
  ctx.stroke();

  // === DRAGONSCALE PLATE ARMOR ===
  // Base armor shape
  const armorGrad = ctx.createLinearGradient(x - size * 0.45, y - size * 0.3, x + size * 0.45, y + size * 0.45);
  armorGrad.addColorStop(0, "#1a1a1a");
  armorGrad.addColorStop(0.15, "#2a2a2a");
  armorGrad.addColorStop(0.3, "#3a3a3a");
  armorGrad.addColorStop(0.5, "#4a4a4a");
  armorGrad.addColorStop(0.7, "#3a3a3a");
  armorGrad.addColorStop(0.85, "#2a2a2a");
  armorGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52 + breathe);
  ctx.lineTo(x - size * 0.48, y - size * 0.05);
  ctx.lineTo(x - size * 0.32, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.32, y - size * 0.3);
  ctx.lineTo(x + size * 0.48, y - size * 0.05);
  ctx.lineTo(x + size * 0.4, y + size * 0.52 + breathe);
  ctx.closePath();
  ctx.fill();

  // Dragonscale texture overlay
  ctx.fillStyle = "#555555";
  for (let row = 0; row < 5; row++) {
    for (let col = -3; col <= 3; col++) {
      const scaleX = x + col * size * 0.11 + (row % 2) * size * 0.055;
      const scaleY = y - size * 0.15 + row * size * 0.11;
      const scaleSize = size * 0.05;
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY - scaleSize * 0.3);
      ctx.quadraticCurveTo(scaleX + scaleSize, scaleY, scaleX, scaleY + scaleSize * 0.6);
      ctx.quadraticCurveTo(scaleX - scaleSize, scaleY, scaleX, scaleY - scaleSize * 0.3);
      ctx.fill();
    }
  }

  // Armor crimson accents with glow
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.18);
  ctx.lineTo(x, y + size * 0.18);
  ctx.lineTo(x + size * 0.38, y - size * 0.18);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Armor gold filigree
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.22);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.28, x, y - size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.28, x + size * 0.35, y - size * 0.22);
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52 + breathe);
  ctx.lineTo(x - size * 0.48, y - size * 0.05);
  ctx.lineTo(x - size * 0.32, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.32, y - size * 0.3);
  ctx.lineTo(x + size * 0.48, y - size * 0.05);
  ctx.lineTo(x + size * 0.4, y + size * 0.52 + breathe);
  ctx.closePath();
  ctx.stroke();

  // Central dragon emblem
  ctx.fillStyle = "#daa520";
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  // Dragon head silhouette emblem
  ctx.moveTo(x, y - size * 0.08);
  ctx.lineTo(x - size * 0.06, y + size * 0.02);
  ctx.lineTo(x - size * 0.04, y + size * 0.08);
  ctx.lineTo(x, y + size * 0.05);
  ctx.lineTo(x + size * 0.04, y + size * 0.08);
  ctx.lineTo(x + size * 0.06, y + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Emblem center gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 8 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8888";
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y - size * 0.01, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === DRAGON PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.5;
    
    // Pauldron base with gradient
    const pauldronGrad = ctx.createRadialGradient(
      pauldronX - side * size * 0.05, y - size * 0.2, 0,
      pauldronX, y - size * 0.15, size * 0.25
    );
    pauldronGrad.addColorStop(0, "#5a5a5a");
    pauldronGrad.addColorStop(0.5, "#3a3a3a");
    pauldronGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.15, size * 0.22, size * 0.16, side * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Dragon scale pattern on pauldron
    ctx.fillStyle = "#4a4a4a";
    for (let scale = 0; scale < 3; scale++) {
      const sX = pauldronX + side * scale * size * 0.05;
      const sY = y - size * 0.18 + scale * size * 0.04;
      ctx.beginPath();
      ctx.ellipse(sX, sY, size * 0.06, size * 0.04, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dragon horn spike
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.1, y - size * 0.25);
    ctx.quadraticCurveTo(
      pauldronX + side * size * 0.25, y - size * 0.35,
      pauldronX + side * size * 0.28, y - size * 0.48
    );
    ctx.quadraticCurveTo(
      pauldronX + side * size * 0.2, y - size * 0.38,
      pauldronX + side * size * 0.15, y - size * 0.2
    );
    ctx.closePath();
    ctx.fill();
    // Spike highlight
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.12, y - size * 0.26);
    ctx.quadraticCurveTo(
      pauldronX + side * size * 0.24, y - size * 0.36,
      pauldronX + side * size * 0.27, y - size * 0.46
    );
    ctx.stroke();

    // Pauldron gold trim
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.15, size * 0.22, size * 0.16, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Pauldron ruby gem
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(pauldronX, y - size * 0.15, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6666";
    ctx.beginPath();
    ctx.arc(pauldronX - size * 0.015, y - size * 0.16, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === ARMORED ARMS ===
  for (let side = -1; side <= 1; side += 2) {
    const armX = x + side * size * 0.48;
    const armSwing = side === 1 ? swordSwing * 0.3 : 0; // Right arm moves with sword
    
    // Upper arm (plate armor)
    const upperArmGrad = ctx.createLinearGradient(
      armX - size * 0.08, y - size * 0.1,
      armX + size * 0.08, y + size * 0.15
    );
    upperArmGrad.addColorStop(0, "#4a4a4a");
    upperArmGrad.addColorStop(0.3, "#5a5a5a");
    upperArmGrad.addColorStop(0.5, "#6a6a6a");
    upperArmGrad.addColorStop(0.7, "#5a5a5a");
    upperArmGrad.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = upperArmGrad;
    ctx.beginPath();
    ctx.moveTo(armX - side * size * 0.02, y - size * 0.08);
    ctx.quadraticCurveTo(
      armX + side * size * 0.12, y + size * 0.05 + armSwing * size * 0.1,
      armX + side * size * 0.08, y + size * 0.18 + armSwing * size * 0.15
    );
    ctx.lineTo(armX - side * size * 0.04, y + size * 0.2 + armSwing * size * 0.15);
    ctx.quadraticCurveTo(
      armX - side * size * 0.06, y + size * 0.08,
      armX - side * size * 0.02, y - size * 0.08
    );
    ctx.closePath();
    ctx.fill();
    
    // Upper arm plate segments
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(armX - side * size * 0.03, y + size * 0.02);
    ctx.lineTo(armX + side * size * 0.1, y + size * 0.06 + armSwing * size * 0.08);
    ctx.stroke();
    
    // Elbow joint
    const elbowX = armX + side * size * 0.06;
    const elbowY = y + size * 0.2 + armSwing * size * 0.15;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(elbowX, elbowY, size * 0.055, size * 0.04, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    
    // Forearm
    const forearmEndX = armX + side * size * 0.15;
    const forearmEndY = y + size * 0.38 + armSwing * size * 0.2;
    const forearmGrad = ctx.createLinearGradient(elbowX, elbowY, forearmEndX, forearmEndY);
    forearmGrad.addColorStop(0, "#4a4a4a");
    forearmGrad.addColorStop(0.5, "#5a5a5a");
    forearmGrad.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = forearmGrad;
    ctx.beginPath();
    ctx.moveTo(elbowX - side * size * 0.04, elbowY);
    ctx.quadraticCurveTo(
      forearmEndX, forearmEndY - size * 0.05,
      forearmEndX + side * size * 0.02, forearmEndY
    );
    ctx.lineTo(forearmEndX - side * size * 0.04, forearmEndY + size * 0.02);
    ctx.quadraticCurveTo(
      elbowX - side * size * 0.02, elbowY + size * 0.08,
      elbowX - side * size * 0.04, elbowY
    );
    ctx.closePath();
    ctx.fill();
    
    // Forearm plate detail
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY + size * 0.04);
    ctx.lineTo(forearmEndX, forearmEndY - size * 0.02);
    ctx.stroke();
    
    // Gauntlet/Hand
    const handX = forearmEndX + side * size * 0.02;
    const handY = forearmEndY + size * 0.02;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(handX, handY, size * 0.045, size * 0.035, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Gauntlet knuckle details
    ctx.fillStyle = "#2a2a2a";
    for (let knuckle = 0; knuckle < 4; knuckle++) {
      const kX = handX + side * size * 0.015 + knuckle * side * size * 0.015;
      const kY = handY - size * 0.015 + Math.abs(knuckle - 1.5) * size * 0.008;
      ctx.beginPath();
      ctx.arc(kX, kY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
    // Gauntlet gold trim
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(handX, handY, size * 0.045, size * 0.035, side * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === LEGENDARY FLAMESWORD ===
  const swordBaseAngle = 0.7 + swordSwing * 1.4;
  const swordAngle = resolveWeaponRotation(
    targetPos,
    x + size * 0.55,
    y + size * 0.08,
    swordBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.35 : 0.8,
    WEAPON_LIMITS.rightMelee,
  );
  ctx.save();
  ctx.translate(x + size * 0.55, y + size * 0.08);
  ctx.rotate(swordAngle);

  // Flame aura around blade
  if (isAttacking || true) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 18 * zoom * (0.7 + attackIntensity * 0.3);
    
    // Flame particles along greatsword blade
    for (let flame = 0; flame < 12; flame++) {
      const flameY = -size * 0.12 - flame * size * 0.085;
      const flameX = Math.sin(time * 8 + flame * 0.7) * size * 0.04;
      const flameAlpha = 0.4 + Math.sin(time * 6 + flame) * 0.2;
      ctx.fillStyle = `rgba(255, ${150 - flame * 8}, 50, ${flameAlpha})`;
      ctx.beginPath();
      ctx.ellipse(flameX, flameY, size * 0.03, size * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Greatsword blade with fire gradient
  const bladeGrad = ctx.createLinearGradient(-size * 0.07, -size * 0.55, size * 0.07, -size * 0.55);
  bladeGrad.addColorStop(0, "#606068");
  bladeGrad.addColorStop(0.15, "#909098");
  bladeGrad.addColorStop(0.3, "#c0c0c8");
  bladeGrad.addColorStop(0.5, "#e8e8f0");
  bladeGrad.addColorStop(0.7, "#c0c0c8");
  bladeGrad.addColorStop(0.85, "#909098");
  bladeGrad.addColorStop(1, "#606068");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, 0);
  ctx.lineTo(-size * 0.075, -size * 0.78);
  ctx.lineTo(-size * 0.04, -size * 0.98);
  ctx.lineTo(0, -size * 1.1);
  ctx.lineTo(size * 0.04, -size * 0.98);
  ctx.lineTo(size * 0.075, -size * 0.78);
  ctx.lineTo(size * 0.07, 0);
  ctx.closePath();
  ctx.fill();

  // Blade fire edge glow
  ctx.strokeStyle = "#ff6630";
  ctx.lineWidth = 2.5 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 10 * zoom * flamePulse;
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, -size * 0.05);
  ctx.lineTo(-size * 0.075, -size * 0.76);
  ctx.lineTo(-size * 0.035, -size * 0.96);
  ctx.lineTo(0, -size * 1.08);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Blade runes with fire glow
  ctx.fillStyle = `rgba(255, 100, 50, ${0.6 + attackIntensity * 0.4})`;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 6 * zoom;
  for (let rune = 0; rune < 6; rune++) {
    const runeY = -size * 0.14 - rune * size * 0.14;
    ctx.beginPath();
    ctx.moveTo(0, runeY - size * 0.028);
    ctx.lineTo(size * 0.018, runeY);
    ctx.lineTo(0, runeY + size * 0.028);
    ctx.lineTo(-size * 0.018, runeY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Blade border
  ctx.strokeStyle = "#404048";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, 0);
  ctx.lineTo(-size * 0.075, -size * 0.78);
  ctx.lineTo(-size * 0.04, -size * 0.98);
  ctx.lineTo(0, -size * 1.1);
  ctx.lineTo(size * 0.04, -size * 0.98);
  ctx.lineTo(size * 0.075, -size * 0.78);
  ctx.lineTo(size * 0.07, 0);
  ctx.closePath();
  ctx.stroke();

  // Dragon crossguard (wider for greatsword)
  const guardGrad = ctx.createLinearGradient(-size * 0.24, 0, size * 0.24, 0);
  guardGrad.addColorStop(0, "#805010");
  guardGrad.addColorStop(0.2, "#c9a227");
  guardGrad.addColorStop(0.4, "#f0c040");
  guardGrad.addColorStop(0.5, "#ffe060");
  guardGrad.addColorStop(0.6, "#f0c040");
  guardGrad.addColorStop(0.8, "#c9a227");
  guardGrad.addColorStop(1, "#805010");
  ctx.fillStyle = guardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.24, size * 0.02);
  ctx.quadraticCurveTo(-size * 0.27, -size * 0.05, -size * 0.2, -size * 0.07);
  ctx.lineTo(-size * 0.07, -size * 0.05);
  ctx.lineTo(size * 0.07, -size * 0.05);
  ctx.lineTo(size * 0.2, -size * 0.07);
  ctx.quadraticCurveTo(size * 0.27, -size * 0.05, size * 0.24, size * 0.02);
  ctx.quadraticCurveTo(size * 0.13, size * 0.05, 0, size * 0.03);
  ctx.quadraticCurveTo(-size * 0.13, size * 0.05, -size * 0.24, size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#604008";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Guard dragon eye gems
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(-size * 0.13, -size * 0.02, size * 0.028, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.13, -size * 0.02, size * 0.028, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Extended two-handed hilt
  const hiltGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  hiltGrad.addColorStop(0, "#1a0805");
  hiltGrad.addColorStop(0.3, "#3a1810");
  hiltGrad.addColorStop(0.5, "#5a2818");
  hiltGrad.addColorStop(0.7, "#3a1810");
  hiltGrad.addColorStop(1, "#1a0805");
  ctx.fillStyle = hiltGrad;
  ctx.fillRect(-size * 0.04, size * 0.01, size * 0.08, size * 0.26);
  
  // Hilt gold wrapping (more wraps for longer grip)
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  for (let wrap = 0; wrap < 7; wrap++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, size * 0.03 + wrap * size * 0.034);
    ctx.lineTo(size * 0.04, size * 0.048 + wrap * size * 0.034);
    ctx.stroke();
  }

  // Dragon head pommel (shifted down for longer hilt)
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(0, size * 0.27);
  ctx.lineTo(-size * 0.06, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.35, -size * 0.06, size * 0.39);
  ctx.quadraticCurveTo(-size * 0.025, size * 0.42, 0, size * 0.41);
  ctx.quadraticCurveTo(size * 0.025, size * 0.42, size * 0.06, size * 0.39);
  ctx.quadraticCurveTo(size * 0.08, size * 0.35, size * 0.06, size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#805010";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Pommel ruby eye
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.345, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === LEGENDARY WAR STANDARD (Facing Left) ===
  ctx.save();
  ctx.translate(x - size * 0.62, y - size * 0.08);
  ctx.rotate(-0.15); // Angle the standard outward

  // Banner pole - ornate gold and dark wood
  const poleGrad = ctx.createLinearGradient(-size * 0.03, -size * 0.85, size * 0.03, -size * 0.85);
  poleGrad.addColorStop(0, "#3a1508");
  poleGrad.addColorStop(0.3, "#5a2510");
  poleGrad.addColorStop(0.5, "#7a3518");
  poleGrad.addColorStop(0.7, "#5a2510");
  poleGrad.addColorStop(1, "#3a1508");
  ctx.fillStyle = poleGrad;
  ctx.fillRect(-size * 0.028, -size * 0.85, size * 0.056, size * 0.95);

  // Pole gold ornaments
  ctx.fillStyle = "#daa520";
  for (let ring = 0; ring < 4; ring++) {
    ctx.fillRect(-size * 0.035, -size * 0.82 + ring * size * 0.25, size * 0.07, size * 0.035);
  }

  // Dragon finial
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  // Dragon head finial
  ctx.moveTo(0, -size * 0.98);
  ctx.lineTo(-size * 0.04, -size * 0.92);
  ctx.quadraticCurveTo(-size * 0.06, -size * 0.88, -size * 0.05, -size * 0.85);
  ctx.lineTo(size * 0.05, -size * 0.85);
  ctx.quadraticCurveTo(size * 0.06, -size * 0.88, size * 0.04, -size * 0.92);
  ctx.closePath();
  ctx.fill();
  // Dragon horns
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.92);
  ctx.lineTo(-size * 0.06, -size * 1.0);
  ctx.lineTo(-size * 0.02, -size * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.03, -size * 0.92);
  ctx.lineTo(size * 0.06, -size * 1.0);
  ctx.lineTo(size * 0.02, -size * 0.9);
  ctx.closePath();
  ctx.fill();
  // Finial gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.9, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Banner fabric with epic wave (facing left)
  const bannerWave = Math.sin(time * 4) * 0.2;
  const bannerWave2 = Math.sin(time * 5 + 0.6) * 0.12;

  // Banner shadow
  ctx.fillStyle = "#3a0808";
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, -size * 0.78);
  ctx.bezierCurveTo(
    -size * 0.28 - bannerWave * size, -size * 0.72,
    -size * 0.36 - bannerWave2 * size, -size * 0.5,
    -size * 0.42, -size * 0.35
  );
  ctx.bezierCurveTo(
    -size * 0.32 - bannerWave2 * size * 0.5, -size * 0.28,
    -size * 0.22 - bannerWave * size * 0.3, -size * 0.18,
    -size * 0.028, -size * 0.12
  );
  ctx.closePath();
  ctx.fill();

  // Banner main
  const bannerGrad = ctx.createLinearGradient(-size * 0.028, -size * 0.5, -size * 0.4, -size * 0.5);
  bannerGrad.addColorStop(0, "#8b1010");
  bannerGrad.addColorStop(0.3, "#b81818");
  bannerGrad.addColorStop(0.6, "#dc2626");
  bannerGrad.addColorStop(1, "#aa1515");
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, -size * 0.8);
  ctx.bezierCurveTo(
    -size * 0.26 - bannerWave * size, -size * 0.74,
    -size * 0.34 - bannerWave2 * size, -size * 0.52,
    -size * 0.4, -size * 0.38
  );
  ctx.bezierCurveTo(
    -size * 0.3 - bannerWave2 * size * 0.5, -size * 0.3,
    -size * 0.2 - bannerWave * size * 0.3, -size * 0.2,
    -size * 0.028, -size * 0.15
  );
  ctx.closePath();
  ctx.fill();

  // Banner gold trim with glow
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 2.5 * zoom;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 4 * zoom;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Banner dragon emblem
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(-size * 0.18, -size * 0.48, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.arc(-size * 0.18, -size * 0.48, size * 0.075, 0, Math.PI * 2);
  ctx.fill();
  // Dragon silhouette
  ctx.fillStyle = "#8b1010";
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, -size * 0.52);
  ctx.lineTo(-size * 0.14, -size * 0.46);
  ctx.lineTo(-size * 0.16, -size * 0.44);
  ctx.lineTo(-size * 0.18, -size * 0.46);
  ctx.lineTo(-size * 0.2, -size * 0.44);
  ctx.lineTo(-size * 0.22, -size * 0.46);
  ctx.closePath();
  ctx.fill();

  // Banner flame fringe
  ctx.strokeStyle = "#ff6630";
  ctx.lineWidth = 1.5 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 4 * zoom;
  for (let fringe = 0; fringe < 6; fringe++) {
    const fringeT = fringe / 5;
    const fx = -size * 0.028 + (-size * 0.38 + size * 0.028) * fringeT;
    const fy = -size * 0.15 + (-size * 0.38 + size * 0.15) * fringeT;
    const fWave = Math.sin(time * 7 + fringe * 0.8) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - size * 0.015, fy + size * 0.04 + fWave);
    ctx.lineTo(fx - size * 0.03, fy + size * 0.02);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // === DRAGON CROWN HELM ===
  // Helm base
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05, y - size * 0.58, size * 0.05,
    x, y - size * 0.52, size * 0.35
  );
  helmGrad.addColorStop(0, "#606060");
  helmGrad.addColorStop(0.3, "#4a4a4a");
  helmGrad.addColorStop(0.6, "#3a3a3a");
  helmGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.32, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helm dragon scale pattern
  ctx.fillStyle = "#2a2a2a";
  for (let row = 0; row < 3; row++) {
    const scaleY = y - size * 0.7 + row * size * 0.08;
    for (let col = -2; col <= 2; col++) {
      const scaleX = x + col * size * 0.08 + (row % 2) * size * 0.04;
      ctx.beginPath();
      ctx.ellipse(scaleX, scaleY, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helm dragon crest ridge
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.82);
  ctx.lineTo(x - size * 0.05, y - size * 0.52);
  ctx.lineTo(x + size * 0.05, y - size * 0.52);
  ctx.lineTo(x + size * 0.04, y - size * 0.82);
  ctx.closePath();
  ctx.fill();

  // Dragon crown band with ornate detail
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 4 * zoom;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52, size * 0.32, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Crown dragon teeth/points
  ctx.fillStyle = "#daa520";
  for (let tooth = -3; tooth <= 3; tooth++) {
    const toothX = x + tooth * size * 0.07;
    const toothHeight = Math.abs(tooth) === 3 ? 0.08 : Math.abs(tooth) === 2 ? 0.1 : Math.abs(tooth) === 1 ? 0.12 : 0.14;
    ctx.beginPath();
    ctx.moveTo(toothX - size * 0.025, y - size * 0.76);
    ctx.lineTo(toothX, y - size * (0.76 + toothHeight));
    ctx.lineTo(toothX + size * 0.025, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Tooth gem
    if (Math.abs(tooth) <= 1) {
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(toothX, y - size * (0.78 + toothHeight * 0.3), size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#daa520";
    }
  }

  // Helm border
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.32, size * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Dragon visor base (darkness behind grille)
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.58);
  ctx.quadraticCurveTo(x, y - size * 0.52, x + size * 0.24, y - size * 0.58);
  ctx.lineTo(x + size * 0.2, y - size * 0.38);
  ctx.quadraticCurveTo(x, y - size * 0.32, x - size * 0.2, y - size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Visor glowing red light behind grille
  const eyeGlow = isAttacking ? 1 : 0.75;
  ctx.fillStyle = isAttacking
    ? `rgba(220, 38, 38, ${0.85 + attackIntensity * 0.15})`
    : `rgba(180, 30, 30, ${eyeGlow})`;
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = isAttacking ? 15 * zoom : 10 * zoom;
  // Full visor inner glow
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.56);
  ctx.quadraticCurveTo(x, y - size * 0.5, x + size * 0.22, y - size * 0.56);
  ctx.lineTo(x + size * 0.18, y - size * 0.4);
  ctx.quadraticCurveTo(x, y - size * 0.34, x - size * 0.18, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Brighter center eye areas
  ctx.fillStyle = isAttacking
    ? `rgba(255, 60, 60, ${0.9 + attackIntensity * 0.1})`
    : `rgba(220, 50, 50, ${eyeGlow * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.48, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y - size * 0.48, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Visor grille bars - vertical
  for (let vbar = -3; vbar <= 3; vbar++) {
    const vbarX = x + vbar * size * 0.055;
    const topY = y - size * 0.56;
    const bottomY = y - size * 0.38;
    ctx.beginPath();
    ctx.moveTo(vbarX, topY);
    ctx.lineTo(vbarX * 0.95 + x * 0.05, bottomY);
    ctx.stroke();
  }
  // Grille highlights
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 0.8 * zoom;
  for (let bar = 0; bar < 5; bar++) {
    const barY = y - size * 0.56 + bar * size * 0.045 - size * 0.005;
    const barWidth = size * (0.19 - bar * 0.015);
    ctx.beginPath();
    ctx.moveTo(x - barWidth, barY);
    ctx.lineTo(x + barWidth, barY);
    ctx.stroke();
  }


  // Glowing red eyes IN FRONT of grille
  ctx.fillStyle = isAttacking
    ? `rgba(255, 50, 50, ${0.95 + attackIntensity * 0.05})`
    : "rgba(220, 38, 38, 0.9)";
  ctx.shadowColor = "#ff2222";
  ctx.shadowBlur = isAttacking ? 18 * zoom : 12 * zoom;
  // Left eye
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.48, size * 0.055, size * 0.035, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y - size * 0.48, size * 0.055, size * 0.035, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Eye bright centers
  ctx.fillStyle = isAttacking ? "#ff8888" : "#ff6666";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.11, y - size * 0.485, size * 0.025, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.09, y - size * 0.485, size * 0.025, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
 

  // Visor grille frame border (a little light gray)
  ctx.strokeStyle = "#6a6a6a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.58);
  ctx.quadraticCurveTo(x, y - size * 0.52, x + size * 0.28, y - size * 0.58);
  ctx.lineTo(x + size * 0.2, y - size * 0.38);
  ctx.quadraticCurveTo(x, y - size * 0.32, x - size * 0.2, y - size * 0.38);
  ctx.closePath();
  ctx.stroke();


  // Visor breath holes at bottom
  ctx.fillStyle = "#000000";
  for (let hole = -2; hole <= 2; hole++) {
    ctx.beginPath();
    ctx.arc(x + hole * size * 0.04, y - size * 0.35, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helm center dragon gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 8 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.83, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8888";
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y - size * 0.84, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === LEGENDARY FLAME PLUME ===
  // Plume base shadow
  for (let i = 0; i < 9; i++) {
    const plumeX = x + (i - 4) * size * 0.04;
    const plumeWave = Math.sin(time * 5 + i * 0.4) * 6;
    const plumeLen = size * (0.4 + Math.abs(i - 4) * 0.02);
    ctx.strokeStyle = "#3a0808";
    ctx.lineWidth = (7 - Math.abs(i - 4) * 0.6) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(plumeX + size * 0.01, y - size * 0.81);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.8 + size * 0.01,
      y - size * 1.0 - plumeLen * 0.5,
      plumeX + plumeWave + size * 0.01,
      y - size * 0.82 - plumeLen
    );
    ctx.stroke();
  }

  // Main flame plume with gradient colors
  for (let i = 0; i < 9; i++) {
    const plumeX = x + (i - 4) * size * 0.04;
    const plumeWave = Math.sin(time * 5 + i * 0.4) * 6;
    const plumeLen = size * (0.4 + Math.abs(i - 4) * 0.02);
    const plumeColor = i % 3 === 0 ? "#ff6630" : i % 3 === 1 ? "#dc2626" : "#aa1515";
    ctx.strokeStyle = plumeColor;
    ctx.lineWidth = (6.5 - Math.abs(i - 4) * 0.55) * zoom;
    ctx.lineCap = "round";
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(plumeX, y - size * 0.83);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.6,
      y - size * 1.02 - plumeLen * 0.5,
      plumeX + plumeWave * 0.9,
      y - size * 0.84 - plumeLen
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Plume fire highlights
  for (let i = 0; i < 7; i += 2) {
    const plumeX = x + (i - 3) * size * 0.05;
    const plumeWave = Math.sin(time * 5 + i * 0.4) * 6;
    const plumeLen = size * (0.36 + Math.abs(i - 3) * 0.015);
    ctx.strokeStyle = "#ffaa44";
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(plumeX, y - size * 0.85);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.3,
      y - size * 0.98 - plumeLen * 0.4,
      plumeX + plumeWave * 0.7,
      y - size * 0.86 - plumeLen * 0.9
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // === DIVINE COMMAND EFFECT WHEN ATTACKING ===
  if (isAttacking) {
    // Outer divine fire rings
    for (let ring = 0; ring < 5; ring++) {
      const ringRadius = size * (0.6 + ring * 0.2 + commandPose * 0.3);
      const ringAlpha = commandPose * (0.6 - ring * 0.1);
      
      // Gold divine ring
      ctx.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Fire inner ring
      ctx.strokeStyle = `rgba(255, 100, 50, ${ringAlpha * 0.8})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius * 0.92, ringRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Divine fire burst particles
    for (let spark = 0; spark < 16; spark++) {
      const sparkAngle = (time * 5 + spark * Math.PI * 2 / 16) % (Math.PI * 2);
      const sparkDist = size * (0.65 + commandPose * 0.5);
      const sparkX = x + Math.cos(sparkAngle) * sparkDist;
      const sparkY = y + Math.sin(sparkAngle) * sparkDist * 0.45;
      const sparkAlpha = commandPose * (0.8 + Math.sin(time * 10 + spark) * 0.2);
      
      ctx.fillStyle = spark % 3 === 0 
        ? `rgba(255, 220, 100, ${sparkAlpha})`
        : spark % 3 === 1
        ? `rgba(255, 150, 50, ${sparkAlpha})`
        : `rgba(220, 38, 38, ${sparkAlpha})`;
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Rising flame pillars
    for (let pillar = 0; pillar < 6; pillar++) {
      const pillarAngle = pillar * Math.PI / 3 + time * 2;
      const pillarDist = size * (0.5 + commandPose * 0.3);
      const pillarX = x + Math.cos(pillarAngle) * pillarDist;
      const pillarY = y + Math.sin(pillarAngle) * pillarDist * 0.45;
      const pillarHeight = size * 0.2 * commandPose;
      
      ctx.fillStyle = `rgba(255, 100, 50, ${commandPose * 0.6})`;
      ctx.shadowColor = "#ff4400";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(pillarX - size * 0.02, pillarY);
      ctx.lineTo(pillarX, pillarY - pillarHeight);
      ctx.lineTo(pillarX + size * 0.02, pillarY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}


