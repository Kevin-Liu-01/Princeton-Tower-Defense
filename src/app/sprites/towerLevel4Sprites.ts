import { ISO_Y_RATIO } from "../constants";

type Ctx = CanvasRenderingContext2D;

// ─── shared helpers ──────────────────────────────────────────────────

function drawStar(ctx: Ctx, x: number, y: number, outerR: number, innerR?: number) {
  const inner = innerR ?? outerR * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : inner;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawLevelIndicator(
  ctx: Ctx, cx: number, cy: number, s: number,
  level: number, color: string, upgrade?: "A" | "B",
) {
  const starCount = Math.min(level, 3);
  if (starCount > 0) {
    const totalW = (starCount - 1) * 6 * s;
    const startX = cx - totalW / 2;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4 * s;
    for (let i = 0; i < starCount; i++) drawStar(ctx, startX + i * 6 * s, cy + 22 * s, 2.5 * s);
    ctx.shadowBlur = 0;
  }
  if (level === 4 && upgrade) {
    const badgeColor = upgrade === "A" ? "#ff6b6b" : "#4ecdc4";
    ctx.fillStyle = badgeColor;
    ctx.shadowColor = badgeColor;
    ctx.shadowBlur = 6 * s;
    ctx.beginPath();
    ctx.arc(cx + 12 * s, cy + 22 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${3.5 * s}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(upgrade, cx + 12 * s, cy + 22 * s);
  }
}

function drawGroundShadow(ctx: Ctx, cx: number, cy: number, s: number, rx = 18, ry = 8) {
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20 * s, rx * s, ry * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHexPlatform(
  ctx: Ctx, cx: number, cy: number, s: number,
  r: number, yBase: number, yTop: number,
  wallColor: string, topColor: string,
) {
  ctx.fillStyle = wallColor;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + Math.cos(a) * r * s;
    const py = cy + yBase * s + Math.sin(a) * (r * 0.5) * s;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = topColor;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + Math.cos(a) * (r - 2) * s;
    const py = cy + yTop * s + Math.sin(a) * ((r - 2) * 0.5) * s;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPanelLines(
  ctx: Ctx, cx: number, cy: number, s: number,
  color: string, offsets: number[][],
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5 * s;
  for (const [x1, y1, x2, y2] of offsets) {
    ctx.beginPath();
    ctx.moveTo(cx + x1 * s, cy + y1 * s);
    ctx.lineTo(cx + x2 * s, cy + y2 * s);
    ctx.stroke();
  }
}

function drawGlowingWindow(
  ctx: Ctx, x: number, y: number, w: number, h: number, s: number,
  frameColor: string, glowColor: string, glowShadow: string, glow: number,
) {
  ctx.fillStyle = frameColor;
  ctx.fillRect(x, y, w * s, h * s);
  ctx.fillStyle = `rgba(${glowColor}, ${glow})`;
  ctx.shadowColor = glowShadow;
  ctx.shadowBlur = 5 * s;
  ctx.fillRect(x + 0.5 * s, y + 0.5 * s, (w - 1) * s, (h - 1) * s);
  ctx.shadowBlur = 0;
}

// ═════════════════════════════════════════════════════════════════════
// CANNON 4A: GATLING GUN
// Multi-barrel rotary cannon on dark military bunker
// ═════════════════════════════════════════════════════════════════════

export function drawCannonGatling(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s);
  drawHexPlatform(ctx, cx, cy, s, 18, 16, 12, "#3a3a3a", "#4a4a4a");

  // Back face
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy + 10 * s);
  ctx.lineTo(cx - 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 14 * s, cy + 10 * s);
  ctx.closePath();
  ctx.fill();

  // Left face with gradient
  const lGrad = ctx.createLinearGradient(cx - 14 * s, cy, cx - 2 * s, cy);
  lGrad.addColorStop(0, "#202025");
  lGrad.addColorStop(1, "#30303a");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy + 10 * s);
  ctx.lineTo(cx - 12 * s, cy - 6 * s);
  ctx.lineTo(cx - 2 * s, cy - 2 * s);
  ctx.lineTo(cx - 2 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Right face with gradient
  const rGrad = ctx.createLinearGradient(cx + 2 * s, cy, cx + 14 * s, cy);
  rGrad.addColorStop(0, "#30303a");
  rGrad.addColorStop(1, "#40404a");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 14 * s, cy + 10 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 2 * s, cy - 2 * s);
  ctx.lineTo(cx + 2 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = "#38383f";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy - 6 * s);
  ctx.lineTo(cx - 2 * s, cy - 10 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 2 * s, cy - 2 * s);
  ctx.closePath();
  ctx.fill();

  // Armor panel lines
  drawPanelLines(ctx, cx, cy, s, "#1a1a1a", [
    [-10, -4, -8, 8], [10, -4, 8, 8], [-6, 2, -2, 2], [6, 2, 2, 2],
  ]);

  // Steel blue vent slats (Gatling Gun uses cooler tones)
  const ventGlow = animated ? 0.5 + Math.sin(t * 4) * 0.3 : 0.6;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(cx - 11 * s, cy - 2 * s, 4 * s, 10 * s);
  ctx.fillStyle = `rgba(140, 180, 220, ${ventGlow})`;
  ctx.shadowColor = "#8ab4dc";
  ctx.shadowBlur = 6 * s;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(cx - 10.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(cx + 7 * s, cy - 2 * s, 4 * s, 10 * s);
  ctx.fillStyle = `rgba(140, 180, 220, ${ventGlow})`;
  ctx.shadowColor = "#8ab4dc";
  ctx.shadowBlur = 6 * s;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(cx + 7.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
  }
  ctx.shadowBlur = 0;

  // Ammo belt box on left side
  ctx.fillStyle = "#3a4a2a";
  ctx.fillRect(cx - 14 * s, cy + 1 * s, 5 * s, 7 * s);
  ctx.strokeStyle = "#2a3a1a";
  ctx.lineWidth = 0.4 * s;
  ctx.strokeRect(cx - 14 * s, cy + 1 * s, 5 * s, 7 * s);
  ctx.fillStyle = "#ffaa00";
  ctx.fillRect(cx - 13.5 * s, cy + 2 * s, 2 * s, 0.6 * s);
  // Ammo belt feed
  ctx.strokeStyle = "#8a7a40";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 11 * s, cy + 1 * s);
  ctx.quadraticCurveTo(cx - 6 * s, cy - 6 * s, cx, cy - 9 * s);
  ctx.stroke();

  // Turret dome (reinforced, chrome)
  ctx.fillStyle = "#2d2d35";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3a45";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Chrome turret ring
  ctx.strokeStyle = "#6a7080";
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 9 * s, 9 * s, 4.5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Gatling barrel assembly
  ctx.save();
  ctx.translate(cx + 2 * s, cy - 10 * s);
  ctx.rotate(-0.25);

  // Barrel mount
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(0, 0, 5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main barrel housing
  const barrelGrad = ctx.createLinearGradient(0, -5 * s, 0, 5 * s);
  barrelGrad.addColorStop(0, "#4a4a55");
  barrelGrad.addColorStop(0.3, "#3a3a45");
  barrelGrad.addColorStop(0.7, "#2a2a35");
  barrelGrad.addColorStop(1, "#1a1a25");
  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(0, -4.5 * s);
  ctx.lineTo(22 * s, -3.5 * s);
  ctx.lineTo(22 * s, 3.5 * s);
  ctx.lineTo(0, 4.5 * s);
  ctx.closePath();
  ctx.fill();

  // Individual barrels (6 visible rotating)
  const barrelSpin = animated ? t * 8 : 0;
  for (let i = 0; i < 6; i++) {
    const angle = barrelSpin + (i * Math.PI) / 3;
    const bOff = Math.sin(angle) * 1.8 * s;
    ctx.fillStyle = i % 2 === 0 ? "#55556a" : "#48485e";
    ctx.fillRect(3 * s, -1.2 * s + bOff * 0.3, 19 * s, 1 * s);
  }

  // Reinforcement rings (chrome)
  ctx.fillStyle = "#6a7080";
  ctx.fillRect(5 * s, -5 * s, 3 * s, 10 * s);
  ctx.fillRect(12 * s, -4.5 * s, 2.5 * s, 9 * s);
  ctx.fillRect(18 * s, -4 * s, 2 * s, 8 * s);

  // Muzzle brake
  ctx.fillStyle = "#3a3a45";
  ctx.fillRect(21 * s, -4.5 * s, 4 * s, 9 * s);
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.ellipse(25 * s, 0, 3.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Muzzle flash
  if (animated) {
    const flash = 0.3 + Math.sin(t * 15) * 0.3;
    ctx.fillStyle = `rgba(255, 220, 100, ${flash})`;
    ctx.shadowColor = "#ffdd44";
    ctx.shadowBlur = 12 * s;
    ctx.beginPath();
    ctx.arc(26 * s, 0, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Brass casings ejecting
  if (animated) {
    for (let i = 0; i < 4; i++) {
      const casingY = cy + ((t * 8 + i * 4) % 14) * s;
      const casingX = cx + 8 * s + Math.sin(t + i) * 2 * s;
      const casingA = Math.max(0, 1 - ((t * 8 + i * 4) % 14) / 14);
      ctx.fillStyle = `rgba(200, 170, 60, ${casingA * 0.8})`;
      ctx.fillRect(casingX, casingY, 1.5 * s, 0.8 * s);
    }
  }

  // Antenna with red targeting LED
  ctx.fillStyle = "#2a2a2f";
  ctx.fillRect(cx - 1 * s, cy - 18 * s, 2 * s, 6 * s);
  ctx.fillStyle = "#ff3333";
  ctx.shadowColor = "#ff3333";
  ctx.shadowBlur = 4 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 19 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#8ab4dc", "A");
}

// ═════════════════════════════════════════════════════════════════════
// CANNON 4B: FLAMETHROWER
// Fire-projecting bunker with fuel tank and scorched ground
// ═════════════════════════════════════════════════════════════════════

export function drawCannonFlamethrower(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s);

  // Scorched ground ring
  const scorch = animated ? 0.3 + Math.sin(t * 2) * 0.1 : 0.35;
  ctx.fillStyle = `rgba(60, 30, 0, ${scorch})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 16 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  drawHexPlatform(ctx, cx, cy, s, 18, 16, 12, "#3a3535", "#4a4545");

  // Back face
  ctx.fillStyle = "#221818";
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy + 10 * s);
  ctx.lineTo(cx - 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 14 * s, cy + 10 * s);
  ctx.closePath();
  ctx.fill();

  // Left face with gradient (heat-darkened)
  const lGrad = ctx.createLinearGradient(cx - 14 * s, cy, cx - 2 * s, cy);
  lGrad.addColorStop(0, "#1e1515");
  lGrad.addColorStop(1, "#2e2222");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy + 10 * s);
  ctx.lineTo(cx - 12 * s, cy - 6 * s);
  ctx.lineTo(cx - 2 * s, cy - 2 * s);
  ctx.lineTo(cx - 2 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Right face with gradient
  const rGrad = ctx.createLinearGradient(cx + 2 * s, cy, cx + 14 * s, cy);
  rGrad.addColorStop(0, "#2e2222");
  rGrad.addColorStop(1, "#3e3232");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 14 * s, cy + 10 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 2 * s, cy - 2 * s);
  ctx.lineTo(cx + 2 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = "#2d2020";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy - 6 * s);
  ctx.lineTo(cx - 2 * s, cy - 10 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s);
  ctx.lineTo(cx + 2 * s, cy - 2 * s);
  ctx.closePath();
  ctx.fill();

  // Panel lines
  drawPanelLines(ctx, cx, cy, s, "#1a0a0a", [
    [-10, -4, -8, 8], [10, -4, 8, 8],
  ]);

  // Orange glowing vents (intense heat)
  const vGlow = animated ? 0.7 + Math.sin(t * 5) * 0.3 : 0.8;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(cx - 11 * s, cy - 2 * s, 4 * s, 10 * s);
  ctx.fillStyle = `rgba(255, 100, 20, ${vGlow})`;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 8 * s;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(cx - 10.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(cx + 7 * s, cy - 2 * s, 4 * s, 10 * s);
  ctx.fillStyle = `rgba(255, 100, 20, ${vGlow})`;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 8 * s;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(cx + 7.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
  }
  ctx.shadowBlur = 0;

  // Fuel tank (cylindrical, on left side of bunker)
  const tankGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx - 4 * s, cy);
  tankGrad.addColorStop(0, "#6a1818");
  tankGrad.addColorStop(0.5, "#8a2828");
  tankGrad.addColorStop(1, "#6a1818");
  ctx.fillStyle = tankGrad;
  ctx.beginPath();
  ctx.ellipse(cx - 8 * s, cy + 3 * s, 3.5 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a0808";
  ctx.lineWidth = 0.5 * s;
  ctx.stroke();
  // Tank bands
  ctx.strokeStyle = "#5a1010";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.ellipse(cx - 8 * s, cy - 1 * s, 3.5 * s, 0.8 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx - 8 * s, cy + 7 * s, 3.5 * s, 0.8 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Fuel gauge
  ctx.fillStyle = "#ff6600";
  ctx.fillRect(cx - 10 * s, cy + 1 * s, 1 * s, 5 * s);
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(cx - 10 * s, cy + 1 * s, 1 * s, 2 * s);

  // Fuel line
  ctx.strokeStyle = "#5a3030";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, cy - 2 * s);
  ctx.quadraticCurveTo(cx, cy - 8 * s, cx + 4 * s, cy - 10 * s);
  ctx.stroke();

  // Turret dome
  ctx.fillStyle = "#2d2020";
  ctx.beginPath();
  ctx.ellipse(cx + 1 * s, cy - 8 * s, 9 * s, 4.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#382828";
  ctx.beginPath();
  ctx.ellipse(cx + 1 * s, cy - 10 * s, 7 * s, 3.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flame nozzle
  ctx.save();
  ctx.translate(cx + 3 * s, cy - 10 * s);
  ctx.rotate(-0.2);

  // Barrel mount
  ctx.fillStyle = "#2a2020";
  ctx.beginPath();
  ctx.ellipse(0, 0, 4 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Short wide nozzle body
  const nozzleGrad = ctx.createLinearGradient(0, -5 * s, 0, 5 * s);
  nozzleGrad.addColorStop(0, "#3a2828");
  nozzleGrad.addColorStop(0.5, "#2a1818");
  nozzleGrad.addColorStop(1, "#1a0a0a");
  ctx.fillStyle = nozzleGrad;
  ctx.beginPath();
  ctx.moveTo(0, -3.5 * s);
  ctx.lineTo(14 * s, -5 * s);
  ctx.lineTo(14 * s, 5 * s);
  ctx.lineTo(0, 3.5 * s);
  ctx.closePath();
  ctx.fill();

  // Flared nozzle bell
  ctx.fillStyle = "#3a2a2a";
  ctx.beginPath();
  ctx.moveTo(13 * s, -5 * s);
  ctx.lineTo(18 * s, -7 * s);
  ctx.lineTo(18 * s, 7 * s);
  ctx.lineTo(13 * s, 5 * s);
  ctx.closePath();
  ctx.fill();

  // Heat glow at nozzle
  ctx.fillStyle = `rgba(255, 140, 20, ${vGlow})`;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 10 * s;
  ctx.beginPath();
  ctx.ellipse(18 * s, 0, 3 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flame stream
  if (animated) {
    for (let i = 0; i < 7; i++) {
      const fx = 18 * s + i * 2.5 * s;
      const fy = Math.sin(t * 12 + i * 0.8) * (1 + i * 0.6) * s;
      const fSize = (4 + i * 0.5) * s;
      const fAlpha = Math.max(0, 0.85 - i * 0.1);
      const g = Math.max(0, 200 - i * 25);
      const b = Math.max(0, 60 - i * 8);
      ctx.fillStyle = `rgba(255, ${g}, ${b}, ${fAlpha})`;
      ctx.beginPath();
      ctx.ellipse(fx, fy, fSize * 0.6, fSize * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Heat shimmer above
  if (animated) {
    ctx.strokeStyle = `rgba(255, 80, 0, ${0.15 + Math.sin(t * 3) * 0.1})`;
    ctx.lineWidth = 0.8 * s;
    for (let i = 0; i < 3; i++) {
      const hy = cy - 14 * s - i * 3 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 4 * s, hy);
      ctx.quadraticCurveTo(cx, hy - 1.5 * s, cx + 4 * s, hy);
      ctx.stroke();
    }
  }

  // Antenna
  ctx.fillStyle = "#2a2020";
  ctx.fillRect(cx - 1 * s, cy - 18 * s, 2 * s, 6 * s);
  ctx.fillStyle = "#ff6600";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 4 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 19 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ff6600", "B");
}

// ═════════════════════════════════════════════════════════════════════
// LIBRARY 4A: EQ SMASHER
// Earth-toned gothic tower with seismic piston
// ═════════════════════════════════════════════════════════════════════

export function drawLibraryEQSmasher(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 16, 7);

  // Seismic ground cracks + expanding rings (below platform)
  if (animated) {
    for (let i = 0; i < 3; i++) {
      const rr = (6 + ((t * 6 + i * 5) % 16)) * s;
      const rAlpha = Math.max(0, 0.6 - ((t * 6 + i * 5) % 16) / 16);
      ctx.strokeStyle = `rgba(180, 130, 40, ${rAlpha})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 16 * s, rr, rr * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(160, 120, 40, ${0.3 + Math.sin(t * 3) * 0.15})`;
    ctx.lineWidth = 0.8 * s;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 + 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16 * s);
      ctx.lineTo(cx + Math.cos(a) * 14 * s, cy + 16 * s + Math.sin(a) * 5 * s);
      ctx.stroke();
    }
  }

  drawHexPlatform(ctx, cx, cy, s, 16, 17, 14, "#5a4a30", "#6a5a40");

  // Tower body - amber/brown earth tones with gradients
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#3a2a15");
  lGrad.addColorStop(1, "#4a3a25");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s);
  ctx.lineTo(cx - 10 * s, cy - 8 * s);
  ctx.lineTo(cx, cy - 4 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();

  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#4a3a25");
  rGrad.addColorStop(1, "#5a4a35");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s);
  ctx.lineTo(cx + 10 * s, cy - 8 * s);
  ctx.lineTo(cx, cy - 4 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();

  // Stone block pattern
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5 * s;
  for (let row = 0; row < 5; row++) {
    const y = cy + 10 * s - row * 4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 11 * s + row * 0.5 * s, y); ctx.lineTo(cx - 1 * s, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 1 * s, y); ctx.lineTo(cx + 11 * s - row * 0.5 * s, y); ctx.stroke();
  }

  // Seismic stress cracks on walls (amber glow)
  ctx.strokeStyle = `rgba(200, 150, 50, ${animated ? 0.3 + Math.sin(t * 4) * 0.15 : 0.35})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath(); ctx.moveTo(cx - 8 * s, cy + 2 * s); ctx.lineTo(cx - 5 * s, cy - 1 * s); ctx.lineTo(cx - 3 * s, cy + 3 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 6 * s, cy + 5 * s); ctx.lineTo(cx + 8 * s, cy + 1 * s); ctx.stroke();

  // Gold trim bands
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(cx - 11 * s, cy + 8 * s, 10 * s, 1.5 * s);
  ctx.fillRect(cx + 1 * s, cy + 8 * s, 10 * s, 1.5 * s);
  ctx.fillRect(cx - 10 * s, cy - 2 * s, 9 * s, 1.5 * s);
  ctx.fillRect(cx + 1 * s, cy - 2 * s, 9 * s, 1.5 * s);

  // Amber arched windows
  const glow = (animated ? 0.7 + Math.sin(t * 2) * 0.2 : 0.8);
  for (const wx of [-7, 7]) {
    ctx.fillStyle = "#1a1510";
    ctx.beginPath();
    ctx.moveTo(cx + (wx - 2) * s, cy + 6 * s);
    ctx.lineTo(cx + (wx - 2) * s, cy + 2 * s);
    ctx.arc(cx + wx * s, cy + 2 * s, 2 * s, Math.PI, 0);
    ctx.lineTo(cx + (wx + 2) * s, cy + 6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 160, 40, ${glow})`;
    ctx.shadowColor = "#ff8c28";
    ctx.shadowBlur = 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx + (wx - 1.5) * s, cy + 5.5 * s);
    ctx.lineTo(cx + (wx - 1.5) * s, cy + 2.5 * s);
    ctx.arc(cx + wx * s, cy + 2.5 * s, 1.5 * s, Math.PI, 0);
    ctx.lineTo(cx + (wx + 1.5) * s, cy + 5.5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Rose window with amber glow
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.arc(cx, cy - 5 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  const roseGrad = ctx.createRadialGradient(cx, cy - 5 * s, 0, cx, cy - 5 * s, 3.5 * s);
  roseGrad.addColorStop(0, `rgba(255, 200, 80, ${glow})`);
  roseGrad.addColorStop(0.6, `rgba(200, 140, 30, ${glow * 0.7})`);
  roseGrad.addColorStop(1, `rgba(120, 80, 10, ${glow * 0.3})`);
  ctx.fillStyle = roseGrad;
  ctx.shadowColor = "#ff8c28";
  ctx.shadowBlur = 10 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 5 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Rose window spokes
  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5 * s);
    ctx.lineTo(cx + Math.cos(a) * 3 * s, cy - 5 * s + Math.sin(a) * 3 * s);
    ctx.stroke();
  }

  // Tower roof
  ctx.fillStyle = "#3a2a15";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 8 * s);
  ctx.lineTo(cx - 8 * s, cy - 12 * s);
  ctx.lineTo(cx + 8 * s, cy - 12 * s);
  ctx.lineTo(cx + 10 * s, cy - 8 * s);
  ctx.closePath();
  ctx.fill();

  // Seismic piston housing
  ctx.fillStyle = "#5a4a30";
  ctx.fillRect(cx - 4 * s, cy - 18 * s, 8 * s, 6 * s);
  ctx.fillStyle = "#6a5a40";
  ctx.fillRect(cx - 3 * s, cy - 20 * s, 6 * s, 2 * s);
  // Piston shaft (animated pumping)
  const pistonY = animated ? Math.sin(t * 6) * 2 : 0;
  ctx.fillStyle = "#8a7a50";
  ctx.fillRect(cx - 1.5 * s, cy - 22 * s + pistonY * s, 3 * s, 4 * s);
  // Piston head with glow
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 8 * s;
  ctx.fillRect(cx - 3 * s, cy - 22 * s + pistonY * s, 6 * s, 2 * s);
  ctx.shadowBlur = 0;

  // Corner buttresses
  ctx.fillStyle = "#3a2a15";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s); ctx.lineTo(cx - 14 * s, cy + 8 * s);
  ctx.lineTo(cx - 12 * s, cy - 6 * s); ctx.lineTo(cx - 10 * s, cy - 8 * s);
  ctx.lineTo(cx - 10 * s, cy + 10 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#5a4a35";
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s); ctx.lineTo(cx + 14 * s, cy + 8 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s); ctx.lineTo(cx + 10 * s, cy - 8 * s);
  ctx.lineTo(cx + 10 * s, cy + 10 * s); ctx.closePath(); ctx.fill();

  // Rock debris at base
  ctx.fillStyle = "#7a6a50";
  for (const [dx, dy] of [[-10, 16], [8, 15], [-5, 17], [12, 16]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy + dy * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Entrance door
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, cy + 16 * s); ctx.lineTo(cx - 3 * s, cy + 11 * s);
  ctx.arc(cx, cy + 11 * s, 3 * s, Math.PI, 0);
  ctx.lineTo(cx + 3 * s, cy + 16 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(255, 160, 40, ${glow * 0.5})`;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, cy + 15 * s); ctx.lineTo(cx - 2 * s, cy + 12 * s);
  ctx.arc(cx, cy + 12 * s, 2 * s, Math.PI, 0);
  ctx.lineTo(cx + 2 * s, cy + 15 * s); ctx.closePath(); ctx.fill();

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ff8c28", "A");
}

// ═════════════════════════════════════════════════════════════════════
// LIBRARY 4B: BLIZZARD
// Ice-blue gothic tower with crystal spire and frost effects
// ═════════════════════════════════════════════════════════════════════

export function drawLibraryBlizzard(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 16, 7);

  // Frozen ground
  const frostA = animated ? 0.25 + Math.sin(t * 1.5) * 0.1 : 0.3;
  ctx.fillStyle = `rgba(180, 220, 255, ${frostA})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 16 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  drawHexPlatform(ctx, cx, cy, s, 16, 17, 14, "#3a4a5a", "#4a5a6a");

  // Tower body - ice blue gradients
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#253545");
  lGrad.addColorStop(1, "#354555");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s);
  ctx.lineTo(cx - 10 * s, cy - 8 * s);
  ctx.lineTo(cx, cy - 4 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#354555");
  rGrad.addColorStop(1, "#455565");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s);
  ctx.lineTo(cx + 10 * s, cy - 8 * s);
  ctx.lineTo(cx, cy - 4 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();

  // Stone block pattern with frost highlights
  ctx.strokeStyle = "rgba(180, 220, 255, 0.1)";
  ctx.lineWidth = 0.5 * s;
  for (let row = 0; row < 5; row++) {
    const y = cy + 10 * s - row * 4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 11 * s + row * 0.5 * s, y); ctx.lineTo(cx - 1 * s, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 1 * s, y); ctx.lineTo(cx + 11 * s - row * 0.5 * s, y); ctx.stroke();
  }

  // Frost vein patterns
  ctx.strokeStyle = "rgba(180, 220, 255, 0.2)";
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 4; i++) {
    const fy = cy + 8 * s - i * 4 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 9 * s, fy);
    ctx.lineTo(cx - 7 * s, fy - 1 * s);
    ctx.lineTo(cx - 5 * s, fy + 0.5 * s);
    ctx.lineTo(cx - 4 * s, fy - 0.5 * s);
    ctx.stroke();
  }

  // Ice blue trim
  ctx.fillStyle = "#6aa0cc";
  ctx.fillRect(cx - 11 * s, cy + 8 * s, 10 * s, 1.5 * s);
  ctx.fillRect(cx + 1 * s, cy + 8 * s, 10 * s, 1.5 * s);
  ctx.fillRect(cx - 10 * s, cy - 2 * s, 9 * s, 1.5 * s);
  ctx.fillRect(cx + 1 * s, cy - 2 * s, 9 * s, 1.5 * s);

  // Ice blue arched windows
  const glow = animated ? 0.7 + Math.sin(t * 2) * 0.2 : 0.8;
  for (const wx of [-7, 7]) {
    ctx.fillStyle = "#0a1520";
    ctx.beginPath();
    ctx.moveTo(cx + (wx - 2) * s, cy + 6 * s);
    ctx.lineTo(cx + (wx - 2) * s, cy + 2 * s);
    ctx.arc(cx + wx * s, cy + 2 * s, 2 * s, Math.PI, 0);
    ctx.lineTo(cx + (wx + 2) * s, cy + 6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(100, 200, 255, ${glow})`;
    ctx.shadowColor = "#64c8ff";
    ctx.shadowBlur = 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx + (wx - 1.5) * s, cy + 5.5 * s);
    ctx.lineTo(cx + (wx - 1.5) * s, cy + 2.5 * s);
    ctx.arc(cx + wx * s, cy + 2.5 * s, 1.5 * s, Math.PI, 0);
    ctx.lineTo(cx + (wx + 1.5) * s, cy + 5.5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Rose window - ice crystal
  ctx.fillStyle = "#0a1520";
  ctx.beginPath();
  ctx.arc(cx, cy - 5 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  const iceGrad = ctx.createRadialGradient(cx, cy - 5 * s, 0, cx, cy - 5 * s, 3.5 * s);
  iceGrad.addColorStop(0, `rgba(200, 240, 255, ${glow})`);
  iceGrad.addColorStop(0.5, `rgba(100, 200, 255, ${glow * 0.8})`);
  iceGrad.addColorStop(1, `rgba(40, 120, 200, ${glow * 0.4})`);
  ctx.fillStyle = iceGrad;
  ctx.shadowColor = "#64c8ff";
  ctx.shadowBlur = 10 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 5 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Crystal spokes (6-fold symmetry for snowflake)
  ctx.strokeStyle = "#aadcff";
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5 * s);
    ctx.lineTo(cx + Math.cos(a) * 3 * s, cy - 5 * s + Math.sin(a) * 3 * s);
    ctx.stroke();
    // Branch arms
    const bx = cx + Math.cos(a) * 2 * s;
    const by = cy - 5 * s + Math.sin(a) * 2 * s;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a + 0.5) * 1 * s, by + Math.sin(a + 0.5) * 1 * s);
    ctx.stroke();
  }

  // Roof
  ctx.fillStyle = "#253545";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 8 * s);
  ctx.lineTo(cx - 8 * s, cy - 12 * s);
  ctx.lineTo(cx + 8 * s, cy - 12 * s);
  ctx.lineTo(cx + 10 * s, cy - 8 * s);
  ctx.closePath();
  ctx.fill();

  // Icicles hanging from roof
  for (const ix of [-9, -5, -1, 3, 7]) {
    const icicleLen = 2 + Math.abs(ix % 3) * s;
    ctx.fillStyle = `rgba(170, 220, 255, ${0.7 + Math.abs(ix % 2) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(cx + ix * s - 0.6 * s, cy - 8 * s);
    ctx.lineTo(cx + ix * s + 0.6 * s, cy - 8 * s);
    ctx.lineTo(cx + ix * s, cy - 8 * s + icicleLen);
    ctx.closePath();
    ctx.fill();
  }

  // Ice crystal spire
  ctx.fillStyle = "#5aa0cc";
  ctx.beginPath();
  ctx.moveTo(cx - 5 * s, cy - 12 * s);
  ctx.lineTo(cx, cy - 22 * s);
  ctx.lineTo(cx + 5 * s, cy - 12 * s);
  ctx.closePath();
  ctx.fill();
  // Lighter right facet
  ctx.fillStyle = "#7ac0dd";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 22 * s);
  ctx.lineTo(cx + 5 * s, cy - 12 * s);
  ctx.lineTo(cx + 2 * s, cy - 12 * s);
  ctx.lineTo(cx, cy - 18 * s);
  ctx.closePath();
  ctx.fill();
  // Crystal facet lines
  ctx.strokeStyle = "rgba(200, 240, 255, 0.35)";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath(); ctx.moveTo(cx - 3 * s, cy - 14 * s); ctx.lineTo(cx + 2 * s, cy - 16 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 1 * s, cy - 12 * s); ctx.lineTo(cx + 3 * s, cy - 14 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 2 * s, cy - 17 * s); ctx.lineTo(cx + 1 * s, cy - 19 * s); ctx.stroke();

  // Top ice orb
  ctx.fillStyle = `rgba(180, 230, 255, ${glow})`;
  ctx.shadowColor = "#aadcff";
  ctx.shadowBlur = 10 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 22 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy - 22 * s, 1.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Buttresses with frost coating
  ctx.fillStyle = "#253545";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s); ctx.lineTo(cx - 14 * s, cy + 8 * s);
  ctx.lineTo(cx - 12 * s, cy - 6 * s); ctx.lineTo(cx - 10 * s, cy - 8 * s);
  ctx.lineTo(cx - 10 * s, cy + 10 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a5565";
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s); ctx.lineTo(cx + 14 * s, cy + 8 * s);
  ctx.lineTo(cx + 12 * s, cy - 6 * s); ctx.lineTo(cx + 10 * s, cy - 8 * s);
  ctx.lineTo(cx + 10 * s, cy + 10 * s); ctx.closePath(); ctx.fill();

  // Entrance door with frost glow
  ctx.fillStyle = "#0a1520";
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, cy + 16 * s); ctx.lineTo(cx - 3 * s, cy + 11 * s);
  ctx.arc(cx, cy + 11 * s, 3 * s, Math.PI, 0);
  ctx.lineTo(cx + 3 * s, cy + 16 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(100, 200, 255, ${glow * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, cy + 15 * s); ctx.lineTo(cx - 2 * s, cy + 12 * s);
  ctx.arc(cx, cy + 12 * s, 2 * s, Math.PI, 0);
  ctx.lineTo(cx + 2 * s, cy + 15 * s); ctx.closePath(); ctx.fill();

  // Snowflake particles
  if (animated) {
    ctx.fillStyle = `rgba(200, 240, 255, ${0.5 + Math.sin(t * 2) * 0.3})`;
    for (let i = 0; i < 8; i++) {
      const sa = t * 0.8 + (i * Math.PI * 2) / 8;
      const sr = (8 + Math.sin(t + i) * 3) * s;
      const sx = cx + Math.cos(sa) * sr;
      const sy = cy - 5 * s + Math.sin(sa) * sr * 0.4;
      drawStar(ctx, sx, sy, 1.2 * s, 0.4 * s);
    }
  }

  drawLevelIndicator(ctx, cx, cy, s, 4, "#64b4ff", "B");
}

// ═════════════════════════════════════════════════════════════════════
// LAB 4A: FOCUSED BEAM
// Blue-gray industrial building with red laser emitter
// ═════════════════════════════════════════════════════════════════════

export function drawLabFocusedBeam(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 16, 7);
  drawHexPlatform(ctx, cx, cy, s, 16, 17, 14, "#3a4550", "#4a5560");

  // Building body - blue-gray industrial (matching base lab)
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#2a3a45");
  lGrad.addColorStop(1, "#3a4a55");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s);
  ctx.lineTo(cx - 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#3a4a55");
  rGrad.addColorStop(1, "#4a5a65");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s);
  ctx.lineTo(cx + 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  // Top face
  ctx.fillStyle = "#4a5a65";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy - 6 * s);
  ctx.lineTo(cx + 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Industrial panel lines
  ctx.strokeStyle = "#1a2a35";
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(cx - 10 * s + i * 3 * s, cy + 10 * s); ctx.lineTo(cx - 9 * s + i * 3 * s, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 4 * s + i * 3 * s, cy + 10 * s); ctx.lineTo(cx + 3 * s + i * 3 * s, cy); ctx.stroke();
  }

  // RED glowing windows (laser-themed)
  const labGlow = animated ? 0.6 + Math.sin(t * 2) * 0.25 : 0.7;
  drawGlowingWindow(ctx, cx - 9 * s, cy + 4 * s, 5, 5, s, "#0a1520", "255, 60, 60", "#ff3030", labGlow);
  drawGlowingWindow(ctx, cx + 4 * s, cy + 4 * s, 5, 5, s, "#0a1520", "255, 60, 60", "#ff3030", labGlow);

  // Ventilation unit on top
  ctx.fillStyle = "#3a4a55";
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, cy - 4 * s);
  ctx.lineTo(cx - 5 * s, cy - 8 * s);
  ctx.lineTo(cx + 5 * s, cy - 8 * s);
  ctx.lineTo(cx + 6 * s, cy - 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a2a35";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(cx - 4 * s + i * 3 * s, cy - 7 * s, 2 * s, 2 * s);
  }

  // Laser emitter tower (red-accented)
  ctx.fillStyle = "#2a3a45";
  ctx.fillRect(cx - 2 * s, cy - 17 * s, 4 * s, 9 * s);
  ctx.fillStyle = "#3a4a55";
  ctx.fillRect(cx, cy - 17 * s, 2 * s, 9 * s);

  // Focusing rings (copper with red glow)
  for (let i = 0; i < 5; i++) {
    const ringY = cy - 7 * s - i * 2.5 * s;
    const rr = (5.5 - i * 0.4) * s;
    ctx.strokeStyle = i % 2 === 0 ? "#b8860b" : "#8a6020";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(cx, ringY, rr, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Laser emitter orb at top
  const orbY = cy - 19 * s;
  const beamPulse = animated ? 0.7 + Math.sin(t * 4) * 0.3 : 0.8;
  const emitGrad = ctx.createRadialGradient(cx, orbY, 0, cx, orbY, 7 * s);
  emitGrad.addColorStop(0, `rgba(255, 80, 80, ${beamPulse})`);
  emitGrad.addColorStop(0.4, `rgba(255, 30, 30, ${beamPulse * 0.6})`);
  emitGrad.addColorStop(1, "rgba(200, 0, 0, 0)");
  ctx.fillStyle = emitGrad;
  ctx.beginPath();
  ctx.arc(cx, orbY, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  // Core
  ctx.fillStyle = "#ff4040";
  ctx.shadowColor = "#ff2020";
  ctx.shadowBlur = 15 * s;
  ctx.beginPath();
  ctx.arc(cx, orbY, 4.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, orbY, 2.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Targeting reticle
  ctx.strokeStyle = `rgba(255, 80, 80, ${beamPulse * 0.5})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.arc(cx, orbY, 6 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 8 * s, orbY); ctx.lineTo(cx - 5 * s, orbY);
  ctx.moveTo(cx + 5 * s, orbY); ctx.lineTo(cx + 8 * s, orbY);
  ctx.moveTo(cx, orbY - 8 * s); ctx.lineTo(cx, orbY - 5 * s);
  ctx.moveTo(cx, orbY + 5 * s); ctx.lineTo(cx, orbY + 8 * s);
  ctx.stroke();

  // Beam extending upward
  if (animated) {
    const bA = 0.3 + Math.sin(t * 5) * 0.2;
    ctx.strokeStyle = `rgba(255, 50, 50, ${bA})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, orbY); ctx.lineTo(cx, orbY - 10 * s); ctx.stroke();
    ctx.strokeStyle = `rgba(255, 100, 100, ${bA * 0.4})`;
    ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(cx, orbY); ctx.lineTo(cx, orbY - 10 * s); ctx.stroke();
  }

  // Pipe/conduit details
  ctx.strokeStyle = "#3a4a55";
  ctx.lineWidth = 1 * s;
  ctx.beginPath(); ctx.moveTo(cx - 2 * s, cy - 4.5 * s); ctx.lineTo(cx - 6 * s, cy + 2 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 2 * s, cy - 4.5 * s); ctx.lineTo(cx + 6 * s, cy + 2 * s); ctx.stroke();

  // Engineering emblem
  ctx.fillStyle = "#ff4040";
  ctx.shadowColor = "#ff4040";
  ctx.shadowBlur = 4 * s;
  ctx.beginPath();
  ctx.arc(cx, cy + 10 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a3a45";
  ctx.beginPath();
  ctx.arc(cx, cy + 10 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ff5050", "A");
}

// ═════════════════════════════════════════════════════════════════════
// LAB 4B: CHAIN LIGHTNING
// Blue-gray industrial building with gold multi-node Tesla system
// ═════════════════════════════════════════════════════════════════════

export function drawLabChainLightning(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 16, 7);
  drawHexPlatform(ctx, cx, cy, s, 16, 17, 14, "#3a4550", "#4a5560");

  // Building body - blue-gray industrial (matching base lab)
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#2a3a45");
  lGrad.addColorStop(1, "#3a4a55");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s);
  ctx.lineTo(cx - 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#3a4a55");
  rGrad.addColorStop(1, "#4a5a65");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s);
  ctx.lineTo(cx + 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a5a65";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy - 6 * s);
  ctx.lineTo(cx + 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Industrial panel lines
  ctx.strokeStyle = "#1a2a35";
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(cx - 10 * s + i * 3 * s, cy + 10 * s); ctx.lineTo(cx - 9 * s + i * 3 * s, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 4 * s + i * 3 * s, cy + 10 * s); ctx.lineTo(cx + 3 * s + i * 3 * s, cy); ctx.stroke();
  }

  // GOLD/YELLOW glowing windows (chain lightning energy)
  const labGlow = animated ? 0.6 + Math.sin(t * 2) * 0.25 : 0.7;
  drawGlowingWindow(ctx, cx - 9 * s, cy + 4 * s, 5, 5, s, "#0a1520", "255, 220, 50", "#ffdd44", labGlow);
  drawGlowingWindow(ctx, cx + 4 * s, cy + 4 * s, 5, 5, s, "#0a1520", "255, 220, 50", "#ffdd44", labGlow);

  // Ventilation unit
  ctx.fillStyle = "#3a4a55";
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, cy - 4 * s);
  ctx.lineTo(cx - 5 * s, cy - 8 * s);
  ctx.lineTo(cx + 5 * s, cy - 8 * s);
  ctx.lineTo(cx + 6 * s, cy - 4 * s);
  ctx.closePath();
  ctx.fill();

  // Main Tesla coil tower
  ctx.fillStyle = "#2a3a45";
  ctx.fillRect(cx - 2 * s, cy - 17 * s, 4 * s, 9 * s);
  ctx.fillStyle = "#3a4a55";
  ctx.fillRect(cx, cy - 17 * s, 2 * s, 9 * s);

  // Coil rings (gold - more rings for chain lightning)
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4.5 * s, 6 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const ringY = cy - 7 * s - i * 2 * s;
    const ringW = (5.5 - i * 0.4) * s;
    ctx.beginPath();
    ctx.ellipse(cx, ringY, ringW, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Main orb (golden-yellow)
  const orbY = cy - 19 * s;
  const orbPulse = animated ? 1 + Math.sin(t * 3) * 0.15 : 1;
  const mainGrad = ctx.createRadialGradient(cx, orbY, 0, cx, orbY, 7 * s * orbPulse);
  mainGrad.addColorStop(0, `rgba(255, 240, 100, ${labGlow})`);
  mainGrad.addColorStop(0.4, `rgba(255, 200, 30, ${labGlow * 0.6})`);
  mainGrad.addColorStop(1, "rgba(200, 150, 0, 0)");
  ctx.fillStyle = mainGrad;
  ctx.beginPath();
  ctx.arc(cx, orbY, 7 * s * orbPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffee44";
  ctx.shadowColor = "#ffee44";
  ctx.shadowBlur = 12 * s;
  ctx.beginPath();
  ctx.arc(cx, orbY, 4.5 * s * orbPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, orbY, 2.2 * s * orbPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Satellite orbs on arms
  const satPositions = [
    { x: cx - 12 * s, y: cy - 8 * s },
    { x: cx + 12 * s, y: cy - 8 * s },
    { x: cx, y: cy - 2 * s },
  ];
  for (let si = 0; si < satPositions.length; si++) {
    const sat = satPositions[si];
    // Arm
    ctx.strokeStyle = "#4a5a65";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6 * s);
    ctx.lineTo(sat.x, sat.y);
    ctx.stroke();
    // Mini coil ring
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.ellipse(sat.x, sat.y + 1 * s, 3 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Satellite orb
    const sPulse = animated ? 0.7 + Math.sin(t * 4 + si) * 0.3 : 0.8;
    ctx.fillStyle = `rgba(255, 220, 60, ${sPulse})`;
    ctx.shadowColor = "#ffdd44";
    ctx.shadowBlur = 8 * s;
    ctx.beginPath();
    ctx.arc(sat.x, sat.y, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sat.x, sat.y, 1 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Lightning chain to main orb
    if (animated) {
      ctx.strokeStyle = `rgba(255, 240, 80, ${0.5 + Math.sin(t * 6 + si) * 0.3})`;
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.moveTo(sat.x, sat.y);
      let ax = sat.x, ay = sat.y;
      for (let j = 0; j < 4; j++) {
        ax += (cx - sat.x) / 4 + Math.sin(t * 10 + si + j) * 2 * s;
        ay += (orbY - sat.y) / 4 + Math.cos(t * 10 + si + j) * s;
        ctx.lineTo(ax, ay);
      }
      ctx.stroke();
    }
  }

  // Ground electricity
  if (animated) {
    ctx.strokeStyle = `rgba(255, 220, 50, ${0.3 + Math.sin(t * 8) * 0.2})`;
    ctx.lineWidth = 1 * s;
    for (let i = 0; i < 3; i++) {
      const bx = cx - 8 * s + i * 8 * s;
      ctx.beginPath();
      ctx.moveTo(bx, cy + 12 * s);
      ctx.lineTo(bx + 1.5 * s, cy + 8 * s);
      ctx.lineTo(bx - 0.5 * s, cy + 6 * s);
      ctx.lineTo(bx + 1 * s, cy + 4 * s);
      ctx.stroke();
    }
  }

  // Pipe details
  ctx.strokeStyle = "#3a4a55";
  ctx.lineWidth = 1 * s;
  ctx.beginPath(); ctx.moveTo(cx - 2 * s, cy - 4.5 * s); ctx.lineTo(cx - 6 * s, cy + 2 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 2 * s, cy - 4.5 * s); ctx.lineTo(cx + 6 * s, cy + 2 * s); ctx.stroke();

  // Engineering emblem (gold)
  ctx.fillStyle = "#ffdd44";
  ctx.shadowColor = "#ffdd44";
  ctx.shadowBlur = 4 * s;
  ctx.beginPath();
  ctx.arc(cx, cy + 10 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a3a45";
  ctx.beginPath();
  ctx.arc(cx, cy + 10 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ffdd44", "B");
}

// ═════════════════════════════════════════════════════════════════════
// ARCH 4A: SHOCKWAVE SIREN
// Stone arch with red siren device and shockwave rings
// ═════════════════════════════════════════════════════════════════════

export function drawArchShockwave(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 18, 8);
  drawHexPlatform(ctx, cx, cy, s, 18, 17, 14, "#8a6a50", "#9a7a60");

  // Rune circle on base
  ctx.strokeStyle = "rgba(255, 60, 30, 0.2)";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Arch walls with gradients
  const lGrad = ctx.createLinearGradient(cx - 16 * s, cy, cx - 6 * s, cy);
  lGrad.addColorStop(0, "#6a5040");
  lGrad.addColorStop(1, "#7a6050");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 16 * s, cy + 12 * s); ctx.lineTo(cx - 14 * s, cy - 4 * s);
  ctx.lineTo(cx - 6 * s, cy - 2 * s); ctx.lineTo(cx - 8 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad2 = ctx.createLinearGradient(cx + 6 * s, cy, cx + 16 * s, cy);
  rGrad2.addColorStop(0, "#8a7060");
  rGrad2.addColorStop(1, "#9a8070");
  ctx.fillStyle = rGrad2;
  ctx.beginPath();
  ctx.moveTo(cx + 16 * s, cy + 12 * s); ctx.lineTo(cx + 14 * s, cy - 4 * s);
  ctx.lineTo(cx + 6 * s, cy - 2 * s); ctx.lineTo(cx + 8 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Arch lintel
  ctx.fillStyle = "#8a6a50";
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy - 4 * s); ctx.lineTo(cx - 12 * s, cy - 10 * s);
  ctx.lineTo(cx + 12 * s, cy - 10 * s); ctx.lineTo(cx + 14 * s, cy - 4 * s);
  ctx.lineTo(cx + 6 * s, cy - 2 * s); ctx.lineTo(cx - 6 * s, cy - 2 * s);
  ctx.closePath();
  ctx.fill();
  // Top surface
  ctx.fillStyle = "#9a7a60";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy - 10 * s); ctx.lineTo(cx, cy - 14 * s);
  ctx.lineTo(cx + 12 * s, cy - 10 * s); ctx.closePath();
  ctx.fill();

  // Stone block pattern with red stress cracks
  ctx.strokeStyle = "rgba(255, 60, 30, 0.15)";
  ctx.lineWidth = 0.5 * s;
  for (let row = 0; row < 6; row++) {
    const y = cy + 10 * s - row * 2.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 14 * s + row * s, y); ctx.lineTo(cx - 7 * s, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 7 * s, y); ctx.lineTo(cx + 14 * s - row * s, y); ctx.stroke();
  }

  // Gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath(); ctx.moveTo(cx - 15 * s, cy + 4 * s); ctx.lineTo(cx - 7 * s, cy + 4 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 7 * s, cy + 4 * s); ctx.lineTo(cx + 15 * s, cy + 4 * s); ctx.stroke();

  // Siren device on top
  ctx.fillStyle = "#5a2a20";
  ctx.beginPath();
  ctx.moveTo(cx - 8 * s, cy - 10 * s); ctx.lineTo(cx, cy - 12 * s);
  ctx.lineTo(cx + 8 * s, cy - 10 * s); ctx.closePath();
  ctx.fill();

  // Siren horn bells (curved)
  const sirenPulse = animated ? 0.6 + Math.sin(t * 6) * 0.4 : 0.7;
  for (const dir of [-1, 1]) {
    ctx.fillStyle = "#cc3030";
    ctx.beginPath();
    ctx.moveTo(cx + dir * 3 * s, cy - 13 * s);
    ctx.quadraticCurveTo(cx + dir * 7 * s, cy - 16 * s, cx + dir * 10 * s, cy - 18 * s);
    ctx.lineTo(cx + dir * 8 * s, cy - 19 * s);
    ctx.quadraticCurveTo(cx + dir * 5 * s, cy - 16 * s, cx + dir * 3 * s, cy - 14 * s);
    ctx.closePath();
    ctx.fill();
  }
  // Central siren dome
  ctx.fillStyle = "#aa2020";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 14 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Siren glow
  ctx.fillStyle = `rgba(255, 50, 30, ${sirenPulse})`;
  ctx.shadowColor = "#ff3020";
  ctx.shadowBlur = 12 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 14 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy - 14 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner arch opening
  ctx.fillStyle = "#1a1a10";
  ctx.beginPath();
  ctx.arc(cx, cy, 8 * s, Math.PI, 0);
  ctx.lineTo(cx + 8 * s, cy + 14 * s);
  ctx.lineTo(cx - 8 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // RED portal glow
  const portalGlow = animated ? 0.5 + Math.sin(t * 3) * 0.25 : 0.6;
  const pGrad = ctx.createRadialGradient(cx, cy + 4 * s, 0, cx, cy + 4 * s, 10 * s);
  pGrad.addColorStop(0, `rgba(255, 80, 60, ${portalGlow})`);
  pGrad.addColorStop(0.4, `rgba(200, 30, 20, ${portalGlow * 0.7})`);
  pGrad.addColorStop(0.7, `rgba(120, 15, 5, ${portalGlow * 0.4})`);
  pGrad.addColorStop(1, `rgba(60, 5, 0, ${portalGlow * 0.1})`);
  ctx.fillStyle = pGrad;
  ctx.shadowColor = "#ff3020";
  ctx.shadowBlur = 12 * s;
  ctx.beginPath();
  ctx.arc(cx, cy + 2 * s, 6 * s, Math.PI, 0);
  ctx.lineTo(cx + 6 * s, cy + 12 * s);
  ctx.lineTo(cx - 6 * s, cy + 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Red glowing windows
  for (const wx of [-11.5, 9.5]) {
    ctx.fillStyle = "#1a1a10";
    ctx.fillRect(cx + wx * s - 0.5 * s, cy - 2 * s, 3 * s, 7 * s);
    ctx.fillStyle = `rgba(255, 80, 60, ${portalGlow})`;
    ctx.shadowColor = "#ff3020";
    ctx.shadowBlur = 4 * s;
    ctx.fillRect(cx + wx * s, cy - 1.5 * s, 2 * s, 6 * s);
    ctx.shadowBlur = 0;
  }

  // Expanding shockwave rings
  if (animated) {
    for (let i = 0; i < 3; i++) {
      const rr = (4 + ((t * 8 + i * 5) % 18)) * s;
      const rAlpha = Math.max(0, 0.7 - ((t * 8 + i * 5) % 18) / 18);
      ctx.strokeStyle = `rgba(255, 60, 30, ${rAlpha})`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4 * s, rr, rr * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ff5050", "A");
}

// ═════════════════════════════════════════════════════════════════════
// ARCH 4B: SYMPHONY HALL
// Stone arch with pipe organ and blue musical energy
// ═════════════════════════════════════════════════════════════════════

export function drawArchSymphony(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 18, 8);
  drawHexPlatform(ctx, cx, cy, s, 18, 17, 14, "#8a7a60", "#9a8a70");

  // Rune circle on base (blue)
  ctx.strokeStyle = "rgba(100, 180, 255, 0.2)";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Arch walls
  ctx.fillStyle = "#7a6a50";
  ctx.beginPath();
  ctx.moveTo(cx - 16 * s, cy + 12 * s); ctx.lineTo(cx - 14 * s, cy - 4 * s);
  ctx.lineTo(cx - 6 * s, cy - 2 * s); ctx.lineTo(cx - 8 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#9a8a70";
  ctx.beginPath();
  ctx.moveTo(cx + 16 * s, cy + 12 * s); ctx.lineTo(cx + 14 * s, cy - 4 * s);
  ctx.lineTo(cx + 6 * s, cy - 2 * s); ctx.lineTo(cx + 8 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Arch lintel
  ctx.fillStyle = "#8a7a60";
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy - 4 * s); ctx.lineTo(cx - 12 * s, cy - 10 * s);
  ctx.lineTo(cx + 12 * s, cy - 10 * s); ctx.lineTo(cx + 14 * s, cy - 4 * s);
  ctx.lineTo(cx + 6 * s, cy - 2 * s); ctx.lineTo(cx - 6 * s, cy - 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#9a8a70";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy - 10 * s); ctx.lineTo(cx, cy - 14 * s);
  ctx.lineTo(cx + 12 * s, cy - 10 * s); ctx.closePath();
  ctx.fill();

  // Stone block pattern
  ctx.strokeStyle = "rgba(180, 150, 60, 0.12)";
  ctx.lineWidth = 0.5 * s;
  for (let row = 0; row < 6; row++) {
    const y = cy + 10 * s - row * 2.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 14 * s + row * s, y); ctx.lineTo(cx - 7 * s, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 7 * s, y); ctx.lineTo(cx + 14 * s - row * s, y); ctx.stroke();
  }
  // Gold string course
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * s;
  ctx.beginPath(); ctx.moveTo(cx - 15 * s, cy + 4 * s); ctx.lineTo(cx - 7 * s, cy + 4 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 7 * s, cy + 4 * s); ctx.lineTo(cx + 15 * s, cy + 4 * s); ctx.stroke();

  // Pipe organ on top
  ctx.fillStyle = "#9a8a70";
  ctx.beginPath();
  ctx.moveTo(cx - 8 * s, cy - 10 * s); ctx.lineTo(cx, cy - 12 * s);
  ctx.lineTo(cx + 8 * s, cy - 10 * s); ctx.closePath();
  ctx.fill();

  // Organ pipes (symmetrical, ascending to center)
  const pipes = [-6, -4, -2, 0, 2, 4, 6];
  const pipeH = [5, 7, 9, 12, 9, 7, 5];
  for (let i = 0; i < pipes.length; i++) {
    const px = cx + pipes[i] * s;
    const ph = pipeH[i] * s;
    // Pipe body with gradient
    const pGrad = ctx.createLinearGradient(px - 1 * s, 0, px + 1 * s, 0);
    pGrad.addColorStop(0, "#908870");
    pGrad.addColorStop(0.5, "#b8b090");
    pGrad.addColorStop(1, "#908870");
    ctx.fillStyle = pGrad;
    ctx.fillRect(px - 0.9 * s, cy - 10 * s - ph, 1.8 * s, ph);
    // Pipe top cap
    ctx.fillStyle = "#c8c0a8";
    ctx.beginPath();
    ctx.ellipse(px, cy - 10 * s - ph, 1.1 * s, 0.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blue orb at pipe top
  const orbGlow = animated ? 0.6 + Math.sin(t * 2) * 0.3 : 0.7;
  ctx.fillStyle = `rgba(100, 180, 255, ${orbGlow})`;
  ctx.shadowColor = "#4090ff";
  ctx.shadowBlur = 10 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 22 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy - 22 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner arch opening
  ctx.fillStyle = "#1a1a10";
  ctx.beginPath();
  ctx.arc(cx, cy, 8 * s, Math.PI, 0);
  ctx.lineTo(cx + 8 * s, cy + 14 * s);
  ctx.lineTo(cx - 8 * s, cy + 14 * s);
  ctx.closePath();
  ctx.fill();

  // BLUE portal glow
  const portalGlow = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
  const pgr = ctx.createRadialGradient(cx, cy + 4 * s, 0, cx, cy + 4 * s, 10 * s);
  pgr.addColorStop(0, `rgba(120, 190, 255, ${portalGlow})`);
  pgr.addColorStop(0.4, `rgba(60, 130, 230, ${portalGlow * 0.7})`);
  pgr.addColorStop(0.7, `rgba(30, 80, 180, ${portalGlow * 0.4})`);
  pgr.addColorStop(1, `rgba(10, 40, 120, ${portalGlow * 0.1})`);
  ctx.fillStyle = pgr;
  ctx.shadowColor = "#4090ff";
  ctx.shadowBlur = 12 * s;
  ctx.beginPath();
  ctx.arc(cx, cy + 2 * s, 6 * s, Math.PI, 0);
  ctx.lineTo(cx + 6 * s, cy + 12 * s);
  ctx.lineTo(cx - 6 * s, cy + 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Blue glowing windows
  for (const wx of [-11.5, 9.5]) {
    ctx.fillStyle = "#1a1a10";
    ctx.fillRect(cx + wx * s - 0.5 * s, cy - 2 * s, 3 * s, 7 * s);
    ctx.fillStyle = `rgba(100, 180, 255, ${portalGlow})`;
    ctx.shadowColor = "#4090ff";
    ctx.shadowBlur = 4 * s;
    ctx.fillRect(cx + wx * s, cy - 1.5 * s, 2 * s, 6 * s);
    ctx.shadowBlur = 0;
  }

  // Musical notes + portal swirl
  if (animated) {
    ctx.fillStyle = `rgba(120, 200, 255, ${0.6 + Math.sin(t * 3) * 0.3})`;
    ctx.font = `${4 * s}px serif`;
    ctx.textAlign = "center";
    for (let i = 0; i < 5; i++) {
      const na = t * 1.5 + (i * Math.PI * 2) / 5;
      const nr = (10 + Math.sin(t + i) * 2) * s;
      const nx = cx + Math.cos(na) * nr;
      const ny = cy - 5 * s + Math.sin(na) * nr * 0.4;
      ctx.fillText(i % 3 === 0 ? "♪" : i % 3 === 1 ? "♫" : "♬", nx, ny);
    }
    // Harmonic rings
    for (let i = 0; i < 2; i++) {
      const rr = (5 + ((t * 4 + i * 6) % 12)) * s;
      const rA = Math.max(0, 0.5 - ((t * 4 + i * 6) % 12) / 12);
      ctx.strokeStyle = `rgba(100, 180, 255, ${rA})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4 * s, rr, rr * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Portal swirl
    ctx.strokeStyle = `rgba(150, 210, 255, ${0.3 + Math.sin(t * 3) * 0.15})`;
    ctx.lineWidth = 1.2 * s;
    for (let i = 0; i < 3; i++) {
      const so = t * 2.5 + i * Math.PI * 0.67;
      ctx.beginPath();
      for (let j = 0; j < 12; j++) {
        const angle = so + j * 0.4;
        const radius = 1 * s + j * 0.45 * s;
        const sx2 = cx + Math.cos(angle) * radius;
        const sy2 = cy + 5 * s + Math.sin(angle) * radius * 0.5;
        if (j === 0) ctx.moveTo(sx2, sy2); else ctx.lineTo(sx2, sy2);
      }
      ctx.stroke();
    }
  }

  drawLevelIndicator(ctx, cx, cy, s, 4, "#64b4ff", "B");
}

