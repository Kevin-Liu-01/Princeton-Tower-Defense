// Princeton Tower Defense - Major Landmark Decorations
// Renders large, detailed decorations like pyramids, castles, etc.

import { lightenColor, darkenColor, colorWithAlpha } from "../helpers";

// ============================================================================
// PYRAMID
// ============================================================================

export function drawPyramid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number,
  time: number
): void {
  const s = scale;
  
  // Pyramid colors based on variant
  const colors = [
    { stone: "#c4a574", dark: "#a48554", light: "#d4b584", trim: "#daa520" },
    { stone: "#b89c6c", dark: "#987c4c", light: "#c8ac7c", trim: "#c9a227" },
    { stone: "#d4b078", dark: "#b49058", light: "#e4c088", trim: "#ffd700" },
  ][variant % 3];

  // Ground shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 20 * s, y + 10 * s, 80 * s, 30 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Back face (darkest)
  ctx.fillStyle = colors.dark;
  ctx.beginPath();
  ctx.moveTo(x, y - 100 * s);
  ctx.lineTo(x - 70 * s, y);
  ctx.lineTo(x + 70 * s, y);
  ctx.closePath();
  ctx.fill();

  // Right face (medium)
  const rightGrad = ctx.createLinearGradient(x, y - 100 * s, x + 70 * s, y);
  rightGrad.addColorStop(0, colors.light);
  rightGrad.addColorStop(1, colors.stone);
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - 100 * s);
  ctx.lineTo(x + 70 * s, y);
  ctx.lineTo(x, y - 20 * s);
  ctx.closePath();
  ctx.fill();

  // Left face (lit)
  const leftGrad = ctx.createLinearGradient(x - 70 * s, y, x, y - 100 * s);
  leftGrad.addColorStop(0, colors.stone);
  leftGrad.addColorStop(1, colors.light);
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - 100 * s);
  ctx.lineTo(x - 70 * s, y);
  ctx.lineTo(x, y - 20 * s);
  ctx.closePath();
  ctx.fill();

  // Stone block lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 1 * s;
  for (let i = 1; i < 8; i++) {
    const lineY = y - (i * 12) * s;
    const width = (8 - i) * 8 * s;
    ctx.beginPath();
    ctx.moveTo(x - width, lineY + i * 2.5 * s);
    ctx.lineTo(x + width, lineY + i * 2.5 * s);
    ctx.stroke();
  }

  // Entrance
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y - 5 * s);
  ctx.lineTo(x, y - 25 * s);
  ctx.lineTo(x + 12 * s, y - 5 * s);
  ctx.closePath();
  ctx.fill();

  // Golden capstone
  const capGlow = 0.6 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = colors.trim;
  ctx.shadowColor = colors.trim;
  ctx.shadowBlur = 15 * s * capGlow;
  ctx.beginPath();
  ctx.moveTo(x, y - 100 * s);
  ctx.lineTo(x - 10 * s, y - 85 * s);
  ctx.lineTo(x + 10 * s, y - 85 * s);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Hieroglyphic details
  ctx.fillStyle = colors.dark;
  const symbols = ["𓂀", "𓃀", "𓆣", "𓊹"];
  ctx.font = `${8 * s}px Arial`;
  ctx.textAlign = "center";
  for (let i = 0; i < 3; i++) {
    ctx.fillText(symbols[i % 4], x + (i - 1) * 15 * s, y - 35 * s + i * 8 * s);
  }
}

// ============================================================================
// SPHINX
// ============================================================================

