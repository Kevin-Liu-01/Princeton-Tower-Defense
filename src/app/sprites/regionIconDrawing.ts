export type RegionType = "grassland" | "swamp" | "desert" | "winter" | "volcanic";

/**
 * Draw the region icon centered at the current canvas origin.
 * Caller must ctx.translate() + optionally ctx.scale() before calling.
 * Coordinates span roughly -14..+14 in each axis.
 */
export function drawRegionIcon(
  ctx: CanvasRenderingContext2D,
  type: RegionType,
): void {
  switch (type) {
    case "grassland": drawGrasslandIcon(ctx); break;
    case "swamp":     drawSwampIcon(ctx);     break;
    case "desert":    drawDesertIcon(ctx);    break;
    case "winter":    drawWinterIcon(ctx);    break;
    case "volcanic":  drawVolcanicIcon(ctx);  break;
  }
}

function drawGrasslandIcon(ctx: CanvasRenderingContext2D): void {
  // Ground shadow
  ctx.fillStyle = "rgba(0,50,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10.5, 8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk with gradient
  const trunkGrad = ctx.createLinearGradient(-2, 2, 3, 10);
  trunkGrad.addColorStop(0, "#8B6040");
  trunkGrad.addColorStop(0.5, "#A07040");
  trunkGrad.addColorStop(1, "#7A5535");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(-2.5, 2);
  ctx.lineTo(-2, 10);
  ctx.lineTo(2, 10);
  ctx.lineTo(2.5, 2);
  ctx.closePath();
  ctx.fill();

  // Root flares
  ctx.fillStyle = "#7A5535";
  ctx.beginPath();
  ctx.moveTo(-2, 9);
  ctx.quadraticCurveTo(-4, 10, -5, 10.5);
  ctx.lineTo(-3, 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2, 9);
  ctx.quadraticCurveTo(4, 10, 5, 10.5);
  ctx.lineTo(3, 10);
  ctx.closePath();
  ctx.fill();

  // Trunk bark highlight
  ctx.fillStyle = "rgba(200,152,88,0.45)";
  ctx.fillRect(-0.3, 3, 0.8, 5.5);

  // Trunk outline
  ctx.strokeStyle = "#6A4A2A";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-2.5, 2);
  ctx.lineTo(-2, 10);
  ctx.lineTo(2, 10);
  ctx.lineTo(2.5, 2);
  ctx.closePath();
  ctx.stroke();

  // Canopy dark base (shadow layer)
  ctx.fillStyle = "#1E7A1E";
  ctx.beginPath();
  ctx.arc(0, 0.5, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // Main canopy — deep green
  const canopyGrad = ctx.createRadialGradient(0, -4, 1, 0, -1, 10);
  canopyGrad.addColorStop(0, "#58D058");
  canopyGrad.addColorStop(0.5, "#3EA83E");
  canopyGrad.addColorStop(1, "#2A8A2A");
  ctx.fillStyle = canopyGrad;
  ctx.beginPath();
  ctx.arc(0, -1, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // Canopy mid-tone clusters
  ctx.fillStyle = "#42B842";
  ctx.beginPath();
  ctx.arc(-3.5, -2.5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, -1, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Bright highlight clusters
  ctx.fillStyle = "#55CC48";
  ctx.beginPath();
  ctx.arc(-1.5, -4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.5, -3, 5, 0, Math.PI * 2);
  ctx.fill();

  // Sunlit top highlights
  ctx.fillStyle = "#70E860";
  ctx.beginPath();
  ctx.arc(-2, -6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.5, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  // Specular light spots
  ctx.fillStyle = "#A0FF80";
  ctx.beginPath();
  ctx.arc(-1, -7, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#90FF70";
  ctx.beginPath();
  ctx.arc(3, -5.5, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Canopy edge definition
  ctx.strokeStyle = "rgba(30,100,30,0.4)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, -1, 9.5, 0, Math.PI * 2);
  ctx.stroke();

  // Top rim highlight
  ctx.strokeStyle = "rgba(140,255,100,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -1, 9, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function drawSwampIcon(ctx: CanvasRenderingContext2D): void {
  // Murky puddle with gradient
  const puddleGrad = ctx.createRadialGradient(0, 8, 0, 0, 8, 12);
  puddleGrad.addColorStop(0, "rgba(40,120,90,0.55)");
  puddleGrad.addColorStop(1, "rgba(30,80,60,0.15)");
  ctx.fillStyle = puddleGrad;
  ctx.beginPath();
  ctx.ellipse(0, 8, 11, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Puddle ripple rings
  ctx.strokeStyle = "rgba(80,180,140,0.2)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(0, 8, 8, 2.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-3, 7.5, 4, 1.2, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Stem with gradient
  const stemGrad = ctx.createLinearGradient(-2, -2.5, 2, 4);
  stemGrad.addColorStop(0, "#E8D8C0");
  stemGrad.addColorStop(0.5, "#D0C0A8");
  stemGrad.addColorStop(1, "#B8A890");
  ctx.fillStyle = stemGrad;
  ctx.beginPath();
  ctx.moveTo(-2.8, 4);
  ctx.lineTo(-2.2, -2.5);
  ctx.lineTo(2.2, -2.5);
  ctx.lineTo(2.8, 4);
  ctx.closePath();
  ctx.fill();

  // Stem ring details
  ctx.strokeStyle = "rgba(170,150,130,0.5)";
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.ellipse(0, 0.2, 2.5, 0.6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 1.8, 2.6, 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Stem highlight
  ctx.fillStyle = "rgba(255,240,220,0.4)";
  ctx.fillRect(-0.4, -1.5, 0.8, 4.5);

  // Bioluminescent halo behind cap
  const capGlow = ctx.createRadialGradient(0, -5, 3, 0, -5, 13);
  capGlow.addColorStop(0, "rgba(200,80,255,0.18)");
  capGlow.addColorStop(1, "rgba(200,80,255,0)");
  ctx.fillStyle = capGlow;
  ctx.beginPath();
  ctx.arc(0, -5, 13, 0, Math.PI * 2);
  ctx.fill();

  // Cap dome with radial gradient
  const capGrad = ctx.createRadialGradient(-1, -7, 1, 0, -4, 11);
  capGrad.addColorStop(0, "#D860FF");
  capGrad.addColorStop(0.35, "#B840E8");
  capGrad.addColorStop(0.7, "#9828D0");
  capGrad.addColorStop(1, "#7818A8");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.ellipse(0, -2.8, 10.5, 8.5, 0, Math.PI, 0);
  ctx.fill();

  // Cap underside shadow
  ctx.fillStyle = "#6815A0";
  ctx.beginPath();
  ctx.ellipse(0, -2.5, 9.5, 2.8, 0, 0, Math.PI);
  ctx.fill();

  // Glowing spots on cap with halos
  const spots = [
    { x: -4.5, y: -6.5, r: 2.0, hr: 3.2 },
    { x:  2.5, y: -7.5, r: 1.5, hr: 2.5 },
    { x:  5.5, y: -4.5, r: 1.2, hr: 2.0 },
    { x: -1.0, y: -8.5, r: 1.1, hr: 1.8 },
    { x: -7.0, y: -4.0, r: 0.9, hr: 1.5 },
  ];
  for (const s of spots) {
    ctx.fillStyle = "rgba(232,176,255,0.25)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E8B0FF";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cap rim highlight
  ctx.strokeStyle = "rgba(220,100,255,0.6)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(0, -3.5, 10.5, 7.5, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // Bioluminescent bubbles
  const bubbles = [
    { x: -6.5, y: 4.5, r: 1.8 },
    { x:  5.5, y: 5.5, r: 1.3 },
    { x: -2.0, y: 6.5, r: 0.9 },
    { x:  2.0, y: 7.0, r: 0.7 },
    { x:  8.0, y: 7.0, r: 0.6 },
  ];
  for (const b of bubbles) {
    // Glow halo
    ctx.fillStyle = "rgba(128,255,208,0.18)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Bubble body
    ctx.fillStyle = "#80FFD0";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    // Specular highlight
    ctx.fillStyle = "rgba(200,255,240,0.6)";
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Rising spore particles
  ctx.fillStyle = "#C080FF";
  ctx.globalAlpha = 0.5;
  const spores = [
    [-7, -1, 0.6], [7.5, -0.5, 0.5], [-3, -10.5, 0.45], [4, -9.5, 0.5], [0, -11, 0.35],
  ] as const;
  for (const [sx, sy, sr] of spores) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawDesertIcon(ctx: CanvasRenderingContext2D): void {
  // Outer corona glow
  const coronaGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 14);
  coronaGrad.addColorStop(0, "rgba(255,200,0,0.25)");
  coronaGrad.addColorStop(1, "rgba(255,150,0,0)");
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  // 12 rays — alternating long & short, triangle-shaped
  for (let r = 0; r < 12; r++) {
    const a = (r * Math.PI) / 6;
    const isLong = r % 2 === 0;
    const innerR = 7;
    const outerR = isLong ? 12.5 : 9.8;
    const halfW = isLong ? 1.1 : 0.75;

    ctx.save();
    ctx.rotate(a);
    const rayGrad = ctx.createLinearGradient(0, -innerR, 0, -outerR);
    rayGrad.addColorStop(0, "#FFAA00");
    rayGrad.addColorStop(1, isLong ? "#FFD860" : "#FFC040");
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(-halfW, -innerR);
    ctx.lineTo(0, -outerR);
    ctx.lineTo(halfW, -innerR);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Bright tip highlights on long rays
  ctx.strokeStyle = "#FFE870";
  ctx.lineWidth = 0.8;
  ctx.lineCap = "round";
  for (let r = 0; r < 12; r += 2) {
    const a = (r * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 9.5, Math.sin(a) * 9.5);
    ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
    ctx.stroke();
  }

  // Sun body with radial gradient
  const bodyGrad = ctx.createRadialGradient(0, -1, 0, 0, 0, 7);
  bodyGrad.addColorStop(0, "#FFE870");
  bodyGrad.addColorStop(0.35, "#FFC830");
  bodyGrad.addColorStop(0.7, "#FFAA00");
  bodyGrad.addColorStop(1, "#E89000");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Body rim
  ctx.strokeStyle = "rgba(200,120,0,0.4)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.stroke();

  // Bright inner core
  const coreGrad = ctx.createRadialGradient(0, -0.5, 0, 0, 0, 4);
  coreGrad.addColorStop(0, "#FFFDE0");
  coreGrad.addColorStop(0.45, "#FFE870");
  coreGrad.addColorStop(1, "#FFC830");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, -0.5, 4, 0, Math.PI * 2);
  ctx.fill();

  // White-hot center
  ctx.fillStyle = "#FFF8E0";
  ctx.beginPath();
  ctx.arc(0, -0.5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(-1.5, -2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Bottom rim highlight
  ctx.strokeStyle = "rgba(255,220,100,0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, 0, 6.5, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
}

function drawWinterIcon(ctx: CanvasRenderingContext2D): void {
  // Soft icy glow behind
  const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
  glowGrad.addColorStop(0, "rgba(180,220,255,0.25)");
  glowGrad.addColorStop(1, "rgba(140,200,255,0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);

    // Main branch with gradient
    const branchGrad = ctx.createLinearGradient(0, 0, 0, -10);
    branchGrad.addColorStop(0, "#E8F4FF");
    branchGrad.addColorStop(1, "#C0DFFF");
    ctx.fillStyle = branchGrad;
    ctx.beginPath();
    ctx.moveTo(-1.3, 0);
    ctx.lineTo(-0.4, -10);
    ctx.lineTo(0.4, -10);
    ctx.lineTo(1.3, 0);
    ctx.closePath();
    ctx.fill();

    // Branch edge
    ctx.strokeStyle = "rgba(160,216,255,0.6)";
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Diamond tip with gradient
    const tipGrad = ctx.createLinearGradient(0, -12.5, 0, -8.5);
    tipGrad.addColorStop(0, "#FFFFFF");
    tipGrad.addColorStop(1, "#D0ECFF");
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.moveTo(0, -12.5);
    ctx.lineTo(-2.2, -10);
    ctx.lineTo(0, -8.5);
    ctx.lineTo(2.2, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(160,216,255,0.5)";
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Lower sub-branches
    ctx.fillStyle = "#D0EEFF";
    ctx.beginPath();
    ctx.moveTo(0, -3.5);
    ctx.lineTo(-5, -6.5);
    ctx.lineTo(-3.8, -5.2);
    ctx.lineTo(0, -2.8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -3.5);
    ctx.lineTo(5, -6.5);
    ctx.lineTo(3.8, -5.2);
    ctx.lineTo(0, -2.8);
    ctx.closePath();
    ctx.fill();

    // Upper sub-branches
    ctx.fillStyle = "#E0F4FF";
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-3.5, -8.5);
    ctx.lineTo(-2.5, -7.5);
    ctx.lineTo(0, -5.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(3.5, -8.5);
    ctx.lineTo(2.5, -7.5);
    ctx.lineTo(0, -5.5);
    ctx.closePath();
    ctx.fill();

    // Tiny diamond sub-branches near tips
    ctx.fillStyle = "#E8F8FF";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-2, -9.2);
    ctx.lineTo(-1.4, -8.7);
    ctx.lineTo(0, -7.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(2, -9.2);
    ctx.lineTo(1.4, -8.7);
    ctx.lineTo(0, -7.7);
    ctx.closePath();
    ctx.fill();

    // Tip sparkle
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, -12.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Center crystal — faceted look
  const centerGrad = ctx.createRadialGradient(0, -0.5, 0, 0, 0, 3.2);
  centerGrad.addColorStop(0, "#FFFFFF");
  centerGrad.addColorStop(0.6, "#E0F2FF");
  centerGrad.addColorStop(1, "#C0DDFF");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Center inner ring
  ctx.strokeStyle = "rgba(160,210,255,0.5)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.stroke();

  // Center specular
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(-0.6, -0.6, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Scattered sparkle particles
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  const sparkles = [
    [-5.5, -8, 0.45], [6, -3.5, 0.4], [-3, 7, 0.4],
    [4.5, 6.5, 0.35], [7.5, 2, 0.3], [-7, 1, 0.35],
  ] as const;
  for (const [sx, sy, sr] of sparkles) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVolcanicIcon(ctx: CanvasRenderingContext2D): void {
  // Outer fire glow
  const glowGrad = ctx.createRadialGradient(0, 1, 3, 0, 1, 14);
  glowGrad.addColorStop(0, "rgba(255,100,0,0.2)");
  glowGrad.addColorStop(1, "rgba(255,50,0,0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 1, 14, 0, Math.PI * 2);
  ctx.fill();

  // Lava pool at base
  const lavaGrad = ctx.createRadialGradient(0, 10, 0, 0, 10, 7);
  lavaGrad.addColorStop(0, "rgba(255,120,20,0.45)");
  lavaGrad.addColorStop(1, "rgba(200,40,0,0.08)");
  ctx.fillStyle = lavaGrad;
  ctx.beginPath();
  ctx.ellipse(0, 10, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main flame body — deep crimson with gradient
  const outerGrad = ctx.createLinearGradient(0, -12, 0, 10);
  outerGrad.addColorStop(0, "#CC1800");
  outerGrad.addColorStop(0.5, "#DD2200");
  outerGrad.addColorStop(1, "#AA1500");
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(5.5, -8, 7.5, -3);
  ctx.quadraticCurveTo(9.5, 2, 6.5, 6.5);
  ctx.quadraticCurveTo(3.5, 10.5, 0, 10.5);
  ctx.quadraticCurveTo(-3.5, 10.5, -6.5, 6.5);
  ctx.quadraticCurveTo(-9.5, 2, -7.5, -3);
  ctx.quadraticCurveTo(-5.5, -8, 0, -12);
  ctx.fill();

  // Left tendril
  ctx.fillStyle = "#EE3800";
  ctx.beginPath();
  ctx.moveTo(-3, -5);
  ctx.quadraticCurveTo(-7.5, -9.5, -4.5, -12);
  ctx.quadraticCurveTo(-2, -8.5, -1, -6);
  ctx.closePath();
  ctx.fill();

  // Right tendril
  ctx.beginPath();
  ctx.moveTo(3, -4);
  ctx.quadraticCurveTo(6.5, -7.5, 5.5, -11);
  ctx.quadraticCurveTo(3.5, -7.5, 2, -5);
  ctx.closePath();
  ctx.fill();

  // Middle layer — rich orange gradient
  const midGrad = ctx.createLinearGradient(0, -9, 0, 9);
  midGrad.addColorStop(0, "#FF5500");
  midGrad.addColorStop(0.5, "#FF6600");
  midGrad.addColorStop(1, "#EE4400");
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.quadraticCurveTo(4, -5, 5.5, -1);
  ctx.quadraticCurveTo(6.5, 3, 4.5, 6.5);
  ctx.quadraticCurveTo(2.5, 9, 0, 9);
  ctx.quadraticCurveTo(-2.5, 9, -4.5, 6.5);
  ctx.quadraticCurveTo(-6.5, 3, -5.5, -1);
  ctx.quadraticCurveTo(-4, -5, 0, -9);
  ctx.fill();

  // Inner layer — bright amber gradient
  const innerGrad = ctx.createLinearGradient(0, -6, 0, 7.5);
  innerGrad.addColorStop(0, "#FFB800");
  innerGrad.addColorStop(0.5, "#FFAA00");
  innerGrad.addColorStop(1, "#FF8800");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(3, -3, 3.5, 1);
  ctx.quadraticCurveTo(4, 5, 0, 7.5);
  ctx.quadraticCurveTo(-4, 5, -3.5, 1);
  ctx.quadraticCurveTo(-3, -3, 0, -6);
  ctx.fill();

  // Core — bright yellow gradient
  const coreGrad = ctx.createLinearGradient(0, -3, 0, 6);
  coreGrad.addColorStop(0, "#FFE840");
  coreGrad.addColorStop(1, "#FFD000");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.quadraticCurveTo(1.8, -1, 2, 2);
  ctx.quadraticCurveTo(2.2, 5, 0, 6);
  ctx.quadraticCurveTo(-2.2, 5, -2, 2);
  ctx.quadraticCurveTo(-1.8, -1, 0, -3);
  ctx.fill();

  // White-hot center teardrop
  ctx.fillStyle = "#FFF8C0";
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(0.8, 1.5, 0.8, 3.5);
  ctx.quadraticCurveTo(0.5, 5, 0, 5);
  ctx.quadraticCurveTo(-0.5, 5, -0.8, 3.5);
  ctx.quadraticCurveTo(-0.8, 1.5, 0, 0);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Static ember particles
  ctx.fillStyle = "#FFD800";
  ctx.beginPath();
  ctx.arc(-3.5, -10, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FF8800";
  ctx.beginPath();
  ctx.arc(3, -9, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFCC00";
  ctx.beginPath();
  ctx.arc(0.5, -11.5, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FF6600";
  ctx.beginPath();
  ctx.arc(-1.5, -12, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Smoke wisps at top
  ctx.strokeStyle = "rgba(100,80,60,0.12)";
  ctx.lineWidth = 0.7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-1, -12.5);
  ctx.quadraticCurveTo(-2, -14, -1.5, -15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1, -12);
  ctx.quadraticCurveTo(2, -13.5, 1.5, -14.5);
  ctx.stroke();
}
