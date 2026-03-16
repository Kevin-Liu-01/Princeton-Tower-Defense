import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
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

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === CAPE (dark, knight-like — longer than recruit, shorter than elite) ===
  const capeOuter = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.18,
    x + size * 0.12,
    y + size * 0.54,
  );
  capeOuter.addColorStop(0, "#1a1020");
  capeOuter.addColorStop(0.55, "#14081a");
  capeOuter.addColorStop(1, "#0e0614");
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
    x + size * 0.08,
    y + size * 0.14,
    x + size * 0.13,
    y - size * 0.1 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  const capeInner = ctx.createLinearGradient(
    x - size * 0.18,
    y - size * 0.08,
    x + size * 0.08,
    y + size * 0.44,
  );
  capeInner.addColorStop(0, "#7a2a14");
  capeInner.addColorStop(0.45, "#aa3a18");
  capeInner.addColorStop(1, "#6b2412");
  ctx.fillStyle = capeInner;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.11 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.2 + capeWave * 3.2,
    y + size * 0.15,
    x - size * 0.14 + capeWave * 3.8,
    y + size * 0.39,
  );
  ctx.lineTo(x + size * 0.09 + capeWave * 1.8, y + size * 0.35);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y + size * 0.1,
    x + size * 0.09,
    y - size * 0.09 + breathe,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(233, 173, 84, ${0.35 + shimmer * 0.3})`;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.13 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.29 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.2 + capeWave * 5,
    y + size * 0.52,
  );
  ctx.stroke();

  // === LEGS AND SABATONS (articulated greaves with knee cops) ===
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.09, y + size * 0.3);
    ctx.rotate(side * (-0.09 + stance * 0.02));

    // Upper greave (thigh plate)
    const greaveGrad = ctx.createLinearGradient(
      -size * 0.065,
      0,
      size * 0.065,
      0,
    );
    greaveGrad.addColorStop(0, "#42424e");
    greaveGrad.addColorStop(0.3, "#6a6a7e");
    greaveGrad.addColorStop(0.5, "#8a8a9a");
    greaveGrad.addColorStop(0.7, "#6a6a7e");
    greaveGrad.addColorStop(1, "#404050");
    ctx.fillStyle = greaveGrad;
    ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.1);

    // Knee cop (rounded plate)
    const kneeCopGrad = ctx.createRadialGradient(
      0,
      size * 0.1,
      0,
      0,
      size * 0.1,
      size * 0.06,
    );
    kneeCopGrad.addColorStop(0, "#a0a0b0");
    kneeCopGrad.addColorStop(0.6, "#7a7a8e");
    kneeCopGrad.addColorStop(1, "#505060");
    ctx.fillStyle = kneeCopGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.065, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    // Knee cop rivet
    ctx.fillStyle = "#c8b060";
    ctx.beginPath();
    ctx.arc(0, size * 0.1, size * 0.007, 0, Math.PI * 2);
    ctx.fill();

    // Lower greave (shin plate)
    const lowerGrad = ctx.createLinearGradient(
      -size * 0.06,
      size * 0.12,
      size * 0.06,
      size * 0.12,
    );
    lowerGrad.addColorStop(0, "#484858");
    lowerGrad.addColorStop(0.5, "#7a7a8a");
    lowerGrad.addColorStop(1, "#444454");
    ctx.fillStyle = lowerGrad;
    ctx.fillRect(-size * 0.058, size * 0.12, size * 0.116, size * 0.1);

    // Shin ridge highlight
    ctx.strokeStyle = "rgba(180, 180, 200, 0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.13);
    ctx.lineTo(0, size * 0.21);
    ctx.stroke();

    // Gold trim band
    ctx.fillStyle = `rgba(203, 168, 108, ${0.7 + shimmer * 0.2})`;
    ctx.fillRect(-size * 0.062, size * 0.145, size * 0.124, size * 0.016);

    // Sabaton (segmented foot armor)
    const sabGrad = ctx.createLinearGradient(
      -size * 0.07,
      size * 0.2,
      size * 0.07,
      size * 0.2,
    );
    sabGrad.addColorStop(0, "#3a3a48");
    sabGrad.addColorStop(0.5, "#5a5a6a");
    sabGrad.addColorStop(1, "#363644");
    ctx.fillStyle = sabGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.065, size * 0.2);
    ctx.lineTo(size * 0.065, size * 0.2);
    ctx.lineTo(size * 0.075, size * 0.285);
    ctx.lineTo(-size * 0.075, size * 0.285);
    ctx.closePath();
    ctx.fill();
    // Sabaton plate segments
    ctx.strokeStyle = "rgba(100, 100, 120, 0.5)";
    ctx.lineWidth = 0.7 * zoom;
    for (let seg = 0; seg < 3; seg++) {
      const segY = size * (0.22 + seg * 0.02);
      ctx.beginPath();
      ctx.moveTo(-size * 0.065, segY);
      ctx.lineTo(size * 0.065, segY);
      ctx.stroke();
    }
    // Sabaton toe ridge
    ctx.strokeStyle = "rgba(160, 160, 180, 0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.21);
    ctx.lineTo(0, size * 0.28);
    ctx.stroke();
    ctx.restore();
  }

  // === CHAINMAIL FAULD (textured mail skirt) ===
  const fauld = ctx.createLinearGradient(
    x - size * 0.17,
    y + size * 0.22 + breathe,
    x + size * 0.17,
    y + size * 0.32 + breathe,
  );
  fauld.addColorStop(0, "#484860");
  fauld.addColorStop(0.3, "#6a6a7e");
  fauld.addColorStop(0.5, "#5a5a70");
  fauld.addColorStop(0.7, "#6a6a7e");
  fauld.addColorStop(1, "#484860");
  ctx.fillStyle = fauld;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.17,
    y + size * 0.22 + breathe,
    size * 0.34,
    size * 0.1,
    size * 0.02,
  );
  ctx.fill();
  // Chain mail ring pattern
  ctx.strokeStyle = "rgba(150, 150, 170, 0.3)";
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
  ctx.fillStyle = `rgba(180, 180, 200, ${0.08 + shimmer * 0.06})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.265 + breathe,
    size * 0.1,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === CUIRASS (articulated plate armor with muscle shaping) ===
  const cuirassGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.14,
    x + size * 0.22,
    y + size * 0.32,
  );
  cuirassGrad.addColorStop(0, "#3e3e50");
  cuirassGrad.addColorStop(0.15, "#5a5a6e");
  cuirassGrad.addColorStop(0.35, "#8a8a9e");
  cuirassGrad.addColorStop(0.5, "#a0a0b2");
  cuirassGrad.addColorStop(0.65, "#7a7a8e");
  cuirassGrad.addColorStop(0.85, "#5a5a6e");
  cuirassGrad.addColorStop(1, "#3a3a4a");
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.205, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.225, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + breathe * 0.35,
    x + size * 0.225,
    y - size * 0.1 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.205, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate muscle shaping lines
  ctx.strokeStyle = "rgba(180, 180, 200, 0.3)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.12 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x - size * 0.06,
    y - size * 0.02 + breathe * 0.6,
    x,
    y + size * 0.02 + breathe * 0.7,
  );
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y - size * 0.02 + breathe * 0.6,
    x + size * 0.12,
    y - size * 0.12 + breathe * 0.4,
  );
  ctx.stroke();

  // Center ridge line
  ctx.strokeStyle = "rgba(200, 200, 220, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.08 + breathe * 0.8);
  ctx.stroke();

  // Horizontal plate segment lines
  ctx.strokeStyle = "rgba(50, 50, 65, 0.45)";
  ctx.lineWidth = 1 * zoom;
  for (let seg = 0; seg < 3; seg++) {
    const segY = y + size * (0.06 + seg * 0.065) + breathe * (0.6 + seg * 0.1);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, segY);
    ctx.lineTo(x + size * 0.18, segY);
    ctx.stroke();
  }

  // Specular chest highlight
  const chestSpec = ctx.createRadialGradient(
    x - size * 0.04,
    y - size * 0.08 + breathe * 0.4,
    0,
    x - size * 0.04,
    y - size * 0.08 + breathe * 0.4,
    size * 0.12,
  );
  chestSpec.addColorStop(0, `rgba(220, 220, 240, ${0.2 + shimmer * 0.15})`);
  chestSpec.addColorStop(1, "rgba(220, 220, 240, 0)");
  ctx.fillStyle = chestSpec;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.04,
    y - size * 0.08 + breathe * 0.4,
    size * 0.1,
    size * 0.14,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Rivet line down each side
  ctx.fillStyle = "#b0a870";
  for (let side = -1; side <= 1; side += 2) {
    for (let rv = 0; rv < 4; rv++) {
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.17,
        y - size * 0.06 + rv * size * 0.09 + breathe * (0.4 + rv * 0.12),
        size * 0.008,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Tabard over armor (heraldic - richer gradient)
  const tabardGrad = ctx.createLinearGradient(
    x - size * 0.1,
    y - size * 0.02,
    x + size * 0.1,
    y + size * 0.27,
  );
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

  // Tabard gold embroidered cross with thicker lines
  ctx.strokeStyle = `rgba(240, 200, 120, ${0.75 + shimmer * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.01 + breathe * 0.55);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.lineTo(x + size * 0.055, y + size * 0.08 + breathe * 0.7);
  ctx.stroke();

  // Tabard border trim
  ctx.strokeStyle = `rgba(218, 185, 105, ${0.5 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.085, y + breathe * 0.5);
  ctx.lineTo(x - size * 0.065, y + size * 0.235 + breathe);
  ctx.lineTo(x, y + size * 0.29 + breathe);
  ctx.lineTo(x + size * 0.065, y + size * 0.235 + breathe);
  ctx.lineTo(x + size * 0.085, y + breathe * 0.5);
  ctx.stroke();

  // Belt and buckle
  ctx.fillStyle = "#1e1e2a";
  ctx.fillRect(
    x - size * 0.19,
    y + size * 0.252 + breathe,
    size * 0.38,
    size * 0.058,
  );
  // Belt red inlay
  ctx.fillStyle = `rgba(186, 61, 45, ${0.6 + steelPulse * 0.2})`;
  ctx.fillRect(
    x - size * 0.175,
    y + size * 0.262 + breathe,
    size * 0.35,
    size * 0.017,
  );
  // Belt studs
  ctx.fillStyle = "#a08a50";
  for (let stud = -2; stud <= 2; stud++) {
    ctx.beginPath();
    ctx.arc(
      x + stud * size * 0.07,
      y + size * 0.271 + breathe,
      size * 0.006,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  // Buckle (richer)
  const buckleGrad = ctx.createLinearGradient(
    x - size * 0.04,
    y + size * 0.255 + breathe,
    x + size * 0.04,
    y + size * 0.305 + breathe,
  );
  buckleGrad.addColorStop(0, "#d4b870");
  buckleGrad.addColorStop(0.5, "#f0d890");
  buckleGrad.addColorStop(1, "#b09840");
  ctx.fillStyle = buckleGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.048,
    y + size * 0.253 + breathe,
    size * 0.096,
    size * 0.054,
    size * 0.012,
  );
  ctx.fill();
  ctx.strokeStyle = "#8a7430";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  // Buckle gem
  ctx.fillStyle = `rgba(255, 100, 60, ${0.6 + shimmer * 0.35})`;
  ctx.shadowColor = "rgba(255, 100, 60, 0.4)";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.28 + breathe, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === PAULDRONS (layered steel plates with gold engravings) ===
  for (let side = -1; side <= 1; side += 2) {
    const px = x + side * size * 0.245;
    const py = y - size * 0.055 + breathe * 0.5;

    // Base plate
    const pauldronGrad = ctx.createRadialGradient(
      px - side * size * 0.02,
      py - size * 0.02,
      0,
      px,
      py,
      size * 0.14,
    );
    pauldronGrad.addColorStop(0, "#a0a0b0");
    pauldronGrad.addColorStop(0.4, "#7a7a8e");
    pauldronGrad.addColorStop(0.8, "#5a5a6e");
    pauldronGrad.addColorStop(1, "#3e3e50");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.12, size * 0.085, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Upper ridge plate
    ctx.fillStyle = "#8a8a9a";
    ctx.beginPath();
    ctx.ellipse(
      px,
      py - size * 0.025,
      size * 0.09,
      size * 0.045,
      side * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = `rgba(200, 200, 220, ${0.2 + shimmer * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      px - side * size * 0.02,
      py - size * 0.03,
      size * 0.04,
      size * 0.025,
      side * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gold trim border
    ctx.strokeStyle = `rgba(218, 190, 130, ${0.7 + shimmer * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.12, size * 0.085, side * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Rivets
    ctx.fillStyle = "#c8b060";
    const rivetAngles = [-0.8, 0, 0.8, Math.PI];
    for (const ra of rivetAngles) {
      const adjustedAngle = ra + side * 0.3;
      ctx.beginPath();
      ctx.arc(
        px + Math.cos(adjustedAngle) * size * 0.095,
        py + Math.sin(adjustedAngle) * size * 0.065,
        size * 0.007,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Engraved swirl
    ctx.strokeStyle = "rgba(200, 175, 110, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.04, -0.5 + side * 0.5, 1.5 + side * 0.5);
    ctx.stroke();
  }

  // === LEFT ARM + KITE SHIELD ===
  const armoredShieldX = x - size * 0.39;
  const armoredShieldY = y + size * 0.075 + breathe * 0.55;

  // Arm reaching from shoulder to shield grip
  const armoredLShoulderX = x - size * 0.26;
  const armoredLShoulderY = y + size * 0.02 + breathe * 0.45;
  const armToShieldAngle = Math.atan2(
    armoredShieldY - armoredLShoulderY,
    armoredShieldX - armoredLShoulderX,
  );

  ctx.save();
  ctx.translate(armoredLShoulderX, armoredLShoulderY);
  ctx.rotate(armToShieldAngle);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.18, size * 0.08);
  ctx.fillStyle = "#8a8a9a";
  ctx.fillRect(size * 0.1, -size * 0.045, size * 0.1, size * 0.09);
  ctx.fillStyle = "#b94935";
  ctx.fillRect(size * 0.11, -size * 0.01, size * 0.08, size * 0.02);
  // Gauntlet fist
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.arc(size * 0.2, 0, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(armoredShieldX, armoredShieldY);
  ctx.rotate(-0.36 + stance * 0.02);

  // === HEATER SHIELD (rounded top, tapering to bottom point) ===
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.15);
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.22, 0, -size * 0.23);
  ctx.quadraticCurveTo(size * 0.15, -size * 0.22, size * 0.15, -size * 0.15);
  ctx.lineTo(size * 0.1, size * 0.12);
  ctx.lineTo(0, size * 0.24);
  ctx.lineTo(-size * 0.1, size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Outer body (steel)
  const shieldGrad = ctx.createLinearGradient(
    -size * 0.15,
    -size * 0.1,
    size * 0.15,
    size * 0.1,
  );
  shieldGrad.addColorStop(0, "#282840");
  shieldGrad.addColorStop(0.25, "#40405e");
  shieldGrad.addColorStop(0.5, "#565676");
  shieldGrad.addColorStop(0.75, "#40405e");
  shieldGrad.addColorStop(1, "#282840");
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

  // Inner field (dark recessed area)
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

  // Diagonal heraldic division (per bend sinister — red upper-left, dark lower-right)
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
  // Red upper-left triangle
  const redFieldGrad = ctx.createLinearGradient(
    -size * 0.1,
    -size * 0.16,
    size * 0.04,
    size * 0.04,
  );
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

  // Diagonal division line (gold fimbriation)
  ctx.strokeStyle = `rgba(210, 180, 100, ${0.6 + shimmer * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.13);
  ctx.lineTo(-size * 0.06, size * 0.09);
  ctx.stroke();

  // Mace charge emblem (heraldic mace in center — matches weapon)
  ctx.save();
  ctx.translate(0, -size * 0.02);
  // Mace shaft
  ctx.strokeStyle = `rgba(200, 175, 110, ${0.7 + shimmer * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.08);
  ctx.lineTo(0, -size * 0.06);
  ctx.stroke();
  // Mace head (small circle with flanges)
  ctx.fillStyle = `rgba(220, 195, 130, ${0.65 + shimmer * 0.2})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.065, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  for (let fl = 0; fl < 6; fl++) {
    const fa = (fl / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(fa) * size * 0.015,
      -size * 0.065 + Math.sin(fa) * size * 0.015,
    );
    ctx.lineTo(
      Math.cos(fa) * size * 0.035,
      -size * 0.065 + Math.sin(fa) * size * 0.035,
    );
    ctx.stroke();
  }
  // Pommel dot
  ctx.fillStyle = `rgba(255, 120, 50, ${0.5 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Gold outer border
  ctx.strokeStyle = "#c8a850";
  ctx.lineWidth = 2.2 * zoom;
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

  // Corner rivets along border
  const shieldRivets = [
    [0, -size * 0.2],
    [-size * 0.12, -size * 0.1],
    [size * 0.12, -size * 0.1],
    [-size * 0.07, size * 0.07],
    [size * 0.07, size * 0.07],
    [0, size * 0.18],
  ];
  ctx.fillStyle = "#c8b060";
  for (const [rx, ry] of shieldRivets) {
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e0d098";
    ctx.beginPath();
    ctx.arc(rx - size * 0.002, ry - size * 0.002, size * 0.004, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8b060";
  }

  // Edge specular highlight (top-left)
  ctx.strokeStyle = "rgba(160, 180, 220, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.215);
  ctx.quadraticCurveTo(-size * 0.13, -size * 0.2, -size * 0.13, -size * 0.13);
  ctx.stroke();
  ctx.restore();

  // === RIGHT ARM AND FLANGED MACE ===
  ctx.save();
  const armBaseAngle = isAttacking
    ? -1.2 + attackPhase * 2.65
    : 0.19 + stance * 0.03;
  const armX = x + size * 0.31 + (isAttacking ? maceSwing * size * 0.08 : 0);
  const armY = y + size * 0.02 + breathe * 0.45;
  const armAngle = resolveWeaponRotation(
    targetPos,
    armX,
    armY,
    armBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.05 : 0.58,
    WEAPON_LIMITS.rightArm,
  );
  ctx.translate(armX, armY);
  ctx.rotate(armAngle);

  // Armored upper arm
  const armPlateGrad = ctx.createLinearGradient(
    -size * 0.056,
    0,
    size * 0.056,
    0,
  );
  armPlateGrad.addColorStop(0, "#42424e");
  armPlateGrad.addColorStop(0.4, "#7a7a8e");
  armPlateGrad.addColorStop(1, "#42424e");
  ctx.fillStyle = armPlateGrad;
  ctx.fillRect(-size * 0.056, 0, size * 0.112, size * 0.225);
  // Elbow cop
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.17, size * 0.065, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c8b060";
  ctx.beginPath();
  ctx.arc(0, size * 0.17, size * 0.007, 0, Math.PI * 2);
  ctx.fill();
  // Gauntlet
  ctx.fillStyle = "#6a6a7e";
  ctx.fillRect(-size * 0.06, size * 0.19, size * 0.12, size * 0.045);

  const maceWristAngle = isAttacking
    ? -0.12 + attackPhase * 0.3
    : -0.08 + stance * 0.01;
  ctx.translate(0, size * 0.21);
  ctx.rotate(maceWristAngle);

  // Mace shaft (richly grained wood)
  const shaftGrad = ctx.createLinearGradient(
    -size * 0.024,
    -size * 0.56,
    size * 0.024,
    size * 0.2,
  );
  shaftGrad.addColorStop(0, "#3a2810");
  shaftGrad.addColorStop(0.2, "#5a4020");
  shaftGrad.addColorStop(0.5, "#6d5030");
  shaftGrad.addColorStop(0.8, "#4a3518");
  shaftGrad.addColorStop(1, "#2a1a0c");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.024, -size * 0.56, size * 0.048, size * 0.76);
  // Wood grain highlight
  ctx.fillStyle = "rgba(140, 110, 60, 0.18)";
  ctx.fillRect(-size * 0.006, -size * 0.52, size * 0.012, size * 0.68);
  // Leather wrapping on grip
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 1.2 * zoom;
  for (let wrap = 0; wrap < 8; wrap++) {
    const wy = -size * 0.12 + wrap * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(-size * 0.024, wy);
    ctx.lineTo(size * 0.024, wy + size * 0.022);
    ctx.stroke();
  }

  // Upper collar band (gold)
  ctx.fillStyle = "#c8aa73";
  ctx.beginPath();
  ctx.roundRect(-size * 0.035, -size * 0.53, size * 0.07, size * 0.028, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#a08840";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Pommel (gem-set)
  const pomGrad = ctx.createRadialGradient(
    0,
    size * 0.2,
    0,
    0,
    size * 0.2,
    size * 0.028,
  );
  pomGrad.addColorStop(0, "#e0d0a0");
  pomGrad.addColorStop(0.6, "#c8a850");
  pomGrad.addColorStop(1, "#8a7030");
  ctx.fillStyle = pomGrad;
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 80, 40, ${0.55 + shimmer * 0.35})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Mace head (richly shaded sphere with flanges)
  const maceHeadY = -size * 0.64;
  const maceHeadGrad = ctx.createRadialGradient(
    -size * 0.02,
    maceHeadY - size * 0.02,
    size * 0.01,
    0,
    maceHeadY,
    size * 0.1,
  );
  maceHeadGrad.addColorStop(0, "#e8ecf4");
  maceHeadGrad.addColorStop(0.3, "#b0b0c0");
  maceHeadGrad.addColorStop(0.6, "#808092");
  maceHeadGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = maceHeadGrad;
  ctx.beginPath();
  ctx.arc(0, maceHeadY, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // Flanges (sharper, more defined)
  for (let flange = 0; flange < 8; flange++) {
    const a = (flange / 8) * Math.PI * 2;
    const innerR = size * 0.05;
    const outerR = size * 0.12;
    const flangeW = 0.22;
    const ix = Math.cos(a) * innerR;
    const iy = maceHeadY + Math.sin(a) * innerR;
    const ox = Math.cos(a) * outerR;
    const oy = maceHeadY + Math.sin(a) * outerR;
    const wax = Math.cos(a + flangeW) * (innerR + size * 0.025);
    const way = maceHeadY + Math.sin(a + flangeW) * (innerR + size * 0.025);
    const wbx = Math.cos(a - flangeW) * (innerR + size * 0.025);
    const wby = maceHeadY + Math.sin(a - flangeW) * (innerR + size * 0.025);

    const flangeGrad = ctx.createLinearGradient(ix, iy, ox, oy);
    flangeGrad.addColorStop(0, "#9a9aaa");
    flangeGrad.addColorStop(0.5, "#c0c0d0");
    flangeGrad.addColorStop(1, "#7a7a8a");
    ctx.fillStyle = flangeGrad;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(wax, way);
    ctx.lineTo(ox, oy);
    ctx.lineTo(wbx, wby);
    ctx.closePath();
    ctx.fill();
  }

  // Mace head central gem
  ctx.fillStyle = `rgba(255, 180, 80, ${0.4 + shimmer * 0.4})`;
  ctx.shadowColor = "rgba(255, 160, 60, 0.4)";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.arc(0, maceHeadY, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mace head border ring
  ctx.strokeStyle = `rgba(200, 170, 100, ${0.5 + shimmer * 0.2})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(0, maceHeadY, size * 0.065, 0, Math.PI * 2);
  ctx.stroke();

  // Attack swing arc trail
  if (isAttacking && Math.abs(maceSwing) > 0.32) {
    ctx.strokeStyle = `rgba(200, 200, 230, ${Math.abs(maceSwing) * 0.45})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      maceHeadY,
      size * 0.24,
      -Math.PI * 0.54,
      -Math.PI * 0.54 + maceSwing * 0.84,
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 220, 180, ${Math.abs(maceSwing) * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      maceHeadY,
      size * 0.18,
      -Math.PI * 0.52,
      -Math.PI * 0.52 + maceSwing * 0.78,
    );
    ctx.stroke();
  }
  ctx.restore();

  // === GREATHELM (ornate grey-steel) ===
  const helmBreath = breathe * 0.2;

  // Gorget (neck guard)
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.09,
    y - size * 0.15,
    x + size * 0.09,
    y - size * 0.15,
  );
  gorgetGrad.addColorStop(0, "#3e3e50");
  gorgetGrad.addColorStop(0.3, "#5a5a6e");
  gorgetGrad.addColorStop(0.5, "#7a7a8e");
  gorgetGrad.addColorStop(0.7, "#5a5a6e");
  gorgetGrad.addColorStop(1, "#3e3e50");
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.085 + breathe);
  ctx.lineTo(x - size * 0.115, y - size * 0.17 + breathe);
  ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.115, y - size * 0.17 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.085 + breathe);
  ctx.closePath();
  ctx.fill();
  // Gorget plate lines
  ctx.strokeStyle = "rgba(100, 100, 120, 0.4)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.085, y - size * 0.1 + breathe);
  ctx.lineTo(x + size * 0.085, y - size * 0.1 + breathe);
  ctx.moveTo(x - size * 0.09, y - size * 0.12 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.12 + breathe);
  ctx.stroke();
  ctx.strokeStyle = `rgba(213, 185, 126, ${0.6 + shimmer * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.085 + breathe);
  ctx.lineTo(x - size * 0.115, y - size * 0.17 + breathe);
  ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.115, y - size * 0.17 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.085 + breathe);
  ctx.stroke();

  // Helm dome (richly shaded)
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.16,
    y - size * 0.46 + helmBreath,
    x + size * 0.16,
    y - size * 0.18 + helmBreath,
  );
  helmGrad.addColorStop(0, "#42424e");
  helmGrad.addColorStop(0.2, "#6a6a7e");
  helmGrad.addColorStop(0.45, "#9a9aae");
  helmGrad.addColorStop(0.6, "#808092");
  helmGrad.addColorStop(0.8, "#5a5a6e");
  helmGrad.addColorStop(1, "#3a3a48");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.34 + helmBreath);
  ctx.quadraticCurveTo(
    x - size * 0.17,
    y - size * 0.47 + helmBreath * 0.5,
    x,
    y - size * 0.49 + helmBreath * 0.5,
  );
  ctx.quadraticCurveTo(
    x + size * 0.17,
    y - size * 0.47 + helmBreath * 0.5,
    x + size * 0.14,
    y - size * 0.34 + helmBreath,
  );
  ctx.lineTo(x + size * 0.13, y - size * 0.2 + helmBreath);
  ctx.lineTo(x - size * 0.13, y - size * 0.2 + helmBreath);
  ctx.closePath();
  ctx.fill();

  // Helm center ridge (raised crest line)
  ctx.strokeStyle = "rgba(180, 180, 200, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.48 + helmBreath * 0.5);
  ctx.lineTo(x, y - size * 0.22 + helmBreath);
  ctx.stroke();

  // Specular dome highlight
  ctx.fillStyle = `rgba(200, 200, 220, ${0.12 + shimmer * 0.1})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.04,
    y - size * 0.4 + helmBreath * 0.6,
    size * 0.05,
    size * 0.08,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Visor face plate (T-shaped opening)
  ctx.fillStyle = "#0e0e16";
  // Eye slit
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.105,
    y - size * 0.335 + helmBreath,
    size * 0.21,
    size * 0.04,
    size * 0.01,
  );
  ctx.fill();
  // Nose/mouth vertical slot
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.02,
    y - size * 0.335 + helmBreath,
    size * 0.04,
    size * 0.1,
    size * 0.006,
  );
  ctx.fill();

  // Eye glow through slit
  ctx.fillStyle = `rgba(220, 180, 100, ${0.45 + shimmer * 0.35})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.315 + helmBreath, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.315 + helmBreath, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Breathing holes on each side of mouth slot
  ctx.fillStyle = "#1a1a24";
  for (let side = -1; side <= 1; side += 2) {
    for (let hole = 0; hole < 3; hole++) {
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.05,
        y - size * (0.26 - hole * 0.02) + helmBreath,
        size * 0.005,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Visor border ridges
  ctx.strokeStyle = "#6a6a7e";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.34 + helmBreath);
  ctx.lineTo(x - size * 0.12, y - size * 0.22 + helmBreath);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.34 + helmBreath);
  ctx.lineTo(x + size * 0.12, y - size * 0.22 + helmBreath);
  ctx.stroke();

  // Cheek guards (angled plates)
  ctx.fillStyle = "#5a5a6e";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.33 + helmBreath);
  ctx.lineTo(x - size * 0.15, y - size * 0.26 + helmBreath);
  ctx.lineTo(x - size * 0.12, y - size * 0.2 + helmBreath);
  ctx.lineTo(x - size * 0.08, y - size * 0.2 + helmBreath);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.33 + helmBreath);
  ctx.lineTo(x + size * 0.15, y - size * 0.26 + helmBreath);
  ctx.lineTo(x + size * 0.12, y - size * 0.2 + helmBreath);
  ctx.lineTo(x + size * 0.08, y - size * 0.2 + helmBreath);
  ctx.closePath();
  ctx.fill();

  // Gold trim brow band
  ctx.strokeStyle = `rgba(218, 190, 130, ${0.7 + shimmer * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.35 + helmBreath);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.37 + helmBreath,
    x + size * 0.13,
    y - size * 0.35 + helmBreath,
  );
  ctx.stroke();

  // Helm rivets (brow line)
  ctx.fillStyle = "#d5b775";
  for (let rivet = 0; rivet < 5; rivet++) {
    const t = rivet / 4;
    const rx = x - size * 0.1 + t * size * 0.2;
    const ry = y - size * 0.355 + helmBreath + Math.sin(t * Math.PI) * size * -0.015;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }

  // === CREST PLUME (tall flowing horsehair brush) ===
  const crestBaseY = y - size * 0.48 + helmBreath * 0.5;
  const crestPeakH = size * 0.28;
  const crestSpread = size * 0.16;
  const plumeWave = capeWave;

  // Rear shadow layer
  ctx.fillStyle = "rgba(120, 30, 5, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, crestBaseY);
  ctx.quadraticCurveTo(
    x - crestSpread * 0.3 + plumeWave * 1.2,
    crestBaseY - crestPeakH * 0.95,
    x + crestSpread * 0.6 + plumeWave * 2.5,
    crestBaseY - crestPeakH * 0.15,
  );
  ctx.quadraticCurveTo(
    x + crestSpread * 0.15,
    crestBaseY - crestPeakH * 0.35,
    x + size * 0.02,
    crestBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Base crest (deep red/orange)
  const crestBase = ctx.createLinearGradient(
    x,
    crestBaseY - crestPeakH,
    x + crestSpread,
    crestBaseY,
  );
  crestBase.addColorStop(0, "#ff6a10");
  crestBase.addColorStop(0.35, "#e84a0a");
  crestBase.addColorStop(0.7, "#c13208");
  crestBase.addColorStop(1, "#8a2006");
  ctx.fillStyle = crestBase;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, crestBaseY);
  ctx.quadraticCurveTo(
    x - crestSpread * 0.2 + plumeWave * 1.0,
    crestBaseY - crestPeakH * 0.9,
    x + crestSpread * 0.5 + plumeWave * 2.0,
    crestBaseY - crestPeakH * 0.1,
  );
  ctx.quadraticCurveTo(
    x + crestSpread * 0.1,
    crestBaseY - crestPeakH * 0.3,
    x + size * 0.015,
    crestBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Highlight layer (bright fiery)
  ctx.fillStyle = `rgba(255, 140, 40, ${0.4 + shimmer * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(x, crestBaseY - size * 0.02);
  ctx.quadraticCurveTo(
    x - crestSpread * 0.1 + plumeWave * 0.8,
    crestBaseY - crestPeakH * 0.85,
    x + crestSpread * 0.35 + plumeWave * 1.5,
    crestBaseY - crestPeakH * 0.15,
  );
  ctx.quadraticCurveTo(
    x + crestSpread * 0.05,
    crestBaseY - crestPeakH * 0.25,
    x,
    crestBaseY - size * 0.02,
  );
  ctx.closePath();
  ctx.fill();

  // Individual hair strands for texture
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.25 + shimmer * 0.15})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let strand = 0; strand < 5; strand++) {
    const t = strand / 4;
    const sx = x + (t - 0.2) * crestSpread * 0.4 + plumeWave * (0.5 + t);
    ctx.beginPath();
    ctx.moveTo(x, crestBaseY);
    ctx.quadraticCurveTo(
      sx,
      crestBaseY - crestPeakH * (0.6 + t * 0.3),
      sx + crestSpread * 0.2,
      crestBaseY - crestPeakH * 0.1 * (1 - t),
    );
    ctx.stroke();
  }

  // Gold crest clamp at helm base
  ctx.fillStyle = "#c8a850";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.025,
    crestBaseY - size * 0.01,
    size * 0.05,
    size * 0.02,
    size * 0.005,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 40, ${0.5 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, crestBaseY, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  drawTroopMasterworkFinish(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    TROOP_MASTERWORK_STYLES.armored,
    { vanguard: true },
  );
  ctx.restore();
}
