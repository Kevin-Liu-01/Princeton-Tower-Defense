import type { MapTheme } from "../../types";
import { getIdleSway } from "./animationHelpers";

export type EnemyCategory =
  | "academic"
  | "ranged"
  | "flying"
  | "undead"
  | "elemental"
  | "forest"
  | "special";

const SHARED_ENEMY_TYPES = new Set([
  "frosh",
  "sophomore",
  "junior",
  "senior",
  "gradstudent",
  "archer",
  "mage",
  "crossbowman",
  "warlock",
  "hexer",
  "harpy",
  "wyvern",
  "specter",
  "berserker",
  "necromancer",
  "shadow_knight",
  "cultist",
  "plaguebearer",
  "banshee",
  "assassin",
  "infernal",
  "athlete",
  "tiger_fan",
  "mascot",
]);

const ENEMY_CATEGORY_MAP: Record<string, EnemyCategory> = {
  archer: "ranged",
  assassin: "elemental",
  athlete: "forest",
  banshee: "elemental",
  berserker: "undead",
  crossbowman: "ranged",
  cultist: "undead",
  frosh: "academic",
  gradstudent: "academic",
  harpy: "flying",
  hexer: "ranged",
  infernal: "elemental",
  junior: "academic",
  mage: "ranged",
  mascot: "special",
  necromancer: "undead",
  plaguebearer: "undead",
  senior: "academic",
  shadow_knight: "undead",
  sophomore: "academic",
  specter: "undead",
  tiger_fan: "forest",
  warlock: "ranged",
  wyvern: "flying",
};

interface RegionPalette {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  particleRgb: string;
}

const REGION_PALETTES: Record<string, RegionPalette> = {
  desert: {
    accent: "#daa520",
    dark: "#7a5c30",
    particleRgb: "218, 165, 32",
    primary: "#c4a35a",
    secondary: "#a88050",
  },
  swamp: {
    accent: "#6b8f3a",
    dark: "#1a2e1a",
    particleRgb: "107, 143, 58",
    primary: "#2d4a2d",
    secondary: "#3a5a3a",
  },
  volcanic: {
    accent: "#ff6633",
    dark: "#3a1510",
    particleRgb: "255, 102, 51",
    primary: "#8b3a2a",
    secondary: "#a04030",
  },
  winter: {
    accent: "#c0e0ff",
    dark: "#4a6888",
    particleRgb: "160, 196, 224",
    primary: "#8ab0d0",
    secondary: "#a0c4e0",
  },
};

interface SwayConfig {
  speed: number;
  amtX: number;
  amtY: number;
}

const CATEGORY_SWAY: Record<EnemyCategory, SwayConfig> = {
  academic: { amtX: 0.003, amtY: 0.002, speed: 1 },
  elemental: { amtX: 0.004, amtY: 0.003, speed: 1 },
  flying: { amtX: 0.004, amtY: 0.003, speed: 0.9 },
  forest: { amtX: 0.0035, amtY: 0.0025, speed: 0.95 },
  ranged: { amtX: 0.003, amtY: 0.002, speed: 0.8 },
  special: { amtX: 0.003, amtY: 0.002, speed: 0.8 },
  undead: { amtX: 0.004, amtY: 0.003, speed: 0.9 },
};

