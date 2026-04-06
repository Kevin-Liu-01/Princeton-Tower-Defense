import type { Tower, Position } from "../../types";
import {
  TILE_SIZE,
  TOWER_COLORS,
  ISO_ANGLE,
  ISO_PRISM_W_FACTOR,
  ISO_PRISM_D_FACTOR,
  ISO_Y_RATIO,
} from "../../constants";
import { drawIsoFlushSlit } from "../isoFlush";
import { LEVEL_DATA, REGION_THEMES } from "../../constants/maps";
import type { MapTheme } from "../../constants/maps";
import { gridToWorld, lightenColor, darkenColor } from "../../utils";
import { setShadowBlur, clearShadow } from "../performance";
import {
  generateIsoHexVertices,
  computeHexSideNormals,
  sortSidesByDepth,
  drawHexCap,
  drawHexBand,
  scaleVerts,
  drawOrganicBlobAt,
  type IsoOffFn,
  type Pt,
} from "../helpers";

export function drawIsometricPrism(
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
  const w = width * zoom * ISO_PRISM_W_FACTOR;
  const d = depth * zoom * ISO_PRISM_D_FACTOR;
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
  ctx.lineWidth = zoom;
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
  ctx.lineWidth = zoom;
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
  ctx.lineWidth = zoom;
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
  ctx.lineWidth = zoom;
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
  ctx.lineWidth = zoom;
  ctx.stroke();
}

