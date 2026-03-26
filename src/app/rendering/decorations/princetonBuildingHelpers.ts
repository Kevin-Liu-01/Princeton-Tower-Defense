import { ISO_COS, ISO_SIN } from "../../constants";
import { drawIsometricPrism } from "../helpers";

const ISO_Y_RATIO = ISO_SIN / ISO_COS; // 0.5 for 2:1 isometric

export interface BuildingPalette {
  wallTop: string;
  wallLeft: string;
  wallRight: string;
  roofFront: string;
  roofSide: string;
  roofTop: string;
  roofDark: string;
  trim: string;
  trimLight: string;
  cornice: string;
  glass: string;
  foundTop: string;
  foundLeft: string;
  foundRight: string;
  door: string;
  accent: string;
}

// ─── Low-level face geometry ────────────────────────────────────────────

export function drawIsoFaceQuad(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number, W: number, D: number, H: number,
  u: number, v: number, wu: number, wv: number,
  face: "left" | "right",
): void {
  const iW = W * ISO_COS;
  const iD = D * ISO_SIN;
  const dir = face === "left" ? -1 : 1;
  const x0 = bx + dir * (1 - u) * iW;
  const y0 = by + (1 + u) * iD - v * H;
  const x1 = bx + dir * (1 - u - wu) * iW;
  const y1 = by + (1 + u + wu) * iD - v * H;
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1, y1 - wv * H);
  ctx.lineTo(x0, y0 - wv * H);
  ctx.closePath();
}

// ─── Wall texture helpers ───────────────────────────────────────────────

export function drawMortarLines(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number, width: number, height: number,
  rows: number, color: string, s: number,
): void {
  const iW = width * ISO_COS;
  const iD = width * ISO_SIN;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.4 * s;
  for (let r = 1; r < rows; r++) {
    const ry = baseY - height * (r / rows);
    ctx.beginPath();
    ctx.moveTo(cx - iW, ry + iD);
    ctx.lineTo(cx, ry + iD * 2);
    ctx.lineTo(cx + iW, ry + iD);
    ctx.stroke();
  }
}