export function drawSphinx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  isGiant: boolean,
  time: number
): void {
  const s = scale * (isGiant ? 1.5 : 1);
  const stoneColor = "#c4a574";
  const stoneDark = "#a48554";
  const stoneLight = "#d4b584";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 10 * s, y + 5 * s, 50 * s, 15 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (lion shape - isometric)
  const bodyGrad = ctx.createLinearGradient(x - 40 * s, y, x + 40 * s, y - 30 * s);
  bodyGrad.addColorStop(0, stoneDark);
  bodyGrad.addColorStop(0.5, stoneColor);
  bodyGrad.addColorStop(1, stoneLight);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - 10 * s, 45 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front paws
  ctx.fillStyle = stoneColor;
  ctx.beginPath();
  ctx.ellipse(x + 35 * s, y + 5 * s, 15 * s, 8 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 25 * s, y + 8 * s, 15 * s, 8 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Human head
  ctx.fillStyle = stoneLight;
  ctx.beginPath();
  ctx.arc(x - 25 * s, y - 35 * s, 18 * s, 0, Math.PI * 2);
  ctx.fill();

  // Headdress
  ctx.fillStyle = stoneColor;
  ctx.beginPath();
  ctx.moveTo(x - 25 * s, y - 55 * s);
  ctx.lineTo(x - 45 * s, y - 20 * s);
  ctx.lineTo(x - 5 * s, y - 20 * s);
  ctx.closePath();
  ctx.fill();

  // Face details
  ctx.fillStyle = stoneDark;
  // Eyes
  ctx.beginPath();
  ctx.ellipse(x - 30 * s, y - 38 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 20 * s, y - 38 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose (broken for realism)
  ctx.strokeStyle = stoneDark;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(x - 25 * s, y - 35 * s);
  ctx.lineTo(x - 23 * s, y - 30 * s);
  ctx.stroke();

  if (isGiant) {
    // Glowing eyes for giant sphinx
    const eyeGlow = 0.5 + Math.sin(time * 2) * 0.3;
    ctx.fillStyle = `rgba(255, 200, 50, ${eyeGlow})`;
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 10 * s;
    ctx.beginPath();
    ctx.ellipse(x - 30 * s, y - 38 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 20 * s, y - 38 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Weathering cracks
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y - 15 * s);
  ctx.lineTo(x + 5 * s, y - 5 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 20 * s, y - 8 * s);
  ctx.lineTo(x + 30 * s, y - 2 * s);
  ctx.stroke();
}

// ============================================================================
// NASSAU HALL
// ============================================================================

export function drawNassauHall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const s = scale;
  const brickColor = "#8b4513";
  const brickDark = "#6b3503";
  const roofColor = "#2d2d2d";
  const windowColor = "#87ceeb";
  const trimColor = "#f5f5dc";

  // Ground shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x + 15 * s, y + 10 * s, 70 * s, 25 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main building - left wall
  ctx.fillStyle = brickDark;
  ctx.beginPath();
  ctx.moveTo(x - 60 * s, y);
  ctx.lineTo(x - 60 * s, y - 50 * s);
  ctx.lineTo(x, y - 60 * s);
  ctx.lineTo(x, y - 10 * s);
  ctx.closePath();
  ctx.fill();

  // Main building - front wall
  const frontGrad = ctx.createLinearGradient(x, y, x + 60 * s, y);
  frontGrad.addColorStop(0, brickColor);
  frontGrad.addColorStop(1, brickDark);
  ctx.fillStyle = frontGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - 10 * s);
  ctx.lineTo(x, y - 60 * s);
  ctx.lineTo(x + 60 * s, y - 50 * s);
  ctx.lineTo(x + 60 * s, y);
  ctx.closePath();
  ctx.fill();

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 65 * s, y - 50 * s);
  ctx.lineTo(x, y - 75 * s);
  ctx.lineTo(x + 65 * s, y - 50 * s);
  ctx.lineTo(x, y - 60 * s);
  ctx.closePath();
  ctx.fill();

  // Windows (3 columns)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const winX = x + 10 * s + col * 18 * s;
      const winY = y - 20 * s - row * 18 * s;
      
      // Window frame
      ctx.fillStyle = trimColor;
      ctx.fillRect(winX - 5 * s, winY - 8 * s, 10 * s, 14 * s);
      
      // Window glass
      ctx.fillStyle = windowColor;
      ctx.fillRect(winX - 4 * s, winY - 7 * s, 8 * s, 12 * s);
      
      // Window glow at night
      const glowAlpha = 0.2 + Math.sin(time + col + row) * 0.1;
      ctx.fillStyle = `rgba(255, 220, 150, ${glowAlpha})`;
      ctx.fillRect(winX - 4 * s, winY - 7 * s, 8 * s, 12 * s);
    }
  }

  // Front door
  ctx.fillStyle = trimColor;
  ctx.fillRect(x + 25 * s, y - 18 * s, 14 * s, 18 * s);
  ctx.fillStyle = "#4a3728";
  ctx.fillRect(x + 27 * s, y - 16 * s, 10 * s, 16 * s);

  // Cupola
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(x - 8 * s, y - 75 * s);
  ctx.lineTo(x - 8 * s, y - 90 * s);
  ctx.lineTo(x + 8 * s, y - 90 * s);
  ctx.lineTo(x + 8 * s, y - 75 * s);
  ctx.closePath();
  ctx.fill();

  // Cupola roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y - 90 * s);
  ctx.lineTo(x, y - 100 * s);
  ctx.lineTo(x + 12 * s, y - 90 * s);
  ctx.closePath();
  ctx.fill();

  // Princeton tiger banner
  ctx.fillStyle = "#ff6600";
  ctx.fillRect(x - 3 * s, y - 88 * s, 6 * s, 10 * s);
}

