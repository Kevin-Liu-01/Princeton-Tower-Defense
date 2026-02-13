"use client";
import React, { useRef, useEffect, useState } from "react";
import { MapPin, Lock } from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { PANEL, GOLD, NEUTRAL, SELECTED, panelGradient, dividerGradient } from "../ui/theme";

export const BattlefieldPreview: React.FC<{ animTime: number; onSelectFarthestLevel?: () => void }> = ({ animTime, onSelectFarthestLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentScene, setCurrentScene] = useState(0);

  // Cycle through scenes every 6 seconds for more viewing time
  useEffect(() => {
    const sceneIndex = Math.floor(animTime / 6) % 6;
    setCurrentScene(sceneIndex);
  }, [animTime]);

  // Draw battle scene on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const t = animTime;

    // Scene configurations inspired by game regions
    const scenes = [
      {
        name: "Nassau Campus",
        bg1: "#1a2810", bg2: "#0d1408",
        groundColor: "#2d4a1f",
        accent: "#f97316", // Princeton orange
        secondary: "#000000",
        skyGlow: "#f9731620",
        particles: "leaves",
        weather: "clear"
      },
      {
        name: "Volcanic Caldera",
        bg1: "#3d1a0a", bg2: "#1a0805",
        groundColor: "#4a1a10",
        accent: "#ef4444",
        secondary: "#fbbf24",
        skyGlow: "#ef444440",
        particles: "embers",
        weather: "smoke"
      },
      {
        name: "Frozen Glacier",
        bg1: "#1a2a3a", bg2: "#0d151d",
        groundColor: "#3a5a6a",
        accent: "#60a5fa",
        secondary: "#e0f2fe",
        skyGlow: "#60a5fa30",
        particles: "snow",
        weather: "blizzard"
      },
      {
        name: "Desert Sphinx",
        bg1: "#4a3a20", bg2: "#2a2010",
        groundColor: "#8a7050",
        accent: "#fbbf24",
        secondary: "#d97706",
        skyGlow: "#fbbf2420",
        particles: "sand",
        weather: "sandstorm"
      },
      {
        name: "Murky Bog",
        bg1: "#1a2a1a", bg2: "#0d150d",
        groundColor: "#2a3a2a",
        accent: "#4ade80",
        secondary: "#a855f7",
        skyGlow: "#4ade8020",
        particles: "fireflies",
        weather: "fog"
      },
      {
        name: "Night Siege",
        bg1: "#15102a", bg2: "#08051a",
        groundColor: "#2a2a4a",
        accent: "#a855f7",
        secondary: "#f97316",
        skyGlow: "#a855f730",
        particles: "magic",
        weather: "starry"
      },
    ];
    const scene = scenes[currentScene];

    // === BACKGROUND LAYERS ===

    // Sky gradient with atmospheric glow
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, scene.bg1);
    bgGrad.addColorStop(0.4, scene.bg2);
    bgGrad.addColorStop(1, scene.groundColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Atmospheric glow orbs
    for (let i = 0; i < 3; i++) {
      const glowX = width * (0.2 + i * 0.3) + Math.sin(t * 0.3 + i * 2) * 30;
      const glowY = height * 0.25 + Math.cos(t * 0.2 + i) * 20;
      const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 80);
      glowGrad.addColorStop(0, scene.skyGlow);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Stars for night scenes
    if (scene.weather === "starry") {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 30; i++) {
        const starX = (i * 37 + Math.sin(i * 123) * 100) % width;
        const starY = (i * 23 + Math.cos(i * 87) * 50) % (height * 0.5);
        const twinkle = 0.3 + Math.sin(t * 3 + i) * 0.7;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(starX, starY, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // === DISTANT MOUNTAINS / STRUCTURES ===

    // Mountain silhouettes
    ctx.fillStyle = scene.bg2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    for (let x = 0; x <= width; x += 30) {
      const mountainHeight = Math.sin(x * 0.02) * 30 + Math.sin(x * 0.05) * 20 + Math.sin(x * 0.01) * 40;
      ctx.lineTo(x, height * 0.45 - mountainHeight);
    }
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(0, height * 0.7);
    ctx.closePath();
    ctx.fill();

    // === GROUND WITH TEXTURE ===

    const groundY = height * 0.65;

    // Main ground with wavy top
    ctx.fillStyle = scene.groundColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width; x += 10) {
      ctx.lineTo(x, groundY + Math.sin(x * 0.03 + t * 0.5) * 4);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Ground texture pattern
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
      const gx = (i * 47 + t * 5) % width;
      const gy = groundY + 15 + (i % 3) * 25;
      ctx.fillStyle = i % 2 === 0 ? scene.accent : scene.secondary;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 3 + (i % 4), 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // === PATH / ROAD ===

    // Winding battle path
    ctx.strokeStyle = "#3a3020";
    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-20, groundY + 40);
    ctx.bezierCurveTo(
      width * 0.25, groundY + 50,
      width * 0.4, groundY + 20,
      width * 0.6, groundY + 45
    );
    ctx.bezierCurveTo(
      width * 0.8, groundY + 70,
      width * 0.9, groundY + 30,
      width + 20, groundY + 40
    );
    ctx.stroke();

    // Path highlight
    ctx.strokeStyle = "#4a4030";
    ctx.lineWidth = 15;
    ctx.stroke();

    // === BATTLEFIELD DECORATIONS & ENVIRONMENT ===

    // Distant castle silhouette (background)
    ctx.fillStyle = "#1a1510";
    ctx.beginPath();
    ctx.moveTo(width * 0.85, groundY - 20);
    ctx.lineTo(width * 0.83, groundY - 60);
    ctx.lineTo(width * 0.81, groundY - 55);
    ctx.lineTo(width * 0.81, groundY - 80);
    ctx.lineTo(width * 0.79, groundY - 75);
    ctx.lineTo(width * 0.79, groundY - 65);
    ctx.lineTo(width * 0.77, groundY - 70);
    ctx.lineTo(width * 0.75, groundY - 50);
    ctx.lineTo(width * 0.73, groundY - 55);
    ctx.lineTo(width * 0.71, groundY - 20);
    ctx.closePath();
    ctx.fill();

    // War banners on poles
    const drawBanner = (bx: number, by: number, color1: string, color2: string, waveOffset: number) => {
      const wave = Math.sin(t * 4 + waveOffset) * 5;

      // Pole
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(bx - 2, by - 50, 4, 55);
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(bx, by - 52, 4, 0, Math.PI * 2);
      ctx.fill();

      // Banner fabric with wave
      const bannerGrad = ctx.createLinearGradient(bx, by - 48, bx + 20, by - 20);
      bannerGrad.addColorStop(0, color1);
      bannerGrad.addColorStop(1, color2);
      ctx.fillStyle = bannerGrad;
      ctx.beginPath();
      ctx.moveTo(bx + 2, by - 48);
      ctx.quadraticCurveTo(bx + 15 + wave, by - 42, bx + 22, by - 35 + wave * 0.5);
      ctx.quadraticCurveTo(bx + 15 + wave * 0.5, by - 28, bx + 20, by - 20 + wave * 0.3);
      ctx.lineTo(bx + 2, by - 25);
      ctx.closePath();
      ctx.fill();

      // Banner emblem
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(bx + 10 + wave * 0.3, by - 36, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBanner(width * 0.08, groundY + 5, "#f97316", "#c2410c", 0);
    drawBanner(width * 0.92, groundY + 5, "#f97316", "#c2410c", 1.5);

    // Scattered rocks and boulders
    const drawRock = (rx: number, ry: number, size: number) => {
      const rockGrad = ctx.createLinearGradient(rx - size, ry - size, rx + size, ry + size);
      rockGrad.addColorStop(0, "#6b6560");
      rockGrad.addColorStop(0.5, "#57534e");
      rockGrad.addColorStop(1, "#3a3530");
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(rx - size, ry + size * 0.3);
      ctx.quadraticCurveTo(rx - size * 0.8, ry - size * 0.6, rx - size * 0.2, ry - size * 0.8);
      ctx.quadraticCurveTo(rx + size * 0.3, ry - size * 0.9, rx + size * 0.7, ry - size * 0.4);
      ctx.quadraticCurveTo(rx + size, ry + size * 0.2, rx + size * 0.5, ry + size * 0.5);
      ctx.quadraticCurveTo(rx, ry + size * 0.6, rx - size, ry + size * 0.3);
      ctx.fill();

      // Rock highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.ellipse(rx - size * 0.3, ry - size * 0.4, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    drawRock(width * 0.05, groundY + 35, 12);
    drawRock(width * 0.18, groundY + 50, 8);
    drawRock(width * 0.42, groundY + 55, 10);
    drawRock(width * 0.65, groundY + 48, 7);
    drawRock(width * 0.88, groundY + 40, 14);

    // Dead trees / burnt stumps
    const drawDeadTree = (tx: number, ty: number, scale: number) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      // Trunk
      ctx.fillStyle = "#2a2520";
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-4, -35);
      ctx.lineTo(4, -35);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fill();

      // Dead branches
      ctx.strokeStyle = "#2a2520";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-3, -30);
      ctx.lineTo(-15, -45);
      ctx.moveTo(2, -28);
      ctx.lineTo(12, -42);
      ctx.moveTo(0, -35);
      ctx.lineTo(-5, -50);
      ctx.stroke();

      ctx.restore();
    };

    drawDeadTree(width * 0.02, groundY + 15, 0.6);
    drawDeadTree(width * 0.95, groundY + 20, 0.7);

    // === BATTLE DAMAGE & DEBRIS ===

    // Bomb craters
    const drawCrater = (cx: number, cy: number, size: number) => {
      // Outer dirt ring
      ctx.fillStyle = "#3a3025";
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 1.5, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner crater
      const craterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
      craterGrad.addColorStop(0, "#1a1510");
      craterGrad.addColorStop(0.6, "#2a2520");
      craterGrad.addColorStop(1, "#3a3530");
      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, size, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scorched edge
      ctx.strokeStyle = "#1a1510";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    drawCrater(width * 0.25, groundY + 55, 15);
    drawCrater(width * 0.58, groundY + 60, 12);
    drawCrater(width * 0.82, groundY + 52, 10);

    // Scattered debris and broken weapons
    const drawDebris = (dx: number, dy: number, type: number) => {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(type * 0.8);

      if (type % 3 === 0) {
        // Broken sword
        ctx.fillStyle = "#8a8a8a";
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(5, -1);
        ctx.lineTo(6, 1);
        ctx.lineTo(-8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(-12, -3, 5, 6);
      } else if (type % 3 === 1) {
        // Broken shield piece
        ctx.fillStyle = "#6a5a4a";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else {
        // Arrow
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(12, -3);
        ctx.lineTo(12, 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    for (let d = 0; d < 8; d++) {
      const debrisX = width * (0.1 + d * 0.1 + Math.sin(d * 2.5) * 0.05);
      const debrisY = groundY + 45 + (d % 3) * 8;
      drawDebris(debrisX, debrisY, d);
    }

    // Burn marks / scorch marks on ground
    for (let burn = 0; burn < 5; burn++) {
      const bx = width * (0.15 + burn * 0.18);
      const by = groundY + 35 + (burn % 2) * 20;
      ctx.fillStyle = "rgba(30, 20, 15, 0.4)";
      ctx.beginPath();
      ctx.ellipse(bx, by, 20 + burn * 3, 8 + burn, burn * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smoke columns from damage
    for (let smoke = 0; smoke < 3; smoke++) {
      const smokeX = width * (0.2 + smoke * 0.3);
      for (let puff = 0; puff < 4; puff++) {
        const puffAge = (t * 0.8 + smoke * 0.5 + puff * 0.3) % 2;
        const puffY = groundY + 30 - puffAge * 50;
        const puffSize = 8 + puffAge * 15;
        const puffAlpha = 0.2 - puffAge * 0.08;
        if (puffAlpha > 0) {
          ctx.fillStyle = `rgba(60, 55, 50, ${puffAlpha})`;
          ctx.beginPath();
          ctx.arc(smokeX + Math.sin(t * 2 + puff) * 10, puffY, puffSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Defensive barricades / wooden barriers
    const drawBarricade = (bx: number, by: number) => {
      // Wooden stakes
      ctx.fillStyle = "#5a4a3a";
      for (let stake = 0; stake < 4; stake++) {
        ctx.save();
        ctx.translate(bx + stake * 8 - 12, by);
        ctx.rotate(-0.2 + stake * 0.15);
        ctx.fillRect(-2, -20, 4, 22);
        // Stake point
        ctx.beginPath();
        ctx.moveTo(-2, -20);
        ctx.lineTo(0, -28);
        ctx.lineTo(2, -20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Crossbar
      ctx.fillStyle = "#4a3a2a";
      ctx.save();
      ctx.translate(bx, by - 10);
      ctx.rotate(0.1);
      ctx.fillRect(-18, -2, 36, 4);
      ctx.restore();

      // Battle damage on barricade
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 5, by - 15);
      ctx.lineTo(bx - 3, by - 8);
      ctx.stroke();
    };

    drawBarricade(width * 0.28, groundY + 38);
    drawBarricade(width * 0.62, groundY + 42);

    // === EPIC TOWERS WITH FULL DETAIL ===

    // Helper: Draw isometric shadow
    const drawTowerShadow = (x: number, y: number, w: number, h: number) => {
      const shadowGrad = ctx.createRadialGradient(x, y + h * 0.3, 0, x, y + h * 0.3, w * 1.2);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.5)");
      shadowGrad.addColorStop(0.5, "rgba(0,0,0,0.25)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x, y + h * 0.3, w * 1.1, h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // NASSAU CANNON TOWER - Heavy Artillery Platform with mechanical detail
    const drawCannonTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Isometric base platform with beveled edges
      const baseGrad = ctx.createLinearGradient(-30, 0, 30, 15);
      baseGrad.addColorStop(0, "#5a5a62");
      baseGrad.addColorStop(0.3, "#4a4a52");
      baseGrad.addColorStop(0.7, "#3a3a42");
      baseGrad.addColorStop(1, "#2a2a32");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Platform edge highlight
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, -12);
      ctx.lineTo(28, 0);
      ctx.stroke();

      // Main tower body - mechanical fortress
      const towerGrad = ctx.createLinearGradient(-22, -70, 22, 0);
      towerGrad.addColorStop(0, "#5a5a62");
      towerGrad.addColorStop(0.2, "#4a4a52");
      towerGrad.addColorStop(0.5, "#3a3a42");
      towerGrad.addColorStop(0.8, "#4a4a52");
      towerGrad.addColorStop(1, "#2a2a32");
      ctx.fillStyle = towerGrad;
      ctx.beginPath();
      ctx.moveTo(-22, -5);
      ctx.lineTo(-22, -55);
      ctx.lineTo(-18, -60);
      ctx.lineTo(18, -60);
      ctx.lineTo(22, -55);
      ctx.lineTo(22, -5);
      ctx.closePath();
      ctx.fill();

      // Armor plates with rivets
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.lineTo(20, -20);
      ctx.moveTo(-20, -40);
      ctx.lineTo(20, -40);
      ctx.stroke();

      // Decorative rivets
      ctx.fillStyle = "#6a6a72";
      for (let row = 0; row < 3; row++) {
        for (let col = -2; col <= 2; col++) {
          ctx.beginPath();
          ctx.arc(col * 8, -15 - row * 20, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Tech glow strips
      const glowPulse = 0.5 + Math.sin(t * 3) * 0.3;
      ctx.fillStyle = `rgba(255, 102, 0, ${glowPulse})`;
      ctx.fillRect(-20, -52, 3, 45);
      ctx.fillRect(17, -52, 3, 45);

      // Crenellations with shadow
      for (let i = 0; i < 5; i++) {
        const crenX = -16 + i * 8;
        ctx.fillStyle = "#4a4a52";
        ctx.fillRect(crenX, -72, 6, 14);
        ctx.fillStyle = "#5a5a62";
        ctx.fillRect(crenX, -72, 6, 3);
      }

      // Rotating turret platform
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(0, -60, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tech ring glow
      ctx.strokeStyle = `rgba(255, 102, 0, ${glowPulse * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -60, 16, 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy cannon assembly
      const cannonAngle = Math.sin(t * 1.5) * 0.2 - 0.15;
      ctx.save();
      ctx.translate(0, -65);
      ctx.rotate(cannonAngle);

      // Cannon housing
      const cannonGrad = ctx.createLinearGradient(0, -8, 0, 8);
      cannonGrad.addColorStop(0, "#4a4a52");
      cannonGrad.addColorStop(0.5, "#3a3a42");
      cannonGrad.addColorStop(1, "#2a2a32");
      ctx.fillStyle = cannonGrad;
      ctx.beginPath();
      ctx.arc(-5, 0, 10, Math.PI * 0.5, Math.PI * 1.5);
      ctx.lineTo(35, -6);
      ctx.lineTo(40, -4);
      ctx.lineTo(40, 4);
      ctx.lineTo(35, 6);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fill();

      // Barrel detail rings
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(8 + i * 8, -5);
        ctx.lineTo(8 + i * 8, 5);
        ctx.stroke();
      }

      // Muzzle
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(40, 0, 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Muzzle flash & smoke
      const firePhase = (t * 2) % 3;
      if (firePhase < 0.3) {
        const flashSize = 1 - firePhase / 0.3;
        // Fire flash
        const flashGrad = ctx.createRadialGradient(35, -70, 0, 35, -70, 25 * flashSize);
        flashGrad.addColorStop(0, `rgba(255, 255, 200, ${flashSize})`);
        flashGrad.addColorStop(0.3, `rgba(255, 150, 50, ${flashSize * 0.8})`);
        flashGrad.addColorStop(0.6, `rgba(255, 80, 0, ${flashSize * 0.5})`);
        flashGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(35, -70, 25 * flashSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Smoke particles
      ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
      for (let i = 0; i < 5; i++) {
        const smokeAge = (t * 1.5 + i * 0.4) % 2;
        if (smokeAge < 1.5) {
          const sx = 30 + smokeAge * 15 + Math.sin(t * 3 + i) * 5;
          const sy = -75 - smokeAge * 25;
          const sr = 4 + smokeAge * 6;
          ctx.globalAlpha = 0.4 - smokeAge * 0.25;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Glowing windows
      for (let i = 0; i < 2; i++) {
        const winGlow = 0.5 + Math.sin(t * 2 + i) * 0.3;
        ctx.fillStyle = `rgba(255, 180, 100, ${winGlow})`;
        ctx.fillRect(-8 + i * 10, -35, 6, 10);
        // Window frame
        ctx.strokeStyle = "#2a2a32";
        ctx.lineWidth = 1;
        ctx.strokeRect(-8 + i * 10, -35, 6, 10);
      }

      ctx.restore();
    };

    // E-QUAD LAB TOWER - High-tech Tesla Facility
    const drawLabTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Isometric base
      const baseGrad = ctx.createLinearGradient(-30, 0, 30, 15);
      baseGrad.addColorStop(0, "#4a5a6a");
      baseGrad.addColorStop(0.5, "#3a4a5a");
      baseGrad.addColorStop(1, "#2a3a4a");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Main lab building - modern angular design
      const labGrad = ctx.createLinearGradient(-25, -80, 25, 0);
      labGrad.addColorStop(0, "#5a6a7a");
      labGrad.addColorStop(0.3, "#4a5a6a");
      labGrad.addColorStop(0.6, "#3a4a5a");
      labGrad.addColorStop(1, "#2a3a4a");
      ctx.fillStyle = labGrad;
      ctx.beginPath();
      ctx.moveTo(-24, -5);
      ctx.lineTo(-24, -60);
      ctx.lineTo(-20, -68);
      ctx.lineTo(0, -75);
      ctx.lineTo(20, -68);
      ctx.lineTo(24, -60);
      ctx.lineTo(24, -5);
      ctx.closePath();
      ctx.fill();

      // Tech panel lines
      ctx.strokeStyle = "#2a3a4a";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-22, -15 - i * 15);
        ctx.lineTo(22, -15 - i * 15);
        ctx.stroke();
      }

      // Vertical accent strips
      ctx.fillStyle = "#5a6a7a";
      ctx.fillRect(-22, -60, 3, 55);
      ctx.fillRect(19, -60, 3, 55);

      // Energy core glow
      const corePulse = 0.6 + Math.sin(t * 4) * 0.4;
      const coreGrad = ctx.createRadialGradient(0, -40, 0, 0, -40, 20);
      coreGrad.addColorStop(0, `rgba(96, 165, 250, ${corePulse})`);
      coreGrad.addColorStop(0.5, `rgba(59, 130, 246, ${corePulse * 0.5})`);
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, -40, 20, 0, Math.PI * 2);
      ctx.fill();

      // Central viewing window
      ctx.fillStyle = `rgba(96, 165, 250, ${0.4 + corePulse * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(-10, -50);
      ctx.lineTo(-10, -30);
      ctx.lineTo(10, -30);
      ctx.lineTo(10, -50);
      ctx.lineTo(0, -55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a4a5a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tesla coils - dual spires
      for (let side = -1; side <= 1; side += 2) {
        const coilX = side * 18;

        // Coil base
        ctx.fillStyle = "#5a6a7a";
        ctx.beginPath();
        ctx.moveTo(coilX - 5, -68);
        ctx.lineTo(coilX - 4, -95);
        ctx.lineTo(coilX + 4, -95);
        ctx.lineTo(coilX + 5, -68);
        ctx.closePath();
        ctx.fill();

        // Coil rings
        ctx.strokeStyle = "#7a8a9a";
        ctx.lineWidth = 2;
        for (let ring = 0; ring < 4; ring++) {
          ctx.beginPath();
          ctx.ellipse(coilX, -72 - ring * 6, 5 - ring * 0.5, 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Energy sphere
        const spherePulse = 0.7 + Math.sin(t * 6 + side * 2) * 0.3;
        const sphereGrad = ctx.createRadialGradient(coilX, -100, 0, coilX, -100, 10);
        sphereGrad.addColorStop(0, `rgba(200, 220, 255, ${spherePulse})`);
        sphereGrad.addColorStop(0.4, `rgba(96, 165, 250, ${spherePulse * 0.8})`);
        sphereGrad.addColorStop(1, `rgba(59, 130, 246, 0)`);
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(coilX, -100, 10, 0, Math.PI * 2);
        ctx.fill();

        // Electric arcs
        const arcPhase = (t * 5 + side * 3) % 1;
        if (arcPhase < 0.7) {
          ctx.strokeStyle = `rgba(150, 200, 255, ${0.8 - arcPhase})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(coilX, -100);

          // Jagged lightning path
          let lx = coilX;
          let ly = -100;
          const targetX = side * 45 + Math.sin(t * 8) * 20;
          const targetY = -70 + Math.cos(t * 6) * 15;
          for (let seg = 0; seg < 4; seg++) {
            lx += (targetX - coilX) / 4 + (Math.random() - 0.5) * 15;
            ly += (targetY + 100) / 4 + (Math.random() - 0.5) * 10;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();

          // Secondary arc
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(coilX, -100);
          ctx.lineTo(coilX + side * 12, -85);
          ctx.lineTo(coilX + side * 25, -75);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Arc glow at connection point
        if (arcPhase < 0.5) {
          const arcGlow = ctx.createRadialGradient(coilX + side * 35, -70, 0, coilX + side * 35, -70, 15);
          arcGlow.addColorStop(0, `rgba(150, 200, 255, ${0.5 - arcPhase})`);
          arcGlow.addColorStop(1, "transparent");
          ctx.fillStyle = arcGlow;
          ctx.beginPath();
          ctx.arc(coilX + side * 35, -70, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Floating energy particles
      for (let p = 0; p < 8; p++) {
        const pAngle = (t * 2 + p * Math.PI * 0.25) % (Math.PI * 2);
        const pDist = 25 + Math.sin(t * 3 + p) * 5;
        const px = Math.cos(pAngle) * pDist;
        const py = -75 + Math.sin(pAngle) * 8;
        ctx.fillStyle = `rgba(150, 200, 255, ${0.4 + Math.sin(t * 5 + p) * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // BLAIR ARCH TOWER - Gothic Architecture with Sonic Waves
    const drawArchTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Isometric base
      const baseGrad = ctx.createLinearGradient(-30, 0, 30, 15);
      baseGrad.addColorStop(0, "#7a6a5a");
      baseGrad.addColorStop(0.5, "#6a5a4a");
      baseGrad.addColorStop(1, "#5a4a3a");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Gothic columns with fluting
      for (let side = -1; side <= 1; side += 2) {
        const colX = side * 20;

        // Column shaft
        const colGrad = ctx.createLinearGradient(colX - 6, 0, colX + 6, 0);
        colGrad.addColorStop(0, "#5a4a3a");
        colGrad.addColorStop(0.3, "#7a6a5a");
        colGrad.addColorStop(0.5, "#8a7a6a");
        colGrad.addColorStop(0.7, "#7a6a5a");
        colGrad.addColorStop(1, "#5a4a3a");
        ctx.fillStyle = colGrad;
        ctx.fillRect(colX - 6, -60, 12, 65);

        // Column fluting (vertical lines)
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = 1;
        for (let f = -2; f <= 2; f++) {
          ctx.beginPath();
          ctx.moveTo(colX + f * 2, -55);
          ctx.lineTo(colX + f * 2, 0);
          ctx.stroke();
        }

        // Capital (top decoration)
        ctx.fillStyle = "#8a7a6a";
        ctx.beginPath();
        ctx.moveTo(colX - 8, -60);
        ctx.lineTo(colX - 10, -65);
        ctx.lineTo(colX + 10, -65);
        ctx.lineTo(colX + 8, -60);
        ctx.closePath();
        ctx.fill();

        // Base molding
        ctx.fillStyle = "#6a5a4a";
        ctx.beginPath();
        ctx.moveTo(colX - 8, 0);
        ctx.lineTo(colX - 10, 5);
        ctx.lineTo(colX + 10, 5);
        ctx.lineTo(colX + 8, 0);
        ctx.closePath();
        ctx.fill();
      }

      // Gothic arch with keystone
      ctx.strokeStyle = "#8a7a6a";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, -55, 26, Math.PI, 0);
      ctx.stroke();

      // Inner arch
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -55, 20, Math.PI, 0);
      ctx.stroke();

      // Keystone
      ctx.fillStyle = "#9a8a7a";
      ctx.beginPath();
      ctx.moveTo(-6, -82);
      ctx.lineTo(0, -88);
      ctx.lineTo(6, -82);
      ctx.lineTo(4, -75);
      ctx.lineTo(-4, -75);
      ctx.closePath();
      ctx.fill();

      // Ornate spires
      for (let side = -1; side <= 1; side += 2) {
        const spireX = side * 24;
        ctx.fillStyle = "#7a6a5a";
        ctx.beginPath();
        ctx.moveTo(spireX - 4, -65);
        ctx.lineTo(spireX, -95);
        ctx.lineTo(spireX + 4, -65);
        ctx.closePath();
        ctx.fill();

        // Spire orb
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(spireX, -98, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central rose window (glowing)
      const rosePulse = 0.5 + Math.sin(t * 2) * 0.3;
      const roseGrad = ctx.createRadialGradient(0, -55, 0, 0, -55, 15);
      roseGrad.addColorStop(0, `rgba(200, 150, 255, ${rosePulse})`);
      roseGrad.addColorStop(0.5, `rgba(168, 85, 247, ${rosePulse * 0.7})`);
      roseGrad.addColorStop(1, `rgba(139, 92, 246, ${rosePulse * 0.3})`);
      ctx.fillStyle = roseGrad;
      ctx.beginPath();
      ctx.arc(0, -55, 14, 0, Math.PI * 2);
      ctx.fill();

      // Rose window spokes
      ctx.strokeStyle = "#4a3a2a";
      ctx.lineWidth = 1.5;
      for (let spoke = 0; spoke < 8; spoke++) {
        const angle = spoke * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(Math.cos(angle) * 12, -55 + Math.sin(angle) * 12);
        ctx.stroke();
      }

      // Sonic wave emissions - purple concentric rings
      const waveSpeed = t * 4;
      for (let wave = 0; wave < 5; wave++) {
        const wavePhase = ((waveSpeed + wave * 1.2) % 6) / 6;
        const waveRadius = 15 + wavePhase * 70;
        const waveAlpha = (1 - wavePhase) * 0.6;

        if (waveAlpha > 0.05) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
          ctx.lineWidth = 3 - wavePhase * 2;
          ctx.beginPath();
          ctx.arc(0, -55, waveRadius, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();

          // Wave distortion effect
          ctx.strokeStyle = `rgba(200, 150, 255, ${waveAlpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, -55, waveRadius - 3, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    // DINKY STATION - Train depot with animated locomotive
    const drawDinkyStation = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 15, 50, 25);

      // Platform base
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(-45, 5, 90, 12);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(-45, 5, 90, 4);

      // Station building - Victorian style
      const stationGrad = ctx.createLinearGradient(-35, -55, 35, 0);
      stationGrad.addColorStop(0, "#6a5a4a");
      stationGrad.addColorStop(0.3, "#5a4a3a");
      stationGrad.addColorStop(0.7, "#4a3a2a");
      stationGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = stationGrad;
      ctx.fillRect(-35, -45, 70, 50);

      // Decorative trim
      ctx.fillStyle = "#7a6a5a";
      ctx.fillRect(-38, -48, 76, 5);
      ctx.fillRect(-38, -5, 76, 5);

      // Windows with warm glow
      const windowGlow = 0.5 + Math.sin(t * 1.5) * 0.2;
      for (let w = 0; w < 3; w++) {
        ctx.fillStyle = `rgba(255, 200, 120, ${windowGlow})`;
        ctx.fillRect(-25 + w * 20, -35, 12, 18);
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = 2;
        ctx.strokeRect(-25 + w * 20, -35, 12, 18);
        // Window cross
        ctx.beginPath();
        ctx.moveTo(-19 + w * 20, -35);
        ctx.lineTo(-19 + w * 20, -17);
        ctx.moveTo(-25 + w * 20, -26);
        ctx.lineTo(-13 + w * 20, -26);
        ctx.stroke();
      }

      // Peaked roof
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(-40, -48);
      ctx.lineTo(0, -68);
      ctx.lineTo(40, -48);
      ctx.closePath();
      ctx.fill();

      // Roof tiles pattern
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1;
      for (let tile = 0; tile < 6; tile++) {
        ctx.beginPath();
        ctx.moveTo(-35 + tile * 14, -48);
        ctx.lineTo(-28 + tile * 14, -55);
        ctx.stroke();
      }

      // Clock tower
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(-8, -85, 16, 37);
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(-10, -85);
      ctx.lineTo(0, -95);
      ctx.lineTo(10, -85);
      ctx.closePath();
      ctx.fill();

      // Clock face
      ctx.fillStyle = "#f5f5f0";
      ctx.beginPath();
      ctx.arc(0, -70, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Clock hands
      const hourAngle = t * 0.1;
      const minAngle = t * 1.2;
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(Math.sin(hourAngle) * 3, -70 - Math.cos(hourAngle) * 3);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(Math.sin(minAngle) * 5, -70 - Math.cos(minAngle) * 5);
      ctx.stroke();

      // Train tracks
      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-50, 15);
      ctx.lineTo(50, 15);
      ctx.stroke();
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-50, 13);
      ctx.lineTo(50, 13);
      ctx.moveTo(-50, 17);
      ctx.lineTo(50, 17);
      ctx.stroke();

      // Track ties
      ctx.fillStyle = "#4a3a2a";
      for (let tie = 0; tie < 12; tie++) {
        ctx.fillRect(-48 + tie * 8, 12, 4, 8);
      }

      // Animated Princeton Dinky train
      const trainX = Math.sin(t * 0.6) * 35;
      const trainBounce = Math.abs(Math.sin(t * 8)) * 1;

      // Train shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(trainX, 18, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Locomotive body
      const trainGrad = ctx.createLinearGradient(trainX - 15, -5, trainX + 15, 10);
      trainGrad.addColorStop(0, "#ff8833");
      trainGrad.addColorStop(0.5, "#f97316");
      trainGrad.addColorStop(1, "#ea580c");
      ctx.fillStyle = trainGrad;
      ctx.fillRect(trainX - 15, -8 - trainBounce, 30, 18);

      // Cabin
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(trainX - 12, -18 - trainBounce, 12, 12);

      // Cabin window
      ctx.fillStyle = `rgba(255, 200, 120, ${0.6 + Math.sin(t * 2) * 0.2})`;
      ctx.fillRect(trainX - 10, -16 - trainBounce, 8, 6);

      // Smokestack
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(trainX + 5, -22 - trainBounce, 6, 14);

      // Wheels with rotation
      const wheelRot = t * 8;
      ctx.fillStyle = "#1a1a1a";
      for (let wheel = 0; wheel < 3; wheel++) {
        const wx = trainX - 10 + wheel * 10;
        ctx.beginPath();
        ctx.arc(wx, 8, 5, 0, Math.PI * 2);
        ctx.fill();
        // Wheel spokes
        ctx.strokeStyle = "#3a3a3a";
        ctx.lineWidth = 1;
        for (let spoke = 0; spoke < 4; spoke++) {
          const spokeAngle = wheelRot + spoke * Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(wx, 8);
          ctx.lineTo(wx + Math.cos(spokeAngle) * 4, 8 + Math.sin(spokeAngle) * 4);
          ctx.stroke();
        }
      }

      // Steam puffs
      for (let puff = 0; puff < 5; puff++) {
        const puffAge = (t * 2 + puff * 0.5) % 2.5;
        if (puffAge < 2) {
          const px = trainX + 8 + puffAge * 8 + Math.sin(t * 4 + puff) * 4;
          const py = -25 - trainBounce - puffAge * 15;
          const pSize = 3 + puffAge * 5;
          ctx.fillStyle = `rgba(220, 220, 220, ${0.5 - puffAge * 0.2})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Princeton P logo on train
      ctx.fillStyle = "#000000";
      ctx.font = "bold 10px serif";
      ctx.textAlign = "center";
      ctx.fillText("P", trainX, 2 - trainBounce);

      ctx.restore();
    };

    // === BLAIR ARCH LANDMARK (background decoration) ===
    const drawBlairArchLandmark = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Gothic stone base platform
      ctx.fillStyle = "#3a3530";
      ctx.beginPath();
      ctx.moveTo(-50, 10);
      ctx.lineTo(-45, 0);
      ctx.lineTo(45, 0);
      ctx.lineTo(50, 10);
      ctx.lineTo(-50, 10);
      ctx.closePath();
      ctx.fill();

      // Left tower
      const towerGrad = ctx.createLinearGradient(-45, -120, -25, 0);
      towerGrad.addColorStop(0, "#5a5048");
      towerGrad.addColorStop(0.3, "#6a6058");
      towerGrad.addColorStop(0.7, "#5a5048");
      towerGrad.addColorStop(1, "#4a4038");
      ctx.fillStyle = towerGrad;
      ctx.fillRect(-45, -100, 20, 100);

      // Left tower crenellations
      ctx.fillStyle = "#5a5048";
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(-44 + c * 7, -110, 5, 12);
      }

      // Left tower spire
      ctx.fillStyle = "#4a4038";
      ctx.beginPath();
      ctx.moveTo(-35, -110);
      ctx.lineTo(-35, -135);
      ctx.lineTo(-25, -100);
      ctx.lineTo(-45, -100);
      ctx.closePath();
      ctx.fill();

      // Right tower
      ctx.fillStyle = towerGrad;
      ctx.fillRect(25, -100, 20, 100);

      // Right tower crenellations
      ctx.fillStyle = "#5a5048";
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(26 + c * 7, -110, 5, 12);
      }

      // Right tower spire
      ctx.fillStyle = "#4a4038";
      ctx.beginPath();
      ctx.moveTo(35, -110);
      ctx.lineTo(35, -135);
      ctx.lineTo(45, -100);
      ctx.lineTo(25, -100);
      ctx.closePath();
      ctx.fill();

      // Main archway
      const archGrad = ctx.createLinearGradient(-35, -80, 35, 0);
      archGrad.addColorStop(0, "#6a6058");
      archGrad.addColorStop(0.5, "#5a5048");
      archGrad.addColorStop(1, "#4a4038");
      ctx.fillStyle = archGrad;
      ctx.fillRect(-35, -70, 70, 70);

      // Gothic arch opening
      ctx.fillStyle = "#1a1815";
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-22, -40);
      ctx.quadraticCurveTo(-22, -60, 0, -65);
      ctx.quadraticCurveTo(22, -60, 22, -40);
      ctx.lineTo(22, 0);
      ctx.closePath();
      ctx.fill();

      // Arch detail - stone outline
      ctx.strokeStyle = "#7a7068";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-22, -40);
      ctx.quadraticCurveTo(-22, -58, 0, -63);
      ctx.quadraticCurveTo(22, -58, 22, -40);
      ctx.lineTo(22, 0);
      ctx.stroke();

      // Keystone
      ctx.fillStyle = "#7a7068";
      ctx.beginPath();
      ctx.moveTo(-5, -62);
      ctx.lineTo(0, -70);
      ctx.lineTo(5, -62);
      ctx.lineTo(3, -58);
      ctx.lineTo(-3, -58);
      ctx.closePath();
      ctx.fill();

      // Connecting wall section
      ctx.fillStyle = "#5a5048";
      ctx.fillRect(-35, -75, 70, 8);

      // Battlements on top
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = "#5a5048";
        ctx.fillRect(-30 + b * 14, -82, 8, 10);
      }

      // Window details on towers
      ctx.fillStyle = `rgba(255, 200, 120, ${0.3 + Math.sin(t * 1.5) * 0.15})`;
      ctx.fillRect(-40, -80, 8, 12);
      ctx.fillRect(-40, -55, 8, 12);
      ctx.fillRect(32, -80, 8, 12);
      ctx.fillRect(32, -55, 8, 12);

      // Window frames
      ctx.strokeStyle = "#3a3530";
      ctx.lineWidth = 1;
      ctx.strokeRect(-40, -80, 8, 12);
      ctx.strokeRect(-40, -55, 8, 12);
      ctx.strokeRect(32, -80, 8, 12);
      ctx.strokeRect(32, -55, 8, 12);

      // "BLAIR" text suggestion on arch
      ctx.fillStyle = "#7a7068";
      ctx.font = "bold 6px serif";
      ctx.textAlign = "center";
      ctx.fillText("BLAIR", 0, -72);

      ctx.restore();
    };

    // Draw Blair Arch in background
    drawBlairArchLandmark(width * 0.88, groundY - 25, 0.65);

    // Draw towers at different positions with layered depth - TALLER AND MORE PROMINENT
    drawDinkyStation(width * 0.10, groundY - 15, 0.75);
    drawCannonTower(width * 0.30, groundY - 5, 1.1);
    drawLabTower(width * 0.50, groundY - 15, 1.15);
    drawArchTower(width * 0.70, groundY - 5, 1.0);

    // === EPIC HERO - ARMORED WAR TIGER ===

    const drawHeroTiger = (x: number, y: number) => {
      const breathe = Math.sin(t * 1.8) * 2;
      const isAttacking = Math.sin(t * 2) > 0.6;
      const clawSwipe = isAttacking ? Math.sin(t * 8) * 0.8 : 0;
      const bodyLean = isAttacking ? Math.sin(t * 4) * 0.1 : 0;
      const attackIntensity = isAttacking ? Math.abs(Math.sin(t * 4)) : 0;

      ctx.save();
      ctx.translate(x, y);

      // Multi-layered infernal aura
      const auraIntensity = isAttacking ? 0.5 : 0.25;
      const auraPulse = 0.85 + Math.sin(t * 3) * 0.15;
      for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
        const layerOffset = auraLayer * 0.08;
        const auraGrad = ctx.createRadialGradient(0, 0, 5 + layerOffset * 20, 0, 0, 45 + layerOffset * 15);
        auraGrad.addColorStop(0, `rgba(255, 100, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.08)})`);
        auraGrad.addColorStop(0.5, `rgba(255, 60, 0, ${auraIntensity * auraPulse * (0.2 - auraLayer * 0.04)})`);
        auraGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 45 + auraLayer * 8, 30 + auraLayer * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating flame particles
      for (let p = 0; p < 12; p++) {
        const pAngle = (t * 1.5 + p * Math.PI * 0.17) % (Math.PI * 2);
        const pDist = 35 + Math.sin(t * 2 + p * 0.5) * 8;
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist * 0.6 - Math.abs(Math.sin(t * 4 + p)) * 8;
        const pAlpha = 0.5 + Math.sin(t * 4 + p * 0.4) * 0.3;
        ctx.fillStyle = p % 3 === 0 ? `rgba(255, 200, 50, ${pAlpha})` : `rgba(255, 100, 0, ${pAlpha})`;
        ctx.beginPath();
        ctx.moveTo(px, py + 3);
        ctx.quadraticCurveTo(px - 2, py, px, py - 4);
        ctx.quadraticCurveTo(px + 2, py, px, py + 3);
        ctx.fill();
      }

      // Deep shadow
      const shadowGrad = ctx.createRadialGradient(0, 25, 0, 0, 25, 40);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
      shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 25, 40, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(bodyLean);

      // Massive muscular tiger body
      const bodyGrad = ctx.createRadialGradient(0, breathe * 0.5, 0, 0, breathe * 0.5, 35);
      bodyGrad.addColorStop(0, "#ffaa44");
      bodyGrad.addColorStop(0.3, "#ff8822");
      bodyGrad.addColorStop(0.6, "#dd5500");
      bodyGrad.addColorStop(1, "#aa3300");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, breathe * 0.5, 28, 22 + breathe * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy war armor - chest plate
      const chestArmorGrad = ctx.createLinearGradient(-20, -15, 20, 15);
      chestArmorGrad.addColorStop(0, "#2a2218");
      chestArmorGrad.addColorStop(0.3, "#4a3a28");
      chestArmorGrad.addColorStop(0.5, "#5a4a38");
      chestArmorGrad.addColorStop(0.7, "#4a3a28");
      chestArmorGrad.addColorStop(1, "#2a2218");
      ctx.fillStyle = chestArmorGrad;
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.quadraticCurveTo(-22, 0, -16, 14);
      ctx.lineTo(-6, 18);
      ctx.quadraticCurveTo(0, 20, 6, 18);
      ctx.lineTo(16, 14);
      ctx.quadraticCurveTo(22, 0, 18, -12);
      ctx.quadraticCurveTo(0, -18, -18, -12);
      ctx.closePath();
      ctx.fill();

      // Armor border
      ctx.strokeStyle = "#1a1510";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gold trim on armor
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.quadraticCurveTo(0, -16, 16, -10);
      ctx.stroke();

      // Central tiger emblem on armor
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-6, 4);
      ctx.lineTo(0, 10);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();

      // Emblem gem
      const gemPulse = 0.7 + Math.sin(t * 2.5) * 0.3;
      ctx.fillStyle = "#ff3300";
      ctx.beginPath();
      ctx.arc(0, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Gem glow
      const gemGlow = ctx.createRadialGradient(0, 2, 0, 0, 2, 8);
      gemGlow.addColorStop(0, `rgba(255, 100, 0, ${gemPulse * 0.6})`);
      gemGlow.addColorStop(1, "transparent");
      ctx.fillStyle = gemGlow;
      ctx.beginPath();
      ctx.arc(0, 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Dark tiger stripes (on exposed fur)
      ctx.strokeStyle = "#050202";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let i = 0; i < 4; i++) {
        const stripeY = -8 + i * 7 + breathe * 0.3;
        // Left side stripes
        ctx.beginPath();
        ctx.moveTo(-28, stripeY);
        ctx.quadraticCurveTo(-24, stripeY - 3, -20, stripeY + 1);
        ctx.stroke();
        // Right side stripes
        ctx.beginPath();
        ctx.moveTo(28, stripeY);
        ctx.quadraticCurveTo(24, stripeY - 3, 20, stripeY + 1);
        ctx.stroke();
      }

      // Armored shoulders with spikes
      for (let side = -1; side <= 1; side += 2) {
        const shoulderX = side * 26;
        const armOffset = isAttacking ? clawSwipe * 8 * side : 0;

        // Massive arm/shoulder muscle
        const armGrad = ctx.createRadialGradient(shoulderX + armOffset, -5, 0, shoulderX + armOffset, -5, 18);
        armGrad.addColorStop(0, "#ff9944");
        armGrad.addColorStop(0.5, "#dd5500");
        armGrad.addColorStop(1, "#aa3300");
        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.ellipse(shoulderX + armOffset, -5, 14, 18, side * -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Arm stripes
        ctx.strokeStyle = "#050202";
        ctx.lineWidth = 1.5;
        for (let stripe = 0; stripe < 4; stripe++) {
          const stripeOffset = -12 + stripe * 6;
          ctx.beginPath();
          ctx.moveTo(shoulderX + armOffset + side * 12, -5 + stripeOffset);
          ctx.quadraticCurveTo(shoulderX + armOffset + side * 8, -5 + stripeOffset - 2, shoulderX + armOffset + side * 4, -5 + stripeOffset);
          ctx.stroke();
        }

        // Heavy shoulder pauldron
        const pauldronGrad = ctx.createRadialGradient(shoulderX + armOffset, -12, 0, shoulderX + armOffset, -12, 12);
        pauldronGrad.addColorStop(0, "#5a4a38");
        pauldronGrad.addColorStop(0.6, "#4a3a28");
        pauldronGrad.addColorStop(1, "#2a2218");
        ctx.fillStyle = pauldronGrad;
        ctx.beginPath();
        ctx.ellipse(shoulderX + armOffset, -10, 10, 8, side * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Pauldron spike
        ctx.fillStyle = "#3a3028";
        ctx.beginPath();
        ctx.moveTo(shoulderX + armOffset - 3, -12);
        ctx.lineTo(shoulderX + armOffset + side * 8, -25);
        ctx.lineTo(shoulderX + armOffset + 3, -12);
        ctx.closePath();
        ctx.fill();

        // Deadly claws
        ctx.fillStyle = "#f5f5f0";
        for (let claw = 0; claw < 3; claw++) {
          const clawX = shoulderX + armOffset + side * 18;
          const clawY = 8 + claw * 4;
          ctx.beginPath();
          ctx.moveTo(clawX, clawY);
          ctx.lineTo(clawX + side * 10, clawY - 2);
          ctx.lineTo(clawX, clawY + 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Powerful tiger head
      const headGrad = ctx.createRadialGradient(22, -8, 0, 22, -8, 18);
      headGrad.addColorStop(0, "#ffaa44");
      headGrad.addColorStop(0.5, "#ff8822");
      headGrad.addColorStop(1, "#dd5500");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(22, -8, 16, 14, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Head stripes
      ctx.strokeStyle = "#050202";
      ctx.lineWidth = 2;
      for (let hs = 0; hs < 3; hs++) {
        ctx.beginPath();
        ctx.moveTo(16 + hs * 4, -20);
        ctx.quadraticCurveTo(18 + hs * 4, -12, 16 + hs * 4, -4);
        ctx.stroke();
      }

      // Muzzle
      ctx.fillStyle = "#fff8e0";
      ctx.beginPath();
      ctx.ellipse(30, -4, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fierce eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(18, -12, 4, 3, -0.2, 0, Math.PI * 2);
      ctx.ellipse(26, -12, 4, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.arc(18, -12, 2, 0, Math.PI * 2);
      ctx.arc(26, -12, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(18, -12, 1, 0, Math.PI * 2);
      ctx.arc(26, -12, 1, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(32, -6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fierce ears
      for (let ear = -1; ear <= 1; ear += 2) {
        ctx.fillStyle = "#ff8822";
        ctx.beginPath();
        ctx.moveTo(16 + ear * 6, -18);
        ctx.lineTo(14 + ear * 10, -30);
        ctx.lineTo(20 + ear * 4, -20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffccaa";
        ctx.beginPath();
        ctx.moveTo(16 + ear * 6, -19);
        ctx.lineTo(15 + ear * 8, -26);
        ctx.lineTo(19 + ear * 4, -20);
        ctx.closePath();
        ctx.fill();
      }

      // Animated tail
      ctx.strokeStyle = "#ff8822";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-28, 5);
      const tailWave = Math.sin(t * 5) * 12;
      ctx.quadraticCurveTo(-38, -5 + tailWave, -48, 0 + tailWave * 0.5);
      ctx.stroke();
      // Tail stripes
      ctx.strokeStyle = "#050202";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, 0 + tailWave * 0.3);
      ctx.lineTo(-38, -2 + tailWave * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-42, 2 + tailWave * 0.6);
      ctx.lineTo(-46, 0 + tailWave * 0.5);
      ctx.stroke();

      ctx.restore();

      // Attack effect - Devastating claw swipe arcs
      if (isAttacking) {
        for (let arc = 0; arc < 4; arc++) {
          const arcPhase = (t * 12 + arc * 0.8) % 2;
          if (arcPhase < 1) {
            const arcAlpha = (1 - arcPhase) * 0.8 * attackIntensity;
            ctx.strokeStyle = `rgba(255, 200, 50, ${arcAlpha})`;
            ctx.lineWidth = 4 - arcPhase * 3;
            ctx.beginPath();
            ctx.arc(35, 0, 15 + arcPhase * 30, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
          }
        }
      }

      // Mighty Roar shockwave (periodic)
      const roarPhase = (t * 0.4) % 4;
      if (roarPhase < 1.5) {
        for (let wave = 0; wave < 5; wave++) {
          const waveTime = roarPhase - wave * 0.2;
          if (waveTime > 0 && waveTime < 1) {
            const waveRadius = 25 + waveTime * 80;
            const waveAlpha = (1 - waveTime) * 0.5;
            ctx.strokeStyle = `rgba(255, 150, 50, ${waveAlpha})`;
            ctx.lineWidth = 4 - waveTime * 3;
            ctx.beginPath();
            ctx.arc(22, -8, waveRadius, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };


    // === EPIC ENEMIES ===

    // Writing Sem - Haunted Academic Tome
    const drawWritingSem = (x: number, y: number, index: number) => {
      const float = Math.sin(t * 3 + index) * 6;
      const wobble = Math.sin(t * 5 + index * 2) * 0.1;
      ctx.save();
      ctx.translate(x, y + float);
      ctx.rotate(wobble);

      // Eerie glow
      const bookGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      bookGlow.addColorStop(0, "rgba(74, 222, 128, 0.3)");
      bookGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bookGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 18 - float, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Book cover with gradient
      const coverGrad = ctx.createLinearGradient(-10, -15, 10, 15);
      coverGrad.addColorStop(0, "#22c55e");
      coverGrad.addColorStop(0.5, "#4ade80");
      coverGrad.addColorStop(1, "#16a34a");
      ctx.fillStyle = coverGrad;
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(12, -12);
      ctx.lineTo(12, 14);
      ctx.lineTo(-10, 14);
      ctx.closePath();
      ctx.fill();

      // Spine
      ctx.fillStyle = "#15803d";
      ctx.fillRect(-12, -12, 3, 26);

      // Pages
      ctx.fillStyle = "#f0fdf4";
      ctx.fillRect(-8, -12, 18, 24);

      // Page lines (text)
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 0.5;
      for (let line = 0; line < 6; line++) {
        ctx.beginPath();
        ctx.moveTo(-6, -8 + line * 4);
        ctx.lineTo(8, -8 + line * 4);
        ctx.stroke();
      }

      // Evil eyes
      const eyePulse = 0.7 + Math.sin(t * 6 + index) * 0.3;
      ctx.fillStyle = `rgba(220, 38, 38, ${eyePulse})`;
      ctx.beginPath();
      ctx.arc(-2, -2, 3, 0, Math.PI * 2);
      ctx.arc(5, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(-2, -2, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Floating letters/symbols
      ctx.fillStyle = `rgba(74, 222, 128, ${0.3 + Math.sin(t * 4 + index) * 0.2})`;
      ctx.font = "8px serif";
      for (let sym = 0; sym < 4; sym++) {
        const symAngle = t * 2 + sym * Math.PI * 0.5;
        const symDist = 18 + Math.sin(t * 3 + sym) * 3;
        ctx.fillText("∑", Math.cos(symAngle) * symDist, -5 + Math.sin(symAngle) * symDist * 0.5);
      }

      ctx.restore();
    };

    // Nassau Lion - Legendary Stone Golem Boss
    const drawNassauLion = (x: number, y: number) => {
      const stomp = Math.abs(Math.sin(t * 1.5)) * 3;
      const breathe = Math.sin(t * 1.2) * 2;
      ctx.save();
      ctx.translate(x, y + stomp);

      // Massive shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 25, 35, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing eye trail effect
      const eyeGlow = ctx.createRadialGradient(0, -45, 0, 0, -45, 50);
      eyeGlow.addColorStop(0, `rgba(234, 179, 8, ${0.3 + Math.sin(t * 3) * 0.15})`);
      eyeGlow.addColorStop(1, "transparent");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(0, -45, 50, 0, Math.PI * 2);
      ctx.fill();

      // Massive stone body
      const bodyGrad = ctx.createLinearGradient(-30, -50, 30, 20);
      bodyGrad.addColorStop(0, "#78716c");
      bodyGrad.addColorStop(0.3, "#57534e");
      bodyGrad.addColorStop(0.6, "#44403c");
      bodyGrad.addColorStop(1, "#292524");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-28, -35);
      ctx.lineTo(-32, 15);
      ctx.lineTo(32, 15);
      ctx.lineTo(28, -35);
      ctx.closePath();
      ctx.fill();

      // Stone texture cracks
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-15, -30);
      ctx.lineTo(-18, -10);
      ctx.lineTo(-12, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, -25);
      ctx.lineTo(15, -5);
      ctx.lineTo(8, 10);
      ctx.stroke();

      // Massive legs
      for (let leg = -1; leg <= 1; leg += 2) {
        ctx.fillStyle = "#44403c";
        ctx.fillRect(leg * 12 - 8, 10, 16, 15);
        ctx.fillStyle = "#292524";
        ctx.fillRect(leg * 12 - 10, 22, 20, 8);
      }

      // Colossal head
      const headGrad = ctx.createRadialGradient(0, -50, 0, 0, -50, 28);
      headGrad.addColorStop(0, "#78716c");
      headGrad.addColorStop(0.6, "#57534e");
      headGrad.addColorStop(1, "#44403c");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -50 + breathe, 24, 0, Math.PI * 2);
      ctx.fill();

      // Majestic stone mane
      for (let maneRow = 0; maneRow < 2; maneRow++) {
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 - Math.PI * 0.5;
          const maneX = Math.cos(angle) * (28 + maneRow * 8);
          const maneY = -50 + breathe + Math.sin(angle) * (28 + maneRow * 8);
          const manePulse = Math.sin(t * 2 + i * 0.5) * 2;
          ctx.fillStyle = maneRow === 0 ? "#a8a29e" : "#78716c";
          ctx.beginPath();
          ctx.ellipse(maneX, maneY + manePulse, 8 - maneRow * 2, 10 - maneRow * 2, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Face details
      ctx.fillStyle = "#292524";
      ctx.beginPath();
      ctx.ellipse(0, -42 + breathe, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing fierce eyes
      const eyeIntensity = 0.7 + Math.sin(t * 4) * 0.3;
      for (let eye = -1; eye <= 1; eye += 2) {
        // Eye glow
        const singleEyeGlow = ctx.createRadialGradient(eye * 10, -55 + breathe, 0, eye * 10, -55 + breathe, 10);
        singleEyeGlow.addColorStop(0, `rgba(234, 179, 8, ${eyeIntensity})`);
        singleEyeGlow.addColorStop(0.5, `rgba(251, 191, 36, ${eyeIntensity * 0.5})`);
        singleEyeGlow.addColorStop(1, "transparent");
        ctx.fillStyle = singleEyeGlow;
        ctx.beginPath();
        ctx.arc(eye * 10, -55 + breathe, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eye core
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.ellipse(eye * 10, -55 + breathe, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(eye * 10, -55 + breathe, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crown/horn decorations
      ctx.fillStyle = "#c9a227";
      for (let horn = -1; horn <= 1; horn += 2) {
        ctx.beginPath();
        ctx.moveTo(horn * 15, -72 + breathe);
        ctx.lineTo(horn * 20, -85 + breathe);
        ctx.lineTo(horn * 12, -70 + breathe);
        ctx.closePath();
        ctx.fill();
      }

      // Ground crack effect when stomping
      if (stomp > 2) {
        ctx.strokeStyle = "#44403c";
        ctx.lineWidth = 2;
        for (let crack = 0; crack < 6; crack++) {
          const crackAngle = crack * Math.PI / 3;
          ctx.beginPath();
          ctx.moveTo(0, 28);
          ctx.lineTo(Math.cos(crackAngle) * 25, 28 + Math.sin(crackAngle) * 8);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    // Tiger Transit Wyvern - MASSIVE TERRIFYING DRAGON
    const drawWyvern = (x: number, y: number, index: number, scale: number = 0.75) => {
      const wingFlap = Math.sin(t * 5 + index) * 0.6;
      const bodyWave = Math.sin(t * 3 + index) * 4;
      const breathPulse = Math.sin(t * 6 + index) * 2;
      const aggressiveTilt = Math.sin(t * 2 + index) * 0.08;
      ctx.save();
      ctx.translate(x, y + bodyWave);
      ctx.scale(scale, scale);
      ctx.rotate(aggressiveTilt);

      // MASSIVE DARK AURA - ominous presence
      for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
        const auraGrad = ctx.createRadialGradient(0, 0, 10 + auraLayer * 15, 0, 0, 90 + auraLayer * 20);
        auraGrad.addColorStop(0, `rgba(180, 60, 30, ${0.25 - auraLayer * 0.05})`);
        auraGrad.addColorStop(0.5, `rgba(100, 30, 20, ${0.15 - auraLayer * 0.03})`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 90 + auraLayer * 20, 60 + auraLayer * 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }


      // Deadly spiked tail
      ctx.strokeStyle = "#4a2020";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-22, 15);
      ctx.quadraticCurveTo(-55, 22 + Math.sin(t * 5) * 12, -85, 8 + Math.sin(t * 4) * 15);
      ctx.stroke();
      ctx.strokeStyle = "#3a1515";
      ctx.lineWidth = 5;
      ctx.stroke();
      // Deadly tail spikes
      ctx.fillStyle = "#2a1010";
      for (let spike = 0; spike < 6; spike++) {
        const sx = -30 - spike * 10;
        const sy = 18 + Math.sin(t * 5 + spike) * 8;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 5, sy - 14);
        ctx.lineTo(sx + 5, sy);
        ctx.closePath();
        ctx.fill();
      }
      // Tail blade at end
      ctx.fillStyle = "#5a3030";
      ctx.beginPath();
      ctx.moveTo(-82, 8);
      ctx.lineTo(-100, -5);
      ctx.lineTo(-95, 8);
      ctx.lineTo(-100, 20);
      ctx.closePath();
      ctx.fill();

      // COLOSSAL wings
      for (let side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.rotate(wingFlap * side * 1.3);

        // Wing membrane - dark and leathery
        const wingGrad = ctx.createLinearGradient(0, 0, 70, -50);
        wingGrad.addColorStop(0, "#5a2020");
        wingGrad.addColorStop(0.3, "#4a1818");
        wingGrad.addColorStop(0.7, "#3a1010");
        wingGrad.addColorStop(1, "#2a0808");
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(18, -8);
        ctx.quadraticCurveTo(45, -60, 80, -50);
        ctx.lineTo(90, -35);
        ctx.quadraticCurveTo(85, -15, 75, 0);
        ctx.quadraticCurveTo(55, 12, 22, 10);
        ctx.closePath();
        ctx.fill();

        // Wing bone structure
        ctx.strokeStyle = "#6a3030";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(18, -8);
        ctx.lineTo(75, -45);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(78, -30);
        ctx.moveTo(22, 6);
        ctx.lineTo(72, -15);
        ctx.moveTo(22, 10);
        ctx.lineTo(65, 0);
        ctx.stroke();

        // Wing claws - razor sharp
        ctx.fillStyle = "#e0d8c0";
        ctx.beginPath();
        ctx.moveTo(80, -50);
        ctx.lineTo(95, -60);
        ctx.lineTo(85, -48);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(90, -35);
        ctx.lineTo(105, -42);
        ctx.lineTo(92, -32);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(75, 0);
        ctx.lineTo(88, -5);
        ctx.lineTo(78, 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Massive muscular body
      const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      bodyGrad.addColorStop(0, "#6a3030");
      bodyGrad.addColorStop(0.4, "#5a2525");
      bodyGrad.addColorStop(0.8, "#4a1818");
      bodyGrad.addColorStop(1, "#3a1010");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0 + breathPulse * 0.3, 28, 22 + breathPulse * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armored scales pattern
      ctx.fillStyle = "#4a1818";
      for (let scale = 0; scale < 8; scale++) {
        ctx.beginPath();
        ctx.arc(-14 + scale * 5, 6, 5, 0, Math.PI);
        ctx.fill();
      }
      // Belly scales
      ctx.fillStyle = "#5a3030";
      ctx.beginPath();
      ctx.ellipse(0, 8, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Massive dragon head
      ctx.fillStyle = "#5a2525";
      ctx.beginPath();
      ctx.ellipse(28, -8, 18, 15, 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Long snout
      ctx.fillStyle = "#4a1818";
      ctx.beginPath();
      ctx.ellipse(45, -5, 12, 9, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils with smoke
      ctx.fillStyle = "#2a0a0a";
      ctx.beginPath();
      ctx.ellipse(52, -3, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(52, -7, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nostril smoke
      for (let smoke = 0; smoke < 3; smoke++) {
        const smokeX = 55 + smoke * 4 + Math.sin(t * 8 + smoke) * 3;
        const smokeY = -5 - smoke * 3;
        ctx.fillStyle = `rgba(80, 80, 80, ${0.3 - smoke * 0.08})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 3 - smoke * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // TERRIFYING GLOWING EYES
      const eyePulse = 0.85 + Math.sin(t * 7 + index) * 0.15;
      // Eye glow effect
      const eyeGlow = ctx.createRadialGradient(32, -14, 0, 32, -14, 20);
      eyeGlow.addColorStop(0, `rgba(255, 200, 50, ${eyePulse})`);
      eyeGlow.addColorStop(0.5, `rgba(255, 100, 0, ${eyePulse * 0.5})`);
      eyeGlow.addColorStop(1, "transparent");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(32, -14, 20, 0, Math.PI * 2);
      ctx.fill();

      // Eye - large and menacing
      ctx.fillStyle = "#ffc020";
      ctx.beginPath();
      ctx.ellipse(32, -14, 7, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.ellipse(33, -14, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(34, -14, 1.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // MASSIVE horns - crown of terror
      ctx.fillStyle = "#3a1515";
      // Main horns
      ctx.beginPath();
      ctx.moveTo(22, -18);
      ctx.quadraticCurveTo(15, -35, 5, -48);
      ctx.lineTo(12, -45);
      ctx.quadraticCurveTo(18, -32, 26, -20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(35, -22);
      ctx.quadraticCurveTo(42, -38, 48, -52);
      ctx.lineTo(52, -48);
      ctx.quadraticCurveTo(44, -35, 38, -22);
      ctx.closePath();
      ctx.fill();
      // Secondary horns
      ctx.fillStyle = "#2a1010";
      ctx.beginPath();
      ctx.moveTo(28, -20);
      ctx.lineTo(30, -38);
      ctx.lineTo(34, -20);
      ctx.closePath();
      ctx.fill();

      // Jaw spikes
      ctx.fillStyle = "#3a1515";
      for (let jaw = 0; jaw < 3; jaw++) {
        ctx.beginPath();
        ctx.moveTo(40 + jaw * 6, 2);
        ctx.lineTo(42 + jaw * 6, 12);
        ctx.lineTo(44 + jaw * 6, 2);
        ctx.closePath();
        ctx.fill();
      }

      // Sharp teeth visible
      ctx.fillStyle = "#f0e8d0";
      ctx.beginPath();
      ctx.moveTo(50, -1);
      ctx.lineTo(52, 5);
      ctx.lineTo(54, -1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(54, 0);
      ctx.lineTo(56, 6);
      ctx.lineTo(58, 0);
      ctx.closePath();
      ctx.fill();

      // DEVASTATING fire breath effect (more frequent and bigger)
      if (Math.sin(t * 2.5 + index) > 0.3) {
        // Fire core
        for (let flame = 0; flame < 8; flame++) {
          const flameX = 58 + flame * 12;
          const flameY = -2 + Math.sin(t * 12 + flame * 0.5) * 6;
          const flameSize = 12 - flame * 1.2;
          const flameAlpha = 0.85 - flame * 0.1;

          // Flame glow
          const flameGlow = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize * 1.5);
          flameGlow.addColorStop(0, `rgba(255, 255, 150, ${flameAlpha})`);
          flameGlow.addColorStop(0.3, `rgba(255, 200, 50, ${flameAlpha * 0.8})`);
          flameGlow.addColorStop(0.6, `rgba(255, 100, 0, ${flameAlpha * 0.5})`);
          flameGlow.addColorStop(1, "transparent");
          ctx.fillStyle = flameGlow;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Flame core
          ctx.fillStyle = `rgba(255, 200, 100, ${flameAlpha})`;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ember particles
        for (let ember = 0; ember < 10; ember++) {
          const emberAge = (t * 3 + ember * 0.4) % 2;
          const emberX = 60 + emberAge * 50 + Math.sin(t * 10 + ember * 2) * 15;
          const emberY = -2 + Math.sin(emberAge * Math.PI) * 20 - emberAge * 10;
          ctx.fillStyle = `rgba(255, 150, 50, ${0.8 - emberAge * 0.4})`;
          ctx.beginPath();
          ctx.arc(emberX, emberY, 2 - emberAge * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Clawed feet hanging below
      for (let foot = -1; foot <= 1; foot += 2) {
        ctx.fillStyle = "#4a1818";
        ctx.beginPath();
        ctx.ellipse(foot * 12, 20, 6, 8, foot * 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Talons
        ctx.fillStyle = "#e0d8c0";
        for (let talon = 0; talon < 3; talon++) {
          ctx.beginPath();
          ctx.moveTo(foot * 12 - 4 + talon * 4, 26);
          ctx.lineTo(foot * 12 - 5 + talon * 4, 38);
          ctx.lineTo(foot * 12 - 2 + talon * 4, 26);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    };

    // Sophomore Slump - Heavy armored enemy
    const drawSophomoreEnemy = (x: number, y: number, index: number) => {
      const walk = Math.sin(t * 3 + index) * 2;
      ctx.save();
      ctx.translate(x, y + Math.abs(walk));

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 12, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy body
      const bodyGrad = ctx.createLinearGradient(-12, -20, 12, 10);
      bodyGrad.addColorStop(0, "#93c5fd");
      bodyGrad.addColorStop(0.5, "#60a5fa");
      bodyGrad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-14, 10);
      ctx.lineTo(-16, -10);
      ctx.quadraticCurveTo(-14, -22, 0, -25);
      ctx.quadraticCurveTo(14, -22, 16, -10);
      ctx.lineTo(14, 10);
      ctx.closePath();
      ctx.fill();

      // Armor plates
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -5);
      ctx.lineTo(12, -5);
      ctx.moveTo(-10, 5);
      ctx.lineTo(10, 5);
      ctx.stroke();

      // Helmet
      ctx.fillStyle = "#1e40af";
      ctx.beginPath();
      ctx.arc(0, -22, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-10, -22, 20, 5);

      // Visor slit (glowing eyes)
      ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + Math.sin(t * 5) * 0.3})`;
      ctx.fillRect(-6, -20, 12, 3);

      // Heavy mace weapon
      ctx.save();
      ctx.translate(14, -5);
      ctx.rotate(walk * 0.1);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(0, -25, 4, 30);
      // Mace head
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.arc(2, -28, 8, 0, Math.PI * 2);
      ctx.fill();
      // Spikes
      for (let spike = 0; spike < 6; spike++) {
        const sAngle = spike * Math.PI / 3;
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.moveTo(2 + Math.cos(sAngle) * 6, -28 + Math.sin(sAngle) * 6);
        ctx.lineTo(2 + Math.cos(sAngle) * 12, -28 + Math.sin(sAngle) * 12);
        ctx.lineTo(2 + Math.cos(sAngle + 0.3) * 6, -28 + Math.sin(sAngle + 0.3) * 6);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    };

    // Flying Rival Mascot - MENACING DEMONIC HARPY
    const drawFlyingMascot = (x: number, y: number, index: number, scale: number = 0.7) => {
      const wingFlap = Math.sin(t * 10 + index) * 0.7;
      const hover = Math.sin(t * 4 + index) * 8;
      const aggressiveTilt = Math.sin(t * 6 + index) * 0.15;
      const breathPulse = Math.sin(t * 8 + index) * 2;
      ctx.save();
      ctx.translate(x, y + hover);
      ctx.scale(scale, scale);
      ctx.rotate(aggressiveTilt);

      // MASSIVE threatening dark aura with pulsing energy
      const auraIntensity = 0.4 + Math.sin(t * 5 + index) * 0.2;
      for (let layer = 0; layer < 3; layer++) {
        const auraGrad = ctx.createRadialGradient(0, 0, 5 + layer * 8, 0, 0, 55 + layer * 10);
        auraGrad.addColorStop(0, `rgba(180, 50, 50, ${auraIntensity * (0.3 - layer * 0.08)})`);
        auraGrad.addColorStop(0.5, `rgba(100, 20, 60, ${auraIntensity * (0.2 - layer * 0.05)})`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 55 + layer * 10, 40 + layer * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }


      // Electric crackling particles around body
      for (let p = 0; p < 6; p++) {
        const pAngle = (t * 3 + p * Math.PI / 3 + index) % (Math.PI * 2);
        const pDist = 30 + Math.sin(t * 8 + p) * 8;
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist * 0.6;
        ctx.fillStyle = `rgba(255, 100, 100, ${0.6 + Math.sin(t * 12 + p) * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 2 + Math.sin(t * 10 + p) * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // MASSIVE razor-sharp wings
      for (let side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.rotate(wingFlap * side * 1.2);

        // Outer wing membrane - darker, more sinister
        const wingGrad = ctx.createLinearGradient(0, 0, 50, -30);
        wingGrad.addColorStop(0, "#1a4a4a");
        wingGrad.addColorStop(0.5, "#0d3535");
        wingGrad.addColorStop(1, "#062020");
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.quadraticCurveTo(30, -35, 55, -25);
        ctx.lineTo(60, -15);
        ctx.quadraticCurveTo(45, 5, 15, 10);
        ctx.closePath();
        ctx.fill();

        // Wing bone structure - sharp and angular
        ctx.strokeStyle = "#2a6a6a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(50, -22);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 3);
        ctx.lineTo(55, -12);
        ctx.moveTo(15, 6);
        ctx.lineTo(52, -3);
        ctx.stroke();

        // Sharp wing claws at tips
        ctx.fillStyle = "#f5f0e0";
        ctx.beginPath();
        ctx.moveTo(55, -25);
        ctx.lineTo(65, -30);
        ctx.lineTo(58, -22);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(60, -15);
        ctx.lineTo(70, -18);
        ctx.lineTo(62, -12);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Muscular armored body
      const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      bodyGrad.addColorStop(0, "#2a5858");
      bodyGrad.addColorStop(0.5, "#1a4040");
      bodyGrad.addColorStop(1, "#0d2525");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0 + breathPulse * 0.5, 14, 20 + breathPulse * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armored chest plate markings
      ctx.strokeStyle = "#3a7070";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.quadraticCurveTo(0, -12, 8, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();

      // Fierce head with angular features
      const headGrad = ctx.createRadialGradient(0, -18, 0, 0, -18, 14);
      headGrad.addColorStop(0, "#2a5858");
      headGrad.addColorStop(0.7, "#1a3a3a");
      headGrad.addColorStop(1, "#0d2020");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -18, 12, 0, Math.PI * 2);
      ctx.fill();

      // Sharp deadly beak
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(22, -16);
      ctx.lineTo(6, -14);
      ctx.closePath();
      ctx.fill();
      // Beak highlight
      ctx.fillStyle = "#fcd34d";
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(18, -17);
      ctx.lineTo(6, -16);
      ctx.closePath();
      ctx.fill();

      // MASSIVE GLOWING DEMONIC EYES
      const eyePulse = 0.8 + Math.sin(t * 8 + index) * 0.2;
      // Eye glow
      for (let eye = -1; eye <= 1; eye += 2) {
        const eyeGlow = ctx.createRadialGradient(eye * 4, -20, 0, eye * 4, -20, 12);
        eyeGlow.addColorStop(0, `rgba(255, 50, 50, ${eyePulse * 0.8})`);
        eyeGlow.addColorStop(0.5, `rgba(255, 0, 0, ${eyePulse * 0.4})`);
        eyeGlow.addColorStop(1, "transparent");
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(eye * 4, -20, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      // Eye whites (yellowed)
      ctx.fillStyle = "#fff0c0";
      ctx.beginPath();
      ctx.ellipse(-4, -20, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, -20, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fierce red irises
      ctx.fillStyle = `rgba(220, 30, 30, ${eyePulse})`;
      ctx.beginPath();
      ctx.arc(-4, -20, 3, 0, Math.PI * 2);
      ctx.arc(4, -20, 3, 0, Math.PI * 2);
      ctx.fill();
      // Slit pupils
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(-4, -20, 1, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(4, -20, 1, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Menacing head crests/horns
      ctx.fillStyle = "#1a3535";
      ctx.beginPath();
      ctx.moveTo(-5, -28);
      ctx.lineTo(-8, -42);
      ctx.lineTo(-2, -30);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5, -28);
      ctx.lineTo(8, -42);
      ctx.lineTo(2, -30);
      ctx.closePath();
      ctx.fill();
      // Center crest
      ctx.beginPath();
      ctx.moveTo(-2, -28);
      ctx.lineTo(0, -48);
      ctx.lineTo(2, -28);
      ctx.closePath();
      ctx.fill();

      // Sharp talons hanging below
      for (let talon = -1; talon <= 1; talon += 2) {
        ctx.fillStyle = "#f5f0e0";
        ctx.beginPath();
        ctx.moveTo(talon * 6, 18);
        ctx.lineTo(talon * 4, 30);
        ctx.lineTo(talon * 8, 28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(talon * 8, 20);
        ctx.lineTo(talon * 6, 32);
        ctx.lineTo(talon * 10, 30);
        ctx.closePath();
        ctx.fill();
      }

      // Tail feathers - longer and more threatening
      ctx.fillStyle = "#0d2525";
      for (let tf = 0; tf < 5; tf++) {
        ctx.beginPath();
        ctx.moveTo(-6 + tf * 3, 18);
        ctx.quadraticCurveTo(-10 + tf * 4, 38 + Math.sin(t * 5 + tf) * 5, -4 + tf * 3, 45);
        ctx.quadraticCurveTo(-2 + tf * 3, 38, 0 + tf * 3, 18);
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw enemies marching - varied types
    for (let i = 0; i < 4; i++) {
      const enemyX = ((width * 0.3 + t * 22 + i * 80) % (width * 0.85)) + width * 0.08;
      drawWritingSem(enemyX, groundY + 40, i);
    }

    // Sophomore enemies (heavier)
    for (let i = 0; i < 2; i++) {
      const sophX = ((width * 0.15 + t * 18 + i * 120) % (width * 0.8)) + width * 0.1;
      drawSophomoreEnemy(sophX, groundY + 35, i);
    }

    // Nassau Lion (boss) - moved to better position
    drawNassauLion(width * 0.72, groundY + 20);

    // Flying mascots with targeting effects
    for (let i = 0; i < 4; i++) {
      const mascotX = ((width * 0.05 + t * 32 + i * 110) % (width * 1.4)) - width * 0.2;
      const mascotY = height * (0.22 + i * 0.08) + Math.sin(t * 2.5 + i * 2.5) * 20;

      // Check if this mascot is being hit (periodic)
      const hitPhase = (t * 1.2 + i * 1.5) % 4;
      const isBeingHit = hitPhase < 0.5;

      if (!isBeingHit || hitPhase > 0.3) {
        drawFlyingMascot(mascotX, mascotY, i);
      }

      // Targeting laser from tower
      if (hitPhase > 3 && hitPhase < 4) {
        const targetAlpha = (hitPhase - 3);
        ctx.strokeStyle = `rgba(255, 100, 100, ${targetAlpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width * 0.55, groundY - 80);
        ctx.lineTo(mascotX, mascotY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target reticle
        ctx.strokeStyle = `rgba(255, 50, 50, ${targetAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mascotX, mascotY, 20 + (1 - targetAlpha) * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mascotX - 25, mascotY);
        ctx.lineTo(mascotX - 12, mascotY);
        ctx.moveTo(mascotX + 12, mascotY);
        ctx.lineTo(mascotX + 25, mascotY);
        ctx.moveTo(mascotX, mascotY - 25);
        ctx.lineTo(mascotX, mascotY - 12);
        ctx.moveTo(mascotX, mascotY + 12);
        ctx.lineTo(mascotX, mascotY + 25);
        ctx.stroke();
      }

      // Explosion when hit
      if (isBeingHit) {
        const explosionProgress = hitPhase / 0.5;
        const explosionSize = explosionProgress * 40;
        const explosionAlpha = 1 - explosionProgress;

        // Multi-layer explosion
        for (let layer = 0; layer < 3; layer++) {
          const layerSize = explosionSize * (1 - layer * 0.2);
          const expGrad = ctx.createRadialGradient(mascotX, mascotY, 0, mascotX, mascotY, layerSize);
          expGrad.addColorStop(0, `rgba(255, 255, 200, ${explosionAlpha * (1 - layer * 0.3)})`);
          expGrad.addColorStop(0.4, `rgba(255, 150, 50, ${explosionAlpha * 0.7 * (1 - layer * 0.3)})`);
          expGrad.addColorStop(0.7, `rgba(255, 80, 0, ${explosionAlpha * 0.4 * (1 - layer * 0.3)})`);
          expGrad.addColorStop(1, "transparent");
          ctx.fillStyle = expGrad;
          ctx.beginPath();
          ctx.arc(mascotX, mascotY, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Feather debris
        for (let debris = 0; debris < 8; debris++) {
          const debrisAngle = debris * Math.PI / 4 + explosionProgress * 3;
          const debrisDist = explosionProgress * 35;
          const dx = mascotX + Math.cos(debrisAngle) * debrisDist;
          const dy = mascotY + Math.sin(debrisAngle) * debrisDist - explosionProgress * 20;
          ctx.fillStyle = `rgba(34, 211, 211, ${explosionAlpha})`;
          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(debrisAngle + explosionProgress * 5);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Arrows targeting mascots
      const arrowHitPhase = (t * 1.5 + i * 2) % 2.5;
      if (arrowHitPhase < 1.5) {
        const arrowProgress = arrowHitPhase / 1.5;
        const startX = width * 0.15;
        const startY = groundY + 25;
        const arrowX = startX + (mascotX - startX) * arrowProgress;
        const arrowY = startY + (mascotY - startY) * arrowProgress - Math.sin(arrowProgress * Math.PI) * 30;

        ctx.save();
        ctx.translate(arrowX, arrowY);
        const angle = Math.atan2(mascotY - startY, mascotX - startX);
        ctx.rotate(angle);
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(8, -2);
        ctx.lineTo(8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Wyvern (large flying enemy) with attack effects
    const wyvernX = ((width * 0.4 + t * 20) % (width * 1.5)) - width * 0.25;
    const wyvernY = height * 0.18 + Math.sin(t * 1.5) * 20;

    // Wyvern hit check
    const wyvernHitPhase = (t * 0.8) % 5;
    const wyvernIsHit = wyvernHitPhase > 4 && wyvernHitPhase < 4.6;

    if (!wyvernIsHit || wyvernHitPhase < 4.3) {
      drawWyvern(wyvernX, wyvernY, 0);
    }

    // Lightning strike targeting wyvern
    if (wyvernHitPhase > 3.5 && wyvernHitPhase < 4) {
      const strikeAlpha = (wyvernHitPhase - 3.5) * 2;
      ctx.strokeStyle = `rgba(150, 200, 255, ${strikeAlpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width * 0.52, groundY - 85);
      let lx = width * 0.52;
      let ly = groundY - 85;
      const segments = 6;
      for (let seg = 0; seg < segments; seg++) {
        lx += (wyvernX - width * 0.52) / segments + (Math.random() - 0.5) * 20;
        ly += (wyvernY - groundY + 85) / segments + (Math.random() - 0.5) * 15;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();

      // Pre-hit glow on wyvern
      const glowGrad = ctx.createRadialGradient(wyvernX, wyvernY, 0, wyvernX, wyvernY, 50);
      glowGrad.addColorStop(0, `rgba(150, 200, 255, ${strikeAlpha * 0.5})`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(wyvernX, wyvernY, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wyvern explosion
    if (wyvernIsHit) {
      const wyvernExpProgress = (wyvernHitPhase - 4) / 0.6;
      const wyvernExpSize = wyvernExpProgress * 70;
      const wyvernExpAlpha = 1 - wyvernExpProgress;

      // Large explosion
      for (let layer = 0; layer < 4; layer++) {
        const layerSize = wyvernExpSize * (1 - layer * 0.15);
        const expGrad = ctx.createRadialGradient(wyvernX, wyvernY, 0, wyvernX, wyvernY, layerSize);
        expGrad.addColorStop(0, `rgba(255, 255, 220, ${wyvernExpAlpha * (1 - layer * 0.2)})`);
        expGrad.addColorStop(0.3, `rgba(100, 200, 255, ${wyvernExpAlpha * 0.8 * (1 - layer * 0.2)})`);
        expGrad.addColorStop(0.6, `rgba(50, 150, 255, ${wyvernExpAlpha * 0.5 * (1 - layer * 0.2)})`);
        expGrad.addColorStop(1, "transparent");
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(wyvernX, wyvernY, layerSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Electric arcs
      ctx.strokeStyle = `rgba(150, 200, 255, ${wyvernExpAlpha})`;
      ctx.lineWidth = 2;
      for (let arc = 0; arc < 8; arc++) {
        const arcAngle = arc * Math.PI / 4 + wyvernExpProgress * 2;
        const arcDist = wyvernExpProgress * 50;
        ctx.beginPath();
        ctx.moveTo(wyvernX, wyvernY);
        ctx.lineTo(
          wyvernX + Math.cos(arcAngle) * arcDist + (Math.random() - 0.5) * 10,
          wyvernY + Math.sin(arcAngle) * arcDist + (Math.random() - 0.5) * 10
        );
        ctx.stroke();
      }

      // Scale debris
      for (let scale = 0; scale < 12; scale++) {
        const scaleAngle = scale * Math.PI / 6 + wyvernExpProgress * 2;
        const scaleDist = wyvernExpProgress * 60;
        const scaleX = wyvernX + Math.cos(scaleAngle) * scaleDist;
        const scaleY = wyvernY + Math.sin(scaleAngle) * scaleDist - wyvernExpProgress * 30;
        ctx.fillStyle = `rgba(16, 185, 129, ${wyvernExpAlpha})`;
        ctx.beginPath();
        ctx.arc(scaleX, scaleY, 4 - wyvernExpProgress * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cannon ball targeting wyvern
    const cannonToWyvernPhase = (t * 0.6 + 1) % 4;
    if (cannonToWyvernPhase < 2) {
      const cannonProgress = cannonToWyvernPhase / 2;
      const startX = width * 0.32;
      const startY = groundY - 40;
      const cbX = startX + (wyvernX - startX) * cannonProgress;
      const cbY = startY + (wyvernY - startY) * cannonProgress - Math.sin(cannonProgress * Math.PI) * 80;

      // Cannon ball
      const ballGrad = ctx.createRadialGradient(cbX - 2, cbY - 2, 0, cbX, cbY, 8);
      ballGrad.addColorStop(0, "#5a5a5a");
      ballGrad.addColorStop(0.5, "#3a3a3a");
      ballGrad.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(cbX, cbY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
      for (let trail = 1; trail <= 4; trail++) {
        ctx.beginPath();
        ctx.arc(cbX - trail * 8, cbY + trail * 4, 3 + trail, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === ENHANCED SKY BATTLE EFFECTS ===

    // Multiple cannon shots at flying enemies
    for (let shot = 0; shot < 3; shot++) {
      const shotPhase = (t * 0.9 + shot * 1.3) % 3;
      if (shotPhase < 1.8) {
        const shotProgress = shotPhase / 1.8;
        const cannonX = width * 0.30;
        const cannonY = groundY - 60;
        const targetX = width * (0.3 + shot * 0.2) + Math.sin(t + shot) * 50;
        const targetY = height * (0.15 + shot * 0.1);

        const projX = cannonX + (targetX - cannonX) * shotProgress;
        const projY = cannonY + (targetY - cannonY) * shotProgress - Math.sin(shotProgress * Math.PI) * 60;

        // Flaming cannon ball
        const fireGrad = ctx.createRadialGradient(projX, projY, 0, projX, projY, 10);
        fireGrad.addColorStop(0, "#ffff80");
        fireGrad.addColorStop(0.3, "#ff8800");
        fireGrad.addColorStop(0.6, "#ff4400");
        fireGrad.addColorStop(1, "rgba(100, 50, 0, 0.5)");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(projX, projY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Fire trail
        for (let ft = 1; ft <= 6; ft++) {
          const trailX = projX - ft * 6 * (targetX - cannonX > 0 ? 1 : -1);
          const trailY = projY + ft * 3;
          ctx.fillStyle = `rgba(255, ${150 - ft * 20}, 0, ${0.6 - ft * 0.08})`;
          ctx.beginPath();
          ctx.arc(trailX + Math.sin(t * 15 + ft) * 3, trailY, 5 - ft * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Lab tower lightning bolts at flying targets
    for (let bolt = 0; bolt < 4; bolt++) {
      const boltPhase = (t * 1.2 + bolt * 0.8) % 2;
      if (boltPhase < 0.4) {
        const boltAlpha = 1 - boltPhase / 0.4;
        const labX = width * 0.50;
        const labY = groundY - 100;
        const targetX = width * (0.2 + bolt * 0.2);
        const targetY = height * (0.18 + Math.sin(bolt) * 0.1);

        // Main lightning bolt
        ctx.strokeStyle = `rgba(100, 200, 255, ${boltAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(labX, labY);
        let lx = labX, ly = labY;
        for (let seg = 0; seg < 8; seg++) {
          lx += (targetX - labX) / 8 + (Math.random() - 0.5) * 25;
          ly += (targetY - labY) / 8 + (Math.random() - 0.5) * 15;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();

        // Secondary branch
        ctx.strokeStyle = `rgba(150, 220, 255, ${boltAlpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(labX + (targetX - labX) * 0.4, labY + (targetY - labY) * 0.4);
        for (let seg = 0; seg < 4; seg++) {
          ctx.lineTo(
            labX + (targetX - labX) * (0.4 + seg * 0.15) + (Math.random() - 0.5) * 30,
            labY + (targetY - labY) * (0.4 + seg * 0.15) - 20 + (Math.random() - 0.5) * 20
          );
        }
        ctx.stroke();

        // Impact flash
        const flashGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30);
        flashGrad.addColorStop(0, `rgba(200, 230, 255, ${boltAlpha * 0.8})`);
        flashGrad.addColorStop(0.5, `rgba(100, 180, 255, ${boltAlpha * 0.4})`);
        flashGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Arch tower sonic waves targeting sky
    for (let wave = 0; wave < 3; wave++) {
      const wavePhase = (t * 2 + wave * 1.5) % 4;
      if (wavePhase < 3) {
        const archX = width * 0.70;
        const archY = groundY - 55;
        const waveRadius = wavePhase * 80;
        const waveAlpha = (1 - wavePhase / 3) * 0.5;

        // Expanding sonic ring toward sky
        ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
        ctx.lineWidth = 4 - wavePhase;
        ctx.beginPath();
        ctx.arc(archX, archY - wavePhase * 30, waveRadius, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();

        // Secondary ring
        ctx.strokeStyle = `rgba(200, 150, 255, ${waveAlpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(archX, archY - wavePhase * 35, waveRadius * 0.8, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      }
    }

    // Sky environmental effects - wind streaks
    ctx.strokeStyle = "rgba(200, 220, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let streak = 0; streak < 15; streak++) {
      const streakX = ((t * 80 + streak * 60) % (width * 1.2)) - width * 0.1;
      const streakY = height * (0.08 + (streak % 5) * 0.08);
      const streakLen = 30 + (streak % 3) * 20;
      ctx.beginPath();
      ctx.moveTo(streakX, streakY);
      ctx.lineTo(streakX + streakLen, streakY + 2);
      ctx.stroke();
    }

    // Floating embers and sparks rising from battle
    for (let ember = 0; ember < 20; ember++) {
      const emberAge = (t * 0.8 + ember * 0.3) % 3;
      const emberX = width * (0.1 + (ember % 10) * 0.08) + Math.sin(t * 2 + ember) * 15;
      const emberY = groundY - emberAge * 80 - ember * 5;
      const emberAlpha = 0.7 - emberAge * 0.2;

      if (emberY > height * 0.05 && emberAlpha > 0) {
        ctx.fillStyle = ember % 3 === 0
          ? `rgba(255, 200, 50, ${emberAlpha})`
          : `rgba(255, 100, 50, ${emberAlpha})`;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 2 + Math.sin(t * 8 + ember) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Drifting smoke clouds in upper atmosphere
    for (let cloud = 0; cloud < 6; cloud++) {
      const cloudX = ((t * 15 + cloud * 100) % (width * 1.3)) - width * 0.15;
      const cloudY = height * (0.08 + (cloud % 3) * 0.06);
      const cloudAlpha = 0.12 + Math.sin(t + cloud) * 0.05;

      ctx.fillStyle = `rgba(80, 80, 90, ${cloudAlpha})`;
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, 40 + cloud * 5, 15 + cloud * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloudX + 25, cloudY - 5, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloudX - 20, cloudY + 3, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Magic missiles from Dinky station
    for (let missile = 0; missile < 3; missile++) {
      const missilePhase = (t * 1.5 + missile * 1.2) % 2.5;
      if (missilePhase < 2) {
        const missileProgress = missilePhase / 2;
        const startX = width * 0.10;
        const startY = groundY - 30;
        const targetX = width * (0.4 + missile * 0.15);
        const targetY = height * (0.20 + missile * 0.05);

        const mx = startX + (targetX - startX) * missileProgress;
        const my = startY + (targetY - startY) * missileProgress - Math.sin(missileProgress * Math.PI) * 40;

        // Orange magic orb
        const orbGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
        orbGrad.addColorStop(0, "#fff8e0");
        orbGrad.addColorStop(0.3, "#f97316");
        orbGrad.addColorStop(0.7, "#c2410c");
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle trail
        for (let sparkle = 1; sparkle <= 5; sparkle++) {
          const sx = mx - sparkle * 8;
          const sy = my + sparkle * 4;
          ctx.fillStyle = `rgba(249, 115, 22, ${0.5 - sparkle * 0.08})`;
          ctx.beginPath();
          ctx.arc(sx + Math.sin(t * 12 + sparkle) * 3, sy, 3 - sparkle * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Anti-air tracer rounds
    for (let tracer = 0; tracer < 8; tracer++) {
      const tracerPhase = (t * 3 + tracer * 0.4) % 1.5;
      if (tracerPhase < 1) {
        const tracerProgress = tracerPhase / 1;
        const startX = width * (0.2 + (tracer % 4) * 0.15);
        const startY = groundY + 20;
        const targetX = startX + (tracer % 2 === 0 ? 50 : -30);
        const targetY = height * 0.1;

        const tx = startX + (targetX - startX) * tracerProgress;
        const ty = startY + (targetY - startY) * tracerProgress;

        // Tracer bullet
        ctx.fillStyle = `rgba(255, 255, 150, ${1 - tracerProgress})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tracer line
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.4 - tracerProgress * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - (targetX - startX) * 0.1, ty - (targetY - startY) * 0.1);
        ctx.stroke();
      }
    }

    // Explosions in the sky (from missed shots)
    for (let skyExp = 0; skyExp < 2; skyExp++) {
      const expPhase = (t * 0.7 + skyExp * 2) % 3;
      if (expPhase < 0.8) {
        const expProgress = expPhase / 0.8;
        const expX = width * (0.3 + skyExp * 0.35) + Math.sin(skyExp * 5) * 30;
        const expY = height * (0.12 + skyExp * 0.08);
        const expSize = expProgress * 50;
        const expAlpha = 1 - expProgress;

        // Explosion flash
        const skyExpGrad = ctx.createRadialGradient(expX, expY, 0, expX, expY, expSize);
        skyExpGrad.addColorStop(0, `rgba(255, 255, 200, ${expAlpha})`);
        skyExpGrad.addColorStop(0.3, `rgba(255, 180, 80, ${expAlpha * 0.8})`);
        skyExpGrad.addColorStop(0.6, `rgba(255, 100, 30, ${expAlpha * 0.5})`);
        skyExpGrad.addColorStop(1, "transparent");
        ctx.fillStyle = skyExpGrad;
        ctx.beginPath();
        ctx.arc(expX, expY, expSize, 0, Math.PI * 2);
        ctx.fill();

        // Shrapnel
        for (let shrap = 0; shrap < 6; shrap++) {
          const shrapAngle = shrap * Math.PI / 3 + expProgress * 2;
          const shrapDist = expProgress * 40;
          ctx.fillStyle = `rgba(150, 150, 150, ${expAlpha})`;
          ctx.beginPath();
          ctx.arc(
            expX + Math.cos(shrapAngle) * shrapDist,
            expY + Math.sin(shrapAngle) * shrapDist,
            2,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Energy beams from towers
    const beamPhase = (t * 0.5) % 2;
    if (beamPhase < 0.3) {
      const beamAlpha = 1 - beamPhase / 0.3;

      // Lab tower energy beam
      ctx.strokeStyle = `rgba(100, 180, 255, ${beamAlpha * 0.8})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.50, groundY - 100);
      ctx.lineTo(width * 0.50, height * 0.05);
      ctx.stroke();

      ctx.strokeStyle = `rgba(200, 230, 255, ${beamAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Beam glow
      const beamGlow = ctx.createLinearGradient(width * 0.50 - 30, 0, width * 0.50 + 30, 0);
      beamGlow.addColorStop(0, "transparent");
      beamGlow.addColorStop(0.5, `rgba(100, 180, 255, ${beamAlpha * 0.3})`);
      beamGlow.addColorStop(1, "transparent");
      ctx.fillStyle = beamGlow;
      ctx.fillRect(width * 0.50 - 30, height * 0.05, 60, groundY - 100 - height * 0.05);
    }

    // === DETAILED TROOPS (Defenders) ===

    // Elite Knight - Heavy armored defender
    const drawKnight = (x: number, y: number, index: number, facing: number) => {
      const stance = Math.sin(t * 4 + index) * 2;
      const swordSwing = Math.sin(t * 6 + index) * 0.6;

      ctx.save();
      ctx.translate(x, y + Math.abs(stance * 0.5));
      ctx.scale(facing, 1);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 15, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cape
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-6, -15);
      ctx.quadraticCurveTo(-15, 5 + stance, -12, 18);
      ctx.lineTo(-4, 12);
      ctx.closePath();
      ctx.fill();

      // Legs with armor
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-5, 5, 4, 12);
      ctx.fillRect(1, 5, 4, 12);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(-5, 10, 4, 3);
      ctx.fillRect(1, 10, 4, 3);

      // Body armor
      const armorGrad = ctx.createLinearGradient(-8, -15, 8, 8);
      armorGrad.addColorStop(0, "#d1d5db");
      armorGrad.addColorStop(0.3, "#9ca3af");
      armorGrad.addColorStop(0.6, "#6b7280");
      armorGrad.addColorStop(1, "#4b5563");
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-8, -15);
      ctx.lineTo(8, -15);
      ctx.lineTo(10, -5);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fill();

      // Armor detail lines
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(6, -10);
      ctx.moveTo(-5, -3);
      ctx.lineTo(5, -3);
      ctx.stroke();

      // Princeton emblem on chest
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-4, -5);
      ctx.lineTo(0, 0);
      ctx.lineTo(4, -5);
      ctx.closePath();
      ctx.fill();

      // Helmet
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.arc(0, -20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.arc(0, -20, 8, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.fill();

      // Helmet plume
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-2, -26);
      ctx.quadraticCurveTo(0, -35 + stance * 0.5, 5, -32);
      ctx.quadraticCurveTo(2, -28, 0, -26);
      ctx.fill();

      // Visor
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(-5, -22, 10, 4);

      // Sword arm
      ctx.save();
      ctx.translate(10, -8);
      ctx.rotate(swordSwing);

      // Arm
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(0, -2, 12, 5);

      // Sword
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(10, -1, 20, 3);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(10, 0, 20, 1);
      // Hilt
      ctx.fillStyle = "#78350f";
      ctx.fillRect(6, -3, 5, 7);
      // Crossguard
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(5, -1, 2, 3);
      ctx.fillRect(11, -1, 2, 3);

      ctx.restore();

      // Shield arm
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(-12, -10, 5, 12);

      // Shield
      const shieldGrad = ctx.createLinearGradient(-18, -15, -12, 5);
      shieldGrad.addColorStop(0, "#f97316");
      shieldGrad.addColorStop(0.5, "#ea580c");
      shieldGrad.addColorStop(1, "#c2410c");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.lineTo(-22, -12);
      ctx.lineTo(-22, 2);
      ctx.lineTo(-18, 8);
      ctx.lineTo(-14, 2);
      ctx.lineTo(-14, -18);
      ctx.fill();

      // Shield emblem
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, -10);
      ctx.lineTo(-18, -2);
      ctx.moveTo(-20, -6);
      ctx.lineTo(-16, -6);
      ctx.stroke();

      ctx.restore();
    };

    // Archer troop
    const drawArcher = (x: number, y: number, index: number) => {
      const drawPhase = (t * 2 + index) % 3;
      const pullBack = drawPhase < 1.5 ? drawPhase / 1.5 : 0;

      ctx.save();
      ctx.translate(x, y);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 12, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cloak
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      ctx.quadraticCurveTo(-10, 5, -8, 12);
      ctx.lineTo(8, 12);
      ctx.quadraticCurveTo(10, 5, 5, -10);
      ctx.closePath();
      ctx.fill();

      // Body
      ctx.fillStyle = "#15803d";
      ctx.fillRect(-4, -8, 8, 15);

      // Head
      ctx.fillStyle = "#d6d3d1";
      ctx.beginPath();
      ctx.arc(0, -14, 6, 0, Math.PI * 2);
      ctx.fill();

      // Hood
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.arc(0, -14, 7, Math.PI, 0);
      ctx.fill();

      // Bow
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-10, -5, 15, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // Bowstring
      ctx.strokeStyle = "#a8a29e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10 + Math.cos(-Math.PI * 0.4) * 15, -5 + Math.sin(-Math.PI * 0.4) * 15);
      ctx.lineTo(-10 - pullBack * 8, -5);
      ctx.lineTo(-10 + Math.cos(Math.PI * 0.4) * 15, -5 + Math.sin(Math.PI * 0.4) * 15);
      ctx.stroke();

      // Arrow
      if (pullBack > 0.3) {
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10 - pullBack * 8, -5);
        ctx.lineTo(5, -5);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(10, -7);
        ctx.lineTo(10, -3);
        ctx.closePath();
        ctx.fill();
      }

      // Quiver
      ctx.fillStyle = "#78350f";
      ctx.fillRect(5, -12, 5, 15);
      ctx.strokeStyle = "#a8a29e";
      ctx.lineWidth = 1;
      for (let arrow = 0; arrow < 4; arrow++) {
        ctx.beginPath();
        ctx.moveTo(6 + arrow, -12);
        ctx.lineTo(6 + arrow, -18);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw detailed troop battles - spread MASSIVELY across entire battlefield
    const knightPositions = [
      { x: 0.12, y: 20, facing: 1 },
      { x: 0.22, y: 85, facing: -1 },
      { x: 0.35, y: 28, facing: 1 },
      { x: 0.48, y: 105, facing: -1 },
      { x: 0.58, y: 35, facing: 1 },
      { x: 0.68, y: 95, facing: -1 },
      { x: 0.78, y: 22, facing: 1 },
      { x: 0.40, y: 65, facing: -1 },
      { x: 0.28, y: 50, facing: 1 },
      { x: 0.52, y: 78, facing: -1 },
      { x: 0.85, y: 110, facing: 1 },
    ];

    for (let i = 0; i < knightPositions.length; i++) {
      const pos = knightPositions[i];
      const kx = width * pos.x;
      const ky = groundY + pos.y;
      drawKnight(kx, ky, i, pos.facing);

      // Combat clash effects
      if (Math.sin(t * 5 + i * 1.5) > 0.7) {
        // Metal clash sparks
        for (let spark = 0; spark < 8; spark++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkDist = Math.random() * 18;
          ctx.fillStyle = `rgba(255, 215, 0, ${0.9 - spark * 0.1})`;
          ctx.beginPath();
          ctx.arc(
            kx + pos.facing * 15 + Math.cos(sparkAngle) * sparkDist,
            ky - 10 + Math.sin(sparkAngle) * sparkDist,
            2.5 - spark * 0.2,
            0, Math.PI * 2
          );
          ctx.fill();
        }

        // Impact shockwave
        const shockPhase = (t * 8 + i) % 1;
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.5 - shockPhase * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(kx + pos.facing * 12, ky - 8, 5 + shockPhase * 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawHeroTiger(width * 0.22, groundY + 30);


    // Archers spread across back lines at different heights - MAXIMUM SPREAD
    const archerPositions = [
      { x: 0.04, y: 20 },
      { x: 0.08, y: 75 },
      { x: 0.14, y: 35 },
      { x: 0.06, y: 95 },
      { x: 0.18, y: 55 },
      { x: 0.75, y: 25 },
      { x: 0.82, y: 85 },
      { x: 0.88, y: 45 },
      { x: 0.92, y: 110 },
    ];

    for (let i = 0; i < archerPositions.length; i++) {
      const pos = archerPositions[i];
      const ax = width * pos.x;
      const ay = groundY + pos.y;
      drawArcher(ax, ay, i);

      // Flying arrows at different targets
      const arrowPhase = (t * 1.8 + i * 0.6) % 2.5;
      if (arrowPhase > 0.5 && arrowPhase < 2) {
        const arrowProgress = (arrowPhase - 0.5) / 1.5;
        // Target varies - some at ground enemies, some at flying
        const targetIsFlying = i % 2 === 0;
        const targetX = ax + 120 + i * 30;
        const targetY = targetIsFlying ? height * 0.35 : groundY + 40;

        const arrowX = ax + (targetX - ax) * arrowProgress;
        const arrowY = ay - 10 + (targetY - ay + 10) * arrowProgress - Math.sin(arrowProgress * Math.PI) * (targetIsFlying ? 60 : 35);

        ctx.save();
        ctx.translate(arrowX, arrowY);
        const arrowAngle = Math.atan2(
          targetY - ay + Math.cos(arrowProgress * Math.PI) * (targetIsFlying ? 60 : 35),
          targetX - ax
        );
        ctx.rotate(arrowAngle);
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(10, -2);
        ctx.lineTo(10, 2);
        ctx.closePath();
        ctx.fill();
        // Arrow trail glow
        ctx.strokeStyle = "rgba(255, 200, 100, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-25, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Additional foot soldiers scattered around - EVERYWHERE ON BATTLEFIELD
    const soldierPositions = [
      { x: 0.55, y: 100 },
      { x: 0.62, y: 30 },
      { x: 0.72, y: 90 },
      { x: 0.24, y: 105 },
      { x: 0.38, y: 40 },
      { x: 0.82, y: 35 },
      { x: 0.10, y: 110 },
      { x: 0.46, y: 95 },
      { x: 0.32, y: 60 },
      { x: 0.65, y: 50 },
      { x: 0.90, y: 85 },
      { x: 0.18, y: 70 },
    ];

    for (let i = 0; i < soldierPositions.length; i++) {
      const pos = soldierPositions[i];
      const sx = width * pos.x;
      const sy = groundY + pos.y;
      const bounce = Math.sin(t * 5 + i * 1.5) * 2;
      const swing = Math.sin(t * 6 + i * 2) * 0.5;

      ctx.save();
      ctx.translate(sx, sy + bounce);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 10, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = "#6b8e23";
      ctx.fillRect(-4, -12, 8, 14);

      // Armor vest
      ctx.fillStyle = "#4a5a2a";
      ctx.fillRect(-5, -10, 10, 10);

      // Head with helmet
      ctx.fillStyle = "#708090";
      ctx.beginPath();
      ctx.arc(0, -16, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a6a80";
      ctx.beginPath();
      ctx.arc(0, -16, 5, Math.PI, 0);
      ctx.fill();

      // Sword
      ctx.save();
      ctx.rotate(swing);
      ctx.strokeStyle = "#c0c0c0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(18, -10);
      ctx.stroke();
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(3, -10, 3, 5);
      ctx.restore();

      // Shield
      const shieldGrad = ctx.createLinearGradient(-10, -10, -4, 0);
      shieldGrad.addColorStop(0, "#f97316");
      shieldGrad.addColorStop(1, "#c2410c");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(-7, -5, 6, Math.PI * 0.4, Math.PI * 1.6);
      ctx.fill();

      ctx.restore();
    }

    // === EPIC PROJECTILES & COMBAT EFFECTS ===

    // Heavy Artillery - Cannon balls with explosive impact
    for (let i = 0; i < 3; i++) {
      const projPhase = (t * 1.8 + i * 1.2) % 3.5;
      if (projPhase < 2.5) {
        const startX = width * 0.35;
        const startY = groundY - 50;
        const endX = width * 0.68;
        const endY = groundY + 25;

        const progress = projPhase / 2.5;
        const px = startX + (endX - startX) * progress;
        const py = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 60;

        // Cannon ball with metallic sheen
        const ballGrad = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, 8);
        ballGrad.addColorStop(0, "#5a5a5a");
        ballGrad.addColorStop(0.3, "#3a3a3a");
        ballGrad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();

        // Glowing heat effect
        ctx.fillStyle = `rgba(255, 150, 50, ${0.4 + Math.sin(t * 10) * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        // Smoke trail with gradient
        for (let trail = 1; trail <= 6; trail++) {
          const trailAlpha = 0.4 - trail * 0.06;
          const trailX = px - trail * 10 * (1 - progress * 0.3);
          const trailY = py + trail * 4;
          ctx.fillStyle = `rgba(80, 80, 80, ${trailAlpha})`;
          ctx.beginPath();
          ctx.arc(trailX + Math.sin(t * 5 + trail) * 3, trailY, 4 + trail * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Impact prediction ring
        if (progress > 0.7) {
          const ringAlpha = (progress - 0.7) / 0.3;
          ctx.strokeStyle = `rgba(255, 100, 0, ${ringAlpha * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(endX, endY + 5, 15, 8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Explosion on impact
      const impactPhase = (projPhase - 2.5);
      if (impactPhase > 0 && impactPhase < 0.8) {
        const endX = width * 0.68;
        const endY = groundY + 25;
        const explosionSize = impactPhase * 60;
        const explosionAlpha = 1 - impactPhase / 0.8;

        // Multi-layer explosion
        for (let layer = 0; layer < 3; layer++) {
          const layerSize = explosionSize * (1 - layer * 0.2);
          const layerAlpha = explosionAlpha * (1 - layer * 0.25);
          const expGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, layerSize);
          expGrad.addColorStop(0, `rgba(255, 255, 200, ${layerAlpha})`);
          expGrad.addColorStop(0.3, `rgba(255, 150, 50, ${layerAlpha * 0.8})`);
          expGrad.addColorStop(0.6, `rgba(255, 80, 0, ${layerAlpha * 0.5})`);
          expGrad.addColorStop(1, "transparent");
          ctx.fillStyle = expGrad;
          ctx.beginPath();
          ctx.arc(endX, endY, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Debris particles
        for (let debris = 0; debris < 8; debris++) {
          const debrisAngle = debris * Math.PI / 4 + impactPhase * 2;
          const debrisDist = impactPhase * 50;
          const dx = endX + Math.cos(debrisAngle) * debrisDist;
          const dy = endY + Math.sin(debrisAngle) * debrisDist * 0.6 - impactPhase * 30;
          ctx.fillStyle = `rgba(100, 80, 60, ${explosionAlpha})`;
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Chain Lightning from Lab Tower - Multi-target electric arcs
    const lightningPhase = (t * 1.5) % 2;
    if (lightningPhase < 0.8) {
      const lightningAlpha = lightningPhase < 0.4 ? 1 : 1 - (lightningPhase - 0.4) / 0.4;

      // Main bolt
      ctx.strokeStyle = `rgba(150, 200, 255, ${lightningAlpha})`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const startX = width * 0.54;
      const startY = groundY - 85;

      // Primary target
      const target1X = width * 0.62;
      const target1Y = groundY + 35;

      // Draw jagged lightning
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let lx = startX;
      let ly = startY;
      const segments = 8;
      for (let seg = 0; seg < segments; seg++) {
        const progress = (seg + 1) / segments;
        const targetX = startX + (target1X - startX) * progress;
        const targetY = startY + (target1Y - startY) * progress;
        const jitter = (1 - progress) * 20;
        lx = targetX + (Math.random() - 0.5) * jitter;
        ly = targetY + (Math.random() - 0.5) * jitter * 0.5;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();

      // Secondary branches
      ctx.strokeStyle = `rgba(100, 180, 255, ${lightningAlpha * 0.7})`;
      ctx.lineWidth = 2;
      for (let branch = 0; branch < 3; branch++) {
        const branchStart = 3 + branch;
        const branchProgress = branchStart / segments;
        const bx = startX + (target1X - startX) * branchProgress;
        const by = startY + (target1Y - startY) * branchProgress;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + (Math.random() - 0.5) * 40, by + Math.random() * 30);
        ctx.stroke();
      }

      // Impact glow at target
      const impactGlow = ctx.createRadialGradient(target1X, target1Y, 0, target1X, target1Y, 25);
      impactGlow.addColorStop(0, `rgba(150, 200, 255, ${lightningAlpha * 0.8})`);
      impactGlow.addColorStop(0.5, `rgba(100, 150, 255, ${lightningAlpha * 0.4})`);
      impactGlow.addColorStop(1, "transparent");
      ctx.fillStyle = impactGlow;
      ctx.beginPath();
      ctx.arc(target1X, target1Y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Electric sparks
      for (let spark = 0; spark < 6; spark++) {
        const sparkAngle = spark * Math.PI / 3 + t * 10;
        const sparkDist = 15 + Math.sin(t * 20 + spark) * 8;
        ctx.fillStyle = `rgba(200, 230, 255, ${lightningAlpha})`;
        ctx.beginPath();
        ctx.arc(
          target1X + Math.cos(sparkAngle) * sparkDist,
          target1Y + Math.sin(sparkAngle) * sparkDist * 0.6,
          2, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Sonic Shockwaves from Blair Arch - Expanding purple rings
    for (let wave = 0; wave < 5; wave++) {
      const wavePhase = (t * 3 + wave * 0.8) % 4;
      if (wavePhase < 3) {
        const waveProgress = wavePhase / 3;
        const waveX = width * 0.75;
        const waveY = groundY - 10;
        const waveRadius = 20 + waveProgress * 100;
        const waveAlpha = (1 - waveProgress) * 0.5;

        // Main wave ring
        ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
        ctx.lineWidth = 4 - waveProgress * 3;
        ctx.beginPath();
        ctx.arc(waveX, waveY, waveRadius, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();

        // Inner resonance ring
        ctx.strokeStyle = `rgba(200, 150, 255, ${waveAlpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(waveX, waveY, waveRadius * 0.85, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();

        // Distortion ripples
        ctx.strokeStyle = `rgba(139, 92, 246, ${waveAlpha * 0.3})`;
        ctx.lineWidth = 1;
        for (let ripple = 0; ripple < 3; ripple++) {
          ctx.beginPath();
          ctx.arc(waveX, waveY, waveRadius + ripple * 5, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.stroke();
        }
      }
    }

    // === EPIC SPELL EFFECTS ===

    // Devastating Meteor Strike
    const meteorCycle = (t * 0.25) % 5;
    const meteorX = width * 0.58;

    if (meteorCycle < 1.5) {
      // Meteor descent
      const meteorProgress = meteorCycle / 1.5;
      const meteorStartY = -50;
      const meteorEndY = groundY + 20;
      const meteorY = meteorStartY + (meteorEndY - meteorStartY) * meteorProgress;

      // Meteor body with rocky texture
      const meteorSize = 18 + Math.sin(t * 10) * 2;
      const meteorGrad = ctx.createRadialGradient(meteorX - 3, meteorY - 3, 0, meteorX, meteorY, meteorSize);
      meteorGrad.addColorStop(0, "#fbbf24");
      meteorGrad.addColorStop(0.3, "#f97316");
      meteorGrad.addColorStop(0.6, "#dc2626");
      meteorGrad.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = meteorGrad;
      ctx.beginPath();
      ctx.arc(meteorX, meteorY, meteorSize, 0, Math.PI * 2);
      ctx.fill();

      // Rocky surface detail
      ctx.fillStyle = "#991b1b";
      for (let rock = 0; rock < 5; rock++) {
        const rockAngle = rock * Math.PI * 0.4 + t * 2;
        ctx.beginPath();
        ctx.arc(
          meteorX + Math.cos(rockAngle) * meteorSize * 0.5,
          meteorY + Math.sin(rockAngle) * meteorSize * 0.5,
          4, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // Massive fire trail
      for (let flame = 0; flame < 8; flame++) {
        const flameProgress = flame / 8;
        const flameY = meteorY - 15 - flame * 15;
        const flameX = meteorX + Math.sin(t * 15 + flame * 2) * (5 + flame * 2);
        const flameSize = meteorSize * (1 - flameProgress * 0.7);
        const flameAlpha = 0.8 - flameProgress * 0.6;

        const flameGrad = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
        flameGrad.addColorStop(0, `rgba(255, 255, 150, ${flameAlpha})`);
        flameGrad.addColorStop(0.4, `rgba(255, 150, 50, ${flameAlpha * 0.7})`);
        flameGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trailing sparks
      for (let spark = 0; spark < 12; spark++) {
        const sparkAge = (t * 8 + spark * 0.5) % 1;
        const sparkX = meteorX + (Math.random() - 0.5) * 30;
        const sparkY = meteorY - 20 - sparkAge * 80;
        ctx.fillStyle = `rgba(255, 200, 100, ${1 - sparkAge})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warning indicator on ground
      const warningAlpha = 0.3 + Math.sin(t * 10) * 0.2;
      ctx.strokeStyle = `rgba(255, 50, 50, ${warningAlpha})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(meteorX, meteorEndY + 10, 35, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

    } else if (meteorCycle < 2.5) {
      // Catastrophic impact explosion
      const impactProgress = (meteorCycle - 1.5);
      const impactAlpha = 1 - impactProgress;
      const impactY = groundY + 20;

      // Multi-layer explosion dome
      for (let layer = 0; layer < 4; layer++) {
        const layerDelay = layer * 0.1;
        const layerProgress = Math.max(0, impactProgress - layerDelay);
        const layerSize = layerProgress * 120 * (1 - layer * 0.15);
        const layerAlpha = impactAlpha * (1 - layer * 0.2);

        const expGrad = ctx.createRadialGradient(meteorX, impactY, 0, meteorX, impactY, layerSize);
        expGrad.addColorStop(0, `rgba(255, 255, 220, ${layerAlpha})`);
        expGrad.addColorStop(0.2, `rgba(255, 200, 50, ${layerAlpha * 0.9})`);
        expGrad.addColorStop(0.5, `rgba(255, 100, 0, ${layerAlpha * 0.6})`);
        expGrad.addColorStop(0.8, `rgba(200, 50, 0, ${layerAlpha * 0.3})`);
        expGrad.addColorStop(1, "transparent");
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(meteorX, impactY, layerSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shockwave ring
      const shockSize = impactProgress * 150;
      ctx.strokeStyle = `rgba(255, 150, 50, ${impactAlpha * 0.6})`;
      ctx.lineWidth = 5 - impactProgress * 4;
      ctx.beginPath();
      ctx.ellipse(meteorX, impactY + 10, shockSize, shockSize * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Flying debris and rocks
      for (let debris = 0; debris < 15; debris++) {
        const debrisAngle = debris * Math.PI * 2 / 15;
        const debrisDist = impactProgress * 80 + Math.sin(debris * 3) * 20;
        const debrisHeight = Math.sin(impactProgress * Math.PI) * 60 * (1 + Math.sin(debris) * 0.3);
        const dx = meteorX + Math.cos(debrisAngle) * debrisDist;
        const dy = impactY - debrisHeight + Math.sin(debrisAngle) * debrisDist * 0.3;

        ctx.fillStyle = `rgba(80, 60, 40, ${impactAlpha})`;
        ctx.beginPath();
        ctx.arc(dx, dy, 3 + (debris % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground crack marks
      ctx.strokeStyle = `rgba(50, 30, 20, ${impactAlpha})`;
      ctx.lineWidth = 2;
      for (let crack = 0; crack < 8; crack++) {
        const crackAngle = crack * Math.PI / 4;
        const crackLen = 30 + Math.sin(crack * 2) * 15;
        ctx.beginPath();
        ctx.moveTo(meteorX, impactY + 10);
        ctx.lineTo(
          meteorX + Math.cos(crackAngle) * crackLen,
          impactY + 10 + Math.sin(crackAngle) * crackLen * 0.4
        );
        ctx.stroke();
      }
    }

    // Arctic Freeze Spell (periodic)
    const freezePhase = (t * 0.2 + 2) % 5;
    if (freezePhase < 1.5) {
      const freezeX = width * 0.4;
      const freezeY = groundY + 30;
      const freezeProgress = freezePhase / 1.5;
      const freezeRadius = freezeProgress * 80;
      const freezeAlpha = 1 - freezeProgress * 0.5;

      // Ice expansion
      const iceGrad = ctx.createRadialGradient(freezeX, freezeY, 0, freezeX, freezeY, freezeRadius);
      iceGrad.addColorStop(0, `rgba(200, 230, 255, ${freezeAlpha * 0.6})`);
      iceGrad.addColorStop(0.5, `rgba(150, 200, 255, ${freezeAlpha * 0.4})`);
      iceGrad.addColorStop(1, "transparent");
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.arc(freezeX, freezeY, freezeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ice crystals
      ctx.strokeStyle = `rgba(200, 240, 255, ${freezeAlpha})`;
      ctx.lineWidth = 2;
      for (let crystal = 0; crystal < 8; crystal++) {
        const crystalAngle = crystal * Math.PI / 4 + freezeProgress * 2;
        const crystalLen = freezeRadius * 0.7;
        ctx.beginPath();
        ctx.moveTo(freezeX, freezeY);
        ctx.lineTo(
          freezeX + Math.cos(crystalAngle) * crystalLen,
          freezeY + Math.sin(crystalAngle) * crystalLen * 0.5
        );
        ctx.stroke();

        // Crystal branches
        const branchX = freezeX + Math.cos(crystalAngle) * crystalLen * 0.6;
        const branchY = freezeY + Math.sin(crystalAngle) * crystalLen * 0.3;
        ctx.beginPath();
        ctx.moveTo(branchX, branchY);
        ctx.lineTo(branchX + Math.cos(crystalAngle + 0.5) * 15, branchY + Math.sin(crystalAngle + 0.5) * 8);
        ctx.moveTo(branchX, branchY);
        ctx.lineTo(branchX + Math.cos(crystalAngle - 0.5) * 15, branchY + Math.sin(crystalAngle - 0.5) * 8);
        ctx.stroke();
      }

      // Floating ice particles
      for (let ice = 0; ice < 20; ice++) {
        const iceAngle = ice * Math.PI / 10 + t * 2;
        const iceDist = freezeRadius * (0.3 + Math.sin(ice) * 0.5);
        const iceSize = 2 + Math.sin(t * 5 + ice) * 1;
        ctx.fillStyle = `rgba(200, 240, 255, ${freezeAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(
          freezeX + Math.cos(iceAngle) * iceDist,
          freezeY + Math.sin(iceAngle) * iceDist * 0.5 - Math.sin(t * 4 + ice) * 10,
          iceSize, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    // === ENHANCED WEATHER PARTICLES ===

    if (scene.particles === "leaves") {
      // Autumn leaves with rotation and varied colors
      const leafColors = ["#4ade80", "#22c55e", "#84cc16", "#eab308"];
      for (let i = 0; i < 25; i++) {
        const lx = ((t * 35 + i * 50) % (width + 150)) - 75;
        const ly = ((t * 25 + i * 35 + Math.sin(t + i) * 30) % (height * 0.85));
        const leafColor = leafColors[i % leafColors.length];
        const leafAlpha = 0.4 + Math.sin(t * 2 + i) * 0.2;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(t * 3 + i * 0.5);
        ctx.fillStyle = leafColor + Math.floor(leafAlpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Leaf vein
        ctx.strokeStyle = leafColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();
      }
    } else if (scene.particles === "embers") {
      // Volcanic embers with glow trails
      for (let i = 0; i < 35; i++) {
        const ex = (i * 37 + Math.sin(t * 0.8 + i) * 40) % width;
        const ey = height - ((t * 50 + i * 25) % (height * 0.9));
        const emberPulse = 0.5 + Math.sin(t * 8 + i * 2) * 0.5;

        // Glow
        const emberGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
        emberGlow.addColorStop(0, `rgba(255, 200, 50, ${emberPulse * 0.6})`);
        emberGlow.addColorStop(0.5, `rgba(255, 100, 0, ${emberPulse * 0.3})`);
        emberGlow.addColorStop(1, "transparent");
        ctx.fillStyle = emberGlow;
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 220, 100, ${emberPulse})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (scene.particles === "snow") {
      // Detailed snowflakes with drift
      for (let i = 0; i < 50; i++) {
        const drift = Math.sin(t * 0.5 + i * 0.3) * 30;
        const sx = (i * 31 + drift + t * 10) % (width + 60) - 30;
        const sy = ((t * 30 + i * 20) % (height + 30)) - 15;
        const snowSize = 1.5 + (i % 3);
        const snowAlpha = 0.5 + Math.sin(i) * 0.3;

        ctx.fillStyle = `rgba(255, 255, 255, ${snowAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, snowSize, 0, Math.PI * 2);
        ctx.fill();

        // Snowflake sparkle
        if (i % 5 === 0) {
          ctx.fillStyle = `rgba(200, 230, 255, ${snowAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(sx, sy, snowSize * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (scene.particles === "sand") {
      // Sandstorm with wind streaks
      for (let i = 0; i < 40; i++) {
        const sx = ((t * 80 + i * 35) % (width + 120)) - 60;
        const sy = height * 0.3 + (i % 12) * 25 + Math.sin(t * 2 + i) * 15;
        const sandAlpha = 0.2 + Math.sin(t + i * 0.5) * 0.15;

        // Sand particle
        ctx.fillStyle = `rgba(251, 191, 36, ${sandAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Wind streak
        ctx.strokeStyle = `rgba(251, 191, 36, ${sandAlpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 20, sy + 2);
        ctx.stroke();
      }
    } else if (scene.particles === "fireflies") {
      // Bioluminescent fireflies with pulsing glow
      for (let i = 0; i < 20; i++) {
        const fx = (i * 57 + Math.sin(t * 0.6 + i) * 50) % width;
        const fy = height * 0.35 + (i % 6) * 35 + Math.cos(t * 0.4 + i) * 25;
        const glowPhase = (t * 2 + i * 0.7) % 2;
        const glow = glowPhase < 1 ? Math.sin(glowPhase * Math.PI) : 0;

        if (glow > 0.1) {
          // Glow aura
          const fireflyGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
          fireflyGlow.addColorStop(0, `rgba(150, 255, 150, ${glow * 0.8})`);
          fireflyGlow.addColorStop(0.5, `rgba(100, 220, 100, ${glow * 0.4})`);
          fireflyGlow.addColorStop(1, "transparent");
          ctx.fillStyle = fireflyGlow;
          ctx.beginPath();
          ctx.arc(fx, fy, 12, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(200, 255, 200, ${glow})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (scene.particles === "magic") {
      // Mystical arcane particles with trails
      for (let i = 0; i < 30; i++) {
        const mx = (i * 43 + Math.sin(t * 1.2 + i) * 35) % width;
        const my = ((height - t * 40 - i * 30) % (height + 80)) + 40;
        const magicHue = (t * 60 + i * 25) % 360;
        const magicAlpha = 0.6 + Math.sin(t * 3 + i) * 0.3;

        // Magic glow
        const magicGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
        magicGlow.addColorStop(0, `hsla(${magicHue}, 90%, 70%, ${magicAlpha})`);
        magicGlow.addColorStop(0.5, `hsla(${magicHue}, 80%, 50%, ${magicAlpha * 0.5})`);
        magicGlow.addColorStop(1, "transparent");
        ctx.fillStyle = magicGlow;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.strokeStyle = `hsla(${magicHue}, 80%, 60%, ${magicAlpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx - Math.sin(t + i) * 15, my + 20);
        ctx.stroke();
      }
    }

    // === CINEMATIC FOG / ATMOSPHERE ===

    // Layered atmospheric fog
    const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
    fogGrad.addColorStop(0, "rgba(28, 25, 23, 0.45)");
    fogGrad.addColorStop(0.3, "rgba(28, 25, 23, 0.15)");
    fogGrad.addColorStop(0.6, "rgba(28, 25, 23, 0.1)");
    fogGrad.addColorStop(0.85, "rgba(28, 25, 23, 0.25)");
    fogGrad.addColorStop(1, "rgba(28, 25, 23, 0.65)");
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height);

    // Volumetric fog wisps
    for (let layer = 0; layer < 3; layer++) {
      const layerAlpha = 0.08 - layer * 0.02;
      ctx.fillStyle = `rgba(100, 90, 80, ${layerAlpha})`;
      for (let wisp = 0; wisp < 3; wisp++) {
        const wx = ((t * (12 - layer * 3) + wisp * 200 + layer * 100) % (width + 400)) - 200;
        const wy = height * (0.2 + layer * 0.15 + wisp * 0.1);
        const ww = 150 + layer * 30;
        const wh = 40 + layer * 10;
        ctx.beginPath();
        ctx.ellipse(wx, wy, ww, wh, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dramatic vignette
    const vignetteGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.15,
      width / 2,
      height / 2,
      width * 0.8
    );
    vignetteGrad.addColorStop(0, "transparent");
    vignetteGrad.addColorStop(0.5, "rgba(28, 25, 23, 0.45)");
    vignetteGrad.addColorStop(0.75, "rgba(28, 25, 23, 0.5)");
    vignetteGrad.addColorStop(1, "rgba(20, 18, 16, 0.9)");
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);
  }, [animTime, currentScene]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 text-center relative overflow-hidden">
      {/* Content with ornate frame */}
      <div
        className="relative z-10 w-full h-full rounded-2xl overflow-hidden"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border30}`,
          boxShadow: `0 0 30px ${GOLD.glow07}, inset 0 0 20px ${GOLD.glow04}`,
        }}
      >
        {/* Canvas Battle Scene */}
        <div className="opacity-30">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <OrnateFrame
          className="relative flex w-full items-center justify-center backdrop-blur-xs p-4 sm:p-8 h-full overflow-hidden"
          cornerSize={40}
          showBorders={true}
          color="#b45309"
          glowColor="#f59e0b"
        >
          {/* Inner ghost border */}
          <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />

          <div className="flex flex-col items-center relative z-20">
            {/* Decorative top flourish */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-px" style={{ background: dividerGradient }} />

            <button
              onClick={onSelectFarthestLevel}
              className="size-14 sm:size-24 rounded-full flex items-center justify-center mb-2 sm:mb-4 backdrop-blur-sm hover:scale-110 transition-all cursor-pointer active:scale-95 group relative"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `2px solid ${GOLD.border35}`,
                boxShadow: `0 0 20px ${GOLD.glow07}, inset 0 0 12px ${GOLD.glow04}`,
              }}
            >
              <div className="absolute inset-[3px] rounded-full pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
              <MapPin size={28} className="sm:hidden text-amber-400 drop-shadow-lg group-hover:text-amber-200 transition-colors" />
              <MapPin size={40} className="hidden sm:block text-amber-400 drop-shadow-lg group-hover:text-amber-200 transition-colors" />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-amber-100 mb-1 sm:mb-2 drop-shadow-lg tracking-wide">
              Select a Battlefield
            </h3>
            <p className="text-amber-400/80 text-xs sm:text-sm max-w-xs drop-shadow-md leading-relaxed text-center">
              Tap the pin above or any unlocked location on the map to begin your campaign
            </p>

            {/* Decorative divider */}
            <div className="my-3 sm:my-5 flex items-center gap-3 w-full max-w-[200px]">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border30})` }} />
              <div className="w-2 h-2 rotate-45" style={{ background: GOLD.border35, border: `1px solid ${GOLD.accentBorder40}` }} />
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border30}, transparent)` }} />
            </div>

            {/* Legend items */}
            <div className="flex items-center gap-3 text-xs text-amber-300">
              <div className="w-4 h-4 rounded-full animate-pulse" style={{
                background: `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`,
                border: `1.5px solid ${GOLD.accentBorder40}`,
                boxShadow: `0 0 8px ${GOLD.accentGlow08}`
              }} />
              <span className="font-medium tracking-wide">= Unlocked Location</span>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center gap-3 text-xs text-amber-300/70">
              <div className="w-4 h-4 flex items-center justify-center rounded-full animate-pulse" style={{
                background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                border: `1.5px solid ${NEUTRAL.border}`,
                boxShadow: `0 0 6px ${NEUTRAL.glow}`
              }} >
                <Lock size={10} className="text-gray-400" />
              </div>
              <span className="font-medium tracking-wide">= Locked Location</span>
            </div>

            {/* Decorative bottom flourish */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-px" style={{ background: dividerGradient }} />
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

