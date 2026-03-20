import { ISO_Y_RATIO } from "../../constants";
import type { Position } from "../../types";

function parseRgb(rgb: string): [number, number, number] {
  const parts = rgb.split(",").map((s) => parseInt(s.trim(), 10));
  return [parts[0] || 255, parts[1] || 110, parts[2] || 96];
}

function tint(c: number, amount: number): number {
  return Math.min(255, Math.round(c + (255 - c) * amount));
}

function shade(c: number, amount: number): number {
  return Math.round(c * amount);
}

// ============================================================================
// SENTINEL IMPACT — orbital bombardment crater with shockwave rings,
// debris shards, ground scorch, and radial energy discharge
// ============================================================================

export function renderSentinelImpact(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  zoom: number,
  progress: number,
  alpha: number,
  size: number,
  hotRgb?: string,
): void {
  const [hr, hg, hb] = parseRgb(hotRgb || "255, 110, 96");
  const impactRadius = Math.max(24, size * zoom * progress);
  const coreRadius = Math.max(5, impactRadius * 0.18);
  const t = Date.now() / 1000;

  // Derived palette from hot color
  const shockOuter = `${tint(hr, 0.5)}, ${tint(hg, 0.5)}, ${tint(hb, 0.5)}`;
  const midTone = `${hr}, ${hg}, ${hb}`;
  const deepTone = `${shade(hr, 0.78)}, ${shade(hg, 0.44)}, ${shade(hb, 0.52)}`;
  const darkTone = `${shade(hr, 0.53)}, ${shade(hg, 0.17)}, ${shade(hb, 0.41)}`;
  const scorchDark = `${shade(hr, 0.16)}, ${shade(hg, 0.09)}, ${shade(hb, 0.11)}`;
  const scorchMid = `${shade(hr, 0.24)}, ${shade(hg, 0.13)}, ${shade(hb, 0.15)}`;
  const rayOuter = `${tint(hr, 0.35)}, ${tint(hg, 0.15)}, ${tint(hb, 0.25)}`;
  const rayCore = `${tint(hr, 0.75)}, ${tint(hg, 0.7)}, ${tint(hb, 0.72)}`;
  const shardColor = `${shade(hr, 0.7)}, ${shade(hg, 0.8)}, ${shade(hb, 0.75)}`;
  const flashMid = `${tint(hr, 0.6)}, ${tint(hg, 0.55)}, ${tint(hb, 0.57)}`;
  const flashEdge = `${hr}, ${shade(hg, 0.9)}, ${shade(hb, 0.9)}`;
  const brightTint = `${tint(hr, 0.8)}, ${tint(hg, 0.75)}, ${tint(hb, 0.78)}`;

  ctx.save();

  // Expanding shockwave rings (isometric)
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.scale(1, ISO_Y_RATIO);

  // Outer shockwave — fast expanding ring
  const shockR1 = impactRadius * (0.6 + progress * 0.8);
  const shockAlpha1 = alpha * Math.max(0, 1 - progress * 1.5) * 0.6;
  ctx.strokeStyle = `rgba(${shockOuter}, ${shockAlpha1})`;
  ctx.lineWidth = (3.5 - progress * 2) * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, shockR1, 0, Math.PI * 2);
  ctx.stroke();

  // Second shockwave ring (delayed)
  const p2 = Math.max(0, progress - 0.15);
  if (p2 > 0) {
    const shockR2 = impactRadius * (0.4 + p2 * 0.7);
    const shockAlpha2 = alpha * Math.max(0, 1 - p2 * 1.8) * 0.45;
    ctx.strokeStyle = `rgba(${midTone}, ${shockAlpha2})`;
    ctx.lineWidth = (2.5 - p2 * 1.5) * zoom;
    ctx.setLineDash([6 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.arc(0, 0, shockR2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Ground scorch mark (fades in, persists)
  const scorchAlpha = alpha * Math.min(1, progress * 3) * 0.35;
  const scorchGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, impactRadius * 0.85);
  scorchGrad.addColorStop(0, `rgba(${scorchDark}, ${scorchAlpha})`);
  scorchGrad.addColorStop(0.5, `rgba(${scorchMid}, ${scorchAlpha * 0.6})`);
  scorchGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = scorchGrad;
  ctx.beginPath();
  ctx.arc(0, 0, impactRadius * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Central impact glow
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, impactRadius);
  glowGrad.addColorStop(0, `rgba(${brightTint}, ${alpha * 0.55})`);
  glowGrad.addColorStop(0.3, `rgba(${midTone}, ${alpha * 0.4})`);
  glowGrad.addColorStop(0.65, `rgba(${deepTone}, ${alpha * 0.2})`);
  glowGrad.addColorStop(1, `rgba(${darkTone}, 0)`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, impactRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Radial energy discharge rays (isometric projected)
  const rayCount = 10;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + progress * 0.6;
    const inner = impactRadius * 0.1;
    const rayLength = impactRadius * (0.35 + ((i * 7 + 3) % 5) / 5 * 0.35);
    const outer = inner + rayLength * Math.min(1, progress * 2.5);
    const rayAlpha = alpha * (0.7 - progress * 0.5) * (0.6 + Math.sin(t * 8 + i * 2) * 0.4);
    if (rayAlpha <= 0) continue;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle) * ISO_Y_RATIO;

    ctx.strokeStyle = `rgba(${rayOuter}, ${rayAlpha * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenX + cosA * inner, screenY + sinA * inner);
    ctx.lineTo(screenX + cosA * outer, screenY + sinA * outer);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${rayCore}, ${rayAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenX + cosA * inner, screenY + sinA * inner);
    ctx.lineTo(screenX + cosA * outer, screenY + sinA * outer);
    ctx.stroke();
  }

  // Flying debris shards
  const shardCount = 8;
  for (let i = 0; i < shardCount; i++) {
    const shardAngle = (i / shardCount) * Math.PI * 2 + 0.37;
    const shardDist = impactRadius * (0.15 + progress * (0.5 + (i % 3) * 0.15));
    const shardSize = (2 + (i % 3)) * zoom * Math.max(0, 1 - progress * 1.3);
    const sx = screenX + Math.cos(shardAngle) * shardDist;
    const sy = screenY + Math.sin(shardAngle) * shardDist * ISO_Y_RATIO - progress * 15 * zoom * (1 + (i % 2));
    if (shardSize <= 0) continue;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(shardAngle + progress * 4);
    ctx.fillStyle = `rgba(${shardColor}, ${alpha * (0.8 - progress * 0.6)})`;
    ctx.fillRect(-shardSize, -shardSize * 0.5, shardSize * 2, shardSize);
    ctx.restore();
  }

  // Bright center flash
  const flashAlpha = alpha * Math.max(0, 1 - progress * 2);
  if (flashAlpha > 0) {
    const flashGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, coreRadius * 3);
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
    flashGrad.addColorStop(0.4, `rgba(${flashMid}, ${flashAlpha * 0.6})`);
    flashGrad.addColorStop(1, `rgba(${flashEdge}, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(screenX, screenY, coreRadius * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Core hotspot
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9 * Math.max(0, 1 - progress * 1.5)})`;
  ctx.beginPath();
  ctx.arc(screenX, screenY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// SUNFORGE BEAM — solar plasma column from orrery to target with
// energy spirals, corona flares, and heat distortion
// ============================================================================

export function renderSunforgeBeam(
  ctx: CanvasRenderingContext2D,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  zoom: number,
  progress: number,
  alpha: number,
  intensity: number,
  effectId: string,
): void {
  const t = Date.now() / 1000;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;
  const px = -ny;
  const py = nx;

  const seed = hashFnv(effectId);
  const wobble = Math.sin(t * 6 + seed * 0.001) * 5 * zoom;

  const sx = sourceX + px * wobble * 0.3;
  const sy = sourceY + py * wobble * 0.3;
  const tx = targetX + px * wobble;
  const ty = targetY + py * wobble;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Outer glow beam
  ctx.shadowColor = "rgba(255, 160, 40, 0.9)";
  ctx.shadowBlur = 22 * zoom * intensity;
  const outerGrad = ctx.createLinearGradient(sx, sy, tx, ty);
  outerGrad.addColorStop(0, `rgba(255, 248, 220, ${alpha * 0.85 * intensity})`);
  outerGrad.addColorStop(0.3, `rgba(255, 180, 60, ${alpha * 0.7 * intensity})`);
  outerGrad.addColorStop(0.7, `rgba(249, 140, 40, ${alpha * 0.5 * intensity})`);
  outerGrad.addColorStop(1, `rgba(220, 100, 20, ${alpha * 0.3 * intensity})`);
  ctx.strokeStyle = outerGrad;
  ctx.lineWidth = 9 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  const cpx = sx + dx * 0.45 + px * 14 * zoom;
  const cpy = sy + dy * 0.45 + py * 14 * zoom;
  ctx.quadraticCurveTo(cpx, cpy, tx, ty);
  ctx.stroke();

  // Mid layer
  ctx.shadowBlur = 12 * zoom * intensity;
  ctx.shadowColor = "rgba(255, 200, 80, 0.8)";
  const midGrad = ctx.createLinearGradient(sx, sy, tx, ty);
  midGrad.addColorStop(0, `rgba(255, 255, 240, ${alpha * 0.9 * intensity})`);
  midGrad.addColorStop(0.5, `rgba(255, 220, 120, ${alpha * 0.7 * intensity})`);
  midGrad.addColorStop(1, `rgba(255, 180, 60, ${alpha * 0.4 * intensity})`);
  ctx.strokeStyle = midGrad;
  ctx.lineWidth = 4.5 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(cpx, cpy, tx, ty);
  ctx.stroke();

  // Core white-hot line
  ctx.shadowBlur = 6 * zoom * intensity;
  ctx.shadowColor = "rgba(255, 255, 200, 0.7)";
  ctx.strokeStyle = `rgba(255, 255, 245, ${alpha * 0.85 * intensity})`;
  ctx.lineWidth = 2 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  // Energy spiral particles along the beam
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  const particleCount = 6;
  for (let i = 0; i < particleCount; i++) {
    const paramT = ((t * 2.5 + i * 0.4 + seed * 0.0001) % 1);
    const bx = sx + dx * paramT;
    const by = sy + dy * paramT;
    const spiralR = (6 + Math.sin(t * 4 + i * 1.7) * 3) * zoom;
    const spiralAngle = t * 8 + paramT * 12 + i * 1.1;
    const pxOff = Math.cos(spiralAngle) * spiralR * px + Math.sin(spiralAngle) * spiralR * nx * 0.3;
    const pyOff = Math.cos(spiralAngle) * spiralR * py + Math.sin(spiralAngle) * spiralR * ny * 0.3;
    const pAlpha = alpha * (0.5 + Math.sin(paramT * Math.PI) * 0.4) * intensity;
    ctx.fillStyle = `rgba(255, 230, 140, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(bx + pxOff, by + pyOff, (1.5 + intensity * 0.8) * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Source corona flares
  for (let i = 0; i < 4; i++) {
    const flareAngle = t * 3 + i * 1.57;
    const flareLen = (10 + i * 3.5) * zoom * intensity;
    const fa = alpha * (0.4 - i * 0.08);
    ctx.strokeStyle = `rgba(255, 210, 130, ${fa})`;
    ctx.lineWidth = (1.8 - i * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      sx + Math.cos(flareAngle) * flareLen,
      sy + Math.sin(flareAngle) * flareLen * 0.6,
    );
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// SUNFORGE IMPACT — solar plasma detonation with concentric heat rings,
// molten splashes, ground char, and columnar fire pillar
// ============================================================================

export function renderSunforgeImpact(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  zoom: number,
  progress: number,
  alpha: number,
  size: number,
): void {
  const impactRadius = Math.max(22, size * zoom * (0.4 + progress * 0.85));
  const t = Date.now() / 1000;
  const pulse = 0.55 + Math.sin(t * 10) * 0.45;

  ctx.save();

  // Ground scorch (isometric ellipse, persists)
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.scale(1, ISO_Y_RATIO);
  const scorchAlpha = alpha * Math.min(1, progress * 4) * 0.3;
  const scorchGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, impactRadius * 0.9);
  scorchGrad.addColorStop(0, `rgba(50, 20, 5, ${scorchAlpha})`);
  scorchGrad.addColorStop(0.6, `rgba(40, 15, 0, ${scorchAlpha * 0.5})`);
  scorchGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = scorchGrad;
  ctx.beginPath();
  ctx.arc(0, 0, impactRadius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Main radial fire gradient
  const fireGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, impactRadius);
  fireGrad.addColorStop(0, `rgba(255, 245, 220, ${alpha * 0.7})`);
  fireGrad.addColorStop(0.25, `rgba(255, 200, 100, ${alpha * 0.55})`);
  fireGrad.addColorStop(0.55, `rgba(251, 146, 60, ${alpha * 0.35})`);
  fireGrad.addColorStop(0.8, `rgba(220, 80, 20, ${alpha * 0.15})`);
  fireGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.arc(0, 0, impactRadius, 0, Math.PI * 2);
  ctx.fill();

  // Outer shockwave ring
  const shockR = impactRadius * (0.7 + pulse * 0.15);
  ctx.strokeStyle = `rgba(255, 220, 150, ${alpha * (0.55 + pulse * 0.25)})`;
  ctx.lineWidth = 3 * zoom;
  ctx.setLineDash([8 * zoom, 5 * zoom]);
  ctx.lineDashOffset = -t * 40;
  ctx.beginPath();
  ctx.arc(0, 0, shockR, 0, Math.PI * 2);
  ctx.stroke();

  // Inner heat ring
  const innerR = impactRadius * 0.45;
  ctx.strokeStyle = `rgba(255, 240, 200, ${alpha * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Fire pillar (vertical column rising from impact, isometric)
  const pillarH = impactRadius * 1.4 * Math.max(0, 1 - progress * 1.2);
  if (pillarH > 5) {
    const pillarW = impactRadius * 0.25;
    const pillarGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY - pillarH);
    pillarGrad.addColorStop(0, `rgba(255, 200, 80, ${alpha * 0.5})`);
    pillarGrad.addColorStop(0.4, `rgba(255, 140, 40, ${alpha * 0.35})`);
    pillarGrad.addColorStop(0.8, `rgba(200, 80, 20, ${alpha * 0.15})`);
    pillarGrad.addColorStop(1, "rgba(100, 40, 10, 0)");
    ctx.fillStyle = pillarGrad;
    ctx.beginPath();
    ctx.moveTo(screenX - pillarW, screenY);
    ctx.lineTo(screenX - pillarW * 0.3, screenY - pillarH);
    ctx.lineTo(screenX + pillarW * 0.3, screenY - pillarH);
    ctx.lineTo(screenX + pillarW, screenY);
    ctx.closePath();
    ctx.fill();
  }

  // Radial fire rays
  const rayCount = 9;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + progress * 0.5 + 0.2;
    const inner = impactRadius * 0.12;
    const rayLen = impactRadius * (0.4 + ((i * 5 + 2) % 4) / 4 * 0.3);
    const outer = inner + rayLen;
    const rayAlpha = alpha * (0.75 - progress * 0.4) * (0.7 + Math.sin(t * 7 + i * 1.8) * 0.3);
    if (rayAlpha <= 0) continue;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle) * ISO_Y_RATIO;

    ctx.strokeStyle = `rgba(255, 180, 60, ${rayAlpha * 0.4})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenX + cosA * inner, screenY + sinA * inner);
    ctx.lineTo(screenX + cosA * outer, screenY + sinA * outer);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 240, 200, ${rayAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenX + cosA * inner, screenY + sinA * inner);
    ctx.lineTo(screenX + cosA * outer, screenY + sinA * outer);
    ctx.stroke();
  }

  // Molten splash droplets
  const dropCount = 7;
  for (let i = 0; i < dropCount; i++) {
    const dropAngle = (i / dropCount) * Math.PI * 2 + 1.1;
    const dropDist = impactRadius * (0.2 + progress * (0.4 + (i % 3) * 0.12));
    const dropR = (1.5 + (i % 2)) * zoom * Math.max(0, 1 - progress * 1.4);
    const dropX = screenX + Math.cos(dropAngle) * dropDist;
    const gravity = progress * progress * 20 * zoom;
    const dropY = screenY + Math.sin(dropAngle) * dropDist * ISO_Y_RATIO - progress * 12 * zoom * (1 + (i % 2)) + gravity;
    if (dropR <= 0) continue;
    ctx.fillStyle = `rgba(255, 200, 80, ${alpha * (0.7 - progress * 0.5)})`;
    ctx.beginPath();
    ctx.arc(dropX, dropY, dropR, 0, Math.PI * 2);
    ctx.fill();
  }

  // White-hot center flash
  const flashAlpha = alpha * Math.max(0, 1 - progress * 2.2);
  if (flashAlpha > 0.01) {
    const flashR = impactRadius * 0.2;
    const flashGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, flashR);
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
    flashGrad.addColorStop(0.5, `rgba(255, 240, 200, ${flashAlpha * 0.6})`);
    flashGrad.addColorStop(1, "rgba(255, 180, 60, 0)");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(screenX, screenY, flashR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Core hotspot
  ctx.fillStyle = `rgba(255, 255, 250, ${alpha * 0.85 * Math.max(0, 1 - progress * 1.6)})`;
  ctx.beginPath();
  ctx.arc(screenX, screenY, Math.max(3, impactRadius * 0.1), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// FNV-1a hash for deterministic per-effect variation
function hashFnv(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