export function drawRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  enemyType: string,
  region: MapTheme,
  time: number,
  zoom: number
): void {
  if (region === "grassland" || !SHARED_ENEMY_TYPES.has(enemyType)) {
    return;
  }
  const palette = REGION_PALETTES[region];
  if (!palette) {
    return;
  }

  const category = ENEMY_CATEGORY_MAP[enemyType];
  if (!category) {
    return;
  }

  const cfg = CATEGORY_SWAY[category];
  const bodySway = getIdleSway(
    time,
    cfg.speed,
    size * cfg.amtX,
    size * cfg.amtY
  );

  switch (region) {
    case "swamp": {
      drawSwampOverlay(
        ctx,
        x,
        y,
        size,
        category,
        enemyType,
        palette,
        time,
        zoom,
        bodySway
      );
      break;
    }
    case "desert": {
      drawDesertOverlay(
        ctx,
        x,
        y,
        size,
        category,
        enemyType,
        palette,
        time,
        zoom,
        bodySway
      );
      break;
    }
    case "winter": {
      drawWinterOverlay(
        ctx,
        x,
        y,
        size,
        category,
        enemyType,
        palette,
        time,
        zoom,
        bodySway
      );
      break;
    }
    case "volcanic": {
      drawVolcanicOverlay(
        ctx,
        x,
        y,
        size,
        category,
        enemyType,
        palette,
        time,
        zoom,
        bodySway
      );
      break;
    }
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
  sway: { dx: number; dy: number }
): void {
  const bx = x + sway.dx;
  const by = y + sway.dy;

  drawDrippingMoss(ctx, bx, by, size, time, zoom);

  if (category === "ranged" || category === "undead") {
    drawSwampHood(ctx, bx, by, size, time, zoom);
  }
  if (category === "academic" || category === "forest") {
    drawFungalGrowths(ctx, bx, by, size, time, zoom);
  }
  if (category === "flying") {
    drawSwampWingMoss(ctx, bx, by, size, time, zoom);
  }

  drawSwampParticles(ctx, x, y, size, time, zoom);
}

function drawDrippingMoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
      y - size * 0.15 + dripLen
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
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawSwampHood(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
): void {
  // Outer hood shell — dark mossy fabric
  ctx.fillStyle = "rgba(30, 55, 22, 0.62)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.42);
  ctx.quadraticCurveTo(
    x - size * 0.32,
    y - size * 0.58,
    x - size * 0.12,
    y - size * 0.72
  );
  ctx.quadraticCurveTo(x, y - size * 0.78, x + size * 0.12, y - size * 0.72);
  ctx.quadraticCurveTo(
    x + size * 0.32,
    y - size * 0.58,
    x + size * 0.24,
    y - size * 0.42
  );
  ctx.closePath();
  ctx.fill();

  // Inner hood lining — lighter damp fabric
  ctx.fillStyle = "rgba(50, 80, 40, 0.45)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.44);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.56, x, y - size * 0.66);
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.56,
    x + size * 0.18,
    y - size * 0.44
  );
  ctx.closePath();
  ctx.fill();

  // Tattered bottom edge — ragged cuts
  ctx.fillStyle = "rgba(30, 55, 22, 0.5)";
  for (let i = 0; i < 5; i++) {
    const tx = x - size * 0.2 + i * size * 0.1;
    const tLen = size * (0.03 + ((i * 7 + 3) % 5) * 0.008);
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.02, y - size * 0.42);
    ctx.lineTo(tx, y - size * 0.42 + tLen);
    ctx.lineTo(tx + size * 0.02, y - size * 0.42);
    ctx.fill();
  }

  // Lichen/moss patches on fabric
  ctx.fillStyle = "rgba(90, 130, 50, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.58,
    size * 0.035,
    size * 0.025,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "rgba(70, 110, 45, 0.35)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.54,
    size * 0.025,
    size * 0.02,
    0.4,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Rope tie at chin
  ctx.strokeStyle = "rgba(100, 80, 50, 0.55)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.42);
  ctx.quadraticCurveTo(x, y - size * 0.36, x + size * 0.12, y - size * 0.42);
  ctx.stroke();

  // Vine tendrils hanging from hood — animated
  ctx.strokeStyle = "rgba(65, 115, 45, 0.5)";
  ctx.lineWidth = 1.2 * zoom;
  for (let v = 0; v < 4; v++) {
    const vx = x - size * 0.15 + v * size * 0.1;
    const drift = Math.sin(time * 2.2 + v * 1.4) * size * 0.03;
    const vLen = size * (0.12 + Math.sin(time * 1.8 + v * 1.7) * 0.03);
    ctx.beginPath();
    ctx.moveTo(vx, y - size * 0.44);
    ctx.quadraticCurveTo(
      vx + drift,
      y - size * 0.44 + vLen * 0.5,
      vx + drift * 0.6,
      y - size * 0.44 + vLen
    );
    ctx.stroke();
  }

  // Fabric fold line down center
  ctx.strokeStyle = "rgba(20, 40, 15, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.74);
  ctx.quadraticCurveTo(x + size * 0.01, y - size * 0.58, x, y - size * 0.44);
  ctx.stroke();
}

function drawFungalGrowths(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
    ctx.arc(
      mx - mSize * 0.3,
      my - mSize * 0.1 + bob,
      mSize * 0.15,
      0,
      Math.PI * 2
    );
    ctx.arc(
      mx + mSize * 0.2,
      my - mSize * 0.2 + bob,
      mSize * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Algae stain on torso
  ctx.fillStyle = "rgba(50, 100, 40, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.05,
    y + size * 0.1,
    size * 0.12,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawSwampWingMoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
      y + size * 0.3 + Math.sin(time * 1.5 + w) * size * 0.05
    );
    ctx.stroke();
  }
}

function drawSwampParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  sway: { dx: number; dy: number }
): void {
  const bx = x + sway.dx;
  const by = y + sway.dy;

  if (
    category === "ranged" ||
    category === "undead" ||
    category === "elemental"
  ) {
    drawDesertHeadWrap(ctx, bx, by, size, time, zoom);
  }
  if (category === "academic" || category === "forest") {
    drawDesertScarf(ctx, bx, by, size, time, zoom);
  }
  if (category === "flying") {
    drawDesertFeatherBands(ctx, bx, by, size, time, zoom);
  }

  drawDesertSandDust(ctx, x, y, size, time, zoom);
  drawScarabAmulet(ctx, bx, by, size, time, zoom);
}

function drawDesertHeadWrap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
): void {
  const windSway = Math.sin(time * 2.8) * size * 0.05;

  // Base head wrap — layered keffiyeh
  ctx.fillStyle = "rgba(215, 190, 135, 0.6)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.48);
  ctx.quadraticCurveTo(x - size * 0.26, y - size * 0.66, x, y - size * 0.74);
  ctx.quadraticCurveTo(
    x + size * 0.26,
    y - size * 0.66,
    x + size * 0.22,
    y - size * 0.48
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.42);
  ctx.quadraticCurveTo(x, y - size * 0.64, x - size * 0.18, y - size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Second wrap layer — slightly darker fold
  ctx.fillStyle = "rgba(195, 170, 115, 0.45)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.5);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.6, x, y - size * 0.68);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.58,
    x + size * 0.14,
    y - size * 0.48
  );
  ctx.closePath();
  ctx.fill();

  // Agal (rope ring holding wrap in place)
  ctx.strokeStyle = "rgba(80, 60, 30, 0.55)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.6, size * 0.14, size * 0.04, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Trailing tail cloth blown by wind
  ctx.fillStyle = "rgba(205, 180, 120, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.5);
  ctx.quadraticCurveTo(
    x + size * 0.32 + windSway * 0.6,
    y - size * 0.35,
    x + size * 0.28 + windSway,
    y - size * 0.15
  );
  ctx.lineTo(x + size * 0.24 + windSway * 0.8, y - size * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.26 + windSway * 0.4,
    y - size * 0.28,
    x + size * 0.14,
    y - size * 0.44
  );
  ctx.closePath();
  ctx.fill();

  // Tail cloth edge — lighter sun-bleached strip
  ctx.strokeStyle = "rgba(230, 210, 160, 0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28 + windSway, y - size * 0.15);
  ctx.lineTo(x + size * 0.24 + windSway * 0.8, y - size * 0.12);
  ctx.stroke();

  // Woven pattern stripes
  ctx.strokeStyle = "rgba(150, 110, 50, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 3; i++) {
    const sy = y - size * (0.57 - i * 0.03);
    const w = size * (0.13 - i * 0.015);
    ctx.beginPath();
    ctx.moveTo(x - w, sy);
    ctx.lineTo(x + w, sy);
    ctx.stroke();
  }

  // Face veil — semi-transparent drape below eyes
  ctx.fillStyle = "rgba(200, 175, 120, 0.3)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.46);
  ctx.lineTo(x + size * 0.14, y - size * 0.46);
  ctx.lineTo(x + size * 0.12, y - size * 0.36);
  ctx.quadraticCurveTo(x, y - size * 0.33, x - size * 0.12, y - size * 0.36);
  ctx.closePath();
  ctx.fill();

  // Small brass clasp at temple
  const glint = 0.4 + Math.sin(time * 4.5) * 0.25;
  ctx.fillStyle = `rgba(200, 160, 50, ${glint})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.17, y - size * 0.52, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
}

function drawDesertScarf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
): void {
  // Flowing desert scarf around neck
  const windSway = Math.sin(time * 2.5) * size * 0.04;
  ctx.fillStyle = "rgba(210, 175, 100, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.25, x + size * 0.15, y - size * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.25 + windSway,
    y - size * 0.15,
    x + size * 0.2 + windSway * 1.5,
    y + size * 0.05
  );
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.1, x, y - size * 0.2);
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
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
    ctx.arc(
      x + side * size * 0.2,
      y - size * 0.22,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.arc(
      x + side * size * 0.28,
      y - size * 0.18,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawDesertSandDust(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  ctx.ellipse(
    ax - size * 0.025,
    ay,
    size * 0.02,
    size * 0.015,
    -0.4,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    ax + size * 0.025,
    ay,
    size * 0.02,
    size * 0.015,
    0.4,
    0,
    Math.PI * 2
  );
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
  sway: { dx: number; dy: number }
): void {
  const bx = x + sway.dx;
  const by = y + sway.dy;

  if (
    category === "ranged" ||
    category === "undead" ||
    category === "elemental"
  ) {
    drawFurLinedHood(ctx, bx, by, size, time, zoom);
  }
  if (
    category === "academic" ||
    category === "forest" ||
    category === "special"
  ) {
    drawFurCollar(ctx, bx, by, size, time, zoom);
  }
  if (category === "flying") {
    drawFrostWingTips(ctx, bx, by, size, time, zoom);
  }

  drawFrostCrystals(ctx, bx, by, size, time, zoom);
  drawBreathVapor(ctx, bx, by, size, time, zoom);
  drawSnowDusting(ctx, bx, by, x, y, size, time, zoom);
}

function drawFurLinedHood(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
): void {
  // Outer hood — heavy winter wool
  ctx.fillStyle = "rgba(60, 78, 100, 0.58)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.42);
  ctx.quadraticCurveTo(
    x - size * 0.34,
    y - size * 0.58,
    x - size * 0.14,
    y - size * 0.72
  );
  ctx.quadraticCurveTo(x, y - size * 0.78, x + size * 0.14, y - size * 0.72);
  ctx.quadraticCurveTo(
    x + size * 0.34,
    y - size * 0.58,
    x + size * 0.26,
    y - size * 0.42
  );
  ctx.closePath();
  ctx.fill();

  // Inner hood layer — warmer tone
  ctx.fillStyle = "rgba(80, 70, 60, 0.4)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.44);
  ctx.quadraticCurveTo(x - size * 0.24, y - size * 0.56, x, y - size * 0.66);
  ctx.quadraticCurveTo(
    x + size * 0.24,
    y - size * 0.56,
    x + size * 0.19,
    y - size * 0.44
  );
  ctx.closePath();
  ctx.fill();

  // Center fold crease
  ctx.strokeStyle = "rgba(40, 55, 75, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.75);
  ctx.quadraticCurveTo(x - size * 0.005, y - size * 0.58, x, y - size * 0.44);
  ctx.stroke();

  // Thick fur trim lining the face opening — layered tufts
  const furBaseAlpha = 0.55;
  for (let layer = 0; layer < 2; layer++) {
    const r = size * (0.27 - layer * 0.03);
    const count = 12 - layer * 2;
    const lightness = layer === 0 ? 210 : 235;
    ctx.fillStyle = `rgba(${lightness}, ${lightness - 10}, ${lightness - 20}, ${furBaseAlpha - layer * 0.1})`;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 0.12 + i * ((Math.PI * 0.76) / (count - 1));
      const furX = x + Math.cos(angle + Math.PI) * r;
      const furY = y - size * 0.44 + Math.sin(angle + Math.PI) * (r * 0.82);
      const tuftSize = size * (0.022 + ((i * 3 + layer * 5) % 7) * 0.002);
      ctx.beginPath();
      ctx.ellipse(furX, furY, tuftSize, tuftSize * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Clasp/toggle at throat
  ctx.fillStyle = "rgba(140, 130, 110, 0.6)";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.4, size * 0.015, size * 0.012, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stitching along hood seams
  ctx.strokeStyle = "rgba(100, 90, 75, 0.3)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.setLineDash([2 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.44);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y - size * 0.56,
    x - size * 0.12,
    y - size * 0.7
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y - size * 0.44);
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.56,
    x + size * 0.12,
    y - size * 0.7
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // Frost gathering on top edge
  const frostAlpha = 0.3 + Math.sin(time * 2) * 0.1;
  ctx.fillStyle = `rgba(220, 235, 255, ${frostAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.72,
    size * 0.04,
    size * 0.01,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.7,
    size * 0.035,
    size * 0.008,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawFurCollar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
      const angle = (arm * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * cSize, cy + Math.sin(angle) * cSize);
      ctx.lineTo(cx - Math.cos(angle) * cSize, cy - Math.sin(angle) * cSize);
      ctx.stroke();
    }
  }
}

