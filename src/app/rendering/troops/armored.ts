import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
  drawArmoredSkirt,
} from "./troopHelpers";

export function drawArmoredTroop(
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
  const stance = Math.sin(time * 2.8) * 1.1;
  const breathe = Math.sin(time * 2.05) * 0.45;
  const capeWave = Math.sin(time * 3.2) * 0.8;
  const shimmer = 0.62 + Math.sin(time * 5.2) * 0.38;
  const steelPulse = 0.56 + Math.sin(time * 4.4) * 0.3;
  const heraldicColor = color || "#ff6a2a";

  const isAttacking = attackPhase > 0;
  const maceSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 2.25
    : 0;
  const bodyLean = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.2
    : Math.sin(time * 1.6) * 0.03;
  const attackIntensity = attackPhase;

  // Upgraded steel palette — polished blue-steel with strong specular contrast
  const steelBright = "#a8abb8";
  const steelHigh = "#8a8d9e";
  const steelMid = "#646880";
  const steelDark = "#424560";
  const steelDeep = "#282b40";

  // === GROUND SHADOW / PRESENCE ===
  const shadowPulse = isAttacking ? 0.45 : 0.3;
  ctx.fillStyle = `rgba(20, 20, 40, ${shadowPulse})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.36, size * 0.28, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === FLOWING BATTLE CAPE ===
  drawArmoredCape(ctx, x, y, size, breathe, capeWave, shimmer, zoom);

  // === ARMORED LEGS ===
  drawArmoredLegs(ctx, x, y, size, stance, breathe, shimmer, zoom, steelBright, steelHigh, steelMid, steelDark);

  // === CHAINMAIL FAULD ===
  drawChainmailFauld(ctx, x, y, size, breathe, shimmer, zoom, steelHigh, steelMid, steelDark);

  // === CUIRASS ===
  drawCuirass(ctx, x, y, size, breathe, shimmer, zoom, steelBright, steelHigh, steelMid, steelDark, steelDeep);

  // === TABARD ===
  drawTabard(ctx, x, y, size, breathe, shimmer, zoom, heraldicColor);

  // === BELT ===
  drawBelt(ctx, x, y, size, breathe, shimmer, steelPulse, zoom);

  // === ARMORED SKIRT (tassets) ===
  drawArmoredSkirt(ctx, x, y, size, zoom, stance, breathe, {
    armorPeak: steelBright,
    armorHigh: steelHigh,
    armorMid: steelMid,
    armorDark: steelDark,
    trimColor: "#b8a870",
  }, { plateCount: 5, widthFactor: 0.42, depthFactor: 0.14, topOffset: 0.28 });

  // === PAULDRONS ===
  drawPauldrons(ctx, x, y, size, breathe, shimmer, zoom, steelBright, steelHigh, steelMid, steelDark);

  // === LEFT ARM + HEATER SHIELD ===
  drawShieldArm(ctx, x, y, size, stance, breathe, shimmer, zoom, steelMid, steelHigh, steelDark, steelDeep);

  // === RIGHT ARM + FLANGED MACE ===
  drawMaceArm(ctx, x, y, size, stance, breathe, shimmer, zoom, time, isAttacking, attackPhase, attackIntensity, maceSwing, targetPos, steelHigh, steelMid, steelDark);

  // === GORGET + HELMET ===
  drawHelmetAssembly(ctx, x, y, size, breathe, capeWave, shimmer, zoom, isAttacking, attackIntensity, steelBright, steelHigh, steelMid, steelDark, steelDeep);

  drawTroopMasterworkFinish(
    ctx, x, y, size, time, zoom,
    TROOP_MASTERWORK_STYLES.armored,
    { vanguard: true },
  );
  ctx.restore();
}

// ============================================================================
// CAPE
// ============================================================================

function drawArmoredCape(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, capeWave: number, shimmer: number, zoom: number,
) {
  // Outer cape — deep charcoal with subtle warm tint
  const capeOuter = ctx.createLinearGradient(
    x - size * 0.24, y - size * 0.18,
    x + size * 0.12, y + size * 0.54,
  );
  capeOuter.addColorStop(0, "#1e1428");
  capeOuter.addColorStop(0.55, "#16091e");
  capeOuter.addColorStop(1, "#100816");
  ctx.fillStyle = capeOuter;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.13 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.29 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.2 + capeWave * 5,
    y + size * 0.52,
  );
  ctx.lineTo(x + size * 0.13 + capeWave * 2.2, y + size * 0.47);
  ctx.quadraticCurveTo(
    x + size * 0.08, y + size * 0.14,
    x + size * 0.13, y - size * 0.1 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Inner cape — deep crimson with rich gradient
  const capeInner = ctx.createLinearGradient(
    x - size * 0.18, y - size * 0.08,
    x + size * 0.08, y + size * 0.44,
  );
  capeInner.addColorStop(0, "#882818");
  capeInner.addColorStop(0.3, "#b83c1c");
  capeInner.addColorStop(0.6, "#a03420");
  capeInner.addColorStop(1, "#702010");
  ctx.fillStyle = capeInner;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.11 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.2 + capeWave * 3.2, y + size * 0.15,
    x - size * 0.14 + capeWave * 3.8, y + size * 0.39,
  );
  ctx.lineTo(x + size * 0.09 + capeWave * 1.8, y + size * 0.35);
  ctx.quadraticCurveTo(
    x + size * 0.05, y + size * 0.1,
    x + size * 0.09, y - size * 0.09 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Outer edge trim
  ctx.strokeStyle = `rgba(160, 164, 180, ${0.4 + shimmer * 0.3})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.13 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.29 + capeWave * 4, y + size * 0.2,
    x - size * 0.2 + capeWave * 5, y + size * 0.52,
  );
  ctx.stroke();

  // Cape bottom hem embroidery
  ctx.strokeStyle = `rgba(210, 170, 90, ${0.25 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + capeWave * 4.5, y + size * 0.49);
  ctx.lineTo(x + size * 0.12 + capeWave * 2, y + size * 0.44);
  ctx.stroke();
}

// ============================================================================
// LEGS
// ============================================================================

function drawArmoredLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  stance: number, breathe: number, shimmer: number, zoom: number,
  steelBright: string, steelHigh: string, steelMid: string, steelDark: string,
) {
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.09, y + size * 0.3);
    ctx.rotate(side * (-0.09 + stance * 0.02));

    // Upper greave (thigh plate)
    const greaveGrad = ctx.createLinearGradient(-size * 0.065, 0, size * 0.065, 0);
    greaveGrad.addColorStop(0, steelDark);
    greaveGrad.addColorStop(0.3, steelMid);
    greaveGrad.addColorStop(0.55, steelHigh);
    greaveGrad.addColorStop(1, steelDark);
    ctx.fillStyle = greaveGrad;
    ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.1);

    // Knee cop (polished dome)
    const kneeCopGrad = ctx.createRadialGradient(
      -size * 0.01, size * 0.095, 0,
      0, size * 0.1, size * 0.06,
    );
    kneeCopGrad.addColorStop(0, steelBright);
    kneeCopGrad.addColorStop(0.5, steelHigh);
    kneeCopGrad.addColorStop(1, steelDark);
    ctx.fillStyle = kneeCopGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.065, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8b060";
    ctx.beginPath();
    ctx.arc(0, size * 0.1, size * 0.007, 0, Math.PI * 2);
    ctx.fill();

    // Lower greave (shin plate)
    const lowerGrad = ctx.createLinearGradient(-size * 0.06, size * 0.12, size * 0.06, size * 0.12);
    lowerGrad.addColorStop(0, steelDark);
    lowerGrad.addColorStop(0.5, steelMid);
    lowerGrad.addColorStop(1, steelDark);
    ctx.fillStyle = lowerGrad;
    ctx.fillRect(-size * 0.058, size * 0.12, size * 0.116, size * 0.1);

    // Shin ridge highlight
    ctx.strokeStyle = `rgba(200, 204, 224, ${0.25 + shimmer * 0.15})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.13);
    ctx.lineTo(0, size * 0.21);
    ctx.stroke();

    // Trim band
    ctx.fillStyle = `rgba(140, 144, 160, ${0.7 + shimmer * 0.2})`;
    ctx.fillRect(-size * 0.062, size * 0.145, size * 0.124, size * 0.016);

    // Sabaton (segmented foot armor)
    const sabGrad = ctx.createLinearGradient(-size * 0.07, size * 0.2, size * 0.07, size * 0.2);
    sabGrad.addColorStop(0, steelDark);
    sabGrad.addColorStop(0.4, steelMid);
    sabGrad.addColorStop(1, steelDark);
    ctx.fillStyle = sabGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.065, size * 0.2);
    ctx.lineTo(size * 0.065, size * 0.2);
    ctx.lineTo(size * 0.075, size * 0.285);
    ctx.lineTo(-size * 0.075, size * 0.285);
    ctx.closePath();
    ctx.fill();
    // Plate segments
    ctx.strokeStyle = `rgba(100, 104, 130, 0.5)`;
    ctx.lineWidth = 0.7 * zoom;
    for (let seg = 0; seg < 3; seg++) {
      const segY = size * (0.22 + seg * 0.02);
      ctx.beginPath();
      ctx.moveTo(-size * 0.065, segY);
      ctx.lineTo(size * 0.065, segY);
      ctx.stroke();
    }
    // Toe ridge
    ctx.strokeStyle = `rgba(180, 184, 210, 0.25)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.21);
    ctx.lineTo(0, size * 0.28);
    ctx.stroke();
    ctx.restore();
  }
}

// ============================================================================
// CHAINMAIL FAULD
// ============================================================================

function drawChainmailFauld(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, shimmer: number, zoom: number,
  steelHigh: string, steelMid: string, steelDark: string,
) {
  const fauld = ctx.createLinearGradient(
    x - size * 0.17, y + size * 0.22 + breathe,
    x + size * 0.17, y + size * 0.32 + breathe,
  );
  fauld.addColorStop(0, steelDark);
  fauld.addColorStop(0.3, steelMid);
  fauld.addColorStop(0.5, steelHigh);
  fauld.addColorStop(0.7, steelMid);
  fauld.addColorStop(1, steelDark);
  ctx.fillStyle = fauld;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.17, y + size * 0.22 + breathe,
    size * 0.34, size * 0.1, size * 0.02,
  );
  ctx.fill();

  // Chain mail ring pattern — denser, more metallic
  ctx.strokeStyle = `rgba(160, 164, 190, 0.35)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let row = 0; row < 4; row++) {
    const ly = y + size * (0.235 + row * 0.022) + breathe;
    const offset = row % 2 === 0 ? 0 : size * 0.015;
    for (let col = 0; col < 10; col++) {
      const lx = x - size * 0.14 + col * size * 0.03 + offset;
      ctx.beginPath();
      ctx.arc(lx, ly, size * 0.008, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Mail shimmer highlight
  ctx.fillStyle = `rgba(200, 204, 224, ${0.1 + shimmer * 0.08})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.265 + breathe, size * 0.1, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// CUIRASS (CHEST PLATE)
// ============================================================================

function drawCuirass(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, shimmer: number, zoom: number,
  steelBright: string, steelHigh: string, steelMid: string, steelDark: string, steelDeep: string,
) {
  // Back plate shadow
  ctx.fillStyle = steelDeep;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.21, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.23, y - size * 0.11 + breathe * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.23 + breathe * 0.35, x + size * 0.23, y - size * 0.11 + breathe * 0.5);
  ctx.lineTo(x + size * 0.21, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front cuirass — polished steel with strong specular
  const cuirassGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.14,
    x + size * 0.22, y + size * 0.32,
  );
  cuirassGrad.addColorStop(0, steelDark);
  cuirassGrad.addColorStop(0.15, steelMid);
  cuirassGrad.addColorStop(0.35, steelHigh);
  cuirassGrad.addColorStop(0.5, steelBright);
  cuirassGrad.addColorStop(0.65, steelHigh);
  cuirassGrad.addColorStop(0.85, steelMid);
  cuirassGrad.addColorStop(1, steelDark);
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.205, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.225, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.22 + breathe * 0.35, x + size * 0.225, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.205, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Plate edge outline
  ctx.strokeStyle = `rgba(72, 76, 104, 0.6)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.205, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.225, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.22 + breathe * 0.35, x + size * 0.225, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.205, y + size * 0.34 + breathe);
  ctx.stroke();

  // Chest muscle shaping — anatomical curves
  ctx.strokeStyle = `rgba(200, 204, 224, 0.3)`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.12 + breathe * 0.4);
  ctx.quadraticCurveTo(x - size * 0.06, y - size * 0.02 + breathe * 0.6, x, y + size * 0.02 + breathe * 0.7);
  ctx.quadraticCurveTo(x + size * 0.06, y - size * 0.02 + breathe * 0.6, x + size * 0.12, y - size * 0.12 + breathe * 0.4);
  ctx.stroke();

  // Center ridge
  ctx.strokeStyle = `rgba(200, 204, 224, 0.45)`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.08 + breathe * 0.8);
  ctx.stroke();

  // Horizontal plate segment lines
  ctx.strokeStyle = `rgba(44, 48, 72, 0.5)`;
  ctx.lineWidth = 1 * zoom;
  for (let seg = 0; seg < 3; seg++) {
    const segY = y + size * (0.06 + seg * 0.065) + breathe * (0.6 + seg * 0.1);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, segY);
    ctx.lineTo(x + size * 0.18, segY);
    ctx.stroke();
  }

  // Specular chest highlight — bright bloom
  const chestSpec = ctx.createRadialGradient(
    x - size * 0.04, y - size * 0.08 + breathe * 0.4, 0,
    x - size * 0.04, y - size * 0.08 + breathe * 0.4, size * 0.14,
  );
  chestSpec.addColorStop(0, `rgba(230, 234, 255, ${0.25 + shimmer * 0.18})`);
  chestSpec.addColorStop(0.5, `rgba(200, 204, 240, ${0.1 + shimmer * 0.08})`);
  chestSpec.addColorStop(1, "rgba(200, 204, 240, 0)");
  ctx.fillStyle = chestSpec;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.04, y - size * 0.08 + breathe * 0.4, size * 0.12, size * 0.16, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Rivet lines
  ctx.fillStyle = "#b8a870";
  for (let side = -1; side <= 1; side += 2) {
    for (let rv = 0; rv < 4; rv++) {
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.17,
        y - size * 0.06 + rv * size * 0.09 + breathe * (0.4 + rv * 0.12),
        size * 0.008, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

// ============================================================================
// TABARD
// ============================================================================

function drawTabard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, shimmer: number, zoom: number,
  heraldicColor: string,
) {
  const tabardGrad = ctx.createLinearGradient(x - size * 0.1, y - size * 0.02, x + size * 0.1, y + size * 0.27);
  tabardGrad.addColorStop(0, "#7a2210");
  tabardGrad.addColorStop(0.25, "#aa3a18");
  tabardGrad.addColorStop(0.5, heraldicColor);
  tabardGrad.addColorStop(0.75, "#aa3a18");
  tabardGrad.addColorStop(1, "#6b1e0e");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.005 + breathe * 0.5);
  ctx.lineTo(x - size * 0.07, y + size * 0.24 + breathe);
  ctx.lineTo(x, y + size * 0.3 + breathe);
  ctx.lineTo(x + size * 0.07, y + size * 0.24 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.005 + breathe * 0.5);
  ctx.closePath();
  ctx.fill();

  // Cross embroidery
  ctx.strokeStyle = `rgba(180, 184, 200, ${0.8 + shimmer * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.01 + breathe * 0.55);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.lineTo(x + size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.stroke();

  // Cross outline for depth
  ctx.strokeStyle = `rgba(120, 80, 20, 0.4)`;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.01 + breathe * 0.55);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.lineTo(x + size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.stroke();
  // Bright cross on top
  ctx.strokeStyle = `rgba(190, 194, 210, ${0.8 + shimmer * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.01 + breathe * 0.55);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.lineTo(x + size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.stroke();

  // Tabard border
  ctx.strokeStyle = `rgba(150, 154, 170, ${0.55 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.085, y + breathe * 0.5);
  ctx.lineTo(x - size * 0.065, y + size * 0.235 + breathe);
  ctx.lineTo(x, y + size * 0.29 + breathe);
  ctx.lineTo(x + size * 0.065, y + size * 0.235 + breathe);
  ctx.lineTo(x + size * 0.085, y + breathe * 0.5);
  ctx.stroke();
}

// ============================================================================
// BELT
// ============================================================================

function drawBelt(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, shimmer: number, steelPulse: number, zoom: number,
) {
  ctx.fillStyle = "#1e1e2a";
  ctx.fillRect(x - size * 0.19, y + size * 0.252 + breathe, size * 0.38, size * 0.058);
  ctx.fillStyle = `rgba(186, 61, 45, ${0.6 + steelPulse * 0.2})`;
  ctx.fillRect(x - size * 0.175, y + size * 0.262 + breathe, size * 0.35, size * 0.017);
  ctx.fillStyle = "#a08a50";
  for (let stud = -2; stud <= 2; stud++) {
    ctx.beginPath();
    ctx.arc(x + stud * size * 0.07, y + size * 0.271 + breathe, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Buckle
  const buckleGrad = ctx.createLinearGradient(
    x - size * 0.04, y + size * 0.255 + breathe,
    x + size * 0.04, y + size * 0.305 + breathe,
  );
  buckleGrad.addColorStop(0, "#d4b870");
  buckleGrad.addColorStop(0.5, "#f0d890");
  buckleGrad.addColorStop(1, "#b09840");
  ctx.fillStyle = buckleGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.048, y + size * 0.253 + breathe, size * 0.096, size * 0.054, size * 0.012);
  ctx.fill();
  ctx.strokeStyle = "#8a7430";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 100, 60, ${0.6 + shimmer * 0.35})`;
  ctx.shadowColor = "rgba(255, 100, 60, 0.5)";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.28 + breathe, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ============================================================================
// PAULDRONS
// ============================================================================

function drawPauldrons(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, shimmer: number, zoom: number,
  steelBright: string, steelHigh: string, steelMid: string, steelDark: string,
) {
  for (let side = -1; side <= 1; side += 2) {
    const px = x + side * size * 0.245;
    const py = y - size * 0.055 + breathe * 0.5;

    // Base plate with deep gradient
    const pauldronGrad = ctx.createRadialGradient(
      px - side * size * 0.025, py - size * 0.025, 0,
      px, py, size * 0.14,
    );
    pauldronGrad.addColorStop(0, steelBright);
    pauldronGrad.addColorStop(0.35, steelHigh);
    pauldronGrad.addColorStop(0.7, steelMid);
    pauldronGrad.addColorStop(1, steelDark);
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.12, size * 0.085, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Upper ridge plate
    ctx.fillStyle = steelHigh;
    ctx.beginPath();
    ctx.ellipse(px, py - size * 0.025, size * 0.09, size * 0.045, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = `rgba(220, 224, 248, ${0.22 + shimmer * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(px - side * size * 0.02, py - size * 0.035, size * 0.04, size * 0.025, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Trim border
    ctx.strokeStyle = `rgba(155, 160, 178, ${0.75 + shimmer * 0.2})`;
    ctx.lineWidth = 1.6 * zoom;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.12, size * 0.085, side * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Plate ridges
    for (let seg = 0; seg < 2; seg++) {
      const segY = py + size * (0.02 + seg * 0.025);
      ctx.strokeStyle = `rgba(44, 48, 72, ${0.4 - seg * 0.12})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(px, segY, size * (0.1 - seg * 0.015), size * 0.025, side * 0.3, 0, Math.PI);
      ctx.stroke();
    }

    // Rivets
    ctx.fillStyle = "#c8b060";
    const rivetAngles = [-0.8, 0, 0.8, Math.PI];
    for (const ra of rivetAngles) {
      const adjustedAngle = ra + side * 0.3;
      ctx.beginPath();
      ctx.arc(
        px + Math.cos(adjustedAngle) * size * 0.095,
        py + Math.sin(adjustedAngle) * size * 0.065,
        size * 0.007, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Engraved spiral
    ctx.strokeStyle = `rgba(200, 175, 110, ${0.35 + shimmer * 0.15})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.04, -0.5 + side * 0.5, 1.5 + side * 0.5);
    ctx.stroke();
  }
}

// ============================================================================
// SHIELD ARM
// ============================================================================

function drawShieldArm(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  stance: number, breathe: number, shimmer: number, zoom: number,
  steelMid: string, steelHigh: string, steelDark: string, steelDeep: string,
) {
  const shieldX = x - size * 0.30;
  const shieldY = y + size * 0.075 + breathe * 0.55;
  const lShoulderX = x - size * 0.26;
  const lShoulderY = y + size * 0.02 + breathe * 0.45;
  const armAngle = Math.atan2(shieldY - lShoulderY, shieldX - lShoulderX);

  // Arm
  ctx.save();
  ctx.translate(lShoulderX, lShoulderY);
  ctx.rotate(armAngle);
  ctx.fillStyle = steelMid;
  ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.18, size * 0.08);
  ctx.fillStyle = steelHigh;
  ctx.fillRect(size * 0.1, -size * 0.045, size * 0.1, size * 0.09);
  ctx.fillStyle = "#b94935";
  ctx.fillRect(size * 0.11, -size * 0.01, size * 0.08, size * 0.02);
  ctx.fillStyle = steelMid;
  ctx.beginPath();
  ctx.arc(size * 0.2, 0, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shield
  ctx.save();
  ctx.translate(shieldX, shieldY);
  ctx.rotate(-0.36 + stance * 0.02);

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.15);
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.22, 0, -size * 0.23);
  ctx.quadraticCurveTo(size * 0.15, -size * 0.22, size * 0.15, -size * 0.15);
  ctx.lineTo(size * 0.1, size * 0.12);
  ctx.lineTo(0, size * 0.24);
  ctx.lineTo(-size * 0.1, size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Shield body — dark steel with polish
  const shieldGrad = ctx.createLinearGradient(-size * 0.15, -size * 0.1, size * 0.15, size * 0.1);
  shieldGrad.addColorStop(0, steelDeep);
  shieldGrad.addColorStop(0.25, steelDark);
  shieldGrad.addColorStop(0.5, steelMid);
  shieldGrad.addColorStop(0.75, steelDark);
  shieldGrad.addColorStop(1, steelDeep);
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.135, -size * 0.14);
  ctx.quadraticCurveTo(-size * 0.14, -size * 0.21, 0, -size * 0.22);
  ctx.quadraticCurveTo(size * 0.14, -size * 0.21, size * 0.135, -size * 0.14);
  ctx.lineTo(size * 0.09, size * 0.11);
  ctx.lineTo(0, size * 0.22);
  ctx.lineTo(-size * 0.09, size * 0.11);
  ctx.closePath();
  ctx.fill();

  // Inner field
  const fieldGrad = ctx.createLinearGradient(0, -size * 0.18, 0, size * 0.18);
  fieldGrad.addColorStop(0, "#1e1e36");
  fieldGrad.addColorStop(0.5, "#161630");
  fieldGrad.addColorStop(1, "#121228");
  ctx.fillStyle = fieldGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.16, 0, -size * 0.17);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.16, size * 0.1, -size * 0.1);
  ctx.lineTo(size * 0.06, size * 0.08);
  ctx.lineTo(0, size * 0.16);
  ctx.lineTo(-size * 0.06, size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Diagonal heraldic division
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.16, 0, -size * 0.17);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.16, size * 0.1, -size * 0.1);
  ctx.lineTo(size * 0.06, size * 0.08);
  ctx.lineTo(0, size * 0.16);
  ctx.lineTo(-size * 0.06, size * 0.08);
  ctx.closePath();
  ctx.clip();
  const redFieldGrad = ctx.createLinearGradient(-size * 0.1, -size * 0.16, size * 0.04, size * 0.04);
  redFieldGrad.addColorStop(0, "#8a2010");
  redFieldGrad.addColorStop(0.5, "#b03018");
  redFieldGrad.addColorStop(1, "#7a1a0c");
  ctx.fillStyle = redFieldGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.18);
  ctx.lineTo(size * 0.12, -size * 0.18);
  ctx.lineTo(-size * 0.08, size * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Division line
  ctx.strokeStyle = `rgba(145, 150, 170, ${0.65 + shimmer * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.13);
  ctx.lineTo(-size * 0.06, size * 0.09);
  ctx.stroke();

  // Mace charge emblem
  ctx.save();
  ctx.translate(0, -size * 0.02);
  ctx.strokeStyle = `rgba(200, 175, 110, ${0.75 + shimmer * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.08);
  ctx.lineTo(0, -size * 0.06);
  ctx.stroke();
  ctx.fillStyle = `rgba(160, 164, 182, ${0.7 + shimmer * 0.2})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.065, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  for (let fl = 0; fl < 6; fl++) {
    const fa = (fl / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(fa) * size * 0.015, -size * 0.065 + Math.sin(fa) * size * 0.015);
    ctx.lineTo(Math.cos(fa) * size * 0.035, -size * 0.065 + Math.sin(fa) * size * 0.035);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(255, 100, 40, ${0.55 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Outer border
  ctx.strokeStyle = "#7a7e90";
  ctx.lineWidth = 2.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.135, -size * 0.14);
  ctx.quadraticCurveTo(-size * 0.14, -size * 0.21, 0, -size * 0.22);
  ctx.quadraticCurveTo(size * 0.14, -size * 0.21, size * 0.135, -size * 0.14);
  ctx.lineTo(size * 0.09, size * 0.11);
  ctx.lineTo(0, size * 0.22);
  ctx.lineTo(-size * 0.09, size * 0.11);
  ctx.closePath();
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = "#9a8038";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.115, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.18, 0, -size * 0.19);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.18, size * 0.115, -size * 0.12);
  ctx.lineTo(size * 0.07, size * 0.09);
  ctx.lineTo(0, size * 0.19);
  ctx.lineTo(-size * 0.07, size * 0.09);
  ctx.closePath();
  ctx.stroke();

  // Shield rivets
  const shieldRivets: [number, number][] = [
    [0, -size * 0.2], [-size * 0.12, -size * 0.1], [size * 0.12, -size * 0.1],
    [-size * 0.07, size * 0.07], [size * 0.07, size * 0.07], [0, size * 0.18],
  ];
  ctx.fillStyle = "#c8b060";
  for (const [rx, ry] of shieldRivets) {
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a0a4b4";
    ctx.beginPath();
    ctx.arc(rx - size * 0.002, ry - size * 0.002, size * 0.004, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8b060";
  }

  // Edge specular
  ctx.strokeStyle = "rgba(160, 184, 230, 0.22)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.215);
  ctx.quadraticCurveTo(-size * 0.13, -size * 0.2, -size * 0.13, -size * 0.13);
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// MACE BANNER
// ============================================================================

function drawMaceBanner(
  ctx: CanvasRenderingContext2D,
  size: number, zoom: number, time: number, shimmer: number,
) {
  const bannerAttachY = -size * 0.5;
  const bannerWidth = size * 0.065;
  const bannerLength = size * 0.18;
  const segments = 6;
  const segH = bannerLength / segments;

  const windPhase = time * 0.003;
  const windStrength = 0.35 + Math.sin(time * 0.0014) * 0.15;

  ctx.save();

  const bannerGrad = ctx.createLinearGradient(
    size * 0.025, bannerAttachY,
    size * 0.025, bannerAttachY + bannerLength,
  );
  bannerGrad.addColorStop(0, "#b83030");
  bannerGrad.addColorStop(0.4, "#c04040");
  bannerGrad.addColorStop(0.7, "#a02828");
  bannerGrad.addColorStop(1, "#7a1818");

  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  let prevLX = size * 0.025 - bannerWidth * 0.5;
  let prevRX = size * 0.025 + bannerWidth * 0.5;
  let prevY = bannerAttachY;
  ctx.moveTo(prevLX, prevY);

  const leftXs: number[] = [prevLX];
  const rightXs: number[] = [prevRX];
  const ys: number[] = [prevY];

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const wave = Math.sin(windPhase + t * 3.5) * windStrength * size * 0.04 * t;
    const cy = bannerAttachY + segH * i;
    const narrowing = 1 - t * 0.15;
    const lx = size * 0.025 - bannerWidth * 0.5 * narrowing + wave;
    const rx = size * 0.025 + bannerWidth * 0.5 * narrowing + wave;
    leftXs.push(lx);
    rightXs.push(rx);
    ys.push(cy);
  }

  for (let i = 1; i <= segments; i++) {
    ctx.lineTo(leftXs[i], ys[i]);
  }

  // Swallowtail cut at bottom
  const tailMidX = (leftXs[segments] + rightXs[segments]) * 0.5;
  const tailY = ys[segments];
  ctx.lineTo(tailMidX, tailY - segH * 0.45);
  ctx.lineTo(rightXs[segments], tailY);

  for (let i = segments - 1; i >= 0; i--) {
    ctx.lineTo(rightXs[i], ys[i]);
  }
  ctx.closePath();
  ctx.fill();

  // Dark fold lines for depth
  ctx.strokeStyle = "rgba(60, 10, 10, 0.35)";
  ctx.lineWidth = 0.6 * zoom;
  for (let i = 1; i < segments; i++) {
    const midX = (leftXs[i] + rightXs[i]) * 0.5;
    ctx.beginPath();
    ctx.moveTo(leftXs[i] + bannerWidth * 0.12, ys[i]);
    ctx.quadraticCurveTo(midX, ys[i] + segH * 0.15, rightXs[i] - bannerWidth * 0.12, ys[i]);
    ctx.stroke();
  }

  // Bright highlight stripe (catches the light)
  ctx.strokeStyle = `rgba(255, 180, 140, ${0.15 + shimmer * 0.12})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const hx = leftXs[i] + (rightXs[i] - leftXs[i]) * 0.3;
    if (i === 0) ctx.moveTo(hx, ys[i]);
    else ctx.lineTo(hx, ys[i]);
  }
  ctx.stroke();

  // Tiny cross emblem near the top of the banner
  const crossCX = (leftXs[1] + rightXs[1]) * 0.5;
  const crossCY = ys[0] + segH * 0.7;
  ctx.strokeStyle = `rgba(180, 184, 200, ${0.7 + shimmer * 0.2})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(crossCX, crossCY - size * 0.014);
  ctx.lineTo(crossCX, crossCY + size * 0.014);
  ctx.moveTo(crossCX - size * 0.01, crossCY);
  ctx.lineTo(crossCX + size * 0.01, crossCY);
  ctx.stroke();

  // Binding ring at attachment point
  ctx.fillStyle = "#8a8e9e";
  ctx.beginPath();
  ctx.roundRect(
    size * 0.025 - bannerWidth * 0.55,
    bannerAttachY - size * 0.008,
    bannerWidth * 1.1,
    size * 0.016,
    size * 0.004,
  );
  ctx.fill();
  ctx.strokeStyle = "#686c80";
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// MACE ARM
// ============================================================================

function drawMaceArm(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  stance: number, breathe: number, shimmer: number, zoom: number,
  time: number,
  isAttacking: boolean, attackPhase: number, attackIntensity: number, maceSwing: number,
  targetPos: Position | undefined,
  steelHigh: string, steelMid: string, steelDark: string,
) {
  ctx.save();
  const armBaseAngle = isAttacking ? -1.2 + attackPhase * 2.65 : 0.42 + stance * 0.03;
  const armX = x + size * 0.31 + (isAttacking ? maceSwing * size * 0.08 : 0);
  const armY = y + size * 0.02 + breathe * 0.45;
  const armAngle = resolveWeaponRotation(
    targetPos, armX, armY, armBaseAngle,
    Math.PI / 2, isAttacking ? 1.05 : 0.58, WEAPON_LIMITS.rightArm,
  );
  ctx.translate(armX, armY);
  ctx.rotate(armAngle);

  // Armored upper arm
  const armPlateGrad = ctx.createLinearGradient(-size * 0.056, 0, size * 0.056, 0);
  armPlateGrad.addColorStop(0, steelDark);
  armPlateGrad.addColorStop(0.4, steelHigh);
  armPlateGrad.addColorStop(1, steelDark);
  ctx.fillStyle = armPlateGrad;
  ctx.fillRect(-size * 0.056, 0, size * 0.112, size * 0.225);
  ctx.fillStyle = steelHigh;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.17, size * 0.065, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c8b060";
  ctx.beginPath();
  ctx.arc(0, size * 0.17, size * 0.007, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = steelMid;
  ctx.fillRect(-size * 0.06, size * 0.19, size * 0.12, size * 0.045);

  const maceWristAngle = isAttacking ? -0.12 + attackPhase * 0.3 : -0.08 + stance * 0.01;
  ctx.translate(0, size * 0.21);
  ctx.rotate(maceWristAngle);

  // Mace shaft
  const shaftGrad = ctx.createLinearGradient(-size * 0.024, -size * 0.56, size * 0.024, size * 0.2);
  shaftGrad.addColorStop(0, "#3a2810");
  shaftGrad.addColorStop(0.2, "#5a4020");
  shaftGrad.addColorStop(0.5, "#6d5030");
  shaftGrad.addColorStop(0.8, "#4a3518");
  shaftGrad.addColorStop(1, "#2a1a0c");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.024, -size * 0.56, size * 0.048, size * 0.76);
  ctx.fillStyle = "rgba(140, 110, 60, 0.18)";
  ctx.fillRect(-size * 0.006, -size * 0.52, size * 0.012, size * 0.68);
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 1.2 * zoom;
  for (let wrap = 0; wrap < 8; wrap++) {
    const wy = -size * 0.12 + wrap * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(-size * 0.024, wy);
    ctx.lineTo(size * 0.024, wy + size * 0.022);
    ctx.stroke();
  }

  // Upper collar band
  ctx.fillStyle = "#8a8e9e";
  ctx.beginPath();
  ctx.roundRect(-size * 0.035, -size * 0.53, size * 0.07, size * 0.028, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#686c80";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Small banner hanging from collar band
  drawMaceBanner(ctx, size, zoom, time, shimmer);

  // Pommel
  const pomGrad = ctx.createRadialGradient(0, size * 0.2, 0, 0, size * 0.2, size * 0.028);
  pomGrad.addColorStop(0, "#a0a4b8");
  pomGrad.addColorStop(0.6, "#787c92");
  pomGrad.addColorStop(1, "#505468");
  ctx.fillStyle = pomGrad;
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 80, 40, ${0.55 + shimmer * 0.35})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // === MACE HEAD — larger, more imposing ===
  const maceHeadY = -size * 0.66;

  // Attack glow
  if (isAttacking) {
    ctx.shadowColor = "rgba(255, 200, 120, 0.6)";
    ctx.shadowBlur = (10 + attackIntensity * 12) * zoom;
  }

  const maceHeadGrad = ctx.createRadialGradient(
    -size * 0.02, maceHeadY - size * 0.02, size * 0.01,
    0, maceHeadY, size * 0.11,
  );
  maceHeadGrad.addColorStop(0, "#f0f0fa");
  maceHeadGrad.addColorStop(0.25, "#c0c4d8");
  maceHeadGrad.addColorStop(0.55, "#8a8ea8");
  maceHeadGrad.addColorStop(1, "#505468");
  ctx.fillStyle = maceHeadGrad;
  ctx.beginPath();
  ctx.arc(0, maceHeadY, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flanges — larger, sharper, with individual gradients
  for (let flange = 0; flange < 8; flange++) {
    const a = (flange / 8) * Math.PI * 2;
    const innerR = size * 0.055;
    const outerR = size * 0.14;
    const flangeW = 0.22;
    const ix = Math.cos(a) * innerR;
    const iy = maceHeadY + Math.sin(a) * innerR;
    const ox = Math.cos(a) * outerR;
    const oy = maceHeadY + Math.sin(a) * outerR;
    const wax = Math.cos(a + flangeW) * (innerR + size * 0.028);
    const way = maceHeadY + Math.sin(a + flangeW) * (innerR + size * 0.028);
    const wbx = Math.cos(a - flangeW) * (innerR + size * 0.028);
    const wby = maceHeadY + Math.sin(a - flangeW) * (innerR + size * 0.028);

    const flangeGrad = ctx.createLinearGradient(ix, iy, ox, oy);
    flangeGrad.addColorStop(0, "#a0a4be");
    flangeGrad.addColorStop(0.4, "#d0d4e4");
    flangeGrad.addColorStop(0.7, "#b0b4c8");
    flangeGrad.addColorStop(1, "#707488");
    ctx.fillStyle = flangeGrad;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(wax, way);
    ctx.lineTo(ox, oy);
    ctx.lineTo(wbx, wby);
    ctx.closePath();
    ctx.fill();

    // Flange edge highlight
    ctx.strokeStyle = `rgba(220, 224, 248, 0.3)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(wax, way);
    ctx.lineTo(ox, oy);
    ctx.stroke();
  }

  // Central gem — larger, brighter
  ctx.fillStyle = `rgba(255, 180, 80, ${0.5 + shimmer * 0.45})`;
  ctx.shadowColor = "rgba(255, 160, 60, 0.6)";
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.arc(0, maceHeadY, size * 0.026, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Border ring
  ctx.strokeStyle = `rgba(200, 170, 100, ${0.55 + shimmer * 0.25})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.arc(0, maceHeadY, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Attack swing trail — bigger, more dramatic
  if (isAttacking && Math.abs(maceSwing) > 0.32) {
    const trailAlpha = Math.abs(maceSwing) * 0.5;
    ctx.strokeStyle = `rgba(200, 210, 240, ${trailAlpha})`;
    ctx.lineWidth = 4.5 * zoom;
    ctx.beginPath();
    ctx.arc(0, maceHeadY, size * 0.26, -Math.PI * 0.54, -Math.PI * 0.54 + maceSwing * 0.84);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 220, 180, ${trailAlpha * 0.45})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(0, maceHeadY, size * 0.2, -Math.PI * 0.52, -Math.PI * 0.52 + maceSwing * 0.78);
    ctx.stroke();

    // Impact sparks during swing peak
    if (attackPhase > 0.3 && attackPhase < 0.7) {
      const sparkAlpha = Math.sin(((attackPhase - 0.3) / 0.4) * Math.PI) * 0.6;
      ctx.fillStyle = `rgba(255, 240, 180, ${sparkAlpha})`;
      for (let sp = 0; sp < 4; sp++) {
        const sa = maceSwing + sp * 0.4;
        const sr = size * (0.14 + sp * 0.03);
        ctx.beginPath();
        ctx.arc(Math.cos(sa) * sr, maceHeadY + Math.sin(sa) * sr, size * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// ============================================================================
// HELMET ASSEMBLY (GORGET + HELM + PLUME)
// ============================================================================

function drawHelmetAssembly(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, capeWave: number, shimmer: number, zoom: number,
  isAttacking: boolean, attackIntensity: number,
  steelBright: string, steelHigh: string, steelMid: string, steelDark: string, steelDeep: string,
) {
  const helmBreath = breathe * 0.2;

  // === GORGET ===
  const gorgetGrad = ctx.createLinearGradient(x - size * 0.09, y - size * 0.15, x + size * 0.09, y - size * 0.15);
  gorgetGrad.addColorStop(0, steelDark);
  gorgetGrad.addColorStop(0.3, steelMid);
  gorgetGrad.addColorStop(0.55, steelHigh);
  gorgetGrad.addColorStop(0.7, steelMid);
  gorgetGrad.addColorStop(1, steelDark);
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.085 + breathe);
  ctx.lineTo(x - size * 0.115, y - size * 0.17 + breathe);
  ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.115, y - size * 0.17 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.085 + breathe);
  ctx.closePath();
  ctx.fill();

  // Gorget plate lines
  ctx.strokeStyle = `rgba(72, 76, 104, 0.45)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.085, y - size * 0.1 + breathe);
  ctx.lineTo(x + size * 0.085, y - size * 0.1 + breathe);
  ctx.moveTo(x - size * 0.09, y - size * 0.12 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.12 + breathe);
  ctx.stroke();

  // Gorget trim
  ctx.strokeStyle = `rgba(150, 154, 172, ${0.65 + shimmer * 0.2})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.085 + breathe);
  ctx.lineTo(x - size * 0.115, y - size * 0.17 + breathe);
  ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.115, y - size * 0.17 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.085 + breathe);
  ctx.stroke();

  // === HELM DOME ===
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.16, y - size * 0.40 + helmBreath,
    x + size * 0.16, y - size * 0.16 + helmBreath,
  );
  helmGrad.addColorStop(0, steelDark);
  helmGrad.addColorStop(0.18, steelMid);
  helmGrad.addColorStop(0.4, steelHigh);
  helmGrad.addColorStop(0.55, steelBright);
  helmGrad.addColorStop(0.7, steelHigh);
  helmGrad.addColorStop(0.85, steelMid);
  helmGrad.addColorStop(1, steelDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.30 + helmBreath);
  ctx.quadraticCurveTo(x - size * 0.17, y - size * 0.42 + helmBreath * 0.5, x, y - size * 0.44 + helmBreath * 0.5);
  ctx.quadraticCurveTo(x + size * 0.17, y - size * 0.42 + helmBreath * 0.5, x + size * 0.14, y - size * 0.30 + helmBreath);
  ctx.lineTo(x + size * 0.13, y - size * 0.18 + helmBreath);
  ctx.lineTo(x - size * 0.13, y - size * 0.18 + helmBreath);
  ctx.closePath();
  ctx.fill();

  // Helm center ridge
  ctx.strokeStyle = `rgba(200, 204, 224, 0.45)`;
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.43 + helmBreath * 0.5);
  ctx.lineTo(x, y - size * 0.20 + helmBreath);
  ctx.stroke();

  // Specular dome highlight
  ctx.fillStyle = `rgba(220, 224, 248, ${0.15 + shimmer * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.04, y - size * 0.36 + helmBreath * 0.6, size * 0.05, size * 0.07, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // === VISOR — T-shaped opening, deeper contrast ===
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 3 * zoom;
  ctx.fillStyle = "#080810";
  // Eye slit
  ctx.beginPath();
  ctx.roundRect(x - size * 0.11, y - size * 0.30 + helmBreath, size * 0.22, size * 0.044, size * 0.012);
  ctx.fill();
  // Nose/mouth slot
  ctx.beginPath();
  ctx.roundRect(x - size * 0.022, y - size * 0.30 + helmBreath, size * 0.044, size * 0.11, size * 0.006);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye glow
  const eyeGlow = 0.5 + shimmer * 0.4 + attackIntensity * 0.3;
  ctx.fillStyle = `rgba(240, 200, 110, ${eyeGlow})`;
  ctx.shadowColor = "rgba(240, 180, 60, 0.5)";
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.278 + helmBreath, size * 0.014, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.278 + helmBreath, size * 0.014, 0, Math.PI * 2);
  ctx.fill();
  // Eye core
  ctx.fillStyle = `rgba(255, 255, 240, ${eyeGlow * 0.35})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.278 + helmBreath, size * 0.005, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.278 + helmBreath, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Breathing holes
  ctx.fillStyle = "#14141e";
  for (let side = -1; side <= 1; side += 2) {
    for (let hole = 0; hole < 3; hole++) {
      ctx.beginPath();
      ctx.arc(x + side * size * 0.05, y - size * (0.22 - hole * 0.02) + helmBreath, size * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Visor border ridges
  ctx.strokeStyle = steelMid;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.30 + helmBreath);
  ctx.lineTo(x - size * 0.12, y - size * 0.20 + helmBreath);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.30 + helmBreath);
  ctx.lineTo(x + size * 0.12, y - size * 0.20 + helmBreath);
  ctx.stroke();

  // Cheek guards
  ctx.fillStyle = steelMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.29 + helmBreath);
  ctx.lineTo(x - size * 0.155, y - size * 0.23 + helmBreath);
  ctx.lineTo(x - size * 0.12, y - size * 0.18 + helmBreath);
  ctx.lineTo(x - size * 0.08, y - size * 0.18 + helmBreath);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.29 + helmBreath);
  ctx.lineTo(x + size * 0.155, y - size * 0.23 + helmBreath);
  ctx.lineTo(x + size * 0.12, y - size * 0.18 + helmBreath);
  ctx.lineTo(x + size * 0.08, y - size * 0.18 + helmBreath);
  ctx.closePath();
  ctx.fill();

  // === CREST PLUME ===
  const crestBaseY = y - size * 0.43 + helmBreath * 0.5;
  const crestPeakH = size * 0.32;
  const crestSpread = size * 0.18;
  const plumeWave = capeWave;

  // Rear shadow layer
  ctx.fillStyle = "rgba(120, 30, 5, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, crestBaseY);
  ctx.quadraticCurveTo(
    x - crestSpread * 0.3 + plumeWave * 1.2, crestBaseY - crestPeakH * 0.95,
    x + crestSpread * 0.6 + plumeWave * 2.5, crestBaseY - crestPeakH * 0.15,
  );
  ctx.quadraticCurveTo(
    x + crestSpread * 0.15, crestBaseY - crestPeakH * 0.35,
    x + size * 0.02, crestBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Base crest
  const crestBase = ctx.createLinearGradient(x, crestBaseY - crestPeakH, x + crestSpread, crestBaseY);
  crestBase.addColorStop(0, "#ff6a10");
  crestBase.addColorStop(0.35, "#e84a0a");
  crestBase.addColorStop(0.7, "#c13208");
  crestBase.addColorStop(1, "#8a2006");
  ctx.fillStyle = crestBase;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, crestBaseY);
  ctx.quadraticCurveTo(
    x - crestSpread * 0.2 + plumeWave * 1.0, crestBaseY - crestPeakH * 0.9,
    x + crestSpread * 0.5 + plumeWave * 2.0, crestBaseY - crestPeakH * 0.1,
  );
  ctx.quadraticCurveTo(
    x + crestSpread * 0.1, crestBaseY - crestPeakH * 0.3,
    x + size * 0.015, crestBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Highlight layer
  ctx.fillStyle = `rgba(255, 140, 40, ${0.45 + shimmer * 0.25})`;
  ctx.beginPath();
  ctx.moveTo(x, crestBaseY - size * 0.02);
  ctx.quadraticCurveTo(
    x - crestSpread * 0.1 + plumeWave * 0.8, crestBaseY - crestPeakH * 0.85,
    x + crestSpread * 0.35 + plumeWave * 1.5, crestBaseY - crestPeakH * 0.15,
  );
  ctx.quadraticCurveTo(
    x + crestSpread * 0.05, crestBaseY - crestPeakH * 0.25,
    x, crestBaseY - size * 0.02,
  );
  ctx.closePath();
  ctx.fill();

  // Hair strands
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.3 + shimmer * 0.18})`;
  ctx.lineWidth = 0.9 * zoom;
  for (let strand = 0; strand < 6; strand++) {
    const t = strand / 5;
    const sx = x + (t - 0.2) * crestSpread * 0.4 + plumeWave * (0.5 + t);
    ctx.beginPath();
    ctx.moveTo(x, crestBaseY);
    ctx.quadraticCurveTo(sx, crestBaseY - crestPeakH * (0.6 + t * 0.3), sx + crestSpread * 0.2, crestBaseY - crestPeakH * 0.1 * (1 - t));
    ctx.stroke();
  }

  // Crest clamp
  ctx.fillStyle = "#7a7e92";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.025, crestBaseY - size * 0.01, size * 0.05, size * 0.02, size * 0.005);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 40, ${0.55 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, crestBaseY, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
}
