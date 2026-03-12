import type { MapTheme } from "../../types";

export type EnemyCategory =
  | "academic"
  | "ranged"
  | "flying"
  | "undead"
  | "elemental"
  | "forest"
  | "special";

const SHARED_ENEMY_TYPES = new Set([
  "frosh", "sophomore", "junior", "senior", "gradstudent",
  "archer", "mage", "crossbowman", "warlock", "hexer",
  "harpy", "wyvern",
  "specter", "berserker", "necromancer", "shadow_knight", "cultist", "plaguebearer",
  "banshee", "assassin", "infernal",
  "athlete", "tiger_fan",
  "mascot",
]);

const ENEMY_CATEGORY_MAP: Record<string, EnemyCategory> = {
  frosh: "academic", sophomore: "academic", junior: "academic",
  senior: "academic", gradstudent: "academic",
  archer: "ranged", mage: "ranged", crossbowman: "ranged",
  warlock: "ranged", hexer: "ranged",
  harpy: "flying", wyvern: "flying",
  specter: "undead", berserker: "undead", necromancer: "undead",
  shadow_knight: "undead", cultist: "undead", plaguebearer: "undead",
  banshee: "elemental", assassin: "elemental", infernal: "elemental",
  athlete: "forest", tiger_fan: "forest",
  mascot: "special",
};

interface RegionPalette {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  particleRgb: string;
}

const REGION_PALETTES: Record<string, RegionPalette> = {
  swamp: {
    primary: "#2d4a2d",
    secondary: "#3a5a3a",
    accent: "#6b8f3a",
    dark: "#1a2e1a",
    particleRgb: "107, 143, 58",
  },
  desert: {
    primary: "#c4a35a",
    secondary: "#a88050",
    accent: "#daa520",
    dark: "#7a5c30",
    particleRgb: "218, 165, 32",
  },
  winter: {
    primary: "#8ab0d0",
    secondary: "#a0c4e0",
    accent: "#c0e0ff",
    dark: "#4a6888",
    particleRgb: "160, 196, 224",
  },
  volcanic: {
    primary: "#8b3a2a",
    secondary: "#a04030",
    accent: "#ff6633",
    dark: "#3a1510",
    particleRgb: "255, 102, 51",
  },
};

export function drawRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  enemyType: string,
  region: MapTheme,
  time: number,
  zoom: number,
): void {
  if (region === "grassland" || !SHARED_ENEMY_TYPES.has(enemyType)) return;
  const palette = REGION_PALETTES[region];
  if (!palette) return;

  const category = ENEMY_CATEGORY_MAP[enemyType];
  if (!category) return;

  switch (region) {
    case "swamp":
      drawSwampOverlay(ctx, x, y, size, category, enemyType, palette, time, zoom);
      break;
    case "desert":
      drawDesertOverlay(ctx, x, y, size, category, enemyType, palette, time, zoom);
      break;
    case "winter":
      drawWinterOverlay(ctx, x, y, size, category, enemyType, palette, time, zoom);
      break;
    case "volcanic":
      drawVolcanicOverlay(ctx, x, y, size, category, enemyType, palette, time, zoom);
      break;
  }
}

// ============================================================================
// SWAMP — Vine wraps, fungal growths, dripping moss, corroded metals
// ============================================================================

function drawSwampOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  category: EnemyCategory,
  enemyType: string,
  palette: RegionPalette,
  time: number,
  zoom: number,
): void {
  // Dripping moss/slime from shoulders
  drawDrippingMoss(ctx, x, y, size, time, zoom);

  if (category === "ranged" || category === "undead") {
    drawSwampHood(ctx, x, y, size, time, zoom);
  }
  if (category === "academic" || category === "forest") {
    drawFungalGrowths(ctx, x, y, size, time, zoom);
  }
  if (category === "flying") {
    drawSwampWingMoss(ctx, x, y, size, time, zoom);
  }

  drawSwampParticles(ctx, x, y, size, time, zoom);
}

