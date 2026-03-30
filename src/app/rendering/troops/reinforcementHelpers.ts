import type { ReinforcementHelmetStyle, ReinforcementArmorStyle } from "./reinforcementThemes";

// Shared palette type used by all reinforcement drawing helpers.
export interface ReinforcementPalette {
  armorDark: string;
  armorMid: string;
  armorLight: string;
  trim: string;
  cape: string;
  capeShadow: string;
  glow: string;   // "rgba(r, g, b, " — caller appends alpha + ")"
  eye: string;
  eyeShadow: string;
}

// ────────────────────────────────────────────────────────────────
//  Helmet drawing
// ────────────────────────────────────────────────────────────────

export function drawReinforcementHelmet(
  ctx: CanvasRenderingContext2D,
  x: number,
  helmY: number,
  size: number,
  zoom: number,
  time: number,
  breathe: number,
  attackDrive: number,
  palette: ReinforcementPalette,
  helmet: ReinforcementHelmetStyle,
  tier: number,
) {
  const headYOffset = size * 0.04;
  const hY = helmY + headYOffset;
  const bY = breathe * 0.2;

  // Hornlet fins drawn first so they sit behind the dome
  if (helmet.hornlets) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = palette.trim;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.12, hY - size * 0.1 + bY);
      ctx.quadraticCurveTo(
        x + side * size * 0.17, hY - size * 0.14 + bY,
        x + side * size * 0.15, hY - size * 0.06 + bY,
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  // Dome
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05, hY - size * 0.04, 0,
    x, hY, size * 0.2,
  );
  helmGrad.addColorStop(0, palette.armorLight);
  helmGrad.addColorStop(0.4, palette.armorMid);
  helmGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, hY + breathe * 0.25,
    size * helmet.domeRadiusX,
    size * helmet.domeRadiusY,
    0, 0, Math.PI * 2,
  );
  ctx.fill();

  // Rear sweep (sallet / barbute)
  if (helmet.rearSweep > 0) {
    ctx.fillStyle = palette.armorMid;
    ctx.beginPath();
    ctx.moveTo(x + size * helmet.domeRadiusX * 0.7, hY + bY);
    ctx.quadraticCurveTo(
      x + size * (helmet.domeRadiusX + helmet.rearSweep * 0.5),
      hY + size * 0.06 + bY,
      x + size * (helmet.domeRadiusX * 0.4 + helmet.rearSweep),
      hY + size * 0.14 + bY,
    );
    ctx.lineTo(x + size * helmet.domeRadiusX * 0.3, hY + size * 0.12 + bY);
    ctx.closePath();
    ctx.fill();
  }

  // Brow ridge
  if (helmet.browRidge) {
    ctx.strokeStyle = palette.armorLight;
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.arc(x, hY + bY, size * helmet.domeRadiusX * 0.95, 2.6, 0.54);
    ctx.stroke();
  }

  // Center ridge line
  ctx.strokeStyle = palette.armorLight;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, hY - size * helmet.domeRadiusY * 0.92 + bY);
  ctx.quadraticCurveTo(
    x + size * 0.006,
    hY + bY,
    x, hY + size * 0.1 + bY,
  );
  ctx.stroke();

  // Cheek plates
  if (helmet.cheekPlates) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = palette.armorMid;
      ctx.beginPath();
      ctx.moveTo(x + side * size * helmet.domeRadiusX * 0.85, hY - size * 0.02 + bY);
      ctx.lineTo(x + side * size * (helmet.domeRadiusX * 0.9), hY + size * 0.1 + bY);
      ctx.lineTo(x + side * size * helmet.domeRadiusX * 0.5, hY + size * 0.14 + bY);
      ctx.lineTo(x + side * size * helmet.domeRadiusX * 0.55, hY + size * 0.02 + bY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = palette.armorDark;
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }
  }

  // Nose guard (bascinet)
  if (helmet.noseGuard) {
    ctx.fillStyle = palette.armorMid;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.02, hY - size * 0.02 + bY);
    ctx.lineTo(x, hY + size * 0.12 + bY);
    ctx.lineTo(x + size * 0.02, hY - size * 0.02 + bY);
    ctx.closePath();
    ctx.fill();
  }

  // Face plate / visor shape
  drawVisor(ctx, x, hY, size, zoom, breathe, palette, helmet);

  // Eyes behind visor
  const eyeGlow = 0.58 + Math.sin(time * 3.8) * 0.2 + attackDrive * 0.35;
  ctx.fillStyle = `${palette.eye}${eyeGlow})`;
  ctx.shadowColor = palette.eyeShadow;
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.052, hY - size * 0.01 + breathe * 0.2, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.052, hY - size * 0.01 + breathe * 0.2, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tier-based crest on top
  if (helmet.hasCrest && tier >= 1) {
    drawHelmetCrest(ctx, x, hY, size, zoom, time, breathe, palette, helmet, tier, attackDrive);
  }
}