function drawBreathVapor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  bx: number,
  by: number,
  ox: number,
  oy: number,
  size: number,
  time: number,
  zoom: number
): void {
  ctx.fillStyle = "rgba(240, 245, 255, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    bx - size * 0.18,
    by - size * 0.22,
    size * 0.08,
    size * 0.015,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    bx + size * 0.18,
    by - size * 0.22,
    size * 0.08,
    size * 0.015,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    bx,
    by - size * 0.55,
    size * 0.1,
    size * 0.012,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const sfPhase = (time * 0.3 + i * 0.35) % 1;
    const sfx = ox + Math.sin(time + i * 2.1) * size * 0.25;
    const sfy = oy - size * 0.4 + sfPhase * size * 0.8;
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
  sway: { dx: number; dy: number }
): void {
  const bx = x + sway.dx;
  const by = y + sway.dy;

  if (
    category === "ranged" ||
    category === "undead" ||
    category === "elemental"
  ) {
    drawCharredCowl(ctx, bx, by, size, time, zoom);
  }
  if (
    category === "academic" ||
    category === "forest" ||
    category === "special"
  ) {
    drawAshCoating(ctx, bx, by, size, time, zoom);
  }
  if (category === "flying") {
    drawEmberWingTrails(ctx, bx, by, size, time, zoom);
  }

  drawLavaCracks(ctx, bx, by, size, time, zoom);
  drawEmberParticles(ctx, x, y, size, time, zoom);
}