function drawDrippingMoss(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  ctx.strokeStyle = "rgba(60, 100, 40, 0.5)";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const mossX = x - size * 0.25 + i * size * 0.17;
    const dripLen = size * (0.08 + Math.sin(time * 2 + i * 1.3) * 0.04);
    ctx.beginPath();
    ctx.moveTo(mossX, y - size * 0.15);
    ctx.quadraticCurveTo(
      mossX + Math.sin(time * 3 + i) * size * 0.03,
      y - size * 0.15 + dripLen * 0.5,
      mossX,
      y - size * 0.15 + dripLen,
    );
    ctx.stroke();
  }
  // Slime drip at bottom
  const dripPhase = (time * 1.5) % 1;
  ctx.fillStyle = `rgba(80, 130, 50, ${0.6 * (1 - dripPhase)})`;
  ctx.beginPath();
  ctx.arc(
    x + Math.sin(time) * size * 0.1,
    y + size * 0.45 + dripPhase * size * 0.1,
    size * 0.015 * (1 - dripPhase * 0.5),
    0, Math.PI * 2,
  );
  ctx.fill();
}

function drawSwampHood(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Ragged vine-threaded hood draped over head
  const hoodGrad = ctx.createLinearGradient(
    x - size * 0.2, y - size * 0.7,
    x + size * 0.2, y - size * 0.5,
  );
  hoodGrad.addColorStop(0, "rgba(30, 60, 25, 0.65)");
  hoodGrad.addColorStop(0.5, "rgba(45, 80, 35, 0.55)");
  hoodGrad.addColorStop(1, "rgba(30, 60, 25, 0.65)");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.42);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.6, x, y - size * 0.72);
  ctx.quadraticCurveTo(x + size * 0.28, y - size * 0.6, x + size * 0.22, y - size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Vine tendrils hanging from hood
  ctx.strokeStyle = "rgba(70, 120, 50, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 3; v++) {
    const vx = x - size * 0.12 + v * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(vx, y - size * 0.48);
    ctx.quadraticCurveTo(
      vx + Math.sin(time * 2 + v) * size * 0.04,
      y - size * 0.38,
      vx + Math.sin(time * 3 + v) * size * 0.02,
      y - size * 0.3,
    );
    ctx.stroke();
  }
}

