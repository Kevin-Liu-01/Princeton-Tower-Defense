import { drawOrganicBlobAt } from "../../../../rendering/helpers";
import type { WorldMapDrawContext } from "./drawContext";

export function drawSandDune(
  dc: WorldMapDrawContext,
  dx: number,
  dyPct: number,
  width: number,
  heightPx: number,
  colorLight: string,
  colorMid: string,
  colorDark: string
) {
  const { ctx, getY, time, seededRandom } = dc;
  const dy = getY(dyPct);
  const isoDepth = heightPx * 0.4;

  // Soft shadow underneath
  ctx.save();
  ctx.fillStyle = "rgba(80, 60, 40, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    dx + width * 0.1,
    dy + isoDepth * 0.4,
    width * 0.6,
    isoDepth * 0.6,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Back face (lee side) with deep shadow gradient
  const leeShadow = ctx.createLinearGradient(
    dx + width * 0.1,
    dy - heightPx,
    dx + width * 0.5,
    dy + isoDepth
  );
  leeShadow.addColorStop(0, colorDark);
  leeShadow.addColorStop(0.4, colorMid);
  leeShadow.addColorStop(1, "rgba(90, 70, 50, 0.8)");
  ctx.fillStyle = leeShadow;
  ctx.beginPath();
  ctx.moveTo(dx + width * 0.1, dy - heightPx);
  ctx.bezierCurveTo(
    dx + width * 0.25,
    dy - heightPx * 0.7,
    dx + width * 0.4,
    dy - heightPx * 0.3,
    dx + width * 0.5,
    dy
  );
  ctx.lineTo(dx + width * 0.5, dy + isoDepth * 0.3);
  ctx.bezierCurveTo(
    dx + width * 0.35,
    dy + isoDepth * 0.45,
    dx + width * 0.2,
    dy + isoDepth * 0.5,
    dx + width * 0.1,
    dy + isoDepth * 0.3
  );
  ctx.lineTo(dx + width * 0.1, dy - heightPx);
  ctx.closePath();
  ctx.fill();

  // Front face (lit side) with smooth flowing gradient
  const duneGrad = ctx.createLinearGradient(
    dx - width * 0.4,
    dy - heightPx,
    dx + width * 0.2,
    dy + isoDepth
  );
  duneGrad.addColorStop(0, colorLight);
  duneGrad.addColorStop(0.3, colorLight);
  duneGrad.addColorStop(0.6, colorMid);
  duneGrad.addColorStop(1, colorDark);
  ctx.fillStyle = duneGrad;
  ctx.beginPath();
  ctx.moveTo(dx + width * 0.1, dy - heightPx);
  ctx.bezierCurveTo(
    dx - width * 0.05,
    dy - heightPx * 0.75,
    dx - width * 0.25,
    dy - heightPx * 0.4,
    dx - width * 0.4,
    dy
  );
  ctx.lineTo(dx - width * 0.4, dy + isoDepth * 0.3);
  ctx.bezierCurveTo(
    dx - width * 0.2,
    dy + isoDepth * 0.45,
    dx,
    dy + isoDepth * 0.5,
    dx + width * 0.1,
    dy + isoDepth * 0.3
  );
  ctx.lineTo(dx + width * 0.1, dy - heightPx);
  ctx.closePath();
  ctx.fill();

  // Wind-carved ridgeline with glowing highlight
  const ridgeAlpha = 0.5 + Math.sin(time * 0.5 + dx * 0.01) * 0.15;
  ctx.strokeStyle = `rgba(255, 250, 230, ${ridgeAlpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(dx - width * 0.2, dy - heightPx * 0.65);
  ctx.bezierCurveTo(
    dx - width * 0.08,
    dy - heightPx * 0.85,
    dx + width * 0.05,
    dy - heightPx * 1.02,
    dx + width * 0.2,
    dy - heightPx * 0.6
  );
  ctx.stroke();
  // Secondary thinner ridge highlight
  ctx.strokeStyle = `rgba(255, 245, 210, ${ridgeAlpha * 0.5})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dx - width * 0.18, dy - heightPx * 0.58);
  ctx.bezierCurveTo(
    dx - width * 0.06,
    dy - heightPx * 0.78,
    dx + width * 0.06,
    dy - heightPx * 0.92,
    dx + width * 0.18,
    dy - heightPx * 0.52
  );
  ctx.stroke();

  // Wind ripples (flowing curves on front face)
  ctx.strokeStyle = "rgba(180, 150, 100, 0.18)";
  ctx.lineWidth = 0.7;
  for (let r = 0; r < 5; r++) {
    const rippleY = dy - heightPx * 0.4 + r * (heightPx * 0.15);
    const wavePhase = Math.sin(time * 0.8 + r * 0.5 + dx * 0.02) * 1.5;
    ctx.beginPath();
    ctx.moveTo(dx - width * 0.32 + r * 2, rippleY + wavePhase);
    ctx.bezierCurveTo(
      dx - width * 0.15,
      rippleY - 2 + wavePhase,
      dx,
      rippleY + 1 + wavePhase,
      dx + width * 0.08 - r * 1.5,
      rippleY - 0.5 + wavePhase
    );
    ctx.stroke();
  }

  // Sand grain texture (tiny dots scattered across surface)
  ctx.fillStyle = "rgba(200, 170, 120, 0.25)";
  for (let g = 0; g < 12; g++) {
    const gx = dx - width * 0.3 + seededRandom(dx + g * 7) * width * 0.6;
    const gy = dy - heightPx * 0.6 + seededRandom(dx + g * 13) * heightPx * 0.8;
    ctx.beginPath();
    ctx.arc(gx, gy, 0.5 + seededRandom(dx + g * 17) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wind-blown sand particles streaming off crest
  const windAlpha = 0.15 + Math.sin(time * 1.5 + dx * 0.03) * 0.08;
  ctx.fillStyle = `rgba(220, 195, 150, ${windAlpha})`;
  for (let w = 0; w < 4; w++) {
    const windPhase = (time * 3 + w * 1.7 + dx * 0.05) % 6;
    const wx = dx + width * 0.1 + windPhase * width * 0.08;
    const wy = dy - heightPx + windPhase * 1.5 + Math.sin(windPhase * 2) * 2;
    ctx.beginPath();
    ctx.arc(wx, wy, 0.8 + seededRandom(dx + w) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Footprint trail in sand (small dots in a winding line)
  ctx.fillStyle = "rgba(140, 115, 80, 0.2)";
  for (let f = 0; f < 6; f++) {
    const fpx = dx - width * 0.25 + f * width * 0.08;
    const fpy = dy - heightPx * 0.15 + Math.sin(f * 0.8) * 1.5;
    ctx.beginPath();
    ctx.ellipse(fpx, fpy, 1.2, 0.7, f * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawGoldenPyramid(
  dc: WorldMapDrawContext,
  px: number,
  pyPct: number,
  size: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const py = getY(pyPct);
  // Triangular cast shadow (light from upper-left, shadow to lower-right)
  const baseLeftX = px - size;
  const baseRightX = px + size;
  const baseY = py + 5;
  const shadowApexX = px + size * 1.1;
  const shadowApexY = py + size * 0.4;

  // Soft outer penumbra
  ctx.beginPath();
  ctx.moveTo(baseLeftX - 3, baseY + 4);
  ctx.lineTo(shadowApexX + 5, shadowApexY + 4);
  ctx.lineTo(baseRightX + 5, baseY + 2);
  ctx.lineTo(baseLeftX - 3, baseY + 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fill();

  // Core triangular shadow with gradient
  ctx.beginPath();
  ctx.moveTo(baseLeftX, baseY);
  ctx.lineTo(baseRightX, baseY);
  ctx.lineTo(shadowApexX, shadowApexY);
  ctx.closePath();
  const wmShadowGrad = ctx.createLinearGradient(
    baseLeftX,
    baseY,
    shadowApexX,
    shadowApexY
  );
  wmShadowGrad.addColorStop(0, "rgba(0,0,0,0.30)");
  wmShadowGrad.addColorStop(0.4, "rgba(0,0,0,0.18)");
  wmShadowGrad.addColorStop(0.7, "rgba(0,0,0,0.06)");
  wmShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wmShadowGrad;
  ctx.fill();

  // Sand accumulated at base
  const sandBaseGrad = ctx.createRadialGradient(
    px,
    py + 5,
    0,
    px,
    py + 5,
    size * 1.1
  );
  sandBaseGrad.addColorStop(0, "rgba(210, 180, 130, 0.5)");
  sandBaseGrad.addColorStop(1, "rgba(210, 180, 130, 0)");
  ctx.fillStyle = sandBaseGrad;
  ctx.beginPath();
  ctx.ellipse(px, py + 6, size * 1.1, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right face (shadow side)
  const rightGrad = ctx.createLinearGradient(
    px,
    py - size * 1.5,
    px + size,
    py + 5
  );
  rightGrad.addColorStop(0, "#a08050");
  rightGrad.addColorStop(0.5, "#8b7040");
  rightGrad.addColorStop(1, "#6b5530");
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(px, py - size * 1.5);
  ctx.lineTo(px + size, py + 5);
  ctx.lineTo(px, py + 5);
  ctx.closePath();
  ctx.fill();

  // Left face (lit side) with gradient
  const leftGrad = ctx.createLinearGradient(
    px - size,
    py + 5,
    px,
    py - size * 1.5
  );
  leftGrad.addColorStop(0, "#9a7a50");
  leftGrad.addColorStop(0.3, "#c9a86c");
  leftGrad.addColorStop(0.6, "#e8d4a0");
  leftGrad.addColorStop(1, "#d4b878");
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.moveTo(px, py - size * 1.5);
  ctx.lineTo(px, py + 5);
  ctx.lineTo(px - size, py + 5);
  ctx.closePath();
  ctx.fill();

  // Stone block pattern with mortar lines (horizontal rows)
  ctx.strokeStyle = "rgba(70, 55, 40, 0.35)";
  ctx.lineWidth = 0.8;
  for (let i = 1; i < 7; i++) {
    const lineY = py + 5 - i * (size * 0.22);
    const widthFrac = 1 - i * 0.14;
    const leftEdge = px - size * widthFrac;
    const rightEdge = px + size * widthFrac;
    // Horizontal mortar line
    ctx.beginPath();
    ctx.moveTo(leftEdge, lineY);
    ctx.lineTo(rightEdge, lineY);
    ctx.stroke();
    // Vertical mortar joints (offset each row)
    const blockCount = Math.max(2, Math.floor(6 - i * 0.7));
    const rowWidth = rightEdge - leftEdge;
    const offsetShift = i % 2 === 0 ? 0 : rowWidth / (blockCount * 2);
    for (let j = 1; j < blockCount; j++) {
      const jx = leftEdge + offsetShift + j * (rowWidth / blockCount);
      if (jx > leftEdge && jx < rightEdge) {
        ctx.beginPath();
        ctx.moveTo(jx, lineY);
        ctx.lineTo(jx, lineY + size * 0.22);
        ctx.stroke();
      }
    }
  }

  // Hieroglyphic details on the left face (small symbolic marks)
  ctx.strokeStyle = "rgba(60, 45, 30, 0.25)";
  ctx.lineWidth = 0.6;
  const glyphSeeds = [px * 3, px * 7, px * 11, px * 17, px * 23];
  for (let g = 0; g < 5; g++) {
    const glyY = py - size * 0.3 + seededRandom(glyphSeeds[g]) * size * 0.6;
    const glyX =
      px - size * 0.55 + seededRandom(glyphSeeds[g] + 1) * size * 0.4;
    const glyType = Math.floor(seededRandom(glyphSeeds[g] + 2) * 4);
    ctx.beginPath();
    if (glyType === 0) {
      // Eye of Horus style
      ctx.arc(glyX, glyY, 2, 0, Math.PI * 2);
      ctx.moveTo(glyX + 2, glyY);
      ctx.lineTo(glyX + 4, glyY + 2);
    } else if (glyType === 1) {
      // Ankh style
      ctx.ellipse(glyX, glyY - 2, 1.5, 2, 0, 0, Math.PI * 2);
      ctx.moveTo(glyX, glyY);
      ctx.lineTo(glyX, glyY + 4);
      ctx.moveTo(glyX - 2, glyY + 1.5);
      ctx.lineTo(glyX + 2, glyY + 1.5);
    } else if (glyType === 2) {
      // Bird silhouette
      ctx.moveTo(glyX - 2, glyY);
      ctx.lineTo(glyX, glyY - 2);
      ctx.lineTo(glyX + 2, glyY);
      ctx.lineTo(glyX + 3, glyY + 1);
      ctx.moveTo(glyX, glyY);
      ctx.lineTo(glyX, glyY + 3);
    } else {
      // Wavy water lines
      ctx.moveTo(glyX - 3, glyY);
      ctx.bezierCurveTo(
        glyX - 1,
        glyY - 1.5,
        glyX + 1,
        glyY + 1.5,
        glyX + 3,
        glyY
      );
      ctx.moveTo(glyX - 3, glyY + 2);
      ctx.bezierCurveTo(
        glyX - 1,
        glyY + 0.5,
        glyX + 1,
        glyY + 3.5,
        glyX + 3,
        glyY + 2
      );
    }
    ctx.stroke();
  }

  // Golden capstone with animated sparkle/gleam
  const capGlow = 0.75 + Math.sin(time * 2.5) * 0.25;
  const capGrad = ctx.createLinearGradient(
    px - size * 0.15,
    py - size * 1.5,
    px + size * 0.15,
    py - size * 1.2
  );
  capGrad.addColorStop(0, `rgba(255, 230, 80, ${capGlow})`);
  capGrad.addColorStop(0.5, `rgba(255, 215, 0, ${capGlow})`);
  capGrad.addColorStop(1, `rgba(200, 170, 0, ${capGlow * 0.8})`);
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.moveTo(px, py - size * 1.5);
  ctx.lineTo(px + size * 0.18, py - size * 1.2);
  ctx.lineTo(px - size * 0.18, py - size * 1.2);
  ctx.closePath();
  ctx.fill();

  // Capstone sparkle star
  const sparkleAlpha = Math.max(0, Math.sin(time * 4 + px * 0.1) * 0.7);
  if (sparkleAlpha > 0.05) {
    ctx.strokeStyle = `rgba(255, 255, 220, ${sparkleAlpha})`;
    ctx.lineWidth = 1;
    const spX = px;
    const spY = py - size * 1.45;
    const spLen = 3 + sparkleAlpha * 4;
    ctx.beginPath();
    ctx.moveTo(spX - spLen, spY);
    ctx.lineTo(spX + spLen, spY);
    ctx.moveTo(spX, spY - spLen);
    ctx.lineTo(spX, spY + spLen);
    ctx.moveTo(spX - spLen * 0.6, spY - spLen * 0.6);
    ctx.lineTo(spX + spLen * 0.6, spY + spLen * 0.6);
    ctx.moveTo(spX + spLen * 0.6, spY - spLen * 0.6);
    ctx.lineTo(spX - spLen * 0.6, spY + spLen * 0.6);
    ctx.stroke();
  }

  // Light ray emanating from capstone
  const rayAlpha = 0.04 + Math.sin(time * 1.5 + px * 0.05) * 0.025;
  const rayGrad = ctx.createLinearGradient(
    px,
    py - size * 1.5,
    px,
    py - size * 2.5
  );
  rayGrad.addColorStop(0, `rgba(255, 230, 100, ${rayAlpha * 2})`);
  rayGrad.addColorStop(1, `rgba(255, 230, 100, 0)`);
  ctx.fillStyle = rayGrad;
  ctx.beginPath();
  ctx.moveTo(px - 2, py - size * 1.5);
  ctx.lineTo(px - size * 0.15, py - size * 2.5);
  ctx.lineTo(px + size * 0.15, py - size * 2.5);
  ctx.lineTo(px + 2, py - size * 1.5);
  ctx.closePath();
  ctx.fill();
}

export function drawSphinx(
  dc: WorldMapDrawContext,
  sx: number,
  syPct: number,
  scale: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const sy = getY(syPct);
  const spSeed = sx * 3.1 + syPct * 7.3;

  // Ground shadow — organic
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  drawOrganicBlobAt(
    ctx,
    sx + 4 * scale,
    sy + 10 * scale,
    30 * scale,
    8 * scale,
    spSeed + 90,
    0.12,
    14
  );
  ctx.fill();

  // Sand drift burying lower body and paws
  const sandBury = ctx.createRadialGradient(
    sx + 8 * scale,
    sy + 7 * scale,
    0,
    sx + 8 * scale,
    sy + 7 * scale,
    26 * scale
  );
  sandBury.addColorStop(0, "rgba(210, 180, 130, 0.55)");
  sandBury.addColorStop(0.6, "rgba(210, 180, 130, 0.3)");
  sandBury.addColorStop(1, "rgba(210, 180, 130, 0)");
  ctx.fillStyle = sandBury;
  drawOrganicBlobAt(
    ctx,
    sx + 8 * scale,
    sy + 7 * scale,
    26 * scale,
    9 * scale,
    spSeed + 80,
    0.14,
    14
  );
  ctx.fill();

  // === LION BODY (recumbent form with haunches, not just an ellipse) ===
  const bodyGrad = ctx.createLinearGradient(
    sx - 24 * scale,
    sy - 10 * scale,
    sx + 24 * scale,
    sy + 10 * scale
  );
  bodyGrad.addColorStop(0, "#9a7a55");
  bodyGrad.addColorStop(0.2, "#c8a878");
  bodyGrad.addColorStop(0.5, "#bfa070");
  bodyGrad.addColorStop(0.8, "#a88a60");
  bodyGrad.addColorStop(1, "#8a6a48");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Haunches (back end, raised)
  ctx.moveTo(sx + 20 * scale, sy + 6 * scale);
  ctx.bezierCurveTo(
    sx + 22 * scale,
    sy + 2 * scale,
    sx + 18 * scale,
    sy - 8 * scale,
    sx + 10 * scale,
    sy - 9 * scale
  );
  // Back/spine ridge
  ctx.bezierCurveTo(
    sx + 2 * scale,
    sy - 10 * scale,
    sx - 6 * scale,
    sy - 9 * scale,
    sx - 12 * scale,
    sy - 6 * scale
  );
  // Chest slopes down to paws
  ctx.bezierCurveTo(
    sx - 14 * scale,
    sy - 3 * scale,
    sx - 14 * scale,
    sy + 2 * scale,
    sx - 12 * scale,
    sy + 6 * scale
  );
  // Belly underside
  ctx.bezierCurveTo(
    sx - 4 * scale,
    sy + 9 * scale,
    sx + 10 * scale,
    sy + 9 * scale,
    sx + 20 * scale,
    sy + 6 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Haunches highlight — rounded bump on rear
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#d4b888";
  ctx.beginPath();
  ctx.ellipse(
    sx + 14 * scale,
    sy - 4 * scale,
    8 * scale,
    6 * scale,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Stone block lines visible on body
  ctx.save();
  ctx.strokeStyle = "rgba(80, 65, 45, 0.15)";
  ctx.lineWidth = 0.5 * scale;
  for (let bl = 0; bl < 4; bl++) {
    const blY = sy - 5 * scale + bl * 3.5 * scale;
    const blLeftX = sx - 11 * scale + bl * 1.5 * scale;
    const blRightX = sx + 18 * scale - bl * 2 * scale;
    ctx.beginPath();
    ctx.moveTo(blLeftX, blY);
    ctx.quadraticCurveTo(
      (blLeftX + blRightX) / 2,
      blY + seededRandom(spSeed + bl * 5) * 1.5 * scale,
      blRightX,
      blY + 0.5 * scale
    );
    ctx.stroke();
  }
  // Vertical joints
  for (let vj = 0; vj < 6; vj++) {
    const vjX =
      sx -
      8 * scale +
      vj * 5 * scale +
      seededRandom(spSeed + vj * 9) * 2 * scale;
    const vjTopY = sy - 8 * scale + vj * 0.5 * scale;
    const vjBotY =
      vjTopY + 3 * scale + seededRandom(spSeed + vj * 11) * 2 * scale;
    ctx.beginPath();
    ctx.moveTo(vjX, vjTopY);
    ctx.lineTo(vjX + 0.3 * scale, vjBotY);
    ctx.stroke();
  }
  ctx.restore();

  // Weathered erosion marks on body (branching cracks)
  ctx.save();
  ctx.strokeStyle = "rgba(70, 55, 40, 0.2)";
  ctx.lineWidth = 0.6;
  for (let c = 0; c < 7; c++) {
    const cx0 = sx - 10 * scale + seededRandom(spSeed + c * 7) * 28 * scale;
    const cy0 = sy - 6 * scale + seededRandom(spSeed + c * 11) * 10 * scale;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    const cmx = cx0 + (seededRandom(spSeed + c * 13) - 0.5) * 6 * scale;
    const cmy = cy0 + seededRandom(spSeed + c * 17) * 5 * scale;
    ctx.quadraticCurveTo(
      (cx0 + cmx) / 2 + seededRandom(spSeed + c * 19) * 2 * scale,
      (cy0 + cmy) / 2,
      cmx,
      cmy
    );
    ctx.stroke();
    // Small branch off the crack
    if (seededRandom(spSeed + c * 21) > 0.4) {
      ctx.beginPath();
      ctx.moveTo(cmx, cmy);
      ctx.lineTo(
        cmx + (seededRandom(spSeed + c * 23) - 0.5) * 4 * scale,
        cmy + seededRandom(spSeed + c * 25) * 3 * scale
      );
      ctx.stroke();
    }
  }
  ctx.restore();

  // === FRONT PAWS (extended forward, partially sand-buried) ===
  // Left paw
  ctx.fillStyle = "#b89868";
  ctx.beginPath();
  ctx.moveTo(sx - 12 * scale, sy + 3 * scale);
  ctx.bezierCurveTo(
    sx - 14 * scale,
    sy + 4 * scale,
    sx - 18 * scale,
    sy + 5 * scale,
    sx - 20 * scale,
    sy + 6 * scale
  );
  ctx.bezierCurveTo(
    sx - 18 * scale,
    sy + 8 * scale,
    sx - 14 * scale,
    sy + 8 * scale,
    sx - 11 * scale,
    sy + 6 * scale
  );
  ctx.closePath();
  ctx.fill();
  // Right paw
  ctx.fillStyle = "#c0a070";
  ctx.beginPath();
  ctx.moveTo(sx - 10 * scale, sy + 2 * scale);
  ctx.bezierCurveTo(
    sx - 13 * scale,
    sy + 2.5 * scale,
    sx - 17 * scale,
    sy + 3 * scale,
    sx - 19 * scale,
    sy + 4 * scale
  );
  ctx.bezierCurveTo(
    sx - 17 * scale,
    sy + 6 * scale,
    sx - 13 * scale,
    sy + 6 * scale,
    sx - 10 * scale,
    sy + 4 * scale
  );
  ctx.closePath();
  ctx.fill();
  // Paw digit lines
  ctx.strokeStyle = "rgba(80, 60, 40, 0.25)";
  ctx.lineWidth = 0.4 * scale;
  for (let pd = 0; pd < 3; pd++) {
    const pdX = sx - 19 * scale + pd * 2 * scale;
    ctx.beginPath();
    ctx.moveTo(pdX, sy + 4.5 * scale);
    ctx.lineTo(pdX - 0.5 * scale, sy + 6 * scale);
    ctx.stroke();
  }

  // Tail curling over haunch
  ctx.strokeStyle = "#a88a5a";
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx + 20 * scale, sy + 3 * scale);
  ctx.bezierCurveTo(
    sx + 24 * scale,
    sy - 2 * scale,
    sx + 22 * scale,
    sy - 7 * scale,
    sx + 18 * scale,
    sy - 8 * scale
  );
  ctx.stroke();
  ctx.strokeStyle = "#bfa070";
  ctx.lineWidth = 1.2 * scale;
  ctx.stroke();

  // === CHEST / NECK rising from body ===
  const chestGrad = ctx.createLinearGradient(
    sx - 16 * scale,
    sy - 6 * scale,
    sx - 10 * scale,
    sy - 16 * scale
  );
  chestGrad.addColorStop(0, "#b89868");
  chestGrad.addColorStop(0.5, "#cbb080");
  chestGrad.addColorStop(1, "#bfa070");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(sx - 12 * scale, sy - 6 * scale);
  ctx.bezierCurveTo(
    sx - 15 * scale,
    sy - 10 * scale,
    sx - 17 * scale,
    sy - 14 * scale,
    sx - 16 * scale,
    sy - 18 * scale
  );
  ctx.lineTo(sx - 12 * scale, sy - 18 * scale);
  ctx.bezierCurveTo(
    sx - 10 * scale,
    sy - 12 * scale,
    sx - 9 * scale,
    sy - 8 * scale,
    sx - 8 * scale,
    sy - 5 * scale
  );
  ctx.closePath();
  ctx.fill();

  // === HEAD ===
  const headGrad = ctx.createRadialGradient(
    sx - 15 * scale,
    sy - 22 * scale,
    0,
    sx - 14 * scale,
    sy - 20 * scale,
    10 * scale
  );
  headGrad.addColorStop(0, "#dcc090");
  headGrad.addColorStop(0.6, "#c4a878");
  headGrad.addColorStop(1, "#a08058");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(sx - 10 * scale, sy - 17 * scale);
  ctx.bezierCurveTo(
    sx - 9 * scale,
    sy - 22 * scale,
    sx - 11 * scale,
    sy - 27 * scale,
    sx - 14 * scale,
    sy - 28 * scale
  );
  ctx.bezierCurveTo(
    sx - 17 * scale,
    sy - 27 * scale,
    sx - 20 * scale,
    sy - 24 * scale,
    sx - 20 * scale,
    sy - 19 * scale
  );
  ctx.bezierCurveTo(
    sx - 20 * scale,
    sy - 16 * scale,
    sx - 16 * scale,
    sy - 15 * scale,
    sx - 10 * scale,
    sy - 17 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Chin / jaw line
  ctx.fillStyle = "#b89060";
  ctx.beginPath();
  ctx.moveTo(sx - 19 * scale, sy - 17 * scale);
  ctx.quadraticCurveTo(
    sx - 15 * scale,
    sy - 14.5 * scale,
    sx - 11 * scale,
    sy - 16 * scale
  );
  ctx.quadraticCurveTo(
    sx - 15 * scale,
    sy - 15.5 * scale,
    sx - 19 * scale,
    sy - 17 * scale
  );
  ctx.fill();

  // === NEMES HEADDRESS (with lappets flowing down) ===
  const nemesGrad = ctx.createLinearGradient(
    sx - 22 * scale,
    sy - 28 * scale,
    sx - 8 * scale,
    sy - 16 * scale
  );
  nemesGrad.addColorStop(0, "#d4b060");
  nemesGrad.addColorStop(0.5, "#c9a050");
  nemesGrad.addColorStop(1, "#b08838");
  ctx.fillStyle = nemesGrad;
  // Main headdress crown
  ctx.beginPath();
  ctx.moveTo(sx - 22 * scale, sy - 18 * scale);
  ctx.bezierCurveTo(
    sx - 23 * scale,
    sy - 24 * scale,
    sx - 20 * scale,
    sy - 30 * scale,
    sx - 14 * scale,
    sy - 31 * scale
  );
  ctx.bezierCurveTo(
    sx - 8 * scale,
    sy - 30 * scale,
    sx - 6 * scale,
    sy - 24 * scale,
    sx - 7 * scale,
    sy - 18 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Left lappet (draping down over shoulder)
  ctx.fillStyle = "#c9a050";
  ctx.beginPath();
  ctx.moveTo(sx - 22 * scale, sy - 18 * scale);
  ctx.bezierCurveTo(
    sx - 23 * scale,
    sy - 12 * scale,
    sx - 22 * scale,
    sy - 6 * scale,
    sx - 20 * scale,
    sy - 2 * scale
  );
  ctx.lineTo(sx - 18 * scale, sy - 2 * scale);
  ctx.bezierCurveTo(
    sx - 19 * scale,
    sy - 7 * scale,
    sx - 20 * scale,
    sy - 13 * scale,
    sx - 19 * scale,
    sy - 18 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Right lappet (shorter, further away perspective)
  ctx.fillStyle = "#b89040";
  ctx.beginPath();
  ctx.moveTo(sx - 7 * scale, sy - 18 * scale);
  ctx.bezierCurveTo(
    sx - 6 * scale,
    sy - 13 * scale,
    sx - 7 * scale,
    sy - 8 * scale,
    sx - 8 * scale,
    sy - 4 * scale
  );
  ctx.lineTo(sx - 10 * scale, sy - 4 * scale);
  ctx.bezierCurveTo(
    sx - 9 * scale,
    sy - 9 * scale,
    sx - 8 * scale,
    sy - 14 * scale,
    sx - 9 * scale,
    sy - 18 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Headdress stripes (alternating gold/blue bands)
  ctx.save();
  ctx.strokeStyle = "rgba(60, 60, 120, 0.3)";
  ctx.lineWidth = 1.2 * scale;
  for (let hs = 0; hs < 5; hs++) {
    const hsT = 0.15 + hs * 0.15;
    const hsLeftX = sx - 22 * scale + hsT * 4 * scale;
    const hsRightX = sx - 7 * scale - hsT * 4 * scale;
    const hsY = sy - 30 * scale + hsT * 14 * scale;
    ctx.beginPath();
    ctx.moveTo(hsLeftX, hsY);
    ctx.quadraticCurveTo(
      (hsLeftX + hsRightX) / 2,
      hsY + 1 * scale,
      hsRightX,
      hsY
    );
    ctx.stroke();
  }
  // Stripes on left lappet
  ctx.strokeStyle = "rgba(60, 60, 120, 0.25)";
  ctx.lineWidth = 0.8 * scale;
  for (let ls = 0; ls < 4; ls++) {
    const lsY = sy - 16 * scale + ls * 4 * scale;
    ctx.beginPath();
    ctx.moveTo(sx - 22 * scale + ls * 0.5 * scale, lsY);
    ctx.lineTo(sx - 18.5 * scale + ls * 0.3 * scale, lsY + 0.5 * scale);
    ctx.stroke();
  }
  ctx.restore();

  // Uraeus (cobra) on forehead
  ctx.fillStyle = "#c9a050";
  ctx.beginPath();
  ctx.moveTo(sx - 14 * scale, sy - 31 * scale);
  ctx.lineTo(sx - 14.5 * scale, sy - 34 * scale);
  ctx.quadraticCurveTo(
    sx - 13 * scale,
    sy - 35 * scale,
    sx - 12 * scale,
    sy - 33 * scale
  );
  ctx.bezierCurveTo(
    sx - 12.5 * scale,
    sy - 32 * scale,
    sx - 13.5 * scale,
    sy - 31.5 * scale,
    sx - 14 * scale,
    sy - 31 * scale
  );
  ctx.fill();
  ctx.fillStyle = "#a07830";
  ctx.beginPath();
  ctx.arc(sx - 13.5 * scale, sy - 33.5 * scale, 0.7 * scale, 0, Math.PI * 2);
  ctx.fill();

  // === FACE DETAILS ===
  // Eyes — almond-shaped with lids
  ctx.save();
  for (let eye = 0; eye < 2; eye++) {
    const eyeX = sx - (eye === 0 ? 17 : 12) * scale;
    const eyeY = sy - 22 * scale;
    // Eye socket shadow
    ctx.fillStyle = "rgba(80, 60, 40, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      eyeX,
      eyeY,
      2.2 * scale,
      1.2 * scale,
      eye === 0 ? -0.1 : 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Eyeball
    ctx.fillStyle = "#907858";
    ctx.beginPath();
    ctx.ellipse(
      eyeX,
      eyeY,
      1.8 * scale,
      1 * scale,
      eye === 0 ? -0.1 : 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Pupil
    ctx.fillStyle = "#4a3828";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 0.7 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Upper eyelid line
    ctx.strokeStyle = "rgba(60, 45, 30, 0.5)";
    ctx.lineWidth = 0.6 * scale;
    ctx.beginPath();
    ctx.ellipse(
      eyeX,
      eyeY - 0.3 * scale,
      2 * scale,
      0.8 * scale,
      eye === 0 ? -0.1 : 0.1,
      Math.PI,
      Math.PI * 2
    );
    ctx.stroke();
    // Kohl eyeliner extending outward
    ctx.strokeStyle = "rgba(40, 30, 20, 0.4)";
    ctx.lineWidth = 0.4 * scale;
    const extDir = eye === 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(eyeX + extDir * 2 * scale, eyeY);
    ctx.lineTo(eyeX + extDir * 3 * scale, eyeY + 0.8 * scale);
    ctx.stroke();
  }
  ctx.restore();

  // Missing nose — weathered indent with shadow
  ctx.fillStyle = "rgba(90, 70, 48, 0.5)";
  ctx.beginPath();
  ctx.moveTo(sx - 15.5 * scale, sy - 20.5 * scale);
  ctx.bezierCurveTo(
    sx - 16.5 * scale,
    sy - 19 * scale,
    sx - 16 * scale,
    sy - 17.5 * scale,
    sx - 14.5 * scale,
    sy - 18 * scale
  );
  ctx.bezierCurveTo(
    sx - 13.5 * scale,
    sy - 18.5 * scale,
    sx - 14 * scale,
    sy - 20 * scale,
    sx - 15.5 * scale,
    sy - 20.5 * scale
  );
  ctx.fill();
  ctx.strokeStyle = "rgba(70, 55, 35, 0.35)";
  ctx.lineWidth = 0.4 * scale;
  ctx.stroke();

  // Mouth — slight serene smile
  ctx.strokeStyle = "rgba(80, 60, 40, 0.45)";
  ctx.lineWidth = 0.7 * scale;
  ctx.beginPath();
  ctx.moveTo(sx - 18 * scale, sy - 17 * scale);
  ctx.bezierCurveTo(
    sx - 16.5 * scale,
    sy - 16 * scale,
    sx - 13.5 * scale,
    sy - 16 * scale,
    sx - 11.5 * scale,
    sy - 17 * scale
  );
  ctx.stroke();
  // Upper lip highlight
  ctx.strokeStyle = "rgba(200, 170, 120, 0.25)";
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.moveTo(sx - 17 * scale, sy - 17.5 * scale);
  ctx.quadraticCurveTo(
    sx - 14.5 * scale,
    sy - 17 * scale,
    sx - 12 * scale,
    sy - 17.5 * scale
  );
  ctx.stroke();

  // False beard (Pharaoh beard, partially broken off)
  ctx.fillStyle = "#a08050";
  ctx.beginPath();
  ctx.moveTo(sx - 16 * scale, sy - 16 * scale);
  ctx.bezierCurveTo(
    sx - 16.5 * scale,
    sy - 13 * scale,
    sx - 15 * scale,
    sy - 10 * scale,
    sx - 14 * scale,
    sy - 9 * scale
  );
  ctx.lineTo(sx - 13 * scale, sy - 10 * scale);
  ctx.bezierCurveTo(
    sx - 13.5 * scale,
    sy - 12 * scale,
    sx - 14 * scale,
    sy - 14 * scale,
    sx - 14 * scale,
    sy - 16 * scale
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(70, 55, 35, 0.3)";
  ctx.lineWidth = 0.4 * scale;
  ctx.stroke();
  // Broken edge at bottom
  ctx.strokeStyle = "rgba(90, 70, 50, 0.4)";
  ctx.lineWidth = 0.6 * scale;
  ctx.beginPath();
  ctx.moveTo(sx - 14.5 * scale, sy - 9.5 * scale);
  ctx.lineTo(sx - 13.5 * scale, sy - 9 * scale);
  ctx.lineTo(sx - 13 * scale, sy - 10 * scale);
  ctx.stroke();

  // Weathering cracks on head/face
  ctx.save();
  ctx.strokeStyle = "rgba(80, 60, 40, 0.2)";
  ctx.lineWidth = 0.4;
  const headCracks: [number, number, number, number][] = [
    [-19, -20, -16.5, -17.5],
    [-11, -25, -13, -22],
    [-18, -25, -16, -23],
    [-10, -19, -12, -17],
  ];
  for (const [x1, y1, x2, y2] of headCracks) {
    ctx.beginPath();
    ctx.moveTo(sx + x1 * scale, sy + y1 * scale);
    ctx.quadraticCurveTo(
      sx + ((x1 + x2) / 2) * scale + seededRandom(spSeed + x1) * 1.5 * scale,
      sy + ((y1 + y2) / 2) * scale,
      sx + x2 * scale,
      sy + y2 * scale
    );
    ctx.stroke();
  }
  ctx.restore();

  // Wind-blown sand particles drifting past
  ctx.save();
  for (let sp = 0; sp < 4; sp++) {
    const spPhase = (time * 12 + sp * 15 + spSeed) % 50;
    const spX = sx - 25 * scale + spPhase * 1.2 * scale;
    const spY = sy + (seededRandom(spSeed + sp * 71) - 0.5) * 16 * scale;
    const spAlpha = Math.max(0, 0.3 - Math.abs(spPhase - 25) / 40);
    if (spAlpha > 0) {
      ctx.fillStyle = `rgba(210, 180, 130, ${spAlpha})`;
      ctx.beginPath();
      ctx.arc(
        spX,
        spY,
        0.6 + seededRandom(spSeed + sp * 73) * 0.6,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  ctx.restore();

  // Subtle golden highlight on lit side
  ctx.save();
  ctx.globalAlpha = 0.08;
  const sunGrad = ctx.createLinearGradient(
    sx - 24 * scale,
    sy - 30 * scale,
    sx + 10 * scale,
    sy + 5 * scale
  );
  sunGrad.addColorStop(0, "#ffe880");
  sunGrad.addColorStop(0.4, "#ffe880");
  sunGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sx - 24 * scale, sy - 35 * scale, 48 * scale, 45 * scale);
  ctx.restore();
}

export function drawPalmTree(
  dc: WorldMapDrawContext,
  tx: number,
  tyPct: number,
  scale: number
) {
  const { ctx, getY, time } = dc;
  const ty = getY(tyPct);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(
    tx + 10 * scale,
    ty + 5 * scale,
    18 * scale,
    5 * scale,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Fallen palm fronds on ground
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#4a7a30";
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(tx - 8 * scale, ty + 3 * scale);
  ctx.quadraticCurveTo(
    tx - 2 * scale,
    ty + 1 * scale,
    tx + 6 * scale,
    ty + 4 * scale
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a6a25";
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(tx + 12 * scale, ty + 2 * scale);
  ctx.quadraticCurveTo(
    tx + 18 * scale,
    ty + 0,
    tx + 22 * scale,
    ty + 3 * scale
  );
  ctx.stroke();
  ctx.restore();

  // Curved trunk with gradient
  const trunkGrad = ctx.createLinearGradient(
    tx - 4 * scale,
    ty,
    tx + 4 * scale,
    ty
  );
  trunkGrad.addColorStop(0, "#4a3518");
  trunkGrad.addColorStop(0.3, "#8a6840");
  trunkGrad.addColorStop(0.7, "#6a5030");
  trunkGrad.addColorStop(1, "#4a3518");
  ctx.strokeStyle = trunkGrad;
  ctx.lineWidth = 6 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.bezierCurveTo(
    tx + 4 * scale,
    ty - 12 * scale,
    tx + 10 * scale,
    ty - 25 * scale,
    tx + 4 * scale,
    ty - 40 * scale
  );
  ctx.stroke();

  // Distinct ring segments on trunk
  ctx.strokeStyle = "#3a2510";
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 8; r++) {
    const t = r / 8;
    const ringX = tx + 0 + t * 4 * scale + Math.sin(t * Math.PI) * 6 * scale;
    const ringY = ty - t * 40 * scale;
    const ringW = (3.5 - t * 0.8) * scale;
    ctx.beginPath();
    ctx.arc(ringX, ringY, ringW, 0, Math.PI);
    ctx.stroke();
    // Lighter highlight on ring
    ctx.strokeStyle = "rgba(160, 130, 80, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ringX, ringY, ringW, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#3a2510";
    ctx.lineWidth = 1.2;
  }

  // Palm fronds — pinnate leaves radiating from crown, gravity always pulls screen-down
  const frondColorPairs: [string, string][] = [
    ["#1d6b2c", "#2a8838"],
    ["#2d8b3c", "#3a9e4a"],
    ["#1a6028", "#288a35"],
    ["#2d8b3c", "#3a9e4a"],
    ["#1d6b2c", "#2a8838"],
    ["#258533", "#32a040"],
    ["#1a6028", "#288a35"],
    ["#226830", "#2e9040"],
  ];
  const frondAngles = [-2.4, -1.6, -0.9, -0.2, 0.5, 1.2, 1.9, 2.6];
  const frondLengths = [0.95, 1.05, 1.12, 1, 1.1, 1.05, 0.92, 0.82];
  const crownX = tx + 4 * scale;
  const crownY = ty - 40 * scale;

  frondAngles.forEach((baseAngle, i) => {
    const sway =
      Math.sin(time * 1.2 + i * 1.1) * 0.07 +
      Math.sin(time * 2.5 + i * 0.7) * 0.035;
    const ang = baseAngle + sway;
    const len = 28 * scale * frondLengths[i];
    const [colorDark, colorLight] = frondColorPairs[i];

    ctx.save();
    ctx.translate(crownX, crownY);
    ctx.rotate(ang);

    // Midrib with gravity applied in screen-down direction (converted to rotated local space)
    const segments = 10;
    const ribPts: { x: number; y: number }[] = [];
    const sinAng = Math.sin(ang);
    const cosAng = Math.cos(ang);
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const rx = t * len;
      const arch = -Math.sin(t * Math.PI * 0.7) * len * 0.08;
      const grav = t * t * len * 0.22;
      ribPts.push({ x: rx + grav * sinAng, y: arch + grav * cosAng });
    }

    // Draw midrib stroke
    ctx.strokeStyle = "#1a5020";
    ctx.lineWidth = 1.3 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let s = 1; s <= segments; s++) {
      ctx.lineTo(ribPts[s].x, ribPts[s].y);
    }
    ctx.stroke();

    // Draw pinnate leaflets along the midrib
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const pt = ribPts[s];

      const taper = 1 - Math.abs(t - 0.4) * 1.6;
      const leafLen = Math.max(0, (4 + taper * 7) * scale);
      if (leafLen < 1.5 * scale) {
        continue;
      }

      const backAngle = 0.35;
      for (const side of [-1, 1] as const) {
        const baseAng = (Math.PI / 2) * side + backAngle;
        const tipX = pt.x + Math.cos(baseAng) * leafLen * 0.3;
        const tipY = pt.y + Math.sin(baseAng) * leafLen + leafLen * 0.15;
        const cpX = pt.x + Math.cos(baseAng) * leafLen * 0.15;
        const cpY = pt.y + Math.sin(baseAng) * leafLen * 0.55 + leafLen * 0.05;

        ctx.fillStyle = side === -1 ? colorDark : colorLight;
        ctx.globalAlpha = 0.88 - t * 0.2;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.quadraticCurveTo(cpX - 0.6 * scale * side, cpY, tipX, tipY);
        ctx.quadraticCurveTo(cpX + 0.6 * scale * side, cpY, pt.x, pt.y);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  });

  // Coconut cluster with shadow
  ctx.fillStyle = "#3a2a18";
  ctx.beginPath();
  ctx.arc(tx + 3 * scale, ty - 38 * scale, 3.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a3520";
  ctx.beginPath();
  ctx.arc(tx + 7 * scale, ty - 37 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a4028";
  ctx.beginPath();
  ctx.arc(tx + 5 * scale, ty - 39.5 * scale, 2.8 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Coconut highlights
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(tx + 2.5 * scale, ty - 39 * scale, 1 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(tx + 6.5 * scale, ty - 38 * scale, 1 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawOasis(
  dc: WorldMapDrawContext,
  ox: number,
  oyPct: number,
  size: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const oy = getY(oyPct);

  // Mud/dirt rim around oasis
  const rimGrad = ctx.createRadialGradient(
    ox,
    oy,
    size * 0.85,
    ox,
    oy,
    size * 1.25
  );
  rimGrad.addColorStop(0, "rgba(120, 95, 60, 0.5)");
  rimGrad.addColorStop(1, "rgba(120, 95, 60, 0)");
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(ox, oy, size * 1.25, size * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grass/vegetation border ring
  ctx.fillStyle = "#4a8a3a";
  for (let g = 0; g < 18; g++) {
    const gAngle = (g / 18) * Math.PI * 2;
    const gx = ox + Math.cos(gAngle) * size * 1.08;
    const gy = oy + Math.sin(gAngle) * size * 0.44;
    ctx.beginPath();
    ctx.moveTo(gx - 2, gy + 2);
    ctx.lineTo(
      gx + Math.sin(time * 2.5 + g * 0.8) * 1.5,
      gy - 7 - Math.sin(time * 3 + g) * 2
    );
    ctx.lineTo(gx + 2, gy + 2);
    ctx.fill();
  }

  // Water with crystal-clear depth gradient
  const waterGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);
  waterGrad.addColorStop(
    0,
    `rgba(30, 100, 140, ${0.85 + Math.sin(time * 2) * 0.05})`
  );
  waterGrad.addColorStop(
    0.3,
    `rgba(40, 140, 180, ${0.8 + Math.sin(time * 2.2) * 0.05})`
  );
  waterGrad.addColorStop(
    0.7,
    `rgba(60, 170, 200, ${0.7 + Math.sin(time * 2.5) * 0.05})`
  );
  waterGrad.addColorStop(1, `rgba(100, 200, 220, 0.4)`);
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.ellipse(ox, oy, size, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shallow edge highlight
  ctx.strokeStyle = "rgba(150, 220, 240, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(ox, oy, size * 0.92, size * 0.37, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Animated water sparkles (twinkling)
  for (let s = 0; s < 8; s++) {
    const sparkPhase = Math.sin(time * 5 + s * 1.7 + ox * 0.1);
    const sparkAlpha = Math.max(0, sparkPhase * 0.5 + 0.1);
    ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha})`;
    const sparkX = ox - size * 0.6 + seededRandom(ox + s) * size * 1.2;
    const sparkY = oy - size * 0.15 + seededRandom(ox + s + 10) * size * 0.3;
    const sparkSize = 1 + sparkAlpha * 2;
    // Star-shaped sparkle
    ctx.beginPath();
    ctx.moveTo(sparkX - sparkSize, sparkY);
    ctx.lineTo(sparkX, sparkY - sparkSize * 0.6);
    ctx.lineTo(sparkX + sparkSize, sparkY);
    ctx.lineTo(sparkX, sparkY + sparkSize * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  // Reeds/cattails at edges swaying
  for (let r = 0; r < 6; r++) {
    const rAngle = (r / 6) * Math.PI + 0.3;
    const rx = ox + Math.cos(rAngle) * size * 0.95;
    const ry = oy + Math.sin(rAngle) * size * 0.38;
    const reedSway = Math.sin(time * 2 + r * 1.2) * 2;
    // Reed stem
    ctx.strokeStyle = "#3a6a28";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + reedSway, ry - 10, rx + reedSway * 1.3, ry - 16);
    ctx.stroke();
    // Cattail head
    ctx.fillStyle = "#5a3a1a";
    ctx.beginPath();
    ctx.ellipse(rx + reedSway * 1.3, ry - 17, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small birds drinking at water edge
  const birdTime = time * 0.8;
  for (let b = 0; b < 2; b++) {
    const bAngle = b * 2.5 + 0.5;
    const bx = ox + Math.cos(bAngle) * size * 0.8;
    const by = oy + Math.sin(bAngle) * size * 0.32;
    const headDip = Math.sin(birdTime + b * 3) * 2;
    ctx.fillStyle = "#5a4a3a";
    // Bird body
    ctx.beginPath();
    ctx.ellipse(bx, by - 2, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head (dipping to drink)
    ctx.beginPath();
    ctx.arc(bx + 2.5, by - 2 + Math.max(0, headDip), 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.strokeStyle = "#8a6a30";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(bx + 3.5, by - 2 + Math.max(0, headDip));
    ctx.lineTo(bx + 5, by - 1 + Math.max(0, headDip));
    ctx.stroke();
  }
}

export function drawDesertCactus(
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
  scale: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const y = getY(yPct);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(
    x + 4 * scale,
    y + 3 * scale,
    10 * scale,
    3.5 * scale,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Main stem with cylindrical gradient
  const cactusGrad = ctx.createLinearGradient(
    x - 5 * scale,
    y,
    x + 5 * scale,
    y
  );
  cactusGrad.addColorStop(0, "#1a5a2a");
  cactusGrad.addColorStop(0.25, "#2a7a38");
  cactusGrad.addColorStop(0.5, "#3a8a4a");
  cactusGrad.addColorStop(0.75, "#2a7a38");
  cactusGrad.addColorStop(1, "#1a5a2a");
  ctx.fillStyle = cactusGrad;

  // Main body — rounder saguaro shape
  ctx.beginPath();
  ctx.moveTo(x - 5 * scale, y);
  ctx.bezierCurveTo(
    x - 6 * scale,
    y - 10 * scale,
    x - 5.5 * scale,
    y - 22 * scale,
    x - 4 * scale,
    y - 30 * scale
  );
  ctx.quadraticCurveTo(x, y - 34 * scale, x + 4 * scale, y - 30 * scale);
  ctx.bezierCurveTo(
    x + 5.5 * scale,
    y - 22 * scale,
    x + 6 * scale,
    y - 10 * scale,
    x + 5 * scale,
    y
  );
  ctx.closePath();
  ctx.fill();

  // Left arm — better proportioned
  const armGradL = ctx.createLinearGradient(
    x - 14 * scale,
    y - 18 * scale,
    x - 8 * scale,
    y - 18 * scale
  );
  armGradL.addColorStop(0, "#1a5a2a");
  armGradL.addColorStop(0.5, "#2d7a3a");
  armGradL.addColorStop(1, "#1a5a2a");
  ctx.fillStyle = armGradL;
  ctx.beginPath();
  ctx.moveTo(x - 4 * scale, y - 17 * scale);
  ctx.quadraticCurveTo(
    x - 12 * scale,
    y - 16 * scale,
    x - 13 * scale,
    y - 22 * scale
  );
  ctx.bezierCurveTo(
    x - 14 * scale,
    y - 28 * scale,
    x - 12 * scale,
    y - 31 * scale,
    x - 10 * scale,
    y - 30 * scale
  );
  ctx.quadraticCurveTo(
    x - 9 * scale,
    y - 27 * scale,
    x - 8 * scale,
    y - 22 * scale
  );
  ctx.quadraticCurveTo(
    x - 7 * scale,
    y - 19 * scale,
    x - 4 * scale,
    y - 21 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Right arm — better proportioned
  const armGradR = ctx.createLinearGradient(
    x + 8 * scale,
    y - 12 * scale,
    x + 14 * scale,
    y - 12 * scale
  );
  armGradR.addColorStop(0, "#1a5a2a");
  armGradR.addColorStop(0.5, "#2d7a3a");
  armGradR.addColorStop(1, "#1a5a2a");
  ctx.fillStyle = armGradR;
  ctx.beginPath();
  ctx.moveTo(x + 4 * scale, y - 11 * scale);
  ctx.quadraticCurveTo(
    x + 10 * scale,
    y - 10 * scale,
    x + 11 * scale,
    y - 16 * scale
  );
  ctx.bezierCurveTo(
    x + 12 * scale,
    y - 22 * scale,
    x + 10 * scale,
    y - 25 * scale,
    x + 8 * scale,
    y - 24 * scale
  );
  ctx.quadraticCurveTo(
    x + 7 * scale,
    y - 20 * scale,
    x + 6 * scale,
    y - 16 * scale
  );
  ctx.quadraticCurveTo(
    x + 5 * scale,
    y - 13 * scale,
    x + 4 * scale,
    y - 15 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Ridges on main body
  ctx.strokeStyle = "rgba(15, 60, 20, 0.3)";
  ctx.lineWidth = 0.5;
  for (let r = -2; r <= 2; r++) {
    ctx.beginPath();
    ctx.moveTo(x + r * 1.5 * scale, y - 1 * scale);
    ctx.bezierCurveTo(
      x + r * 1.4 * scale,
      y - 10 * scale,
      x + r * 1.2 * scale,
      y - 20 * scale,
      x + r * 0.8 * scale,
      y - 29 * scale
    );
    ctx.stroke();
  }

  // Visible spines — small lines radiating outward
  ctx.strokeStyle = "rgba(220, 210, 180, 0.5)";
  ctx.lineWidth = 0.4;
  for (let sp = 0; sp < 16; sp++) {
    const spY = y - 3 * scale - sp * 1.9 * scale;
    const bodyWidth =
      5 * scale * (1 - Math.abs(sp * 1.9 * scale - 15 * scale) / (16 * scale));
    // Left spines
    ctx.beginPath();
    ctx.moveTo(x - bodyWidth, spY);
    ctx.lineTo(x - bodyWidth - 2.5 * scale, spY - 0.5 * scale);
    ctx.stroke();
    // Right spines
    ctx.beginPath();
    ctx.moveTo(x + bodyWidth, spY);
    ctx.lineTo(x + bodyWidth + 2.5 * scale, spY - 0.5 * scale);
    ctx.stroke();
  }
  // Spines on arms
  for (let sp = 0; sp < 4; sp++) {
    const lspY = y - 19 * scale - sp * 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 12 * scale, lspY);
    ctx.lineTo(x - 14.5 * scale, lspY - 1 * scale);
    ctx.stroke();
    const rspY = y - 13 * scale - sp * 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, rspY);
    ctx.lineTo(x + 12.5 * scale, rspY - 1 * scale);
    ctx.stroke();
  }

  // Multiple bloom flowers in different colors
  const flowerColors = [
    { inner: "#ffcc00", outer: "#ff6b9d" },
    { inner: "#ffe066", outer: "#ff9f43" },
    { inner: "#ffb6c1", outer: "#ee5a80" },
  ];
  // Top flower
  const fc0 = flowerColors[Math.floor(seededRandom(x + 1) * 3)];
  for (let p = 0; p < 5; p++) {
    const pAngle = (p / 5) * Math.PI * 2 + time * 0.3;
    ctx.fillStyle = fc0.outer;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(pAngle) * 2.5 * scale,
      y - 32 * scale + Math.sin(pAngle) * 2 * scale,
      2 * scale,
      1.2 * scale,
      pAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = fc0.inner;
  ctx.beginPath();
  ctx.arc(x, y - 32 * scale, 1.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Left arm flower
  const fc1 = flowerColors[Math.floor(seededRandom(x + 5) * 3)];
  for (let p = 0; p < 4; p++) {
    const pAngle = (p / 4) * Math.PI * 2 + time * 0.2;
    ctx.fillStyle = fc1.outer;
    ctx.beginPath();
    ctx.ellipse(
      x - 10 * scale + Math.cos(pAngle) * 2 * scale,
      y - 31 * scale + Math.sin(pAngle) * 1.5 * scale,
      1.8 * scale,
      1 * scale,
      pAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = fc1.inner;
  ctx.beginPath();
  ctx.arc(x - 10 * scale, y - 31 * scale, 1.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Right arm flower
  const fc2 = flowerColors[Math.floor(seededRandom(x + 9) * 3)];
  for (let p = 0; p < 4; p++) {
    const pAngle = (p / 4) * Math.PI * 2 - time * 0.25;
    ctx.fillStyle = fc2.outer;
    ctx.beginPath();
    ctx.ellipse(
      x + 8 * scale + Math.cos(pAngle) * 1.8 * scale,
      y - 25 * scale + Math.sin(pAngle) * 1.3 * scale,
      1.5 * scale,
      0.9 * scale,
      pAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = fc2.inner;
  ctx.beginPath();
  ctx.arc(x + 8 * scale, y - 25 * scale, 1 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCamel(
  dc: WorldMapDrawContext,
  cx: number,
  cyPct: number,
  scale: number,
  facing: number
) {
  const { ctx, getY } = dc;
  const cy = getY(cyPct);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, 1);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 12 * scale, 20 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (back pair, darker)
  ctx.fillStyle = "#9a7048";
  ctx.beginPath();
  ctx.moveTo(-9 * scale, 6 * scale);
  ctx.lineTo(-10 * scale, 16 * scale);
  ctx.lineTo(-7 * scale, 16 * scale);
  ctx.lineTo(-6 * scale, 6 * scale);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3 * scale, 6 * scale);
  ctx.lineTo(-4 * scale, 15 * scale);
  ctx.lineTo(-1 * scale, 15 * scale);
  ctx.lineTo(0, 6 * scale);
  ctx.fill();
  // Legs (front pair)
  ctx.fillStyle = "#a88050";
  ctx.beginPath();
  ctx.moveTo(5 * scale, 6 * scale);
  ctx.lineTo(4 * scale, 16 * scale);
  ctx.lineTo(7 * scale, 16 * scale);
  ctx.lineTo(8 * scale, 6 * scale);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10 * scale, 5 * scale);
  ctx.lineTo(10 * scale, 15 * scale);
  ctx.lineTo(13 * scale, 15 * scale);
  ctx.lineTo(13 * scale, 5 * scale);
  ctx.fill();
  // Hooves
  ctx.fillStyle = "#4a3520";
  for (const hx of [-10, -4, 4, 10]) {
    ctx.beginPath();
    ctx.ellipse(
      hx * scale + 1.5 * scale,
      16 * scale,
      2 * scale,
      1 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Body with detailed fur gradient
  const camelGrad = ctx.createLinearGradient(
    -14 * scale,
    -8 * scale,
    14 * scale,
    8 * scale
  );
  camelGrad.addColorStop(0, "#b89060");
  camelGrad.addColorStop(0.3, "#d4b888");
  camelGrad.addColorStop(0.7, "#c8a878");
  camelGrad.addColorStop(1, "#a88050");
  ctx.fillStyle = camelGrad;
  ctx.beginPath();
  ctx.moveTo(-14 * scale, 2 * scale);
  ctx.bezierCurveTo(
    -16 * scale,
    -4 * scale,
    -12 * scale,
    -8 * scale,
    -6 * scale,
    -8 * scale
  );
  ctx.lineTo(10 * scale, -6 * scale);
  ctx.bezierCurveTo(
    14 * scale,
    -5 * scale,
    16 * scale,
    0,
    14 * scale,
    6 * scale
  );
  ctx.lineTo(-12 * scale, 6 * scale);
  ctx.bezierCurveTo(
    -15 * scale,
    5 * scale,
    -15 * scale,
    3 * scale,
    -14 * scale,
    2 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Hump — distinct shape
  ctx.fillStyle = "#c4a070";
  ctx.beginPath();
  ctx.moveTo(-8 * scale, -8 * scale);
  ctx.bezierCurveTo(
    -6 * scale,
    -18 * scale,
    2 * scale,
    -18 * scale,
    4 * scale,
    -8 * scale
  );
  ctx.closePath();
  ctx.fill();
  // Hump highlight
  ctx.fillStyle = "rgba(220, 190, 140, 0.3)";
  ctx.beginPath();
  ctx.bezierCurveTo(
    -4 * scale,
    -16 * scale,
    0,
    -16 * scale,
    2 * scale,
    -10 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Belly fur texture
  ctx.strokeStyle = "rgba(160, 120, 70, 0.2)";
  ctx.lineWidth = 0.4;
  for (let bf = 0; bf < 4; bf++) {
    const bfx = -8 * scale + bf * 5 * scale;
    ctx.beginPath();
    ctx.moveTo(bfx, 4 * scale);
    ctx.lineTo(bfx + 1 * scale, 6 * scale);
    ctx.stroke();
  }

  // Neck — curved and natural
  ctx.fillStyle = "#c8a878";
  ctx.beginPath();
  ctx.moveTo(12 * scale, -4 * scale);
  ctx.bezierCurveTo(
    16 * scale,
    -8 * scale,
    20 * scale,
    -16 * scale,
    18 * scale,
    -24 * scale
  );
  ctx.lineTo(15 * scale, -24 * scale);
  ctx.bezierCurveTo(
    16 * scale,
    -16 * scale,
    14 * scale,
    -8 * scale,
    10 * scale,
    -2 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Head — elongated camel head shape
  const headGrad = ctx.createLinearGradient(
    14 * scale,
    -28 * scale,
    24 * scale,
    -22 * scale
  );
  headGrad.addColorStop(0, "#d0b080");
  headGrad.addColorStop(1, "#b89868");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(15 * scale, -24 * scale);
  ctx.bezierCurveTo(
    14 * scale,
    -28 * scale,
    20 * scale,
    -30 * scale,
    24 * scale,
    -26 * scale
  );
  ctx.bezierCurveTo(
    25 * scale,
    -24 * scale,
    22 * scale,
    -22 * scale,
    18 * scale,
    -22 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Snout/mouth
  ctx.fillStyle = "#a88060";
  ctx.beginPath();
  ctx.ellipse(
    24 * scale,
    -25 * scale,
    3 * scale,
    2 * scale,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Nostril
  ctx.fillStyle = "#5a4030";
  ctx.beginPath();
  ctx.arc(25.5 * scale, -24.5 * scale, 0.6 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Eye
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.arc(20 * scale, -27 * scale, 1.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(20.3 * scale, -27.3 * scale, 0.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Ear
  ctx.fillStyle = "#b89060";
  ctx.beginPath();
  ctx.ellipse(
    17 * scale,
    -29 * scale,
    1.5 * scale,
    3 * scale,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Saddle/cargo bags on hump
  ctx.fillStyle = "#8b3a3a";
  ctx.beginPath();
  ctx.moveTo(-6 * scale, -14 * scale);
  ctx.lineTo(2 * scale, -14 * scale);
  ctx.lineTo(3 * scale, -10 * scale);
  ctx.lineTo(-7 * scale, -10 * scale);
  ctx.closePath();
  ctx.fill();
  // Saddle blanket pattern
  ctx.fillStyle = "#c46030";
  ctx.fillRect(-5 * scale, -13 * scale, 6 * scale, 2 * scale);
  ctx.fillStyle = "#e8b830";
  ctx.fillRect(-4 * scale, -12.5 * scale, 4 * scale, 1 * scale);
  // Cargo bags (hanging on sides)
  ctx.fillStyle = "#6a4a2a";
  ctx.beginPath();
  ctx.moveTo(-7 * scale, -10 * scale);
  ctx.lineTo(-9 * scale, -4 * scale);
  ctx.lineTo(-6 * scale, -4 * scale);
  ctx.lineTo(-5 * scale, -10 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2 * scale, -10 * scale);
  ctx.lineTo(4 * scale, -4 * scale);
  ctx.lineTo(1 * scale, -4 * scale);
  ctx.lineTo(0, -10 * scale);
  ctx.closePath();
  ctx.fill();
  // Bag strap detail
  ctx.strokeStyle = "#4a3018";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-7 * scale, -7 * scale);
  ctx.lineTo(-5 * scale, -7 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1 * scale, -7 * scale);
  ctx.lineTo(3 * scale, -7 * scale);
  ctx.stroke();

  // Rope lead (halter) from nose
  ctx.strokeStyle = "#6a5030";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24 * scale, -24 * scale);
  ctx.quadraticCurveTo(28 * scale, -18 * scale, 26 * scale, -10 * scale);
  ctx.stroke();

  // Tail
  ctx.strokeStyle = "#9a7048";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-14 * scale, 0);
  ctx.quadraticCurveTo(-18 * scale, -2 * scale, -20 * scale, 2 * scale);
  ctx.stroke();
  // Tail tuft
  ctx.fillStyle = "#7a5838";
  ctx.beginPath();
  ctx.arc(-20 * scale, 2 * scale, 1.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawDesertCamp(
  dc: WorldMapDrawContext,
  cx: number,
  cyPct: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const cy = getY(cyPct);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 32, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Carpet/rug in front of entrance
  const carpetGrad = ctx.createLinearGradient(
    cx - 18,
    cy + 5,
    cx + 18,
    cy + 12
  );
  carpetGrad.addColorStop(0, "#8b2020");
  carpetGrad.addColorStop(0.5, "#a83030");
  carpetGrad.addColorStop(1, "#8b2020");
  ctx.fillStyle = carpetGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy + 5);
  ctx.lineTo(cx + 16, cy + 5);
  ctx.lineTo(cx + 18, cy + 12);
  ctx.lineTo(cx - 18, cy + 12);
  ctx.closePath();
  ctx.fill();
  // Carpet patterns — intricate geometric
  ctx.strokeStyle = "#d4a030";
  ctx.lineWidth = 0.7;
  // Border lines
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy + 6.5);
  ctx.lineTo(cx + 14, cy + 6.5);
  ctx.moveTo(cx - 15, cy + 10.5);
  ctx.lineTo(cx + 15, cy + 10.5);
  ctx.stroke();
  // Diamond pattern in center
  ctx.strokeStyle = "#e8c050";
  ctx.lineWidth = 0.5;
  for (let d = 0; d < 4; d++) {
    const ddx = cx - 9 + d * 6;
    const ddy = cy + 8.5;
    ctx.beginPath();
    ctx.moveTo(ddx, ddy - 1.5);
    ctx.lineTo(ddx + 2, ddy);
    ctx.lineTo(ddx, ddy + 1.5);
    ctx.lineTo(ddx - 2, ddy);
    ctx.closePath();
    ctx.stroke();
  }

  // Tent body — ornate Bedouin shape with side drapes
  const tentGrad = ctx.createLinearGradient(cx - 24, cy - 22, cx + 24, cy + 5);
  tentGrad.addColorStop(0, "#f5e6c8");
  tentGrad.addColorStop(0.3, "#eddcb8");
  tentGrad.addColorStop(0.7, "#e0ccA0");
  tentGrad.addColorStop(1, "#c8b090");
  ctx.fillStyle = tentGrad;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 24);
  ctx.bezierCurveTo(cx + 8, cy - 20, cx + 20, cy - 8, cx + 26, cy + 5);
  ctx.lineTo(cx - 26, cy + 5);
  ctx.bezierCurveTo(cx - 20, cy - 8, cx - 8, cy - 20, cx, cy - 24);
  ctx.closePath();
  ctx.fill();

  // Tent colorful stripe bands — woven pattern
  const stripeColors = ["#b8432f", "#2a6a8a", "#d4a030", "#6a3a7a"];
  for (let s = 0; s < 4; s++) {
    const stripeY = cy - 17 + s * 6;
    const sw = 20 - s * 3;
    ctx.fillStyle = stripeColors[s];
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - sw, stripeY);
    ctx.lineTo(cx + sw, stripeY);
    ctx.lineTo(cx + sw - 1, stripeY + 2);
    ctx.lineTo(cx - sw + 1, stripeY + 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Zigzag decorative line on tent
  ctx.strokeStyle = "#d4a030";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let z = 0; z < 8; z++) {
    const zx = cx - 14 + z * 4;
    const zy = cy - 5 + (z % 2 === 0 ? 0 : 2);
    if (z === 0) {
      ctx.moveTo(zx, zy);
    } else {
      ctx.lineTo(zx, zy);
    }
  }
  ctx.stroke();

  // Tent opening — dark interior with fabric drapes
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.quadraticCurveTo(cx - 3, cy - 6, cx, cy - 10);
  ctx.quadraticCurveTo(cx + 3, cy - 6, cx + 6, cy + 5);
  ctx.closePath();
  ctx.fill();
  // Fabric drape on opening edges
  ctx.strokeStyle = "#c8a870";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 5);
  ctx.quadraticCurveTo(cx - 3, cy - 5, cx, cy - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy + 5);
  ctx.quadraticCurveTo(cx + 3, cy - 5, cx, cy - 10);
  ctx.stroke();

  // Golden finial at peak
  ctx.fillStyle = `rgba(255, 200, 50, ${0.85 + Math.sin(time * 3) * 0.15})`;
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 240, 180, 0.5)";
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 2, 0, Math.PI * 2);
  ctx.fill();

  // Hanging lanterns with warm glow
  const lanternPositions = [
    { x: cx - 18, y: cy - 8 },
    { x: cx + 18, y: cy - 8 },
    { x: cx - 10, y: cy - 15 },
    { x: cx + 10, y: cy - 15 },
  ];
  lanternPositions.forEach((lp, li) => {
    // Rope/string to tent
    ctx.strokeStyle = "#6a5030";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y - 4);
    ctx.lineTo(lp.x, lp.y - 7);
    ctx.stroke();
    // Lantern body
    ctx.fillStyle = "#c8a050";
    ctx.beginPath();
    ctx.moveTo(lp.x - 2, lp.y - 4);
    ctx.lineTo(lp.x + 2, lp.y - 4);
    ctx.lineTo(lp.x + 1.5, lp.y + 1);
    ctx.lineTo(lp.x - 1.5, lp.y + 1);
    ctx.closePath();
    ctx.fill();
    // Lantern glass/glow
    const lanternGlow = 0.5 + Math.sin(time * 4 + li * 1.5) * 0.2;
    ctx.fillStyle = `rgba(255, 200, 80, ${lanternGlow})`;
    ctx.beginPath();
    ctx.ellipse(lp.x, lp.y - 1.5, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Warm glow aura
    const auraGrad = ctx.createRadialGradient(
      lp.x,
      lp.y - 1,
      0,
      lp.x,
      lp.y - 1,
      8
    );
    auraGrad.addColorStop(0, `rgba(255, 180, 60, ${lanternGlow * 0.3})`);
    auraGrad.addColorStop(1, "rgba(255, 150, 40, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(lp.x, lp.y - 1, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Campfire with animated flames (larger, more vivid)
  const fireX = cx + 32;
  const fireY = cy + 2;
  // Fire pit stones
  ctx.fillStyle = "#4a3a30";
  for (let st = 0; st < 8; st++) {
    const stAngle = (st / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      fireX + Math.cos(stAngle) * 7,
      fireY + 3 + Math.sin(stAngle) * 3,
      2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  // Ember bed
  ctx.fillStyle = "rgba(200, 80, 20, 0.6)";
  ctx.beginPath();
  ctx.ellipse(fireX, fireY + 3, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Animated flames — multi-layered
  for (let f = 0; f < 7; f++) {
    const fh = 14 + Math.sin(time * 9 + f * 1.4) * 6;
    const fw = 2.5 + Math.sin(time * 7 + f * 0.8) * 1;
    const fx = fireX - 7 + f * 2.2;
    const red = 255;
    const green = Math.floor(80 + f * 25 + Math.sin(time * 6 + f) * 20);
    ctx.fillStyle = `rgba(${red}, ${green}, 15, ${0.85 - f * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(fx - fw, fireY + 1);
    ctx.bezierCurveTo(
      fx - fw * 0.5,
      fireY - fh * 0.4,
      fx + fw * 0.5,
      fireY - fh * 0.7,
      fx,
      fireY - fh
    );
    ctx.bezierCurveTo(
      fx + fw * 0.3,
      fireY - fh * 0.5,
      fx + fw,
      fireY - fh * 0.2,
      fx + fw,
      fireY + 1
    );
    ctx.closePath();
    ctx.fill();
  }
  // Sparks rising
  for (let sp = 0; sp < 4; sp++) {
    const sparkLife = (time * 3 + sp * 2.1) % 4;
    const sparkAlpha = Math.max(0, 1 - sparkLife * 0.3);
    ctx.fillStyle = `rgba(255, ${150 + sp * 20}, 40, ${sparkAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      fireX - 3 + seededRandom(sp + 50) * 6 + Math.sin(time * 2 + sp) * 3,
      fireY - 10 - sparkLife * 8,
      0.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  // Fire glow
  const glowGrad = ctx.createRadialGradient(
    fireX,
    fireY - 6,
    0,
    fireX,
    fireY - 6,
    25
  );
  glowGrad.addColorStop(0, "rgba(255, 140, 40, 0.35)");
  glowGrad.addColorStop(0.5, "rgba(255, 100, 20, 0.1)");
  glowGrad.addColorStop(1, "rgba(255, 80, 10, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(fireX, fireY - 6, 25, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBurningWreck(
  dc: WorldMapDrawContext,
  wx: number,
  wyPct: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const wy = getY(wyPct);

  // Scorch mark on ground
  ctx.fillStyle = "rgba(30, 20, 10, 0.25)";
  ctx.beginPath();
  ctx.ellipse(wx, wy + 8, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Charred base structure
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(wx - 13, wy + 4);
  ctx.lineTo(wx - 10, wy - 6);
  ctx.lineTo(wx + 10, wy - 5);
  ctx.lineTo(wx + 13, wy + 4);
  ctx.closePath();
  ctx.fill();
  // Upper debris
  ctx.fillStyle = "#3a2815";
  ctx.beginPath();
  ctx.moveTo(wx - 9, wy - 5);
  ctx.lineTo(wx - 6, wy - 12);
  ctx.lineTo(wx + 7, wy - 11);
  ctx.lineTo(wx + 9, wy - 5);
  ctx.closePath();
  ctx.fill();
  // Broken beam
  ctx.fillStyle = "#1a0e05";
  ctx.save();
  ctx.translate(wx + 5, wy - 8);
  ctx.rotate(0.3);
  ctx.fillRect(-1.5, -8, 3, 10);
  ctx.restore();

  // Multi-color flames (orange core, yellow tips, red base)
  for (let i = 0; i < 5; i++) {
    const fx = wx - 8 + i * 4;
    const fh = 12 + Math.sin(time * 8 + i * 2.1) * 5;
    const fhInner = fh * 0.7;
    // Red base flame
    ctx.fillStyle = `rgba(200, 50, 10, ${0.6 + Math.sin(time * 6 + i * 1.3) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(fx - 3.5, wy - 10);
    ctx.bezierCurveTo(
      fx - 2,
      wy - 10 - fh * 0.5,
      fx + 2,
      wy - 10 - fh * 0.7,
      fx,
      wy - 10 - fh
    );
    ctx.bezierCurveTo(
      fx + 2,
      wy - 10 - fh * 0.5,
      fx + 3.5,
      wy - 10 - fh * 0.3,
      fx + 3.5,
      wy - 10
    );
    ctx.closePath();
    ctx.fill();
    // Orange middle
    ctx.fillStyle = `rgba(255, ${120 + i * 25}, 20, ${0.7 + Math.sin(time * 7 + i) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(fx - 2.5, wy - 10);
    ctx.bezierCurveTo(
      fx - 1,
      wy - 10 - fhInner * 0.5,
      fx + 1,
      wy - 10 - fhInner * 0.8,
      fx,
      wy - 10 - fhInner
    );
    ctx.bezierCurveTo(
      fx + 1,
      wy - 10 - fhInner * 0.4,
      fx + 2.5,
      wy - 10 - fhInner * 0.2,
      fx + 2.5,
      wy - 10
    );
    ctx.closePath();
    ctx.fill();
    // Yellow tip
    const tipH = fh * 0.35;
    ctx.fillStyle = `rgba(255, 255, 80, ${0.5 + Math.sin(time * 9 + i * 1.7) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(fx - 1, wy - 10 - fh * 0.5);
    ctx.quadraticCurveTo(
      fx,
      wy - 10 - fh - tipH * 0.3,
      fx + 1,
      wy - 10 - fh * 0.5
    );
    ctx.fill();
  }

  // Rising smoke
  for (let s = 0; s < 3; s++) {
    const smokeLife = (time * 1.5 + s * 1.8) % 5;
    const smokeAlpha = Math.max(0, 0.2 - smokeLife * 0.04);
    const smokeSize = 3 + smokeLife * 3;
    ctx.fillStyle = `rgba(80, 70, 60, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(
      wx - 2 + Math.sin(time + s * 2) * 5 + s * 2,
      wy - 22 - smokeLife * 10,
      smokeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Floating embers
  for (let e = 0; e < 4; e++) {
    const emberLife = (time * 4 + e * 1.6) % 3;
    const emberAlpha = Math.max(0, 0.8 - emberLife * 0.3);
    ctx.fillStyle = `rgba(255, ${100 + e * 40}, 20, ${emberAlpha})`;
    ctx.beginPath();
    ctx.arc(
      wx - 5 + seededRandom(wx + e) * 10 + Math.sin(time * 3 + e) * 4,
      wy - 14 - emberLife * 12,
      0.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Heat distortion glow around wreck
  const heatGlow = ctx.createRadialGradient(wx, wy - 8, 0, wx, wy - 8, 22);
  heatGlow.addColorStop(
    0,
    `rgba(255, 120, 30, ${0.12 + Math.sin(time * 3) * 0.04})`
  );
  heatGlow.addColorStop(1, "rgba(255, 80, 10, 0)");
  ctx.fillStyle = heatGlow;
  ctx.beginPath();
  ctx.arc(wx, wy - 8, 22, 0, Math.PI * 2);
  ctx.fill();
}
