import type { Position } from "../../types";
import { resolveWeaponRotation } from "./helpers";

export function drawEngineerHero(
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
  // SCI-FI ENGINEER - Advanced Tech Specialist with holographic displays and nano-tools
  const breathe = Math.sin(time * 2) * 1.5;
  const isAttacking = attackPhase > 0;
  const workAnimation = isAttacking ? Math.sin(attackPhase * Math.PI * 4) : 0;
  const toolSpark = isAttacking ? Math.sin(attackPhase * Math.PI * 8) : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const dataPulse = Math.sin(time * 5) * 0.5 + 0.5;
  const holoFlicker = Math.sin(time * 15) * 0.1 + 0.9;

  // === MULTI-LAYERED TECH AURA ===
  const auraBase = isAttacking ? 0.35 : 0.2;
  const auraPulse = 0.85 + Math.sin(time * 4) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x, y, size * (0.1 + layerOffset),
      x, y, size * (0.9 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.04) * auraPulse;
    auraGrad.addColorStop(0, `rgba(0, 200, 255, ${layerAlpha * 0.4})`);
    auraGrad.addColorStop(0.4, `rgba(100, 220, 255, ${layerAlpha * 0.3})`);
    auraGrad.addColorStop(0.7, `rgba(234, 179, 8, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(0, 200, 255, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (0.85 + layerOffset * 0.2), size * (0.55 + layerOffset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating data particles
  for (let p = 0; p < 12; p++) {
    const pAngle = (time * 2 + p * Math.PI * 2 / 12) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 3 + p * 0.8) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.45;
    const pAlpha = 0.5 + Math.sin(time * 6 + p * 0.7) * 0.3;
    ctx.fillStyle = p % 3 === 0 ? `rgba(0, 220, 255, ${pAlpha})` : p % 3 === 1 ? `rgba(234, 179, 8, ${pAlpha})` : `rgba(0, 255, 150, ${pAlpha})`;
    ctx.beginPath();
    ctx.rect(px - size * 0.01, py - size * 0.01, size * 0.02, size * 0.02);
    ctx.fill();
  }

  // === HOLOGRAPHIC CIRCUIT LINES ===
  ctx.strokeStyle = `rgba(0, 200, 255, ${0.3 + dataPulse * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  for (let circuit = 0; circuit < 6; circuit++) {
    const circuitAngle = circuit * Math.PI / 3 + time * 0.5;
    const circuitDist = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(circuitAngle) * circuitDist, y + Math.sin(circuitAngle) * circuitDist * 0.5);
    ctx.stroke();
    // Circuit node
    ctx.fillStyle = `rgba(0, 255, 200, ${0.5 + dataPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(circuitAngle) * circuitDist * 0.7, y + Math.sin(circuitAngle) * circuitDist * 0.35, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.48);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.45, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ADVANCED TECH BACKPACK ===
  // Main backpack body
  const backpackGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.2, x + size * 0.25, y + size * 0.3);
  backpackGrad.addColorStop(0, "#3a3a4a");
  backpackGrad.addColorStop(0.3, "#4a4a5a");
  backpackGrad.addColorStop(0.7, "#3a3a4a");
  backpackGrad.addColorStop(1, "#2a2a3a");
  ctx.fillStyle = backpackGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.24, y - size * 0.22, size * 0.48, size * 0.55, size * 0.06);
  ctx.fill();

  // Backpack border
  ctx.strokeStyle = "#5a5a6a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.24, y - size * 0.22, size * 0.48, size * 0.55, size * 0.06);
  ctx.stroke();

  // Tech panels on backpack
  ctx.fillStyle = "#2a2a3a";
  for (let panel = 0; panel < 4; panel++) {
    ctx.fillRect(x - size * 0.18, y - size * 0.15 + panel * size * 0.12, size * 0.36, size * 0.08);
    // Panel light strip
    const panelGlow = Math.sin(time * 4 + panel * 0.8) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(0, 200, 255, ${panelGlow})`;
    ctx.fillRect(x - size * 0.16, y - size * 0.14 + panel * size * 0.12, size * 0.32, size * 0.02);
    ctx.fillStyle = "#2a2a3a";
  }

  // Central reactor core
  const reactorGrad = ctx.createRadialGradient(x, y + size * 0.08, 0, x, y + size * 0.08, size * 0.1);
  reactorGrad.addColorStop(0, `rgba(0, 255, 200, ${0.8 + dataPulse * 0.2})`);
  reactorGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.6 + dataPulse * 0.2})`);
  reactorGrad.addColorStop(1, "rgba(0, 100, 150, 0.3)");
  ctx.fillStyle = reactorGrad;
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 10 * zoom * (0.7 + dataPulse * 0.3);
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Reactor ring
  ctx.strokeStyle = "#00ccff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08, size * 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Exhaust vents
  for (let vent = 0; vent < 3; vent++) {
    const ventX = x - size * 0.15 + vent * size * 0.15;
    ctx.fillStyle = "#1a1a2a";
    ctx.beginPath();
    ctx.ellipse(ventX, y + size * 0.28, size * 0.03, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vent glow when attacking
    if (isAttacking) {
      ctx.fillStyle = `rgba(255, 150, 50, ${attackIntensity * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(ventX, y + size * 0.28, size * 0.02, size * 0.01, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === ADVANCED EXOSUIT BODY ===
  const suitGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.4);
  suitGrad.addColorStop(0, "#3a4a30");
  suitGrad.addColorStop(0.2, "#5a6a40");
  suitGrad.addColorStop(0.5, "#7a8a50");
  suitGrad.addColorStop(0.8, "#5a6a40");
  suitGrad.addColorStop(1, "#3a4a30");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.48 + breathe);
  ctx.lineTo(x - size * 0.42, y - size * 0.1);
  ctx.lineTo(x - size * 0.3, y - size * 0.25);
  ctx.quadraticCurveTo(x, y - size * 0.32, x + size * 0.3, y - size * 0.25);
  ctx.lineTo(x + size * 0.42, y - size * 0.1);
  ctx.lineTo(x + size * 0.38, y + size * 0.48 + breathe);
  ctx.closePath();
  ctx.fill();

  // Suit border
  ctx.strokeStyle = "#2a3a20";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Armor panel lines
  ctx.strokeStyle = "#4a5a38";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.34, y - size * 0.05);
  ctx.lineTo(x + size * 0.34, y - size * 0.05);
  ctx.moveTo(x - size * 0.32, y + size * 0.15);
  ctx.lineTo(x + size * 0.32, y + size * 0.15);
  ctx.moveTo(x - size * 0.3, y + size * 0.35);
  ctx.lineTo(x + size * 0.3, y + size * 0.35);
  ctx.stroke();

  // Hi-vis orange safety strips (reflective)
  const stripGrad = ctx.createLinearGradient(x - size * 0.35, y, x - size * 0.25, y);
  stripGrad.addColorStop(0, "#cc4400");
  stripGrad.addColorStop(0.3, "#ff6600");
  stripGrad.addColorStop(0.5, "#ffaa44");
  stripGrad.addColorStop(0.7, "#ff6600");
  stripGrad.addColorStop(1, "#cc4400");
  ctx.fillStyle = stripGrad;
  ctx.fillRect(x - size * 0.35, y - size * 0.18, size * 0.1, size * 0.45);
  ctx.fillRect(x + size * 0.25, y - size * 0.18, size * 0.1, size * 0.45);

  // Reflective highlights on strips
  ctx.fillStyle = "rgba(255, 255, 200, 0.3)";
  ctx.fillRect(x - size * 0.34, y - size * 0.16, size * 0.03, size * 0.4);
  ctx.fillRect(x + size * 0.31, y - size * 0.16, size * 0.03, size * 0.4);

  // Chest status display
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(x - size * 0.12, y - size * 0.15, size * 0.24, size * 0.12);
  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size * 0.12, y - size * 0.15, size * 0.24, size * 0.12);

  // Display content (scrolling data)
  ctx.fillStyle = `rgba(0, 255, 200, ${0.6 + dataPulse * 0.3})`;
  for (let line = 0; line < 3; line++) {
    const lineY = y - size * 0.13 + line * size * 0.035;
    ctx.fillRect(x - size * 0.1, lineY, size * 0.08 + Math.sin(time * 3 + line) * size * 0.04, size * 0.015);
  }

  // === ADVANCED UTILITY BELT ===
  const beltGrad = ctx.createLinearGradient(x - size * 0.4, y + size * 0.18, x + size * 0.4, y + size * 0.18);
  beltGrad.addColorStop(0, "#3a3a3a");
  beltGrad.addColorStop(0.5, "#5a5a5a");
  beltGrad.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = beltGrad;
  ctx.fillRect(x - size * 0.4, y + size * 0.16, size * 0.8, size * 0.12);
  ctx.strokeStyle = "#6a6a6a";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size * 0.4, y + size * 0.16, size * 0.8, size * 0.12);

  // Belt pouches with tech details
  for (let pouch = 0; pouch < 4; pouch++) {
    const pouchX = x - size * 0.34 + pouch * size * 0.2;
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.roundRect(pouchX, y + size * 0.13, size * 0.14, size * 0.18, size * 0.02);
    ctx.fill();
    ctx.strokeStyle = "#4a4a4a";
    ctx.stroke();
    // Pouch status light
    ctx.fillStyle = pouch % 2 === 0 ? `rgba(0, 255, 150, ${0.5 + dataPulse * 0.3})` : `rgba(255, 200, 50, ${0.5 + dataPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(pouchX + size * 0.07, y + size * 0.16, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Belt buckle (tech)
  ctx.fillStyle = "#4a4a5a";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.06, y + size * 0.17, size * 0.12, size * 0.08, size * 0.01);
  ctx.fill();
  ctx.fillStyle = `rgba(234, 179, 8, ${0.6 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.21, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // === MECHANICAL ARMS WITH TECH TOOLS ===
  // Left arm (with gauntlet)
  const leftArmGrad = ctx.createRadialGradient(
    x - size * 0.42, y - size * 0.05 + workAnimation * size * 0.05, 0,
    x - size * 0.42, y - size * 0.05 + workAnimation * size * 0.05, size * 0.18
  );
  leftArmGrad.addColorStop(0, "#6a7a50");
  leftArmGrad.addColorStop(0.7, "#5a6a40");
  leftArmGrad.addColorStop(1, "#4a5a30");
  ctx.fillStyle = leftArmGrad;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42,
    y - size * 0.05 + workAnimation * size * 0.05,
    size * 0.14,
    size * 0.22,
    -0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Left gauntlet
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.48,
    y + size * 0.12 + workAnimation * size * 0.05,
    size * 0.1,
    size * 0.08,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Gauntlet lights
  ctx.fillStyle = `rgba(0, 200, 255, ${0.6 + dataPulse * 0.3})`;
  for (let light = 0; light < 3; light++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.52 + light * size * 0.04, y + size * 0.1 + workAnimation * size * 0.05, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // High-tech wrench tool
  const wrenchBaseAngle = -0.6 + workAnimation * 0.35;
  const wrenchAngle = resolveWeaponRotation(
    targetPos,
    x - size * 0.55,
    y + size * 0.15 + workAnimation * size * 0.05,
    wrenchBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.1 : 0.62
  );
  ctx.save();
  ctx.translate(x - size * 0.55, y + size * 0.15 + workAnimation * size * 0.05);
  ctx.rotate(wrenchAngle);

  // Wrench handle (metallic)
  const wrenchGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  wrenchGrad.addColorStop(0, "#5a5a5a");
  wrenchGrad.addColorStop(0.3, "#8a8a8a");
  wrenchGrad.addColorStop(0.7, "#8a8a8a");
  wrenchGrad.addColorStop(1, "#5a5a5a");
  ctx.fillStyle = wrenchGrad;
  ctx.fillRect(-size * 0.025, -size * 0.28, size * 0.05, size * 0.28);

  // Wrench head (adjustable)
  ctx.fillStyle = "#6a6a6a";
  ctx.beginPath();
  ctx.roundRect(-size * 0.07, -size * 0.32, size * 0.14, size * 0.08, size * 0.01);
  ctx.fill();
  // Adjustment mechanism
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(-size * 0.06, -size * 0.3, size * 0.04, size * 0.04);
  // Wrench jaw
  ctx.fillStyle = "#7a7a7a";
  ctx.fillRect(-size * 0.06, -size * 0.34, size * 0.12, size * 0.02);

  // Power indicator on wrench
  ctx.fillStyle = `rgba(0, 255, 150, ${0.5 + dataPulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.15, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm (with plasma tool)
  const rightArmGrad = ctx.createRadialGradient(
    x + size * 0.42, y - size * 0.05 - workAnimation * size * 0.05, 0,
    x + size * 0.42, y - size * 0.05 - workAnimation * size * 0.05, size * 0.18
  );
  rightArmGrad.addColorStop(0, "#6a7a50");
  rightArmGrad.addColorStop(0.7, "#5a6a40");
  rightArmGrad.addColorStop(1, "#4a5a30");
  ctx.fillStyle = rightArmGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.42,
    y - size * 0.05 - workAnimation * size * 0.05,
    size * 0.14,
    size * 0.22,
    0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Right gauntlet
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.48,
    y + size * 0.12 - workAnimation * size * 0.05,
    size * 0.1,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Plasma welding/cutting tool
  const plasmaBaseAngle = 0.4 - workAnimation * 0.25;
  const plasmaAngle = resolveWeaponRotation(
    targetPos,
    x + size * 0.55,
    y + size * 0.1 - workAnimation * size * 0.05,
    plasmaBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.3 : 0.72
  );
  ctx.save();
  ctx.translate(x + size * 0.55, y + size * 0.1 - workAnimation * size * 0.05);
  ctx.rotate(plasmaAngle);

  // Tool body
  const toolGrad = ctx.createLinearGradient(-size * 0.025, 0, size * 0.025, 0);
  toolGrad.addColorStop(0, "#3a3a4a");
  toolGrad.addColorStop(0.5, "#5a5a6a");
  toolGrad.addColorStop(1, "#3a3a4a");
  ctx.fillStyle = toolGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.03, -size * 0.25, size * 0.06, size * 0.25, size * 0.01);
  ctx.fill();

  // Tool grip
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.035, -size * 0.1, size * 0.07, size * 0.12);

  // Tool emitter head
  ctx.fillStyle = "#4a4a5a";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.27, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plasma/welding effect
  if (isAttacking || Math.sin(time * 3) > 0.5) {
    const sparkIntensity = isAttacking ? Math.abs(toolSpark) : 0.4 + Math.sin(time * 8) * 0.3;
    
    // Plasma glow
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 15 * zoom * sparkIntensity;
    ctx.fillStyle = `rgba(0, 255, 255, ${sparkIntensity})`;
    ctx.beginPath();
    ctx.arc(0, -size * 0.3, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Plasma beam
    ctx.fillStyle = `rgba(100, 255, 255, ${sparkIntensity * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, -size * 0.3);
    ctx.lineTo(0, -size * 0.4 - sparkIntensity * size * 0.1);
    ctx.lineTo(size * 0.01, -size * 0.3);
    ctx.closePath();
    ctx.fill();

    // Spark particles
    for (let spark = 0; spark < 6; spark++) {
      const sparkAngle = time * 15 + spark * Math.PI / 3;
      const sparkDist = size * 0.05 + Math.sin(time * 20 + spark) * size * 0.03;
      ctx.fillStyle = `rgba(255, 200, 50, ${sparkIntensity * (0.5 + Math.sin(time * 10 + spark) * 0.3)})`;
      ctx.beginPath();
      ctx.arc(
        Math.cos(sparkAngle) * sparkDist,
        -size * 0.32 + Math.sin(sparkAngle) * sparkDist * 0.5,
        size * 0.008,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // === SCI-FI HELMET HEAD ===
  const headY = y - size * 0.45;

  // Face/skin
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.02, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Advanced hard hat/helmet
  const hatGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.12, 0, x, headY - size * 0.08, size * 0.32);
  hatGrad.addColorStop(0, "#ffcc22");
  hatGrad.addColorStop(0.5, "#eab308");
  hatGrad.addColorStop(1, "#aa8008");
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.1, size * 0.3, size * 0.18, 0, 0, Math.PI);
  ctx.fill();

  // Helmet ridge
  ctx.fillStyle = "#ca9a08";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY - size * 0.28);
  ctx.lineTo(x - size * 0.03, headY - size * 0.1);
  ctx.lineTo(x + size * 0.03, headY - size * 0.1);
  ctx.lineTo(x + size * 0.05, headY - size * 0.28);
  ctx.closePath();
  ctx.fill();

  // Helmet brim (tech enhanced)
  const brimGrad = ctx.createLinearGradient(x - size * 0.35, headY - size * 0.02, x + size * 0.35, headY - size * 0.02);
  brimGrad.addColorStop(0, "#9a7a08");
  brimGrad.addColorStop(0.3, "#ca9a08");
  brimGrad.addColorStop(0.7, "#ca9a08");
  brimGrad.addColorStop(1, "#9a7a08");
  ctx.fillStyle = brimGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.02, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helmet border
  ctx.strokeStyle = "#8a6a08";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.02, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Main headlamp
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 12 * zoom * (0.6 + dataPulse * 0.4);
  ctx.fillStyle = `rgba(255, 255, 220, ${0.7 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Headlamp housing
  ctx.fillStyle = "#5a5a5a";
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Side indicator lights
  ctx.fillStyle = `rgba(0, 255, 150, ${0.6 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.2, headY - size * 0.08, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${0.6 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.2, headY - size * 0.08, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // === ADVANCED HUD GOGGLES ===
  // Goggle frame
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.22, headY - size * 0.02, size * 0.44, size * 0.1, size * 0.02);
  ctx.fill();
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left lens (with HUD display)
  const leftLensGrad = ctx.createLinearGradient(x - size * 0.2, headY, x - size * 0.02, headY + size * 0.06);
  leftLensGrad.addColorStop(0, `rgba(0, 150, 255, ${0.6 * holoFlicker})`);
  leftLensGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.7 * holoFlicker})`);
  leftLensGrad.addColorStop(1, `rgba(0, 100, 200, ${0.5 * holoFlicker})`);
  ctx.fillStyle = leftLensGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.2, headY, size * 0.17, size * 0.07, size * 0.01);
  ctx.fill();

  // Left lens HUD elements
  ctx.strokeStyle = `rgba(0, 255, 200, ${0.5 * holoFlicker})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY + size * 0.02);
  ctx.lineTo(x - size * 0.08, headY + size * 0.02);
  ctx.moveTo(x - size * 0.18, headY + size * 0.04);
  ctx.lineTo(x - size * 0.12, headY + size * 0.04);
  ctx.stroke();

  // Right lens
  const rightLensGrad = ctx.createLinearGradient(x + size * 0.02, headY, x + size * 0.2, headY + size * 0.06);
  rightLensGrad.addColorStop(0, `rgba(0, 100, 200, ${0.5 * holoFlicker})`);
  rightLensGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.7 * holoFlicker})`);
  rightLensGrad.addColorStop(1, `rgba(0, 150, 255, ${0.6 * holoFlicker})`);
  ctx.fillStyle = rightLensGrad;
  ctx.beginPath();
  ctx.roundRect(x + size * 0.03, headY, size * 0.17, size * 0.07, size * 0.01);
  ctx.fill();

  // Right lens targeting reticle
  ctx.strokeStyle = `rgba(255, 100, 50, ${0.6 * holoFlicker})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x + size * 0.115, headY + size * 0.035, size * 0.02, 0, Math.PI * 2);
  ctx.moveTo(x + size * 0.095, headY + size * 0.035);
  ctx.lineTo(x + size * 0.135, headY + size * 0.035);
  ctx.moveTo(x + size * 0.115, headY + size * 0.015);
  ctx.lineTo(x + size * 0.115, headY + size * 0.055);
  ctx.stroke();

  // Nose bridge
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(x - size * 0.02, headY + size * 0.01, size * 0.04, size * 0.04);

  // Mouth (determined expression)
  ctx.fillStyle = "#8b5030";
  ctx.beginPath();
  ctx.arc(x, headY + size * 0.12, size * 0.045, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Chin stubble dots
  ctx.fillStyle = "#9a7050";
  for (let stubble = 0; stubble < 5; stubble++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.04 + stubble * size * 0.02, headY + size * 0.15, size * 0.004, 0, Math.PI * 2);
    ctx.fill();
  }

  // === FLOATING HOLOGRAPHIC GEARS ===
  for (let g = 0; g < 5; g++) {
    const gearAngle = time * 1.8 + g * Math.PI * 0.4;
    const gearDist = size * 0.62;
    const gearX = x + Math.cos(gearAngle) * gearDist;
    const gearY = y - size * 0.05 + Math.sin(gearAngle) * gearDist * 0.4;
    const gearSize = size * (0.06 + Math.sin(time * 2 + g) * 0.015);
    const gearAlpha = 0.4 + Math.sin(time * 3 + g * 0.8) * 0.2;

    // Gear glow
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 5 * zoom;

    ctx.strokeStyle = `rgba(0, 200, 255, ${gearAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    for (let tooth = 0; tooth < 8; tooth++) {
      const tAngle = (tooth / 8) * Math.PI * 2 + time * (3 + g * 0.3);
      const innerR = gearSize * 0.5;
      const outerR = gearSize;
      if (tooth === 0) {
        ctx.moveTo(gearX + Math.cos(tAngle) * outerR, gearY + Math.sin(tAngle) * outerR * 0.5);
      } else {
        ctx.lineTo(gearX + Math.cos(tAngle) * outerR, gearY + Math.sin(tAngle) * outerR * 0.5);
      }
      ctx.lineTo(gearX + Math.cos(tAngle + Math.PI / 8) * innerR, gearY + Math.sin(tAngle + Math.PI / 8) * innerR * 0.5);
    }
    ctx.closePath();
    ctx.stroke();

    // Gear center
    ctx.fillStyle = `rgba(0, 255, 200, ${gearAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(gearX, gearY, gearSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === HOLOGRAPHIC DATA PROJECTION (when attacking) ===
  if (isAttacking) {
    const holoAlpha = attackIntensity * 0.7;
    
    // Holographic schematic lines
    ctx.strokeStyle = `rgba(0, 255, 200, ${holoAlpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Turret schematic outline
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.7);
    ctx.lineTo(x - size * 0.3, y - size * 0.9);
    ctx.lineTo(x + size * 0.3, y - size * 0.9);
    ctx.lineTo(x + size * 0.3, y - size * 0.7);
    ctx.lineTo(x - size * 0.3, y - size * 0.7);
    ctx.stroke();
    
    // Turret barrel
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.9);
    ctx.lineTo(x, y - size * 1.1);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Deployment indicator rings
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = size * (0.15 + ring * 0.1 + attackIntensity * 0.1);
      ctx.strokeStyle = `rgba(234, 179, 8, ${holoAlpha * (1 - ring * 0.25)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.6, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // "DEPLOYING" text effect
    ctx.fillStyle = `rgba(0, 255, 200, ${holoAlpha * holoFlicker})`;
    ctx.font = `bold ${8 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("DEPLOYING", x, y - size * 0.75);
  }

  // === TECH ENERGY AURA ===
  const energyGlow = 0.25 + Math.sin(time * 4) * 0.1 + attackIntensity * 0.25;
  ctx.strokeStyle = `rgba(0, 200, 255, ${energyGlow})`;
  ctx.lineWidth = (1.5 + attackIntensity * 1.5) * zoom;
  ctx.setLineDash([4 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