function drawFungalGrowths(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Mushroom caps growing on shoulders
  const mushColors = ["#8b6f4e", "#6b8e23", "#9acd32"];
  for (let i = 0; i < 3; i++) {
    const mx = x + (i - 1) * size * 0.22;
    const my = y - size * 0.2 - i * size * 0.05;
    const mSize = size * (0.04 + i * 0.01);
    const bob = Math.sin(time * 2 + i * 1.5) * size * 0.01;

    // Stem
    ctx.fillStyle = "#a89070";
    ctx.fillRect(mx - size * 0.008, my + bob, size * 0.016, mSize * 1.2);
    // Cap
    ctx.fillStyle = mushColors[i];
    ctx.beginPath();
    ctx.ellipse(mx, my + bob, mSize, mSize * 0.6, 0, Math.PI, 0);
    ctx.fill();
    // Spots
    ctx.fillStyle = "rgba(255, 255, 200, 0.5)";
    ctx.beginPath();
    ctx.arc(mx - mSize * 0.3, my - mSize * 0.1 + bob, mSize * 0.15, 0, Math.PI * 2);
    ctx.arc(mx + mSize * 0.2, my - mSize * 0.2 + bob, mSize * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Algae stain on torso
  ctx.fillStyle = "rgba(50, 100, 40, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.05, y + size * 0.1, size * 0.12, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSwampWingMoss(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Trailing algae strands from wings
  ctx.strokeStyle = "rgba(60, 100, 40, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  for (let w = 0; w < 4; w++) {
    const side = w < 2 ? -1 : 1;
    const wOffset = (w % 2) * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(x + side * (size * 0.25 + wOffset), y - size * 0.15);
    ctx.quadraticCurveTo(
      x + side * (size * 0.3 + wOffset) + Math.sin(time * 2 + w) * size * 0.05,
      y + size * 0.1,
      x + side * (size * 0.2 + wOffset),
      y + size * 0.3 + Math.sin(time * 1.5 + w) * size * 0.05,
    );
    ctx.stroke();
  }
}

function drawSwampParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Floating spore particles
  for (let i = 0; i < 4; i++) {
    const pPhase = (time * 0.4 + i * 0.3) % 1;
    const px = x + Math.sin(time * 1.5 + i * 2) * size * 0.3;
    const py = y - pPhase * size * 0.5;
    const pAlpha = (1 - pPhase) * 0.4;
    ctx.fillStyle = `rgba(150, 200, 80, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// DESERT — Turbans, sand wraps, sun-bleached cloth, scarab jewelry
// ============================================================================

function drawDesertOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  category: EnemyCategory,
  enemyType: string,
  palette: RegionPalette,
  time: number,
  zoom: number,
): void {
  if (category === "ranged" || category === "undead" || category === "elemental") {
    drawDesertHeadWrap(ctx, x, y, size, time, zoom);
  }
  if (category === "academic" || category === "forest") {
    drawDesertScarf(ctx, x, y, size, time, zoom);
  }
  if (category === "flying") {
    drawDesertFeatherBands(ctx, x, y, size, time, zoom);
  }

  drawDesertSandDust(ctx, x, y, size, time, zoom);
  drawScarabAmulet(ctx, x, y, size, time, zoom);
}

function drawDesertHeadWrap(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Flowing desert head wrap / keffiyeh
  const wrapGrad = ctx.createLinearGradient(
    x - size * 0.25, y - size * 0.65,
    x + size * 0.25, y - size * 0.45,
  );
  wrapGrad.addColorStop(0, "rgba(200, 170, 110, 0.6)");
  wrapGrad.addColorStop(0.5, "rgba(230, 200, 140, 0.55)");
  wrapGrad.addColorStop(1, "rgba(200, 170, 110, 0.6)");
  ctx.fillStyle = wrapGrad;

  // Wrap around head top
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.72, x + size * 0.2, y - size * 0.5);
  ctx.lineTo(x + size * 0.18, y - size * 0.42);
  ctx.quadraticCurveTo(x, y - size * 0.62, x - size * 0.18, y - size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Trailing tail cloth blown by wind
  const windSway = Math.sin(time * 3) * size * 0.06;
  ctx.fillStyle = "rgba(210, 185, 130, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.48);
  ctx.quadraticCurveTo(
    x + size * 0.35 + windSway, y - size * 0.3,
    x + size * 0.3 + windSway * 1.5, y - size * 0.1,
  );
  ctx.quadraticCurveTo(
    x + size * 0.28 + windSway, y - size * 0.25,
    x + size * 0.15, y - size * 0.42,
  );
  ctx.closePath();
  ctx.fill();

  // Woven pattern stripes
  ctx.strokeStyle = "rgba(160, 120, 60, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55);
  ctx.lineTo(x + size * 0.15, y - size * 0.55);
  ctx.moveTo(x - size * 0.12, y - size * 0.52);
  ctx.lineTo(x + size * 0.12, y - size * 0.52);
  ctx.stroke();
}

function drawDesertScarf(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Flowing desert scarf around neck
  const windSway = Math.sin(time * 2.5) * size * 0.04;
  ctx.fillStyle = "rgba(210, 175, 100, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.25, x + size * 0.15, y - size * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.25 + windSway, y - size * 0.15,
    x + size * 0.2 + windSway * 1.5, y + size * 0.05,
  );
  ctx.quadraticCurveTo(
    x + size * 0.15, y - size * 0.1,
    x, y - size * 0.2,
  );
  ctx.closePath();
  ctx.fill();

  // Sun-faded embroidery edge
  ctx.strokeStyle = "rgba(180, 140, 60, 0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.setLineDash([3 * zoom, 2 * zoom]);
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.28);
  ctx.quadraticCurveTo(x, y - size * 0.23, x + size * 0.14, y - size * 0.28);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawDesertFeatherBands(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Leather bands on wings with brass studs
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = "rgba(140, 100, 50, 0.5)";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.15, y - size * 0.25);
    ctx.lineTo(x + side * size * 0.35, y - size * 0.15);
    ctx.stroke();

    // Brass studs
    ctx.fillStyle = "rgba(218, 165, 32, 0.6)";
    ctx.beginPath();
    ctx.arc(x + side * size * 0.2, y - size * 0.22, size * 0.015, 0, Math.PI * 2);
    ctx.arc(x + side * size * 0.28, y - size * 0.18, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDesertSandDust(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Sand particles kicked up around feet
  for (let i = 0; i < 5; i++) {
    const pAngle = time * 1.2 + i * 1.3;
    const pDist = size * (0.25 + Math.sin(time * 2 + i) * 0.1);
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.4 + Math.sin(pAngle) * size * 0.05;
    const pAlpha = 0.25 + Math.sin(time * 3 + i) * 0.1;
    ctx.fillStyle = `rgba(210, 180, 120, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawScarabAmulet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Small golden scarab pendant on chest
  const glint = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(218, 165, 32, ${glint * 0.7})`;
  const ax = x;
  const ay = y - size * 0.15;

  // Scarab body
  ctx.beginPath();
  ctx.ellipse(ax, ay, size * 0.025, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings
  ctx.beginPath();
  ctx.ellipse(ax - size * 0.025, ay, size * 0.02, size * 0.015, -0.4, 0, Math.PI * 2);
  ctx.ellipse(ax + size * 0.025, ay, size * 0.02, size * 0.015, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Glint
  ctx.fillStyle = `rgba(255, 240, 180, ${glint * 0.8})`;
  ctx.beginPath();
  ctx.arc(ax - size * 0.008, ay - size * 0.01, size * 0.006, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// WINTER — Fur-lined cloaks, frost crystals, icy breath, snow dusting
// ============================================================================

function drawWinterOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  category: EnemyCategory,
  enemyType: string,
  palette: RegionPalette,
  time: number,
  zoom: number,
): void {
  if (category === "ranged" || category === "undead" || category === "elemental") {
    drawFurLinedHood(ctx, x, y, size, time, zoom);
  }
  if (category === "academic" || category === "forest" || category === "special") {
    drawFurCollar(ctx, x, y, size, time, zoom);
  }
  if (category === "flying") {
    drawFrostWingTips(ctx, x, y, size, time, zoom);
  }

  drawFrostCrystals(ctx, x, y, size, time, zoom);
  drawBreathVapor(ctx, x, y, size, time, zoom);
  drawSnowDusting(ctx, x, y, size, time, zoom);
}

function drawFurLinedHood(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Heavy fur-lined hood
  const hoodGrad = ctx.createLinearGradient(
    x - size * 0.25, y - size * 0.7,
    x + size * 0.25, y - size * 0.48,
  );
  hoodGrad.addColorStop(0, "rgba(60, 80, 100, 0.6)");
  hoodGrad.addColorStop(0.5, "rgba(80, 100, 120, 0.5)");
  hoodGrad.addColorStop(1, "rgba(60, 80, 100, 0.6)");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.44);
  ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.62, x, y - size * 0.7);
  ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.62, x + size * 0.24, y - size * 0.44);
  ctx.closePath();
  ctx.fill();

  // Fur trim along hood edge
  ctx.fillStyle = "rgba(220, 210, 200, 0.55)";
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI * 0.15 + i * Math.PI * 0.07;
    const furX = x + Math.cos(angle + Math.PI) * size * 0.27;
    const furY = y - size * 0.44 + Math.sin(angle + Math.PI) * size * 0.22;
    ctx.beginPath();
    ctx.ellipse(
      furX, furY,
      size * 0.025, size * 0.015,
      angle, 0, Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawFurCollar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Thick fur collar around neck
  ctx.fillStyle = "rgba(200, 190, 175, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28, size * 0.22, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fur texture tufts
  ctx.fillStyle = "rgba(230, 220, 205, 0.45)";
  for (let i = 0; i < 8; i++) {
    const tuftAngle = (i / 8) * Math.PI * 2;
    const tx = x + Math.cos(tuftAngle) * size * 0.2;
    const ty = y - size * 0.28 + Math.sin(tuftAngle) * size * 0.04;
    ctx.beginPath();
    ctx.ellipse(tx, ty, size * 0.02, size * 0.012, tuftAngle, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFrostWingTips(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Ice crystal formations on wing tips
  for (let side = -1; side <= 1; side += 2) {
    const wingX = x + side * size * 0.35;
    const wingY = y - size * 0.2;
    const iceAlpha = 0.4 + Math.sin(time * 3 + side) * 0.15;

    ctx.fillStyle = `rgba(180, 220, 255, ${iceAlpha})`;
    ctx.beginPath();
    ctx.moveTo(wingX, wingY - size * 0.06);
    ctx.lineTo(wingX + side * size * 0.03, wingY);
    ctx.lineTo(wingX, wingY + size * 0.04);
    ctx.lineTo(wingX - side * size * 0.02, wingY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFrostCrystals(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Small ice crystals forming on the enemy
  const crystalAlpha = 0.35 + Math.sin(time * 2.5) * 0.15;
  ctx.strokeStyle = `rgba(180, 225, 255, ${crystalAlpha})`;
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const cx = x + (i - 1) * size * 0.2;
    const cy = y - size * 0.1 + i * size * 0.08;
    const cSize = size * 0.03;
    // 6-pointed crystal
    for (let arm = 0; arm < 3; arm++) {
      const angle = arm * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * cSize, cy + Math.sin(angle) * cSize);
      ctx.lineTo(cx - Math.cos(angle) * cSize, cy - Math.sin(angle) * cSize);
      ctx.stroke();
    }
  }
}

function drawBreathVapor(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Cold breath mist
  for (let i = 0; i < 3; i++) {
    const breathPhase = (time * 0.6 + i * 0.4) % 1;
    const bx = x + size * 0.05 + breathPhase * size * 0.15;
    const by = y - size * 0.35 - breathPhase * size * 0.08;
    const bAlpha = (1 - breathPhase) * 0.25;
    const bSize = size * (0.02 + breathPhase * 0.03);
    ctx.fillStyle = `rgba(200, 220, 240, ${bAlpha})`;
    ctx.beginPath();
    ctx.ellipse(bx, by, bSize * 1.4, bSize, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSnowDusting(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Light snow dusting on shoulders and head
  ctx.fillStyle = "rgba(240, 245, 255, 0.3)";
  // Shoulder snow
  ctx.beginPath();
  ctx.ellipse(x - size * 0.18, y - size * 0.22, size * 0.08, size * 0.015, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.18, y - size * 0.22, size * 0.08, size * 0.015, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Head snow
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.55, size * 0.1, size * 0.012, 0, 0, Math.PI * 2);
  ctx.fill();

  // Falling snowflakes
  for (let i = 0; i < 3; i++) {
    const sfPhase = (time * 0.3 + i * 0.35) % 1;
    const sfx = x + Math.sin(time + i * 2.1) * size * 0.25;
    const sfy = y - size * 0.4 + sfPhase * size * 0.8;
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - sfPhase) * 0.35})`;
    ctx.beginPath();
    ctx.arc(sfx, sfy, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// VOLCANIC — Charred edges, ember trails, lava cracks, ash coating
// ============================================================================

function drawVolcanicOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  category: EnemyCategory,
  enemyType: string,
  palette: RegionPalette,
  time: number,
  zoom: number,
): void {
  if (category === "ranged" || category === "undead" || category === "elemental") {
    drawCharredCowl(ctx, x, y, size, time, zoom);
  }
  if (category === "academic" || category === "forest" || category === "special") {
    drawAshCoating(ctx, x, y, size, time, zoom);
  }
  if (category === "flying") {
    drawEmberWingTrails(ctx, x, y, size, time, zoom);
  }

  drawLavaCracks(ctx, x, y, size, time, zoom);
  drawEmberParticles(ctx, x, y, size, time, zoom);
}

function drawCharredCowl(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Charred, ragged cowl with glowing ember edges
  const cowlGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.68,
    x + size * 0.22, y - size * 0.46,
  );
  cowlGrad.addColorStop(0, "rgba(40, 20, 15, 0.6)");
  cowlGrad.addColorStop(0.5, "rgba(60, 30, 20, 0.5)");
  cowlGrad.addColorStop(1, "rgba(40, 20, 15, 0.6)");
  ctx.fillStyle = cowlGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.44);
  ctx.quadraticCurveTo(x - size * 0.26, y - size * 0.6, x, y - size * 0.68);
  ctx.quadraticCurveTo(x + size * 0.26, y - size * 0.6, x + size * 0.22, y - size * 0.44);
  ctx.closePath();
  ctx.fill();

  // Glowing ember edges
  const emberAlpha = 0.4 + Math.sin(time * 5) * 0.2;
  ctx.strokeStyle = `rgba(255, 100, 30, ${emberAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.44);
  ctx.quadraticCurveTo(x - size * 0.24, y - size * 0.58, x, y - size * 0.66);
  ctx.quadraticCurveTo(x + size * 0.24, y - size * 0.58, x + size * 0.2, y - size * 0.44);
  ctx.stroke();

  // Burn holes with orange glow
  for (let i = 0; i < 2; i++) {
    const hx = x - size * 0.08 + i * size * 0.16;
    const hy = y - size * 0.52;
    ctx.fillStyle = `rgba(200, 80, 20, ${0.3 + Math.sin(time * 4 + i * 2) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(hx, hy, size * 0.02, size * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAshCoating(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Ash/soot coating on the body
  ctx.fillStyle = "rgba(60, 50, 45, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ember-rimmed scorch marks
  const scorchGlow = 0.3 + Math.sin(time * 3) * 0.15;
  ctx.strokeStyle = `rgba(200, 80, 30, ${scorchGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y + size * 0.05, size * 0.06, size * 0.04, 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.08, y + size * 0.15, size * 0.05, size * 0.035, -0.3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawEmberWingTrails(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Ember particle trails behind wings
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const trailPhase = (time * 0.8 + i * 0.25) % 1;
      const tx = x + side * (size * 0.3 - trailPhase * size * 0.15);
      const ty = y + trailPhase * size * 0.3;
      const tAlpha = (1 - trailPhase) * 0.5;
      const tSize = size * 0.012 * (1 - trailPhase * 0.5);
      ctx.fillStyle = `rgba(255, ${Math.floor(100 + trailPhase * 100)}, 30, ${tAlpha})`;
      ctx.beginPath();
      ctx.arc(tx, ty, tSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLavaCracks(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Glowing lava-like cracks on body surface
  const crackGlow = 0.3 + Math.sin(time * 2) * 0.15;
  ctx.strokeStyle = `rgba(255, 80, 20, ${crackGlow})`;
  ctx.lineWidth = 1.5 * zoom;

  // Branching crack pattern
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.1);
  ctx.lineTo(x - size * 0.08, y + size * 0.05);
  ctx.lineTo(x - size * 0.12, y + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y + size * 0.05);
  ctx.lineTo(x + size * 0.02, y + size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.06, y - size * 0.08);
  ctx.lineTo(x + size * 0.1, y + size * 0.05);
  ctx.lineTo(x + size * 0.08, y + size * 0.18);
  ctx.stroke();

  // Inner glow fill in cracks
  ctx.fillStyle = `rgba(255, 160, 50, ${crackGlow * 0.4})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y + size * 0.05, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y + size * 0.05, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
}

function drawEmberParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
): void {
  // Rising ember/ash particles
  for (let i = 0; i < 5; i++) {
    const ePhase = (time * 0.5 + i * 0.22) % 1;
    const ex = x + Math.sin(time * 2 + i * 1.7) * size * 0.2;
    const ey = y + size * 0.1 - ePhase * size * 0.6;
    const eAlpha = (1 - ePhase) * 0.5;
    const eSize = size * 0.01 * (1 - ePhase * 0.4);

    const r = 255;
    const g = Math.floor(80 + (1 - ePhase) * 120);
    const b = Math.floor(20 + ePhase * 30);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${eAlpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
    ctx.fill();
  }
}
