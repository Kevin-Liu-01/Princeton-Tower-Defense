import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

export function drawEngineerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  const s = size;
  const isAttacking = attackPhase > 0;
  const workAnimation = isAttacking ? Math.sin(attackPhase * Math.PI * 4) : 0;
  const toolSpark = isAttacking ? Math.sin(attackPhase * Math.PI * 8) : 0;
  const attackIntensity = attackPhase;
  const dataPulse = Math.sin(time * 5) * 0.5 + 0.5;
  const holoFlicker = Math.sin(time * 15) * 0.1 + 0.9;

  // Idle animation values
  const breathe = Math.sin(time * 2) * 2.5;
  const idleSway = Math.sin(time * 0.7) * s * 0.012;
  const headScan = Math.sin(time * 0.5) * s * 0.018;
  const toolFidget = isAttacking ? 0 : Math.sin(time * 1.2) * 0.12;
  const bodyBob = Math.sin(time * 1.6) * s * 0.008;

  drawAura(ctx, x, y, s, time, dataPulse, isAttacking);
  drawFloatingParticles(ctx, x, y, s, time);
  drawCircuitLines(ctx, x, y, s, time, dataPulse, zoom);
  drawShadow(ctx, x, y, s);
  drawBackpack(ctx, x + idleSway, y + bodyBob, s, time, dataPulse, zoom, isAttacking, attackIntensity);
  drawBody(ctx, x + idleSway, y + bodyBob, s, breathe, time, dataPulse, zoom);
  drawArmorSkirt(ctx, x + idleSway, y + bodyBob, s, breathe, time, dataPulse);
  drawBeltAndPouches(ctx, x + idleSway, y + bodyBob, s, time, dataPulse);
  drawThighRigs(ctx, x + idleSway, y + bodyBob, s, breathe, time, dataPulse);
  drawArmsAndRifle(
    ctx, x + idleSway, y + bodyBob, s, workAnimation, dataPulse, time, zoom,
    isAttacking, attackIntensity, targetPos, toolFidget,
  );
  drawHead(ctx, x + idleSway + headScan, y + bodyBob, s, time, dataPulse, holoFlicker, zoom);
  drawHoloGears(ctx, x, y, s, time, zoom);
  if (isAttacking) {
    drawAttackEffects(ctx, x, y, s, attackIntensity, holoFlicker, time, zoom);
  }
}

// ─── AURA ────────────────────────────────────────────────────────────────────

function drawAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  dataPulse: number,
  isAttacking: boolean,
) {
  const auraBase = isAttacking ? 0.38 : 0.22;
  const auraPulse = 0.85 + Math.sin(time * 4) * 0.15;
  for (let layer = 0; layer < 4; layer++) {
    const offset = layer * 0.08;
    const g = ctx.createRadialGradient(
      x, y, s * (0.1 + offset), x, y, s * (0.9 + offset * 0.3),
    );
    const a = (auraBase - layer * 0.04) * auraPulse;
    g.addColorStop(0, `rgba(0, 200, 255, ${a * 0.4})`);
    g.addColorStop(0.4, `rgba(100, 220, 255, ${a * 0.3})`);
    g.addColorStop(0.7, `rgba(234, 179, 8, ${a * 0.2})`);
    g.addColorStop(1, "rgba(0, 200, 255, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, s * (0.85 + offset * 0.2), s * (0.55 + offset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── FLOATING PARTICLES ──────────────────────────────────────────────────────

function drawFloatingParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
) {
  for (let p = 0; p < 14; p++) {
    const pAngle = (time * 2 + (p * Math.PI * 2) / 14) % (Math.PI * 2);
    const pDist = s * 0.6 + Math.sin(time * 3 + p * 0.8) * s * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.45;
    const pAlpha = 0.5 + Math.sin(time * 6 + p * 0.7) * 0.3;
    const colors = [
      `rgba(0, 220, 255, ${pAlpha})`,
      `rgba(234, 179, 8, ${pAlpha})`,
      `rgba(0, 255, 150, ${pAlpha})`,
    ];
    ctx.fillStyle = colors[p % 3];
    ctx.beginPath();
    ctx.rect(px - s * 0.015, py - s * 0.015, s * 0.03, s * 0.03);
    ctx.fill();
  }
}

// ─── CIRCUIT LINES ───────────────────────────────────────────────────────────

function drawCircuitLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  dataPulse: number,
  zoom: number,
) {
  ctx.strokeStyle = `rgba(0, 200, 255, ${0.3 + dataPulse * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  for (let c = 0; c < 6; c++) {
    const angle = (c * Math.PI) / 3 + time * 0.5;
    const dist = s * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist * 0.5);
    ctx.stroke();
    ctx.fillStyle = `rgba(0, 255, 200, ${0.5 + dataPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * dist * 0.7,
      y + Math.sin(angle) * dist * 0.35,
      s * 0.018, 0, Math.PI * 2,
    );
    ctx.fill();
  }
}

// ─── SHADOW ──────────────────────────────────────────────────────────────────

function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  const g = ctx.createRadialGradient(x, y + s * 0.52, 0, x, y + s * 0.52, s * 0.5);
  g.addColorStop(0, "rgba(0, 0, 0, 0.55)");
  g.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.52, s * 0.48, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── BACKPACK ────────────────────────────────────────────────────────────────

function drawBackpack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  dataPulse: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const g = ctx.createLinearGradient(x - s * 0.25, y - s * 0.2, x + s * 0.25, y + s * 0.3);
  g.addColorStop(0, "#2e2e3e");
  g.addColorStop(0.3, "#3e3e4e");
  g.addColorStop(0.7, "#2e2e3e");
  g.addColorStop(1, "#1e1e2e");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.26, y - s * 0.24, s * 0.52, s * 0.58, s * 0.06);
  ctx.fill();
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Backpack armored panels
  ctx.fillStyle = "#222232";
  for (let panel = 0; panel < 5; panel++) {
    ctx.fillRect(x - s * 0.2, y - s * 0.17 + panel * s * 0.1, s * 0.4, s * 0.065);
    const panelGlow = Math.sin(time * 4 + panel * 0.8) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(0, 200, 255, ${panelGlow})`;
    ctx.fillRect(x - s * 0.18, y - s * 0.16 + panel * s * 0.1, s * 0.36, s * 0.018);
    ctx.fillStyle = "#222232";
  }

  // Main comms antenna (tall, prominent, with sway)
  const antTipX = x + s * 0.22 + Math.sin(time * 1.0) * s * 0.04;
  const antTipY = y - s * 0.58;
  ctx.strokeStyle = "#6a6a6a";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.18, y - s * 0.18);
  ctx.quadraticCurveTo(
    x + s * 0.2 + Math.sin(time * 1.0) * s * 0.02, y - s * 0.38,
    antTipX, antTipY,
  );
  ctx.stroke();
  // Antenna thinner top section
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(antTipX, antTipY);
  ctx.lineTo(antTipX + Math.sin(time * 1.0) * s * 0.01, antTipY - s * 0.08);
  ctx.stroke();
  // Blinking red tip
  ctx.fillStyle = `rgba(255, 40, 40, ${0.5 + dataPulse * 0.5})`;
  ctx.shadowColor = "#ff2222";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(antTipX + Math.sin(time * 1.0) * s * 0.01, antTipY - s * 0.08, s * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Antenna base mount
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.roundRect(x + s * 0.15, y - s * 0.2, s * 0.06, s * 0.04, s * 0.006);
  ctx.fill();

  // Secondary antenna (left side)
  const ant2TipX = x - s * 0.19 + Math.sin(time * 1.2 + 1) * s * 0.025;
  const ant2TipY = y - s * 0.45;
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.16, y - s * 0.18);
  ctx.quadraticCurveTo(
    x - s * 0.18 + Math.sin(time * 1.2 + 1) * s * 0.015, y - s * 0.32,
    ant2TipX, ant2TipY,
  );
  ctx.stroke();
  // Blinking green tip
  ctx.fillStyle = `rgba(0, 255, 100, ${0.4 + dataPulse * 0.5})`;
  ctx.shadowColor = "#00ff66";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(ant2TipX, ant2TipY, s * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Antenna base mount
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.19, y - s * 0.2, s * 0.05, s * 0.035, s * 0.005);
  ctx.fill();

  // Reactor core
  const rg = ctx.createRadialGradient(x, y + s * 0.06, 0, x, y + s * 0.06, s * 0.12);
  rg.addColorStop(0, `rgba(0, 255, 200, ${0.85 + dataPulse * 0.15})`);
  rg.addColorStop(0.5, `rgba(0, 200, 255, ${0.65 + dataPulse * 0.2})`);
  rg.addColorStop(1, "rgba(0, 100, 150, 0.3)");
  ctx.fillStyle = rg;
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 12 * zoom * (0.7 + dataPulse * 0.3);
  ctx.beginPath();
  ctx.arc(x, y + s * 0.06, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#00ccff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + s * 0.06, s * 0.11, 0, Math.PI * 2);
  ctx.stroke();

  // Exhaust vents
  for (let v = 0; v < 4; v++) {
    const vx = x - s * 0.18 + v * s * 0.12;
    ctx.fillStyle = "#0e0e1e";
    ctx.beginPath();
    ctx.ellipse(vx, y + s * 0.3, s * 0.028, s * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
    if (isAttacking) {
      ctx.fillStyle = `rgba(255, 150, 50, ${attackIntensity * 0.65})`;
      ctx.beginPath();
      ctx.ellipse(vx, y + s * 0.3, s * 0.018, s * 0.01, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === STRAPPED TOOLS ON BACKPACK ===

  // Wrench strapped to right side (sticking out top)
  ctx.save();
  ctx.translate(x + s * 0.14, y - s * 0.2);
  ctx.rotate(0.2);
  const wg = ctx.createLinearGradient(-s * 0.012, 0, s * 0.012, 0);
  wg.addColorStop(0, "#5a5a5a");
  wg.addColorStop(0.5, "#8a8a8a");
  wg.addColorStop(1, "#5a5a5a");
  ctx.fillStyle = wg;
  ctx.fillRect(-s * 0.012, -s * 0.2, s * 0.024, s * 0.2);
  // Wrench head
  ctx.fillStyle = "#6a6a6a";
  ctx.beginPath();
  ctx.roundRect(-s * 0.03, -s * 0.24, s * 0.06, s * 0.05, s * 0.006);
  ctx.fill();
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(-s * 0.025, -s * 0.22, s * 0.02, s * 0.025);
  ctx.restore();

  // Hammer strapped to left side
  ctx.save();
  ctx.translate(x - s * 0.14, y - s * 0.18);
  ctx.rotate(-0.15);
  ctx.fillStyle = "#6a5a3a";
  ctx.fillRect(-s * 0.01, -s * 0.15, s * 0.02, s * 0.18);
  // Hammer head
  ctx.fillStyle = "#5a5a5a";
  ctx.beginPath();
  ctx.roundRect(-s * 0.03, -s * 0.18, s * 0.06, s * 0.04, s * 0.004);
  ctx.fill();
  ctx.restore();

  // Screwdriver tucked in side
  ctx.fillStyle = "#4a4a4a";
  ctx.save();
  ctx.translate(x + s * 0.08, y - s * 0.12);
  ctx.rotate(0.1);
  ctx.fillRect(-s * 0.005, -s * 0.14, s * 0.01, s * 0.16);
  ctx.fillStyle = "#cc4444";
  ctx.fillRect(-s * 0.01, 0, s * 0.02, s * 0.04);
  ctx.restore();

  // Coiled cable/wire on top
  ctx.strokeStyle = "#4a6a4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let c = 0; c < 8; c++) {
    const cx = x - s * 0.08 + c * s * 0.02;
    const cy = y - s * 0.16 + Math.sin(c * 1.2) * s * 0.015;
    if (c === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();

  // Strap holding tools
  ctx.strokeStyle = "#4a4a4a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.12);
  ctx.lineTo(x + s * 0.2, y - s * 0.12);
  ctx.stroke();
  // Strap buckle
  ctx.fillStyle = "#5a5a5a";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.015, y - s * 0.135, s * 0.03, s * 0.03, s * 0.004);
  ctx.fill();
}

// ─── BODY (ARMORED EXOSUIT) ─────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  breathe: number,
  time: number,
  dataPulse: number,
  zoom: number,
) {
  // Main exosuit torso
  const sg = ctx.createLinearGradient(x - s * 0.44, y - s * 0.3, x + s * 0.44, y + s * 0.4);
  sg.addColorStop(0, "#2e3e24");
  sg.addColorStop(0.2, "#4a5a36");
  sg.addColorStop(0.5, "#5a6a42");
  sg.addColorStop(0.8, "#4a5a36");
  sg.addColorStop(1, "#2e3e24");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.42, y + s * 0.48 + breathe);
  ctx.lineTo(x - s * 0.46, y - s * 0.1);
  ctx.lineTo(x - s * 0.34, y - s * 0.27);
  ctx.quadraticCurveTo(x, y - s * 0.34, x + s * 0.34, y - s * 0.27);
  ctx.lineTo(x + s * 0.46, y - s * 0.1);
  ctx.lineTo(x + s * 0.42, y + s * 0.48 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1e2e18";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Contrasting belly armor plate (tan/khaki)
  const bellyG = ctx.createLinearGradient(x - s * 0.2, y - s * 0.06, x + s * 0.2, y + s * 0.14);
  bellyG.addColorStop(0, "#8a7a5a");
  bellyG.addColorStop(0.5, "#9a8a68");
  bellyG.addColorStop(1, "#7a6a4e");
  ctx.fillStyle = bellyG;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, y - s * 0.06);
  ctx.lineTo(x + s * 0.22, y - s * 0.06);
  ctx.lineTo(x + s * 0.2, y + s * 0.14);
  ctx.lineTo(x - s * 0.2, y + s * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a5a3e";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Upper chest armor plate (dark gray/gunmetal)
  const chestPlateG = ctx.createLinearGradient(x - s * 0.25, y - s * 0.27, x + s * 0.25, y - s * 0.08);
  chestPlateG.addColorStop(0, "#3a3a42");
  chestPlateG.addColorStop(0.5, "#4a4a55");
  chestPlateG.addColorStop(1, "#3a3a42");
  ctx.fillStyle = chestPlateG;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.25, y - s * 0.08);
  ctx.lineTo(x - s * 0.28, y - s * 0.22);
  ctx.quadraticCurveTo(x, y - s * 0.28, x + s * 0.28, y - s * 0.22);
  ctx.lineTo(x + s * 0.25, y - s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Armored plate seam lines
  ctx.strokeStyle = "#3a4a2c";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.38, y - s * 0.08);
  ctx.lineTo(x + s * 0.38, y - s * 0.08);
  ctx.moveTo(x - s * 0.36, y + s * 0.1);
  ctx.lineTo(x + s * 0.36, y + s * 0.1);
  ctx.moveTo(x, y - s * 0.27);
  ctx.lineTo(x, y + s * 0.16);
  ctx.stroke();

  // Reinforced shoulder ridges (tan/brown, contrasting)
  for (const side of [-1, 1]) {
    const sx = x + side * s * 0.38;
    const ridgeG = ctx.createLinearGradient(
      sx - side * s * 0.12, y - s * 0.27, sx + side * s * 0.06, y - s * 0.15,
    );
    ridgeG.addColorStop(0, "#7a6a48");
    ridgeG.addColorStop(0.5, "#8a7a58");
    ridgeG.addColorStop(1, "#6a5a3e");
    ctx.fillStyle = ridgeG;
    ctx.beginPath();
    ctx.moveTo(sx - side * s * 0.14, y - s * 0.28);
    ctx.lineTo(sx + side * s * 0.08, y - s * 0.2);
    ctx.lineTo(sx + side * s * 0.08, y - s * 0.13);
    ctx.lineTo(sx - side * s * 0.14, y - s * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a4a32";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Shoulder-mounted equipment pod (dark gunmetal)
    ctx.fillStyle = "#2a2a3a";
    ctx.beginPath();
    ctx.roundRect(
      x + side * s * 0.32 - s * 0.05,
      y - s * 0.28,
      s * 0.1, s * 0.08, s * 0.015,
    );
    ctx.fill();
    ctx.strokeStyle = "#3a3a4a";
    ctx.lineWidth = 1;
    ctx.stroke();

    const podColor = side > 0
      ? `rgba(255, 60, 60, ${0.5 + dataPulse * 0.4})`
      : `rgba(0, 200, 255, ${0.5 + dataPulse * 0.4})`;
    ctx.fillStyle = podColor;
    ctx.shadowColor = side > 0 ? "#ff3030" : "#00ccff";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(
      x + side * s * 0.32,
      y - s * 0.24,
      s * 0.018, 0, Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Side torso armor plates (brown/tan, flanking belly)
  for (const side of [-1, 1]) {
    const sideG = ctx.createLinearGradient(
      x + side * s * 0.15, y - s * 0.05, x + side * s * 0.35, y + s * 0.12,
    );
    sideG.addColorStop(0, "#6a5a3e");
    sideG.addColorStop(0.5, "#7a6a4e");
    sideG.addColorStop(1, "#5a4a32");
    ctx.fillStyle = sideG;
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.22, y - s * 0.06);
    ctx.lineTo(x + side * s * 0.38, y - s * 0.04);
    ctx.lineTo(x + side * s * 0.36, y + s * 0.12);
    ctx.lineTo(x + side * s * 0.2, y + s * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4a3a28";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Hi-vis orange reflective strips
  const stripG = ctx.createLinearGradient(x - s * 0.42, y, x - s * 0.28, y);
  stripG.addColorStop(0, "#bb3800");
  stripG.addColorStop(0.3, "#ff5500");
  stripG.addColorStop(0.5, "#ff9933");
  stripG.addColorStop(0.7, "#ff5500");
  stripG.addColorStop(1, "#bb3800");
  ctx.fillStyle = stripG;
  ctx.fillRect(x - s * 0.42, y - s * 0.2, s * 0.12, s * 0.52);
  ctx.fillRect(x + s * 0.3, y - s * 0.2, s * 0.12, s * 0.52);

  ctx.fillStyle = "rgba(255, 255, 200, 0.35)";
  ctx.fillRect(x - s * 0.41, y - s * 0.18, s * 0.035, s * 0.48);
  ctx.fillRect(x + s * 0.36, y - s * 0.18, s * 0.035, s * 0.48);

  // Chest magazine pouches (BIGGER)
  for (const side of [-1, 1]) {
    const cx = x + side * s * 0.15;
    ctx.fillStyle = "#2a3a22";
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.08, y - s * 0.24, s * 0.16, s * 0.13, s * 0.02);
    ctx.fill();
    ctx.strokeStyle = "#3a4a2c";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Pouch flap
    ctx.fillStyle = "#344a2a";
    ctx.fillRect(cx - s * 0.075, y - s * 0.24, s * 0.15, s * 0.035);
    // Snap button
    ctx.fillStyle = "#6a6a6a";
    ctx.beginPath();
    ctx.arc(cx, y - s * 0.205, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    // Pouch content bulge
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.06, y - s * 0.19, s * 0.12, s * 0.06, s * 0.01);
    ctx.fill();
  }

  // Central chest status display (BIGGER)
  ctx.fillStyle = "#0e0e1e";
  ctx.fillRect(x - s * 0.065, y - s * 0.12, s * 0.13, s * 0.12);
  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - s * 0.065, y - s * 0.12, s * 0.13, s * 0.12);

  // Animated display content with scrolling bars
  for (let line = 0; line < 4; line++) {
    const ly = y - s * 0.1 + line * s * 0.025;
    const barWidth = s * 0.05 + Math.sin(time * 3 + line * 1.2) * s * 0.03;
    const barAlpha = 0.6 + Math.sin(time * 4 + line) * 0.3;
    ctx.fillStyle = line < 2
      ? `rgba(0, 255, 200, ${barAlpha})`
      : `rgba(234, 179, 8, ${barAlpha})`;
    ctx.fillRect(x - s * 0.05, ly, barWidth, s * 0.015);
  }
}

// ─── ARMORED SKIRT ───────────────────────────────────────────────────────────

function drawArmorSkirt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  breathe: number,
  time: number,
  dataPulse: number,
) {
  const skirtTop = y + s * 0.28;
  const skirtBottom = y + s * 0.5 + breathe;
  const numPlates = 7;
  const totalWidth = s * 0.84;
  const plateWidth = totalWidth / numPlates + s * 0.025;
  const startX = x - totalWidth / 2;

  for (let i = 0; i < numPlates; i++) {
    const px = startX + i * (totalWidth / numPlates);
    const distFromCenter = Math.abs(i - (numPlates - 1) / 2) / ((numPlates - 1) / 2);
    const plateLen = (skirtBottom - skirtTop) * (1 - distFromCenter * 0.18);
    const sway = Math.sin(time * 1.8 + i * 0.5) * s * 0.008;

    // Alternating plate colors: olive, tan, dark gray
    const plateColors = [
      ["#3a4a2e", "#4a5a3a", "#3e4e30", "#2a3a22"],
      ["#6a5a3e", "#7a6a50", "#6a5a42", "#5a4a32"],
      ["#3a3a42", "#4a4a52", "#3e3e48", "#2e2e38"],
    ];
    const colorSet = plateColors[i % 3];
    const pg = ctx.createLinearGradient(px, skirtTop, px + plateWidth, skirtTop + plateLen);
    pg.addColorStop(0, colorSet[0]);
    pg.addColorStop(0.3, colorSet[1]);
    pg.addColorStop(0.7, colorSet[2]);
    pg.addColorStop(1, colorSet[3]);
    ctx.fillStyle = pg;

    ctx.beginPath();
    ctx.moveTo(px + s * 0.005, skirtTop);
    ctx.lineTo(px + plateWidth - s * 0.005, skirtTop);
    ctx.lineTo(px + plateWidth + sway + s * 0.005, skirtTop + plateLen);
    ctx.lineTo(px + sway - s * 0.005, skirtTop + plateLen);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#222e1a";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Plate rivet at top
    ctx.fillStyle = "#7a7a7a";
    ctx.beginPath();
    ctx.arc(px + plateWidth / 2, skirtTop + s * 0.025, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Plate edge highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(px + s * 0.008, skirtTop + s * 0.005, s * 0.015, plateLen * 0.85);

    // Bottom edge wear/metallic trim
    ctx.fillStyle = "#5a5a5a";
    ctx.fillRect(px + sway, skirtTop + plateLen - s * 0.008, plateWidth, s * 0.008);
  }

  // Metal trim strip at top of skirt
  const trimG = ctx.createLinearGradient(x - totalWidth / 2, skirtTop, x + totalWidth / 2, skirtTop);
  trimG.addColorStop(0, "#3a3a3a");
  trimG.addColorStop(0.5, "#5a5a5a");
  trimG.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = trimG;
  ctx.fillRect(x - totalWidth / 2, skirtTop - s * 0.015, totalWidth, s * 0.025);
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - totalWidth / 2, skirtTop - s * 0.015, totalWidth, s * 0.025);
}

// ─── BELT AND POUCHES ────────────────────────────────────────────────────────

function drawBeltAndPouches(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  dataPulse: number,
) {
  // Main belt
  const bg = ctx.createLinearGradient(x - s * 0.46, y + s * 0.16, x + s * 0.46, y + s * 0.16);
  bg.addColorStop(0, "#2a2a2a");
  bg.addColorStop(0.5, "#484848");
  bg.addColorStop(1, "#2a2a2a");
  ctx.fillStyle = bg;
  ctx.fillRect(x - s * 0.46, y + s * 0.14, s * 0.92, s * 0.14);
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - s * 0.46, y + s * 0.14, s * 0.92, s * 0.14);

  // 6 belt pouches (MUCH BIGGER, varying sizes)
  const pouchConfigs = [
    { xOff: -0.4, w: 0.14, h: 0.2, colorIdx: 0 },
    { xOff: -0.22, w: 0.16, h: 0.24, colorIdx: 1 },
    { xOff: -0.04, w: 0.12, h: 0.18, colorIdx: 0 },
    { xOff: 0.1, w: 0.12, h: 0.18, colorIdx: 1 },
    { xOff: 0.24, w: 0.16, h: 0.24, colorIdx: 0 },
    { xOff: 0.42, w: 0.14, h: 0.2, colorIdx: 1 },
  ];

  for (const p of pouchConfigs) {
    const px = x + p.xOff * s;
    const pouchBob = Math.sin(time * 1.6 + p.xOff * 3) * s * 0.003;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(px - s * p.w / 2, y + s * 0.09 + pouchBob, s * p.w, s * p.h, s * 0.02);
    ctx.fill();
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Pouch flap with stitching
    ctx.fillStyle = "#252525";
    ctx.fillRect(px - s * p.w / 2 + s * 0.005, y + s * 0.09 + pouchBob, s * p.w - s * 0.01, s * 0.035);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.6;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(px - s * p.w / 2 + s * 0.008, y + s * 0.093 + pouchBob, s * p.w - s * 0.016, s * 0.03);
    ctx.setLineDash([]);

    // Snap/buckle
    ctx.fillStyle = "#6a6a6a";
    ctx.beginPath();
    ctx.arc(px, y + s * 0.11 + pouchBob, s * 0.012, 0, Math.PI * 2);
    ctx.fill();

    // Status LED (bigger glow)
    const ledColor = p.colorIdx === 0
      ? `rgba(0, 255, 130, ${0.5 + dataPulse * 0.4})`
      : `rgba(255, 180, 40, ${0.5 + dataPulse * 0.4})`;
    ctx.fillStyle = ledColor;
    ctx.shadowColor = p.colorIdx === 0 ? "#00ff88" : "#ffaa22";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(px, y + s * 0.15 + pouchBob, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Belt buckle (BIGGER, tactical)
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.065, y + s * 0.15, s * 0.13, s * 0.09, s * 0.015);
  ctx.fill();
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = `rgba(234, 179, 8, ${0.65 + dataPulse * 0.3})`;
  ctx.shadowColor = "#eab308";
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(x, y + s * 0.195, s * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tactical knife on belt (BIGGER)
  ctx.save();
  ctx.translate(x + s * 0.46, y + s * 0.17);
  ctx.rotate(0.15);
  // Sheath
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.roundRect(-s * 0.025, -s * 0.04, s * 0.05, s * 0.14, s * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Blade
  const bladeG = ctx.createLinearGradient(-s * 0.015, -s * 0.04, s * 0.015, -s * 0.04);
  bladeG.addColorStop(0, "#8a8a9a");
  bladeG.addColorStop(0.5, "#b0b0c0");
  bladeG.addColorStop(1, "#8a8a9a");
  ctx.fillStyle = bladeG;
  ctx.beginPath();
  ctx.moveTo(-s * 0.015, -s * 0.04);
  ctx.lineTo(0, -s * 0.12);
  ctx.lineTo(s * 0.015, -s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a6a7a";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Handle wrap
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-s * 0.018, -s * 0.035, s * 0.036, s * 0.04);
  ctx.restore();
}

// ─── THIGH RIGS ──────────────────────────────────────────────────────────────

function drawThighRigs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  breathe: number,
  time: number,
  dataPulse: number,
) {
  for (const side of [-1, 1]) {
    const tx = x + side * s * 0.36;
    const ty = y + s * 0.33;
    const rigBob = Math.sin(time * 1.6 + (side > 0 ? 0 : 1.5)) * s * 0.004;

    // Drop-leg straps from belt
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx - s * 0.02, y + s * 0.28);
    ctx.lineTo(tx - s * 0.02, ty - s * 0.02 + rigBob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + s * 0.02, y + s * 0.28);
    ctx.lineTo(tx + s * 0.02, ty - s * 0.02 + rigBob);
    ctx.stroke();

    // Thigh wrap strap
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx - s * 0.08, ty + s * 0.1 + rigBob);
    ctx.lineTo(tx + s * 0.08, ty + s * 0.1 + rigBob);
    ctx.stroke();
    // Strap buckle
    ctx.fillStyle = "#5a5a5a";
    ctx.beginPath();
    ctx.roundRect(tx + side * s * 0.04, ty + s * 0.085 + rigBob, s * 0.03, s * 0.03, s * 0.004);
    ctx.fill();

    // Main thigh pouch (BIGGER)
    const tpg = ctx.createLinearGradient(tx - s * 0.08, ty, tx + s * 0.08, ty + s * 0.16);
    tpg.addColorStop(0, "#181818");
    tpg.addColorStop(0.5, "#282828");
    tpg.addColorStop(1, "#181818");
    ctx.fillStyle = tpg;
    ctx.beginPath();
    ctx.roundRect(tx - s * 0.08, ty - s * 0.02 + rigBob, s * 0.16, s * 0.16, s * 0.018);
    ctx.fill();
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pouch flap + snap
    ctx.fillStyle = "#222222";
    ctx.fillRect(tx - s * 0.075, ty - s * 0.02 + rigBob, s * 0.15, s * 0.03);
    ctx.fillStyle = "#5a5a5a";
    ctx.beginPath();
    ctx.arc(tx, ty + s * 0.005 + rigBob, s * 0.01, 0, Math.PI * 2);
    ctx.fill();

    // MOLLE webbing detail
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.8;
    for (let row = 0; row < 2; row++) {
      ctx.beginPath();
      ctx.moveTo(tx - s * 0.06, ty + s * 0.04 + row * s * 0.035 + rigBob);
      ctx.lineTo(tx + s * 0.06, ty + s * 0.04 + row * s * 0.035 + rigBob);
      ctx.stroke();
    }

    // Status light (bigger glow)
    ctx.fillStyle = side > 0
      ? `rgba(0, 255, 130, ${0.45 + dataPulse * 0.35})`
      : `rgba(255, 100, 40, ${0.45 + dataPulse * 0.35})`;
    ctx.shadowColor = side > 0 ? "#00ff88" : "#ff6622";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(tx, ty + s * 0.065 + rigBob, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ─── ARMS AND RIFLE (TWO-HANDED) ─────────────────────────────────────────────

function drawArmsAndRifle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  workAnimation: number,
  dataPulse: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  targetPos: Position | undefined,
  toolFidget: number,
) {
  const recoilKick = isAttacking ? Math.sin(attackIntensity * Math.PI * 6) * s * 0.025 : 0;

  // Rifle pivots from character center for correct directional aiming
  const rifleX = x;
  const rifleY = y + s * 0.02;

  const gunBase = -Math.PI / 2 - toolFidget * 0.2;
  const gunAngle = resolveWeaponRotation(
    targetPos, rifleX, rifleY,
    gunBase, Math.PI / 2,
    isAttacking ? 1.5 : 0.85,
    WEAPON_LIMITS.rifle,
  );

  const cosA = Math.cos(gunAngle);
  const sinA = Math.sin(gunAngle);

  // Key positions along the rifle in world space
  const gripDist = s * 0.04;
  const handguardDist = s * 0.3;
  const gripWorldX = rifleX + sinA * gripDist;
  const gripWorldY = rifleY - cosA * gripDist;
  const handguardWorldX = rifleX - sinA * handguardDist;
  const handguardWorldY = rifleY + cosA * handguardDist;

  drawLeftArmDetailed(ctx, x, y, s, time, gunAngle, handguardWorldX, handguardWorldY, dataPulse);
  drawRightArmDetailed(ctx, x, y, s, time, gunAngle, gripWorldX, gripWorldY);
  drawRifleDetailed(ctx, rifleX, rifleY, s, gunAngle, recoilKick, dataPulse, time, zoom, isAttacking, attackIntensity);
}

function drawLeftArmDetailed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  gunAngle: number,
  handguardX: number,
  handguardY: number,
  dataPulse: number,
) {
  const bob = Math.sin(time * 1.4) * s * 0.004;
  const shoulderX = x - s * 0.34;
  const shoulderY = y - s * 0.08 + bob;

  // Shoulder pad (olive armor plate)
  const spG = ctx.createRadialGradient(shoulderX, shoulderY - s * 0.06, 0, shoulderX, shoulderY - s * 0.06, s * 0.1);
  spG.addColorStop(0, "#5a6a3e");
  spG.addColorStop(0.6, "#4a5a32");
  spG.addColorStop(1, "#3a4a28");
  ctx.fillStyle = spG;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY - s * 0.06, s * 0.1, s * 0.06, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2e3a1e";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Shoulder pad edge highlight
  ctx.strokeStyle = "rgba(120,140,90,0.4)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY - s * 0.065, s * 0.085, s * 0.045, -0.3, -0.5, 1.2);
  ctx.stroke();

  // Upper arm (bicep) with muscle definition
  const uaG = ctx.createLinearGradient(shoulderX - s * 0.08, shoulderY, shoulderX + s * 0.08, shoulderY);
  uaG.addColorStop(0, "#3a4a2c");
  uaG.addColorStop(0.3, "#5a6a42");
  uaG.addColorStop(0.7, "#566838");
  uaG.addColorStop(1, "#3a4a2c");
  ctx.fillStyle = uaG;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY + s * 0.04, s * 0.1, s * 0.16, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Bicep highlight (muscle bulge)
  ctx.fillStyle = "rgba(100,120,70,0.3)";
  ctx.beginPath();
  ctx.ellipse(shoulderX + s * 0.02, shoulderY + s * 0.02, s * 0.04, s * 0.08, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Sleeve seam
  ctx.strokeStyle = "#3a4a28";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY - s * 0.02, s * 0.09, s * 0.04, -0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Forearm connector (from elbow area toward handguard)
  const elbowX = shoulderX + s * 0.04;
  const elbowY = shoulderY + s * 0.14;

  // Elbow pad
  const epG = ctx.createRadialGradient(elbowX, elbowY, 0, elbowX, elbowY, s * 0.06);
  epG.addColorStop(0, "#4a4a38");
  epG.addColorStop(0.5, "#3a3a2c");
  epG.addColorStop(1, "#2e2e22");
  ctx.fillStyle = epG;
  ctx.beginPath();
  ctx.ellipse(elbowX, elbowY, s * 0.055, s * 0.045, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a2a1e";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Elbow pad rivet
  ctx.fillStyle = "#5a5a4a";
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, s * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Forearm
  ctx.strokeStyle = "#4a5a36";
  ctx.lineWidth = s * 0.09;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.lineTo(handguardX, handguardY);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Forearm armor plate (tan/brown)
  const midForeX = (elbowX + handguardX) / 2;
  const midForeY = (elbowY + handguardY) / 2;
  const fpG = ctx.createLinearGradient(
    midForeX - s * 0.06, midForeY - s * 0.04,
    midForeX + s * 0.06, midForeY + s * 0.04,
  );
  fpG.addColorStop(0, "#5a4a32");
  fpG.addColorStop(0.5, "#6a5a42");
  fpG.addColorStop(1, "#5a4a32");
  ctx.fillStyle = fpG;
  ctx.beginPath();
  ctx.ellipse(midForeX, midForeY, s * 0.065, s * 0.04, gunAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a3a28";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Armor plate strap
  ctx.strokeStyle = "#3a3020";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(midForeX, midForeY, s * 0.07, s * 0.025, gunAngle, 0, Math.PI * 2);
  ctx.stroke();

  // Left gauntlet (at handguard)
  const gG = ctx.createRadialGradient(handguardX, handguardY, 0, handguardX, handguardY, s * 0.08);
  gG.addColorStop(0, "#6a5a42");
  gG.addColorStop(0.5, "#5a4a32");
  gG.addColorStop(1, "#4a3a28");
  ctx.fillStyle = gG;
  ctx.beginPath();
  ctx.ellipse(handguardX, handguardY, s * 0.08, s * 0.06, gunAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a3a28";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Knuckle guard ridge
  ctx.strokeStyle = "#5a4a32";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(handguardX, handguardY, s * 0.075, s * 0.035, gunAngle, -0.6, 0.6);
  ctx.stroke();
  // Finger lines
  const perpX = Math.cos(gunAngle);
  const perpY = Math.sin(gunAngle);
  ctx.strokeStyle = "#4a3a28";
  ctx.lineWidth = 0.6;
  for (let f = -1; f <= 1; f++) {
    const fx = handguardX + perpX * f * s * 0.025;
    const fy = handguardY + perpY * f * s * 0.025;
    ctx.beginPath();
    ctx.moveTo(fx - perpY * s * 0.03, fy + perpX * s * 0.03);
    ctx.lineTo(fx + perpY * s * 0.03, fy - perpX * s * 0.03);
    ctx.stroke();
  }

  // Wrist display
  const wdAngle = gunAngle + 0.3;
  const wdx = handguardX + Math.cos(wdAngle) * s * 0.06;
  const wdy = handguardY + Math.sin(wdAngle) * s * 0.06;
  ctx.save();
  ctx.translate(wdx, wdy);
  ctx.rotate(gunAngle);
  ctx.fillStyle = "#0a0a18";
  ctx.beginPath();
  ctx.roundRect(-s * 0.03, -s * 0.015, s * 0.06, s * 0.03, s * 0.004);
  ctx.fill();
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.fillStyle = `rgba(0, 200, 255, ${0.5 + dataPulse * 0.4})`;
  const dp = (time * 2) % 4;
  ctx.fillRect(-s * 0.025, -s * 0.01, s * 0.018 + Math.sin(dp) * s * 0.012, s * 0.008);
  ctx.fillRect(-s * 0.025, s * 0.002, s * 0.03 + Math.sin(dp + 1) * s * 0.008, s * 0.008);
  ctx.restore();
}

function drawRightArmDetailed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  gunAngle: number,
  gripX: number,
  gripY: number,
) {
  const bob = Math.sin(time * 1.4 + Math.PI) * s * 0.004;
  const shoulderX = x + s * 0.34;
  const shoulderY = y - s * 0.08 + bob;

  // Shoulder pad (darker olive)
  const spG = ctx.createRadialGradient(shoulderX, shoulderY - s * 0.06, 0, shoulderX, shoulderY - s * 0.06, s * 0.1);
  spG.addColorStop(0, "#4e5e36");
  spG.addColorStop(0.6, "#3e4e2a");
  spG.addColorStop(1, "#2e3e20");
  ctx.fillStyle = spG;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY - s * 0.06, s * 0.1, s * 0.06, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a361a";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Shoulder pad edge highlight
  ctx.strokeStyle = "rgba(110,130,80,0.4)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY - s * 0.065, s * 0.085, s * 0.045, 0.3, 1.9, 3.7);
  ctx.stroke();

  // Upper arm with muscle contour
  const uaG = ctx.createLinearGradient(shoulderX - s * 0.08, shoulderY, shoulderX + s * 0.08, shoulderY);
  uaG.addColorStop(0, "#3a4a2c");
  uaG.addColorStop(0.35, "#566838");
  uaG.addColorStop(0.7, "#5a6a42");
  uaG.addColorStop(1, "#3a4a2c");
  ctx.fillStyle = uaG;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY + s * 0.04, s * 0.1, s * 0.16, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Muscle highlight
  ctx.fillStyle = "rgba(100,120,70,0.3)";
  ctx.beginPath();
  ctx.ellipse(shoulderX - s * 0.02, shoulderY + s * 0.02, s * 0.04, s * 0.08, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Sleeve seam
  ctx.strokeStyle = "#3a4a28";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(shoulderX, shoulderY - s * 0.02, s * 0.09, s * 0.04, 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Elbow
  const elbowX = shoulderX - s * 0.04;
  const elbowY = shoulderY + s * 0.14;

  // Elbow pad (gunmetal)
  const epG = ctx.createRadialGradient(elbowX, elbowY, 0, elbowX, elbowY, s * 0.06);
  epG.addColorStop(0, "#3e3e4a");
  epG.addColorStop(0.5, "#2e2e38");
  epG.addColorStop(1, "#22222c");
  ctx.fillStyle = epG;
  ctx.beginPath();
  ctx.ellipse(elbowX, elbowY, s * 0.055, s * 0.045, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1e1e28";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Elbow pad rivet
  ctx.fillStyle = "#4a4a58";
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, s * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Forearm
  ctx.strokeStyle = "#4a5a36";
  ctx.lineWidth = s * 0.09;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.lineTo(gripX, gripY);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Forearm armor plate (gunmetal gray)
  const midForeX = (elbowX + gripX) / 2;
  const midForeY = (elbowY + gripY) / 2;
  const fpG = ctx.createLinearGradient(
    midForeX - s * 0.06, midForeY - s * 0.04,
    midForeX + s * 0.06, midForeY + s * 0.04,
  );
  fpG.addColorStop(0, "#2e2e3a");
  fpG.addColorStop(0.5, "#42424e");
  fpG.addColorStop(1, "#2e2e3a");
  ctx.fillStyle = fpG;
  ctx.beginPath();
  ctx.ellipse(midForeX, midForeY, s * 0.065, s * 0.04, gunAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#22222e";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Armor plate strap
  ctx.strokeStyle = "#282830";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(midForeX, midForeY, s * 0.07, s * 0.025, gunAngle, 0, Math.PI * 2);
  ctx.stroke();

  // Right gauntlet (gunmetal, at grip)
  const gG = ctx.createRadialGradient(gripX, gripY, 0, gripX, gripY, s * 0.08);
  gG.addColorStop(0, "#42424e");
  gG.addColorStop(0.5, "#2e2e3a");
  gG.addColorStop(1, "#222230");
  ctx.fillStyle = gG;
  ctx.beginPath();
  ctx.ellipse(gripX, gripY, s * 0.08, s * 0.06, gunAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1e1e28";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Knuckle guard ridge
  ctx.strokeStyle = "#3a3a48";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(gripX, gripY, s * 0.075, s * 0.035, gunAngle, 2.5, 3.7);
  ctx.stroke();
  // Finger lines
  const perpX = Math.cos(gunAngle);
  const perpY = Math.sin(gunAngle);
  ctx.strokeStyle = "#2a2a38";
  ctx.lineWidth = 0.6;
  for (let f = -1; f <= 1; f++) {
    const fx = gripX + perpX * f * s * 0.025;
    const fy = gripY + perpY * f * s * 0.025;
    ctx.beginPath();
    ctx.moveTo(fx - perpY * s * 0.03, fy + perpX * s * 0.03);
    ctx.lineTo(fx + perpY * s * 0.03, fy - perpX * s * 0.03);
    ctx.stroke();
  }
}

function drawRifleDetailed(
  ctx: CanvasRenderingContext2D,
  rifleX: number,
  rifleY: number,
  s: number,
  gunAngle: number,
  recoilKick: number,
  dataPulse: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  ctx.save();
  ctx.translate(rifleX, rifleY);
  ctx.rotate(gunAngle);

  const bw = s * 0.06;

  // === STOCK ===
  const stockG = ctx.createLinearGradient(-bw * 0.6, s * 0.06, bw * 0.6, s * 0.06);
  stockG.addColorStop(0, "#181818");
  stockG.addColorStop(0.3, "#2a2a2e");
  stockG.addColorStop(0.7, "#2a2a2e");
  stockG.addColorStop(1, "#181818");
  ctx.fillStyle = stockG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.45, s * 0.04, bw * 0.9, s * 0.2, s * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Stock butt pad (rubber)
  ctx.fillStyle = "#2e2e2e";
  ctx.beginPath();
  ctx.roundRect(-bw * 0.4, s * 0.2, bw * 0.8, s * 0.04, s * 0.005);
  ctx.fill();
  // Stock butt pad texture
  ctx.strokeStyle = "#383838";
  ctx.lineWidth = 0.5;
  for (let t = 0; t < 3; t++) {
    ctx.beginPath();
    ctx.moveTo(-bw * 0.3, s * 0.21 + t * s * 0.01);
    ctx.lineTo(bw * 0.3, s * 0.21 + t * s * 0.01);
    ctx.stroke();
  }
  // Stock cheek riser
  ctx.fillStyle = "#252528";
  ctx.beginPath();
  ctx.roundRect(-bw * 0.35, s * 0.06, bw * 0.7, s * 0.05, s * 0.004);
  ctx.fill();
  // Sling mount (rear)
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.arc(-bw * 0.5, s * 0.15, s * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a4a4a";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // === RECEIVER ===
  const recG = ctx.createLinearGradient(-bw * 0.75, -s * 0.1, bw * 0.75, -s * 0.1);
  recG.addColorStop(0, "#161618");
  recG.addColorStop(0.25, "#28282e");
  recG.addColorStop(0.5, "#2e2e34");
  recG.addColorStop(0.75, "#28282e");
  recG.addColorStop(1, "#161618");
  ctx.fillStyle = recG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.7, -s * 0.16, bw * 1.4, s * 0.24, s * 0.01);
  ctx.fill();
  ctx.strokeStyle = "#222228";
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Ejection port
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(bw * 0.2, -s * 0.1, bw * 0.3, s * 0.045);
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bw * 0.2, -s * 0.1, bw * 0.3, s * 0.045);

  // Charging handle
  ctx.fillStyle = "#2a2a2e";
  ctx.fillRect(-bw * 0.12, -s * 0.165, bw * 0.24, s * 0.015);
  ctx.fillStyle = "#3a3a3e";
  ctx.fillRect(-bw * 0.06, -s * 0.17, bw * 0.12, s * 0.02);

  // Bolt release
  ctx.fillStyle = "#333338";
  ctx.beginPath();
  ctx.roundRect(-bw * 0.6, -s * 0.06, bw * 0.12, s * 0.03, s * 0.003);
  ctx.fill();

  // Selector switch
  ctx.fillStyle = "#3a3a3e";
  ctx.beginPath();
  ctx.arc(bw * 0.5, -s * 0.02, s * 0.01, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(bw * 0.5, -s * 0.02, s * 0.005, 0, Math.PI * 2);
  ctx.fill();

  // Forward assist
  ctx.fillStyle = "#2e2e34";
  ctx.beginPath();
  ctx.roundRect(bw * 0.55, -s * 0.09, bw * 0.1, s * 0.03, s * 0.003);
  ctx.fill();

  // Receiver pin detail
  ctx.fillStyle = "#444";
  for (const py of [-s * 0.04, s * 0.02]) {
    ctx.beginPath();
    ctx.arc(-bw * 0.55, py, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Trigger guard
  ctx.strokeStyle = "#252528";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, s * 0.05, s * 0.028, 0, Math.PI);
  ctx.stroke();
  // Trigger
  ctx.fillStyle = "#1a1a1e";
  ctx.fillRect(-s * 0.004, s * 0.02, s * 0.008, s * 0.025);

  // Pistol grip (ergonomic, angled)
  const pgG = ctx.createLinearGradient(-bw * 0.35, s * 0.03, bw * 0.35, s * 0.03);
  pgG.addColorStop(0, "#1a1a1a");
  pgG.addColorStop(0.5, "#262626");
  pgG.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = pgG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.35, s * 0.02, bw * 0.7, s * 0.07, s * 0.006);
  ctx.fill();
  ctx.strokeStyle = "#161616";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Grip stippling texture
  ctx.strokeStyle = "#2e2e2e";
  ctx.lineWidth = 0.5;
  for (let g = 0; g < 4; g++) {
    ctx.beginPath();
    ctx.moveTo(-bw * 0.25, s * 0.032 + g * s * 0.013);
    ctx.lineTo(bw * 0.25, s * 0.032 + g * s * 0.013);
    ctx.stroke();
  }

  // === MAGAZINE ===
  const magG = ctx.createLinearGradient(-bw * 0.4, -s * 0.06, -bw * 0.4, s * 0.06);
  magG.addColorStop(0, "#1a1a20");
  magG.addColorStop(0.5, "#222228");
  magG.addColorStop(1, "#1a1a20");
  ctx.fillStyle = magG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.42, -s * 0.07, bw * 0.55, s * 0.14, s * 0.005);
  ctx.fill();
  ctx.strokeStyle = "#2a2a30";
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // Magazine base plate
  ctx.fillStyle = "#3a3a40";
  ctx.fillRect(-bw * 0.38, s * 0.058, bw * 0.47, s * 0.014);
  // Magazine witness holes
  ctx.fillStyle = "#c8a830";
  for (let wh = 0; wh < 3; wh++) {
    ctx.beginPath();
    ctx.arc(-bw * 0.15, -s * 0.04 + wh * s * 0.03, s * 0.004, 0, Math.PI * 2);
    ctx.fill();
  }

  // === BARREL ===
  const barrelG = ctx.createLinearGradient(-bw * 0.3, -s * 0.42, bw * 0.3, -s * 0.42);
  barrelG.addColorStop(0, "#1e1e22");
  barrelG.addColorStop(0.3, "#33333a");
  barrelG.addColorStop(0.7, "#33333a");
  barrelG.addColorStop(1, "#1e1e22");
  ctx.fillStyle = barrelG;
  ctx.fillRect(-bw * 0.2, -s * 0.5 + recoilKick, bw * 0.4, s * 0.34);

  // Barrel bore / muzzle
  ctx.fillStyle = "#080808";
  ctx.beginPath();
  ctx.arc(0, -s * 0.5 + recoilKick, bw * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // Muzzle brake / flash hider
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.roundRect(-bw * 0.28, -s * 0.53 + recoilKick, bw * 0.56, s * 0.04, s * 0.004);
  ctx.fill();
  ctx.strokeStyle = "#1a1a1e";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Muzzle brake slots
  ctx.strokeStyle = "#161618";
  ctx.lineWidth = 0.8;
  for (let ms = 0; ms < 3; ms++) {
    const msx = -bw * 0.18 + ms * bw * 0.18;
    ctx.beginPath();
    ctx.moveTo(msx, -s * 0.525 + recoilKick);
    ctx.lineTo(msx, -s * 0.495 + recoilKick);
    ctx.stroke();
  }

  // Gas block
  ctx.fillStyle = "#2a2a2e";
  ctx.fillRect(-bw * 0.15, -s * 0.38 + recoilKick, bw * 0.3, s * 0.025);

  // === HANDGUARD / M-LOK RAIL ===
  const hgG = ctx.createLinearGradient(-bw * 0.5, -s * 0.36, bw * 0.5, -s * 0.36);
  hgG.addColorStop(0, "#252528");
  hgG.addColorStop(0.3, "#32323a");
  hgG.addColorStop(0.7, "#32323a");
  hgG.addColorStop(1, "#252528");
  ctx.fillStyle = hgG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.5, -s * 0.37, bw, s * 0.2, s * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#1e1e24";
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // M-LOK slots
  ctx.strokeStyle = "#1a1a20";
  ctx.lineWidth = 1;
  for (let r = 0; r < 5; r++) {
    const ry = -s * 0.355 + r * s * 0.035;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.42, ry);
    ctx.lineTo(-bw * 0.15, ry);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bw * 0.15, ry);
    ctx.lineTo(bw * 0.42, ry);
    ctx.stroke();
  }
  // Top rail (Picatinny)
  ctx.fillStyle = "#2e2e34";
  ctx.fillRect(-bw * 0.15, -s * 0.375, bw * 0.3, s * 0.21);
  ctx.strokeStyle = "#3a3a42";
  ctx.lineWidth = 0.5;
  for (let pr = 0; pr < 8; pr++) {
    ctx.beginPath();
    ctx.moveTo(-bw * 0.14, -s * 0.37 + pr * s * 0.025);
    ctx.lineTo(bw * 0.14, -s * 0.37 + pr * s * 0.025);
    ctx.stroke();
  }

  // === OPTIC / SCOPE ===
  // Scope mount
  ctx.fillStyle = "#2a2a30";
  ctx.beginPath();
  ctx.roundRect(-bw * 0.2, -s * 0.21, bw * 0.4, s * 0.04, s * 0.003);
  ctx.fill();
  // Scope body
  const scopeG = ctx.createLinearGradient(-bw * 0.25, -s * 0.3, bw * 0.25, -s * 0.3);
  scopeG.addColorStop(0, "#1a1a20");
  scopeG.addColorStop(0.3, "#2e2e36");
  scopeG.addColorStop(0.7, "#2e2e36");
  scopeG.addColorStop(1, "#1a1a20");
  ctx.fillStyle = scopeG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.22, -s * 0.32, bw * 0.44, s * 0.15, s * 0.01);
  ctx.fill();
  ctx.strokeStyle = "#161620";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Scope front lens
  ctx.fillStyle = `rgba(80, 160, 255, ${0.3 + dataPulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(0, -s * 0.32, bw * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#222230";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Scope rear lens
  ctx.fillStyle = "rgba(60,120,200,0.2)";
  ctx.beginPath();
  ctx.arc(0, -s * 0.18, bw * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // Scope magnification ring
  ctx.strokeStyle = "#3a3a44";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.25, bw * 0.24, bw * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Scope windage turret
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.roundRect(bw * 0.22, -s * 0.28, bw * 0.16, s * 0.04, s * 0.004);
  ctx.fill();
  ctx.strokeStyle = "#363640";
  ctx.lineWidth = 0.5;
  for (let tk = 0; tk < 3; tk++) {
    ctx.beginPath();
    ctx.moveTo(bw * 0.24, -s * 0.275 + tk * s * 0.012);
    ctx.lineTo(bw * 0.36, -s * 0.275 + tk * s * 0.012);
    ctx.stroke();
  }
  // Scope elevation turret
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(0, -s * 0.265, bw * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Front sight (folded on rail)
  ctx.fillStyle = "#252528";
  ctx.fillRect(-bw * 0.08, -s * 0.375, bw * 0.16, s * 0.012);

  // === TACTICAL ACCESSORIES ===
  // Flashlight (under barrel)
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.roundRect(-bw * 0.6, -s * 0.34, bw * 0.18, s * 0.1, s * 0.006);
  ctx.fill();
  ctx.strokeStyle = "#1e1e22";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Flashlight lens
  ctx.fillStyle = `rgba(255, 255, 200, ${0.25 + dataPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(-bw * 0.51, -s * 0.34, bw * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // Laser/PEQ box (other side)
  ctx.fillStyle = "#2e2e34";
  ctx.beginPath();
  ctx.roundRect(bw * 0.42, -s * 0.34, bw * 0.2, s * 0.06, s * 0.005);
  ctx.fill();
  ctx.strokeStyle = "#1e1e24";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // PEQ emitter window
  ctx.fillStyle = `rgba(255, 50, 50, ${0.3 + dataPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(bw * 0.52, -s * 0.34, bw * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // PEQ label
  ctx.fillStyle = "#444";
  ctx.fillRect(bw * 0.44, -s * 0.32, bw * 0.14, s * 0.015);

  // Foregrip (vertical, under handguard)
  const fgG = ctx.createLinearGradient(-bw * 0.12, -s * 0.22, bw * 0.12, -s * 0.22);
  fgG.addColorStop(0, "#1a1a1a");
  fgG.addColorStop(0.5, "#282828");
  fgG.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = fgG;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.65, -s * 0.3, bw * 0.15, s * 0.08, s * 0.005);
  ctx.fill();
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Foregrip texture
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 0.4;
  for (let fg = 0; fg < 3; fg++) {
    ctx.beginPath();
    ctx.moveTo(-bw * 0.62, -s * 0.285 + fg * s * 0.02);
    ctx.lineTo(-bw * 0.53, -s * 0.285 + fg * s * 0.02);
    ctx.stroke();
  }

  // Sling mount (front)
  ctx.fillStyle = "#3a3a3e";
  ctx.beginPath();
  ctx.arc(-bw * 0.5, -s * 0.18, s * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // LED indicator on receiver
  ctx.fillStyle = `rgba(0, 255, 100, ${0.5 + dataPulse * 0.4})`;
  ctx.shadowColor = "#00ff66";
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(bw * 0.45, -s * 0.12, s * 0.008, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === MUZZLE FLASH ===
  if (isAttacking) {
    const flashIntensity = Math.abs(Math.sin(attackIntensity * Math.PI * 6));
    const flashSize = s * 0.12 * flashIntensity;

    ctx.shadowColor = "#ffaa33";
    ctx.shadowBlur = 25 * zoom * flashIntensity;

    ctx.fillStyle = `rgba(255, 255, 220, ${flashIntensity * 0.9})`;
    ctx.beginPath();
    ctx.arc(0, -s * 0.55 + recoilKick, flashSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 180, 50, ${flashIntensity * 0.7})`;
    for (let p = 0; p < 6; p++) {
      const pa = (p / 6) * Math.PI * 2 + time * 30;
      const pd = flashSize * (0.8 + Math.sin(time * 40 + p * 2) * 0.3);
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55 + recoilKick);
      ctx.lineTo(
        Math.cos(pa) * pd * 0.4,
        -s * 0.55 + recoilKick + Math.sin(pa) * pd - pd * 0.5,
      );
      ctx.lineTo(
        Math.cos(pa + 0.3) * pd * 0.2,
        -s * 0.55 + recoilKick + Math.sin(pa + 0.3) * pd * 0.5 - pd * 0.3,
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = `rgba(180, 180, 180, ${flashIntensity * 0.25})`;
    for (let w = 0; w < 3; w++) {
      const wy = -s * 0.57 + recoilKick - w * s * 0.04 - (1 - attackIntensity) * s * 0.1;
      const wx = Math.sin(time * 8 + w * 2) * s * 0.025;
      ctx.beginPath();
      ctx.arc(wx, wy, s * 0.018 + w * s * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ejecting casing
    const casingPhase = (attackIntensity * 3) % 1;
    if (casingPhase < 0.6) {
      const cx = bw * 0.6 + casingPhase * s * 0.14;
      const cy = -s * 0.08 - casingPhase * s * 0.06 + casingPhase * casingPhase * s * 0.15;
      ctx.fillStyle = "#c8a832";
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(casingPhase * 5);
      ctx.fillRect(-s * 0.006, -s * 0.014, s * 0.012, s * 0.028);
      ctx.restore();
    }

    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// ─── HEAD, HELMET, AND NVG ARRAY ─────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  dataPulse: number,
  holoFlicker: number,
  zoom: number,
) {
  const headY = y - s * 0.45;

  drawFace(ctx, x, headY, s);
  drawTacticalHelmet(ctx, x, headY, s, time, dataPulse, zoom);
  drawNVGArray(ctx, x, headY, s, time, dataPulse, zoom);
  drawMouthAndChin(ctx, x, headY, s);
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
) {
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.02, s * 0.23, s * 0.21, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTacticalHelmet(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
  time: number,
  dataPulse: number,
  zoom: number,
) {
  // Angular tactical helmet shell
  const shellG = ctx.createRadialGradient(
    x - s * 0.05, headY - s * 0.14, 0,
    x, headY - s * 0.08, s * 0.35,
  );
  shellG.addColorStop(0, "#ffcc22");
  shellG.addColorStop(0.4, "#eab308");
  shellG.addColorStop(0.8, "#b89008");
  shellG.addColorStop(1, "#8a6a08");
  ctx.fillStyle = shellG;

  ctx.beginPath();
  ctx.moveTo(x - s * 0.32, headY - s * 0.02);
  ctx.lineTo(x - s * 0.3, headY - s * 0.18);
  ctx.lineTo(x - s * 0.2, headY - s * 0.28);
  ctx.lineTo(x - s * 0.05, headY - s * 0.32);
  ctx.lineTo(x + s * 0.05, headY - s * 0.32);
  ctx.lineTo(x + s * 0.2, headY - s * 0.28);
  ctx.lineTo(x + s * 0.3, headY - s * 0.18);
  ctx.lineTo(x + s * 0.32, headY - s * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#7a5a08";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central ridge (reinforced, wider)
  ctx.fillStyle = "#ca9a08";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, headY - s * 0.32);
  ctx.lineTo(x - s * 0.03, headY - s * 0.05);
  ctx.lineTo(x + s * 0.03, headY - s * 0.05);
  ctx.lineTo(x + s * 0.05, headY - s * 0.32);
  ctx.closePath();
  ctx.fill();

  // Side rail systems (BIGGER, more visible)
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#5a5a5a";
    ctx.fillRect(
      x + side * s * 0.24, headY - s * 0.22,
      side * s * 0.08, s * 0.16,
    );
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x + side * s * 0.24, headY - s * 0.22,
      side * s * 0.08, s * 0.16,
    );

    // Rail slots (bigger)
    for (let slot = 0; slot < 3; slot++) {
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(
        x + side * s * 0.25, headY - s * 0.2 + slot * s * 0.05,
        side * s * 0.06, s * 0.02,
      );
    }
  }

  // Helmet brim/lip
  const brimG = ctx.createLinearGradient(x - s * 0.36, headY - s * 0.02, x + s * 0.36, headY - s * 0.02);
  brimG.addColorStop(0, "#8a6a08");
  brimG.addColorStop(0.3, "#b89008");
  brimG.addColorStop(0.7, "#b89008");
  brimG.addColorStop(1, "#8a6a08");
  ctx.fillStyle = brimG;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.36, headY);
  ctx.lineTo(x - s * 0.32, headY - s * 0.04);
  ctx.lineTo(x + s * 0.32, headY - s * 0.04);
  ctx.lineTo(x + s * 0.36, headY);
  ctx.lineTo(x + s * 0.34, headY + s * 0.02);
  ctx.lineTo(x - s * 0.34, headY + s * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#7a5a08";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ear protection / comms modules (BIGGER)
  for (const side of [-1, 1]) {
    const ex = x + side * s * 0.31;
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.roundRect(ex - s * 0.055, headY - s * 0.07, s * 0.11, s * 0.13, s * 0.02);
    ctx.fill();
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Speaker grille lines
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 0.6;
    for (let line = 0; line < 3; line++) {
      ctx.beginPath();
      ctx.moveTo(ex - s * 0.035, headY - s * 0.04 + line * s * 0.025);
      ctx.lineTo(ex + s * 0.035, headY - s * 0.04 + line * s * 0.025);
      ctx.stroke();
    }

    // Comms mic boom (left side)
    if (side === -1) {
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex + s * 0.02, headY + s * 0.06);
      ctx.quadraticCurveTo(ex, headY + s * 0.12, x - s * 0.07, headY + s * 0.13);
      ctx.stroke();
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.arc(x - s * 0.07, headY + s * 0.13, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Headlamp (BIGGER, brighter)
  const lampX = x;
  const lampY = headY - s * 0.18;
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.roundRect(lampX - s * 0.06, lampY - s * 0.025, s * 0.12, s * 0.05, s * 0.01);
  ctx.fill();
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 16 * zoom * (0.6 + dataPulse * 0.4);
  ctx.fillStyle = `rgba(255, 255, 220, ${0.8 + dataPulse * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(lampX, lampY, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Side indicator lights (BIGGER glow)
  ctx.fillStyle = `rgba(0, 255, 130, ${0.65 + dataPulse * 0.3})`;
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - s * 0.22, headY - s * 0.13, s * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 60, 40, ${0.65 + dataPulse * 0.3})`;
  ctx.shadowColor = "#ff3030";
  ctx.beginPath();
  ctx.arc(x + s * 0.22, headY - s * 0.13, s * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Kill tally marks (BIGGER, more visible)
  ctx.strokeStyle = "rgba(80, 50, 10, 0.65)";
  ctx.lineWidth = 1.5;
  for (let t = 0; t < 7; t++) {
    const tx = x + s * 0.1 + t * s * 0.025;
    if (t === 4) {
      ctx.beginPath();
      ctx.moveTo(tx - s * 0.06, headY - s * 0.26);
      ctx.lineTo(tx + s * 0.06, headY - s * 0.215);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(tx, headY - s * 0.27);
      ctx.lineTo(tx, headY - s * 0.22);
      ctx.stroke();
    }
  }

  // Velcro patch area
  ctx.fillStyle = "#9a7a08";
  ctx.fillRect(x - s * 0.12, headY - s * 0.15, s * 0.08, s * 0.04);
}

// ─── NVG ARRAY (5-TUBE PANORAMIC) ───────────────────────────────────────────

function drawNVGArray(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
  time: number,
  dataPulse: number,
  zoom: number,
) {
  const mountY = headY - s * 0.08;
  const tubeWidth = s * 0.06;
  const tubeLength = s * 0.08;
  const lensRadius = s * 0.028;

  // NVG mounting bracket/bridge
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.22, mountY - s * 0.02, s * 0.44, s * 0.04, s * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Central mount plate
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.04, mountY - s * 0.03, s * 0.08, s * 0.025, s * 0.005);
  ctx.fill();

  // Pivot/hinge bolts
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(x + side * s * 0.2, mountY, s * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // NVG scan animation: sequential lens brightening
  const scanPhase = (time * 1.5) % 5;

  // 5 NVG tubes arranged in panoramic arc (compact, above face)
  const tubeConfigs = [
    { xOff: 0, angle: 0 },
    { xOff: -s * 0.085, angle: -0.15 },
    { xOff: s * 0.085, angle: 0.15 },
    { xOff: -s * 0.17, angle: -0.35 },
    { xOff: s * 0.17, angle: 0.35 },
  ];

  for (let i = 0; i < tubeConfigs.length; i++) {
    const cfg = tubeConfigs[i];
    const tubeX = x + cfg.xOff;
    const tubeStartY = mountY + s * 0.02;
    const isCenter = i === 0;
    const tw = isCenter ? tubeWidth * 1.15 : tubeWidth;
    const tl = isCenter ? tubeLength * 1.1 : tubeLength;
    const lr = isCenter ? lensRadius * 1.15 : lensRadius;

    ctx.save();
    ctx.translate(tubeX, tubeStartY);
    ctx.rotate(cfg.angle);

    // Tube housing (BIGGER, more detailed)
    const tg = ctx.createLinearGradient(-tw / 2, 0, tw / 2, 0);
    tg.addColorStop(0, "#080808");
    tg.addColorStop(0.2, "#222222");
    tg.addColorStop(0.5, "#2e2e2e");
    tg.addColorStop(0.8, "#222222");
    tg.addColorStop(1, "#080808");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.roundRect(-tw / 2, 0, tw, tl, s * 0.008);
    ctx.fill();
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Tube detail band
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-tw / 2, tl * 0.4);
    ctx.lineTo(tw / 2, tl * 0.4);
    ctx.stroke();

    // Focus ring near lens
    ctx.fillStyle = "#333";
    ctx.fillRect(-tw / 2 - s * 0.003, tl * 0.65, tw + s * 0.006, tl * 0.15);

    // Objective lens (GREEN NVG glow with scan animation)
    const lensY = tl + lr * 0.4;
    const scanDist = Math.abs(i - scanPhase);
    const scanBoost = Math.max(0, 1 - scanDist * 0.7) * 0.3;
    const nvgPulse = 0.75 + Math.sin(time * 3.5 + i * 1.1) * 0.12 + dataPulse * 0.13 + scanBoost;

    ctx.shadowColor = "#00ff44";
    ctx.shadowBlur = (12 + scanBoost * 20) * zoom * (0.5 + dataPulse * 0.5);

    const lg = ctx.createRadialGradient(0, lensY, 0, 0, lensY, lr);
    lg.addColorStop(0, `rgba(0, 255, 68, ${nvgPulse})`);
    lg.addColorStop(0.35, `rgba(0, 230, 55, ${nvgPulse * 0.85})`);
    lg.addColorStop(0.7, `rgba(0, 160, 35, ${nvgPulse * 0.55})`);
    lg.addColorStop(1, `rgba(0, 90, 22, ${nvgPulse * 0.35})`);
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(0, lensY, lr, 0, Math.PI * 2);
    ctx.fill();

    // Lens rim (thicker)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, lensY, lr, 0, Math.PI * 2);
    ctx.stroke();

    // Inner lens ring
    ctx.strokeStyle = `rgba(0, 200, 50, ${0.3 + scanBoost})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, lensY, lr * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Lens glint
    ctx.fillStyle = `rgba(150, 255, 150, ${0.35 + dataPulse * 0.2 + scanBoost * 0.3})`;
    ctx.beginPath();
    ctx.arc(-lr * 0.3, lensY - lr * 0.3, lr * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // NVG power cable (runs to helmet side)
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.2, mountY);
  ctx.quadraticCurveTo(x + s * 0.28, mountY + s * 0.03, x + s * 0.27, mountY + s * 0.08);
  ctx.stroke();

  // Battery pack on cable
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.roundRect(x + s * 0.24, mountY + s * 0.06, s * 0.06, s * 0.035, s * 0.006);
  ctx.fill();
  ctx.fillStyle = `rgba(0, 255, 68, ${0.3 + dataPulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(x + s * 0.27, mountY + s * 0.078, s * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Counterweight on back of helmet
  ctx.fillStyle = "#151515";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.07, headY - s * 0.3, s * 0.14, s * 0.045, s * 0.01);
  ctx.fill();
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawMouthAndChin(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
) {
  // Determined/dangerous mouth
  ctx.strokeStyle = "#8b5030";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.06, headY + s * 0.11);
  ctx.lineTo(x - s * 0.02, headY + s * 0.135);
  ctx.lineTo(x + s * 0.02, headY + s * 0.135);
  ctx.lineTo(x + s * 0.06, headY + s * 0.11);
  ctx.stroke();

  // Chin stubble
  ctx.fillStyle = "#9a7050";
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(
      x - s * 0.05 + i * s * 0.017,
      headY + s * 0.155 + Math.sin(i * 1.5) * s * 0.004,
      s * 0.005, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Jaw scar
  ctx.strokeStyle = "rgba(180, 120, 90, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.08, headY + s * 0.06);
  ctx.lineTo(x + s * 0.13, headY + s * 0.12);
  ctx.lineTo(x + s * 0.11, headY + s * 0.17);
  ctx.stroke();
}

// ─── HOLOGRAPHIC GEARS ───────────────────────────────────────────────────────

function drawHoloGears(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
) {
  for (let g = 0; g < 6; g++) {
    const ga = time * 1.8 + g * Math.PI * 0.34;
    const gd = s * 0.65;
    const gx = x + Math.cos(ga) * gd;
    const gy = y - s * 0.05 + Math.sin(ga) * gd * 0.4;
    const gs = s * (0.07 + Math.sin(time * 2 + g) * 0.018);
    const gAlpha = 0.5 + Math.sin(time * 3 + g * 0.8) * 0.2;

    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 6 * zoom;
    ctx.strokeStyle = `rgba(0, 200, 255, ${gAlpha})`;
    ctx.lineWidth = 1.8 * zoom;

    ctx.beginPath();
    for (let t = 0; t < 8; t++) {
      const ta = (t / 8) * Math.PI * 2 + time * (3 + g * 0.3);
      const ir = gs * 0.5;
      const or = gs;
      if (t === 0) {
        ctx.moveTo(gx + Math.cos(ta) * or, gy + Math.sin(ta) * or * 0.5);
      } else {
        ctx.lineTo(gx + Math.cos(ta) * or, gy + Math.sin(ta) * or * 0.5);
      }
      ctx.lineTo(
        gx + Math.cos(ta + Math.PI / 8) * ir,
        gy + Math.sin(ta + Math.PI / 8) * ir * 0.5,
      );
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = `rgba(0, 255, 200, ${gAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(gx, gy, gs * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ─── ATTACK EFFECTS ──────────────────────────────────────────────────────────

function drawAttackEffects(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  attackIntensity: number,
  holoFlicker: number,
  time: number,
  zoom: number,
) {
  const holoAlpha = attackIntensity * 0.7;

  ctx.strokeStyle = `rgba(0, 255, 200, ${holoAlpha})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.7);
  ctx.lineTo(x - s * 0.3, y - s * 0.9);
  ctx.lineTo(x + s * 0.3, y - s * 0.9);
  ctx.lineTo(x + s * 0.3, y - s * 0.7);
  ctx.lineTo(x - s * 0.3, y - s * 0.7);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.9);
  ctx.lineTo(x, y - s * 1.1);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let r = 0; r < 3; r++) {
    const rr = s * (0.15 + r * 0.1 + attackIntensity * 0.1);
    ctx.strokeStyle = `rgba(234, 179, 8, ${holoAlpha * (1 - r * 0.25)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.6, rr, rr * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = `rgba(0, 255, 200, ${holoAlpha * holoFlicker})`;
  ctx.font = `bold ${8 * zoom}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("DEPLOYING", x, y - s * 0.75);
}

