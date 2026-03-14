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

// Proper iso projection: applies Y-compression AFTER rotation so the barrel
// foreshortens when pointing into/away from the camera.
// fwd = along barrel, right = perpendicular in ground plane, up = vertical
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

// Draws a ring perpendicular to the barrel, correctly projected to iso.
// The ring tilts and changes shape as the barrel rotates.
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

// Draws one tripod leg as a 3D rectangular beam with top face and side face
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

  // Side wall (draw the face that points more toward camera)
  if (ny < 0) {
    fillQuad(ctx, tl0, tl1, bl1, bl0, edgeColor);
  } else {
    fillQuad(ctx, tr0, tr1, br1, br0, edgeColor);
  }

  // Main body face
  fillQuad(ctx, bl0, br0, br1, bl1, bodyColor);

  // Top face (highlight)
  fillQuad(ctx, tl0, tr0, tr1, tl1, topColor);

  // Edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(tl0.x, tl0.y);
  ctx.lineTo(tl1.x, tl1.y);
  ctx.stroke();

  // Hub-end joint bolt
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

  // Foot pad (isometric ellipse)
  ctx.fillStyle = "#1a1e26";
  ctx.beginPath();
  ctx.ellipse(ex, ey + endThick * 0.2, endW * 1.4, endW * 1.4 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#282e38";
  ctx.beginPath();
  ctx.ellipse(ex, ey - endThick * 0.1, endW, endW * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rivet at midpoint
  const mx = (sx + ex) * 0.5;
  const my = (sy + ey) * 0.5 - thickness * 0.3;
  ctx.fillStyle = "rgba(180,186,200,0.4)";
  ctx.beginPath();
  ctx.arc(mx, my, startW * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

// Draws an isometric cylinder (for the hub)
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

// Draws a 3D isometric box with proper face sorting (painter's algorithm).
// cosR/sinR determine which faces are visible.
function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  cosR: number,
  sinR: number,
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

  if (cosR > 0)
    faces.push({
      draw: () => fillQuad(ctx, c.tnl, c.tfl, c.bfl, c.bnl, colors.sideLight, stroke, lw),
      depth: cosR,
    });
  if (cosR < 0)
    faces.push({
      draw: () => fillQuad(ctx, c.tnr, c.tfr, c.bfr, c.bnr, colors.sideDark, stroke, lw),
      depth: -cosR,
    });
  if (sinR > 0)
    faces.push({
      draw: () => fillQuad(ctx, c.tnl, c.tnr, c.bnr, c.bnl, colors.endLight, stroke, lw),
      depth: sinR,
    });
  if (sinR < 0)
    faces.push({
      draw: () => fillQuad(ctx, c.tfl, c.tfr, c.bfr, c.bfl, colors.endDark, stroke, lw),
      depth: -sinR,
    });

  faces.sort((a, b) => a.depth - b.depth);
  for (const f of faces) f.draw();
  fillQuad(ctx, c.tnl, c.tnr, c.tfr, c.tfl, colors.top, stroke, lw);
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
    rotation = Math.atan2(targetPos.y - (y - s * 0.08), targetPos.x - x);
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
  const idleBob = Math.sin(time * 2.1) * s * 0.008;
  const idleHum = Math.sin(time * 1.2 + 0.6) * s * 0.004;
  const recoilOffset = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2) * s * 0.03
    : 0;
  const turretShake = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 1.35) * s * 0.012
    : 0;
  const barrelVibration = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2.6) * s * 0.008
    : 0;
  const heatGlow = isAttacking
    ? Math.min(1, attackPhase * 1.45 + Math.sin(time * 8.2) * 0.12)
    : 0;
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.35;

  ctx.save();

  // ── GROUND SHADOW ──
  const shadowR = s * 0.48;
  const shadowGrad = ctx.createRadialGradient(x, y + s * 0.36, 0, x, y + s * 0.36, shadowR);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.15)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.36, shadowR, shadowR * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── GROUND SCORCH (combat wear) ──
  if (isAttacking || heatGlow > 0.1) {
    const scorchA = 0.08 + heatGlow * 0.06;
    ctx.fillStyle = `rgba(30,20,10,${scorchA})`;
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.34, s * 0.35, s * 0.35 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── SANDBAG FORTIFICATION (isometric stacked bags) ──
  const bagCount = 10;
  const bagRingR = s * 0.38;
  for (let layer = 0; layer < 2; layer++) {
    const layerY = y + s * 0.32 - layer * s * 0.04;
    for (let i = 0; i < bagCount; i++) {
      const ang = (i / bagCount) * Math.PI * 2 + 0.25 + layer * 0.15;
      const bx = x + Math.cos(ang) * bagRingR;
      const by = layerY + Math.sin(ang) * bagRingR * ISO_Y_RATIO;

      const bagW = s * 0.075;
      const bagH = s * 0.035;
      const bagD = s * 0.025;
      const bagDepthX = bagD;
      const bagDepthY = bagD * ISO_Y_RATIO;

      // Brightness varies per bag for visual interest
      const shade = 0.85 + Math.sin(i * 2.3 + layer * 1.7) * 0.15;
      const r = Math.floor(110 * shade);
      const g = Math.floor(100 * shade);
      const b = Math.floor(78 * shade);
      const rD = Math.floor(85 * shade);
      const gD = Math.floor(76 * shade);
      const bD = Math.floor(58 * shade);
      const rT = Math.floor(125 * shade);
      const gT = Math.floor(115 * shade);
      const bT = Math.floor(90 * shade);

      // Front face
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(bx - bagW * 0.5, by, bagW, bagH);

      // Top face (isometric)
      ctx.fillStyle = `rgb(${rT},${gT},${bT})`;
      ctx.beginPath();
      ctx.moveTo(bx - bagW * 0.5, by);
      ctx.lineTo(bx - bagW * 0.5 + bagDepthX, by - bagDepthY);
      ctx.lineTo(bx + bagW * 0.5 + bagDepthX, by - bagDepthY);
      ctx.lineTo(bx + bagW * 0.5, by);
      ctx.closePath();
      ctx.fill();

      // Right side face
      ctx.fillStyle = `rgb(${rD},${gD},${bD})`;
      ctx.beginPath();
      ctx.moveTo(bx + bagW * 0.5, by);
      ctx.lineTo(bx + bagW * 0.5 + bagDepthX, by - bagDepthY);
      ctx.lineTo(bx + bagW * 0.5 + bagDepthX, by + bagH - bagDepthY);
      ctx.lineTo(bx + bagW * 0.5, by + bagH);
      ctx.closePath();
      ctx.fill();

      // Stitching line
      ctx.strokeStyle = `rgba(40,35,25,0.35)`;
      ctx.lineWidth = s * 0.003;
      ctx.beginPath();
      ctx.moveTo(bx - bagW * 0.35, by + bagH * 0.5);
      ctx.lineTo(bx + bagW * 0.35, by + bagH * 0.5);
      ctx.stroke();

      // Edge definition
      ctx.strokeStyle = "rgba(30,25,18,0.25)";
      ctx.lineWidth = 0.6;
      ctx.strokeRect(bx - bagW * 0.5, by, bagW, bagH);
    }
  }

  // ── METAL BASE PLATE (isometric diamond) ──
  const plateR = s * 0.22;
  const plateH = s * 0.02;
  // Top face
  ctx.fillStyle = "#3a4250";
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.22 - plateR * ISO_Y_RATIO);
  ctx.lineTo(x + plateR, y + s * 0.22);
  ctx.lineTo(x, y + s * 0.22 + plateR * ISO_Y_RATIO);
  ctx.lineTo(x - plateR, y + s * 0.22);
  ctx.closePath();
  ctx.fill();
  // Front edge
  ctx.fillStyle = "#2a3240";
  ctx.beginPath();
  ctx.moveTo(x - plateR, y + s * 0.22);
  ctx.lineTo(x, y + s * 0.22 + plateR * ISO_Y_RATIO);
  ctx.lineTo(x, y + s * 0.22 + plateR * ISO_Y_RATIO + plateH);
  ctx.lineTo(x - plateR, y + s * 0.22 + plateH);
  ctx.closePath();
  ctx.fill();
  // Right edge
  ctx.fillStyle = "#1e2430";
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.22 + plateR * ISO_Y_RATIO);
  ctx.lineTo(x + plateR, y + s * 0.22);
  ctx.lineTo(x + plateR, y + s * 0.22 + plateH);
  ctx.lineTo(x, y + s * 0.22 + plateR * ISO_Y_RATIO + plateH);
  ctx.closePath();
  ctx.fill();
  // Plate bolt rivets
  ctx.fillStyle = "#6a7482";
  const rivetAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  for (const ra of rivetAngles) {
    const rx = x + Math.cos(ra) * plateR * 0.65;
    const ry = y + s * 0.22 + Math.sin(ra) * plateR * 0.65 * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.arc(rx, ry, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── ISOMETRIC TRIPOD ──
  const hubX = x + shakeX * 0.15;
  const hubBaseY = y + s * 0.18 + idleBob;
  const hubHeight = s * 0.14;
  const hubTopY = hubBaseY - hubHeight;
  const legStartY = hubBaseY - hubHeight * 0.25;
  const legW = s * 0.048;
  const legEndW = s * 0.022;
  const legThick = s * 0.032;

  const legFeet = [
    { ex: x - s * 0.4, ey: y + s * 0.37 },
    { ex: x + s * 0.34, ey: y + s * 0.35 },
    { ex: x + s * 0.01, ey: y + s * 0.44 },
  ];

  // Sort legs by foot Y (ascending = farthest from camera first)
  const sortedLegs = [...legFeet].sort((a, b) => a.ey - b.ey);

  // Draw back two legs
  drawIsoTripodLeg(
    ctx, hubX, legStartY, sortedLegs[0].ex, sortedLegs[0].ey,
    legW, legEndW, legThick, "#464e5c", "#5a6472", "#3a4250",
  );
  drawIsoTripodLeg(
    ctx, hubX, legStartY, sortedLegs[1].ex, sortedLegs[1].ey,
    legW, legEndW, legThick, "#4a5260", "#5e6878", "#3e4856",
  );

  // Hub cylinder (between back legs and front leg)
  drawIsoCylinder(
    ctx, hubX, hubBaseY, s * 0.09, hubHeight,
    "#5a6472", ["#3a4250", "#58626e", "#404a58"], "rgba(170,178,190,0.18)",
  );

  // Hub pivot bolt (isometric ellipses)
  ctx.fillStyle = "#6a7280";
  ctx.beginPath();
  ctx.ellipse(hubX, hubTopY, s * 0.038, s * 0.038 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bolt highlight
  ctx.fillStyle = "#8a9098";
  ctx.beginPath();
  ctx.ellipse(hubX - s * 0.008, hubTopY - s * 0.004, s * 0.015, s * 0.015 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3e4650";
  ctx.beginPath();
  ctx.ellipse(hubX, hubTopY, s * 0.02, s * 0.02 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front leg (closest to camera, drawn on top)
  drawIsoTripodLeg(
    ctx, hubX, legStartY, sortedLegs[2].ex, sortedLegs[2].ey,
    legW, legEndW, legThick, "#4e5868", "#626e7e", "#424c5a",
  );

  // Cross-braces (triangular reinforcement ring)
  const braceT = 0.55;
  const bracePoints: Position[] = [];
  for (const leg of legFeet) {
    bracePoints.push({
      x: hubX + (leg.ex - hubX) * braceT,
      y: legStartY + (leg.ey - legStartY) * braceT - legThick * 0.15,
    });
  }
  ctx.strokeStyle = "#555d6c";
  ctx.lineWidth = s * 0.013;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    ctx.beginPath();
    ctx.moveTo(bracePoints[i].x, bracePoints[i].y);
    ctx.lineTo(bracePoints[j].x, bracePoints[j].y);
    ctx.stroke();
  }
  ctx.fillStyle = "#6a7482";
  for (const bp of bracePoints) {
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, s * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── AMMO BOX (enhanced with weathering) ──
  const ammoLeft = x - s * 0.42;
  const ammoTop = hubTopY + s * 0.04;

  // Ammo box shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(ammoLeft + s * 0.08, ammoTop + s * 0.13, s * 0.1, s * 0.04 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  drawTurretIsometricCrate(ctx, ammoLeft, ammoTop, s * 0.15, s * 0.12, s * 0.06, {
    top: "#55654f", side: "#3f4b3c", front: "#2b3329",
    outline: "rgba(225,222,196,0.06)",
  });

  // Metal corner reinforcements
  ctx.strokeStyle = "#4a5a48";
  ctx.lineWidth = s * 0.005;
  ctx.strokeRect(ammoLeft + s * 0.005, ammoTop + s * 0.005, s * 0.025, s * 0.025);
  ctx.strokeRect(ammoLeft + s * 0.12, ammoTop + s * 0.005, s * 0.025, s * 0.025);

  drawTurretBoltRow(ctx, ammoLeft + s * 0.02, ammoTop + s * 0.03, 2, s * 0.045, s * 0.005, "rgba(209,198,150,0.6)");

  // Latch straps
  ctx.strokeStyle = "rgba(18,18,18,0.75)";
  ctx.lineWidth = s * 0.006;
  for (let i = 0; i < 2; i++) {
    const lx = ammoLeft + s * (0.02 + i * 0.03);
    ctx.beginPath();
    ctx.moveTo(lx, ammoTop + s * 0.098);
    ctx.lineTo(lx + s * 0.02, ammoTop + s * 0.08);
    ctx.stroke();
  }

  // Accent stripe (engineer color)
  ctx.fillStyle = engineerAccent;
  ctx.globalAlpha = 0.75;
  ctx.fillRect(ammoLeft + s * 0.015, ammoTop + s * 0.08, s * 0.09, s * 0.02);
  ctx.globalAlpha = 1;

  // Stencil marking
  ctx.fillStyle = "rgba(200,190,150,0.2)";
  ctx.fillRect(ammoLeft + s * 0.04, ammoTop + s * 0.045, s * 0.06, s * 0.008);
  ctx.fillRect(ammoLeft + s * 0.05, ammoTop + s * 0.058, s * 0.04, s * 0.006);

  // Ammo status LED
  const ammoLedPulse = 0.4 + Math.sin(time * 4.2) * 0.15;
  ctx.fillStyle = `rgba(110,255,160,${ammoLedPulse})`;
  ctx.beginPath();
  ctx.arc(ammoLeft + s * 0.11, ammoTop + s * 0.022, s * 0.008, 0, Math.PI * 2);
  ctx.fill();
  // LED glow
  ctx.fillStyle = `rgba(110,255,160,${ammoLedPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(ammoLeft + s * 0.11, ammoTop + s * 0.022, s * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // ======== GUN ASSEMBLY (proper isometric 3D projection) ========
  const gunPivotX = hubX + shakeX;
  const gunPivotY = hubTopY - s * 0.015 + idleHum + shakeY;

  const proj = (fwd: number, right: number, up: number = 0): Position =>
    isoProject3D(gunPivotX, gunPivotY, cosR, sinR, fwd, right, up);

  // ── Rear ammo feed housing ──
  drawIsoBox(ctx, cosR, sinR, {
    tnl: proj(-s * 0.2, -s * 0.055, s * 0.04),
    tnr: proj(-s * 0.2, s * 0.055, s * 0.04),
    tfl: proj(-s * 0.08, -s * 0.055, s * 0.04),
    tfr: proj(-s * 0.08, s * 0.055, s * 0.04),
    bnl: proj(-s * 0.2, -s * 0.055, -s * 0.04),
    bnr: proj(-s * 0.2, s * 0.055, -s * 0.04),
    bfl: proj(-s * 0.08, -s * 0.055, -s * 0.04),
    bfr: proj(-s * 0.08, s * 0.055, -s * 0.04),
  }, {
    top: "#38423a", sideLight: "#2e3630", sideDark: "#252c28",
    endLight: "#2a322c", endDark: "#283028",
  });

  // ── Main gun housing (3D isometric box) ──
  const hNear = -s * 0.06;
  const hFar = s * 0.2;
  const hHW = s * 0.078;
  const hHH = s * 0.058;
  drawIsoBox(ctx, cosR, sinR, {
    tnl: proj(hNear, -hHW, hHH), tnr: proj(hNear, hHW, hHH),
    tfl: proj(hFar, -hHW, hHH), tfr: proj(hFar, hHW, hHH),
    bnl: proj(hNear, -hHW, -hHH), bnr: proj(hNear, hHW, -hHH),
    bfl: proj(hFar, -hHW, -hHH), bfr: proj(hFar, hHW, -hHH),
  }, {
    top: "#6a7888", sideLight: "#4a5462", sideDark: "#3c4652",
    endLight: "#42505c", endDark: "#3a4854",
  });

  // Top rail
  fillQuad(
    ctx,
    proj(-s * 0.01, -s * 0.02, hHH + s * 0.012),
    proj(-s * 0.01, s * 0.02, hHH + s * 0.012),
    proj(s * 0.12, s * 0.02, hHH + s * 0.012),
    proj(s * 0.12, -s * 0.02, hHH + s * 0.012),
    "#5c6878", "rgba(0,0,0,0.1)", 0.4,
  );
  for (let i = 0; i < 3; i++) {
    const bp = proj(s * (0.0 + i * 0.04), 0, hHH + s * 0.013);
    ctx.fillStyle = "rgba(200,205,215,0.35)";
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Engineer accent stripe on visible housing side
  const stripeDir = cosR > 0 ? -1 : 1;
  const stripeA = proj((hNear + hFar) * 0.5 - s * 0.04, stripeDir * (hHW + s * 0.001), 0);
  const stripeB = proj((hNear + hFar) * 0.5 + s * 0.06, stripeDir * (hHW + s * 0.001), 0);
  ctx.strokeStyle = engineerAccent;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = s * 0.01;
  ctx.beginPath();
  ctx.moveTo(stripeA.x, stripeA.y);
  ctx.lineTo(stripeB.x, stripeB.y);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Feed rail (underneath barrel)
  const feedA = proj(-s * 0.02, 0, -s * 0.06);
  const feedB = proj(s * 0.16, 0, -s * 0.065);
  ctx.strokeStyle = "#3e444e";
  ctx.lineWidth = s * 0.016;
  ctx.beginPath();
  ctx.moveTo(feedA.x, feedA.y);
  ctx.lineTo(feedB.x, feedB.y);
  ctx.stroke();

  // ── Gun shield (plate perpendicular to barrel) ──
  {
    const shFwd = s * 0.14;
    const shHalfSpan = s * 0.13;
    const shThick = s * 0.012;
    const shVOff = s * 0.02;
    const sc = {
      tl: proj(shFwd - shThick, -shHalfSpan, shVOff + shHalfSpan * 0.5),
      tr: proj(shFwd - shThick, shHalfSpan, shVOff + shHalfSpan * 0.5),
      bl: proj(shFwd - shThick, -shHalfSpan, shVOff - shHalfSpan * 0.7),
      br: proj(shFwd - shThick, shHalfSpan, shVOff - shHalfSpan * 0.7),
    };
    const shieldGrad = ctx.createLinearGradient(sc.tl.x, sc.tl.y, sc.br.x, sc.br.y);
    shieldGrad.addColorStop(0, "#505a68");
    shieldGrad.addColorStop(0.3, "#667080");
    shieldGrad.addColorStop(0.5, "#748296");
    shieldGrad.addColorStop(0.7, "#667080");
    shieldGrad.addColorStop(1, "#4c5664");
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(sc.tl.x, sc.tl.y);
    ctx.lineTo(sc.tr.x, sc.tr.y);
    ctx.lineTo(sc.br.x, sc.br.y);
    ctx.lineTo(sc.bl.x, sc.bl.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.strokeStyle = "rgba(160,175,195,0.18)";
    ctx.lineWidth = s * 0.004;
    ctx.beginPath();
    ctx.moveTo(sc.tl.x, sc.tl.y);
    ctx.lineTo(sc.tr.x, sc.tr.y);
    ctx.stroke();
  }

  // ── Barrel (3D cylindrical silhouette + cooling jacket) ──
  {
    const barrelStart = s * 0.15 - recoilOffset;
    const barrelEnd = s * 0.46 - recoilOffset + barrelVibration;
    const barrelR = s * 0.022;

    // Compute barrel silhouette edges (topmost/bottommost screen points of cross-section)
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

    // Barrel body with gradient (light on top, dark on bottom)
    const barrelGrad = ctx.createLinearGradient(
      sil.nearTop.x, sil.nearTop.y, sil.nearBot.x, sil.nearBot.y,
    );
    barrelGrad.addColorStop(0, "#58626e");
    barrelGrad.addColorStop(0.3, "#3e4858");
    barrelGrad.addColorStop(0.7, "#2a3040");
    barrelGrad.addColorStop(1, "#1e242e");
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.moveTo(sil.nearTop.x, sil.nearTop.y);
    ctx.lineTo(sil.farTop.x, sil.farTop.y);
    ctx.lineTo(sil.farBot.x, sil.farBot.y);
    ctx.lineTo(sil.nearBot.x, sil.nearBot.y);
    ctx.closePath();
    ctx.fill();

    // Top edge highlight
    ctx.strokeStyle = "rgba(140,155,180,0.28)";
    ctx.lineWidth = s * 0.004;
    ctx.beginPath();
    ctx.moveTo(sil.nearTop.x, sil.nearTop.y);
    ctx.lineTo(sil.farTop.x, sil.farTop.y);
    ctx.stroke();

    // Cooling jacket rings (properly oriented iso ellipses)
    const jacketLen = s * 0.22;
    for (let ring = 0; ring < 7; ring++) {
      const t = ring / 6;
      const ringFwd = barrelStart + jacketLen * t;
      const ringCenter = proj(ringFwd, 0, 0);
      const ringR = s * (0.04 - t * 0.005);

      drawIsoBarrelRing(ctx, ringCenter.x, ringCenter.y, ringR, sinR, cosR, "#4e5868");
      drawIsoBarrelRing(ctx, ringCenter.x, ringCenter.y, ringR * 0.55, sinR, cosR, "#2a3040");

      if (heatGlow > 0.15) {
        drawIsoBarrelRing(
          ctx, ringCenter.x, ringCenter.y, ringR * 0.75, sinR, cosR,
          `rgba(255,160,70,${heatGlow * 0.14 * (1 - t * 0.6)})`,
        );
      }
    }

    // Muzzle brake (3D box)
    drawIsoBox(ctx, cosR, sinR, {
      tnl: proj(barrelEnd - s * 0.004, -s * 0.03, s * 0.03),
      tnr: proj(barrelEnd - s * 0.004, s * 0.03, s * 0.03),
      tfl: proj(barrelEnd + s * 0.06, -s * 0.03, s * 0.03),
      tfr: proj(barrelEnd + s * 0.06, s * 0.03, s * 0.03),
      bnl: proj(barrelEnd - s * 0.004, -s * 0.03, -s * 0.03),
      bnr: proj(barrelEnd - s * 0.004, s * 0.03, -s * 0.03),
      bfl: proj(barrelEnd + s * 0.06, -s * 0.03, -s * 0.03),
      bfr: proj(barrelEnd + s * 0.06, s * 0.03, -s * 0.03),
    }, {
      top: "#505c6c", sideLight: "#404a56", sideDark: "#363e4a",
      endLight: "#3e4854", endDark: "#3a444e",
    });

    // Muzzle slots
    ctx.strokeStyle = "#1a1e26";
    ctx.lineWidth = s * 0.004;
    for (let slot = 0; slot < 3; slot++) {
      const slotFwd = barrelEnd + s * (0.01 + slot * 0.016);
      const slotT = proj(slotFwd, 0, s * 0.026);
      const slotTM = proj(slotFwd, 0, s * 0.01);
      const slotB = proj(slotFwd, 0, -s * 0.026);
      const slotBM = proj(slotFwd, 0, -s * 0.01);
      ctx.beginPath();
      ctx.moveTo(slotT.x, slotT.y);
      ctx.lineTo(slotTM.x, slotTM.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(slotB.x, slotB.y);
      ctx.lineTo(slotBM.x, slotBM.y);
      ctx.stroke();
    }

    // Barrel bore
    const boreCenter = proj(barrelEnd + s * 0.058, 0, 0);
    drawIsoBarrelRing(ctx, boreCenter.x, boreCenter.y, s * 0.018, sinR, cosR, "#0e1218");
  }

  // ── Optic sight (on top of receiver) ──
  {
    const opBottom = hHH;
    const opH = s * 0.04;
    drawIsoBox(ctx, cosR, sinR, {
      tnl: proj(s * 0.02, -s * 0.02, opBottom + opH),
      tnr: proj(s * 0.02, s * 0.02, opBottom + opH),
      tfl: proj(s * 0.11, -s * 0.02, opBottom + opH),
      tfr: proj(s * 0.11, s * 0.02, opBottom + opH),
      bnl: proj(s * 0.02, -s * 0.02, opBottom),
      bnr: proj(s * 0.02, s * 0.02, opBottom),
      bfl: proj(s * 0.11, -s * 0.02, opBottom),
      bfr: proj(s * 0.11, s * 0.02, opBottom),
    }, {
      top: "#4a5564", sideLight: "#3a424e", sideDark: "#323a44",
      endLight: "#3e4854", endDark: "#364048",
    }, "rgba(0,0,0,0.12)", 0.4);

    const lensCenter = proj(s * 0.065, 0, opBottom + opH * 0.5);
    const lensColor = targetPos
      ? `rgba(255,96,80,${0.7 + Math.sin(time * 6.5) * 0.18})`
      : `rgba(104,189,255,${0.4 + Math.sin(time * 2.8) * 0.12})`;
    ctx.fillStyle = lensColor;
    ctx.beginPath();
    ctx.arc(lensCenter.x, lensCenter.y, s * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(lensCenter.x - s * 0.004, lensCenter.y - s * 0.004, s * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Rear sight crosshair ──
  {
    const sightCenter = proj(-s * 0.14, 0, s * 0.1);
    ctx.strokeStyle = "rgba(206,195,145,0.3)";
    ctx.lineWidth = s * 0.007;
    ctx.beginPath();
    ctx.arc(sightCenter.x, sightCenter.y, s * 0.03, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sightCenter.x, sightCenter.y - s * 0.03);
    ctx.lineTo(sightCenter.x, sightCenter.y + s * 0.03);
    ctx.moveTo(sightCenter.x - s * 0.03, sightCenter.y);
    ctx.lineTo(sightCenter.x + s * 0.03, sightCenter.y);
    ctx.stroke();
  }

  // ── AMMO BELT ──
  {
    const beltStart = { x: ammoLeft + s * 0.12, y: ammoTop - s * 0.008 };
    const beltControl = {
      x: x - s * 0.14 - sinR * s * 0.02,
      y: hubTopY - s * 0.06 - Math.abs(cosR) * s * 0.015,
    };
    const beltFeed = proj(s * 0.02, -s * 0.04, -s * 0.03);

    const beltWave = isAttacking ? time * 20 : time * 3;
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const nextT = Math.min(1, (i + 1) / 5);
      const wobble = Math.sin(beltWave + i * 0.9) * s * 0.006;
      const nextWobble = Math.sin(beltWave + (i + 1) * 0.9) * s * 0.006;

      const linkX =
        (1 - t) * (1 - t) * beltStart.x +
        2 * (1 - t) * t * beltControl.x +
        t * t * beltFeed.x;
      const linkY =
        (1 - t) * (1 - t) * beltStart.y +
        2 * (1 - t) * t * beltControl.y +
        t * t * beltFeed.y + wobble;
      const nextLinkX =
        (1 - nextT) * (1 - nextT) * beltStart.x +
        2 * (1 - nextT) * nextT * beltControl.x +
        nextT * nextT * beltFeed.x;
      const nextLinkY =
        (1 - nextT) * (1 - nextT) * beltStart.y +
        2 * (1 - nextT) * nextT * beltControl.y +
        nextT * nextT * beltFeed.y + nextWobble;

      ctx.strokeStyle = "#5b4d3c";
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.moveTo(linkX, linkY);
      ctx.lineTo(nextLinkX, nextLinkY);
      ctx.stroke();

      const bulletAngle = Math.atan2(nextLinkY - linkY, nextLinkX - linkX);
      ctx.fillStyle = "#caa24d";
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, s * 0.015, s * 0.007, bulletAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e5d0a7";
      ctx.beginPath();
      ctx.ellipse(
        linkX + Math.cos(bulletAngle) * s * 0.009,
        linkY + Math.sin(bulletAngle) * s * 0.009,
        s * 0.006, s * 0.003, bulletAngle, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ======== ATTACK EFFECTS ========
  const muzzleTip = proj(s * 0.54 - recoilOffset + barrelVibration, 0, 0);
  const ejectPort = proj(s * 0.02, s * 0.03, -s * 0.04);
  const opticLens = proj(s * 0.065, 0, s * 0.09);

  if (targetPos) {
    const lockPulse = 0.14 + Math.sin(time * 8) * 0.04;
    ctx.strokeStyle = `rgba(255,175,80,${lockPulse})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.moveTo(opticLens.x, opticLens.y);
    ctx.lineTo(targetPos.x, targetPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255,110,80,${0.5 + Math.sin(time * 7) * 0.15})`;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isAttacking && inBurst) {
    const flashIntensity = 0.62 + Math.sin(time * fireRate * Math.PI * 2) * 0.38;
    const flashSize = s * 0.1 * flashIntensity;
    const flashX = muzzleTip.x + cosR * s * 0.012;
    const flashY = muzzleTip.y + sinR * s * 0.006;
    const flashGrad = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, flashSize);
    flashGrad.addColorStop(0, `rgba(255,255,255,${flashIntensity})`);
    flashGrad.addColorStop(0.2, `rgba(255,236,174,${flashIntensity * 0.88})`);
    flashGrad.addColorStop(0.5, `rgba(255,170,78,${flashIntensity * 0.52})`);
    flashGrad.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,205,120,${flashIntensity * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(flashX, flashY);
    ctx.lineTo(
      flashX + cosR * flashSize * 1.8 + sinR * flashSize * 0.35,
      flashY + sinR * flashSize * 0.9 - cosR * flashSize * 0.18,
    );
    ctx.lineTo(
      flashX + cosR * flashSize * 1.8 - sinR * flashSize * 0.35,
      flashY + sinR * flashSize * 0.9 + cosR * flashSize * 0.18,
    );
    ctx.closePath();
    ctx.fill();
  }

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
      tracerGrad.addColorStop(0.5, `rgba(255,218,126,${tracerAlpha * 0.45})`);
      tracerGrad.addColorStop(1, `rgba(255,245,210,${tracerAlpha})`);
      ctx.strokeStyle = tracerGrad;
      ctx.lineWidth = 2.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    }
  }

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

      ctx.fillStyle = "#d0a54f";
      ctx.beginPath();
      ctx.ellipse(casingX, casingY, s * 0.012, s * 0.005, spin, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (isAttacking) {
    for (let smoke = 0; smoke < 3; smoke++) {
      const smokePhase = (time * 1.7 + smoke * 0.28) % 1;
      const smokeX =
        muzzleTip.x +
        cosR * s * (0.03 + smokePhase * 0.05) -
        sinR * s * 0.025 * smoke;
      const smokeY =
        muzzleTip.y +
        sinR * s * (0.015 + smokePhase * 0.03) -
        smokePhase * s * 0.08;
      const smokeSize = s * (0.018 + smokePhase * 0.025);
      ctx.fillStyle = `rgba(132,136,144,${(1 - smokePhase) * (0.15 + heatGlow * 0.1)})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── STATUS INDICATORS ──
  if (heatGlow > 0.35) {
    const heatPulse = Math.sin(time * 14) > 0 ? 1 : 0.35;
    ctx.fillStyle = `rgba(255,92,48,${heatPulse})`;
    const heatPos = proj(s * 0.05, 0, s * 0.08);
    ctx.beginPath();
    ctx.arc(heatPos.x, heatPos.y, s * 0.01, 0, Math.PI * 2);
    ctx.fill();

    // Heat shimmer waves above barrel when overheating
    for (let hw = 0; hw < 3; hw++) {
      const hwPhase = (time * 1.5 + hw * 0.33) % 1;
      const hwX = muzzleTip.x + (Math.sin(time * 3 + hw * 1.2) - 0.5) * s * 0.04;
      const hwY = muzzleTip.y - hwPhase * s * 0.12;
      const hwA = (1 - hwPhase) * heatGlow * 0.15;
      const hwR = s * (0.015 + hwPhase * 0.02);
      ctx.fillStyle = `rgba(255,160,60,${hwA})`;
      ctx.beginPath();
      ctx.ellipse(hwX, hwY, hwR, hwR * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── AMBIENT IDLE SMOKE (wisp from barrel when not attacking) ──
  if (!isAttacking) {
    const smokePhase = (time * 0.4) % 1;
    const smokeA = 0.06 + Math.sin(time * 1.5) * 0.02;
    const smokeX2 = muzzleTip.x + Math.sin(time * 0.8) * s * 0.01;
    const smokeY2 = muzzleTip.y - smokePhase * s * 0.06;
    const smokeR = s * (0.008 + smokePhase * 0.012);
    ctx.fillStyle = `rgba(120,120,130,${smokeA * (1 - smokePhase)})`;
    ctx.beginPath();
    ctx.arc(smokeX2, smokeY2, smokeR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── ENGINEER EMBLEM (isometric gear with proper teeth) ──
  {
    const emblemX = x + s * 0.04;
    const emblemY = hubTopY + s * 0.04;
    const gearR = s * 0.028;
    const gearTeeth = 8;
    const gearSpin = time * (isAttacking ? 1.7 : 0.35);

    // Gear outer glow
    const gearGlowA = 0.12 + Math.sin(time * 2) * 0.04;
    const gearGlow = ctx.createRadialGradient(emblemX, emblemY, 0, emblemX, emblemY, gearR * 2);
    gearGlow.addColorStop(0, `rgba(245,158,11,${gearGlowA})`);
    gearGlow.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = gearGlow;
    ctx.beginPath();
    ctx.arc(emblemX, emblemY, gearR * 2, 0, Math.PI * 2);
    ctx.fill();

    // Gear body with teeth
    ctx.fillStyle = engineerAccent;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    for (let i = 0; i < gearTeeth * 2; i++) {
      const tAngle = (i / (gearTeeth * 2)) * Math.PI * 2 + gearSpin;
      const tR = i % 2 === 0 ? gearR * 1.3 : gearR * 0.85;
      const tx = emblemX + Math.cos(tAngle) * tR;
      const ty = emblemY + Math.sin(tAngle) * tR * ISO_Y_RATIO;
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.fill();

    // Gear center hub
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.ellipse(emblemX, emblemY, gearR * 0.4, gearR * 0.4 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gear center dot
    ctx.fillStyle = engineerAccent;
    ctx.beginPath();
    ctx.ellipse(emblemX, emblemY, gearR * 0.15, gearR * 0.15 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Gear edge stroke for definition
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = 0; i < gearTeeth * 2; i++) {
      const tAngle = (i / (gearTeeth * 2)) * Math.PI * 2 + gearSpin;
      const tR = i % 2 === 0 ? gearR * 1.3 : gearR * 0.85;
      const tx = emblemX + Math.cos(tAngle) * tR;
      const ty = emblemY + Math.sin(tAngle) * tR * ISO_Y_RATIO;
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // ── OPERATIONAL STATUS LED STRIP (on hub) ──
  {
    const ledCount = 3;
    for (let led = 0; led < ledCount; led++) {
      const ledAngle = -Math.PI * 0.3 + (led / (ledCount - 1)) * Math.PI * 0.6;
      const ledR = s * 0.08;
      const ledX = hubX + Math.cos(ledAngle) * ledR;
      const ledY = hubTopY + s * 0.02 + Math.sin(ledAngle) * ledR * ISO_Y_RATIO;

      const ledActive = isAttacking
        ? Math.sin(time * 8 + led * 1.2) > 0
        : led === 0;
      const ledColor = isAttacking
        ? (ledActive ? `rgba(255,80,40,0.8)` : `rgba(80,30,15,0.4)`)
        : (ledActive ? `rgba(80,255,120,${0.5 + Math.sin(time * 2) * 0.15})` : `rgba(30,60,40,0.3)`);
      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.arc(ledX, ledY, s * 0.005, 0, Math.PI * 2);
      ctx.fill();

      // LED glow
      if (ledActive) {
        const glowColor = isAttacking ? "rgba(255,80,40,0.1)" : "rgba(80,255,120,0.08)";
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(ledX, ledY, s * 0.015, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
