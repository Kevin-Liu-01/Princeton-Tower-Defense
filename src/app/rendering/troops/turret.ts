import type { Position } from "../../types";
import { ISO_Y_RATIO } from "../../constants";

// ============================================================================
// SHARED TURRET HELPERS
// ============================================================================

export function drawTurretIsometricCrate(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  depth: number,
  colors: { top: string; side: string; front: string; outline?: string },
) {
  const depthX = depth;
  const depthY = depth * ISO_Y_RATIO;

  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + depthX, top - depthY);
  ctx.lineTo(left + width + depthX, top - depthY);
  ctx.lineTo(left + width, top);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.side;
  ctx.beginPath();
  ctx.moveTo(left + width, top);
  ctx.lineTo(left + width + depthX, top - depthY);
  ctx.lineTo(left + width + depthX, top + height - depthY);
  ctx.lineTo(left + width, top + height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.front;
  ctx.fillRect(left, top, width, height);

  if (colors.outline) {
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + depthX, top - depthY);
    ctx.lineTo(left + width + depthX, top - depthY);
    ctx.lineTo(left + width + depthX, top + height - depthY);
    ctx.lineTo(left + width, top + height);
    ctx.lineTo(left, top + height);
    ctx.closePath();
    ctx.stroke();
  }
}

export function drawTurretBoltRow(
  ctx: CanvasRenderingContext2D,
  startX: number,
  y: number,
  count: number,
  spacing: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * spacing, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function projectTurretLocalPoint(
  originX: number,
  originY: number,
  rotation: number,
  squashY: number,
  localX: number,
  localY: number,
): Position {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  return {
    x: originX + cosR * localX - sinR * (localY * squashY),
    y: originY + sinR * localX + cosR * (localY * squashY),
  };
}

// ============================================================================
// ISOMETRIC 3D PROJECTION HELPERS
// ============================================================================

function isoProject3D(
  px: number,
  py: number,
  cosR: number,
  sinR: number,
  fwd: number,
  right: number,
  up: number = 0,
): Position {
  const wx = cosR * fwd - sinR * right;
  const wy = sinR * fwd + cosR * right;
  return { x: px + wx, y: py + wy * ISO_Y_RATIO - up };
}

function fillQuad(
  ctx: CanvasRenderingContext2D,
  a: Position,
  b: Position,
  c: Position,
  d: Position,
  fill: string,
  stroke?: string,
  lw?: number,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw ?? 1;
    ctx.stroke();
  }
}

function drawIsoBarrelRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sinR: number,
  cosR: number,
  fill: string,
  segments: number = 16,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const px = cx + radius * (-sinR * ct);
    const py = cy + radius * (cosR * ISO_Y_RATIO * ct - st);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function strokeIsoBarrelRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sinR: number,
  cosR: number,
  strokeColor: string,
  lineWidth: number,
  segments: number = 16,
) {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const px = cx + radius * (-sinR * ct);
    const py = cy + radius * (cosR * ISO_Y_RATIO * ct - st);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawIsoTripodLeg(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  startW: number,
  endW: number,
  thickness: number,
  bodyColor: string,
  topColor: string,
  edgeColor: string,
) {
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return;

  const nx = -dy / len;
  const ny = dx / len;

  const bl0 = { x: sx - nx * startW * 0.5, y: sy - ny * startW * 0.5 };
  const br0 = { x: sx + nx * startW * 0.5, y: sy + ny * startW * 0.5 };
  const bl1 = { x: ex - nx * endW * 0.5, y: ey - ny * endW * 0.5 };
  const br1 = { x: ex + nx * endW * 0.5, y: ey + ny * endW * 0.5 };

  const endThick = thickness * 0.55;
  const tl0 = { x: bl0.x, y: bl0.y - thickness };
  const tr0 = { x: br0.x, y: br0.y - thickness };
  const tl1 = { x: bl1.x, y: bl1.y - endThick };
  const tr1 = { x: br1.x, y: br1.y - endThick };

  if (ny < 0) {
    fillQuad(ctx, tl0, tl1, bl1, bl0, edgeColor);
  } else {
    fillQuad(ctx, tr0, tr1, br1, br0, edgeColor);
  }

  fillQuad(ctx, bl0, br0, br1, bl1, bodyColor);
  fillQuad(ctx, tl0, tr0, tr1, tl1, topColor);

  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(tl0.x, tl0.y);
  ctx.lineTo(tl1.x, tl1.y);
  ctx.stroke();

  const jx = (tl0.x + tr0.x + bl0.x + br0.x) * 0.25;
  const jy = (tl0.y + tr0.y + bl0.y + br0.y) * 0.25;
  ctx.fillStyle = "#6e7886";
  ctx.beginPath();
  ctx.arc(jx, jy, startW * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a5260";
  ctx.beginPath();
  ctx.arc(jx, jy, startW * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1e26";
  ctx.beginPath();
  ctx.ellipse(ex, ey + endThick * 0.2, endW * 1.4, endW * 1.4 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#282e38";
  ctx.beginPath();
  ctx.ellipse(ex, ey - endThick * 0.1, endW, endW * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  const mx = (sx + ex) * 0.5;
  const my = (sy + ey) * 0.5 - thickness * 0.3;
  ctx.fillStyle = "rgba(180,186,200,0.4)";
  ctx.beginPath();
  ctx.arc(mx, my, startW * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsoCylinder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  height: number,
  topColor: string,
  sideColors: [string, string, string],
  rimColor: string,
) {
  const ry = rx * ISO_Y_RATIO;
  const topY = cy - height;

  const sideGrad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  sideGrad.addColorStop(0, sideColors[0]);
  sideGrad.addColorStop(0.5, sideColors[1]);
  sideGrad.addColorStop(1, sideColors[2]);
  ctx.fillStyle = sideGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, topY);
  ctx.ellipse(cx, topY, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = rimColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  _cosR: number,
  _sinR: number,
  corners: {
    tnl: Position; tnr: Position; tfl: Position; tfr: Position;
    bnl: Position; bnr: Position; bfl: Position; bfr: Position;
  },
  colors: { top: string; sideLight: string; sideDark: string; endLight: string; endDark: string },
  stroke: string = "rgba(0,0,0,0.18)",
  lw: number = 0.6,
) {
  type FaceEntry = { draw: () => void; depth: number };
  const faces: FaceEntry[] = [];
  const c = corners;

  const centY = (a: Position, b: Position, c2: Position, d: Position) =>
    (a.y + b.y + c2.y + d.y) * 0.25;

  faces.push({
    draw: () => fillQuad(ctx, c.tnl, c.tfl, c.bfl, c.bnl, colors.sideLight, stroke, lw),
    depth: centY(c.tnl, c.tfl, c.bfl, c.bnl),
  });
  faces.push({
    draw: () => fillQuad(ctx, c.tnr, c.tfr, c.bfr, c.bnr, colors.sideDark, stroke, lw),
    depth: centY(c.tnr, c.tfr, c.bfr, c.bnr),
  });
  faces.push({
    draw: () => fillQuad(ctx, c.tnl, c.tnr, c.bnr, c.bnl, colors.endLight, stroke, lw),
    depth: centY(c.tnl, c.tnr, c.bnr, c.bnl),
  });
  faces.push({
    draw: () => fillQuad(ctx, c.tfl, c.tfr, c.bfr, c.bfl, colors.endDark, stroke, lw),
    depth: centY(c.tfl, c.tfr, c.bfr, c.bfl),
  });

  faces.sort((a, b) => a.depth - b.depth);
  for (const f of faces) f.draw();
  fillQuad(ctx, c.tnl, c.tnr, c.tfr, c.tfl, colors.top, stroke, lw);
}

// Draws a single sandbag as an organic rounded isometric shape
function drawSandbag(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  depthX: number,
  depthY: number,
  shade: number,
  sagAmount: number,
) {
  const r = Math.floor(118 * shade);
  const g = Math.floor(108 * shade);
  const b = Math.floor(82 * shade);
  const rD = Math.floor(88 * shade);
  const gD = Math.floor(78 * shade);
  const bD = Math.floor(58 * shade);
  const rT = Math.floor(138 * shade);
  const gT = Math.floor(126 * shade);
  const bT = Math.floor(98 * shade);

  const halfW = w * 0.5;
  const sag = h * sagAmount;

  // Front face - rounded with sag (bulging cloth look)
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy);
  ctx.quadraticCurveTo(cx - halfW, cy + h * 0.5 + sag, cx - halfW * 0.3, cy + h + sag);
  ctx.lineTo(cx + halfW * 0.3, cy + h + sag);
  ctx.quadraticCurveTo(cx + halfW, cy + h * 0.5 + sag, cx + halfW, cy);
  ctx.closePath();
  ctx.fill();

  // Top face (isometric, slightly domed)
  ctx.fillStyle = `rgb(${rT},${gT},${bT})`;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy);
  ctx.quadraticCurveTo(cx - halfW * 0.5 + depthX * 0.5, cy - depthY * 1.3, cx + depthX, cy - depthY);
  ctx.quadraticCurveTo(cx + halfW * 0.5 + depthX * 0.5, cy - depthY * 0.8, cx + halfW, cy);
  ctx.closePath();
  ctx.fill();

  // Right side face
  ctx.fillStyle = `rgb(${rD},${gD},${bD})`;
  ctx.beginPath();
  ctx.moveTo(cx + halfW, cy);
  ctx.lineTo(cx + halfW + depthX * 0.6, cy - depthY * 0.6);
  ctx.lineTo(cx + halfW + depthX * 0.6, cy + h - depthY * 0.6 + sag * 0.5);
  ctx.lineTo(cx + halfW, cy + h + sag * 0.8);
  ctx.closePath();
  ctx.fill();

  // Stitching/seam line (horizontal)
  ctx.strokeStyle = `rgba(50,42,28,0.35)`;
  ctx.lineWidth = w * 0.035;
  ctx.beginPath();
  ctx.moveTo(cx - halfW * 0.7, cy + h * 0.45 + sag * 0.4);
  ctx.quadraticCurveTo(cx, cy + h * 0.5 + sag * 0.5, cx + halfW * 0.7, cy + h * 0.45 + sag * 0.4);
  ctx.stroke();

  // Tie/cinch marks at ends
  ctx.strokeStyle = `rgba(60,48,30,0.3)`;
  ctx.lineWidth = w * 0.03;
  ctx.beginPath();
  ctx.moveTo(cx - halfW * 0.8, cy + h * 0.2);
  ctx.lineTo(cx - halfW * 0.8, cy + h * 0.75 + sag * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + halfW * 0.8, cy + h * 0.2);
  ctx.lineTo(cx + halfW * 0.8, cy + h * 0.75 + sag * 0.3);
  ctx.stroke();

  // Subtle edge outline
  ctx.strokeStyle = "rgba(30,25,16,0.2)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy);
  ctx.quadraticCurveTo(cx - halfW, cy + h * 0.5 + sag, cx - halfW * 0.3, cy + h + sag);
  ctx.lineTo(cx + halfW * 0.3, cy + h + sag);
  ctx.quadraticCurveTo(cx + halfW, cy + h * 0.5 + sag, cx + halfW, cy);
  ctx.stroke();
}

// Draws a heavy-duty armored iso base plate with hex cutouts
function drawArmoredBasePlate(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  plateH: number,
  accentColor: string,
) {
  // Main plate - octagonal diamond shape
  const pts: Position[] = [];
  const sides = 8;
  for (let i = 0; i < sides; i++) {
    const ang = (i / sides) * Math.PI * 2 - Math.PI / sides;
    pts.push({
      x: cx + Math.cos(ang) * radius,
      y: cy + Math.sin(ang) * radius * ISO_Y_RATIO,
    });
  }

  // Top face with metallic gradient
  const plateGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  plateGrad.addColorStop(0, "#3a4454");
  plateGrad.addColorStop(0.3, "#485266");
  plateGrad.addColorStop(0.5, "#52607a");
  plateGrad.addColorStop(0.7, "#485266");
  plateGrad.addColorStop(1, "#3a4454");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < sides; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fill();

  // Front edge (depth)
  ctx.fillStyle = "#2a3240";
  ctx.beginPath();
  const e0 = Math.floor(sides * 0.25);
  const e1 = Math.floor(sides * 0.75);
  ctx.moveTo(pts[e0].x, pts[e0].y);
  for (let i = e0; i <= e1; i++) ctx.lineTo(pts[i % sides].x, pts[i % sides].y);
  for (let i = e1; i >= e0; i--) ctx.lineTo(pts[i % sides].x, pts[i % sides].y + plateH);
  ctx.closePath();
  ctx.fill();

  // Right edge
  ctx.fillStyle = "#1e2830";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i <= e0; i++) ctx.lineTo(pts[i].x, pts[i].y);
  for (let i = e0; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y + plateH);
  ctx.closePath();
  ctx.fill();

  // Edge highlight
  ctx.strokeStyle = "rgba(120,140,170,0.15)";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < sides; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.stroke();

  // Bolt rivets at each vertex
  ctx.fillStyle = "#6a7688";
  for (const pt of pts) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // Accent stripe around plate perimeter
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const inset = 0.82;
  ctx.moveTo(cx + Math.cos(-Math.PI / sides) * radius * inset, cy + Math.sin(-Math.PI / sides) * radius * inset * ISO_Y_RATIO);
  for (let i = 1; i < sides; i++) {
    const ang = (i / sides) * Math.PI * 2 - Math.PI / sides;
    ctx.lineTo(cx + Math.cos(ang) * radius * inset, cy + Math.sin(ang) * radius * inset * ISO_Y_RATIO);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Center mounting ring
  ctx.strokeStyle = "#5a6678";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius * 0.35, radius * 0.35 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// Draws a heavy cylindrical hub with machining marks
function drawHeavyHub(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  rx: number,
  height: number,
  accentColor: string,
) {
  const ry = rx * ISO_Y_RATIO;
  const topY = baseY - height;

  // Cylinder body with rich gradient
  const sideGrad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  sideGrad.addColorStop(0, "#3a4250");
  sideGrad.addColorStop(0.2, "#4a5468");
  sideGrad.addColorStop(0.45, "#5c6a82");
  sideGrad.addColorStop(0.55, "#5c6a82");
  sideGrad.addColorStop(0.8, "#4a5468");
  sideGrad.addColorStop(1, "#3a4250");
  ctx.fillStyle = sideGrad;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, topY);
  ctx.ellipse(cx, topY, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  // Bottom rim shadow
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI);
  ctx.stroke();

  // Machining ring grooves (2 bands)
  for (let band = 0; band < 2; band++) {
    const bandY = topY + height * (0.3 + band * 0.35);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, bandY, rx * 1.005, ry * 1.005, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "rgba(180,190,210,0.08)";
    ctx.beginPath();
    ctx.ellipse(cx, bandY - 1, rx * 0.995, ry * 0.995, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Top face
  const topGrad = ctx.createRadialGradient(cx - rx * 0.2, topY, 0, cx, topY, rx);
  topGrad.addColorStop(0, "#6a7a92");
  topGrad.addColorStop(0.6, "#566880");
  topGrad.addColorStop(1, "#4a5c72");
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top rim
  ctx.strokeStyle = "rgba(170,185,210,0.2)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Center pivot bolt (layered for depth)
  ctx.fillStyle = "#5e6c80";
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx * 0.42, rx * 0.42 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#48566a";
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx * 0.28, rx * 0.28 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cross slot on bolt
  ctx.strokeStyle = "#384458";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.15, topY);
  ctx.lineTo(cx + rx * 0.15, topY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, topY - rx * 0.15 * ISO_Y_RATIO);
  ctx.lineTo(cx, topY + rx * 0.15 * ISO_Y_RATIO);
  ctx.stroke();

  // Specular highlight on bolt
  ctx.fillStyle = "rgba(180,195,220,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.08, topY - rx * 0.04, rx * 0.08, rx * 0.06 * ISO_Y_RATIO, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Accent ring
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, topY, rx * 0.7, rx * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ============================================================================
// TURRET TROOP - Engineer's Heavy Machine Gun Emplacement
// ============================================================================
export function drawTurretTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y2: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  const y = y2 + 8;
  const s = size * 1.5;
  const engineerAccent = color || "#f59e0b";

  let rotation = 0;
  if (targetPos) {
    const tdx = targetPos.x - x;
    const tdy = targetPos.y - (y - s * 0.08);
    rotation = Math.atan2(tdy, tdx * ISO_Y_RATIO);
  } else {
    rotation =
      Math.PI * 0.75 +
      Math.sin(time * 0.55) * 0.18 +
      Math.sin(time * 1.45 + 0.8) * 0.05;
  }

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const isAttacking = attackPhase > 0;
  const fireRate = 18;
  const burstPhase = (time * fireRate) % 1;
  const inBurst = isAttacking && burstPhase < 0.58;
  const idleBob = Math.sin(time * 2.1) * s * 0.006;
  const idleHum = Math.sin(time * 1.2 + 0.6) * s * 0.003;
  const recoilOffset = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2) * s * 0.028
    : 0;
  const turretShake = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 1.35) * s * 0.01
    : 0;
  const barrelVibration = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2.6) * s * 0.006
    : 0;
  const heatGlow = isAttacking
    ? Math.min(1, attackPhase * 1.45 + Math.sin(time * 8.2) * 0.12)
    : 0;
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.35;

  ctx.save();

  // ── GROUND SHADOW (layered for depth) ──
  const shadowR = s * 0.52;
  const shadowGrad = ctx.createRadialGradient(x, y + s * 0.36, 0, x, y + s * 0.36, shadowR);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.38)");
  shadowGrad.addColorStop(0.35, "rgba(0,0,0,0.22)");
  shadowGrad.addColorStop(0.65, "rgba(0,0,0,0.1)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.36, shadowR, shadowR * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gun shadow cast forward
  if (isAttacking || heatGlow > 0.1) {
    const scorchA = 0.06 + heatGlow * 0.05;
    ctx.fillStyle = `rgba(25,18,8,${scorchA})`;
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.34, s * 0.38, s * 0.38 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── SANDBAG FORTIFICATION (organic, stacked, varied) ──
  const bagRingR = s * 0.4;
  const bagLayerOffsets = [
    { count: 11, yOff: 0.34, rScale: 1.0, hScale: 1.0 },
    { count: 10, yOff: 0.295, rScale: 0.92, hScale: 0.9 },
    { count: 6, yOff: 0.26, rScale: 0.78, hScale: 0.8 },
  ];

  for (let layerIdx = 0; layerIdx < bagLayerOffsets.length; layerIdx++) {
    const layer = bagLayerOffsets[layerIdx];
    const layerY = y + s * layer.yOff;

    // Sort sandbags by Y so back ones draw first
    const bags: { bx: number; by: number; shade: number; sag: number; scaleW: number }[] = [];
    for (let i = 0; i < layer.count; i++) {
      const ang = (i / layer.count) * Math.PI * 2 + 0.2 + layerIdx * 0.18;
      const bx = x + Math.cos(ang) * bagRingR * layer.rScale;
      const by = layerY + Math.sin(ang) * bagRingR * layer.rScale * ISO_Y_RATIO;
      const shade = 0.82 + Math.sin(i * 2.7 + layerIdx * 1.9) * 0.18;
      const sag = 0.15 + Math.sin(i * 3.1 + layerIdx * 0.7) * 0.1;
      const scaleW = 0.9 + Math.sin(i * 1.5 + layerIdx * 2.3) * 0.15;
      bags.push({ bx, by, shade, sag, scaleW });
    }
    bags.sort((a, b) => a.by - b.by);

    const bagW = s * 0.09 * layer.hScale;
    const bagH = s * 0.04 * layer.hScale;
    const bagD = s * 0.03;
    const bagDY = bagD * ISO_Y_RATIO;

    for (const bag of bags) {
      drawSandbag(ctx, bag.bx, bag.by, bagW * bag.scaleW, bagH, bagD, bagDY, bag.shade, bag.sag);
    }
  }

  // ── ARMORED BASE PLATE ──
  const plateR = s * 0.24;
  const plateH = s * 0.025;
  drawArmoredBasePlate(ctx, x, y + s * 0.22, plateR, plateH, engineerAccent);

  // ── ISOMETRIC TRIPOD (heavier, with reinforcement gussets) ──
  const hubX = x + shakeX * 0.15;
  const hubBaseY = y + s * 0.18 + idleBob;
  const hubHeight = s * 0.16;
  const hubTopY = hubBaseY - hubHeight;
  const legStartY = hubBaseY - hubHeight * 0.25;
  const legW = s * 0.055;
  const legEndW = s * 0.025;
  const legThick = s * 0.038;

  const gunPivotX = hubX + shakeX;
  const gunPivotY = hubTopY - s * 0.015 + idleHum + shakeY;
  const proj = (fwd: number, right: number, up: number = 0): Position =>
    isoProject3D(gunPivotX, gunPivotY, cosR, sinR, fwd, right, up);

  const rearProj = proj(-s * 0.15, 0, 0);
  const drawRearBeforeHub = rearProj.y < hubBaseY - hubHeight * 0.35;

  const drawRearReceiver = () => {
    drawIsoBox(ctx, cosR, sinR, {
      tnl: proj(-s * 0.22, -s * 0.06, s * 0.045),
      tnr: proj(-s * 0.22, s * 0.06, s * 0.045),
      tfl: proj(-s * 0.08, -s * 0.06, s * 0.045),
      tfr: proj(-s * 0.08, s * 0.06, s * 0.045),
      bnl: proj(-s * 0.22, -s * 0.06, -s * 0.04),
      bnr: proj(-s * 0.22, s * 0.06, -s * 0.04),
      bfl: proj(-s * 0.08, -s * 0.06, -s * 0.04),
      bfr: proj(-s * 0.08, s * 0.06, -s * 0.04),
    }, {
      top: "#3a4440", sideLight: "#2e3832", sideDark: "#262e2a",
      endLight: "#2c3430", endDark: "#2a322e",
    });

    const feedPortCenter = proj(-s * 0.15, 0, -s * 0.042);
    ctx.fillStyle = "#1a2020";
    ctx.beginPath();
    ctx.arc(feedPortCenter.x, feedPortCenter.y, s * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a4440";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(feedPortCenter.x, feedPortCenter.y, s * 0.018, 0, Math.PI * 2);
    ctx.stroke();

    const chHandle = proj(-s * 0.2, s * 0.065, s * 0.02);
    ctx.fillStyle = "#4a5460";
    ctx.beginPath();
    ctx.arc(chHandle.x, chHandle.y, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c6878";
    ctx.beginPath();
    ctx.arc(chHandle.x - s * 0.003, chHandle.y - s * 0.003, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawRearGrips = () => {
    const gripL = proj(-s * 0.24, -s * 0.06, -s * 0.01);
    const gripLend = proj(-s * 0.32, -s * 0.08, -s * 0.04);
    const gripR = proj(-s * 0.24, s * 0.06, -s * 0.01);
    const gripRend = proj(-s * 0.32, s * 0.08, -s * 0.04);

    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = s * 0.02;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gripL.x, gripL.y);
    ctx.lineTo(gripLend.x, gripLend.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gripR.x, gripR.y);
    ctx.lineTo(gripRend.x, gripRend.y);
    ctx.stroke();

    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = s * 0.025;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gripLend.x, gripLend.y);
    ctx.lineTo(gripLend.x + cosR * s * 0.005, gripLend.y + sinR * s * 0.003);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gripRend.x, gripRend.y);
    ctx.lineTo(gripRend.x + cosR * s * 0.005, gripRend.y + sinR * s * 0.003);
    ctx.stroke();

    const triggerPos = proj(-s * 0.26, 0, -s * 0.015);
    ctx.fillStyle = "#2a2a30";
    ctx.beginPath();
    ctx.arc(triggerPos.x, triggerPos.y, s * 0.008, 0, Math.PI * 2);
    ctx.fill();
  };

  const legFeet = [
    { ex: x - s * 0.42, ey: y + s * 0.38 },
    { ex: x + s * 0.36, ey: y + s * 0.36 },
    { ex: x + s * 0.04, ey: y + s * 0.58 },
  ];

  const sortedLegs = [...legFeet].sort((a, b) => a.ey - b.ey);

  drawIsoTripodLeg(
    ctx, hubX, legStartY, sortedLegs[0].ex, sortedLegs[0].ey,
    legW, legEndW, legThick, "#464e5c", "#5a6472", "#3a4250",
  );
  drawIsoTripodLeg(
    ctx, hubX, legStartY, sortedLegs[1].ex, sortedLegs[1].ey,
    legW, legEndW, legThick, "#4a5260", "#5e6878", "#3e4856",
  );

  if (drawRearBeforeHub) {
    drawRearReceiver();
    drawRearGrips();
  }

  // Heavy-duty hub with machining detail
  drawHeavyHub(ctx, hubX, hubBaseY, s * 0.1, hubHeight, engineerAccent);

  // Front leg (closest to camera)
  drawIsoTripodLeg(
    ctx, hubX, legStartY, sortedLegs[2].ex, sortedLegs[2].ey,
    legW, legEndW, legThick, "#4e5868", "#626e7e", "#424c5a",
  );

  // Cross-braces with gusset plates
  const braceT = 0.52;
  const bracePoints: Position[] = [];
  for (const leg of legFeet) {
    bracePoints.push({
      x: hubX + (leg.ex - hubX) * braceT,
      y: legStartY + (leg.ey - legStartY) * braceT - legThick * 0.15,
    });
  }

  ctx.strokeStyle = "#555d6c";
  ctx.lineWidth = s * 0.015;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    ctx.beginPath();
    ctx.moveTo(bracePoints[i].x, bracePoints[i].y);
    ctx.lineTo(bracePoints[j].x, bracePoints[j].y);
    ctx.stroke();
  }

  // Gusset triangles at brace joints
  ctx.fillStyle = "#4a5462";
  for (const bp of bracePoints) {
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y - s * 0.012);
    ctx.lineTo(bp.x - s * 0.01, bp.y + s * 0.006);
    ctx.lineTo(bp.x + s * 0.01, bp.y + s * 0.006);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#6a7482";
  for (const bp of bracePoints) {
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, s * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#525c6c";
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, s * 0.004, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a7482";
  }

  // (Ammo box is now drawn as part of gun assembly below)

  // ======== GUN ASSEMBLY (proper isometric 3D projection) ========
  if (!drawRearBeforeHub) drawRearReceiver();

  // ── Main gun housing (receiver body) ──
  const hNear = -s * 0.06;
  const hFar = s * 0.22;
  const hHW = s * 0.082;
  const hHH = s * 0.062;
  drawIsoBox(ctx, cosR, sinR, {
    tnl: proj(hNear, -hHW, hHH), tnr: proj(hNear, hHW, hHH),
    tfl: proj(hFar, -hHW, hHH), tfr: proj(hFar, hHW, hHH),
    bnl: proj(hNear, -hHW, -hHH), bnr: proj(hNear, hHW, -hHH),
    bfl: proj(hFar, -hHW, -hHH), bfr: proj(hFar, hHW, -hHH),
  }, {
    top: "#6e7e92", sideLight: "#4e5a6a", sideDark: "#3e4a58",
    endLight: "#465462", endDark: "#3e4c5a",
  });

  // Receiver panel lines (machining detail)
  const panelDir = cosR > 0 ? -1 : 1;
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5;
  for (let pl = 0; pl < 3; pl++) {
    const plFwd = hNear + (hFar - hNear) * (0.25 + pl * 0.25);
    const plT = proj(plFwd, panelDir * (hHW + s * 0.001), hHH * 0.8);
    const plB = proj(plFwd, panelDir * (hHW + s * 0.001), -hHH * 0.6);
    ctx.beginPath();
    ctx.moveTo(plT.x, plT.y);
    ctx.lineTo(plB.x, plB.y);
    ctx.stroke();
  }

  // Top picatinny rail
  const railSlots = 5;
  for (let ri = 0; ri < railSlots; ri++) {
    const riFwd = -s * 0.01 + ri * s * 0.03;
    fillQuad(
      ctx,
      proj(riFwd, -s * 0.018, hHH + s * 0.01),
      proj(riFwd, s * 0.018, hHH + s * 0.01),
      proj(riFwd + s * 0.015, s * 0.018, hHH + s * 0.01),
      proj(riFwd + s * 0.015, -s * 0.018, hHH + s * 0.01),
      ri % 2 === 0 ? "#5a6878" : "#4e5c6c",
      "rgba(0,0,0,0.08)", 0.3,
    );
  }

  // Engineer accent stripe on housing
  const stripeDir2 = cosR > 0 ? -1 : 1;
  const stripeA = proj((hNear + hFar) * 0.5 - s * 0.05, stripeDir2 * (hHW + s * 0.001), 0);
  const stripeB = proj((hNear + hFar) * 0.5 + s * 0.07, stripeDir2 * (hHW + s * 0.001), 0);
  ctx.strokeStyle = engineerAccent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.moveTo(stripeA.x, stripeA.y);
  ctx.lineTo(stripeB.x, stripeB.y);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Ammo box (flush-mounted on receiver side, rotates with gun) ──
  const abFN = -s * 0.01;
  const abFF = s * 0.12;
  const abRI = -hHW;
  const abRO = -hHW - s * 0.065;
  const abUB = -hHH * 0.55;
  const abUT = hHH * 0.5;
  {
    const abMidR = (abRI + abRO) * 0.5;
    const abMidF = (abFN + abFF) * 0.5;

    const boxShadow = proj(abMidF, abMidR, abUB - s * 0.015);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(boxShadow.x, boxShadow.y + s * 0.01, s * 0.07, s * 0.035, rotation, 0, Math.PI * 2);
    ctx.fill();

    drawIsoBox(ctx, cosR, sinR, {
      tnl: proj(abFN, abRO, abUT),
      tnr: proj(abFN, abRI, abUT),
      tfl: proj(abFF, abRO, abUT),
      tfr: proj(abFF, abRI, abUT),
      bnl: proj(abFN, abRO, abUB),
      bnr: proj(abFN, abRI, abUB),
      bfl: proj(abFF, abRO, abUB),
      bfr: proj(abFF, abRI, abUB),
    }, {
      top: "#4e5e48",
      sideLight: "#3c4838",
      sideDark: "#2a3228",
      endLight: "#3a4a36",
      endDark: "#283024",
    }, "rgba(200,195,170,0.1)", 0.7);

    const latchA = proj(abMidF - s * 0.02, abMidR, abUT + s * 0.003);
    const latchB = proj(abMidF + s * 0.02, abMidR, abUT + s * 0.003);
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = s * 0.008;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(latchA.x, latchA.y);
    ctx.lineTo(latchB.x, latchB.y);
    ctx.stroke();

    const latchHandle = proj(abMidF, abMidR, abUT + s * 0.007);
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.arc(latchHandle.x, latchHandle.y, s * 0.005, 0, Math.PI * 2);
    ctx.fill();

    const abVisSide = cosR > 0 ? abRO - s * 0.001 : abRI + s * 0.001;
    const acStrA = proj(abFN + s * 0.015, abVisSide, (abUB + abUT) * 0.5 - s * 0.005);
    const acStrB = proj(abFF - s * 0.015, abVisSide, (abUB + abUT) * 0.5 - s * 0.005);
    ctx.strokeStyle = engineerAccent;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = s * 0.014;
    ctx.beginPath();
    ctx.moveTo(acStrA.x, acStrA.y);
    ctx.lineTo(acStrB.x, acStrB.y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const stA = proj(abFN + s * 0.025, abVisSide, (abUB + abUT) * 0.5 + s * 0.015);
    const stB = proj(abFF - s * 0.04, abVisSide, (abUB + abUT) * 0.5 + s * 0.015);
    ctx.strokeStyle = "rgba(200,190,150,0.15)";
    ctx.lineWidth = s * 0.005;
    ctx.beginPath();
    ctx.moveTo(stA.x, stA.y);
    ctx.lineTo(stB.x, stB.y);
    ctx.stroke();
    const stC = proj(abFN + s * 0.035, abVisSide, (abUB + abUT) * 0.5 + s * 0.025);
    const stD = proj(abFF - s * 0.055, abVisSide, (abUB + abUT) * 0.5 + s * 0.025);
    ctx.strokeStyle = "rgba(200,190,150,0.1)";
    ctx.lineWidth = s * 0.004;
    ctx.beginPath();
    ctx.moveTo(stC.x, stC.y);
    ctx.lineTo(stD.x, stD.y);
    ctx.stroke();

    for (let bi = 0; bi < 3; bi++) {
      const boltFwd = abFN + (abFF - abFN) * (0.2 + bi * 0.3);
      const boltPos = proj(boltFwd, abMidR, abUT + s * 0.002);
      ctx.fillStyle = "rgba(209,198,150,0.5)";
      ctx.beginPath();
      ctx.arc(boltPos.x, boltPos.y, s * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }

    const crnSide = cosR > 0 ? abRO - s * 0.002 : abRI + s * 0.002;
    const brackets: [number, number][] = [
      [abFN + s * 0.008, abUT - s * 0.008],
      [abFF - s * 0.008, abUT - s * 0.008],
      [abFN + s * 0.008, abUB + s * 0.008],
      [abFF - s * 0.008, abUB + s * 0.008],
    ];
    ctx.strokeStyle = "#5a6a56";
    ctx.lineWidth = s * 0.005;
    for (const [bf, bu] of brackets) {
      const dirF = bf < abMidF ? 1 : -1;
      const dirU = bu > (abUB + abUT) * 0.5 ? -1 : 1;
      const corner = proj(bf, crnSide, bu);
      const armF = proj(bf + dirF * s * 0.02, crnSide, bu);
      const armU = proj(bf, crnSide, bu + dirU * s * 0.02);
      ctx.beginPath();
      ctx.moveTo(armF.x, armF.y);
      ctx.lineTo(corner.x, corner.y);
      ctx.lineTo(armU.x, armU.y);
      ctx.stroke();
    }

    const ledPos = proj(abFF - s * 0.012, abRO + s * 0.005, abUT - s * 0.01);
    const ledPulse = 0.45 + Math.sin(time * 4.2) * 0.18;
    ctx.fillStyle = `rgba(110,255,160,${ledPulse})`;
    ctx.beginPath();
    ctx.arc(ledPos.x, ledPos.y, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(110,255,160,${ledPulse * 0.25})`;
    ctx.beginPath();
    ctx.arc(ledPos.x, ledPos.y, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Feed tray (underneath)
  const feedA = proj(-s * 0.02, 0, -s * 0.065);
  const feedB = proj(s * 0.18, 0, -s * 0.07);
  ctx.strokeStyle = "#3e444e";
  ctx.lineWidth = s * 0.018;
  ctx.beginPath();
  ctx.moveTo(feedA.x, feedA.y);
  ctx.lineTo(feedB.x, feedB.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(90,100,115,0.15)";
  ctx.lineWidth = s * 0.006;
  ctx.beginPath();
  ctx.moveTo(feedA.x, feedA.y - s * 0.005);
  ctx.lineTo(feedB.x, feedB.y - s * 0.005);
  ctx.stroke();

  // ── Gun shield (curved armored plate with rivets & vision slit) ──
  {
    const shFwd = s * 0.16;
    const shHalfSpan = s * 0.14;
    const shThick = s * 0.015;
    const shVOff = s * 0.02;
    const shHalfH = shHalfSpan * 0.6;

    // Build curved shield points (slight convex curve)
    const shieldPts: { front: Position[]; back: Position[] } = { front: [], back: [] };
    const shieldSegments = 8;
    for (let si = 0; si <= shieldSegments; si++) {
      const t = si / shieldSegments;
      const span = -shHalfSpan + t * shHalfSpan * 2;
      const curve = Math.cos(t * Math.PI) * s * 0.008;
      const topH = shVOff + shHalfH + curve;
      const botH = shVOff - shHalfH * 0.85 + curve;

      shieldPts.front.push(proj(shFwd + curve, span, topH));
      shieldPts.back.push(proj(shFwd + curve, span, botH));
    }

    // Shield body with gradient
    const sfl = shieldPts.front[0];
    const sfr = shieldPts.front[shieldSegments];
    const sbl = shieldPts.back[0];
    const sbr = shieldPts.back[shieldSegments];
    const shieldGrad = ctx.createLinearGradient(sfl.x, sfl.y, sbr.x, sbr.y);
    shieldGrad.addColorStop(0, "#586878");
    shieldGrad.addColorStop(0.15, "#6a7c90");
    shieldGrad.addColorStop(0.35, "#7a8ea6");
    shieldGrad.addColorStop(0.5, "#7e92ac");
    shieldGrad.addColorStop(0.65, "#7a8ea6");
    shieldGrad.addColorStop(0.85, "#6a7c90");
    shieldGrad.addColorStop(1, "#546474");

    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(shieldPts.front[0].x, shieldPts.front[0].y);
    for (let si = 1; si <= shieldSegments; si++) {
      ctx.lineTo(shieldPts.front[si].x, shieldPts.front[si].y);
    }
    for (let si = shieldSegments; si >= 0; si--) {
      ctx.lineTo(shieldPts.back[si].x, shieldPts.back[si].y);
    }
    ctx.closePath();
    ctx.fill();

    // Shield edge outline
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Top edge highlight
    ctx.strokeStyle = "rgba(170,190,215,0.22)";
    ctx.lineWidth = s * 0.005;
    ctx.beginPath();
    ctx.moveTo(shieldPts.front[0].x, shieldPts.front[0].y);
    for (let si = 1; si <= shieldSegments; si++) {
      ctx.lineTo(shieldPts.front[si].x, shieldPts.front[si].y);
    }
    ctx.stroke();

    // Vision slit (horizontal opening)
    const slitLeft = proj(shFwd + s * 0.003, -shHalfSpan * 0.55, shVOff + shHalfH * 0.25);
    const slitRight = proj(shFwd + s * 0.003, shHalfSpan * 0.55, shVOff + shHalfH * 0.25);
    const slitBotLeft = proj(shFwd + s * 0.003, -shHalfSpan * 0.55, shVOff + shHalfH * 0.08);
    const slitBotRight = proj(shFwd + s * 0.003, shHalfSpan * 0.55, shVOff + shHalfH * 0.08);
    ctx.fillStyle = "#1a2028";
    ctx.beginPath();
    ctx.moveTo(slitLeft.x, slitLeft.y);
    ctx.lineTo(slitRight.x, slitRight.y);
    ctx.lineTo(slitBotRight.x, slitBotRight.y);
    ctx.lineTo(slitBotLeft.x, slitBotLeft.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(80,95,115,0.25)";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Shield rivets (along top and bottom edges)
    ctx.fillStyle = "#8a96a8";
    for (let ri = 0; ri <= 4; ri++) {
      const rt = ri / 4;
      const idx = Math.round(rt * shieldSegments);
      const topRivet = shieldPts.front[idx];
      const botRivet = shieldPts.back[idx];
      // Top row
      ctx.beginPath();
      ctx.arc(
        topRivet.x + (shieldPts.back[idx].x - topRivet.x) * 0.12,
        topRivet.y + (shieldPts.back[idx].y - topRivet.y) * 0.12,
        s * 0.005, 0, Math.PI * 2,
      );
      ctx.fill();
      // Bottom row
      ctx.beginPath();
      ctx.arc(
        botRivet.x + (shieldPts.front[idx].x - botRivet.x) * 0.12,
        botRivet.y + (shieldPts.front[idx].y - botRivet.y) * 0.12,
        s * 0.005, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Rivet highlights
    ctx.fillStyle = "rgba(200,210,225,0.3)";
    for (let ri = 0; ri <= 4; ri++) {
      const rt = ri / 4;
      const idx = Math.round(rt * shieldSegments);
      const topRivet = shieldPts.front[idx];
      ctx.beginPath();
      ctx.arc(
        topRivet.x + (shieldPts.back[idx].x - topRivet.x) * 0.12 - s * 0.002,
        topRivet.y + (shieldPts.back[idx].y - topRivet.y) * 0.12 - s * 0.002,
        s * 0.002, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Battle wear scratches
    ctx.strokeStyle = "rgba(120,135,160,0.12)";
    ctx.lineWidth = 0.5;
    for (let scratch = 0; scratch < 3; scratch++) {
      const scratchT = 0.3 + scratch * 0.18;
      const scratchIdx = Math.round(scratchT * shieldSegments);
      const st = shieldPts.front[scratchIdx];
      const sb = shieldPts.back[scratchIdx];
      ctx.beginPath();
      ctx.moveTo(
        st.x + (sb.x - st.x) * 0.25 + s * 0.003 * (scratch - 1),
        st.y + (sb.y - st.y) * 0.25,
      );
      ctx.lineTo(
        st.x + (sb.x - st.x) * 0.65 + s * 0.005 * (scratch - 1),
        st.y + (sb.y - st.y) * 0.65,
      );
      ctx.stroke();
    }
  }

  // ── Barrel (3D cylindrical silhouette with perforated cooling jacket) ──
  {
    const barrelStart = s * 0.17 - recoilOffset;
    const barrelEnd = s * 0.48 - recoilOffset + barrelVibration;
    const barrelR = s * 0.024;

    const tTop = Math.atan2(-1, cosR * ISO_Y_RATIO);
    const tBot = tTop + Math.PI;
    const toCT = Math.cos(tTop);
    const toST = Math.sin(tTop);
    const boCT = Math.cos(tBot);
    const boST = Math.sin(tBot);
    const topOff = { x: barrelR * (-sinR * toCT), y: barrelR * (cosR * ISO_Y_RATIO * toCT - toST) };
    const botOff = { x: barrelR * (-sinR * boCT), y: barrelR * (cosR * ISO_Y_RATIO * boCT - boST) };

    const nearC = proj(barrelStart, 0, 0);
    const farC = proj(barrelEnd, 0, 0);

    const sil = {
      nearTop: { x: nearC.x + topOff.x, y: nearC.y + topOff.y },
      farTop: { x: farC.x + topOff.x, y: farC.y + topOff.y },
      farBot: { x: farC.x + botOff.x, y: farC.y + botOff.y },
      nearBot: { x: nearC.x + botOff.x, y: nearC.y + botOff.y },
    };

    // Barrel body gradient (rich metallic)
    const barrelGrad = ctx.createLinearGradient(
      sil.nearTop.x, sil.nearTop.y, sil.nearBot.x, sil.nearBot.y,
    );
    barrelGrad.addColorStop(0, "#62707e");
    barrelGrad.addColorStop(0.2, "#4a5868");
    barrelGrad.addColorStop(0.5, "#3a4656");
    barrelGrad.addColorStop(0.8, "#2c3644");
    barrelGrad.addColorStop(1, "#1e2630");
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.moveTo(sil.nearTop.x, sil.nearTop.y);
    ctx.lineTo(sil.farTop.x, sil.farTop.y);
    ctx.lineTo(sil.farBot.x, sil.farBot.y);
    ctx.lineTo(sil.nearBot.x, sil.nearBot.y);
    ctx.closePath();
    ctx.fill();

    // Top edge specular highlight
    ctx.strokeStyle = "rgba(150,170,200,0.3)";
    ctx.lineWidth = s * 0.004;
    ctx.beginPath();
    ctx.moveTo(sil.nearTop.x, sil.nearTop.y);
    ctx.lineTo(sil.farTop.x, sil.farTop.y);
    ctx.stroke();

    // Perforated cooling jacket with heat coloring
    const jacketStart = barrelStart + s * 0.02;
    const jacketEnd = barrelStart + s * 0.24;
    const jacketRings = 9;
    for (let ring = 0; ring < jacketRings; ring++) {
      const t = ring / (jacketRings - 1);
      const ringFwd = jacketStart + (jacketEnd - jacketStart) * t;
      const ringCenter = proj(ringFwd, 0, 0);
      const ringR = s * (0.042 - t * 0.006);

      // Outer ring
      drawIsoBarrelRing(ctx, ringCenter.x, ringCenter.y, ringR, sinR, cosR, "#4a5666");

      // Perforations (alternating pattern)
      if (ring % 2 === 0) {
        const holeR = ringR * 0.35;
        drawIsoBarrelRing(ctx, ringCenter.x, ringCenter.y, holeR, sinR, cosR, "#2a3442");
      } else {
        strokeIsoBarrelRing(ctx, ringCenter.x, ringCenter.y, ringR * 0.65, sinR, cosR, "rgba(40,50,65,0.5)", 0.6);
      }

      // Inner bore ring
      drawIsoBarrelRing(ctx, ringCenter.x, ringCenter.y, ringR * 0.5, sinR, cosR, "#2e3a4a");

      // Heat glow on jacket
      if (heatGlow > 0.12) {
        const heatT = 1 - t * 0.7;
        drawIsoBarrelRing(
          ctx, ringCenter.x, ringCenter.y, ringR * 0.7, sinR, cosR,
          `rgba(255,150,60,${heatGlow * 0.12 * heatT})`,
        );
      }
    }

    // Barrel vent holes (between jacket rings)
    for (let vent = 0; vent < 4; vent++) {
      const ventFwd = jacketStart + (jacketEnd - jacketStart) * (0.15 + vent * 0.22);
      const ventTop = proj(ventFwd, 0, s * 0.035);
      ctx.fillStyle = "#1e2a38";
      ctx.beginPath();
      ctx.arc(ventTop.x, ventTop.y, s * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }

    // Muzzle brake (heavier, more detailed)
    const mzStart = barrelEnd - s * 0.006;
    const mzEnd = barrelEnd + s * 0.065;
    const mzHW = s * 0.034;
    const mzHH = s * 0.034;
    drawIsoBox(ctx, cosR, sinR, {
      tnl: proj(mzStart, -mzHW, mzHH), tnr: proj(mzStart, mzHW, mzHH),
      tfl: proj(mzEnd, -mzHW, mzHH), tfr: proj(mzEnd, mzHW, mzHH),
      bnl: proj(mzStart, -mzHW, -mzHH), bnr: proj(mzStart, mzHW, -mzHH),
      bfl: proj(mzEnd, -mzHW, -mzHH), bfr: proj(mzEnd, mzHW, -mzHH),
    }, {
      top: "#566878", sideLight: "#445262", sideDark: "#3a4856",
      endLight: "#425060", endDark: "#3e4c5a",
    });

    // Muzzle brake vent slots (angled cuts)
    ctx.strokeStyle = "#1a2028";
    ctx.lineWidth = s * 0.005;
    for (let slot = 0; slot < 4; slot++) {
      const slotFwd = mzStart + s * (0.01 + slot * 0.014);
      const slotT = proj(slotFwd, 0, mzHH * 0.85);
      const slotTm = proj(slotFwd + s * 0.004, 0, mzHH * 0.3);
      ctx.beginPath();
      ctx.moveTo(slotT.x, slotT.y);
      ctx.lineTo(slotTm.x, slotTm.y);
      ctx.stroke();
      const slotB = proj(slotFwd, 0, -mzHH * 0.85);
      const slotBm = proj(slotFwd + s * 0.004, 0, -mzHH * 0.3);
      ctx.beginPath();
      ctx.moveTo(slotB.x, slotB.y);
      ctx.lineTo(slotBm.x, slotBm.y);
      ctx.stroke();
    }

    // Muzzle face ring
    const mzFaceCenter = proj(mzEnd + s * 0.003, 0, 0);
    drawIsoBarrelRing(ctx, mzFaceCenter.x, mzFaceCenter.y, s * 0.028, sinR, cosR, "#3a4656");
    drawIsoBarrelRing(ctx, mzFaceCenter.x, mzFaceCenter.y, s * 0.018, sinR, cosR, "#0e1218");

    // Barrel bore
    const boreCenter = proj(mzEnd + s * 0.005, 0, 0);
    drawIsoBarrelRing(ctx, boreCenter.x, boreCenter.y, s * 0.012, sinR, cosR, "#080c12");
  }

  // ── Optic sight (detailed scope on rail) ──
  {
    const opBottom = hHH;
    const opH = s * 0.042;
    const opLen = s * 0.1;
    const opStart = s * 0.02;

    // Scope body
    drawIsoBox(ctx, cosR, sinR, {
      tnl: proj(opStart, -s * 0.022, opBottom + opH),
      tnr: proj(opStart, s * 0.022, opBottom + opH),
      tfl: proj(opStart + opLen, -s * 0.022, opBottom + opH),
      tfr: proj(opStart + opLen, s * 0.022, opBottom + opH),
      bnl: proj(opStart, -s * 0.022, opBottom),
      bnr: proj(opStart, s * 0.022, opBottom),
      bfl: proj(opStart + opLen, -s * 0.022, opBottom),
      bfr: proj(opStart + opLen, s * 0.022, opBottom),
    }, {
      top: "#4c5868", sideLight: "#3c4652", sideDark: "#343e48",
      endLight: "#404c5a", endDark: "#384450",
    }, "rgba(0,0,0,0.12)", 0.4);

    // Scope front lens ring
    const lensFront = proj(opStart + opLen + s * 0.005, 0, opBottom + opH * 0.5);
    drawIsoBarrelRing(ctx, lensFront.x, lensFront.y, s * 0.018, sinR, cosR, "#3a4654");

    // Lens
    const lensCenter = proj(opStart + opLen * 0.5, 0, opBottom + opH * 0.5);
    const lensColor = targetPos
      ? `rgba(255,92,72,${0.72 + Math.sin(time * 6.5) * 0.2})`
      : `rgba(100,186,255,${0.42 + Math.sin(time * 2.8) * 0.14})`;
    ctx.fillStyle = lensColor;
    ctx.beginPath();
    ctx.arc(lensCenter.x, lensCenter.y, s * 0.015, 0, Math.PI * 2);
    ctx.fill();

    // Lens glint
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(lensCenter.x - s * 0.005, lensCenter.y - s * 0.004, s * 0.005, 0, Math.PI * 2);
    ctx.fill();

    // Scope adjustment dials
    const dialPos = proj(opStart + opLen * 0.35, s * 0.025, opBottom + opH * 0.7);
    ctx.fillStyle = "#4a5462";
    ctx.beginPath();
    ctx.arc(dialPos.x, dialPos.y, s * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(150,160,180,0.25)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(dialPos.x, dialPos.y, s * 0.008, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── Rear grip / spade grips ──
  if (!drawRearBeforeHub) drawRearGrips();

  // ── AMMO BELT (linked rounds from box to receiver feed port, in gun-local 3D) ──
  {
    const beltStartFwd = (abFN + abFF) * 0.55;
    const beltStartRight = abRI;
    const beltStartUp = abUT + s * 0.005;

    const beltEndFwd = -s * 0.02;
    const beltEndRight = -hHW + s * 0.01;
    const beltEndUp = -s * 0.015;

    const beltCtrlFwd = (beltStartFwd + beltEndFwd) * 0.5;
    const beltCtrlRight = Math.min(beltStartRight, beltEndRight) - s * 0.012;
    const beltCtrlUp = (beltStartUp + beltEndUp) * 0.5 - s * 0.015;

    const beltWave = isAttacking ? time * 22 : time * 2.5;
    const linkCount = 8;
    for (let i = 0; i < linkCount; i++) {
      const t = i / (linkCount - 1);
      const nextT = Math.min(1, (i + 1) / (linkCount - 1));
      const wobble = Math.sin(beltWave + i * 0.85) * s * 0.004;
      const nextWobble = Math.sin(beltWave + (i + 1) * 0.85) * s * 0.004;

      const linkFwd = (1 - t) * (1 - t) * beltStartFwd + 2 * (1 - t) * t * beltCtrlFwd + t * t * beltEndFwd;
      const linkRight = (1 - t) * (1 - t) * beltStartRight + 2 * (1 - t) * t * beltCtrlRight + t * t * beltEndRight;
      const linkUp = (1 - t) * (1 - t) * beltStartUp + 2 * (1 - t) * t * beltCtrlUp + t * t * beltEndUp + wobble;

      const nextFwd = (1 - nextT) * (1 - nextT) * beltStartFwd + 2 * (1 - nextT) * nextT * beltCtrlFwd + nextT * nextT * beltEndFwd;
      const nextRight = (1 - nextT) * (1 - nextT) * beltStartRight + 2 * (1 - nextT) * nextT * beltCtrlRight + nextT * nextT * beltEndRight;
      const nextUp = (1 - nextT) * (1 - nextT) * beltStartUp + 2 * (1 - nextT) * nextT * beltCtrlUp + nextT * nextT * beltEndUp + nextWobble;

      const linkPos = proj(linkFwd, linkRight, linkUp);
      const nextPos = proj(nextFwd, nextRight, nextUp);

      ctx.strokeStyle = "#5b4d3c";
      ctx.lineWidth = s * 0.012;
      ctx.beginPath();
      ctx.moveTo(linkPos.x, linkPos.y);
      ctx.lineTo(nextPos.x, nextPos.y);
      ctx.stroke();

      const bulletAngle = Math.atan2(nextPos.y - linkPos.y, nextPos.x - linkPos.x);

      ctx.fillStyle = "#c9a24a";
      ctx.beginPath();
      ctx.ellipse(linkPos.x, linkPos.y, s * 0.016, s * 0.008, bulletAngle, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ddb860";
      ctx.beginPath();
      ctx.ellipse(linkPos.x, linkPos.y - s * 0.002, s * 0.012, s * 0.004, bulletAngle, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e8d4a8";
      ctx.beginPath();
      ctx.ellipse(
        linkPos.x + Math.cos(bulletAngle) * s * 0.01,
        linkPos.y + Math.sin(bulletAngle) * s * 0.01,
        s * 0.007, s * 0.004, bulletAngle, 0, Math.PI * 2,
      );
      ctx.fill();

      if (i < linkCount - 1) {
        ctx.fillStyle = "#4a3e30";
        ctx.fillRect(
          (linkPos.x + nextPos.x) * 0.5 - s * 0.004,
          (linkPos.y + nextPos.y) * 0.5 - s * 0.003,
          s * 0.008, s * 0.006,
        );
      }
    }
  }

  // ======== ATTACK EFFECTS ========
  const muzzleTip = proj(s * 0.56 - recoilOffset + barrelVibration, 0, 0);
  const ejectPort = proj(s * 0.02, s * 0.035, -s * 0.045);

  // Target lock indicator
  if (targetPos) {
    const opticLens = proj(s * 0.07, 0, s * 0.095);
    const lockPulse = 0.12 + Math.sin(time * 8) * 0.04;
    ctx.strokeStyle = `rgba(255,175,80,${lockPulse})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.moveTo(opticLens.x, opticLens.y);
    ctx.lineTo(targetPos.x, targetPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target reticle
    ctx.strokeStyle = `rgba(255,100,70,${0.35 + Math.sin(time * 7) * 0.12})`;
    ctx.lineWidth = 1.0 * zoom;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, s * 0.018, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,110,80,${0.4 + Math.sin(time * 7) * 0.15})`;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Muzzle flash
  if (isAttacking && inBurst) {
    const flashIntensity = 0.65 + Math.sin(time * fireRate * Math.PI * 2) * 0.35;
    const flashSize = s * 0.12 * flashIntensity;
    const flashX = muzzleTip.x + cosR * s * 0.015;
    const flashY = muzzleTip.y + sinR * s * 0.008;

    // Core flash
    const flashGrad = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, flashSize);
    flashGrad.addColorStop(0, `rgba(255,255,255,${flashIntensity})`);
    flashGrad.addColorStop(0.15, `rgba(255,240,180,${flashIntensity * 0.9})`);
    flashGrad.addColorStop(0.4, `rgba(255,175,80,${flashIntensity * 0.55})`);
    flashGrad.addColorStop(0.7, `rgba(255,100,30,${flashIntensity * 0.2})`);
    flashGrad.addColorStop(1, "rgba(255,60,10,0)");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();

    // Directional flash spikes
    const spikeCount = 4;
    for (let sp = 0; sp < spikeCount; sp++) {
      const spAng = rotation + (sp / spikeCount) * Math.PI * 0.8 - Math.PI * 0.2;
      const spLen = flashSize * (1.2 + Math.sin(time * 40 + sp * 1.5) * 0.4);
      ctx.fillStyle = `rgba(255,210,130,${flashIntensity * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(flashX, flashY);
      ctx.lineTo(
        flashX + Math.cos(spAng - 0.12) * spLen,
        flashY + Math.sin(spAng - 0.12) * spLen * 0.5,
      );
      ctx.lineTo(
        flashX + Math.cos(spAng + 0.12) * spLen,
        flashY + Math.sin(spAng + 0.12) * spLen * 0.5,
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  // Tracers
  if (isAttacking && targetPos) {
    for (let tracer = 0; tracer < 3; tracer++) {
      const tracerPhase = (time * fireRate + tracer * 0.27) % 1;
      if (tracerPhase > 0.82) continue;

      const headX = muzzleTip.x + (targetPos.x - muzzleTip.x) * tracerPhase;
      const headY = muzzleTip.y + (targetPos.y - muzzleTip.y) * tracerPhase;
      const tailX = headX - cosR * s * 0.1;
      const tailY = headY - sinR * s * 0.05;
      const tracerAlpha = 1 - tracerPhase * 0.75;

      const tracerGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      tracerGrad.addColorStop(0, "rgba(255,210,90,0)");
      tracerGrad.addColorStop(0.4, `rgba(255,220,130,${tracerAlpha * 0.4})`);
      tracerGrad.addColorStop(0.8, `rgba(255,245,200,${tracerAlpha * 0.8})`);
      tracerGrad.addColorStop(1, `rgba(255,255,240,${tracerAlpha})`);
      ctx.strokeStyle = tracerGrad;
      ctx.lineWidth = 2.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      // Tracer glow
      ctx.fillStyle = `rgba(255,230,150,${tracerAlpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(headX, headY, s * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Shell casing ejection
  if (isAttacking) {
    for (let casing = 0; casing < 3; casing++) {
      const casingPhase = (time * fireRate * 0.76 + casing * 0.23) % 1;
      if (casingPhase > 0.62) continue;

      const ejectProgress = casingPhase / 0.62;
      const ejectAngle = rotation + Math.PI * 0.72;
      const casingX =
        ejectPort.x +
        Math.cos(ejectAngle) * s * 0.2 * ejectProgress +
        Math.sin(time * 34 + casing * 2) * s * 0.006;
      const casingY =
        ejectPort.y +
        Math.sin(ejectAngle) * s * 0.08 * ejectProgress +
        s * 0.3 * ejectProgress * ejectProgress;
      const spin = time * 24 + casing;

      // Casing body
      ctx.fillStyle = "#d0a54f";
      ctx.beginPath();
      ctx.ellipse(casingX, casingY, s * 0.013, s * 0.005, spin, 0, Math.PI * 2);
      ctx.fill();
      // Casing highlight
      ctx.fillStyle = "#e8c270";
      ctx.beginPath();
      ctx.ellipse(casingX, casingY - s * 0.001, s * 0.009, s * 0.003, spin, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Barrel smoke
  if (isAttacking) {
    for (let smoke = 0; smoke < 4; smoke++) {
      const smokePhase = (time * 1.8 + smoke * 0.22) % 1;
      const smokeX =
        muzzleTip.x +
        cosR * s * (0.03 + smokePhase * 0.06) -
        sinR * s * 0.02 * (smoke - 1.5);
      const smokeY =
        muzzleTip.y +
        sinR * s * (0.015 + smokePhase * 0.03) -
        smokePhase * s * 0.1;
      const smokeSize = s * (0.015 + smokePhase * 0.028);
      ctx.fillStyle = `rgba(130,134,142,${(1 - smokePhase) * (0.14 + heatGlow * 0.08)})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Heat warning indicator ──
  if (heatGlow > 0.35) {
    const heatPulse = Math.sin(time * 14) > 0 ? 1 : 0.35;
    ctx.fillStyle = `rgba(255,92,48,${heatPulse})`;
    const heatPos = proj(s * 0.05, 0, s * 0.085);
    ctx.beginPath();
    ctx.arc(heatPos.x, heatPos.y, s * 0.01, 0, Math.PI * 2);
    ctx.fill();

    for (let hw = 0; hw < 4; hw++) {
      const hwPhase = (time * 1.6 + hw * 0.25) % 1;
      const hwX = muzzleTip.x + (Math.sin(time * 3.2 + hw * 1.1) - 0.5) * s * 0.05;
      const hwY = muzzleTip.y - hwPhase * s * 0.14;
      const hwA = (1 - hwPhase) * heatGlow * 0.12;
      const hwR = s * (0.012 + hwPhase * 0.022);
      ctx.fillStyle = `rgba(255,150,55,${hwA})`;
      ctx.beginPath();
      ctx.ellipse(hwX, hwY, hwR, hwR * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Idle barrel smoke wisp ──
  if (!isAttacking) {
    const smokePhase = (time * 0.4) % 1;
    const smokeA = 0.07 + Math.sin(time * 1.5) * 0.025;
    const smokeX2 = muzzleTip.x + Math.sin(time * 0.8) * s * 0.012;
    const smokeY2 = muzzleTip.y - smokePhase * s * 0.07;
    const smokeR = s * (0.01 + smokePhase * 0.015);
    ctx.fillStyle = `rgba(120,120,130,${smokeA * (1 - smokePhase)})`;
    ctx.beginPath();
    ctx.arc(smokeX2, smokeY2, smokeR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── ENGINEER EMBLEM (isometric gear with teeth and inner wrench) ──
  {
    const emblemX = x + s * 0.04;
    const emblemY = hubTopY + s * 0.04;
    const gearR = s * 0.03;
    const gearTeeth = 10;
    const gearSpin = time * (isAttacking ? 1.8 : 0.3);

    // Emblem backdrop glow
    const gearGlowA = 0.14 + Math.sin(time * 2) * 0.05;
    const gearGlow = ctx.createRadialGradient(emblemX, emblemY, 0, emblemX, emblemY, gearR * 2.2);
    gearGlow.addColorStop(0, `rgba(245,158,11,${gearGlowA})`);
    gearGlow.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = gearGlow;
    ctx.beginPath();
    ctx.arc(emblemX, emblemY, gearR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Gear body (smoother tooth profile)
    ctx.fillStyle = engineerAccent;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (let i = 0; i < gearTeeth * 2; i++) {
      const tAngle = (i / (gearTeeth * 2)) * Math.PI * 2 + gearSpin;
      const tR = i % 2 === 0 ? gearR * 1.35 : gearR * 0.82;
      const tx = emblemX + Math.cos(tAngle) * tR;
      const ty = emblemY + Math.sin(tAngle) * tR * ISO_Y_RATIO;
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.fill();

    // Gear edge stroke
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Inner ring
    ctx.strokeStyle = engineerAccent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(emblemX, emblemY, gearR * 0.6, gearR * 0.6 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Center hub
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(emblemX, emblemY, gearR * 0.38, gearR * 0.38 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wrench icon in center
    ctx.fillStyle = engineerAccent;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    const wrenchAngle = gearSpin * 0.5;
    const wrCos = Math.cos(wrenchAngle);
    const wrSin = Math.sin(wrenchAngle);
    const wrLen = gearR * 0.28;
    ctx.arc(emblemX + wrCos * wrLen, emblemY + wrSin * wrLen * ISO_Y_RATIO, gearR * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(emblemX - wrCos * wrLen, emblemY - wrSin * wrLen * ISO_Y_RATIO, gearR * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = engineerAccent;
    ctx.lineWidth = gearR * 0.12;
    ctx.beginPath();
    ctx.moveTo(emblemX + wrCos * wrLen, emblemY + wrSin * wrLen * ISO_Y_RATIO);
    ctx.lineTo(emblemX - wrCos * wrLen, emblemY - wrSin * wrLen * ISO_Y_RATIO);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── STATUS LED STRIP (operational indicators on hub) ──
  {
    const ledCount = 4;
    for (let led = 0; led < ledCount; led++) {
      const ledAngle = -Math.PI * 0.35 + (led / (ledCount - 1)) * Math.PI * 0.7;
      const ledR = s * 0.085;
      const ledX = hubX + Math.cos(ledAngle) * ledR;
      const ledY = hubTopY + s * 0.02 + Math.sin(ledAngle) * ledR * ISO_Y_RATIO;

      const ledActive = isAttacking
        ? Math.sin(time * 10 + led * 1.1) > 0
        : led < 2;
      const ledColor = isAttacking
        ? (ledActive ? `rgba(255,75,35,0.85)` : `rgba(80,30,15,0.35)`)
        : (ledActive ? `rgba(75,255,120,${0.5 + Math.sin(time * 2 + led * 0.5) * 0.15})` : `rgba(30,60,40,0.25)`);
      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.arc(ledX, ledY, s * 0.005, 0, Math.PI * 2);
      ctx.fill();

      if (ledActive) {
        const glowColor = isAttacking ? "rgba(255,75,35,0.1)" : "rgba(75,255,120,0.08)";
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(ledX, ledY, s * 0.016, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