function drawVisor(
  ctx: CanvasRenderingContext2D,
  x: number,
  hY: number,
  size: number,
  zoom: number,
  breathe: number,
  palette: ReinforcementPalette,
  helmet: ReinforcementHelmetStyle,
) {
  const bY = breathe * 0.2;

  // Face plate background
  const fpGrad = ctx.createLinearGradient(
    x - size * 0.16, hY, x + size * 0.16, hY,
  );
  fpGrad.addColorStop(0, palette.armorDark);
  fpGrad.addColorStop(0.4, palette.armorMid);
  fpGrad.addColorStop(0.55, palette.armorLight);
  fpGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = fpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, hY - size * 0.04 + bY);
  ctx.lineTo(x - size * 0.155, hY + size * 0.06 + bY);
  ctx.lineTo(x - size * 0.05, hY + size * 0.13 + bY);
  ctx.lineTo(x, hY + size * 0.15 + bY);
  ctx.lineTo(x + size * 0.05, hY + size * 0.13 + bY);
  ctx.lineTo(x + size * 0.155, hY + size * 0.06 + bY);
  ctx.lineTo(x + size * 0.14, hY - size * 0.04 + bY);
  ctx.closePath();
  ctx.fill();

  // Visor opening
  ctx.fillStyle = "#06060d";
  switch (helmet.visorType) {
    case "slit":
      ctx.beginPath();
      ctx.moveTo(x - size * 0.12, hY - size * 0.015 + bY);
      ctx.lineTo(x - size * 0.04, hY + size * 0.015 + bY);
      ctx.lineTo(x, hY + size * 0.005 + bY);
      ctx.lineTo(x + size * 0.04, hY + size * 0.015 + bY);
      ctx.lineTo(x + size * 0.12, hY - size * 0.015 + bY);
      ctx.lineTo(x + size * 0.1, hY - size * 0.03 + bY);
      ctx.lineTo(x, hY - size * 0.005 + bY);
      ctx.lineTo(x - size * 0.1, hY - size * 0.03 + bY);
      ctx.closePath();
      ctx.fill();
      break;
    case "tshaped":
      ctx.beginPath();
      ctx.moveTo(x - size * 0.09, hY - size * 0.025 + bY);
      ctx.lineTo(x - size * 0.09, hY + size * 0.01 + bY);
      ctx.lineTo(x - size * 0.025, hY + size * 0.01 + bY);
      ctx.lineTo(x - size * 0.025, hY + size * 0.09 + bY);
      ctx.lineTo(x + size * 0.025, hY + size * 0.09 + bY);
      ctx.lineTo(x + size * 0.025, hY + size * 0.01 + bY);
      ctx.lineTo(x + size * 0.09, hY + size * 0.01 + bY);
      ctx.lineTo(x + size * 0.09, hY - size * 0.025 + bY);
      ctx.closePath();
      ctx.fill();
      break;
    case "pointed":
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1, hY - size * 0.02 + bY);
      ctx.lineTo(x - size * 0.1, hY + size * 0.02 + bY);
      ctx.lineTo(x - size * 0.03, hY + size * 0.04 + bY);
      ctx.lineTo(x, hY + size * 0.1 + bY);
      ctx.lineTo(x + size * 0.03, hY + size * 0.04 + bY);
      ctx.lineTo(x + size * 0.1, hY + size * 0.02 + bY);
      ctx.lineTo(x + size * 0.1, hY - size * 0.02 + bY);
      ctx.closePath();
      ctx.fill();
      break;
    case "rounded":
      ctx.beginPath();
      ctx.ellipse(x, hY + size * 0.01 + bY, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  // Breathing holes
  ctx.fillStyle = "#08080f";
  for (let bSide = -1; bSide <= 1; bSide += 2) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        x + bSide * (size * 0.025 + i * size * 0.022),
        hY + size * 0.055 + i * size * 0.016 + bY,
        size * 0.007,
        0, Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Face plate edge highlight
  ctx.strokeStyle = `${palette.glow}0.12)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, hY - size * 0.04 + bY);
  ctx.lineTo(x - size * 0.155, hY + size * 0.06 + bY);
  ctx.lineTo(x, hY + size * 0.15 + bY);
  ctx.lineTo(x + size * 0.155, hY + size * 0.06 + bY);
  ctx.lineTo(x + size * 0.14, hY - size * 0.04 + bY);
  ctx.stroke();
}

function drawHelmetCrest(
  ctx: CanvasRenderingContext2D,
  x: number,
  hY: number,
  size: number,
  zoom: number,
  time: number,
  breathe: number,
  palette: ReinforcementPalette,
  helmet: ReinforcementHelmetStyle,
  tier: number,
  attackDrive: number,
) {
  const bY = breathe * 0.2;
  const crestBaseY = hY - size * helmet.domeRadiusY * 0.85 + bY;
  const crestWind = Math.sin(time * 4.5) * 1.5 + attackDrive * 2.0;

  if (tier < 3) {
    // Short pointed fin crest
    const crestH = size * (helmet.crestHeight + tier * 0.015);
    const crestW = size * 0.03;
    const crestGrad = ctx.createLinearGradient(x, crestBaseY, x, crestBaseY - crestH);
    crestGrad.addColorStop(0, palette.armorMid);
    crestGrad.addColorStop(0.5, palette.trim);
    crestGrad.addColorStop(1, palette.armorLight);
    ctx.fillStyle = crestGrad;
    ctx.beginPath();
    ctx.moveTo(x, crestBaseY - crestH + crestWind * 0.2);
    ctx.quadraticCurveTo(x - crestW * 1.1, crestBaseY - crestH * 0.4, x - crestW, crestBaseY);
    ctx.lineTo(x + crestW, crestBaseY);
    ctx.quadraticCurveTo(x + crestW * 1.1, crestBaseY - crestH * 0.4, x, crestBaseY - crestH + crestWind * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  } else {
    // Flowing plume (tier 3+)
    const plumePeakH = size * (0.18 + (tier - 3) * 0.05);
    const plumeWidth = size * (0.11 + (tier - 3) * 0.02);
    const crestWhip = Math.sin(time * 5.6 + 0.5) * 0.9;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.moveTo(x - plumeWidth * 0.85, crestBaseY);
    ctx.quadraticCurveTo(
      x - plumeWidth * 0.3 + crestWind * 0.2,
      crestBaseY - plumePeakH * 0.88,
      x + crestWind * 0.35,
      crestBaseY - plumePeakH,
    );
    ctx.quadraticCurveTo(
      x + plumeWidth * 0.5 + crestWind * 0.6,
      crestBaseY - plumePeakH * 0.65,
      x + plumeWidth * 1.0 + crestWind * 0.8,
      crestBaseY,
    );
    ctx.closePath();
    ctx.fill();

    // Base layer
    const plumeBaseGrad = ctx.createLinearGradient(x, crestBaseY, x, crestBaseY - plumePeakH);
    plumeBaseGrad.addColorStop(0, palette.armorDark);
    plumeBaseGrad.addColorStop(0.3, palette.armorMid);
    plumeBaseGrad.addColorStop(0.6, palette.armorLight);
    plumeBaseGrad.addColorStop(1, palette.armorMid);
    ctx.fillStyle = plumeBaseGrad;
    ctx.beginPath();
    ctx.moveTo(x - plumeWidth * 0.85, crestBaseY);
    ctx.quadraticCurveTo(
      x - plumeWidth * 0.3 + crestWind * 0.22,
      crestBaseY - plumePeakH * 0.92,
      x + crestWind * 0.38 + crestWhip * 0.2,
      crestBaseY - plumePeakH,
    );
    ctx.quadraticCurveTo(
      x + plumeWidth * 0.45 + crestWind * 0.62,
      crestBaseY - plumePeakH * 0.68,
      x + plumeWidth * 0.95 + crestWind * 0.8,
      crestBaseY,
    );
    ctx.closePath();
    ctx.fill();

    // Main body with trim color
    const plumeMainGrad = ctx.createLinearGradient(x, crestBaseY, x + crestWind * 0.2, crestBaseY - plumePeakH);
    plumeMainGrad.addColorStop(0, palette.armorMid);
    plumeMainGrad.addColorStop(0.2, palette.armorLight);
    plumeMainGrad.addColorStop(0.45, palette.trim);
    plumeMainGrad.addColorStop(0.7, palette.armorLight);
    plumeMainGrad.addColorStop(1, palette.armorMid);
    ctx.fillStyle = plumeMainGrad;
    ctx.beginPath();
    ctx.moveTo(x - plumeWidth * 0.7, crestBaseY);
    ctx.quadraticCurveTo(
      x - plumeWidth * 0.2 + crestWind * 0.26,
      crestBaseY - plumePeakH * 0.94,
      x + crestWind * 0.42 + crestWhip * 0.15,
      crestBaseY - plumePeakH * 0.97,
    );
    ctx.quadraticCurveTo(
      x + plumeWidth * 0.35 + crestWind * 0.58,
      crestBaseY - plumePeakH * 0.64,
      x + plumeWidth * 0.8 + crestWind * 0.74,
      crestBaseY,
    );
    ctx.closePath();
    ctx.fill();

    // Inner highlight shimmer
    const plumeHiGrad = ctx.createLinearGradient(x, crestBaseY - plumePeakH * 0.2, x, crestBaseY - plumePeakH * 0.9);
    plumeHiGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    plumeHiGrad.addColorStop(0.35, "rgba(255, 250, 220, 0.3)");
    plumeHiGrad.addColorStop(0.65, "rgba(255, 250, 220, 0.25)");
    plumeHiGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = plumeHiGrad;
    ctx.beginPath();
    ctx.moveTo(x - plumeWidth * 0.35, crestBaseY - plumePeakH * 0.1);
    ctx.quadraticCurveTo(
      x - plumeWidth * 0.1 + crestWind * 0.3,
      crestBaseY - plumePeakH * 0.9,
      x + crestWind * 0.4 + crestWhip * 0.1,
      crestBaseY - plumePeakH * 0.86,
    );
    ctx.quadraticCurveTo(
      x + plumeWidth * 0.2 + crestWind * 0.45,
      crestBaseY - plumePeakH * 0.55,
      x + plumeWidth * 0.4 + crestWind * 0.5,
      crestBaseY - plumePeakH * 0.06,
    );
    ctx.closePath();
    ctx.fill();

    // Hair strands
    const strandCount = 4 + tier;
    for (let strand = 0; strand < strandCount; strand++) {
      const strandT = strand / (strandCount - 1);
      const strandPhase = time * (3.8 + strand * 0.5) + strand * 1.1;
      const strandBend = Math.sin(strandPhase) * (1.0 + strandT * 2.0);
      const strandAlpha = 0.15 + Math.sin(time * 2.5 + strand * 0.8) * 0.08;
      const startX = x - plumeWidth * 0.6 + strandT * plumeWidth * 1.2;
      const peakScale = 0.6 + Math.sin(strandT * Math.PI) * 0.4;

      ctx.strokeStyle = `rgba(255, 250, 230, ${strandAlpha})`;
      ctx.lineWidth = (0.6 + strandT * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(startX, crestBaseY);
      ctx.quadraticCurveTo(
        startX + crestWind * (0.2 + strandT * 0.5) + strandBend,
        crestBaseY - plumePeakH * peakScale,
        startX + plumeWidth * (0.06 + strandT * 0.2) + crestWind * (0.5 + strandT * 0.4) + strandBend * 1.3,
        crestBaseY - plumePeakH * peakScale * 0.15,
      );
      ctx.stroke();
    }

    // Gold crest clamp
    const clampGrad = ctx.createLinearGradient(x - plumeWidth * 0.7, crestBaseY, x + plumeWidth * 0.7, crestBaseY);
    clampGrad.addColorStop(0, "#5a4518");
    clampGrad.addColorStop(0.3, "#a08028");
    clampGrad.addColorStop(0.5, "#c4a440");
    clampGrad.addColorStop(0.7, "#a08028");
    clampGrad.addColorStop(1, "#5a4518");
    ctx.fillStyle = clampGrad;
    ctx.beginPath();
    ctx.roundRect(x - plumeWidth * 0.7, crestBaseY - size * 0.006, plumeWidth * 1.4, size * 0.022, size * 0.005);
    ctx.fill();
  }
}

// ────────────────────────────────────────────────────────────────
//  Chest motif drawing
// ────────────────────────────────────────────────────────────────

export function drawChestMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  time: number,
  breathe: number,
  palette: ReinforcementPalette,
  motif: ReinforcementArmorStyle["chestMotif"],
  tier: number,
  attackDrive: number,
) {
  const bY = breathe;

  switch (motif) {
    case "diamond": {
      ctx.fillStyle = palette.trim;
      ctx.globalAlpha = 0.55 + Math.sin(time * 3) * 0.15;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.06 + bY);
      ctx.lineTo(x - size * 0.06, y + size * 0.03 + bY);
      ctx.lineTo(x, y + size * 0.12 + bY);
      ctx.lineTo(x + size * 0.06, y + size * 0.03 + bY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      // Inner gem
      ctx.fillStyle = `${palette.glow}${0.5 + attackDrive * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y + size * 0.03 + bY, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cross": {
      ctx.strokeStyle = palette.trim;
      ctx.lineWidth = (2 + tier * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.08 + bY);
      ctx.lineTo(x, y + size * 0.14 + bY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - size * 0.08, y + size * 0.02 + bY);
      ctx.lineTo(x + size * 0.08, y + size * 0.02 + bY);
      ctx.stroke();
      // Cross junction rivet
      ctx.fillStyle = palette.armorLight;
      ctx.beginPath();
      ctx.arc(x, y + size * 0.02 + bY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "scales": {
      ctx.globalAlpha = 0.35 + tier * 0.05;
      ctx.fillStyle = palette.armorLight;
      for (let row = 0; row < 4; row++) {
        for (let col = -2; col <= 2; col++) {
          const scaleX = x + col * size * 0.04 + (row % 2) * size * 0.02;
          const scaleY = y - size * 0.02 + row * size * 0.035 + bY;
          ctx.beginPath();
          ctx.ellipse(scaleX, scaleY, size * 0.022, size * 0.018, 0, 0, Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "fluted": {
      ctx.strokeStyle = palette.armorLight;
      ctx.lineWidth = 1.2 * zoom;
      for (let i = -2; i <= 2; i++) {
        const flX = x + i * size * 0.035;
        ctx.beginPath();
        ctx.moveTo(flX, y - size * 0.08 + bY);
        ctx.quadraticCurveTo(
          flX + size * 0.005,
          y + size * 0.03 + bY,
          flX,
          y + size * 0.14 + bY,
        );
        ctx.stroke();
      }
      // Shadow between flutes
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 0.6 * zoom;
      for (let i = -2; i < 2; i++) {
        const flX = x + i * size * 0.035 + size * 0.0175;
        ctx.beginPath();
        ctx.moveTo(flX, y - size * 0.06 + bY);
        ctx.lineTo(flX, y + size * 0.12 + bY);
        ctx.stroke();
      }
      break;
    }
    case "runic": {
      const runeGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackDrive * 0.35;
      ctx.strokeStyle = `${palette.glow}${runeGlow})`;
      ctx.lineWidth = 1.4 * zoom;
      // Rune circle
      ctx.beginPath();
      ctx.arc(x, y + size * 0.03 + bY, size * 0.055, 0, Math.PI * 2);
      ctx.stroke();
      // Inner rune marks
      for (let r = 0; r < 3; r++) {
        const angle = (r / 3) * Math.PI * 2 - Math.PI / 2;
        const rX = x + Math.cos(angle) * size * 0.04;
        const rY = y + size * 0.03 + bY + Math.sin(angle) * size * 0.04;
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.03 + bY);
        ctx.lineTo(rX, rY);
        ctx.stroke();
      }
      // Center pulse
      ctx.fillStyle = `${palette.glow}${runeGlow * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y + size * 0.03 + bY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

// ────────────────────────────────────────────────────────────────
//  Pauldron drawing
// ────────────────────────────────────────────────────────────────

export function drawPauldrons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  breathe: number,
  palette: ReinforcementPalette,
  shape: ReinforcementArmorStyle["pauldronShape"],
  tier: number,
) {
  if (tier < 2) return;

  for (let side = -1; side <= 1; side += 2) {
    const pX = x + side * size * 0.27;
    const pY = y - size * 0.1 + breathe * 0.4;

    switch (shape) {
      case "round": {
        const pauldGrad = ctx.createRadialGradient(
          pX - side * size * 0.02, pY - size * 0.02, size * 0.01,
          pX, pY, size * 0.12,
        );
        pauldGrad.addColorStop(0, palette.armorLight);
        pauldGrad.addColorStop(0.5, palette.armorMid);
        pauldGrad.addColorStop(1, palette.armorDark);
        ctx.fillStyle = pauldGrad;
        ctx.beginPath();
        ctx.ellipse(pX, pY, size * 0.12, size * 0.09, side * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Trim ring
        ctx.strokeStyle = palette.trim;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.ellipse(pX, pY + size * 0.025, size * 0.1, size * 0.035, side * 0.25, 0, Math.PI);
        ctx.stroke();
        break;
      }
      case "ridged": {
        ctx.fillStyle = palette.armorMid;
        ctx.beginPath();
        ctx.ellipse(pX, pY, size * 0.12, size * 0.09, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Horizontal ridges
        for (let r = 0; r < 3; r++) {
          const rY = pY - size * 0.03 + r * size * 0.025;
          ctx.strokeStyle = r % 2 === 0 ? palette.armorLight : palette.armorDark;
          ctx.lineWidth = 1.2 * zoom;
          ctx.beginPath();
          ctx.ellipse(pX, rY, size * (0.1 - r * 0.01), size * 0.015, side * 0.3, 0, Math.PI);
          ctx.stroke();
        }
        break;
      }
      case "spiked": {
        ctx.fillStyle = palette.armorMid;
        ctx.beginPath();
        ctx.ellipse(pX, pY, size * 0.11, size * 0.085, side * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Spike
        ctx.fillStyle = palette.armorLight;
        ctx.beginPath();
        ctx.moveTo(pX + side * size * 0.08, pY - size * 0.06);
        ctx.lineTo(pX + side * size * 0.18, pY - size * 0.01);
        ctx.lineTo(pX + side * size * 0.1, pY + size * 0.02);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = palette.trim;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(pX + side * size * 0.09, pY - size * 0.04);
        ctx.lineTo(pX + side * size * 0.17, pY - size * 0.005);
        ctx.stroke();
        break;
      }
      case "layered": {
        for (let layer = 2; layer >= 0; layer--) {
          const lScale = 1 - layer * 0.15;
          const lY = pY + layer * size * 0.018;
          const colors = [palette.armorDark, palette.armorMid, palette.armorLight];
          ctx.fillStyle = colors[layer];
          ctx.beginPath();
          ctx.ellipse(pX, lY, size * 0.11 * lScale, size * 0.07 * lScale, side * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "winged": {
        ctx.fillStyle = palette.armorMid;
        ctx.beginPath();
        ctx.ellipse(pX, pY, size * 0.1, size * 0.08, side * 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Wing extension
        ctx.fillStyle = palette.trim;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(pX + side * size * 0.06, pY - size * 0.06);
        ctx.quadraticCurveTo(
          pX + side * size * 0.2,
          pY - size * 0.12,
          pX + side * size * 0.22,
          pY - size * 0.04,
        );
        ctx.quadraticCurveTo(
          pX + side * size * 0.15,
          pY - size * 0.02,
          pX + side * size * 0.08,
          pY + size * 0.01,
        );
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
    }

    // Rivets on all pauldron types
    ctx.fillStyle = palette.armorLight;
    for (let r = 0; r < 2; r++) {
      const rivetAngle = (r / 1 - 0.5) * 1.2 + side * 0.25;
      const rivetX = pX + Math.cos(rivetAngle) * size * 0.08;
      const rivetY = pY + Math.sin(rivetAngle) * size * 0.06;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ────────────────────────────────────────────────────────────────
//  Belt drawing
// ────────────────────────────────────────────────────────────────

export function drawBelt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  breathe: number,
  palette: ReinforcementPalette,
  beltDetail: ReinforcementArmorStyle["beltDetail"],
) {
  const beltY = y + size * 0.28 + breathe;

  ctx.fillStyle = "#2a2335";
  ctx.fillRect(x - size * 0.2, beltY, size * 0.4, size * 0.065);

  switch (beltDetail) {
    case "buckle": {
      ctx.fillStyle = palette.trim;
      ctx.beginPath();
      ctx.roundRect(x - size * 0.03, beltY + size * 0.01, size * 0.06, size * 0.045, size * 0.008);
      ctx.fill();
      ctx.fillStyle = palette.armorDark;
      ctx.beginPath();
      ctx.roundRect(x - size * 0.015, beltY + size * 0.02, size * 0.03, size * 0.025, size * 0.004);
      ctx.fill();
      break;
    }
    case "sash": {
      ctx.fillStyle = palette.cape;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.04, beltY);
      ctx.quadraticCurveTo(x - size * 0.08, beltY + size * 0.12, x - size * 0.06, beltY + size * 0.18);
      ctx.lineTo(x + size * 0.02, beltY + size * 0.16);
      ctx.quadraticCurveTo(x, beltY + size * 0.08, x + size * 0.04, beltY);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "chain": {
      ctx.strokeStyle = palette.armorLight;
      ctx.lineWidth = 1.2 * zoom;
      for (let i = 0; i < 6; i++) {
        const cX = x - size * 0.15 + i * size * 0.06;
        ctx.beginPath();
        ctx.ellipse(cX, beltY + size * 0.032, size * 0.018, size * 0.012, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "medallion": {
      ctx.fillStyle = palette.trim;
      ctx.beginPath();
      ctx.arc(x, beltY + size * 0.032, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `${palette.glow}0.5)`;
      ctx.beginPath();
      ctx.arc(x, beltY + size * 0.032, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

// ────────────────────────────────────────────────────────────────
//  Greave drawing
// ────────────────────────────────────────────────────────────────

export function drawGreaves(
  ctx: CanvasRenderingContext2D,
  legX: number,
  legY: number,
  size: number,
  zoom: number,
  palette: ReinforcementPalette,
  greaveStyle: ReinforcementArmorStyle["greaveStyle"],
) {
  const lw = size * 0.14;
  const hlw = lw * 0.5;

  // --- Thigh plate (cuisse) ---
  const thighH = size * 0.10;
  const thighGrad = ctx.createLinearGradient(legX - hlw, legY, legX + hlw, legY);
  thighGrad.addColorStop(0, palette.armorDark);
  thighGrad.addColorStop(0.2, palette.armorMid);
  thighGrad.addColorStop(0.5, palette.armorLight);
  thighGrad.addColorStop(0.8, palette.armorMid);
  thighGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = thighGrad;
  ctx.beginPath();
  ctx.roundRect(legX - hlw, legY, lw, thighH, size * 0.012);
  ctx.fill();

  // Thigh edge highlight
  ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(legX - hlw, legY + size * 0.01);
  ctx.lineTo(legX - hlw, legY + thighH - size * 0.01);
  ctx.stroke();

  // Thigh articulation band
  ctx.strokeStyle = palette.armorDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(legX - hlw + size * 0.01, legY + thighH * 0.55);
  ctx.lineTo(legX + hlw - size * 0.01, legY + thighH * 0.55);
  ctx.stroke();

  // --- Knee cop (poleyn) ---
  const kneeY = legY + thighH + size * 0.005;
  const kneeCopGrad = ctx.createRadialGradient(
    legX, kneeY, 0, legX, kneeY, size * 0.055,
  );
  kneeCopGrad.addColorStop(0, palette.armorLight);
  kneeCopGrad.addColorStop(0.5, palette.armorMid);
  kneeCopGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = kneeCopGrad;
  ctx.beginPath();
  ctx.ellipse(legX, kneeY, size * 0.065, size * 0.042, 0, 0, Math.PI * 2);
  ctx.fill();

  // Knee raised center
  ctx.fillStyle = palette.armorLight;
  ctx.beginPath();
  ctx.ellipse(legX, kneeY, size * 0.035, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center rivet
  ctx.fillStyle = palette.trim;
  ctx.beginPath();
  ctx.arc(legX, kneeY, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // --- Greave (shin guard) — style-dependent ---
  const greaveTop = kneeY + size * 0.035;
  const greaveH = size * 0.12;

  const greaveGrad = ctx.createLinearGradient(legX - hlw, greaveTop, legX + hlw, greaveTop);
  greaveGrad.addColorStop(0, palette.armorDark);
  greaveGrad.addColorStop(0.15, palette.armorMid);
  greaveGrad.addColorStop(0.5, palette.armorLight);
  greaveGrad.addColorStop(0.85, palette.armorMid);
  greaveGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = greaveGrad;
  ctx.beginPath();
  ctx.roundRect(legX - hlw, greaveTop, lw, greaveH, [0, 0, size * 0.015, size * 0.015]);
  ctx.fill();

  // Greave center ridge
  ctx.strokeStyle = `rgba(255, 255, 255, 0.18)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(legX, greaveTop + size * 0.01);
  ctx.lineTo(legX, greaveTop + greaveH - size * 0.01);
  ctx.stroke();

  switch (greaveStyle) {
    case "smooth": {
      // Two subtle articulation bands
      ctx.strokeStyle = palette.armorDark;
      ctx.lineWidth = 0.7 * zoom;
      for (const t of [0.35, 0.65]) {
        ctx.beginPath();
        ctx.moveTo(legX - hlw + size * 0.01, greaveTop + greaveH * t);
        ctx.lineTo(legX + hlw - size * 0.01, greaveTop + greaveH * t);
        ctx.stroke();
      }
      break;
    }
    case "ridged": {
      ctx.strokeStyle = palette.armorLight;
      ctx.lineWidth = 0.8 * zoom;
      for (let r = 0; r < 4; r++) {
        const rY = greaveTop + size * 0.015 + r * (greaveH * 0.25);
        ctx.beginPath();
        ctx.moveTo(legX - hlw + size * 0.008, rY);
        ctx.lineTo(legX + hlw - size * 0.008, rY);
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
      ctx.lineWidth = 0.5 * zoom;
      for (let r = 0; r < 4; r++) {
        const rY = greaveTop + size * 0.015 + r * (greaveH * 0.25) + 1;
        ctx.beginPath();
        ctx.moveTo(legX - hlw + size * 0.008, rY);
        ctx.lineTo(legX + hlw - size * 0.008, rY);
        ctx.stroke();
      }
      break;
    }
    case "plated": {
      const plateCount = 3;
      const plateH = greaveH / plateCount;
      for (let p = 0; p < plateCount; p++) {
        const pY = greaveTop + p * plateH;
        ctx.fillStyle = p % 2 === 0 ? palette.armorMid : palette.armorLight;
        ctx.beginPath();
        ctx.roundRect(legX - hlw, pY, lw, plateH + size * 0.005, size * 0.008);
        ctx.fill();
        ctx.strokeStyle = palette.armorDark;
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();
      }
      break;
    }
  }

  // Greave edge highlight
  ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(legX - hlw, greaveTop + size * 0.01);
  ctx.lineTo(legX - hlw, greaveTop + greaveH - size * 0.01);
  ctx.stroke();

  // --- Boot (armored) ---
  const bootTop = greaveTop + greaveH;
  const bootH = size * 0.07;

  const bootGrad = ctx.createLinearGradient(legX - hlw, bootTop, legX + hlw, bootTop);
  bootGrad.addColorStop(0, "#1e1828");
  bootGrad.addColorStop(0.4, "#2a2335");
  bootGrad.addColorStop(0.6, "#2a2335");
  bootGrad.addColorStop(1, "#1e1828");
  ctx.fillStyle = bootGrad;
  ctx.beginPath();
  ctx.roundRect(
    legX - hlw - size * 0.005, bootTop,
    lw + size * 0.01, bootH,
    [0, 0, size * 0.02, size * 0.02],
  );
  ctx.fill();

  // Boot cuff
  ctx.fillStyle = palette.armorMid;
  ctx.fillRect(legX - hlw - size * 0.005, bootTop, lw + size * 0.01, size * 0.016);

  // Boot strap
  ctx.fillStyle = palette.trim;
  ctx.fillRect(legX - size * 0.025, bootTop + bootH * 0.45, size * 0.05, size * 0.014);

  // Sole
  ctx.fillStyle = "#141018";
  ctx.fillRect(legX - hlw - size * 0.005, bootTop + bootH - size * 0.01, lw + size * 0.01, size * 0.01);
}
