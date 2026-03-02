// Tower Rendering Functions - Extracted from rendering/index.ts
import type { Tower, Enemy, DraggingTower, Position } from "../../types";
import { TILE_SIZE, TOWER_DATA, TOWER_COLORS } from "../../constants";
import { TOWER_STATS } from "../../constants/towerStats";
import {
  gridToWorld,
  worldToScreen,
  isValidBuildPosition,
  lightenColor,
  darkenColor,
} from "../../utils";
import { setShadowBlur, clearShadow } from "../performance";

function drawIsometricPrism(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  colors: {
    top: string;
    left: string;
    right: string;
    leftBack?: string;
    rightBack?: string;
  },
  zoom: number = 1,
) {
  const w = width * zoom * 0.5;
  const d = depth * zoom * 0.25;
  const h = height * zoom;

  // Calculate vertices for isometric box
  const topFront = { x, y: y - h + d };
  const topBack = { x, y: y - h - d };
  const topLeft = { x: x - w, y: y - h };
  const topRight = { x: x + w, y: y - h };
  const bottomFront = { x, y: y + d };
  const bottomBack = { x, y: y - d };
  const bottomLeft = { x: x - w, y };
  const bottomRight = { x: x + w, y };

  // Draw back faces first
  ctx.fillStyle = colors.leftBack || darkenColor(colors.left, -20);
  ctx.beginPath();
  ctx.moveTo(topBack.x, topBack.y);
  ctx.lineTo(topLeft.x, topLeft.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.lineTo(bottomBack.x, bottomBack.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.rightBack || darkenColor(colors.right, -20);
  ctx.beginPath();
  ctx.moveTo(topBack.x, topBack.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomBack.x, bottomBack.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front-left wall
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y);
  ctx.lineTo(topFront.x, topFront.y);
  ctx.lineTo(bottomFront.x, bottomFront.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front-right wall
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(topRight.x, topRight.y);
  ctx.lineTo(topFront.x, topFront.y);
  ctx.lineTo(bottomFront.x, bottomFront.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top face
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(topBack.x, topBack.y);
  ctx.lineTo(topLeft.x, topLeft.y);
  ctx.lineTo(topFront.x, topFront.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Draws a 3D isometric gothic (pointed-arch) window flush against an iso wall face.
 * @param face "left" or "right" — determines the iso skew direction
 * @param glowColor CSS color string for the inner glow, or null for no glow
 * @param glowAlpha opacity multiplier for the glow
 */
function drawIsoGothicWindow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: "left" | "right",
  zoom: number,
  glowColor: string | null = "rgba(255, 150, 50",
  glowAlpha: number = 0.3,
) {
  const slope = face === "right" ? -0.5 : 0.5;
  const hw = w * zoom * 0.5;
  const hh = h * zoom * 0.5;
  const archPeak = hh + 2.5 * zoom;

  // Recess depth for 3D effect
  const rd = 1.2 * zoom;
  const rdx = face === "right" ? rd : -rd;
  const rdy = -rd * 0.5;

  // Frame recess (darker border)
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.moveTo(cx - hw + rdx, cy - hh + -hw * slope + rdy);
  ctx.lineTo(cx + rdx, cy - archPeak + rdy);
  ctx.lineTo(cx + hw + rdx, cy - hh + hw * slope + rdy);
  ctx.lineTo(cx + hw + rdx, cy + hh + hw * slope + rdy);
  ctx.lineTo(cx - hw + rdx, cy + hh + -hw * slope + rdy);
  ctx.closePath();
  ctx.fill();

  // Window void (darkest)
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - hh + -hw * slope);
  ctx.lineTo(cx, cy - archPeak);
  ctx.lineTo(cx + hw, cy - hh + hw * slope);
  ctx.lineTo(cx + hw, cy + hh + hw * slope);
  ctx.lineTo(cx - hw, cy + hh + -hw * slope);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Inner glow
  if (glowColor) {
    ctx.fillStyle = `${glowColor}, ${glowAlpha})`;
    ctx.beginPath();
    const inset = 0.3 * zoom;
    ctx.moveTo(cx - hw + inset, cy - hh + -hw * slope + inset * 0.5);
    ctx.lineTo(cx, cy - archPeak + inset);
    ctx.lineTo(cx + hw - inset, cy - hh + hw * slope + inset * 0.5);
    ctx.lineTo(cx + hw - inset, cy + hh + hw * slope - inset * 0.5);
    ctx.lineTo(cx - hw + inset, cy + hh + -hw * slope - inset * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Stone sill at bottom
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  const sillH = 1 * zoom;
  ctx.moveTo(cx - hw - 0.5 * zoom, cy + hh + -hw * slope);
  ctx.lineTo(cx + hw + 0.5 * zoom, cy + hh + hw * slope);
  ctx.lineTo(cx + hw + 0.5 * zoom, cy + hh + hw * slope + sillH);
  ctx.lineTo(cx - hw - 0.5 * zoom, cy + hh + -hw * slope + sillH);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// ENHANCED MECHANICAL HELPER FUNCTIONS - Moving parts, gears, steam, etc.
// ============================================================================

// Draw an animated rotating gear
function drawGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  teeth: number,
  rotation: number,
  colors: { outer: string; inner: string; teeth: string; highlight: string },
  zoom: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Draw teeth
  ctx.fillStyle = colors.teeth;
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const toothWidth = (Math.PI / teeth) * 0.6;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle - toothWidth) * innerRadius * zoom,
      Math.sin(angle - toothWidth) * innerRadius * zoom * 0.5,
    );
    ctx.lineTo(
      Math.cos(angle - toothWidth * 0.5) * outerRadius * zoom,
      Math.sin(angle - toothWidth * 0.5) * outerRadius * zoom * 0.5,
    );
    ctx.lineTo(
      Math.cos(angle + toothWidth * 0.5) * outerRadius * zoom,
      Math.sin(angle + toothWidth * 0.5) * outerRadius * zoom * 0.5,
    );
    ctx.lineTo(
      Math.cos(angle + toothWidth) * innerRadius * zoom,
      Math.sin(angle + toothWidth) * innerRadius * zoom * 0.5,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Gear body
  ctx.fillStyle = colors.outer;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    innerRadius * zoom,
    innerRadius * zoom * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Inner ring
  ctx.fillStyle = colors.inner;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    innerRadius * 0.6 * zoom,
    innerRadius * 0.6 * zoom * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Center hub
  ctx.fillStyle = colors.highlight;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    innerRadius * 0.25 * zoom,
    innerRadius * 0.25 * zoom * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Spokes
  ctx.strokeStyle = colors.teeth;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * innerRadius * 0.3 * zoom,
      Math.sin(angle) * innerRadius * 0.3 * zoom * 0.5,
    );
    ctx.lineTo(
      Math.cos(angle) * innerRadius * 0.85 * zoom,
      Math.sin(angle) * innerRadius * 0.85 * zoom * 0.5,
    );
    ctx.stroke();
  }

  ctx.restore();
}

// Draw animated steam/smoke effect
function drawSteamVent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  intensity: number,
  zoom: number,
  color: string = "rgba(200, 200, 200, ",
) {
  const numPuffs = 4;
  for (let i = 0; i < numPuffs; i++) {
    const phase = (time * 2 + i * 0.3) % 1;
    const puffY = y - phase * 25 * zoom * intensity;
    const puffSize = (3 + phase * 4) * zoom * intensity;
    const alpha = (1 - phase) * 0.4;
    const drift = Math.sin(time * 3 + i) * 4 * zoom;

    ctx.fillStyle = `${color}${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x + drift, puffY, puffSize, puffSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw animated conveyor belt with items
function drawConveyorBelt(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number,
  time: number,
  zoom: number,
  itemColor: string,
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);

  // Belt track
  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(0, -width * zoom * 0.5, length, width * zoom);

  // Belt segments (animated)
  ctx.fillStyle = "#3a3a42";
  const segmentWidth = 8 * zoom;
  const numSegments = Math.floor(length / segmentWidth) + 2;
  const offset = (time * 40 * zoom) % segmentWidth;

  for (let i = 0; i < numSegments; i++) {
    const segX = i * segmentWidth - offset;
    if (segX >= -segmentWidth && segX <= length) {
      ctx.fillRect(
        segX,
        -width * zoom * 0.4,
        segmentWidth * 0.6,
        width * zoom * 0.8,
      );
    }
  }

  // Moving items (ammo boxes)
  const numItems = 2;
  for (let i = 0; i < numItems; i++) {
    const itemPhase = (time * 0.5 + i * 0.5) % 1;
    const itemX = itemPhase * length;

    ctx.fillStyle = itemColor;
    ctx.fillRect(
      itemX - 4 * zoom,
      -width * zoom * 0.35,
      8 * zoom,
      width * zoom * 0.7,
    );

    // Item detail
    ctx.fillStyle = darkenColor(itemColor, 20);
    ctx.fillRect(
      itemX - 3 * zoom,
      -width * zoom * 0.25,
      2 * zoom,
      width * zoom * 0.5,
    );
  }

  ctx.restore();
}

// Draw glowing energy tube/pipe
function drawEnergyTube(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  radius: number,
  time: number,
  zoom: number,
  color: string,
) {
  const dx = endX - startX;
  const dy = endY - startY;

  // Tube body
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = radius * 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Inner glow
  const glowPulse = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.strokeStyle = color
    .replace(")", `, ${glowPulse})`)
    .replace("rgb", "rgba");
  ctx.lineWidth = radius * zoom;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Energy flow particles
  const numParticles = 3;
  for (let i = 0; i < numParticles; i++) {
    const phase = (time * 2 + i / numParticles) % 1;
    const px = startX + dx * phase;
    const py = startY + dy * phase;
    const alpha = Math.sin(phase * Math.PI) * 0.8;

    ctx.fillStyle = color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw animated ammunition/supply box (proper 3D isometric)
function drawAmmoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  colors: { main: string; accent: string; label: string },
  zoom: number,
  bouncePhase: number = 0,
) {
  const bounce = Math.sin(bouncePhase) * 2 * zoom;
  const boxY = y - bounce;

  const hw = width * zoom * 0.5;
  const hd = depth * zoom * 0.25;
  const hh = height * zoom;

  // Left face
  ctx.fillStyle = darkenColor(colors.main, 15);
  ctx.beginPath();
  ctx.moveTo(x - hw, boxY);
  ctx.lineTo(x, boxY + hd);
  ctx.lineTo(x, boxY + hd - hh);
  ctx.lineTo(x - hw, boxY - hh);
  ctx.closePath();
  ctx.fill();

  // Left face edge
  ctx.strokeStyle = darkenColor(colors.main, 35);
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Warning stripe on left face (parallelogram following iso face)
  const stripeT = 0.35;
  const stripeH = hh * 0.15;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(x - hw, boxY - hh * stripeT);
  ctx.lineTo(x, boxY + hd - hh * stripeT);
  ctx.lineTo(x, boxY + hd - hh * stripeT - stripeH);
  ctx.lineTo(x - hw, boxY - hh * stripeT - stripeH);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = darkenColor(colors.main, 30);
  ctx.beginPath();
  ctx.moveTo(x + hw, boxY);
  ctx.lineTo(x, boxY + hd);
  ctx.lineTo(x, boxY + hd - hh);
  ctx.lineTo(x + hw, boxY - hh);
  ctx.closePath();
  ctx.fill();

  // Right face edge
  ctx.strokeStyle = darkenColor(colors.main, 45);
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Warning stripe on right face
  ctx.fillStyle = darkenColor(colors.accent, 15);
  ctx.beginPath();
  ctx.moveTo(x + hw, boxY - hh * stripeT);
  ctx.lineTo(x, boxY + hd - hh * stripeT);
  ctx.lineTo(x, boxY + hd - hh * stripeT - stripeH);
  ctx.lineTo(x + hw, boxY - hh * stripeT - stripeH);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = colors.main;
  ctx.beginPath();
  ctx.moveTo(x, boxY - hh - hd);
  ctx.lineTo(x - hw, boxY - hh);
  ctx.lineTo(x, boxY - hh + hd);
  ctx.lineTo(x + hw, boxY - hh);
  ctx.closePath();
  ctx.fill();

  // Top face edge
  ctx.strokeStyle = lightenColor(colors.main, 15);
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Handle/clasp on top
  ctx.strokeStyle = darkenColor(colors.main, 25);
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.3, boxY - hh - hd * 0.3);
  ctx.lineTo(x + hw * 0.3, boxY - hh + hd * 0.3);
  ctx.stroke();
}

// Draw pulsing warning light
function drawWarningLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  zoom: number,
  color: string,
  flashSpeed: number = 3,
) {
  const flash = 0.5 + Math.sin(time * flashSpeed) * 0.5;

  // Glow
  setShadowBlur(ctx, 10 * zoom * flash, color);

  // Light body
  ctx.fillStyle = darkenColor(color, 30);
  ctx.beginPath();
  ctx.arc(x, y, radius * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Bright center
  ctx.fillStyle = color;
  ctx.globalAlpha = flash;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.7 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  clearShadow(ctx);
}

// Draw 3D isometric ammo box that rotates with cannon turret
function draw3DAmmoBox(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  size: "small" | "medium" | "large" = "medium",
) {
  const sm = size === "small" ? 0.95 : size === "large" ? 1.4 : 1.15;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const fwdX = cosR;
  const fwdY = sinR * 0.5;

  const boxW = 8 * zoom * sm;
  const boxD = 6 * zoom * sm;
  const boxH = 14 * zoom * sm;

  const c = [
    {
      x: centerX + fwdX * boxD + perpX * boxW,
      y: centerY + fwdY * boxD + perpY * boxW,
    },
    {
      x: centerX + fwdX * boxD - perpX * boxW,
      y: centerY + fwdY * boxD - perpY * boxW,
    },
    {
      x: centerX - fwdX * boxD - perpX * boxW,
      y: centerY - fwdY * boxD - perpY * boxW,
    },
    {
      x: centerX - fwdX * boxD + perpX * boxW,
      y: centerY - fwdY * boxD + perpY * boxW,
    },
    {
      x: centerX + fwdX * boxD + perpX * boxW,
      y: centerY + fwdY * boxD + perpY * boxW - boxH,
    },
    {
      x: centerX + fwdX * boxD - perpX * boxW,
      y: centerY + fwdY * boxD - perpY * boxW - boxH,
    },
    {
      x: centerX - fwdX * boxD - perpX * boxW,
      y: centerY - fwdY * boxD - perpY * boxW - boxH,
    },
    {
      x: centerX - fwdX * boxD + perpX * boxW,
      y: centerY - fwdY * boxD + perpY * boxW - boxH,
    },
  ];

  const showFront = fwdY > -0.1;
  const showBack = fwdY < 0.1;
  const showLeft = perpY > -0.1;
  const showRight = perpY < 0.1;

  const frontLit = 0.4 + Math.max(0, fwdY) * 0.6;
  const backLit = 0.4 + Math.max(0, -fwdY) * 0.6;
  const leftLit = 0.4 + Math.max(0, perpY) * 0.6;
  const rightLit = 0.4 + Math.max(0, -perpY) * 0.6;

  const olive = (lit: number) => {
    const r = Math.floor(38 + lit * 32);
    const g = Math.floor(44 + lit * 38);
    const b = Math.floor(26 + lit * 22);
    return `rgb(${r},${g},${b})`;
  };

  type Face = {
    corners: number[];
    lit: number;
    isTop?: boolean;
    normal: string;
  };
  const faces: Face[] = [];
  if (showBack)
    faces.push({ corners: [3, 2, 6, 7], lit: backLit, normal: "back" });
  if (showLeft)
    faces.push({ corners: [0, 3, 7, 4], lit: leftLit, normal: "left" });
  if (showRight)
    faces.push({ corners: [2, 1, 5, 6], lit: rightLit, normal: "right" });
  if (showFront)
    faces.push({ corners: [1, 0, 4, 5], lit: frontLit, normal: "front" });
  faces.push({ corners: [4, 5, 6, 7], lit: 0.8, isTop: true, normal: "top" });

  faces.sort((a, b) => {
    const avgYa = a.corners.reduce((s, i) => s + c[i].y, 0) / a.corners.length;
    const avgYb = b.corners.reduce((s, i) => s + c[i].y, 0) / b.corners.length;
    return avgYa - avgYb;
  });

  for (const face of faces) {
    ctx.fillStyle = olive(face.lit + (face.isTop ? 0.15 : 0));
    ctx.beginPath();
    ctx.moveTo(c[face.corners[0]].x, c[face.corners[0]].y);
    for (let i = 1; i < face.corners.length; i++) {
      ctx.lineTo(c[face.corners[i]].x, c[face.corners[i]].y);
    }
    ctx.closePath();
    ctx.fill();

    if (face.isTop) {
      // Handle on top
      const mid01 = { x: (c[4].x + c[5].x) * 0.5, y: (c[4].y + c[5].y) * 0.5 };
      const mid23 = { x: (c[6].x + c[7].x) * 0.5, y: (c[6].y + c[7].y) * 0.5 };
      const hL = {
        x: mid01.x * 0.65 + mid23.x * 0.35,
        y: mid01.y * 0.65 + mid23.y * 0.35,
      };
      const hR = {
        x: mid01.x * 0.35 + mid23.x * 0.65,
        y: mid01.y * 0.35 + mid23.y * 0.65,
      };
      const hUp = 4 * zoom * sm;
      ctx.strokeStyle = "#7a7a85";
      ctx.lineWidth = 2.8 * zoom * sm;
      ctx.beginPath();
      ctx.moveTo(hL.x, hL.y);
      ctx.lineTo(hL.x, hL.y - hUp);
      ctx.lineTo(hR.x, hR.y - hUp);
      ctx.lineTo(hR.x, hR.y);
      ctx.stroke();

      // Latch on top
      const latchC = { x: (hL.x + hR.x) * 0.5, y: (hL.y + hR.y) * 0.5 };
      ctx.fillStyle = "#8a8a95";
      ctx.beginPath();
      ctx.arc(latchC.x, latchC.y, 1.8 * zoom * sm, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    const p0 = c[face.corners[0]];
    const p1 = c[face.corners[1]];
    const p2 = c[face.corners[2]];
    const p3 = c[face.corners[3]];

    // Interpolation helper for face
    const facePoint = (u: number, v: number) => ({
      x:
        p0.x * (1 - u) * (1 - v) +
        p1.x * u * (1 - v) +
        p2.x * u * v +
        p3.x * (1 - u) * v,
      y:
        p0.y * (1 - u) * (1 - v) +
        p1.y * u * (1 - v) +
        p2.y * u * v +
        p3.y * (1 - u) * v,
    });

    // Warning stripes (3 alternating yellow/black)
    const stripeAlpha = 0.55 + face.lit * 0.3;
    for (let s = 0; s < 3; s++) {
      const t0 = 0.22 + s * 0.12;
      const t1 = t0 + 0.06;
      ctx.fillStyle =
        s % 2 === 0
          ? `rgba(200, 170, 40, ${stripeAlpha})`
          : `rgba(30, 28, 25, ${stripeAlpha})`;
      ctx.beginPath();
      const a = facePoint(0, t0),
        b = facePoint(1, t0);
      const d = facePoint(0, t1),
        e = facePoint(1, t1);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(e.x, e.y);
      ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.fill();
    }

    // Metal reinforcement band
    ctx.strokeStyle = `rgba(100, 100, 110, ${0.4 + face.lit * 0.3})`;
    ctx.lineWidth = 1.8 * zoom * sm;
    const band0 = facePoint(0, 0.65),
      band1 = facePoint(1, 0.65);
    ctx.beginPath();
    ctx.moveTo(band0.x, band0.y);
    ctx.lineTo(band1.x, band1.y);
    ctx.stroke();

    // Rivets - 6 per face (corners + midpoints)
    ctx.fillStyle = "#8a8a95";
    const rivetPositions = [
      [0.1, 0.08],
      [0.9, 0.08],
      [0.1, 0.5],
      [0.9, 0.5],
      [0.1, 0.92],
      [0.9, 0.92],
    ];
    for (const [u, v] of rivetPositions) {
      const rp = facePoint(u, v);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 1.3 * zoom * sm, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stencil label area on the last drawn side face
    if (face === faces[faces.length - 2]) {
      ctx.fillStyle = `rgba(15, 18, 12, 0.55)`;
      const la = facePoint(0.15, 0.7),
        lb = facePoint(0.85, 0.7);
      const ld = facePoint(0.15, 0.88),
        le = facePoint(0.85, 0.88);
      ctx.beginPath();
      ctx.moveTo(la.x, la.y);
      ctx.lineTo(lb.x, lb.y);
      ctx.lineTo(le.x, le.y);
      ctx.lineTo(ld.x, ld.y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Glowing status LED on the most visible side face
  const lastSide = faces.filter((f) => !f.isTop);
  if (lastSide.length > 0) {
    const ledFace = lastSide[lastSide.length - 1];
    const lp0 = c[ledFace.corners[0]],
      lp1 = c[ledFace.corners[1]];
    const lp2 = c[ledFace.corners[2]],
      lp3 = c[ledFace.corners[3]];
    const ledX = lp0.x * 0.25 + lp1.x * 0.75;
    const ledY = (lp2.y + lp3.y) * 0.5 * 0.3 + (lp0.y + lp1.y) * 0.5 * 0.7;

    const glow = 0.5 + attackPulse * 0.4 + Math.sin(time * 5) * 0.1;
    // Glow halo
    ctx.fillStyle = `rgba(50, 220, 50, ${glow * 0.3})`;
    ctx.beginPath();
    ctx.arc(ledX, ledY, 4 * zoom * sm, 0, Math.PI * 2);
    ctx.fill();
    // LED
    ctx.fillStyle = `rgba(50, 230, 50, ${glow})`;
    ctx.beginPath();
    ctx.arc(ledX, ledY, 2 * zoom * sm, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = `rgba(180, 255, 180, ${glow * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      ledX - 0.5 * zoom * sm,
      ledY - 0.5 * zoom * sm,
      0.8 * zoom * sm,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Red hazard indicator on opposite side if visible
    if (lastSide.length > 1) {
      const hFace = lastSide[lastSide.length - 2];
      const hp0 = c[hFace.corners[0]],
        hp1 = c[hFace.corners[1]];
      const hp3 = c[hFace.corners[3]];
      const hX = hp0.x * 0.7 + hp1.x * 0.3;
      const hY = hp3.y * 0.35 + hp0.y * 0.65;
      const hGlow = 0.5 + attackPulse * 0.5 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(220, 50, 30, ${hGlow * 0.25})`;
      ctx.beginPath();
      ctx.arc(hX, hY, 3.5 * zoom * sm, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(220, 50, 30, ${hGlow})`;
      ctx.beginPath();
      ctx.arc(hX, hY, 1.8 * zoom * sm, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Draw 3D isometric armor shield with ID number (kite shield shape)
function draw3DArmorShield(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  towerId: number | string,
  size: "small" | "medium" | "large" = "medium",
) {
  const sm = size === "small" ? 0.8 : size === "large" ? 1.3 : 1.1;

  const shW = 8 * zoom * sm;
  const shH = 12 * zoom * sm;
  const shD = 3.5 * zoom * sm;

  const sCos = Math.cos(rotation);
  const lightness = 0.4 + sCos * 0.3;

  // Shield shape: wider at top, pointed at bottom (kite shield)
  // Left face (isometric parallelogram with pointed bottom)
  const leftBase = Math.floor(55 + lightness * 30);
  ctx.fillStyle = `rgb(${leftBase + 8}, ${leftBase + 5}, ${leftBase})`;
  ctx.beginPath();
  ctx.moveTo(centerX - shW, centerY - shH * 0.4);
  ctx.lineTo(centerX, centerY + shD - shH * 0.4);
  ctx.lineTo(centerX, centerY + shD + shH * 0.1);
  ctx.lineTo(centerX - shW * 0.35, centerY + shH * 0.6);
  ctx.lineTo(centerX - shW, centerY + shH * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgb(${leftBase + 20}, ${leftBase + 16}, ${leftBase + 10})`;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Right face
  const rightBase = Math.floor(45 + lightness * 22);
  ctx.fillStyle = `rgb(${rightBase + 5}, ${rightBase + 3}, ${rightBase})`;
  ctx.beginPath();
  ctx.moveTo(centerX + shW, centerY - shH * 0.4);
  ctx.lineTo(centerX, centerY + shD - shH * 0.4);
  ctx.lineTo(centerX, centerY + shD + shH * 0.1);
  ctx.lineTo(centerX + shW * 0.35, centerY + shH * 0.6);
  ctx.lineTo(centerX + shW, centerY + shH * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgb(${rightBase + 15}, ${rightBase + 12}, ${rightBase + 8})`;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Top face (diamond)
  const topBase = Math.floor(65 + lightness * 35);
  ctx.fillStyle = `rgb(${topBase + 12}, ${topBase + 10}, ${topBase + 5})`;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - shH * 0.4 - shD);
  ctx.lineTo(centerX - shW, centerY - shH * 0.4);
  ctx.lineTo(centerX, centerY + shD - shH * 0.4);
  ctx.lineTo(centerX + shW, centerY - shH * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgb(${topBase + 20}, ${topBase + 16}, ${topBase + 10})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Center boss (raised circle in center of shield)
  const bossCX = centerX;
  const bossCY = centerY + shD * 0.15;
  ctx.fillStyle = `rgb(${Math.floor(35 + lightness * 15)}, ${Math.floor(35 + lightness * 12)}, ${Math.floor(30 + lightness * 10)})`;
  ctx.beginPath();
  ctx.ellipse(
    bossCX,
    bossCY,
    5 * zoom * sm,
    3.5 * zoom * sm,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = `rgb(${Math.floor(70 + lightness * 25)}, ${Math.floor(70 + lightness * 20)}, ${Math.floor(65 + lightness * 15)})`;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Generate shield number from towerId
  let hashValue: number;
  if (typeof towerId === "number" && !isNaN(towerId) && towerId !== 0) {
    hashValue = towerId;
  } else {
    hashValue = Math.abs(
      String(towerId)
        .split("")
        .reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0),
    );
  }
  const shieldNumber = ((hashValue * 7 + 13) % 90) + 10;
  ctx.font = `bold ${5.5 * zoom * sm}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(220, 200, 150, ${0.7 + lightness * 0.3})`;
  ctx.fillText(String(shieldNumber), bossCX, bossCY + 0.5 * zoom);

  // Rivets around shield perimeter
  ctx.fillStyle = "#7a7a88";
  const rivetPts = [
    { x: centerX - shW * 0.7, y: centerY - shH * 0.3 + shD * 0.15 },
    { x: centerX + shW * 0.7, y: centerY - shH * 0.3 + shD * 0.15 },
    { x: centerX - shW * 0.5, y: centerY + shH * 0.2 + shD * 0.15 },
    { x: centerX + shW * 0.5, y: centerY + shH * 0.2 + shD * 0.15 },
    { x: centerX, y: centerY - shH * 0.3 },
    { x: centerX, y: centerY + shH * 0.45 + shD * 0.1 },
  ];
  for (const pt of rivetPts) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.2 * zoom * sm, 0, Math.PI * 2);
    ctx.fill();
  }

  // Battle damage scratches
  ctx.strokeStyle = `rgba(25, 25, 30, ${0.35 + lightness * 0.2})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(centerX + shW * 0.2, centerY - shH * 0.15);
  ctx.lineTo(centerX + shW * 0.45, centerY + shH * 0.05);
  ctx.stroke();
}

// Draw 3D isometric fuel barrel that rotates with flamethrower turret
function draw3DFuelTank(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  size: "small" | "medium" | "large" = "medium",
) {
  // Size multipliers
  const sizeMultiplier = size === "small" ? 0.75 : size === "large" ? 1.2 : 1.0;

  // Barrel dimensions (cylindrical shape)
  const barrelRadius = 8 * zoom * sizeMultiplier;
  const barrelHeight = 22 * zoom * sizeMultiplier;
  const ellipseRatio = 0.4; // Isometric squish for top/bottom ellipses

  // Calculate shading based on rotation
  const tankCos = Math.cos(rotation);
  const lightness = 0.5 + tankCos * 0.25;

  // === BARREL BODY (cylinder) ===
  // Main red barrel gradient - cylindrical shading
  const barrelGrad = ctx.createLinearGradient(
    centerX - barrelRadius,
    centerY,
    centerX + barrelRadius,
    centerY,
  );
  barrelGrad.addColorStop(
    0,
    `rgb(${Math.floor(120 * lightness)}, ${Math.floor(25 * lightness)}, ${Math.floor(20 * lightness)})`,
  );
  barrelGrad.addColorStop(
    0.2,
    `rgb(${Math.floor(180 * lightness)}, ${Math.floor(35 * lightness)}, ${Math.floor(25 * lightness)})`,
  );
  barrelGrad.addColorStop(
    0.5,
    `rgb(${Math.floor(200 * lightness)}, ${Math.floor(45 * lightness)}, ${Math.floor(30 * lightness)})`,
  );
  barrelGrad.addColorStop(
    0.7,
    `rgb(${Math.floor(170 * lightness)}, ${Math.floor(35 * lightness)}, ${Math.floor(25 * lightness)})`,
  );
  barrelGrad.addColorStop(
    1,
    `rgb(${Math.floor(100 * lightness)}, ${Math.floor(20 * lightness)}, ${Math.floor(15 * lightness)})`,
  );

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(
    centerX - barrelRadius,
    centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio,
  );
  ctx.lineTo(
    centerX - barrelRadius,
    centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio,
  );
  ctx.quadraticCurveTo(
    centerX - barrelRadius,
    centerY + barrelHeight * 0.5,
    centerX,
    centerY + barrelHeight * 0.5 + barrelRadius * ellipseRatio,
  );
  ctx.quadraticCurveTo(
    centerX + barrelRadius,
    centerY + barrelHeight * 0.5,
    centerX + barrelRadius,
    centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio,
  );
  ctx.lineTo(
    centerX + barrelRadius,
    centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio,
  );
  ctx.closePath();
  ctx.fill();

  // === HAZARD STRIPES (yellow/black diagonal) ===
  // Draw hazard band in the middle
  const bandY = centerY;
  const bandHeight = 8 * zoom * sizeMultiplier;

  // Black background for hazard band
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.rect(
    centerX - barrelRadius,
    bandY - bandHeight * 0.5,
    barrelRadius * 2,
    bandHeight,
  );
  ctx.fill();

  // Yellow diagonal stripes
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    centerX - barrelRadius,
    bandY - bandHeight * 0.5,
    barrelRadius * 2,
    bandHeight,
  );
  ctx.clip();

  ctx.fillStyle = "#ffcc00";
  const stripeWidth = 4 * zoom * sizeMultiplier;
  const stripeSpacing = 6 * zoom * sizeMultiplier;
  for (let i = -6; i < 8; i++) {
    const x = centerX - barrelRadius + i * stripeSpacing;
    ctx.beginPath();
    ctx.moveTo(x, bandY - bandHeight * 0.5);
    ctx.lineTo(x + stripeWidth, bandY - bandHeight * 0.5);
    ctx.lineTo(x + stripeWidth + bandHeight, bandY + bandHeight * 0.5);
    ctx.lineTo(x + bandHeight, bandY + bandHeight * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === METAL BANDS (top and bottom rings) ===
  const ringColor = `rgb(${Math.floor(90 * lightness)}, ${Math.floor(90 * lightness)}, ${Math.floor(95 * lightness)})`;
  const ringHighlight = `rgb(${Math.floor(140 * lightness)}, ${Math.floor(140 * lightness)}, ${Math.floor(145 * lightness)})`;

  // Top ring
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(
    centerX - barrelRadius,
    centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 2 * zoom,
  );
  ctx.lineTo(
    centerX + barrelRadius,
    centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 2 * zoom,
  );
  ctx.stroke();

  // Top ring highlight
  ctx.strokeStyle = ringHighlight;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    centerX - barrelRadius * 0.8,
    centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 1 * zoom,
  );
  ctx.lineTo(
    centerX + barrelRadius * 0.3,
    centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 1 * zoom,
  );
  ctx.stroke();

  // Bottom ring
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(
    centerX - barrelRadius,
    centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio - 2 * zoom,
  );
  ctx.lineTo(
    centerX + barrelRadius,
    centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio - 2 * zoom,
  );
  ctx.stroke();

  // === BARREL TOP (ellipse lid) ===
  // Top ellipse shadow
  ctx.fillStyle = `rgb(${Math.floor(80 * lightness)}, ${Math.floor(20 * lightness)}, ${Math.floor(15 * lightness)})`;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY - barrelHeight * 0.5,
    barrelRadius,
    barrelRadius * ellipseRatio,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Top ellipse main
  const topGrad = ctx.createRadialGradient(
    centerX - barrelRadius * 0.3,
    centerY - barrelHeight * 0.5 - barrelRadius * ellipseRatio * 0.3,
    0,
    centerX,
    centerY - barrelHeight * 0.5,
    barrelRadius,
  );
  topGrad.addColorStop(
    0,
    `rgb(${Math.floor(220 * lightness)}, ${Math.floor(55 * lightness)}, ${Math.floor(40 * lightness)})`,
  );
  topGrad.addColorStop(
    0.5,
    `rgb(${Math.floor(180 * lightness)}, ${Math.floor(40 * lightness)}, ${Math.floor(30 * lightness)})`,
  );
  topGrad.addColorStop(
    1,
    `rgb(${Math.floor(140 * lightness)}, ${Math.floor(30 * lightness)}, ${Math.floor(22 * lightness)})`,
  );
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY - barrelHeight * 0.5,
    barrelRadius * 0.95,
    barrelRadius * ellipseRatio * 0.95,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Top rim
  ctx.strokeStyle = `rgb(${Math.floor(100 * lightness)}, ${Math.floor(100 * lightness)}, ${Math.floor(105 * lightness)})`;
  ctx.lineWidth = 2 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY - barrelHeight * 0.5,
    barrelRadius,
    barrelRadius * ellipseRatio,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // === BARREL CAP/BUNG ===
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY - barrelHeight * 0.5,
    3 * zoom * sizeMultiplier,
    1.5 * zoom * sizeMultiplier,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY - barrelHeight * 0.5,
    1.5 * zoom * sizeMultiplier,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === FLAMMABLE SYMBOL ===
  // Small flame icon on front
  const flameX = centerX;
  const flameY = centerY - barrelHeight * 0.25;
  const flameGlow = 0.6 + attackPulse * 0.3 + Math.sin(time * 4) * 0.1;

  ctx.fillStyle = `rgba(255, 200, 50, ${flameGlow})`;
  ctx.beginPath();
  ctx.moveTo(flameX, flameY - 4 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(
    flameX + 3 * zoom * sizeMultiplier,
    flameY - 2 * zoom * sizeMultiplier,
    flameX + 2 * zoom * sizeMultiplier,
    flameY + 2 * zoom * sizeMultiplier,
  );
  ctx.quadraticCurveTo(
    flameX + 1 * zoom * sizeMultiplier,
    flameY + 1 * zoom * sizeMultiplier,
    flameX,
    flameY + 3 * zoom * sizeMultiplier,
  );
  ctx.quadraticCurveTo(
    flameX - 1 * zoom * sizeMultiplier,
    flameY + 1 * zoom * sizeMultiplier,
    flameX - 2 * zoom * sizeMultiplier,
    flameY + 2 * zoom * sizeMultiplier,
  );
  ctx.quadraticCurveTo(
    flameX - 3 * zoom * sizeMultiplier,
    flameY - 2 * zoom * sizeMultiplier,
    flameX,
    flameY - 4 * zoom * sizeMultiplier,
  );
  ctx.fill();

  // Inner flame
  ctx.fillStyle = `rgba(255, 100, 30, ${flameGlow})`;
  ctx.beginPath();
  ctx.moveTo(flameX, flameY - 2 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(
    flameX + 1.5 * zoom * sizeMultiplier,
    flameY,
    flameX + 1 * zoom * sizeMultiplier,
    flameY + 1.5 * zoom * sizeMultiplier,
  );
  ctx.quadraticCurveTo(
    flameX,
    flameY + 1 * zoom * sizeMultiplier,
    flameX - 1 * zoom * sizeMultiplier,
    flameY + 1.5 * zoom * sizeMultiplier,
  );
  ctx.quadraticCurveTo(
    flameX - 1.5 * zoom * sizeMultiplier,
    flameY,
    flameX,
    flameY - 2 * zoom * sizeMultiplier,
  );
  ctx.fill();
}

// Draw fuel feeding tube connecting tank to flamethrower turret
function drawFuelFeedingTube(
  ctx: CanvasRenderingContext2D,
  tankCenterX: number,
  tankCenterY: number,
  turretX: number,
  turretY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  tankSide: number,
) {
  // Tube shake animation when firing - more intense vibration
  const shakeIntensity = isAttacking ? attackPulse : 0;
  const tubeShakeX = shakeIntensity * Math.sin(time * 80) * 2 * zoom;
  const tubeShakeY = shakeIntensity * Math.cos(time * 60) * 1.5 * zoom;

  // Tube exit point from fuel tank - with connector offset
  const tubeExitX = tankCenterX + (tankSide > 0 ? -6 : 6) * zoom;
  const tubeExitY = tankCenterY - 4 * zoom;

  // Tube entry point to turret feed mechanism
  const tubeEntryX = turretX - 4 * zoom + tubeShakeX;
  const tubeEntryY = turretY - 4 * zoom + tubeShakeY;

  // Multiple control points for a more natural curve
  const tubeMid1X = tubeExitX + (tankSide > 0 ? -8 : 8) * zoom;
  const tubeMid1Y = tubeExitY - 6 * zoom;
  const tubeMid2X =
    (tubeExitX + tubeEntryX) * 0.5 + Math.cos(rotation) * 12 * zoom;
  const tubeMid2Y =
    (tubeExitY + tubeEntryY) * 0.5 - 10 * zoom + Math.sin(rotation) * 6 * zoom;

  // Helper function to get point on bezier curve
  const getBezierPoint = (t: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return {
      x:
        mt3 * tubeExitX +
        3 * mt2 * t * tubeMid1X +
        3 * mt * t2 * tubeMid2X +
        t3 * tubeEntryX,
      y:
        mt3 * tubeExitY +
        3 * mt2 * t * tubeMid1Y +
        3 * mt * t2 * tubeMid2Y +
        t3 * tubeEntryY,
    };
  };

  // Helper to get tangent at point
  const getBezierTangent = (t: number) => {
    const mt = 1 - t;
    const dx =
      3 * mt * mt * (tubeMid1X - tubeExitX) +
      6 * mt * t * (tubeMid2X - tubeMid1X) +
      3 * t * t * (tubeEntryX - tubeMid2X);
    const dy =
      3 * mt * mt * (tubeMid1Y - tubeExitY) +
      6 * mt * t * (tubeMid2Y - tubeMid1Y) +
      3 * t * t * (tubeEntryY - tubeMid2Y);
    return Math.atan2(dy, dx);
  };

  // === OUTER REINFORCED HOSE CASING ===
  // Shadow/depth layer
  ctx.strokeStyle = "#1a1a22";
  ctx.lineWidth = 9 * zoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY + 1 * zoom);
  ctx.bezierCurveTo(
    tubeMid1X,
    tubeMid1Y + 1 * zoom,
    tubeMid2X,
    tubeMid2Y + 1 * zoom,
    tubeEntryX,
    tubeEntryY + 1 * zoom,
  );
  ctx.stroke();

  // Main hose body - dark rubber with metallic sheen
  const hoseGrad = ctx.createLinearGradient(
    tubeExitX,
    tubeExitY - 4 * zoom,
    tubeEntryX,
    tubeEntryY + 4 * zoom,
  );
  hoseGrad.addColorStop(0, "#3a3a42");
  hoseGrad.addColorStop(0.3, "#4a4a52");
  hoseGrad.addColorStop(0.5, "#5a5a62");
  hoseGrad.addColorStop(0.7, "#4a4a52");
  hoseGrad.addColorStop(1, "#3a3a42");
  ctx.strokeStyle = hoseGrad;
  ctx.lineWidth = 7 * zoom;
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY);
  ctx.bezierCurveTo(
    tubeMid1X,
    tubeMid1Y,
    tubeMid2X,
    tubeMid2Y,
    tubeEntryX,
    tubeEntryY,
  );
  ctx.stroke();

  // Inner darker core (fuel channel)
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 4.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY);
  ctx.bezierCurveTo(
    tubeMid1X,
    tubeMid1Y,
    tubeMid2X,
    tubeMid2Y,
    tubeEntryX,
    tubeEntryY,
  );
  ctx.stroke();

  // Highlight strip on top of hose
  ctx.strokeStyle = "rgba(120, 120, 130, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY - 2.5 * zoom);
  ctx.bezierCurveTo(
    tubeMid1X,
    tubeMid1Y - 2.5 * zoom,
    tubeMid2X,
    tubeMid2Y - 2.5 * zoom,
    tubeEntryX,
    tubeEntryY - 2.5 * zoom,
  );
  ctx.stroke();

  // === BRAIDED REINFORCEMENT PATTERN ===
  const braidSegments = 12;
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < braidSegments; i++) {
    const t1 = i / braidSegments;
    const t2 = (i + 0.5) / braidSegments;
    const p1 = getBezierPoint(t1);
    const p2 = getBezierPoint(t2);
    const angle1 = getBezierTangent(t1);
    const angle2 = getBezierTangent(t2);

    // Cross pattern
    const offset = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      p1.x + Math.cos(angle1 + Math.PI / 2) * offset,
      p1.y + Math.sin(angle1 + Math.PI / 2) * offset * 0.5,
    );
    ctx.lineTo(
      p2.x + Math.cos(angle2 - Math.PI / 2) * offset,
      p2.y + Math.sin(angle2 - Math.PI / 2) * offset * 0.5,
    );
    ctx.stroke();
  }

  // === FUEL FLOW ANIMATION ===
  // Animated fuel particles flowing through the tube
  const fuelParticleCount = 8;
  const baseGlow = 0.3 + Math.sin(time * 4) * 0.1;
  const flowGlow = isAttacking ? 0.8 + attackPulse * 0.2 : baseGlow;

  for (let i = 0; i < fuelParticleCount; i++) {
    // Particles flow faster when attacking
    const flowSpeed = isAttacking ? time * 3 + attackPulse * 2 : time * 0.8;
    const particleT = (i / fuelParticleCount + flowSpeed) % 1;
    const particle = getBezierPoint(particleT);

    // Fuel particle glow
    const particleSize = (1.5 + Math.sin(time * 10 + i) * 0.5) * zoom;
    const particleAlpha = flowGlow * (0.6 + Math.sin(time * 8 + i * 0.7) * 0.2);

    // Outer glow
    const glowGrad = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particleSize * 2,
    );
    glowGrad.addColorStop(0, `rgba(255, 150, 50, ${particleAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${particleAlpha * 0.5})`);
    glowGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particleSize * 2, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `rgba(255, 200, 100, ${particleAlpha * 1.2})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particleSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // === HEAVY-DUTY METAL CLAMPS ===
  const clampCount = 5;
  for (let i = 0; i < clampCount; i++) {
    const t = (i + 0.5) / clampCount;
    const clampPos = getBezierPoint(t);
    const clampAngle = getBezierTangent(t);

    // Clamp perpendicular offset
    const perpX = Math.cos(clampAngle + Math.PI / 2);
    const perpY = Math.sin(clampAngle + Math.PI / 2);

    // Clamp band shadow
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(
      clampPos.x,
      clampPos.y + 1 * zoom,
      4.5 * zoom,
      2.5 * zoom,
      clampAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Clamp band - metallic
    const clampGrad = ctx.createLinearGradient(
      clampPos.x - perpX * 4 * zoom,
      clampPos.y - perpY * 4 * zoom,
      clampPos.x + perpX * 4 * zoom,
      clampPos.y + perpY * 4 * zoom,
    );
    clampGrad.addColorStop(0, "#5a5a62");
    clampGrad.addColorStop(0.3, "#8a8a92");
    clampGrad.addColorStop(0.5, "#9a9aa2");
    clampGrad.addColorStop(0.7, "#8a8a92");
    clampGrad.addColorStop(1, "#5a5a62");
    ctx.fillStyle = clampGrad;
    ctx.beginPath();
    ctx.ellipse(
      clampPos.x,
      clampPos.y,
      4 * zoom,
      2 * zoom,
      clampAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Clamp bolt
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(
      clampPos.x + perpX * 2.5 * zoom,
      clampPos.y + perpY * 2.5 * zoom * 0.5,
      1.2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(
      clampPos.x + perpX * 2.5 * zoom - 0.3 * zoom,
      clampPos.y + perpY * 2.5 * zoom * 0.5 - 0.3 * zoom,
      0.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === TANK-SIDE CONNECTOR (heavy duty fitting) ===
  // Connector base shadow
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(tubeExitX, tubeExitY + 1.5 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Connector housing
  const connectorGrad1 = ctx.createRadialGradient(
    tubeExitX - 2 * zoom,
    tubeExitY - 2 * zoom,
    0,
    tubeExitX,
    tubeExitY,
    6 * zoom,
  );
  connectorGrad1.addColorStop(0, "#7a7a82");
  connectorGrad1.addColorStop(0.5, "#5a5a62");
  connectorGrad1.addColorStop(1, "#3a3a42");
  ctx.fillStyle = connectorGrad1;
  ctx.beginPath();
  ctx.arc(tubeExitX, tubeExitY, 5.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Connector ring
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(tubeExitX, tubeExitY, 4 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Hex bolt pattern
  for (let i = 0; i < 6; i++) {
    const boltAngle = (i / 6) * Math.PI * 2 + rotation * 0.5;
    const boltX = tubeExitX + Math.cos(boltAngle) * 3.5 * zoom;
    const boltY = tubeExitY + Math.sin(boltAngle) * 3.5 * zoom * 0.6;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(boltX, boltY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Quick-release lever
  const leverAngle = Math.PI * 0.3;
  ctx.strokeStyle = "#cc3030";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY);
  ctx.lineTo(
    tubeExitX + Math.cos(leverAngle) * 8 * zoom,
    tubeExitY + Math.sin(leverAngle) * 4 * zoom,
  );
  ctx.stroke();
  ctx.fillStyle = "#aa2020";
  ctx.beginPath();
  ctx.arc(
    tubeExitX + Math.cos(leverAngle) * 8 * zoom,
    tubeExitY + Math.sin(leverAngle) * 4 * zoom,
    2 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === TURRET-SIDE CONNECTOR (feed mechanism) ===
  // Connector shadow
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY + 1 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Feed mechanism housing
  const connectorGrad2 = ctx.createRadialGradient(
    tubeEntryX - 1.5 * zoom,
    tubeEntryY - 1.5 * zoom,
    0,
    tubeEntryX,
    tubeEntryY,
    5 * zoom,
  );
  connectorGrad2.addColorStop(0, "#6a6a72");
  connectorGrad2.addColorStop(0.5, "#4a4a52");
  connectorGrad2.addColorStop(1, "#3a3a42");
  ctx.fillStyle = connectorGrad2;
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner fuel inlet (glows when active)
  const inletGlow = isAttacking
    ? 0.8 + attackPulse * 0.2
    : 0.3 + Math.sin(time * 3) * 0.1;
  ctx.fillStyle = `rgba(40, 30, 25, 1)`;
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Fuel glow in inlet
  const inletGlowGrad = ctx.createRadialGradient(
    tubeEntryX,
    tubeEntryY,
    0,
    tubeEntryX,
    tubeEntryY,
    2.5 * zoom,
  );
  inletGlowGrad.addColorStop(0, `rgba(255, 150, 50, ${inletGlow})`);
  inletGlowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${inletGlow * 0.6})`);
  inletGlowGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
  ctx.fillStyle = inletGlowGrad;
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pressure valve (red safety valve)
  const valveX = tubeEntryX + 3 * zoom;
  const valveY = tubeEntryY - 3 * zoom;
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(valveX, valveY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const valveGrad = ctx.createRadialGradient(
    valveX - 0.5 * zoom,
    valveY - 0.5 * zoom,
    0,
    valveX,
    valveY,
    2 * zoom,
  );
  valveGrad.addColorStop(0, "#ee4040");
  valveGrad.addColorStop(0.5, "#cc2020");
  valveGrad.addColorStop(1, "#881010");
  ctx.fillStyle = valveGrad;
  ctx.beginPath();
  ctx.arc(valveX, valveY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Valve highlight
  ctx.fillStyle = "rgba(255, 150, 150, 0.4)";
  ctx.beginPath();
  ctx.arc(valveX - 0.5 * zoom, valveY - 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Warning indicator light (blinks faster when attacking)
  const blinkSpeed = isAttacking ? 12 : 3;
  const indicatorGlow = 0.5 + Math.sin(time * blinkSpeed) * 0.5;
  ctx.fillStyle = `rgba(255, 200, 0, ${indicatorGlow * (isAttacking ? 1 : 0.5)})`;
  setShadowBlur(ctx, isAttacking ? 6 * zoom : 2 * zoom, "#ffcc00");
  ctx.beginPath();
  ctx.arc(
    tubeEntryX - 3 * zoom,
    tubeEntryY - 2 * zoom,
    1.2 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
}

// Draw ammo belt connecting box to turret
function drawCannonAmmoBelt(
  ctx: CanvasRenderingContext2D,
  boxCenterX: number,
  boxCenterY: number,
  turretX: number,
  turretY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  boxSide: number,
  recoilOffset: number = 0,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const backX = -cosR;
  const backY = -sinR * 0.5;

  // Recoil jerk — feed point tracks breech motion
  const recoilJerkX = -cosR * recoilOffset * 0.6;
  const recoilJerkY = -sinR * recoilOffset * 0.3;

  const beltShakeX = isAttacking
    ? Math.sin(time * 80) * 1.5 * zoom * attackPulse
    : 0;
  const beltShakeY = isAttacking
    ? Math.cos(time * 60) * 1 * zoom * attackPulse
    : 0;

  // Belt exits ammo box top
  const beltExitX = boxCenterX + (boxSide > 0 ? -5 : 5) * zoom;
  const beltExitY = boxCenterY - 8 * zoom;

  // Entry: top of breech (behind turret center, raised up) — jerks with recoil
  const breechBackDist = 4 * zoom;
  const breechTopUp = 10 * zoom;
  const beltEntryX =
    turretX + backX * breechBackDist + beltShakeX + recoilJerkX;
  const beltEntryY =
    turretY + backY * breechBackDist - breechTopUp + beltShakeY + recoilJerkY;

  // Arc upward: control point above the midpoint for a high curve
  const midX = (beltExitX + beltEntryX) * 0.5;
  const midY = Math.min(beltExitY, beltEntryY) - 12 * zoom;
  const beltMidX = midX;
  const beltMidY = midY;

  // Isometric basis for the feed wheel
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  // Feed roller wheel — sits at belt entry, rolls bullets into the gun
  const wheelR = 5 * zoom;
  const wheelThick = 3 * zoom;
  const wheelCx = beltEntryX;
  const wheelCy = beltEntryY + 1 * zoom;
  const spinAngle = isAttacking ? time * 12 : time * 3;

  // Wheel axle direction is perpendicular to the barrel
  // Wheel rim: isometric cylinder side faces
  const wheelSegs = 12;
  const facingFwd = sinR > -0.2;
  for (let i = 0; i < wheelSegs; i++) {
    const a0 = (i / wheelSegs) * Math.PI * 2;
    const a1 = ((i + 1) / wheelSegs) * Math.PI * 2;
    const normal = Math.cos(a0) * cosR + 0.5 * Math.sin(a0);
    if (normal < -0.15) continue;

    const ox0 = perpX * Math.cos(a0) * wheelR;
    const oy0 = perpY * Math.cos(a0) * wheelR - Math.sin(a0) * wheelR;
    const ox1 = perpX * Math.cos(a1) * wheelR;
    const oy1 = perpY * Math.cos(a1) * wheelR - Math.sin(a1) * wheelR;

    const lit = 0.35 + Math.max(0, normal) * 0.45;
    const c = Math.floor(65 + lit * 50);
    ctx.fillStyle = `rgb(${c}, ${c}, ${c + 5})`;
    ctx.beginPath();
    ctx.moveTo(
      wheelCx + ox0 - backX * wheelThick,
      wheelCy + oy0 - backY * wheelThick,
    );
    ctx.lineTo(
      wheelCx + ox1 - backX * wheelThick,
      wheelCy + oy1 - backY * wheelThick,
    );
    ctx.lineTo(
      wheelCx + ox1 + backX * wheelThick,
      wheelCy + oy1 + backY * wheelThick,
    );
    ctx.lineTo(
      wheelCx + ox0 + backX * wheelThick,
      wheelCy + oy0 + backY * wheelThick,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Wheel front/back disc faces
  const discOff = facingFwd ? 1 : -1;
  const discCx = wheelCx + backX * wheelThick * discOff;
  const discCy = wheelCy + backY * wheelThick * discOff;
  const discRx = wheelR * (Math.abs(sinR) * 0.6 + 0.5);
  const discRy = wheelR * (Math.abs(cosR) * 0.3 + 0.3);

  // Disc fill
  const discLit = facingFwd ? 0.55 : 0.4;
  const dc = Math.floor(65 + discLit * 55);
  ctx.fillStyle = `rgb(${dc}, ${dc}, ${dc + 6})`;
  ctx.beginPath();
  ctx.ellipse(discCx, discCy, discRx, discRy, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgb(${dc + 20}, ${dc + 20}, ${dc + 24})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Spinning spokes
  ctx.strokeStyle = `rgba(50, 50, 58, 0.7)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 8; i++) {
    const sa = spinAngle + (i / 8) * Math.PI * 2;
    const sx = Math.cos(sa) * discRx * 0.85;
    const sy = Math.sin(sa) * discRy * 0.85;
    ctx.beginPath();
    ctx.moveTo(discCx, discCy);
    ctx.lineTo(discCx + sx, discCy + sy);
    ctx.stroke();
  }

  // Center axle hub
  ctx.fillStyle = "#4a4a55";
  ctx.beginPath();
  ctx.arc(discCx, discCy, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a5a68";
  ctx.beginPath();
  ctx.arc(discCx, discCy, 1 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Notched teeth on wheel rim (visible nubs that grab bullets)
  const toothCount = 10;
  for (let i = 0; i < toothCount; i++) {
    const ta = spinAngle + (i / toothCount) * Math.PI * 2;
    const tLat = Math.cos(ta) * (wheelR + 1.5 * zoom);
    const tVert = Math.sin(ta) * (wheelR + 1.5 * zoom);
    const tx = wheelCx + perpX * tLat;
    const ty = wheelCy + perpY * tLat - tVert;
    const tNormal = Math.cos(ta + rotation);
    if (tNormal < 0) continue;
    ctx.fillStyle = `rgba(90, 90, 100, ${0.4 + tNormal * 0.5})`;
    ctx.beginPath();
    ctx.arc(tx, ty, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Feed guide bracket — small angled plates framing the wheel
  ctx.strokeStyle = "#5a5a65";
  ctx.lineWidth = 1.2 * zoom;
  const bracketUp = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    wheelCx + perpX * (wheelR + 2 * zoom),
    wheelCy + perpY * (wheelR + 2 * zoom),
  );
  ctx.lineTo(
    wheelCx + perpX * (wheelR + 2 * zoom),
    wheelCy + perpY * (wheelR + 2 * zoom) - bracketUp,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(
    wheelCx - perpX * (wheelR + 2 * zoom),
    wheelCy - perpY * (wheelR + 2 * zoom),
  );
  ctx.lineTo(
    wheelCx - perpX * (wheelR + 2 * zoom),
    wheelCy - perpY * (wheelR + 2 * zoom) - bracketUp,
  );
  ctx.stroke();

  // Belt channel
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 6 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();

  // Inner track
  ctx.strokeStyle = "#3a3a44";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();

  const beltBulletCount = 12;
  const speed = isAttacking ? time * 6 : time * 1.5;
  for (let i = 0; i < beltBulletCount; i++) {
    const beltProgress = (i / beltBulletCount + speed) % 1;
    const t = beltProgress;
    const oneMinusT = 1 - t;

    const bulletX =
      oneMinusT * oneMinusT * beltExitX +
      2 * oneMinusT * t * beltMidX +
      t * t * beltEntryX;
    const bulletY =
      oneMinusT * oneMinusT * beltExitY +
      2 * oneMinusT * t * beltMidY +
      t * t * beltEntryY;

    const tangentX =
      2 * oneMinusT * (beltMidX - beltExitX) + 2 * t * (beltEntryX - beltMidX);
    const tangentY =
      2 * oneMinusT * (beltMidY - beltExitY) + 2 * t * (beltEntryY - beltMidY);
    const bulletAngle = Math.atan2(tangentY, tangentX);

    const shakeIntensity = isAttacking ? attackPulse * 0.3 : 0;
    const bulletShakeX =
      Math.sin(time * 70 + i * 1.3) * 1 * zoom * shakeIntensity;
    const bulletShakeY =
      Math.cos(time * 55 + i * 1.7) * 0.7 * zoom * shakeIntensity;

    const fx = bulletX + bulletShakeX;
    const fy = bulletY + bulletShakeY;

    // Metal link
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.ellipse(fx, fy, 2 * zoom, 1.3 * zoom, bulletAngle, 0, Math.PI * 2);
    ctx.fill();

    // Brass casing
    const brassGrad = ctx.createLinearGradient(
      fx - 2 * zoom,
      fy - 2.5 * zoom,
      fx + 2 * zoom,
      fy + 2.5 * zoom,
    );
    brassGrad.addColorStop(0, "#e6c54a");
    brassGrad.addColorStop(0.3, "#daa520");
    brassGrad.addColorStop(0.7, "#b8860b");
    brassGrad.addColorStop(1, "#8b6914");
    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.ellipse(
      fx,
      fy,
      2.8 * zoom,
      3.8 * zoom,
      bulletAngle + Math.PI * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Bullet tip
    const tipOffsetX = Math.cos(bulletAngle + Math.PI * 0.5) * 2.5 * zoom;
    const tipOffsetY = Math.sin(bulletAngle + Math.PI * 0.5) * 2.5 * zoom;
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.ellipse(
      fx + tipOffsetX,
      fy + tipOffsetY,
      1.8 * zoom,
      2 * zoom,
      bulletAngle + Math.PI * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ============================================================================
// TOWER PASSIVE EFFECTS HELPER
// ============================================================================
function drawTowerPassiveEffects(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  // Add ambient particles floating around all towers
  const particleCount = 3 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const angle = time * (0.5 + i * 0.1) + i * ((Math.PI * 2) / particleCount);
    const radius = (25 + Math.sin(time * 2 + i) * 5) * zoom;
    const px = screenPos.x + Math.cos(angle) * radius;
    const py = screenPos.y - 30 * zoom + Math.sin(angle * 0.5) * radius * 0.3;
    const particleAlpha = 0.3 + Math.sin(time * 3 + i) * 0.2;
    const particleSize = (2 + Math.sin(time * 4 + i) * 1) * zoom;

    ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle energy ring at base (except for station)
  if (tower.type !== "station") {
    const ringPulse = 1 + Math.sin(time * 2) * 0.1;
    ctx.strokeStyle = `rgba(${hexToRgb(colors.accent)}, ${
      0.15 + Math.sin(time * 3) * 0.1
    })`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 5 * zoom,
      30 * zoom * ringPulse,
      15 * zoom * ringPulse,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
}

// Helper to convert hex to rgb values
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16,
    )}`;
  }
  return "255, 255, 255";
}

// ============================================================================
// TOWER RENDERING
// ============================================================================
export function renderTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  hoveredTower: string | null,
  selectedTower: string | null,
  enemies: Enemy[],
  selectedMap: string,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const isHovered = hoveredTower === tower.id;
  const isSelected = selectedTower === tower.id;
  const colors = TOWER_COLORS[tower.type];

  // Draw passive effects first (behind tower)
  drawTowerPassiveEffects(ctx, screenPos, tower, zoom, time, colors);

  // Selection/hover glow with enhanced effect
  if (isSelected || isHovered) {
    ctx.save();
    ctx.shadowColor = isSelected ? "#c9a227" : "#ffffff";
    ctx.shadowBlur = 30 * zoom;

    // Outer glow ring
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      42 * zoom,
      21 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.15)"
      : "rgba(255,255,255,0.1)";
    ctx.fill();

    // Inner glow ring
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      38 * zoom,
      19 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.25)"
      : "rgba(255,255,255,0.2)";
    ctx.fill();

    // Animated selection ring
    if (isSelected) {
      const ringPulse = 1 + Math.sin(time * 4) * 0.05;
      ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 8 * zoom,
        44 * zoom * ringPulse,
        22 * zoom * ringPulse,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // Enhanced shadow with soft edges
  const shadowGrad = ctx.createRadialGradient(
    screenPos.x,
    screenPos.y + 8 * zoom,
    0,
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.2)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  switch (tower.type) {
    case "cannon":
      renderCannonTower(
        ctx,
        screenPos,
        tower,
        zoom,
        time,
        colors,
        enemies,
        selectedMap,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom,
      );
      break;
    case "library":
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "lab":
      renderLabTower(
        ctx,
        screenPos,
        tower,
        zoom,
        time,
        colors,
        enemies,
        selectedMap,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom,
      );
      break;
    case "arch":
      renderArchTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "club":
      renderClubTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "station":
      renderStationTower(ctx, screenPos, tower, zoom, time, colors);
      break;
  }

  // Level indicator
  if (tower.level > 1) {
    const starY = screenPos.y + 20 * zoom - tower.level * 8 * zoom;
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    drawStar(ctx, screenPos.x, starY, 8 * zoom, 4 * zoom, "#c9a227");
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#8b6914";
    ctx.font = `bold ${8 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tower.level.toString(), screenPos.x, starY + 1 * zoom);
  }

  // Upgrade path badge
  if (tower.level === 4 && tower.upgrade) {
    const badgeY = screenPos.y + 35 * zoom - tower.level * 8 * zoom;
    ctx.fillStyle = tower.upgrade === "A" ? "#ff6b6b" : "#4ecdc4";
    ctx.beginPath();
    ctx.arc(screenPos.x, badgeY, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${8 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tower.upgrade, screenPos.x, badgeY);
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

// CANNON TOWER - High-tech mechanical artillery platform
function renderCannonTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  void colors;
  void enemies;
  void selectedMap;
  void canvasWidth;
  void canvasHeight;
  void dpr;
  void cameraOffset;
  void cameraZoom;

  ctx.save();
  const level = tower.level;
  const baseWidth = 36 + level * 5;
  const baseHeight = 24 + level * 10;

  // ========== BASE RAILING SETUP & BACK HALF (behind building body) ==========
  const canBalW = baseWidth * zoom * 0.5;
  const canBalD = baseWidth * zoom * 0.25;
  const canBalY = screenPos.y + 2 * zoom;
  const canBalRX = canBalW * 1.05;
  const canBalRY = canBalD * 1.05;
  const canBalH = 5 * zoom;
  const canBalSegs = 32;
  const canBalPosts = 16;

  ctx.strokeStyle = "#3a3a42";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    canBalY,
    canBalRX,
    canBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    canBalY - canBalH,
    canBalRX,
    canBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < canBalPosts; bp++) {
    const pa = (bp / canBalPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * canBalRX;
    const py = canBalY + Math.sin(pa) * canBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - canBalH);
    ctx.stroke();
  }
  for (let i = 0; i < canBalSegs; i++) {
    const a0 = (i / canBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / canBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * canBalRX;
    const y0b = canBalY + Math.sin(a0) * canBalRY;
    const x1 = screenPos.x + Math.cos(a1) * canBalRX;
    const y1b = canBalY + Math.sin(a1) * canBalRY;
    ctx.fillStyle = `rgba(74, 74, 82, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - canBalH);
    ctx.lineTo(x0, y0b - canBalH);
    ctx.closePath();
    ctx.fill();
  }

  // Enhanced mechanical base with tech panels
  drawMechanicalTowerBase(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseHeight,
    {
      base: "#4a4a52",
      dark: "#2a2a32",
      light: "#6a6a72",
      accent: "#ff6600",
    },
    zoom,
    time,
    level,
  );

  const topY = screenPos.y - baseHeight * zoom;

  // ========== BASE RAILING FRONT HALF (in front of building body) ==========
  ctx.strokeStyle = "#3a3a42";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, canBalY, canBalRX, canBalRY, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    canBalY - canBalH,
    canBalRX,
    canBalRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < canBalPosts; bp++) {
    const pa = (bp / canBalPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * canBalRX;
    const py = canBalY + Math.sin(pa) * canBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - canBalH);
    ctx.stroke();
  }
  for (let i = 0; i < canBalSegs; i++) {
    const a0 = (i / canBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / canBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * canBalRX;
    const y0b = canBalY + Math.sin(a0) * canBalRY;
    const x1 = screenPos.x + Math.cos(a1) * canBalRX;
    const y1b = canBalY + Math.sin(a1) * canBalRY;
    ctx.fillStyle = `rgba(74, 74, 82, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - canBalH);
    ctx.lineTo(x0, y0b - canBalH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== ENHANCED TURRET MOUNTING PLATFORM ==========

  // Outer mounting ring (heavy base)
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 4 * zoom,
    baseWidth * 0.58 * zoom,
    baseWidth * 0.29 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Tech platform on top
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    baseWidth * 0.5 * zoom,
    baseWidth * 0.25 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Inner platform detail
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 1 * zoom,
    baseWidth * 0.4 * zoom,
    baseWidth * 0.2 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing tech ring
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.strokeStyle = `rgba(255, 102, 0, ${pulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    baseWidth * 0.45 * zoom,
    baseWidth * 0.22 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Mounting bolts around platform
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 8; i++) {
    const boltAngle = (i / 8) * Math.PI * 2 + time * 0.5;
    const boltX = screenPos.x + Math.cos(boltAngle) * baseWidth * 0.48 * zoom;
    const boltY =
      topY + 2 * zoom + Math.sin(boltAngle) * baseWidth * 0.24 * zoom;
    ctx.beginPath();
    ctx.arc(boltX, boltY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Power conduits to turret (level 2+)
  if (level >= 2) {
    ctx.strokeStyle = `rgba(255, 102, 0, ${0.4 + Math.sin(time * 4) * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const conduitAngle = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const startX =
        screenPos.x + Math.cos(conduitAngle) * baseWidth * 0.5 * zoom;
      const startY =
        topY + 2 * zoom + Math.sin(conduitAngle) * baseWidth * 0.25 * zoom;
      const endX =
        screenPos.x + Math.cos(conduitAngle) * baseWidth * 0.25 * zoom;
      const endY =
        topY - 5 * zoom + Math.sin(conduitAngle) * baseWidth * 0.12 * zoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  // Central rotation mechanism (level 3)
  if (level >= 3) {
    // Rotation bearing
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY - 1 * zoom,
      baseWidth * 0.25 * zoom,
      baseWidth * 0.12 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Bearing glow
    ctx.strokeStyle = `rgba(255, 150, 50, ${pulse * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY - 1 * zoom,
      baseWidth * 0.22 * zoom,
      baseWidth * 0.11 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Render appropriate cannon variant
  if (tower.level === 4 && tower.upgrade === "A") {
    renderGatlingGun(ctx, screenPos, topY, tower, zoom, time);
  } else if (tower.level === 4 && tower.upgrade === "B") {
    renderFlamethrower(ctx, screenPos, topY, tower, zoom, time);
  } else if (tower.level === 3) {
    renderHeavyCannon(ctx, screenPos, topY, tower, zoom, time);
  } else {
    renderStandardCannon(ctx, screenPos, topY, tower, zoom, time);
  }

  ctx.restore();
}

// Mechanical base with tech details - FULLY ENCLOSED isometric design
function drawMechanicalTowerBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: { base: string; dark: string; light: string; accent: string },
  zoom: number,
  time: number,
  level: number,
) {
  // Foundation platform (bottom layer)
  drawIsometricPrism(
    ctx,
    x,
    y + 10 * zoom,
    width + 12,
    width + 12,
    6,
    {
      top: "#3a3a42",
      left: "#2a2a32",
      right: "#252530",
      leftBack: "#32323a",
      rightBack: "#2d2d35",
    },
    zoom,
  );

  // Main tower body (middle layer) - this is the core structure
  drawIsometricPrism(
    ctx,
    x,
    y + 4 * zoom,
    width,
    width,
    height - 8,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
      leftBack: lightenColor(colors.base, 10),
      rightBack: lightenColor(colors.dark, 5),
    },
    zoom,
  );

  // Tech layer on top
  drawIsometricPrism(
    ctx,
    x,
    y - (height - 12) * zoom,
    width - 4,
    width - 4,
    8,
    {
      top: lightenColor(colors.base, 15),
      left: colors.base,
      right: colors.dark,
      leftBack: colors.light,
      rightBack: lightenColor(colors.dark, 8),
    },
    zoom,
  );

  // Add tech details on top of the fully enclosed base
  const topY = y - height * zoom;
  const w = width * zoom * 0.5;
  const d = width * zoom * 0.25;

  // ========== STEAM VENTS ==========
  // Left side steam vent
  drawSteamVent(
    ctx,
    x - w * 0.75,
    y - height * zoom * 0.1,
    time,
    0.8 + level * 0.2,
    zoom,
  );

  // Right side steam vent (higher levels)
  if (level >= 2) {
    drawSteamVent(
      ctx,
      x + w * 0.7,
      y - height * zoom * 0.15,
      time + 0.5,
      0.6 + level * 0.15,
      zoom,
    );
  }

  // ========== ENERGY TUBES (following isometric faces) ==========
  drawEnergyTube(
    ctx,
    x - w * 0.6,
    y + d * 0.2,
    x - w * 0.35,
    y - height * zoom * 0.6 + d * 0.1,
    2,
    time,
    zoom,
    "rgb(255, 102, 0)",
  );

  if (level >= 3) {
    drawEnergyTube(
      ctx,
      x + w * 0.6,
      y + d * 0.15,
      x + w * 0.35,
      y - height * zoom * 0.55 + d * 0.1,
      2.5,
      time + 0.3,
      zoom,
      "rgb(255, 80, 0)",
    );
  }

  // Tech panel lines on front faces (flipped orientation)
  ctx.strokeStyle = lightenColor(colors.light, 20);
  ctx.lineWidth = 1 * zoom;

  // Left face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.15, lineY + d * 0.3);
    ctx.lineTo(x - w * 0.85, lineY - d * 0.4);
    ctx.stroke();
  }

  // Right face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, lineY - d * 0.3);
    ctx.lineTo(x + w * 0.15, lineY + d * 0.4);
    ctx.stroke();
  }

  // ========== GLOWING VENTS WITH PULSING LIGHT ==========
  const ventGlow = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(255, 102, 0, ${ventGlow})`;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom;

  // Left face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 12 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x + w * 0.55,
      ventY + d * 1.4,
      3 * zoom,
      2 * zoom,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Right face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 12 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x - w * 0.55,
      ventY + d * 1.4,
      3 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // ========== ROTATING GEARS ==========
  const gearRotation = 1.25;

  // Large gear on left side (visible on front face)
  drawGear(
    ctx,
    x - w * 0.7,
    y - height * zoom * 0.5,
    12 + level * 2,
    8 + level,
    8 + level * 2,
    gearRotation,
    {
      outer: "#4a4a52",
      inner: "#3a3a42",
      teeth: "#5a5a62",
      highlight: colors.accent,
    },
    zoom,
  );

  // Smaller gear meshing with large gear (counter-rotation)
  drawGear(
    ctx,
    x - w * 0.2,
    y - height * zoom * 0.65,
    8 + level,
    5 + level * 0.5,
    6 + level,
    gearRotation,
    {
      outer: "#5a5a62",
      inner: "#4a4a52",
      teeth: "#6a6a72",
      highlight: colors.accent,
    },
    zoom,
  );

  // Gear on right side
  if (level >= 2) {
    drawGear(
      ctx,
      x + w * 0.55,
      y - height * zoom * 0.55,
      10 + level,
      7,
      8 + level,
      -gearRotation,
      {
        outer: "#4a4a52",
        inner: "#3a3a42",
        teeth: "#5a5a62",
        highlight: colors.accent,
      },
      zoom,
    );
  }

  // ========== CONVEYOR BELT WITH AMMO ==========
  if (level >= 2) {
    drawConveyorBelt(
      ctx,
      x - w * 0.5,
      y + 6 * zoom,
      x - w * 0.5,
      y - height * zoom * 1.1,
      6,
      time,
      zoom,
      "#8b4513", // Brass ammo color
    );
  }

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    x - w * 0.85,
    y - height * zoom + 12 * zoom,
    3,
    time,
    zoom,
    "#ff4400",
    4,
  );
  if (level >= 2) {
    drawWarningLight(
      ctx,
      x + w * 0.85,
      y - height * zoom + 12 * zoom,
      3,
      time + 0.5,
      zoom,
      "#ffaa00",
      3,
    );
  }

  // ========== AMMO BOXES (skip for level 4 - turret has its own) ==========
  if (level >= 2 && level < 4) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 5 * zoom,
      12,
      6,
      12,
      { main: "#5a4a3a", accent: "#ff6600", label: "#c9a227" },
      zoom,
      time * 2,
    );
  }
  if (level >= 3 && level < 4) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 2 * zoom,
      14,
      5,
      10,
      { main: "#4a3a2a", accent: "#ffaa00", label: "#c9a227" },
      zoom,
      time * 2 + 1,
    );
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ==========
  if (level >= 2) {
    const scaffoldRingY = y - height * zoom * 0.4;

    // Vertical support struts following isometric edges
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3 * zoom;

    // Front-left strut (follows left iso edge)
    ctx.beginPath();
    ctx.moveTo(x - w * 1.15, y + 8 * zoom);
    ctx.lineTo(x - w * 1.05, topY + 15 * zoom);
    ctx.stroke();

    // Front-right strut (follows right iso edge)
    ctx.beginPath();
    ctx.moveTo(x + w * 1.15, y + 8 * zoom);
    ctx.lineTo(x + w * 1.05, topY + 15 * zoom);
    ctx.stroke();

    // Back-left strut
    ctx.strokeStyle = "#5a5a62";
    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, y - d * 0.8 + 8 * zoom);
    ctx.lineTo(x - w * 0.35, topY + 15 * zoom);
    ctx.stroke();

    // Back-right strut
    ctx.beginPath();
    ctx.moveTo(x + w * 0.4, y - d * 0.8 + 8 * zoom);
    ctx.lineTo(x + w * 0.35, topY + 15 * zoom);
    ctx.stroke();

    // Cross bracing (isometric diagonals)
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 1.1, y - height * zoom * 0.15);
    ctx.lineTo(x - w * 0.35, topY + 20 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 1.1, y - height * zoom * 0.15);
    ctx.lineTo(x + w * 0.35, topY + 20 * zoom);
    ctx.stroke();

    // Horizontal support ring (isometric ellipse, front half only)
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, scaffoldRingY, w * 1.1, d * 1.1, 0, 0, Math.PI);
    ctx.stroke();

    // Support bar connectors at ring ends
    ctx.fillStyle = "#5a5a62";
    const connLeftX = x - w * 1.1;
    const connRightX = x + w * 1.1;
    ctx.beginPath();
    ctx.arc(connLeftX, scaffoldRingY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(connRightX, scaffoldRingY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== AMMO CHAIN/BELT FEED SYSTEM (Level 2+) ==========
  if (level >= 2) {
    // Ammo chain from side storage to turret
    const chainLinks = 8 + level * 2;
    const chainStartX = x - w * 1.0;
    const chainStartY = y - height * zoom * 0.1;
    const chainEndX = x - w * 0.3;
    const chainEndY = topY + 5 * zoom;

    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(chainStartX, chainStartY);

    // Curved chain path with sag
    const midX = (chainStartX + chainEndX) / 2;
    const midY = (chainStartY + chainEndY) / 2 + 10 * zoom;
    ctx.quadraticCurveTo(midX, midY, chainEndX, chainEndY);
    ctx.stroke();

    // Individual chain links
    ctx.fillStyle = "#cd853f";
    for (let i = 0; i < chainLinks; i++) {
      const t = i / chainLinks;
      const linkX = chainStartX + (chainEndX - chainStartX) * t;
      const linkY =
        chainStartY +
        (chainEndY - chainStartY) * t +
        Math.sin(t * Math.PI) * 10 * zoom;

      // Animate chain movement
      const chainAnim = (time * 2 + i * 0.3) % 1;
      const linkPulse = 0.6 + Math.sin(chainAnim * Math.PI * 2) * 0.2;

      ctx.fillStyle = `rgba(205, 133, 63, ${linkPulse})`;
      ctx.beginPath();
      ctx.ellipse(
        linkX,
        linkY,
        2.5 * zoom,
        1.5 * zoom,
        t * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Ammo storage drum
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.ellipse(
      chainStartX,
      chainStartY,
      8 * zoom,
      12 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Drum highlight
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      chainStartX,
      chainStartY,
      6 * zoom,
      10 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Drum bands
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 1 * zoom;
    for (let band = 0; band < 3; band++) {
      const bandY = chainStartY - 8 * zoom + band * 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(chainStartX - 6 * zoom, bandY);
      ctx.lineTo(chainStartX + 6 * zoom, bandY);
      ctx.stroke();
    }
  }

  // ========== ARMOR PLATING (Level 2+) ==========
  if (level >= 2) {
    // Side armor plates
    ctx.fillStyle = "#5a5a62";

    // Left armor plate
    ctx.beginPath();
    ctx.moveTo(x - w * 1.05, y + 2 * zoom);
    ctx.lineTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1.0, y - height * zoom * 0.35);
    ctx.lineTo(x - w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Right armor plate
    ctx.beginPath();
    ctx.moveTo(x + w * 1.05, y + 2 * zoom);
    ctx.lineTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1.0, y - height * zoom * 0.35);
    ctx.lineTo(x + w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Armor plate rivets
    ctx.fillStyle = "#7a7a82";
    const rivetPositions = [
      { x: x - w * 1.05, y: y - height * zoom * 0.1 },
      { x: x - w * 1.1, y: y - height * zoom * 0.25 },
      { x: x + w * 1.05, y: y - height * zoom * 0.1 },
      { x: x + w * 1.1, y: y - height * zoom * 0.25 },
    ];
    for (const rivet of rivetPositions) {
      ctx.beginPath();
      ctx.arc(rivet.x, rivet.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Armor edge highlight
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1.0, y - height * zoom * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1.0, y - height * zoom * 0.35);
    ctx.stroke();
  }

  // ========== LEVEL 3 HEAVY ARMOR & EQUIPMENT ==========
  if (level >= 3) {
    // Additional heavy armor plating on front
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, y + 4 * zoom);
    ctx.lineTo(x - w * 0.8, y - height * zoom * 0.5);
    ctx.lineTo(x - w * 0.5, y - height * zoom * 0.55);
    ctx.lineTo(x - w * 0.3, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w * 0.6, y + 4 * zoom);
    ctx.lineTo(x + w * 0.8, y - height * zoom * 0.5);
    ctx.lineTo(x + w * 0.5, y - height * zoom * 0.55);
    ctx.lineTo(x + w * 0.3, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Secondary ammo chain (right side)
    const chain2Links = 6;
    const chain2StartX = x + w * 1.0;
    const chain2StartY = y - height * zoom * 0.15;
    const chain2EndX = x + w * 0.3;
    const chain2EndY = topY + 8 * zoom;

    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(chain2StartX, chain2StartY);
    ctx.quadraticCurveTo(
      (chain2StartX + chain2EndX) / 2,
      (chain2StartY + chain2EndY) / 2 + 8 * zoom,
      chain2EndX,
      chain2EndY,
    );
    ctx.stroke();

    // Chain links
    ctx.fillStyle = "#cd853f";
    for (let i = 0; i < chain2Links; i++) {
      const t = i / chain2Links;
      const linkX = chain2StartX + (chain2EndX - chain2StartX) * t;
      const linkY =
        chain2StartY +
        (chain2EndY - chain2StartY) * t +
        Math.sin(t * Math.PI) * 8 * zoom;
      const chainAnim = (time * 2.5 + i * 0.4) % 1;
      ctx.fillStyle = `rgba(205, 133, 63, ${0.6 + Math.sin(chainAnim * Math.PI * 2) * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, 2 * zoom, 1.2 * zoom, t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Secondary ammo drum (smaller)
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      chain2StartX,
      chain2StartY,
      6 * zoom,
      9 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Hydraulic pistons
    ctx.fillStyle = "#6a6a72";
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2 * zoom;

    // Left piston
    const pistonExtend = Math.sin(time * 3) * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.85, y + 5 * zoom);
    ctx.lineTo(x - w * 0.75, topY + 18 * zoom + pistonExtend);
    ctx.stroke();
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.arc(
      x - w * 0.75,
      topY + 18 * zoom + pistonExtend,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Right piston
    ctx.strokeStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, y + 5 * zoom);
    ctx.lineTo(x + w * 0.75, topY + 18 * zoom - pistonExtend);
    ctx.stroke();
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.arc(
      x + w * 0.75,
      topY + 18 * zoom - pistonExtend,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Power cables
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1.5 * zoom;
    for (let cable = 0; cable < 3; cable++) {
      const cableY = y - height * zoom * (0.2 + cable * 0.15);
      const sag = Math.sin(time * 2 + cable) * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - w * 1.1, cableY);
      ctx.quadraticCurveTo(
        x - w * 0.9,
        cableY + sag,
        x - w * 0.7,
        cableY - 1 * zoom,
      );
      ctx.stroke();
    }

    // Targeting sensor array
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(x + w * 0.5, topY + 25 * zoom, 8 * zoom, 12 * zoom);

    // Sensor lens
    const sensorGlow = 0.5 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${sensorGlow})`;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(x + w * 0.5 + 4 * zoom, topY + 31 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Exhaust vents
    for (let vent = 0; vent < 2; vent++) {
      const ventX = x + w * (vent === 0 ? -0.95 : 0.95);
      const ventY = topY + 30 * zoom;

      // Vent housing
      ctx.fillStyle = "#3a3a42";
      ctx.fillRect(ventX - 4 * zoom, ventY - 6 * zoom, 8 * zoom, 12 * zoom);

      // Vent glow
      const ventGlow = 0.4 + Math.sin(time * 4 + vent) * 0.3;
      ctx.fillStyle = `rgba(255, 100, 0, ${ventGlow})`;
      ctx.fillRect(ventX - 3 * zoom, ventY - 4 * zoom, 6 * zoom, 8 * zoom);
    }

    // Heavy bolts/anchors
    ctx.fillStyle = "#5a5a62";
    const heavyBoltPositions = [
      { x: x - w * 0.95, y: y + 6 * zoom },
      { x: x + w * 0.95, y: y + 6 * zoom },
      { x: x - w * 0.95, y: topY + 35 * zoom },
      { x: x + w * 0.95, y: topY + 35 * zoom },
    ];
    for (const bolt of heavyBoltPositions) {
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Bolt highlight
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(bolt.x - 1 * zoom, bolt.y - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }
  }

  // Corner reinforcement bolts
  ctx.fillStyle = "#5a5a62";
  const boltSize = 2.5 * zoom;
  // Front corners
  ctx.beginPath();
  ctx.arc(x - w * 0.9, y + d * 0.3 - 4 * zoom, boltSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.9, y + d * 0.3 - 4 * zoom, boltSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x - w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x + w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}
// Helper function to calculate pitch based on tower elevation and typical range
function calculateBarrelPitch(
  towerElevation: number,
  barrelLength: number,
): number {
  // Towers are elevated, enemies are on ground - barrel should pitch down
  // Use a reasonable pitch based on geometry (typically 15-25 degrees)
  const typicalRange = barrelLength * 2.5;
  return Math.atan2(towerElevation, typicalRange);
}

function renderStandardCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;
  const level = tower.level;

  // Recoil animation
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;
  let reloadPhase = 0;

  if (timeSinceFire < 400) {
    const firePhase = timeSinceFire / 400;
    if (firePhase < 0.1) {
      recoilOffset = (firePhase / 0.1) * 8 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else if (firePhase < 0.4) {
      const returnPhase = (firePhase - 0.1) / 0.3;
      recoilOffset =
        8 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 2);
      turretShake =
        Math.sin(returnPhase * Math.PI * 6) * (1 - returnPhase) * 1.5 * zoom;
    } else {
      reloadPhase = (firePhase - 0.4) / 0.6;
    }
  }

  // Calculate isometric foreshortening based on rotation
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Larger barrel dimensions
  const baseBarrelLength = (42 + level * 14) * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = (12 + level * 3) * zoom;

  // Determine if barrel is pointing "away" for draw order
  const facingAway = sinR < -0.3;

  // Apply turret shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Enhanced turret base platform with ring details
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Rotating platform ring with visible teeth/notches
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Rotating gear teeth around base (shows rotation)
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 12; i++) {
    const toothAngle = rotation + (i / 12) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 17 * zoom;
    const toothY = turretY - 4 * zoom + Math.sin(toothAngle) * 8.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Turret base
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 5 * zoom,
    17 * zoom,
    8.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // If facing away, draw barrel BEFORE turret housing
  if (facingAway) {
    drawCannonBarrel(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  // Enhanced turret housing - layered dome design
  const housingGrad = ctx.createRadialGradient(
    turretX - 4 * zoom,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    18 * zoom,
  );
  housingGrad.addColorStop(0, "#7a7a82");
  housingGrad.addColorStop(0.4, "#5a5a62");
  housingGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 12 * zoom,
    16 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ROTATING ARMOR SHIELD PLATES - 4 main shields that rotate with turret aim
  const shieldCount = 4;
  for (let i = 0; i < shieldCount; i++) {
    const baseAngle = (i / shieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);

    // Shields on the front are pushed forward
    const forwardShift = Math.cos(baseAngle) * 3 * zoom;

    // Shield visibility (back shields are darker)
    const visibility = 0.5 + shieldDepth * 0.35;

    // Only draw visible shields
    if (shieldDepth > -0.7) {
      const shieldWidth = 8 * zoom;
      const shieldPerpX = -Math.sin(shieldAngle);
      const shieldPerpY = Math.cos(shieldAngle) * 0.5;

      // Shield center position
      const shieldCenterX =
        turretX + Math.cos(shieldAngle) * (11 + forwardShift * 0.3) * zoom;
      const shieldCenterY =
        turretY -
        12 * zoom +
        Math.sin(shieldAngle) * (5.5 + forwardShift * 0.15) * zoom;

      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        shieldCenterX - shieldPerpX * shieldWidth * 0.5,
        shieldCenterY - shieldPerpY * shieldWidth * 0.5,
        shieldCenterX + shieldPerpX * shieldWidth * 0.5,
        shieldCenterY + shieldPerpY * shieldWidth * 0.5,
      );

      if (shieldSide < 0) {
        // Top/light side
        shieldGrad.addColorStop(0, `rgba(120, 120, 130, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(60, 60, 70, ${visibility})`);
      } else {
        // Bottom/dark side
        shieldGrad.addColorStop(0, `rgba(70, 70, 80, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(80, 80, 90, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(60, 60, 70, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();

      // Draw angular shield shape
      const innerR = 6 * zoom;
      const outerR = 14 * zoom;
      const angleSpan = Math.PI / 2.5;

      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY -
          12 * zoom +
          Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.5 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.closePath();
      ctx.fill();

      // Shield edge highlight
      ctx.strokeStyle = `rgba(150, 150, 160, ${visibility * 0.7})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Armor bolt/rivet detail
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 3 * zoom);
      const rivetY =
        turretY -
        12 * zoom +
        Math.sin(shieldAngle) * (outerR - 3 * zoom) * 0.5 -
        2 * zoom;
      ctx.fillStyle = `rgba(60, 60, 70, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring (between shields and core)
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 12 * zoom,
    10 * zoom,
    5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Central pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pivot ring detail
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel mounting collar that rotates with aim
  const collarX = turretX + cosR * 4 * zoom;
  const collarY = turretY - 12 * zoom + sinR * 2 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 5 * zoom, 3 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Glowing core with pulsing animation - smaller, more subtle
  const coreGlow = 0.5 + Math.sin(time * 5) * 0.25 + reloadPhase * 0.25;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 12 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    4 * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 180, 80, ${coreGlow})`);
  coreGrad.addColorStop(0.4, `rgba(255, 120, 30, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(0.8, `rgba(255, 80, 0, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 220, 180, ${coreGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(
    turretX - 0.5 * zoom,
    turretY - 12.5 * zoom,
    1.5 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === AMMO BOX (LEFT) AND ARMOR SHIELD (RIGHT) ===
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;

  const boxAngle = rotation + Math.PI * 0.55;
  const boxDist = 18 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDist;
  const boxCenterY = turretY - 8 * zoom + Math.sin(boxAngle) * boxDist * 0.5;

  const shieldAngle = rotation - Math.PI * 0.55;
  const shieldDist = 18 * zoom;
  const shieldCenterX = turretX + Math.cos(shieldAngle) * shieldDist;
  const shieldCenterY =
    turretY - 8 * zoom + Math.sin(shieldAngle) * shieldDist * 0.5;

  const boxSide = Math.sin(boxAngle);
  const shieldSide = Math.sin(shieldAngle);
  const boxBehind = boxSide < 0;
  const shieldBehind = shieldSide < 0;
  const towerId = tower.id;

  // Draw behind-camera accessories first (furthest from viewer)
  if (boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
  }
  if (shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "small",
    );
  }

  // Hex mantlet, breech, barrel, mantlets — mantlet behind breech when facing away
  if (facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      zoom,
      1.0,
      recoilOffset,
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1.0,
    recoilOffset,
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1.0,
    time,
    tower.lastAttack,
    400,
    1.0,
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1.0,
    "behind",
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      zoom,
      1.0,
      recoilOffset,
    );
  }

  if (!facingAway) {
    drawCannonBarrel(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  drawMantlets(ctx, turretX, turretY - 12 * zoom, rotation, zoom, 1.0, "front");

  // Draw in-front-of-camera accessories
  if (!boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
  }
  if (!shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "small",
    );
  }

  // Ammo belt always on top (arcs above breech/barrel)
  drawCannonAmmoBelt(
    ctx,
    boxCenterX,
    boxCenterY,
    turretX,
    turretY - 10 * zoom,
    rotation,
    zoom,
    time,
    isAttacking,
    attackPulse,
    boxSide,
    recoilOffset,
  );

  // Calculate pitch for muzzle flash positioning
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchDrop = barrelLength * Math.sin(pitch) * 0.5;

  // Muzzle flash effect — concussive single-shot cannon blast
  if (timeSinceFire < 180) {
    const flashPhase = timeSinceFire / 180;
    const turretRadius = 8 * zoom;
    const totalLength =
      turretRadius + barrelLength * Math.cos(pitch) + 5 * zoom;
    const flashX = turretX + cosR * totalLength;
    const flashY = turretY - 12 * zoom + sinR * totalLength * 0.5 + pitchDrop;
    const flashAlpha = 1 - flashPhase;

    // Concussive shockwave ring
    if (flashPhase > 0.05) {
      const ringPhase = (flashPhase - 0.05) / 0.95;
      const ringR = (12 + ringPhase * 22) * zoom;
      ctx.strokeStyle = `rgba(255, 180, 80, ${(1 - ringPhase) * 0.5})`;
      ctx.lineWidth = (3 - ringPhase * 2.5) * zoom;
      ctx.beginPath();
      ctx.arc(flashX, flashY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer fire bloom
    const bloomR = (18 - flashPhase * 12) * zoom;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25 * zoom * flashAlpha;
    const bloomGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      bloomR,
    );
    bloomGrad.addColorStop(0, `rgba(255, 255, 200, ${flashAlpha})`);
    bloomGrad.addColorStop(0.25, `rgba(255, 200, 80, ${flashAlpha * 0.9})`);
    bloomGrad.addColorStop(0.55, `rgba(255, 130, 30, ${flashAlpha * 0.5})`);
    bloomGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, bloomR, 0, Math.PI * 2);
    ctx.fill();

    // White-hot core
    const coreR = (6 - flashPhase * 5) * zoom;
    ctx.fillStyle = `rgba(255, 255, 240, ${flashAlpha * 0.95})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Directional smoke puff (extends forward from barrel)
    if (flashPhase > 0.1) {
      const smokePhase = (flashPhase - 0.1) / 0.9;
      const smokeDist = (8 + smokePhase * 18) * zoom;
      const smokeX = flashX + cosR * smokeDist;
      const smokeY = flashY + sinR * smokeDist * 0.5 - smokePhase * 6 * zoom;
      const smokeR = (5 + smokePhase * 8) * zoom;
      ctx.fillStyle = `rgba(80, 75, 70, ${(1 - smokePhase) * 0.35})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sparks (2-3 bright particles ejected from muzzle)
    if (flashPhase < 0.6) {
      const sparkAlpha = (1 - flashPhase / 0.6) * 0.8;
      for (let i = 0; i < 3; i++) {
        const sparkAngle = rotation + (i - 1) * 0.4;
        const sparkDist = (5 + flashPhase * 35 * (0.8 + i * 0.2)) * zoom;
        const sparkX =
          flashX + Math.cos(sparkAngle) * sparkDist;
        const sparkY =
          flashY +
          Math.sin(sparkAngle) * sparkDist * 0.5 -
          flashPhase * (4 + i * 3) * zoom;
        ctx.fillStyle = `rgba(255, 230, 120, ${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, (1.5 - flashPhase) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }
}

// Helper function to draw cannon barrel — hexagonal prism body + cylinder muzzle
function drawCannonBarrel(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  barrelLength: number,
  barrelWidth: number,
  _foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const level = tower.level;

  // Isometric basis vectors
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  // Pitch
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchRate = Math.sin(pitch) * 0.5;
  const axisPoint = (dist: number) => ({
    x: pivotX + fwdX * dist,
    y: pivotY + fwdY * dist + dist * pitchRate,
  });

  // Recoil
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 150) {
    const recoilPhase = timeSinceFire / 150;
    if (recoilPhase < 0.2) {
      recoilOffset = (recoilPhase / 0.2) * 8 * zoom;
    } else {
      recoilOffset = 8 * zoom * (1 - (recoilPhase - 0.2) / 0.8);
    }
  }

  const turretRadius = 8 * zoom;
  const startDist = turretRadius - recoilOffset;
  const endDist = barrelLength - recoilOffset;
  const hexLen = (endDist - startDist) * 0.78;
  const muzzleLen = (endDist - startDist) * 0.22;

  const isoOff = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat - vert,
  });

  // Barrel dimensions
  const hexR = barrelWidth * 0.3;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  // Hex vertices
  const hexVerts: { x: number; y: number }[] = [];
  for (let i = 0; i < hexSides; i++) {
    const a = (i / hexSides) * Math.PI * 2;
    hexVerts.push(isoOff(Math.cos(a) * hexR, Math.sin(a) * hexR));
  }

  // Taper: hex shrinks slightly toward muzzle junction
  const taperScale = 0.88;
  const taperVerts: { x: number; y: number }[] = hexVerts.map((v) => ({
    x: v.x * taperScale,
    y: v.y * taperScale,
  }));

  // Key axis points
  const hexBackPt = axisPoint(startDist);
  const hexFrontPt = axisPoint(startDist + hexLen);
  const muzzleBackPt = hexFrontPt;
  const muzzleEndPt = axisPoint(startDist + hexLen + muzzleLen + 1 * zoom);

  // Side normals for hex faces
  const sideNormals: number[] = [];
  for (let i = 0; i < hexSides; i++) {
    const midA = ((i + 0.5) / hexSides) * Math.PI * 2;
    sideNormals.push(Math.cos(midA) * cosR + 0.5 * Math.sin(midA));
  }

  // Muzzle hex vertices (slightly wider)
  const muzzleScale = 1.1;
  const muzzleVerts: { x: number; y: number }[] = taperVerts.map((v) => ({
    x: v.x * muzzleScale,
    y: v.y * muzzleScale,
  }));
  const muzzleTipVerts: { x: number; y: number }[] = taperVerts.map((v) => ({
    x: v.x * muzzleScale * 1.08,
    y: v.y * muzzleScale * 1.08,
  }));

  // === BREECH HEX CAP (always drawn to close the barrel) ===
  {
    const capPt = facingFwd ? hexBackPt : hexFrontPt;
    const capVerts = facingFwd ? hexVerts : taperVerts;
    ctx.fillStyle = facingFwd ? "#6c6c78" : "#5c5c6a";
    ctx.beginPath();
    ctx.moveTo(capPt.x + capVerts[0].x, capPt.y + capVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(capPt.x + capVerts[i].x, capPt.y + capVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4a4a58";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === HEXAGONAL BARREL BODY — draw ALL 6 side quads, depth-sorted ===
  const sortedSides = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => sideNormals[a] - sideNormals[b],
  );

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];

    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    // All faces rendered — lighter colors to blend with turret
    const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);
    const rc = Math.floor(55 + lit * 68);
    const gc = Math.floor(55 + lit * 66);
    const bc = Math.floor(60 + lit * 70);

    const sGrad = ctx.createLinearGradient(
      hexBackPt.x + v0.x,
      hexBackPt.y + v0.y,
      hexFrontPt.x + tv0.x,
      hexFrontPt.y + tv0.y,
    );
    sGrad.addColorStop(0, `rgb(${rc + 4}, ${gc + 4}, ${bc + 6})`);
    sGrad.addColorStop(0.5, `rgb(${rc}, ${gc}, ${bc})`);
    sGrad.addColorStop(1, `rgb(${rc - 6}, ${gc - 6}, ${bc - 3})`);
    ctx.fillStyle = sGrad;

    ctx.beginPath();
    ctx.moveTo(hexBackPt.x + v0.x, hexBackPt.y + v0.y);
    ctx.lineTo(hexBackPt.x + v1.x, hexBackPt.y + v1.y);
    ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
    ctx.lineTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
    ctx.closePath();
    ctx.fill();

    // Edge lines
    ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    // Highlight on well-lit edges
    if (normal > 0.25) {
      ctx.strokeStyle = `rgba(160, 160, 178, ${(normal - 0.25) * 0.4})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
      ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
      ctx.stroke();
    }

    // Orange energy conduit on visible faces
    if (normal > -0.3) {
      const conduitGlow = 0.5 + Math.sin(time * 6) * 0.3;
      const midV0x = (v0.x + v1.x) * 0.5;
      const midV0y = (v0.y + v1.y) * 0.5;
      const midTV0x = (tv0.x + tv1.x) * 0.5;
      const midTV0y = (tv0.y + tv1.y) * 0.5;
      ctx.strokeStyle = `rgba(255, 102, 0, ${conduitGlow * Math.max(0.15, 0.3 + normal * 0.5)})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
      ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
      ctx.stroke();
    }
  }

  // === GRAY HEX RING BANDS along barrel (3D — only visible faces) ===
  const bandCount = 2 + (level >= 3 ? 1 : 0);
  const bandThick = 2.5 * zoom;
  for (let b = 0; b < bandCount; b++) {
    const t = (b + 1) / (bandCount + 1);
    const bandFrontPt = axisPoint(startDist + hexLen * t + bandThick * 0.5);
    const bandBackPt = axisPoint(startDist + hexLen * t - bandThick * 0.5);
    const bScale = 1 + (taperScale - 1) * t;
    const bVerts = hexVerts.map((v) => ({
      x: v.x * bScale * 1.06,
      y: v.y * bScale * 1.06,
    }));

    const bandSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, bb) => sideNormals[a] - sideNormals[bb],
    );

    for (const i of bandSorted) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const v0 = bVerts[i];
      const v1 = bVerts[ni];

      const lit = Math.max(0.2, 0.3 + Math.max(0, normal) * 0.5);
      const gc = Math.floor(100 + lit * 50);

      ctx.fillStyle = `rgb(${gc}, ${gc}, ${gc + 6})`;
      ctx.beginPath();
      ctx.moveTo(bandBackPt.x + v0.x, bandBackPt.y + v0.y);
      ctx.lineTo(bandBackPt.x + v1.x, bandBackPt.y + v1.y);
      ctx.lineTo(bandFrontPt.x + v1.x, bandFrontPt.y + v1.y);
      ctx.lineTo(bandFrontPt.x + v0.x, bandFrontPt.y + v0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, normal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Orange accent line down center of each visible band face
      if (normal > -0.05) {
        const midV0x = (v0.x + v1.x) * 0.5;
        const midV0y = (v0.y + v1.y) * 0.5;
        ctx.strokeStyle = `rgba(255, 130, 30, ${0.4 + Math.max(0, normal) * 0.35})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(bandBackPt.x + midV0x, bandBackPt.y + midV0y);
        ctx.lineTo(bandFrontPt.x + midV0x, bandFrontPt.y + midV0y);
        ctx.stroke();
      }
    }

    // Front/back hex cap of the band ring (visible face only)
    const capPt = facingFwd ? bandFrontPt : bandBackPt;
    ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (
        sideNormals[i] < -0.15 &&
        sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
      )
        continue;
      ctx.moveTo(capPt.x + bVerts[i].x, capPt.y + bVerts[i].y);
      ctx.lineTo(capPt.x + bVerts[ni].x, capPt.y + bVerts[ni].y);
    }
    ctx.stroke();
  }

  // === BARREL-MUZZLE JUNCTION CAP (close the front of barrel body) ===
  {
    const jCapPt = facingFwd ? hexFrontPt : hexBackPt;
    const jCapVerts = facingFwd ? taperVerts : hexVerts;
    ctx.fillStyle = facingFwd ? "#60606e" : "#6c6c78";
    ctx.beginPath();
    ctx.moveTo(jCapPt.x + jCapVerts[0].x, jCapPt.y + jCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(jCapPt.x + jCapVerts[i].x, jCapPt.y + jCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4e4e5c";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  // === MUZZLE BACK CAP (close the back of muzzle, opposite of front cap) ===
  {
    const mbCapPt = facingFwd ? muzzleBackPt : muzzleEndPt;
    const mbCapVerts = facingFwd ? muzzleVerts : muzzleTipVerts;
    ctx.fillStyle = facingFwd ? "#565664" : "#4c4c5a";
    ctx.beginPath();
    ctx.moveTo(mbCapPt.x + mbCapVerts[0].x, mbCapPt.y + mbCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(mbCapPt.x + mbCapVerts[i].x, mbCapPt.y + mbCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
  }

  // === MUZZLE — hex prism section (wider, matching barrel projection) ===
  const muzzleSideNormals: number[] = sideNormals;

  const muzzleSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => muzzleSideNormals[a] - muzzleSideNormals[b],
  );

  for (const i of muzzleSorted) {
    const ni = (i + 1) % hexSides;
    const normal = muzzleSideNormals[i];

    const mv0 = muzzleVerts[i];
    const mv1 = muzzleVerts[ni];
    const mtv0 = muzzleTipVerts[i];
    const mtv1 = muzzleTipVerts[ni];

    const lit = Math.max(0.1, 0.18 + Math.max(0, normal) * 0.5);
    const mc = Math.floor(48 + lit * 58);
    ctx.fillStyle = `rgb(${mc}, ${mc}, ${mc + 5})`;

    ctx.beginPath();
    ctx.moveTo(muzzleBackPt.x + mv0.x, muzzleBackPt.y + mv0.y);
    ctx.lineTo(muzzleBackPt.x + mv1.x, muzzleBackPt.y + mv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv1.x, muzzleEndPt.y + mtv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv0.x, muzzleEndPt.y + mtv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(20, 20, 30, ${0.25 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === LEVEL 3 EXTRAS: fins + muzzle orange rings ===
  if (level >= 3) {
    // Stabilizer fins
    const finDist = startDist + hexLen * 0.9;
    const finPt = axisPoint(finDist);
    const finEndPt2 = axisPoint(finDist + 6 * zoom);
    const finH = hexR * 1.8;
    const finW = 2.5 * zoom;

    for (let f = 0; f < 4; f++) {
      const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
      const fnormal = Math.cos(fa) * cosR + 0.5 * Math.sin(fa);
      if (fnormal < -0.3) continue;

      const fOuter = isoOff(Math.cos(fa) * finH, Math.sin(fa) * finH);
      const fInner = isoOff(
        Math.cos(fa) * hexR * 0.5,
        Math.sin(fa) * hexR * 0.5,
      );

      const fLit = 0.3 + Math.max(0, fnormal) * 0.5;
      const fc = Math.floor(48 + fLit * 55);

      ctx.fillStyle = `rgb(${fc}, ${fc}, ${fc + 6})`;
      ctx.beginPath();
      ctx.moveTo(
        finPt.x + fInner.x - fwdX * finW,
        finPt.y + fInner.y - fwdY * finW,
      );
      ctx.lineTo(finPt.x + fOuter.x, finPt.y + fOuter.y);
      ctx.lineTo(finEndPt2.x + fOuter.x * 0.8, finEndPt2.y + fOuter.y * 0.8);
      ctx.lineTo(
        finEndPt2.x + fInner.x + fwdX * finW,
        finEndPt2.y + fInner.y + fwdY * finW,
      );
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(30, 30, 40, ${0.3 + fnormal * 0.3})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      const finMidOuter = { x: fOuter.x * 0.85, y: fOuter.y * 0.85 };
      ctx.strokeStyle = `rgba(255, 120, 20, 0.7)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(finPt.x + finMidOuter.x, finPt.y + finMidOuter.y);
      ctx.lineTo(
        finEndPt2.x + finMidOuter.x * 0.8,
        finEndPt2.y + finMidOuter.y * 0.8,
      );
      ctx.stroke();
    }

    // Orange hex rings on muzzle
    for (let r = 0; r < 2; r++) {
      const mt = 0.3 + r * 0.4;
      const ringPt = axisPoint(startDist + hexLen + muzzleLen * mt);
      const ringScale = 1 + (1.08 - 1) * mt;
      const rVerts = muzzleVerts.map((v) => ({
        x: v.x * ringScale,
        y: v.y * ringScale,
      }));
      ctx.strokeStyle = "rgba(255, 120, 20, 0.75)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(ringPt.x + rVerts[0].x, ringPt.y + rVerts[0].y);
      for (let vi = 1; vi < hexSides; vi++)
        ctx.lineTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // === MUZZLE FRONT HEX CAP ===
  const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
  const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;

  ctx.fillStyle = facingFwd ? "#5c5c6a" : "#4c4c5a";
  ctx.beginPath();
  ctx.moveTo(mCapPt.x + mCapVerts[0].x, mCapPt.y + mCapVerts[0].y);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(mCapPt.x + mCapVerts[i].x, mCapPt.y + mCapVerts[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a6a7a";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  if (facingFwd) {
    // Bore hole (smaller hex)
    ctx.fillStyle = "#0a0a0e";
    ctx.beginPath();
    ctx.moveTo(
      mCapPt.x + mCapVerts[0].x * 0.5,
      mCapPt.y + mCapVerts[0].y * 0.5,
    );
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(
        mCapPt.x + mCapVerts[i].x * 0.5,
        mCapPt.y + mCapVerts[i].y * 0.5,
      );
    ctx.closePath();
    ctx.fill();

    // Rifling ring
    ctx.strokeStyle = "#1a1a24";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      mCapPt.x + mCapVerts[0].x * 0.32,
      mCapPt.y + mCapVerts[0].y * 0.32,
    );
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(
        mCapPt.x + mCapVerts[i].x * 0.32,
        mCapPt.y + mCapVerts[i].y * 0.32,
      );
    ctx.closePath();
    ctx.stroke();
  }

  // === MUZZLE FLASH — standard cannon barrel blast ===
  if (timeSinceFire < 180) {
    const flash = 1 - timeSinceFire / 180;
    const flashPt = axisPoint(endDist + 10 * zoom);
    const fX = flashPt.x;
    const fY = flashPt.y;

    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 20 * zoom * flash;

    // Directional flame plume (elongated along barrel axis)
    const plumeLen = 20 * zoom * flash;
    const plumeTipX = fX + fwdX * plumeLen;
    const plumeTipY = fY + fwdY * plumeLen;
    const plumeGrad = ctx.createLinearGradient(fX, fY, plumeTipX, plumeTipY);
    plumeGrad.addColorStop(0, `rgba(255, 255, 200, ${flash * 0.9})`);
    plumeGrad.addColorStop(0.3, `rgba(255, 180, 60, ${flash * 0.7})`);
    plumeGrad.addColorStop(0.7, `rgba(255, 100, 10, ${flash * 0.3})`);
    plumeGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    const plumeW = 10 * zoom * flash;
    ctx.moveTo(fX + perpX * plumeW, fY + perpY * plumeW);
    ctx.quadraticCurveTo(
      plumeTipX,
      plumeTipY,
      fX - perpX * plumeW,
      fY - perpY * plumeW,
    );
    ctx.closePath();
    ctx.fill();

    // Main radial blast
    const blastR = 22 * zoom * flash;
    const blastGrad = ctx.createRadialGradient(fX, fY, 0, fX, fY, blastR);
    blastGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    blastGrad.addColorStop(0.2, `rgba(255, 210, 100, ${flash * 0.85})`);
    blastGrad.addColorStop(0.5, `rgba(255, 140, 20, ${flash * 0.5})`);
    blastGrad.addColorStop(1, `rgba(255, 60, 0, 0)`);
    ctx.fillStyle = blastGrad;
    ctx.beginPath();
    ctx.arc(fX, fY, blastR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `rgba(255, 255, 245, ${flash * 0.9})`;
    ctx.beginPath();
    ctx.arc(fX, fY, 5 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function drawHexMantlet(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  recoilOffset: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const upX = 0;
  const upY = -1;

  const rX = -cosR * recoilOffset * 0.3;
  const rY = -sinR * recoilOffset * 0.15;

  const mantletDist = 6 * zoom * scale;
  const cx = pivotX + fwdX * mantletDist + rX;
  const cy = pivotY + fwdY * mantletDist + rY;

  const hexSides = 6;
  const hexR = 10 * zoom * scale;
  const plateThick = 2.5 * zoom * scale;
  const facingFwd = fwdY >= 0;

  const hexVerts: { x: number; y: number }[] = [];
  for (let i = 0; i < hexSides; i++) {
    const a = (i / hexSides) * Math.PI * 2;
    hexVerts.push({
      x: perpX * Math.cos(a) * hexR + upX * Math.sin(a) * hexR,
      y: perpY * Math.cos(a) * hexR + upY * Math.sin(a) * hexR,
    });
  }

  const frontOff = facingFwd ? plateThick : 0;
  const backOff = facingFwd ? 0 : plateThick;

  const frontPt = { x: cx + fwdX * frontOff, y: cy + fwdY * frontOff };
  const backPt = { x: cx + fwdX * backOff, y: cy + fwdY * backOff };

  const sideNormals: number[] = [];
  for (let i = 0; i < hexSides; i++) {
    const midA = ((i + 0.5) / hexSides) * Math.PI * 2;
    sideNormals.push(Math.cos(midA) * cosR + 0.5 * Math.sin(midA));
  }

  // Back hex face
  ctx.fillStyle = facingFwd ? "#4a4a58" : "#5a5a68";
  ctx.beginPath();
  ctx.moveTo(backPt.x + hexVerts[0].x, backPt.y + hexVerts[0].y);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(backPt.x + hexVerts[i].x, backPt.y + hexVerts[i].y);
  ctx.closePath();
  ctx.fill();

  // Side faces (depth-sorted)
  const sortedSides = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => sideNormals[a] - sideNormals[b],
  );

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];
    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];

    const lit = Math.max(0.15, 0.25 + Math.max(0, normal) * 0.55);
    const rc = Math.floor(50 + lit * 65);
    const gc = Math.floor(50 + lit * 62);
    const bc = Math.floor(55 + lit * 68);

    ctx.fillStyle = `rgb(${rc}, ${gc}, ${bc})`;
    ctx.beginPath();
    ctx.moveTo(backPt.x + v0.x, backPt.y + v0.y);
    ctx.lineTo(backPt.x + v1.x, backPt.y + v1.y);
    ctx.lineTo(frontPt.x + v1.x, frontPt.y + v1.y);
    ctx.lineTo(frontPt.x + v0.x, frontPt.y + v0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(25, 25, 35, ${0.25 + Math.max(0, normal) * 0.15})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    if (normal > 0.2) {
      ctx.strokeStyle = `rgba(150, 150, 168, ${(normal - 0.2) * 0.35})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(frontPt.x + v0.x, frontPt.y + v0.y);
      ctx.lineTo(frontPt.x + v1.x, frontPt.y + v1.y);
      ctx.stroke();
    }
  }

  // Front hex face
  ctx.fillStyle = facingFwd ? "#5e5e6c" : "#4e4e5c";
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x, frontPt.y + hexVerts[0].y);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(frontPt.x + hexVerts[i].x, frontPt.y + hexVerts[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a6a78";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Barrel bore hole in center
  const boreR = 0.35;
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(
    frontPt.x + hexVerts[0].x * boreR,
    frontPt.y + hexVerts[0].y * boreR,
  );
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(
      frontPt.x + hexVerts[i].x * boreR,
      frontPt.y + hexVerts[i].y * boreR,
    );
  ctx.closePath();
  ctx.fill();

  // Vertex bolts on front face
  ctx.fillStyle = "#7a7a8a";
  for (let i = 0; i < hexSides; i++) {
    ctx.beginPath();
    ctx.arc(
      frontPt.x + hexVerts[i].x * 0.78,
      frontPt.y + hexVerts[i].y * 0.78,
      1.2 * zoom * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Orange accent ring
  ctx.strokeStyle = "rgba(255, 130, 30, 0.55)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x * 0.6, frontPt.y + hexVerts[0].y * 0.6);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(
      frontPt.x + hexVerts[i].x * 0.6,
      frontPt.y + hexVerts[i].y * 0.6,
    );
  ctx.closePath();
  ctx.stroke();

  // Outer edge highlight
  ctx.strokeStyle = `rgba(140, 140, 158, 0.4)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x, frontPt.y + hexVerts[0].y);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(frontPt.x + hexVerts[i].x, frontPt.y + hexVerts[i].y);
  ctx.closePath();
  ctx.stroke();
}

function drawMantlets(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  layer: "behind" | "front" | "all" = "all",
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const fwdX = cosR;
  const fwdY = sinR * 0.5;

  const offset = 8 * zoom * scale;
  const fwdOffset = 8 * zoom * scale;
  const plateHalfW = 3.5 * zoom * scale;
  const plateH = 8 * zoom * scale;
  const plateThick = 2 * zoom * scale;

  // Depth sort: draw the mantlet farther from camera first
  const sideOrder: number[] = perpY > 0 ? [-1, 1] : [1, -1];

  for (const side of sideOrder) {
    const closerToCamera = perpY * side > 0;
    if (layer === "behind" && closerToCamera) continue;
    if (layer === "front" && !closerToCamera) continue;

    const cx = pivotX + perpX * offset * side + fwdX * fwdOffset;
    const cy = pivotY + perpY * offset * side + fwdY * fwdOffset;

    const sideDepth = perpY * side;
    const isLit = sideDepth > 0;

    const fl = { x: cx - perpX * plateHalfW, y: cy - perpY * plateHalfW };
    const fr = { x: cx + perpX * plateHalfW, y: cy + perpY * plateHalfW };

    const frontBase = isLit ? 68 : 52;
    ctx.fillStyle = `rgb(${frontBase + 10}, ${frontBase + 8}, ${frontBase + 4})`;
    ctx.beginPath();
    ctx.moveTo(fl.x, fl.y);
    ctx.lineTo(fr.x, fr.y);
    ctx.lineTo(fr.x, fr.y - plateH);
    ctx.lineTo(fl.x, fl.y - plateH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgb(${frontBase + 22}, ${frontBase + 18}, ${frontBase + 12})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    const thickBase = isLit ? 58 : 44;
    const outerEdge = side > 0 ? fr : fl;
    ctx.fillStyle = `rgb(${thickBase + 4}, ${thickBase + 2}, ${thickBase})`;
    ctx.beginPath();
    ctx.moveTo(outerEdge.x, outerEdge.y);
    ctx.lineTo(
      outerEdge.x + fwdX * plateThick,
      outerEdge.y + fwdY * plateThick,
    );
    ctx.lineTo(
      outerEdge.x + fwdX * plateThick,
      outerEdge.y + fwdY * plateThick - plateH,
    );
    ctx.lineTo(outerEdge.x, outerEdge.y - plateH);
    ctx.closePath();
    ctx.fill();

    const topBase = isLit ? 75 : 60;
    ctx.fillStyle = `rgb(${topBase + 10}, ${topBase + 8}, ${topBase + 4})`;
    ctx.beginPath();
    ctx.moveTo(fl.x, fl.y - plateH);
    ctx.lineTo(fr.x, fr.y - plateH);
    ctx.lineTo(fr.x + fwdX * plateThick, fr.y + fwdY * plateThick - plateH);
    ctx.lineTo(fl.x + fwdX * plateThick, fl.y + fwdY * plateThick - plateH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8a8a95";
    for (const bt of [0.2, 0.8]) {
      ctx.beginPath();
      ctx.arc(cx, cy - plateH * bt, 1.3 * zoom * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = `rgba(100, 100, 115, ${isLit ? 0.5 : 0.35})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx, cy - plateH * 0.15);
    ctx.lineTo(cx, cy - plateH * 0.85);
    ctx.stroke();
  }
}

function drawBreechMechanism(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  recoilOffset: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const lightSide = sinR < 0;

  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const backX = -cosR;
  const backY = -sinR * 0.5;

  const rX = -cosR * recoilOffset;
  const rY = -sinR * recoilOffset * 0.5;
  const bx = pivotX + rX;
  const by = pivotY + rY;

  // === RECOIL CYLINDERS ===
  const cylLen = 20 * zoom * scale;
  const cylRad = 3.2 * zoom * scale;
  const cylOff = 7 * zoom * scale;

  for (const side of [-1, 1]) {
    const sx = bx + perpX * cylOff * side;
    const sy = by + perpY * cylOff * side;
    const ex = sx + backX * cylLen;
    const ey = sy + backY * cylLen;
    const isLit = (side === 1) === lightSide;

    const cGrad = ctx.createLinearGradient(
      sx + perpX * cylRad,
      sy + perpY * cylRad,
      sx - perpX * cylRad,
      sy - perpY * cylRad,
    );
    if (isLit) {
      cGrad.addColorStop(0, "#7a7a85");
      cGrad.addColorStop(0.5, "#5a5a65");
      cGrad.addColorStop(1, "#4a4a55");
    } else {
      cGrad.addColorStop(0, "#4a4a55");
      cGrad.addColorStop(0.5, "#5a5a65");
      cGrad.addColorStop(1, "#4a4a55");
    }

    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(sx + perpX * cylRad, sy + perpY * cylRad);
    ctx.lineTo(ex + perpX * cylRad, ey + perpY * cylRad);
    ctx.lineTo(ex - perpX * cylRad, ey - perpY * cylRad);
    ctx.lineTo(sx - perpX * cylRad, sy - perpY * cylRad);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#6a6a75";
    ctx.beginPath();
    ctx.ellipse(ex, ey, cylRad * 1.3, cylRad * 0.65, rotation, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#8a8a95";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 2; i++) {
      const t = 0.3 + i * 0.4;
      const rx = sx + (ex - sx) * t;
      const ry = sy + (ey - sy) * t;
      ctx.beginPath();
      ctx.moveTo(rx + perpX * cylRad * 1.1, ry + perpY * cylRad * 1.1);
      ctx.lineTo(rx - perpX * cylRad * 1.1, ry - perpY * cylRad * 1.1);
      ctx.stroke();
    }

    const pistonLen = recoilOffset > 0 ? recoilOffset * 0.6 : 2 * zoom;
    ctx.strokeStyle = "#9a9aa5";
    ctx.lineWidth = 1.2 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - backX * pistonLen, sy - backY * pistonLen);
    ctx.stroke();
  }

  // === BREECH BLOCK ===
  const blkLen = 12 * zoom * scale;
  const blkW = 9 * zoom * scale;
  const blkH = 6.5 * zoom * scale;

  const bf1x = bx + perpX * blkW;
  const bf1y = by + perpY * blkW;
  const bf2x = bx - perpX * blkW;
  const bf2y = by - perpY * blkW;
  const bb1x = bx + backX * blkLen + perpX * blkW * 0.85;
  const bb1y = by + backY * blkLen + perpY * blkW * 0.85;
  const bb2x = bx + backX * blkLen - perpX * blkW * 0.85;
  const bb2y = by + backY * blkLen - perpY * blkW * 0.85;

  const blkGrad = ctx.createLinearGradient(
    bx + perpX * blkW,
    by + perpY * blkW,
    bx - perpX * blkW,
    by - perpY * blkW,
  );
  if (lightSide) {
    blkGrad.addColorStop(0, "#6a6a75");
    blkGrad.addColorStop(0.4, "#555562");
    blkGrad.addColorStop(1, "#3a3a46");
  } else {
    blkGrad.addColorStop(0, "#3a3a46");
    blkGrad.addColorStop(0.6, "#555562");
    blkGrad.addColorStop(1, "#6a6a75");
  }

  ctx.fillStyle = blkGrad;
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y);
  ctx.lineTo(bb1x, bb1y);
  ctx.lineTo(bb2x, bb2y);
  ctx.lineTo(bf2x, bf2y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lightSide ? "#757580" : "#5a5a68";
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y - blkH);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bf2x, bf2y - blkH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lightSide ? "#5a5a68" : "#4a4a56";
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y);
  ctx.lineTo(bf1x, bf1y - blkH);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb1x, bb1y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lightSide ? "#4a4a56" : "#5a5a68";
  ctx.beginPath();
  ctx.moveTo(bf2x, bf2y);
  ctx.lineTo(bf2x, bf2y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bb2x, bb2y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3a3a46";
  ctx.beginPath();
  ctx.moveTo(bb1x, bb1y);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bb2x, bb2y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#7a7a85";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y - blkH);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bf2x, bf2y - blkH);
  ctx.closePath();
  ctx.stroke();

  // Breech locking lug detail
  const lugX = bx + backX * blkLen * 0.5;
  const lugY = by + backY * blkLen * 0.5 - blkH;
  ctx.fillStyle = "#8a8a95";
  ctx.beginPath();
  ctx.ellipse(
    lugX,
    lugY,
    2 * zoom * scale,
    1.2 * zoom * scale,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === TRUNNION BRACKETS & PINS ===
  for (const side of [-1, 1]) {
    const trX = bx + perpX * (blkW + 2 * zoom) * side;
    const trY = by + perpY * (blkW + 2 * zoom) * side;

    ctx.fillStyle = "#555562";
    const armLen = 6 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(trX, trY - blkH * 0.5);
    ctx.lineTo(trX + backX * armLen, trY + backY * armLen - blkH * 0.5);
    ctx.lineTo(trX + backX * armLen, trY + backY * armLen + 3 * zoom * scale);
    ctx.lineTo(trX, trY + 3 * zoom * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8a8a95";
    ctx.beginPath();
    ctx.arc(trX, trY - blkH * 0.3, 2.2 * zoom * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6a6a75";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // === ELEVATION LINKAGE ===
  const lkX = bx + backX * blkLen * 0.65;
  const lkY = by + backY * blkLen * 0.65;

  ctx.strokeStyle = "#555562";
  ctx.lineWidth = 2.2 * zoom * scale;
  ctx.beginPath();
  ctx.moveTo(lkX, lkY);
  ctx.lineTo(lkX, lkY + 9 * zoom * scale);
  ctx.stroke();

  ctx.fillStyle = "#7a7a85";
  ctx.beginPath();
  ctx.arc(lkX, lkY + 9 * zoom * scale, 2.2 * zoom * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#6a6a75";
  ctx.lineWidth = 2.5 * zoom * scale;
  ctx.beginPath();
  ctx.moveTo(lkX, lkY + 4 * zoom * scale);
  ctx.lineTo(lkX + backX * 7 * zoom * scale, lkY + 6 * zoom * scale);
  ctx.stroke();

  // Hydraulic cylinder detail on elevation linkage
  ctx.fillStyle = "#4a4a56";
  ctx.beginPath();
  ctx.ellipse(
    lkX + backX * 7 * zoom * scale,
    lkY + 6 * zoom * scale,
    2.5 * zoom * scale,
    1.5 * zoom * scale,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawBreechFeedAnimation(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  time: number,
  lastAttack: number,
  cycleTime: number,
  animSpeed: number,
  ejectCount: number = 1,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const backX = -cosR;
  const backY = -sinR * 0.5;

  const timeSinceFire = Date.now() - lastAttack;
  const firing = timeSinceFire < cycleTime;
  const phase = firing ? timeSinceFire / cycleTime : 0;

  // Shell ejection — multiple casings for multi-barrel weapons
  for (let shellIdx = 0; shellIdx < ejectCount; shellIdx++) {
    const phaseOffset = shellIdx * (0.4 / ejectCount);
    const shellPhase = phase - phaseOffset;
    if (!firing || shellPhase < 0.08 || shellPhase > 0.75) continue;

    const ejectPhase = (shellPhase - 0.08) / 0.67;
    const ejectDist = ejectPhase * 28 * zoom * scale;
    const ejectUp = Math.sin(ejectPhase * Math.PI) * 16 * zoom * scale;
    const ejectSpin = ejectPhase * Math.PI * 5 * animSpeed + shellIdx * 1.7;

    const sideSpread = (shellIdx - (ejectCount - 1) * 0.5) * 6 * zoom * scale;
    const ejectX =
      pivotX -
      perpX * (8 * zoom * scale + ejectDist) +
      backX * 3 * zoom * scale +
      perpX * sideSpread;
    const ejectY =
      pivotY -
      perpY * (8 * zoom * scale + ejectDist) +
      backY * 3 * zoom * scale -
      ejectUp +
      perpY * sideSpread;

    const ejectAlpha = Math.min(1, 1.2 - ejectPhase * 0.9);

    if (ejectPhase < 0.5) {
      const smokeAlpha = (0.5 - ejectPhase) * 0.6;
      const smokeR = (4 + ejectPhase * 20) * zoom * scale;
      ctx.fillStyle = `rgba(170, 165, 150, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(
        pivotX -
          perpX * 9 * zoom * scale +
          backX * 3 * zoom * scale +
          perpX * sideSpread,
        pivotY -
          perpY * 9 * zoom * scale +
          backY * 3 * zoom * scale +
          perpY * sideSpread,
        smokeR,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalAlpha = ejectAlpha;

    ctx.fillStyle = `rgba(230, 195, 80, ${ejectAlpha * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(
      ejectX,
      ejectY,
      5 * zoom * scale,
      7 * zoom * scale,
      ejectSpin,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#e8bf30";
    ctx.beginPath();
    ctx.ellipse(
      ejectX,
      ejectY,
      3 * zoom * scale,
      5.5 * zoom * scale,
      ejectSpin,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = "#8a6a12";
    ctx.lineWidth = 1.2 * zoom * scale;
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 240, 180, 0.6)";
    ctx.beginPath();
    ctx.ellipse(
      ejectX - 0.5 * zoom,
      ejectY - 0.8 * zoom,
      1.5 * zoom * scale,
      2.5 * zoom * scale,
      ejectSpin,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    const endX = ejectX + Math.cos(ejectSpin) * 3.5 * zoom * scale;
    const endY = ejectY + Math.sin(ejectSpin) * 3.5 * zoom * scale;
    ctx.fillStyle = `rgba(60, 40, 10, ${ejectAlpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(endX, endY, 1.8 * zoom * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // Breech bolt cycling
  if (firing) {
    const boltTravel = 6 * zoom * scale;
    let boltOffset = 0;
    if (phase < 0.15) {
      boltOffset = (phase / 0.15) * boltTravel;
    } else if (phase < 0.5) {
      boltOffset = boltTravel * (1 - (phase - 0.15) / 0.35);
    }

    const boltX = pivotX + backX * (3 + boltOffset) * zoom * scale;
    const boltY = pivotY + backY * (3 + boltOffset) * zoom * scale;

    ctx.fillStyle = "#8a8a95";
    ctx.beginPath();
    ctx.ellipse(
      boltX,
      boltY - 2 * zoom * scale,
      2.5 * zoom * scale,
      1.5 * zoom * scale,
      rotation,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = "#7a7a85";
    ctx.lineWidth = 2 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(boltX, boltY - 2 * zoom * scale);
    ctx.lineTo(
      boltX + perpX * 4 * zoom * scale,
      boltY + perpY * 4 * zoom * scale - 3 * zoom * scale,
    );
    ctx.stroke();
  }

  // Chamber flash
  if (firing && phase > 0.05 && phase < 0.15) {
    const chamberFlash = 1 - (phase - 0.05) / 0.1;
    ctx.fillStyle = `rgba(255, 200, 100, ${chamberFlash * 0.4})`;
    ctx.beginPath();
    ctx.arc(
      pivotX,
      pivotY - 2 * zoom * scale,
      5 * zoom * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// Level 3 Heavy Cannon - reinforced barrel with stabilizers and isometric rendering
function renderHeavyCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;

  // Recoil animation - heavier recoil for heavy cannon
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;
  let reloadPhase = 0;

  if (timeSinceFire < 600) {
    const firePhase = timeSinceFire / 600;
    if (firePhase < 0.15) {
      recoilOffset = (firePhase / 0.15) * 12 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 15) * 3 * zoom;
    } else if (firePhase < 0.5) {
      const returnPhase = (firePhase - 0.15) / 0.35;
      recoilOffset =
        12 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 1.5);
      turretShake =
        Math.sin(returnPhase * Math.PI * 4) * (1 - returnPhase) * 2 * zoom;
    } else {
      reloadPhase = (firePhase - 0.5) / 0.5;
    }
  }

  // Calculate isometric foreshortening
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Larger barrel for heavy cannon
  const baseBarrelLength = 82 * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = 18 * zoom;

  // Apply turret shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Heavy turret base with armored rim
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 1 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Outer ring detail with rotating gear teeth
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 3 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Rotating gear teeth around base
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 23 * zoom;
    const toothY = turretY - 3 * zoom + Math.sin(toothAngle) * 11.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    23 * zoom,
    11.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 6 * zoom,
    21 * zoom,
    10.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Draw barrel behind housing if facing away
  if (facingAway) {
    drawHeavyCannonBarrel(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  // Armored turret housing - base ellipse
  const housingGrad = ctx.createRadialGradient(
    turretX - 5 * zoom,
    turretY - 20 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    24 * zoom,
  );
  housingGrad.addColorStop(0, "#7a7a82");
  housingGrad.addColorStop(0.3, "#6a6a72");
  housingGrad.addColorStop(0.6, "#5a5a62");
  housingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 16 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ROTATING HEAVY ARMOR SHIELD PLATES - 6 main shields that rotate with turret aim
  const heavyShieldCount = 6;
  for (let i = 0; i < heavyShieldCount; i++) {
    const baseAngle = (i / heavyShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;

    // Only draw visible shields
    if (shieldDepth > -0.65) {
      const innerR = 8 * zoom;
      const outerR = 18 * zoom;
      const angleSpan = Math.PI / 3.5;

      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.5,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.5,
      );

      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(130, 130, 140, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(100, 100, 110, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(70, 70, 80, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(80, 80, 90, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(70, 70, 80, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();

      // Draw angular shield shape - heavier version
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 3 * zoom),
        turretY -
          16 * zoom +
          Math.sin(shieldAngle) * (outerR + 3 * zoom) * 0.5 -
          4 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.closePath();
      ctx.fill();

      // Shield edge highlight
      ctx.strokeStyle = `rgba(160, 160, 170, ${visibility * 0.7})`;
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Armor rivets on each shield
      const rivet1X =
        turretX +
        Math.cos(shieldAngle - angleSpan * 0.15) * (outerR - 4 * zoom);
      const rivet1Y =
        turretY -
        16 * zoom +
        Math.sin(shieldAngle - angleSpan * 0.15) * (outerR - 4 * zoom) * 0.5 -
        2.5 * zoom;
      const rivet2X =
        turretX +
        Math.cos(shieldAngle + angleSpan * 0.15) * (outerR - 4 * zoom);
      const rivet2Y =
        turretY -
        16 * zoom +
        Math.sin(shieldAngle + angleSpan * 0.15) * (outerR - 4 * zoom) * 0.5 -
        2.5 * zoom;

      ctx.fillStyle = `rgba(50, 50, 60, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivet1X, rivet1Y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rivet2X, rivet2Y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring (between shields and core)
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 16 * zoom,
    12 * zoom,
    6 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Heavy pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 10 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pivot ring detail
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel mounting collar that rotates with aim - larger for heavy cannon
  const collarX = turretX + cosR * 5 * zoom;
  const collarY = turretY - 16 * zoom + sinR * 2.5 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 7 * zoom, 4 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Power core - smaller and more subtle
  const coreGlow = 0.6 + Math.sin(time * 4) * 0.25 + reloadPhase * 0.3;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    6 * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 220, 120, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 180, 80, ${coreGlow * 0.8})`);
  coreGrad.addColorStop(0.6, `rgba(255, 130, 30, ${coreGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 240, 200, ${coreGlow * 0.7})`;
  ctx.beginPath();
  ctx.arc(turretX - 1 * zoom, turretY - 17 * zoom, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === AMMO BOX (LEFT) AND ARMOR SHIELD (RIGHT) ===
  const isAttacking = timeSinceFire < 150;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 150 : 0;

  const boxAngle = rotation + Math.PI * 0.55;
  const boxDist = 24 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDist;
  const boxCenterY = turretY - 10 * zoom + Math.sin(boxAngle) * boxDist * 0.5;

  const shieldAngle = rotation - Math.PI * 0.55;
  const shieldDist = 22 * zoom;
  const shieldCenterX = turretX + Math.cos(shieldAngle) * shieldDist;
  const shieldCenterY =
    turretY - 10 * zoom + Math.sin(shieldAngle) * shieldDist * 0.5;

  const boxSide = Math.sin(boxAngle);
  const shieldSide = Math.sin(shieldAngle);
  const boxBehind = boxSide < 0;
  const shieldBehind = shieldSide < 0;
  const towerId = tower.id;

  // Draw behind-camera accessories first
  if (boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "medium",
    );
  }
  if (shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "medium",
    );
  }

  // Hex mantlet, breech, barrel, mantlets — mantlet behind breech when facing away
  if (facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      zoom,
      1.3,
      recoilOffset,
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    recoilOffset,
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    time,
    tower.lastAttack,
    600,
    1.0,
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    "behind",
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      zoom,
      1.3,
      recoilOffset,
    );
  }

  if (!facingAway) {
    drawHeavyCannonBarrel(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  drawMantlets(ctx, turretX, turretY - 16 * zoom, rotation, zoom, 1.3, "front");

  // Draw in-front-of-camera accessories
  if (!boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "medium",
    );
  }
  if (!shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "medium",
    );
  }

  // Ammo belt always on top (arcs above breech/barrel)
  drawCannonAmmoBelt(
    ctx,
    boxCenterX,
    boxCenterY,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    time,
    isAttacking,
    attackPulse,
    boxSide,
    recoilOffset,
  );

  // Calculate pitch for muzzle flash positioning
  const towerElevation = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchDrop = barrelLength * Math.sin(pitch) * 0.5;

  // Muzzle flash — heavy cannon concussive blast (bigger, more dramatic)
  if (timeSinceFire < 250) {
    const flashPhase = timeSinceFire / 250;
    const turretRadius = 10 * zoom;
    const totalLength =
      turretRadius + barrelLength * Math.cos(pitch) + 8 * zoom;
    const flashX = turretX + cosR * totalLength;
    const flashY = turretY - 16 * zoom + sinR * totalLength * 0.5 + pitchDrop;
    const flashAlpha = 1 - flashPhase;

    // Double concussive shockwave rings
    if (flashPhase > 0.03) {
      const ringPhase = (flashPhase - 0.03) / 0.97;
      const ringR = (16 + ringPhase * 30) * zoom;
      ctx.strokeStyle = `rgba(255, 200, 100, ${(1 - ringPhase) * 0.55})`;
      ctx.lineWidth = (4 - ringPhase * 3) * zoom;
      ctx.beginPath();
      ctx.arc(flashX, flashY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (flashPhase > 0.08) {
      const ring2Phase = (flashPhase - 0.08) / 0.92;
      const ring2R = (10 + ring2Phase * 20) * zoom;
      ctx.strokeStyle = `rgba(255, 160, 60, ${(1 - ring2Phase) * 0.35})`;
      ctx.lineWidth = (2.5 - ring2Phase * 2) * zoom;
      ctx.beginPath();
      ctx.arc(flashX, flashY, ring2R, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Massive outer fire bloom
    const bloomR = (28 - flashPhase * 20) * zoom;
    ctx.shadowColor = "#ff7700";
    ctx.shadowBlur = 35 * zoom * flashAlpha;
    const bloomGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      bloomR,
    );
    bloomGrad.addColorStop(0, `rgba(255, 255, 210, ${flashAlpha})`);
    bloomGrad.addColorStop(0.2, `rgba(255, 210, 80, ${flashAlpha * 0.9})`);
    bloomGrad.addColorStop(0.45, `rgba(255, 140, 30, ${flashAlpha * 0.6})`);
    bloomGrad.addColorStop(0.75, `rgba(220, 70, 0, ${flashAlpha * 0.25})`);
    bloomGrad.addColorStop(1, `rgba(180, 40, 0, 0)`);
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, bloomR, 0, Math.PI * 2);
    ctx.fill();

    // White-hot core
    const coreR = (8 - flashPhase * 7) * zoom;
    ctx.fillStyle = `rgba(255, 255, 240, ${flashAlpha * 0.95})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Heavy smoke cloud (two puffs drifting forward and up)
    if (flashPhase > 0.08) {
      const smokeP = (flashPhase - 0.08) / 0.92;
      for (let si = 0; si < 2; si++) {
        const spread = (si - 0.5) * 8 * zoom;
        const smokeDist = (10 + smokeP * 24) * zoom;
        const smokeX =
          flashX +
          cosR * smokeDist +
          (-sinR) * spread;
        const smokeY =
          flashY +
          sinR * smokeDist * 0.5 +
          cosR * spread * 0.5 -
          smokeP * 10 * zoom;
        const smokeR = (6 + smokeP * 12) * zoom;
        ctx.fillStyle = `rgba(70, 65, 60, ${(1 - smokeP) * 0.4})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sparks shower (4 particles for heavy cannon)
    if (flashPhase < 0.7) {
      const sparkAlpha = (1 - flashPhase / 0.7) * 0.85;
      for (let i = 0; i < 4; i++) {
        const sparkAngle = rotation + (i - 1.5) * 0.35;
        const sparkSpeed = 0.7 + i * 0.2;
        const sparkDist = (6 + flashPhase * 45 * sparkSpeed) * zoom;
        const sparkX = flashX + Math.cos(sparkAngle) * sparkDist;
        const sparkY =
          flashY +
          Math.sin(sparkAngle) * sparkDist * 0.5 -
          flashPhase * (5 + i * 4) * zoom;
        ctx.fillStyle = `rgba(255, 220, 100, ${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, (2 - flashPhase * 1.5) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }
}

// Heavy cannon barrel — hex prism body + hex muzzle with reinforcements and fins
function drawHeavyCannonBarrel(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  barrelLength: number,
  _barrelWidth: number,
  _foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const upY = -1;

  const towerElevation = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchRate = Math.sin(pitch) * 0.5;
  const axisPoint = (dist: number) => ({
    x: pivotX + fwdX * dist,
    y: pivotY + fwdY * dist + dist * pitchRate,
  });

  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 200) {
    const recoilPhase = timeSinceFire / 200;
    if (recoilPhase < 0.15) {
      recoilOffset = (recoilPhase / 0.15) * 10 * zoom;
    } else {
      recoilOffset = 10 * zoom * (1 - (recoilPhase - 0.15) / 0.85);
    }
  }

  const turretRadius = 10 * zoom;
  const startDist = turretRadius - recoilOffset;
  const endDist = barrelLength - recoilOffset;
  const hexLen = (endDist - startDist) * 0.76;
  const muzzleLen = (endDist - startDist) * 0.24;

  const isoOff = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat + upY * vert,
  });

  const hexR = 5.5 * zoom;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  const hexVerts: { x: number; y: number }[] = [];
  for (let i = 0; i < hexSides; i++) {
    const a = (i / hexSides) * Math.PI * 2;
    hexVerts.push(isoOff(Math.cos(a) * hexR, Math.sin(a) * hexR));
  }

  const taperScale = 0.85;
  const taperVerts = hexVerts.map((v) => ({
    x: v.x * taperScale,
    y: v.y * taperScale,
  }));

  const hexBackPt = axisPoint(startDist);
  const hexFrontPt = axisPoint(startDist + hexLen);
  const muzzleBackPt = hexFrontPt;
  const muzzleEndPt = axisPoint(startDist + hexLen + muzzleLen + 1 * zoom);

  const sideNormals: number[] = [];
  for (let i = 0; i < hexSides; i++) {
    const midA = ((i + 0.5) / hexSides) * Math.PI * 2;
    sideNormals.push(Math.cos(midA) * cosR + 0.5 * Math.sin(midA));
  }

  const muzzleScale = 1.15;
  const muzzleVerts = taperVerts.map((v) => ({
    x: v.x * muzzleScale,
    y: v.y * muzzleScale,
  }));
  const muzzleTipVerts = taperVerts.map((v) => ({
    x: v.x * muzzleScale * 1.1,
    y: v.y * muzzleScale * 1.1,
  }));

  // === BREECH HEX CAP ===
  {
    const capPt = facingFwd ? hexBackPt : hexFrontPt;
    const capVerts = facingFwd ? hexVerts : taperVerts;
    ctx.fillStyle = facingFwd ? "#5a5a68" : "#4a4a58";
    ctx.beginPath();
    ctx.moveTo(capPt.x + capVerts[0].x, capPt.y + capVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(capPt.x + capVerts[i].x, capPt.y + capVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a3a48";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === HEX BARREL BODY — all 6 side quads, depth-sorted ===
  const sortedSides = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => sideNormals[a] - sideNormals[b],
  );

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];
    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);
    const rc = Math.floor(40 + lit * 70);
    const gc = Math.floor(40 + lit * 68);
    const bc = Math.floor(46 + lit * 72);

    const sGrad = ctx.createLinearGradient(
      hexBackPt.x + v0.x,
      hexBackPt.y + v0.y,
      hexFrontPt.x + tv0.x,
      hexFrontPt.y + tv0.y,
    );
    sGrad.addColorStop(0, `rgb(${rc + 4}, ${gc + 4}, ${bc + 6})`);
    sGrad.addColorStop(0.5, `rgb(${rc}, ${gc}, ${bc})`);
    sGrad.addColorStop(1, `rgb(${rc - 6}, ${gc - 6}, ${bc - 3})`);
    ctx.fillStyle = sGrad;

    ctx.beginPath();
    ctx.moveTo(hexBackPt.x + v0.x, hexBackPt.y + v0.y);
    ctx.lineTo(hexBackPt.x + v1.x, hexBackPt.y + v1.y);
    ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
    ctx.lineTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    if (normal > 0.25) {
      ctx.strokeStyle = `rgba(160, 160, 178, ${(normal - 0.25) * 0.4})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
      ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
      ctx.stroke();
    }

    if (normal > -0.3) {
      const conduitGlow = 0.5 + Math.sin(time * 6) * 0.3;
      const midV0x = (v0.x + v1.x) * 0.5;
      const midV0y = (v0.y + v1.y) * 0.5;
      const midTV0x = (tv0.x + tv1.x) * 0.5;
      const midTV0y = (tv0.y + tv1.y) * 0.5;
      ctx.strokeStyle = `rgba(255, 102, 0, ${conduitGlow * Math.max(0.15, 0.3 + normal * 0.5)})`;
      ctx.lineWidth = 1.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
      ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
      ctx.stroke();
    }
  }

  // === 3D HEX RING BANDS ===
  const bandCount = 3;
  const bandThick = 3 * zoom;
  for (let b = 0; b < bandCount; b++) {
    const t = (b + 1) / (bandCount + 1);
    const bandFrontPt = axisPoint(startDist + hexLen * t + bandThick * 0.5);
    const bandBackPt2 = axisPoint(startDist + hexLen * t - bandThick * 0.5);
    const bScale = 1 + (taperScale - 1) * t;
    const bVerts = hexVerts.map((v) => ({
      x: v.x * bScale * 1.08,
      y: v.y * bScale * 1.08,
    }));

    const bandSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, bb) => sideNormals[a] - sideNormals[bb],
    );

    for (const i of bandSorted) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const bv0 = bVerts[i];
      const bv1 = bVerts[ni];
      const lit = Math.max(0.2, 0.3 + Math.max(0, normal) * 0.5);
      const gc2 = Math.floor(100 + lit * 50);

      ctx.fillStyle = `rgb(${gc2}, ${gc2}, ${gc2 + 6})`;
      ctx.beginPath();
      ctx.moveTo(bandBackPt2.x + bv0.x, bandBackPt2.y + bv0.y);
      ctx.lineTo(bandBackPt2.x + bv1.x, bandBackPt2.y + bv1.y);
      ctx.lineTo(bandFrontPt.x + bv1.x, bandFrontPt.y + bv1.y);
      ctx.lineTo(bandFrontPt.x + bv0.x, bandFrontPt.y + bv0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, normal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      if (normal > -0.05) {
        const midBx = (bv0.x + bv1.x) * 0.5;
        const midBy = (bv0.y + bv1.y) * 0.5;
        ctx.strokeStyle = `rgba(255, 130, 30, ${0.45 + Math.max(0, normal) * 0.35})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(bandBackPt2.x + midBx, bandBackPt2.y + midBy);
        ctx.lineTo(bandFrontPt.x + midBx, bandFrontPt.y + midBy);
        ctx.stroke();
      }
    }

    const capPtB = facingFwd ? bandFrontPt : bandBackPt2;
    ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (
        sideNormals[i] < -0.15 &&
        sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
      )
        continue;
      ctx.moveTo(capPtB.x + bVerts[i].x, capPtB.y + bVerts[i].y);
      ctx.lineTo(capPtB.x + bVerts[ni].x, capPtB.y + bVerts[ni].y);
    }
    ctx.stroke();
  }

  // === STABILIZER FINS ===
  const finDist = startDist + hexLen * 0.88;
  const finPt = axisPoint(finDist);
  const finEndPt2 = axisPoint(finDist + 8 * zoom);
  const finH = hexR * 2.0;
  const finW = 3 * zoom;

  for (let f = 0; f < 4; f++) {
    const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
    const fnormal = Math.cos(fa) * cosR + 0.5 * Math.sin(fa);
    if (fnormal < -0.3) continue;

    const fOuter = isoOff(Math.cos(fa) * finH, Math.sin(fa) * finH);
    const fInner = isoOff(Math.cos(fa) * hexR * 0.5, Math.sin(fa) * hexR * 0.5);

    const fLit = 0.3 + Math.max(0, fnormal) * 0.5;
    const fc = Math.floor(48 + fLit * 55);

    ctx.fillStyle = `rgb(${fc}, ${fc}, ${fc + 6})`;
    ctx.beginPath();
    ctx.moveTo(
      finPt.x + fInner.x - fwdX * finW,
      finPt.y + fInner.y - fwdY * finW,
    );
    ctx.lineTo(finPt.x + fOuter.x, finPt.y + fOuter.y);
    ctx.lineTo(finEndPt2.x + fOuter.x * 0.8, finEndPt2.y + fOuter.y * 0.8);
    ctx.lineTo(
      finEndPt2.x + fInner.x + fwdX * finW,
      finEndPt2.y + fInner.y + fwdY * finW,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(30, 30, 40, ${0.3 + fnormal * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    const finMidOuter = { x: fOuter.x * 0.85, y: fOuter.y * 0.85 };
    ctx.strokeStyle = `rgba(255, 120, 20, 0.7)`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(finPt.x + finMidOuter.x, finPt.y + finMidOuter.y);
    ctx.lineTo(
      finEndPt2.x + finMidOuter.x * 0.8,
      finEndPt2.y + finMidOuter.y * 0.8,
    );
    ctx.stroke();
  }

  // === BARREL-MUZZLE JUNCTION CAP ===
  {
    const jCapPt = facingFwd ? hexFrontPt : hexBackPt;
    const jCapVerts = facingFwd ? taperVerts : hexVerts;
    ctx.fillStyle = facingFwd ? "#4e4e5c" : "#5a5a68";
    ctx.beginPath();
    ctx.moveTo(jCapPt.x + jCapVerts[0].x, jCapPt.y + jCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(jCapPt.x + jCapVerts[i].x, jCapPt.y + jCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
  }

  // === MUZZLE BACK CAP ===
  {
    const mbCapPt = facingFwd ? muzzleBackPt : muzzleEndPt;
    const mbCapVerts = facingFwd ? muzzleVerts : muzzleTipVerts;
    ctx.fillStyle = facingFwd ? "#444454" : "#3a3a48";
    ctx.beginPath();
    ctx.moveTo(mbCapPt.x + mbCapVerts[0].x, mbCapPt.y + mbCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(mbCapPt.x + mbCapVerts[i].x, mbCapPt.y + mbCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
  }

  // === MUZZLE — hex prism section ===
  const muzzleSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => sideNormals[a] - sideNormals[b],
  );

  for (const i of muzzleSorted) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];
    const mv0 = muzzleVerts[i];
    const mv1 = muzzleVerts[ni];
    const mtv0 = muzzleTipVerts[i];
    const mtv1 = muzzleTipVerts[ni];

    const lit = Math.max(0.1, 0.18 + Math.max(0, normal) * 0.5);
    const c = Math.floor(35 + lit * 60);
    ctx.fillStyle = `rgb(${c}, ${c}, ${c + 5})`;

    ctx.beginPath();
    ctx.moveTo(muzzleBackPt.x + mv0.x, muzzleBackPt.y + mv0.y);
    ctx.lineTo(muzzleBackPt.x + mv1.x, muzzleBackPt.y + mv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv1.x, muzzleEndPt.y + mtv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv0.x, muzzleEndPt.y + mtv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(20, 20, 30, ${0.25 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === ORANGE HEX RINGS on muzzle (visible faces only) ===
  for (let r = 0; r < 2; r++) {
    const mt = 0.2 + r * 0.55;
    const ringPt = axisPoint(startDist + hexLen + muzzleLen * mt);
    const ringScale = 1 + (1.08 - 1) * mt;
    const rVerts = muzzleVerts.map((v) => ({
      x: v.x * ringScale,
      y: v.y * ringScale,
    }));
    ctx.strokeStyle = "rgba(255, 120, 20, 0.75)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    for (let vi = 0; vi < hexSides; vi++) {
      const nvi = (vi + 1) % hexSides;
      if (sideNormals[vi] < -0.1) continue;
      ctx.moveTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
      ctx.lineTo(ringPt.x + rVerts[nvi].x, ringPt.y + rVerts[nvi].y);
    }
    ctx.stroke();
  }

  // === MUZZLE FRONT HEX CAP ===
  const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
  const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;

  ctx.fillStyle = facingFwd ? "#4a4a58" : "#3a3a48";
  ctx.beginPath();
  ctx.moveTo(mCapPt.x + mCapVerts[0].x, mCapPt.y + mCapVerts[0].y);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(mCapPt.x + mCapVerts[i].x, mCapPt.y + mCapVerts[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a5a6a";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  if (facingFwd) {
    ctx.fillStyle = "#0a0a0e";
    ctx.beginPath();
    ctx.moveTo(
      mCapPt.x + mCapVerts[0].x * 0.5,
      mCapPt.y + mCapVerts[0].y * 0.5,
    );
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(
        mCapPt.x + mCapVerts[i].x * 0.5,
        mCapPt.y + mCapVerts[i].y * 0.5,
      );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#1a1a24";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      mCapPt.x + mCapVerts[0].x * 0.32,
      mCapPt.y + mCapVerts[0].y * 0.32,
    );
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(
        mCapPt.x + mCapVerts[i].x * 0.32,
        mCapPt.y + mCapVerts[i].y * 0.32,
      );
    ctx.closePath();
    ctx.stroke();
  }

  // === MUZZLE FLASH — heavy cannon barrel blast ===
  if (timeSinceFire < 240) {
    const flash = 1 - timeSinceFire / 240;
    const flashPt = axisPoint(endDist + 12 * zoom);
    const fX = flashPt.x;
    const fY = flashPt.y;

    ctx.shadowColor = "#ff7700";
    ctx.shadowBlur = 30 * zoom * flash;

    // Directional flame plume (larger for heavy cannon)
    const plumeLen = 30 * zoom * flash;
    const plumeTipX = fX + fwdX * plumeLen;
    const plumeTipY = fY + fwdY * plumeLen;
    const plumeGrad = ctx.createLinearGradient(fX, fY, plumeTipX, plumeTipY);
    plumeGrad.addColorStop(0, `rgba(255, 255, 210, ${flash * 0.95})`);
    plumeGrad.addColorStop(0.25, `rgba(255, 190, 60, ${flash * 0.75})`);
    plumeGrad.addColorStop(0.6, `rgba(255, 110, 10, ${flash * 0.4})`);
    plumeGrad.addColorStop(1, `rgba(200, 40, 0, 0)`);
    ctx.fillStyle = plumeGrad;
    const plumeW = 14 * zoom * flash;
    ctx.beginPath();
    ctx.moveTo(fX + perpX * plumeW, fY + perpY * plumeW);
    ctx.quadraticCurveTo(
      plumeTipX,
      plumeTipY,
      fX - perpX * plumeW,
      fY - perpY * plumeW,
    );
    ctx.closePath();
    ctx.fill();

    // Main radial blast
    const blastR = 35 * zoom * flash;
    const blastGrad = ctx.createRadialGradient(fX, fY, 0, fX, fY, blastR);
    blastGrad.addColorStop(0, `rgba(255, 255, 210, ${flash})`);
    blastGrad.addColorStop(0.15, `rgba(255, 220, 100, ${flash * 0.9})`);
    blastGrad.addColorStop(0.4, `rgba(255, 150, 20, ${flash * 0.6})`);
    blastGrad.addColorStop(0.7, `rgba(220, 80, 0, ${flash * 0.3})`);
    blastGrad.addColorStop(1, `rgba(180, 30, 0, 0)`);
    ctx.fillStyle = blastGrad;
    ctx.beginPath();
    ctx.arc(fX, fY, blastR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `rgba(255, 255, 245, ${flash * 0.95})`;
    ctx.beginPath();
    ctx.arc(fX, fY, 7 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function renderGatlingGun(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;
  const spinAngle = time * 30;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Recoil animation
  let recoilOffset = 0;
  let turretShake = 0;

  if (timeSinceFire < 150) {
    const firePhase = timeSinceFire / 150;
    if (firePhase < 0.2) {
      recoilOffset = (firePhase / 0.2) * 6 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else {
      const returnPhase = (firePhase - 0.2) / 0.8;
      recoilOffset = 6 * zoom * (1 - returnPhase);
      turretShake =
        Math.sin(returnPhase * Math.PI * 8) * (1 - returnPhase) * 1.5 * zoom;
    }
  }

  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // === MASSIVE ARMORED BASE ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY + 2 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 21 * zoom;
    const toothY = turretY - 2 * zoom + Math.sin(toothAngle) * 10.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing ammunition indicators
  for (let i = 0; i < 6; i++) {
    const angle = rotation + (i / 6) * Math.PI * 2;
    const indicatorX = turretX + Math.cos(angle) * 18 * zoom;
    const indicatorY = turretY - 3 * zoom + Math.sin(angle) * 9 * zoom;
    const glow = 0.4 + Math.sin(time * 8 + i * 0.5) * 0.3 + attackPulse * 0.3;

    ctx.fillStyle = `rgba(255, 180, 50, ${glow})`;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  if (facingAway) {
    drawGatlingBarrels(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  // === HEAVY GUN SHIELD ===
  const shieldGrad = ctx.createLinearGradient(
    turretX - 20 * zoom,
    turretY - 6 * zoom,
    turretX + 20 * zoom,
    turretY - 28 * zoom,
  );
  shieldGrad.addColorStop(0, "#3a3a42");
  shieldGrad.addColorStop(0.2, "#5a5a62");
  shieldGrad.addColorStop(0.5, "#6a6a72");
  shieldGrad.addColorStop(0.8, "#5a5a62");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(turretX - 18 * zoom, turretY - 4 * zoom);
  ctx.lineTo(turretX - 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 18 * zoom, turretY - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Shield battle damage marks
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const markX = turretX + (i - 1) * 8 * zoom;
    const markY = turretY - 12 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(markX - 3 * zoom, markY - 2 * zoom);
    ctx.lineTo(markX + 2 * zoom, markY + 3 * zoom);
    ctx.stroke();
  }

  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 14 * zoom, turretY - 26 * zoom);
  ctx.stroke();

  // Skull emblem on shield
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 15 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${0.5 + attackPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(turretX - 2 * zoom, turretY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.arc(turretX + 2 * zoom, turretY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Shield tech panels
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 10 * zoom, turretY - 8 * zoom);
  ctx.lineTo(turretX - 8 * zoom, turretY - 22 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(turretX + 10 * zoom, turretY - 8 * zoom);
  ctx.lineTo(turretX + 8 * zoom, turretY - 22 * zoom);
  ctx.stroke();

  // Heavy rivets
  ctx.fillStyle = "#8a8a92";
  for (let row = 0; row < 2; row++) {
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.arc(
        turretX + i * 11 * zoom,
        turretY - 10 * zoom - row * 8 * zoom,
        2.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === CENTRAL TURRET MECHANISM ===
  const turretGrad = ctx.createRadialGradient(
    turretX - 3 * zoom,
    turretY - 18 * zoom,
    0,
    turretX,
    turretY - 14 * zoom,
    16 * zoom,
  );
  turretGrad.addColorStop(0, "#7a7a82");
  turretGrad.addColorStop(0.5, "#5a5a62");
  turretGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = turretGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 14 * zoom,
    14 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ROTATING HEAVY ARMOR SHIELD PLATES - 6 shields that rotate with turret aim
  const gatlingShieldCount = 6;
  for (let i = 0; i < gatlingShieldCount; i++) {
    const baseAngle = (i / gatlingShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;

    // Only draw visible shields
    if (shieldDepth > -0.6) {
      const innerR = 7 * zoom;
      const outerR = 13 * zoom;
      const angleSpan = Math.PI / 3.2;

      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.8,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.8,
      );

      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(120, 120, 130, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(65, 65, 75, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(75, 75, 85, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(85, 85, 95, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(65, 65, 75, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();

      // Draw angular shield shape
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.8,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.8 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY -
          14 * zoom +
          Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.8 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.8 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.8,
      );
      ctx.closePath();
      ctx.fill();

      // Shield edge highlight
      ctx.strokeStyle = `rgba(140, 140, 150, ${visibility * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Armor rivet detail
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 2 * zoom);
      const rivetY =
        turretY -
        14 * zoom +
        Math.sin(shieldAngle) * (outerR - 2 * zoom) * 0.8 -
        2 * zoom;
      ctx.fillStyle = `rgba(50, 50, 60, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 14 * zoom,
    9 * zoom,
    7.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // === AMMO BOX (LEFT) AND ARMOR PLATE (RIGHT) - with proper layering ===
  // Belt shake animation when firing
  const beltShakeX = isAttacking
    ? Math.sin(time * 80) * 2.5 * zoom * attackPulse
    : 0;
  const beltShakeY = isAttacking
    ? Math.cos(time * 60) * 1.8 * zoom * attackPulse
    : 0;

  // Ammo box position - rotates with turret on the LEFT side
  const boxAngle = rotation + Math.PI * 0.45;
  const boxDistance = 28 * zoom;
  const boxCenterX =
    turretX + Math.cos(boxAngle) * boxDistance + beltShakeX * 0.3;
  const boxCenterY =
    turretY -
    8 * zoom +
    Math.sin(boxAngle) * boxDistance * 0.5 +
    beltShakeY * 0.2;

  // Armor plate position - on the RIGHT side of turret
  const plateAngle = rotation - Math.PI * 0.55;
  const plateDistance = 24 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY =
    turretY - 10 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;

  // Determine layering
  const facingPlayer = sinR > 0.2;
  const boxBehindAll = facingPlayer || Math.sin(boxAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;

  const boxSide = Math.sin(boxAngle);

  // Calculate plate visibility
  const plateDepth = Math.cos(plateAngle);
  const plateSide = Math.sin(plateAngle);
  const plateVisible = true;

  const drawAmmoBox = () => {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "large",
    );
  };

  // Helper function to draw the armor plate with number
  const drawArmorPlate = () => {
    if (!plateVisible) return;

    const plateWidth = 16 * zoom;
    const plateHeight = 20 * zoom;
    const plateDepthSize = 8 * zoom;
    const plateLightness = 0.4 + plateDepth * 0.3;

    // === ARMOR PLATE BACK FACE ===
    if (plateSide < 0.3) {
      const backColor = Math.floor(40 + plateLightness * 20);
      ctx.fillStyle = `rgb(${backColor}, ${backColor}, ${backColor + 5})`;
      ctx.beginPath();
      ctx.moveTo(
        plateCenterX - plateWidth * 0.5,
        plateCenterY - plateHeight * 0.5,
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY + plateHeight * 0.5 - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5,
        plateCenterY + plateHeight * 0.5,
      );
      ctx.closePath();
      ctx.fill();
    }

    // === ARMOR PLATE MAIN FACE ===
    const plateGrad = ctx.createLinearGradient(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
    );
    plateGrad.addColorStop(
      0,
      `rgb(${Math.floor(70 + plateLightness * 35)}, ${Math.floor(70 + plateLightness * 30)}, ${Math.floor(65 + plateLightness * 25)})`,
    );
    plateGrad.addColorStop(
      0.5,
      `rgb(${Math.floor(55 + plateLightness * 30)}, ${Math.floor(55 + plateLightness * 25)}, ${Math.floor(50 + plateLightness * 20)})`,
    );
    plateGrad.addColorStop(
      1,
      `rgb(${Math.floor(45 + plateLightness * 20)}, ${Math.floor(45 + plateLightness * 15)}, ${Math.floor(40 + plateLightness * 12)})`,
    );
    ctx.fillStyle = plateGrad;

    // Rounded rectangle shape for plate
    const radius = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.quadraticCurveTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5 + radius,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5 - radius,
    );
    ctx.quadraticCurveTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY + plateHeight * 0.5,
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY + plateHeight * 0.5,
    );
    ctx.quadraticCurveTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
      plateCenterX - plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5 - radius,
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5 + radius,
    );
    ctx.quadraticCurveTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.closePath();
    ctx.fill();

    // Plate edge
    ctx.strokeStyle = `rgb(${Math.floor(85 + plateLightness * 35)}, ${Math.floor(85 + plateLightness * 30)}, ${Math.floor(80 + plateLightness * 25)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // === ARMOR PLATE TOP FACE ===
    const topPlateColor = Math.floor(60 + plateLightness * 30);
    ctx.fillStyle = `rgb(${topPlateColor + 15}, ${topPlateColor + 12}, ${topPlateColor + 8})`;
    ctx.beginPath();
    ctx.moveTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5 + radius - plateDepthSize * 0.4,
      plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius - plateDepthSize * 0.4,
      plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.closePath();
    ctx.fill();

    // === PLATE RIGHT SIDE FACE ===
    if (plateSide > -0.3) {
      const sideColor = Math.floor(50 + plateLightness * 25);
      ctx.fillStyle = `rgb(${sideColor}, ${sideColor - 3}, ${sideColor - 6})`;
      ctx.beginPath();
      ctx.moveTo(
        plateCenterX + plateWidth * 0.5,
        plateCenterY - plateHeight * 0.5 + radius,
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY - plateHeight * 0.5 + radius - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY + plateHeight * 0.5 - radius - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5,
        plateCenterY + plateHeight * 0.5 - radius,
      );
      ctx.closePath();
      ctx.fill();
    }

    // Rivets on corners
    ctx.fillStyle = "#7a7a82";
    const rivetOffsets = [
      [-0.4, -0.4],
      [0.4, -0.4],
      [-0.4, 0.4],
      [0.4, 0.4],
    ];
    for (const [rx, ry] of rivetOffsets) {
      ctx.beginPath();
      ctx.arc(
        plateCenterX + rx * plateWidth * 0.85,
        plateCenterY + ry * plateHeight * 0.85,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Inner darker area for number
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.arc(plateCenterX, plateCenterY, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Number on plate (stenciled style)
    ctx.font = `bold ${9 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(220, 200, 150, ${0.7 + plateLightness * 0.3})`;
    ctx.fillText("⌖", plateCenterX, plateCenterY + 0.5 * zoom);

    // Battle damage scratches
    ctx.strokeStyle = `rgba(30, 30, 35, ${0.4 + plateLightness * 0.2})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(plateCenterX - 4 * zoom, plateCenterY - 6 * zoom);
    ctx.lineTo(plateCenterX - 1 * zoom, plateCenterY - 3 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plateCenterX + 3 * zoom, plateCenterY + 4 * zoom);
    ctx.lineTo(plateCenterX + 5 * zoom, plateCenterY + 7 * zoom);
    ctx.stroke();
  };

  // Two belts from the same box, offset laterally — render behind belt first
  const belt2OffX = (boxSide > 0 ? -8 : 8) * zoom;
  const belt2ExitX = boxCenterX + belt2OffX;
  const belt2ExitY = boxCenterY - 8 * zoom;

  const drawAmmoBelts = () => {
    // Belt farther from camera drawn first. The offset is purely lateral (belt2OffX).
    // In isometric, the perpendicular direction away from camera is (-sinR, cosR*0.5).
    // Project the belt offset onto this to determine depth.
    const belt2Depth = belt2OffX * -sinR;
    const belt2Behind = belt2Depth > 0;
    if (belt2Behind) {
      drawCannonAmmoBelt(
        ctx,
        belt2ExitX,
        belt2ExitY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time + 0.15,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
      drawCannonAmmoBelt(
        ctx,
        boxCenterX,
        boxCenterY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
    } else {
      drawCannonAmmoBelt(
        ctx,
        boxCenterX,
        boxCenterY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
      drawCannonAmmoBelt(
        ctx,
        belt2ExitX,
        belt2ExitY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time + 0.15,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
    }
  };

  // Draw items that should be BEHIND the barrel first
  if (boxBehindAll) {
    drawAmmoBox();
  }
  if (plateBehindAll) {
    drawArmorPlate();
  }

  // Barrel mounting collar that rotates with aim
  const collarX = turretX + cosR * 5 * zoom;
  const collarY = turretY - 14 * zoom + sinR * 4 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 6 * zoom, 4 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // === POWER CORE - smaller and more subtle ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 14 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGlow = 0.6 + Math.sin(time * 10) * 0.25 + attackPulse * 0.25;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 14 * zoom,
    0,
    turretX,
    turretY - 14 * zoom,
    4 * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 240, 150, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 200, 80, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(0.7, `rgba(255, 150, 30, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);

  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = (6 + attackPulse * 6) * zoom;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 14 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spinning core indicator
  ctx.strokeStyle = `rgba(255, 200, 100, ${coreGlow * 0.8})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 4; i++) {
    const indicatorAngle = spinAngle * 0.2 + (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      turretX,
      turretY - 14 * zoom,
      3 * zoom,
      indicatorAngle,
      indicatorAngle + 0.3,
    );
    ctx.stroke();
  }

  // Hex mantlet, breech — mantlet behind breech when facing away
  if (facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      zoom,
      1.2,
      recoilOffset,
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    recoilOffset,
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    time,
    tower.lastAttack,
    200,
    3.0,
    2,
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    "behind",
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      zoom,
      1.2,
      recoilOffset,
    );
  }

  if (!facingAway) {
    drawGatlingBarrels(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  drawMantlets(ctx, turretX, turretY - 14 * zoom, rotation, zoom, 1.2, "front");

  // Draw in-front-of-camera accessories
  if (!boxBehindAll) {
    drawAmmoBox();
  }
  if (!plateBehindAll) {
    drawArmorPlate();
  }

  // Both ammo belts always on top (arc above breech/barrel)
  drawAmmoBelts();

  // === HEAT VENTS ===
  if (isAttacking) {
    for (let i = 0; i < 3; i++) {
      const ventX = turretX + (i - 1) * 8 * zoom;
      const ventY = turretY - 24 * zoom - Math.random() * 5 * zoom;
      const ventAlpha = attackPulse * (0.3 + Math.random() * 0.2);

      ctx.fillStyle = `rgba(255, 150, 50, ${ventAlpha})`;
      ctx.beginPath();
      ctx.ellipse(ventX, ventY, 3 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Unified isometric gatling barrel assembly: housing + barrels + muzzle
// Uses rotation-aware vectors (like ammo box / breech) so everything rotates correctly.
function drawGatlingBarrels(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  _foreshorten: number,
  spinAngle: number,
  zoom: number,
  tower: Tower,
  time: number,
  recoilOffset: number = 0,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;

  // Isometric basis vectors from turret rotation
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const upX = 0;
  const upY = -1;

  // Barrel geometry
  const barrelLen = (56 - recoilOffset * 0.8) * zoom;
  const housingDist = 12 * zoom - recoilOffset * 0.3;
  const barrelCount = 6;
  const barrelSpread = 7 * zoom;
  const barrelW = 3.2 * zoom;

  // Pitch — barrels aim downward at ground-level enemies
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLen);
  const pitchRate = Math.sin(pitch) * 0.5;

  // Helper: get a point along barrel axis at a given forward distance, with pitch drop
  const axisPoint = (dist: number) => ({
    x: pivotX + fwdX * dist,
    y: pivotY + fwdY * dist + dist * pitchRate,
  });

  const ep = axisPoint(barrelLen);
  const ex = ep.x;
  const ey = ep.y;

  // Project a 3D offset (lateral, vertical) into isometric screen coords
  const isoOffset = (lat: number, vert: number) => ({
    x: perpX * lat + upX * vert,
    y: perpY * lat + upY * vert,
  });

  // === HOUSING — hexagonal prism where barrels attach ===
  const housingR = 10 * zoom;
  const housingDepth = 8 * zoom;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  // Compute hex vertices in isometric space
  const hVerts: { x: number; y: number }[] = [];
  for (let i = 0; i < hexSides; i++) {
    const a = (i / hexSides) * Math.PI * 2;
    hVerts.push(isoOffset(Math.cos(a) * housingR, Math.sin(a) * housingR));
  }

  const hFrontDist = facingFwd ? housingDepth : 0;
  const hBackDist = facingFwd ? 0 : housingDepth;
  const hFrontPt = axisPoint(housingDist + hFrontDist);
  const hBackPt = axisPoint(housingDist + hBackDist);

  // Back hex face
  const drawHousingBack = () => {
    const bfx = hBackPt.x;
    const bfy = hBackPt.y;
    ctx.fillStyle = "#3a3a45";
    ctx.beginPath();
    ctx.moveTo(bfx + hVerts[0].x, bfy + hVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(bfx + hVerts[i].x, bfy + hVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a2a35";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  };

  // Side faces of housing hex prism
  const drawHousingSides = () => {
    const fbx = hFrontPt.x;
    const fby = hFrontPt.y;
    const bbx = hBackPt.x;
    const bby = hBackPt.y;

    const sorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, b) => {
        const midAA = ((a + 0.5) / hexSides) * Math.PI * 2;
        const nA = Math.cos(midAA) * cosR + 0.5 * Math.sin(midAA);
        const midBB = ((b + 0.5) / hexSides) * Math.PI * 2;
        const nB = Math.cos(midBB) * cosR + 0.5 * Math.sin(midBB);
        return nA - nB;
      },
    );

    for (const i of sorted) {
      const ni = (i + 1) % hexSides;
      const midA = ((i + 0.5) / hexSides) * Math.PI * 2;
      const normal = Math.cos(midA) * cosR + 0.5 * Math.sin(midA);
      if (normal < -0.15) continue;

      const v0 = hVerts[i];
      const v1 = hVerts[ni];

      const lit = 0.25 + Math.max(0, normal) * 0.55;
      const rc = Math.floor(45 + lit * 60);
      const gc = Math.floor(45 + lit * 58);
      const bc = Math.floor(50 + lit * 62);

      const sGrad = ctx.createLinearGradient(
        bbx + v0.x,
        bby + v0.y,
        fbx + v0.x,
        fby + v0.y,
      );
      sGrad.addColorStop(0, `rgb(${rc - 6}, ${gc - 6}, ${bc - 3})`);
      sGrad.addColorStop(0.5, `rgb(${rc}, ${gc}, ${bc})`);
      sGrad.addColorStop(1, `rgb(${rc - 10}, ${gc - 10}, ${bc - 5})`);
      ctx.fillStyle = sGrad;

      ctx.beginPath();
      ctx.moveTo(bbx + v0.x, bby + v0.y);
      ctx.lineTo(bbx + v1.x, bby + v1.y);
      ctx.lineTo(fbx + v1.x, fby + v1.y);
      ctx.lineTo(fbx + v0.x, fby + v0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(20, 20, 28, ${0.25 + normal * 0.25})`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();

      // Highlight on lit edge
      if (normal > 0.2) {
        ctx.strokeStyle = `rgba(150, 150, 165, ${(normal - 0.2) * 0.4})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(fbx + v0.x, fby + v0.y);
        ctx.lineTo(fbx + v1.x, fby + v1.y);
        ctx.stroke();
      }

      // Mid-panel line
      const mf = 0.5;
      ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + normal * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        bbx + v0.x + (fbx + v0.x - bbx - v0.x) * mf,
        bby + v0.y + (fby + v0.y - bby - v0.y) * mf,
      );
      ctx.lineTo(
        bbx + v1.x + (fbx + v1.x - bbx - v1.x) * mf,
        bby + v1.y + (fby + v1.y - bby - v1.y) * mf,
      );
      ctx.stroke();
    }
  };

  // Front hex face of housing
  const drawHousingFront = () => {
    const ffx = hFrontPt.x;
    const ffy = hFrontPt.y;

    const fGrad = ctx.createRadialGradient(
      ffx - 1 * zoom,
      ffy - 0.5 * zoom,
      0,
      ffx,
      ffy,
      housingR,
    );
    if (facingFwd) {
      fGrad.addColorStop(0, "#7a7a88");
      fGrad.addColorStop(0.5, "#5e5e6c");
      fGrad.addColorStop(1, "#4a4a5a");
    } else {
      fGrad.addColorStop(0, "#55556a");
      fGrad.addColorStop(0.5, "#48485a");
      fGrad.addColorStop(1, "#3a3a4a");
    }
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(ffx + hVerts[0].x, ffy + hVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(ffx + hVerts[i].x, ffy + hVerts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = facingFwd ? "#8a8a98" : "#5a5a6a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Vertex bolts
    ctx.fillStyle = facingFwd ? "#8a8a9a" : "#5a5a6a";
    for (let i = 0; i < hexSides; i++) {
      ctx.beginPath();
      ctx.arc(
        ffx + hVerts[i].x * 0.82,
        ffy + hVerts[i].y * 0.82,
        1.4 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Central hub
    ctx.fillStyle = "#2a2a35";
    ctx.beginPath();
    ctx.arc(ffx, ffy, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Spinning indicator
    ctx.strokeStyle = `rgba(255, 180, 50, ${0.6 + Math.sin(spinAngle * 0.5) * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(ffx, ffy, 4 * zoom, spinAngle, spinAngle + Math.PI);
    ctx.stroke();

    // Inner hub ring
    ctx.strokeStyle = "#3a3a48";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(ffx, ffy, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
  };

  if (facingFwd) {
    drawHousingBack();
    drawHousingSides();
    drawHousingFront();
  } else {
    drawHousingFront();
    drawHousingSides();
    drawHousingBack();
  }

  // === BARRELS — each as a quad strip projected with perp + up ===
  type BarrelEntry = {
    spinA: number;
    lat: number;
    vert: number;
    sortY: number;
    idx: number;
  };
  const barrelData: BarrelEntry[] = [];
  for (let i = 0; i < barrelCount; i++) {
    const a = spinAngle + (i / barrelCount) * Math.PI * 2;
    const lat = Math.cos(a) * barrelSpread;
    const vert = Math.sin(a) * barrelSpread;
    const off = isoOffset(lat, vert);
    barrelData.push({ spinA: a, lat, vert, sortY: off.y, idx: i });
  }
  barrelData.sort((a, b) => a.sortY - b.sortY);

  // Muzzle prism position — center it so front face aligns with barrel tips
  const muzzlePt = axisPoint(barrelLen - 5 * zoom);
  const muzzleX = muzzlePt.x;
  const muzzleY = muzzlePt.y;
  const muzzleBehind = fwdY < 0;

  // Draw muzzle behind barrels if facing away
  if (muzzleBehind) {
    drawGatlingMuzzleIso(
      ctx,
      muzzleX,
      muzzleY,
      rotation,
      fwdX,
      fwdY,
      perpX,
      perpY,
      spinAngle,
      zoom,
      barrelSpread,
      barrelCount,
      isAttacking,
      timeSinceFire,
      ex,
      ey,
      pitchRate,
    );
  }

  for (const bd of barrelData) {
    const off = isoOffset(bd.lat, bd.vert);
    const bsx = hFrontPt.x + off.x;
    const bsy = hFrontPt.y + off.y;
    const bex = ex + off.x * 0.75;
    const bey = ey + off.y * 0.75;

    // Barrel width vector perpendicular to aim in screen space
    const bwPerp = isoOffset(
      Math.cos(bd.spinA + Math.PI * 0.5) * barrelW,
      Math.sin(bd.spinA + Math.PI * 0.5) * barrelW,
    );

    const shade = 0.3 + (bd.sortY / (barrelSpread * 1.5) + 0.5) * 0.4;
    const tint = bd.idx % 2 === 0 ? 10 : -10;
    const c = Math.max(30, Math.min(140, Math.floor(45 + shade * 65 + tint)));

    const grad = ctx.createLinearGradient(
      bsx + bwPerp.x,
      bsy + bwPerp.y,
      bsx - bwPerp.x,
      bsy - bwPerp.y,
    );
    grad.addColorStop(0, `rgb(${c + 20}, ${c + 20}, ${c + 26})`);
    grad.addColorStop(0.4, `rgb(${c + 5}, ${c + 5}, ${c + 10})`);
    grad.addColorStop(0.6, `rgb(${c - 5}, ${c - 5}, ${c})`);
    grad.addColorStop(1, `rgb(${c - 20}, ${c - 20}, ${c - 14})`);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(bsx + bwPerp.x, bsy + bwPerp.y);
    ctx.lineTo(bex + bwPerp.x * 0.7, bey + bwPerp.y * 0.7);
    ctx.lineTo(bex - bwPerp.x * 0.7, bey - bwPerp.y * 0.7);
    ctx.lineTo(bsx - bwPerp.x, bsy - bwPerp.y);
    ctx.closePath();
    ctx.fill();

    // Edge lines
    ctx.strokeStyle = `rgba(15, 15, 20, 0.45)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bsx + bwPerp.x, bsy + bwPerp.y);
    ctx.lineTo(bex + bwPerp.x * 0.7, bey + bwPerp.y * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bsx - bwPerp.x, bsy - bwPerp.y);
    ctx.lineTo(bex - bwPerp.x * 0.7, bey - bwPerp.y * 0.7);
    ctx.stroke();

    // Muzzle flash per barrel (visible at all angles, intensity based on depth)
    if (isAttacking) {
      const flashIntensity = 1 - timeSinceFire / 100;
      const depthFade =
        bd.sortY > -barrelSpread * 0.3
          ? 1
          : 0.4 + 0.6 * Math.max(0, 1 + bd.sortY / barrelSpread);
      ctx.fillStyle = `rgba(255, 200, 80, ${flashIntensity * 0.5 * depthFade})`;
      ctx.beginPath();
      ctx.arc(bex, bey, 2.5 * zoom * depthFade, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === RING BANDS around barrel assembly ===
  const ringBandCount = 2;
  const ringBandR = barrelSpread + barrelW * 1.2;
  const ringBandThick = 2.5 * zoom;
  const ringHexSides = 6;
  const ringBandSideNormals: number[] = [];
  for (let ri = 0; ri < ringHexSides; ri++) {
    const rmidA = ((ri + 0.5) / ringHexSides) * Math.PI * 2;
    ringBandSideNormals.push(Math.cos(rmidA) * cosR + 0.5 * Math.sin(rmidA));
  }
  const ringBandVerts: { x: number; y: number }[] = [];
  for (let ri = 0; ri < ringHexSides; ri++) {
    const ra = (ri / ringHexSides) * Math.PI * 2;
    ringBandVerts.push(
      isoOffset(Math.cos(ra) * ringBandR, Math.sin(ra) * ringBandR),
    );
  }

  for (let rb = 0; rb < ringBandCount; rb++) {
    const rbT = (rb + 1) / (ringBandCount + 1);
    const rbDist =
      housingDist +
      housingDepth +
      (barrelLen - housingDist - housingDepth) * rbT;
    const rbFrontPt = axisPoint(rbDist + ringBandThick * 0.5);
    const rbBackPt = axisPoint(rbDist - ringBandThick * 0.5);
    const rbTaper = 1 - rbT * 0.25;
    const rbVerts = ringBandVerts.map((v) => ({
      x: v.x * rbTaper,
      y: v.y * rbTaper,
    }));

    const rbSorted = Array.from({ length: ringHexSides }, (_, i) => i).sort(
      (a, b) => ringBandSideNormals[a] - ringBandSideNormals[b],
    );

    for (const ri of rbSorted) {
      const rni = (ri + 1) % ringHexSides;
      const rnormal = ringBandSideNormals[ri];
      if (rnormal < -0.15) continue;

      const rv0 = rbVerts[ri];
      const rv1 = rbVerts[rni];
      const rlit = Math.max(0.2, 0.3 + Math.max(0, rnormal) * 0.5);
      const rgc = Math.floor(100 + rlit * 50);

      ctx.fillStyle = `rgb(${rgc}, ${rgc}, ${rgc + 6})`;
      ctx.beginPath();
      ctx.moveTo(rbBackPt.x + rv0.x, rbBackPt.y + rv0.y);
      ctx.lineTo(rbBackPt.x + rv1.x, rbBackPt.y + rv1.y);
      ctx.lineTo(rbFrontPt.x + rv1.x, rbFrontPt.y + rv1.y);
      ctx.lineTo(rbFrontPt.x + rv0.x, rbFrontPt.y + rv0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, rnormal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      if (rnormal > -0.05) {
        const rmidX = (rv0.x + rv1.x) * 0.5;
        const rmidY = (rv0.y + rv1.y) * 0.5;
        ctx.strokeStyle = `rgba(255, 130, 30, ${0.4 + Math.max(0, rnormal) * 0.35})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(rbBackPt.x + rmidX, rbBackPt.y + rmidY);
        ctx.lineTo(rbFrontPt.x + rmidX, rbFrontPt.y + rmidY);
        ctx.stroke();
      }
    }

    const rbCapPt = facingFwd ? rbFrontPt : rbBackPt;
    ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let ri = 0; ri < ringHexSides; ri++) {
      const rni = (ri + 1) % ringHexSides;
      if (
        ringBandSideNormals[ri] < -0.15 &&
        ringBandSideNormals[rni === 0 ? ringHexSides - 1 : rni - 1] < -0.15
      )
        continue;
      ctx.moveTo(rbCapPt.x + rbVerts[ri].x, rbCapPt.y + rbVerts[ri].y);
      ctx.lineTo(rbCapPt.x + rbVerts[rni].x, rbCapPt.y + rbVerts[rni].y);
    }
    ctx.stroke();
  }

  // Draw muzzle in front of barrels if facing camera
  if (!muzzleBehind) {
    drawGatlingMuzzleIso(
      ctx,
      muzzleX,
      muzzleY,
      rotation,
      fwdX,
      fwdY,
      perpX,
      perpY,
      spinAngle,
      zoom,
      barrelSpread,
      barrelCount,
      isAttacking,
      timeSinceFire,
      ex,
      ey,
      pitchRate,
    );
  }

  // Smoke wisps
  if (timeSinceFire > 50 && timeSinceFire < 350) {
    const smokePhase = (timeSinceFire - 50) / 300;
    for (let i = 0; i < 4; i++) {
      const smokeX2 =
        ex +
        fwdX * (6 + smokePhase * 12) * zoom +
        (Math.random() - 0.5) * 10 * zoom;
      const smokeY2 = ey - smokePhase * 18 * zoom - i * 5 * zoom;
      const smokeAlpha = (1 - smokePhase) * 0.35;
      ctx.fillStyle = `rgba(100, 100, 110, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX2, smokeY2, (3 + smokePhase * 5) * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGatlingMuzzleIso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rotation: number,
  fwdX: number,
  fwdY: number,
  perpX: number,
  perpY: number,
  spinAngle: number,
  zoom: number,
  barrelSpread: number,
  barrelCount: number,
  isAttacking: boolean,
  timeSinceFire: number,
  flashCx: number,
  flashCy: number,
  pitchRate: number = 0,
) {
  const cosR = Math.cos(rotation);
  const facingCamera = fwdY >= 0;
  const hexR = barrelSpread + 2.5 * zoom;
  const prismDepth = 10 * zoom;
  const hexSides = 6;

  const isoVtx = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat - vert,
  });

  // Pitch-aware offset along barrel axis
  const axisOff = (dist: number) => ({
    x: fwdX * dist,
    y: fwdY * dist + dist * pitchRate,
  });

  // Compute 6 hexagon vertices in isometric space
  const hexVerts: { x: number; y: number }[] = [];
  for (let i = 0; i < hexSides; i++) {
    const a = (i / hexSides) * Math.PI * 2;
    hexVerts.push(isoVtx(Math.cos(a) * hexR, Math.sin(a) * hexR));
  }

  // Front/back face offsets along barrel axis (pitch-aware)
  const frontDist = facingCamera ? prismDepth : 0;
  const backDist = facingCamera ? 0 : prismDepth;
  const frontOffPt = axisOff(frontDist);
  const backOffPt = axisOff(backDist);

  // Face normal — correct isometric visibility: cosR*cos(midA) + 0.5*sin(midA)
  const sideNormals: number[] = [];
  for (let i = 0; i < hexSides; i++) {
    const midA = ((i + 0.5) / hexSides) * Math.PI * 2;
    sideNormals.push(Math.cos(midA) * cosR + 0.5 * Math.sin(midA));
  }

  // === BACK HEXAGONAL FACE (draw first if facing camera) ===
  const drawBackFace = () => {
    const bfx = cx + backOffPt.x;
    const bfy = cy + backOffPt.y;

    ctx.fillStyle = "#7a7a8e";
    ctx.beginPath();
    ctx.moveTo(bfx + hexVerts[0].x, bfy + hexVerts[0].y);
    for (let i = 1; i < hexSides; i++) {
      ctx.lineTo(bfx + hexVerts[i].x, bfy + hexVerts[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6a6a7e";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Back face bolts at each vertex
    ctx.fillStyle = "#9a9aaa";
    for (let i = 0; i < hexSides; i++) {
      ctx.beginPath();
      ctx.arc(
        bfx + hexVerts[i].x * 0.75,
        bfy + hexVerts[i].y * 0.75,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  };

  // === SIDE FACES of hexagonal prism ===
  const drawSideFaces = () => {
    const fbx = cx + frontOffPt.x;
    const fby = cy + frontOffPt.y;
    const bbx = cx + backOffPt.x;
    const bby = cy + backOffPt.y;

    // Sort sides by depth so closer faces draw last
    const sortedSides = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, b) => sideNormals[a] - sideNormals[b],
    );

    for (const i of sortedSides) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const v0 = hexVerts[i];
      const v1 = hexVerts[ni];

      // Dynamic lighting per face — bright steel palette
      const lit = 0.3 + Math.max(0, normal) * 0.55;
      const baseR = Math.floor(90 + lit * 75);
      const baseG = Math.floor(90 + lit * 73);
      const baseB = Math.floor(98 + lit * 76);

      // Side face gradient (top to bottom for depth)
      const sGrad = ctx.createLinearGradient(
        bbx + v0.x,
        bby + v0.y,
        fbx + v0.x,
        fby + v0.y,
      );
      sGrad.addColorStop(0, `rgb(${baseR - 6}, ${baseG - 6}, ${baseB - 3})`);
      sGrad.addColorStop(0.5, `rgb(${baseR}, ${baseG}, ${baseB})`);
      sGrad.addColorStop(1, `rgb(${baseR - 10}, ${baseG - 10}, ${baseB - 5})`);

      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.moveTo(bbx + v0.x, bby + v0.y);
      ctx.lineTo(bbx + v1.x, bby + v1.y);
      ctx.lineTo(fbx + v1.x, fby + v1.y);
      ctx.lineTo(fbx + v0.x, fby + v0.y);
      ctx.closePath();
      ctx.fill();

      // Edge lines
      ctx.strokeStyle = `rgba(30, 30, 40, ${0.25 + normal * 0.25})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Horizontal panel line across middle of face
      const midFrac = 0.5;
      const panelMx0 = bbx + v0.x + (fbx + v0.x - bbx - v0.x) * midFrac;
      const panelMy0 = bby + v0.y + (fby + v0.y - bby - v0.y) * midFrac;
      const panelMx1 = bbx + v1.x + (fbx + v1.x - bbx - v1.x) * midFrac;
      const panelMy1 = bby + v1.y + (fby + v1.y - bby - v1.y) * midFrac;
      ctx.strokeStyle = `rgba(40, 40, 52, ${0.35 + normal * 0.15})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(panelMx0, panelMy0);
      ctx.lineTo(panelMx1, panelMy1);
      ctx.stroke();

      // Highlight line on top edge of lit faces
      if (normal > 0.2) {
        ctx.strokeStyle = `rgba(180, 180, 200, ${(normal - 0.2) * 0.5})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(fbx + v0.x, fby + v0.y);
        ctx.lineTo(fbx + v1.x, fby + v1.y);
        ctx.stroke();
      }

      // Corner rivets on the front edge
      const rivetFrac = 0.15;
      const rivetX = fbx + v0.x * (1 - rivetFrac) + v1.x * rivetFrac;
      const rivetY = fby + v0.y * (1 - rivetFrac) + v1.y * rivetFrac;
      if (normal > 0) {
        ctx.fillStyle = `rgba(155, 155, 172, ${0.5 + normal * 0.4})`;
        ctx.beginPath();
        ctx.arc(rivetX, rivetY, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // === FRONT HEXAGONAL FACE ===
  const drawFrontFace = () => {
    const ffx = cx + frontOffPt.x;
    const ffy = cy + frontOffPt.y;

    // Outer hexagon fill with gradient
    const fGrad = ctx.createRadialGradient(
      ffx - 1.5 * zoom,
      ffy - 1 * zoom,
      0,
      ffx,
      ffy,
      hexR,
    );
    if (facingCamera) {
      fGrad.addColorStop(0, "#c0c0cc");
      fGrad.addColorStop(0.35, "#a8a8b8");
      fGrad.addColorStop(0.7, "#9090a4");
      fGrad.addColorStop(1, "#80809a");
    } else {
      fGrad.addColorStop(0, "#9a9aac");
      fGrad.addColorStop(0.5, "#8888a0");
      fGrad.addColorStop(1, "#78788e");
    }
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(ffx + hexVerts[0].x, ffy + hexVerts[0].y);
    for (let i = 1; i < hexSides; i++) {
      ctx.lineTo(ffx + hexVerts[i].x, ffy + hexVerts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Outer hex edge
    ctx.strokeStyle = facingCamera ? "#c8c8d4" : "#a0a0b0";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Inner hex (concentric, smaller)
    const innerScale = 0.72;
    ctx.strokeStyle = facingCamera ? "#6a6a80" : "#5a5a70";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      ffx + hexVerts[0].x * innerScale,
      ffy + hexVerts[0].y * innerScale,
    );
    for (let i = 1; i < hexSides; i++) {
      ctx.lineTo(
        ffx + hexVerts[i].x * innerScale,
        ffy + hexVerts[i].y * innerScale,
      );
    }
    ctx.closePath();
    ctx.stroke();

    // Radial spokes from center to each vertex
    ctx.strokeStyle = facingCamera
      ? "rgba(50, 50, 62, 0.5)"
      : "rgba(40, 40, 52, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 0; i < hexSides; i++) {
      ctx.beginPath();
      ctx.moveTo(ffx, ffy);
      ctx.lineTo(ffx + hexVerts[i].x * 0.9, ffy + hexVerts[i].y * 0.9);
      ctx.stroke();
    }

    // Vertex bolts on the face
    ctx.fillStyle = facingCamera ? "#b0b0c0" : "#8a8a9a";
    for (let i = 0; i < hexSides; i++) {
      const bx = ffx + hexVerts[i].x * 0.88;
      const by = ffy + hexVerts[i].y * 0.88;
      ctx.beginPath();
      ctx.arc(bx, by, 1.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Bolt slot
      ctx.strokeStyle = facingCamera ? "#3a3a4a" : "#2a2a3a";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      const slotA = (i / hexSides) * Math.PI * 2;
      ctx.moveTo(
        bx - Math.cos(slotA) * 1 * zoom,
        by - Math.sin(slotA) * 1 * zoom,
      );
      ctx.lineTo(
        bx + Math.cos(slotA) * 1 * zoom,
        by + Math.sin(slotA) * 1 * zoom,
      );
      ctx.stroke();
    }

    if (facingCamera) {
      // Barrel bore holes
      const holeSpread = barrelSpread * 0.65;
      for (let i = 0; i < barrelCount; i++) {
        const a = spinAngle + (i / barrelCount) * Math.PI * 2;
        const hlat = Math.cos(a) * holeSpread;
        const hvert = Math.sin(a) * holeSpread;
        const hox = perpX * hlat;
        const hoy = perpY * hlat - hvert;

        // Outer bore ring
        ctx.fillStyle = "#2a2a35";
        ctx.beginPath();
        ctx.arc(ffx + hox, ffy + hoy, 2.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Bore rifling ring
        ctx.strokeStyle = "#3a3a48";
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();
        // Dark bore hole
        ctx.fillStyle = "#0a0a0e";
        ctx.beginPath();
        ctx.arc(ffx + hox, ffy + hoy, 1.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Tiny highlight on bore rim
        ctx.fillStyle = "rgba(140, 140, 155, 0.3)";
        ctx.beginPath();
        ctx.arc(
          ffx + hox - 0.5 * zoom,
          ffy + hoy - 0.5 * zoom,
          0.8 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Center hub — raised boss
      ctx.fillStyle = "#2a2a35";
      ctx.beginPath();
      ctx.arc(ffx, ffy, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.arc(ffx, ffy, 2.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Hub highlight
      ctx.fillStyle = "rgba(150, 150, 165, 0.25)";
      ctx.beginPath();
      ctx.arc(ffx - 0.8 * zoom, ffy - 0.6 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Hub cross slot
      ctx.strokeStyle = "#0a0a12";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(ffx - 1.5 * zoom, ffy);
      ctx.lineTo(ffx + 1.5 * zoom, ffy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ffx, ffy - 1.5 * zoom);
      ctx.lineTo(ffx, ffy + 1.5 * zoom);
      ctx.stroke();

      // Mid-ring detail bolts (between inner hex and bore holes)
      const midRingR = hexR * 0.52;
      ctx.fillStyle = "rgba(80, 80, 95, 0.6)";
      for (let i = 0; i < hexSides; i++) {
        const a = (i / hexSides) * Math.PI * 2 + Math.PI / hexSides;
        const mb = isoVtx(Math.cos(a) * midRingR, Math.sin(a) * midRingR);
        ctx.beginPath();
        ctx.arc(ffx + mb.x, ffy + mb.y, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Back-face detail: bolts and maintenance panel lines
      ctx.fillStyle = "#5a5a68";
      for (let i = 0; i < hexSides; i++) {
        const bx = ffx + hexVerts[i].x * 0.6;
        const by = ffy + hexVerts[i].y * 0.6;
        ctx.beginPath();
        ctx.arc(bx, by, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Panel cross
      ctx.strokeStyle = "rgba(45, 45, 58, 0.5)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(ffx + hexVerts[0].x * 0.5, ffy + hexVerts[0].y * 0.5);
      ctx.lineTo(ffx + hexVerts[3].x * 0.5, ffy + hexVerts[3].y * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ffx + hexVerts[1].x * 0.5, ffy + hexVerts[1].y * 0.5);
      ctx.lineTo(ffx + hexVerts[4].x * 0.5, ffy + hexVerts[4].y * 0.5);
      ctx.stroke();
    }
  };

  // === Draw in correct depth order ===
  if (facingCamera) {
    drawBackFace();
    drawSideFaces();
    drawFrontFace();
  } else {
    drawFrontFace();
    drawSideFaces();
    drawBackFace();
  }

  // === Muzzle flash (always visible regardless of camera angle) ===
  if (isAttacking) {
    const flash = 1 - timeSinceFire / 100;
    const flashScale = facingCamera ? 1 : 0.7;
    const flX = flashCx + fwdX * 10 * zoom;
    const flY = flashCy + fwdY * 5 * zoom;
    const flashR = 22 * zoom * flash * flashScale;

    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 25 * zoom * flash;

    const flashGrad = ctx.createRadialGradient(flX, flY, 0, flX, flY, flashR);
    flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    flashGrad.addColorStop(0.15, `rgba(255, 240, 150, ${flash * 0.95})`);
    flashGrad.addColorStop(0.4, `rgba(255, 180, 80, ${flash * 0.7})`);
    flashGrad.addColorStop(0.7, `rgba(255, 120, 30, ${flash * 0.4})`);
    flashGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flX, flY, flashR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.9})`;
    ctx.beginPath();
    ctx.arc(flX, flY, 6 * zoom * flash * flashScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function renderFlamethrower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;

  if (timeSinceFire < 300) {
    const firePhase = timeSinceFire / 300;
    if (firePhase < 0.1) {
      recoilOffset = (firePhase / 0.1) * 5 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 12) * 1.5 * zoom;
    } else {
      const returnPhase = (firePhase - 0.1) / 0.9;
      recoilOffset = 5 * zoom * (1 - returnPhase);
      turretShake =
        Math.sin(returnPhase * Math.PI * 3) * (1 - returnPhase) * zoom;
    }
  }

  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Armored base platform
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 21 * zoom;
    const toothY = turretY - 2 * zoom + Math.sin(toothAngle) * 10.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  if (facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  // === 3D ISOMETRIC MAIN FUEL TANK (vertical cylinder) ===
  const tankCX = turretX - 6 * zoom;
  const tankRX = 9 * zoom;
  const tankRY = tankRX * 0.45;
  const tankTopCapY = turretY - 26 * zoom;
  const tankBotCapY = turretY + 2 * zoom;

  const tankBodyGrad = ctx.createLinearGradient(
    tankCX - tankRX,
    turretY - 12 * zoom,
    tankCX + tankRX,
    turretY - 12 * zoom,
  );
  tankBodyGrad.addColorStop(0, "#661010");
  tankBodyGrad.addColorStop(0.15, "#881515");
  tankBodyGrad.addColorStop(0.35, "#cc3030");
  tankBodyGrad.addColorStop(0.5, "#dd4040");
  tankBodyGrad.addColorStop(0.7, "#aa2020");
  tankBodyGrad.addColorStop(0.85, "#881515");
  tankBodyGrad.addColorStop(1, "#551010");
  ctx.fillStyle = tankBodyGrad;
  ctx.beginPath();
  ctx.ellipse(tankCX, tankBotCapY, tankRX, tankRY, 0, 0, Math.PI, false);
  ctx.lineTo(tankCX - tankRX, tankTopCapY);
  ctx.ellipse(
    tankCX,
    tankTopCapY,
    tankRX,
    tankRY,
    0,
    Math.PI,
    Math.PI * 2,
    false,
  );
  ctx.closePath();
  ctx.fill();

  // Bottom cap edge
  ctx.strokeStyle = "#440808";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(tankCX, tankBotCapY, tankRX, tankRY, 0, 0, Math.PI, false);
  ctx.stroke();

  // Specular highlight on cylinder body
  ctx.strokeStyle = "rgba(255, 120, 100, 0.35)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(tankCX - tankRX * 0.6, tankBotCapY - 2 * zoom);
  ctx.lineTo(tankCX - tankRX * 0.6, tankTopCapY + 4 * zoom);
  ctx.stroke();

  // Hazard stripes wrapping around the cylinder (front-facing arcs)
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const stripeY = tankTopCapY + 6 * zoom + i * 7 * zoom;
    ctx.strokeStyle = "#ffcc00";
    ctx.beginPath();
    ctx.ellipse(
      tankCX,
      stripeY,
      tankRX * 0.98,
      tankRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Black hazard stripes between yellow
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 2; i++) {
    const stripeY = tankTopCapY + 9.5 * zoom + i * 7 * zoom;
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(
      tankCX,
      stripeY,
      tankRX * 0.98,
      tankRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Top cap (3D ellipse with radial gradient)
  const topCapGrad = ctx.createRadialGradient(
    tankCX - 2 * zoom,
    tankTopCapY,
    0,
    tankCX,
    tankTopCapY,
    tankRX,
  );
  topCapGrad.addColorStop(0, "#5a5a62");
  topCapGrad.addColorStop(0.4, "#4a4a52");
  topCapGrad.addColorStop(0.8, "#3a3a42");
  topCapGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = topCapGrad;
  ctx.beginPath();
  ctx.ellipse(tankCX, tankTopCapY, tankRX, tankRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Cap valve on top
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(tankCX, tankTopCapY, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a7a82";
  ctx.beginPath();
  ctx.arc(tankCX, tankTopCapY - 1 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pressure gauge on visible side
  const gaugeX = turretX + 2 * zoom;
  const gaugeY = turretY - 6 * zoom;
  ctx.fillStyle = "#444";
  ctx.beginPath();
  ctx.ellipse(
    gaugeX,
    gaugeY + 1 * zoom,
    5.5 * zoom,
    3 * zoom,
    0,
    0,
    Math.PI,
    false,
  );
  ctx.fill();
  ctx.fillStyle = "#ddd";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, Math.PI * 0.8, Math.PI * 1.2);
  ctx.stroke();
  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, Math.PI * 1.5, Math.PI * 1.8);
  ctx.stroke();

  const needleJump =
    timeSinceFire < 300 ? Math.sin(timeSinceFire * 0.05) * 0.2 : 0;
  const needleAngle = Math.PI * (0.9 + Math.sin(time * 2) * 0.15 + needleJump);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(needleAngle) * 3 * zoom,
    gaugeY + Math.sin(needleAngle) * 3 * zoom,
  );
  ctx.stroke();

  // Secondary fuel tank (3D isometric cylinder)
  const secCX = turretX + 8 * zoom;
  const secRX = 5 * zoom;
  const secRY = secRX * 0.4;
  const secTopY = turretY - 18 * zoom;
  const secBotY = turretY - 2 * zoom;

  const secGrad = ctx.createLinearGradient(secCX - secRX, 0, secCX + secRX, 0);
  secGrad.addColorStop(0, "#553018");
  secGrad.addColorStop(0.3, "#884020");
  secGrad.addColorStop(0.6, "#995530");
  secGrad.addColorStop(1, "#663518");
  ctx.fillStyle = secGrad;
  ctx.beginPath();
  ctx.ellipse(secCX, secBotY, secRX, secRY, 0, 0, Math.PI, false);
  ctx.lineTo(secCX - secRX, secTopY);
  ctx.ellipse(secCX, secTopY, secRX, secRY, 0, Math.PI, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#6a4a30";
  ctx.beginPath();
  ctx.ellipse(secCX, secTopY, secRX, secRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fuel lines
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 2 * zoom, turretY - 8 * zoom);
  ctx.quadraticCurveTo(
    turretX + 4 * zoom,
    turretY - 14 * zoom,
    turretX + 6 * zoom,
    turretY - 10 * zoom,
  );
  ctx.stroke();

  // === 3D IGNITER HOUSING (isometric cylinder) ===
  const igniterY = turretY - 10 * zoom;
  const igniterRX = 10 * zoom;
  const igniterRY = 7 * zoom;
  const igniterH = 4 * zoom;

  const ignGrad = ctx.createLinearGradient(
    turretX - igniterRX,
    igniterY,
    turretX + igniterRX,
    igniterY,
  );
  ignGrad.addColorStop(0, "#353540");
  ignGrad.addColorStop(0.3, "#4a4a52");
  ignGrad.addColorStop(0.6, "#555560");
  ignGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = ignGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    igniterY + igniterH,
    igniterRX,
    igniterRY,
    0,
    0,
    Math.PI,
    false,
  );
  ctx.lineTo(turretX - igniterRX, igniterY);
  ctx.ellipse(
    turretX,
    igniterY,
    igniterRX,
    igniterRY,
    0,
    Math.PI,
    Math.PI * 2,
    false,
  );
  ctx.closePath();
  ctx.fill();

  // Bottom edge of housing
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    igniterY + igniterH,
    igniterRX,
    igniterRY,
    0,
    0,
    Math.PI,
    false,
  );
  ctx.stroke();

  // Housing top cap with radial shading
  const ignTopGrad = ctx.createRadialGradient(
    turretX - 2 * zoom,
    igniterY,
    0,
    turretX,
    igniterY,
    igniterRX,
  );
  ignTopGrad.addColorStop(0, "#5a5a62");
  ignTopGrad.addColorStop(0.5, "#4a4a52");
  ignTopGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = ignTopGrad;
  ctx.beginPath();
  ctx.ellipse(turretX, igniterY, igniterRX, igniterRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // === ROTATING FLAME DEFLECTOR SHIELDS with 3D plate thickness ===
  const flameShieldCount = 5;
  const shieldThickness = 2.5 * zoom;
  for (let i = 0; i < flameShieldCount; i++) {
    const baseAngle = (i / flameShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;

    if (shieldDepth > -0.55) {
      const innerR = 5 * zoom;
      const outerR = 9 * zoom;
      const angleSpan = Math.PI / 2.8;

      const p0x = turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR;
      const p0y =
        igniterY + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.7;
      const p1x = turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR;
      const p1y =
        igniterY +
        Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.7 -
        2 * zoom;
      const p2x = turretX + Math.cos(shieldAngle) * (outerR + 1.5 * zoom);
      const p2y =
        igniterY +
        Math.sin(shieldAngle) * (outerR + 1.5 * zoom) * 0.7 -
        2.5 * zoom;
      const p3x = turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR;
      const p3y =
        igniterY +
        Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.7 -
        2 * zoom;
      const p4x = turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR;
      const p4y =
        igniterY + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.7;

      // Side/thickness face — outer edge extends downward
      const edgeVisible = shieldSide > -0.3;
      if (edgeVisible) {
        const sideGrad = ctx.createLinearGradient(
          p2x,
          p2y,
          p2x,
          p2y + shieldThickness,
        );
        sideGrad.addColorStop(0, `rgba(70, 55, 45, ${visibility})`);
        sideGrad.addColorStop(1, `rgba(50, 40, 35, ${visibility})`);
        ctx.fillStyle = sideGrad;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p3x, p3y + shieldThickness);
        ctx.lineTo(p2x, p2y + shieldThickness);
        ctx.lineTo(p1x, p1y + shieldThickness);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(100, 75, 60, ${visibility * 0.4})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();
      }

      // Front face
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        igniterY + Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.7,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        igniterY + Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.7,
      );

      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(140, 100, 80, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(110, 80, 65, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(80, 60, 50, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(90, 70, 55, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(100, 75, 60, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(80, 60, 50, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.lineTo(p4x, p4y);
      ctx.closePath();
      ctx.fill();

      // Heat-scorched edge
      ctx.strokeStyle = `rgba(180, 120, 80, ${visibility * 0.5})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();

      // Top edge highlight for depth
      ctx.strokeStyle = `rgba(200, 160, 120, ${visibility * 0.4})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.stroke();

      // Rivet with highlight
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 1.5 * zoom);
      const rivetY =
        igniterY +
        Math.sin(shieldAngle) * (outerR - 1.5 * zoom) * 0.7 -
        1.5 * zoom;
      ctx.fillStyle = `rgba(60, 50, 40, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(120, 100, 80, ${visibility * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        rivetX - 0.3 * zoom,
        rivetY - 0.3 * zoom,
        0.6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Inner igniter ring
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(turretX, igniterY, 6 * zoom, 4.5 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Nozzle mounting collar with depth ring
  const nozzleCollarX = turretX + cosR * 4 * zoom;
  const nozzleCollarY = igniterY + sinR * 2.5 * zoom;
  ctx.fillStyle = "#333338";
  ctx.beginPath();
  ctx.ellipse(
    nozzleCollarX,
    nozzleCollarY + 1.5 * zoom,
    5.5 * zoom,
    4 * zoom,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    nozzleCollarX,
    nozzleCollarY,
    5 * zoom,
    3.5 * zoom,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Pilot flame indicator
  const flameGlow = timeSinceFire < 300 ? 0.8 : 0.5 + Math.sin(time * 6) * 0.2;
  const flameGrad = ctx.createRadialGradient(
    turretX,
    igniterY,
    0,
    turretX,
    igniterY,
    3.5 * zoom,
  );
  flameGrad.addColorStop(0, `rgba(255, 200, 100, ${flameGlow})`);
  flameGrad.addColorStop(0.4, `rgba(255, 140, 50, ${flameGlow * 0.7})`);
  flameGrad.addColorStop(0.8, `rgba(255, 80, 20, ${flameGlow * 0.4})`);
  flameGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.arc(turretX, igniterY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === 3D ISOMETRIC FUEL TANK (LEFT) AND ARMOR PLATE (RIGHT) ===
  const isAttacking = timeSinceFire < 300;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 300 : 0;

  const tankAngle = rotation + Math.PI * 0.5;
  const tankDistance = 24 * zoom;
  const tankCenterX = turretX + Math.cos(tankAngle) * tankDistance;
  const tankCenterY =
    turretY - 6 * zoom + Math.sin(tankAngle) * tankDistance * 0.5;

  const plateAngle = rotation - Math.PI * 0.5;
  const plateDistance = 22 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY =
    turretY - 8 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;

  const facingPlayer = sinR > 0.2;
  const tankBehindAll = facingPlayer || Math.sin(tankAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;

  const tankSide = Math.sin(tankAngle);
  const tankVisible = true;
  const plateVisible = true;

  const towerId = tower.id;

  if (tankBehindAll && tankVisible) {
    draw3DFuelTank(
      ctx,
      tankCenterX,
      tankCenterY,
      tankAngle,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
    drawFuelFeedingTube(
      ctx,
      tankCenterX,
      tankCenterY,
      turretX,
      turretY - 8 * zoom,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      tankSide,
    );
  }
  if (plateBehindAll && plateVisible) {
    draw3DArmorShield(
      ctx,
      plateCenterX,
      plateCenterY,
      plateAngle,
      zoom,
      towerId,
      "small",
    );
  }

  if (!facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  if (!tankBehindAll && tankVisible) {
    draw3DFuelTank(
      ctx,
      tankCenterX,
      tankCenterY,
      tankAngle,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
    drawFuelFeedingTube(
      ctx,
      tankCenterX,
      tankCenterY,
      turretX,
      turretY - 8 * zoom,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      tankSide,
    );
  }
  if (!plateBehindAll && plateVisible) {
    draw3DArmorShield(
      ctx,
      plateCenterX,
      plateCenterY,
      plateAngle,
      zoom,
      towerId,
      "small",
    );
  }
}

// Helper for flamethrower nozzle — 3D hex prism barrel with heat gradient
function drawFlamethrowerNozzle(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
  recoilOffset: number = 0,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Isometric basis vectors
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  // Pitch
  const towerElevation = 25 * zoom;
  const baseLength = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, baseLength);
  const pitchRate = Math.sin(pitch) * 0.5;

  const totalLen = baseLength * (0.5 + foreshorten * 0.5);

  const axisPoint = (dist: number) => ({
    x: pivotX - fwdX * recoilOffset + fwdX * dist,
    y: pivotY - fwdY * recoilOffset + fwdY * dist + dist * pitchRate,
  });

  const isoOff = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat - vert,
  });

  // Barrel geometry
  const hexR = 5 * zoom;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  const hexVerts: { x: number; y: number }[] = [];
  for (let i = 0; i < hexSides; i++) {
    const a = (i / hexSides) * Math.PI * 2;
    hexVerts.push(isoOff(Math.cos(a) * hexR, Math.sin(a) * hexR));
  }

  const taperScale = 0.85;
  const taperVerts = hexVerts.map((v) => ({
    x: v.x * taperScale,
    y: v.y * taperScale,
  }));

  // Sections along barrel axis
  const startDist = 0;
  const hexLen = totalLen * 0.72;
  const muzzleLen = totalLen * 0.28;

  const hexBackPt = axisPoint(startDist);
  const hexFrontPt = axisPoint(startDist + hexLen);
  const muzzleBackPt = hexFrontPt;
  const muzzleEndPt = axisPoint(startDist + hexLen + muzzleLen);

  // Side normals for depth sorting and lighting
  const sideNormals: number[] = [];
  for (let i = 0; i < hexSides; i++) {
    const midA = ((i + 0.5) / hexSides) * Math.PI * 2;
    sideNormals.push(Math.cos(midA) * cosR + 0.5 * Math.sin(midA));
  }

  // Flared muzzle vertices
  const muzzleScale = 1.35;
  const muzzleVerts = taperVerts.map((v) => ({
    x: v.x * muzzleScale,
    y: v.y * muzzleScale,
  }));
  const muzzleTipVerts = taperVerts.map((v) => ({
    x: v.x * muzzleScale * 1.15,
    y: v.y * muzzleScale * 1.15,
  }));

  // Fuel line from pivot to barrel base
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(pivotX - 4 * zoom, pivotY);
  ctx.quadraticCurveTo(
    pivotX + fwdX * 6 * zoom,
    pivotY + fwdY * 6 * zoom - 4 * zoom,
    hexBackPt.x + fwdX * 4 * zoom,
    hexBackPt.y + fwdY * 4 * zoom,
  );
  ctx.stroke();

  // === BREECH HEX CAP ===
  {
    const capPt = facingFwd ? hexBackPt : hexFrontPt;
    const capVerts = facingFwd ? hexVerts : taperVerts;
    ctx.fillStyle = facingFwd ? "#5a5a62" : "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(capPt.x + capVerts[0].x, capPt.y + capVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(capPt.x + capVerts[i].x, capPt.y + capVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a3a48";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === HEXAGONAL BARREL BODY — depth-sorted side quads with heat gradient ===
  const sortedSides = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => sideNormals[a] - sideNormals[b],
  );

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];

    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);

    // Heat gradient: dark steel at base → scorched orange/red near tip
    const sGrad = ctx.createLinearGradient(
      hexBackPt.x + v0.x,
      hexBackPt.y + v0.y,
      hexFrontPt.x + tv0.x,
      hexFrontPt.y + tv0.y,
    );
    const baseRC = Math.floor(55 + lit * 60);
    const baseGC = Math.floor(55 + lit * 58);
    const baseBC = Math.floor(60 + lit * 62);
    const tipRC = Math.floor(100 + lit * 80);
    const tipGC = Math.floor(50 + lit * 40);
    const tipBC = Math.floor(30 + lit * 20);

    sGrad.addColorStop(0, `rgb(${baseRC}, ${baseGC}, ${baseBC})`);
    sGrad.addColorStop(
      0.55,
      `rgb(${baseRC + 8}, ${baseGC - 4}, ${baseBC - 8})`,
    );
    sGrad.addColorStop(0.8, `rgb(${tipRC}, ${tipGC}, ${tipBC})`);
    sGrad.addColorStop(1, `rgb(${tipRC + 15}, ${tipGC - 5}, ${tipBC - 10})`);

    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.moveTo(hexBackPt.x + v0.x, hexBackPt.y + v0.y);
    ctx.lineTo(hexBackPt.x + v1.x, hexBackPt.y + v1.y);
    ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
    ctx.lineTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    if (normal > 0.25) {
      ctx.strokeStyle = `rgba(180, 140, 120, ${(normal - 0.25) * 0.4})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
      ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
      ctx.stroke();
    }

    // Heat conduit glow on visible faces
    if (normal > -0.3) {
      const conduitGlow = 0.4 + Math.sin(time * 5) * 0.2;
      const midV0x = (v0.x + v1.x) * 0.5;
      const midV0y = (v0.y + v1.y) * 0.5;
      const midTV0x = (tv0.x + tv1.x) * 0.5;
      const midTV0y = (tv0.y + tv1.y) * 0.5;
      ctx.strokeStyle = `rgba(255, 80, 20, ${conduitGlow * Math.max(0.15, 0.3 + normal * 0.5)})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
      ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
      ctx.stroke();
    }
  }

  // === 3D HEX RING BANDS along barrel ===
  const bandCount = 3;
  const bandThick = 2.5 * zoom;
  for (let b = 0; b < bandCount; b++) {
    const t = (b + 1) / (bandCount + 1);
    const bandFrontPt = axisPoint(startDist + hexLen * t + bandThick * 0.5);
    const bandBackPt2 = axisPoint(startDist + hexLen * t - bandThick * 0.5);
    const bScale = 1 + (taperScale - 1) * t;
    const bVerts = hexVerts.map((v) => ({
      x: v.x * bScale * 1.08,
      y: v.y * bScale * 1.08,
    }));

    const bandSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, bb) => sideNormals[a] - sideNormals[bb],
    );

    for (const i of bandSorted) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const v0b = bVerts[i];
      const v1b = bVerts[ni];

      const bLit = Math.max(0.2, 0.3 + Math.max(0, normal) * 0.5);
      const gc = Math.floor(90 + bLit * 50);

      ctx.fillStyle = `rgb(${gc}, ${gc}, ${gc + 6})`;
      ctx.beginPath();
      ctx.moveTo(bandBackPt2.x + v0b.x, bandBackPt2.y + v0b.y);
      ctx.lineTo(bandBackPt2.x + v1b.x, bandBackPt2.y + v1b.y);
      ctx.lineTo(bandFrontPt.x + v1b.x, bandFrontPt.y + v1b.y);
      ctx.lineTo(bandFrontPt.x + v0b.x, bandFrontPt.y + v0b.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, normal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    // Band hex cap (visible face)
    const capPt2 = facingFwd ? bandFrontPt : bandBackPt2;
    ctx.strokeStyle = "rgba(140, 140, 155, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (
        sideNormals[i] < -0.15 &&
        sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
      )
        continue;
      ctx.moveTo(capPt2.x + bVerts[i].x, capPt2.y + bVerts[i].y);
      ctx.lineTo(capPt2.x + bVerts[ni].x, capPt2.y + bVerts[ni].y);
    }
    ctx.stroke();
  }

  // === BARREL-MUZZLE JUNCTION CAP ===
  {
    const jCapPt = facingFwd ? hexFrontPt : hexBackPt;
    const jCapVerts = facingFwd ? taperVerts : hexVerts;
    ctx.fillStyle = facingFwd ? "#505058" : "#5a5a62";
    ctx.beginPath();
    ctx.moveTo(jCapPt.x + jCapVerts[0].x, jCapPt.y + jCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(jCapPt.x + jCapVerts[i].x, jCapPt.y + jCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4e4e5c";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  // === MUZZLE BACK CAP ===
  {
    const mbCapPt = facingFwd ? muzzleBackPt : muzzleEndPt;
    const mbCapVerts = facingFwd ? muzzleVerts : muzzleTipVerts;
    ctx.fillStyle = facingFwd ? "#484850" : "#404048";
    ctx.beginPath();
    ctx.moveTo(mbCapPt.x + mbCapVerts[0].x, mbCapPt.y + mbCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(mbCapPt.x + mbCapVerts[i].x, mbCapPt.y + mbCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
  }

  // === FLARED HEXAGONAL MUZZLE — depth-sorted with heat coloring ===
  const muzzleSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
    (a, b) => sideNormals[a] - sideNormals[b],
  );

  for (const i of muzzleSorted) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];

    const mv0 = muzzleVerts[i];
    const mv1 = muzzleVerts[ni];
    const mtv0 = muzzleTipVerts[i];
    const mtv1 = muzzleTipVerts[ni];

    const mLit = Math.max(0.1, 0.18 + Math.max(0, normal) * 0.5);
    const mr = Math.floor(60 + mLit * 70);
    const mg = Math.floor(35 + mLit * 30);
    const mb = Math.floor(25 + mLit * 20);
    ctx.fillStyle = `rgb(${mr}, ${mg}, ${mb})`;

    ctx.beginPath();
    ctx.moveTo(muzzleBackPt.x + mv0.x, muzzleBackPt.y + mv0.y);
    ctx.lineTo(muzzleBackPt.x + mv1.x, muzzleBackPt.y + mv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv1.x, muzzleEndPt.y + mtv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv0.x, muzzleEndPt.y + mtv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(20, 20, 30, ${0.25 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Heat glow lines on visible muzzle faces
    if (normal > -0.1) {
      const heatGlow = 0.15 + Math.sin(time * 4) * 0.08;
      ctx.strokeStyle = `rgba(255, 80, 20, ${heatGlow * Math.max(0.2, 0.4 + normal * 0.4)})`;
      ctx.lineWidth = 1.2 * zoom;
      const midMV0x = (mv0.x + mv1.x) * 0.5;
      const midMV0y = (mv0.y + mv1.y) * 0.5;
      const midMTV0x = (mtv0.x + mtv1.x) * 0.5;
      const midMTV0y = (mtv0.y + mtv1.y) * 0.5;
      ctx.beginPath();
      ctx.moveTo(muzzleBackPt.x + midMV0x, muzzleBackPt.y + midMV0y);
      ctx.lineTo(muzzleEndPt.x + midMTV0x, muzzleEndPt.y + midMTV0y);
      ctx.stroke();
    }
  }

  // === MUZZLE FRONT HEX CAP with heat glow ===
  {
    const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
    const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;
    ctx.fillStyle = facingFwd ? "#4a3a30" : "#3a3035";
    ctx.beginPath();
    ctx.moveTo(mCapPt.x + mCapVerts[0].x, mCapPt.y + mCapVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(mCapPt.x + mCapVerts[i].x, mCapPt.y + mCapVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 80, 30, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // Orange hex rings on muzzle
  for (let r = 0; r < 2; r++) {
    const mt = 0.3 + r * 0.4;
    const ringPt = axisPoint(startDist + hexLen + muzzleLen * mt);
    const ringScale = 1 + (1.15 - 1) * mt;
    const rVerts = muzzleVerts.map((v) => ({
      x: v.x * ringScale,
      y: v.y * ringScale,
    }));
    ctx.strokeStyle = "rgba(255, 100, 20, 0.65)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ringPt.x + rVerts[0].x, ringPt.y + rVerts[0].y);
    for (let vi = 1; vi < hexSides; vi++)
      ctx.lineTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
    ctx.closePath();
    ctx.stroke();
  }

  // Pilot light at nozzle tip
  const pilotGlow = 0.7 + Math.sin(time * 10) * 0.3;
  ctx.fillStyle = `rgba(0, 180, 255, ${pilotGlow})`;
  ctx.shadowColor = "#00aaff";
  ctx.shadowBlur = 4 * zoom;
  const pilotPt = axisPoint(startDist + hexLen + muzzleLen * 0.8);
  const pilotOffX = perpX * hexR * taperScale * muzzleScale * 0.5;
  const pilotOffY = perpY * hexR * taperScale * muzzleScale * 0.5;
  ctx.beginPath();
  ctx.arc(
    pilotPt.x + pilotOffX,
    pilotPt.y + pilotOffY,
    2.5 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flame effect along barrel axis
  const timeSinceFire = Date.now() - tower.lastAttack;
  if (timeSinceFire < 500) {
    const flameIntensity = 1 - timeSinceFire / 500;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 25 * zoom * flameIntensity;

    for (let i = 0; i < 10; i++) {
      const flameT = totalLen + i * totalLen * 0.12;
      const flamePt = axisPoint(flameT);
      const wobble = Math.sin(time * 35 + i * 0.8) * (2 + i * 0.4) * zoom;
      const flameSize = (16 - i * 1.2) * zoom * flameIntensity;

      const flameGrad2 = ctx.createRadialGradient(
        flamePt.x,
        flamePt.y + wobble,
        0,
        flamePt.x,
        flamePt.y + wobble,
        flameSize,
      );
      flameGrad2.addColorStop(0, `rgba(255, 255, 180, ${flameIntensity})`);
      flameGrad2.addColorStop(
        0.15,
        `rgba(255, 220, 80, ${flameIntensity * 0.95})`,
      );
      flameGrad2.addColorStop(
        0.4,
        `rgba(255, 120, 0, ${flameIntensity * 0.75})`,
      );
      flameGrad2.addColorStop(
        0.7,
        `rgba(220, 60, 0, ${flameIntensity * 0.45})`,
      );
      flameGrad2.addColorStop(1, "rgba(120, 30, 0, 0)");
      ctx.fillStyle = flameGrad2;
      ctx.beginPath();
      ctx.arc(flamePt.x, flamePt.y + wobble, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

// Compute parameter angles where a rotated ellipse crosses its center Y.
// Returns [backStart, backEnd, frontStart, frontEnd] for splitting into
// screen-space back (y < center, further from viewer) and front (y > center) arcs.
function getEllipseHalfBounds(
  rx: number,
  ry: number,
  rotation: number,
): [number, number, number, number] {
  const crossT = Math.atan2(
    -rx * Math.sin(rotation),
    ry * Math.cos(rotation),
  );
  const testT = crossT + 0.01;
  const testDy =
    rx * Math.cos(testT) * Math.sin(rotation) +
    ry * Math.sin(testT) * Math.cos(rotation);
  if (testDy < 0) {
    return [crossT, crossT + Math.PI, crossT + Math.PI, crossT + Math.PI * 2];
  }
  return [
    crossT + Math.PI,
    crossT + Math.PI * 2,
    crossT,
    crossT + Math.PI,
  ];
}

function drawLibraryOrbitalEffects(
  ctx: CanvasRenderingContext2D,
  drawFront: boolean,
  screenPos: Position,
  topY: number,
  spireHeight: number,
  baseHeight: number,
  lowerBodyHeight: number,
  mainColor: string,
  glowColor: string,
  zoom: number,
  time: number,
  attackPulse: number,
  shakeY: number,
  tower: Tower,
) {
  const sX = screenPos.x;

  // Floating arcane rings (split into back/front arcs)
  const ringGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.strokeStyle = `${mainColor} ${ringGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let ring = 0; ring < 3; ring++) {
    const ringY = topY - 10 - spireHeight * (0.4 + ring * 0.2);
    const ringSize = (9 - ring * 2) * zoom;
    const ringRotation = time * 2 + ring * 0.5;
    const [bS, bE, fS, fE] = getEllipseHalfBounds(
      ringSize,
      ringSize * 0.4,
      ringRotation,
    );
    ctx.beginPath();
    ctx.ellipse(
      sX,
      ringY,
      ringSize,
      ringSize * 0.4,
      ringRotation,
      drawFront ? fS : bS,
      drawFront ? fE : bE,
    );
    ctx.stroke();
  }

  // Level 2+: Floating ancient tomes (isometric orbit with depth sorting)
  if (tower.level >= 2) {
    for (let i = 0; i < tower.level; i++) {
      const bookAngle = time * 1.0 + i * ((Math.PI * 2) / tower.level);
      if ((Math.sin(bookAngle) >= 0) !== drawFront) continue;

      const bookRadius = 30 * zoom;
      const bookX = sX + Math.cos(bookAngle) * bookRadius;
      const bookOrbitY =
        topY - 20 * zoom + Math.sin(bookAngle) * bookRadius * 0.35;
      const bookFloat = Math.sin(time * 3 + i) * 3 * zoom;
      const pageFlutter = Math.sin(time * 6 + i * 1.7) * 0.3;

      ctx.fillStyle = `${mainColor} 0.25)`;
      ctx.beginPath();
      ctx.ellipse(
        bookX,
        bookOrbitY + bookFloat + 3 * zoom,
        9 * zoom,
        3.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.save();
      ctx.translate(bookX, bookOrbitY + bookFloat);
      ctx.rotate(pageFlutter * 0.15);

      const bookCoverColor =
        i % 3 === 0 ? "#6a4a3a" : i % 3 === 1 ? "#4a5a6a" : "#5a4a6a";
      ctx.fillStyle = bookCoverColor;
      ctx.fillRect(-8 * zoom, -6 * zoom, 16 * zoom, 12 * zoom);

      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(-8 * zoom, -6 * zoom, 2 * zoom, 12 * zoom);

      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-7.5 * zoom, -4 * zoom, 1 * zoom, 8 * zoom);

      ctx.fillStyle = "#e8dcc8";
      const pageOffset = Math.sin(time * 8 + i * 2) * 1 * zoom;
      ctx.fillRect(
        8 * zoom - 1 * zoom,
        -5 * zoom + pageOffset,
        1 * zoom,
        10 * zoom,
      );

      ctx.fillStyle = `rgba(${glowColor}, ${0.6 + Math.sin(time * 5 + i) * 0.2})`;
      ctx.fillRect(-5 * zoom, -5 * zoom, 12 * zoom, 10 * zoom);

      ctx.fillStyle = "#3a2a1a";
      ctx.font = `${6 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(["ᚠ", "ᚢ", "ᚦ"][i % 3], 1 * zoom, 2 * zoom);

      for (let p = 0; p < 2; p++) {
        const pagePhase = (time * 2 + i * 0.7 + p * 0.5) % 2;
        if (pagePhase < 1) {
          const pageLift = pagePhase * 12 * zoom;
          const pageDrift = Math.sin(pagePhase * Math.PI) * 6 * zoom;
          const pageAlpha = 1 - pagePhase;
          ctx.fillStyle = `rgba(230, 220, 200, ${pageAlpha * 0.7})`;
          ctx.save();
          ctx.translate(pageDrift, -pageLift);
          ctx.rotate(pagePhase * 1.5 + p);
          ctx.fillRect(-3 * zoom, -2 * zoom, 6 * zoom, 4 * zoom);
          ctx.restore();
        }
      }

      ctx.restore();

      ctx.fillStyle = `rgba(${glowColor}, ${0.3 + Math.sin(time * 4 + i) * 0.15})`;
      for (let trail = 0; trail < 3; trail++) {
        const trailAngle = bookAngle - (trail + 1) * 0.15;
        const trailX = sX + Math.cos(trailAngle) * bookRadius;
        const trailY =
          topY - 20 * zoom + Math.sin(trailAngle) * bookRadius * 0.35;
        const trailSize = (2 - trail * 0.5) * zoom;
        ctx.globalAlpha = 0.3 - trail * 0.08;
        ctx.beginPath();
        ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Knowledge orbs / wisps (depth-sorted by orbit angle)
    for (let orb = 0; orb < 5; orb++) {
      const orbAngle = time * 0.6 + (orb * (Math.PI * 2)) / 5;
      if ((Math.sin(orbAngle) >= 0) !== drawFront) continue;

      const orbVertical = Math.sin(time * 1.5 + orb * 1.2) * 20 * zoom;
      const orbRadius = (25 + Math.sin(time * 0.8 + orb) * 10) * zoom;
      const orbX = sX + Math.cos(orbAngle) * orbRadius;
      const orbY = screenPos.y - lowerBodyHeight * zoom * 0.4 + orbVertical;
      const orbAlpha = 0.3 + Math.sin(time * 3 + orb * 0.8) * 0.15;

      ctx.fillStyle = `rgba(${glowColor}, ${orbAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${glowColor}, ${orbAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let wt = 1; wt <= 3; wt++) {
        const wtAngle = orbAngle - wt * 0.08;
        const wtX = sX + Math.cos(wtAngle) * orbRadius;
        const wtY =
          screenPos.y -
          lowerBodyHeight * zoom * 0.4 +
          Math.sin(time * 1.5 + orb * 1.2 - wt * 0.05) * 20 * zoom;
        ctx.fillStyle = `rgba(${glowColor}, ${orbAlpha * (1 - wt * 0.3)})`;
        ctx.beginPath();
        ctx.arc(wtX, wtY, (1.5 - wt * 0.3) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Level 3+: Runic barrier circle (split arcs) + nodes + crystal shards
  if (tower.level >= 3) {
    const barrierGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.3;
    const barrierRotation = time * 0.3;
    const barrierRX = 22 * zoom;
    const barrierRY = 11 * zoom;

    ctx.strokeStyle = `rgba(${glowColor}, ${barrierGlow})`;
    ctx.lineWidth = 2 * zoom;
    const [bbS, bbE, bfS, bfE] = getEllipseHalfBounds(
      barrierRX,
      barrierRY,
      barrierRotation,
    );
    ctx.beginPath();
    ctx.ellipse(
      sX,
      topY - 15 * zoom,
      barrierRX,
      barrierRY,
      barrierRotation,
      drawFront ? bfS : bbS,
      drawFront ? bfE : bbE,
    );
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const nodeAngle = (i / 6) * Math.PI * 2 + time * 1.2;
      if ((Math.sin(nodeAngle) >= 0) !== drawFront) continue;

      const nodeX = sX + Math.cos(nodeAngle) * 24 * zoom;
      const nodeY = topY - 15 * zoom + Math.sin(nodeAngle) * 12 * zoom;

      ctx.fillStyle = `rgba(${glowColor}, ${barrierGlow + 0.2})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    for (let i = 0; i < 4; i++) {
      const crystalAngle = time * 0.8 + (i / 4) * Math.PI * 2;
      if ((Math.sin(crystalAngle) >= 0) !== drawFront) continue;

      const crystalRadius = 35 + Math.sin(time * 2 + i) * 5;
      const crystalX = sX + Math.cos(crystalAngle) * crystalRadius * zoom;
      const crystalY =
        topY - 30 * zoom + Math.sin(crystalAngle) * crystalRadius * 0.3 * zoom;
      const crystalFloat = Math.sin(time * 3 + i * 1.5) * 4 * zoom;

      ctx.fillStyle = `rgba(${glowColor}, ${0.3 + Math.sin(time * 4 + i) * 0.15})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(crystalX, crystalY + crystalFloat - 8 * zoom);
      ctx.lineTo(crystalX - 4 * zoom, crystalY + crystalFloat);
      ctx.lineTo(crystalX, crystalY + crystalFloat + 5 * zoom);
      ctx.lineTo(crystalX + 4 * zoom, crystalY + crystalFloat);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Level 3 energy amplifier rings (split arcs + nodes)
  if (tower.level === 3 && !tower.upgrade) {
    const ampRingGlow = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
    const ampRotation = time * 0.5;
    const ampRX = 20 * zoom;
    const ampRY = 10 * zoom;

    ctx.strokeStyle = `${mainColor} ${ampRingGlow})`;
    ctx.lineWidth = 2.5 * zoom;
    const [abS, abE, afS, afE] = getEllipseHalfBounds(
      ampRX,
      ampRY,
      ampRotation,
    );
    ctx.beginPath();
    ctx.ellipse(
      sX,
      topY - 18 * zoom,
      ampRX,
      ampRY,
      ampRotation,
      drawFront ? afS : abS,
      drawFront ? afE : abE,
    );
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
      const runeAngle = (i / 5) * Math.PI * 2 + time * 1.5;
      if ((Math.sin(runeAngle) >= 0) !== drawFront) continue;

      const rx = sX + Math.cos(runeAngle) * 24 * zoom;
      const ry = topY - 18 * zoom + Math.sin(runeAngle) * 12 * zoom;

      ctx.fillStyle = `rgba(220, 180, 255, ${ampRingGlow})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Level 4B: Orbiting crystals + dashed ring (depth-sorted)
  if (tower.level === 4 && tower.upgrade === "B") {
    for (let i = 0; i < 6; i++) {
      const crystalAngle = (i * Math.PI) / 3 + time * 0.5;
      if ((Math.sin(crystalAngle) >= 0) !== drawFront) continue;

      const cx = sX + Math.cos(crystalAngle) * 25 * zoom;
      const cy = topY - 10 * zoom + Math.sin(crystalAngle) * 12 * zoom;
      const crystalSize = (8 + Math.sin(time * 2 + i) * 3) * zoom;

      ctx.fillStyle = "rgba(100, 200, 255, 0.3)";
      ctx.shadowColor = "#66ddff";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        crystalSize * 0.8,
        crystalSize * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(150, 230, 255, 0.9)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - crystalSize);
      ctx.lineTo(cx + crystalSize * 0.5, cy);
      ctx.lineTo(cx, cy + crystalSize * 0.7);
      ctx.lineTo(cx - crystalSize * 0.5, cy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(
      sX,
      screenPos.y + shakeY,
      40 * zoom,
      20 * zoom,
      0,
      drawFront ? 0 : Math.PI,
      drawFront ? Math.PI : Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Purple energy field around tower (split arc)
  const auraSize = 30 + Math.sin(time * 3) * 5;
  ctx.strokeStyle = `${mainColor} ${0.35 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    sX,
    screenPos.y + shakeY - baseHeight * zoom * 0.3,
    auraSize * zoom,
    auraSize * zoom * 0.5,
    0,
    drawFront ? 0 : Math.PI,
    drawFront ? Math.PI : Math.PI * 2,
  );
  ctx.stroke();
}

// LIBRARY TOWER - Kingdom Fantasy Gothic Design with Mystical Elements
function renderLibraryTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 30 + tower.level * 10;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;

  let mainColor = "rgba(180, 100, 255,";
  let glowColor = "180, 100, 255";

  if (tower.level > 3 && tower.upgrade === "A") {
    mainColor = "rgba(255, 150, 100,";
    glowColor = "255, 150, 100";
  } else if (tower.level > 3 && tower.upgrade === "B") {
    mainColor = "rgba(100, 150, 255,";
    glowColor = "100, 150, 255";
  }

  // Attack animation - piston mechanism
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let pistonOffset = 0;
  let groundShockwave = 0;
  let groundCrackPhase = 0;
  let impactFlash = 0;

  if (timeSinceFire < 500) {
    const attackPhase = timeSinceFire / 500;
    attackPulse = (1 - attackPhase) * 0.4;

    if (attackPhase < 0.2) {
      pistonOffset = (-attackPhase / 0.2) * 12 * zoom;
    } else if (attackPhase < 0.35) {
      const slamPhase = (attackPhase - 0.2) / 0.15;
      pistonOffset = -12 * zoom * (1 - slamPhase * slamPhase);
      if (slamPhase > 0.8) {
        impactFlash = (slamPhase - 0.8) / 0.2;
      }
    } else if (attackPhase < 0.5) {
      const compressPhase = (attackPhase - 0.35) / 0.15;
      pistonOffset = 4 * zoom * Math.sin(compressPhase * Math.PI);
      impactFlash = 1 - compressPhase;
    } else {
      pistonOffset = 0;
    }

    if (attackPhase > 0.3) {
      groundShockwave = (attackPhase - 0.3) / 0.7;
      groundCrackPhase = Math.min(1, (attackPhase - 0.3) / 0.5);
    }
  }

  const shakeY = 0;

  // ========== MYSTICAL GROUND FOUNDATION ==========
  // Outer mystical platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 14 * zoom,
    baseWidth + 18,
    baseWidth + 18,
    4,
    {
      top: "#4a3a2a",
      left: "#3a2a1a",
      right: "#2a1a0a",
      leftBack: "#5a4a3a",
      rightBack: "#4a3a2a",
    },
    zoom,
  );

  // Mystical rune circle on ground
  const groundRuneGlow = 0.25 + Math.sin(time * 2) * 0.12 + attackPulse * 0.3;
  ctx.strokeStyle = `rgba(${glowColor}, ${groundRuneGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 12 * zoom,
    (baseWidth + 14) * zoom * 0.4,
    (baseWidth + 14) * zoom * 0.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Ground rune symbols
  const groundRunes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"];
  ctx.fillStyle = `rgba(${glowColor}, ${groundRuneGlow + 0.1})`;
  ctx.font = `${7 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const runeAngle = (i / 6) * Math.PI * 2 + time * 0.15;
    const runeX =
      screenPos.x + Math.cos(runeAngle) * (baseWidth + 10) * zoom * 0.35;
    const runeY =
      screenPos.y +
      12 * zoom +
      Math.sin(runeAngle) * (baseWidth + 10) * zoom * 0.17;
    ctx.fillText(groundRunes[i], runeX, runeY);
  }

  // Main foundation platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    8,
    {
      top: "#5a4a3a",
      left: "#4a3a2a",
      right: "#3a2a1a",
      leftBack: "#6a5a4a",
      rightBack: "#5a4a3a",
    },
    zoom,
  );

  // Foundation corner pillars
  for (const corner of [0, 1, 2, 3]) {
    const cx =
      screenPos.x + (corner < 2 ? -1 : 1) * (baseWidth + 8) * zoom * 0.4;
    const cy =
      screenPos.y +
      6 * zoom +
      (corner % 2 === 0 ? -1 : 1) * (baseWidth + 8) * zoom * 0.15;

    // Pillar base
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2 * zoom, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pillar shaft
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(cx - 2.5 * zoom, cy - 10 * zoom, 5 * zoom, 12 * zoom);

    // Pillar cap
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14 * zoom);
    ctx.lineTo(cx - 4 * zoom, cy - 10 * zoom);
    ctx.lineTo(cx + 4 * zoom, cy - 10 * zoom);
    ctx.closePath();
    ctx.fill();

    // Pillar rune glow
    const pillarGlow =
      0.4 + Math.sin(time * 3 + corner) * 0.2 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${pillarGlow})`;
    ctx.beginPath();
    ctx.arc(cx, cy - 6 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lower tower body
  const lowerBodyHeight = baseHeight * 0.5;
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    lowerBodyHeight,
    {
      top: "#6a5a4a",
      left: "#5a4a3a",
      right: "#4a3a2a",
      leftBack: "#7a6a5a",
      rightBack: "#6a5a4a",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring) ==========
  const libBalY = screenPos.y + 2 * zoom;
  const libBalRX = w * 1.05;
  const libBalRY = d * 1.05;
  const libBalH = 5 * zoom;
  const libBalSegs = 32;
  const libBalPosts = 16;

  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    libBalY,
    libBalRX,
    libBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    libBalY - libBalH,
    libBalRX,
    libBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < libBalPosts; bp++) {
    const pa = (bp / libBalPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * libBalRX;
    const py = libBalY + Math.sin(pa) * libBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - libBalH);
    ctx.stroke();
  }
  for (let i = 0; i < libBalSegs; i++) {
    const a0 = (i / libBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / libBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * libBalRX;
    const y0b = libBalY + Math.sin(a0) * libBalRY;
    const x1 = screenPos.x + Math.cos(a1) * libBalRX;
    const y1b = libBalY + Math.sin(a1) * libBalRY;
    ctx.fillStyle = `rgba(90, 74, 58, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - libBalH);
    ctx.lineTo(x0, y0b - libBalH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, libBalY, libBalRX, libBalRY, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    libBalY - libBalH,
    libBalRX,
    libBalRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < libBalPosts; bp++) {
    const pa = (bp / libBalPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * libBalRX;
    const py = libBalY + Math.sin(pa) * libBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - libBalH);
    ctx.stroke();
  }
  for (let i = 0; i < libBalSegs; i++) {
    const a0 = (i / libBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / libBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * libBalRX;
    const y0b = libBalY + Math.sin(a0) * libBalRY;
    const x1 = screenPos.x + Math.cos(a1) * libBalRX;
    const y1b = libBalY + Math.sin(a1) * libBalRY;
    ctx.fillStyle = `rgba(90, 74, 58, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - libBalH);
    ctx.lineTo(x0, y0b - libBalH);
    ctx.closePath();
    ctx.fill();
  }

  // Stone block pattern on lower body with mortar joints
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 5; row++) {
    const blockY = screenPos.y - row * lowerBodyHeight * zoom * 0.18;

    // Horizontal mortar lines (left face)
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x - w * 0.85, blockY - d * 0.55);
    ctx.stroke();

    // Horizontal mortar lines (right face)
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x + w * 0.85, blockY - d * 0.55);
    ctx.stroke();

    // Vertical mortar joints (staggered per row for brick pattern)
    const stagger = row % 2 === 0 ? 0 : 0.15;
    for (let col = 0; col < 3; col++) {
      const t = 0.25 + col * 0.25 + stagger;
      if (t > 0.95) continue;
      const nextBlockY =
        screenPos.y - (row + 1) * lowerBodyHeight * zoom * 0.18;

      // Left face vertical joints
      const ljX = screenPos.x - w * (0.1 + t * 0.75);
      const ljY1 = blockY + d * (0.15 - t * 0.7);
      const ljY2 = nextBlockY + d * (0.15 - t * 0.7);
      ctx.beginPath();
      ctx.moveTo(ljX, ljY1);
      ctx.lineTo(ljX, ljY2);
      ctx.stroke();

      // Right face vertical joints
      const rjX = screenPos.x + w * (0.1 + t * 0.75);
      ctx.beginPath();
      ctx.moveTo(rjX, ljY1);
      ctx.lineTo(rjX, ljY2);
      ctx.stroke();
    }
  }

  // Weathered stone texture highlights
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 12; i++) {
    const stoneX = screenPos.x + ((((i * 7 + 3) % 11) / 11) * 2 - 1) * w * 0.7;
    const stoneY =
      screenPos.y - ((i * 13 + 5) % 9) * lowerBodyHeight * zoom * 0.1;
    ctx.fillStyle = i % 2 === 0 ? "#8a7a6a" : "#4a3a2a";
    ctx.fillRect(stoneX - 2 * zoom, stoneY - 1.5 * zoom, 4 * zoom, 3 * zoom);
  }
  ctx.globalAlpha = 1.0;

  // Mystical wall runes on lower body
  const wallRuneGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.4;
  ctx.fillStyle = `rgba(${glowColor}, ${wallRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 5 * zoom;
  ctx.font = `${8 * zoom}px serif`;
  const wallRunes = ["ᛟ", "ᛞ", "ᛒ"];
  for (let i = 0; i < 3; i++) {
    const runeX = screenPos.x + (i - 1) * 10 * zoom;
    const runeY = screenPos.y - lowerBodyHeight * zoom * 0.3;
    ctx.fillText(wallRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Wall sconces with mystical light chains
  const sconcePosns: { x: number; y: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? -1 : 1;
    const idx = i % 2;
    const scX = screenPos.x + side * w * (0.45 + idx * 0.3);
    const scY = screenPos.y - lowerBodyHeight * zoom * (0.2 + idx * 0.35);
    sconcePosns.push({ x: scX, y: scY });

    // Sconce bracket
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(scX, scY);
    ctx.lineTo(scX + side * 4 * zoom, scY - 2 * zoom);
    ctx.lineTo(scX + side * 4 * zoom, scY + 3 * zoom);
    ctx.closePath();
    ctx.fill();

    // Sconce cup
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(
      scX + side * 4 * zoom,
      scY,
      2.5 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Flame glow on sconce
    const flameFlicker =
      0.5 +
      Math.sin(time * 8 + i * 2.3) * 0.2 +
      Math.sin(time * 12.7 + i * 1.1) * 0.1;
    ctx.fillStyle = `rgba(255, 200, 100, ${flameFlicker})`;
    ctx.shadowColor = "rgba(255, 180, 80, 0.6)";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      scX + side * 4 * zoom,
      scY - 3 * zoom,
      2 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Mystical chains of light connecting sconces on each side
  for (let side = 0; side < 2; side++) {
    const s0 = sconcePosns[side * 2];
    const s1 = sconcePosns[side * 2 + 1];
    const chainGlow =
      0.25 + Math.sin(time * 3 + side) * 0.15 + attackPulse * 0.3;
    ctx.strokeStyle = `rgba(${glowColor}, ${chainGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.setLineDash([3 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.moveTo(s0.x + (side === 0 ? -1 : 1) * 4 * zoom, s0.y);
    const midX = (s0.x + s1.x) / 2 + (side === 0 ? -1 : 1) * 6 * zoom;
    const midY =
      (s0.y + s1.y) / 2 + 8 * zoom + Math.sin(time * 2 + side) * 2 * zoom;
    ctx.quadraticCurveTo(
      midX,
      midY,
      s1.x + (side === 0 ? -1 : 1) * 4 * zoom,
      s1.y,
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Travelling spark along chain
    const sparkT = (time * 1.5 + side * 0.5) % 1;
    const sparkX =
      s0.x * (1 - sparkT) * (1 - sparkT) +
      midX * 2 * sparkT * (1 - sparkT) +
      s1.x * sparkT * sparkT;
    const sparkY =
      s0.y * (1 - sparkT) * (1 - sparkT) +
      midY * 2 * sparkT * (1 - sparkT) +
      s1.y * sparkT * sparkT;
    ctx.fillStyle = `rgba(${glowColor}, ${0.7 + Math.sin(time * 10) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Rose window (circular stained glass) on front face
  const roseY = screenPos.y - lowerBodyHeight * zoom * 0.65;
  const roseRadius = 7 * zoom;
  const roseGlow = 0.5 + Math.sin(time * 1.8) * 0.2 + attackPulse * 0.3;

  // Rose window stone frame
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 1.5 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Rose window glass background
  ctx.fillStyle = `rgba(${glowColor}, ${roseGlow * 0.6})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Rose window tracery (Gothic pattern)
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 0.8 * zoom;
  for (let petal = 0; petal < 8; petal++) {
    const petalAngle = (petal / 8) * Math.PI * 2;

    // Radial spoke
    ctx.beginPath();
    ctx.moveTo(screenPos.x, roseY);
    ctx.lineTo(
      screenPos.x + Math.cos(petalAngle) * roseRadius,
      roseY + Math.sin(petalAngle) * roseRadius,
    );
    ctx.stroke();

    // Inner trefoil arcs
    const midAngle = petalAngle + Math.PI / 8;
    const innerR = roseRadius * 0.55;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + Math.cos(midAngle) * innerR * 0.5,
      roseY + Math.sin(midAngle) * innerR * 0.5,
      innerR * 0.4,
      midAngle - Math.PI * 0.5,
      midAngle + Math.PI * 0.5,
    );
    ctx.stroke();
  }

  // Rose window inner ring
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Rose window center gem
  ctx.fillStyle = `rgba(255, 220, 255, ${roseGlow})`;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Sequentially appearing/fading arcane glyphs on walls
  const glyphSymbols = ["⊕", "⊗", "⊙", "◈", "◇", "△"];
  ctx.font = `${6 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const glyphCycle = (time * 0.4 + i * 0.6) % (glyphSymbols.length * 0.6);
    const glyphFade =
      Math.max(0, 1 - Math.abs(glyphCycle - i * 0.6) * 2.5) *
      (0.6 + attackPulse * 0.4);
    if (glyphFade <= 0) continue;

    const side = i < 3 ? -1 : 1;
    const idx = i % 3;
    const gx = screenPos.x + side * (w * 0.3 + idx * w * 0.2);
    const gy = screenPos.y - lowerBodyHeight * zoom * (0.15 + idx * 0.22);

    ctx.fillStyle = `rgba(${glowColor}, ${glyphFade})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom * glyphFade;
    ctx.fillText(glyphSymbols[i], gx, gy);
  }
  ctx.shadowBlur = 0;

  // Entrance doorway with flickering torches
  const entranceX = screenPos.x;
  const entranceY = screenPos.y - 2 * zoom;
  const doorW = 6 * zoom;
  const doorH = 12 * zoom;

  // Door frame (Gothic pointed arch)
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW, entranceY);
  ctx.lineTo(entranceX - doorW, entranceY - doorH * 0.6);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.2,
    entranceX + doorW,
    entranceY - doorH * 0.6,
  );
  ctx.lineTo(entranceX + doorW, entranceY);
  ctx.closePath();
  ctx.fill();

  // Warm interior glow through door
  const doorGlow = 0.4 + Math.sin(time * 6) * 0.1 + Math.sin(time * 9.3) * 0.08;
  const doorGrad = ctx.createRadialGradient(
    entranceX,
    entranceY - doorH * 0.4,
    0,
    entranceX,
    entranceY - doorH * 0.4,
    doorW * 1.2,
  );
  doorGrad.addColorStop(0, `rgba(255, 200, 120, ${doorGlow})`);
  doorGrad.addColorStop(0.6, `rgba(255, 160, 60, ${doorGlow * 0.5})`);
  doorGrad.addColorStop(1, `rgba(200, 100, 30, 0)`);
  ctx.fillStyle = doorGrad;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW + 1.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW + 1.5 * zoom, entranceY - doorH * 0.55);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.1,
    entranceX + doorW - 1.5 * zoom,
    entranceY - doorH * 0.55,
  );
  ctx.lineTo(entranceX + doorW - 1.5 * zoom, entranceY);
  ctx.closePath();
  ctx.fill();

  // Torch brackets on each side of entrance
  for (const tSide of [-1, 1]) {
    const torchX = entranceX + tSide * (doorW + 3 * zoom);
    const torchY = entranceY - doorH * 0.5;

    // Bracket
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(torchX - 1 * zoom, torchY, 2 * zoom, 6 * zoom);

    // Torch cup
    ctx.fillStyle = "#6a5a3a";
    ctx.beginPath();
    ctx.moveTo(torchX - 2 * zoom, torchY);
    ctx.lineTo(torchX + 2 * zoom, torchY);
    ctx.lineTo(torchX + 1.5 * zoom, torchY - 2 * zoom);
    ctx.lineTo(torchX - 1.5 * zoom, torchY - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Animated flame
    const fl1 = Math.sin(time * 10 + tSide * 3) * 0.15;
    const fl2 = Math.sin(time * 14 + tSide * 5) * 0.1;
    const flameH = (5 + Math.sin(time * 8 + tSide) * 1.5) * zoom;

    ctx.fillStyle = `rgba(255, 220, 100, ${0.8 + fl1})`;
    ctx.shadowColor = "rgba(255, 180, 50, 0.7)";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX - 2 * zoom, torchY - 2 * zoom);
    ctx.quadraticCurveTo(
      torchX + fl2 * zoom * 4,
      torchY - flameH,
      torchX,
      torchY - flameH - 2 * zoom,
    );
    ctx.quadraticCurveTo(
      torchX - fl2 * zoom * 3,
      torchY - flameH,
      torchX + 2 * zoom,
      torchY - 2 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Inner flame (hotter core)
    ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + fl2})`;
    ctx.beginPath();
    ctx.moveTo(torchX - 1 * zoom, torchY - 2.5 * zoom);
    ctx.quadraticCurveTo(
      torchX,
      torchY - flameH * 0.6,
      torchX,
      torchY - flameH * 0.7,
    );
    ctx.quadraticCurveTo(
      torchX,
      torchY - flameH * 0.6,
      torchX + 1 * zoom,
      torchY - 2.5 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Flying buttresses (Gothic supports) with 3D isometric depth
  for (const side of [-1, 1]) {
    const bx = screenPos.x + side * w * 0.85;
    const bxOuter = screenPos.x + side * w * 1.15;
    const bTop = screenPos.y - lowerBodyHeight * zoom;

    // Buttress side face (3D depth)
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.moveTo(bxOuter, screenPos.y + d * 0.45);
    ctx.lineTo(bxOuter + side * 3 * zoom, screenPos.y + d * 0.5);
    ctx.lineTo(bxOuter + side * 3 * zoom, bTop + d * 0.3);
    ctx.lineTo(bxOuter, bTop + d * 0.25);
    ctx.closePath();
    ctx.fill();

    // Buttress front face
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(bx, screenPos.y + d * 0.35);
    ctx.lineTo(bxOuter, screenPos.y + d * 0.45);
    ctx.lineTo(bxOuter, bTop + d * 0.25);
    ctx.lineTo(bx, bTop + d * 0.15);
    ctx.closePath();
    ctx.fill();

    // Buttress stone course lines
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 0.7 * zoom;
    for (let row = 0; row < 4; row++) {
      const rowFrac = row / 4;
      const rowY =
        screenPos.y +
        d * 0.35 -
        rowFrac * (screenPos.y + d * 0.35 - bTop - d * 0.15);
      ctx.beginPath();
      ctx.moveTo(bx, rowY);
      ctx.lineTo(bxOuter, rowY + d * 0.1);
      ctx.stroke();
    }

    // Buttress pinnacle cap (3D pointed)
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 1.0, bTop - 6 * zoom);
    ctx.lineTo(bx, bTop + d * 0.1);
    ctx.lineTo(bxOuter, bTop + d * 0.2);
    ctx.lineTo(bxOuter + side * 3 * zoom, bTop + d * 0.25);
    ctx.closePath();
    ctx.fill();

    // Pinnacle finial on buttress
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 1.0, bTop - 10 * zoom);
    ctx.lineTo(screenPos.x + side * w * 0.95, bTop - 5 * zoom);
    ctx.lineTo(screenPos.x + side * w * 1.05, bTop - 5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Flying arch support (double arch for Gothic feel)
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + side * w * 1.1,
      screenPos.y - lowerBodyHeight * zoom * 0.5,
    );
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.3,
      screenPos.y - lowerBodyHeight * zoom * 0.8,
      screenPos.x + side * w * 0.9,
      bTop - 2 * zoom,
    );
    ctx.stroke();

    // Secondary lower arch
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + side * w * 1.1,
      screenPos.y - lowerBodyHeight * zoom * 0.2,
    );
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.25,
      screenPos.y - lowerBodyHeight * zoom * 0.45,
      screenPos.x + side * w * 0.95,
      screenPos.y - lowerBodyHeight * zoom * 0.6,
    );
    ctx.stroke();

    // Buttress rune orb
    const buttressGlow =
      0.5 + Math.sin(time * 3 + side * 2) * 0.25 + attackPulse * 0.4;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom * buttressGlow;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + side * w * 1.0,
      screenPos.y - lowerBodyHeight * zoom * 0.6,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Energy pulse through buttresses during attack
    if (attackPulse > 0.05) {
      const pulseT = (time * 6) % 1;
      const pulseY = screenPos.y - lowerBodyHeight * zoom * pulseT;
      const pulseAlpha = attackPulse * (1 - Math.abs(pulseT - 0.5) * 2) * 0.8;
      ctx.fillStyle = `rgba(${glowColor}, ${pulseAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + side * w * 1.0,
        pulseY,
        4 * zoom,
        2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Gargoyle sculpture at buttress top
    const gargoyleX = screenPos.x + side * w * 1.15;
    const gargoyleY = bTop + 2 * zoom;

    // Gargoyle body
    ctx.fillStyle = "#5a5a5a";
    ctx.beginPath();
    ctx.ellipse(
      gargoyleX + side * 2 * zoom,
      gargoyleY,
      4 * zoom,
      2.5 * zoom,
      side * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle head
    ctx.fillStyle = "#6a6a6a";
    ctx.beginPath();
    ctx.arc(
      gargoyleX + side * 5 * zoom,
      gargoyleY - 1.5 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle horns
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(gargoyleX + side * 4 * zoom, gargoyleY - 3 * zoom);
    ctx.lineTo(gargoyleX + side * 3 * zoom, gargoyleY - 6 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gargoyleX + side * 6 * zoom, gargoyleY - 3 * zoom);
    ctx.lineTo(gargoyleX + side * 7 * zoom, gargoyleY - 6 * zoom);
    ctx.stroke();

    // Gargoyle wings (folded)
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.moveTo(gargoyleX + side * 1 * zoom, gargoyleY - 1 * zoom);
    ctx.quadraticCurveTo(
      gargoyleX - side * 1 * zoom,
      gargoyleY - 5 * zoom,
      gargoyleX + side * 3 * zoom,
      gargoyleY - 3 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Gargoyle eyes glow during attack
    const gargoyleEyeGlow = attackPulse * 1.5;
    if (gargoyleEyeGlow > 0.05) {
      ctx.fillStyle = `rgba(255, 50, 50, ${Math.min(1, gargoyleEyeGlow)})`;
      ctx.shadowColor = "rgba(255, 50, 50, 0.8)";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(
        gargoyleX + side * 4.5 * zoom,
        gargoyleY - 2 * zoom,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        gargoyleX + side * 6 * zoom,
        gargoyleY - 2 * zoom,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Gothic pinnacles on roof corners
  for (const corner of [0, 1, 2, 3]) {
    const pSide = corner < 2 ? -1 : 1;
    const pDepth = corner % 2 === 0 ? -1 : 1;
    const pinnX = screenPos.x + pSide * w * 0.75;
    const pinnBaseY = screenPos.y - lowerBodyHeight * zoom + pDepth * d * 0.3;

    // Pinnacle shaft
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(pinnX - 2 * zoom, pinnBaseY);
    ctx.lineTo(pinnX + 2 * zoom, pinnBaseY);
    ctx.lineTo(pinnX + 1.5 * zoom, pinnBaseY - 10 * zoom);
    ctx.lineTo(pinnX - 1.5 * zoom, pinnBaseY - 10 * zoom);
    ctx.closePath();
    ctx.fill();

    // Pinnacle pointed tip
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnBaseY - 16 * zoom);
    ctx.lineTo(pinnX - 2.5 * zoom, pinnBaseY - 9 * zoom);
    ctx.lineTo(pinnX + 2.5 * zoom, pinnBaseY - 9 * zoom);
    ctx.closePath();
    ctx.fill();

    // Crocket (decorative knob) on pinnacle
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(pinnX, pinnBaseY - 16.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Small side crockets
    ctx.fillStyle = "#b89020";
    ctx.beginPath();
    ctx.arc(
      pinnX - 1.8 * zoom,
      pinnBaseY - 12 * zoom,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      pinnX + 1.8 * zoom,
      pinnBaseY - 12 * zoom,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Pinnacle glow during attack
    if (attackPulse > 0.05) {
      ctx.fillStyle = `rgba(${glowColor}, ${attackPulse * 0.6})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(pinnX, pinnBaseY - 14 * zoom, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Piston plate/anvil
  const plateY = screenPos.y - lowerBodyHeight * zoom;

  // Outer plate ring
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY + 2 * zoom,
    (baseWidth + 8) * zoom * 0.5,
    (baseWidth + 8) * zoom * 0.25,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#8a7a6a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY,
    (baseWidth + 6) * zoom * 0.5,
    (baseWidth + 6) * zoom * 0.25,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#9a8a7a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY - 3 * zoom,
    (baseWidth + 4) * zoom * 0.5,
    (baseWidth + 4) * zoom * 0.25,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Rune inscriptions on plate
  const runeGlow = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;
  ctx.strokeStyle = `${mainColor} ${runeGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY - 2 * zoom,
    baseWidth * zoom * 0.35,
    baseWidth * zoom * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Plate rune symbols
  ctx.fillStyle = `rgba(${glowColor}, ${runeGlow})`;
  ctx.font = `${6 * zoom}px serif`;
  const plateRunes = ["ᛗ", "ᛚ", "ᛝ", "ᛟ"];
  for (let i = 0; i < 4; i++) {
    const prAngle = (i / 4) * Math.PI * 2 + time * 0.5;
    const prX = screenPos.x + Math.cos(prAngle) * baseWidth * zoom * 0.25;
    const prY = plateY - 2 * zoom + Math.sin(prAngle) * baseWidth * zoom * 0.12;
    ctx.fillText(plateRunes[i], prX, prY);
  }

  // Impact flash
  if (impactFlash > 0) {
    ctx.fillStyle = `${mainColor} ${impactFlash * 0.8})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 20 * zoom * impactFlash;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      plateY - 2 * zoom,
      baseWidth * zoom * 0.4,
      baseWidth * zoom * 0.2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Piston guides with ornate details
  for (const dx of [-1, 1]) {
    // Main rail
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(
      screenPos.x + dx * baseWidth * zoom * 0.4 - 4 * zoom,
      plateY - baseHeight * zoom * 0.6,
      8 * zoom,
      baseHeight * zoom * 0.6,
    );

    // Rail highlight
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      screenPos.x + dx * baseWidth * zoom * 0.4 - 4 * zoom,
      plateY - baseHeight * zoom * 0.6,
      2 * zoom,
      baseHeight * zoom * 0.6,
    );

    // Ornate rivets
    ctx.fillStyle = "#c9a227";
    for (let r = 0; r < 5; r++) {
      const rivetY =
        plateY - baseHeight * zoom * 0.12 - r * baseHeight * zoom * 0.11;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + dx * baseWidth * zoom * 0.4,
        rivetY,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // UPPER PISTON SECTION
  const pistonTopY = plateY - 4 * zoom + pistonOffset;

  // Upper tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    pistonTopY,
    baseWidth - 4,
    baseWidth - 4,
    baseHeight * 0.4,
    {
      top: "#7a6a5a",
      left: "#6a5a4a",
      right: "#5a4a3a",
      leftBack: "#8a7a6a",
      rightBack: "#7a6a5a",
    },
    zoom,
  );

  // Piston connector ring
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    pistonTopY + 2 * zoom,
    (baseWidth - 2) * zoom * 0.5,
    (baseWidth - 2) * zoom * 0.25,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Stone blocks on upper section
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    const blockY = pistonTopY + 12 - row * baseHeight * 0.12 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x - w * 0.85, blockY - d * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x + w * 0.85, blockY - d * 0.55);
    ctx.stroke();
  }

  const topY = pistonTopY - baseHeight * 0.4 * zoom;
  const sX = screenPos.x;

  // Clock face on upper tower (front face)
  const clockCenterY = pistonTopY - baseHeight * 0.2 * zoom;
  const clockR = 6 * zoom;

  // Clock face background
  ctx.fillStyle = "rgba(240, 230, 210, 0.85)";
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(sX, clockCenterY, clockR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Clock hour markers
  ctx.fillStyle = "#3a2a1a";
  for (let h = 0; h < 12; h++) {
    const hAngle = (h / 12) * Math.PI * 2 - Math.PI / 2;
    const markerLen = h % 3 === 0 ? 1.5 * zoom : 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      sX + Math.cos(hAngle) * (clockR - markerLen),
      clockCenterY + Math.sin(hAngle) * (clockR - markerLen),
    );
    ctx.lineTo(
      sX + Math.cos(hAngle) * (clockR - 1 * zoom),
      clockCenterY + Math.sin(hAngle) * (clockR - 1 * zoom),
    );
    ctx.lineWidth = h % 3 === 0 ? 1 * zoom : 0.5 * zoom;
    ctx.stroke();
  }

  // Clock hands (animated slowly)
  const hourAngle = ((time * 0.02) % (Math.PI * 2)) - Math.PI / 2;
  const minuteAngle = ((time * 0.24) % (Math.PI * 2)) - Math.PI / 2;
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, clockCenterY);
  ctx.lineTo(
    sX + Math.cos(hourAngle) * clockR * 0.5,
    clockCenterY + Math.sin(hourAngle) * clockR * 0.5,
  );
  ctx.stroke();
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, clockCenterY);
  ctx.lineTo(
    sX + Math.cos(minuteAngle) * clockR * 0.7,
    clockCenterY + Math.sin(minuteAngle) * clockR * 0.7,
  );
  ctx.stroke();

  // Clock center pin
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(sX, clockCenterY, 1 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Mystical glow behind clock during attack
  if (attackPulse > 0.05) {
    ctx.fillStyle = `rgba(${glowColor}, ${attackPulse * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(sX, clockCenterY, clockR + 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Accent panel lines
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.strokeStyle = `${mainColor} ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= tower.level; i++) {
    const lineY =
      pistonTopY + 16 - (baseHeight * 0.6 * zoom * i) / (tower.level + 1);
    ctx.beginPath();
    ctx.moveTo(sX - w * 0.15, lineY + d * 0.3);
    ctx.lineTo(sX - w * 0.7, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sX + w * 0.7, lineY - d * 0.2);
    ctx.lineTo(sX + w * 0.15, lineY + d * 0.3);
    ctx.stroke();
  }

  // Energy vents
  for (let i = 0; i < Math.min(tower.level, 3); i++) {
    const ventY = screenPos.y - lowerBodyHeight * zoom * 0.35 - i * 8 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse;

    ctx.fillStyle = `${mainColor} ${ventGlow})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      sX - w * 0.55,
      ventY + d * 0.15,
      3.5 * zoom,
      1.8 * zoom,
      0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      sX + w * 0.55,
      ventY + d * 0.15,
      3.5 * zoom,
      1.8 * zoom,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== GOTHIC PINNACLES ON ROOF CORNERS ==========
  for (const corner of [
    { dx: -1, dy: -0.4 },
    { dx: 1, dy: -0.4 },
    { dx: -0.8, dy: 0.25 },
    { dx: 0.8, dy: 0.25 },
  ]) {
    const pinnX = sX + corner.dx * (baseWidth - 4) * zoom * 0.45;
    const pinnY = topY + corner.dy * (baseWidth - 4) * zoom * 0.2;
    const pinnH = 10 * zoom;

    // Pinnacle base
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(pinnX - 2 * zoom, pinnY - 2 * zoom, 4 * zoom, 4 * zoom);

    // Pinnacle spire
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnY - pinnH);
    ctx.lineTo(pinnX - 2.5 * zoom, pinnY - 2 * zoom);
    ctx.lineTo(pinnX + 2.5 * zoom, pinnY - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Pinnacle crocket (decorative bumps)
    ctx.fillStyle = "#7a6a5a";
    for (let c = 0; c < 3; c++) {
      const crocketFrac = 0.3 + c * 0.25;
      const crocketX =
        pinnX + (c % 2 === 0 ? -1 : 1) * 2 * zoom * (1 - crocketFrac);
      const crocketY = pinnY - pinnH * crocketFrac;
      ctx.beginPath();
      ctx.arc(crocketX, crocketY, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pinnacle finial (tiny orb at top)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(pinnX, pinnY - pinnH - 1.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== OBSERVATION BALCONY ==========
  const balconyY = topY + 4 * zoom;
  const balconyW = baseWidth * zoom * 0.48;
  const balconyD = baseWidth * zoom * 0.24;

  // Balcony floor (isometric slab)
  ctx.fillStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY - balconyD);
  ctx.lineTo(sX + balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.closePath();
  ctx.fill();

  // Balcony edge trim
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.lineTo(sX + balconyW, balconyY);
  ctx.stroke();

  // Railing posts
  const railH = 6 * zoom;
  const railPosts = [
    { x: sX - balconyW * 0.8, y: balconyY + balconyD * 0.2 },
    { x: sX - balconyW * 0.4, y: balconyY + balconyD * 0.6 },
    { x: sX, y: balconyY + balconyD },
    { x: sX + balconyW * 0.4, y: balconyY + balconyD * 0.6 },
    { x: sX + balconyW * 0.8, y: balconyY + balconyD * 0.2 },
  ];
  for (const post of railPosts) {
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(post.x - 0.8 * zoom, post.y - railH, 1.6 * zoom, railH);
    // Post cap
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(post.x, post.y - railH, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Railing bar connecting posts
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(railPosts[0].x, railPosts[0].y - railH);
  for (let i = 1; i < railPosts.length; i++) {
    ctx.lineTo(railPosts[i].x, railPosts[i].y - railH);
  }
  ctx.stroke();

  // Compute spireHeight early so orbital effects can reference it
  const spireHeight = (28 + tower.level * 6) * zoom;

  // Back halves of orbital effects (drawn behind the spire)
  drawLibraryOrbitalEffects(
    ctx,
    false,
    screenPos,
    topY,
    spireHeight,
    baseHeight,
    lowerBodyHeight,
    mainColor,
    glowColor,
    zoom,
    time,
    attackPulse,
    shakeY,
    tower,
  );

  // ========== ENHANCED GOTHIC SPIRE ==========

  // Spire base platform
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    sX,
    topY + 2 * zoom,
    baseWidth * zoom * 0.38,
    baseWidth * zoom * 0.19,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Spire back face
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX - baseWidth * zoom * 0.32, topY);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.closePath();
  ctx.fill();

  // Spire front face
  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY);
  ctx.closePath();
  ctx.fill();

  // Spire right face
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY + 3 * zoom);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12 + 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Spire ridge line
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.stroke();

  // Ornamental spire bands with runes
  const spireRunes = ["ᚷ", "ᚹ", "ᚺ", "ᛁ"];
  for (let band = 0; band < 4; band++) {
    const bandY = topY - spireHeight * (0.2 + band * 0.2);
    const bandWidth = baseWidth * zoom * 0.32 * (0.9 - band * 0.15);

    // Band line
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - bandWidth, bandY + bandWidth * 0.35);
    ctx.lineTo(sX, bandY - bandWidth * 0.15);
    ctx.lineTo(sX + bandWidth, bandY + bandWidth * 0.35);
    ctx.stroke();

    // Band rune
    const bandRuneGlow =
      0.5 + Math.sin(time * 3 + band) * 0.25 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${bandRuneGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(spireRunes[band], sX, bandY);
    ctx.shadowBlur = 0;
  }

  // Spire finial (decorative top piece)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight - 6 * zoom);
  ctx.lineTo(sX - 3 * zoom, topY - spireHeight + 2 * zoom);
  ctx.lineTo(sX + 3 * zoom, topY - spireHeight + 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Faceted crystal at top (diamond shape with multiple facets)
  const crystalCenterY = topY - spireHeight - 10 * zoom;
  const crystalSize = (3 + tower.level * 0.5) * zoom;
  const crystalGlow = 0.7 + Math.sin(time * 4) * 0.2 + attackPulse * 0.5;

  // Crystal outer glow
  ctx.fillStyle = `rgba(${glowColor}, ${crystalGlow * 0.2})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(sX, crystalCenterY, crystalSize * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crystal facets (hexagonal shape with visible faces)
  const facetAngles = 6;
  for (let f = 0; f < facetAngles; f++) {
    const fAngle1 = (f / facetAngles) * Math.PI * 2 - Math.PI / 2;
    const fAngle2 = ((f + 1) / facetAngles) * Math.PI * 2 - Math.PI / 2;

    // Upper facet (lighter)
    const facetBright = 0.5 + (f % 2) * 0.2;
    ctx.fillStyle = `rgba(${glowColor}, ${crystalGlow * facetBright})`;
    ctx.beginPath();
    ctx.moveTo(sX, crystalCenterY - crystalSize * 1.2);
    ctx.lineTo(
      sX + Math.cos(fAngle1) * crystalSize,
      crystalCenterY + Math.sin(fAngle1) * crystalSize * 0.5,
    );
    ctx.lineTo(
      sX + Math.cos(fAngle2) * crystalSize,
      crystalCenterY + Math.sin(fAngle2) * crystalSize * 0.5,
    );
    ctx.closePath();
    ctx.fill();

    // Lower facet (darker)
    ctx.fillStyle = `rgba(${glowColor}, ${crystalGlow * facetBright * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(sX, crystalCenterY + crystalSize * 1.2);
    ctx.lineTo(
      sX + Math.cos(fAngle1) * crystalSize,
      crystalCenterY + Math.sin(fAngle1) * crystalSize * 0.5,
    );
    ctx.lineTo(
      sX + Math.cos(fAngle2) * crystalSize,
      crystalCenterY + Math.sin(fAngle2) * crystalSize * 0.5,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Crystal highlight (specular)
  ctx.fillStyle = `rgba(255, 255, 255, ${crystalGlow * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(
    sX - crystalSize * 0.25,
    crystalCenterY - crystalSize * 0.4,
    crystalSize * 0.3,
    crystalSize * 0.2,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Lightning rod / magical antenna extending from crystal
  const antennaBaseY = crystalCenterY - crystalSize * 1.2;
  const antennaH = 8 * zoom;

  // Main antenna shaft
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, antennaBaseY);
  ctx.lineTo(sX, antennaBaseY - antennaH);
  ctx.stroke();

  // Antenna crossbars
  ctx.lineWidth = 0.8 * zoom;
  for (let ab = 0; ab < 3; ab++) {
    const abY = antennaBaseY - antennaH * (0.3 + ab * 0.25);
    const abW = (3 - ab) * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - abW, abY);
    ctx.lineTo(sX + abW, abY);
    ctx.stroke();
  }

  // Antenna tip spark
  const sparkAlpha = 0.4 + Math.sin(time * 8) * 0.3 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${sparkAlpha})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(sX, antennaBaseY - antennaH, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Lightning crackle from antenna during attack
  if (attackPulse > 0.15) {
    ctx.strokeStyle = `rgba(${glowColor}, ${attackPulse})`;
    ctx.lineWidth = 1 * zoom;
    for (let bolt = 0; bolt < 3; bolt++) {
      const boltAngle = time * 12 + bolt * 2.1;
      ctx.beginPath();
      ctx.moveTo(sX, antennaBaseY - antennaH);
      let bx = sX;
      let by = antennaBaseY - antennaH;
      for (let seg = 0; seg < 4; seg++) {
        bx += Math.cos(boltAngle + seg * 1.5) * 4 * zoom;
        by += Math.sin(boltAngle + seg * 0.8) * 3 * zoom - 1 * zoom;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  // Front halves of orbital effects (drawn in front of the spire)
  drawLibraryOrbitalEffects(
    ctx,
    true,
    screenPos,
    topY,
    spireHeight,
    baseHeight,
    lowerBodyHeight,
    mainColor,
    glowColor,
    zoom,
    time,
    attackPulse,
    shakeY,
    tower,
  );

  // Energy orb at tip
  const orbGlow = 0.6 + Math.sin(time * 4) * 0.3 + attackPulse;
  const orbSize = (12 + tower.level * 2 + attackPulse * 5) * zoom;

  // Outer energy field
  const outerGrad = ctx.createRadialGradient(
    sX,
    topY - spireHeight - 10 * zoom,
    0,
    sX,
    topY - spireHeight - 10 * zoom,
    orbSize * 1.5,
  );
  outerGrad.addColorStop(0, `${mainColor} ${orbGlow * 0.3})`);
  outerGrad.addColorStop(0.5, `rgba(140, 60, 200, ${orbGlow * 0.15})`);
  outerGrad.addColorStop(1, `rgba(100, 40, 160, 0)`);
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, orbSize * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  const orbGrad = ctx.createRadialGradient(
    sX - 2 * zoom,
    topY - spireHeight - 12 * zoom,
    0,
    sX,
    topY - spireHeight - 10 * zoom,
    orbSize,
  );

  if (tower.level <= 3) {
    orbGrad.addColorStop(0, `rgba(255, 220, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(200, 150, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(150, 80, 220, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(100, 50, 180, 0)`);
  } else if (tower.level === 4 && tower.upgrade === "A") {
    orbGrad.addColorStop(0, `rgba(255, 220, 180, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(255, 180, 100, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(220, 100, 40, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(180, 60, 30, 0)`);
  } else {
    orbGrad.addColorStop(0, `rgba(180, 240, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(100, 200, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(40, 150, 220, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(30, 100, 180, 0)`);
  }

  ctx.fillStyle = orbGrad;
  ctx.shadowColor = "#b466ff";
  ctx.shadowBlur = 15 * zoom * orbGlow;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, orbSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner core
  ctx.fillStyle = `rgba(255, 230, 255, ${orbGlow})`;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, 3.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Energy tendrils during attack
  if (attackPulse > 0.1) {
    for (let t = 0; t < 5; t++) {
      const tendrilAngle = time * 5 + (t / 5) * Math.PI * 2;
      const tendrilLen = (18 + attackPulse * 22) * zoom;
      ctx.strokeStyle = `${mainColor} ${attackPulse * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(sX, topY - spireHeight - 10 * zoom);
      ctx.quadraticCurveTo(
        sX + Math.cos(tendrilAngle) * tendrilLen * 0.5,
        topY -
          spireHeight -
          10 * zoom +
          Math.sin(tendrilAngle) * tendrilLen * 0.3,
        sX + Math.cos(tendrilAngle + 0.3) * tendrilLen,
        topY -
          spireHeight -
          10 * zoom +
          Math.sin(tendrilAngle + 0.3) * tendrilLen * 0.5,
      );
      ctx.stroke();
    }
  }

  // Gothic windows with interior details
  const windowY = screenPos.y - lowerBodyHeight * zoom * 0.5;
  const glowIntensity = 0.5 + Math.sin(time * 2) * 0.3 + attackPulse;
  const candleFlicker = 0.15 * Math.sin(time * 8) + 0.1 * Math.sin(time * 13);

  let windowBaseColor = "255, 200, 100";
  let windowShadowColor = "rgba(255, 200, 120, 0.5)";
  if (tower.level > 3 && tower.upgrade === "A") {
    windowBaseColor = "255, 180, 80";
    windowShadowColor = "rgba(255, 160, 60, 0.5)";
  } else if (tower.level > 3 && tower.upgrade === "B") {
    windowBaseColor = "120, 180, 255";
    windowShadowColor = "rgba(100, 160, 255, 0.5)";
  }

  for (const dx of [-1, 1]) {
    const wx = sX + dx * 11 * zoom;

    // Window frame (outer)
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(wx - 5 * zoom, windowY + 10 * zoom);
    ctx.lineTo(wx - 5 * zoom, windowY - 3 * zoom);
    ctx.quadraticCurveTo(
      wx,
      windowY - 10 * zoom,
      wx + 5 * zoom,
      windowY - 3 * zoom,
    );
    ctx.lineTo(wx + 5 * zoom, windowY + 10 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#2a1a0a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    const windowGrad = ctx.createLinearGradient(
      wx,
      windowY + 8 * zoom,
      wx,
      windowY - 6 * zoom,
    );
    windowGrad.addColorStop(
      0,
      `rgba(${windowBaseColor}, ${glowIntensity * 0.4 + candleFlicker})`,
    );
    windowGrad.addColorStop(0.4, `rgba(${glowColor}, ${glowIntensity * 0.7})`);
    windowGrad.addColorStop(1, `rgba(${glowColor}, ${glowIntensity})`);

    ctx.fillStyle = windowGrad;
    ctx.shadowColor = windowShadowColor;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx - 3.5 * zoom, windowY + 8 * zoom);
    ctx.lineTo(wx - 3.5 * zoom, windowY - 2 * zoom);
    ctx.quadraticCurveTo(
      wx,
      windowY - 7 * zoom,
      wx + 3.5 * zoom,
      windowY - 2 * zoom,
    );
    ctx.lineTo(wx + 3.5 * zoom, windowY + 8 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Visible bookshelves through window (dark horizontal lines)
    ctx.strokeStyle = `rgba(60, 40, 20, ${0.3 + candleFlicker * 0.2})`;
    ctx.lineWidth = 0.8 * zoom;
    for (let shelf = 0; shelf < 3; shelf++) {
      const shelfY = windowY + (2 + shelf * 3) * zoom;
      ctx.beginPath();
      ctx.moveTo(wx - 3 * zoom, shelfY);
      ctx.lineTo(wx + 3 * zoom, shelfY);
      ctx.stroke();

      // Tiny book spines on shelves
      for (let b = 0; b < 4; b++) {
        const bookX = wx + (b - 1.5) * 1.5 * zoom;
        const bookH = (1.5 + ((b * 3 + shelf * 7) % 3) * 0.5) * zoom;
        const bookHue = (b * 60 + shelf * 120 + dx * 30) % 360;
        ctx.fillStyle = `hsla(${bookHue}, 40%, 35%, ${0.4 + candleFlicker * 0.15})`;
        ctx.fillRect(bookX - 0.5 * zoom, shelfY - bookH, 1 * zoom, bookH);
      }
    }

    // Window mullion (center vertical)
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx, windowY - 5 * zoom);
    ctx.lineTo(wx, windowY + 8 * zoom);
    ctx.stroke();

    // Window transom (horizontal)
    ctx.beginPath();
    ctx.moveTo(wx - 3 * zoom, windowY + 2 * zoom);
    ctx.lineTo(wx + 3 * zoom, windowY + 2 * zoom);
    ctx.stroke();

    // Gothic arch tracery at top of window
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.arc(wx - 1.5 * zoom, windowY - 2 * zoom, 2 * zoom, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wx + 1.5 * zoom, windowY - 2 * zoom, 2 * zoom, Math.PI, 0);
    ctx.stroke();

    // Glow spill outside window
    ctx.fillStyle = `rgba(${windowBaseColor}, ${0.08 + candleFlicker * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(wx, windowY + 12 * zoom, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central arcane core display
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(sX, topY + 6 * zoom, 9 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(
    sX,
    topY + 6 * zoom,
    0,
    sX,
    topY + 6 * zoom,
    7 * zoom,
  );
  coreGrad.addColorStop(0, `${mainColor} ${glowIntensity})`);
  coreGrad.addColorStop(0.5, `rgba(140, 80, 200, ${glowIntensity * 0.7})`);
  coreGrad.addColorStop(1, `rgba(100, 50, 150, ${glowIntensity * 0.4})`);
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = "#b466ff";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(sX, topY + 6 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Core rune pattern
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 2;
    ctx.beginPath();
    ctx.moveTo(sX, topY + 6 * zoom);
    ctx.lineTo(
      sX + Math.cos(angle) * 6 * zoom,
      topY + 6 * zoom + Math.sin(angle) * 6 * zoom,
    );
    ctx.stroke();
  }

  // ========== LEVEL 2 UNIQUE FEATURES ==========
  if (tower.level >= 2) {
    // Mystical scroll unfurling
    const scrollY = screenPos.y - lowerBodyHeight * zoom * 0.8;
    const scrollGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = "#e8dcc8";
    ctx.fillRect(sX - 6 * zoom, scrollY - 4 * zoom, 12 * zoom, 8 * zoom);

    // Scroll roll details
    ctx.fillStyle = "#d4c8b0";
    ctx.beginPath();
    ctx.ellipse(
      sX - 6 * zoom,
      scrollY,
      1.5 * zoom,
      4 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      sX + 6 * zoom,
      scrollY,
      1.5 * zoom,
      4 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = `rgba(${glowColor}, ${scrollGlow})`;
    ctx.font = `${5 * zoom}px serif`;
    ctx.fillText("ᛗᛚᛝ", sX, scrollY + 2 * zoom);
  }

  // ========== LEVEL 3 UNIQUE FEATURES ==========
  // (Barrier circle, nodes, and crystal shards are now drawn via drawLibraryOrbitalEffects)
  if (tower.level >= 3) {
    // Ancient artifact pedestal glow
    const artifactGlow = 0.5 + Math.sin(time * 3) * 0.25;
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(
      sX,
      screenPos.y - lowerBodyHeight * zoom - 8 * zoom,
      12 * zoom,
      6 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // (Energy amplifier rings are now drawn via drawLibraryOrbitalEffects)

  // Level 4 upgrade visuals
  if (tower.level === 4) {
    if (tower.upgrade === "A") {
      const wavePhase = (time * 2) % 1;
      const waveRadius = 30 + wavePhase * 60;

      ctx.strokeStyle = `rgba(255, 100, 50, ${0.7 * (1 - wavePhase)})`;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        sX,
        screenPos.y + shakeY + 5 * zoom,
        waveRadius * zoom * 0.7,
        waveRadius * zoom * 0.35,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 150, 50, 0.5)`;
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 6; i++) {
        const crackAngle = (i / 6) * Math.PI * 2 + time * 0.2;
        ctx.beginPath();
        ctx.moveTo(sX, screenPos.y + shakeY + 5 * zoom);
        ctx.lineTo(
          sX + Math.cos(crackAngle) * 35 * zoom,
          screenPos.y + shakeY + 5 * zoom + Math.sin(crackAngle) * 17 * zoom,
        );
        ctx.stroke();
      }
    }
    // (Level 4B crystals and purple aura are now drawn via drawLibraryOrbitalEffects)
  }

  // Ground-crushing shockwave effect during attack
  if (groundShockwave > 0 && groundShockwave < 1) {
    // Ground distortion flash at impact center
    if (groundShockwave < 0.3) {
      const flashAlpha = (1 - groundShockwave / 0.3) * 0.5;
      const flashGrad = ctx.createRadialGradient(
        sX,
        screenPos.y + 5 * zoom,
        0,
        sX,
        screenPos.y + 5 * zoom,
        25 * zoom,
      );
      flashGrad.addColorStop(0, `${mainColor} ${flashAlpha})`);
      flashGrad.addColorStop(0.5, `rgba(${glowColor}, ${flashAlpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(
        sX,
        screenPos.y + 5 * zoom,
        25 * zoom,
        12 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Multiple expanding rings (enhanced with varying thickness)
    for (let ring = 0; ring < 4; ring++) {
      const ringDelay = ring * 0.12;
      const ringPhase = Math.max(0, groundShockwave - ringDelay);
      if (ringPhase > 0 && ringPhase < 1) {
        const ringRadius = 25 + ringPhase * 80;
        const ringAlpha = (1 - ringPhase) * 0.6;
        const ringWidth = (5 - ring) * (1 - ringPhase * 0.5);

        ctx.strokeStyle = `${mainColor} ${ringAlpha})`;
        ctx.lineWidth = ringWidth * zoom;
        ctx.beginPath();
        ctx.ellipse(
          sX,
          screenPos.y + 5 * zoom,
          ringRadius * zoom,
          ringRadius * zoom * 0.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    // Radial crack pattern with branching
    if (groundCrackPhase > 0) {
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 12; i++) {
        const crackAngle = (i / 12) * Math.PI * 2 + Math.PI / 24;
        const crackLength = 25 + groundCrackPhase * 60;
        const crackAlpha = (1 - groundCrackPhase) * 0.7;

        // Main crack
        ctx.strokeStyle = `${mainColor} ${crackAlpha})`;
        const seg1X =
          sX +
          Math.cos(crackAngle) * crackLength * 0.35 * zoom +
          Math.sin(i * 3 + time * 5) * 3 * zoom;
        const seg1Y =
          screenPos.y +
          5 * zoom +
          Math.sin(crackAngle) * crackLength * 0.18 * zoom;
        const seg2X =
          sX +
          Math.cos(crackAngle) * crackLength * 0.7 * zoom +
          Math.cos(i * 2 + time * 3) * 5 * zoom;
        const seg2Y =
          screenPos.y +
          5 * zoom +
          Math.sin(crackAngle) * crackLength * 0.35 * zoom;
        const endX =
          sX +
          Math.cos(crackAngle) * crackLength * zoom +
          Math.cos(i * 2 + time * 3) * 8 * zoom;
        const endY =
          screenPos.y +
          5 * zoom +
          Math.sin(crackAngle) * crackLength * 0.5 * zoom;

        ctx.beginPath();
        ctx.moveTo(sX, screenPos.y + 5 * zoom);
        ctx.lineTo(seg1X, seg1Y);
        ctx.lineTo(seg2X, seg2Y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Branching sub-cracks
        if (i % 2 === 0 && groundCrackPhase > 0.3) {
          const branchAlpha = crackAlpha * 0.5;
          ctx.strokeStyle = `${mainColor} ${branchAlpha})`;
          ctx.lineWidth = 1 * zoom;
          const branchAngle = crackAngle + (i % 3 === 0 ? 0.3 : -0.3);
          ctx.beginPath();
          ctx.moveTo(seg1X, seg1Y);
          ctx.lineTo(
            seg1X + Math.cos(branchAngle) * crackLength * 0.25 * zoom,
            seg1Y + Math.sin(branchAngle) * crackLength * 0.12 * zoom,
          );
          ctx.stroke();
          ctx.lineWidth = 2 * zoom;
        }
      }

      // Glowing rune marks at crack intersections
      ctx.fillStyle = `rgba(${glowColor}, ${(1 - groundCrackPhase) * 0.5})`;
      for (let i = 0; i < 6; i++) {
        const markAngle = (i / 6) * Math.PI * 2;
        const markR = (15 + groundCrackPhase * 30) * zoom;
        ctx.beginPath();
        ctx.arc(
          sX + Math.cos(markAngle) * markR,
          screenPos.y + 5 * zoom + Math.sin(markAngle) * markR * 0.5,
          2 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Mystical dust/debris particles rising during slam
    for (let i = 0; i < 10; i++) {
      const debrisAngle = (i / 10) * Math.PI * 2 + time * 0.5;
      const debrisPhase = (groundShockwave + i * 0.08) % 1;
      const debrisRadius = 15 + debrisPhase * 50;
      const debrisHeight = Math.sin(debrisPhase * Math.PI) * 35;
      const debrisAlpha = (1 - debrisPhase) * 0.8;

      const dxPos = sX + Math.cos(debrisAngle) * debrisRadius * zoom;
      const dyPos =
        screenPos.y +
        5 * zoom +
        Math.sin(debrisAngle) * debrisRadius * 0.5 * zoom -
        debrisHeight * zoom;

      // Stone debris
      ctx.fillStyle = `rgba(100, 80, 60, ${debrisAlpha})`;
      ctx.beginPath();
      ctx.arc(dxPos, dyPos, (2 + (i % 3)) * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Magical sparkle on some debris
      if (i % 2 === 0) {
        ctx.fillStyle = `rgba(${glowColor}, ${debrisAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(dxPos + 1 * zoom, dyPos - 1 * zoom, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rising dust columns at impact point
    for (let dc = 0; dc < 4; dc++) {
      const dustAngle = (dc / 4) * Math.PI * 2 + 0.4;
      const dustPhase = Math.max(0, groundShockwave - dc * 0.05);
      if (dustPhase > 0) {
        const dustH = dustPhase * 25 * zoom;
        const dustAlpha = (1 - dustPhase) * 0.25;
        const dustX = sX + Math.cos(dustAngle) * 12 * zoom;
        const dustBaseY =
          screenPos.y + 5 * zoom + Math.sin(dustAngle) * 6 * zoom;

        const dustGrad = ctx.createLinearGradient(
          dustX,
          dustBaseY,
          dustX,
          dustBaseY - dustH,
        );
        dustGrad.addColorStop(0, `rgba(140, 120, 100, ${dustAlpha})`);
        dustGrad.addColorStop(1, `rgba(140, 120, 100, 0)`);
        ctx.fillStyle = dustGrad;
        ctx.fillRect(dustX - 3 * zoom, dustBaseY - dustH, 6 * zoom, dustH);
      }
    }

    // Enchanted book pages scattering during attack
    for (let pg = 0; pg < 8; pg++) {
      const pagePhase = (groundShockwave + pg * 0.1) % 1;
      if (pagePhase < 0.9) {
        const pageAngle = (pg / 8) * Math.PI * 2 + time * 2;
        const pageRadius = 10 + pagePhase * 45;
        const pageHeight = Math.sin(pagePhase * Math.PI) * 40;
        const pageAlpha = (1 - pagePhase) * 0.7;
        const pageSpin = time * 5 + pg * 1.3;

        const pgX = sX + Math.cos(pageAngle) * pageRadius * zoom;
        const pgY =
          screenPos.y +
          5 * zoom +
          Math.sin(pageAngle) * pageRadius * 0.4 * zoom -
          pageHeight * zoom;

        ctx.save();
        ctx.translate(pgX, pgY);
        ctx.rotate(pageSpin);
        ctx.fillStyle = `rgba(230, 220, 200, ${pageAlpha})`;
        ctx.fillRect(-3 * zoom, -2 * zoom, 6 * zoom, 4 * zoom);

        // Text lines on page
        ctx.fillStyle = `rgba(60, 40, 20, ${pageAlpha * 0.5})`;
        ctx.fillRect(-2 * zoom, -1 * zoom, 4 * zoom, 0.5 * zoom);
        ctx.fillRect(-2 * zoom, 0.5 * zoom, 3 * zoom, 0.5 * zoom);
        ctx.restore();
      }
    }
  }

  ctx.restore();
}

// LAB TOWER - Tesla coil with fixed projectile origins
function renderLabTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  ctx.save();
  const baseWidth = 30 + tower.level * 4;
  const baseHeight = 25 + tower.level * 8;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;
  const h = baseHeight * zoom;

  // Foundation platform with tech details
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 10 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    6,
    {
      top: "#1a3a4f",
      left: "#153040",
      right: "#102535",
      leftBack: "#1d4055",
      rightBack: "#183548",
    },
    zoom,
  );

  // Foundation edge glow
  const foundGlow = 0.3 + Math.sin(time * 2) * 0.15;
  ctx.strokeStyle = `rgba(0, 255, 255, ${foundGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - (baseWidth + 10) * zoom * 0.5,
    screenPos.y + 4 * zoom,
  );
  ctx.lineTo(
    screenPos.x,
    screenPos.y + (baseWidth + 10) * zoom * 0.25 + 4 * zoom,
  );
  ctx.lineTo(
    screenPos.x + (baseWidth + 10) * zoom * 0.5,
    screenPos.y + 4 * zoom,
  );
  ctx.stroke();

  // Main sci-fi tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 2 * zoom,
    baseWidth,
    baseWidth,
    baseHeight - 6,
    {
      top: "#4d7a9b",
      left: "#3a6585",
      right: "#2d5a7b",
      leftBack: "#4a7595",
      rightBack: "#3d6888",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring wrapping the base) ==========
  const labBalY = screenPos.y + 4 * zoom;
  const labBalRX = w * 1.05;
  const labBalRY = d * 1.05;
  const labBalH = 5 * zoom;
  const labBalSegs = 32;
  const labBalPosts = 16;

  ctx.strokeStyle = "#2a6a8a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labBalY,
    labBalRX,
    labBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labBalY - labBalH,
    labBalRX,
    labBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < labBalPosts; bp++) {
    const pa = (bp / labBalPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * labBalRX;
    const py = labBalY + Math.sin(pa) * labBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - labBalH);
    ctx.stroke();
  }
  for (let i = 0; i < labBalSegs; i++) {
    const a0 = (i / labBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / labBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * labBalRX;
    const y0b = labBalY + Math.sin(a0) * labBalRY;
    const x1 = screenPos.x + Math.cos(a1) * labBalRX;
    const y1b = labBalY + Math.sin(a1) * labBalRY;
    ctx.fillStyle = `rgba(45, 90, 123, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - labBalH);
    ctx.lineTo(x0, y0b - labBalH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "#2a6a8a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, labBalY, labBalRX, labBalRY, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labBalY - labBalH,
    labBalRX,
    labBalRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < labBalPosts; bp++) {
    const pa = (bp / labBalPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * labBalRX;
    const py = labBalY + Math.sin(pa) * labBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - labBalH);
    ctx.stroke();
  }
  for (let i = 0; i < labBalSegs; i++) {
    const a0 = (i / labBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / labBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * labBalRX;
    const y0b = labBalY + Math.sin(a0) * labBalRY;
    const x1 = screenPos.x + Math.cos(a1) * labBalRX;
    const y1b = labBalY + Math.sin(a1) * labBalRY;
    ctx.fillStyle = `rgba(45, 90, 123, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - labBalH);
    ctx.lineTo(x0, y0b - labBalH);
    ctx.closePath();
    ctx.fill();
  }

  // Structural panel lines for better 3D effect
  ctx.strokeStyle = "#2a5a75";
  ctx.lineWidth = 1 * zoom;
  // Left face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x - w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y + 2 * zoom);
    ctx.lineTo(
      panelX - d * 0.5,
      screenPos.y - (baseHeight - 6) * zoom + d * 0.5,
    );
    ctx.stroke();
  }
  // Right face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x + w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y + 2 * zoom);
    ctx.lineTo(
      panelX + d * 0.5,
      screenPos.y - (baseHeight - 6) * zoom + d * 0.5,
    );
    ctx.stroke();
  }

  // Corner reinforcement struts
  ctx.fillStyle = "#3a6a8a";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 0.95, screenPos.y + d * 0.4);
    ctx.lineTo(screenPos.x + side * w * 1.05, screenPos.y + d * 0.5);
    ctx.lineTo(
      screenPos.x + side * w * 1.05,
      screenPos.y - (baseHeight - 10) * zoom + d * 0.4,
    );
    ctx.lineTo(
      screenPos.x + side * w * 0.95,
      screenPos.y - (baseHeight - 10) * zoom + d * 0.3,
    );
    ctx.closePath();
    ctx.fill();
  }

  // ========== ROTATING ENERGY RINGS ==========
  const ringRotation = time * 2;
  for (let ring = 0; ring < 2 + tower.level; ring++) {
    const ringY = screenPos.y - h * (0.3 + ring * 0.15);
    const ringRadius = 12 + tower.level * 2 - ring * 2;
    const ringAlpha = 0.3 + Math.sin(time * 4 + ring) * 0.15;

    ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringRadius * zoom,
      ringRadius * 0.4 * zoom,
      ringRotation + ring * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Ring energy nodes
    for (let node = 0; node < 4; node++) {
      const nodeAngle = ringRotation + ring * 0.5 + (node / 4) * Math.PI * 2;
      const nodeX = screenPos.x + Math.cos(nodeAngle) * ringRadius * zoom;
      const nodeY = ringY + Math.sin(nodeAngle) * ringRadius * 0.4 * zoom;
      ctx.fillStyle = `rgba(0, 255, 255, ${ringAlpha + 0.2})`;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== ENERGY TUBES (following isometric faces) ==========
  // Left face energy tube
  drawEnergyTube(
    ctx,
    screenPos.x - w * 0.85,
    screenPos.y + d * 0.2 + 4 * zoom,
    screenPos.x - w * 0.5,
    screenPos.y - h * 0.6 + d * 0.1,
    2.5,
    time,
    zoom,
    "rgb(0, 200, 255)",
  );

  // Right face energy tube
  drawEnergyTube(
    ctx,
    screenPos.x + w * 0.85,
    screenPos.y + d * 0.15 + 4 * zoom,
    screenPos.x + w * 0.5,
    screenPos.y - h * 0.6 + d * 0.1,
    2.5,
    time + 0.5,
    zoom,
    "rgb(0, 200, 255)",
  );

  // Cross-connecting tube (follows front iso edge, left to right)
  if (tower.level >= 2) {
    drawEnergyTube(
      ctx,
      screenPos.x - w * 0.6,
      screenPos.y - h * 0.3 + d * 0.3,
      screenPos.x + w * 0.6,
      screenPos.y - h * 0.3 + d * 0.3,
      2,
      time + 0.3,
      zoom,
      "rgb(100, 255, 255)",
    );
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ==========
  if (tower.level >= 2) {
    // Front-left strut (follows left iso edge)
    ctx.strokeStyle = "#5a7a9a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.1, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x - w * 1.0, screenPos.y - h * 0.7);
    ctx.stroke();

    // Front-right strut (follows right iso edge)
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.1, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + w * 1.0, screenPos.y - h * 0.7);
    ctx.stroke();

    // Back struts (lighter, behind tower body)
    ctx.strokeStyle = "#4a6a8a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.3, screenPos.y - d * 0.7 + 6 * zoom);
    ctx.lineTo(screenPos.x - w * 0.25, screenPos.y - h * 0.7 - d * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.3, screenPos.y - d * 0.7 + 6 * zoom);
    ctx.lineTo(screenPos.x + w * 0.25, screenPos.y - h * 0.7 - d * 0.1);
    ctx.stroke();

    // Cross bracing (front-to-back on each side, isometric diagonal)
    ctx.strokeStyle = "#4a6a8a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.05, screenPos.y - h * 0.1);
    ctx.lineTo(screenPos.x - w * 0.25, screenPos.y - h * 0.5 - d * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.05, screenPos.y - h * 0.1);
    ctx.lineTo(screenPos.x + w * 0.25, screenPos.y - h * 0.5 - d * 0.1);
    ctx.stroke();

    // Isometric support ring (front arc)
    ctx.strokeStyle = "#6a8aaa";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.35,
      w * 1.05,
      d * 1.05,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();

    // Power cables following iso faces with sag
    ctx.lineWidth = 1.5 * zoom;
    for (let cable = 0; cable < 2; cable++) {
      const cableBaseY = screenPos.y - h * (0.2 + cable * 0.25);
      const sag = Math.sin(time * 2 + cable) * 3 * zoom;
      // Left face cable (angled along iso left face)
      ctx.strokeStyle = "#ff6600";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - w * 1.0, cableBaseY - d * 0.1);
      ctx.quadraticCurveTo(
        screenPos.x - w * 0.7,
        cableBaseY + sag + d * 0.05,
        screenPos.x - w * 0.4,
        cableBaseY - 2 * zoom + d * 0.15,
      );
      ctx.stroke();
      // Right face cable
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 1.0, cableBaseY - d * 0.05);
      ctx.quadraticCurveTo(
        screenPos.x + w * 0.7,
        cableBaseY + sag + d * 0.1,
        screenPos.x + w * 0.4,
        cableBaseY - 2 * zoom + d * 0.2,
      );
      ctx.stroke();
    }

    // Capacitor banks on scaffolding (isometric boxes)
    for (const side of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        const capX = screenPos.x + side * w * 1.0;
        const capY = screenPos.y - h * (0.15 + i * 0.2);
        const capW = 4 * zoom;
        const capH = 5 * zoom;
        const capD = 2 * zoom;

        // Left face of capacitor
        ctx.fillStyle = i % 2 === 0 ? "#3a5a7a" : "#4a7a9a";
        ctx.beginPath();
        ctx.moveTo(capX - capW, capY);
        ctx.lineTo(capX, capY + capD);
        ctx.lineTo(capX, capY + capD - capH);
        ctx.lineTo(capX - capW, capY - capH);
        ctx.closePath();
        ctx.fill();

        // Right face of capacitor
        ctx.fillStyle = i % 2 === 0 ? "#2a4a6a" : "#3a6a8a";
        ctx.beginPath();
        ctx.moveTo(capX, capY + capD);
        ctx.lineTo(capX + capW, capY);
        ctx.lineTo(capX + capW, capY - capH);
        ctx.lineTo(capX, capY + capD - capH);
        ctx.closePath();
        ctx.fill();

        // Capacitor glow
        const capGlow = 0.4 + Math.sin(time * 3 + i + side) * 0.3;
        ctx.strokeStyle = `rgba(0, 200, 255, ${capGlow})`;
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          capX,
          capY - capH * 0.5,
          capW * 0.8,
          capD * 0.8,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
  }

  // ========== SECONDARY COIL TOWERS (Level 3+) ==========
  if (tower.level >= 3) {
    const sideCoilHeight = 30 * zoom;
    const sideCoilOffsets = [-w * 1.2, w * 1.2];

    for (const offsetX of sideCoilOffsets) {
      const coilX = screenPos.x + offsetX;
      const coilBaseY = screenPos.y - h * 0.1;

      // Mini coil housing
      ctx.fillStyle = "#2a4a6a";
      ctx.beginPath();
      ctx.moveTo(coilX - 6 * zoom, coilBaseY);
      ctx.lineTo(coilX - 4 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 4 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 6 * zoom, coilBaseY);
      ctx.closePath();
      ctx.fill();

      // Mini copper coils
      const miniCoilTurns = 5;
      for (let mc = 0; mc < miniCoilTurns; mc++) {
        const mcY =
          coilBaseY - (mc / miniCoilTurns) * sideCoilHeight * 0.8 - 4 * zoom;
        const mcRadius = (5 - mc * 0.5) * zoom;
        const mcGlow = 0.4 + Math.sin(time * 4 + mc + offsetX * 0.1) * 0.3;

        ctx.strokeStyle = `rgba(205, 127, 50, ${0.7 + mcGlow * 0.3})`;
        ctx.lineWidth = 2.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(coilX, mcY, mcRadius, mcRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Mini coil orb
      const miniOrbPulse = 0.6 + Math.sin(time * 5 + offsetX) * 0.3;
      const miniOrbY = coilBaseY - sideCoilHeight - 5 * zoom;

      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
      const miniOrbGrad = ctx.createRadialGradient(
        coilX,
        miniOrbY,
        0,
        coilX,
        miniOrbY,
        5 * zoom,
      );
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.4, "#88ffff");
      miniOrbGrad.addColorStop(1, "#0088ff");
      ctx.fillStyle = miniOrbGrad;
      ctx.beginPath();
      ctx.arc(coilX, miniOrbY, 5 * zoom * miniOrbPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Energy arc from side coil to main tower
      const arcAlpha = 0.4 + Math.sin(time * 6 + offsetX) * 0.3;
      ctx.strokeStyle = `rgba(0, 255, 255, ${arcAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(coilX, miniOrbY);
      const midX = screenPos.x + offsetX * 0.3;
      const midY = screenPos.y - h * 0.75;
      ctx.quadraticCurveTo(midX, midY, screenPos.x, screenPos.y - h * 0.85);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Mini arcs from side orbs
      for (let arc = 0; arc < 3; arc++) {
        const arcAngle = time * 4 + arc * ((Math.PI * 2) / 3) + offsetX;
        const arcLen = (8 + Math.sin(time * 7 + arc) * 4) * zoom;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(coilX, miniOrbY);
        const arcEndX = coilX + Math.cos(arcAngle) * arcLen;
        const arcEndY = miniOrbY + Math.sin(arcAngle) * arcLen * 0.5;
        ctx.lineTo(
          (coilX + arcEndX) / 2 + (Math.random() - 0.5) * 4 * zoom,
          (miniOrbY + arcEndY) / 2 + (Math.random() - 0.5) * 2 * zoom,
        );
        ctx.lineTo(arcEndX, arcEndY);
        ctx.stroke();
      }
    }

    // Plasma conduits on the ground
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.4 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4 * zoom, 4 * zoom]);
    ctx.lineDashOffset = -time * 25;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x - w * 1.1, screenPos.y + 5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x + w * 1.1, screenPos.y + 5 * zoom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Additional wiring network
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1 * zoom;
    for (let wire = 0; wire < 4; wire++) {
      const wireY = screenPos.y - h * (0.1 + wire * 0.15);
      const wireSag = Math.sin(time * 2 + wire) * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - w * 1.2, wireY);
      ctx.quadraticCurveTo(
        screenPos.x - w * 0.9,
        wireY + wireSag,
        screenPos.x - w * 0.7,
        wireY,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 1.2, wireY);
      ctx.quadraticCurveTo(
        screenPos.x + w * 0.9,
        wireY + wireSag,
        screenPos.x + w * 0.7,
        wireY,
      );
      ctx.stroke();
    }

    // Rotating plasma field around main tower
    for (let ring = 0; ring < 2; ring++) {
      const ringAngle = time * 2 + ring * Math.PI;
      const ringRadius = w * (0.7 + ring * 0.15);
      const ringAlpha = 0.25 + Math.sin(time * 4 + ring) * 0.15;

      ctx.strokeStyle = `rgba(0, 255, 200, ${ringAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - h * 0.5,
        ringRadius,
        ringRadius * 0.35,
        ringAngle,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Energy particles around main structure
    for (let p = 0; p < 8; p++) {
      const particleAngle = time * 3 + p * ((Math.PI * 2) / 8);
      const particleDist = w * 0.6 + Math.sin(time * 5 + p) * 5 * zoom;
      const particleY = screenPos.y - h * 0.5;
      const px = screenPos.x + Math.cos(particleAngle) * particleDist;
      const py = particleY + Math.sin(particleAngle) * particleDist * 0.35;

      ctx.fillStyle = `rgba(200, 255, 255, ${0.4 + Math.sin(time * 8 + p) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== ROTATING CAPACITOR DISCS ==========
  const discRotation = time * 3;
  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - h * 0.7);

  // Multiple rotating discs
  for (let disc = 0; disc < tower.level; disc++) {
    const discAngle = discRotation + (disc * Math.PI) / tower.level;
    const discRadius = 6 + disc * 2;
    const discY = disc * 8 * zoom;

    ctx.fillStyle = `rgba(40, 80, 120, ${0.6 - disc * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      discY,
      discRadius * zoom,
      discRadius * 0.4 * zoom,
      discAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Disc edge glow
    ctx.strokeStyle = `rgba(0, 255, 255, ${
      0.5 + Math.sin(time * 5 + disc) * 0.3
    })`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }
  ctx.restore();

  // Add sci-fi panel details on left face (flipped orientation)
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2;
  ctx.strokeStyle = `rgba(0, 255, 255, ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  // Left face horizontal tech lines (flipped)
  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY =
      screenPos.y +
      2 * zoom -
      ((baseHeight - 6) * zoom * i) / (tower.level + 2);
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.85, lineY - d * 0.2);
    ctx.stroke();
  }

  // Right face tech lines (flipped)
  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY =
      screenPos.y +
      2 * zoom -
      ((baseHeight - 6) * zoom * i) / (tower.level + 2);
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.85, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // ========== ANIMATED COOLANT FLOW ==========
  // Coolant tanks on sides
  ctx.fillStyle = "#1a4a6a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x - w * 0.75,
    screenPos.y - h * 0.15,
    5 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x + w * 0.75,
    screenPos.y - h * 0.15,
    5 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Animated coolant bubbles
  for (let i = 0; i < 3; i++) {
    const bubblePhase = (time * 2 + i * 0.4) % 1;
    const bubbleY = screenPos.y - h * 0.05 - bubblePhase * h * 0.2;
    const bubbleAlpha = Math.sin(bubblePhase * Math.PI) * 0.6;

    ctx.fillStyle = `rgba(100, 200, 255, ${bubbleAlpha})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x - w * 0.75 + (i - 1) * 2 * zoom,
      bubbleY,
      2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenPos.x + w * 0.75 + (i - 1) * 2 * zoom,
      bubbleY + 3 * zoom,
      2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Glowing vents on sides with enhanced glow
  for (let i = 0; i < tower.level; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 12 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3;

    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;

    // Left vent
    ctx.fillStyle = `rgba(0, 255, 255, ${ventGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - w * 0.6,
      ventY + d * 0.2,
      4 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Right vent
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + w * 0.6,
      ventY + d * 0.2,
      4 * zoom,
      2 * zoom,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  // ========== CIRCUIT BOARD PATTERNS WITH ANIMATED CURRENT ==========
  ctx.strokeStyle = "#5a8aab";
  ctx.lineWidth = 1.5 * zoom;

  // Left circuit (flipped to go other direction)
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 0.4, screenPos.y - h * 0.2);
  ctx.lineTo(screenPos.x - w * 0.4, screenPos.y - h * 0.4);
  ctx.lineTo(screenPos.x - w * 0.7, screenPos.y - h * 0.5);
  ctx.stroke();

  // Right circuit (flipped)
  ctx.beginPath();
  ctx.moveTo(screenPos.x + w * 0.4, screenPos.y - h * 0.2);
  ctx.lineTo(screenPos.x + w * 0.4, screenPos.y - h * 0.4);
  ctx.lineTo(screenPos.x + w * 0.7, screenPos.y - h * 0.5);
  ctx.stroke();

  // Animated current flowing through circuits
  const currentPhase = (time * 3) % 1;
  ctx.fillStyle = `rgba(0, 255, 255, ${0.8})`;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 6 * zoom;

  // Left circuit current
  const leftCurrentX = screenPos.x - w * (0.4 + currentPhase * 0.3);
  const leftCurrentY = screenPos.y - h * (0.2 + currentPhase * 0.3);
  ctx.beginPath();
  ctx.arc(leftCurrentX, leftCurrentY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Right circuit current
  const rightCurrentX = screenPos.x + w * (0.4 + currentPhase * 0.3);
  const rightCurrentY = screenPos.y - h * (0.2 + currentPhase * 0.3);
  ctx.beginPath();
  ctx.arc(rightCurrentX, rightCurrentY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Node points with enhanced glow
  const nodeGlow = 0.6 + Math.sin(time * 5) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 255, ${nodeGlow})`;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(
    screenPos.x - w * 0.7,
    screenPos.y - h * 0.5,
    3 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    screenPos.x + w * 0.7,
    screenPos.y - h * 0.5,
    3 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // ========== HOLOGRAPHIC DATA DISPLAY ==========
  ctx.fillStyle = "#0a2030";
  const screenW = 10 * zoom;
  const screenH = 8 * zoom;
  ctx.fillRect(
    screenPos.x - screenW / 2,
    screenPos.y - h * 0.38,
    screenW,
    screenH,
  );

  // Screen frame glow
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 3) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(
    screenPos.x - screenW / 2,
    screenPos.y - h * 0.38,
    screenW,
    screenH,
  );

  // Screen content (scrolling data with waveform)
  ctx.fillStyle = `rgba(0, 255, 255, 0.8)`;
  for (let i = 0; i < 4; i++) {
    const lineOffset = (time * 30 + i * 2) % 8;
    ctx.fillRect(
      screenPos.x - screenW / 2 + 1 * zoom,
      screenPos.y - h * 0.38 + lineOffset * zoom,
      (3 + Math.sin(time * 15 + i * 2) * 2) * zoom,
      1 * zoom,
    );
  }

  // Waveform on screen
  ctx.strokeStyle = `rgba(0, 255, 255, 0.9)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const waveX = screenPos.x - screenW / 2 + 1 * zoom + i * zoom;
    const waveY =
      screenPos.y - h * 0.34 + Math.sin(time * 10 + i * 0.8) * 2 * zoom;
    if (i === 0) ctx.moveTo(waveX, waveY);
    else ctx.lineTo(waveX, waveY);
  }
  ctx.stroke();

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    screenPos.x - w * 0.85,
    screenPos.y - h * 0.1,
    2.5,
    time,
    zoom,
    "#00ffff",
    5,
  );
  drawWarningLight(
    ctx,
    screenPos.x + w * 0.85,
    screenPos.y - h * 0.1,
    2.5,
    time + 0.3,
    zoom,
    "#00ffff",
    5,
  );

  const topY = screenPos.y - baseHeight * zoom;

  // ========== TOP RAILING BACK HALF (behind coil/beam) ==========
  const labTopRailY = topY + 4 * zoom;
  const labTopRailRX = w * 0.88;
  const labTopRailRY = d * 0.88;
  const labTopRailH = 5 * zoom;
  const labTopRailSegs = 32;
  const labTopRailPosts = 16;

  ctx.strokeStyle = "#2a6a8a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labTopRailY,
    labTopRailRX,
    labTopRailRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labTopRailY - labTopRailH,
    labTopRailRX,
    labTopRailRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < labTopRailPosts; bp++) {
    const pa = (bp / labTopRailPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * labTopRailRX;
    const py = labTopRailY + Math.sin(pa) * labTopRailRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - labTopRailH);
    ctx.stroke();
  }
  for (let i = 0; i < labTopRailSegs; i++) {
    const a0 = (i / labTopRailSegs) * Math.PI * 2;
    const a1 = ((i + 1) / labTopRailSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * labTopRailRX;
    const y0b = labTopRailY + Math.sin(a0) * labTopRailRY;
    const x1 = screenPos.x + Math.cos(a1) * labTopRailRX;
    const y1b = labTopRailY + Math.sin(a1) * labTopRailRY;
    ctx.fillStyle = `rgba(45, 90, 123, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - labTopRailH);
    ctx.lineTo(x0, y0b - labTopRailH);
    ctx.closePath();
    ctx.fill();
  }

  if (tower.level === 4 && tower.upgrade === "A") {
    renderFocusedBeam(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      enemies,
      selectedMap,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
  } else if (tower.level === 4 && tower.upgrade === "B") {
    renderChainLightning(ctx, screenPos, topY, tower, zoom, time);
  } else {
    renderTeslaCoil(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      enemies,
      selectedMap,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
  }

  // ========== TOP RAILING FRONT HALF (in front of coil/beam) ==========
  ctx.strokeStyle = "#2a6a8a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labTopRailY,
    labTopRailRX,
    labTopRailRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    labTopRailY - labTopRailH,
    labTopRailRX,
    labTopRailRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a8aaa";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < labTopRailPosts; bp++) {
    const pa = (bp / labTopRailPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * labTopRailRX;
    const py = labTopRailY + Math.sin(pa) * labTopRailRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - labTopRailH);
    ctx.stroke();
  }
  for (let i = 0; i < labTopRailSegs; i++) {
    const a0 = (i / labTopRailSegs) * Math.PI * 2;
    const a1 = ((i + 1) / labTopRailSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * labTopRailRX;
    const y0b = labTopRailY + Math.sin(a0) * labTopRailRY;
    const x1 = screenPos.x + Math.cos(a1) * labTopRailRX;
    const y1b = labTopRailY + Math.sin(a1) * labTopRailRY;
    ctx.fillStyle = `rgba(45, 90, 123, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - labTopRailH);
    ctx.lineTo(x0, y0b - labTopRailH);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function renderTeslaCoil(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  void enemies;
  void selectedMap;
  void canvasWidth;
  void canvasHeight;
  void dpr;
  void cameraOffset;
  void cameraZoom;

  const coilHeight = (35 + tower.level * 8) * zoom;
  const isAttacking = Date.now() - tower.lastAttack < 300;
  const attackIntensity = isAttacking
    ? Math.max(0, 1 - (Date.now() - tower.lastAttack) / 300)
    : 0;
  const ringCount = 6 + tower.level * 2;

  const ringPositions: { y: number; size: number; progress: number }[] = [];
  for (let ri = 0; ri < ringCount; ri++) {
    const rp = (ri + 1) / (ringCount + 1);
    const ry = topY - rp * (coilHeight - 18 * zoom) * 1.15;
    const rs = 14 - rp * 8;
    ringPositions.push({ y: ry, size: rs, progress: rp });
  }

  // Coil base platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#2a4a5f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    16 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Base energy pulse - ground-level glow intensifying when attacking
  const basePulseAlpha =
    0.04 +
    Math.sin(time * 2) * 0.02 +
    (isAttacking ? attackIntensity * 0.35 : 0);
  if (basePulseAlpha > 0.03) {
    const basePulseSize = 20 * zoom * (1 + Math.sin(time * 8) * 0.08);
    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = 15 * zoom * attackIntensity;
    }
    ctx.fillStyle = `rgba(0, 150, 255, ${basePulseAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY + 3 * zoom,
      basePulseSize,
      basePulseSize * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Radial pulse ring
    if (isAttacking) {
      const pulseExpand = ((Date.now() - tower.lastAttack) / 300) * 22 * zoom;
      const pulseRingAlpha =
        attackIntensity * 0.4 * (1 - pulseExpand / (22 * zoom));
      if (pulseRingAlpha > 0) {
        ctx.strokeStyle = `rgba(0, 200, 255, ${pulseRingAlpha})`;
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          topY + 3 * zoom,
          pulseExpand,
          pulseExpand * 0.4,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
  }

  // === BASE-LEVEL MECHANICAL SUBSYSTEMS (compact, tucked below coils) ===
  const baseY = topY;
  const baseR = 16 * zoom;

  // Small conductor stubs around the base (4 copper posts)
  for (let ci = 0; ci < 4; ci++) {
    const cAngle = (ci / 4) * Math.PI * 2 + Math.PI * 0.25;
    const cpx = Math.cos(cAngle);
    const cpy = Math.sin(cAngle) * 0.5;
    const stubX = screenPos.x + cpx * baseR;
    const stubY = baseY + cpy * baseR;
    const stubH = 8 * zoom;
    const vibrate = isAttacking
      ? Math.sin(time * 25 + ci * 2) * 1 * attackIntensity * zoom
      : 0;
    const shimmer = Math.sin(time * 3 + ci) * 20;

    ctx.strokeStyle = `rgb(${100 + shimmer}, ${65 + shimmer * 0.5}, 30)`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(stubX + vibrate + 0.5 * zoom, stubY + 0.5 * zoom);
    ctx.lineTo(stubX + vibrate + 0.5 * zoom, stubY - stubH + 0.5 * zoom);
    ctx.stroke();

    ctx.strokeStyle = `rgb(${170 + shimmer}, ${115 + shimmer * 0.5}, 55)`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(stubX + vibrate, stubY);
    ctx.lineTo(stubX + vibrate, stubY - stubH);
    ctx.stroke();

    // Top rivet
    ctx.fillStyle = "#ccaa77";
    ctx.beginPath();
    ctx.arc(stubX + vibrate, stubY - stubH, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = 4 * zoom * attackIntensity;
      ctx.fillStyle = `rgba(100, 200, 255, ${0.3 * attackIntensity})`;
      ctx.beginPath();
      ctx.arc(stubX + vibrate, stubY - stubH, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 2 small suspension insulators hanging from base bracket (back-side)
  for (const iAngle of [Math.PI * 0.85, Math.PI * 1.15]) {
    const ipx = Math.cos(iAngle);
    const ipy = Math.sin(iAngle) * 0.5;
    const armEndX = screenPos.x + ipx * (baseR + 4 * zoom);
    const armEndY = baseY + ipy * (baseR + 4 * zoom);

    ctx.strokeStyle = "#667788";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + ipx * 8 * zoom, baseY + ipy * 8 * zoom);
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();

    const sway =
      Math.sin(time * 1.5 + iAngle) *
      (isAttacking ? 0.15 + attackIntensity * 0.2 : 0.04);
    for (let d = 0; d < 2; d++) {
      const discY = armEndY + (d + 1) * 2.5 * zoom;
      const discX = armEndX + Math.sin(sway) * (d + 1) * 1.5 * zoom;
      const discR = (2.8 - d * 0.4) * zoom;
      const dg = ctx.createLinearGradient(
        discX - discR,
        discY,
        discX + discR,
        discY,
      );
      dg.addColorStop(0, "#8B7355");
      dg.addColorStop(0.5, "#D8C098");
      dg.addColorStop(1, "#8B7355");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.ellipse(discX, discY, discR, discR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central coil column - Enhanced 3D cylindrical structure
  const columnGrad = ctx.createLinearGradient(
    screenPos.x - 10 * zoom,
    0,
    screenPos.x + 10 * zoom,
    0,
  );
  columnGrad.addColorStop(0, "#1a3a4f");
  columnGrad.addColorStop(0.25, "#3a6a8f");
  columnGrad.addColorStop(0.5, "#4a7a9f");
  columnGrad.addColorStop(0.75, "#3a6a8f");
  columnGrad.addColorStop(1, "#1a3a4f");
  ctx.fillStyle = columnGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 8 * zoom, topY);
  ctx.lineTo(screenPos.x - 5 * zoom, topY - coilHeight + 12 * zoom);
  ctx.lineTo(screenPos.x + 5 * zoom, topY - coilHeight + 12 * zoom);
  ctx.lineTo(screenPos.x + 8 * zoom, topY);
  ctx.closePath();
  ctx.fill();

  // Add vertical structural ribs for better 3D effect
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1.5 * zoom;
  for (let rib = -1; rib <= 1; rib++) {
    const ribX = screenPos.x + rib * 4 * zoom;
    const topRibX = screenPos.x + rib * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(ribX, topY);
    ctx.lineTo(topRibX, topY - coilHeight + 12 * zoom);
    ctx.stroke();
  }

  // Column energy veins - pulsing blue lines along the column surface
  for (let v = 0; v < 3; v++) {
    const vAngle = (v / 3) * Math.PI + time * 0.3;
    const vx = Math.cos(vAngle) * 0.3;
    const baseVeinX = screenPos.x + vx * 8 * zoom;
    const topVeinX = screenPos.x + vx * 5 * zoom;
    const vAlpha =
      0.12 +
      Math.sin(time * 4 + v * 2.1) * 0.08 +
      (isAttacking ? attackIntensity * 0.35 : 0);
    ctx.strokeStyle = `rgba(0, 180, 255, ${vAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(baseVeinX, topY);
    ctx.lineTo(topVeinX, topY - coilHeight + 12 * zoom);
    ctx.stroke();
    if (isAttacking) {
      ctx.shadowColor = "#00ccff";
      ctx.shadowBlur = 4 * zoom * attackIntensity;
      ctx.strokeStyle = `rgba(0, 220, 255, ${0.25 * attackIntensity})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(baseVeinX, topY);
      ctx.lineTo(topVeinX, topY - coilHeight + 12 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Dual counter-rotating energy helix spiraling up the column
  const helixTurns = 3 + tower.level;
  const helixPts = helixTurns * 10;
  const helixSpeed = time * (1.5 + (isAttacking ? 3 * attackIntensity : 0));
  for (let strand = 0; strand < 2; strand++) {
    const strandDir = strand === 0 ? 1 : -1;
    const strandAlpha =
      strand === 0
        ? isAttacking
          ? 0.25 + attackIntensity * 0.35
          : 0.12
        : isAttacking
          ? 0.15 + attackIntensity * 0.2
          : 0.08;
    ctx.strokeStyle = `rgba(${strand === 0 ? "0, 220, 255" : "100, 200, 255"}, ${strandAlpha})`;
    ctx.lineWidth = (strand === 0 ? 1.5 : 1) * zoom;
    if (isAttacking && strand === 0) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 5 * zoom * attackIntensity;
    }
    ctx.beginPath();
    for (let h = 0; h <= helixPts; h++) {
      const ht = h / helixPts;
      const hAngle =
        strandDir * ht * helixTurns * Math.PI * 2 +
        helixSpeed * (strand === 0 ? 1 : 0.7);
      const hRadius = (10 - strand) * zoom * (1 - ht * 0.35);
      const hx = screenPos.x + Math.cos(hAngle) * hRadius;
      const hy =
        topY - ht * (coilHeight - 12 * zoom) + Math.sin(hAngle) * hRadius * 0.3;
      if (h === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // === FRONT-SIDE BASE INSULATORS (compact, at base level) ===
  for (const iAngle of [Math.PI * 0.15, Math.PI * 1.85]) {
    const ipx = Math.cos(iAngle);
    const ipy = Math.sin(iAngle) * 0.5;
    const armEndX = screenPos.x + ipx * (baseR + 4 * zoom);
    const armEndY = baseY + ipy * (baseR + 4 * zoom);

    ctx.strokeStyle = "#667788";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + ipx * 8 * zoom, baseY + ipy * 8 * zoom);
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();

    const sway =
      Math.sin(time * 1.5 + iAngle) *
      (isAttacking ? 0.15 + attackIntensity * 0.2 : 0.04);
    for (let d = 0; d < 2; d++) {
      const discY = armEndY + (d + 1) * 2.5 * zoom;
      const discX = armEndX + Math.sin(sway) * (d + 1) * 1.5 * zoom;
      const discR = (2.8 - d * 0.4) * zoom;
      const dg = ctx.createLinearGradient(
        discX - discR,
        discY,
        discX + discR,
        discY,
      );
      dg.addColorStop(0, "#8B7355");
      dg.addColorStop(0.5, "#D8C098");
      dg.addColorStop(1, "#8B7355");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.ellipse(discX, discY, discR, discR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tesla coil rings with mechanical components
  for (let i = 0; i < ringCount; i++) {
    const ringBob =
      Math.sin(time * 3 + i * 0.8) * 0.6 * zoom +
      (isAttacking
        ? Math.sin(time * 12 + i * 1.5) * 1.5 * zoom * attackIntensity
        : 0);
    const ringY = ringPositions[i].y + ringBob;
    const ringSizeBase = ringPositions[i].size;
    const sizePulse =
      1 +
      Math.sin(time * 4 + i * 0.6) * 0.03 +
      (isAttacking ? Math.sin(time * 10 + i) * 0.08 * attackIntensity : 0);
    const ringSize = ringSizeBase * sizePulse;
    const energyPulse =
      Math.sin(time * 6 - i * 0.5) * 0.4 +
      (isAttacking ? Math.sin(time * 15 + i) * 0.3 * attackIntensity : 0);
    const ringRotation =
      time * (0.8 + (isAttacking ? 2.5 * attackIntensity : 0)) + i * 0.4;

    // Blue glow effect when firing
    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = (12 + attackIntensity * 8) * zoom;
      ctx.fillStyle = `rgba(0, 150, 255, ${0.3 + attackIntensity * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        ringY,
        (ringSize + 2) * zoom,
        (ringSize + 2) * zoom * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ring shadow (back edge) - darker copper
    ctx.fillStyle = `rgb(${80 + energyPulse * 15}, ${50 + energyPulse * 10}, ${25})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY + 2.5 * zoom,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Main ring body - copper with 3D effect and rotation animation
    const rotOffset =
      Math.sin(ringRotation) *
      (1.5 + (isAttacking ? 2.5 * attackIntensity : 0)) *
      zoom;
    const ringGrad = ctx.createLinearGradient(
      screenPos.x - ringSize * zoom + rotOffset,
      ringY,
      screenPos.x + ringSize * zoom + rotOffset,
      ringY,
    );
    const blueShift = isAttacking ? attackIntensity * 60 : 0;
    ringGrad.addColorStop(
      0,
      `rgb(${120 + energyPulse * 25 - blueShift * 0.3}, ${75 + energyPulse * 15 + blueShift * 0.5}, ${35 + blueShift})`,
    );
    ringGrad.addColorStop(
      0.3,
      `rgb(${180 + energyPulse * 40 - blueShift * 0.3}, ${120 + energyPulse * 25 + blueShift * 0.5}, ${55 + blueShift})`,
    );
    ringGrad.addColorStop(
      0.5,
      `rgb(${220 + energyPulse * 35 - blueShift * 0.3}, ${160 + energyPulse * 30 + blueShift * 0.5}, ${80 + blueShift})`,
    );
    ringGrad.addColorStop(
      0.7,
      `rgb(${180 + energyPulse * 40 - blueShift * 0.3}, ${120 + energyPulse * 25 + blueShift * 0.5}, ${55 + blueShift})`,
    );
    ringGrad.addColorStop(
      1,
      `rgb(${120 + energyPulse * 25 - blueShift * 0.3}, ${75 + energyPulse * 15 + blueShift * 0.5}, ${35 + blueShift})`,
    );

    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Ring highlight with rotation shift
    ctx.strokeStyle = `rgba(255, ${200 + energyPulse * 55}, ${120 + energyPulse * 30 + blueShift}, ${0.6 + energyPulse * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + rotOffset * 0.3,
      ringY - 1 * zoom,
      ringSize * zoom * 0.85,
      ringSize * zoom * 0.35,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Rotating tick marks around ring (gauge-like dial marks)
    for (let t = 0; t < 8; t++) {
      const tAngle = ringRotation + (t / 8) * Math.PI * 2;
      const tInR = ringSize * 0.6 * zoom;
      const tOutR = ringSize * 0.82 * zoom;
      const tx1 = screenPos.x + Math.cos(tAngle) * tInR;
      const ty1 = ringY + Math.sin(tAngle) * tInR * 0.4;
      const tx2 = screenPos.x + Math.cos(tAngle) * tOutR;
      const ty2 = ringY + Math.sin(tAngle) * tOutR * 0.4;
      ctx.strokeStyle = `rgba(255, 200, 120, ${0.2 + energyPulse * 0.1 + (isAttacking ? attackIntensity * 0.25 : 0)})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    // Inner ring detail ellipse
    ctx.strokeStyle = `rgba(200, 150, 80, ${0.18 + energyPulse * 0.08})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringSize * zoom * 0.55,
      ringSize * zoom * 0.22,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Energy glow between rings (every other ring)
    if (i > 0 && i % 2 === 0) {
      const glowAlpha = 0.2 + energyPulse * 0.2 + (isAttacking ? 0.4 : 0);
      ctx.fillStyle = `rgba(0, 200, 255, ${glowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        ringY + (coilHeight / ringCount) * 0.6,
        ringSize * zoom * 0.6,
        ringSize * zoom * 0.25,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Animated energy flow on ring (when attacking) - enhanced blue glow
    if (isAttacking) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
      const flowAngle = time * 10 + i * 0.7;
      const flowX = screenPos.x + Math.cos(flowAngle) * ringSize * zoom;
      const flowY = ringY + Math.sin(flowAngle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(100, 220, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(flowX, flowY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Secondary flow particle
      const flow2Angle = flowAngle + Math.PI;
      const flow2X = screenPos.x + Math.cos(flow2Angle) * ringSize * zoom;
      const flow2Y = ringY + Math.sin(flow2Angle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(50, 180, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(flow2X, flow2Y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Third flow particle for more dramatic effect
      const flow3Angle = flowAngle + Math.PI * 0.5;
      const flow3X = screenPos.x + Math.cos(flow3Angle) * ringSize * zoom;
      const flow3Y = ringY + Math.sin(flow3Angle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(150, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(flow3X, flow3Y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Electromagnetic field lines between adjacent rings
    if (i > 0) {
      const prevRingData = ringPositions[i - 1];
      const prevRY =
        prevRingData.y + Math.sin(time * 3 + (i - 1) * 0.8) * 0.6 * zoom;
      const fieldAlpha = isAttacking ? 0.25 + attackIntensity * 0.45 : 0.08;
      for (let fl = 0; fl < 4; fl++) {
        const fAngle =
          time * (1.8 + (isAttacking ? 3 * attackIntensity : 0)) +
          i * 0.7 +
          fl * (Math.PI * 0.5);
        const fAmpBase = (2.5 + Math.sin(time * 3.5 + fl * 1.2) * 1.2) * zoom;
        const fAmp = fAmpBase * (1 + (isAttacking ? attackIntensity * 0.8 : 0));
        const fMidY = (ringY + prevRY) * 0.5;
        const fStartX = screenPos.x + Math.cos(fAngle) * ringSize * zoom * 0.35;
        const fEndX =
          screenPos.x +
          Math.cos(fAngle) * prevRingData.size * sizePulse * zoom * 0.35;
        const fCtrlX =
          screenPos.x + Math.cos(fAngle + Math.sin(time * 2) * 0.3) * fAmp;

        ctx.strokeStyle = `rgba(80, 200, 255, ${fieldAlpha * (0.4 + Math.sin(time * 5 + fl * 1.5) * 0.3)})`;
        ctx.lineWidth =
          (0.6 + (isAttacking ? attackIntensity * 0.6 : 0)) * zoom;
        ctx.beginPath();
        ctx.moveTo(fStartX, ringY);
        ctx.quadraticCurveTo(fCtrlX, fMidY, fEndX, prevRY);
        ctx.stroke();
      }
    }

    // Ring edge sparking
    if (isAttacking || Math.sin(time * 8 + i * 3.7) > 0.82) {
      const numEdgeSparks = isAttacking ? 2 : 1;
      for (let es = 0; es < numEdgeSparks; es++) {
        const spkAngle = time * (12 + es * 7) + i * 2.3 + es * Math.PI;
        const spkEdgeX = screenPos.x + Math.cos(spkAngle) * ringSize * zoom;
        const spkEdgeY = ringY + Math.sin(spkAngle) * ringSize * zoom * 0.4;
        const spkAlpha = 0.5 + attackIntensity * 0.5;

        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 5 * zoom;
        ctx.fillStyle = `rgba(200, 255, 255, ${spkAlpha})`;
        ctx.beginPath();
        ctx.arc(
          spkEdgeX,
          spkEdgeY,
          (1 + attackIntensity * 0.8) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        const boltLen =
          (3.5 + Math.sin(time * 18 + es) * 2) * zoom * (1 + attackIntensity);
        const boltAng = spkAngle + Math.sin(time * 10 + es * 3) * 0.6;
        ctx.strokeStyle = `rgba(150, 255, 255, ${spkAlpha * 0.8})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(spkEdgeX, spkEdgeY);
        const midBX =
          spkEdgeX +
          Math.cos(boltAng) * boltLen * 0.5 +
          Math.sin(time * 25 + es) * zoom;
        const midBY = spkEdgeY + Math.sin(boltAng) * boltLen * 0.2;
        ctx.lineTo(midBX, midBY);
        ctx.lineTo(
          spkEdgeX + Math.cos(boltAng) * boltLen,
          spkEdgeY + Math.sin(boltAng) * boltLen * 0.3,
        );
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }

  // === BASE-LEVEL MECHANICAL DETAILS (pistons, dampers, jumpers at base) ===
  {
    // Small pistons around the base platform
    const basePistonAngles = [
      Math.PI * 0.25,
      Math.PI * 0.75,
      Math.PI * 1.25,
      Math.PI * 1.75,
    ];
    for (const pAngle of basePistonAngles) {
      const ppx = Math.cos(pAngle);
      const ppy = Math.sin(pAngle) * 0.5;
      const pistonBaseX = screenPos.x + ppx * 14 * zoom;
      const pistonBaseY = topY + 2 * zoom + ppy * 14 * zoom;
      const pistonExt = isAttacking
        ? 3 * zoom +
          Math.sin(time * 18 + pAngle * 3) * 3 * zoom * attackIntensity
        : 3 * zoom + Math.sin(time * 2 + pAngle) * 0.5 * zoom;

      // Cylinder housing
      ctx.fillStyle = "#4a5a6a";
      ctx.beginPath();
      ctx.ellipse(
        pistonBaseX,
        pistonBaseY,
        2.5 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Piston rod
      ctx.strokeStyle = "#8a9aaa";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(pistonBaseX, pistonBaseY);
      ctx.lineTo(pistonBaseX, pistonBaseY - pistonExt);
      ctx.stroke();

      // Rod tip
      ctx.fillStyle = "#aabbcc";
      ctx.beginPath();
      ctx.arc(pistonBaseX, pistonBaseY - pistonExt, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Pressure glow when attacking
      if (isAttacking) {
        ctx.fillStyle = `rgba(0, 180, 255, ${0.3 * attackIntensity})`;
        ctx.beginPath();
        ctx.arc(pistonBaseX, pistonBaseY - pistonExt, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Vibration damper springs at base sides
    for (const dAngle of [0, Math.PI]) {
      const dpx = Math.cos(dAngle);
      const dpy = Math.sin(dAngle) * 0.5;
      const damperX = screenPos.x + dpx * 16 * zoom;
      const damperY = topY + 3 * zoom + dpy * 8 * zoom;
      const compress = isAttacking
        ? Math.sin(time * 15 + dAngle) * 2 * zoom * attackIntensity
        : 0;

      // Spring zigzag
      ctx.strokeStyle = "#7a8a7a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      const springH = 6 * zoom + compress;
      for (let s = 0; s <= 4; s++) {
        const sy = damperY - (s / 4) * springH;
        const sx = damperX + (s % 2 === 0 ? -1.5 : 1.5) * zoom;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Mass block at top
      ctx.fillStyle = "#5a6a7a";
      ctx.fillRect(
        damperX - 2.5 * zoom,
        damperY - springH - 2 * zoom,
        5 * zoom,
        2 * zoom,
      );
    }

    // Jumper wires between base conductors
    for (const pair of [
      { from: Math.PI * 0.25, to: Math.PI * 0.75 },
      { from: Math.PI * 1.25, to: Math.PI * 1.75 },
    ]) {
      const fx = screenPos.x + Math.cos(pair.from) * 14 * zoom;
      const fy = topY + Math.sin(pair.from) * 0.5 * 7 * zoom;
      const tx = screenPos.x + Math.cos(pair.to) * 14 * zoom;
      const ty = topY + Math.sin(pair.to) * 0.5 * 7 * zoom;
      const ctrlY = Math.min(fy, ty) + 6 * zoom;

      // Wire
      ctx.strokeStyle = "#aa4444";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo((fx + tx) / 2, ctrlY, tx, ty);
      ctx.stroke();

      // Insulation bands
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2 * zoom;
      for (let b = 0.2; b <= 0.8; b += 0.3) {
        const bx =
          (1 - b) * (1 - b) * fx +
          2 * (1 - b) * b * ((fx + tx) / 2) +
          b * b * tx;
        const by =
          (1 - b) * (1 - b) * fy + 2 * (1 - b) * b * ctrlY + b * b * ty;
        ctx.beginPath();
        ctx.arc(bx, by, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spark when attacking
      if (isAttacking) {
        const sparkT = (time * 6 + pair.from) % 1;
        const omt = 1 - sparkT;
        const sx =
          omt * omt * fx +
          2 * omt * sparkT * ((fx + tx) / 2) +
          sparkT * sparkT * tx;
        const sy =
          omt * omt * fy + 2 * omt * sparkT * ctrlY + sparkT * sparkT * ty;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 4 * zoom;
        ctx.fillStyle = `rgba(200, 255, 255, ${0.7 * attackIntensity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // === RESONANCE PULSE RINGS (expanding during attacks) ===
  if (isAttacking || attackIntensity > 0) {
    const pulseCount = 3;
    for (let pr = 0; pr < pulseCount; pr++) {
      const pulseAge = (time * 2 + pr * 1.2) % 2.0;
      if (pulseAge < 1.5) {
        const pulseFrac = pulseAge / 1.5;
        const pulseAlpha = (1 - pulseFrac) * 0.3 * attackIntensity;
        const pulseRadius = (8 + pulseFrac * 25) * zoom;
        const pulseY = topY - coilHeight * 0.5;

        ctx.strokeStyle = `rgba(80, 200, 255, ${pulseAlpha})`;
        ctx.lineWidth = (1.5 - pulseFrac * 0.8) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          pulseY,
          pulseRadius,
          pulseRadius * 0.35,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        if (pulseAlpha > 0.1) {
          ctx.strokeStyle = `rgba(180, 240, 255, ${pulseAlpha * 0.5})`;
          ctx.lineWidth = 0.5 * zoom;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            pulseY,
            pulseRadius * 0.95,
            pulseRadius * 0.33,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    }
  }

  // === AMBIENT EM HUM (passive vertical energy column) ===
  const humAlpha =
    0.04 +
    Math.sin(time * 2) * 0.02 +
    (isAttacking ? attackIntensity * 0.12 : 0);
  const humGrad = ctx.createLinearGradient(
    screenPos.x,
    topY,
    screenPos.x,
    topY - coilHeight,
  );
  humGrad.addColorStop(0, "rgba(0, 150, 255, 0)");
  humGrad.addColorStop(0.3, `rgba(0, 180, 255, ${humAlpha})`);
  humGrad.addColorStop(0.7, `rgba(0, 200, 255, ${humAlpha * 1.5})`);
  humGrad.addColorStop(1, "rgba(100, 220, 255, 0)");
  ctx.fillStyle = humGrad;
  const humWidth =
    (4 + Math.sin(time * 3) * 1 + (isAttacking ? attackIntensity * 3 : 0)) *
    zoom;
  ctx.fillRect(
    screenPos.x - humWidth / 2,
    topY - coilHeight,
    humWidth,
    coilHeight,
  );

  // Energy orb at top - THIS IS WHERE LIGHTNING ORIGINATES
  const orbY = topY - coilHeight + 5 * zoom;
  const orbPulse = 1 + Math.sin(time * 6) * 0.2 + attackIntensity * 0.3;
  const orbSize = (10 + tower.level * 2) * zoom;

  // Store the orb position for projectile origin calculations
  tower._orbScreenY = orbY;

  // Outer energy field - brighter when attacking
  const fieldAlphaBase = isAttacking ? 0.25 : 0.15;
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x,
    orbY,
    0,
    screenPos.x,
    orbY,
    orbSize * (2.5 + attackIntensity * 0.5) * orbPulse,
  );
  energyFieldGrad.addColorStop(
    0,
    `rgba(0, 255, 255, ${fieldAlphaBase + attackIntensity * 0.2})`,
  );
  energyFieldGrad.addColorStop(
    0.4,
    `rgba(0, 200, 255, ${0.08 + attackIntensity * 0.15})`,
  );
  energyFieldGrad.addColorStop(
    0.7,
    `rgba(0, 150, 255, ${0.03 + attackIntensity * 0.08})`,
  );
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x,
    orbY,
    orbSize * (2.5 + attackIntensity * 0.5) * orbPulse,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main orb - increased glow when attacking
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (30 + attackIntensity * 25) * zoom * orbPulse;
  const orbGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    orbY - 3 * zoom,
    0,
    screenPos.x,
    orbY,
    orbSize * orbPulse,
  );
  // Brighter gradient when attacking
  if (isAttacking) {
    orbGrad.addColorStop(0, "#ffffff");
    orbGrad.addColorStop(0.15, "#ffffff");
    orbGrad.addColorStop(0.35, "#ccffff");
    orbGrad.addColorStop(0.6, "#00ffff");
    orbGrad.addColorStop(0.85, "#0088ff");
    orbGrad.addColorStop(1, "#0066cc");
  } else {
    orbGrad.addColorStop(0, "#ffffff");
    orbGrad.addColorStop(0.2, "#ccffff");
    orbGrad.addColorStop(0.5, "#00ffff");
    orbGrad.addColorStop(0.8, "#0088ff");
    orbGrad.addColorStop(1, "#0044aa");
  }
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbSize * orbPulse, 0, Math.PI * 2);
  ctx.fill();

  // Bright solid glowing core when attacking
  if (isAttacking) {
    // Solid bright core
    const coreGrad = ctx.createRadialGradient(
      screenPos.x,
      orbY,
      0,
      screenPos.x,
      orbY,
      orbSize * 0.5 * orbPulse,
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackIntensity})`);
    coreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackIntensity * 0.9})`);
    coreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackIntensity * 0.5})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, orbY, orbSize * 0.5 * orbPulse, 0, Math.PI * 2);
    ctx.fill();

    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackIntensity})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, orbY, orbSize * 0.2 * orbPulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Electric arcs from orb - 3D multi-layered lightning bolts
  const arcCount = 6 + tower.level * 2;
  for (let i = 0; i < arcCount; i++) {
    const arcAngle = time * 2.5 + i * ((Math.PI * 2) / arcCount);
    const arcLength = (20 + Math.sin(time * 11 + i * 3.7) * 10) * zoom;
    const segCount = 5 + Math.floor(Math.sin(time * 7 + i * 2.1) * 1.5 + 1.5);

    const boltPts: { x: number; y: number }[] = [{ x: screenPos.x, y: orbY }];
    for (let s = 1; s <= segCount; s++) {
      const t = s / segCount;
      const jAmp = (1 - t * 0.3) * 8 * zoom;
      const jx = Math.sin(time * 20 + i * 4.1 + s * 6.3) * jAmp;
      const jy = Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4;
      boltPts.push({
        x: screenPos.x + Math.cos(arcAngle) * arcLength * t + jx,
        y: orbY + Math.sin(arcAngle) * arcLength * 0.4 * t + jy,
      });
    }

    // Layer 1: wide blurry glow
    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10 * zoom;
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.18 + attackIntensity * 0.15})`;
    ctx.lineWidth = 4 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++) ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();
    ctx.restore();

    // Layer 2: bright cyan core
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + attackIntensity * 0.3})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++) ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();

    // Layer 3: thin white-hot center
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + attackIntensity * 0.3})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++) ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();

    // Glow node at tip
    const tip = boltPts[boltPts.length - 1];
    ctx.fillStyle = `rgba(200, 255, 255, ${0.5 + attackIntensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Sub-branches from the middle of every other bolt
    if (i % 2 === 0) {
      const bIdx = Math.max(1, Math.floor(segCount * 0.45));
      const bp = boltPts[bIdx];
      const bAngle = arcAngle + Math.sin(time * 10 + i * 2.3) * 0.9;
      const bLen = arcLength * 0.45;
      const bMid = {
        x: bp.x + Math.cos(bAngle) * bLen * 0.5 + Math.sin(time * 22 + i) * 2 * zoom,
        y: bp.y + Math.sin(bAngle) * bLen * 0.2,
      };
      const bEnd = {
        x: bp.x + Math.cos(bAngle) * bLen,
        y: bp.y + Math.sin(bAngle) * bLen * 0.35,
      };

      ctx.strokeStyle = `rgba(0, 220, 255, ${0.3 + attackIntensity * 0.2})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(180, 255, 255, ${0.4 + attackIntensity * 0.25})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + attackIntensity * 0.2})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();
    }
  }

  // Ground-level electricity crackling to nearby rings
  if (Date.now() - tower.lastAttack < 300) {
    for (let g = 0; g < 5; g++) {
      const groundArc = time * 12 + g * 1.5;
      const gx = screenPos.x + Math.sin(groundArc) * 12 * zoom;
      const gy = topY + 3 * zoom;
      const gmx = screenPos.x + Math.sin(groundArc + 0.5) * 6 * zoom;
      const gmy = topY - 2 * zoom;

      ctx.save();
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.15 * attackIntensity})`;
      ctx.lineWidth = 3 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gmx, gmy);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 * attackIntensity})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gmx, gmy);
      ctx.lineTo(gx, gy);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * attackIntensity})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gmx, gmy);
      ctx.lineTo(gx, gy);
      ctx.stroke();
    }
  }
}

function renderFocusedBeam(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  void enemies;
  void selectedMap;
  void canvasWidth;
  void canvasHeight;
  void dpr;
  void cameraOffset;
  void cameraZoom;

  const coilHeight = 65 * zoom;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 400;
  const attackPulse = isAttacking
    ? Math.sin((timeSinceFire / 400) * Math.PI)
    : 0;

  // === MASSIVE ARCANE BASE ===
  // Dark iron foundation
  ctx.fillStyle = "#0a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 8 * zoom,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing rune circle on base
  ctx.strokeStyle = `rgba(0, 255, 255, ${
    0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4
  })`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 6 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Arcane runes around base
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time * 0.5;
    const runeX = screenPos.x + Math.cos(angle) * 22 * zoom;
    const runeY = topY + 6 * zoom + Math.sin(angle) * 11 * zoom;
    const runeGlow = 0.4 + Math.sin(time * 3 + i) * 0.2 + attackPulse * 0.5;

    ctx.fillStyle = `rgba(0, 255, 255, ${runeGlow})`;
    ctx.font = `${8 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"][i], runeX, runeY);
  }

  // Elevated tech platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 3 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Platform machinery details
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const detailAngle = (i / 5) * Math.PI * 2 + time;
    const detailX = screenPos.x + Math.cos(detailAngle) * 18 * zoom;
    const detailY = topY + 3 * zoom + Math.sin(detailAngle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY + 3 * zoom);
    ctx.lineTo(detailX, detailY);
    ctx.stroke();
  }

  // === SUPPORT PYLONS ===
  for (let i = -1; i <= 1; i += 2) {
    const pylonX = screenPos.x + i * 12 * zoom;

    // Pylon body
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.moveTo(pylonX - 4 * zoom, topY);
    ctx.lineTo(pylonX - 2 * zoom, topY - coilHeight + 20 * zoom);
    ctx.lineTo(pylonX + 2 * zoom, topY - coilHeight + 20 * zoom);
    ctx.lineTo(pylonX + 4 * zoom, topY);
    ctx.closePath();
    ctx.fill();

    // Energy conduit on pylon
    const conduitGlow = 0.5 + Math.sin(time * 4 + i) * 0.3 + attackPulse * 0.5;
    ctx.strokeStyle = `rgba(0, 255, 255, ${conduitGlow})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pylonX, topY - 5 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 25 * zoom);
    ctx.stroke();

    // Pylon energy node
    ctx.fillStyle = `rgba(0, 255, 255, ${conduitGlow})`;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(pylonX, topY - coilHeight + 22 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  //support pylon amplifiers
  for (let i = 0; i < 4; i++) {
    const ampAngle = (i / 4) * Math.PI * 2 + time;
    const ampX = screenPos.x + Math.cos(ampAngle) * 16 * zoom;
    const ampY = topY - 4 * zoom + Math.sin(ampAngle) * 8 * zoom;
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.ellipse(ampX, ampY, 4 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // tesla coils on platform corners
  for (let i = 0; i < 4; i++) {
    const coilAngle = (i / 4) * Math.PI * 2 + time;
    const coilX = screenPos.x + Math.cos(coilAngle) * 16 * zoom;
    const coilY = topY - 4 * zoom + Math.sin(coilAngle) * 8 * zoom;
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.ellipse(coilX, coilY, 4 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // add actual copper coils
    const coilTurns = 5;
    for (let j = 0; j < coilTurns; j++) {
      const turnY = coilY - 6 * zoom + (j / coilTurns) * (12 * zoom);
      const turnGlow = 0.3 + Math.sin(time * 4 + j) * 0.2 + attackPulse * 0.4;
      ctx.strokeStyle = `rgba(184, 115, 51, ${turnGlow})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(coilX, turnY, 3 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3D layered lightning from amplifier coils to dish
    const ampSegCnt = 5;
    const ampEndX = screenPos.x;
    const ampEndY = topY - coilHeight + 12 * zoom;
    const ampBoltPts: { x: number; y: number }[] = [{ x: coilX, y: coilY - 6 * zoom }];
    for (let s = 1; s <= ampSegCnt; s++) {
      const t = s / ampSegCnt;
      const jAmp = (1 - t * 0.3) * 7 * zoom;
      ampBoltPts.push({
        x: coilX + (ampEndX - coilX) * t + Math.sin(time * 20 + i * 5.1 + s * 6.3) * jAmp,
        y: (coilY - 6 * zoom) + (ampEndY - (coilY - 6 * zoom)) * t + Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4,
      });
    }

    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.18 + attackPulse * 0.15})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++) ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(0, 255, 255, ${0.45 + attackPulse * 0.35})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++) ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + attackPulse * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++) ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
  }

  // ring below pylon amplifiers
  const ringGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.strokeStyle = `rgba(0, 255, 255, ${ringGlow})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const ringAngle = (i / 4) * Math.PI * 2 + time;
    const ringX = screenPos.x + Math.cos(ringAngle) * 16 * zoom;
    const ringY = topY + 12 * zoom + Math.sin(ringAngle) * 8 * zoom - 10 * zoom;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === MASSIVE FOCUSING DISH ===
  // Outer dish ring
  const dishY = topY - coilHeight + 12 * zoom;
  const dishSize = 28 + attackPulse * 4;

  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    dishY,
    dishSize * zoom,
    dishSize * 0.72 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Dish metallic gradient
  const dishGrad = ctx.createRadialGradient(
    screenPos.x - 8 * zoom,
    dishY - 4 * zoom,
    0,
    screenPos.x,
    dishY,
    dishSize * zoom,
  );
  dishGrad.addColorStop(0, "#5d9abe");
  dishGrad.addColorStop(0.4, "#3d7a9e");
  dishGrad.addColorStop(0.8, "#2d5a7b");
  dishGrad.addColorStop(1, "#1a3a4f");
  ctx.fillStyle = dishGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    dishY,
    (dishSize - 3) * zoom,
    (dishSize * 0.72 - 2) * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Inner dish concentric rings
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = dishSize - 8 - ring * 5;
    const ringGlow = 0.2 + Math.sin(time * 3 + ring) * 0.1 + attackPulse * 0.3;
    ctx.strokeStyle = `rgba(0, 255, 255, ${ringGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      dishY,
      ringSize * zoom,
      ringSize * 0.72 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // === CENTRAL FOCUS CRYSTAL ===
  const crystalY = dishY - 5 * zoom;
  const crystalPulse = 1 + Math.sin(time * 5) * 0.1 + attackPulse * 0.3;

  // Crystal housing
  ctx.fillStyle = "#2d5a7b";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    crystalY + 8 * zoom,
    8 * zoom,
    4 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Floating crystal shards
  for (let i = 0; i < 4; i++) {
    const shardAngle = (i / 4) * Math.PI * 2 + time * 2;
    const shardDist = 15 + Math.sin(time * 3 + i * 1.5) * 3;
    const shardX = screenPos.x + Math.cos(shardAngle) * shardDist * zoom;
    const shardY = crystalY + Math.sin(shardAngle) * shardDist * 0.4 * zoom;

    ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + attackPulse * 0.4})`;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(shardX, shardY - 5 * zoom);
    ctx.lineTo(shardX - 2 * zoom, shardY);
    ctx.lineTo(shardX, shardY + 3 * zoom);
    ctx.lineTo(shardX + 2 * zoom, shardY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Main crystal core - unique focused beam style
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (20 + attackPulse * 25) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 10 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner crystal glow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 5 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Bright solid core flash when attacking
  if (attackPulse > 0.1) {
    // Expanding bright core
    const flashSize = 8 * crystalPulse * zoom * (1 + attackPulse * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, crystalY, flashSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, crystalY, flashSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Store emitter position
  tower._orbScreenY = crystalY;

  // === CRACKLING ENERGY ARCS - 3D layered lightning ===
  for (let i = 0; i < 12; i++) {
    const angle = time * 3 + i * (Math.PI / 6);
    const dist = 20 + Math.sin(time * 6 + i) * 5;
    const ex = screenPos.x + Math.cos(angle) * dist * zoom;
    const ey = dishY + Math.sin(angle) * dist * 0.5 * zoom;
    const segCnt = 3;

    const crackPts: { x: number; y: number }[] = [{ x: screenPos.x, y: crystalY }];
    for (let s = 1; s <= segCnt; s++) {
      const t = s / segCnt;
      const jAmp = (1 - t * 0.3) * 7 * zoom;
      crackPts.push({
        x: screenPos.x + (ex - screenPos.x) * t + Math.sin(time * 22 + i * 4.3 + s * 6.1) * jAmp,
        y: crystalY + (ey - crystalY) * t + Math.cos(time * 18 + i * 3.1 + s * 8.7) * jAmp * 0.4,
      });
    }

    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.15 + attackPulse * 0.12})`;
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, crackPts[0].y);
    for (let p = 1; p < crackPts.length; p++) ctx.lineTo(crackPts[p].x, crackPts[p].y);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + attackPulse * 0.3})`;
    ctx.lineWidth = (1.2 + attackPulse * 0.5) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, crackPts[0].y);
    for (let p = 1; p < crackPts.length; p++) ctx.lineTo(crackPts[p].x, crackPts[p].y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + attackPulse * 0.25})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, crackPts[0].y);
    for (let p = 1; p < crackPts.length; p++) ctx.lineTo(crackPts[p].x, crackPts[p].y);
    ctx.stroke();
  }

  // === BEAM CHARGING EFFECT ===
  if (isAttacking) {
    const beamPhase = timeSinceFire / 400;

    // Expanding energy rings
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (beamPhase + ring * 0.15) % 1;
      const ringRadius = 5 + ringPhase * 25;
      const ringAlpha = (1 - ringPhase) * 0.6;

      ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
      ctx.lineWidth = 2 * zoom * (1 - ringPhase);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        crystalY,
        ringRadius * zoom,
        ringRadius * 0.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Core flash
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - beamPhase) * 0.8})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      crystalY,
      15 * (1 - beamPhase * 0.5) * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function renderChainLightning(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const coilHeight = 65 * zoom;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 400;
  const attackPulse = isAttacking
    ? Math.sin((timeSinceFire / 400) * Math.PI)
    : 0;

  // Base platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === MASSIVE ARCANE BASE ===
  // Dark iron foundation
  ctx.fillStyle = "#0a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 8 * zoom,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing tech modules that pulse the base
  ctx.strokeStyle = `rgba(0, 255, 255, ${
    0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4
  })`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 6 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Elevated tech platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 3 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // machinery on foundation platform (not a spinning thing)
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const detailAngle = (i / 5) * Math.PI * 2 + time;
    const detailX = screenPos.x + Math.cos(detailAngle) * 18 * zoom;
    const detailY = topY + 3 * zoom + Math.sin(detailAngle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY + 3 * zoom);
    ctx.lineTo(detailX, detailY);
    ctx.stroke();
  }

  // Central pillar
  ctx.fillStyle = "#2d5a7b";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 6 * zoom, topY);
  ctx.lineTo(screenPos.x - 4 * zoom, topY - coilHeight + 20 * zoom);
  ctx.lineTo(screenPos.x + 4 * zoom, topY - coilHeight + 20 * zoom);
  ctx.lineTo(screenPos.x + 6 * zoom, topY);
  ctx.closePath();
  ctx.fill();

  // Multiple smaller coils around the main one
  const coilPositions = [
    { x: -16, y: 0, size: 0.7 },
    { x: 16, y: 0, size: 0.7 },
    { x: 0, y: -10, size: 0.8 },
    { x: 0, y: 10, size: 0.6 },
  ];

  for (const pos of coilPositions) {
    const cx = screenPos.x + pos.x * zoom;
    const cy = topY + pos.y * zoom;
    const coilSize = pos.size;

    // Mini coil base
    ctx.fillStyle = "#1a3a4f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      8 * zoom * coilSize,
      4 * zoom * coilSize,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // big amplifier/vents on top of the main circle
    ctx.fillStyle = "#3a6a8f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy - 2 * zoom * coilSize,
      10 * zoom * coilSize,
      5 * zoom * coilSize,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // tech circles under pylons
    ctx.fillStyle = "#2a4a5f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy - 1 * zoom * coilSize,
      6 * zoom * coilSize,
      3 * zoom * coilSize,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Mini coil pillar
    ctx.fillStyle = "#2d5a7b";
    ctx.fillRect(
      cx - 3 * zoom * coilSize,
      cy - 20 * zoom * coilSize,
      6 * zoom * coilSize,
      20 * zoom * coilSize,
    );

    // add copper coils to pylons
    const coilTurns = 4;
    for (let j = 0; j < coilTurns; j++) {
      const turnY =
        cy - 10 * zoom * coilSize + (j / coilTurns) * (12 * zoom * coilSize);
      const turnGlow = 0.3 + Math.sin(time * 4 + j) * 0.2 + attackPulse * 0.4;
      ctx.strokeStyle = `rgba(184, 115, 51, ${turnGlow})`;
      ctx.lineWidth = 2 * zoom * coilSize;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        turnY,
        5 * zoom * coilSize,
        2 * zoom * coilSize,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Mini orb using attackPulse - detailed electricity bulb
    const miniOrbY = cy - 25 * zoom * coilSize;
    const pulse = 0.8 + Math.sin(time * 6 + pos.x) * 0.2 + attackPulse * 0.3;
    const miniOrbSize = 6 * zoom * pulse * coilSize;

    // Outer energy field for mini orb - brighter when attacking
    const miniFieldAlpha = isAttacking ? 0.25 : 0.15;
    const miniFieldGrad = ctx.createRadialGradient(
      cx,
      miniOrbY,
      0,
      cx,
      miniOrbY,
      miniOrbSize * (2 + attackPulse * 0.5),
    );
    miniFieldGrad.addColorStop(
      0,
      `rgba(0, 255, 255, ${miniFieldAlpha + attackPulse * 0.2})`,
    );
    miniFieldGrad.addColorStop(
      0.5,
      `rgba(0, 200, 255, ${0.08 + attackPulse * 0.12})`,
    );
    miniFieldGrad.addColorStop(1, "rgba(0, 150, 255, 0)");
    ctx.fillStyle = miniFieldGrad;
    ctx.beginPath();
    ctx.arc(
      cx,
      miniOrbY,
      miniOrbSize * (2 + attackPulse * 0.5),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Main mini orb with gradient - brighter glow when attacking
    ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
    ctx.shadowBlur = (15 + attackPulse * 15) * zoom * pulse;
    const miniOrbGrad = ctx.createRadialGradient(
      cx - 1.5 * zoom * coilSize,
      miniOrbY - 1.5 * zoom * coilSize,
      0,
      cx,
      miniOrbY,
      miniOrbSize,
    );
    if (isAttacking) {
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.15, "#ffffff");
      miniOrbGrad.addColorStop(0.35, "#ccffff");
      miniOrbGrad.addColorStop(0.6, "#00ffff");
      miniOrbGrad.addColorStop(0.85, "#0088ff");
      miniOrbGrad.addColorStop(1, "#0066cc");
    } else {
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.25, "#ccffff");
      miniOrbGrad.addColorStop(0.5, "#00ffff");
      miniOrbGrad.addColorStop(0.8, "#0088ff");
      miniOrbGrad.addColorStop(1, "#0044aa");
    }
    ctx.fillStyle = miniOrbGrad;
    ctx.beginPath();
    ctx.arc(cx, miniOrbY, miniOrbSize, 0, Math.PI * 2);
    ctx.fill();

    // Solid glowing core when attacking for mini orbs
    if (attackPulse > 0.1) {
      // Solid bright core
      const miniCoreGrad = ctx.createRadialGradient(
        cx,
        miniOrbY,
        0,
        cx,
        miniOrbY,
        miniOrbSize * 0.5,
      );
      miniCoreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackPulse})`);
      miniCoreGrad.addColorStop(
        0.5,
        `rgba(220, 255, 255, ${attackPulse * 0.9})`,
      );
      miniCoreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackPulse * 0.5})`);
      ctx.fillStyle = miniCoreGrad;
      ctx.beginPath();
      ctx.arc(cx, miniOrbY, miniOrbSize * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner intense white point
      ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
      ctx.beginPath();
      ctx.arc(cx, miniOrbY, miniOrbSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Mini electric arcs from mini orbs - 3D layered
    const miniArcCount = 5;
    for (let a = 0; a < miniArcCount; a++) {
      const arcAngle = time * 3 + a * ((Math.PI * 2) / miniArcCount) + pos.x;
      const arcLength = (9 + Math.sin(time * 13 + a * 4.3 + pos.x) * 4) * zoom * coilSize;
      const segCnt = 3;

      const miniPts: { x: number; y: number }[] = [{ x: cx, y: miniOrbY }];
      for (let s = 1; s <= segCnt; s++) {
        const t = s / segCnt;
        const jAmp = (1 - t * 0.35) * 4 * zoom * coilSize;
        miniPts.push({
          x: cx + Math.cos(arcAngle) * arcLength * t + Math.sin(time * 22 + a * 5 + s * 7) * jAmp,
          y: miniOrbY + Math.sin(arcAngle) * arcLength * 0.4 * t + Math.cos(time * 18 + a * 4 + s * 9) * jAmp * 0.5,
        });
      }

      ctx.save();
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = `rgba(0, 180, 255, ${0.15 + attackPulse * 0.12})`;
      ctx.lineWidth = 3 * zoom * coilSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(miniPts[0].x, miniPts[0].y);
      for (let p = 1; p < miniPts.length; p++) ctx.lineTo(miniPts[p].x, miniPts[p].y);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = `rgba(0, 255, 255, ${0.45 + attackPulse * 0.25})`;
      ctx.lineWidth = 1.2 * zoom * coilSize;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(miniPts[0].x, miniPts[0].y);
      for (let p = 1; p < miniPts.length; p++) ctx.lineTo(miniPts[p].x, miniPts[p].y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + attackPulse * 0.2})`;
      ctx.lineWidth = 0.5 * zoom * coilSize;
      ctx.beginPath();
      ctx.moveTo(miniPts[0].x, miniPts[0].y);
      for (let p = 1; p < miniPts.length; p++) ctx.lineTo(miniPts[p].x, miniPts[p].y);
      ctx.stroke();
    }
  }

  // Central main orb - detailed electricity bulb
  const mainOrbY = topY - coilHeight + 4 * zoom - attackPulse * 5 * zoom;
  const mainOrbPulse = 0.9 + Math.sin(time * 5) * 0.2 + attackPulse * 0.3;
  const mainOrbSize = 12 * zoom * mainOrbPulse;

  // Store orb position
  tower._orbScreenY = mainOrbY;

  // Outer energy field - brighter when attacking
  const mainFieldAlpha = isAttacking ? 0.3 : 0.2;
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x,
    mainOrbY,
    0,
    screenPos.x,
    mainOrbY,
    mainOrbSize * (2.5 + attackPulse * 0.5),
  );
  energyFieldGrad.addColorStop(
    0,
    `rgba(0, 255, 255, ${mainFieldAlpha + attackPulse * 0.25})`,
  );
  energyFieldGrad.addColorStop(
    0.4,
    `rgba(0, 200, 255, ${0.1 + attackPulse * 0.15})`,
  );
  energyFieldGrad.addColorStop(
    0.7,
    `rgba(0, 150, 255, ${0.05 + attackPulse * 0.1})`,
  );
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x,
    mainOrbY,
    mainOrbSize * (2.5 + attackPulse * 0.5),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main orb with detailed gradient - brighter glow when attacking
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (30 + attackPulse * 30) * zoom * mainOrbPulse;
  const mainOrbGrad = ctx.createRadialGradient(
    screenPos.x - 4 * zoom,
    mainOrbY - 4 * zoom,
    0,
    screenPos.x,
    mainOrbY,
    mainOrbSize,
  );
  if (isAttacking) {
    mainOrbGrad.addColorStop(0, "#ffffff");
    mainOrbGrad.addColorStop(0.15, "#ffffff");
    mainOrbGrad.addColorStop(0.35, "#ccffff");
    mainOrbGrad.addColorStop(0.6, "#00ffff");
    mainOrbGrad.addColorStop(0.85, "#0088ff");
    mainOrbGrad.addColorStop(1, "#0066cc");
  } else {
    mainOrbGrad.addColorStop(0, "#ffffff");
    mainOrbGrad.addColorStop(0.2, "#ccffff");
    mainOrbGrad.addColorStop(0.5, "#00ffff");
    mainOrbGrad.addColorStop(0.8, "#0088ff");
    mainOrbGrad.addColorStop(1, "#0044aa");
  }
  ctx.fillStyle = mainOrbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, mainOrbY, mainOrbSize, 0, Math.PI * 2);
  ctx.fill();

  // Solid glowing core when attacking
  if (attackPulse > 0.1) {
    // Solid bright core
    const coreGrad = ctx.createRadialGradient(
      screenPos.x,
      mainOrbY,
      0,
      screenPos.x,
      mainOrbY,
      mainOrbSize * 0.5,
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackPulse})`);
    coreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackPulse * 0.9})`);
    coreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackPulse * 0.5})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, mainOrbY, mainOrbSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, mainOrbY, mainOrbSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Electric arcs from main orb - 3D multi-layered lightning bolts
  const mainArcCount = 8 + Math.floor(attackPulse * 5);
  for (let i = 0; i < mainArcCount; i++) {
    const arcAngle = time * 2.5 + i * ((Math.PI * 2) / mainArcCount);
    const arcLength = (22 + Math.sin(time * 11 + i * 3.7) * 12) * zoom;
    const segCount = 5 + Math.floor(Math.sin(time * 7 + i * 2.1) * 1.5 + 1.5);

    const boltPts: { x: number; y: number }[] = [{ x: screenPos.x, y: mainOrbY }];
    for (let s = 1; s <= segCount; s++) {
      const t = s / segCount;
      const jAmp = (1 - t * 0.3) * 9 * zoom;
      const jx = Math.sin(time * 20 + i * 4.1 + s * 6.3) * jAmp;
      const jy = Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4;
      boltPts.push({
        x: screenPos.x + Math.cos(arcAngle) * arcLength * t + jx,
        y: mainOrbY + Math.sin(arcAngle) * arcLength * 0.4 * t + jy,
      });
    }

    // Layer 1: wide blurry glow
    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10 * zoom;
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.2 + attackPulse * 0.18})`;
    ctx.lineWidth = 4.5 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++) ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();
    ctx.restore();

    // Layer 2: bright cyan core
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.55 + attackPulse * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++) ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();

    // Layer 3: thin white-hot center
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.65 + attackPulse * 0.3})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++) ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();

    // Glow node at tip
    const tip = boltPts[boltPts.length - 1];
    ctx.fillStyle = `rgba(200, 255, 255, ${0.55 + attackPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Sub-branch from middle
    if (i % 2 === 0) {
      const bIdx = Math.max(1, Math.floor(segCount * 0.45));
      const bp = boltPts[bIdx];
      const bAngle = arcAngle + Math.sin(time * 10 + i * 2.3) * 0.9;
      const bLen = arcLength * 0.45;
      const bMid = {
        x: bp.x + Math.cos(bAngle) * bLen * 0.5 + Math.sin(time * 22 + i) * 2 * zoom,
        y: bp.y + Math.sin(bAngle) * bLen * 0.2,
      };
      const bEnd = {
        x: bp.x + Math.cos(bAngle) * bLen,
        y: bp.y + Math.sin(bAngle) * bLen * 0.35,
      };

      ctx.strokeStyle = `rgba(0, 220, 255, ${0.3 + attackPulse * 0.25})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(180, 255, 255, ${0.4 + attackPulse * 0.25})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + attackPulse * 0.2})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();
    }
  }

  // Connecting arcs between sub-coils and main orb - 3D layered
  for (let i = 0; i < coilPositions.length; i++) {
    const pos = coilPositions[i];
    const cx = screenPos.x + pos.x * zoom;
    const cy = topY + pos.y * zoom - 25 * zoom * pos.size;
    const segCnt = 4;

    const connPts: { x: number; y: number }[] = [{ x: cx, y: cy }];
    for (let s = 1; s <= segCnt; s++) {
      const t = s / segCnt;
      const jAmp = (1 - Math.abs(t - 0.5) * 2) * 10 * zoom;
      connPts.push({
        x: cx + (screenPos.x - cx) * t + Math.sin(time * 18 + i * 5 + s * 7) * jAmp,
        y: cy + (mainOrbY - cy) * t + Math.cos(time * 14 + i * 3 + s * 5) * jAmp * 0.35,
      });
    }

    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.15 + attackPulse * 0.15})`;
    ctx.lineWidth = 4 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(connPts[0].x, connPts[0].y);
    for (let p = 1; p < connPts.length; p++) ctx.lineTo(connPts[p].x, connPts[p].y);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(0, 255, 255, ${0.45 + attackPulse * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(connPts[0].x, connPts[0].y);
    for (let p = 1; p < connPts.length; p++) ctx.lineTo(connPts[p].x, connPts[p].y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + attackPulse * 0.25})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(connPts[0].x, connPts[0].y);
    for (let p = 1; p < connPts.length; p++) ctx.lineTo(connPts[p].x, connPts[p].y);
    ctx.stroke();
  }
}

// ARCH TOWER - Mystical Fantasy Portal with Ancient Runes
function renderArchTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  // Shift the entire building up slightly
  screenPos = { x: screenPos.x, y: screenPos.y - 8 * zoom };
  const baseWidth = 38 + tower.level * 5;
  const baseDepth = 30 + tower.level * 4;
  const w = baseWidth * zoom * 0.5;
  const d = baseDepth * zoom * 0.25;

  const isShockwave = tower.level === 4 && tower.upgrade === "A";
  const isSymphony = tower.level === 4 && tower.upgrade === "B";

  let mainColor = "rgba(50, 200, 100,";
  if (isShockwave) {
    mainColor = "rgba(255, 100, 100,";
  } else if (isSymphony) {
    mainColor = "rgba(100, 200, 255,";
  }

  // Dynamic attack animation
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let archVibrate = 0;
  let pillarSpread = 0;
  let pillarBounce = 0;
  let foundationShift = 0;
  let archLift = 0;
  let portalExpand = 0;

  if (timeSinceFire < 600) {
    const attackPhase = timeSinceFire / 600;
    attackPulse = (1 - attackPhase) * 0.6;
    archVibrate =
      Math.sin(attackPhase * Math.PI * 12) * (1 - attackPhase) * 4 * zoom;
    if (attackPhase < 0.3) {
      pillarSpread = (attackPhase / 0.3) * 6 * zoom;
      pillarBounce = Math.sin(attackPhase * Math.PI * 10) * 3 * zoom;
    } else {
      pillarSpread = 6 * zoom * (1 - (attackPhase - 0.3) / 0.7);
      pillarBounce =
        Math.sin(attackPhase * Math.PI * 6) * (1 - attackPhase) * 2 * zoom;
    }
    foundationShift =
      Math.sin(attackPhase * Math.PI * 8) * (1 - attackPhase) * 2 * zoom;
    if (attackPhase < 0.2) {
      archLift = (attackPhase / 0.2) * 5 * zoom;
    } else {
      archLift = 5 * zoom * (1 - (attackPhase - 0.2) / 0.8);
    }
    portalExpand = Math.sin(attackPhase * Math.PI) * 8 * zoom;
  }

  const pulseSize = 1 + Math.sin(time * 3) * 0.02;
  const glowColor = isShockwave
    ? "255, 100, 100"
    : isSymphony
      ? "100, 200, 255"
      : "50, 200, 100";

  // === MYSTICAL FOUNDATION BASE ===
  const subBuildingWidth = baseWidth + 20;
  const subBuildingHeight = 18;
  const subBounce =
    isShockwave || isSymphony
      ? Math.sin(time * 6) * 2 * zoom
      : Math.sin(time * 3) * 1 * zoom;

  // Ancient stone foundation with mystical glow
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.3,
    screenPos.y + 20 * zoom,
    subBuildingWidth + 8 + pillarSpread * 2,
    baseDepth + 36 + pillarSpread * 2,
    6,
    {
      top: "#5a4a3a",
      left: "#4a3a2a",
      right: "#3a2a1a",
      leftBack: "#6a5a4a",
      rightBack: "#5a4a3a",
    },
    zoom,
  );

  // Foundation rune circle on ground
  const runeCircleGlow = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4;
  ctx.strokeStyle = `rgba(${glowColor}, ${runeCircleGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 18 * zoom,
    (subBuildingWidth + 4 + pillarSpread * 2) * zoom * 0.4,
    (baseDepth + 32 + pillarSpread * 2) * zoom * 0.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Inner rune circle
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 18 * zoom,
    (subBuildingWidth - 4 + pillarSpread * 2) * zoom * 0.35,
    (baseDepth + 24 + pillarSpread * 2) * zoom * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Ground rune symbols
  const groundRunes = ["ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᛁ", "ᛃ"];
  ctx.fillStyle = `rgba(${glowColor}, ${runeCircleGlow + 0.1})`;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 8; i++) {
    const runeAngle = (i / 8) * Math.PI * 2 + time * 0.2;
    const runeX =
      screenPos.x + Math.cos(runeAngle) * (subBuildingWidth - 2 + pillarSpread * 2) * zoom * 0.35;
    const runeY =
      screenPos.y +
      18 * zoom +
      Math.sin(runeAngle) * (baseDepth + 20 + pillarSpread * 2) * zoom * 0.16;
    ctx.fillText(groundRunes[i], runeX, runeY);
  }

  // Lower foundation block
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.3,
    screenPos.y + 16 * zoom,
    subBuildingWidth + pillarSpread * 2,
    baseDepth + 28 + pillarSpread * 2,
    12,
    {
      top: "#786858",
      left: "#685848",
      right: "#584838",
      leftBack: "#887868",
      rightBack: "#786858",
    },
    zoom,
  );

  // Corner buttress supports (mystical stone pillars)
  for (const corner of [0, 1, 2, 3]) {
    const cx =
      screenPos.x + (corner < 2 ? -1 : 1) * ((subBuildingWidth + pillarSpread * 2) * 0.42) * zoom;
    const cy =
      screenPos.y +
      14 * zoom +
      (corner % 2 === 0 ? -1 : 1) * (baseDepth + 20 + pillarSpread * 2) * zoom * 0.18;

    // Buttress pillar
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14 * zoom);
    ctx.lineTo(cx - 4 * zoom, cy - 8 * zoom);
    ctx.lineTo(cx - 4 * zoom, cy + 4 * zoom);
    ctx.lineTo(cx + 4 * zoom, cy + 4 * zoom);
    ctx.lineTo(cx + 4 * zoom, cy - 8 * zoom);
    ctx.closePath();
    ctx.fill();

    // Buttress cap
    ctx.fillStyle = "#8a7a6a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 18 * zoom);
    ctx.lineTo(cx - 5 * zoom, cy - 12 * zoom);
    ctx.lineTo(cx + 5 * zoom, cy - 12 * zoom);
    ctx.closePath();
    ctx.fill();

    // Buttress rune glow
    const buttressGlow =
      0.4 + Math.sin(time * 3 + corner) * 0.25 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.beginPath();
    ctx.arc(cx, cy - 4 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sub-building main structure
  const subShift =
    timeSinceFire < 600
      ? Math.sin((timeSinceFire / 600) * Math.PI * 6) *
        2 *
        zoom *
        (1 - timeSinceFire / 600)
      : 0;
  const sbExpandW = subBuildingWidth - 6 + pillarSpread * 2;
  const sbExpandD = baseDepth + 22 + pillarSpread * 2;
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.4 + subShift,
    screenPos.y + 2 * zoom + subBounce,
    sbExpandW,
    sbExpandD,
    subBuildingHeight,
    {
      top: "#a89878",
      left: "#988868",
      right: "#887858",
      leftBack: "#b8a888",
      rightBack: "#a89878",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring) ==========
  const archBalY = screenPos.y + 4 * zoom + subBounce;
  const archBalRX = (subBuildingWidth - 4 + pillarSpread * 2) * zoom * 0.5;
  const archBalRY = (baseDepth + 24 + pillarSpread * 2) * zoom * 0.25;
  const archBalH = 5 * zoom;
  const archBalSegs = 32;
  const archBalPosts = 16;

  ctx.strokeStyle = "#786858";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    archBalY,
    archBalRX,
    archBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#a89878";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    archBalY - archBalH,
    archBalRX,
    archBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < archBalPosts; bp++) {
    const pa = (bp / archBalPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * archBalRX;
    const py = archBalY + Math.sin(pa) * archBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - archBalH);
    ctx.stroke();
  }
  for (let i = 0; i < archBalSegs; i++) {
    const a0 = (i / archBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / archBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * archBalRX;
    const y0b = archBalY + Math.sin(a0) * archBalRY;
    const x1 = screenPos.x + Math.cos(a1) * archBalRX;
    const y1b = archBalY + Math.sin(a1) * archBalRY;
    ctx.fillStyle = `rgba(152, 136, 104, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - archBalH);
    ctx.lineTo(x0, y0b - archBalH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "#786858";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, archBalY, archBalRX, archBalRY, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#a89878";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    archBalY - archBalH,
    archBalRX,
    archBalRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < archBalPosts; bp++) {
    const pa = (bp / archBalPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * archBalRX;
    const py = archBalY + Math.sin(pa) * archBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - archBalH);
    ctx.stroke();
  }
  for (let i = 0; i < archBalSegs; i++) {
    const a0 = (i / archBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / archBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * archBalRX;
    const y0b = archBalY + Math.sin(a0) * archBalRY;
    const x1 = screenPos.x + Math.cos(a1) * archBalRX;
    const y1b = archBalY + Math.sin(a1) * archBalRY;
    ctx.fillStyle = `rgba(152, 136, 104, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - archBalH);
    ctx.lineTo(x0, y0b - archBalH);
    ctx.closePath();
    ctx.fill();
  }

  // === DETAILED STONE MASONRY ON SUB-BUILDING FACES ===
  const mortarGlow = 0.12 + Math.sin(time * 1.5) * 0.06 + attackPulse * 0.15;
  const sbHalfW = sbExpandW * zoom * 0.45;
  const sbDepthOff = sbExpandD * zoom * 0.12;
  const sbH = subBuildingHeight * zoom;
  const sbBaseY = screenPos.y + 2 * zoom + subBounce;
  const sbBaseX = screenPos.x + foundationShift * 0.4 + subShift;

  const stoneRows = 5;
  const stoneCols = 6;

  // --- Front-left face: staggered ashlar stone blocks ---
  ctx.strokeStyle = `rgba(${glowColor}, ${mortarGlow})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let row = 1; row < stoneRows; row++) {
    const t = row / stoneRows;
    ctx.beginPath();
    ctx.moveTo(sbBaseX - sbHalfW, sbBaseY - sbH + t * sbH);
    ctx.lineTo(sbBaseX, sbBaseY - sbH + t * sbH + sbDepthOff);
    ctx.stroke();
  }
  for (let row = 0; row < stoneRows; row++) {
    const t1 = row / stoneRows;
    const t2 = (row + 1) / stoneRows;
    const stagger = row % 2 === 0 ? 0 : 0.5;
    for (let col = 1; col < stoneCols; col++) {
      const s = (col + stagger) / stoneCols;
      if (s >= 1) continue;
      const jx = sbBaseX - sbHalfW + s * sbHalfW;
      const jyOff = s * sbDepthOff;
      ctx.beginPath();
      ctx.moveTo(jx, sbBaseY - sbH + t1 * sbH + jyOff);
      ctx.lineTo(jx, sbBaseY - sbH + t2 * sbH + jyOff);
      ctx.stroke();
    }
  }

  // --- Front-right face: matching staggered stone blocks ---
  for (let row = 1; row < stoneRows; row++) {
    const t = row / stoneRows;
    ctx.beginPath();
    ctx.moveTo(sbBaseX, sbBaseY - sbH + t * sbH + sbDepthOff);
    ctx.lineTo(sbBaseX + sbHalfW, sbBaseY - sbH + t * sbH);
    ctx.stroke();
  }
  for (let row = 0; row < stoneRows; row++) {
    const t1 = row / stoneRows;
    const t2 = (row + 1) / stoneRows;
    const stagger = row % 2 === 0 ? 0.5 : 0;
    for (let col = 1; col < stoneCols; col++) {
      const s = (col + stagger) / stoneCols;
      if (s >= 1) continue;
      const jx = sbBaseX + s * sbHalfW;
      const jyOff = sbDepthOff - s * sbDepthOff;
      ctx.beginPath();
      ctx.moveTo(jx, sbBaseY - sbH + t1 * sbH + jyOff);
      ctx.lineTo(jx, sbBaseY - sbH + t2 * sbH + jyOff);
      ctx.stroke();
    }
  }

  // --- Decorative horizontal string course at mid-height ---
  const bandFrac = 0.45;
  const bandBaseLeft = sbBaseY - sbH + bandFrac * sbH;
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW, bandBaseLeft);
  ctx.lineTo(sbBaseX, bandBaseLeft + sbDepthOff);
  ctx.lineTo(sbBaseX + sbHalfW, bandBaseLeft);
  ctx.stroke();
  ctx.strokeStyle = "rgba(190, 175, 155, 0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW, bandBaseLeft - 1.5 * zoom);
  ctx.lineTo(sbBaseX, bandBaseLeft + sbDepthOff - 1.5 * zoom);
  ctx.lineTo(sbBaseX + sbHalfW, bandBaseLeft - 1.5 * zoom);
  ctx.stroke();
  ctx.strokeStyle = "rgba(40, 30, 20, 0.25)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW, bandBaseLeft + 2 * zoom);
  ctx.lineTo(sbBaseX, bandBaseLeft + sbDepthOff + 2 * zoom);
  ctx.lineTo(sbBaseX + sbHalfW, bandBaseLeft + 2 * zoom);
  ctx.stroke();

  // --- Top cornice molding ---
  ctx.strokeStyle = "#8a7a6a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW * 1.05, sbBaseY - sbH);
  ctx.lineTo(sbBaseX, sbBaseY - sbH + sbDepthOff);
  ctx.lineTo(sbBaseX + sbHalfW * 1.05, sbBaseY - sbH);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200, 185, 165, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW * 1.05, sbBaseY - sbH - 1 * zoom);
  ctx.lineTo(sbBaseX, sbBaseY - sbH + sbDepthOff - 1 * zoom);
  ctx.lineTo(sbBaseX + sbHalfW * 1.05, sbBaseY - sbH - 1 * zoom);
  ctx.stroke();

  // --- Base plinth molding ---
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW * 1.05, sbBaseY);
  ctx.lineTo(sbBaseX, sbBaseY + sbDepthOff);
  ctx.lineTo(sbBaseX + sbHalfW * 1.05, sbBaseY);
  ctx.stroke();

  // --- Corner quoining at front edge ---
  ctx.lineWidth = 1 * zoom;
  for (let q = 0; q < stoneRows; q++) {
    const qt1 = q / stoneRows;
    const qt2 = (q + 1) / stoneRows;
    const qy1 = sbBaseY - sbH + qt1 * sbH + sbDepthOff;
    const qy2 = sbBaseY - sbH + qt2 * sbH + sbDepthOff;
    const quoinW = 3.5 * zoom;
    ctx.fillStyle =
      q % 2 === 0
        ? "rgba(140, 128, 108, 0.25)"
        : "rgba(160, 148, 128, 0.2)";
    ctx.beginPath();
    ctx.moveTo(sbBaseX, qy1);
    ctx.lineTo(sbBaseX - quoinW, qy1 - quoinW * 0.15);
    ctx.lineTo(sbBaseX - quoinW, qy2 - quoinW * 0.15);
    ctx.lineTo(sbBaseX, qy2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sbBaseX, qy1);
    ctx.lineTo(sbBaseX + quoinW, qy1 - quoinW * 0.15);
    ctx.lineTo(sbBaseX + quoinW, qy2 - quoinW * 0.15);
    ctx.lineTo(sbBaseX, qy2);
    ctx.closePath();
    ctx.fill();
  }

  // --- Recessed panel insets on each face ---
  const panelInset = 0.15;
  const panelT1 = 0.12;
  const panelT2 = 0.38;
  ctx.strokeStyle = "rgba(80, 65, 50, 0.3)";
  ctx.lineWidth = 1.2 * zoom;
  // Left face panel
  const lpL = sbBaseX - sbHalfW + panelInset * sbHalfW;
  const lpR = sbBaseX - sbHalfW + (1 - panelInset) * sbHalfW;
  const lpLdOff = panelInset * sbDepthOff;
  const lpRdOff = (1 - panelInset) * sbDepthOff;
  ctx.beginPath();
  ctx.moveTo(lpL, sbBaseY - sbH + panelT1 * sbH + lpLdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT1 * sbH + lpRdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT2 * sbH + lpRdOff);
  ctx.lineTo(lpL, sbBaseY - sbH + panelT2 * sbH + lpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.12)";
  ctx.fill();
  // Right face panel
  const rpL = sbBaseX + panelInset * sbHalfW;
  const rpR = sbBaseX + (1 - panelInset) * sbHalfW;
  const rpLdOff = sbDepthOff - panelInset * sbDepthOff;
  const rpRdOff = sbDepthOff - (1 - panelInset) * sbDepthOff;
  ctx.beginPath();
  ctx.moveTo(rpL, sbBaseY - sbH + panelT1 * sbH + rpLdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT1 * sbH + rpRdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT2 * sbH + rpRdOff);
  ctx.lineTo(rpL, sbBaseY - sbH + panelT2 * sbH + rpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.12)";
  ctx.fill();

  // Lower panels (below string course)
  const panelT3 = 0.55;
  const panelT4 = 0.88;
  ctx.strokeStyle = "rgba(80, 65, 50, 0.3)";
  ctx.beginPath();
  ctx.moveTo(lpL, sbBaseY - sbH + panelT3 * sbH + lpLdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT3 * sbH + lpRdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT4 * sbH + lpRdOff);
  ctx.lineTo(lpL, sbBaseY - sbH + panelT4 * sbH + lpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.1)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rpL, sbBaseY - sbH + panelT3 * sbH + rpLdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT3 * sbH + rpRdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT4 * sbH + rpRdOff);
  ctx.lineTo(rpL, sbBaseY - sbH + panelT4 * sbH + rpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.1)";
  ctx.fill();

  // --- Subtle stone texture grain ---
  ctx.strokeStyle = "rgba(200, 185, 165, 0.1)";
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const tx = sbBaseX + (i - 3.5) * 8 * zoom;
    const ty = sbBaseY - sbH * 0.3 + Math.sin(i * 2.1) * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(
      tx + (2 + Math.sin(i * 1.3)) * zoom,
      ty + 0.8 * zoom,
    );
    ctx.stroke();
  }

  // --- Moss/weathering at base ---
  ctx.fillStyle = `rgba(55, 110, 45, ${0.07 + Math.sin(time * 0.4) * 0.02})`;
  for (let i = 0; i < 3; i++) {
    const mx = sbBaseX + (i - 1) * 16 * zoom;
    const my = sbBaseY - 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      mx,
      my,
      (2.5 + Math.sin(i * 3.1) * 0.5) * zoom,
      0.8 * zoom,
      i * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // --- Mystical wall runes on sub-building ---
  const wallRunes = ["ᛟ", "ᛞ", "ᛒ", "ᛖ"];
  const wallRuneGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${wallRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${10 * zoom}px serif`;
  for (let i = 0; i < 4; i++) {
    const runeX = screenPos.x + (i - 1.5) * 12 * zoom + subShift * 0.5;
    const runeY = screenPos.y + 6 * zoom + subBounce;
    ctx.fillText(wallRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Gothic windows on sub-building
  const windowGlowBase = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 2; row++) {
      const winX = screenPos.x + side * 18 * zoom + subShift * 0.5;
      const winY = screenPos.y + 2 + subBounce - row * 8 * zoom;

      // Gothic pointed arch window frame
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(winX - 4 * zoom, winY + 5 * zoom);
      ctx.lineTo(winX - 4 * zoom, winY);
      ctx.quadraticCurveTo(winX, winY - 5 * zoom, winX + 4 * zoom, winY);
      ctx.lineTo(winX + 4 * zoom, winY + 5 * zoom);
      ctx.stroke();

      // Window glow
      ctx.fillStyle = `${mainColor} ${windowGlowBase})`;
      ctx.beginPath();
      ctx.moveTo(winX - 3 * zoom, winY + 4 * zoom);
      ctx.lineTo(winX - 3 * zoom, winY);
      ctx.quadraticCurveTo(winX, winY - 4 * zoom, winX + 3 * zoom, winY);
      ctx.lineTo(winX + 3 * zoom, winY + 4 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Mystical resonance crystals on sides
  const chamberPulse = 0.5 + attackPulse;
  for (let side = -1; side <= 1; side += 2) {
    const chamberX =
      screenPos.x +
      side * ((subBuildingWidth + pillarSpread * 2) * 0.42) * zoom +
      subShift * side * 0.3;
    const chamberY = screenPos.y + 6 * zoom + subBounce;

    // Crystal housing
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.moveTo(chamberX, chamberY - 10 * zoom);
    ctx.lineTo(chamberX - 5 * zoom, chamberY - 4 * zoom);
    ctx.lineTo(chamberX - 4 * zoom, chamberY + 4 * zoom);
    ctx.lineTo(chamberX + 4 * zoom, chamberY + 4 * zoom);
    ctx.lineTo(chamberX + 5 * zoom, chamberY - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Glowing crystal
    ctx.fillStyle = `${mainColor} ${chamberPulse})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(chamberX, chamberY - 8 * zoom);
    ctx.lineTo(chamberX - 3 * zoom, chamberY);
    ctx.lineTo(chamberX, chamberY + 2 * zoom);
    ctx.lineTo(chamberX + 3 * zoom, chamberY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crystal energy rings during attack
    if (timeSinceFire < 400) {
      const ringPhase = timeSinceFire / 400;
      ctx.strokeStyle = `${mainColor} ${(1 - ringPhase) * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        chamberX,
        chamberY,
        (6 + ringPhase * 10) * zoom,
        (4 + ringPhase * 6) * zoom,
        0.3 * side,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  // Energy conduit pipes with mystical flow
  const pipeGlow = 0.3 + attackPulse * 0.6;
  ctx.strokeStyle = `${mainColor} ${pipeGlow})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const pipeStartX = screenPos.x + side * 30 * zoom + side * pillarSpread;
    const pipeEndX = screenPos.x + side * (baseWidth * 0.35) * zoom;
    ctx.beginPath();
    ctx.moveTo(pipeStartX + subShift * 0.3, screenPos.y + 7 * zoom + subBounce);
    ctx.quadraticCurveTo(
      screenPos.x + side * 32 * zoom,
      screenPos.y - 8 * zoom,
      pipeEndX - pillarSpread * side * 0.3,
      screenPos.y - 14 * zoom,
    );
    ctx.stroke();

    // Flowing energy particles along pipe
    for (let p = 0; p < 3; p++) {
      const pipePhase = (time * 2 + p * 0.33 + side * 0.5) % 1;
      const px = pipeStartX + (pipeEndX - pipeStartX) * pipePhase;
      const py = screenPos.y + 7 * zoom - pipePhase * 20 * zoom;
      ctx.fillStyle = `${mainColor} ${0.6 + Math.sin(time * 8 + p) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Upper foundation platform with arcane symbols
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.5,
    screenPos.y - 18 * zoom,
    baseWidth + 12 + pillarSpread * 2,
    baseDepth + 18 + pillarSpread * 2,
    6,
    {
      top: "#a89880",
      left: "#988870",
      right: "#887860",
      leftBack: "#b8a890",
      rightBack: "#a89880",
    },
    zoom,
  );

  // Arcane circle on platform
  const platformGlow = 0.35 + Math.sin(time * 2.5) * 0.15 + attackPulse * 0.4;
  ctx.strokeStyle = `rgba(${glowColor}, ${platformGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - 21 * zoom,
    (baseWidth + 8) * zoom * 0.35,
    (baseDepth + 14) * zoom * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Platform corner rune stones
  for (const corner of [-1, 1]) {
    const stoneX = screenPos.x + corner * (baseWidth + 8) * zoom * 0.4;
    const stoneY = screenPos.y - 20 * zoom;

    // Rune stone
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.ellipse(stoneX, stoneY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rune glow on stone
    ctx.fillStyle = `rgba(${glowColor}, ${platformGlow + 0.15})`;
    ctx.font = `${6 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(corner < 0 ? "ᚠ" : "ᚢ", stoneX, stoneY + 2 * zoom);
  }

  // Green tech panel lines on foundation
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.strokeStyle = `${mainColor} ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= 2; i++) {
    const lineY = screenPos.y - 16 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.9, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.9, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // === MYSTICAL PILLARS WITH RUNES ===
  const pillarWidth = 14 + tower.level * 2;
  const pillarHeight = 25 + tower.level * 6;
  const pillarX =
    screenPos.x - baseWidth * zoom * 0.35 - archVibrate * 0.3 - pillarSpread;
  const pillarXR =
    screenPos.x + baseWidth * zoom * 0.35 + archVibrate * 0.3 + pillarSpread;
  const pw = pillarWidth * zoom * 0.5;
  const pd = pillarWidth * zoom * 0.25;

  // Left pillar ornate isometric base (stepped plinth)
  const lbX = pillarX + pillarBounce * 0.5;
  const lbY = screenPos.y - 24 * zoom;
  drawIsometricPrism(
    ctx,
    lbX,
    lbY,
    pillarWidth * 1.6,
    pillarWidth * 1.6,
    3,
    {
      top: "#b8a898",
      left: "#a89888",
      right: "#988878",
      leftBack: "#c8b8a8",
      rightBack: "#b8a898",
    },
    zoom,
  );
  drawIsometricPrism(
    ctx,
    lbX,
    lbY - 3 * zoom,
    pillarWidth * 1.35,
    pillarWidth * 1.35,
    2,
    {
      top: "#c0b0a0",
      left: "#b0a090",
      right: "#a09080",
      leftBack: "#d0c0b0",
      rightBack: "#c0b0a0",
    },
    zoom,
  );

  // Left pillar (starts on top of base plinth)
  const pillarBaseTop = 5;
  const pillarBottomY = screenPos.y - 24 * zoom - pillarBaseTop * zoom;
  drawIsometricPrism(
    ctx,
    pillarX + pillarBounce * 0.5,
    pillarBottomY - pillarBounce,
    pillarWidth * pulseSize,
    pillarWidth * pulseSize,
    pillarHeight,
    {
      top: "#c8b8a0",
      left: "#b8a890",
      right: "#a89880",
      leftBack: "#d8c8b0",
      rightBack: "#c8b8a0",
    },
    zoom,
  );

  // Gothic stone block lines on left pillar
  ctx.strokeStyle = "#8a7a6a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 6; row++) {
    const blockY =
      pillarBottomY - 6 * zoom - pillarBounce - row * pillarHeight * zoom * 0.15;
    ctx.beginPath();
    ctx.moveTo(pillarX + pillarBounce * 0.5 - pw * 0.9, blockY - pd * 0.3);
    ctx.lineTo(pillarX + pillarBounce * 0.5 + pw * 0.9, blockY + pd * 0.3);
    ctx.stroke();
  }

  // Vertical fluting grooves on left pillar
  const leftPX = pillarX + pillarBounce * 0.5;
  for (let f = 0; f < 4; f++) {
    const fluteX = leftPX - pw * 0.6 + f * pw * 0.4;
    const fluteTop = screenPos.y - 30 * zoom - pillarBounce;
    const fluteBot =
      screenPos.y - 30 * zoom - pillarBounce - pillarHeight * zoom * 0.85;
    ctx.strokeStyle = "rgba(100, 85, 70, 0.45)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX, fluteTop);
    ctx.lineTo(fluteX, fluteBot);
    ctx.stroke();
    ctx.strokeStyle = "rgba(200, 185, 165, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX + 1 * zoom, fluteTop);
    ctx.lineTo(fluteX + 1 * zoom, fluteBot);
    ctx.stroke();
  }

  // Chamfered edge highlights on left pillar
  ctx.strokeStyle = "rgba(220, 208, 190, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(leftPX - pw * 0.9, pillarBottomY - 6 * zoom - pillarBounce);
  ctx.lineTo(
    leftPX - pw * 0.9,
    pillarBottomY - 6 * zoom - pillarBounce - pillarHeight * zoom * 0.9,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(80, 65, 50, 0.3)";
  ctx.beginPath();
  ctx.moveTo(leftPX + pw * 0.9, pillarBottomY - 6 * zoom - pillarBounce);
  ctx.lineTo(
    leftPX + pw * 0.9,
    pillarBottomY - 6 * zoom - pillarBounce - pillarHeight * zoom * 0.9,
  );
  ctx.stroke();

  // Left pillar glowing runes
  const pillarRunes = ["ᚦ", "ᚨ", "ᚾ", "ᛊ"];
  const pillarRuneGlow = 0.5 + Math.sin(time * 3) * 0.25 + attackPulse * 0.6;
  ctx.fillStyle = `rgba(${glowColor}, ${pillarRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < tower.level + 1; i++) {
    const runeY =
      pillarBottomY - 11 * zoom - pillarBounce - i * pillarHeight * zoom * 0.22;
    ctx.fillText(pillarRunes[i % 4], pillarX + pillarBounce * 0.5, runeY);
  }
  ctx.shadowBlur = 0;

  // Pillar capital on left pillar - ornate Ionic style with 3D depth
  const capitalY = pillarBottomY - pillarHeight * zoom - pillarBounce;
  const capW = 8 * zoom;
  const lcX = pillarX + pillarBounce * 0.5;

  // Abacus (top slab) front face
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(lcX - capW * 1.2, capitalY - 1 * zoom);
  ctx.lineTo(lcX - capW * 1.0, capitalY - 4 * zoom);
  ctx.lineTo(lcX + capW * 1.0, capitalY - 4 * zoom);
  ctx.lineTo(lcX + capW * 1.2, capitalY - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // Abacus right side face (3D depth)
  ctx.fillStyle = "#c0b098";
  ctx.beginPath();
  ctx.moveTo(lcX + capW * 1.0, capitalY - 4 * zoom);
  ctx.lineTo(lcX + capW * 1.2, capitalY - 1 * zoom);
  ctx.lineTo(lcX + capW * 1.2, capitalY + 1 * zoom);
  ctx.lineTo(lcX + capW * 1.0, capitalY - 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Echinus curved molding beneath abacus
  ctx.fillStyle = "#d0c0a8";
  ctx.beginPath();
  ctx.moveTo(lcX - capW * 1.1, capitalY + 1 * zoom);
  ctx.quadraticCurveTo(
    lcX - capW * 0.5,
    capitalY + 4 * zoom,
    lcX,
    capitalY + 1.5 * zoom,
  );
  ctx.quadraticCurveTo(
    lcX + capW * 0.5,
    capitalY + 4 * zoom,
    lcX + capW * 1.1,
    capitalY + 1 * zoom,
  );
  ctx.lineTo(lcX + capW * 1.0, capitalY - 1 * zoom);
  ctx.lineTo(lcX - capW * 1.0, capitalY - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // Volute scrolls (spiral ornaments on sides)
  for (const vSide of [-1, 1]) {
    const vx = lcX + vSide * capW * 1.0;
    const vy = capitalY + 1.5 * zoom;
    ctx.strokeStyle = "#a89878";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    for (let s = 0; s <= 12; s++) {
      const spiralA = (s / 12) * Math.PI * 2.5 + (vSide > 0 ? 0 : Math.PI);
      const spiralRad = (3 - s * 0.2) * zoom;
      const sx = vx + Math.cos(spiralA) * spiralRad * vSide;
      const sy = vy + Math.sin(spiralA) * spiralRad * 0.6;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Egg-and-dart molding detail
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 0.8 * zoom;
  for (let e = 0; e < 5; e++) {
    const ex = lcX + (e - 2) * capW * 0.38;
    const ey = capitalY;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 1.2 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Right pillar ornate isometric base (stepped plinth)
  const rbX = pillarXR - pillarBounce * 0.5;
  const rbY = screenPos.y - 24 * zoom;
  drawIsometricPrism(
    ctx,
    rbX,
    rbY,
    pillarWidth * 1.6,
    pillarWidth * 1.6,
    3,
    {
      top: "#b8a898",
      left: "#a89888",
      right: "#988878",
      leftBack: "#c8b8a8",
      rightBack: "#b8a898",
    },
    zoom,
  );
  drawIsometricPrism(
    ctx,
    rbX,
    rbY - 3 * zoom,
    pillarWidth * 1.35,
    pillarWidth * 1.35,
    2,
    {
      top: "#c0b0a0",
      left: "#b0a090",
      right: "#a09080",
      leftBack: "#d0c0b0",
      rightBack: "#c0b0a0",
    },
    zoom,
  );

  // Right pillar (starts on top of base plinth)
  drawIsometricPrism(
    ctx,
    pillarXR - pillarBounce * 0.5,
    pillarBottomY - pillarBounce,
    pillarWidth * pulseSize,
    pillarWidth * pulseSize,
    pillarHeight,
    {
      top: "#c8b8a0",
      left: "#b8a890",
      right: "#a89880",
      leftBack: "#d8c8b0",
      rightBack: "#c8b8a0",
    },
    zoom,
  );

  // Gothic stone block lines on right pillar
  for (let row = 0; row < 6; row++) {
    const blockY =
      pillarBottomY - 6 * zoom - pillarBounce - row * pillarHeight * zoom * 0.15;
    ctx.beginPath();
    ctx.moveTo(pillarXR - pillarBounce * 0.5 - pw * 0.9, blockY - pd * 0.3);
    ctx.lineTo(pillarXR - pillarBounce * 0.5 + pw * 0.9, blockY + pd * 0.3);
    ctx.stroke();
  }

  // Vertical fluting grooves on right pillar
  const rightPX = pillarXR - pillarBounce * 0.5;
  for (let f = 0; f < 4; f++) {
    const fluteX = rightPX - pw * 0.6 + f * pw * 0.4;
    const fluteTop = pillarBottomY - 6 * zoom - pillarBounce;
    const fluteBot =
      pillarBottomY - 6 * zoom - pillarBounce - pillarHeight * zoom * 0.85;
    ctx.strokeStyle = "rgba(100, 85, 70, 0.45)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX, fluteTop);
    ctx.lineTo(fluteX, fluteBot);
    ctx.stroke();
    ctx.strokeStyle = "rgba(200, 185, 165, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX + 1 * zoom, fluteTop);
    ctx.lineTo(fluteX + 1 * zoom, fluteBot);
    ctx.stroke();
  }

  // Chamfered edge highlights on right pillar
  ctx.strokeStyle = "rgba(220, 208, 190, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(rightPX - pw * 0.9, pillarBottomY - 6 * zoom - pillarBounce);
  ctx.lineTo(
    rightPX - pw * 0.9,
    pillarBottomY - 6 * zoom - pillarBounce - pillarHeight * zoom * 0.9,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(80, 65, 50, 0.3)";
  ctx.beginPath();
  ctx.moveTo(rightPX + pw * 0.9, pillarBottomY - 6 * zoom - pillarBounce);
  ctx.lineTo(
    rightPX + pw * 0.9,
    pillarBottomY - 6 * zoom - pillarBounce - pillarHeight * zoom * 0.9,
  );
  ctx.stroke();

  // Right pillar glowing runes
  ctx.fillStyle = `rgba(${glowColor}, ${pillarRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  for (let i = 0; i < tower.level + 1; i++) {
    const runeY =
      pillarBottomY - 11 * zoom - pillarBounce - i * pillarHeight * zoom * 0.22;
    ctx.fillText(
      pillarRunes[(i + 2) % 4],
      pillarXR - pillarBounce * 0.5,
      runeY,
    );
  }
  ctx.shadowBlur = 0;

  // Pillar capital on right pillar - ornate Ionic style with 3D depth
  const rcX = pillarXR - pillarBounce * 0.5;

  // Abacus front face
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(rcX - capW * 1.2, capitalY - 1 * zoom);
  ctx.lineTo(rcX - capW * 1.0, capitalY - 4 * zoom);
  ctx.lineTo(rcX + capW * 1.0, capitalY - 4 * zoom);
  ctx.lineTo(rcX + capW * 1.2, capitalY - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // Abacus right side face
  ctx.fillStyle = "#c0b098";
  ctx.beginPath();
  ctx.moveTo(rcX + capW * 1.0, capitalY - 4 * zoom);
  ctx.lineTo(rcX + capW * 1.2, capitalY - 1 * zoom);
  ctx.lineTo(rcX + capW * 1.2, capitalY + 1 * zoom);
  ctx.lineTo(rcX + capW * 1.0, capitalY - 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Echinus curved molding
  ctx.fillStyle = "#d0c0a8";
  ctx.beginPath();
  ctx.moveTo(rcX - capW * 1.1, capitalY + 1 * zoom);
  ctx.quadraticCurveTo(
    rcX - capW * 0.5,
    capitalY + 4 * zoom,
    rcX,
    capitalY + 1.5 * zoom,
  );
  ctx.quadraticCurveTo(
    rcX + capW * 0.5,
    capitalY + 4 * zoom,
    rcX + capW * 1.1,
    capitalY + 1 * zoom,
  );
  ctx.lineTo(rcX + capW * 1.0, capitalY - 1 * zoom);
  ctx.lineTo(rcX - capW * 1.0, capitalY - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // Volute scrolls
  for (const vSide of [-1, 1]) {
    const vx = rcX + vSide * capW * 1.0;
    const vy = capitalY + 1.5 * zoom;
    ctx.strokeStyle = "#a89878";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    for (let s = 0; s <= 12; s++) {
      const spiralA = (s / 12) * Math.PI * 2.5 + (vSide > 0 ? 0 : Math.PI);
      const spiralRad = (3 - s * 0.2) * zoom;
      const sx = vx + Math.cos(spiralA) * spiralRad * vSide;
      const sy = vy + Math.sin(spiralA) * spiralRad * 0.6;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Egg-and-dart molding detail
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 0.8 * zoom;
  for (let e = 0; e < 5; e++) {
    const ex = rcX + (e - 2) * capW * 0.38;
    const ey = capitalY;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 1.2 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Glowing energy strips on pillars
  for (const p of [
    pillarX + pillarBounce * 0.5,
    pillarXR - pillarBounce * 0.5,
  ]) {
    for (let i = 0; i < tower.level + 2; i++) {
      const stripY =
        screenPos.y -
        22 * zoom -
        pillarHeight * zoom * (0.15 + i * 0.2) -
        pillarBounce;
      const stripGlow =
        0.4 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse * 1.5;

      ctx.fillStyle = `${mainColor} ${stripGlow})`;
      ctx.beginPath();
      ctx.ellipse(
        p - pw * 0.5,
        stripY + pd * 0.2,
        3 * zoom,
        1.5 * zoom,
        0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        p + pw * 0.5,
        stripY + pd * 0.2,
        3 * zoom,
        1.5 * zoom,
        -0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === LEVEL 2 UNIQUE FEATURES ===
  if (tower.level >= 2) {
    // Floating mystical orbs beside pillars
    for (const side of [-1, 1]) {
      const orbX = screenPos.x + side * (baseWidth * 0.55) * zoom;
      const orbY =
        screenPos.y - 45 * zoom + Math.sin(time * 2 + side) * 4 * zoom;

      // Orb outer glow
      const orbGlow =
        0.4 + Math.sin(time * 3 + side * 2) * 0.2 + attackPulse * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${orbGlow * 0.3})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 8 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.fillStyle = `rgba(${glowColor}, ${orbGlow})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orb energy ring
      ctx.strokeStyle = `rgba(${glowColor}, ${orbGlow * 0.6})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        orbX,
        orbY,
        6 * zoom,
        3 * zoom,
        time * 2 + side,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Ancient tome/altar between pillars
    const altarY = screenPos.y - 18 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      screenPos.x - 6 * zoom,
      altarY - 4 * zoom,
      12 * zoom,
      8 * zoom,
    );

    // Tome on altar
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(screenPos.x - 4 * zoom, altarY - 7 * zoom, 8 * zoom, 5 * zoom);

    // Tome glow
    const tomeGlow = 0.5 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(${glowColor}, ${tomeGlow})`;
    ctx.fillRect(screenPos.x - 3 * zoom, altarY - 6 * zoom, 6 * zoom, 3 * zoom);

    // Flying arcane pages
    for (let page = 0; page < 3; page++) {
      const pagePhase = (time * 0.8 + page * 0.5) % 2;
      const pageX = screenPos.x + Math.sin(pagePhase * Math.PI * 2) * 15 * zoom;
      const pageY = altarY - 10 * zoom - pagePhase * 20 * zoom;
      const pageAlpha = Math.max(0, 1 - pagePhase / 2) * 0.6;

      if (pageAlpha > 0.1) {
        ctx.fillStyle = `rgba(255, 250, 240, ${pageAlpha})`;
        ctx.save();
        ctx.translate(pageX, pageY);
        ctx.rotate(Math.sin(time * 4 + page) * 0.3);
        ctx.fillRect(-3 * zoom, -4 * zoom, 6 * zoom, 8 * zoom);
        ctx.restore();
      }
    }
  }

  // === LEVEL 3 UNIQUE FEATURES ===
  if (tower.level >= 3) {
    // Ethereal spirit wisps circling the tower
    for (let wisp = 0; wisp < 4; wisp++) {
      const wispAngle = time * 1.5 + (wisp / 4) * Math.PI * 2;
      const wispRadius = 40 + Math.sin(time * 2 + wisp) * 8;
      const wispX = screenPos.x + Math.cos(wispAngle) * wispRadius * zoom;
      const wispY =
        screenPos.y - 50 * zoom + Math.sin(wispAngle) * wispRadius * 0.3 * zoom;

      // Wisp trail
      ctx.strokeStyle = `rgba(${glowColor}, 0.2)`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      for (let t = 0; t < 8; t++) {
        const trailAngle = wispAngle - t * 0.15;
        const trailX = screenPos.x + Math.cos(trailAngle) * wispRadius * zoom;
        const trailY =
          screenPos.y -
          50 * zoom +
          Math.sin(trailAngle) * wispRadius * 0.3 * zoom;
        if (t === 0) ctx.moveTo(trailX, trailY);
        else ctx.lineTo(trailX, trailY);
      }
      ctx.stroke();

      // Wisp core
      const wispGlow = 0.6 + Math.sin(time * 5 + wisp * 2) * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${wispGlow})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(wispX, wispY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Dimensional rift cracks around base
    ctx.strokeStyle = `rgba(${glowColor}, ${0.4 + attackPulse * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    for (let crack = 0; crack < 6; crack++) {
      const crackAngle = (crack / 6) * Math.PI * 2 + time * 0.1;
      const crackLen = (12 + Math.sin(time * 2 + crack) * 4) * zoom;
      const crackX = screenPos.x + Math.cos(crackAngle) * 35 * zoom;
      const crackY = screenPos.y + 10 * zoom + Math.sin(crackAngle) * 15 * zoom;

      ctx.beginPath();
      ctx.moveTo(crackX, crackY);
      ctx.lineTo(
        crackX + Math.cos(crackAngle) * crackLen,
        crackY + Math.sin(crackAngle) * crackLen * 0.4,
      );
      ctx.stroke();
    }

    // Ancient artifact hovering above altar
    const artifactY = screenPos.y - 35 * zoom + Math.sin(time * 2.5) * 3 * zoom;

    // Artifact glow aura
    const artifactGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 15 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, artifactY, 10 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Artifact shape (mystical gem)
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow + 0.2})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, artifactY - 8 * zoom);
    ctx.lineTo(screenPos.x - 5 * zoom, artifactY);
    ctx.lineTo(screenPos.x, artifactY + 5 * zoom);
    ctx.lineTo(screenPos.x + 5 * zoom, artifactY);
    ctx.closePath();
    ctx.fill();

    // Artifact inner glow
    ctx.fillStyle = `rgba(255, 255, 255, ${artifactGlow * 0.8})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, artifactY - 1 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Rotating rune orbit around artifact
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow})`;
    ctx.font = `${6 * zoom}px serif`;
    ctx.textAlign = "center";
    for (let r = 0; r < 4; r++) {
      const orbitAngle = time * 2 + (r / 4) * Math.PI * 2;
      const orbitX = screenPos.x + Math.cos(orbitAngle) * 8 * zoom;
      const orbitY = artifactY + Math.sin(orbitAngle) * 4 * zoom;
      ctx.fillText(["ᛗ", "ᛚ", "ᛝ", "ᛟ"][r], orbitX, orbitY);
    }
  }

  // === ARCH STRUCTURE WITH 3D VAULT ===
  const archBaseY =
    pillarBottomY -
    pillarHeight * zoom -
    pillarBounce +
    archVibrate * 0.5;
  const archLeftX = pillarX + pillarBounce * 0.75 - 4 * zoom;
  const archRightX = pillarXR - pillarBounce * 0.75 + 4 * zoom;
  const archMidX = (archLeftX + archRightX) / 2;
  const archSpan = archRightX - archLeftX;
  const archDepth = 8 * zoom;
  const archCurveSteps = 24;
  const outerR = archSpan * 0.58;
  const innerR = archSpan * 0.32;
  const archForeshorten = 0.9;
  const archTopY = archBaseY - outerR * archForeshorten - archLift;
  const archCenterY = archBaseY - innerR * archForeshorten * 0.45;

  // Front face of arch (filled stone band between outer and inner curves)
  ctx.fillStyle = "#b8a890";
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ox = archMidX + archVibrate + Math.cos(angle) * outerR;
    const oy = archBaseY - Math.sin(angle) * outerR * archForeshorten;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  for (let i = archCurveSteps; i >= 0; i--) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ix = archMidX + archVibrate + Math.cos(angle) * innerR;
    const iy = archBaseY - Math.sin(angle) * innerR * archForeshorten;
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();

  // Strong outer arch outline
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ox = archMidX + archVibrate + Math.cos(angle) * outerR;
    const oy = archBaseY - Math.sin(angle) * outerR * archForeshorten;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  ctx.stroke();

  // Inner arch outline
  ctx.strokeStyle = "#7a6a5a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ix = archMidX + archVibrate + Math.cos(angle) * innerR;
    const iy = archBaseY - Math.sin(angle) * innerR * archForeshorten;
    if (i === 0) ctx.moveTo(ix, iy);
    else ctx.lineTo(ix, iy);
  }
  ctx.stroke();

  // Highlight on outer edge of arch
  ctx.strokeStyle = "rgba(220, 210, 195, 0.4)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ox = archMidX + archVibrate + Math.cos(angle) * (outerR + 1 * zoom);
    const oy =
      archBaseY - Math.sin(angle) * (outerR + 1 * zoom) * archForeshorten;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  ctx.stroke();

  // Voussoir stones with alternating shade and glowing mortar joints
  const voussoirCount = 9;
  for (let v = 0; v < voussoirCount; v++) {
    const t0 = v / voussoirCount;
    const t1 = (v + 1) / voussoirCount;
    const a0 = Math.PI * (1 - t0);
    const a1 = Math.PI * (1 - t1);
    const shade = v % 2 === 0 ? 0 : 20;

    ctx.fillStyle = `rgb(${178 + shade}, ${162 + shade}, ${138 + shade})`;
    ctx.beginPath();
    ctx.moveTo(
      archMidX + archVibrate + Math.cos(a0) * outerR,
      archBaseY - Math.sin(a0) * outerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a1) * outerR,
      archBaseY - Math.sin(a1) * outerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a1) * innerR,
      archBaseY - Math.sin(a1) * innerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a0) * innerR,
      archBaseY - Math.sin(a0) * innerR * 0.7,
    );
    ctx.closePath();
    ctx.fill();

    // Glowing mortar joint between voussoirs
    const mortarAlpha =
      0.12 + Math.sin(time * 2 + v * 0.7) * 0.08 + attackPulse * 0.25;
    ctx.strokeStyle = `rgba(${glowColor}, ${mortarAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      archMidX + archVibrate + Math.cos(a0) * outerR,
      archBaseY - Math.sin(a0) * outerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a0) * innerR,
      archBaseY - Math.sin(a0) * innerR * 0.7,
    );
    ctx.stroke();

    // 3D soffit face (visible underside depth of each voussoir)
    const midA = (a0 + a1) / 2;
    if (Math.sin(midA) > 0.2) {
      const depthFactor = 0.4 + Math.sin(midA) * 0.6;
      ctx.fillStyle = `rgb(${128 + shade}, ${112 + shade}, ${88 + shade})`;
      ctx.beginPath();
      ctx.moveTo(
        archMidX + archVibrate + Math.cos(a0) * innerR,
        archBaseY - Math.sin(a0) * innerR * 0.7,
      );
      ctx.lineTo(
        archMidX + archVibrate + Math.cos(a1) * innerR,
        archBaseY - Math.sin(a1) * innerR * 0.7,
      );
      ctx.lineTo(
        archMidX + archVibrate + Math.cos(a1) * innerR,
        archTopY -
          archLift +
          6 * zoom -
          Math.sin(a1) * innerR * 0.7 +
          archDepth * depthFactor,
      );
      ctx.lineTo(
        archMidX + archVibrate + Math.cos(a0) * innerR,
        archTopY -
          archLift +
          6 * zoom -
          Math.sin(a0) * innerR * 0.7 +
          archDepth * depthFactor,
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  // Arch rune carvings on voussoir faces
  const archRuneGlow = 0.5 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${archRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `${7 * zoom}px serif`;
  ctx.textAlign = "center";
  const archRunes = ["ᚡ", "ᚢ", "ᚣ", "ᚤ", "ᚥ"];
  for (let i = 0; i < 5; i++) {
    const runeT = (i + 0.5) / 5;
    const runeAngle = Math.PI * (1 - runeT);
    const midRad = (outerR + innerR) / 2;
    const runeX = archMidX + archVibrate + Math.cos(runeAngle) * midRad;
    const runeY = archBaseY - Math.sin(runeAngle) * midRad * 0.7;
    ctx.fillText(archRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Energy conduit along inner arch curve
  const conduitGlow = 0.5 + Math.sin(time * 5) * 0.3 + attackPulse * 1.5;
  ctx.strokeStyle = `rgba(${glowColor}, ${conduitGlow})`;
  ctx.lineWidth = (2 + attackPulse * 3) * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ix = archMidX + archVibrate + Math.cos(angle) * innerR;
    const iy = archBaseY - Math.sin(angle) * innerR * 0.7;
    if (i === 0) ctx.moveTo(ix, iy);
    else ctx.lineTo(ix, iy);
  }
  ctx.stroke();

  // Flowing energy particles along arch conduit
  for (let p = 0; p < 5; p++) {
    const pPhase = (time * 1.5 + p * 0.2) % 1;
    const pAngle = Math.PI * (1 - pPhase);
    const px = archMidX + archVibrate + Math.cos(pAngle) * innerR;
    const py = archBaseY - Math.sin(pAngle) * innerR * 0.7;
    ctx.fillStyle = `rgba(${glowColor}, ${0.6 + Math.sin(time * 8 + p) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, (2 + attackPulse * 2) * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Keystone with mystical core (positioned inside the arch opening, shifted up)
  const keystoneY = archCenterY - 8 * zoom;
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 7 * zoom, keystoneY - 4.5 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 18 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 7 * zoom, keystoneY - 4.5 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 4.5 * zoom, keystoneY + 2 * zoom);
  ctx.lineTo(screenPos.x + archVibrate - 4.5 * zoom, keystoneY + 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Keystone decorative lines
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 4 * zoom, keystoneY - 3 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 14 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 4 * zoom, keystoneY - 3 * zoom);
  ctx.stroke();

  // Keystone energy core
  const coreGrad = ctx.createRadialGradient(
    screenPos.x + archVibrate,
    keystoneY - 9 * zoom,
    0,
    screenPos.x + archVibrate,
    keystoneY - 9 * zoom,
    (6 + attackPulse * 3) * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${conduitGlow})`);
  coreGrad.addColorStop(0.3, `rgba(${glowColor}, ${conduitGlow})`);
  coreGrad.addColorStop(0.6, `rgba(${glowColor}, ${conduitGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x + archVibrate,
    keystoneY - 9 * zoom,
    (6 + attackPulse * 3) * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Keystone rune
  ctx.fillStyle = `rgba(${glowColor}, ${conduitGlow + 0.2})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `bold ${9 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛉ", screenPos.x + archVibrate, keystoneY - 7.5 * zoom);
  ctx.shadowBlur = 0;

  // === ANIMATED MYSTICAL ELEMENTS ===

  // Oscillating runic rings around the arch opening (subtle)
  for (let ring = 0; ring < 3; ring++) {
    const ringPhaseOff = ring * ((Math.PI * 2) / 3);
    const ringTilt = Math.sin(time * 1.2 + ringPhaseOff) * 0.4;
    const ringRadius = (10 + ring * 4) * zoom + portalExpand * 0.2;
    const ringAlpha =
      0.12 + Math.sin(time * 2.5 + ring) * 0.06 + attackPulse * 0.2;

    ctx.strokeStyle = `rgba(${glowColor}, ${ringAlpha})`;
    ctx.lineWidth = (1.5 - ring * 0.3) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      archMidX + archVibrate,
      archCenterY,
      ringRadius,
      ringRadius * (0.35 + ringTilt * 0.15),
      time * (0.8 + ring * 0.3) + ringPhaseOff,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Small rune symbols orbiting on each ring
    const ringRuneSymbols = ["ᛏ", "ᛒ", "ᛖ", "ᛗ"];
    for (let r = 0; r < 4; r++) {
      const symAngle =
        time * (0.8 + ring * 0.3) + ringPhaseOff + (r / 4) * Math.PI * 2;
      const symX = archMidX + archVibrate + Math.cos(symAngle) * ringRadius;
      const symY =
        archCenterY +
        Math.sin(symAngle) * ringRadius * (0.35 + ringTilt * 0.15);
      ctx.fillStyle = `rgba(${glowColor}, ${ringAlpha + 0.1})`;
      ctx.font = `${(4 + ring) * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(ringRuneSymbols[r], symX, symY);
    }
  }

  // Arcane clockwork gears visible in archway
  for (let gear = 0; gear < 2; gear++) {
    const gearSide = gear === 0 ? -1 : 1;
    const gearX = archMidX + archVibrate + gearSide * 10 * zoom;
    const gearY = archCenterY + 2 * zoom;
    const gearRadius = (4 + gear * 1.5) * zoom;
    const gearRotation = time * (2 + gear) * gearSide;
    const gearAlpha =
      0.12 + Math.sin(time * 3 + gear * 2) * 0.06 + attackPulse * 0.15;
    const gearTeeth = 8;

    ctx.strokeStyle = `rgba(${glowColor}, ${gearAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    for (let t = 0; t <= gearTeeth * 2; t++) {
      const toothAngle = gearRotation + (t / (gearTeeth * 2)) * Math.PI * 2;
      const toothR = t % 2 === 0 ? gearRadius : gearRadius * 0.75;
      const tx = gearX + Math.cos(toothAngle) * toothR;
      const ty = gearY + Math.sin(toothAngle) * toothR * 0.5;
      if (t === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.stroke();

    // Gear center hub
    ctx.fillStyle = `rgba(${glowColor}, ${gearAlpha + 0.1})`;
    ctx.beginPath();
    ctx.ellipse(gearX, gearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gear spokes
    for (let s = 0; s < 4; s++) {
      const spokeAngle = gearRotation + (s / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(gearX, gearY);
      ctx.lineTo(
        gearX + Math.cos(spokeAngle) * gearRadius * 0.7,
        gearY + Math.sin(spokeAngle) * gearRadius * 0.35,
      );
      ctx.stroke();
    }
  }

  // Pendulum swinging in center of archway
  const pendulumAngle = Math.sin(time * 2.5) * 0.4;
  const pendulumLen = 12 * zoom;
  const pendulumPivotY = archCenterY - 8 * zoom;
  const pendulumBobX =
    archMidX + archVibrate + Math.sin(pendulumAngle) * pendulumLen;
  const pendulumBobY = pendulumPivotY + Math.cos(pendulumAngle) * pendulumLen;
  const pendulumAlpha = 0.18 + attackPulse * 0.2;

  ctx.strokeStyle = `rgba(${glowColor}, ${pendulumAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(archMidX + archVibrate, pendulumPivotY);
  ctx.lineTo(pendulumBobX, pendulumBobY);
  ctx.stroke();

  ctx.fillStyle = `rgba(${glowColor}, ${pendulumAlpha + 0.15})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(pendulumBobX, pendulumBobY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Floating stone fragments orbiting during attacks
  if (attackPulse > 0.05) {
    for (let frag = 0; frag < 6; frag++) {
      const fragAngle = time * 4 + (frag / 6) * Math.PI * 2;
      const fragRad = (20 + Math.sin(time * 3 + frag) * 8) * zoom;
      const fragX = archMidX + Math.cos(fragAngle) * fragRad;
      const fragY =
        archCenterY +
        Math.sin(fragAngle) * fragRad * 0.4 -
        attackPulse * 10 * zoom;
      const fragSize = (2 + Math.sin(frag * 1.7) * 1) * zoom;
      const fragAlpha = attackPulse * 0.7;
      const fragRotation = time * 6 + frag * 1.2;

      ctx.save();
      ctx.translate(fragX, fragY);
      ctx.rotate(fragRotation);
      ctx.fillStyle = `rgba(180, 165, 140, ${fragAlpha})`;
      ctx.fillRect(-fragSize, -fragSize * 0.6, fragSize * 2, fragSize * 1.2);
      ctx.fillStyle = `rgba(140, 125, 100, ${fragAlpha})`;
      ctx.beginPath();
      ctx.moveTo(fragSize, -fragSize * 0.6);
      ctx.lineTo(fragSize + fragSize * 0.4, -fragSize * 0.3);
      ctx.lineTo(fragSize + fragSize * 0.4, fragSize * 0.9);
      ctx.lineTo(fragSize, fragSize * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Resonance crystals that vibrate and rotate at arch springers
  for (let cSide = -1; cSide <= 1; cSide += 2) {
    const crystalBaseX = archMidX + archVibrate + cSide * innerR * 0.5;
    const crystalBaseY = archCenterY + 6 * zoom;
    const crystalVibrate =
      Math.sin(time * 12 + cSide * 3) * (1 + attackPulse * 3) * zoom;
    const crystalAlpha =
      0.5 + Math.sin(time * 4 + cSide) * 0.2 + attackPulse * 0.3;

    ctx.save();
    ctx.translate(crystalBaseX + crystalVibrate, crystalBaseY);
    ctx.rotate(time * 1.5 * cSide * 0.1);

    ctx.fillStyle = `rgba(${glowColor}, ${crystalAlpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(0, -8 * zoom);
    ctx.lineTo(-3 * zoom, -2 * zoom);
    ctx.lineTo(-2 * zoom, 4 * zoom);
    ctx.lineTo(2 * zoom, 4 * zoom);
    ctx.lineTo(3 * zoom, -2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Crystal highlight face
    ctx.fillStyle = `rgba(255, 255, 255, ${crystalAlpha * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, -8 * zoom);
    ctx.lineTo(3 * zoom, -2 * zoom);
    ctx.lineTo(1 * zoom, -1 * zoom);
    ctx.closePath();
    ctx.fill();

    // Crystal core glow
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = (8 + attackPulse * 10) * zoom;
    ctx.fillStyle = `rgba(${glowColor}, ${crystalAlpha})`;
    ctx.beginPath();
    ctx.arc(0, -2 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // === PORTAL EFFECT ===
  const portalCenterY = archCenterY + 6 * zoom;
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
  const portalSizeX = 14 * zoom + portalExpand * 0.5;
  const portalSizeY = 18 * zoom + portalExpand * 0.6;

  const portalGrad = ctx.createRadialGradient(
    screenPos.x,
    portalCenterY,
    0,
    screenPos.x,
    portalCenterY,
    portalSizeY,
  );
  portalGrad.addColorStop(0, `rgba(${glowColor}, ${glowIntensity * 0.5})`);
  portalGrad.addColorStop(0.5, `rgba(${glowColor}, ${glowIntensity * 0.25})`);
  portalGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    portalCenterY,
    portalSizeX,
    portalSizeY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Dimensional depth rings (concentric ellipses receding into portal)
  for (let dRing = 0; dRing < 5; dRing++) {
    const depthFade = dRing / 5;
    const depthAlpha = glowIntensity * (0.15 - depthFade * 0.025);
    const depthScale = 1 - depthFade * 0.15;
    const depthY = portalCenterY + dRing * 1.5 * zoom;
    ctx.strokeStyle = `rgba(${glowColor}, ${depthAlpha})`;
    ctx.lineWidth = (1.5 - dRing * 0.2) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      depthY,
      portalSizeX * depthScale,
      portalSizeY * depthScale * 0.8,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Dimensional ripple distortion waves
  for (let ripple = 0; ripple < 3; ripple++) {
    const ripplePhase = (time * 1.5 + ripple * 0.8) % 2;
    const rippleScale = 0.3 + ripplePhase * 0.6;
    const rippleAlpha = (1 - ripplePhase / 2) * 0.2 * glowIntensity;
    if (rippleAlpha > 0.02) {
      ctx.strokeStyle = `rgba(${glowColor}, ${rippleAlpha})`;
      ctx.lineWidth = (2 - ripplePhase * 0.8) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        portalCenterY,
        portalSizeX * rippleScale,
        portalSizeY * rippleScale,
        ripple * 0.3,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  // Swirling vortex
  const vortexSpeed = time * 3;
  for (let spiral = 0; spiral < 4; spiral++) {
    const spiralOffset = (spiral / 4) * Math.PI * 2;
    ctx.strokeStyle = `rgba(${glowColor}, ${0.2 + Math.sin(time * 4 + spiral) * 0.1 + attackPulse * 0.2})`;
    ctx.lineWidth = (1.8 - spiral * 0.3) * zoom;
    ctx.beginPath();

    for (let i = 0; i <= 25; i++) {
      const t = i / 25;
      const angle = vortexSpeed + spiralOffset + t * Math.PI * 4;
      const radius = t * portalSizeX * 0.85;
      const x = screenPos.x + Math.cos(angle) * radius;
      const y =
        portalCenterY + Math.sin(angle) * radius * (portalSizeY / portalSizeX);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Inner swirl particles
  for (let p = 0; p < 10; p++) {
    const particleAngle = vortexSpeed * 1.5 + (p / 10) * Math.PI * 2;
    const particleRadius = portalSizeX * (0.25 + Math.sin(time * 5 + p) * 0.2);
    const px = screenPos.x + Math.cos(particleAngle) * particleRadius;
    const py =
      portalCenterY +
      Math.sin(particleAngle) * particleRadius * (portalSizeY / portalSizeX);

    ctx.fillStyle = `rgba(${glowColor}, ${0.5 + Math.sin(time * 6 + p) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, (2.5 + Math.sin(time * 8 + p) * 1) * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Central energy core in portal
  const coreSize = (4 + Math.sin(time * 4) * 1.5 + attackPulse * 2) * zoom;
  const coreGrad2 = ctx.createRadialGradient(
    screenPos.x,
    portalCenterY,
    0,
    screenPos.x,
    portalCenterY,
    coreSize * 2,
  );
  coreGrad2.addColorStop(0, `rgba(255, 255, 255, ${0.8 + attackPulse * 0.2})`);
  coreGrad2.addColorStop(0.3, `rgba(${glowColor}, ${0.6 + attackPulse * 0.3})`);
  coreGrad2.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad2;
  ctx.beginPath();
  ctx.arc(screenPos.x, portalCenterY, coreSize * 2, 0, Math.PI * 2);
  ctx.fill();

  // Mystical scanlines in portal
  ctx.strokeStyle = `rgba(${glowColor}, ${glowIntensity * 0.25})`;
  ctx.lineWidth = 1 * zoom;
  for (let sl = 0; sl < 10; sl++) {
    const sly = portalCenterY - 24 * zoom + sl * 5 * zoom;
    const slw = 20 - Math.abs(sl - 5) * 3;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - slw * zoom, sly);
    ctx.lineTo(screenPos.x + slw * zoom, sly);
    ctx.stroke();
  }

  // Sound/energy waves
  const waveCount = tower.level + 3;
  for (let i = 0; i < waveCount; i++) {
    const wavePhase = (time * 2 + i * 0.25) % 1;
    const waveRadius = 10 + wavePhase * 55;
    const waveAlpha =
      0.6 * (1 - wavePhase) * (glowIntensity + attackPulse * 0.5);

    ctx.strokeStyle = `rgba(${glowColor}, ${waveAlpha})`;
    ctx.lineWidth = (3.5 - wavePhase * 2.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      portalCenterY - 5 * zoom,
      waveRadius * zoom * 0.8,
      waveRadius * zoom * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Attack burst effect
  if (timeSinceFire < 300) {
    const burstPhase = timeSinceFire / 300;
    const burstAlpha = (1 - burstPhase) * 0.8;
    const burstSize = 18 + burstPhase * 25;

    ctx.fillStyle = `rgba(${glowColor}, ${burstAlpha})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, portalCenterY, burstSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Expanding ring
    ctx.strokeStyle = `rgba(${glowColor}, ${burstAlpha * 0.5})`;
    ctx.lineWidth = 4 * zoom * (1 - burstPhase);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      portalCenterY - 5 * zoom,
      (25 + burstPhase * 45) * zoom,
      (12 + burstPhase * 22) * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Floating music notes / arcane symbols
  const particleCount = 7 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const notePhase = (time * 1.2 + i * 0.35) % 3;
    const noteAngle = (i / particleCount) * Math.PI * 2 + time * 0.5;
    const noteRadius = 24 + Math.sin(notePhase * Math.PI) * 14;
    const noteX = screenPos.x + Math.cos(noteAngle) * noteRadius * zoom * 0.9;
    const noteY =
      portalCenterY -
      8 * zoom +
      Math.sin(noteAngle) * noteRadius * zoom * 0.45 -
      notePhase * 12 * zoom;
    const noteAlpha = Math.max(0, 1 - notePhase / 3) * 0.7;

    if (noteAlpha > 0.1) {
      ctx.fillStyle = `rgba(${glowColor}, ${noteAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.font = `${(10 + Math.sin(time * 4 + i) * 2) * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const symbols = ["♪", "♫", "♬", "♩", "𝄞", "✦", "✧"];
      ctx.fillText(symbols[i % 7], noteX, noteY);
      ctx.shadowBlur = 0;

      // Note trail
      ctx.strokeStyle = `rgba(${glowColor}, ${noteAlpha * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(noteX, noteY);
      ctx.lineTo(
        noteX + Math.cos(noteAngle + Math.PI) * 10 * zoom,
        noteY + Math.sin(noteAngle + Math.PI) * 5 * zoom,
      );
      ctx.stroke();
    }
  }

  // === SHOCKWAVE EMITTER (Level 4 Upgrade A) - EPIC DARK FANTASY ===
  if (isShockwave) {
    // Isometric diamond seismic sensors on pillars
    for (let side = -1; side <= 1; side += 2) {
      const genX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const genY = pillarBottomY - pillarHeight * zoom * 0.45 - pillarBounce;
      const seismicPulse =
        0.5 + Math.sin(time * 8 + side) * 0.3 + attackPulse * 0.5;
      const dW = 10 * zoom;
      const dH = 7 * zoom;

      // Isometric diamond housing (back face)
      ctx.fillStyle = "#3a1515";
      ctx.beginPath();
      ctx.moveTo(genX, genY - dH);
      ctx.lineTo(genX + dW, genY);
      ctx.lineTo(genX, genY + dH * 0.6);
      ctx.lineTo(genX - dW, genY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a2525";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Diamond depth edge (3D bottom face)
      ctx.fillStyle = "#2a0c0c";
      ctx.beginPath();
      ctx.moveTo(genX - dW, genY);
      ctx.lineTo(genX, genY + dH * 0.6);
      ctx.lineTo(genX, genY + dH * 0.6 + 3 * zoom);
      ctx.lineTo(genX - dW, genY + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#200808";
      ctx.beginPath();
      ctx.moveTo(genX + dW, genY);
      ctx.lineTo(genX, genY + dH * 0.6);
      ctx.lineTo(genX, genY + dH * 0.6 + 3 * zoom);
      ctx.lineTo(genX + dW, genY + 2 * zoom);
      ctx.closePath();
      ctx.fill();

      // Inner diamond border
      ctx.strokeStyle = `rgba(255, 80, 60, ${0.3 + seismicPulse * 0.4})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(genX, genY - dH * 0.6);
      ctx.lineTo(genX + dW * 0.65, genY);
      ctx.lineTo(genX, genY + dH * 0.35);
      ctx.lineTo(genX - dW * 0.65, genY);
      ctx.closePath();
      ctx.stroke();

      // Core glow
      const coreR =
        (3.5 + Math.sin(time * 6 + side * 2) * 1 + attackPulse * 3) * zoom;
      ctx.fillStyle = `rgba(255, 80, 50, ${seismicPulse * 0.6})`;
      ctx.shadowColor = "#ff3322";
      ctx.shadowBlur = (6 + attackPulse * 10) * zoom;
      ctx.beginPath();
      ctx.moveTo(genX, genY - coreR);
      ctx.lineTo(genX + coreR * 1.4, genY);
      ctx.lineTo(genX, genY + coreR * 0.6);
      ctx.lineTo(genX - coreR * 1.4, genY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright hot center
      ctx.fillStyle = `rgba(255, 230, 200, ${seismicPulse})`;
      ctx.beginPath();
      ctx.arc(genX, genY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Cross-hair lines
      ctx.strokeStyle = `rgba(255, 100, 70, ${0.4 + attackPulse * 0.4})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(genX - dW * 0.45, genY);
      ctx.lineTo(genX - 2 * zoom, genY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(genX + 2 * zoom, genY);
      ctx.lineTo(genX + dW * 0.45, genY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(genX, genY - dH * 0.4);
      ctx.lineTo(genX, genY - 2 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(genX, genY + 2 * zoom);
      ctx.lineTo(genX, genY + dH * 0.2);
      ctx.stroke();
    }

    // Jagged red rune bands on pillar shafts
    for (let side = -1; side <= 1; side += 2) {
      const bpX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const bandGlow = 0.3 + attackPulse * 0.6;
      ctx.strokeStyle = `rgba(255, 60, 40, ${bandGlow})`;
      ctx.lineWidth = 1.5 * zoom;
      for (let b = 0; b < 3; b++) {
        const bY =
          pillarBottomY - pillarHeight * zoom * (0.2 + b * 0.25) - pillarBounce;
        ctx.beginPath();
        for (let seg = 0; seg <= 6; seg++) {
          const sx = bpX - pw * 0.8 + (seg / 6) * pw * 1.6;
          const sy = bY + Math.sin(seg * 1.5 + time * 4) * 1.5 * zoom;
          if (seg === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }

    // Floating debris chunks during attack
    if (attackPulse > 0.1) {
      for (let i = 0; i < 8; i++) {
        const debrisAngle = (i / 8) * Math.PI * 2 + time * 2;
        const debrisHeight = attackPulse * 25 * zoom * Math.sin(time * 5 + i);
        const debrisX = screenPos.x + Math.cos(debrisAngle) * 30 * zoom;
        const debrisY = screenPos.y + 5 * zoom - debrisHeight;
        ctx.save();
        ctx.translate(debrisX, debrisY);
        ctx.rotate(time * 6 + i);
        ctx.fillStyle = `rgba(139, 90, 60, ${attackPulse * 0.8})`;
        ctx.fillRect(-2 * zoom, -2 * zoom, 4 * zoom, 3 * zoom);
        ctx.fillStyle = `rgba(100, 60, 40, ${attackPulse * 0.6})`;
        ctx.fillRect(2 * zoom, -2 * zoom, 2 * zoom, 3 * zoom);
        ctx.restore();
      }
    }

    // Massive shockwave rings during attack
    if (timeSinceFire < 500) {
      const shockPhase = timeSinceFire / 500;
      for (let ring = 0; ring < 3; ring++) {
        const ringDelay = ring * 0.1;
        const ringPhase = Math.max(0, shockPhase - ringDelay);
        if (ringPhase > 0 && ringPhase < 1) {
          const ringRadius = 30 + ringPhase * 60;
          const ringAlpha = (1 - ringPhase) * 0.7;
          ctx.strokeStyle = `rgba(255, 100, 80, ${ringAlpha})`;
          ctx.lineWidth = (4 - ring) * zoom * (1 - ringPhase);
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 8 * zoom,
            ringRadius * zoom,
            ringRadius * 0.4 * zoom,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    }

    // Red energy vortex in portal
    for (let v = 0; v < 12; v++) {
      const vortexAngle = time * 3 + (v / 12) * Math.PI * 2;
      const vortexRadius = 15 + Math.sin(time * 4 + v) * 5;
      const vortexX =
        screenPos.x + Math.cos(vortexAngle) * vortexRadius * zoom;
      const vortexY =
        portalCenterY + Math.sin(vortexAngle) * vortexRadius * 0.4 * zoom;
      ctx.fillStyle = `rgba(255, 80, 80, ${0.3 + Math.sin(time * 6 + v) * 0.15})`;
      ctx.beginPath();
      ctx.arc(vortexX, vortexY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SYMPHONY HALL (Level 4 Upgrade B) - EPIC DARK FANTASY ===
  if (isSymphony) {
    // Isometric hexagonal resonance lenses on pillars
    for (let side = -1; side <= 1; side += 2) {
      const ampX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const ampY = pillarBottomY - pillarHeight * zoom * 0.45 - pillarBounce;
      const crystalGlow =
        0.5 + Math.sin(time * 5 + side) * 0.3 + attackPulse * 0.5;
      const hR = 9 * zoom;

      // Isometric hexagon housing (back face)
      ctx.fillStyle = "#0c1a35";
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = ampX + Math.cos(hAngle) * hR;
        const hy = ampY + Math.sin(hAngle) * hR * 0.55;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a3570";
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Hex depth edges (3D bottom)
      ctx.fillStyle = "#081228";
      ctx.beginPath();
      const hexBL = { x: ampX + Math.cos(Math.PI * 5 / 6) * hR, y: ampY + Math.sin(Math.PI * 5 / 6) * hR * 0.55 };
      const hexB = { x: ampX + Math.cos(Math.PI / 2) * hR, y: ampY + Math.sin(Math.PI / 2) * hR * 0.55 };
      const hexBR = { x: ampX + Math.cos(Math.PI / 6) * hR, y: ampY + Math.sin(Math.PI / 6) * hR * 0.55 };
      ctx.moveTo(hexBL.x, hexBL.y);
      ctx.lineTo(hexB.x, hexB.y);
      ctx.lineTo(hexB.x, hexB.y + 3 * zoom);
      ctx.lineTo(hexBL.x, hexBL.y + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#060e20";
      ctx.beginPath();
      ctx.moveTo(hexB.x, hexB.y);
      ctx.lineTo(hexBR.x, hexBR.y);
      ctx.lineTo(hexBR.x, hexBR.y + 2 * zoom);
      ctx.lineTo(hexB.x, hexB.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();

      // Inner hexagon ring
      ctx.strokeStyle = `rgba(80, 180, 255, ${0.3 + crystalGlow * 0.4})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = ampX + Math.cos(hAngle) * hR * 0.6;
        const hy = ampY + Math.sin(hAngle) * hR * 0.6 * 0.55;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Radial spokes from center to hex vertices
      ctx.strokeStyle = `rgba(60, 150, 220, ${0.15 + crystalGlow * 0.15})`;
      ctx.lineWidth = 0.7 * zoom;
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(ampX, ampY);
        ctx.lineTo(
          ampX + Math.cos(hAngle) * hR * 0.85,
          ampY + Math.sin(hAngle) * hR * 0.85 * 0.55,
        );
        ctx.stroke();
      }

      // Glowing core lens
      const lensR =
        (3 + Math.sin(time * 4 + side * 3) * 0.8 + attackPulse * 2) * zoom;
      ctx.fillStyle = `rgba(80, 180, 255, ${crystalGlow * 0.5})`;
      ctx.shadowColor = "#55bbff";
      ctx.shadowBlur = (6 + attackPulse * 10) * zoom;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = ampX + Math.cos(hAngle) * lensR;
        const hy = ampY + Math.sin(hAngle) * lensR * 0.55;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright center point
      ctx.fillStyle = `rgba(220, 245, 255, ${crystalGlow})`;
      ctx.beginPath();
      ctx.arc(ampX, ampY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Concentric ring ripple (like a speaker cone)
      for (let ring = 1; ring <= 3; ring++) {
        const ringAlpha =
          (0.1 + Math.sin(time * 6 - ring * 1.2 + side) * 0.08) +
          attackPulse * 0.15;
        ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          ampX,
          ampY,
          hR * 0.2 * ring,
          hR * 0.12 * ring,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    // Flowing cyan energy veins on pillar shafts
    for (let side = -1; side <= 1; side += 2) {
      const bpX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const veinGlow = 0.25 + Math.sin(time * 3) * 0.1 + attackPulse * 0.5;
      ctx.strokeStyle = `rgba(80, 200, 255, ${veinGlow})`;
      ctx.lineWidth = 1.2 * zoom;
      for (let v = 0; v < 2; v++) {
        const vOff = v === 0 ? -pw * 0.3 : pw * 0.3;
        ctx.beginPath();
        for (let seg = 0; seg <= 8; seg++) {
          const t = seg / 8;
          const sx = bpX + vOff + Math.sin(t * Math.PI * 3 + time * 2 + v) * 2 * zoom;
          const sy =
            pillarBottomY - pillarHeight * zoom * (0.1 + t * 0.7) - pillarBounce;
          if (seg === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }

    // Floating crystalline note shards
    for (let i = 0; i < 6; i++) {
      const shardPhase = (time * 0.6 + i * 0.5) % 3;
      const shardAngle = (i / 6) * Math.PI * 2 + time * 0.3;
      const shardRadius = 28 + Math.sin(shardPhase * Math.PI * 0.5) * 8;
      const shardX = screenPos.x + Math.cos(shardAngle) * shardRadius * zoom;
      const shardY =
        portalCenterY -
        10 * zoom +
        Math.sin(shardAngle) * shardRadius * 0.3 * zoom -
        shardPhase * 6 * zoom;
      const shardAlpha = Math.max(0, 1 - shardPhase / 3) * 0.5;

      if (shardAlpha > 0.05) {
        ctx.save();
        ctx.translate(shardX, shardY);
        ctx.rotate(time * 2 + i * 1.1);
        ctx.fillStyle = `rgba(120, 210, 255, ${shardAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -4 * zoom);
        ctx.lineTo(2 * zoom, 0);
        ctx.lineTo(0, 4 * zoom);
        ctx.lineTo(-2 * zoom, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(200, 240, 255, ${shardAlpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, -4 * zoom);
        ctx.lineTo(2 * zoom, 0);
        ctx.lineTo(0, -1 * zoom);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Harmonic wave patterns in archway
    ctx.lineWidth = 1.5 * zoom;
    for (let wave = 0; wave < 3; wave++) {
      const wAlpha = 0.25 + Math.sin(time * 2 + wave) * 0.1 + attackPulse * 0.3;
      ctx.strokeStyle = `rgba(100, 200, 255, ${wAlpha})`;
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const waveX = screenPos.x - 25 * zoom + t * 50 * zoom;
        const waveY =
          portalCenterY -
          5 * zoom +
          Math.sin(t * Math.PI * 4 + time * 5 + wave) * 6 * zoom;
        if (i === 0) ctx.moveTo(waveX, waveY);
        else ctx.lineTo(waveX, waveY);
      }
      ctx.stroke();
    }

    // Resonance aura
    const auraGlow = 0.2 + Math.sin(time * 3) * 0.1 + attackPulse * 0.3;
    const auraGrad = ctx.createRadialGradient(
      screenPos.x,
      portalCenterY,
      0,
      screenPos.x,
      portalCenterY,
      50 * zoom,
    );
    auraGrad.addColorStop(0, `rgba(100, 200, 255, ${auraGlow * 0.5})`);
    auraGrad.addColorStop(0.5, `rgba(100, 200, 255, ${auraGlow * 0.2})`);
    auraGrad.addColorStop(1, "rgba(100, 200, 255, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      portalCenterY,
      50 * zoom,
      35 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Sound beam during attack
    if (timeSinceFire < 400) {
      const beamPhase = timeSinceFire / 400;
      const beamAlpha = (1 - beamPhase) * 0.6;

      // Central beam
      ctx.fillStyle = `rgba(150, 220, 255, ${beamAlpha})`;
      ctx.shadowColor = "#99ddff";
      ctx.shadowBlur = 20 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        portalCenterY,
        (5 + beamPhase * 15) * zoom,
        (10 + beamPhase * 30) * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Concentric sound rings
      for (let ring = 0; ring < 5; ring++) {
        const ringPhase = (beamPhase + ring * 0.08) % 1;
        const ringRadius = 10 + ringPhase * 40;
        const ringAlpha = (1 - ringPhase) * beamAlpha * 0.5;

        ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
        ctx.lineWidth = 2 * zoom * (1 - ringPhase);
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          portalCenterY,
          ringRadius * zoom,
          ringRadius * 0.5 * zoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    // Blue energy swirls
    for (let s = 0; s < 8; s++) {
      const swirlAngle = time * 2 + (s / 8) * Math.PI * 2;
      const swirlRadius = 18 + Math.sin(time * 3 + s * 0.8) * 6;
      const swirlX = screenPos.x + Math.cos(swirlAngle) * swirlRadius * zoom;
      const swirlY =
        portalCenterY + Math.sin(swirlAngle) * swirlRadius * 0.4 * zoom;

      ctx.fillStyle = `rgba(100, 200, 255, ${
        0.4 + Math.sin(time * 5 + s) * 0.2
      })`;
      ctx.beginPath();
      ctx.arc(swirlX, swirlY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// CLUB TOWER - Epic Resource Generator with mechanical gold production
function renderClubTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 25 + tower.level * 8;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;
  const h = baseHeight * zoom;

  // Check if pawpoints were recently generated (flash effect)
  const recentGeneration =
    tower.lastAttack && Date.now() - tower.lastAttack < 500;
  const flashIntensity = recentGeneration
    ? Math.max(0, 1 - (Date.now() - tower.lastAttack!) / 500)
    : 0;

  // ========== ENHANCED FOUNDATION WITH TECH SCAFFOLDING ==========
  // Bottom tech platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 12 * zoom,
    baseWidth + 16,
    baseWidth + 16,
    4,
    {
      top: "#1a2a1a",
      left: "#0a1a0a",
      right: "#051505",
      leftBack: "#2a3a2a",
      rightBack: "#1a2a1a",
    },
    zoom,
  );

  // Foundation support struts
  ctx.strokeStyle = "#3a4a3a";
  ctx.lineWidth = 2 * zoom;
  for (const side of [-1, 1]) {
    // Diagonal support beams
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + side * (baseWidth + 16) * zoom * 0.45,
      screenPos.y + 8 * zoom,
    );
    ctx.lineTo(
      screenPos.x + side * (baseWidth + 6) * zoom * 0.35,
      screenPos.y + 2 * zoom,
    );
    ctx.stroke();
    // Vertical struts
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + side * (baseWidth + 12) * zoom * 0.4,
      screenPos.y + 8 * zoom,
    );
    ctx.lineTo(
      screenPos.x + side * (baseWidth + 12) * zoom * 0.4,
      screenPos.y + 2 * zoom,
    );
    ctx.stroke();
  }

  // Foundation data conduits
  ctx.strokeStyle = "#2a5a3a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - (baseWidth + 14) * zoom * 0.4,
    screenPos.y + 10 * zoom,
  );
  ctx.lineTo(
    screenPos.x + (baseWidth + 14) * zoom * 0.4,
    screenPos.y + 10 * zoom,
  );
  ctx.stroke();

  // Foundation circuit lights
  for (let i = 0; i < 5; i++) {
    const lightX =
      screenPos.x -
      (baseWidth + 10) * zoom * 0.3 +
      i * (baseWidth + 10) * zoom * 0.15;
    const lightGlow =
      0.4 + Math.sin(time * 6 + i * 0.8) * 0.3 + flashIntensity * 0.5;
    ctx.fillStyle = `rgba(0, 255, 100, ${lightGlow})`;
    ctx.beginPath();
    ctx.arc(lightX, screenPos.y + 10 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main foundation with gold accents
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    6,
    {
      top: "#2a4a3a",
      left: "#1a3a2a",
      right: "#0a2a1a",
      leftBack: "#3a5a4a",
      rightBack: "#2a4a3a",
    },
    zoom,
  );

  // Foundation gold trim edge with flash effect
  const foundGlow = 0.4 + Math.sin(time * 2) * 0.2 + flashIntensity * 0.4;
  ctx.strokeStyle = `rgba(201, 162, 39, ${foundGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - (baseWidth + 10) * zoom * 0.5,
    screenPos.y + 2 * zoom,
  );
  ctx.lineTo(
    screenPos.x,
    screenPos.y + (baseWidth + 10) * zoom * 0.25 + 2 * zoom,
  );
  ctx.lineTo(
    screenPos.x + (baseWidth + 10) * zoom * 0.5,
    screenPos.y + 2 * zoom,
  );
  ctx.stroke();

  // Corner tech nodes on foundation
  ctx.fillStyle = "#4a5a4a";
  for (const side of [-1, 1]) {
    const nodeX = screenPos.x + side * (baseWidth + 10) * zoom * 0.45;
    ctx.beginPath();
    ctx.arc(nodeX, screenPos.y + 4 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Node glow
    const nodeGlow =
      0.5 + Math.sin(time * 4 + side) * 0.3 + flashIntensity * 0.4;
    ctx.fillStyle = `rgba(0, 255, 100, ${nodeGlow})`;
    ctx.beginPath();
    ctx.arc(nodeX, screenPos.y + 4 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a5a4a";
  }

  // Main tower body - dark green tech with gold trim
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    baseHeight,
    {
      top: "#3a6a4a",
      left: "#2a5a3a",
      right: "#1a4a2a",
      leftBack: "#4a7a5a",
      rightBack: "#3a6a4a",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring wrapping the base) ==========
  const balRingY = screenPos.y + 2 * zoom;
  const balRingRX = w * 1.05;
  const balRingRY = d * 1.05;
  const balRingH = 6 * zoom;
  const balSegments = 32;
  const balPosts = 16;

  // Back half of bottom ellipse
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    balRingY,
    balRingRX,
    balRingRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();

  // Back half of top ellipse
  ctx.strokeStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    balRingY - balRingH,
    balRingRX,
    balRingRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();

  // Vertical posts (back half)
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < balPosts; bp++) {
    const postAngle = (bp / balPosts) * Math.PI * 2;
    if (Math.sin(postAngle) > 0) continue;
    const postX = screenPos.x + Math.cos(postAngle) * balRingRX;
    const postBaseY = balRingY + Math.sin(postAngle) * balRingRY;
    ctx.beginPath();
    ctx.moveTo(postX, postBaseY);
    ctx.lineTo(postX, postBaseY - balRingH);
    ctx.stroke();
  }

  // Back wall fills
  for (let i = 0; i < balSegments; i++) {
    const a0 = (i / balSegments) * Math.PI * 2;
    const a1 = ((i + 1) / balSegments) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * balRingRX;
    const y0b = balRingY + Math.sin(a0) * balRingRY;
    const x1 = screenPos.x + Math.cos(a1) * balRingRX;
    const y1b = balRingY + Math.sin(a1) * balRingRY;
    ctx.fillStyle = `rgba(42, 90, 58, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - balRingH);
    ctx.lineTo(x0, y0b - balRingH);
    ctx.closePath();
    ctx.fill();
  }

  // Front half of bottom ellipse
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, balRingY, balRingRX, balRingRY, 0, 0, Math.PI);
  ctx.stroke();

  // Front half of top ellipse
  ctx.strokeStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    balRingY - balRingH,
    balRingRX,
    balRingRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();

  // Vertical posts (front half)
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < balPosts; bp++) {
    const postAngle = (bp / balPosts) * Math.PI * 2;
    if (Math.sin(postAngle) <= 0) continue;
    const postX = screenPos.x + Math.cos(postAngle) * balRingRX;
    const postBaseY = balRingY + Math.sin(postAngle) * balRingRY;
    ctx.beginPath();
    ctx.moveTo(postX, postBaseY);
    ctx.lineTo(postX, postBaseY - balRingH);
    ctx.stroke();
  }

  // Front wall fills
  for (let i = 0; i < balSegments; i++) {
    const a0 = (i / balSegments) * Math.PI * 2;
    const a1 = ((i + 1) / balSegments) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * balRingRX;
    const y0b = balRingY + Math.sin(a0) * balRingRY;
    const x1 = screenPos.x + Math.cos(a1) * balRingRX;
    const y1b = balRingY + Math.sin(a1) * balRingRY;
    ctx.fillStyle = `rgba(42, 90, 58, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - balRingH);
    ctx.lineTo(x0, y0b - balRingH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== ENTRANCE PORTICO WITH GREEK REVIVAL COLUMNS ==========
  const porticoFrontY = screenPos.y + d * 0.45;
  const porticoH = h * 0.32;
  const colPositions = [-0.32, -0.11, 0.11, 0.32];
  for (const colOff of colPositions) {
    const colX = screenPos.x + w * colOff;
    const colBase = porticoFrontY + d * Math.abs(colOff) * 0.6;
    ctx.fillStyle = "#d4c9a8";
    ctx.beginPath();
    ctx.moveTo(colX - 2.5 * zoom, colBase);
    ctx.lineTo(colX - 2 * zoom, colBase - porticoH);
    ctx.lineTo(colX + 2 * zoom, colBase - porticoH);
    ctx.lineTo(colX + 2.5 * zoom, colBase);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(180,160,120,0.4)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(colX, colBase);
    ctx.lineTo(colX, colBase - porticoH);
    ctx.stroke();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(
      colX - 3.5 * zoom,
      colBase - porticoH - 2 * zoom,
      7 * zoom,
      3 * zoom,
    );
    ctx.fillStyle = "#b8a888";
    ctx.fillRect(colX - 3 * zoom, colBase - 1 * zoom, 6 * zoom, 2 * zoom);
  }
  ctx.fillStyle = "#3a6a4a";
  const entabY = porticoFrontY - porticoH + d * 0.08;
  ctx.fillRect(screenPos.x - w * 0.38, entabY, w * 0.76, 3 * zoom);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(screenPos.x - w * 0.38, entabY, w * 0.76, 3 * zoom);
  ctx.fillStyle = "#2a5a3a";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 0.4, entabY);
  ctx.lineTo(screenPos.x, entabY - 8 * zoom);
  ctx.lineTo(screenPos.x + w * 0.4, entabY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // ========== CLUB CREST ON FRONT FACE ==========
  const crestX = screenPos.x;
  const crestY = screenPos.y - h * 0.58;
  const crestR = 6 * zoom;
  ctx.fillStyle = "#1a3a2a";
  ctx.beginPath();
  ctx.moveTo(crestX, crestY - crestR);
  ctx.lineTo(crestX + crestR * 0.8, crestY - crestR * 0.4);
  ctx.lineTo(crestX + crestR * 0.8, crestY + crestR * 0.3);
  ctx.lineTo(crestX, crestY + crestR);
  ctx.lineTo(crestX - crestR * 0.8, crestY + crestR * 0.3);
  ctx.lineTo(crestX - crestR * 0.8, crestY - crestR * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  const crestGlow = 0.7 + Math.sin(time * 2) * 0.2 + flashIntensity * 0.3;
  ctx.fillStyle = `rgba(201, 162, 39, ${crestGlow})`;
  ctx.font = `bold ${7 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", crestX, crestY + zoom);

  // ========== DORMER WINDOWS WITH TREASURY GLOW ==========
  for (let wi = 0; wi < 3; wi++) {
    const winOff = (wi - 1) * w * 0.5;
    const winX = screenPos.x + winOff;
    const winY = screenPos.y - h * 0.42 - Math.abs(wi - 1) * 2 * zoom;
    const winW = 5 * zoom;
    const winH = 7 * zoom;
    ctx.fillStyle = "#0a1a0a";
    ctx.fillRect(winX - winW * 0.5, winY - winH, winW, winH);
    const treasGlow =
      0.25 + Math.sin(time * 2.5 + wi) * 0.15 + flashIntensity * 0.5;
    const winGrad = ctx.createRadialGradient(
      winX,
      winY - winH * 0.5,
      0,
      winX,
      winY - winH * 0.5,
      winW,
    );
    winGrad.addColorStop(0, `rgba(255, 200, 50, ${treasGlow})`);
    winGrad.addColorStop(1, `rgba(100, 80, 20, ${treasGlow * 0.2})`);
    ctx.fillStyle = winGrad;
    ctx.fillRect(winX - winW * 0.5, winY - winH, winW, winH);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.strokeRect(winX - winW * 0.5, winY - winH, winW, winH);
    ctx.beginPath();
    ctx.moveTo(winX, winY - winH);
    ctx.lineTo(winX, winY);
    ctx.moveTo(winX - winW * 0.5, winY - winH * 0.5);
    ctx.lineTo(winX + winW * 0.5, winY - winH * 0.5);
    ctx.stroke();
    ctx.fillStyle = "#1a3a2a";
    ctx.beginPath();
    ctx.moveTo(winX - winW * 0.7, winY - winH);
    ctx.lineTo(winX, winY - winH - 3.5 * zoom);
    ctx.lineTo(winX + winW * 0.7, winY - winH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== WINDOW BOXES WITH VEGETATION ==========
  for (let wi = 0; wi < 2; wi++) {
    const boxX = screenPos.x + (wi === 0 ? -1 : 1) * w * 0.5;
    const boxY = screenPos.y - h * 0.35;
    ctx.fillStyle = "#5a3a2a";
    ctx.fillRect(boxX - 4.5 * zoom, boxY, 9 * zoom, 2.5 * zoom);
    for (let p = 0; p < 4; p++) {
      const plantX = boxX - 3 * zoom + p * 2 * zoom;
      const sway = Math.sin(time * 1.5 + p * 0.9 + wi) * 1.2 * zoom;
      ctx.fillStyle = `rgba(${40 + p * 15}, ${120 + p * 20}, ${50 + p * 10}, 0.85)`;
      ctx.beginPath();
      ctx.arc(plantX + sway, boxY - 1.5 * zoom, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tower.level >= 2) {
      ctx.fillStyle = "#ffaa44";
      ctx.beginPath();
      ctx.arc(
        boxX + Math.sin(time + wi) * zoom,
        boxY - 3 * zoom,
        0.9 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ========== EXTERNAL SCAFFOLDING AND TECH INFRASTRUCTURE ==========
  // Left face scaffolding (follows left isometric edge)
  ctx.strokeStyle = "#5a6a5a";
  ctx.lineWidth = 1.5 * zoom;

  // Left face outer strut (follows iso left edge slope)
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 1.1, screenPos.y + 4 * zoom);
  ctx.lineTo(screenPos.x - w * 1.1 - d * 0.15, screenPos.y - h * 0.8 - d * 0.1);
  ctx.stroke();
  // Left face inner strut
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 0.85, screenPos.y + d * 0.15 + 2 * zoom);
  ctx.lineTo(
    screenPos.x - w * 0.85 - d * 0.1,
    screenPos.y - h * 0.75 - d * 0.05,
  );
  ctx.stroke();

  // Horizontal scaffold bars (angled to follow left iso face)
  for (let i = 0; i < 4; i++) {
    const barY = screenPos.y - h * 0.1 - i * h * 0.18;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.12, barY - d * 0.1);
    ctx.lineTo(screenPos.x - w * 0.83, barY + d * 0.1);
    ctx.stroke();
  }

  // Diagonal braces on left face
  ctx.strokeStyle = "#4a5a4a";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const braceY = screenPos.y - h * 0.05 - i * h * 0.22;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.1, braceY - d * 0.08);
    ctx.lineTo(screenPos.x - w * 0.85, braceY - h * 0.15 + d * 0.08);
    ctx.stroke();
  }

  // Right face scaffolding (follows right isometric edge)
  if (tower.level >= 2) {
    ctx.strokeStyle = "#5a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    // Right face outer strut
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.05, screenPos.y + 2 * zoom);
    ctx.lineTo(
      screenPos.x + w * 1.05 + d * 0.15,
      screenPos.y - h * 0.7 - d * 0.1,
    );
    ctx.stroke();
    // Right face inner strut
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.85, screenPos.y + d * 0.1);
    ctx.lineTo(
      screenPos.x + w * 0.85 + d * 0.1,
      screenPos.y - h * 0.65 - d * 0.05,
    );
    ctx.stroke();

    // Right face horizontal bars (angled for right iso face)
    for (let i = 0; i < 3; i++) {
      const barY = screenPos.y - h * 0.15 - i * h * 0.2;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 0.83, barY + d * 0.08);
      ctx.lineTo(screenPos.x + w * 1.07, barY - d * 0.08);
      ctx.stroke();
    }
  }

  // Isometric support ring (front arc visible)
  ctx.strokeStyle = "#6a7a6a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - h * 0.45,
    w * 1.05,
    d * 1.0,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();

  // Structural panel lines for better 3D effect
  ctx.strokeStyle = "#1a4a2a";
  ctx.lineWidth = 1 * zoom;
  // Left face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x - w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y);
    ctx.lineTo(panelX - d * 0.5, screenPos.y - baseHeight * zoom + d * 0.5);
    ctx.stroke();
  }
  // Right face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x + w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y);
    ctx.lineTo(panelX + d * 0.5, screenPos.y - baseHeight * zoom + d * 0.5);
    ctx.stroke();
  }

  // Gold corner accents
  ctx.fillStyle = "#c9a227";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 0.95, screenPos.y);
    ctx.lineTo(screenPos.x + side * w * 1.0, screenPos.y - 2 * zoom);
    ctx.lineTo(
      screenPos.x + side * w * 1.0,
      screenPos.y - baseHeight * zoom * 0.9,
    );
    ctx.lineTo(
      screenPos.x + side * w * 0.95,
      screenPos.y - baseHeight * zoom * 0.9 + 2 * zoom,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Horizontal gold bands (multiple levels)
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  for (let band = 0; band < tower.level; band++) {
    const bandY = screenPos.y - baseHeight * zoom * (0.25 + band * 0.25);
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.9, bandY + d * 0.35);
    ctx.lineTo(screenPos.x, bandY + d * 0.5);
    ctx.lineTo(screenPos.x + w * 0.9, bandY + d * 0.35);
    ctx.stroke();
  }

  const topY = screenPos.y - baseHeight * zoom;

  // ========== ROTATING GOLD GEARS ==========
  const gearRotation = time * 1.2;

  // Large main gear (gold production mechanism)
  drawGear(
    ctx,
    screenPos.x - w * 0.5,
    screenPos.y - h * 0.5,
    14 + tower.level * 2,
    9 + tower.level,
    10 + tower.level * 2,
    gearRotation,
    {
      outer: "#8b7355",
      inner: "#6b5335",
      teeth: "#a08060",
      highlight: "#c9a227",
    },
    zoom,
  );

  // Smaller meshing gear
  drawGear(
    ctx,
    screenPos.x - w * 0.2,
    screenPos.y - h * 0.65,
    10 + tower.level,
    6,
    8 + tower.level,
    -gearRotation * 1.4,
    {
      outer: "#7a6245",
      inner: "#5a4225",
      teeth: "#9a8260",
      highlight: "#c9a227",
    },
    zoom,
  );

  // Right side gear (all levels now)
  drawGear(
    ctx,
    screenPos.x + w * 0.45,
    screenPos.y - h * 0.45,
    12 + tower.level,
    8,
    9 + tower.level,
    gearRotation * 0.9,
    {
      outer: "#7a6245",
      inner: "#5a4225",
      teeth: "#9a8260",
      highlight: "#c9a227",
    },
    zoom,
  );

  // Level 2+ additional gear train
  if (tower.level >= 2) {
    drawGear(
      ctx,
      screenPos.x + w * 0.65,
      screenPos.y - h * 0.25,
      8,
      5,
      6,
      -gearRotation * 1.6,
      {
        outer: "#6a5235",
        inner: "#4a3215",
        teeth: "#8a7250",
        highlight: "#b8960b",
      },
      zoom,
    );
  }

  // ========== DIGITAL SCREENS THAT FLASH WHEN GENERATING ==========
  // Main digital display panel (left side)
  ctx.fillStyle = "#0a1510";
  ctx.fillRect(
    screenPos.x - w * 0.85,
    screenPos.y - h * 0.45,
    14 * zoom,
    18 * zoom,
  );
  ctx.strokeStyle = "#2a4a3a";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(
    screenPos.x - w * 0.85,
    screenPos.y - h * 0.45,
    14 * zoom,
    18 * zoom,
  );

  // Screen content with flash effect
  const screenFlash = flashIntensity > 0 ? flashIntensity : 0;
  const screenBaseGlow = 0.5 + Math.sin(time * 3) * 0.2;

  // Pawpoint counter display
  ctx.fillStyle = `rgba(0, 255, 100, ${screenBaseGlow + screenFlash * 0.5})`;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = 10 * zoom * flashIntensity;
  }
  ctx.font = `bold ${6 * zoom}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(
    "PAW",
    screenPos.x - w * 0.85 + 7 * zoom,
    screenPos.y - h * 0.42,
  );
  ctx.fillText(
    "PTS",
    screenPos.x - w * 0.85 + 7 * zoom,
    screenPos.y - h * 0.38,
  );
  ctx.shadowBlur = 0;

  // Animated data bars
  for (let i = 0; i < 4; i++) {
    const barY = screenPos.y - h * 0.35 + i * 3.5 * zoom;
    const barWidth =
      (5 + Math.sin(time * 6 + i * 1.5) * 3 + flashIntensity * 4) * zoom;
    const barGlow =
      screenBaseGlow +
      (flashIntensity > 0 && i === Math.floor(time * 10) % 4 ? 0.4 : 0);
    ctx.fillStyle = `rgba(255, 215, 0, ${barGlow})`;
    ctx.fillRect(screenPos.x - w * 0.83, barY, barWidth, 2 * zoom);
  }

  // Right side screen (level 2+)
  if (tower.level >= 2) {
    ctx.fillStyle = "#0a1510";
    ctx.fillRect(
      screenPos.x + w * 0.55,
      screenPos.y - h * 0.5,
      12 * zoom,
      16 * zoom,
    );
    ctx.strokeStyle = "#2a4a3a";
    ctx.strokeRect(
      screenPos.x + w * 0.55,
      screenPos.y - h * 0.5,
      12 * zoom,
      16 * zoom,
    );

    // Live graph display
    ctx.strokeStyle = `rgba(0, 255, 100, ${screenBaseGlow + screenFlash * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.57, screenPos.y - h * 0.4);
    for (let i = 0; i < 8; i++) {
      const graphX = screenPos.x + w * 0.57 + i * 1.2 * zoom;
      const graphY =
        screenPos.y - h * 0.42 - Math.sin(time * 4 + i * 0.8) * 3 * zoom;
      ctx.lineTo(graphX, graphY);
    }
    ctx.stroke();

    // Flash indicator when generating
    if (flashIntensity > 0) {
      ctx.fillStyle = `rgba(255, 215, 0, ${flashIntensity})`;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + w * 0.61,
        screenPos.y - h * 0.47,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Level 3 holographic projection screen
  if (tower.level >= 3) {
    // Holographic projector base
    ctx.fillStyle = "#3a4a3a";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.75,
      8 * zoom,
      4 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Holographic display field
    const holoGlow = 0.3 + Math.sin(time * 2) * 0.15 + flashIntensity * 0.3;
    ctx.fillStyle = `rgba(0, 255, 150, ${holoGlow * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 10 * zoom, screenPos.y - h * 0.75);
    ctx.lineTo(screenPos.x - 15 * zoom, screenPos.y - h * 0.95);
    ctx.lineTo(screenPos.x + 15 * zoom, screenPos.y - h * 0.95);
    ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - h * 0.75);
    ctx.closePath();
    ctx.fill();

    // Holographic data streams
    ctx.strokeStyle = `rgba(0, 255, 150, ${holoGlow})`;
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 5; i++) {
      const streamX = screenPos.x - 8 * zoom + i * 4 * zoom;
      const streamPhase = (time * 3 + i * 0.5) % 1;
      ctx.beginPath();
      ctx.moveTo(streamX, screenPos.y - h * 0.76);
      ctx.lineTo(
        streamX + (i - 2) * 1.5 * zoom,
        screenPos.y - h * 0.76 - streamPhase * 15 * zoom,
      );
      ctx.stroke();
    }
  }

  // ========== GOLD COIN CONVEYOR ==========
  if (tower.level >= 2) {
    // Conveyor frame
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.75, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + w * 0.15, screenPos.y - h * 0.28);
    ctx.stroke();

    // Conveyor track
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.7, screenPos.y + 4 * zoom);
    ctx.lineTo(screenPos.x + w * 0.1, screenPos.y - h * 0.3);
    ctx.stroke();

    // Conveyor rollers
    ctx.fillStyle = "#5a5a62";
    for (let r = 0; r < 4; r++) {
      const rollerPhase = r / 4;
      const rollerX = screenPos.x - w * 0.7 + w * 0.8 * rollerPhase;
      const rollerY = screenPos.y + 4 * zoom - (h * 0.3 + 4) * rollerPhase;
      ctx.beginPath();
      ctx.ellipse(rollerX, rollerY, 3 * zoom, 1.5 * zoom, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Animated gold coins on conveyor
    for (let c = 0; c < 4; c++) {
      const coinPhase = (time * 0.6 + c * 0.25) % 1;
      const coinX = screenPos.x - w * 0.7 + w * 0.8 * coinPhase;
      const coinY = screenPos.y + 4 * zoom - (h * 0.3 + 4) * coinPhase;

      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = (4 + flashIntensity * 4) * zoom;
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ========== GOLD STORAGE VAULT ==========
  // Vault frame
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - h * 0.25,
    10 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Vault door
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - h * 0.25,
    8 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Vault spokes (rotating faster when generating)
  const spokeSpeed = flashIntensity > 0 ? 2 : 0.5;
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 2 * zoom;
  for (let spoke = 0; spoke < 6; spoke++) {
    const spokeAngle = (spoke / 6) * Math.PI * 2 + time * spokeSpeed;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - h * 0.25);
    ctx.lineTo(
      screenPos.x + Math.cos(spokeAngle) * 6 * zoom,
      screenPos.y - h * 0.25 + Math.sin(spokeAngle) * 8 * zoom,
    );
    ctx.stroke();
  }

  // Vault center with enhanced flash effect
  const vaultGlow = 0.6 + Math.sin(time * 3) * 0.3 + flashIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 215, 0, ${vaultGlow})`;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = (8 + flashIntensity * 12) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - h * 0.25, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tech circuit lines with flash
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + flashIntensity * 0.3;
  ctx.strokeStyle = `rgba(0, 255, 100, ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY = screenPos.y - (h * i) / (tower.level + 2);
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.85, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.85, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // ========== MONEY TUBES (flowing gold particles) ==========
  drawEnergyTube(
    ctx,
    screenPos.x - w * 0.6,
    screenPos.y + 6 * zoom,
    screenPos.x - w * 0.4,
    screenPos.y - h * 0.7,
    2.5 + flashIntensity,
    time,
    zoom,
    "rgb(255, 215, 0)",
  );

  drawEnergyTube(
    ctx,
    screenPos.x + w * 0.5,
    screenPos.y + 2 * zoom,
    screenPos.x + w * 0.35,
    screenPos.y - h * 0.65,
    2.5 + flashIntensity,
    time + 0.4,
    zoom,
    "rgb(255, 200, 50)",
  );

  // Level 2+ additional tubes
  if (tower.level >= 2) {
    drawEnergyTube(
      ctx,
      screenPos.x - w * 0.3,
      screenPos.y + 4 * zoom,
      screenPos.x - w * 0.1,
      screenPos.y - h * 0.6,
      2,
      time + 0.2,
      zoom,
      "rgb(200, 255, 100)",
    );
  }

  // Glowing resource vents with flash effect
  for (let i = 0; i < tower.level + 1; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 10 * zoom;
    const ventGlow =
      0.5 + Math.sin(time * 4 + i * 0.5) * 0.3 + flashIntensity * 0.4;

    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = (6 + flashIntensity * 6) * zoom;
    ctx.fillStyle = `rgba(0, 255, 100, ${ventGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - w * 0.6,
      ventY + d * 0.2,
      4 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + w * 0.6,
      ventY + d * 0.2,
      4 * zoom,
      2 * zoom,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== TOP RAILING BACK HALF (behind roof/dome/chimney) ==========
  const topRailY = topY + 2 * zoom;
  const topRailRX = w * 0.88;
  const topRailRY = d * 0.88;
  const topRailH = 5 * zoom;
  const topRailSegs = 32;
  const topRailPosts = 16;

  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topRailY,
    topRailRX,
    topRailRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topRailY - topRailH,
    topRailRX,
    topRailRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < topRailPosts; bp++) {
    const pa = (bp / topRailPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * topRailRX;
    const py = topRailY + Math.sin(pa) * topRailRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - topRailH);
    ctx.stroke();
  }
  for (let i = 0; i < topRailSegs; i++) {
    const a0 = (i / topRailSegs) * Math.PI * 2;
    const a1 = ((i + 1) / topRailSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * topRailRX;
    const y0b = topRailY + Math.sin(a0) * topRailRY;
    const x1 = screenPos.x + Math.cos(a1) * topRailRX;
    const y1b = topRailY + Math.sin(a1) * topRailRY;
    ctx.fillStyle = `rgba(42, 90, 58, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - topRailH);
    ctx.lineTo(x0, y0b - topRailH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== ENHANCED ROOF WITH GOLD DOME ==========
  // Antenna array on roof (level 2+)
  if (tower.level >= 2) {
    ctx.strokeStyle = "#5a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    for (let ant = -1; ant <= 1; ant++) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x + ant * 12 * zoom, topY - 12 * zoom);
      ctx.lineTo(screenPos.x + ant * 15 * zoom, topY - 25 * zoom);
      ctx.stroke();
      // Antenna tips
      const antGlow =
        0.5 + Math.sin(time * 5 + ant * 2) * 0.3 + flashIntensity * 0.4;
      ctx.fillStyle = `rgba(255, 100, 100, ${antGlow})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + ant * 15 * zoom,
        topY - 26 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Base roof structure
  ctx.fillStyle = "#1a3a2a";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, topY - 18 * zoom);
  ctx.lineTo(screenPos.x - baseWidth * zoom * 0.45, topY + 2 * zoom);
  ctx.lineTo(screenPos.x, topY + baseWidth * zoom * 0.22);
  ctx.lineTo(screenPos.x + baseWidth * zoom * 0.45, topY + 2 * zoom);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2a4a3a";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, topY - 18 * zoom);
  ctx.lineTo(screenPos.x + baseWidth * zoom * 0.45, topY + 2 * zoom);
  ctx.lineTo(screenPos.x + baseWidth * zoom * 0.45, topY + 6 * zoom);
  ctx.lineTo(screenPos.x, topY + baseWidth * zoom * 0.22 + 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Roof tech patterns
  ctx.strokeStyle = "#0a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let tile = 0; tile < 6; tile++) {
    const tileY = topY - 14 * zoom + (tile / 6) * 16 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseWidth * 0.4 - tile * 2.5) * zoom, tileY);
    ctx.lineTo(screenPos.x, tileY + (tile * 2 * zoom) / 3);
    ctx.lineTo(screenPos.x + (baseWidth * 0.4 - tile * 2.5) * zoom, tileY);
    ctx.stroke();
  }

  // Gold dome with enhanced flash effect
  const domeGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    topY - 22 * zoom,
    0,
    screenPos.x,
    topY - 15 * zoom,
    14 * zoom,
  );
  domeGrad.addColorStop(0, flashIntensity > 0 ? "#ffffee" : "#fffadc");
  domeGrad.addColorStop(0.2, flashIntensity > 0 ? "#fff066" : "#ffe44d");
  domeGrad.addColorStop(0.5, "#c9a227");
  domeGrad.addColorStop(0.8, "#b8860b");
  domeGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = domeGrad;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 15 * zoom * flashIntensity;
  }
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 15 * zoom,
    12 * zoom,
    7 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dome highlight arc
  ctx.strokeStyle = "#ffe88a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 15 * zoom,
    10 * zoom,
    5 * zoom,
    0,
    Math.PI * 1.2,
    Math.PI * 1.8,
  );
  ctx.stroke();

  // Dome finial (gold spike on top)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, topY - 32 * zoom);
  ctx.lineTo(screenPos.x - 3 * zoom, topY - 20 * zoom);
  ctx.lineTo(screenPos.x + 3 * zoom, topY - 20 * zoom);
  ctx.closePath();
  ctx.fill();

  // Finial glow with flash
  const finialGlow = 0.6 + Math.sin(time * 4) * 0.3 + flashIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 215, 0, ${finialGlow})`;
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = (8 + flashIntensity * 10) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 32 * zoom, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ========== CHIMNEY WITH ANIMATED SMOKE ==========
  const chimneyX = screenPos.x + w * 0.3;
  const chimneyBaseY = topY - 5 * zoom;
  ctx.fillStyle = "#3a2a2a";
  ctx.fillRect(
    chimneyX - 3 * zoom,
    chimneyBaseY - 18 * zoom,
    6 * zoom,
    18 * zoom,
  );
  ctx.fillStyle = "#4a3a3a";
  ctx.fillRect(
    chimneyX - 4 * zoom,
    chimneyBaseY - 20 * zoom,
    8 * zoom,
    3 * zoom,
  );
  ctx.strokeStyle = "#2a1a1a";
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(
    chimneyX - 3 * zoom,
    chimneyBaseY - 18 * zoom,
    6 * zoom,
    18 * zoom,
  );
  for (let s = 0; s < 4; s++) {
    const smokeAge = (time * 0.8 + s * 0.25) % 1;
    const smokeY = chimneyBaseY - 20 * zoom - smokeAge * 25 * zoom;
    const smokeX =
      chimneyX + Math.sin(time * 2 + s * 1.7) * 4 * zoom * smokeAge;
    const smokeAlpha = (1 - smokeAge) * 0.35;
    const smokeSize = (2 + smokeAge * 5) * zoom;
    ctx.fillStyle = `rgba(180, 180, 190, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== WAVING CLUB BANNER ==========
  const flagPoleX = screenPos.x - w * 0.35;
  const flagPoleTopY = topY - 28 * zoom;
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(flagPoleX, topY - 2 * zoom);
  ctx.lineTo(flagPoleX, flagPoleTopY);
  ctx.stroke();
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.arc(flagPoleX, flagPoleTopY, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  const flagW = 14 * zoom;
  const flagH = 8 * zoom;
  const flagTopY2 = flagPoleTopY + 1 * zoom;
  ctx.fillStyle = "#2a5a3a";
  ctx.beginPath();
  ctx.moveTo(flagPoleX, flagTopY2);
  ctx.lineTo(
    flagPoleX + flagW + Math.sin(time * 3) * 2 * zoom,
    flagTopY2 + Math.sin(time * 2.5) * zoom,
  );
  ctx.lineTo(
    flagPoleX + flagW + Math.sin(time * 3 + 0.5) * 2.5 * zoom,
    flagTopY2 + flagH + Math.sin(time * 2.8) * zoom,
  );
  ctx.lineTo(flagPoleX, flagTopY2 + flagH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  const flagCenterX = flagPoleX + flagW * 0.45 + Math.sin(time * 3) * zoom;
  const flagCenterY = flagTopY2 + flagH * 0.5;
  ctx.fillStyle = `rgba(201, 162, 39, ${0.8 + Math.sin(time * 2) * 0.15})`;
  ctx.font = `bold ${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EC", flagCenterX, flagCenterY);

  // ========== STRING LIGHTS WITH WARM GLOW ==========
  const lightCount = 7;
  for (let li = 0; li < lightCount; li++) {
    const lt = li / (lightCount - 1);
    const lx = screenPos.x - w * 0.9 + lt * w * 1.8;
    const sag = Math.sin(lt * Math.PI) * 6 * zoom;
    const ly = screenPos.y - h * 0.05 + sag;
    const lightFlicker =
      0.5 + Math.sin(time * 5 + li * 1.3) * 0.2 + flashIntensity * 0.2;
    ctx.fillStyle = `rgba(255, 220, 100, ${lightFlicker})`;
    ctx.shadowColor = "rgba(255, 200, 60, 0.6)";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(lx, ly, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (li < lightCount - 1) {
      const nlx =
        screenPos.x - w * 0.9 + ((li + 1) / (lightCount - 1)) * w * 1.8;
      const nsag = Math.sin(((li + 1) / (lightCount - 1)) * Math.PI) * 6 * zoom;
      const nly = screenPos.y - h * 0.05 + nsag;
      ctx.strokeStyle = "rgba(80, 70, 50, 0.5)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(nlx, nly);
      ctx.stroke();
    }
  }

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    screenPos.x - w * 0.8,
    screenPos.y - h * 0.1,
    2.5,
    time,
    zoom,
    "#00ff66",
    4,
  );
  drawWarningLight(
    ctx,
    screenPos.x + w * 0.8,
    screenPos.y - h * 0.15,
    2.5,
    time + 0.5,
    zoom,
    "#c9a227",
    3,
  );

  // Level 2+ extra warning lights on scaffolding
  if (tower.level >= 2) {
    drawWarningLight(
      ctx,
      screenPos.x - w * 1.05,
      screenPos.y - h * 0.5,
      2,
      time + 0.25,
      zoom,
      "#ff6600",
      5,
    );
    drawWarningLight(
      ctx,
      screenPos.x + w * 1.0,
      screenPos.y - h * 0.4,
      2,
      time + 0.75,
      zoom,
      "#00ffff",
      4,
    );
  }

  // ========== HOLOGRAPHIC CREDIT DISPLAY ==========
  const coinY = topY - 35 * zoom + Math.sin(time * 3) * 4 * zoom;

  // Multiple rotating rings with flash
  for (let ring = 0; ring < 2 + tower.level; ring++) {
    const ringAlpha = 0.3 - ring * 0.06 + flashIntensity * 0.2;
    const ringSize = 16 + ring * 3;
    ctx.strokeStyle = `rgba(255, 215, 0, ${ringAlpha + Math.sin(time * 4 + ring) * 0.1})`;
    ctx.lineWidth = (2 + flashIntensity) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      coinY,
      ringSize * zoom,
      ringSize * 0.5 * zoom,
      time * 0.5 + ring * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Holographic credit symbol
  const coinRotation = time * 4;
  ctx.save();
  ctx.translate(screenPos.x, coinY);
  ctx.scale(Math.cos(coinRotation), 1);

  // Outer glow
  const creditGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14 * zoom);
  creditGrad.addColorStop(
    0,
    `rgba(255, 255, 200, ${0.9 + flashIntensity * 0.1})`,
  );
  creditGrad.addColorStop(
    0.3,
    `rgba(255, 215, 0, ${0.7 + flashIntensity * 0.2})`,
  );
  creditGrad.addColorStop(0.6, `rgba(218, 165, 32, 0.4)`);
  creditGrad.addColorStop(1, `rgba(184, 134, 11, 0)`);
  ctx.fillStyle = creditGrad;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = (20 + flashIntensity * 15) * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, 14 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Credit symbol
  ctx.fillStyle = "#4a3a1a";
  ctx.font = `bold ${16 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 0, 0);
  ctx.restore();

  // ========== OUTDOOR DINING AREA ==========
  const diningBaseY = screenPos.y + 10 * zoom;
  const diningX = screenPos.x + w * 0.9;
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    diningX,
    diningBaseY - 4 * zoom,
    5 * zoom,
    2.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(
    diningX - 0.8 * zoom,
    diningBaseY - 4 * zoom,
    1.6 * zoom,
    6 * zoom,
  );
  for (const cSide of [-1, 1]) {
    const chairX = diningX + cSide * 6 * zoom;
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(
      chairX - 1.5 * zoom,
      diningBaseY - 2 * zoom,
      3 * zoom,
      4 * zoom,
    );
    ctx.fillRect(
      chairX - 1.5 * zoom,
      diningBaseY - 5 * zoom,
      3 * zoom,
      1.5 * zoom,
    );
  }
  const plateGlow = 0.4 + Math.sin(time * 2) * 0.15;
  ctx.fillStyle = `rgba(255, 215, 0, ${plateGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    diningX,
    diningBaseY - 5 * zoom,
    2 * zoom,
    1 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ========== GOLD SHIMMER ON BUILDING ==========
  for (let sp = 0; sp < 6 + tower.level * 2; sp++) {
    const sparklePhase = (time * 1.5 + sp * 0.37) % 1;
    const sparkleAlpha =
      Math.sin(sparklePhase * Math.PI) * (0.4 + flashIntensity * 0.4);
    if (sparkleAlpha > 0.05) {
      const spX = screenPos.x + Math.sin(sp * 2.7) * w * 0.8;
      const spY = screenPos.y - (h * sp) / (6 + tower.level * 2);
      ctx.fillStyle = `rgba(255, 230, 120, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.moveTo(spX, spY - 2 * zoom);
      ctx.lineTo(spX + 1 * zoom, spY);
      ctx.lineTo(spX, spY + 2 * zoom);
      ctx.lineTo(spX - 1 * zoom, spY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ========== GOLD PARTICLE FOUNTAIN ==========
  const particleCount = tower.level + 3 + (flashIntensity > 0 ? 4 : 0);
  for (let i = 0; i < particleCount; i++) {
    const pPhase = (time * 2.5 + i * 0.2) % 1;
    const pY = coinY + 8 * zoom - pPhase * h * 0.5;
    const pX = screenPos.x + Math.sin(time * 4 + i * 2.2) * 10 * zoom;
    const pAlpha = Math.sin(pPhase * Math.PI) * (0.7 + flashIntensity * 0.3);
    const pSize = 2 + Math.sin(time * 6 + i) * 1 + flashIntensity;

    ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha})`;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = (4 + flashIntensity * 4) * zoom;
    ctx.beginPath();
    ctx.arc(pX, pY, pSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== KA-CHING GENERATION EFFECTS ==========
  if (flashIntensity > 0) {
    // Dramatic expanding gold burst ring
    const burstRadius = (1 - flashIntensity) * 40 * zoom;
    const burstAlpha = flashIntensity * 0.7;
    ctx.strokeStyle = `rgba(255, 215, 0, ${burstAlpha})`;
    ctx.lineWidth = (3 + flashIntensity * 2) * zoom;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 12 * zoom * flashIntensity;
    ctx.beginPath();
    ctx.arc(screenPos.x, topY - 15 * zoom, burstRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Second inner ring
    const innerBurst = (1 - flashIntensity) * 25 * zoom;
    ctx.strokeStyle = `rgba(255, 240, 150, ${burstAlpha * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, topY - 15 * zoom, innerBurst, 0, Math.PI * 2);
    ctx.stroke();

    // Flying coins shooting outward
    for (let fc = 0; fc < 8; fc++) {
      const coinAngle = (fc / 8) * Math.PI * 2 + time * 2;
      const coinDist = (1 - flashIntensity) * 35 * zoom;
      const fcX = screenPos.x + Math.cos(coinAngle) * coinDist;
      const fcY =
        topY -
        15 * zoom +
        Math.sin(coinAngle) * coinDist * 0.5 -
        (1 - flashIntensity) * 15 * zoom;
      const fcAlpha = flashIntensity * 0.8;
      const fcSize = (2 + flashIntensity * 2) * zoom;
      ctx.fillStyle = `rgba(255, 215, 0, ${fcAlpha})`;
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 6 * zoom * flashIntensity;
      ctx.beginPath();
      ctx.ellipse(fcX, fcY, fcSize, fcSize * 0.6, coinAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ka-ching "$" text floating up
    const kachingY = topY - 40 * zoom - (1 - flashIntensity) * 20 * zoom;
    ctx.fillStyle = `rgba(255, 230, 100, ${flashIntensity})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8 * zoom * flashIntensity;
    ctx.font = `bold ${(10 + flashIntensity * 6) * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+$", screenPos.x, kachingY);
    ctx.shadowBlur = 0;

    // Treasury pulse glow on building
    ctx.fillStyle = `rgba(255, 200, 50, ${flashIntensity * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.3,
      w * 0.9,
      h * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ========== TOP RAILING FRONT HALF (in front of roof/dome/chimney/effects) ==========
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topRailY, topRailRX, topRailRY, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topRailY - topRailH,
    topRailRX,
    topRailRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < topRailPosts; bp++) {
    const pa = (bp / topRailPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * topRailRX;
    const py = topRailY + Math.sin(pa) * topRailRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - topRailH);
    ctx.stroke();
  }
  for (let i = 0; i < topRailSegs; i++) {
    const a0 = (i / topRailSegs) * Math.PI * 2;
    const a1 = ((i + 1) / topRailSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * topRailRX;
    const y0b = topRailY + Math.sin(a0) * topRailRY;
    const x1 = screenPos.x + Math.cos(a1) * topRailRX;
    const y1b = topRailY + Math.sin(a1) * topRailRY;
    ctx.fillStyle = `rgba(42, 90, 58, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - topRailH);
    ctx.lineTo(x0, y0b - topRailH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== LEVEL 2 UNIQUE FEATURES ==========
  if (tower.level >= 2) {
    // Data banks on sides
    for (const side of [-1, 1]) {
      const bankX = screenPos.x + side * w * 0.75;
      const bankY = screenPos.y - h * 0.15;

      // Data bank housing
      ctx.fillStyle = "#2a3a2a";
      ctx.fillRect(bankX - 4 * zoom, bankY - 12 * zoom, 8 * zoom, 14 * zoom);
      ctx.strokeStyle = "#4a5a4a";
      ctx.lineWidth = 1 * zoom;
      ctx.strokeRect(bankX - 4 * zoom, bankY - 12 * zoom, 8 * zoom, 14 * zoom);

      // Blinking data lights
      for (let light = 0; light < 4; light++) {
        const lightY = bankY - 10 * zoom + light * 3 * zoom;
        const lightOn = Math.sin(time * 8 + light * 1.5 + side * 3) > 0;
        ctx.fillStyle = lightOn
          ? `rgba(0, 255, 100, 0.8)`
          : `rgba(0, 50, 20, 0.5)`;
        ctx.beginPath();
        ctx.arc(bankX, lightY, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Quantum processing unit (level 2)
    ctx.fillStyle = "#1a2a2a";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.85,
      6 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const quantumGlow = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(100, 200, 255, ${quantumGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.85,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ========== LEVEL 3+ UPGRADE VISUALS ==========
  if (tower.level >= 3) {
    // Floating energy field around dome
    const fieldRotation = time * 0.8;
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.3 + Math.sin(time * 2) * 0.15})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        topY - 20 * zoom,
        (18 + ring * 5) * zoom,
        (9 + ring * 2.5) * zoom,
        fieldRotation + ring * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    if (tower.upgrade === "A") {
      // Investment Fund - holographic stock chart
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * zoom, topY - 42 * zoom);
      ctx.lineTo(screenPos.x - 10 * zoom, topY - 58 * zoom);
      ctx.lineTo(screenPos.x + 2 * zoom, topY - 50 * zoom);
      ctx.lineTo(screenPos.x + 22 * zoom, topY - 70 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrow head
      ctx.fillStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 22 * zoom, topY - 70 * zoom);
      ctx.lineTo(screenPos.x + 15 * zoom, topY - 66 * zoom);
      ctx.lineTo(screenPos.x + 17 * zoom, topY - 60 * zoom);
      ctx.closePath();
      ctx.fill();

      // Glowing data points
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 8 * zoom;
      ctx.fillStyle = `rgba(0, 255, 100, 0.9)`;
      const points = [
        { x: -10, y: -58 },
        { x: 2, y: -50 },
        { x: 14, y: -62 },
      ];
      for (const pt of points) {
        ctx.beginPath();
        ctx.arc(
          screenPos.x + pt.x * zoom,
          topY + pt.y * zoom,
          3 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else if (tower.upgrade === "B") {
      // Recruitment Center - personnel holograms
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(
        screenPos.x - 24 * zoom,
        topY - 52 * zoom,
        18 * zoom,
        18 * zoom,
      );
      ctx.strokeStyle = "#2a4a3a";
      ctx.strokeRect(
        screenPos.x - 24 * zoom,
        topY - 52 * zoom,
        18 * zoom,
        18 * zoom,
      );

      // Multiple personnel icons
      for (let p = 0; p < 2; p++) {
        const personX = screenPos.x - 19 * zoom + p * 10 * zoom;
        const personGlow = 0.6 + Math.sin(time * 3 + p * 1.5) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 100, ${personGlow})`;
        ctx.beginPath();
        ctx.arc(personX, topY - 44 * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(personX - 3 * zoom, topY - 40 * zoom, 6 * zoom, 5 * zoom);
      }

      // Status bars
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(
        screenPos.x + 6 * zoom,
        topY - 54 * zoom,
        18 * zoom,
        20 * zoom,
      );
      ctx.strokeStyle = "#2a4a3a";
      ctx.strokeRect(
        screenPos.x + 6 * zoom,
        topY - 54 * zoom,
        18 * zoom,
        20 * zoom,
      );

      const bars = [
        { label: "STAFF", value: 0.5 + Math.sin(time * 2) * 0.3 },
        { label: "MORALE", value: 0.7 + Math.sin(time * 2.5) * 0.2 },
        { label: "OUTPUT", value: 0.6 + Math.sin(time * 3) * 0.25 },
      ];
      for (let i = 0; i < bars.length; i++) {
        const barY = topY - 52 * zoom + i * 6 * zoom;
        ctx.fillStyle = "#00ff66";
        ctx.fillRect(
          screenPos.x + 8 * zoom,
          barY,
          14 * zoom * bars[i].value,
          4 * zoom,
        );
      }
    }
  }

  ctx.restore();
}

// STATION TOWER - Sci-Fi Princeton Dinky Transport Hub
function renderStationTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  // Shift the entire building up slightly
  screenPos = { x: screenPos.x, y: screenPos.y - 10 * zoom };

  // Base dimensions - scaled by level
  const baseW = 56 + tower.level * 6;
  const baseD = 44 + tower.level * 5;

  // Isometric conversion factors
  const isoW = baseW * zoom * 0.5;
  const isoD = baseD * zoom * 0.25;

  // ========== FOUNDATION (proper isometric diamond aligned with grid) ==========
  // Helper function for isometric diamond
  const drawIsoDiamond = (
    cx: number,
    cy: number,
    w: number,
    d: number,
    h: number,
    topColor: string,
    leftColor: string,
    rightColor: string,
  ) => {
    const hw = w * zoom * 0.5;
    const hd = d * zoom * 0.25;
    const hh = h * zoom;

    // Top face (diamond)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh - hd); // Top
    ctx.lineTo(cx + hw, cy - hh); // Right
    ctx.lineTo(cx, cy - hh + hd); // Bottom
    ctx.lineTo(cx - hw, cy - hh); // Left
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left face
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy - hh); // Top-left
    ctx.lineTo(cx, cy - hh + hd); // Top-right
    ctx.lineTo(cx, cy + hd); // Bottom-right
    ctx.lineTo(cx - hw, cy); // Bottom-left
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx + hw, cy - hh); // Top-right
    ctx.lineTo(cx + hw, cy); // Bottom-right
    ctx.lineTo(cx, cy + hd); // Bottom
    ctx.lineTo(cx, cy - hh + hd); // Top
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // ========== LEVEL-SPECIFIC THEMED BASE ==========
  if (tower.level === 1) {
    // BARRACKS BASE - Wooden military camp platform with detailed texturing

    // Bottom dirt/stone foundation layer (thick, matching L2/L3 pattern)
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 22,
      baseD + 34,
      12,
      "#4a3a2a",
      "#3a2a1a",
      "#2a1a0a",
    );

    // Heavy iron bands on bottom foundation
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 22) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 22) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 22) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 22) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Foundation corner bolts
    ctx.fillStyle = "#6a5a4a";
    const l1FoundCorners = [
      {
        x: screenPos.x - (baseW + 22) * zoom * 0.45,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x + (baseW + 22) * zoom * 0.45,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 34) * zoom * 0.22 + 12 * zoom,
      },
    ];
    for (const bolt of l1FoundCorners) {
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a5a4a";
    }

    // Middle wooden plank platform (thick mid-tier)
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 12,
      baseD + 22,
      8,
      "#6b5030",
      "#5a4020",
      "#4a3010",
    );

    // Edge highlight on middle tier
    ctx.strokeStyle = "#7a6040";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 12) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 22) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 12) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Wooden planks texture on left face (horizontal boards)
    ctx.strokeStyle = "#4a3010";
    ctx.lineWidth = 0.8 * zoom;
    const midHw = (baseW + 12) * zoom * 0.5;
    const midHd = (baseD + 22) * zoom * 0.25;
    const midHh = 8 * zoom;
    const midCy = screenPos.y + 8 * zoom;
    const plankMargin = 2 * zoom;

    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const leftEdgeY = midCy - midHh + t * midHh;
      const startX = screenPos.x - midHw + plankMargin;
      const endX = screenPos.x - plankMargin;
      ctx.beginPath();
      ctx.moveTo(startX, leftEdgeY + plankMargin * midHd / midHw);
      ctx.lineTo(endX, leftEdgeY + (midHw - plankMargin) * midHd / midHw);
      ctx.stroke();
    }

    // Wooden planks texture on right face
    ctx.strokeStyle = "#2a1a05";
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const rLeftEdgeY = midCy - midHh + midHd + t * midHh;
      const startX = screenPos.x + plankMargin;
      const endX = screenPos.x + midHw - plankMargin;
      ctx.beginPath();
      ctx.moveTo(startX, rLeftEdgeY - plankMargin * midHd / midHw);
      ctx.lineTo(endX, rLeftEdgeY - (midHw - plankMargin) * midHd / midHw);
      ctx.stroke();
    }

    // Metal corner brackets on wooden platform
    ctx.fillStyle = "#7a6a5a";
    const bracketPositions = [
      {
        x: screenPos.x - (baseW + 10) * zoom * 0.48,
        y: screenPos.y + 2 * zoom,
      },
      {
        x: screenPos.x + (baseW + 10) * zoom * 0.48,
        y: screenPos.y + 2 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 18) * zoom * 0.23 + 2 * zoom,
      },
    ];
    for (const bracket of bracketPositions) {
      ctx.beginPath();
      ctx.moveTo(bracket.x, bracket.y);
      ctx.lineTo(bracket.x - 3 * zoom, bracket.y + 4 * zoom);
      ctx.lineTo(bracket.x + 3 * zoom, bracket.y + 4 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // Nails/bolts on brackets
    ctx.fillStyle = "#4a3a2a";
    for (const bracket of bracketPositions) {
      ctx.beginPath();
      ctx.arc(bracket.x, bracket.y + 2 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top wooden deck (thicker, matching L2/L3 tier pattern)
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 4,
      baseD + 12,
      6,
      "#8b7355",
      "#7a6244",
      "#695133",
    );

    // Deck plank lines (proper isometric direction)
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 2) * zoom * 0.4 + i * 4 * zoom,
        screenPos.y - 4 * zoom - i * 2 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 4 * zoom,
        screenPos.y + (baseD + 8) * zoom * 0.2 - 4 * zoom - i * 2 * zoom,
      );
      ctx.stroke();
    }

    // Deck edge trim
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 2) * zoom * 0.5, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 8) * zoom * 0.25 - 4 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 2) * zoom * 0.5, screenPos.y - 4 * zoom);
    ctx.stroke();

    // Corner posts
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      screenPos.x - (baseW + 2) * zoom * 0.48 - 2 * zoom,
      screenPos.y - 8 * zoom,
      4 * zoom,
      8 * zoom,
    );
    ctx.fillRect(
      screenPos.x + (baseW + 2) * zoom * 0.48 - 2 * zoom,
      screenPos.y - 8 * zoom,
      4 * zoom,
      8 * zoom,
    );

    // Corner post caps
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.arc(
      screenPos.x - (baseW + 2) * zoom * 0.48,
      screenPos.y - 8 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenPos.x + (baseW + 2) * zoom * 0.48,
      screenPos.y - 8 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Small weapon rack (left side)
    const rackX = screenPos.x - isoW * 0.6 - 12 * zoom;
    const rackY = screenPos.y + 22 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(rackX - 2 * zoom, rackY - 12 * zoom, 4 * zoom, 12 * zoom);
    ctx.fillRect(rackX - 4 * zoom, rackY - 12 * zoom, 8 * zoom, 2 * zoom);
    // Spears on rack
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rackX - 2 * zoom, rackY - 10 * zoom);
    ctx.lineTo(rackX - 2 * zoom, rackY - 20 * zoom);
    ctx.moveTo(rackX + 2 * zoom, rackY - 10 * zoom);
    ctx.lineTo(rackX + 2 * zoom, rackY - 20 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#aaaaaa";
    ctx.beginPath();
    ctx.moveTo(rackX - 2 * zoom, rackY - 22 * zoom);
    ctx.lineTo(rackX - 3.5 * zoom, rackY - 19 * zoom);
    ctx.lineTo(rackX - 0.5 * zoom, rackY - 19 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rackX + 2 * zoom, rackY - 22 * zoom);
    ctx.lineTo(rackX + 0.5 * zoom, rackY - 19 * zoom);
    ctx.lineTo(rackX + 3.5 * zoom, rackY - 19 * zoom);
    ctx.closePath();
    ctx.fill();

    // Supply crate (right side)
    const crateX = screenPos.x + isoW * 0.5;
    const crateY = screenPos.y + 2 * zoom;
    drawIsometricPrism(
      ctx,
      crateX,
      crateY,
      8,
      7,
      6,
      { top: "#7a6040", left: "#5a4020", right: "#4a3010" },
      zoom,
    );
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(crateX - 3 * zoom, crateY - 8 * zoom, 6 * zoom, 4 * zoom);

    // Barrel
    ctx.fillStyle = "#6b5030";
    ctx.beginPath();
    ctx.ellipse(
      crateX + 8 * zoom,
      crateY - 2 * zoom,
      3 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(crateX + 5 * zoom, crateY - 8 * zoom, 6 * zoom, 6 * zoom);

    // === LEVEL 1 ENHANCEMENTS: Training Equipment & Lived-in Details ===

    // Hanging shields on wall
    const shieldWallX = screenPos.x - isoW * 0.3;
    const shieldWallY = screenPos.y - 8 * zoom;
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.moveTo(shieldWallX - 4 * zoom, shieldWallY - 6 * zoom);
    ctx.lineTo(shieldWallX - 6 * zoom, shieldWallY);
    ctx.lineTo(shieldWallX - 4 * zoom, shieldWallY + 4 * zoom);
    ctx.lineTo(shieldWallX - 2 * zoom, shieldWallY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a2a0a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Sandbags for defense training
    ctx.fillStyle = "#9b8b7b";
    for (let sb = 0; sb < 3; sb++) {
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + isoW * 0.2 + sb * 4 * zoom,
        screenPos.y + 10 * zoom - sb * 2 * zoom,
        4 * zoom,
        2 * zoom,
        0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Campfire with animated flames
    const fireX = screenPos.x - isoW * 0.8;
    const fireY = screenPos.y + 8 * zoom;
    // Fire pit stones
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.ellipse(fireX, fireY, 5 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Logs
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(fireX - 3 * zoom, fireY - 1 * zoom, 6 * zoom, 2 * zoom);
    // Animated fire
    const fireFlicker = 0.6 + Math.sin(time * 8) * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${fireFlicker})`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(fireX - 2 * zoom, fireY - 2 * zoom);
    ctx.quadraticCurveTo(
      fireX,
      fireY - 8 * zoom - Math.sin(time * 10) * 2,
      fireX + 2 * zoom,
      fireY - 2 * zoom,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 100, ${fireFlicker * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(fireX - 1 * zoom, fireY - 2 * zoom);
    ctx.quadraticCurveTo(
      fireX,
      fireY - 5 * zoom - Math.sin(time * 12) * 1.5,
      fireX + 1 * zoom,
      fireY - 2 * zoom,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (tower.level === 2) {
    // GARRISON BASE - Stone military platform with detailed masonry

    // Foundation stone - heavy base
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 17 * zoom,
      baseW + 20,
      baseD + 34,
      10,
      "#4a4a52",
      "#3a3a42",
      "#2a2a32",
    );

    // Metal reinforcement bands on foundation
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 20) * zoom * 0.5,
      screenPos.y + 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 12 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 20) * zoom * 0.5,
      screenPos.y + 12 * zoom,
    );
    ctx.stroke();

    // Foundation corner reinforcements
    ctx.fillStyle = "#6a6a72";
    const foundCorners = [
      {
        x: screenPos.x - (baseW + 20) * zoom * 0.48,
        y: screenPos.y + 9 * zoom,
      },
      {
        x: screenPos.x + (baseW + 20) * zoom * 0.48,
        y: screenPos.y + 9 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 34) * zoom * 0.24 + 9 * zoom,
      },
    ];
    for (const corner of foundCorners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Inner bolt
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a6a72";
    }

    // Cobblestone layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 7 * zoom,
      baseW + 12,
      baseD + 24,
      7,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42",
    );

    // Layer edge highlight
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 12) * zoom * 0.5, screenPos.y + zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 24) * zoom * 0.25 + zoom);
    ctx.lineTo(screenPos.x + (baseW + 12) * zoom * 0.5, screenPos.y + zoom);
    ctx.stroke();

    // Top stone platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 4,
      baseD + 14,
      5,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52",
    );

    // Top platform flagstone pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = -2; i <= 2; i++) {
      // Diagonal lines one direction
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 4) * zoom * 0.4 + i * 6 * zoom,
        screenPos.y - 5 * zoom - i * 3 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 6 * zoom,
        screenPos.y + (baseD + 14) * zoom * 0.15 - 5 * zoom - i * 3 * zoom,
      );
      ctx.stroke();
      // Diagonal lines other direction
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 4) * zoom * 0.4 + i * 6 * zoom,
        screenPos.y - 5 * zoom + i * 3 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 6 * zoom,
        screenPos.y + (baseD + 14) * zoom * 0.15 - 5 * zoom + i * 3 * zoom,
      );
      ctx.stroke();
    }

    // Platform edge trim with beveled look
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 4) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 14) * zoom * 0.25 - 5 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 4) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Decorative corner pillars
    ctx.fillStyle = "#5a5a62";
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 4) * zoom * 0.45,
      screenPos.y - 2 * zoom,
      4,
      4,
      8,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 4) * zoom * 0.45,
      screenPos.y - 2 * zoom,
      4,
      4,
      8,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Pillar caps
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 4) * zoom * 0.45,
      screenPos.y - 10 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 4) * zoom * 0.45,
      screenPos.y - 10 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Armor stand (left)
    const armorX = screenPos.x - isoW * 0.6;
    const armorY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(armorX - 1.5 * zoom, armorY - 14 * zoom, 3 * zoom, 14 * zoom);
    // Armor body
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.moveTo(armorX, armorY - 18 * zoom);
    ctx.lineTo(armorX - 5 * zoom, armorY - 12 * zoom);
    ctx.lineTo(armorX - 4 * zoom, armorY - 6 * zoom);
    ctx.lineTo(armorX + 4 * zoom, armorY - 6 * zoom);
    ctx.lineTo(armorX + 5 * zoom, armorY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Helmet
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(armorX, armorY - 20 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Orange plume
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.ellipse(
      armorX,
      armorY - 24 * zoom,
      1.5 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Shield rack (right)
    const shieldX = screenPos.x + isoW * 0.5;
    const shieldY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(shieldX - 2 * zoom, shieldY - 10 * zoom, 4 * zoom, 10 * zoom);
    // Shields
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(shieldX - 6 * zoom, shieldY - 16 * zoom);
    ctx.lineTo(shieldX - 10 * zoom, shieldY - 10 * zoom);
    ctx.lineTo(shieldX - 6 * zoom, shieldY - 4 * zoom);
    ctx.lineTo(shieldX - 2 * zoom, shieldY - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Supply crates
    drawIsometricPrism(
      ctx,
      shieldX + 8 * zoom,
      shieldY,
      7,
      6,
      5,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // === LEVEL 2 ENHANCEMENTS: Military Outpost Details ===

    // Defensive sandbag wall
    ctx.fillStyle = "#8a7a6a";
    for (let row = 0; row < 2; row++) {
      for (let sb = 0; sb < 4; sb++) {
        const sbX = screenPos.x + isoW * 0.4 + sb * 5 * zoom - row * 2 * zoom;
        const sbY = screenPos.y + 12 * zoom - row * 3 * zoom;
        ctx.beginPath();
        ctx.ellipse(sbX, sbY, 4 * zoom, 2 * zoom, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mounted crossbow on wall
    const crossbowX = screenPos.x - isoW * 0.7;
    const crossbowY = screenPos.y - 2 * zoom;
    // Mount
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(
      crossbowX - 2 * zoom,
      crossbowY - 8 * zoom,
      4 * zoom,
      8 * zoom,
    );
    // Crossbow body
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(
      crossbowX - 1 * zoom,
      crossbowY - 14 * zoom,
      2 * zoom,
      6 * zoom,
    );
    // Crossbow arms
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossbowX - 6 * zoom, crossbowY - 12 * zoom);
    ctx.lineTo(crossbowX, crossbowY - 14 * zoom);
    ctx.lineTo(crossbowX + 6 * zoom, crossbowY - 12 * zoom);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossbowX - 5 * zoom, crossbowY - 12 * zoom);
    ctx.lineTo(crossbowX + 5 * zoom, crossbowY - 12 * zoom);
    ctx.stroke();

    // Weapon barrels
    const barrelX = screenPos.x + isoW * 0.8;
    const barrelY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(barrelX, barrelY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.ellipse(
      barrelX,
      barrelY - 8 * zoom,
      3.5 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Barrel bands
    ctx.strokeStyle = "#7a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      barrelX,
      barrelY - 2 * zoom,
      3.8 * zoom,
      2.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      barrelX,
      barrelY - 6 * zoom,
      3.6 * zoom,
      2.1 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    // Swords sticking out of barrel
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(barrelX - 1 * zoom, barrelY - 8 * zoom);
    ctx.lineTo(barrelX - 2 * zoom, barrelY - 18 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(barrelX + 1 * zoom, barrelY - 8 * zoom);
    ctx.lineTo(barrelX + 2 * zoom, barrelY - 16 * zoom);
    ctx.stroke();
    // Sword hilts
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(barrelX - 4 * zoom, barrelY - 19 * zoom, 4 * zoom, 1.5 * zoom);
    ctx.fillRect(barrelX, barrelY - 17 * zoom, 4 * zoom, 1.5 * zoom);

    // Torch bracket on wall
    const torchX = screenPos.x + isoW * 0.3;
    const torchY = screenPos.y - 12 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(torchX - 1 * zoom, torchY, 2 * zoom, 8 * zoom);
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(torchX - 1.5 * zoom, torchY - 8 * zoom, 3 * zoom, 8 * zoom);
    // Torch flame
    const torchFlame = 0.6 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(255, 180, 60, ${torchFlame})`;
    ctx.shadowColor = "#ff8800";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX - 2 * zoom, torchY - 8 * zoom);
    ctx.quadraticCurveTo(
      torchX,
      torchY - 14 * zoom - Math.sin(time * 12) * 2,
      torchX + 2 * zoom,
      torchY - 8 * zoom,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Armor rack near entrance
    const armorRackX = screenPos.x - isoW * 0.3;
    const armorRackY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(
      armorRackX - 8 * zoom,
      armorRackY - 2 * zoom,
      16 * zoom,
      2 * zoom,
    );
    // Hanging chainmail
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(armorRackX - 4 * zoom, armorRackY - 2 * zoom);
    ctx.lineTo(armorRackX - 6 * zoom, armorRackY - 12 * zoom);
    ctx.lineTo(armorRackX - 2 * zoom, armorRackY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Helmet on rack
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(
      armorRackX + 4 * zoom,
      armorRackY - 6 * zoom,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.ellipse(
      armorRackX + 4 * zoom,
      armorRackY - 10 * zoom,
      1 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else if (tower.level === 3) {
    // FORTRESS BASE - Heavy stone fortress platform with imposing masonry

    // Deep foundation - massive stone base
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 24,
      baseD + 38,
      12,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22",
    );

    // Heavy iron bands around foundation
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 24) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 38) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 24) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 24) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 38) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 24) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Foundation anchor bolts
    ctx.fillStyle = "#5a5a62";
    const anchorPositions = [
      {
        x: screenPos.x - (baseW + 24) * zoom * 0.45,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x - (baseW + 24) * zoom * 0.25,
        y: screenPos.y + 15 * zoom,
      },
      {
        x: screenPos.x + (baseW + 24) * zoom * 0.25,
        y: screenPos.y + 15 * zoom,
      },
      {
        x: screenPos.x + (baseW + 24) * zoom * 0.45,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 38) * zoom * 0.22 + 12 * zoom,
      },
    ];
    for (const anchor of anchorPositions) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }

    // Stone wall layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 14,
      baseD + 25,
      8,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42",
    );

    // Wall edge molding
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 14) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 25) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 14) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Top fortress platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 6,
      baseD + 16,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52",
    );

    // Fortress platform paving pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.8 * zoom;
    // Cross-hatch pattern
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 6) * zoom * 0.35 + i * 5 * zoom,
        screenPos.y - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y + (baseD + 16) * zoom * 0.18 - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 6) * zoom * 0.35 + i * 5 * zoom,
        screenPos.y - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y + (baseD + 16) * zoom * 0.18 - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // Platform decorative border
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.5, screenPos.y - 6 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 16) * zoom * 0.25 - 6 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.5, screenPos.y - 6 * zoom);
    ctx.stroke();

    // Inset glow trim on platform edge
    const platformGlow = 0.3 + Math.sin(time * 2) * 0.15;
    ctx.strokeStyle = `rgba(255, 108, 0, ${platformGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.48, screenPos.y - 5 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 16) * zoom * 0.23 - 5 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.48, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Mini battlements on corners - now with more detail
    for (const side of [-1, 1]) {
      drawIsometricPrism(
        ctx,
        screenPos.x + side * isoW * 0.7,
        screenPos.y + side * 2 * zoom,
        6,
        5,
        8,
        { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
        zoom,
      );
      // Battlement arrow slit
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        screenPos.x + side * isoW * 0.7 - 1 * zoom,
        screenPos.y + side * 2 * zoom - 6 * zoom,
        2 * zoom,
        4 * zoom,
      );
    }

    // Fortress corner towers (small)
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 6) * zoom * 0.48,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 6) * zoom * 0.48,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Tower caps
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 6) * zoom * 0.48,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 6) * zoom * 0.48 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 6) * zoom * 0.48,
      screenPos.y - 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 6) * zoom * 0.48 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + (baseW + 6) * zoom * 0.48,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 6) * zoom * 0.48 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 6) * zoom * 0.48,
      screenPos.y - 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 6) * zoom * 0.48 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Catapult/Ballista (left side)
    const siegeX = screenPos.x - isoW * 0.55;
    const siegeY = screenPos.y + 6 * zoom;
    // Base frame
    ctx.fillStyle = "#4a3a2a";
    drawIsometricPrism(
      ctx,
      siegeX,
      siegeY,
      10,
      8,
      4,
      { top: "#5a4a3a", left: "#4a3a2a", right: "#3a2a1a" },
      zoom,
    );
    // Arm
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(siegeX, siegeY - 4 * zoom);
    ctx.lineTo(siegeX - 4 * zoom, siegeY - 14 * zoom);
    ctx.stroke();
    // Counterweight
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(siegeX + 3 * zoom, siegeY - 6 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Weapon rack with heavy weapons
    const hwX = screenPos.x + isoW * 0.5;
    const hwY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(hwX - 2 * zoom, hwY - 16 * zoom, 4 * zoom, 16 * zoom);
    // Halberds
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(hwX - 4 * zoom, hwY - 14 * zoom);
    ctx.lineTo(hwX - 4 * zoom, hwY - 26 * zoom);
    ctx.moveTo(hwX + 4 * zoom, hwY - 14 * zoom);
    ctx.lineTo(hwX + 4 * zoom, hwY - 26 * zoom);
    ctx.stroke();
    // Axe heads
    ctx.fillStyle = "#8a8a92";
    for (const ox of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(hwX + ox * zoom, hwY - 26 * zoom);
      ctx.lineTo(hwX + ox * zoom - 3 * zoom, hwY - 22 * zoom);
      ctx.lineTo(hwX + ox * zoom + 3 * zoom, hwY - 22 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === LEVEL 3 ENHANCEMENTS: Heavy Fortress Details ===

    // Heavy armor plating on foundation
    ctx.fillStyle = "#5a5a62";
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 1.5 * zoom;
    for (let plate = 0; plate < 3; plate++) {
      const plateX = screenPos.x - isoW * 0.5 + plate * isoW * 0.5;
      const plateY = screenPos.y + 16 * zoom - plate * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(plateX - 6 * zoom, plateY);
      ctx.lineTo(plateX - 4 * zoom, plateY - 6 * zoom);
      ctx.lineTo(plateX + 4 * zoom, plateY - 4 * zoom);
      ctx.lineTo(plateX + 6 * zoom, plateY + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Rivets on plate
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(plateX - 2 * zoom, plateY - 2 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.arc(plateX + 2 * zoom, plateY - 1 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }

    // Defensive spikes around foundation
    ctx.fillStyle = "#4a4a52";
    for (let spike = 0; spike < 5; spike++) {
      const spikeX = screenPos.x - isoW * 0.8 + spike * 8 * zoom;
      const spikeY = screenPos.y + 18 * zoom - spike * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(spikeX, spikeY - 10 * zoom);
      ctx.lineTo(spikeX - 2 * zoom, spikeY);
      ctx.lineTo(spikeX + 2 * zoom, spikeY);
      ctx.closePath();
      ctx.fill();
    }

    // Mounted ballista on platform
    const ballistaX = screenPos.x - isoW * 0.65;
    const ballistaY = screenPos.y + 2 * zoom;
    // Ballista base
    ctx.fillStyle = "#4a3a2a";
    drawIsometricPrism(
      ctx,
      ballistaX,
      ballistaY,
      8,
      6,
      4,
      { top: "#5a4a3a", left: "#4a3a2a", right: "#3a2a1a" },
      zoom,
    );
    // Ballista frame
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(ballistaX - 3 * zoom, ballistaY - 4 * zoom);
    ctx.lineTo(ballistaX, ballistaY - 16 * zoom);
    ctx.lineTo(ballistaX + 3 * zoom, ballistaY - 4 * zoom);
    ctx.closePath();
    ctx.fill();
    // Ballista arms (bow)
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ballistaX - 8 * zoom, ballistaY - 10 * zoom);
    ctx.quadraticCurveTo(
      ballistaX,
      ballistaY - 14 * zoom,
      ballistaX + 8 * zoom,
      ballistaY - 10 * zoom,
    );
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(ballistaX - 7 * zoom, ballistaY - 10 * zoom);
    ctx.lineTo(ballistaX, ballistaY - 8 * zoom);
    ctx.lineTo(ballistaX + 7 * zoom, ballistaY - 10 * zoom);
    ctx.stroke();
    // Loaded bolt
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      ballistaX - 1 * zoom,
      ballistaY - 12 * zoom,
      2 * zoom,
      8 * zoom,
    );
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(ballistaX, ballistaY - 16 * zoom);
    ctx.lineTo(ballistaX - 2 * zoom, ballistaY - 12 * zoom);
    ctx.lineTo(ballistaX + 2 * zoom, ballistaY - 12 * zoom);
    ctx.closePath();
    ctx.fill();

    // Oil cauldrons for defense
    const cauldronX = screenPos.x + isoW * 0.7;
    const cauldronY = screenPos.y + 4 * zoom;
    // Cauldron
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(cauldronX, cauldronY, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.moveTo(cauldronX - 5 * zoom, cauldronY);
    ctx.quadraticCurveTo(
      cauldronX - 6 * zoom,
      cauldronY + 8 * zoom,
      cauldronX,
      cauldronY + 10 * zoom,
    );
    ctx.quadraticCurveTo(
      cauldronX + 6 * zoom,
      cauldronY + 8 * zoom,
      cauldronX + 5 * zoom,
      cauldronY,
    );
    ctx.closePath();
    ctx.fill();
    // Bubbling oil
    const oilBubble = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(60, 40, 20, ${oilBubble})`;
    ctx.beginPath();
    ctx.ellipse(
      cauldronX,
      cauldronY - 2 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Steam from cauldron
    ctx.fillStyle = `rgba(180, 160, 140, ${oilBubble * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      cauldronX + Math.sin(time * 3) * 2,
      cauldronY - 8 * zoom,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Fire under cauldron
    const cauldronFire = 0.6 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${cauldronFire})`;
    ctx.beginPath();
    ctx.moveTo(cauldronX - 3 * zoom, cauldronY + 10 * zoom);
    ctx.quadraticCurveTo(
      cauldronX,
      cauldronY + 4 * zoom + Math.sin(time * 12) * 2,
      cauldronX + 3 * zoom,
      cauldronY + 10 * zoom,
    );
    ctx.fill();

    // Heavy chains hanging from walls
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    const chainX = screenPos.x + isoW * 0.2;
    const chainY = screenPos.y - 20 * zoom;
    for (let link = 0; link < 6; link++) {
      const linkY = chainY + link * 4 * zoom;
      const sway = Math.sin(time * 2 + link * 0.5) * 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        chainX + sway,
        linkY,
        2 * zoom,
        3 * zoom,
        link % 2 === 0 ? 0.3 : -0.3,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // War drums
    const drumX = screenPos.x + isoW * 0.4;
    const drumY = screenPos.y + 8 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY - 6 * zoom, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Drum skin
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(
      drumX,
      drumY - 6.5 * zoom,
      4 * zoom,
      2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Drumsticks
    ctx.fillStyle = "#7a6a5a";
    ctx.fillRect(drumX + 4 * zoom, drumY - 10 * zoom, 1.5 * zoom, 8 * zoom);
    ctx.fillRect(drumX + 6 * zoom, drumY - 9 * zoom, 1.5 * zoom, 7 * zoom);

    // Stacked cannonballs
    ctx.fillStyle = "#3a3a42";
    for (let row = 0; row < 3; row++) {
      for (let ball = 0; ball < 3 - row; ball++) {
        const ballX =
          screenPos.x - isoW * 0.3 + ball * 4 * zoom + row * 2 * zoom;
        const ballY = screenPos.y + 12 * zoom - row * 3 * zoom;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Fortification banners on walls (3D isometric)
    const bannerX2 = screenPos.x + isoW * 0.6;
    const bannerY2 = screenPos.y - 26 * zoom;
    const bWave = Math.sin(time * 3) * 2;
    const bIsoD = 1.5 * zoom;
    // Pole with isometric depth
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(bannerX2 - 1 * zoom, bannerY2);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2 + 14 * zoom);
    ctx.lineTo(bannerX2 - 1 * zoom, bannerY2 + 14 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.lineTo(bannerX2 + 1 * zoom + bIsoD, bannerY2 - bIsoD * 0.5);
    ctx.lineTo(bannerX2 + 1 * zoom + bIsoD, bannerY2 + 14 * zoom - bIsoD * 0.5);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2 + 14 * zoom);
    ctx.closePath();
    ctx.fill();
    // Pole finial ball
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(bannerX2, bannerY2 - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();
    // Triangular pennant back face (darker, offset for isometric depth)
    ctx.fillStyle = "#5a0000";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom + bIsoD, bannerY2 - bIsoD * 0.5);
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.6 + bIsoD,
      bannerY2 + 3 * zoom - bIsoD * 0.5,
      bannerX2 + 10 * zoom + bWave * 0.5 + bIsoD,
      bannerY2 + 5 * zoom - bIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.4 + bIsoD,
      bannerY2 + 7 * zoom - bIsoD * 0.5,
      bannerX2 + 1 * zoom + bIsoD,
      bannerY2 + 10 * zoom - bIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Triangular pennant front face
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.6,
      bannerY2 + 3 * zoom,
      bannerX2 + 10 * zoom + bWave * 0.5,
      bannerY2 + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.4,
      bannerY2 + 7 * zoom,
      bannerX2 + 1 * zoom,
      bannerY2 + 10 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    // Pennant outline
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 3 * zoom + bWave * 0.2, bannerY2 + 1.5 * zoom);
    ctx.quadraticCurveTo(
      bannerX2 + 5 * zoom + bWave * 0.4,
      bannerY2 + 5 * zoom,
      bannerX2 + 3 * zoom + bWave * 0.2,
      bannerY2 + 8.5 * zoom,
    );
    ctx.stroke();
    // Pennant emblem (crossed swords, positioned within triangle)
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 2.5 * zoom + bWave * 0.2, bannerY2 + 2.5 * zoom);
    ctx.lineTo(bannerX2 + 6 * zoom + bWave * 0.4, bannerY2 + 7 * zoom);
    ctx.moveTo(bannerX2 + 6 * zoom + bWave * 0.4, bannerY2 + 2.5 * zoom);
    ctx.lineTo(bannerX2 + 2.5 * zoom + bWave * 0.2, bannerY2 + 7 * zoom);
    ctx.stroke();
  } else if (tower.level === 4 && tower.upgrade === "A") {
    // ROYAL STABLE BASE - Elegant Marble Greek platform (3 thick tiers matching L2/L3/L4B)

    // Bottom tier - heavy dark marble foundation (deepest, widest)
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 26,
      baseD + 42,
      12,
      "#b0a898",
      "#a09888",
      "#908878",
    );

    // Double gold trim bands on bottom tier
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Gold anchor bolts on bottom tier
    ctx.fillStyle = "#a09888";
    const l4aAnchors = [
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.42,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.2,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.2,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.42,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 42) * zoom * 0.22 + 12 * zoom,
      },
    ];
    for (const anchor of l4aAnchors) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a09888";
    }

    // Decorative rosettes on bottom tier corners
    ctx.fillStyle = "#c9a227";
    const rosettePositions = [
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.45,
        y: screenPos.y + 14 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.45,
        y: screenPos.y + 14 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 42) * zoom * 0.22 + 14 * zoom,
      },
    ];
    for (const rosette of rosettePositions) {
      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          rosette.x + Math.cos(angle) * 2 * zoom,
          rosette.y + Math.sin(angle) * 1 * zoom,
          1.5 * zoom,
          0.8 * zoom,
          angle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#b8860b";
      ctx.beginPath();
      ctx.arc(rosette.x, rosette.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
    }

    // Middle tier - warm marble with fluted columns
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 30,
      9,
      "#d8d0c4",
      "#c8c0b4",
      "#b8b0a4",
    );

    // Gold molding edge on middle tier
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 30) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Fluted column effect on middle tier left face
    ctx.strokeStyle = "#a09888";
    ctx.lineWidth = 1 * zoom;
    for (let col = 0; col < 6; col++) {
      const fluteX = screenPos.x - (baseW + 16) * zoom * 0.35 - col * 4 * zoom;
      const fluteTopY = screenPos.y + 1 * zoom + col * 0.8 * zoom;
      const fluteBottomY = screenPos.y + 8 * zoom + col * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fluteX, fluteTopY);
      ctx.lineTo(fluteX - 1.5 * zoom, fluteBottomY);
      ctx.stroke();
    }

    // Fluted column effect on middle tier right face
    for (let col = 0; col < 6; col++) {
      const fluteX = screenPos.x + (baseW + 16) * zoom * 0.35 + col * 4 * zoom;
      const fluteTopY = screenPos.y + 1 * zoom + col * 0.8 * zoom;
      const fluteBottomY = screenPos.y + 8 * zoom + col * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fluteX, fluteTopY);
      ctx.lineTo(fluteX + 1.5 * zoom, fluteBottomY);
      ctx.stroke();
    }

    // Top tier - bright marble platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 18,
      6,
      "#ece8e0",
      "#dcd8d0",
      "#ccc8c0",
    );

    // Top platform tile pattern (diagonal marble tiles)
    ctx.strokeStyle = "#c0bab4";
    ctx.lineWidth = 0.5 * zoom;
    for (let i = -3; i <= 3; i++) {
      // One diagonal direction
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 8) * zoom * 0.35 + i * 5 * zoom,
        screenPos.y - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.stroke();
      // Other diagonal direction
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 8) * zoom * 0.35 + i * 5 * zoom,
        screenPos.y - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // Gold edge trim with glow
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Greek meander/key pattern on platform edge
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 1 * zoom;
    for (let i = -4; i <= 4; i++) {
      const px = screenPos.x + i * 6 * zoom;
      const py = screenPos.y + Math.abs(i) * 0.4 * zoom - 3 * zoom;
      // Greek key pattern
      ctx.beginPath();
      ctx.moveTo(px - 2 * zoom, py - 1.5 * zoom);
      ctx.lineTo(px + 2 * zoom, py - 1.5 * zoom);
      ctx.lineTo(px + 2 * zoom, py + 1.5 * zoom);
      ctx.lineTo(px - 1 * zoom, py + 1.5 * zoom);
      ctx.lineTo(px - 1 * zoom, py);
      ctx.lineTo(px + 1 * zoom, py);
      ctx.stroke();
    }

    // Decorative corner pedestals
    ctx.fillStyle = "#e0dcd4";
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 2 * zoom,
      5,
      5,
      10,
      { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 2 * zoom,
      5,
      5,
      10,
      { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" },
      zoom,
    );

    // Pedestal gold caps
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 12 * zoom,
      3.5 * zoom,
      1.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 12 * zoom,
      3.5 * zoom,
      1.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Small golden urns on pedestals
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 16 * zoom,
      2 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 16 * zoom,
      2 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Urn rims
    ctx.fillStyle = "#b8860b";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 19 * zoom,
      1.5 * zoom,
      0.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 19 * zoom,
      1.5 * zoom,
      0.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Hay storage area (left)
    const hayX = screenPos.x - isoW * 0.6;
    const hayY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(hayX, hayY - 2 * zoom, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b49830";
    ctx.beginPath();
    ctx.ellipse(
      hayX + 4 * zoom,
      hayY - 6 * zoom,
      5 * zoom,
      2.5 * zoom,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Water trough
    const troughX = screenPos.x + isoW * 0.45;
    const troughY = screenPos.y + 4 * zoom;
    drawIsometricPrism(
      ctx,
      troughX,
      troughY,
      10,
      6,
      4,
      { top: "#8a8a92", left: "#7a7a82", right: "#6a6a72" },
      zoom,
    );
    // Water surface
    ctx.fillStyle = `rgba(100, 150, 200, ${0.6 + Math.sin(time * 2) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      troughX,
      troughY - 4 * zoom,
      4 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Golden urn
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(
      troughX + 10 * zoom,
      troughY - 6 * zoom,
      3 * zoom,
      5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#b8860b";
    ctx.beginPath();
    ctx.ellipse(
      troughX + 10 * zoom,
      troughY - 10 * zoom,
      2 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else {
    // ROYAL CASTLE BASE - Grand royal military fortress with detailed masonry

    // Deep royal foundation - massive stone base
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 26,
      baseD + 42,
      12,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22",
    );

    // Heavy iron reinforcement bands
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Foundation anchor points with gold caps
    ctx.fillStyle = "#5a5a62";
    const anchorPoints = [
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.42,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.2,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.2,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.42,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 42) * zoom * 0.22 + 12 * zoom,
      },
    ];
    for (const anchor of anchorPoints) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Gold cap
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }

    // Royal stone tier
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 30,
      9,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42",
    );

    // Gold decorative molding on middle tier
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 30) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Top royal platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 18,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52",
    );

    // Royal heraldic floor pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.8 * zoom;
    // Cross pattern
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 8) * zoom * 0.35 + i * 5 * zoom,
        screenPos.y - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 8) * zoom * 0.35 + i * 5 * zoom,
        screenPos.y - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // Gold edge trim with royal glow
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3 * zoom;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Orange accent glow trim (inner)
    const accentGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.strokeStyle = `rgba(255, 108, 0, ${accentGlow})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 3 * zoom);
    ctx.lineTo(screenPos.x + isoW + 2 * zoom, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Royal carpet pattern (larger, more detailed)
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 10 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    // Carpet gold border
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Inner carpet pattern
    ctx.fillStyle = "#6b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 6 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 2 * zoom);
    ctx.lineTo(screenPos.x + 6 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 7 * zoom);
    ctx.closePath();
    ctx.fill();
    // Royal crest on carpet (crown symbol)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 3 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x - 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 7 * zoom);
    ctx.lineTo(screenPos.x + 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x + 3 * zoom, screenPos.y - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Decorative corner fortress pillars
    ctx.fillStyle = "#5a5a62";
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Pillar gold bands
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 8 * zoom,
      3.5 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 8 * zoom,
      3.5 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Pillar caps with finials
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.45 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.45 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.45 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.45 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Gold finial spikes
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 8) * zoom * 0.45,
      screenPos.y - 22 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.45 - 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.45 + 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + (baseW + 8) * zoom * 0.45,
      screenPos.y - 22 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.45 - 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.45 + 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Royal guard post (left)
    const guardX = screenPos.x - isoW * 0.6;
    const guardY = screenPos.y + 6 * zoom;
    drawIsometricPrism(
      ctx,
      guardX,
      guardY,
      8,
      6,
      16,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );
    // Guard silhouette
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(guardX, guardY - 20 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(guardX - 2 * zoom, guardY - 17 * zoom, 4 * zoom, 8 * zoom);
    // Spear
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(guardX + 4 * zoom, guardY - 12 * zoom);
    ctx.lineTo(guardX + 4 * zoom, guardY - 28 * zoom);
    ctx.stroke();

    // Royal banner stand (right)
    const bannerX = screenPos.x + isoW * 0.5;
    const bannerY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      bannerX - 1.5 * zoom,
      bannerY - 24 * zoom,
      3 * zoom,
      24 * zoom,
    );
    // Banner
    const bannerWave = Math.sin(time * 3) * 2;
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(bannerX + 1.5 * zoom, bannerY - 24 * zoom);
    ctx.quadraticCurveTo(
      bannerX + 10 * zoom + bannerWave,
      bannerY - 20 * zoom,
      bannerX + 14 * zoom + bannerWave * 0.5,
      bannerY - 18 * zoom,
    );
    ctx.lineTo(bannerX + 1.5 * zoom, bannerY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Crown on banner
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(bannerX + 5 * zoom + bannerWave * 0.3, bannerY - 20 * zoom);
    ctx.lineTo(bannerX + 6 * zoom + bannerWave * 0.3, bannerY - 22 * zoom);
    ctx.lineTo(bannerX + 8 * zoom + bannerWave * 0.4, bannerY - 20 * zoom);
    ctx.lineTo(bannerX + 10 * zoom + bannerWave * 0.5, bannerY - 22 * zoom);
    ctx.lineTo(bannerX + 11 * zoom + bannerWave * 0.5, bannerY - 20 * zoom);
    ctx.closePath();
    ctx.fill();

    // Treasure chest
    drawIsometricPrism(
      ctx,
      bannerX + 8 * zoom,
      bannerY,
      8,
      6,
      5,
      { top: "#8b4513", left: "#6b3503", right: "#5b2503" },
      zoom,
    );
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(bannerX + 5 * zoom, bannerY - 6 * zoom, 6 * zoom, 2 * zoom);
  }

  // Glowing edge on top platform
  const edgeGlow = 0.5 + Math.sin(time * 2) * 0.2;
  ctx.strokeStyle = `rgba(255, 108, 0, ${edgeGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.shadowColor = "#e06000";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - isoW, screenPos.y - 4 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y + isoD - 4 * zoom);
  ctx.lineTo(screenPos.x + isoW, screenPos.y - 4 * zoom);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ========== TRAIN TRACKS WITH SLEEPERS AND SEPARATED RAILS ==========
  const trackLen = baseW * 0.9 * zoom;
  const trackW = 24 * zoom;

  // Helper to draw along isometric track axis
  const trackIso = (baseX: number, baseY: number, offset: number) => ({
    x: baseX + offset * zoom,
    y: baseY - offset * zoom * 0.5,
  });

  // Common track bed (gravel ballast)
  const bedColor =
    tower.level >= 4
      ? "#3a3a42"
      : tower.level >= 3
        ? "#4a4a52"
        : tower.level >= 2
          ? "#3a3a42"
          : "#5a4a3a";
  ctx.fillStyle = bedColor;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - trackLen * 0.5,
    screenPos.y + trackLen * 0.25 - 3 * zoom,
  );
  ctx.lineTo(screenPos.x, screenPos.y - trackW * 0.12 - 3 * zoom);
  ctx.lineTo(
    screenPos.x + trackLen * 0.5,
    screenPos.y - trackLen * 0.25 - 3 * zoom,
  );
  ctx.lineTo(screenPos.x, screenPos.y + trackW * 0.12 - 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Sleepers (wooden ties across the tracks)
  const numSleepers = 9;
  const sleeperColor =
    tower.level >= 4
      ? "#4a4a52"
      : tower.level >= 3
        ? "#5a5a62"
        : tower.level >= 2
          ? "#5a5a5a"
          : "#6b5030";
  const sleeperDark =
    tower.level >= 4
      ? "#3a3a42"
      : tower.level >= 3
        ? "#4a4a52"
        : tower.level >= 2
          ? "#4a4a4a"
          : "#5a4020";

  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperCenter = trackIso(
      screenPos.x,
      screenPos.y - 5 * zoom,
      ((t * trackLen) / zoom) * 0.85,
    );

    // Sleeper is perpendicular to track - draw as small isometric rectangle
    const sw = 12; // sleeper width (perpendicular to track)
    const sd = 3; // sleeper depth (along track)
    const sh = 2; // sleeper height

    // Top face
    ctx.fillStyle = sleeperColor;
    ctx.beginPath();
    ctx.moveTo(
      sleeperCenter.x - sw * zoom * 0.25,
      sleeperCenter.y - sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 - sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125,
    );
    ctx.closePath();
    ctx.fill();

    // Front face
    ctx.fillStyle = sleeperDark;
    ctx.beginPath();
    ctx.moveTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125 + sh * zoom,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125 + sh * zoom,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Rails - two separate rails with proper 3D shape
  const railOffsets = [-4, 4]; // Distance from center line
  const railColor =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#c9a227"
        : "#7a7a82"
      : "#6a6a6a";
  const railHighlight =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#ffe44d"
        : "#9a9aa2"
      : "#8a8a8a";
  const railDark =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#b8860b"
        : "#5a5a62"
      : "#4a4a4a";

  for (const railOff of railOffsets) {
    // Rail runs along the track
    const railStart = trackIso(
      screenPos.x,
      screenPos.y - 6 * zoom,
      (-trackLen / zoom) * 0.42,
    );
    const railEnd = trackIso(
      screenPos.x,
      screenPos.y - 6 * zoom,
      (trackLen / zoom) * 0.42,
    );

    // Offset perpendicular to track
    const perpX = railOff * zoom * 0.25;
    const perpY = railOff * zoom * 0.125;

    // Rail top surface (bright)
    ctx.strokeStyle = railHighlight;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY);
    ctx.stroke();

    // Rail side (dark)
    ctx.strokeStyle = railDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY + 1.5 * zoom);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY + 1.5 * zoom);
    ctx.stroke();

    // Rail base flange
    ctx.strokeStyle = railColor;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY + 2.5 * zoom);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY + 2.5 * zoom);
    ctx.stroke();
  }

  // Rail spikes/fasteners on sleepers
  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperCenter = trackIso(
      screenPos.x,
      screenPos.y - 5 * zoom,
      ((t * trackLen) / zoom) * 0.85,
    );

    for (const railOff of railOffsets) {
      const perpX = railOff * zoom * 0.25;
      const perpY = railOff * zoom * 0.125;

      // Spike
      ctx.fillStyle =
        tower.level >= 4 && tower.upgrade === "A" ? "#c9a227" : "#e06000";
      ctx.beginPath();
      ctx.arc(
        sleeperCenter.x + perpX,
        sleeperCenter.y + perpY,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Level-specific track decorations
  if (tower.level >= 3) {
    // Glowing runes between rails for fortress/royal
    const runeGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${runeGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    for (let i = 1; i < numSleepers - 1; i += 2) {
      const t = i / (numSleepers - 1) - 0.5;
      const runePos = trackIso(
        screenPos.x,
        screenPos.y - 5 * zoom,
        ((t * trackLen) / zoom) * 0.85,
      );
      ctx.beginPath();
      ctx.arc(runePos.x, runePos.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  if (tower.level === 4 && tower.upgrade === "B") {
    // Maglev glow effect for royal armored
    const maglevGlow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.strokeStyle = `rgba(255, 108, 0, ${maglevGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 10 * zoom;
    ctx.lineWidth = 2 * zoom;
    const glowStart = trackIso(
      screenPos.x,
      screenPos.y - 4 * zoom,
      (-trackLen / zoom) * 0.4,
    );
    const glowEnd = trackIso(
      screenPos.x,
      screenPos.y - 4 * zoom,
      (trackLen / zoom) * 0.4,
    );
    ctx.beginPath();
    ctx.moveTo(glowStart.x, glowStart.y);
    ctx.lineTo(glowEnd.x, glowEnd.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ---- BACK FENCE EDGES (drawn behind building body for correct isometric depth) ----
  {
    const fPostColor =
      tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#6a6a72" : "#6a5230";
    const fRailColor =
      tower.level >= 4 ? "#a88420" : tower.level >= 3 ? "#5a5a62" : "#5a4220";
    const topPlatW =
      tower.level <= 2 ? baseW + 4 : tower.level === 3 ? baseW + 6 : baseW + 8;
    const topPlatD =
      tower.level === 1
        ? baseD + 12
        : tower.level === 2
          ? baseD + 14
          : tower.level === 3
            ? baseD + 16
            : baseD + 18;
    const fW = topPlatW * zoom * 0.5;
    const fD = topPlatD * zoom * 0.25;
    const fBaseY = screenPos.y;
    const fPostH = 4 * zoom;
    const postCount = 5;

    const backFenceEdges: [number, number, number, number][] = [
      [screenPos.x + fW, fBaseY, screenPos.x, fBaseY - fD],
      [screenPos.x, fBaseY - fD, screenPos.x - fW, fBaseY],
    ];

    ctx.lineCap = "round";

    for (const [x0, y0, x1, y1] of backFenceEdges) {
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;

        ctx.strokeStyle = fPostColor;
        ctx.lineWidth = 1.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - fPostH);
        ctx.stroke();

        ctx.fillStyle = fPostColor;
        ctx.beginPath();
        ctx.arc(px, py - fPostH, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let r = 0; r < 2; r++) {
        const railY = fPostH * (0.35 + r * 0.45);
        ctx.strokeStyle = fRailColor;
        ctx.lineWidth = 1.0 * zoom;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - railY);
        ctx.lineTo(x1, y1 - railY);
        ctx.stroke();
      }
    }

    ctx.lineCap = "butt";
  }

  // ========== STATION BUILDING (proper isometric alignment) ==========
  const stationX = screenPos.x - 16 * zoom;
  const stationY = screenPos.y - 8 * zoom;

  // Helper: Draw proper isometric sloped roof
  const drawSlopedRoof = (
    cx: number,
    cy: number,
    w: number,
    d: number,
    h: number,
    leftColor: string,
    rightColor: string,
    frontColor: string,
  ) => {
    const hw = w * zoom * 0.5;
    const hd = d * zoom * 0.25;
    const rh = h * zoom;

    // Left slope
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh);
    ctx.lineTo(cx - hw, cy);
    ctx.lineTo(cx - hw, cy + hd);
    ctx.lineTo(cx, cy - rh + hd * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right slope
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx + hw, cy + hd);
    ctx.lineTo(cx, cy - rh + hd * 0.5);
    ctx.closePath();
    ctx.fill();

    // Front gable
    ctx.fillStyle = frontColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh + hd * 0.5);
    ctx.lineTo(cx - hw, cy + hd);
    ctx.lineTo(cx + hw, cy + hd);
    ctx.closePath();
    ctx.fill();
  };

  // Helper: Draw working clock face
  const drawClockFace = (
    cx: number,
    cy: number,
    radius: number,
    showNumerals: boolean = false,
  ) => {
    // Clock backing
    ctx.fillStyle = "#fffff8";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Hour markers
    ctx.fillStyle = "#1a1a1a";
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const markerR = radius * 0.85;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * markerR,
        cy + Math.sin(angle) * markerR,
        radius * 0.06,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    if (showNumerals) {
      ctx.font = `${Math.max(8 * zoom, radius * 0.25)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 1; i <= 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const numeralR = radius * 0.68;
        ctx.fillText(
          String(i),
          cx + Math.cos(angle) * numeralR,
          cy + Math.sin(angle) * numeralR,
        );
      }
    }

    // Animated hands
    const hourAngle = ((time * 0.03) % (Math.PI * 2)) - Math.PI / 2;
    const minAngle = ((time * 0.2) % (Math.PI * 2)) - Math.PI / 2;

    // Hour hand
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(hourAngle) * radius * 0.5,
      cy + Math.sin(hourAngle) * radius * 0.5,
    );
    ctx.stroke();

    // Minute hand
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(minAngle) * radius * 0.75,
      cy + Math.sin(minAngle) * radius * 0.75,
    );
    ctx.stroke();

    // Center cap
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
  };

  if (tower.level === 1) {
    // ========== LEVEL 1: BARRACKS - Steampunk Wooden Training Facility ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION with exposed machinery ===
    // Heavy stone foundation base (taller, matching L4B pattern)
    drawIsometricPrism(
      ctx,
      bX,
      bY + 10 * zoom,
      38,
      32,
      10,
      { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
      zoom,
    );

    // Stone mortar lines on foundation - left face
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 19 * zoom, bY - 1 * zoom + r * 3 * zoom);
      ctx.lineTo(bX, bY + 8 * zoom + r * 3 * zoom);
      ctx.stroke();
    }
    // Stone mortar lines on foundation - right face
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 8 * zoom + r * 3 * zoom);
      ctx.lineTo(bX + 19 * zoom, bY - 1 * zoom + r * 3 * zoom);
      ctx.stroke();
    }

    // Staggered vertical mortar joints - left face
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    const l1BlockW = 4.5 * zoom;
    for (let r = 0; r < 3; r++) {
      const stagger = (r % 2) * (l1BlockW * 0.5);
      for (let j = 0; j < 5; j++) {
        const jx = bX - 17 * zoom + stagger + j * l1BlockW;
        if (jx < bX - 1 * zoom) {
          const xOff = jx - (bX - 19 * zoom);
          const yBase = bY - 1 * zoom + xOff * (9 / 19);
          ctx.beginPath();
          ctx.moveTo(jx, yBase + r * 3 * zoom);
          ctx.lineTo(jx, yBase + (r + 1) * 3 * zoom);
          ctx.stroke();
        }
      }
    }
    // Staggered vertical mortar joints - right face
    for (let r = 0; r < 3; r++) {
      const stagger = (r % 2) * (l1BlockW * 0.5);
      for (let j = 0; j < 5; j++) {
        const jx = bX + 2 * zoom + stagger + j * l1BlockW;
        if (jx < bX + 18 * zoom) {
          const xOff = jx - bX;
          const yBase = bY + 8 * zoom - xOff * (9 / 19);
          ctx.beginPath();
          ctx.moveTo(jx, yBase + r * 3 * zoom);
          ctx.lineTo(jx, yBase + (r + 1) * 3 * zoom);
          ctx.stroke();
        }
      }
    }

    // Warm steampunk trim band on foundation - left face
    ctx.strokeStyle = "#c06020";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 6 * zoom);
    ctx.lineTo(bX + 2 * zoom, bY + 15 * zoom);
    ctx.stroke();
    // Trim band - right face
    ctx.beginPath();
    ctx.moveTo(bX - 2 * zoom, bY + 15 * zoom);
    ctx.lineTo(bX + 18 * zoom, bY + 6 * zoom);
    ctx.stroke();

    // Copper rivets along trim - left face
    ctx.fillStyle = "#b87333";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 14 * zoom + i * 4 * zoom,
        bY + 7.5 * zoom + i * 1.2 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Copper rivets along trim - right face
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 1 * zoom + i * 4 * zoom,
        bY + 15 * zoom - i * 1.2 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Exposed pipes on foundation (left side)
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 4 * zoom);
    ctx.lineTo(bX - 18 * zoom, bY - 5 * zoom);
    ctx.quadraticCurveTo(
      bX - 18 * zoom,
      bY - 10 * zoom,
      bX - 14 * zoom,
      bY - 10 * zoom,
    );
    ctx.stroke();
    // Pipe joints
    ctx.fillStyle = "#8a7355";
    ctx.beginPath();
    ctx.arc(bX - 18 * zoom, bY + 4 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 18 * zoom, bY - 5 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Foundation vent grate
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(bX + 8 * zoom, bY + 2 * zoom, 6 * zoom, 4 * zoom);
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX + 9 * zoom + i * 2 * zoom, bY + 2 * zoom);
      ctx.lineTo(bX + 9 * zoom + i * 2 * zoom, bY + 6 * zoom);
      ctx.stroke();
    }
    // Vent steam
    const ventSteam = 0.3 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${ventSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX + 11 * zoom,
      bY - 1 * zoom + Math.sin(time * 2) * 2,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Main wooden building
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      32,
      26,
      28,
      { top: "#9b8365", left: "#7b6345", right: "#5b4325" },
      zoom,
    );

    // Horizontal log/plank details on left face
    ctx.strokeStyle = "#4a3215";
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < 5; i++) {
      const ly = bY - 4 * zoom - i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 14 * zoom, ly + 3.5 * zoom);
      ctx.lineTo(bX - 2 * zoom, ly + 6.5 * zoom);
      ctx.stroke();
    }

    // Vertical timber frame details on right face
    ctx.strokeStyle = "#4a3215";
    for (let i = 0; i < 3; i++) {
      const lx = bX + 4 * zoom + i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, bY - 2 * zoom);
      ctx.lineTo(lx, bY - 26 * zoom);
      ctx.stroke();
    }

    // === HIGH-TECH ELEMENT: Power conduit on wall ===
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 16 * zoom, bY - 5 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - 20 * zoom);
    ctx.stroke();
    // Conduit glow nodes
    const nodeGlow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = `rgba(255, 108, 0, ${nodeGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(bX + 16 * zoom, bY - 8 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX + 16 * zoom, bY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Square pyramid roof (4 triangular faces meeting at a single peak)
    const roofBaseY = bY - 24 * zoom;
    const eaveOH = 3 * zoom;
    const eHW = 18 * zoom + eaveOH;
    const eHD = 7.5 * zoom + eaveOH * 0.5;
    const rH = 22 * zoom;

    // Eave diamond corners (isometric diamond with overhang)
    const eBack = { x: bX, y: roofBaseY - eHD };
    const eRight = { x: bX + eHW, y: roofBaseY };
    const eFront = { x: bX, y: roofBaseY + eHD };
    const eLeft = { x: bX - eHW, y: roofBaseY };

    // Single peak point (center of diamond, elevated)
    const peak = { x: bX, y: roofBaseY - rH };

    // Back face (away from camera, draw first)
    ctx.fillStyle = "#4b3315";
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.lineTo(eBack.x, eBack.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.closePath();
    ctx.fill();

    // Left face (faces camera-left, brightest)
    const leftGrad = ctx.createLinearGradient(peak.x, peak.y, eLeft.x, eLeft.y);
    leftGrad.addColorStop(0, "#7b6345");
    leftGrad.addColorStop(0.4, "#8b7355");
    leftGrad.addColorStop(1, "#6b5535");
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Right face (faces camera-right, shadowed)
    const rightGrad = ctx.createLinearGradient(
      peak.x,
      peak.y,
      eRight.x,
      eRight.y,
    );
    rightGrad.addColorStop(0, "#6a5535");
    rightGrad.addColorStop(0.4, "#5e4a2c");
    rightGrad.addColorStop(1, "#544025");
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Front face left half (lit, matching left slope)
    const frontLeftGrad = ctx.createLinearGradient(
      peak.x,
      peak.y,
      eFront.x,
      eFront.y,
    );
    frontLeftGrad.addColorStop(0, "#7b6345");
    frontLeftGrad.addColorStop(0.5, "#8b7050");
    frontLeftGrad.addColorStop(1, "#6b5535");
    ctx.fillStyle = frontLeftGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Front face right half (shadowed, matching right slope)
    const frontRightGrad = ctx.createLinearGradient(
      peak.x,
      peak.y,
      eFront.x,
      eFront.y,
    );
    frontRightGrad.addColorStop(0, "#6a5535");
    frontRightGrad.addColorStop(0.5, "#5e4a2c");
    frontRightGrad.addColorStop(1, "#544025");
    ctx.fillStyle = frontRightGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Wooden shingle rows on left face
    ctx.strokeStyle = "rgba(30, 20, 8, 0.4)";
    ctx.lineWidth = 0.7 * zoom;
    for (let row = 1; row <= 6; row++) {
      const t = row / 7;
      const plX = peak.x + (eLeft.x - peak.x) * t;
      const plY = peak.y + (eLeft.y - peak.y) * t;
      const pfX = peak.x + (eFront.x - peak.x) * t;
      const pfY = peak.y + (eFront.y - peak.y) * t;
      ctx.beginPath();
      ctx.moveTo(plX, plY);
      ctx.lineTo(pfX, pfY);
      ctx.stroke();
    }

    // Wooden shingle rows on right face
    for (let row = 1; row <= 6; row++) {
      const t = row / 7;
      const prX = peak.x + (eRight.x - peak.x) * t;
      const prY = peak.y + (eRight.y - peak.y) * t;
      const pfX = peak.x + (eFront.x - peak.x) * t;
      const pfY = peak.y + (eFront.y - peak.y) * t;
      ctx.beginPath();
      ctx.moveTo(prX, prY);
      ctx.lineTo(pfX, pfY);
      ctx.stroke();
    }

    // Front face shingle rows (V-lines)
    for (let row = 1; row <= 6; row++) {
      const t = row / 7;
      const plX = peak.x + (eLeft.x - peak.x) * t;
      const plY = peak.y + (eLeft.y - peak.y) * t;
      const prX = peak.x + (eRight.x - peak.x) * t;
      const prY = peak.y + (eRight.y - peak.y) * t;
      const fcX = peak.x + (eFront.x - peak.x) * t;
      const fcY = peak.y + (eFront.y - peak.y) * t;
      ctx.beginPath();
      ctx.moveTo(plX, plY);
      ctx.lineTo(fcX, fcY);
      ctx.lineTo(prX, prY);
      ctx.stroke();
    }

    // Roof edge outlines (only viewer-facing ridges and eaves)
    ctx.strokeStyle = "rgba(40, 24, 8, 0.55)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.stroke();

    // Eave edge outlines (visible front edges only)
    ctx.strokeStyle = "rgba(40, 24, 8, 0.6)";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.stroke();

    // Eave fascia thickness (visible underside strip)
    ctx.fillStyle = "rgba(58, 38, 16, 0.25)";
    ctx.beginPath();
    ctx.moveTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.lineTo(eRight.x, eRight.y + 2 * zoom);
    ctx.lineTo(eFront.x, eFront.y + 2 * zoom);
    ctx.lineTo(eLeft.x, eLeft.y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Eave shadow outline (back edges)
    ctx.strokeStyle = "rgba(42, 26, 8, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(eBack.x, eBack.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.moveTo(eBack.x, eBack.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.stroke();

    // Copper ridge cap rivets along front ridges
    ctx.fillStyle = "#8b7355";
    for (const corner of [eLeft, eRight]) {
      for (let ri = 1; ri <= 3; ri++) {
        const rt = ri / 4;
        const rx = peak.x + (corner.x - peak.x) * rt;
        const ry = peak.y + (corner.y - peak.y) * rt;
        ctx.beginPath();
        ctx.arc(rx, ry, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Brass finial at peak with subtle glow
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(peak.x, peak.y - 1.5 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a08020";
    ctx.beginPath();
    ctx.arc(peak.x, peak.y - 1.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Finial spike
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y - 3.5 * zoom);
    ctx.lineTo(peak.x, peak.y - 8 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#e8c847";
    ctx.beginPath();
    ctx.arc(peak.x, peak.y - 8 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Large double door (left face)
    ctx.fillStyle = "#4a3215";
    ctx.beginPath();
    ctx.moveTo(bX - 12 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 12 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 3 * zoom, bY - 16 * zoom);
    ctx.lineTo(bX - 3 * zoom, bY);
    ctx.closePath();
    ctx.fill();
    // Door frame
    ctx.strokeStyle = "#3a2205";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Door split line
    ctx.beginPath();
    ctx.moveTo(bX - 7.5 * zoom, bY - 1 * zoom);
    ctx.lineTo(bX - 7.5 * zoom, bY - 17 * zoom);
    ctx.stroke();
    // Door handles (brass)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(bX - 9 * zoom, bY - 9 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 6 * zoom, bY - 8.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Window with warm glow (right face, isometric parallelogram)
    {
      const wCx = bX + 9 * zoom;
      const wCy = bY - 15 * zoom;
      const wHalfW = 4 * zoom;
      const wHalfH = 5 * zoom;
      const wSlope = -0.5;

      const wTlx = wCx - wHalfW;
      const wTly = wCy - wHalfH - wHalfW * wSlope;
      const wTrx = wCx + wHalfW;
      const wTry = wCy - wHalfH + wHalfW * wSlope;
      const wBrx = wCx + wHalfW;
      const wBry = wCy + wHalfH + wHalfW * wSlope;
      const wBlx = wCx - wHalfW;
      const wBly = wCy + wHalfH - wHalfW * wSlope;

      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(wTlx, wTly);
      ctx.lineTo(wTrx, wTry);
      ctx.lineTo(wBrx, wBry);
      ctx.lineTo(wBlx, wBly);
      ctx.closePath();
      ctx.fill();

      const winGlow1 = 0.5 + Math.sin(time * 2) * 0.2;
      ctx.fillStyle = `rgba(255, 200, 100, ${winGlow1})`;
      ctx.beginPath();
      ctx.moveTo(wTlx + 1 * zoom, wTly + 1 * zoom);
      ctx.lineTo(wTrx - 1 * zoom, wTry + 1 * zoom);
      ctx.lineTo(wBrx - 1 * zoom, wBry - 1 * zoom);
      ctx.lineTo(wBlx + 1 * zoom, wBly - 1 * zoom);
      ctx.closePath();
      ctx.fill();

      // Mullion cross (follows the parallelogram)
      const wMidTopX = (wTlx + wTrx) * 0.5;
      const wMidTopY = (wTly + wTry) * 0.5;
      const wMidBotX = (wBlx + wBrx) * 0.5;
      const wMidBotY = (wBly + wBry) * 0.5;
      const wMidLeftX = (wTlx + wBlx) * 0.5;
      const wMidLeftY = (wTly + wBly) * 0.5;
      const wMidRightX = (wTrx + wBrx) * 0.5;
      const wMidRightY = (wTry + wBry) * 0.5;
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wMidTopX, wMidTopY);
      ctx.lineTo(wMidBotX, wMidBotY);
      ctx.moveTo(wMidLeftX, wMidLeftY);
      ctx.lineTo(wMidRightX, wMidRightY);
      ctx.stroke();
    }

    // Stone chimney with smoke stack
    const chimneyBaseY = roofBaseY + 2 * zoom;
    drawIsometricPrism(
      ctx,
      bX + 6 * zoom,
      chimneyBaseY - 8 * zoom,
      5,
      4,
      14,
      { top: "#6a6a6a", left: "#5a5a5a", right: "#4a4a4a" },
      zoom,
    );
    // Chimney cap
    drawIsometricPrism(
      ctx,
      bX + 6 * zoom,
      chimneyBaseY - 22 * zoom,
      7,
      5,
      2,
      { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
      zoom,
    );
    // Smoke
    const smokeAlpha1 = 0.25 + Math.sin(time * 2) * 0.1;
    ctx.fillStyle = `rgba(180, 180, 180, ${smokeAlpha1})`;
    const smokeOff1 = Math.sin(time * 1.5) * 3;
    ctx.beginPath();
    ctx.arc(
      bX + 6 * zoom + smokeOff1,
      chimneyBaseY - 28 * zoom,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      bX + 11 * zoom + smokeOff1 * 0.7,
      chimneyBaseY - 34 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // === HIGH-TECH: Small gear on side ===
    const gearX1 = bX - 16 * zoom;
    const gearY1 = bY - 6 * zoom;
    ctx.fillStyle = "#8b7355";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      const r = i % 2 === 0 ? 3 * zoom : 2.2 * zoom;
      const x = gearX1 + Math.cos(angle) * r;
      const y = gearY1 + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(gearX1, gearY1, 1.2 * zoom, 0.6 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // (Sign removed)

    // === Lantern on post ===
    const lanternX = bX + 18 * zoom;
    const lanternY = bY - 15 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(lanternX - 1 * zoom, lanternY, 2 * zoom, 15 * zoom);
    drawIsometricPrism(
      ctx,
      lanternX,
      lanternY,
      4,
      4,
      6,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom,
    );
    const lanternGlow = 0.6 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 200, 100, ${lanternGlow})`;
    ctx.shadowColor = "#ffcc66";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY - 3 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (tower.level === 2) {
    // ========== LEVEL 2: GARRISON - Industrial Stone Military Outpost ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION with machinery ===
    // Heavy stone foundation
    drawIsometricPrism(
      ctx,
      bX,
      bY + 8 * zoom,
      40,
      34,
      8,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // Foundation mortar lines - left face
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r <= 2; r++) {
      const frac = (r / 3) * 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 20 * zoom, bY + 8 * zoom - frac);
      ctx.lineTo(bX, bY + 16.5 * zoom - frac);
      ctx.stroke();
    }
    // Foundation mortar lines - right face
    for (let r = 1; r <= 2; r++) {
      const frac = (r / 3) * 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX, bY + 16.5 * zoom - frac);
      ctx.lineTo(bX + 20 * zoom, bY + 8 * zoom - frac);
      ctx.stroke();
    }

    // Foundation rivets
    ctx.fillStyle = "#6a6a72";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 14 * zoom + i * 6 * zoom,
        bY + 6 * zoom - i * 0.5 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Exposed steam pipes on foundation
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 6 * zoom);
    ctx.lineTo(bX - 20 * zoom, bY - 8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY - 8 * zoom);
    ctx.quadraticCurveTo(
      bX - 20 * zoom,
      bY - 14 * zoom,
      bX - 14 * zoom,
      bY - 14 * zoom,
    );
    ctx.stroke();
    // Pipe valve wheel
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 20 * zoom, bY - 2 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.arc(bX - 20 * zoom, bY - 2 * zoom, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Foundation exhaust port
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 5 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Exhaust glow
    const exhaustGlow = 0.4 + Math.sin(time * 5) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${exhaustGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 5 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock tower (attached to main building)
    const towerX = bX + 14 * zoom;
    const towerY = bY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      towerX,
      towerY,
      14,
      12,
      44,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Tower stone block texture - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(towerX - 7 * zoom, towerY - 44 * zoom);
    ctx.lineTo(towerX, towerY - 41 * zoom);
    ctx.lineTo(towerX, towerY + 3 * zoom);
    ctx.lineTo(towerX - 7 * zoom, towerY);
    ctx.closePath();
    ctx.clip();

    const twrStoneRows = 9;
    const twrStoneRowH = (44 * zoom) / twrStoneRows;
    const twrLeftSlope = 3 / 7;
    const twrStoneBlockW = 3.5 * zoom;

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(towerX - 7 * zoom, towerY - r * twrStoneRowH);
      ctx.lineTo(towerX, towerY + 3 * zoom - r * twrStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      for (
        let jx = towerX - 7 * zoom + twrStoneBlockW + stagger;
        jx < towerX;
        jx += twrStoneBlockW
      ) {
        const xOff = jx - (towerX - 7 * zoom);
        const yBase = towerY + xOff * twrLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * twrStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * twrStoneRowH);
        ctx.stroke();
      }
    }
    const twrBlockSeed = [3, 1, 5, 0, 4, 2, 6];
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      let prevX = towerX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = towerX - 7 * zoom + twrStoneBlockW + stagger;
        jx < towerX;
        jx += twrStoneBlockW
      ) {
        const shade = (twrBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (towerX - 7 * zoom);
          const xOff2 = jx - (towerX - 7 * zoom);
          const yB1 = towerY + xOff1 * twrLeftSlope;
          const yB2 = towerY + xOff2 * twrLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * twrStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * twrStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower stone block texture - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(towerX, towerY - 41 * zoom);
    ctx.lineTo(towerX + 7 * zoom, towerY - 44 * zoom);
    ctx.lineTo(towerX + 7 * zoom, towerY);
    ctx.lineTo(towerX, towerY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    const twrRightSlope = -3 / 7;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(towerX, towerY + 3 * zoom - r * twrStoneRowH);
      ctx.lineTo(towerX + 7 * zoom, towerY - r * twrStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      for (
        let jx = towerX + twrStoneBlockW + stagger;
        jx < towerX + 7 * zoom;
        jx += twrStoneBlockW
      ) {
        const xOff = jx - towerX;
        const yBase = towerY + 3 * zoom + xOff * twrRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * twrStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * twrStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      let prevX = towerX;
      let bIdx = 0;
      for (
        let jx = towerX + twrStoneBlockW + stagger;
        jx < towerX + 7 * zoom;
        jx += twrStoneBlockW
      ) {
        const shade = (twrBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - towerX;
          const xOff2 = jx - towerX;
          const yB1 = towerY + 3 * zoom + xOff1 * twrRightSlope;
          const yB2 = towerY + 3 * zoom + xOff2 * twrRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * twrStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * twrStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower roof (pyramid with spire)
    const tRoofY = towerY - 44 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX - 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY + 4 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY + 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Tile row lines on tower roof
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const lLeftX = towerX + t * (-8 * zoom);
      const lLeftY = tRoofY - 16 * zoom + t * 16 * zoom;
      const lFrontY = tRoofY - 16 * zoom + t * 20 * zoom;
      ctx.beginPath();
      ctx.moveTo(lLeftX, lLeftY);
      ctx.lineTo(towerX, lFrontY);
      ctx.stroke();
      const rRightX = towerX + t * 8 * zoom;
      const rRightY = tRoofY - 16 * zoom + t * 16 * zoom;
      ctx.beginPath();
      ctx.moveTo(towerX, lFrontY);
      ctx.lineTo(rRightX, rRightY);
      ctx.stroke();
    }
    // Ridge line
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(towerX - 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.stroke();

    // Gold finial
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(towerX, tRoofY - 18 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock face on tower
    drawClockFace(towerX + 1 * zoom, towerY - 35 * zoom, 6 * zoom);

    // Main stone building
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      34,
      28,
      32,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Stone block texture on main building - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 17 * zoom, bY - 32 * zoom);
    ctx.lineTo(bX, bY - 25 * zoom);
    ctx.lineTo(bX, bY + 7 * zoom);
    ctx.lineTo(bX - 17 * zoom, bY);
    ctx.closePath();
    ctx.clip();

    const bldgStoneRows = 7;
    const bldgStoneRowH = (32 * zoom) / bldgStoneRows;
    const bldgLeftSlope = 7 / 17;
    const bldgStoneBlockW = 5.5 * zoom;

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < bldgStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 17 * zoom, bY - r * bldgStoneRowH);
      ctx.lineTo(bX, bY + 7 * zoom - r * bldgStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      for (
        let jx = bX - 17 * zoom + bldgStoneBlockW + stagger;
        jx < bX;
        jx += bldgStoneBlockW
      ) {
        const xOff = jx - (bX - 17 * zoom);
        const yBase = bY + xOff * bldgLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * bldgStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * bldgStoneRowH);
        ctx.stroke();
      }
    }
    const bldgBlockSeed = [2, 5, 1, 6, 3, 0, 4];
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      let prevX = bX - 17 * zoom;
      let bIdx = 0;
      for (
        let jx = bX - 17 * zoom + bldgStoneBlockW + stagger;
        jx < bX;
        jx += bldgStoneBlockW
      ) {
        const shade = (bldgBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (bX - 17 * zoom);
          const xOff2 = jx - (bX - 17 * zoom);
          const yB1 = bY + xOff1 * bldgLeftSlope;
          const yB2 = bY + xOff2 * bldgLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * bldgStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * bldgStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on main building - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX, bY - 25 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY - 32 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY);
    ctx.lineTo(bX, bY + 7 * zoom);
    ctx.closePath();
    ctx.clip();

    const bldgRightSlope = -7 / 17;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < bldgStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 7 * zoom - r * bldgStoneRowH);
      ctx.lineTo(bX + 17 * zoom, bY - r * bldgStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      for (
        let jx = bX + bldgStoneBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += bldgStoneBlockW
      ) {
        const xOff = jx - bX;
        const yBase = bY + 7 * zoom + xOff * bldgRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * bldgStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * bldgStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      let prevX = bX;
      let bIdx = 0;
      for (
        let jx = bX + bldgStoneBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += bldgStoneBlockW
      ) {
        const shade = (bldgBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - bX;
          const xOff2 = jx - bX;
          const yB1 = bY + 7 * zoom + xOff1 * bldgRightSlope;
          const yB2 = bY + 7 * zoom + xOff2 * bldgRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * bldgStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * bldgStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // === HIGH-TECH: Power conduits on walls ===
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 17 * zoom, bY - 4 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY - 28 * zoom);
    ctx.stroke();
    // Power nodes with glow
    const powerGlow = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = `rgba(255, 108, 0, ${powerGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 17 * zoom,
        bY - 8 * zoom - i * 8 * zoom,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Crenellated battlements on top
    const crenY = bY - 32 * zoom;
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 12 * zoom + i * 6 * zoom,
          crenY,
          5,
          4,
          5,
          { top: "#8a8a92", left: "#6a6a72", right: "#5a5a62" },
          zoom,
        );
      }
    }

    // Arched stone doorway
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.moveTo(bX - 12 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 12 * zoom, bY - 14 * zoom);
    ctx.arc(bX - 8 * zoom, bY - 14 * zoom, 4 * zoom, Math.PI, 0);
    ctx.lineTo(bX - 4 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Arch stones
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 8 * zoom, bY - 14 * zoom, 4 * zoom, Math.PI, 0);
    ctx.stroke();
    // Door reinforcement
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 11 * zoom, bY - 8 * zoom);
    ctx.lineTo(bX - 5 * zoom, bY - 7 * zoom);
    ctx.stroke();

    // Gothic arrow slit windows (isometric, flush against right wall face)
    const slitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 6 * zoom,
      bY - 17 * zoom,
      2,
      8,
      "right",
      zoom,
      "rgba(255, 150, 50",
      slitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 11 * zoom,
      bY - 19 * zoom,
      2,
      8,
      "right",
      zoom,
      "rgba(255, 150, 50",
      slitGlow,
    );

    // === HIGH-TECH: Rotating radar/beacon on tower ===
    const beaconAngle = time * 2;
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 12 * zoom);
    ctx.lineTo(
      towerX + Math.cos(beaconAngle) * 5 * zoom,
      tRoofY - 12 * zoom + Math.sin(beaconAngle) * 2.5 * zoom,
    );
    ctx.stroke();

    // Garrison pennant on main building (triangular)
    const bannerWave2 = Math.sin(time * 3) * 2;
    const gpX = bX - 12 * zoom;
    const gpPoleBot = crenY + 2 * zoom;
    const gpPoleTop = crenY - 16 * zoom;
    const gpTop = gpPoleTop + 1 * zoom;
    const gpBot = gpPoleTop + 13 * zoom;
    const gpIsoD = 1.5 * zoom;
    // Pole with isometric depth (drawn first, behind flag)
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(gpX - 1 * zoom, gpPoleBot);
    ctx.lineTo(gpX - 1 * zoom, gpPoleTop);
    ctx.lineTo(gpX + 1 * zoom, gpPoleTop);
    ctx.lineTo(gpX + 1 * zoom, gpPoleBot);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(gpX + 1 * zoom, gpPoleTop);
    ctx.lineTo(gpX + 1 * zoom + gpIsoD * 0.5, gpPoleTop - gpIsoD * 0.25);
    ctx.lineTo(gpX + 1 * zoom + gpIsoD * 0.5, gpPoleBot - gpIsoD * 0.25);
    ctx.lineTo(gpX + 1 * zoom, gpPoleBot);
    ctx.closePath();
    ctx.fill();
    // Finial
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(gpX, gpPoleTop - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Back face for depth
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(gpX + gpIsoD, gpTop - gpIsoD * 0.5);
    ctx.quadraticCurveTo(
      gpX + 7 * zoom + bannerWave2 * 0.6 + gpIsoD,
      gpTop + 4.5 * zoom - gpIsoD * 0.5,
      gpX + 12 * zoom + bannerWave2 * 0.5 + gpIsoD,
      gpTop + 6 * zoom - gpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      gpX + 7 * zoom + bannerWave2 * 0.4 + gpIsoD,
      gpTop + 7.5 * zoom - gpIsoD * 0.5,
      gpX + gpIsoD,
      gpBot - gpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(gpX, gpTop);
    ctx.quadraticCurveTo(
      gpX + 7 * zoom + bannerWave2 * 0.6,
      gpTop + 4.5 * zoom,
      gpX + 12 * zoom + bannerWave2 * 0.5,
      gpTop + 6 * zoom,
    );
    ctx.quadraticCurveTo(
      gpX + 7 * zoom + bannerWave2 * 0.4,
      gpTop + 7.5 * zoom,
      gpX,
      gpBot,
    );
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(gpX + 3 * zoom + bannerWave2 * 0.2, gpTop + 1.5 * zoom);
    ctx.quadraticCurveTo(
      gpX + 5 * zoom + bannerWave2 * 0.4,
      gpTop + 6 * zoom,
      gpX + 3 * zoom + bannerWave2 * 0.2,
      gpBot - 1.5 * zoom,
    );
    ctx.stroke();

    // === Mechanical gears on side ===
    const gearX = bX - 17 * zoom;
    const gearY = bY - 20 * zoom;
    // Large gear
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.3;
      const r = i % 2 === 0 ? 4 * zoom : 3 * zoom;
      const x = gearX + Math.cos(angle) * r;
      const y = gearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Small interlocking gear
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - time * 0.4;
      const r = i % 2 === 0 ? 2.5 * zoom : 1.8 * zoom;
      const x = gearX + 5 * zoom + Math.cos(angle) * r;
      const y = gearY + 2.5 * zoom + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Gear centers
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(gearX, gearY, 1.5 * zoom, 0.75 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      gearX + 5 * zoom,
      gearY + 2.5 * zoom,
      1 * zoom,
      0.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // (Sign removed)
  } else if (tower.level === 3) {
    // ========== LEVEL 3: FORTRESS - Industrial Castle ==========
    const bX = stationX;
    const bY = stationY;

    // === FOUNDATION - Industrial fortress base (extends lower) ===
    drawIsometricPrism(
      ctx,
      bX,
      bY + 2 * zoom,
      42,
      40,
      4,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // Foundation stone mortar lines - left face
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = 1; i <= 2; i++) {
      const h = (i * 4 * zoom) / 3;
      ctx.beginPath();
      ctx.moveTo(bX - 21 * zoom, bY + 2 * zoom - h);
      ctx.lineTo(bX, bY + 12 * zoom - h);
      ctx.stroke();
    }
    // Foundation stone mortar lines - right face
    for (let i = 1; i <= 2; i++) {
      const h = (i * 4 * zoom) / 3;
      ctx.beginPath();
      ctx.moveTo(bX, bY + 12 * zoom - h);
      ctx.lineTo(bX + 21 * zoom, bY + 2 * zoom - h);
      ctx.stroke();
    }

    // Heavy machinery in foundation - gear system
    const fGearX = bX + 14 * zoom;
    const fGearY = bY + 9 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.2;
      const r = i % 2 === 0 ? 4 * zoom : 3 * zoom;
      const x = fGearX + Math.cos(angle) * r;
      const y = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 1.5 * zoom, 0.75 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam exhaust vents
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const fSteam = 0.35 + Math.sin(time * 4) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${fSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX - 14 * zoom + Math.sin(time * 2) * 2,
      bY + 5 * zoom,
      3.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Power conduit running along foundation
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX + 18 * zoom, bY + 6 * zoom);
    ctx.stroke();
    // Conduit energy nodes
    const cGlow = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${cGlow})`;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 12 * zoom + i * 10 * zoom,
        bY + 9 * zoom - i * 0.8 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Right clock tower (taller) with machinery
    const rtX = bX + 18 * zoom;
    const rtY = bY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      rtX,
      rtY,
      12,
      10,
      48,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // Stone block texture on right tower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX - 6 * zoom, rtY - 48 * zoom);
    ctx.lineTo(rtX, rtY - 45.5 * zoom);
    ctx.lineTo(rtX, rtY + 2.5 * zoom);
    ctx.lineTo(rtX - 6 * zoom, rtY);
    ctx.closePath();
    ctx.clip();

    const rtStoneRows = 10;
    const rtStoneRowH = (48 * zoom) / rtStoneRows;
    const rtLeftSlope = 2.5 / 6;
    const rtBlockW = 4 * zoom;
    const rtBlockSeed = [2, 5, 1, 6, 3, 0, 4];

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < rtStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX - 6 * zoom, rtY - r * rtStoneRowH);
      ctx.lineTo(rtX, rtY + 2.5 * zoom - r * rtStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      for (
        let jx = rtX - 6 * zoom + rtBlockW + stagger;
        jx < rtX;
        jx += rtBlockW
      ) {
        const xOff = jx - (rtX - 6 * zoom);
        const yBase = rtY + xOff * rtLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      let prevX = rtX - 6 * zoom;
      let bIdx = 0;
      for (
        let jx = rtX - 6 * zoom + rtBlockW + stagger;
        jx < rtX;
        jx += rtBlockW
      ) {
        const shade = (rtBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (rtX - 6 * zoom);
          const xOff2 = jx - (rtX - 6 * zoom);
          const yB1 = rtY + xOff1 * rtLeftSlope;
          const yB2 = rtY + xOff2 * rtLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on right tower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX, rtY - 45.5 * zoom);
    ctx.lineTo(rtX + 6 * zoom, rtY - 48 * zoom);
    ctx.lineTo(rtX + 6 * zoom, rtY);
    ctx.lineTo(rtX, rtY + 2.5 * zoom);
    ctx.closePath();
    ctx.clip();

    const rtRightSlope = -2.5 / 6;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < rtStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX, rtY + 2.5 * zoom - r * rtStoneRowH);
      ctx.lineTo(rtX + 6 * zoom, rtY - r * rtStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      for (
        let jx = rtX + rtBlockW + stagger;
        jx < rtX + 6 * zoom;
        jx += rtBlockW
      ) {
        const xOff = jx - rtX;
        const yBase = rtY + 2.5 * zoom + xOff * rtRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      let prevX = rtX;
      let bIdx = 0;
      for (
        let jx = rtX + rtBlockW + stagger;
        jx < rtX + 6 * zoom;
        jx += rtBlockW
      ) {
        const shade = (rtBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - rtX;
          const xOff2 = jx - rtX;
          const yB1 = rtY + 2.5 * zoom + xOff1 * rtRightSlope;
          const yB2 = rtY + 2.5 * zoom + xOff2 * rtRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Main keep (central building)
    drawIsometricPrism(
      ctx,
      bX,
      bY - 1 * zoom,
      32,
      30,
      32,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Stone block texture on main keep - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 16 * zoom, bY - 33 * zoom);
    ctx.lineTo(bX, bY - 25.5 * zoom);
    ctx.lineTo(bX, bY + 6.5 * zoom);
    ctx.lineTo(bX - 16 * zoom, bY - zoom);
    ctx.closePath();
    ctx.clip();

    const stoneRows = 7;
    const stoneRowH = (32 * zoom) / stoneRows;
    const leftIsoSlope = 7.5 / 16;
    const stoneBlockW = 5.5 * zoom;

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 16 * zoom, bY - zoom - r * stoneRowH);
      ctx.lineTo(bX, bY + 6.5 * zoom - r * stoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      for (
        let jx = bX - 16 * zoom + stoneBlockW + stagger;
        jx < bX;
        jx += stoneBlockW
      ) {
        const xOff = jx - (bX - 16 * zoom);
        const yBase = bY - zoom + xOff * leftIsoSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stoneRowH);
        ctx.stroke();
      }
    }
    const blockSeed = [2, 5, 1, 6, 3, 0, 4];
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      let prevX = bX - 16 * zoom;
      let bIdx = 0;
      for (
        let jx = bX - 16 * zoom + stoneBlockW + stagger;
        jx < bX;
        jx += stoneBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (bX - 16 * zoom);
          const xOff2 = jx - (bX - 16 * zoom);
          const yB1 = bY - zoom + xOff1 * leftIsoSlope;
          const yB2 = bY - zoom + xOff2 * leftIsoSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on main keep - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX, bY - 25.5 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - 33 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - zoom);
    ctx.lineTo(bX, bY + 6.5 * zoom);
    ctx.closePath();
    ctx.clip();

    const rightIsoSlope = -7.5 / 16;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 6.5 * zoom - r * stoneRowH);
      ctx.lineTo(bX + 16 * zoom, bY - zoom - r * stoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      for (
        let jx = bX + stoneBlockW + stagger;
        jx < bX + 16 * zoom;
        jx += stoneBlockW
      ) {
        const xOff = jx - bX;
        const yBase = bY + 6.5 * zoom + xOff * rightIsoSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      let prevX = bX;
      let bIdx = 0;
      for (
        let jx = bX + stoneBlockW + stagger;
        jx < bX + 16 * zoom;
        jx += stoneBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - bX;
          const xOff2 = jx - bX;
          const yB1 = bY + 6.5 * zoom + xOff1 * rightIsoSlope;
          const yB2 = bY + 6.5 * zoom + xOff2 * rightIsoSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Gothic arrow slit windows on main keep (isometric, flush against wall faces)
    const keepSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 6 * zoom,
      bY - 14 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 12 * zoom,
      bY - 17 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 6 * zoom,
      bY - 14 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 12 * zoom,
      bY - 17 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );

    // Heavy battlements on main keep
    const keepTop = bY - 32.5 * zoom;
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 8 * zoom + i * 4.5 * zoom,
          keepTop,
          5,
          4,
          5,
          { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
          zoom,
        );
      }
    }

    // Left corner tower
    const ltX = bX - 16 * zoom;
    const ltY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      ltX,
      ltY,
      10,
      8,
      42,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );
    // Stone block texture on left tower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX - 5 * zoom, ltY - 42 * zoom);
    ctx.lineTo(ltX, ltY - 40 * zoom);
    ctx.lineTo(ltX, ltY + 2 * zoom);
    ctx.lineTo(ltX - 5 * zoom, ltY);
    ctx.closePath();
    ctx.clip();

    const ltStoneRows = 9;
    const ltStoneRowH = (42 * zoom) / ltStoneRows;
    const ltLeftSlope = 2 / 5;
    const ltBlockW = 3.5 * zoom;
    const ltBlockSeed = [2, 5, 1, 6, 3, 0, 4];

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < ltStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX - 5 * zoom, ltY - r * ltStoneRowH);
      ctx.lineTo(ltX, ltY + 2 * zoom - r * ltStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      for (
        let jx = ltX - 5 * zoom + ltBlockW + stagger;
        jx < ltX;
        jx += ltBlockW
      ) {
        const xOff = jx - (ltX - 5 * zoom);
        const yBase = ltY + xOff * ltLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      let prevX = ltX - 5 * zoom;
      let bIdx = 0;
      for (
        let jx = ltX - 5 * zoom + ltBlockW + stagger;
        jx < ltX;
        jx += ltBlockW
      ) {
        const shade = (ltBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (ltX - 5 * zoom);
          const xOff2 = jx - (ltX - 5 * zoom);
          const yB1 = ltY + xOff1 * ltLeftSlope;
          const yB2 = ltY + xOff2 * ltLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on left tower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX, ltY - 40 * zoom);
    ctx.lineTo(ltX + 5 * zoom, ltY - 42 * zoom);
    ctx.lineTo(ltX + 5 * zoom, ltY);
    ctx.lineTo(ltX, ltY + 2 * zoom);
    ctx.closePath();
    ctx.clip();

    const ltRightSlope = -2 / 5;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < ltStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX, ltY + 2 * zoom - r * ltStoneRowH);
      ctx.lineTo(ltX + 5 * zoom, ltY - r * ltStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      for (
        let jx = ltX + ltBlockW + stagger;
        jx < ltX + 5 * zoom;
        jx += ltBlockW
      ) {
        const xOff = jx - ltX;
        const yBase = ltY + 2 * zoom + xOff * ltRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      let prevX = ltX;
      let bIdx = 0;
      for (
        let jx = ltX + ltBlockW + stagger;
        jx < ltX + 5 * zoom;
        jx += ltBlockW
      ) {
        const shade = (ltBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - ltX;
          const xOff2 = jx - ltX;
          const yB1 = ltY + 2 * zoom + xOff1 * ltRightSlope;
          const yB2 = ltY + 2 * zoom + xOff2 * ltRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();
    // Tower top conical roof
    const ltRoofY = ltY - 42 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX - 6 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Roof tile texture - left tower
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i * 0.2;
      ctx.beginPath();
      ctx.moveTo(ltX - t * 6 * zoom, ltRoofY - 12 * zoom + t * 12 * zoom);
      ctx.lineTo(ltX, ltRoofY - 12 * zoom + t * 15 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ltX, ltRoofY - 12 * zoom + t * 15 * zoom);
      ctx.lineTo(ltX + t * 6 * zoom, ltRoofY - 12 * zoom + t * 12 * zoom);
      ctx.stroke();
    }
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.stroke();
    // Pennant on left tower (triangular, matching level 2 style)
    const flagWave = Math.sin(time * 3) * 2;
    const fp3X = ltX;
    const fp3Top = ltRoofY - 24 * zoom;
    const fp3Bot = ltRoofY - 14 * zoom;
    const fp3IsoD = 1.5 * zoom;
    // Back face for depth
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(fp3X + fp3IsoD, fp3Top - fp3IsoD * 0.5);
    ctx.quadraticCurveTo(
      fp3X + 6 * zoom + flagWave * 0.6 + fp3IsoD,
      fp3Top + 3.5 * zoom - fp3IsoD * 0.5,
      fp3X + 10 * zoom + flagWave * 0.5 + fp3IsoD,
      fp3Top + 5 * zoom - fp3IsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      fp3X + 6 * zoom + flagWave * 0.4 + fp3IsoD,
      fp3Top + 6.5 * zoom - fp3IsoD * 0.5,
      fp3X + fp3IsoD,
      fp3Bot - fp3IsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(fp3X, fp3Top);
    ctx.quadraticCurveTo(
      fp3X + 6 * zoom + flagWave * 0.6,
      fp3Top + 3.5 * zoom,
      fp3X + 10 * zoom + flagWave * 0.5,
      fp3Top + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      fp3X + 6 * zoom + flagWave * 0.4,
      fp3Top + 6.5 * zoom,
      fp3X,
      fp3Bot,
    );
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(fp3X + 3 * zoom + flagWave * 0.2, fp3Top + 1.5 * zoom);
    ctx.quadraticCurveTo(
      fp3X + 5 * zoom + flagWave * 0.4,
      fp3Top + 5 * zoom,
      fp3X + 3 * zoom + flagWave * 0.2,
      fp3Bot - 1.5 * zoom,
    );
    ctx.stroke();
    // Pole with isometric depth
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(fp3X - 1 * zoom, fp3Bot + 2 * zoom);
    ctx.lineTo(fp3X - 1 * zoom, fp3Top - 2 * zoom);
    ctx.lineTo(fp3X + 1 * zoom, fp3Top - 2 * zoom);
    ctx.lineTo(fp3X + 1 * zoom, fp3Bot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(fp3X + 1 * zoom, fp3Top - 2 * zoom);
    ctx.lineTo(
      fp3X + 1 * zoom + fp3IsoD * 0.5,
      fp3Top - 2 * zoom - fp3IsoD * 0.25,
    );
    ctx.lineTo(
      fp3X + 1 * zoom + fp3IsoD * 0.5,
      fp3Bot + 2 * zoom - fp3IsoD * 0.25,
    );
    ctx.lineTo(fp3X + 1 * zoom, fp3Bot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Finial
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(fp3X, fp3Top - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Tower gears
    const tGearX = rtX - 3 * zoom;
    const tGearY = rtY - 18 * zoom;
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      const r = i % 2 === 0 ? 3.5 * zoom : 2.5 * zoom;
      const x = tGearX + Math.cos(angle) * r;
      const y = tGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Tower spire
    const rtRoofY = rtY - 48 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX - 7 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Roof tile texture - right tower spire
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i * 0.2;
      ctx.beginPath();
      ctx.moveTo(rtX - t * 7 * zoom, rtRoofY - 16 * zoom + t * 16 * zoom);
      ctx.lineTo(rtX, rtRoofY - 16 * zoom + t * 19 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rtX, rtRoofY - 16 * zoom + t * 19 * zoom);
      ctx.lineTo(rtX + t * 7 * zoom, rtRoofY - 16 * zoom + t * 16 * zoom);
      ctx.stroke();
    }
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.stroke();
    // Bronze finial
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    ctx.arc(rtX, rtRoofY - 18 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(rtX - 1 * zoom, rtRoofY - 24 * zoom, 2 * zoom, 8 * zoom);

    // Clock on right tower (no numerals)
    drawClockFace(rtX + 1 * zoom, rtY - 36 * zoom, 6 * zoom);

    // Grand portcullis entrance
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.moveTo(bX - 7 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 7 * zoom, bY - 16 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 16 * zoom, 5 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 3 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Portcullis bars
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 7 * zoom + i * 3 * zoom, bY - 2 * zoom);
      ctx.lineTo(bX - 7 * zoom + i * 3 * zoom, bY - 16 * zoom + i * 0.6 * zoom);
      ctx.stroke();
    }
    // Horizontal bar
    ctx.beginPath();
    ctx.moveTo(bX - 8 * zoom, bY - 8 * zoom);
    ctx.lineTo(bX + 2 * zoom, bY - 6 * zoom);
    ctx.stroke();

    // Rose window above entrance (glowing)
    const roseGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${roseGlow})`;
    ctx.beginPath();
    ctx.arc(bX - 3 * zoom, bY - 26 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Rose window frame
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // (Sign removed)
  } else if (tower.level === 4 && tower.upgrade === "A") {
    // ========== LEVEL 4A: CENTAUR STABLES - Grand Archer's Training Grounds ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION - Stone with brass pipes (extends lower) ===
    drawIsometricPrism(
      ctx,
      bX,
      bY + 16 * zoom,
      44,
      38,
      12,
      { top: "#8a7a6a", left: "#7a6a5a", right: "#6a5a4a" },
      zoom,
    );

    // Stone mortar lines on foundation - left face (more visible, matching L4B)
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.9 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 22 * zoom, bY + 4 * zoom + r * 3 * zoom);
      ctx.lineTo(bX, bY + 14 * zoom + r * 3 * zoom);
      ctx.stroke();
    }
    // Stone mortar lines on foundation - right face
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 14 * zoom + r * 3 * zoom);
      ctx.lineTo(bX + 22 * zoom, bY + 4 * zoom + r * 3 * zoom);
      ctx.stroke();
    }

    // Staggered vertical mortar joints - left face (stronger visibility)
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    const l4aBlockW = 4 * zoom;
    for (let r = 0; r < 3; r++) {
      const stagger = (r % 2) * (l4aBlockW * 0.5);
      for (let j = 0; j < 6; j++) {
        const jx = bX - 20 * zoom + stagger + j * l4aBlockW;
        if (jx < bX - 1 * zoom) {
          const xOff = jx - (bX - 22 * zoom);
          const yBase = bY + 4 * zoom + xOff * (10 / 22);
          ctx.beginPath();
          ctx.moveTo(jx, yBase + r * 3 * zoom);
          ctx.lineTo(jx, yBase + (r + 1) * 3 * zoom);
          ctx.stroke();
        }
      }
    }
    // Staggered vertical mortar joints - right face
    for (let r = 0; r < 3; r++) {
      const stagger = (r % 2) * (l4aBlockW * 0.5);
      for (let j = 0; j < 6; j++) {
        const jx = bX + 2 * zoom + stagger + j * l4aBlockW;
        if (jx < bX + 21 * zoom) {
          const xOff = jx - bX;
          const yBase = bY + 14 * zoom - xOff * (10 / 22);
          ctx.beginPath();
          ctx.moveTo(jx, yBase + r * 3 * zoom);
          ctx.lineTo(jx, yBase + (r + 1) * 3 * zoom);
          ctx.stroke();
        }
      }
    }

    // Pseudo-random stone block shading (lighter/darker alternating blocks for depth)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 4 * zoom);
    ctx.lineTo(bX, bY + 14 * zoom);
    ctx.lineTo(bX, bY + 26 * zoom);
    ctx.lineTo(bX - 22 * zoom, bY + 16 * zoom);
    ctx.closePath();
    ctx.clip();
    for (let r = 0; r < 3; r++) {
      for (let j = 0; j < 6; j++) {
        if ((r + j) % 3 === 0) {
          ctx.fillStyle = "rgba(255,240,200,0.06)";
          const jx =
            bX - 20 * zoom + (r % 2) * (l4aBlockW * 0.5) + j * l4aBlockW;
          const xOff = jx - (bX - 22 * zoom);
          const yTop = bY + 4 * zoom + xOff * (10 / 22) + r * 3 * zoom;
          ctx.fillRect(jx, yTop, l4aBlockW, 3 * zoom);
        }
      }
    }
    ctx.restore();

    // Upper gold trim band - left face
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 21 * zoom, bY + 6 * zoom);
    ctx.lineTo(bX + 2 * zoom, bY + 15.5 * zoom);
    ctx.stroke();
    // Upper gold trim band - right face
    ctx.beginPath();
    ctx.moveTo(bX - 2 * zoom, bY + 15.5 * zoom);
    ctx.lineTo(bX + 21 * zoom, bY + 6 * zoom);
    ctx.stroke();

    // Lower brass trim band - left face
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 12 * zoom);
    ctx.lineTo(bX + 4 * zoom, bY + 22 * zoom);
    ctx.stroke();
    // Lower brass trim band - right face
    ctx.beginPath();
    ctx.moveTo(bX - 2 * zoom, bY + 22 * zoom);
    ctx.lineTo(bX + 20 * zoom, bY + 12 * zoom);
    ctx.stroke();

    // Decorative rivets along upper trim - left face
    ctx.fillStyle = "#c9a227";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 17 * zoom + i * 5 * zoom,
        bY + 7 * zoom + i * 1.2 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Decorative rivets along lower trim - right face
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 1 * zoom + i * 4 * zoom,
        bY + 21 * zoom - i * 1.2 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Steam pipes running along foundation
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX - 22 * zoom, bY - 12 * zoom);
    ctx.quadraticCurveTo(
      bX - 22 * zoom,
      bY - 18 * zoom,
      bX - 16 * zoom,
      bY - 18 * zoom,
    );
    ctx.stroke();
    // Pipe joints
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(bX - 22 * zoom, bY + 10 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 22 * zoom, bY - 12 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Large animated gear cluster
    const fGearX = bX + 18 * zoom;
    const fGearY = bY + 8 * zoom;
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.25;
      const r = i % 2 === 0 ? 5 * zoom : 3.8 * zoom;
      const gx = fGearX + Math.cos(angle) * r;
      const gy = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Interlocking gears
    const fGear2X = fGearX - 7 * zoom;
    const fGear2Y = fGearY + 3 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - time * 0.35;
      const r = i % 2 === 0 ? 3.5 * zoom : 2.5 * zoom;
      const gx = fGear2X + Math.cos(angle) * r;
      const gy = fGear2Y + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();

    // Steam vents with animated puffs
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const steamPuff = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${steamPuff})`;
    ctx.beginPath();
    ctx.arc(
      bX - 14 * zoom + Math.sin(time * 2) * 2,
      bY + 4 * zoom,
      4 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(180, 180, 180, ${steamPuff * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      bX - 13 * zoom + Math.sin(time * 2.5) * 2,
      bY - 2 * zoom,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // === LEFT HORSE STABLE ===
    const lwX = bX - 16 * zoom;
    const lwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      lwX,
      lwY,
      14,
      12,
      22,
      { top: "#9b7b5b", left: "#8b6b4b", right: "#7b5b3b" },
      zoom,
    );
    // Gothic windows on left stable
    const lwSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      lwX + 4 * zoom,
      lwY - 10 * zoom,
      2,
      7,
      "right",
      zoom,
      "rgba(255, 180, 80",
      lwSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      lwX - 4 * zoom,
      lwY - 10 * zoom,
      2,
      7,
      "left",
      zoom,
      "rgba(255, 180, 80",
      lwSlitGlow,
    );
    // Stable roof
    drawSlopedRoof(
      lwX,
      lwY - 22 * zoom,
      18,
      15,
      10,
      "#6a5030",
      "#5a4020",
      "#7a6040",
    );
    // Stable door
    ctx.fillStyle = "#4a3015";
    ctx.fillRect(lwX - 5 * zoom, lwY - 14 * zoom, 8 * zoom, 14 * zoom);
    ctx.strokeStyle = "#3a2005";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(lwX - 4.5 * zoom, lwY - 13.5 * zoom, 7 * zoom, 6 * zoom);
    // Horse head
    ctx.fillStyle = "#c9a868";
    ctx.beginPath();
    ctx.ellipse(
      lwX - 1 * zoom,
      lwY - 10 * zoom,
      3 * zoom,
      2.5 * zoom,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(lwX + 0.5 * zoom, lwY - 10.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Brass horseshoe
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      lwX - 1 * zoom,
      lwY - 18 * zoom,
      3 * zoom,
      0.3 * Math.PI,
      0.7 * Math.PI,
      true,
    );
    ctx.stroke();
    // Orange pennant on stable
    const lwFlagWave = Math.sin(time * 4) * 2;
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(lwX + 2 * zoom, lwY - 30 * zoom);
    ctx.lineTo(lwX + 2 * zoom, lwY - 38 * zoom);
    ctx.quadraticCurveTo(
      lwX + 8 * zoom + lwFlagWave,
      lwY - 36 * zoom,
      lwX + 10 * zoom + lwFlagWave,
      lwY - 34 * zoom,
    );
    ctx.lineTo(lwX + 2 * zoom, lwY - 34 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(lwX + 1 * zoom, lwY - 40 * zoom, 2 * zoom, 12 * zoom);

    // === RIGHT HORSE STABLE ===
    const rwX = bX + 18 * zoom;
    const rwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      rwX,
      rwY,
      14,
      12,
      22,
      { top: "#9b7b5b", left: "#8b6b4b", right: "#7b5b3b" },
      zoom,
    );
    // Gothic windows on right stable
    drawIsoGothicWindow(
      ctx,
      rwX + 4 * zoom,
      rwY - 10 * zoom,
      2,
      7,
      "right",
      zoom,
      "rgba(255, 180, 80",
      lwSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      rwX - 4 * zoom,
      rwY - 10 * zoom,
      2,
      7,
      "left",
      zoom,
      "rgba(255, 180, 80",
      lwSlitGlow,
    );
    drawSlopedRoof(
      rwX,
      rwY - 22 * zoom,
      18,
      15,
      10,
      "#6a5030",
      "#5a4020",
      "#7a6040",
    );
    ctx.fillStyle = "#4a3015";
    ctx.fillRect(rwX - 2 * zoom, rwY - 14 * zoom, 8 * zoom, 14 * zoom);
    // Horse head
    ctx.fillStyle = "#8b6b4b";
    ctx.beginPath();
    ctx.ellipse(
      rwX + 2 * zoom,
      rwY - 10 * zoom,
      3 * zoom,
      2.5 * zoom,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(rwX + 3.5 * zoom, rwY - 10.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Orange pennant
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(rwX - 2 * zoom, rwY - 30 * zoom);
    ctx.lineTo(rwX - 2 * zoom, rwY - 38 * zoom);
    ctx.quadraticCurveTo(
      rwX + 4 * zoom + lwFlagWave,
      rwY - 36 * zoom,
      rwX + 6 * zoom + lwFlagWave,
      rwY - 34 * zoom,
    );
    ctx.lineTo(rwX - 2 * zoom, rwY - 34 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rwX - 3 * zoom, rwY - 40 * zoom, 2 * zoom, 12 * zoom);

    // === MAIN BUILDING - Gilded Archery Hall ===
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      30,
      24,
      34,
      { top: "#a08060", left: "#907050", right: "#806040" },
      zoom,
    );

    // Gothic windows on main building
    const hallSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 5 * zoom,
      bY - 12 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 180, 80",
      hallSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 11 * zoom,
      bY - 15 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 180, 80",
      hallSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 5 * zoom,
      bY - 12 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 180, 80",
      hallSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 11 * zoom,
      bY - 15 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 180, 80",
      hallSlitGlow,
    );

    // Vertical wood planks
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 12 * zoom + i * 4 * zoom, bY - 2 * zoom);
      ctx.lineTo(bX - 12 * zoom + i * 4 * zoom, bY - 32 * zoom);
      ctx.stroke();
    }

    // Brass bands
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 13 * zoom, bY - 8 * zoom - i * 10 * zoom);
      ctx.lineTo(bX + 2 * zoom, bY - 5 * zoom - i * 10 * zoom);
      ctx.stroke();
    }

    // Decorative bow emblem on wall
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      bX - 5 * zoom,
      bY - 22 * zoom,
      5 * zoom,
      -Math.PI * 0.6,
      Math.PI * 0.6,
    );
    ctx.stroke();

    // === ORNATE STABLE ROOF with clay tiles ===
    const roofY = bY - 34 * zoom;
    const ridgeY = roofY - 20 * zoom;
    const eaveL = bX - 21 * zoom;
    const eaveR = bX + 21 * zoom;
    const eaveY = roofY + 2 * zoom;
    const gableY = roofY + 12 * zoom;

    // Eave underside shadow for depth
    ctx.fillStyle = "rgba(40,20,10,0.25)";
    ctx.beginPath();
    ctx.moveTo(eaveL, eaveY + 1.5 * zoom);
    ctx.lineTo(bX, gableY + 1.5 * zoom);
    ctx.lineTo(eaveR, eaveY + 1.5 * zoom);
    ctx.lineTo(bX, ridgeY);
    ctx.closePath();
    ctx.fill();

    // Left roof slope - reddish brown clay tiles
    ctx.fillStyle = "#8b4532";
    ctx.beginPath();
    ctx.moveTo(bX, ridgeY);
    ctx.lineTo(eaveL, eaveY);
    ctx.lineTo(bX, gableY);
    ctx.closePath();
    ctx.fill();

    // Right roof slope - darker shade
    ctx.fillStyle = "#6a3022";
    ctx.beginPath();
    ctx.moveTo(bX, ridgeY);
    ctx.lineTo(eaveR, eaveY);
    ctx.lineTo(bX, gableY);
    ctx.closePath();
    ctx.fill();

    // Clay tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      ctx.beginPath();
      ctx.moveTo(bX + (eaveL - bX) * t, ridgeY + (eaveY - ridgeY) * t);
      ctx.lineTo(bX, ridgeY + (gableY - ridgeY) * t);
      ctx.stroke();
    }

    // Clay tile row lines - right slope
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      ctx.beginPath();
      ctx.moveTo(bX, ridgeY + (gableY - ridgeY) * t);
      ctx.lineTo(bX + (eaveR - bX) * t, ridgeY + (eaveY - ridgeY) * t);
      ctx.stroke();
    }

    // Ridge cap - dark wooden beam along roof peak
    ctx.strokeStyle = "#2a0a00";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(eaveL + 2 * zoom, eaveY - zoom);
    ctx.lineTo(bX, ridgeY);
    ctx.lineTo(eaveR - 2 * zoom, eaveY - zoom);
    ctx.stroke();

    // Rafter tails at left eave
    ctx.strokeStyle = "#5a3018";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const rx = eaveL + (bX - eaveL) * t;
      const ry = eaveY + (gableY - eaveY) * t;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2 * zoom, ry + 2.5 * zoom);
      ctx.stroke();
    }

    // Rafter tails at right eave
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const rx = eaveR + (bX - eaveR) * t;
      const ry = eaveY + (gableY - eaveY) * t;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 2 * zoom, ry + 2.5 * zoom);
      ctx.stroke();
    }

    // Front gable wall (visible under roof overhang)
    ctx.fillStyle = "#a08060";
    ctx.beginPath();
    ctx.moveTo(bX, ridgeY + 4 * zoom);
    ctx.lineTo(bX - 7 * zoom, gableY);
    ctx.lineTo(bX + 7 * zoom, gableY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Hay loft door on front gable
    ctx.fillStyle = "#4a2510";
    ctx.beginPath();
    ctx.moveTo(bX - 2.5 * zoom, gableY - 1 * zoom);
    ctx.lineTo(bX - 2.5 * zoom, gableY - 6 * zoom);
    ctx.lineTo(bX, gableY - 8 * zoom);
    ctx.lineTo(bX + 2.5 * zoom, gableY - 6 * zoom);
    ctx.lineTo(bX + 2.5 * zoom, gableY - 1 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a1505";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Hay bale peeking out of loft door
    ctx.fillStyle = "#c9a848";
    ctx.beginPath();
    ctx.ellipse(bX, gableY - 2 * zoom, 2 * zoom, 1.2 * zoom, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#a08828";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 1 * zoom, gableY - 2.5 * zoom);
    ctx.lineTo(bX - 1 * zoom, gableY - 1 * zoom);
    ctx.moveTo(bX + 1 * zoom, gableY - 2.5 * zoom);
    ctx.lineTo(bX + 1 * zoom, gableY - 1 * zoom);
    ctx.stroke();

    // Cupola / ventilation tower on roof peak
    const cupX = bX;
    const cupY = ridgeY - 2 * zoom;
    ctx.fillStyle = "#5a3018";
    ctx.beginPath();
    ctx.moveTo(cupX - 3.5 * zoom, cupY + 5 * zoom);
    ctx.lineTo(cupX - 3 * zoom, cupY);
    ctx.lineTo(cupX + 3 * zoom, cupY);
    ctx.lineTo(cupX + 3.5 * zoom, cupY + 5 * zoom);
    ctx.closePath();
    ctx.fill();
    // Cupola vent openings
    ctx.fillStyle = "#2a1008";
    ctx.fillRect(cupX - 2 * zoom, cupY + 1 * zoom, 1.5 * zoom, 3 * zoom);
    ctx.fillRect(cupX + 0.5 * zoom, cupY + 1 * zoom, 1.5 * zoom, 3 * zoom);
    // Cupola peaked cap
    ctx.fillStyle = "#8b4532";
    ctx.beginPath();
    ctx.moveTo(cupX, cupY - 4 * zoom);
    ctx.lineTo(cupX - 4 * zoom, cupY);
    ctx.lineTo(cupX + 4 * zoom, cupY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a3022";
    ctx.beginPath();
    ctx.moveTo(cupX, cupY - 4 * zoom);
    ctx.lineTo(cupX + 4 * zoom, cupY);
    ctx.lineTo(cupX + 1 * zoom, cupY + 1 * zoom);
    ctx.closePath();
    ctx.fill();

    // Brass weathervane centaur on cupola
    ctx.fillStyle = "#c9a227";
    const vaneX = bX;
    const vaneY = cupY - 5 * zoom;
    ctx.fillRect(vaneX - 0.5 * zoom, vaneY, 1 * zoom, 5 * zoom);
    ctx.beginPath();
    ctx.ellipse(
      vaneX,
      vaneY - 3 * zoom,
      4 * zoom,
      2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(vaneX + 1.5 * zoom, vaneY - 5 * zoom);
    ctx.lineTo(vaneX + 0.5 * zoom, vaneY - 9 * zoom);
    ctx.lineTo(vaneX + 2.5 * zoom, vaneY - 8 * zoom);
    ctx.closePath();
    ctx.fill();

    // Main entrance
    ctx.fillStyle = "#3a2010";
    ctx.beginPath();
    ctx.moveTo(bX - 6 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 6 * zoom, bY - 18 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 18 * zoom, 4 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 2 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Interior glow
    const interiorGlow = 0.4 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(255, 180, 100, ${interiorGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 2 * zoom,
      bY - 10 * zoom,
      3 * zoom,
      6 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Brass arch trim
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 2 * zoom, bY - 18 * zoom, 4.5 * zoom, Math.PI, 0);
    ctx.stroke();

    // Pressure gauge on wall
    const gaugeX = bX + 22 * zoom;
    const gaugeY = bY - 18 * zoom;
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0f0e8";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    const needleAngle = Math.PI + Math.sin(time * 2) * 0.4 + Math.PI * 0.6;
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(
      gaugeX + Math.cos(needleAngle) * 2.5 * zoom,
      gaugeY + Math.sin(needleAngle) * 2.5 * zoom,
    );
    ctx.stroke();

    // Hay bale
    ctx.fillStyle = "#d4a017";
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 8 * zoom,
      5 * zoom,
      3.5 * zoom,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#a08010";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // (sign removed)
  } else {
    // ========== LEVEL 4B: ROYAL CAVALRY FORTRESS - Orange Royal Military Stronghold ==========
    const bX = stationX;
    const bY = stationY;

    // === FOUNDATION - Royal armored base with orange trim (extends lower) ===
    drawIsometricPrism(
      ctx,
      bX,
      bY + 16 * zoom,
      46,
      40,
      12,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // Stone mortar lines on foundation - left face
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 23 * zoom, bY + 4 * zoom + r * 3 * zoom);
      ctx.lineTo(bX, bY + 14 * zoom + r * 3 * zoom);
      ctx.stroke();
    }
    // Stone mortar lines on foundation - right face
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 14 * zoom + r * 3 * zoom);
      ctx.lineTo(bX + 23 * zoom, bY + 4 * zoom + r * 3 * zoom);
      ctx.stroke();
    }

    // Orange trim bands on foundation (isometric, both faces)
    const fndHW = 23 * zoom;
    const fndFD = 10 * zoom;
    const fndBandH = 2.5 * zoom;
    const fndBandY = 12 * zoom;
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(bX - fndHW, bY + fndBandY);
    ctx.lineTo(bX, bY + fndFD + fndBandY);
    ctx.lineTo(bX, bY + fndFD + fndBandY + fndBandH);
    ctx.lineTo(bX - fndHW, bY + fndBandY + fndBandH);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c04000";
    ctx.beginPath();
    ctx.moveTo(bX, bY + fndFD + fndBandY);
    ctx.lineTo(bX + fndHW, bY + fndBandY);
    ctx.lineTo(bX + fndHW, bY + fndBandY + fndBandH);
    ctx.lineTo(bX, bY + fndFD + fndBandY + fndBandH);
    ctx.closePath();
    ctx.fill();
    // Bronze rivets (less intense than gold)
    ctx.fillStyle = "#c9a227";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 17 * zoom + i * 5 * zoom,
        bY + 13 * zoom - i * 0.5 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // === SPEAR RACK (Left side - on platform) ===
    const spearRackX = bX - 20 * zoom;
    const spearRackY = bY + 6 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(
      spearRackX - 2 * zoom,
      spearRackY - 16 * zoom,
      4 * zoom,
      20 * zoom,
    );
    ctx.fillRect(
      spearRackX - 5 * zoom,
      spearRackY - 16 * zoom,
      10 * zoom,
      3 * zoom,
    );
    // Spears on rack
    for (let i = 0; i < 3; i++) {
      const sx = spearRackX - 3 * zoom + i * 3 * zoom;
      ctx.strokeStyle = "#6a5030";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, spearRackY - 14 * zoom);
      ctx.lineTo(sx, spearRackY - 30 * zoom);
      ctx.stroke();
      // Spear tips
      ctx.fillStyle = "#c0c0c0";
      ctx.beginPath();
      ctx.moveTo(sx, spearRackY - 33 * zoom);
      ctx.lineTo(sx - 2 * zoom, spearRackY - 28 * zoom);
      ctx.lineTo(sx + 2 * zoom, spearRackY - 28 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === LEFT HORSE STABLE ===
    const lwX = bX - 16 * zoom;
    const lwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      lwX,
      lwY,
      14,
      12,
      24,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom,
    );

    const stbRows = 5;
    const stbRowH = (24 * zoom) / stbRows;
    const stbBlockW = 3.5 * zoom;
    const blockSeed = [2, 5, 1, 6, 3, 0, 4];

    // Stone texture on left stable - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lwX - 7 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX, lwY - 21 * zoom);
    ctx.lineTo(lwX, lwY + 3 * zoom);
    ctx.lineTo(lwX - 7 * zoom, lwY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(lwX - 7 * zoom, lwY - r * stbRowH);
      ctx.lineTo(lwX, lwY + 3 * zoom - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = lwX - 7 * zoom + stbBlockW + stagger;
        jx < lwX;
        jx += stbBlockW
      ) {
        const xOff = jx - (lwX - 7 * zoom);
        const yBase = lwY + xOff * (3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = lwX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = lwX - 7 * zoom + stbBlockW + stagger;
        jx < lwX;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (lwX - 7 * zoom);
          const xOff2 = jx - (lwX - 7 * zoom);
          const yB1 = lwY + xOff1 * (3 / 7);
          const yB2 = lwY + xOff2 * (3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on left stable - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lwX, lwY - 21 * zoom);
    ctx.lineTo(lwX + 7 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX + 7 * zoom, lwY);
    ctx.lineTo(lwX, lwY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(lwX, lwY + 3 * zoom - r * stbRowH);
      ctx.lineTo(lwX + 7 * zoom, lwY - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = lwX + stbBlockW + stagger;
        jx < lwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const xOff = jx - lwX;
        const yBase = lwY + 3 * zoom + xOff * (-3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = lwX;
      let bIdx = 0;
      for (
        let jx = lwX + stbBlockW + stagger;
        jx < lwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - lwX;
          const xOff2 = jx - lwX;
          const yB1 = lwY + 3 * zoom + xOff1 * (-3 / 7);
          const yB2 = lwY + 3 * zoom + xOff2 * (-3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Left stable roof - left slope
    ctx.fillStyle = "#5a3a30";
    ctx.beginPath();
    ctx.moveTo(lwX, lwY - 36 * zoom);
    ctx.lineTo(lwX - 9 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX, lwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Left stable roof - right slope
    ctx.fillStyle = "#4a2a20";
    ctx.beginPath();
    ctx.moveTo(lwX, lwY - 36 * zoom);
    ctx.lineTo(lwX + 9 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX, lwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(lwX + -9 * zoom * t, lwY - 36 * zoom + 12 * zoom * t);
      ctx.lineTo(lwX, lwY - 36 * zoom + 15.75 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(lwX, lwY - 36 * zoom + 15.75 * zoom * t);
      ctx.lineTo(lwX + 9 * zoom * t, lwY - 36 * zoom + 12 * zoom * t);
      ctx.stroke();
    }
    // Ridge cap beam
    ctx.strokeStyle = "#2a0a00";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lwX - 9 * zoom + 2 * zoom, lwY - 24 * zoom - zoom);
    ctx.lineTo(lwX, lwY - 36 * zoom);
    ctx.lineTo(lwX + 9 * zoom - 2 * zoom, lwY - 24 * zoom - zoom);
    ctx.stroke();

    // Stable door
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(lwX - 5 * zoom, lwY - 16 * zoom, 8 * zoom, 16 * zoom);
    ctx.strokeStyle = "#e06000";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(lwX - 4.5 * zoom, lwY - 15.5 * zoom, 7 * zoom, 7 * zoom);
    // War horse head
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.ellipse(
      lwX - 1 * zoom,
      lwY - 11 * zoom,
      3.5 * zoom,
      2.8 * zoom,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Orange eye (subtle)
    ctx.fillStyle = "#e07000";
    ctx.beginPath();
    ctx.arc(lwX + 0.5 * zoom, lwY - 11.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Bronze horseshoe
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      lwX - 1 * zoom,
      lwY - 20 * zoom,
      3 * zoom,
      0.3 * Math.PI,
      0.7 * Math.PI,
      true,
    );
    ctx.stroke();
    // Pennant on left stable (triangular, matching level 2 style)
    const lwFlagWave = Math.sin(time * 3) * 2;
    const lwpX = lwX + 2 * zoom;
    const lwpTop = lwY - 44 * zoom;
    const lwpBot = lwY - 34 * zoom;
    const lwpIsoD = 1.5 * zoom;
    // Back face
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(lwpX + lwpIsoD, lwpTop - lwpIsoD * 0.5);
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.6 + lwpIsoD,
      lwpTop + 3.5 * zoom - lwpIsoD * 0.5,
      lwpX + 8 * zoom + lwFlagWave * 0.5 + lwpIsoD,
      lwpTop + 5 * zoom - lwpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.4 + lwpIsoD,
      lwpTop + 6.5 * zoom - lwpIsoD * 0.5,
      lwpX + lwpIsoD,
      lwpBot - lwpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(lwpX, lwpTop);
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.6,
      lwpTop + 3.5 * zoom,
      lwpX + 8 * zoom + lwFlagWave * 0.5,
      lwpTop + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.4,
      lwpTop + 6.5 * zoom,
      lwpX,
      lwpBot,
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(lwpX + 2.5 * zoom + lwFlagWave * 0.2, lwpTop + 1.5 * zoom);
    ctx.quadraticCurveTo(
      lwpX + 4 * zoom + lwFlagWave * 0.4,
      lwpTop + 5 * zoom,
      lwpX + 2.5 * zoom + lwFlagWave * 0.2,
      lwpBot - 1.5 * zoom,
    );
    ctx.stroke();
    // Pole with isometric depth
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(lwpX - 1 * zoom, lwpBot + 2 * zoom);
    ctx.lineTo(lwpX - 1 * zoom, lwpTop - 2 * zoom);
    ctx.lineTo(lwpX + 1 * zoom, lwpTop - 2 * zoom);
    ctx.lineTo(lwpX + 1 * zoom, lwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(lwpX + 1 * zoom, lwpTop - 2 * zoom);
    ctx.lineTo(
      lwpX + 1 * zoom + lwpIsoD * 0.5,
      lwpTop - 2 * zoom - lwpIsoD * 0.25,
    );
    ctx.lineTo(
      lwpX + 1 * zoom + lwpIsoD * 0.5,
      lwpBot + 2 * zoom - lwpIsoD * 0.25,
    );
    ctx.lineTo(lwpX + 1 * zoom, lwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(lwpX, lwpTop - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // === RIGHT HORSE STABLE ===
    const rwX = bX + 20 * zoom;
    const rwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      rwX,
      rwY,
      14,
      12,
      24,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom,
    );

    // Stone texture on right stable - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rwX - 7 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX, rwY - 21 * zoom);
    ctx.lineTo(rwX, rwY + 3 * zoom);
    ctx.lineTo(rwX - 7 * zoom, rwY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rwX - 7 * zoom, rwY - r * stbRowH);
      ctx.lineTo(rwX, rwY + 3 * zoom - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = rwX - 7 * zoom + stbBlockW + stagger;
        jx < rwX;
        jx += stbBlockW
      ) {
        const xOff = jx - (rwX - 7 * zoom);
        const yBase = rwY + xOff * (3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = rwX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = rwX - 7 * zoom + stbBlockW + stagger;
        jx < rwX;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (rwX - 7 * zoom);
          const xOff2 = jx - (rwX - 7 * zoom);
          const yB1 = rwY + xOff1 * (3 / 7);
          const yB2 = rwY + xOff2 * (3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on right stable - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rwX, rwY - 21 * zoom);
    ctx.lineTo(rwX + 7 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX + 7 * zoom, rwY);
    ctx.lineTo(rwX, rwY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rwX, rwY + 3 * zoom - r * stbRowH);
      ctx.lineTo(rwX + 7 * zoom, rwY - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = rwX + stbBlockW + stagger;
        jx < rwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const xOff = jx - rwX;
        const yBase = rwY + 3 * zoom + xOff * (-3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = rwX;
      let bIdx = 0;
      for (
        let jx = rwX + stbBlockW + stagger;
        jx < rwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - rwX;
          const xOff2 = jx - rwX;
          const yB1 = rwY + 3 * zoom + xOff1 * (-3 / 7);
          const yB2 = rwY + 3 * zoom + xOff2 * (-3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Right stable roof - left slope
    ctx.fillStyle = "#5a3a30";
    ctx.beginPath();
    ctx.moveTo(rwX, rwY - 36 * zoom);
    ctx.lineTo(rwX - 9 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX, rwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Right stable roof - right slope
    ctx.fillStyle = "#4a2a20";
    ctx.beginPath();
    ctx.moveTo(rwX, rwY - 36 * zoom);
    ctx.lineTo(rwX + 9 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX, rwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rwX + -9 * zoom * t, rwY - 36 * zoom + 12 * zoom * t);
      ctx.lineTo(rwX, rwY - 36 * zoom + 15.75 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rwX, rwY - 36 * zoom + 15.75 * zoom * t);
      ctx.lineTo(rwX + 9 * zoom * t, rwY - 36 * zoom + 12 * zoom * t);
      ctx.stroke();
    }
    // Ridge cap beam
    ctx.strokeStyle = "#2a0a00";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rwX - 9 * zoom + 2 * zoom, rwY - 24 * zoom - zoom);
    ctx.lineTo(rwX, rwY - 36 * zoom);
    ctx.lineTo(rwX + 9 * zoom - 2 * zoom, rwY - 24 * zoom - zoom);
    ctx.stroke();

    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(rwX - 2 * zoom, rwY - 16 * zoom, 8 * zoom, 16 * zoom);
    // White horse
    ctx.fillStyle = "#b0b0b0";
    ctx.beginPath();
    ctx.ellipse(
      rwX + 2 * zoom,
      rwY - 11 * zoom,
      3.5 * zoom,
      2.8 * zoom,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#e07000";
    ctx.beginPath();
    ctx.arc(rwX + 4 * zoom, rwY - 11.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Pennant on right stable (triangular, matching level 2 style)
    const rwpX = rwX - 2 * zoom;
    const rwpTop = rwY - 44 * zoom;
    const rwpBot = rwY - 34 * zoom;
    const rwpIsoD = 1.5 * zoom;
    // Back face
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(rwpX + rwpIsoD, rwpTop - rwpIsoD * 0.5);
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.6 + rwpIsoD,
      rwpTop + 3.5 * zoom - rwpIsoD * 0.5,
      rwpX + 8 * zoom + lwFlagWave * 0.5 + rwpIsoD,
      rwpTop + 5 * zoom - rwpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.4 + rwpIsoD,
      rwpTop + 6.5 * zoom - rwpIsoD * 0.5,
      rwpX + rwpIsoD,
      rwpBot - rwpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(rwpX, rwpTop);
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.6,
      rwpTop + 3.5 * zoom,
      rwpX + 8 * zoom + lwFlagWave * 0.5,
      rwpTop + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.4,
      rwpTop + 6.5 * zoom,
      rwpX,
      rwpBot,
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(rwpX + 2.5 * zoom + lwFlagWave * 0.2, rwpTop + 1.5 * zoom);
    ctx.quadraticCurveTo(
      rwpX + 4 * zoom + lwFlagWave * 0.4,
      rwpTop + 5 * zoom,
      rwpX + 2.5 * zoom + lwFlagWave * 0.2,
      rwpBot - 1.5 * zoom,
    );
    ctx.stroke();
    // Pole with isometric depth
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rwpX - 1 * zoom, rwpBot + 2 * zoom);
    ctx.lineTo(rwpX - 1 * zoom, rwpTop - 2 * zoom);
    ctx.lineTo(rwpX + 1 * zoom, rwpTop - 2 * zoom);
    ctx.lineTo(rwpX + 1 * zoom, rwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rwpX + 1 * zoom, rwpTop - 2 * zoom);
    ctx.lineTo(
      rwpX + 1 * zoom + rwpIsoD * 0.5,
      rwpTop - 2 * zoom - rwpIsoD * 0.25,
    );
    ctx.lineTo(
      rwpX + 1 * zoom + rwpIsoD * 0.5,
      rwpBot + 2 * zoom - rwpIsoD * 0.25,
    );
    ctx.lineTo(rwpX + 1 * zoom, rwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(rwpX, rwpTop - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Heavy machinery - gear cluster (bronze, not gold)
    const fGearX = bX + 14 * zoom;
    const fGearY = bY + 9 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.15;
      const r = i % 2 === 0 ? 5 * zoom : 4 * zoom;
      const gx = fGearX + Math.cos(angle) * r;
      const gy = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam pipes on foundation
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 24 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX - 24 * zoom, bY - 8 * zoom);
    ctx.quadraticCurveTo(
      bX - 24 * zoom,
      bY - 16 * zoom,
      bX - 16 * zoom,
      bY - 16 * zoom,
    );
    ctx.stroke();
    // Bronze pipe joints
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(bX - 24 * zoom, bY + 10 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 24 * zoom, bY - 8 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Steam exhaust with orange glow
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.ellipse(
      bX - 16 * zoom,
      bY + 12 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const fireGlow = 0.5 + Math.sin(time * 6) * 0.25;
    ctx.fillStyle = `rgba(224, 96, 0, ${fireGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 16 * zoom,
      bY + 12 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Steam
    const fSteam = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${fSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX - 16 * zoom + Math.sin(time * 2) * 2,
      bY + 4 * zoom,
      5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // === MAIN FORTRESS ===
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      34,
      28,
      38,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    const fortRows = 8;
    const fortRowH = (38 * zoom) / fortRows;
    const fortBlockW = 5.5 * zoom;

    // Stone texture on main fortress - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 17 * zoom, bY);
    ctx.lineTo(bX, bY + 7 * zoom);
    ctx.lineTo(bX, bY - 31 * zoom);
    ctx.lineTo(bX - 17 * zoom, bY - 38 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < fortRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 17 * zoom, bY - r * fortRowH);
      ctx.lineTo(bX, bY + 7 * zoom - r * fortRowH);
      ctx.stroke();
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      for (
        let jx = bX - 17 * zoom + fortBlockW + stagger;
        jx < bX;
        jx += fortBlockW
      ) {
        const xOff = jx - (bX - 17 * zoom);
        const yBase = bY + xOff * (7 / 17);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * fortRowH);
        ctx.lineTo(jx, yBase - (r + 1) * fortRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      let prevX = bX - 17 * zoom;
      let bIdx = 0;
      for (
        let jx = bX - 17 * zoom + fortBlockW + stagger;
        jx < bX;
        jx += fortBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (bX - 17 * zoom);
          const xOff2 = jx - (bX - 17 * zoom);
          const yB1 = bY + xOff1 * (7 / 17);
          const yB2 = bY + xOff2 * (7 / 17);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * fortRowH);
          ctx.lineTo(jx, yB2 - r * fortRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * fortRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * fortRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on main fortress - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 7 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY);
    ctx.lineTo(bX + 17 * zoom, bY - 38 * zoom);
    ctx.lineTo(bX, bY - 31 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < fortRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 7 * zoom - r * fortRowH);
      ctx.lineTo(bX + 17 * zoom, bY - r * fortRowH);
      ctx.stroke();
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      for (
        let jx = bX + fortBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += fortBlockW
      ) {
        const xOff = jx - bX;
        const yBase = bY + 7 * zoom + xOff * (-7 / 17);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * fortRowH);
        ctx.lineTo(jx, yBase - (r + 1) * fortRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      let prevX = bX;
      let bIdx = 0;
      for (
        let jx = bX + fortBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += fortBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - bX;
          const xOff2 = jx - bX;
          const yB1 = bY + 7 * zoom + xOff1 * (-7 / 17);
          const yB2 = bY + 7 * zoom + xOff2 * (-7 / 17);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * fortRowH);
          ctx.lineTo(jx, yB2 - r * fortRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * fortRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * fortRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Gothic arrow slit windows on fortress (isometric, flush against wall faces)
    const fortSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 6 * zoom,
      bY - 14 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 12 * zoom,
      bY - 17 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 6 * zoom,
      bY - 14 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 12 * zoom,
      bY - 17 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 8 * zoom,
      bY - 28 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 8 * zoom,
      bY - 28 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      fortSlitGlow,
    );

    // Orange trim bands on walls (isometric, both faces)
    const fortHW = 17 * zoom;
    const fortFD = 7 * zoom;
    const bandH = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      const bh = 10 * zoom + i * 10 * zoom;
      // Left face band
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(bX - fortHW, bY - bh);
      ctx.lineTo(bX, bY + fortFD - bh);
      ctx.lineTo(bX, bY + fortFD - bh + bandH);
      ctx.lineTo(bX - fortHW, bY - bh + bandH);
      ctx.closePath();
      ctx.fill();
      // Right face band
      ctx.fillStyle = "#c04000";
      ctx.beginPath();
      ctx.moveTo(bX, bY + fortFD - bh);
      ctx.lineTo(bX + fortHW, bY - bh);
      ctx.lineTo(bX + fortHW, bY - bh + bandH);
      ctx.lineTo(bX, bY + fortFD - bh + bandH);
      ctx.closePath();
      ctx.fill();
    }

    // Decorative crossed spears emblem on wall
    ctx.strokeStyle = "#a88217";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 10 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 30 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX + 2 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 30 * zoom);
    ctx.stroke();
    // Shield behind spears
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(bX - 4 * zoom, bY - 28 * zoom);
    ctx.lineTo(bX - 8 * zoom, bY - 22 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 16 * zoom);
    ctx.lineTo(bX, bY - 22 * zoom);
    ctx.closePath();
    ctx.fill();

    // Battlements with bronze caps
    const keepTop = bY - 38 * zoom;
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 14 * zoom + i * 6 * zoom,
          keepTop,
          5,
          4,
          6,
          { top: "#b89227", left: "#6a6a72", right: "#5a5a62" },
          zoom,
        );
      }
    }

    // Left watchtower
    const ltX = bX - 18 * zoom;
    const ltY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      ltX,
      ltY,
      12,
      10,
      48,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    const twrRows = 10;
    const twrBlockW = 4 * zoom;
    const ltTwrRowH = (48 * zoom) / twrRows;

    // Stone texture on left watchtower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX - 6 * zoom, ltY - 48 * zoom);
    ctx.lineTo(ltX, ltY - 45.5 * zoom);
    ctx.lineTo(ltX, ltY + 2.5 * zoom);
    ctx.lineTo(ltX - 6 * zoom, ltY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX - 6 * zoom, ltY - r * ltTwrRowH);
      ctx.lineTo(ltX, ltY + 2.5 * zoom - r * ltTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = ltX - 6 * zoom + twrBlockW + stagger;
        jx < ltX;
        jx += twrBlockW
      ) {
        const xOff = jx - (ltX - 6 * zoom);
        const yBase = ltY + xOff * (2.5 / 6);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = ltX - 6 * zoom;
      let bIdx = 0;
      for (
        let jx = ltX - 6 * zoom + twrBlockW + stagger;
        jx < ltX;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (ltX - 6 * zoom);
          const xOff2 = jx - (ltX - 6 * zoom);
          const yB1 = ltY + xOff1 * (2.5 / 6);
          const yB2 = ltY + xOff2 * (2.5 / 6);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on left watchtower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX, ltY - 45.5 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltY - 48 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltY);
    ctx.lineTo(ltX, ltY + 2.5 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX, ltY + 2.5 * zoom - r * ltTwrRowH);
      ctx.lineTo(ltX + 6 * zoom, ltY - r * ltTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = ltX + twrBlockW + stagger;
        jx < ltX + 6 * zoom;
        jx += twrBlockW
      ) {
        const xOff = jx - ltX;
        const yBase = ltY + 2.5 * zoom + xOff * (-2.5 / 6);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = ltX;
      let bIdx = 0;
      for (
        let jx = ltX + twrBlockW + stagger;
        jx < ltX + 6 * zoom;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - ltX;
          const xOff2 = jx - ltX;
          const yB1 = ltY + 2.5 * zoom + xOff1 * (-2.5 / 6);
          const yB2 = ltY + 2.5 * zoom + xOff2 * (-2.5 / 6);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower orange bands (isometric, both faces)
    const twrHW = 6 * zoom;
    const twrFD = 2.5 * zoom;
    const twrBandH = 2 * zoom;
    for (let i = 0; i < 3; i++) {
      const tbh = 12 * zoom + i * 12 * zoom;
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(ltX - twrHW, ltY - tbh);
      ctx.lineTo(ltX, ltY + twrFD - tbh);
      ctx.lineTo(ltX, ltY + twrFD - tbh + twrBandH);
      ctx.lineTo(ltX - twrHW, ltY - tbh + twrBandH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#c04000";
      ctx.beginPath();
      ctx.moveTo(ltX, ltY + twrFD - tbh);
      ctx.lineTo(ltX + twrHW, ltY - tbh);
      ctx.lineTo(ltX + twrHW, ltY - tbh + twrBandH);
      ctx.lineTo(ltX, ltY + twrFD - tbh + twrBandH);
      ctx.closePath();
      ctx.fill();
    }
    // Conical roof
    const ltRoofY = ltY - 48 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX - 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(ltX - 7 * zoom * t, ltRoofY - 14 * zoom + 14 * zoom * t);
      ctx.lineTo(ltX, ltRoofY - 14 * zoom + 17 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(ltX, ltRoofY - 14 * zoom + 17 * zoom * t);
      ctx.lineTo(ltX + 7 * zoom * t, ltRoofY - 14 * zoom + 14 * zoom * t);
      ctx.stroke();
    }
    // Ridge line
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ltX - 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.stroke();
    // Bronze spike finial
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 22 * zoom);
    ctx.lineTo(ltX - 2 * zoom, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 2 * zoom, ltRoofY - 14 * zoom);
    ctx.closePath();
    ctx.fill();
    // Royal pennant on left tower (triangular, matching level 2/3 style)
    const flagWave = Math.sin(time * 3) * 2;
    const rbpX = ltX;
    const rbpTop = ltRoofY - 38 * zoom;
    const rbpBot = ltRoofY - 24 * zoom;
    const rbpIsoD = 1.5 * zoom;
    // Pole with isometric depth (behind flag)
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rbpX - 1 * zoom, rbpBot + 2 * zoom);
    ctx.lineTo(rbpX - 1 * zoom, rbpTop - 2 * zoom);
    ctx.lineTo(rbpX + 1 * zoom, rbpTop - 2 * zoom);
    ctx.lineTo(rbpX + 1 * zoom, rbpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rbpX + 1 * zoom, rbpTop - 2 * zoom);
    ctx.lineTo(
      rbpX + 1 * zoom + rbpIsoD * 0.5,
      rbpTop - 2 * zoom - rbpIsoD * 0.25,
    );
    ctx.lineTo(
      rbpX + 1 * zoom + rbpIsoD * 0.5,
      rbpBot + 2 * zoom - rbpIsoD * 0.25,
    );
    ctx.lineTo(rbpX + 1 * zoom, rbpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Finial
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(rbpX, rbpTop - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Back face for depth
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(rbpX + rbpIsoD, rbpTop - rbpIsoD * 0.5);
    ctx.quadraticCurveTo(
      rbpX + 7 * zoom + flagWave * 0.6 + rbpIsoD,
      rbpTop + 5 * zoom - rbpIsoD * 0.5,
      rbpX + 12 * zoom + flagWave * 0.5 + rbpIsoD,
      rbpTop + 7 * zoom - rbpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      rbpX + 7 * zoom + flagWave * 0.4 + rbpIsoD,
      rbpTop + 9 * zoom - rbpIsoD * 0.5,
      rbpX + rbpIsoD,
      rbpBot - rbpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(rbpX, rbpTop);
    ctx.quadraticCurveTo(
      rbpX + 7 * zoom + flagWave * 0.6,
      rbpTop + 5 * zoom,
      rbpX + 12 * zoom + flagWave * 0.5,
      rbpTop + 7 * zoom,
    );
    ctx.quadraticCurveTo(
      rbpX + 7 * zoom + flagWave * 0.4,
      rbpTop + 9 * zoom,
      rbpX,
      rbpBot,
    );
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(rbpX + 3.5 * zoom + flagWave * 0.2, rbpTop + 2 * zoom);
    ctx.quadraticCurveTo(
      rbpX + 5.5 * zoom + flagWave * 0.4,
      rbpTop + 7 * zoom,
      rbpX + 3.5 * zoom + flagWave * 0.2,
      rbpBot - 2 * zoom,
    );
    ctx.stroke();

    // Right armory tower (taller)
    const rtX = bX + 18 * zoom;
    const rtY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      rtX,
      rtY,
      14,
      12,
      54,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    const rtTwrRowH = (54 * zoom) / twrRows;

    // Stone texture on right watchtower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX - 7 * zoom, rtY - 54 * zoom);
    ctx.lineTo(rtX, rtY - 51 * zoom);
    ctx.lineTo(rtX, rtY + 3 * zoom);
    ctx.lineTo(rtX - 7 * zoom, rtY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX - 7 * zoom, rtY - r * rtTwrRowH);
      ctx.lineTo(rtX, rtY + 3 * zoom - r * rtTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = rtX - 7 * zoom + twrBlockW + stagger;
        jx < rtX;
        jx += twrBlockW
      ) {
        const xOff = jx - (rtX - 7 * zoom);
        const yBase = rtY + xOff * (3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = rtX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = rtX - 7 * zoom + twrBlockW + stagger;
        jx < rtX;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (rtX - 7 * zoom);
          const xOff2 = jx - (rtX - 7 * zoom);
          const yB1 = rtY + xOff1 * (3 / 7);
          const yB2 = rtY + xOff2 * (3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on right watchtower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX, rtY - 51 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtY - 54 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtY);
    ctx.lineTo(rtX, rtY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX, rtY + 3 * zoom - r * rtTwrRowH);
      ctx.lineTo(rtX + 7 * zoom, rtY - r * rtTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = rtX + twrBlockW + stagger;
        jx < rtX + 7 * zoom;
        jx += twrBlockW
      ) {
        const xOff = jx - rtX;
        const yBase = rtY + 3 * zoom + xOff * (-3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = rtX;
      let bIdx = 0;
      for (
        let jx = rtX + twrBlockW + stagger;
        jx < rtX + 7 * zoom;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - rtX;
          const xOff2 = jx - rtX;
          const yB1 = rtY + 3 * zoom + xOff1 * (-3 / 7);
          const yB2 = rtY + 3 * zoom + xOff2 * (-3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower machinery - bronze gears
    const tGearX = rtX - 4 * zoom;
    const tGearY = rtY - 22 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.4;
      const r = i % 2 === 0 ? 5 * zoom : 3.8 * zoom;
      const gx = tGearX + Math.cos(angle) * r;
      const gy = tGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(tGearX, tGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tower spire
    const rtRoofY = rtY - 54 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX - 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 4 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 4 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rtX - 8 * zoom * t, rtRoofY - 18 * zoom + 18 * zoom * t);
      ctx.lineTo(rtX, rtRoofY - 18 * zoom + 22 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rtX, rtRoofY - 18 * zoom + 22 * zoom * t);
      ctx.lineTo(rtX + 8 * zoom * t, rtRoofY - 18 * zoom + 18 * zoom * t);
      ctx.stroke();
    }
    // Ridge line
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rtX - 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.stroke();
    // Bronze finial
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rtX - 1.5 * zoom, rtRoofY - 26 * zoom, 3 * zoom, 10 * zoom);
    ctx.fillRect(rtX - 4 * zoom, rtRoofY - 23 * zoom, 8 * zoom, 3 * zoom);

    // Glowing forge window (orange)
    const forgeGlow = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(224, 120, 0, ${forgeGlow})`;
    ctx.beginPath();
    ctx.arc(rtX - 3 * zoom, rtY - 38 * zoom, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Main entrance
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(bX - 7 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 7 * zoom, bY - 20 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 20 * zoom, 5 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 3 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Bronze arch
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 2 * zoom, bY - 20 * zoom, 5.5 * zoom, Math.PI, 0);
    ctx.stroke();
    // Interior orange glow
    const intGlow = 0.4 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(224, 120, 0, ${intGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 2 * zoom,
      bY - 10 * zoom,
      4 * zoom,
      8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // (sign removed)
  }

  // ========== STATION DETAILS (Gears, Steam, Signs) ==========

  // Animated gear decoration (on platform edge)
  const gearX = screenPos.x + 20 * zoom;
  const gearY = screenPos.y + 2 * zoom;
  const gearSize = 4 + tower.level * 0.5;
  const gearColor =
    tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#8a8a92" : "#6a5a4a";
  const gearTeeth = 8 + tower.level;

  // Main gear
  ctx.fillStyle = gearColor;
  ctx.beginPath();
  for (let i = 0; i < gearTeeth; i++) {
    const angle = (i / gearTeeth) * Math.PI * 2 + time * 0.5;
    const outerR = gearSize * zoom;
    const innerR = gearSize * 0.7 * zoom;
    const toothAngle = (0.5 / gearTeeth) * Math.PI * 2;

    if (i === 0) {
      ctx.moveTo(
        gearX + Math.cos(angle) * outerR,
        gearY + Math.sin(angle) * outerR * 0.5,
      );
    }
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle * 0.3) * outerR,
      gearY + Math.sin(angle + toothAngle * 0.3) * outerR * 0.5,
    );
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle * 0.7) * innerR,
      gearY + Math.sin(angle + toothAngle * 0.7) * innerR * 0.5,
    );
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle) * innerR,
      gearY + Math.sin(angle + toothAngle) * innerR * 0.5,
    );
  }
  ctx.closePath();
  ctx.fill();
  // Gear center
  ctx.fillStyle = tower.level >= 4 ? "#b8860b" : "#4a4a4a";
  ctx.beginPath();
  ctx.ellipse(
    gearX,
    gearY,
    gearSize * 0.3 * zoom,
    gearSize * 0.15 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Small secondary gear
  const gear2X = gearX - 6 * zoom;
  const gear2Y = gearY + 3 * zoom;
  const gear2Size = gearSize * 0.6;
  ctx.fillStyle = gearColor;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - time * 0.8;
    const outerR = gear2Size * zoom;
    const innerR = gear2Size * 0.65 * zoom;
    const toothAngle = (0.5 / 6) * Math.PI * 2;

    if (i === 0) {
      ctx.moveTo(
        gear2X + Math.cos(angle) * outerR,
        gear2Y + Math.sin(angle) * outerR * 0.5,
      );
    }
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle * 0.3) * outerR,
      gear2Y + Math.sin(angle + toothAngle * 0.3) * outerR * 0.5,
    );
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle * 0.7) * innerR,
      gear2Y + Math.sin(angle + toothAngle * 0.7) * innerR * 0.5,
    );
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle) * innerR,
      gear2Y + Math.sin(angle + toothAngle) * innerR * 0.5,
    );
  }
  ctx.closePath();
  ctx.fill();

  // Steam vents (puffing steam)
  const ventX = screenPos.x - 28 * zoom;
  const ventY = screenPos.y - 5 * zoom;

  // Vent pipe (3D isometric cylinder)
  const vpColor = tower.level >= 3 ? "#5a5a62" : "#6b5030";
  const vpDark = tower.level >= 3 ? "#4a4a52" : "#5b4020";
  ctx.fillStyle = vpDark;
  ctx.beginPath();
  ctx.moveTo(ventX - 1.5 * zoom, ventY + 3 * zoom);
  ctx.lineTo(ventX - 1.5 * zoom, ventY);
  ctx.lineTo(ventX + 1.5 * zoom, ventY);
  ctx.lineTo(ventX + 1.5 * zoom, ventY + 3 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = vpColor;
  ctx.beginPath();
  ctx.ellipse(ventX, ventY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Steam puffs
  const steamPhase = (time * 2) % 3;
  const steamAlpha =
    steamPhase < 1 ? steamPhase : steamPhase < 2 ? 1 : 3 - steamPhase;
  if (steamAlpha > 0.1) {
    ctx.fillStyle = `rgba(200, 200, 200, ${steamAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(
      ventX + Math.sin(time * 2) * 2,
      ventY - 4 * zoom - steamPhase * 3 * zoom,
      (2 + steamPhase) * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(180, 180, 180, ${steamAlpha * 0.25})`;
    ctx.beginPath();
    ctx.arc(
      ventX + Math.sin(time * 2 + 1) * 3,
      ventY - 8 * zoom - steamPhase * 4 * zoom,
      (1.5 + steamPhase * 0.8) * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // "ON TIME" sign board
  const signX = screenPos.x + 27 * zoom;
  const signY = screenPos.y - 12 * zoom;

  // Sign post (3D isometric)
  const spW = 1 * zoom;
  const spD = 0.8 * zoom;
  const spH = 18 * zoom;
  const spColor = tower.level >= 4 ? "#c9a227" : "#5a4a3a";
  const spDark = tower.level >= 4 ? "#a08020" : "#4a3a2a";
  ctx.fillStyle = spDark;
  ctx.beginPath();
  ctx.moveTo(signX - spW, signY + spH);
  ctx.lineTo(signX - spW, signY);
  ctx.lineTo(signX, signY - spD * 0.5);
  ctx.lineTo(signX, signY + spH - spD * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = spColor;
  ctx.beginPath();
  ctx.moveTo(signX, signY + spH - spD * 0.5);
  ctx.lineTo(signX, signY - spD * 0.5);
  ctx.lineTo(signX + spW, signY);
  ctx.lineTo(signX + spW, signY + spH);
  ctx.closePath();
  ctx.fill();

  // Sign board (3D isometric)
  const sbW = 16 * zoom;
  const sbH = 8 * zoom;
  const sbD = 2 * zoom;
  const sbLeft = signX - sbW * 0.5;
  const sbTop = signY - sbH;
  ctx.fillStyle = tower.level >= 4 ? "#2a2a32" : "#3a3a3a";
  ctx.beginPath();
  ctx.moveTo(sbLeft, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop + sbH);
  ctx.lineTo(sbLeft, sbTop + sbH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tower.level >= 4 ? "#3a3a42" : "#4a4a4a";
  ctx.beginPath();
  ctx.moveTo(sbLeft, sbTop);
  ctx.lineTo(sbLeft + sbD * 0.5, sbTop - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW + sbD * 0.5, sbTop - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW, sbTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tower.level >= 4 ? "#1a1a22" : "#2a2a2a";
  ctx.beginPath();
  ctx.moveTo(sbLeft + sbW, sbTop);
  ctx.lineTo(sbLeft + sbW + sbD * 0.5, sbTop - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW + sbD * 0.5, sbTop + sbH - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW, sbTop + sbH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#e06000";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbLeft, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop + sbH);
  ctx.lineTo(sbLeft, sbTop + sbH);
  ctx.closePath();
  ctx.stroke();

  // "ON TIME" text with glow
  const onTimeGlow = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 100, ${onTimeGlow})`;
  ctx.shadowColor = "#00ff64";
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `bold ${3.5 * zoom}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("ON TIME", signX, signY - 3 * zoom);
  ctx.shadowBlur = 0;

  // Small indicator lights on sign
  for (let i = 0; i < 3; i++) {
    const lightX = signX - 5 * zoom + i * 5 * zoom;
    const lightY = signY - 1 * zoom;
    const lightOn = Math.sin(time * 4 + i * 0.5) > 0;
    ctx.fillStyle = lightOn ? "#00ff64" : "#1a3a1a";
    ctx.beginPath();
    ctx.arc(lightX, lightY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level-specific station extras
  if (tower.level >= 2) {
    // Extra pipes
    ctx.strokeStyle = tower.level >= 4 ? "#b8860b" : "#6a6a72";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 25 * zoom, screenPos.y);
    ctx.quadraticCurveTo(
      screenPos.x - 30 * zoom,
      screenPos.y - 10 * zoom,
      screenPos.x - 28 * zoom,
      screenPos.y - 5 * zoom,
    );
    ctx.stroke();
  }

  if (tower.level >= 3) {
    // Extra gear cluster
    const clusterX = screenPos.x - 30 * zoom;
    const clusterY = screenPos.y + 8 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    ctx.arc(clusterX, clusterY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(
      clusterX + 3 * zoom,
      clusterY + 1.5 * zoom,
      1.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  if (tower.level === 4) {
    // Royal crest on station
    const crestX = screenPos.x - 5 * zoom;
    const crestY = screenPos.y - 35 * zoom;
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(crestX, crestY - 5 * zoom);
    ctx.lineTo(crestX - 4 * zoom, crestY);
    ctx.lineTo(crestX - 3 * zoom, crestY + 2 * zoom);
    ctx.lineTo(crestX, crestY + 5 * zoom);
    ctx.lineTo(crestX + 3 * zoom, crestY + 2 * zoom);
    ctx.lineTo(crestX + 4 * zoom, crestY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Crown on crest
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(crestX - 2 * zoom, crestY - 1 * zoom);
    ctx.lineTo(crestX - 1 * zoom, crestY - 3 * zoom);
    ctx.lineTo(crestX, crestY - 1.5 * zoom);
    ctx.lineTo(crestX + 1 * zoom, crestY - 3 * zoom);
    ctx.lineTo(crestX + 2 * zoom, crestY - 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Station state variables (used by overlays, loading dock, window reflections, etc.)
  const isSpawning = tower.spawnEffect != null && tower.spawnEffect > 0;
  const spawnIntensity = isSpawning ? Math.max(0, tower.spawnEffect! / 500) : 0;
  const isStationAttacking =
    tower.lastAttack != null && Date.now() - tower.lastAttack < 500;
  const stationAttackPulse = isStationAttacking
    ? Math.max(0, 1 - (Date.now() - tower.lastAttack) / 500)
    : 0;
  const stationActive = isSpawning || isStationAttacking;
  const stationIntensity = Math.max(spawnIntensity, stationAttackPulse);
  const levelScale = 0.8 + tower.level * 0.15;

  // ---- FRONT FENCE EDGES (drawn in front of building body) ----
  {
    const fPostColor =
      tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#6a6a72" : "#6a5230";
    const fRailColor =
      tower.level >= 4 ? "#a88420" : tower.level >= 3 ? "#5a5a62" : "#5a4220";
    const topPlatW =
      tower.level <= 2 ? baseW + 4 : tower.level === 3 ? baseW + 6 : baseW + 8;
    const topPlatD =
      tower.level === 1
        ? baseD + 12
        : tower.level === 2
          ? baseD + 14
          : tower.level === 3
            ? baseD + 16
            : baseD + 18;
    const fW = topPlatW * zoom * 0.5;
    const fD = topPlatD * zoom * 0.25;
    const fBaseY = screenPos.y;
    const fPostH = 4 * zoom;
    const postCount = 5;

    const frontFenceEdges: [number, number, number, number][] = [
      [screenPos.x, fBaseY + fD, screenPos.x + fW, fBaseY],
      [screenPos.x - fW, fBaseY, screenPos.x, fBaseY + fD],
    ];

    ctx.lineCap = "round";

    for (const [x0, y0, x1, y1] of frontFenceEdges) {
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;

        ctx.strokeStyle = fPostColor;
        ctx.lineWidth = 1.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - fPostH);
        ctx.stroke();

        ctx.fillStyle = fPostColor;
        ctx.beginPath();
        ctx.arc(px, py - fPostH, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let r = 0; r < 2; r++) {
        const railY = fPostH * (0.35 + r * 0.45);
        ctx.strokeStyle = fRailColor;
        ctx.lineWidth = 1.0 * zoom;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - railY);
        ctx.lineTo(x1, y1 - railY);
        ctx.stroke();
      }
    }

    ctx.lineCap = "butt";
  }

  // ---- TRAINING DUMMY (rendered above fence for correct z-ordering) ----
  if (tower.level === 1) {
    const dummyX = screenPos.x + isoW * 0.7;
    const dummyY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(dummyX - 1.5 * zoom, dummyY - 18 * zoom, 3 * zoom, 18 * zoom);
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(
      dummyX,
      dummyY - 12 * zoom,
      5 * zoom,
      7 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(dummyX, dummyY - 22 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cc3333";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(dummyX, dummyY - 12 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(dummyX, dummyY - 12 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (tower.level === 4 && tower.upgrade === "A") {
    const targetX = stationX - 18 * zoom;
    const targetY = stationY - 6 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(targetX - 1 * zoom, targetY - 6 * zoom, 2 * zoom, 12 * zoom);
    ctx.fillRect(targetX - 4 * zoom, targetY + 4 * zoom, 8 * zoom, 2 * zoom);
    ctx.fillStyle = "#f0f0e0";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      6 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#c03030";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      4.5 * zoom,
      2.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#f0f0e0";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#c03030";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      1.5 * zoom,
      0.75 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(targetX + 1.5 * zoom, targetY - 10.5 * zoom);
    ctx.lineTo(targetX + 5 * zoom, targetY - 9 * zoom);
    ctx.stroke();
  }

  // ---- WINDOWS (3D isometric, aligned to building faces) ----
  const reflLightAngle = time * 0.3;
  const frameColor =
    tower.level >= 4 ? "#b89227" : tower.level >= 3 ? "#5a5a62" : "#5a4a3a";
  const frameDark =
    tower.level >= 4 ? "#8a7020" : tower.level >= 3 ? "#4a4a52" : "#4a3a2a";
  const sillColor =
    tower.level >= 4 ? "#a08020" : tower.level >= 3 ? "#6a6a72" : "#6a5a4a";

  // Isometric slope for window faces: 2:1 iso ratio
  // Left face runs direction (-1, -0.5) toward back-left; width skews along (+1, +0.5)
  // Right face runs direction (+1, -0.5) toward back-right; width skews along (+1, -0.5)

  // Window positions shifted northeast so they sit properly on building faces
  const winOffX = 4 * zoom;
  const winOffY = -2 * zoom;
  const windowDefs = [
    {
      cx: screenPos.x - 8 * zoom + winOffX,
      cy: screenPos.y - 16 * zoom + winOffY,
      face: "left" as const,
    },
    {
      cx: screenPos.x - 16 * zoom + winOffX,
      cy: screenPos.y - 12 * zoom + winOffY,
      face: "left" as const,
    },
    {
      cx: screenPos.x + 6 * zoom + winOffX,
      cy: screenPos.y - 16 * zoom + winOffY,
      face: "right" as const,
    },
    ...(tower.level >= 2
      ? [
          {
            cx: screenPos.x + 14 * zoom + winOffX,
            cy: screenPos.y - 12 * zoom + winOffY,
            face: "right" as const,
          },
        ]
      : []),
    ...(tower.level >= 3
      ? [
          {
            cx: screenPos.x - 22 * zoom + winOffX,
            cy: screenPos.y - 8 * zoom + winOffY,
            face: "left" as const,
          },
          {
            cx: screenPos.x + 20 * zoom + winOffX,
            cy: screenPos.y - 8 * zoom + winOffY,
            face: "right" as const,
          },
        ]
      : []),
  ];

  for (let ri = 0; ri < windowDefs.length; ri++) {
    const wDef = windowDefs[ri];
    const wx = wDef.cx;
    const wy = wDef.cy;
    const isLeft = wDef.face === "left";

    const winW = 5 * zoom;
    const winH = 6 * zoom;
    const halfW = winW * 0.5;
    const halfH = winH * 0.5;
    // Iso slope: for left face width skews along (+1, -0.5), for right face along (+1, +0.5)
    const slopeY = isLeft ? -0.5 : 0.5;

    // Parallelogram: vertical edges are straight up/down, horizontal edges follow the face
    const tlx = wx - halfW;
    const tly = wy - halfH - halfW * slopeY;
    const trx = wx + halfW;
    const trY = wy - halfH + halfW * slopeY;
    const brx = wx + halfW;
    const bry = wy + halfH + halfW * slopeY;
    const blx = wx - halfW;
    const bly = wy + halfH - halfW * slopeY;

    // Recess shadow (inset depth)
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.moveTo(tlx - 0.5 * zoom, tly - 0.5 * zoom);
    ctx.lineTo(trx + 0.5 * zoom, trY - 0.5 * zoom);
    ctx.lineTo(brx + 0.5 * zoom, bry + 0.5 * zoom);
    ctx.lineTo(blx - 0.5 * zoom, bly + 0.5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Glass pane (dark with gradient)
    const glassDark =
      tower.level >= 4 ? "rgba(20, 25, 45, 0.9)" : "rgba(30, 40, 55, 0.9)";
    const glassLight =
      tower.level >= 4 ? "rgba(40, 45, 65, 0.8)" : "rgba(50, 60, 75, 0.8)";
    const glassGrad = ctx.createLinearGradient(tlx, tly, brx, bry);
    glassGrad.addColorStop(0, glassDark);
    glassGrad.addColorStop(1, glassLight);
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(tlx, tly);
    ctx.lineTo(trx, trY);
    ctx.lineTo(brx, bry);
    ctx.lineTo(blx, bly);
    ctx.closePath();
    ctx.fill();

    // Warm interior glow
    const baseGlow = 0.08 + Math.sin(time * 1.5 + ri * 2.5) * 0.04;
    ctx.fillStyle = `rgba(255, 200, 120, ${baseGlow})`;
    ctx.fill();

    // Reflection sweep
    const reflPhase = Math.sin(reflLightAngle + ri * 1.5);
    if (reflPhase > 0) {
      const reflAlpha = reflPhase * 0.35;
      ctx.fillStyle = `rgba(200, 220, 255, ${reflAlpha})`;
      ctx.beginPath();
      const rMidX = (tlx + trx) * 0.5;
      const rMidY = (tly + trY) * 0.5;
      ctx.moveTo(rMidX - winW * 0.15, rMidY);
      ctx.lineTo(rMidX + winW * 0.15, rMidY + winW * slopeY * 0.3);
      ctx.lineTo(
        (blx + brx) * 0.5 + winW * 0.15,
        (bly + bry) * 0.5 + winW * slopeY * 0.3,
      );
      ctx.lineTo((blx + brx) * 0.5 - winW * 0.15, (bly + bry) * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    // Window frame (isometric parallelogram)
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tlx, tly);
    ctx.lineTo(trx, trY);
    ctx.lineTo(brx, bry);
    ctx.lineTo(blx, bly);
    ctx.closePath();
    ctx.stroke();

    // Mullion cross (follows the parallelogram)
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 0.7 * zoom;
    const midTopX = (tlx + trx) * 0.5;
    const midTopY = (tly + trY) * 0.5;
    const midBotX = (blx + brx) * 0.5;
    const midBotY = (bly + bry) * 0.5;
    const midLeftX = (tlx + blx) * 0.5;
    const midLeftY = (tly + bly) * 0.5;
    const midRightX = (trx + brx) * 0.5;
    const midRightY = (trY + bry) * 0.5;
    ctx.beginPath();
    ctx.moveTo(midTopX, midTopY);
    ctx.lineTo(midBotX, midBotY);
    ctx.moveTo(midLeftX, midLeftY);
    ctx.lineTo(midRightX, midRightY);
    ctx.stroke();

    // 3D window sill (protruding ledge)
    const sillProj = 1.5 * zoom;
    ctx.fillStyle = sillColor;
    ctx.beginPath();
    ctx.moveTo(blx - sillProj * (isLeft ? 0.3 : -0.3), bly);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.3), bry);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.6), bry + sillProj * 0.5);
    ctx.lineTo(blx - sillProj * (isLeft ? 0.3 : -0.6), bly + sillProj * 0.5);
    ctx.closePath();
    ctx.fill();
    // Sill front face
    ctx.fillStyle = frameDark;
    ctx.beginPath();
    ctx.moveTo(blx - sillProj * (isLeft ? 0.3 : -0.6), bly + sillProj * 0.5);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.6), bry + sillProj * 0.5);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.6), bry + sillProj);
    ctx.lineTo(blx - sillProj * (isLeft ? 0.3 : -0.6), bly + sillProj);
    ctx.closePath();
    ctx.fill();

    // Active glow
    if (stationActive) {
      const winGlow =
        0.2 + stationIntensity * 0.3 + Math.sin(time * 6 + ri * 1.8) * 0.1;
      ctx.fillStyle = isStationAttacking
        ? `rgba(255, 80, 40, ${winGlow})`
        : `rgba(255, 180, 80, ${winGlow})`;
      ctx.beginPath();
      ctx.moveTo(tlx + 0.5 * zoom, tly + 0.5 * zoom);
      ctx.lineTo(trx - 0.5 * zoom, trY + 0.5 * zoom);
      ctx.lineTo(brx - 0.5 * zoom, bry - 0.5 * zoom);
      ctx.lineTo(blx + 0.5 * zoom, bly - 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- DOOR / ENTRANCE WITH 3D DEPTH ----
  const doorX = screenPos.x - 16 * zoom;
  const doorY = screenPos.y + 2 * zoom;

  // Door step/stoop (small platform in front)
  const stepColor =
    tower.level >= 4 ? "#7a6a5a" : tower.level >= 3 ? "#5a5a62" : "#5a4a3a";
  ctx.fillStyle = stepColor;
  ctx.beginPath();
  ctx.moveTo(doorX - 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX, doorY + 4 * zoom);
  ctx.lineTo(doorX + 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX, doorY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Door recess shadow (3D inset)
  const drW = 4 * zoom;
  const drH = 8.5 * zoom;
  const drDepth = 1.5 * zoom;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.lineTo(doorX + drW, doorY + 2 * zoom);
  ctx.lineTo(doorX - drW, doorY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  // Recess top lip (inset depth)
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH);
  ctx.lineTo(doorX - drW + drDepth * 0.4, doorY - drH - drDepth * 0.2);
  ctx.lineTo(doorX + drW + drDepth * 0.4, doorY - drH - drDepth * 0.2);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.closePath();
  ctx.fill();

  // Door frame (3D isometric)
  const doorFrameColor =
    tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#5a5a62" : "#5a4020";
  const doorFrameDark =
    tower.level >= 4 ? "#a08020" : tower.level >= 3 ? "#4a4a52" : "#4a3010";
  // Left jamb
  ctx.fillStyle = doorFrameDark;
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY + 2 * zoom);
  ctx.lineTo(doorX - drW, doorY - drH);
  ctx.lineTo(doorX - drW + 1.5 * zoom, doorY - drH);
  ctx.lineTo(doorX - drW + 1.5 * zoom, doorY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  // Right jamb
  ctx.fillStyle = doorFrameColor;
  ctx.beginPath();
  ctx.moveTo(doorX + drW - 1.5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX + drW - 1.5 * zoom, doorY - drH);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.lineTo(doorX + drW, doorY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  // Lintel (top bar with 3D top face)
  ctx.fillStyle = doorFrameColor;
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH - 1.5 * zoom);
  ctx.lineTo(doorX + drW, doorY - drH - 1.5 * zoom);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.lineTo(doorX - drW, doorY - drH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = doorFrameDark;
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH - 1.5 * zoom);
  ctx.lineTo(
    doorX - drW + drDepth * 0.4,
    doorY - drH - 1.5 * zoom - drDepth * 0.2,
  );
  ctx.lineTo(
    doorX + drW + drDepth * 0.4,
    doorY - drH - 1.5 * zoom - drDepth * 0.2,
  );
  ctx.lineTo(doorX + drW, doorY - drH - 1.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Arch/lintel detail above door
  ctx.strokeStyle = doorFrameColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(doorX, doorY - 8 * zoom, 4 * zoom, Math.PI, 0);
  ctx.stroke();

  // Door panels (3D raised detail with isometric depth)
  const panelColor =
    tower.level >= 4 ? "#3a2a1a" : tower.level >= 3 ? "#3a3a42" : "#4a3010";
  const panelLight =
    tower.level >= 4 ? "#4a3a2a" : tower.level >= 3 ? "#4a4a52" : "#5a4020";
  // Left door panel
  const lpx = doorX - 2.5 * zoom;
  const lpy = doorY - 7 * zoom;
  const pw = 2 * zoom;
  const ph = 8 * zoom;
  ctx.fillStyle = panelColor;
  ctx.beginPath();
  ctx.moveTo(lpx, lpy);
  ctx.lineTo(lpx + pw, lpy);
  ctx.lineTo(lpx + pw, lpy + ph);
  ctx.lineTo(lpx, lpy + ph);
  ctx.closePath();
  ctx.fill();
  // Panel raised inset (upper)
  ctx.fillStyle = panelLight;
  ctx.beginPath();
  ctx.moveTo(lpx + 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + ph * 0.4);
  ctx.lineTo(lpx + 0.3 * zoom, lpy + ph * 0.4);
  ctx.closePath();
  ctx.fill();
  // Panel raised inset (lower)
  ctx.beginPath();
  ctx.moveTo(lpx + 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.lineTo(lpx + 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Right door panel
  const rpx = doorX + 0.5 * zoom;
  ctx.fillStyle = panelColor;
  ctx.beginPath();
  ctx.moveTo(rpx, lpy);
  ctx.lineTo(rpx + pw, lpy);
  ctx.lineTo(rpx + pw, lpy + ph);
  ctx.lineTo(rpx, lpy + ph);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = panelLight;
  ctx.beginPath();
  ctx.moveTo(rpx + 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + ph * 0.4);
  ctx.lineTo(rpx + 0.3 * zoom, lpy + ph * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rpx + 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.lineTo(rpx + 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Center seam line
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(doorX, doorY - 7 * zoom);
  ctx.lineTo(doorX, doorY + 1 * zoom);
  ctx.stroke();

  // Door handles (3D knobs)
  const handleColor = tower.level >= 4 ? "#e8c847" : "#8a8a8a";
  const handleDark = tower.level >= 4 ? "#c9a227" : "#6a6a6a";
  for (const hx of [doorX + 1.8 * zoom, doorX - 1.3 * zoom]) {
    ctx.fillStyle = handleDark;
    ctx.beginPath();
    ctx.arc(hx, doorY - 3 * zoom, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = handleColor;
    ctx.beginPath();
    ctx.arc(hx, doorY - 3.2 * zoom, 0.7 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Overhead door light (3D lantern)
  const doorLightGlow = 0.5 + Math.sin(time * 2) * 0.15;
  // Lantern bracket
  ctx.strokeStyle = frameDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(doorX, doorY - drH - 1.5 * zoom);
  ctx.quadraticCurveTo(
    doorX,
    doorY - drH - 4 * zoom,
    doorX,
    doorY - drH - 3 * zoom,
  );
  ctx.stroke();
  // Light bulb
  ctx.fillStyle = `rgba(255, 220, 150, ${doorLightGlow})`;
  ctx.shadowColor = "#ffdd99";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(doorX, doorY - drH - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Light cone on step
  ctx.fillStyle = `rgba(255, 220, 150, ${doorLightGlow * 0.08})`;
  ctx.beginPath();
  ctx.moveTo(doorX - 1.5 * zoom, doorY - drH - 3 * zoom);
  ctx.lineTo(doorX - 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX + 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX + 1.5 * zoom, doorY - drH - 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // ---- STRUCTURAL BEAMS / TRUSSES (industrial feel) ----
  const beamColor =
    tower.level >= 4 ? "#8a7020" : tower.level >= 3 ? "#5a5a62" : "#5a4a3a";
  const beamHighlight =
    tower.level >= 4 ? "#a08828" : tower.level >= 3 ? "#6a6a72" : "#6a5a4a";
  const rivetColor = tower.level >= 4 ? "#c9a227" : "#8a8a8a";

  // Right wall cross brace with I-beam profile
  const braceRX = screenPos.x + 6 * zoom;
  const braceRY = screenPos.y - 6 * zoom;

  // Vertical I-beam columns (right wall, 3D isometric)
  const beamIsoD = 1.5 * zoom;
  for (const colOff of [0, 10]) {
    const colX = braceRX + colOff * zoom;
    // Web (center strip with depth)
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(colX - 0.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(colX + 0.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(colX + 0.8 * zoom, braceRY);
    ctx.lineTo(colX - 0.8 * zoom, braceRY);
    ctx.closePath();
    ctx.fill();
    // Web side face (depth)
    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(colX + 0.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(
      colX + 0.8 * zoom + beamIsoD * 0.4,
      braceRY - 11 * zoom - beamIsoD * 0.2,
    );
    ctx.lineTo(colX + 0.8 * zoom + beamIsoD * 0.4, braceRY - beamIsoD * 0.2);
    ctx.lineTo(colX + 0.8 * zoom, braceRY);
    ctx.closePath();
    ctx.fill();
    // Flange top (3D)
    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY - 12 * zoom);
    ctx.lineTo(
      colX - 1.8 * zoom + beamIsoD * 0.4,
      braceRY - 12 * zoom - beamIsoD * 0.2,
    );
    ctx.lineTo(
      colX + 1.8 * zoom + beamIsoD * 0.4,
      braceRY - 12 * zoom - beamIsoD * 0.2,
    );
    ctx.lineTo(colX + 1.8 * zoom, braceRY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY - 12 * zoom);
    ctx.lineTo(colX + 1.8 * zoom, braceRY - 12 * zoom);
    ctx.lineTo(colX + 1.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(colX - 1.8 * zoom, braceRY - 11 * zoom);
    ctx.closePath();
    ctx.fill();
    // Flange bottom (3D)
    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY);
    ctx.lineTo(colX - 1.8 * zoom + beamIsoD * 0.4, braceRY - beamIsoD * 0.2);
    ctx.lineTo(colX + 1.8 * zoom + beamIsoD * 0.4, braceRY - beamIsoD * 0.2);
    ctx.lineTo(colX + 1.8 * zoom, braceRY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY);
    ctx.lineTo(colX + 1.8 * zoom, braceRY);
    ctx.lineTo(colX + 1.8 * zoom, braceRY + 1 * zoom);
    ctx.lineTo(colX - 1.8 * zoom, braceRY + 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Cross brace X pattern (skip for Level 1 - overlaps small roof)
  if (tower.level >= 2) {
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(braceRX, braceRY - 11.5 * zoom);
    ctx.lineTo(braceRX + 10 * zoom, braceRY - 0.5 * zoom);
    ctx.moveTo(braceRX + 10 * zoom, braceRY - 11.5 * zoom);
    ctx.lineTo(braceRX, braceRY - 0.5 * zoom);
    ctx.stroke();
  }

  // Horizontal tie beam with I-beam profile (3D)
  ctx.fillStyle = beamHighlight;
  ctx.beginPath();
  ctx.moveTo(braceRX, braceRY - 6.5 * zoom);
  ctx.lineTo(braceRX + beamIsoD * 0.4, braceRY - 6.5 * zoom - beamIsoD * 0.2);
  ctx.lineTo(
    braceRX + 10 * zoom + beamIsoD * 0.4,
    braceRY - 6.5 * zoom - beamIsoD * 0.2,
  );
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 6.5 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = beamColor;
  ctx.beginPath();
  ctx.moveTo(braceRX, braceRY - 6.5 * zoom);
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 6.5 * zoom);
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 5.5 * zoom);
  ctx.lineTo(braceRX, braceRY - 5.5 * zoom);
  ctx.closePath();
  ctx.fill();
  // Beam right face (depth)
  ctx.fillStyle = beamHighlight;
  ctx.beginPath();
  ctx.moveTo(braceRX + 10 * zoom, braceRY - 6.5 * zoom);
  ctx.lineTo(
    braceRX + 10 * zoom + beamIsoD * 0.4,
    braceRY - 6.5 * zoom - beamIsoD * 0.2,
  );
  ctx.lineTo(
    braceRX + 10 * zoom + beamIsoD * 0.4,
    braceRY - 5.5 * zoom - beamIsoD * 0.2,
  );
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 5.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Gusset plates at brace intersections
  ctx.fillStyle = beamHighlight;
  for (const gp of [
    { x: braceRX + 5 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX, y: braceRY - 11.5 * zoom },
    { x: braceRX + 10 * zoom, y: braceRY - 11.5 * zoom },
  ]) {
    ctx.beginPath();
    ctx.moveTo(gp.x, gp.y - 2 * zoom);
    ctx.lineTo(gp.x + 2 * zoom, gp.y);
    ctx.lineTo(gp.x, gp.y + 2 * zoom);
    ctx.lineTo(gp.x - 2 * zoom, gp.y);
    ctx.closePath();
    ctx.fill();
  }

  // Rivets along tie beam and at joints
  ctx.fillStyle = rivetColor;
  const rivetPositions = [
    { x: braceRX + 1 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX + 5 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX + 9 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX + 0.5 * zoom, y: braceRY - 12 * zoom },
    { x: braceRX + 9.5 * zoom, y: braceRY - 12 * zoom },
    { x: braceRX + 0.5 * zoom, y: braceRY },
    { x: braceRX + 9.5 * zoom, y: braceRY },
  ];
  for (const riv of rivetPositions) {
    ctx.beginPath();
    ctx.arc(riv.x, riv.y, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left wall diagonal brace (less prominent)
  const braceLX = screenPos.x - 20 * zoom;
  const braceLY = screenPos.y - 6 * zoom;
  ctx.strokeStyle = beamColor;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(braceLX, braceLY - 10 * zoom);
  ctx.lineTo(braceLX - 8 * zoom, braceLY + 2 * zoom);
  ctx.moveTo(braceLX - 8 * zoom, braceLY - 10 * zoom);
  ctx.lineTo(braceLX, braceLY + 2 * zoom);
  ctx.stroke();
  // Left brace rivets
  ctx.fillStyle = rivetColor;
  ctx.beginPath();
  ctx.arc(braceLX - 4 * zoom, braceLY - 4 * zoom, 0.7 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // ---- ROOF RIDGE LINE AND EAVES ----
  const roofRidgeY = screenPos.y - (26 + tower.level * 4) * zoom;
  ctx.strokeStyle =
    tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#6a6a72" : "#7a6040";
  ctx.lineWidth = 2 * zoom;

  // Eave overhang shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 24 * zoom, roofRidgeY + 9 * zoom);
  ctx.lineTo(screenPos.x - 12 * zoom, roofRidgeY + 1 * zoom);
  ctx.lineTo(screenPos.x + 4 * zoom, roofRidgeY + 5 * zoom);
  ctx.lineTo(screenPos.x + 4 * zoom, roofRidgeY + 7 * zoom);
  ctx.lineTo(screenPos.x - 12 * zoom, roofRidgeY + 3 * zoom);
  ctx.lineTo(screenPos.x - 24 * zoom, roofRidgeY + 11 * zoom);
  ctx.closePath();
  ctx.fill();

  // Pressure gauge (on station wall, rendered after roof ridge so it's not covered)
  const gaugeX = screenPos.x - 16 * zoom;
  const gaugeY = screenPos.y - 26 * zoom;

  ctx.fillStyle = tower.level >= 4 ? "#b8860b" : "#8b7355";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0f0e8";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI + Math.PI;
    ctx.beginPath();
    ctx.moveTo(
      gaugeX + Math.cos(angle) * 2.2 * zoom,
      gaugeY + Math.sin(angle) * 2.2 * zoom,
    );
    ctx.lineTo(
      gaugeX + Math.cos(angle) * 2.8 * zoom,
      gaugeY + Math.sin(angle) * 2.8 * zoom,
    );
    ctx.stroke();
  }

  const needleAngle =
    Math.PI + Math.PI * 0.2 + Math.sin(time * 2) * 0.3 + Math.PI * 0.5;
  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(needleAngle) * 2.5 * zoom,
    gaugeY + Math.sin(needleAngle) * 2.5 * zoom,
  );
  ctx.stroke();

  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // ---- LOADING DOCK WITH CRANE ARM ----
  const dockX = screenPos.x + 26 * zoom;
  const dockY = screenPos.y + 2 * zoom;

  // Dock platform
  drawIsoDiamond(
    dockX,
    dockY + 4 * zoom,
    14,
    10,
    3,
    tower.level >= 4 ? "#7a6a5a" : "#5a5a62",
    tower.level >= 4 ? "#6a5a4a" : "#4a4a52",
    tower.level >= 4 ? "#5a4a3a" : "#3a3a42",
  );

  // Dock bumper bollards (3D isometric)
  const bollardColor = tower.level >= 4 ? "#c9a227" : "#cc8800";
  const bollardDark = tower.level >= 4 ? "#a08020" : "#aa6600";
  const bollardPositions = [
    { x: dockX - 5 * zoom, y: dockY + 2 * zoom },
    { x: dockX + 4 * zoom, y: dockY + 0.5 * zoom },
  ];
  for (const bp of bollardPositions) {
    const bw = 1.5 * zoom;
    const bh = 3.5 * zoom;
    const bd = 1 * zoom;
    ctx.fillStyle = bollardDark;
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y + bh);
    ctx.lineTo(bp.x, bp.y);
    ctx.lineTo(bp.x + bw * 0.5, bp.y - bd * 0.5);
    ctx.lineTo(bp.x + bw * 0.5, bp.y + bh - bd * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bollardColor;
    ctx.beginPath();
    ctx.moveTo(bp.x + bw * 0.5, bp.y + bh - bd * 0.5);
    ctx.lineTo(bp.x + bw * 0.5, bp.y - bd * 0.5);
    ctx.lineTo(bp.x + bw, bp.y);
    ctx.lineTo(bp.x + bw, bp.y + bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bollardColor;
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y);
    ctx.lineTo(bp.x + bw * 0.5, bp.y - bd * 0.5);
    ctx.lineTo(bp.x + bw, bp.y);
    ctx.lineTo(bp.x + bw * 0.5, bp.y + bd * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Stacked crates on dock platform (3D isometric boxes)
  const dockCrateS = 2 * zoom;
  const stackedCrates = [
    {
      ox: -2,
      oy: 0,
      top: tower.level >= 4 ? "#c9a230" : "#9a7920",
      left: tower.level >= 4 ? "#a08020" : "#7a5810",
      right: tower.level >= 4 ? "#b89227" : "#8b6914",
    },
    {
      ox: 1,
      oy: -0.5,
      top: tower.level >= 4 ? "#d0a835" : "#a58025",
      left: tower.level >= 4 ? "#b89227" : "#8b6914",
      right: tower.level >= 4 ? "#c9a230" : "#9a7920",
    },
    {
      ox: -0.5,
      oy: -2.5,
      top: tower.level >= 4 ? "#dab040" : "#b08a30",
      left: tower.level >= 4 ? "#c9a230" : "#9a7920",
      right: tower.level >= 4 ? "#d0a835" : "#a58025",
    },
  ];
  for (const scr of stackedCrates) {
    const scrx = dockX + scr.ox * zoom;
    const scry = dockY + scr.oy * zoom;
    // Top face (diamond)
    ctx.fillStyle = scr.top;
    ctx.beginPath();
    ctx.moveTo(scrx, scry - dockCrateS * 1.3);
    ctx.lineTo(scrx + dockCrateS, scry - dockCrateS);
    ctx.lineTo(scrx, scry - dockCrateS * 0.7);
    ctx.lineTo(scrx - dockCrateS, scry - dockCrateS);
    ctx.closePath();
    ctx.fill();
    // Left face
    ctx.fillStyle = scr.left;
    ctx.beginPath();
    ctx.moveTo(scrx - dockCrateS, scry - dockCrateS);
    ctx.lineTo(scrx, scry - dockCrateS * 0.7);
    ctx.lineTo(scrx, scry);
    ctx.lineTo(scrx - dockCrateS, scry - dockCrateS * 0.3);
    ctx.closePath();
    ctx.fill();
    // Right face
    ctx.fillStyle = scr.right;
    ctx.beginPath();
    ctx.moveTo(scrx + dockCrateS, scry - dockCrateS);
    ctx.lineTo(scrx, scry - dockCrateS * 0.7);
    ctx.lineTo(scrx, scry);
    ctx.lineTo(scrx + dockCrateS, scry - dockCrateS * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 0.4 * zoom;
    ctx.stroke();
  }

  // ---- VENT GRATING (3D isometric industrial detail) ----
  const ventGrateX = screenPos.x - 22 * zoom;
  const ventGrateY = screenPos.y - 6 * zoom;
  const vgW = 6 * zoom;
  const vgH = 4 * zoom;
  const vgD = 1.5 * zoom;
  // Vent recess (dark interior)
  ctx.fillStyle = "rgba(20, 20, 25, 0.7)";
  ctx.beginPath();
  ctx.moveTo(ventGrateX, ventGrateY + vgH);
  ctx.lineTo(ventGrateX, ventGrateY);
  ctx.lineTo(ventGrateX + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW, ventGrateY);
  ctx.lineTo(ventGrateX + vgW, ventGrateY + vgH);
  ctx.closePath();
  ctx.fill();
  // Vent frame (3D rim)
  ctx.strokeStyle = tower.level >= 4 ? "#8a7020" : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Top lip
  ctx.fillStyle = tower.level >= 4 ? "#7a6a30" : "#4a4a52";
  ctx.beginPath();
  ctx.moveTo(ventGrateX, ventGrateY);
  ctx.lineTo(ventGrateX + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW, ventGrateY);
  ctx.closePath();
  ctx.fill();
  // Grate slats
  ctx.strokeStyle = tower.level >= 4 ? "#8a7020" : "#5a5a62";
  ctx.lineWidth = 0.6 * zoom;
  for (let vl = 0; vl < 4; vl++) {
    const vlx = ventGrateX + (vl + 0.5) * 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(vlx, ventGrateY + 0.5 * zoom);
    ctx.lineTo(vlx, ventGrateY + vgH - 0.5 * zoom);
    ctx.stroke();
  }
  // Vent glow when active
  if (stationActive) {
    const ventGlow = 0.1 + stationIntensity * 0.2;
    ctx.fillStyle = isStationAttacking
      ? `rgba(255, 80, 30, ${ventGlow})`
      : `rgba(255, 150, 50, ${ventGlow})`;
    ctx.beginPath();
    ctx.moveTo(ventGrateX + 0.5 * zoom, ventGrateY + vgH - 0.5 * zoom);
    ctx.lineTo(ventGrateX + 0.5 * zoom, ventGrateY + 0.5 * zoom);
    ctx.lineTo(ventGrateX + vgW - 0.5 * zoom, ventGrateY + 0.5 * zoom);
    ctx.lineTo(ventGrateX + vgW - 0.5 * zoom, ventGrateY + vgH - 0.5 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // ---- STATUS DISPLAY BOARD ----
  const boardX = screenPos.x + 12 * zoom;
  const boardY = screenPos.y - (22 + tower.level * 2) * zoom;
  const boardW = 12 * zoom;
  const boardH = 7 * zoom;

  // Board frame (3D isometric)
  const boardD = 2 * zoom;
  const bfLeft = boardX - boardW * 0.5;
  const bfTop = boardY - boardH * 0.5;
  // Front face
  ctx.fillStyle = tower.level >= 4 ? "#3a2a1a" : "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(bfLeft, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop + boardH);
  ctx.lineTo(bfLeft, bfTop + boardH);
  ctx.closePath();
  ctx.fill();
  // Top face (depth)
  ctx.fillStyle = tower.level >= 4 ? "#4a3a2a" : "#2a2a32";
  ctx.beginPath();
  ctx.moveTo(bfLeft, bfTop);
  ctx.lineTo(bfLeft + boardD * 0.5, bfTop - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW + boardD * 0.5, bfTop - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW, bfTop);
  ctx.closePath();
  ctx.fill();
  // Right face (depth)
  ctx.fillStyle = tower.level >= 4 ? "#2a1a0a" : "#0a0a12";
  ctx.beginPath();
  ctx.moveTo(bfLeft + boardW, bfTop);
  ctx.lineTo(bfLeft + boardW + boardD * 0.5, bfTop - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW + boardD * 0.5, bfTop + boardH - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW, bfTop + boardH);
  ctx.closePath();
  ctx.fill();
  // Frame border
  ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(bfLeft, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop + boardH);
  ctx.lineTo(bfLeft, bfTop + boardH);
  ctx.closePath();
  ctx.stroke();

  // Board screen (dark green/amber depending on level)
  const screenColor =
    tower.level >= 4 ? "rgba(40, 35, 10, 0.9)" : "rgba(10, 25, 15, 0.9)";
  ctx.fillStyle = screenColor;
  ctx.beginPath();
  ctx.moveTo(bfLeft + 1 * zoom, bfTop + 1 * zoom);
  ctx.lineTo(bfLeft + boardW - 1 * zoom, bfTop + 1 * zoom);
  ctx.lineTo(bfLeft + boardW - 1 * zoom, bfTop + boardH - 1 * zoom);
  ctx.lineTo(bfLeft + 1 * zoom, bfTop + boardH - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // Animated text ticker (scrolling dots/dashes simulating a train schedule)
  const tickerSpeed = stationActive ? time * 2 : time * 1.5;
  const dotColor = tower.level >= 4 ? "#c9a227" : "#33cc33";
  const dotAlertColor = stationActive
    ? isStationAttacking
      ? "#ff4422"
      : "#ff6c00"
    : dotColor;
  ctx.fillStyle = dotAlertColor;
  const tickerDots = 5;
  for (let td = 0; td < tickerDots; td++) {
    const tdX =
      boardX -
      boardW * 0.4 +
      (((td * 2.5 + tickerSpeed * 2) % (boardW * 0.8)) * zoom) / zoom;
    const tdAlpha = 0.4 + Math.sin(time * 3 + td * 1.5) * 0.3;
    ctx.globalAlpha = tdAlpha;
    ctx.beginPath();
    ctx.arc(tdX + 0.75 * zoom, boardY - 0.5 * zoom, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Status indicator dots (bottom of board)
  const statusDots = [
    { color: stationActive ? "#ff3333" : "#33cc33", x: -3 },
    { color: stationActive ? "#ffaa00" : "#33cc33", x: 0 },
    { color: "#33cc33", x: 3 },
  ];
  for (const sd of statusDots) {
    const sdBlink = 0.5 + Math.sin(time * 4 + sd.x) * 0.3;
    ctx.fillStyle = sd.color;
    ctx.globalAlpha = sdBlink;
    ctx.beginPath();
    ctx.arc(
      boardX + sd.x * zoom,
      boardY + boardH * 0.3,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Board mounting bracket (3D)
  const brkW = 1 * zoom;
  const brkH = 4 * zoom;
  const brkD = 0.8 * zoom;
  ctx.fillStyle = tower.level >= 4 ? "#8a7020" : "#4a4a52";
  ctx.beginPath();
  ctx.moveTo(boardX - brkW, boardY + boardH * 0.5);
  ctx.lineTo(boardX + brkW, boardY + boardH * 0.5);
  ctx.lineTo(boardX + brkW, boardY + boardH * 0.5 + brkH);
  ctx.lineTo(boardX - brkW, boardY + boardH * 0.5 + brkH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tower.level >= 4 ? "#9a8030" : "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(boardX + brkW, boardY + boardH * 0.5);
  ctx.lineTo(boardX + brkW + brkD, boardY + boardH * 0.5 - brkD * 0.5);
  ctx.lineTo(boardX + brkW + brkD, boardY + boardH * 0.5 + brkH - brkD * 0.5);
  ctx.lineTo(boardX + brkW, boardY + boardH * 0.5 + brkH);
  ctx.closePath();
  ctx.fill();

  // ---- ROTATING RADAR DISH (mounted on building roof, rendered before trains) ----
  // Position radar on top of the building, near the right side
  const radarBaseX = screenPos.x + 10 * zoom;
  const radarBaseY = screenPos.y - (20 + tower.level * 5) * zoom;
  const radarSpeed = stationActive ? 1.8 : 1.2;
  const radarAngle = time * radarSpeed;

  const rdMastCol =
    tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#6a6a72" : "#5a4a3a";
  const rdMastDark =
    tower.level >= 4 ? "#a08020" : tower.level >= 3 ? "#5a5a62" : "#4a3a2a";
  const rdMastLight =
    tower.level >= 4 ? "#d4b030" : tower.level >= 3 ? "#7a7a82" : "#6a5a4a";

  // Short mast (sits on the roof, not floating)
  const rdMastH = 8 * zoom;
  drawIsometricPrism(
    ctx,
    radarBaseX,
    radarBaseY + rdMastH,
    2,
    1.5,
    rdMastH / zoom,
    { top: rdMastLight, left: rdMastDark, right: rdMastCol },
    zoom,
  );

  // Mounting bracket base (small platform on roof)
  const rdPlatY = radarBaseY;
  ctx.fillStyle = rdMastDark;
  ctx.beginPath();
  ctx.ellipse(
    radarBaseX,
    rdPlatY + 0.5 * zoom,
    3 * zoom,
    1.5 * zoom,
    0,
    0,
    Math.PI,
  );
  ctx.lineTo(radarBaseX - 3 * zoom, rdPlatY - 0.5 * zoom);
  ctx.ellipse(
    radarBaseX,
    rdPlatY - 0.5 * zoom,
    3 * zoom,
    1.5 * zoom,
    0,
    Math.PI,
    0,
    true,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rdMastLight;
  ctx.beginPath();
  ctx.ellipse(
    radarBaseX,
    rdPlatY - 0.5 * zoom,
    3 * zoom,
    1.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Pivot post (vertical rod from platform)
  const rdPivotH = 3 * zoom;
  ctx.fillStyle = rdMastCol;
  ctx.fillRect(
    radarBaseX - 0.5 * zoom,
    rdPlatY - rdPivotH - 0.5 * zoom,
    1 * zoom,
    rdPivotH,
  );

  // Pivot hub
  const rdHubY = rdPlatY - rdPivotH - 0.5 * zoom;
  ctx.fillStyle = tower.level >= 4 ? "#b89227" : "#6a6a72";
  ctx.beginPath();
  ctx.arc(radarBaseX, rdHubY, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === 3D DISH (proper isometric, not just an ellipse) ===
  const rdSinA = Math.sin(radarAngle);
  const rdCosA = Math.cos(radarAngle);
  const rdDishRadius = (6 + tower.level * 1.2) * zoom * levelScale;
  const rdDishDepth = 3 * zoom;
  const rdDishY = rdHubY;

  const rdDishCX = radarBaseX + rdSinA * 2 * zoom;
  const rdDishCY = rdDishY;

  const rdViewAngle = Math.abs(rdSinA);
  const rdEdgeView = Math.abs(rdCosA);

  // Support arm from hub to dish center
  ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#6a6a72";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(radarBaseX, rdHubY);
  ctx.lineTo(rdDishCX, rdDishCY);
  ctx.stroke();

  if (rdViewAngle > 0.3) {
    const rdFaceW = rdDishRadius * rdViewAngle;
    const rdFaceH = rdDishRadius;
    const rdBowlDepth = rdDishDepth * rdEdgeView;
    const rdFacing = rdSinA > 0;

    if (rdBowlDepth > 0.5 * zoom) {
      ctx.fillStyle = tower.level >= 4 ? "#8a7020" : "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(
        rdDishCX + (rdFacing ? rdBowlDepth : -rdBowlDepth),
        rdDishCY - rdFaceH,
      );
      ctx.quadraticCurveTo(
        rdDishCX +
          (rdFacing
            ? rdBowlDepth + rdFaceW * 0.5
            : -rdBowlDepth - rdFaceW * 0.5),
        rdDishCY,
        rdDishCX + (rdFacing ? rdBowlDepth : -rdBowlDepth),
        rdDishCY + rdFaceH,
      );
      ctx.lineTo(rdDishCX, rdDishCY + rdFaceH);
      ctx.quadraticCurveTo(
        rdDishCX + (rdFacing ? rdFaceW * 0.4 : -rdFaceW * 0.4),
        rdDishCY,
        rdDishCX,
        rdDishCY - rdFaceH,
      );
      ctx.closePath();
      ctx.fill();
    }

    const rdDishGrad = ctx.createRadialGradient(
      rdDishCX,
      rdDishCY,
      0,
      rdDishCX,
      rdDishCY,
      rdFaceH,
    );
    if (tower.level >= 4) {
      rdDishGrad.addColorStop(0, "#fff8e0");
      rdDishGrad.addColorStop(0.4, "#e8c847");
      rdDishGrad.addColorStop(0.8, "#c9a227");
      rdDishGrad.addColorStop(1, "#a08020");
    } else {
      rdDishGrad.addColorStop(0, "#d0d0d8");
      rdDishGrad.addColorStop(0.4, "#b0b0b8");
      rdDishGrad.addColorStop(0.8, "#9090a0");
      rdDishGrad.addColorStop(1, "#6a6a72");
    }
    ctx.fillStyle = rdDishGrad;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdFaceH);
    ctx.quadraticCurveTo(
      rdDishCX + (rdFacing ? rdFaceW * 0.5 : -rdFaceW * 0.5),
      rdDishCY,
      rdDishCX,
      rdDishCY + rdFaceH,
    );
    ctx.quadraticCurveTo(
      rdDishCX - (rdFacing ? rdFaceW * 0.15 : -rdFaceW * 0.15),
      rdDishCY,
      rdDishCX,
      rdDishCY - rdFaceH,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = tower.level >= 4 ? "#b89227" : "#7a7a82";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdFaceH);
    ctx.quadraticCurveTo(
      rdDishCX + (rdFacing ? rdFaceW * 0.5 : -rdFaceW * 0.5),
      rdDishCY,
      rdDishCX,
      rdDishCY + rdFaceH,
    );
    ctx.stroke();

    ctx.strokeStyle =
      tower.level >= 4 ? "rgba(255,248,224,0.3)" : "rgba(200,200,210,0.3)";
    ctx.lineWidth = 0.5 * zoom;
    for (let cr = 1; cr <= 3; cr++) {
      const crS = cr / 4;
      ctx.beginPath();
      ctx.moveTo(rdDishCX, rdDishCY - rdFaceH * crS);
      ctx.quadraticCurveTo(
        rdDishCX + (rdFacing ? rdFaceW * 0.4 * crS : -rdFaceW * 0.4 * crS),
        rdDishCY,
        rdDishCX,
        rdDishCY + rdFaceH * crS,
      );
      ctx.stroke();
    }

    const rdRecX = rdDishCX + (rdFacing ? -rdFaceW * 0.6 : rdFaceW * 0.6);
    const rdRecY = rdDishCY;
    ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#7a7a82";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdFaceH * 0.6);
    ctx.lineTo(rdRecX, rdRecY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY + rdFaceH * 0.6);
    ctx.lineTo(rdRecX, rdRecY);
    ctx.stroke();

    const rdRecCol = stationActive
      ? "#ff6633"
      : tower.level >= 4
        ? "#e8c847"
        : "#5a5a62";
    ctx.fillStyle = rdRecCol;
    if (stationActive) {
      ctx.shadowColor = "#ff6633";
      ctx.shadowBlur = 6 * zoom;
    }
    ctx.beginPath();
    ctx.arc(rdRecX, rdRecY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    const rdProfileH = rdDishRadius;
    const rdProfileW = rdDishDepth;
    const rdDir = rdCosA > 0 ? 1 : -1;

    ctx.fillStyle = tower.level >= 4 ? "#c9a227" : "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdProfileH);
    ctx.quadraticCurveTo(
      rdDishCX + rdDir * rdProfileW,
      rdDishCY,
      rdDishCX,
      rdDishCY + rdProfileH,
    );
    ctx.lineTo(rdDishCX + rdDir * 1 * zoom, rdDishCY + rdProfileH);
    ctx.quadraticCurveTo(
      rdDishCX + rdDir * (rdProfileW + 1 * zoom),
      rdDishCY,
      rdDishCX + rdDir * 1 * zoom,
      rdDishCY - rdProfileH,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = tower.level >= 4 ? "#b89227" : "#5a5a62";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdProfileH);
    ctx.quadraticCurveTo(
      rdDishCX + rdDir * rdProfileW,
      rdDishCY,
      rdDishCX,
      rdDishCY + rdProfileH,
    );
    ctx.stroke();
  }

  if (stationActive) {
    const sweepAlpha = 0.15 + stationIntensity * 0.3;
    ctx.strokeStyle = `rgba(255, 108, 0, ${sweepAlpha})`;
    ctx.lineWidth = 2 * zoom;
    const sweepR = (8 + tower.level * 2) * zoom;
    ctx.beginPath();
    ctx.arc(radarBaseX, rdHubY, sweepR, radarAngle, radarAngle + 0.5);
    ctx.stroke();
  }

  // ========== DETAILED ISOMETRIC TRAINS ==========
  // CORRECT LAYERING: Draw cab FIRST (bottom-right), then boiler, then tender LAST (top-left)
  // This makes tender appear "in front" visually
  const trainAnimProgress = tower.trainAnimProgress || 0;
  const trainVisible = trainAnimProgress > 0 && trainAnimProgress < 1;

  if (trainVisible) {
    let trainT = 0;
    let trainAlpha = 1;

    if (trainAnimProgress < 0.25) {
      trainT = 0.45 - (trainAnimProgress / 0.25) * 0.45;
      trainAlpha = Math.min(1, trainAnimProgress / 0.15);
    } else if (trainAnimProgress < 0.75) {
      trainT = 0;
      trainAlpha = 1;
    } else {
      trainT = -((trainAnimProgress - 0.75) / 0.25) * 0.45;
      trainAlpha = Math.max(0, 1 - (trainAnimProgress - 0.75) / 0.2);
    }

    const trackLen = baseW * 0.9 * zoom;
    const trainX = screenPos.x + trackLen * trainT;
    const trainY = screenPos.y - trackLen * trainT * 0.5 - 6 * zoom;

    ctx.save();
    ctx.globalAlpha = trainAlpha;

    // Isometric offset - positive = toward bottom-right (front), negative = toward top-left (back)
    const isoOffset = (baseX: number, baseY: number, offset: number) => ({
      x: baseX + offset * zoom,
      y: baseY - offset * zoom * 0.5,
    });

    // Draw a 3D isometric horizontal cylinder along the track direction
    const drawIsoBoiler = (
      cx: number,
      cy: number,
      halfLen: number,
      radius: number,
      bodyCol: string,
      darkCol: string,
      lightCol: string,
    ) => {
      const bk = isoOffset(cx, cy, -halfLen);
      const ft = isoOffset(cx, cy, halfLen);
      const r = radius * zoom;
      const er = r * 0.55;

      // === BACK CAP with outer lip for depth ===
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.ellipse(bk.x, bk.y, er + 1 * zoom, r + 1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.ellipse(bk.x, bk.y, er, r, 0, 0, Math.PI * 2);
      ctx.fill();

      // === BODY — 16-facet cylinder with per-facet angle-based lighting ===
      const facets = 16;
      const bkPts: { x: number; y: number }[] = [];
      const ftPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= facets; i++) {
        const a = Math.PI + (i / facets) * Math.PI;
        const fy = Math.sin(a) * r;
        const fx = Math.cos(a) * er;
        bkPts.push({ x: bk.x + fx, y: bk.y + fy });
        ftPts.push({ x: ft.x + fx, y: ft.y + fy });
      }

      for (let i = 0; i < facets; i++) {
        const midAngle = Math.PI + ((i + 0.5) / facets) * Math.PI;
        const normalUp = -Math.sin(midAngle);

        ctx.fillStyle = bodyCol;
        ctx.beginPath();
        ctx.moveTo(bkPts[i].x, bkPts[i].y);
        ctx.lineTo(bkPts[i + 1].x, bkPts[i + 1].y);
        ctx.lineTo(ftPts[i + 1].x, ftPts[i + 1].y);
        ctx.lineTo(ftPts[i].x, ftPts[i].y);
        ctx.closePath();
        ctx.fill();

        if (normalUp > 0) {
          ctx.fillStyle = `rgba(255,255,255,${normalUp * 0.28})`;
        } else {
          ctx.fillStyle = `rgba(0,0,0,${-normalUp * 0.32})`;
        }
        ctx.fill();

        if (i > 0 && i < facets) {
          ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.abs(normalUp) * 0.04})`;
          ctx.lineWidth = 0.4 * zoom;
          ctx.beginPath();
          ctx.moveTo(bkPts[i].x, bkPts[i].y);
          ctx.lineTo(ftPts[i].x, ftPts[i].y);
          ctx.stroke();
        }
      }

      // === SPECULAR HIGHLIGHT — bright streak across the top ===
      const midX = (bk.x + ft.x) * 0.5;
      const midY = (bk.y + ft.y) * 0.5;
      const specGrad = ctx.createLinearGradient(
        midX, midY - r,
        midX, midY - r * 0.2,
      );
      specGrad.addColorStop(0, "rgba(255,255,255,0)");
      specGrad.addColorStop(0.3, "rgba(255,255,255,0.22)");
      specGrad.addColorStop(0.5, "rgba(255,255,255,0.3)");
      specGrad.addColorStop(0.7, "rgba(255,255,255,0.22)");
      specGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.moveTo(bk.x - er * 0.15, bk.y - r);
      ctx.lineTo(ft.x - er * 0.15, ft.y - r);
      ctx.lineTo(ft.x + er * 0.15, ft.y - r * 0.25);
      ctx.lineTo(bk.x + er * 0.15, bk.y - r * 0.25);
      ctx.closePath();
      ctx.fill();

      // === BOILER BANDS — 3D metallic rings wrapping the cylinder ===
      const numBands = 3;
      for (let b = 0; b < numBands; b++) {
        const t = (b + 1) / (numBands + 1);
        const bandCx = bk.x + (ft.x - bk.x) * t;
        const bandCy = bk.y + (ft.y - bk.y) * t;
        const bandW = 1.8 * zoom;

        ctx.strokeStyle = lightCol;
        ctx.lineWidth = bandW;
        ctx.beginPath();
        ctx.ellipse(bandCx, bandCy, er, r, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(bandCx, bandCy - bandW * 0.35, er * 0.98, r * 0.98, 0, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(bandCx, bandCy + bandW * 0.35, er * 0.98, r * 0.98, 0, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }

      // === RIVETS along top and bottom seam lines ===
      const numRivets = 5;
      for (let rv = 0; rv < numRivets; rv++) {
        const t = (rv + 0.5) / numRivets;
        const rx = bk.x + (ft.x - bk.x) * t;
        const ryTop = (bk.y - r * 0.92) + ((ft.y - r * 0.92) - (bk.y - r * 0.92)) * t;
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.arc(rx, ryTop, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.arc(rx - 0.2 * zoom, ryTop - 0.2 * zoom, 0.3 * zoom, 0, Math.PI * 2);
        ctx.fill();

        const ryBot = bk.y + (ft.y - bk.y) * t;
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.arc(rx, ryBot, 0.6 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // === SILHOUETTE OUTLINES ===
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(bk.x - er, bk.y);
      ctx.lineTo(ft.x - er, ft.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bk.x + er, bk.y);
      ctx.lineTo(ft.x + er, ft.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bk.x, bk.y - r);
      ctx.lineTo(ft.x, ft.y - r);
      ctx.stroke();

      // === FRONT CAP — 3D recessed disc with radial gradient ===
      ctx.fillStyle = lightCol;
      ctx.beginPath();
      ctx.ellipse(ft.x, ft.y, er + 1.2 * zoom, r + 1.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      const capGrad = ctx.createRadialGradient(
        ft.x - er * 0.25, ft.y - r * 0.25, 0,
        ft.x, ft.y, r,
      );
      capGrad.addColorStop(0, lightCol);
      capGrad.addColorStop(0.5, bodyCol);
      capGrad.addColorStop(1, darkCol);
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.ellipse(ft.x, ft.y, er, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(ft.x, ft.y, er * 0.6, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(ft.x, ft.y, er * 0.72, r * 0.72, 0, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      // Front cap rivets (8-point ring)
      for (let bi = 0; bi < 8; bi++) {
        const ba = (bi / 8) * Math.PI * 2;
        const bx = ft.x + Math.cos(ba) * er * 0.82;
        const by = ft.y + Math.sin(ba) * r * 0.82;
        ctx.fillStyle = "rgba(60,50,40,0.45)";
        ctx.beginPath();
        ctx.arc(bx, by, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.arc(bx - 0.15 * zoom, by - 0.15 * zoom, 0.3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center bolt
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.arc(ft.x - 0.3 * zoom, ft.y - 0.3 * zoom, 0.45 * zoom, 0, Math.PI * 2);
      ctx.fill();
    };

    // Dark contrast track bed for Level 4 trains (makes them pop against gold buildings)
    if (tower.level >= 4) {
      const tbL = isoOffset(trainX, trainY + 5 * zoom, 15);
      const tbR = isoOffset(trainX, trainY + 5 * zoom, -15);
      const tbThick = 3 * zoom;
      const tbHalfW = 5 * zoom;
      // Track bed - dark isometric slab under the train
      ctx.fillStyle = tower.upgrade === "A" ? "#3a3530" : "#2a2825";
      ctx.beginPath();
      ctx.moveTo(tbL.x, tbL.y - tbHalfW * 0.5);
      ctx.lineTo(tbR.x, tbR.y - tbHalfW * 0.5);
      ctx.lineTo(tbR.x, tbR.y + tbHalfW * 0.5);
      ctx.lineTo(tbR.x + tbThick, tbR.y + tbHalfW * 0.5 + tbThick * 0.5);
      ctx.lineTo(tbL.x + tbThick, tbL.y + tbHalfW * 0.5 + tbThick * 0.5);
      ctx.lineTo(tbL.x, tbL.y + tbHalfW * 0.5);
      ctx.closePath();
      ctx.fill();
      // Track rails (bright metal contrast)
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5 * zoom;
      const r1L = isoOffset(trainX, trainY + 4 * zoom, 14);
      const r1R = isoOffset(trainX, trainY + 4 * zoom, -14);
      const r2L = isoOffset(trainX, trainY + 6 * zoom, 14);
      const r2R = isoOffset(trainX, trainY + 6 * zoom, -14);
      ctx.beginPath();
      ctx.moveTo(r1L.x, r1L.y);
      ctx.lineTo(r1R.x, r1R.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r2L.x, r2L.y);
      ctx.lineTo(r2R.x, r2R.y);
      ctx.stroke();
    }

    // Shadow (stronger for Level 4)
    ctx.fillStyle = tower.level >= 4 ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(
      trainX,
      trainY + 10 * zoom,
      18 * zoom,
      8 * zoom,
      -0.46,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Improved wheel helper - more realistic train wheel
    const drawWheel = (
      wx: number,
      wy: number,
      r: number,
      mainColor: string,
      rimColor: string,
    ) => {
      // Wheel outer rim
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(wx, wy, r * zoom, r * zoom * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner wheel face
      ctx.fillStyle = rimColor;
      ctx.beginPath();
      ctx.ellipse(wx, wy, r * zoom * 0.7, r * zoom * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spokes
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 1 * zoom;
      const spokeCount = 5;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2 + time * 3;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(
          wx + Math.cos(angle) * r * zoom * 0.6,
          wy + Math.sin(angle) * r * zoom * 0.3,
        );
        ctx.stroke();
      }

      // Center hub
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(wx, wy, r * zoom * 0.2, r * zoom * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    if (tower.level === 1) {
      // ========== LEVEL 1: Wooden Steam Train ==========
      const cabPos = isoOffset(trainX, trainY, 6);
      const boilerPos = isoOffset(trainX, trainY, 0);
      const tenderPos = isoOffset(trainX, trainY, -6);
      const wheelY = trainY + 4 * zoom;

      // --- UNDERCARRIAGE: Iron chassis frame ---
      ctx.fillStyle = "#2a2018";
      ctx.beginPath();
      const chStart = isoOffset(trainX, trainY + 2 * zoom, -9);
      const chEnd = isoOffset(trainX, trainY + 2 * zoom, 9);
      ctx.moveTo(chStart.x, chStart.y);
      ctx.lineTo(chEnd.x, chEnd.y);
      ctx.lineTo(chEnd.x, chEnd.y + 2 * zoom);
      ctx.lineTo(chStart.x, chStart.y + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1e1810";
      ctx.beginPath();
      ctx.moveTo(chStart.x - 2 * zoom, chStart.y + 1 * zoom);
      ctx.lineTo(chEnd.x - 2 * zoom, chEnd.y + 1 * zoom);
      ctx.lineTo(chEnd.x - 2 * zoom, chEnd.y + 3 * zoom);
      ctx.lineTo(chStart.x - 2 * zoom, chStart.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();

      // Leaf springs over each wheel pair
      ctx.strokeStyle = "#3a3028";
      ctx.lineWidth = 1.2 * zoom;
      for (const so of [8, 4, -3, -8]) {
        const sp = isoOffset(trainX, wheelY - 1 * zoom, so);
        ctx.beginPath();
        ctx.moveTo(sp.x - 2.5 * zoom, sp.y + 0.5 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 1.5 * zoom,
          sp.x + 2.5 * zoom,
          sp.y + 0.5 * zoom,
        );
        ctx.stroke();
      }

      // --- WHEELS ---
      drawWheel(
        isoOffset(trainX, wheelY, 8).x,
        isoOffset(trainX, wheelY, 8).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a",
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -3).x,
        isoOffset(trainX, wheelY, -3).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -8).x,
        isoOffset(trainX, wheelY, -8).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a",
      );

      // Connecting rods between drive wheels (animated)
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 1.5 * zoom;
      const rodPhase = time * 3;
      const rodW1 = isoOffset(trainX, wheelY, 8);
      const rodW2 = isoOffset(trainX, wheelY, 4);
      const rodDy = Math.sin(rodPhase) * 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(rodW1.x + rodDy, rodW1.y);
      ctx.lineTo(rodW2.x + rodDy, rodW2.y);
      ctx.stroke();

      // === CAB (front, draw first - appears in back) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        10,
        9,
        14,
        { top: "#6b5030", left: "#5a4020", right: "#4a3010" },
        zoom,
      );

      // Wooden plank lines on left face
      ctx.strokeStyle = "#4a3515";
      ctx.lineWidth = 0.7 * zoom;
      for (let p = 0; p < 5; p++) {
        const py = cabPos.y - 2 * zoom - p * 2.5 * zoom;
        const pL = isoOffset(cabPos.x, py, -5);
        const pR = isoOffset(cabPos.x, py, 0);
        ctx.beginPath();
        ctx.moveTo(pL.x - 5 * zoom, pL.y);
        ctx.lineTo(pR.x - 5 * zoom, pR.y);
        ctx.stroke();
      }
      // Wooden plank lines on right face
      ctx.strokeStyle = "#3a2508";
      for (let p = 0; p < 5; p++) {
        const py = cabPos.y - 2 * zoom - p * 2.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(cabPos.x + 1 * zoom, py + 0.5 * p * zoom);
        ctx.lineTo(cabPos.x + 5 * zoom, py - 1.5 * zoom + 0.5 * p * zoom);
        ctx.stroke();
      }

      // Cab roof with overhang and visible eaves
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y - 14 * zoom,
        12,
        11,
        2,
        { top: "#5a4020", left: "#4a3010", right: "#3a2000" },
        zoom,
      );
      ctx.fillStyle = "#3a2000";
      ctx.beginPath();
      const eaveR1 = isoOffset(cabPos.x, cabPos.y - 14 * zoom, 6);
      const eaveR2 = isoOffset(cabPos.x, cabPos.y - 14 * zoom, -6);
      ctx.moveTo(eaveR1.x + 6 * zoom, eaveR1.y);
      ctx.lineTo(eaveR2.x + 6 * zoom, eaveR2.y);
      ctx.lineTo(eaveR2.x + 6 * zoom, eaveR2.y + 1 * zoom);
      ctx.lineTo(eaveR1.x + 6 * zoom, eaveR1.y + 1 * zoom);
      ctx.closePath();
      ctx.fill();

      // Right face window (isometric parallelogram with warm glow)
      const cabGlow = 0.5 + Math.sin(time * 2) * 0.2;
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1.5 * zoom, cabPos.y - 8 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 10.5 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 5.5 * zoom);
      ctx.lineTo(cabPos.x + 1.5 * zoom, cabPos.y - 3 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 100, ${cabGlow})`;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 2 * zoom, cabPos.y - 7.5 * zoom);
      ctx.lineTo(cabPos.x + 4.5 * zoom, cabPos.y - 9.8 * zoom);
      ctx.lineTo(cabPos.x + 4.5 * zoom, cabPos.y - 6 * zoom);
      ctx.lineTo(cabPos.x + 2 * zoom, cabPos.y - 3.7 * zoom);
      ctx.closePath();
      ctx.fill();

      // Left face porthole window
      const sideWin = isoOffset(cabPos.x, cabPos.y - 9 * zoom, -3);
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.ellipse(
        sideWin.x - 5 * zoom,
        sideWin.y,
        2.2 * zoom,
        1.1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 100, ${cabGlow * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(
        sideWin.x - 5 * zoom,
        sideWin.y,
        1.6 * zoom,
        0.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#8b7355";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        sideWin.x - 5 * zoom,
        sideWin.y,
        2.2 * zoom,
        1.1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Door outline on right face
      ctx.strokeStyle = "#3a2508";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1 * zoom, cabPos.y - 1 * zoom);
      ctx.lineTo(cabPos.x + 3 * zoom, cabPos.y - 2 * zoom);
      ctx.lineTo(cabPos.x + 3 * zoom, cabPos.y - 10 * zoom);
      ctx.lineTo(cabPos.x + 1 * zoom, cabPos.y - 9 * zoom);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#8b7355";
      ctx.beginPath();
      ctx.arc(
        cabPos.x + 2.5 * zoom,
        cabPos.y - 5 * zoom,
        0.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Cab steps
      ctx.fillStyle = "#4a3010";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y + 2 * zoom);
      ctx.lineTo(cabPos.x + 7 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(cabPos.x + 7 * zoom, cabPos.y + 2 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y + 3.5 * zoom);
      ctx.lineTo(cabPos.x + 7.5 * zoom, cabPos.y + 2.5 * zoom);
      ctx.lineTo(cabPos.x + 7.5 * zoom, cabPos.y + 3.5 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y + 4.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // === BOILER (middle) - 3D isometric horizontal cylinder ===
      drawIsoBoiler(
        boilerPos.x,
        boilerPos.y - 5 * zoom,
        4.5,
        4,
        "#5e4830",
        "#4a3820",
        "#6a5238",
      );

      // Iron boiler bands
      ctx.strokeStyle = "#7a6040";
      ctx.lineWidth = 1.2 * zoom;
      for (let b = 0; b < 3; b++) {
        const bandPos = isoOffset(
          boilerPos.x,
          boilerPos.y - 5 * zoom,
          -3 + b * 3,
        );
        ctx.beginPath();
        ctx.ellipse(
          bandPos.x,
          bandPos.y,
          4 * zoom * 0.55 + 0.3 * zoom,
          4 * zoom + 0.3 * zoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // Dome on top of boiler
      const domePosL1 = isoOffset(
        boilerPos.x,
        boilerPos.y - 5 * zoom - 4 * zoom,
        0,
      );
      ctx.fillStyle = "#5a4830";
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y,
        2.5 * zoom,
        3.5 * zoom,
        0,
        Math.PI,
        0,
      );
      ctx.fill();
      ctx.fillStyle = "#4a3820";
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y,
        2.5 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#8b7355";
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y - 3 * zoom,
        1.2 * zoom,
        0.6 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Smokestack - proper 3D truncated cone (wider at top) with cap ring
      const stackPos = isoOffset(boilerPos.x, boilerPos.y - 13 * zoom, 3);
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 3.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 3.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a3a2a";
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 10 * zoom,
        4 * zoom,
        2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y,
        2 * zoom,
        1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Multiple smoke puffs at different heights/sizes
      for (let puff = 0; puff < 4; puff++) {
        const puffAge = (time * 2 + puff * 1.2) % 5;
        const puffY = stackPos.y - 12 * zoom - puffAge * 4 * zoom;
        const puffX =
          stackPos.x + Math.sin(time * 2 + puff) * (2 + puff) * zoom;
        const puffR = (2 + puff * 1.5 + puffAge * 0.8) * zoom;
        const puffA = Math.max(0, 0.4 - puffAge * 0.08);
        ctx.fillStyle = `rgba(220, 220, 220, ${puffA})`;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Headlight: mounted on boiler front cap with bracket
      const lightPos = isoOffset(boilerPos.x, boilerPos.y - 5 * zoom, 4.5);
      // Mounting bracket arm from boiler body to light
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(lightPos.x - 2 * zoom, lightPos.y + 1 * zoom);
      ctx.lineTo(lightPos.x + 1.5 * zoom, lightPos.y - 1 * zoom);
      ctx.stroke();
      // Hexagonal lantern housing
      ctx.fillStyle = "#7a6345";
      ctx.beginPath();
      for (let hi = 0; hi < 6; hi++) {
        const ha = (hi / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = lightPos.x + 1.5 * zoom + Math.cos(ha) * 2 * zoom;
        const hy = lightPos.y - 0.5 * zoom + Math.sin(ha) * 2 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = `rgba(255, 250, 200, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(
        lightPos.x + 1.5 * zoom,
        lightPos.y - 0.5 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bell on top with bracket
      const bellPos = isoOffset(boilerPos.x, boilerPos.y - 16 * zoom, 0);
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bellPos.x - 1 * zoom, bellPos.y + 3 * zoom);
      ctx.lineTo(bellPos.x, bellPos.y + 1 * zoom);
      ctx.lineTo(bellPos.x + 1 * zoom, bellPos.y + 3 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(bellPos.x - 2 * zoom, bellPos.y);
      ctx.quadraticCurveTo(
        bellPos.x - 2.5 * zoom,
        bellPos.y + 2 * zoom,
        bellPos.x - 1 * zoom,
        bellPos.y + 3 * zoom,
      );
      ctx.lineTo(bellPos.x + 1 * zoom, bellPos.y + 3 * zoom);
      ctx.quadraticCurveTo(
        bellPos.x + 2.5 * zoom,
        bellPos.y + 2 * zoom,
        bellPos.x + 2 * zoom,
        bellPos.y,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d4b030";
      ctx.beginPath();
      ctx.ellipse(bellPos.x, bellPos.y, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pressure gauge on boiler side
      const gaugePos = isoOffset(boilerPos.x, boilerPos.y - 6 * zoom, -4);
      ctx.fillStyle = "#e8e0d0";
      ctx.beginPath();
      ctx.arc(gaugePos.x - 5 * zoom, gaugePos.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.arc(gaugePos.x - 5 * zoom, gaugePos.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      const needleAngle = -Math.PI * 0.25 + Math.sin(time * 0.5) * 0.3;
      ctx.strokeStyle = "#aa0000";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(gaugePos.x - 5 * zoom, gaugePos.y);
      ctx.lineTo(
        gaugePos.x - 5 * zoom + Math.cos(needleAngle) * 1.5 * zoom,
        gaugePos.y + Math.sin(needleAngle) * 1.5 * zoom,
      );
      ctx.stroke();

      // === TENDER (back, draw last - appears in front) ===
      drawIsometricPrism(
        ctx,
        tenderPos.x,
        tenderPos.y,
        10,
        9,
        8,
        { top: "#7a6040", left: "#5a4020", right: "#4a3010" },
        zoom,
      );

      // Plank texture on left face
      ctx.strokeStyle = "#4a3515";
      ctx.lineWidth = 0.7 * zoom;
      for (let p = 0; p < 4; p++) {
        const py = tenderPos.y - 1 * zoom - p * 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(tenderPos.x - 5 * zoom - 4.5 * zoom, py + 2.3 * zoom);
        ctx.lineTo(tenderPos.x - 5 * zoom, py);
        ctx.stroke();
      }
      // Plank texture on right face
      ctx.strokeStyle = "#3a2508";
      for (let p = 0; p < 4; p++) {
        const py = tenderPos.y - 1 * zoom - p * 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(tenderPos.x + 1 * zoom, py + 0.5 * zoom);
        ctx.lineTo(tenderPos.x + 5 * zoom, py - 1.5 * zoom);
        ctx.stroke();
      }

      // Coal pile mound
      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.ellipse(
        tenderPos.x,
        tenderPos.y - 8 * zoom,
        4 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tenderPos.x, tenderPos.y - 8 * zoom, 3.5 * zoom, Math.PI, 0);
      ctx.fill();
      // Individual coal chunks
      ctx.fillStyle = "#2a2010";
      const coalSpots = [
        [0, 0],
        [-1.5, 0.5],
        [1.2, 0.3],
        [-0.5, -1],
        [1, -0.8],
        [-1.8, -0.3],
        [0.5, 0.7],
        [-0.8, -1.5],
        [1.5, -1.2],
        [0.3, -1.8],
      ];
      for (const [cx, cy] of coalSpots) {
        ctx.beginPath();
        ctx.arc(
          tenderPos.x + cx * zoom,
          tenderPos.y - 9.5 * zoom + cy * zoom,
          0.9 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Water tank indicator on left face
      const tankPos = isoOffset(tenderPos.x, tenderPos.y - 3 * zoom, -4);
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(
        tankPos.x - 6.5 * zoom,
        tankPos.y - 1.5 * zoom,
        2.5 * zoom,
        4 * zoom,
      );
      const waterLvl = 0.6 + Math.sin(time * 0.3) * 0.1;
      ctx.fillStyle = "#4488bb";
      ctx.fillRect(
        tankPos.x - 6.2 * zoom,
        tankPos.y - 1.2 * zoom + (1 - waterLvl) * 3.4 * zoom,
        1.9 * zoom,
        waterLvl * 3.4 * zoom,
      );
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 0.8 * zoom;
      ctx.strokeRect(
        tankPos.x - 6.5 * zoom,
        tankPos.y - 1.5 * zoom,
        2.5 * zoom,
        4 * zoom,
      );

      // Side railing on tender
      ctx.strokeStyle = "#5a4020";
      ctx.lineWidth = 1 * zoom;
      for (let i = 0; i < 3; i++) {
        const postX = tenderPos.x + 1 * zoom + i * 2 * zoom;
        const postBase = tenderPos.y - 4 * zoom - i * 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(postX, postBase + 4 * zoom);
        ctx.lineTo(postX, postBase);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(tenderPos.x + 1 * zoom, tenderPos.y - 4 * zoom);
      ctx.lineTo(tenderPos.x + 5 * zoom, tenderPos.y - 6 * zoom);
      ctx.stroke();

      // === COUPLINGS between cars ===
      const coup1 = isoOffset(trainX, trainY + 1 * zoom, 3);
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.arc(coup1.x, coup1.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(coup1.x - 1.5 * zoom, coup1.y);
      ctx.lineTo(coup1.x + 1.5 * zoom, coup1.y);
      ctx.stroke();
      const coup2 = isoOffset(trainX, trainY + 1 * zoom, -3);
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.arc(coup2.x, coup2.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(coup2.x - 1.5 * zoom, coup2.y);
      ctx.lineTo(coup2.x + 1.5 * zoom, coup2.y);
      ctx.stroke();

      // === ORANGE STRIPE (3D isometric band on right face) ===
      const stripeY = trainY - 2 * zoom;
      const stripeH = 2.5 * zoom;
      const stL = isoOffset(trainX, stripeY, -10);
      const stR = isoOffset(trainX, stripeY, 10);
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      // Stripe highlight edge
      ctx.fillStyle = "#ff7020";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 0.8 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 0.8 * zoom);
      ctx.closePath();
      ctx.fill();

      // Front headlight with mounting bracket from cab
      const frontLight = isoOffset(cabPos.x, cabPos.y - 5 * zoom, 5.5);
      // Bracket arm connecting cab to light
      ctx.strokeStyle = "#6a5335";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y - 6 * zoom);
      ctx.lineTo(frontLight.x + 1.5 * zoom, frontLight.y - 0.5 * zoom);
      ctx.stroke();
      // Hexagonal lantern housing
      ctx.fillStyle = "#7a6345";
      ctx.beginPath();
      for (let hi = 0; hi < 6; hi++) {
        const ha = (hi / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = frontLight.x + 1.5 * zoom + Math.cos(ha) * 2.2 * zoom;
        const hy = frontLight.y - 0.5 * zoom + Math.sin(ha) * 2.2 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = `rgba(255, 250, 200, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(
        frontLight.x + 1.5 * zoom,
        frontLight.y - 0.5 * zoom,
        1.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // === COWCATCHER at front (3D wedge attached to chassis) ===
      const cowPos = isoOffset(cabPos.x, cabPos.y, 5.5);
      // Mounting bars connecting cowcatcher to chassis
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(cowPos.x + 2 * zoom, cowPos.y + 2 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y - 2 * zoom);
      ctx.lineTo(cowPos.x + 2 * zoom, cowPos.y - 1 * zoom);
      ctx.stroke();
      // Right face (3D depth)
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(cowPos.x + 4 * zoom, cowPos.y - 4 * zoom);
      ctx.lineTo(cowPos.x - 3 * zoom, cowPos.y + 1 * zoom);
      ctx.lineTo(cowPos.x, cowPos.y + 4 * zoom);
      ctx.lineTo(cowPos.x + 3 * zoom, cowPos.y + 3 * zoom);
      ctx.lineTo(cowPos.x + 7 * zoom, cowPos.y - 1 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Left face (darker side)
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(cowPos.x + 4 * zoom, cowPos.y - 4 * zoom);
      ctx.lineTo(cowPos.x - 3 * zoom, cowPos.y + 1 * zoom);
      ctx.lineTo(cowPos.x - 3 * zoom, cowPos.y + 3 * zoom);
      ctx.lineTo(cowPos.x, cowPos.y + 4 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Horizontal bars
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 1.2 * zoom;
      for (let b = 0; b < 3; b++) {
        const barY = cowPos.y + 3 * zoom - b * 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(cowPos.x - 2 * zoom, barY);
        ctx.lineTo(cowPos.x + 5 * zoom, barY - 2.5 * zoom);
        ctx.stroke();
      }
    } else if (tower.level === 2) {
      // ========== LEVEL 2: Armored Military Train ==========
      const cabPos = isoOffset(trainX, trainY, 7);
      const locoPos = isoOffset(trainX, trainY, 0);
      const cargoPos = isoOffset(trainX, trainY, -7);
      const wheelY = trainY + 4 * zoom;

      // --- UNDERCARRIAGE: Heavy steel chassis frame ---
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      const chStart = isoOffset(trainX, trainY + 2 * zoom, -11);
      const chEnd = isoOffset(trainX, trainY + 2 * zoom, 11);
      ctx.moveTo(chStart.x, chStart.y);
      ctx.lineTo(chEnd.x, chEnd.y);
      ctx.lineTo(chEnd.x, chEnd.y + 2.5 * zoom);
      ctx.lineTo(chStart.x, chStart.y + 2.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#222228";
      ctx.beginPath();
      ctx.moveTo(chStart.x - 2.5 * zoom, chStart.y + 1.3 * zoom);
      ctx.lineTo(chEnd.x - 2.5 * zoom, chEnd.y + 1.3 * zoom);
      ctx.lineTo(chEnd.x - 2.5 * zoom, chEnd.y + 3.8 * zoom);
      ctx.lineTo(chStart.x - 2.5 * zoom, chStart.y + 3.8 * zoom);
      ctx.closePath();
      ctx.fill();

      // Heavy double suspension springs
      ctx.strokeStyle = "#3a3a42";
      ctx.lineWidth = 1.5 * zoom;
      for (const so of [10, 4, -3, -10]) {
        const sp = isoOffset(trainX, wheelY - 1 * zoom, so);
        ctx.beginPath();
        ctx.moveTo(sp.x - 3 * zoom, sp.y + 0.5 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 2 * zoom,
          sp.x + 3 * zoom,
          sp.y + 0.5 * zoom,
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sp.x - 2.5 * zoom, sp.y + 1 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 1 * zoom,
          sp.x + 2.5 * zoom,
          sp.y + 1 * zoom,
        );
        ctx.stroke();
      }

      // --- WHEELS ---
      drawWheel(
        isoOffset(trainX, wheelY, 10).x,
        isoOffset(trainX, wheelY, 10).y,
        4,
        "#5a5a62",
        "#3a3a42",
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        4,
        "#5a5a62",
        "#3a3a42",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -3).x,
        isoOffset(trainX, wheelY, -3).y,
        4,
        "#5a5a62",
        "#3a3a42",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -10).x,
        isoOffset(trainX, wheelY, -10).y,
        4,
        "#5a5a62",
        "#3a3a42",
      );

      // === CAB (front, draw first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        11,
        10,
        14,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );

      // Rivet lines on left face
      ctx.fillStyle = "#7a7a82";
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const rx = cabPos.x - 5.5 * zoom - col * 1 * zoom + row * 0.3 * zoom;
          const ry = cabPos.y - 2 * zoom - row * 4 * zoom + col * 0.5 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Rivet lines on right face
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const rx = cabPos.x + 1 * zoom + col * 1.2 * zoom;
          const ry = cabPos.y - 2 * zoom - row * 4 * zoom - col * 0.6 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Armored cab roof
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y - 14 * zoom,
        13,
        12,
        2,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom,
      );

      // Angled front armor plate (isometric parallelogram)
      const frontArmor = isoOffset(cabPos.x, cabPos.y, 7);
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(frontArmor.x - 5 * zoom, frontArmor.y - 4 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 9 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 1 * zoom);
      ctx.lineTo(frontArmor.x - 5 * zoom, frontArmor.y + 4 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(frontArmor.x - 5 * zoom, frontArmor.y - 4 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 9 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#7a7a82";
      for (let i = 0; i < 3; i++) {
        const arx = frontArmor.x - 2 * zoom + i * 3 * zoom;
        const ary = frontArmor.y - 3 * zoom - i * 1.5 * zoom;
        ctx.beginPath();
        ctx.arc(arx, ary, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vision slit (isometric parallelogram with green glow)
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1.5 * zoom, cabPos.y - 9 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 11 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 9.5 * zoom);
      ctx.lineTo(cabPos.x + 1.5 * zoom, cabPos.y - 7.5 * zoom);
      ctx.closePath();
      ctx.fill();
      const slitGlow = 0.4 + Math.sin(time * 2) * 0.15;
      ctx.fillStyle = `rgba(80, 200, 80, ${slitGlow})`;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 2 * zoom, cabPos.y - 8.8 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 10.6 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 9.7 * zoom);
      ctx.lineTo(cabPos.x + 2 * zoom, cabPos.y - 7.9 * zoom);
      ctx.closePath();
      ctx.fill();

      // Periscope with 3D housing
      const periPos = isoOffset(cabPos.x, cabPos.y - 16 * zoom, 2);
      drawIsometricPrism(
        ctx,
        periPos.x,
        periPos.y,
        3,
        3,
        6,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom,
      );
      ctx.fillStyle = "#88bbaa";
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y - 6 * zoom,
        1 * zoom,
        0.6 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Side armor skirts
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 5.5 * zoom - 2 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(cabPos.x - 5.5 * zoom + 3 * zoom, cabPos.y - 1.5 * zoom);
      ctx.lineTo(cabPos.x - 5.5 * zoom + 3 * zoom, cabPos.y + 3 * zoom);
      ctx.lineTo(cabPos.x - 5.5 * zoom - 2 * zoom, cabPos.y + 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y - 2 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom + 4 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom + 4 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        12,
        10,
        12,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );

      // Heavier industrial boiler (3D isometric horizontal cylinder)
      drawIsoBoiler(
        locoPos.x,
        locoPos.y - 6 * zoom,
        5,
        4.5,
        "#4a4a52",
        "#3a3a42",
        "#5a5a62",
      );

      // Armored bands
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 1.5 * zoom;
      for (let b = 0; b < 3; b++) {
        const bandPos = isoOffset(
          locoPos.x,
          locoPos.y - 6 * zoom,
          -3.5 + b * 3.5,
        );
        ctx.beginPath();
        ctx.ellipse(
          bandPos.x,
          bandPos.y,
          4.5 * zoom * 0.55 + 0.3 * zoom,
          4.5 * zoom + 0.3 * zoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // Exhaust stack with deflector cap
      const stackPos = isoOffset(locoPos.x, locoPos.y - 12 * zoom, 0);
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2.5 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2 * zoom, stackPos.y - 8 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y - 8 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y - 8 * zoom,
        7,
        6,
        2,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom,
      );
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 10 * zoom,
        3.5 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Dark industrial steam puffs
      for (let puff = 0; puff < 3; puff++) {
        const puffAge = (time * 2 + puff * 1.5) % 4;
        const puffY = stackPos.y - 12 * zoom - puffAge * 4 * zoom;
        const puffX =
          stackPos.x + Math.sin(time * 2 + puff * 1.2) * (2 + puff) * zoom;
        const puffR = (2.5 + puff * 1.2 + puffAge * 0.6) * zoom;
        const puffA = Math.max(0, 0.35 - puffAge * 0.09);
        ctx.fillStyle = `rgba(150, 150, 155, ${puffA})`;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Side-mounted steam pipes with valve wheels
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.5 * zoom;
      const pipeL1 = isoOffset(locoPos.x, locoPos.y - 4 * zoom, -4);
      const pipeL2 = isoOffset(locoPos.x, locoPos.y - 8 * zoom, -4);
      ctx.beginPath();
      ctx.moveTo(pipeL1.x - 6 * zoom, pipeL1.y);
      ctx.lineTo(pipeL2.x - 6 * zoom, pipeL2.y);
      ctx.stroke();
      ctx.strokeStyle = "#7a7a82";
      ctx.lineWidth = 1 * zoom;
      const valvePos = isoOffset(locoPos.x, locoPos.y - 6 * zoom, -4);
      ctx.beginPath();
      ctx.arc(valvePos.x - 6 * zoom, valvePos.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.arc(valvePos.x - 6 * zoom, valvePos.y, 0.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(locoPos.x + 5 * zoom, locoPos.y - 3 * zoom);
      ctx.lineTo(locoPos.x + 5 * zoom, locoPos.y - 9 * zoom);
      ctx.stroke();

      // Armored headlight housing with bracket
      const lightPos = isoOffset(locoPos.x, locoPos.y - 7 * zoom, 5.5);
      // Bracket from loco body
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(locoPos.x + 5 * zoom, locoPos.y - 8 * zoom);
      ctx.lineTo(lightPos.x + 1.5 * zoom, lightPos.y - 0.5 * zoom);
      ctx.stroke();
      // Hexagonal armored housing
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      for (let hi = 0; hi < 6; hi++) {
        const ha = (hi / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = lightPos.x + 1.5 * zoom + Math.cos(ha) * 2.2 * zoom;
        const hy = lightPos.y - 0.5 * zoom + Math.sin(ha) * 2.2 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = `rgba(255, 250, 200, ${0.5 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(
        lightPos.x + 1.5 * zoom,
        lightPos.y - 0.5 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // === CARGO/WEAPONS CAR (back, draw last) ===
      drawIsometricPrism(
        ctx,
        cargoPos.x,
        cargoPos.y,
        12,
        10,
        10,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom,
      );

      // Rivets on left face
      ctx.fillStyle = "#8a8a92";
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
          const rx =
            cargoPos.x - 6 * zoom - col * 0.8 * zoom + row * 0.2 * zoom;
          const ry =
            cargoPos.y - 1.5 * zoom - row * 5 * zoom + col * 0.4 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Rivets on right face
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          const rx = cargoPos.x + 1 * zoom + col * 1.2 * zoom;
          const ry =
            cargoPos.y - 1.5 * zoom - row * 5 * zoom - col * 0.6 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Arrow/gun slits as narrow isometric slots
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.moveTo(cargoPos.x - 6 * zoom, cargoPos.y - 4 * zoom);
      ctx.lineTo(cargoPos.x - 5.5 * zoom, cargoPos.y - 4.3 * zoom);
      ctx.lineTo(cargoPos.x - 5.5 * zoom, cargoPos.y - 7.3 * zoom);
      ctx.lineTo(cargoPos.x - 6 * zoom, cargoPos.y - 7 * zoom);
      ctx.closePath();
      ctx.fill();
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        ctx.moveTo(
          cargoPos.x + 1 * zoom + s * 3 * zoom,
          cargoPos.y - 3.5 * zoom - s * 1.5 * zoom,
        );
        ctx.lineTo(
          cargoPos.x + 1.5 * zoom + s * 3 * zoom,
          cargoPos.y - 3.8 * zoom - s * 1.5 * zoom,
        );
        ctx.lineTo(
          cargoPos.x + 1.5 * zoom + s * 3 * zoom,
          cargoPos.y - 7.8 * zoom - s * 1.5 * zoom,
        );
        ctx.lineTo(
          cargoPos.x + 1 * zoom + s * 3 * zoom,
          cargoPos.y - 7.5 * zoom - s * 1.5 * zoom,
        );
        ctx.closePath();
        ctx.fill();
      }

      // Shield/emblem as 3D raised medallion
      const shield = isoOffset(cargoPos.x, cargoPos.y - 5 * zoom, -4);
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.ellipse(
        shield.x - 5 * zoom,
        shield.y,
        3 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#e06000";
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(shield.x - 5 * zoom, shield.y - 2 * zoom);
      ctx.lineTo(shield.x - 5 * zoom - 2 * zoom, shield.y);
      ctx.lineTo(shield.x - 5 * zoom, shield.y + 2 * zoom);
      ctx.lineTo(shield.x - 5 * zoom + 2 * zoom, shield.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Side hatches with handles
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(cargoPos.x + 2 * zoom, cargoPos.y - 1 * zoom);
      ctx.lineTo(cargoPos.x + 4 * zoom, cargoPos.y - 2 * zoom);
      ctx.lineTo(cargoPos.x + 4 * zoom, cargoPos.y - 6 * zoom);
      ctx.lineTo(cargoPos.x + 2 * zoom, cargoPos.y - 5 * zoom);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(
        cargoPos.x + 3.5 * zoom,
        cargoPos.y - 3.5 * zoom,
        0.6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Mounted turret on top
      drawIsometricPrism(
        ctx,
        cargoPos.x,
        cargoPos.y - 10 * zoom,
        5,
        5,
        4,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );
      ctx.strokeStyle = "#3a3a42";
      ctx.lineWidth = 2 * zoom;
      const turretFront = isoOffset(cargoPos.x, cargoPos.y - 12 * zoom, 4);
      ctx.beginPath();
      ctx.moveTo(cargoPos.x + 1 * zoom, cargoPos.y - 12 * zoom);
      ctx.lineTo(turretFront.x, turretFront.y);
      ctx.stroke();
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.arc(turretFront.x, turretFront.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // === CHAINS/HOOKS between cars ===
      const chain1 = isoOffset(trainX, trainY + 1 * zoom, 3.5);
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(chain1.x - 2 * zoom, chain1.y);
      ctx.lineTo(chain1.x + 2 * zoom, chain1.y);
      ctx.stroke();
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(chain1.x - 2 * zoom, chain1.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(chain1.x + 2 * zoom, chain1.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      const chain2 = isoOffset(trainX, trainY + 1 * zoom, -3.5);
      ctx.beginPath();
      ctx.moveTo(chain2.x - 2 * zoom, chain2.y);
      ctx.lineTo(chain2.x + 2 * zoom, chain2.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(chain2.x - 2 * zoom, chain2.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(chain2.x + 2 * zoom, chain2.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Exhaust grating on locomotive side
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 0.8 * zoom;
      for (let g = 0; g < 4; g++) {
        const gy = locoPos.y - 2 * zoom - g * 1.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x + 5.5 * zoom, gy);
        ctx.lineTo(locoPos.x + 6.5 * zoom, gy - 0.5 * zoom);
        ctx.stroke();
      }

      // Front headlight with armored mounting bracket
      const frontLight = isoOffset(cabPos.x, cabPos.y - 6 * zoom, 7);
      // Bracket arm from cab armor to light housing
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y - 7 * zoom);
      ctx.lineTo(frontLight.x + 1.5 * zoom, frontLight.y - 0.5 * zoom);
      ctx.stroke();
      // Octagonal armored housing
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      for (let hi = 0; hi < 8; hi++) {
        const ha = (hi / 8) * Math.PI * 2;
        const hx = frontLight.x + 1.5 * zoom + Math.cos(ha) * 2.5 * zoom;
        const hy = frontLight.y - 0.5 * zoom + Math.sin(ha) * 2.5 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = `rgba(255, 250, 200, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(
        frontLight.x + 1.5 * zoom,
        frontLight.y - 0.5 * zoom,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // === PLOW/RAM at front (attached to chassis with bolts) ===
      const plowPos = isoOffset(cabPos.x, cabPos.y, 7);
      // Mounting struts from chassis to plow
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(plowPos.x + 2 * zoom, plowPos.y + 2 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y - 3 * zoom);
      ctx.lineTo(plowPos.x + 2 * zoom, plowPos.y - 2 * zoom);
      ctx.stroke();
      // Right face
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(plowPos.x + 5 * zoom, plowPos.y - 5 * zoom);
      ctx.lineTo(plowPos.x - 4 * zoom, plowPos.y + 1 * zoom);
      ctx.lineTo(plowPos.x, plowPos.y + 5 * zoom);
      ctx.lineTo(plowPos.x + 4 * zoom, plowPos.y + 3.5 * zoom);
      ctx.lineTo(plowPos.x + 8 * zoom, plowPos.y - 1 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Left face
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.moveTo(plowPos.x + 5 * zoom, plowPos.y - 5 * zoom);
      ctx.lineTo(plowPos.x - 4 * zoom, plowPos.y + 1 * zoom);
      ctx.lineTo(plowPos.x - 4 * zoom, plowPos.y + 3 * zoom);
      ctx.lineTo(plowPos.x, plowPos.y + 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Top edge highlight
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(plowPos.x + 5 * zoom, plowPos.y - 5 * zoom);
      ctx.lineTo(plowPos.x - 4 * zoom, plowPos.y + 1 * zoom);
      ctx.stroke();
      // Mounting bolts on plow face
      ctx.fillStyle = "#7a7a82";
      for (let bi = 0; bi < 3; bi++) {
        const bx = plowPos.x + (1 + bi * 2) * zoom;
        const by = plowPos.y - (1 + bi * 1.5) * zoom;
        ctx.beginPath();
        ctx.arc(bx, by, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // === ORANGE STRIPE (3D isometric band on right face) ===
      const stripeY = trainY - 2 * zoom;
      const stripeH = 3 * zoom;
      const stL = isoOffset(trainX, stripeY, -12);
      const stR = isoOffset(trainX, stripeY, 12);
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff7020";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();
    } else if (tower.level === 3) {
      // ========== LEVEL 3: Fortress War Train ==========
      const cabPos = isoOffset(trainX, trainY, 8);
      const locoPos = isoOffset(trainX, trainY, 0);
      const fortressPos = isoOffset(trainX, trainY, -8);

      // --- Heavy iron chassis frame ---
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      const chassisL = isoOffset(trainX, trainY + 2 * zoom, 14);
      const chassisR = isoOffset(trainX, trainY + 2 * zoom, -14);
      ctx.moveTo(chassisL.x, chassisL.y);
      ctx.lineTo(chassisL.x, chassisL.y + 2 * zoom);
      ctx.lineTo(chassisR.x, chassisR.y + 2 * zoom);
      ctx.lineTo(chassisR.x, chassisR.y);
      ctx.closePath();
      ctx.fill();

      // Suspension springs over wheels
      const wheelY = trainY + 4 * zoom;
      const springPositions = [12, 4, -4, -12];
      for (const sp of springPositions) {
        const sPos = isoOffset(trainX, wheelY - 5 * zoom, sp);
        ctx.strokeStyle = "#6a6a72";
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        for (let si = 0; si < 4; si++) {
          const sy = sPos.y + si * 1.2 * zoom;
          ctx.moveTo(sPos.x - 1.5 * zoom, sy);
          ctx.lineTo(sPos.x + 1.5 * zoom, sy + 0.6 * zoom);
          ctx.moveTo(sPos.x + 1.5 * zoom, sy + 0.6 * zoom);
          ctx.lineTo(sPos.x - 1.5 * zoom, sy + 1.2 * zoom);
        }
        ctx.stroke();
      }

      // Wheels
      drawWheel(
        isoOffset(trainX, wheelY, 12).x,
        isoOffset(trainX, wheelY, 12).y,
        4.5,
        "#5a5a62",
        "#3a3a42",
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        4.5,
        "#5a5a62",
        "#3a3a42",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -4).x,
        isoOffset(trainX, wheelY, -4).y,
        4.5,
        "#5a5a62",
        "#3a3a42",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -12).x,
        isoOffset(trainX, wheelY, -12).y,
        4.5,
        "#5a5a62",
        "#3a3a42",
      );

      // === CAB (front) ===
      // Angled front prow/ram plate
      const prowPos = isoOffset(cabPos.x, cabPos.y, 7);
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(prowPos.x + 3 * zoom, prowPos.y);
      ctx.lineTo(prowPos.x, prowPos.y - 10 * zoom);
      ctx.lineTo(prowPos.x - 3 * zoom, prowPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a3a42";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Main armored cab body
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        12,
        11,
        16,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );

      // Armor plate rivets on right face
      ctx.fillStyle = "#7a7a82";
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const rx = cabPos.x + (3 + col * 3) * zoom;
          const ry = cabPos.y - (5 + row * 4) * zoom + col * 0.75 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Rivets on left face
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const rx = cabPos.x - (3 + col * 3) * zoom;
          const ry = cabPos.y - (5 + row * 4) * zoom + col * 0.75 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Arrow slit (iso parallelogram on right face with orange glow)
      const slitCx = cabPos.x + 3 * zoom;
      const slitCy = cabPos.y - 10 * zoom;
      ctx.fillStyle = "rgba(255, 120, 20, 0.7)";
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(slitCx, slitCy - 2 * zoom);
      ctx.lineTo(slitCx + 3 * zoom, slitCy - 2 * zoom - 1.5 * zoom);
      ctx.lineTo(slitCx + 3 * zoom, slitCy + 0.5 * zoom - 1.5 * zoom);
      ctx.lineTo(slitCx, slitCy + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crenellated battlements: 3 merlons with gaps
      for (let i = 0; i < 3; i++) {
        const bPos = isoOffset(cabPos.x, cabPos.y - 16 * zoom, -4 + i * 4);
        drawIsometricPrism(
          ctx,
          bPos.x,
          bPos.y,
          3,
          3,
          3,
          { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
          zoom,
        );
      }

      // Commander's periscope/lookout turret on top
      const periPos = isoOffset(cabPos.x, cabPos.y - 19 * zoom, 0);
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y,
        2.5 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#4a4a52";
      ctx.fillRect(
        periPos.x - 1 * zoom,
        periPos.y - 4 * zoom,
        2 * zoom,
        4 * zoom,
      );
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y - 4 * zoom,
        1.5 * zoom,
        1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Periscope viewport
      ctx.fillStyle = "#9af";
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y - 4 * zoom,
        0.7 * zoom,
        0.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        14,
        12,
        14,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );

      // Side-mounted lanterns with brackets from loco body
      const lanternR = isoOffset(locoPos.x, locoPos.y - 8 * zoom, 6);
      // Right bracket arm
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(locoPos.x + 5 * zoom, locoPos.y - 8 * zoom);
      ctx.lineTo(lanternR.x + 1 * zoom, lanternR.y);
      ctx.stroke();
      // Hexagonal housing
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      for (let hi = 0; hi < 6; hi++) {
        const ha = (hi / 6) * Math.PI * 2 - Math.PI / 6;
        ctx.lineTo(
          lanternR.x + 1 * zoom + Math.cos(ha) * 2 * zoom,
          lanternR.y + Math.sin(ha) * 2 * zoom,
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 200, 80, 0.9)";
      ctx.shadowColor = "#ffa040";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(lanternR.x + 1 * zoom, lanternR.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const lanternL = isoOffset(locoPos.x, locoPos.y - 8 * zoom, -6);
      // Left bracket arm
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(locoPos.x - 5 * zoom, locoPos.y - 8 * zoom);
      ctx.lineTo(lanternL.x - 1 * zoom, lanternL.y);
      ctx.stroke();
      // Hexagonal housing
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      for (let hi = 0; hi < 6; hi++) {
        const ha = (hi / 6) * Math.PI * 2 - Math.PI / 6;
        ctx.lineTo(
          lanternL.x - 1 * zoom + Math.cos(ha) * 2 * zoom,
          lanternL.y + Math.sin(ha) * 2 * zoom,
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 200, 80, 0.9)";
      ctx.shadowColor = "#ffa040";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(lanternL.x - 1 * zoom, lanternL.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Observation tower with arrow slits
      const towerPos = isoOffset(locoPos.x, locoPos.y - 14 * zoom, -2);
      drawIsometricPrism(
        ctx,
        towerPos.x,
        towerPos.y,
        7,
        7,
        14,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom,
      );

      // Arrow slit on tower right face
      ctx.fillStyle = "rgba(255, 120, 20, 0.6)";
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 3 * zoom;
      const tSlitR = { x: towerPos.x + 2 * zoom, y: towerPos.y - 7 * zoom };
      ctx.beginPath();
      ctx.moveTo(tSlitR.x, tSlitR.y - 2 * zoom);
      ctx.lineTo(tSlitR.x + 2 * zoom, tSlitR.y - 2.5 * zoom);
      ctx.lineTo(tSlitR.x + 2 * zoom, tSlitR.y + 0.5 * zoom);
      ctx.lineTo(tSlitR.x, tSlitR.y + 1 * zoom);
      ctx.closePath();
      ctx.fill();
      // Arrow slit on tower left face
      const tSlitL = { x: towerPos.x - 2 * zoom, y: towerPos.y - 7 * zoom };
      ctx.beginPath();
      ctx.moveTo(tSlitL.x, tSlitL.y - 2 * zoom);
      ctx.lineTo(tSlitL.x - 2 * zoom, tSlitL.y - 2.5 * zoom);
      ctx.lineTo(tSlitL.x - 2 * zoom, tSlitL.y + 0.5 * zoom);
      ctx.lineTo(tSlitL.x, tSlitL.y + 1 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tower battlements
      for (let i = 0; i < 2; i++) {
        const tbPos = isoOffset(towerPos.x, towerPos.y - 14 * zoom, -2 + i * 4);
        drawIsometricPrism(
          ctx,
          tbPos.x,
          tbPos.y,
          3,
          3,
          3,
          { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
          zoom,
        );
      }

      // Signal flag on tower top (3D isometric)
      const flagPole = { x: towerPos.x, y: towerPos.y - 17 * zoom };
      const fIsoD = 1 * zoom;
      // Pole with isometric side face
      ctx.strokeStyle = "#3a3a42";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(flagPole.x, flagPole.y + 3 * zoom);
      ctx.lineTo(flagPole.x, flagPole.y - 5 * zoom);
      ctx.stroke();
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        flagPole.x + fIsoD * 0.5,
        flagPole.y + 3 * zoom - fIsoD * 0.25,
      );
      ctx.lineTo(
        flagPole.x + fIsoD * 0.5,
        flagPole.y - 5 * zoom - fIsoD * 0.25,
      );
      ctx.stroke();
      // Pole finial
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.arc(flagPole.x, flagPole.y - 5 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      const flagWave = Math.sin(time * 3) * 0.5;
      // Flag back face (shadow/depth)
      ctx.fillStyle = "#a04000";
      ctx.beginPath();
      ctx.moveTo(flagPole.x + fIsoD, flagPole.y - 4 * zoom - fIsoD * 0.5);
      ctx.quadraticCurveTo(
        flagPole.x + 3 * zoom + fIsoD,
        flagPole.y - 3 * zoom + flagWave * zoom - fIsoD * 0.5,
        flagPole.x + 5 * zoom + fIsoD,
        flagPole.y - 2.5 * zoom + flagWave * zoom - fIsoD * 0.5,
      );
      ctx.lineTo(flagPole.x + fIsoD, flagPole.y - 1 * zoom - fIsoD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Flag front face
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(flagPole.x, flagPole.y - 4 * zoom);
      ctx.quadraticCurveTo(
        flagPole.x + 3 * zoom,
        flagPole.y - 3 * zoom + flagWave * zoom,
        flagPole.x + 5 * zoom,
        flagPole.y - 2.5 * zoom + flagWave * zoom,
      );
      ctx.lineTo(flagPole.x, flagPole.y - 1 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Smokestack with cap ring and spark catcher dome
      const stackPos = isoOffset(locoPos.x, locoPos.y - 14 * zoom, 4);
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y,
        5,
        5,
        10,
        { top: "#3a3a42", left: "#2a2a32", right: "#1a1a1a" },
        zoom,
      );
      // Cap ring
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y - 10 * zoom,
        7,
        7,
        2,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom,
      );
      // Spark catcher mesh dome
      ctx.fillStyle = "rgba(90, 90, 98, 0.6)";
      ctx.beginPath();
      ctx.arc(stackPos.x, stackPos.y - 13 * zoom, 3 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 0.7 * zoom;
      for (let mi = 0; mi < 4; mi++) {
        const meshAngle = (mi / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(
          stackPos.x - 3 * zoom * Math.cos(meshAngle),
          stackPos.y - 13 * zoom,
        );
        ctx.quadraticCurveTo(
          stackPos.x,
          stackPos.y - 16 * zoom,
          stackPos.x + 3 * zoom * Math.cos(Math.PI - meshAngle),
          stackPos.y - 13 * zoom,
        );
        ctx.stroke();
      }

      // Steam venting
      const steamAlpha = 0.35 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(180, 180, 180, ${steamAlpha})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 18 * zoom,
        6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = `rgba(180, 180, 180, ${steamAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3 + 1) * 4,
        stackPos.y - 22 * zoom,
        4 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Side steam pipe
      const pipeR = isoOffset(locoPos.x, locoPos.y - 4 * zoom, 7);
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(pipeR.x, pipeR.y);
      ctx.lineTo(pipeR.x + 2 * zoom, pipeR.y - 1 * zoom);
      ctx.stroke();
      const pipeSteam = 0.2 + Math.sin(time * 5 + 1) * 0.15;
      ctx.fillStyle = `rgba(200, 200, 200, ${pipeSteam})`;
      ctx.beginPath();
      ctx.arc(
        pipeR.x + 3.5 * zoom,
        pipeR.y - 1.5 * zoom,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // === FORTRESS CAR (back) ===
      drawIsometricPrism(
        ctx,
        fortressPos.x,
        fortressPos.y,
        14,
        12,
        12,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom,
      );

      // Heavier battlements: 4 merlons
      for (let i = 0; i < 4; i++) {
        const bPos = isoOffset(
          fortressPos.x,
          fortressPos.y - 12 * zoom,
          -5 + i * 3.3,
        );
        drawIsometricPrism(
          ctx,
          bPos.x,
          bPos.y,
          2.5,
          2.5,
          4,
          { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
          zoom,
        );
      }

      // Portcullis gate (isometric grid on right face)
      const portX = fortressPos.x + 2 * zoom;
      const portY = fortressPos.y - 3 * zoom;
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.moveTo(portX, portY - 6 * zoom);
      ctx.lineTo(portX + 4 * zoom, portY - 6 * zoom - 2 * zoom);
      ctx.lineTo(portX + 4 * zoom, portY - 2 * zoom);
      ctx.lineTo(portX, portY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 0.7 * zoom;
      for (let gi = 0; gi < 4; gi++) {
        const gy = portY - gi * 1.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(portX, gy);
        ctx.lineTo(portX + 4 * zoom, gy - 2 * zoom);
        ctx.stroke();
      }
      for (let gi = 0; gi < 3; gi++) {
        const gx = portX + (gi + 1) * 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(gx, portY - 6 * zoom - (gi + 1) * 0.6 * zoom);
        ctx.lineTo(gx, portY - (gi + 1) * 0.6 * zoom);
        ctx.stroke();
      }

      // Rose / stained glass window with petal pattern
      const roseGlow = 0.6 + Math.sin(time * 2) * 0.25;
      const rosePos = isoOffset(fortressPos.x, fortressPos.y - 7 * zoom, -5);
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 108, 0, ${roseGlow})`;
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // 6 petal arcs
      ctx.strokeStyle = "rgba(180, 60, 0, 0.6)";
      ctx.lineWidth = 0.8 * zoom;
      for (let pi = 0; pi < 6; pi++) {
        const pAngle = (pi / 6) * Math.PI * 2;
        const px = rosePos.x + Math.cos(pAngle) * 1.5 * zoom;
        const py = rosePos.y + Math.sin(pAngle) * 1.5 * zoom;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#fff4e0";
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Banner pole with flag (3D isometric)
      const bannerPole = isoOffset(
        fortressPos.x,
        fortressPos.y - 12 * zoom,
        -6,
      );
      const bpIsoD = 1 * zoom;
      // Pole with isometric depth face
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bannerPole.x, bannerPole.y);
      ctx.lineTo(bannerPole.x, bannerPole.y - 9 * zoom);
      ctx.stroke();
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bannerPole.x + bpIsoD * 0.5, bannerPole.y - bpIsoD * 0.25);
      ctx.lineTo(
        bannerPole.x + bpIsoD * 0.5,
        bannerPole.y - 9 * zoom - bpIsoD * 0.25,
      );
      ctx.stroke();
      // Pole finial
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(
        bannerPole.x,
        bannerPole.y - 9 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      const bFlagWave = Math.sin(time * 2.5 + 0.5) * 0.5;
      // Flag back face (depth)
      ctx.fillStyle = "#a04000";
      ctx.beginPath();
      ctx.moveTo(bannerPole.x - bpIsoD, bannerPole.y - 8 * zoom + bpIsoD * 0.5);
      ctx.quadraticCurveTo(
        bannerPole.x - 3 * zoom - bpIsoD,
        bannerPole.y - 7 * zoom + bFlagWave * zoom + bpIsoD * 0.5,
        bannerPole.x - 5 * zoom - bpIsoD,
        bannerPole.y - 6 * zoom + bFlagWave * zoom + bpIsoD * 0.5,
      );
      ctx.lineTo(bannerPole.x - bpIsoD, bannerPole.y - 5 * zoom + bpIsoD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Flag front face
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(bannerPole.x, bannerPole.y - 8 * zoom);
      ctx.quadraticCurveTo(
        bannerPole.x - 3 * zoom,
        bannerPole.y - 7 * zoom + bFlagWave * zoom,
        bannerPole.x - 5 * zoom,
        bannerPole.y - 6 * zoom + bFlagWave * zoom,
      );
      ctx.lineTo(bannerPole.x, bannerPole.y - 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      // Cloth fold highlight
      ctx.strokeStyle = "rgba(255,200,100,0.2)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bannerPole.x - 1.5 * zoom, bannerPole.y - 7.5 * zoom);
      ctx.lineTo(
        bannerPole.x - 2.5 * zoom,
        bannerPole.y - 6 * zoom + bFlagWave * zoom * 0.5,
      );
      ctx.stroke();

      // Murder holes on floor overhang
      for (let mhi = 0; mhi < 3; mhi++) {
        const mhPos = isoOffset(
          fortressPos.x,
          fortressPos.y + 1 * zoom,
          -3 + mhi * 3,
        );
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(mhPos.x, mhPos.y, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chains between cars
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.5 * zoom;
      const chain1a = isoOffset(trainX, trainY - 2 * zoom, 4.5);
      const chain1b = isoOffset(trainX, trainY - 2 * zoom, 3.5);
      ctx.beginPath();
      ctx.moveTo(chain1a.x, chain1a.y);
      ctx.quadraticCurveTo(
        (chain1a.x + chain1b.x) / 2,
        (chain1a.y + chain1b.y) / 2 + 2 * zoom,
        chain1b.x,
        chain1b.y,
      );
      ctx.stroke();
      const chain2a = isoOffset(trainX, trainY - 2 * zoom, -3.5);
      const chain2b = isoOffset(trainX, trainY - 2 * zoom, -4.5);
      ctx.beginPath();
      ctx.moveTo(chain2a.x, chain2a.y);
      ctx.quadraticCurveTo(
        (chain2a.x + chain2b.x) / 2,
        (chain2a.y + chain2b.y) / 2 + 2 * zoom,
        chain2b.x,
        chain2b.y,
      );
      ctx.stroke();

      // Front headlight with fortress-style bracket
      const headlightPos = isoOffset(cabPos.x, cabPos.y - 8 * zoom, 8);
      // Heavy bracket arm from cab to light
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y - 9 * zoom);
      ctx.lineTo(headlightPos.x + 1 * zoom, headlightPos.y);
      ctx.stroke();
      // Octagonal iron housing
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      for (let hi = 0; hi < 8; hi++) {
        const ha = (hi / 8) * Math.PI * 2;
        const hx = headlightPos.x + 1 * zoom + Math.cos(ha) * 2.8 * zoom;
        const hy = headlightPos.y + Math.sin(ha) * 2.8 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = `rgba(255, 250, 200, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(
        headlightPos.x + 1 * zoom,
        headlightPos.y,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Battering ram at front (bolted to chassis)
      const ramPos = isoOffset(cabPos.x, cabPos.y, 7);
      // Mounting brackets from chassis
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y);
      ctx.lineTo(ramPos.x + 3 * zoom, ramPos.y - 1 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(ramPos.x + 3 * zoom, ramPos.y - 3 * zoom);
      ctx.stroke();
      // Ram head (hexagonal for 3D look)
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      for (let hi = 0; hi < 6; hi++) {
        const ha = (hi / 6) * Math.PI * 2;
        const hx = ramPos.x + 4.5 * zoom + Math.cos(ha) * 2.5 * zoom;
        const hy = ramPos.y - 2 * zoom + Math.sin(ha) * 2.5 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Ram spike
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.arc(
        ramPos.x + 4.5 * zoom,
        ramPos.y - 2 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.stroke();

      // Orange stripe (3D isometric band)
      const stripeY = trainY - 2 * zoom;
      const stripeH = 3.5 * zoom;
      const stL = isoOffset(trainX, stripeY, -14);
      const stR = isoOffset(trainX, stripeY, 14);
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff7020";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();
    } else if (tower.level === 4 && tower.upgrade === "A") {
      // ========== LEVEL 4A: Royal Marble Train ==========
      // Dark outline glow for visibility against gold building
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 5 * zoom;

      const cabPos = isoOffset(trainX, trainY, 7);
      const locoPos = isoOffset(trainX, trainY, 0);
      const passengerPos = isoOffset(trainX, trainY, -7);

      // --- Ornate gold-trimmed chassis ---
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      const chL4a = isoOffset(trainX, trainY + 2 * zoom, 12);
      const chR4a = isoOffset(trainX, trainY + 2 * zoom, -12);
      ctx.beginPath();
      ctx.moveTo(chL4a.x, chL4a.y);
      ctx.lineTo(chR4a.x, chR4a.y);
      ctx.stroke();
      ctx.lineWidth = 1 * zoom;
      for (let sci = 0; sci < 3; sci++) {
        const scPos = isoOffset(trainX, trainY + 2.5 * zoom, -6 + sci * 6);
        ctx.beginPath();
        ctx.arc(scPos.x, scPos.y + 1 * zoom, 1.5 * zoom, 0, Math.PI);
        ctx.stroke();
      }

      // Gold wheels
      const wheelY = trainY + 4 * zoom;
      const wPositions = [10, 4, -3, -10];
      for (const wp of wPositions) {
        const wPos = isoOffset(trainX, wheelY, wp);
        ctx.fillStyle = "#c9a227";
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#daa520";
        ctx.lineWidth = 1 * zoom;
        for (let si = 0; si < 6; si++) {
          const angle = (si / 6) * Math.PI * 2 + time * 2;
          ctx.beginPath();
          ctx.moveTo(wPos.x, wPos.y);
          ctx.lineTo(
            wPos.x + Math.cos(angle) * 3.2 * zoom,
            wPos.y + Math.sin(angle) * 1.6 * zoom,
          );
          ctx.stroke();
        }
        ctx.fillStyle = "#b8860b";
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 1.2 * zoom, 0.6 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // === CAB (front) ===
      ctx.shadowBlur = 6 * zoom;
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        10,
        10,
        12,
        { top: "#ffffff", left: "#f0ece4", right: "#e0d8cc" },
        zoom,
      );

      // Gold trim lines on cab edges
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      const cabW4a = 10 * zoom * 0.5;
      const cabD4a = 10 * zoom * 0.25;
      const cabH4a = 12 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y + cabD4a);
      ctx.lineTo(cabPos.x, cabPos.y + cabD4a - cabH4a);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + cabW4a, cabPos.y);
      ctx.lineTo(cabPos.x + cabW4a, cabPos.y - cabH4a);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - cabW4a, cabPos.y);
      ctx.lineTo(cabPos.x - cabW4a, cabPos.y - cabH4a);
      ctx.stroke();

      // Ornate dome roof
      ctx.fillStyle = "#e8e4dc";
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 12 * zoom, 5.5 * zoom, Math.PI, 0);
      ctx.fill();
      // Gold rim at dome base
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 5.5 * zoom, cabPos.y - 12 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 12 * zoom);
      ctx.stroke();
      // Dome arc outline
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 12 * zoom, 5.5 * zoom, Math.PI, 0);
      ctx.stroke();

      // Decorative finial: pointed spire with gold ball
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y - 17.5 * zoom);
      ctx.lineTo(cabPos.x, cabPos.y - 21 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 21.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Arched window on right face
      const cabGlow = 0.5 + Math.sin(time * 2) * 0.15;
      const cabWinR = { x: cabPos.x + 2.5 * zoom, y: cabPos.y - 7 * zoom };
      ctx.fillStyle = "#c0a060";
      ctx.beginPath();
      ctx.arc(cabWinR.x, cabWinR.y - 1 * zoom, 2.5 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(
        cabWinR.x - 2.5 * zoom,
        cabWinR.y - 1 * zoom,
        5 * zoom,
        3 * zoom,
      );
      ctx.fillStyle = `rgba(255, 250, 230, ${cabGlow})`;
      ctx.beginPath();
      ctx.arc(cabWinR.x, cabWinR.y - 1 * zoom, 2 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(
        cabWinR.x - 2 * zoom,
        cabWinR.y - 1 * zoom,
        4 * zoom,
        2.5 * zoom,
      );
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(cabWinR.x, cabWinR.y - 1 * zoom, 2.5 * zoom, Math.PI, 0);
      ctx.stroke();

      // Arched window on left face
      const cabWinL = { x: cabPos.x - 2.5 * zoom, y: cabPos.y - 7 * zoom };
      ctx.fillStyle = "#c0a060";
      ctx.beginPath();
      ctx.arc(cabWinL.x, cabWinL.y - 1 * zoom, 2.5 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(
        cabWinL.x - 2.5 * zoom,
        cabWinL.y - 1 * zoom,
        5 * zoom,
        3 * zoom,
      );
      ctx.fillStyle = `rgba(255, 250, 230, ${cabGlow})`;
      ctx.beginPath();
      ctx.arc(cabWinL.x, cabWinL.y - 1 * zoom, 2 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(
        cabWinL.x - 2 * zoom,
        cabWinL.y - 1 * zoom,
        4 * zoom,
        2.5 * zoom,
      );
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(cabWinL.x, cabWinL.y - 1 * zoom, 2.5 * zoom, Math.PI, 0);
      ctx.stroke();

      // Balcony railing at window
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.7 * zoom;
      for (let bi = 0; bi < 3; bi++) {
        const bx = cabWinR.x - 2 * zoom + bi * 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(bx, cabWinR.y + 2 * zoom);
        ctx.lineTo(bx, cabWinR.y + 3.5 * zoom);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cabWinR.x - 2 * zoom, cabWinR.y + 2 * zoom);
      ctx.lineTo(cabWinR.x + 2 * zoom, cabWinR.y + 2 * zoom);
      ctx.stroke();

      // Decorative scrollwork near top
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1 * zoom, cabPos.y - 11 * zoom);
      ctx.quadraticCurveTo(
        cabPos.x + 3 * zoom,
        cabPos.y - 12 * zoom,
        cabPos.x + 4.5 * zoom,
        cabPos.y - 11 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 1 * zoom, cabPos.y - 11 * zoom);
      ctx.quadraticCurveTo(
        cabPos.x - 3 * zoom,
        cabPos.y - 12 * zoom,
        cabPos.x - 4.5 * zoom,
        cabPos.y - 11 * zoom,
      );
      ctx.stroke();

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        12,
        10,
        12,
        { top: "#f8f4ec", left: "#e8e4dc", right: "#d8d4cc" },
        zoom,
      );

      // Wide ornate gold bands
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 3 * zoom;
      for (let bi = 0; bi < 2; bi++) {
        const bandY = locoPos.y - 4 * zoom - bi * 5 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x - 5.5 * zoom, bandY + 2.5 * zoom);
        ctx.lineTo(locoPos.x + 5.5 * zoom, bandY - 2.5 * zoom);
        ctx.stroke();
      }

      // Larger marble dome with gold filigree
      ctx.fillStyle = "#e8e4dc";
      ctx.beginPath();
      ctx.arc(locoPos.x, locoPos.y - 14 * zoom, 4.5 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      // Cross-hatch gold filigree on dome
      ctx.strokeStyle = "rgba(201, 162, 39, 0.5)";
      ctx.lineWidth = 0.7 * zoom;
      for (let fi = 0; fi < 3; fi++) {
        const a1 = Math.PI + (fi + 1) * (Math.PI / 4);
        const a2 = Math.PI * 2 - (fi + 1) * (Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(
          locoPos.x + Math.cos(a1) * 4.5 * zoom,
          locoPos.y - 14 * zoom + Math.sin(a1) * 4.5 * zoom,
        );
        ctx.lineTo(
          locoPos.x + Math.cos(a2) * 4.5 * zoom,
          locoPos.y - 14 * zoom + Math.sin(a2) * 4.5 * zoom,
        );
        ctx.stroke();
      }

      // Brass safety valve on dome
      ctx.fillStyle = "#b8860b";
      ctx.beginPath();
      ctx.arc(
        locoPos.x + 2 * zoom,
        locoPos.y - 17 * zoom,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#daa520";
      ctx.fillRect(
        locoPos.x + 1.5 * zoom,
        locoPos.y - 19 * zoom,
        1 * zoom,
        2 * zoom,
      );

      // Ornamental smokestack: fluted column with decorative cap
      const stackPos = isoOffset(locoPos.x, locoPos.y - 12 * zoom, 3);
      ctx.fillStyle = "#daa520";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      // Flute lines
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 0.6 * zoom;
      for (let fl = -1; fl <= 1; fl++) {
        ctx.beginPath();
        ctx.moveTo(stackPos.x + fl * 1 * zoom, stackPos.y);
        ctx.lineTo(stackPos.x + fl * 1.2 * zoom, stackPos.y - 10 * zoom);
        ctx.stroke();
      }
      // Decorative cap
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 10 * zoom,
        3.5 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      // Cap finial
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(stackPos.x, stackPos.y - 12 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Golden steam
      const steam = 0.3 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(255, 245, 220, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 16 * zoom,
        5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = `rgba(255, 245, 220, ${steam * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3 + 1) * 4,
        stackPos.y - 20 * zoom,
        3.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Headlight with ornate brass bracket mounting
      const headlightPos4a = isoOffset(locoPos.x, locoPos.y - 6 * zoom, 5.5);
      // Brass mounting bracket from loco body
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(locoPos.x + 5 * zoom, locoPos.y - 7 * zoom);
      ctx.lineTo(headlightPos4a.x, headlightPos4a.y);
      ctx.stroke();
      // Octagonal brass housing
      ctx.fillStyle = "#b8860b";
      ctx.beginPath();
      for (let hi = 0; hi < 8; hi++) {
        const ha = (hi / 8) * Math.PI * 2;
        const hx = headlightPos4a.x + Math.cos(ha) * 2.8 * zoom;
        const hy = headlightPos4a.y + Math.sin(ha) * 2.8 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = "rgba(255, 250, 200, 0.9)";
      ctx.shadowColor = "#fff8e0";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(headlightPos4a.x, headlightPos4a.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // === PASSENGER CAR (back) ===
      drawIsometricPrism(
        ctx,
        passengerPos.x,
        passengerPos.y,
        12,
        10,
        10,
        { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" },
        zoom,
      );

      // Gold columns on right face
      ctx.fillStyle = "#c9a227";
      for (let ci = 0; ci < 3; ci++) {
        const colPos = isoOffset(passengerPos.x, passengerPos.y, -3 + ci * 3);
        const colX = colPos.x + 2 * zoom;
        ctx.fillRect(
          colX - 0.5 * zoom,
          colPos.y - 10 * zoom,
          1 * zoom,
          10 * zoom,
        );
        ctx.fillRect(
          colX - 1.2 * zoom,
          colPos.y - 10 * zoom,
          2.4 * zoom,
          1 * zoom,
        );
        ctx.fillRect(colX - 1 * zoom, colPos.y - 1 * zoom, 2 * zoom, 1 * zoom);
      }

      // Multiple arched windows with warm glow
      const winGlow = 0.5 + Math.sin(time * 2) * 0.15;
      const winColors4a = [
        `rgba(255, 250, 230, ${winGlow})`,
        `rgba(255, 235, 200, ${winGlow + 0.1})`,
        `rgba(200, 230, 255, ${winGlow})`,
      ];
      for (let wi = 0; wi < 3; wi++) {
        const wPos4a = isoOffset(
          passengerPos.x,
          passengerPos.y - 5 * zoom,
          -2.5 + wi * 2.5,
        );
        const wx = wPos4a.x + 2 * zoom;
        const wy = wPos4a.y;
        ctx.fillStyle = "#c0a060";
        ctx.beginPath();
        ctx.arc(wx, wy - 1 * zoom, 1.5 * zoom, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(wx - 1.5 * zoom, wy - 1 * zoom, 3 * zoom, 2 * zoom);
        ctx.fillStyle = winColors4a[wi];
        ctx.beginPath();
        ctx.arc(wx, wy - 1 * zoom, 1.2 * zoom, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(wx - 1.2 * zoom, wy - 1 * zoom, 2.4 * zoom, 1.5 * zoom);
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.arc(wx, wy - 1 * zoom, 1.5 * zoom, Math.PI, 0);
        ctx.stroke();
      }

      // Decorative roof balustrade
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.7 * zoom;
      for (let bi = 0; bi < 5; bi++) {
        const bpPos = isoOffset(
          passengerPos.x,
          passengerPos.y - 10 * zoom,
          -4 + bi * 2,
        );
        ctx.beginPath();
        ctx.moveTo(bpPos.x + 2.5 * zoom, bpPos.y - 0.5 * zoom);
        ctx.lineTo(bpPos.x + 2.5 * zoom, bpPos.y - 2.5 * zoom);
        ctx.stroke();
      }
      const balL4a = isoOffset(
        passengerPos.x,
        passengerPos.y - 12.5 * zoom,
        -4,
      );
      const balR4a = isoOffset(passengerPos.x, passengerPos.y - 12.5 * zoom, 4);
      ctx.beginPath();
      ctx.moveTo(balL4a.x + 2.5 * zoom, balL4a.y);
      ctx.lineTo(balR4a.x + 2.5 * zoom, balR4a.y);
      ctx.stroke();

      // Horse/centaur emblem (cleaner silhouette)
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      const horsePos = isoOffset(passengerPos.x, passengerPos.y - 5 * zoom, -4);
      ctx.beginPath();
      ctx.moveTo(horsePos.x - 1 * zoom, horsePos.y + 2.5 * zoom);
      ctx.lineTo(horsePos.x - 0.5 * zoom, horsePos.y + 1 * zoom);
      ctx.lineTo(horsePos.x - 1.5 * zoom, horsePos.y - 1 * zoom);
      ctx.quadraticCurveTo(
        horsePos.x - 1 * zoom,
        horsePos.y - 3 * zoom,
        horsePos.x,
        horsePos.y - 2.5 * zoom,
      );
      ctx.lineTo(horsePos.x + 0.5 * zoom, horsePos.y - 3.5 * zoom);
      ctx.quadraticCurveTo(
        horsePos.x + 1.5 * zoom,
        horsePos.y - 2 * zoom,
        horsePos.x + 1 * zoom,
        horsePos.y,
      );
      ctx.lineTo(horsePos.x + 1.5 * zoom, horsePos.y + 2.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gold chains between cars
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      const gc1a4a = isoOffset(trainX, trainY - 2 * zoom, 4);
      const gc1b4a = isoOffset(trainX, trainY - 2 * zoom, 3);
      ctx.beginPath();
      ctx.moveTo(gc1a4a.x, gc1a4a.y);
      ctx.quadraticCurveTo(
        (gc1a4a.x + gc1b4a.x) / 2,
        (gc1a4a.y + gc1b4a.y) / 2 + 1.5 * zoom,
        gc1b4a.x,
        gc1b4a.y,
      );
      ctx.stroke();
      const gc2a4a = isoOffset(trainX, trainY - 2 * zoom, -3);
      const gc2b4a = isoOffset(trainX, trainY - 2 * zoom, -4);
      ctx.beginPath();
      ctx.moveTo(gc2a4a.x, gc2a4a.y);
      ctx.quadraticCurveTo(
        (gc2a4a.x + gc2b4a.x) / 2,
        (gc2a4a.y + gc2b4a.y) / 2 + 1.5 * zoom,
        gc2b4a.x,
        gc2b4a.y,
      );
      ctx.stroke();

      // Royal pennant flag
      const pennantPole = isoOffset(
        passengerPos.x,
        passengerPos.y - 10 * zoom,
        0,
      );
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(pennantPole.x, pennantPole.y);
      ctx.lineTo(pennantPole.x, pennantPole.y - 6 * zoom);
      ctx.stroke();
      const pWave4a = Math.sin(time * 3) * 0.5;
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(pennantPole.x, pennantPole.y - 6 * zoom);
      ctx.lineTo(
        pennantPole.x + 3 * zoom,
        pennantPole.y - 4.5 * zoom + pWave4a * zoom,
      );
      ctx.lineTo(pennantPole.x, pennantPole.y - 3 * zoom);
      ctx.closePath();
      ctx.fill();

      // Orange stripe (3D isometric band)
      const stripeY = trainY - 2 * zoom;
      const stripeH = 3.5 * zoom;
      const stL = isoOffset(trainX, stripeY, -14);
      const stR = isoOffset(trainX, stripeY, 14);
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff7020";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();

      // Front headlight with gold bracket mount
      const headlightPos = isoOffset(cabPos.x, cabPos.y - 6 * zoom, 6);
      // Gold bracket from cab
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y - 7 * zoom);
      ctx.lineTo(headlightPos.x + 1 * zoom, headlightPos.y);
      ctx.stroke();
      // Octagonal gold housing
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      for (let hi = 0; hi < 8; hi++) {
        const ha = (hi / 8) * Math.PI * 2;
        const hx = headlightPos.x + 1 * zoom + Math.cos(ha) * 2.5 * zoom;
        const hy = headlightPos.y + Math.sin(ha) * 2.5 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Lens
      ctx.fillStyle = `rgba(255, 250, 220, ${0.7 + Math.sin(time * 3) * 0.15})`;
      ctx.shadowColor = "#fff8e0";
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(
        headlightPos.x + 1 * zoom,
        headlightPos.y,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ornamental cowcatcher (attached with gold struts)
      const cowPos = isoOffset(cabPos.x, cabPos.y, 6);
      // Mounting struts
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y);
      ctx.lineTo(cowPos.x + 2 * zoom, cowPos.y + 1 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5 * zoom, cabPos.y - 3 * zoom);
      ctx.lineTo(cowPos.x + 2 * zoom, cowPos.y - 1 * zoom);
      ctx.stroke();
      // Right face
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(cowPos.x + 4 * zoom, cowPos.y - 3 * zoom);
      ctx.lineTo(cowPos.x - 3 * zoom, cowPos.y + 1 * zoom);
      ctx.lineTo(cowPos.x, cowPos.y + 4 * zoom);
      ctx.lineTo(cowPos.x + 3 * zoom, cowPos.y + 3 * zoom);
      ctx.lineTo(cowPos.x + 7 * zoom, cowPos.y - 1 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Left face
      ctx.fillStyle = "#b89227";
      ctx.beginPath();
      ctx.moveTo(cowPos.x + 4 * zoom, cowPos.y - 3 * zoom);
      ctx.lineTo(cowPos.x - 3 * zoom, cowPos.y + 1 * zoom);
      ctx.lineTo(cowPos.x - 3 * zoom, cowPos.y + 3 * zoom);
      ctx.lineTo(cowPos.x, cowPos.y + 4 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
    } else {
      // ========== LEVEL 4B: Royal Armored Train ==========
      // Dark outline glow for visibility against dark gold building
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 6 * zoom;

      const cabPos = isoOffset(trainX, trainY, 8);
      const locoPos = isoOffset(trainX, trainY, 0);
      const armoredPos = isoOffset(trainX, trainY, -8);

      // --- Heavy reinforced chassis with gold-trimmed suspension ---
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      const chL4b = isoOffset(trainX, trainY + 2 * zoom, 14);
      const chR4b = isoOffset(trainX, trainY + 2 * zoom, -14);
      ctx.moveTo(chL4b.x, chL4b.y);
      ctx.lineTo(chL4b.x, chL4b.y + 2 * zoom);
      ctx.lineTo(chR4b.x, chR4b.y + 2 * zoom);
      ctx.lineTo(chR4b.x, chR4b.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(chL4b.x, chL4b.y);
      ctx.lineTo(chR4b.x, chR4b.y);
      ctx.stroke();

      // Wheels with gold trim
      const wheelY = trainY + 4 * zoom;
      const wPositions = [12, 4, -4, -12];
      for (const wp of wPositions) {
        const wPos = isoOffset(trainX, wheelY, wp);
        ctx.fillStyle = "#5a5a62";
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 4.5 * zoom, 2.25 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#4a4a52";
        ctx.lineWidth = 1 * zoom;
        for (let si = 0; si < 6; si++) {
          const angle = (si / 6) * Math.PI * 2 + time * 2;
          ctx.beginPath();
          ctx.moveTo(wPos.x, wPos.y);
          ctx.lineTo(
            wPos.x + Math.cos(angle) * 3.6 * zoom,
            wPos.y + Math.sin(angle) * 1.8 * zoom,
          );
          ctx.stroke();
        }
        ctx.fillStyle = "#c9a227";
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 1.4 * zoom, 0.7 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // === CAB (front) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        12,
        12,
        16,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );

      // Gold trim on all cab edges
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      const cW4b = 12 * zoom * 0.5;
      const cD4b = 12 * zoom * 0.25;
      const cH4b = 16 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y + cD4b);
      ctx.lineTo(cabPos.x, cabPos.y + cD4b - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + cW4b, cabPos.y);
      ctx.lineTo(cabPos.x + cW4b, cabPos.y - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - cW4b, cabPos.y);
      ctx.lineTo(cabPos.x - cW4b, cabPos.y - cH4b);
      ctx.stroke();
      // Top edges
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y - cH4b + cD4b);
      ctx.lineTo(cabPos.x + cW4b, cabPos.y - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y - cH4b + cD4b);
      ctx.lineTo(cabPos.x - cW4b, cabPos.y - cH4b);
      ctx.stroke();

      // Side armor plates with gold borders
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(cabPos.x + cW4b - 1 * zoom, cabPos.y - 4.5 * zoom);
      ctx.lineTo(cabPos.x + cW4b - 1 * zoom, cabPos.y - 13 * zoom);
      ctx.lineTo(cabPos.x + 1 * zoom, cabPos.y - 12.5 * zoom);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 1 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(cabPos.x - cW4b + 1 * zoom, cabPos.y - 4.5 * zoom);
      ctx.lineTo(cabPos.x - cW4b + 1 * zoom, cabPos.y - 13 * zoom);
      ctx.lineTo(cabPos.x - 1 * zoom, cabPos.y - 12.5 * zoom);
      ctx.closePath();
      ctx.stroke();

      // Decorative gold rivets (symmetrical)
      ctx.fillStyle = "#c9a227";
      const rivetPos4b = [
        { dx: 2, dy: -6 },
        { dx: 4, dy: -6.5 },
        { dx: 2, dy: -10 },
        { dx: 4, dy: -10.5 },
        { dx: -2, dy: -6 },
        { dx: -4, dy: -6.5 },
        { dx: -2, dy: -10 },
        { dx: -4, dy: -10.5 },
      ];
      for (const r of rivetPos4b) {
        ctx.beginPath();
        ctx.arc(
          cabPos.x + r.dx * zoom,
          cabPos.y + r.dy * zoom,
          0.6 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Gold-framed vision slit (iso parallelogram)
      const vsX4b = cabPos.x + 3 * zoom;
      const vsY4b = cabPos.y - 8 * zoom;
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.moveTo(vsX4b, vsY4b - 1 * zoom);
      ctx.lineTo(vsX4b + 4 * zoom, vsY4b - 1 * zoom - 2 * zoom);
      ctx.lineTo(vsX4b + 4 * zoom, vsY4b + 0.5 * zoom - 2 * zoom);
      ctx.lineTo(vsX4b, vsY4b + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();

      // Ornate crown on top
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 8 * zoom;
      // Crown base band
      ctx.fillRect(
        cabPos.x - 5.5 * zoom,
        cabPos.y - 17 * zoom,
        11 * zoom,
        2 * zoom,
      );
      // Crown peaks (4 peaks)
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 5.5 * zoom, cabPos.y - 17 * zoom);
      ctx.lineTo(cabPos.x - 4 * zoom, cabPos.y - 22 * zoom);
      ctx.lineTo(cabPos.x - 2.5 * zoom, cabPos.y - 18 * zoom);
      ctx.lineTo(cabPos.x - 0.5 * zoom, cabPos.y - 22 * zoom);
      ctx.lineTo(cabPos.x + 1 * zoom, cabPos.y - 18 * zoom);
      ctx.lineTo(cabPos.x + 2.5 * zoom, cabPos.y - 22 * zoom);
      ctx.lineTo(cabPos.x + 4 * zoom, cabPos.y - 18 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 22 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 17 * zoom);
      ctx.closePath();
      ctx.fill();
      // Jewel dots at each peak
      ctx.fillStyle = "#e06000";
      const jewelPeaks4b = [-4, -0.5, 2.5, 5.5];
      for (const jp of jewelPeaks4b) {
        ctx.beginPath();
        ctx.arc(
          cabPos.x + jp * zoom,
          cabPos.y - 22 * zoom,
          1 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // Center jewel (larger)
      ctx.fillStyle = "#ff3030";
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 19 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        14,
        12,
        14,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );

      // Wider gold bands
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 3 * zoom;
      for (let bi = 0; bi < 2; bi++) {
        const bandY = locoPos.y - 5 * zoom - bi * 6 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x - 6.5 * zoom, bandY + 3 * zoom);
        ctx.lineTo(locoPos.x + 6.5 * zoom, bandY - 3 * zoom);
        ctx.stroke();
      }

      // Armored dome with gold crown trim
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(locoPos.x, locoPos.y - 15 * zoom, 4.5 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2.5 * zoom;
      ctx.stroke();
      // Mini crown trim on dome
      ctx.fillStyle = "#c9a227";
      for (let ci = 0; ci < 3; ci++) {
        const cpx = locoPos.x - 3 * zoom + ci * 3 * zoom;
        ctx.beginPath();
        ctx.moveTo(cpx - 1 * zoom, locoPos.y - 19 * zoom);
        ctx.lineTo(cpx, locoPos.y - 21 * zoom);
        ctx.lineTo(cpx + 1 * zoom, locoPos.y - 19 * zoom);
        ctx.closePath();
        ctx.fill();
      }

      // Side-mounted exhaust pipes with gold valve wheels
      for (const side of [-1, 1]) {
        const epPos = isoOffset(locoPos.x, locoPos.y - 6 * zoom, side * 7);
        ctx.fillStyle = "#4a4a52";
        ctx.fillRect(
          epPos.x - 1 * zoom,
          epPos.y - 3 * zoom,
          2 * zoom,
          6 * zoom,
        );
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.arc(epPos.x, epPos.y, 1.5 * zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#c9a227";
        ctx.beginPath();
        ctx.arc(epPos.x, epPos.y, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Smokestack with refined crown
      const stackPos = isoOffset(locoPos.x, locoPos.y - 14 * zoom, 4);
      // Fluted stack body
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 3 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      // Flute lines
      ctx.strokeStyle = "#3a3a42";
      ctx.lineWidth = 0.6 * zoom;
      for (let fl = -1; fl <= 1; fl++) {
        ctx.beginPath();
        ctx.moveTo(stackPos.x + fl * 1 * zoom, stackPos.y);
        ctx.lineTo(stackPos.x + fl * 0.8 * zoom, stackPos.y - 10 * zoom);
        ctx.stroke();
      }
      // Gold band at top
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.stroke();
      // Mini crown on stack (3 peaks with jewels)
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 3 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x - 2 * zoom, stackPos.y - 14 * zoom);
      ctx.lineTo(stackPos.x - 0.5 * zoom, stackPos.y - 11 * zoom);
      ctx.lineTo(stackPos.x + 0.5 * zoom, stackPos.y - 14 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y - 11 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y - 14 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y - 10 * zoom);
      ctx.closePath();
      ctx.fill();
      // Jewels on crown peaks
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.arc(
        stackPos.x - 2 * zoom,
        stackPos.y - 14 * zoom,
        0.7 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        stackPos.x + 0.5 * zoom,
        stackPos.y - 14 * zoom,
        0.7 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        stackPos.x + 3 * zoom,
        stackPos.y - 14 * zoom,
        0.7 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Headlight with ornate bracket mount
      const headlightPos4b = isoOffset(locoPos.x, locoPos.y - 8 * zoom, 6);
      // Bracket arm from loco body
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(locoPos.x + 5 * zoom, locoPos.y - 9 * zoom);
      ctx.lineTo(headlightPos4b.x, headlightPos4b.y);
      ctx.stroke();
      // Octagonal ornate housing
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      for (let hi = 0; hi < 8; hi++) {
        const ha = (hi / 8) * Math.PI * 2;
        const hx = headlightPos4b.x + Math.cos(ha) * 3 * zoom;
        const hy = headlightPos4b.y + Math.sin(ha) * 3 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = "rgba(255, 250, 200, 0.9)";
      ctx.shadowColor = "#fff8e0";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(headlightPos4b.x, headlightPos4b.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Ornate frame rays (decorative spokes)
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 1 * zoom;
      for (let ri = 0; ri < 8; ri++) {
        const ra = (ri / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(
          headlightPos4b.x + Math.cos(ra) * 2.5 * zoom,
          headlightPos4b.y + Math.sin(ra) * 2.5 * zoom,
        );
        ctx.lineTo(
          headlightPos4b.x + Math.cos(ra) * 3.2 * zoom,
          headlightPos4b.y + Math.sin(ra) * 3.2 * zoom,
        );
        ctx.stroke();
      }

      // Steam
      const steam = 0.35 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(180, 180, 180, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 20 * zoom,
        6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // === ARMORED CAR (back) ===
      drawIsometricPrism(
        ctx,
        armoredPos.x,
        armoredPos.y,
        14,
        12,
        12,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom,
      );

      // Gold borders on panel edges
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      const aW4b = 14 * zoom * 0.5;
      const aD4b = 12 * zoom * 0.25;
      const aH4b = 12 * zoom;
      ctx.beginPath();
      ctx.moveTo(armoredPos.x, armoredPos.y - aH4b + aD4b);
      ctx.lineTo(armoredPos.x + aW4b, armoredPos.y - aH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(armoredPos.x, armoredPos.y - aH4b + aD4b);
      ctx.lineTo(armoredPos.x - aW4b, armoredPos.y - aH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(armoredPos.x, armoredPos.y + aD4b);
      ctx.lineTo(armoredPos.x, armoredPos.y + aD4b - aH4b);
      ctx.stroke();

      // Gun ports on sides
      for (let gi = 0; gi < 2; gi++) {
        const gpPos = isoOffset(
          armoredPos.x,
          armoredPos.y - 4 * zoom,
          -3 + gi * 6,
        );
        const gpX = gpPos.x + 2 * zoom;
        const gpY = gpPos.y;
        ctx.fillStyle = "#1a1a22";
        ctx.fillRect(gpX - 1.2 * zoom, gpY - 1 * zoom, 2.4 * zoom, 2 * zoom);
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 0.8 * zoom;
        ctx.strokeRect(
          gpX - 1.5 * zoom,
          gpY - 1.3 * zoom,
          3 * zoom,
          2.6 * zoom,
        );
      }

      // Large stained-glass rose window with 6-petal pattern
      const sgGlow = 0.6 + Math.sin(time * 2) * 0.25;
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(armoredPos.x, armoredPos.y - 6 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.arc(armoredPos.x, armoredPos.y - 6 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 150, 50, ${sgGlow})`;
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(
        armoredPos.x,
        armoredPos.y - 6 * zoom,
        4.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      // 6-petal pattern
      ctx.strokeStyle = "rgba(180, 60, 0, 0.5)";
      ctx.lineWidth = 0.8 * zoom;
      for (let pi = 0; pi < 6; pi++) {
        const pAngle = (pi / 6) * Math.PI * 2;
        const ppx = armoredPos.x + Math.cos(pAngle) * 2 * zoom;
        const ppy = armoredPos.y - 6 * zoom + Math.sin(pAngle) * 2 * zoom;
        ctx.beginPath();
        ctx.arc(ppx, ppy, 2 * zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#fff4e0";
      ctx.beginPath();
      ctx.arc(armoredPos.x, armoredPos.y - 6 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Small turret on top with crown finial
      const turretPos4b = isoOffset(armoredPos.x, armoredPos.y - 12 * zoom, 0);
      drawIsometricPrism(
        ctx,
        turretPos4b.x,
        turretPos4b.y,
        5,
        5,
        5,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom,
      );
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(turretPos4b.x - 2 * zoom, turretPos4b.y - 5 * zoom);
      ctx.lineTo(turretPos4b.x - 1 * zoom, turretPos4b.y - 8 * zoom);
      ctx.lineTo(turretPos4b.x, turretPos4b.y - 6 * zoom);
      ctx.lineTo(turretPos4b.x + 1 * zoom, turretPos4b.y - 8 * zoom);
      ctx.lineTo(turretPos4b.x + 2 * zoom, turretPos4b.y - 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gold crown emblem with cross on top
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 6 * zoom;
      const crownPos = isoOffset(armoredPos.x, armoredPos.y - 10 * zoom, -6);
      ctx.beginPath();
      ctx.moveTo(crownPos.x - 4 * zoom, crownPos.y);
      ctx.lineTo(crownPos.x - 3 * zoom, crownPos.y - 3 * zoom);
      ctx.lineTo(crownPos.x - 1.5 * zoom, crownPos.y - 1.5 * zoom);
      ctx.lineTo(crownPos.x, crownPos.y - 3.5 * zoom);
      ctx.lineTo(crownPos.x + 1.5 * zoom, crownPos.y - 1.5 * zoom);
      ctx.lineTo(crownPos.x + 3 * zoom, crownPos.y - 3 * zoom);
      ctx.lineTo(crownPos.x + 4 * zoom, crownPos.y);
      ctx.closePath();
      ctx.fill();
      // Cross on top
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(crownPos.x, crownPos.y - 3.5 * zoom);
      ctx.lineTo(crownPos.x, crownPos.y - 6 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crownPos.x - 1.5 * zoom, crownPos.y - 5 * zoom);
      ctx.lineTo(crownPos.x + 1.5 * zoom, crownPos.y - 5 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gold-plated chains between cars
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      const gc1a4b = isoOffset(trainX, trainY - 2 * zoom, 4.5);
      const gc1b4b = isoOffset(trainX, trainY - 2 * zoom, 3.5);
      ctx.beginPath();
      ctx.moveTo(gc1a4b.x, gc1a4b.y);
      ctx.quadraticCurveTo(
        (gc1a4b.x + gc1b4b.x) / 2,
        (gc1a4b.y + gc1b4b.y) / 2 + 2 * zoom,
        gc1b4b.x,
        gc1b4b.y,
      );
      ctx.stroke();
      const gc2a4b = isoOffset(trainX, trainY - 2 * zoom, -3.5);
      const gc2b4b = isoOffset(trainX, trainY - 2 * zoom, -4.5);
      ctx.beginPath();
      ctx.moveTo(gc2a4b.x, gc2a4b.y);
      ctx.quadraticCurveTo(
        (gc2a4b.x + gc2b4b.x) / 2,
        (gc2a4b.y + gc2b4b.y) / 2 + 2 * zoom,
        gc2b4b.x,
        gc2b4b.y,
      );
      ctx.stroke();

      // Royal standard flag (3D isometric with gold trim)
      const rsPole4b = isoOffset(armoredPos.x, armoredPos.y - 17 * zoom, 0);
      const rsIsoD = 1.2 * zoom;
      // Gold pole with isometric depth
      ctx.strokeStyle = "#a08020";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x, rsPole4b.y + 5 * zoom);
      ctx.lineTo(rsPole4b.x, rsPole4b.y - 4 * zoom);
      ctx.stroke();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        rsPole4b.x + rsIsoD * 0.4,
        rsPole4b.y + 5 * zoom - rsIsoD * 0.2,
      );
      ctx.lineTo(
        rsPole4b.x + rsIsoD * 0.4,
        rsPole4b.y - 4 * zoom - rsIsoD * 0.2,
      );
      ctx.stroke();
      // Gold pole finial (ornamental)
      ctx.fillStyle = "#daa520";
      ctx.beginPath();
      ctx.arc(rsPole4b.x, rsPole4b.y - 4 * zoom, 1.3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();
      // Diamond finial tip
      ctx.fillStyle = "#e8c847";
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x, rsPole4b.y - 6 * zoom);
      ctx.lineTo(rsPole4b.x + 0.8 * zoom, rsPole4b.y - 4.5 * zoom);
      ctx.lineTo(rsPole4b.x, rsPole4b.y - 3.5 * zoom);
      ctx.lineTo(rsPole4b.x - 0.8 * zoom, rsPole4b.y - 4.5 * zoom);
      ctx.closePath();
      ctx.fill();
      const rsWave4b = Math.sin(time * 2.5) * 0.5;
      // Flag back face (depth shadow)
      ctx.fillStyle = "#a04000";
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x + rsIsoD, rsPole4b.y - 3 * zoom - rsIsoD * 0.5);
      ctx.quadraticCurveTo(
        rsPole4b.x + 3 * zoom + rsIsoD,
        rsPole4b.y - 2 * zoom + rsWave4b * zoom - rsIsoD * 0.5,
        rsPole4b.x + 5 * zoom + rsIsoD,
        rsPole4b.y - 1.5 * zoom + rsWave4b * zoom - rsIsoD * 0.5,
      );
      ctx.lineTo(rsPole4b.x + rsIsoD, rsPole4b.y + 0.5 * zoom - rsIsoD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Flag front face
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x, rsPole4b.y - 3 * zoom);
      ctx.quadraticCurveTo(
        rsPole4b.x + 3 * zoom,
        rsPole4b.y - 2 * zoom + rsWave4b * zoom,
        rsPole4b.x + 5 * zoom,
        rsPole4b.y - 1.5 * zoom + rsWave4b * zoom,
      );
      ctx.lineTo(rsPole4b.x, rsPole4b.y + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
      // Flag outline with gold trim
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      // Cloth fold highlight
      ctx.strokeStyle = "rgba(255,200,100,0.2)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x + 1.5 * zoom, rsPole4b.y - 2.5 * zoom);
      ctx.lineTo(
        rsPole4b.x + 2.5 * zoom,
        rsPole4b.y - 0.5 * zoom + rsWave4b * zoom * 0.5,
      );
      ctx.stroke();

      // Orange stripe (3D isometric band)
      const stripeY = trainY - 2 * zoom;
      const stripeH = 3.5 * zoom;
      const stL = isoOffset(trainX, stripeY, -14);
      const stR = isoOffset(trainX, stripeY, 14);
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff7020";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();

      // Front headlight with heavy bracket mount
      const headlightPos = isoOffset(cabPos.x, cabPos.y - 7 * zoom, 8);
      // Heavy bracket from cab
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y - 8 * zoom);
      ctx.lineTo(headlightPos.x + 1.5 * zoom, headlightPos.y);
      ctx.stroke();
      // Octagonal armored housing with gold trim
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      for (let hi = 0; hi < 8; hi++) {
        const ha = (hi / 8) * Math.PI * 2;
        const hx = headlightPos.x + 1.5 * zoom + Math.cos(ha) * 3 * zoom;
        const hy = headlightPos.y + Math.sin(ha) * 3 * zoom;
        if (hi === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();
      // Lens glow
      ctx.fillStyle = `rgba(255, 250, 200, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 14 * zoom;
      ctx.beginPath();
      ctx.arc(
        headlightPos.x + 1.5 * zoom,
        headlightPos.y,
        2.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Armored ram with gold trim (bolted to chassis)
      const ramPos = isoOffset(cabPos.x, cabPos.y, 8);
      // Mounting struts from chassis
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y);
      ctx.lineTo(ramPos.x + 3 * zoom, ramPos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(ramPos.x + 3 * zoom, ramPos.y - 3 * zoom);
      ctx.stroke();
      // Right face
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(ramPos.x + 5 * zoom, ramPos.y - 5 * zoom);
      ctx.lineTo(ramPos.x - 4 * zoom, ramPos.y + 1 * zoom);
      ctx.lineTo(ramPos.x, ramPos.y + 5 * zoom);
      ctx.lineTo(ramPos.x + 4 * zoom, ramPos.y + 3 * zoom);
      ctx.lineTo(ramPos.x + 8 * zoom, ramPos.y - 1 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Left face
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.moveTo(ramPos.x + 5 * zoom, ramPos.y - 5 * zoom);
      ctx.lineTo(ramPos.x - 4 * zoom, ramPos.y + 1 * zoom);
      ctx.lineTo(ramPos.x - 4 * zoom, ramPos.y + 3 * zoom);
      ctx.lineTo(ramPos.x, ramPos.y + 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Gold trim on ram edge
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(ramPos.x + 5 * zoom, ramPos.y - 5 * zoom);
      ctx.lineTo(ramPos.x - 4 * zoom, ramPos.y + 1 * zoom);
      ctx.stroke();
      // Mounting bolts
      ctx.fillStyle = "#c9a227";
      for (let bi = 0; bi < 3; bi++) {
        const bx = ramPos.x + (1 + bi * 2) * zoom;
        const by = ramPos.y - (1 + bi * 1.5) * zoom;
        ctx.beginPath();
        ctx.arc(bx, by, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ========== PLATFORM LAMPS (3D isometric, rendered before crane) ==========
  {
    const lampSpread = 34 + tower.level * 2;
    const lampHeight = 24 + tower.level * 3;
    const lampPositions = [
      {
        x: screenPos.x - lampSpread * zoom,
        y: screenPos.y - lampHeight * zoom,
        side: -1,
      },
      {
        x: screenPos.x + lampSpread * zoom,
        y: screenPos.y - lampHeight * zoom,
        side: 1,
      },
    ];

    const postColor =
      tower.level === 1
        ? "#4a3a28"
        : tower.level === 2
          ? "#3a3a42"
          : tower.level === 3
            ? "#2a2a32"
            : "#3a3020";
    const postLight =
      tower.level === 1
        ? "#5a4a38"
        : tower.level === 2
          ? "#4a4a52"
          : tower.level === 3
            ? "#3a3a42"
            : "#4a4030";
    const postAccent =
      tower.level === 1
        ? "#6a5a48"
        : tower.level === 2
          ? "#5a5a62"
          : tower.level === 3
            ? "#4a4a52"
            : "#5a4a30";
    const glowR =
      tower.level === 1
        ? 255
        : tower.level === 2
          ? 200
          : tower.level === 3
            ? 180
            : 255;
    const glowG =
      tower.level === 1
        ? 180
        : tower.level === 2
          ? 220
          : tower.level === 3
            ? 200
            : 160;
    const glowB =
      tower.level === 1
        ? 80
        : tower.level === 2
          ? 255
          : tower.level === 3
            ? 255
            : 40;
    const glowHex =
      tower.level === 1
        ? "#ff9632"
        : tower.level === 2
          ? "#64c8ff"
          : tower.level === 3
            ? "#80c8ff"
            : "#ffa028";

    for (let i = 0; i < lampPositions.length; i++) {
      const lamp = lampPositions[i];
      const postH = 34 * zoom;
      const postW = 3 * zoom;
      const postD = 2 * zoom;

      // Ground light pool (drawn first, underneath everything)
      const lampGlow = 0.6 + Math.sin(time * 2.5 + i * Math.PI) * 0.25;
      ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${lampGlow * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(
        lamp.x,
        lamp.y + postH + 2 * zoom,
        10 * zoom,
        5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Isometric base plate (diamond footing)
      const baseW = 4 * zoom;
      const baseD = 2.5 * zoom;
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lamp.x, lamp.y + postH - baseD);
      ctx.lineTo(lamp.x + baseW, lamp.y + postH);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD);
      ctx.lineTo(lamp.x - baseW, lamp.y + postH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = postColor;
      ctx.beginPath();
      ctx.moveTo(lamp.x - baseW, lamp.y + postH);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD + 1.5 * zoom);
      ctx.lineTo(lamp.x - baseW, lamp.y + postH + 1.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = postLight;
      ctx.beginPath();
      ctx.moveTo(lamp.x + baseW, lamp.y + postH);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD + 1.5 * zoom);
      ctx.lineTo(lamp.x + baseW, lamp.y + postH + 1.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Post left face (tapers slightly at top)
      ctx.fillStyle = postColor;
      ctx.beginPath();
      ctx.moveTo(lamp.x - postW * 0.6, lamp.y + postH);
      ctx.lineTo(lamp.x - postW * 0.4, lamp.y);
      ctx.lineTo(lamp.x + postD * 0.1, lamp.y - postD * 0.5);
      ctx.lineTo(lamp.x + postD * 0.1, lamp.y + postH - postD * 0.5);
      ctx.closePath();
      ctx.fill();

      // Post right face
      ctx.fillStyle = postLight;
      ctx.beginPath();
      ctx.moveTo(lamp.x + postD * 0.1, lamp.y + postH - postD * 0.5);
      ctx.lineTo(lamp.x + postD * 0.1, lamp.y - postD * 0.5);
      ctx.lineTo(lamp.x + postW * 0.4, lamp.y);
      ctx.lineTo(lamp.x + postW * 0.6, lamp.y + postH);
      ctx.closePath();
      ctx.fill();

      // Decorative band rings along post
      ctx.strokeStyle = postAccent;
      ctx.lineWidth = 1.2 * zoom;
      for (let band = 0; band < 3; band++) {
        const bandY = lamp.y + postH * (0.2 + band * 0.3);
        ctx.beginPath();
        ctx.moveTo(lamp.x - postW * 0.55, bandY);
        ctx.lineTo(lamp.x + postW * 0.55, bandY);
        ctx.stroke();
      }

      // Scroll bracket arm (isometric curved support with depth)
      const armDir = lamp.side;
      const armBaseY = lamp.y + 2 * zoom;
      const armTipX = lamp.x + armDir * 7 * zoom;
      const armTipY = lamp.y - 4 * zoom;

      // Bracket back face (depth)
      ctx.strokeStyle = postColor;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lamp.x, armBaseY);
      ctx.quadraticCurveTo(
        lamp.x + armDir * 5 * zoom,
        armBaseY - 1 * zoom,
        armTipX,
        armTipY,
      );
      ctx.stroke();

      // Bracket front face (lighter)
      ctx.strokeStyle = postLight;
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(lamp.x, armBaseY - 0.8 * zoom);
      ctx.quadraticCurveTo(
        lamp.x + armDir * 5 * zoom,
        armBaseY - 1.8 * zoom,
        armTipX,
        armTipY - 0.8 * zoom,
      );
      ctx.stroke();

      // Decorative scroll curl at bracket end
      ctx.strokeStyle = postAccent;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(
        armTipX,
        armTipY + 1 * zoom,
        2 * zoom,
        -Math.PI * 0.5,
        Math.PI * 0.8,
      );
      ctx.stroke();

      // Hanging chain/rod from bracket to lantern
      const lanternX = armTipX;
      const lanternY = armTipY + 3 * zoom;
      ctx.strokeStyle = postColor;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(armTipX, armTipY);
      ctx.lineTo(lanternX, lanternY - 2 * zoom);
      ctx.stroke();

      // 3D isometric lantern housing
      const lw = 4.5 * zoom;
      const lh = 6 * zoom;
      const ld = 3 * zoom;

      // Lantern roof (pyramid cap)
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lanternX, lanternY - lh * 0.5 - 2.5 * zoom);
      ctx.lineTo(lanternX - lw * 0.55, lanternY - lh * 0.5);
      ctx.lineTo(lanternX, lanternY - lh * 0.5 + ld * 0.4);
      ctx.lineTo(lanternX + lw * 0.55, lanternY - lh * 0.5);
      ctx.closePath();
      ctx.fill();

      // Lantern left face
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX - lw * 0.5, lanternY - lh * 0.45);
      ctx.lineTo(lanternX, lanternY - lh * 0.45 - ld * 0.4);
      ctx.lineTo(lanternX, lanternY + lh * 0.4 - ld * 0.4);
      ctx.closePath();
      ctx.fill();

      // Lantern right face
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.moveTo(lanternX, lanternY + lh * 0.4 - ld * 0.4);
      ctx.lineTo(lanternX, lanternY - lh * 0.45 - ld * 0.4);
      ctx.lineTo(lanternX + lw * 0.5, lanternY - lh * 0.45);
      ctx.lineTo(lanternX + lw * 0.5, lanternY + lh * 0.4);
      ctx.closePath();
      ctx.fill();

      // Lantern frame edges
      ctx.strokeStyle = postAccent;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX - lw * 0.5, lanternY - lh * 0.45);
      ctx.moveTo(lanternX + lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX + lw * 0.5, lanternY - lh * 0.45);
      ctx.moveTo(lanternX, lanternY + lh * 0.4 - ld * 0.4);
      ctx.lineTo(lanternX, lanternY - lh * 0.45 - ld * 0.4);
      ctx.stroke();

      // Lantern bottom rim
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX, lanternY + lh * 0.4 + ld * 0.3);
      ctx.lineTo(lanternX + lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX, lanternY + lh * 0.4 - ld * 0.3);
      ctx.closePath();
      ctx.fill();

      // Left glass pane glow
      ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${lampGlow * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.42, lanternY + lh * 0.3);
      ctx.lineTo(lanternX - lw * 0.42, lanternY - lh * 0.3);
      ctx.lineTo(lanternX - lw * 0.05, lanternY - lh * 0.3 - ld * 0.35);
      ctx.lineTo(lanternX - lw * 0.05, lanternY + lh * 0.3 - ld * 0.35);
      ctx.closePath();
      ctx.fill();

      // Right glass pane glow (brighter)
      ctx.fillStyle = `rgba(${Math.min(255, glowR + 20)}, ${Math.min(255, glowG + 20)}, ${Math.min(255, glowB + 20)}, ${lampGlow * 0.65})`;
      ctx.beginPath();
      ctx.moveTo(lanternX + lw * 0.05, lanternY + lh * 0.3 - ld * 0.35);
      ctx.lineTo(lanternX + lw * 0.05, lanternY - lh * 0.3 - ld * 0.35);
      ctx.lineTo(lanternX + lw * 0.42, lanternY - lh * 0.3);
      ctx.lineTo(lanternX + lw * 0.42, lanternY + lh * 0.3);
      ctx.closePath();
      ctx.fill();

      // Inner flame/bulb glow
      ctx.fillStyle = `rgba(${glowR}, ${Math.max(0, glowG - 30)}, ${Math.max(0, glowB - 30)}, ${lampGlow})`;
      ctx.shadowColor = glowHex;
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Finial spike on lantern roof
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lanternX - 0.5 * zoom, lanternY - lh * 0.5 - 2.5 * zoom);
      ctx.lineTo(lanternX, lanternY - lh * 0.5 - 4 * zoom);
      ctx.lineTo(lanternX + 0.5 * zoom, lanternY - lh * 0.5 - 2.5 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- CRANE ARM (rendered above train for correct layering) ----
  {
    const crMastColor = tower.level >= 4 ? "#b89227" : "#6a6a72";
    const crMastDark = tower.level >= 4 ? "#a08020" : "#5a5a62";
    const crMastW = 2.5 * zoom;
    const crMastD = 1.5 * zoom;
    const crMastH = 22 * zoom;
    const crMastX = dockX + 4 * zoom;
    const crMastY = dockY - 20 * zoom;
    ctx.fillStyle = crMastDark;
    ctx.beginPath();
    ctx.moveTo(crMastX, crMastY + crMastH);
    ctx.lineTo(crMastX, crMastY);
    ctx.lineTo(crMastX + crMastD * 0.5, crMastY - crMastD * 0.25);
    ctx.lineTo(crMastX + crMastD * 0.5, crMastY + crMastH - crMastD * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = crMastColor;
    ctx.beginPath();
    ctx.moveTo(crMastX + crMastD * 0.5, crMastY + crMastH - crMastD * 0.25);
    ctx.lineTo(crMastX + crMastD * 0.5, crMastY - crMastD * 0.25);
    ctx.lineTo(crMastX + crMastW, crMastY);
    ctx.lineTo(crMastX + crMastW, crMastY + crMastH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = crMastDark;
    ctx.lineWidth = 0.6 * zoom;
    for (let li = 0; li < 4; li++) {
      const ly = crMastY + 2 * zoom + li * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(crMastX + crMastD * 0.5, ly);
      ctx.lineTo(crMastX + crMastW, ly + 2.5 * zoom);
      ctx.moveTo(crMastX + crMastW, ly);
      ctx.lineTo(crMastX + crMastD * 0.5, ly + 2.5 * zoom);
      ctx.stroke();
    }

    ctx.fillStyle = crMastColor;
    ctx.beginPath();
    ctx.arc(dockX + 5.2 * zoom, dockY - 20 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const pulleySpin = time * (stationActive ? 0.8 : 0.5);
    for (let ps = 0; ps < 4; ps++) {
      const psA = pulleySpin + (ps / 4) * Math.PI * 2;
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(dockX + 5.2 * zoom, dockY - 20 * zoom);
      ctx.lineTo(
        dockX + 5.2 * zoom + Math.cos(psA) * 1.5 * zoom,
        dockY - 20 * zoom + Math.sin(psA) * 1.5 * zoom,
      );
      ctx.stroke();
    }

    const craneSpeed = stationActive ? 0.5 : 0.3;
    const craneAngle = time * craneSpeed;
    const craneArmLen = 14 * zoom;
    const craneArmX = dockX + 5 * zoom + Math.cos(craneAngle) * craneArmLen;
    const craneArmY =
      dockY - 20 * zoom + Math.sin(craneAngle) * craneArmLen * 0.3;

    ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#7a7a82";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(dockX + 5 * zoom, dockY - 20 * zoom);
    ctx.lineTo(craneArmX, craneArmY);
    ctx.stroke();

    ctx.lineWidth = 0.7 * zoom;
    for (let tv = 0; tv < 3; tv++) {
      const tvT = (tv + 1) / 4;
      const tvx = dockX + 5 * zoom + (craneArmX - dockX - 5 * zoom) * tvT;
      const tvy = dockY - 20 * zoom + (craneArmY - dockY + 20 * zoom) * tvT;
      ctx.beginPath();
      ctx.moveTo(tvx, tvy - 1.5 * zoom);
      ctx.lineTo(tvx + 1.5 * zoom, tvy);
      ctx.lineTo(tvx, tvy + 1.5 * zoom);
      ctx.stroke();
    }

    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1 * zoom;
    const cableSwing = Math.sin(time * 2 + 0.5) * 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(craneArmX, craneArmY);
    ctx.quadraticCurveTo(
      craneArmX + cableSwing * 0.5,
      craneArmY + 6 * zoom,
      craneArmX + cableSwing,
      craneArmY + 10 * zoom,
    );
    ctx.stroke();

    const hangCrateSize = 2.5 * zoom;
    const hangCrateX = craneArmX + cableSwing;
    const hangCrateY = craneArmY + 10 * zoom;
    ctx.fillStyle = tower.level >= 4 ? "#c9a230" : "#9a7920";
    ctx.beginPath();
    ctx.moveTo(hangCrateX, hangCrateY - hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX + hangCrateSize, hangCrateY);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX - hangCrateSize, hangCrateY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = tower.level >= 4 ? "#a08020" : "#7a5810";
    ctx.beginPath();
    ctx.moveTo(hangCrateX - hangCrateSize, hangCrateY);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 1.5);
    ctx.lineTo(hangCrateX - hangCrateSize, hangCrateY + hangCrateSize * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = tower.level >= 4 ? "#b89227" : "#8b6914";
    ctx.beginPath();
    ctx.moveTo(hangCrateX + hangCrateSize, hangCrateY);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 1.5);
    ctx.lineTo(hangCrateX + hangCrateSize, hangCrateY + hangCrateSize * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // ========== SPAWN POSITIONS ==========
  const spawnPositions = [
    { x: screenPos.x - 24 * zoom, y: screenPos.y + 22 * zoom },
    { x: screenPos.x, y: screenPos.y + 28 * zoom },
    { x: screenPos.x + 24 * zoom, y: screenPos.y + 22 * zoom },
  ];

  if (tower.showSpawnMarkers || tower.selected) {
    for (let i = 0; i < spawnPositions.length; i++) {
      const pos = spawnPositions[i];
      const occupied = (tower.occupiedSpawnSlots || [])[i];
      const pulse = 0.6 + Math.sin(time * 3 + i) * 0.3;

      ctx.strokeStyle = occupied
        ? `rgba(255, 100, 100, ${pulse * 0.6})`
        : `rgba(255, 108, 0, ${pulse})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 14 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = occupied
        ? "rgba(180, 80, 80, 0.9)"
        : "rgba(200, 100, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${6 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText((i + 1).toString(), pos.x, pos.y + 2 * zoom);
    }
  }

  // (Spawn effect removed - no large circle effects)

  // ========== ENHANCED ANIMATED OVERLAYS ==========

  // ---- SIGNAL LIGHTS (cycling red/green/amber) ----
  const signalBaseX = screenPos.x - 30 * zoom;
  const signalBaseY = screenPos.y - (6 + tower.level * 2) * zoom;
  const sigPostW = 2.5 * zoom;
  const sigPostD = 1.5 * zoom;

  // 3D signal post (left face)
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - sigPostW * 0.5, signalBaseY + 16 * zoom);
  ctx.lineTo(signalBaseX - sigPostW * 0.5, signalBaseY);
  ctx.lineTo(signalBaseX, signalBaseY - sigPostD * 0.5);
  ctx.lineTo(signalBaseX, signalBaseY + 16 * zoom - sigPostD * 0.5);
  ctx.closePath();
  ctx.fill();

  // 3D signal post (right face)
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(signalBaseX, signalBaseY + 16 * zoom - sigPostD * 0.5);
  ctx.lineTo(signalBaseX, signalBaseY - sigPostD * 0.5);
  ctx.lineTo(signalBaseX + sigPostW * 0.5, signalBaseY);
  ctx.lineTo(signalBaseX + sigPostW * 0.5, signalBaseY + 16 * zoom);
  ctx.closePath();
  ctx.fill();

  // 3D signal housing (left face)
  const shY = signalBaseY - 12 * zoom;
  const shW = 4 * zoom;
  const shH = 14 * zoom;
  const shD = 3 * zoom;

  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - shW, shY + shH);
  ctx.lineTo(signalBaseX - shW, shY);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY - shD * 0.25);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY + shH - shD * 0.25);
  ctx.closePath();
  ctx.fill();

  // 3D signal housing (right face)
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - shW + shD * 0.5, shY + shH - shD * 0.25);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY - shD * 0.25);
  ctx.lineTo(signalBaseX + shW, shY);
  ctx.lineTo(signalBaseX + shW, shY + shH);
  ctx.closePath();
  ctx.fill();

  // 3D signal housing (top face)
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - shW, shY);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY - shD * 0.25);
  ctx.lineTo(signalBaseX + shW, shY);
  ctx.lineTo(signalBaseX + shW - shD * 0.5, shY + shD * 0.25);
  ctx.closePath();
  ctx.fill();

  // Housing visor hoods over each light
  ctx.fillStyle = "#1a1a1e";
  for (let vi = 0; vi < 3; vi++) {
    const visorY = shY + 1.5 * zoom + vi * 4.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(signalBaseX - shW - 1.5 * zoom, visorY);
    ctx.lineTo(signalBaseX - shW, visorY - 1 * zoom);
    ctx.lineTo(signalBaseX + shW, visorY - 1 * zoom);
    ctx.lineTo(signalBaseX + shW + 1.5 * zoom, visorY);
    ctx.closePath();
    ctx.fill();
  }

  const signalCycle = (time * 0.5) % 3;
  const signalColors = [
    { color: "#ff3333", glowColor: "#ff0000", label: "red" },
    { color: "#ffaa00", glowColor: "#ff8800", label: "amber" },
    { color: "#33ff33", glowColor: "#00ff00", label: "green" },
  ];

  for (let si = 0; si < 3; si++) {
    const lightY = signalBaseY - 10 * zoom + si * 4.5 * zoom;
    const isActive = Math.floor(signalCycle) === si;
    const brightness = isActive ? 0.8 + Math.sin(time * 6) * 0.2 : 0.15;
    const sc = signalColors[si];

    if (isActive) {
      ctx.shadowColor = sc.glowColor;
      ctx.shadowBlur = 8 * zoom;
    }
    ctx.fillStyle = isActive ? sc.color : `rgba(40, 40, 40, 0.8)`;
    ctx.globalAlpha = isActive ? brightness : 0.5;
    ctx.beginPath();
    ctx.arc(signalBaseX, lightY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // During active state (spawn or attack), all lights flash
  if (stationActive) {
    const alertRate = isStationAttacking ? 8 : 6;
    const alertFlash = Math.sin(time * alertRate) > 0 ? 0.9 : 0.2;
    const alertColor = isStationAttacking
      ? `rgba(255, 50, 30, ${alertFlash})`
      : `rgba(255, 108, 0, ${alertFlash})`;
    ctx.fillStyle = alertColor;
    ctx.shadowColor = isStationAttacking ? "#ff3220" : "#ff6c00";
    ctx.shadowBlur = 10 * zoom;
    for (let si = 0; si < 3; si++) {
      const lightY = signalBaseY - 10 * zoom + si * 4.5 * zoom;
      ctx.beginPath();
      ctx.arc(signalBaseX, lightY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ---- CONVEYOR BELT / TRANSPORT TRACK ----
  const conveyorCX = screenPos.x + 8 * zoom;
  const conveyorCY = screenPos.y + 6 * zoom;
  const conveyorLen = 20 * zoom;
  const conveyorW = 3 * zoom;
  const beltSpeed = stationActive ? time * 2.5 : time * 1.5;

  // Belt side rails (3D frame) — proper 2:1 iso slope
  const beltRailColor =
    tower.level >= 4 ? "#8a7020" : tower.level >= 3 ? "#4a4a52" : "#5a4a3a";
  const beltTilt = Math.atan2(-1, 2);
  ctx.strokeStyle = beltRailColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY - conveyorW);
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorW - conveyorLen * 0.5,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY);
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorLen * 0.5 + conveyorW,
  );
  ctx.stroke();

  // Belt surface
  ctx.fillStyle = tower.level >= 3 ? "#3a3a42" : "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY - conveyorW);
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorW - conveyorLen * 0.5,
  );
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorLen * 0.5 + conveyorW,
  );
  ctx.lineTo(conveyorCX - conveyorLen * 0.5, conveyorCY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Roller drums at each end — tilted to match belt angle
  const rollerColor = tower.level >= 4 ? "#c9a227" : "#6a6a72";
  for (const rEnd of [-0.5, 0.5]) {
    const rx = conveyorCX + conveyorLen * rEnd;
    const ry = conveyorCY - (rEnd + 0.5) * conveyorLen * 0.5;
    ctx.fillStyle = rollerColor;
    ctx.beginPath();
    ctx.ellipse(
      rx,
      ry - conveyorW * 0.5,
      conveyorW * 0.8,
      conveyorW * 0.4,
      beltTilt,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const rollerSpin = time * (stationActive ? 3 : 2);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.5 * zoom;
    for (let rs = 0; rs < 4; rs++) {
      const rsAngle = rollerSpin + rs * Math.PI * 0.5;
      const rsx = Math.cos(rsAngle) * conveyorW * 0.5;
      const rsy = Math.sin(rsAngle) * conveyorW * 0.25;
      const tCos = Math.cos(beltTilt);
      const tSin = Math.sin(beltTilt);
      ctx.beginPath();
      ctx.moveTo(
        rx + rsx * tCos - rsy * tSin,
        ry - conveyorW * 0.5 + rsx * tSin + rsy * tCos,
      );
      ctx.lineTo(
        rx - rsx * tCos + rsy * tSin,
        ry - conveyorW * 0.5 - rsx * tSin - rsy * tCos,
      );
      ctx.stroke();
    }
  }

  // Moving belt chevron segments
  ctx.lineWidth = 1.5 * zoom;
  const numSegments = 8;
  for (let seg = 0; seg < numSegments; seg++) {
    const segT = (seg / numSegments + beltSpeed * 0.1) % 1;
    const sx = conveyorCX - conveyorLen * 0.5 + segT * conveyorLen;
    const sy = conveyorCY - segT * conveyorLen * 0.5;
    ctx.strokeStyle =
      tower.level >= 4 ? `rgba(201, 162, 39, 0.6)` : `rgba(120, 120, 130, 0.6)`;
    ctx.beginPath();
    ctx.moveTo(sx, sy - conveyorW);
    ctx.lineTo(sx + 1.5 * zoom, sy - conveyorW * 0.5);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }

  // Belt glow during active state
  if (stationActive) {
    const beltGlow = 0.1 + stationIntensity * 0.15;
    ctx.fillStyle = isStationAttacking
      ? `rgba(255, 60, 30, ${beltGlow})`
      : `rgba(255, 180, 80, ${beltGlow})`;
    ctx.beginPath();
    ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY - conveyorW);
    ctx.lineTo(
      conveyorCX + conveyorLen * 0.5,
      conveyorCY - conveyorW - conveyorLen * 0.5,
    );
    ctx.lineTo(
      conveyorCX + conveyorLen * 0.5,
      conveyorCY - conveyorLen * 0.5 + conveyorW,
    );
    ctx.lineTo(conveyorCX - conveyorLen * 0.5, conveyorCY);
    ctx.closePath();
    ctx.fill();
  }

  // Multiple cargo crates on belt — 3D isometric boxes
  const crateColors = [
    tower.level >= 4 ? "#b89227" : "#8b6914",
    tower.level >= 4 ? "#a08020" : "#7a5810",
    tower.level >= 4 ? "#c9a230" : "#9a7920",
  ];
  const crateDarkColors = [
    tower.level >= 4 ? "#8a6a17" : "#6b4904",
    tower.level >= 4 ? "#806010" : "#5a3800",
    tower.level >= 4 ? "#a98220" : "#7a5910",
  ];
  for (let ci = 0; ci < 3; ci++) {
    const crateT = (beltSpeed * 0.08 + ci * 0.33) % 1;
    const crateX = conveyorCX - conveyorLen * 0.4 + crateT * conveyorLen * 0.8;
    const crateY =
      conveyorCY - (0.1 + crateT * 0.8) * conveyorLen * 0.5 - conveyorW * 0.5;
    const crateSize = (2.5 - ci * 0.3) * zoom;
    const cw = crateSize;
    const cd = crateSize * 0.5;
    const ch = crateSize * 1.2;

    // Left face
    ctx.fillStyle = crateDarkColors[ci];
    ctx.beginPath();
    ctx.moveTo(crateX - cw, crateY - ch);
    ctx.lineTo(crateX, crateY + cd - ch);
    ctx.lineTo(crateX, crateY + cd);
    ctx.lineTo(crateX - cw, crateY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Right face
    ctx.fillStyle = crateColors[ci];
    ctx.beginPath();
    ctx.moveTo(crateX + cw, crateY - ch);
    ctx.lineTo(crateX, crateY + cd - ch);
    ctx.lineTo(crateX, crateY + cd);
    ctx.lineTo(crateX + cw, crateY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Top face
    ctx.fillStyle = crateColors[ci];
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(crateX, crateY - cd - ch);
    ctx.lineTo(crateX - cw, crateY - ch);
    ctx.lineTo(crateX, crateY + cd - ch);
    ctx.lineTo(crateX + cw, crateY - ch);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---- OSCILLATING COMM ANTENNA WITH SIGNAL WAVES ----
  // Antenna base sits on the main building roof/battlements for each level
  const antennaHeight = (12 + tower.level * 2) * zoom;
  const roofTopForAntenna =
    tower.level === 1
      ? screenPos.y - 50 * zoom
      : tower.level === 2
        ? screenPos.y - 44 * zoom
        : tower.level === 3
          ? screenPos.y - 46 * zoom
          : tower.upgrade === "A"
            ? screenPos.y - 45 * zoom
            : screenPos.y - 51 * zoom;
  const antennaX = stationX;
  const antennaY = roofTopForAntenna - antennaHeight;
  const antOscillation = Math.sin(time * 3) * 2 * zoom;

  // Antenna mast
  ctx.strokeStyle = tower.level >= 4 ? "#b89227" : "#6a6a72";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(antennaX, antennaY + antennaHeight);
  ctx.lineTo(antennaX + antOscillation * 0.3, antennaY);
  ctx.stroke();

  // Antenna tip node
  const antTipX = antennaX + antOscillation * 0.3;
  const antTipY = antennaY;
  ctx.fillStyle = tower.level >= 4 ? "#e8c847" : "#aaaaaa";
  ctx.beginPath();
  ctx.arc(antTipX, antTipY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Blinking LED on tip
  const ledRate = stationActive ? 10 : 8;
  const ledBlink = Math.sin(time * ledRate) > 0.3;
  if (ledBlink) {
    ctx.fillStyle = stationActive ? "#ff3333" : "#33ff33";
    ctx.shadowColor = stationActive ? "#ff0000" : "#00ff00";
    ctx.shadowBlur = (stationActive ? 10 : 6) * zoom;
    ctx.beginPath();
    ctx.arc(antTipX, antTipY - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Cross-bar elements on antenna mast
  ctx.strokeStyle = tower.level >= 4 ? "#b89227" : "#6a6a72";
  ctx.lineWidth = 1 * zoom;
  for (let cb = 0; cb < 3; cb++) {
    const cbY = antennaY + antennaHeight * (0.25 + cb * 0.25);
    const cbW = (3.5 - cb * 0.8) * zoom;
    const cbSway = antOscillation * (1 - cb * 0.2) * 0.3;
    ctx.beginPath();
    ctx.moveTo(antennaX + cbSway - cbW, cbY);
    ctx.lineTo(antennaX + cbSway + cbW, cbY);
    ctx.stroke();
  }

  // Signal wave arcs emanating from antenna (always blue/cyan, no red)
  const numWaves = stationActive ? 4 : 2;
  const waveSpeedMul = stationActive ? 2.5 : 2;
  for (let w = 0; w < numWaves; w++) {
    const wavePhase = (time * waveSpeedMul + w * 0.5) % 2;
    if (wavePhase < 1.5) {
      const waveR = (5 + wavePhase * 14) * zoom;
      const waveAlpha = (1 - wavePhase / 1.5) * (stationActive ? 0.45 : 0.3);
      ctx.strokeStyle = `rgba(100, 200, 255, ${waveAlpha})`;
      ctx.lineWidth = (stationActive ? 2 : 1.5) * zoom;
      ctx.beginPath();
      ctx.arc(antTipX, antTipY, waveR, -Math.PI * 0.7, -Math.PI * 0.05);
      ctx.stroke();
    }
  }

  // Signal wave particles (always blue/cyan, no red)
  const sigParticleCount = stationActive ? 4 : 2;
  for (let p = 0; p < sigParticleCount; p++) {
    const pPhase = (time * (stationActive ? 3.5 : 3) + p * 1.2) % 2;
    if (pPhase < 1.2) {
      const pDist = pPhase * 18 * zoom;
      const pAngle = -Math.PI * 0.35 + Math.sin(time * 2 + p) * 0.3;
      const pAlpha = (1 - pPhase / 1.2) * 0.7;
      ctx.fillStyle = `rgba(120, 200, 255, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(
        antTipX + Math.cos(pAngle) * pDist,
        antTipY + Math.sin(pAngle) * pDist,
        (1.8 - pPhase * 0.6) * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // (Helipad removed)

  // ---- TRACK SWITCHING MECHANISM ----
  const switchX = screenPos.x - 6 * zoom;
  const switchY = screenPos.y + 14 * zoom;
  const switchAngle = Math.sin(time * 0.8) * 0.4;

  // Track ties (3D isometric wooden cross-beams beneath switch)
  const tieColor =
    tower.level >= 4 ? "#5a4a3a" : tower.level >= 3 ? "#4a4a52" : "#5a4a3a";
  const tieDark =
    tower.level >= 4 ? "#4a3a2a" : tower.level >= 3 ? "#3a3a42" : "#4a3a2a";
  for (let ti = 0; ti < 3; ti++) {
    const tix = switchX + (ti - 1) * 4 * zoom;
    const tiy = switchY + (ti - 1) * 2 * zoom;
    const tw = 3 * zoom;
    const th = 1.2 * zoom;
    const td = 0.6 * zoom;
    // Top face
    ctx.fillStyle = tieColor;
    ctx.beginPath();
    ctx.moveTo(tix - tw, tiy - th * 0.5);
    ctx.lineTo(tix - tw + td, tiy - th * 0.5 - td * 0.5);
    ctx.lineTo(tix + tw + td, tiy - th * 0.5 - td * 0.5);
    ctx.lineTo(tix + tw, tiy - th * 0.5);
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = tieDark;
    ctx.beginPath();
    ctx.moveTo(tix - tw, tiy - th * 0.5);
    ctx.lineTo(tix + tw, tiy - th * 0.5);
    ctx.lineTo(tix + tw, tiy + th * 0.5);
    ctx.lineTo(tix - tw, tiy + th * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Guard rails (fixed outer rails)
  const guardColor = tower.level >= 4 ? "#a08020" : "#6a6a72";
  ctx.strokeStyle = guardColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(switchX - 6 * zoom, switchY + 3 * zoom);
  ctx.lineTo(switchX + 6 * zoom, switchY - 3 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(switchX - 6 * zoom, switchY + 5 * zoom);
  ctx.lineTo(switchX + 6 * zoom, switchY - 1 * zoom);
  ctx.stroke();

  // Switch rail pivot point (enhanced)
  ctx.fillStyle = tower.level >= 4 ? "#8a7020" : "#3a3a42";
  ctx.beginPath();
  ctx.arc(switchX, switchY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  // Pivot center bolt
  ctx.fillStyle = tower.level >= 4 ? "#c9a227" : "#7a7a82";
  ctx.beginPath();
  ctx.arc(switchX, switchY, 1 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Switch lever rail
  ctx.save();
  ctx.translate(switchX, switchY);
  ctx.strokeStyle = tower.level >= 4 ? "#b89227" : "#7a7a82";
  ctx.lineWidth = 2.5 * zoom;
  const swLeverX = Math.cos(-0.5 + switchAngle) * 10 * zoom;
  const swLeverY = Math.sin(-0.5 + switchAngle) * 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(swLeverX, swLeverY);
  ctx.stroke();

  // Switch lever handle (grip at end)
  ctx.fillStyle = tower.level >= 4 ? "#c9a227" : "#5a5a62";
  ctx.beginPath();
  ctx.arc(swLeverX, swLeverY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tower.level >= 4 ? "#e8c847" : "#8a8a92";
  ctx.beginPath();
  ctx.arc(swLeverX, swLeverY, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Switch indicator light housing (3D isometric box)
  const slhW = 2.5 * zoom;
  const slhH = 5 * zoom;
  const slhD = 1.5 * zoom;
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(-slhW, -6 * zoom + slhH);
  ctx.lineTo(-slhW, -6 * zoom);
  ctx.lineTo(-slhW + slhD * 0.5, -6 * zoom - slhD * 0.25);
  ctx.lineTo(-slhW + slhD * 0.5, -6 * zoom + slhH - slhD * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.moveTo(-slhW + slhD * 0.5, -6 * zoom + slhH - slhD * 0.25);
  ctx.lineTo(-slhW + slhD * 0.5, -6 * zoom - slhD * 0.25);
  ctx.lineTo(slhW, -6 * zoom);
  ctx.lineTo(slhW, -6 * zoom + slhH);
  ctx.closePath();
  ctx.fill();
  const switchLit = switchAngle > 0;
  ctx.fillStyle = switchLit ? "#33ff33" : "#ff3333";
  ctx.shadowColor = switchLit ? "#00ff00" : "#ff0000";
  ctx.shadowBlur = (stationActive ? 8 : 4) * zoom;
  ctx.beginPath();
  ctx.arc(0, -3.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // (Active-state energy buildup

  // ---- CHIMNEY SMOKE / STEAM (passive, all levels, denser during active) ----
  const smokeX = screenPos.x - 18 * zoom;
  const smokeBaseY = screenPos.y - (22 + tower.level * 4) * zoom;
  const numSmokePuffs = stationActive
    ? 6 + tower.level
    : 3 + Math.min(tower.level, 2);
  const smokeSpeedMul = stationActive ? 1.6 : 0.8;

  for (let sm = 0; sm < numSmokePuffs; sm++) {
    const smPhase = (time * smokeSpeedMul + sm * 0.7) % 3;
    if (smPhase < 2.5) {
      const smDrift =
        Math.sin(time * 0.5 + sm * 2.3) * (stationActive ? 6 : 4) * zoom;
      const smY = smokeBaseY - smPhase * (stationActive ? 12 : 8) * zoom;
      const smR = (2 + smPhase * (stationActive ? 2.2 : 1.5)) * zoom;
      const smAlpha = Math.max(
        0,
        (1 - smPhase / 2.5) * (stationActive ? 0.35 : 0.25),
      );

      // Layered puff - darker core, lighter outer
      ctx.fillStyle = stationActive
        ? `rgba(140, 120, 100, ${smAlpha * 0.6})`
        : `rgba(160, 160, 160, ${smAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(smokeX + smDrift, smY, smR * 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = stationActive
        ? `rgba(200, 180, 160, ${smAlpha})`
        : `rgba(190, 190, 200, ${smAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX + smDrift, smY, smR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Secondary steam vent (right side of building)
  const vent2X = screenPos.x + 4 * zoom;
  const vent2Y = screenPos.y - (20 + tower.level * 3) * zoom;
  const steamPuffs = stationActive ? 4 : 2;
  for (let sv = 0; sv < steamPuffs; sv++) {
    const svPhase = (time * 1.2 + sv * 1.1) % 2.5;
    if (svPhase < 1.8) {
      const svDrift = Math.sin(time * 0.7 + sv * 1.7) * 3 * zoom;
      const svY = vent2Y - svPhase * 7 * zoom;
      const svR = (1.5 + svPhase * 1.2) * zoom;
      const svAlpha = Math.max(0, (1 - svPhase / 1.8) * 0.2);
      ctx.fillStyle = `rgba(200, 210, 220, ${svAlpha})`;
      ctx.beginPath();
      ctx.arc(vent2X + svDrift, svY, svR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- PLATFORM EDGE RUNNING LIGHTS ----
  const edgeLightCount = 4 + tower.level;
  for (let el = 0; el < edgeLightCount; el++) {
    const elT = el / (edgeLightCount - 1);
    const elx = screenPos.x - isoW + elT * isoW * 2;
    const ely = screenPos.y + isoD * (1 - Math.abs(elT - 0.5) * 2) + 2 * zoom;
    const elPulse = 0.2 + Math.sin(time * 3 + el * 1.2) * 0.3;
    const elAlpha = stationActive ? elPulse + stationIntensity * 0.3 : elPulse;

    ctx.fillStyle =
      tower.level >= 4
        ? `rgba(201, 162, 39, ${elAlpha})`
        : `rgba(255, 200, 100, ${elAlpha})`;
    ctx.beginPath();
    ctx.arc(elx, ely, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- ROTATING WEATHERVANE (transport compass on roof peak) ----
  const vaneX =
    tower.level === 4 && tower.upgrade === "A"
      ? screenPos.x - 16 * zoom
      : tower.level === 4 && tower.upgrade === "B"
        ? screenPos.x - 16 * zoom
        : screenPos.x - 28 * zoom;
  const vaneY =
    tower.level === 4 && tower.upgrade === "A"
      ? screenPos.y - 72 * zoom
      : tower.level === 4 && tower.upgrade === "B"
        ? screenPos.y - 68 * zoom
        : screenPos.y - (38 + tower.level * 5) * zoom;
  const vaneAngle = Math.sin(time * 0.6) * 0.8 + Math.sin(time * 1.7) * 0.3;
  const vanePoleColor =
    tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#6a6a72" : "#5a4a3a";

  // Vane pole
  ctx.strokeStyle = vanePoleColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(vaneX, vaneY + 6 * zoom);
  ctx.lineTo(vaneX, vaneY);
  ctx.stroke();

  // Vane finial (ornamental ball on top)
  ctx.fillStyle = tower.level >= 4 ? "#e8c847" : "#8a8a92";
  ctx.beginPath();
  ctx.arc(vaneX, vaneY, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Vane arrow (rotates with wind)
  ctx.save();
  ctx.translate(vaneX, vaneY + 2 * zoom);
  const vaneDirX = Math.cos(vaneAngle);
  const vaneDirY = Math.sin(vaneAngle) * 0.4;
  ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#7a7a82";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-vaneDirX * 5 * zoom, -vaneDirY * 5 * zoom);
  ctx.lineTo(vaneDirX * 5 * zoom, vaneDirY * 5 * zoom);
  ctx.stroke();
  // Arrow head
  ctx.fillStyle = tower.level >= 4 ? "#c9a227" : "#7a7a82";
  ctx.beginPath();
  ctx.moveTo(vaneDirX * 5 * zoom, vaneDirY * 5 * zoom);
  ctx.lineTo(
    vaneDirX * 3 * zoom - vaneDirY * 2 * zoom,
    vaneDirY * 3 * zoom + vaneDirX * 1 * zoom,
  );
  ctx.lineTo(
    vaneDirX * 3 * zoom + vaneDirY * 2 * zoom,
    vaneDirY * 3 * zoom - vaneDirX * 1 * zoom,
  );
  ctx.closePath();
  ctx.fill();
  // Tail fin
  ctx.fillStyle = tower.level >= 4 ? "#e8c847" : "#9a9aa2";
  ctx.beginPath();
  ctx.moveTo(-vaneDirX * 5 * zoom, -vaneDirY * 5 * zoom);
  ctx.lineTo(
    -vaneDirX * 4 * zoom - vaneDirY * 3 * zoom,
    -vaneDirY * 4 * zoom + vaneDirX * 1.5 * zoom,
  );
  ctx.lineTo(
    -vaneDirX * 4 * zoom + vaneDirY * 3 * zoom,
    -vaneDirY * 4 * zoom - vaneDirX * 1.5 * zoom,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ---- ANIMATED GROUND-LEVEL CARGO TROLLEY (NW isometric axis) ----
  const trolleyTrackLen = 18 * zoom;
  const trolleyCX = screenPos.x - 12 * zoom;
  const trolleyCY = screenPos.y + 20 * zoom;
  const trolleySpeed = stationActive ? time * 0.8 : time * 0.5;
  const trolleyT = Math.sin(trolleySpeed) * 0.5 + 0.5;
  const trolleyX = trolleyCX - trolleyT * trolleyTrackLen;
  const trolleyY = trolleyCY - trolleyT * trolleyTrackLen * 0.5;

  // Trolley track (pair of thin rails along NW axis)
  ctx.strokeStyle = tower.level >= 4 ? "#a08020" : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(trolleyCX, trolleyCY);
  ctx.lineTo(trolleyCX - trolleyTrackLen, trolleyCY - trolleyTrackLen * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(trolleyCX + 2 * zoom, trolleyCY + 1 * zoom);
  ctx.lineTo(
    trolleyCX - trolleyTrackLen + 2 * zoom,
    trolleyCY - trolleyTrackLen * 0.5 + 1 * zoom,
  );
  ctx.stroke();

  // Track ties (perpendicular to NW axis = NE direction)
  ctx.strokeStyle = tower.level >= 3 ? "#4a4a52" : "#5a4a3a";
  ctx.lineWidth = 1.2 * zoom;
  for (let tt = 0; tt < 5; tt++) {
    const ttT = tt / 4;
    const ttx = trolleyCX - ttT * trolleyTrackLen;
    const tty = trolleyCY - ttT * trolleyTrackLen * 0.5;
    ctx.beginPath();
    ctx.moveTo(ttx - 1 * zoom, tty + 1 * zoom);
    ctx.lineTo(ttx + 3 * zoom, tty - 1 * zoom);
    ctx.stroke();
  }

  // Trolley body (3D isometric cart prism, rotated 90°)
  const trolleyH = 3 * zoom;
  const trolleyTop =
    tower.level >= 4 ? "#b89227" : tower.level >= 3 ? "#5a5a62" : "#6a5a4a";
  const trolleyLeft =
    tower.level >= 4 ? "#a08020" : tower.level >= 3 ? "#4a4a52" : "#5a4a3a";
  const trolleyRight =
    tower.level >= 4 ? "#8a7020" : tower.level >= 3 ? "#3a3a42" : "#4a3a2a";
  drawIsometricPrism(
    ctx,
    trolleyX,
    trolleyY + trolleyH,
    5,
    8,
    2,
    {
      top: trolleyTop,
      left: trolleyLeft,
      right: trolleyRight,
      leftBack: darkenColor(trolleyLeft, -10),
      rightBack: darkenColor(trolleyRight, -10),
    },
    zoom,
  );

  // Tiny cargo on trolley (3D isometric crate, rotated 90°)
  const cargoTop = tower.level >= 4 ? "#c9a230" : "#8b6914";
  drawIsometricPrism(
    ctx,
    trolleyX,
    trolleyY + 1 * zoom,
    1.5,
    3,
    2,
    {
      top: cargoTop,
      left: darkenColor(cargoTop, 20),
      right: darkenColor(cargoTop, 35),
    },
    zoom,
  );

  // Trolley wheels (along NW axis)
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.ellipse(
    trolleyX + 1 * zoom,
    trolleyY + trolleyH + 1.5 * zoom,
    1.2 * zoom,
    0.6 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    trolleyX - 1 * zoom,
    trolleyY + trolleyH - 0.5 * zoom,
    1.2 * zoom,
    0.6 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ---- HEAT SHIMMER ABOVE CHIMNEY ----
  const shimmerX = screenPos.x - 18 * zoom;
  const shimmerBaseY = screenPos.y - (26 + tower.level * 4) * zoom;
  const shimmerCount = stationActive ? 5 : 3;
  for (let sh = 0; sh < shimmerCount; sh++) {
    const shPhase = (time * 0.6 + sh * 0.8) % 2;
    if (shPhase < 1.5) {
      const shY = shimmerBaseY - shPhase * 12 * zoom;
      const shWobble = Math.sin(time * 4 + sh * 2.3) * 3 * zoom;
      const shAlpha = (1 - shPhase / 1.5) * (stationActive ? 0.08 : 0.04);
      const shW = (4 + shPhase * 2) * zoom;

      ctx.strokeStyle = `rgba(255, 220, 180, ${shAlpha})`;
      ctx.lineWidth = shW;
      ctx.beginPath();
      ctx.moveTo(shimmerX + shWobble - shW, shY);
      ctx.quadraticCurveTo(
        shimmerX + shWobble,
        shY - 2 * zoom,
        shimmerX + shWobble + shW,
        shY,
      );
      ctx.stroke();
    }
  }

  // ---- EMBER PARTICLES FROM CHIMNEY (during active state) ----
  if (stationActive) {
    const emberCount = isStationAttacking ? 6 : 3;
    for (let em = 0; em < emberCount; em++) {
      const emPhase = (time * 3 + em * 1.3) % 2.5;
      if (emPhase < 2) {
        const emDriftX = Math.sin(time * 5 + em * 4.1) * 5 * zoom;
        const emDriftY = Math.cos(time * 3 + em * 2.7) * 2 * zoom;
        const emY = shimmerBaseY - emPhase * 14 * zoom + emDriftY;
        const emAlpha = (1 - emPhase / 2) * 0.8;
        const emSize = (1.2 - emPhase * 0.3) * zoom;

        ctx.fillStyle = `rgba(255, ${140 + Math.floor(emPhase * 60)}, 40, ${emAlpha})`;
        ctx.shadowColor = "#ff8828";
        ctx.shadowBlur = 3 * zoom;
        ctx.beginPath();
        ctx.arc(shimmerX + emDriftX, emY, emSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
  }

  // ---- WIRE/CABLE CONNECTIONS (antenna to building) ----
  const wireStartX = antennaX;
  const wireStartY = antennaY + antennaHeight * 0.7;
  const wireEndX = screenPos.x - 4 * zoom;
  const wireEndY = screenPos.y - 18 * zoom;
  ctx.strokeStyle =
    tower.level >= 4 ? "rgba(184, 146, 39, 0.3)" : "rgba(100, 100, 110, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(wireStartX, wireStartY);
  ctx.quadraticCurveTo(
    (wireStartX + wireEndX) * 0.5,
    Math.min(wireStartY, wireEndY) - 4 * zoom,
    wireEndX,
    wireEndY,
  );
  ctx.stroke();

  // Second wire (from radar to building)
  const wire2StartX = radarBaseX;
  const wire2StartY = radarBaseY + 8 * zoom;
  const wire2EndX = screenPos.x + 4 * zoom;
  const wire2EndY = screenPos.y - 16 * zoom;
  ctx.beginPath();
  ctx.moveTo(wire2StartX, wire2StartY);
  ctx.quadraticCurveTo(
    (wire2StartX + wire2EndX) * 0.5,
    Math.min(wire2StartY, wire2EndY) - 3 * zoom,
    wire2EndX,
    wire2EndY,
  );
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// RANGE INDICATORS - Only for Library and Arch towers
// ============================================================================
export function renderStationRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  // Only show spawn range when station is hovered or selected
  if (!tower.isHovered && !tower.selected) return;

  const range = tower.spawnRange || 180;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;

  // Use orange color for spawn range
  ctx.strokeStyle = tower.isHovered
    ? "rgba(255, 180, 100, 0.4)"
    : "rgba(255, 180, 100, 0.6)";
  ctx.fillStyle = tower.isHovered
    ? "rgba(255, 180, 100, 0.08)"
    : "rgba(255, 180, 100, 0.15)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    range * zoom * 0.7,
    range * zoom * 0.35,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
}

export function renderTowerRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  const tData = TOWER_DATA[tower.type];
  if (tData.range <= 0) return;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;

  let range = tData.range;
  if (tower.level === 2) range *= 1.15;
  if (tower.level === 3) {
    if (tower.type === "library" && tower.upgrade === "B") range *= 1.5;
    else range *= 1.25;
  }
  // Level 4 uses the range from TOWER_STATS upgrade paths
  if (tower.level >= 4 && tower.upgrade) {
    const towerStats = TOWER_STATS[tower.type];
    const upgradeRange = towerStats?.upgrades?.[tower.upgrade]?.stats?.range;
    if (upgradeRange !== undefined) {
      range = upgradeRange;
    } else {
      // Fallback: 1.5x base range if no specific range defined
      range = tData.range * 1.5;
    }
  }
  // Apply external range buff (from beacons etc)
  range *= tower.rangeBoost || 1;

  // Check for range buff
  const hasRangeBuff = (tower.rangeBoost || 1) > 1;

  // Calculate range debuff from active 'blind' debuffs
  let rangeMod = 1.0;
  let hasRangeDebuff = false;
  const now = Date.now();
  if (tower.debuffs && tower.debuffs.length > 0) {
    for (const debuff of tower.debuffs) {
      if (now >= debuff.until) continue;
      if (debuff.type === "blind") {
        rangeMod *= 1 - debuff.intensity;
        hasRangeDebuff = true;
      }
    }
  }
  // Apply range debuff
  range *= rangeMod;

  // Use different colors based on buff/debuff/hover state
  if (hasRangeDebuff) {
    // Purple/violet color when range is debuffed (blinded)
    if (tower.isHovered) {
      ctx.strokeStyle = "rgba(160, 100, 200, 0.4)";
      ctx.fillStyle = "rgba(160, 100, 200, 0.08)";
    } else {
      ctx.strokeStyle = "rgba(160, 100, 200, 0.6)";
      ctx.fillStyle = "rgba(160, 100, 200, 0.15)";
    }
  } else if (hasRangeBuff) {
    // Cyan/teal color when range is buffed (from beacons etc)
    if (tower.isHovered) {
      ctx.strokeStyle = "rgba(0, 230, 200, 0.4)";
      ctx.fillStyle = "rgba(0, 230, 200, 0.08)";
    } else {
      ctx.strokeStyle = "rgba(0, 230, 200, 0.6)";
      ctx.fillStyle = "rgba(0, 230, 200, 0.15)";
    }
  } else if (tower.isHovered) {
    ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
    ctx.fillStyle = "rgba(100, 200, 255, 0.05)";
  } else {
    ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
    ctx.fillStyle = "rgba(100, 200, 255, 0.1)";
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    range * zoom * 0.7,
    range * zoom * 0.35,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();
}
// ============================================================================
// TOWER PREVIEW
// ============================================================================
export function renderTowerPreview(
  ctx: CanvasRenderingContext2D,
  dragging: DraggingTower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  towers: Tower[],
  selectedMap: string,
  gridWidth: number = 16,
  gridHeight: number = 10,
  cameraOffset?: Position,
  cameraZoom?: number,
  blockedPositions?: Set<string>,
) {
  const zoom = cameraZoom || 1;
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const offset = cameraOffset || { x: 0, y: 0 };

  const isoX = (dragging.pos.x - width / 2) / zoom - offset.x;
  const isoY = (dragging.pos.y - height / 3) / zoom - offset.y;
  const worldX = isoX + isoY * 2;
  const worldY = isoY * 2 - isoX;
  const gridPos = {
    x: Math.floor(worldX / TILE_SIZE),
    y: Math.floor(worldY / TILE_SIZE),
  };

  const worldPos = gridToWorld(gridPos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  // Check validity including blocked positions (landmarks and special towers)
  const isValid = isValidBuildPosition(
    gridPos,
    selectedMap,
    towers,
    gridWidth,
    gridHeight,
    40,
    blockedPositions,
  );

  // Base indicator
  ctx.fillStyle = isValid
    ? "rgba(100, 255, 100, 0.4)"
    : "rgba(255, 80, 80, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = isValid
    ? "rgba(50, 200, 50, 0.8)"
    : "rgba(200, 50, 50, 0.8)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = 0.75;

  const baseWidth = 34;
  const baseHeight = 28;
  const towerColors = TOWER_COLORS[dragging.type];

  const foundColors = {
    top: isValid ? darkenColor(towerColors.base, 30) : "#993333",
    left: isValid ? darkenColor(towerColors.base, 50) : "#882222",
    right: isValid ? darkenColor(towerColors.base, 40) : "#772222",
  };

  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    foundColors,
    zoom,
  );

  const bodyColors = {
    top: isValid ? lightenColor(towerColors.light, 10) : "#ff6666",
    left: isValid ? towerColors.base : "#dd4444",
    right: isValid ? towerColors.dark : "#bb3333",
  };

  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    baseHeight,
    bodyColors,
    zoom,
  );

  ctx.restore();

  // Range preview - show level 1 base range when placing
  const tData = TOWER_DATA[dragging.type];
  if (tData.range > 0) {
    ctx.strokeStyle = isValid
      ? "rgba(100, 200, 255, 0.6)"
      : "rgba(255, 100, 100, 0.6)";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      tData.range * zoom * 0.7,
      tData.range * zoom * 0.35,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (dragging.type === "station" && tData.spawnRange) {
    ctx.strokeStyle = isValid
      ? "rgba(255, 200, 100, 0.5)"
      : "rgba(255, 100, 100, 0.5)";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      tData.spawnRange * zoom * 0.7,
      tData.spawnRange * zoom * 0.35,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
