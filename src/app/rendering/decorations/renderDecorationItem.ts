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
    case "hut":
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 3,
        screenPos.y + 8 * s,
        28 * s,
        14 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#8d6e63";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 22 * s, screenPos.y + 5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5d4037";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 24 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 28 * s);
      ctx.lineTo(screenPos.x + 24 * s, screenPos.y - 10 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(
        screenPos.x - 5 * s,
        screenPos.y - 5 * s,
        10 * s,
        10 * s
      );
      ctx.fillStyle =
        variant > 1 ? "rgba(255,200,100,0.5)" : "rgba(50,50,50,0.5)";
      ctx.fillRect(screenPos.x + 8 * s, screenPos.y - 8 * s, 6 * s, 5 * s);
      break;
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
    case "skeleton":
      ctx.fillStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 8 * s,
        6 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#424242";
      ctx.beginPath();
      ctx.arc(
        screenPos.x - 2 * s,
        screenPos.y - 9 * s,
        1.5 * s,
        0,
        Math.PI * 2
      );
      ctx.arc(
        screenPos.x + 2 * s,
        screenPos.y - 9 * s,
        1.5 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1.5 * s;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.arc(
          screenPos.x,
          screenPos.y + r * 4 * s,
          5 * s,
          Math.PI * 0.2,
          Math.PI * 0.8
        );
        ctx.stroke();
      }
      break;
    case "barrel":
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 1,
        screenPos.y + 5 * s,
        10 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#6d4c41";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 3 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 3 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4a3525";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 8 * s);
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 2 * s);
      ctx.stroke();
      ctx.fillStyle = "#5d4037";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 12 * s,
        6 * s,
        3 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;
    case "fence":
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(
        screenPos.x - 18 * s,
        screenPos.y + 2 * s,
        36 * s,
        4 * s
      );
      ctx.fillStyle = "#5d4037";
      for (let f = -1; f <= 1; f++)
        ctx.fillRect(
          screenPos.x + f * 15 * s - 2 * s,
          screenPos.y - 15 * s,
          4 * s,
          18 * s
        );
      ctx.fillRect(
        screenPos.x - 18 * s,
        screenPos.y - 12 * s,
        36 * s,
        3 * s
      );
      ctx.fillRect(
        screenPos.x - 18 * s,
        screenPos.y - 5 * s,
        36 * s,
        3 * s
      );
      break;
    case "gravestone":
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 1,
        screenPos.y + 4 * s,
        10 * s,
        5 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#757575";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y + 2 * s);
      ctx.lineTo(screenPos.x - 7 * s, screenPos.y - 10 * s);
      ctx.arc(screenPos.x, screenPos.y - 10 * s, 7 * s, Math.PI, 0);
      ctx.lineTo(screenPos.x + 7 * s, screenPos.y + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#424242";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 12 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 1 * s, screenPos.y);
      ctx.stroke();
      break;
    case "tent":
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + 2,
        screenPos.y + 6 * s,
        22 * s,
        10 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = ["#8b4513", "#6d4c41", "#4e342e", "#3e2723"][variant];
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y + 4 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 20 * s);
      ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 4 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 4 * s);
      ctx.closePath();
      ctx.fill();
      break;
    case "flowers": {
      // Enhanced 3D flowers with detailed petals and stems
      const flowerPalettes = [
        { petals: ["#FF5252", "#FF8A80", "#FFCDD2"], center: "#FFF176", stem: "#2E7D32", stemDark: "#1B5E20" },
        { petals: ["#FFEB3B", "#FFF59D", "#FFFDE7"], center: "#FF8F00", stem: "#558B2F", stemDark: "#33691E" },
        { petals: ["#E040FB", "#EA80FC", "#F3E5F5"], center: "#FFD54F", stem: "#388E3C", stemDark: "#2E7D32" },
        { petals: ["#40C4FF", "#80D8FF", "#E1F5FE"], center: "#FFCA28", stem: "#43A047", stemDark: "#2E7D32" },
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
    case "signpost":
      // Isometric wooden post
      const postW = 4 * s;
      const postH = 25 * s;
      // Ground Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        postW * 1.5,
        postW * 0.8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Post Side (Darker wood)
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(screenPos.x, screenPos.y - postH, postW / 2, postH);
      // Post Front (Lighter wood)
      ctx.fillStyle = "#795548";
      ctx.fillRect(
        screenPos.x - postW / 2,
        screenPos.y - postH + 2 * s,
        postW / 2,
        postH - 2 * s
      );
      // Post Top cap
      ctx.fillStyle = "#8D6E63";
      ctx.beginPath();
      ctx.moveTo(screenPos.x - postW / 2, screenPos.y - postH + 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y - postH);
      ctx.lineTo(screenPos.x + postW / 2, screenPos.y - postH + 2 * s);
      ctx.lineTo(screenPos.x, screenPos.y - postH + 4 * s);
      ctx.fill();

      // The Sign Board (with thickness and angle)
      const signY = screenPos.y - postH + 5 * s;
      ctx.save();
      ctx.translate(screenPos.x, signY);
      ctx.rotate(-0.1); // Slight tilt
      // Sign shadow on post
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-postW / 2, 2 * s, postW, 4 * s);

      // Sign thickness (dark edge)
      ctx.fillStyle = "#4E342E";
      ctx.beginPath();
      ctx.moveTo(-15 * s, 0);
      ctx.lineTo(15 * s, 0);
      ctx.lineTo(15 * s, 8 * s);
      ctx.lineTo(17 * s, 10 * s); // jagged edge
      ctx.lineTo(15 * s, 12 * s);
      ctx.lineTo(-15 * s, 12 * s);
      ctx.lineTo(-17 * s, 6 * s); // jagged edge
      ctx.closePath();
      ctx.fill();
      // Sign Front Face
      ctx.fillStyle = "#8D6E63";
      ctx.fillRect(-15 * s, -2 * s, 30 * s, 12 * s);
      // Wood grain details
      ctx.strokeStyle = "#6D4C41";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(-12 * s, 2 * s);
      ctx.lineTo(10 * s, 2 * s);
      ctx.moveTo(-10 * s, 6 * s);
      ctx.lineTo(12 * s, 6 * s);
      ctx.stroke();
      ctx.restore();
      break;
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
    case "bench":
      // Isometric view needs thickness for seat and legs
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      // Shadow under legs
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 10 * s,
        screenPos.y,
        4 * s,
        2 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        screenPos.x + 10 * s,
        screenPos.y,
        4 * s,
        2 * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const benchColor = "#5D4037";
      const benchDark = "#3E2723";
      const benchLight = "#795548";

      // Front Legs (Darker faces)
      ctx.fillStyle = benchDark;
      ctx.fillRect(screenPos.x - 11 * s, screenPos.y - 8 * s, 2 * s, 8 * s);
      ctx.fillRect(screenPos.x + 9 * s, screenPos.y - 8 * s, 2 * s, 8 * s);
      // Side faces of legs (angled back)
      ctx.fillStyle = benchColor;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 11 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x - 9 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x - 9 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x - 11 * s, screenPos.y);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 9 * s, screenPos.y - 8 * s);
      ctx.lineTo(screenPos.x + 11 * s, screenPos.y - 10 * s);
      ctx.lineTo(screenPos.x + 11 * s, screenPos.y - 2 * s);
      ctx.lineTo(screenPos.x + 9 * s, screenPos.y);
      ctx.fill();

      // Seat support beams
      ctx.fillStyle = benchDark;
      ctx.fillRect(
        screenPos.x - 12 * s,
        screenPos.y - 10 * s,
        24 * s,
        2 * s
      );

      // Seat Slats (Top surface - Light)
      ctx.fillStyle = benchLight;
      for (let i = 0; i < 3; i++) {
        // Offset back slats slightly for isometric depth
        ctx.fillRect(
          screenPos.x - 12 * s + i * s,
          screenPos.y - 12 * s - i * 3 * s,
          24 * s,
          2.5 * s
        );
      }
      // Seat Slats (Front thickness - Dark)
      ctx.fillStyle = benchDark;
      ctx.fillRect(
        screenPos.x - 12 * s,
        screenPos.y - 10 * s,
        24 * s,
        1 * s
      );

      // Backrest frames
      ctx.fillStyle = benchColor;
      ctx.fillRect(
        screenPos.x - 11 * s,
        screenPos.y - 20 * s,
        2 * s,
        10 * s
      );
      ctx.fillRect(
        screenPos.x + 9 * s,
        screenPos.y - 20 * s,
        2 * s,
        10 * s
      );
      // Backrest Slats
      ctx.fillStyle = benchLight;
      ctx.fillRect(
        screenPos.x - 12 * s,
        screenPos.y - 18 * s,
        24 * s,
        3 * s
      );
      ctx.fillRect(
        screenPos.x - 12 * s,
        screenPos.y - 23 * s,
        24 * s,
        3 * s
      );
      break;

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

      // Pole (Cylinder with gradient for roundness)
      const poleGrad = ctx.createLinearGradient(
        screenPos.x - 2 * s,
        0,
        screenPos.x + 2 * s,
        0
      );
      poleGrad.addColorStop(0, metalDark);
      poleGrad.addColorStop(0.5, metalMid);
      poleGrad.addColorStop(1, metalDark);
      ctx.fillStyle = poleGrad;
      ctx.fillRect(
        screenPos.x - 2 * s,
        screenPos.y - 35 * s,
        4 * s,
        31 * s
      );

      // Lamp Head fixture
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 35 * s);
      ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 45 * s);
      ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 45 * s);
      ctx.fill();

      // Glass/Light
      const flicker = 0.1 + Math.sin(decorTime * 3) * 0.05;
      ctx.fillStyle = `rgba(255, 236, 179, ${0.8 + flicker})`;
      ctx.fillRect(screenPos.x - 4 * s, screenPos.y - 44 * s, 8 * s, 8 * s);

      // Glow Effect
      const glowRad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y - 40 * s,
        2 * s,
        screenPos.x,
        screenPos.y - 40 * s,
        25 * s
      );
      glowRad.addColorStop(0, `rgba(255, 213, 79, ${0.4 + flicker})`);
      glowRad.addColorStop(1, "rgba(255, 213, 79, 0)");
      ctx.fillStyle = glowRad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 40 * s, 25 * s, 0, Math.PI * 2);
      ctx.fill();

      // Lamp Top Cap
      ctx.fillStyle = metalMid;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 45 * s);
      ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 45 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 52 * s);
      ctx.fill();
      break;

    // === DESERT DECORATIONS ===
    case "palm": {
      // Enhanced 3D isometric palm tree
      const palmBaseX = screenPos.x;
      const palmBaseY = screenPos.y;

      // Ground shadow with gradient
      const palmShadowGrad = ctx.createRadialGradient(
        palmBaseX + 20 * s, palmBaseY + 8 * s, 0,
        palmBaseX + 20 * s, palmBaseY + 8 * s, 35 * s
      );
      palmShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
      palmShadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = palmShadowGrad;
      ctx.beginPath();
      ctx.ellipse(palmBaseX + 20 * s, palmBaseY + 8 * s, 35 * s, 15 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Curved trunk with gradient for 3D effect
      const trunkGrad = ctx.createLinearGradient(
        palmBaseX - 4 * s, 0, palmBaseX + 6 * s, 0
      );
      trunkGrad.addColorStop(0, "#5a4510");
      trunkGrad.addColorStop(0.5, "#8b6914");
      trunkGrad.addColorStop(1, "#6b5012");
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 8 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(palmBaseX, palmBaseY + 5 * s);
      ctx.bezierCurveTo(
        palmBaseX + 6 * s, palmBaseY - 15 * s,
        palmBaseX + 10 * s, palmBaseY - 35 * s,
        palmBaseX + 5 * s, palmBaseY - 50 * s
      );
      ctx.stroke();

      // Trunk texture bands
      for (let i = 0; i < 8; i++) {
        const ty = palmBaseY - i * 6 * s - 2 * s;
        const tx = palmBaseX + Math.sin(i * 0.3) * 3 * s;
        ctx.strokeStyle = i % 2 === 0 ? "#5a4510" : "#3a2a08";
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(tx, ty, 4 * s, -0.5, Math.PI + 0.5);
        ctx.stroke();
      }

      // Palm fronds (layered for depth)
      const frondColors = ["#1a5a1a", "#228b22", "#2e8b57", "#3cb371"];
      const palmTopX = palmBaseX + 5 * s;
      const palmTopY = palmBaseY - 50 * s;

      // Draw fronds in layers (back to front)
      for (let layer = 0; layer < 2; layer++) {
        const frondCount = layer === 0 ? 5 : 6;
        const layerOffset = layer === 0 ? 0 : Math.PI / 11;

        for (let f = 0; f < frondCount; f++) {
          const baseAngle = (f / frondCount) * Math.PI * 2 + layerOffset;
          const sway = Math.sin(decorTime * 1.5 + f * 0.5) * 0.1;
          const angle = baseAngle + sway;
          const frondLen = (35 - layer * 5) * s;

          // Frond stem
          ctx.strokeStyle = frondColors[layer + 1];
          ctx.lineWidth = (3 - layer * 0.5) * s;
          ctx.lineCap = "round";

          const endX = palmTopX + Math.cos(angle) * frondLen;
          const endY = palmTopY + Math.sin(angle) * frondLen * 0.4 + 15 * s;
          const ctrlX = palmTopX + Math.cos(angle) * frondLen * 0.4;
          const ctrlY = palmTopY - 8 * s + Math.sin(angle) * 5 * s;

          ctx.beginPath();
          ctx.moveTo(palmTopX, palmTopY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.stroke();

          // Leaflets along the frond
          ctx.strokeStyle = frondColors[layer + 2] || frondColors[2];
          ctx.lineWidth = 1 * s;
          for (let l = 0.3; l < 1; l += 0.15) {
            const lx = palmTopX + (endX - palmTopX) * l;
            const ly = palmTopY + (ctrlY - palmTopY) * l * 0.5 + (endY - ctrlY) * l;
            const leafAngle = angle + (l - 0.5) * 0.3;
            const leafLen = 8 * s * (1 - l * 0.5);

            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(
              lx + Math.cos(leafAngle + 0.5) * leafLen,
              ly + Math.sin(leafAngle + 0.5) * leafLen * 0.3
            );
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(
              lx + Math.cos(leafAngle - 0.5) * leafLen,
              ly + Math.sin(leafAngle - 0.5) * leafLen * 0.3
            );
            ctx.stroke();
          }
        }
      }

      // Optional coconuts for some variants
      if (variant < 2) {
        ctx.fillStyle = "#5a3a1a";
        for (let c = 0; c < 3; c++) {
          const cx = palmTopX - 3 * s + c * 4 * s;
          const cy = palmTopY + 3 * s;
          ctx.beginPath();
          ctx.arc(cx, cy, 3 * s, 0, Math.PI * 2);
          ctx.fill();
        }
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
      // Enhanced 3D isometric Egyptian obelisk
      const obelBaseX = screenPos.x;
      const obelBaseY = screenPos.y;

      // Ground shadow
      const obelShadowGrad = ctx.createRadialGradient(
        obelBaseX + 8 * s, obelBaseY + 8 * s, 0,
        obelBaseX + 8 * s, obelBaseY + 8 * s, 18 * s
      );
      obelShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
      obelShadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = obelShadowGrad;
      ctx.beginPath();
      ctx.ellipse(obelBaseX + 8 * s, obelBaseY + 8 * s, 18 * s, 8 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Base pedestal
      ctx.fillStyle = "#6b5a45";
      ctx.beginPath();
      ctx.moveTo(obelBaseX - 12 * s, obelBaseY + 5 * s);
      ctx.lineTo(obelBaseX + 12 * s, obelBaseY + 5 * s);
      ctx.lineTo(obelBaseX + 10 * s, obelBaseY);
      ctx.lineTo(obelBaseX - 10 * s, obelBaseY);
      ctx.closePath();
      ctx.fill();

      // Right face (lit side)
      ctx.fillStyle = "#a08868";
      ctx.beginPath();
      ctx.moveTo(obelBaseX + 2 * s, obelBaseY);
      ctx.lineTo(obelBaseX + 9 * s, obelBaseY);
      ctx.lineTo(obelBaseX + 7 * s, obelBaseY - 45 * s);
      ctx.lineTo(obelBaseX, obelBaseY - 55 * s);
      ctx.lineTo(obelBaseX, obelBaseY - 45 * s);
      ctx.closePath();
      ctx.fill();

      // Left face (shaded side)
      ctx.fillStyle = "#7a6850";
      ctx.beginPath();
      ctx.moveTo(obelBaseX - 2 * s, obelBaseY);
      ctx.lineTo(obelBaseX - 9 * s, obelBaseY);
      ctx.lineTo(obelBaseX - 7 * s, obelBaseY - 45 * s);
      ctx.lineTo(obelBaseX, obelBaseY - 55 * s);
      ctx.lineTo(obelBaseX, obelBaseY - 45 * s);
      ctx.closePath();
      ctx.fill();

      // Pyramidion (gold cap)
      ctx.fillStyle = "#d4a840";
      ctx.beginPath();
      ctx.moveTo(obelBaseX, obelBaseY - 55 * s);
      ctx.lineTo(obelBaseX - 5 * s, obelBaseY - 48 * s);
      ctx.lineTo(obelBaseX + 5 * s, obelBaseY - 48 * s);
      ctx.closePath();
      ctx.fill();

      // Gold cap highlight
      ctx.fillStyle = "#f0c850";
      ctx.beginPath();
      ctx.moveTo(obelBaseX, obelBaseY - 55 * s);
      ctx.lineTo(obelBaseX + 5 * s, obelBaseY - 48 * s);
      ctx.lineTo(obelBaseX + 2 * s, obelBaseY - 50 * s);
      ctx.closePath();
      ctx.fill();

      // Hieroglyphic carvings (more detailed)
      ctx.fillStyle = "#5a4a38";
      // Left side glyphs
      for (let h = 0; h < 5; h++) {
        const hy = obelBaseY - 40 * s + h * 8 * s;
        // Varied glyph shapes
        if (h % 3 === 0) {
          // Eye shape
          ctx.beginPath();
          ctx.ellipse(obelBaseX - 5 * s, hy, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obelBaseX - 5 * s, hy, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        } else if (h % 3 === 1) {
          // Ankh shape
          ctx.beginPath();
          ctx.ellipse(obelBaseX - 5 * s, hy - 1 * s, 1.5 * s, 1 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(obelBaseX - 5.5 * s, hy, 1 * s, 3 * s);
          ctx.fillRect(obelBaseX - 6.5 * s, hy + 1 * s, 3 * s, 0.8 * s);
        } else {
          // Rectangle glyph
          ctx.fillRect(obelBaseX - 6.5 * s, hy, 3 * s, 1.5 * s);
        }
      }

      // Right side glyphs
      ctx.fillStyle = "#6a5a48";
      for (let h = 0; h < 5; h++) {
        const hy = obelBaseY - 38 * s + h * 8 * s;
        if (h % 2 === 0) {
          ctx.fillRect(obelBaseX + 3 * s, hy, 3 * s, 1.5 * s);
        } else {
          ctx.beginPath();
          ctx.arc(obelBaseX + 4.5 * s, hy, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Edge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(obelBaseX, obelBaseY - 55 * s);
      ctx.lineTo(obelBaseX + 7 * s, obelBaseY - 45 * s);
      ctx.stroke();
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
    case "sphinx":
      const sandBase = "#C2B280";
      const sandShadow = "#A09060";
      const sandHighlight = "#D4C490";

      // Large Pedestal Base (Isometric Block)
      // Top face
      ctx.fillStyle = sandBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y - 15 * s);
      ctx.lineTo(screenPos.x + 30 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.fill();
      // Front face (darker)
      ctx.fillStyle = sandShadow;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 15 * s);
      ctx.lineTo(screenPos.x - 30 * s, screenPos.y + 5 * s);
      ctx.fill();
      // Side face (medium)
      ctx.fillStyle = sandBase;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x + 30 * s, screenPos.y - 5 * s);
      ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 5 * s);
      ctx.lineTo(screenPos.x, screenPos.y + 15 * s);
      ctx.fill();

      // Body (Lion shape roughly)
      ctx.fillStyle = sandShadow; // Back haunch shadow
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x - 15 * s,
        screenPos.y - 15 * s,
        12 * s,
        8 * s,
        -0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = sandBase; // Main body
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
      ctx.quadraticCurveTo(
        screenPos.x,
        screenPos.y - 30 * s,
        screenPos.x + 25 * s,
        screenPos.y - 15 * s
      ); // Back to front
      ctx.lineTo(screenPos.x + 30 * s, screenPos.y - 5 * s); // Paws
      ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 5 * s);
      ctx.fill();

      // Head and Nemes (Headdress)
      const headY = screenPos.y - 25 * s;
      // Headdress back
      ctx.fillStyle = sandHighlight;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15 * s, headY + 10 * s);
      ctx.lineTo(screenPos.x - 18 * s, headY - 5 * s);
      ctx.quadraticCurveTo(
        screenPos.x,
        headY - 15 * s,
        screenPos.x + 18 * s,
        headY - 5 * s
      );
      ctx.lineTo(screenPos.x + 15 * s, headY + 10 * s);
      ctx.fill();
      // Face
      ctx.fillStyle = sandBase;
      ctx.fillRect(screenPos.x - 8 * s, headY - 5 * s, 16 * s, 14 * s);
      // Stripes on headdress
      ctx.strokeStyle = sandShadow;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 16 * s, headY - 2 * s);
      ctx.lineTo(screenPos.x - 8 * s, headY - 5 * s);
      ctx.moveTo(screenPos.x + 16 * s, headY - 2 * s);
      ctx.lineTo(screenPos.x + 8 * s, headY - 5 * s);
      ctx.stroke();
      break;
    case "oasis_pool": {
      const time = Date.now() / 1000;

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
      ctx.beginPath();
      ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s, 20 * s, 0.05, 0, Math.PI * 2);
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

      ctx.fillStyle = sandGrad;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 40 * s, screenPos.y - 2 * s);
      ctx.bezierCurveTo(
        screenPos.x - 25 * s, screenPos.y - 18 * s,
        screenPos.x + 15 * s, screenPos.y - 16 * s,
        screenPos.x + 38 * s, screenPos.y - 4 * s
      );
      ctx.bezierCurveTo(
        screenPos.x + 45 * s, screenPos.y + 8 * s,
        screenPos.x + 25 * s, screenPos.y + 20 * s,
        screenPos.x, screenPos.y + 18 * s
      );
      ctx.bezierCurveTo(
        screenPos.x - 30 * s, screenPos.y + 16 * s,
        screenPos.x - 45 * s, screenPos.y + 8 * s,
        screenPos.x - 40 * s, screenPos.y - 2 * s
      );
      ctx.fill();

      // Sand bank 3D edge (thickness illusion)
      ctx.fillStyle = sandDark;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 38 * s, screenPos.y + 2 * s);
      ctx.bezierCurveTo(
        screenPos.x - 35 * s, screenPos.y + 18 * s,
        screenPos.x + 30 * s, screenPos.y + 22 * s,
        screenPos.x + 40 * s, screenPos.y + 2 * s
      );
      ctx.lineTo(screenPos.x + 38 * s, screenPos.y - 2 * s);
      ctx.bezierCurveTo(
        screenPos.x + 28 * s, screenPos.y + 16 * s,
        screenPos.x - 32 * s, screenPos.y + 14 * s,
        screenPos.x - 38 * s, screenPos.y - 1 * s
      );
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
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 30 * s, 13 * s, 0.08, 0, Math.PI * 2);
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
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 29 * s, 12.5 * s, 0.08, 0, Math.PI * 2);
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

    // === VOLCANIC DECORATIONS ===
    case "lava_pool": {
      // Enhanced 3D isometric lava pool with animated molten effects
      const lavaYellow = "#ffeb3b";
      const lavaOrange = "#ff9800";
      const lavaRed = "#f44336";
      const lavaDark = "#bf360c";
      const rockDark = "#1a1210";
      const rockMid = "#2a1a10";

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
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 45 * s, 25 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer rock rim with 3D depth
      // Rock rim back
      ctx.fillStyle = rockDark;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 3 * s, 32 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock rim front edge
      ctx.fillStyle = rockMid;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 32 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner dark crater
      ctx.fillStyle = "#0a0505";
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 1 * s, 26 * s, 13 * s, 0, 0, Math.PI * 2);
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
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - 1 * s, 24 * s, 12 * s, 0, 0, Math.PI * 2);
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

      // Helper for organic blob edges (water-specific)
      const drawWaterBlob = (cx: number, cy: number, rx: number, ry: number, seed: number, bumpy: number = 0.12) => {
        ctx.beginPath();
        const pts = 20;
        for (let i = 0; i <= pts; i++) {
          const ang = (i / pts) * Math.PI * 2;
          const n1 = Math.sin(ang * 3 + seed) * bumpy;
          const n2 = Math.sin(ang * 5 + seed * 2.1) * bumpy * 0.5;
          const variation = 1 + n1 + n2;
          const x = cx + Math.cos(ang) * rx * variation;
          const y = cy + Math.sin(ang) * ry * variation;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      };

      // 1. Outer wet ground ring (organic edges)
      const wetGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 20 * s, screenPos.x, screenPos.y, 38 * s);
      wetGrad.addColorStop(0, "transparent");
      wetGrad.addColorStop(0.5, "rgba(20, 50, 80, 0.4)");
      wetGrad.addColorStop(1, "rgba(30, 60, 90, 0.15)");
      ctx.fillStyle = wetGrad;
      drawWaterBlob(screenPos.x, screenPos.y, 38 * s, 19 * s * isoRatioWater, waterSeed, 0.18);
      ctx.fill();

      // 2. Stone/dirt rim around water (organic)
      ctx.fillStyle = "rgba(60, 55, 50, 0.85)";
      drawWaterBlob(screenPos.x, screenPos.y, 32 * s, 16 * s * isoRatioWater, waterSeed + 10, 0.15);
      ctx.fill();

      // 3. Deep water abyss layer (organic shape)
      const deepGradW = ctx.createRadialGradient(screenPos.x, screenPos.y + 4 * s, 0, screenPos.x, screenPos.y, 28 * s);
      deepGradW.addColorStop(0, "rgba(5, 15, 40, 0.98)");
      deepGradW.addColorStop(0.4, "rgba(10, 30, 60, 0.95)");
      deepGradW.addColorStop(0.7, "rgba(20, 50, 90, 0.9)");
      deepGradW.addColorStop(1, "rgba(30, 70, 120, 0.85)");
      ctx.fillStyle = deepGradW;
      drawWaterBlob(screenPos.x, screenPos.y, 28 * s, 14 * s * isoRatioWater, waterSeed + 20, 0.12);
      ctx.fill();

      // 4. Surface water layer with slight offset (organic)
      const surfGradW = ctx.createRadialGradient(screenPos.x - 8 * s, screenPos.y - 4 * s, 0, screenPos.x, screenPos.y, 26 * s);
      surfGradW.addColorStop(0, "rgba(80, 150, 200, 0.7)");
      surfGradW.addColorStop(0.4, "rgba(50, 120, 180, 0.5)");
      surfGradW.addColorStop(1, "rgba(30, 80, 140, 0.3)");
      ctx.fillStyle = surfGradW;
      drawWaterBlob(screenPos.x, screenPos.y - 2 * s, 25 * s, 12.5 * s * isoRatioWater, waterSeed + 30, 0.1);
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
    case "bones":
      ctx.fillStyle = "#e8e0d0";
      // Skull
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 3 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(
        screenPos.x - 2 * s,
        screenPos.y - 4 * s,
        1.5 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        screenPos.x + 2 * s,
        screenPos.y - 4 * s,
        1.5 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Bones
      ctx.fillStyle = "#d8d0c0";
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(rotation);
      ctx.fillRect(-12 * s, 2 * s, 24 * s, 3 * s);
      ctx.beginPath();
      ctx.arc(-12 * s, 3.5 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(12 * s, 3.5 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
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
