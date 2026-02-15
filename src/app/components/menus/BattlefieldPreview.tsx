"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { MapPin, Lock } from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { PANEL, GOLD, NEUTRAL, SELECTED, panelGradient, dividerGradient } from "../ui/theme";

export const BattlefieldPreview: React.FC<{ animTime: number; onSelectFarthestLevel?: () => void }> = ({ animTime, onSelectFarthestLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const timeRef = useRef(0);
  const lastCanvasSizeRef = useRef({ w: 0, h: 0 });

  // Keep time ref in sync with prop
  useEffect(() => { timeRef.current = animTime; }, [animTime]);

  // Cycle through scenes every 6 seconds (only update state when scene actually changes)
  const prevSceneRef = useRef(0);
  useEffect(() => {
    const sceneIndex = Math.floor(animTime / 6) % 6;
    if (sceneIndex !== prevSceneRef.current) {
      prevSceneRef.current = sceneIndex;
      setCurrentScene(sceneIndex);
    }
  }, [animTime]);

  // Draw battle scene on canvas — own rAF loop decoupled from React renders
  const drawScene = useCallback((currentSceneIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Only resize canvas when dimensions actually change
    if (lastCanvasSizeRef.current.w !== width || lastCanvasSizeRef.current.h !== height) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      lastCanvasSizeRef.current = { w: width, h: height };
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t = timeRef.current;

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
    const scene = scenes[currentSceneIdx];

    // === BACKGROUND LAYERS ===

    // Sky gradient with atmospheric glow
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, scene.bg1);
    bgGrad.addColorStop(0.4, scene.bg2);
    bgGrad.addColorStop(1, scene.groundColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Atmospheric glow orbs (flat circles instead of full-screen radial gradient fills)
    for (let i = 0; i < 3; i++) {
      const glowX = width * (0.2 + i * 0.3) + Math.sin(t * 0.3 + i * 2) * 30;
      const glowY = height * 0.25 + Math.cos(t * 0.2 + i) * 20;
      ctx.fillStyle = scene.skyGlow;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 80, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = "#57534e";
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

      // Inner crater (flat)
      ctx.fillStyle = "#2a2520";
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

    // Helper: Draw isometric shadow (flat fill, no gradient for perf)
    const drawTowerShadow = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(x, y + h * 0.3, w * 1.1, h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // NASSAU CANNON TOWER - Formidable Medieval Artillery Platform
    const drawCannonTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Cache trig values
      const sinT3 = Math.sin(t * 3);
      const sinT15 = Math.sin(t * 1.5);
      const sinT2 = Math.sin(t * 2);
      const glowPulse = 0.5 + sinT3 * 0.3;

      // Isometric base platform - heavy stone
      ctx.fillStyle = "#4a4a4e";
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(30, 0);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();
      // Base top face highlight
      ctx.fillStyle = "#58585e";
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(0, -14);
      ctx.lineTo(30, 0);
      ctx.lineTo(0, -3);
      ctx.closePath();
      ctx.fill();

      // Ammunition crates at base
      ctx.fillStyle = "#5a4a2a";
      ctx.fillRect(-27, -8, 11, 8);
      ctx.fillStyle = "#4a3a1a";
      ctx.fillRect(-27, -8, 11, 2);
      ctx.strokeStyle = "#3a2a0a";
      ctx.lineWidth = 1;
      ctx.strokeRect(-27, -8, 11, 8);
      // Stacked crate
      ctx.fillStyle = "#5e4e2e";
      ctx.fillRect(-25, -13, 8, 5);
      ctx.fillStyle = "#6a5a3a";
      ctx.fillRect(-25, -13, 8, 1.5);

      // Main tower body - stone masonry
      const towerGrad = ctx.createLinearGradient(-24, -65, 24, 0);
      towerGrad.addColorStop(0, "#5a5a60");
      towerGrad.addColorStop(0.5, "#48484e");
      towerGrad.addColorStop(1, "#38383e");
      ctx.fillStyle = towerGrad;
      ctx.beginPath();
      ctx.moveTo(-24, -5);
      ctx.lineTo(-24, -56);
      ctx.lineTo(-20, -63);
      ctx.lineTo(20, -63);
      ctx.lineTo(24, -56);
      ctx.lineTo(24, -5);
      ctx.closePath();
      ctx.fill();

      // Stone masonry mortar lines (batched horizontal)
      ctx.strokeStyle = "#2e2e34";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let row = 0; row < 6; row++) {
        const my = -8 - row * 9;
        ctx.moveTo(-23, my);
        ctx.lineTo(23, my);
      }
      ctx.stroke();

      // Vertical mortar joints (alternating per row, batched)
      ctx.beginPath();
      for (let row = 0; row < 6; row++) {
        const my = -8 - row * 9;
        const offset = (row % 2) * 7;
        for (let col = 0; col < 4; col++) {
          const mx = -17 + col * 12 + offset;
          if (mx > -23 && mx < 23) {
            ctx.moveTo(mx, my);
            ctx.lineTo(mx, my - 9);
          }
        }
      }
      ctx.stroke();

      // Iron reinforcement bands
      ctx.fillStyle = "#3a3a42";
      ctx.fillRect(-24, -21, 48, 3);
      ctx.fillRect(-24, -43, 48, 3);

      // Battle damage - cracks (batched)
      ctx.strokeStyle = "#2a2a30";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -28);
      ctx.lineTo(-6, -34);
      ctx.lineTo(-8, -37);
      ctx.moveTo(12, -12);
      ctx.lineTo(16, -18);
      ctx.lineTo(14, -21);
      ctx.stroke();

      // Scorch mark
      ctx.fillStyle = "rgba(30,20,10,0.4)";
      ctx.beginPath();
      ctx.ellipse(8, -30, 6, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Key rivets (batched - 4 total, down from 15)
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.arc(-21, -21, 2, 0, Math.PI * 2);
      ctx.arc(21, -21, 2, 0, Math.PI * 2);
      ctx.arc(-21, -43, 2, 0, Math.PI * 2);
      ctx.arc(21, -43, 2, 0, Math.PI * 2);
      ctx.fill();

      // Glow strips on sides
      ctx.fillStyle = `rgba(255, 102, 0, ${glowPulse})`;
      ctx.fillRect(-23, -55, 3, 47);
      ctx.fillRect(20, -55, 3, 47);

      // Crenellations (batched rects)
      ctx.fillStyle = "#4a4a52";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-16 + i * 8, -75, 6, 14);
      }
      ctx.fillStyle = "#5a5a62";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-16 + i * 8, -75, 6, 3);
      }

      // Turret platform
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(0, -63, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Turret ring glow
      ctx.strokeStyle = `rgba(255, 102, 0, ${glowPulse * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -63, 18, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy cannon assembly
      const cannonAngle = sinT15 * 0.2 - 0.15;
      ctx.save();
      ctx.translate(0, -68);
      ctx.rotate(cannonAngle);

      // Cannon housing - thick imposing barrel
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.arc(-6, 0, 12, Math.PI * 0.5, Math.PI * 1.5);
      ctx.lineTo(38, -8);
      ctx.lineTo(44, -5);
      ctx.lineTo(44, 5);
      ctx.lineTo(38, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();
      // Cannon top highlight
      ctx.fillStyle = "#4a4a54";
      ctx.fillRect(-6, -8, 50, 4);

      // Barrel reinforcement rings (batched stroke)
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, -8);
      ctx.lineTo(10, 8);
      ctx.moveTo(22, -8);
      ctx.lineTo(22, 8);
      ctx.moveTo(34, -7);
      ctx.lineTo(34, 7);
      ctx.stroke();

      // Mechanical gear on cannon breech
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-6, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Gear cross (rotates)
      const grCos = Math.cos(t * 2);
      const grSin = Math.sin(t * 2);
      ctx.beginPath();
      ctx.moveTo(-6 + grCos * 7, grSin * 7);
      ctx.lineTo(-6 - grCos * 7, -grSin * 7);
      ctx.moveTo(-6 + grSin * 7, -grCos * 7);
      ctx.lineTo(-6 - grSin * 7, grCos * 7);
      ctx.stroke();

      // Muzzle bore
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(44, 0, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Muzzle flash (flat fills, no gradient)
      const firePhase = (t * 2) % 3;
      if (firePhase < 0.3) {
        const flashSize = 1 - firePhase / 0.3;
        ctx.fillStyle = `rgba(255, 200, 80, ${flashSize * 0.8})`;
        ctx.beginPath();
        ctx.arc(38, -73, 18 * flashSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 120, 20, ${flashSize * 0.5})`;
        ctx.beginPath();
        ctx.arc(38, -73, 28 * flashSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Smoke particles (reduced from 5 to 3)
      for (let i = 0; i < 3; i++) {
        const smokeAge = (t * 1.5 + i * 0.6) % 2;
        if (smokeAge < 1.5) {
          const sx = 32 + smokeAge * 15 + Math.sin(t * 3 + i * 2.1) * 5;
          const sy = -78 - smokeAge * 25;
          const sr = 4 + smokeAge * 7;
          ctx.globalAlpha = 0.35 - smokeAge * 0.2;
          ctx.fillStyle = "#888";
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Glowing windows (unrolled, no loop)
      const winGlow = 0.5 + sinT2 * 0.3;
      ctx.fillStyle = `rgba(255, 180, 100, ${winGlow})`;
      ctx.fillRect(-8, -35, 6, 10);
      ctx.fillRect(2, -35, 6, 10);
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 1;
      ctx.strokeRect(-8, -35, 6, 10);
      ctx.strokeRect(2, -35, 6, 10);

      ctx.restore();
    };

    // E-QUAD LAB TOWER - High-tech Energy Facility with Tesla Coils
    const drawLabTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Cache trig values
      const sinT4 = Math.sin(t * 4);
      const sinT6 = Math.sin(t * 6);

      // Isometric base (flat colors, no gradient)
      ctx.fillStyle = "#3a4a5a";
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();
      // Base top highlight
      ctx.fillStyle = "#4a5a6a";
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, -12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -2);
      ctx.closePath();
      ctx.fill();

      // Main lab building - angular modern design
      const labGrad = ctx.createLinearGradient(-25, -80, 25, 0);
      labGrad.addColorStop(0, "#5a6a7a");
      labGrad.addColorStop(0.5, "#3e4e5e");
      labGrad.addColorStop(1, "#2a3a4a");
      ctx.fillStyle = labGrad;
      ctx.beginPath();
      ctx.moveTo(-24, -5);
      ctx.lineTo(-24, -62);
      ctx.lineTo(-20, -72);
      ctx.lineTo(0, -80);
      ctx.lineTo(20, -72);
      ctx.lineTo(24, -62);
      ctx.lineTo(24, -5);
      ctx.closePath();
      ctx.fill();

      // Tech panel lines (batched single stroke)
      ctx.strokeStyle = "#2a3a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(-22, -15 - i * 15);
        ctx.lineTo(22, -15 - i * 15);
      }
      ctx.stroke();

      // Glowing conduit pipes running up building sides
      const conduitGlow = 0.5 + sinT4 * 0.3;
      ctx.strokeStyle = `rgba(96, 165, 250, ${conduitGlow})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Left conduit
      ctx.moveTo(-19, -5);
      ctx.lineTo(-19, -35);
      ctx.lineTo(-15, -52);
      ctx.lineTo(-15, -68);
      // Right conduit
      ctx.moveTo(19, -5);
      ctx.lineTo(19, -35);
      ctx.lineTo(15, -52);
      ctx.lineTo(15, -68);
      ctx.stroke();

      // Conduit junction nodes (batched)
      ctx.fillStyle = `rgba(140, 200, 255, ${conduitGlow * 1.3})`;
      ctx.beginPath();
      ctx.arc(-19, -20, 2.5, 0, Math.PI * 2);
      ctx.arc(-15, -52, 2.5, 0, Math.PI * 2);
      ctx.arc(19, -20, 2.5, 0, Math.PI * 2);
      ctx.arc(15, -52, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Central energy core with concentric rings
      const corePulse = 0.6 + sinT4 * 0.4;
      const coreGrad = ctx.createRadialGradient(0, -44, 0, 0, -44, 18);
      coreGrad.addColorStop(0, `rgba(160, 210, 255, ${corePulse})`);
      coreGrad.addColorStop(0.4, `rgba(96, 165, 250, ${corePulse * 0.6})`);
      coreGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, -44, 18, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rotating ring arcs around core
      for (let ring = 0; ring < 3; ring++) {
        const ringR = 8 + ring * 5;
        const ringRot = t * (3 - ring) + ring * 1.5;
        ctx.strokeStyle = `rgba(120, 180, 255, ${0.6 - ring * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -44, ringR, ringRot, ringRot + Math.PI * 1.2);
        ctx.stroke();
      }

      // Viewing window behind core
      ctx.fillStyle = `rgba(96, 165, 250, ${0.3 + corePulse * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(-10, -54);
      ctx.lineTo(-10, -34);
      ctx.lineTo(10, -34);
      ctx.lineTo(10, -54);
      ctx.lineTo(0, -59);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a4a5a";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Antenna array at top (3 antennas, batched strokes)
      ctx.strokeStyle = "#7a8a9a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -80);
      ctx.lineTo(0, -105);
      ctx.moveTo(-10, -74);
      ctx.lineTo(-12, -96);
      ctx.moveTo(10, -74);
      ctx.lineTo(12, -96);
      ctx.stroke();
      // Antenna tips (batched fill)
      const antGlow = 0.6 + sinT6 * 0.4;
      ctx.fillStyle = `rgba(150, 200, 255, ${antGlow})`;
      ctx.beginPath();
      ctx.arc(0, -107, 3, 0, Math.PI * 2);
      ctx.arc(-12, -98, 2.5, 0, Math.PI * 2);
      ctx.arc(12, -98, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Cross-bars between antennas
      ctx.strokeStyle = "#5a6a7a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-11, -90);
      ctx.lineTo(11, -90);
      ctx.moveTo(-10.5, -84);
      ctx.lineTo(10.5, -84);
      ctx.stroke();

      // Tesla coils - dual spires
      for (let side = -1; side <= 1; side += 2) {
        const coilX = side * 20;

        // Coil body
        ctx.fillStyle = "#5a6a7a";
        ctx.beginPath();
        ctx.moveTo(coilX - 4, -72);
        ctx.lineTo(coilX - 3, -93);
        ctx.lineTo(coilX + 3, -93);
        ctx.lineTo(coilX + 4, -72);
        ctx.closePath();
        ctx.fill();

        // Coil rings (batched horizontal strokes)
        ctx.strokeStyle = "#7a8a9a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let ring = 0; ring < 3; ring++) {
          const ry = -76 - ring * 6;
          ctx.moveTo(coilX - 4 + ring * 0.3, ry);
          ctx.lineTo(coilX + 4 - ring * 0.3, ry);
        }
        ctx.stroke();

        // Energy sphere at tip (flat fills, no gradient)
        const spherePulse = 0.7 + Math.sin(t * 6 + side * 2) * 0.3;
        ctx.fillStyle = `rgba(170, 210, 255, ${spherePulse})`;
        ctx.beginPath();
        ctx.arc(coilX, -97, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(220, 240, 255, ${spherePulse})`;
        ctx.beginPath();
        ctx.arc(coilX, -97, 3, 0, Math.PI * 2);
        ctx.fill();

        // Electric arcs (deterministic 2-segment, Math.sin not Math.random)
        const arcPhase = (t * 5 + side * 3) % 1;
        if (arcPhase < 0.7) {
          ctx.strokeStyle = `rgba(150, 200, 255, ${0.7 - arcPhase})`;
          ctx.lineWidth = 1.5;
          const midX = coilX + side * 18 + Math.sin(t * 4 + side) * 8;
          const midY = -87 + Math.sin(t * 5 + side * 2) * 6;
          const endX = coilX + side * 30 + Math.sin(t * 3 + side) * 10;
          const endY = -77 + Math.sin(t * 6 + side * 3) * 8;
          ctx.beginPath();
          ctx.moveTo(coilX, -97);
          ctx.lineTo(midX, midY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      // Floating energy particles (reduced from 8 to 4)
      for (let p = 0; p < 4; p++) {
        const pAngle = (t * 2 + p * Math.PI * 0.5) % (Math.PI * 2);
        const pCos = Math.cos(pAngle);
        const pSin = Math.sin(pAngle);
        const pDist = 25 + Math.sin(t * 3 + p) * 5;
        ctx.fillStyle = `rgba(150, 200, 255, ${0.5 + Math.sin(t * 5 + p) * 0.3})`;
        ctx.beginPath();
        ctx.arc(pCos * pDist, -80 + pSin * 8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // BLAIR ARCH TOWER - Imposing Gothic Cathedral with Sonic Waves
    const drawArchTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Cache trig
      const sinT2 = Math.sin(t * 2);
      const sinT3 = Math.sin(t * 3);

      // Isometric base (flat colors, no gradient)
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(30, 0);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#6a5a4a";
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(0, -14);
      ctx.lineTo(30, 0);
      ctx.lineTo(0, -4);
      ctx.closePath();
      ctx.fill();

      // Flying buttresses on both sides
      for (let side = -1; side <= 1; side += 2) {
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(side * 26, -10);
        ctx.lineTo(side * 36, 2);
        ctx.lineTo(side * 34, 2);
        ctx.lineTo(side * 24, -15);
        ctx.lineTo(side * 24, -42);
        ctx.lineTo(side * 26, -40);
        ctx.closePath();
        ctx.fill();
        // Buttress pinnacle cap
        ctx.fillStyle = "#6a5a4a";
        ctx.beginPath();
        ctx.moveTo(side * 24, -42);
        ctx.lineTo(side * 25, -47);
        ctx.lineTo(side * 27, -40);
        ctx.lineTo(side * 26, -40);
        ctx.closePath();
        ctx.fill();
      }

      // Gothic columns with fluting (flat color - 12px width too small for gradient detail)
      for (let side = -1; side <= 1; side += 2) {
        const colX = side * 20;
        ctx.fillStyle = "#7a6a5a";
        ctx.fillRect(colX - 6, -62, 12, 67);

        // Fluting lines (batched)
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let f = -2; f <= 2; f++) {
          ctx.moveTo(colX + f * 2, -57);
          ctx.lineTo(colX + f * 2, 0);
        }
        ctx.stroke();

        // Capital
        ctx.fillStyle = "#8a7a6a";
        ctx.beginPath();
        ctx.moveTo(colX - 9, -62);
        ctx.lineTo(colX - 11, -67);
        ctx.lineTo(colX + 11, -67);
        ctx.lineTo(colX + 9, -62);
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

      // Gargoyle perched on right side
      ctx.fillStyle = "#555";
      ctx.beginPath();
      ctx.moveTo(27, -56);
      ctx.lineTo(34, -51);
      ctx.lineTo(37, -53);
      ctx.lineTo(36, -59);
      ctx.lineTo(31, -63);
      ctx.lineTo(27, -59);
      ctx.closePath();
      ctx.fill();
      // Gargoyle head
      ctx.fillStyle = "#4a4a4a";
      ctx.beginPath();
      ctx.arc(37, -57, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Gargoyle wing
      ctx.fillStyle = "#505050";
      ctx.beginPath();
      ctx.moveTo(29, -59);
      ctx.lineTo(25, -69);
      ctx.lineTo(33, -63);
      ctx.closePath();
      ctx.fill();

      // Gothic arch - outer
      ctx.strokeStyle = "#8a7a6a";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, -55, 26, Math.PI, 0);
      ctx.stroke();

      // Gothic arch - inner
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -55, 20, Math.PI, 0);
      ctx.stroke();

      // Dark arch interior
      ctx.fillStyle = "#1a1510";
      ctx.beginPath();
      ctx.arc(0, -55, 17, Math.PI, 0);
      ctx.lineTo(17, -5);
      ctx.lineTo(-17, -5);
      ctx.lineTo(-17, -55);
      ctx.closePath();
      ctx.fill();

      // Bell hanging in the arch
      ctx.fillStyle = "#b8a040";
      ctx.beginPath();
      ctx.moveTo(-5, -61);
      ctx.lineTo(-7, -51);
      ctx.quadraticCurveTo(-8, -48, 0, -46);
      ctx.quadraticCurveTo(8, -48, 7, -51);
      ctx.lineTo(5, -61);
      ctx.closePath();
      ctx.fill();
      // Bell highlight
      ctx.fillStyle = "#d0c060";
      ctx.beginPath();
      ctx.moveTo(-3, -59);
      ctx.lineTo(-4, -52);
      ctx.quadraticCurveTo(-2, -49, 0, -49);
      ctx.lineTo(0, -59);
      ctx.closePath();
      ctx.fill();
      // Bell clapper (swings)
      const clapperSwing = sinT3 * 2;
      ctx.fillStyle = "#806020";
      ctx.beginPath();
      ctx.arc(clapperSwing, -45, 2, 0, Math.PI * 2);
      ctx.fill();
      // Bell mount bar
      ctx.strokeStyle = "#806020";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -63);
      ctx.lineTo(5, -63);
      ctx.stroke();

      // Keystone
      ctx.fillStyle = "#9a8a7a";
      ctx.beginPath();
      ctx.moveTo(-6, -82);
      ctx.lineTo(0, -90);
      ctx.lineTo(6, -82);
      ctx.lineTo(4, -76);
      ctx.lineTo(-4, -76);
      ctx.closePath();
      ctx.fill();

      // Ornate spires with orbs
      for (let side = -1; side <= 1; side += 2) {
        const spireX = side * 24;
        ctx.fillStyle = "#7a6a5a";
        ctx.beginPath();
        ctx.moveTo(spireX - 4, -67);
        ctx.lineTo(spireX, -100);
        ctx.lineTo(spireX + 4, -67);
        ctx.closePath();
        ctx.fill();
        // Spire orb
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(spireX, -103, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stained glass rose window (multi-colored segments)
      const rosePulse = 0.5 + sinT2 * 0.3;
      // Outer warm glow ring
      ctx.fillStyle = `rgba(200, 170, 80, ${rosePulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, -55, 15, 0, Math.PI * 2);
      ctx.fill();
      // 6 colored stained glass wedges
      const glassR = [220, 60, 60, 200, 160, 60];
      const glassG = [60, 120, 180, 160, 60, 180];
      const glassB = [60, 220, 80, 60, 200, 200];
      for (let seg = 0; seg < 6; seg++) {
        const a1 = seg * Math.PI / 3;
        const a2 = a1 + Math.PI / 3;
        ctx.fillStyle = `rgba(${glassR[seg]}, ${glassG[seg]}, ${glassB[seg]}, ${rosePulse * 0.45})`;
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.arc(0, -55, 12, a1, a2);
        ctx.closePath();
        ctx.fill();
      }
      // Rose window spokes (batched)
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let spoke = 0; spoke < 6; spoke++) {
        const angle = spoke * Math.PI / 3;
        ctx.moveTo(0, -55);
        ctx.lineTo(Math.cos(angle) * 14, -55 + Math.sin(angle) * 14);
      }
      ctx.stroke();
      // Center jewel
      ctx.fillStyle = `rgba(255, 220, 180, ${rosePulse})`;
      ctx.beginPath();
      ctx.arc(0, -55, 3, 0, Math.PI * 2);
      ctx.fill();

      // Sonic wave emissions (reduced from 5 to 3, no distortion double-stroke)
      const waveSpeed = t * 4;
      for (let wave = 0; wave < 3; wave++) {
        const wavePhase = ((waveSpeed + wave * 1.8) % 6) / 6;
        const waveRadius = 15 + wavePhase * 70;
        const waveAlpha = (1 - wavePhase) * 0.5;
        if (waveAlpha > 0.05) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
          ctx.lineWidth = 3 - wavePhase * 2;
          ctx.beginPath();
          ctx.arc(0, -55, waveRadius, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    // DINKY STATION - Charming Victorian Train Depot
    const drawDinkyStation = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 15, 50, 25);

      // Cache trig values
      const sinT15 = Math.sin(t * 1.5);
      const sinT2 = Math.sin(t * 2);
      const sinT06 = Math.sin(t * 0.6);

      // Platform base with edge detail
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(-48, 5, 96, 12);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(-48, 5, 96, 4);
      ctx.fillStyle = "#555";
      ctx.fillRect(-48, 5, 96, 1.5);

      // Station building - Victorian style
      const stationGrad = ctx.createLinearGradient(-35, -55, 35, 0);
      stationGrad.addColorStop(0, "#6a5a4a");
      stationGrad.addColorStop(0.5, "#4a3a2a");
      stationGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = stationGrad;
      ctx.fillRect(-35, -45, 70, 50);

      // Decorative Victorian trim bands
      ctx.fillStyle = "#7a6a5a";
      ctx.fillRect(-38, -48, 76, 5);
      ctx.fillRect(-38, -5, 76, 5);
      // Mid-band decorative molding
      ctx.fillStyle = "#6a5a4a";
      ctx.fillRect(-36, -22, 72, 2);

      // Windows with warm glow
      const windowGlow = 0.5 + sinT15 * 0.2;
      for (let w = 0; w < 3; w++) {
        ctx.fillStyle = `rgba(255, 200, 120, ${windowGlow})`;
        ctx.fillRect(-25 + w * 20, -35, 12, 18);
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = 2;
        ctx.strokeRect(-25 + w * 20, -35, 12, 18);
        // Window cross (batched per window)
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

      // Roof tiles pattern (batched)
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let tile = 0; tile < 6; tile++) {
        ctx.moveTo(-35 + tile * 14, -48);
        ctx.lineTo(-28 + tile * 14, -55);
      }
      ctx.stroke();

      // Platform canopy extending over tracks
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(-40, -10, 80, 4);
      // Canopy front edge
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(-40, -6, 80, 2);
      // Support pillars (thin iron columns)
      ctx.fillStyle = "#5a5a5a";
      ctx.fillRect(-37, -10, 2, 15);
      ctx.fillRect(-12, -10, 2, 15);
      ctx.fillRect(10, -10, 2, 15);
      ctx.fillRect(35, -10, 2, 15);

      // Luggage/cargo on platform
      // Trunk
      ctx.fillStyle = "#6a4a2a";
      ctx.fillRect(20, -2, 10, 7);
      ctx.fillStyle = "#5a3a1a";
      ctx.fillRect(20, -2, 10, 2);
      // Barrel
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.ellipse(-30, 1, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-34, -1);
      ctx.lineTo(-26, -1);
      ctx.moveTo(-34, 3);
      ctx.lineTo(-26, 3);
      ctx.stroke();

      // Signal light on post (right side)
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(42, -30, 2, 35);
      // Signal housing
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(40, -34, 6, 6);
      // Signal light (alternating red/green)
      const signalPhase = Math.sin(t * 1.5) > 0;
      ctx.fillStyle = signalPhase ? "#44cc44" : "#cc4444";
      ctx.beginPath();
      ctx.arc(43, -31, 2, 0, Math.PI * 2);
      ctx.fill();

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
      // Clock hands (cache trig)
      const hourAngle = t * 0.1;
      const minAngle = t * 1.2;
      const hourSin = Math.sin(hourAngle);
      const hourCos = Math.cos(hourAngle);
      const minSin = Math.sin(minAngle);
      const minCos = Math.cos(minAngle);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(hourSin * 3, -70 - hourCos * 3);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(minSin * 5, -70 - minCos * 5);
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
      const trainX = sinT06 * 35;
      const trainBounce = Math.abs(Math.sin(t * 8)) * 1;
      const tb = trainBounce;

      // Train shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(trainX, 18, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Locomotive body (flat color, no gradient for moving object)
      ctx.fillStyle = "#f97316";
      ctx.fillRect(trainX - 15, -8 - tb, 30, 18);
      // Body highlight
      ctx.fillStyle = "#ff8833";
      ctx.fillRect(trainX - 15, -8 - tb, 30, 4);

      // Cowcatcher at front
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.moveTo(trainX + 15, 4 - tb);
      ctx.lineTo(trainX + 20, 10 - tb);
      ctx.lineTo(trainX + 15, 10 - tb);
      ctx.closePath();
      ctx.fill();
      // Cowcatcher bars
      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(trainX + 15, 2 - tb);
      ctx.lineTo(trainX + 19, 9 - tb);
      ctx.moveTo(trainX + 15, 6 - tb);
      ctx.lineTo(trainX + 18, 10 - tb);
      ctx.stroke();

      // Cabin
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(trainX - 12, -18 - tb, 12, 12);

      // Cabin window
      ctx.fillStyle = `rgba(255, 200, 120, ${0.6 + sinT2 * 0.2})`;
      ctx.fillRect(trainX - 10, -16 - tb, 8, 6);

      // Smokestack
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(trainX + 5, -22 - tb, 6, 14);
      // Smokestack cap
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(trainX + 4, -23 - tb, 8, 3);

      // Wheels (batched fills, then batched cross spokes)
      const wheelRot = t * 8;
      const wrCos = Math.cos(wheelRot);
      const wrSin = Math.sin(wheelRot);
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(trainX - 10, 8, 5, 0, Math.PI * 2);
      ctx.arc(trainX, 8, 5, 0, Math.PI * 2);
      ctx.arc(trainX + 10, 8, 5, 0, Math.PI * 2);
      ctx.fill();
      // Simplified cross spokes for all 3 wheels (batched)
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let wheel = 0; wheel < 3; wheel++) {
        const wx = trainX - 10 + wheel * 10;
        ctx.moveTo(wx + wrCos * 4, 8 + wrSin * 4);
        ctx.lineTo(wx - wrCos * 4, 8 - wrSin * 4);
        ctx.moveTo(wx + wrSin * 4, 8 - wrCos * 4);
        ctx.lineTo(wx - wrSin * 4, 8 + wrCos * 4);
      }
      ctx.stroke();

      // Steam puffs (reduced from 5 to 3)
      for (let puff = 0; puff < 3; puff++) {
        const puffAge = (t * 2 + puff * 0.7) % 2.5;
        if (puffAge < 2) {
          const px = trainX + 8 + puffAge * 8 + Math.sin(t * 4 + puff * 2.1) * 4;
          const py = -26 - tb - puffAge * 15;
          const pSize = 3 + puffAge * 6;
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
      ctx.fillText("P", trainX, 2 - tb);

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

      // Dark aura dripping effect
      const sinT2i = Math.sin(t * 2 + index);
      const dripAlpha = 0.15 + sinT2i * 0.05;
      ctx.fillStyle = `rgba(20, 60, 20, ${dripAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 8, 16, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Drip tendrils
      for (let d = 0; d < 3; d++) {
        const dripLen = 4 + Math.sin(t * 3 + d) * 2;
        ctx.fillStyle = `rgba(10, 40, 10, ${0.2 - d * 0.05})`;
        ctx.beginPath();
        ctx.ellipse(-6 + d * 6, 18 + Math.sin(t * 2.5 + d * 2.1 + index) * 6, 2, dripLen, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 18 - float, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Book cover - flat menacing dark green
      ctx.fillStyle = "#1a6b35";
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(12, -12);
      ctx.lineTo(12, 14);
      ctx.lineTo(-10, 14);
      ctx.closePath();
      ctx.fill();

      // Spine - darker
      ctx.fillStyle = "#0d4020";
      ctx.fillRect(-12, -12, 3, 26);

      // Mystical chain binding the book
      ctx.strokeStyle = "#8b7355";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, -2);
      ctx.lineTo(12, -2);
      ctx.stroke();
      // Chain links
      ctx.strokeStyle = "#a08860";
      ctx.lineWidth = 1;
      for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        ctx.ellipse(-8 + c * 6, -2, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Padlock
      ctx.fillStyle = "#8b7355";
      ctx.fillRect(-2, -5, 4, 4);
      ctx.strokeStyle = "#a08860";
      ctx.beginPath();
      ctx.arc(0, -6, 2, Math.PI, 0);
      ctx.stroke();

      // Pages with torn/ragged edges
      ctx.fillStyle = "#e0d8c0";
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(8, -12);
      ctx.lineTo(9, -8);
      ctx.lineTo(7, -4);
      ctx.lineTo(9, 0);
      ctx.lineTo(7, 4);
      ctx.lineTo(9, 8);
      ctx.lineTo(7, 12);
      ctx.lineTo(-8, 12);
      ctx.closePath();
      ctx.fill();

      // Stained page marks
      ctx.fillStyle = "rgba(80, 40, 20, 0.15)";
      ctx.beginPath();
      ctx.arc(2, 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Mystical text lines
      ctx.strokeStyle = "#6b5b4b";
      ctx.lineWidth = 0.5;
      for (let line = 0; line < 5; line++) {
        ctx.beginPath();
        ctx.moveTo(-6, -8 + line * 4);
        ctx.lineTo(5 + Math.sin(line * 1.7) * 2, -8 + line * 4);
        ctx.stroke();
      }

      // Evil eyes - more expressive
      const sinT6i = Math.sin(t * 6 + index);
      const eyePulse = 0.7 + sinT6i * 0.3;
      ctx.fillStyle = `rgba(220, 38, 38, ${eyePulse})`;
      ctx.beginPath();
      ctx.arc(-2, -2, 3, 0, Math.PI * 2);
      ctx.arc(5, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Pupils
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(-2, -2, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Angry brow lines
      ctx.strokeStyle = "#660000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, -6);
      ctx.lineTo(-1, -4.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(4, -4.5);
      ctx.stroke();

      // Floating varied symbols - reduced to 3
      const symbols = ["\u03A3", "\u222B", "\u03C0"];
      const sinT4i = Math.sin(t * 4 + index);
      const symAlpha = 0.3 + sinT4i * 0.2;
      ctx.fillStyle = `rgba(74, 222, 128, ${symAlpha})`;
      ctx.font = "8px serif";
      for (let sym = 0; sym < 3; sym++) {
        const symAngle = t * 2 + sym * 2.094;
        const symCos = Math.cos(symAngle);
        const symSin = Math.sin(symAngle);
        const symDist = 18 + Math.sin(t * 3 + sym) * 3;
        ctx.fillText(symbols[sym], symCos * symDist, -5 + symSin * symDist * 0.5);
      }

      ctx.restore();
    };

    // Nassau Lion - Legendary Stone Golem Boss
    const drawNassauLion = (x: number, y: number) => {
      const stomp = Math.abs(Math.sin(t * 1.5)) * 3;
      const sinT12 = Math.sin(t * 1.2);
      const breathe = sinT12 * 2;
      const sinT2 = Math.sin(t * 2);
      const sinT3 = Math.sin(t * 3);
      const sinT4 = Math.sin(t * 4);
      ctx.save();
      ctx.translate(x, y + stomp);

      // Massive shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 25, 35, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dust particles at feet (only 3)
      for (let d = 0; d < 3; d++) {
        const dustX = -15 + d * 15 + Math.sin(t * 2 + d * 3.7) * 5;
        const dustY = 22 + Math.sin(t * 1.5 + d * 2.1) * 3;
        const dustAlpha = 0.15 + Math.sin(t * 3 + d * 1.3) * 0.1;
        ctx.fillStyle = `rgba(120, 113, 108, ${dustAlpha})`;
        ctx.beginPath();
        ctx.arc(dustX, dustY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

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

      // Shoulder armor plates
      ctx.fillStyle = "#57534e";
      ctx.beginPath();
      ctx.moveTo(-28, -32);
      ctx.lineTo(-38, -25);
      ctx.lineTo(-36, -18);
      ctx.lineTo(-28, -20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(28, -32);
      ctx.lineTo(38, -25);
      ctx.lineTo(36, -18);
      ctx.lineTo(28, -20);
      ctx.closePath();
      ctx.fill();
      // Armor edge highlights
      ctx.strokeStyle = "#78716c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-38, -25);
      ctx.lineTo(-36, -18);
      ctx.moveTo(38, -25);
      ctx.lineTo(36, -18);
      ctx.stroke();

      // Cracked glowing veins (lava-like)
      const veinGlow = 0.5 + sinT3 * 0.3;
      ctx.strokeStyle = `rgba(239, 68, 68, ${veinGlow})`;
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
      // Additional lava veins
      ctx.strokeStyle = `rgba(251, 146, 60, ${veinGlow * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -28);
      ctx.lineTo(-8, -15);
      ctx.lineTo(-2, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, -20);
      ctx.lineTo(22, -8);
      ctx.lineTo(18, 5);
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

      // Majestic stone mane with pointed shards - reduced to 8 per row
      for (let maneRow = 0; maneRow < 2; maneRow++) {
        const r = 28 + maneRow * 8;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 - Math.PI * 0.5;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const maneX = cosA * r;
          const maneY = -50 + breathe + sinA * r;
          const manePulse = Math.sin(t * 2 + i * 0.5) * 2;
          const shardLen = 12 - maneRow * 3;
          ctx.fillStyle = maneRow === 0 ? "#a8a29e" : "#78716c";
          ctx.beginPath();
          // Pointed shard tip
          ctx.moveTo(maneX + cosA * shardLen, maneY + sinA * shardLen + manePulse);
          // Base
          ctx.lineTo(maneX + Math.cos(angle + 1.2) * 4, maneY + Math.sin(angle + 1.2) * 4 + manePulse);
          ctx.lineTo(maneX + Math.cos(angle - 1.2) * 4, maneY + Math.sin(angle - 1.2) * 4 + manePulse);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Face details
      ctx.fillStyle = "#292524";
      ctx.beginPath();
      ctx.ellipse(0, -42 + breathe, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing fierce eyes - flat colors for performance
      const eyeIntensity = 0.7 + sinT4 * 0.3;
      for (let eye = -1; eye <= 1; eye += 2) {
        // Eye glow - flat
        ctx.fillStyle = `rgba(234, 179, 8, ${eyeIntensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(eye * 10, -55 + breathe, 8, 0, Math.PI * 2);
        ctx.fill();
        // Eye core
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.ellipse(eye * 10, -55 + breathe, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(eye * 10, -55 + breathe, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Elaborate crown/horns with gem
      ctx.fillStyle = "#c9a227";
      for (let horn = -1; horn <= 1; horn += 2) {
        // Main horn - larger
        ctx.beginPath();
        ctx.moveTo(horn * 15, -72 + breathe);
        ctx.lineTo(horn * 22, -92 + breathe);
        ctx.lineTo(horn * 12, -70 + breathe);
        ctx.closePath();
        ctx.fill();
        // Secondary horn prong
        ctx.fillStyle = "#b8941e";
        ctx.beginPath();
        ctx.moveTo(horn * 18, -80 + breathe);
        ctx.lineTo(horn * 28, -88 + breathe);
        ctx.lineTo(horn * 16, -78 + breathe);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c9a227";
      }
      // Crown gem (center)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, -74 + breathe, 3, 0, Math.PI * 2);
      ctx.fill();
      // Gem highlight
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(-1, -75 + breathe, 1, 0, Math.PI * 2);
      ctx.fill();

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
      const sinT5i = Math.sin(t * 5 + index);
      const sinT3i = Math.sin(t * 3 + index);
      const sinT6i = Math.sin(t * 6 + index);
      const sinT2i = Math.sin(t * 2 + index);
      const sinT7i = Math.sin(t * 7 + index);
      const wingFlap = sinT5i * 0.6;
      const bodyWave = sinT3i * 4;
      const breathPulse = sinT6i * 2;
      const aggressiveTilt = sinT2i * 0.08;
      ctx.save();
      ctx.translate(x, y + bodyWave);
      ctx.scale(scale, scale);
      ctx.rotate(aggressiveTilt);

      // DARK AURA - reduced to 2 layers
      for (let auraLayer = 0; auraLayer < 2; auraLayer++) {
        const auraGrad = ctx.createRadialGradient(0, 0, 10 + auraLayer * 20, 0, 0, 90 + auraLayer * 20);
        auraGrad.addColorStop(0, `rgba(180, 60, 30, ${0.2 - auraLayer * 0.08})`);
        auraGrad.addColorStop(0.5, `rgba(100, 30, 20, ${0.12 - auraLayer * 0.04})`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 90 + auraLayer * 20, 60 + auraLayer * 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }


      // Deadly spiked tail
      const sinT5 = Math.sin(t * 5);
      const sinT4 = Math.sin(t * 4);
      ctx.strokeStyle = "#4a2020";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-22, 15);
      ctx.quadraticCurveTo(-55, 22 + sinT5 * 12, -85, 8 + sinT4 * 15);
      ctx.stroke();
      ctx.strokeStyle = "#3a1515";
      ctx.lineWidth = 5;
      ctx.stroke();
      // 3 pre-positioned tail spikes
      ctx.fillStyle = "#2a1010";
      const tailSpikes = [[-35, 0], [-55, 2], [-75, 4]];
      for (const [sx, seedOff] of tailSpikes) {
        const sy = 18 + Math.sin(t * 5 + seedOff) * 8;
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

        // Wing vein patterns
        ctx.strokeStyle = "rgba(120, 50, 50, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, -20);
        ctx.quadraticCurveTo(50, -35, 70, -40);
        ctx.moveTo(35, -10);
        ctx.quadraticCurveTo(55, -20, 75, -25);
        ctx.moveTo(30, 0);
        ctx.quadraticCurveTo(50, -5, 68, -10);
        ctx.stroke();

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

        // Wing claws
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

      // Armored chest plates
      ctx.fillStyle = "#4a1818";
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(0, -14);
      ctx.lineTo(12, -8);
      ctx.lineTo(8, 4);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();
      // Chest plate edge
      ctx.strokeStyle = "#6a3030";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(0, -14);
      ctx.lineTo(12, -8);
      ctx.stroke();
      // Embedded gem on chest
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(-1, -5, 1, 0, Math.PI * 2);
      ctx.fill();

      // Glowing rune markings on body
      const runeGlow = 0.4 + sinT3i * 0.3;
      ctx.strokeStyle = `rgba(255, 100, 0, ${runeGlow})`;
      ctx.lineWidth = 1;
      // Rune 1 - left side
      ctx.beginPath();
      ctx.moveTo(-18, -4);
      ctx.lineTo(-22, 4);
      ctx.lineTo(-16, 8);
      ctx.moveTo(-22, 4);
      ctx.lineTo(-26, 2);
      ctx.stroke();
      // Rune 2 - right side
      ctx.beginPath();
      ctx.moveTo(18, -4);
      ctx.lineTo(22, 4);
      ctx.lineTo(16, 8);
      ctx.moveTo(22, 4);
      ctx.lineTo(26, 2);
      ctx.stroke();

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

      // TERRIFYING GLOWING EYE - flat glow for performance
      const eyePulse = 0.85 + sinT7i * 0.15;
      ctx.fillStyle = `rgba(255, 200, 50, ${eyePulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(32, -14, 14, 0, Math.PI * 2);
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

      // MASSIVE curved horns - more menacing
      ctx.fillStyle = "#3a1515";
      // Left horn - curved backward
      ctx.beginPath();
      ctx.moveTo(22, -18);
      ctx.quadraticCurveTo(10, -40, 0, -52);
      ctx.quadraticCurveTo(-5, -55, -8, -50);
      ctx.lineTo(8, -42);
      ctx.quadraticCurveTo(16, -32, 26, -20);
      ctx.closePath();
      ctx.fill();
      // Right horn - curved backward
      ctx.beginPath();
      ctx.moveTo(35, -22);
      ctx.quadraticCurveTo(45, -42, 52, -56);
      ctx.quadraticCurveTo(56, -58, 58, -52);
      ctx.lineTo(48, -44);
      ctx.quadraticCurveTo(42, -34, 38, -22);
      ctx.closePath();
      ctx.fill();
      // Center horn
      ctx.fillStyle = "#2a1010";
      ctx.beginPath();
      ctx.moveTo(28, -20);
      ctx.lineTo(30, -42);
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

      // Fire breath - reduced flames with flat colors
      if (sinT2i > -0.2) {
        for (let flame = 0; flame < 5; flame++) {
          const flameX = 58 + flame * 15;
          const flameY = -2 + Math.sin(t * 12 + flame * 0.5) * 6;
          const flameSize = 12 - flame * 2;
          const flameAlpha = 0.85 - flame * 0.15;
          // Outer flame - flat color
          ctx.fillStyle = `rgba(255, 100, 0, ${flameAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize * 1.3, 0, Math.PI * 2);
          ctx.fill();
          // Inner flame core - flat
          ctx.fillStyle = `rgba(255, 220, 100, ${flameAlpha})`;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ember particles - reduced to 5
        for (let ember = 0; ember < 5; ember++) {
          const emberAge = (t * 3 + ember * 0.7) % 2;
          const emberX = 60 + emberAge * 50 + Math.sin(t * 10 + ember * 3) * 15;
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
      const sinT5 = Math.sin(t * 5);
      ctx.save();
      ctx.translate(x, y + Math.abs(walk));

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 12, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy armored body (flat for small sprite performance)
      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.moveTo(-14, 10);
      ctx.lineTo(-16, -10);
      ctx.quadraticCurveTo(-14, -22, 0, -25);
      ctx.quadraticCurveTo(14, -22, 16, -10);
      ctx.lineTo(14, 10);
      ctx.closePath();
      ctx.fill();

      // Armor plate lines
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -5);
      ctx.lineTo(12, -5);
      ctx.moveTo(-10, 5);
      ctx.lineTo(10, 5);
      ctx.stroke();

      // Battle scars on armor
      ctx.strokeStyle = "#1e3a8a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, -15);
      ctx.lineTo(-5, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, -12);
      ctx.lineTo(9, -6);
      ctx.lineTo(7, -2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(0, 5);
      ctx.stroke();

      // Chainmail visible at joints (neck and waist)
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-8, -18, 16, 3);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 0.5;
      for (let cm = 0; cm < 5; cm++) {
        ctx.beginPath();
        ctx.arc(-6 + cm * 3, -16.5, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Waist chainmail
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-12, 7, 24, 3);
      for (let cm = 0; cm < 7; cm++) {
        ctx.beginPath();
        ctx.arc(-10 + cm * 3.3, 8.5, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Shoulder pauldrons
      ctx.fillStyle = "#3b82f6";
      // Left pauldron
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.lineTo(-22, -14);
      ctx.lineTo(-22, -8);
      ctx.lineTo(-14, -10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Right pauldron
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(14, -18);
      ctx.lineTo(22, -14);
      ctx.lineTo(22, -8);
      ctx.lineTo(14, -10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1e40af";
      ctx.stroke();
      // Pauldron rivets
      ctx.fillStyle = "#93c5fd";
      ctx.beginPath();
      ctx.arc(-18, -12, 1, 0, Math.PI * 2);
      ctx.arc(18, -12, 1, 0, Math.PI * 2);
      ctx.fill();

      // Imposing helmet with face guard
      ctx.fillStyle = "#1e40af";
      ctx.beginPath();
      ctx.arc(0, -22, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-10, -22, 20, 5);
      // Helmet crest ridge
      ctx.fillStyle = "#1e3a8a";
      ctx.beginPath();
      ctx.moveTo(-2, -32);
      ctx.lineTo(0, -35);
      ctx.lineTo(2, -32);
      ctx.lineTo(2, -22);
      ctx.lineTo(-2, -22);
      ctx.closePath();
      ctx.fill();
      // Face guard (vertical bars)
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -20);
      ctx.lineTo(-4, -14);
      ctx.moveTo(0, -20);
      ctx.lineTo(0, -14);
      ctx.moveTo(4, -20);
      ctx.lineTo(4, -14);
      ctx.stroke();
      // Visor slit (glowing eyes behind guard)
      ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + sinT5 * 0.3})`;
      ctx.fillRect(-6, -19, 12, 2);

      // Shield on left arm
      ctx.save();
      ctx.translate(-16, -2);
      ctx.rotate(-0.15);
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, -6);
      ctx.lineTo(8, 8);
      ctx.lineTo(0, 12);
      ctx.lineTo(-8, 8);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();
      // Shield border
      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Shield emblem (cross)
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 8);
      ctx.moveTo(-5, 1);
      ctx.lineTo(5, 1);
      ctx.stroke();
      // Shield boss
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, 1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Heavy mace weapon (right arm)
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
      // Spikes - reduced to 4
      for (let spike = 0; spike < 4; spike++) {
        const sAngle = spike * Math.PI / 2;
        const sCos = Math.cos(sAngle);
        const sSin = Math.sin(sAngle);
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.moveTo(2 + sCos * 6, -28 + sSin * 6);
        ctx.lineTo(2 + sCos * 12, -28 + sSin * 12);
        ctx.lineTo(2 + Math.cos(sAngle + 0.3) * 6, -28 + Math.sin(sAngle + 0.3) * 6);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    };

    // Flying Rival Mascot - MENACING DEMONIC HARPY
    const drawFlyingMascot = (x: number, y: number, index: number, scale: number = 0.7) => {
      const sinT10i = Math.sin(t * 10 + index);
      const sinT4i = Math.sin(t * 4 + index);
      const sinT6i = Math.sin(t * 6 + index);
      const sinT8i = Math.sin(t * 8 + index);
      const sinT3i = Math.sin(t * 3 + index);
      const wingFlap = sinT10i * 0.7;
      const hover = sinT4i * 8;
      const aggressiveTilt = sinT6i * 0.15;
      const breathPulse = sinT8i * 2;
      ctx.save();
      ctx.translate(x, y + hover);
      ctx.scale(scale, scale);
      ctx.rotate(aggressiveTilt);

      // Threatening dark aura - reduced to 2 layers
      const auraIntensity = 0.4 + Math.sin(t * 5 + index) * 0.2;
      for (let layer = 0; layer < 2; layer++) {
        const auraGrad = ctx.createRadialGradient(0, 0, 5 + layer * 12, 0, 0, 55 + layer * 10);
        auraGrad.addColorStop(0, `rgba(180, 50, 50, ${auraIntensity * (0.3 - layer * 0.12)})`);
        auraGrad.addColorStop(0.5, `rgba(100, 20, 60, ${auraIntensity * (0.2 - layer * 0.08)})`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 55 + layer * 10, 40 + layer * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Electric crackling particles - reduced to 3
      for (let p = 0; p < 3; p++) {
        const pAngle = (t * 3 + p * 2.094 + index) % (Math.PI * 2);
        const pDist = 30 + Math.sin(t * 8 + p * 2.5) * 8;
        const pCos = Math.cos(pAngle);
        const pSin = Math.sin(pAngle);
        ctx.fillStyle = `rgba(255, 100, 100, ${0.6 + Math.sin(t * 12 + p * 3) * 0.4})`;
        ctx.beginPath();
        ctx.arc(pCos * pDist, pSin * pDist * 0.6, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Forked demon tail
      const tailWave = Math.sin(t * 4 + index) * 3;
      ctx.strokeStyle = "#1a3535";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.quadraticCurveTo(-5, 30 + tailWave, -3, 42);
      ctx.stroke();
      // Fork prongs
      ctx.fillStyle = "#1a3535";
      ctx.beginPath();
      ctx.moveTo(-3, 40);
      ctx.lineTo(-9, 50);
      ctx.lineTo(-4, 44);
      ctx.lineTo(3, 50);
      ctx.lineTo(-2, 40);
      ctx.closePath();
      ctx.fill();
      // Tail tip glow - flat
      ctx.fillStyle = `rgba(255, 80, 80, ${0.3 + sinT6i * 0.2})`;
      ctx.beginPath();
      ctx.arc(-3, 45, 4, 0, Math.PI * 2);
      ctx.fill();

      // RAZOR-SHARP angular wings
      for (let side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.rotate(wingFlap * side * 1.2);

        // Outer wing membrane - angular bat-like shape (flat for small sprite)
        ctx.fillStyle = "#0d3535";
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(28, -36);
        ctx.lineTo(45, -32);
        ctx.lineTo(58, -26);
        ctx.lineTo(64, -14);
        ctx.lineTo(56, -4);
        ctx.lineTo(46, 6);
        ctx.lineTo(15, 10);
        ctx.closePath();
        ctx.fill();

        // Wing bone structure - sharp angular
        ctx.strokeStyle = "#2a6a6a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(52, -28);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 3);
        ctx.lineTo(58, -14);
        ctx.moveTo(15, 6);
        ctx.lineTo(50, -2);
        ctx.stroke();

        // Serrated wing edge spikes
        ctx.fillStyle = "#f5f0e0";
        ctx.beginPath();
        ctx.moveTo(45, -32);
        ctx.lineTo(50, -42);
        ctx.lineTo(48, -30);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(58, -26);
        ctx.lineTo(68, -32);
        ctx.lineTo(60, -22);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(64, -14);
        ctx.lineTo(74, -16);
        ctx.lineTo(65, -10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Muscular armored body (flat for small sprite)
      ctx.fillStyle = "#1a4040";
      ctx.beginPath();
      ctx.ellipse(0, breathPulse * 0.5, 14, 20 + breathPulse * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing rune tattoos on body
      const runeAlpha = 0.3 + sinT3i * 0.2;
      ctx.strokeStyle = `rgba(255, 80, 80, ${runeAlpha})`;
      ctx.lineWidth = 1;
      // Left rune
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-6, 4);
      ctx.moveTo(-10, 0);
      ctx.lineTo(-13, -2);
      ctx.stroke();
      // Right rune
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(10, 0);
      ctx.lineTo(6, 4);
      ctx.moveTo(10, 0);
      ctx.lineTo(13, -2);
      ctx.stroke();
      // Center rune
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -4);
      ctx.moveTo(-3, -7);
      ctx.lineTo(3, -7);
      ctx.stroke();

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

      // Fierce head
      ctx.fillStyle = "#1a3a3a";
      ctx.beginPath();
      ctx.arc(0, -18, 12, 0, Math.PI * 2);
      ctx.fill();

      // Curved demon horns
      ctx.fillStyle = "#2a1515";
      // Left horn - curving outward
      ctx.beginPath();
      ctx.moveTo(-6, -28);
      ctx.quadraticCurveTo(-14, -40, -18, -46);
      ctx.quadraticCurveTo(-20, -44, -16, -38);
      ctx.quadraticCurveTo(-10, -30, -4, -26);
      ctx.closePath();
      ctx.fill();
      // Right horn
      ctx.beginPath();
      ctx.moveTo(6, -28);
      ctx.quadraticCurveTo(14, -40, 18, -46);
      ctx.quadraticCurveTo(20, -44, 16, -38);
      ctx.quadraticCurveTo(10, -30, 4, -26);
      ctx.closePath();
      ctx.fill();
      // Horn tips glow - flat
      ctx.fillStyle = `rgba(255, 60, 60, ${0.3 + sinT4i * 0.15})`;
      ctx.beginPath();
      ctx.arc(-18, -46, 2, 0, Math.PI * 2);
      ctx.arc(18, -46, 2, 0, Math.PI * 2);
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

      // DEMONIC GLOWING EYES - flat glow for performance
      const eyePulse = 0.8 + sinT8i * 0.2;
      for (let eye = -1; eye <= 1; eye += 2) {
        ctx.fillStyle = `rgba(255, 50, 50, ${eyePulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(eye * 4, -20, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Eye whites (yellowed)
      ctx.fillStyle = "#fff0c0";
      ctx.beginPath();
      ctx.ellipse(-4, -20, 5, 4, 0, 0, Math.PI * 2);
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

        // Multi-layer explosion (flat colors)
        const mascotExpColors = [`rgba(255, 80, 0, ${explosionAlpha * 0.3})`, `rgba(255, 150, 50, ${explosionAlpha * 0.4})`, `rgba(255, 255, 200, ${explosionAlpha * 0.5})`];
        for (let layer = 0; layer < 3; layer++) {
          const layerSize = explosionSize * (1 - layer * 0.2);
          ctx.fillStyle = mascotExpColors[layer];
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

      // Pre-hit glow on wyvern (flat color)
      ctx.fillStyle = `rgba(150, 200, 255, ${strikeAlpha * 0.2})`;
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
      const wyvernExpColors = ["rgba(50, 150, 255,", "rgba(100, 200, 255,", "rgba(200, 230, 255,", "rgba(30, 100, 200,"];
      for (let layer = 0; layer < 4; layer++) {
        const layerSize = wyvernExpSize * (1 - layer * 0.15);
        const layerAlpha = wyvernExpAlpha * (1 - layer * 0.2) * 0.5;
        ctx.fillStyle = wyvernExpColors[layer] + `${layerAlpha})`;
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

      // Cannon ball (flat color)
      ctx.fillStyle = "#3a3a3a";
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

        // Flaming cannon ball (flat color)
        ctx.fillStyle = "#ff8800";
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

        // Impact flash (flat color)
        ctx.fillStyle = `rgba(150, 200, 255, ${boltAlpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
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

        // Orange magic orb (flat color)
        ctx.fillStyle = "#f97316";
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

        // Explosion flash (flat color)
        ctx.fillStyle = `rgba(255, 180, 80, ${expAlpha * 0.5})`;
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

      // Beam glow (flat)
      ctx.fillStyle = `rgba(100, 180, 255, ${beamAlpha * 0.15})`;
      ctx.fillRect(width * 0.50 - 15, height * 0.05, 30, groundY - 100 - height * 0.05);
    }

    // === DETAILED TROOPS (Defenders) ===

    // Elite Knight - Heavy armored defender
    const drawKnight = (x: number, y: number, index: number, facing: number) => {
      // Cache trig values
      const phaseA = t * 4 + index;
      const sinStance = Math.sin(phaseA);
      const cosStance = Math.cos(phaseA);
      const stance = sinStance * 2;
      const swordSwing = Math.sin(t * 6 + index) * 0.6;
      const breathe = Math.sin(t * 3 + index) * 0.5;

      ctx.save();
      ctx.translate(x, y + Math.abs(stance * 0.5));
      ctx.scale(facing, 1);

      // Ground shadow (dynamic size with stance)
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 20, 16 + Math.abs(stance), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // === CAPE (behind body, multi-layered) ===
      // Main cape body
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-6, -18);
      ctx.quadraticCurveTo(-14 + stance * 0.4, -6, -20 + stance * 0.9, 10);
      ctx.quadraticCurveTo(-18 + cosStance * 1.8, 24 + stance * 1.2, -12 + stance * 0.4, 20);
      ctx.quadraticCurveTo(-10, 16, -8 + cosStance * 0.3, 12);
      ctx.quadraticCurveTo(-6, 4, -4, -6);
      ctx.closePath();
      ctx.fill();
      // Cape inner fold
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-6, -16);
      ctx.quadraticCurveTo(-12, -4, -16 + stance * 0.6, 8);
      ctx.quadraticCurveTo(-14 + cosStance, 16, -10, 14);
      ctx.quadraticCurveTo(-8, 6, -5, -4);
      ctx.closePath();
      ctx.fill();
      // Cape highlight fold
      ctx.fillStyle = "#fb923c";
      ctx.beginPath();
      ctx.moveTo(-5, -14);
      ctx.quadraticCurveTo(-10, -2, -14 + stance * 0.5, 6);
      ctx.quadraticCurveTo(-10, 2, -6, -4);
      ctx.closePath();
      ctx.fill();
      // Cape bottom gold fringe
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-20 + stance * 0.9, 10);
      ctx.quadraticCurveTo(-18 + cosStance * 1.8, 24 + stance * 1.2, -12 + stance * 0.4, 20);
      ctx.stroke();
      // Cape black trim
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-20 + stance * 0.9, 10.8);
      ctx.quadraticCurveTo(-18 + cosStance * 1.8, 24.8 + stance * 1.2, -12 + stance * 0.4, 20.8);
      ctx.stroke();
      // Cape clasp at shoulder
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(-6, -17, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a07d2e";
      ctx.beginPath();
      ctx.arc(-6, -17, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // === ARMORED SABATONS (foot armor) ===
      // Left sabaton
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.moveTo(-7, 14);
      ctx.lineTo(-8, 18);
      ctx.lineTo(-9, 19);
      ctx.lineTo(-2, 19);
      ctx.lineTo(-1, 18);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();
      // Sabaton plate lines
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-7, 15.5);
      ctx.lineTo(-1, 15.5);
      ctx.moveTo(-7.5, 17);
      ctx.lineTo(-1, 17);
      ctx.stroke();
      // Sole
      ctx.fillStyle = "#374151";
      ctx.fillRect(-9, 18.5, 8, 1.5);
      // Spur
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(-8, 17);
      ctx.lineTo(-11, 18.5);
      ctx.lineTo(-8, 19);
      ctx.closePath();
      ctx.fill();
      // Spur rowel
      ctx.fillStyle = "#d4a72c";
      ctx.beginPath();
      ctx.arc(-11, 18.5, 1, 0, Math.PI * 2);
      ctx.fill();
      // Right sabaton
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(-1, 18);
      ctx.lineTo(-1, 19);
      ctx.lineTo(6, 19);
      ctx.lineTo(7, 18);
      ctx.lineTo(7, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, 15.5);
      ctx.lineTo(6, 15.5);
      ctx.moveTo(-0.5, 17);
      ctx.lineTo(6.5, 17);
      ctx.stroke();
      ctx.fillStyle = "#374151";
      ctx.fillRect(-1, 18.5, 8, 1.5);
      // Spur
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(-1, 17);
      ctx.lineTo(-4, 18.5);
      ctx.lineTo(-1, 19);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d4a72c";
      ctx.beginPath();
      ctx.arc(-4, 18.5, 1, 0, Math.PI * 2);
      ctx.fill();

      // === GREAVES (leg armor with knee cops) - flat for small sprite ===
      const greaveFill = "#6b7280";
      // Left greave
      ctx.fillStyle = greaveFill;
      ctx.beginPath();
      ctx.moveTo(-6, 3);
      ctx.lineTo(-8, 8);
      ctx.lineTo(-7, 15);
      ctx.lineTo(-1, 15);
      ctx.lineTo(0, 8);
      ctx.lineTo(-1, 3);
      ctx.closePath();
      ctx.fill();
      // Greave fluted edge
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-7, 5);
      ctx.lineTo(-8, 9);
      ctx.lineTo(-7, 14);
      ctx.stroke();
      // Greave rivet line
      ctx.fillStyle = "#4b5563";
      for (let gr = 6; gr <= 13; gr += 3.5) {
        ctx.fillRect(-7.5, gr, 1, 1);
      }
      // Knee cop - left (pointed, articulated)
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(-3, 0.5);
      ctx.lineTo(-7, 3.5);
      ctx.lineTo(-3, 6);
      ctx.lineTo(0, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.arc(-3, 3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.arc(-3, 3.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Gold rivet on knee cop
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(-3, 3.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Right greave
      ctx.fillStyle = greaveFill;
      ctx.beginPath();
      ctx.moveTo(1, 3);
      ctx.lineTo(-1, 8);
      ctx.lineTo(0, 15);
      ctx.lineTo(6, 15);
      ctx.lineTo(7, 8);
      ctx.lineTo(6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(-1, 9);
      ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.fillStyle = "#4b5563";
      for (let gr = 6; gr <= 13; gr += 3.5) {
        ctx.fillRect(6.5, gr, 1, 1);
      }
      // Knee cop - right
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(4, 0.5);
      ctx.lineTo(0, 3.5);
      ctx.lineTo(4, 6);
      ctx.lineTo(7, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.arc(4, 3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.arc(4, 3.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(4, 3.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // === FAULDS (segmented skirt armor) ===
      for (let f = 0; f < 4; f++) {
        const fy = -2 + f * 2.5;
        const fx = -8 + f * 0.5;
        const fw = 16 - f;
        ctx.fillStyle = f % 2 === 0 ? "#8a9099" : "#7a8290";
        ctx.fillRect(fx, fy, fw, 2.8);
        ctx.strokeStyle = "#4b5563";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(fx, fy + 2.8);
        ctx.lineTo(fx + fw, fy + 2.8);
        ctx.stroke();
      }

      // === TABARD (Princeton orange with black trim) ===
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-7, 6);
      ctx.lineTo(-4, 11);
      ctx.lineTo(4, 11);
      ctx.lineTo(7, 6);
      ctx.lineTo(6, -4);
      ctx.closePath();
      ctx.fill();
      // Tabard black border
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-7, 6);
      ctx.lineTo(-4, 11);
      ctx.lineTo(4, 11);
      ctx.lineTo(7, 6);
      ctx.stroke();
      // Tabard center stripe
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(-1, -2, 2, 13);
      // Tabard inner gold border
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-3.5, 10);
      ctx.moveTo(5, -3);
      ctx.lineTo(6, 6);
      ctx.lineTo(3.5, 10);
      ctx.stroke();

      // === BREASTPLATE (flat for small sprite) ===
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.lineTo(-12, -4);
      ctx.lineTo(-11, -11);
      ctx.lineTo(-9, -18);
      ctx.lineTo(9, -18);
      ctx.lineTo(11, -11);
      ctx.lineTo(12, -4);
      ctx.lineTo(10, 4);
      ctx.closePath();
      ctx.fill();
      // Center ridge (raised look)
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 4);
      ctx.stroke();
      // Plate section lines
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-9, -14);
      ctx.lineTo(9, -14);
      ctx.moveTo(-8, -8);
      ctx.lineTo(8, -8);
      ctx.moveTo(-7, -1);
      ctx.lineTo(7, -1);
      ctx.stroke();
      // Ornamental scroll etchings
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-4, -16.5);
      ctx.quadraticCurveTo(-6, -15.5, -4, -14.8);
      ctx.moveTo(4, -16.5);
      ctx.quadraticCurveTo(6, -15.5, 4, -14.8);
      ctx.stroke();
      // Edge highlight (left side)
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-9, -18);
      ctx.lineTo(-12, -4);
      ctx.lineTo(-10, 4);
      ctx.stroke();

      // === GORGET (neck armor) ===
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.moveTo(-7, -18);
      ctx.lineTo(-6, -20);
      ctx.lineTo(6, -20);
      ctx.lineTo(7, -18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-6, -19);
      ctx.lineTo(6, -19);
      ctx.stroke();
      // Gold trim on gorget
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(-5.5, -20);
      ctx.lineTo(5.5, -20);
      ctx.stroke();

      // === CHAINMAIL at neck ===
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.moveTo(-5, -18);
      ctx.lineTo(-4, -20.5);
      ctx.lineTo(4, -20.5);
      ctx.lineTo(5, -18);
      ctx.closePath();
      ctx.fill();
      // Chainmail ring pattern
      ctx.fillStyle = "#9ca3af";
      for (let cx = -3; cx <= 3; cx += 1.5) {
        ctx.fillRect(cx, -20, 0.8, 0.8);
        ctx.fillRect(cx + 0.75, -19.2, 0.8, 0.8);
      }

      // === PAULDRONS (articulated, 3-plate) - Left (flat for small sprite) ===
      ctx.save();
      ctx.translate(-12, -14);
      const pauldronFill = "#9ca3af";
      // Top plate
      ctx.fillStyle = pauldronFill;
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.quadraticCurveTo(-3, -8, -7, -3);
      ctx.quadraticCurveTo(-7, 0, -5, 2);
      ctx.lineTo(3, 1);
      ctx.closePath();
      ctx.fill();
      // Second plate (overlapping)
      ctx.fillStyle = "#8a9099";
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.quadraticCurveTo(-2, -1, -5, 1);
      ctx.quadraticCurveTo(-5, 4, -3, 6);
      ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fill();
      // Third plate
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(3, 4);
      ctx.quadraticCurveTo(-1, 3, -3, 5);
      ctx.lineTo(-2, 8);
      ctx.lineTo(3, 7);
      ctx.closePath();
      ctx.fill();
      // Plate edge outlines
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.quadraticCurveTo(-3, -8, -7, -3);
      ctx.quadraticCurveTo(-7, 0, -5, 2);
      ctx.moveTo(-5, 1);
      ctx.quadraticCurveTo(-5, 4, -3, 6);
      ctx.stroke();
      // Gold trim on top edge
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.quadraticCurveTo(-3, -8, -7, -3);
      ctx.stroke();
      // Rivets (gold)
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(-4, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-3, 2, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-2, 5.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pauldron - Right (mirrored)
      ctx.save();
      ctx.translate(12, -14);
      // Top plate
      ctx.fillStyle = pauldronFill;
      ctx.beginPath();
      ctx.moveTo(-3, -5);
      ctx.quadraticCurveTo(3, -8, 7, -3);
      ctx.quadraticCurveTo(7, 0, 5, 2);
      ctx.lineTo(-3, 1);
      ctx.closePath();
      ctx.fill();
      // Second plate
      ctx.fillStyle = "#8a9099";
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.quadraticCurveTo(2, -1, 5, 1);
      ctx.quadraticCurveTo(5, 4, 3, 6);
      ctx.lineTo(-3, 5);
      ctx.closePath();
      ctx.fill();
      // Third plate
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(-3, 4);
      ctx.quadraticCurveTo(1, 3, 3, 5);
      ctx.lineTo(2, 8);
      ctx.lineTo(-3, 7);
      ctx.closePath();
      ctx.fill();
      // Plate edges
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-3, -5);
      ctx.quadraticCurveTo(3, -8, 7, -3);
      ctx.quadraticCurveTo(7, 0, 5, 2);
      ctx.moveTo(5, 1);
      ctx.quadraticCurveTo(5, 4, 3, 6);
      ctx.stroke();
      // Gold trim
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-3, -5);
      ctx.quadraticCurveTo(3, -8, 7, -3);
      ctx.stroke();
      // Rivets
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(4, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, 2, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(2, 5.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // === PRINCETON TIGER EMBLEM ON CHEST ===
      // Diamond background
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(-5, -9);
      ctx.lineTo(0, -2);
      ctx.lineTo(5, -9);
      ctx.closePath();
      ctx.fill();
      // Gold diamond border
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(-5, -9);
      ctx.lineTo(0, -2);
      ctx.lineTo(5, -9);
      ctx.closePath();
      ctx.stroke();
      // Tiger face circle
      ctx.fillStyle = "#fb923c";
      ctx.beginPath();
      ctx.arc(0, -10.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Tiger ears
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.moveTo(-3, -13);
      ctx.lineTo(-4, -15.5);
      ctx.lineTo(-1.5, -13.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3, -13);
      ctx.lineTo(4, -15.5);
      ctx.lineTo(1.5, -13.5);
      ctx.closePath();
      ctx.fill();
      // Inner ears
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-2.8, -13.2);
      ctx.lineTo(-3.5, -14.8);
      ctx.lineTo(-1.8, -13.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2.8, -13.2);
      ctx.lineTo(3.5, -14.8);
      ctx.lineTo(1.8, -13.5);
      ctx.closePath();
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-2.2, -11.8, 1.8, 1.2);
      ctx.fillRect(0.4, -11.8, 1.8, 1.2);
      // Pupils
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(-1.6, -11.5, 0.8, 0.8);
      ctx.fillRect(0.8, -11.5, 0.8, 0.8);
      // Nose
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.moveTo(-0.5, -9.8);
      ctx.lineTo(0.5, -9.8);
      ctx.lineTo(0, -9.3);
      ctx.closePath();
      ctx.fill();
      // Mouth
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -9.3);
      ctx.lineTo(-0.8, -8.6);
      ctx.moveTo(0, -9.3);
      ctx.lineTo(0.8, -8.6);
      ctx.stroke();
      // Tiger stripes
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-3.5, -11);
      ctx.lineTo(-2, -10.2);
      ctx.moveTo(3.5, -11);
      ctx.lineTo(2, -10.2);
      ctx.moveTo(-3, -9.5);
      ctx.lineTo(-1.8, -9);
      ctx.moveTo(3, -9.5);
      ctx.lineTo(1.8, -9);
      ctx.stroke();

      // === HELMET (ornate great helm) - flat for small sprite ===
      ctx.fillStyle = "#9ca3af";
      // Main dome (larger, imposing)
      ctx.beginPath();
      ctx.arc(0, -24, 10, Math.PI * 1.05, -0.05);
      ctx.lineTo(10, -19);
      ctx.lineTo(-10, -19);
      ctx.closePath();
      ctx.fill();
      // Visor / face plate
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(-9, -19);
      ctx.lineTo(-10, -14);
      ctx.lineTo(-7, -11);
      ctx.lineTo(7, -11);
      ctx.lineTo(10, -14);
      ctx.lineTo(9, -19);
      ctx.closePath();
      ctx.fill();
      // Cheek guards (angled)
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.moveTo(-10, -19);
      ctx.lineTo(-11, -15);
      ctx.lineTo(-9, -11);
      ctx.lineTo(-7, -11);
      ctx.lineTo(-8, -19);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -19);
      ctx.lineTo(11, -15);
      ctx.lineTo(9, -11);
      ctx.lineTo(7, -11);
      ctx.lineTo(8, -19);
      ctx.closePath();
      ctx.fill();
      // Aventail (chainmail curtain from helmet)
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.moveTo(-9, -11);
      ctx.lineTo(-10, -9);
      ctx.lineTo(10, -9);
      ctx.lineTo(9, -11);
      ctx.closePath();
      ctx.fill();
      // Aventail ring pattern
      ctx.fillStyle = "#9ca3af";
      for (let ax = -8; ax <= 8; ax += 2) {
        ctx.fillRect(ax, -11, 1, 1);
        ctx.fillRect(ax + 1, -10, 1, 1);
      }
      // T-shaped visor slit
      ctx.fillStyle = "#111827";
      // Horizontal slit
      ctx.fillRect(-6, -18, 12, 2);
      // Vertical slit
      ctx.fillRect(-1.2, -18, 2.4, 6);
      // Visor breathing holes
      ctx.fillStyle = "#111827";
      for (let h = 0; h < 3; h++) {
        ctx.fillRect(-5 + h * 1.5, -15.2, 0.8, 0.8);
        ctx.fillRect(3 + h * 1.5, -15.2, 0.8, 0.8);
      }
      // Helmet crest ridge (gold, ornate)
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(0, -19);
      ctx.stroke();
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0.8, -33);
      ctx.lineTo(0.8, -20);
      ctx.stroke();
      // Brow band (gold circlet)
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -24, 10, Math.PI * 0.85, Math.PI * 0.15, true);
      ctx.stroke();
      // Helmet edge highlight
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, -24, 10, Math.PI * 1.05, Math.PI * 0.7);
      ctx.stroke();

      // Plume (large, flowing, multi-layered)
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-1, -33);
      ctx.quadraticCurveTo(-4, -42 + stance * 0.5, 3, -40 + cosStance * 0.6);
      ctx.quadraticCurveTo(10, -38 + stance * 0.4, 12, -32 + cosStance * 0.5);
      ctx.quadraticCurveTo(8, -34, 4, -32);
      ctx.quadraticCurveTo(2, -33, -1, -33);
      ctx.closePath();
      ctx.fill();
      // Plume mid layer
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.quadraticCurveTo(2, -40 + stance * 0.4, 6, -38 + cosStance * 0.4);
      ctx.quadraticCurveTo(9, -36 + stance * 0.3, 10, -33);
      ctx.quadraticCurveTo(6, -35, 2, -33);
      ctx.closePath();
      ctx.fill();
      // Plume dark accent
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(1, -34);
      ctx.quadraticCurveTo(5, -39 + stance * 0.3, 9, -35 + cosStance * 0.3);
      ctx.quadraticCurveTo(7, -34, 3, -32);
      ctx.closePath();
      ctx.fill();
      // Plume wisp highlights
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(2, -38 + stance * 0.3);
      ctx.quadraticCurveTo(6, -37, 8, -34);
      ctx.stroke();

      // === SWORD ARM ===
      ctx.save();
      ctx.translate(12, -11);
      ctx.rotate(swordSwing);

      // Chainmail under arm
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-2, -2, 3, 5);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(-1.5, -1.5, 1, 1);
      ctx.fillRect(-1.5, 0.5, 1, 1);
      ctx.fillRect(0, -0.5, 1, 1);
      ctx.fillRect(0, 1.5, 1, 1);
      // Upper arm plate
      ctx.fillStyle = "#8a9099";
      ctx.fillRect(0, -3, 7, 6);
      ctx.strokeStyle = "#b0b5bc";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(0, 3);
      ctx.stroke();
      // Couter (elbow guard, pointed)
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(5, -4);
      ctx.lineTo(9, 0);
      ctx.lineTo(5, 4);
      ctx.lineTo(3, 1);
      ctx.lineTo(3, -1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.arc(6, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.arc(6, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(6, 0, 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Vambrace (forearm)
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(7, -2.5, 6, 5.5);
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(8.5, -2.5);
      ctx.lineTo(8.5, 3);
      ctx.moveTo(11, -2.5);
      ctx.lineTo(11, 3);
      ctx.stroke();
      // Gauntlet (articulated)
      ctx.fillStyle = "#8a9099";
      ctx.beginPath();
      ctx.moveTo(12, -3.5);
      ctx.lineTo(16, -2.5);
      ctx.lineTo(17, 1);
      ctx.lineTo(16, 4);
      ctx.lineTo(12, 4);
      ctx.closePath();
      ctx.fill();
      // Finger plate lines
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(13, -2);
      ctx.lineTo(16, -1.5);
      ctx.moveTo(13, 0);
      ctx.lineTo(16.5, 0.5);
      ctx.moveTo(13, 2);
      ctx.lineTo(16, 2.5);
      ctx.stroke();
      // Gauntlet cuff
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(12, -4, 1.5, 8.5);

      // === SWORD (impressive longsword) ===
      // Pommel (ornate sphere)
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(10, 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a07d2e";
      ctx.beginPath();
      ctx.arc(10, 1, 2.2, 0, Math.PI * 2);
      ctx.fill();
      // Pommel gem (faceted ruby)
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(10, -0.5);
      ctx.lineTo(8.5, 1);
      ctx.lineTo(10, 2.5);
      ctx.lineTo(11.5, 1);
      ctx.closePath();
      ctx.fill();
      // Gem glint
      ctx.fillStyle = "#fca5a5";
      ctx.fillRect(9.5, 0, 0.8, 0.8);
      // Grip (leather wrapped)
      ctx.fillStyle = "#5c3a1e";
      ctx.fillRect(11.5, -1, 5, 3);
      // Grip wrap lines
      ctx.strokeStyle = "#8b6f47";
      ctx.lineWidth = 0.6;
      for (let w = 0; w < 5; w++) {
        ctx.beginPath();
        ctx.moveTo(12 + w, -1);
        ctx.lineTo(12.5 + w, 2);
        ctx.stroke();
      }
      // Crossguard (ornate, curved)
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(15.5, -5);
      ctx.quadraticCurveTo(16.5, -4, 17, -2.5);
      ctx.lineTo(17, 3.5);
      ctx.quadraticCurveTo(16.5, 5, 15.5, 6);
      ctx.lineTo(15, 4);
      ctx.lineTo(15, -3);
      ctx.closePath();
      ctx.fill();
      // Crossguard finials (decorative ends)
      ctx.fillStyle = "#d4a72c";
      ctx.beginPath();
      ctx.arc(16.5, -4.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16.5, 5.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // Rain guard
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.moveTo(17, -1.5);
      ctx.lineTo(19, -1);
      ctx.lineTo(19, 2);
      ctx.lineTo(17, 2.5);
      ctx.closePath();
      ctx.fill();
      // Blade (larger, tapered)
      ctx.fillStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.moveTo(18, -2);
      ctx.lineTo(43, -0.8);
      ctx.lineTo(46, 0.5);
      ctx.lineTo(43, 2);
      ctx.lineTo(18, 3);
      ctx.closePath();
      ctx.fill();
      // Fuller (blood groove)
      ctx.fillStyle = "#b0b5bc";
      ctx.fillRect(20, -0.2, 21, 1.4);
      // Fuller inner shade
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(20, 0.1, 21, 0.8);
      // Blade edge highlight (top)
      ctx.strokeStyle = "#f9fafb";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(18, -2);
      ctx.lineTo(43, -0.8);
      ctx.lineTo(46, 0.5);
      ctx.stroke();
      // Gold etchings near blade base
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(20, -1);
      ctx.lineTo(22, -0.5);
      ctx.lineTo(20, 0);
      ctx.moveTo(23, -0.8);
      ctx.lineTo(25, -0.3);
      ctx.lineTo(23, 0.2);
      ctx.stroke();

      ctx.restore();

      // === SHIELD ARM ===
      // Chainmail under arm area
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-11, -12, 3, 7);
      ctx.fillStyle = "#9ca3af";
      for (let my = -11; my < -5; my += 2) {
        for (let mx = -11; mx < -8; mx += 2) {
          ctx.fillRect(mx, my, 1, 1);
        }
      }
      // Upper arm armor plate
      ctx.fillStyle = "#8a9099";
      ctx.fillRect(-16, -14, 6, 7);
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-14, -14);
      ctx.lineTo(-14, -7);
      ctx.stroke();
      // Couter (elbow guard)
      ctx.fillStyle = "#7a8290";
      ctx.beginPath();
      ctx.moveTo(-14, -9);
      ctx.lineTo(-16, -7);
      ctx.lineTo(-14, -4);
      ctx.lineTo(-11, -7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.arc(-13, -7, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.arc(-13, -7, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(-13, -7, 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Forearm (vambrace)
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(-16, -7, 5, 6);
      // Gauntlet
      ctx.fillStyle = "#8a9099";
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(-18, -1);
      ctx.lineTo(-18, 2.5);
      ctx.lineTo(-16, 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-16, 0);
      ctx.moveTo(-18, 1.5);
      ctx.lineTo(-16, 1.5);
      ctx.stroke();

      // === KITE SHIELD (ornate) - flat for small sprite ===
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-17, -22);
      ctx.lineTo(-28, -16);
      ctx.lineTo(-28, 0);
      ctx.quadraticCurveTo(-28, 8, -22, 14);
      ctx.quadraticCurveTo(-19, 8, -17, 0);
      ctx.lineTo(-17, -22);
      ctx.closePath();
      ctx.fill();
      // Shield border (thick)
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-17, -22);
      ctx.lineTo(-28, -16);
      ctx.lineTo(-28, 0);
      ctx.quadraticCurveTo(-28, 8, -22, 14);
      ctx.quadraticCurveTo(-19, 8, -17, 0);
      ctx.lineTo(-17, -22);
      ctx.closePath();
      ctx.stroke();
      // Inner gold border
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-18, -20);
      ctx.lineTo(-27, -15);
      ctx.lineTo(-27, 0);
      ctx.quadraticCurveTo(-27, 7, -22, 12);
      ctx.quadraticCurveTo(-19.5, 7, -18, 0);
      ctx.lineTo(-18, -20);
      ctx.closePath();
      ctx.stroke();
      // Shield boss (center raised circle)
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.arc(-22, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(-22, -4, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Shield cross bars
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-22, -20);
      ctx.lineTo(-22, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-28, -6);
      ctx.lineTo(-17, -6);
      ctx.stroke();

      // Tiger emblem on shield (geometric tiger head, larger)
      // Tiger face background
      ctx.fillStyle = "#fb923c";
      ctx.beginPath();
      ctx.arc(-22, -13, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.moveTo(-25, -15);
      ctx.lineTo(-26, -17.5);
      ctx.lineTo(-23.5, -16);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-19, -15);
      ctx.lineTo(-18, -17.5);
      ctx.lineTo(-20.5, -16);
      ctx.closePath();
      ctx.fill();
      // Inner ears
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-24.8, -15.2);
      ctx.lineTo(-25.5, -16.5);
      ctx.lineTo(-23.8, -15.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-19.2, -15.2);
      ctx.lineTo(-18.5, -16.5);
      ctx.lineTo(-20.2, -15.5);
      ctx.closePath();
      ctx.fill();
      // Tiger eyes
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-24.5, -14, 2, 1.2);
      ctx.fillRect(-21.5, -14, 2, 1.2);
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(-23.8, -13.8, 0.8, 0.8);
      ctx.fillRect(-21, -13.8, 0.8, 0.8);
      // Nose
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.moveTo(-22.5, -12);
      ctx.lineTo(-21.5, -12);
      ctx.lineTo(-22, -11.5);
      ctx.closePath();
      ctx.fill();
      // Mouth
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-22, -11.5);
      ctx.lineTo(-22.5, -11);
      ctx.moveTo(-22, -11.5);
      ctx.lineTo(-21.5, -11);
      ctx.stroke();
      // Stripes
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-25.5, -13);
      ctx.lineTo(-24, -12);
      ctx.moveTo(-18.5, -13);
      ctx.lineTo(-20, -12);
      ctx.moveTo(-25, -11.5);
      ctx.lineTo(-23.5, -11);
      ctx.moveTo(-19, -11.5);
      ctx.lineTo(-20.5, -11);
      ctx.moveTo(-22, -15.5);
      ctx.lineTo(-22, -14.5);
      ctx.stroke();

      // Decorative "P" on lower shield (geometric)
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-23, 7);
      ctx.lineTo(-23, 2);
      ctx.lineTo(-20.5, 2);
      ctx.quadraticCurveTo(-19, 2.5, -19, 4);
      ctx.quadraticCurveTo(-19, 5.5, -20.5, 5.5);
      ctx.lineTo(-23, 5.5);
      ctx.stroke();

      ctx.restore();
    };

    // Archer troop - Ranger with longbow
    const drawArcher = (x: number, y: number, index: number) => {
      // Cache trig values
      const phaseD = t * 2 + index;
      const drawPhase = phaseD % 3;
      const pullBack = drawPhase < 1.5 ? drawPhase / 1.5 : (drawPhase < 2.0 ? 1.0 : 0);
      const breathe = Math.sin(t * 3 + index) * 0.5;
      const phaseF = t * 2.5 + index;
      const sinSway = Math.sin(phaseF);
      const cosSway = Math.cos(phaseF);
      const eyePulse = Math.sin(t * 5 + index) * 0.15 + 0.85;

      ctx.save();
      ctx.translate(x, y);

      // Ground shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 16, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // === CLOAK (behind body, draped over right shoulder) ===
      ctx.fillStyle = "#14532d";
      ctx.beginPath();
      ctx.moveTo(2, -18);
      ctx.quadraticCurveTo(14, -12 + sinSway, 16, 0);
      ctx.quadraticCurveTo(15 + cosSway * 0.6, 16 + sinSway * 1.2, 12 + sinSway * 0.6, 18);
      ctx.quadraticCurveTo(8, 16, 6, 8);
      ctx.quadraticCurveTo(5, -2, 4, -14);
      ctx.closePath();
      ctx.fill();
      // Cloak mid fold
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.moveTo(4, -16);
      ctx.quadraticCurveTo(12, -8, 14, 2);
      ctx.quadraticCurveTo(12, 10, 10, 14);
      ctx.quadraticCurveTo(8, 10, 7, 2);
      ctx.quadraticCurveTo(6, -6, 5, -14);
      ctx.closePath();
      ctx.fill();
      // Cloak highlight fold
      ctx.fillStyle = "#1a7a42";
      ctx.beginPath();
      ctx.moveTo(5, -14);
      ctx.quadraticCurveTo(10, -4, 12, 4);
      ctx.quadraticCurveTo(10, 0, 7, -4);
      ctx.quadraticCurveTo(6, -8, 5, -14);
      ctx.closePath();
      ctx.fill();
      // Cloak bottom trim
      ctx.strokeStyle = "#0a3d1e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.quadraticCurveTo(15 + cosSway * 0.6, 16 + sinSway * 1.2, 12 + sinSway * 0.6, 18);
      ctx.stroke();
      // Cloak clasp (leaf-shaped, on shoulder)
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(3, -16);
      ctx.quadraticCurveTo(5, -18, 6, -16);
      ctx.quadraticCurveTo(5, -14, 3, -16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d4a72c";
      ctx.fillRect(3.8, -16.5, 1.8, 1.5);

      // === KNEE-HIGH BOOTS (left) ===
      ctx.fillStyle = "#5c3a1e";
      ctx.beginPath();
      ctx.moveTo(-6, 3);
      ctx.lineTo(-7, 8);
      ctx.lineTo(-8, 14);
      ctx.lineTo(-2, 14);
      ctx.lineTo(-1, 8);
      ctx.lineTo(-1, 3);
      ctx.closePath();
      ctx.fill();
      // Boot cuff fold
      ctx.fillStyle = "#4b3018";
      ctx.fillRect(-7, 3, 6, 2);
      // Boot sole
      ctx.fillStyle = "#3a2515";
      ctx.fillRect(-8, 13.5, 7, 2.5);
      // Boot toe cap
      ctx.fillStyle = "#4b3018";
      ctx.beginPath();
      ctx.moveTo(-8, 14);
      ctx.lineTo(-8.5, 15);
      ctx.lineTo(-6, 15.5);
      ctx.lineTo(-5, 14);
      ctx.closePath();
      ctx.fill();
      // Boot straps
      ctx.strokeStyle = "#8b6f47";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-7, 5.5);
      ctx.lineTo(-1, 5.5);
      ctx.moveTo(-7, 8);
      ctx.lineTo(-2, 8);
      ctx.moveTo(-7.5, 11);
      ctx.lineTo(-2, 11);
      ctx.stroke();
      // Buckles (brass)
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-5, 5, 2, 1.5);
      ctx.fillRect(-4.5, 7.5, 2, 1.5);
      // Buckle prongs
      ctx.fillStyle = "#a07d2e";
      ctx.fillRect(-4.2, 5.3, 0.6, 1);
      ctx.fillRect(-3.7, 7.8, 0.6, 1);

      // Boot - right
      ctx.fillStyle = "#5c3a1e";
      ctx.beginPath();
      ctx.moveTo(1, 3);
      ctx.lineTo(0, 8);
      ctx.lineTo(-1, 14);
      ctx.lineTo(5, 14);
      ctx.lineTo(6, 8);
      ctx.lineTo(6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4b3018";
      ctx.fillRect(0, 3, 6, 2);
      ctx.fillStyle = "#3a2515";
      ctx.fillRect(-1, 13.5, 7, 2.5);
      ctx.fillStyle = "#4b3018";
      ctx.beginPath();
      ctx.moveTo(-1, 14);
      ctx.lineTo(-1.5, 15);
      ctx.lineTo(1, 15.5);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#8b6f47";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, 5.5);
      ctx.lineTo(6, 5.5);
      ctx.moveTo(0, 8);
      ctx.lineTo(5, 8);
      ctx.moveTo(-0.5, 11);
      ctx.lineTo(5, 11);
      ctx.stroke();
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(2, 5, 2, 1.5);
      ctx.fillRect(2.5, 7.5, 2, 1.5);

      // === LEGS (trousers with knee pads) ===
      ctx.fillStyle = "#4b3621";
      ctx.fillRect(-6, 0, 5, 5);
      ctx.fillRect(1, 0, 5, 5);
      // Hardened leather knee pads
      ctx.fillStyle = "#6b4c30";
      ctx.beginPath();
      ctx.arc(-3.5, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3.5, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7c5c3c";
      ctx.beginPath();
      ctx.arc(-3.5, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3.5, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // === LEATHER ARMOR VEST (layered, detailed) - flat for small sprite ===
      ctx.fillStyle = "#6b4c30";
      ctx.beginPath();
      ctx.moveTo(-7, 3);
      ctx.lineTo(-8, -4);
      ctx.lineTo(-7, -11);
      ctx.lineTo(-5, -16);
      ctx.lineTo(5, -16);
      ctx.lineTo(7, -11);
      ctx.lineTo(8, -4);
      ctx.lineTo(7, 3);
      ctx.closePath();
      ctx.fill();
      // Panel seam lines
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(6, -12);
      ctx.moveTo(-6, -6);
      ctx.lineTo(6, -6);
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();
      // Center seam with cross stitching
      ctx.strokeStyle = "#8b6f47";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(0, 2);
      ctx.stroke();
      for (let sy = -14; sy < 1; sy += 2.5) {
        ctx.beginPath();
        ctx.moveTo(-1.2, sy);
        ctx.lineTo(1.2, sy + 1.5);
        ctx.moveTo(1.2, sy);
        ctx.lineTo(-1.2, sy + 1.5);
        ctx.stroke();
      }
      // Hardened leather chest plate overlay
      ctx.fillStyle = "rgba(75, 48, 24, 0.4)";
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.lineTo(-5, -8);
      ctx.lineTo(-4, -4);
      ctx.lineTo(4, -4);
      ctx.lineTo(5, -8);
      ctx.lineTo(4, -14);
      ctx.closePath();
      ctx.fill();
      // Chest plate corner rivets
      ctx.fillStyle = "#8b6f47";
      ctx.beginPath(); ctx.arc(-4, -12, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -12, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-4, -6, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -6, 0.8, 0, Math.PI * 2); ctx.fill();
      // Side buckles (detailed)
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-8, -9, 2, 2.5);
      ctx.fillRect(-8, -4, 2, 2.5);
      ctx.fillStyle = "#a07d2e";
      ctx.fillRect(-7.5, -8.5, 1, 1.5);
      ctx.fillRect(-7.5, -3.5, 1, 1.5);
      // Leather straps from buckles
      ctx.strokeStyle = "#5c3a1e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-9.5, -8);
      ctx.moveTo(-8, -3);
      ctx.lineTo(-9.5, -3);
      ctx.stroke();

      // Shoulder guard (spaulder on left shoulder)
      ctx.fillStyle = "#6b4c30";
      ctx.beginPath();
      ctx.moveTo(-5, -16);
      ctx.quadraticCurveTo(-9, -18, -10, -14);
      ctx.quadraticCurveTo(-9, -10, -7, -9);
      ctx.lineTo(-5, -11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-5, -14);
      ctx.quadraticCurveTo(-8, -15, -9, -13);
      ctx.moveTo(-5, -12);
      ctx.quadraticCurveTo(-8, -12.5, -9, -11);
      ctx.stroke();
      // Rivet
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(-8, -14, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // === BELT (wider, with pouches and dagger) ===
      ctx.fillStyle = "#5c3a1e";
      ctx.fillRect(-8, 0, 16, 3.5);
      // Belt texture
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(-7, 1);
      ctx.lineTo(7, 1);
      ctx.moveTo(-7, 2.5);
      ctx.lineTo(7, 2.5);
      ctx.stroke();
      // Belt buckle (ornate)
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-1.5, 0, 3.5, 3.5);
      ctx.fillStyle = "#a07d2e";
      ctx.fillRect(-0.8, 0.5, 2, 2.5);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-0.3, 1, 1, 1.5);
      // Small pouch (left hip)
      ctx.fillStyle = "#6b4c30";
      ctx.fillRect(-7, 2.5, 3.5, 3);
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(-6.5, 3);
      ctx.lineTo(-6.5, 5);
      ctx.moveTo(-4.5, 3);
      ctx.lineTo(-4.5, 5);
      ctx.stroke();
      ctx.fillStyle = "#8b6f47";
      ctx.fillRect(-7, 2.5, 3.5, 0.8);
      // Dagger on belt (right hip)
      ctx.fillStyle = "#4b3621";
      ctx.beginPath();
      ctx.moveTo(5, 0.5);
      ctx.lineTo(4.5, 6);
      ctx.lineTo(6.5, 6);
      ctx.lineTo(7, 0.5);
      ctx.closePath();
      ctx.fill();
      // Dagger hilt
      ctx.fillStyle = "#5c3a1e";
      ctx.fillRect(5, -2, 2, 3);
      // Dagger crossguard
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(4.5, -2, 3, 0.8);
      // Dagger pommel
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.arc(6, -2.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Blade peek from sheath
      ctx.fillStyle = "#d1d5db";
      ctx.beginPath();
      ctx.moveTo(5.2, 5.5);
      ctx.lineTo(6, 8);
      ctx.lineTo(6.8, 5.5);
      ctx.closePath();
      ctx.fill();

      // Baldric (diagonal strap for quiver)
      ctx.strokeStyle = "#5c3a1e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -14);
      ctx.quadraticCurveTo(3, -12, -2, -6);
      ctx.quadraticCurveTo(-5, -2, -6, 1);
      ctx.stroke();
      ctx.strokeStyle = "#6b4c30";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(7.5, -13.5);
      ctx.quadraticCurveTo(2.5, -11.5, -1.5, -5.5);
      ctx.stroke();

      // === HOOD (deep, dramatic) ===
      ctx.fillStyle = "#14532d";
      ctx.beginPath();
      ctx.moveTo(-9, -17);
      ctx.quadraticCurveTo(-10, -26, 0, -28);
      ctx.quadraticCurveTo(10, -26, 9, -17);
      ctx.lineTo(7, -13);
      ctx.lineTo(-7, -13);
      ctx.closePath();
      ctx.fill();
      // Hood peak
      ctx.fillStyle = "#0f4024";
      ctx.beginPath();
      ctx.moveTo(-2, -28);
      ctx.lineTo(0, -30);
      ctx.lineTo(2, -28);
      ctx.closePath();
      ctx.fill();
      // Hood side folds
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.quadraticCurveTo(-9, -22, -4, -25);
      ctx.quadraticCurveTo(-7, -22, -7, -18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -18);
      ctx.quadraticCurveTo(9, -22, 4, -25);
      ctx.quadraticCurveTo(7, -22, 7, -18);
      ctx.closePath();
      ctx.fill();
      // Hood back drape (longer, flowing)
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.moveTo(-7, -15);
      ctx.quadraticCurveTo(-9, -10 + sinSway * 0.4, -8, -4);
      ctx.quadraticCurveTo(-7, -2, -6, -4);
      ctx.quadraticCurveTo(-6, -8, -6, -15);
      ctx.closePath();
      ctx.fill();
      // Hood shadow overhang
      ctx.fillStyle = "#0a3d1e";
      ctx.beginPath();
      ctx.moveTo(-7, -16);
      ctx.quadraticCurveTo(0, -14, 7, -16);
      ctx.lineTo(6, -14);
      ctx.lineTo(-6, -14);
      ctx.closePath();
      ctx.fill();

      // === FACE IN DEEP SHADOW ===
      ctx.fillStyle = "#0d0d1a";
      ctx.beginPath();
      ctx.arc(0, -18, 6, 0, Math.PI * 2);
      ctx.fill();
      // Face scarf / mask
      ctx.fillStyle = "#111827";
      ctx.beginPath();
      ctx.moveTo(-5, -16);
      ctx.lineTo(-4, -13);
      ctx.lineTo(4, -13);
      ctx.lineTo(5, -16);
      ctx.closePath();
      ctx.fill();

      // === GLOWING EYES (pulsing) ===
      const glowA = 0.2 * eyePulse;
      const glowB = 0.35 * eyePulse;
      // Outer glow aura
      ctx.fillStyle = "rgba(74, 222, 128, " + glowA.toFixed(3) + ")";
      ctx.fillRect(-4.5, -20, 4, 3.5);
      ctx.fillRect(0.5, -20, 4, 3.5);
      // Mid glow
      ctx.fillStyle = "rgba(74, 222, 128, " + glowB.toFixed(3) + ")";
      ctx.fillRect(-4, -19.5, 3, 2.5);
      ctx.fillRect(1, -19.5, 3, 2.5);
      // Eyes (bright core)
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(-3.5, -19, 2.5, 1.8);
      ctx.fillRect(1, -19, 2.5, 1.8);
      // Bright center
      ctx.fillStyle = "#86efac";
      ctx.fillRect(-2.8, -18.8, 1, 1.2);
      ctx.fillRect(1.8, -18.8, 1, 1.2);
      // Pupil slits
      ctx.fillStyle = "#14532d";
      ctx.fillRect(-2.5, -19, 0.5, 1.8);
      ctx.fillRect(2, -19, 0.5, 1.8);

      // === BOW ARM (left arm with bracer) ===
      ctx.save();
      ctx.translate(-9, -9);

      // Upper arm (leather sleeve)
      ctx.fillStyle = "#5c3a1e";
      ctx.fillRect(-2, -2, 4, 5);
      // Bracer (detailed armguard)
      ctx.fillStyle = "#6b4c30";
      ctx.beginPath();
      ctx.moveTo(-3, -1);
      ctx.lineTo(-3, 4);
      ctx.lineTo(3, 4);
      ctx.lineTo(3, -1);
      ctx.closePath();
      ctx.fill();
      // Bracer reinforcement strips
      ctx.strokeStyle = "#8b6f47";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-2.5, -0.5);
      ctx.lineTo(2.5, -0.5);
      ctx.moveTo(-2.5, 1);
      ctx.lineTo(2.5, 1);
      ctx.moveTo(-2.5, 2.5);
      ctx.lineTo(2.5, 2.5);
      ctx.stroke();
      // Metal studs on bracer
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath(); ctx.arc(-1.5, 0.3, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1.5, 0.3, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 1.8, 0.6, 0, Math.PI * 2); ctx.fill();
      // Hand gripping bow
      ctx.fillStyle = "#c4a882";
      ctx.beginPath();
      ctx.arc(0, 5, 2, 0, Math.PI * 2);
      ctx.fill();

      // === LONGBOW (detailed with carvings) ===
      // Main stave
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(-4, 2, 20, -Math.PI * 0.43, Math.PI * 0.43);
      ctx.stroke();
      // Inner highlight
      ctx.strokeStyle = "#7c5c3c";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-4, 2, 20, -Math.PI * 0.35, Math.PI * 0.15);
      ctx.stroke();
      // Belly edge
      ctx.strokeStyle = "#8b6f47";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(-4, 2, 18.5, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();

      // Recurve tips (horn nocks)
      const cosTop = Math.cos(-Math.PI * 0.43);
      const sinTop = Math.sin(-Math.PI * 0.43);
      const cosBot = Math.cos(Math.PI * 0.43);
      const sinBot = Math.sin(Math.PI * 0.43);
      const bowTopX = -4 + cosTop * 20;
      const bowTopY = 2 + sinTop * 20;
      const bowBotX = -4 + cosBot * 20;
      const bowBotY = 2 + sinBot * 20;
      // Top nock
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bowTopX, bowTopY);
      ctx.quadraticCurveTo(bowTopX - 3, bowTopY - 4, bowTopX - 6, bowTopY - 1);
      ctx.stroke();
      // Nock tip cap (horn)
      ctx.fillStyle = "#d1c4a9";
      ctx.beginPath();
      ctx.arc(bowTopX - 5, bowTopY - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Bottom nock
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bowBotX, bowBotY);
      ctx.quadraticCurveTo(bowBotX - 3, bowBotY + 4, bowBotX - 6, bowBotY + 1);
      ctx.stroke();
      ctx.fillStyle = "#d1c4a9";
      ctx.beginPath();
      ctx.arc(bowBotX - 5, bowBotY + 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Wrapped grip (detailed)
      const gX = -4 + 20;
      ctx.fillStyle = "#8b6f47";
      ctx.beginPath();
      ctx.arc(gX, 2, 3.5, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.fill();
      ctx.fillStyle = "#6b4c30";
      ctx.beginPath();
      ctx.arc(gX, 2, 2.5, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.fill();
      // Grip wrapping lines
      ctx.strokeStyle = "#5c3a1e";
      ctx.lineWidth = 0.6;
      for (let w = -3; w <= 3; w += 1) {
        ctx.beginPath();
        ctx.moveTo(gX - 1, 2 + w);
        ctx.lineTo(gX + 1.5, 2 + w + 0.6);
        ctx.stroke();
      }
      // Arrow rest notch
      ctx.fillStyle = "#5c3a1e";
      ctx.fillRect(gX - 2, 1, 1.5, 2);

      // === BOWSTRING ===
      ctx.strokeStyle = "#e7e5e4";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bowTopX - 4, bowTopY - 2);
      if (pullBack > 0.1) {
        ctx.lineTo(-4 - pullBack * 12, 2);
      } else {
        ctx.lineTo(gX - 3, 2);
      }
      ctx.lineTo(bowBotX - 4, bowBotY + 2);
      ctx.stroke();

      // Draw hand pulling string
      if (pullBack > 0.1) {
        const pullX = -4 - pullBack * 12;
        // Hand gripping string
        ctx.fillStyle = "#c4a882";
        ctx.beginPath();
        ctx.arc(pullX + 1, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Fingers on string
        ctx.fillStyle = "#b8976e";
        ctx.fillRect(pullX - 0.5, 0.5, 1.5, 3);
        ctx.fillRect(pullX + 0.5, -0.5, 1, 1.5);
        // Forearm with bracer
        ctx.fillStyle = "#6b4c30";
        ctx.fillRect(pullX + 2, -1, 5, 4);
        ctx.strokeStyle = "#8b6f47";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(pullX + 2.5, 0);
        ctx.lineTo(pullX + 6.5, 0);
        ctx.moveTo(pullX + 2.5, 2);
        ctx.lineTo(pullX + 6.5, 2);
        ctx.stroke();
      }

      // Arrow being drawn
      if (pullBack > 0.2) {
        const arrowStartX = -4 - pullBack * 12;
        // Arrow shaft
        ctx.strokeStyle = "#a8967a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowStartX, 2);
        ctx.lineTo(arrowStartX + 26 + pullBack * 8, 2);
        ctx.stroke();
        // Broadhead arrowhead
        const headX = arrowStartX + 26 + pullBack * 8;
        ctx.fillStyle = "#d1d5db";
        ctx.beginPath();
        ctx.moveTo(headX, 2);
        ctx.lineTo(headX + 3, -1);
        ctx.lineTo(headX + 5, 2);
        ctx.lineTo(headX + 3, 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(headX + 1, 2);
        ctx.lineTo(headX + 5, 2);
        ctx.stroke();
        // Fletching (3 vanes)
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.moveTo(arrowStartX, 2);
        ctx.lineTo(arrowStartX + 4, -1);
        ctx.lineTo(arrowStartX + 5, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(arrowStartX, 2);
        ctx.lineTo(arrowStartX + 4, 5);
        ctx.lineTo(arrowStartX + 5, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.moveTo(arrowStartX + 1, 2);
        ctx.lineTo(arrowStartX + 4, 0.5);
        ctx.lineTo(arrowStartX + 5, 2);
        ctx.closePath();
        ctx.fill();
        // Nock
        ctx.fillStyle = "#d1c4a9";
        ctx.fillRect(arrowStartX - 1, 1, 2, 2);
      }

      ctx.restore();

      // Right arm bracer (visible when not pulling)
      if (pullBack <= 0.1) {
        ctx.fillStyle = "#6b4c30";
        ctx.fillRect(4, -9, 5, 4);
        ctx.strokeStyle = "#8b6f47";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(4.5, -8);
        ctx.lineTo(8.5, -8);
        ctx.moveTo(4.5, -6);
        ctx.lineTo(8.5, -6);
        ctx.stroke();
        // Hand at rest
        ctx.fillStyle = "#c4a882";
        ctx.beginPath();
        ctx.arc(7, -4.5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // === QUIVER (large, tooled leather, on back) ===
      ctx.fillStyle = "#5c3a1e";
      ctx.beginPath();
      ctx.moveTo(7, -16);
      ctx.lineTo(6, 5);
      ctx.quadraticCurveTo(6, 7, 8, 7);
      ctx.lineTo(12, 7);
      ctx.quadraticCurveTo(14, 7, 14, 5);
      ctx.lineTo(14, -16);
      ctx.closePath();
      ctx.fill();
      // Tooling pattern (vertical lines)
      ctx.strokeStyle = "#7c5c3c";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(8, -12);
      ctx.lineTo(8, 4);
      ctx.moveTo(10, -14);
      ctx.lineTo(10, 5);
      ctx.moveTo(12, -12);
      ctx.lineTo(12, 4);
      ctx.stroke();
      // Diamond tooling pattern
      for (let qy = -10; qy < 2; qy += 4) {
        ctx.strokeStyle = "#7c5c3c";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(9, qy);
        ctx.lineTo(10, qy - 1.5);
        ctx.lineTo(11, qy);
        ctx.lineTo(10, qy + 1.5);
        ctx.closePath();
        ctx.stroke();
      }
      // Quiver rim (reinforced)
      ctx.fillStyle = "#7c5c3c";
      ctx.fillRect(6, -17, 9, 2.5);
      ctx.strokeStyle = "#4b3018";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(6, -17);
      ctx.lineTo(15, -17);
      ctx.moveTo(6, -14.5);
      ctx.lineTo(15, -14.5);
      ctx.stroke();
      // Metal studs on rim
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath(); ctx.arc(8, -15.8, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(10.5, -15.8, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(13, -15.8, 0.6, 0, Math.PI * 2); ctx.fill();
      // Quiver strap
      ctx.strokeStyle = "#6b4c30";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(9, -15);
      ctx.quadraticCurveTo(4, -17, 2, -14);
      ctx.stroke();

      // === ARROWS IN QUIVER (varied fletching) ===
      const fletchColors = ["#dc2626", "#fbbf24", "#16a34a", "#dc2626", "#3b82f6", "#f97316", "#8b5cf6"];
      for (let a = 0; a < 7; a++) {
        const ax = 7.5 + a * 0.95;
        const aLen = 7 + (a % 3) * 1.5;
        // Arrow shaft
        ctx.strokeStyle = "#a8a29e";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(ax, -17);
        ctx.lineTo(ax, -17 - aLen);
        ctx.stroke();
        // Fletching (2 vanes)
        const fy = -19 - (a % 3);
        ctx.fillStyle = fletchColors[a];
        ctx.beginPath();
        ctx.moveTo(ax, fy);
        ctx.lineTo(ax - 1.3, fy - 2);
        ctx.lineTo(ax, fy - 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ax, fy);
        ctx.lineTo(ax + 1.3, fy - 2);
        ctx.lineTo(ax, fy - 1.5);
        ctx.closePath();
        ctx.fill();
        // Nock
        ctx.fillStyle = "#d1c4a9";
        ctx.fillRect(ax - 0.3, -17 - aLen - 0.5, 0.6, 1);
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

      // Shield (flat color)
      ctx.fillStyle = "#ea580c";
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

        // Cannon ball (flat color)
        ctx.fillStyle = "#3a3a3a";
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

        // Multi-layer explosion (flat colors instead of per-layer gradients)
        for (let layer = 0; layer < 3; layer++) {
          const layerSize = explosionSize * (1 - layer * 0.2);
          const layerAlpha = explosionAlpha * (1 - layer * 0.25);
          const colors = [`rgba(255, 80, 0, ${layerAlpha * 0.4})`, `rgba(255, 150, 50, ${layerAlpha * 0.6})`, `rgba(255, 255, 200, ${layerAlpha * 0.8})`];
          ctx.fillStyle = colors[layer];
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

      // Impact glow at target (flat color)
      ctx.fillStyle = `rgba(130, 180, 255, ${lightningAlpha * 0.35})`;
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

      // Massive fire trail (flat colors instead of per-flame gradients)
      for (let flame = 0; flame < 8; flame++) {
        const flameProgress = flame / 8;
        const flameY = meteorY - 15 - flame * 15;
        const flameX = meteorX + Math.sin(t * 15 + flame * 2) * (5 + flame * 2);
        const flameSize = meteorSize * (1 - flameProgress * 0.7);
        const flameAlpha = 0.8 - flameProgress * 0.6;

        ctx.fillStyle = `rgba(255, ${180 - flame * 15}, ${50 + flame * 5}, ${flameAlpha * 0.5})`;
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

      // Multi-layer explosion dome (flat colors instead of per-layer gradients)
      const expColors = ["rgba(255, 100, 0,", "rgba(255, 200, 50,", "rgba(255, 255, 220,", "rgba(200, 50, 0,"];
      for (let layer = 0; layer < 4; layer++) {
        const layerDelay = layer * 0.1;
        const layerProgress = Math.max(0, impactProgress - layerDelay);
        const layerSize = layerProgress * 120 * (1 - layer * 0.15);
        const layerAlpha = impactAlpha * (1 - layer * 0.2) * 0.5;

        ctx.fillStyle = expColors[layer] + `${layerAlpha})`;
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

      // Ice expansion (flat color)
      ctx.fillStyle = `rgba(180, 215, 255, ${freezeAlpha * 0.3})`;
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
      // Volcanic embers (flat colors instead of per-particle gradients)
      for (let i = 0; i < 35; i++) {
        const ex = (i * 37 + Math.sin(t * 0.8 + i) * 40) % width;
        const ey = height - ((t * 50 + i * 25) % (height * 0.9));
        const emberPulse = 0.5 + Math.sin(t * 8 + i * 2) * 0.5;

        // Glow halo (flat)
        ctx.fillStyle = `rgba(255, 150, 30, ${emberPulse * 0.15})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
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
      // Bioluminescent fireflies (flat colors instead of per-firefly gradients)
      for (let i = 0; i < 20; i++) {
        const fx = (i * 57 + Math.sin(t * 0.6 + i) * 50) % width;
        const fy = height * 0.35 + (i % 6) * 35 + Math.cos(t * 0.4 + i) * 25;
        const glowPhase = (t * 2 + i * 0.7) % 2;
        const glow = glowPhase < 1 ? Math.sin(glowPhase * Math.PI) : 0;

        if (glow > 0.1) {
          // Glow aura (flat)
          ctx.fillStyle = `rgba(120, 240, 120, ${glow * 0.2})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 10, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(200, 255, 200, ${glow})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (scene.particles === "magic") {
      // Mystical arcane particles (flat colors instead of per-particle gradients)
      for (let i = 0; i < 30; i++) {
        const mx = (i * 43 + Math.sin(t * 1.2 + i) * 35) % width;
        const my = ((height - t * 40 - i * 30) % (height + 80)) + 40;
        const magicHue = (t * 60 + i * 25) % 360;
        const magicAlpha = 0.6 + Math.sin(t * 3 + i) * 0.3;

        // Glow (flat)
        ctx.fillStyle = `hsla(${magicHue}, 80%, 60%, ${magicAlpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsla(${magicHue}, 90%, 70%, ${magicAlpha})`;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();
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
  }, []);

  // Own animation loop — throttled to ~15fps, decoupled from React renders
  useEffect(() => {
    let animationId: number;
    let lastDrawTime = 0;
    const animate = (timestamp: number) => {
      // Throttle to ~15fps (67ms) for a preview that doesn't need to be butter smooth
      if (timestamp - lastDrawTime > 67) {
        lastDrawTime = timestamp;
        drawScene(currentScene);
      }
      animationId = requestAnimationFrame(animate);
    };
    animate(0);
    return () => cancelAnimationFrame(animationId);
  }, [drawScene, currentScene]);

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

