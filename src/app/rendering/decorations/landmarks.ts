// Princeton Tower Defense - Major Landmark Decorations
// Renders large, detailed decorations like pyramids, castles, etc.

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
  const lit = "#d4b584";
  const base = "#c4a574";
  const mid = "#b49564";
  const dark = "#9a7a4a";
  const shadow = "#7a5a30";
  const accent = "#d4a840";
  const stripe = "#8a6a3a";

  // Isometric body dimensions
  const bodyW = 44 * s;  // full width along isometric X
  const bodyD = 22 * s;  // depth (iso Y)
  const bodyH = 18 * s;  // height
  const iso = 0.5;

  // Body anchor = front-bottom-center of the body block
  const bx = x;
  const by = y;

  // Key isometric offsets
  const hw = bodyW * 0.5 * 0.866; // half-width projected
  const hd = bodyD * 0.5 * iso;   // half-depth projected

  // === GROUND SHADOW (flat) ===
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(bx + 4 * s, by + 6 * s, 42 * s, 16 * s, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // === PEDESTAL (single isometric prism) ===
  const pdW = 36 * s, pdH = 8 * s;
  const pdIso = pdW * 0.866 * 0.5;
  const pdD = pdW * iso * 0.5;
  // Top
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.moveTo(bx, by - pdH - pdD);
  ctx.lineTo(bx + pdIso, by - pdH);
  ctx.lineTo(bx, by - pdH + pdD);
  ctx.lineTo(bx - pdIso, by - pdH);
  ctx.closePath();
  ctx.fill();
  // Left face
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(bx - pdIso, by - pdH);
  ctx.lineTo(bx, by - pdH + pdD);
  ctx.lineTo(bx, by + pdD);
  ctx.lineTo(bx - pdIso, by);
  ctx.closePath();
  ctx.fill();
  // Right face
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(bx + pdIso, by - pdH);
  ctx.lineTo(bx, by - pdH + pdD);
  ctx.lineTo(bx, by + pdD);
  ctx.lineTo(bx + pdIso, by);
  ctx.closePath();
  ctx.fill();
  // Accent trim on top edges
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(bx - pdIso, by - pdH);
  ctx.lineTo(bx, by - pdH - pdD);
  ctx.lineTo(bx + pdIso, by - pdH);
  ctx.stroke();

  const bt = by - pdH; // body sits on top of pedestal

  // === TAIL (behind body) ===
  ctx.strokeStyle = mid;
  ctx.lineWidth = 3 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bx - hw + 4 * s, bt - bodyH * 0.5);
  ctx.bezierCurveTo(bx - hw - 10 * s, bt - bodyH * 0.7, bx - hw - 12 * s, bt - bodyH * 1.3, bx - hw - 6 * s, bt - bodyH * 1.5);
  ctx.stroke();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(bx - hw - 6 * s, bt - bodyH * 1.5, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // === LION BODY (isometric box with rounded back) ===
  // Back haunch (raised hump)
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(bx - hw, bt);
  ctx.lineTo(bx - hw, bt - bodyH * 0.8);
  ctx.bezierCurveTo(bx - hw + 6 * s, bt - bodyH * 1.4, bx - 4 * s, bt - bodyH * 1.4, bx, bt - bodyH);
  ctx.lineTo(bx, bt);
  ctx.closePath();
  ctx.fill();

  // Body left face (shadow side)
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.moveTo(bx - hw, bt);
  ctx.lineTo(bx - hw, bt - bodyH * 0.8);
  ctx.bezierCurveTo(bx - hw + 6 * s, bt - bodyH * 1.4, bx - 4 * s, bt - bodyH * 1.4, bx, bt - bodyH);
  ctx.lineTo(bx + hw, bt - bodyH);
  ctx.lineTo(bx + hw, bt);
  ctx.lineTo(bx, bt + hd);
  ctx.lineTo(bx - hw, bt);
  ctx.closePath();
  ctx.fill();

  // Body right face (lit side)
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(bx + hw, bt);
  ctx.lineTo(bx + hw, bt - bodyH);
  ctx.lineTo(bx, bt - bodyH - hd);
  ctx.bezierCurveTo(bx - 4 * s, bt - bodyH * 1.4 - hd, bx - hw + 6 * s, bt - bodyH * 1.4 - hd, bx - hw, bt - bodyH * 0.8 - hd);
  ctx.lineTo(bx - hw, bt - hd);
  ctx.lineTo(bx, bt + hd);
  ctx.lineTo(bx + hw, bt);
  ctx.closePath();
  ctx.fill();

  // Body top face
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(bx - hw, bt - bodyH * 0.8);
  ctx.bezierCurveTo(bx - hw + 6 * s, bt - bodyH * 1.4, bx - 4 * s, bt - bodyH * 1.4, bx, bt - bodyH);
  ctx.lineTo(bx + hw, bt - bodyH);
  ctx.lineTo(bx + hw - hw, bt - bodyH - hd);
  ctx.bezierCurveTo(bx - 4 * s, bt - bodyH * 1.4 - hd, bx - hw + 6 * s, bt - bodyH * 1.4 - hd, bx - hw, bt - bodyH * 0.8 - hd);
  ctx.closePath();
  ctx.fill();

  // Front face of body (between paws)
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.moveTo(bx + hw, bt);
  ctx.lineTo(bx + hw, bt - bodyH);
  ctx.lineTo(bx, bt - bodyH - hd);
  ctx.lineTo(bx, bt + hd);
  ctx.closePath();
  ctx.fill();

  // === FRONT PAWS (two isometric blocks extending forward) ===
  const pawL = 18 * s;
  const pawW = 6 * s;
  const pawH = 5 * s;
  const pawFrontX = bx + hw;
  const pawIso = pawW * 0.866 * 0.5;

  // Left paw (lower, shadow side)
  const lpY = bt - 2 * s;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(pawFrontX, lpY);
  ctx.lineTo(pawFrontX + pawL * 0.5, lpY + pawL * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5, lpY + pawL * 0.25 + pawH);
  ctx.lineTo(pawFrontX, lpY + pawH);
  ctx.closePath();
  ctx.fill();
  // Top
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.moveTo(pawFrontX, lpY);
  ctx.lineTo(pawFrontX + pawL * 0.5, lpY + pawL * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5 - pawIso, lpY + pawL * 0.25 - pawW * 0.25);
  ctx.lineTo(pawFrontX - pawIso, lpY - pawW * 0.25);
  ctx.closePath();
  ctx.fill();
  // Outer side
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(pawFrontX + pawL * 0.5, lpY + pawL * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5 - pawIso, lpY + pawL * 0.25 - pawW * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5 - pawIso, lpY + pawL * 0.25 - pawW * 0.25 + pawH);
  ctx.lineTo(pawFrontX + pawL * 0.5, lpY + pawL * 0.25 + pawH);
  ctx.closePath();
  ctx.fill();

  // Right paw (upper, lit side)
  const rpY = bt - bodyH + 2 * s;
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.moveTo(pawFrontX, rpY);
  ctx.lineTo(pawFrontX + pawL * 0.5, rpY + pawL * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5, rpY + pawL * 0.25 + pawH);
  ctx.lineTo(pawFrontX, rpY + pawH);
  ctx.closePath();
  ctx.fill();
  // Top
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(pawFrontX, rpY);
  ctx.lineTo(pawFrontX + pawL * 0.5, rpY + pawL * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5 + pawIso, rpY + pawL * 0.25 - pawW * 0.25);
  ctx.lineTo(pawFrontX + pawIso, rpY - pawW * 0.25);
  ctx.closePath();
  ctx.fill();
  // Outer side
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(pawFrontX + pawL * 0.5, rpY + pawL * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5 + pawIso, rpY + pawL * 0.25 - pawW * 0.25);
  ctx.lineTo(pawFrontX + pawL * 0.5 + pawIso, rpY + pawL * 0.25 - pawW * 0.25 + pawH);
  ctx.lineTo(pawFrontX + pawL * 0.5, rpY + pawL * 0.25 + pawH);
  ctx.closePath();
  ctx.fill();

  // === HEAD (isometric block with tapered chin) ===
  const hx2 = bx + hw - 4 * s;
  const hy2 = bt - bodyH - 6 * s;
  const headW = 14 * s;
  const headH = 20 * s;
  const headD = 12 * s;
  const hdIso = headW * 0.866 * 0.5;
  const hdDep = headD * iso * 0.5;

  // Nemes lappets (drape down behind head on both sides)
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.moveTo(hx2 - hdIso - 2 * s, hy2);
  ctx.lineTo(hx2 - hdIso - 4 * s, hy2 + headH + 8 * s);
  ctx.lineTo(hx2 - hdIso, hy2 + headH + 8 * s);
  ctx.lineTo(hx2 - hdIso + 2 * s, hy2 + 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(hx2 + hdIso + 2 * s, hy2);
  ctx.lineTo(hx2 + hdIso + 4 * s, hy2 + headH + 8 * s);
  ctx.lineTo(hx2 + hdIso, hy2 + headH + 8 * s);
  ctx.lineTo(hx2 + hdIso - 2 * s, hy2 + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Head left face
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(hx2 - hdIso, hy2);
  ctx.lineTo(hx2, hy2 + hdDep);
  ctx.lineTo(hx2, hy2 + headH + hdDep - 4 * s);
  ctx.lineTo(hx2 - hdIso + 2 * s, hy2 + headH);
  ctx.closePath();
  ctx.fill();

  // Head right face
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(hx2 + hdIso, hy2);
  ctx.lineTo(hx2, hy2 + hdDep);
  ctx.lineTo(hx2, hy2 + headH + hdDep - 4 * s);
  ctx.lineTo(hx2 + hdIso - 2 * s, hy2 + headH);
  ctx.closePath();
  ctx.fill();

  // Head front face (where face features go)
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(hx2 - hdIso, hy2);
  ctx.lineTo(hx2 + hdIso, hy2);
  ctx.lineTo(hx2 + hdIso - 2 * s, hy2 + headH);
  ctx.lineTo(hx2 - hdIso + 2 * s, hy2 + headH);
  ctx.closePath();
  ctx.fill();

  // Nemes top dome
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(hx2 - hdIso - 2 * s, hy2);
  ctx.bezierCurveTo(hx2 - hdIso - 3 * s, hy2 - 10 * s, hx2 - 4 * s, hy2 - 16 * s, hx2, hy2 - 18 * s);
  ctx.bezierCurveTo(hx2 + 4 * s, hy2 - 16 * s, hx2 + hdIso + 3 * s, hy2 - 10 * s, hx2 + hdIso + 2 * s, hy2);
  ctx.closePath();
  ctx.fill();

  // Nemes stripes
  ctx.strokeStyle = stripe;
  ctx.lineWidth = 1.5 * s;
  for (let ns = 0; ns < 4; ns++) {
    const nsFrac = (ns + 1) / 5;
    const nsY = hy2 - 18 * s + nsFrac * 18 * s;
    const nsSpread = (hdIso + 2 * s) * Math.sin(nsFrac * Math.PI * 0.9);
    ctx.beginPath();
    ctx.moveTo(hx2 - nsSpread, nsY + nsFrac * 2 * s);
    ctx.quadraticCurveTo(hx2, nsY - 1.5 * s, hx2 + nsSpread, nsY + nsFrac * 2 * s);
    ctx.stroke();
  }

  // Face features
  // Eyes
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(hx2 - 4 * s, hy2 + 4 * s, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx2 + 4 * s, hy2 + 4 * s, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.ellipse(hx2 - 4 * s, hy2 + 3.8 * s, 1.4 * s, 0.8 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx2 + 4 * s, hy2 + 3.8 * s, 1.4 * s, 0.8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(hx2, hy2 + 7 * s);
  ctx.lineTo(hx2 - 1.5 * s, hy2 + 10 * s);
  ctx.lineTo(hx2 + 1.5 * s, hy2 + 10 * s);
  ctx.closePath();
  ctx.fill();

  // Mouth
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(hx2 - 4 * s, hy2 + 13 * s);
  ctx.quadraticCurveTo(hx2, hy2 + 14.5 * s, hx2 + 4 * s, hy2 + 13 * s);
  ctx.stroke();

  // Uraeus (cobra ornament)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(hx2, hy2 - 14 * s);
  ctx.bezierCurveTo(hx2 - 2 * s, hy2 - 18 * s, hx2 + 2 * s, hy2 - 23 * s, hx2, hy2 - 25 * s);
  ctx.bezierCurveTo(hx2 + 3 * s, hy2 - 22 * s, hx2 + 3 * s, hy2 - 17 * s, hx2 + 1 * s, hy2 - 14 * s);
  ctx.closePath();
  ctx.fill();

  // Giant sphinx glowing eyes
  if (isGiant) {
    const eyeGlow = 0.5 + Math.sin(time * 2) * 0.3;
    ctx.fillStyle = `rgba(255,200,50,${eyeGlow})`;
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 12 * s;
    ctx.beginPath();
    ctx.ellipse(hx2 - 4 * s, hy2 + 4 * s, 2 * s, 1.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx2 + 4 * s, hy2 + 4 * s, 2 * s, 1.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
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