// ============================================================================
// ICE FORTRESS
// ============================================================================

export function drawIceFortress(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const s = scale;
  const iceColor = "#b0d4e8";
  const iceDark = "#8ab4d0";
  const iceLight = "#d0e8f8";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 10 * s, y + 8 * s, 60 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main structure - left wall
  ctx.fillStyle = iceDark;
  ctx.beginPath();
  ctx.moveTo(x - 50 * s, y);
  ctx.lineTo(x - 50 * s, y - 60 * s);
  ctx.lineTo(x, y - 70 * s);
  ctx.lineTo(x, y - 10 * s);
  ctx.closePath();
  ctx.fill();

  // Main structure - right wall
  const rightGrad = ctx.createLinearGradient(x, y, x + 50 * s, y);
  rightGrad.addColorStop(0, iceLight);
  rightGrad.addColorStop(1, iceColor);
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - 10 * s);
  ctx.lineTo(x, y - 70 * s);
  ctx.lineTo(x + 50 * s, y - 60 * s);
  ctx.lineTo(x + 50 * s, y);
  ctx.closePath();
  ctx.fill();

  // Towers
  const towerPositions = [
    { tx: x - 40 * s, ty: y - 10 * s, h: 80 },
    { tx: x + 40 * s, ty: y - 10 * s, h: 75 },
    { tx: x, ty: y - 20 * s, h: 90 },
  ];

  for (const tower of towerPositions) {
    // Tower body
    ctx.fillStyle = iceColor;
    ctx.beginPath();
    ctx.moveTo(tower.tx - 10 * s, tower.ty);
    ctx.lineTo(tower.tx - 8 * s, tower.ty - tower.h * s);
    ctx.lineTo(tower.tx + 8 * s, tower.ty - tower.h * s);
    ctx.lineTo(tower.tx + 10 * s, tower.ty);
    ctx.closePath();
    ctx.fill();

    // Tower cap
    ctx.fillStyle = iceLight;
    ctx.beginPath();
    ctx.moveTo(tower.tx - 12 * s, tower.ty - tower.h * s);
    ctx.lineTo(tower.tx, tower.ty - (tower.h + 15) * s);
    ctx.lineTo(tower.tx + 12 * s, tower.ty - tower.h * s);
    ctx.closePath();
    ctx.fill();
  }

  // Ice crystal glow
  const glowPulse = 0.3 + Math.sin(time * 2) * 0.15;
  ctx.fillStyle = `rgba(150, 220, 255, ${glowPulse})`;
  ctx.shadowColor = "#aaddff";
  ctx.shadowBlur = 20 * s;
  ctx.beginPath();
  ctx.arc(x, y - 50 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ice cracks for detail
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(x - 30 * s, y - 30 * s);
  ctx.lineTo(x - 20 * s, y - 45 * s);
  ctx.lineTo(x - 25 * s, y - 55 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 20 * s, y - 25 * s);
  ctx.lineTo(x + 30 * s, y - 40 * s);
  ctx.stroke();
}

// ============================================================================
// OBSIDIAN CASTLE
// ============================================================================