// ═════════════════════════════════════════════════════════════════════
// CLUB 4A: INVESTMENT BANK
// Luxurious bank building with vault door and gold accents
// ═════════════════════════════════════════════════════════════════════

export function drawClubInvestmentBank(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 16, 7);
  drawHexPlatform(ctx, cx, cy, s, 16, 17, 14, "#4a4530", "#5a5540");

  // Building body - elegant gray-gold with gradients
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#2a2820");
  lGrad.addColorStop(1, "#3a3830");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s); ctx.lineTo(cx - 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s); ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#3a3830");
  rGrad.addColorStop(1, "#4a4840");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s); ctx.lineTo(cx + 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s); ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a4840";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 2 * s); ctx.lineTo(cx, cy - 6 * s);
  ctx.lineTo(cx + 10 * s, cy - 2 * s); ctx.lineTo(cx, cy + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Gold trim bands
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(cx - 11 * s, cy + 6 * s, 10 * s, 1.5 * s);
  ctx.fillRect(cx + 1 * s, cy + 6 * s, 10 * s, 1.5 * s);
  ctx.fillRect(cx - 10 * s, cy - 1 * s, 9 * s, 1.5 * s);
  ctx.fillRect(cx + 1 * s, cy - 1 * s, 9 * s, 1.5 * s);

  // Marble columns
  for (const colX of [-5, 3.5]) {
    const cGrad = ctx.createLinearGradient(cx + colX * s, 0, cx + (colX + 1.5) * s, 0);
    cGrad.addColorStop(0, "#c0b8a0");
    cGrad.addColorStop(0.5, "#e0d8c0");
    cGrad.addColorStop(1, "#c0b8a0");
    ctx.fillStyle = cGrad;
    ctx.fillRect(cx + colX * s, cy + 3 * s, 1.5 * s, 11 * s);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(cx + (colX - 0.5) * s, cy + 2 * s, 2.5 * s, 1.5 * s);
    ctx.fillRect(cx + (colX - 0.3) * s, cy + 13 * s, 2 * s, 1 * s);
  }

  // Grand pediment roof
  ctx.fillStyle = "#2a2520";
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy - 4 * s); ctx.lineTo(cx, cy - 16 * s);
  ctx.lineTo(cx + 14 * s, cy - 4 * s); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a3530";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16 * s); ctx.lineTo(cx + 14 * s, cy - 4 * s);
  ctx.lineTo(cx + 10 * s, cy - 4 * s); ctx.lineTo(cx, cy - 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy - 4 * s); ctx.lineTo(cx, cy - 14 * s);
  ctx.lineTo(cx + 12 * s, cy - 4 * s); ctx.stroke();

  // Gold-tinted display windows
  const wGlow = animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7;
  for (const wx of [-10, 6]) {
    ctx.fillStyle = "#0a0a05";
    ctx.fillRect(cx + wx * s, cy + 3 * s, 4 * s, 7 * s);
    ctx.fillStyle = `rgba(255, 215, 50, ${wGlow * 0.9})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 5 * s;
    ctx.fillRect(cx + (wx + 0.5) * s, cy + 3.5 * s, 3 * s, 6 * s);
    ctx.shadowBlur = 0;
    // Gold bars inside
    ctx.fillStyle = "#daa520";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(cx + (wx + 1) * s, cy + 4.5 * s + i * 2 * s, 2 * s, 1 * s);
    }
  }

  // Vault door
  ctx.fillStyle = "#6a6a6a";
  ctx.beginPath();
  ctx.arc(cx, cy + 11 * s, 3.5 * s, Math.PI, 0);
  ctx.lineTo(cx + 3.5 * s, cy + 15 * s);
  ctx.lineTo(cx - 3.5 * s, cy + 15 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4a4a4a";
  ctx.lineWidth = 0.5 * s;
  ctx.stroke();
  ctx.fillStyle = "#888888";
  ctx.beginPath();
  ctx.arc(cx, cy + 12 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#aaaaaa";
  ctx.beginPath();
  ctx.arc(cx, cy + 12 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(cx + 1.5 * s, cy + 12.5 * s);
  ctx.lineTo(cx + 3 * s, cy + 12.5 * s);
  ctx.stroke();

  // Floating $ with gold aura
  const dollarY = cy - 10 * s + (animated ? Math.sin(t * 2) * 1.5 * s : 0);
  const aGrad = ctx.createRadialGradient(cx, dollarY, 0, cx, dollarY, 14 * s);
  aGrad.addColorStop(0, `rgba(255, 215, 0, ${wGlow * 0.55})`);
  aGrad.addColorStop(0.5, `rgba(255, 190, 0, ${wGlow * 0.25})`);
  aGrad.addColorStop(1, "rgba(255, 150, 0, 0)");
  ctx.fillStyle = aGrad;
  ctx.beginPath();
  ctx.arc(cx, dollarY, 14 * s, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting coins
  if (animated) {
    for (let i = 0; i < 5; i++) {
      const oa = t * 1.5 + (i * Math.PI * 2) / 5;
      const or2 = 9 * s;
      const ox = cx + Math.cos(oa) * or2;
      const oy = dollarY + Math.sin(oa) * or2 * ISO_Y_RATIO;
      ctx.fillStyle = `rgba(255, 215, 0, ${0.7 + Math.sin(t * 3 + i) * 0.2})`;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 3 * s;
      ctx.beginPath();
      ctx.ellipse(ox, oy, 1.8 * s, 1.2 * s, oa * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Orbit ring
  ctx.strokeStyle = `rgba(255, 215, 0, ${wGlow * 0.3})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(cx, dollarY, 9 * s, 3.6 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 14 * s;
  ctx.font = `bold ${13 * s}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", cx, dollarY);
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ffd700", "A");
}

// ═════════════════════════════════════════════════════════════════════
// CLUB 4B: RECRUITMENT CENTER
// Military-styled green building with blue accents and damage buff
// ═════════════════════════════════════════════════════════════════════

export function drawClubRecruitmentCenter(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 16, 7);
  drawHexPlatform(ctx, cx, cy, s, 16, 17, 14, "#2a3a2a", "#3a4a3a");

  // Building body - dark green with blue military accents
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#1a3a1a");
  lGrad.addColorStop(1, "#2a4a2a");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 12 * s); ctx.lineTo(cx - 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s); ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#2a4a2a");
  rGrad.addColorStop(1, "#3a5a3a");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 12 * s); ctx.lineTo(cx + 10 * s, cy - 2 * s);
  ctx.lineTo(cx, cy + 2 * s); ctx.lineTo(cx, cy + 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a5a3a";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 2 * s); ctx.lineTo(cx, cy - 6 * s);
  ctx.lineTo(cx + 10 * s, cy - 2 * s); ctx.lineTo(cx, cy + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Blue military trim bands
  ctx.fillStyle = "#3080c0";
  ctx.fillRect(cx - 11 * s, cy + 6 * s, 10 * s, 1 * s);
  ctx.fillRect(cx + 1 * s, cy + 6 * s, 10 * s, 1 * s);
  ctx.fillRect(cx - 10 * s, cy - 1 * s, 9 * s, 1 * s);
  ctx.fillRect(cx + 1 * s, cy - 1 * s, 9 * s, 1 * s);

  // Roof
  ctx.fillStyle = "#1a3a1a";
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy - 4 * s); ctx.lineTo(cx, cy - 16 * s);
  ctx.lineTo(cx + 14 * s, cy - 4 * s); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a4a2a";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16 * s); ctx.lineTo(cx + 14 * s, cy - 4 * s);
  ctx.lineTo(cx + 10 * s, cy - 4 * s); ctx.lineTo(cx, cy - 12 * s);
  ctx.closePath();
  ctx.fill();

  // Military flag
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(cx + 2 * s, cy - 22 * s, 1 * s, 10 * s);
  const fw = animated ? Math.sin(t * 3) * 0.5 : 0;
  ctx.fillStyle = "#3080c0";
  ctx.beginPath();
  ctx.moveTo(cx + 3 * s, cy - 22 * s);
  ctx.quadraticCurveTo(cx + 8 * s, cy - 21 * s + fw * s, cx + 11 * s, cy - 19 * s);
  ctx.lineTo(cx + 3 * s, cy - 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  drawStar(ctx, cx + 6.5 * s, cy - 19 * s, 1.5 * s, 0.6 * s);

  // Blue strategic display windows
  const bGlow = animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7;
  for (const wx of [-10, 6]) {
    ctx.fillStyle = "#0a1a0a";
    ctx.fillRect(cx + wx * s, cy + 3 * s, 4 * s, 7 * s);
    ctx.fillStyle = `rgba(50, 140, 255, ${bGlow})`;
    ctx.shadowColor = "#3080ff";
    ctx.shadowBlur = 5 * s;
    ctx.fillRect(cx + (wx + 0.5) * s, cy + 3.5 * s, 3 * s, 6 * s);
    ctx.shadowBlur = 0;
    // Grid pattern
    ctx.strokeStyle = `rgba(100, 200, 255, ${bGlow * 0.4})`;
    ctx.lineWidth = 0.3 * s;
    for (let gy = 0; gy < 3; gy++) {
      ctx.beginPath();
      ctx.moveTo(cx + (wx + 0.5) * s, cy + 5 * s + gy * 2 * s);
      ctx.lineTo(cx + (wx + 3.5) * s, cy + 5 * s + gy * 2 * s);
      ctx.stroke();
    }
  }

  // Entrance door with shield emblem
  ctx.fillStyle = "#2a4a2a";
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, cy + 15 * s); ctx.lineTo(cx - 3 * s, cy + 8 * s);
  ctx.arc(cx, cy + 8 * s, 3 * s, Math.PI, 0);
  ctx.lineTo(cx + 3 * s, cy + 15 * s); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3080c0";
  ctx.beginPath();
  ctx.moveTo(cx, cy + 8 * s); ctx.lineTo(cx - 1.5 * s, cy + 9.5 * s);
  ctx.lineTo(cx, cy + 12 * s); ctx.lineTo(cx + 1.5 * s, cy + 9.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  drawStar(ctx, cx, cy + 10 * s, 0.8 * s, 0.3 * s);

  // Floating $ sign
  const dollarY = cy - 9 * s + (animated ? Math.sin(t * 2) * s : 0);
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 8 * s;
  ctx.font = `bold ${10 * s}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", cx, dollarY);
  ctx.shadowBlur = 0;

  // Damage buff aura (red/orange ring)
  const aPulse = animated ? 0.25 + Math.sin(t * 2) * 0.12 : 0.3;
  ctx.strokeStyle = `rgba(255, 100, 80, ${aPulse})`;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8 * s, 15 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Buff indicator arrows
  if (animated) {
    for (let i = 0; i < 4; i++) {
      const bAngle = t * 1.5 + (i * Math.PI) / 2;
      const br = 13 * s;
      const bx = cx + Math.cos(bAngle) * br;
      const by = cy + 8 * s + Math.sin(bAngle) * br * 0.45;
      ctx.fillStyle = `rgba(255, 100, 80, ${0.5 + Math.sin(t * 3 + i) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(bx, by - 1.5 * s);
      ctx.lineTo(bx + 1 * s, by + 0.5 * s);
      ctx.lineTo(bx - 1 * s, by + 0.5 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawLevelIndicator(ctx, cx, cy, s, 4, "#4ecdc4", "B");
}

// ═════════════════════════════════════════════════════════════════════
// STATION 4A: CENTAUR STABLES
// Warm brown stable/barn with amber mystical glow
// ═════════════════════════════════════════════════════════════════════

export function drawStationCentaurStables(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 18, 8);
  drawHexPlatform(ctx, cx, cy, s, 18, 18, 15, "#5a4a30", "#6a5a40");

  // Yellow platform stripe
  ctx.strokeStyle = "#d4a520";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + Math.cos(a) * 17 * s;
    const py = cy + 16.5 * s + Math.sin(a) * 8.5 * s;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Stable building body - warm brown with gradients
  const lGrad = ctx.createLinearGradient(cx - 14 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#4a2a15");
  lGrad.addColorStop(1, "#5a3a25");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy + 13 * s); ctx.lineTo(cx - 12 * s, cy);
  ctx.lineTo(cx, cy + 4 * s); ctx.lineTo(cx, cy + 17 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 14 * s, cy);
  rGrad.addColorStop(0, "#5a3a25");
  rGrad.addColorStop(1, "#6a4a35");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 14 * s, cy + 13 * s); ctx.lineTo(cx + 12 * s, cy);
  ctx.lineTo(cx, cy + 4 * s); ctx.lineTo(cx, cy + 17 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6a4a35";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy); ctx.lineTo(cx, cy - 4 * s);
  ctx.lineTo(cx + 12 * s, cy); ctx.lineTo(cx, cy + 4 * s);
  ctx.closePath();
  ctx.fill();

  // Wood plank lines
  ctx.strokeStyle = "rgba(40, 25, 10, 0.15)";
  ctx.lineWidth = 0.4 * s;
  for (let i = 0; i < 5; i++) {
    const y = cy + 12 * s - i * 3 * s;
    ctx.beginPath(); ctx.moveTo(cx - 12 * s, y); ctx.lineTo(cx, y + 2 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, y + 2 * s); ctx.lineTo(cx + 12 * s, y); ctx.stroke();
  }

  // Barn roof
  ctx.fillStyle = "#3a1a08";
  ctx.beginPath();
  ctx.moveTo(cx - 16 * s, cy); ctx.lineTo(cx, cy - 16 * s);
  ctx.lineTo(cx + 16 * s, cy); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a2a18";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16 * s); ctx.lineTo(cx + 16 * s, cy);
  ctx.lineTo(cx + 12 * s, cy); ctx.lineTo(cx, cy - 12 * s);
  ctx.closePath();
  ctx.fill();
  // Roof shingle lines
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.4 * s;
  for (let i = 0; i < 4; i++) {
    const y = cy - 2 * s - i * 3.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 14 * s + i * 3.5 * s, y); ctx.lineTo(cx + 14 * s - i * 3.5 * s, y); ctx.stroke();
  }

  // Hay loft window
  ctx.fillStyle = "#2a1808";
  ctx.fillRect(cx - 3 * s, cy - 10 * s, 4 * s, 4 * s);
  ctx.fillStyle = `rgba(200, 180, 80, ${animated ? 0.4 + Math.sin(t * 2) * 0.15 : 0.45})`;
  ctx.fillRect(cx - 2.5 * s, cy - 9.5 * s, 3 * s, 3 * s);

  // Gold horseshoe above door
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(cx, cy + 5 * s, 2.5 * s, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // Horseshoe nail dots
  ctx.fillStyle = "#c9a227";
  for (const a of [0.2, 0.5, 0.8]) {
    ctx.beginPath();
    ctx.arc(cx + Math.cos(Math.PI * a) * 2.5 * s, cy + 5 * s + Math.sin(Math.PI * a) * 2.5 * s, 0.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Barn doors (wide, open with interior glow)
  ctx.fillStyle = "#1a1008";
  ctx.fillRect(cx - 5 * s, cy + 7 * s, 10 * s, 8 * s);
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(cx - 5 * s, cy + 7 * s, 4.5 * s, 8 * s);
  ctx.fillRect(cx + 0.5 * s, cy + 7 * s, 4.5 * s, 8 * s);
  // Door X-brace
  ctx.strokeStyle = "#2a1808";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 5 * s, cy + 7 * s); ctx.lineTo(cx - 0.5 * s, cy + 15 * s);
  ctx.moveTo(cx - 0.5 * s, cy + 7 * s); ctx.lineTo(cx - 5 * s, cy + 15 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 0.5 * s, cy + 7 * s); ctx.lineTo(cx + 5 * s, cy + 15 * s);
  ctx.moveTo(cx + 5 * s, cy + 7 * s); ctx.lineTo(cx + 0.5 * s, cy + 15 * s);
  ctx.stroke();

  // Interior amber glow
  const iGlow = animated ? 0.4 + Math.sin(t * 2) * 0.2 : 0.5;
  ctx.fillStyle = `rgba(255, 160, 40, ${iGlow})`;
  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = 8 * s;
  ctx.fillRect(cx - 3 * s, cy + 9 * s, 6 * s, 5 * s);
  ctx.shadowBlur = 0;

  // Side windows with amber glow
  for (const wx of [-11, 8]) {
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(cx + wx * s, cy + 5 * s, 3 * s, 4 * s);
    ctx.fillStyle = `rgba(255, 160, 40, ${iGlow})`;
    ctx.fillRect(cx + (wx + 0.5) * s, cy + 5.5 * s, 2 * s, 3 * s);
  }

  // Amber magical particles
  if (animated) {
    ctx.fillStyle = `rgba(255, 180, 60, ${0.5 + Math.sin(t * 3) * 0.25})`;
    for (let i = 0; i < 6; i++) {
      const pa = t * 0.8 + (i * Math.PI * 2) / 6;
      const pr = (8 + Math.sin(t + i) * 2) * s;
      const px = cx + Math.cos(pa) * pr;
      const py = cy - 4 * s + Math.sin(pa) * pr * 0.4;
      ctx.beginPath();
      ctx.arc(px, py, 1 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Weather vane
  ctx.strokeStyle = "#4a2010";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath(); ctx.moveTo(cx, cy - 16 * s); ctx.lineTo(cx, cy - 20 * s); ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, cy - 19 * s); ctx.lineTo(cx + 2 * s, cy - 19 * s);
  ctx.lineTo(cx, cy - 20.5 * s); ctx.closePath();
  ctx.fill();

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ff8c28", "A");
}

// ═════════════════════════════════════════════════════════════════════
// STATION 4B: ROYAL CAVALRY
// Purple royal fortress with battlements, banner, and crown
// ═════════════════════════════════════════════════════════════════════

export function drawStationRoyalCavalry(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 18, 8);
  drawHexPlatform(ctx, cx, cy, s, 18, 18, 15, "#3a2a4a", "#4a3a5a");

  // Royal platform stripe
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + Math.cos(a) * 17 * s;
    const py = cy + 16.5 * s + Math.sin(a) * 8.5 * s;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Fortress body - royal purple with gradients
  const lGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
  lGrad.addColorStop(0, "#2a1040");
  lGrad.addColorStop(1, "#3a2050");
  ctx.fillStyle = lGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, cy + 13 * s); ctx.lineTo(cx - 10 * s, cy);
  ctx.lineTo(cx, cy + 4 * s); ctx.lineTo(cx, cy + 17 * s);
  ctx.closePath();
  ctx.fill();
  const rGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
  rGrad.addColorStop(0, "#3a2050");
  rGrad.addColorStop(1, "#4a3060");
  ctx.fillStyle = rGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, cy + 13 * s); ctx.lineTo(cx + 10 * s, cy);
  ctx.lineTo(cx, cy + 4 * s); ctx.lineTo(cx, cy + 17 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a3060";
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy); ctx.lineTo(cx, cy - 4 * s);
  ctx.lineTo(cx + 10 * s, cy); ctx.lineTo(cx, cy + 4 * s);
  ctx.closePath();
  ctx.fill();

  // Gold trim
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(cx - 10 * s, cy + 6 * s, 9 * s, 1 * s);
  ctx.fillRect(cx + 1 * s, cy + 6 * s, 9 * s, 1 * s);

  // Clock tower (royal)
  const ltGrad = ctx.createLinearGradient(cx - 6 * s, cy, cx, cy);
  ltGrad.addColorStop(0, "#2a1040");
  ltGrad.addColorStop(1, "#3a2050");
  ctx.fillStyle = ltGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, cy - 2 * s); ctx.lineTo(cx - 5 * s, cy - 16 * s);
  ctx.lineTo(cx, cy - 14 * s); ctx.lineTo(cx, cy); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a3060";
  ctx.beginPath();
  ctx.moveTo(cx + 6 * s, cy - 2 * s); ctx.lineTo(cx + 5 * s, cy - 16 * s);
  ctx.lineTo(cx, cy - 14 * s); ctx.lineTo(cx, cy); ctx.closePath();
  ctx.fill();

  // Battlements on tower
  ctx.fillStyle = "#4a3060";
  for (const bx of [-5, -2, 1, 4]) {
    ctx.fillRect(cx + bx * s, cy - 18 * s, 2 * s, 2 * s);
  }

  // Tower pointed roof
  ctx.fillStyle = "#2a1040";
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, cy - 16 * s); ctx.lineTo(cx, cy - 22 * s);
  ctx.lineTo(cx + 6 * s, cy - 16 * s); ctx.lineTo(cx, cy - 18 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2050";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 22 * s); ctx.lineTo(cx + 6 * s, cy - 16 * s);
  ctx.lineTo(cx + 3 * s, cy - 16.5 * s); ctx.lineTo(cx, cy - 20 * s);
  ctx.closePath();
  ctx.fill();

  // Royal banner
  ctx.fillStyle = "#3a2a3a";
  ctx.fillRect(cx + 6 * s, cy - 24 * s, 0.8 * s, 14 * s);
  const fw = animated ? Math.sin(t * 3) * 0.5 : 0;
  ctx.fillStyle = "#8a30aa";
  ctx.beginPath();
  ctx.moveTo(cx + 7 * s, cy - 24 * s);
  ctx.quadraticCurveTo(cx + 12 * s, cy - 23 * s + fw * s, cx + 14 * s, cy - 21 * s);
  ctx.lineTo(cx + 7 * s, cy - 18 * s);
  ctx.closePath();
  ctx.fill();
  // Gold star on banner
  ctx.fillStyle = "#ffd700";
  drawStar(ctx, cx + 10 * s, cy - 21 * s, 1.5 * s, 0.6 * s);

  // Clock face
  ctx.fillStyle = "#f5f5e8";
  ctx.beginPath();
  ctx.arc(cx, cy - 10 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * s;
  ctx.stroke();
  // Clock hands
  const ha = animated ? t * 0.1 : Math.PI / 4;
  const ma = animated ? t * 1.2 : Math.PI / 2;
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 1 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10 * s);
  ctx.lineTo(cx + Math.cos(ha - Math.PI / 2) * 2 * s, cy - 10 * s + Math.sin(ha - Math.PI / 2) * 2 * s);
  ctx.stroke();
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10 * s);
  ctx.lineTo(cx + Math.cos(ma - Math.PI / 2) * 3 * s, cy - 10 * s + Math.sin(ma - Math.PI / 2) * 3 * s);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Purple windows with glow
  const wGlow = animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7;
  for (const wx of [-9, 5]) {
    ctx.fillStyle = "#1a0818";
    ctx.fillRect(cx + wx * s, cy + 8 * s, 4 * s, 4 * s);
    ctx.fillStyle = `rgba(160, 80, 255, ${wGlow})`;
    ctx.shadowColor = "#a050ff";
    ctx.shadowBlur = 5 * s;
    ctx.fillRect(cx + (wx + 0.5) * s, cy + 8.5 * s, 3 * s, 3 * s);
    ctx.shadowBlur = 0;
  }

  // Entrance with crown emblem
  ctx.fillStyle = "#2a1030";
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, cy + 15 * s); ctx.lineTo(cx - 3 * s, cy + 8 * s);
  ctx.arc(cx, cy + 8 * s, 3 * s, Math.PI, 0);
  ctx.lineTo(cx + 3 * s, cy + 15 * s); ctx.closePath();
  ctx.fill();
  // Door glow
  ctx.fillStyle = `rgba(160, 80, 255, ${wGlow * 0.4})`;
  ctx.beginPath();
  ctx.arc(cx, cy + 8 * s, 2 * s, Math.PI, 0);
  ctx.fill();

  // Shield emblems on walls
  for (const ex of [-7, 7]) {
    ctx.fillStyle = "#8a30aa";
    ctx.beginPath();
    ctx.moveTo(cx + ex * s, cy + 2 * s);
    ctx.lineTo(cx + (ex - 1.5) * s, cy + 3.5 * s);
    ctx.lineTo(cx + ex * s, cy + 5.5 * s);
    ctx.lineTo(cx + (ex + 1.5) * s, cy + 3.5 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Purple aura
  const aPulse = animated ? 0.2 + Math.sin(t * 2) * 0.1 : 0.25;
  ctx.fillStyle = `rgba(140, 50, 200, ${aPulse})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magical particles
  if (animated) {
    for (let i = 0; i < 4; i++) {
      const pa = t * 1.2 + (i * Math.PI) / 2;
      const pr = (10 + Math.sin(t + i) * 2) * s;
      const px = cx + Math.cos(pa) * pr;
      const py = cy + 5 * s + Math.sin(pa) * pr * 0.4;
      ctx.fillStyle = `rgba(200, 150, 255, ${0.4 + Math.sin(t * 3 + i) * 0.25})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLevelIndicator(ctx, cx, cy, s, 4, "#a050ff", "B");
}

// ═════════════════════════════════════════════════════════════════════
// MORTAR 4A: MISSILE BATTERY
// Modern 6-pod missile launcher on iron foundation
// ═════════════════════════════════════════════════════════════════════

export function drawMortarMissileBattery(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 20, 9);

  // Iron hex foundation wall
  const sbGrad = ctx.createLinearGradient(cx - 16 * s, 0, cx + 16 * s, 0);
  sbGrad.addColorStop(0, "#2a2a32"); sbGrad.addColorStop(0.35, "#4a4a52");
  sbGrad.addColorStop(0.65, "#3e3e46"); sbGrad.addColorStop(1, "#222228");
  ctx.fillStyle = sbGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14 * s, 17 * s, 8.5 * s, 0, 0, Math.PI);
  ctx.lineTo(cx - 17 * s, cy + 10 * s);
  ctx.ellipse(cx, cy + 10 * s, 17 * s, 8.5 * s, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10 * s, 17 * s, 8.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 9 * s, 15 * s, 7.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Support pylons
  for (const [side, color] of [[-1, "#3a3a44"], [1, "#4a4a54"]] as const) {
    ctx.fillStyle = color as string;
    ctx.beginPath();
    ctx.moveTo(cx + (side as number) * 12 * s, cy + 8 * s);
    ctx.lineTo(cx + (side as number) * 10 * s, cy - 6 * s);
    ctx.lineTo(cx + (side as number) * 8 * s, cy - 6 * s);
    ctx.lineTo(cx + (side as number) * 6 * s, cy + 6 * s);
    ctx.closePath();
    ctx.fill();
    // Pylon rivets
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(cx + (side as number) * 9 * s, cy - 2 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + (side as number) * 8 * s, cy + 4 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Launcher rack body
  const rackGrad = ctx.createLinearGradient(cx - 9 * s, 0, cx + 9 * s, 0);
  rackGrad.addColorStop(0, "#2a3040"); rackGrad.addColorStop(0.5, "#3a4555");
  rackGrad.addColorStop(1, "#2a3040");
  ctx.fillStyle = rackGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 9 * s, cy - 4 * s); ctx.lineTo(cx - 7 * s, cy - 14 * s);
  ctx.lineTo(cx + 7 * s, cy - 14 * s); ctx.lineTo(cx + 9 * s, cy - 4 * s);
  ctx.closePath();
  ctx.fill();
  // Rack border
  ctx.strokeStyle = "#505060";
  ctx.lineWidth = 0.6 * s;
  ctx.stroke();

  // 6 missile pods (2x3)
  const podCols = [-3, 3];
  const podRows = [-12, -9, -6];
  for (const col of podCols) {
    for (const row of podRows) {
      const px = cx + col * s;
      const py = cy + row * s;
      // Pod housing
      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.ellipse(px, py, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pod inner ring
      ctx.fillStyle = "#5a6a7a";
      ctx.beginPath();
      ctx.ellipse(px, py, 2 * s, 1.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Missile nose cone (red)
      ctx.fillStyle = "#cc3030";
      ctx.beginPath();
      ctx.ellipse(px, py, 1 * s, 0.6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.ellipse(px - 0.3 * s, py - 0.2 * s, 0.4 * s, 0.25 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Blue targeting reticle
  const tPulse = animated ? 0.5 + Math.sin(t * 4) * 0.3 : 0.6;
  ctx.strokeStyle = `rgba(80, 160, 255, ${tPulse * 0.7})`;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 9 * s, 7 * s, 3.5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Radar dish
  ctx.fillStyle = "#505060";
  ctx.fillRect(cx + 10 * s, cy - 10 * s, 1 * s, 6 * s);
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.arc(cx + 10.5 * s, cy - 10 * s, 3 * s, -Math.PI * 0.8, Math.PI * 0.2);
  ctx.lineTo(cx + 10.5 * s, cy - 10 * s);
  ctx.closePath();
  ctx.fill();
  if (animated) {
    const ra = t * 4;
    ctx.strokeStyle = `rgba(80, 180, 255, ${tPulse})`;
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(cx + 10.5 * s, cy - 10 * s);
    ctx.lineTo(cx + 10.5 * s + Math.cos(ra) * 3 * s, cy - 10 * s + Math.sin(ra) * 1.5 * s);
    ctx.stroke();
  }

  // Blue HUD ground targeting
  if (animated) {
    ctx.strokeStyle = `rgba(80, 180, 255, ${tPulse * 0.4})`;
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([2 * s, 2 * s]);
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Status LEDs
  ctx.fillStyle = "#00ff88";
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 4 * s;
  ctx.beginPath();
  ctx.arc(cx - 8 * s, cy - 2 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00aaff";
  ctx.beginPath();
  ctx.arc(cx - 8 * s, cy + 1 * s, 0.7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#64b4ff", "A");
}

// ═════════════════════════════════════════════════════════════════════
// MORTAR 4B: EMBER FOUNDRY
// Triple-barrel revolver cannon with molten forge aesthetic
// ═════════════════════════════════════════════════════════════════════

export function drawMortarEmberFoundry(ctx: Ctx, cx: number, cy: number, s: number, t: number, animated: boolean, _size: number) {
  drawGroundShadow(ctx, cx, cy, s, 20, 9);

  // Scorched ground
  const sA = animated ? 0.25 + Math.sin(t * 2) * 0.1 : 0.3;
  ctx.fillStyle = `rgba(80, 30, 0, ${sA})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark iron foundation
  const sbGrad = ctx.createLinearGradient(cx - 16 * s, 0, cx + 16 * s, 0);
  sbGrad.addColorStop(0, "#1a1a1e"); sbGrad.addColorStop(0.35, "#3a3a3e");
  sbGrad.addColorStop(0.65, "#2e2e32"); sbGrad.addColorStop(1, "#141418");
  ctx.fillStyle = sbGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14 * s, 17 * s, 8.5 * s, 0, 0, Math.PI);
  ctx.lineTo(cx - 17 * s, cy + 10 * s);
  ctx.ellipse(cx, cy + 10 * s, 17 * s, 8.5 * s, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a4a4e";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10 * s, 17 * s, 8.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 9 * s, 15 * s, 7.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Molten cracks
  ctx.strokeStyle = `rgba(255, 100, 20, ${animated ? 0.4 + Math.sin(t * 3) * 0.2 : 0.5})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy + 9 * s); ctx.lineTo(cx - 5 * s, cy + 7 * s);
  ctx.lineTo(cx + 1 * s, cy + 10 * s); ctx.lineTo(cx + 6 * s, cy + 8 * s);
  ctx.stroke();

  // Cradle arms (dark iron with rivets)
  for (const side of [-1, 1] as const) {
    const armX = cx + side * 14 * s;
    const aGrad = ctx.createLinearGradient(armX - 3 * s, 0, armX + 3 * s, 0);
    aGrad.addColorStop(0, side === -1 ? "#222226" : "#2e2e32");
    aGrad.addColorStop(1, side === -1 ? "#2e2e32" : "#3a3a3e");
    ctx.fillStyle = aGrad;
    ctx.beginPath();
    ctx.moveTo(armX, cy + 8 * s);
    ctx.lineTo(armX + side * -2 * s, cy - 8 * s);
    ctx.lineTo(armX + side * -4 * s, cy - 8 * s);
    ctx.lineTo(armX + side * -6 * s, cy + 6 * s);
    ctx.closePath();
    ctx.fill();
    // Rivets
    for (const ry of [-4, 0, 4]) {
      ctx.fillStyle = "#6a6a6e";
      ctx.beginPath();
      ctx.arc(armX + side * -3 * s, cy + ry * s, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Triple barrel revolver assembly
  const barrelAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  const revSpin = animated ? t * 0.5 : 0;

  // Housing base
  ctx.fillStyle = "#2a2a30";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Three barrels
  for (let bi = 0; bi < 3; bi++) {
    const bAngle = barrelAngles[bi] + revSpin;
    const bx = cx + Math.cos(bAngle) * 4 * s;
    const by = cy - 4 * s + Math.sin(bAngle) * 2 * s;
    const bDepth = Math.sin(bAngle) > 0 ? 0.8 : 1;

    // Barrel cylinder with gradient
    const bGrad = ctx.createLinearGradient(bx - 4 * s, 0, bx + 4 * s, 0);
    bGrad.addColorStop(0, `rgba(25, 25, 30, ${bDepth})`);
    bGrad.addColorStop(0.3, `rgba(55, 55, 62, ${bDepth})`);
    bGrad.addColorStop(0.7, `rgba(50, 50, 58, ${bDepth})`);
    bGrad.addColorStop(1, `rgba(20, 20, 25, ${bDepth})`);
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.ellipse(bx, by, 4 * s, 2 * s, 0, 0, Math.PI);
    ctx.lineTo(bx - 4 * s, by - 8 * s);
    ctx.ellipse(bx, by - 8 * s, 4 * s, 2 * s, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Barrel top ring
    ctx.fillStyle = `rgba(90, 85, 95, ${bDepth})`;
    ctx.beginPath();
    ctx.ellipse(bx, by - 8 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Gold reinforcement ring
    ctx.strokeStyle = `rgba(201, 162, 39, ${bDepth * 0.5})`;
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.ellipse(bx, by - 8 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dark bore
    ctx.fillStyle = `rgba(10, 8, 8, ${bDepth})`;
    ctx.beginPath();
    ctx.ellipse(bx, by - 8 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Molten glow from bore
    const mGlow = animated ? 0.4 + Math.sin(t * 4 + bi * 2) * 0.3 : 0.5;
    ctx.fillStyle = `rgba(255, 80, 0, ${mGlow * bDepth})`;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 6 * s;
    ctx.beginPath();
    ctx.ellipse(bx, by - 8 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Center spindle
  ctx.fillStyle = "#4a4a50";
  ctx.beginPath();
  ctx.arc(cx, cy - 4 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a70";
  ctx.beginPath();
  ctx.arc(cx, cy - 4 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  // Ember particles rising
  if (animated) {
    for (let i = 0; i < 8; i++) {
      const ey = cy - 8 * s - ((t * 5 + i * 3) % 16) * s;
      const ex = cx + Math.sin(t * 2 + i * 1.5) * 6 * s;
      const eAlpha = Math.max(0, 1 - ((t * 5 + i * 3) % 16) / 16);
      ctx.fillStyle = `rgba(255, ${60 + i * 22}, 0, ${eAlpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(ex, ey, (1.2 - eAlpha * 0.4) * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Forge furnace glow
  ctx.fillStyle = `rgba(255, 80, 0, ${animated ? 0.5 + Math.sin(t * 3) * 0.25 : 0.6})`;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 8 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawLevelIndicator(ctx, cx, cy, s, 4, "#ff6600", "B");
}