export function drawBrickTexture(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number, width: number, height: number,
  s: number, brickColor: string, mortarColor: string,
  face: "left" | "right",
): void {
  const iW = width * ISO_COS;
  const iD = width * ISO_SIN;
  const rows = Math.floor(height / (2 * s));
  ctx.strokeStyle = mortarColor;
  ctx.lineWidth = 0.3 * s;
  for (let r = 0; r < rows; r++) {
    const ry = baseY - r * 2 * s;
    if (face === "left") {
      ctx.beginPath();
      ctx.moveTo(cx - iW, ry + iD);
      ctx.lineTo(cx, ry + iD * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx + iW, ry + iD);
      ctx.lineTo(cx, ry + iD * 2);
      ctx.stroke();
    }
    const brickCount = 3 + (r % 2);
    for (let b = 1; b < brickCount; b++) {
      const offset = r % 2 === 0 ? 0 : 0.5 / brickCount;
      const t = (b / brickCount) + offset;
      if (t >= 1) continue;
      const dir = face === "left" ? -1 : 1;
      const bx2 = cx + dir * iW * (1 - t);
      const by2 = ry + iD * (1 + t);
      ctx.beginPath();
      ctx.moveTo(bx2, by2);
      ctx.lineTo(bx2, by2 - 2 * s);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = brickColor;
  const dir = face === "left" ? -1 : 1;
  for (let i = 0; i < 8; i++) {
    const rx = cx + dir * iW * (0.1 + Math.sin(i * 2.7) * 0.35);
    const ry = baseY - height * (0.1 + (i * 0.11) % 0.8);
    ctx.beginPath();
    ctx.ellipse(rx, ry + iD, 2 * s, 1 * s, 0.2 * i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawStoneBlockTexture(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number, width: number, height: number,
  s: number, face: "left" | "right", seed: number,
): void {
  const iW = width * ISO_COS;
  const dir = face === "left" ? -1 : 1;
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 12; i++) {
    const hash = (seed * 31 + i * 17) % 100;
    const tx = cx + dir * iW * ((hash % 80) / 100);
    const ty = baseY - height * ((hash * 7 % 90) / 100);
    const bw = (1.5 + (hash % 3)) * s;
    const bh = (0.8 + (hash % 2) * 0.4) * s;
    ctx.fillStyle = hash % 3 === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.rect(tx - bw / 2, ty - bh / 2, bw, bh);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Tower foundation ──────────────────────────────────────────────────
// Draws a short cylinder (disc) whose top aligns with (cx, baseY)
// — matching the base of drawCylindricalTower.  Slightly wider than the
// tower so the foundation rim peeks out around the edges.

export function drawTowerFoundation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  towerRadius: number,
  s: number,
  lightColor: string,
  midColor: string,
  darkColor: string,
  foundH: number = 2.5,
): void {
  const r = (towerRadius + 1.5) * s;
  const ry = r * ISO_Y_RATIO;
  const h = foundH * s;
  const botY = baseY + h;

  const wallGrad = ctx.createLinearGradient(cx - r, baseY, cx + r, baseY);
  wallGrad.addColorStop(0, darkColor);
  wallGrad.addColorStop(0.35, lightColor);
  wallGrad.addColorStop(0.65, midColor);
  wallGrad.addColorStop(1, darkColor);
  ctx.fillStyle = wallGrad;
  ctx.beginPath();
  ctx.ellipse(cx, botY, r, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Cylindrical tower ─────────────────────────────────────────────────
// Draws a cylinder centered at (cx, baseY) in the isometric ground plane.
// Uses ISO_Y_RATIO for all ellipses so caps are proper isometric circles.

export function drawCylindricalTower(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  radius: number, height: number, s: number,
  lightColor: string, midColor: string, darkColor: string,
): void {
  const r = radius * s;
  const ry = r * ISO_Y_RATIO;
  const h = height * s;
  const topY = baseY - h;

  // Wall: front-visible portion from left edge → bottom → right edge,
  // then straight up on both sides to the top ellipse.
  const wallGrad = ctx.createLinearGradient(cx - r, baseY, cx + r, baseY);
  wallGrad.addColorStop(0, darkColor);
  wallGrad.addColorStop(0.35, lightColor);
  wallGrad.addColorStop(0.65, midColor);
  wallGrad.addColorStop(1, darkColor);
  ctx.fillStyle = wallGrad;

  ctx.beginPath();
  // Front half of base ellipse: CW from 0 (right) → π/2 (front) → π (left)
  ctx.ellipse(cx, baseY, r, ry, 0, 0, Math.PI);
  // Line up to top-left
  ctx.lineTo(cx - r, topY);
  // Back half of top ellipse: CCW from π (left) → 3π/2 (back) → 0 (right)
  ctx.ellipse(cx, topY, r, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  // Top cap
  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.ellipse(cx, topY, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Band lines on the FRONT-VISIBLE face
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.3 * s;
  const bands = Math.floor(h / (4 * s));
  for (let i = 1; i < bands; i++) {
    const bandY = baseY - (i / bands) * h;
    ctx.beginPath();
    ctx.ellipse(cx, bandY, r, ry, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Specular highlight stripe (clipped to wall surface)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - r, topY);
  ctx.ellipse(cx, topY, r, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.clip();
  const specGrad = ctx.createLinearGradient(cx - r, baseY, cx + r, baseY);
  specGrad.addColorStop(0, "rgba(255,255,255,0)");
  specGrad.addColorStop(0.25, "rgba(255,255,255,0.14)");
  specGrad.addColorStop(0.35, "rgba(255,255,255,0.06)");
  specGrad.addColorStop(0.5, "rgba(255,255,255,0)");
  specGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = specGrad;
  ctx.fillRect(cx - r, topY - 1, r * 2, h + ry + 2);
  ctx.restore();

  // Base shadow ring
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, ry, 0, 0, Math.PI);
  ctx.stroke();
}

// ─── Conical roof ───────────────────────────────────────────────────────
// Three isometric faces meeting at the tip, with curved base edges that
// follow the isometric ellipse of the base circle.

export function drawConicalRoof(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  radius: number, height: number, s: number,
  lightColor: string, darkColor: string,
): void {
  const r = radius * s;
  const ry = r * ISO_Y_RATIO;
  const h = height * s;
  const tipY = baseY - h;

  // Back face (drawn first, will be occluded by front faces):
  // tip → left edge → back arc (left→top→right) → right edge → tip
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx - r, baseY);
  // CW from π (left) → 0 (right) goes left→top→right = back arc
  ctx.ellipse(cx, baseY, r, ry, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Left face (lighter, faces the light):
  // tip → left edge → front-left arc (left→bottom) → front center → tip
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx - r, baseY);
  // CCW from π (left) → π/2 (bottom/front) = front-left quarter
  ctx.ellipse(cx, baseY, r, ry, 0, Math.PI, Math.PI * 0.5, true);
  ctx.closePath();
  ctx.fill();

  // Right face (darker, faces away from light):
  // tip → front center → front-right arc (bottom→right) → right edge → tip
  const mixGrad = ctx.createLinearGradient(cx, baseY + ry, cx + r, baseY);
  mixGrad.addColorStop(0, lightColor);
  mixGrad.addColorStop(1, darkColor);
  ctx.fillStyle = mixGrad;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx, baseY + ry);
  // CCW from π/2 (bottom/front) → 0 (right) = front-right quarter
  ctx.ellipse(cx, baseY, r, ry, 0, Math.PI * 0.5, 0, true);
  ctx.closePath();
  ctx.fill();

  // Ridge highlight from tip to front
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx, baseY + ry);
  ctx.stroke();

  // Horizontal ring texture lines
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.3 * s;
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const ringY = baseY + ry * (1 - t) - h * t;
    const ringR = r * (1 - t);
    const ringRy = ringR * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.ellipse(cx, ringY, ringR, ringRy, 0, 0, Math.PI);
    ctx.stroke();
  }
}

// ─── Circular battlements ───────────────────────────────────────────────
// Small cylindrical merlons placed on an isometric circle, drawn
// back-to-front so front merlons overlap rear ones.

export function drawCircularBattlements(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  radius: number, s: number, color: string,
  count: number = 8,
): void {
  const r = radius * s;
  const ry = r * ISO_Y_RATIO;
  const mR = 1.2 * s;
  const mRy = mR * ISO_Y_RATIO;
  const mH = 2.0 * s;

  // Sort merlons by screen-y so we draw back-to-front
  const angles: number[] = [];
  for (let i = 0; i < count; i++) angles.push((i / count) * Math.PI * 2);
  angles.sort((a, b) => Math.sin(a) - Math.sin(b));

  for (const angle of angles) {
    const mx = cx + Math.cos(angle) * r;
    const my = baseY + Math.sin(angle) * ry;

    // Merlon body (tiny cylinder)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(mx, my, mR, mRy, 0, 0, Math.PI);
    ctx.lineTo(mx - mR, my - mH);
    ctx.ellipse(mx, my - mH, mR, mRy, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Merlon cap
    ctx.beginPath();
    ctx.ellipse(mx, my - mH, mR, mRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Dome ───────────────────────────────────────────────────────────────
// Hemisphere rendered with bezier curves for the silhouette and a
// left-to-right gradient for isometric lighting.

const BEZIER_K = 0.552; // quarter-circle bezier approximation constant

export function drawDome(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  radius: number, height: number, s: number,
  lightColor: string, midColor: string, darkColor: string,
): void {
  const r = radius * s;
  const ry = r * ISO_Y_RATIO;
  const h = height * s;

  // Base rim ellipse
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r * 0.96, ry * 0.96, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dome surface: left base → bezier up to peak → bezier down to right base →
  // front arc (right→front→left) back to start
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY);
  ctx.bezierCurveTo(
    cx - r, baseY - h * BEZIER_K,
    cx - r * BEZIER_K, baseY - h,
    cx, baseY - h,
  );
  ctx.bezierCurveTo(
    cx + r * BEZIER_K, baseY - h,
    cx + r, baseY - h * BEZIER_K,
    cx + r, baseY,
  );
  // Front arc: CW from 0 (right) → π (left)
  ctx.ellipse(cx, baseY, r, ry, 0, 0, Math.PI);
  ctx.closePath();

  const domeGrad = ctx.createLinearGradient(cx - r, baseY, cx + r, baseY);
  domeGrad.addColorStop(0, darkColor);
  domeGrad.addColorStop(0.3, lightColor);
  domeGrad.addColorStop(0.6, midColor);
  domeGrad.addColorStop(1, darkColor);
  ctx.fillStyle = domeGrad;
  ctx.fill();

  // Meridian ribs
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 0.4 * s;
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    const ribX = cx + r * (2 * t - 1);
    const ctrlOff = r * 0.15;
    ctx.beginPath();
    ctx.moveTo(ribX, baseY);
    ctx.quadraticCurveTo(ribX + ctrlOff * (0.5 - t), baseY - h * 0.85, cx, baseY - h);
    ctx.stroke();
  }

  // Specular highlight spot
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.2, baseY - h * 0.65, r * 0.18, h * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Round windows on cylinder surfaces ─────────────────────────────────
// `angle` is in [0, π] for the front-visible half of the cylinder:
//   0 = right edge, π/2 = dead-center front, π = left edge.
// `vFrac` is vertical fraction (0 = base, 1 = top).

export function drawRoundWindowOnCylinder(
  ctx: CanvasRenderingContext2D,
  towerCx: number, towerBaseY: number,
  towerR: number, towerH: number,
  angle: number, vFrac: number, winR: number, s: number,
  frameColor: string, glassColor: string,
): void {
  const r = towerR * s;
  const ry = r * ISO_Y_RATIO;
  const h = towerH * s;
  const wx = towerCx + Math.cos(angle) * r * 0.92;
  const baseAtHeight = towerBaseY - h * vFrac;
  const wy = baseAtHeight + Math.sin(angle) * ry * 0.92;
  const wr = winR * s;

  // Height is vertical (not ground-plane compressed), width foreshortened
  const fShort = Math.sin(angle);
  const visWr = wr * Math.max(0.25, fShort);
  const visHr = wr * 1.35;

  // Surface normal direction (outward from cylinder) in screen space
  const nRawX = Math.cos(angle);
  const nRawY = Math.sin(angle) * ISO_Y_RATIO;
  const nLen = Math.sqrt(nRawX * nRawX + nRawY * nRawY);
  const nX = nRawX / nLen;
  const nY = nRawY / nLen;
  const recess = 0.7 * s;

  // 1. Deep recess shadow (offset inward along surface normal)
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(
    wx + nX * recess * 0.4, wy + nY * recess * 0.4,
    visWr * 1.3, visHr * 1.15, 0, 0, Math.PI * 2,
  );
  ctx.fill();

  // 2. Stone frame
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.ellipse(wx, wy, visWr * 1.2, visHr * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Inner recess (slight inward offset shows embrasure depth)
  const gOffX = nX * recess * 0.25;
  const gOffY = nY * recess * 0.25;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(wx + gOffX, wy + gOffY, visWr * 1.02, visHr * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Glass pane (offset into recess)
  ctx.fillStyle = glassColor;
  ctx.beginPath();
  ctx.ellipse(wx + gOffX, wy + gOffY, visWr, visHr * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Glass reflection (upper-left highlight, strength varies with facing)
  const reflAlpha = Math.max(0, fShort * 0.18);
  if (reflAlpha > 0.02) {
    ctx.fillStyle = `rgba(180,210,240,${reflAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      wx + gOffX - visWr * 0.22, wy + gOffY - visHr * 0.28,
      visWr * 0.3, visHr * 0.18, -0.35, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // 6. Muntins — offset with glass, shortened to stay inside pane
  const mX = wx + gOffX;
  const mY = wy + gOffY;
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 0.22 * s;
  ctx.beginPath();
  ctx.moveTo(mX - visWr * 0.85, mY);
  ctx.lineTo(mX + visWr * 0.85, mY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mX, mY - visHr * 0.82);
  ctx.lineTo(mX, mY + visHr * 0.82);
  ctx.stroke();

  // 7. Stone sill below window
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.ellipse(wx, wy + visHr * 1.05, visWr * 1.15, Math.max(0.3, fShort * 0.5) * s, 0, 0, Math.PI);
  ctx.fill();

  // 8. Lit-edge highlight on upper frame (light from upper-left)
  const hlAlpha = fShort * 0.1;
  if (hlAlpha > 0.01) {
    ctx.strokeStyle = `rgba(255,255,255,${hlAlpha})`;
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.ellipse(wx, wy, visWr * 1.18, visHr * 1.08, 0, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();
  }
}

// ─── Flying buttress ────────────────────────────────────────────────────

export function drawFlyingButtress(
  ctx: CanvasRenderingContext2D,
  wallX: number, wallTopY: number, wallBaseY: number,
  outwardDist: number, s: number,
  face: "left" | "right",
  stoneColor: string, darkColor: string,
): void {
  const dir = face === "left" ? -1 : 1;
  const ox = dir * outwardDist * ISO_COS * s;
  const oy = outwardDist * ISO_SIN * s * (face === "left" ? -1 : 1);
  const bx = wallX + ox;
  const by = wallBaseY + oy;
  const topAnchor = wallTopY + (wallBaseY - wallTopY) * 0.3;

  ctx.fillStyle = stoneColor;
  ctx.beginPath();
  ctx.moveTo(wallX, topAnchor);
  ctx.quadraticCurveTo((wallX + bx) / 2, topAnchor - 2 * s, bx, wallBaseY - 4 * s);
  ctx.lineTo(bx + dir * 1.5 * s, wallBaseY);
  ctx.lineTo(bx - dir * 0.5 * s, wallBaseY);
  ctx.lineTo(wallX, topAnchor + 1.5 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = darkColor;
  const pillarW = 1.8 * s;
  ctx.beginPath();
  ctx.moveTo(bx - pillarW, wallBaseY);
  ctx.lineTo(bx - pillarW * 0.7, wallBaseY - 8 * s);
  ctx.lineTo(bx + pillarW * 0.7, wallBaseY - 8 * s);
  ctx.lineTo(bx + pillarW, wallBaseY);
  ctx.closePath();
  ctx.fill();
}

// ─── Column portico ─────────────────────────────────────────────────────

export function drawColumnPortico(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  numCols: number, colH: number, spacing: number, s: number,
  colColor: string, capColor: string,
  face: "left" | "right",
): void {
  const fwd = face === "left" ? 1 : -1;
  for (let i = 0; i < numCols; i++) {
    const t = (i / (numCols - 1)) - 0.5;
    const cx = bx + fwd * spacing * t * ISO_COS * s;
    const cy = by + spacing * t * ISO_SIN * s;
    const r = 1.5 * s;
    const rTop = r * 0.8;
    const ry = r * ISO_Y_RATIO;
    const ryTop = rTop * ISO_Y_RATIO;
    const colTop = cy - colH * s;

    // Capital (isometric ellipse)
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.ellipse(cx, colTop - 0.5 * s, r * 1.3, ry * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shaft as tapered isometric cylinder (front half visible)
    const colGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    colGrad.addColorStop(0, capColor);
    colGrad.addColorStop(0.4, colColor);
    colGrad.addColorStop(1, capColor);
    ctx.fillStyle = colGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, ry, 0, 0, Math.PI);
    ctx.lineTo(cx - rTop, colTop);
    ctx.ellipse(cx, colTop, rTop, ryTop, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Fluting lines on cylinder surface
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.15 * s;
    for (let f = 0; f < 3; f++) {
      const angle = Math.PI * (0.3 + f * 0.2);
      const bfx = cx + Math.cos(angle) * r * 0.85;
      const tfx = cx + Math.cos(angle) * rTop * 0.85;
      ctx.beginPath();
      ctx.moveTo(bfx, cy + Math.sin(angle) * ry * 0.85);
      ctx.lineTo(tfx, colTop + Math.sin(angle) * ryTop * 0.85);
      ctx.stroke();
    }

    // Base (isometric ellipse)
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 0.5 * s, r * 1.2, ry * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Roof shapes ────────────────────────────────────────────────────────

export function drawGabledRoof(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  W: number, D: number, H: number,
  roofH: number, s: number, pal: BuildingPalette,
): void {
  const Ws = W * s; const Ds = D * s; const Hs = H * s;
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  const LT = { x: bx - iW, y: wt + iD };
  const FT = { x: bx, y: wt + 2 * iD };
  const RT = { x: bx + iW, y: wt + iD };
  const BT = { x: bx, y: wt };
  const rH = roofH * s;
  const RL = { x: (BT.x + LT.x) / 2, y: (BT.y + LT.y) / 2 - rH };
  const RR = { x: (FT.x + RT.x) / 2, y: (FT.y + RT.y) / 2 - rH };

  // Back-right slope (darkest, facing away from light)
  ctx.fillStyle = pal.roofDark;
  ctx.beginPath();
  ctx.moveTo(BT.x, BT.y); ctx.lineTo(RL.x, RL.y);
  ctx.lineTo(RR.x, RR.y); ctx.lineTo(RT.x, RT.y);
  ctx.closePath(); ctx.fill();

  // Back-left gable (side triangle)
  ctx.fillStyle = pal.roofSide;
  ctx.beginPath();
  ctx.moveTo(BT.x, BT.y); ctx.lineTo(RL.x, RL.y); ctx.lineTo(LT.x, LT.y);
  ctx.closePath(); ctx.fill();

  // Front-right gable (side triangle)
  ctx.beginPath();
  ctx.moveTo(RT.x, RT.y); ctx.lineTo(RR.x, RR.y); ctx.lineTo(FT.x, FT.y);
  ctx.closePath(); ctx.fill();

  // Front-left slope (lightest, facing the light)
  const fLG = ctx.createLinearGradient(RL.x, RL.y, FT.x, FT.y);
  fLG.addColorStop(0, pal.roofFront);
  fLG.addColorStop(0.5, pal.roofTop);
  fLG.addColorStop(1, pal.roofFront);
  ctx.fillStyle = fLG;
  ctx.beginPath();
  ctx.moveTo(LT.x, LT.y); ctx.lineTo(RL.x, RL.y);
  ctx.lineTo(RR.x, RR.y); ctx.lineTo(FT.x, FT.y);
  ctx.closePath(); ctx.fill();

  // Ridge line
  ctx.strokeStyle = pal.roofTop;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(RL.x, RL.y); ctx.lineTo(RR.x, RR.y);
  ctx.stroke();

  // Eave drip-edge on both front edges
  ctx.strokeStyle = pal.cornice;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(LT.x - 0.5 * s, LT.y + 0.5 * s);
  ctx.lineTo(FT.x, FT.y + 0.5 * s);
  ctx.lineTo(RT.x + 0.5 * s, RT.y + 0.5 * s);
  ctx.stroke();
}

export function drawHipRoof(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  W: number, D: number, H: number,
  roofH: number, s: number, pal: BuildingPalette,
): void {
  const Ws = W * s; const Ds = D * s; const Hs = H * s;
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  const LT = { x: bx - iW, y: wt + iD };
  const FT = { x: bx, y: wt + 2 * iD };
  const RT = { x: bx + iW, y: wt + iD };
  const BT = { x: bx, y: wt };
  const rH = roofH * s;
  const inset = 0.35;
  const RL = { x: (BT.x + LT.x) / 2, y: (BT.y + LT.y) / 2 - rH };
  const RR = { x: (FT.x + RT.x) / 2, y: (FT.y + RT.y) / 2 - rH };
  const CL = {
    x: RL.x + inset * (RR.x - RL.x),
    y: RL.y + inset * (RR.y - RL.y),
  };
  const CR = {
    x: RR.x - inset * (RR.x - RL.x),
    y: RR.y - inset * (RR.y - RL.y),
  };

  ctx.fillStyle = pal.roofDark;
  ctx.beginPath();
  ctx.moveTo(BT.x, BT.y); ctx.lineTo(CL.x, CL.y);
  ctx.lineTo(CR.x, CR.y); ctx.lineTo(RT.x, RT.y);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = pal.roofSide;
  ctx.beginPath();
  ctx.moveTo(BT.x, BT.y); ctx.lineTo(CL.x, CL.y); ctx.lineTo(LT.x, LT.y);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(RT.x, RT.y); ctx.lineTo(CR.x, CR.y); ctx.lineTo(FT.x, FT.y);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = pal.roofFront;
  ctx.beginPath();
  ctx.moveTo(LT.x, LT.y); ctx.lineTo(CL.x, CL.y);
  ctx.lineTo(CR.x, CR.y); ctx.lineTo(FT.x, FT.y);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = pal.roofTop;
  ctx.lineWidth = 1.0 * s;
  ctx.beginPath();
  ctx.moveTo(CL.x, CL.y); ctx.lineTo(CR.x, CR.y);
  ctx.stroke();

  // Eave drip-edge along front-left and front-right edges
  ctx.strokeStyle = pal.cornice;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(LT.x - 0.5 * s, LT.y + 0.5 * s);
  ctx.lineTo(FT.x, FT.y + 0.5 * s);
  ctx.lineTo(RT.x + 0.5 * s, RT.y + 0.5 * s);
  ctx.stroke();
}

// ─── Composite building section ─────────────────────────────────────────

export interface WindowGridConfig {
  rows: number;
  leftCols: number;
  rightCols: number;
  wu: number;
  wv: number;
  arched: boolean;
}

export function drawWindowOnFace(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number, W: number, D: number, H: number,
  s: number, u: number, v: number, wu: number, wv: number,
  face: "left" | "right",
  frameColor: string, glassColor: string, sillColor: string,
  arched: boolean = false,
): void {
  const iW = W * ISO_COS; const iD = D * ISO_SIN;
  const dir = face === "left" ? -1 : 1;
  const x0 = bx + dir * (1 - u) * iW;
  const y0 = by + (1 + u) * iD - v * H;
  const x1 = bx + dir * (1 - u - wu) * iW;
  const y1 = by + (1 + u + wu) * iD - v * H;
  const wH = wv * H;

  ctx.fillStyle = frameColor;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, W, D, H, u - 0.005, v - 0.008, wu + 0.01, wv + 0.016, face);
  ctx.fill();

  ctx.fillStyle = glassColor;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, W, D, H, u, v, wu, wv, face);
  ctx.fill();

  if (arched) {
    const topX0 = x0, topY0 = y0 - wH;
    const topX1 = x1, topY1 = y1 - wH;
    const aMidX = (topX0 + topX1) / 2;
    const aMidY = (topY0 + topY1) / 2;
    const hfx = (topX1 - topX0) / 2;
    const hfy = (topY1 - topY0) / 2;
    const archH = (wu * D) / 2;
    ctx.fillStyle = glassColor;
    ctx.beginPath();
    ctx.save();
    ctx.translate(aMidX, aMidY);
    ctx.transform(hfx, hfy, 0, archH, 0, 0);
    ctx.arc(0, 0, 1, Math.PI, 0);
    ctx.restore();
    ctx.fill();
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.save();
    ctx.translate(aMidX, aMidY);
    ctx.transform(hfx, hfy, 0, archH, 0, 0);
    ctx.arc(0, 0, 1.06, Math.PI + 0.08, -0.08);
    ctx.restore();
    ctx.stroke();
  }

  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(midX, midY - wH);
  ctx.stroke();

  ctx.fillStyle = sillColor;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, W, D, H, u - 0.003, v - 0.01, wu + 0.006, 0.006, face);
  ctx.fill();
}

export function drawBuildingSection(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  W: number, D: number, H: number,
  s: number, pal: BuildingPalette,
  windows?: WindowGridConfig,
): void {
  const Ws = W * s; const Ds = D * s; const Hs = H * s;
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  const fndH = 3 * s;
  drawIsometricPrism(ctx, bx, by + fndH, (W + 2) * s, (D + 2) * s, fndH, pal.foundTop, pal.foundLeft, pal.foundRight);
  drawIsometricPrism(ctx, bx, by, Ws, Ds, Hs, pal.wallTop, pal.wallLeft, pal.wallRight);
  drawMortarLines(ctx, bx, by, Ws, Hs, 4, "rgba(0,0,0,0.05)", s);

  // Quoin pilasters
  ctx.fillStyle = pal.trim;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, 0, 0, 0.04, 1.0, "left");
  ctx.fill();
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, 0.96, 0, 0.04, 1.0, "left");
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Cornice bands
  ctx.fillStyle = pal.cornice;
  ctx.beginPath();
  ctx.moveTo(bx - iW - 0.5 * s, wt + iD - 0.5 * s);
  ctx.lineTo(bx + 0.5 * s, wt + 2 * iD - 0.5 * s);
  ctx.lineTo(bx + 0.5 * s, wt + 2 * iD + 1.5 * s);
  ctx.lineTo(bx - iW - 0.5 * s, wt + iD + 1.5 * s);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + iW + 0.5 * s, wt + iD - 0.5 * s);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD - 0.5 * s);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD + 1.5 * s);
  ctx.lineTo(bx + iW + 0.5 * s, wt + iD + 1.5 * s);
  ctx.closePath(); ctx.fill();

  // Water table
  ctx.fillStyle = pal.trimLight;
  ctx.beginPath();
  ctx.moveTo(bx - iW, by + iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx - iW, by + iD);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + iW, by + iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx + iW, by + iD);
  ctx.closePath(); ctx.fill();

  if (windows) {
    for (let row = 0; row < windows.rows; row++) {
      for (let col = 0; col < windows.leftCols; col++) {
        const spacing = 0.85 / windows.leftCols;
        const u = 0.07 + col * spacing;
        const v = 0.1 + row * (0.75 / windows.rows);
        drawWindowOnFace(ctx, bx, by, Ws, Ds, Hs, s, u, v, windows.wu, windows.wv, "left", pal.trim, pal.glass, pal.trimLight, windows.arched);
      }
    }
    for (let row = 0; row < windows.rows; row++) {
      for (let col = 0; col < windows.rightCols; col++) {
        const spacing = 0.85 / windows.rightCols;
        const u = 0.07 + col * spacing;
        const v = 0.1 + row * (0.75 / windows.rows);
        drawWindowOnFace(ctx, bx, by, Ws, Ds, Hs, s, u, v, windows.wu, windows.wv, "right", pal.trim, pal.glass, pal.trimLight, windows.arched);
      }
    }
  }

}

export function drawPediment(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  width: number, peakH: number, s: number,
  face: "left" | "right",
  faceColor: string, trimColor: string,
): void {
  const w = width * s;
  const h = peakH * s;
  const dir = face === "left" ? 1 : -1;
  const iW = w * ISO_COS;
  const iD = w * ISO_SIN;
  const left = { x: bx + dir * iW * 0.5, y: by + iD * 0.5 };
  const right = { x: bx - dir * iW * 0.5, y: by - iD * 0.5 };
  const peak = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 - h };

  ctx.fillStyle = faceColor;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y); ctx.lineTo(peak.x, peak.y); ctx.lineTo(right.x, right.y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y); ctx.lineTo(peak.x, peak.y); ctx.lineTo(right.x, right.y);
  ctx.stroke();
}

// ─── Isometric face arch ───────────────────────────────────────────────
// Draws a pointed/round arch on an isometric face.  The arch center is at
// (cx, cy) and the half-width `hw` is measured along the face axis while
// the height `ah` is vertical.

export function drawIsoFaceArch(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  hw: number, ah: number,
  s: number,
  face: "left" | "right",
  fillColor: string,
  pointed: boolean = true,
): void {
  const dx = face === "left" ? ISO_COS : -ISO_COS;
  const dy = ISO_SIN;
  const lx = cx + hw * dx; const ly = cy + hw * dy;
  const rx = cx - hw * dx; const ry = cy - hw * dy;
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(lx, ly - ah * 0.6);
  if (pointed) {
    ctx.quadraticCurveTo(lx, ly - ah, cx, cy - ah - 2 * s);
    ctx.quadraticCurveTo(rx, ry - ah, rx, ry - ah * 0.6);
  } else {
    ctx.quadraticCurveTo(cx, cy - ah - 1 * s, rx, ry - ah * 0.6);
  }
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fill();
}

// ─── Visual enhancement helpers ─────────────────────────────────────────

/** Vertical gradient overlay on an isometric face for lighting depth */
export function drawFaceShading(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number,
  face: "left" | "right",
  darkAlpha: number = 0.15,
): void {
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  ctx.save();
  ctx.beginPath();
  if (face === "left") {
    ctx.moveTo(bx - iW, wt + iD);
    ctx.lineTo(bx, wt + 2 * iD);
    ctx.lineTo(bx, by + 2 * iD);
    ctx.lineTo(bx - iW, by + iD);
  } else {
    ctx.moveTo(bx + iW, wt + iD);
    ctx.lineTo(bx, wt + 2 * iD);
    ctx.lineTo(bx, by + 2 * iD);
    ctx.lineTo(bx + iW, by + iD);
  }
  ctx.closePath();
  ctx.clip();
  const grad = ctx.createLinearGradient(bx, wt, bx, by + 2 * iD);
  grad.addColorStop(0, `rgba(255,255,255,${darkAlpha * 0.3})`);
  grad.addColorStop(0.3, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${darkAlpha})`);
  ctx.fillStyle = grad;
  ctx.fillRect(bx - iW - 2, wt - 2, iW * 2 + Hs + 4, Hs + 2 * iD + 4);
  ctx.restore();
}

/** Ambient occlusion shadow at building base (isometric ellipse) */
export function drawBaseAO(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number,
  alpha: number = 0.18,
): void {
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const grad = ctx.createRadialGradient(bx, by + iD, 0, bx, by + iD, iW * 1.1);
  grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
  grad.addColorStop(0.6, `rgba(0,0,0,${alpha * 0.4})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(bx, by + iD, iW * 1.1, iD * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Stone quoin blocks at the front corner of the building */
export function drawQuoins(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number, s: number,
  color: string,
  count: number = 5,
): void {
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const ft = { x: bx, y: by + 2 * iD };
  ctx.fillStyle = color;
  const qW = 2.2 * s; const qH = 2.5 * s;
  for (let i = 0; i < count; i++) {
    const qy = ft.y - Hs * (i / count) - qH * 0.5;
    const wide = i % 2 === 0;
    const lw = wide ? qW * 1.2 : qW * 0.7;
    const rw = wide ? qW * 0.7 : qW * 1.2;
    ctx.globalAlpha = 0.12;
    // Left side of corner
    ctx.beginPath();
    ctx.moveTo(ft.x, qy);
    ctx.lineTo(ft.x - lw * ISO_COS, qy + lw * ISO_SIN);
    ctx.lineTo(ft.x - lw * ISO_COS, qy + lw * ISO_SIN - qH);
    ctx.lineTo(ft.x, qy - qH);
    ctx.closePath();
    ctx.fill();
    // Right side of corner
    ctx.beginPath();
    ctx.moveTo(ft.x, qy);
    ctx.lineTo(ft.x + rw * ISO_COS, qy + rw * ISO_SIN);
    ctx.lineTo(ft.x + rw * ISO_COS, qy + rw * ISO_SIN - qH);
    ctx.lineTo(ft.x, qy - qH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Horizontal string course band across both visible faces (no top diamond) */
export function drawStringCourse(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number, s: number,
  heightFrac: number,
  color: string,
): void {
  const bandH = 1.2 * s;
  const bandY = by - Hs * heightFrac;
  const iW = (Ws + 1.5 * s) * ISO_COS;
  const iD = (Ds + 1.5 * s) * ISO_SIN;
  const baseY = bandY + bandH;

  ctx.fillStyle = color;
  // Left face strip
  ctx.beginPath();
  ctx.moveTo(bx - iW, baseY + iD);
  ctx.lineTo(bx, baseY + 2 * iD);
  ctx.lineTo(bx, baseY + 2 * iD - bandH);
  ctx.lineTo(bx - iW, baseY + iD - bandH);
  ctx.closePath();
  ctx.fill();
  // Right face strip
  ctx.beginPath();
  ctx.moveTo(bx + iW, baseY + iD);
  ctx.lineTo(bx, baseY + 2 * iD);
  ctx.lineTo(bx, baseY + 2 * iD - bandH);
  ctx.lineTo(bx + iW, baseY + iD - bandH);
  ctx.closePath();
  ctx.fill();
}

/** Warm interior glow from windows on a face */
export function drawWindowGlows(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number, s: number,
  face: "left" | "right",
  cols: number, rows: number,
  glowColor: string = "rgba(255,210,140,0.08)",
  time: number = 0,
): void {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const spacing = 0.85 / cols;
      const u = 0.07 + col * spacing;
      const v = 0.12 + row * (0.75 / rows);
      const flicker = 0.06 + Math.sin(time * 0.5 + row * 1.3 + col * 2.1) * 0.025;
      ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, `${flicker})`);
      ctx.beginPath();
      drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, u + 0.01, v + 0.01, spacing * 0.65, 0.75 / rows * 0.55, face);
      ctx.fill();
    }
  }
}

/** Recessed entrance doorway on an isometric face */
export function drawEntrance(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number, s: number,
  face: "left" | "right",
  doorColor: string,
  frameColor: string,
  u: number = 0.35,
  doorW: number = 0.12,
  doorH: number = 0.35,
): void {
  // Frame
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, u - 0.015, 1 - doorH - 0.02, doorW + 0.03, doorH + 0.04, face);
  ctx.fill();
  // Dark recess
  ctx.fillStyle = doorColor;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, u, 1 - doorH, doorW, doorH, face);
  ctx.fill();
  // Arch top
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const dir = face === "left" ? -1 : 1;
  const doorCx = bx + dir * (1 - u - doorW * 0.5) * iW;
  const doorCy = by + (1 + u + doorW * 0.5) * iD - (1 - doorH) * Hs;
  const archR = doorW * 0.5 * Ws * ISO_COS;
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.ellipse(doorCx, doorCy - doorH * Hs + 1 * s, archR * 1.2, archR * 0.6, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = doorColor;
  ctx.beginPath();
  ctx.ellipse(doorCx, doorCy - doorH * Hs + 1 * s, archR, archR * 0.5, 0, Math.PI, 0);
  ctx.fill();
}

/** Subtle vertical weathering stains on a wall face */
export function drawWeatherStains(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number, s: number,
  face: "left" | "right",
  seed: number = 0,
  count: number = 4,
  color: string = "rgba(0,0,0,0.04)",
): void {
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const dir = face === "left" ? -1 : 1;
  ctx.save();
  ctx.beginPath();
  const wt = by - Hs;
  if (face === "left") {
    ctx.moveTo(bx - iW, wt + iD);
    ctx.lineTo(bx, wt + 2 * iD);
    ctx.lineTo(bx, by + 2 * iD);
    ctx.lineTo(bx - iW, by + iD);
  } else {
    ctx.moveTo(bx + iW, wt + iD);
    ctx.lineTo(bx, wt + 2 * iD);
    ctx.lineTo(bx, by + 2 * iD);
    ctx.lineTo(bx + iW, by + iD);
  }
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const hash = ((seed + 1) * 31 + i * 17) % 100;
    const t = 0.15 + (hash % 70) / 100;
    const sx = bx + dir * (1 - t) * iW;
    const sy = wt + (1 + t) * iD;
    const stainH = Hs * (0.3 + (hash % 40) / 100);
    const stainW = (1 + hash % 3) * s;
    ctx.beginPath();
    ctx.moveTo(sx, sy - Hs * 0.1);
    ctx.quadraticCurveTo(sx + (hash % 2 ? 1 : -1) * s * 0.5, sy + stainH * 0.5, sx, sy + stainH);
    ctx.lineTo(sx + stainW * 0.5, sy + stainH);
    ctx.quadraticCurveTo(sx + stainW * 0.5, sy + stainH * 0.4, sx + stainW * 0.3, sy - Hs * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Subtle diagonal shingle lines on a gabled roof front slope */
export function drawRoofShingles(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  W: number, D: number, H: number,
  roofH: number, s: number,
  lineColor: string = "rgba(0,0,0,0.04)",
  lineCount: number = 6,
): void {
  const Ws = W * s; const Ds = D * s; const Hs = H * s;
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  const LT = { x: bx - iW, y: wt + iD };
  const FT = { x: bx, y: wt + 2 * iD };
  const rH = roofH * s;
  const RL = { x: (bx + bx - iW) / 2, y: (wt + wt + iD) / 2 - rH };
  const RR = { x: (bx + bx + iW) / 2, y: (wt + 2 * iD + wt + iD) / 2 - rH };

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(LT.x, LT.y); ctx.lineTo(RL.x, RL.y);
  ctx.lineTo(RR.x, RR.y); ctx.lineTo(FT.x, FT.y);
  ctx.closePath();
  ctx.clip();

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.4 * s;
  for (let i = 1; i <= lineCount; i++) {
    const t = i / (lineCount + 1);
    const y = RL.y + t * (LT.y - RL.y + rH);
    ctx.beginPath();
    ctx.moveTo(LT.x - 2 * s, y);
    ctx.lineTo(FT.x + 2 * s, y + iD);
    ctx.stroke();
  }
  ctx.restore();
}

/** Roof ridge cap (thin prism along the ridge line of a gabled roof) */
export function drawRidgeCap(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  W: number, D: number, H: number,
  roofH: number, s: number,
  color: string,
): void {
  const Ws = W * s; const Ds = D * s; const Hs = H * s;
  const iW = Ws * ISO_COS; const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  const rH = roofH * s;
  const rl = { x: (bx + bx - iW) / 2, y: (wt + wt + iD) / 2 - rH };
  const rr = { x: (bx + bx + iW) / 2, y: (wt + 2 * iD + wt + iD) / 2 - rH };
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(rl.x, rl.y);
  ctx.lineTo(rr.x, rr.y);
  ctx.stroke();
  // Ridge ornament ends
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(rl.x, rl.y, 1.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(rr.x, rr.y, 1.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Animated flag/banner on a pole */
export function drawFlagPole(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  poleH: number, s: number,
  poleColor: string, flagColor: string,
  time: number,
): void {
  const h = poleH * s;
  ctx.strokeStyle = poleColor;
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx, baseY - h);
  ctx.stroke();

  // Finial ball
  ctx.fillStyle = poleColor;
  ctx.beginPath();
  ctx.arc(cx, baseY - h, 0.6 * s, 0, Math.PI * 2);
  ctx.fill();

  // Waving flag
  const fw = 5 * s;
  const fh = 3 * s;
  const wave = Math.sin(time * 2.0) * 0.8 * s;
  const wave2 = Math.sin(time * 2.0 + 1.5) * 0.6 * s;
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - h + 0.5 * s);
  ctx.bezierCurveTo(
    cx + fw * 0.33, baseY - h + 0.5 * s + wave,
    cx + fw * 0.66, baseY - h + 0.5 * s + wave2,
    cx + fw, baseY - h + 0.5 * s + wave * 0.5,
  );
  ctx.lineTo(cx + fw, baseY - h + 0.5 * s + fh + wave * 0.5);
  ctx.bezierCurveTo(
    cx + fw * 0.66, baseY - h + 0.5 * s + fh + wave2,
    cx + fw * 0.33, baseY - h + 0.5 * s + fh + wave,
    cx, baseY - h + 0.5 * s + fh,
  );
  ctx.closePath();
  ctx.fill();
}

/** Small pinnacle spire at a position */
export function drawPinnacle(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  height: number, s: number,
  color: string, highlightColor: string,
): void {
  const h = height * s;
  const w = 1.2 * s;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - h);
  ctx.lineTo(cx - w, baseY);
  ctx.lineTo(cx + w, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 0.3 * s;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - h);
  ctx.lineTo(cx - w * 0.3, baseY - h * 0.3);
  ctx.stroke();
  // Finial ball
  ctx.fillStyle = highlightColor;
  ctx.beginPath();
  ctx.arc(cx, baseY - h - 0.5 * s, 0.4 * s, 0, Math.PI * 2);
  ctx.fill();
}

/** Chimney with optional smoke */
export function drawChimney(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  s: number,
  wallColor: string, capColor: string,
  smokeAlpha: number = 0,
): void {
  const cw = 1.8 * s; const ch = 5 * s;
  drawIsometricPrism(ctx, cx, baseY, cw, cw, ch, capColor, wallColor, wallColor);
  // Cap rim
  drawIsometricPrism(ctx, cx, baseY - ch, cw * 1.2, cw * 1.2, 0.8 * s, capColor, capColor, capColor);
  if (smokeAlpha > 0) {
    ctx.fillStyle = `rgba(180,180,180,${smokeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - ch - 2 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(180,180,180,${smokeAlpha * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(cx + 0.5 * s, baseY - ch - 4 * s, 2.5 * s, 1.3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
