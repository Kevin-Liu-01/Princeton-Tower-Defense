// Princeton Tower Defense - Troop Rendering Module
// Renders all troop types spawned by stations

import type { Troop, Position } from "../../types";
import { TROOP_DATA } from "../../constants";
import { worldToScreen } from "../../utils";

// ============================================================================
// TROOP RENDERING - Epic detailed troop sprites
// ============================================================================
export function renderTroop(
  ctx: CanvasRenderingContext2D,
  troop: Troop,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  targetPos?: Position
) {
  const screenPos = worldToScreen(
    troop.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const troopType = troop.type || "footsoldier";
  const tData = TROOP_DATA[troopType];
  const time = Date.now() / 1000;

  // Check for large troops
  const isLargeTroop =
    troop.type === "elite" ||
    troop.type === "centaur" ||
    troop.type === "cavalry" ||
    troop.type === "knight" ||
    troop.type === "turret";
  const sizeScale = isLargeTroop ? 1.6 : 1;

  // Selection indicator - scaled for large troops
  if (troop.selected) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 2 * zoom,
      28 * zoom * sizeScale,
      14 * zoom * sizeScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow - scale based on troop type
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    15 * zoom * sizeScale,
    7 * zoom * sizeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Scale up level 3 elite troops and level 4 mounted troops
  let baseSize = 22;
  if (troop.type === "elite") baseSize = 31; // Level 3 Elite Guard - larger
  else if (troop.type === "centaur") baseSize = 32; // Level 4 Centaur - mounted
  else if (troop.type === "cavalry")
    baseSize = 32; // Level 4 Royal Cavalry - mounted
  else if (troop.type === "knight") baseSize = 32; // Level 4 Knight - mounted
  else if (troop.type === "turret") baseSize = 34; // Engineer's turret - medium-large
  const size = baseSize * zoom;
  const attackPhase = (troop.attackAnim && troop.attackAnim > 0) ? troop.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.15 : 1;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific troop type with attack animation
  drawTroopSprite(
    ctx,
    0,
    0,
    size,
    troopType,
    tData.color,
    time,
    zoom,
    attackPhase
  );

  ctx.restore();

  // HEALING AURA EFFECT - Beautiful emerald healing visualization
  if (troop.healFlash && Date.now() - troop.healFlash < 1000) {
    const healProgress = (Date.now() - troop.healFlash) / 1000; // 0 to 1
    const healAlpha = 1 - healProgress; // Fade out
    const drawY = screenPos.y - size / 2;

    // Healing glow base - layered green aura
    const glowGrad = ctx.createRadialGradient(
      screenPos.x, drawY, 0,
      screenPos.x, drawY, size * 1.2
    );
    glowGrad.addColorStop(0, `rgba(74, 222, 128, ${0.4 * healAlpha})`);
    glowGrad.addColorStop(0.4, `rgba(34, 197, 94, ${0.25 * healAlpha})`);
    glowGrad.addColorStop(0.7, `rgba(22, 163, 74, ${0.1 * healAlpha})`);
    glowGrad.addColorStop(1, "rgba(20, 83, 45, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, size * 0.9, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = `rgba(134, 239, 172, ${0.35 * healAlpha})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating healing ring
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(time * 2);
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.8 * healAlpha})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([6 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.7, size * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4 Healing cross symbols orbiting
    const crossRotation = time * 1.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + crossRotation;
      const dist = size * 0.6;
      const cx = screenPos.x + Math.cos(angle) * dist;
      const cy = screenPos.y + Math.sin(angle) * dist * 0.5;
      const crossSize = 5 * zoom * healAlpha;

      // Healing cross with glow
      ctx.fillStyle = `rgba(187, 247, 208, ${0.95 * healAlpha})`;
      ctx.fillRect(cx - crossSize * 0.3, cy - crossSize, crossSize * 0.6, crossSize * 2);
      ctx.fillRect(cx - crossSize, cy - crossSize * 0.3, crossSize * 2, crossSize * 0.6);

      // Cross outline
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.7 * healAlpha})`;
      ctx.lineWidth = 1 * zoom;
      ctx.strokeRect(cx - crossSize * 0.3, cy - crossSize, crossSize * 0.6, crossSize * 2);
      ctx.strokeRect(cx - crossSize, cy - crossSize * 0.3, crossSize * 2, crossSize * 0.6);
    }

    // Rising leaf/nature particles
    for (let i = 0; i < 6; i++) {
      const particlePhase = (time * 2 + i * 0.35) % 1;
      const px = screenPos.x + Math.sin(time * 3 + i * 1.8) * size * 0.4;
      const py = screenPos.y - particlePhase * size * 1.2;
      const particleAlpha = (1 - particlePhase) * healAlpha;
      const particleSize = (2 + Math.sin(i * 0.5) * 1) * zoom;

      // Leaf-shaped particle
      ctx.fillStyle = `rgba(134, 239, 172, ${particleAlpha * 0.9})`;
      ctx.beginPath();
      ctx.ellipse(px, py, particleSize, particleSize * 1.8, Math.PI / 4 + i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sparkle burst effect at the start
    if (healProgress < 0.3) {
      const burstAlpha = (0.3 - healProgress) / 0.3;
      for (let i = 0; i < 8; i++) {
        const sparkleAngle = (i / 8) * Math.PI * 2;
        const sparkleDist = size * 0.3 + healProgress * size * 1.5;
        const sx = screenPos.x + Math.cos(sparkleAngle) * sparkleDist;
        const sy = screenPos.y + Math.sin(sparkleAngle) * sparkleDist * 0.5;

        ctx.fillStyle = `rgba(220, 252, 231, ${burstAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 * zoom * burstAlpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // HP Bar - scaled for larger troops
  if (troop.hp < troop.maxHp) {
    const barWidth = 30 * zoom * sizeScale;
    const barHeight = 4 * zoom;
    const barY = screenPos.y - size - 8 * zoom;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(
      screenPos.x - barWidth / 2 - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2
    );
    ctx.fillStyle = "#333";
    ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);

    const hpPercent = troop.hp / troop.maxHp;
    ctx.fillStyle =
      hpPercent > 0.5 ? "#4ade80" : hpPercent > 0.25 ? "#fbbf24" : "#ef4444";
    ctx.fillRect(
      screenPos.x - barWidth / 2,
      barY,
      barWidth * hpPercent,
      barHeight
    );
  }
}

function drawTroopSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  switch (type) {
    case "soldier":
    case "footsoldier":
      drawSoldierTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "cavalry":
      drawCavalryTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "centaur":
      drawCentaurTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "elite":
      drawEliteTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "knight":
    case "armored":
      drawKnightTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "turret":
      drawTurretTroop(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    default:
      drawDefaultTroop(ctx, x, y, size, color, time, zoom, attackPhase);
  }
}

function drawSoldierTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Elite Princeton Soldier - Roman Legionnaire style with epic attack animations
  const stance = Math.sin(time * 4) * 1.5;
  const breathe = Math.sin(time * 2) * 0.5;
  const footTap = Math.abs(Math.sin(time * 3)) * 1;

  // Attack animation calculations
  const isAttacking = attackPhase > 0;
  const attackSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.5
    : 0;
  const attackLunge = isAttacking
    ? Math.sin(attackPhase * Math.PI) * size * 0.15
    : 0;
  const bodyTwist = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.2 : 0;

  ctx.save();
  ctx.translate(attackLunge * 0.5, 0);
  ctx.rotate(bodyTwist);

  // === LEGS (animated idle stance, spread during attack) ===
  const legSpread = isAttacking ? size * 0.05 : 0;
  ctx.fillStyle = "#1a1a1a";
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.1 - legSpread, y + size * 0.35);
  ctx.rotate(-0.05 + footTap * 0.02 - (isAttacking ? 0.15 : 0));
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.08, size * 0.18, size * 0.16, size * 0.08);
  ctx.restore();
  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.1 + legSpread, y + size * 0.35);
  ctx.rotate(0.05 - footTap * 0.02 + (isAttacking ? 0.15 : 0));
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.08, size * 0.18, size * 0.16, size * 0.08);
  ctx.restore();

  // === BODY (armored torso with Princeton orange) ===
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.38);
  ctx.lineTo(x - size * 0.25, y - size * 0.05);
  ctx.lineTo(x + size * 0.25, y - size * 0.05);
  ctx.lineTo(x + size * 0.22, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  const chestGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y,
    x + size * 0.2,
    y
  );
  chestGrad.addColorStop(0, "#cc5500");
  chestGrad.addColorStop(0.3, "#ff6600");
  chestGrad.addColorStop(0.7, "#ff6600");
  chestGrad.addColorStop(1, "#cc5500");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.23, y - size * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + breathe,
    x + size * 0.23,
    y - size * 0.08 + breathe
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.1 + breathe);
  ctx.lineTo(x, y + size * 0.2 + breathe);
  ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${8 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.1 + breathe);

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.2, y + size * 0.25, size * 0.4, size * 0.06);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x - size * 0.04, y + size * 0.26, size * 0.08, size * 0.04);

  // === SHIELD ARM (thrusts forward during attack) ===
  const shieldX = x - size * 0.38 + (isAttacking ? attackLunge * 0.8 : 0);
  const shieldY = y + size * 0.1 - (isAttacking ? size * 0.1 * attackSwing : 0);

  ctx.fillStyle = "#ffe0bd";
  ctx.save();
  ctx.translate(x - size * 0.28, y + size * 0.05);
  ctx.rotate(-0.3 - (isAttacking ? 0.4 : 0));
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.restore();

  // === SHIELD (moves forward and tilts during attack) ===
  ctx.save();
  ctx.translate(shieldX, shieldY);
  ctx.rotate(isAttacking ? -0.3 - attackSwing * 0.3 : -0.2);
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.18, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.15, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Shield spike for attack
  if (isAttacking) {
    ctx.fillStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.06);
    ctx.lineTo(-size * 0.02, 0);
    ctx.lineTo(size * 0.02, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === SPEAR ARM (dramatic thrust during attack) ===
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.05);
  const armSwing = isAttacking ? -1.2 + attackPhase * 2.4 : 0.2 + stance * 0.02;
  ctx.rotate(armSwing);
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.restore();

  // === SPEAR (thrusting attack animation) ===
  ctx.save();
  const spearAngle = isAttacking
    ? -0.8 + attackPhase * 1.6
    : -0.15 + stance * 0.03;
  const spearX = x + size * 0.38 + (isAttacking ? attackLunge * 1.5 : 0);
  const spearY =
    y - size * 0.1 - (isAttacking ? size * 0.2 * (1 - attackPhase) : 0);
  ctx.translate(spearX, spearY);
  ctx.rotate(spearAngle);

  const shaftGrad = ctx.createLinearGradient(-size * 0.02, 0, size * 0.02, 0);
  shaftGrad.addColorStop(0, "#5a3a1a");
  shaftGrad.addColorStop(0.5, "#7b5030");
  shaftGrad.addColorStop(1, "#5a3a1a");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.025, -size * 0.55, size * 0.05, size * 0.7);

  const headGrad = ctx.createLinearGradient(
    -size * 0.05,
    -size * 0.65,
    size * 0.05,
    -size * 0.55
  );
  headGrad.addColorStop(0, "#e0e0e0");
  headGrad.addColorStop(0.5, "#ffffff");
  headGrad.addColorStop(1, "#a0a0a0");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.7);
  ctx.lineTo(-size * 0.05, -size * 0.55);
  ctx.lineTo(-size * 0.02, -size * 0.53);
  ctx.lineTo(size * 0.02, -size * 0.53);
  ctx.lineTo(size * 0.05, -size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Spear glint (more intense during attack)
  ctx.fillStyle = isAttacking ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.ellipse(
    0,
    -size * 0.62,
    size * (isAttacking ? 0.025 : 0.015),
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Attack trail effect
  if (isAttacking && attackPhase < 0.5) {
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.8 - attackPhase * 1.6})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.7);
    ctx.lineTo(0, -size * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  // === HEAD ===
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(x - size * 0.06, y - size * 0.2, size * 0.12, size * 0.1);
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // === HELMET ===
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.42,
    size * 0.18,
    size * 0.12,
    0,
    Math.PI,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.25);
  ctx.lineTo(x - size * 0.12, y - size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.35);
  ctx.lineTo(x + size * 0.2, y - size * 0.25);
  ctx.lineTo(x + size * 0.12, y - size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8a8a9a";
  ctx.fillRect(x - size * 0.02, y - size * 0.42, size * 0.04, size * 0.15);

  // Epic orange plume (more dynamic during attack)
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  const plumeWave = Math.sin(time * 6) + (isAttacking ? attackSwing * 2 : 0);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const px = x + (t - 0.5) * size * 0.25 + plumeWave * 2 * (1 - t);
    const py =
      y - size * 0.52 - t * size * 0.35 - Math.sin(t * Math.PI) * size * 0.12;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 7; i >= 0; i--) {
    const t = i / 7;
    const px = x + (t - 0.5) * size * 0.25 + plumeWave * 2 * (1 - t);
    const py =
      y - size * 0.52 - t * size * 0.3 - Math.sin(t * Math.PI) * size * 0.08;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff8833";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const px = x + (t - 0.5) * size * 0.15 + plumeWave * 1.5 * (1 - t);
    const py =
      y - size * 0.55 - t * size * 0.28 - Math.sin(t * Math.PI) * size * 0.08;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 5; i >= 0; i--) {
    const t = i / 5;
    const px = x + (t - 0.5) * size * 0.15 + plumeWave * 1.5 * (1 - t);
    const py = y - size * 0.55 - t * size * 0.25;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // === FACE (battle cry during attack) ===
  ctx.fillStyle = "#4a3520";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.36,
    size * 0.03,
    size * (isAttacking ? 0.015 : 0.025),
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.36,
    size * 0.03,
    size * (isAttacking ? 0.015 : 0.025),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.055, y - size * 0.365, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.065, y - size * 0.365, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Battle cry mouth
  if (isAttacking) {
    ctx.fillStyle = "#4a2a1a";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.28,
      size * 0.04,
      size * 0.03 * (1 + attackPhase * 0.5),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    ctx.strokeStyle = "#8b6b5b";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, y - size * 0.28);
    ctx.lineTo(x + size * 0.04, y - size * 0.28);
    ctx.stroke();
  }

  // Aggressive eyebrows during attack
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1.5 * zoom;
  const browAnger = isAttacking ? 0.1 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * (0.4 - browAnger));
  ctx.lineTo(x - size * 0.03, y - size * (0.42 + browAnger));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * (0.4 - browAnger));
  ctx.lineTo(x + size * 0.03, y - size * (0.42 + browAnger));
  ctx.stroke();

  ctx.restore();
}

function drawCavalryTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ROYAL CAVALRY CHAMPION - Epic Knight of Princeton with Ornate Detail
  const gallop = Math.sin(time * 8) * 3;
  const legCycle = Math.sin(time * 8) * 0.35;
  const headBob = Math.sin(time * 8 + 0.5) * 2;
  const breathe = Math.sin(time * 2) * 0.3;
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Attack animation
  const isAttacking = attackPhase > 0;
  const lanceThrust = isAttacking ? Math.sin(attackPhase * Math.PI) * 2.5 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === MULTI-LAYERED ROYAL AURA ===
  const auraIntensity = isAttacking ? 0.65 : 0.4;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered aura for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
  const auraGrad = ctx.createRadialGradient(
      x, y + size * 0.1, size * (0.08 + layerOffset),
      x, y + size * 0.1, size * (0.9 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(224, 96, 0, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`);
    auraGrad.addColorStop(0.4, `rgba(255, 140, 40, ${auraIntensity * auraPulse * (0.3 - auraLayer * 0.08)})`);
    auraGrad.addColorStop(0.7, `rgba(200, 80, 0, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.04)})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
    ctx.ellipse(x, y + size * 0.15, size * (0.8 + layerOffset * 0.2), size * (0.52 + layerOffset * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  }

  // Floating royal rune particles
  for (let p = 0; p < 8; p++) {
    const pAngle = (time * 1.8 + p * Math.PI * 0.25) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.8) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.35;
    const pAlpha = 0.5 + Math.sin(time * 3.5 + p * 0.5) * 0.3;
    ctx.fillStyle = `rgba(255, 160, 40, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = `rgba(255, 220, 150, ${pAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack energy rings with spark trails
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(224, 96, 0, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x, y + size * 0.1,
        size * (0.45 + ringPhase * 0.45),
        size * (0.3 + ringPhase * 0.28),
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    // Spark particles during attack
    for (let sp = 0; sp < 6; sp++) {
      const spAngle = time * 8 + sp * Math.PI / 3;
      const spDist = size * 0.4 + attackIntensity * size * 0.3;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(255, 200, 100, ${attackIntensity * 0.7})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === MAJESTIC ROYAL WAR STEED ===
  // Shadow with depth
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.55, 0, x, y + size * 0.55, size * 0.5);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.52, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horse body with rich gradient
  const bodyGrad = ctx.createRadialGradient(
    x - size * 0.1, y + size * 0.05, 0,
    x, y + size * 0.15, size * 0.55
  );
  bodyGrad.addColorStop(0, "#4a3a2a");
  bodyGrad.addColorStop(0.3, "#3a2a1a");
  bodyGrad.addColorStop(0.6, "#2a1a0a");
  bodyGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.48, size * 0.31,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Muscular definition on horse body
  ctx.strokeStyle = "rgba(60, 40, 20, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, y + size * 0.15 + gallop * 0.15, size * 0.18, size * 0.12, -0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.15, y + size * 0.2 + gallop * 0.15, size * 0.2, size * 0.14, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // === ORNATE ROYAL BARDING (horse armor) ===
  // Base barding plate with gradient
  const bardingGrad = ctx.createLinearGradient(
    x - size * 0.4, y + size * 0.1,
    x + size * 0.4, y + size * 0.25
  );
  bardingGrad.addColorStop(0, "#3a3a42");
  bardingGrad.addColorStop(0.2, "#5a5a62");
  bardingGrad.addColorStop(0.5, "#6a6a72");
  bardingGrad.addColorStop(0.8, "#5a5a62");
  bardingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = bardingGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.44, size * 0.24,
    0, Math.PI * 0.65, Math.PI * 2.35
  );
  ctx.fill();

  // Barding edge highlights
  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.44, size * 0.24,
    0, Math.PI * 0.7, Math.PI * 2.3
  );
  ctx.stroke();

  // Orange trim on barding with double line
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.44, size * 0.24,
    0, Math.PI * 0.75, Math.PI * 2.25
  );
  ctx.stroke();
  ctx.strokeStyle = "#ff8030";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.16 + gallop * 0.15,
    size * 0.42, size * 0.22,
    0, Math.PI * 0.8, Math.PI * 2.2
  );
  ctx.stroke();

  // Engraved filigree patterns on barding
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  // Left swirl
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.15, x - size * 0.28, y + size * 0.18 + gallop * 0.15);
  ctx.quadraticCurveTo(x - size * 0.22, y + size * 0.22, x - size * 0.28, y + size * 0.28 + gallop * 0.15);
  ctx.stroke();
  // Right swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.06 + gallop * 0.15);
  ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.12, x + size * 0.22, y + size * 0.16 + gallop * 0.15);
  ctx.quadraticCurveTo(x + size * 0.16, y + size * 0.2, x + size * 0.22, y + size * 0.26 + gallop * 0.15);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate decorative medallions with gems
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 5 * zoom;
  for (let i = 0; i < 5; i++) {
    const medX = x - size * 0.28 + i * size * 0.14;
    const medY = y + size * 0.04 + gallop * 0.15 + Math.sin(i * 0.8) * size * 0.02;
    // Gold medallion base
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.032, 0, Math.PI * 2);
    ctx.fill();
    // Inner medallion detail
    ctx.fillStyle = "#dab32f";
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    // Center gem (alternating colors)
    ctx.fillStyle = i % 2 === 0 ? "#ff4400" : "#00aaff";
    ctx.shadowColor = i % 2 === 0 ? "#ff6600" : "#00ccff";
    ctx.shadowBlur = 4 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Saddle blanket visible edge
  ctx.fillStyle = "#1a0a3a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.02 + gallop * 0.15);
  ctx.lineTo(x - size * 0.2, y + size * 0.12 + gallop * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.14 + gallop * 0.15);
  ctx.lineTo(x + size * 0.12, y + size * 0.04 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Gold fringe on blanket
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.12 + gallop * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.14 + gallop * 0.15);
  ctx.stroke();

  // === HORSE LEGS (muscular with ornate armor) ===
  const legGrad = ctx.createLinearGradient(0, 0, 0, size * 0.35);
  legGrad.addColorStop(0, "#3a2a1a");
  legGrad.addColorStop(0.5, "#2a1a0a");
  legGrad.addColorStop(1, "#1a0a00");

  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.25, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 1.2);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  // Leg muscle highlight
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ornate armored greave with gradient
  const greaveGrad = ctx.createLinearGradient(-size * 0.055, 0, size * 0.055, 0);
  greaveGrad.addColorStop(0, "#4a4a52");
  greaveGrad.addColorStop(0.3, "#6a6a72");
  greaveGrad.addColorStop(0.7, "#6a6a72");
  greaveGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  // Greave engraving
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  // Orange trim
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  // Ornate golden hoof with glow
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.08, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 0.9);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.13, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 1.1);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.3, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 0.8);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === HORSE NECK AND HEAD ===
  // Neck with gradient
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.35, y + size * 0.1,
    x - size * 0.6, y - size * 0.1
  );
  neckGrad.addColorStop(0, "#3a2a1a");
  neckGrad.addColorStop(0.5, "#2a1a0a");
  neckGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.52, y - size * 0.18 + headBob * 0.5,
    x - size * 0.6, y - size * 0.06 + headBob
  );
  ctx.lineTo(x - size * 0.72, y - size * 0.03 + headBob);
  ctx.lineTo(x - size * 0.58, y + size * 0.06 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.42, y + size * 0.14 + gallop * 0.15,
    x - size * 0.28, y + size * 0.2 + gallop * 0.15
  );
  ctx.fill();

  // Neck armor plate (crinet)
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.02 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.48, y - size * 0.12 + headBob * 0.5,
    x - size * 0.54, y - size * 0.08 + headBob
  );
  ctx.lineTo(x - size * 0.5, y - size * 0.02 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.44, y + size * 0.06 + gallop * 0.15,
    x - size * 0.36, y + size * 0.08 + gallop * 0.15
  );
  ctx.closePath();
  ctx.fill();
  // Crinet gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // === ORNATE CHANFRON (head armor) ===
  // Base chanfron
  const chanfronGrad = ctx.createLinearGradient(
    x - size * 0.7, y - size * 0.05,
    x - size * 0.5, y - size * 0.15
  );
  chanfronGrad.addColorStop(0, "#4a4a52");
  chanfronGrad.addColorStop(0.5, "#6a6a72");
  chanfronGrad.addColorStop(1, "#5a5a62");
  ctx.fillStyle = chanfronGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.16 + headBob);
  ctx.lineTo(x - size * 0.72, y - size * 0.03 + headBob);
  ctx.lineTo(x - size * 0.6, y + size * 0.05 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.1 + headBob);
  ctx.closePath();
  ctx.fill();
  
  // Chanfron engravings
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.1 + headBob);
  ctx.quadraticCurveTo(x - size * 0.64, y - size * 0.06, x - size * 0.6, y - size * 0.02 + headBob);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Orange accent lines on chanfron
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.15 + headBob);
  ctx.lineTo(x - size * 0.68, y - size * 0.03 + headBob);
  ctx.stroke();

  // Elaborate golden crest with multiple spikes
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom;
  // Center spike
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.16 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.3 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.16 + headBob);
  ctx.closePath();
  ctx.fill();
  // Side spikes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.24 + headBob);
  ctx.lineTo(x - size * 0.56, y - size * 0.14 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.46, y - size * 0.22 + headBob);
  ctx.lineTo(x - size * 0.48, y - size * 0.14 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Chanfron gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.58, y - size * 0.08 + headBob, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Glowing orange eyes with inner fire
  ctx.fillStyle = "#d07000";
  ctx.shadowColor = "#ff6000";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.58, y - size * 0.02 + headBob, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  // Eye inner glow
  ctx.fillStyle = "#ff9030";
  ctx.beginPath();
  ctx.arc(x - size * 0.58, y - size * 0.02 + headBob, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.59, y - size * 0.025 + headBob, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Proud armored ears
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.16 + headBob);
  ctx.fill();
  // Ear armor tips
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.2 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.56, y - size * 0.2 + headBob);
  ctx.closePath();
  ctx.fill();

  // === FLOWING MANE WITH FIRE EFFECT ===
  // Base mane (dark)
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.46, y - size * 0.14 + headBob);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const maneX = x - size * 0.46 + t * size * 0.6;
    const maneWave = Math.sin(time * 8 + i * 0.6) * 5;
    const maneY = y - size * 0.28 + maneWave + gallop * (0.1 - t * 0.08) + t * size * 0.16;
    ctx.lineTo(maneX, maneY);
  }
  ctx.lineTo(x + size * 0.14, y - size * 0.04 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();

  // Mane highlight strands
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1.5;
  for (let strand = 0; strand < 5; strand++) {
    ctx.beginPath();
    const startX = x - size * 0.44 + strand * size * 0.1;
    ctx.moveTo(startX, y - size * 0.14 + headBob);
    const waveOffset = Math.sin(time * 8 + strand * 0.8) * 4;
    ctx.quadraticCurveTo(
      startX + size * 0.05 + waveOffset, y - size * 0.22,
      startX + size * 0.1 + waveOffset, y - size * 0.08 + gallop * 0.1
    );
    ctx.stroke();
  }

  // Orange flame tips on mane
  const maneGlow = 0.6 + Math.sin(time * 6) * 0.3;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const tipX = x - size * 0.42 + t * size * 0.56;
    const tipY = y - size * 0.32 + Math.sin(time * 8 + i * 0.7) * 5 + gallop * 0.08;
    // Outer glow
    ctx.fillStyle = `rgba(224, 96, 0, ${maneGlow * 0.5})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(255, 180, 80, ${maneGlow})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MAJESTIC TAIL WITH FIRE ===
  // Base tail
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 8 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.42, y + size * 0.12 + gallop * 0.15);
  const tailWave1 = Math.sin(time * 6) * 10;
  const tailWave2 = Math.sin(time * 6 + 1) * 12;
  ctx.quadraticCurveTo(
    x + size * 0.62 + tailWave1,
    y + size * 0.28,
    x + size * 0.58 + tailWave2,
    y + size * 0.52
  );
  ctx.stroke();

  // Tail highlight
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.42, y + size * 0.12 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.6 + tailWave1,
    y + size * 0.26,
    x + size * 0.56 + tailWave2,
    y + size * 0.48
  );
  ctx.stroke();

  // Fire tip on tail
  ctx.fillStyle = `rgba(224, 96, 0, ${maneGlow})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.58 + tailWave2, y + size * 0.52, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 180, 80, ${maneGlow})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.58 + tailWave2, y + size * 0.52, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // === ROYAL KNIGHT RIDER ===
  // Elaborate ornate armored body
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.17, y - size * 0.5,
    x + size * 0.17, y - size * 0.1
  );
  armorGrad.addColorStop(0, "#4a4a52");
  armorGrad.addColorStop(0.2, "#5a5a62");
  armorGrad.addColorStop(0.4, "#6a6a72");
  armorGrad.addColorStop(0.6, "#7a7a82");
  armorGrad.addColorStop(0.8, "#6a6a72");
  armorGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.lineTo(x - size * 0.18, y - size * 0.48 + gallop * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x, y - size * 0.56 + gallop * 0.08 + breathe,
    x + size * 0.18, y - size * 0.48 + gallop * 0.08 + breathe
  );
  ctx.lineTo(x + size * 0.16, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.1 + gallop * 0.15 + breathe);
  ctx.lineTo(x - size * 0.17, y - size * 0.46 + gallop * 0.08 + breathe);
  ctx.stroke();

  // Armor segment lines
  ctx.strokeStyle = "#3a3a42";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.2 + gallop * 0.12 + breathe);
  ctx.lineTo(x + size * 0.15, y - size * 0.2 + gallop * 0.12 + breathe);
  ctx.moveTo(x - size * 0.14, y - size * 0.32 + gallop * 0.1 + breathe);
  ctx.lineTo(x + size * 0.14, y - size * 0.32 + gallop * 0.1 + breathe);
  ctx.stroke();

  // Gold filigree on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.15 + gallop * 0.13 + breathe);
  ctx.quadraticCurveTo(x - size * 0.14, y - size * 0.22, x - size * 0.08, y - size * 0.26 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.15 + gallop * 0.13 + breathe);
  ctx.quadraticCurveTo(x + size * 0.14, y - size * 0.22, x + size * 0.08, y - size * 0.26 + breathe);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate orange tabard with layered design
  // Tabard shadow
  ctx.fillStyle = "#a04000";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.06 + gallop * 0.15);
  ctx.lineTo(x - size * 0.14, y - size * 0.4 + gallop * 0.1);
  ctx.lineTo(x + size * 0.14, y - size * 0.4 + gallop * 0.1);
  ctx.lineTo(x + size * 0.12, y - size * 0.06 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Main tabard
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.08 + gallop * 0.15);
  ctx.lineTo(x - size * 0.13, y - size * 0.38 + gallop * 0.1);
  ctx.lineTo(x + size * 0.13, y - size * 0.38 + gallop * 0.1);
  ctx.lineTo(x + size * 0.11, y - size * 0.08 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Double gold trim
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1 + gallop * 0.15);
  ctx.lineTo(x - size * 0.12, y - size * 0.36 + gallop * 0.1);
  ctx.lineTo(x + size * 0.12, y - size * 0.36 + gallop * 0.1);
  ctx.lineTo(x + size * 0.1, y - size * 0.1 + gallop * 0.15);
  ctx.closePath();
  ctx.stroke();

  // Embroidered Princeton "P" emblem with shadow
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `bold ${size * 0.14}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x + size * 0.005, y - size * 0.23 + gallop * 0.12);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", x, y - size * 0.24 + gallop * 0.12);

  // Layered pauldrons (shoulder armor)
  // Left pauldron
  ctx.save();
  ctx.translate(x - size * 0.18, y - size * 0.4 + gallop * 0.1 + breathe);
  const pauldronGradL = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradL.addColorStop(0, "#7a7a82");
  pauldronGradL.addColorStop(0.6, "#5a5a62");
  pauldronGradL.addColorStop(1, "#4a4a52");
  ctx.fillStyle = pauldronGradL;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Pauldron layers
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.03, size * 0.07, size * 0.045, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Gold trim and spike
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, -0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.lineTo(-size * 0.14, -size * 0.06);
  ctx.lineTo(-size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right pauldron
  ctx.save();
  ctx.translate(x + size * 0.18, y - size * 0.4 + gallop * 0.1 + breathe);
  const pauldronGradR = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradR.addColorStop(0, "#7a7a82");
  pauldronGradR.addColorStop(0.6, "#5a5a62");
  pauldronGradR.addColorStop(1, "#4a4a52");
  ctx.fillStyle = pauldronGradR;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.03, size * 0.07, size * 0.045, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.02);
  ctx.lineTo(size * 0.14, -size * 0.06);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === MAGNIFICENT GREAT HELM ===
  // Helm base with gradient
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.04, y - size * 0.64 + gallop * 0.08, size * 0.02,
    x, y - size * 0.58 + gallop * 0.08, size * 0.18
  );
  helmGrad.addColorStop(0, "#8a8a92");
  helmGrad.addColorStop(0.5, "#6a6a72");
  helmGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // Helm crest ridge
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.75 + gallop * 0.08);
  ctx.lineTo(x - size * 0.025, y - size * 0.55 + gallop * 0.08);
  ctx.lineTo(x + size * 0.025, y - size * 0.55 + gallop * 0.08);
  ctx.lineTo(x + size * 0.02, y - size * 0.75 + gallop * 0.08);
  ctx.closePath();
  ctx.fill();

  // Decorative gold rim with pattern
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.15, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.15, Math.PI * 1.3, Math.PI * 1.7);
  ctx.stroke();

  // Crown points on helm
  ctx.fillStyle = "#c9a227";
  for (let cp = 0; cp < 3; cp++) {
    const cpAngle = Math.PI * 1.25 + cp * Math.PI * 0.25;
    const cpX = x + Math.cos(cpAngle) * size * 0.17;
    const cpY = y - size * 0.58 + gallop * 0.08 + Math.sin(cpAngle) * size * 0.17;
    ctx.beginPath();
    ctx.moveTo(cpX, cpY);
    ctx.lineTo(cpX + Math.cos(cpAngle) * size * 0.04, cpY + Math.sin(cpAngle) * size * 0.04 - size * 0.02);
    ctx.lineTo(cpX + Math.cos(cpAngle + 0.25) * size * 0.02, cpY + Math.sin(cpAngle + 0.25) * size * 0.02);
    ctx.closePath();
    ctx.fill();
  }

  // Visor with detailed construction
  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(x - size * 0.13, y - size * 0.62 + gallop * 0.08, size * 0.26, size * 0.08);
  // Visor slits
  ctx.fillStyle = "#1a1a22";
  for (let slit = 0; slit < 3; slit++) {
  ctx.fillRect(
      x - size * 0.1 + slit * size * 0.07,
    y - size * 0.6 + gallop * 0.08,
      size * 0.04,
      size * 0.012
    );
  }
  // Orange glow through visor
  ctx.fillStyle = `rgba(224, 96, 0, ${0.7 + Math.sin(time * 4) * 0.25})`;
  ctx.shadowColor = "#ff6000";
  ctx.shadowBlur = 8 * zoom;
  ctx.fillRect(x - size * 0.11, y - size * 0.6 + gallop * 0.08, size * 0.22, size * 0.04);
  ctx.shadowBlur = 0;
  // Visor breaths (air holes)
  ctx.fillStyle = "#1a1a22";
  for (let hole = 0; hole < 4; hole++) {
  ctx.beginPath();
    ctx.arc(x - size * 0.08 + hole * size * 0.05, y - size * 0.54 + gallop * 0.08, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central helm gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.75 + gallop * 0.08, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === MAGNIFICENT MULTI-LAYERED PLUME ===
  const plumeWave = Math.sin(time * 5) * 3;
  const plumeWave2 = Math.sin(time * 5.5 + 0.5) * 2;

  // Plume shadow layer
  ctx.fillStyle = "#a04000";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.72 + gallop * 0.08);
  for (let i = 0; i < 7; i++) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.05 + i * 0.018) + Math.sin(time * 7 + i * 0.8) * 2.5;
    ctx.lineTo(x - pW + plumeWave + size * 0.02, pY);
  }
  for (let i = 6; i >= 0; i--) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.05 + i * 0.018) + Math.sin(time * 7 + i * 0.8) * 2.5;
    ctx.lineTo(x + pW + plumeWave + size * 0.02, pY);
  }
  ctx.closePath();
  ctx.fill();

  // Main plume
  const plumeGrad = ctx.createLinearGradient(x, y - size * 0.72, x, y - size * 1.0);
  plumeGrad.addColorStop(0, "#e06000");
  plumeGrad.addColorStop(0.3, "#ff7020");
  plumeGrad.addColorStop(0.7, "#e06000");
  plumeGrad.addColorStop(1, "#c04000");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72 + gallop * 0.08);
  for (let i = 0; i < 7; i++) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.045 + i * 0.016) + Math.sin(time * 7 + i * 0.8) * 2;
    ctx.lineTo(x - pW + plumeWave, pY);
  }
  for (let i = 6; i >= 0; i--) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.045 + i * 0.016) + Math.sin(time * 7 + i * 0.8) * 2;
    ctx.lineTo(x + pW + plumeWave, pY);
  }
  ctx.closePath();
  ctx.fill();

  // Plume feather highlights
  ctx.strokeStyle = "#ff9040";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  for (let feather = 0; feather < 5; feather++) {
    const fOffset = (feather - 2) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(x + fOffset, y - size * 0.74 + gallop * 0.08);
    const fWave = Math.sin(time * 7 + feather * 0.6) * 2;
    ctx.quadraticCurveTo(
      x + fOffset + fWave, y - size * 0.88,
      x + fOffset + plumeWave * 0.5, y - size * 1.0 + gallop * 0.08
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Secondary smaller plume
  ctx.fillStyle = "#ff8030";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.7 + gallop * 0.08);
  for (let i = 0; i < 4; i++) {
    const pY = y - size * 0.7 - i * size * 0.035 + gallop * 0.08;
    const pW = size * (0.03 + i * 0.01) + Math.sin(time * 8 + i) * 1.5;
    ctx.lineTo(x - size * 0.06 - pW + plumeWave2, pY);
  }
  for (let i = 3; i >= 0; i--) {
    const pY = y - size * 0.7 - i * size * 0.035 + gallop * 0.08;
    const pW = size * (0.03 + i * 0.01) + Math.sin(time * 8 + i) * 1.5;
    ctx.lineTo(x - size * 0.06 + pW + plumeWave2, pY);
  }
  ctx.closePath();
  ctx.fill();

  // === ORNATE ROYAL LANCE ===
  ctx.save();
  const lanceAngle = isAttacking ? -0.35 - lanceThrust * 0.35 : -0.35;
  const lanceLunge = isAttacking ? size * 0.32 * Math.sin(attackPhase * Math.PI) : 0;
  ctx.translate(
    x + size * 0.26 + lanceLunge * 0.5,
    y - size * 0.32 + gallop * 0.12 - lanceLunge * 0.3
  );
  ctx.rotate(lanceAngle);

  // Ornate lance shaft with wood grain gradient
  const lanceGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  lanceGrad.addColorStop(0, "#4a2a10");
  lanceGrad.addColorStop(0.2, "#6a4a2a");
  lanceGrad.addColorStop(0.5, "#8a6a4a");
  lanceGrad.addColorStop(0.8, "#6a4a2a");
  lanceGrad.addColorStop(1, "#4a2a10");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.04, -size * 0.85, size * 0.08, size * 1.0);

  // Spiral leather wrapping
  ctx.strokeStyle = "#3a1a0a";
  ctx.lineWidth = 1.5;
  for (let wrap = 0; wrap < 8; wrap++) {
    const wrapY = -size * 0.15 + wrap * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, wrapY);
    ctx.lineTo(size * 0.04, wrapY + size * 0.04);
    ctx.stroke();
  }

  // Ornate gold bands on shaft with gems
  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 4; i++) {
    const bandY = -size * 0.2 - i * size * 0.2;
    ctx.fillRect(-size * 0.045, bandY, size * 0.09, size * 0.04);
    // Band engraving
    ctx.strokeStyle = "#a08020";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, bandY + size * 0.02);
    ctx.lineTo(size * 0.03, bandY + size * 0.02);
    ctx.stroke();
    // Band gem
    if (i < 3) {
      ctx.fillStyle = "#ff4400";
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(0, bandY + size * 0.02, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#c9a227";
    }
  }

  // Elaborate gleaming lance tip
  const tipGrad = ctx.createLinearGradient(-size * 0.08, -size * 0.85, size * 0.08, -size * 0.85);
  tipGrad.addColorStop(0, "#b0b0b0");
  tipGrad.addColorStop(0.3, "#e0e0e0");
  tipGrad.addColorStop(0.5, "#f0f0f0");
  tipGrad.addColorStop(0.7, "#e0e0e0");
  tipGrad.addColorStop(1, "#b0b0b0");
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.08);
  ctx.lineTo(-size * 0.07, -size * 0.85);
  ctx.lineTo(size * 0.07, -size * 0.85);
  ctx.closePath();
  ctx.fill();

  // Lance tip edge highlight
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.06);
  ctx.lineTo(-size * 0.05, -size * 0.86);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold inlay pattern on tip
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.02);
  ctx.lineTo(0, -size * 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.95);
  ctx.lineTo(size * 0.025, -size * 0.95);
  ctx.stroke();

  // Ornate coronet below tip
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.85);
  ctx.lineTo(-size * 0.06, -size * 0.88);
  ctx.lineTo(size * 0.06, -size * 0.88);
  ctx.lineTo(size * 0.08, -size * 0.85);
  ctx.closePath();
  ctx.fill();

  // Orange energy during attack
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const fireIntensity = 1 - Math.abs(attackPhase - 0.5) * 2.5;
    // Outer flame
    ctx.fillStyle = `rgba(224, 96, 0, ${fireIntensity * 0.5})`;
    ctx.shadowColor = "#ff6000";
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.08);
    ctx.lineTo(-size * 0.08, -size * 1.35);
    ctx.lineTo(size * 0.08, -size * 1.35);
    ctx.closePath();
    ctx.fill();
    // Inner bright flame
    ctx.fillStyle = `rgba(255, 180, 80, ${fireIntensity * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.08);
    ctx.lineTo(-size * 0.04, -size * 1.28);
    ctx.lineTo(size * 0.04, -size * 1.28);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Fire particles
    for (let fp = 0; fp < 5; fp++) {
      const fpY = -size * 1.1 - fp * size * 0.05;
      const fpX = Math.sin(time * 12 + fp * 1.5) * size * 0.04;
      ctx.fillStyle = `rgba(255, 200, 100, ${fireIntensity * (1 - fp * 0.15)})`;
      ctx.beginPath();
      ctx.arc(fpX, fpY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ornate multi-layer pennant
  const pennantWave = Math.sin(time * 8) * 4 + (isAttacking ? lanceThrust * 6 : 0);
  // Pennant shadow
  ctx.fillStyle = "#a04000";
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.74);
  ctx.quadraticCurveTo(
    -size * 0.22 + pennantWave,
    -size * 0.68,
    -size * 0.3 + pennantWave * 1.5,
    -size * 0.64
  );
  ctx.lineTo(-size * 0.03, -size * 0.58);
  ctx.closePath();
  ctx.fill();
  // Main pennant
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.75);
  ctx.quadraticCurveTo(
    -size * 0.2 + pennantWave,
    -size * 0.69,
    -size * 0.28 + pennantWave * 1.5,
    -size * 0.65
  );
  ctx.lineTo(-size * 0.025, -size * 0.6);
  ctx.closePath();
  ctx.fill();
  // Pennant gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Pennant inner highlight
  ctx.fillStyle = "#ff8030";
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.73);
  ctx.quadraticCurveTo(
    -size * 0.15 + pennantWave,
    -size * 0.69,
    -size * 0.2 + pennantWave * 1.2,
    -size * 0.66
  );
  ctx.lineTo(-size * 0.04, -size * 0.62);
  ctx.closePath();
  ctx.fill();
  // Black "P" on pennant with gold outline
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.font = `bold ${size * 0.07}px serif`;
  ctx.strokeText("P", -size * 0.12 + pennantWave * 0.6, -size * 0.67);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", -size * 0.12 + pennantWave * 0.6, -size * 0.67);
  ctx.restore();

  // === ORNATE ROYAL SHIELD ===
  ctx.save();
  ctx.translate(x - size * 0.26, y - size * 0.18 + gallop * 0.12);
  ctx.rotate(-0.15);

  // Shield shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.22);
  ctx.lineTo(-size * 0.13, -size * 0.11);
  ctx.lineTo(-size * 0.11, size * 0.2);
  ctx.lineTo(size * 0.02, size * 0.28);
  ctx.lineTo(size * 0.14, size * 0.2);
  ctx.lineTo(size * 0.16, -size * 0.11);
  ctx.closePath();
  ctx.fill();

  // Ornate kite shield with gradient
  const shieldGrad = ctx.createLinearGradient(-size * 0.15, 0, size * 0.15, 0);
  shieldGrad.addColorStop(0, "#2a2a32");
  shieldGrad.addColorStop(0.3, "#4a4a52");
  shieldGrad.addColorStop(0.5, "#5a5a62");
  shieldGrad.addColorStop(0.7, "#4a4a52");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Shield edge highlight
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.25);
  ctx.lineTo(-size * 0.14, -size * 0.13);
  ctx.stroke();

  // Orange field with gradient
  const fieldGrad = ctx.createLinearGradient(0, -size * 0.18, 0, size * 0.2);
  fieldGrad.addColorStop(0, "#ff7020");
  fieldGrad.addColorStop(0.5, "#e06000");
  fieldGrad.addColorStop(1, "#c04000");
  ctx.fillStyle = fieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.11, -size * 0.09);
  ctx.lineTo(-size * 0.09, size * 0.15);
  ctx.lineTo(0, size * 0.21);
  ctx.lineTo(size * 0.09, size * 0.15);
  ctx.lineTo(size * 0.11, -size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Shield filigree engravings
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  // Top swirl
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.06, -size * 0.04, -size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.06, size * 0.04, -size * 0.02);
  ctx.stroke();
  // Bottom swirl
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.14, -size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.04, size * 0.1);
  ctx.quadraticCurveTo(size * 0.06, size * 0.14, size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Double gold trim
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.23);
  ctx.lineTo(-size * 0.12, -size * 0.12);
  ctx.lineTo(-size * 0.1, size * 0.17);
  ctx.lineTo(0, size * 0.24);
  ctx.lineTo(size * 0.1, size * 0.17);
  ctx.lineTo(size * 0.12, -size * 0.12);
  ctx.closePath();
  ctx.stroke();

  // Corner gems on shield
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.1, size * 0.12, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.1, size * 0.12, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ornate "P" emblem with shadow
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", size * 0.005, size * 0.065);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", 0, size * 0.06);
  // Gold outline on P
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.6;
  ctx.strokeText("P", 0, size * 0.06);

  // Shield boss (center boss)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCentaurTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // EPIC ORNATE CENTAUR ARCHER - Golden War Champion of Princeton
  const gallop = Math.sin(time * 7) * 4;
  const legCycle = Math.sin(time * 7) * 0.4;
  const breathe = Math.sin(time * 2) * 0.5;
  const tailSwish = Math.sin(time * 5);
  const hairFlow = Math.sin(time * 4);
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Attack animation - bow draw and release
  const isAttacking = attackPhase > 0;
  const bowDraw = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === MULTI-LAYERED MAJESTIC GOLDEN AURA ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered auras for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
  const auraGrad = ctx.createRadialGradient(
      x + size * 0.05, y + size * 0.1, size * (0.08 + layerOffset),
      x + size * 0.05, y + size * 0.1, size * (0.9 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(255, 215, 80, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`);
    auraGrad.addColorStop(0.3, `rgba(255, 180, 50, ${auraIntensity * auraPulse * (0.35 - auraLayer * 0.08)})`);
    auraGrad.addColorStop(0.6, `rgba(200, 140, 20, ${auraIntensity * auraPulse * (0.2 - auraLayer * 0.05)})`);
    auraGrad.addColorStop(1, "rgba(200, 100, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
    ctx.ellipse(x + size * 0.05, y + size * 0.15, size * (0.8 + layerOffset * 0.2), size * (0.55 + layerOffset * 0.15), 0, 0, Math.PI * 2);
  ctx.fill();
  }

  // Floating golden rune particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 0.2) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.7) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.38;
    const pAlpha = 0.5 + Math.sin(time * 4 + p * 0.6) * 0.3;
    // Outer glow
    ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(255, 240, 150, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ENERGY RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(255, 215, 80, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x, y + size * 0.1,
        size * (0.5 + ringPhase * 0.45),
        size * (0.32 + ringPhase * 0.28),
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    // Golden spark particles
    for (let sp = 0; sp < 8; sp++) {
      const spAngle = time * 6 + sp * Math.PI / 4;
      const spDist = size * 0.35 + attackIntensity * size * 0.35;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(255, 230, 120, ${attackIntensity * 0.8})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x + size * 0.05, y + size * 0.55, 0, x + size * 0.05, y + size * 0.55, size * 0.55);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.05, y + size * 0.55, size * 0.55, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // === POWERFUL HORSE BODY WITH DETAILED COAT ===
  // Main body with rich golden gradient
  const bodyGrad = ctx.createRadialGradient(
    x + size * 0.02, y + size * 0.05, 0,
    x + size * 0.08, y + size * 0.15, size * 0.55
  );
  bodyGrad.addColorStop(0, "#f0d878");
  bodyGrad.addColorStop(0.25, "#e8c868");
  bodyGrad.addColorStop(0.5, "#c09838");
  bodyGrad.addColorStop(0.75, "#9a7820");
  bodyGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08, y + size * 0.15 + gallop * 0.12,
    size * 0.46, size * 0.28,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Muscle definition highlights
  ctx.strokeStyle = "rgba(240, 220, 150, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y + size * 0.08 + gallop * 0.12, size * 0.14, 0.4, 2.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y + size * 0.06 + gallop * 0.12, size * 0.12, 0.5, 2.0);
  ctx.stroke();

  // Muscle definition shadows
  ctx.strokeStyle = "rgba(107,80,16,0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y + size * 0.14 + gallop * 0.12, size * 0.17, 0.3, 2.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.28, y + size * 0.12 + gallop * 0.12, size * 0.15, 0.4, 2.3);
  ctx.stroke();

  // Battle scars (honorable marks)
  ctx.strokeStyle = "rgba(100, 70, 30, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.04 + gallop * 0.12);
  ctx.lineTo(x - size * 0.02, y + size * 0.16 + gallop * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.12 + gallop * 0.12);
  ctx.stroke();

  // === ORNATE ARMORED BARDING ===
  // Chest armor plate with gradient
  const chestArmorGrad = ctx.createLinearGradient(
    x - size * 0.35, y + size * 0.1,
    x - size * 0.1, y + size * 0.25
  );
  chestArmorGrad.addColorStop(0, "#6b5010");
  chestArmorGrad.addColorStop(0.3, "#9a7820");
  chestArmorGrad.addColorStop(0.6, "#8b6914");
  chestArmorGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, y + size * 0.03 + gallop * 0.12);
  ctx.lineTo(x - size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x - size * 0.22, y + size * 0.28 + gallop * 0.12);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Engraved filigree on chest armor
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.1 + gallop * 0.12);
  ctx.quadraticCurveTo(x - size * 0.32, y + size * 0.16, x - size * 0.26, y + size * 0.2 + gallop * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(x - size * 0.26, y + size * 0.14, x - size * 0.2, y + size * 0.18 + gallop * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Chest armor gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y + size * 0.14 + gallop * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Back armor plate
  const backArmorGrad = ctx.createLinearGradient(
    x + size * 0.2, y + size * 0.0,
    x + size * 0.4, y + size * 0.2
  );
  backArmorGrad.addColorStop(0, "#8b6914");
  backArmorGrad.addColorStop(0.5, "#9a7820");
  backArmorGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = backArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + gallop * 0.12);
  ctx.lineTo(x + size * 0.42, y + size * 0.08 + gallop * 0.12);
  ctx.lineTo(x + size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.18 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Back armor gem
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x + size * 0.32, y + size * 0.1 + gallop * 0.12, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Decorative medallion chain across body
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.22 + gallop * 0.12);
  ctx.quadraticCurveTo(x, y + size * 0.26 + gallop * 0.12, x + size * 0.2, y + size * 0.22 + gallop * 0.12);
  ctx.stroke();
  // Medallions on chain
  for (let med = 0; med < 5; med++) {
    const medX = x - size * 0.16 + med * size * 0.09;
    const medY = y + size * 0.24 + Math.sin(med * 0.8) * size * 0.015 + gallop * 0.12;
    ctx.fillStyle = "#dab32f";
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // === POWERFUL LEGS WITH ORNATE ARMOR ===
  // Leg gradient
  const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGrad.addColorStop(0, "#9a7820");
  legGrad.addColorStop(0.3, "#c09838");
  legGrad.addColorStop(0.7, "#c09838");
  legGrad.addColorStop(1, "#9a7820");

  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.2, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 1.1);
  // Upper leg (muscular)
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.09, size * 0.1, -size * 0.05, size * 0.18);
  ctx.lineTo(size * 0.05, size * 0.18);
  ctx.quadraticCurveTo(size * 0.09, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  // Muscle highlight
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lower leg
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  // Leg armor band
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  // Ornate hoof with glow
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.05, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 0.85);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.1, -size * 0.045, size * 0.18);
  ctx.lineTo(size * 0.045, size * 0.18);
  ctx.quadraticCurveTo(size * 0.08, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.22, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 1.0);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.09, size * 0.1, -size * 0.05, size * 0.18);
  ctx.lineTo(size * 0.05, size * 0.18);
  ctx.quadraticCurveTo(size * 0.09, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.37, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 0.9);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.1, -size * 0.045, size * 0.18);
  ctx.lineTo(size * 0.045, size * 0.18);
  ctx.quadraticCurveTo(size * 0.08, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === MAJESTIC FLOWING TAIL ===
  // Tail base (dark)
  ctx.strokeStyle = "#5a4010";
  ctx.lineWidth = 9 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.06 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.72 + tailSwish * 12,
    y + size * 0.14,
    x + size * 0.62 + tailSwish * 16,
    y + size * 0.46
  );
  ctx.stroke();

  // Tail main layer
  ctx.strokeStyle = "#6b5010";
  ctx.lineWidth = 7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.07 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.7 + tailSwish * 11,
    y + size * 0.15,
    x + size * 0.6 + tailSwish * 15,
    y + size * 0.44
  );
  ctx.stroke();

  // Tail highlight strands
  ctx.strokeStyle = "#c09838";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.65 + tailSwish * 8,
    y + size * 0.14,
    x + size * 0.56 + tailSwish * 12,
    y + size * 0.38
  );
  ctx.stroke();

  // Golden tail tip glow
  ctx.fillStyle = `rgba(255, 215, 100, ${0.5 + Math.sin(time * 4) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.62 + tailSwish * 16, y + size * 0.46, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // === MUSCULAR HUMAN TORSO ===
  // Back muscles layer
  ctx.fillStyle = "#c89050";
  ctx.beginPath();
  ctx.ellipse(
    x, y - size * 0.06 + gallop * 0.08 + breathe,
    size * 0.24, size * 0.2,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Main torso with rich gradient
  const torsoGrad = ctx.createLinearGradient(
    x - size * 0.24, y - size * 0.25,
    x + size * 0.24, y + size * 0.05
  );
  torsoGrad.addColorStop(0, "#c08040");
  torsoGrad.addColorStop(0.2, "#d8a060");
  torsoGrad.addColorStop(0.4, "#e8b878");
  torsoGrad.addColorStop(0.6, "#e8b070");
  torsoGrad.addColorStop(0.8, "#d8a060");
  torsoGrad.addColorStop(1, "#c08040");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.lineTo(x - size * 0.28, y - size * 0.32 + gallop * 0.04 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x, y - size * 0.46 + gallop * 0.04 + breathe * 0.3,
    x + size * 0.28, y - size * 0.32 + gallop * 0.04 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest/pec definition
  ctx.strokeStyle = "rgba(180, 130, 80, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.24 + gallop * 0.05 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x, y - size * 0.18 + gallop * 0.05 + breathe * 0.4,
    x + size * 0.18, y - size * 0.24 + gallop * 0.05 + breathe * 0.4
  );
  ctx.stroke();
  // Ab definition lines
  ctx.strokeStyle = "rgba(139,90,50,0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + gallop * 0.05 + breathe * 0.3);
  ctx.lineTo(x, y - size * 0.05 + gallop * 0.08 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.16 + gallop * 0.06 + breathe * 0.5);
  ctx.lineTo(x + size * 0.1, y - size * 0.16 + gallop * 0.06 + breathe * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.08 + gallop * 0.07 + breathe * 0.7);
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + gallop * 0.07 + breathe * 0.7);
  ctx.stroke();

  // Ornate warrior sash with detail
  const sashGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.26,
    x + size * 0.1, y - size * 0.04
  );
  sashGrad.addColorStop(0, "#e06000");
  sashGrad.addColorStop(0.5, "#ff7020");
  sashGrad.addColorStop(1, "#d04000");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.27 + gallop * 0.05);
  ctx.lineTo(x + size * 0.14, y - size * 0.08 + gallop * 0.08);
  ctx.lineTo(x + size * 0.1, y - size * 0.02 + gallop * 0.08);
  ctx.lineTo(x - size * 0.26, y - size * 0.22 + gallop * 0.05);
  ctx.closePath();
  ctx.fill();
  // Sash gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Sash medallion
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.16 + gallop * 0.06, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // === POWERFUL ARMS WITH BRACERS ===
  // Left arm (drawing bow)
  ctx.save();
  ctx.translate(x - size * 0.3, y - size * 0.2 + gallop * 0.05);
  ctx.rotate(-0.55);
  // Upper arm
  const armGrad = ctx.createRadialGradient(0, size * 0.08, 0, 0, size * 0.08, size * 0.12);
  armGrad.addColorStop(0, "#e8b878");
  armGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.065, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(-size * 0.05, size * 0.22, size * 0.055, size * 0.11, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Ornate bracer
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(-size * 0.06, size * 0.2, size * 0.06, size * 0.05, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bracer gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Right arm (holding bowstring back)
  ctx.save();
  ctx.translate(x + size * 0.3, y - size * 0.2 + gallop * 0.05);
  ctx.rotate(0.45);
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.065, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(size * 0.04, size * 0.2, size * 0.055, size * 0.11, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Bracer
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(size * 0.05, size * 0.18, size * 0.06, size * 0.05, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.05, size * 0.18, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === ORNATE HEAD ===
  // Neck with highlights
  const neckGrad = ctx.createLinearGradient(x - size * 0.06, y - size * 0.42, x + size * 0.06, y - size * 0.42);
  neckGrad.addColorStop(0, "#c89050");
  neckGrad.addColorStop(0.5, "#e0a868");
  neckGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = neckGrad;
  ctx.fillRect(x - size * 0.07, y - size * 0.42 + gallop * 0.04, size * 0.14, size * 0.12);

  // Face with gradient
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.02, y - size * 0.52 + gallop * 0.04, 0,
    x, y - size * 0.5 + gallop * 0.04, size * 0.15
  );
  faceGrad.addColorStop(0, "#f0c890");
  faceGrad.addColorStop(0.6, "#e8b878");
  faceGrad.addColorStop(1, "#d8a060");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52 + gallop * 0.04, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // === FLOWING GOLDEN HAIR WITH DETAIL ===
  // Hair shadow layer
  ctx.fillStyle = "#9a7820";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.6 + gallop * 0.04);
  for (let i = 0; i < 10; i++) {
    const hairAngle = -1.0 + i * 0.24;
    const hairWave = Math.sin(time * 5.5 + i * 0.5) * 4 + hairFlow * 2.5;
    const hairLen = size * (0.22 + (i > 4 ? 0.12 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.6,
      y - size * 0.52 + Math.sin(hairAngle) * hairLen * 0.85 + hairWave + gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Main hair
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.62 + gallop * 0.04);
  for (let i = 0; i < 9; i++) {
    const hairAngle = -0.95 + i * 0.25;
    const hairWave = Math.sin(time * 5 + i * 0.5) * 3.5 + hairFlow * 2;
    const hairLen = size * (0.2 + (i > 4 ? 0.1 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.5,
      y - size * 0.52 + Math.sin(hairAngle) * hairLen * 0.82 + hairWave + gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Hair highlight strands
  ctx.fillStyle = "#e0c058";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.64 + gallop * 0.04);
  for (let i = 0; i < 6; i++) {
    const hairAngle = -0.75 + i * 0.32;
    const hairWave = Math.sin(time * 5 + i * 0.6) * 2.5 + hairFlow * 1.5;
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.16 + hairWave * 0.35,
      y - size * 0.54 + Math.sin(hairAngle) * size * 0.13 + hairWave * 0.55 + gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Brightest highlights
  ctx.strokeStyle = "#f0d878";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.6;
  for (let strand = 0; strand < 4; strand++) {
    const strandAngle = -0.6 + strand * 0.4;
    const strandWave = Math.sin(time * 5 + strand * 0.8) * 2;
  ctx.beginPath();
    ctx.moveTo(x + Math.cos(strandAngle) * size * 0.08, y - size * 0.58 + gallop * 0.04);
    ctx.quadraticCurveTo(
      x + Math.cos(strandAngle) * size * 0.14 + strandWave,
      y - size * 0.52 + Math.sin(strandAngle) * size * 0.08,
      x + Math.cos(strandAngle) * size * 0.18 + strandWave * 1.5,
      y - size * 0.46 + Math.sin(strandAngle) * size * 0.12 + gallop * 0.04
  );
  ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ORNATE LAUREL CROWN ===
  // Crown base band
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.57 + gallop * 0.04, size * 0.14, Math.PI * 0.75, Math.PI * 0.25, true);
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.57 + gallop * 0.04, size * 0.12, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.stroke();

  // Elaborate laurel leaves
  ctx.fillStyle = "#c9a227";
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 6; i++) {
      const leafAngle = side === -1 ? Math.PI * 0.75 - i * 0.12 : Math.PI * 0.25 + i * 0.12;
      const leafX = x + Math.cos(leafAngle) * size * 0.14;
      const leafY = y - size * 0.57 + Math.sin(leafAngle) * size * 0.14 + gallop * 0.04;
      const leafSize = size * (0.028 - i * 0.002);
    ctx.beginPath();
      ctx.ellipse(leafX, leafY, leafSize, leafSize * 0.45, leafAngle + Math.PI * 0.5 * side, 0, Math.PI * 2);
    ctx.fill();
    }
  }

  // Crown center gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.71 + gallop * 0.04, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.008, y - size * 0.715 + gallop * 0.04, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Side crown gems
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.62 + gallop * 0.04, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.62 + gallop * 0.04, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === FIERCE GLOWING EYES ===
  // Eye base
  ctx.fillStyle = "#3070b0";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.028, size * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.028, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow
  ctx.fillStyle = "#60a0d0";
  ctx.shadowColor = "#80c0ff";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.02, size * 0.015, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.02, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.045, y - size * 0.545 + gallop * 0.04, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.055, y - size * 0.545 + gallop * 0.04, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Determined eyebrows
  ctx.strokeStyle = "#9a7820";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();

  // Noble expression
  ctx.strokeStyle = "#b08060";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.47 + gallop * 0.04, size * 0.035, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // === ORNATE EPIC BOW === (drawn last so it appears ON TOP)
  ctx.save();
  ctx.translate(x - size * 0.22, y - size * 0.15 + gallop * 0.06);
  ctx.rotate(-0.3 + (isAttacking ? -bowDraw * 0.15 : 0));

  // Bow flexes during draw
  const bowBend = isAttacking ? 0.58 + bowDraw * 0.18 : 0.58;

  // Bow outer layer (dark wood)
  ctx.strokeStyle = "#4a2a10";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, Math.PI - bowBend * Math.PI, Math.PI + bowBend * Math.PI);
  ctx.stroke();

  // Bow main layer (rich wood)
  const bowGrad = ctx.createLinearGradient(-size * 0.28, 0, size * 0.1, 0);
  bowGrad.addColorStop(0, "#5a3a1a");
  bowGrad.addColorStop(0.3, "#7a5a3a");
  bowGrad.addColorStop(0.7, "#6b4a2a");
  bowGrad.addColorStop(1, "#5a3a1a");
  ctx.strokeStyle = bowGrad;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, Math.PI - bowBend * Math.PI, Math.PI + bowBend * Math.PI);
  ctx.stroke();

  // Gold inlay patterns
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, Math.PI * 0.45, Math.PI * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, Math.PI * 1.45, Math.PI * 1.55);
  ctx.stroke();

  // Bow tip decorations
  const topTipX = Math.cos(Math.PI - bowBend * Math.PI) * size * 0.28;
  const topTipY = Math.sin(Math.PI - bowBend * Math.PI) * size * 0.28;
  const botTipX = Math.cos(Math.PI + bowBend * Math.PI) * size * 0.28;
  const botTipY = Math.sin(Math.PI + bowBend * Math.PI) * size * 0.28;

  // Gold tip caps
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(topTipX, topTipY, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(botTipX, botTipY, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Center grip
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(-size * 0.24, -size * 0.035, size * 0.07, size * 0.07);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.24, -size * 0.035, size * 0.07, size * 0.07);
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(-size * 0.205, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bowstring
  const stringPull = -size * (0.16 + (isAttacking ? bowDraw * 0.15 : 0));
  if (isAttacking) {
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 6 * zoom * bowDraw;
  }
  ctx.strokeStyle = isAttacking ? "#fff8dc" : "#f8f8dc";
  ctx.lineWidth = (isAttacking ? 2.5 : 2) * zoom;
  ctx.beginPath();
  ctx.moveTo(topTipX, topTipY);
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(botTipX, botTipY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Arrow nocked
  if (!isAttacking || attackPhase < 0.5) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.1 : 0;
    const shaftGrad = ctx.createLinearGradient(stringPull - size * 0.4, 0, stringPull, 0);
    shaftGrad.addColorStop(0, "#3a2010");
    shaftGrad.addColorStop(0.5, "#5a4020");
    shaftGrad.addColorStop(1, "#3a2010");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(stringPull + arrowOffset * 0.5 - size * 0.4, -size * 0.015, size * 0.4, size * 0.03);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(stringPull + arrowOffset * 0.5 - size * 0.18, -size * 0.018, size * 0.02, size * 0.036);
    ctx.fillRect(stringPull + arrowOffset * 0.5 - size * 0.3, -size * 0.018, size * 0.02, size * 0.036);
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.3 + size * 0.015, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.5 + size * 0.06, -size * 0.035);
    ctx.lineTo(stringPull + arrowOffset * 0.3 - size * 0.03, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.5 + size * 0.06, size * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff8030";
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.3 + size * 0.008, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.4 + size * 0.04, -size * 0.02);
    ctx.lineTo(stringPull + arrowOffset * 0.3 - size * 0.015, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.4 + size * 0.04, size * 0.02);
    ctx.closePath();
    ctx.fill();
    if (isAttacking) {
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 8 * zoom * bowDraw;
    }
    const headGrad = ctx.createLinearGradient(stringPull - size * 0.45, -size * 0.035, stringPull - size * 0.45, size * 0.035);
    headGrad.addColorStop(0, "#c0c0c0");
    headGrad.addColorStop(0.5, isAttacking ? "#ffffff" : "#e8e8e8");
    headGrad.addColorStop(1, "#a0a0a0");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(stringPull - size * 0.42, 0);
    ctx.lineTo(stringPull - size * 0.34, -size * 0.035);
    ctx.lineTo(stringPull - size * 0.36, 0);
    ctx.lineTo(stringPull - size * 0.34, size * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(stringPull - size * 0.4, 0);
    ctx.lineTo(stringPull - size * 0.36, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// Elite Guard - Level 3 station troop with ornate royal armor and halberd
function drawEliteTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const stance = Math.sin(time * 3) * 1.2;
  const breathe = Math.sin(time * 2) * 0.5;
  const capeWave = Math.sin(time * 3.5);
  const capeWave2 = Math.sin(time * 4.2 + 0.5);
  const shimmer = Math.sin(time * 6) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Attack animation - halberd swing
  const isAttacking = attackPhase > 0;
  const halberdSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 1.8
    : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.15 : 0;

  // === ELITE AURA (always present, stronger during attack) ===
  const auraIntensity = isAttacking ? 0.6 : 0.3;
  const auraPulse = 0.8 + Math.sin(time * 4) * 0.2;

  // Multiple layered aura rings for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.15;
    const auraGrad = ctx.createRadialGradient(
      x, y + size * 0.1, size * (0.05 + layerOffset),
      x, y + size * 0.1, size * (0.6 + layerOffset)
    );
    auraGrad.addColorStop(0, `rgba(255, 108, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.1)})`);
    auraGrad.addColorStop(0.4, `rgba(255, 140, 40, ${auraIntensity * auraPulse * (0.25 - auraLayer * 0.06)})`);
    auraGrad.addColorStop(0.7, `rgba(255, 180, 80, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.04)})`);
  auraGrad.addColorStop(1, "rgba(255, 108, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
    ctx.ellipse(x, y + size * 0.15, size * (0.7 + layerOffset * 0.3), size * (0.55 + layerOffset * 0.2), 0, 0, Math.PI * 2);
  ctx.fill();
  }

  // Floating rune particles around the elite
  for (let p = 0; p < 6; p++) {
    const pAngle = (time * 0.8 + p * Math.PI / 3) % (Math.PI * 2);
    const pRadius = size * 0.5 + Math.sin(time * 2 + p) * size * 0.1;
    const pX = x + Math.cos(pAngle) * pRadius;
    const pY = y + Math.sin(pAngle) * pRadius * 0.4 + size * 0.1;
    const pAlpha = 0.4 + Math.sin(time * 3 + p * 0.7) * 0.3;
    ctx.fillStyle = `rgba(255, 180, 60, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(pX, pY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Energy rings during attack
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6;
      ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.35 + ringPhase * 0.4),
        size * (0.22 + ringPhase * 0.25),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === ROYAL CAPE (multi-layered with intricate patterns) ===
  // Cape shadow layer (deepest)
  ctx.fillStyle = "#050515";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.3 + capeWave * 5,
    y + size * 0.35,
    x - size * 0.26 + capeWave * 6,
    y + size * 0.68
  );
  ctx.lineTo(x + size * 0.14 + capeWave * 4, y + size * 0.62);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.25,
    x + size * 0.14,
    y - size * 0.06 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner layer (royal purple)
  const capeInnerGrad = ctx.createLinearGradient(
    x - size * 0.2, y - size * 0.1,
    x + size * 0.1, y + size * 0.6
  );
  capeInnerGrad.addColorStop(0, "#1a0a3a");
  capeInnerGrad.addColorStop(0.3, "#0d0520");
  capeInnerGrad.addColorStop(0.7, "#150830");
  capeInnerGrad.addColorStop(1, "#0a0418");
  ctx.fillStyle = capeInnerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.26 + capeWave * 4,
    y + size * 0.3,
    x - size * 0.22 + capeWave * 5,
    y + size * 0.6
  );
  ctx.lineTo(x + size * 0.1 + capeWave * 3, y + size * 0.55);
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y + size * 0.2,
    x + size * 0.12,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape middle layer with gradient
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.15, y,
    x + size * 0.1, y + size * 0.5
  );
  capeGrad.addColorStop(0, "#2a1a5a");
  capeGrad.addColorStop(0.4, "#1d1045");
  capeGrad.addColorStop(1, "#120830");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.12 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.22 + capeWave * 3,
    y + size * 0.2,
    x - size * 0.18 + capeWave * 4,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.08 + capeWave * 2, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y + size * 0.15,
    x + size * 0.1,
    y - size * 0.1 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape embroidered pattern (gold thread design)
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  // Decorative swirl patterns on cape
  for (let row = 0; row < 3; row++) {
    const rowY = y + size * (0.15 + row * 0.12);
    const waveOffset = capeWave * (2 + row);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + waveOffset, rowY);
    ctx.quadraticCurveTo(
      x - size * 0.05 + waveOffset, rowY - size * 0.03,
      x + waveOffset, rowY
    );
    ctx.quadraticCurveTo(
      x + size * 0.05 + waveOffset, rowY + size * 0.03,
      x + size * 0.08 + waveOffset, rowY
    );
    ctx.stroke();
  }
  ctx.restore();

  // Cape outer gold trim with decorative pattern
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + capeWave * 4, y + size * 0.5);
  ctx.lineTo(x + size * 0.08 + capeWave * 2, y + size * 0.45);
  ctx.stroke();

  // Inner trim line
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17 + capeWave * 4, y + size * 0.48);
  ctx.lineTo(x + size * 0.07 + capeWave * 2, y + size * 0.43);
  ctx.stroke();

  // Cape clasp gem at shoulder
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.08 + breathe, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = "rgba(255,255,200,0.7)";
  ctx.beginPath();
  ctx.arc(x - size * 0.11, y - size * 0.09 + breathe, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // === LEGS (ornate greaves with engravings) ===
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.07, y + size * 0.28);
  ctx.rotate(-0.06 + stance * 0.015);
  
  // Greave base with metallic gradient
  const legGradL = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGradL.addColorStop(0, "#4a4a5a");
  legGradL.addColorStop(0.3, "#6a6a7a");
  legGradL.addColorStop(0.7, "#7a7a8a");
  legGradL.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = legGradL;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  
  // Leg armor segments
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.06);
  ctx.lineTo(size * 0.055, size * 0.06);
  ctx.moveTo(-size * 0.055, size * 0.12);
  ctx.lineTo(size * 0.055, size * 0.12);
  ctx.stroke();
  
  // Ornate knee guard with layered design
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Knee gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Detailed boot with buckles
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  // Boot cuff
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.07, size * 0.17, size * 0.14, size * 0.025);
  // Gold buckle
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.025, size * 0.19, size * 0.05, size * 0.02);
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.07, y + size * 0.28);
  ctx.rotate(0.06 - stance * 0.015);
  
  // Greave base
  const legGradR = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGradR.addColorStop(0, "#5a5a6a");
  legGradR.addColorStop(0.3, "#7a7a8a");
  legGradR.addColorStop(0.7, "#6a6a7a");
  legGradR.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = legGradR;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  
  // Leg armor segments
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.06);
  ctx.lineTo(size * 0.055, size * 0.06);
  ctx.moveTo(-size * 0.055, size * 0.12);
  ctx.lineTo(size * 0.055, size * 0.12);
  ctx.stroke();
  
  // Ornate knee guard
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Knee gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Boot with buckles
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.07, size * 0.17, size * 0.14, size * 0.025);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.025, size * 0.19, size * 0.05, size * 0.02);
  ctx.restore();

  // === BODY (highly ornate plate armor with filigree) ===
  // Back plate
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.21, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.24, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.21, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with elaborate metallic gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.2, y - size * 0.1,
    x + size * 0.2, y + size * 0.3
  );
  plateGrad.addColorStop(0, "#5a5a6a");
  plateGrad.addColorStop(0.15, "#7a7a8a");
  plateGrad.addColorStop(0.3, "#9a9aaa");
  plateGrad.addColorStop(0.5, "#8a8a9a");
  plateGrad.addColorStop(0.7, "#9a9aaa");
  plateGrad.addColorStop(0.85, "#7a7a8a");
  plateGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y + size * 0.3 + breathe);
  ctx.lineTo(x - size * 0.22, y - size * 0.08 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.14 + breathe * 0.3,
    x + size * 0.22,
    y - size * 0.08 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.19, y + size * 0.3 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate edge highlight
  ctx.strokeStyle = "#a0a0b0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y + size * 0.28 + breathe);
  ctx.lineTo(x - size * 0.21, y - size * 0.06 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.12 + breathe * 0.3,
    x + size * 0.21,
    y - size * 0.06 + breathe * 0.5
  );
  ctx.stroke();

  // Armor segment lines (muscle cuirass detail)
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.2;
  // Center line
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.06 + breathe);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  // Pectoral lines
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.02 + breathe);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.08, x - size * 0.02, y + size * 0.04 + breathe);
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + breathe);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.08, x + size * 0.02, y + size * 0.04 + breathe);
  ctx.stroke();
  // Abdominal segments
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.12 + breathe);
  ctx.lineTo(x + size * 0.12, y + size * 0.12 + breathe);
  ctx.moveTo(x - size * 0.1, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.18 + breathe);
  ctx.stroke();

  // Gold filigree patterns on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.8;
  // Left filigree swirl
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.02 + breathe);
  ctx.quadraticCurveTo(x - size * 0.18, y + size * 0.06, x - size * 0.12, y + size * 0.08 + breathe);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.1, x - size * 0.14, y + size * 0.14 + breathe);
  ctx.stroke();
  // Right filigree swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.02 + breathe);
  ctx.quadraticCurveTo(x + size * 0.18, y + size * 0.06, x + size * 0.12, y + size * 0.08 + breathe);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.1, x + size * 0.14, y + size * 0.14 + breathe);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate gold chest emblem (Princeton shield with detail)
  // Shield base
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.04 + breathe);
  ctx.lineTo(x - size * 0.1, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Shield inner detail
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.01 + breathe);
  ctx.lineTo(x - size * 0.06, y + size * 0.07 + breathe);
  ctx.lineTo(x, y + size * 0.14 + breathe);
  ctx.lineTo(x + size * 0.06, y + size * 0.07 + breathe);
  ctx.closePath();
  ctx.fill();
  // Center gem on shield
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.07 + breathe, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem sparkle
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y + size * 0.06 + breathe, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Belt with ornate buckle and pouches
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(x - size * 0.18, y + size * 0.22 + breathe, size * 0.36, size * 0.045);
  // Belt buckle
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.06, y + size * 0.215 + breathe, size * 0.12, size * 0.055, size * 0.01);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.04, y + size * 0.225 + breathe, size * 0.08, size * 0.035, size * 0.005);
  ctx.fill();
  // Buckle gem
  ctx.fillStyle = "#ff4400";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.242 + breathe, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  // Belt pouches
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(x - size * 0.16, y + size * 0.24 + breathe, size * 0.05, size * 0.04);
  ctx.fillRect(x + size * 0.11, y + size * 0.24 + breathe, size * 0.05, size * 0.04);

  // === ORNATE HALBERD (polearm weapon with intricate design) ===
  ctx.save();
  const halberdX =
    x + size * 0.27 + (isAttacking ? halberdSwing * size * 0.18 : 0);
  const halberdY =
    y - size * 0.12 - (isAttacking ? Math.abs(halberdSwing) * size * 0.12 : 0);
  ctx.translate(halberdX, halberdY);
  ctx.rotate(0.15 + stance * 0.02 + halberdSwing);

  // Ornate pole with wrapped leather
  const poleGrad = ctx.createLinearGradient(-size * 0.03, -size * 0.5, size * 0.03, -size * 0.5);
  poleGrad.addColorStop(0, "#3a2a1a");
  poleGrad.addColorStop(0.3, "#5a4a3a");
  poleGrad.addColorStop(0.7, "#5a4a3a");
  poleGrad.addColorStop(1, "#3a2a1a");
  ctx.fillStyle = poleGrad;
  ctx.fillRect(-size * 0.025, -size * 0.55, size * 0.05, size * 1.0);
  
  // Leather wrappings on pole
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1.5;
  for (let wrap = 0; wrap < 6; wrap++) {
    const wrapY = -size * 0.1 + wrap * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, wrapY);
    ctx.lineTo(size * 0.025, wrapY + size * 0.03);
    ctx.stroke();
  }

  // Gold pole rings
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.03, -size * 0.52, size * 0.06, size * 0.025);
  ctx.fillRect(-size * 0.03, -size * 0.2, size * 0.06, size * 0.02);
  ctx.fillRect(-size * 0.03, size * 0.25, size * 0.06, size * 0.02);

  // Elaborate axe head (glows during attack)
  if (isAttacking) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom * Math.abs(halberdSwing);
  }
  
  // Axe blade with gradient
  const bladeGrad = ctx.createLinearGradient(-size * 0.18, -size * 0.4, -size * 0.02, -size * 0.3);
  bladeGrad.addColorStop(0, isAttacking ? "#e0e0f0" : "#b0b0c0");
  bladeGrad.addColorStop(0.5, isAttacking ? "#f0f0ff" : "#d0d0e0");
  bladeGrad.addColorStop(1, isAttacking ? "#c0c0d0" : "#a0a0b0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.52);
  ctx.lineTo(-size * 0.18, -size * 0.38);
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.32, -size * 0.15, -size * 0.26);
  ctx.lineTo(-size * 0.025, -size * 0.32);
  ctx.closePath();
  ctx.fill();

  // Blade edge highlight
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.52);
  ctx.lineTo(-size * 0.17, -size * 0.38);
  ctx.quadraticCurveTo(-size * 0.19, -size * 0.33, -size * 0.14, -size * 0.27);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Blade engravings
  ctx.strokeStyle = "#7a7a8a";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.42);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.38, -size * 0.08, -size * 0.32);
  ctx.stroke();

  // Ornate spike tip
  ctx.fillStyle = isAttacking ? "#e0e0f0" : "#c0c0d0";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.62);
  ctx.lineTo(-size * 0.04, -size * 0.52);
  ctx.lineTo(size * 0.04, -size * 0.52);
  ctx.closePath();
  ctx.fill();

  // Spike decorative collar
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.52);
  ctx.lineTo(-size * 0.035, -size * 0.54);
  ctx.lineTo(size * 0.035, -size * 0.54);
  ctx.lineTo(size * 0.05, -size * 0.52);
  ctx.closePath();
  ctx.fill();

  // Back spike with curve
  ctx.fillStyle = isAttacking ? "#d0d0e0" : "#b0b0c0";
  ctx.beginPath();
  ctx.moveTo(size * 0.025, -size * 0.44);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.42, size * 0.1, -size * 0.38);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.34, size * 0.025, -size * 0.36);
  ctx.closePath();
  ctx.fill();
  
  ctx.shadowBlur = 0;

  // Swing trail effect with particles
  if (isAttacking && Math.abs(halberdSwing) > 0.4) {
    // Main trail
    ctx.strokeStyle = `rgba(255, 200, 100, ${Math.abs(halberdSwing) * 0.5})`;
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.42,
      size * 0.25,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + halberdSwing * 0.9
    );
    ctx.stroke();
    
    // Inner trail
    ctx.strokeStyle = `rgba(255, 255, 200, ${Math.abs(halberdSwing) * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.42,
      size * 0.22,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + halberdSwing * 0.85
    );
    ctx.stroke();
    
    // Spark particles
    for (let sp = 0; sp < 4; sp++) {
      const spAngle = -Math.PI * 0.5 + halberdSwing * (0.5 + sp * 0.1);
      const spDist = size * (0.2 + sp * 0.02);
      const spX = Math.cos(spAngle) * spDist;
      const spY = -size * 0.42 + Math.sin(spAngle) * spDist;
      ctx.fillStyle = `rgba(255, 220, 150, ${0.8 - sp * 0.15})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // === SHOULDERS (elaborate layered pauldrons) ===
  // Left pauldron - multiple layers
  ctx.save();
  ctx.translate(x - size * 0.19, y - size * 0.04 + breathe);
  
  // Pauldron base layer
  const pauldronGradL = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradL.addColorStop(0, "#8a8a9a");
  pauldronGradL.addColorStop(0.6, "#6a6a7a");
  pauldronGradL.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = pauldronGradL;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Pauldron ridge layers
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.03, size * 0.09, size * 0.05, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(size * 0.04, size * 0.05, size * 0.06, size * 0.035, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Gold trim and rivets
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.stroke();
  
  // Decorative rivets
  ctx.fillStyle = "#dab32f";
  for (let rivet = 0; rivet < 4; rivet++) {
    const rivetAngle = -0.3 + rivet * Math.PI * 0.5;
    const rivetX = Math.cos(rivetAngle) * size * 0.09;
    const rivetY = Math.sin(rivetAngle) * size * 0.06;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Pauldron spike
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.lineTo(-size * 0.14, -size * 0.06);
  ctx.lineTo(-size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right pauldron
  ctx.save();
  ctx.translate(x + size * 0.19, y - size * 0.04 + breathe);
  
  const pauldronGradR = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradR.addColorStop(0, "#8a8a9a");
  pauldronGradR.addColorStop(0.6, "#6a6a7a");
  pauldronGradR.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = pauldronGradR;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.03, size * 0.09, size * 0.05, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(-size * 0.04, size * 0.05, size * 0.06, size * 0.035, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#dab32f";
  for (let rivet = 0; rivet < 4; rivet++) {
    const rivetAngle = 0.3 + rivet * Math.PI * 0.5;
    const rivetX = Math.cos(rivetAngle) * size * 0.09;
    const rivetY = Math.sin(rivetAngle) * size * 0.06;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.02);
  ctx.lineTo(size * 0.14, -size * 0.06);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === HEAD (elaborate plumed helm with face guard) ===
  // Gorget (neck armor)
  const gorgetGrad = ctx.createLinearGradient(x - size * 0.08, y - size * 0.14, x + size * 0.08, y - size * 0.14);
  gorgetGrad.addColorStop(0, "#4a4a5a");
  gorgetGrad.addColorStop(0.5, "#6a6a7a");
  gorgetGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.08 + breathe);
  ctx.lineTo(x - size * 0.1, y - size * 0.16 + breathe);
  ctx.quadraticCurveTo(x, y - size * 0.18, x + size * 0.1, y - size * 0.16 + breathe);
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Gorget gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Helm base with gradient
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.03, y - size * 0.32 + breathe, size * 0.02,
    x, y - size * 0.28 + breathe, size * 0.14
  );
  helmGrad.addColorStop(0, "#9a9aaa");
  helmGrad.addColorStop(0.4, "#7a7a8a");
  helmGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + breathe, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Helm ridge/crest base
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.42 + breathe);
  ctx.lineTo(x - size * 0.025, y - size * 0.26 + breathe);
  ctx.lineTo(x + size * 0.025, y - size * 0.26 + breathe);
  ctx.lineTo(x + size * 0.02, y - size * 0.42 + breathe);
  ctx.closePath();
  ctx.fill();

  // Visor with slit detail
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.26 + breathe,
    size * 0.1,
    size * 0.05,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  // Visor slits
  ctx.fillStyle = "#0a0a15";
  ctx.fillRect(x - size * 0.08, y - size * 0.26 + breathe, size * 0.16, size * 0.01);
  ctx.fillRect(x - size * 0.06, y - size * 0.24 + breathe, size * 0.12, size * 0.008);
  
  // Eye glow behind visor
  ctx.fillStyle = `rgba(255, 100, 0, ${0.4 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.03, y - size * 0.26 + breathe, size * 0.015, size * 0.008, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.03, y - size * 0.26 + breathe, size * 0.015, size * 0.008, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ornate gold crown band with gems
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.28 + breathe,
    size * 0.14,
    Math.PI * 1.15,
    Math.PI * 1.85
  );
  ctx.stroke();

  // Crown points
  ctx.fillStyle = "#c9a227";
  for (let cp = 0; cp < 3; cp++) {
    const cpAngle = Math.PI * 1.3 + cp * Math.PI * 0.2;
    const cpX = x + Math.cos(cpAngle) * size * 0.14;
    const cpY = y - size * 0.28 + breathe + Math.sin(cpAngle) * size * 0.14;
  ctx.beginPath();
    ctx.moveTo(cpX, cpY);
    ctx.lineTo(cpX + Math.cos(cpAngle) * size * 0.04, cpY + Math.sin(cpAngle) * size * 0.04 - size * 0.02);
    ctx.lineTo(cpX + Math.cos(cpAngle + 0.3) * size * 0.02, cpY + Math.sin(cpAngle + 0.3) * size * 0.02);
    ctx.closePath();
    ctx.fill();
  }
  
  // Crown center gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + breathe, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Elaborate multi-layered plume
  // Plume shadow/depth layer
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.2 + capeWave * 2.5,
    y - size * 0.58,
    x + size * 0.28 + capeWave * 4,
    y - size * 0.4 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.35,
    x + size * 0.02,
    y - size * 0.4 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Main plume with gradient
  const plumeGrad = ctx.createLinearGradient(
    x, y - size * 0.55,
    x + size * 0.25, y - size * 0.35
  );
  plumeGrad.addColorStop(0, "#ff7700");
  plumeGrad.addColorStop(0.3, "#ff5500");
  plumeGrad.addColorStop(0.7, "#ff6600");
  plumeGrad.addColorStop(1, "#dd4400");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.18 + capeWave * 2,
    y - size * 0.56,
    x + size * 0.24 + capeWave * 3.5,
    y - size * 0.38 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.34,
    x,
    y - size * 0.4 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Plume highlight feathers
  ctx.strokeStyle = "#ffaa44";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  for (let feather = 0; feather < 4; feather++) {
    const fOffset = feather * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.02, y - size * 0.42 + breathe);
    ctx.quadraticCurveTo(
      x + size * (0.1 + fOffset) + capeWave * (1.5 + feather * 0.3),
      y - size * (0.48 + fOffset * 0.3),
      x + size * (0.15 + fOffset) + capeWave * (2 + feather * 0.4),
      y - size * 0.38 + breathe
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Secondary smaller plume
  ctx.fillStyle = "#ff8800";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.4 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave2 * 1.5,
    y - size * 0.48,
    x + size * 0.12 + capeWave2 * 2,
    y - size * 0.36 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.04,
    y - size * 0.34,
    x - size * 0.02,
    y - size * 0.38 + breathe
  );
  ctx.closePath();
  ctx.fill();
}

function drawDefaultTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Default falls back to knight
  drawKnightTroop(ctx, x, y, size, color, time, zoom, attackPhase);
}

function drawKnightTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // DARK CHAMPION - Elite Princeton Knight with Soul-Forged Greatsword
  const stance = Math.sin(time * 3) * 1;
  const breathe = Math.sin(time * 2) * 0.4;
  const capeWave = Math.sin(time * 4);

  // Attack animation - devastating overhead swing
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.2) * 2.2
    : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.25 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === DARK FLAME AURA (always present) ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;

  // Fiery aura gradient
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    size * 0.1,
    x,
    y + size * 0.1,
    size * 0.8
  );
  auraGrad.addColorStop(
    0,
    `rgba(255, 100, 20, ${auraIntensity * auraPulse * 0.5})`
  );
  auraGrad.addColorStop(
    0.4,
    `rgba(255, 60, 0, ${auraIntensity * auraPulse * 0.3})`
  );
  auraGrad.addColorStop(1, "rgba(200, 40, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.7, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flame wisps
  for (let w = 0; w < 3; w++) {
    const wPhase = (time * 3 + w * 1.2) % 2;
    const wAlpha = wPhase < 1 ? (1 - wPhase) * 0.4 : 0;
    const wAngle = (w / 3) * Math.PI - Math.PI * 0.5;
    const wX = x + Math.cos(wAngle) * size * 0.4;
    const wY = y + size * 0.2 - wPhase * size * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${wAlpha})`;
    ctx.beginPath();
    ctx.ellipse(wX, wY, 3 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === DARK ENERGY RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(255, 80, 20, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        size * (0.55 + ringPhase * 0.35),
        size * (0.65 + ringPhase * 0.35),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.45, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === FLOWING BATTLE CAPE ===
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y - size * 0.2,
    x + size * 0.1,
    y + size * 0.5
  );
  capeGrad.addColorStop(0, "#cc3300");
  capeGrad.addColorStop(0.5, "#ff5500");
  capeGrad.addColorStop(1, "#aa2200");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.3 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.25 + capeWave * 6,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.12 + capeWave * 3, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave * 1.5,
    y + size * 0.12,
    x + size * 0.14,
    y - size * 0.12 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner shadow with pattern
  ctx.fillStyle = "#8b2200";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.18 + capeWave * 2.5,
    y + size * 0.12,
    x - size * 0.12 + capeWave * 4,
    y + size * 0.38
  );
  ctx.lineTo(x + capeWave * 1.5, y + size * 0.35);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.08,
    x + size * 0.06,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // === ARMORED LEGS ===
  // Dark steel greaves
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.08, y + size * 0.32);
    ctx.rotate(side * (-0.08 + stance * 0.02));

    // Upper leg armor
    const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
    legGrad.addColorStop(0, "#4a4a5a");
    legGrad.addColorStop(0.3, "#7a7a8a");
    legGrad.addColorStop(0.7, "#8a8a9a");
    legGrad.addColorStop(1, "#5a5a6a");
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.065, 0, size * 0.13, size * 0.24);

    // Knee guard with spike
    ctx.fillStyle = "#9a9aaa";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.08, size * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a6a7a";
    ctx.beginPath();
    ctx.moveTo(0, size * 0.06);
    ctx.lineTo(-size * 0.02, size * 0.02);
    ctx.lineTo(size * 0.02, size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Armored boot
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(-size * 0.075, size * 0.2, size * 0.15, size * 0.09);
    ctx.fillStyle = "#5a5a6a";
    ctx.fillRect(-size * 0.08, size * 0.27, size * 0.16, size * 0.04);
    ctx.restore();
  }

  // === DARK PLATE ARMOR ===
  // Back plate
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.26, y - size * 0.12 + breathe * 0.5);
  ctx.lineTo(x + size * 0.26, y - size * 0.12 + breathe * 0.5);
  ctx.lineTo(x + size * 0.24, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.1,
    x + size * 0.22,
    y + size * 0.2
  );
  plateGrad.addColorStop(0, "#5a5a6a");
  plateGrad.addColorStop(0.2, "#8a8a9a");
  plateGrad.addColorStop(0.5, "#aaaabb");
  plateGrad.addColorStop(0.8, "#8a8a9a");
  plateGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.24 + breathe * 0.3,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate battle damage/details
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + breathe * 0.7, size * 0.14, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Dark sigil on chest
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.05 + breathe);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.08, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Glowing center
  const sigilGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackIntensity * 0.4;
  ctx.fillStyle = `rgba(200, 80, 0, ${sigilGlow})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Battle belt
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(
    x - size * 0.2,
    y + size * 0.28 + breathe,
    size * 0.4,
    size * 0.07
  );
  // Belt skull buckle
  ctx.fillStyle = "#c0c0d0";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.315 + breathe, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === MASSIVE PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.28;
    const pauldronY = y - size * 0.08 + breathe * 0.5;

    // Main pauldron
    ctx.fillStyle = "#7a7a8a";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY,
      size * 0.12,
      size * 0.09,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Pauldron spike
    ctx.fillStyle = "#5a5a6a";
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.08, pauldronY - size * 0.06);
    ctx.lineTo(pauldronX + side * size * 0.18, pauldronY - size * 0.02);
    ctx.lineTo(pauldronX + side * size * 0.1, pauldronY + size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Pauldron trim
    ctx.fillStyle = "#9a9aaa";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY + size * 0.02,
      size * 0.1,
      size * 0.04,
      side * 0.3,
      0,
      Math.PI
    );
    ctx.fill();
  }

  // === ARMS ===
  // Left arm
  ctx.fillStyle = "#5a5a6a";
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(-0.25 - (isAttacking ? bodyLean * 0.6 : 0));
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // Right arm (sword arm - swings dramatically)
  ctx.save();
  const armSwing = isAttacking ? -1.2 + attackPhase * 2.8 : 0.2 + stance * 0.03;
  ctx.translate(
    x + size * 0.3,
    y +
      size * 0.02 +
      breathe * 0.5 -
      (isAttacking ? size * 0.12 * swordSwing * 0.3 : 0)
  );
  ctx.rotate(armSwing);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // === SOUL-FORGED GREATSWORD ===
  ctx.save();
  const swordAngle = isAttacking
    ? -1.4 + attackPhase * 3.2
    : -0.35 + stance * 0.04;
  const swordX = x + size * 0.4 + (isAttacking ? swordSwing * size * 0.22 : 0);
  const swordY =
    y -
    size * 0.08 +
    breathe * 0.5 -
    (isAttacking ? Math.abs(swordSwing) * size * 0.18 : 0);
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  // Wrapped handle
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(-size * 0.028, size * 0.1, size * 0.056, size * 0.2);
  ctx.strokeStyle = "#4a3525";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.028, size * 0.12 + i * size * 0.035);
    ctx.lineTo(size * 0.028, size * 0.14 + i * size * 0.035);
    ctx.stroke();
  }

  // Ornate crossguard
  ctx.fillStyle = "#8b0000";
  ctx.fillRect(-size * 0.12, size * 0.07, size * 0.24, size * 0.05);
  ctx.fillStyle = "#aa2020";
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.095, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.095, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Crossguard gems
  ctx.fillStyle = `rgba(255, 200, 50, ${0.7 + attackIntensity * 0.3})`;
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.095, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.095, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Massive blade with dark runes
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = (15 + attackIntensity * 10) * zoom;
  }
  const bladeGrad = ctx.createLinearGradient(-size * 0.05, 0, size * 0.05, 0);
  bladeGrad.addColorStop(0, "#808090");
  bladeGrad.addColorStop(0.15, "#c0c0d0");
  bladeGrad.addColorStop(0.5, "#e8e8f0");
  bladeGrad.addColorStop(0.85, "#c0c0d0");
  bladeGrad.addColorStop(1, "#707080");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.07);
  ctx.lineTo(-size * 0.055, -size * 0.55);
  ctx.lineTo(0, -size * 0.65);
  ctx.lineTo(size * 0.055, -size * 0.55);
  ctx.lineTo(size * 0.05, size * 0.07);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Blade runes (glow during attack)
  const runeGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.5;
  ctx.fillStyle = `rgba(200, 80, 0, ${runeGlow})`;
  for (let i = 0; i < 4; i++) {
    const runeY = -size * 0.1 - i * size * 0.12;
    ctx.fillRect(-size * 0.015, runeY, size * 0.03, size * 0.06);
  }

  // Blade edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.lineTo(0, -size * 0.62);
  ctx.stroke();

  // Devastating swing trail
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const trailAlpha = Math.sin(((attackPhase - 0.15) / 0.7) * Math.PI) * 0.7;
    ctx.strokeStyle = `rgba(255, 150, 50, ${trailAlpha})`;
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.45, size * 0.25, -size * 0.1);
    ctx.stroke();

    // Secondary trail
    ctx.strokeStyle = `rgba(255, 200, 100, ${trailAlpha * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.5, size * 0.3, -size * 0.15);
    ctx.stroke();
  }

  ctx.restore();

  // === SHIELD (on back) ===
  ctx.save();
  ctx.translate(x - size * 0.35, y + size * 0.05 + breathe);
  ctx.rotate(-0.45);
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.1, -size * 0.12);
  ctx.lineTo(-size * 0.08, size * 0.14);
  ctx.lineTo(0, size * 0.18);
  ctx.lineTo(size * 0.08, size * 0.14);
  ctx.lineTo(size * 0.1, -size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Shield emblem
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.14);
  ctx.lineTo(-size * 0.06, -size * 0.06);
  ctx.lineTo(-size * 0.04, size * 0.1);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.04, size * 0.1);
  ctx.lineTo(size * 0.06, -size * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === GREAT HELM ===
  // Neck guard
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(
    x - size * 0.09,
    y - size * 0.24 + breathe * 0.3,
    size * 0.18,
    size * 0.14
  );

  // Great helm base
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05,
    y - size * 0.42,
    0,
    x,
    y - size * 0.38,
    size * 0.2
  );
  helmGrad.addColorStop(0, "#9a9aaa");
  helmGrad.addColorStop(0.5, "#7a7a8a");
  helmGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + breathe * 0.2, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Face plate
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.44 + breathe * 0.2);
  ctx.lineTo(x - size * 0.16, y - size * 0.32 + breathe * 0.2);
  ctx.lineTo(x, y - size * 0.26 + breathe * 0.2);
  ctx.lineTo(x + size * 0.16, y - size * 0.32 + breathe * 0.2);
  ctx.lineTo(x + size * 0.14, y - size * 0.44 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();

  // Visor with breathing holes
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(
    x - size * 0.12,
    y - size * 0.42 + breathe * 0.2,
    size * 0.24,
    size * 0.05
  );
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.06 + i * size * 0.06,
      y - size * 0.35 + breathe * 0.2,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Glowing eyes
  const eyeGlow = 0.6 + Math.sin(time * 3) * 0.3 + attackIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 150, 50, ${eyeGlow})`;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.05,
    y - size * 0.4 + breathe * 0.2,
    size * 0.018,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.05,
    y - size * 0.4 + breathe * 0.2,
    size * 0.018,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dramatic plume
  ctx.fillStyle = "#dd4400";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.56 + breathe * 0.2);
  const crestWave =
    Math.sin(time * 5) * 1.5 + (isAttacking ? swordSwing * 1.2 : 0);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const cx = x + (t - 0.5) * size * 0.25 + crestWave * 2.5 * (1 - t);
    const cy =
      y -
      size * 0.56 -
      t * size * 0.28 -
      Math.sin(t * Math.PI) * size * 0.1 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  for (let i = 6; i >= 0; i--) {
    const t = i / 6;
    const cx = x + (t - 0.5) * size * 0.25 + crestWave * 2.5 * (1 - t);
    const cy =
      y -
      size * 0.56 -
      t * size * 0.24 -
      Math.sin(t * Math.PI) * size * 0.06 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fill();

  // Battle cry shockwave during attack
  if (isAttacking && attackPhase > 0.25 && attackPhase < 0.65) {
    const cryAlpha = Math.sin(((attackPhase - 0.25) / 0.4) * Math.PI) * 0.5;
    ctx.strokeStyle = `rgba(255, 100, 50, ${cryAlpha})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(x, y - size * 0.38, size * (0.2 + r * 0.12), -0.9, 0.9);
      ctx.stroke();
    }
  }

  ctx.restore();
}
// ============================================================================
// TURRET TROOP - Engineer's Deployable Spider Turret (Enhanced)
// ============================================================================
function drawTurretTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y2: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  // ENGINEER'S SPIDER TURRET - Mechanical quad-leg sentry platform
  const y = y2 + 12;

  // Scale up the turret
  const scale = 1.4;
  const s = size * scale;

  // Calculate rotation toward target
  let rotation = 0;
  if (targetPos) {
    rotation = Math.atan2(targetPos.y - y, targetPos.x - x);
  } else {
    // Idle scanning when no target
    rotation = Math.sin(time * 1.2) * 3.14;
  }

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Attack timing calculations
  const isAttacking = attackPhase > 0;
  let recoilOffset = 0;
  let turretShake = 0;
  let heatGlow = 0;
  let shieldPulse = 0;

  if (isAttacking) {
    const firePhase = 1 - attackPhase;
    if (firePhase < 0.12) {
      recoilOffset = (firePhase / 0.12) * 5 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 30) * 2 * zoom;
    } else if (firePhase < 0.45) {
      const returnPhase = (firePhase - 0.12) / 0.33;
      recoilOffset =
        5 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 2);
      turretShake =
        Math.sin(returnPhase * Math.PI * 10) * (1 - returnPhase) * 1.2 * zoom;
    }
    heatGlow = Math.max(0, 1 - firePhase * 1.8);
    shieldPulse = Math.sin(firePhase * Math.PI * 4) * 0.3;
  }

  // Pitch calculation for aiming down
  const towerElevation = s * 0.35;
  const barrelBaseLength = s * 0.45;
  const pitch = Math.atan2(towerElevation, barrelBaseLength * 2.2);
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);

  // Apply shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;

  // Leg animation
  const legCycle = time * 3;
  const legTwitch = isAttacking ? Math.sin(time * 25) * 2 : 0;

  ctx.save();

  // ========== MECHANICAL SPIDER LEGS ==========
  // Draw 4 legs - 2 front, 2 back
  const legConfigs = [
    { angle: Math.PI * 0.25, side: 1, phase: 0 }, // Front right
    { angle: Math.PI * 0.75, side: 1, phase: 0.5 }, // Back right
    { angle: -Math.PI * 0.25, side: -1, phase: 0.25 }, // Front left
    { angle: -Math.PI * 0.75, side: -1, phase: 0.75 }, // Back left
  ];

  // Draw back legs first (depth sorting)
  legConfigs
    .filter((l) => Math.sin(l.angle + rotation) < 0)
    .forEach((leg) => {
      drawSpiderLeg(
        ctx,
        x,
        y,
        s,
        leg.angle + rotation * 0.3,
        leg.side,
        legCycle + leg.phase,
        legTwitch,
        zoom
      );
    });

  // ========== CENTRAL BODY/CHASSIS ==========
  const bodyY = y - s * 0.08;

  // Lower chassis - armored underbody
  const chassisGrad = ctx.createLinearGradient(
    x - s * 0.4,
    bodyY + s * 0.15,
    x + s * 0.4,
    bodyY - s * 0.2
  );
  chassisGrad.addColorStop(0, "#252530");
  chassisGrad.addColorStop(0.3, "#3a3a48");
  chassisGrad.addColorStop(0.6, "#32323f");
  chassisGrad.addColorStop(1, "#1a1a24");
  ctx.fillStyle = chassisGrad;

  // Isometric hexagonal chassis
  ctx.beginPath();
  ctx.moveTo(x, bodyY + s * 0.28);
  ctx.lineTo(x - s * 0.38, bodyY + s * 0.12);
  ctx.lineTo(x - s * 0.42, bodyY - s * 0.08);
  ctx.lineTo(x - s * 0.3, bodyY - s * 0.22);
  ctx.lineTo(x + s * 0.3, bodyY - s * 0.22);
  ctx.lineTo(x + s * 0.42, bodyY - s * 0.08);
  ctx.lineTo(x + s * 0.38, bodyY + s * 0.12);
  ctx.closePath();
  ctx.fill();

  // Chassis edge highlights
  ctx.strokeStyle = "#4a4a58";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, bodyY - s * 0.22);
  ctx.lineTo(x + s * 0.3, bodyY - s * 0.22);
  ctx.lineTo(x + s * 0.42, bodyY - s * 0.08);
  ctx.stroke();

  // ========== ENERGY SHIELD PROJECTOR ==========
  const shieldActive = true; // Could be tied to HP or ability
  const shieldAlpha = 0.25 + Math.sin(time * 3) * 0.1 + shieldPulse;

  if (shieldActive) {
    // Shield dome effect
    const shieldGrad = ctx.createRadialGradient(
      x,
      bodyY - s * 0.1,
      0,
      x,
      bodyY - s * 0.1,
      s * 0.55
    );
    shieldGrad.addColorStop(0, `rgba(100, 200, 255, 0)`);
    shieldGrad.addColorStop(0.6, `rgba(80, 180, 255, ${shieldAlpha * 0.3})`);
    shieldGrad.addColorStop(0.85, `rgba(60, 160, 255, ${shieldAlpha * 0.5})`);
    shieldGrad.addColorStop(0.95, `rgba(100, 200, 255, ${shieldAlpha * 0.8})`);
    shieldGrad.addColorStop(1, `rgba(150, 220, 255, ${shieldAlpha * 0.2})`);

    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.ellipse(x, bodyY - s * 0.05, s * 0.52, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shield hex pattern
    ctx.strokeStyle = `rgba(100, 200, 255, ${shieldAlpha * 0.6})`;
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 6; i++) {
      const hexAngle = (i / 6) * Math.PI * 2 + time * 0.5;
      const hexR = s * 0.4;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(hexAngle) * hexR,
        bodyY - s * 0.05 + Math.sin(hexAngle) * hexR * 0.6
      );
      ctx.lineTo(
        x + Math.cos(hexAngle + Math.PI / 6) * hexR * 0.7,
        bodyY - s * 0.05 + Math.sin(hexAngle + Math.PI / 6) * hexR * 0.42
      );
      ctx.stroke();
    }

    // Shield edge glow
    ctx.strokeStyle = `rgba(100, 200, 255, ${shieldAlpha * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      bodyY - s * 0.05,
      s * 0.5,
      s * 0.33,
      0,
      Math.PI * 0.1,
      Math.PI * 0.9
    );
    ctx.stroke();
  }

  // ========== ROTATION RING ==========
  ctx.fillStyle = "#2a2a35";
  ctx.beginPath();
  ctx.ellipse(x, bodyY - s * 0.1, s * 0.32, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gear teeth on rotation ring
  ctx.fillStyle = "#4a4a58";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = x + Math.cos(toothAngle) * s * 0.3;
    const toothY = bodyY - s * 0.1 + Math.sin(toothAngle) * s * 0.09;
    ctx.beginPath();
    ctx.arc(toothX, toothY, s * 0.022, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner rotation platform
  ctx.fillStyle = "#3a3a48";
  ctx.beginPath();
  ctx.ellipse(x, bodyY - s * 0.12, s * 0.26, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // ========== TURRET HOUSING ==========
  const turretX = x + shakeX;
  const turretY = bodyY - s * 0.15 + shakeY;
  const facingAway = sinR < -0.25;

  // Draw barrels behind if facing away
  if (facingAway) {
    drawTurretGunAssembly(
      ctx,
      turretX,
      turretY,
      rotation,
      foreshorten,
      pitch,
      pitchCos,
      pitchSin,
      s,
      zoom,
      time,
      recoilOffset,
      isAttacking,
      heatGlow
    );
  }

  // Main turret dome
  const domeGrad = ctx.createRadialGradient(
    turretX - s * 0.06,
    turretY - s * 0.15,
    0,
    turretX,
    turretY - s * 0.08,
    s * 0.25
  );
  domeGrad.addColorStop(0, "#7a7a88");
  domeGrad.addColorStop(0.3, "#5a5a68");
  domeGrad.addColorStop(0.7, "#4a4a58");
  domeGrad.addColorStop(1, "#3a3a48");
  ctx.fillStyle = domeGrad;

  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - s * 0.06,
    s * 0.22,
    s * 0.14,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Turret top cap
  const capGrad = ctx.createRadialGradient(
    turretX - s * 0.03,
    turretY - s * 0.2,
    0,
    turretX,
    turretY - s * 0.16,
    s * 0.12
  );
  capGrad.addColorStop(0, "#8a8a98");
  capGrad.addColorStop(0.5, "#6a6a78");
  capGrad.addColorStop(1, "#5a5a68");
  ctx.fillStyle = capGrad;

  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - s * 0.16,
    s * 0.14,
    s * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ========== ROTATING ARMOR SEGMENTS ==========
  for (let i = 0; i < 8; i++) {
    const plateAngle = rotation + (i / 8) * Math.PI * 2;
    const plateVisible = Math.cos(plateAngle - rotation);

    if (plateVisible > -0.35) {
      const shade = 0.4 + plateVisible * 0.4;
      const innerR = s * 0.1;
      const outerR = s * 0.2;

      const plateX1 = turretX + Math.cos(plateAngle) * innerR;
      const plateY1 = turretY - s * 0.06 + Math.sin(plateAngle) * innerR * 0.55;
      const plateX2 = turretX + Math.cos(plateAngle) * outerR;
      const plateY2 = turretY - s * 0.06 + Math.sin(plateAngle) * outerR * 0.55;

      ctx.strokeStyle = `rgba(110, 110, 125, ${shade})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(plateX1, plateY1);
      ctx.lineTo(plateX2, plateY2);
      ctx.stroke();

      // Plate rivets
      ctx.fillStyle = `rgba(85, 85, 100, ${shade})`;
      ctx.beginPath();
      ctx.arc(plateX2, plateY2, s * 0.018, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== CENTRAL PIVOT & CORE ==========
  ctx.fillStyle = "#2a2a35";
  ctx.beginPath();
  ctx.arc(turretX, turretY - s * 0.06, s * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring
  ctx.strokeStyle = "#5a5a68";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - s * 0.06, s * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Power core glow
  const coreGlow = 0.65 + Math.sin(time * 5) * 0.25 + heatGlow * 0.4;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - s * 0.06,
    0,
    turretX,
    turretY - s * 0.06,
    s * 0.06
  );
  coreGrad.addColorStop(0, `rgba(255, 180, 80, ${coreGlow})`);
  coreGrad.addColorStop(0.35, `rgba(255, 120, 30, ${coreGlow * 0.75})`);
  coreGrad.addColorStop(0.7, `rgba(255, 80, 0, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - s * 0.06, s * 0.055, 0, Math.PI * 2);
  ctx.fill();

  // ========== SENSOR ARRAY ==========
  // Main sensor
  const sensorGlow = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = "#3a3a48";
  ctx.beginPath();
  ctx.arc(turretX, turretY - s * 0.2, s * 0.055, 0, Math.PI * 2);
  ctx.fill();

  // Sensor eye - changes color when targeting
  const sensorColor = targetPos
    ? `rgba(255, 100, 100, ${sensorGlow})`
    : `rgba(0, 200, 255, ${sensorGlow})`;
  ctx.fillStyle = sensorColor;
  ctx.shadowColor = targetPos ? "#ff6464" : "#00ccff";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - s * 0.2, s * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Targeting sweep when active
  if (targetPos) {
    ctx.strokeStyle = `rgba(255, 100, 100, ${sensorGlow * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    const sweepAngle = time * 8;
    ctx.beginPath();
    ctx.arc(
      turretX,
      turretY - s * 0.2,
      s * 0.045,
      sweepAngle,
      sweepAngle + 0.8
    );
    ctx.stroke();
  }

  // Side sensors
  for (let side = -1; side <= 1; side += 2) {
    const sideX = turretX + side * s * 0.16;
    const sideY = turretY - s * 0.14;

    ctx.fillStyle = "#3a3a48";
    ctx.beginPath();
    ctx.arc(sideX, sideY, s * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(100, 255, 150, ${
      0.5 + Math.sin(time * 5 + side) * 0.3
    })`;
    ctx.beginPath();
    ctx.arc(sideX, sideY, s * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== DRAW BARRELS (if not facing away) ==========
  if (!facingAway) {
    drawTurretGunAssembly(
      ctx,
      turretX,
      turretY,
      rotation,
      foreshorten,
      pitch,
      pitchCos,
      pitchSin,
      s,
      zoom,
      time,
      recoilOffset,
      isAttacking,
      heatGlow
    );
  }

  // ========== DRAW FRONT LEGS ==========
  legConfigs
    .filter((l) => Math.sin(l.angle + rotation) >= 0)
    .forEach((leg) => {
      drawSpiderLeg(
        ctx,
        x,
        y,
        s,
        leg.angle + rotation * 0.3,
        leg.side,
        legCycle + leg.phase,
        legTwitch,
        zoom
      );
    });

  // ========== AMMUNITION HOPPERS ==========
  // Left hopper
  const hopperGrad = ctx.createLinearGradient(
    x - s * 0.38,
    bodyY,
    x - s * 0.22,
    bodyY + s * 0.15
  );
  hopperGrad.addColorStop(0, "#c65d0a");
  hopperGrad.addColorStop(0.5, "#f97316");
  hopperGrad.addColorStop(1, "#a54d08");
  ctx.fillStyle = hopperGrad;

  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, bodyY + s * 0.1);
  ctx.lineTo(x - s * 0.35, bodyY - s * 0.04);
  ctx.lineTo(x - s * 0.28, bodyY - s * 0.1);
  ctx.lineTo(x - s * 0.2, bodyY - s * 0.1);
  ctx.lineTo(x - s * 0.2, bodyY + s * 0.06);
  ctx.lineTo(x - s * 0.28, bodyY + s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Hopper top highlight
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, bodyY - s * 0.04);
  ctx.lineTo(x - s * 0.28, bodyY - s * 0.1);
  ctx.lineTo(x - s * 0.2, bodyY - s * 0.1);
  ctx.lineTo(x - s * 0.27, bodyY - s * 0.04);
  ctx.closePath();
  ctx.fill();

  // Ammo belt
  ctx.fillStyle = "#d97706";
  for (let i = 0; i < 5; i++) {
    const beltY = bodyY - s * 0.06 + i * s * 0.03;
    ctx.beginPath();
    ctx.ellipse(x - s * 0.27, beltY, s * 0.022, s * 0.01, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Right hopper (mirrored)
  ctx.fillStyle = hopperGrad;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.35, bodyY + s * 0.1);
  ctx.lineTo(x + s * 0.35, bodyY - s * 0.04);
  ctx.lineTo(x + s * 0.28, bodyY - s * 0.1);
  ctx.lineTo(x + s * 0.2, bodyY - s * 0.1);
  ctx.lineTo(x + s * 0.2, bodyY + s * 0.06);
  ctx.lineTo(x + s * 0.28, bodyY + s * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.35, bodyY - s * 0.04);
  ctx.lineTo(x + s * 0.28, bodyY - s * 0.1);
  ctx.lineTo(x + s * 0.2, bodyY - s * 0.1);
  ctx.lineTo(x + s * 0.27, bodyY - s * 0.04);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const beltY = bodyY - s * 0.06 + i * s * 0.03;
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.ellipse(
      x + s * 0.27,
      beltY,
      s * 0.022,
      s * 0.01,
      -0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ========== STATUS PANEL ==========
  // Main status light
  const statusGlow = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = isAttacking
    ? `rgba(255, 100, 50, ${statusGlow + 0.3})`
    : `rgba(50, 255, 100, ${statusGlow})`;
  ctx.shadowColor = isAttacking ? "#ff6432" : "#32ff64";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x, bodyY + s * 0.15, s * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Shield status indicator
  if (shieldActive) {
    ctx.fillStyle = `rgba(100, 200, 255, ${0.6 + Math.sin(time * 4) * 0.2})`;
    ctx.beginPath();
    ctx.arc(x - s * 0.08, bodyY + s * 0.15, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.arc(x + s * 0.08, bodyY + s * 0.15, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== ENGINEER EMBLEM ==========
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, bodyY + s * 0.24, s * 0.04, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating gear teeth
  for (let i = 0; i < 8; i++) {
    const gearAngle = (i / 8) * Math.PI * 2 + time * 0.8;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(gearAngle) * s * 0.04,
      bodyY + s * 0.24 + Math.sin(gearAngle) * s * 0.04
    );
    ctx.lineTo(
      x + Math.cos(gearAngle) * s * 0.058,
      bodyY + s * 0.24 + Math.sin(gearAngle) * s * 0.058
    );
    ctx.stroke();
  }

  // ========== TARGETING LASER ==========
  if (targetPos && isAttacking) {
    const laserIntensity = 0.7 + Math.sin(time * 25) * 0.2;

    // Calculate where laser should point
    const laserStartX = turretX;
    const laserStartY = turretY - s * 0.1;
    const laserLength = s * 0.7;
    const laserEndX = laserStartX + cosR * laserLength * pitchCos;
    const laserEndY =
      laserStartY + sinR * laserLength * 0.5 + laserLength * pitchSin * 0.4;

    // Laser beam
    ctx.strokeStyle = `rgba(255, 50, 50, ${laserIntensity * 0.6})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([3 * zoom, 2 * zoom]);
    ctx.beginPath();
    ctx.moveTo(laserStartX, laserStartY);
    ctx.lineTo(laserEndX, laserEndY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser impact point
    ctx.fillStyle = `rgba(255, 50, 50, ${laserIntensity})`;
    ctx.shadowColor = "#ff3232";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    ctx.arc(laserEndX, laserEndY, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// Helper function for spider legs
function drawSpiderLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  angle: number,
  side: number,
  phase: number,
  twitch: number,
  zoom: number
) {
  const legBase = { x: x, y: y + s * 0.05 };

  // Calculate leg segments
  const upperLength = s * 0.25;
  const lowerLength = s * 0.3;

  // Add subtle idle movement
  const breathe = Math.sin(phase * Math.PI * 2) * 3 + twitch;

  // Joint positions
  const kneeAngle = angle + Math.PI * 0.15 * side;
  const kneeX = legBase.x + Math.cos(angle) * upperLength;
  const kneeY =
    legBase.y + Math.sin(angle) * upperLength * 0.5 - s * 0.08 + breathe * 0.3;

  const footAngle = angle - Math.PI * 0.1 * side;
  const footX = kneeX + Math.cos(footAngle) * lowerLength;
  const footY =
    kneeY + Math.sin(footAngle) * lowerLength * 0.5 + s * 0.15 + breathe * 0.15;

  // Draw leg with gradient
  const legGrad = ctx.createLinearGradient(legBase.x, legBase.y, footX, footY);
  legGrad.addColorStop(0, "#4a4a58");
  legGrad.addColorStop(0.4, "#5a5a68");
  legGrad.addColorStop(0.6, "#4a4a58");
  legGrad.addColorStop(1, "#3a3a48");

  ctx.strokeStyle = legGrad;
  ctx.lineWidth = s * 0.045;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Upper leg segment
  ctx.beginPath();
  ctx.moveTo(legBase.x, legBase.y);
  ctx.lineTo(kneeX, kneeY);
  ctx.stroke();

  // Lower leg segment
  ctx.beginPath();
  ctx.moveTo(kneeX, kneeY);
  ctx.lineTo(footX, footY);
  ctx.stroke();

  // Knee joint
  ctx.fillStyle = "#5a5a68";
  ctx.beginPath();
  ctx.arc(kneeX, kneeY, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Knee joint highlight
  ctx.fillStyle = "#6a6a78";
  ctx.beginPath();
  ctx.arc(kneeX - s * 0.01, kneeY - s * 0.01, s * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Foot pad
  ctx.fillStyle = "#3a3a48";
  ctx.beginPath();
  ctx.ellipse(footX, footY, s * 0.04, s * 0.02, angle * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Foot grip details
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(footX, footY, s * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Hydraulic detail on upper leg
  ctx.strokeStyle = "#6a6a78";
  ctx.lineWidth = s * 0.015;
  const midUpperX = (legBase.x + kneeX) / 2;
  const midUpperY = (legBase.y + kneeY) / 2;
  ctx.beginPath();
  ctx.moveTo(midUpperX - s * 0.015, midUpperY);
  ctx.lineTo(midUpperX + s * 0.015, midUpperY);
  ctx.stroke();
}

// Helper function for gun assembly with isometric perspective and pitch
function drawTurretGunAssembly(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  pitch: number,
  pitchCos: number,
  pitchSin: number,
  s: number,
  zoom: number,
  time: number,
  recoilOffset: number,
  isAttacking: boolean,
  heatGlow: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Barrel dimensions
  const barrelBaseLength = s * 0.4;
  const barrelWidth = s * 0.04;
  const barrelSpacing = s * 0.055;

  // Apply pitch to barrel length
  const effectiveBarrelLength =
    barrelBaseLength * (0.5 + foreshorten * 0.5) * pitchCos;
  const pitchDrop =
    barrelBaseLength * (0.5 + foreshorten * 0.5) * pitchSin * 0.5;

  // Gun housing/mantlet
  const mantletX = pivotX + cosR * s * 0.08 - cosR * recoilOffset * 0.3;
  const mantletY = pivotY + sinR * s * 0.04 - sinR * recoilOffset * 0.15;

  const mantletGrad = ctx.createLinearGradient(
    mantletX - s * 0.08,
    mantletY,
    mantletX + s * 0.08,
    mantletY
  );
  mantletGrad.addColorStop(0, "#4a4a58");
  mantletGrad.addColorStop(0.3, "#5a5a68");
  mantletGrad.addColorStop(0.7, "#4a4a58");
  mantletGrad.addColorStop(1, "#3a3a48");
  ctx.fillStyle = mantletGrad;

  ctx.beginPath();
  ctx.ellipse(mantletX, mantletY, s * 0.09, s * 0.06, rotation, 0, Math.PI * 2);
  ctx.fill();

  // Draw dual barrels
  for (let barrel = -1; barrel <= 1; barrel += 2) {
    const perpX = -sinR * barrelSpacing * barrel;
    const perpY = cosR * barrelSpacing * barrel * 0.5;

    const bStartX = pivotX + perpX + cosR * s * 0.06 - cosR * recoilOffset;
    const bStartY =
      pivotY + perpY + sinR * s * 0.03 - sinR * recoilOffset * 0.5;

    const bEndX = bStartX + cosR * effectiveBarrelLength;
    const bEndY = bStartY + sinR * effectiveBarrelLength * 0.5 + pitchDrop;

    const bPerpX = -sinR * barrelWidth;
    const bPerpY = cosR * barrelWidth * 0.5;

    // Barrel housing
    ctx.fillStyle = "#4a4a58";
    ctx.beginPath();
    ctx.ellipse(
      bStartX,
      bStartY,
      barrelWidth * 1.4,
      barrelWidth * 0.7,
      rotation,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Main barrel body
    const barrelGrad = ctx.createLinearGradient(
      bStartX + bPerpX,
      bStartY + bPerpY,
      bStartX - bPerpX,
      bStartY - bPerpY
    );
    barrelGrad.addColorStop(0, "#6a6a78");
    barrelGrad.addColorStop(0.3, "#5a5a68");
    barrelGrad.addColorStop(0.7, "#4a4a58");
    barrelGrad.addColorStop(1, "#3a3a48");
    ctx.fillStyle = barrelGrad;

    ctx.beginPath();
    ctx.moveTo(bStartX + bPerpX, bStartY + bPerpY);
    ctx.lineTo(bEndX + bPerpX * 0.7, bEndY + bPerpY * 0.7);
    ctx.lineTo(bEndX - bPerpX * 0.7, bEndY - bPerpY * 0.7);
    ctx.lineTo(bStartX - bPerpX, bStartY - bPerpY);
    ctx.closePath();
    ctx.fill();

    // Reinforcement bands
    ctx.strokeStyle = "#7a7a88";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 3; i++) {
      const t = 0.2 + i * 0.25;
      const bx = bStartX + cosR * effectiveBarrelLength * t;
      const by =
        bStartY + sinR * effectiveBarrelLength * t * 0.5 + pitchDrop * t;
      const widthMult = 1 - t * 0.3;
      ctx.beginPath();
      ctx.moveTo(bx + bPerpX * widthMult, by + bPerpY * widthMult);
      ctx.lineTo(bx - bPerpX * widthMult, by - bPerpY * widthMult);
      ctx.stroke();
    }

    // Heat glow
    if (heatGlow > 0) {
      ctx.strokeStyle = `rgba(255, 100, 30, ${heatGlow * 0.35})`;
      ctx.lineWidth = barrelWidth * 0.7;
      ctx.beginPath();
      ctx.moveTo(bStartX, bStartY);
      ctx.lineTo(bEndX, bEndY);
      ctx.stroke();
    }

    // Muzzle brake
    const muzzleStart = 0.82;
    const msx = bStartX + cosR * effectiveBarrelLength * muzzleStart;
    const msy =
      bStartY +
      sinR * effectiveBarrelLength * muzzleStart * 0.5 +
      pitchDrop * muzzleStart;

    ctx.fillStyle = "#3a3a48";
    ctx.beginPath();
    ctx.moveTo(msx + bPerpX * 0.7, msy + bPerpY * 0.7);
    ctx.lineTo(bEndX + bPerpX * 1.15, bEndY + bPerpY * 1.15);
    ctx.lineTo(bEndX - bPerpX * 1.15, bEndY - bPerpY * 1.15);
    ctx.lineTo(msx - bPerpX * 0.7, msy - bPerpY * 0.7);
    ctx.closePath();
    ctx.fill();

    // Muzzle bore
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.ellipse(
      bEndX + cosR * zoom,
      bEndY + sinR * zoom * 0.5 + pitchSin * zoom,
      barrelWidth * 0.5 * foreshorten * pitchCos + barrelWidth * 0.2,
      barrelWidth * 0.35,
      rotation,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Muzzle flash
    if (isAttacking && heatGlow > 0.25) {
      const flashSize = s * 0.07 * heatGlow;
      const flashX = bEndX + cosR * s * 0.04;
      const flashY = bEndY + sinR * s * 0.02 + pitchDrop * 0.12;

      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 12 * zoom;

      const flashGrad = ctx.createRadialGradient(
        flashX,
        flashY,
        0,
        flashX,
        flashY,
        flashSize
      );
      flashGrad.addColorStop(0, `rgba(255, 255, 220, ${heatGlow})`);
      flashGrad.addColorStop(0.2, `rgba(255, 220, 100, ${heatGlow * 0.9})`);
      flashGrad.addColorStop(0.5, `rgba(255, 150, 50, ${heatGlow * 0.6})`);
      flashGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);

      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
      ctx.fill();

      // Flash streaks
      ctx.strokeStyle = `rgba(255, 200, 100, ${heatGlow * 0.5})`;
      ctx.lineWidth = 1.5 * zoom;
      for (let i = 0; i < 4; i++) {
        const streakAngle = rotation + (i / 4) * Math.PI * 2 + time * 12;
        const streakLen = flashSize * (0.7 + Math.random() * 0.5);
        ctx.beginPath();
        ctx.moveTo(flashX, flashY);
        ctx.lineTo(
          flashX + Math.cos(streakAngle) * streakLen,
          flashY + Math.sin(streakAngle) * streakLen * 0.5
        );
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    }
  }

  // Shell casings
  if (isAttacking && heatGlow > 0.45) {
    const casingEjectX = pivotX - sinR * s * 0.12;
    const casingEjectY = pivotY + cosR * s * 0.06;

    ctx.fillStyle = "#daa520";
    for (let i = 0; i < 2; i++) {
      const casingOffset = (1 - heatGlow) * s * 0.12 + i * s * 0.04;
      const casingX = casingEjectX + casingOffset * (Math.random() - 0.5);
      const casingY = casingEjectY + casingOffset + Math.random() * s * 0.04;

      ctx.beginPath();
      ctx.ellipse(
        casingX,
        casingY,
        s * 0.012,
        s * 0.006,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Smoke wisps
  if (isAttacking && heatGlow < 0.65 && heatGlow > 0.08) {
    const smokePhase = 1 - heatGlow;
    for (let barrel = -1; barrel <= 1; barrel += 2) {
      const perpX = -sinR * barrelSpacing * barrel;
      const perpY = cosR * barrelSpacing * barrel * 0.5;

      const smokeX =
        pivotX +
        perpX +
        cosR * effectiveBarrelLength +
        (Math.random() - 0.5) * s * 0.04;
      const smokeY =
        pivotY +
        perpY +
        sinR * effectiveBarrelLength * 0.5 +
        pitchDrop -
        smokePhase * s * 0.08;

      ctx.fillStyle = `rgba(100, 100, 110, ${(1 - smokePhase) * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        smokeX,
        smokeY,
        s * 0.018 + smokePhase * s * 0.025,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}