export function drawObsidianCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const s = scale;
  const obsidianColor = "#1a1a2e";
  const obsidianLight = "#2a2a4e";
  const lavaColor = "#ff4400";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x + 10 * s, y + 8 * s, 65 * s, 22 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main keep
  ctx.fillStyle = obsidianColor;
  ctx.beginPath();
  ctx.moveTo(x - 45 * s, y);
  ctx.lineTo(x - 45 * s, y - 70 * s);
  ctx.lineTo(x + 45 * s, y - 70 * s);
  ctx.lineTo(x + 45 * s, y);
  ctx.closePath();
  ctx.fill();

  // Light side
  ctx.fillStyle = obsidianLight;
  ctx.beginPath();
  ctx.moveTo(x, y - 5 * s);
  ctx.lineTo(x, y - 75 * s);
  ctx.lineTo(x + 45 * s, y - 70 * s);
  ctx.lineTo(x + 45 * s, y);
  ctx.closePath();
  ctx.fill();

  // Towers
  const towers = [
    { tx: x - 40 * s, h: 95 },
    { tx: x + 40 * s, h: 90 },
    { tx: x, h: 100 },
  ];

  for (const tower of towers) {
    ctx.fillStyle = obsidianColor;
    ctx.fillRect(tower.tx - 12 * s, y - tower.h * s, 24 * s, tower.h * s);
    
    // Battlements
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(tower.tx - 14 * s + i * 12 * s, y - (tower.h + 8) * s, 8 * s, 8 * s);
    }
  }

  // Lava cracks
  ctx.strokeStyle = lavaColor;
  ctx.lineWidth = 2 * s;
  ctx.shadowColor = lavaColor;
  ctx.shadowBlur = 8 * s;

  const cracks = [
    [{ x: x - 20 * s, y: y - 30 * s }, { x: x - 15 * s, y: y - 45 * s }, { x: x - 18 * s, y: y - 55 * s }],
    [{ x: x + 25 * s, y: y - 20 * s }, { x: x + 20 * s, y: y - 35 * s }],
    [{ x: x + 5 * s, y: y - 50 * s }, { x: x - 5 * s, y: y - 60 * s }],
  ];

  for (const crack of cracks) {
    ctx.beginPath();
    ctx.moveTo(crack[0].x, crack[0].y);
    for (let i = 1; i < crack.length; i++) {
      ctx.lineTo(crack[i].x, crack[i].y);
    }
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Glowing windows
  const windowGlow = 0.5 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(255, 100, 0, ${windowGlow})`;
  ctx.shadowColor = lavaColor;
  ctx.shadowBlur = 10 * s;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.beginPath();
      ctx.arc(x - 15 * s + col * 30 * s, y - 30 * s - row * 20 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
}

// ============================================================================
// WITCH COTTAGE
// ============================================================================

export function drawWitchCottage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const s = scale;
  const woodColor = "#4a3728";
  const woodDark = "#2d1f14";
  const roofColor = "#2d2d3d";
  const glowColor = "#88ff88";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y + 6 * s, 35 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crooked walls
  ctx.fillStyle = woodDark;
  ctx.beginPath();
  ctx.moveTo(x - 25 * s, y);
  ctx.lineTo(x - 28 * s, y - 30 * s);
  ctx.lineTo(x + 22 * s, y - 32 * s);
  ctx.lineTo(x + 25 * s, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = woodColor;
  ctx.beginPath();
  ctx.moveTo(x, y - 5 * s);
  ctx.lineTo(x - 3 * s, y - 32 * s);
  ctx.lineTo(x + 22 * s, y - 32 * s);
  ctx.lineTo(x + 25 * s, y);
  ctx.closePath();
  ctx.fill();

  // Crooked roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 32 * s, y - 28 * s);
  ctx.lineTo(x - 5 * s, y - 55 * s);
  ctx.lineTo(x + 30 * s, y - 30 * s);
  ctx.closePath();
  ctx.fill();

  // Chimney with smoke
  ctx.fillStyle = "#555";
  ctx.fillRect(x + 10 * s, y - 50 * s, 8 * s, 20 * s);

  // Smoke puffs
  const smokePuffs = [
    { ox: 0, oy: -55, size: 6 },
    { ox: 3, oy: -62, size: 5 },
    { ox: -2, oy: -68, size: 4 },
  ];
  for (let i = 0; i < smokePuffs.length; i++) {
    const puff = smokePuffs[i];
    const drift = Math.sin(time * 2 + i) * 3;
    ctx.fillStyle = `rgba(100, 100, 100, ${0.3 - i * 0.08})`;
    ctx.beginPath();
    ctx.arc(x + 14 * s + puff.ox * s + drift, y + puff.oy * s - time * 2 % 20, puff.size * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Door
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x + 5 * s, y);
  ctx.lineTo(x + 3 * s, y - 18 * s);
  ctx.lineTo(x + 17 * s, y - 18 * s);
  ctx.lineTo(x + 15 * s, y);
  ctx.closePath();
  ctx.fill();

  // Glowing window
  const windowGlow = 0.4 + Math.sin(time * 3) * 0.2;
  ctx.fillStyle = `rgba(136, 255, 136, ${windowGlow})`;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15 * s;
  ctx.beginPath();
  ctx.arc(x - 8 * s, y - 18 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mushrooms around base
  const mushColors = ["#ff6666", "#ffcc66", "#cc66ff"];
  for (let i = 0; i < 4; i++) {
    const mx = x - 30 * s + i * 18 * s;
    const my = y + 2 * s;
    ctx.fillStyle = mushColors[i % 3];
    ctx.beginPath();
    ctx.ellipse(mx, my - 5 * s, 4 * s, 3 * s, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5f5dc";
    ctx.fillRect(mx - 1.5 * s, my - 5 * s, 3 * s, 5 * s);
  }
}