export function drawIsoOctPrism(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  h: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
  zoom: number,
  cornerCut: number = 0.15,
): { x: number; y: number }[] {
  const hw = w * zoom * 0.5;
  const hd = d * zoom * 0.25;
  const hh = h * zoom;
  const c = cornerCut;

  const back = { x: cx, y: cy - hd };
  const right = { x: cx + hw, y: cy };
  const front = { x: cx, y: cy + hd };
  const left = { x: cx - hw, y: cy };

  const lp = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    t: number,
  ) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  const p = [
    lp(left, back, 1 - c),
    lp(back, right, c),
    lp(back, right, 1 - c),
    lp(right, front, c),
    lp(right, front, 1 - c),
    lp(front, left, c),
    lp(front, left, 1 - c),
    lp(left, back, c),
  ];

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y - hh);
  for (let i = 1; i < 8; i++) ctx.lineTo(p[i].x, p[i].y - hh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = zoom;
  ctx.stroke();

  const side = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    color: string,
    strokeAlpha: number,
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - hh);
    ctx.lineTo(b.x, b.y - hh);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(a.x, a.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,${strokeAlpha})`;
    ctx.lineWidth = zoom;
    ctx.stroke();
  };

  side(p[6], p[7], leftColor, 0.4);
  side(p[5], p[6], leftColor, 0.35);
  side(p[4], p[5], rightColor, 0.35);
  side(p[3], p[4], rightColor, 0.3);
  side(p[2], p[3], rightColor, 0.3);

  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.beginPath();
  ctx.moveTo(p[4].x, p[4].y - hh);
  ctx.lineTo(p[5].x, p[5].y - hh);
  ctx.lineTo(p[5].x, p[5].y);
  ctx.lineTo(p[4].x, p[4].y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.beginPath();
  ctx.moveTo(p[6].x, p[6].y - hh);
  ctx.lineTo(p[7].x, p[7].y - hh);
  ctx.lineTo(p[7].x, p[7].y);
  ctx.lineTo(p[6].x, p[6].y);
  ctx.closePath();
  ctx.fill();

  return p;
}

export function drawIsoDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  h: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
  zoom: number,
) {
  const hw = w * zoom * 0.5;
  const hd = d * zoom * 0.25;
  const hh = h * zoom;

  // Top face (diamond)
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh - hd);
  ctx.lineTo(cx + hw, cy - hh);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.lineTo(cx - hw, cy - hh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = zoom;
  ctx.stroke();

  // Left face
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - hh);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = zoom;
  ctx.stroke();

  // Right face
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = zoom;
  ctx.stroke();
}

export function drawIsometricRailing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  height: number,
  segments: number,
  posts: number,
  colors: {
    rail: string;
    topRail: string;
    backPanel: string;
    frontPanel: string;
  },
  zoom: number,
  half: "back" | "front" | "both" = "both",
) {
  const drawHalf = (isBack: boolean) => {
    const arcStart = isBack ? Math.PI : 0;
    const arcEnd = isBack ? Math.PI * 2 : Math.PI;
    const sinCheck = isBack ? (v: number) => v > 0 : (v: number) => v <= 0;
    const panelFill = isBack ? colors.backPanel : colors.frontPanel;

    ctx.strokeStyle = colors.rail;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, arcStart, arcEnd);
    ctx.stroke();

    ctx.strokeStyle = colors.topRail;
    ctx.beginPath();
    ctx.ellipse(cx, cy - height, rx, ry, 0, arcStart, arcEnd);
    ctx.stroke();

    ctx.strokeStyle = colors.topRail;
    ctx.lineWidth = zoom;
    for (let bp = 0; bp < posts; bp++) {
      const pa = (bp / posts) * Math.PI * 2;
      if (sinCheck(Math.sin(pa))) continue;
      const px = cx + Math.cos(pa) * rx;
      const py = cy + Math.sin(pa) * ry;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - height);
      ctx.stroke();
    }

    ctx.fillStyle = panelFill;
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      if (sinCheck(Math.sin((a0 + a1) / 2))) continue;
      const x0 = cx + Math.cos(a0) * rx;
      const y0b = cy + Math.sin(a0) * ry;
      const x1 = cx + Math.cos(a1) * rx;
      const y1b = cy + Math.sin(a1) * ry;
      ctx.beginPath();
      ctx.moveTo(x0, y0b);
      ctx.lineTo(x1, y1b);
      ctx.lineTo(x1, y1b - height);
      ctx.lineTo(x0, y0b - height);
      ctx.closePath();
      ctx.fill();
    }
  };

  if (half === "back" || half === "both") drawHalf(true);
  if (half === "front" || half === "both") drawHalf(false);
}

export function drawIsoCylinder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  h: number,
  colors: { body: string; dark: string; light: string; top: string },
) {
  const ry = rx * ISO_Y_RATIO;

  ctx.fillStyle = colors.dark;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(cx + rx, cy - h);
  ctx.ellipse(cx, cy - h, rx, ry, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  const grad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  grad.addColorStop(0, colors.dark);
  grad.addColorStop(0.35, colors.body);
  grad.addColorStop(0.7, colors.light);
  grad.addColorStop(1, colors.light);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, cy - h);
  ctx.ellipse(cx, cy - h, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - rx, cy);
  ctx.lineTo(cx - rx, cy - h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + rx, cy);
  ctx.lineTo(cx + rx, cy - h);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.ellipse(cx, cy - h, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.stroke();
}

export function drawMerlon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  h: number,
  colors: { top: string; left: string; right: string },
  zoom: number,
  hasArrowSlit: boolean = true,
) {
  const hw = w * zoom * 0.5;
  const hd = d * zoom * ISO_PRISM_D_FACTOR;
  const hh = h * zoom;
  const outlineStyle = "rgba(0,0,0,0.4)";
  const outlineWidth = 1 * zoom;

  // Left face
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - hh);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outlineStyle;
  ctx.lineWidth = outlineWidth;
  ctx.stroke();

  // Right face
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outlineStyle;
  ctx.lineWidth = outlineWidth;
  ctx.stroke();

  // Top face
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh - hd);
  ctx.lineTo(cx + hw, cy - hh);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.lineTo(cx - hw, cy - hh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outlineStyle;
  ctx.lineWidth = outlineWidth;
  ctx.stroke();

  // Capstone slab (wider overhang)
  const capH = 1.5 * zoom;
  const capW = (w + 1.5) * zoom * 0.5;
  const capD = (d + 1.5) * zoom * ISO_PRISM_D_FACTOR;
  const capY = cy - hh - capH;
  // Capstone top
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(cx, capY - capD);
  ctx.lineTo(cx + capW, capY);
  ctx.lineTo(cx, capY + capD);
  ctx.lineTo(cx - capW, capY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outlineStyle;
  ctx.lineWidth = outlineWidth;
  ctx.stroke();
  // Capstone left face
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(cx - capW, capY);
  ctx.lineTo(cx, capY + capD);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.lineTo(cx - hw, cy - hh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outlineStyle;
  ctx.lineWidth = outlineWidth;
  ctx.stroke();
  // Capstone right face
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(cx + capW, capY);
  ctx.lineTo(cx + hw, cy - hh);
  ctx.lineTo(cx, cy - hh + hd);
  ctx.lineTo(cx, capY + capD);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outlineStyle;
  ctx.lineWidth = outlineWidth;
  ctx.stroke();

  // Arrow slit on left face
  if (hasArrowSlit) {
    const slitCx = cx - hw * 0.5;
    const slitCy = cy - hh * 0.5 + hd * 0.25;
    drawIsoFlushSlit(ctx, slitCx, slitCy, 1.2, 4.4, "left", zoom);
  }
}

// Re-exported from unified flush element system
export {
  drawIsoGothicWindow,
  drawIsoFlushSlit,
  drawIsoFlushRect,
  drawIsoFlushDoor,
  drawIsoFlushVent,
  drawIsoFlushPanel,
} from "../isoFlush";
export type { IsoFace } from "../isoFlush";

// ============================================================================
// ENHANCED MECHANICAL HELPER FUNCTIONS - Moving parts, gears, steam, etc.
// ============================================================================

export function drawGear(
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
  const or_ = outerRadius * zoom;
  const ir = innerRadius * zoom;
  const isoY = ISO_Y_RATIO;
  const toothDepth = or_ - ir;
  const toothWidth = 0.35;

  const px = (a: number, r: number) => x + Math.cos(a) * r;
  const py = (a: number, r: number) => y + Math.sin(a) * r * isoY;

  ctx.save();

  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 1.5 * zoom, y + 1.5 * zoom, or_ * 1.05, or_ * 1.05 * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer rim ring
  ctx.fillStyle = colors.outer;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, or_ * 0.98, or_ * 0.98 * isoY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Teeth as individual trapezoids
  for (let i = 0; i < teeth; i++) {
    const centerA = rotation + (i / teeth) * Math.PI * 2;
    const halfTooth = (toothWidth / teeth) * Math.PI;
    const a0 = centerA - halfTooth * 0.8;
    const a1 = centerA - halfTooth * 0.5;
    const a2 = centerA + halfTooth * 0.5;
    const a3 = centerA + halfTooth * 0.8;

    ctx.fillStyle = colors.teeth;
    ctx.beginPath();
    ctx.moveTo(px(a0, ir + toothDepth * 0.15), py(a0, ir + toothDepth * 0.15));
    ctx.lineTo(px(a1, or_), py(a1, or_));
    ctx.lineTo(px(a2, or_), py(a2, or_));
    ctx.lineTo(px(a3, ir + toothDepth * 0.15), py(a3, ir + toothDepth * 0.15));
    ctx.closePath();
    ctx.fill();

    // Tooth bevel highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(px(a1, or_), py(a1, or_));
    ctx.lineTo(px(a2, or_), py(a2, or_));
    ctx.stroke();
  }

  // Main gear body disc
  ctx.fillStyle = colors.outer;
  ctx.beginPath();
  ctx.ellipse(x, y, ir, ir * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Radial gradient shading on body
  const grad = ctx.createRadialGradient(
    x - ir * 0.2, y - ir * isoY * 0.2,
    ir * 0.1,
    x, y,
    ir,
  );
  grad.addColorStop(0, "rgba(255,255,255,0.12)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, ir, ir * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rim groove
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, ir * 0.88, ir * 0.88 * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner recessed ring
  ctx.fillStyle = colors.inner;
  ctx.beginPath();
  ctx.ellipse(x, y, ir * 0.55, ir * 0.55 * isoY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Lightwell cutouts (decorative holes between spokes)
  const spokeCount = Math.min(teeth > 8 ? 6 : 4, 6);
  for (let i = 0; i < spokeCount; i++) {
    const a = rotation + (i / spokeCount) * Math.PI * 2;
    const holeR = ir * 0.15;
    const holeDist = ir * 0.72;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(px(a, holeDist), py(a, holeDist), holeR, holeR * isoY, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spokes
  ctx.lineWidth = 1.8 * zoom;
  for (let i = 0; i < spokeCount; i++) {
    const a = rotation + (i / spokeCount) * Math.PI * 2;
    ctx.strokeStyle = colors.teeth;
    ctx.beginPath();
    ctx.moveTo(px(a, ir * 0.2), py(a, ir * 0.2));
    ctx.lineTo(px(a, ir * 0.85), py(a, ir * 0.85));
    ctx.stroke();
    // Spoke highlight
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(px(a, ir * 0.25), py(a, ir * 0.25));
    ctx.lineTo(px(a, ir * 0.8), py(a, ir * 0.8));
    ctx.stroke();
    ctx.lineWidth = 1.8 * zoom;
  }

  // Center hub (raised boss)
  ctx.fillStyle = colors.highlight;
  ctx.beginPath();
  ctx.ellipse(x, y, ir * 0.2, ir * 0.2 * isoY, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hub bevel
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - 0.3 * zoom, y - 0.3 * zoom, ir * 0.17, ir * 0.17 * isoY, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, ir * 0.2, ir * 0.2 * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Axle dot
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y, ir * 0.06, ir * 0.06 * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw animated steam/smoke effect
export function drawSteamVent(
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
export function drawConveyorBelt(
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
export function drawEnergyTube(
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
export function drawAmmoBox(
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

  const hw = width * zoom * ISO_PRISM_W_FACTOR;
  const hd = depth * zoom * ISO_PRISM_D_FACTOR;
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
export function drawWarningLight(
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
export function draw3DAmmoBox(
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
export function draw3DArmorShield(
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
export function draw3DFuelTank(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  _time: number,
  _isAttacking: boolean,
  _attackPulse: number,
  size: "small" | "medium" | "large" = "medium",
) {
  const sm = size === "small" ? 0.75 : size === "large" ? 1.2 : 1.0;
  const rX = 6 * zoom * sm;
  const rY = rX * 0.45;
  const topY = centerY - 12 * zoom * sm;
  const botY = centerY + 4 * zoom * sm;

  // Blue cylindrical body
  const bodyGrad = ctx.createLinearGradient(centerX - rX, 0, centerX + rX, 0);
  bodyGrad.addColorStop(0, "#0a1044");
  bodyGrad.addColorStop(0.15, "#152066");
  bodyGrad.addColorStop(0.35, "#2838aa");
  bodyGrad.addColorStop(0.5, "#3045cc");
  bodyGrad.addColorStop(0.7, "#2535aa");
  bodyGrad.addColorStop(0.85, "#152066");
  bodyGrad.addColorStop(1, "#0a1044");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, botY, rX, rY, 0, 0, Math.PI, false);
  ctx.lineTo(centerX - rX, topY);
  ctx.ellipse(centerX, topY, rX, rY, 0, Math.PI, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();

  // Bottom cap edge
  ctx.strokeStyle = "#080844";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(centerX, botY, rX, rY, 0, 0, Math.PI, false);
  ctx.stroke();

  // Specular highlight
  ctx.strokeStyle = "rgba(100, 150, 255, 0.35)";
  ctx.lineWidth = 1.4 * zoom * sm;
  ctx.beginPath();
  ctx.moveTo(centerX - rX * 0.6, botY - 2 * zoom);
  ctx.lineTo(centerX - rX * 0.6, topY + 3 * zoom);
  ctx.stroke();

  // Yellow hazard stripes wrapping around cylinder
  ctx.lineWidth = 2 * zoom * sm;
  for (let i = 0; i < 2; i++) {
    const stripeY = topY + 4 * zoom * sm + i * 5 * zoom * sm;
    ctx.strokeStyle = "#ffcc00";
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      stripeY,
      rX * 0.98,
      rY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Black hazard stripe between yellow
  ctx.lineWidth = 1.2 * zoom * sm;
  const blackStripeY = topY + 6.5 * zoom * sm;
  ctx.strokeStyle = "#222";
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    blackStripeY,
    rX * 0.98,
    rY * 0.98,
    0,
    -0.1,
    Math.PI + 0.1,
    false,
  );
  ctx.stroke();

  // Gray top cap
  const capGrad = ctx.createRadialGradient(
    centerX - 1 * zoom,
    topY,
    0,
    centerX,
    topY,
    rX,
  );
  capGrad.addColorStop(0, "#5a5a62");
  capGrad.addColorStop(0.4, "#4a4a52");
  capGrad.addColorStop(0.8, "#3a3a42");
  capGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, topY, rX, rY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Cap valve
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    topY,
    2.5 * zoom * sm,
    1.2 * zoom * sm,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#7a7a82";
  ctx.beginPath();
  ctx.arc(centerX, topY - 0.5 * zoom, 1.2 * zoom * sm, 0, Math.PI * 2);
  ctx.fill();
}

// Draw fuel feeding tube connecting tank to flamethrower turret
export function drawFuelFeedingTube(
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
export function drawCannonAmmoBelt(
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

  // === BELT TRACK — layered 3D groove ===
  ctx.lineCap = "round";

  // Drop shadow underneath belt
  ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = 9 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY + 1.5 * zoom);
  ctx.quadraticCurveTo(beltMidX, beltMidY + 1.5 * zoom, beltEntryX, beltEntryY + 1.5 * zoom);
  ctx.stroke();

  // Outer channel (dark steel rim)
  ctx.strokeStyle = "#22222a";
  ctx.lineWidth = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();

  // Inner channel body
  ctx.strokeStyle = "#35353e";
  ctx.lineWidth = 6 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();

  // Channel floor (recessed center)
  ctx.strokeStyle = "#2a2a33";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();

  // Top edge highlight (catches light)
  ctx.strokeStyle = "rgba(120, 120, 135, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY - 3.5 * zoom);
  ctx.quadraticCurveTo(beltMidX, beltMidY - 3.5 * zoom, beltEntryX, beltEntryY - 3.5 * zoom);
  ctx.stroke();

  // Bottom edge dark bevel
  ctx.strokeStyle = "rgba(10, 10, 15, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY + 3.5 * zoom);
  ctx.quadraticCurveTo(beltMidX, beltMidY + 3.5 * zoom, beltEntryX, beltEntryY + 3.5 * zoom);
  ctx.stroke();

  // === CARTRIDGES & LINK PLATES ===
  const beltBulletCount = 14;
  const speed = isAttacking ? time * 6 : time * 1.5;

  const evalBezier = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * beltExitX + 2 * u * t * beltMidX + t * t * beltEntryX,
      y: u * u * beltExitY + 2 * u * t * beltMidY + t * t * beltEntryY,
    };
  };
  const evalTangent = (t: number) => {
    const u = 1 - t;
    return {
      x: 2 * u * (beltMidX - beltExitX) + 2 * t * (beltEntryX - beltMidX),
      y: 2 * u * (beltMidY - beltExitY) + 2 * t * (beltEntryY - beltMidY),
    };
  };

  for (let i = 0; i < beltBulletCount; i++) {
    const beltProgress = (i / beltBulletCount + speed) % 1;

    const pos = evalBezier(beltProgress);
    const tan = evalTangent(beltProgress);
    const bulletAngle = Math.atan2(tan.y, tan.x);
    const cosA = Math.cos(bulletAngle);
    const sinA = Math.sin(bulletAngle);
    const perpCos = Math.cos(bulletAngle + Math.PI * 0.5);
    const perpSin = Math.sin(bulletAngle + Math.PI * 0.5);

    const shakeIntensity = isAttacking ? attackPulse * 0.3 : 0;
    const shakeX = Math.sin(time * 70 + i * 1.3) * 1 * zoom * shakeIntensity;
    const shakeY = Math.cos(time * 55 + i * 1.7) * 0.7 * zoom * shakeIntensity;
    const fx = pos.x + shakeX;
    const fy = pos.y + shakeY;

    // Position-based lighting: bullets near top of arc are brighter
    const arcLight = 0.7 + 0.3 * (1 - Math.abs(beltProgress - 0.5) * 2);

    // --- Link plate (rectangular metal connector between rounds) ---
    const linkW = 3.2 * zoom;
    const linkH = 1.6 * zoom;
    const linkLit = Math.floor(75 * arcLight);
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(bulletAngle);

    ctx.fillStyle = `rgb(${linkLit + 10}, ${linkLit + 10}, ${linkLit + 18})`;
    ctx.fillRect(-linkW, -linkH, linkW * 2, linkH * 2);

    // Link plate edge highlight
    ctx.strokeStyle = `rgba(140, 140, 155, ${0.25 * arcLight})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(-linkW, -linkH, linkW * 2, linkH * 2);

    // Rivet holes on link plate
    const rivetR = 0.6 * zoom;
    ctx.fillStyle = `rgba(40, 40, 48, ${0.7 * arcLight})`;
    ctx.beginPath();
    ctx.arc(-linkW * 0.6, 0, rivetR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(linkW * 0.6, 0, rivetR, 0, Math.PI * 2);
    ctx.fill();
    // Rivet cap highlights
    ctx.fillStyle = `rgba(110, 110, 125, ${0.5 * arcLight})`;
    ctx.beginPath();
    ctx.arc(-linkW * 0.6, -0.3 * zoom, rivetR * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(linkW * 0.6, -0.3 * zoom, rivetR * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // --- Cartridge casing ---
    const casingLen = 4.2 * zoom;
    const casingW = 2.4 * zoom;

    // Casing body with metallic gradient along its length
    const casingGrad = ctx.createLinearGradient(
      fx - perpCos * casingLen * 0.5,
      fy - perpSin * casingLen * 0.5,
      fx + perpCos * casingLen * 0.5,
      fy + perpSin * casingLen * 0.5,
    );
    const brassBase = arcLight;
    casingGrad.addColorStop(0, `rgba(${Math.floor(200 * brassBase)}, ${Math.floor(170 * brassBase)}, ${Math.floor(50 * brassBase)}, 1)`);
    casingGrad.addColorStop(0.2, `rgba(${Math.floor(230 * brassBase)}, ${Math.floor(197 * brassBase)}, ${Math.floor(74 * brassBase)}, 1)`);
    casingGrad.addColorStop(0.45, `rgba(${Math.floor(240 * brassBase)}, ${Math.floor(210 * brassBase)}, ${Math.floor(95 * brassBase)}, 1)`);
    casingGrad.addColorStop(0.55, `rgba(${Math.floor(218 * brassBase)}, ${Math.floor(165 * brassBase)}, ${Math.floor(32 * brassBase)}, 1)`);
    casingGrad.addColorStop(0.8, `rgba(${Math.floor(184 * brassBase)}, ${Math.floor(134 * brassBase)}, ${Math.floor(11 * brassBase)}, 1)`);
    casingGrad.addColorStop(1, `rgba(${Math.floor(150 * brassBase)}, ${Math.floor(110 * brassBase)}, ${Math.floor(20 * brassBase)}, 1)`);

    ctx.fillStyle = casingGrad;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(bulletAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.roundRect(-casingW, -casingLen * 0.45, casingW * 2, casingLen, 0.6 * zoom);
    ctx.fill();
    ctx.restore();

    // Casing rim (raised ring at base)
    const rimDist = -casingLen * 0.48;
    const rimX = fx + perpCos * rimDist;
    const rimY = fy + perpSin * rimDist;
    ctx.fillStyle = `rgba(${Math.floor(195 * arcLight)}, ${Math.floor(155 * arcLight)}, ${Math.floor(35 * arcLight)}, 1)`;
    ctx.beginPath();
    ctx.ellipse(rimX, rimY, casingW + 0.6 * zoom, 1.2 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Rim highlight
    ctx.strokeStyle = `rgba(255, 230, 140, ${0.3 * arcLight})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.ellipse(rimX, rimY, casingW + 0.6 * zoom, 1.2 * zoom, bulletAngle + Math.PI * 0.5, Math.PI * 0.9, Math.PI * 1.6);
    ctx.stroke();

    // Primer circle (small dot on cartridge base)
    ctx.fillStyle = `rgba(${Math.floor(120 * arcLight)}, ${Math.floor(90 * arcLight)}, ${Math.floor(50 * arcLight)}, 1)`;
    ctx.beginPath();
    ctx.arc(rimX, rimY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Casing neck (tapered section near bullet)
    const neckDist = casingLen * 0.3;
    const neckX = fx + perpCos * neckDist;
    const neckY = fy + perpSin * neckDist;
    ctx.fillStyle = `rgba(${Math.floor(210 * arcLight)}, ${Math.floor(175 * arcLight)}, ${Math.floor(55 * arcLight)}, 1)`;
    ctx.beginPath();
    ctx.ellipse(neckX, neckY, casingW * 0.7, 1 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight streak along casing
    ctx.strokeStyle = `rgba(255, 245, 200, ${0.18 * arcLight})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      fx + cosA * casingW * 0.4 + perpCos * (-casingLen * 0.3),
      fy + sinA * casingW * 0.4 + perpSin * (-casingLen * 0.3),
    );
    ctx.lineTo(
      fx + cosA * casingW * 0.4 + perpCos * (casingLen * 0.2),
      fy + sinA * casingW * 0.4 + perpSin * (casingLen * 0.2),
    );
    ctx.stroke();

    // --- Bullet ogive tip ---
    const tipDist = casingLen * 0.55;
    const tipX = fx + perpCos * tipDist;
    const tipY = fy + perpSin * tipDist;
    const tipLen = 2.2 * zoom;
    const tipW = casingW * 0.65;

    // Copper jacket gradient
    const tipGrad = ctx.createLinearGradient(
      tipX - cosA * tipW,
      tipY - sinA * tipW,
      tipX + cosA * tipW,
      tipY + sinA * tipW,
    );
    const copperLit = arcLight;
    tipGrad.addColorStop(0, `rgba(${Math.floor(120 * copperLit)}, ${Math.floor(65 * copperLit)}, ${Math.floor(25 * copperLit)}, 1)`);
    tipGrad.addColorStop(0.3, `rgba(${Math.floor(165 * copperLit)}, ${Math.floor(95 * copperLit)}, ${Math.floor(40 * copperLit)}, 1)`);
    tipGrad.addColorStop(0.6, `rgba(${Math.floor(180 * copperLit)}, ${Math.floor(110 * copperLit)}, ${Math.floor(50 * copperLit)}, 1)`);
    tipGrad.addColorStop(1, `rgba(${Math.floor(110 * copperLit)}, ${Math.floor(55 * copperLit)}, ${Math.floor(20 * copperLit)}, 1)`);

    ctx.fillStyle = tipGrad;
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(bulletAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-tipW, -tipLen * 0.3);
    ctx.quadraticCurveTo(-tipW * 0.3, tipLen, 0, tipLen * 1.2);
    ctx.quadraticCurveTo(tipW * 0.3, tipLen, tipW, -tipLen * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tip specular dot
    const specX = tipX + perpCos * tipLen * 0.4 + cosA * tipW * 0.2;
    const specY = tipY + perpSin * tipLen * 0.4 + sinA * tipW * 0.2;
    ctx.fillStyle = `rgba(255, 220, 180, ${0.25 * arcLight})`;
    ctx.beginPath();
    ctx.arc(specX, specY, 0.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // --- Link connector tab to next round ---
    if (i < beltBulletCount - 1) {
      const nextProgress = ((i + 1) / beltBulletCount + speed) % 1;
      const nextPos = evalBezier(nextProgress);
      const midLinkX = (fx + nextPos.x) * 0.5;
      const midLinkY = (fy + nextPos.y) * 0.5;
      ctx.strokeStyle = `rgba(${Math.floor(80 * arcLight)}, ${Math.floor(80 * arcLight)}, ${Math.floor(90 * arcLight)}, 0.5)`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx + cosA * linkW, fy + sinA * linkW);
      ctx.lineTo(midLinkX, midLinkY);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${Math.floor(80 * arcLight)}, ${Math.floor(80 * arcLight)}, ${Math.floor(90 * arcLight)}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(fx - cosA * linkW, fy - sinA * linkW);
      ctx.lineTo(midLinkX, midLinkY);
      ctx.stroke();
    }
  }
}

// ============================================================================
// TOWER PASSIVE EFFECTS HELPER
// ============================================================================
export function drawTowerPassiveEffects(
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
export function hexToRgb(hex: string): string {
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
// REGIONAL GROUND TRANSITION — dug-in construction base under towers
// ============================================================================

export const GROUND_TRANSITION_PALETTES: Record<
  MapTheme,
  {
    outerDirt: string;
    innerDirt: string;
    packedEarth: string;
    rubbleLight: string;
    rubbleDark: string;
    edgeDetail: string;
    accentGlow: string;
    accentAlpha: number;
  }
> = {
  grassland: {
    outerDirt: "#4a3a20",
    innerDirt: "#3a2a15",
    packedEarth: "#2a1e10",
    rubbleLight: "#6a5a3a",
    rubbleDark: "#3a2a18",
    edgeDetail: "#5a7a4a",
    accentGlow: "rgba(80, 130, 60, 0.15)",
    accentAlpha: 0.12,
  },
  desert: {
    outerDirt: "#9a8050",
    innerDirt: "#7a6540",
    packedEarth: "#5a4830",
    rubbleLight: "#c4a45a",
    rubbleDark: "#6a5030",
    edgeDetail: "#b8a060",
    accentGlow: "rgba(200, 170, 80, 0.12)",
    accentAlpha: 0.1,
  },
  winter: {
    outerDirt: "#5a6a7a",
    innerDirt: "#3a4a5a",
    packedEarth: "#2a3544",
    rubbleLight: "#8899aa",
    rubbleDark: "#3a4a5a",
    edgeDetail: "#c8d8e8",
    accentGlow: "rgba(150, 190, 220, 0.15)",
    accentAlpha: 0.15,
  },
  volcanic: {
    outerDirt: "#3a2020",
    innerDirt: "#2a1515",
    packedEarth: "#1a0a0a",
    rubbleLight: "#5a3a3a",
    rubbleDark: "#2a1010",
    edgeDetail: "#ff4400",
    accentGlow: "rgba(255, 68, 0, 0.12)",
    accentAlpha: 0.1,
  },
  swamp: {
    outerDirt: "#2a3a20",
    innerDirt: "#1a2a15",
    packedEarth: "#101a0a",
    rubbleLight: "#4a5a3a",
    rubbleDark: "#1a2a12",
    edgeDetail: "#3a6a3a",
    accentGlow: "rgba(60, 120, 60, 0.15)",
    accentAlpha: 0.12,
  },
};

export function getTowerYShift(tower: Tower): number {
  switch (tower.type) {
    case "cannon":
    case "library":
    case "lab":
    case "club":
      return 8 + tower.level * 2;
    case "station":
      return 8 + tower.level * 2;
    case "arch":
      return 5;
    default:
      return 0;
  }
}

export function getTowerFoundationSize(tower: Tower): { w: number; d: number } {
  const level = tower.level;
  switch (tower.type) {
    case "cannon": {
      const base = 36 + level * 5;
      const fndScale = level * 4;
      return { w: base + 24 + fndScale, d: base + 24 + fndScale };
    }
    case "library": {
      const base = 34 + level * 5;
      const fndGrow = level * 5;
      return { w: base + 26 + fndGrow, d: base + 26 + fndGrow };
    }
    case "lab": {
      const base = 30 + level * 4;
      const fndGrow = level * 4;
      return { w: base + 22 + fndGrow, d: base + 22 + fndGrow };
    }
    case "arch": {
      const baseW = 38 + level * 5;
      const baseD = 30 + level * 4;
      return { w: baseW + 52, d: baseD + 60 };
    }
    case "club": {
      const base = 34 + level * 5;
      return { w: base + 38, d: base + 38 };
    }
    case "station": {
      const baseW = 56 + level * 6;
      const baseD = 44 + level * 5;
      return { w: baseW + 47, d: baseD + 59 };
    }
    case "mortar": {
      const mBase = 38 + level * 5;
      return { w: mBase + 24, d: mBase + 22 };
    }
    default:
      return { w: 60, d: 60 };
  }
}

/**
 * Returns vertical metrics for centering the upgrade circle on a tower.
 * - centerOffsetY: how far above screenPos.y the visual center is (pre-zoom px)
 * - visualHeight: total visual height of the tower (pre-zoom px), used for radius
 */
export function getTowerVisualMetrics(tower: Tower): {
  centerOffsetY: number;
  visualHeight: number;
} {
  const level = tower.level;
  switch (tower.type) {
    case "cannon": {
      const h = 24 + level * 8;
      return { centerOffsetY: 10 + h * 0.38, visualHeight: h + 40 };
    }
    case "library": {
      const body = 28 + level * 8;
      const spire = 24 + level * 5;
      const total = body + spire * 0.7 + 40;
      return { centerOffsetY: total * 0.38, visualHeight: total };
    }
    case "lab": {
      const body = 23 + level * 7;
      const coil = level === 4 ? 52 : 30 + level * 6;
      const total = body + coil * 0.7 + 38;
      return { centerOffsetY: total * 0.38, visualHeight: total };
    }
    case "arch": {
      const pillarH = 22 + level * 5;
      return { centerOffsetY: 20 + pillarH * 0.45, visualHeight: pillarH + 80 };
    }
    case "club": {
      const h = 23 + level * 7;
      return { centerOffsetY: 18 + h * 0.38, visualHeight: h + 14 };
    }
    case "station": {
      const totalH = 30 + level * 6;
      return { centerOffsetY: 6 + totalH * 0.32, visualHeight: totalH + 50 };
    }
    case "mortar": {
      const depotH = (22 + level * 10) * 0.42;
      return { centerOffsetY: depotH * 0.5 + 8, visualHeight: depotH + 28 };
    }
    default:
      return { centerOffsetY: 20, visualHeight: 60 };
  }
}

export function drawGroundTransition(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  selectedMap: string,
) {
  const levelData = LEVEL_DATA[selectedMap];
  const mapTheme: MapTheme = (levelData?.theme as MapTheme) || "grassland";
  const palette = GROUND_TRANSITION_PALETTES[mapTheme];
  const regionTheme = REGION_THEMES[mapTheme];

  const foundation = getTowerFoundationSize(tower);
  const fndW = foundation.w * zoom * ISO_PRISM_W_FACTOR;
  const fndH = foundation.d * zoom * ISO_PRISM_D_FACTOR;
  const yShift = getTowerYShift(tower);

  const cx = screenPos.x;
  const cy = screenPos.y - yShift * zoom + 10 * zoom;
  const outerW = fndW * 1.05;
  const outerH = fndH * 1.05;
  const midW = fndW * 0.85;
  const midH = fndH * 0.85;
  const innerW = fndW * 0.65;
  const innerH = fndH * 0.65;
  // Scale element counts proportionally (reference: 60-unit foundation)
  const detailScale = Math.max(
    0.6,
    Math.min(1.6, ((foundation.w + foundation.d) * 0.5) / 60),
  );

  // Stable seed per tower for organic terrain shape
  const blobSeed =
    selectedMap.charCodeAt(0) + tower.pos.x * 73 + tower.pos.y * 137;

  ctx.save();

  // === Outer excavation ring — disturbed terrain ===
  const outerGrad = ctx.createRadialGradient(
    cx,
    cy,
    midW * 0.6,
    cx,
    cy,
    outerW,
  );
  outerGrad.addColorStop(0, "rgba(0,0,0,0)");
  outerGrad.addColorStop(0.5, palette.outerDirt);
  outerGrad.addColorStop(1, regionTheme.ground[1]);
  ctx.fillStyle = outerGrad;
  drawOrganicBlobAt(ctx, cx, cy, outerW, outerH, blobSeed, 0.15);
  ctx.fill();

  const clumpSeed = blobSeed;

  // === Middle ring — exposed subsoil ===
  const midGrad = ctx.createRadialGradient(cx, cy, innerW * 0.5, cx, cy, midW);
  midGrad.addColorStop(0, palette.innerDirt);
  midGrad.addColorStop(1, palette.outerDirt);
  ctx.fillStyle = midGrad;
  drawOrganicBlobAt(ctx, cx, cy, midW, midH, blobSeed + 17.3, 0.12);
  ctx.fill();

  // Excavation score marks — concentric arcs showing dig patterns
  ctx.strokeStyle = `rgba(0,0,0,0.12)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let ring = 0; ring < 3; ring++) {
    const ringR = midW * (0.6 + ring * 0.15);
    const ringH = midH * (0.6 + ring * 0.15);
    const startAngle = ((clumpSeed + ring * 5) % 6) * 0.5;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      ringR,
      ringH,
      0,
      startAngle,
      startAngle + Math.PI * 0.6,
    );
    ctx.stroke();
  }

  // === Inner packed earth — construction base ===
  const innerGrad = ctx.createRadialGradient(
    cx - innerW * 0.1,
    cy - innerH * 0.1,
    0,
    cx,
    cy,
    innerW * 0.9,
  );
  innerGrad.addColorStop(0, palette.packedEarth);
  innerGrad.addColorStop(0.7, palette.innerDirt);
  innerGrad.addColorStop(1, palette.outerDirt);
  ctx.fillStyle = innerGrad;
  drawOrganicBlobAt(ctx, cx, cy, innerW, innerH, blobSeed + 41.7, 0.1);
  ctx.fill();

  // === Rubble and debris ring (between middle and inner) ===
  const numRubble = Math.floor(16 * detailScale);
  for (let i = 0; i < numRubble; i++) {
    const angle = (i / numRubble) * Math.PI * 2 + (clumpSeed % 5) * 0.4;
    const dist = midW * (0.65 + ((clumpSeed * (i + 2) * 13) % 19) / 60);
    const rx = cx + Math.cos(angle) * dist;
    const ry = cy + Math.sin(angle) * dist * (midH / midW);
    const rSize = (0.8 + ((clumpSeed * (i + 7)) % 13) / 10) * zoom;
    ctx.fillStyle = i % 2 === 0 ? palette.rubbleLight : palette.rubbleDark;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rSize, rSize * 0.6, angle * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Rubble highlight
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.ellipse(
      rx - 0.2 * zoom,
      ry - 0.2 * zoom,
      rSize * 0.4,
      rSize * 0.3,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === Region-specific details ===
  if (mapTheme === "grassland") {
    // Exposed root fragments
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 0.7 * zoom;
    for (let i = 0; i < 3; i++) {
      const rAngle = ((clumpSeed + i * 4) % 12) * (Math.PI / 6);
      const rd = midW * 0.7;
      const rsx = cx + Math.cos(rAngle) * rd * 0.5;
      const rsy = cy + Math.sin(rAngle) * rd * 0.5 * (midH / midW);
      ctx.beginPath();
      ctx.moveTo(rsx, rsy);
      ctx.quadraticCurveTo(
        rsx + Math.cos(rAngle + 0.5) * 3 * zoom,
        rsy + Math.sin(rAngle + 0.5) * 2 * zoom,
        rsx + Math.cos(rAngle) * 5 * zoom,
        rsy + Math.sin(rAngle) * 3 * zoom * (midH / midW),
      );
      ctx.stroke();
    }
  } else if (mapTheme === "desert") {
    // Exposed sandstone chunks
    ctx.fillStyle = "#b8943a";
    for (let i = 0; i < 4; i++) {
      const angle = ((clumpSeed + i * 3) % 8) * (Math.PI / 4);
      const dist = midW * 0.75;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * (midH / midW);
      ctx.beginPath();
      ctx.moveTo(sx, sy - 1 * zoom);
      ctx.lineTo(sx + 1.5 * zoom, sy);
      ctx.lineTo(sx + 0.5 * zoom, sy + 1 * zoom);
      ctx.lineTo(sx - 1 * zoom, sy + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  } else if (mapTheme === "winter") {
    // Ice patches on exposed ground
    ctx.fillStyle = "rgba(160, 200, 240, 0.2)";
    for (let i = 0; i < 3; i++) {
      const angle = ((clumpSeed + i * 5) % 6) * (Math.PI / 3);
      const dist = midW * 0.5;
      const ix = cx + Math.cos(angle) * dist;
      const iy = cy + Math.sin(angle) * dist * (midH / midW);
      ctx.beginPath();
      ctx.ellipse(ix, iy, 2.5 * zoom, 1.2 * zoom, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapTheme === "volcanic") {
    // Lava cracks radiating from excavation
    const lavaGlow = 0.3 + Math.sin(time * 2) * 0.1;
    ctx.strokeStyle = `rgba(255, 68, 0, ${lavaGlow})`;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 3 * zoom;
    ctx.lineWidth = 0.8 * zoom;
    const numCracks = Math.floor(5 * detailScale);
    for (let i = 0; i < numCracks; i++) {
      const angle = (i / numCracks) * Math.PI * 2 + (clumpSeed % 3) * 0.6;
      const startD = innerW * 0.8;
      const endD = midW * 0.95;
      const sx = cx + Math.cos(angle) * startD;
      const sy = cy + Math.sin(angle) * startD * (innerH / innerW);
      const ex = cx + Math.cos(angle + 0.15) * endD;
      const ey = cy + Math.sin(angle + 0.15) * endD * (midH / midW);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        (sx + ex) / 2 + Math.cos(angle + 0.8) * 2 * zoom,
        (sy + ey) / 2 + Math.sin(angle + 0.8) * 1.5 * zoom,
        ex,
        ey,
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // Ash dust particles
    ctx.fillStyle = "rgba(80, 60, 60, 0.35)";
    const numAsh = Math.floor(8 * detailScale);
    for (let i = 0; i < numAsh; i++) {
      const angle = (i / numAsh) * Math.PI * 2;
      const dist = outerW * (0.7 + ((clumpSeed * (i + 4)) % 11) / 35);
      const ax = cx + Math.cos(angle) * dist;
      const ay = cy + Math.sin(angle) * dist * (outerH / outerW);
      ctx.beginPath();
      ctx.arc(ax, ay, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapTheme === "swamp") {
    // Muddy water puddles in excavation
    const numPuddles = Math.floor(4 * detailScale);
    for (let i = 0; i < numPuddles; i++) {
      const angle = (i / numPuddles) * Math.PI * 2 + 0.8;
      const dist = midW * (0.5 + ((clumpSeed * (i + 1)) % 7) / 20);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist * (midH / midW);
      const pudGrad = ctx.createRadialGradient(px, py, 0, px, py, 2.5 * zoom);
      pudGrad.addColorStop(0, "rgba(40, 60, 35, 0.5)");
      pudGrad.addColorStop(0.6, "rgba(30, 50, 25, 0.3)");
      pudGrad.addColorStop(1, "rgba(20, 40, 15, 0)");
      ctx.fillStyle = pudGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, 3 * zoom, 1.5 * zoom, angle * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Water surface highlight
      ctx.fillStyle = "rgba(100, 150, 100, 0.15)";
      ctx.beginPath();
      ctx.ellipse(
        px - 0.5 * zoom,
        py - 0.3 * zoom,
        1.5 * zoom,
        0.6 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Moss tendrils creeping toward tower
    ctx.strokeStyle = "#3a6a2a";
    ctx.lineWidth = 0.7 * zoom;
    const numMoss = Math.floor(5 * detailScale);
    for (let i = 0; i < numMoss; i++) {
      const angle = (i / numMoss) * Math.PI * 2 + 0.4;
      const startD = outerW * 0.85;
      const endD = midW * 0.6;
      const mx = cx + Math.cos(angle) * startD;
      const my = cy + Math.sin(angle) * startD * (outerH / outerW);
      const ex = cx + Math.cos(angle + 0.1) * endD;
      const ey = cy + Math.sin(angle + 0.1) * endD * (midH / midW);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(
        (mx + ex) / 2 + Math.cos(angle + 1) * 1.5 * zoom,
        (my + ey) / 2,
        ex,
        ey,
      );
      ctx.stroke();
    }
  }

  // === Accent glow ring — subtle regional color at excavation border ===
  ctx.strokeStyle = palette.accentGlow;
  ctx.lineWidth = 1.5 * zoom;
  drawOrganicBlobAt(
    ctx,
    cx,
    cy,
    midW * 1.02,
    midH * 1.02,
    blobSeed + 17.3,
    0.12,
  );
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// ISOMETRIC SANDBAG — reusable 3-face bag with stitching & shading
// ============================================================================

/**
 * Draw a single isometric sandbag at (bx, by) — the front-bottom vertex.
 *
 *  @param bagW  – bag width along the left-face axis (px, pre-zoom)
 *  @param bagD  – bag depth along the right-face axis (px, pre-zoom)
 *  @param bagH  – bag height (px, pre-zoom)
 *  @param shade – 0-1 variation seed for per-bag colour diversity
 */
export function drawIsoSandbag(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bagW: number,
  bagD: number,
  bagH: number,
  zoom: number,
  shade: number = 0,
) {
  const w = bagW * zoom;
  const d = bagD * zoom;
  const h = bagH * zoom;

  const mix = 0.85 + shade * 0.15;
  const lR = Math.floor(105 * mix);
  const lG = Math.floor(93 * mix);
  const lB = Math.floor(72 * mix);
  const rR = Math.floor(120 * mix);
  const rG = Math.floor(108 * mix);
  const rB = Math.floor(84 * mix);
  const tR = Math.floor(140 * mix);
  const tG = Math.floor(128 * mix);
  const tB = Math.floor(100 * mix);

  const wDx = -w * 0.5;
  const wDy = -w * ISO_Y_RATIO * 0.5;
  const dDx = d * 0.5;
  const dDy = -d * ISO_Y_RATIO * 0.5;

  // Left face
  ctx.fillStyle = `rgb(${lR},${lG},${lB})`;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + wDx, by + wDy);
  ctx.lineTo(bx + wDx, by + wDy - h);
  ctx.lineTo(bx, by - h);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = `rgb(${rR},${rG},${rB})`;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + dDx, by + dDy);
  ctx.lineTo(bx + dDx, by + dDy - h);
  ctx.lineTo(bx, by - h);
  ctx.closePath();
  ctx.fill();

  // Top face (puffy highlight)
  ctx.fillStyle = `rgb(${tR},${tG},${tB})`;
  ctx.beginPath();
  ctx.moveTo(bx, by - h);
  ctx.lineTo(bx + wDx, by + wDy - h);
  ctx.lineTo(bx + wDx + dDx, by + wDy + dDy - h);
  ctx.lineTo(bx + dDx, by + dDy - h);
  ctx.closePath();
  ctx.fill();

  // Burlap stitching across top face
  ctx.strokeStyle = "rgba(55,42,25,0.3)";
  ctx.lineWidth = Math.max(0.5, 0.6 * zoom);
  ctx.beginPath();
  ctx.moveTo(bx + wDx * 0.5, by + wDy * 0.5 - h);
  ctx.lineTo(bx + wDx * 0.5 + dDx, by + wDy * 0.5 + dDy - h);
  ctx.stroke();

  // Edge outlines for definition
  ctx.strokeStyle = "rgba(40,30,18,0.22)";
  ctx.lineWidth = Math.max(0.4, 0.5 * zoom);

  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + wDx, by + wDy);
  ctx.lineTo(bx + wDx, by + wDy - h);
  ctx.lineTo(bx, by - h);
  ctx.lineTo(bx + dDx, by + dDy - h);
  ctx.lineTo(bx + dDx, by + dDy);
  ctx.closePath();
  ctx.stroke();
}

// ============================================================================
// MORTAR TOWER - Barrel-dominant artillery emplacement
// Foundation = fortified hex-prism ammunition depot
// ============================================================================