function drawCharredCowl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
): void {
  // Outer cowl — charred heavy fabric
  ctx.fillStyle = "rgba(45, 22, 15, 0.6)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.42);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y - size * 0.56,
    x - size * 0.12,
    y - size * 0.7
  );
  ctx.quadraticCurveTo(x, y - size * 0.76, x + size * 0.12, y - size * 0.7);
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.56,
    x + size * 0.24,
    y - size * 0.42
  );
  ctx.closePath();
  ctx.fill();

  // Inner cowl layer — ashen gray
  ctx.fillStyle = "rgba(70, 55, 48, 0.4)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.44);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.54, x, y - size * 0.64);
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.54,
    x + size * 0.18,
    y - size * 0.44
  );
  ctx.closePath();
  ctx.fill();

  // Scorched/cracked edges — irregular tattered bottom
  ctx.fillStyle = "rgba(35, 18, 10, 0.5)";
  for (let i = 0; i < 6; i++) {
    const tx = x - size * 0.22 + i * size * 0.088;
    const tLen = size * (0.02 + ((i * 5 + 2) % 4) * 0.007);
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.015, y - size * 0.42);
    ctx.lineTo(tx + size * 0.003, y - size * 0.42 + tLen);
    ctx.lineTo(tx + size * 0.018, y - size * 0.42);
    ctx.fill();
  }

  // Glowing ember edges — pulsing
  const emberPulse = 0.35 + Math.sin(time * 4.5) * 0.2;
  ctx.strokeStyle = `rgba(255, 95, 25, ${emberPulse})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.43);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    y - size * 0.55,
    x - size * 0.1,
    y - size * 0.68
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.43);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.55,
    x + size * 0.1,
    y - size * 0.68
  );
  ctx.stroke();

  // Burn holes with inner glow
  const holePositions = [
    { hx: -0.1, hy: -0.56, rx: 0.022, ry: 0.016 },
    { hx: 0.08, hy: -0.52, rx: 0.018, ry: 0.014 },
    { hx: -0.02, hy: -0.6, rx: 0.015, ry: 0.012 },
  ];
  for (let i = 0; i < holePositions.length; i++) {
    const hp = holePositions[i];
    const hGlow = 0.25 + Math.sin(time * 3.5 + i * 2.1) * 0.15;
    // Dark burnt ring
    ctx.fillStyle = `rgba(25, 10, 5, 0.5)`;
    ctx.beginPath();
    ctx.ellipse(
      x + size * hp.hx,
      y + size * hp.hy,
      size * hp.rx,
      size * hp.ry,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Inner ember glow
    ctx.fillStyle = `rgba(220, 90, 20, ${hGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      x + size * hp.hx,
      y + size * hp.hy,
      size * hp.rx * 0.6,
      size * hp.ry * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Ash deposits on fabric
  ctx.fillStyle = "rgba(90, 80, 75, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.62,
    size * 0.04,
    size * 0.015,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.5,
    size * 0.03,
    size * 0.012,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Heat shimmer lines near top
  const shimmerAlpha = 0.15 + Math.sin(time * 6) * 0.08;
  ctx.strokeStyle = `rgba(255, 150, 60, ${shimmerAlpha})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.72);
  ctx.quadraticCurveTo(
    x - size * 0.02,
    y - size * 0.76,
    x + size * 0.04,
    y - size * 0.73
  );
  ctx.stroke();

  // Center fold scar
  ctx.strokeStyle = "rgba(30, 15, 8, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.73);
  ctx.quadraticCurveTo(x + size * 0.008, y - size * 0.58, x, y - size * 0.44);
  ctx.stroke();
}

function drawAshCoating(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  ctx.ellipse(
    x - size * 0.1,
    y + size * 0.05,
    size * 0.06,
    size * 0.04,
    0.5,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y + size * 0.15,
    size * 0.05,
    size * 0.035,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}

function drawEmberWingTrails(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
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
