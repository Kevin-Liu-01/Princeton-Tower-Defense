// Princeton Tower Defense - Decoration Item Rendering
// Contains all decoration rendering switch cases for various decoration types

import type { DecorationType, Position } from "../../types";

export interface DecorationRenderParams {
  ctx: CanvasRenderingContext2D;
  screenPos: Position;
  scale: number;
  type: DecorationType;
  rotation: number;
  variant: number;
  decorTime: number;
  decorX: number; // Original decoration x position for seeding
  selectedMap: string;
}

/**
 * Draws an organic blob shape instead of a perfect ellipse.
 * Uses multi-frequency sine wave noise (matching hazard drawOrganicBlob pattern)
 * to create natural-looking edges for water features.
 */
function drawOrganicWaterShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  bumpiness: number = 0.12
): void {
  ctx.beginPath();
  const pts = 24;
  for (let i = 0; i <= pts; i++) {
    const ang = (i / pts) * Math.PI * 2;
    const n1 = Math.sin(ang * 3 + seed) * bumpiness;
    const n2 = Math.sin(ang * 5 + seed * 2.3) * bumpiness * 0.5;
    const n3 = Math.sin(ang * 7 + seed * 4.1) * bumpiness * 0.25;
    const variation = 1 + n1 + n2 + n3;
    const x = cx + Math.cos(ang) * rx * variation;
    const y = cy + Math.sin(ang) * ry * variation;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Renders a single decoration item based on its type.
 * This function contains all the rendering logic for every decoration type in the game.
 */
export function renderDecorationItem(params: DecorationRenderParams): void {
  const { ctx, screenPos, scale: s, type, rotation, variant, decorTime, decorX, selectedMap } = params;

  // Create a local reference to avoid repetitive params access
  const dec = { x: decorX }; // Used for seeding animations

  switch (type) {
    // === GRASSLAND DECORATIONS ===
    case "tree": {
      // Enhanced 3D isometric tree with detailed foliage and bark
      const treeVariants = [
        { trunk: "#5d4037", trunkDark: "#3e2723", foliage: ["#2e7d32", "#388e3c", "#43a047", "#4caf50"] },
        { trunk: "#4a3728", trunkDark: "#2d1f14", foliage: ["#1b5e20", "#2e7d32", "#388e3c", "#33691e"] },
        { trunk: "#6d4c41", trunkDark: "#4e342e", foliage: ["#33691e", "#558b2f", "#689f38", "#7cb342"] },
        { trunk: "#5d4037", trunkDark: "#3e2723", foliage: ["#4a6741", "#5a7751", "#6a8761", "#7a9771"] },
      ];
      const tv = treeVariants[variant % 4];

      // Ground shadow with gradient
      const shadowGrad = ctx.createRadialGradient(
        screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
        screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s
      );
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
      shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.15)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk with 3D isometric faces
      // Left face (shadow)
      ctx.fillStyle = tv.trunkDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 24 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Right face (lit)
      const trunkGrad = ctx.createLinearGradient(
        screenPos.x, screenPos.y, screenPos.x + 6 * s, screenPos.y
      );
      trunkGrad.addColorStop(0, tv.trunk);
      trunkGrad.addColorStop(1, tv.trunkDark);
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 24 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Bark texture lines
      ctx.strokeStyle = tv.trunkDark;
      ctx.lineWidth = 0.8 * s;
      for (let i = 0; i < 5; i++) {
        const barkY = screenPos.y - 5 * s - i * 5 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 3 * s, barkY + Math.sin(i) * 2 * s);
        ctx.lineTo(screenPos.x + 3 * s, barkY - Math.sin(i + 1) * 2 * s);
        ctx.stroke();
      }

      // Visible roots at base
      ctx.fillStyle = tv.trunkDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tv.trunk;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main foliage body - layered 3D clusters
      const foliageLayers = [
        { y: -18, rx: 26, ry: 14, color: tv.foliage[0] },
        { y: -24, rx: 24, ry: 13, color: tv.foliage[1] },
        { y: -30, rx: 20, ry: 11, color: tv.foliage[2] },
        { y: -35, rx: 14, ry: 8, color: tv.foliage[3] },
      ];

      // Draw foliage with gradient shading
      foliageLayers.forEach((layer, idx) => {
        // Shadow underneath each layer
        if (idx === 0) {
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + layer.y * s + 3 * s, layer.rx * s, layer.ry * s * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main foliage blob with gradient
        const foliageGrad = ctx.createRadialGradient(
          screenPos.x - layer.rx * 0.3 * s, screenPos.y + layer.y * s - layer.ry * 0.3 * s, 0,
          screenPos.x, screenPos.y + layer.y * s, layer.rx * s
        );
        foliageGrad.addColorStop(0, tv.foliage[Math.min(idx + 1, 3)]);
        foliageGrad.addColorStop(0.7, layer.color);
        foliageGrad.addColorStop(1, tv.foliage[0]);
        ctx.fillStyle = foliageGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + layer.y * s, layer.rx * s, layer.ry * s, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add leaf cluster details for depth
      const leafClusters = [
        { x: -15, y: -20, r: 8 }, { x: 12, y: -22, r: 7 },
        { x: -8, y: -28, r: 6 }, { x: 10, y: -30, r: 6 },
        { x: 0, y: -38, r: 5 }, { x: -12, y: -32, r: 5 },
      ];
      leafClusters.forEach((lc, i) => {
        const clusterGrad = ctx.createRadialGradient(
          screenPos.x + lc.x * s, screenPos.y + lc.y * s, 0,
          screenPos.x + lc.x * s, screenPos.y + lc.y * s, lc.r * s
        );
        clusterGrad.addColorStop(0, tv.foliage[3]);
        clusterGrad.addColorStop(0.5, tv.foliage[2]);
        clusterGrad.addColorStop(1, tv.foliage[1]);
        ctx.fillStyle = clusterGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x + lc.x * s, screenPos.y + lc.y * s, lc.r * s, lc.r * 0.6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Highlight spots on top
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 5 * s, screenPos.y - 34 * s, 5 * s, 3 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 8 * s, screenPos.y - 26 * s, 4 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();


      break;
    }
    case "rock": {
      // Enhanced 3D isometric rock with detailed texture and moss
      const rockVariants = [
        { base: "#6d4c41", mid: "#8d6e63", light: "#a1887f", dark: "#4e342e", moss: "#4a6741" },
        { base: "#5d4037", mid: "#795548", light: "#8d6e63", dark: "#3e2723", moss: "#2e7d32" },
        { base: "#757575", mid: "#9e9e9e", light: "#bdbdbd", dark: "#424242", moss: "#455a64" },
        { base: "#616161", mid: "#757575", light: "#9e9e9e", dark: "#424242", moss: "#37474f" },
      ];
      const rv = rockVariants[variant % 4];

      // Ground shadow with soft edge
      const rockShadowGrad = ctx.createRadialGradient(
        screenPos.x + 3 * s, screenPos.y + 5 * s, 0,
        screenPos.x + 3 * s, screenPos.y + 5 * s, 18 * s
      );
      rockShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
      rockShadowGrad.addColorStop(0.7, "rgba(0,0,0,0.1)");
      rockShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rockShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 5 * s, 18 * s, 9 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Main rock body - proper isometric 3D shape
      // Key vertices for consistent isometric rock:
      // topPeak: (0, -16) - highest point
      // topLeft: (-8, -12) - top left corner
      // topRight: (+10, -10) - top right corner  
      // frontPeak: (0, -2) - front edge where faces meet
      // bottomLeft: (-12, +2) - bottom left
      // bottomRight: (+12, +4) - bottom right

      // Top face (brightest - faces up)
      const topFaceGrad = ctx.createLinearGradient(
        screenPos.x - 8 * s, screenPos.y - 14 * s, screenPos.x + 10 * s, screenPos.y - 8 * s
      );
      topFaceGrad.addColorStop(0, rv.light);
      topFaceGrad.addColorStop(1, rv.mid);
      ctx.fillStyle = topFaceGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 12 * s);   // topLeft
      ctx.lineTo(screenPos.x, screenPos.y - 16 * s);           // topPeak
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 10 * s);  // topRight
      ctx.lineTo(screenPos.x, screenPos.y - 6 * s);            // center point
      ctx.closePath();
      ctx.fill();

      // Front face (medium - faces viewer)
      const frontFaceGrad = ctx.createLinearGradient(
        screenPos.x - 12 * s, screenPos.y - 8 * s, screenPos.x + 4 * s, screenPos.y + 4 * s
      );
      frontFaceGrad.addColorStop(0, rv.mid);
      frontFaceGrad.addColorStop(0.5, rv.base);
      frontFaceGrad.addColorStop(1, rv.dark);
      ctx.fillStyle = frontFaceGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 12 * s);   // topLeft
      ctx.lineTo(screenPos.x, screenPos.y - 6 * s);            // center point
      ctx.lineTo(screenPos.x, screenPos.y + 2 * s);            // frontPeak
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y + 2 * s);   // bottomLeft
      ctx.closePath();
      ctx.fill();

      // Right side face (darkest - faces right/away)
      const rightFaceGrad = ctx.createLinearGradient(
        screenPos.x, screenPos.y - 10 * s, screenPos.x + 12 * s, screenPos.y + 2 * s
      );
      rightFaceGrad.addColorStop(0, rv.base);
      rightFaceGrad.addColorStop(0.6, rv.dark);
      rightFaceGrad.addColorStop(1, rv.dark);
      ctx.fillStyle = rightFaceGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, screenPos.y - 10 * s);  // topRight
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 4 * s);   // bottomRight
      ctx.lineTo(screenPos.x, screenPos.y + 2 * s);            // frontPeak
      ctx.lineTo(screenPos.x, screenPos.y - 6 * s);            // center point
      ctx.closePath();
      ctx.fill();

      // Stone texture - cracks and facets
      ctx.strokeStyle = rv.dark;
      ctx.lineWidth = 0.8 * s;
      // Crack on front face
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y);
      ctx.stroke();
      // Crack on right face
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 6 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 2 * s);
      ctx.stroke();
      // Crack on top face
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 9 * s);
      ctx.stroke();

      // Highlight on top edges
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 16 * s);
      ctx.lineTo(screenPos.x + 9 * s, screenPos.y - 10 * s);
      ctx.stroke();

      // Moss patches (on some variants)
      if (variant === 0 || variant === 1) {
        ctx.fillStyle = rv.moss;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 5 * s, 4 * s, 2 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screenPos.x + 5 * s, screenPos.y - 2 * s, 3 * s, 1.5 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Small pebbles around base
      ctx.fillStyle = rv.mid;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 12 * s, screenPos.y + 4 * s, 2 * s, 1.2 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rv.dark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 12 * s, screenPos.y + 3 * s, 1.5 * s, 1 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "nassau_hall": {
      // Unique Princeton Landmark - High Detail Ornate Version
      const nx = screenPos.x;
      const ny = screenPos.y;

      // 1. Ground Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(nx, ny + 12 * s, 70 * s, 28 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Define key measurements
      const foundY = ny + 8 * s;
      const wallY = ny - 28 * s;
      const wallH = 36 * s;
      const pedimentY = wallY - 9 * s;

      // ============================================================
      // BACKGROUND ELEMENTS (Draw first - appear behind)
      // ============================================================

      // 2. The Cupola & Spire (BEHIND the main building)
      const cupolaY = pedimentY - 14 * s; // Moved down to be behind pediment

      // Cupola base
      ctx.fillStyle = "#D7CCC8";
      ctx.fillRect(nx - 9 * s, cupolaY - 4 * s, 18 * s, 4 * s);

      // Cupola main body
      const cupolaGrad = ctx.createLinearGradient(nx - 7 * s, cupolaY - 22 * s, nx + 7 * s, cupolaY - 4 * s);
      cupolaGrad.addColorStop(0, "#E0E0E0");
      cupolaGrad.addColorStop(0.3, "#FAFAFA");
      cupolaGrad.addColorStop(0.7, "#FAFAFA");
      cupolaGrad.addColorStop(1, "#E0E0E0");
      ctx.fillStyle = cupolaGrad;
      ctx.fillRect(nx - 7 * s, cupolaY - 22 * s, 14 * s, 18 * s);

      // Cupola arched openings with pillars between
      const archSpacing = 7 * s; // More space between arches for pillars
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.arc(nx + i * archSpacing, cupolaY - 14 * s, 2 * s, Math.PI, 0);
        ctx.fillRect(nx + i * archSpacing - 2 * s, cupolaY - 14 * s, 4 * s, 7 * s);
        ctx.fill();
      }
      // Pillar details between arches
      ctx.fillStyle = "#E8E8E8";
      ctx.fillRect(nx - archSpacing + 2.5 * s, cupolaY - 16 * s, 2 * s, 10 * s);
      ctx.fillRect(nx + archSpacing - 4.5 * s, cupolaY - 16 * s, 2 * s, 10 * s);
      ctx.fillRect(nx - 1 * s, cupolaY - 16 * s, 2 * s, 10 * s); // Center pillars
      ctx.fillRect(nx + 3 * s, cupolaY - 16 * s, 2 * s, 10 * s);

      // Cupola cornice
      ctx.fillStyle = "#BCAAA4";
      ctx.fillRect(nx - 8 * s, cupolaY - 24 * s, 16 * s, 2 * s);

      // Cupola roof (dome)
      const cupolaRoofY = cupolaY - 24 * s;
      ctx.fillStyle = "#4A7C59";
      ctx.beginPath();
      ctx.moveTo(nx - 8 * s, cupolaRoofY);
      ctx.quadraticCurveTo(nx - 6 * s, cupolaRoofY - 12 * s, nx, cupolaRoofY - 16 * s);
      ctx.quadraticCurveTo(nx + 6 * s, cupolaRoofY - 12 * s, nx + 8 * s, cupolaRoofY);
      ctx.fill();
      ctx.strokeStyle = "#5D8A6B";
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();

      // Golden spire
      const spireY = cupolaRoofY - 16 * s;
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(nx - 1.5 * s, spireY);
      ctx.lineTo(nx, spireY - 16 * s);
      ctx.lineTo(nx + 1.5 * s, spireY);
      ctx.closePath();
      ctx.fill();

      // Spire orb
      ctx.fillStyle = "#FFC107";
      ctx.beginPath();
      ctx.arc(nx, spireY - 3 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(nx - 0.8 * s, spireY - 3.8 * s, 1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Princeton Flag on Spire (Orange and Black)
      ctx.save();
      ctx.translate(nx + 1.5 * s, spireY - 12 * s);
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 0.6 * s;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8 * s, 0);
      ctx.stroke();
      // Orange field
      ctx.fillStyle = "#F97316";
      ctx.fillRect(1 * s, -5 * s, 7 * s, 5 * s);
      // Black stripe
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(1 * s, -3.5 * s, 7 * s, 2 * s);
      ctx.restore();

      // 3. Wing Buildings (BEHIND the central pavilion)
      // Left wing wall gradient
      const leftWallGrad = ctx.createLinearGradient(nx - 52 * s, wallY, nx - 18 * s, wallY);
      leftWallGrad.addColorStop(0, "#7D5E53");
      leftWallGrad.addColorStop(0.3, "#8D6E63");
      leftWallGrad.addColorStop(0.7, "#A1887F");
      leftWallGrad.addColorStop(1, "#8D6E63");
      ctx.fillStyle = leftWallGrad;
      ctx.fillRect(nx - 52 * s, wallY + 4 * s, 34 * s, wallH - 4 * s);

      // Right wing wall gradient
      const rightWallGrad = ctx.createLinearGradient(nx + 18 * s, wallY, nx + 52 * s, wallY);
      rightWallGrad.addColorStop(0, "#8D6E63");
      rightWallGrad.addColorStop(0.3, "#A1887F");
      rightWallGrad.addColorStop(0.7, "#8D6E63");
      rightWallGrad.addColorStop(1, "#7D5E53");
      ctx.fillStyle = rightWallGrad;
      ctx.fillRect(nx + 18 * s, wallY + 4 * s, 34 * s, wallH - 4 * s);

      // Brick/Stone Detail Lines on wings
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.5 * s;
      for (let row = 1; row < 5; row++) {
        const rowY = wallY + 4 * s + ((wallH - 4 * s) / 5) * row;
        ctx.beginPath();
        ctx.moveTo(nx - 52 * s, rowY);
        ctx.lineTo(nx - 18 * s, rowY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(nx + 18 * s, rowY);
        ctx.lineTo(nx + 52 * s, rowY);
        ctx.stroke();
      }

      // Decorative Cornice on wings
      ctx.fillStyle = "#BCAAA4";
      ctx.fillRect(nx - 54 * s, wallY + 1 * s, 36 * s, 3 * s);
      ctx.fillRect(nx + 18 * s, wallY + 1 * s, 36 * s, 3 * s);

      // Wing Roofs
      const roofGradL = ctx.createLinearGradient(nx - 54 * s, wallY - 8 * s, nx - 18 * s, wallY + 1 * s);
      roofGradL.addColorStop(0, "#3D6B4A");
      roofGradL.addColorStop(0.5, "#4A7C59");
      roofGradL.addColorStop(1, "#5D8A6B");
      ctx.fillStyle = roofGradL;
      ctx.beginPath();
      ctx.moveTo(nx - 56 * s, wallY + 1 * s);
      ctx.lineTo(nx - 36 * s, wallY - 10 * s);
      ctx.lineTo(nx - 16 * s, wallY + 1 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5D8A6B";
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();

      const roofGradR = ctx.createLinearGradient(nx + 18 * s, wallY + 1 * s, nx + 54 * s, wallY - 8 * s);
      roofGradR.addColorStop(0, "#5D8A6B");
      roofGradR.addColorStop(0.5, "#4A7C59");
      roofGradR.addColorStop(1, "#3D6B4A");
      ctx.fillStyle = roofGradR;
      ctx.beginPath();
      ctx.moveTo(nx + 16 * s, wallY + 1 * s);
      ctx.lineTo(nx + 36 * s, wallY - 10 * s);
      ctx.lineTo(nx + 56 * s, wallY + 1 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windows on Left Wing
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const winX = nx - 48 * s + col * 11 * s;
          const winY = wallY + 8 * s + row * 13 * s;

          ctx.fillStyle = "#5D4037";
          ctx.fillRect(winX - 1 * s, winY - 1 * s, 8 * s, 11 * s);

          const glassGrad = ctx.createLinearGradient(winX, winY, winX + 6 * s, winY + 9 * s);
          glassGrad.addColorStop(0, "#37474F");
          glassGrad.addColorStop(0.3, "#1a1a2e");
          glassGrad.addColorStop(0.7, "#263238");
          glassGrad.addColorStop(1, "#1a1a2e");
          ctx.fillStyle = glassGrad;
          ctx.fillRect(winX, winY, 6 * s, 9 * s);

          ctx.strokeStyle = "#4E342E";
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(winX + 3 * s, winY);
          ctx.lineTo(winX + 3 * s, winY + 9 * s);
          ctx.moveTo(winX, winY + 4.5 * s);
          ctx.lineTo(winX + 6 * s, winY + 4.5 * s);
          ctx.stroke();

          ctx.fillStyle = "#EFEBE9";
          ctx.fillRect(winX - 1 * s, winY + 9 * s, 8 * s, 2 * s);
          ctx.fillStyle = "#D7CCC8";
          ctx.fillRect(winX - 1 * s, winY - 3 * s, 8 * s, 2 * s);
        }
      }

      // Windows on Right Wing
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const winX = nx + 21 * s + col * 11 * s;
          const winY = wallY + 8 * s + row * 13 * s;

          ctx.fillStyle = "#5D4037";
          ctx.fillRect(winX - 1 * s, winY - 1 * s, 8 * s, 11 * s);

          const glassGrad2 = ctx.createLinearGradient(winX, winY, winX + 6 * s, winY + 9 * s);
          glassGrad2.addColorStop(0, "#263238");
          glassGrad2.addColorStop(0.4, "#1a1a2e");
          glassGrad2.addColorStop(0.8, "#37474F");
          glassGrad2.addColorStop(1, "#1a1a2e");
          ctx.fillStyle = glassGrad2;
          ctx.fillRect(winX, winY, 6 * s, 9 * s);

          ctx.strokeStyle = "#4E342E";
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(winX + 3 * s, winY);
          ctx.lineTo(winX + 3 * s, winY + 9 * s);
          ctx.moveTo(winX, winY + 4.5 * s);
          ctx.lineTo(winX + 6 * s, winY + 4.5 * s);
          ctx.stroke();

          ctx.fillStyle = "#EFEBE9";
          ctx.fillRect(winX - 1 * s, winY + 9 * s, 8 * s, 2 * s);
          ctx.fillStyle = "#D7CCC8";
          ctx.fillRect(winX - 1 * s, winY - 3 * s, 8 * s, 2 * s);
        }
      }

      // ============================================================
      // FOREGROUND ELEMENTS (Draw last - appear in front)
      // ============================================================

      // 4. Stone Foundation/Steps
      const foundGrad = ctx.createLinearGradient(nx - 55 * s, foundY, nx + 55 * s, foundY);
      foundGrad.addColorStop(0, "#5D4037");
      foundGrad.addColorStop(0.5, "#6D4C41");
      foundGrad.addColorStop(1, "#5D4037");
      ctx.fillStyle = foundGrad;
      ctx.fillRect(nx - 55 * s, foundY, 110 * s, 8 * s);

      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(nx - 55 * s, foundY + 4 * s);
      ctx.lineTo(nx + 55 * s, foundY + 4 * s);
      ctx.stroke();

      // Front steps
      for (let step = 0; step < 3; step++) {
        const stepY = foundY + 8 * s + step * 3 * s;
        const stepW = 14 * s - step * 2 * s;
        ctx.fillStyle = step % 2 === 0 ? "#9E9E9E" : "#BDBDBD";
        ctx.fillRect(nx - stepW, stepY, stepW * 2, 3 * s);
      }

      // 5. Central Pavilion (IN FRONT of wings)
      const pavGrad = ctx.createLinearGradient(nx - 18 * s, wallY - 6 * s, nx + 18 * s, wallY - 6 * s);
      pavGrad.addColorStop(0, "#6D4C41");
      pavGrad.addColorStop(0.2, "#795548");
      pavGrad.addColorStop(0.5, "#8D6E63");
      pavGrad.addColorStop(0.8, "#795548");
      pavGrad.addColorStop(1, "#6D4C41");
      ctx.fillStyle = pavGrad;
      ctx.fillRect(nx - 18 * s, wallY - 6 * s, 36 * s, wallH + 14 * s);

      // Pavilion vertical pilaster strips
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(nx - 18 * s, wallY - 6 * s, 3 * s, wallH + 14 * s);
      ctx.fillRect(nx + 15 * s, wallY - 6 * s, 3 * s, wallH + 14 * s);

      // Pavilion cornice
      ctx.fillStyle = "#EFEBE9";
      ctx.fillRect(nx - 20 * s, wallY - 9 * s, 40 * s, 3 * s);

      // 6. Central Pediment (IN FRONT of cupola)
      const pedGrad = ctx.createLinearGradient(nx, pedimentY - 22 * s, nx, pedimentY);
      pedGrad.addColorStop(0, "#5D8A6B");
      pedGrad.addColorStop(0.5, "#4A7C59");
      pedGrad.addColorStop(1, "#3D6B4A");
      ctx.fillStyle = pedGrad;
      ctx.beginPath();
      ctx.moveTo(nx - 22 * s, pedimentY);
      ctx.lineTo(nx, pedimentY - 22 * s);
      ctx.lineTo(nx + 22 * s, pedimentY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#6B9B7A";
      ctx.lineWidth = 2 * s;
      ctx.stroke();

      // Pediment oculus
      ctx.fillStyle = "#3D6B4A";
      ctx.beginPath();
      ctx.arc(nx, pedimentY - 10 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6B9B7A";
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();

      ctx.fillStyle = "#4A7C59";
      ctx.beginPath();
      ctx.arc(nx, pedimentY - 10 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();

      // 7. Pavilion Windows
      for (let row = 0; row < 2; row++) {
        for (let col = -1; col <= 1; col++) {
          if (col === 0 && row === 1) continue;
          const winX = nx + col * 10 * s - 3 * s;
          const winY = wallY + (row === 0 ? 2 * s : 18 * s);

          ctx.fillStyle = "#4E342E";
          ctx.fillRect(winX - 1.5 * s, winY - 2 * s, 9 * s, 14 * s);

          ctx.fillStyle = "#1a1a2e";
          ctx.fillRect(winX, winY, 6 * s, 11 * s);

          ctx.beginPath();
          ctx.arc(winX + 3 * s, winY, 3 * s, Math.PI, 0);
          ctx.fill();

          ctx.strokeStyle = "#3E2723";
          ctx.lineWidth = 0.6 * s;
          ctx.beginPath();
          ctx.moveTo(winX + 3 * s, winY - 2 * s);
          ctx.lineTo(winX + 3 * s, winY + 11 * s);
          ctx.moveTo(winX, winY + 4 * s);
          ctx.lineTo(winX + 6 * s, winY + 4 * s);
          ctx.moveTo(winX, winY + 8 * s);
          ctx.lineTo(winX + 6 * s, winY + 8 * s);
          ctx.stroke();

          ctx.fillStyle = "#EFEBE9";
          ctx.fillRect(winX - 1.5 * s, winY + 11 * s, 9 * s, 2 * s);
        }
      }

      // 8. Grand Entrance Door
      const doorY = ny - 4 * s;

      ctx.fillStyle = "#5D4037";
      ctx.beginPath();
      ctx.moveTo(nx - 8 * s, doorY + 12 * s);
      ctx.lineTo(nx - 8 * s, doorY - 2 * s);
      ctx.quadraticCurveTo(nx, doorY - 14 * s, nx + 8 * s, doorY - 2 * s);
      ctx.lineTo(nx + 8 * s, doorY + 12 * s);
      ctx.lineTo(nx + 6 * s, doorY + 12 * s);
      ctx.lineTo(nx + 6 * s, doorY);
      ctx.quadraticCurveTo(nx, doorY - 10 * s, nx - 6 * s, doorY);
      ctx.lineTo(nx - 6 * s, doorY + 12 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#D7CCC8";
      ctx.beginPath();
      ctx.moveTo(nx - 3 * s, doorY - 10 * s);
      ctx.lineTo(nx, doorY - 14 * s);
      ctx.lineTo(nx + 3 * s, doorY - 10 * s);
      ctx.lineTo(nx + 2 * s, doorY - 7 * s);
      ctx.lineTo(nx - 2 * s, doorY - 7 * s);
      ctx.closePath();
      ctx.fill();

      const doorGrad = ctx.createLinearGradient(nx - 5 * s, doorY, nx + 5 * s, doorY);
      doorGrad.addColorStop(0, "#2D1B14");
      doorGrad.addColorStop(0.5, "#3E2723");
      doorGrad.addColorStop(1, "#2D1B14");
      ctx.fillStyle = doorGrad;
      ctx.beginPath();
      ctx.moveTo(nx - 5 * s, doorY + 12 * s);
      ctx.lineTo(nx - 5 * s, doorY + 1 * s);
      ctx.quadraticCurveTo(nx, doorY - 8 * s, nx + 5 * s, doorY + 1 * s);
      ctx.lineTo(nx + 5 * s, doorY + 12 * s);
      ctx.fill();

      ctx.strokeStyle = "#1a0f0a";
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(nx, doorY + 12 * s);
      ctx.lineTo(nx, doorY - 4 * s);
      ctx.stroke();

      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(nx - 2 * s, doorY + 5 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.arc(nx + 2 * s, doorY + 5 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();

      // 9. Decorative Columns on Pavilion
      const colPositions = [-12 * s, -4 * s, 4 * s, 12 * s];
      colPositions.forEach((colX) => {
        ctx.fillStyle = "#D7CCC8";
        ctx.fillRect(nx + colX - 2.5 * s, foundY - 5 * s, 5 * s, 5 * s);

        const colGrad = ctx.createLinearGradient(nx + colX - 2 * s, 0, nx + colX + 2 * s, 0);
        colGrad.addColorStop(0, "#BCAAA4");
        colGrad.addColorStop(0.3, "#EFEBE9");
        colGrad.addColorStop(0.7, "#EFEBE9");
        colGrad.addColorStop(1, "#BCAAA4");
        ctx.fillStyle = colGrad;
        ctx.fillRect(nx + colX - 2 * s, wallY + 2 * s, 4 * s, foundY - wallY - 7 * s);

        ctx.fillStyle = "#D7CCC8";
        ctx.fillRect(nx + colX - 3 * s, wallY - 1 * s, 6 * s, 3 * s);
        ctx.beginPath();
        ctx.arc(nx + colX - 3 * s, wallY, 1.5 * s, 0, Math.PI * 2);
        ctx.arc(nx + colX + 3 * s, wallY, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // 10. Tiger Statues
      const drawTigerStatue = (xOff: number, facing: number) => {
        const tx = nx + xOff;
        const ty = ny + 16 * s;

        ctx.fillStyle = "#546E7A";
        ctx.fillRect(tx - 6 * s, ty, 12 * s, 6 * s);
        ctx.fillStyle = "#78909C";
        ctx.fillRect(tx - 5 * s, ty - 2 * s, 10 * s, 2 * s);

        const tigerGrad = ctx.createLinearGradient(tx - 6 * s, ty - 6 * s, tx + 6 * s, ty - 6 * s);
        tigerGrad.addColorStop(0, "#455A64");
        tigerGrad.addColorStop(0.5, "#607D8B");
        tigerGrad.addColorStop(1, "#455A64");
        ctx.fillStyle = tigerGrad;
        ctx.beginPath();
        ctx.ellipse(tx, ty - 6 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#546E7A";
        ctx.fillRect(tx - 5 * s, ty - 4 * s, 2.5 * s, 6 * s);
        ctx.fillRect(tx + 2.5 * s, ty - 4 * s, 2.5 * s, 6 * s);

        ctx.fillStyle = "#607D8B";
        ctx.beginPath();
        ctx.arc(tx + facing * 6 * s, ty - 9 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tx + facing * 5 * s, ty - 12 * s);
        ctx.lineTo(tx + facing * 4 * s, ty - 15 * s);
        ctx.lineTo(tx + facing * 6 * s, ty - 13 * s);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tx + facing * 7 * s, ty - 12 * s);
        ctx.lineTo(tx + facing * 8 * s, ty - 15 * s);
        ctx.lineTo(tx + facing * 6 * s, ty - 13 * s);
        ctx.fill();

        ctx.fillStyle = "#263238";
        ctx.beginPath();
        ctx.arc(tx + facing * 5 * s, ty - 9.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.arc(tx + facing * 7 * s, ty - 9.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#546E7A";
        ctx.lineWidth = 2 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tx - facing * 6 * s, ty - 6 * s);
        ctx.quadraticCurveTo(tx - facing * 10 * s, ty - 12 * s, tx - facing * 8 * s, ty - 16 * s);
        ctx.stroke();
      };

      drawTigerStatue(-28 * s, 1);
      drawTigerStatue(28 * s, -1);

      break;
    }
    case "bush": {
      // Enhanced 3D isometric bush with detailed foliage clusters
      const bushVariants = [
        { base: "#4caf50", mid: "#66bb6a", light: "#81c784", dark: "#388e3c", accent: "#aed581" },
        { base: "#388e3c", mid: "#4caf50", light: "#66bb6a", dark: "#2e7d32", accent: "#81c784" },
        { base: "#558b2f", mid: "#689f38", light: "#7cb342", dark: "#33691e", accent: "#8bc34a" },
        { base: "#33691e", mid: "#558b2f", light: "#689f38", dark: "#1b5e20", accent: "#7cb342" },
      ];
      const bv = bushVariants[variant % 4];

      // Ground shadow
      const bushShadowGrad = ctx.createRadialGradient(
        screenPos.x + 2 * s, screenPos.y + 5 * s, 0,
        screenPos.x + 2 * s, screenPos.y + 5 * s, 20 * s
      );
      bushShadowGrad.addColorStop(0, "rgba(0,0,0,0.28)");
      bushShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
      bushShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bushShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 5 * s, 20 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base foliage mass (darker, bottom layer)
      const baseGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y - 2 * s, 0,
        screenPos.x, screenPos.y - 2 * s, 18 * s
      );
      baseGrad.addColorStop(0, bv.mid);
      baseGrad.addColorStop(0.6, bv.base);
      baseGrad.addColorStop(1, bv.dark);
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 2 * s, 18 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Foliage clusters for 3D depth - multiple overlapping spheres
      const clusters = [
        { x: -10, y: -4, rx: 9, ry: 7 },
        { x: 8, y: -5, rx: 10, ry: 8 },
        { x: -3, y: -10, rx: 10, ry: 7 },
        { x: 6, y: -12, rx: 8, ry: 6 },
        { x: -8, y: -11, rx: 7, ry: 5 },
        { x: 0, y: -6, rx: 12, ry: 9 },
      ];

      clusters.forEach((cluster, idx) => {
        const clusterGrad = ctx.createRadialGradient(
          screenPos.x + cluster.x * s - 2 * s, screenPos.y + cluster.y * s - 2 * s, 0,
          screenPos.x + cluster.x * s, screenPos.y + cluster.y * s, cluster.rx * s
        );
        clusterGrad.addColorStop(0, idx < 3 ? bv.light : bv.accent);
        clusterGrad.addColorStop(0.4, bv.mid);
        clusterGrad.addColorStop(1, bv.base);
        ctx.fillStyle = clusterGrad;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + cluster.x * s, screenPos.y + cluster.y * s,
          cluster.rx * s, cluster.ry * s, 0, 0, Math.PI * 2
        );
        ctx.fill();
      });

      // Top highlight clusters
      const highlights = [
        { x: -5, y: -13, r: 4 },
        { x: 4, y: -14, r: 3.5 },
        { x: -1, y: -8, r: 5 },
      ];
      highlights.forEach((hl) => {
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.ellipse(screenPos.x + hl.x * s, screenPos.y + hl.y * s, hl.r * s, hl.r * 0.6 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Leaf detail dots for texture
      ctx.fillStyle = bv.accent;
      for (let i = 0; i < 8; i++) {
        const leafX = screenPos.x + (Math.sin(i * 1.3) * 12 - 2) * s;
        const leafY = screenPos.y + (-8 + Math.cos(i * 1.7) * 5) * s;
        ctx.beginPath();
        ctx.arc(leafX, leafY, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add subtle berry/flower accents on some variants
      if (variant === 0 || variant === 2) {
        const berryColors = ["#ef5350", "#ff7043", "#ffca28"];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = berryColors[i % 3];
          const bx = screenPos.x + (Math.sin(i * 2.1) * 8) * s;
          const by = screenPos.y + (-6 + Math.cos(i * 1.5) * 4) * s;
          ctx.beginPath();
          ctx.arc(bx, by, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Shadow detail at base for grounding
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "grass": {
      // Enhanced 3D grass tuft with varied blade heights and colors
      const grassPalettes = [
        { base: "#4a5d23", mid: "#5a6d33", tip: "#7a8d53", dark: "#3a4d13" },
        { base: "#3d4f1c", mid: "#4d5f2c", tip: "#6d7f4c", dark: "#2d3f0c" },
        { base: "#556b2f", mid: "#657b3f", tip: "#859b5f", dark: "#45511f" },
        { base: "#6b8e23", mid: "#7b9e33", tip: "#9bbe53", dark: "#5b7e13" },
      ];
      const gp = grassPalettes[variant % 4];

      // Subtle ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 1 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw multiple grass blades with varying properties
      const blades = [
        { x: -6, h: 16, w: 1.8, sway: 0 },
        { x: -3, h: 20, w: 2.2, sway: 0.3 },
        { x: 0, h: 22, w: 2.5, sway: 0.5 },
        { x: 3, h: 18, w: 2, sway: 0.7 },
        { x: 6, h: 14, w: 1.6, sway: 1 },
        { x: -4, h: 12, w: 1.4, sway: 0.2 },
        { x: 4, h: 11, w: 1.3, sway: 0.8 },
        { x: -1, h: 15, w: 1.7, sway: 0.4 },
        { x: 2, h: 13, w: 1.5, sway: 0.6 },
      ];

      blades.forEach((blade, idx) => {
        const gx = screenPos.x + blade.x * s;
        const sway = Math.sin(decorTime * 2 + blade.sway * 3 + dec.x * 0.1) * (2 + blade.h * 0.1) * s;
        const tipSway = sway * 1.5;

        // Gradient from base to tip
        const bladeGrad = ctx.createLinearGradient(gx, screenPos.y, gx + tipSway, screenPos.y - blade.h * s);
        bladeGrad.addColorStop(0, gp.dark);
        bladeGrad.addColorStop(0.3, gp.base);
        bladeGrad.addColorStop(0.7, gp.mid);
        bladeGrad.addColorStop(1, gp.tip);

        // Draw blade as filled shape for better appearance
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(gx - blade.w * 0.5 * s, screenPos.y);
        ctx.quadraticCurveTo(
          gx + sway * 0.3 - blade.w * 0.3 * s,
          screenPos.y - blade.h * 0.5 * s,
          gx + tipSway,
          screenPos.y - blade.h * s
        );
        ctx.quadraticCurveTo(
          gx + sway * 0.3 + blade.w * 0.3 * s,
          screenPos.y - blade.h * 0.5 * s,
          gx + blade.w * 0.5 * s,
          screenPos.y
        );
        ctx.closePath();
        ctx.fill();

        // Subtle highlight on some blades
        if (idx % 3 === 0) {
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 0.5 * s;
          ctx.beginPath();
          ctx.moveTo(gx, screenPos.y - 2 * s);
          ctx.quadraticCurveTo(
            gx + sway * 0.3,
            screenPos.y - blade.h * 0.5 * s,
            gx + tipSway * 0.8,
            screenPos.y - blade.h * 0.9 * s
          );
          ctx.stroke();
        }
      });

      // Add a few seed heads on taller blades
      if (variant === 1 || variant === 3) {
        ctx.fillStyle = "#a89078";
        const seedX = screenPos.x + Math.sin(decorTime * 2 + 0.5 + dec.x * 0.1) * 3.5 * s;
        const seedY = screenPos.y - 21 * s;
        ctx.beginPath();
        ctx.ellipse(seedX, seedY, 1.5 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "crater":
    case "battle_crater":
    case "fire_pit": {
      // Subtle, environment-blending crater/pit - natural depression in terrain
      const isBattle = type === "battle_crater";
      const isFirePit = type === "fire_pit";
      const safeVariant = (variant ?? 0) % 4;

      // Variant-based size variations
      const craterVariants = [
        { outerRx: 24, outerRy: 12, depth: 3, debris: 3 },
        { outerRx: 16, outerRy: 8, depth: 4, debris: 2 },
        { outerRx: 32, outerRy: 16, depth: 2, debris: 4 },
        { outerRx: 28, outerRy: 10, depth: 3.5, debris: 3 },
      ];
      const cv = craterVariants[safeVariant];

      const craterX = screenPos.x;
      const craterY = screenPos.y;

      // Very subtle outer shadow - barely visible depression
      const outerShadow = ctx.createRadialGradient(
        craterX, craterY, cv.outerRx * 0.3 * s,
        craterX, craterY, (cv.outerRx + 4) * s
      );
      outerShadow.addColorStop(0, "rgba(40,35,25,0.12)");
      outerShadow.addColorStop(0.7, "rgba(35,30,20,0.06)");
      outerShadow.addColorStop(1, "rgba(30,25,15,0)");
      ctx.fillStyle = outerShadow;
      ctx.beginPath();
      ctx.ellipse(craterX, craterY, (cv.outerRx + 4) * s, (cv.outerRy + 2) * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rim - very subtle earthy tone, blends with ground
      const rimGrad = ctx.createRadialGradient(
        craterX, craterY - 1 * s, cv.outerRx * 0.5 * s,
        craterX, craterY, cv.outerRx * s
      );
      rimGrad.addColorStop(0, "rgba(70,60,45,0.25)");
      rimGrad.addColorStop(0.6, "rgba(60,50,35,0.18)");
      rimGrad.addColorStop(1, "rgba(50,45,30,0.08)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.ellipse(craterX, craterY, cv.outerRx * s, cv.outerRy * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner depression - darker but still subtle
      const innerGrad = ctx.createRadialGradient(
        craterX, craterY + cv.depth * 0.3 * s, 0,
        craterX, craterY + cv.depth * 0.3 * s, (cv.outerRx - 3) * s
      );
      innerGrad.addColorStop(0, "rgba(25,20,12,0.35)");
      innerGrad.addColorStop(0.5, "rgba(35,28,18,0.25)");
      innerGrad.addColorStop(1, "rgba(45,38,25,0.12)");
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.ellipse(craterX, craterY + 1 * s, (cv.outerRx - 2) * s, (cv.outerRy - 1) * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle depth shading on back edge
      ctx.fillStyle = "rgba(20,15,8,0.15)";
      ctx.beginPath();
      ctx.ellipse(craterX, craterY - 1 * s, (cv.outerRx - 4) * s, (cv.outerRy - 2) * s, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();

      // A few subtle dirt clumps around edge
      ctx.fillStyle = "rgba(65,55,40,0.2)";
      for (let d = 0; d < cv.debris; d++) {
        const debrisAngle = (d / cv.debris) * Math.PI * 2 + safeVariant * 0.8;
        const debrisDist = cv.outerRx * 0.9 + Math.sin(d * 2.1 + safeVariant) * 2;
        const debrisX = craterX + Math.cos(debrisAngle) * debrisDist * s;
        const debrisY = craterY + Math.sin(debrisAngle) * debrisDist * 0.5 * s;
        ctx.beginPath();
        ctx.ellipse(debrisX, debrisY, 1.5 * s, 0.8 * s, debrisAngle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Battle crater - subtle scorch marks
      if (isBattle) {
        ctx.strokeStyle = "rgba(35,25,15,0.15)";
        ctx.lineWidth = 1.5 * s;
        for (let sc = 0; sc < 3; sc++) {
          const scorchAngle = sc * 2 + safeVariant * 0.5;
          const scorchStart = cv.outerRx * 0.7;
          const scorchEnd = cv.outerRx + 3;
          ctx.beginPath();
          ctx.moveTo(
            craterX + Math.cos(scorchAngle) * scorchStart * s,
            craterY + Math.sin(scorchAngle) * scorchStart * 0.5 * s
          );
          ctx.lineTo(
            craterX + Math.cos(scorchAngle) * scorchEnd * s,
            craterY + Math.sin(scorchAngle) * scorchEnd * 0.5 * s
          );
          ctx.stroke();
        }
      }

      // Fire pit - subtle warm glow
      if (isFirePit) {
        const firePulse = 0.2 + Math.sin(decorTime * 3) * 0.08;
        const fireGlow = ctx.createRadialGradient(
          craterX, craterY + cv.depth * 0.2 * s, 0,
          craterX, craterY + cv.depth * 0.2 * s, (cv.outerRx - 4) * s
        );
        fireGlow.addColorStop(0, `rgba(180,80,20,${firePulse})`);
        fireGlow.addColorStop(0.5, `rgba(120,40,10,${firePulse * 0.4})`);
        fireGlow.addColorStop(1, "rgba(60,20,5,0)");
        ctx.fillStyle = fireGlow;
        ctx.beginPath();
        ctx.ellipse(craterX, craterY + cv.depth * 0.2 * s, (cv.outerRx - 4) * s, (cv.outerRy - 2) * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tiny ember particles
        for (let e = 0; e < 2; e++) {
          const emberPhase = (decorTime * 1.2 + e * 1.2 + safeVariant) % 2;
          const emberAlpha = (emberPhase < 1 ? emberPhase : 2 - emberPhase) * 0.5;
          const emberRise = emberPhase * 5 * s;
          const emberX = craterX + Math.sin(e * 3 + decorTime) * 4 * s;
          const emberY = craterY - emberRise;

          ctx.fillStyle = `rgba(255,150,50,${emberAlpha})`;
          ctx.beginPath();
          ctx.arc(emberX, emberY, 1 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      break;
    }
    case "debris":
      ctx.fillStyle = "#4a3525";
      for (let d = 0; d < 5; d++) {
        const angle = rotation + d * 1.2;
        const dist = (8 + variant * 3) * s;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + Math.cos(angle) * dist,
          screenPos.y + Math.sin(angle) * dist * 0.5,
          6 * s,
          4 * s,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = "#6d4c41";
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(rotation);
      ctx.fillRect(-15 * s, -3 * s, 30 * s, 4 * s);
      ctx.fillRect(-8 * s, -12 * s, 4 * s, 20 * s);
      ctx.restore();
      break;
    case "cart":
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 2,
        screenPos.y + 5 * s,
        25 * s,
        12 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(rotation * 0.3);
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(-20 * s, -8 * s, 40 * s, 12 * s);
      ctx.strokeStyle = "#4a3525";
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.arc(-15 * s, 2 * s, 8 * s, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(15 * s, -5 * s, 8 * s, Math.PI * 0.5, Math.PI * 1.8);
      ctx.stroke();
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(5 * s, -12 * s, 8 * s, 6 * s);
      ctx.fillRect(-10 * s, 4 * s, 6 * s, 5 * s);
      ctx.restore();
      break;
    case "hut": {
      const cx = screenPos.x;
      const cy = screenPos.y;
      const v = variant % 4;

      // Shadow
      const hutSG = ctx.createRadialGradient(cx + 6 * s, cy + 8 * s, 0, cx + 6 * s, cy + 8 * s, 42 * s);
      hutSG.addColorStop(0, "rgba(0,0,0,0.38)");
      hutSG.addColorStop(0.5, "rgba(0,0,0,0.14)");
      hutSG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hutSG;
      ctx.beginPath();
      ctx.ellipse(cx + 6 * s, cy + 8 * s, 42 * s, 18 * s, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Shared helpers
      const hutWin = (wx: number, wy: number, ww: number, wh: number, shutters: boolean = false) => {
        if (shutters) {
          ctx.fillStyle = "#3A2A1A";
          ctx.fillRect(wx - ww - 1.5 * s, wy - wh * 0.3, 1.5 * s, wh * 0.8 + ww * 0.5);
          ctx.fillStyle = "#4A3828";
          ctx.fillRect(wx + ww, wy - wh * 0.3, 1.5 * s, wh * 0.8 + ww * 0.5);
        }
        ctx.fillStyle = "#1A1008";
        ctx.beginPath();
        ctx.moveTo(wx - ww, wy + wh * 0.5);
        ctx.lineTo(wx - ww, wy - wh * 0.3);
        ctx.arc(wx, wy - wh * 0.3, ww, Math.PI, 0);
        ctx.lineTo(wx + ww, wy + wh * 0.5);
        ctx.closePath();
        ctx.fill();
        const wG = ctx.createRadialGradient(wx, wy, 0, wx, wy, wh * 0.8);
        wG.addColorStop(0, "rgba(255,200,100,0.55)");
        wG.addColorStop(0.5, "rgba(220,160,60,0.35)");
        wG.addColorStop(1, "rgba(180,120,40,0.1)");
        ctx.fillStyle = wG;
        ctx.beginPath();
        ctx.moveTo(wx - ww + 0.5 * s, wy + wh * 0.45);
        ctx.lineTo(wx - ww + 0.5 * s, wy - wh * 0.25);
        ctx.arc(wx, wy - wh * 0.25, ww - 0.5 * s, Math.PI, 0);
        ctx.lineTo(wx + ww - 0.5 * s, wy + wh * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#3A2518";
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(wx - ww, wy + wh * 0.5);
        ctx.lineTo(wx - ww, wy - wh * 0.3);
        ctx.arc(wx, wy - wh * 0.3, ww, Math.PI, 0);
        ctx.lineTo(wx + ww, wy + wh * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wx, wy - wh * 0.3 - ww);
        ctx.lineTo(wx, wy + wh * 0.5);
        ctx.stroke();
        ctx.fillStyle = "#3A2518";
        ctx.fillRect(wx - ww - 0.3 * s, wy + wh * 0.5, ww * 2 + 0.6 * s, 1.2 * s);
      };

      const hutDoor = (dx: number, dy: number, dw: number, dh: number) => {
        ctx.fillStyle = "#5A4A38";
        ctx.beginPath();
        ctx.moveTo(dx - dw * 0.7, dy + 1 * s);
        ctx.lineTo(dx + dw * 0.7, dy + 1 * s);
        ctx.lineTo(dx + dw * 0.5, dy + 3 * s);
        ctx.lineTo(dx - dw * 0.3, dy + 3 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4A3828";
        ctx.beginPath();
        ctx.moveTo(dx - dw * 0.55, dy);
        ctx.lineTo(dx - dw * 0.55, dy - dh - dw * 0.25);
        ctx.lineTo(dx + dw * 0.55, dy - dh - dw * 0.25);
        ctx.lineTo(dx + dw * 0.55, dy);
        ctx.closePath();
        ctx.fill();
        const dG = ctx.createLinearGradient(dx - dw * 0.5, dy, dx + dw * 0.5, dy);
        dG.addColorStop(0, "#3A2210");
        dG.addColorStop(0.35, "#4A3220");
        dG.addColorStop(0.65, "#3A2210");
        dG.addColorStop(1, "#2A1808");
        ctx.fillStyle = dG;
        ctx.beginPath();
        ctx.moveTo(dx - dw * 0.5, dy);
        ctx.lineTo(dx - dw * 0.5, dy - dh);
        ctx.arc(dx, dy - dh, dw * 0.5, Math.PI, 0);
        ctx.lineTo(dx + dw * 0.5, dy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5A4A35";
        ctx.lineWidth = 0.6 * s;
        ctx.beginPath();
        ctx.moveTo(dx - dw * 0.5, dy - dh * 0.33);
        ctx.lineTo(dx + dw * 0.5, dy - dh * 0.33);
        ctx.moveTo(dx - dw * 0.5, dy - dh * 0.66);
        ctx.lineTo(dx + dw * 0.5, dy - dh * 0.66);
        ctx.stroke();
        ctx.fillStyle = "#C8A860";
        ctx.beginPath();
        ctx.arc(dx + dw * 0.22, dy - dh * 0.45, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      };

      const hutRoof = (peakY: number, baseY: number, halfW: number, halfD: number, ov: number, dark: string, mid: string, lit: string) => {
        const pX = cx, pY = peakY;
        const lX = cx - halfW - ov, lY = baseY;
        const rX = cx + halfW + ov, rY = baseY;
        const fX = cx, fY = baseY + halfD;

        // Single gradient fill across entire roof — absolutely zero internal edges
        const roofG = ctx.createLinearGradient(lX, lY, rX, rY);
        roofG.addColorStop(0, dark);
        roofG.addColorStop(0.45, mid);
        roofG.addColorStop(1, lit);
        ctx.fillStyle = roofG;
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(lX, lY);
        ctx.lineTo(fX, fY);
        ctx.lineTo(rX, rY);
        ctx.closePath();
        ctx.fill();

        // Fascia — left eave
        ctx.fillStyle = "#2A1E14";
        ctx.beginPath();
        ctx.moveTo(lX, lY);
        ctx.lineTo(fX, fY);
        ctx.lineTo(fX, fY + 3 * s);
        ctx.lineTo(lX, lY + 3 * s);
        ctx.closePath();
        ctx.fill();
        // Fascia — right eave
        ctx.fillStyle = "#3A2E22";
        ctx.beginPath();
        ctx.moveTo(fX, fY);
        ctx.lineTo(rX, rY);
        ctx.lineTo(rX, rY + 3 * s);
        ctx.lineTo(fX, fY + 3 * s);
        ctx.closePath();
        ctx.fill();

        // Tile ridges across the roof
        ctx.strokeStyle = "rgba(20,10,5,0.13)";
        ctx.lineWidth = 0.6 * s;
        for (let r = 0; r < 5; r++) {
          const t = (r + 1) / 6;
          ctx.beginPath();
          ctx.moveTo(pX + (lX - pX) * t, pY + (lY - pY) * t);
          ctx.lineTo(pX + (fX - pX) * t, pY + (fY - pY) * t);
          ctx.lineTo(pX + (rX - pX) * t, pY + (rY - pY) * t);
          ctx.stroke();
        }

        // Ridge highlight
        ctx.strokeStyle = "rgba(140,120,80,0.2)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(rX, rY);
        ctx.stroke();
      };

      const hutStoneWall = (bl: [number, number], br: [number, number], tr: [number, number], tl: [number, number], color: string, rows: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(bl[0], bl[1]);
        ctx.lineTo(br[0], br[1]);
        ctx.lineTo(tr[0], tr[1]);
        ctx.lineTo(tl[0], tl[1]);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(30,20,10,0.22)";
        ctx.lineWidth = 0.5 * s;
        for (let r = 0; r < rows; r++) {
          const t = (r + 0.5) / rows;
          const lx = bl[0] + (tl[0] - bl[0]) * t;
          const ly = bl[1] + (tl[1] - bl[1]) * t;
          const rx = br[0] + (tr[0] - br[0]) * t;
          const ry = br[1] + (tr[1] - br[1]) * t;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(rx, ry);
          ctx.stroke();
          const cols = 2 + (r % 2);
          for (let c = 1; c <= cols; c++) {
            const ct = c / (cols + 1) + (r % 2 === 0 ? 0.05 : -0.03);
            const jx = lx + (rx - lx) * ct;
            const jy = ly + (ry - ly) * ct;
            const nextT = Math.min(1, (r + 1.5) / rows);
            const ny = bl[1] + (tl[1] - bl[1]) * nextT;
            ctx.beginPath();
            ctx.moveTo(jx, jy);
            ctx.lineTo(jx + (tl[0] - bl[0]) / rows * 0.6, ny);
            ctx.stroke();
          }
        }
      };

      const hutChimney = (chimX: number, chimTop: number, chimH: number) => {
        ctx.fillStyle = "#5A4A3A";
        ctx.beginPath();
        ctx.moveTo(chimX - 3 * s, chimTop + chimH);
        ctx.lineTo(chimX - 3 * s, chimTop);
        ctx.lineTo(chimX + 3 * s, chimTop);
        ctx.lineTo(chimX + 3 * s, chimTop + chimH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4A3A2A";
        ctx.beginPath();
        ctx.moveTo(chimX - 2 * s, chimTop + chimH);
        ctx.lineTo(chimX - 2 * s, chimTop);
        ctx.lineTo(chimX, chimTop - 0.5 * s);
        ctx.lineTo(chimX, chimTop + chimH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#6A5A48";
        ctx.beginPath();
        ctx.moveTo(chimX - 4 * s, chimTop);
        ctx.lineTo(chimX + 4 * s, chimTop);
        ctx.lineTo(chimX + 3.5 * s, chimTop + 2.5 * s);
        ctx.lineTo(chimX - 3.5 * s, chimTop + 2.5 * s);
        ctx.closePath();
        ctx.fill();
        const drift = Math.sin(decorTime * 2 + decorX) * 3 * s;
        ctx.fillStyle = "rgba(170,160,150,0.2)";
        ctx.beginPath();
        ctx.ellipse(chimX + drift * 0.5, chimTop - 3 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(150,145,140,0.13)";
        ctx.beginPath();
        ctx.ellipse(chimX + drift, chimTop - 8 * s, 4.5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(140,135,130,0.07)";
        ctx.beginPath();
        ctx.ellipse(chimX + drift * 1.6, chimTop - 14 * s, 6 * s, 3 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
      };

      if (v === 0) {
        // === STONE COTTAGE ===
        const wW = 24 * s, wD = 15 * s, wH = 24 * s, rH = 16 * s;
        const iW = wW * 0.866, iD = wD * 0.5;

        // Foundation
        ctx.fillStyle = "#3E3028";
        ctx.beginPath();
        ctx.moveTo(cx, cy + iD + 3 * s);
        ctx.lineTo(cx + iW + 3 * s, cy + 3 * s);
        ctx.lineTo(cx, cy - iD + 3 * s);
        ctx.lineTo(cx - iW - 3 * s, cy + 3 * s);
        ctx.closePath();
        ctx.fill();

        // Left wall
        hutStoneWall([cx - iW, cy], [cx, cy + iD], [cx, cy + iD - wH], [cx - iW, cy - wH], "#5A4A3A", 7);

        // Right wall
        const rwG = ctx.createLinearGradient(cx, cy, cx + iW, cy);
        rwG.addColorStop(0, "#8A7A65");
        rwG.addColorStop(1, "#6A5A48");
        hutStoneWall([cx, cy + iD], [cx + iW, cy], [cx + iW, cy - wH], [cx, cy + iD - wH], rwG as unknown as string, 0);
        ctx.fillStyle = rwG;
        ctx.beginPath();
        ctx.moveTo(cx + iW, cy);
        ctx.lineTo(cx, cy + iD);
        ctx.lineTo(cx, cy + iD - wH);
        ctx.lineTo(cx + iW, cy - wH);
        ctx.closePath();
        ctx.fill();
        // Stone texture on right wall
        ctx.strokeStyle = "rgba(30,20,10,0.2)";
        ctx.lineWidth = 0.5 * s;
        for (let r = 0; r < 7; r++) {
          const t = (r + 0.5) / 7;
          const ly = cy + iD + (cy + iD - wH - cy - iD) * t;
          const ry = cy + (cy - wH - cy) * t;
          ctx.beginPath();
          ctx.moveTo(cx + 1 * s, ly);
          ctx.lineTo(cx + iW - 1 * s, ry);
          ctx.stroke();
          const cols = 2 + (r % 2);
          for (let c = 1; c <= cols; c++) {
            const ct = c / (cols + 1);
            const jx = cx + 1 * s + (cx + iW - 1 * s - cx - 1 * s) * ct;
            const jy = ly + (ry - ly) * ct;
            ctx.beginPath();
            ctx.moveTo(jx, jy);
            ctx.lineTo(jx, jy - wH / 7 * 0.8);
            ctx.stroke();
          }
        }

        // Door
        hutDoor(cx + iW * 0.35, cy + iD * 0.35, 7 * s, 14 * s);

        // Windows
        hutWin(cx + iW * 0.72, cy - wH * 0.4 + iD * 0.15, 3.5 * s, 6 * s, true);
        hutWin(cx - iW * 0.5, cy - wH * 0.45, 3 * s, 5.5 * s, true);

        // Roof
        hutRoof(cy - wH - rH, cy - wH, iW, iD, 5 * s, "#3A2A1A", "#5A4030", "#6A5040");

        // Chimney
        hutChimney(cx + iW * 0.35, cy - wH - rH - 5 * s, rH * 0.55);

      } else if (v === 1) {
        // === WATCHTOWER ===
        const tW = 16 * s, tD = 12 * s, tH = 38 * s, batH = 5 * s;
        const tiW = tW * 0.866, tiD = tD * 0.5;

        // Platform
        ctx.fillStyle = "#3E3028";
        ctx.beginPath();
        ctx.moveTo(cx, cy + tiD + 3 * s);
        ctx.lineTo(cx + tiW + 5 * s, cy + 3 * s);
        ctx.lineTo(cx, cy - tiD + 3 * s);
        ctx.lineTo(cx - tiW - 5 * s, cy + 3 * s);
        ctx.closePath();
        ctx.fill();

        // Left wall
        hutStoneWall([cx - tiW, cy], [cx, cy + tiD], [cx, cy + tiD - tH], [cx - tiW, cy - tH], "#504840", 10);

        // Right wall
        const twG = ctx.createLinearGradient(cx, cy, cx + tiW, cy);
        twG.addColorStop(0, "#7A6A58");
        twG.addColorStop(1, "#5A4A3C");
        ctx.fillStyle = twG;
        ctx.beginPath();
        ctx.moveTo(cx + tiW, cy);
        ctx.lineTo(cx, cy + tiD);
        ctx.lineTo(cx, cy + tiD - tH);
        ctx.lineTo(cx + tiW, cy - tH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(30,20,10,0.2)";
        ctx.lineWidth = 0.5 * s;
        for (let r = 0; r < 10; r++) {
          const t = (r + 0.5) / 10;
          const ly = cy + tiD + (cy + tiD - tH - cy - tiD) * t;
          const ry = cy + (cy - tH - cy) * t;
          ctx.beginPath();
          ctx.moveTo(cx + 1 * s, ly);
          ctx.lineTo(cx + tiW - 1 * s, ry);
          ctx.stroke();
        }

        // Stone bands
        ctx.fillStyle = "#4A3A2A";
        for (const frac of [0.33, 0.66]) {
          const bandY = cy - tH * frac;
          ctx.beginPath();
          ctx.moveTo(cx, cy + tiD - tH * frac);
          ctx.lineTo(cx + tiW + 1 * s, bandY);
          ctx.lineTo(cx + tiW + 1 * s, bandY + 2 * s);
          ctx.lineTo(cx, cy + tiD - tH * frac + 2 * s);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx - tiW - 1 * s, bandY);
          ctx.lineTo(cx, cy + tiD - tH * frac);
          ctx.lineTo(cx, cy + tiD - tH * frac + 2 * s);
          ctx.lineTo(cx - tiW - 1 * s, bandY + 2 * s);
          ctx.closePath();
          ctx.fill();
        }

        // Door
        hutDoor(cx + tiW * 0.4, cy + tiD * 0.25, 5 * s, 11 * s);

        // Arrow slits
        for (let w = 0; w < 3; w++) {
          const wy = cy - tH * (0.2 + w * 0.25);
          const wx = cx + tiW * 0.55 - w * tiD * 0.12;
          ctx.fillStyle = "#1A1008";
          ctx.fillRect(wx - 1 * s, wy - 3.5 * s, 2 * s, 7 * s);
          ctx.fillStyle = "rgba(200,150,70,0.35)";
          ctx.fillRect(wx - 0.7 * s, wy - 3 * s, 1.4 * s, 6 * s);
        }

        // Left window
        hutWin(cx - tiW * 0.5, cy - tH * 0.55, 3 * s, 6 * s);

        // Battlements top
        const batBase = cy - tH;
        // Walkway top face
        ctx.fillStyle = "#6A5A48";
        ctx.beginPath();
        ctx.moveTo(cx, batBase - batH - tiD);
        ctx.lineTo(cx + tiW + 2 * s, batBase - batH);
        ctx.lineTo(cx, batBase + tiD - batH);
        ctx.lineTo(cx - tiW - 2 * s, batBase - batH);
        ctx.closePath();
        ctx.fill();

        // Isometric merlons along front edge
        const mW = 3 * s, mH = 5 * s, mD = 2 * s;
        for (let m = 0; m < 4; m++) {
          const t = (m + 0.25) / 4;
          const mx = cx - tiW - 2 * s + (tiW * 2 + 4 * s) * t;
          const my = batBase - batH;
          // Front face
          ctx.fillStyle = "#7A6A58";
          ctx.beginPath();
          ctx.moveTo(mx - mW * 0.5, my);
          ctx.lineTo(mx - mW * 0.5, my - mH);
          ctx.lineTo(mx + mW * 0.5, my - mH);
          ctx.lineTo(mx + mW * 0.5, my);
          ctx.closePath();
          ctx.fill();
          // Top face (isometric diamond)
          ctx.fillStyle = "#8A7A68";
          ctx.beginPath();
          ctx.moveTo(mx - mW * 0.5, my - mH);
          ctx.lineTo(mx, my - mH - mD);
          ctx.lineTo(mx + mW * 0.5, my - mH);
          ctx.lineTo(mx, my - mH + mD * 0.3);
          ctx.closePath();
          ctx.fill();
        }

        // Isometric merlons along right edge
        for (let m = 0; m < 3; m++) {
          const t = (m + 0.3) / 3;
          const mx = cx + (tiW + 2 * s) * t;
          const my = batBase - batH + tiD * (1 - t);
          // Right face (visible side)
          ctx.fillStyle = "#5A4A3C";
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx, my - mH);
          ctx.lineTo(mx + mW * 0.4, my - mH - mD * 0.5);
          ctx.lineTo(mx + mW * 0.4, my - mD * 0.5);
          ctx.closePath();
          ctx.fill();
          // Front face
          ctx.fillStyle = "#6A5A48";
          ctx.beginPath();
          ctx.moveTo(mx - mW * 0.4, my + mD * 0.3);
          ctx.lineTo(mx - mW * 0.4, my + mD * 0.3 - mH);
          ctx.lineTo(mx, my - mH);
          ctx.lineTo(mx, my);
          ctx.closePath();
          ctx.fill();
          // Top
          ctx.fillStyle = "#7A6A58";
          ctx.beginPath();
          ctx.moveTo(mx - mW * 0.4, my + mD * 0.3 - mH);
          ctx.lineTo(mx, my - mH - mD * 0.5);
          ctx.lineTo(mx + mW * 0.4, my - mH - mD * 0.5);
          ctx.lineTo(mx, my - mH);
          ctx.closePath();
          ctx.fill();
        }

        // Conical roof — single gradient fill, zero internal edges
        const roofBot = batBase - batH + 6 * s;
        const pk = roofBot - 20 * s;
        const cLX = cx - tiW - 4 * s, cRX = cx + tiW + 4 * s;
        const cFY = roofBot + tiD;

        const crG = ctx.createLinearGradient(cLX, roofBot, cRX, roofBot);
        crG.addColorStop(0, "#3A2E20");
        crG.addColorStop(0.45, "#4A3828");
        crG.addColorStop(1, "#6A5840");
        ctx.fillStyle = crG;
        ctx.beginPath();
        ctx.moveTo(cx, pk);
        ctx.lineTo(cLX, roofBot);
        ctx.lineTo(cx, cFY);
        ctx.lineTo(cRX, roofBot);
        ctx.closePath();
        ctx.fill();

        // Shingle lines
        ctx.strokeStyle = "rgba(20,10,5,0.13)";
        ctx.lineWidth = 0.6 * s;
        for (let r = 0; r < 6; r++) {
          const t = (r + 1) / 7;
          ctx.beginPath();
          ctx.moveTo(cx + (cLX - cx) * t, pk + (roofBot - pk) * t);
          ctx.lineTo(cx, pk + (cFY - pk) * t);
          ctx.lineTo(cx + (cRX - cx) * t, pk + (roofBot - pk) * t);
          ctx.stroke();
        }

        // Ridge highlight
        ctx.strokeStyle = "rgba(140,120,80,0.2)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(cx, pk);
        ctx.lineTo(cRX, roofBot);
        ctx.stroke();

        // Flag
        ctx.strokeStyle = "#3A2A1A";
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx, pk);
        ctx.lineTo(cx, pk - 10 * s);
        ctx.stroke();
        const fWave = Math.sin(decorTime * 3 + decorX * 0.1) * 2 * s;
        ctx.fillStyle = "#B03030";
        ctx.beginPath();
        ctx.moveTo(cx + 1 * s, pk - 10 * s);
        ctx.quadraticCurveTo(cx + 4 * s + fWave, pk - 8 * s, cx + 7 * s, pk - 7 * s + fWave * 0.5);
        ctx.lineTo(cx + 7 * s, pk - 4 * s + fWave * 0.5);
        ctx.quadraticCurveTo(cx + 4 * s + fWave * 0.5, pk - 5 * s, cx + 1 * s, pk - 7 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#D8A838";
        ctx.beginPath();
        ctx.arc(cx, pk - 10.5 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();

      } else if (v === 2) {
        // === HALF-TIMBER MANOR ===
        const wW = 28 * s, wD = 18 * s, wH = 28 * s, rH = 20 * s;
        const iW = wW * 0.866, iD = wD * 0.5;
        const stoneH = wH * 0.4;

        // Foundation
        ctx.fillStyle = "#3E3028";
        ctx.beginPath();
        ctx.moveTo(cx, cy + iD + 3 * s);
        ctx.lineTo(cx + iW + 3 * s, cy + 3 * s);
        ctx.lineTo(cx, cy - iD + 3 * s);
        ctx.lineTo(cx - iW - 3 * s, cy + 3 * s);
        ctx.closePath();
        ctx.fill();

        // Lower left — stone
        hutStoneWall([cx - iW, cy], [cx, cy + iD], [cx, cy + iD - stoneH], [cx - iW, cy - stoneH], "#5A4A3A", 5);

        // Lower right — stone with gradient
        const lrG = ctx.createLinearGradient(cx, cy, cx + iW, cy);
        lrG.addColorStop(0, "#8A7A65");
        lrG.addColorStop(1, "#6A5A48");
        ctx.fillStyle = lrG;
        ctx.beginPath();
        ctx.moveTo(cx + iW, cy);
        ctx.lineTo(cx, cy + iD);
        ctx.lineTo(cx, cy + iD - stoneH);
        ctx.lineTo(cx + iW, cy - stoneH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(30,20,10,0.2)";
        ctx.lineWidth = 0.5 * s;
        for (let r = 0; r < 5; r++) {
          const t = (r + 0.5) / 5;
          ctx.beginPath();
          ctx.moveTo(cx + 1 * s, cy + iD - stoneH * t);
          ctx.lineTo(cx + iW - 1 * s, cy - stoneH * t);
          ctx.stroke();
        }

        // Overhang ledge
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(cx - iW - 3 * s, cy - stoneH);
        ctx.lineTo(cx + 3 * s, cy + iD - stoneH);
        ctx.lineTo(cx + 3 * s, cy + iD - stoneH + 2.5 * s);
        ctx.lineTo(cx - iW - 3 * s, cy - stoneH + 2.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4A3525";
        ctx.beginPath();
        ctx.moveTo(cx + iW + 3 * s, cy - stoneH);
        ctx.lineTo(cx - 3 * s, cy + iD - stoneH);
        ctx.lineTo(cx - 3 * s, cy + iD - stoneH + 2.5 * s);
        ctx.lineTo(cx + iW + 3 * s, cy - stoneH + 2.5 * s);
        ctx.closePath();
        ctx.fill();

        // Upper left — plaster
        ctx.fillStyle = "#C8B898";
        ctx.beginPath();
        ctx.moveTo(cx - iW, cy - stoneH);
        ctx.lineTo(cx, cy + iD - stoneH);
        ctx.lineTo(cx, cy + iD - wH);
        ctx.lineTo(cx - iW, cy - wH);
        ctx.closePath();
        ctx.fill();

        // Upper right — plaster
        const urG = ctx.createLinearGradient(cx, cy - stoneH, cx + iW, cy - stoneH);
        urG.addColorStop(0, "#D8C8A8");
        urG.addColorStop(1, "#C0B090");
        ctx.fillStyle = urG;
        ctx.beginPath();
        ctx.moveTo(cx + iW, cy - stoneH);
        ctx.lineTo(cx, cy + iD - stoneH);
        ctx.lineTo(cx, cy + iD - wH);
        ctx.lineTo(cx + iW, cy - wH);
        ctx.closePath();
        ctx.fill();

        // Timber frame right wall
        ctx.strokeStyle = "#3E2A1A";
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 2 * s, cy + iD - stoneH);
        ctx.lineTo(cx + 2 * s, cy + iD - wH);
        ctx.moveTo(cx + iW - 2 * s, cy - stoneH);
        ctx.lineTo(cx + iW - 2 * s, cy - wH);
        ctx.moveTo(cx + iW * 0.5, cy + iD * 0.5 - stoneH);
        ctx.lineTo(cx + iW * 0.5, cy + iD * 0.5 - wH);
        ctx.stroke();
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 1 * s, cy + iD - wH * 0.65);
        ctx.lineTo(cx + iW - 1 * s, cy - wH * 0.65);
        ctx.moveTo(cx + 1 * s, cy + iD - wH + 2 * s);
        ctx.lineTo(cx + iW - 1 * s, cy - wH + 2 * s);
        ctx.stroke();
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 3 * s, cy + iD - stoneH);
        ctx.lineTo(cx + iW * 0.48, cy + iD * 0.52 - wH);
        ctx.moveTo(cx + iW * 0.52, cy + iD * 0.48 - stoneH);
        ctx.lineTo(cx + iW - 3 * s, cy - wH);
        ctx.stroke();

        // Left wall timber
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - iW + 2 * s, cy - stoneH);
        ctx.lineTo(cx - iW + 2 * s, cy - wH);
        ctx.moveTo(cx - 2 * s, cy + iD - stoneH);
        ctx.lineTo(cx - 2 * s, cy + iD - wH);
        ctx.stroke();

        // Door
        hutDoor(cx + iW * 0.2, cy + iD * 0.7, 8 * s, 15 * s);

        // Windows
        for (let wi = 0; wi < 3; wi++) {
          const wwx = cx + iW * (0.15 + wi * 0.32);
          const wwy = cy + iD * (0.65 - wi * 0.32) - wH * 0.58;
          hutWin(wwx, wwy, 3 * s, 5.5 * s);
        }
        hutWin(cx - iW * 0.55, cy - wH * 0.6, 3.5 * s, 6 * s, true);

        // Roof
        hutRoof(cy - wH - rH, cy - wH, iW, iD, 6 * s, "#3A2A1A", "#5A4030", "#6A5040");

        // Isometric dormer
        const dwX = cx + iW * 0.35, dwY = cy - wH - rH * 0.4;
        const dW = 5 * s, dH = 7 * s, dD = 3 * s;
        // Right side wall (depth)
        ctx.fillStyle = "#A89878";
        ctx.beginPath();
        ctx.moveTo(dwX + dW, dwY + dH);
        ctx.lineTo(dwX + dW, dwY + 2 * s);
        ctx.lineTo(dwX + dW + dD * 0.5, dwY + 2 * s - dD * 0.3);
        ctx.lineTo(dwX + dW + dD * 0.5, dwY + dH - dD * 0.3);
        ctx.closePath();
        ctx.fill();
        // Front face wall
        ctx.fillStyle = "#C8B898";
        ctx.beginPath();
        ctx.moveTo(dwX - dW, dwY + dH);
        ctx.lineTo(dwX - dW, dwY + 2 * s);
        ctx.lineTo(dwX + dW, dwY + 2 * s);
        ctx.lineTo(dwX + dW, dwY + dH);
        ctx.closePath();
        ctx.fill();
        // Gable triangle (front)
        ctx.fillStyle = "#C8B898";
        ctx.beginPath();
        ctx.moveTo(dwX - dW, dwY + 2 * s);
        ctx.lineTo(dwX, dwY - 1 * s);
        ctx.lineTo(dwX + dW, dwY + 2 * s);
        ctx.closePath();
        ctx.fill();
        // Roof left slope (shadow)
        ctx.fillStyle = "#3A2A1A";
        ctx.beginPath();
        ctx.moveTo(dwX, dwY - 1 * s);
        ctx.lineTo(dwX - dW - 1 * s, dwY + 2 * s + 0.5 * s);
        ctx.lineTo(dwX + dD * 0.5 - dW - 1 * s, dwY + 2 * s + 0.5 * s - dD * 0.3);
        ctx.lineTo(dwX + dD * 0.5, dwY - 1 * s - dD * 0.3);
        ctx.closePath();
        ctx.fill();
        // Roof right slope (lit)
        ctx.fillStyle = "#5A4030";
        ctx.beginPath();
        ctx.moveTo(dwX, dwY - 1 * s);
        ctx.lineTo(dwX + dW + 1 * s, dwY + 2 * s + 0.5 * s);
        ctx.lineTo(dwX + dW + 1 * s + dD * 0.5, dwY + 2 * s + 0.5 * s - dD * 0.3);
        ctx.lineTo(dwX + dD * 0.5, dwY - 1 * s - dD * 0.3);
        ctx.closePath();
        ctx.fill();
        // Window opening
        ctx.fillStyle = "#1A1008";
        ctx.beginPath();
        ctx.moveTo(dwX - 2.5 * s, dwY + dH - 0.5 * s);
        ctx.lineTo(dwX - 2.5 * s, dwY + 3 * s);
        ctx.lineTo(dwX + 2.5 * s, dwY + 3 * s);
        ctx.lineTo(dwX + 2.5 * s, dwY + dH - 0.5 * s);
        ctx.closePath();
        ctx.fill();
        // Window glow
        const dwGl = ctx.createRadialGradient(dwX, dwY + 4.5 * s, 0, dwX, dwY + 4.5 * s, 3 * s);
        dwGl.addColorStop(0, "rgba(255,200,100,0.4)");
        dwGl.addColorStop(1, "rgba(220,160,60,0.05)");
        ctx.fillStyle = dwGl;
        ctx.fillRect(dwX - 2 * s, dwY + 3.5 * s, 4 * s, 3 * s);
        // Window mullions
        ctx.strokeStyle = "#3A2518";
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(dwX, dwY + 3 * s);
        ctx.lineTo(dwX, dwY + dH - 0.5 * s);
        ctx.moveTo(dwX - 2.5 * s, dwY + 4.5 * s);
        ctx.lineTo(dwX + 2.5 * s, dwY + 4.5 * s);
        ctx.stroke();

        // Chimney
        hutChimney(cx - iW * 0.3, cy - wH - rH - 5 * s, rH * 0.45);

      } else {
        // === ROUND STONE HUT ===
        const hR = 16 * s, hH = 18 * s, thatchH = 20 * s;

        // Cylinder wall
        const cwG = ctx.createLinearGradient(cx - hR, cy, cx + hR, cy);
        cwG.addColorStop(0, "#504840");
        cwG.addColorStop(0.35, "#8A7A65");
        cwG.addColorStop(0.7, "#6A5A48");
        cwG.addColorStop(1, "#504840");
        ctx.fillStyle = cwG;
        ctx.beginPath();
        ctx.ellipse(cx, cy, hR, hR * 0.45, 0, 0, Math.PI);
        ctx.lineTo(cx - hR, cy - hH);
        ctx.ellipse(cx, cy - hH, hR, hR * 0.45, 0, Math.PI, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        // Stone mortar
        ctx.strokeStyle = "rgba(30,20,10,0.2)";
        ctx.lineWidth = 0.6 * s;
        for (let r = 0; r < 6; r++) {
          const ry = cy - hH + (r + 0.5) * (hH / 6);
          ctx.beginPath();
          ctx.ellipse(cx, ry, hR + 0.5 * s, hR * 0.45, 0, 0.1, Math.PI - 0.1);
          ctx.stroke();
          const cols = 4 + (r % 2);
          for (let c = 0; c < cols; c++) {
            const ang = 0.3 + (c / cols) * (Math.PI - 0.6) + (r % 2 === 0 ? 0.15 : 0);
            const jx = cx + Math.cos(ang) * hR;
            const jy = ry + Math.sin(ang) * hR * 0.45 * 0.2;
            ctx.beginPath();
            ctx.moveTo(jx, jy);
            ctx.lineTo(jx, Math.min(ry + hH / 6, cy));
            ctx.stroke();
          }
        }

        // Top rim
        ctx.fillStyle = "#6A5A48";
        ctx.beginPath();
        ctx.ellipse(cx, cy - hH, hR + 1.5 * s, hR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7A6A58";
        ctx.beginPath();
        ctx.ellipse(cx, cy - hH, hR, hR * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Door
        hutDoor(cx + Math.cos(0.35) * hR * 0.72, cy + Math.sin(0.35) * hR * 0.3, 6 * s, 12 * s);

        // Windows
        hutWin(cx - hR * 0.62, cy - hH * 0.45, 3 * s, 5 * s);
        hutWin(cx + hR * 0.12, cy - hH * 0.5 + hR * 0.1, 2.5 * s, 4.5 * s);

        // Thatched roof — single gradient fill, zero internal edges
        const roofBase = cy - hH;
        const pk = roofBase - thatchH;
        const thLX = cx - hR - 6 * s, thRX = cx + hR + 6 * s;
        const thFY = roofBase + hR * 0.45 + 3 * s;
        const thBY = roofBase + 3 * s;

        const thG = ctx.createLinearGradient(thLX, thBY, thRX, thBY);
        thG.addColorStop(0, "#3A2A18");
        thG.addColorStop(0.45, "#4A3828");
        thG.addColorStop(1, "#6A5840");
        ctx.fillStyle = thG;
        ctx.beginPath();
        ctx.moveTo(cx, pk);
        ctx.lineTo(thLX, thBY);
        ctx.lineTo(cx, thFY);
        ctx.lineTo(thRX, thBY);
        ctx.closePath();
        ctx.fill();

        // Thatch texture lines
        ctx.strokeStyle = "rgba(90,70,40,0.15)";
        ctx.lineWidth = 0.7 * s;
        for (let r = 0; r < 7; r++) {
          const t = (r + 0.5) / 8;
          ctx.beginPath();
          ctx.moveTo(cx + (thLX - cx) * t, pk + (thBY - pk) * t);
          ctx.lineTo(cx, pk + (thFY - pk) * t);
          ctx.lineTo(cx + (thRX - cx) * t, pk + (thBY - pk) * t);
          ctx.stroke();
        }
        ctx.lineWidth = 0.5 * s;
        for (let b = 0; b < 8; b++) {
          const t = (b + 0.5) / 8;
          const bx = cx - (hR + 6 * s) + (hR + 6 * s) * 2 * t;
          const topT = Math.abs(bx - cx) / (hR + 6 * s);
          const by1 = pk + (roofBase + 3 * s - pk) * topT;
          ctx.beginPath();
          ctx.moveTo(bx, by1 + 2 * s);
          ctx.lineTo(bx, roofBase + 3 * s);
          ctx.stroke();
        }
        // Ridge highlight
        ctx.strokeStyle = "rgba(140,120,80,0.25)";
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx, pk);
        ctx.lineTo(cx + hR + 6 * s, roofBase + 3 * s);
        ctx.stroke();
        // Fascia edge
        ctx.fillStyle = "#4A3A28";
        ctx.beginPath();
        ctx.ellipse(cx, roofBase + 3 * s, hR + 6 * s, hR * 0.48, 0, 0, Math.PI);
        ctx.lineTo(cx - hR - 6 * s, roofBase + 5 * s);
        ctx.ellipse(cx, roofBase + 5 * s, hR + 6 * s, hR * 0.48, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        // Smoke hole
        ctx.fillStyle = "#2A1A10";
        ctx.beginPath();
        ctx.ellipse(cx, pk + 2 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        const smD = Math.sin(decorTime * 2.2 + decorX * 0.1) * 2.5 * s;
        ctx.fillStyle = "rgba(170,160,150,0.18)";
        ctx.beginPath();
        ctx.ellipse(cx + smD * 0.5, pk - 3 * s, 3 * s, 1.8 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(150,145,140,0.12)";
        ctx.beginPath();
        ctx.ellipse(cx + smD, pk - 8 * s, 4.5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "fire":
      const smokeOff = Math.sin(decorTime * 3) * 3 * s;
      ctx.fillStyle = "rgba(80,80,80,0.25)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + smokeOff,
        screenPos.y - 25 * s,
        8 * s,
        6 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "rgba(100,100,100,0.15)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - smokeOff * 0.5,
        screenPos.y - 35 * s,
        6 * s,
        4 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 15 * s;
      const flameH = 12 + Math.sin(decorTime * 8) * 4;
      const fireGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y - 5 * s,
        0,
        screenPos.x,
        screenPos.y - 5 * s,
        flameH * s
      );
      fireGrad.addColorStop(0, "#ffffff");
      fireGrad.addColorStop(0.2, "#ffff00");
      fireGrad.addColorStop(0.5, "#ff8800");
      fireGrad.addColorStop(0.8, "#ff4400");
      fireGrad.addColorStop(1, "rgba(200,50,0,0)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y);
      ctx.quadraticCurveTo(
        screenPos.x - 10 * s,
        screenPos.y - flameH * 0.5 * s,
        screenPos.x - 3 * s,
        screenPos.y - flameH * s
      );
      ctx.quadraticCurveTo(
        screenPos.x,
        screenPos.y - flameH * 1.2 * s,
        screenPos.x + 3 * s,
        screenPos.y - flameH * s
      );
      ctx.quadraticCurveTo(
        screenPos.x + 10 * s,
        screenPos.y - flameH * 0.5 * s,
        screenPos.x + 8 * s,
        screenPos.y
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#5d4037";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 2 * s,
        10 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;
    case "sword":
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(rotation);
      ctx.fillStyle = "#9e9e9e";
      ctx.beginPath();
      ctx.moveTo(0, -20 * s);
      ctx.lineTo(3 * s, -5 * s);
      ctx.lineTo(3 * s, 8 * s);
      ctx.lineTo(-3 * s, 8 * s);
      ctx.lineTo(-3 * s, -5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(-8 * s, 6 * s, 16 * s, 4 * s);
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(-2 * s, 10 * s, 4 * s, 10 * s);
      ctx.restore();
      break;
    case "arrow":
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(rotation);
      ctx.strokeStyle = "#5d4037";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(-12 * s, 0);
      ctx.lineTo(12 * s, 0);
      ctx.stroke();
      ctx.fillStyle = "#757575";
      ctx.beginPath();
      ctx.moveTo(12 * s, 0);
      ctx.lineTo(8 * s, -3 * s);
      ctx.lineTo(8 * s, 3 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8d6e63";
      ctx.beginPath();
      ctx.moveTo(-12 * s, 0);
      ctx.lineTo(-8 * s, -4 * s);
      ctx.lineTo(-8 * s, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-12 * s, 0);
      ctx.lineTo(-8 * s, 4 * s);
      ctx.lineTo(-8 * s, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    case "skeleton": {
      // Lying-down isometric skeleton — rotated along the ground plane
      // Uses ctx.rotate to orient the body along an isometric ground axis
      const bL = "#f0ebe3";
      const bM = "#ddd5c8";
      const bD = "#b8ad9e";
      const bS = "#8a7f72";
      const bSk = "#2d2420";
      const cx = screenPos.x;
      const cy = screenPos.y;
      const sv = variant % 4;

      // Each variant gets a different ground-plane angle + pose
      const skelAngles = [0.3, -0.35, 0.55, -0.15];
      const bodyAng = skelAngles[sv];

      // Ground shadow — rotated ellipse matching body orientation
      const skelShad = ctx.createRadialGradient(cx, cy + 2 * s, 0, cx, cy + 2 * s, 24 * s);
      skelShad.addColorStop(0, "rgba(0,0,0,0.18)");
      skelShad.addColorStop(0.6, "rgba(0,0,0,0.06)");
      skelShad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = skelShad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2 * s, 26 * s, 8 * s, bodyAng, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(bodyAng);

      // Helpers for 3D bone drawing in local rotated coordinates
      // drawBone: straight bone segment with shadow + lit dual-stroke
      const drawBone = (x1: number, y1: number, x2: number, y2: number,
        w: number, shd: string, lit: string) => {
        ctx.strokeStyle = shd;
        ctx.lineWidth = w * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1 * s, y1 * s);
        ctx.lineTo(x2 * s, y2 * s);
        ctx.stroke();
        ctx.strokeStyle = lit;
        ctx.lineWidth = w * 0.55 * s;
        ctx.beginPath();
        ctx.moveTo(x1 * s, (y1 - 0.5) * s);
        ctx.lineTo(x2 * s, (y2 - 0.5) * s);
        ctx.stroke();
      };
      // drawCBone: curved bone with quadratic bezier
      const drawCBone = (x1: number, y1: number, cpx: number, cpy: number,
        x2: number, y2: number, w: number, shd: string, lit: string) => {
        ctx.strokeStyle = shd;
        ctx.lineWidth = w * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1 * s, y1 * s);
        ctx.quadraticCurveTo(cpx * s, cpy * s, x2 * s, y2 * s);
        ctx.stroke();
        ctx.strokeStyle = lit;
        ctx.lineWidth = w * 0.55 * s;
        ctx.beginPath();
        ctx.moveTo(x1 * s, (y1 - 0.5) * s);
        ctx.quadraticCurveTo(cpx * s, (cpy - 0.5) * s, x2 * s, (y2 - 0.5) * s);
        ctx.stroke();
      };
      // drawJoint: small 3D joint circle
      const drawJoint = (jx: number, jy: number, jr: number) => {
        ctx.fillStyle = bS;
        ctx.beginPath();
        ctx.ellipse(jx * s, jy * s, jr * s, jr * 0.6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bM;
        ctx.beginPath();
        ctx.ellipse((jx + 0.3) * s, (jy - 0.3) * s, jr * 0.6 * s, jr * 0.35 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      };

      // === LOCAL COORDINATES ===
      // X axis: along the body (negative = head, positive = feet)
      // Y axis: perpendicular to body (positive = one side)
      // Y values kept small for isometric ground-plane flatness

      // === LEGS (drawn first — feet end, positive X) ===
      if (sv === 0) {
        // Straight legs, slight spread
        drawBone(9, -2, 19, -3.5, 2.2, bS, bD);
        drawBone(19, -3.5, 28, -2.5, 1.8, bS, bM);
        drawBone(9, 2, 19, 3.5, 2.2, bS, bL);
        drawBone(19, 3.5, 28, 2.5, 1.8, bD, bL);
        drawJoint(19, -3.5, 1.4);
        drawJoint(19, 3.5, 1.4);
        // Feet
        drawBone(28, -2.5, 30.5, -3.5, 0.8, bS, bD);
        drawBone(28, -2.5, 30.5, -1.5, 0.8, bS, bM);
        drawBone(28, 2.5, 30.5, 3.5, 0.8, bD, bL);
        drawBone(28, 2.5, 30.5, 1.5, 0.8, bD, bL);
      } else if (sv === 1) {
        // Legs apart, splayed
        drawBone(9, -2, 20, -5.5, 2.2, bS, bD);
        drawBone(20, -5.5, 29, -5, 1.8, bS, bM);
        drawBone(9, 2, 20, 5.5, 2.2, bS, bL);
        drawBone(20, 5.5, 29, 5, 1.8, bD, bL);
        drawJoint(20, -5.5, 1.4);
        drawJoint(20, 5.5, 1.4);
        drawBone(29, -5, 31.5, -6, 0.8, bS, bD);
        drawBone(29, -5, 31.5, -4, 0.8, bS, bM);
        drawBone(29, 5, 31.5, 6, 0.8, bD, bL);
        drawBone(29, 5, 31.5, 4, 0.8, bD, bL);
      } else if (sv === 2) {
        // One leg bent back
        drawBone(9, -2, 17, -5, 2.2, bS, bD);
        drawBone(17, -5, 14, -9, 1.8, bS, bM);
        drawBone(9, 2, 19, 3.5, 2.2, bS, bL);
        drawBone(19, 3.5, 28, 2.5, 1.8, bD, bL);
        drawJoint(17, -5, 1.4);
        drawJoint(19, 3.5, 1.4);
        drawBone(28, 2.5, 30.5, 3.5, 0.8, bD, bL);
        drawBone(28, 2.5, 30.5, 1.5, 0.8, bD, bL);
      } else {
        // One leg extended, one shorter (staggered)
        drawBone(9, -2, 21, -4, 2.2, bS, bD);
        drawBone(21, -4, 31, -3, 1.8, bS, bM);
        drawBone(9, 2, 16, 4.5, 2.2, bS, bL);
        drawBone(16, 4.5, 23, 5.5, 1.8, bD, bL);
        drawJoint(21, -4, 1.4);
        drawJoint(16, 4.5, 1.4);
        drawBone(31, -3, 33.5, -4, 0.8, bS, bD);
        drawBone(31, -3, 33.5, -2, 0.8, bS, bM);
        drawBone(23, 5.5, 25.5, 6.5, 0.8, bD, bL);
        drawBone(23, 5.5, 25.5, 4.5, 0.8, bD, bL);
      }

      // === PELVIS ===
      const plG = ctx.createRadialGradient(8 * s, -0.3 * s, 0, 8 * s, 0, 4.5 * s);
      plG.addColorStop(0, bM);
      plG.addColorStop(0.5, bD);
      plG.addColorStop(1, bS);
      ctx.fillStyle = plG;
      ctx.beginPath();
      ctx.ellipse(8 * s, 0, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(45,36,32,0.25)";
      ctx.beginPath();
      ctx.ellipse(8 * s, 0, 2 * s, 1.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bS;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.ellipse(8 * s, 0, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // === SPINE ===
      for (let sp = 0; sp < 7; sp++) {
        const spx = 6 - sp * 2.5;
        ctx.fillStyle = bS;
        ctx.beginPath();
        ctx.ellipse(spx * s, 0.2 * s, 1.2 * s, 0.8 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = sp % 2 === 0 ? bM : bD;
        ctx.beginPath();
        ctx.ellipse((spx + 0.15) * s, 0, 0.9 * s, 0.6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bL;
        ctx.beginPath();
        ctx.ellipse((spx + 0.25) * s, -0.25 * s, 0.5 * s, 0.3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // === RIBS ===
      for (let r = 0; r < 4; r++) {
        const rx = 4 - r * 2.5;
        const ribLen = (5 - r * 0.3);
        // Top rib
        ctx.strokeStyle = bS;
        ctx.lineWidth = 1.5 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(rx * s, 0);
        ctx.quadraticCurveTo(rx * s, -ribLen * 0.5 * s, (rx + 1) * s, -ribLen * s);
        ctx.stroke();
        ctx.strokeStyle = bD;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo((rx + 0.2) * s, 0);
        ctx.quadraticCurveTo((rx + 0.2) * s, (-ribLen * 0.5 - 0.3) * s, (rx + 1.2) * s, (-ribLen - 0.3) * s);
        ctx.stroke();
        // Bottom rib
        ctx.strokeStyle = bS;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(rx * s, 0);
        ctx.quadraticCurveTo(rx * s, ribLen * 0.5 * s, (rx + 1) * s, ribLen * s);
        ctx.stroke();
        ctx.strokeStyle = bL;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo((rx + 0.2) * s, 0);
        ctx.quadraticCurveTo((rx + 0.2) * s, (ribLen * 0.5 + 0.3) * s, (rx + 1.2) * s, (ribLen + 0.3) * s);
        ctx.stroke();
      }

      // === COLLARBONES ===
      drawCBone(-9, 0, -10, -2.5, -11, -4.5, 1.8, bS, bD);
      drawCBone(-9, 0, -10, 2.5, -11, 4.5, 1.8, bS, bL);

      // === ARMS — variant poses ===
      if (sv === 0) {
        // Arms at sides
        drawCBone(-11, -4.5, -7, -7, -3, -8.5, 1.8, bS, bD);
        drawCBone(-3, -8.5, 2, -9, 5, -7.5, 1.4, bS, bM);
        drawCBone(-11, 4.5, -7, 7, -3, 8.5, 1.8, bS, bL);
        drawCBone(-3, 8.5, 2, 9, 5, 7.5, 1.4, bD, bL);
        drawJoint(-3, -8.5, 1.2);
        drawJoint(-3, 8.5, 1.2);
        for (let f = -1; f <= 1; f++) {
          drawBone(5, -7.5 + f, 7, -7.8 + f * 1.3, 0.5, bS, bM);
          drawBone(5, 7.5 + f, 7, 7.8 + f * 1.3, 0.5, bD, bL);
        }
      } else if (sv === 1) {
        // Left arm above head, right at side
        drawCBone(-11, -4.5, -14, -7, -18, -5.5, 1.8, bS, bD);
        drawCBone(-18, -5.5, -22, -3, -24, -1, 1.4, bS, bM);
        drawCBone(-11, 4.5, -7, 7, -3, 8.5, 1.8, bS, bL);
        drawCBone(-3, 8.5, 2, 9, 5, 7.5, 1.4, bD, bL);
        drawJoint(-18, -5.5, 1.2);
        drawJoint(-3, 8.5, 1.2);
        for (let f = -1; f <= 1; f++) {
          drawBone(-24, -1 + f * 0.8, -26, -0.5 + f * 1, 0.5, bS, bM);
          drawBone(5, 7.5 + f, 7, 7.8 + f * 1.3, 0.5, bD, bL);
        }
      } else if (sv === 2) {
        // Arms crossed on chest
        drawCBone(-11, -4.5, -7, -2, -4, 2, 1.8, bS, bD);
        drawCBone(-4, 2, -2, 3.5, -5, 4.5, 1.4, bS, bM);
        drawCBone(-11, 4.5, -7, 2, -4, -2, 1.8, bS, bL);
        drawCBone(-4, -2, -2, -3.5, -5, -4.5, 1.4, bD, bL);
        drawJoint(-4, 2, 1.2);
        drawJoint(-4, -2, 1.2);
      } else {
        // One arm reaching out desperately, one at side
        drawCBone(-11, -4.5, -16, -8, -22, -7, 1.8, bS, bD);
        drawCBone(-22, -7, -27, -4, -30, -2, 1.4, bS, bM);
        drawCBone(-11, 4.5, -7, 7.5, -2, 9, 1.8, bS, bL);
        drawCBone(-2, 9, 3, 9, 6, 7.5, 1.4, bD, bL);
        drawJoint(-22, -7, 1.2);
        drawJoint(-2, 9, 1.2);
        for (let f = -1; f <= 1; f++) {
          drawBone(-30, -2 + f * 0.8, -32, -1.5 + f * 1.1, 0.5, bS, bM);
          drawBone(6, 7.5 + f, 8, 7.8 + f * 1.2, 0.5, bD, bL);
        }
      }

      // === SKULL (drawn last — head end, negative X) ===
      const skx = -15;

      // Skull shadow
      ctx.fillStyle = bS;
      ctx.beginPath();
      ctx.ellipse(skx * s, 0.7 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main cranium with gradient — circle in local coords becomes isometric on screen
      const skGr = ctx.createRadialGradient(
        (skx + 1) * s, -1 * s, 0.5 * s,
        skx * s, 0, 5.5 * s
      );
      skGr.addColorStop(0, bL);
      skGr.addColorStop(0.4, bM);
      skGr.addColorStop(0.8, bD);
      skGr.addColorStop(1, bS);
      ctx.fillStyle = skGr;
      ctx.beginPath();
      ctx.ellipse(skx * s, 0, 5.5 * s, 3.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Skull highlight
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.ellipse((skx + 1.2) * s, -1.3 * s, 2.5 * s, 1.5 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Brow ridge
      ctx.fillStyle = bD;
      ctx.beginPath();
      ctx.ellipse(skx * s, 0.3 * s, 4 * s, 0.6 * s, 0, 0, Math.PI);
      ctx.fill();

      // Eye sockets
      for (const ey of [{ yo: -1.3, edge: bS }, { yo: 1.3, edge: bD }]) {
        const eGr = ctx.createRadialGradient(
          skx * s, ey.yo * s, 0.15 * s,
          skx * s, ey.yo * s, 1.6 * s
        );
        eGr.addColorStop(0, "#0d0a08");
        eGr.addColorStop(0.5, bSk);
        eGr.addColorStop(1, ey.edge);
        ctx.fillStyle = eGr;
        ctx.beginPath();
        ctx.ellipse(skx * s, ey.yo * s, 1.6 * s, 1.2 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nasal cavity
      ctx.fillStyle = bSk;
      ctx.beginPath();
      ctx.moveTo((skx + 1.5) * s, 0);
      ctx.lineTo((skx + 2.8) * s, -0.6 * s);
      ctx.lineTo((skx + 2.8) * s, 0.5 * s);
      ctx.closePath();
      ctx.fill();

      // Jaw
      const jawG = ctx.createLinearGradient(skx * s, -3 * s, skx * s, 3 * s);
      jawG.addColorStop(0, bS);
      jawG.addColorStop(0.35, bD);
      jawG.addColorStop(0.65, bM);
      jawG.addColorStop(1, bS);
      ctx.fillStyle = jawG;
      ctx.beginPath();
      ctx.moveTo((skx + 1.5) * s, -3.2 * s);
      ctx.quadraticCurveTo((skx + 3.5) * s, -3.5 * s, (skx + 4) * s, -1.5 * s);
      ctx.lineTo((skx + 4) * s, 1.5 * s);
      ctx.quadraticCurveTo((skx + 3.5) * s, 3.5 * s, (skx + 1.5) * s, 3.2 * s);
      ctx.closePath();
      ctx.fill();

      // Teeth
      ctx.fillStyle = bL;
      ctx.strokeStyle = bS;
      ctx.lineWidth = 0.2 * s;
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.rect((skx + 2.8) * s, (t * 0.9 - 0.3) * s, 0.7 * s, 0.6 * s);
        ctx.fill();
        ctx.stroke();
      }

      // Skull outline
      ctx.strokeStyle = bS;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.ellipse(skx * s, 0, 5.5 * s, 3.8 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Suture lines
      ctx.strokeStyle = "rgba(138,127,114,0.25)";
      ctx.lineWidth = 0.3 * s;
      ctx.beginPath();
      ctx.moveTo((skx - 3) * s, 0);
      ctx.lineTo((skx - 0.5) * s, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((skx - 1.5) * s, -2.5 * s);
      ctx.quadraticCurveTo((skx - 2.5) * s, 0, (skx - 1.5) * s, 2.5 * s);
      ctx.stroke();

      ctx.restore();
      break;
    }
    case "barrel": {
      const brx = screenPos.x, bry = screenPos.y;
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(brx + 1, bry + 5 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Barrel body (curved cylinder front)
      const brG = ctx.createLinearGradient(brx - 8 * s, bry, brx + 8 * s, bry);
      brG.addColorStop(0, "#5D4037"); brG.addColorStop(0.35, "#8D6E63"); brG.addColorStop(0.7, "#6D4C41"); brG.addColorStop(1, "#4E342E");
      ctx.fillStyle = brG;
      ctx.beginPath();
      ctx.moveTo(brx - 6 * s, bry - 12 * s);
      ctx.lineTo(brx + 6 * s, bry - 12 * s);
      ctx.quadraticCurveTo(brx + 9 * s, bry - 5 * s, brx + 8 * s, bry + 3 * s);
      ctx.lineTo(brx - 8 * s, bry + 3 * s);
      ctx.quadraticCurveTo(brx - 9 * s, bry - 5 * s, brx - 6 * s, bry - 12 * s);
      ctx.closePath();
      ctx.fill();
      // Metal hoops
      ctx.strokeStyle = "#4A3525"; ctx.lineWidth = 1.5 * s;
      for (const hoopY of [bry - 8 * s, bry - 2 * s]) {
        const hw2 = hoopY < bry - 5 * s ? 7 * s : 7.5 * s;
        ctx.beginPath();
        ctx.moveTo(brx - hw2, hoopY);
        ctx.lineTo(brx + hw2, hoopY);
        ctx.stroke();
      }
      // Barrel top (ellipse)
      ctx.fillStyle = "#5D4037";
      ctx.beginPath();
      ctx.ellipse(brx, bry - 12 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Top rim highlight
      ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.ellipse(brx, bry - 12 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Wood grain lines
      ctx.strokeStyle = "rgba(40,25,15,0.15)"; ctx.lineWidth = 0.5 * s;
      for (let wg = 0; wg < 3; wg++) {
        const wgx = brx - 3 * s + wg * 3 * s;
        ctx.beginPath();
        ctx.moveTo(wgx, bry - 11 * s); ctx.lineTo(wgx + 0.5 * s, bry + 1 * s);
        ctx.stroke();
      }
      break;
    }
    case "fence": {
      const fx = screenPos.x;
      const fy = screenPos.y;
      const fv = variant % 4;
      const fLen = 34 * s;
      const fSeed = Math.floor(decorX * 73 + fy * 0.1);

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(fx + 2 * s, fy + 3 * s, fLen * 0.52, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      if (fv === 0) {
        // === WOODEN PALISADE — tall sharpened stakes, medieval defense ===
        const stakeCount = 7;
        const spacing = fLen / stakeCount;

        // Horizontal binding logs (isometric beams)
        const beamD = 2 * s;
        for (const beamY of [fy - 10 * s, fy - 18 * s]) {
          // Front face
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(fx - fLen * 0.5, beamY);
          ctx.lineTo(fx + fLen * 0.5, beamY);
          ctx.lineTo(fx + fLen * 0.5, beamY + 2.5 * s);
          ctx.lineTo(fx - fLen * 0.5, beamY + 2.5 * s);
          ctx.closePath();
          ctx.fill();
          // Top face
          ctx.fillStyle = "#6D4C41";
          ctx.beginPath();
          ctx.moveTo(fx - fLen * 0.5, beamY);
          ctx.lineTo(fx + fLen * 0.5, beamY);
          ctx.lineTo(fx + fLen * 0.5 + beamD, beamY - beamD * 0.5);
          ctx.lineTo(fx - fLen * 0.5 + beamD, beamY - beamD * 0.5);
          ctx.closePath();
          ctx.fill();
          // Right end cap
          ctx.fillStyle = "#3E2A1E";
          ctx.beginPath();
          ctx.moveTo(fx + fLen * 0.5, beamY);
          ctx.lineTo(fx + fLen * 0.5 + beamD, beamY - beamD * 0.5);
          ctx.lineTo(fx + fLen * 0.5 + beamD, beamY + 2.5 * s - beamD * 0.5);
          ctx.lineTo(fx + fLen * 0.5, beamY + 2.5 * s);
          ctx.closePath();
          ctx.fill();
        }

        for (let i = 0; i < stakeCount; i++) {
          const sx = fx - fLen * 0.5 + spacing * 0.5 + i * spacing;
          const stakeH = (20 + Math.sin(fSeed + i * 3.1) * 4) * s;
          const lean = Math.sin(fSeed + i * 2.3) * 0.03;
          ctx.save();
          ctx.translate(sx, fy);
          ctx.rotate(lean);

          // Stake side face (depth)
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(1.8 * s, 0); ctx.lineTo(2.8 * s, -1 * s);
          ctx.lineTo(2.8 * s, -stakeH + 3 * s); ctx.lineTo(1.8 * s + 0.5 * s, -stakeH);
          ctx.lineTo(1.8 * s, -stakeH + 3 * s);
          ctx.closePath(); ctx.fill();

          // Stake front face
          const stG = ctx.createLinearGradient(-2 * s, 0, 2 * s, 0);
          stG.addColorStop(0, "#8D6E63"); stG.addColorStop(0.5, "#A1887F"); stG.addColorStop(1, "#6D4C41");
          ctx.fillStyle = stG;
          ctx.beginPath();
          ctx.moveTo(-1.8 * s, 0); ctx.lineTo(1.8 * s, 0);
          ctx.lineTo(1.8 * s, -stakeH + 3 * s); ctx.lineTo(0, -stakeH);
          ctx.lineTo(-1.8 * s, -stakeH + 3 * s);
          ctx.closePath(); ctx.fill();

          // Sharp point highlight
          ctx.fillStyle = "#BCAAA4";
          ctx.beginPath();
          ctx.moveTo(0, -stakeH); ctx.lineTo(1 * s, -stakeH + 3 * s); ctx.lineTo(0, -stakeH + 2 * s);
          ctx.closePath(); ctx.fill();

          // Wood grain
          ctx.strokeStyle = "rgba(60,40,20,0.2)"; ctx.lineWidth = 0.4 * s;
          ctx.beginPath(); ctx.moveTo(0, -3 * s); ctx.lineTo(0, -stakeH + 5 * s); ctx.stroke();
          ctx.restore();
        }

      } else if (fv === 1) {
        // === STONE WALL with battlements — castle-style defense ===
        const wallH = 14 * s;
        const isoD2 = 3 * s;

        // Side face (depth)
        ctx.fillStyle = "#546E7A";
        ctx.beginPath();
        ctx.moveTo(fx + fLen * 0.5, fy); ctx.lineTo(fx + fLen * 0.5 + isoD2, fy - 1.5 * s);
        ctx.lineTo(fx + fLen * 0.5 + isoD2, fy - wallH - 1.5 * s); ctx.lineTo(fx + fLen * 0.5, fy - wallH);
        ctx.closePath(); ctx.fill();

        // Top surface
        ctx.fillStyle = "#90A4AE";
        ctx.beginPath();
        ctx.moveTo(fx - fLen * 0.5, fy - wallH); ctx.lineTo(fx + fLen * 0.5, fy - wallH);
        ctx.lineTo(fx + fLen * 0.5 + isoD2, fy - wallH - 1.5 * s); ctx.lineTo(fx - fLen * 0.5 + isoD2, fy - wallH - 1.5 * s);
        ctx.closePath(); ctx.fill();

        // Front face with stone blocks
        const fwG = ctx.createLinearGradient(fx, fy, fx, fy - wallH);
        fwG.addColorStop(0, "#607D8B"); fwG.addColorStop(0.5, "#78909C"); fwG.addColorStop(1, "#90A4AE");
        ctx.fillStyle = fwG;
        ctx.beginPath();
        ctx.moveTo(fx - fLen * 0.5, fy);
        ctx.lineTo(fx + fLen * 0.5, fy);
        ctx.lineTo(fx + fLen * 0.5, fy - wallH);
        ctx.lineTo(fx - fLen * 0.5, fy - wallH);
        ctx.closePath();
        ctx.fill();

        // Stone block outlines (as paths, not strokeRect)
        ctx.strokeStyle = "rgba(38,50,56,0.4)"; ctx.lineWidth = 0.8 * s;
        const rows = 3, cols = 6;
        for (let r = 0; r < rows; r++) {
          const rY = fy - r * (wallH / rows);
          const rH = wallH / rows;
          const off = r % 2 === 0 ? 0 : fLen / (cols * 2);
          for (let c = 0; c < cols; c++) {
            const bx2 = fx - fLen * 0.5 + off + c * (fLen / cols);
            ctx.beginPath();
            ctx.moveTo(bx2, rY); ctx.lineTo(bx2 + fLen / cols, rY);
            ctx.lineTo(bx2 + fLen / cols, rY - rH); ctx.lineTo(bx2, rY - rH);
            ctx.closePath(); ctx.stroke();
          }
        }

        // Battlements (isometric merlons)
        const merlonCount = 5;
        const merlonW = fLen / (merlonCount * 2 - 1);
        const merlonH = 5 * s;
        for (let m = 0; m < merlonCount; m++) {
          const mx = fx - fLen * 0.5 + m * merlonW * 2;
          // Front face
          ctx.fillStyle = "#78909C";
          ctx.beginPath();
          ctx.moveTo(mx, fy - wallH);
          ctx.lineTo(mx + merlonW, fy - wallH);
          ctx.lineTo(mx + merlonW, fy - wallH - merlonH);
          ctx.lineTo(mx, fy - wallH - merlonH);
          ctx.closePath();
          ctx.fill();
          // Side face (depth)
          ctx.fillStyle = "#546E7A";
          ctx.beginPath();
          ctx.moveTo(mx + merlonW, fy - wallH);
          ctx.lineTo(mx + merlonW + isoD2, fy - wallH - 1.5 * s);
          ctx.lineTo(mx + merlonW + isoD2, fy - wallH - merlonH - 1.5 * s);
          ctx.lineTo(mx + merlonW, fy - wallH - merlonH);
          ctx.closePath();
          ctx.fill();
          // Top face
          ctx.fillStyle = "#B0BEC5";
          ctx.beginPath();
          ctx.moveTo(mx, fy - wallH - merlonH); ctx.lineTo(mx + merlonW, fy - wallH - merlonH);
          ctx.lineTo(mx + merlonW + isoD2, fy - wallH - merlonH - 1.5 * s); ctx.lineTo(mx + isoD2, fy - wallH - merlonH - 1.5 * s);
          ctx.closePath(); ctx.fill();
        }

        // Moss patches
        ctx.fillStyle = "rgba(76,175,80,0.3)";
        for (let m = 0; m < 4; m++) {
          const mx = fx - fLen * 0.3 + m * 6 * s + Math.sin(fSeed + m) * 2 * s;
          const my = fy - Math.abs(Math.sin(fSeed + m * 2)) * 5 * s;
          ctx.beginPath(); ctx.ellipse(mx, my, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill();
        }

      } else if (fv === 2) {
        // === WROUGHT IRON FENCE — ornate spear-tip finials (isometric) ===
        const ironH = 22 * s;
        const barCount = 9;
        const barSpacing = fLen / barCount;
        const iD2 = 2 * s;

        // Bottom rail (isometric beam)
        ctx.fillStyle = "#263238";
        ctx.beginPath();
        ctx.moveTo(fx - fLen * 0.5, fy - 1 * s);
        ctx.lineTo(fx + fLen * 0.5, fy - 1 * s);
        ctx.lineTo(fx + fLen * 0.5, fy - 3 * s);
        ctx.lineTo(fx - fLen * 0.5, fy - 3 * s);
        ctx.closePath(); ctx.fill();
        // Top face
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(fx - fLen * 0.5, fy - 3 * s); ctx.lineTo(fx + fLen * 0.5, fy - 3 * s);
        ctx.lineTo(fx + fLen * 0.5 + iD2, fy - 3 * s - iD2 * 0.5); ctx.lineTo(fx - fLen * 0.5 + iD2, fy - 3 * s - iD2 * 0.5);
        ctx.closePath(); ctx.fill();
        // Right end
        ctx.fillStyle = "#1B2A30";
        ctx.beginPath();
        ctx.moveTo(fx + fLen * 0.5, fy - 1 * s); ctx.lineTo(fx + fLen * 0.5 + iD2, fy - 1 * s - iD2 * 0.5);
        ctx.lineTo(fx + fLen * 0.5 + iD2, fy - 3 * s - iD2 * 0.5); ctx.lineTo(fx + fLen * 0.5, fy - 3 * s);
        ctx.closePath(); ctx.fill();

        // Top rail (isometric beam)
        ctx.fillStyle = "#263238";
        ctx.beginPath();
        ctx.moveTo(fx - fLen * 0.5, fy - ironH + 6.5 * s);
        ctx.lineTo(fx + fLen * 0.5, fy - ironH + 6.5 * s);
        ctx.lineTo(fx + fLen * 0.5, fy - ironH + 4 * s);
        ctx.lineTo(fx - fLen * 0.5, fy - ironH + 4 * s);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(fx - fLen * 0.5, fy - ironH + 4 * s); ctx.lineTo(fx + fLen * 0.5, fy - ironH + 4 * s);
        ctx.lineTo(fx + fLen * 0.5 + iD2, fy - ironH + 4 * s - iD2 * 0.5); ctx.lineTo(fx - fLen * 0.5 + iD2, fy - ironH + 4 * s - iD2 * 0.5);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#1B2A30";
        ctx.beginPath();
        ctx.moveTo(fx + fLen * 0.5, fy - ironH + 6.5 * s); ctx.lineTo(fx + fLen * 0.5 + iD2, fy - ironH + 6.5 * s - iD2 * 0.5);
        ctx.lineTo(fx + fLen * 0.5 + iD2, fy - ironH + 4 * s - iD2 * 0.5); ctx.lineTo(fx + fLen * 0.5, fy - ironH + 4 * s);
        ctx.closePath(); ctx.fill();

        // Vertical bars with spear tips (isometric)
        for (let i = 0; i < barCount; i++) {
          const bx = fx - fLen * 0.5 + barSpacing * 0.5 + i * barSpacing;
          // Bar front face
          const barG = ctx.createLinearGradient(bx - 1 * s, 0, bx + 1 * s, 0);
          barG.addColorStop(0, "#37474F"); barG.addColorStop(0.4, "#546E7A"); barG.addColorStop(1, "#263238");
          ctx.fillStyle = barG;
          ctx.beginPath();
          ctx.moveTo(bx - 0.8 * s, fy - 1 * s);
          ctx.lineTo(bx + 0.8 * s, fy - 1 * s);
          ctx.lineTo(bx + 0.8 * s, fy - ironH + 2 * s);
          ctx.lineTo(bx - 0.8 * s, fy - ironH + 2 * s);
          ctx.closePath(); ctx.fill();
          // Bar side face
          ctx.fillStyle = "#1B2A30";
          ctx.beginPath();
          ctx.moveTo(bx + 0.8 * s, fy - 1 * s);
          ctx.lineTo(bx + 0.8 * s + 1 * s, fy - 1 * s - 0.5 * s);
          ctx.lineTo(bx + 0.8 * s + 1 * s, fy - ironH + 2 * s - 0.5 * s);
          ctx.lineTo(bx + 0.8 * s, fy - ironH + 2 * s);
          ctx.closePath(); ctx.fill();

          // Spear tip (front)
          ctx.fillStyle = "#455A64";
          ctx.beginPath();
          ctx.moveTo(bx, fy - ironH - 3 * s);
          ctx.lineTo(bx - 1.5 * s, fy - ironH + 2 * s);
          ctx.lineTo(bx + 1.5 * s, fy - ironH + 2 * s);
          ctx.closePath(); ctx.fill();
          // Spear tip side
          ctx.fillStyle = "#37474F";
          ctx.beginPath();
          ctx.moveTo(bx, fy - ironH - 3 * s);
          ctx.lineTo(bx + 0.3 * s, fy - ironH - 3.3 * s);
          ctx.lineTo(bx + 1.5 * s + 0.8 * s, fy - ironH + 2 * s - 0.4 * s);
          ctx.lineTo(bx + 1.5 * s, fy - ironH + 2 * s);
          ctx.closePath(); ctx.fill();
          // Spear tip highlight
          ctx.fillStyle = "#78909C";
          ctx.beginPath();
          ctx.moveTo(bx, fy - ironH - 3 * s);
          ctx.lineTo(bx + 0.5 * s, fy - ironH + 1 * s);
          ctx.lineTo(bx - 0.3 * s, fy - ironH + 1 * s);
          ctx.closePath(); ctx.fill();

          // Decorative curl (every other bar)
          if (i % 2 === 0) {
            ctx.strokeStyle = "#455A64"; ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.arc(bx, fy - ironH * 0.5, 2 * s, -Math.PI * 0.3, Math.PI * 0.8);
            ctx.stroke();
          }
        }

        // Isometric post caps at ends
        for (const px of [fx - fLen * 0.5, fx + fLen * 0.5]) {
          // Post front face
          ctx.fillStyle = "#37474F";
          ctx.beginPath();
          ctx.moveTo(px - 2 * s, fy); ctx.lineTo(px + 2 * s, fy);
          ctx.lineTo(px + 2 * s, fy - ironH - 1 * s); ctx.lineTo(px - 2 * s, fy - ironH - 1 * s);
          ctx.closePath(); ctx.fill();
          // Post side face
          ctx.fillStyle = "#263238";
          ctx.beginPath();
          ctx.moveTo(px + 2 * s, fy); ctx.lineTo(px + 2 * s + iD2, fy - iD2 * 0.5);
          ctx.lineTo(px + 2 * s + iD2, fy - ironH - 1 * s - iD2 * 0.5); ctx.lineTo(px + 2 * s, fy - ironH - 1 * s);
          ctx.closePath(); ctx.fill();
          // Sphere cap
          ctx.fillStyle = "#546E7A";
          ctx.beginPath(); ctx.arc(px + iD2 * 0.3, fy - ironH - 2.5 * s - iD2 * 0.15, 3 * s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#78909C";
          ctx.beginPath(); ctx.arc(px + iD2 * 0.3 - 0.5 * s, fy - ironH - 3 * s - iD2 * 0.15, 1.5 * s, 0, Math.PI * 2); ctx.fill();
        }

      } else {
        // === THORNY VINE FENCE — living barrier of twisted wood and thorns ===
        const vineH = 16 * s;
        const postCt = 4;
        const pSpacing = fLen / (postCt - 1);

        // Gnarled posts
        for (let i = 0; i < postCt; i++) {
          const px = fx - fLen * 0.5 + i * pSpacing;
          const twist = Math.sin(fSeed + i * 1.7) * 0.06;
          ctx.save(); ctx.translate(px, fy); ctx.rotate(twist);

          // Post (organic, tapered)
          const pgG = ctx.createLinearGradient(-2 * s, 0, 2 * s, 0);
          pgG.addColorStop(0, "#5D4037"); pgG.addColorStop(0.5, "#795548"); pgG.addColorStop(1, "#4E342E");
          ctx.fillStyle = pgG;
          ctx.beginPath();
          ctx.moveTo(-2 * s, 0); ctx.lineTo(2 * s, 0);
          ctx.lineTo(1.5 * s, -vineH - 2 * s); ctx.lineTo(-1 * s, -vineH - 3 * s);
          ctx.closePath(); ctx.fill();

          // Gnarly branch tips at top
          ctx.strokeStyle = "#5D4037"; ctx.lineWidth = 1.2 * s; ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(0, -vineH - 2 * s); ctx.lineTo(-2 * s, -vineH - 5 * s);
          ctx.moveTo(0, -vineH - 2 * s); ctx.lineTo(2 * s, -vineH - 4 * s);
          ctx.stroke();
          ctx.restore();
        }

        // Twisted vine connections between posts
        for (let i = 0; i < postCt - 1; i++) {
          const x1 = fx - fLen * 0.5 + i * pSpacing;
          const x2 = x1 + pSpacing;
          const mid = (x1 + x2) * 0.5;

          // Multiple vine strands
          for (let v2 = 0; v2 < 3; v2++) {
            const vy = fy - vineH * (0.25 + v2 * 0.25);
            const sag = (3 + v2 * 1.5) * s;
            const waveOff = Math.sin(fSeed + i * 2 + v2) * 2 * s;

            ctx.strokeStyle = v2 === 1 ? "#2A4A20" : "#3A5A2A";
            ctx.lineWidth = (1.5 - v2 * 0.3) * s;
            ctx.beginPath();
            ctx.moveTo(x1, vy);
            ctx.quadraticCurveTo(mid + waveOff, vy + sag, x2, vy);
            ctx.stroke();

            // Thorns along vine
            ctx.fillStyle = "#5D4037";
            for (let t = 0; t < 4; t++) {
              const tt = 0.2 + t * 0.2;
              const tx = x1 + (x2 - x1) * tt;
              const ty = vy + Math.sin(tt * Math.PI) * sag;
              const thornDir = t % 2 === 0 ? -1 : 1;
              ctx.beginPath();
              ctx.moveTo(tx, ty); ctx.lineTo(tx + thornDir * 2 * s, ty - 2 * s); ctx.lineTo(tx + thornDir * 0.5 * s, ty);
              ctx.fill();
            }
          }

          // Small leaves
          ctx.fillStyle = "rgba(50,80,40,0.6)";
          for (let l = 0; l < 5; l++) {
            const lt = 0.1 + l * 0.2;
            const lx = x1 + (x2 - x1) * lt + Math.sin(fSeed + l) * 2 * s;
            const ly = fy - vineH * 0.5 + Math.sin(lt * Math.PI) * 3 * s;
            ctx.beginPath();
            ctx.ellipse(lx, ly, 2 * s, 1 * s, Math.sin(fSeed + l) * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Small flowers on vines
        const flowerColors = ["#7A4030", "#8A7040", "#6A4060"];
        for (let f = 0; f < 3; f++) {
          const ffx = fx - fLen * 0.3 + f * fLen * 0.3 + Math.sin(fSeed + f * 3) * 3 * s;
          const ffy = fy - vineH * (0.3 + f * 0.2);
          ctx.fillStyle = flowerColors[f % 3];
          for (let p = 0; p < 4; p++) {
            const pa = p * Math.PI * 0.5;
            ctx.beginPath();
            ctx.ellipse(ffx + Math.cos(pa) * 1.5 * s, ffy + Math.sin(pa) * 0.8 * s, 1.2 * s, 0.8 * s, pa, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#B8A070";
          ctx.beginPath(); ctx.arc(ffx, ffy, 0.8 * s, 0, Math.PI * 2); ctx.fill();
        }
      }
      break;
    }
    case "gravestone": {
      const gsx = screenPos.x, gsy = screenPos.y;
      const gsD = 3 * s;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(gsx + 1, gsy + 4 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Side face (depth) — visible right edge of the slab
      ctx.fillStyle = "#555555";
      ctx.beginPath();
      ctx.moveTo(gsx + 7 * s, gsy + 2 * s);
      ctx.lineTo(gsx + 7 * s + gsD, gsy + 2 * s - gsD * 0.5);
      ctx.lineTo(gsx + 7 * s + gsD, gsy - 10 * s - gsD * 0.5);
      ctx.arc(gsx + gsD, gsy - 10 * s - gsD * 0.5, 7 * s, 0, -Math.PI * 0.5, true);
      ctx.lineTo(gsx + gsD, gsy - 17 * s - gsD * 0.5);
      ctx.lineTo(gsx, gsy - 17 * s);
      ctx.arc(gsx, gsy - 10 * s, 7 * s, -Math.PI * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // Front face
      const gsG = ctx.createLinearGradient(gsx - 7 * s, gsy, gsx + 7 * s, gsy);
      gsG.addColorStop(0, "#6E6E6E"); gsG.addColorStop(0.5, "#8A8A8A"); gsG.addColorStop(1, "#757575");
      ctx.fillStyle = gsG;
      ctx.beginPath();
      ctx.moveTo(gsx - 7 * s, gsy + 2 * s);
      ctx.lineTo(gsx - 7 * s, gsy - 10 * s);
      ctx.arc(gsx, gsy - 10 * s, 7 * s, Math.PI, 0);
      ctx.lineTo(gsx + 7 * s, gsy + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Top edge (curved isometric thickness)
      ctx.fillStyle = "#9E9E9E";
      ctx.beginPath();
      ctx.arc(gsx, gsy - 10 * s, 7 * s, Math.PI, 0);
      ctx.arc(gsx + gsD, gsy - 10 * s - gsD * 0.5, 7 * s, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();

      // Crack / cross detail
      ctx.strokeStyle = "#424242";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(gsx - 2 * s, gsy - 14 * s);
      ctx.lineTo(gsx, gsy - 5 * s);
      ctx.moveTo(gsx - 3 * s, gsy - 10 * s);
      ctx.lineTo(gsx + 2 * s, gsy - 10 * s);
      ctx.stroke();

      // Moss
      ctx.fillStyle = "rgba(76,175,80,0.25)";
      ctx.beginPath();
      ctx.ellipse(gsx - 3 * s, gsy + 0.5 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "tent": {
      const tx = screenPos.x;
      const ty = screenPos.y;
      const tv = variant % 4;

      // Ground shadow
      const tShadG = ctx.createRadialGradient(tx + 3 * s, ty + 5 * s, 0, tx + 3 * s, ty + 5 * s, 28 * s);
      tShadG.addColorStop(0, "rgba(0,0,0,0.3)"); tShadG.addColorStop(0.6, "rgba(0,0,0,0.08)"); tShadG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tShadG;
      ctx.beginPath(); ctx.ellipse(tx + 3 * s, ty + 5 * s, 28 * s, 12 * s, 0.1, 0, Math.PI * 2); ctx.fill();

      if (tv === 0) {
        // === MILITARY COMMAND TENT — large A-frame with war banner ===
        const tW = 18 * s, tD = 12 * s, tH = 22 * s;
        const tiW = tW * 0.866, tiD = tD * 0.5;
        const pk = ty - tH;

        // Ground cloth
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(tx, ty + tiD + 2 * s); ctx.lineTo(tx + tiW + 4 * s, ty + 2 * s);
        ctx.lineTo(tx, ty - tiD + 2 * s); ctx.lineTo(tx - tiW - 4 * s, ty + 2 * s);
        ctx.closePath(); ctx.fill();

        // Left fabric slope (dark canvas)
        const tlG = ctx.createLinearGradient(tx - tiW, ty, tx, pk);
        tlG.addColorStop(0, "#3A3020"); tlG.addColorStop(1, "#504535");
        ctx.fillStyle = tlG;
        ctx.beginPath();
        ctx.moveTo(tx - tiW - 3 * s, ty + 1 * s); ctx.lineTo(tx, ty + tiD + 1 * s);
        ctx.lineTo(tx, pk); ctx.closePath(); ctx.fill();

        // Right fabric slope (lit canvas)
        const trG = ctx.createLinearGradient(tx, pk, tx + tiW, ty);
        trG.addColorStop(0, "#6B5A40"); trG.addColorStop(1, "#504535");
        ctx.fillStyle = trG;
        ctx.beginPath();
        ctx.moveTo(tx + tiW + 3 * s, ty + 1 * s); ctx.lineTo(tx, ty + tiD + 1 * s);
        ctx.lineTo(tx, pk); ctx.closePath(); ctx.fill();

        // Front gable
        ctx.fillStyle = "#5A4830";
        ctx.beginPath();
        ctx.moveTo(tx - tiW - 3 * s, ty + 1 * s); ctx.lineTo(tx, pk); ctx.lineTo(tx + tiW + 3 * s, ty + 1 * s);
        ctx.closePath(); ctx.fill();

        // Dark entrance
        ctx.fillStyle = "rgba(20,15,10,0.85)";
        ctx.beginPath();
        ctx.moveTo(tx - tiW * 0.5, ty + 0.5 * s); ctx.lineTo(tx, pk + tH * 0.4);
        ctx.lineTo(tx + tiW * 0.5, ty + 0.5 * s); ctx.closePath(); ctx.fill();

        // Fabric folds on right face
        ctx.strokeStyle = "rgba(40,60,20,0.3)"; ctx.lineWidth = 0.8 * s;
        for (let f = 0; f < 3; f++) {
          const ft = 0.2 + f * 0.25;
          ctx.beginPath();
          ctx.moveTo(tx + tiW * ft + 2 * s, ty + tiD * (1 - ft) + 1 * s);
          ctx.lineTo(tx, pk + tH * ft * 0.4);
          ctx.stroke();
        }

        // Support pole (isometric)
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(tx - 1.5 * s, ty + tiD + 2 * s); ctx.lineTo(tx + 1.5 * s, ty + tiD + 2 * s);
        ctx.lineTo(tx + 1.5 * s, pk - 3 * s); ctx.lineTo(tx - 1.5 * s, pk - 3 * s);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.moveTo(tx + 1.5 * s, ty + tiD + 2 * s); ctx.lineTo(tx + 2.5 * s, ty + tiD + 1.5 * s);
        ctx.lineTo(tx + 2.5 * s, pk - 3.5 * s); ctx.lineTo(tx + 1.5 * s, pk - 3 * s);
        ctx.closePath(); ctx.fill();

        // War banner on pole
        const banSway = Math.sin(decorTime * 2.5 + decorX) * 3 * s;
        ctx.fillStyle = "#5A1A1A";
        ctx.beginPath();
        ctx.moveTo(tx, pk - 3 * s); ctx.lineTo(tx + 8 * s + banSway, pk - 1 * s);
        ctx.lineTo(tx + 7 * s + banSway * 0.8, pk + 5 * s);
        ctx.lineTo(tx + 8 * s + banSway * 0.5, pk + 3 * s);
        ctx.lineTo(tx, pk + 6 * s);
        ctx.closePath(); ctx.fill();
        // Banner emblem (star)
        ctx.fillStyle = "#B8A060";
        ctx.beginPath(); ctx.arc(tx + 4 * s + banSway * 0.5, pk + 1.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();

      } else if (tv === 1) {
        // === MARKET STALL — flat canopy on poles, open sides, hanging goods ===
        const canW = 20 * s, canD = 14 * s, canH = 18 * s;
        const ciW = canW * 0.866, ciD = canD * 0.5;

        // 4 support poles
        const poles = [
          { x: tx - ciW + 2 * s, y: ty + 1 * s }, { x: tx + ciW - 2 * s, y: ty + 1 * s },
          { x: tx - ciW + 4 * s, y: ty - ciD + 1 * s }, { x: tx + ciW, y: ty - ciD + 1 * s },
        ];
        for (const p of poles) {
          // Front face
          ctx.fillStyle = "#5D4037";
          ctx.beginPath();
          ctx.moveTo(p.x - 1 * s, p.y); ctx.lineTo(p.x + 1 * s, p.y);
          ctx.lineTo(p.x + 1 * s, p.y - canH); ctx.lineTo(p.x - 1 * s, p.y - canH);
          ctx.closePath(); ctx.fill();
          // Side face
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(p.x + 1 * s, p.y); ctx.lineTo(p.x + 2 * s, p.y - 0.5 * s);
          ctx.lineTo(p.x + 2 * s, p.y - canH - 0.5 * s); ctx.lineTo(p.x + 1 * s, p.y - canH);
          ctx.closePath(); ctx.fill();
          // Highlight
          ctx.fillStyle = "#795548";
          ctx.beginPath();
          ctx.moveTo(p.x - 0.5 * s, p.y); ctx.lineTo(p.x + 0.5 * s, p.y);
          ctx.lineTo(p.x + 0.5 * s, p.y - canH); ctx.lineTo(p.x - 0.5 * s, p.y - canH);
          ctx.closePath(); ctx.fill();
        }

        // Canopy top surface (striped fabric)
        const stripe1 = "#5A3A20", stripe2 = "#C8B896";
        // Top face diamond
        const cTop = ty - canH;
        ctx.fillStyle = stripe1;
        ctx.beginPath();
        ctx.moveTo(tx, cTop - ciD); ctx.lineTo(tx + ciW + 2 * s, cTop);
        ctx.lineTo(tx, cTop + ciD); ctx.lineTo(tx - ciW - 2 * s, cTop);
        ctx.closePath(); ctx.fill();

        // Stripes on canopy
        ctx.fillStyle = stripe2;
        for (let st = 0; st < 3; st++) {
          const sw = ciW * 0.3;
          const sx = tx - ciW + sw + st * sw * 2.2;
          ctx.beginPath();
          ctx.moveTo(sx, cTop - ciD * 0.8); ctx.lineTo(sx + sw, cTop - ciD * 0.6);
          ctx.lineTo(sx + sw, cTop + ciD * 0.6); ctx.lineTo(sx, cTop + ciD * 0.8);
          ctx.closePath(); ctx.fill();
        }

        // Front drape edge
        ctx.fillStyle = stripe1;
        ctx.beginPath();
        ctx.moveTo(tx - ciW - 2 * s, cTop); ctx.lineTo(tx + ciW + 2 * s, cTop);
        ctx.lineTo(tx + ciW + 2 * s, cTop + 3 * s); ctx.lineTo(tx - ciW - 2 * s, cTop + 3 * s);
        ctx.closePath(); ctx.fill();
        // Scalloped edge
        for (let sc = 0; sc < 6; sc++) {
          const scx = tx - ciW + sc * ciW * 0.4;
          ctx.fillStyle = stripe2;
          ctx.beginPath(); ctx.arc(scx, cTop + 3 * s, 2 * s, 0, Math.PI); ctx.fill();
        }

        // Table/counter under canopy (isometric)
        {
          const tblL = tx - ciW * 0.6, tblR = tx + ciW * 0.6;
          const tblD = 3 * s;
          // Table top
          ctx.fillStyle = "#795548";
          ctx.beginPath();
          ctx.moveTo(tblL, ty - 6 * s); ctx.lineTo(tblR, ty - 6 * s);
          ctx.lineTo(tblR + tblD, ty - 6 * s - tblD * 0.5);
          ctx.lineTo(tblL + tblD, ty - 6 * s - tblD * 0.5);
          ctx.closePath(); ctx.fill();
          // Table front
          ctx.fillStyle = "#5D4037";
          ctx.beginPath();
          ctx.moveTo(tblL, ty - 6 * s); ctx.lineTo(tblR, ty - 6 * s);
          ctx.lineTo(tblR, ty); ctx.lineTo(tblL, ty);
          ctx.closePath(); ctx.fill();
          // Table side
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(tblR, ty - 6 * s); ctx.lineTo(tblR + tblD, ty - 6 * s - tblD * 0.5);
          ctx.lineTo(tblR + tblD, ty - tblD * 0.5); ctx.lineTo(tblR, ty);
          ctx.closePath(); ctx.fill();
        }

        // Goods on table (pots, wares)
        ctx.fillStyle = "#7A5A3A";
        ctx.beginPath(); ctx.arc(tx - 5 * s, ty - 8 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#B8A050";
        ctx.beginPath(); ctx.arc(tx, ty - 8 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 2 * s, ty - 7.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#8D6E63";
        ctx.beginPath();
        ctx.moveTo(tx + 6 * s, ty - 6 * s); ctx.lineTo(tx + 5 * s, ty - 10 * s);
        ctx.lineTo(tx + 8 * s, ty - 10 * s); ctx.lineTo(tx + 9 * s, ty - 6 * s);
        ctx.closePath(); ctx.fill();

      } else if (tv === 2) {
        // === ROUND YURT — cylindrical base with domed roof ===
        const yR = 12 * s, yH = 10 * s, domeH = 10 * s;

        // Cylindrical base wall (isometric ellipse + height)
        ctx.fillStyle = "#8A7A6A";
        ctx.beginPath();
        ctx.ellipse(tx, ty, yR, yR * 0.45, 0, 0, Math.PI);
        ctx.lineTo(tx - yR, ty - yH);
        ctx.ellipse(tx, ty - yH, yR, yR * 0.45, 0, Math.PI, Math.PI * 2, true);
        ctx.closePath(); ctx.fill();

        // Gradient on visible cylinder wall
        const ywG = ctx.createLinearGradient(tx - yR, ty, tx + yR, ty);
        ywG.addColorStop(0, "#6A5A4A"); ywG.addColorStop(0.4, "#8A7A6A"); ywG.addColorStop(1, "#5A4A3A");
        ctx.fillStyle = ywG;
        ctx.beginPath();
        ctx.ellipse(tx, ty, yR, yR * 0.45, 0, 0, Math.PI);
        ctx.lineTo(tx - yR, ty - yH);
        ctx.ellipse(tx, ty - yH, yR, yR * 0.45, 0, Math.PI, Math.PI * 2, true);
        ctx.closePath(); ctx.fill();

        // Decorative band around middle
        ctx.strokeStyle = "#5A4030"; ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.ellipse(tx, ty - yH * 0.5, yR + 0.5 * s, yR * 0.45, 0, 0.05, Math.PI - 0.05);
        ctx.stroke();

        // Diamond pattern on band
        ctx.strokeStyle = "#8A7050"; ctx.lineWidth = 1 * s;
        for (let d = 0; d < 5; d++) {
          const da = 0.3 + d * 0.5;
          const dx = tx + Math.cos(da) * yR;
          const dy = ty - yH * 0.5 + Math.sin(da) * yR * 0.45;
          ctx.beginPath();
          ctx.moveTo(dx, dy - 2 * s); ctx.lineTo(dx + 2 * s, dy); ctx.lineTo(dx, dy + 2 * s); ctx.lineTo(dx - 2 * s, dy);
          ctx.closePath(); ctx.stroke();
        }

        // Dome roof
        ctx.fillStyle = "#8D6E63";
        ctx.beginPath();
        ctx.ellipse(tx, ty - yH, yR + 2 * s, yR * 0.5, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(tx + yR + 2 * s, ty - yH);
        ctx.closePath(); ctx.fill();

        // Dome top (raised)
        const dG = ctx.createRadialGradient(tx - 2 * s, ty - yH - domeH * 0.4, 0, tx, ty - yH, yR);
        dG.addColorStop(0, "#A1887F"); dG.addColorStop(0.5, "#795548"); dG.addColorStop(1, "#5D4037");
        ctx.fillStyle = dG;
        ctx.beginPath();
        ctx.ellipse(tx, ty - yH, yR + 2 * s, yR * 0.5, 0, Math.PI, Math.PI * 2);
        ctx.quadraticCurveTo(tx + yR * 0.5, ty - yH - domeH, tx, ty - yH - domeH);
        ctx.quadraticCurveTo(tx - yR * 0.5, ty - yH - domeH, tx - yR - 2 * s, ty - yH);
        ctx.closePath(); ctx.fill();

        // Smoke hole at top
        ctx.fillStyle = "#4E342E";
        ctx.beginPath(); ctx.ellipse(tx, ty - yH - domeH + 1 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill();

        // Door flap
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(tx + yR * 0.7, ty - 1 * s); ctx.lineTo(tx + yR * 0.5, ty - 8 * s);
        ctx.lineTo(tx + yR * 0.9, ty - 7 * s); ctx.lineTo(tx + yR, ty);
        ctx.closePath(); ctx.fill();

      } else {
        // === MYSTICAL PAVILION — silk drapes, floating magical orbs ===
        const pW = 16 * s, pH = 24 * s;
        const piW = pW * 0.866, piD = pW * 0.25;

        // 4 ornate poles
        const pPoles = [
          { x: tx - piW, y: ty + piD }, { x: tx + piW, y: ty + piD },
          { x: tx - piW + 3 * s, y: ty - piD }, { x: tx + piW - 3 * s, y: ty - piD },
        ];
        for (const p of pPoles) {
          // Ornate pole with spiral
          const poG = ctx.createLinearGradient(p.x - 1.5 * s, 0, p.x + 1.5 * s, 0);
          poG.addColorStop(0, "#2A2018"); poG.addColorStop(0.5, "#4A3A2A"); poG.addColorStop(1, "#2A2018");
          ctx.fillStyle = poG;
          ctx.fillRect(p.x - 1.5 * s, p.y - pH, 3 * s, pH);
          // Gold band
          ctx.fillStyle = "#8A7050";
          ctx.fillRect(p.x - 2 * s, p.y - pH, 4 * s, 1.5 * s);
          ctx.fillRect(p.x - 2 * s, p.y - 2 * s, 4 * s, 2 * s);
        }

        // Silk canopy - peaked roof
        const canPeak = ty - pH - 8 * s;
        // Left drape
        const plG = ctx.createLinearGradient(tx - piW, ty + piD, tx, canPeak);
        plG.addColorStop(0, "#2A3530"); plG.addColorStop(0.5, "#3A4A40"); plG.addColorStop(1, "#4A5A50");
        ctx.fillStyle = plG;
        ctx.beginPath();
        ctx.moveTo(tx - piW - 2 * s, ty + piD - pH); ctx.lineTo(tx, ty + piD * 2 - pH);
        ctx.lineTo(tx, canPeak); ctx.closePath(); ctx.fill();
        // Right drape
        const prG = ctx.createLinearGradient(tx, canPeak, tx + piW, ty + piD);
        prG.addColorStop(0, "#5A6A60"); prG.addColorStop(0.5, "#4A5A50"); prG.addColorStop(1, "#3A4A40");
        ctx.fillStyle = prG;
        ctx.beginPath();
        ctx.moveTo(tx + piW + 2 * s, ty + piD - pH); ctx.lineTo(tx, ty + piD * 2 - pH);
        ctx.lineTo(tx, canPeak); ctx.closePath(); ctx.fill();
        // Front face
        ctx.fillStyle = "#3A4A40";
        ctx.beginPath();
        ctx.moveTo(tx - piW - 2 * s, ty + piD - pH); ctx.lineTo(tx, canPeak);
        ctx.lineTo(tx + piW + 2 * s, ty + piD - pH); ctx.closePath(); ctx.fill();

        // Brass trim edge
        ctx.strokeStyle = "#8A7050"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(tx - piW - 2 * s, ty + piD - pH); ctx.lineTo(tx, canPeak);
        ctx.lineTo(tx + piW + 2 * s, ty + piD - pH);
        ctx.stroke();

        // Hanging dark drapes from canopy
        ctx.fillStyle = "rgba(50,60,50,0.4)";
        for (let d = 0; d < 2; d++) {
          const dx = tx - piW * 0.5 + d * piW;
          ctx.beginPath();
          ctx.moveTo(dx, ty + piD - pH); ctx.lineTo(dx - 3 * s, ty + piD - pH + 10 * s);
          ctx.quadraticCurveTo(dx, ty + piD - pH + 14 * s, dx + 3 * s, ty + piD - pH + 10 * s);
          ctx.closePath(); ctx.fill();
        }

        // Floating magical orbs
        for (let o = 0; o < 3; o++) {
          const orbPhase = decorTime * 1.5 + o * 2.1;
          const ox = tx - 8 * s + o * 8 * s + Math.sin(orbPhase) * 3 * s;
          const oy = ty - pH * 0.4 + Math.cos(orbPhase * 0.7) * 4 * s;
          const oGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 5 * s);
          oGlow.addColorStop(0, "rgba(200,160,80,0.5)"); oGlow.addColorStop(0.5, "rgba(180,130,50,0.15)"); oGlow.addColorStop(1, "rgba(150,100,30,0)");
          ctx.fillStyle = oGlow;
          ctx.beginPath(); ctx.arc(ox, oy, 5 * s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(240,210,150,0.7)";
          ctx.beginPath(); ctx.arc(ox, oy, 1.5 * s, 0, Math.PI * 2); ctx.fill();
        }

        // Brass finial at peak
        ctx.fillStyle = "#8A7050";
        ctx.beginPath(); ctx.arc(tx, canPeak - 2 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#B0A080";
        ctx.beginPath(); ctx.arc(tx - 0.5 * s, canPeak - 2.5 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "flowers": {
      // Enhanced 3D flowers with detailed petals and stems
      const flowerPalettes = [
        { petals: ["#8A5040", "#9A6A5A", "#B0897A"], center: "#C8A860", stem: "#2A4A20", stemDark: "#1A3515" },
        { petals: ["#9A8040", "#B09A60", "#C8B880"], center: "#8A6030", stem: "#3A5A2A", stemDark: "#2A4520" },
        { petals: ["#7A4A6A", "#8A5A7A", "#A07A90"], center: "#B8A060", stem: "#2A4A25", stemDark: "#1A3515" },
        { petals: ["#5A7A8A", "#7A9AA0", "#90B0B8"], center: "#A09050", stem: "#354A30", stemDark: "#2A3A25" },
      ];
      const fp = flowerPalettes[variant % 4];

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small grass tufts at base
      ctx.strokeStyle = fp.stem;
      ctx.lineWidth = 1.5 * s;
      for (let g = 0; g < 5; g++) {
        const gx = screenPos.x + (g - 2) * 5 * s;
        const sway = Math.sin(decorTime * 2 + g) * 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(gx, screenPos.y);
        ctx.quadraticCurveTo(gx + sway * 0.5, screenPos.y - 4 * s, gx + sway, screenPos.y - 7 * s);
        ctx.stroke();
      }

      // Draw 5 flowers with different heights and angles
      const flowerPositions = [
        { x: -8, y: 0, height: 18, angle: -0.15 },
        { x: 0, y: 0, height: 22, angle: 0.05 },
        { x: 8, y: 0, height: 16, angle: 0.2 },
        { x: -4, y: -2, height: 14, angle: -0.08 },
        { x: 5, y: -1, height: 13, angle: 0.12 },
      ];

      flowerPositions.forEach((fl, idx) => {
        const fx = screenPos.x + fl.x * s;
        const fy = screenPos.y + fl.y * s;
        const sway = Math.sin(decorTime * 1.5 + idx * 0.7) * 2 * s;

        // Stem with gradient
        const stemGrad = ctx.createLinearGradient(fx, fy, fx, fy - fl.height * s);
        stemGrad.addColorStop(0, fp.stemDark);
        stemGrad.addColorStop(1, fp.stem);
        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(fx + sway * 0.3 + fl.angle * 10 * s, fy - fl.height * 0.5 * s, fx + sway + fl.angle * 8 * s, fy - fl.height * s);
        ctx.stroke();

        // Leaf on stem
        if (idx < 3) {
          ctx.fillStyle = fp.stem;
          ctx.save();
          ctx.translate(fx + sway * 0.2, fy - fl.height * 0.4 * s);
          ctx.rotate(fl.angle + 0.3);
          ctx.beginPath();
          ctx.ellipse(3 * s, 0, 4 * s, 1.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Flower head position
        const headX = fx + sway + fl.angle * 8 * s;
        const headY = fy - fl.height * s;
        const petalSize = 3 + (idx === 1 ? 1 : 0);

        // Petals - layered for 3D effect
        for (let layer = 0; layer < 2; layer++) {
          const layerOffset = layer * 0.3;
          const layerSize = petalSize - layer * 0.5;

          for (let p = 0; p < 5; p++) {
            const pa = (p / 5) * Math.PI * 2 + layerOffset + decorTime * 0.3;
            const petalX = headX + Math.cos(pa) * layerSize * s;
            const petalY = headY + Math.sin(pa) * layerSize * 0.5 * s - layer * 1.5 * s;

            ctx.fillStyle = layer === 0 ? fp.petals[0] : fp.petals[1];
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 2.5 * s, 1.8 * s, pa, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Flower center with gradient
        const centerGrad = ctx.createRadialGradient(headX - 0.5 * s, headY - 2 * s, 0, headX, headY - 1.5 * s, 2.5 * s);
        centerGrad.addColorStop(0, "#FFF8E1");
        centerGrad.addColorStop(0.5, fp.center);
        centerGrad.addColorStop(1, fp.petals[0]);
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(headX, headY - 1.5 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();

        // Pollen dots on center
        ctx.fillStyle = "#8D6E63";
        for (let d = 0; d < 3; d++) {
          const da = (d / 3) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(headX + Math.cos(da) * 0.8 * s, headY - 1.5 * s + Math.sin(da) * 0.4 * s, 0.4 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      break;
    }
    case "signpost": {
      const sx = screenPos.x;
      const sy = screenPos.y;
      const sv = variant % 4;

      // Ground shadow
      const sShadG = ctx.createRadialGradient(sx + 2 * s, sy + 3 * s, 0, sx + 2 * s, sy + 3 * s, 14 * s);
      sShadG.addColorStop(0, "rgba(0,0,0,0.25)"); sShadG.addColorStop(0.6, "rgba(0,0,0,0.06)"); sShadG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sShadG;
      ctx.beginPath(); ctx.ellipse(sx + 2 * s, sy + 3 * s, 14 * s, 6 * s, 0.15, 0, Math.PI * 2); ctx.fill();

      if (sv === 0) {
        // === CROSSROADS SIGN — 3 arrow boards at different angles, skull decoration ===
        const pH = 28 * s;

        // Dirt mound
        ctx.fillStyle = "#6D4C41";
        ctx.beginPath(); ctx.ellipse(sx, sy + 1 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill();

        // Post with gradient (front face)
        const sPostG = ctx.createLinearGradient(sx - 2 * s, 0, sx + 2 * s, 0);
        sPostG.addColorStop(0, "#795548"); sPostG.addColorStop(0.5, "#A1887F"); sPostG.addColorStop(1, "#5D4037");
        ctx.fillStyle = sPostG;
        ctx.beginPath();
        ctx.moveTo(sx - 2 * s, sy); ctx.lineTo(sx + 2 * s, sy);
        ctx.lineTo(sx + 2 * s, sy - pH); ctx.lineTo(sx - 2 * s, sy - pH);
        ctx.closePath(); ctx.fill();
        // Side face
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.moveTo(sx + 2 * s, sy); ctx.lineTo(sx + 3.5 * s, sy - 1 * s);
        ctx.lineTo(sx + 3.5 * s, sy - pH - 1 * s); ctx.lineTo(sx + 2 * s, sy - pH);
        ctx.closePath(); ctx.fill();
        // Top face
        ctx.fillStyle = "#8D6E63";
        ctx.beginPath();
        ctx.moveTo(sx - 2 * s, sy - pH); ctx.lineTo(sx + 2 * s, sy - pH);
        ctx.lineTo(sx + 3.5 * s, sy - pH - 1 * s); ctx.lineTo(sx - 0.5 * s, sy - pH - 1 * s);
        ctx.closePath(); ctx.fill();

        // Three arrow boards at different heights/angles
        const boards = [
          { y: sy - pH + 4 * s, dir: 1, len: 14, tilt: -0.08 },
          { y: sy - pH + 12 * s, dir: -1, len: 12, tilt: 0.05 },
          { y: sy - pH + 19 * s, dir: 1, len: 10, tilt: -0.12 },
        ];
        const boardColors = ["#8D6E63", "#A1887F", "#795548"];

        for (let bi = 0; bi < boards.length; bi++) {
          const b = boards[bi];
          const bLen = b.len * s;
          const bH = 5 * s;
          ctx.save();
          ctx.translate(sx, b.y);
          ctx.rotate(b.tilt);

          // Board thickness
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(0, bH); ctx.lineTo(b.dir * bLen, bH);
          ctx.lineTo(b.dir * (bLen + 3 * s), bH * 0.5 + 1 * s);
          ctx.lineTo(b.dir * bLen, 1 * s); ctx.lineTo(0, 1 * s);
          ctx.closePath(); ctx.fill();

          // Board face
          const bG = ctx.createLinearGradient(0, 0, 0, bH);
          bG.addColorStop(0, boardColors[bi]); bG.addColorStop(1, "#5D4037");
          ctx.fillStyle = bG;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(b.dir * bLen, 0);
          ctx.lineTo(b.dir * (bLen + 3 * s), bH * 0.5);
          ctx.lineTo(b.dir * bLen, bH); ctx.lineTo(0, bH);
          ctx.closePath(); ctx.fill();

          // Nail
          ctx.fillStyle = "#FFD54F";
          ctx.beginPath(); ctx.arc(b.dir * 2 * s, bH * 0.5, 0.7 * s, 0, Math.PI * 2); ctx.fill();

          // Weathered text
          ctx.fillStyle = "rgba(62,39,35,0.4)";
          for (let t = 0; t < 3; t++) {
            ctx.fillRect(b.dir * (4 + t * 3) * s, bH * 0.3, 2 * s, 1.5 * s);
          }
          ctx.restore();
        }

        // Skull decoration on top
        ctx.fillStyle = "#E8E0D0";
        ctx.beginPath(); ctx.ellipse(sx, sy - pH - 3 * s, 3.5 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1a1510";
        ctx.beginPath(); ctx.ellipse(sx - 1.2 * s, sy - pH - 3.5 * s, 0.8 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(sx + 1.2 * s, sy - pH - 3.5 * s, 0.8 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx - 0.5 * s, sy - pH - 1.5 * s); ctx.lineTo(sx + 0.5 * s, sy - pH - 1.5 * s); ctx.stroke();

      } else if (sv === 1) {
        // === TAVERN HANGING SIGN — iron bracket with swinging sign ===
        const pH2 = 26 * s;

        // Post (isometric)
        const tavG = ctx.createLinearGradient(sx - 2 * s, 0, sx + 2 * s, 0);
        tavG.addColorStop(0, "#5D4037"); tavG.addColorStop(0.5, "#795548"); tavG.addColorStop(1, "#4E342E");
        ctx.fillStyle = tavG;
        ctx.beginPath();
        ctx.moveTo(sx - 2 * s, sy); ctx.lineTo(sx + 2 * s, sy);
        ctx.lineTo(sx + 2 * s, sy - pH2); ctx.lineTo(sx - 2 * s, sy - pH2);
        ctx.closePath(); ctx.fill();
        // Post side face
        ctx.fillStyle = "#3E2A1E";
        ctx.beginPath();
        ctx.moveTo(sx + 2 * s, sy); ctx.lineTo(sx + 3.5 * s, sy - 1 * s);
        ctx.lineTo(sx + 3.5 * s, sy - pH2 - 1 * s); ctx.lineTo(sx + 2 * s, sy - pH2);
        ctx.closePath(); ctx.fill();

        // Iron bracket (L-shape extending right)
        ctx.strokeStyle = "#37474F"; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx + 2 * s, sy - pH2 + 3 * s);
        ctx.lineTo(sx + 12 * s, sy - pH2 + 3 * s);
        ctx.stroke();
        // Decorative scroll on bracket
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(sx + 12 * s, sy - pH2 + 5 * s, 2 * s, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
        // Bracket support
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(sx + 2 * s, sy - pH2 + 8 * s);
        ctx.lineTo(sx + 8 * s, sy - pH2 + 3 * s);
        ctx.stroke();

        // Hanging chains
        const signSwing = Math.sin(decorTime * 1.5 + decorX * 0.1) * 0.03;
        ctx.save();
        ctx.translate(sx + 7 * s, sy - pH2 + 3 * s);
        ctx.rotate(signSwing);

        ctx.strokeStyle = "#455A64"; ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(-4 * s, 0); ctx.lineTo(-4 * s, 4 * s);
        ctx.moveTo(4 * s, 0); ctx.lineTo(4 * s, 4 * s);
        ctx.stroke();

        // Hanging sign board (isometric)
        const sbW = 12 * s, sbH = 10 * s, sbD = 2 * s;
        // Board bottom edge (thickness)
        ctx.fillStyle = "#3E2A1E";
        ctx.beginPath();
        ctx.moveTo(-sbW * 0.5, 4 * s + sbH); ctx.lineTo(sbW * 0.5, 4 * s + sbH);
        ctx.lineTo(sbW * 0.5 + sbD, 4 * s + sbH - sbD * 0.5); ctx.lineTo(-sbW * 0.5 + sbD, 4 * s + sbH - sbD * 0.5);
        ctx.closePath(); ctx.fill();
        // Board side face (right edge)
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.moveTo(sbW * 0.5, 4 * s); ctx.lineTo(sbW * 0.5 + sbD, 4 * s - sbD * 0.5);
        ctx.lineTo(sbW * 0.5 + sbD, 4 * s + sbH - sbD * 0.5); ctx.lineTo(sbW * 0.5, 4 * s + sbH);
        ctx.closePath(); ctx.fill();
        // Board face
        const sbG = ctx.createLinearGradient(0, 4 * s, 0, 4 * s + sbH);
        sbG.addColorStop(0, "#A1887F"); sbG.addColorStop(0.5, "#8D6E63"); sbG.addColorStop(1, "#795548");
        ctx.fillStyle = sbG;
        ctx.beginPath();
        ctx.moveTo(-sbW * 0.5, 4 * s); ctx.lineTo(sbW * 0.5, 4 * s);
        ctx.lineTo(sbW * 0.5, 4 * s + sbH); ctx.lineTo(-sbW * 0.5, 4 * s + sbH);
        ctx.closePath(); ctx.fill();
        // Gold border
        ctx.strokeStyle = "#FFD54F"; ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(-sbW * 0.5 + 1 * s, 5 * s); ctx.lineTo(sbW * 0.5 - 1 * s, 5 * s);
        ctx.lineTo(sbW * 0.5 - 1 * s, 4 * s + sbH - 1 * s); ctx.lineTo(-sbW * 0.5 + 1 * s, 4 * s + sbH - 1 * s);
        ctx.closePath(); ctx.stroke();

        // Tankard icon on sign
        ctx.fillStyle = "#FFD54F";
        ctx.beginPath();
        ctx.moveTo(-2 * s, 6 * s); ctx.lineTo(2 * s, 6 * s);
        ctx.lineTo(2 * s, 11 * s); ctx.lineTo(-2 * s, 11 * s);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(2.5 * s, 8.5 * s, 1.5 * s, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
        // Foam top
        ctx.fillStyle = "#FFF8E1";
        ctx.beginPath(); ctx.ellipse(0, 6 * s, 2.5 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();

        ctx.restore();

      } else if (sv === 2) {
        // === QUEST BOARD — large notice board with pinned papers ===
        const pH3 = 22 * s;

        // Two support posts (isometric)
        const qpD = 2 * s;
        for (const px of [sx - 10 * s, sx + 10 * s]) {
          const spG = ctx.createLinearGradient(px - 1.5 * s, 0, px + 1.5 * s, 0);
          spG.addColorStop(0, "#795548"); spG.addColorStop(0.5, "#8D6E63"); spG.addColorStop(1, "#5D4037");
          ctx.fillStyle = spG;
          ctx.beginPath();
          ctx.moveTo(px - 1.5 * s, sy); ctx.lineTo(px + 1.5 * s, sy);
          ctx.lineTo(px + 1.5 * s, sy - pH3); ctx.lineTo(px - 1.5 * s, sy - pH3);
          ctx.closePath(); ctx.fill();
          // Side face
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(px + 1.5 * s, sy); ctx.lineTo(px + 1.5 * s + qpD, sy - qpD * 0.5);
          ctx.lineTo(px + 1.5 * s + qpD, sy - pH3 - qpD * 0.5); ctx.lineTo(px + 1.5 * s, sy - pH3);
          ctx.closePath(); ctx.fill();
        }

        // Board backing (isometric)
        const bbW = 22 * s, bbH = 14 * s;
        const bbY = sy - pH3 + 3 * s;
        // Side face (right edge)
        ctx.fillStyle = "#3E2A1E";
        ctx.beginPath();
        ctx.moveTo(sx + bbW * 0.5, bbY); ctx.lineTo(sx + bbW * 0.5 + qpD, bbY - qpD * 0.5);
        ctx.lineTo(sx + bbW * 0.5 + qpD, bbY + bbH - qpD * 0.5); ctx.lineTo(sx + bbW * 0.5, bbY + bbH);
        ctx.closePath(); ctx.fill();
        // Bottom edge
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.moveTo(sx - bbW * 0.5, bbY + bbH); ctx.lineTo(sx + bbW * 0.5, bbY + bbH);
        ctx.lineTo(sx + bbW * 0.5 + qpD, bbY + bbH - qpD * 0.5); ctx.lineTo(sx - bbW * 0.5 + qpD, bbY + bbH - qpD * 0.5);
        ctx.closePath(); ctx.fill();
        // Face
        const bbG = ctx.createLinearGradient(sx, bbY, sx, bbY + bbH);
        bbG.addColorStop(0, "#A1887F"); bbG.addColorStop(1, "#8D6E63");
        ctx.fillStyle = bbG;
        ctx.beginPath();
        ctx.moveTo(sx - bbW * 0.5, bbY); ctx.lineTo(sx + bbW * 0.5, bbY);
        ctx.lineTo(sx + bbW * 0.5, bbY + bbH); ctx.lineTo(sx - bbW * 0.5, bbY + bbH);
        ctx.closePath(); ctx.fill();
        // Frame border
        ctx.strokeStyle = "#5D4037"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(sx - bbW * 0.5, bbY); ctx.lineTo(sx + bbW * 0.5, bbY);
        ctx.lineTo(sx + bbW * 0.5, bbY + bbH); ctx.lineTo(sx - bbW * 0.5, bbY + bbH);
        ctx.closePath(); ctx.stroke();

        // Pinned papers/parchments
        const papers = [
          { x: -7, y: 2, w: 7, h: 8, rot: -0.05, color: "#FFF8E1" },
          { x: 1, y: 1, w: 8, h: 9, rot: 0.03, color: "#EFEBE9" },
          { x: 6, y: 3, w: 6, h: 7, rot: -0.08, color: "#FFF3E0" },
          { x: -2, y: 6, w: 5, h: 5, rot: 0.06, color: "#FFFDE7" },
        ];
        for (const p of papers) {
          ctx.save();
          ctx.translate(sx + p.x * s, bbY + p.y * s);
          ctx.rotate(p.rot);
          // Paper shadow
          ctx.fillStyle = "rgba(0,0,0,0.1)";
          ctx.fillRect(0.5 * s, 0.5 * s, p.w * s, p.h * s);
          // Paper
          ctx.fillStyle = p.color;
          ctx.fillRect(0, 0, p.w * s, p.h * s);
          // Text lines
          ctx.fillStyle = "rgba(60,40,20,0.3)";
          for (let l = 0; l < 3; l++) {
            ctx.fillRect(0.5 * s, (1 + l * 2) * s, (p.w - 1) * s, 0.8 * s);
          }
          // Pin
          ctx.fillStyle = "#F44336";
          ctx.beginPath(); ctx.arc(p.w * 0.5 * s, 0, 1 * s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#FFCDD2";
          ctx.beginPath(); ctx.arc(p.w * 0.5 * s - 0.3 * s, -0.3 * s, 0.4 * s, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        // "QUESTS" header carved into top frame
        ctx.fillStyle = "rgba(62,39,35,0.5)";
        ctx.fillRect(sx - 6 * s, bbY - 2 * s, 12 * s, 2 * s);

        // Small roof overhang (isometric)
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(sx - bbW * 0.55, bbY - 1 * s); ctx.lineTo(sx, bbY - 4 * s);
        ctx.lineTo(sx + bbW * 0.55, bbY - 1 * s); ctx.closePath(); ctx.fill();
        // Roof depth
        ctx.fillStyle = "#4E342E";
        ctx.beginPath();
        ctx.moveTo(sx, bbY - 4 * s); ctx.lineTo(sx + bbW * 0.55, bbY - 1 * s);
        ctx.lineTo(sx + bbW * 0.55 + qpD, bbY - 1 * s - qpD * 0.5);
        ctx.lineTo(sx + qpD, bbY - 4 * s - qpD * 0.5);
        ctx.closePath(); ctx.fill();

      } else {
        // === ANCIENT WAYSTONE — runed stone pillar with magical glow ===
        const stoneH = 24 * s;
        const stoneW = 6 * s;
        const stiW = stoneW * 0.866, stiD = stoneW * 0.4;

        // Base stones
        ctx.fillStyle = "#546E7A";
        ctx.beginPath(); ctx.ellipse(sx, sy + 1 * s, 8 * s, 3.5 * s, 0, 0, Math.PI * 2); ctx.fill();

        // Pillar left face
        ctx.fillStyle = "#455A64";
        ctx.beginPath();
        ctx.moveTo(sx - stiW, sy); ctx.lineTo(sx, sy + stiD);
        ctx.lineTo(sx, sy + stiD - stoneH); ctx.lineTo(sx - stiW * 0.85, sy - stoneH + 2 * s);
        ctx.closePath(); ctx.fill();

        // Pillar right face
        const stG = ctx.createLinearGradient(sx, sy, sx + stiW, sy);
        stG.addColorStop(0, "#607D8B"); stG.addColorStop(1, "#546E7A");
        ctx.fillStyle = stG;
        ctx.beginPath();
        ctx.moveTo(sx + stiW, sy); ctx.lineTo(sx, sy + stiD);
        ctx.lineTo(sx, sy + stiD - stoneH); ctx.lineTo(sx + stiW * 0.85, sy - stoneH + 2 * s);
        ctx.closePath(); ctx.fill();

        // Pointed top
        ctx.fillStyle = "#78909C";
        ctx.beginPath();
        ctx.moveTo(sx, sy - stoneH - 5 * s);
        ctx.lineTo(sx - stiW * 0.85, sy - stoneH + 2 * s);
        ctx.lineTo(sx, sy + stiD - stoneH);
        ctx.lineTo(sx + stiW * 0.85, sy - stoneH + 2 * s);
        ctx.closePath(); ctx.fill();

        // Glowing runes on right face
        const runeGlow = 0.4 + Math.sin(decorTime * 2) * 0.2;
        ctx.strokeStyle = `rgba(200,160,80,${runeGlow})`; ctx.lineWidth = 1.2 * s;
        const runes = [
          { y: 0.2, type: 0 }, { y: 0.4, type: 1 }, { y: 0.6, type: 2 }, { y: 0.8, type: 0 },
        ];
        for (const r of runes) {
          const rx = sx + stiW * 0.45;
          const ry = sy - stoneH * r.y;
          if (r.type === 0) {
            ctx.beginPath(); ctx.moveTo(rx - 1.5 * s, ry - 1.5 * s); ctx.lineTo(rx, ry - 3 * s); ctx.lineTo(rx + 1.5 * s, ry - 1.5 * s); ctx.lineTo(rx, ry); ctx.closePath(); ctx.stroke();
          } else if (r.type === 1) {
            ctx.beginPath(); ctx.arc(rx, ry - 1.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx, ry - 3 * s); ctx.lineTo(rx, ry); ctx.stroke();
          } else {
            ctx.beginPath(); ctx.moveTo(rx - 2 * s, ry); ctx.lineTo(rx, ry - 3 * s); ctx.lineTo(rx + 2 * s, ry); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rx - 1.5 * s, ry - 1.5 * s); ctx.lineTo(rx + 1.5 * s, ry - 1.5 * s); ctx.stroke();
          }
        }

        // Ambient glow around stone
        const ambG = ctx.createRadialGradient(sx, sy - stoneH * 0.5, 0, sx, sy - stoneH * 0.5, 12 * s);
        ambG.addColorStop(0, `rgba(200,160,80,${runeGlow * 0.15})`); ambG.addColorStop(1, "rgba(200,160,80,0)");
        ctx.fillStyle = ambG;
        ctx.beginPath(); ctx.arc(sx, sy - stoneH * 0.5, 12 * s, 0, Math.PI * 2); ctx.fill();

        // Floating particles
        for (let p = 0; p < 4; p++) {
          const pPhase = decorTime + p * 1.5;
          const ppx = sx + Math.sin(pPhase * 0.8) * 6 * s;
          const ppy = sy - stoneH * 0.3 - (pPhase % 3) * 5 * s;
          const pAlpha = 0.3 + Math.sin(pPhase * 2) * 0.2;
          ctx.fillStyle = `rgba(200,170,100,${pAlpha})`;
          ctx.beginPath(); ctx.arc(ppx, ppy, 0.8 * s, 0, Math.PI * 2); ctx.fill();
        }
      }
      break;
    }
    case "fountain": {
      // Enhanced 3D isometric ornate fountain with animated water
      const fountainBaseX = screenPos.x;
      const fountainBaseY = screenPos.y;
      const waterTime = decorTime * 3;

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(fountainBaseX, fountainBaseY + 5 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer basin - stone rim
      const stoneGrad = ctx.createLinearGradient(
        fountainBaseX - 22 * s, 0, fountainBaseX + 22 * s, 0
      );
      stoneGrad.addColorStop(0, "#707880");
      stoneGrad.addColorStop(0.3, "#90A4AE");
      stoneGrad.addColorStop(0.7, "#B0BEC5");
      stoneGrad.addColorStop(1, "#78909C");

      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.ellipse(fountainBaseX, fountainBaseY, 22 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Basin inner wall
      ctx.fillStyle = "#607D8B";
      ctx.beginPath();
      ctx.ellipse(fountainBaseX, fountainBaseY - 2 * s, 18 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water surface with ripple effect
      const waterGrad = ctx.createRadialGradient(
        fountainBaseX, fountainBaseY - 3 * s, 0,
        fountainBaseX, fountainBaseY - 3 * s, 15 * s
      );
      waterGrad.addColorStop(0, "#81D4FA");
      waterGrad.addColorStop(0.5, "#4FC3F7");
      waterGrad.addColorStop(1, "#29B6F6");

      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(fountainBaseX, fountainBaseY - 3 * s, 15 * s, 7.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water ripples
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1 * s;
      for (let r = 0; r < 3; r++) {
        const ripplePhase = (waterTime + r * 0.7) % 2;
        const rippleSize = 4 + ripplePhase * 5;
        const rippleAlpha = 1 - ripplePhase / 2;
        ctx.strokeStyle = `rgba(255,255,255,${rippleAlpha * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(fountainBaseX, fountainBaseY - 3 * s, rippleSize * s, rippleSize * 0.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central pillar/pedestal
      ctx.fillStyle = "#78909C";
      ctx.fillRect(fountainBaseX - 3 * s, fountainBaseY - 18 * s, 6 * s, 15 * s);

      // Pillar highlight
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(fountainBaseX - 1 * s, fountainBaseY - 18 * s, 2 * s, 15 * s);

      // Top bowl
      ctx.fillStyle = "#90A4AE";
      ctx.beginPath();
      ctx.ellipse(fountainBaseX, fountainBaseY - 18 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top bowl water
      ctx.fillStyle = "#81D4FA";
      ctx.beginPath();
      ctx.ellipse(fountainBaseX, fountainBaseY - 19 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water spray from center
      const sprayHeight = 12 + Math.sin(waterTime * 2) * 3;
      const sprayGrad = ctx.createLinearGradient(
        0, fountainBaseY - 19 * s - sprayHeight * s,
        0, fountainBaseY - 19 * s
      );
      sprayGrad.addColorStop(0, "rgba(255,255,255,0.9)");
      sprayGrad.addColorStop(0.5, "rgba(225,245,254,0.7)");
      sprayGrad.addColorStop(1, "rgba(129,212,250,0.4)");

      ctx.fillStyle = sprayGrad;
      ctx.beginPath();
      ctx.moveTo(fountainBaseX - 2 * s, fountainBaseY - 19 * s);
      ctx.quadraticCurveTo(
        fountainBaseX - 4 * s, fountainBaseY - 25 * s,
        fountainBaseX, fountainBaseY - 19 * s - sprayHeight * s
      );
      ctx.quadraticCurveTo(
        fountainBaseX + 4 * s, fountainBaseY - 25 * s,
        fountainBaseX + 2 * s, fountainBaseY - 19 * s
      );
      ctx.closePath();
      ctx.fill();

      // Water droplets
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let d = 0; d < 6; d++) {
        const dropPhase = (waterTime * 1.5 + d * 0.4) % 1;
        const dropAngle = (d / 6) * Math.PI * 2;
        const dropDist = 3 + dropPhase * 8;
        const dropX = fountainBaseX + Math.cos(dropAngle) * dropDist * s;
        const dropY = fountainBaseY - 19 * s + dropPhase * 16 * s - sprayHeight * (1 - dropPhase) * s * 0.5;
        const dropSize = (1 - dropPhase) * 1.5;

        ctx.beginPath();
        ctx.arc(dropX, dropY, dropSize * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water falling from top bowl
      ctx.strokeStyle = "rgba(129,212,250,0.5)";
      ctx.lineWidth = 2 * s;
      for (let w = 0; w < 4; w++) {
        const wAngle = (w / 4) * Math.PI * 2 + waterTime * 0.5;
        const wX = fountainBaseX + Math.cos(wAngle) * 6 * s;
        const waveOffset = Math.sin(waterTime * 4 + w) * 2 * s;

        ctx.beginPath();
        ctx.moveTo(wX, fountainBaseY - 18 * s);
        ctx.quadraticCurveTo(
          wX + waveOffset, fountainBaseY - 10 * s,
          fountainBaseX + Math.cos(wAngle) * 10 * s, fountainBaseY - 3 * s
        );
        ctx.stroke();
      }

      // Sparkle on water
      const sparklePhase = waterTime % 1;
      if (sparklePhase < 0.3) {
        ctx.fillStyle = `rgba(255,255,255,${1 - sparklePhase / 0.3})`;
        ctx.beginPath();
        ctx.arc(fountainBaseX + 5 * s, fountainBaseY - 4 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "bench": {
      const bx = screenPos.x;
      const by = screenPos.y;
      const bv = variant % 4;

      // Ground shadow
      const bShadG = ctx.createRadialGradient(bx + 2 * s, by + 3 * s, 0, bx + 2 * s, by + 3 * s, 18 * s);
      bShadG.addColorStop(0, "rgba(0,0,0,0.22)"); bShadG.addColorStop(0.6, "rgba(0,0,0,0.06)"); bShadG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bShadG;
      ctx.beginPath(); ctx.ellipse(bx + 2 * s, by + 3 * s, 18 * s, 7 * s, 0.1, 0, Math.PI * 2); ctx.fill();

      if (bv === 0) {
        // === ORNATE STONE BENCH — carved with lion armrests ===
        const bW = 22 * s, bD = 6 * s, sH = 8 * s;
        const biW = bW * 0.5, biD = bD * 0.3;

        // Seat block - left face
        ctx.fillStyle = "#607D8B";
        ctx.beginPath();
        ctx.moveTo(bx - biW, by); ctx.lineTo(bx, by + biD);
        ctx.lineTo(bx, by + biD - sH); ctx.lineTo(bx - biW, by - sH);
        ctx.closePath(); ctx.fill();

        // Seat block - right face
        const bsG = ctx.createLinearGradient(bx, by, bx + biW, by);
        bsG.addColorStop(0, "#90A4AE"); bsG.addColorStop(1, "#78909C");
        ctx.fillStyle = bsG;
        ctx.beginPath();
        ctx.moveTo(bx + biW, by); ctx.lineTo(bx, by + biD);
        ctx.lineTo(bx, by + biD - sH); ctx.lineTo(bx + biW, by - sH);
        ctx.closePath(); ctx.fill();

        // Seat top face
        ctx.fillStyle = "#B0BEC5";
        ctx.beginPath();
        ctx.moveTo(bx, by - sH - biD); ctx.lineTo(bx + biW, by - sH);
        ctx.lineTo(bx, by + biD - sH); ctx.lineTo(bx - biW, by - sH);
        ctx.closePath(); ctx.fill();

        // Carved decorative pattern on front face
        ctx.strokeStyle = "rgba(38,50,56,0.3)"; ctx.lineWidth = 0.8 * s;
        // Scroll pattern
        ctx.beginPath();
        ctx.arc(bx - biW * 0.3, by - sH * 0.5, 2 * s, 0, Math.PI);
        ctx.arc(bx, by - sH * 0.5, 2 * s, Math.PI, 0);
        ctx.arc(bx + biW * 0.3, by - sH * 0.5, 2 * s, 0, Math.PI);
        ctx.stroke();

        // Lion armrests (left and right)
        for (const dir of [-1, 1]) {
          const lx = bx + dir * (biW + 2 * s);
          const ly = by - sH;
          // Lion body block
          ctx.fillStyle = "#78909C";
          ctx.beginPath();
          ctx.moveTo(lx - 3 * s, ly + sH); ctx.lineTo(lx + 3 * s, ly + sH);
          ctx.lineTo(lx + 2.5 * s, ly - 4 * s); ctx.lineTo(lx - 2.5 * s, ly - 4 * s);
          ctx.closePath(); ctx.fill();
          // Lion head
          ctx.fillStyle = "#90A4AE";
          ctx.beginPath(); ctx.arc(lx, ly - 5 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
          // Mane
          ctx.fillStyle = "#78909C";
          ctx.beginPath(); ctx.arc(lx, ly - 5.5 * s, 3.5 * s, Math.PI * 0.3, Math.PI * 1.2); ctx.fill();
          // Eyes
          ctx.fillStyle = "#263238";
          ctx.beginPath(); ctx.arc(lx - 1 * s, ly - 5.5 * s, 0.5 * s, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(lx + 1 * s, ly - 5.5 * s, 0.5 * s, 0, Math.PI * 2); ctx.fill();
        }

      } else if (bv === 1) {
        // === RUSTIC LOG BENCH — split log on tree stumps ===
        const logLen = 24 * s, logR = 3 * s;
        const stumpH = 7 * s, stumpR = 3.5 * s;

        // Two stumps
        for (const dir of [-1, 1]) {
          const stx = bx + dir * 8 * s;
          // Stump cylinder - front
          const stG = ctx.createLinearGradient(stx - stumpR, by, stx + stumpR, by);
          stG.addColorStop(0, "#6D4C41"); stG.addColorStop(0.4, "#8D6E63"); stG.addColorStop(1, "#5D4037");
          ctx.fillStyle = stG;
          ctx.beginPath();
          ctx.ellipse(stx, by, stumpR, stumpR * 0.4, 0, 0, Math.PI);
          ctx.lineTo(stx - stumpR, by - stumpH);
          ctx.ellipse(stx, by - stumpH, stumpR, stumpR * 0.4, 0, Math.PI, Math.PI * 2, true);
          ctx.closePath(); ctx.fill();

          // Stump top (rings)
          ctx.fillStyle = "#A1887F";
          ctx.beginPath(); ctx.ellipse(stx, by - stumpH, stumpR, stumpR * 0.4, 0, 0, Math.PI * 2); ctx.fill();
          // Growth rings
          ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = 0.4 * s;
          ctx.beginPath(); ctx.ellipse(stx, by - stumpH, stumpR * 0.6, stumpR * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(stx, by - stumpH, stumpR * 0.3, stumpR * 0.12, 0, 0, Math.PI * 2); ctx.stroke();

          // Bark texture
          ctx.strokeStyle = "rgba(62,39,35,0.25)"; ctx.lineWidth = 0.5 * s;
          for (let b = 0; b < 3; b++) {
            const bby = by - 2 * s - b * 2 * s;
            ctx.beginPath();
            ctx.moveTo(stx - stumpR + 1 * s, bby);
            ctx.lineTo(stx + stumpR - 1 * s, bby);
            ctx.stroke();
          }
        }

        // Split log seat - half-cylinder shape
        // Flat top face (isometric)
        const logTop = by - stumpH - 0.5 * s;
        ctx.fillStyle = "#BCAAA4";
        ctx.beginPath();
        ctx.moveTo(bx - logLen * 0.5, logTop); ctx.lineTo(bx + logLen * 0.5, logTop);
        ctx.lineTo(bx + logLen * 0.5 + 2 * s, logTop - 1 * s);
        ctx.lineTo(bx - logLen * 0.5 + 2 * s, logTop - 1 * s);
        ctx.closePath(); ctx.fill();

        // Log rounded front face
        const lgG = ctx.createLinearGradient(bx, logTop, bx, logTop + logR);
        lgG.addColorStop(0, "#A1887F"); lgG.addColorStop(0.5, "#8D6E63"); lgG.addColorStop(1, "#6D4C41");
        ctx.fillStyle = lgG;
        ctx.beginPath();
        ctx.moveTo(bx - logLen * 0.5, logTop);
        ctx.lineTo(bx + logLen * 0.5, logTop);
        ctx.ellipse(bx + logLen * 0.5, logTop, logR * 0.3, logR, 0, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(bx - logLen * 0.5, logTop + logR);
        ctx.ellipse(bx - logLen * 0.5, logTop, logR * 0.3, logR, 0, Math.PI * 0.5, -Math.PI * 0.5);
        ctx.closePath(); ctx.fill();

        // Wood grain on flat top
        ctx.strokeStyle = "rgba(93,64,55,0.2)"; ctx.lineWidth = 0.5 * s;
        for (let g = 0; g < 4; g++) {
          const gx = bx - logLen * 0.35 + g * logLen * 0.23;
          ctx.beginPath(); ctx.moveTo(gx, logTop - 0.5 * s); ctx.lineTo(gx + 1 * s, logTop - 1 * s); ctx.stroke();
        }

        // Mushroom growing on end
        ctx.fillStyle = "#E8E0D0";
        ctx.fillRect(bx + logLen * 0.5 - 1 * s, logTop - 2 * s, 1 * s, 2 * s);
        ctx.fillStyle = "#F44336";
        ctx.beginPath(); ctx.ellipse(bx + logLen * 0.5 - 0.5 * s, logTop - 2.5 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill();

      } else if (bv === 2) {
        // === ORNATE IRON GARDEN BENCH — scrollwork metal ===
        const gbW = 20 * s, gbH = 8 * s, backH2 = 10 * s;

        // Iron legs with scrollwork
        for (const dir of [-1, 1]) {
          const lx = bx + dir * gbW * 0.42;
          // Leg main
          const ilG = ctx.createLinearGradient(lx - 2 * s, 0, lx + 2 * s, 0);
          ilG.addColorStop(0, "#37474F"); ilG.addColorStop(0.5, "#546E7A"); ilG.addColorStop(1, "#263238");
          ctx.fillStyle = ilG;
          ctx.beginPath();
          ctx.moveTo(lx - 2.5 * s, by); ctx.lineTo(lx + 2.5 * s, by);
          ctx.lineTo(lx + 1.5 * s, by - gbH); ctx.lineTo(lx - 1.5 * s, by - gbH);
          ctx.closePath(); ctx.fill();

          // Scroll decoration on leg
          ctx.strokeStyle = "#546E7A"; ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.arc(lx, by - gbH * 0.4, 2.5 * s, Math.PI * 0.2, Math.PI * 1.3);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(lx, by - gbH * 0.7, 1.5 * s, -Math.PI * 0.3, Math.PI * 0.8);
          ctx.stroke();

          // Small foot
          ctx.fillStyle = "#455A64";
          ctx.beginPath(); ctx.ellipse(lx - 1.5 * s, by + 0.5 * s, 2 * s, 0.8 * s, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(lx + 1.5 * s, by + 0.5 * s, 2 * s, 0.8 * s, 0, 0, Math.PI * 2); ctx.fill();
        }

        // Seat frame (metal rails - isometric)
        const seatY2 = by - gbH;
        ctx.fillStyle = "#455A64";
        ctx.beginPath();
        ctx.moveTo(bx - gbW * 0.48, seatY2); ctx.lineTo(bx + gbW * 0.48, seatY2);
        ctx.lineTo(bx + gbW * 0.48, seatY2 + 1.5 * s); ctx.lineTo(bx - gbW * 0.48, seatY2 + 1.5 * s);
        ctx.closePath(); ctx.fill();
        // Seat slats (wood - isometric)
        for (let sl = 0; sl < 5; sl++) {
          const slX = bx - gbW * 0.42 + sl * gbW * 0.21;
          ctx.fillStyle = sl % 2 === 0 ? "#A1887F" : "#8D6E63";
          ctx.beginPath();
          ctx.moveTo(slX, seatY2 - 1 * s); ctx.lineTo(slX + gbW * 0.18, seatY2 - 1 * s);
          ctx.lineTo(slX + gbW * 0.18, seatY2 + 0.5 * s); ctx.lineTo(slX, seatY2 + 0.5 * s);
          ctx.closePath(); ctx.fill();
        }
        // Seat top surface
        const stG2 = ctx.createLinearGradient(bx - gbW * 0.5, seatY2 - 2 * s, bx + gbW * 0.5, seatY2 - 1 * s);
        stG2.addColorStop(0, "#BCAAA4"); stG2.addColorStop(0.5, "#D7CCC8"); stG2.addColorStop(1, "#A1887F");
        ctx.fillStyle = stG2;
        ctx.beginPath();
        ctx.moveTo(bx - gbW * 0.48, seatY2 - 1 * s); ctx.lineTo(bx + gbW * 0.48, seatY2 - 1 * s);
        ctx.lineTo(bx + gbW * 0.48 + 2 * s, seatY2 - 2 * s);
        ctx.lineTo(bx - gbW * 0.48 + 2 * s, seatY2 - 2 * s);
        ctx.closePath(); ctx.fill();

        // Backrest - ornate iron scrollwork
        const brBase = seatY2 - 2 * s;
        // Backrest uprights (isometric)
        for (const dir of [-1, 1]) {
          const upX = bx + dir * gbW * 0.42 + 1 * s;
          ctx.fillStyle = "#37474F";
          ctx.beginPath();
          ctx.moveTo(upX, brBase); ctx.lineTo(upX + 2 * s, brBase);
          ctx.lineTo(upX + 2 * s, brBase - backH2); ctx.lineTo(upX, brBase - backH2);
          ctx.closePath(); ctx.fill();
          // Side face
          ctx.fillStyle = "#263238";
          ctx.beginPath();
          ctx.moveTo(upX + 2 * s, brBase); ctx.lineTo(upX + 3 * s, brBase - 0.5 * s);
          ctx.lineTo(upX + 3 * s, brBase - backH2 - 0.5 * s); ctx.lineTo(upX + 2 * s, brBase - backH2);
          ctx.closePath(); ctx.fill();
        }
        // Top rail (isometric)
        ctx.fillStyle = "#455A64";
        ctx.beginPath();
        ctx.moveTo(bx - gbW * 0.42 + 1 * s, brBase - backH2);
        ctx.lineTo(bx + gbW * 0.42 + 3 * s, brBase - backH2);
        ctx.lineTo(bx + gbW * 0.42 + 3 * s, brBase - backH2 + 2 * s);
        ctx.lineTo(bx - gbW * 0.42 + 1 * s, brBase - backH2 + 2 * s);
        ctx.closePath(); ctx.fill();
        // Top rail depth
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(bx - gbW * 0.42 + 1 * s, brBase - backH2);
        ctx.lineTo(bx + gbW * 0.42 + 3 * s, brBase - backH2);
        ctx.lineTo(bx + gbW * 0.42 + 4 * s, brBase - backH2 - 0.5 * s);
        ctx.lineTo(bx - gbW * 0.42 + 2 * s, brBase - backH2 - 0.5 * s);
        ctx.closePath(); ctx.fill();
        // Decorative scrollwork between uprights
        ctx.strokeStyle = "#546E7A"; ctx.lineWidth = 1 * s;
        for (let sc = 0; sc < 3; sc++) {
          const scx = bx - gbW * 0.25 + sc * gbW * 0.25;
          const scy = brBase - backH2 * 0.5;
          ctx.beginPath();
          ctx.arc(scx, scy, 3 * s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(scx, scy - 3 * s); ctx.lineTo(scx, scy + 3 * s);
          ctx.moveTo(scx - 3 * s, scy); ctx.lineTo(scx + 3 * s, scy);
          ctx.stroke();
        }

      } else {
        // === STONE THRONE — regal carved stone seat with high back ===
        const thW = 12 * s, thD = 8 * s, thH = 8 * s, thBackH = 20 * s;
        const thiW = thW * 0.866, thiD = thD * 0.4;

        // Seat block - left face
        ctx.fillStyle = "#546E7A";
        ctx.beginPath();
        ctx.moveTo(bx - thiW, by); ctx.lineTo(bx, by + thiD);
        ctx.lineTo(bx, by + thiD - thH); ctx.lineTo(bx - thiW, by - thH);
        ctx.closePath(); ctx.fill();

        // Seat block - right face
        const thRG = ctx.createLinearGradient(bx, by, bx + thiW, by);
        thRG.addColorStop(0, "#78909C"); thRG.addColorStop(1, "#607D8B");
        ctx.fillStyle = thRG;
        ctx.beginPath();
        ctx.moveTo(bx + thiW, by); ctx.lineTo(bx, by + thiD);
        ctx.lineTo(bx, by + thiD - thH); ctx.lineTo(bx + thiW, by - thH);
        ctx.closePath(); ctx.fill();

        // Seat top
        ctx.fillStyle = "#90A4AE";
        ctx.beginPath();
        ctx.moveTo(bx, by - thH - thiD); ctx.lineTo(bx + thiW, by - thH);
        ctx.lineTo(bx, by + thiD - thH); ctx.lineTo(bx - thiW, by - thH);
        ctx.closePath(); ctx.fill();

        // High back slab - left face
        ctx.fillStyle = "#455A64";
        ctx.beginPath();
        ctx.moveTo(bx - thiW, by - thH); ctx.lineTo(bx, by + thiD - thH);
        ctx.lineTo(bx, by + thiD - thH - thBackH);
        ctx.lineTo(bx - thiW, by - thH - thBackH);
        ctx.closePath(); ctx.fill();

        // High back slab - right face
        const thBG = ctx.createLinearGradient(bx, by - thH, bx + thiW, by - thH);
        thBG.addColorStop(0, "#607D8B"); thBG.addColorStop(1, "#546E7A");
        ctx.fillStyle = thBG;
        ctx.beginPath();
        ctx.moveTo(bx + thiW, by - thH); ctx.lineTo(bx, by + thiD - thH);
        ctx.lineTo(bx, by + thiD - thH - thBackH);
        ctx.lineTo(bx + thiW, by - thH - thBackH);
        ctx.closePath(); ctx.fill();

        // Back top (pointed crown shape)
        const crownY = by - thH - thBackH;
        ctx.fillStyle = "#78909C";
        ctx.beginPath();
        ctx.moveTo(bx - thiW, crownY); ctx.lineTo(bx - thiW * 0.6, crownY - 4 * s);
        ctx.lineTo(bx - thiW * 0.2, crownY - 2 * s); ctx.lineTo(bx + thiW * 0.2, crownY - 5 * s);
        ctx.lineTo(bx + thiW * 0.6, crownY - 2 * s); ctx.lineTo(bx + thiW, crownY);
        ctx.closePath(); ctx.fill();

        // Carved rune/emblem on back (right face)
        ctx.strokeStyle = "rgba(255,215,0,0.4)"; ctx.lineWidth = 1 * s;
        const emY = by - thH - thBackH * 0.5;
        ctx.beginPath();
        ctx.arc(bx + thiW * 0.5, emY, 3 * s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx + thiW * 0.5, emY - 3 * s); ctx.lineTo(bx + thiW * 0.5, emY + 3 * s);
        ctx.moveTo(bx + thiW * 0.5 - 3 * s, emY); ctx.lineTo(bx + thiW * 0.5 + 3 * s, emY);
        ctx.stroke();

        // Armrests (small blocks on sides)
        for (const dir of [-1, 1]) {
          const ax = bx + dir * (thiW + 3 * s);
          const aY = by - thH - 3 * s;
          ctx.fillStyle = "#607D8B";
          ctx.beginPath();
          ctx.moveTo(ax - 2 * s, aY + 6 * s); ctx.lineTo(ax + 2 * s, aY + 6 * s);
          ctx.lineTo(ax + 2 * s, aY); ctx.lineTo(ax - 2 * s, aY);
          ctx.closePath(); ctx.fill();
          // Top of armrest
          ctx.fillStyle = "#90A4AE";
          ctx.beginPath();
          ctx.moveTo(ax - 2 * s, aY); ctx.lineTo(ax + 2 * s, aY);
          ctx.lineTo(ax + 2.5 * s, aY - 1 * s); ctx.lineTo(ax - 1.5 * s, aY - 1 * s);
          ctx.closePath(); ctx.fill();
        }
      }
      break;
    }

    case "lamppost":
      // Victorian style isometric lamppost
      // Ground Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        8 * s,
        4 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const metalDark = "#212121";
      const metalMid = "#424242";

      // Base (stepped)
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 2 * s,
        6 * s,
        3 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = metalMid;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 4 * s,
        5 * s,
        2.5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      {
      // Pole (isometric cylinder)
      const lpx = screenPos.x, lpy = screenPos.y;
      const lpD = 1.5 * s;
      const poleGrad = ctx.createLinearGradient(lpx - 2 * s, 0, lpx + 2 * s, 0);
      poleGrad.addColorStop(0, metalDark);
      poleGrad.addColorStop(0.5, metalMid);
      poleGrad.addColorStop(1, metalDark);
      // Front face
      ctx.fillStyle = poleGrad;
      ctx.beginPath();
      ctx.moveTo(lpx - 2 * s, lpy - 4 * s);
      ctx.lineTo(lpx + 2 * s, lpy - 4 * s);
      ctx.lineTo(lpx + 2 * s, lpy - 35 * s);
      ctx.lineTo(lpx - 2 * s, lpy - 35 * s);
      ctx.closePath(); ctx.fill();
      // Side face
      ctx.fillStyle = "#1A1A1A";
      ctx.beginPath();
      ctx.moveTo(lpx + 2 * s, lpy - 4 * s); ctx.lineTo(lpx + 2 * s + lpD, lpy - 4 * s - lpD * 0.5);
      ctx.lineTo(lpx + 2 * s + lpD, lpy - 35 * s - lpD * 0.5); ctx.lineTo(lpx + 2 * s, lpy - 35 * s);
      ctx.closePath(); ctx.fill();

      // Lamp Head fixture (isometric trapezoid)
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.moveTo(lpx - 4 * s, lpy - 35 * s);
      ctx.lineTo(lpx + 4 * s, lpy - 35 * s);
      ctx.lineTo(lpx + 6 * s, lpy - 45 * s);
      ctx.lineTo(lpx - 6 * s, lpy - 45 * s);
      ctx.closePath(); ctx.fill();
      // Fixture side face
      ctx.fillStyle = "#1A1A1A";
      ctx.beginPath();
      ctx.moveTo(lpx + 4 * s, lpy - 35 * s); ctx.lineTo(lpx + 4 * s + lpD, lpy - 35 * s - lpD * 0.5);
      ctx.lineTo(lpx + 6 * s + lpD, lpy - 45 * s - lpD * 0.5); ctx.lineTo(lpx + 6 * s, lpy - 45 * s);
      ctx.closePath(); ctx.fill();

      // Glass/Light (isometric box)
      const flicker = 0.1 + Math.sin(decorTime * 3) * 0.05;
      const glassY = lpy - 44 * s;
      ctx.fillStyle = `rgba(255, 236, 179, ${0.8 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(lpx - 4 * s, glassY); ctx.lineTo(lpx + 4 * s, glassY);
      ctx.lineTo(lpx + 4 * s, glassY + 8 * s); ctx.lineTo(lpx - 4 * s, glassY + 8 * s);
      ctx.closePath(); ctx.fill();
      // Glass side
      ctx.fillStyle = `rgba(220, 200, 140, ${0.6 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(lpx + 4 * s, glassY); ctx.lineTo(lpx + 4 * s + lpD * 1.5, glassY - lpD * 0.75);
      ctx.lineTo(lpx + 4 * s + lpD * 1.5, glassY + 8 * s - lpD * 0.75); ctx.lineTo(lpx + 4 * s, glassY + 8 * s);
      ctx.closePath(); ctx.fill();

      // Glow Effect
      const glowRad = ctx.createRadialGradient(lpx, lpy - 40 * s, 2 * s, lpx, lpy - 40 * s, 25 * s);
      glowRad.addColorStop(0, `rgba(255, 213, 79, ${0.4 + flicker})`);
      glowRad.addColorStop(1, "rgba(255, 213, 79, 0)");
      ctx.fillStyle = glowRad;
      ctx.beginPath();
      ctx.arc(lpx, lpy - 40 * s, 25 * s, 0, Math.PI * 2);
      ctx.fill();

      // Lamp Top Cap (isometric pyramid)
      ctx.fillStyle = metalMid;
      ctx.beginPath();
      ctx.moveTo(lpx - 7 * s, lpy - 45 * s);
      ctx.lineTo(lpx + 7 * s, lpy - 45 * s);
      ctx.lineTo(lpx, lpy - 52 * s);
      ctx.closePath(); ctx.fill();
      // Cap side face
      ctx.fillStyle = "#333333";
      ctx.beginPath();
      ctx.moveTo(lpx + 7 * s, lpy - 45 * s);
      ctx.lineTo(lpx, lpy - 52 * s);
      ctx.lineTo(lpx + lpD, lpy - 52 * s - lpD * 0.5);
      ctx.lineTo(lpx + 7 * s + lpD, lpy - 45 * s - lpD * 0.5);
      ctx.closePath(); ctx.fill();
      }
      break;

    case "hedge": {
      const hedgeGreen = "#2e7d32";
      const hedgeDark = "#1b5e20";
      const hedgeLight = "#43a047";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hedge body - isometric box shape
      const hw = 18 * s, hd = 8 * s, hh = 16 * s;
      // Top face
      ctx.fillStyle = hedgeLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - hh - hd * 0.5);
      ctx.lineTo(screenPos.x + hw * 0.5, screenPos.y - hh);
      ctx.lineTo(screenPos.x, screenPos.y - hh + hd * 0.5);
      ctx.lineTo(screenPos.x - hw * 0.5, screenPos.y - hh);
      ctx.closePath();
      ctx.fill();
      // Left face
      ctx.fillStyle = hedgeDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - hw * 0.5, screenPos.y - hh);
      ctx.lineTo(screenPos.x, screenPos.y - hh + hd * 0.5);
      ctx.lineTo(screenPos.x, screenPos.y + hd * 0.5);
      ctx.lineTo(screenPos.x - hw * 0.5, screenPos.y);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = hedgeGreen;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + hw * 0.5, screenPos.y - hh);
      ctx.lineTo(screenPos.x, screenPos.y - hh + hd * 0.5);
      ctx.lineTo(screenPos.x, screenPos.y + hd * 0.5);
      ctx.lineTo(screenPos.x + hw * 0.5, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Leaf texture dots on faces
      ctx.fillStyle = "#4caf50";
      for (let d = 0; d < 8; d++) {
        const dx = screenPos.x + (Math.sin(d * 2.3) * hw * 0.3);
        const dy = screenPos.y - hh * 0.3 + (Math.cos(d * 1.7) * hh * 0.3);
        ctx.beginPath();
        ctx.arc(dx, dy, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small flowers in hedge
      if (variant % 2 === 0) {
        const flowerColors = ["#ff4081", "#ffffff", "#ffeb3b"];
        for (let f = 0; f < 3; f++) {
          ctx.fillStyle = flowerColors[f];
          ctx.beginPath();
          ctx.arc(screenPos.x + (f - 1) * 6 * s, screenPos.y - hh * 0.5 + Math.sin(f * 1.5) * 3 * s, 1.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case "campfire": {
      const logBrown = "#5d4037";
      const logDark = "#3e2723";
      const ashGray = "#616161";

      // Ground glow
      const fireGlow = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, 25 * s);
      const fgPulse = 0.15 + Math.sin(decorTime * 4) * 0.06;
      fireGlow.addColorStop(0, `rgba(255,150,50,${fgPulse})`);
      fireGlow.addColorStop(1, "transparent");
      ctx.fillStyle = fireGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 25 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ash circle
      ctx.fillStyle = ashGray;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone ring
      const stoneCount = 8;
      for (let st = 0; st < stoneCount; st++) {
        const stAngle = (st / stoneCount) * Math.PI * 2;
        const stx = screenPos.x + Math.cos(stAngle) * 9 * s;
        const sty = screenPos.y + 2 * s + Math.sin(stAngle) * 4.5 * s;
        ctx.fillStyle = st % 2 === 0 ? "#757575" : "#616161";
        ctx.beginPath();
        ctx.ellipse(stx, sty, 2.5 * s, 1.5 * s, stAngle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Logs (isometric 3D cylinders)
      {
        const cfx = screenPos.x, cfy = screenPos.y;
        // Log 1
        const l1G = ctx.createLinearGradient(cfx, cfy - 2 * s, cfx, cfy + 2 * s);
        l1G.addColorStop(0, "#8D6E63"); l1G.addColorStop(0.5, logBrown); l1G.addColorStop(1, logDark);
        ctx.fillStyle = l1G;
        ctx.beginPath();
        ctx.moveTo(cfx - 7 * s, cfy + 1 * s);
        ctx.lineTo(cfx + 7 * s, cfy - 2 * s);
        ctx.lineTo(cfx + 7 * s, cfy + 1 * s);
        ctx.lineTo(cfx - 7 * s, cfy + 4 * s);
        ctx.closePath(); ctx.fill();
        // Log 1 end cap
        ctx.fillStyle = "#A1887F";
        ctx.beginPath();
        ctx.ellipse(cfx + 7 * s, cfy - 0.5 * s, 1.5 * s, 1.5 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Log 2
        const l2G = ctx.createLinearGradient(cfx, cfy - 2 * s, cfx, cfy + 2 * s);
        l2G.addColorStop(0, "#795548"); l2G.addColorStop(0.5, logDark); l2G.addColorStop(1, "#2A1A10");
        ctx.fillStyle = l2G;
        ctx.beginPath();
        ctx.moveTo(cfx - 6 * s, cfy - 2 * s);
        ctx.lineTo(cfx + 6 * s, cfy + 1 * s);
        ctx.lineTo(cfx + 6 * s, cfy + 4 * s);
        ctx.lineTo(cfx - 6 * s, cfy + 1 * s);
        ctx.closePath(); ctx.fill();
        // Log 2 end cap
        ctx.fillStyle = "#8D6E63";
        ctx.beginPath();
        ctx.ellipse(cfx - 6 * s, cfy - 0.5 * s, 1.5 * s, 1.5 * s, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fire flames
      const flamePhase = decorTime * 6;
      const flames = [
        { dx: 0, h: 18, w: 4, color: "#ffeb3b" },
        { dx: -3, h: 14, w: 3, color: "#ff9800" },
        { dx: 3, h: 12, w: 3, color: "#ff9800" },
        { dx: -1, h: 20, w: 3.5, color: "#f44336" },
        { dx: 2, h: 16, w: 3, color: "#f44336" },
      ];
      flames.forEach((fl, idx) => {
        const flx = screenPos.x + fl.dx * s + Math.sin(flamePhase + idx * 1.5) * 2 * s;
        const flh = fl.h * s * (0.7 + Math.sin(flamePhase * 1.5 + idx * 0.8) * 0.3);
        ctx.fillStyle = fl.color;
        ctx.beginPath();
        ctx.moveTo(flx - fl.w * s, screenPos.y);
        ctx.quadraticCurveTo(flx - fl.w * 0.5 * s, screenPos.y - flh * 0.5, flx + Math.sin(flamePhase + idx) * 1.5 * s, screenPos.y - flh);
        ctx.quadraticCurveTo(flx + fl.w * 0.5 * s, screenPos.y - flh * 0.5, flx + fl.w * s, screenPos.y);
        ctx.closePath();
        ctx.fill();
      });

      // Sparks
      for (let sp = 0; sp < 4; sp++) {
        const spPhase = (decorTime * 2 + sp * 0.6) % 1.5;
        if (spPhase < 1) {
          const spAlpha = (1 - spPhase) * 0.8;
          const spx = screenPos.x + Math.sin(decorTime * 3 + sp * 2) * 5 * s;
          const spy = screenPos.y - 10 * s - spPhase * 15 * s;
          ctx.fillStyle = `rgba(255,200,50,${spAlpha})`;
          ctx.beginPath();
          ctx.arc(spx, spy, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case "dock": {
      const dockWood = "#6d4c41";
      const dockWoodDark = "#4e342e";
      const dockWoodLight = "#8d6e63";
      const dockWater = "rgba(70,130,180,0.5)";

      // Water
      ctx.fillStyle = dockWater;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 8 * s, screenPos.y + 5 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Support posts (isometric pilings)
      const posts = [
        { dx: -8, dy: 2 }, { dx: -8, dy: -6 }, { dx: 8, dy: 2 }, { dx: 8, dy: -6 },
      ];
      posts.forEach(p => {
        const ppx = screenPos.x + p.dx * s, ppy = screenPos.y + p.dy * s;
        // Front face
        ctx.fillStyle = dockWoodDark;
        ctx.beginPath();
        ctx.moveTo(ppx - 1.5 * s, ppy + 4 * s); ctx.lineTo(ppx + 1.5 * s, ppy + 4 * s);
        ctx.lineTo(ppx + 1.5 * s, ppy - 4 * s); ctx.lineTo(ppx - 1.5 * s, ppy - 4 * s);
        ctx.closePath(); ctx.fill();
        // Side face
        ctx.fillStyle = "#3A2518";
        ctx.beginPath();
        ctx.moveTo(ppx + 1.5 * s, ppy + 4 * s); ctx.lineTo(ppx + 2.5 * s, ppy + 3.5 * s);
        ctx.lineTo(ppx + 2.5 * s, ppy - 4.5 * s); ctx.lineTo(ppx + 1.5 * s, ppy - 4 * s);
        ctx.closePath(); ctx.fill();
        // Top cap
        ctx.fillStyle = dockWoodLight;
        ctx.beginPath();
        ctx.moveTo(ppx - 1.5 * s, ppy - 4 * s); ctx.lineTo(ppx + 1.5 * s, ppy - 4 * s);
        ctx.lineTo(ppx + 2.5 * s, ppy - 4.5 * s); ctx.lineTo(ppx - 0.5 * s, ppy - 4.5 * s);
        ctx.closePath(); ctx.fill();
      });

      // Deck planks - isometric rectangle
      ctx.fillStyle = dockWood;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 16 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y + 4 * s);
      ctx.closePath();
      ctx.fill();

      // Plank lines
      ctx.strokeStyle = dockWoodDark;
      ctx.lineWidth = 0.8 * s;
      for (let pl = 0; pl < 5; pl++) {
        const t = pl / 5;
        const lx = screenPos.x - 10 * s + t * 26 * s;
        const ly = screenPos.y - 2 * s - t * 0 * s;
        ctx.beginPath();
        ctx.moveTo(lx - 2 * s + t * 8 * s, ly - 6 * s + t * 6 * s);
        ctx.lineTo(lx + 4 * s + t * 2 * s, ly + 2 * s + t * 0 * s);
        ctx.stroke();
      }

      // Top plank layer
      ctx.fillStyle = dockWoodLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 16 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Rope coil
      ctx.strokeStyle = "#8d6e63";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 10 * s, screenPos.y - 4 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "gate": {
      const gx = screenPos.x, gy = screenPos.y;
      const gD = 4 * s;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(gx, gy + 8 * s, 24 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Isometric pillar helper
      const drawPillar = (px: number, pW: number, pH: number) => {
        const hW = pW * 0.5;
        // Front face
        const pfG = ctx.createLinearGradient(px - hW, gy, px + hW, gy);
        pfG.addColorStop(0, "#8A8A8A"); pfG.addColorStop(0.5, "#B0B0B0"); pfG.addColorStop(1, "#808080");
        ctx.fillStyle = pfG;
        ctx.beginPath();
        ctx.moveTo(px - hW, gy + 5 * s); ctx.lineTo(px + hW, gy + 5 * s);
        ctx.lineTo(px + hW, gy - pH); ctx.lineTo(px - hW, gy - pH);
        ctx.closePath(); ctx.fill();
        // Side face (depth)
        ctx.fillStyle = "#616161";
        ctx.beginPath();
        ctx.moveTo(px + hW, gy + 5 * s); ctx.lineTo(px + hW + gD, gy + 5 * s - gD * 0.5);
        ctx.lineTo(px + hW + gD, gy - pH - gD * 0.5); ctx.lineTo(px + hW, gy - pH);
        ctx.closePath(); ctx.fill();
        // Top face
        ctx.fillStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.moveTo(px - hW, gy - pH); ctx.lineTo(px + hW, gy - pH);
        ctx.lineTo(px + hW + gD, gy - pH - gD * 0.5); ctx.lineTo(px - hW + gD, gy - pH - gD * 0.5);
        ctx.closePath(); ctx.fill();
        // Stone mortar lines
        ctx.strokeStyle = "rgba(50,50,50,0.2)"; ctx.lineWidth = 0.5 * s;
        for (let r = 0; r < 8; r++) {
          const ry = gy + 3 * s - r * pH / 7;
          ctx.beginPath(); ctx.moveTo(px - hW + 1 * s, ry); ctx.lineTo(px + hW - 1 * s, ry); ctx.stroke();
        }
      };

      // Left pillar
      drawPillar(gx - 16 * s, 8 * s, 42 * s);
      // Right pillar
      drawPillar(gx + 12 * s, 8 * s, 42 * s);

      // Arch front face
      ctx.fillStyle = "#9E9E9E";
      ctx.beginPath();
      ctx.moveTo(gx - 12 * s, gy - 42 * s);
      ctx.quadraticCurveTo(gx, gy - 58 * s, gx + 12 * s, gy - 42 * s);
      ctx.lineTo(gx + 8 * s, gy - 38 * s);
      ctx.quadraticCurveTo(gx, gy - 52 * s, gx - 8 * s, gy - 38 * s);
      ctx.closePath();
      ctx.fill();
      // Arch depth face (top surface)
      ctx.fillStyle = "#B8B8B8";
      ctx.beginPath();
      ctx.moveTo(gx - 12 * s, gy - 42 * s);
      ctx.quadraticCurveTo(gx, gy - 58 * s, gx + 12 * s, gy - 42 * s);
      ctx.lineTo(gx + 12 * s + gD, gy - 42 * s - gD * 0.5);
      ctx.quadraticCurveTo(gx + gD, gy - 58 * s - gD * 0.5, gx - 12 * s + gD, gy - 42 * s - gD * 0.5);
      ctx.closePath();
      ctx.fill();

      // Iron gate bars (isometric)
      for (let bar = 0; bar < 5; bar++) {
        const bx2 = gx - 6 * s + bar * 4 * s;
        const archY = gy - 38 * s - Math.sin((bar / 4) * Math.PI) * 12 * s;
        const barH = gy + 3 * s - archY;
        // Front face
        ctx.fillStyle = "#424242";
        ctx.beginPath();
        ctx.moveTo(bx2 - 0.8 * s, archY); ctx.lineTo(bx2 + 0.8 * s, archY);
        ctx.lineTo(bx2 + 0.8 * s, archY + barH); ctx.lineTo(bx2 - 0.8 * s, archY + barH);
        ctx.closePath(); ctx.fill();
        // Side face
        ctx.fillStyle = "#2A2A2A";
        ctx.beginPath();
        ctx.moveTo(bx2 + 0.8 * s, archY); ctx.lineTo(bx2 + 0.8 * s + 1 * s, archY - 0.5 * s);
        ctx.lineTo(bx2 + 0.8 * s + 1 * s, archY + barH - 0.5 * s); ctx.lineTo(bx2 + 0.8 * s, archY + barH);
        ctx.closePath(); ctx.fill();
      }

      // Cross bars (isometric)
      for (const cbY of [gy - 20 * s, gy - 10 * s]) {
        ctx.fillStyle = "#424242";
        ctx.beginPath();
        ctx.moveTo(gx - 8 * s, cbY); ctx.lineTo(gx + 10 * s, cbY);
        ctx.lineTo(gx + 10 * s, cbY + 2 * s); ctx.lineTo(gx - 8 * s, cbY + 2 * s);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#37474F";
        ctx.beginPath();
        ctx.moveTo(gx - 8 * s, cbY); ctx.lineTo(gx + 10 * s, cbY);
        ctx.lineTo(gx + 10 * s + 1.5 * s, cbY - 0.75 * s); ctx.lineTo(gx - 8 * s + 1.5 * s, cbY - 0.75 * s);
        ctx.closePath(); ctx.fill();
      }

      // Pillar caps (isometric pyramids)
      for (const cpx of [gx - 16 * s, gx + 12 * s]) {
        const capY = gy - 42 * s;
        // Front face
        ctx.fillStyle = "#BDBDBD";
        ctx.beginPath();
        ctx.moveTo(cpx - 5 * s, capY); ctx.lineTo(cpx + gD * 0.5, capY - 8 * s);
        ctx.lineTo(cpx + 5 * s, capY);
        ctx.closePath(); ctx.fill();
        // Side face
        ctx.fillStyle = "#909090";
        ctx.beginPath();
        ctx.moveTo(cpx + 5 * s, capY); ctx.lineTo(cpx + gD * 0.5, capY - 8 * s);
        ctx.lineTo(cpx + 5 * s + gD, capY - gD * 0.5);
        ctx.closePath(); ctx.fill();
      }
      break;
    }

    case "reeds": {
      const reedGreen = "#558b2f";
      const reedDark = "#33691e";
      const reedBrown = "#795548";

      // Water base
      ctx.fillStyle = "rgba(70,130,180,0.35)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 14 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reed stalks
      const reedCount = 7;
      for (let r = 0; r < reedCount; r++) {
        const rx = screenPos.x + (r - 3) * 3 * s + Math.sin(r * 1.7) * 2 * s;
        const rh = (20 + Math.sin(r * 2.3) * 8) * s;
        const sway = Math.sin(decorTime * 1.5 + r * 0.8) * 2 * s;

        ctx.strokeStyle = r % 2 === 0 ? reedGreen : reedDark;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(rx, screenPos.y + 2 * s);
        ctx.quadraticCurveTo(rx + sway * 0.5, screenPos.y - rh * 0.5, rx + sway, screenPos.y - rh);
        ctx.stroke();

        // Reed tip / cattail
        if (r % 3 === 0) {
          ctx.fillStyle = reedBrown;
          ctx.beginPath();
          ctx.ellipse(rx + sway, screenPos.y - rh - 3 * s, 1.5 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Leaf tip
          ctx.fillStyle = reedGreen;
          ctx.beginPath();
          ctx.moveTo(rx + sway, screenPos.y - rh);
          ctx.lineTo(rx + sway - 1 * s, screenPos.y - rh - 4 * s);
          ctx.lineTo(rx + sway + 1 * s, screenPos.y - rh - 3 * s);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    }

    case "fishing_spot": {
      const fsDock = "#6d4c41";
      const fsWater = "rgba(70,130,180,0.5)";

      // Water
      ctx.fillStyle = fsWater;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small platform
      ctx.fillStyle = fsDock;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 4 * s);
      ctx.closePath();
      ctx.fill();

      // Fishing rod
      ctx.strokeStyle = "#5d4037";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 2 * s);
      ctx.quadraticCurveTo(screenPos.x + 15 * s, screenPos.y - 25 * s, screenPos.x + 20 * s, screenPos.y - 20 * s);
      ctx.stroke();

      // Fishing line
      ctx.strokeStyle = "rgba(200,200,200,0.6)";
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 20 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 14 * s + Math.sin(decorTime * 2) * 2 * s, screenPos.y + 3 * s);
      ctx.stroke();

      // Bobber
      const bobY = screenPos.y + 3 * s + Math.sin(decorTime * 2) * 1.5 * s;
      ctx.fillStyle = "#f44336";
      ctx.beginPath();
      ctx.arc(screenPos.x + 14 * s + Math.sin(decorTime * 2) * 2 * s, bobY, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(screenPos.x + 14 * s + Math.sin(decorTime * 2) * 2 * s, bobY - 1 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();

      // Bucket
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(screenPos.x - 5 * s, screenPos.y - 4 * s, 4 * s, 4 * s);
      ctx.fillStyle = "#8d6e63";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 4 * s, 2.5 * s, 1 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ripples from bobber
      const fishRip = (decorTime % 2) / 2;
      ctx.strokeStyle = `rgba(150,200,255,${0.3 - fishRip * 0.3})`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 14 * s, screenPos.y + 4 * s, 3 * s * fishRip + 2 * s, 1.5 * s * fishRip + 1 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    // === DESERT DECORATIONS ===
    case "palm": {
      const px = screenPos.x;
      const py = screenPos.y;
      const palmVariant = variant || 0;
      const pSway = Math.sin(decorTime * 1.5 + dec.x * 0.01) * 2 * s;
      const pSeed = dec.x || 0;
      const pAOff = ((pSeed * 7.3 + 13) % 100) / 100 * 0.6 - 0.3;

      const pb0x = px, pb0y = py + 3 * s;
      const pb1x = px + 4 * s + pSway * 0.15, pb1y = py - 16 * s;
      const pb2x = px + 8 * s + pSway * 0.35, pb2y = py - 36 * s;
      const pb3x = px + 5 * s + pSway, pb3y = py - 56 * s;
      const pCrownX = pb3x, pCrownY = pb3y;

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(px + 8 * s, py + 4 * s, 14 * s, 6 * s, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Trunk: 6 segments, 3 faces each
      const pWBase = 12 * s, pWTop = 7 * s;
      for (let i = 5; i >= 0; i--) {
        const t0 = i / 6, t1 = (i + 1) / 6;
        const mt0 = 1 - t0, mt1 = 1 - t1;
        const cx0 = mt0*mt0*mt0*pb0x + 3*mt0*mt0*t0*pb1x + 3*mt0*t0*t0*pb2x + t0*t0*t0*pb3x;
        const cy0 = mt0*mt0*mt0*pb0y + 3*mt0*mt0*t0*pb1y + 3*mt0*t0*t0*pb2y + t0*t0*t0*pb3y;
        const cx1 = mt1*mt1*mt1*pb0x + 3*mt1*mt1*t1*pb1x + 3*mt1*t1*t1*pb2x + t1*t1*t1*pb3x;
        const cy1 = mt1*mt1*mt1*pb0y + 3*mt1*mt1*t1*pb1y + 3*mt1*t1*t1*pb2y + t1*t1*t1*pb3y;
        const w0 = pWBase + (pWTop - pWBase) * t0;
        const w1 = pWBase + (pWTop - pWBase) * t1;
        const lip0 = w0 * 0.22;
        // Left (shadow) face
        ctx.fillStyle = i % 2 === 0 ? "#5a4510" : "#4e3c0e";
        ctx.beginPath();
        ctx.moveTo(cx0 - w0 * 0.5, cy0);
        ctx.lineTo(cx1 - w1 * 0.5, cy1);
        ctx.lineTo(cx1, cy1 + w1 * 0.2);
        ctx.lineTo(cx0, cy0 + lip0);
        ctx.closePath();
        ctx.fill();
        // Right (lit) face
        ctx.fillStyle = i % 2 === 0 ? "#b8891e" : "#a07a18";
        ctx.beginPath();
        ctx.moveTo(cx0 + w0 * 0.5, cy0);
        ctx.lineTo(cx1 + w1 * 0.5, cy1);
        ctx.lineTo(cx1, cy1 + w1 * 0.2);
        ctx.lineTo(cx0, cy0 + lip0);
        ctx.closePath();
        ctx.fill();
        // Front lip
        ctx.fillStyle = i % 2 === 0 ? "#6b5012" : "#5a4210";
        ctx.beginPath();
        ctx.moveTo(cx0 - w0 * 0.5, cy0);
        ctx.lineTo(cx0 + w0 * 0.5, cy0);
        ctx.lineTo(cx0, cy0 + lip0);
        ctx.closePath();
        ctx.fill();
      }

      // Crown hub
      ctx.fillStyle = "#3a5a12";
      ctx.beginPath();
      ctx.ellipse(pCrownX, pCrownY + 2 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pre-baked frond palettes (4 back + 6 front entries)
      const _FP = [
        { back: [{ rib: "#1e5a1e", lit: "#2a6a2a", dark: "#0c460c" }, { rib: "#226422", lit: "#306e30", dark: "#104e10" }, { rib: "#1a5218", lit: "#266226", dark: "#0a3e0a" }, { rib: "#1e5a1e", lit: "#2a6a2a", dark: "#0c460c" }], front: [{ rib: "#2e972e", lit: "#38a138", dark: "#228b22" }, { rib: "#3a9763", lit: "#44a16d", dark: "#2e8b57" }, { rib: "#3eb45e", lit: "#48be68", dark: "#32a852" }, { rib: "#3aa753", lit: "#44b15d", dark: "#2e9b47" }, { rib: "#2e972e", lit: "#38a138", dark: "#228b22" }, { rib: "#3eb45e", lit: "#48be68", dark: "#32a852" }] },
        { back: [{ rib: "#226c3c", lit: "#2c763e", dark: "#105626" }, { rib: "#206434", lit: "#2a6e36", dark: "#0e4e1e" }, { rib: "#1e5c30", lit: "#28663a", dark: "#0c4c1c" }, { rib: "#226c3c", lit: "#2c763e", dark: "#105626" }], front: [{ rib: "#369c4c", lit: "#40a656", dark: "#2a9040" }, { rib: "#3ca466", lit: "#46ae70", dark: "#30985a" }, { rib: "#42b464", lit: "#4cbe6e", dark: "#36a858" }, { rib: "#3ca466", lit: "#46ae70", dark: "#30985a" }, { rib: "#369c4c", lit: "#40a656", dark: "#2a9040" }, { rib: "#42b464", lit: "#4cbe6e", dark: "#36a858" }] },
        { back: [{ rib: "#16562c", lit: "#20602e", dark: "#004016" }, { rib: "#1a5e34", lit: "#246836", dark: "#04481e" }, { rib: "#145028", lit: "#1e5a2c", dark: "#003a12" }, { rib: "#16562c", lit: "#20602e", dark: "#004016" }], front: [{ rib: "#268434", lit: "#308e3e", dark: "#1a7828" }, { rib: "#2e974c", lit: "#38a156", dark: "#228b40" }, { rib: "#34ac56", lit: "#3eb660", dark: "#28a04a" }, { rib: "#2e974c", lit: "#38a156", dark: "#228b40" }, { rib: "#268434", lit: "#308e3e", dark: "#1a7828" }, { rib: "#34ac56", lit: "#3eb660", dark: "#28a04a" }] },
      ];
      const fPal = _FP[palmVariant % 3];

      // Back fronds (4, half sway)
      const _bkL = [{ a: -2.5, l: 36, p: 0 }, { a: -1.2, l: 33, p: 1.5 }, { a: 0.4, l: 31, p: 3.2 }, { a: 1.9, l: 35, p: 5.0 }];
      for (let fi = 0; fi < 4; fi++) {
        const f = _bkL[fi];
        _drawPalmFrondItem(ctx, pCrownX, pCrownY, f.a + pAOff, f.l * s, fPal.back[fi], s, fi % 2 === 1 ? Math.sin(decorTime * 1.6 + f.p) * 2 * s : 0);
      }
      // Front fronds (6, half sway)
      const _ftL = [{ a: -2.3, l: 42, p: 0.5 }, { a: -1.3, l: 40, p: 1.8 }, { a: -0.2, l: 44, p: 3.0 }, { a: 0.7, l: 42, p: 4.2 }, { a: 1.6, l: 39, p: 5.5 }, { a: 2.5, l: 36, p: 0.8 }];
      for (let fi = 0; fi < 6; fi++) {
        const f = _ftL[fi];
        _drawPalmFrondItem(ctx, pCrownX, pCrownY, f.a + pAOff, f.l * s, fPal.front[fi], s, fi % 2 === 1 ? Math.sin(decorTime * 2 + f.p) * 3 * s : 0);
      }

      // Coconuts (variant 0 and 2)
      if (palmVariant === 0 || palmVariant === 2) {
        const cBase = palmVariant === 2 ? "#b89830" : "#5a3a1a";
        const cHi = palmVariant === 2 ? "#e8c860" : "#8a6a3a";
        ctx.fillStyle = cBase;
        ctx.beginPath(); ctx.arc(pCrownX - 3.5 * s, pCrownY + 4 * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pCrownX + 3 * s, pCrownY + 3.5 * s, 3.2 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pCrownX, pCrownY + 5.5 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cHi;
        ctx.beginPath(); ctx.arc(pCrownX - 4.5 * s, pCrownY + 3 * s, 1.6 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pCrownX + 2 * s, pCrownY + 2.5 * s, 1.4 * s, 0, Math.PI * 2); ctx.fill();
      }

      // Flowers (variant 1 and 2)
      if (palmVariant === 1 || palmVariant === 2) {
        const pPetalCol = palmVariant === 2 ? "#ff9eb0" : "#f8bbd0";
        const pCenterCol = palmVariant === 2 ? "#ffd54f" : "#ffeb3b";
        ctx.fillStyle = pPetalCol;
        for (let bi = 0; bi < 2; bi++) {
          const bfx = pCrownX + (bi === 0 ? -5 : 4) * s;
          const bfy = pCrownY + (bi === 0 ? 2 : 1.5) * s;
          for (let p = 0; p < 3; p++) {
            const pa = (p / 3) * Math.PI * 2 + bi;
            ctx.beginPath();
            ctx.ellipse(bfx + Math.cos(pa) * 3 * s, bfy + Math.sin(pa) * 1.5 * s, 2.5 * s, 1.3 * s, pa, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = pCenterCol;
        ctx.beginPath(); ctx.arc(pCrownX - 5 * s, pCrownY + 2 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pCrownX + 4 * s, pCrownY + 1.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "cactus": {
      // Enhanced 3D isometric cactus with saguaro style
      const cacBaseX = screenPos.x;
      const cacBaseY = screenPos.y;

      // Ground shadow
      const cacShadowGrad = ctx.createRadialGradient(
        cacBaseX + 5 * s, cacBaseY + 5 * s, 0,
        cacBaseX + 5 * s, cacBaseY + 5 * s, 20 * s
      );
      cacShadowGrad.addColorStop(0, "rgba(0,0,0,0.2)");
      cacShadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = cacShadowGrad;
      ctx.beginPath();
      ctx.ellipse(cacBaseX + 5 * s, cacBaseY + 5 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main body gradient for 3D roundness
      const cacGrad = ctx.createLinearGradient(
        cacBaseX - 8 * s, 0, cacBaseX + 8 * s, 0
      );
      cacGrad.addColorStop(0, "#1a4a1a");
      cacGrad.addColorStop(0.3, "#2d6a2d");
      cacGrad.addColorStop(0.5, "#3a8a3a");
      cacGrad.addColorStop(0.7, "#2d6a2d");
      cacGrad.addColorStop(1, "#1a4a1a");

      // Main body - rounded pillar shape
      ctx.fillStyle = cacGrad;
      ctx.beginPath();
      ctx.moveTo(cacBaseX - 7 * s, cacBaseY + 3 * s);
      ctx.quadraticCurveTo(cacBaseX - 8 * s, cacBaseY - 15 * s, cacBaseX - 6 * s, cacBaseY - 30 * s);
      ctx.quadraticCurveTo(cacBaseX, cacBaseY - 38 * s, cacBaseX + 6 * s, cacBaseY - 30 * s);
      ctx.quadraticCurveTo(cacBaseX + 8 * s, cacBaseY - 15 * s, cacBaseX + 7 * s, cacBaseY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Vertical ridges for texture
      ctx.strokeStyle = "rgba(0,50,0,0.3)";
      ctx.lineWidth = 1 * s;
      for (let r = -2; r <= 2; r++) {
        ctx.beginPath();
        ctx.moveTo(cacBaseX + r * 2.5 * s, cacBaseY + 2 * s);
        ctx.quadraticCurveTo(
          cacBaseX + r * 2 * s, cacBaseY - 15 * s,
          cacBaseX + r * 1.5 * s, cacBaseY - 32 * s
        );
        ctx.stroke();
      }

      // Arms for larger variants
      if (variant > 0) {
        // Left arm
        const armGrad = ctx.createLinearGradient(
          cacBaseX - 20 * s, 0, cacBaseX - 10 * s, 0
        );
        armGrad.addColorStop(0, "#1a4a1a");
        armGrad.addColorStop(0.5, "#3a8a3a");
        armGrad.addColorStop(1, "#2d6a2d");

        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.moveTo(cacBaseX - 6 * s, cacBaseY - 12 * s);
        ctx.quadraticCurveTo(cacBaseX - 18 * s, cacBaseY - 14 * s, cacBaseX - 18 * s, cacBaseY - 22 * s);
        ctx.quadraticCurveTo(cacBaseX - 18 * s, cacBaseY - 30 * s, cacBaseX - 14 * s, cacBaseY - 30 * s);
        ctx.quadraticCurveTo(cacBaseX - 12 * s, cacBaseY - 30 * s, cacBaseX - 12 * s, cacBaseY - 22 * s);
        ctx.quadraticCurveTo(cacBaseX - 12 * s, cacBaseY - 16 * s, cacBaseX - 6 * s, cacBaseY - 15 * s);
        ctx.closePath();
        ctx.fill();

        // Right arm for variant > 1
        if (variant > 1) {
          ctx.fillStyle = armGrad;
          ctx.beginPath();
          ctx.moveTo(cacBaseX + 6 * s, cacBaseY - 8 * s);
          ctx.quadraticCurveTo(cacBaseX + 15 * s, cacBaseY - 10 * s, cacBaseX + 15 * s, cacBaseY - 18 * s);
          ctx.quadraticCurveTo(cacBaseX + 15 * s, cacBaseY - 26 * s, cacBaseX + 11 * s, cacBaseY - 26 * s);
          ctx.quadraticCurveTo(cacBaseX + 9 * s, cacBaseY - 26 * s, cacBaseX + 9 * s, cacBaseY - 18 * s);
          ctx.quadraticCurveTo(cacBaseX + 9 * s, cacBaseY - 12 * s, cacBaseX + 6 * s, cacBaseY - 11 * s);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Spines (small dots)
      ctx.fillStyle = "#e8e0c0";
      for (let sy = 0; sy < 6; sy++) {
        for (let sx = -1; sx <= 1; sx++) {
          const spineX = cacBaseX + sx * 4 * s + (sy % 2) * 2 * s;
          const spineY = cacBaseY - 5 * s - sy * 5 * s;
          ctx.beginPath();
          ctx.arc(spineX, spineY, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top highlight
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.ellipse(cacBaseX, cacBaseY - 33 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "dune": {
      // Enhanced 3D isometric sand dune with proper ground blending
      const duneBaseX = screenPos.x;
      const duneBaseY = screenPos.y;

      // Isometric ground shadow/base - fades into terrain
      const groundShadowGrad = ctx.createRadialGradient(
        duneBaseX, duneBaseY + 12 * s, 0,
        duneBaseX, duneBaseY + 12 * s, 65 * s
      );
      groundShadowGrad.addColorStop(0, "rgba(120,90,40,0.35)");
      groundShadowGrad.addColorStop(0.5, "rgba(100,75,30,0.2)");
      groundShadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = groundShadowGrad;
      ctx.beginPath();
      ctx.ellipse(duneBaseX, duneBaseY + 12 * s, 60 * s, 18 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base sand spread - isometric ellipse that grounds the dune
      const baseSandGrad = ctx.createRadialGradient(
        duneBaseX, duneBaseY + 8 * s, 0,
        duneBaseX, duneBaseY + 8 * s, 55 * s
      );
      baseSandGrad.addColorStop(0, "#c9a040");
      baseSandGrad.addColorStop(0.6, "#b89035");
      baseSandGrad.addColorStop(1, "rgba(168,128,48,0)");
      ctx.fillStyle = baseSandGrad;
      ctx.beginPath();
      ctx.ellipse(duneBaseX, duneBaseY + 8 * s, 55 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main dune body - gradient for depth with curved isometric base
      const duneGrad = ctx.createLinearGradient(
        duneBaseX - 45 * s, duneBaseY - 20 * s,
        duneBaseX + 45 * s, duneBaseY + 5 * s
      );
      duneGrad.addColorStop(0, "#f0d070");
      duneGrad.addColorStop(0.3, "#e8c060");
      duneGrad.addColorStop(0.6, "#d4a84b");
      duneGrad.addColorStop(1, "#b08830");

      ctx.fillStyle = duneGrad;
      ctx.beginPath();
      // Start from left side of isometric base ellipse
      ctx.moveTo(duneBaseX - 52 * s, duneBaseY + 6 * s);
      // Curve up to first peak
      ctx.bezierCurveTo(
        duneBaseX - 40 * s, duneBaseY - 2 * s,
        duneBaseX - 20 * s, duneBaseY - 15 * s,
        duneBaseX - 5 * s, duneBaseY - 22 * s
      );
      // Continue to second ridge
      ctx.bezierCurveTo(
        duneBaseX + 10 * s, duneBaseY - 15 * s,
        duneBaseX + 30 * s, duneBaseY - 8 * s,
        duneBaseX + 45 * s, duneBaseY - 3 * s
      );
      // Curve down to right side of isometric base
      ctx.bezierCurveTo(
        duneBaseX + 52 * s, duneBaseY + 2 * s,
        duneBaseX + 54 * s, duneBaseY + 5 * s,
        duneBaseX + 52 * s, duneBaseY + 8 * s
      );
      // Isometric curved base (front edge of dune)
      ctx.bezierCurveTo(
        duneBaseX + 35 * s, duneBaseY + 14 * s,
        duneBaseX - 35 * s, duneBaseY + 14 * s,
        duneBaseX - 52 * s, duneBaseY + 6 * s
      );
      ctx.fill();

      // Secondary dune layer (foreground ridge)
      const dune2Grad = ctx.createLinearGradient(
        duneBaseX - 35 * s, duneBaseY - 5 * s,
        duneBaseX + 40 * s, duneBaseY + 10 * s
      );
      dune2Grad.addColorStop(0, "#ddb855");
      dune2Grad.addColorStop(0.4, "#d4a84b");
      dune2Grad.addColorStop(1, "#a08028");

      ctx.fillStyle = dune2Grad;
      ctx.beginPath();
      ctx.moveTo(duneBaseX - 42 * s, duneBaseY + 10 * s);
      ctx.bezierCurveTo(
        duneBaseX - 25 * s, duneBaseY + 2 * s,
        duneBaseX - 5 * s, duneBaseY - 6 * s,
        duneBaseX + 12 * s, duneBaseY - 10 * s
      );
      ctx.bezierCurveTo(
        duneBaseX + 28 * s, duneBaseY - 5 * s,
        duneBaseX + 40 * s, duneBaseY + 2 * s,
        duneBaseX + 46 * s, duneBaseY + 10 * s
      );
      // Curved isometric base for foreground ridge
      ctx.bezierCurveTo(
        duneBaseX + 25 * s, duneBaseY + 16 * s,
        duneBaseX - 25 * s, duneBaseY + 16 * s,
        duneBaseX - 42 * s, duneBaseY + 10 * s
      );
      ctx.fill();

      // Wind-blown crest (highlighted edge with glow)
      ctx.shadowColor = "rgba(255,230,150,0.4)";
      ctx.shadowBlur = 4 * s;
      ctx.strokeStyle = "#f5e090";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(duneBaseX - 20 * s, duneBaseY - 8 * s);
      ctx.bezierCurveTo(
        duneBaseX - 10 * s, duneBaseY - 18 * s,
        duneBaseX, duneBaseY - 22 * s,
        duneBaseX + 12 * s, duneBaseY - 12 * s
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Wind ripples texture on the dune face
      ctx.strokeStyle = "rgba(160,120,50,0.35)";
      ctx.lineWidth = 0.8 * s;
      for (let r = 0; r < 5; r++) {
        const ry = duneBaseY + r * 2.5 * s;
        const rxOffset = r * 3 * s;
        ctx.beginPath();
        ctx.moveTo(duneBaseX - 38 * s + rxOffset, ry + 2 * s);
        ctx.bezierCurveTo(
          duneBaseX - 20 * s + rxOffset, ry - 1 * s,
          duneBaseX + rxOffset, ry - 1 * s,
          duneBaseX + 25 * s + rxOffset * 0.5, ry + 2 * s
        );
        ctx.stroke();
      }

      // Sand grain texture highlights
      ctx.fillStyle = "rgba(255,235,180,0.25)";
      for (let g = 0; g < 8; g++) {
        const gx = duneBaseX - 30 * s + g * 9 * s + (Math.sin(g * 1.7) * 5 * s);
        const gy = duneBaseY - 5 * s + (Math.cos(g * 2.3) * 8 * s);
        ctx.beginPath();
        ctx.ellipse(gx, gy, 2 * s, 1 * s, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle wind-blown sand particles with animation
      ctx.fillStyle = "rgba(240,215,130,0.4)";
      const windOffset = Math.sin(decorTime * 2.5) * 6 * s;
      const windOffset2 = Math.cos(decorTime * 1.8) * 4 * s;
      for (let p = 0; p < 5; p++) {
        const px = duneBaseX - 15 * s + p * 10 * s + windOffset + (p % 2) * windOffset2;
        const py = duneBaseY - 16 * s + p * 3 * s + Math.sin(decorTime * 3 + p) * 2 * s;
        ctx.beginPath();
        ctx.ellipse(px, py, 4 * s, 1.2 * s, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scattered sand at the base edges for natural blending
      ctx.fillStyle = "rgba(200,160,80,0.3)";
      for (let sp = 0; sp < 12; sp++) {
        const angle = (sp / 12) * Math.PI * 2;
        const dist = 48 * s + Math.sin(sp * 2.7) * 8 * s;
        const spx = duneBaseX + Math.cos(angle) * dist * 0.9;
        const spy = duneBaseY + 10 * s + Math.sin(angle) * dist * 0.3;
        const spSize = 1.5 * s + Math.abs(Math.sin(sp * 1.3)) * 2 * s;
        ctx.beginPath();
        ctx.ellipse(spx, spy, spSize, spSize * 0.4, angle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "pyramid": {
      const pyrX = screenPos.x;
      const pyrY = screenPos.y;
      const tipY = pyrY - 60 * s;

      // Ground shadow - positioned to extend from pyramid base toward lower-left
      // Shadow center is offset from pyramid base (pyrY + 25) in the shadow direction
      const shadowCenterX = pyrX + 30 * s;
      const shadowCenterY = pyrY + 17 * s;

      const pyrShadowGrad = ctx.createRadialGradient(
        shadowCenterX, shadowCenterY, 0,
        shadowCenterX, shadowCenterY, 55 * s
      );
      pyrShadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
      pyrShadowGrad.addColorStop(0.5, "rgba(0,0,0,0.2)");
      pyrShadowGrad.addColorStop(0.8, "rgba(0,0,0,0.08)");
      pyrShadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = pyrShadowGrad;
      ctx.beginPath();
      // Skewed ellipse extending from base toward lower-right (isometric shadow direction)
      ctx.ellipse(shadowCenterX, shadowCenterY, 50 * s, 20 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Right face (lit) with gradient
      const rightFaceGrad = ctx.createLinearGradient(
        pyrX, tipY,
        pyrX + 50 * s, pyrY + 15 * s
      );
      rightFaceGrad.addColorStop(0, "#e8c860");
      rightFaceGrad.addColorStop(0.3, "#d4a84b");
      rightFaceGrad.addColorStop(0.7, "#c9983f");
      rightFaceGrad.addColorStop(1, "#b88832");

      ctx.fillStyle = rightFaceGrad;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY);
      ctx.lineTo(pyrX + 50 * s, pyrY + 3 * s);
      ctx.lineTo(pyrX, pyrY + 25 * s);
      ctx.closePath();
      ctx.fill();

      // Left face (shadow) with gradient
      const leftFaceGrad = ctx.createLinearGradient(
        pyrX - 50 * s, pyrY,
        pyrX, tipY
      );
      leftFaceGrad.addColorStop(0, "#7a6030");
      leftFaceGrad.addColorStop(0.4, "#8a7035");
      leftFaceGrad.addColorStop(0.8, "#9a7a3a");
      leftFaceGrad.addColorStop(1, "#a8843f");

      ctx.fillStyle = leftFaceGrad;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY);
      ctx.lineTo(pyrX - 50 * s, pyrY + 3 * s);
      ctx.lineTo(pyrX, pyrY + 25 * s);
      ctx.closePath();
      ctx.fill();

      // Stone block lines for texture
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8 * s;
      for (let row = 1; row < 6; row++) {
        const rowY = tipY + row * 14 * s;
        const rowWidth = row * 8 * s;
        // Right side blocks
        ctx.beginPath();
        ctx.moveTo(pyrX, rowY);
        ctx.lineTo(pyrX + rowWidth, rowY - row * 3 * s);
        ctx.stroke();
        // Left side blocks  
        ctx.beginPath();
        ctx.moveTo(pyrX, rowY);
        ctx.lineTo(pyrX - rowWidth, rowY - row * 3 * s);
        ctx.stroke();
      }

      // Edge highlight (center ridge)
      ctx.strokeStyle = "rgba(255,220,140,0.5)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY + 15 * s);
      ctx.lineTo(pyrX, pyrY + 25 * s);
      ctx.stroke();

      // === SHINY GOLDEN PYRAMIDION (TIP) ===
      const capHeight = 18 * s;
      const capWidth = 12 * s;
      const capY = tipY + capHeight;

      // Outer glow effect
      ctx.shadowColor = "rgba(255,215,100,0.8)";
      ctx.shadowBlur = 20 * s;

      // Golden cap base - right face
      const capRightGrad = ctx.createLinearGradient(
        pyrX, tipY,
        pyrX + capWidth, capY
      );
      capRightGrad.addColorStop(0, "#fff8e0");
      capRightGrad.addColorStop(0.2, "#ffd700");
      capRightGrad.addColorStop(0.5, "#f0c030");
      capRightGrad.addColorStop(1, "#d4a020");

      ctx.fillStyle = capRightGrad;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY);
      ctx.lineTo(pyrX + capWidth, capY - 3 * s);
      ctx.lineTo(pyrX, capY);
      ctx.closePath();
      ctx.fill();

      // Golden cap - left face
      const capLeftGrad = ctx.createLinearGradient(
        pyrX - capWidth, capY,
        pyrX, tipY
      );
      capLeftGrad.addColorStop(0, "#b8860b");
      capLeftGrad.addColorStop(0.3, "#d4a020");
      capLeftGrad.addColorStop(0.7, "#e8b830");
      capLeftGrad.addColorStop(1, "#f5d050");

      ctx.fillStyle = capLeftGrad;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY);
      ctx.lineTo(pyrX - capWidth, capY - 3 * s);
      ctx.lineTo(pyrX, capY);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // Bright tip highlight
      const tipHighlightGrad = ctx.createRadialGradient(
        pyrX, tipY + 3 * s, 0,
        pyrX, tipY + 3 * s, 8 * s
      );
      tipHighlightGrad.addColorStop(0, "rgba(255,255,255,0.9)");
      tipHighlightGrad.addColorStop(0.3, "rgba(255,250,200,0.7)");
      tipHighlightGrad.addColorStop(0.6, "rgba(255,230,150,0.3)");
      tipHighlightGrad.addColorStop(1, "transparent");
      ctx.fillStyle = tipHighlightGrad;
      ctx.beginPath();
      ctx.arc(pyrX, tipY + 3 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();

      // Animated sparkle/shine effect
      const sparklePhase = decorTime * 3;
      const sparkleIntensity = (Math.sin(sparklePhase) + 1) / 2;

      // Main sparkle
      ctx.fillStyle = `rgba(255,255,255,${0.4 + sparkleIntensity * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY - 5 * s * sparkleIntensity);
      ctx.lineTo(pyrX + 2 * s, tipY + 3 * s);
      ctx.lineTo(pyrX, tipY + 8 * s * sparkleIntensity);
      ctx.lineTo(pyrX - 2 * s, tipY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Horizontal sparkle
      ctx.beginPath();
      ctx.moveTo(pyrX - 6 * s * sparkleIntensity, tipY + 2 * s);
      ctx.lineTo(pyrX, tipY + 4 * s);
      ctx.lineTo(pyrX + 6 * s * sparkleIntensity, tipY + 2 * s);
      ctx.lineTo(pyrX, tipY);
      ctx.closePath();
      ctx.fill();

      // Secondary sparkles around the tip
      const sparkle2Phase = decorTime * 2.3;
      const sparkle2Int = (Math.sin(sparkle2Phase + 1) + 1) / 2;
      ctx.fillStyle = `rgba(255,250,200,${0.3 + sparkle2Int * 0.4})`;

      // Right sparkle
      ctx.beginPath();
      ctx.arc(pyrX + 5 * s, tipY + 8 * s, 2 * s * sparkle2Int, 0, Math.PI * 2);
      ctx.fill();

      // Left sparkle (offset phase)
      const sparkle3Int = (Math.sin(sparkle2Phase + 2.5) + 1) / 2;
      ctx.fillStyle = `rgba(255,250,200,${0.3 + sparkle3Int * 0.4})`;
      ctx.beginPath();
      ctx.arc(pyrX - 4 * s, tipY + 10 * s, 1.8 * s * sparkle3Int, 0, Math.PI * 2);
      ctx.fill();

      // Edge gleam on cap
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(pyrX, tipY);
      ctx.lineTo(pyrX + capWidth * 0.5, capY - 10 * s);
      ctx.stroke();

      // Subtle lens flare effect
      if (sparkleIntensity > 0.7) {
        const flareAlpha = (sparkleIntensity - 0.7) * 2;
        ctx.fillStyle = `rgba(255,255,240,${flareAlpha * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(pyrX + 15 * s, tipY + 15 * s, 12 * s, 4 * s, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(pyrX - 10 * s, tipY + 20 * s, 8 * s, 3 * s, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "obelisk": {
      const ox = screenPos.x;
      const oy = screenPos.y;

      // Pre-baked palettes with derived colors
      const obelPals = [
        { left: "#8a7a58", right: "#a89870", front: "#b0a068", top: "#c8b888", cap: "#d4a840", capDk: "#be9428", capFr: "#ca9e3b", capHi: "#f0d060", glyph: "#5a4a38", pedTop: "#b8a878", pedLeft: "#807048", pedRight: "#988860" },
        { left: "#58544a", right: "#706c5e", front: "#666258", top: "#8a8678", cap: "#c4c0b0", capDk: "#b2aea0", capFr: "#bdb9ab", capHi: "#e4e0d4", glyph: "#3a3830", pedTop: "#7a766a", pedLeft: "#4a4840", pedRight: "#605e54" },
        { left: "#28241e", right: "#38342a", front: "#302c24", top: "#48443a", cap: "#8868b8", capDk: "#7a56a6", capFr: "#8260b0", capHi: "#a888d8", glyph: "#4a3858", pedTop: "#383428", pedLeft: "#1a1810", pedRight: "#2a2820" },
      ];
      const op = obelPals[variant % obelPals.length];

      const oH = 55 * s;
      const oBaseW = 10 * s;
      const oTopW = 6 * s;

      // Ground shadow (flat)
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(ox + 6 * s, oy + 6 * s, 18 * s, 8 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Single merged pedestal
      const pedW = 13 * s;
      const pedH = 8 * s;
      const pedIso = pedW * 0.866;
      const pedD = pedW * 0.5;
      ctx.fillStyle = op.pedTop;
      ctx.beginPath();
      ctx.moveTo(ox, oy - pedH);
      ctx.lineTo(ox + pedIso, oy - pedH + pedD);
      ctx.lineTo(ox, oy - pedH + pedD * 2);
      ctx.lineTo(ox - pedIso, oy - pedH + pedD);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = op.pedLeft;
      ctx.beginPath();
      ctx.moveTo(ox - pedIso, oy - pedH + pedD);
      ctx.lineTo(ox, oy - pedH + pedD * 2);
      ctx.lineTo(ox, oy + pedD * 2);
      ctx.lineTo(ox - pedIso, oy + pedD);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = op.pedRight;
      ctx.beginPath();
      ctx.moveTo(ox + pedIso, oy - pedH + pedD);
      ctx.lineTo(ox, oy - pedH + pedD * 2);
      ctx.lineTo(ox, oy + pedD * 2);
      ctx.lineTo(ox + pedIso, oy + pedD);
      ctx.closePath();
      ctx.fill();

      // Shaft
      const sBase = oy - pedH;
      const sTop = sBase - oH;
      const bw86 = oBaseW * 0.866;
      const tw86 = oTopW * 0.866;
      const bwIso = oBaseW * 0.5;
      const twIso = oTopW * 0.5;

      ctx.fillStyle = op.left;
      ctx.beginPath();
      ctx.moveTo(ox - bw86, sBase + bwIso);
      ctx.lineTo(ox, sBase + bwIso * 2);
      ctx.lineTo(ox, sTop + twIso * 2);
      ctx.lineTo(ox - tw86, sTop + twIso);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = op.right;
      ctx.beginPath();
      ctx.moveTo(ox + bw86, sBase + bwIso);
      ctx.lineTo(ox, sBase + bwIso * 2);
      ctx.lineTo(ox, sTop + twIso * 2);
      ctx.lineTo(ox + tw86, sTop + twIso);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = op.front;
      ctx.beginPath();
      ctx.moveTo(ox - bw86, sBase + bwIso);
      ctx.lineTo(ox + bw86, sBase + bwIso);
      ctx.lineTo(ox + tw86, sTop + twIso);
      ctx.lineTo(ox - tw86, sTop + twIso);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = op.top;
      ctx.beginPath();
      ctx.moveTo(ox, sTop);
      ctx.lineTo(ox + tw86, sTop + twIso);
      ctx.lineTo(ox, sTop + twIso * 2);
      ctx.lineTo(ox - tw86, sTop + twIso);
      ctx.closePath();
      ctx.fill();

      // Pyramidion cap
      const cTip = sTop - 10 * s;
      ctx.fillStyle = op.capDk;
      ctx.beginPath();
      ctx.moveTo(ox, cTip);
      ctx.lineTo(ox - tw86, sTop + twIso);
      ctx.lineTo(ox, sTop + twIso * 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = op.cap;
      ctx.beginPath();
      ctx.moveTo(ox, cTip);
      ctx.lineTo(ox + tw86, sTop + twIso);
      ctx.lineTo(ox, sTop + twIso * 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = op.capFr;
      ctx.beginPath();
      ctx.moveTo(ox, cTip);
      ctx.lineTo(ox - tw86, sTop + twIso);
      ctx.lineTo(ox + tw86, sTop + twIso);
      ctx.closePath();
      ctx.fill();

      // Cap highlight
      ctx.fillStyle = op.capHi;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(ox, cTip);
      ctx.lineTo(ox + oTopW * 0.5, sTop + twIso * 0.6);
      ctx.lineTo(ox, sTop + twIso);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // Hieroglyphs (reduced: 3 left, 2 right, simple rects)
      ctx.fillStyle = op.glyph;
      for (let g = 0; g < 3; g++) {
        const gt = 0.2 + g * 0.3;
        const gy = sBase + (sTop - sBase) * gt;
        const gx = ox - (oBaseW + (oTopW - oBaseW) * gt) * 0.43;
        ctx.fillRect(gx - 2 * s, gy - 0.8 * s, 4 * s, 1.6 * s);
      }
      for (let g = 0; g < 2; g++) {
        const gt = 0.3 + g * 0.4;
        const gy = sBase + (sTop - sBase) * gt;
        const gx = ox + (oBaseW + (oTopW - oBaseW) * gt) * 0.43;
        ctx.fillRect(gx - 1.5 * s, gy - 0.6 * s, 3 * s, 1.2 * s);
      }

      // Edge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = s;
      ctx.beginPath();
      ctx.moveTo(ox, cTip);
      ctx.lineTo(ox + tw86, sTop + twIso);
      ctx.lineTo(ox + bw86, sBase + bwIso);
      ctx.stroke();

      // Obsidian glow
      if (variant === 2) {
        ctx.fillStyle = `rgba(128,80,200,${0.3 + Math.sin(decorTime * 2) * 0.15})`;
        ctx.beginPath();
        ctx.arc(ox, cTip - 3 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "giant_sphinx": {
      const time = Date.now() / 1000;

      // Color palette - aged sandstone
      const sandLight = "#d4c490";
      const sandBase = "#c2b280";
      const sandMid = "#b0a070";
      const sandDark = "#8a7a55";
      const sandShadow = "#6a5a40";
      const goldAccent = "#d4a850";
      const goldDark = "#a08030";
      const eyeGlow = "#40d0ff";

      // Subtle mystical pulse
      const mysticPulse = 0.6 + Math.sin(time * 1.5) * 0.2;

      // ========== GROUND SHADOW ==========
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 5 * s,
        screenPos.y + 18 * s,
        55 * s,
        22 * s,
        0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // ========== SAND AROUND BASE ==========
      const sandGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y + 10 * s,
        20 * s,
        screenPos.x,
        screenPos.y + 10 * s,
        60 * s
      );
      sandGrad.addColorStop(0, "rgba(194, 178, 128, 0.4)");
      sandGrad.addColorStop(0.5, "rgba(194, 178, 128, 0.2)");
      sandGrad.addColorStop(1, "rgba(194, 178, 128, 0)");
      ctx.fillStyle = sandGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 10 * s,
        60 * s,
        25 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // ========== GRAND PEDESTAL BASE ==========
      // Multi-tiered base for monumentality

      // Bottom tier (largest)
      ctx.fillStyle = sandDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 45 * s, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x + 45 * s, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 32 * s);
      ctx.closePath();
      ctx.fill();

      // Bottom tier front face
      ctx.fillStyle = sandShadow;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 45 * s, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 32 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 38 * s);
      ctx.lineTo(screenPos.x - 45 * s, screenPos.y + 18 * s);
      ctx.closePath();
      ctx.fill();

      // Bottom tier side face
      ctx.fillStyle = sandDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 32 * s);
      ctx.lineTo(screenPos.x + 45 * s, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x + 45 * s, screenPos.y + 18 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 38 * s);
      ctx.closePath();
      ctx.fill();

      // Middle tier
      ctx.fillStyle = sandMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 38 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 28 * s);
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 14 * s);
      ctx.closePath();
      ctx.fill();

      // Middle tier front
      ctx.fillStyle = sandDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 38 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 20 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 28 * s);
      ctx.lineTo(screenPos.x - 38 * s, screenPos.y + 12 * s);
      ctx.closePath();
      ctx.fill();

      // Middle tier side
      ctx.fillStyle = sandMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 20 * s);
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 28 * s);
      ctx.closePath();
      ctx.fill();

      // Top tier (main platform)
      ctx.fillStyle = sandBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 32 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 16 * s);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 14 * s);
      ctx.closePath();
      ctx.fill();

      // Top tier front
      ctx.fillStyle = sandMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 32 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 18 * s);
      ctx.lineTo(screenPos.x - 32 * s, screenPos.y + 5 * s);
      ctx.closePath();
      ctx.fill();

      // Top tier side
      ctx.fillStyle = sandBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 12 * s);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 18 * s);
      ctx.closePath();
      ctx.fill();

      // ========== HIEROGLYPHIC CARVINGS ON BASE ==========
      ctx.strokeStyle = sandShadow;
      ctx.lineWidth = 1 * s;

      // Front face hieroglyphics
      const glyphY = screenPos.y + 8 * s;
      // Ankh symbol
      ctx.beginPath();
      ctx.arc(
        screenPos.x - 20 * s,
        glyphY - 3 * s,
        2.5 * s,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, glyphY - 0.5 * s);
      ctx.lineTo(screenPos.x - 20 * s, glyphY + 6 * s);
      ctx.moveTo(screenPos.x - 23 * s, glyphY + 2 * s);
      ctx.lineTo(screenPos.x - 17 * s, glyphY + 2 * s);
      ctx.stroke();

      // Eye of Horus
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 8 * s,
        glyphY + 1 * s,
        4 * s,
        2.5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(screenPos.x - 8 * s, glyphY + 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, glyphY + 3.5 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 10 * s,
        glyphY + 6 * s,
        screenPos.x - 12 * s,
        glyphY + 5 * s
      );
      ctx.stroke();

      // Cartouche border on side
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.roundRect(
        screenPos.x + 8 * s,
        screenPos.y + 3 * s,
        18 * s,
        8 * s,
        3 * s
      );
      ctx.stroke();

      // ========== EXTENDED FRONT PAWS ==========
      // Right paw (front)
      const pawGrad = ctx.createLinearGradient(
        screenPos.x + 15 * s,
        screenPos.y - 5 * s,
        screenPos.x + 35 * s,
        screenPos.y + 5 * s
      );
      pawGrad.addColorStop(0, sandBase);
      pawGrad.addColorStop(0.5, sandLight);
      pawGrad.addColorStop(1, sandMid);
      ctx.fillStyle = pawGrad;

      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 35 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x + 35 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Paw details - toes
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 32 * s, screenPos.y - 1 * s);
      ctx.lineTo(screenPos.x + 35 * s, screenPos.y + 2 * s);
      ctx.moveTo(screenPos.x + 29 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y + 3 * s);
      ctx.stroke();

      // Left paw (behind, darker)
      ctx.fillStyle = sandMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 6 * s);
      ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 6 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 2 * s);
      ctx.closePath();
      ctx.fill();

      // ========== LION BODY ==========
      // Back haunch
      ctx.fillStyle = sandDark;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 18 * s,
        screenPos.y - 18 * s,
        14 * s,
        10 * s,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Main body gradient
      const bodyGrad = ctx.createLinearGradient(
        screenPos.x - 25 * s,
        screenPos.y - 30 * s,
        screenPos.x + 20 * s,
        screenPos.y
      );
      bodyGrad.addColorStop(0, sandLight);
      bodyGrad.addColorStop(0.3, sandBase);
      bodyGrad.addColorStop(0.6, sandMid);
      bodyGrad.addColorStop(1, sandDark);
      ctx.fillStyle = bodyGrad;

      ctx.beginPath();
      ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 12 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 20 * s,
        screenPos.y - 35 * s,
        screenPos.x - 5 * s,
        screenPos.y - 32 * s
      );
      ctx.quadraticCurveTo(
        screenPos.x + 15 * s,
        screenPos.y - 28 * s,
        screenPos.x + 22 * s,
        screenPos.y - 18 * s
      );
      ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 6 * s);
      ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 8 * s);
      ctx.closePath();
      ctx.fill();

      // Body contour lines (muscle definition)
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15 * s, screenPos.y - 25 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 5 * s,
        screenPos.y - 20 * s,
        screenPos.x + 5 * s,
        screenPos.y - 22 * s
      );
      ctx.stroke();

      // Ribcage suggestion
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 18 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 8 * s,
        screenPos.y - 14 * s,
        screenPos.x - 5 * s,
        screenPos.y - 12 * s
      );
      ctx.stroke();

      // ========== CHEST AND NECK ==========
      // Broad chest
      const chestGrad = ctx.createLinearGradient(
        screenPos.x + 5 * s,
        screenPos.y - 35 * s,
        screenPos.x + 25 * s,
        screenPos.y - 15 * s
      );
      chestGrad.addColorStop(0, sandLight);
      chestGrad.addColorStop(0.5, sandBase);
      chestGrad.addColorStop(1, sandMid);
      ctx.fillStyle = chestGrad;

      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 32 * s);
      ctx.quadraticCurveTo(
        screenPos.x + 18 * s,
        screenPos.y - 35 * s,
        screenPos.x + 25 * s,
        screenPos.y - 25 * s
      );
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 18 * s);
      ctx.quadraticCurveTo(
        screenPos.x + 15 * s,
        screenPos.y - 25 * s,
        screenPos.x + 5 * s,
        screenPos.y - 28 * s
      );
      ctx.closePath();
      ctx.fill();

      // ========== NEMES HEADDREs (Back portion first) ==========
      // Back drape of headdres
      ctx.fillStyle = sandMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 55 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 20 * s,
        screenPos.y - 50 * s,
        screenPos.x - 22 * s,
        screenPos.y - 25 * s
      );
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 20 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 12 * s,
        screenPos.y - 35 * s,
        screenPos.x,
        screenPos.y - 45 * s
      );
      ctx.closePath();
      ctx.fill();

      // ========== HEAD AND FACE ==========
      const headCenterX = screenPos.x + 8 * s;
      const headCenterY = screenPos.y - 45 * s;

      // Face base shape
      const faceGrad = ctx.createLinearGradient(
        headCenterX - 10 * s,
        headCenterY - 10 * s,
        headCenterX + 10 * s,
        headCenterY + 15 * s
      );
      faceGrad.addColorStop(0, sandLight);
      faceGrad.addColorStop(0.4, sandBase);
      faceGrad.addColorStop(0.8, sandMid);
      faceGrad.addColorStop(1, sandDark);
      ctx.fillStyle = faceGrad;

      // Face shape - more angular/Egyptian
      ctx.beginPath();
      ctx.moveTo(headCenterX - 10 * s, headCenterY - 8 * s);
      ctx.lineTo(headCenterX - 12 * s, headCenterY + 5 * s);
      ctx.quadraticCurveTo(
        headCenterX - 10 * s,
        headCenterY + 12 * s,
        headCenterX,
        headCenterY + 15 * s
      );
      ctx.quadraticCurveTo(
        headCenterX + 10 * s,
        headCenterY + 12 * s,
        headCenterX + 12 * s,
        headCenterY + 5 * s
      );
      ctx.lineTo(headCenterX + 10 * s, headCenterY - 8 * s);
      ctx.closePath();
      ctx.fill();

      // ========== NEMES HEADDREs (Front) ==========
      // Main headdres
      const nemesGrad = ctx.createLinearGradient(
        headCenterX - 18 * s,
        headCenterY - 15 * s,
        headCenterX + 18 * s,
        headCenterY + 10 * s
      );
      nemesGrad.addColorStop(0, goldAccent);
      nemesGrad.addColorStop(0.3, sandLight);
      nemesGrad.addColorStop(0.5, goldAccent);
      nemesGrad.addColorStop(0.7, sandLight);
      nemesGrad.addColorStop(1, goldDark);
      ctx.fillStyle = nemesGrad;

      // Headdres shape
      ctx.beginPath();
      ctx.moveTo(headCenterX, headCenterY - 18 * s); // Top
      ctx.quadraticCurveTo(
        headCenterX - 18 * s,
        headCenterY - 15 * s,
        headCenterX - 20 * s,
        headCenterY
      );
      ctx.lineTo(headCenterX - 18 * s, headCenterY + 20 * s); // Left drape
      ctx.lineTo(headCenterX - 12 * s, headCenterY + 5 * s);
      ctx.lineTo(headCenterX - 10 * s, headCenterY - 8 * s);
      ctx.lineTo(headCenterX + 10 * s, headCenterY - 8 * s);
      ctx.lineTo(headCenterX + 12 * s, headCenterY + 5 * s);
      ctx.lineTo(headCenterX + 18 * s, headCenterY + 20 * s); // Right drape
      ctx.quadraticCurveTo(
        headCenterX + 18 * s,
        headCenterY - 15 * s,
        headCenterX,
        headCenterY - 18 * s
      );
      ctx.closePath();
      ctx.fill();

      // Headdres stripes
      ctx.strokeStyle = goldDark;
      ctx.lineWidth = 1.5 * s;

      // Left side stripes
      for (let i = 0; i < 5; i++) {
        const stripeT = i / 5;
        ctx.beginPath();
        ctx.moveTo(
          headCenterX - 10 * s - stripeT * 8 * s,
          headCenterY - 8 * s + stripeT * 5 * s
        );
        ctx.lineTo(
          headCenterX - 12 * s - stripeT * 6 * s,
          headCenterY + 5 * s + stripeT * 15 * s
        );
        ctx.stroke();
      }

      // Right side stripes
      for (let i = 0; i < 5; i++) {
        const stripeT = i / 5;
        ctx.beginPath();
        ctx.moveTo(
          headCenterX + 10 * s + stripeT * 8 * s,
          headCenterY - 8 * s + stripeT * 5 * s
        );
        ctx.lineTo(
          headCenterX + 12 * s + stripeT * 6 * s,
          headCenterY + 5 * s + stripeT * 15 * s
        );
        ctx.stroke();
      }

      // ========== URAEUS (Cobra on forehead) ==========
      ctx.fillStyle = goldAccent;
      // Cobra body
      ctx.beginPath();
      ctx.moveTo(headCenterX, headCenterY - 18 * s);
      ctx.quadraticCurveTo(
        headCenterX + 2 * s,
        headCenterY - 22 * s,
        headCenterX,
        headCenterY - 26 * s
      );
      ctx.quadraticCurveTo(
        headCenterX - 2 * s,
        headCenterY - 22 * s,
        headCenterX,
        headCenterY - 18 * s
      );
      ctx.fill();

      // Cobra hood
      ctx.beginPath();
      ctx.moveTo(headCenterX - 4 * s, headCenterY - 24 * s);
      ctx.quadraticCurveTo(
        headCenterX,
        headCenterY - 30 * s,
        headCenterX + 4 * s,
        headCenterY - 24 * s
      );
      ctx.quadraticCurveTo(
        headCenterX,
        headCenterY - 26 * s,
        headCenterX - 4 * s,
        headCenterY - 24 * s
      );
      ctx.fill();

      // Cobra eyes (glowing)
      ctx.fillStyle = `rgba(255, 50, 50, ${mysticPulse})`;
      ctx.beginPath();
      ctx.arc(
        headCenterX - 1.5 * s,
        headCenterY - 26 * s,
        0.8 * s,
        0,
        Math.PI * 2
      );
      ctx.arc(
        headCenterX + 1.5 * s,
        headCenterY - 26 * s,
        0.8 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // ========== FACIAL FEATURES ==========
      // Eyebrows (carved)
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 8 * s, headCenterY - 3 * s);
      ctx.quadraticCurveTo(
        headCenterX - 5 * s,
        headCenterY - 5 * s,
        headCenterX - 2 * s,
        headCenterY - 3 * s
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headCenterX + 2 * s, headCenterY - 3 * s);
      ctx.quadraticCurveTo(
        headCenterX + 5 * s,
        headCenterY - 5 * s,
        headCenterX + 8 * s,
        headCenterY - 3 * s
      );
      ctx.stroke();

      // Eye sockets
      ctx.fillStyle = sandShadow;
      ctx.beginPath();
      ctx.ellipse(
        headCenterX - 5 * s,
        headCenterY,
        3.5 * s,
        2 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        headCenterX + 5 * s,
        headCenterY,
        3.5 * s,
        2 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Mystical glowing eyes
      const eyeGlowIntensity = mysticPulse * 0.8;
      ctx.fillStyle = `rgba(64, 208, 255, ${eyeGlowIntensity})`;
      ctx.shadowColor = eyeGlow;
      ctx.shadowBlur = 8 * s;
      ctx.beginPath();
      ctx.ellipse(
        headCenterX - 5 * s,
        headCenterY,
        2.5 * s,
        1.5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        headCenterX + 5 * s,
        headCenterY,
        2.5 * s,
        1.5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye pupils
      ctx.fillStyle = "#104050";
      ctx.beginPath();
      ctx.arc(headCenterX - 5 * s, headCenterY, 1 * s, 0, Math.PI * 2);
      ctx.arc(headCenterX + 5 * s, headCenterY, 1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = sandMid;
      ctx.beginPath();
      ctx.moveTo(headCenterX, headCenterY + 1 * s);
      ctx.lineTo(headCenterX - 2.5 * s, headCenterY + 7 * s);
      ctx.lineTo(headCenterX, headCenterY + 6 * s);
      ctx.lineTo(headCenterX + 2.5 * s, headCenterY + 7 * s);
      ctx.closePath();
      ctx.fill();

      // Nose shadow
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 2 * s, headCenterY + 7 * s);
      ctx.lineTo(headCenterX + 2 * s, headCenterY + 7 * s);
      ctx.stroke();

      // Mouth (serene smile)
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 5 * s, headCenterY + 10 * s);
      ctx.quadraticCurveTo(
        headCenterX,
        headCenterY + 12 * s,
        headCenterX + 5 * s,
        headCenterY + 10 * s
      );
      ctx.stroke();

      // Chin definition
      ctx.beginPath();
      ctx.moveTo(headCenterX - 3 * s, headCenterY + 13 * s);
      ctx.quadraticCurveTo(
        headCenterX,
        headCenterY + 15 * s,
        headCenterX + 3 * s,
        headCenterY + 13 * s
      );
      ctx.stroke();

      // ========== CEREMONIAL BEARD ==========
      ctx.fillStyle = goldDark;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 2 * s, headCenterY + 15 * s);
      ctx.lineTo(headCenterX - 3 * s, headCenterY + 28 * s);
      ctx.quadraticCurveTo(
        headCenterX,
        headCenterY + 30 * s,
        headCenterX + 3 * s,
        headCenterY + 28 * s
      );
      ctx.lineTo(headCenterX + 2 * s, headCenterY + 15 * s);
      ctx.closePath();
      ctx.fill();

      // Beard stripes
      ctx.strokeStyle = sandDark;
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 4; i++) {
        const beardY = headCenterY + 18 * s + i * 3 * s;
        ctx.beginPath();
        ctx.moveTo(headCenterX - 2.5 * s, beardY);
        ctx.lineTo(headCenterX + 2.5 * s, beardY);
        ctx.stroke();
      }

      // ========== COLLAR/BROAD COLLAR ==========
      // Decorative collar at neck
      const collarY = headCenterY + 15 * s;
      ctx.fillStyle = goldAccent;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 15 * s, collarY + 5 * s);
      ctx.quadraticCurveTo(
        headCenterX,
        collarY + 12 * s,
        headCenterX + 15 * s,
        collarY + 5 * s
      );
      ctx.quadraticCurveTo(
        headCenterX,
        collarY + 8 * s,
        headCenterX - 15 * s,
        collarY + 5 * s
      );
      ctx.fill();

      // Collar details
      ctx.strokeStyle = goldDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 12 * s, collarY + 6 * s);
      ctx.quadraticCurveTo(
        headCenterX,
        collarY + 10 * s,
        headCenterX + 12 * s,
        collarY + 6 * s
      );
      ctx.stroke();

      // Gem on collar
      ctx.fillStyle = `rgba(64, 208, 255, ${mysticPulse})`;
      ctx.shadowColor = eyeGlow;
      ctx.shadowBlur = 6 * s;
      ctx.beginPath();
      ctx.arc(headCenterX, collarY + 8 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ========== WEATHERING AND CRACKS ==========
      ctx.strokeStyle = "rgba(80, 60, 40, 0.3)";
      ctx.lineWidth = 0.5 * s;

      // Crack on face
      ctx.beginPath();
      ctx.moveTo(headCenterX + 8 * s, headCenterY + 3 * s);
      ctx.lineTo(headCenterX + 10 * s, headCenterY + 8 * s);
      ctx.lineTo(headCenterX + 9 * s, headCenterY + 12 * s);
      ctx.stroke();

      // Crack on body
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 10 * s);
      ctx.stroke();

      // ========== MYSTICAL AURA ==========
      // Subtle glow around the sphinx
      const auraGrad = ctx.createRadialGradient(
        screenPos.x + 5 * s,
        screenPos.y - 30 * s,
        10 * s,
        screenPos.x + 5 * s,
        screenPos.y - 30 * s,
        50 * s
      );
      auraGrad.addColorStop(0, `rgba(64, 208, 255, ${mysticPulse * 0.1})`);
      auraGrad.addColorStop(
        0.5,
        `rgba(64, 208, 255, ${mysticPulse * 0.05})`
      );
      auraGrad.addColorStop(1, "rgba(64, 208, 255, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 5 * s,
        screenPos.y - 25 * s,
        50 * s,
        35 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // ========== FLOATING DUST PARTICLES ==========
      ctx.fillStyle = `rgba(212, 196, 144, 0.4)`;
      for (let i = 0; i < 6; i++) {
        const dustTime = (time * 0.3 + i * 0.8) % 3;
        const dustAngle = (i / 6) * Math.PI * 2 + time * 0.2;
        const dustDist = 35 + Math.sin(time + i * 2) * 10;
        const dustX = screenPos.x + Math.cos(dustAngle) * dustDist * s;
        const dustY =
          screenPos.y -
          20 * s +
          Math.sin(dustAngle) * dustDist * 0.4 * s -
          dustTime * 8 * s;
        const dustAlpha = 0.3 + Math.sin(time * 2 + i) * 0.15;

        ctx.fillStyle = `rgba(212, 196, 144, ${dustAlpha})`;
        ctx.beginPath();
        ctx.arc(dustX, dustY, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      break;
    }
    case "sphinx": {
      const spxV = variant || 0;
      const sx = screenPos.x;
      const sy = screenPos.y;

      // Variant palettes (pre-baked, no runtime color ops)
      const spxPals = [
        { lit: "#d4b584", base: "#c4a574", mid: "#b49564", dark: "#9a7a4a", shadow: "#7a5a30", accent: "#d4a840", stripe: "#8a6a3a" },
        { lit: "#d0c0a8", base: "#b8a090", mid: "#a89080", dark: "#8a7060", shadow: "#6a5040", accent: "#c0c8d0", stripe: "#6a5a4a" },
        { lit: "#e0c070", base: "#c8a060", mid: "#b89050", dark: "#9a7030", shadow: "#7a5010", accent: "#e8c040", stripe: "#7a5a20" },
      ];
      const p = spxPals[spxV % spxPals.length];

      const bodyW = 44 * s;
      const bodyH = 18 * s;
      const hw = bodyW * 0.5 * 0.866;
      const hd = bodyW * 0.5 * 0.5 * 0.5;

      // === GROUND SHADOW (flat) ===
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(sx + 4 * s, sy + 6 * s, 38 * s, 14 * s, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // === PEDESTAL ===
      const pdW = 32 * s, pdHt = 8 * s;
      const pdIso = pdW * 0.866 * 0.5;
      const pdD = pdW * 0.5 * 0.5;
      ctx.fillStyle = p.mid;
      ctx.beginPath();
      ctx.moveTo(sx, sy - pdHt - pdD);
      ctx.lineTo(sx + pdIso, sy - pdHt);
      ctx.lineTo(sx, sy - pdHt + pdD);
      ctx.lineTo(sx - pdIso, sy - pdHt);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.moveTo(sx - pdIso, sy - pdHt);
      ctx.lineTo(sx, sy - pdHt + pdD);
      ctx.lineTo(sx, sy + pdD);
      ctx.lineTo(sx - pdIso, sy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.base;
      ctx.beginPath();
      ctx.moveTo(sx + pdIso, sy - pdHt);
      ctx.lineTo(sx, sy - pdHt + pdD);
      ctx.lineTo(sx, sy + pdD);
      ctx.lineTo(sx + pdIso, sy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.moveTo(sx - pdIso, sy - pdHt);
      ctx.lineTo(sx, sy - pdHt - pdD);
      ctx.lineTo(sx + pdIso, sy - pdHt);
      ctx.stroke();

      const bt = sy - pdHt;

      // === TAIL (behind body) ===
      ctx.strokeStyle = p.mid;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx - hw + 4 * s, bt - bodyH * 0.5);
      ctx.bezierCurveTo(sx - hw - 10 * s, bt - bodyH * 0.7, sx - hw - 12 * s, bt - bodyH * 1.3, sx - hw - 6 * s, bt - bodyH * 1.5);
      ctx.stroke();
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.arc(sx - hw - 6 * s, bt - bodyH * 1.5, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // === LION BODY (isometric box with rounded back) ===
      // Body left face (shadow) with raised hump
      ctx.fillStyle = p.shadow;
      ctx.beginPath();
      ctx.moveTo(sx - hw, bt);
      ctx.lineTo(sx - hw, bt - bodyH * 0.8);
      ctx.bezierCurveTo(sx - hw + 6 * s, bt - bodyH * 1.4, sx - 4 * s, bt - bodyH * 1.4, sx, bt - bodyH);
      ctx.lineTo(sx + hw, bt - bodyH);
      ctx.lineTo(sx + hw, bt);
      ctx.lineTo(sx, bt + hd);
      ctx.lineTo(sx - hw, bt);
      ctx.closePath();
      ctx.fill();

      // Body right face (lit)
      ctx.fillStyle = p.lit;
      ctx.beginPath();
      ctx.moveTo(sx + hw, bt);
      ctx.lineTo(sx + hw, bt - bodyH);
      ctx.lineTo(sx, bt - bodyH - hd);
      ctx.bezierCurveTo(sx - 4 * s, bt - bodyH * 1.4 - hd, sx - hw + 6 * s, bt - bodyH * 1.4 - hd, sx - hw, bt - bodyH * 0.8 - hd);
      ctx.lineTo(sx - hw, bt - hd);
      ctx.lineTo(sx, bt + hd);
      ctx.lineTo(sx + hw, bt);
      ctx.closePath();
      ctx.fill();

      // Body top face
      ctx.fillStyle = p.base;
      ctx.beginPath();
      ctx.moveTo(sx - hw, bt - bodyH * 0.8);
      ctx.bezierCurveTo(sx - hw + 6 * s, bt - bodyH * 1.4, sx - 4 * s, bt - bodyH * 1.4, sx, bt - bodyH);
      ctx.lineTo(sx + hw, bt - bodyH);
      ctx.lineTo(sx, bt - bodyH - hd);
      ctx.bezierCurveTo(sx - 4 * s, bt - bodyH * 1.4 - hd, sx - hw + 6 * s, bt - bodyH * 1.4 - hd, sx - hw, bt - bodyH * 0.8 - hd);
      ctx.closePath();
      ctx.fill();

      // Front face
      ctx.fillStyle = p.mid;
      ctx.beginPath();
      ctx.moveTo(sx + hw, bt);
      ctx.lineTo(sx + hw, bt - bodyH);
      ctx.lineTo(sx, bt - bodyH - hd);
      ctx.lineTo(sx, bt + hd);
      ctx.closePath();
      ctx.fill();

      // === FRONT PAWS ===
      const pawL = 16 * s;
      const pawH2 = 5 * s;
      const pawFX = sx + hw;
      const pawIso = 6 * s * 0.866 * 0.5;

      // Left paw
      const lpY = bt - 2 * s;
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.moveTo(pawFX, lpY);
      ctx.lineTo(pawFX + pawL * 0.5, lpY + pawL * 0.25);
      ctx.lineTo(pawFX + pawL * 0.5, lpY + pawL * 0.25 + pawH2);
      ctx.lineTo(pawFX, lpY + pawH2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.mid;
      ctx.beginPath();
      ctx.moveTo(pawFX, lpY);
      ctx.lineTo(pawFX + pawL * 0.5, lpY + pawL * 0.25);
      ctx.lineTo(pawFX + pawL * 0.5 - pawIso, lpY + pawL * 0.25 - 6 * s * 0.25);
      ctx.lineTo(pawFX - pawIso, lpY - 6 * s * 0.25);
      ctx.closePath();
      ctx.fill();

      // Right paw
      const rpY = bt - bodyH + 2 * s;
      ctx.fillStyle = p.shadow;
      ctx.beginPath();
      ctx.moveTo(pawFX, rpY);
      ctx.lineTo(pawFX + pawL * 0.5, rpY + pawL * 0.25);
      ctx.lineTo(pawFX + pawL * 0.5, rpY + pawL * 0.25 + pawH2);
      ctx.lineTo(pawFX, rpY + pawH2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.lit;
      ctx.beginPath();
      ctx.moveTo(pawFX, rpY);
      ctx.lineTo(pawFX + pawL * 0.5, rpY + pawL * 0.25);
      ctx.lineTo(pawFX + pawL * 0.5 + pawIso, rpY + pawL * 0.25 - 6 * s * 0.25);
      ctx.lineTo(pawFX + pawIso, rpY - 6 * s * 0.25);
      ctx.closePath();
      ctx.fill();

      // === HEAD ===
      const hx = sx + hw - 4 * s;
      const hy = bt - bodyH - 6 * s;
      const headW2 = 12 * s;
      const headH2 = 18 * s;
      const hdIso = headW2 * 0.866 * 0.5;
      const hdDep = headW2 * 0.5 * 0.25;

      // Nemes lappets
      ctx.fillStyle = p.mid;
      ctx.beginPath();
      ctx.moveTo(hx - hdIso - 2 * s, hy);
      ctx.lineTo(hx - hdIso - 4 * s, hy + headH2 + 6 * s);
      ctx.lineTo(hx - hdIso, hy + headH2 + 6 * s);
      ctx.lineTo(hx - hdIso + 2 * s, hy + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.lit;
      ctx.beginPath();
      ctx.moveTo(hx + hdIso + 2 * s, hy);
      ctx.lineTo(hx + hdIso + 4 * s, hy + headH2 + 6 * s);
      ctx.lineTo(hx + hdIso, hy + headH2 + 6 * s);
      ctx.lineTo(hx + hdIso - 2 * s, hy + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Head left face
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.moveTo(hx - hdIso, hy);
      ctx.lineTo(hx, hy + hdDep);
      ctx.lineTo(hx, hy + headH2 + hdDep - 3 * s);
      ctx.lineTo(hx - hdIso + 2 * s, hy + headH2);
      ctx.closePath();
      ctx.fill();
      // Head right face
      ctx.fillStyle = p.lit;
      ctx.beginPath();
      ctx.moveTo(hx + hdIso, hy);
      ctx.lineTo(hx, hy + hdDep);
      ctx.lineTo(hx, hy + headH2 + hdDep - 3 * s);
      ctx.lineTo(hx + hdIso - 2 * s, hy + headH2);
      ctx.closePath();
      ctx.fill();
      // Head front face
      ctx.fillStyle = p.base;
      ctx.beginPath();
      ctx.moveTo(hx - hdIso, hy);
      ctx.lineTo(hx + hdIso, hy);
      ctx.lineTo(hx + hdIso - 2 * s, hy + headH2);
      ctx.lineTo(hx - hdIso + 2 * s, hy + headH2);
      ctx.closePath();
      ctx.fill();

      // Nemes dome
      ctx.fillStyle = p.lit;
      ctx.beginPath();
      ctx.moveTo(hx - hdIso - 2 * s, hy);
      ctx.bezierCurveTo(hx - hdIso - 3 * s, hy - 9 * s, hx - 4 * s, hy - 14 * s, hx, hy - 16 * s);
      ctx.bezierCurveTo(hx + 4 * s, hy - 14 * s, hx + hdIso + 3 * s, hy - 9 * s, hx + hdIso + 2 * s, hy);
      ctx.closePath();
      ctx.fill();

      // Nemes stripes
      ctx.strokeStyle = p.stripe;
      ctx.lineWidth = 1.2 * s;
      for (let ns = 0; ns < 4; ns++) {
        const nsFrac = (ns + 1) / 5;
        const nsY = hy - 16 * s + nsFrac * 16 * s;
        const nsSpread = (hdIso + 2 * s) * Math.sin(nsFrac * Math.PI * 0.9);
        ctx.beginPath();
        ctx.moveTo(hx - nsSpread, nsY + nsFrac * 2 * s);
        ctx.quadraticCurveTo(hx, nsY - 1.5 * s, hx + nsSpread, nsY + nsFrac * 2 * s);
        ctx.stroke();
      }

      // Eyes
      ctx.fillStyle = p.shadow;
      ctx.beginPath();
      ctx.ellipse(hx - 3.5 * s, hy + 4 * s, 2.2 * s, 1.3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hx + 3.5 * s, hy + 4 * s, 2.2 * s, 1.3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.lit;
      ctx.beginPath();
      ctx.ellipse(hx - 3.5 * s, hy + 3.8 * s, 1.2 * s, 0.7 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hx + 3.5 * s, hy + 3.8 * s, 1.2 * s, 0.7 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 7 * s);
      ctx.lineTo(hx - 1.5 * s, hy + 9.5 * s);
      ctx.lineTo(hx + 1.5 * s, hy + 9.5 * s);
      ctx.closePath();
      ctx.fill();

      // Mouth
      ctx.strokeStyle = p.dark;
      ctx.lineWidth = s;
      ctx.beginPath();
      ctx.moveTo(hx - 3.5 * s, hy + 12 * s);
      ctx.quadraticCurveTo(hx, hy + 13.5 * s, hx + 3.5 * s, hy + 12 * s);
      ctx.stroke();

      // Uraeus
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.moveTo(hx, hy - 12 * s);
      ctx.bezierCurveTo(hx - 2 * s, hy - 16 * s, hx + 2 * s, hy - 20 * s, hx, hy - 22 * s);
      ctx.bezierCurveTo(hx + 3 * s, hy - 19 * s, hx + 3 * s, hy - 15 * s, hx + 1 * s, hy - 12 * s);
      ctx.closePath();
      ctx.fill();

      break;
    }
    case "oasis_pool": {
      const time = Date.now() / 1000;
      const oasisSeed = (dec.x || 0) * 14.7;

      // Color palette
      const sandLight = "#E8D4A8";
      const sandMid = "#D4C090";
      const sandDark = "#B8A070";
      const sandWet = "#9A8860";
      const waterDeep = "#1565C0";
      const waterMid = "#1E88E5";
      const waterShallow = "#42A5F5";
      const waterSurface = "#64B5F6";
      const foamWhite = "#E3F2FD";

      // ========== GROUND SHADOW ==========
      const lakeShadowGrad = ctx.createRadialGradient(
        screenPos.x + 3 * s, screenPos.y + 5 * s, 0,
        screenPos.x + 3 * s, screenPos.y + 5 * s, 50 * s
      );
      lakeShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
      lakeShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
      lakeShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = lakeShadowGrad;
      drawOrganicWaterShape(ctx, screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s, 20 * s, oasisSeed - 10, 0.1);
      ctx.fill();

      // ========== OUTER SAND BANK (BEACH) ==========
      // Gradient from dry sand to wet sand
      const sandGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y + 2 * s, 25 * s,
        screenPos.x, screenPos.y + 2 * s, 42 * s
      );
      sandGrad.addColorStop(0, sandWet);
      sandGrad.addColorStop(0.4, sandMid);
      sandGrad.addColorStop(0.8, sandLight);
      sandGrad.addColorStop(1, sandLight);

      // Sand bank 3D edge (thickness illusion) — drawn first so main bank covers top
      ctx.fillStyle = sandDark;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y + 5 * s, 43 * s, 19 * s, oasisSeed + 3, 0.13);
      ctx.fill();

      // Main sand bank with organic edges
      ctx.fillStyle = sandGrad;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y + 1 * s, 43 * s, 19 * s, oasisSeed + 3, 0.13);
      ctx.fill();

      // Sand texture dots
      ctx.fillStyle = "rgba(180, 160, 100, 0.4)";
      for (let i = 0; i < 25; i++) {
        const sandAngle = (i / 25) * Math.PI * 2;
        const sandDist = 32 + Math.sin(i * 7.3) * 8;
        const sandX = screenPos.x + Math.cos(sandAngle) * sandDist * s * 1.1;
        const sandY = screenPos.y + 2 * s + Math.sin(sandAngle) * sandDist * 0.42 * s;
        ctx.beginPath();
        ctx.arc(sandX, sandY, (1 + Math.abs(Math.sin(i * 3.7))) * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== WATER BODY ==========
      // Multi-layered water depth gradient
      const waterGrad = ctx.createRadialGradient(
        screenPos.x - 5 * s, screenPos.y - 2 * s, 0,
        screenPos.x, screenPos.y + 2 * s, 30 * s
      );
      waterGrad.addColorStop(0, waterDeep);
      waterGrad.addColorStop(0.3, waterMid);
      waterGrad.addColorStop(0.7, waterShallow);
      waterGrad.addColorStop(0.9, waterSurface);
      waterGrad.addColorStop(1, "#90CAF9");

      ctx.fillStyle = waterGrad;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y + 2 * s, 30 * s, 13 * s, oasisSeed, 0.14);
      ctx.fill();

      // ========== UNDERWATER CAUSTICS ==========
      // Animated light patterns on the lake bed
      ctx.globalAlpha = 0.15;
      for (let c = 0; c < 8; c++) {
        const causticTime = time * 0.8 + c * 0.9;
        const causticX = screenPos.x + Math.sin(causticTime + c * 2.1) * 18 * s;
        const causticY = screenPos.y + 2 * s + Math.cos(causticTime * 0.7 + c) * 6 * s;
        const causticSize = (4 + Math.sin(causticTime * 1.5) * 2) * s;

        const causticGrad = ctx.createRadialGradient(
          causticX, causticY, 0,
          causticX, causticY, causticSize
        );
        causticGrad.addColorStop(0, "#BBDEFB");
        causticGrad.addColorStop(0.5, "rgba(144, 202, 249, 0.5)");
        causticGrad.addColorStop(1, "rgba(100, 181, 246, 0)");

        ctx.fillStyle = causticGrad;
        ctx.beginPath();
        ctx.ellipse(causticX, causticY, causticSize * 1.5, causticSize * 0.7, c * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // ========== WATER SURFACE EFFECTS ==========
      // Animated ripples
      const rippleCount = 3;
      for (let r = 0; r < rippleCount; r++) {
        const ripplePhase = ((time * 0.4 + r * 1.2) % 3) / 3;
        const rippleAlpha = 0.25 * (1 - ripplePhase);
        const rippleSize = ripplePhase * 20;

        ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha})`;
        ctx.lineWidth = (1.5 - ripplePhase) * s;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x - 8 * s + r * 8 * s,
          screenPos.y + r * 2 * s,
          (5 + rippleSize) * s,
          (2 + rippleSize * 0.4) * s,
          0.1,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Surface shimmer/sparkles
      ctx.fillStyle = foamWhite;
      for (let sp = 0; sp < 12; sp++) {
        const sparkleTime = time * 2 + sp * 0.7;
        const sparkleAlpha = 0.3 + Math.sin(sparkleTime * 3) * 0.3;
        if (sparkleAlpha > 0.35) {
          const spAngle = sp * 0.52 + Math.sin(time * 0.5) * 0.3;
          const spDist = 8 + sp * 1.8;
          const spX = screenPos.x + Math.cos(spAngle) * spDist * s;
          const spY = screenPos.y + 2 * s + Math.sin(spAngle) * spDist * 0.4 * s;

          ctx.globalAlpha = sparkleAlpha;
          ctx.beginPath();
          ctx.arc(spX, spY, (0.8 + Math.sin(sparkleTime) * 0.3) * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // ========== LILY PADS ==========
      const lilyPositions = [
        { x: -15, y: 4, rot: 0.3, size: 1 },
        { x: -10, y: -3, rot: -0.5, size: 0.8 },
        { x: 12, y: 5, rot: 0.8, size: 0.9 },
        { x: 18, y: -1, rot: -0.2, size: 0.7 },
        { x: -5, y: 7, rot: 1.2, size: 0.85 },
      ];

      lilyPositions.forEach((lily, i) => {
        const lilyX = screenPos.x + lily.x * s;
        const lilyY = screenPos.y + lily.y * s;
        const lilySway = Math.sin(time * 0.8 + i * 1.5) * 0.5 * s;
        const lilySize = 5 * lily.size * s;

        // Lily pad shadow
        ctx.fillStyle = "rgba(0, 80, 120, 0.2)";
        ctx.beginPath();
        ctx.ellipse(lilyX + lilySway + 1 * s, lilyY + 1 * s, lilySize * 1.1, lilySize * 0.5, lily.rot, 0, Math.PI * 2);
        ctx.fill();

        // Lily pad
        ctx.fillStyle = "#2E7D32";
        ctx.beginPath();
        ctx.ellipse(lilyX + lilySway, lilyY, lilySize, lilySize * 0.45, lily.rot, 0.15, Math.PI * 2 - 0.15);
        ctx.lineTo(lilyX + lilySway, lilyY);
        ctx.fill();

        // Lily pad highlight
        ctx.fillStyle = "#4CAF50";
        ctx.beginPath();
        ctx.ellipse(lilyX + lilySway - 1 * s, lilyY - 0.5 * s, lilySize * 0.5, lilySize * 0.2, lily.rot + 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Flower on some pads
        if (i % 2 === 0) {
          const flowerX = lilyX + lilySway;
          const flowerY = lilyY - 2 * s;

          // Petals
          ctx.fillStyle = i === 0 ? "#F8BBD9" : "#FFF9C4";
          for (let p = 0; p < 6; p++) {
            const petalAngle = (p / 6) * Math.PI * 2 + time * 0.2;
            const petalX = flowerX + Math.cos(petalAngle) * 2.5 * s;
            const petalY = flowerY + Math.sin(petalAngle) * 1.2 * s;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 2 * s, 1 * s, petalAngle, 0, Math.PI * 2);
            ctx.fill();
          }

          // Flower center
          ctx.fillStyle = "#FFC107";
          ctx.beginPath();
          ctx.arc(flowerX, flowerY, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ========== CATTAILS/REEDS ==========
      const reedPositions = [
        { x: -28, y: 8, count: 3 },
        { x: 28, y: 6, count: 2 },
        { x: -22, y: -8, count: 2 },
        { x: 25, y: -6, count: 2 },
      ];

      reedPositions.forEach((reedGroup, gi) => {
        for (let ri = 0; ri < reedGroup.count; ri++) {
          const reedX = screenPos.x + (reedGroup.x + ri * 3) * s;
          const reedY = screenPos.y + reedGroup.y * s;
          const reedSway = Math.sin(time * 1.2 + gi + ri * 0.5) * 2 * s;
          const reedHeight = (18 + ri * 4) * s;

          // Reed stalk
          ctx.strokeStyle = "#5D4037";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(reedX, reedY);
          ctx.quadraticCurveTo(
            reedX + reedSway * 0.3, reedY - reedHeight * 0.5,
            reedX + reedSway, reedY - reedHeight
          );
          ctx.stroke();

          // Cattail head
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.ellipse(
            reedX + reedSway * 0.85,
            reedY - reedHeight + 4 * s,
            1.8 * s,
            5 * s,
            reedSway * 0.05,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Reed leaves
          ctx.strokeStyle = "#7CB342";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(reedX, reedY - 2 * s);
          ctx.quadraticCurveTo(
            reedX + 6 * s + reedSway * 0.5, reedY - 8 * s,
            reedX + 10 * s + reedSway, reedY - 6 * s
          );
          ctx.stroke();
        }
      });

      // ========== EDGE FOAM/SHORE LINE ==========
      ctx.strokeStyle = "rgba(227, 242, 253, 0.5)";
      ctx.lineWidth = 2 * s;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y + 2 * s, 29 * s, 12.5 * s, oasisSeed + 5, 0.14);
      ctx.stroke();

      // Subtle animated foam at edges
      const foamAlpha = 0.3 + Math.sin(time * 2) * 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${foamAlpha})`;
      for (let f = 0; f < 8; f++) {
        const foamAngle = (f / 8) * Math.PI * 2 + time * 0.15;
        const foamDist = 28 + Math.sin(time * 1.5 + f * 2) * 1.5;
        const foamX = screenPos.x + Math.cos(foamAngle) * foamDist * s;
        const foamY = screenPos.y + 2 * s + Math.sin(foamAngle) * foamDist * 0.43 * s;
        ctx.beginPath();
        ctx.ellipse(foamX, foamY, 2.5 * s, 1 * s, foamAngle + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== SMALL FISH SHADOWS ==========
      ctx.fillStyle = "rgba(0, 60, 100, 0.2)";
      for (let fish = 0; fish < 3; fish++) {
        const fishTime = time * 0.6 + fish * 2.1;
        const fishAngle = fishTime * 0.4;
        const fishDist = 10 + fish * 5;
        const fishX = screenPos.x + Math.cos(fishAngle) * fishDist * s;
        const fishY = screenPos.y + 2 * s + Math.sin(fishAngle) * fishDist * 0.35 * s;

        ctx.beginPath();
        ctx.ellipse(fishX, fishY, 2.5 * s, 1 * s, fishAngle + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        // Fish tail
        ctx.beginPath();
        ctx.moveTo(fishX - Math.cos(fishAngle + Math.PI / 2) * 2.5 * s, fishY - Math.sin(fishAngle + Math.PI / 2) * 1 * s);
        ctx.lineTo(fishX - Math.cos(fishAngle + Math.PI / 2) * 4 * s - Math.sin(fishAngle) * 1.5 * s, fishY - Math.sin(fishAngle + Math.PI / 2) * 1.5 * s);
        ctx.lineTo(fishX - Math.cos(fishAngle + Math.PI / 2) * 4 * s + Math.sin(fishAngle) * 1.5 * s, fishY - Math.sin(fishAngle + Math.PI / 2) * 1.5 * s);
        ctx.closePath();
        ctx.fill();
      }

      break;
    }
    case "carnegie_lake": {
      const time = Date.now() / 1000;
      const cx = screenPos.x;
      const cy = screenPos.y;
      const ISO = 0.866;
      const lakeSeed = (dec.x || 0) * 17.3;

      // === GROUND SHADOW ===
      const clShadow = ctx.createRadialGradient(cx + 3 * s, cy + 10 * s, 0, cx + 3 * s, cy + 10 * s, 70 * s);
      clShadow.addColorStop(0, "rgba(10,30,60,0.30)");
      clShadow.addColorStop(0.5, "rgba(10,30,60,0.12)");
      clShadow.addColorStop(1, "transparent");
      ctx.fillStyle = clShadow;
      drawOrganicWaterShape(ctx, cx + 3 * s, cy + 10 * s, 70 * s, 30 * s, lakeSeed - 10, 0.1);
      ctx.fill();

      // === STONE EMBANKMENT (3D raised shore) ===
      const embankGrad = ctx.createLinearGradient(cx - 55 * s, cy, cx + 55 * s, cy);
      embankGrad.addColorStop(0, "#6a7a5a");
      embankGrad.addColorStop(0.3, "#8a9a70");
      embankGrad.addColorStop(0.7, "#7a8a60");
      embankGrad.addColorStop(1, "#5a6a4a");

      // Stone wall edge (3D depth) — drawn first so embankment covers top
      const wallGrad = ctx.createLinearGradient(cx, cy + 18 * s, cx, cy + 28 * s);
      wallGrad.addColorStop(0, "#4a5a3a");
      wallGrad.addColorStop(0.5, "#3a4a2a");
      wallGrad.addColorStop(1, "#2a3a1a");
      ctx.fillStyle = wallGrad;
      drawOrganicWaterShape(ctx, cx, cy + 6 * s, 56 * s, 24 * s, lakeSeed + 3, 0.11);
      ctx.fill();

      // Main embankment with organic edges
      ctx.fillStyle = embankGrad;
      drawOrganicWaterShape(ctx, cx, cy + 1 * s, 56 * s, 24 * s, lakeSeed + 3, 0.11);
      ctx.fill();

      // Stone texture blocks
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8 * s;
      for (let st = 0; st < 16; st++) {
        const sa = (st / 16) * Math.PI * 2;
        const sd = 44 + Math.sin(st * 3.1) * 6;
        const stx = cx + Math.cos(sa) * sd * s;
        const sty = cy + 4 * s + Math.sin(sa) * sd * 0.42 * s;
        ctx.beginPath();
        ctx.moveTo(stx - 3 * s, sty);
        ctx.lineTo(stx + 3 * s, sty);
        ctx.stroke();
      }

      // Cobblestone path along right shore
      ctx.fillStyle = "#a09070";
      ctx.beginPath();
      ctx.moveTo(cx + 40 * s, cy - 6 * s);
      ctx.bezierCurveTo(cx + 50 * s, cy + 2 * s, cx + 48 * s, cy + 10 * s, cx + 36 * s, cy + 14 * s);
      ctx.bezierCurveTo(cx + 44 * s, cy + 8 * s, cx + 46 * s, cy, cx + 38 * s, cy - 4 * s);
      ctx.fill();
      ctx.fillStyle = "#8a7a60";
      for (let cb = 0; cb < 8; cb++) {
        const cba = cb * 0.28 - 0.3;
        const cbd = 42 + Math.sin(cb * 2.3) * 3;
        const cbx = cx + Math.cos(cba) * cbd * s * 0.9;
        const cby = cy + 3 * s + Math.sin(cba) * cbd * 0.38 * s;
        ctx.beginPath();
        ctx.ellipse(cbx, cby, 2.5 * s, 1.5 * s, cba + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // === ENCHANTED WATER BODY ===
      // Teal/emerald magical water
      const wGrad = ctx.createRadialGradient(cx - 4 * s, cy - 2 * s, 0, cx, cy + 3 * s, 40 * s);
      wGrad.addColorStop(0, "#004d6b");
      wGrad.addColorStop(0.15, "#006080");
      wGrad.addColorStop(0.35, "#00838f");
      wGrad.addColorStop(0.55, "#0097a7");
      wGrad.addColorStop(0.75, "#00acc1");
      wGrad.addColorStop(0.92, "#26c6da");
      wGrad.addColorStop(1, "#4dd0e1");
      ctx.fillStyle = wGrad;
      drawOrganicWaterShape(ctx, cx, cy + 3 * s, 40 * s, 17 * s, lakeSeed, 0.13);
      ctx.fill();

      // Magical glow under water surface
      const glowPulse = 0.15 + Math.sin(time * 1.5) * 0.06;
      const wGlow = ctx.createRadialGradient(cx, cy + 2 * s, 0, cx, cy + 2 * s, 30 * s);
      wGlow.addColorStop(0, `rgba(100,255,220,${glowPulse})`);
      wGlow.addColorStop(0.5, `rgba(80,220,200,${glowPulse * 0.5})`);
      wGlow.addColorStop(1, "transparent");
      ctx.fillStyle = wGlow;
      drawOrganicWaterShape(ctx, cx, cy + 2 * s, 30 * s, 13 * s, lakeSeed + 20, 0.13);
      ctx.fill();

      // Underwater caustics (animated light network)
      ctx.globalAlpha = 0.14;
      for (let c = 0; c < 12; c++) {
        const ct = time * 0.6 + c * 0.7;
        const ccx = cx + Math.sin(ct + c * 1.6) * 28 * s;
        const ccy = cy + 3 * s + Math.cos(ct * 0.5 + c) * 9 * s;
        const ccs = (4 + Math.sin(ct * 1.2) * 2.5) * s;
        const cg = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, ccs);
        cg.addColorStop(0, "#a7ffeb");
        cg.addColorStop(0.4, "rgba(128,255,219,0.5)");
        cg.addColorStop(1, "transparent");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(ccx, ccy, ccs * 1.6, ccs * 0.7, c * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Animated concentric ripples
      for (let r = 0; r < 5; r++) {
        const rp = ((time * 0.3 + r * 0.8) % 3.5) / 3.5;
        const ra = 0.2 * (1 - rp);
        const rs = rp * 28;
        ctx.strokeStyle = `rgba(180,255,240,${ra})`;
        ctx.lineWidth = (2 - rp * 1.2) * s;
        ctx.beginPath();
        ctx.ellipse(cx - 8 * s + r * 5 * s, cy + 2 * s + r * 0.8 * s, (5 + rs) * s, (2 + rs * 0.38) * s, 0.06, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sparkles on water (magical)
      for (let sp = 0; sp < 18; sp++) {
        const st2 = time * 2.5 + sp * 0.55;
        const sa2 = 0.3 + Math.sin(st2 * 3.5) * 0.35;
        if (sa2 > 0.35) {
          const sang2 = sp * 0.4 + Math.sin(time * 0.35) * 0.2;
          const sd2 = 6 + sp * 1.9;
          const spx2 = cx + Math.cos(sang2) * sd2 * s;
          const spy2 = cy + 3 * s + Math.sin(sang2) * sd2 * 0.37 * s;
          ctx.globalAlpha = sa2;
          const sparkCol = sp % 3 === 0 ? "#e0f7fa" : sp % 3 === 1 ? "#b2ebf2" : "#a7ffeb";
          ctx.fillStyle = sparkCol;
          ctx.beginPath();
          ctx.arc(spx2, spy2, (0.8 + Math.sin(st2) * 0.4) * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Shore glow line
      const shoreGlow = 0.35 + Math.sin(time * 1.8) * 0.1;
      ctx.strokeStyle = `rgba(100,255,220,${shoreGlow})`;
      ctx.lineWidth = 2.5 * s;
      drawOrganicWaterShape(ctx, cx, cy + 3 * s, 39 * s, 16.5 * s, lakeSeed + 5, 0.13);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1 * s;
      drawOrganicWaterShape(ctx, cx, cy + 3 * s, 38.5 * s, 16.2 * s, lakeSeed + 5, 0.13);
      ctx.stroke();

      // === BOATHOUSE (right side) - Tudor style ===
      const bhx = cx + 46 * s;
      const bhy = cy - 4 * s;
      const bhW = 14 * s, bhD = 11 * s, bhH = 18 * s;

      // Shadow under building
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(bhx, bhy + bhD + 3 * s, 16 * s, 6 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Stone foundation
      ctx.fillStyle = "#4A3A2A";
      ctx.beginPath();
      ctx.moveTo(bhx - bhW * ISO, bhy + bhD * 0.5 + 2 * s);
      ctx.lineTo(bhx, bhy + bhD + 2 * s);
      ctx.lineTo(bhx + bhW * ISO, bhy + bhD * 0.5 + 2 * s);
      ctx.lineTo(bhx + bhW * ISO, bhy + bhD * 0.5 - 1 * s);
      ctx.lineTo(bhx, bhy + bhD - 1 * s);
      ctx.lineTo(bhx - bhW * ISO, bhy + bhD * 0.5 - 1 * s);
      ctx.closePath();
      ctx.fill();

      // Dock/pier extending into water
      ctx.fillStyle = "#6d5030";
      ctx.beginPath();
      ctx.moveTo(bhx - 10 * s, bhy + 6 * s);
      ctx.lineTo(bhx - 24 * s, bhy + 13 * s);
      ctx.lineTo(bhx - 22 * s, bhy + 15 * s);
      ctx.lineTo(bhx - 8 * s, bhy + 8 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5a4020";
      ctx.beginPath();
      ctx.moveTo(bhx - 22 * s, bhy + 15 * s);
      ctx.lineTo(bhx - 24 * s, bhy + 13 * s);
      ctx.lineTo(bhx - 24 * s, bhy + 15.5 * s);
      ctx.lineTo(bhx - 22 * s, bhy + 17.5 * s);
      ctx.closePath();
      ctx.fill();
      // Dock planks
      ctx.strokeStyle = "rgba(90,64,32,0.4)";
      ctx.lineWidth = 0.7 * s;
      for (let dp = 0; dp < 5; dp++) {
        const dpf = dp / 5;
        const dpx1 = bhx - 10 * s + (bhx - 24 * s - bhx + 10 * s) * dpf;
        const dpy1 = bhy + 6 * s + (bhy + 13 * s - bhy - 6 * s) * dpf;
        ctx.beginPath();
        ctx.moveTo(dpx1, dpy1 + 1 * s);
        ctx.lineTo(dpx1 + 2 * s, dpy1 + 2.5 * s);
        ctx.stroke();
      }
      // Dock posts
      ctx.fillStyle = "#4a3018";
      for (let dp = 0; dp < 3; dp++) {
        const dpx = bhx - 12 * s - dp * 5 * s;
        const dpy = bhy + 8 * s + dp * 2.8 * s;
        ctx.fillRect(dpx - 1 * s, dpy - 4 * s, 2 * s, 6 * s);
        ctx.fillStyle = "#3a2008";
        ctx.beginPath();
        ctx.arc(dpx, dpy - 4 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4a3018";
      }

      // Left wall (shadowed)
      const bwlGrad = ctx.createLinearGradient(bhx - bhW * ISO, bhy, bhx, bhy);
      bwlGrad.addColorStop(0, "#3A2515");
      bwlGrad.addColorStop(0.5, "#4A3020");
      bwlGrad.addColorStop(1, "#3A2515");
      ctx.fillStyle = bwlGrad;
      ctx.beginPath();
      ctx.moveTo(bhx - bhW * ISO, bhy - bhH + bhD * 0.5);
      ctx.lineTo(bhx, bhy - bhH + bhD);
      ctx.lineTo(bhx, bhy + bhD);
      ctx.lineTo(bhx - bhW * ISO, bhy + bhD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Right wall (lit)
      const bwrGrad = ctx.createLinearGradient(bhx, bhy, bhx + bhW * ISO, bhy);
      bwrGrad.addColorStop(0, "#5A3A20");
      bwrGrad.addColorStop(0.5, "#6A4A2A");
      bwrGrad.addColorStop(1, "#5A3A20");
      ctx.fillStyle = bwrGrad;
      ctx.beginPath();
      ctx.moveTo(bhx + bhW * ISO, bhy - bhH + bhD * 0.5);
      ctx.lineTo(bhx, bhy - bhH + bhD);
      ctx.lineTo(bhx, bhy + bhD);
      ctx.lineTo(bhx + bhW * ISO, bhy + bhD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Timber frame details (Tudor cross beams)
      ctx.strokeStyle = "#3a2008";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(bhx + bhW * ISO * 0.5, bhy - bhH * 0.7 + bhD * 0.5);
      ctx.lineTo(bhx + bhW * ISO * 0.5, bhy + bhD * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bhx + bhW * ISO * 0.15, bhy - bhH * 0.35 + bhD * 0.75);
      ctx.lineTo(bhx + bhW * ISO * 0.85, bhy - bhH * 0.35 + bhD * 0.25);
      ctx.stroke();
      // Peaked roof with overhang
      const roofExt = 3 * s;
      ctx.fillStyle = "#4a2a10";
      ctx.beginPath();
      ctx.moveTo(bhx, bhy - bhH - 7 * s);
      ctx.lineTo(bhx - (bhW + roofExt) * ISO, bhy - bhH + bhD * 0.5 + 2 * s);
      ctx.lineTo(bhx, bhy - bhH + bhD + 3 * s);
      ctx.lineTo(bhx + (bhW + roofExt) * ISO, bhy - bhH + bhD * 0.5 + 2 * s);
      ctx.closePath();
      ctx.fill();
      // Roof lit side
      ctx.fillStyle = "#5a3a18";
      ctx.beginPath();
      ctx.moveTo(bhx, bhy - bhH - 7 * s);
      ctx.lineTo(bhx + (bhW + roofExt) * ISO, bhy - bhH + bhD * 0.5 + 2 * s);
      ctx.lineTo(bhx, bhy - bhH + bhD + 3 * s);
      ctx.closePath();
      ctx.fill();
      // Roof ridge highlight
      ctx.strokeStyle = "#6b4a28";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(bhx - 2 * s, bhy - bhH - 6 * s);
      ctx.lineTo(bhx + 2 * s, bhy - bhH - 6 * s);
      ctx.stroke();
      // Chimney
      ctx.fillStyle = "#6a5040";
      ctx.fillRect(bhx + 4 * s, bhy - bhH - 5 * s, 3 * s, 6 * s);
      ctx.fillStyle = "#7a6050";
      ctx.fillRect(bhx + 3.5 * s, bhy - bhH - 6 * s, 4 * s, 1.5 * s);
      // Arched doorway
      ctx.fillStyle = "#1a0a00";
      ctx.beginPath();
      ctx.arc(bhx, bhy + bhD * 0.3, 3 * s, Math.PI, 0);
      ctx.lineTo(bhx + 3 * s, bhy + bhD * 0.3 + 5 * s);
      ctx.lineTo(bhx - 3 * s, bhy + bhD * 0.3 + 5 * s);
      ctx.closePath();
      ctx.fill();
      // Warm light from door
      ctx.fillStyle = "rgba(200,150,70,0.1)";
      ctx.beginPath();
      ctx.arc(bhx, bhy + bhD * 0.3 + 2 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      // Windows with warm glow
      const bhWindows = [
        { x: bhx + 5 * s, y: bhy - bhH + bhD * 0.65 },
        { x: bhx + 8 * s, y: bhy - bhH + bhD * 0.85 },
        { x: bhx - 6 * s, y: bhy - bhH + bhD * 0.7 },
      ];
      for (const w of bhWindows) {
        ctx.fillStyle = "rgba(200,150,70,0.55)";
        ctx.fillRect(w.x - 1.5 * s, w.y - 1.5 * s, 3 * s, 3 * s);
        ctx.fillStyle = "rgba(200,150,70,0.15)";
        ctx.beginPath();
        ctx.arc(w.x, w.y, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3a2008";
        ctx.lineWidth = 0.6 * s;
        ctx.strokeRect(w.x - 1.5 * s, w.y - 1.5 * s, 3 * s, 3 * s);
        ctx.beginPath();
        ctx.moveTo(w.x, w.y - 1.5 * s);
        ctx.lineTo(w.x, w.y + 1.5 * s);
        ctx.stroke();
      }

      // === GRANDSTAND / COLUMNED PAVILION (left side) ===
      const gx = cx - 50 * s;
      const gy = cy - 8 * s;
      const gW = 16 * s, gD = 12 * s, gH = 22 * s;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(gx, gy + gD + 3 * s, 18 * s, 7 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Raised stone platform
      ctx.fillStyle = "#4A3A2A";
      ctx.beginPath();
      ctx.moveTo(gx, gy + gD + 3 * s);
      ctx.lineTo(gx + gW * ISO, gy + gD * 0.5 + 3 * s);
      ctx.lineTo(gx + gW * ISO, gy + gD * 0.5);
      ctx.lineTo(gx, gy + gD);
      ctx.lineTo(gx - gW * ISO, gy + gD * 0.5);
      ctx.lineTo(gx - gW * ISO, gy + gD * 0.5 + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Left wall (dark stone)
      ctx.fillStyle = "#5A4A3A";
      ctx.beginPath();
      ctx.moveTo(gx - gW * ISO, gy - gH + gD * 0.5);
      ctx.lineTo(gx, gy - gH + gD);
      ctx.lineTo(gx, gy + gD);
      ctx.lineTo(gx - gW * ISO, gy + gD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Right wall (lit stone)
      ctx.fillStyle = "#6A5A48";
      ctx.beginPath();
      ctx.moveTo(gx + gW * ISO, gy - gH + gD * 0.5);
      ctx.lineTo(gx, gy - gH + gD);
      ctx.lineTo(gx, gy + gD);
      ctx.lineTo(gx + gW * ISO, gy + gD * 0.5);
      ctx.closePath();
      ctx.fill();

      // Stone columns on right face
      ctx.fillStyle = "#6A5A48";
      for (let p = 0; p < 4; p++) {
        const pf = (p + 0.5) / 4;
        const ppx = gx + gW * ISO * pf;
        const ppy = gy + gD * 0.5 * (1 - pf * 0.8);
        const colH = gH - 4 * s;
        ctx.fillStyle = "#6A5A48";
        ctx.fillRect(ppx - 1.2 * s, ppy - colH, 2.4 * s, colH);
        ctx.fillStyle = "#5A4A38";
        ctx.fillRect(ppx - 2 * s, ppy - colH - 1 * s, 4 * s, 2 * s);
        ctx.fillStyle = "#4A3A2A";
        ctx.fillRect(ppx - 2 * s, ppy - 1 * s, 4 * s, 2 * s);
      }

      // Pediment (triangular top)
      ctx.fillStyle = "#5A4A38";
      ctx.beginPath();
      ctx.moveTo(gx, gy - gH);
      ctx.lineTo(gx + gW * ISO, gy - gH + gD * 0.5);
      ctx.lineTo(gx, gy - gH + gD);
      ctx.lineTo(gx - gW * ISO, gy - gH + gD * 0.5);
      ctx.closePath();
      ctx.fill();
      // Pediment ridge
      ctx.fillStyle = "#4A3A2A";
      ctx.beginPath();
      ctx.moveTo(gx, gy - gH);
      ctx.lineTo(gx - gW * ISO, gy - gH + gD * 0.5);
      ctx.lineTo(gx, gy - gH + gD);
      ctx.closePath();
      ctx.fill();
      // Triangular gable on right face
      ctx.fillStyle = "#5A4A38";
      ctx.beginPath();
      ctx.moveTo(gx + gW * ISO * 0.5, gy - gH - 4 * s + gD * 0.25);
      ctx.lineTo(gx + gW * ISO * 0.05, gy - gH + gD * 0.5);
      ctx.lineTo(gx + gW * ISO * 0.95, gy - gH + gD * 0.25);
      ctx.closePath();
      ctx.fill();
      // Windows
      ctx.fillStyle = "rgba(200,150,70,0.5)";
      for (let w = 0; w < 3; w++) {
        const wy = gy - gH + gD * 0.6 + w * 5.5 * s;
        ctx.beginPath();
        ctx.arc(gx + gW * ISO * 0.5, wy + gD * 0.25, 1.5 * s, Math.PI, 0);
        ctx.lineTo(gx + gW * ISO * 0.5 + 1.5 * s, wy + gD * 0.25 + 3 * s);
        ctx.lineTo(gx + gW * ISO * 0.5 - 1.5 * s, wy + gD * 0.25 + 3 * s);
        ctx.closePath();
        ctx.fill();
      }
      // Entrance arch
      ctx.fillStyle = "#2a1a08";
      ctx.beginPath();
      ctx.arc(gx + gW * ISO * 0.3, gy + gD * 0.3, 3.5 * s, Math.PI, 0);
      ctx.lineTo(gx + gW * ISO * 0.3 + 3.5 * s, gy + gD * 0.3 + 6 * s);
      ctx.lineTo(gx + gW * ISO * 0.3 - 3.5 * s, gy + gD * 0.3 + 6 * s);
      ctx.closePath();
      ctx.fill();

      // === CLOCK TOWER (back-left) ===
      const tx = cx - 32 * s;
      const ty = cy - 18 * s;
      const tW = 7 * s, tH = 28 * s;

      // Tower left wall
      ctx.fillStyle = "#5A4A3A";
      ctx.beginPath();
      ctx.moveTo(tx - tW * ISO, ty - tH + tW * 0.5);
      ctx.lineTo(tx, ty - tH + tW);
      ctx.lineTo(tx, ty + tW);
      ctx.lineTo(tx - tW * ISO, ty + tW * 0.5);
      ctx.closePath();
      ctx.fill();
      // Tower right wall
      ctx.fillStyle = "#6A5A48";
      ctx.beginPath();
      ctx.moveTo(tx + tW * ISO, ty - tH + tW * 0.5);
      ctx.lineTo(tx, ty - tH + tW);
      ctx.lineTo(tx, ty + tW);
      ctx.lineTo(tx + tW * ISO, ty + tW * 0.5);
      ctx.closePath();
      ctx.fill();
      // Tower top face
      ctx.fillStyle = "#7A6A55";
      ctx.beginPath();
      ctx.moveTo(tx, ty - tH);
      ctx.lineTo(tx + tW * ISO, ty - tH + tW * 0.5);
      ctx.lineTo(tx, ty - tH + tW);
      ctx.lineTo(tx - tW * ISO, ty - tH + tW * 0.5);
      ctx.closePath();
      ctx.fill();
      // Pointed spire
      ctx.fillStyle = "#2A1F15";
      ctx.beginPath();
      ctx.moveTo(tx, ty - tH - 14 * s);
      ctx.lineTo(tx - tW * ISO * 0.8, ty - tH + tW * 0.4);
      ctx.lineTo(tx, ty - tH + tW * 0.8);
      ctx.lineTo(tx + tW * ISO * 0.8, ty - tH + tW * 0.4);
      ctx.closePath();
      ctx.fill();
      // Spire lit side
      ctx.fillStyle = "#3A2A1A";
      ctx.beginPath();
      ctx.moveTo(tx, ty - tH - 14 * s);
      ctx.lineTo(tx + tW * ISO * 0.8, ty - tH + tW * 0.4);
      ctx.lineTo(tx, ty - tH + tW * 0.8);
      ctx.closePath();
      ctx.fill();
      // Spire finial
      ctx.fillStyle = "#8A7050";
      ctx.beginPath();
      ctx.arc(tx, ty - tH - 14 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      // Clock face
      ctx.fillStyle = "#8A7A65";
      ctx.beginPath();
      ctx.arc(tx + tW * ISO * 0.5, ty - tH * 0.55, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3A2A1A";
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.arc(tx + tW * ISO * 0.5, ty - tH * 0.55, 3 * s, 0, Math.PI * 2);
      ctx.stroke();
      // Clock hands
      const clockAngle = (time * 0.1) % (Math.PI * 2);
      ctx.strokeStyle = "#1A100A";
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(tx + tW * ISO * 0.5, ty - tH * 0.55);
      ctx.lineTo(tx + tW * ISO * 0.5 + Math.cos(clockAngle) * 2 * s, ty - tH * 0.55 + Math.sin(clockAngle) * 2 * s);
      ctx.stroke();
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(tx + tW * ISO * 0.5, ty - tH * 0.55);
      ctx.lineTo(tx + tW * ISO * 0.5 + Math.cos(clockAngle * 12) * 1.5 * s, ty - tH * 0.55 + Math.sin(clockAngle * 12) * 1.5 * s);
      ctx.stroke();
      // Tower windows
      for (let tw = 0; tw < 3; tw++) {
        const twy = ty - tH + tW + 3 * s + tw * 7 * s;
        ctx.fillStyle = tw === 1 ? "rgba(200,150,70,0.6)" : "rgba(180,130,50,0.35)";
        ctx.fillRect(tx + tW * ISO * 0.3, twy, 2.5 * s, 3 * s);
        if (tw === 1) {
          ctx.fillStyle = "rgba(200,150,70,0.15)";
          ctx.beginPath();
          ctx.arc(tx + tW * ISO * 0.3 + 1.25 * s, twy + 1.5 * s, 4 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === ROWBOAT bobbing ===
      const boatBob = Math.sin(time * 1.1) * 1.5 * s;
      const boatRot = Math.sin(time * 0.8) * 0.05;
      const boatX = cx + 10 * s;
      const boatY = cy + 6 * s + boatBob;
      ctx.save();
      ctx.translate(boatX, boatY);
      ctx.rotate(boatRot);
      ctx.fillStyle = "#5a3a18";
      ctx.beginPath();
      ctx.ellipse(0, 0, 7 * s, 3 * s, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6d4c2a";
      ctx.beginPath();
      ctx.ellipse(0, -0.5 * s, 6 * s, 2.5 * s, 0.12, Math.PI, 0);
      ctx.fill();
      // Gunwale
      ctx.strokeStyle = "#8b7355";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.ellipse(0, -0.5 * s, 6.5 * s, 2.7 * s, 0.12, Math.PI + 0.3, -0.3);
      ctx.stroke();
      // Seat
      ctx.fillStyle = "#7a5a30";
      ctx.fillRect(-2 * s, -0.5 * s, 4 * s, 1 * s);
      // Oars
      ctx.strokeStyle = "#a08060";
      ctx.lineWidth = 0.8 * s;
      const oarSway = Math.sin(time * 1.5) * 0.15;
      ctx.beginPath();
      ctx.moveTo(-2 * s, 0);
      ctx.lineTo(-10 * s, 5 * s + Math.sin(time * 1.5) * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2 * s, 0);
      ctx.lineTo(10 * s, 5 * s - Math.sin(time * 1.5) * s);
      ctx.stroke();
      ctx.fillStyle = "#a08060";
      ctx.beginPath();
      ctx.ellipse(-10 * s, 5 * s + Math.sin(time * 1.5) * s, 2 * s, 1 * s, 0.5 + oarSway, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(10 * s, 5 * s - Math.sin(time * 1.5) * s, 2 * s, 1 * s, -0.5 - oarSway, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // === LILY PADS ===
      const clLilies = [
        { x: -22, y: 7, rot: 0.3, sz: 1.1 },
        { x: -14, y: -1, rot: -0.4, sz: 0.85 },
        { x: 22, y: 8, rot: 0.7, sz: 0.9 },
        { x: -7, y: 10, rot: 1.1, sz: 0.95 },
        { x: 28, y: 2, rot: -0.2, sz: 0.7 },
      ];
      for (let li = 0; li < clLilies.length; li++) {
        const lil = clLilies[li];
        const lx = cx + lil.x * s;
        const ly = cy + lil.y * s + Math.sin(time * 0.7 + li * 1.3) * 0.5 * s;
        const lsz = 5 * lil.sz * s;
        ctx.fillStyle = "rgba(0,80,100,0.15)";
        ctx.beginPath();
        ctx.ellipse(lx + 1 * s, ly + 1 * s, lsz * 1.1, lsz * 0.5, lil.rot, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1A3A18";
        ctx.beginPath();
        ctx.ellipse(lx, ly, lsz, lsz * 0.45, lil.rot, 0.15, Math.PI * 2 - 0.15);
        ctx.lineTo(lx, ly);
        ctx.fill();
        ctx.fillStyle = "#2A4A22";
        ctx.beginPath();
        ctx.ellipse(lx - 1 * s, ly - 0.5 * s, lsz * 0.45, lsz * 0.18, lil.rot + 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Flowers on every other lily pad
        if (li % 2 === 0) {
          const flx = lx;
          const fly = ly - 2.5 * s;
          const petalColors = ["#6A4A50", "#5A4060", "#7A6A40"];
          ctx.fillStyle = petalColors[li % petalColors.length];
          for (let p = 0; p < 6; p++) {
            const pa = (p / 6) * Math.PI * 2 + time * 0.15;
            ctx.beginPath();
            ctx.ellipse(flx + Math.cos(pa) * 2.2 * s, fly + Math.sin(pa) * 1.1 * s, 2 * s, 1 * s, pa, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#8A7040";
          ctx.beginPath();
          ctx.arc(flx, fly, 1.3 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === TREES along far shore (3D isometric style) ===
      const treePosArr = [
        { x: -24, y: -16, sz: 0.8, hue: 0 },
        { x: -12, y: -18, sz: 0.65, hue: 1 },
        { x: 4, y: -17, sz: 0.9, hue: 0 },
        { x: 18, y: -15, sz: 0.7, hue: 2 },
        { x: 32, y: -12, sz: 0.6, hue: 1 },
      ];
      const treeColors = [
        { trunk: "#3A2A1A", canopy: "#1A3518", light: "#2A4520" },
        { trunk: "#2A1A10", canopy: "#152A15", light: "#203520" },
        { trunk: "#4A3525", canopy: "#1A3018", light: "#2A3A22" },
      ];
      for (const tp of treePosArr) {
        const ttx = cx + tp.x * s;
        const tty = cy + tp.y * s;
        const tts = tp.sz;
        const tc = treeColors[tp.hue];
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.beginPath();
        ctx.ellipse(ttx + 2 * s * tts, tty + 2 * s * tts, 5 * s * tts, 2 * s * tts, 0, 0, Math.PI * 2);
        ctx.fill();
        // Trunk (isometric)
        ctx.fillStyle = tc.trunk;
        ctx.beginPath();
        ctx.moveTo(ttx - 1.5 * s * tts, tty);
        ctx.lineTo(ttx - 1 * s * tts, tty - 10 * s * tts);
        ctx.lineTo(ttx + 1 * s * tts, tty - 10 * s * tts);
        ctx.lineTo(ttx + 1.5 * s * tts, tty);
        ctx.closePath();
        ctx.fill();
        // Main canopy (layered spheres for 3D look)
        ctx.fillStyle = tc.canopy;
        ctx.beginPath();
        ctx.arc(ttx, tty - 12 * s * tts, 6 * s * tts, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = tc.light;
        ctx.beginPath();
        ctx.arc(ttx + 2 * s * tts, tty - 14 * s * tts, 4 * s * tts, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = tc.canopy;
        ctx.beginPath();
        ctx.arc(ttx - 3 * s * tts, tty - 11 * s * tts, 4 * s * tts, 0, Math.PI * 2);
        ctx.fill();
      }

      // === FISH SHADOWS ===
      ctx.fillStyle = "rgba(0,60,80,0.15)";
      for (let f = 0; f < 4; f++) {
        const ft = time * 0.45 + f * 1.7;
        const fa = ft * 0.3;
        const fd = 10 + f * 7;
        const fx = cx + Math.cos(fa) * fd * s;
        const fy = cy + 3 * s + Math.sin(fa) * fd * 0.32 * s;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 2.5 * s, 1 * s, fa + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fx - Math.cos(fa + Math.PI / 2) * 2.5 * s, fy - Math.sin(fa + Math.PI / 2) * 1 * s);
        ctx.lineTo(fx - Math.cos(fa + Math.PI / 2) * 4 * s - Math.sin(fa) * 1.5 * s, fy - Math.sin(fa + Math.PI / 2) * 1.5 * s);
        ctx.lineTo(fx - Math.cos(fa + Math.PI / 2) * 4 * s + Math.sin(fa) * 1.5 * s, fy - Math.sin(fa + Math.PI / 2) * 1.5 * s);
        ctx.closePath();
        ctx.fill();
      }

      // === MAGICAL FIREFLIES ===
      for (let ff = 0; ff < 6; ff++) {
        const ffPhase = time * 1.2 + ff * 1.1;
        const ffAlpha = 0.4 + Math.sin(ffPhase * 3) * 0.35;
        if (ffAlpha > 0.3) {
          const ffx = cx + Math.sin(ffPhase * 0.7 + ff * 2) * 45 * s;
          const ffy = cy - 10 * s + Math.cos(ffPhase * 0.5 + ff) * 15 * s;
          ctx.globalAlpha = ffAlpha;
          const ffGlow = ctx.createRadialGradient(ffx, ffy, 0, ffx, ffy, 3 * s);
          ffGlow.addColorStop(0, "rgba(200,160,80,0.7)");
          ffGlow.addColorStop(0.4, "rgba(180,140,60,0.2)");
          ffGlow.addColorStop(1, "transparent");
          ctx.fillStyle = ffGlow;
          ctx.beginPath();
          ctx.arc(ffx, ffy, 3 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(220,180,100,0.8)";
          ctx.beginPath();
          ctx.arc(ffx, ffy, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      break;
    }

    case "sarcophagus": {
      const sarcStone = "#c8b080";
      const sarcDark = "#8a7050";
      const sarcGold = "#d4a840";
      const sarcGoldDark = "#a08030";

      // Shadow
      const sarcShadow = ctx.createRadialGradient(screenPos.x + 4 * s, screenPos.y + 6 * s, 0, screenPos.x + 4 * s, screenPos.y + 6 * s, 25 * s);
      sarcShadow.addColorStop(0, "rgba(0,0,0,0.3)");
      sarcShadow.addColorStop(1, "transparent");
      ctx.fillStyle = sarcShadow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 6 * s, 25 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base - isometric box
      const bw = 12 * s, bd = 20 * s, bh = 8 * s;
      // Top face
      ctx.fillStyle = sarcStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - bh);
      ctx.lineTo(screenPos.x + bw, screenPos.y - bh + bw * 0.5);
      ctx.lineTo(screenPos.x, screenPos.y - bh + bw);
      ctx.lineTo(screenPos.x - bw, screenPos.y - bh + bw * 0.5);
      ctx.closePath();
      ctx.fill();
      // Left face
      ctx.fillStyle = sarcDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - bw, screenPos.y - bh + bw * 0.5);
      ctx.lineTo(screenPos.x, screenPos.y - bh + bw);
      ctx.lineTo(screenPos.x, screenPos.y + bw);
      ctx.lineTo(screenPos.x - bw, screenPos.y + bw * 0.5);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = "#a89060";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + bw, screenPos.y - bh + bw * 0.5);
      ctx.lineTo(screenPos.x, screenPos.y - bh + bw);
      ctx.lineTo(screenPos.x, screenPos.y + bw);
      ctx.lineTo(screenPos.x + bw, screenPos.y + bw * 0.5);
      ctx.closePath();
      ctx.fill();

      // Lid - slightly raised trapezoid
      const lh = 28 * s;
      ctx.fillStyle = sarcDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - bw * 0.8, screenPos.y - bh + bw * 0.4);
      ctx.lineTo(screenPos.x, screenPos.y - bh);
      ctx.lineTo(screenPos.x, screenPos.y - lh);
      ctx.lineTo(screenPos.x - bw * 0.6, screenPos.y - lh + 3 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = sarcStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + bw * 0.8, screenPos.y - bh + bw * 0.4);
      ctx.lineTo(screenPos.x, screenPos.y - bh);
      ctx.lineTo(screenPos.x, screenPos.y - lh);
      ctx.lineTo(screenPos.x + bw * 0.6, screenPos.y - lh + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Face mask on lid
      ctx.fillStyle = sarcGold;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - lh + 8 * s, 5 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 2 * s, screenPos.y - lh + 7 * s, 1.2 * s, 0.8 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(screenPos.x + 2 * s, screenPos.y - lh + 7 * s, 1.2 * s, 0.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gold trim bands
      ctx.fillStyle = sarcGoldDark;
      ctx.fillRect(screenPos.x - bw * 0.7, screenPos.y - 18 * s, bw * 1.4, 2 * s);
      ctx.fillRect(screenPos.x - bw * 0.6, screenPos.y - 12 * s, bw * 1.2, 1.5 * s);

      // Hieroglyph details on right face
      ctx.fillStyle = "rgba(90,70,40,0.4)";
      for (let g = 0; g < 3; g++) {
        const gy = screenPos.y + 2 * s + g * 4 * s;
        ctx.fillRect(screenPos.x + 3 * s, gy, 6 * s, 1.5 * s);
      }
      break;
    }

    case "cobra_statue": {
      const cobraStone = "#a09070";
      const cobraDark = "#706040";
      const cobraGold = "#c8a030";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 5 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal
      ctx.fillStyle = cobraDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = cobraStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Cobra body coil
      ctx.fillStyle = cobraStone;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 5 * s, 8 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = cobraDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 1 * s, screenPos.y - 4 * s, 6 * s, 4 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cobra neck rising up
      ctx.fillStyle = cobraStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 8 * s);
      ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 30 * s, screenPos.x, screenPos.y - 42 * s);
      ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y - 30 * s, screenPos.x + 4 * s, screenPos.y - 8 * s);
      ctx.closePath();
      ctx.fill();

      // Hood spread
      ctx.fillStyle = cobraDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 42 * s);
      ctx.quadraticCurveTo(screenPos.x - 12 * s, screenPos.y - 38 * s, screenPos.x - 10 * s, screenPos.y - 28 * s);
      ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 25 * s, screenPos.x, screenPos.y - 28 * s);
      ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y - 25 * s, screenPos.x + 10 * s, screenPos.y - 28 * s);
      ctx.quadraticCurveTo(screenPos.x + 12 * s, screenPos.y - 38 * s, screenPos.x, screenPos.y - 42 * s);
      ctx.closePath();
      ctx.fill();

      // Hood pattern
      ctx.fillStyle = cobraGold;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 32 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 32 * s);
      ctx.closePath();
      ctx.fill();

      // Eyes (gem-like)
      ctx.fillStyle = "#e53935";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 38 * s, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 38 * s, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eye glow
      ctx.fillStyle = `rgba(229,57,53,${0.4 + Math.sin(decorTime * 3) * 0.2})`;
      ctx.beginPath();
      ctx.arc(screenPos.x - 3 * s, screenPos.y - 38 * s, 3 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 3 * s, screenPos.y - 38 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "hieroglyph_wall": {
      const wallSand = "#c8b080";
      const wallDark = "#9a8058";
      const wallLight = "#dac8a0";
      const glyphCol = "#6a5838";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 8 * s, 26 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wall back face
      ctx.fillStyle = wallDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Wall front face
      ctx.fillStyle = wallSand;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y + 4 * s);
      ctx.lineTo(screenPos.x - 20 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x - 20 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Wall main face
      ctx.fillStyle = wallLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Hieroglyphs - row of symbols
      ctx.fillStyle = glyphCol;
      const glyphs = [
        { dx: -14, dy: -28, type: 0 }, { dx: -6, dy: -28, type: 1 }, { dx: 2, dy: -28, type: 2 }, { dx: 10, dy: -28, type: 0 },
        { dx: -14, dy: -20, type: 2 }, { dx: -6, dy: -20, type: 0 }, { dx: 2, dy: -20, type: 1 }, { dx: 10, dy: -20, type: 2 },
        { dx: -14, dy: -12, type: 1 }, { dx: -6, dy: -12, type: 2 }, { dx: 2, dy: -12, type: 0 }, { dx: 10, dy: -12, type: 1 },
      ];
      glyphs.forEach(g => {
        const gx = screenPos.x + g.dx * s;
        const gy = screenPos.y + g.dy * s;
        if (g.type === 0) {
          // Eye of Horus
          ctx.beginPath();
          ctx.ellipse(gx + 2 * s, gy, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(gx + 2 * s, gy, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        } else if (g.type === 1) {
          // Ankh
          ctx.beginPath();
          ctx.ellipse(gx + 2 * s, gy - 1 * s, 1.5 * s, 1 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(gx + 1.5 * s, gy, 1 * s, 3 * s);
          ctx.fillRect(gx + 0.5 * s, gy + 1 * s, 3 * s, 0.8 * s);
        } else {
          // Bird figure
          ctx.beginPath();
          ctx.moveTo(gx, gy + 2 * s);
          ctx.lineTo(gx + 2 * s, gy - 1 * s);
          ctx.lineTo(gx + 4 * s, gy);
          ctx.lineTo(gx + 3 * s, gy + 2 * s);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Broken top edge
      ctx.fillStyle = wallSand;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 37 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 36 * s);
      ctx.closePath();
      ctx.fill();

      // Sand accumulation at base
      ctx.fillStyle = "#d8c498";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 18 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "pottery": {
      const potBase = "#c08050";
      const potDark = "#8a5830";
      const potLight = "#d8a070";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Large intact pot - back
      ctx.fillStyle = potDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 6 * s, screenPos.y);
      ctx.quadraticCurveTo(screenPos.x - 8 * s, screenPos.y - 10 * s, screenPos.x - 5 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 18 * s);
      ctx.quadraticCurveTo(screenPos.x + 8 * s, screenPos.y - 10 * s, screenPos.x + 6 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();
      // Front highlight
      ctx.fillStyle = potBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y);
      ctx.quadraticCurveTo(screenPos.x - 7 * s, screenPos.y - 10 * s, screenPos.x - 4 * s, screenPos.y - 17 * s);
      ctx.lineTo(screenPos.x + 1 * s, screenPos.y - 17 * s);
      ctx.quadraticCurveTo(screenPos.x - 1 * s, screenPos.y - 10 * s, screenPos.x - 1 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();
      // Rim
      ctx.fillStyle = potLight;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 18 * s, 5 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pattern band
      ctx.strokeStyle = potDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 7.5 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Broken pot shards
      ctx.fillStyle = potBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 14 * s, screenPos.y - 3 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = potDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 12 * s, screenPos.y + 1 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 6 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Small pot
      ctx.fillStyle = potLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y + 2 * s);
      ctx.quadraticCurveTo(screenPos.x - 14 * s, screenPos.y - 4 * s, screenPos.x - 11 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 8 * s);
      ctx.quadraticCurveTo(screenPos.x - 6 * s, screenPos.y - 4 * s, screenPos.x - 8 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = potDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 9.5 * s, screenPos.y - 8 * s, 2.5 * s, 1 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "sand_pile": {
      const sandLight = "#e8d8b0";
      const sandMid = "#d8c898";
      const sandDark = "#c0a878";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 5 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main dune shape (isometric mound)
      const duneGrad = ctx.createRadialGradient(screenPos.x - 5 * s, screenPos.y - 8 * s, 0, screenPos.x, screenPos.y, 22 * s);
      duneGrad.addColorStop(0, sandLight);
      duneGrad.addColorStop(0.5, sandMid);
      duneGrad.addColorStop(1, sandDark);
      ctx.fillStyle = duneGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y + 3 * s);
      ctx.quadraticCurveTo(screenPos.x - 15 * s, screenPos.y - 12 * s, screenPos.x - 3 * s, screenPos.y - 15 * s);
      ctx.quadraticCurveTo(screenPos.x + 10 * s, screenPos.y - 12 * s, screenPos.x + 18 * s, screenPos.y + 3 * s);
      ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y + 6 * s, screenPos.x - 10 * s, screenPos.y + 5 * s);
      ctx.closePath();
      ctx.fill();

      // Wind ripple lines
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 0.8 * s;
      for (let r = 0; r < 4; r++) {
        const ry = screenPos.y - 4 * s + r * 3 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 14 * s + r * 3 * s, ry);
        ctx.quadraticCurveTo(screenPos.x - 2 * s, ry - 2 * s, screenPos.x + 12 * s - r * 2 * s, ry + 1 * s);
        ctx.stroke();
      }

      // Shadow on lee side
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 8 * s);
      ctx.quadraticCurveTo(screenPos.x + 15 * s, screenPos.y - 4 * s, screenPos.x + 18 * s, screenPos.y + 3 * s);
      ctx.quadraticCurveTo(screenPos.x + 10 * s, screenPos.y + 2 * s, screenPos.x + 5 * s, screenPos.y - 8 * s);
      ctx.fill();
      break;
    }

    case "treasure_chest": {
      const chestWood = "#6b4226";
      const chestWoodDark = "#4a2a16";
      const chestGold = "#d4a840";
      const chestMetal = "#8a8a70";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sand around half-buried chest
      ctx.fillStyle = "#d8c898";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chest body - left face
      ctx.fillStyle = chestWoodDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 6 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 4 * s);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = chestWood;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 6 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 4 * s);
      ctx.closePath();
      ctx.fill();

      // Lid (open at angle)
      ctx.fillStyle = chestWood;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 16 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 10 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = chestWoodDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 10 * s);
      ctx.closePath();
      ctx.fill();

      // Metal bands
      ctx.fillStyle = chestMetal;
      ctx.fillRect(screenPos.x - 9 * s, screenPos.y - 8 * s, 2 * s, 8 * s);
      ctx.fillRect(screenPos.x + 7 * s, screenPos.y - 8 * s, 2 * s, 8 * s);

      // Gold glow from inside
      const goldGlow = ctx.createRadialGradient(screenPos.x, screenPos.y - 10 * s, 0, screenPos.x, screenPos.y - 10 * s, 10 * s);
      const glowPulse = 0.4 + Math.sin(decorTime * 2) * 0.15;
      goldGlow.addColorStop(0, `rgba(255,200,50,${glowPulse})`);
      goldGlow.addColorStop(1, "transparent");
      ctx.fillStyle = goldGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 10 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gold coins visible
      ctx.fillStyle = chestGold;
      ctx.beginPath();
      ctx.arc(screenPos.x - 2 * s, screenPos.y - 8 * s, 2 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 3 * s, screenPos.y - 9 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x, screenPos.y - 11 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Lock
      ctx.fillStyle = chestMetal;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 5 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a40";
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 5 * s, 1 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // === WINTER DECORATIONS ===
    case "pine": {
      // Enhanced 3D isometric snow-covered pine tree
      const pineGreen = ["#1a4a3a", "#2a5a4a", "#3a6a5a", "#4a7a6a"];
      const pineDark = "#0a2a1a";
      const trunkColor = "#4a3728";
      const trunkDark = "#2a1708";
      const snowWhite = "#f8f9fa";
      const snowBlue = "#e3f2fd";

      // Ground shadow with gradient
      const pineShadowGrad = ctx.createRadialGradient(
        screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
        screenPos.x + 5 * s, screenPos.y + 10 * s, 25 * s
      );
      pineShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
      pineShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
      pineShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pineShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow mound at base
      ctx.fillStyle = snowBlue;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = snowWhite;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 2 * s, screenPos.y + 3 * s, 8 * s, 3 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Trunk with 3D faces
      ctx.fillStyle = trunkDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = trunkColor;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Pine layers with 3D depth and snow
      const pineLayers = [
        { y: -8, w: 26, h: 20 },
        { y: -24, w: 22, h: 18 },
        { y: -38, w: 18, h: 16 },
        { y: -50, w: 12, h: 14 },
      ];

      pineLayers.forEach((layer, idx) => {
        const layerY = screenPos.y + layer.y * s;
        const layerW = layer.w * s;
        const layerH = layer.h * s;

        // Back shadow layer
        ctx.fillStyle = pineDark;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - layerW * 0.9, layerY + 2 * s);
        ctx.lineTo(screenPos.x, layerY - layerH + 2 * s);
        ctx.lineTo(screenPos.x + layerW * 0.9, layerY + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Left face (darker)
        ctx.fillStyle = pineGreen[0];
        ctx.beginPath();
        ctx.moveTo(screenPos.x - layerW, layerY);
        ctx.lineTo(screenPos.x, layerY - layerH);
        ctx.lineTo(screenPos.x, layerY + 5 * s);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        ctx.fillStyle = pineGreen[1 + idx % 2];
        ctx.beginPath();
        ctx.moveTo(screenPos.x + layerW, layerY);
        ctx.lineTo(screenPos.x, layerY - layerH);
        ctx.lineTo(screenPos.x, layerY + 5 * s);
        ctx.closePath();
        ctx.fill();

        // Snow cap on layer (gradient)
        const snowGrad = ctx.createLinearGradient(
          screenPos.x - layerW * 0.6, layerY - layerH * 0.3,
          screenPos.x + layerW * 0.3, layerY - layerH * 0.1
        );
        snowGrad.addColorStop(0, snowWhite);
        snowGrad.addColorStop(0.7, snowBlue);
        snowGrad.addColorStop(1, "rgba(227,242,253,0.5)");
        ctx.fillStyle = snowGrad;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - layerW * 0.7, layerY - layerH * 0.2);
        ctx.quadraticCurveTo(screenPos.x - layerW * 0.3, layerY - layerH * 0.5, screenPos.x, layerY - layerH);
        ctx.quadraticCurveTo(screenPos.x + layerW * 0.3, layerY - layerH * 0.6, screenPos.x + layerW * 0.5, layerY - layerH * 0.3);
        ctx.quadraticCurveTo(screenPos.x + layerW * 0.2, layerY - layerH * 0.15, screenPos.x - layerW * 0.2, layerY - layerH * 0.1);
        ctx.closePath();
        ctx.fill();

        // Snow clumps hanging from branches
        if (idx < 3) {
          ctx.fillStyle = snowWhite;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - layerW * 0.6, layerY + 2 * s, 4 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(screenPos.x + layerW * 0.5, layerY + 1 * s, 3.5 * s, 2 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Top star/point highlight
      ctx.fillStyle = snowWhite;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 62 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle effect on snow
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      const sparkles = [
        { x: -8, y: -15 }, { x: 10, y: -30 }, { x: -5, y: -45 }, { x: 6, y: -55 }
      ];
      sparkles.forEach((sp) => {
        ctx.beginPath();
        ctx.arc(screenPos.x + sp.x * s, screenPos.y + sp.y * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case "snowman": {
      // Enhanced 3D isometric snowman with detailed features
      const snowBase = "#f5f5f5";
      const snowShade = "#e0e0e0";
      const snowHighlight = "#ffffff";
      const snowBlueShade = "#e3f2fd";

      // Ground shadow with gradient
      const snowmanShadowGrad = ctx.createRadialGradient(
        screenPos.x + 4 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s
      );
      snowmanShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
      snowmanShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
      snowmanShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = snowmanShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bottom ball with 3D shading
      const bottomGrad = ctx.createRadialGradient(
        screenPos.x - 5 * s, screenPos.y - 10 * s, 0,
        screenPos.x, screenPos.y - 5 * s, 18 * s
      );
      bottomGrad.addColorStop(0, snowHighlight);
      bottomGrad.addColorStop(0.4, snowBase);
      bottomGrad.addColorStop(0.8, snowShade);
      bottomGrad.addColorStop(1, snowBlueShade);
      ctx.fillStyle = bottomGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 5 * s, 16 * s, 0, Math.PI * 2);
      ctx.fill();

      // Bottom ball shadow curve
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 5 * s, 15 * s, 0.3, Math.PI - 0.3);
      ctx.stroke();

      // Middle ball with 3D shading
      const middleGrad = ctx.createRadialGradient(
        screenPos.x - 4 * s, screenPos.y - 26 * s, 0,
        screenPos.x, screenPos.y - 22 * s, 13 * s
      );
      middleGrad.addColorStop(0, snowHighlight);
      middleGrad.addColorStop(0.4, snowBase);
      middleGrad.addColorStop(0.85, snowShade);
      middleGrad.addColorStop(1, snowBlueShade);
      ctx.fillStyle = middleGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 22 * s, 12 * s, 0, Math.PI * 2);
      ctx.fill();

      // Buttons on middle ball
      ctx.fillStyle = "#37474f";
      for (let btn = 0; btn < 3; btn++) {
        ctx.beginPath();
        ctx.arc(screenPos.x + 2 * s, screenPos.y - 16 * s - btn * 6 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stick arms
      ctx.strokeStyle = "#5d4037";
      ctx.lineWidth = 2.5 * s;
      // Left arm
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 28 * s);
      ctx.stroke();
      // Left arm twigs
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 26 * s);
      ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 32 * s);
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 27 * s);
      ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 25 * s);
      ctx.stroke();
      // Right arm
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 18 * s);
      ctx.stroke();
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 17 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 14 * s);
      ctx.moveTo(screenPos.x + 19 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 24 * s, screenPos.y - 20 * s);
      ctx.stroke();

      // Head with 3D shading
      const headGrad = ctx.createRadialGradient(
        screenPos.x - 3 * s, screenPos.y - 42 * s, 0,
        screenPos.x, screenPos.y - 38 * s, 10 * s
      );
      headGrad.addColorStop(0, snowHighlight);
      headGrad.addColorStop(0.4, snowBase);
      headGrad.addColorStop(0.85, snowShade);
      headGrad.addColorStop(1, snowBlueShade);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 38 * s, 9 * s, 0, Math.PI * 2);
      ctx.fill();

      // Top hat
      ctx.fillStyle = "#1a1a1a";
      // Hat brim
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 46 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hat top
      ctx.fillRect(screenPos.x - 6 * s, screenPos.y - 62 * s, 12 * s, 16 * s);
      // Hat rim edge
      ctx.fillStyle = "#37474f";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 62 * s, 6 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hat band
      ctx.fillStyle = "#c62828";
      ctx.fillRect(screenPos.x - 6 * s, screenPos.y - 54 * s, 12 * s, 3 * s);

      // Eyes (coal)
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 40 * s, 2 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 40 * s, 2 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlights
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(screenPos.x - 3.5 * s, screenPos.y - 41 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(screenPos.x + 2.5 * s, screenPos.y - 41 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();

      // Carrot nose with gradient
      const noseGrad = ctx.createLinearGradient(
        screenPos.x, screenPos.y - 38 * s, screenPos.x + 10 * s, screenPos.y - 36 * s
      );
      noseGrad.addColorStop(0, "#ff8c00");
      noseGrad.addColorStop(0.5, "#ff6b00");
      noseGrad.addColorStop(1, "#e65100");
      ctx.fillStyle = noseGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 39 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 33 * s);
      ctx.closePath();
      ctx.fill();
      // Nose highlight
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 1 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 37 * s);
      ctx.lineTo(screenPos.x + 1 * s, screenPos.y - 36 * s);
      ctx.closePath();
      ctx.fill();

      // Smile (coal pieces)
      ctx.fillStyle = "#37474f";
      for (let i = 0; i < 5; i++) {
        const smileAngle = Math.PI * 0.15 + (i / 4) * Math.PI * 0.3;
        const smileX = screenPos.x + Math.cos(smileAngle) * 5 * s;
        const smileY = screenPos.y - 34 * s + Math.sin(smileAngle) * 3 * s;
        ctx.beginPath();
        ctx.arc(smileX, smileY, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scarf
      ctx.fillStyle = "#c62828";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 30 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Scarf tail
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 6 * s, screenPos.y - 30 * s);
      ctx.quadraticCurveTo(screenPos.x + 12 * s, screenPos.y - 28 * s, screenPos.x + 10 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 21 * s);
      ctx.quadraticCurveTo(screenPos.x + 8 * s, screenPos.y - 27 * s, screenPos.x + 4 * s, screenPos.y - 29 * s);
      ctx.closePath();
      ctx.fill();
      // Scarf stripes
      ctx.fillStyle = "#ffeb3b";
      ctx.fillRect(screenPos.x - 8 * s, screenPos.y - 31 * s, 2 * s, 3 * s);
      ctx.fillRect(screenPos.x + 6 * s, screenPos.y - 31 * s, 2 * s, 3 * s);
      break;
    }
    case "ice_crystal": {
      // Enhanced 3D isometric ice crystal formation
      const crystalLight = "#e3f2fd";
      const crystalMid = "#90caf9";
      const crystalDark = "#42a5f5";
      const crystalDeep = "#1976d2";
      const crystalGlow = "#bbdefb";

      // Ground glow/reflection
      const crystalGlowGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y + 3 * s, 0,
        screenPos.x, screenPos.y + 3 * s, 25 * s
      );
      crystalGlowGrad.addColorStop(0, "rgba(144,202,249,0.35)");
      crystalGlowGrad.addColorStop(0.5, "rgba(144,202,249,0.15)");
      crystalGlowGrad.addColorStop(1, "rgba(144,202,249,0)");
      ctx.fillStyle = crystalGlowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ice base mound
      ctx.fillStyle = crystalGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main crystal spires - 3D faceted shapes
      const spires = [
        { x: 0, y: 0, h: 35, w: 8, angle: 0 },
        { x: -8, y: 2, h: 22, w: 5, angle: -0.15 },
        { x: 10, y: 1, h: 25, w: 6, angle: 0.12 },
        { x: -4, y: 3, h: 18, w: 4, angle: -0.08 },
        { x: 6, y: 3, h: 16, w: 4, angle: 0.2 },
        { x: -12, y: 4, h: 14, w: 3, angle: -0.25 },
      ];

      // Sort by y position for proper layering (back to front)
      spires.sort((a, b) => a.y - b.y);

      spires.forEach((spire, idx) => {
        const sx = screenPos.x + spire.x * s;
        const sy = screenPos.y + spire.y * s;
        const sh = spire.h * s;
        const sw = spire.w * s;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(spire.angle);

        // Back face (darkest)
        ctx.fillStyle = crystalDeep;
        ctx.beginPath();
        ctx.moveTo(-sw * 0.3, 0);
        ctx.lineTo(0, -sh);
        ctx.lineTo(sw * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        // Left face
        const leftGrad = ctx.createLinearGradient(-sw, 0, 0, -sh * 0.5);
        leftGrad.addColorStop(0, crystalDark);
        leftGrad.addColorStop(0.5, crystalMid);
        leftGrad.addColorStop(1, crystalLight);
        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.moveTo(-sw, 0);
        ctx.lineTo(-sw * 0.3, -sh * 0.15);
        ctx.lineTo(0, -sh);
        ctx.lineTo(-sw * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        // Right face
        const rightGrad = ctx.createLinearGradient(0, -sh, sw, 0);
        rightGrad.addColorStop(0, crystalLight);
        rightGrad.addColorStop(0.3, crystalMid);
        rightGrad.addColorStop(1, crystalDark);
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(sw, 0);
        ctx.lineTo(sw * 0.3, -sh * 0.15);
        ctx.lineTo(0, -sh);
        ctx.lineTo(sw * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        // Center highlight facet
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.moveTo(0, -sh);
        ctx.lineTo(-sw * 0.2, -sh * 0.6);
        ctx.lineTo(0, -sh * 0.5);
        ctx.lineTo(sw * 0.15, -sh * 0.65);
        ctx.closePath();
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(0, -sh);
        ctx.lineTo(-sw * 0.3, -sh * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -sh);
        ctx.lineTo(sw * 0.3, -sh * 0.15);
        ctx.stroke();

        ctx.restore();
      });

      // Inner glow at center
      const centerGlow = ctx.createRadialGradient(
        screenPos.x, screenPos.y - 10 * s, 0,
        screenPos.x, screenPos.y - 10 * s, 12 * s
      );
      centerGlow.addColorStop(0, "rgba(255,255,255,0.5)");
      centerGlow.addColorStop(0.5, "rgba(144,202,249,0.3)");
      centerGlow.addColorStop(1, "rgba(144,202,249,0)");
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle particles
      ctx.fillStyle = "#ffffff";
      const sparkleTime = decorTime * 2;
      for (let sp = 0; sp < 6; sp++) {
        const sparkleAngle = sp * Math.PI / 3 + sparkleTime;
        const sparkleR = 8 + Math.sin(sparkleTime + sp) * 4;
        const sparkleX = screenPos.x + Math.cos(sparkleAngle) * sparkleR * s;
        const sparkleY = screenPos.y - 15 * s + Math.sin(sparkleAngle) * sparkleR * 0.4 * s;
        const sparkleSize = 1 + Math.sin(sparkleTime * 2 + sp) * 0.5;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frost particles floating up
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (let fp = 0; fp < 4; fp++) {
        const frostY = screenPos.y - ((decorTime * 20 + fp * 15) % 40) * s;
        const frostX = screenPos.x + Math.sin(decorTime + fp * 1.5) * 8 * s;
        ctx.beginPath();
        ctx.arc(frostX, frostY, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "snow_pile": {
      // Proper isometric 3D snow drift with diamond base
      const snowBaseX = screenPos.x;
      const snowBaseY = screenPos.y;
      const snowSeed = (dec.x || 0) * 7.3 + (dec.y || 0) * 13.1;

      // Isometric ratios
      const isoWidth = 35 * s;  // Half-width of diamond base
      const isoDepth = 18 * s;  // Half-depth (appears shorter due to iso angle)
      const snowHeight = 28 * s; // Peak height

      // Diamond base corners (isometric)
      const leftPt = { x: snowBaseX - isoWidth, y: snowBaseY };
      const rightPt = { x: snowBaseX + isoWidth, y: snowBaseY };
      const backPt = { x: snowBaseX, y: snowBaseY - isoDepth };
      const frontPt = { x: snowBaseX, y: snowBaseY + isoDepth };
      const peakPt = { x: snowBaseX - 5 * s, y: snowBaseY - snowHeight };

      // Soft shadow on ground (isometric ellipse)
      const shadowGrad = ctx.createRadialGradient(
        snowBaseX + 8 * s, snowBaseY + 5 * s, 0,
        snowBaseX + 8 * s, snowBaseY + 5 * s, 50 * s
      );
      shadowGrad.addColorStop(0, "rgba(70, 90, 120, 0.3)");
      shadowGrad.addColorStop(0.6, "rgba(80, 100, 130, 0.12)");
      shadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(snowBaseX + 8 * s, snowBaseY + 5 * s, 45 * s, 22 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back face (darker, more blue - facing away from light)
      const backFaceGrad = ctx.createLinearGradient(
        backPt.x, backPt.y,
        snowBaseX, snowBaseY + isoDepth * 0.5
      );
      backFaceGrad.addColorStop(0, "#c8d5e5");
      backFaceGrad.addColorStop(0.5, "#d5e0eb");
      backFaceGrad.addColorStop(1, "#dde8f0");

      ctx.fillStyle = backFaceGrad;
      ctx.beginPath();
      ctx.moveTo(leftPt.x, leftPt.y);
      ctx.quadraticCurveTo(leftPt.x + 8 * s, leftPt.y - snowHeight * 0.6, peakPt.x - 8 * s, peakPt.y + 5 * s);
      ctx.quadraticCurveTo(backPt.x - 5 * s, backPt.y - snowHeight * 0.4, backPt.x, backPt.y);
      ctx.lineTo(leftPt.x, leftPt.y);
      ctx.closePath();
      ctx.fill();

      // Left face (medium shadow)
      const leftFaceGrad = ctx.createLinearGradient(
        leftPt.x, leftPt.y,
        frontPt.x, frontPt.y
      );
      leftFaceGrad.addColorStop(0, "#d0dce8");
      leftFaceGrad.addColorStop(0.4, "#dce6ef");
      leftFaceGrad.addColorStop(1, "#e5edf4");

      ctx.fillStyle = leftFaceGrad;
      ctx.beginPath();
      ctx.moveTo(leftPt.x, leftPt.y);
      ctx.quadraticCurveTo(leftPt.x + 8 * s, leftPt.y - snowHeight * 0.6, peakPt.x - 8 * s, peakPt.y + 5 * s);
      ctx.quadraticCurveTo(peakPt.x, peakPt.y, peakPt.x + 5 * s, peakPt.y + 8 * s);
      ctx.quadraticCurveTo(frontPt.x - 10 * s, frontPt.y - snowHeight * 0.3, frontPt.x, frontPt.y);
      ctx.lineTo(leftPt.x, leftPt.y);
      ctx.closePath();
      ctx.fill();

      // Right face (brightest - lit side)
      const rightFaceGrad = ctx.createLinearGradient(
        backPt.x, backPt.y - snowHeight,
        rightPt.x, rightPt.y
      );
      rightFaceGrad.addColorStop(0, "#ffffff");
      rightFaceGrad.addColorStop(0.2, "#fcfeff");
      rightFaceGrad.addColorStop(0.5, "#f5fafc");
      rightFaceGrad.addColorStop(1, "#eef4f8");

      ctx.fillStyle = rightFaceGrad;
      ctx.beginPath();
      ctx.moveTo(backPt.x, backPt.y);
      ctx.quadraticCurveTo(backPt.x + 5 * s, backPt.y - snowHeight * 0.5, peakPt.x + 3 * s, peakPt.y + 3 * s);
      ctx.quadraticCurveTo(rightPt.x - 10 * s, rightPt.y - snowHeight * 0.5, rightPt.x, rightPt.y);
      ctx.lineTo(backPt.x, backPt.y);
      ctx.closePath();
      ctx.fill();

      // Front face (lit, but slightly shadowed due to angle)
      const frontFaceGrad = ctx.createLinearGradient(
        peakPt.x, peakPt.y,
        frontPt.x, frontPt.y
      );
      frontFaceGrad.addColorStop(0, "#f8fbfd");
      frontFaceGrad.addColorStop(0.3, "#f2f7fa");
      frontFaceGrad.addColorStop(0.7, "#eaf1f6");
      frontFaceGrad.addColorStop(1, "#e0eaf2");

      ctx.fillStyle = frontFaceGrad;
      ctx.beginPath();
      ctx.moveTo(frontPt.x, frontPt.y);
      ctx.quadraticCurveTo(frontPt.x - 10 * s, frontPt.y - snowHeight * 0.3, peakPt.x + 5 * s, peakPt.y + 8 * s);
      ctx.quadraticCurveTo(peakPt.x + 8 * s, peakPt.y + 5 * s, peakPt.x + 12 * s, peakPt.y + 10 * s);
      ctx.quadraticCurveTo(rightPt.x - 5 * s, rightPt.y - snowHeight * 0.25, rightPt.x, rightPt.y);
      ctx.lineTo(frontPt.x, frontPt.y);
      ctx.closePath();
      ctx.fill();

      // Secondary smaller mound on top-right
      const mound2X = snowBaseX + 12 * s;
      const mound2Y = snowBaseY - 5 * s;
      const mound2Grad = ctx.createRadialGradient(
        mound2X - 3 * s, mound2Y - 8 * s, 0,
        mound2X, mound2Y, 15 * s
      );
      mound2Grad.addColorStop(0, "#ffffff");
      mound2Grad.addColorStop(0.5, "#f5f9fc");
      mound2Grad.addColorStop(1, "#e8f0f5");
      ctx.fillStyle = mound2Grad;
      ctx.beginPath();
      ctx.moveTo(mound2X - 12 * s, mound2Y + 6 * s);
      ctx.quadraticCurveTo(mound2X - 8 * s, mound2Y - 10 * s, mound2X + 2 * s, mound2Y - 12 * s);
      ctx.quadraticCurveTo(mound2X + 12 * s, mound2Y - 6 * s, mound2X + 15 * s, mound2Y + 6 * s);
      ctx.quadraticCurveTo(mound2X + 5 * s, mound2Y + 8 * s, mound2X - 5 * s, mound2Y + 7 * s);
      ctx.quadraticCurveTo(mound2X - 10 * s, mound2Y + 7 * s, mound2X - 12 * s, mound2Y + 6 * s);
      ctx.closePath();
      ctx.fill();

      // Blue shadow in crevice between mounds
      ctx.fillStyle = "rgba(150, 180, 215, 0.3)";
      ctx.beginPath();
      ctx.moveTo(snowBaseX - 5 * s, snowBaseY - 12 * s);
      ctx.quadraticCurveTo(snowBaseX + 5 * s, snowBaseY - 8 * s, snowBaseX + 10 * s, snowBaseY - 10 * s);
      ctx.quadraticCurveTo(snowBaseX + 3 * s, snowBaseY - 5 * s, snowBaseX - 5 * s, snowBaseY - 12 * s);
      ctx.fill();

      // Soft edge definition between faces
      ctx.strokeStyle = "rgba(180, 200, 220, 0.3)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(peakPt.x, peakPt.y + 3 * s);
      ctx.quadraticCurveTo(frontPt.x - 8 * s, frontPt.y - snowHeight * 0.25, frontPt.x, frontPt.y);
      ctx.stroke();

      // Highlight ridges on top
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(peakPt.x - 10 * s, peakPt.y + 12 * s);
      ctx.quadraticCurveTo(peakPt.x - 2 * s, peakPt.y - 2 * s, peakPt.x + 8 * s, peakPt.y + 8 * s);
      ctx.stroke();

      // Secondary highlight
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(mound2X - 5 * s, mound2Y - 5 * s);
      ctx.quadraticCurveTo(mound2X + 2 * s, mound2Y - 10 * s, mound2X + 8 * s, mound2Y - 4 * s);
      ctx.stroke();

      // Snow texture bumps on surfaces
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let bump = 0; bump < 10; bump++) {
        const bumpAngle = (bump / 10) * Math.PI * 2 + snowSeed;
        const bumpDist = (12 + Math.sin(snowSeed + bump * 2) * 8) * s;
        const bumpX = snowBaseX + Math.cos(bumpAngle) * bumpDist * 0.8;
        const bumpY = snowBaseY - 10 * s + Math.sin(bumpAngle) * bumpDist * 0.4;
        const bumpSize = (1.5 + Math.sin(snowSeed + bump) * 0.8) * s;
        ctx.beginPath();
        ctx.ellipse(bumpX, bumpY, bumpSize * 1.8, bumpSize * 0.7, bumpAngle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frost crystals scattered on surface
      ctx.fillStyle = "rgba(220, 240, 255, 0.75)";
      const crystalSpots = [
        { x: -20, y: -18 }, { x: -8, y: -24 }, { x: 5, y: -20 },
        { x: 18, y: -12 }, { x: 25, y: -8 }, { x: -15, y: -8 }
      ];
      crystalSpots.forEach((cp, idx) => {
        const cx = snowBaseX + cp.x * s;
        const cy = snowBaseY + cp.y * s;
        const crystalSize = (1.2 + Math.sin(snowSeed + idx * 1.7) * 0.4) * s;

        // 6-point frost crystal
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(angle) * crystalSize;
          const py = cy + Math.sin(angle) * crystalSize * 0.5; // Flatten for isometric
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      });

      // Animated sparkles
      const sparkleTime = decorTime * 2.5;
      for (let sp = 0; sp < 7; sp++) {
        const sparklePhase = (sparkleTime + sp * 0.9 + Math.sin(snowSeed + sp) * 0.5) % 2;
        if (sparklePhase < 0.5) {
          const sparkleAlpha = Math.sin(sparklePhase * Math.PI / 0.5) * 0.95;
          const spAngle = (sp / 7) * Math.PI * 1.5 - Math.PI * 0.5 + snowSeed * 0.1;
          const spDist = (15 + sp * 3) * s;
          const spx = snowBaseX + Math.cos(spAngle) * spDist * 0.7;
          const spy = snowBaseY - 15 * s + Math.sin(spAngle) * spDist * 0.35;

          ctx.fillStyle = `rgba(255,255,255,${sparkleAlpha})`;
          const starSize = (1.2 + Math.sin(sparklePhase * 6) * 0.4) * s;

          // 4-point sparkle star
          ctx.beginPath();
          ctx.moveTo(spx, spy - starSize * 1.8);
          ctx.lineTo(spx + starSize * 0.25, spy - starSize * 0.25);
          ctx.lineTo(spx + starSize * 1.8, spy);
          ctx.lineTo(spx + starSize * 0.25, spy + starSize * 0.25);
          ctx.lineTo(spx, spy + starSize * 1.8);
          ctx.lineTo(spx - starSize * 0.25, spy + starSize * 0.25);
          ctx.lineTo(spx - starSize * 1.8, spy);
          ctx.lineTo(spx - starSize * 0.25, spy - starSize * 0.25);
          ctx.closePath();
          ctx.fill();

          // Bright center
          ctx.beginPath();
          ctx.arc(spx, spy, starSize * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Floating snow particles
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      for (let p = 0; p < 4; p++) {
        const particlePhase = (decorTime * 0.7 + p * 0.8 + snowSeed) % 2.5;
        const px = snowBaseX - 12 * s + p * 10 * s + Math.sin(decorTime * 1.5 + p) * 4 * s;
        const py = snowBaseY - 20 * s - particlePhase * 10 * s;
        const pSize = (0.7 + Math.sin(particlePhase + p) * 0.25) * s;
        if (particlePhase < 2) {
          ctx.globalAlpha = 0.35 * (1 - particlePhase / 2);
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Rim light on the lit edge
      ctx.strokeStyle = "rgba(255, 252, 245, 0.5)";
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.moveTo(backPt.x + 5 * s, backPt.y - 3 * s);
      ctx.quadraticCurveTo(peakPt.x + 5 * s, peakPt.y + 2 * s, rightPt.x - 10 * s, rightPt.y - 8 * s);
      ctx.stroke();
      break;
    }
    case "ice_fortress":
      // Crystalline structure using faceted polygons
      const iceLight = "#B3E5FC";
      const iceMid = "#81D4FA";
      const iceDark = "#29B6F6";
      const iceShadow = "rgba(0, 96, 100, 0.4)";

      // Ground shadow blob
      ctx.fillStyle = iceShadow;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 25,
        40 * s,
        15 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Helper to draw crystal spires
      const drawSpire = (x, y, h, w) => {
        // Left face (Mid)
        ctx.fillStyle = iceMid;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - w, y - h * 0.2);
        ctx.lineTo(x, y - h);
        ctx.lineTo(x + w * 0.5, y - h * 0.8);
        ctx.fill();
        // Right face (Dark)
        ctx.fillStyle = iceDark;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y - h * 0.2);
        ctx.lineTo(x + w * 0.5, y - h * 0.8);
        ctx.fill();
        // Top face (Light)
        ctx.fillStyle = iceLight;
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x - w, y - h * 0.2);
        ctx.lineTo(x + w * 0.5, y - h * 0.8);
        ctx.fill();
        // Edge highlight
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x, y);
        ctx.stroke();
      };

      // Draw cluster of spires back to front
      drawSpire(screenPos.x - 20 * s, screenPos.y - 5 * s, 50 * s, 15 * s);
      drawSpire(screenPos.x + 15 * s, screenPos.y - 8 * s, 45 * s, 12 * s);
      drawSpire(screenPos.x, screenPos.y, 65 * s, 20 * s); // Main spire
      drawSpire(screenPos.x - 10 * s, screenPos.y + 5 * s, 30 * s, 10 * s);
      break;

    case "ice_throne":
      // Jagged ice shards forming a chair
      ctx.fillStyle = "rgba(0, 96, 100, 0.3)"; // Shadow
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 10 * s,
        20 * s,
        8 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const throneBase = "#4FC3F7";
      const throneHighlight = "#B3E5FC";

      // Base block
      ctx.fillStyle = throneBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15 * s, screenPos.y + 2);
      ctx.lineTo(screenPos.x, screenPos.y + 7 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y + 2);
      ctx.lineTo(screenPos.x, screenPos.y - 7 * s);
      ctx.fill();
      //throneBase but darker
      ctx.fillStyle = "#29B6F6";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15 * s, screenPos.y + 2);
      ctx.lineTo(screenPos.x, screenPos.y + 7 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 17 * s);
      ctx.lineTo(screenPos.x - 15 * s, screenPos.y + 10 * s);
      ctx.fill();
      // right side, darkest
      ctx.fillStyle = "#0288D1";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 15 * s, screenPos.y + 2);
      ctx.lineTo(screenPos.x, screenPos.y + 7 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 17 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y + 10 * s);
      ctx.fill();

      // connector
      ctx.fillStyle = "#0288D1";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y + 2 * s);
      ctx.fill();

      // Seat and Backrest (jagged polygons)
      ctx.fillStyle = throneHighlight;
      ctx.beginPath();
      // Seat area
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 5 * s);
      // Backrest rising up
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 35 * s); // Right point
      ctx.lineTo(screenPos.x, screenPos.y - 50 * s); // Top point
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 35 * s); // Left point
      ctx.closePath();
      ctx.fill();

      // Facet definitions
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 50 * s);
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 35 * s);
      ctx.stroke();
      break;

    case "icicles": {
      const icicleBlue = "#b3e5fc";
      const icicleMid = "#81d4fa";
      const icicleDark = "#4fc3f7";
      const icicleDeep = "#29b6f6";
      const rockGray = "#6b7b8a";
      const rockDark = "#4a5a6a";
      const rockLight = "#8a9aaa";

      // Ground shadow
      const icicleShadowGrad = ctx.createRadialGradient(
        screenPos.x + 3 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 3 * s, screenPos.y + 8 * s, 30 * s
      );
      icicleShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
      icicleShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.08)");
      icicleShadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = icicleShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 30 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow mound at base
      ctx.fillStyle = "#f0f4f8";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 3 * s, screenPos.y + 2 * s, 16 * s, 5 * s, -0.15, 0, 0.01);
      ctx.ellipse(screenPos.x - 3 * s, screenPos.y + 2 * s, 16 * s, 5 * s, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Rock overhang - back face
      ctx.fillStyle = rockDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x + 24 * s, screenPos.y - 15 * s);
      ctx.closePath();
      ctx.fill();

      // Rock overhang - top face
      ctx.fillStyle = rockLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 28 * s);
      ctx.closePath();
      ctx.fill();

      // Snow on top of overhang
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15 * s, screenPos.y - 34 * s);
      ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 40 * s, screenPos.x + 5 * s, screenPos.y - 37 * s);
      ctx.quadraticCurveTo(screenPos.x + 15 * s, screenPos.y - 39 * s, screenPos.x + 22 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 30 * s);
      ctx.closePath();
      ctx.fill();

      // Rock overhang - front face
      ctx.fillStyle = rockGray;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 18 * s);
      ctx.closePath();
      ctx.fill();

      // Individual icicles hanging from the overhang
      const icicles = [
        { dx: -16, h: 28, w: 3.5 },
        { dx: -11, h: 35, w: 4 },
        { dx: -6, h: 22, w: 3 },
        { dx: -1, h: 40, w: 4.5 },
        { dx: 4, h: 30, w: 3.5 },
        { dx: 9, h: 25, w: 3 },
        { dx: 14, h: 32, w: 4 },
        { dx: 19, h: 18, w: 2.5 },
      ];

      icicles.forEach((ic, idx) => {
        const ix = screenPos.x + ic.dx * s;
        const iy = screenPos.y - 15 * s;
        const ih = ic.h * s;
        const iw = ic.w * s;

        // Icicle left face
        const leftGrad = ctx.createLinearGradient(ix - iw, iy, ix, iy + ih);
        leftGrad.addColorStop(0, icicleMid);
        leftGrad.addColorStop(0.4, icicleBlue);
        leftGrad.addColorStop(1, "rgba(179,229,252,0.3)");
        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.moveTo(ix - iw, iy);
        ctx.lineTo(ix, iy + 2 * s);
        ctx.lineTo(ix, iy + ih);
        ctx.lineTo(ix - iw * 0.3, iy + ih * 0.7);
        ctx.closePath();
        ctx.fill();

        // Icicle right face
        const rightGrad = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
        rightGrad.addColorStop(0, icicleDark);
        rightGrad.addColorStop(0.5, icicleDeep);
        rightGrad.addColorStop(1, "rgba(41,182,246,0.2)");
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(ix + iw, iy);
        ctx.lineTo(ix, iy + 2 * s);
        ctx.lineTo(ix, iy + ih);
        ctx.lineTo(ix + iw * 0.3, iy + ih * 0.7);
        ctx.closePath();
        ctx.fill();

        // Center highlight
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(ix - iw * 0.2, iy + 3 * s);
        ctx.lineTo(ix + iw * 0.1, iy + 4 * s);
        ctx.lineTo(ix, iy + ih * 0.6);
        ctx.closePath();
        ctx.fill();

        // Drip at tip
        if (idx % 3 === 0) {
          const dripPhase = (decorTime * 2 + idx) % 3;
          if (dripPhase < 1) {
            const dripY = iy + ih + dripPhase * 12 * s;
            const dripAlpha = 1 - dripPhase;
            ctx.fillStyle = `rgba(179,229,252,${dripAlpha * 0.8})`;
            ctx.beginPath();
            ctx.ellipse(ix, dripY, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Prismatic light sparkles
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      const iceSparkleTime = decorTime * 1.5;
      for (let sp = 0; sp < 5; sp++) {
        const phase = (iceSparkleTime + sp * 1.2) % 3;
        if (phase < 0.6) {
          const alpha = Math.sin(phase / 0.6 * Math.PI);
          const spx = screenPos.x + (sp * 8 - 16) * s;
          const spy = screenPos.y - 15 * s + Math.sin(sp * 2.1) * 10 * s;
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(spx, spy, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case "frozen_pond": {
      const pondIceLight = "#e8f4fd";
      const pondIceMid = "#b3e5fc";
      const pondIceDark = "#81d4fa";
      const pondDeep = "#4fc3f7";
      const snowEdge = "#f5f9fc";
      const pondSeed = (dec.x || 0) * 19.3;

      const pondW = 38 * s;
      const pondD = 18 * s;

      // Ambient glow beneath ice
      const pondGlow = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, pondW * 1.3
      );
      pondGlow.addColorStop(0, "rgba(100,180,240,0.2)");
      pondGlow.addColorStop(0.6, "rgba(100,180,240,0.08)");
      pondGlow.addColorStop(1, "transparent");
      ctx.fillStyle = pondGlow;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, pondW * 1.3, pondD * 1.3, pondSeed - 10, 0.1);
      ctx.fill();

      // Snow bank around pond
      ctx.fillStyle = snowEdge;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, pondW + 6 * s, pondD + 4 * s, pondSeed + 30, 0.16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      drawOrganicWaterShape(ctx, screenPos.x - 2 * s, screenPos.y - 1 * s, pondW + 4 * s, pondD + 2 * s, pondSeed + 30, 0.16);
      ctx.fill();

      // Ice surface - main gradient
      const iceGrad = ctx.createRadialGradient(
        screenPos.x - 8 * s, screenPos.y - 4 * s, 0,
        screenPos.x, screenPos.y, pondW
      );
      iceGrad.addColorStop(0, pondIceLight);
      iceGrad.addColorStop(0.3, pondIceMid);
      iceGrad.addColorStop(0.7, pondIceDark);
      iceGrad.addColorStop(1, pondDeep);
      ctx.fillStyle = iceGrad;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, pondW, pondD, pondSeed, 0.15);
      ctx.fill();

      // Dark depth beneath ice
      ctx.fillStyle = "rgba(25,118,210,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 2 * s, pondW * 0.6, pondD * 0.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Ice cracks pattern
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.2 * s;
      const crackSeed = (dec.x || 0) * 5.3;
      // Main crack
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x - 3 * s, screenPos.y + 1 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y + 3 * s);
      ctx.stroke();
      // Branch cracks
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 3 * s, screenPos.y + 1 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y + 6 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 8 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 14 * s, screenPos.y + 6 * s);
      ctx.stroke();

      // Surface frost patches
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      const frostPatches = [
        { dx: -18, dy: -2, rx: 8, ry: 4 },
        { dx: 10, dy: -6, rx: 6, ry: 3 },
        { dx: -5, dy: 5, rx: 10, ry: 4 },
        { dx: 20, dy: 2, rx: 7, ry: 3 },
      ];
      frostPatches.forEach(fp => {
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + fp.dx * s, screenPos.y + fp.dy * s,
          fp.rx * s, fp.ry * s, crackSeed * 0.1, 0, Math.PI * 2
        );
        ctx.fill();
      });

      // Specular reflection
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 12 * s, screenPos.y - 5 * s, 8 * s, 3.5 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 14 * s, screenPos.y - 2 * s, 5 * s, 2 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Subtle pulsing glow from beneath
      const pondPulse = 0.15 + Math.sin(decorTime * 1.5) * 0.08;
      ctx.fillStyle = `rgba(100,180,255,${pondPulse})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, pondW * 0.5, pondD * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tiny snow particles on ice
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let p = 0; p < 8; p++) {
        const px = screenPos.x + Math.cos(crackSeed + p * 0.8) * (10 + p * 3) * s;
        const py = screenPos.y + Math.sin(crackSeed + p * 1.1) * (5 + p * 1.5) * s;
        ctx.beginPath();
        ctx.arc(px, py, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "frozen_soldier": {
      const iceBlock = "#b3e5fc";
      const iceBlockDark = "#4fc3f7";
      const iceBlockDeep = "#0288d1";
      const armorDark = "rgba(60,80,100,0.5)";
      const armorMid = "rgba(80,100,120,0.4)";

      // Ground shadow
      const soldierShadow = ctx.createRadialGradient(
        screenPos.x + 3 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 3 * s, screenPos.y + 8 * s, 22 * s
      );
      soldierShadow.addColorStop(0, "rgba(0,60,80,0.3)");
      soldierShadow.addColorStop(0.6, "rgba(0,60,80,0.1)");
      soldierShadow.addColorStop(1, "transparent");
      ctx.fillStyle = soldierShadow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow at base
      ctx.fillStyle = "#e8f0f6";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ice block - back face
      ctx.fillStyle = iceBlockDeep;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 48 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Ice block - left face
      const soldierLeftGrad = ctx.createLinearGradient(
        screenPos.x - 14 * s, screenPos.y, screenPos.x, screenPos.y - 25 * s
      );
      soldierLeftGrad.addColorStop(0, iceBlockDark);
      soldierLeftGrad.addColorStop(0.5, iceBlock);
      soldierLeftGrad.addColorStop(1, "#e3f2fd");
      ctx.fillStyle = soldierLeftGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 14 * s, screenPos.y + 4 * s);
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Ice block - right face
      const soldierRightGrad = ctx.createLinearGradient(
        screenPos.x, screenPos.y - 25 * s, screenPos.x + 14 * s, screenPos.y
      );
      soldierRightGrad.addColorStop(0, "#e3f2fd");
      soldierRightGrad.addColorStop(0.5, iceBlock);
      soldierRightGrad.addColorStop(1, iceBlockDark);
      ctx.fillStyle = soldierRightGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 14 * s, screenPos.y + 4 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 48 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Ice block - top face
      ctx.fillStyle = "#e3f2fd";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 56 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 48 * s);
      ctx.closePath();
      ctx.fill();

      // Frozen soldier silhouette inside ice
      // Body
      ctx.fillStyle = armorDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 18 * s, 6 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head + helmet
      ctx.fillStyle = armorMid;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 33 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      // Helmet crest
      ctx.fillStyle = armorDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 35 * s);
      ctx.closePath();
      ctx.fill();

      // Sword arm (reaching forward)
      ctx.strokeStyle = armorDark;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 30 * s);
      ctx.stroke();

      // Sword blade
      ctx.strokeStyle = "rgba(180,200,220,0.4)";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 44 * s);
      ctx.stroke();

      // Shield arm
      ctx.fillStyle = armorMid;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 8 * s, screenPos.y - 22 * s, 4 * s, 5 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.strokeStyle = armorDark;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y + 2 * s);
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y + 2 * s);
      ctx.stroke();

      // Ice surface highlights and reflections
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 42 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 18 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x + 11 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 9 * s, screenPos.y - 8 * s);
      ctx.closePath();
      ctx.fill();

      // Frost particles
      ctx.fillStyle = "rgba(200,230,255,0.6)";
      for (let fp = 0; fp < 6; fp++) {
        const frostAngle = fp * Math.PI / 3 + decorTime * 0.5;
        const frostR = (14 + Math.sin(decorTime + fp) * 3) * s;
        const fx = screenPos.x + Math.cos(frostAngle) * frostR * 0.8;
        const fy = screenPos.y - 25 * s + Math.sin(frostAngle) * frostR * 0.4;
        ctx.beginPath();
        ctx.arc(fx, fy, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "frozen_gate": {
      const gateStone = "#7a8a9a";
      const gateStoneDark = "#5a6a7a";
      const gateStoneLight = "#9aaaba";
      const gateIce = "#b3e5fc";
      const gateIceDark = "#4fc3f7";

      // Ground shadow
      ctx.fillStyle = "rgba(0,40,60,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 10 * s, 35 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow base
      ctx.fillStyle = "#eef4f8";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 30 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left pillar - back face
      ctx.fillStyle = gateStoneDark;
      ctx.fillRect(screenPos.x - 22 * s, screenPos.y - 55 * s, 10 * s, 60 * s);
      // Left pillar - front face
      ctx.fillStyle = gateStone;
      ctx.fillRect(screenPos.x - 24 * s, screenPos.y - 52 * s, 10 * s, 57 * s);
      // Left pillar - right edge
      ctx.fillStyle = gateStoneLight;
      ctx.fillRect(screenPos.x - 14 * s, screenPos.y - 52 * s, 2 * s, 57 * s);

      // Right pillar - back face
      ctx.fillStyle = gateStoneDark;
      ctx.fillRect(screenPos.x + 12 * s, screenPos.y - 55 * s, 10 * s, 60 * s);
      // Right pillar - front face
      ctx.fillStyle = gateStone;
      ctx.fillRect(screenPos.x + 14 * s, screenPos.y - 52 * s, 10 * s, 57 * s);
      // Right pillar - left edge
      ctx.fillStyle = gateStoneLight;
      ctx.fillRect(screenPos.x + 12 * s, screenPos.y - 52 * s, 2 * s, 57 * s);

      // Stone archway
      ctx.fillStyle = gateStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y - 52 * s);
      ctx.quadraticCurveTo(screenPos.x, screenPos.y - 70 * s, screenPos.x + 22 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 48 * s);
      ctx.quadraticCurveTo(screenPos.x, screenPos.y - 64 * s, screenPos.x - 22 * s, screenPos.y - 48 * s);
      ctx.closePath();
      ctx.fill();

      // Arch highlight
      ctx.strokeStyle = gateStoneLight;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 50 * s);
      ctx.quadraticCurveTo(screenPos.x, screenPos.y - 66 * s, screenPos.x + 20 * s, screenPos.y - 50 * s);
      ctx.stroke();

      // Frozen portcullis bars
      for (let bar = 0; bar < 4; bar++) {
        const barX = screenPos.x - 10 * s + bar * 7 * s;
        const barTop = screenPos.y - 48 * s + Math.abs(bar - 1.5) * 5 * s;
        const barBottom = screenPos.y + 2 * s - bar * 2 * s;

        // Ice-covered bar
        const barGrad = ctx.createLinearGradient(barX - 2 * s, barTop, barX + 2 * s, barBottom);
        barGrad.addColorStop(0, gateIce);
        barGrad.addColorStop(0.5, gateIceDark);
        barGrad.addColorStop(1, gateIce);
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX - 1.5 * s, barTop, 3 * s, barBottom - barTop);

        // Bar highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(barX - 1 * s, barTop, 1 * s, (barBottom - barTop) * 0.8);
      }

      // Horizontal frozen bar across portcullis
      ctx.fillStyle = gateIceDark;
      ctx.fillRect(screenPos.x - 12 * s, screenPos.y - 25 * s, 24 * s, 3 * s);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(screenPos.x - 12 * s, screenPos.y - 25 * s, 24 * s, 1 * s);

      // Ice buildup on pillars
      const drawIceOnPillar = (px: number, side: number) => {
        ctx.fillStyle = gateIce;
        ctx.beginPath();
        ctx.moveTo(px, screenPos.y - 45 * s);
        ctx.quadraticCurveTo(px + side * 6 * s, screenPos.y - 35 * s, px + side * 3 * s, screenPos.y - 20 * s);
        ctx.quadraticCurveTo(px + side * 5 * s, screenPos.y - 10 * s, px + side * 2 * s, screenPos.y);
        ctx.lineTo(px, screenPos.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.moveTo(px, screenPos.y - 42 * s);
        ctx.quadraticCurveTo(px + side * 3 * s, screenPos.y - 32 * s, px + side * 1 * s, screenPos.y - 18 * s);
        ctx.lineTo(px, screenPos.y - 20 * s);
        ctx.closePath();
        ctx.fill();
      };
      drawIceOnPillar(screenPos.x - 14 * s, -1);
      drawIceOnPillar(screenPos.x + 14 * s, 1);

      // Snow on top of arch
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 52 * s);
      ctx.quadraticCurveTo(screenPos.x - 10 * s, screenPos.y - 58 * s, screenPos.x, screenPos.y - 68 * s);
      ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y - 72 * s, screenPos.x, screenPos.y - 73 * s);
      ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 72 * s, screenPos.x, screenPos.y - 68 * s);
      ctx.quadraticCurveTo(screenPos.x + 10 * s, screenPos.y - 58 * s, screenPos.x + 20 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 52 * s);
      ctx.quadraticCurveTo(screenPos.x, screenPos.y - 74 * s, screenPos.x - 22 * s, screenPos.y - 52 * s);
      ctx.closePath();
      ctx.fill();

      // Pillar cap snow
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 19 * s, screenPos.y - 55 * s, 7 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 19 * s, screenPos.y - 55 * s, 7 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone detail - cracks
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 28 * s);
      ctx.moveTo(screenPos.x + 18 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 36 * s);
      ctx.stroke();
      break;
    }

    case "broken_wall": {
      const wallStone = "#8a9aaa";
      const wallStoneDark = "#6a7a8a";
      const wallStoneLight = "#aabaca";
      const wallSnow = "#f5f9fc";
      const wallIce = "#c5e3f6";

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 8 * s, 28 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow at base
      ctx.fillStyle = wallSnow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 26 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rubble pile
      const rubbleColors = [wallStoneDark, wallStone, wallStoneLight];
      const rubble = [
        { dx: -18, dy: 2, r: 4 }, { dx: -12, dy: 4, r: 3 }, { dx: -6, dy: 3, r: 5 },
        { dx: 2, dy: 5, r: 3.5 }, { dx: 8, dy: 3, r: 4 }, { dx: 14, dy: 4, r: 3 },
        { dx: 20, dy: 2, r: 3.5 }, { dx: -8, dy: 0, r: 3 }, { dx: 5, dy: 1, r: 2.5 },
      ];
      rubble.forEach((rb, idx) => {
        ctx.fillStyle = rubbleColors[idx % 3];
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + rb.dx * s, screenPos.y + rb.dy * s,
          rb.r * s, rb.r * 0.6 * s, idx * 0.5, 0, Math.PI * 2
        );
        ctx.fill();
      });

      // Standing wall section - left side (taller)
      // Back face
      ctx.fillStyle = wallStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y);
      ctx.lineTo(screenPos.x - 20 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Front face
      ctx.fillStyle = wallStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 24 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x - 20 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 20 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Top edge (broken/jagged)
      ctx.fillStyle = wallStoneLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 24 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x - 20 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 14 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 33 * s);
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 34 * s);
      ctx.closePath();
      ctx.fill();

      // Right wall section (shorter, more broken)
      ctx.fillStyle = wallStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 4 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = wallStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Jagged top of right section
      ctx.fillStyle = wallStoneLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 16 * s, screenPos.y - 16 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 17 * s);
      ctx.closePath();
      ctx.fill();

      // Stone block lines
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8 * s;
      for (let row = 0; row < 5; row++) {
        const ry = screenPos.y - row * 8 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 24 * s, ry);
        ctx.lineTo(screenPos.x - 6 * s, ry - 2 * s);
        ctx.stroke();
      }
      for (let row = 0; row < 3; row++) {
        const ry = screenPos.y - row * 7 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 2 * s, ry);
        ctx.lineTo(screenPos.x + 18 * s, ry - 1 * s);
        ctx.stroke();
      }

      // Frost/ice on wall
      ctx.fillStyle = wallIce;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y - 30 * s);
      ctx.quadraticCurveTo(screenPos.x - 18 * s, screenPos.y - 25 * s, screenPos.x - 22 * s, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 14 * s);
      ctx.quadraticCurveTo(screenPos.x - 24 * s, screenPos.y - 24 * s, screenPos.x - 22 * s, screenPos.y - 30 * s);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Snow on top of walls
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 26 * s, screenPos.y - 38 * s);
      ctx.quadraticCurveTo(screenPos.x - 18 * s, screenPos.y - 44 * s, screenPos.x - 10 * s, screenPos.y - 38 * s);
      ctx.quadraticCurveTo(screenPos.x - 8 * s, screenPos.y - 36 * s, screenPos.x - 6 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 38 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 10 * s, screenPos.y - 21 * s, 8 * s, 3 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Small icicles hanging from broken edges
      const wallIcicles = [
        { dx: -14, dy: -35, h: 8 }, { dx: -10, dy: -36, h: 6 },
        { dx: 8, dy: -20, h: 5 }, { dx: 12, dy: -21, h: 7 },
      ];
      wallIcicles.forEach(wi => {
        const wix = screenPos.x + wi.dx * s;
        const wiy = screenPos.y + wi.dy * s;
        ctx.fillStyle = wallIce;
        ctx.beginPath();
        ctx.moveTo(wix - 1.5 * s, wiy);
        ctx.lineTo(wix, wiy + wi.h * s);
        ctx.lineTo(wix + 1.5 * s, wiy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.moveTo(wix - 0.5 * s, wiy + 1 * s);
        ctx.lineTo(wix, wiy + wi.h * 0.7 * s);
        ctx.lineTo(wix + 0.5 * s, wiy + 1 * s);
        ctx.closePath();
        ctx.fill();
      });
      break;
    }

    case "frozen_waterfall": {
      const fallIceLight = "#e3f2fd";
      const fallIceMid = "#bbdefb";
      const fallIceDark = "#64b5f6";
      const fallIceDeep = "#1e88e5";
      const fallRock = "#5a6a7a";
      const fallRockDark = "#3a4a5a";

      // Ground shadow and mist
      const fallShadow = ctx.createRadialGradient(
        screenPos.x + 5 * s, screenPos.y + 12 * s, 0,
        screenPos.x + 5 * s, screenPos.y + 12 * s, 35 * s
      );
      fallShadow.addColorStop(0, "rgba(30,136,229,0.2)");
      fallShadow.addColorStop(0.5, "rgba(30,136,229,0.08)");
      fallShadow.addColorStop(1, "transparent");
      ctx.fillStyle = fallShadow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 12 * s, 35 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Frozen pool at base
      ctx.fillStyle = "#b3e5fc";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 24 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 6 * s, screenPos.y + 3 * s, 10 * s, 4 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Rocky cliff - back
      ctx.fillStyle = fallRockDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18 * s, screenPos.y);
      ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 65 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Rocky cliff - left face
      ctx.fillStyle = fallRock;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 24 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x - 26 * s, screenPos.y - 68 * s);
      ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 65 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Rocky cliff - right face
      ctx.fillStyle = fallRockDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 24 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + 26 * s, screenPos.y - 68 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Snow on cliff top
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 26 * s, screenPos.y - 68 * s);
      ctx.quadraticCurveTo(screenPos.x - 15 * s, screenPos.y - 76 * s, screenPos.x, screenPos.y - 72 * s);
      ctx.quadraticCurveTo(screenPos.x + 15 * s, screenPos.y - 76 * s, screenPos.x + 26 * s, screenPos.y - 68 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 65 * s);
      ctx.closePath();
      ctx.fill();

      // Frozen waterfall cascade - layered ice flow
      const cascadeW = 16 * s;
      const cascadeTop = screenPos.y - 60 * s;
      const cascadeBottom = screenPos.y + 2 * s;

      // Back cascade layer
      const backCascadeGrad = ctx.createLinearGradient(
        screenPos.x, cascadeTop, screenPos.x, cascadeBottom
      );
      backCascadeGrad.addColorStop(0, fallIceDeep);
      backCascadeGrad.addColorStop(0.3, fallIceDark);
      backCascadeGrad.addColorStop(0.6, fallIceMid);
      backCascadeGrad.addColorStop(1, fallIceLight);
      ctx.fillStyle = backCascadeGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - cascadeW * 0.7, cascadeTop);
      ctx.quadraticCurveTo(screenPos.x - cascadeW * 0.9, cascadeTop + (cascadeBottom - cascadeTop) * 0.3,
        screenPos.x - cascadeW, cascadeTop + (cascadeBottom - cascadeTop) * 0.5);
      ctx.quadraticCurveTo(screenPos.x - cascadeW * 1.1, cascadeBottom - 10 * s,
        screenPos.x - cascadeW * 0.8, cascadeBottom);
      ctx.lineTo(screenPos.x + cascadeW * 0.8, cascadeBottom);
      ctx.quadraticCurveTo(screenPos.x + cascadeW * 1.1, cascadeBottom - 10 * s,
        screenPos.x + cascadeW, cascadeTop + (cascadeBottom - cascadeTop) * 0.5);
      ctx.quadraticCurveTo(screenPos.x + cascadeW * 0.9, cascadeTop + (cascadeBottom - cascadeTop) * 0.3,
        screenPos.x + cascadeW * 0.7, cascadeTop);
      ctx.closePath();
      ctx.fill();

      // Frozen flow ridges
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5 * s;
      for (let ridge = 0; ridge < 6; ridge++) {
        const ridgeY = cascadeTop + ((cascadeBottom - cascadeTop) * (ridge + 1)) / 7;
        const ridgeW = cascadeW * (0.7 + ridge * 0.05);
        ctx.beginPath();
        ctx.moveTo(screenPos.x - ridgeW, ridgeY);
        ctx.quadraticCurveTo(screenPos.x, ridgeY + 3 * s, screenPos.x + ridgeW, ridgeY);
        ctx.stroke();
      }

      // Center highlight on ice
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 3 * s, cascadeTop + 5 * s);
      ctx.quadraticCurveTo(screenPos.x - 5 * s, (cascadeTop + cascadeBottom) / 2,
        screenPos.x - 4 * s, cascadeBottom - 5 * s);
      ctx.lineTo(screenPos.x + 2 * s, cascadeBottom - 5 * s);
      ctx.quadraticCurveTo(screenPos.x + 3 * s, (cascadeTop + cascadeBottom) / 2,
        screenPos.x + 1 * s, cascadeTop + 5 * s);
      ctx.closePath();
      ctx.fill();

      // Icicle formations at overflow points
      const fallIcicles = [
        { dx: -14, dy: -25, h: 12 }, { dx: -10, dy: -15, h: 8 },
        { dx: 10, dy: -20, h: 10 }, { dx: 14, dy: -30, h: 9 },
        { dx: -16, dy: -40, h: 7 }, { dx: 16, dy: -42, h: 6 },
      ];
      fallIcicles.forEach(fi => {
        const fix = screenPos.x + fi.dx * s;
        const fiy = screenPos.y + fi.dy * s;
        ctx.fillStyle = fallIceMid;
        ctx.beginPath();
        ctx.moveTo(fix - 2 * s, fiy);
        ctx.lineTo(fix, fiy + fi.h * s);
        ctx.lineTo(fix + 2 * s, fiy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.moveTo(fix - 0.8 * s, fiy + 1 * s);
        ctx.lineTo(fix, fiy + fi.h * 0.6 * s);
        ctx.lineTo(fix + 0.3 * s, fiy + 1 * s);
        ctx.closePath();
        ctx.fill();
      });

      // Prismatic sparkles on ice surface
      const fallSparkleTime = decorTime * 2;
      for (let sp = 0; sp < 8; sp++) {
        const sparklePhase = (fallSparkleTime + sp * 0.75) % 2.5;
        if (sparklePhase < 0.5) {
          const alpha = Math.sin(sparklePhase / 0.5 * Math.PI) * 0.9;
          const spx = screenPos.x + (sp * 4 - 14) * s;
          const spy = cascadeTop + (sp * 8 + 5) * s;
          // Rainbow tinted sparkle
          const hue = (sp * 50 + decorTime * 30) % 360;
          ctx.fillStyle = `hsla(${hue}, 70%, 85%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(spx, spy, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Frozen mist at base
      const mistAlpha = 0.12 + Math.sin(decorTime) * 0.05;
      ctx.fillStyle = `rgba(200,230,255,${mistAlpha})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "aurora_crystal": {
      const auroraBase = screenPos.y;

      // Ground glow with aurora colors
      const auroraGlowGrad = ctx.createRadialGradient(
        screenPos.x, auroraBase + 3 * s, 0,
        screenPos.x, auroraBase + 3 * s, 35 * s
      );
      const auroraHue = (decorTime * 20) % 360;
      auroraGlowGrad.addColorStop(0, `hsla(${auroraHue}, 60%, 60%, 0.3)`);
      auroraGlowGrad.addColorStop(0.5, `hsla(${(auroraHue + 60) % 360}, 50%, 50%, 0.12)`);
      auroraGlowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = auroraGlowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, auroraBase + 3 * s, 35 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow mound base
      ctx.fillStyle = "#eef4f8";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, auroraBase + 2 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crystal formation - main spire and satellites
      const auroraCrystals = [
        { dx: 0, dy: 0, h: 45, w: 8, angle: 0 },
        { dx: -10, dy: 2, h: 28, w: 5, angle: -0.12 },
        { dx: 8, dy: 1, h: 32, w: 6, angle: 0.1 },
        { dx: -5, dy: 3, h: 20, w: 4, angle: -0.2 },
        { dx: 12, dy: 3, h: 18, w: 3.5, angle: 0.18 },
      ];

      auroraCrystals.forEach((crystal, idx) => {
        const cx = screenPos.x + crystal.dx * s;
        const cy = auroraBase + crystal.dy * s;
        const ch = crystal.h * s;
        const cw = crystal.w * s;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(crystal.angle);

        // Crystal hue shifts over time
        const crystalHue = (auroraHue + idx * 40) % 360;
        const crystalHue2 = (crystalHue + 120) % 360;

        // Left face
        const leftAuroraGrad = ctx.createLinearGradient(-cw, 0, 0, -ch);
        leftAuroraGrad.addColorStop(0, `hsla(${crystalHue}, 50%, 40%, 0.8)`);
        leftAuroraGrad.addColorStop(0.5, `hsla(${crystalHue2}, 60%, 60%, 0.7)`);
        leftAuroraGrad.addColorStop(1, `hsla(${crystalHue}, 70%, 80%, 0.9)`);
        ctx.fillStyle = leftAuroraGrad;
        ctx.beginPath();
        ctx.moveTo(-cw, 0);
        ctx.lineTo(-cw * 0.3, -ch * 0.15);
        ctx.lineTo(0, -ch);
        ctx.lineTo(-cw * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        // Right face
        const rightAuroraGrad = ctx.createLinearGradient(0, -ch, cw, 0);
        rightAuroraGrad.addColorStop(0, `hsla(${crystalHue2}, 70%, 80%, 0.9)`);
        rightAuroraGrad.addColorStop(0.5, `hsla(${crystalHue}, 50%, 55%, 0.7)`);
        rightAuroraGrad.addColorStop(1, `hsla(${crystalHue2}, 45%, 35%, 0.8)`);
        ctx.fillStyle = rightAuroraGrad;
        ctx.beginPath();
        ctx.moveTo(cw, 0);
        ctx.lineTo(cw * 0.3, -ch * 0.15);
        ctx.lineTo(0, -ch);
        ctx.lineTo(cw * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        // Center facet highlight
        ctx.fillStyle = `hsla(${crystalHue}, 80%, 90%, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(0, -ch);
        ctx.lineTo(-cw * 0.15, -ch * 0.55);
        ctx.lineTo(cw * 0.1, -ch * 0.5);
        ctx.closePath();
        ctx.fill();

        // Edge glow
        ctx.strokeStyle = `hsla(${crystalHue}, 80%, 85%, 0.6)`;
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(0, -ch);
        ctx.lineTo(-cw * 0.3, -ch * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -ch);
        ctx.lineTo(cw * 0.3, -ch * 0.15);
        ctx.stroke();

        ctx.restore();
      });

      // Aurora light beams emanating upward
      const beamCount = 5;
      for (let beam = 0; beam < beamCount; beam++) {
        const beamPhase = (decorTime * 0.8 + beam * 1.3) % 4;
        if (beamPhase < 2.5) {
          const beamAlpha = Math.sin(beamPhase / 2.5 * Math.PI) * 0.25;
          const beamHue = (auroraHue + beam * 35) % 360;
          const beamX = screenPos.x + Math.sin(decorTime * 0.5 + beam * 1.2) * 8 * s;
          const beamTop = auroraBase - 50 * s - beam * 8 * s;
          const beamW = (3 + Math.sin(decorTime + beam) * 1.5) * s;

          ctx.fillStyle = `hsla(${beamHue}, 70%, 70%, ${beamAlpha})`;
          ctx.beginPath();
          ctx.moveTo(beamX - beamW, auroraBase - 20 * s);
          ctx.lineTo(beamX - beamW * 0.3, beamTop);
          ctx.lineTo(beamX + beamW * 0.3, beamTop);
          ctx.lineTo(beamX + beamW, auroraBase - 20 * s);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Floating aurora particles
      for (let p = 0; p < 8; p++) {
        const pPhase = (decorTime * 1.2 + p * 0.7) % 3;
        const pAlpha = Math.sin(pPhase / 3 * Math.PI) * 0.7;
        const pHue = (auroraHue + p * 45) % 360;
        const px = screenPos.x + Math.sin(decorTime * 0.8 + p * 1.5) * 15 * s;
        const py = auroraBase - 10 * s - pPhase * 15 * s;

        ctx.fillStyle = `hsla(${pHue}, 70%, 75%, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, (1.2 + Math.sin(pPhase * 3) * 0.4) * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "snow_lantern": {
      const lanternStone = "#8a9aaa";
      const lanternStoneDark = "#6a7a8a";
      const lanternStoneLight = "#b0bfcf";

      // Ground shadow
      const lanternShadow = ctx.createRadialGradient(
        screenPos.x + 2 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 2 * s, screenPos.y + 8 * s, 20 * s
      );
      lanternShadow.addColorStop(0, "rgba(0,0,0,0.25)");
      lanternShadow.addColorStop(0.5, "rgba(0,0,0,0.1)");
      lanternShadow.addColorStop(1, "transparent");
      ctx.fillStyle = lanternShadow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 8 * s, 20 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow around base
      ctx.fillStyle = "#f0f4f8";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 14 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base pedestal (isometric)
      ctx.fillStyle = lanternStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 1 * s);
      ctx.closePath();
      ctx.fill();
      // Base sides
      ctx.fillStyle = lanternStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y + 5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lanternStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 5 * s);
      ctx.closePath();
      ctx.fill();

      // Pillar/post
      ctx.fillStyle = lanternStone;
      ctx.fillRect(screenPos.x - 3 * s, screenPos.y - 22 * s, 6 * s, 24 * s);
      ctx.fillStyle = lanternStoneLight;
      ctx.fillRect(screenPos.x - 3 * s, screenPos.y - 22 * s, 2 * s, 24 * s);

      // Lantern housing - open sides to show light
      const housingTop = screenPos.y - 38 * s;
      const housingBottom = screenPos.y - 22 * s;
      const housingW = 10 * s;

      // Warm light glow
      const glowPulse = 0.6 + Math.sin(decorTime * 3) * 0.15;
      const warmGlow = ctx.createRadialGradient(
        screenPos.x, (housingTop + housingBottom) / 2, 0,
        screenPos.x, (housingTop + housingBottom) / 2, 18 * s
      );
      warmGlow.addColorStop(0, `rgba(255,200,100,${glowPulse * 0.5})`);
      warmGlow.addColorStop(0.3, `rgba(255,180,80,${glowPulse * 0.25})`);
      warmGlow.addColorStop(1, "transparent");
      ctx.fillStyle = warmGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, (housingTop + housingBottom) / 2, 18 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Housing back
      ctx.fillStyle = lanternStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - housingW, housingBottom);
      ctx.lineTo(screenPos.x - housingW * 0.8, housingTop);
      ctx.lineTo(screenPos.x + housingW * 0.8, housingTop);
      ctx.lineTo(screenPos.x + housingW, housingBottom);
      ctx.closePath();
      ctx.fill();

      // Inner warm glow visible through openings
      ctx.fillStyle = `rgba(255,200,100,${glowPulse * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - housingW * 0.6, housingBottom + 1 * s);
      ctx.lineTo(screenPos.x - housingW * 0.5, housingTop + 2 * s);
      ctx.lineTo(screenPos.x + housingW * 0.5, housingTop + 2 * s);
      ctx.lineTo(screenPos.x + housingW * 0.6, housingBottom + 1 * s);
      ctx.closePath();
      ctx.fill();

      // Housing pillars (corner posts)
      ctx.fillStyle = lanternStone;
      ctx.fillRect(screenPos.x - housingW - 1 * s, housingTop, 3 * s, housingBottom - housingTop);
      ctx.fillRect(screenPos.x + housingW - 2 * s, housingTop, 3 * s, housingBottom - housingTop);

      // Roof (isometric pyramid)
      ctx.fillStyle = lanternStoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, housingTop - 12 * s);
      ctx.lineTo(screenPos.x - housingW - 3 * s, housingTop);
      ctx.lineTo(screenPos.x, housingTop + 4 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = lanternStoneLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, housingTop - 12 * s);
      ctx.lineTo(screenPos.x + housingW + 3 * s, housingTop);
      ctx.lineTo(screenPos.x, housingTop + 4 * s);
      ctx.closePath();
      ctx.fill();

      // Roof top cap
      ctx.fillStyle = lanternStone;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, housingTop - 12 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow on roof
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - housingW - 2 * s, housingTop + 1 * s);
      ctx.quadraticCurveTo(screenPos.x - 4 * s, housingTop - 6 * s, screenPos.x, housingTop - 12 * s);
      ctx.quadraticCurveTo(screenPos.x + 2 * s, housingTop - 14 * s, screenPos.x, housingTop - 15 * s);
      ctx.quadraticCurveTo(screenPos.x - 2 * s, housingTop - 14 * s, screenPos.x, housingTop - 12 * s);
      ctx.quadraticCurveTo(screenPos.x + 4 * s, housingTop - 6 * s, screenPos.x + housingW + 2 * s, housingTop + 1 * s);
      ctx.lineTo(screenPos.x + housingW + 3 * s, housingTop);
      ctx.lineTo(screenPos.x, housingTop - 12 * s);
      ctx.lineTo(screenPos.x - housingW - 3 * s, housingTop);
      ctx.closePath();
      ctx.fill();

      // Light cone downward
      ctx.fillStyle = `rgba(255,200,100,${glowPulse * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - housingW * 0.6, housingBottom);
      ctx.lineTo(screenPos.x - housingW * 1.2, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + housingW * 1.2, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + housingW * 0.6, housingBottom);
      ctx.closePath();
      ctx.fill();

      // Floating warm particles
      for (let p = 0; p < 3; p++) {
        const warmPhase = (decorTime * 1.5 + p * 1.1) % 2;
        if (warmPhase < 1.2) {
          const warmAlpha = Math.sin(warmPhase / 1.2 * Math.PI) * 0.6;
          const warmX = screenPos.x + Math.sin(decorTime + p * 2) * 4 * s;
          const warmY = (housingTop + housingBottom) / 2 - warmPhase * 8 * s;
          ctx.fillStyle = `rgba(255,200,100,${warmAlpha})`;
          ctx.beginPath();
          ctx.arc(warmX, warmY, 1 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    // === VOLCANIC DECORATIONS ===
    case "lava_pool": {
      // Enhanced 3D isometric lava pool with animated molten effects
      const lavaYellow = "#ffeb3b";
      const lavaOrange = "#ff9800";
      const lavaRed = "#f44336";
      const lavaDark = "#bf360c";
      const rockDark = "#1a1210";
      const rockMid = "#2a1a10";
      const lavaSeed = (dec.x || 0) * 23.1;

      // Ambient heat glow
      const heatGlow = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, 45 * s
      );
      const heatPulse = 0.25 + Math.sin(decorTime * 2) * 0.1;
      heatGlow.addColorStop(0, `rgba(255,100,0,${heatPulse})`);
      heatGlow.addColorStop(0.4, `rgba(255,60,0,${heatPulse * 0.5})`);
      heatGlow.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = heatGlow;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, 45 * s, 25 * s, lavaSeed - 10, 0.1);
      ctx.fill();

      // Outer rock rim with 3D depth
      // Rock rim back
      ctx.fillStyle = rockDark;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y - 3 * s, 32 * s, 16 * s, lavaSeed + 50, 0.18);
      ctx.fill();

      // Rock rim front edge
      ctx.fillStyle = rockMid;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, 32 * s, 16 * s, lavaSeed + 50, 0.18);
      ctx.fill();

      // Inner dark crater
      ctx.fillStyle = "#0a0505";
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y - 1 * s, 26 * s, 13 * s, lavaSeed + 70, 0.15);
      ctx.fill();

      // Lava surface with animated gradient
      const lavaGrad = ctx.createRadialGradient(
        screenPos.x + Math.sin(decorTime * 1.5) * 5 * s,
        screenPos.y + Math.cos(decorTime * 1.2) * 2 * s,
        0,
        screenPos.x,
        screenPos.y,
        24 * s
      );
      lavaGrad.addColorStop(0, lavaYellow);
      lavaGrad.addColorStop(0.2, lavaOrange);
      lavaGrad.addColorStop(0.5, lavaRed);
      lavaGrad.addColorStop(0.8, lavaDark);
      lavaGrad.addColorStop(1, "#1a0a00");
      ctx.fillStyle = lavaGrad;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y - 1 * s, 24 * s, 12 * s, lavaSeed, 0.14);
      ctx.fill();

      // Cooling crust patterns (darker streaks)
      ctx.strokeStyle = "rgba(40,10,0,0.4)";
      ctx.lineWidth = 2 * s;
      for (let c = 0; c < 4; c++) {
        const crustAngle = c * Math.PI / 2 + decorTime * 0.2;
        const crustR = 8 + c * 4;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(crustAngle + 1) * 5 * s,
          screenPos.y + Math.sin(crustAngle + 1) * 2.5 * s,
          crustR * s,
          crustAngle, crustAngle + 0.8
        );
        ctx.stroke();
      }

      // Hot spots / bright vents
      const hotSpots = [
        { x: 0, y: 0, r: 8 },
        { x: -8, y: -2, r: 5 },
        { x: 10, y: 1, r: 4 },
        { x: -4, y: 3, r: 3 },
      ];
      hotSpots.forEach((hs, idx) => {
        const hotPulse = 0.6 + Math.sin(decorTime * 3 + idx) * 0.3;
        const hotGrad = ctx.createRadialGradient(
          screenPos.x + hs.x * s, screenPos.y + hs.y * s - 1 * s, 0,
          screenPos.x + hs.x * s, screenPos.y + hs.y * s - 1 * s, hs.r * s
        );
        hotGrad.addColorStop(0, `rgba(255,255,200,${hotPulse})`);
        hotGrad.addColorStop(0.3, `rgba(255,200,50,${hotPulse * 0.8})`);
        hotGrad.addColorStop(0.7, `rgba(255,100,0,${hotPulse * 0.4})`);
        hotGrad.addColorStop(1, "rgba(255,100,0,0)");
        ctx.fillStyle = hotGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x + hs.x * s, screenPos.y + hs.y * s - 1 * s, hs.r * s, hs.r * 0.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated bubbles
      const bubbles = [
        { x: 5, y: -1, r: 3, speed: 2, phase: 0 },
        { x: -8, y: 1, r: 2.5, speed: 2.5, phase: 1.5 },
        { x: 12, y: 2, r: 2, speed: 1.8, phase: 3 },
        { x: -3, y: -2, r: 2, speed: 2.2, phase: 2 },
      ];
      bubbles.forEach((bub) => {
        const bubTime = (decorTime * bub.speed + bub.phase) % 2;
        const bubScale = bubTime < 1 ? bubTime : 2 - bubTime;
        const bubY = bub.y - bubTime * 3;

        if (bubScale > 0.1) {
          ctx.fillStyle = `rgba(255,200,100,${bubScale * 0.8})`;
          ctx.beginPath();
          ctx.arc(
            screenPos.x + bub.x * s,
            screenPos.y + bubY * s,
            bub.r * bubScale * s,
            0, Math.PI * 2
          );
          ctx.fill();
          // Bubble highlight
          ctx.fillStyle = `rgba(255,255,200,${bubScale * 0.5})`;
          ctx.beginPath();
          ctx.arc(
            screenPos.x + bub.x * s - bub.r * 0.3 * s,
            screenPos.y + bubY * s - bub.r * 0.3 * s,
            bub.r * bubScale * 0.4 * s,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      });

      // Rising heat shimmer / smoke wisps
      ctx.fillStyle = "rgba(100,50,20,0.15)";
      for (let w = 0; w < 3; w++) {
        const wispY = screenPos.y - ((decorTime * 25 + w * 20) % 40) * s;
        const wispX = screenPos.x + Math.sin(decorTime * 2 + w) * 10 * s;
        const wispSize = 4 + (1 - ((decorTime * 25 + w * 20) % 40) / 40) * 4;
        ctx.beginPath();
        ctx.arc(wispX, wispY, wispSize * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rock edge details
      ctx.strokeStyle = rockMid;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 30 * s, 15 * s, 0, Math.PI * 0.1, Math.PI * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 30 * s, 15 * s, 0, Math.PI * 0.7, Math.PI * 0.9);
      ctx.stroke();
      break;
    }
    case "obsidian_spike": {
      // Enhanced 3D isometric obsidian crystal spike
      const spikeBaseX = screenPos.x;
      const spikeBaseY = screenPos.y;

      // Lava glow beneath
      const lavaGlow = ctx.createRadialGradient(
        spikeBaseX, spikeBaseY + 3 * s, 0,
        spikeBaseX, spikeBaseY + 3 * s, 15 * s
      );
      lavaGlow.addColorStop(0, "rgba(255,80,0,0.4)");
      lavaGlow.addColorStop(0.5, "rgba(255,40,0,0.2)");
      lavaGlow.addColorStop(1, "transparent");
      ctx.fillStyle = lavaGlow;
      ctx.beginPath();
      ctx.ellipse(spikeBaseX, spikeBaseY + 3 * s, 15 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(spikeBaseX + 4 * s, spikeBaseY + 6 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main spike - faceted crystal look
      // Back face (darkest)
      ctx.fillStyle = "#0a0a15";
      ctx.beginPath();
      ctx.moveTo(spikeBaseX - 8 * s, spikeBaseY + 3 * s);
      ctx.lineTo(spikeBaseX - 3 * s, spikeBaseY - 40 * s);
      ctx.lineTo(spikeBaseX + 2 * s, spikeBaseY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Right face (mid-dark)
      ctx.fillStyle = "#15152a";
      ctx.beginPath();
      ctx.moveTo(spikeBaseX + 2 * s, spikeBaseY + 3 * s);
      ctx.lineTo(spikeBaseX - 3 * s, spikeBaseY - 40 * s);
      ctx.lineTo(spikeBaseX + 10 * s, spikeBaseY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Sharp glossy highlight facet
      ctx.fillStyle = "rgba(140,140,180,0.5)";
      ctx.beginPath();
      ctx.moveTo(spikeBaseX - 4 * s, spikeBaseY + 3 * s);
      ctx.lineTo(spikeBaseX - 3 * s, spikeBaseY - 40 * s);
      ctx.lineTo(spikeBaseX + 1 * s, spikeBaseY - 25 * s);
      ctx.lineTo(spikeBaseX - 1 * s, spikeBaseY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Secondary smaller spike
      ctx.fillStyle = "#0a0a15";
      ctx.beginPath();
      ctx.moveTo(spikeBaseX + 5 * s, spikeBaseY + 3 * s);
      ctx.lineTo(spikeBaseX + 8 * s, spikeBaseY - 18 * s);
      ctx.lineTo(spikeBaseX + 12 * s, spikeBaseY + 3 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(120,120,160,0.4)";
      ctx.beginPath();
      ctx.moveTo(spikeBaseX + 6 * s, spikeBaseY + 3 * s);
      ctx.lineTo(spikeBaseX + 8 * s, spikeBaseY - 18 * s);
      ctx.lineTo(spikeBaseX + 9 * s, spikeBaseY - 10 * s);
      ctx.lineTo(spikeBaseX + 8 * s, spikeBaseY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Lava cracks with glow
      ctx.strokeStyle = "#ff4400";
      ctx.lineWidth = 1.5 * s;
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 5 * s;
      ctx.beginPath();
      ctx.moveTo(spikeBaseX - 2 * s, spikeBaseY + 2 * s);
      ctx.lineTo(spikeBaseX - 1 * s, spikeBaseY - 8 * s);
      ctx.lineTo(spikeBaseX + 1 * s, spikeBaseY - 5 * s);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Tip glint
      ctx.fillStyle = "rgba(200,200,255,0.6)";
      ctx.beginPath();
      ctx.arc(spikeBaseX - 3 * s, spikeBaseY - 39 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "charred_tree": {
      // Enhanced 3D isometric burnt tree with glowing embers
      const charBlack = "#0a0a0a";
      const charDark = "#1a1a1a";
      const charMid = "#2a2a2a";
      const charLight = "#3a3a3a";
      const emberOrange = "#ff6600";
      const emberYellow = "#ffaa00";
      const emberRed = "#ff3300";

      // Ground shadow
      const charShadowGrad = ctx.createRadialGradient(
        screenPos.x + 4 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s
      );
      charShadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
      charShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.15)");
      charShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = charShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ash pile at base
      ctx.fillStyle = charMid;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = charLight;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 2 * s, screenPos.y + 3 * s, 6 * s, 2.5 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Burnt trunk - left face (darker)
      ctx.fillStyle = charBlack;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 32 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Burnt trunk - right face (slightly lighter)
      const trunkGrad = ctx.createLinearGradient(
        screenPos.x, screenPos.y - 20 * s, screenPos.x + 8 * s, screenPos.y - 10 * s
      );
      trunkGrad.addColorStop(0, charDark);
      trunkGrad.addColorStop(0.5, charMid);
      trunkGrad.addColorStop(1, charDark);
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 7 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 36 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Jagged broken top
      ctx.fillStyle = charDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 42 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 36 * s);
      ctx.closePath();
      ctx.fill();

      // Broken branches with charred texture
      ctx.strokeStyle = charDark;
      ctx.lineWidth = 4 * s;
      ctx.lineCap = "round";
      // Left branch
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 22 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 30 * s);
      ctx.stroke();
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 27 * s);
      ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 35 * s);
      ctx.stroke();

      // Right branch
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 22 * s);
      ctx.stroke();

      // Upper branch
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 38 * s);
      ctx.stroke();

      // Crack lines on trunk
      ctx.strokeStyle = charMid;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 3 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 28 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 22 * s);
      ctx.stroke();

      // Glowing embers with pulsing effect
      const embers = [
        { x: -3, y: -26, r: 2.5, speed: 3, phase: 0 },
        { x: 4, y: -20, r: 2, speed: 2.5, phase: 1 },
        { x: -1, y: -15, r: 1.8, speed: 3.5, phase: 2 },
        { x: -14, y: -32, r: 1.5, speed: 2.8, phase: 0.5 },
        { x: 10, y: -23, r: 1.5, speed: 3.2, phase: 1.5 },
        { x: -8, y: -36, r: 1.2, speed: 2.2, phase: 2.5 },
      ];

      embers.forEach((ember) => {
        const emberPulse = 0.4 + Math.sin(decorTime * ember.speed + ember.phase) * 0.4;

        // Ember glow
        const emberGlow = ctx.createRadialGradient(
          screenPos.x + ember.x * s, screenPos.y + ember.y * s, 0,
          screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * 3 * s
        );
        emberGlow.addColorStop(0, `rgba(255,150,50,${emberPulse * 0.6})`);
        emberGlow.addColorStop(0.5, `rgba(255,80,0,${emberPulse * 0.3})`);
        emberGlow.addColorStop(1, "rgba(255,50,0,0)");
        ctx.fillStyle = emberGlow;
        ctx.beginPath();
        ctx.arc(screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * 3 * s, 0, Math.PI * 2);
        ctx.fill();

        // Ember core
        const coreGrad = ctx.createRadialGradient(
          screenPos.x + ember.x * s, screenPos.y + ember.y * s, 0,
          screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * s
        );
        coreGrad.addColorStop(0, emberPulse > 0.6 ? emberYellow : emberOrange);
        coreGrad.addColorStop(0.5, emberOrange);
        coreGrad.addColorStop(1, emberRed);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Smoke wisps rising
      ctx.fillStyle = "rgba(60,60,60,0.2)";
      for (let sm = 0; sm < 4; sm++) {
        const smokeTime = (decorTime * 15 + sm * 12) % 35;
        const smokeY = screenPos.y - 35 * s - smokeTime * s;
        const smokeX = screenPos.x + Math.sin(decorTime * 1.5 + sm) * 5 * s;
        const smokeSize = 2 + smokeTime * 0.15;
        const smokeAlpha = Math.max(0, 0.25 - smokeTime * 0.007);
        ctx.fillStyle = `rgba(50,50,50,${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating ash particles
      ctx.fillStyle = "rgba(80,80,80,0.4)";
      for (let ash = 0; ash < 5; ash++) {
        const ashTime = (decorTime * 8 + ash * 15) % 50;
        const ashY = screenPos.y + 5 * s - ashTime * s;
        const ashX = screenPos.x + Math.sin(decorTime * 0.8 + ash * 2) * 15 * s;
        ctx.beginPath();
        ctx.arc(ashX, ashY, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "ember": {
      // Enhanced animated floating ember with glow and particles
      const emberBaseX = screenPos.x;
      const emberBaseY = screenPos.y;
      const emberFloat = Math.sin(decorTime * 2 + variant * 1.5) * 5 * s;
      const emberPulse = 0.7 + Math.sin(decorTime * 4 + variant) * 0.3;

      // Outer glow
      const emberGlow = ctx.createRadialGradient(
        emberBaseX, emberBaseY + emberFloat, 0,
        emberBaseX, emberBaseY + emberFloat, 12 * s
      );
      emberGlow.addColorStop(0, `rgba(255,150,0,${0.4 * emberPulse})`);
      emberGlow.addColorStop(0.5, `rgba(255,80,0,${0.2 * emberPulse})`);
      emberGlow.addColorStop(1, "transparent");
      ctx.fillStyle = emberGlow;
      ctx.beginPath();
      ctx.arc(emberBaseX, emberBaseY + emberFloat, 12 * s, 0, Math.PI * 2);
      ctx.fill();

      // Main ember body
      ctx.fillStyle = `rgba(255,${80 + Math.sin(decorTime * 5 + variant) * 40},0,${0.8 * emberPulse})`;
      ctx.beginPath();
      ctx.arc(emberBaseX, emberBaseY + emberFloat, 5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Hot core
      ctx.fillStyle = `rgba(255,${180 + Math.sin(decorTime * 6) * 50},${50 + Math.sin(decorTime * 4) * 30},${emberPulse})`;
      ctx.beginPath();
      ctx.arc(emberBaseX, emberBaseY + emberFloat, 3 * s, 0, Math.PI * 2);
      ctx.fill();

      // White-hot center
      ctx.fillStyle = `rgba(255,255,200,${0.8 * emberPulse})`;
      ctx.beginPath();
      ctx.arc(emberBaseX, emberBaseY + emberFloat, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Trailing sparks
      for (let sp = 0; sp < 3; sp++) {
        const sparkTime = (decorTime * 3 + sp * 0.5 + variant) % 1;
        const sparkX = emberBaseX + Math.sin(sp * 2 + decorTime) * 3 * s;
        const sparkY = emberBaseY + emberFloat + sparkTime * 15 * s;
        const sparkAlpha = (1 - sparkTime) * 0.8;

        ctx.fillStyle = `rgba(255,${150 + sp * 30},0,${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, (1 - sparkTime) * 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "obsidian_castle": {
      // Ornate dark volcanic glass fortress with full detail
      const ox = screenPos.x;
      const oy = screenPos.y;
      const obsDark = "#0D0D0D";
      const obsMid = "#1A1A1A";
      const obsLight = "#2D2D2D";
      const obsHighlight = "#4A4A4A";
      const lavaGlow = "#FF3D00";
      const lavaCore = "#FFAB00";
      const tanA = Math.tan(Math.PI / 6);

      // Ground shadow with lava glow
      const groundGlow = ctx.createRadialGradient(ox, oy + 5 * s, 0, ox, oy + 5 * s, 50 * s);
      groundGlow.addColorStop(0, "rgba(255, 61, 0, 0.25)");
      groundGlow.addColorStop(0.5, "rgba(0,0,0,0.45)");
      groundGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(ox, oy + 5 * s, 50 * s, 25 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone foundation with carved details
      const foundH = 10 * s;
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.moveTo(ox, oy + 5 * s);
      ctx.lineTo(ox - 35 * s, oy + 5 * s - 17 * s * tanA);
      ctx.lineTo(ox - 35 * s, oy + 5 * s - 17 * s * tanA - foundH);
      ctx.lineTo(ox, oy + 5 * s - foundH);
      ctx.fill();
      ctx.fillStyle = "#151515";
      ctx.beginPath();
      ctx.moveTo(ox, oy + 5 * s);
      ctx.lineTo(ox + 35 * s, oy + 5 * s - 17 * s * tanA);
      ctx.lineTo(ox + 35 * s, oy + 5 * s - 17 * s * tanA - foundH);
      ctx.lineTo(ox, oy + 5 * s - foundH);
      ctx.fill();

      // Foundation carved runes (glowing)
      ctx.strokeStyle = "rgba(255, 61, 0, 0.3)";
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(ox - 28 * s + i * 12 * s, oy - foundH * 0.3);
        ctx.lineTo(ox - 24 * s + i * 12 * s, oy - foundH * 0.7);
        ctx.stroke();
      }

      // Back tower (drawn first - behind)
      const backTowerX = ox;
      const backTowerY = oy - 18 * s;
      const backTowerW = 14 * s;
      const backTowerH = 60 * s;

      ctx.fillStyle = obsDark;
      ctx.beginPath();
      ctx.moveTo(backTowerX - backTowerW, backTowerY - backTowerW * tanA);
      ctx.lineTo(backTowerX - backTowerW, backTowerY - backTowerW * tanA - backTowerH);
      ctx.lineTo(backTowerX, backTowerY - backTowerH);
      ctx.lineTo(backTowerX, backTowerY);
      ctx.fill();

      ctx.fillStyle = obsMid;
      ctx.beginPath();
      ctx.moveTo(backTowerX + backTowerW, backTowerY - backTowerW * tanA);
      ctx.lineTo(backTowerX + backTowerW, backTowerY - backTowerW * tanA - backTowerH);
      ctx.lineTo(backTowerX, backTowerY - backTowerH);
      ctx.lineTo(backTowerX, backTowerY);
      ctx.fill();

      // Back tower spire
      ctx.fillStyle = obsMid;
      ctx.beginPath();
      ctx.moveTo(backTowerX - backTowerW, backTowerY - backTowerW * tanA - backTowerH);
      ctx.lineTo(backTowerX, backTowerY - backTowerH - 25 * s);
      ctx.lineTo(backTowerX + backTowerW, backTowerY - backTowerW * tanA - backTowerH);
      ctx.lineTo(backTowerX, backTowerY - backTowerH);
      ctx.closePath();
      ctx.fill();

      // Main central tower
      const mainW = 20 * s;
      const mainH = 55 * s;
      const mainY = oy - 5 * s;

      // Left face gradient
      const leftGrad = ctx.createLinearGradient(ox - mainW, mainY, ox, mainY);
      leftGrad.addColorStop(0, obsDark);
      leftGrad.addColorStop(1, obsMid);
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(ox, mainY);
      ctx.lineTo(ox - mainW, mainY - mainW * tanA);
      ctx.lineTo(ox - mainW, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox, mainY - mainH);
      ctx.fill();

      // Right face gradient
      const rightGrad = ctx.createLinearGradient(ox, mainY, ox + mainW, mainY);
      rightGrad.addColorStop(0, obsMid);
      rightGrad.addColorStop(1, obsLight);
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(ox, mainY);
      ctx.lineTo(ox + mainW, mainY - mainW * tanA);
      ctx.lineTo(ox + mainW, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox, mainY - mainH);
      ctx.fill();

      // Stone block lines
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.5 * s;
      for (let row = 1; row < 7; row++) {
        const rowY = mainY - mainH * (row / 7);
        ctx.beginPath();
        ctx.moveTo(ox - mainW, rowY - mainW * tanA);
        ctx.lineTo(ox, rowY);
        ctx.lineTo(ox + mainW, rowY - mainW * tanA);
        ctx.stroke();
      }

      // Jagged battlements with more detail
      ctx.fillStyle = obsMid;
      ctx.beginPath();
      ctx.moveTo(ox - mainW, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox - mainW + 6 * s, mainY - mainW * tanA - mainH - 14 * s);
      ctx.lineTo(ox - mainW + 12 * s, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox - 5 * s, mainY - mainH - 10 * s);
      ctx.lineTo(ox, mainY - mainH - 22 * s);
      ctx.lineTo(ox + 5 * s, mainY - mainH - 10 * s);
      ctx.lineTo(ox + mainW - 12 * s, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox + mainW - 6 * s, mainY - mainW * tanA - mainH - 14 * s);
      ctx.lineTo(ox + mainW, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox, mainY - mainH);
      ctx.closePath();
      ctx.fill();

      // Side turrets
      const turretW = 10 * s;
      const turretH = 40 * s;
      const turretPositions = [
        { x: ox - 26 * s, y: oy + 2 * s },
        { x: ox + 26 * s, y: oy + 2 * s },
      ];

      turretPositions.forEach((tp, idx) => {
        ctx.fillStyle = idx === 0 ? obsDark : obsMid;
        ctx.beginPath();
        ctx.moveTo(tp.x - turretW, tp.y - turretW * tanA);
        ctx.lineTo(tp.x - turretW, tp.y - turretW * tanA - turretH);
        ctx.lineTo(tp.x, tp.y - turretH);
        ctx.lineTo(tp.x, tp.y);
        ctx.fill();

        ctx.fillStyle = idx === 0 ? obsMid : obsLight;
        ctx.beginPath();
        ctx.moveTo(tp.x + turretW, tp.y - turretW * tanA);
        ctx.lineTo(tp.x + turretW, tp.y - turretW * tanA - turretH);
        ctx.lineTo(tp.x, tp.y - turretH);
        ctx.lineTo(tp.x, tp.y);
        ctx.fill();

        // Turret pointed roof
        ctx.fillStyle = obsMid;
        ctx.beginPath();
        ctx.moveTo(tp.x - turretW - 2 * s, tp.y - turretW * tanA - turretH + 2 * s);
        ctx.lineTo(tp.x, tp.y - turretH - 18 * s);
        ctx.lineTo(tp.x + turretW + 2 * s, tp.y - turretW * tanA - turretH + 2 * s);
        ctx.lineTo(tp.x, tp.y - turretH);
        ctx.closePath();
        ctx.fill();

        // Turret window (glowing)
        ctx.shadowColor = lavaGlow;
        ctx.shadowBlur = 10 * s;
        ctx.fillStyle = lavaGlow;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y - turretH * 0.5, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Lava cracks on main tower
      ctx.shadowColor = lavaGlow;
      ctx.shadowBlur = 12 * s;
      ctx.strokeStyle = lavaGlow;
      ctx.lineWidth = 2.5 * s;

      ctx.beginPath();
      ctx.moveTo(ox - mainW + 5 * s, mainY - mainW * tanA - 12 * s);
      ctx.lineTo(ox - mainW + 9 * s, mainY - mainW * tanA - 24 * s);
      ctx.lineTo(ox - mainW + 6 * s, mainY - mainW * tanA - 34 * s);
      ctx.lineTo(ox - mainW + 11 * s, mainY - mainW * tanA - 44 * s);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox + mainW - 5 * s, mainY - mainW * tanA - 10 * s);
      ctx.lineTo(ox + mainW - 8 * s, mainY - mainW * tanA - 22 * s);
      ctx.lineTo(ox + mainW - 6 * s, mainY - mainW * tanA - 36 * s);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Main gate
      ctx.fillStyle = "#050505";
      ctx.beginPath();
      ctx.moveTo(ox - 7 * s, mainY);
      ctx.lineTo(ox - 7 * s, mainY - 16 * s);
      ctx.quadraticCurveTo(ox, mainY - 24 * s, ox + 7 * s, mainY - 16 * s);
      ctx.lineTo(ox + 7 * s, mainY);
      ctx.fill();

      // Gate inner glow
      ctx.shadowColor = lavaCore;
      ctx.shadowBlur = 18 * s;
      ctx.fillStyle = lavaCore;
      ctx.beginPath();
      ctx.arc(ox, mainY - 10 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Decorative skulls on gate pillars
      ctx.fillStyle = "#3D3D3D";
      [-8 * s, 8 * s].forEach((xOff) => {
        ctx.beginPath();
        ctx.arc(ox + xOff, mainY - 20 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = lavaGlow;
        ctx.beginPath();
        ctx.arc(ox + xOff - 1.2 * s, mainY - 20.5 * s, 0.9 * s, 0, Math.PI * 2);
        ctx.arc(ox + xOff + 1.2 * s, mainY - 20.5 * s, 0.9 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3D3D3D";
      });

      // Edge highlights
      ctx.strokeStyle = obsHighlight;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(ox, mainY);
      ctx.lineTo(ox, mainY - mainH);
      ctx.moveTo(ox - mainW, mainY - mainW * tanA - mainH);
      ctx.lineTo(ox, mainY - mainH - 22 * s);
      ctx.lineTo(ox + mainW, mainY - mainW * tanA - mainH);
      ctx.stroke();

      // Ambient lava particles
      const time = Date.now() / 1000;
      for (let p = 0; p < 5; p++) {
        const pTime = time + p * 0.6;
        const pLife = (pTime * 0.4) % 1;
        const px = ox + Math.sin(pTime * 2 + p) * 10 * s;
        const py = mainY - 12 * s - pLife * 55 * s;
        const pAlpha = Math.sin(pLife * Math.PI) * 0.85;
        ctx.fillStyle = `rgba(255, 100, 0, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, (1.8 - pLife) * s, 0, Math.PI * 2);
        ctx.fill();
      }

      break;
    }

    case "dark_barracks": {
      // Simpler dark volcanic structure (previous obsidian_castle)
      const obsDarkB = "#1A1A1A";
      const obsMidB = "#333333";
      const obsLightB = "#555555";
      const lavaGlowB = "#FF3D00";

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 35 * s, 15 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = obsDarkB;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
      ctx.lineTo(screenPos.x + 25 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
      ctx.fill();

      ctx.fillStyle = obsMidB;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
      ctx.lineTo(screenPos.x - 25 * s, screenPos.y);
      ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
      ctx.fill();

      ctx.fillStyle = obsLightB;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
      ctx.fill();

      ctx.fillStyle = obsMidB;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 65 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x + 23 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x + 23 * s, screenPos.y - 50 * s);
      ctx.fill();

      ctx.shadowColor = lavaGlowB;
      ctx.shadowBlur = 15 * s;
      ctx.fillStyle = lavaGlowB;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = obsLightB;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
      ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 45 * s);
      ctx.stroke();
      break;
    }

    case "dark_throne": {
      // Ornate evil throne with detailed craftsmanship
      const tx = screenPos.x;
      const ty = screenPos.y;
      const metalDark = "#1a1a1a";
      const metalMid = "#2D2D2D";
      const metalLight = "#404040";
      const metalHighlight = "#606060";
      const velvetDark = "#4A0A1A";
      const velvetMid = "#6B1020";
      const velvetLight = "#8B1530";
      const goldAccent = "#8B7355";
      const goldLight = "#A08060";
      const evilGlow = "#6B0000";

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(tx, ty + 5 * s, 30 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone base platform
      const baseH = 8 * s;
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.moveTo(tx - 22 * s, ty + 2 * s);
      ctx.lineTo(tx + 22 * s, ty + 2 * s);
      ctx.lineTo(tx + 26 * s, ty - 2 * s);
      ctx.lineTo(tx + 26 * s, ty - 2 * s - baseH);
      ctx.lineTo(tx - 26 * s, ty - 2 * s - baseH);
      ctx.lineTo(tx - 26 * s, ty - 2 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#252525";
      ctx.fillRect(tx - 24 * s, ty - 2 * s, 48 * s, 4 * s);
      ctx.fillStyle = "#2D2D2D";
      ctx.fillRect(tx - 22 * s, ty - 6 * s, 44 * s, 4 * s);

      // Main throne back
      const backGrad = ctx.createLinearGradient(tx - 20 * s, ty - 65 * s, tx + 20 * s, ty - 65 * s);
      backGrad.addColorStop(0, metalDark);
      backGrad.addColorStop(0.3, metalMid);
      backGrad.addColorStop(0.5, metalLight);
      backGrad.addColorStop(0.7, metalMid);
      backGrad.addColorStop(1, metalDark);
      ctx.fillStyle = backGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 20 * s, ty - 14 * s);
      ctx.lineTo(tx - 24 * s, ty - 38 * s);
      ctx.lineTo(tx - 20 * s, ty - 55 * s);
      ctx.lineTo(tx - 14 * s, ty - 64 * s);
      ctx.lineTo(tx - 8 * s, ty - 58 * s);
      ctx.lineTo(tx, ty - 78 * s);
      ctx.lineTo(tx + 8 * s, ty - 58 * s);
      ctx.lineTo(tx + 14 * s, ty - 64 * s);
      ctx.lineTo(tx + 20 * s, ty - 55 * s);
      ctx.lineTo(tx + 24 * s, ty - 38 * s);
      ctx.lineTo(tx + 20 * s, ty - 14 * s);
      ctx.closePath();
      ctx.fill();

      // Inner velvet panel
      const velvetGrad = ctx.createLinearGradient(tx, ty - 55 * s, tx, ty - 16 * s);
      velvetGrad.addColorStop(0, velvetDark);
      velvetGrad.addColorStop(0.5, velvetMid);
      velvetGrad.addColorStop(1, velvetDark);
      ctx.fillStyle = velvetGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 16 * s, ty - 16 * s);
      ctx.lineTo(tx - 18 * s, ty - 35 * s);
      ctx.lineTo(tx - 14 * s, ty - 50 * s);
      ctx.lineTo(tx - 8 * s, ty - 54 * s);
      ctx.lineTo(tx, ty - 62 * s);
      ctx.lineTo(tx + 8 * s, ty - 54 * s);
      ctx.lineTo(tx + 14 * s, ty - 50 * s);
      ctx.lineTo(tx + 18 * s, ty - 35 * s);
      ctx.lineTo(tx + 16 * s, ty - 16 * s);
      ctx.closePath();
      ctx.fill();

      // Skull at center top
      ctx.fillStyle = "#4A4A4A";
      ctx.beginPath();
      ctx.arc(tx, ty - 64 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = evilGlow;
      ctx.shadowBlur = 10 * s;
      ctx.fillStyle = "#8B0000";
      ctx.beginPath();
      ctx.arc(tx - 2 * s, ty - 65 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.arc(tx + 2 * s, ty - 65 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#3D3D3D";
      ctx.beginPath();
      ctx.moveTo(tx - 3.5 * s, ty - 60 * s);
      ctx.lineTo(tx, ty - 58 * s);
      ctx.lineTo(tx + 3.5 * s, ty - 60 * s);
      ctx.fill();

      // Bat wing decorations
      [-1, 1].forEach((side) => {
        ctx.fillStyle = metalMid;
        ctx.beginPath();
        ctx.moveTo(tx + side * 20 * s, ty - 38 * s);
        ctx.quadraticCurveTo(tx + side * 32 * s, ty - 50 * s, tx + side * 28 * s, ty - 62 * s);
        ctx.lineTo(tx + side * 25 * s, ty - 54 * s);
        ctx.quadraticCurveTo(tx + side * 30 * s, ty - 44 * s, tx + side * 25 * s, ty - 38 * s);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = metalHighlight;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(tx + side * 20 * s, ty - 38 * s);
        ctx.quadraticCurveTo(tx + side * 28 * s, ty - 46 * s, tx + side * 26 * s, ty - 56 * s);
        ctx.stroke();
      });

      // Armrests with dragon heads
      [-1, 1].forEach((side) => {
        ctx.fillStyle = metalDark;
        ctx.beginPath();
        ctx.moveTo(tx + side * 16 * s, ty - 14 * s);
        ctx.lineTo(tx + side * 20 * s, ty - 17 * s);
        ctx.lineTo(tx + side * 24 * s, ty - 20 * s);
        ctx.lineTo(tx + side * 24 * s, ty - 24 * s);
        ctx.lineTo(tx + side * 16 * s, ty - 20 * s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = metalMid;
        ctx.beginPath();
        ctx.moveTo(tx + side * 16 * s, ty - 20 * s);
        ctx.lineTo(tx + side * 24 * s, ty - 24 * s);
        ctx.lineTo(tx + side * 26 * s, ty - 22 * s);
        ctx.lineTo(tx + side * 18 * s, ty - 18 * s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = metalLight;
        ctx.beginPath();
        ctx.arc(tx + side * 25 * s, ty - 23 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8B0000";
        ctx.beginPath();
        ctx.arc(tx + side * 24 * s, ty - 24 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Seat cushion
      const seatGrad = ctx.createLinearGradient(tx, ty - 16 * s, tx, ty - 6 * s);
      seatGrad.addColorStop(0, velvetLight);
      seatGrad.addColorStop(0.3, velvetMid);
      seatGrad.addColorStop(1, velvetDark);
      ctx.fillStyle = seatGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 15 * s, ty - 6 * s);
      ctx.lineTo(tx - 16 * s, ty - 16 * s);
      ctx.lineTo(tx + 16 * s, ty - 16 * s);
      ctx.lineTo(tx + 15 * s, ty - 6 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = velvetMid;
      ctx.beginPath();
      ctx.moveTo(tx - 16 * s, ty - 16 * s);
      ctx.lineTo(tx - 14 * s, ty - 20 * s);
      ctx.lineTo(tx + 14 * s, ty - 20 * s);
      ctx.lineTo(tx + 16 * s, ty - 16 * s);
      ctx.closePath();
      ctx.fill();

      // Tufting buttons
      ctx.fillStyle = goldAccent;
      for (let row = 0; row < 2; row++) {
        for (let col = -1; col <= 1; col++) {
          ctx.beginPath();
          ctx.arc(tx + col * 7 * s, ty - 18 * s + row * 5 * s, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Gold trim
      ctx.strokeStyle = goldLight;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(tx - 16 * s, ty - 16 * s);
      ctx.lineTo(tx + 16 * s, ty - 16 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx - 16 * s, ty - 16 * s);
      ctx.lineTo(tx - 18 * s, ty - 35 * s);
      ctx.lineTo(tx - 14 * s, ty - 50 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx + 16 * s, ty - 16 * s);
      ctx.lineTo(tx + 18 * s, ty - 35 * s);
      ctx.lineTo(tx + 14 * s, ty - 50 * s);
      ctx.stroke();

      // Decorative spikes
      ctx.fillStyle = metalLight;
      [-14, -8, 8, 14].forEach((xOff) => {
        const spikeH = Math.abs(xOff) === 14 ? 10 * s : 7 * s;
        const baseY = Math.abs(xOff) === 14 ? ty - 64 * s : ty - 58 * s;
        ctx.beginPath();
        ctx.moveTo(tx + xOff * s - 2.5 * s, baseY);
        ctx.lineTo(tx + xOff * s, baseY - spikeH);
        ctx.lineTo(tx + xOff * s + 2.5 * s, baseY);
        ctx.closePath();
        ctx.fill();
      });

      // Evil rune glow
      ctx.shadowColor = evilGlow;
      ctx.shadowBlur = 12 * s;
      ctx.strokeStyle = "#6B0000";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 28 * s);
      ctx.lineTo(tx - 5 * s, ty - 36 * s);
      ctx.lineTo(tx, ty - 45 * s);
      ctx.lineTo(tx + 5 * s, ty - 36 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx, ty - 32 * s);
      ctx.lineTo(tx, ty - 42 * s);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Edge highlights
      ctx.strokeStyle = metalHighlight;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 78 * s);
      ctx.lineTo(tx - 8 * s, ty - 58 * s);
      ctx.moveTo(tx, ty - 78 * s);
      ctx.lineTo(tx + 8 * s, ty - 58 * s);
      ctx.stroke();

      break;
    }

    case "dark_spire": {
      // Simpler dark throne (previous dark_throne)
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      const metalS = "#263238";
      const metalHighS = "#546E7A";
      const cushionS = "#B71C1c";

      ctx.fillStyle = metalS;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 25 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 55 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 25 * s);
      ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 10 * s);
      ctx.fill();

      const cushionGradS = ctx.createLinearGradient(screenPos.x, screenPos.y - 20 * s, screenPos.x, screenPos.y);
      cushionGradS.addColorStop(0, cushionS);
      cushionGradS.addColorStop(1, "#880E4F");
      ctx.fillStyle = cushionGradS;
      ctx.fillRect(screenPos.x - 12 * s, screenPos.y - 20 * s, 24 * s, 12 * s);

      ctx.fillStyle = "#FF5252";
      ctx.fillRect(screenPos.x - 12 * s, screenPos.y - 20 * s, 24 * s, 2 * s);

      ctx.strokeStyle = metalHighS;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 40 * s);
      ctx.moveTo(screenPos.x, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 55 * s);
      ctx.stroke();
      break;
    }

    case "lava_fall": {
      const magmaYellow = "#ffeb3b";
      const magmaOrange = "#ff9800";
      const magmaRed = "#f44336";
      const magmaDark = "#bf360c";
      const cliffDark = "#1a1210";
      const cliffMid = "#2a1a10";

      // Heat glow
      const heatGlow = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, 40 * s);
      const hp = 0.2 + Math.sin(decorTime * 2) * 0.08;
      heatGlow.addColorStop(0, `rgba(255,100,0,${hp})`);
      heatGlow.addColorStop(1, "transparent");
      ctx.fillStyle = heatGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 40 * s, 20 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lava pool at base
      const poolPulse = 0.7 + Math.sin(decorTime * 3) * 0.15;
      const poolGrad = ctx.createRadialGradient(screenPos.x, screenPos.y + 4 * s, 0, screenPos.x, screenPos.y + 4 * s, 20 * s);
      poolGrad.addColorStop(0, magmaYellow);
      poolGrad.addColorStop(0.4, magmaOrange);
      poolGrad.addColorStop(0.7, magmaRed);
      poolGrad.addColorStop(1, magmaDark);
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 20 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock cliff sides
      ctx.fillStyle = cliffDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y);
      ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 58 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = cliffMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 6 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 58 * s);
      ctx.lineTo(screenPos.x + 24 * s, screenPos.y - 60 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y);
      ctx.closePath();
      ctx.fill();

      // Lava cascade
      const cascadeGrad = ctx.createLinearGradient(screenPos.x, screenPos.y - 55 * s, screenPos.x, screenPos.y);
      cascadeGrad.addColorStop(0, magmaYellow);
      cascadeGrad.addColorStop(0.3, magmaOrange);
      cascadeGrad.addColorStop(0.6, magmaRed);
      cascadeGrad.addColorStop(1, magmaDark);
      ctx.fillStyle = cascadeGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 55 * s);
      ctx.quadraticCurveTo(screenPos.x - 8 * s, screenPos.y - 30 * s, screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y);
      ctx.quadraticCurveTo(screenPos.x + 8 * s, screenPos.y - 30 * s, screenPos.x + 6 * s, screenPos.y - 55 * s);
      ctx.closePath();
      ctx.fill();

      // Bright center streak
      ctx.fillStyle = `rgba(255,235,59,${poolPulse * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 50 * s);
      ctx.quadraticCurveTo(screenPos.x - 3 * s, screenPos.y - 25 * s, screenPos.x - 2 * s, screenPos.y);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y);
      ctx.quadraticCurveTo(screenPos.x + 3 * s, screenPos.y - 25 * s, screenPos.x + 2 * s, screenPos.y - 50 * s);
      ctx.closePath();
      ctx.fill();

      // Ember particles
      for (let e = 0; e < 6; e++) {
        const ePhase = (decorTime * 1.5 + e * 0.8) % 2;
        const ex = screenPos.x + Math.sin(decorTime + e * 1.5) * 12 * s;
        const ey = screenPos.y - ePhase * 30 * s;
        const ea = (1 - ePhase / 2) * 0.8;
        ctx.fillStyle = `rgba(255,200,50,${ea})`;
        ctx.beginPath();
        ctx.arc(ex, ey, (1 + Math.sin(ePhase * 3)) * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "obsidian_pillar": {
      const obsBlack = "#1a1a20";
      const obsDark = "#2a2a35";
      const obsMid = "#3a3a48";
      const obsShine = "#5a5a70";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 6 * s, 16 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      const pillarH = 55 * s;
      const pillarW = 8 * s;

      // Left face
      ctx.fillStyle = obsBlack;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - pillarW, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x - pillarW * 0.8, screenPos.y - pillarH);
      ctx.lineTo(screenPos.x, screenPos.y - pillarH - 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Right face
      ctx.fillStyle = obsDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + pillarW, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + pillarW * 0.8, screenPos.y - pillarH);
      ctx.lineTo(screenPos.x, screenPos.y - pillarH - 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Front face
      ctx.fillStyle = obsMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - pillarW, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + pillarW, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x + pillarW * 0.8, screenPos.y - pillarH);
      ctx.lineTo(screenPos.x - pillarW * 0.8, screenPos.y - pillarH);
      ctx.closePath();
      ctx.fill();

      // Reflective highlight
      ctx.fillStyle = obsShine;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + pillarW * 0.3, screenPos.y - pillarH * 0.1);
      ctx.lineTo(screenPos.x + pillarW * 0.5, screenPos.y - pillarH * 0.8);
      ctx.lineTo(screenPos.x + pillarW * 0.7, screenPos.y - pillarH * 0.7);
      ctx.lineTo(screenPos.x + pillarW * 0.6, screenPos.y - pillarH * 0.15);
      ctx.closePath();
      ctx.fill();

      // Glowing rune near top
      const runeGlow = 0.5 + Math.sin(decorTime * 2.5) * 0.3;
      ctx.fillStyle = `rgba(200,50,50,${runeGlow})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - pillarH * 0.7);
      ctx.lineTo(screenPos.x - 3 * s, screenPos.y - pillarH * 0.6);
      ctx.lineTo(screenPos.x, screenPos.y - pillarH * 0.5);
      ctx.lineTo(screenPos.x + 3 * s, screenPos.y - pillarH * 0.6);
      ctx.closePath();
      ctx.fill();

      // Top facet
      ctx.fillStyle = obsShine;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - pillarH - 2 * s);
      ctx.lineTo(screenPos.x - pillarW * 0.8, screenPos.y - pillarH);
      ctx.lineTo(screenPos.x, screenPos.y - pillarH + 2 * s);
      ctx.lineTo(screenPos.x + pillarW * 0.8, screenPos.y - pillarH);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "fire_crystal": {
      const fcOrange = "#ff9800";
      const fcRed = "#f44336";
      const fcYellow = "#ffeb3b";
      const fcDark = "#bf360c";

      // Heat glow
      const fcGlow = ctx.createRadialGradient(screenPos.x, screenPos.y - 10 * s, 0, screenPos.x, screenPos.y - 10 * s, 30 * s);
      const fcPulse = 0.25 + Math.sin(decorTime * 3) * 0.1;
      fcGlow.addColorStop(0, `rgba(255,150,0,${fcPulse})`);
      fcGlow.addColorStop(1, "transparent");
      ctx.fillStyle = fcGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 30 * s, 18 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crystal spires
      const fcSpires = [
        { dx: 0, h: 40, w: 7 },
        { dx: -9, h: 25, w: 5 },
        { dx: 8, h: 28, w: 5 },
        { dx: -5, h: 18, w: 3.5 },
        { dx: 11, h: 16, w: 3 },
      ];
      fcSpires.forEach((sp, idx) => {
        const sx = screenPos.x + sp.dx * s;
        const sy = screenPos.y;
        const sh = sp.h * s;
        const sw = sp.w * s;
        const hue = (decorTime * 30 + idx * 20) % 60;

        // Left face
        const fcLGrad = ctx.createLinearGradient(sx - sw, sy, sx, sy - sh);
        fcLGrad.addColorStop(0, fcDark);
        fcLGrad.addColorStop(0.5, fcRed);
        fcLGrad.addColorStop(1, fcOrange);
        ctx.fillStyle = fcLGrad;
        ctx.beginPath();
        ctx.moveTo(sx - sw, sy);
        ctx.lineTo(sx, sy - sh);
        ctx.lineTo(sx, sy + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Right face
        const fcRGrad = ctx.createLinearGradient(sx, sy - sh, sx + sw, sy);
        fcRGrad.addColorStop(0, fcYellow);
        fcRGrad.addColorStop(0.5, fcOrange);
        fcRGrad.addColorStop(1, fcRed);
        ctx.fillStyle = fcRGrad;
        ctx.beginPath();
        ctx.moveTo(sx + sw, sy);
        ctx.lineTo(sx, sy - sh);
        ctx.lineTo(sx, sy + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Inner glow
        ctx.fillStyle = `rgba(255,235,59,${0.3 + Math.sin(decorTime * 4 + idx) * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(sx, sy - sh);
        ctx.lineTo(sx - sw * 0.3, sy - sh * 0.5);
        ctx.lineTo(sx + sw * 0.2, sy - sh * 0.55);
        ctx.closePath();
        ctx.fill();
      });

      // Floating embers
      for (let e = 0; e < 5; e++) {
        const ep = (decorTime * 1.2 + e * 0.6) % 2;
        const ea = Math.sin(ep / 2 * Math.PI) * 0.7;
        const ex = screenPos.x + Math.sin(decorTime + e * 1.3) * 10 * s;
        const ey = screenPos.y - 5 * s - ep * 20 * s;
        ctx.fillStyle = `rgba(255,200,50,${ea})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "skull_throne": {
      const boneWhite = "#e8e0d0";
      const boneShadow = "#c0b0a0";
      const throneDeep = "#3a2a1a";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 8 * s, 24 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base pile of skulls
      const skullPositions = [
        { dx: -8, dy: 2, sz: 4 }, { dx: 0, dy: 4, sz: 4.5 }, { dx: 8, dy: 2, sz: 4 },
        { dx: -12, dy: 0, sz: 3.5 }, { dx: 12, dy: 0, sz: 3.5 },
        { dx: -5, dy: -2, sz: 4 }, { dx: 5, dy: -2, sz: 4 },
        { dx: 0, dy: -4, sz: 3.5 },
      ];
      skullPositions.forEach(sk => {
        const skx = screenPos.x + sk.dx * s;
        const sky = screenPos.y + sk.dy * s;
        ctx.fillStyle = boneShadow;
        ctx.beginPath();
        ctx.arc(skx, sky, sk.sz * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = boneWhite;
        ctx.beginPath();
        ctx.arc(skx - 0.5 * s, sky - 0.5 * s, sk.sz * 0.85 * s, 0, Math.PI * 2);
        ctx.fill();
        // Eye sockets
        ctx.fillStyle = throneDeep;
        ctx.beginPath();
        ctx.arc(skx - 1.2 * s, sky - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.arc(skx + 1.2 * s, sky - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Throne back - tall bone/skull structure
      ctx.fillStyle = boneShadow;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 14 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 50 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x + 14 * s, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();

      // Throne back highlight
      ctx.fillStyle = boneWhite;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 46 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 8 * s);
      ctx.closePath();
      ctx.fill();

      // Central skull on throne back
      ctx.fillStyle = boneWhite;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 32 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = throneDeep;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 2.5 * s, screenPos.y - 33 * s, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(screenPos.x + 2.5 * s, screenPos.y - 33 * s, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - 31 * s);
      ctx.lineTo(screenPos.x - 1 * s, screenPos.y - 29.5 * s);
      ctx.lineTo(screenPos.x + 1 * s, screenPos.y - 29.5 * s);
      ctx.closePath();
      ctx.fill();

      // Eerie red glow from eye sockets
      const eyeGlow = 0.4 + Math.sin(decorTime * 2) * 0.2;
      ctx.fillStyle = `rgba(200,30,30,${eyeGlow})`;
      ctx.beginPath();
      ctx.arc(screenPos.x - 2.5 * s, screenPos.y - 33 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 2.5 * s, screenPos.y - 33 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "ember_rock": {
      const erDark = "#2a1810";
      const erMid = "#3a2818";
      const erLight = "#4a3828";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 5 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heat glow from cracks
      const erGlow = 0.2 + Math.sin(decorTime * 2) * 0.1;
      ctx.fillStyle = `rgba(255,100,0,${erGlow})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 16 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock body - angular
      ctx.fillStyle = erDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 14 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 14 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 14 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Top face
      ctx.fillStyle = erMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 14 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x + 14 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 8 * s);
      ctx.closePath();
      ctx.fill();

      // Glowing cracks
      const crackGlow = 0.6 + Math.sin(decorTime * 3) * 0.2;
      ctx.strokeStyle = `rgba(255,150,30,${crackGlow})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 6 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 14 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 4 * s);
      ctx.stroke();

      // Bright crack centers
      ctx.strokeStyle = `rgba(255,235,59,${crackGlow * 0.7})`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x - 1 * s, screenPos.y - 9 * s);
      ctx.stroke();

      // Small ember particles
      for (let e = 0; e < 3; e++) {
        const ep = (decorTime * 1.5 + e * 0.9) % 2;
        if (ep < 1) {
          const ea = (1 - ep) * 0.6;
          const ex = screenPos.x + (e * 6 - 6) * s + Math.sin(decorTime + e) * 2 * s;
          const ey = screenPos.y - 10 * s - ep * 12 * s;
          ctx.fillStyle = `rgba(255,180,50,${ea})`;
          ctx.beginPath();
          ctx.arc(ex, ey, 1 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case "volcano_rim": {
      const rimDark = "#1a1210";
      const rimMid = "#3a2818";
      const rimLight = "#5a4028";
      const rimLava = "#ff6b00";

      // Outer shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crater rim - isometric ellipse raised
      // Back rim
      ctx.fillStyle = rimDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 6 * s, 24 * s, 12 * s, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Rim sides (raised ring)
      ctx.fillStyle = rimMid;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 24 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner crater hole
      const innerGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, 16 * s);
      const lavaPulse = 0.6 + Math.sin(decorTime * 2) * 0.2;
      innerGrad.addColorStop(0, `rgba(255,235,59,${lavaPulse})`);
      innerGrad.addColorStop(0.3, `rgba(255,152,0,${lavaPulse * 0.8})`);
      innerGrad.addColorStop(0.6, `rgba(244,67,54,${lavaPulse * 0.6})`);
      innerGrad.addColorStop(1, "#1a0a00");
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 16 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rim texture - jagged rocks
      ctx.fillStyle = rimLight;
      const rimRocks = [
        { a: 0, r: 22, h: 8 }, { a: 0.7, r: 23, h: 6 }, { a: 1.4, r: 22, h: 9 },
        { a: 2.1, r: 24, h: 5 }, { a: 2.8, r: 22, h: 7 }, { a: 3.5, r: 23, h: 6 },
        { a: 4.2, r: 22, h: 8 }, { a: 4.9, r: 24, h: 5 }, { a: 5.6, r: 22, h: 7 },
      ];
      rimRocks.forEach(rr => {
        const rx = screenPos.x + Math.cos(rr.a) * rr.r * s;
        const ry = screenPos.y + Math.sin(rr.a) * rr.r * 0.5 * s;
        ctx.fillStyle = rr.h > 7 ? rimLight : rimMid;
        ctx.beginPath();
        ctx.moveTo(rx - 3 * s, ry);
        ctx.lineTo(rx, ry - rr.h * s);
        ctx.lineTo(rx + 3 * s, ry);
        ctx.closePath();
        ctx.fill();
      });

      // Smoke wisps
      for (let sm = 0; sm < 3; sm++) {
        const smokePhase = (decorTime * 0.5 + sm * 1.2) % 3;
        const smokeAlpha = Math.sin(smokePhase / 3 * Math.PI) * 0.15;
        const smx = screenPos.x + Math.sin(decorTime * 0.8 + sm) * 6 * s;
        const smy = screenPos.y - 8 * s - smokePhase * 10 * s;
        ctx.fillStyle = `rgba(80,60,40,${smokeAlpha})`;
        ctx.beginPath();
        ctx.ellipse(smx, smy, (4 + smokePhase * 2) * s, (2 + smokePhase) * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    // === SWAMP DECORATIONS ===
    case "swamp_tree": {
      // Enhanced 3D isometric gnarled swamp tree with hanging moss
      const swampTrunkDark = "#1a1208";
      const swampTrunkMid = "#2a2218";
      const swampTrunkLight = "#3a3228";
      const swampMossLight = "#5a7a4a";
      const swampMossDark = "#3a5a2a";
      const swampFoliage = ["#1a3a1a", "#2a4a2a", "#1a2a1a", "#2a3a2a"];

      // Ground shadow/murky water reflection
      const swampShadowGrad = ctx.createRadialGradient(
        screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
        screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s
      );
      swampShadowGrad.addColorStop(0, "rgba(10,20,10,0.4)");
      swampShadowGrad.addColorStop(0.5, "rgba(20,40,20,0.2)");
      swampShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = swampShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Exposed roots in water
      ctx.strokeStyle = swampTrunkDark;
      ctx.lineWidth = 3 * s;
      for (let r = 0; r < 4; r++) {
        const rootAngle = -0.8 + r * 0.5;
        const rootLen = 12 + r * 3;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + (r - 1.5) * 4 * s, screenPos.y + 4 * s);
        ctx.quadraticCurveTo(
          screenPos.x + Math.cos(rootAngle) * rootLen * 0.5 * s,
          screenPos.y + 6 * s,
          screenPos.x + Math.cos(rootAngle) * rootLen * s,
          screenPos.y + 8 * s
        );
        ctx.stroke();
      }

      // Gnarled trunk with 3D twisted shape - left side (dark)
      ctx.fillStyle = swampTrunkDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 4 * s);
      ctx.bezierCurveTo(
        screenPos.x - 14 * s, screenPos.y - 10 * s,
        screenPos.x - 8 * s, screenPos.y - 25 * s,
        screenPos.x - 6 * s, screenPos.y - 38 * s
      );
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 40 * s);
      ctx.bezierCurveTo(
        screenPos.x - 4 * s, screenPos.y - 20 * s,
        screenPos.x - 6 * s, screenPos.y - 5 * s,
        screenPos.x - 2 * s, screenPos.y + 2 * s
      );
      ctx.closePath();
      ctx.fill();

      // Trunk right side (lighter)
      const trunkGrad = ctx.createLinearGradient(
        screenPos.x, screenPos.y, screenPos.x + 12 * s, screenPos.y - 20 * s
      );
      trunkGrad.addColorStop(0, swampTrunkMid);
      trunkGrad.addColorStop(0.5, swampTrunkLight);
      trunkGrad.addColorStop(1, swampTrunkMid);
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, screenPos.y + 4 * s);
      ctx.bezierCurveTo(
        screenPos.x + 12 * s, screenPos.y - 8 * s,
        screenPos.x + 6 * s, screenPos.y - 22 * s,
        screenPos.x + 4 * s, screenPos.y - 38 * s
      );
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 40 * s);
      ctx.bezierCurveTo(
        screenPos.x + 2 * s, screenPos.y - 18 * s,
        screenPos.x + 4 * s, screenPos.y - 5 * s,
        screenPos.x + 2 * s, screenPos.y + 2 * s
      );
      ctx.closePath();
      ctx.fill();

      // Bark texture knots
      ctx.fillStyle = swampTrunkDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 4 * s, screenPos.y - 15 * s, 3 * s, 4 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 25 * s, 2.5 * s, 3.5 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Dead branches sticking out
      ctx.strokeStyle = swampTrunkMid;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 3 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 35 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 32 * s);
      ctx.stroke();

      // Dark sparse foliage canopy
      const canopyLayers = [
        { x: -8, y: -42, rx: 15, ry: 10 },
        { x: 6, y: -44, rx: 14, ry: 9 },
        { x: -2, y: -50, rx: 12, ry: 8 },
        { x: 10, y: -38, rx: 10, ry: 7 },
      ];

      canopyLayers.forEach((layer, idx) => {
        const canopyGrad = ctx.createRadialGradient(
          screenPos.x + layer.x * s - 3 * s, screenPos.y + layer.y * s - 3 * s, 0,
          screenPos.x + layer.x * s, screenPos.y + layer.y * s, layer.rx * s
        );
        canopyGrad.addColorStop(0, swampFoliage[2]);
        canopyGrad.addColorStop(0.5, swampFoliage[idx % 4]);
        canopyGrad.addColorStop(1, swampFoliage[0]);
        ctx.fillStyle = canopyGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x + layer.x * s, screenPos.y + layer.y * s, layer.rx * s, layer.ry * s, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Hanging Spanish moss strands
      for (let m = 0; m < 8; m++) {
        const mossX = screenPos.x - 18 * s + m * 5 * s;
        const mossStartY = screenPos.y - 35 * s - Math.sin(m) * 10 * s;
        const mossLen = 15 + Math.sin(m * 1.5) * 8;
        const sway = Math.sin(decorTime * 0.8 + m * 0.7) * 4 * s;

        // Moss gradient from attachment point
        const mossGrad = ctx.createLinearGradient(
          mossX, mossStartY, mossX + sway, mossStartY + mossLen * s
        );
        mossGrad.addColorStop(0, swampMossDark);
        mossGrad.addColorStop(0.5, swampMossLight);
        mossGrad.addColorStop(1, swampMossDark);

        ctx.strokeStyle = mossGrad;
        ctx.lineWidth = (1.5 + Math.sin(m) * 0.5) * s;
        ctx.beginPath();
        ctx.moveTo(mossX, mossStartY);
        ctx.bezierCurveTo(
          mossX + sway * 0.3, mossStartY + mossLen * 0.3 * s,
          mossX + sway * 0.7, mossStartY + mossLen * 0.6 * s,
          mossX + sway, mossStartY + mossLen * s
        );
        ctx.stroke();

        // Moss tendrils
        if (m % 2 === 0) {
          ctx.strokeStyle = swampMossDark;
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(mossX + sway * 0.5, mossStartY + mossLen * 0.5 * s);
          ctx.lineTo(mossX + sway * 0.5 + 4 * s, mossStartY + mossLen * 0.7 * s);
          ctx.stroke();
        }
      }

      // Fireflies/wisps around tree
      ctx.fillStyle = `rgba(180,255,180,${0.4 + Math.sin(decorTime * 2) * 0.3})`;
      for (let f = 0; f < 3; f++) {
        const flyX = screenPos.x + Math.sin(decorTime + f * 2) * 15 * s;
        const flyY = screenPos.y - 25 * s + Math.cos(decorTime * 1.3 + f) * 10 * s;
        ctx.beginPath();
        ctx.arc(flyX, flyY, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "mushroom": {
      // Enhanced 3D isometric fantasy mushroom with glowing effects
      const mushroomPalettes = [
        { cap: "#b71c1c", capLight: "#e53935", capDark: "#7f0000", spots: "#ffebee", stem: "#efebe9", stemDark: "#d7ccc8", glow: null },
        { cap: "#6a1b9a", capLight: "#9c27b0", capDark: "#4a148c", spots: "#f3e5f5", stem: "#ede7f6", stemDark: "#d1c4e9", glow: "rgba(156,39,176,0.4)" },
        { cap: "#1b5e20", capLight: "#2e7d32", capDark: "#0d3d11", spots: "#e8f5e9", stem: "#e8f5e9", stemDark: "#c8e6c9", glow: "rgba(76,175,80,0.3)" },
        { cap: "#bf360c", capLight: "#e64a19", capDark: "#8d2804", spots: "#fff3e0", stem: "#efebe9", stemDark: "#d7ccc8", glow: null },
      ];
      const mp = mushroomPalettes[variant % 4];

      // Bioluminescent glow for magical mushrooms
      if (mp.glow) {
        const glowPulse = 0.6 + Math.sin(decorTime * 2) * 0.3;
        const mushroomGlow = ctx.createRadialGradient(
          screenPos.x, screenPos.y - 8 * s, 0,
          screenPos.x, screenPos.y - 8 * s, 22 * s
        );
        mushroomGlow.addColorStop(0, mp.glow.replace("0.4", String(glowPulse * 0.5)));
        mushroomGlow.addColorStop(0.5, mp.glow.replace("0.4", String(glowPulse * 0.2)));
        mushroomGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mushroomGlow;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y - 8 * s, 22 * s, 14 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 4 * s, 12 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stem with 3D cylinder shading
      const stemGrad = ctx.createLinearGradient(
        screenPos.x - 5 * s, screenPos.y, screenPos.x + 5 * s, screenPos.y
      );
      stemGrad.addColorStop(0, mp.stemDark);
      stemGrad.addColorStop(0.3, mp.stem);
      stemGrad.addColorStop(0.7, mp.stem);
      stemGrad.addColorStop(1, mp.stemDark);
      ctx.fillStyle = stemGrad;

      // Curved stem shape
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, screenPos.y + 2 * s);
      ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 4 * s, screenPos.x - 3.5 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 3.5 * s, screenPos.y - 10 * s);
      ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y - 4 * s, screenPos.x + 4 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Stem ring detail
      ctx.strokeStyle = mp.stemDark;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 5 * s, 4 * s, 1.5 * s, 0, 0, Math.PI);
      ctx.stroke();

      // Gills under cap
      ctx.fillStyle = mp.stemDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Gill lines
      ctx.strokeStyle = mp.stem;
      ctx.lineWidth = 0.5 * s;
      for (let g = 0; g < 8; g++) {
        const gillAngle = (g / 8) * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y - 10 * s);
        ctx.lineTo(
          screenPos.x + Math.cos(gillAngle) * 9 * s,
          screenPos.y - 10 * s + Math.sin(gillAngle) * 2.5 * s
        );
        ctx.stroke();
      }

      // Cap with 3D dome shading
      const capGrad = ctx.createRadialGradient(
        screenPos.x - 4 * s, screenPos.y - 18 * s, 0,
        screenPos.x, screenPos.y - 12 * s, 14 * s
      );
      capGrad.addColorStop(0, mp.capLight);
      capGrad.addColorStop(0.4, mp.cap);
      capGrad.addColorStop(0.8, mp.capDark);
      capGrad.addColorStop(1, mp.capDark);
      ctx.fillStyle = capGrad;

      // Cap shape - more mushroom-like dome
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 13 * s, screenPos.y - 10 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 14 * s, screenPos.y - 18 * s,
        screenPos.x - 8 * s, screenPos.y - 22 * s
      );
      ctx.quadraticCurveTo(
        screenPos.x, screenPos.y - 26 * s,
        screenPos.x + 8 * s, screenPos.y - 22 * s
      );
      ctx.quadraticCurveTo(
        screenPos.x + 14 * s, screenPos.y - 18 * s,
        screenPos.x + 13 * s, screenPos.y - 10 * s
      );
      ctx.closePath();
      ctx.fill();

      // Spots on cap with 3D appearance
      const spots = [
        { x: -6, y: -18, r: 2.5 },
        { x: 3, y: -20, r: 2 },
        { x: -2, y: -14, r: 1.8 },
        { x: 7, y: -16, r: 1.5 },
        { x: -8, y: -14, r: 1.3 },
        { x: 1, y: -22, r: 1.2 },
      ];

      spots.forEach((spot) => {
        // Spot shadow
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + spot.x * s + 0.5 * s,
          screenPos.y + spot.y * s + 0.5 * s,
          spot.r * s, spot.r * 0.7 * s, 0, 0, Math.PI * 2
        );
        ctx.fill();
        // Spot
        const spotGrad = ctx.createRadialGradient(
          screenPos.x + spot.x * s - spot.r * 0.3 * s,
          screenPos.y + spot.y * s - spot.r * 0.3 * s,
          0,
          screenPos.x + spot.x * s,
          screenPos.y + spot.y * s,
          spot.r * s
        );
        spotGrad.addColorStop(0, "#ffffff");
        spotGrad.addColorStop(0.5, mp.spots);
        spotGrad.addColorStop(1, mp.stemDark);
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + spot.x * s,
          screenPos.y + spot.y * s,
          spot.r * s, spot.r * 0.7 * s, 0, 0, Math.PI * 2
        );
        ctx.fill();
      });

      // Highlight on cap
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 4 * s, screenPos.y - 20 * s, 5 * s, 3 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Spore particles for magical mushrooms
      if (mp.glow) {
        const sporeAlpha = 0.3 + Math.sin(decorTime * 1.5) * 0.2;
        ctx.fillStyle = mp.glow.replace("0.4", String(sporeAlpha));
        for (let sp = 0; sp < 5; sp++) {
          const sporeY = screenPos.y - 8 * s - ((decorTime * 15 + sp * 8) % 25) * s;
          const sporeX = screenPos.x + Math.sin(decorTime + sp * 1.3) * 8 * s;
          ctx.beginPath();
          ctx.arc(sporeX, sporeY, 1 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "lily_pad": {
      // Enhanced 3D isometric lily pad with water reflections
      const lilyBaseX = screenPos.x;
      const lilyBaseY = screenPos.y;
      const lilyBob = Math.sin(decorTime * 1.5 + variant * 2) * 1.5 * s;

      // Water ripple beneath
      ctx.strokeStyle = "rgba(100,150,100,0.3)";
      ctx.lineWidth = 1 * s;
      const rippleSize = 16 + Math.sin(decorTime * 2 + variant) * 2;
      ctx.beginPath();
      ctx.ellipse(lilyBaseX, lilyBaseY + 2 * s, rippleSize * s, rippleSize * 0.4 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Main pad shadow on water
      ctx.fillStyle = "rgba(20,60,20,0.3)";
      ctx.beginPath();
      ctx.ellipse(lilyBaseX + 1 * s, lilyBaseY + 3 * s + lilyBob, 14 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main lily pad - elliptical for isometric view with notch
      ctx.fillStyle = "#2a6a2a";
      ctx.beginPath();
      ctx.ellipse(lilyBaseX, lilyBaseY + lilyBob, 14 * s, 7 * s, 0, 0.15, Math.PI * 2 - 0.15);
      ctx.lineTo(lilyBaseX, lilyBaseY + lilyBob);
      ctx.closePath();
      ctx.fill();

      // Pad surface gradient (lighter center)
      const padGrad = ctx.createRadialGradient(
        lilyBaseX - 2 * s, lilyBaseY - 2 * s + lilyBob, 0,
        lilyBaseX, lilyBaseY + lilyBob, 12 * s
      );
      padGrad.addColorStop(0, "#4a9a4a");
      padGrad.addColorStop(0.5, "#3a7a3a");
      padGrad.addColorStop(1, "#2a5a2a");
      ctx.fillStyle = padGrad;
      ctx.beginPath();
      ctx.ellipse(lilyBaseX, lilyBaseY + lilyBob, 12 * s, 6 * s, 0, 0.2, Math.PI * 2 - 0.2);
      ctx.lineTo(lilyBaseX, lilyBaseY + lilyBob);
      ctx.closePath();
      ctx.fill();

      // Vein lines radiating from center
      ctx.strokeStyle = "rgba(60,100,60,0.5)";
      ctx.lineWidth = 0.8 * s;
      for (let v = 0; v < 6; v++) {
        const vAngle = (v / 6) * Math.PI * 2 + 0.3;
        if (vAngle > 0.1 && vAngle < Math.PI * 2 - 0.1) {
          ctx.beginPath();
          ctx.moveTo(lilyBaseX, lilyBaseY + lilyBob);
          ctx.lineTo(
            lilyBaseX + Math.cos(vAngle) * 10 * s,
            lilyBaseY + lilyBob + Math.sin(vAngle) * 5 * s
          );
          ctx.stroke();
        }
      }

      // Water droplet highlight
      ctx.fillStyle = "rgba(200,255,200,0.4)";
      ctx.beginPath();
      ctx.ellipse(lilyBaseX - 4 * s, lilyBaseY - 2 * s + lilyBob, 2 * s, 1 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Flower for variant 0
      if (variant === 0) {
        const flowerY = lilyBaseY - 5 * s + lilyBob;
        // Outer petals
        ctx.fillStyle = "#ff7ab5";
        for (let p = 0; p < 6; p++) {
          const pa = (p / 6) * Math.PI * 2 + decorTime * 0.2;
          const petalX = lilyBaseX + Math.cos(pa) * 5 * s;
          const petalY = flowerY + Math.sin(pa) * 2.5 * s;
          ctx.beginPath();
          ctx.ellipse(petalX, petalY, 4 * s, 2.5 * s, pa, 0, Math.PI * 2);
          ctx.fill();
        }
        // Inner petals
        ctx.fillStyle = "#ffaad5";
        for (let p = 0; p < 5; p++) {
          const pa = (p / 5) * Math.PI * 2 + 0.3;
          const petalX = lilyBaseX + Math.cos(pa) * 3 * s;
          const petalY = flowerY + Math.sin(pa) * 1.5 * s;
          ctx.beginPath();
          ctx.ellipse(petalX, petalY, 2.5 * s, 1.5 * s, pa, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = "#ffe033";
        ctx.beginPath();
        ctx.arc(lilyBaseX, flowerY, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        // Pollen dots
        ctx.fillStyle = "#ffaa00";
        for (let d = 0; d < 4; d++) {
          const da = (d / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(lilyBaseX + Math.cos(da) * 1.2 * s, flowerY + Math.sin(da) * 0.8 * s, 0.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "fog_wisp": {
      // Enhanced ethereal swamp fog wisp with layered effects
      const fogBaseX = screenPos.x;
      const fogBaseY = screenPos.y;

      // Multiple layers of drifting fog
      const driftX = Math.sin(decorTime * 0.4 + variant * 1.5) * 15 * s;
      const driftY = Math.cos(decorTime * 0.25 + variant) * 8 * s;
      const breathe = 0.8 + Math.sin(decorTime * 0.6 + variant * 2) * 0.2;

      // Deepest layer (largest, most transparent)
      const fogGrad1 = ctx.createRadialGradient(
        fogBaseX + driftX * 0.5, fogBaseY + driftY * 0.5, 0,
        fogBaseX + driftX * 0.5, fogBaseY + driftY * 0.5, 45 * s * breathe
      );
      fogGrad1.addColorStop(0, `rgba(80,130,80,${0.12 * breathe})`);
      fogGrad1.addColorStop(0.6, `rgba(100,150,100,${0.08 * breathe})`);
      fogGrad1.addColorStop(1, "transparent");
      ctx.fillStyle = fogGrad1;
      ctx.beginPath();
      ctx.ellipse(fogBaseX + driftX * 0.5, fogBaseY + driftY * 0.5, 45 * s * breathe, 22 * s * breathe, driftX * 0.01, 0, Math.PI * 2);
      ctx.fill();

      // Middle layer
      const fogGrad2 = ctx.createRadialGradient(
        fogBaseX + driftX, fogBaseY + driftY, 0,
        fogBaseX + driftX, fogBaseY + driftY, 32 * s * breathe
      );
      fogGrad2.addColorStop(0, `rgba(120,180,120,${0.15 * breathe})`);
      fogGrad2.addColorStop(0.5, `rgba(100,160,100,${0.1 * breathe})`);
      fogGrad2.addColorStop(1, "transparent");
      ctx.fillStyle = fogGrad2;
      ctx.beginPath();
      ctx.ellipse(fogBaseX + driftX, fogBaseY + driftY, 32 * s * breathe, 16 * s * breathe, -driftX * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Top layer (densest core)
      const fogGrad3 = ctx.createRadialGradient(
        fogBaseX + driftX * 1.3, fogBaseY + driftY * 0.8, 0,
        fogBaseX + driftX * 1.3, fogBaseY + driftY * 0.8, 20 * s * breathe
      );
      fogGrad3.addColorStop(0, `rgba(150,200,150,${0.18 * breathe})`);
      fogGrad3.addColorStop(0.7, `rgba(130,180,130,${0.1 * breathe})`);
      fogGrad3.addColorStop(1, "transparent");
      ctx.fillStyle = fogGrad3;
      ctx.beginPath();
      ctx.ellipse(fogBaseX + driftX * 1.3, fogBaseY + driftY * 0.8, 20 * s * breathe, 10 * s * breathe, driftX * 0.015, 0, Math.PI * 2);
      ctx.fill();

      // Subtle ghostly wisps rising
      for (let w = 0; w < 3; w++) {
        const wispPhase = (decorTime * 0.8 + w * 1.2 + variant) % 3;
        const wispAlpha = Math.sin(wispPhase * Math.PI / 3) * 0.12;
        const wispRise = wispPhase * 12 * s;
        const wispDrift = Math.sin(wispPhase + w) * 8 * s;

        ctx.fillStyle = `rgba(180,220,180,${wispAlpha})`;
        ctx.beginPath();
        ctx.ellipse(
          fogBaseX + driftX + wispDrift,
          fogBaseY + driftY - wispRise,
          (8 - wispPhase * 2) * s,
          (4 - wispPhase) * s,
          wispDrift * 0.05,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      break;
    }
    case "witch_cottage": {
      const time = Date.now() / 1000;

      // Color palette
      const woodDark = "#1a1210";
      const woodMid = "#2d1f1a";
      const woodLight = "#3d2a22";
      const woodHighlight = "#4a3328";
      const roofDark = "#1f1a15";
      const roofMid = "#2a2018";
      const roofMoss = "#1a2a1a";
      const glowGreen = "#4aff4a";
      const glowPurple = "#9b4dff";

      // Eerie ambient glow
      const ambientPulse = 0.6 + Math.sin(time * 2) * 0.15;

      // ========== GROUND SHADOW ==========
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 5 * s,
        screenPos.y + 5 * s,
        45 * s,
        18 * s,
        0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // ========== DEAD GROUND / CORRUPTION ==========
      // Corrupted earth around cottage
      const corruptGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        10 * s,
        screenPos.x,
        screenPos.y,
        50 * s
      );
      corruptGrad.addColorStop(0, "rgba(30, 15, 30, 0.6)");
      corruptGrad.addColorStop(0.5, "rgba(20, 25, 15, 0.3)");
      corruptGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = corruptGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        50 * s,
        22 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // ========== BONE FENCE POSTS ==========
      // Scattered bone/stick fence
      for (let i = 0; i < 5; i++) {
        const fenceAngle = -0.6 + i * 0.3;
        const fenceX = screenPos.x - 40 * s + i * 18 * s;
        const fenceY = screenPos.y + 8 * s - Math.abs(i - 2) * 3 * s;
        const lean = Math.sin(i * 1.5) * 0.15;

        ctx.save();
        ctx.translate(fenceX, fenceY);
        ctx.rotate(lean);

        // Gnarled post
        ctx.fillStyle = i % 2 === 0 ? "#3a3530" : "#d4c8b8";
        ctx.beginPath();
        ctx.moveTo(-2 * s, 0);
        ctx.lineTo(-1 * s, -18 * s - Math.sin(i) * 5 * s);
        ctx.lineTo(1 * s, -16 * s - Math.cos(i) * 4 * s);
        ctx.lineTo(2 * s, 0);
        ctx.closePath();
        ctx.fill();

        // Skull on some posts
        if (i === 1 || i === 3) {
          ctx.fillStyle = "#d4c8b8";
          ctx.beginPath();
          ctx.ellipse(0, -20 * s, 4 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Eye sockets
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.arc(-1.5 * s, -21 * s, 1.2 * s, 0, Math.PI * 2);
          ctx.arc(1.5 * s, -21 * s, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();
          // Glow in sockets
          ctx.fillStyle = `rgba(74, 255, 74, ${ambientPulse * 0.5})`;
          ctx.beginPath();
          ctx.arc(-1.5 * s, -21 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.arc(1.5 * s, -21 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ========== FOUNDATION STONES ==========
      ctx.fillStyle = "#252020";
      // Irregular stone foundation
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 32 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 35 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 5 * s);
      ctx.closePath();
      ctx.fill();

      // Foundation stones detail
      ctx.strokeStyle = "#1a1515";
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 25 * s + i * 12 * s, screenPos.y + 3 * s);
        ctx.lineTo(screenPos.x - 22 * s + i * 12 * s, screenPos.y - 3 * s);
        ctx.stroke();
      }

      // ========== MAIN STRUCTURE - CROOKED WALLS ==========
      // Back wall (darker, recessed)
      ctx.fillStyle = woodDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 48 * s);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 55 * s);
      ctx.lineTo(screenPos.x + 35 * s, screenPos.y - 12 * s);
      ctx.closePath();
      ctx.fill();

      // Side wall (angled, shows depth)
      const sideGrad = ctx.createLinearGradient(
        screenPos.x + 18 * s,
        screenPos.y,
        screenPos.x + 38 * s,
        screenPos.y - 20 * s
      );
      sideGrad.addColorStop(0, woodMid);
      sideGrad.addColorStop(0.5, woodLight);
      sideGrad.addColorStop(1, woodDark);
      ctx.fillStyle = sideGrad;

      ctx.beginPath();
      ctx.moveTo(screenPos.x + 18 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 45 * s);
      ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 55 * s);
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y - 12 * s);
      ctx.closePath();
      ctx.fill();

      // Side wall planks
      ctx.strokeStyle = woodDark;
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 4; i++) {
        const plankT = 0.15 + i * 0.22;
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x + 18 * s + plankT * 20 * s,
          screenPos.y - 5 * s - plankT * 7 * s
        );
        ctx.lineTo(
          screenPos.x + 15 * s + plankT * 17 * s,
          screenPos.y - 45 * s - plankT * 10 * s
        );
        ctx.stroke();
      }

      // Front wall
      const frontGrad = ctx.createLinearGradient(
        screenPos.x - 30 * s,
        screenPos.y,
        screenPos.x + 10 * s,
        screenPos.y - 30 * s
      );
      frontGrad.addColorStop(0, woodMid);
      frontGrad.addColorStop(0.3, woodLight);
      frontGrad.addColorStop(0.7, woodMid);
      frontGrad.addColorStop(1, woodDark);
      ctx.fillStyle = frontGrad;

      ctx.beginPath();
      ctx.moveTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 42 * s);
      ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 45 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();

      // Front wall planks (vertical, warped)
      ctx.strokeStyle = woodDark;
      ctx.lineWidth = 1.5 * s;
      for (let i = 0; i < 6; i++) {
        const warp = Math.sin(i * 0.8) * 2 * s;
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x - 25 * s + i * 8 * s + warp,
          screenPos.y - 5 * s
        );
        ctx.quadraticCurveTo(
          screenPos.x - 26 * s + i * 8 * s - warp * 0.5,
          screenPos.y - 25 * s,
          screenPos.x - 24 * s + i * 8 * s + warp * 0.3,
          screenPos.y - 43 * s + i * 0.5 * s
        );
        ctx.stroke();
      }

      // ========== CROOKED DOOR ==========
      // Door frame (darker recess)
      ctx.fillStyle = "#0a0808";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 30 * s);
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();

      // Door (slightly ajar)
      ctx.fillStyle = woodDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 17 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 27 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();

      // Door planks
      ctx.strokeStyle = "#151010";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 13 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 27 * s);
      ctx.stroke();

      // Door handle (bone)
      ctx.fillStyle = "#c8baa8";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 8 * s,
        screenPos.y - 15 * s,
        1.5 * s,
        2.5 * s,
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Eerie glow from inside door gap
      ctx.fillStyle = `rgba(74, 255, 74, ${ambientPulse * 0.4})`;
      ctx.shadowColor = glowGreen;
      ctx.shadowBlur = 8 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x - 3 * s, screenPos.y - 29 * s);
      ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // ========== WINDOWS ==========
      // Main window (glowing)
      ctx.fillStyle = "#0a0808";
      ctx.fillRect(
        screenPos.x + 2 * s,
        screenPos.y - 35 * s,
        12 * s,
        12 * s
      );

      // Window glow
      const windowPulse = 0.7 + Math.sin(time * 2.5 + 1) * 0.2;
      ctx.fillStyle = `rgba(74, 255, 74, ${windowPulse})`;
      ctx.shadowColor = glowGreen;
      ctx.shadowBlur = 15 * s;
      ctx.fillRect(
        screenPos.x + 3 * s,
        screenPos.y - 34 * s,
        10 * s,
        10 * s
      );
      ctx.shadowBlur = 0;

      // Window cross frame
      ctx.strokeStyle = woodDark;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 34 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 24 * s);
      ctx.moveTo(screenPos.x + 3 * s, screenPos.y - 29 * s);
      ctx.lineTo(screenPos.x + 13 * s, screenPos.y - 29 * s);
      ctx.stroke();

      // Silhouette in window (creepy!)
      ctx.fillStyle = `rgba(0, 0, 0, ${0.5 + Math.sin(time * 0.5) * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 8 * s,
        screenPos.y - 30 * s,
        3 * s,
        4 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Eyes in silhouette
      ctx.fillStyle = `rgba(255, 100, 100, ${windowPulse})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + 6.5 * s,
        screenPos.y - 31 * s,
        0.8 * s,
        0,
        Math.PI * 2
      );
      ctx.arc(
        screenPos.x + 9.5 * s,
        screenPos.y - 31 * s,
        0.8 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Small side window
      ctx.fillStyle = "#0a0808";
      ctx.fillRect(
        screenPos.x + 24 * s,
        screenPos.y - 38 * s,
        8 * s,
        8 * s
      );
      ctx.fillStyle = `rgba(155, 77, 255, ${windowPulse * 0.8})`;
      ctx.shadowColor = glowPurple;
      ctx.shadowBlur = 10 * s;
      ctx.fillRect(
        screenPos.x + 25 * s,
        screenPos.y - 37 * s,
        6 * s,
        6 * s
      );
      ctx.shadowBlur = 0;

      // ========== THATCHED ROOF ==========
      // Roof back layer
      ctx.fillStyle = roofDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 35 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 72 * s);
      ctx.lineTo(screenPos.x + 40 * s, screenPos.y - 52 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 42 * s);
      ctx.closePath();
      ctx.fill();

      // Roof front layer
      const roofGrad = ctx.createLinearGradient(
        screenPos.x - 30 * s,
        screenPos.y - 35 * s,
        screenPos.x + 5 * s,
        screenPos.y - 65 * s
      );
      roofGrad.addColorStop(0, roofMid);
      roofGrad.addColorStop(0.4, "#3a3025");
      roofGrad.addColorStop(0.7, roofMid);
      roofGrad.addColorStop(1, roofDark);
      ctx.fillStyle = roofGrad;

      ctx.beginPath();
      ctx.moveTo(screenPos.x - 35 * s, screenPos.y - 40 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 72 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 42 * s);
      ctx.closePath();
      ctx.fill();

      // Thatch texture lines
      ctx.strokeStyle = roofDark;
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 12; i++) {
        const thatchT = i / 12;
        const startX = screenPos.x - 35 * s + thatchT * 55 * s;
        const startY = screenPos.y - 40 * s - thatchT * 2 * s;
        const endX = screenPos.x - 5 * s + thatchT * 25 * s;
        const endY = screenPos.y - 72 * s + thatchT * 30 * s;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Moss patches on roof
      ctx.fillStyle = roofMoss;
      for (let i = 0; i < 4; i++) {
        const mossX =
          screenPos.x - 20 * s + i * 12 * s + Math.sin(i * 2) * 5 * s;
        const mossY = screenPos.y - 48 * s - i * 5 * s;
        ctx.beginPath();
        ctx.ellipse(mossX, mossY, 5 * s, 3 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Overhanging roof edge (thick thatch)
      ctx.fillStyle = "#2a2218";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 38 * s, screenPos.y - 38 * s);
      ctx.lineTo(screenPos.x - 35 * s, screenPos.y - 42 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 43 * s);
      ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 38 * s);
      ctx.closePath();
      ctx.fill();

      // Dripping moss/vines from roof edge
      ctx.strokeStyle = "#1a3018";
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 6; i++) {
        const vineX = screenPos.x - 32 * s + i * 10 * s;
        const vineLen = 8 + Math.sin(i * 1.5) * 4;
        ctx.beginPath();
        ctx.moveTo(vineX, screenPos.y - 38 * s);
        ctx.quadraticCurveTo(
          vineX - 2 * s,
          screenPos.y - 38 * s + vineLen * s * 0.5,
          vineX + Math.sin(i) * 3 * s,
          screenPos.y - 38 * s + vineLen * s
        );
        ctx.stroke();
      }

      // ========== CROOKED CHIMNEY ==========
      // Chimney base
      ctx.fillStyle = "#252020";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 55 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 78 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 80 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 58 * s);
      ctx.closePath();
      ctx.fill();

      // Chimney stones
      ctx.strokeStyle = "#1a1515";
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 4; i++) {
        const stoneY = screenPos.y - 58 * s - i * 6 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 7 * s, stoneY);
        ctx.lineTo(screenPos.x + 19 * s, stoneY - 1 * s);
        ctx.stroke();
      }

      // Chimney cap
      ctx.fillStyle = "#1a1515";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 4 * s, screenPos.y - 78 * s);
      ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 82 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 80 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 76 * s);
      ctx.closePath();
      ctx.fill();

      // Smoke from chimney
      ctx.fillStyle = `rgba(60, 50, 60, ${0.4 + Math.sin(time * 1.5) * 0.15
        })`;
      for (let i = 0; i < 4; i++) {
        const smokeOffset = (time * 8 + i * 20) % 40;
        const smokeX =
          screenPos.x + 13 * s + Math.sin(time * 2 + i) * 4 * s;
        const smokeY = screenPos.y - 82 * s - smokeOffset * s;
        const smokeSize = (3 + i * 1.5 + smokeOffset * 0.15) * s;
        const smokeAlpha = Math.max(0, 0.5 - smokeOffset * 0.012);

        ctx.fillStyle = `rgba(50, 40, 55, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== CAULDRON ==========
      // Cauldron body
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 38 * s,
        screenPos.y - 2 * s,
        10 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 48 * s, screenPos.y - 2 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 48 * s,
        screenPos.y + 8 * s,
        screenPos.x - 38 * s,
        screenPos.y + 10 * s
      );
      ctx.quadraticCurveTo(
        screenPos.x - 28 * s,
        screenPos.y + 8 * s,
        screenPos.x - 28 * s,
        screenPos.y - 2 * s
      );
      ctx.fill();

      // Cauldron rim
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 38 * s,
        screenPos.y - 2 * s,
        10 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Bubbling potion
      const bubbleGlow = 0.8 + Math.sin(time * 4) * 0.2;
      ctx.fillStyle = `rgba(74, 255, 74, ${bubbleGlow * 0.7})`;
      ctx.shadowColor = glowGreen;
      ctx.shadowBlur = 12 * s;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 38 * s,
        screenPos.y - 3 * s,
        8 * s,
        4 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bubbles
      for (let i = 0; i < 5; i++) {
        const bubbleTime = (time * 2 + i * 1.3) % 3;
        const bubbleX =
          screenPos.x - 42 * s + i * 3 * s + Math.sin(i * 2) * 2 * s;
        const bubbleY = screenPos.y - 3 * s - bubbleTime * 4 * s;
        const bubbleSize = (1.5 + Math.sin(i) * 0.5) * s;
        const bubbleAlpha = Math.max(0, 1 - bubbleTime * 0.4);

        ctx.fillStyle = `rgba(150, 255, 150, ${bubbleAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== HANGING ITEMS ==========
      // Rope/chain from roof
      ctx.strokeStyle = "#3a3530";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 38 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 28 * s,
        screenPos.y - 30 * s,
        screenPos.x - 26 * s,
        screenPos.y - 22 * s
      );
      ctx.stroke();

      // Hanging skull
      ctx.fillStyle = "#d4c8b8";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 26 * s,
        screenPos.y - 18 * s,
        4 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Jaw
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 26 * s,
        screenPos.y - 13 * s,
        3 * s,
        2 * s,
        0,
        0,
        Math.PI
      );
      ctx.fill();
      // Eye sockets
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(
        screenPos.x - 28 * s,
        screenPos.y - 19 * s,
        1.5 * s,
        0,
        Math.PI * 2
      );
      ctx.arc(
        screenPos.x - 24 * s,
        screenPos.y - 19 * s,
        1.5 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Second hanging item - herbs/garlic
      ctx.strokeStyle = "#3a3530";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 15 * s, screenPos.y - 43 * s);
      ctx.lineTo(screenPos.x + 16 * s, screenPos.y - 32 * s);
      ctx.stroke();

      // Dried herbs bundle
      ctx.fillStyle = "#4a5540";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 16 * s,
        screenPos.y - 30 * s,
        3 * s,
        5 * s,
        0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#3a4530";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 14 * s, screenPos.y - 32 * s);
      ctx.lineTo(screenPos.x + 13 * s, screenPos.y - 25 * s);
      ctx.moveTo(screenPos.x + 18 * s, screenPos.y - 32 * s);
      ctx.lineTo(screenPos.x + 19 * s, screenPos.y - 25 * s);
      ctx.stroke();

      // ========== COBWEBS ==========
      ctx.strokeStyle = `rgba(200, 200, 200, 0.3)`;
      ctx.lineWidth = 0.5 * s;

      // Corner web
      const webCenterX = screenPos.x - 28 * s;
      const webCenterY = screenPos.y - 42 * s;
      for (let i = 0; i < 6; i++) {
        const webAngle = Math.PI * 0.5 + (i / 6) * Math.PI * 0.7;
        ctx.beginPath();
        ctx.moveTo(webCenterX, webCenterY);
        ctx.lineTo(
          webCenterX + Math.cos(webAngle) * 12 * s,
          webCenterY + Math.sin(webAngle) * 8 * s
        );
        ctx.stroke();
      }
      // Web spirals
      for (let ring = 1; ring < 4; ring++) {
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const webAngle = Math.PI * 0.5 + (i / 6) * Math.PI * 0.7;
          const ringDist = ring * 3.5 * s;
          const x = webCenterX + Math.cos(webAngle) * ringDist;
          const y = webCenterY + Math.sin(webAngle) * ringDist * 0.7;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ========== MUSHROOMS ==========
      // Creepy glowing mushrooms near base
      const mushroomPositions = [
        { x: 28, y: 3 },
        { x: 32, y: 6 },
        { x: -35, y: 8 },
      ];

      mushroomPositions.forEach((pos, i) => {
        const mushX = screenPos.x + pos.x * s;
        const mushY = screenPos.y + pos.y * s;
        const mushGlow = 0.6 + Math.sin(time * 2 + i) * 0.2;

        // Stem
        ctx.fillStyle = "#c8b8a8";
        ctx.beginPath();
        ctx.moveTo(mushX - 1.5 * s, mushY);
        ctx.lineTo(mushX - 1 * s, mushY - 5 * s);
        ctx.lineTo(mushX + 1 * s, mushY - 5 * s);
        ctx.lineTo(mushX + 1.5 * s, mushY);
        ctx.closePath();
        ctx.fill();

        // Cap
        ctx.fillStyle = `rgba(180, 50, 50, ${0.8 + mushGlow * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(
          mushX,
          mushY - 6 * s,
          4 * s,
          2.5 * s,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Glow spots on cap
        ctx.fillStyle = `rgba(255, 200, 100, ${mushGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(mushX - 1.5 * s, mushY - 6 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.arc(mushX + 1 * s, mushY - 7 * s, 0.6 * s, 0, Math.PI * 2);
        ctx.fill();
      });

      break;
    }

    case "cauldron":
      // Large iron pot with volume and bubbling goo
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 3 * s,
        15 * s,
        6 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const iron = "#212121";
      const ironLight = "#424242";

      // Little legs
      ctx.fillStyle = iron;
      ctx.fillRect(screenPos.x - 10 * s, screenPos.y, 3 * s, 4 * s);
      ctx.fillRect(screenPos.x + 7 * s, screenPos.y, 3 * s, 4 * s);

      // Main Pot body (gradient spherical look)
      const potGrad = ctx.createRadialGradient(
        screenPos.x - 5 * s,
        screenPos.y - 15 * s,
        5 * s,
        screenPos.x,
        screenPos.y - 15 * s,
        20 * s
      );
      potGrad.addColorStop(0, ironLight);
      potGrad.addColorStop(1, iron);
      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 15 * s, 18 * s, 0, Math.PI * 2);
      ctx.fill();

      // Rim (thick torus shape)
      ctx.fillStyle = ironLight;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 28 * s,
        18 * s,
        6 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = iron; // inner hole
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 28 * s,
        14 * s,
        4 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Bubbling Goo content
      const gooHeight = Math.sin(decorTime * 3) * 2 * s;
      ctx.fillStyle = "#64DD17";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 26 * s + gooHeight,
        13 * s,
        3.5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Bubbles
      const b1 = Math.sin(decorTime * 5) * 3 * s;
      const b2 = Math.cos(decorTime * 4) * 3 * s;
      ctx.fillStyle = "#B2FF59";
      ctx.beginPath();
      ctx.arc(
        screenPos.x + b1,
        screenPos.y - 28 * s + gooHeight,
        3 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        screenPos.x - b2,
        screenPos.y - 25 * s + gooHeight,
        2 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;

    case "tentacle": {
      // Properly isometric 3D tentacle emerging from murky water
      const tentacleDark = "#4A148C";
      const tentacleMid = "#7B1FA2";
      const tentacleLight = "#9C27B0";
      const tentacleHighlight = "#BA68C8";
      const suckerOuter = "#E1BEE7";
      const suckerInner = "#CE93D8";
      const suckerDeep = "#7B1FA2";

      const sway = Math.sin(decorTime * 1.5 + dec.x) * 12 * s;
      const secondarySway = Math.cos(decorTime * 2.3 + dec.x * 1.5) * 6 * s;
      const segments = 14;

      // Base blends seamlessly with water underneath
      const holeWidth = 18 * s;
      const holeDepth = 9 * s;

      // Outer water disturbance ripples (animated)
      const ripplePhase = decorTime * 1.2 + dec.x;
      for (let r = 0; r < 3; r++) {
        const rippleSize = ((ripplePhase + r * 0.8) % 2) * 12 * s;
        const rippleAlpha = 0.25 * (1 - ((ripplePhase + r * 0.8) % 2) / 2);
        ctx.strokeStyle = `rgba(80, 100, 140, ${rippleAlpha})`;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 2 * s, holeWidth + rippleSize, holeDepth + rippleSize * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Soft water shadow/depth around emergence point
      const waterBlendGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y + 2 * s, holeWidth * 0.3,
        screenPos.x, screenPos.y + 2 * s, holeWidth + 10 * s
      );
      waterBlendGrad.addColorStop(0, "rgba(20, 40, 60, 0.5)");
      waterBlendGrad.addColorStop(0.4, "rgba(30, 50, 70, 0.3)");
      waterBlendGrad.addColorStop(0.7, "rgba(40, 60, 80, 0.15)");
      waterBlendGrad.addColorStop(1, "transparent");
      ctx.fillStyle = waterBlendGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, holeWidth + 10 * s, holeDepth + 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark depth where tentacle enters water
      const holeGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y + 2 * s, holeWidth * 0.9
      );
      holeGrad.addColorStop(0, "rgba(5, 2, 10, 0.9)");
      holeGrad.addColorStop(0.5, "rgba(15, 10, 25, 0.7)");
      holeGrad.addColorStop(0.8, "rgba(30, 25, 50, 0.4)");
      holeGrad.addColorStop(1, "transparent");
      ctx.fillStyle = holeGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, holeWidth, holeDepth, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water surface light reflection near tentacle
      ctx.strokeStyle = "rgba(120, 150, 180, 0.35)";
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 1 * s, holeWidth * 0.7, holeDepth * 0.7, 0, Math.PI * 0.9, Math.PI * 1.7);
      ctx.stroke();

      // Subtle water caustics near base
      ctx.fillStyle = "rgba(100, 130, 160, 0.15)";
      for (let c = 0; c < 4; c++) {
        const causticAngle = (c / 4) * Math.PI * 2 + decorTime * 0.5;
        const causticDist = (holeWidth * 0.6 + Math.sin(decorTime * 2 + c) * 3 * s);
        const cx = screenPos.x + Math.cos(causticAngle) * causticDist;
        const cy = screenPos.y + 2 * s + Math.sin(causticAngle) * causticDist * 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 3 * s, 1.5 * s, causticAngle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bubbles rising from water
      ctx.fillStyle = "rgba(150, 180, 210, 0.5)";
      const bubbleTime = decorTime * 2.5 + dec.x;
      for (let b = 0; b < 4; b++) {
        const bubblePhase = (bubbleTime + b * 0.6) % 2.5;
        const bubbleY = screenPos.y - bubblePhase * 15 * s;
        const bubbleX = screenPos.x + Math.sin(bubbleTime * 2 + b * 1.5) * 5 * s;
        const bubbleSize = (1.5 - bubblePhase * 0.3) * s;
        if (bubblePhase < 2) {
          ctx.globalAlpha = 0.45 * (1 - bubblePhase / 2);
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Calculate 3D tentacle path with proper cylindrical points
      const tentaclePoints: { x: number; y: number; radius: number; angle: number }[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Curved path in 3D space
        const curveX = screenPos.x + sway * t * t + secondarySway * Math.sin(t * Math.PI);
        const curveY = screenPos.y - 65 * s * t;
        const radius = (12 - t * 9.5) * s; // Taper from 12 to 2.5 (thicker)
        const bendAngle = Math.sin(t * Math.PI * 0.8) * 0.4 + sway * 0.01; // Slight rotation as it curves
        tentaclePoints.push({ x: curveX, y: curveY, radius, angle: bendAngle });
      }

      // Draw ground shadow
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#1A0F21";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 10 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw BACK half of tentacle (shadow side) first
      const backGrad = ctx.createLinearGradient(
        screenPos.x - 15 * s, screenPos.y,
        screenPos.x + 5 * s, screenPos.y - 50 * s
      );
      backGrad.addColorStop(0, tentacleDark);
      backGrad.addColorStop(0.5, "#5E1E87");
      backGrad.addColorStop(1, tentacleDark);

      ctx.fillStyle = backGrad;
      ctx.beginPath();
      // Start from base, draw right edge up
      ctx.moveTo(tentaclePoints[0].x, tentaclePoints[0].y);
      for (let i = 0; i <= segments; i++) {
        const p = tentaclePoints[i];
        const wobble = Math.sin(i * 0.6 + decorTime * 2.5) * 0.6 * s;
        // Right edge (back side visible from isometric view)
        ctx.lineTo(p.x + p.radius * 0.9 + wobble, p.y + p.radius * 0.3);
      }
      // Curve around tip
      const tipBack = tentaclePoints[segments];
      ctx.quadraticCurveTo(tipBack.x + 3 * s, tipBack.y - 3 * s, tipBack.x, tipBack.y - 5 * s);
      ctx.quadraticCurveTo(tipBack.x - 1 * s, tipBack.y - 3 * s, tipBack.x - tipBack.radius * 0.3, tipBack.y);
      // Back down the center
      for (let i = segments; i >= 0; i--) {
        const p = tentaclePoints[i];
        ctx.lineTo(p.x, p.y + p.radius * 0.5);
      }
      ctx.closePath();
      ctx.fill();

      // Draw FRONT half of tentacle (lit side)
      const frontGrad = ctx.createLinearGradient(
        screenPos.x - 10 * s, screenPos.y - 30 * s,
        screenPos.x + 15 * s, screenPos.y
      );
      frontGrad.addColorStop(0, tentacleLight);
      frontGrad.addColorStop(0.3, tentacleMid);
      frontGrad.addColorStop(0.7, tentacleLight);
      frontGrad.addColorStop(1, tentacleMid);

      ctx.fillStyle = frontGrad;
      ctx.beginPath();
      ctx.moveTo(tentaclePoints[0].x, tentaclePoints[0].y);
      // Left edge going up (front/lit side)
      for (let i = 0; i <= segments; i++) {
        const p = tentaclePoints[i];
        const wobble = Math.sin(i * 0.6 + decorTime * 2.5 + 0.5) * 0.6 * s;
        ctx.lineTo(p.x - p.radius * 0.9 + wobble, p.y + p.radius * 0.3);
      }
      // Curve around tip
      const tipFront = tentaclePoints[segments];
      ctx.quadraticCurveTo(tipFront.x - 2 * s, tipFront.y - 4 * s, tipFront.x, tipFront.y - 5 * s);
      ctx.quadraticCurveTo(tipFront.x + 1 * s, tipFront.y - 2 * s, tipFront.x, tipFront.y);
      // Back down center
      for (let i = segments; i >= 0; i--) {
        const p = tentaclePoints[i];
        ctx.lineTo(p.x, p.y + p.radius * 0.5);
      }
      ctx.closePath();
      ctx.fill();

      // Highlight stripe on lit side
      ctx.strokeStyle = tentacleHighlight;
      ctx.lineWidth = 3.5 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 1; i < segments - 2; i++) {
        const p = tentaclePoints[i];
        const hx = p.x - p.radius * 0.5;
        const hy = p.y + p.radius * 0.2;
        if (i === 1) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();

      // Secondary highlight
      ctx.strokeStyle = "rgba(225, 190, 231, 0.5)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      for (let i = 2; i < segments - 3; i++) {
        const p = tentaclePoints[i];
        const hx = p.x - p.radius * 0.7;
        const hy = p.y + p.radius * 0.1;
        if (i === 2) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();

      // Muscle/vein lines
      ctx.strokeStyle = tentacleDark;
      ctx.lineWidth = 1.2 * s;
      ctx.globalAlpha = 0.35;
      for (let v = 0; v < 3; v++) {
        ctx.beginPath();
        const offset = (v - 1) * 0.25;
        for (let i = 1; i < segments - 1; i++) {
          const p = tentaclePoints[i];
          const vx = p.x + p.radius * offset;
          const vy = p.y + p.radius * 0.4;
          if (i === 1) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 3D Suckers on the inner curve - more circular shape
      const suckerSpots = [
        { t: 0.12, size: 5.5 },
        { t: 0.22, size: 5 },
        { t: 0.32, size: 4.5 },
        { t: 0.42, size: 4 },
        { t: 0.52, size: 3.5 },
        { t: 0.62, size: 3 },
        { t: 0.72, size: 2.5 },
        { t: 0.82, size: 2 },
      ];

      suckerSpots.forEach((sp) => {
        const idx = Math.floor(sp.t * segments);
        const p = tentaclePoints[idx];
        // Position suckers on the inner curve, facing viewer
        const sx = p.x - p.radius * 0.55;
        const sy = p.y + p.radius * 0.3;
        // More circular suckers (0.85 ratio instead of 0.5)
        const suckerSize = sp.size * s;
        const suckerRatio = 0.85; // Nearly circular

        // Sucker shadow/depth
        ctx.fillStyle = "rgba(74, 20, 140, 0.35)";
        ctx.beginPath();
        ctx.ellipse(sx + 0.8 * s, sy + 0.6 * s, suckerSize, suckerSize * suckerRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer sucker rim with slight 3D rim effect
        const rimGrad = ctx.createRadialGradient(
          sx - suckerSize * 0.2, sy - suckerSize * 0.15, 0,
          sx, sy, suckerSize
        );
        rimGrad.addColorStop(0, "#F3E5F5");
        rimGrad.addColorStop(0.5, suckerOuter);
        rimGrad.addColorStop(1, "#D1C4E9");
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, suckerSize, suckerSize * suckerRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring - concentric circle
        const innerGrad = ctx.createRadialGradient(
          sx - suckerSize * 0.1, sy - suckerSize * 0.08, 0,
          sx, sy, suckerSize * 0.7
        );
        innerGrad.addColorStop(0, "#E1BEE7");
        innerGrad.addColorStop(0.6, suckerInner);
        innerGrad.addColorStop(1, "#AB47BC");
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, suckerSize * 0.68, suckerSize * 0.68 * suckerRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        // Deep center hole
        ctx.fillStyle = suckerDeep;
        ctx.beginPath();
        ctx.ellipse(sx, sy, suckerSize * 0.32, suckerSize * 0.32 * suckerRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darkest center
        ctx.fillStyle = "#38006b";
        ctx.beginPath();
        ctx.ellipse(sx, sy, suckerSize * 0.15, suckerSize * 0.15 * suckerRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight reflection on sucker rim
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.ellipse(sx - suckerSize * 0.3, sy - suckerSize * 0.25 * suckerRatio, suckerSize * 0.18, suckerSize * 0.12, -0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Slime drip
      ctx.fillStyle = "rgba(186, 104, 200, 0.55)";
      const dripPhase = (decorTime * 0.6 + dec.x) % 3;
      if (dripPhase < 1.8) {
        const dripIdx = 4;
        const dripPt = tentaclePoints[dripIdx];
        const dripX = dripPt.x - dripPt.radius * 0.5;
        const dripY = dripPt.y + dripPhase * 8 * s;
        ctx.beginPath();
        ctx.ellipse(dripX, dripY, 1.5 * s, (2 + dripPhase) * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wet sheen where tentacle meets water
      ctx.fillStyle = "rgba(100, 140, 180, 0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 5 * s, 5 * s, 2.5 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Water dripping down tentacle base
      ctx.fillStyle = "rgba(80, 120, 160, 0.2)";
      const dripTime = decorTime * 0.8 + dec.x * 0.5;
      for (let d = 0; d < 2; d++) {
        const dripOffset = (dripTime + d * 1.2) % 2;
        if (dripOffset < 1.5) {
          const dy = screenPos.y - 12 * s + dripOffset * 8 * s;
          const dx = screenPos.x + (d - 0.5) * 6 * s;
          ctx.beginPath();
          ctx.ellipse(dx, dy, 1.2 * s, (1.5 + dripOffset * 0.5) * s, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case "deep_water": {
      // Ultra-detailed isometric deep water pool
      const waterSeed = (dec.x || 0) * 11.3 + (dec.y || 0) * 23.7;
      const isoRatioWater = 0.5;

      // 1. Outer wet ground ring (organic edges)
      const wetGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 20 * s, screenPos.x, screenPos.y, 38 * s);
      wetGrad.addColorStop(0, "transparent");
      wetGrad.addColorStop(0.5, "rgba(20, 50, 80, 0.4)");
      wetGrad.addColorStop(1, "rgba(30, 60, 90, 0.15)");
      ctx.fillStyle = wetGrad;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, 38 * s, 19 * s * isoRatioWater, waterSeed, 0.18);
      ctx.fill();

      // 2. Stone/dirt rim around water (organic)
      ctx.fillStyle = "rgba(60, 55, 50, 0.85)";
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, 32 * s, 16 * s * isoRatioWater, waterSeed + 10, 0.15);
      ctx.fill();

      // 3. Deep water abyss layer (organic shape)
      const deepGradW = ctx.createRadialGradient(screenPos.x, screenPos.y + 4 * s, 0, screenPos.x, screenPos.y, 28 * s);
      deepGradW.addColorStop(0, "rgba(5, 15, 40, 0.98)");
      deepGradW.addColorStop(0.4, "rgba(10, 30, 60, 0.95)");
      deepGradW.addColorStop(0.7, "rgba(20, 50, 90, 0.9)");
      deepGradW.addColorStop(1, "rgba(30, 70, 120, 0.85)");
      ctx.fillStyle = deepGradW;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y, 28 * s, 14 * s * isoRatioWater, waterSeed + 20, 0.12);
      ctx.fill();

      // 4. Surface water layer with slight offset (organic)
      const surfGradW = ctx.createRadialGradient(screenPos.x - 8 * s, screenPos.y - 4 * s, 0, screenPos.x, screenPos.y, 26 * s);
      surfGradW.addColorStop(0, "rgba(80, 150, 200, 0.7)");
      surfGradW.addColorStop(0.4, "rgba(50, 120, 180, 0.5)");
      surfGradW.addColorStop(1, "rgba(30, 80, 140, 0.3)");
      ctx.fillStyle = surfGradW;
      drawOrganicWaterShape(ctx, screenPos.x, screenPos.y - 2 * s, 25 * s, 12.5 * s * isoRatioWater, waterSeed + 30, 0.1);
      ctx.fill();

      // 5. Animated ripples (concentric, moving outward)
      for (let rip = 0; rip < 3; rip++) {
        const ripPhase = (decorTime * 0.6 + rip * 0.33) % 1;
        const ripR = (8 + ripPhase * 16) * s;
        ctx.strokeStyle = `rgba(150, 200, 255, ${0.4 * (1 - ripPhase)})`;
        ctx.lineWidth = (1.5 - ripPhase) * s;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, ripR, ripR * isoRatioWater, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 6. Shimmer highlights (animated)
      ctx.fillStyle = "rgba(200, 230, 255, 0.5)";
      for (let sh = 0; sh < 4; sh++) {
        const shAngle = sh * 0.7 + decorTime * 0.5 + waterSeed * 0.1;
        const shDist = (10 + Math.sin(decorTime + sh) * 5) * s;
        const shX = screenPos.x + Math.cos(shAngle) * shDist * 0.8;
        const shY = screenPos.y + Math.sin(shAngle) * shDist * 0.4 - 2 * s;
        const shSize = (4 + Math.sin(decorTime * 2 + sh * 2) * 2) * s;
        ctx.beginPath();
        ctx.ellipse(shX, shY, shSize, shSize * 0.4, shAngle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Underwater glow from center (mysterious depth)
      const glowPhase = Math.sin(decorTime * 0.8 + waterSeed) * 0.3 + 0.7;
      const underwaterGlow = ctx.createRadialGradient(screenPos.x, screenPos.y + 3 * s, 0, screenPos.x, screenPos.y, 20 * s);
      underwaterGlow.addColorStop(0, `rgba(50, 150, 200, ${0.25 * glowPhase})`);
      underwaterGlow.addColorStop(0.5, `rgba(30, 100, 150, ${0.15 * glowPhase})`);
      underwaterGlow.addColorStop(1, "transparent");
      ctx.fillStyle = underwaterGlow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 18 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // 8. Bubbles rising occasionally
      for (let bub = 0; bub < 3; bub++) {
        const bubPhase = (decorTime * 0.8 + bub * 0.5 + waterSeed * 0.01) % 2;
        if (bubPhase < 1.2) {
          const bubX = screenPos.x + Math.sin(bub * 3 + waterSeed) * 12 * s;
          const bubY = screenPos.y + 5 * s - bubPhase * 18 * s;
          const bubSize = (2 + bub * 0.5) * s * (1 - bubPhase / 1.5);
          ctx.fillStyle = `rgba(180, 220, 255, ${0.6 * (1 - bubPhase / 1.2)})`;
          ctx.beginPath();
          ctx.arc(bubX, bubY, bubSize, 0, Math.PI * 2);
          ctx.fill();
          // Bubble highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * (1 - bubPhase / 1.2)})`;
          ctx.beginPath();
          ctx.arc(bubX - bubSize * 0.3, bubY - bubSize * 0.3, bubSize * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 9. Rocks/pebbles at edge
      ctx.fillStyle = "#4a4540";
      for (let rock = 0; rock < 6; rock++) {
        const rockAngle = (rock / 6) * Math.PI * 2 + Math.sin(waterSeed + rock) * 0.4;
        const rockDist = (26 + Math.sin(rock * 2 + waterSeed) * 4) * s;
        const rockX = screenPos.x + Math.cos(rockAngle) * rockDist;
        const rockY = screenPos.y + Math.sin(rockAngle) * rockDist * isoRatioWater;
        const rockSize = (3 + Math.sin(waterSeed + rock * 3) * 1.5) * s;
        ctx.beginPath();
        ctx.ellipse(rockX, rockY, rockSize, rockSize * 0.6, rockAngle, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "sunken_pillar": {
      const spStone = "#5a6a5a";
      const spStoneDark = "#3a4a3a";
      const spMoss = "#3a5a2a";
      const spWater = "rgba(60,90,60,0.5)";

      // Water around base
      ctx.fillStyle = spWater;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ripples
      ctx.strokeStyle = "rgba(100,140,100,0.3)";
      ctx.lineWidth = 1 * s;
      const ripPhase = (decorTime % 2) / 2;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 10 * s * ripPhase, 4 * s * ripPhase, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Tilted pillar body
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(-0.15);

      // Left face
      ctx.fillStyle = spStoneDark;
      ctx.beginPath();
      ctx.moveTo(-6 * s, 5 * s);
      ctx.lineTo(-5 * s, -40 * s);
      ctx.lineTo(0, -42 * s);
      ctx.lineTo(0, 5 * s);
      ctx.closePath();
      ctx.fill();

      // Right face
      ctx.fillStyle = spStone;
      ctx.beginPath();
      ctx.moveTo(6 * s, 5 * s);
      ctx.lineTo(5 * s, -40 * s);
      ctx.lineTo(0, -42 * s);
      ctx.lineTo(0, 5 * s);
      ctx.closePath();
      ctx.fill();

      // Broken top
      ctx.fillStyle = "#7a8a7a";
      ctx.beginPath();
      ctx.moveTo(-5 * s, -40 * s);
      ctx.lineTo(-3 * s, -44 * s);
      ctx.lineTo(2 * s, -42 * s);
      ctx.lineTo(5 * s, -40 * s);
      ctx.lineTo(3 * s, -38 * s);
      ctx.closePath();
      ctx.fill();

      // Carved bands
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1 * s;
      for (let b = 0; b < 4; b++) {
        const by = -5 * s - b * 9 * s;
        ctx.beginPath();
        ctx.moveTo(-5.5 * s, by);
        ctx.lineTo(5.5 * s, by - 1 * s);
        ctx.stroke();
      }

      // Moss/vines
      ctx.fillStyle = spMoss;
      ctx.beginPath();
      ctx.ellipse(-4 * s, -15 * s, 3 * s, 5 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(3 * s, -25 * s, 2.5 * s, 4 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case "idol_statue": {
      const idolStone = "#5a5a50";
      const idolDark = "#3a3a30";
      const idolGlow = "#4aff4a";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 6 * s, 16 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal
      ctx.fillStyle = idolDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = idolStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
      ctx.lineTo(screenPos.x - 10 * s, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();

      // Idol body - squat tiki-like figure
      ctx.fillStyle = idolStone;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 3 * s);
      ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 25 * s);
      ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 32 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 32 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 25 * s);
      ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 3 * s);
      ctx.closePath();
      ctx.fill();

      // Face - large mouth
      ctx.fillStyle = idolDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x - 3 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 18 * s);
      ctx.lineTo(screenPos.x - 3 * s, screenPos.y - 18 * s);
      ctx.closePath();
      ctx.fill();

      // Glowing eyes
      const idolEyeGlow = 0.5 + Math.sin(decorTime * 2) * 0.3;
      ctx.fillStyle = `rgba(74,255,74,${idolEyeGlow})`;
      ctx.beginPath();
      ctx.arc(screenPos.x - 3 * s, screenPos.y - 24 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 3 * s, screenPos.y - 24 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = idolGlow;
      ctx.beginPath();
      ctx.arc(screenPos.x - 3 * s, screenPos.y - 24 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 3 * s, screenPos.y - 24 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Teeth in mouth
      ctx.fillStyle = "#c0c0b0";
      for (let t = 0; t < 4; t++) {
        const tx = screenPos.x - 3 * s + t * 2 * s;
        ctx.beginPath();
        ctx.moveTo(tx, screenPos.y - 18 * s);
        ctx.lineTo(tx + 1 * s, screenPos.y - 16 * s);
        ctx.lineTo(tx + 2 * s, screenPos.y - 18 * s);
        ctx.fill();
      }

      // Vines growing up
      ctx.strokeStyle = "#2a4a1a";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y);
      ctx.quadraticCurveTo(screenPos.x - 9 * s, screenPos.y - 15 * s, screenPos.x - 6 * s, screenPos.y - 28 * s);
      ctx.stroke();
      break;
    }

    case "glowing_runes": {
      const runeHue = (decorTime * 15) % 360;

      // Ground glow
      const runeGlowGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, 22 * s);
      const rGlow = 0.2 + Math.sin(decorTime * 1.5) * 0.1;
      runeGlowGrad.addColorStop(0, `hsla(${runeHue}, 80%, 60%, ${rGlow})`);
      runeGlowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = runeGlowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 22 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone slab base
      ctx.fillStyle = "#4a4a40";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 16 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
      ctx.lineTo(screenPos.x + 16 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y - 8 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3a3a30";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 16 * s, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 10 * s);
      ctx.lineTo(screenPos.x - 16 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();

      // Rune symbols (glowing)
      const runeAlpha = 0.6 + Math.sin(decorTime * 2) * 0.25;
      ctx.strokeStyle = `hsla(${runeHue}, 80%, 65%, ${runeAlpha})`;
      ctx.lineWidth = 1.5 * s;

      // Circle rune
      ctx.beginPath();
      ctx.arc(screenPos.x - 6 * s, screenPos.y - 1 * s, 3 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y + 2 * s);
      ctx.moveTo(screenPos.x - 9 * s, screenPos.y - 1 * s);
      ctx.lineTo(screenPos.x - 3 * s, screenPos.y - 1 * s);
      ctx.stroke();

      // Triangle rune
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 4 * s);
      ctx.lineTo(screenPos.x + 2 * s, screenPos.y + 1 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 1 * s);
      ctx.closePath();
      ctx.stroke();

      // Spiral rune
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.3) {
        const sr = a * 0.4 * s;
        const sx = screenPos.x + Math.cos(a) * sr;
        const sy = screenPos.y + 3 * s + Math.sin(a) * sr * 0.5;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Floating rune particles
      for (let p = 0; p < 4; p++) {
        const pp = (decorTime + p * 0.8) % 2;
        const pa = Math.sin(pp / 2 * Math.PI) * 0.6;
        const px = screenPos.x + Math.sin(decorTime * 0.7 + p * 1.5) * 10 * s;
        const py = screenPos.y - pp * 8 * s;
        ctx.fillStyle = `hsla(${(runeHue + p * 30) % 360}, 80%, 70%, ${pa})`;
        ctx.beginPath();
        ctx.arc(px, py, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "hanging_cage": {
      const cageMetal = "#5a5a50";
      const cageRust = "#7a5a3a";
      const cageDark = "#3a3a30";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 12 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Post
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(screenPos.x - 2.5 * s, screenPos.y - 50 * s, 5 * s, 55 * s);
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(screenPos.x - 2.5 * s, screenPos.y - 50 * s, 2 * s, 55 * s);

      // Arm extending out
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(screenPos.x - 1 * s, screenPos.y - 50 * s, 16 * s, 3 * s);

      // Chain
      ctx.strokeStyle = cageMetal;
      ctx.lineWidth = 1.5 * s;
      const chainX = screenPos.x + 12 * s;
      ctx.beginPath();
      ctx.moveTo(chainX, screenPos.y - 48 * s);
      ctx.lineTo(chainX, screenPos.y - 32 * s);
      ctx.stroke();

      // Cage body
      const cageTop = screenPos.y - 32 * s;
      const cageBot = screenPos.y - 10 * s;
      const cageW = 8 * s;
      const cageSway = Math.sin(decorTime * 1.2) * 2 * s;

      ctx.save();
      ctx.translate(cageSway, 0);

      // Cage bars
      ctx.strokeStyle = cageRust;
      ctx.lineWidth = 1.2 * s;
      for (let b = 0; b < 6; b++) {
        const angle = (b / 6) * Math.PI * 2;
        const bx = chainX + Math.cos(angle) * cageW;
        const by = (cageTop + cageBot) / 2 + Math.sin(angle) * cageW * 0.4;
        ctx.beginPath();
        ctx.moveTo(chainX, cageTop);
        ctx.quadraticCurveTo(bx, by, chainX, cageBot);
        ctx.stroke();
      }

      // Horizontal ring
      ctx.strokeStyle = cageMetal;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(chainX, (cageTop + cageBot) / 2, cageW, cageW * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Top cap
      ctx.fillStyle = cageDark;
      ctx.beginPath();
      ctx.ellipse(chainX, cageTop, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bottom
      ctx.fillStyle = cageDark;
      ctx.beginPath();
      ctx.ellipse(chainX, cageBot, 4 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Skull inside cage
      ctx.fillStyle = "#d8d0c0";
      ctx.beginPath();
      ctx.arc(chainX, (cageTop + cageBot) / 2 + 2 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a2a20";
      ctx.beginPath();
      ctx.arc(chainX - 1 * s, (cageTop + cageBot) / 2 + 1.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.arc(chainX + 1 * s, (cageTop + cageBot) / 2 + 1.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case "poison_pool": {
      const poisonGreen = "#4caf50";
      const poisonDark = "#2e7d32";
      const poisonBright = "#76ff03";

      // Shadow/stain
      ctx.fillStyle = "rgba(30,80,30,0.25)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 24 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Muddy rim
      ctx.fillStyle = "#3a3a28";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 22 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Poison surface
      const poisonGrad = ctx.createRadialGradient(screenPos.x - 4 * s, screenPos.y - 2 * s, 0, screenPos.x, screenPos.y, 18 * s);
      poisonGrad.addColorStop(0, poisonBright);
      poisonGrad.addColorStop(0.4, poisonGreen);
      poisonGrad.addColorStop(1, poisonDark);
      ctx.fillStyle = poisonGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 18 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated bubbles
      for (let b = 0; b < 4; b++) {
        const bubblePhase = (decorTime * 1.5 + b * 0.7) % 2;
        if (bubblePhase < 1.2) {
          const bSize = (1.5 + bubblePhase * 1.5) * s;
          const bAlpha = 0.6 - bubblePhase * 0.4;
          const bx = screenPos.x + Math.cos(b * 1.7 + decorTime * 0.3) * 8 * s;
          const by = screenPos.y + Math.sin(b * 2.1) * 3 * s - bubblePhase * 3 * s;
          ctx.fillStyle = `rgba(118,255,3,${bAlpha})`;
          ctx.beginPath();
          ctx.arc(bx, by, bSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${bAlpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(bx - bSize * 0.3, by - bSize * 0.3, bSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Toxic vapors rising
      for (let v = 0; v < 3; v++) {
        const vPhase = (decorTime * 0.6 + v * 1.1) % 2.5;
        const vAlpha = Math.sin(vPhase / 2.5 * Math.PI) * 0.12;
        const vx = screenPos.x + Math.sin(decorTime * 0.5 + v * 2) * 8 * s;
        const vy = screenPos.y - 4 * s - vPhase * 10 * s;
        ctx.fillStyle = `rgba(76,175,80,${vAlpha})`;
        ctx.beginPath();
        ctx.ellipse(vx, vy, (3 + vPhase * 2) * s, (1.5 + vPhase) * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dead plant matter at edges
      ctx.fillStyle = "#4a4a20";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 14 * s, screenPos.y + 2 * s, 3 * s, 1.5 * s, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 12 * s, screenPos.y - 1 * s, 2.5 * s, 1.2 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "skeleton_pile": {
      const pileWhite = "#e8e0d0";
      const pileShadow = "#c0b0a0";
      const pileDeep = "#2a2520";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 18 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bone pile base
      const boneSeeds = [
        { dx: -10, dy: 2, rot: 0.3, len: 6 }, { dx: -4, dy: 3, rot: -0.5, len: 5 },
        { dx: 4, dy: 2, rot: 0.8, len: 7 }, { dx: 10, dy: 1, rot: -0.2, len: 5 },
        { dx: -7, dy: 0, rot: 1.2, len: 4 }, { dx: 6, dy: 0, rot: -0.8, len: 6 },
        { dx: -2, dy: -1, rot: 0.1, len: 8 }, { dx: 8, dy: -1, rot: -1.1, len: 5 },
      ];
      boneSeeds.forEach((bone, idx) => {
        ctx.save();
        ctx.translate(screenPos.x + bone.dx * s, screenPos.y + bone.dy * s);
        ctx.rotate(bone.rot);
        ctx.fillStyle = idx % 2 === 0 ? pileWhite : pileShadow;
        ctx.fillRect(-bone.len * s, -0.8 * s, bone.len * 2 * s, 1.6 * s);
        ctx.beginPath();
        ctx.arc(-bone.len * s, 0, 1.5 * s, 0, Math.PI * 2);
        ctx.arc(bone.len * s, 0, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Skulls on top
      const skulls = [
        { dx: -5, dy: -3, sz: 4 }, { dx: 4, dy: -4, sz: 3.5 }, { dx: -1, dy: -6, sz: 4.5 },
      ];
      skulls.forEach(sk => {
        ctx.fillStyle = pileShadow;
        ctx.beginPath();
        ctx.arc(screenPos.x + sk.dx * s, screenPos.y + sk.dy * s, sk.sz * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pileWhite;
        ctx.beginPath();
        ctx.arc(screenPos.x + sk.dx * s - 0.5 * s, screenPos.y + sk.dy * s - 0.5 * s, sk.sz * 0.85 * s, 0, Math.PI * 2);
        ctx.fill();
        // Eye sockets
        ctx.fillStyle = pileDeep;
        ctx.beginPath();
        ctx.arc(screenPos.x + sk.dx * s - 1.2 * s, screenPos.y + sk.dy * s - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.arc(screenPos.x + sk.dx * s + 1.2 * s, screenPos.y + sk.dy * s - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ribcage sticking up
      ctx.strokeStyle = pileShadow;
      ctx.lineWidth = 1.5 * s;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.ellipse(screenPos.x + 8 * s, screenPos.y - 2 * s - r * 3 * s, 4 * s, 2 * s, 0.3, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
      }
      break;
    }

    // === MISC DECORATIONS ===
    case "ruins": {
      // 5 unique ruin variants (variant 4 is original, used for sunken_temple)
      // For sunken_temple level, force variant 4 (original ruins)
      const ruinVariant = selectedMap === "sunken_temple" ? 4 : (variant % 5);
      const stoneBase = "#5a5a5a";
      const stoneDark = "#3a3a3a";
      const stoneLight = "#7a7a7a";
      const mossColor = "#4a5d3a";

      // Ground shadow for all variants
      const shadowGrad = ctx.createRadialGradient(
        screenPos.x + 3 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s
      );
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
      shadowGrad.addColorStop(0.7, "rgba(0,0,0,0.1)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s, 22 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      if (ruinVariant === 0) {
        // VARIANT 0: Broken Roman column with scattered debris
        // Column base
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 12 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 8 * s, 12 * s, 6 * s, 0, 0, Math.PI);
        ctx.fill();

        // Column shaft (broken, angled)
        ctx.fillStyle = stoneBase;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 2 * s);
        ctx.lineTo(screenPos.x - 7 * s, screenPos.y - 35 * s);
        ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 40 * s);
        ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 38 * s);
        ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Column fluting (vertical lines)
        ctx.strokeStyle = stoneDark;
        ctx.lineWidth = 0.5 * s;
        for (let i = -5; i <= 5; i += 2) {
          ctx.beginPath();
          ctx.moveTo(screenPos.x + i * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x + i * s - 1, screenPos.y - 35 * s);
          ctx.stroke();
        }

        // Broken capital piece lying nearby
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 18 * s, screenPos.y + 3 * s);
        ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 2 * s);
        ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 5 * s);
        ctx.lineTo(screenPos.x + 22 * s, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Scattered rubble
        ctx.fillStyle = stoneDark;
        for (let r = 0; r < 5; r++) {
          const rx = screenPos.x - 25 * s + r * 12 * s + Math.sin(r * 2.5) * 8 * s;
          const ry = screenPos.y + 5 * s + Math.cos(r * 1.7) * 5 * s;
          ctx.beginPath();
          ctx.ellipse(rx, ry, (4 + r % 3) * s, (2 + r % 2) * s, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Moss patches
        ctx.fillStyle = mossColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(screenPos.x - 5 * s, screenPos.y - 15 * s, 4 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 5 * s, 3 * s, 2 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

      } else if (ruinVariant === 1) {
        // VARIANT 1: Crumbling archway
        // Left pillar
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 25 * s, screenPos.y + 10 * s);
        ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 30 * s);
        ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 35 * s);
        ctx.lineTo(screenPos.x - 15 * s, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Left pillar highlight
        ctx.fillStyle = stoneBase;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 15 * s, screenPos.y + 8 * s);
        ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 35 * s);
        ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 32 * s);
        ctx.lineTo(screenPos.x - 10 * s, screenPos.y + 10 * s);
        ctx.closePath();
        ctx.fill();

        // Right pillar (broken shorter)
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 15 * s, screenPos.y + 10 * s);
        ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 15 * s);
        ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 18 * s);
        ctx.lineTo(screenPos.x + 25 * s, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = stoneBase;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 25 * s, screenPos.y + 8 * s);
        ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 18 * s);
        ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 15 * s);
        ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 10 * s);
        ctx.closePath();
        ctx.fill();

        // Partial arch connecting
        ctx.strokeStyle = stoneBase;
        ctx.lineWidth = 6 * s;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y - 20 * s, 22 * s, Math.PI * 1.1, Math.PI * 1.6);
        ctx.stroke();

        // Fallen arch stones
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 5 * s, screenPos.y + 2 * s);
        ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 5 * s);
        ctx.lineTo(screenPos.x + 18 * s, screenPos.y + 3 * s);
        ctx.lineTo(screenPos.x + 10 * s, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Scattered debris
        ctx.fillStyle = stoneDark;
        for (let r = 0; r < 4; r++) {
          const rx = screenPos.x - 8 * s + r * 8 * s;
          const ry = screenPos.y + 6 * s + Math.sin(r * 2) * 3 * s;
          ctx.beginPath();
          ctx.ellipse(rx, ry, 3 * s, 1.8 * s, r, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (ruinVariant === 2) {
        // VARIANT 2: Collapsed wall section with vegetation
        // Back wall segment
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 30 * s, screenPos.y + 5 * s);
        ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 25 * s);
        ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 35 * s);
        ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 5 * s);
        ctx.closePath();
        ctx.fill();

        // Wall texture - brick lines
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 0.5 * s;
        for (let row = 0; row < 5; row++) {
          const yOff = -5 - row * 6;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 28 * s, screenPos.y + yOff * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y + (yOff - 8) * s);
          ctx.stroke();
        }

        // Collapsed section (pile of stones)
        ctx.fillStyle = stoneBase;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 8 * s, screenPos.y + 8 * s);
        ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 8 * s);
        ctx.lineTo(screenPos.x + 28 * s, screenPos.y + 2 * s);
        ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 10 * s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(screenPos.x + 12 * s, screenPos.y + 5 * s);
        ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 3 * s);
        ctx.lineTo(screenPos.x + 25 * s, screenPos.y + 4 * s);
        ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Vegetation growing through cracks
        ctx.fillStyle = "#3d5c2a";
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 15 * s);
        ctx.quadraticCurveTo(screenPos.x - 15 * s, screenPos.y - 30 * s, screenPos.x - 8 * s, screenPos.y - 28 * s);
        ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 22 * s, screenPos.x - 10 * s, screenPos.y - 15 * s);
        ctx.fill();

        ctx.fillStyle = "#4a7a35";
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 18 * s);
        ctx.quadraticCurveTo(screenPos.x - 2 * s, screenPos.y - 32 * s, screenPos.x + 3 * s, screenPos.y - 25 * s);
        ctx.quadraticCurveTo(screenPos.x, screenPos.y - 20 * s, screenPos.x - 5 * s, screenPos.y - 18 * s);
        ctx.fill();

        // Ivy tendrils
        ctx.strokeStyle = mossColor;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
        ctx.quadraticCurveTo(screenPos.x - 15 * s, screenPos.y - 5 * s, screenPos.x - 18 * s, screenPos.y + 2 * s);
        ctx.stroke();

      } else if (ruinVariant === 3) {
        // VARIANT 3: Ruined tower base with spiral staircase remains
        // Circular base
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 25 * s, 15 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tower wall remains (partial cylinder)
        ctx.fillStyle = stoneBase;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 22 * s, screenPos.y + 5 * s);
        ctx.lineTo(screenPos.x - 20 * s, screenPos.y - 30 * s);
        ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 38 * s, screenPos.x + 10 * s, screenPos.y - 25 * s);
        ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 3 * s);
        ctx.closePath();
        ctx.fill();

        // Inner darkness (hollow center)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(screenPos.x - 2 * s, screenPos.y, 14 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spiral stair remains
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 2 * s);
        ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 10 * s);
        ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 12 * s);
        ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 12 * s);
        ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 20 * s);
        ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 22 * s);
        ctx.lineTo(screenPos.x, screenPos.y - 15 * s);
        ctx.closePath();
        ctx.fill();

        // Broken top edge detail
        ctx.strokeStyle = stoneDark;
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 30 * s);
        ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 32 * s);
        ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 28 * s);
        ctx.lineTo(screenPos.x, screenPos.y - 32 * s);
        ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 25 * s);
        ctx.stroke();

        // Rubble around base
        ctx.fillStyle = stoneDark;
        for (let r = 0; r < 6; r++) {
          const angle = r * 1.1 + 0.5;
          const rx = screenPos.x + Math.cos(angle) * 28 * s;
          const ry = screenPos.y + Math.sin(angle) * 14 * s + 3 * s;
          ctx.beginPath();
          ctx.ellipse(rx, ry, 4 * s, 2.5 * s, angle, 0, Math.PI * 2);
          ctx.fill();
        }

      } else {
        // VARIANT 4: Properly isometric 3D sunken temple ruins
        // Shadow already drawn above

        const stoneLight = "#8a8a7a";
        const stoneMid = "#6a6a5a";
        const stoneDark = "#4a4a3a";
        const stoneShadow = "#3a3a2a";
        const mossColor = "#3d5a3d";
        const vineColor = "#2d4a2d";
        const waterStainColor = "rgba(40, 80, 90, 0.25)";

        // Isometric floor/foundation - diamond shape
        const floorW = 38 * s;
        const floorD = 19 * s;

        // Floor shadow
        ctx.fillStyle = "rgba(30, 30, 20, 0.25)";
        ctx.beginPath();
        ctx.moveTo(screenPos.x - floorW, screenPos.y + 5 * s);
        ctx.lineTo(screenPos.x, screenPos.y - floorD + 8 * s);
        ctx.lineTo(screenPos.x + floorW, screenPos.y + 5 * s);
        ctx.lineTo(screenPos.x, screenPos.y + floorD + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Stone floor tiles (isometric grid)
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.moveTo(screenPos.x - floorW + 5 * s, screenPos.y + 3 * s);
        ctx.lineTo(screenPos.x, screenPos.y - floorD + 6 * s);
        ctx.lineTo(screenPos.x + floorW - 5 * s, screenPos.y + 3 * s);
        ctx.lineTo(screenPos.x, screenPos.y + floorD + 3 * s);
        ctx.closePath();
        ctx.fill();

        // Floor tile lines
        ctx.strokeStyle = stoneShadow;
        ctx.lineWidth = 0.5 * s;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(screenPos.x + i * 12 * s, screenPos.y - floorD + 6 * s + Math.abs(i) * 5 * s);
          ctx.lineTo(screenPos.x + i * 12 * s, screenPos.y + floorD + 3 * s - Math.abs(i) * 5 * s);
          ctx.stroke();
        }

        // === LEFT WALL (3D isometric box) ===
        const lWallX = screenPos.x - 28 * s;
        const lWallW = 14 * s;  // Width
        const lWallD = 7 * s;   // Depth  
        const lWallH = 38 * s;  // Height

        // Left wall - LEFT face (darkest, shadow)
        const leftFaceGrad = ctx.createLinearGradient(
          lWallX - lWallD, screenPos.y,
          lWallX, screenPos.y
        );
        leftFaceGrad.addColorStop(0, stoneShadow);
        leftFaceGrad.addColorStop(1, stoneDark);
        ctx.fillStyle = leftFaceGrad;
        ctx.beginPath();
        ctx.moveTo(lWallX - lWallD, screenPos.y + 8 * s);
        ctx.lineTo(lWallX - lWallD, screenPos.y - lWallH + 12 * s);
        // Broken top edge
        ctx.lineTo(lWallX - lWallD + 3 * s, screenPos.y - lWallH + 8 * s);
        ctx.lineTo(lWallX - lWallD + 5 * s, screenPos.y - lWallH + 14 * s);
        ctx.lineTo(lWallX, screenPos.y - lWallH + 5 * s);
        ctx.lineTo(lWallX, screenPos.y + 5 * s);
        ctx.closePath();
        ctx.fill();

        // Left wall - FRONT face (medium lit)
        const frontFaceGrad = ctx.createLinearGradient(
          lWallX, screenPos.y - lWallH,
          lWallX + lWallW, screenPos.y
        );
        frontFaceGrad.addColorStop(0, stoneMid);
        frontFaceGrad.addColorStop(0.5, stoneLight);
        frontFaceGrad.addColorStop(1, stoneMid);
        ctx.fillStyle = frontFaceGrad;
        ctx.beginPath();
        ctx.moveTo(lWallX, screenPos.y + 5 * s);
        ctx.lineTo(lWallX, screenPos.y - lWallH + 5 * s);
        // Broken top
        ctx.lineTo(lWallX + 4 * s, screenPos.y - lWallH);
        ctx.lineTo(lWallX + 8 * s, screenPos.y - lWallH + 8 * s);
        ctx.lineTo(lWallX + lWallW, screenPos.y - lWallH + 3 * s);
        ctx.lineTo(lWallX + lWallW, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Left wall - TOP face (brightest)
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(lWallX - lWallD, screenPos.y - lWallH + 12 * s);
        ctx.lineTo(lWallX - lWallD + 3 * s, screenPos.y - lWallH + 8 * s);
        ctx.lineTo(lWallX - lWallD + 5 * s, screenPos.y - lWallH + 14 * s);
        ctx.lineTo(lWallX, screenPos.y - lWallH + 5 * s);
        ctx.lineTo(lWallX + 4 * s, screenPos.y - lWallH);
        ctx.lineTo(lWallX + 8 * s, screenPos.y - lWallH + 8 * s);
        ctx.lineTo(lWallX + lWallW, screenPos.y - lWallH + 3 * s);
        ctx.lineTo(lWallX + lWallW - lWallD, screenPos.y - lWallH);
        ctx.closePath();
        ctx.fill();

        // Brick lines on left wall front face
        ctx.strokeStyle = stoneShadow;
        ctx.lineWidth = 0.5 * s;
        for (let row = 0; row < 6; row++) {
          const rowY = screenPos.y - lWallH + 15 * s + row * 7 * s;
          if (rowY < screenPos.y + 5 * s) {
            ctx.beginPath();
            ctx.moveTo(lWallX + 1 * s, rowY);
            ctx.lineTo(lWallX + lWallW - 1 * s, rowY + 2 * s);
            ctx.stroke();
          }
        }

        // Water stains on left wall
        ctx.fillStyle = waterStainColor;
        ctx.beginPath();
        ctx.moveTo(lWallX + 3 * s, screenPos.y - 15 * s);
        ctx.quadraticCurveTo(lWallX + 5 * s, screenPos.y - 5 * s, lWallX + 2 * s, screenPos.y + 3 * s);
        ctx.lineTo(lWallX + 6 * s, screenPos.y + 3 * s);
        ctx.quadraticCurveTo(lWallX + 8 * s, screenPos.y - 8 * s, lWallX + 7 * s, screenPos.y - 15 * s);
        ctx.closePath();
        ctx.fill();

        // === RIGHT WALL (3D isometric box) ===
        const rWallX = screenPos.x + 15 * s;
        const rWallW = 16 * s;
        const rWallD = 8 * s;
        const rWallH = 32 * s;

        // Right wall - BACK face (visible in iso)
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.moveTo(rWallX + rWallW, screenPos.y + 5 * s);
        ctx.lineTo(rWallX + rWallW, screenPos.y - rWallH + 8 * s);
        ctx.lineTo(rWallX + rWallW + rWallD, screenPos.y - rWallH + 5 * s);
        ctx.lineTo(rWallX + rWallW + rWallD, screenPos.y + 8 * s);
        ctx.closePath();
        ctx.fill();

        // Right wall - FRONT face (brightest)
        const rFrontGrad = ctx.createLinearGradient(
          rWallX, screenPos.y,
          rWallX + rWallW, screenPos.y - rWallH
        );
        rFrontGrad.addColorStop(0, stoneMid);
        rFrontGrad.addColorStop(0.4, stoneLight);
        rFrontGrad.addColorStop(1, stoneMid);
        ctx.fillStyle = rFrontGrad;
        ctx.beginPath();
        ctx.moveTo(rWallX, screenPos.y + 8 * s);
        ctx.lineTo(rWallX, screenPos.y - rWallH + 12 * s);
        // Broken top
        ctx.lineTo(rWallX + 5 * s, screenPos.y - rWallH + 5 * s);
        ctx.lineTo(rWallX + 10 * s, screenPos.y - rWallH + 10 * s);
        ctx.lineTo(rWallX + rWallW, screenPos.y - rWallH + 8 * s);
        ctx.lineTo(rWallX + rWallW, screenPos.y + 5 * s);
        ctx.closePath();
        ctx.fill();

        // Right wall - TOP face
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(rWallX, screenPos.y - rWallH + 12 * s);
        ctx.lineTo(rWallX + 5 * s, screenPos.y - rWallH + 5 * s);
        ctx.lineTo(rWallX + 10 * s, screenPos.y - rWallH + 10 * s);
        ctx.lineTo(rWallX + rWallW, screenPos.y - rWallH + 8 * s);
        ctx.lineTo(rWallX + rWallW + rWallD, screenPos.y - rWallH + 5 * s);
        ctx.lineTo(rWallX + rWallD, screenPos.y - rWallH + 9 * s);
        ctx.closePath();
        ctx.fill();

        // Brick lines on right wall
        ctx.strokeStyle = stoneShadow;
        for (let row = 0; row < 5; row++) {
          const rowY = screenPos.y - rWallH + 18 * s + row * 7 * s;
          if (rowY < screenPos.y + 5 * s) {
            ctx.beginPath();
            ctx.moveTo(rWallX + 1 * s, rowY + 1 * s);
            ctx.lineTo(rWallX + rWallW - 1 * s, rowY - 1 * s);
            ctx.stroke();
          }
        }

        // Ancient carved eye symbol on right wall
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.ellipse(rWallX + 8 * s, screenPos.y - 8 * s, 4 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rWallX + 8 * s, screenPos.y - 8 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.stroke();

        // === CENTRAL BROKEN COLUMN (3D cylinder) ===
        const colX = screenPos.x;
        const colY = screenPos.y;
        const colRadius = 7 * s;
        const colHeight = 42 * s;

        // Column shadow
        ctx.fillStyle = "rgba(30, 30, 20, 0.3)";
        ctx.beginPath();
        ctx.ellipse(colX + 4 * s, colY + 10 * s, colRadius + 4 * s, (colRadius + 4 * s) * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Column base (isometric ellipse)
        ctx.fillStyle = stoneMid;
        ctx.beginPath();
        ctx.ellipse(colX, colY + 6 * s, colRadius + 3 * s, (colRadius + 3 * s) * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Base rim shadow
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.ellipse(colX, colY + 8 * s, colRadius + 3 * s, (colRadius + 3 * s) * 0.5, 0, 0, Math.PI);
        ctx.fill();

        // Column body - back half (shadow)
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.ellipse(colX, colY + 4 * s, colRadius, colRadius * 0.5, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(colX + colRadius, colY - colHeight + 15 * s);
        ctx.ellipse(colX, colY - colHeight + 15 * s, colRadius, colRadius * 0.5, 0, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Column body - front half (lit)
        const colFrontGrad = ctx.createLinearGradient(
          colX - colRadius, colY,
          colX + colRadius, colY
        );
        colFrontGrad.addColorStop(0, stoneMid);
        colFrontGrad.addColorStop(0.3, stoneLight);
        colFrontGrad.addColorStop(0.7, stoneMid);
        colFrontGrad.addColorStop(1, stoneDark);
        ctx.fillStyle = colFrontGrad;
        ctx.beginPath();
        ctx.ellipse(colX, colY + 4 * s, colRadius, colRadius * 0.5, 0, 0, Math.PI);
        ctx.lineTo(colX - colRadius, colY - colHeight + 15 * s);
        ctx.ellipse(colX, colY - colHeight + 15 * s, colRadius, colRadius * 0.5, 0, Math.PI, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        // Column top (broken, jagged)
        ctx.fillStyle = stoneLight;
        ctx.beginPath();
        ctx.moveTo(colX - colRadius, colY - colHeight + 15 * s);
        ctx.lineTo(colX - colRadius + 3 * s, colY - colHeight + 8 * s);
        ctx.lineTo(colX - 2 * s, colY - colHeight + 12 * s);
        ctx.lineTo(colX + 2 * s, colY - colHeight + 5 * s);
        ctx.lineTo(colX + colRadius - 2 * s, colY - colHeight + 10 * s);
        ctx.lineTo(colX + colRadius, colY - colHeight + 15 * s);
        ctx.ellipse(colX, colY - colHeight + 15 * s, colRadius, colRadius * 0.5, 0, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Column fluting (vertical grooves)
        ctx.strokeStyle = stoneShadow;
        ctx.lineWidth = 0.8 * s;
        for (let fl = 0; fl < 5; fl++) {
          const flAngle = (fl / 5) * Math.PI - Math.PI / 2;
          const flX = colX + Math.cos(flAngle) * colRadius * 0.85;
          ctx.beginPath();
          ctx.moveTo(flX, colY + 3 * s);
          ctx.lineTo(flX, colY - colHeight + 16 * s);
          ctx.stroke();
        }

        // Highlight on column
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(colX - colRadius * 0.5, colY + 2 * s);
        ctx.lineTo(colX - colRadius * 0.5, colY - colHeight + 18 * s);
        ctx.stroke();

        // === RUBBLE (3D isometric rocks) ===
        const rubblePositions = [
          { x: -20, y: 8, size: 4 }, { x: -12, y: 10, size: 3 },
          { x: 5, y: 12, size: 5 }, { x: 15, y: 9, size: 3.5 },
          { x: 25, y: 11, size: 4 }, { x: -8, y: 7, size: 2.5 },
          { x: 32, y: 7, size: 3 }, { x: -32, y: 6, size: 3.5 }
        ];

        rubblePositions.forEach((rb, idx) => {
          const rx = screenPos.x + rb.x * s;
          const ry = screenPos.y + rb.y * s;
          const rSize = rb.size * s;

          // 3D rock - top face
          ctx.fillStyle = idx % 2 === 0 ? stoneLight : stoneMid;
          ctx.beginPath();
          ctx.moveTo(rx, ry - rSize * 0.8);
          ctx.lineTo(rx + rSize, ry - rSize * 0.3);
          ctx.lineTo(rx + rSize * 0.3, ry + rSize * 0.2);
          ctx.lineTo(rx - rSize * 0.7, ry - rSize * 0.2);
          ctx.closePath();
          ctx.fill();

          // Front face
          ctx.fillStyle = stoneMid;
          ctx.beginPath();
          ctx.moveTo(rx - rSize * 0.7, ry - rSize * 0.2);
          ctx.lineTo(rx + rSize * 0.3, ry + rSize * 0.2);
          ctx.lineTo(rx + rSize * 0.2, ry + rSize * 0.6);
          ctx.lineTo(rx - rSize * 0.6, ry + rSize * 0.3);
          ctx.closePath();
          ctx.fill();

          // Right face
          ctx.fillStyle = stoneDark;
          ctx.beginPath();
          ctx.moveTo(rx + rSize * 0.3, ry + rSize * 0.2);
          ctx.lineTo(rx + rSize, ry - rSize * 0.3);
          ctx.lineTo(rx + rSize * 0.8, ry + rSize * 0.2);
          ctx.lineTo(rx + rSize * 0.2, ry + rSize * 0.6);
          ctx.closePath();
          ctx.fill();
        });

        // === FALLEN COLUMN SEGMENT ===
        const fallX = screenPos.x + 26 * s;
        const fallY = screenPos.y + 4 * s;
        const fallR = 4 * s;
        const fallLen = 14 * s;

        // Cylinder lying on side (isometric)
        ctx.fillStyle = stoneDark;
        ctx.beginPath();
        ctx.ellipse(fallX + fallLen * 0.7, fallY - fallLen * 0.35, fallR, fallR * 0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Body
        const fallGrad = ctx.createLinearGradient(fallX, fallY - fallR, fallX, fallY + fallR);
        fallGrad.addColorStop(0, stoneLight);
        fallGrad.addColorStop(0.5, stoneMid);
        fallGrad.addColorStop(1, stoneDark);
        ctx.fillStyle = fallGrad;
        ctx.beginPath();
        ctx.moveTo(fallX, fallY - fallR * 0.5);
        ctx.lineTo(fallX + fallLen * 0.7, fallY - fallLen * 0.35 - fallR * 0.5);
        ctx.ellipse(fallX + fallLen * 0.7, fallY - fallLen * 0.35, fallR, fallR * 0.5, 0.8, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(fallX, fallY + fallR * 0.5);
        ctx.ellipse(fallX, fallY, fallR, fallR * 0.5, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fill();

        // End cap
        ctx.fillStyle = stoneMid;
        ctx.beginPath();
        ctx.ellipse(fallX, fallY, fallR, fallR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // === MOSS & VINES ===
        ctx.fillStyle = mossColor;
        ctx.globalAlpha = 0.75;
        // Moss on left wall
        ctx.beginPath();
        ctx.ellipse(lWallX + 5 * s, screenPos.y - 12 * s, 5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Moss on column
        ctx.beginPath();
        ctx.ellipse(colX - 3 * s, colY - 20 * s, 4 * s, 2 * s, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Moss on floor
        ctx.beginPath();
        ctx.ellipse(screenPos.x + 8 * s, screenPos.y + 5 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Hanging vines
        ctx.strokeStyle = vineColor;
        ctx.lineWidth = 1.5 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lWallX + 8 * s, screenPos.y - lWallH + 10 * s);
        ctx.quadraticCurveTo(lWallX + 5 * s, screenPos.y - 15 * s, lWallX + 10 * s, screenPos.y - 5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(colX + 3 * s, colY - colHeight + 10 * s);
        ctx.quadraticCurveTo(colX + 10 * s, colY - 25 * s, colX + 6 * s, colY - 10 * s);
        ctx.stroke();

        // Vine leaves
        ctx.fillStyle = mossColor;
        const leaves = [
          { x: lWallX + 6 * s, y: screenPos.y - 18 * s },
          { x: lWallX + 9 * s, y: screenPos.y - 10 * s },
          { x: colX + 8 * s, y: colY - 22 * s },
          { x: colX + 7 * s, y: colY - 15 * s }
        ];
        leaves.forEach(lf => {
          ctx.beginPath();
          ctx.ellipse(lf.x, lf.y, 2.5 * s, 1.2 * s, 0.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Cracks in stonework
        ctx.strokeStyle = "#2a2a1a";
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(lWallX + 3 * s, screenPos.y - 8 * s);
        ctx.lineTo(lWallX + 6 * s, screenPos.y - 3 * s);
        ctx.lineTo(lWallX + 4 * s, screenPos.y + 2 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rWallX + 5 * s, screenPos.y - 15 * s);
        ctx.lineTo(rWallX + 8 * s, screenPos.y - 10 * s);
        ctx.stroke();
      }
      break;
    }
    case "bones": {
      // Isometric skull-and-crossbones on the ground with 3D shading
      const bnLit = "#f0ebe3";
      const bnMid = "#ddd5c8";
      const bnDrk = "#b8ad9e";
      const bnShd = "#8a7f72";

      // Ground shadow
      const bonesShadow = ctx.createRadialGradient(
        screenPos.x + 1 * s, screenPos.y + 3 * s, 0,
        screenPos.x + 1 * s, screenPos.y + 3 * s, 14 * s
      );
      bonesShadow.addColorStop(0, "rgba(0,0,0,0.2)");
      bonesShadow.addColorStop(0.7, "rgba(0,0,0,0.06)");
      bonesShadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bonesShadow;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 1 * s, screenPos.y + 3 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // === CROSSBONES — two bones crossed, lying flat ===
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(rotation);

      // Bone 1 (bottom-left to top-right)
      // Shadow stroke
      ctx.strokeStyle = bnShd;
      ctx.lineWidth = 2.8 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-10 * s, 5 * s);
      ctx.lineTo(10 * s, -1 * s);
      ctx.stroke();
      // Lit stroke
      ctx.strokeStyle = bnMid;
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(-10 * s, 4.5 * s);
      ctx.lineTo(10 * s, -1.5 * s);
      ctx.stroke();
      // Highlight
      ctx.strokeStyle = bnLit;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(-9 * s, 4 * s);
      ctx.lineTo(9 * s, -2 * s);
      ctx.stroke();
      // Knobs at ends
      ctx.fillStyle = bnShd;
      ctx.beginPath();
      ctx.ellipse(-10 * s, 5 * s, 2.5 * s, 1.8 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bnMid;
      ctx.beginPath();
      ctx.ellipse(-9.5 * s, 4.5 * s, 1.8 * s, 1.3 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bnShd;
      ctx.beginPath();
      ctx.ellipse(10 * s, -1 * s, 2.5 * s, 1.8 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bnLit;
      ctx.beginPath();
      ctx.ellipse(10.5 * s, -1.5 * s, 1.8 * s, 1.3 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Bone 2 (top-left to bottom-right)
      ctx.strokeStyle = bnShd;
      ctx.lineWidth = 2.8 * s;
      ctx.beginPath();
      ctx.moveTo(-10 * s, -1 * s);
      ctx.lineTo(10 * s, 5 * s);
      ctx.stroke();
      ctx.strokeStyle = bnDrk;
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(-10 * s, -1.5 * s);
      ctx.lineTo(10 * s, 4.5 * s);
      ctx.stroke();
      ctx.strokeStyle = bnLit;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(-9 * s, -2 * s);
      ctx.lineTo(9 * s, 4 * s);
      ctx.stroke();
      // Knobs at ends
      ctx.fillStyle = bnShd;
      ctx.beginPath();
      ctx.ellipse(-10 * s, -1 * s, 2.5 * s, 1.8 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bnDrk;
      ctx.beginPath();
      ctx.ellipse(-9.5 * s, -1.5 * s, 1.8 * s, 1.3 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bnShd;
      ctx.beginPath();
      ctx.ellipse(10 * s, 5 * s, 2.5 * s, 1.8 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bnMid;
      ctx.beginPath();
      ctx.ellipse(10.5 * s, 4.5 * s, 1.8 * s, 1.3 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // === SKULL — isometric top-down, sitting on crossbones ===
      const bSkX = screenPos.x;
      const bSkY = screenPos.y - 3 * s;

      // Skull shadow volume
      ctx.fillStyle = bnShd;
      ctx.beginPath();
      ctx.ellipse(bSkX, bSkY + 0.8 * s, 6.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main skull with radial gradient
      const bSkGrad = ctx.createRadialGradient(
        bSkX + 1 * s, bSkY - 1 * s, 0.5 * s,
        bSkX, bSkY, 6 * s
      );
      bSkGrad.addColorStop(0, bnLit);
      bSkGrad.addColorStop(0.4, bnMid);
      bSkGrad.addColorStop(0.8, bnDrk);
      bSkGrad.addColorStop(1, bnShd);
      ctx.fillStyle = bSkGrad;
      ctx.beginPath();
      ctx.ellipse(bSkX, bSkY, 6 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Skull specular highlight
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.ellipse(bSkX + 1.5 * s, bSkY - 1.5 * s, 2.5 * s, 1.5 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Brow ridge
      ctx.fillStyle = bnDrk;
      ctx.beginPath();
      ctx.ellipse(bSkX, bSkY + 0.3 * s, 4.5 * s, 0.8 * s, 0, 0, Math.PI);
      ctx.fill();

      // Eye sockets
      const bLEye = ctx.createRadialGradient(
        bSkX - 2 * s, bSkY + 0.5 * s, 0.2 * s,
        bSkX - 2 * s, bSkY + 0.5 * s, 1.8 * s
      );
      bLEye.addColorStop(0, "#0d0a08");
      bLEye.addColorStop(0.5, "#2d2420");
      bLEye.addColorStop(1, bnShd);
      ctx.fillStyle = bLEye;
      ctx.beginPath();
      ctx.ellipse(bSkX - 2 * s, bSkY + 0.5 * s, 1.8 * s, 1.3 * s, 0.06, 0, Math.PI * 2);
      ctx.fill();

      const bREye = ctx.createRadialGradient(
        bSkX + 2 * s, bSkY + 0.5 * s, 0.2 * s,
        bSkX + 2 * s, bSkY + 0.5 * s, 1.8 * s
      );
      bREye.addColorStop(0, "#0d0a08");
      bREye.addColorStop(0.5, "#3d3430");
      bREye.addColorStop(1, bnDrk);
      ctx.fillStyle = bREye;
      ctx.beginPath();
      ctx.ellipse(bSkX + 2 * s, bSkY + 0.5 * s, 1.8 * s, 1.3 * s, -0.06, 0, Math.PI * 2);
      ctx.fill();

      // Nasal cavity
      ctx.fillStyle = "#2d2420";
      ctx.beginPath();
      ctx.moveTo(bSkX, bSkY + 1.5 * s);
      ctx.lineTo(bSkX - 0.8 * s, bSkY + 2.8 * s);
      ctx.lineTo(bSkX + 0.6 * s, bSkY + 2.8 * s);
      ctx.closePath();
      ctx.fill();

      // Teeth
      ctx.fillStyle = bnLit;
      ctx.strokeStyle = bnShd;
      ctx.lineWidth = 0.25 * s;
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.rect(bSkX + t * 1.1 * s - 0.4 * s, bSkY + 3 * s, 0.8 * s, 0.9 * s);
        ctx.fill();
        ctx.stroke();
      }

      // Skull outline
      ctx.strokeStyle = bnShd;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.ellipse(bSkX, bSkY, 6 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      break;
    }
    case "torch":
      // Stand
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(
        screenPos.x - 2 * s,
        screenPos.y - 20 * s,
        4 * s,
        25 * s
      );
      // Flame
      const flameFlicker = Math.sin(decorTime * 8) * 2 * s;
      ctx.fillStyle = "#ff4400";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 20 * s);
      ctx.quadraticCurveTo(
        screenPos.x + flameFlicker,
        screenPos.y - 35 * s,
        screenPos.x + 5 * s,
        screenPos.y - 20 * s
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff8800";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 3 * s, screenPos.y - 20 * s);
      ctx.quadraticCurveTo(
        screenPos.x - flameFlicker * 0.5,
        screenPos.y - 30 * s,
        screenPos.x + 3 * s,
        screenPos.y - 20 * s
      );
      ctx.closePath();
      ctx.fill();
      // Glow
      ctx.fillStyle = `rgba(255,150,50,${0.15 + Math.sin(decorTime * 6) * 0.05
        })`;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 25 * s, 20 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "statue": {
      // Grayscale stone statue with raised sword
      const stoneLight = "#a8a8a8";
      const stoneMid = "#888888";
      const stoneDark = "#686868";
      const stoneShadow = "#484848";
      const figureHighlight = "#b0b0b0";
      const figureLight = "#909090";
      const figureMid = "#707070";
      const figureDark = "#505050";
      const figureShadow = "#383838";
      const steelLight = "#c8c8c8";
      const steelDark = "#606060";

      // Ground shadow
      const statueShadowGrad = ctx.createRadialGradient(
        screenPos.x + 4 * s, screenPos.y + 8 * s, 0,
        screenPos.x + 4 * s, screenPos.y + 8 * s, 25 * s
      );
      statueShadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
      statueShadowGrad.addColorStop(0.5, "rgba(0,0,0,0.15)");
      statueShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = statueShadowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // ========== STONE PEDESTAL (3-tier, bottom to top) ==========
      const baseY = screenPos.y + 5 * s;

      // === BOTTOM TIER (largest) ===
      const tier1W = 16 * s;
      const tier1H = 6 * s;
      // Top surface
      ctx.fillStyle = stoneLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier1W, baseY - tier1H);
      ctx.lineTo(screenPos.x, baseY - tier1H - tier1W * 0.5);
      ctx.lineTo(screenPos.x + tier1W, baseY - tier1H);
      ctx.lineTo(screenPos.x, baseY - tier1H + tier1W * 0.5);
      ctx.closePath();
      ctx.fill();
      // Left face
      ctx.fillStyle = stoneMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier1W, baseY - tier1H);
      ctx.lineTo(screenPos.x - tier1W, baseY);
      ctx.lineTo(screenPos.x, baseY + tier1W * 0.5);
      ctx.lineTo(screenPos.x, baseY - tier1H + tier1W * 0.5);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = stoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + tier1W, baseY - tier1H);
      ctx.lineTo(screenPos.x + tier1W, baseY);
      ctx.lineTo(screenPos.x, baseY + tier1W * 0.5);
      ctx.lineTo(screenPos.x, baseY - tier1H + tier1W * 0.5);
      ctx.closePath();
      ctx.fill();

      // === MIDDLE TIER ===
      const tier2Y = baseY - tier1H;
      const tier2W = 12 * s;
      const tier2H = 10 * s;
      // Top surface
      ctx.fillStyle = stoneLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier2W, tier2Y - tier2H);
      ctx.lineTo(screenPos.x, tier2Y - tier2H - tier2W * 0.5);
      ctx.lineTo(screenPos.x + tier2W, tier2Y - tier2H);
      ctx.lineTo(screenPos.x, tier2Y - tier2H + tier2W * 0.5);
      ctx.closePath();
      ctx.fill();
      // Left face
      ctx.fillStyle = stoneMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier2W, tier2Y - tier2H);
      ctx.lineTo(screenPos.x - tier2W, tier2Y);
      ctx.lineTo(screenPos.x, tier2Y + tier2W * 0.5);
      ctx.lineTo(screenPos.x, tier2Y - tier2H + tier2W * 0.5);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = stoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + tier2W, tier2Y - tier2H);
      ctx.lineTo(screenPos.x + tier2W, tier2Y);
      ctx.lineTo(screenPos.x, tier2Y + tier2W * 0.5);
      ctx.lineTo(screenPos.x, tier2Y - tier2H + tier2W * 0.5);
      ctx.closePath();
      ctx.fill();

      // Decorative line on middle tier
      ctx.strokeStyle = stoneShadow;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier2W + 2 * s, tier2Y - tier2H * 0.5);
      ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.5 + tier2W * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + tier2W - 2 * s, tier2Y - tier2H * 0.5);
      ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.5 + tier2W * 0.4);
      ctx.stroke();

      // === TOP TIER (smallest, figure stands on this) ===
      const tier3Y = tier2Y - tier2H;
      const tier3W = 8 * s;
      const tier3H = 4 * s;
      // Top surface
      ctx.fillStyle = stoneLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier3W, tier3Y - tier3H);
      ctx.lineTo(screenPos.x, tier3Y - tier3H - tier3W * 0.5);
      ctx.lineTo(screenPos.x + tier3W, tier3Y - tier3H);
      ctx.lineTo(screenPos.x, tier3Y - tier3H + tier3W * 0.5);
      ctx.closePath();
      ctx.fill();
      // Left face
      ctx.fillStyle = stoneMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - tier3W, tier3Y - tier3H);
      ctx.lineTo(screenPos.x - tier3W, tier3Y);
      ctx.lineTo(screenPos.x, tier3Y + tier3W * 0.5);
      ctx.lineTo(screenPos.x, tier3Y - tier3H + tier3W * 0.5);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = stoneDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + tier3W, tier3Y - tier3H);
      ctx.lineTo(screenPos.x + tier3W, tier3Y);
      ctx.lineTo(screenPos.x, tier3Y + tier3W * 0.5);
      ctx.lineTo(screenPos.x, tier3Y - tier3H + tier3W * 0.5);
      ctx.closePath();
      ctx.fill();

      // ========== STONE FIGURE ==========
      const figureBase = tier3Y - tier3H;

      // Legs/Robe base
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, figureBase);
      ctx.lineTo(screenPos.x - 6 * s, figureBase - 18 * s);
      ctx.lineTo(screenPos.x, figureBase - 20 * s);
      ctx.lineTo(screenPos.x, figureBase);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = figureMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, figureBase);
      ctx.lineTo(screenPos.x + 6 * s, figureBase - 18 * s);
      ctx.lineTo(screenPos.x, figureBase - 20 * s);
      ctx.lineTo(screenPos.x, figureBase);
      ctx.closePath();
      ctx.fill();

      // Torso
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 5 * s, figureBase - 18 * s);
      ctx.lineTo(screenPos.x - 4 * s, figureBase - 32 * s);
      ctx.lineTo(screenPos.x, figureBase - 34 * s);
      ctx.lineTo(screenPos.x, figureBase - 20 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = figureMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 5 * s, figureBase - 18 * s);
      ctx.lineTo(screenPos.x + 4 * s, figureBase - 32 * s);
      ctx.lineTo(screenPos.x, figureBase - 34 * s);
      ctx.lineTo(screenPos.x, figureBase - 20 * s);
      ctx.closePath();
      ctx.fill();

      // Cape flowing back
      ctx.fillStyle = figureShadow;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, figureBase - 30 * s);
      ctx.quadraticCurveTo(
        screenPos.x - 12 * s, figureBase - 25 * s,
        screenPos.x - 10 * s, figureBase - 12 * s
      );
      ctx.lineTo(screenPos.x - 6 * s, figureBase - 18 * s);
      ctx.closePath();
      ctx.fill();

      // Left arm (holding shield at side)
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, figureBase - 30 * s);
      ctx.lineTo(screenPos.x - 8 * s, figureBase - 20 * s);
      ctx.lineTo(screenPos.x - 6 * s, figureBase - 19 * s);
      ctx.lineTo(screenPos.x - 3 * s, figureBase - 28 * s);
      ctx.closePath();
      ctx.fill();

      // Shield at side
      ctx.fillStyle = figureMid;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 10 * s, figureBase - 18 * s, 5 * s, 7 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = figureLight;
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 10 * s, figureBase - 18 * s, 3 * s, 4.5 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.arc(screenPos.x - 10 * s, figureBase - 18 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right arm (raised high, holding sword)
      ctx.fillStyle = figureMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 3 * s, figureBase - 30 * s);
      ctx.lineTo(screenPos.x + 10 * s, figureBase - 45 * s);
      ctx.lineTo(screenPos.x + 12 * s, figureBase - 43 * s);
      ctx.lineTo(screenPos.x + 5 * s, figureBase - 28 * s);
      ctx.closePath();
      ctx.fill();

      // Hand gripping sword
      ctx.fillStyle = figureLight;
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 11 * s, figureBase - 44 * s, 2 * s, 1.5 * s, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Sword blade (raised high)
      ctx.fillStyle = steelLight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, figureBase - 46 * s);
      ctx.lineTo(screenPos.x + 8 * s, figureBase - 70 * s);
      ctx.lineTo(screenPos.x + 10 * s, figureBase - 72 * s);
      ctx.lineTo(screenPos.x + 12 * s, figureBase - 70 * s);
      ctx.lineTo(screenPos.x + 12 * s, figureBase - 46 * s);
      ctx.closePath();
      ctx.fill();
      // Blade dark edge
      ctx.fillStyle = steelDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 10 * s, figureBase - 46 * s);
      ctx.lineTo(screenPos.x + 8 * s, figureBase - 70 * s);
      ctx.lineTo(screenPos.x + 10 * s, figureBase - 72 * s);
      ctx.lineTo(screenPos.x + 10 * s, figureBase - 46 * s);
      ctx.closePath();
      ctx.fill();
      // Blade highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 11 * s, figureBase - 48 * s);
      ctx.lineTo(screenPos.x + 10 * s, figureBase - 68 * s);
      ctx.lineTo(screenPos.x + 11 * s, figureBase - 68 * s);
      ctx.lineTo(screenPos.x + 11.5 * s, figureBase - 48 * s);
      ctx.closePath();
      ctx.fill();

      // Sword crossguard
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 7 * s, figureBase - 45 * s);
      ctx.lineTo(screenPos.x + 15 * s, figureBase - 47 * s);
      ctx.lineTo(screenPos.x + 15 * s, figureBase - 45 * s);
      ctx.lineTo(screenPos.x + 7 * s, figureBase - 43 * s);
      ctx.closePath();
      ctx.fill();

      // Head
      const headY = figureBase - 38 * s;
      const headGrad = ctx.createRadialGradient(
        screenPos.x - 1 * s, headY - 2 * s, 0,
        screenPos.x, headY, 6 * s
      );
      headGrad.addColorStop(0, figureHighlight);
      headGrad.addColorStop(0.4, figureLight);
      headGrad.addColorStop(0.8, figureMid);
      headGrad.addColorStop(1, figureDark);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, headY, 5 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Helmet
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, headY - 3 * s, 5.5 * s, 3.5 * s, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // Helmet crest
      ctx.fillStyle = figureShadow;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, headY - 6 * s);
      ctx.lineTo(screenPos.x - 1 * s, headY - 3 * s);
      ctx.lineTo(screenPos.x + 1 * s, headY - 3 * s);
      ctx.closePath();
      ctx.fill();

      // Face features (subtle)
      ctx.fillStyle = figureShadow;
      ctx.beginPath();
      ctx.arc(screenPos.x - 1.5 * s, headY - 1 * s, 0.7 * s, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 1.5 * s, headY - 1 * s, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();

      // Highlights
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.ellipse(screenPos.x - 2 * s, headY - 3 * s, 2 * s, 1.5 * s, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 2 * s, figureBase - 28 * s, 1.5 * s, 3 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal plaque
      ctx.fillStyle = figureDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 6 * s, tier2Y - tier2H * 0.3);
      ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.3 + 3 * s);
      ctx.lineTo(screenPos.x + 6 * s, tier2Y - tier2H * 0.3);
      ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.3 - 3 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
}

function _drawPalmFrondItem(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  angle: number,
  length: number,
  colors: { rib: string; lit: string; dark: string },
  scale: number,
  sway: number
): void {
  const s = scale;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const tipX = baseX + cosA * length + sway;
  const tipY = baseY + sinA * length * 0.55 + length * 0.35;
  const ctrlX = baseX + cosA * length * 0.4;
  const ctrlY = baseY - 4 * s + sinA * 5 * s;

  ctx.strokeStyle = colors.rib;
  ctx.lineWidth = 3.5 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
  ctx.stroke();

  const bladeMaxLen = 14 * s;
  for (let b = 0; b < 6; b++) {
    const t = 0.06 + b * 0.155;
    const mt = 1 - t;
    const px = mt * mt * baseX + 2 * mt * t * ctrlX + t * t * tipX;
    const py = mt * mt * baseY + 2 * mt * t * ctrlY + t * t * tipY;
    const tx = 2 * mt * (ctrlX - baseX) + 2 * t * (tipX - ctrlX);
    const ty2 = 2 * mt * (ctrlY - baseY) + 2 * t * (tipY - ctrlY);
    const tangentAngle = Math.atan2(ty2, tx);
    const cosT = Math.cos(tangentAngle);
    const sinT = Math.sin(tangentAngle);
    const bladeLen = bladeMaxLen * (1 - t * 0.4);
    const spread = 1.4 + t * 0.5;

    for (let side = -1; side <= 1; side += 2) {
      const ba = tangentAngle + side * spread;
      const cosB = Math.cos(ba);
      const sinB = Math.sin(ba);
      ctx.fillStyle = side === 1 ? colors.lit : colors.dark;
      ctx.beginPath();
      ctx.moveTo(px - cosT * 1 * s, py - sinT * 0.5 * s);
      ctx.lineTo(px + cosB * bladeLen, py + sinB * bladeLen * 0.6);
      ctx.lineTo(px + cosT * 1 * s, py + sinT * 0.5 * s);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function _obelHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function _obelDarken(color: string, amount: number): string {
  const rgb = _obelHexToRgb(color);
  if (!rgb) return color;
  return `rgb(${Math.max(0, rgb.r - amount)}, ${Math.max(0, rgb.g - amount)}, ${Math.max(0, rgb.b - amount)})`;
}

function _obelLighten(color: string, amount: number): string {
  const rgb = _obelHexToRgb(color);
  if (!rgb) return color;
  return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`;
}
