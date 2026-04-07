export type RegionType =
  | "grassland"
  | "swamp"
  | "desert"
  | "winter"
  | "volcanic";

/**
 * Draw the region icon centered at the current canvas origin.
 * Caller must ctx.translate() + optionally ctx.scale() before calling.
 * Coordinates span roughly -14..+14 in each axis.
 */
export function drawRegionIcon(
  ctx: CanvasRenderingContext2D,
  type: RegionType
): void {
  switch (type) {
    case "grassland": {
      drawGrasslandIcon(ctx);
      break;
    }
    case "swamp": {
      drawSwampIcon(ctx);
      break;
    }
    case "desert": {
      drawDesertIcon(ctx);
      break;
    }
    case "winter": {
      drawWinterIcon(ctx);
      break;
    }
    case "volcanic": {
      drawVolcanicIcon(ctx);
      break;
    }
  }
}

function drawGrasslandIcon(ctx: CanvasRenderingContext2D): void {
  // Ground shadow ellipse
  ctx.fillStyle = "rgba(0,40,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 11, 7, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk — wider and taller so it reads clearly at small sizes
  const trunkGrad = ctx.createLinearGradient(-3, 0, 4, 10);
  trunkGrad.addColorStop(0, "#7A5535");
  trunkGrad.addColorStop(0.4, "#936840");
  trunkGrad.addColorStop(0.7, "#A07848");
  trunkGrad.addColorStop(1, "#6A4828");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(-3, 1);
  ctx.lineTo(-2.2, 10.5);
  ctx.lineTo(2.2, 10.5);
  ctx.lineTo(3, 1);
  ctx.closePath();
  ctx.fill();

  // Trunk shadow side
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(-3, 1);
  ctx.lineTo(-2.2, 10.5);
  ctx.lineTo(0, 10.5);
  ctx.lineTo(0, 1);
  ctx.closePath();
  ctx.fill();

  // Trunk bark highlight stripe
  ctx.fillStyle = "rgba(210,170,110,0.4)";
  ctx.fillRect(0.5, 2, 1, 6);

  // Root flares
  ctx.fillStyle = "#6A4828";
  ctx.beginPath();
  ctx.moveTo(-2.2, 9);
  ctx.quadraticCurveTo(-5, 10.5, -6, 11);
  ctx.lineTo(-3.5, 10.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2.2, 9);
  ctx.quadraticCurveTo(5, 10.5, 6, 11);
  ctx.lineTo(3.5, 10.5);
  ctx.closePath();
  ctx.fill();

  // Canopy — lumpy organic silhouette for clear tree shape at small size
  // Shadow/dark base layer (slightly offset down-right)
  ctx.fillStyle = "#165818";
  ctx.beginPath();
  ctx.moveTo(-10, 1);
  ctx.quadraticCurveTo(-11.5, -3, -9, -5.5);
  ctx.quadraticCurveTo(-8, -8, -4, -10);
  ctx.quadraticCurveTo(-1, -12.5, 2, -11);
  ctx.quadraticCurveTo(6, -10, 8, -7.5);
  ctx.quadraticCurveTo(11, -4.5, 10.5, -1);
  ctx.quadraticCurveTo(10.5, 2, 7, 3);
  ctx.quadraticCurveTo(4, 4, 0, 3);
  ctx.quadraticCurveTo(-5, 4, -8, 2.5);
  ctx.quadraticCurveTo(-10.5, 2, -10, 1);
  ctx.closePath();
  ctx.fill();

  // Main canopy body with directional gradient (bright upper-left, dark lower-right)
  const canopyGrad = ctx.createRadialGradient(-3, -6, 1, 1, -2, 12);
  canopyGrad.addColorStop(0, "#5CD858");
  canopyGrad.addColorStop(0.3, "#40B838");
  canopyGrad.addColorStop(0.65, "#2A9828");
  canopyGrad.addColorStop(1, "#1C7018");
  ctx.fillStyle = canopyGrad;
  ctx.beginPath();
  ctx.moveTo(-9.5, 0.5);
  ctx.quadraticCurveTo(-11, -3, -8.5, -5.5);
  ctx.quadraticCurveTo(-7.5, -8, -3.5, -10);
  ctx.quadraticCurveTo(-0.5, -12, 2.5, -10.5);
  ctx.quadraticCurveTo(6.5, -9.5, 8.5, -7);
  ctx.quadraticCurveTo(10.5, -4, 10, -0.5);
  ctx.quadraticCurveTo(10, 2, 6.5, 2.5);
  ctx.quadraticCurveTo(3.5, 3.5, 0, 2.5);
  ctx.quadraticCurveTo(-4.5, 3.5, -7.5, 2);
  ctx.quadraticCurveTo(-10, 1.5, -9.5, 0.5);
  ctx.closePath();
  ctx.fill();

  // Lumpy foliage bumps along the canopy edge for organic silhouette
  const bumps = [
    { r: 4, x: -8, y: -3.5 },
    { r: 4.5, x: -5, y: -7.5 },
    { r: 4, x: -1, y: -9.5 },
    { r: 4.5, x: 3, y: -8.5 },
    { r: 4, x: 7, y: -5 },
    { r: 3.5, x: 8.5, y: -1.5 },
    { r: 3, x: -9, y: 0 },
  ];
  for (const b of bumps) {
    const bumpGrad = ctx.createRadialGradient(
      b.x - 1,
      b.y - 1.5,
      0,
      b.x,
      b.y,
      b.r
    );
    bumpGrad.addColorStop(0, "#50C848");
    bumpGrad.addColorStop(0.5, "#38A830");
    bumpGrad.addColorStop(1, "#288820");
    ctx.fillStyle = bumpGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright sunlit patches (upper-left quadrant)
  const sunPatches = [
    { r: 3.2, x: -5, y: -7 },
    { r: 2.8, x: -1, y: -9 },
    { r: 2.5, x: -7, y: -3 },
    { r: 2, x: 1, y: -7 },
  ];
  for (const p of sunPatches) {
    const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    pGrad.addColorStop(0, "rgba(120,240,80,0.5)");
    pGrad.addColorStop(0.6, "rgba(80,210,60,0.2)");
    pGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Specular highlights — sharp bright spots that pop even at small size
  ctx.fillStyle = "#A8FF80";
  ctx.beginPath();
  ctx.arc(-4, -8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#90FF68";
  ctx.beginPath();
  ctx.arc(0, -9.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#B0FFA0";
  ctx.beginPath();
  ctx.arc(-7, -3.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Shadow crevices between bumps for depth
  ctx.fillStyle = "rgba(10,50,10,0.25)";
  ctx.beginPath();
  ctx.arc(-3, -5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1, -4, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -3, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Dark shadow on bottom-right of canopy for volume
  const shadowGrad = ctx.createRadialGradient(6, 1, 0, 4, -1, 8);
  shadowGrad.addColorStop(0, "rgba(0,30,0,0.3)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(5, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Canopy edge outline for definition against dark backgrounds
  ctx.strokeStyle = "rgba(20,80,15,0.5)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-9.5, 0.5);
  ctx.quadraticCurveTo(-11, -3, -8.5, -5.5);
  ctx.quadraticCurveTo(-7.5, -8, -3.5, -10);
  ctx.quadraticCurveTo(-0.5, -12, 2.5, -10.5);
  ctx.quadraticCurveTo(6.5, -9.5, 8.5, -7);
  ctx.quadraticCurveTo(10.5, -4, 10, -0.5);
  ctx.quadraticCurveTo(10, 2, 6.5, 2.5);
  ctx.quadraticCurveTo(3.5, 3.5, 0, 2.5);
  ctx.quadraticCurveTo(-4.5, 3.5, -7.5, 2);
  ctx.quadraticCurveTo(-10, 1.5, -9.5, 0.5);
  ctx.closePath();
  ctx.stroke();

  // Bright rim arc on the sun-facing side
  ctx.strokeStyle = "rgba(130,240,90,0.3)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-9, -2);
  ctx.quadraticCurveTo(-8, -7, -4, -9.5);
  ctx.quadraticCurveTo(-1, -11.5, 2, -10.5);
  ctx.stroke();
}

function drawSwampIcon(ctx: CanvasRenderingContext2D): void {
  // Murky puddle
  const puddleGrad = ctx.createRadialGradient(0, 9, 0, 0, 9, 10);
  puddleGrad.addColorStop(0, "rgba(30,100,70,0.5)");
  puddleGrad.addColorStop(1, "rgba(20,60,40,0.1)");
  ctx.fillStyle = puddleGrad;
  ctx.beginPath();
  ctx.ellipse(0, 9, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stem — wider and clearly visible
  const stemGrad = ctx.createLinearGradient(-3, -2, 3, 5);
  stemGrad.addColorStop(0, "#E0D0B8");
  stemGrad.addColorStop(0.5, "#C8B898");
  stemGrad.addColorStop(1, "#A89878");
  ctx.fillStyle = stemGrad;
  ctx.beginPath();
  ctx.moveTo(-3, 5);
  ctx.lineTo(-2.5, -2);
  ctx.lineTo(2.5, -2);
  ctx.lineTo(3, 5);
  ctx.closePath();
  ctx.fill();

  // Stem shadow side
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.moveTo(-3, 5);
  ctx.lineTo(-2.5, -2);
  ctx.lineTo(0, -2);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  // Stem highlight
  ctx.fillStyle = "rgba(255,240,220,0.35)";
  ctx.fillRect(0.5, -1, 1, 5);

  // Cap glow halo
  const capGlow = ctx.createRadialGradient(0, -5, 2, 0, -5, 13);
  capGlow.addColorStop(0, "rgba(180,60,240,0.2)");
  capGlow.addColorStop(1, "rgba(180,60,240,0)");
  ctx.fillStyle = capGlow;
  ctx.beginPath();
  ctx.arc(0, -5, 13, 0, Math.PI * 2);
  ctx.fill();

  // Cap — organic dome shape with hand-drawn outline
  const capGrad = ctx.createRadialGradient(-2, -8, 1, 0, -4, 12);
  capGrad.addColorStop(0, "#E068FF");
  capGrad.addColorStop(0.3, "#C040E8");
  capGrad.addColorStop(0.6, "#A028D0");
  capGrad.addColorStop(1, "#7818A8");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.quadraticCurveTo(-11, -5, -9, -7);
  ctx.quadraticCurveTo(-7, -9.5, -4, -10.5);
  ctx.quadraticCurveTo(-1, -11.5, 2, -10.5);
  ctx.quadraticCurveTo(5, -9.5, 8, -7.5);
  ctx.quadraticCurveTo(10.5, -5, 10, -2.5);
  ctx.quadraticCurveTo(10, -1.5, 6, -1);
  ctx.quadraticCurveTo(3, -0.5, 0, -1.5);
  ctx.quadraticCurveTo(-4, -0.5, -7, -1);
  ctx.quadraticCurveTo(-10, -1.5, -10, -2);
  ctx.closePath();
  ctx.fill();

  // Cap underside shadow
  ctx.fillStyle = "rgba(60,10,90,0.5)";
  ctx.beginPath();
  ctx.moveTo(-9, -1.5);
  ctx.quadraticCurveTo(-5, 1, 0, 0);
  ctx.quadraticCurveTo(5, 1, 9, -1.5);
  ctx.quadraticCurveTo(5, -0.5, 0, -1);
  ctx.quadraticCurveTo(-5, -0.5, -9, -1.5);
  ctx.closePath();
  ctx.fill();

  // Glowing spots with halos
  const spots = [
    { r: 2.2, x: -5, y: -7 },
    { r: 1.8, x: 2, y: -8 },
    { r: 1.5, x: 6, y: -5 },
    { r: 1.3, x: -1, y: -9.5 },
    { r: 1.2, x: -8, y: -4 },
    { r: 1, x: 4, y: -4 },
  ];
  for (const s of spots) {
    const hGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r + 1.5);
    hGrad.addColorStop(0, "rgba(240,180,255,0.4)");
    hGrad.addColorStop(1, "rgba(240,180,255,0)");
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E8B0FF";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cap rim highlight
  ctx.strokeStyle = "rgba(230,120,255,0.5)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-9, -5);
  ctx.quadraticCurveTo(-6, -9, -2, -10.5);
  ctx.quadraticCurveTo(1, -11, 3, -10);
  ctx.stroke();

  // Bioluminescent bubbles
  const bubbles = [
    { r: 1.8, x: -6, y: 5 },
    { r: 1.4, x: 5, y: 6 },
    { r: 1, x: -2, y: 7 },
    { r: 0.8, x: 7, y: 7.5 },
  ];
  for (const b of bubbles) {
    const bGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r + 1.2);
    bGrad.addColorStop(0, "rgba(128,255,208,0.4)");
    bGrad.addColorStop(1, "rgba(128,255,208,0)");
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#80FFD0";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(220,255,245,0.6)";
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spore particles
  ctx.fillStyle = "rgba(200,120,255,0.5)";
  const spores = [
    [-6, -1, 0.6],
    [7, -1, 0.5],
    [-3, -11, 0.5],
    [4, -10, 0.45],
    [0, -12, 0.4],
  ] as const;
  for (const [sx, sy, sr] of spores) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDesertIcon(ctx: CanvasRenderingContext2D): void {
  // Outer corona glow
  const coronaGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 14);
  coronaGrad.addColorStop(0, "rgba(255,200,0,0.3)");
  coronaGrad.addColorStop(1, "rgba(255,150,0,0)");
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  // 8 bold rays with organic pointed shapes
  for (let r = 0; r < 8; r++) {
    const a = (r * Math.PI) / 4;
    const isLong = r % 2 === 0;
    const outerR = isLong ? 12.5 : 10;
    const halfW = isLong ? 1.8 : 1.2;

    ctx.save();
    ctx.rotate(a);
    const rayGrad = ctx.createLinearGradient(0, -6.5, 0, -outerR);
    rayGrad.addColorStop(0, "#FFAA00");
    rayGrad.addColorStop(1, isLong ? "#FFD860" : "#FFC040");
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(-halfW, -6.5);
    ctx.quadraticCurveTo(-halfW * 0.4, -(outerR - 2), 0, -outerR);
    ctx.quadraticCurveTo(halfW * 0.4, -(outerR - 2), halfW, -6.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Sun body with rich radial gradient
  const bodyGrad = ctx.createRadialGradient(-1, -1.5, 0, 0, 0, 7);
  bodyGrad.addColorStop(0, "#FFF0C0");
  bodyGrad.addColorStop(0.2, "#FFE060");
  bodyGrad.addColorStop(0.5, "#FFC020");
  bodyGrad.addColorStop(0.8, "#FFAA00");
  bodyGrad.addColorStop(1, "#E08800");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Body rim
  ctx.strokeStyle = "rgba(180,100,0,0.35)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.stroke();

  // Bright inner core
  const coreGrad = ctx.createRadialGradient(-0.5, -1, 0, 0, 0, 4);
  coreGrad.addColorStop(0, "#FFFDE0");
  coreGrad.addColorStop(0.4, "#FFE870");
  coreGrad.addColorStop(1, "#FFC830");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, -0.5, 4, 0, Math.PI * 2);
  ctx.fill();

  // White-hot center
  ctx.fillStyle = "#FFF8E0";
  ctx.beginPath();
  ctx.arc(-0.3, -0.8, 2, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(-2, -2.5, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Bottom shadow crescent for volume
  const shadowCrescent = ctx.createRadialGradient(1, 2, 0, 0, 0, 7);
  shadowCrescent.addColorStop(0, "rgba(180,80,0,0.2)");
  shadowCrescent.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowCrescent;
  ctx.beginPath();
  ctx.arc(1, 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Rim light on upper-left
  ctx.strokeStyle = "rgba(255,240,180,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 6.2, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();
}

function drawWinterIcon(ctx: CanvasRenderingContext2D): void {
  // Soft icy glow behind
  const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
  glowGrad.addColorStop(0, "rgba(180,225,255,0.3)");
  glowGrad.addColorStop(1, "rgba(140,200,255,0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);

    // Main branch — bold tapered arm
    const branchGrad = ctx.createLinearGradient(0, 0, 0, -11);
    branchGrad.addColorStop(0, "#D8EEFF");
    branchGrad.addColorStop(0.5, "#C0DFFF");
    branchGrad.addColorStop(1, "#A8D0FF");
    ctx.fillStyle = branchGrad;
    ctx.beginPath();
    ctx.moveTo(-1.5, 0);
    ctx.lineTo(-0.5, -10.5);
    ctx.lineTo(0.5, -10.5);
    ctx.lineTo(1.5, 0);
    ctx.closePath();
    ctx.fill();

    // Branch edge highlight
    ctx.strokeStyle = "rgba(200,230,255,0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0.5, -10.5);
    ctx.lineTo(1.5, 0);
    ctx.stroke();

    // Diamond tip
    const tipGrad = ctx.createLinearGradient(0, -13, 0, -9);
    tipGrad.addColorStop(0, "#FFFFFF");
    tipGrad.addColorStop(1, "#C8E4FF");
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(-2.5, -10.5);
    ctx.lineTo(0, -8.5);
    ctx.lineTo(2.5, -10.5);
    ctx.closePath();
    ctx.fill();

    // Lower sub-branches — wider, more visible
    ctx.fillStyle = "#C0DFFF";
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(-5.5, -6.5);
    ctx.lineTo(-4, -5);
    ctx.lineTo(0, -2.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(5.5, -6.5);
    ctx.lineTo(4, -5);
    ctx.lineTo(0, -2.2);
    ctx.closePath();
    ctx.fill();

    // Upper sub-branches
    ctx.fillStyle = "#D0E8FF";
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-4, -9);
    ctx.lineTo(-2.8, -7.8);
    ctx.lineTo(0, -5.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, -9);
    ctx.lineTo(2.8, -7.8);
    ctx.lineTo(0, -5.3);
    ctx.closePath();
    ctx.fill();

    // Tip sparkle
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, -13, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Center crystal with rich gradient
  const centerGrad = ctx.createRadialGradient(-0.5, -0.5, 0, 0, 0, 3.5);
  centerGrad.addColorStop(0, "#FFFFFF");
  centerGrad.addColorStop(0.4, "#E8F4FF");
  centerGrad.addColorStop(1, "#B0D8FF");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Center facet ring
  ctx.strokeStyle = "rgba(140,200,255,0.5)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.stroke();

  // Center specular
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(-0.8, -0.8, 1, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle particles
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  const sparkles = [
    [-6, -8.5, 0.5],
    [7, -4, 0.45],
    [-3.5, 7.5, 0.45],
    [5, 7, 0.4],
    [8, 2, 0.35],
    [-7.5, 1, 0.4],
    [-1, -12, 0.35],
    [4, -10, 0.3],
  ] as const;
  for (const [sx, sy, sr] of sparkles) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVolcanicIcon(ctx: CanvasRenderingContext2D): void {
  // Wide heat-haze glow — layered for depth
  const haze1 = ctx.createRadialGradient(0, 2, 2, 0, 2, 16);
  haze1.addColorStop(0, "rgba(255,80,0,0.28)");
  haze1.addColorStop(0.5, "rgba(255,40,0,0.12)");
  haze1.addColorStop(1, "rgba(200,20,0,0)");
  ctx.fillStyle = haze1;
  ctx.beginPath();
  ctx.arc(0, 2, 16, 0, Math.PI * 2);
  ctx.fill();

  const haze2 = ctx.createRadialGradient(0, -2, 1, 0, 0, 12);
  haze2.addColorStop(0, "rgba(255,160,40,0.18)");
  haze2.addColorStop(1, "rgba(255,100,0,0)");
  ctx.fillStyle = haze2;
  ctx.beginPath();
  ctx.arc(0, -2, 12, 0, Math.PI * 2);
  ctx.fill();

  // Lava pool at base — hotter gradient
  const lavaGrad = ctx.createRadialGradient(0, 10, 0, 0, 10, 8);
  lavaGrad.addColorStop(0, "rgba(255,180,40,0.55)");
  lavaGrad.addColorStop(0.5, "rgba(255,100,20,0.3)");
  lavaGrad.addColorStop(1, "rgba(180,30,0,0)");
  ctx.fillStyle = lavaGrad;
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outermost flame silhouette — deep crimson with ragged edges
  const outerGrad = ctx.createLinearGradient(0, -14, 0, 11);
  outerGrad.addColorStop(0, "#880800");
  outerGrad.addColorStop(0.25, "#BB1500");
  outerGrad.addColorStop(0.6, "#DD2200");
  outerGrad.addColorStop(1, "#771000");
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.quadraticCurveTo(2, -11, 4, -9);
  ctx.quadraticCurveTo(7, -6, 8.5, -2);
  ctx.quadraticCurveTo(9.5, 2, 8, 5);
  ctx.quadraticCurveTo(6.5, 9, 3, 10.5);
  ctx.quadraticCurveTo(1, 11, 0, 11);
  ctx.quadraticCurveTo(-1, 11, -3, 10.5);
  ctx.quadraticCurveTo(-6.5, 9, -8, 5);
  ctx.quadraticCurveTo(-9.5, 2, -8.5, -2);
  ctx.quadraticCurveTo(-7, -6, -4, -9);
  ctx.quadraticCurveTo(-2, -11, 0, -13);
  ctx.fill();

  // Left flame tendril — tall, curving lick
  ctx.fillStyle = "#DD2800";
  ctx.beginPath();
  ctx.moveTo(-3.5, -7);
  ctx.quadraticCurveTo(-7, -11, -5.5, -14);
  ctx.quadraticCurveTo(-4, -12, -3, -10);
  ctx.quadraticCurveTo(-1.5, -8, -2, -7);
  ctx.closePath();
  ctx.fill();

  // Right flame tendril
  ctx.fillStyle = "#EE3000";
  ctx.beginPath();
  ctx.moveTo(3, -6);
  ctx.quadraticCurveTo(6, -9, 6.5, -12.5);
  ctx.quadraticCurveTo(4.5, -10, 3.5, -8.5);
  ctx.quadraticCurveTo(2.5, -7, 2, -6);
  ctx.closePath();
  ctx.fill();

  // Small left side lick
  ctx.fillStyle = "#CC2000";
  ctx.beginPath();
  ctx.moveTo(-7, -1);
  ctx.quadraticCurveTo(-9.5, -4, -8, -7);
  ctx.quadraticCurveTo(-7.5, -4, -6.5, -2);
  ctx.closePath();
  ctx.fill();

  // Small right side lick
  ctx.fillStyle = "#CC2500";
  ctx.beginPath();
  ctx.moveTo(7, 0);
  ctx.quadraticCurveTo(9.5, -3, 8.5, -6);
  ctx.quadraticCurveTo(8, -3.5, 6.5, -1);
  ctx.closePath();
  ctx.fill();

  // Middle flame layer — fiery orange with wavy edges
  const midGrad = ctx.createRadialGradient(-1, -5, 1, 0, 1, 10);
  midGrad.addColorStop(0, "#FF8800");
  midGrad.addColorStop(0.35, "#FF6600");
  midGrad.addColorStop(0.7, "#EE4400");
  midGrad.addColorStop(1, "#CC2800");
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(0, -10.5);
  ctx.quadraticCurveTo(3, -7, 5, -3);
  ctx.quadraticCurveTo(6.5, 1, 6, 4);
  ctx.quadraticCurveTo(5, 8, 2.5, 9.5);
  ctx.quadraticCurveTo(0.5, 10, 0, 10);
  ctx.quadraticCurveTo(-0.5, 10, -2.5, 9.5);
  ctx.quadraticCurveTo(-5, 8, -6, 4);
  ctx.quadraticCurveTo(-6.5, 1, -5, -3);
  ctx.quadraticCurveTo(-3, -7, 0, -10.5);
  ctx.fill();

  // Inner flame — bright amber/gold
  const innerGrad = ctx.createRadialGradient(-0.5, -4, 0, 0, 1, 8);
  innerGrad.addColorStop(0, "#FFD020");
  innerGrad.addColorStop(0.4, "#FFBB00");
  innerGrad.addColorStop(0.8, "#FF8800");
  innerGrad.addColorStop(1, "#EE5500");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(0, -7.5);
  ctx.quadraticCurveTo(2.5, -4.5, 3.5, -1);
  ctx.quadraticCurveTo(4.5, 3, 3, 6);
  ctx.quadraticCurveTo(1.5, 8.5, 0, 8.5);
  ctx.quadraticCurveTo(-1.5, 8.5, -3, 6);
  ctx.quadraticCurveTo(-4.5, 3, -3.5, -1);
  ctx.quadraticCurveTo(-2.5, -4.5, 0, -7.5);
  ctx.fill();

  // Hot core — intense yellow
  const coreGrad = ctx.createRadialGradient(0, -1, 0, 0, 2.5, 5.5);
  coreGrad.addColorStop(0, "#FFF8A0");
  coreGrad.addColorStop(0.3, "#FFE840");
  coreGrad.addColorStop(0.7, "#FFCC00");
  coreGrad.addColorStop(1, "#FFAA00");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(1.8, -2, 2.2, 1);
  ctx.quadraticCurveTo(2.8, 4, 1.5, 6);
  ctx.quadraticCurveTo(0.5, 7, 0, 7);
  ctx.quadraticCurveTo(-0.5, 7, -1.5, 6);
  ctx.quadraticCurveTo(-2.8, 4, -2.2, 1);
  ctx.quadraticCurveTo(-1.8, -2, 0, -4);
  ctx.fill();

  // White-hot center teardrop — larger, more intense
  const hotGrad = ctx.createLinearGradient(0, 0, 0, 6);
  hotGrad.addColorStop(0, "#FFFDE8");
  hotGrad.addColorStop(0.5, "#FFF8C0");
  hotGrad.addColorStop(1, "#FFE880");
  ctx.fillStyle = hotGrad;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.moveTo(0, -0.5);
  ctx.quadraticCurveTo(1.2, 1.5, 1.2, 3.5);
  ctx.quadraticCurveTo(0.8, 5.5, 0, 5.8);
  ctx.quadraticCurveTo(-0.8, 5.5, -1.2, 3.5);
  ctx.quadraticCurveTo(-1.2, 1.5, 0, -0.5);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Bright specular highlight near top of inner flame
  ctx.fillStyle = "rgba(255,255,240,0.5)";
  ctx.beginPath();
  ctx.arc(-0.8, -2.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Flickering rim highlights on outer flame edge
  ctx.strokeStyle = "rgba(255,200,80,0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.quadraticCurveTo(-4, -9, -1, -11);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, -7);
  ctx.quadraticCurveTo(6, -5, 7, -2);
  ctx.stroke();

  // Ember particles — more, varied sizes and colors, scattered widely
  const embers: [number, number, number, string][] = [
    [-4, -12, 1.2, "#FFD800"],
    [3.5, -11, 1, "#FF8800"],
    [0.5, -13.5, 0.8, "#FFCC00"],
    [-2, -14, 0.6, "#FF6600"],
    [5.5, -8, 0.6, "#FFAA00"],
    [-6, -9, 0.5, "#FFB830"],
    [1.5, -15, 0.5, "#FFE060"],
    [-4.5, -14.5, 0.45, "#FF9940"],
    [6, -5, 0.55, "#FFD040"],
    [-7, -5.5, 0.45, "#FF7720"],
    [4.5, -13, 0.4, "#FFE880"],
    [-1, -16, 0.35, "#FFCC60"],
  ];
  for (const [ex, ey, er, ec] of embers) {
    const eGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, er + 1);
    eGlow.addColorStop(0, ec);
    eGlow.addColorStop(1, ec.slice(0, 7) + "00");
    ctx.fillStyle = eGlow;
    ctx.beginPath();
    ctx.arc(ex, ey, er + 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ec;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny spark streaks rising from the flame
  ctx.strokeStyle = "rgba(255,200,60,0.4)";
  ctx.lineWidth = 0.5;
  const sparks: [number, number, number, number][] = [
    [-3, -11, -3.5, -13],
    [2, -10, 2.5, -12.5],
    [0, -12, -0.5, -14.5],
    [5, -7, 5.5, -9],
    [-5.5, -8, -6, -10.5],
  ];
  for (const [x1, y1, x2, y2] of sparks) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Challenge sigil — base X/crossed-blades design stylized per region
// ---------------------------------------------------------------------------

const CHALLENGE_PALETTES: Record<
  RegionType,
  {
    bgGlow: string;
    diamondDark: string;
    diamondLight: string;
    bladeStroke: string;
    bladeHighlight: string;
    center: string;
    centerGlow: string;
    accentA: string;
    accentB: string;
  }
> = {
  desert: {
    accentA: "#FFAA00",
    accentB: "#FFD860",
    bgGlow: "rgba(255,180,40,0.18)",
    bladeHighlight: "#FFF0D0",
    bladeStroke: "#FFE0A0",
    center: "#FFF0D0",
    centerGlow: "rgba(255,220,100,0.3)",
    diamondDark: "#8A5A10",
    diamondLight: "#B88020",
  },
  grassland: {
    accentA: "#50C050",
    accentB: "#80FF80",
    bgGlow: "rgba(60,180,80,0.18)",
    bladeHighlight: "#D0FFD0",
    bladeStroke: "#A0E8A0",
    center: "#E0FFD0",
    centerGlow: "rgba(100,255,100,0.3)",
    diamondDark: "#1A5A28",
    diamondLight: "#2E8840",
  },
  swamp: {
    accentA: "#A060E0",
    accentB: "#80FFD0",
    bgGlow: "rgba(120,60,180,0.18)",
    bladeHighlight: "#E8D0FF",
    bladeStroke: "#C8A0FF",
    center: "#E8D0FF",
    centerGlow: "rgba(180,120,255,0.3)",
    diamondDark: "#3A1858",
    diamondLight: "#582888",
  },
  volcanic: {
    accentA: "#FF6020",
    accentB: "#FFD800",
    bgGlow: "rgba(255,80,20,0.18)",
    bladeHighlight: "#FFE0C0",
    bladeStroke: "#FFB880",
    center: "#FFF0D0",
    centerGlow: "rgba(255,150,60,0.35)",
    diamondDark: "#781810",
    diamondLight: "#A83020",
  },
  winter: {
    accentA: "#60B0E8",
    accentB: "#FFFFFF",
    bgGlow: "rgba(100,180,255,0.18)",
    bladeHighlight: "#E0F0FF",
    bladeStroke: "#B0D8FF",
    center: "#E8F4FF",
    centerGlow: "rgba(140,200,255,0.3)",
    diamondDark: "#1A4878",
    diamondLight: "#2868A8",
  },
};

export function drawChallengeSigil(
  ctx: CanvasRenderingContext2D,
  type: RegionType,
  scale: number = 1
): void {
  const p = CHALLENGE_PALETTES[type];
  const S = scale;

  // Background glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * S);
  glow.addColorStop(0, p.bgGlow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 12 * S, 0, Math.PI * 2);
  ctx.fill();

  // Diamond body with gradient
  const dGrad = ctx.createLinearGradient(-9 * S, 0, 9 * S, 0);
  dGrad.addColorStop(0, p.diamondDark);
  dGrad.addColorStop(0.35, p.diamondLight);
  dGrad.addColorStop(0.65, p.diamondLight);
  dGrad.addColorStop(1, p.diamondDark);
  ctx.fillStyle = dGrad;
  ctx.beginPath();
  ctx.moveTo(0, -11 * S);
  ctx.lineTo(9 * S, 0);
  ctx.lineTo(0, 11 * S);
  ctx.lineTo(-9 * S, 0);
  ctx.closePath();
  ctx.fill();

  // Diamond edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 0.6 * S;
  ctx.stroke();

  // Inner diamond (lighter)
  ctx.fillStyle = p.diamondLight;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(0, -7 * S);
  ctx.lineTo(5.5 * S, 0);
  ctx.lineTo(0, 7 * S);
  ctx.lineTo(-5.5 * S, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Crossed blades — bold X
  ctx.lineCap = "round";

  // Blade shadows
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2.2 * S;
  ctx.beginPath();
  ctx.moveTo(-7 * S, 7 * S);
  ctx.lineTo(7 * S, -7 * S);
  ctx.moveTo(-7 * S, -7 * S);
  ctx.lineTo(7 * S, 7 * S);
  ctx.stroke();

  // Blade main strokes
  ctx.strokeStyle = p.bladeStroke;
  ctx.lineWidth = 1.6 * S;
  ctx.beginPath();
  ctx.moveTo(-7 * S, 7 * S);
  ctx.lineTo(7 * S, -7 * S);
  ctx.moveTo(-7 * S, -7 * S);
  ctx.lineTo(7 * S, 7 * S);
  ctx.stroke();

  // Blade highlight strokes
  ctx.strokeStyle = p.bladeHighlight;
  ctx.lineWidth = 0.6 * S;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-6.5 * S, 6.5 * S);
  ctx.lineTo(6.5 * S, -6.5 * S);
  ctx.moveTo(-6.5 * S, -6.5 * S);
  ctx.lineTo(6.5 * S, 6.5 * S);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Region-specific accent details on the blade tips
  drawChallengeAccents(ctx, type, S);

  // Center gem glow
  const gemGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 4.5 * S);
  gemGlow.addColorStop(0, p.centerGlow);
  gemGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gemGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 4.5 * S, 0, Math.PI * 2);
  ctx.fill();

  // Center gem body
  const gemGrad = ctx.createRadialGradient(-0.5 * S, -0.5 * S, 0, 0, 0, 3 * S);
  gemGrad.addColorStop(0, p.center);
  gemGrad.addColorStop(0.5, p.accentA);
  gemGrad.addColorStop(1, p.diamondLight);
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 3 * S, 0, Math.PI * 2);
  ctx.fill();

  // Center gem rim
  ctx.strokeStyle = p.bladeStroke;
  ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.arc(0, 0, 3 * S, 0, Math.PI * 2);
  ctx.stroke();

  // Center gem specular
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(-0.8 * S, -0.8 * S, 1 * S, 0, Math.PI * 2);
  ctx.fill();
}

function drawChallengeAccents(
  ctx: CanvasRenderingContext2D,
  type: RegionType,
  S: number
): void {
  switch (type) {
    case "grassland": {
      // Tiny leaf shapes at blade tips
      ctx.fillStyle = "#50C050";
      const tips = [
        [7, -7],
        [-7, -7],
        [7, 7],
        [-7, 7],
      ];
      for (const [tx, ty] of tips) {
        ctx.beginPath();
        ctx.ellipse(
          tx * S,
          ty * S,
          1.5 * S,
          0.7 * S,
          Math.atan2(ty, tx),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      break;
    }
    case "swamp": {
      // Glowing spore dots near blade tips
      ctx.fillStyle = "#80FFD0";
      ctx.globalAlpha = 0.7;
      const pts = [
        [6, -6],
        [-6, -6],
        [6, 6],
        [-6, 6],
        [0, -9],
        [0, 9],
      ];
      for (const [px, py] of pts) {
        ctx.beginPath();
        ctx.arc(px * S, py * S, 0.7 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "desert": {
      // Small radiating lines from center (sun-burst accent)
      ctx.strokeStyle = "#FFD860";
      ctx.lineWidth = 0.5 * S;
      ctx.globalAlpha = 0.4;
      for (let r = 0; r < 8; r++) {
        const a = (r * Math.PI) / 4 + Math.PI / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 4 * S, Math.sin(a) * 4 * S);
        ctx.lineTo(Math.cos(a) * 6.5 * S, Math.sin(a) * 6.5 * S);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "winter": {
      // Tiny ice crystal dots at blade intersections
      ctx.fillStyle = "#FFFFFF";
      ctx.globalAlpha = 0.6;
      const icePos = [
        [3.5, -3.5],
        [-3.5, -3.5],
        [3.5, 3.5],
        [-3.5, 3.5],
      ];
      for (const [ix, iy] of icePos) {
        ctx.beginPath();
        ctx.moveTo(ix * S, (iy - 1) * S);
        ctx.lineTo((ix + 0.6) * S, iy * S);
        ctx.lineTo(ix * S, (iy + 1) * S);
        ctx.lineTo((ix - 0.6) * S, iy * S);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "volcanic": {
      // Small ember dots along the blades
      ctx.fillStyle = "#FFD800";
      const embers = [
        [5, -5],
        [-5, -5],
        [5, 5],
        [-5, 5],
        [2, -8],
        [-2, 8],
      ];
      for (const [ex, ey] of embers) {
        ctx.beginPath();
        ctx.arc(ex * S, ey * S, 0.8 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
}
