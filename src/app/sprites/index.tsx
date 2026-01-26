"use client";
import React, { useRef, useEffect, useState } from "react";
import type { TowerType, HeroType, SpellType } from "../types";
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
export function darkenColor(color: string, amount: number): string {
  const hex = color?.replace("#", "") || "888888";
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
export function lightenColor(color: string, amount: number): string {
  const hex = color?.replace("#", "") || "888888";
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
// =============================================================================
// TOWER SPRITES - Matches actual game rendering
// =============================================================================
// =============================================================================
// TOWER SPRITES - Matches actual game rendering
// =============================================================================
export const TowerSprite: React.FC<{
  type: TowerType;
  size?: number;
  level?: number;
  animated?: boolean;
}> = ({ type, size = 48, level = 1, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => setTime((t) => t + 1), 50);
    return () => clearInterval(interval);
  }, [animated]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2 + 4;
    const scale = size / 60;
    const t = time * 0.05;
    switch (type) {
      case "cannon": {
        // =====================================================================
        // NASSAU CANNON - Heavy Artillery Tower with Detailed Mechanical Base
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 14 * scale,
          20 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Layered hexagonal stone foundation platform
        ctx.fillStyle = "#5a5a62";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 18 * scale;
          const py = cy + 12 * scale + Math.sin(angle) * 9 * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Foundation edge highlight
        ctx.strokeStyle = "#7a7a82";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Foundation gradient shading
        const foundGrad = ctx.createLinearGradient(
          cx - 18 * scale,
          cy,
          cx + 18 * scale,
          cy
        );
        foundGrad.addColorStop(0, "rgba(0,0,0,0.3)");
        foundGrad.addColorStop(0.5, "rgba(255,255,255,0.1)");
        foundGrad.addColorStop(1, "rgba(0,0,0,0.2)");
        ctx.fillStyle = foundGrad;
        ctx.fill();

        // Decorative rivets on foundation
        ctx.fillStyle = "#3a3a3a";
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI * 2) / 3 + Math.PI / 6;
          const rx = cx + Math.cos(angle) * 14 * scale;
          const ry = cy + 12 * scale + Math.sin(angle) * 7 * scale;
          ctx.beginPath();
          ctx.arc(rx, ry, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mechanical base platform - left face (shadowed)
        const leftFaceGrad = ctx.createLinearGradient(
          cx - 14 * scale,
          cy,
          cx,
          cy
        );
        leftFaceGrad.addColorStop(0, "#3a3a42");
        leftFaceGrad.addColorStop(1, "#4a4a52");
        ctx.fillStyle = leftFaceGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 10 * scale);
        ctx.lineTo(cx, cy - 6 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        const rightFaceGrad = ctx.createLinearGradient(
          cx,
          cy,
          cx + 14 * scale,
          cy
        );
        rightFaceGrad.addColorStop(0, "#4a4a52");
        rightFaceGrad.addColorStop(1, "#5a5a62");
        ctx.fillStyle = rightFaceGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 10 * scale);
        ctx.lineTo(cx, cy - 6 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Top face
        const topFaceGrad = ctx.createLinearGradient(
          cx,
          cy - 14 * scale,
          cx,
          cy - 6 * scale
        );
        topFaceGrad.addColorStop(0, "#6a6a72");
        topFaceGrad.addColorStop(1, "#5a5a62");
        ctx.fillStyle = topFaceGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 14 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 10 * scale);
        ctx.lineTo(cx, cy - 6 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 10 * scale);
        ctx.closePath();
        ctx.fill();

        // Tech vents with animated orange glow
        const ventGlow = animated ? 0.5 + Math.sin(t * 4) * 0.3 : 0.6;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx - 9 * scale, cy - 3 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(cx + 5 * scale, cy - 3 * scale, 4 * scale, 8 * scale);
        ctx.fillStyle = `rgba(255, 102, 0, ${ventGlow})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 6 * scale;
        ctx.fillRect(cx - 8 * scale, cy - 2 * scale, 2 * scale, 6 * scale);
        ctx.fillRect(cx + 6 * scale, cy - 2 * scale, 2 * scale, 6 * scale);
        ctx.shadowBlur = 0;

        // Heat shimmer effect
        if (animated) {
          ctx.strokeStyle = `rgba(255, 150, 50, ${0.2 + Math.sin(t * 5) * 0.1
            })`;
          ctx.lineWidth = 1 * scale;
          for (let i = 0; i < 3; i++) {
            const shimmerY = cy - 5 * scale - i * 4 * scale - ((t * 20) % 12);
            ctx.beginPath();
            ctx.moveTo(cx - 6 * scale, shimmerY);
            ctx.quadraticCurveTo(cx - 3 * scale, shimmerY - 2, cx, shimmerY);
            ctx.quadraticCurveTo(
              cx + 3 * scale,
              shimmerY + 2,
              cx + 6 * scale,
              shimmerY
            );
            ctx.stroke();
          }
        }

        // Turret rotation base
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale,
          12 * scale,
          7 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 13 * scale,
          10 * scale,
          6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Gear detail on turret base
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1.5 * scale;
        const gearRotation = animated ? t * 0.5 : 0;
        for (let i = 0; i < 8; i++) {
          const angle = gearRotation + (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(angle) * 7 * scale,
            cy - 13 * scale + Math.sin(angle) * 4 * scale
          );
          ctx.lineTo(
            cx + Math.cos(angle) * 10 * scale,
            cy - 13 * scale + Math.sin(angle) * 6 * scale
          );
          ctx.stroke();
        }

        // Detailed cannon barrel
        ctx.save();
        ctx.translate(cx, cy - 14 * scale);
        ctx.rotate(-0.35);

        // Barrel base section
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main barrel body with gradient
        const barrelGrad = ctx.createLinearGradient(
          0,
          -5 * scale,
          0,
          5 * scale
        );
        barrelGrad.addColorStop(0, "#4a4a4a");
        barrelGrad.addColorStop(0.3, "#3a3a3a");
        barrelGrad.addColorStop(0.7, "#2a2a2a");
        barrelGrad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = barrelGrad;
        ctx.fillRect(0, -4 * scale, 24 * scale, 8 * scale);

        // Reinforcement rings
        ctx.fillStyle = "#5a5a5a";
        ctx.fillRect(6 * scale, -5 * scale, 3 * scale, 10 * scale);
        ctx.fillRect(13 * scale, -5 * scale, 3 * scale, 10 * scale);
        ctx.fillRect(20 * scale, -4.5 * scale, 2 * scale, 9 * scale);

        // Barrel bore (dark interior)
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.ellipse(24 * scale, 0, 3 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle glow effect
        ctx.fillStyle = `rgba(255, 100, 0, ${ventGlow * 0.8})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 10 * scale;
        ctx.beginPath();
        ctx.arc(25 * scale, 0, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Smoke wisps from barrel
        if (animated) {
          ctx.fillStyle = `rgba(100, 100, 100, ${0.3 - (t % 2) * 0.15})`;
          for (let i = 0; i < 2; i++) {
            const smokeX = cx + 20 * scale + ((t * 5 + i * 8) % 15);
            const smokeY = cy - 22 * scale - ((t * 3 + i * 5) % 10);
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, (2 + i) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Aiming sight on top
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx - 1 * scale, cy - 20 * scale, 2 * scale, 4 * scale);
        ctx.fillStyle = "#00ff00";
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 21 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Princeton crest emblem on base
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx, cy + 2 * scale);
        ctx.lineTo(cx + 4 * scale, cy + 6 * scale);
        ctx.lineTo(cx, cy + 10 * scale);
        ctx.lineTo(cx - 4 * scale, cy + 6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffa500";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Level indicator stars with gold glow
        if (level > 1) {
          ctx.fillStyle = "#ffd700";
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 20 * scale, 3 * scale);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "library": {
        // =====================================================================
        // FIRESTONE LIBRARY - Gothic Academic Tower with Purple Arcane Window
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 14 * scale,
          18 * scale,
          9 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Stone foundation steps
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 18 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 18 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Main building - left face (shadowed)
        const leftWallGrad = ctx.createLinearGradient(
          cx - 16 * scale,
          cy,
          cx,
          cy
        );
        leftWallGrad.addColorStop(0, "#5a4a3a");
        leftWallGrad.addColorStop(1, "#6b5b4b");
        ctx.fillStyle = leftWallGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 14 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 4 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        const rightWallGrad = ctx.createLinearGradient(
          cx,
          cy,
          cx + 16 * scale,
          cy
        );
        rightWallGrad.addColorStop(0, "#6b5b4b");
        rightWallGrad.addColorStop(1, "#5a4a3a");
        ctx.fillStyle = rightWallGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 14 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 4 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Stone block pattern on walls
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * scale;
        for (let row = 0; row < 4; row++) {
          const y = cy + 8 * scale - row * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 14 * scale + row * 2 * scale, y);
          ctx.lineTo(cx - 2 * scale, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 2 * scale, y);
          ctx.lineTo(cx + 14 * scale - row * 2 * scale, y);
          ctx.stroke();
        }

        // Gothic pointed roof - main section
        const roofGrad = ctx.createLinearGradient(
          cx - 18 * scale,
          cy - 8 * scale,
          cx + 18 * scale,
          cy - 8 * scale
        );
        roofGrad.addColorStop(0, "#3a2a1a");
        roofGrad.addColorStop(0.5, "#4a3a2a");
        roofGrad.addColorStop(1, "#3a2a1a");
        ctx.fillStyle = roofGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 18 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 32 * scale);
        ctx.lineTo(cx + 18 * scale, cy - 8 * scale);
        ctx.closePath();
        ctx.fill();

        // Roof highlight edge
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 32 * scale);
        ctx.lineTo(cx + 18 * scale, cy - 8 * scale);
        ctx.lineTo(cx + 14 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 28 * scale);
        ctx.closePath();
        ctx.fill();

        // Roof tile pattern
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 5; i++) {
          const tileY = cy - 10 * scale - i * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 16 * scale + i * 3 * scale, tileY);
          ctx.lineTo(cx + 16 * scale - i * 3 * scale, tileY);
          ctx.stroke();
        }

        // Decorative dormers on roof
        ctx.fillStyle = "#4a3a2a";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 14 * scale);
        ctx.lineTo(cx - 6 * scale, cy - 20 * scale);
        ctx.lineTo(cx - 4 * scale, cy - 14 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 14 * scale);
        ctx.lineTo(cx + 6 * scale, cy - 20 * scale);
        ctx.lineTo(cx + 8 * scale, cy - 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Small dormer windows with purple glow
        const glowIntensity = animated ? 0.6 + Math.sin(t * 2) * 0.3 : 0.8;
        ctx.fillStyle = `rgba(180, 100, 255, ${glowIntensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx - 6 * scale, cy - 16 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 6 * scale, cy - 16 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Main Gothic arched window frame
        ctx.fillStyle = "#2a1a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 8 * scale);
        ctx.lineTo(cx - 6 * scale, cy - 2 * scale);
        ctx.quadraticCurveTo(
          cx,
          cy - 10 * scale,
          cx + 6 * scale,
          cy - 2 * scale
        );
        ctx.lineTo(cx + 6 * scale, cy + 8 * scale);
        ctx.closePath();
        ctx.fill();

        // Window stone frame detail
        ctx.strokeStyle = "#7b6b5b";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 8 * scale);
        ctx.lineTo(cx - 6 * scale, cy - 2 * scale);
        ctx.quadraticCurveTo(
          cx,
          cy - 10 * scale,
          cx + 6 * scale,
          cy - 2 * scale
        );
        ctx.lineTo(cx + 6 * scale, cy + 8 * scale);
        ctx.stroke();

        // PURPLE window glow (changed from yellow)
        const purpleGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          8 * scale
        );
        purpleGrad.addColorStop(0, `rgba(220, 180, 255, ${glowIntensity})`);
        purpleGrad.addColorStop(
          0.5,
          `rgba(180, 100, 255, ${glowIntensity * 0.8})`
        );
        purpleGrad.addColorStop(
          1,
          `rgba(120, 50, 200, ${glowIntensity * 0.6})`
        );
        ctx.fillStyle = purpleGrad;
        ctx.shadowColor = "#b464ff";
        ctx.shadowBlur = 12 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 7 * scale);
        ctx.lineTo(cx - 5 * scale, cy - 1 * scale);
        ctx.quadraticCurveTo(
          cx,
          cy - 8 * scale,
          cx + 5 * scale,
          cy - 1 * scale
        );
        ctx.lineTo(cx + 5 * scale, cy + 7 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Window mullions (cross pattern)
        ctx.strokeStyle = "#1a0a0a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale);
        ctx.lineTo(cx, cy + 7 * scale);
        ctx.moveTo(cx - 4 * scale, cy + 2 * scale);
        ctx.lineTo(cx + 4 * scale, cy + 2 * scale);
        ctx.stroke();

        // Floating magical runes around window
        if (animated) {
          ctx.fillStyle = `rgba(180, 100, 255, ${0.5 + Math.sin(t * 3) * 0.3})`;
          ctx.font = `${3 * scale}px serif`;
          ctx.textAlign = "center";
          const runeAngle = t * 0.5;
          for (let i = 0; i < 4; i++) {
            const angle = runeAngle + (i * Math.PI) / 2;
            const rx = cx + Math.cos(angle) * 10 * scale;
            const ry = cy + 2 * scale + Math.sin(angle) * 6 * scale;
            ctx.fillText(["◇", "△", "○", "☆"][i], rx, ry);
          }
        }

        // Main spire
        ctx.fillStyle = "#3a2a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 32 * scale);
        ctx.lineTo(cx, cy - 42 * scale);
        ctx.lineTo(cx + 3 * scale, cy - 32 * scale);
        ctx.closePath();
        ctx.fill();

        // Spire highlight
        ctx.fillStyle = "#4a3a2a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 42 * scale);
        ctx.lineTo(cx + 3 * scale, cy - 32 * scale);
        ctx.lineTo(cx + 1 * scale, cy - 32 * scale);
        ctx.closePath();
        ctx.fill();

        // Spire orb with purple glow
        ctx.fillStyle = `rgba(180, 100, 255, ${glowIntensity})`;
        ctx.shadowColor = "#b464ff";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 43 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Side buttresses
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 18 * scale, cy + 2 * scale);
        ctx.lineTo(cx - 14 * scale, cy - 2 * scale);
        ctx.lineTo(cx - 14 * scale, cy + 10 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 18 * scale, cy + 2 * scale);
        ctx.lineTo(cx + 14 * scale, cy - 2 * scale);
        ctx.lineTo(cx + 14 * scale, cy + 10 * scale);
        ctx.closePath();
        ctx.fill();

        // Entrance door
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 3 * scale, cy + 9 * scale);
        ctx.arc(cx, cy + 9 * scale, 3 * scale, Math.PI, 0);
        ctx.lineTo(cx + 3 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Door handle
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx + 1 * scale, cy + 11 * scale, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Level indicator
        if (level > 1) {
          ctx.fillStyle = "#b464ff";
          ctx.shadowColor = "#b464ff";
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 20 * scale, 3 * scale);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "lab": {
        // =====================================================================
        // E-QUAD LAB - Tesla/Electric Tower with Detailed Industrial Design
        // =====================================================================

        //shift the overall sprite down
        ctx.translate(0, 12 * scale);

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 14 * scale,
          16 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Concrete foundation platform
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 16 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Industrial building - left face (shadowed)
        const leftLabGrad = ctx.createLinearGradient(
          cx - 14 * scale,
          cy,
          cx,
          cy
        );
        leftLabGrad.addColorStop(0, "#2d4a5a");
        leftLabGrad.addColorStop(1, "#3d5a6b");
        ctx.fillStyle = leftLabGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 12 * scale);
        ctx.lineTo(cx, cy - 8 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        const rightLabGrad = ctx.createLinearGradient(
          cx,
          cy,
          cx + 14 * scale,
          cy
        );
        rightLabGrad.addColorStop(0, "#3d5a6b");
        rightLabGrad.addColorStop(1, "#4d6a7b");
        ctx.fillStyle = rightLabGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 12 * scale);
        ctx.lineTo(cx, cy - 8 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Industrial panel lines
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 4; i++) {
          const panelX = cx - 10 * scale + i * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(panelX, cy + 8 * scale);
          ctx.lineTo(panelX + 1 * scale, cy - 8 * scale);
          ctx.stroke();
        }
        for (let i = 0; i < 4; i++) {
          const panelX = cx + 2 * scale + i * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(panelX, cy + 8 * scale);
          ctx.lineTo(panelX - 1 * scale, cy - 8 * scale);
          ctx.stroke();
        }

        // Ventilation grilles
        ctx.fillStyle = "#1a2a3a";
        ctx.fillRect(cx - 10 * scale, cy + 2 * scale, 6 * scale, 4 * scale);
        ctx.fillRect(cx + 4 * scale, cy + 2 * scale, 6 * scale, 4 * scale);
        // Grille slats
        ctx.strokeStyle = "#3d5a6b";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, cy + 3 * scale + i * 1.2 * scale);
          ctx.lineTo(cx - 5 * scale, cy + 3 * scale + i * 1.2 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 5 * scale, cy + 3 * scale + i * 1.2 * scale);
          ctx.lineTo(cx + 9 * scale, cy + 3 * scale + i * 1.2 * scale);
          ctx.stroke();
        }

        // Lab windows with cyan glow
        const labGlow = animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7;
        ctx.fillStyle = "#0a1a2a";
        ctx.fillRect(cx - 8 * scale, cy - 6 * scale, 5 * scale, 6 * scale);
        ctx.fillRect(cx + 3 * scale, cy - 6 * scale, 5 * scale, 6 * scale);
        ctx.fillStyle = `rgba(0, 255, 255, ${labGlow * 0.7})`;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 6 * scale;
        ctx.fillRect(cx - 7 * scale, cy - 5 * scale, 3 * scale, 4 * scale);
        ctx.fillRect(cx + 4 * scale, cy - 5 * scale, 3 * scale, 4 * scale);
        ctx.shadowBlur = 0;

        // Dome structure
        const domeGrad = ctx.createRadialGradient(
          cx,
          cy - 14 * scale,
          0,
          cx,
          cy - 14 * scale,
          12 * scale
        );
        domeGrad.addColorStop(0, "#5d7a8b");
        domeGrad.addColorStop(0.7, "#4d6a7b");
        domeGrad.addColorStop(1, "#3d5a6b");
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale, 12 * scale, Math.PI, 0);
        ctx.fill();

        // Dome panel lines
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 5; i++) {
          const angle = Math.PI + (i * Math.PI) / 5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 12 * scale);
          ctx.lineTo(
            cx + Math.cos(angle) * 12 * scale,
            cy - 12 * scale + Math.sin(angle) * 12 * scale
          );
          ctx.stroke();
        }

        // Dome observation window
        ctx.fillStyle = `rgba(0, 255, 255, ${labGlow * 0.5})`;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 18 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tesla coil base
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 22 * scale,
          4 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Tesla coil tower
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(cx - 2 * scale, cy - 38 * scale, 4 * scale, 16 * scale);

        // Coil rings
        ctx.strokeStyle = "#5a5a5a";
        ctx.lineWidth = 1.5 * scale;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy - 26 * scale - i * 3 * scale,
            5 * scale - i * 0.5 * scale,
            1.5 * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        // Energy orb at top with pulsing animation
        const orbPulse = animated ? 1 + Math.sin(t * 3) * 0.3 : 1;
        ctx.fillStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 15 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 40 * scale, 6 * scale * orbPulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy - 40 * scale, 3 * scale * orbPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Electric arcs emanating from orb
        if (animated) {
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.7 + Math.sin(t * 5) * 0.3})`;
          ctx.lineWidth = 1.5 * scale;
          for (let i = 0; i < 6; i++) {
            const arcAngle = t * 2.5 + (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 40 * scale);
            // Jagged lightning path
            let ax = cx,
              ay = cy - 40 * scale;
            for (let j = 0; j < 3; j++) {
              const dist = (3 + j * 3) * scale;
              const jitter = Math.sin(t * 10 + i + j) * 2 * scale;
              ax = cx + Math.cos(arcAngle) * dist + jitter;
              ay = cy - 40 * scale + Math.sin(arcAngle) * dist * 0.6 + jitter;
              ctx.lineTo(ax, ay);
            }
            ctx.stroke();
          }
        }

        // Ground electricity effect
        if (animated) {
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(t * 8) * 0.2})`;
          ctx.lineWidth = 1 * scale;
          for (let i = 0; i < 3; i++) {
            const boltX = cx - 8 * scale + i * 8 * scale;
            ctx.beginPath();
            ctx.moveTo(boltX, cy + 10 * scale);
            ctx.lineTo(boltX + 2 * scale, cy + 6 * scale);
            ctx.lineTo(boltX - 1 * scale, cy + 4 * scale);
            ctx.lineTo(boltX + 1 * scale, cy + 2 * scale);
            ctx.stroke();
          }
        }

        // Hazard stripes on base
        ctx.fillStyle = "#ffcc00";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 12 * scale + i * 6 * scale, cy + 14 * scale);
          ctx.lineTo(cx - 10 * scale + i * 6 * scale, cy + 10 * scale);
          ctx.lineTo(cx - 8 * scale + i * 6 * scale, cy + 10 * scale);
          ctx.lineTo(cx - 10 * scale + i * 6 * scale, cy + 14 * scale);
          ctx.closePath();
          ctx.fill();
        }

        // Engineering emblem (gear)
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 1 * scale;
        const gearRot = animated ? t * 0.5 : 0;
        ctx.beginPath();
        ctx.arc(cx, cy + 7 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const toothAngle = gearRot + (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(toothAngle) * 3 * scale,
            cy + 7 * scale + Math.sin(toothAngle) * 3 * scale
          );
          ctx.lineTo(
            cx + Math.cos(toothAngle) * 5 * scale,
            cy + 7 * scale + Math.sin(toothAngle) * 5 * scale
          );
          ctx.stroke();
        }

        // Level indicator stars with cyan glow
        if (level > 1) {
          ctx.fillStyle = "#00ffff";
          ctx.shadowColor = "#00ffff";
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 20 * scale, 3 * scale);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "arch": {
        // =====================================================================
        // BLAIR ARCH - Gothic Portal Tower with GREEN Magical Gateway
        // =====================================================================
        ctx.translate(0, 7 * scale);

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 14 * scale,
          20 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Stone foundation platform
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 18 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 18 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 20 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Left pillar - multiple layers for depth
        const leftPillarGrad = ctx.createLinearGradient(
          cx - 18 * scale,
          0,
          cx - 8 * scale,
          0
        );
        leftPillarGrad.addColorStop(0, "#5b4b3b");
        leftPillarGrad.addColorStop(0.3, "#7b6b55");
        leftPillarGrad.addColorStop(1, "#6b5b45");
        ctx.fillStyle = leftPillarGrad;
        ctx.fillRect(cx - 18 * scale, cy - 22 * scale, 10 * scale, 32 * scale);

        // Left pillar shadow edge
        ctx.fillStyle = "#4a3a2a";
        ctx.fillRect(cx - 18 * scale, cy - 22 * scale, 2 * scale, 32 * scale);

        // Left pillar highlight
        ctx.fillStyle = "#8b7b65";
        ctx.fillRect(cx - 10 * scale, cy - 22 * scale, 2 * scale, 32 * scale);

        // Right pillar
        const rightPillarGrad = ctx.createLinearGradient(
          cx + 8 * scale,
          0,
          cx + 18 * scale,
          0
        );
        rightPillarGrad.addColorStop(0, "#6b5b45");
        rightPillarGrad.addColorStop(0.7, "#7b6b55");
        rightPillarGrad.addColorStop(1, "#5b4b3b");
        ctx.fillStyle = rightPillarGrad;
        ctx.fillRect(cx + 8 * scale, cy - 22 * scale, 10 * scale, 32 * scale);

        // Right pillar highlight
        ctx.fillStyle = "#8b7b65";
        ctx.fillRect(cx + 8 * scale, cy - 22 * scale, 2 * scale, 32 * scale);

        // Stone block pattern on pillars
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * scale;
        for (let row = 0; row < 7; row++) {
          const y = cy + 8 * scale - row * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 17 * scale, y);
          ctx.lineTo(cx - 9 * scale, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 9 * scale, y);
          ctx.lineTo(cx + 17 * scale, y);
          ctx.stroke();
        }

        // Pillar capitals (decorative tops)
        ctx.fillStyle = "#8b7b65";
        ctx.fillRect(cx - 20 * scale, cy - 24 * scale, 14 * scale, 3 * scale);
        ctx.fillRect(cx + 6 * scale, cy - 24 * scale, 14 * scale, 3 * scale);

        // Carved decorative bands on pillars
        ctx.fillStyle = "#9b8b75";
        ctx.fillRect(cx - 17 * scale, cy - 10 * scale, 8 * scale, 2 * scale);
        ctx.fillRect(cx + 9 * scale, cy - 10 * scale, 8 * scale, 2 * scale);
        ctx.fillRect(cx - 17 * scale, cy + 2 * scale, 8 * scale, 2 * scale);
        ctx.fillRect(cx + 9 * scale, cy + 2 * scale, 8 * scale, 2 * scale);

        // Gothic arch structure
        ctx.fillStyle = "#8b7b65";
        ctx.beginPath();
        ctx.arc(cx, cy - 22 * scale, 14 * scale, Math.PI, 0);
        ctx.lineTo(cx + 18 * scale, cy - 22 * scale);
        ctx.arc(cx, cy - 22 * scale, 18 * scale, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Keystone at top of arch
        ctx.fillStyle = "#9b8b75";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 36 * scale);
        ctx.lineTo(cx, cy - 40 * scale);
        ctx.lineTo(cx + 4 * scale, cy - 36 * scale);
        ctx.lineTo(cx + 3 * scale, cy - 32 * scale);
        ctx.lineTo(cx - 3 * scale, cy - 32 * scale);
        ctx.closePath();
        ctx.fill();

        // Keystone carving (Princeton shield)
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 38 * scale);
        ctx.lineTo(cx + 2 * scale, cy - 35 * scale);
        ctx.lineTo(cx, cy - 33 * scale);
        ctx.lineTo(cx - 2 * scale, cy - 35 * scale);
        ctx.closePath();
        ctx.fill();

        // Arch stone pattern
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 6; i++) {
          const angle = Math.PI + (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(angle) * 14 * scale,
            cy - 22 * scale + Math.sin(angle) * 14 * scale
          );
          ctx.lineTo(
            cx + Math.cos(angle) * 18 * scale,
            cy - 22 * scale + Math.sin(angle) * 18 * scale
          );
          ctx.stroke();
        }

        // Inner arch opening (dark passage)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale, 10 * scale, Math.PI, 0);
        ctx.lineTo(cx + 10 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 10 * scale, cy + 10 * scale);
        ctx.closePath();
        ctx.fill();

        // GREEN portal glow (changed from purple)
        const portalGlow = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
        const greenPortalGrad = ctx.createRadialGradient(
          cx,
          cy - 4 * scale,
          0,
          cx,
          cy - 4 * scale,
          10 * scale
        );
        greenPortalGrad.addColorStop(0, `rgba(100, 255, 150, ${portalGlow})`);
        greenPortalGrad.addColorStop(
          0.5,
          `rgba(50, 200, 100, ${portalGlow * 0.7})`
        );
        greenPortalGrad.addColorStop(
          1,
          `rgba(20, 150, 80, ${portalGlow * 0.4})`
        );
        ctx.fillStyle = greenPortalGrad;
        ctx.shadowColor = "#50ff80";
        ctx.shadowBlur = 15 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale, 8 * scale, Math.PI, 0);
        ctx.lineTo(cx + 8 * scale, cy + 6 * scale);
        ctx.lineTo(cx - 8 * scale, cy + 6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Portal swirl effect
        if (animated) {
          ctx.strokeStyle = `rgba(150, 255, 180, ${0.4 + Math.sin(t * 3) * 0.2
            })`;
          ctx.lineWidth = 1.5 * scale;
          for (let i = 0; i < 3; i++) {
            const spiralOffset = t * 2 + i * Math.PI * 0.67;
            ctx.beginPath();
            for (let j = 0; j < 20; j++) {
              const angle = spiralOffset + j * 0.3;
              const radius = 2 * scale + j * 0.3 * scale;
              const sx = cx + Math.cos(angle) * radius;
              const sy = cy - 4 * scale + Math.sin(angle) * radius * 0.6;
              if (j === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
          }
        }

        // Magical runes on arch
        ctx.fillStyle = `rgba(100, 255, 150, ${0.6 + Math.sin(t * 2) * 0.3})`;
        ctx.font = `${3 * scale}px serif`;
        ctx.textAlign = "center";
        const runes = ["ᚨ", "ᚱ", "ᚲ", "ᚺ"];
        for (let i = 0; i < 4; i++) {
          const angle = Math.PI + 0.3 + i * 0.6;
          const rx = cx + Math.cos(angle) * 16 * scale;
          const ry = cy - 22 * scale + Math.sin(angle) * 16 * scale;
          ctx.fillText(runes[i], rx, ry);
        }

        // Sound/energy waves emanating from portal
        if (animated) {
          ctx.strokeStyle = `rgba(100, 255, 150, ${0.5 - (t % 1) * 0.4})`;
          ctx.lineWidth = 2 * scale;
          for (let i = 0; i < 3; i++) {
            const waveSize = (5 + ((t * 8) % 12) + i * 4) * scale;
            ctx.beginPath();
            ctx.arc(cx, cy - 4 * scale, waveSize, -0.7, 0.7);
            ctx.stroke();
          }
        }

        // Torch holders on pillars
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(cx - 22 * scale, cy - 6 * scale, 4 * scale, 2 * scale);
        ctx.fillRect(cx + 18 * scale, cy - 6 * scale, 4 * scale, 2 * scale);

        // Animated torches with green flames
        const flameFlicker = animated ? Math.sin(t * 8) * 0.3 : 0;

        // Left torch
        ctx.fillStyle = "#4a3020";
        ctx.fillRect(cx - 24 * scale, cy - 14 * scale, 2 * scale, 8 * scale);
        ctx.fillStyle = `rgba(100, 255, 150, ${0.8 + flameFlicker})`;
        ctx.shadowColor = "#50ff80";
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 25 * scale, cy - 14 * scale);
        ctx.quadraticCurveTo(
          cx - 23 * scale,
          cy - 20 * scale - flameFlicker * 4,
          cx - 21 * scale,
          cy - 14 * scale
        );
        ctx.closePath();
        ctx.fill();

        // Right torch
        ctx.fillStyle = "#4a3020";
        ctx.fillRect(cx + 22 * scale, cy - 14 * scale, 2 * scale, 8 * scale);
        ctx.fillStyle = `rgba(100, 255, 150, ${0.8 - flameFlicker})`;
        ctx.beginPath();
        ctx.moveTo(cx + 21 * scale, cy - 14 * scale);
        ctx.quadraticCurveTo(
          cx + 23 * scale,
          cy - 20 * scale + flameFlicker * 4,
          cx + 25 * scale,
          cy - 14 * scale
        );
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Level indicator
        if (level > 1) {
          ctx.fillStyle = "#50ff80";
          ctx.shadowColor = "#50ff80";
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 20 * scale, 3 * scale);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "club": {
        // =====================================================================
        // EATING CLUB - Colonial Mansion with Grand Architecture
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 14 * scale,
          18 * scale,
          9 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Stone foundation/steps
        ctx.fillStyle = "#4a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 18 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 18 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Step detail
        ctx.fillStyle = "#5a5a4a";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 6 * scale, cy + 11 * scale);
        ctx.lineTo(cx + 6 * scale, cy + 11 * scale);
        ctx.lineTo(cx + 8 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Main building - left face (shadowed)
        const leftClubGrad = ctx.createLinearGradient(
          cx - 16 * scale,
          cy,
          cx,
          cy
        );
        leftClubGrad.addColorStop(0, "#1d5b1d");
        leftClubGrad.addColorStop(1, "#2d6b2d");
        ctx.fillStyle = leftClubGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 14 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 2 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        const rightClubGrad = ctx.createLinearGradient(
          cx,
          cy,
          cx + 16 * scale,
          cy
        );
        rightClubGrad.addColorStop(0, "#2d6b2d");
        rightClubGrad.addColorStop(1, "#3d7b3d");
        ctx.fillStyle = rightClubGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 16 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 14 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 2 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Decorative horizontal bands
        ctx.strokeStyle = "#4d8b4d";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 4 * scale);
        ctx.lineTo(cx + 14 * scale, cy + 4 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 13 * scale, cy - 2 * scale);
        ctx.lineTo(cx + 13 * scale, cy - 2 * scale);
        ctx.stroke();

        // Grand roof with steeper pitch
        const roofGrad = ctx.createLinearGradient(
          cx - 18 * scale,
          cy - 6 * scale,
          cx + 18 * scale,
          cy - 6 * scale
        );
        roofGrad.addColorStop(0, "#0a3a0a");
        roofGrad.addColorStop(0.5, "#1a4a1a");
        roofGrad.addColorStop(1, "#0a3a0a");
        ctx.fillStyle = roofGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 18 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 28 * scale);
        ctx.lineTo(cx + 18 * scale, cy - 6 * scale);
        ctx.closePath();
        ctx.fill();

        // Roof highlight edge
        ctx.fillStyle = "#2a5a2a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28 * scale);
        ctx.lineTo(cx + 18 * scale, cy - 6 * scale);
        ctx.lineTo(cx + 14 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 24 * scale);
        ctx.closePath();
        ctx.fill();

        // Roof shingle pattern
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * scale;
        for (let row = 0; row < 4; row++) {
          const shingleY = cy - 8 * scale - row * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 16 * scale + row * 3 * scale, shingleY);
          ctx.lineTo(cx + 16 * scale - row * 3 * scale, shingleY);
          ctx.stroke();
        }

        // Decorative dormer window
        ctx.fillStyle = "#1a4a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 12 * scale);
        ctx.lineTo(cx, cy - 18 * scale);
        ctx.lineTo(cx + 4 * scale, cy - 12 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(255, 215, 0, 0.7)`;
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Colonial columns (portico)
        ctx.fillStyle = "#f5f5f0";
        ctx.fillRect(cx - 6 * scale, cy - 2 * scale, 2 * scale, 12 * scale);
        ctx.fillRect(cx + 4 * scale, cy - 2 * scale, 2 * scale, 12 * scale);

        // Column capitals
        ctx.fillStyle = "#e5e5e0";
        ctx.fillRect(cx - 7 * scale, cy - 3 * scale, 4 * scale, 2 * scale);
        ctx.fillRect(cx + 3 * scale, cy - 3 * scale, 4 * scale, 2 * scale);

        // Column bases
        ctx.fillRect(cx - 7 * scale, cy + 9 * scale, 4 * scale, 2 * scale);
        ctx.fillRect(cx + 3 * scale, cy + 9 * scale, 4 * scale, 2 * scale);

        // Portico roof
        ctx.fillStyle = "#1a4a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 3 * scale);
        ctx.lineTo(cx, cy - 8 * scale);
        ctx.lineTo(cx + 10 * scale, cy - 3 * scale);
        ctx.closePath();
        ctx.fill();

        // Grand entrance door
        ctx.fillStyle = "#3a1a0a";
        ctx.fillRect(cx - 3 * scale, cy + 2 * scale, 6 * scale, 8 * scale);

        // Door panels
        ctx.strokeStyle = "#2a0a00";
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(cx - 2.5 * scale, cy + 3 * scale, 2 * scale, 3 * scale);
        ctx.strokeRect(cx + 0.5 * scale, cy + 3 * scale, 2 * scale, 3 * scale);
        ctx.strokeRect(cx - 2.5 * scale, cy + 7 * scale, 2 * scale, 2 * scale);
        ctx.strokeRect(cx + 0.5 * scale, cy + 7 * scale, 2 * scale, 2 * scale);

        // Door knocker
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx, cy + 6 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Fanlight window above door
        ctx.fillStyle = `rgba(255, 215, 0, 0.6)`;
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * scale, 2.5 * scale, Math.PI, 0);
        ctx.fill();
        // Fanlight spokes
        ctx.strokeStyle = "#2a1a0a";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 4; i++) {
          const spokeAngle = Math.PI + (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cx, cy + 2 * scale);
          ctx.lineTo(
            cx + Math.cos(spokeAngle) * 2.5 * scale,
            cy + 2 * scale + Math.sin(spokeAngle) * 2.5 * scale
          );
          ctx.stroke();
        }

        // Side windows with mullions
        ctx.fillStyle = "#0a2a0a";
        ctx.fillRect(cx - 13 * scale, cy + 1 * scale, 4 * scale, 5 * scale);
        ctx.fillRect(cx + 9 * scale, cy + 1 * scale, 4 * scale, 5 * scale);
        ctx.fillStyle = `rgba(255, 215, 0, 0.5)`;
        ctx.fillRect(cx - 12 * scale, cy + 2 * scale, 2 * scale, 3 * scale);
        ctx.fillRect(cx + 10 * scale, cy + 2 * scale, 2 * scale, 3 * scale);

        // Ivy climbing on walls
        ctx.fillStyle = "#1a5a1a";
        const ivyPositions = [
          { x: cx - 14 * scale, y: cy + 8 * scale },
          { x: cx + 12 * scale, y: cy + 6 * scale },
          { x: cx - 12 * scale, y: cy + 2 * scale },
          { x: cx + 14 * scale, y: cy + 4 * scale },
        ];
        for (const ivy of ivyPositions) {
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(
              ivy.x + (i % 2) * 2 * scale,
              ivy.y - i * 2 * scale,
              1.5 * scale,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Glowing dollar sign emblem
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 8 * scale;
        ctx.font = `bold ${10 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, cy - 22 * scale);
        ctx.shadowBlur = 0;

        // Chimney with smoke
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(cx + 10 * scale, cy - 20 * scale, 4 * scale, 8 * scale);
        if (animated) {
          ctx.fillStyle = `rgba(150, 150, 150, ${0.4 + Math.sin(t * 2) * 0.2})`;
          for (let i = 0; i < 2; i++) {
            const smokeY = cy - 22 * scale - ((t * 3 + i * 5) % 8);
            ctx.beginPath();
            ctx.arc(
              cx + 12 * scale + Math.sin(t + i) * 2 * scale,
              smokeY,
              (2 + i) * scale,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Level indicator
        if (level > 1) {
          ctx.fillStyle = "#ffd700";
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 20 * scale, 3 * scale);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "station": {
        // =====================================================================
        // DINKY STATION - Victorian Railway Station with Clock Tower
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 16 * scale,
          22 * scale,
          11 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Railway platform base
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.moveTo(cx - 24 * scale, cy + 16 * scale);
        ctx.lineTo(cx - 22 * scale, cy + 12 * scale);
        ctx.lineTo(cx + 22 * scale, cy + 12 * scale);
        ctx.lineTo(cx + 24 * scale, cy + 16 * scale);
        ctx.closePath();
        ctx.fill();

        // Platform edge markings (yellow safety stripe)
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.moveTo(cx - 22 * scale, cy + 12 * scale);
        ctx.lineTo(cx - 20 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 20 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 22 * scale, cy + 12 * scale);
        ctx.closePath();
        ctx.fill();

        // Train tracks
        ctx.strokeStyle = "#3a3a3a";
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 26 * scale, cy + 14 * scale);
        ctx.lineTo(cx + 26 * scale, cy + 14 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 26 * scale, cy + 18 * scale);
        ctx.lineTo(cx + 26 * scale, cy + 18 * scale);
        ctx.stroke();

        // Track ties
        ctx.fillStyle = "#5a4030";
        for (let i = -5; i <= 5; i++) {
          ctx.fillRect(
            cx + i * 4.5 * scale - 1 * scale,
            cy + 13 * scale,
            2 * scale,
            6 * scale
          );
        }

        // Main station building - left face (shadowed)
        const leftStationGrad = ctx.createLinearGradient(
          cx - 18 * scale,
          cy,
          cx,
          cy
        );
        leftStationGrad.addColorStop(0, "#6b1a1a");
        leftStationGrad.addColorStop(1, "#8b2a2a");
        ctx.fillStyle = leftStationGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 18 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 16 * scale, cy - 4 * scale);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        const rightStationGrad = ctx.createLinearGradient(
          cx,
          cy,
          cx + 18 * scale,
          cy
        );
        rightStationGrad.addColorStop(0, "#8b2a2a");
        rightStationGrad.addColorStop(1, "#9b3a3a");
        ctx.fillStyle = rightStationGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 18 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 16 * scale, cy - 4 * scale);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Brick pattern
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * scale;
        for (let row = 0; row < 5; row++) {
          const brickY = cy + 8 * scale - row * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 16 * scale + row * scale, brickY);
          ctx.lineTo(cx - 2 * scale, brickY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 2 * scale, brickY);
          ctx.lineTo(cx + 16 * scale - row * scale, brickY);
          ctx.stroke();
        }

        // Main roof with overhang
        ctx.fillStyle = "#5a0000";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy - 4 * scale);
        ctx.lineTo(cx - 18 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 18 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 20 * scale, cy - 4 * scale);
        ctx.closePath();
        ctx.fill();

        // Roof edge highlight
        ctx.strokeStyle = "#7a2020";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy - 4 * scale);
        ctx.lineTo(cx + 20 * scale, cy - 4 * scale);
        ctx.stroke();

        // Clock tower
        ctx.fillStyle = "#7b1a1a";
        ctx.fillRect(cx - 6 * scale, cy - 32 * scale, 12 * scale, 22 * scale);

        // Clock tower brick detail
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 0.5 * scale;
        for (let row = 0; row < 7; row++) {
          ctx.beginPath();
          ctx.moveTo(cx - 5 * scale, cy - 12 * scale - row * 3 * scale);
          ctx.lineTo(cx + 5 * scale, cy - 12 * scale - row * 3 * scale);
          ctx.stroke();
        }

        // Clock tower roof
        ctx.fillStyle = "#4a0000";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 32 * scale);
        ctx.lineTo(cx, cy - 40 * scale);
        ctx.lineTo(cx + 8 * scale, cy - 32 * scale);
        ctx.closePath();
        ctx.fill();

        // Clock tower spire
        ctx.fillStyle = "#3a0000";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 40 * scale);
        ctx.lineTo(cx, cy - 46 * scale);
        ctx.lineTo(cx + 2 * scale, cy - 40 * scale);
        ctx.closePath();
        ctx.fill();

        // Clock face
        ctx.fillStyle = "#f5f5f0";
        ctx.beginPath();
        ctx.arc(cx, cy - 24 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Clock numbers
        ctx.fillStyle = "#1a1a1a";
        ctx.font = `${2 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("12", cx, cy - 27.5 * scale);
        ctx.fillText("3", cx + 3.5 * scale, cy - 24 * scale);
        ctx.fillText("6", cx, cy - 20.5 * scale);
        ctx.fillText("9", cx - 3.5 * scale, cy - 24 * scale);

        // Clock hands (animated)
        const hourAngle = animated ? t * 0.1 : Math.PI / 4;
        const minuteAngle = animated ? t * 1.2 : Math.PI / 2;
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24 * scale);
        ctx.lineTo(
          cx + Math.cos(hourAngle - Math.PI / 2) * 2.5 * scale,
          cy - 24 * scale + Math.sin(hourAngle - Math.PI / 2) * 2.5 * scale
        );
        ctx.stroke();
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24 * scale);
        ctx.lineTo(
          cx + Math.cos(minuteAngle - Math.PI / 2) * 3.5 * scale,
          cy - 24 * scale + Math.sin(minuteAngle - Math.PI / 2) * 3.5 * scale
        );
        ctx.stroke();

        // Clock center dot
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(cx, cy - 24 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Station windows with warm glow
        const windowGlow = animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7;
        ctx.fillStyle = "#1a0a0a";
        ctx.fillRect(cx - 14 * scale, cy + 1 * scale, 6 * scale, 6 * scale);
        ctx.fillRect(cx + 8 * scale, cy + 1 * scale, 6 * scale, 6 * scale);
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
        ctx.shadowColor = "#ffcc66";
        ctx.shadowBlur = 6 * scale;
        ctx.fillRect(cx - 13 * scale, cy + 2 * scale, 4 * scale, 4 * scale);
        ctx.fillRect(cx + 9 * scale, cy + 2 * scale, 4 * scale, 4 * scale);
        ctx.shadowBlur = 0;

        // Window mullions
        ctx.strokeStyle = "#2a1a0a";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy + 2 * scale);
        ctx.lineTo(cx - 11 * scale, cy + 6 * scale);
        ctx.moveTo(cx - 13 * scale, cy + 4 * scale);
        ctx.lineTo(cx - 9 * scale, cy + 4 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 11 * scale, cy + 2 * scale);
        ctx.lineTo(cx + 11 * scale, cy + 6 * scale);
        ctx.moveTo(cx + 9 * scale, cy + 4 * scale);
        ctx.lineTo(cx + 13 * scale, cy + 4 * scale);
        ctx.stroke();

        // Small upper windows
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx - 10 * scale, cy - 6 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 10 * scale, cy - 6 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Station door
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(cx - 4 * scale, cy + 2 * scale, 8 * scale, 8 * scale);

        // Door panels
        ctx.strokeStyle = "#1a0a00";
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(cx - 3 * scale, cy + 3 * scale, 2.5 * scale, 3 * scale);
        ctx.strokeRect(
          cx + 0.5 * scale,
          cy + 3 * scale,
          2.5 * scale,
          3 * scale
        );

        // Door window
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx, cy + 4 * scale, 1.5 * scale, Math.PI, 0);
        ctx.fill();

        // Door handles
        ctx.fillStyle = "#c9a227";
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale, cy + 7 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy + 7 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Platform awning supports
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(cx - 20 * scale, cy - 2 * scale, 2 * scale, 12 * scale);
        ctx.fillRect(cx + 18 * scale, cy - 2 * scale, 2 * scale, 12 * scale);

        // Decorative ironwork on supports
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 19 * scale, cy + 2 * scale);
        ctx.quadraticCurveTo(
          cx - 16 * scale,
          cy + 4 * scale,
          cx - 16 * scale,
          cy + 8 * scale
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 19 * scale, cy + 2 * scale);
        ctx.quadraticCurveTo(
          cx + 16 * scale,
          cy + 4 * scale,
          cx + 16 * scale,
          cy + 8 * scale
        );
        ctx.stroke();

        // Princeton flag on tower
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(cx + 6 * scale, cy - 38 * scale, 1 * scale, 12 * scale);
        ctx.fillStyle = "#ff6600";
        const flagWave = animated ? Math.sin(t * 4) * 0.15 : 0;
        ctx.beginPath();
        ctx.moveTo(cx + 7 * scale, cy - 38 * scale);
        ctx.quadraticCurveTo(
          cx + 12 * scale,
          cy - 36 * scale + flagWave * 10,
          cx + 15 * scale,
          cy - 34 * scale
        );
        ctx.quadraticCurveTo(
          cx + 12 * scale,
          cy - 32 * scale - flagWave * 10,
          cx + 7 * scale,
          cy - 30 * scale
        );
        ctx.closePath();
        ctx.fill();

        // Station sign
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx - 12 * scale, cy - 3 * scale, 24 * scale, 4 * scale);
        ctx.fillStyle = "#c9a227";
        ctx.font = `bold ${3 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DINKY", cx, cy - 1 * scale);

        // Lanterns on pillars
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(cx - 21 * scale, cy - 6 * scale, 4 * scale, 4 * scale);
        ctx.fillRect(cx + 17 * scale, cy - 6 * scale, 4 * scale, 4 * scale);
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
        ctx.shadowColor = "#ffcc66";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx - 19 * scale, cy - 4 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 19 * scale, cy - 4 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Steam/smoke from waiting train
        if (animated) {
          ctx.fillStyle = `rgba(200, 200, 200, ${0.4 - (t % 2) * 0.2})`;
          for (let i = 0; i < 3; i++) {
            const steamX = cx - 20 * scale + ((t * 3 + i * 5) % 10);
            const steamY = cy + 8 * scale - ((t * 4 + i * 3) % 12);
            ctx.beginPath();
            ctx.arc(steamX, steamY, (2 + i) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Level indicator
        if (level > 1) {
          ctx.fillStyle = "#ff6600";
          ctx.shadowColor = "#ff6600";
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 22 * scale, 3 * scale);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
    }
  }, [type, size, level, time, animated]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// =============================================================================
// HERO SPRITES - Matching rendering.ts detailed style
// =============================================================================
export const HERO_COLORS: Record<string, string> = {
  tiger: "#ff6b00",
  mathey: "#7c3aed",
  rocky: "#78716c",
  tenor: "#ec4899",
  scott: "#14b8a6",
  captain: "#dc2626",
  engineer: "#f59e0b",
};
export const HeroSprite: React.FC<{
  type: HeroType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 48, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => setTime((t) => t + 1), 50);
    return () => clearInterval(interval);
  }, [animated]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 50;
    const color = HERO_COLORS[type] || "#ff8c00";
    const t = time * 0.08;
    const bounce = animated ? Math.sin(t) * 2 : 0;
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18 * scale, 14 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    switch (type) {
      case "tiger": {
        // PRINCETON TIGER CHAMPION - Fierce warrior with blazing aura
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;

        // Orange power aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          22 * scale
        );
        auraGrad.addColorStop(0, `rgba(255, 107, 0, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.6, `rgba(234, 88, 12, ${auraPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tiger body (muscular orange)
        const bodyGrad = ctx.createRadialGradient(
          cx,
          cy + bounce,
          0,
          cx,
          cy + bounce,
          18 * scale
        );
        bodyGrad.addColorStop(0, "#ff9933");
        bodyGrad.addColorStop(0.6, "#ff6b00");
        bodyGrad.addColorStop(1, "#cc4400");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 2 * scale + bounce,
          14 * scale,
          17 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Tiger stripes on body
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2.5 * scale;
        for (let i = 0; i < 3; i++) {
          const stripeY = cy - 4 * scale + i * 6 * scale + bounce;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, stripeY);
          ctx.quadraticCurveTo(
            cx - 4 * scale,
            stripeY - 3 * scale,
            cx,
            stripeY
          );
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx + 10 * scale, stripeY);
          ctx.quadraticCurveTo(
            cx + 4 * scale,
            stripeY - 3 * scale,
            cx,
            stripeY
          );
          ctx.stroke();
        }

        // === POWERFUL MUSCULAR ARMS ===
        const armSwing = animated ? Math.sin(t * 3) * 0.15 : 0;

        // Left arm - muscular upper arm
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.4 + armSwing);

        // Upper arm with gradient
        const leftArmGrad = ctx.createLinearGradient(-6 * scale, -8 * scale, 6 * scale, 8 * scale);
        leftArmGrad.addColorStop(0, "#ff9933");
        leftArmGrad.addColorStop(0.4, "#ff7722");
        leftArmGrad.addColorStop(1, "#cc4400");
        ctx.fillStyle = leftArmGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 6 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arm stripes
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(-4 * scale, 0);
        ctx.quadraticCurveTo(0, -2 * scale, 3 * scale, 1 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4 * scale, 5 * scale);
        ctx.quadraticCurveTo(0, 3 * scale, 3 * scale, 6 * scale);
        ctx.stroke();

        // Forearm/paw
        ctx.fillStyle = "#ff8822";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 5 * scale, 6 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Deadly claws
        ctx.fillStyle = "#e8e0d0";
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 0.5 * scale;
        for (let c = 0; c < 4; c++) {
          const clawAngle = -0.4 + c * 0.25;
          const clawX = Math.cos(clawAngle) * 5 * scale;
          const clawY = 16 * scale + Math.sin(clawAngle) * 2 * scale;
          ctx.beginPath();
          ctx.moveTo(clawX - 1.5 * scale, clawY);
          ctx.lineTo(clawX, clawY + 5 * scale);
          ctx.lineTo(clawX + 1.5 * scale, clawY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        // Right arm - muscular upper arm
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.4 - armSwing);

        // Upper arm with gradient
        const rightArmGrad = ctx.createLinearGradient(-6 * scale, -8 * scale, 6 * scale, 8 * scale);
        rightArmGrad.addColorStop(0, "#cc4400");
        rightArmGrad.addColorStop(0.6, "#ff7722");
        rightArmGrad.addColorStop(1, "#ff9933");
        ctx.fillStyle = rightArmGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 6 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arm stripes
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(4 * scale, 0);
        ctx.quadraticCurveTo(0, -2 * scale, -3 * scale, 1 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4 * scale, 5 * scale);
        ctx.quadraticCurveTo(0, 3 * scale, -3 * scale, 6 * scale);
        ctx.stroke();

        // Forearm/paw
        ctx.fillStyle = "#ff8822";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 5 * scale, 6 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Deadly claws
        ctx.fillStyle = "#e8e0d0";
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 0.5 * scale;
        for (let c = 0; c < 4; c++) {
          const clawAngle = 0.4 - c * 0.25;
          const clawX = Math.cos(clawAngle) * 5 * scale;
          const clawY = 16 * scale + Math.sin(clawAngle) * 2 * scale;
          ctx.beginPath();
          ctx.moveTo(clawX - 1.5 * scale, clawY);
          ctx.lineTo(clawX, clawY + 5 * scale);
          ctx.lineTo(clawX + 1.5 * scale, clawY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        // Tiger head
        ctx.fillStyle = "#ff8c00";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale + bounce,
          11 * scale,
          9 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy - 20 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 20 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Inner ears
        ctx.fillStyle = "#ffccaa";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 19 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 20 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 7 * scale, cy - 19 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 20 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Head stripes
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 20 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy - 14 * scale + bounce);
        ctx.moveTo(cx + 5 * scale, cy - 20 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy - 14 * scale + bounce);
        ctx.moveTo(cx, cy - 22 * scale + bounce);
        ctx.lineTo(cx, cy - 16 * scale + bounce);
        ctx.stroke();
        // Muzzle
        ctx.fillStyle = "#fff8e7";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 9 * scale + bounce,
          5 * scale,
          4 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1 * scale;
        for (let side of [-1, 1]) {
          for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            ctx.moveTo(
              cx + side * 4 * scale,
              cy - 9 * scale + w * 1.5 * scale + bounce
            );
            ctx.lineTo(
              cx + side * 10 * scale,
              cy - 10 * scale + w * 2 * scale + bounce
            );
            ctx.stroke();
          }
        }
        // Nose
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 11 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy - 9 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 9 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Fierce eyes (glowing)
        ctx.shadowColor = "#ffcc00";
        ctx.shadowBlur = 8 * scale;
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.ellipse(
          cx - 4 * scale,
          cy - 14 * scale + bounce,
          3 * scale,
          2.5 * scale,
          -0.15,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 4 * scale,
          cy - 14 * scale + bounce,
          3 * scale,
          2.5 * scale,
          0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        // Pupils
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(
          cx - 4 * scale,
          cy - 14 * scale + bounce,
          1 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 4 * scale,
          cy - 14 * scale + bounce,
          1 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Mouth with fangs
        ctx.fillStyle = "#8b0000";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 7 * scale + bounce,
          3 * scale,
          2 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 7 * scale + bounce);
        ctx.lineTo(cx - 1.5 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 1 * scale, cy - 7 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale, cy - 7 * scale + bounce);
        ctx.lineTo(cx + 1.5 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 1 * scale, cy - 7 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "mathey": {
        // MATHEY KNIGHT - Noble warrior with purple arcane aura
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;

        // Purple arcane aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          22 * scale
        );
        auraGrad.addColorStop(0, `rgba(124, 58, 237, ${auraPulse * 0.2})`);
        auraGrad.addColorStop(0.6, `rgba(99, 102, 241, ${auraPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Knight armor body with purple tint
        const armorGrad = ctx.createLinearGradient(
          cx - 14 * scale,
          cy,
          cx + 14 * scale,
          cy
        );
        armorGrad.addColorStop(0, "#5a5a7a");
        armorGrad.addColorStop(0.3, "#8a8aaa");
        armorGrad.addColorStop(0.5, "#babaca");
        armorGrad.addColorStop(0.7, "#8a8aaa");
        armorGrad.addColorStop(1, "#5a5a7a");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#4a4a6a";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Armor segments with purple highlights
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + bounce);
        ctx.lineTo(cx + 10 * scale, cy + bounce);
        ctx.moveTo(cx - 9 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 9 * scale, cy + 6 * scale + bounce);
        ctx.stroke();

        // === ARMORED KNIGHT ARMS ===
        const armSwing = animated ? Math.sin(t * 2.5) * 0.1 : 0;

        // Left arm (behind shield) - armored pauldron and gauntlet
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.5 + armSwing);

        // Pauldron (shoulder armor)
        const leftPauldronGrad = ctx.createLinearGradient(-5 * scale, -5 * scale, 5 * scale, 5 * scale);
        leftPauldronGrad.addColorStop(0, "#9a9aba");
        leftPauldronGrad.addColorStop(0.5, "#7a7a9a");
        leftPauldronGrad.addColorStop(1, "#5a5a7a");
        ctx.fillStyle = leftPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 6 * scale, 5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a6a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Upper arm armor
        ctx.fillStyle = "#6a6a8a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a6a";
        ctx.stroke();

        // Gauntlet (armored glove)
        ctx.fillStyle = "#7a7a9a";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 14 * scale, 4 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5a5a7a";
        ctx.stroke();

        // Purple trim on gauntlet
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(-1 * scale, 12 * scale, 3 * scale, 0, Math.PI);
        ctx.stroke();
        ctx.restore();

        // Right arm - sword arm with armored gauntlet
        ctx.save();
        ctx.translate(cx + 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.5 - armSwing);

        // Pauldron
        const rightPauldronGrad = ctx.createLinearGradient(-5 * scale, -5 * scale, 5 * scale, 5 * scale);
        rightPauldronGrad.addColorStop(0, "#5a5a7a");
        rightPauldronGrad.addColorStop(0.5, "#7a7a9a");
        rightPauldronGrad.addColorStop(1, "#9a9aba");
        ctx.fillStyle = rightPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 6 * scale, 5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a6a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Upper arm armor
        ctx.fillStyle = "#6a6a8a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a6a";
        ctx.stroke();

        // Gauntlet with sword grip
        ctx.fillStyle = "#7a7a9a";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 14 * scale, 4 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5a5a7a";
        ctx.stroke();

        // Purple trim
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(1 * scale, 12 * scale, 3 * scale, 0, Math.PI);
        ctx.stroke();

        // Enchanted sword in right hand
        ctx.fillStyle = "#a0a0b0";
        ctx.shadowColor = "#7c3aed";
        ctx.shadowBlur = 4 * scale;
        ctx.fillRect(-1 * scale, 16 * scale, 2 * scale, 14 * scale);
        ctx.shadowBlur = 0;
        // Sword hilt
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(-3 * scale, 14 * scale, 6 * scale, 3 * scale);
        // Blade tip
        ctx.beginPath();
        ctx.moveTo(-1 * scale, 30 * scale);
        ctx.lineTo(0, 34 * scale);
        ctx.lineTo(1 * scale, 30 * scale);
        ctx.closePath();
        ctx.fillStyle = "#c0c0d0";
        ctx.fill();
        ctx.restore();

        // Glowing Princeton crest
        ctx.fillStyle = "#ff6600";
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx, cy + 8 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy + 2 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ornate helmet
        ctx.fillStyle = "#6a6a8a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 18 * scale + bounce,
          10 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Helmet ridge
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Visor with glowing eyes behind
        ctx.fillStyle = "#1a1a2a";
        ctx.fillRect(
          cx - 7 * scale,
          cy - 20 * scale + bounce,
          14 * scale,
          3 * scale
        );
        ctx.fillStyle = "#a855f7";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 18.5 * scale + bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 18.5 * scale + bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Magnificent plume
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 30 * scale + bounce + Math.sin(t * 2) * scale,
          3 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 32 * scale + bounce + Math.sin(t * 2) * scale,
          2 * scale,
          5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Enchanted shield
        ctx.fillStyle = "#4338ca";
        ctx.beginPath();
        ctx.moveTo(cx - 18 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx - 18 * scale, cy + 8 * scale + bounce);
        ctx.lineTo(cx - 13 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 13 * scale, cy - 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
        // Shield gem
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 15.5 * scale,
          cy + 4 * scale + bounce,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "rocky": {
        // Rock golem body
        const rockGrad = ctx.createRadialGradient(
          cx,
          cy + bounce,
          0,
          cx,
          cy + bounce,
          18 * scale
        );
        rockGrad.addColorStop(0, "#7a7a7a");
        rockGrad.addColorStop(0.5, "#5a5a5a");
        rockGrad.addColorStop(1, "#3a3a3a");
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 2 * scale + bounce,
          14 * scale,
          16 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Rock cracks
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale + i * 5 * scale, cy - 5 * scale + bounce);
          ctx.lineTo(cx - 8 * scale + i * 5 * scale, cy + 10 * scale + bounce);
          ctx.stroke();
        }

        // === MASSIVE STONE ARMS ===
        const armSwing = animated ? Math.sin(t * 1.5) * 0.08 : 0;

        // Left boulder arm
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.35 + armSwing);

        // Upper arm boulder
        const leftArmGrad = ctx.createRadialGradient(0, 5 * scale, 0, 0, 5 * scale, 10 * scale);
        leftArmGrad.addColorStop(0, "#7a7a7a");
        leftArmGrad.addColorStop(0.5, "#5a5a5a");
        leftArmGrad.addColorStop(1, "#3a3a3a");
        ctx.fillStyle = leftArmGrad;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, -2 * scale);
        ctx.lineTo(-7 * scale, 6 * scale);
        ctx.lineTo(-5 * scale, 12 * scale);
        ctx.lineTo(5 * scale, 14 * scale);
        ctx.lineTo(7 * scale, 4 * scale);
        ctx.lineTo(5 * scale, -3 * scale);
        ctx.closePath();
        ctx.fill();

        // Rock cracks on arm
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-4 * scale, 0);
        ctx.lineTo(-2 * scale, 8 * scale);
        ctx.moveTo(2 * scale, 2 * scale);
        ctx.lineTo(0, 10 * scale);
        ctx.stroke();

        // Glowing crack
        if (animated) {
          ctx.strokeStyle = `rgba(255, 100, 0, ${0.4 + Math.sin(t * 3) * 0.3})`;
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(-3 * scale, 4 * scale);
          ctx.lineTo(0, 12 * scale);
          ctx.stroke();
        }

        // Stone fist
        ctx.fillStyle = "#5a5a5a";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 6 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        ctx.restore();

        // Right boulder arm
        ctx.save();
        ctx.translate(cx + 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.35 - armSwing);

        // Upper arm boulder
        const rightArmGrad = ctx.createRadialGradient(0, 5 * scale, 0, 0, 5 * scale, 10 * scale);
        rightArmGrad.addColorStop(0, "#7a7a7a");
        rightArmGrad.addColorStop(0.5, "#5a5a5a");
        rightArmGrad.addColorStop(1, "#3a3a3a");
        ctx.fillStyle = rightArmGrad;
        ctx.beginPath();
        ctx.moveTo(6 * scale, -2 * scale);
        ctx.lineTo(7 * scale, 6 * scale);
        ctx.lineTo(5 * scale, 12 * scale);
        ctx.lineTo(-5 * scale, 14 * scale);
        ctx.lineTo(-7 * scale, 4 * scale);
        ctx.lineTo(-5 * scale, -3 * scale);
        ctx.closePath();
        ctx.fill();

        // Rock cracks on arm
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(4 * scale, 0);
        ctx.lineTo(2 * scale, 8 * scale);
        ctx.moveTo(-2 * scale, 2 * scale);
        ctx.lineTo(0, 10 * scale);
        ctx.stroke();

        // Glowing crack
        if (animated) {
          ctx.strokeStyle = `rgba(255, 100, 0, ${0.4 + Math.sin(t * 3 + 1) * 0.3})`;
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(3 * scale, 4 * scale);
          ctx.lineTo(0, 12 * scale);
          ctx.stroke();
        }

        // Stone fist
        ctx.fillStyle = "#5a5a5a";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 6 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        ctx.restore();

        // Rocky head
        ctx.fillStyle = "#6a6a6a";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 20 * scale + bounce);
        ctx.lineTo(cx, cy - 24 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 20 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Glowing eyes
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 8 * scale;
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.arc(
          cx - 4 * scale,
          cy - 14 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4 * scale,
          cy - 14 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        // Glowing cracks
        if (animated) {
          ctx.strokeStyle = `rgba(255, 100, 0, ${0.5 + Math.sin(t * 3) * 0.3})`;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 6 * scale, cy - 2 * scale + bounce);
          ctx.lineTo(cx - 2 * scale, cy + 8 * scale + bounce);
          ctx.moveTo(cx + 6 * scale, cy + bounce);
          ctx.lineTo(cx + 3 * scale, cy + 6 * scale + bounce);
          ctx.stroke();
        }
        break;
      }
      case "tenor": {
        // TENOR SINGER - Elegant performer with pink musical aura
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const notePulse = Math.sin(t * 3) * 0.2;

        // Pink musical aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          22 * scale
        );
        auraGrad.addColorStop(0, `rgba(236, 72, 153, ${auraPulse * 0.2})`);
        auraGrad.addColorStop(0.6, `rgba(219, 39, 119, ${auraPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Elegant tuxedo body
        const tuxGrad = ctx.createLinearGradient(
          cx - 12 * scale,
          cy,
          cx + 12 * scale,
          cy
        );
        tuxGrad.addColorStop(0, "#1a1a1a");
        tuxGrad.addColorStop(0.3, "#2a2a2a");
        tuxGrad.addColorStop(0.7, "#2a2a2a");
        tuxGrad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = tuxGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // White shirt front with pink tint
        ctx.fillStyle = "#fff5f7";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 10 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // === ELEGANT TUXEDO ARMS ===
        const armGesture = animated ? Math.sin(t * 2) * 0.15 : 0;

        // Left arm - elegant sleeve with expressive gesture
        ctx.save();
        ctx.translate(cx - 13 * scale, cy - 4 * scale + bounce);
        ctx.rotate(-0.6 + armGesture);

        // Tuxedo sleeve
        const leftSleeveGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
        leftSleeveGrad.addColorStop(0, "#1a1a1a");
        leftSleeveGrad.addColorStop(0.5, "#2a2a2a");
        leftSleeveGrad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = leftSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 5 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // White cuff
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pink cufflink
        ctx.fillStyle = "#ec4899";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        ctx.arc(-2 * scale, 12 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Elegant hand
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 3.5 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Graceful fingers
        for (let f = 0; f < 4; f++) {
          const fingerAngle = -0.4 + f * 0.25;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(fingerAngle) * 3 * scale,
            18 * scale + Math.sin(fingerAngle) * scale,
            1 * scale,
            2.5 * scale,
            fingerAngle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // Right arm - dramatic singing gesture
        ctx.save();
        ctx.translate(cx + 13 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.7 - armGesture * 1.5);

        // Tuxedo sleeve
        const rightSleeveGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
        rightSleeveGrad.addColorStop(0, "#1a1a1a");
        rightSleeveGrad.addColorStop(0.5, "#2a2a2a");
        rightSleeveGrad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = rightSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 5 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // White cuff
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pink cufflink
        ctx.fillStyle = "#ec4899";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        ctx.arc(2 * scale, 12 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Elegant hand (more open for dramatic gesture)
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 3.5 * scale, 4 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Graceful spread fingers
        for (let f = 0; f < 5; f++) {
          const fingerAngle = 0.5 - f * 0.25;
          const fingerLength = f === 2 ? 3 * scale : 2.5 * scale;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(fingerAngle) * 3.5 * scale,
            17 * scale + Math.sin(fingerAngle) * scale,
            1 * scale,
            fingerLength,
            fingerAngle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // Pink bow tie (matching theme)
        ctx.fillStyle = "#ec4899";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 10.5 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 5.5 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10.5 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 5.5 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale + bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Refined head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 16 * scale + bounce, 9 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Stylish slicked back hair
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 22 * scale + bounce,
          8 * scale,
          4 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 20 * scale + bounce);
        ctx.quadraticCurveTo(
          cx - 9 * scale,
          cy - 26 * scale + bounce,
          cx,
          cy - 28 * scale + bounce
        );
        ctx.quadraticCurveTo(
          cx + 9 * scale,
          cy - 26 * scale + bounce,
          cx + 7 * scale,
          cy - 20 * scale + bounce
        );
        ctx.fill();

        // Closed singing eyes with expression
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 17 * scale + bounce,
          2 * scale,
          0.2 * Math.PI,
          0.8 * Math.PI
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 17 * scale + bounce,
          2 * scale,
          0.2 * Math.PI,
          0.8 * Math.PI
        );
        ctx.stroke();

        // Singing mouth with vibrato effect
        ctx.fillStyle = "#4a2020";
        const mouthSize = animated ? 3 + Math.sin(t * 4) * 0.8 : 3;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale + bounce,
          3 * scale,
          mouthSize * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Floating musical notes with pink glow
        if (animated) {
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 4 * scale;
          ctx.fillStyle = `rgba(236, 72, 153, ${0.7 + notePulse})`;
          ctx.font = `${10 * scale}px Arial`;
          for (let i = 0; i < 3; i++) {
            const notePhase = (t * 0.5 + i * 0.4) % 1.5;
            const noteX =
              cx + 14 * scale + Math.sin(notePhase * Math.PI) * 6 * scale;
            const noteY = cy - 10 * scale - notePhase * 14 * scale + bounce;
            ctx.globalAlpha = Math.max(0, 1 - notePhase / 1.5);
            ctx.fillText(["♪", "♫", "♩"][i % 3], noteX, noteY);
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "scott": {
        // Vintage suit body
        ctx.fillStyle = "#14b8a6";
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 13 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 13 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 11 * scale, cy + 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Vest
        ctx.fillStyle = "#0d9488";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy + 12 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy + 12 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // === VINTAGE SUIT ARMS ===
        const writingMotion = animated ? Math.sin(t * 2.5) * 0.1 : 0;

        // Left arm - holding book
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.4);

        // Teal sleeve
        const leftSleeveGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
        leftSleeveGrad.addColorStop(0, "#0d9488");
        leftSleeveGrad.addColorStop(0.5, "#14b8a6");
        leftSleeveGrad.addColorStop(1, "#0d9488");
        ctx.fillStyle = leftSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 5 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // White cuff
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 3.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hand
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 15 * scale, 3 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right arm - writing with quill
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.5 + writingMotion);

        // Teal sleeve
        const rightSleeveGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
        rightSleeveGrad.addColorStop(0, "#0d9488");
        rightSleeveGrad.addColorStop(0.5, "#14b8a6");
        rightSleeveGrad.addColorStop(1, "#0d9488");
        ctx.fillStyle = rightSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 5 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // White cuff
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 3.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hand holding quill
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 15 * scale, 3 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Fingers gripping quill
        ctx.beginPath();
        ctx.ellipse(1 * scale, 18 * scale, 1.5 * scale, 2 * scale, 0.3, 0, Math.PI * 2);
        ctx.ellipse(-1 * scale, 18 * scale, 1.5 * scale, 2 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 15 * scale + bounce, 9 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Parted hair
        ctx.fillStyle = "#4a3020";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 21 * scale + bounce,
          8 * scale,
          4 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(
          cx - 6 * scale,
          cy - 26 * scale,
          cx - 9 * scale,
          cy - 20 * scale + bounce
        );
        ctx.quadraticCurveTo(
          cx - 8 * scale,
          cy - 16 * scale,
          cx - 5 * scale,
          cy - 18 * scale + bounce
        );
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(
          cx + 6 * scale,
          cy - 26 * scale,
          cx + 9 * scale,
          cy - 20 * scale + bounce
        );
        ctx.quadraticCurveTo(
          cx + 8 * scale,
          cy - 16 * scale,
          cx + 5 * scale,
          cy - 18 * scale + bounce
        );
        ctx.closePath();
        ctx.fill();
        // Glasses
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 4 * scale,
          cy - 16 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4 * scale,
          cy - 16 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx - 1 * scale, cy - 16 * scale + bounce);
        ctx.lineTo(cx + 1 * scale, cy - 16 * scale + bounce);
        ctx.stroke();
        // Eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 4 * scale,
          cy - 16 * scale + bounce,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4 * scale,
          cy - 16 * scale + bounce,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Quill pen
        ctx.fillStyle = "#14b8a6";
        ctx.save();
        ctx.translate(cx + 14 * scale, cy - 6 * scale + bounce);
        ctx.rotate(0.5);
        ctx.fillRect(-1.5 * scale, -12 * scale, 3 * scale, 16 * scale);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(0, -12 * scale);
        ctx.lineTo(-3 * scale, -18 * scale);
        ctx.lineTo(3 * scale, -18 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Book
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(
          cx - 16 * scale,
          cy + 4 * scale + bounce,
          8 * scale,
          10 * scale
        );
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
          cx - 15 * scale,
          cy + 5 * scale + bounce,
          6 * scale,
          1 * scale
        );
        break;
      }
      case "captain": {
        // Captain - Military leader with cape and sword
        // Flowing cape
        const capeWave = animated ? Math.sin(t * 2) * 3 : 0;
        ctx.fillStyle = "#b91c1c";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 8 * scale + bounce);
        ctx.quadraticCurveTo(
          cx - 18 * scale + capeWave,
          cy + bounce,
          cx - 16 * scale + capeWave,
          cy + 16 * scale + bounce
        );
        ctx.lineTo(cx - 8 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 10 * scale, cy - 8 * scale + bounce);
        ctx.quadraticCurveTo(
          cx + 18 * scale - capeWave,
          cy + bounce,
          cx + 16 * scale - capeWave,
          cy + 16 * scale + bounce
        );
        ctx.lineTo(cx + 8 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Military coat body
        const coatGrad = ctx.createLinearGradient(
          cx - 10 * scale,
          cy,
          cx + 10 * scale,
          cy
        );
        coatGrad.addColorStop(0, "#1e3a5f");
        coatGrad.addColorStop(0.5, "#2d4a6f");
        coatGrad.addColorStop(1, "#1e3a5f");
        ctx.fillStyle = coatGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy + 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Gold buttons
        ctx.fillStyle = "#ffd700";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy - 2 * scale + i * 5 * scale + bounce,
            1.5 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        // Epaulettes (shoulder decorations)
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.ellipse(
          cx - 11 * scale,
          cy - 6 * scale + bounce,
          4 * scale,
          2 * scale,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 11 * scale,
          cy - 6 * scale + bounce,
          4 * scale,
          2 * scale,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Tassels
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 13 * scale + i * 2 * scale, cy - 5 * scale + bounce);
          ctx.lineTo(cx - 14 * scale + i * 2 * scale, cy - 1 * scale + bounce);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 9 * scale + i * 2 * scale, cy - 5 * scale + bounce);
          ctx.lineTo(cx + 10 * scale + i * 2 * scale, cy - 1 * scale + bounce);
          ctx.stroke();
        }

        // === MILITARY UNIFORM ARMS ===
        const saluteMotion = animated ? Math.sin(t * 1.8) * 0.08 : 0;

        // Left arm - at attention
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - 4 * scale + bounce);
        ctx.rotate(-0.2 + saluteMotion);

        // Military sleeve
        const leftSleeveGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
        leftSleeveGrad.addColorStop(0, "#1e3a5f");
        leftSleeveGrad.addColorStop(0.5, "#2d4a6f");
        leftSleeveGrad.addColorStop(1, "#1e3a5f");
        ctx.fillStyle = leftSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gold trim on sleeve
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // White glove
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 3.5 * scale, 4.5 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Glove details
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 14 * scale);
        ctx.lineTo(-2 * scale, 18 * scale);
        ctx.moveTo(0, 14 * scale);
        ctx.lineTo(0, 19 * scale);
        ctx.moveTo(2 * scale, 14 * scale);
        ctx.lineTo(2 * scale, 18 * scale);
        ctx.stroke();
        ctx.restore();

        // Right arm - holding sword
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.3 - saluteMotion);

        // Military sleeve
        const rightSleeveGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
        rightSleeveGrad.addColorStop(0, "#1e3a5f");
        rightSleeveGrad.addColorStop(0.5, "#2d4a6f");
        rightSleeveGrad.addColorStop(1, "#1e3a5f");
        ctx.fillStyle = rightSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gold trim on sleeve
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // White glove gripping sword
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 3.5 * scale, 4.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Glove details
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 14 * scale);
        ctx.lineTo(-2 * scale, 18 * scale);
        ctx.moveTo(0, 14 * scale);
        ctx.lineTo(0, 19 * scale);
        ctx.moveTo(2 * scale, 14 * scale);
        ctx.lineTo(2 * scale, 18 * scale);
        ctx.stroke();
        ctx.restore();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 15 * scale + bounce, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Military cap
        ctx.fillStyle = "#1e3a5f";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 20 * scale + bounce,
          9 * scale,
          4 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        ctx.fillRect(
          cx - 8 * scale,
          cy - 24 * scale + bounce,
          16 * scale,
          5 * scale
        );
        // Cap brim
        ctx.fillStyle = "#0f1f3a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 19 * scale + bounce,
          10 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Cap badge
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx, cy - 22 * scale + bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Star on badge
        ctx.fillStyle = "#1e3a5f";
        drawStar(ctx, cx, cy - 22 * scale + bounce, 1.5 * scale);
        // Stern commanding eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale,
          cy - 16 * scale + bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale,
          cy - 16 * scale + bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#2a4a6a";
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 16 * scale + bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 16 * scale + bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Strong jawline
        ctx.strokeStyle = "#d4a574";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale + bounce);
        ctx.stroke();
        // Sword
        ctx.fillStyle = "#c0c0c0";
        ctx.save();
        ctx.translate(cx + 14 * scale, cy + 4 * scale + bounce);
        ctx.rotate(0.4);
        ctx.fillRect(-1 * scale, -18 * scale, 2 * scale, 20 * scale);
        // Sword hilt
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(-3 * scale, 0, 6 * scale, 4 * scale);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "engineer": {
        // Engineer - Tech specialist with hardhat and wrench
        // Tool belt body
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy + 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Orange safety vest
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 12 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx, cy - 6 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy + 12 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Reflective stripes
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy + 10 * scale + bounce);
        ctx.moveTo(cx + 6 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy + 10 * scale + bounce);
        ctx.stroke();
        // Tool belt
        ctx.fillStyle = "#451a03";
        ctx.fillRect(
          cx - 10 * scale,
          cy + 6 * scale + bounce,
          20 * scale,
          4 * scale
        );
        // Tools on belt
        ctx.fillStyle = "#71717a";
        ctx.fillRect(
          cx - 8 * scale,
          cy + 7 * scale + bounce,
          3 * scale,
          5 * scale
        );
        ctx.fillRect(
          cx + 5 * scale,
          cy + 7 * scale + bounce,
          3 * scale,
          5 * scale
        );

        // === ENGINEER WORK ARMS ===
        const workMotion = animated ? Math.sin(t * 2) * 0.12 : 0;

        // Left arm - safety gear
        ctx.save();
        ctx.translate(cx - 11 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.35 + workMotion);

        // Orange safety sleeve
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(0, 5 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflective stripe on sleeve
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(-3 * scale, 0);
        ctx.lineTo(-2 * scale, 10 * scale);
        ctx.stroke();

        // Work glove
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(0, 14 * scale, 4 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Glove padding
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 16 * scale, 3 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fingers
        ctx.fillStyle = "#78350f";
        for (let f = 0; f < 4; f++) {
          ctx.beginPath();
          ctx.ellipse(
            -2 * scale + f * 1.5 * scale,
            18 * scale,
            1 * scale,
            2 * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // Right arm - holding wrench
        ctx.save();
        ctx.translate(cx + 11 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.4 - workMotion);

        // Orange safety sleeve
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(0, 5 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflective stripe on sleeve
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(3 * scale, 0);
        ctx.lineTo(2 * scale, 10 * scale);
        ctx.stroke();

        // Work glove gripping wrench
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(0, 14 * scale, 4 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Glove padding
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 16 * scale, 3 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fingers wrapped around wrench handle
        ctx.fillStyle = "#78350f";
        for (let f = 0; f < 4; f++) {
          ctx.beginPath();
          ctx.ellipse(
            2 * scale - f * 1.5 * scale,
            18 * scale,
            1 * scale,
            2 * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale + bounce, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Hard hat
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 18 * scale + bounce,
          10 * scale,
          4 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - 20 * scale + bounce, 8 * scale, Math.PI, 0);
        ctx.fill();
        // Hard hat ridge
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(
          cx - 8 * scale,
          cy - 22 * scale + bounce,
          16 * scale,
          2 * scale
        );
        // Hat lamp
        ctx.fillStyle = animated
          ? `rgba(255, 255, 200, ${0.6 + Math.sin(t * 3) * 0.3})`
          : "#fff";
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = animated ? 6 * scale : 0;
        ctx.beginPath();
        ctx.arc(cx, cy - 24 * scale + bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Safety goggles
        ctx.fillStyle = "rgba(200, 230, 255, 0.6)";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(
          cx - 3.5 * scale,
          cy - 15 * scale + bounce,
          3 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3.5 * scale,
          cy - 15 * scale + bounce,
          3 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        // Goggle bridge
        ctx.beginPath();
        ctx.moveTo(cx - 0.5 * scale, cy - 15 * scale + bounce);
        ctx.lineTo(cx + 0.5 * scale, cy - 15 * scale + bounce);
        ctx.stroke();
        // Eyes behind goggles
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 3.5 * scale,
          cy - 15 * scale + bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3.5 * scale,
          cy - 15 * scale + bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Determined smile
        ctx.strokeStyle = "#8b6655";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 10 * scale + bounce,
          2.5 * scale,
          0.1 * Math.PI,
          0.9 * Math.PI
        );
        ctx.stroke();
        // Large wrench
        ctx.fillStyle = "#71717a";
        ctx.save();
        ctx.translate(cx + 14 * scale, cy + bounce);
        ctx.rotate(-0.3);
        // Wrench handle
        ctx.fillRect(-2 * scale, -4 * scale, 4 * scale, 18 * scale);
        // Wrench head
        ctx.fillStyle = "#52525b";
        ctx.beginPath();
        ctx.moveTo(-5 * scale, -8 * scale);
        ctx.lineTo(5 * scale, -8 * scale);
        ctx.lineTo(4 * scale, -4 * scale);
        ctx.lineTo(-4 * scale, -4 * scale);
        ctx.closePath();
        ctx.fill();
        // Wrench jaw opening
        ctx.fillStyle = "#27272a";
        ctx.fillRect(-2 * scale, -10 * scale, 4 * scale, 3 * scale);
        ctx.restore();
        // Gear emblem on vest
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * scale + bounce, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
        // Gear teeth
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(angle) * 3 * scale,
            cy + 2 * scale + Math.sin(angle) * 3 * scale + bounce
          );
          ctx.lineTo(
            cx + Math.cos(angle) * 4.5 * scale,
            cy + 2 * scale + Math.sin(angle) * 4.5 * scale + bounce
          );
          ctx.stroke();
        }
        break;
      }
    }
  }, [type, size, time, animated]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
// =============================================================================
// SPELL SPRITES - Epic Fantasy Style
// =============================================================================
export const SpellSprite: React.FC<{
  type: SpellType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 36, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => setTime((t) => t + 1), 30);
    return () => clearInterval(interval);
  }, [animated]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 40;
    const t = time * 0.08;
    switch (type) {
      case "fireball": {
        // === INFERNO ORB - A swirling vortex of hellfire ===
        const pulseScale = 1 + (animated ? Math.sin(t * 4) * 0.08 : 0);
        const rotationAngle = animated ? t * 2 : 0;

        // Outer hellfire aura - multiple layers
        for (let layer = 3; layer >= 0; layer--) {
          const layerRadius = (19 + layer * 3.5) * scale * pulseScale;
          const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerRadius);
          auraGrad.addColorStop(0, `rgba(255, 200, 50, ${0.15 - layer * 0.03})`);
          auraGrad.addColorStop(0.5, `rgba(255, 80, 0, ${0.12 - layer * 0.02})`);
          auraGrad.addColorStop(1, "rgba(150, 0, 0, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Swirling fire particles
        if (animated) {
          for (let i = 0; i < 12; i++) {
            const angle = rotationAngle + (i * Math.PI * 2) / 12;
            const dist = (10 + Math.sin(t * 3 + i * 1.5) * 3.5) * scale;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist - Math.sin(t * 4 + i) * 2.5 * scale;
            const particleSize = (1.8 + Math.sin(t * 5 + i) * 0.6) * scale;
            const particleGrad = ctx.createRadialGradient(px, py, 0, px, py, particleSize * 2);
            particleGrad.addColorStop(0, "#ffffff");
            particleGrad.addColorStop(0.3, "#ffdd00");
            particleGrad.addColorStop(0.7, "#ff6600");
            particleGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
            ctx.fillStyle = particleGrad;
            ctx.beginPath();
            ctx.arc(px, py, particleSize * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Main fireball core with intense glow
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 28 * scale;
        const coreGrad = ctx.createRadialGradient(
          cx - 2.5 * scale, cy - 2.5 * scale, 0,
          cx, cy, 14 * scale * pulseScale
        );
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.15, "#ffffcc");
        coreGrad.addColorStop(0.3, "#ffcc00");
        coreGrad.addColorStop(0.5, "#ff8800");
        coreGrad.addColorStop(0.75, "#ff4400");
        coreGrad.addColorStop(1, "#991100");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 12 * scale * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Inner plasma swirls
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);
        for (let i = 0; i < 3; i++) {
          const swirlAngle = (i * Math.PI * 2) / 3;
          ctx.strokeStyle = `rgba(255, 255, 200, ${0.6 - i * 0.1})`;
          ctx.lineWidth = 1.8 * scale;
          ctx.beginPath();
          for (let j = 0; j < 22; j++) {
            const r = (2.5 + j * 0.4) * scale;
            const a = swirlAngle + j * 0.3;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // Rising flame tongues
        ctx.shadowBlur = 18 * scale;
        for (let i = 0; i < 5; i++) {
          const flameAngle = (i * Math.PI * 2) / 5 + (animated ? Math.sin(t * 2 + i) * 0.3 : 0);
          const flameHeight = (7 + (animated ? Math.sin(t * 5 + i * 2) * 3.5 : 0)) * scale;
          const baseX = cx + Math.cos(flameAngle) * 7 * scale;
          const baseY = cy + Math.sin(flameAngle) * 7 * scale;
          const tipX = cx + Math.cos(flameAngle) * (12 + flameHeight / scale) * scale;
          const tipY = cy + Math.sin(flameAngle) * (12 + flameHeight / scale) * scale;

          const flameGrad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
          flameGrad.addColorStop(0, "#ffff88");
          flameGrad.addColorStop(0.4, "#ff8800");
          flameGrad.addColorStop(1, "rgba(200, 0, 0, 0)");
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          const perpX = Math.cos(flameAngle + Math.PI / 2) * 3 * scale;
          const perpY = Math.sin(flameAngle + Math.PI / 2) * 3 * scale;
          ctx.quadraticCurveTo(
            baseX + perpX, baseY + perpY,
            cx + Math.cos(flameAngle) * 5 * scale, cy + Math.sin(flameAngle) * 5 * scale
          );
          ctx.quadraticCurveTo(
            baseX - perpX, baseY - perpY,
            tipX, tipY
          );
          ctx.fill();
        }

        // Bright center highlight
        ctx.shadowBlur = 0;
        const highlightGrad = ctx.createRadialGradient(
          cx - 2.5 * scale, cy - 2.5 * scale, 0,
          cx, cy, 6 * scale
        );
        highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        highlightGrad.addColorStop(0.5, "rgba(255, 255, 200, 0.4)");
        highlightGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 2.5 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "lightning": {
        // === THUNDERSTRIKE - Crackling electric devastation ===
        const flickerIntensity = animated ? 0.7 + Math.random() * 0.3 : 1;
        const boltOffset = animated ? (Math.random() - 0.5) * 2 * scale : 0;

        // Electric storm aura
        const stormGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        stormGrad.addColorStop(0, `rgba(200, 220, 255, ${0.3 * flickerIntensity})`);
        stormGrad.addColorStop(0.4, `rgba(100, 150, 255, ${0.2 * flickerIntensity})`);
        stormGrad.addColorStop(0.7, `rgba(80, 100, 200, ${0.1 * flickerIntensity})`);
        stormGrad.addColorStop(1, "rgba(50, 50, 150, 0)");
        ctx.fillStyle = stormGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Crackling background sparks
        if (animated) {
          for (let i = 0; i < 8; i++) {
            if (Math.random() > 0.5) {
              const sparkAngle = Math.random() * Math.PI * 2;
              const sparkDist = (8 + Math.random() * 8) * scale;
              const sparkX = cx + Math.cos(sparkAngle) * sparkDist;
              const sparkY = cy + Math.sin(sparkAngle) * sparkDist;
              ctx.strokeStyle = `rgba(200, 230, 255, ${0.4 + Math.random() * 0.4})`;
              ctx.lineWidth = 0.5 * scale;
              ctx.beginPath();
              ctx.moveTo(sparkX, sparkY);
              ctx.lineTo(
                sparkX + (Math.random() - 0.5) * 4 * scale,
                sparkY + (Math.random() - 0.5) * 4 * scale
              );
              ctx.stroke();
            }
          }
        }

        // Main lightning bolt - outer glow layer
        ctx.shadowColor = "#88aaff";
        ctx.shadowBlur = 20 * scale * flickerIntensity;
        ctx.strokeStyle = `rgba(150, 180, 255, ${0.8 * flickerIntensity})`;
        ctx.lineWidth = 6 * scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale + boltOffset, cy - 16 * scale);
        ctx.lineTo(cx - 4 * scale + boltOffset * 0.5, cy - 4 * scale);
        ctx.lineTo(cx + 4 * scale + boltOffset * 0.3, cy - 2 * scale);
        ctx.lineTo(cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale);
        ctx.stroke();

        // Middle electric layer
        ctx.shadowColor = "#aaccff";
        ctx.shadowBlur = 12 * scale * flickerIntensity;
        ctx.strokeStyle = `rgba(200, 220, 255, ${0.9 * flickerIntensity})`;
        ctx.lineWidth = 3.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale + boltOffset, cy - 16 * scale);
        ctx.lineTo(cx - 4 * scale + boltOffset * 0.5, cy - 4 * scale);
        ctx.lineTo(cx + 4 * scale + boltOffset * 0.3, cy - 2 * scale);
        ctx.lineTo(cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale);
        ctx.stroke();

        // Hot white core
        ctx.shadowBlur = 8 * scale * flickerIntensity;
        ctx.shadowColor = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale + boltOffset, cy - 16 * scale);
        ctx.lineTo(cx - 4 * scale + boltOffset * 0.5, cy - 4 * scale);
        ctx.lineTo(cx + 4 * scale + boltOffset * 0.3, cy - 2 * scale);
        ctx.lineTo(cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale);
        ctx.stroke();

        // Secondary branching bolts
        ctx.shadowColor = "#aaccff";
        ctx.shadowBlur = 8 * scale * flickerIntensity;
        ctx.strokeStyle = `rgba(180, 200, 255, ${0.7 * flickerIntensity})`;
        ctx.lineWidth = 2 * scale;

        // Left branch
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale + boltOffset * 0.5, cy - 4 * scale);
        ctx.lineTo(cx - 10 * scale + boltOffset, cy - 6 * scale);
        ctx.lineTo(cx - 12 * scale + boltOffset * 1.2, cy - 2 * scale);
        ctx.stroke();

        // Right branch
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale + boltOffset * 0.3, cy - 2 * scale);
        ctx.lineTo(cx + 10 * scale + boltOffset * 0.8, cy + 2 * scale);
        ctx.lineTo(cx + 8 * scale + boltOffset, cy + 6 * scale);
        ctx.stroke();

        // White cores for branches
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale + boltOffset * 0.5, cy - 4 * scale);
        ctx.lineTo(cx - 10 * scale + boltOffset, cy - 6 * scale);
        ctx.lineTo(cx - 12 * scale + boltOffset * 1.2, cy - 2 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale + boltOffset * 0.3, cy - 2 * scale);
        ctx.lineTo(cx + 10 * scale + boltOffset * 0.8, cy + 2 * scale);
        ctx.lineTo(cx + 8 * scale + boltOffset, cy + 6 * scale);
        ctx.stroke();

        // Electric impact orbs at ends
        ctx.shadowBlur = 15 * scale * flickerIntensity;
        ctx.shadowColor = "#ffffff";
        const topOrbGrad = ctx.createRadialGradient(
          cx + 2 * scale + boltOffset, cy - 16 * scale, 0,
          cx + 2 * scale + boltOffset, cy - 16 * scale, 4 * scale
        );
        topOrbGrad.addColorStop(0, "#ffffff");
        topOrbGrad.addColorStop(0.4, "rgba(200, 220, 255, 0.8)");
        topOrbGrad.addColorStop(1, "rgba(100, 150, 255, 0)");
        ctx.fillStyle = topOrbGrad;
        ctx.beginPath();
        ctx.arc(cx + 2 * scale + boltOffset, cy - 16 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        const bottomOrbGrad = ctx.createRadialGradient(
          cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale, 0,
          cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale, 5 * scale
        );
        bottomOrbGrad.addColorStop(0, "#ffffff");
        bottomOrbGrad.addColorStop(0.3, "rgba(200, 220, 255, 0.9)");
        bottomOrbGrad.addColorStop(0.6, "rgba(150, 180, 255, 0.5)");
        bottomOrbGrad.addColorStop(1, "rgba(100, 150, 255, 0)");
        ctx.fillStyle = bottomOrbGrad;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "freeze": {
        // === GLACIAL NOVA - Ancient ice magic crystallization ===
        const rotationAngle = animated ? t * 0.4 : 0;
        const pulseIntensity = animated ? 0.8 + Math.sin(t * 2) * 0.2 : 1;
        const shimmer = animated ? Math.sin(t * 5) * 0.15 : 0;

        // Frozen mist aura
        const mistGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        mistGrad.addColorStop(0, `rgba(200, 240, 255, ${0.3 * pulseIntensity})`);
        mistGrad.addColorStop(0.5, `rgba(100, 200, 255, ${0.15 * pulseIntensity})`);
        mistGrad.addColorStop(1, "rgba(50, 150, 200, 0)");
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating ice particles
        if (animated) {
          for (let i = 0; i < 10; i++) {
            const particleAngle = t * 0.8 + (i * Math.PI * 2) / 10;
            const particleDist = (12 + Math.sin(t * 2 + i * 0.5) * 3) * scale;
            const px = cx + Math.cos(particleAngle) * particleDist;
            const py = cy + Math.sin(particleAngle) * particleDist;
            const particleSize = (1 + Math.sin(t * 3 + i) * 0.3) * scale;
            ctx.fillStyle = `rgba(200, 240, 255, ${0.5 + Math.sin(t * 4 + i) * 0.2})`;
            ctx.beginPath();
            // Diamond shape particle
            ctx.moveTo(px, py - particleSize);
            ctx.lineTo(px + particleSize * 0.6, py);
            ctx.lineTo(px, py + particleSize);
            ctx.lineTo(px - particleSize * 0.6, py);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Main crystal snowflake
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);

        // Draw 6 main arms
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 3);

          // Outer glow for arm
          ctx.shadowColor = "#00ccff";
          ctx.shadowBlur = 8 * scale * pulseIntensity;

          // Main crystal arm - gradient stroke
          const armGrad = ctx.createLinearGradient(0, 0, 0, -15 * scale);
          armGrad.addColorStop(0, "#ffffff");
          armGrad.addColorStop(0.3, `rgba(180, 240, 255, ${0.9 + shimmer})`);
          armGrad.addColorStop(0.7, `rgba(100, 200, 255, ${0.8 + shimmer})`);
          armGrad.addColorStop(1, `rgba(50, 180, 230, ${0.6})`);

          ctx.strokeStyle = armGrad;
          ctx.lineWidth = 2.5 * scale;
          ctx.lineCap = "round";

          // Main arm stem
          ctx.beginPath();
          ctx.moveTo(0, -3 * scale);
          ctx.lineTo(0, -15 * scale);
          ctx.stroke();

          // Crystal tip
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(0, -15 * scale);
          ctx.lineTo(-2 * scale, -13 * scale);
          ctx.lineTo(0, -17 * scale);
          ctx.lineTo(2 * scale, -13 * scale);
          ctx.closePath();
          ctx.fill();

          // Side branches with crystals
          ctx.lineWidth = 1.8 * scale;

          // First pair of branches
          ctx.beginPath();
          ctx.moveTo(0, -6 * scale);
          ctx.lineTo(-4 * scale, -9 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -6 * scale);
          ctx.lineTo(4 * scale, -9 * scale);
          ctx.stroke();

          // Second pair of branches
          ctx.beginPath();
          ctx.moveTo(0, -10 * scale);
          ctx.lineTo(-3 * scale, -12.5 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -10 * scale);
          ctx.lineTo(3 * scale, -12.5 * scale);
          ctx.stroke();

          // Small crystal formations on branch tips
          ctx.fillStyle = `rgba(220, 250, 255, ${0.9 + shimmer})`;
          const crystalPositions = [
            { x: -4 * scale, y: -9 * scale },
            { x: 4 * scale, y: -9 * scale },
            { x: -3 * scale, y: -12.5 * scale },
            { x: 3 * scale, y: -12.5 * scale },
          ];
          crystalPositions.forEach((pos) => {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y - 1.5 * scale);
            ctx.lineTo(pos.x - 1 * scale, pos.y);
            ctx.lineTo(pos.x, pos.y + 1.5 * scale);
            ctx.lineTo(pos.x + 1 * scale, pos.y);
            ctx.closePath();
            ctx.fill();
          });

          ctx.restore();
        }
        ctx.restore();

        // Central ice crystal core
        ctx.shadowColor = "#00ddff";
        ctx.shadowBlur = 12 * scale * pulseIntensity;
        const coreGrad = ctx.createRadialGradient(
          cx - 1 * scale, cy - 1 * scale, 0,
          cx, cy, 5 * scale
        );
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.4, "#ccffff");
        coreGrad.addColorStop(0.7, "#66ddff");
        coreGrad.addColorStop(1, "#00aadd");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        // Hexagonal core
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + rotationAngle;
          const x = cx + Math.cos(angle) * 4 * scale;
          const y = cy + Math.sin(angle) * 4 * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Bright center highlight
        ctx.shadowBlur = 0;
        const highlightGrad = ctx.createRadialGradient(
          cx - 1 * scale, cy - 1 * scale, 0,
          cx, cy, 2.5 * scale
        );
        highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        highlightGrad.addColorStop(0.5, "rgba(200, 240, 255, 0.5)");
        highlightGrad.addColorStop(1, "rgba(150, 220, 255, 0)");
        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.arc(cx - 1 * scale, cy - 1 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "payday": {
        // === FORTUNE'S BLESSING - Divine golden treasure magic ===
        const rotationAngle = animated ? t * 0.5 : 0;
        const pulseScale = animated ? 1 + Math.sin(t * 3) * 0.06 : 1;
        const shimmer = animated ? Math.sin(t * 6) : 0;

        // Divine golden aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        auraGrad.addColorStop(0, `rgba(255, 230, 100, ${0.35 * pulseScale})`);
        auraGrad.addColorStop(0.5, `rgba(255, 200, 50, ${0.2 * pulseScale})`);
        auraGrad.addColorStop(0.8, `rgba(200, 150, 0, ${0.1})`);
        auraGrad.addColorStop(1, "rgba(150, 100, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting golden sparkles
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const sparkAngle = rotationAngle * 2 + (i * Math.PI * 2) / 8;
            const sparkDist = (13 + Math.sin(t * 2 + i) * 2) * scale;
            const sx = cx + Math.cos(sparkAngle) * sparkDist;
            const sy = cy + Math.sin(sparkAngle) * sparkDist;

            // 4-pointed star sparkle
            ctx.fillStyle = `rgba(255, 255, 200, ${0.7 + Math.sin(t * 5 + i * 2) * 0.3})`;
            ctx.beginPath();
            const sparkSize = (1.5 + Math.sin(t * 4 + i) * 0.5) * scale;
            ctx.moveTo(sx, sy - sparkSize * 1.5);
            ctx.lineTo(sx + sparkSize * 0.4, sy);
            ctx.lineTo(sx, sy + sparkSize * 1.5);
            ctx.lineTo(sx - sparkSize * 0.4, sy);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(sx - sparkSize * 1.5, sy);
            ctx.lineTo(sx, sy + sparkSize * 0.4);
            ctx.lineTo(sx + sparkSize * 1.5, sy);
            ctx.lineTo(sx, sy - sparkSize * 0.4);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Coin stack with 3D effect
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 15 * scale;

        for (let i = 3; i >= 0; i--) {
          const coinY = cy + 4 * scale - i * 4 * scale;
          const coinScale = 1 - i * 0.05;

          // Coin edge (3D depth)
          if (i < 3) {
            ctx.fillStyle = "#a67c00";
            ctx.beginPath();
            ctx.ellipse(cx, coinY + 2 * scale, 11 * scale * coinScale, 5.5 * scale * coinScale, 0, 0, Math.PI);
            ctx.fill();
          }

          // Main coin face gradient
          const coinGrad = ctx.createLinearGradient(
            cx - 10 * scale, coinY - 5 * scale,
            cx + 10 * scale, coinY + 5 * scale
          );
          coinGrad.addColorStop(0, "#fff5b8");
          coinGrad.addColorStop(0.2, "#ffd700");
          coinGrad.addColorStop(0.5, "#ffec8b");
          coinGrad.addColorStop(0.8, "#daa520");
          coinGrad.addColorStop(1, "#b8860b");
          ctx.fillStyle = coinGrad;
          ctx.beginPath();
          ctx.ellipse(cx, coinY, 11 * scale * coinScale, 5.5 * scale * coinScale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Coin rim
          ctx.strokeStyle = "#8b6914";
          ctx.lineWidth = 1.2 * scale;
          ctx.stroke();

          // Inner decorative circle
          ctx.strokeStyle = `rgba(139, 105, 20, ${0.6 + shimmer * 0.2})`;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.ellipse(cx, coinY, 8 * scale * coinScale, 4 * scale * coinScale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Dollar sign on top coin
        ctx.shadowBlur = 0;
        ctx.font = `bold ${13 * scale}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Dollar sign shadow
        ctx.fillStyle = "rgba(100, 70, 0, 0.5)";
        ctx.fillText("$", cx + 0.5 * scale, cy - 7 * scale + 0.5 * scale);

        // Dollar sign gradient fill
        const dollarGrad = ctx.createLinearGradient(
          cx - 5 * scale, cy - 12 * scale,
          cx + 5 * scale, cy - 2 * scale
        );
        dollarGrad.addColorStop(0, "#5a4a10");
        dollarGrad.addColorStop(0.5, "#8b6914");
        dollarGrad.addColorStop(1, "#5a4a10");
        ctx.fillStyle = dollarGrad;
        ctx.fillText("$", cx, cy - 7 * scale);

        // Radiant sparkle bursts
        ctx.shadowColor = "#ffdd00";
        ctx.shadowBlur = 8 * scale;
        const sparklePositions = [
          { x: -13, y: -8, size: 2.5, phase: 0 },
          { x: 13, y: -6, size: 2.2, phase: 1 },
          { x: -11, y: 6, size: 2, phase: 2 },
          { x: 12, y: 8, size: 2.3, phase: 3 },
          { x: 0, y: -14, size: 2.8, phase: 4 },
        ];
        sparklePositions.forEach(({ x, y, size, phase }) => {
          const sparkAlpha = animated ? 0.6 + Math.sin(t * 4 + phase) * 0.4 : 0.8;
          const sparkScale = animated ? size * (0.8 + Math.sin(t * 5 + phase) * 0.3) : size;
          ctx.fillStyle = `rgba(255, 255, 220, ${sparkAlpha})`;

          // Draw 4-pointed sparkle
          ctx.beginPath();
          ctx.moveTo(cx + x * scale, cy + y * scale - sparkScale * scale);
          ctx.lineTo(cx + x * scale + sparkScale * 0.3 * scale, cy + y * scale);
          ctx.lineTo(cx + x * scale, cy + y * scale + sparkScale * scale);
          ctx.lineTo(cx + x * scale - sparkScale * 0.3 * scale, cy + y * scale);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx + x * scale - sparkScale * scale, cy + y * scale);
          ctx.lineTo(cx + x * scale, cy + y * scale + sparkScale * 0.3 * scale);
          ctx.lineTo(cx + x * scale + sparkScale * scale, cy + y * scale);
          ctx.lineTo(cx + x * scale, cy + y * scale - sparkScale * 0.3 * scale);
          ctx.closePath();
          ctx.fill();
        });
        ctx.shadowBlur = 0;
        break;
      }
      case "reinforcements": {
        // === RALLY CRY - Summon heroic warriors from the void ===
        const pulseIntensity = animated ? 0.7 + Math.sin(t * 2) * 0.3 : 1;
        const rotationAngle = animated ? t * 0.3 : 0;

        // Magical summoning circle aura
        const summonAura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        summonAura.addColorStop(0, `rgba(150, 100, 255, ${0.25 * pulseIntensity})`);
        summonAura.addColorStop(0.5, `rgba(100, 50, 200, ${0.15 * pulseIntensity})`);
        summonAura.addColorStop(1, "rgba(50, 20, 100, 0)");
        ctx.fillStyle = summonAura;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Outer magic circle
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);

        ctx.shadowColor = "#aa66ff";
        ctx.shadowBlur = 10 * scale * pulseIntensity;
        ctx.strokeStyle = `rgba(170, 100, 255, ${0.7 * pulseIntensity})`;
        ctx.lineWidth = 1.5 * scale;

        // Main circle
        ctx.beginPath();
        ctx.arc(0, 0, 16 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Rune markings around circle
        for (let i = 0; i < 6; i++) {
          const runeAngle = (i * Math.PI) / 3;
          const rx = Math.cos(runeAngle) * 16 * scale;
          const ry = Math.sin(runeAngle) * 16 * scale;

          // Small rune symbols
          ctx.fillStyle = `rgba(200, 150, 255, ${0.8 * pulseIntensity})`;
          ctx.beginPath();
          ctx.arc(rx, ry, 2 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Connecting lines
          ctx.beginPath();
          ctx.moveTo(rx * 0.7, ry * 0.7);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        // Inner arcane pentagon
        ctx.strokeStyle = `rgba(150, 100, 255, ${0.5 * pulseIntensity})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * 10 * scale;
          const y = Math.sin(angle) * 10 * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Rising energy particles
        if (animated) {
          for (let i = 0; i < 12; i++) {
            const particlePhase = t * 1.5 + i * 0.5;
            const particleY = ((particlePhase * 20) % 30) - 15;
            const particleX = Math.sin(particlePhase * 2 + i) * 8;
            const alpha = 1 - Math.abs(particleY) / 15;
            ctx.fillStyle = `rgba(180, 130, 255, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(cx + particleX * scale, cy + particleY * scale, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Three heroic figures
        const warriors = [
          { x: -9, y: 3, armor: "#7744dd", delay: 0 },
          { x: 9, y: 3, armor: "#7744dd", delay: 1 },
          { x: 0, y: -5, armor: "#9966ff", delay: 2 },
        ];

        warriors.forEach(({ x, y, armor, delay }) => {
          const yOffset = animated ? Math.sin(t * 2 + delay) * 1.5 : 0;
          const glowIntensity = animated ? 0.7 + Math.sin(t * 3 + delay) * 0.3 : 1;
          const wx = cx + x * scale;
          const wy = cy + y * scale - yOffset * scale;

          // Warrior glow aura
          const warriorAura = ctx.createRadialGradient(wx, wy, 0, wx, wy, 8 * scale);
          warriorAura.addColorStop(0, `rgba(150, 100, 255, ${0.2 * glowIntensity})`);
          warriorAura.addColorStop(1, "rgba(100, 50, 200, 0)");
          ctx.fillStyle = warriorAura;
          ctx.beginPath();
          ctx.arc(wx, wy, 8 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Body/Cape
          const capeGrad = ctx.createLinearGradient(wx - 5 * scale, wy, wx + 5 * scale, wy);
          capeGrad.addColorStop(0, "#4a2288");
          capeGrad.addColorStop(0.5, armor);
          capeGrad.addColorStop(1, "#4a2288");
          ctx.fillStyle = capeGrad;
          ctx.beginPath();
          ctx.moveTo(wx, wy - 2 * scale);
          ctx.quadraticCurveTo(wx - 7 * scale, wy + 2 * scale, wx - 5 * scale, wy + 9 * scale);
          ctx.lineTo(wx - 3 * scale, wy + 7 * scale);
          ctx.lineTo(wx, wy + 9 * scale);
          ctx.lineTo(wx + 3 * scale, wy + 7 * scale);
          ctx.lineTo(wx + 5 * scale, wy + 9 * scale);
          ctx.quadraticCurveTo(wx + 7 * scale, wy + 2 * scale, wx, wy - 2 * scale);
          ctx.fill();

          // Armor chestplate
          ctx.fillStyle = "#5533aa";
          ctx.beginPath();
          ctx.ellipse(wx, wy + 1 * scale, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Head
          ctx.fillStyle = "#ffdbac";
          ctx.beginPath();
          ctx.arc(wx, wy - 5 * scale, 4 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Helmet
          const helmetGrad = ctx.createLinearGradient(wx - 4 * scale, wy - 8 * scale, wx + 4 * scale, wy - 4 * scale);
          helmetGrad.addColorStop(0, "#6b7280");
          helmetGrad.addColorStop(0.5, "#9ca3af");
          helmetGrad.addColorStop(1, "#6b7280");
          ctx.fillStyle = helmetGrad;
          ctx.beginPath();
          ctx.arc(wx, wy - 6 * scale, 4.5 * scale, Math.PI, 0);
          ctx.fill();

          // Helmet plume
          ctx.fillStyle = armor;
          ctx.beginPath();
          ctx.ellipse(wx, wy - 10 * scale, 1.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eyes (glowing)
          ctx.fillStyle = `rgba(200, 180, 255, ${glowIntensity})`;
          ctx.shadowColor = "#aa88ff";
          ctx.shadowBlur = 4 * scale * glowIntensity;
          ctx.beginPath();
          ctx.arc(wx - 1.5 * scale, wy - 5 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.arc(wx + 1.5 * scale, wy - 5 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Shield (front warrior only)
          if (x === 0) {
            const shieldGrad = ctx.createLinearGradient(wx - 6 * scale, wy, wx + 2 * scale, wy);
            shieldGrad.addColorStop(0, "#8866cc");
            shieldGrad.addColorStop(0.5, "#aa88ee");
            shieldGrad.addColorStop(1, "#8866cc");
            ctx.fillStyle = shieldGrad;
            ctx.beginPath();
            ctx.moveTo(wx - 7 * scale, wy - 2 * scale);
            ctx.lineTo(wx - 7 * scale, wy + 4 * scale);
            ctx.lineTo(wx - 4 * scale, wy + 6 * scale);
            ctx.lineTo(wx - 1 * scale, wy + 4 * scale);
            ctx.lineTo(wx - 1 * scale, wy - 2 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#5533aa";
            ctx.lineWidth = 0.8 * scale;
            ctx.stroke();
          }

          // Sword (back warriors)
          if (x !== 0) {
            const swordX = x > 0 ? wx + 5 * scale : wx - 5 * scale;
            ctx.strokeStyle = "#c0c0c0";
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.moveTo(swordX, wy - 8 * scale);
            ctx.lineTo(swordX, wy + 2 * scale);
            ctx.stroke();
            // Sword hilt
            ctx.strokeStyle = "#8b4513";
            ctx.beginPath();
            ctx.moveTo(swordX - 2 * scale, wy + 2 * scale);
            ctx.lineTo(swordX + 2 * scale, wy + 2 * scale);
            ctx.stroke();
          }
        });
        break;
      }
    }
  }, [type, size, time, animated]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
// =============================================================================
// ENEMY SPRITES - Dark Fantasy Style
// =============================================================================
export type EnemyType =
  | "frosh"
  | "sophomore"
  | "junior"
  | "senior"
  | "gradstudent"
  | "professor"
  | "dean"
  | "trustee"
  | "mascot"
  | "archer"
  | "mage"
  | "catapult"
  | "warlock"
  | "crossbowman"
  | "hexer"
  | "harpy"
  | "wyvern"
  | "specter"
  | "berserker"
  | "golem"
  | "necromancer"
  | "shadow_knight";
export const ENEMY_COLORS: Record<string, string> = {
  frosh: "#4ade80",
  sophomore: "#3b82f6",
  junior: "#7c3aed",
  senior: "#f472b6",
  gradstudent: "#fb923c",
  professor: "#ef4444",
  dean: "#a855f7",
  trustee: "#fbbf24",
  mascot: "#22d3d3",
  archer: "#10b981",
  mage: "#8b5cf6",
  catapult: "#f97316",
  warlock: "#7c3aed",
  crossbowman: "#57534e",
  hexer: "#ec4899",
  harpy: "#ea580c",
  wyvern: "#22c55e",
  specter: "#06b6d4",
  berserker: "#b91c1c",
  golem: "#a8a29e",
  necromancer: "#22c55e",
  shadow_knight: "#6366f1",
};
export const EnemySprite: React.FC<{
  type: EnemyType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 40, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => setTime((t) => t + 1), 60);
    return () => clearInterval(interval);
  }, [animated]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 45;
    const t = time * 0.1;
    const bounce = animated ? Math.sin(t * 1.5) * 2 : 0;
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    switch (type) {
      case "frosh": {
        // CORRUPTED INITIATE - Possessed first-year with dark energy
        const pulseIntensity = 0.5 + Math.sin(t * 2) * 0.3;

        // Green corruption aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          16 * scale
        );
        auraGrad.addColorStop(
          0,
          `rgba(74, 222, 128, ${pulseIntensity * 0.25})`
        );
        auraGrad.addColorStop(
          0.6,
          `rgba(34, 197, 94, ${pulseIntensity * 0.1})`
        );
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating energy particles
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const particleAngle = t * 1.5 + i * Math.PI * 0.5;
            const particleDist = 10 * scale + Math.sin(t * 2 + i) * 2 * scale;
            const px = cx + Math.cos(particleAngle) * particleDist;
            const py =
              cy -
              2 * scale +
              Math.sin(particleAngle) * particleDist * 0.4 -
              bounce;
            ctx.fillStyle = `rgba(74, 222, 128, ${0.5 + Math.sin(t * 3 + i) * 0.2
              })`;
            ctx.beginPath();
            ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Tattered green robes
        const robeGrad = ctx.createLinearGradient(
          cx - 8 * scale,
          cy,
          cx + 8 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#1a3a1a");
        robeGrad.addColorStop(0.3, "#2a5a2a");
        robeGrad.addColorStop(0.5, "#3a7a3a");
        robeGrad.addColorStop(0.7, "#2a5a2a");
        robeGrad.addColorStop(1, "#1a3a1a");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 11 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 9 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 11 * scale,
          cy - bounce,
          cx + 9 * scale,
          cy + 14 * scale - bounce
        );
        // Tattered bottom
        ctx.lineTo(cx + 7 * scale, cy + 16 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx, cy + 17 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 7 * scale, cy + 16 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Corruption veins on robe
        ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.6})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 2 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 3 * scale,
          cy + 4 * scale - bounce,
          cx - 5 * scale,
          cy + 10 * scale - bounce
        );
        ctx.stroke();

        // Hood
        ctx.fillStyle = "#0a2a0a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 10 * scale - bounce,
          8 * scale,
          5 * scale,
          0,
          Math.PI,
          0
        );
        ctx.fill();

        // Pale corrupted face
        ctx.fillStyle = "#c8e8c8";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Possessed glowing eyes - layered glow effect
        ctx.fillStyle = "rgba(74, 222, 128, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(74, 222, 128, 0.5)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 2.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dark pupils
        ctx.fillStyle = "#0a2a0a";
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 14 * scale - bounce,
          0.6 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 14 * scale - bounce,
          0.6 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Grimacing mouth
        ctx.fillStyle = "#1a2a1a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 10 * scale - bounce,
          2 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }
      case "sophomore": {
        // ARROGANT APPRENTICE - Cocky spellcaster with blue magic
        const magicPulse = 0.6 + Math.sin(t * 2) * 0.4;

        // Blue elemental aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(96, 165, 250, ${magicPulse * 0.2})`);
        auraGrad.addColorStop(0.6, `rgba(59, 130, 246, ${magicPulse * 0.08})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating arcane symbols
        if (animated) {
          for (let i = 0; i < 3; i++) {
            const symbolAngle = t * 1.2 + i * Math.PI * 0.67;
            const symbolDist = 10 * scale;
            const sx = cx + Math.cos(symbolAngle) * symbolDist;
            const sy =
              cy -
              2 * scale +
              Math.sin(symbolAngle) * symbolDist * 0.35 -
              bounce;
            ctx.fillStyle = `rgba(96, 165, 250, ${0.4 + Math.sin(t * 2 + i) * 0.2
              })`;
            ctx.font = `${4 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.fillText(["◇", "△", "○"][i], sx, sy);
          }
        }

        // Blue apprentice robes
        const robeGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#1e3a5f");
        robeGrad.addColorStop(0.3, "#2563eb");
        robeGrad.addColorStop(0.5, "#3b82f6");
        robeGrad.addColorStop(0.7, "#2563eb");
        robeGrad.addColorStop(1, "#1e3a5f");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 11 * scale,
          cy - bounce,
          cx - 6 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 11 * scale,
          cy - bounce,
          cx + 9 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Silver trim on robes
        ctx.strokeStyle = "#c0c0c0";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 10 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Golden sash
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 2 * scale - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy + 2 * scale - bounce,
          cx + 7 * scale,
          cy - 2 * scale - bounce
        );
        ctx.lineTo(cx + 6 * scale, cy + bounce - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy + 4 * scale - bounce,
          cx - 6 * scale,
          cy + bounce - bounce
        );
        ctx.fill();

        // Confident face
        ctx.fillStyle = "#fcd9b6";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Stylish dark hair
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 17 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 7 * scale,
          cy - 22 * scale - bounce,
          cx - scale,
          cy - 21 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 4 * scale,
          cy - 23 * scale - bounce,
          cx + 6 * scale,
          cy - 18 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy - 16 * scale - bounce);
        ctx.fill();

        // Confident glowing blue eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 15 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2 * scale,
          cy - 15 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Layered glow for eyes
        ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 15 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 15 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 15 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 15 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Smug smirk
        ctx.strokeStyle = "#a16207";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 1.5 * scale, cy - 11 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + scale,
          cy - 10 * scale - bounce,
          cx + 2 * scale,
          cy - 11.5 * scale - bounce
        );
        ctx.stroke();

        // Glowing spell orb in hand - layered glow
        ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy + 2 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy + 2 * scale - bounce, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy + 2 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#dbeafe";
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy + 2 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "junior": {
        // HAUNTED SCHOLAR - Tormented by forbidden knowledge
        const madnessPulse = 0.5 + Math.sin(t * 2.5) * 0.3;
        const twitch = animated ? Math.sin(t * 4) * 1 * scale : 0;

        // Purple madness aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          15 * scale
        );
        auraGrad.addColorStop(0, `rgba(192, 132, 252, ${madnessPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(147, 51, 234, ${madnessPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 15 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating ancient tomes
        if (animated) {
          for (let i = 0; i < 2; i++) {
            const bookAngle = t * 0.8 + i * Math.PI;
            const bookDist = 11 * scale;
            const bx = cx + Math.cos(bookAngle) * bookDist;
            const by =
              cy - 2 * scale + Math.sin(bookAngle) * bookDist * 0.3 - bounce;
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(Math.sin(t + i) * 0.2);
            ctx.fillStyle = ["#3b0764", "#0a2a4a"][i];
            ctx.fillRect(-2 * scale, -2.5 * scale, 4 * scale, 5 * scale);
            ctx.fillStyle = "#fef3c7";
            ctx.fillRect(-1.5 * scale, -2 * scale, 3 * scale, 4 * scale);
            ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse})`;
            ctx.font = `${2 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.fillText("◈", 0, 0.5 * scale);
            ctx.restore();
          }
        }

        // Purple scholar robes
        const robeGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#3b0764");
        robeGrad.addColorStop(0.3, "#6b21a8");
        robeGrad.addColorStop(0.5, "#7c3aed");
        robeGrad.addColorStop(0.7, "#6b21a8");
        robeGrad.addColorStop(1, "#3b0764");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 11 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 11 * scale,
          cy - bounce,
          cx + 9 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Ancient symbols on robe
        ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.6})`;
        ctx.font = `${3 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("⍟", cx, cy + 3 * scale - bounce);

        // Gaunt haunted face
        ctx.fillStyle = "#ddd6fe";
        ctx.beginPath();
        ctx.arc(
          cx + twitch * 0.3,
          cy - 14 * scale - bounce,
          6 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Cracked spectacles
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.rect(
          cx - 5 * scale + twitch * 0.3,
          cy - 17 * scale - bounce,
          4 * scale,
          3 * scale
        );
        ctx.rect(
          cx + scale + twitch * 0.3,
          cy - 17 * scale - bounce,
          4 * scale,
          3 * scale
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - scale + twitch * 0.3, cy - 15.5 * scale - bounce);
        ctx.lineTo(cx + scale + twitch * 0.3, cy - 15.5 * scale - bounce);
        ctx.stroke();

        // Wide terrified purple eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale + twitch * 0.3,
          cy - 15.5 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale + twitch * 0.3,
          cy - 15.5 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Layered glow for eyes
        ctx.fillStyle = "rgba(124, 58, 237, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale + twitch * 0.3, cy - 15.5 * scale - bounce, 2.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale + twitch * 0.3, cy - 15.5 * scale - bounce, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale + twitch * 0.3, cy - 15.5 * scale - bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale + twitch * 0.3, cy - 15.5 * scale - bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Tiny pupils
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale + twitch * 0.3,
          cy - 15.5 * scale - bounce,
          0.3 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale + twitch * 0.3,
          cy - 15.5 * scale - bounce,
          0.3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Dark circles
        ctx.fillStyle = "rgba(91, 33, 182, 0.5)";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale + twitch * 0.3,
          cy - 13 * scale - bounce,
          1.5 * scale,
          0.6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale + twitch * 0.3,
          cy - 13 * scale - bounce,
          1.5 * scale,
          0.6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Wild unkempt hair with gray
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(
          cx + twitch * 0.3,
          cy - 19 * scale - bounce,
          5.5 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        // Wild strands
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = i % 2 === 0 ? "#6b7280" : "#1e1b4b";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(
            cx - 4 * scale + i * 2 * scale + twitch * 0.3,
            cy - 19 * scale - bounce
          );
          ctx.lineTo(
            cx -
            5 * scale +
            i * 2.5 * scale +
            twitch * 0.3 +
            Math.sin(t * 2 + i) * scale,
            cy - 23 * scale - bounce
          );
          ctx.stroke();
        }
        break;
      }
      case "senior": {
        // SHADOW GRADUATE - Confident dark magic user with living cloak
        const powerPulse = 0.6 + Math.sin(t * 2) * 0.4;
        const cloakWave = Math.sin(t * 1.5) * 0.08;

        // Pink/magenta power aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          15 * scale
        );
        auraGrad.addColorStop(0, `rgba(244, 114, 182, ${powerPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(219, 39, 119, ${powerPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 15 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Shadow wisps
        if (animated) {
          for (let i = 0; i < 3; i++) {
            const wispX = cx + Math.sin(t + i * 1.5) * 8 * scale;
            const wispY = cy + 8 * scale - bounce + Math.cos(t + i) * 2 * scale;
            ctx.fillStyle = `rgba(31, 41, 55, ${0.3 + Math.sin(t * 2 + i) * 0.1
              })`;
            ctx.beginPath();
            ctx.ellipse(
              wispX,
              wispY,
              2.5 * scale,
              1.2 * scale,
              t + i,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Living graduation cloak
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(cloakWave);
        const cloakGrad = ctx.createLinearGradient(
          -10 * scale,
          -10 * scale,
          10 * scale,
          14 * scale
        );
        cloakGrad.addColorStop(0, "#1f2937");
        cloakGrad.addColorStop(0.3, "#111827");
        cloakGrad.addColorStop(0.6, "#1f2937");
        cloakGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = cloakGrad;
        ctx.beginPath();
        ctx.moveTo(-10 * scale, 14 * scale - bounce);
        // Flowing bottom
        ctx.lineTo(-8 * scale, 16 * scale - bounce);
        ctx.lineTo(-4 * scale, 14 * scale - bounce);
        ctx.lineTo(0, 17 * scale - bounce);
        ctx.lineTo(4 * scale, 14 * scale - bounce);
        ctx.lineTo(8 * scale, 16 * scale - bounce);
        ctx.lineTo(10 * scale, 14 * scale - bounce);
        ctx.quadraticCurveTo(12 * scale, 0, 7 * scale, -11 * scale - bounce);
        ctx.lineTo(-7 * scale, -11 * scale - bounce);
        ctx.quadraticCurveTo(-12 * scale, 0, -10 * scale, 14 * scale - bounce);
        ctx.fill();
        ctx.restore();

        // Pink trim
        ctx.strokeStyle = "#f472b6";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy + 10 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Graduation stole
        ctx.fillStyle = "#f472b6";
        ctx.fillRect(
          cx - 4 * scale,
          cy - 8 * scale - bounce,
          2.5 * scale,
          16 * scale
        );
        ctx.fillRect(
          cx + 1.5 * scale,
          cy - 8 * scale - bounce,
          2.5 * scale,
          16 * scale
        );
        // Stole symbols
        ctx.fillStyle = "#fdf4ff";
        ctx.font = `${2.5 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("☆", cx - 2.8 * scale, cy + 2 * scale - bounce);
        ctx.fillText("◇", cx + 2.8 * scale, cy + 4 * scale - bounce);

        // Confident face
        ctx.fillStyle = "#fce7f3";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Stylish dark hair
        ctx.fillStyle = "#1f2937";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 17 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 6 * scale,
          cy - 22 * scale - bounce,
          cx,
          cy - 22 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 6 * scale,
          cy - 22 * scale - bounce,
          cx + 5 * scale,
          cy - 17 * scale - bounce
        );
        ctx.lineTo(cx + 4 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 16 * scale - bounce);
        ctx.fill();

        // Floating mortarboard
        ctx.save();
        ctx.translate(cx, cy - 22 * scale - bounce + Math.sin(t) * scale);
        ctx.rotate(Math.sin(t * 0.8) * 0.05);
        ctx.fillStyle = "#1f2937";
        // Board
        ctx.beginPath();
        ctx.moveTo(-6 * scale, 0);
        ctx.lineTo(0, -2 * scale);
        ctx.lineTo(6 * scale, 0);
        ctx.lineTo(0, 2 * scale);
        ctx.closePath();
        ctx.fill();
        // Pink tassel
        ctx.strokeStyle = "#f472b6";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          4 * scale + Math.sin(t * 2) * scale,
          3 * scale,
          3 * scale,
          6 * scale
        );
        ctx.stroke();
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(3 * scale, 6.5 * scale, scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Glowing pink eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 15 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2 * scale,
          cy - 15 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Layered glow for eyes
        ctx.fillStyle = "rgba(219, 39, 119, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 15 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 15 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#db2777";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 15 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 15 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Knowing smirk
        ctx.strokeStyle = "#9d174d";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 0.5 * scale,
          cy - 12 * scale - bounce,
          1.5 * scale,
          0.15 * Math.PI,
          0.85 * Math.PI
        );
        ctx.stroke();
        break;
      }
      case "gradstudent": {
        // ELDRITCH RESEARCHER - Reality-warped grad student driven mad by forbidden knowledge
        const realityWarp = Math.sin(t * 2) * 0.1;
        const twitch = animated ? Math.sin(t * 5) * 0.5 * scale : 0;
        const unstablePulse = 0.5 + Math.sin(t * 3) * 0.3;

        // Unstable reality aura (warped space)
        ctx.save();
        ctx.translate(cx, cy - 2 * scale);
        ctx.scale(1 + realityWarp, 1 - realityWarp);
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14 * scale);
        auraGrad.addColorStop(0, `rgba(251, 146, 60, ${unstablePulse * 0.2})`);
        auraGrad.addColorStop(0.4, `rgba(234, 88, 12, ${unstablePulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, -bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Floating chaotic research papers
        if (animated) {
          for (let i = 0; i < 3; i++) {
            const paperAngle = t * 0.9 + i * Math.PI * 0.67;
            const paperDist = 10 * scale + Math.sin(t * 2 + i) * 2 * scale;
            const px = cx + Math.cos(paperAngle) * paperDist;
            const py =
              cy - 2 * scale + Math.sin(paperAngle) * paperDist * 0.3 - bounce;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(Math.sin(t * 2 + i) * 0.4);
            ctx.fillStyle = `rgba(254, 243, 199, ${0.7 + Math.sin(t + i) * 0.2
              })`;
            ctx.fillRect(-2 * scale, -2.5 * scale, 4 * scale, 5 * scale);
            // Scribbled lines
            ctx.strokeStyle = `rgba(120, 53, 15, ${0.5})`;
            ctx.lineWidth = 0.5 * scale;
            for (let l = 0; l < 3; l++) {
              ctx.beginPath();
              ctx.moveTo(-1.5 * scale, -1.5 * scale + l * 1.5 * scale);
              ctx.lineTo(1.5 * scale, -1.5 * scale + l * 1.5 * scale);
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        // Tattered lab coat
        const coatGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        coatGrad.addColorStop(0, "#d6d3d1");
        coatGrad.addColorStop(0.3, "#e7e5e4");
        coatGrad.addColorStop(0.5, "#f5f5f4");
        coatGrad.addColorStop(0.7, "#e7e5e4");
        coatGrad.addColorStop(1, "#d6d3d1");
        ctx.fillStyle = coatGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(-8 * scale + cx, cy + 16 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx, cy + 17 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy + 16 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 12 * scale,
          cy - bounce,
          cx + 6 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 12 * scale,
          cy - bounce,
          cx - 10 * scale,
          cy + 14 * scale - bounce
        );
        ctx.fill();

        // Stains on lab coat
        ctx.fillStyle = "rgba(120, 53, 15, 0.3)";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale,
          cy + 2 * scale - bounce,
          2 * scale,
          1.5 * scale,
          0.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
        ctx.beginPath();
        ctx.ellipse(
          cx + 4 * scale,
          cy + 6 * scale - bounce,
          1.5 * scale,
          2 * scale,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Gaunt exhausted face
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(
          cx + twitch,
          cy - 14 * scale - bounce,
          6 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Scraggly beard
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale + twitch, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + twitch,
          cy - 6 * scale - bounce,
          cx + 3 * scale + twitch,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 2 * scale + twitch, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + twitch,
          cy - 5 * scale - bounce,
          cx - 2 * scale + twitch,
          cy - 8 * scale - bounce
        );
        ctx.fill();

        // Bloodshot twitching eyes
        ctx.fillStyle = "#fef2f2";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale + twitch,
          cy - 15 * scale - bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale + twitch,
          cy - 15 * scale - bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Bloodshot veins
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 0.3 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3.5 * scale + twitch, cy - 15 * scale - bounce);
        ctx.lineTo(cx - 2 * scale + twitch, cy - 15 * scale - bounce);
        ctx.moveTo(cx + 4 * scale + twitch, cy - 14.5 * scale - bounce);
        ctx.lineTo(cx + 2.5 * scale + twitch, cy - 15 * scale - bounce);
        ctx.stroke();
        // Dilated orange pupils - layered glow
        ctx.fillStyle = "rgba(251, 146, 60, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale + twitch, cy - 15 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale + twitch, cy - 15 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale + twitch, cy - 15 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale + twitch, cy - 15 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Pinprick centers
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale + twitch,
          cy - 15 * scale - bounce,
          0.25 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale + twitch,
          cy - 15 * scale - bounce,
          0.25 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Wild unkempt hair
        ctx.fillStyle = "#44403c";
        for (let i = 0; i < 7; i++) {
          const hairAngle = -Math.PI * 0.6 + i * Math.PI * 0.17;
          const hairLen = 4 * scale + Math.sin(t * 3 + i) * scale;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(hairAngle) * 5 * scale + twitch,
            cy - 18 * scale - bounce
          );
          ctx.lineTo(
            cx + Math.cos(hairAngle) * (5 + hairLen) * scale + twitch,
            cy - 18 * scale - Math.sin(hairAngle) * hairLen - bounce
          );
          ctx.lineTo(
            cx + Math.cos(hairAngle + 0.15) * 5 * scale + twitch,
            cy - 18 * scale - bounce
          );
          ctx.fill();
        }

        // GIANT coffee cup
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          cx + 10 * scale,
          cy - 4 * scale - bounce,
          5 * scale,
          10 * scale
        );
        ctx.fillStyle = "#78350f";
        ctx.fillRect(
          cx + 10 * scale,
          cy - 2 * scale - bounce,
          5 * scale,
          4 * scale
        );
        // Steam
        if (animated) {
          for (let s = 0; s < 2; s++) {
            ctx.strokeStyle = `rgba(168, 162, 158, ${0.4 - s * 0.15})`;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(
              cx + 12.5 * scale + s * 1.5 * scale,
              cy - 4 * scale - bounce
            );
            ctx.quadraticCurveTo(
              cx + 13 * scale + Math.sin(t * 2 + s) * 2 * scale,
              cy - 8 * scale - bounce,
              cx + 12 * scale + s * scale,
              cy - 10 * scale - bounce
            );
            ctx.stroke();
          }
        }
        break;
      }
      case "professor": {
        // ARCHLICH PROFESSOR - Undead master of arcane academia
        const powerPulse = 0.6 + Math.sin(t * 2) * 0.4;
        const lectureGesture = Math.sin(t * 1.5) * 0.15;

        // Crimson power aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          16 * scale
        );
        auraGrad.addColorStop(0, `rgba(239, 68, 68, ${powerPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(185, 28, 28, ${powerPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating spectral lecture notes
        if (animated) {
          for (let i = 0; i < 2; i++) {
            const noteAngle = t * 0.7 + i * Math.PI;
            const noteDist = 11 * scale;
            const nx = cx + Math.cos(noteAngle) * noteDist;
            const ny =
              cy - 2 * scale + Math.sin(noteAngle) * noteDist * 0.3 - bounce;
            ctx.save();
            ctx.translate(nx, ny);
            ctx.rotate(Math.sin(t + i) * 0.2);
            ctx.fillStyle = `rgba(254, 226, 226, ${0.6 + Math.sin(t * 2 + i) * 0.2
              })`;
            ctx.fillRect(-2 * scale, -3 * scale, 4 * scale, 6 * scale);
            ctx.strokeStyle = `rgba(127, 29, 29, 0.5)`;
            ctx.lineWidth = 0.4 * scale;
            for (let l = 0; l < 4; l++) {
              ctx.beginPath();
              ctx.moveTo(-1.5 * scale, -2 * scale + l * 1.5 * scale);
              ctx.lineTo(1.5 * scale, -2 * scale + l * 1.5 * scale);
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        // Ancient tattered tweed robes
        const robeGrad = ctx.createLinearGradient(
          cx - 10 * scale,
          cy,
          cx + 10 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#44403c");
        robeGrad.addColorStop(0.3, "#57534e");
        robeGrad.addColorStop(0.5, "#78716c");
        robeGrad.addColorStop(0.7, "#57534e");
        robeGrad.addColorStop(1, "#44403c");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 12 * scale,
          cy - bounce,
          cx - 6 * scale,
          cy - 11 * scale - bounce
        );
        ctx.lineTo(cx + 6 * scale, cy - 11 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 12 * scale,
          cy - bounce,
          cx + 10 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Leather elbow patches
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(
          cx - 10 * scale,
          cy + 2 * scale - bounce,
          2 * scale,
          3 * scale,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 10 * scale,
          cy + 2 * scale - bounce,
          2 * scale,
          3 * scale,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Crimson academic hood
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy - 5 * scale - bounce,
          cx + 6 * scale,
          cy - 9 * scale - bounce
        );
        ctx.lineTo(cx + 4 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 4 * scale - bounce);
        ctx.fill();
        // Ancient sigil on hood
        ctx.fillStyle = `rgba(254, 202, 202, ${powerPulse})`;
        ctx.font = `${4 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("⚗", cx, cy + bounce - bounce);

        // Skeletal face
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 15 * scale - bounce, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Sunken cheeks
        ctx.fillStyle = "rgba(120, 113, 108, 0.4)";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale,
          cy - 13 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale,
          cy - 13 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Ornate gold spectacles
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 16 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 16 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx - 0.5 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx + 0.5 * scale, cy - 16 * scale - bounce);
        ctx.stroke();

        // Glowing red eyes - layered glow
        ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 16 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 16 * scale - bounce, 1.6 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 1.6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 16 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Wispy white hair
        ctx.fillStyle = "#e7e5e4";
        ctx.beginPath();
        ctx.arc(
          cx - 4.5 * scale,
          cy - 19 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4.5 * scale,
          cy - 19 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Skeletal lecturing hand with magic spark
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 4 * scale - bounce);
        ctx.rotate(lectureGesture);
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(-1.5 * scale, -3 * scale, 3 * scale, 6 * scale);
        // Finger bones
        for (let f = 0; f < 3; f++) {
          ctx.fillRect(
            -1.5 * scale + f * 1.5 * scale,
            -5 * scale,
            1 * scale,
            3 * scale
          );
        }
        // Magic spark - layered glow
        ctx.fillStyle = `rgba(239, 68, 68, ${powerPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, -6 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(239, 68, 68, ${powerPulse})`;
        ctx.beginPath();
        ctx.arc(0, -6 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "dean": {
        // DARK OVERLORD DEAN - Reality-bending master of the void
        const voidPulse = 0.5 + Math.sin(t * 2) * 0.4;
        const realityWarp = Math.sin(t * 1.5) * 0.05;

        // Reality distortion aura
        ctx.save();
        ctx.translate(cx, cy - 2 * scale);
        ctx.scale(1 + realityWarp, 1 - realityWarp);
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 16 * scale);
        auraGrad.addColorStop(0, `rgba(168, 85, 247, ${voidPulse * 0.3})`);
        auraGrad.addColorStop(0.4, `rgba(126, 34, 206, ${voidPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, -bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Floating void shards
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const shardAngle = t * 0.6 + i * Math.PI * 0.5;
            const shardDist = 11 * scale + Math.sin(t * 2 + i) * 2 * scale;
            const sx = cx + Math.cos(shardAngle) * shardDist;
            const sy =
              cy - 2 * scale + Math.sin(shardAngle) * shardDist * 0.35 - bounce;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(t * 2 + i);
            ctx.fillStyle = `rgba(126, 34, 206, ${0.5 + Math.sin(t * 2 + i) * 0.2
              })`;
            ctx.beginPath();
            ctx.moveTo(0, -2 * scale);
            ctx.lineTo(1.5 * scale, 0);
            ctx.lineTo(0, 2 * scale);
            ctx.lineTo(-1.5 * scale, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }

        // Magnificent flowing robes
        const robeGrad = ctx.createLinearGradient(
          cx - 11 * scale,
          cy,
          cx + 11 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#1e1b4b");
        robeGrad.addColorStop(0.3, "#312e81");
        robeGrad.addColorStop(0.5, "#4338ca");
        robeGrad.addColorStop(0.7, "#312e81");
        robeGrad.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy + 14 * scale - bounce);
        // Flowing bottom
        ctx.lineTo(cx - 9 * scale, cy + 17 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx, cy + 18 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 17 * scale - bounce);
        ctx.lineTo(cx + 11 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 13 * scale,
          cy - bounce,
          cx + 7 * scale,
          cy - 12 * scale - bounce
        );
        ctx.lineTo(cx - 7 * scale, cy - 12 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 13 * scale,
          cy - bounce,
          cx - 11 * scale,
          cy + 14 * scale - bounce
        );
        ctx.fill();

        // Gold trim
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx - 6 * scale, cy + 10 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Ornate collar with gem
        ctx.fillStyle = "#312e81";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy - 6 * scale - bounce,
          cx + 6 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy - 5 * scale - bounce,
          cx - 5 * scale,
          cy - 8 * scale - bounce
        );
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        // Power gem - layered glow
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale - bounce, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Authoritative face
        ctx.fillStyle = "#ede9fe";
        ctx.beginPath();
        ctx.arc(cx, cy - 16 * scale - bounce, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Silver slicked hair
        ctx.fillStyle = "#a1a1aa";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 19 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 6 * scale,
          cy - 24 * scale - bounce,
          cx,
          cy - 23 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 6 * scale,
          cy - 24 * scale - bounce,
          cx + 5 * scale,
          cy - 19 * scale - bounce
        );
        ctx.lineTo(cx + 4 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 17 * scale - bounce);
        ctx.fill();

        // Floating mortarboard with power gem
        ctx.save();
        ctx.translate(cx, cy - 24 * scale - bounce + Math.sin(t) * scale);
        ctx.rotate(Math.sin(t * 0.8) * 0.06);
        ctx.fillStyle = "#1e1b4b";
        // Board
        ctx.beginPath();
        ctx.moveTo(-6 * scale, 0);
        ctx.lineTo(0, -2.5 * scale);
        ctx.lineTo(6 * scale, 0);
        ctx.lineTo(0, 2.5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        // Power gem on top - layered glow
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Glowing purple eyes of authority
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 17 * scale - bounce,
          1.2 * scale,
          1.6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2 * scale,
          cy - 17 * scale - bounce,
          1.2 * scale,
          1.6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Layered glow for eyes
        ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 17 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 17 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 17 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 17 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Stern judging mouth
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 13 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy - 13 * scale - bounce);
        ctx.stroke();
        break;
      }
      case "trustee": {
        // GILDED PLUTOCRAT - Wealth incarnate with golden power
        const goldPulse = 0.6 + Math.sin(t * 2) * 0.4;
        const coinFloat = Math.sin(t * 3) * 2 * scale;

        // Golden wealth aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          16 * scale
        );
        auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(217, 119, 6, ${goldPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating gold coins
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const coinAngle = t * 0.8 + i * Math.PI * 0.5;
            const coinDist = 10 * scale + Math.sin(t + i) * 2 * scale;
            const coinX = cx + Math.cos(coinAngle) * coinDist;
            const coinY =
              cy -
              2 * scale +
              Math.sin(coinAngle) * coinDist * 0.35 -
              bounce +
              coinFloat * (i % 2 === 0 ? 1 : -1);
            // Coin glow - layered
            ctx.fillStyle = `rgba(251, 191, 36, ${(0.7 + Math.sin(t * 2 + i) * 0.2) * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(coinX, coinY, 3.5 * scale, 2.5 * scale, t + i, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + Math.sin(t * 2 + i) * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(coinX, coinY, 2 * scale, 1.2 * scale, t + i, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Luxurious suit
        const suitGrad = ctx.createLinearGradient(
          cx - 10 * scale,
          cy,
          cx + 10 * scale,
          cy
        );
        suitGrad.addColorStop(0, "#1c1917");
        suitGrad.addColorStop(0.3, "#292524");
        suitGrad.addColorStop(0.5, "#44403c");
        suitGrad.addColorStop(0.7, "#292524");
        suitGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = suitGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 12 * scale,
          cy - bounce,
          cx - 6 * scale,
          cy - 11 * scale - bounce
        );
        ctx.lineTo(cx + 6 * scale, cy - 11 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 12 * scale,
          cy - bounce,
          cx + 10 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Golden vest
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy + 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy + 10 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 9 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        // Vest buttons
        ctx.fillStyle = "#fbbf24";
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy - 4 * scale + b * 5 * scale - bounce,
            1 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Sophisticated face
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 15 * scale - bounce, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Slicked back silver hair
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 18 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 6 * scale,
          cy - 23 * scale - bounce,
          cx,
          cy - 22 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 6 * scale,
          cy - 23 * scale - bounce,
          cx + 5 * scale,
          cy - 18 * scale - bounce
        );
        ctx.lineTo(cx + 4 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 17 * scale - bounce);
        ctx.fill();

        // Magnificent top hat
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(
          cx - 5 * scale,
          cy - 30 * scale - bounce,
          10 * scale,
          9 * scale
        );
        ctx.fillRect(
          cx - 7 * scale,
          cy - 22 * scale - bounce,
          14 * scale,
          2 * scale
        );
        // Golden hat band - layered glow
        ctx.fillStyle = "rgba(251, 191, 36, 0.3)";
        ctx.fillRect(cx - 6 * scale, cy - 26 * scale - bounce, 12 * scale, 4 * scale);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(cx - 5 * scale, cy - 25 * scale - bounce, 10 * scale, 2 * scale);

        // Golden monocle - layered glow
        ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5.5 * scale, cy - 16 * scale - bounce);
        ctx.quadraticCurveTo(cx + 8 * scale, cy - 14 * scale - bounce, cx + 9 * scale, cy - 10 * scale - bounce);
        ctx.stroke();

        // Calculating eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 16 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 16 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Layered glow for eyes
        ctx.fillStyle = "rgba(251, 191, 36, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 16 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 16 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 16 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Distinguished mustache
        ctx.fillStyle = "#4b5563";
        ctx.beginPath();
        ctx.moveTo(cx - 3.5 * scale, cy - 12 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 5 * scale,
          cy - 13 * scale - bounce,
          cx - 5 * scale,
          cy - 11 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx - 4 * scale,
          cy - 11.5 * scale - bounce,
          cx,
          cy - 12 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 4 * scale,
          cy - 11.5 * scale - bounce,
          cx + 5 * scale,
          cy - 11 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 5 * scale,
          cy - 13 * scale - bounce,
          cx + 3.5 * scale,
          cy - 12 * scale - bounce
        );
        ctx.fill();

        // Smug thin smile
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 11 * scale - bounce,
          2 * scale,
          0.15 * Math.PI,
          0.85 * Math.PI
        );
        ctx.stroke();
        break;
      }
      case "mascot": {
        // CHAOS GRIFFIN - Rival mascot as a magnificent spectral beast
        const wingFlap = Math.sin(t * 8) * 0.4;
        const floatOffset = Math.sin(t * 3) * 2 * scale;
        const flamePulse = 0.6 + Math.sin(t * 4) * 0.4;

        // Spectral cyan aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          16 * scale
        );
        auraGrad.addColorStop(0, `rgba(34, 211, 211, ${flamePulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(6, 182, 212, ${flamePulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 2 * scale - bounce + floatOffset,
          16 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Magnificent wings
        ctx.save();
        ctx.translate(cx - 6 * scale, cy - 4 * scale - bounce + floatOffset);
        ctx.rotate(-0.5 - wingFlap);
        ctx.fillStyle = "#0891b2";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10 * scale, -6 * scale, -14 * scale, 0);
        ctx.quadraticCurveTo(-10 * scale, 3 * scale, 0, 2 * scale);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 6 * scale, cy - 4 * scale - bounce + floatOffset);
        ctx.rotate(0.5 + wingFlap);
        ctx.fillStyle = "#0891b2";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(10 * scale, -6 * scale, 14 * scale, 0);
        ctx.quadraticCurveTo(10 * scale, 3 * scale, 0, 2 * scale);
        ctx.fill();
        ctx.restore();

        // Lion body
        ctx.fillStyle = "#22d3d3";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 2 * scale - bounce + floatOffset,
          7 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Eagle head
        ctx.fillStyle = "#5eead4";
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 10 * scale - bounce + floatOffset,
          6 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Fierce beak
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10 * scale - bounce + floatOffset);
        ctx.lineTo(cx - 2 * scale, cy - 7 * scale - bounce + floatOffset);
        ctx.lineTo(cx, cy - 4 * scale - bounce + floatOffset);
        ctx.lineTo(cx + 2 * scale, cy - 7 * scale - bounce + floatOffset);
        ctx.closePath();
        ctx.fill();

        // Glowing eyes - layered glow
        ctx.fillStyle = "rgba(34, 211, 211, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 12 * scale - bounce + floatOffset, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 12 * scale - bounce + floatOffset, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(34, 211, 211, 0.6)";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 12 * scale - bounce + floatOffset, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 12 * scale - bounce + floatOffset, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 12 * scale - bounce + floatOffset, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, cy - 12 * scale - bounce + floatOffset, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "archer": {
        // SHADOW HUNTER - Dark elven ranger with spectral bow
        const drawPull = Math.sin(t * 2) * 0.15;
        const glowPulse = 0.6 + Math.sin(t * 2.5) * 0.4;
        const cloakWave = Math.sin(t * 1.5) * 0.05;

        // Green spectral aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(16, 185, 129, ${glowPulse * 0.2})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Flowing shadow cloak
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(cloakWave);
        const cloakGrad = ctx.createLinearGradient(
          -8 * scale,
          -10 * scale,
          8 * scale,
          14 * scale
        );
        cloakGrad.addColorStop(0, "#064e3b");
        cloakGrad.addColorStop(0.3, "#065f46");
        cloakGrad.addColorStop(0.6, "#047857");
        cloakGrad.addColorStop(1, "#064e3b");
        ctx.fillStyle = cloakGrad;
        ctx.beginPath();
        ctx.moveTo(-9 * scale, 14 * scale - bounce);
        // Tattered bottom
        ctx.lineTo(-7 * scale, 16 * scale - bounce);
        ctx.lineTo(-4 * scale, 13 * scale - bounce);
        ctx.lineTo(0, 17 * scale - bounce);
        ctx.lineTo(4 * scale, 13 * scale - bounce);
        ctx.lineTo(7 * scale, 16 * scale - bounce);
        ctx.lineTo(9 * scale, 14 * scale - bounce);
        ctx.quadraticCurveTo(10 * scale, 0, 5 * scale, -10 * scale - bounce);
        ctx.lineTo(-5 * scale, -10 * scale - bounce);
        ctx.quadraticCurveTo(-10 * scale, 0, -9 * scale, 14 * scale - bounce);
        ctx.fill();
        ctx.restore();

        // Dark leather armor underneath
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 2 * scale - bounce,
          5 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Deep hood
        ctx.fillStyle = "#022c22";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale - bounce,
          7 * scale,
          5 * scale,
          0,
          Math.PI,
          0
        );
        ctx.fill();

        // Pale shadowed face
        ctx.fillStyle = "#d1fae5";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing emerald eyes - layered glow
        ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Slit pupils
        ctx.fillStyle = "#022c22";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 15 * scale - bounce,
          0.4 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2 * scale,
          cy - 15 * scale - bounce,
          0.4 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Elven ears
        ctx.fillStyle = "#d1fae5";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx - 8 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy - 13 * scale - bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 13 * scale - bounce);
        ctx.fill();

        // Spectral bow - glowing green energy - layered glow
        ctx.strokeStyle = `rgba(16, 185, 129, ${glowPulse * 0.3})`;
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 2 * scale - bounce, 9 * scale, -0.8, 0.8);
        ctx.stroke();
        ctx.strokeStyle = `rgba(16, 185, 129, ${glowPulse})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 2 * scale - bounce, 9 * scale, -0.8, 0.8);
        ctx.stroke();

        // Ethereal bowstring
        ctx.strokeStyle = `rgba(167, 243, 208, ${0.8 + drawPull * 2})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(
          cx + 11 * scale + Math.cos(-0.8) * 9 * scale,
          cy - 2 * scale - bounce + Math.sin(-0.8) * 9 * scale
        );
        ctx.lineTo(
          cx + 9 * scale - drawPull * 24 * scale,
          cy - 2 * scale - bounce
        );
        ctx.lineTo(
          cx + 11 * scale + Math.cos(0.8) * 9 * scale,
          cy - 2 * scale - bounce + Math.sin(0.8) * 9 * scale
        );
        ctx.stroke();

        // Spectral arrow - green energy - layered glow
        ctx.fillStyle = `rgba(16, 185, 129, ${glowPulse * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(cx + 13 * scale - drawPull * 22 * scale, cy - 2 * scale - bounce, 6 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(16, 185, 129, ${glowPulse})`;
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale - drawPull * 22 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 17 * scale - drawPull * 22 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 19 * scale - drawPull * 22 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 17 * scale - drawPull * 22 * scale, cy - 3.5 * scale - bounce);
        ctx.fill();
        break;
      }
      case "mage": {
        // MAGE PROFESSOR - Powerful spellcaster with arcane staff
        const magicPulse = 0.6 + Math.sin(t * 3) * 0.4;
        const orbFloat = Math.sin(t * 2) * 2 * scale;

        // Purple magic aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(139, 92, 246, ${magicPulse * 0.25})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Flowing purple robes
        const robeGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#4c1d95");
        robeGrad.addColorStop(0.5, "#7c3aed");
        robeGrad.addColorStop(1, "#4c1d95");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 11 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 11 * scale,
          cy - bounce,
          cx + 9 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Wizard hat
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx, cy - 30 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 16 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(
          cx - 7 * scale,
          cy - 17 * scale - bounce,
          14 * scale,
          2 * scale
        );

        // Face
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing purple eyes - layered glow
        ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale, cy - 14 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy - 14 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale, cy - 14 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy - 14 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Staff with glowing orb
        ctx.fillStyle = "#78350f";
        ctx.fillRect(
          cx + 10 * scale,
          cy - 10 * scale - bounce,
          2 * scale,
          20 * scale
        );
        // Staff orb - layered glow
        ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 12 * scale - bounce + orbFloat, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 12 * scale - bounce + orbFloat, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 12 * scale - bounce + orbFloat, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "catapult": {
        // DOOM TREBUCHET - Infernal siege engine with demonic power
        const armSwing = Math.sin(t * 1.5) * 0.12;
        const firePulse = 0.6 + Math.sin(t * 3) * 0.4;
        const rumble = animated ? Math.sin(t * 6) * 0.5 * scale : 0;

        // Infernal energy aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 4 * scale,
          0,
          cx,
          cy - 4 * scale,
          16 * scale
        );
        auraGrad.addColorStop(0, `rgba(133, 77, 14, ${firePulse * 0.2})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx + rumble, cy - 4 * scale - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dark iron frame base
        const baseGrad = ctx.createLinearGradient(
          cx - 12 * scale,
          cy,
          cx + 12 * scale,
          cy
        );
        baseGrad.addColorStop(0, "#1c1917");
        baseGrad.addColorStop(0.3, "#44403c");
        baseGrad.addColorStop(0.5, "#57534e");
        baseGrad.addColorStop(0.7, "#44403c");
        baseGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale + rumble, cy + 12 * scale - bounce);
        ctx.lineTo(cx - 13 * scale + rumble, cy + 2 * scale - bounce);
        ctx.lineTo(cx + 13 * scale + rumble, cy + 2 * scale - bounce);
        ctx.lineTo(cx + 11 * scale + rumble, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Skull decorations
        ctx.fillStyle = "#d6d3d1";
        ctx.beginPath();
        ctx.arc(
          cx - 8 * scale + rumble,
          cy + 4 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 8 * scale + rumble,
          cy + 4 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Skull eye sockets
        ctx.fillStyle = `rgba(133, 77, 14, ${firePulse})`;
        ctx.beginPath();
        ctx.arc(
          cx - 8.5 * scale + rumble,
          cy + 3.5 * scale - bounce,
          0.6 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx - 7.5 * scale + rumble,
          cy + 3.5 * scale - bounce,
          0.6 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 7.5 * scale + rumble,
          cy + 3.5 * scale - bounce,
          0.6 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 8.5 * scale + rumble,
          cy + 3.5 * scale - bounce,
          0.6 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Spiked iron wheels
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.arc(
          cx - 8 * scale + rumble,
          cy + 10 * scale - bounce,
          4.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 8 * scale + rumble,
          cy + 10 * scale - bounce,
          4.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Wheel spikes
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.fillStyle = "#44403c";
          ctx.beginPath();
          ctx.moveTo(
            cx - 8 * scale + Math.cos(angle) * 3 * scale + rumble,
            cy + 10 * scale + Math.sin(angle) * 3 * scale - bounce
          );
          ctx.lineTo(
            cx - 8 * scale + Math.cos(angle) * 6 * scale + rumble,
            cy + 10 * scale + Math.sin(angle) * 6 * scale - bounce
          );
          ctx.lineTo(
            cx - 8 * scale + Math.cos(angle + 0.2) * 3 * scale + rumble,
            cy + 10 * scale + Math.sin(angle + 0.2) * 3 * scale - bounce
          );
          ctx.fill();
        }
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(
          cx - 8 * scale + rumble,
          cy + 10 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 8 * scale + rumble,
          cy + 10 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Demonic trebuchet arm
        ctx.save();
        ctx.translate(cx + rumble, cy + bounce - bounce);
        ctx.rotate(-0.5 + armSwing);

        // Main arm - dark iron
        const armGrad = ctx.createLinearGradient(-3 * scale, 0, 3 * scale, 0);
        armGrad.addColorStop(0, "#1c1917");
        armGrad.addColorStop(0.5, "#57534e");
        armGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = armGrad;
        ctx.fillRect(-3 * scale, -18 * scale, 6 * scale, 22 * scale);

        // Glowing runes on arm
        ctx.fillStyle = `rgba(133, 77, 14, ${firePulse * 0.8})`;
        ctx.font = `${3 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("⚔", 0, -8 * scale);

        // Massive counterweight - demonic face
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.arc(0, 4 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Counterweight eyes - layered glow
        ctx.fillStyle = `rgba(133, 77, 14, ${firePulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(-2 * scale, 3 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.arc(2 * scale, 3 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(133, 77, 14, ${firePulse})`;
        ctx.beginPath();
        ctx.arc(-2 * scale, 3 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.arc(2 * scale, 3 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Fiery projectile sling
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(0, -16 * scale, 4 * scale, 0, Math.PI);
        ctx.fill();

        // Infernal projectile - flaming boulder
        const projGrad = ctx.createRadialGradient(
          0,
          -16 * scale,
          0,
          0,
          -16 * scale,
          3 * scale
        );
        projGrad.addColorStop(0, "#fbbf24");
        projGrad.addColorStop(0.5, "#f97316");
        projGrad.addColorStop(1, "#854d0e");
        // Projectile glow - layered
        ctx.fillStyle = "rgba(249, 115, 22, 0.3)";
        ctx.beginPath();
        ctx.arc(0, -16 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(249, 115, 22, 0.5)";
        ctx.beginPath();
        ctx.arc(0, -16 * scale, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = projGrad;
        ctx.beginPath();
        ctx.arc(0, -16 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Flames around projectile
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const flameAngle = (i * Math.PI * 2) / 5 + t * 2;
            ctx.fillStyle = `rgba(251, 191, 36, ${firePulse * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(
              Math.cos(flameAngle) * 3 * scale,
              -16 * scale + Math.sin(flameAngle) * 3 * scale
            );
            ctx.lineTo(
              Math.cos(flameAngle) * 5 * scale,
              -16 * scale + Math.sin(flameAngle) * 5 * scale
            );
            ctx.lineTo(
              Math.cos(flameAngle + 0.3) * 3 * scale,
              -16 * scale + Math.sin(flameAngle + 0.3) * 3 * scale
            );
            ctx.fill();
          }
        }

        ctx.restore();

        // Support frame with spikes
        ctx.fillStyle = "#44403c";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale + rumble, cy + 2 * scale - bounce);
        ctx.lineTo(cx + rumble, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 5 * scale + rumble, cy + 2 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        // Spike on top
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.moveTo(cx + rumble, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 1 * scale + rumble, cy - 11 * scale - bounce);
        ctx.lineTo(cx + 1 * scale + rumble, cy - 11 * scale - bounce);
        ctx.fill();
        break;
      }
      case "warlock": {
        // DARK WARLOCK - Cloaked spellcaster with void magic
        const voidPulse = 0.6 + Math.sin(t * 2.5) * 0.4;

        // Purple void aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(124, 58, 237, ${voidPulse * 0.3})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dark flowing robes
        const robeGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#1e1b4b");
        robeGrad.addColorStop(0.5, "#4c1d95");
        robeGrad.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 11 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 11 * scale,
          cy - bounce,
          cx + 9 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Hood
        ctx.fillStyle = "#0f0a1a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale - bounce,
          7 * scale,
          5 * scale,
          0,
          Math.PI,
          0
        );
        ctx.fill();

        // Shadowed face with glowing eyes
        ctx.fillStyle = "#1a0a2e";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eyes - layered glow
        ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 15 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 15 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 15 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 15 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Magic orb in hand - layered glow
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx + 10 * scale, cy + 2 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx + 10 * scale, cy + 2 * scale - bounce, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse})`;
        ctx.beginPath();
        ctx.arc(cx + 10 * scale, cy + 2 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "crossbowman": {
        // VOID ARBALIST - Dark mechanical crossbow wielder
        const aimSway = Math.sin(t * 2) * 0.08;
        const glowPulse = 0.5 + Math.sin(t * 3) * 0.3;
        const mechPulse = 0.6 + Math.sin(t * 4) * 0.2;

        // Dark energy aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          13 * scale
        );
        auraGrad.addColorStop(0, `rgba(120, 113, 108, ${glowPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 13 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Heavy plate armor
        const armorGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy - 10 * scale,
          cx + 9 * scale,
          cy + 12 * scale
        );
        armorGrad.addColorStop(0, "#1c1917");
        armorGrad.addColorStop(0.3, "#44403c");
        armorGrad.addColorStop(0.5, "#57534e");
        armorGrad.addColorStop(0.7, "#44403c");
        armorGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 12 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Armor trim
        ctx.strokeStyle = "#78716c";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 10 * scale - bounce);
        ctx.moveTo(cx + 4 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Armored helm with visor
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 14 * scale - bounce,
          6 * scale,
          5.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Visor slit
        ctx.fillStyle = "#0f0a0a";
        ctx.fillRect(
          cx - 4 * scale,
          cy - 15 * scale - bounce,
          8 * scale,
          2 * scale
        );

        // Glowing eyes through visor - layered glow
        ctx.fillStyle = `rgba(168, 162, 158, ${glowPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(168, 162, 158, ${glowPulse})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Helm crest
        ctx.fillStyle = "#44403c";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 19 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy - 15 * scale - bounce);
        ctx.fill();

        // Massive mechanical crossbow
        ctx.save();
        ctx.translate(cx + 9 * scale, cy - 2 * scale - bounce);
        ctx.rotate(aimSway);

        // Main stock - dark wood with metal
        ctx.fillStyle = "#292524";
        ctx.fillRect(-2 * scale, -2.5 * scale, 10 * scale, 5 * scale);

        // Metal frame
        ctx.strokeStyle = "#78716c";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -7 * scale);
        ctx.lineTo(2 * scale, -3 * scale);
        ctx.moveTo(0, 7 * scale);
        ctx.lineTo(2 * scale, 3 * scale);
        ctx.stroke();

        // Crossbow limbs - dark metal
        ctx.fillStyle = "#44403c";
        ctx.beginPath();
        ctx.moveTo(0, -7 * scale);
        ctx.quadraticCurveTo(-6 * scale, -8 * scale, -4 * scale, -3 * scale);
        ctx.lineTo(0, -3 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 7 * scale);
        ctx.quadraticCurveTo(-6 * scale, 8 * scale, -4 * scale, 3 * scale);
        ctx.lineTo(0, 3 * scale);
        ctx.fill();

        // Taut string
        ctx.strokeStyle = "#d6d3d1";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(-4 * scale, -3 * scale);
        ctx.lineTo(2 * scale, 0);
        ctx.lineTo(-4 * scale, 3 * scale);
        ctx.stroke();

        // Glowing bolt - layered glow
        ctx.fillStyle = `rgba(120, 113, 108, ${mechPulse * 0.3})`;
        ctx.fillRect(1 * scale, -2 * scale, 10 * scale, 4 * scale);
        ctx.fillStyle = `rgba(120, 113, 108, ${mechPulse})`;
        ctx.fillRect(2 * scale, -0.8 * scale, 8 * scale, 1.6 * scale);

        // Bolt tip
        ctx.fillStyle = "#d6d3d1";
        ctx.beginPath();
        ctx.moveTo(10 * scale, 0);
        ctx.lineTo(12 * scale, 0);
        ctx.lineTo(10 * scale, -1.5 * scale);
        ctx.fill();

        ctx.restore();
        break;
      }
      case "hexer": {
        // VOID WITCH QUEEN - Ancient crone channeling eldritch curse magic
        const hexPulse = 0.6 + Math.sin(t * 2) * 0.4;
        const runeFloat = Math.sin(t * 1.5) * 2 * scale;
        const hatSway = Math.sin(t * 2) * 0.04;
        const chainRattle = Math.sin(t * 6) * scale * 0.5;
        const cloakBillow = Math.sin(t * 1.2) * 0.08;
        const orbRotation = t * 1.5;

        // Outer void aura - dark energy field
        const outerAura = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 22 * scale);
        outerAura.addColorStop(0, `rgba(147, 51, 234, ${hexPulse * 0.15})`);
        outerAura.addColorStop(0.4, `rgba(88, 28, 135, ${hexPulse * 0.1})`);
        outerAura.addColorStop(0.7, `rgba(59, 7, 100, ${hexPulse * 0.05})`);
        outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Inner hex aura - pulsing pink energy
        const innerAura = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 14 * scale);
        innerAura.addColorStop(0, `rgba(236, 72, 153, ${hexPulse * 0.35})`);
        innerAura.addColorStop(0.5, `rgba(190, 24, 93, ${hexPulse * 0.2})`);
        innerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating spectral chains
        if (animated) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(t * 3) * 0.2})`;
          ctx.lineWidth = 1.5 * scale;
          for (let i = 0; i < 3; i++) {
            const chainAngle = t * 0.6 + i * Math.PI * 0.67;
            const chainDist = 13 * scale;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              const cx2 = cx + Math.cos(chainAngle + j * 0.3) * (chainDist - j * 2 * scale);
              const cy2 = cy - 5 * scale + Math.sin(chainAngle + j * 0.3) * chainDist * 0.3 - bounce + chainRattle;
              if (j === 0) ctx.moveTo(cx2, cy2);
              else ctx.lineTo(cx2, cy2);
            }
            ctx.stroke();
          }
        }

        // Floating curse runes - orbiting sigils
        if (animated) {
          for (let i = 0; i < 6; i++) {
            const runeAngle = orbRotation + i * Math.PI / 3;
            const runeDist = 12 * scale + Math.sin(t * 2 + i) * 2 * scale;
            const rx = cx + Math.cos(runeAngle) * runeDist;
            const ry = cy - 4 * scale + Math.sin(runeAngle) * runeDist * 0.3 - bounce + runeFloat * (i % 2 === 0 ? 1 : -1);
            const runeAlpha = 0.5 + Math.sin(t * 2 + i) * 0.3;
            // Rune glow
            ctx.fillStyle = `rgba(236, 72, 153, ${runeAlpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(rx, ry, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Rune symbol
            ctx.fillStyle = `rgba(236, 72, 153, ${runeAlpha})`;
            ctx.font = `${4 * scale}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(["⚝", "☽", "◇", "✧", "⚶", "☿"][i], rx, ry);
          }
        }

        // Massive billowing robes - layered
        ctx.save();
        ctx.translate(cx, cy - bounce);
        ctx.rotate(cloakBillow);
        // Outer robe layer - tattered edges
        const outerRobeGrad = ctx.createLinearGradient(-12 * scale, -12 * scale, 12 * scale, 18 * scale);
        outerRobeGrad.addColorStop(0, "#1e1b4b");
        outerRobeGrad.addColorStop(0.3, "#312e81");
        outerRobeGrad.addColorStop(0.6, "#3b0764");
        outerRobeGrad.addColorStop(1, "#0f0a1a");
        ctx.fillStyle = outerRobeGrad;
        ctx.beginPath();
        ctx.moveTo(-12 * scale, 14 * scale);
        // Extremely tattered bottom with many points
        for (let i = 0; i < 8; i++) {
          const x = -12 * scale + i * 3 * scale;
          const y = 14 * scale + (i % 2 === 0 ? 5 * scale : 8 * scale) + Math.sin(t * 2 + i) * scale;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(12 * scale, 14 * scale);
        ctx.quadraticCurveTo(15 * scale, 2 * scale, 7 * scale, -10 * scale);
        ctx.lineTo(-7 * scale, -10 * scale);
        ctx.quadraticCurveTo(-15 * scale, 2 * scale, -12 * scale, 14 * scale);
        ctx.fill();
        ctx.restore();

        // Inner robe with arcane patterns
        const innerRobeGrad = ctx.createLinearGradient(cx - 8 * scale, cy - 8 * scale, cx + 8 * scale, cy + 12 * scale);
        innerRobeGrad.addColorStop(0, "#581c87");
        innerRobeGrad.addColorStop(0.5, "#7e22ce");
        innerRobeGrad.addColorStop(1, "#4c1d95");
        ctx.fillStyle = innerRobeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 12 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx + 10 * scale, cy - bounce, cx + 5 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx - 10 * scale, cy - bounce, cx - 8 * scale, cy + 12 * scale - bounce);
        ctx.fill();

        // Arcane rune embroidery on robes
        ctx.strokeStyle = `rgba(236, 72, 153, ${hexPulse * 0.5})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx, cy + 6 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 2 * scale - bounce);
        ctx.stroke();
        // Additional rune lines
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4 * scale - bounce);
        ctx.lineTo(cx, cy + 8 * scale - bounce);
        ctx.stroke();

        // Ornate belt with skull buckle
        ctx.fillStyle = "#be185d";
        ctx.fillRect(cx - 7 * scale, cy - 5 * scale - bounce, 14 * scale, 2.5 * scale);
        // Skull buckle
        ctx.fillStyle = "#fce7f3";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4 * scale - bounce, 2 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.arc(cx - 0.6 * scale, cy - 4.2 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 0.6 * scale, cy - 4.2 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Crooked witch hat - more detailed
        ctx.save();
        ctx.translate(cx, cy - 17 * scale - bounce);
        ctx.rotate(hatSway);
        // Hat main body - gradient
        const hatGrad = ctx.createLinearGradient(0, 0, 0, -18 * scale);
        hatGrad.addColorStop(0, "#1e1b4b");
        hatGrad.addColorStop(0.5, "#312e81");
        hatGrad.addColorStop(1, "#0f0a1a");
        ctx.fillStyle = hatGrad;
        ctx.beginPath();
        ctx.moveTo(-9 * scale, 0);
        ctx.quadraticCurveTo(-4 * scale, -6 * scale, -2 * scale, -12 * scale);
        ctx.quadraticCurveTo(0, -16 * scale, 3 * scale, -18 * scale);
        ctx.quadraticCurveTo(4 * scale, -12 * scale, 9 * scale, 0);
        ctx.closePath();
        ctx.fill();
        // Hat wrinkles/folds
        ctx.strokeStyle = "#4c1d95";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, -2 * scale);
        ctx.quadraticCurveTo(-2 * scale, -5 * scale, 0, -10 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5 * scale, -1 * scale);
        ctx.quadraticCurveTo(3 * scale, -6 * scale, 2 * scale, -14 * scale);
        ctx.stroke();
        // Hat band with gems
        ctx.fillStyle = "#be185d";
        ctx.fillRect(-9 * scale, -2 * scale, 18 * scale, 3 * scale);
        // Gems on band
        ctx.fillStyle = "#f472b6";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(-5 * scale + i * 5 * scale, -0.5 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        // Hat brim - detailed
        ctx.fillStyle = "#0f0a1a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 11 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(0, -0.5 * scale, 10 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Multiple dangling charms
        for (let i = 0; i < 3; i++) {
          const charmX = -4 * scale + i * 4 * scale;
          const charmY = -14 * scale + i * 2 * scale + Math.sin(t * 3 + i) * scale;
          const charmSize = (1.2 + i * 0.3) * scale;
          // Charm chain
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(charmX, -2 * scale);
          ctx.lineTo(charmX, charmY + charmSize);
          ctx.stroke();
          // Charm glow
          ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(charmX, charmY, charmSize * 2, 0, Math.PI * 2);
          ctx.fill();
          // Charm
          ctx.fillStyle = ["#ec4899", "#a855f7", "#f472b6"][i];
          ctx.beginPath();
          ctx.arc(charmX, charmY, charmSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Long wild hair flowing from under hat
        ctx.fillStyle = "#4a044e";
        for (let i = 0; i < 8; i++) {
          const hairAngle = -Math.PI * 0.4 + i * Math.PI * 0.1;
          const hairLen = 10 * scale + Math.sin(t * 2 + i) * 2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(hairAngle) * 5 * scale, cy - 14 * scale - bounce);
          ctx.quadraticCurveTo(
            cx + Math.cos(hairAngle) * 8 * scale + Math.sin(t + i) * scale,
            cy - 10 * scale - bounce,
            cx + Math.cos(hairAngle) * 6 * scale + Math.sin(t * 1.5 + i) * 2 * scale,
            cy - 14 * scale + hairLen - bounce
          );
          ctx.lineTo(cx + Math.cos(hairAngle + 0.1) * 5 * scale, cy - 14 * scale - bounce);
          ctx.fill();
        }

        // Gaunt pale face with curse marks
        ctx.fillStyle = "#fce7f3";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 13 * scale - bounce, 5 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Curse marks/veins on face
        ctx.strokeStyle = `rgba(147, 51, 234, ${0.4 + hexPulse * 0.3})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 2 * scale, cy - 10 * scale - bounce, cx - 3 * scale, cy - 8 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 12 * scale - bounce);
        ctx.quadraticCurveTo(cx + 2 * scale, cy - 10 * scale - bounce, cx + 3 * scale, cy - 8 * scale - bounce);
        ctx.stroke();

        // Deep hollowed cheeks
        ctx.fillStyle = "rgba(91, 33, 182, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 11 * scale - bounce, 1.8 * scale, 2.5 * scale, 0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 11 * scale - bounce, 1.8 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Glowing malevolent eyes - more detailed
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 14 * scale - bounce, 1.8 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 14 * scale - bounce, 1.8 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye glow outer
        ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 14 * scale - bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 14 * scale - bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Iris
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 14 * scale - bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 14 * scale - bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Slit pupils
        ctx.fillStyle = "#0f0a1a";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 14 * scale - bounce, 0.3 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 14 * scale - bounce, 0.3 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlights
        ctx.fillStyle = "#fdf4ff";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 14.5 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy - 14.5 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hooked nose
        ctx.fillStyle = "#f5d0fe";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 13 * scale - bounce);
        ctx.quadraticCurveTo(cx + 1.5 * scale, cy - 11 * scale - bounce, cx, cy - 9.5 * scale - bounce);
        ctx.quadraticCurveTo(cx - 0.5 * scale, cy - 10 * scale - bounce, cx, cy - 13 * scale - bounce);
        ctx.fill();

        // Wicked grin with teeth
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(cx, cy - 9 * scale - bounce, 2.5 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();
        // Sharp teeth
        ctx.fillStyle = "#fce7f3";
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 2 * scale + i * scale, cy - 9 * scale - bounce);
          ctx.lineTo(cx - 1.5 * scale + i * scale, cy - 7.5 * scale - bounce);
          ctx.lineTo(cx - 1 * scale + i * scale, cy - 9 * scale - bounce);
          ctx.fill();
        }

        // Gnarled hands/claws
        ctx.fillStyle = "#fce7f3";
        // Left hand on staff
        ctx.beginPath();
        ctx.ellipse(cx - 9 * scale, cy + 2 * scale - bounce, 2 * scale, 1.5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Clawed fingers
        ctx.fillStyle = "#4a044e";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale + i * scale, cy + 2 * scale - bounce);
          ctx.lineTo(cx - 11 * scale + i * scale, cy + 4 * scale - bounce);
          ctx.lineTo(cx - 9.5 * scale + i * scale, cy + 2.5 * scale - bounce);
          ctx.fill();
        }

        // Ornate staff with multiple crystals
        ctx.save();
        ctx.translate(cx - 10 * scale, cy - bounce);
        // Staff shaft - gnarled wood
        const staffGrad = ctx.createLinearGradient(0, -20 * scale, 0, 16 * scale);
        staffGrad.addColorStop(0, "#4a044e");
        staffGrad.addColorStop(0.5, "#581c87");
        staffGrad.addColorStop(1, "#3b0764");
        ctx.fillStyle = staffGrad;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, 16 * scale);
        ctx.quadraticCurveTo(-2 * scale, 0, -1 * scale, -15 * scale);
        ctx.lineTo(1 * scale, -15 * scale);
        ctx.quadraticCurveTo(2 * scale, 0, 1.5 * scale, 16 * scale);
        ctx.fill();
        // Staff knots
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.ellipse(0, -5 * scale, 2 * scale, 1 * scale, 0.2, 0, Math.PI * 2);
        ctx.ellipse(0, 5 * scale, 1.8 * scale, 1 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        // Staff head - twisted
        ctx.fillStyle = "#581c87";
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -15 * scale);
        ctx.quadraticCurveTo(-4 * scale, -18 * scale, -2 * scale, -22 * scale);
        ctx.quadraticCurveTo(0, -25 * scale, 2 * scale, -22 * scale);
        ctx.quadraticCurveTo(4 * scale, -18 * scale, 2 * scale, -15 * scale);
        ctx.fill();
        // Main crystal - glow layers
        ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, -22 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(0, -22 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Crystal shape
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.moveTo(0, -26 * scale);
        ctx.lineTo(-2.5 * scale, -22 * scale);
        ctx.lineTo(0, -18 * scale);
        ctx.lineTo(2.5 * scale, -22 * scale);
        ctx.closePath();
        ctx.fill();
        // Crystal highlight
        ctx.fillStyle = "#fdf4ff";
        ctx.beginPath();
        ctx.moveTo(-0.5 * scale, -25 * scale);
        ctx.lineTo(-1.5 * scale, -22 * scale);
        ctx.lineTo(-0.5 * scale, -20 * scale);
        ctx.fill();
        // Small orbiting crystals
        for (let i = 0; i < 3; i++) {
          const crystalAngle = t * 2 + i * Math.PI * 0.67;
          const crystalX = Math.cos(crystalAngle) * 4 * scale;
          const crystalY = -22 * scale + Math.sin(crystalAngle) * 2 * scale;
          ctx.fillStyle = `rgba(168, 85, 247, ${0.6 + Math.sin(t * 3 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(crystalX, crystalY, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Curse orb in right hand - more detailed
        const orbX = cx + 12 * scale;
        const orbY = cy + scale - bounce;
        // Outer glow rings
        ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(236, 72, 153, ${hexPulse * 0.7})`;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Orb core
        const orbGrad = ctx.createRadialGradient(orbX - scale, orbY - scale, 0, orbX, orbY, 3 * scale);
        orbGrad.addColorStop(0, "#fdf4ff");
        orbGrad.addColorStop(0.3, "#f472b6");
        orbGrad.addColorStop(0.7, "#db2777");
        orbGrad.addColorStop(1, "#9d174d");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Swirling energy inside
        ctx.strokeStyle = `rgba(253, 244, 255, ${hexPulse * 0.6})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 1.5 * scale, t * 2, t * 2 + Math.PI);
        ctx.stroke();
        // Right hand holding orb
        ctx.fillStyle = "#fce7f3";
        ctx.beginPath();
        ctx.ellipse(orbX - 2 * scale, orbY + 2 * scale, 2 * scale, 1.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "harpy": {
        // STORM PHOENIX HARPY - Majestic terror of the skies with ember feathers
        const wingFlap = Math.sin(t * 8) * 0.5;
        const flamePulse = 0.6 + Math.sin(t * 4) * 0.4;
        const screechPulse = Math.sin(t * 5) * 0.15;
        const breathe = Math.sin(t * 2) * scale * 0.3;
        const headTilt = Math.sin(t * 1.5) * 0.08;
        const tailSway = Math.sin(t * 3) * 0.2;
        const emberFloat = t * 2;

        // Trailing ember particles
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const emberAge = (emberFloat + i * 0.5) % 3;
            const emberX = cx + Math.sin(t * 2 + i * 1.2) * 8 * scale;
            const emberY = cy + 8 * scale + emberAge * 6 * scale - bounce;
            const emberAlpha = Math.max(0, 0.8 - emberAge * 0.3);
            const emberSize = (1.5 - emberAge * 0.4) * scale;
            if (emberAlpha > 0) {
              ctx.fillStyle = `rgba(251, 191, 36, ${emberAlpha * 0.5})`;
              ctx.beginPath();
              ctx.arc(emberX, emberY, emberSize * 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = `rgba(251, 191, 36, ${emberAlpha})`;
              ctx.beginPath();
              ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Multi-layer flame aura
        const outerAura = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 22 * scale);
        outerAura.addColorStop(0, `rgba(251, 146, 60, ${flamePulse * 0.15})`);
        outerAura.addColorStop(0.5, `rgba(234, 88, 12, ${flamePulse * 0.08})`);
        outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        const innerAura = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 14 * scale);
        innerAura.addColorStop(0, `rgba(249, 115, 22, ${flamePulse * 0.3})`);
        innerAura.addColorStop(0.6, `rgba(234, 88, 12, ${flamePulse * 0.12})`);
        innerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Magnificent burning tail feathers
        ctx.save();
        ctx.translate(cx, cy + 8 * scale - bounce);
        ctx.rotate(tailSway);
        for (let i = 0; i < 7; i++) {
          const tailAngle = -0.4 + i * 0.13;
          const tailLen = 14 * scale + Math.sin(t * 3 + i) * 2 * scale;
          ctx.save();
          ctx.rotate(tailAngle);
          // Feather base
          const tailGrad = ctx.createLinearGradient(0, 0, 0, tailLen);
          tailGrad.addColorStop(0, "#c2410c");
          tailGrad.addColorStop(0.4, "#ea580c");
          tailGrad.addColorStop(0.7, "#f97316");
          tailGrad.addColorStop(1, "#fbbf24");
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.moveTo(-1.5 * scale, 0);
          ctx.quadraticCurveTo(-2 * scale, tailLen * 0.5, -0.5 * scale, tailLen);
          ctx.lineTo(0.5 * scale, tailLen);
          ctx.quadraticCurveTo(2 * scale, tailLen * 0.5, 1.5 * scale, 0);
          ctx.fill();
          // Feather center line
          ctx.strokeStyle = "#7c2d12";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, tailLen * 0.9);
          ctx.stroke();
          // Flame tip
          ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(-1 * scale, tailLen - 2 * scale);
          ctx.lineTo(0, tailLen + 3 * scale + Math.sin(t * 6 + i) * scale);
          ctx.lineTo(1 * scale, tailLen - 2 * scale);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Left wing - detailed with individual feathers
        ctx.save();
        ctx.translate(cx - 6 * scale, cy - 4 * scale - bounce);
        ctx.rotate(-0.65 - wingFlap);
        // Wing arm/bone structure
        ctx.fillStyle = "#9a3412";
        ctx.beginPath();
        ctx.moveTo(0, -1 * scale);
        ctx.lineTo(-5 * scale, -3 * scale);
        ctx.lineTo(-12 * scale, -1 * scale);
        ctx.lineTo(-12 * scale, 1 * scale);
        ctx.lineTo(-5 * scale, 0);
        ctx.lineTo(0, 1 * scale);
        ctx.fill();
        // Primary flight feathers
        for (let i = 0; i < 7; i++) {
          const featherStart = -3 * scale - i * 1.5 * scale;
          const featherLen = 10 * scale + i * 2 * scale;
          const featherAngle = -0.3 - i * 0.12;
          ctx.save();
          ctx.translate(featherStart, 0);
          ctx.rotate(featherAngle);
          const featherGrad = ctx.createLinearGradient(0, 0, 0, featherLen);
          featherGrad.addColorStop(0, "#c2410c");
          featherGrad.addColorStop(0.5, "#ea580c");
          featherGrad.addColorStop(0.8, "#f97316");
          featherGrad.addColorStop(1, "#fbbf24");
          ctx.fillStyle = featherGrad;
          ctx.beginPath();
          ctx.moveTo(-1.2 * scale, 0);
          ctx.quadraticCurveTo(-1.5 * scale, featherLen * 0.6, 0, featherLen);
          ctx.quadraticCurveTo(1.5 * scale, featherLen * 0.6, 1.2 * scale, 0);
          ctx.fill();
          // Feather barbs
          ctx.strokeStyle = "#7c2d12";
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, featherLen * 0.85);
          ctx.stroke();
          // Flame tip on feather
          ctx.fillStyle = `rgba(253, 224, 71, ${flamePulse * 0.9})`;
          ctx.beginPath();
          ctx.moveTo(-0.8 * scale, featherLen - scale);
          ctx.lineTo(0, featherLen + 2 * scale + Math.sin(t * 8 + i) * scale);
          ctx.lineTo(0.8 * scale, featherLen - scale);
          ctx.fill();
          ctx.restore();
        }
        // Secondary feathers (shorter, near body)
        for (let i = 0; i < 4; i++) {
          const featherStart = -2 * scale - i * 1.2 * scale;
          const featherLen = 5 * scale + i * scale;
          ctx.save();
          ctx.translate(featherStart, 2 * scale);
          ctx.rotate(-0.2 - i * 0.08);
          ctx.fillStyle = "#ea580c";
          ctx.beginPath();
          ctx.ellipse(0, featherLen * 0.5, 1 * scale, featherLen * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Right wing - mirror
        ctx.save();
        ctx.translate(cx + 6 * scale, cy - 4 * scale - bounce);
        ctx.rotate(0.65 + wingFlap);
        // Wing arm/bone
        ctx.fillStyle = "#9a3412";
        ctx.beginPath();
        ctx.moveTo(0, -1 * scale);
        ctx.lineTo(5 * scale, -3 * scale);
        ctx.lineTo(12 * scale, -1 * scale);
        ctx.lineTo(12 * scale, 1 * scale);
        ctx.lineTo(5 * scale, 0);
        ctx.lineTo(0, 1 * scale);
        ctx.fill();
        // Primary flight feathers
        for (let i = 0; i < 7; i++) {
          const featherStart = 3 * scale + i * 1.5 * scale;
          const featherLen = 10 * scale + i * 2 * scale;
          const featherAngle = 0.3 + i * 0.12;
          ctx.save();
          ctx.translate(featherStart, 0);
          ctx.rotate(featherAngle);
          const featherGrad = ctx.createLinearGradient(0, 0, 0, featherLen);
          featherGrad.addColorStop(0, "#c2410c");
          featherGrad.addColorStop(0.5, "#ea580c");
          featherGrad.addColorStop(0.8, "#f97316");
          featherGrad.addColorStop(1, "#fbbf24");
          ctx.fillStyle = featherGrad;
          ctx.beginPath();
          ctx.moveTo(-1.2 * scale, 0);
          ctx.quadraticCurveTo(-1.5 * scale, featherLen * 0.6, 0, featherLen);
          ctx.quadraticCurveTo(1.5 * scale, featherLen * 0.6, 1.2 * scale, 0);
          ctx.fill();
          ctx.strokeStyle = "#7c2d12";
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, featherLen * 0.85);
          ctx.stroke();
          ctx.fillStyle = `rgba(253, 224, 71, ${flamePulse * 0.9})`;
          ctx.beginPath();
          ctx.moveTo(-0.8 * scale, featherLen - scale);
          ctx.lineTo(0, featherLen + 2 * scale + Math.sin(t * 8 + i) * scale);
          ctx.lineTo(0.8 * scale, featherLen - scale);
          ctx.fill();
          ctx.restore();
        }
        for (let i = 0; i < 4; i++) {
          const featherStart = 2 * scale + i * 1.2 * scale;
          const featherLen = 5 * scale + i * scale;
          ctx.save();
          ctx.translate(featherStart, 2 * scale);
          ctx.rotate(0.2 + i * 0.08);
          ctx.fillStyle = "#ea580c";
          ctx.beginPath();
          ctx.ellipse(0, featherLen * 0.5, 1 * scale, featherLen * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Scaled demonic body with detailed texture
        const bodyGrad = ctx.createLinearGradient(cx - 6 * scale, cy - 8 * scale, cx + 6 * scale, cy + 10 * scale);
        bodyGrad.addColorStop(0, "#7c2d12");
        bodyGrad.addColorStop(0.2, "#9a3412");
        bodyGrad.addColorStop(0.5, "#c2410c");
        bodyGrad.addColorStop(0.8, "#9a3412");
        bodyGrad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * scale - bounce + breathe, 6 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chest plumage
        const chestGrad = ctx.createRadialGradient(cx, cy - 2 * scale - bounce, 0, cx, cy - 2 * scale - bounce, 5 * scale);
        chestGrad.addColorStop(0, "#fcd34d");
        chestGrad.addColorStop(0.5, "#fbbf24");
        chestGrad.addColorStop(1, "#f59e0b");
        ctx.fillStyle = chestGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2 * scale - bounce + breathe, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Detailed scale pattern
        ctx.strokeStyle = "#7c2d12";
        ctx.lineWidth = 0.5 * scale;
        for (let row = 0; row < 4; row++) {
          for (let col = -2; col <= 2; col++) {
            const scaleX = cx + col * 2.2 * scale + (row % 2) * 1.1 * scale;
            const scaleY = cy + row * 2.5 * scale - bounce + breathe;
            ctx.beginPath();
            ctx.arc(scaleX, scaleY, 1.5 * scale, 0.8, Math.PI - 0.8);
            ctx.stroke();
          }
        }

        // Powerful legs with armor-like scales
        ctx.fillStyle = "#9a3412";
        // Left leg
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy + 8 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy + 8 * scale - bounce);
        ctx.fill();
        // Right leg
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy + 8 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy + 8 * scale - bounce);
        ctx.fill();
        // Leg scales
        ctx.strokeStyle = "#7c2d12";
        ctx.lineWidth = 0.4 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 4 * scale, cy + 9 * scale + i * 1.5 * scale - bounce);
          ctx.lineTo(cx - 2 * scale, cy + 9 * scale + i * 1.5 * scale - bounce);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 4 * scale, cy + 9 * scale + i * 1.5 * scale - bounce);
          ctx.lineTo(cx + 2 * scale, cy + 9 * scale + i * 1.5 * scale - bounce);
          ctx.stroke();
        }

        // Vicious talons
        ctx.fillStyle = "#1c1917";
        // Left foot talons
        for (let i = 0; i < 4; i++) {
          const talonAngle = -0.6 + i * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx - 3 * scale, cy + 14 * scale - bounce);
          ctx.lineTo(cx - 3 * scale + Math.cos(talonAngle) * 4 * scale, cy + 14 * scale + Math.sin(talonAngle) * 4 * scale - bounce);
          ctx.lineTo(cx - 3 * scale + Math.cos(talonAngle) * 2 * scale, cy + 15 * scale - bounce);
          ctx.fill();
        }
        // Right foot talons
        for (let i = 0; i < 4; i++) {
          const talonAngle = -0.6 + i * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx + 3 * scale, cy + 14 * scale - bounce);
          ctx.lineTo(cx + 3 * scale + Math.cos(talonAngle) * 4 * scale, cy + 14 * scale + Math.sin(talonAngle) * 4 * scale - bounce);
          ctx.lineTo(cx + 3 * scale + Math.cos(talonAngle) * 2 * scale, cy + 15 * scale - bounce);
          ctx.fill();
        }

        // Magnificent crest/crown feathers
        ctx.save();
        ctx.translate(cx, cy - 16 * scale - bounce);
        ctx.rotate(headTilt);
        for (let i = 0; i < 9; i++) {
          const crestAngle = -Math.PI * 0.4 + i * Math.PI * 0.1;
          const crestLen = 6 * scale + Math.abs(i - 4) * scale + Math.sin(t * 4 + i) * scale;
          ctx.save();
          ctx.rotate(crestAngle);
          const crestGrad = ctx.createLinearGradient(0, 0, 0, -crestLen);
          crestGrad.addColorStop(0, "#ea580c");
          crestGrad.addColorStop(0.6, "#f97316");
          crestGrad.addColorStop(1, "#fbbf24");
          ctx.fillStyle = crestGrad;
          ctx.beginPath();
          ctx.moveTo(-0.8 * scale, 0);
          ctx.quadraticCurveTo(-1 * scale, -crestLen * 0.5, 0, -crestLen);
          ctx.quadraticCurveTo(1 * scale, -crestLen * 0.5, 0.8 * scale, 0);
          ctx.fill();
          // Flame tip
          ctx.fillStyle = `rgba(253, 224, 71, ${flamePulse})`;
          ctx.beginPath();
          ctx.arc(0, -crestLen, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Fierce angular head
        ctx.save();
        ctx.translate(cx, cy - 12 * scale - bounce);
        ctx.rotate(headTilt);
        const headGrad = ctx.createRadialGradient(-scale, -scale, 0, 0, 0, 6 * scale);
        headGrad.addColorStop(0, "#fef3c7");
        headGrad.addColorStop(0.5, "#fcd34d");
        headGrad.addColorStop(1, "#f59e0b");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Facial markings
        ctx.strokeStyle = "#c2410c";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(-4 * scale, -1 * scale);
        ctx.lineTo(-2.5 * scale, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4 * scale, -1 * scale);
        ctx.lineTo(2.5 * scale, 0);
        ctx.stroke();

        // Fierce predator eyes - large and detailed
        // Eye sockets
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(-2.2 * scale, -1 * scale, 2 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(2.2 * scale, -1 * scale, 2 * scale, 2.5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Eye whites
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.ellipse(-2.2 * scale, -1 * scale, 1.6 * scale, 2 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(2.2 * scale, -1 * scale, 1.6 * scale, 2 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Iris glow
        ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + flamePulse * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(-2.2 * scale, -1 * scale, 2.2 * scale, 2.8 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(2.2 * scale, -1 * scale, 2.2 * scale, 2.8 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Iris
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(-2.2 * scale, -1 * scale, 1.2 * scale, 1.6 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(2.2 * scale, -1 * scale, 1.2 * scale, 1.6 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Slit pupils
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(-2.2 * scale, -1 * scale, 0.3 * scale, 1.4 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(2.2 * scale, -1 * scale, 0.3 * scale, 1.4 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlights
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(-2.7 * scale, -1.8 * scale, 0.4 * scale, 0, Math.PI * 2);
        ctx.arc(1.7 * scale, -1.8 * scale, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Powerful hooked beak
        const beakGrad = ctx.createLinearGradient(0, 0, 0, 5 * scale);
        beakGrad.addColorStop(0, "#44403c");
        beakGrad.addColorStop(0.5, "#292524");
        beakGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = beakGrad;
        // Upper beak
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 2 * scale);
        ctx.quadraticCurveTo(-1 * scale, 2.5 * scale, 0, 2 * scale);
        ctx.quadraticCurveTo(1 * scale, 2.5 * scale, 2 * scale, 2 * scale);
        ctx.lineTo(0, 7 * scale + screechPulse * 5);
        ctx.closePath();
        ctx.fill();
        // Lower beak (opens when screeching)
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, 3 * scale);
        ctx.lineTo(0, 5 * scale + screechPulse * 8);
        ctx.lineTo(1.5 * scale, 3 * scale);
        ctx.quadraticCurveTo(0, 4 * scale, -1.5 * scale, 3 * scale);
        ctx.fill();
        // Beak highlight
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.moveTo(-1 * scale, 2.5 * scale);
        ctx.lineTo(0, 2 * scale);
        ctx.lineTo(0, 5 * scale);
        ctx.lineTo(-0.5 * scale, 3 * scale);
        ctx.fill();
        // Tongue visible when screeching
        if (screechPulse > 0.05) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.ellipse(0, 4.5 * scale + screechPulse * 3, 0.8 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        break;
      }
      case "wyvern": {
        // VENOMWING DRAKE - Terrifying poison dragon with acid breath
        const wingFlap = Math.sin(t * 6) * 0.4;
        const breathPulse = 0.5 + Math.sin(t * 3) * 0.5;
        const venomDrip = (t * 2) % 1;
        const tailSwish = Math.sin(t * 2) * 0.15;

        // Toxic aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 4 * scale,
          0,
          cx,
          cy - 4 * scale,
          16 * scale
        );
        auraGrad.addColorStop(0, `rgba(34, 197, 94, ${breathPulse * 0.2})`);
        auraGrad.addColorStop(0.6, `rgba(21, 128, 61, ${breathPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Massive leathery wings - left
        ctx.save();
        ctx.translate(cx - 5 * scale, cy - 2 * scale - bounce);
        ctx.rotate(-0.5 - wingFlap);
        // Wing membrane
        const leftWingGrad = ctx.createLinearGradient(0, 0, -16 * scale, -8 * scale);
        leftWingGrad.addColorStop(0, "#166534");
        leftWingGrad.addColorStop(0.5, "#15803d");
        leftWingGrad.addColorStop(1, "#14532d");
        ctx.fillStyle = leftWingGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-12 * scale, -10 * scale, -16 * scale, -2 * scale);
        ctx.lineTo(-14 * scale, 2 * scale);
        ctx.lineTo(-10 * scale, 0);
        ctx.lineTo(-8 * scale, 3 * scale);
        ctx.lineTo(-4 * scale, scale);
        ctx.lineTo(-2 * scale, 4 * scale);
        ctx.lineTo(0, 2 * scale);
        ctx.fill();
        // Wing bones
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-14 * scale, -4 * scale);
        ctx.moveTo(-4 * scale, -2 * scale);
        ctx.lineTo(-10 * scale, 0);
        ctx.moveTo(-7 * scale, -3 * scale);
        ctx.lineTo(-6 * scale, 2 * scale);
        ctx.stroke();
        ctx.restore();

        // Right wing
        ctx.save();
        ctx.translate(cx + 5 * scale, cy - 2 * scale - bounce);
        ctx.rotate(0.5 + wingFlap);
        const rightWingGrad = ctx.createLinearGradient(0, 0, 16 * scale, -8 * scale);
        rightWingGrad.addColorStop(0, "#166534");
        rightWingGrad.addColorStop(0.5, "#15803d");
        rightWingGrad.addColorStop(1, "#14532d");
        ctx.fillStyle = rightWingGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12 * scale, -10 * scale, 16 * scale, -2 * scale);
        ctx.lineTo(14 * scale, 2 * scale);
        ctx.lineTo(10 * scale, 0);
        ctx.lineTo(8 * scale, 3 * scale);
        ctx.lineTo(4 * scale, scale);
        ctx.lineTo(2 * scale, 4 * scale);
        ctx.lineTo(0, 2 * scale);
        ctx.fill();
        // Wing bones
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(14 * scale, -4 * scale);
        ctx.moveTo(4 * scale, -2 * scale);
        ctx.lineTo(10 * scale, 0);
        ctx.moveTo(7 * scale, -3 * scale);
        ctx.lineTo(6 * scale, 2 * scale);
        ctx.stroke();
        ctx.restore();

        // Spiked tail
        ctx.save();
        ctx.translate(cx, cy + 8 * scale - bounce);
        ctx.rotate(tailSwish);
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 0);
        ctx.quadraticCurveTo(4 * scale, 4 * scale, 8 * scale, 8 * scale);
        ctx.lineTo(10 * scale, 6 * scale);
        ctx.quadraticCurveTo(6 * scale, 3 * scale, 2 * scale, 0);
        ctx.fill();
        // Tail spikes
        ctx.fillStyle = "#14532d";
        ctx.beginPath();
        ctx.moveTo(6 * scale, 5 * scale);
        ctx.lineTo(8 * scale, 3 * scale);
        ctx.lineTo(7 * scale, 6 * scale);
        ctx.fill();
        // Venomous stinger - layered glow
        ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
        ctx.beginPath();
        ctx.arc(11 * scale, 7.5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.moveTo(10 * scale, 6 * scale);
        ctx.lineTo(13 * scale, 9 * scale);
        ctx.lineTo(9 * scale, 8 * scale);
        ctx.fill();
        ctx.restore();

        // Serpentine scaled body
        const bodyGrad = ctx.createLinearGradient(
          cx - 6 * scale,
          cy - 8 * scale,
          cx + 6 * scale,
          cy + 10 * scale
        );
        bodyGrad.addColorStop(0, "#14532d");
        bodyGrad.addColorStop(0.3, "#166534");
        bodyGrad.addColorStop(0.5, "#22c55e");
        bodyGrad.addColorStop(0.7, "#166534");
        bodyGrad.addColorStop(1, "#14532d");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 2 * scale - bounce,
          6 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Belly scales
        ctx.fillStyle = "#a3e635";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 3 * scale - bounce,
          3 * scale,
          6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Scale lines
        ctx.strokeStyle = "#65a30d";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 2 * scale, cy - 2 * scale + i * 3 * scale - bounce);
          ctx.lineTo(cx + 2 * scale, cy - 2 * scale + i * 3 * scale - bounce);
          ctx.stroke();
        }

        // Powerful hind legs
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.ellipse(
          cx - 4 * scale,
          cy + 8 * scale - bounce,
          2 * scale,
          4 * scale,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 4 * scale,
          cy + 8 * scale - bounce,
          2 * scale,
          4 * scale,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Horned dragon head
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale - bounce,
          5.5 * scale,
          5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Head ridges/horns
        ctx.fillStyle = "#14532d";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx - 6 * scale, cy - 20 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy - 14 * scale - bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 20 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy - 14 * scale - bounce);
        ctx.fill();

        // Snout ridges
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 16 * scale - bounce);
        ctx.lineTo(cx, cy - 12 * scale - bounce);
        ctx.stroke();

        // Glowing venomous eyes - layered glow
        ctx.fillStyle = "rgba(254, 240, 138, 0.3)";
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, cy - 13 * scale - bounce, 3 * scale, 3.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + 2.5 * scale, cy - 13 * scale - bounce, 3 * scale, 3.5 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, cy - 13 * scale - bounce, 1.5 * scale, 1.8 * scale, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + 2.5 * scale, cy - 13 * scale - bounce, 1.5 * scale, 1.8 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Reptilian slit pupils
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale,
          cy - 13 * scale - bounce,
          0.4 * scale,
          1.4 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 13 * scale - bounce,
          0.4 * scale,
          1.4 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Venomous breath/drool - layered glow
        ctx.fillStyle = `rgba(163, 230, 53, ${breathPulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 2 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(163, 230, 53, ${breathPulse * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9 * scale - bounce);
        ctx.lineTo(cx - 2.5 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 2.5 * scale, cy - 4 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Dripping venom
        if (animated) {
          ctx.fillStyle = `rgba(163, 230, 53, ${0.8 - venomDrip * 0.6})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy - 4 * scale - bounce + venomDrip * 6 * scale, 1 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "specter": {
        // SOUL REAVER WRAITH - Ancient tormented spirit with chains and dark magic
        const floatOffset = Math.sin(t * 2) * 4 * scale;
        const ghostPulse = 0.4 + Math.sin(t * 3) * 0.3;
        const wail = Math.sin(t * 5) * 0.15;
        const chainRattle = Math.sin(t * 8) * scale * 0.8;
        const soulSwirl = t * 1.5;
        const cloakBillow = Math.sin(t * 1.5) * 0.1;
        const flickerPhase = Math.sin(t * 12) > 0.8 ? 0.3 : 0;

        // Captured soul wisps orbiting
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const soulAngle = soulSwirl + i * Math.PI * 0.4;
            const soulDist = 14 * scale + Math.sin(t * 2 + i) * 3 * scale;
            const soulX = cx + Math.cos(soulAngle) * soulDist;
            const soulY = cy - 2 * scale + Math.sin(soulAngle) * soulDist * 0.35 - bounce + floatOffset;
            const soulAlpha = 0.4 + Math.sin(t * 3 + i) * 0.2;
            // Soul glow
            ctx.fillStyle = `rgba(103, 232, 249, ${soulAlpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(soulX, soulY, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Soul core
            ctx.fillStyle = `rgba(6, 182, 212, ${soulAlpha})`;
            ctx.beginPath();
            ctx.arc(soulX, soulY, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Soul trail
            ctx.strokeStyle = `rgba(6, 182, 212, ${soulAlpha * 0.5})`;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(soulX, soulY);
            const trailAngle = soulAngle - 0.5;
            ctx.lineTo(soulX + Math.cos(trailAngle) * 4 * scale, soulY + Math.sin(trailAngle) * 2 * scale);
            ctx.stroke();
          }
        }

        // Multi-layer ethereal aura
        const outerAura = ctx.createRadialGradient(cx, cy - 2 * scale + floatOffset, 0, cx, cy - 2 * scale + floatOffset, 24 * scale);
        outerAura.addColorStop(0, `rgba(8, 145, 178, ${ghostPulse * 0.12})`);
        outerAura.addColorStop(0.5, `rgba(6, 182, 212, ${ghostPulse * 0.06})`);
        outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce + floatOffset, 24 * scale, 0, Math.PI * 2);
        ctx.fill();

        const innerAura = ctx.createRadialGradient(cx, cy - 4 * scale + floatOffset, 0, cx, cy - 4 * scale + floatOffset, 14 * scale);
        innerAura.addColorStop(0, `rgba(103, 232, 249, ${ghostPulse * 0.25})`);
        innerAura.addColorStop(0.5, `rgba(6, 182, 212, ${ghostPulse * 0.15})`);
        innerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce + floatOffset, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Spectral chains trailing below
        if (animated) {
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.5 + Math.sin(t * 4) * 0.2})`;
          ctx.lineWidth = 1.5 * scale;
          for (let c = 0; c < 3; c++) {
            const chainStartX = cx - 4 * scale + c * 4 * scale;
            ctx.beginPath();
            ctx.moveTo(chainStartX, cy + 8 * scale - bounce + floatOffset);
            for (let link = 0; link < 6; link++) {
              const linkX = chainStartX + Math.sin(t * 6 + link + c) * 2 * scale + chainRattle * (link % 2 === 0 ? 1 : -1);
              const linkY = cy + 8 * scale + link * 3 * scale - bounce + floatOffset;
              ctx.lineTo(linkX, linkY);
            }
            ctx.stroke();
            // Chain end weight
            ctx.fillStyle = `rgba(100, 116, 139, ${0.6 + Math.sin(t * 3 + c) * 0.2})`;
            const endX = chainStartX + Math.sin(t * 6 + 5 + c) * 2 * scale + chainRattle;
            const endY = cy + 8 * scale + 15 * scale - bounce + floatOffset;
            ctx.beginPath();
            ctx.arc(endX, endY, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Tattered ethereal cloak/shroud - multiple layers
        ctx.save();
        ctx.translate(cx, cy - bounce + floatOffset);
        ctx.rotate(cloakBillow);
        
        // Back layer - darker, more transparent
        ctx.fillStyle = `rgba(8, 145, 178, ${0.25 + ghostPulse * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(-9 * scale, 12 * scale);
        // Very tattered bottom with many points
        for (let i = 0; i < 10; i++) {
          const x = -9 * scale + i * 1.8 * scale;
          const y = 12 * scale + (i % 3 === 0 ? 8 * scale : i % 3 === 1 ? 5 * scale : 10 * scale) + Math.sin(t * 2 + i) * 2 * scale;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(9 * scale, 12 * scale);
        ctx.quadraticCurveTo(12 * scale, 2 * scale, 8 * scale, -8 * scale);
        ctx.lineTo(-8 * scale, -8 * scale);
        ctx.quadraticCurveTo(-12 * scale, 2 * scale, -9 * scale, 12 * scale);
        ctx.fill();

        // Middle layer - main body
        const bodyGrad = ctx.createLinearGradient(0, -12 * scale, 0, 15 * scale);
        bodyGrad.addColorStop(0, `rgba(103, 232, 249, ${0.5 + ghostPulse * 0.2 - flickerPhase})`);
        bodyGrad.addColorStop(0.3, `rgba(6, 182, 212, ${0.6 + ghostPulse * 0.2 - flickerPhase})`);
        bodyGrad.addColorStop(0.7, `rgba(8, 145, 178, ${0.4 + ghostPulse * 0.15 - flickerPhase})`);
        bodyGrad.addColorStop(1, `rgba(14, 116, 144, ${0.2 - flickerPhase})`);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(-7 * scale, 10 * scale);
        // Flowing tattered edges
        ctx.quadraticCurveTo(-5 * scale, 14 * scale, -3 * scale, 10 * scale);
        ctx.quadraticCurveTo(-1 * scale, 17 * scale + Math.sin(t * 2.5) * 2 * scale, 0, 12 * scale);
        ctx.quadraticCurveTo(1 * scale, 17 * scale + Math.sin(t * 2.5 + 1) * 2 * scale, 3 * scale, 10 * scale);
        ctx.quadraticCurveTo(5 * scale, 14 * scale, 7 * scale, 10 * scale);
        ctx.quadraticCurveTo(10 * scale, 2 * scale, 7 * scale, -10 * scale);
        ctx.lineTo(-7 * scale, -10 * scale);
        ctx.quadraticCurveTo(-10 * scale, 2 * scale, -7 * scale, 10 * scale);
        ctx.fill();

        // Inner ethereal glow
        const innerGlow = ctx.createRadialGradient(0, -4 * scale, 0, 0, -4 * scale, 8 * scale);
        innerGlow.addColorStop(0, `rgba(165, 243, 252, ${ghostPulse * 0.4})`);
        innerGlow.addColorStop(0.5, `rgba(103, 232, 249, ${ghostPulse * 0.2})`);
        innerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.ellipse(0, -2 * scale, 5 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Hood/cowl
        ctx.save();
        ctx.translate(cx, cy - 10 * scale - bounce + floatOffset);
        const hoodGrad = ctx.createLinearGradient(0, -6 * scale, 0, 4 * scale);
        hoodGrad.addColorStop(0, `rgba(8, 145, 178, ${0.7 + ghostPulse * 0.2})`);
        hoodGrad.addColorStop(0.5, `rgba(14, 116, 144, ${0.6 + ghostPulse * 0.15})`);
        hoodGrad.addColorStop(1, `rgba(21, 94, 117, ${0.4})`);
        ctx.fillStyle = hoodGrad;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, 4 * scale);
        ctx.quadraticCurveTo(-8 * scale, 0, -7 * scale, -4 * scale);
        ctx.quadraticCurveTo(-5 * scale, -8 * scale, 0, -9 * scale);
        ctx.quadraticCurveTo(5 * scale, -8 * scale, 7 * scale, -4 * scale);
        ctx.quadraticCurveTo(8 * scale, 0, 6 * scale, 4 * scale);
        ctx.quadraticCurveTo(4 * scale, 2 * scale, 0, 3 * scale);
        ctx.quadraticCurveTo(-4 * scale, 2 * scale, -6 * scale, 4 * scale);
        ctx.fill();
        // Hood shadow/depth
        ctx.fillStyle = `rgba(3, 105, 161, ${0.5})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Skeletal face within the hood
        ctx.save();
        ctx.translate(cx, cy - 8 * scale - bounce + floatOffset);
        // Skull shape - faint
        ctx.fillStyle = `rgba(165, 243, 252, ${0.25 + ghostPulse * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(0, -2 * scale, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cheekbones
        ctx.fillStyle = `rgba(103, 232, 249, ${0.15 + ghostPulse * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(-2.5 * scale, 0, 2 * scale, 1.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.ellipse(2.5 * scale, 0, 2 * scale, 1.5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Hollow burning eye sockets - more detailed
        const eyeY = cy - 8 * scale - bounce + floatOffset;
        // Eye socket voids
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, eyeY, 2.5 * scale, 3.2 * scale, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 2.5 * scale, eyeY, 2.5 * scale, 3.2 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Eye glow outer
        ctx.fillStyle = `rgba(103, 232, 249, ${ghostPulse * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, eyeY, 3 * scale, 4 * scale, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 2.5 * scale, eyeY, 3 * scale, 4 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Eye inner glow
        ctx.fillStyle = `rgba(34, 211, 238, ${0.6 + ghostPulse * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, eyeY, 1.8 * scale, 2.2 * scale, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 2.5 * scale, eyeY, 1.8 * scale, 2.2 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Bright core
        ctx.fillStyle = `rgba(236, 254, 255, ${0.7 + ghostPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, eyeY - 0.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, eyeY - 0.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eye flame/wisp trailing upward
        if (animated) {
          ctx.strokeStyle = `rgba(103, 232, 249, ${0.5 + ghostPulse * 0.3})`;
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 2.5 * scale, eyeY - 2 * scale);
          ctx.quadraticCurveTo(cx - 3 * scale + Math.sin(t * 6) * scale, eyeY - 5 * scale, cx - 2 * scale, eyeY - 7 * scale + Math.sin(t * 4) * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 2.5 * scale, eyeY - 2 * scale);
          ctx.quadraticCurveTo(cx + 3 * scale + Math.sin(t * 6 + 1) * scale, eyeY - 5 * scale, cx + 2 * scale, eyeY - 7 * scale + Math.sin(t * 4 + 1) * scale);
          ctx.stroke();
        }

        // Wailing mouth
        ctx.fillStyle = `rgba(3, 105, 161, ${0.7})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4 * scale - bounce + floatOffset, 2 * scale + wail * 3 * scale, 1.5 * scale + wail * 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner mouth void
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4 * scale - bounce + floatOffset, 1.2 * scale + wail * 2 * scale, 0.8 * scale + wail * 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spectral arms/claws reaching out
        ctx.save();
        ctx.translate(cx, cy - 2 * scale - bounce + floatOffset);
        // Left arm
        ctx.fillStyle = `rgba(6, 182, 212, ${0.4 + ghostPulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, 0);
        ctx.quadraticCurveTo(-10 * scale, -2 * scale, -12 * scale + Math.sin(t * 3) * scale, 2 * scale);
        ctx.lineTo(-11 * scale, 4 * scale);
        ctx.quadraticCurveTo(-8 * scale, 2 * scale, -5 * scale, 2 * scale);
        ctx.fill();
        // Left claw fingers
        ctx.strokeStyle = `rgba(103, 232, 249, ${0.5 + ghostPulse * 0.3})`;
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 4; i++) {
          const fingerAngle = -0.4 + i * 0.25;
          ctx.beginPath();
          ctx.moveTo(-11 * scale + Math.sin(t * 3) * scale, 3 * scale);
          ctx.lineTo(-13 * scale + Math.cos(fingerAngle) * 3 * scale + Math.sin(t * 4 + i) * scale, 3 * scale + Math.sin(fingerAngle) * 3 * scale);
          ctx.stroke();
        }
        // Right arm
        ctx.fillStyle = `rgba(6, 182, 212, ${0.4 + ghostPulse * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(6 * scale, 0);
        ctx.quadraticCurveTo(10 * scale, -2 * scale, 12 * scale + Math.sin(t * 3 + 1) * scale, 2 * scale);
        ctx.lineTo(11 * scale, 4 * scale);
        ctx.quadraticCurveTo(8 * scale, 2 * scale, 5 * scale, 2 * scale);
        ctx.fill();
        // Right claw fingers
        for (let i = 0; i < 4; i++) {
          const fingerAngle = -0.4 + i * 0.25;
          ctx.beginPath();
          ctx.moveTo(11 * scale + Math.sin(t * 3 + 1) * scale, 3 * scale);
          ctx.lineTo(13 * scale + Math.cos(fingerAngle) * 3 * scale + Math.sin(t * 4 + i + 1) * scale, 3 * scale + Math.sin(fingerAngle) * 3 * scale);
          ctx.stroke();
        }
        ctx.restore();

        // Ethereal runes on the body
        if (animated) {
          ctx.fillStyle = `rgba(165, 243, 252, ${0.3 + Math.sin(t * 2) * 0.2})`;
          ctx.font = `${3 * scale}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("☽", cx - 3 * scale, cy + 2 * scale - bounce + floatOffset);
          ctx.fillText("✧", cx + 3 * scale, cy + 4 * scale - bounce + floatOffset);
          ctx.fillText("⚶", cx, cy + 7 * scale - bounce + floatOffset);
        }
        break;
      }
      case "berserker": {
        // BLOOD RAVAGER - Massive demon-touched berserker in blood frenzy
        const ragePulse = 0.6 + Math.sin(t * 4) * 0.4;
        const shake = animated ? Math.sin(t * 10) * scale * 0.8 : 0;
        const breathe = Math.sin(t * 3) * scale * 0.5;
        const veinsFlash = 0.5 + Math.sin(t * 6) * 0.3;

        // Blood rage aura - violent pulsing energy
        const auraGrad = ctx.createRadialGradient(
          cx + shake,
          cy - 4 * scale,
          0,
          cx + shake,
          cy - 4 * scale,
          18 * scale
        );
        auraGrad.addColorStop(0, `rgba(239, 68, 68, ${ragePulse * 0.35})`);
        auraGrad.addColorStop(0.5, `rgba(185, 28, 28, ${ragePulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(
          cx + shake,
          cy - 4 * scale - bounce,
          18 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Floating blood droplets
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const dropAngle = t * 1.5 + i * Math.PI * 0.5;
            const dropDist = 10 * scale + Math.sin(t * 2 + i) * 2 * scale;
            const dx = cx + Math.cos(dropAngle) * dropDist + shake;
            const dy = cy - 2 * scale + Math.sin(dropAngle) * dropDist * 0.4 - bounce;
            ctx.fillStyle = `rgba(185, 28, 28, ${0.5 + Math.sin(t * 3 + i) * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(dx, dy - 2 * scale);
            ctx.quadraticCurveTo(dx + 1.5 * scale, dy, dx, dy + 1.5 * scale);
            ctx.quadraticCurveTo(dx - 1.5 * scale, dy, dx, dy - 2 * scale);
            ctx.fill();
          }
        }

        // Massive muscular body - hulking frame
        const bodyGrad = ctx.createLinearGradient(
          cx - 10 * scale + shake,
          cy - 10 * scale,
          cx + 10 * scale + shake,
          cy + 14 * scale
        );
        bodyGrad.addColorStop(0, "#7c2d12");
        bodyGrad.addColorStop(0.3, "#9a3412");
        bodyGrad.addColorStop(0.5, "#b45309");
        bodyGrad.addColorStop(0.7, "#9a3412");
        bodyGrad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx + shake,
          cy + 2 * scale - bounce + breathe,
          10 * scale,
          12 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Bare scarred torso
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.ellipse(
          cx + shake,
          cy - 2 * scale - bounce + breathe,
          6 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Battle scars - glowing with rage
        ctx.strokeStyle = `rgba(239, 68, 68, ${veinsFlash})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale + shake, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 2 * scale + shake, cy + 2 * scale - bounce);
        ctx.moveTo(cx + 3 * scale + shake, cy - 5 * scale - bounce);
        ctx.lineTo(cx - scale + shake, cy - bounce);
        ctx.moveTo(cx - 2 * scale + shake, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 4 * scale + shake, cy + 4 * scale - bounce);
        ctx.stroke();

        // Pulsing veins
        ctx.strokeStyle = `rgba(185, 28, 28, ${veinsFlash * 0.6})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale + shake, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(cx - 3 * scale + shake, cy - bounce, cx - 4 * scale + shake, cy + 4 * scale - bounce);
        ctx.stroke();

        // Massive arms
        ctx.fillStyle = "#b45309";
        // Left arm
        ctx.beginPath();
        ctx.ellipse(
          cx - 8 * scale + shake,
          cy - bounce + breathe,
          3 * scale,
          6 * scale,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Right arm (holding axe)
        ctx.beginPath();
        ctx.ellipse(
          cx + 8 * scale + shake,
          cy - bounce + breathe,
          3 * scale,
          6 * scale,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Fierce demonic head with horns
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(
          cx + shake,
          cy - 14 * scale - bounce,
          6 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Small demon horns
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale + shake, cy - 18 * scale - bounce);
        ctx.lineTo(cx - 6 * scale + shake, cy - 23 * scale - bounce);
        ctx.lineTo(cx - 3 * scale + shake, cy - 17 * scale - bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale + shake, cy - 18 * scale - bounce);
        ctx.lineTo(cx + 6 * scale + shake, cy - 23 * scale - bounce);
        ctx.lineTo(cx + 3 * scale + shake, cy - 17 * scale - bounce);
        ctx.fill();

        // Wild flaming hair
        ctx.fillStyle = "#7c2d12";
        for (let i = 0; i < 8; i++) {
          const hairAngle = -Math.PI * 0.6 + i * Math.PI * 0.15;
          const hairLen = 5 * scale + Math.sin(t * 4 + i) * 2 * scale;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(hairAngle) * 5 * scale + shake,
            cy - 18 * scale - bounce
          );
          ctx.lineTo(
            cx + Math.cos(hairAngle) * (5 + hairLen / scale) * scale + shake,
            cy - 18 * scale - hairLen - bounce + Math.sin(t * 3 + i) * 2 * scale
          );
          ctx.lineTo(
            cx + Math.cos(hairAngle + 0.15) * 5 * scale + shake,
            cy - 18 * scale - bounce
          );
          ctx.fill();
        }

        // Glowing rage eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale + shake,
          cy - 15 * scale - bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale + shake,
          cy - 15 * scale - bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Layered glow for eyes
        ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale + shake, cy - 15 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale + shake, cy - 15 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale + shake, cy - 15 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale + shake, cy - 15 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale + shake, cy - 15 * scale - bounce, 1.3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale + shake, cy - 15 * scale - bounce, 1.3 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Pinprick pupils
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale + shake,
          cy - 15 * scale - bounce,
          0.4 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale + shake,
          cy - 15 * scale - bounce,
          0.4 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Snarling mouth with fangs
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(
          cx + shake,
          cy - 11 * scale - bounce,
          3 * scale,
          2 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        // Fangs
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale + shake, cy - 11 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale + shake, cy - 9 * scale - bounce);
        ctx.lineTo(cx - 1 * scale + shake, cy - 11 * scale - bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale + shake, cy - 11 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale + shake, cy - 9 * scale - bounce);
        ctx.lineTo(cx + 1 * scale + shake, cy - 11 * scale - bounce);
        ctx.fill();

        // Massive blood-soaked battle axe
        const axeSwing = Math.sin(t * 2) * 0.1;
        ctx.save();
        ctx.translate(cx + 12 * scale + shake, cy - 4 * scale - bounce);
        ctx.rotate(axeSwing);
        // Axe handle
        ctx.fillStyle = "#44403c";
        ctx.fillRect(-1.5 * scale, -8 * scale, 3 * scale, 20 * scale);
        // Handle wrapping
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 1.5 * scale;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-1.5 * scale, 4 * scale + i * 3 * scale);
          ctx.lineTo(1.5 * scale, 5 * scale + i * 3 * scale);
          ctx.stroke();
        }
        // Massive axe head
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -10 * scale);
        ctx.quadraticCurveTo(-10 * scale, -8 * scale, -8 * scale, -2 * scale);
        ctx.quadraticCurveTo(-10 * scale, 4 * scale, -2 * scale, 2 * scale);
        ctx.lineTo(-2 * scale, -10 * scale);
        ctx.fill();
        // Blood on axe
        ctx.fillStyle = `rgba(185, 28, 28, ${ragePulse * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, -6 * scale);
        ctx.quadraticCurveTo(-8 * scale, -4 * scale, -7 * scale, -2 * scale);
        ctx.lineTo(-5 * scale, -4 * scale);
        ctx.fill();
        // Axe edge gleam
        ctx.strokeStyle = "#a8a29e";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(-8 * scale, -6 * scale);
        ctx.quadraticCurveTo(-9 * scale, -2 * scale, -8 * scale, 2 * scale);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case "golem": {
        // NASSAU LION MONSTER - Fearsome living stone lion guardian
        const breathe = Math.sin(t * 2) * scale;
        const maneWave = Math.sin(t * 3) * 0.1;
        const glowPulse = 0.6 + Math.sin(t * 2.5) * 0.4;
        const eyeFlicker = 0.7 + Math.sin(t * 5) * 0.3;

        // Stone gray spectral aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 4 * scale,
          0,
          cx,
          cy - 4 * scale,
          18 * scale
        );
        auraGrad.addColorStop(0, `rgba(168, 162, 158, ${glowPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(120, 113, 108, ${glowPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Massive lion body - living stone
        const bodyGrad = ctx.createLinearGradient(
          cx - 10 * scale,
          cy - bounce,
          cx + 10 * scale,
          cy + 12 * scale - bounce
        );
        bodyGrad.addColorStop(0, "#57534e");
        bodyGrad.addColorStop(0.3, "#78716c");
        bodyGrad.addColorStop(0.5, "#a8a29e");
        bodyGrad.addColorStop(0.7, "#78716c");
        bodyGrad.addColorStop(1, "#44403c");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 4 * scale - bounce + breathe * 0.3,
          10 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Stone texture cracks
        ctx.strokeStyle = "#292524";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 2 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy + 8 * scale - bounce);
        ctx.moveTo(cx + 3 * scale, cy - bounce);
        ctx.lineTo(cx + 6 * scale, cy + 6 * scale - bounce);
        ctx.moveTo(cx - 3 * scale, cy + 6 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Powerful front legs
        ctx.fillStyle = "#78716c";
        ctx.fillRect(
          cx - 9 * scale,
          cy + 8 * scale - bounce,
          4 * scale,
          8 * scale
        );
        ctx.fillRect(
          cx + 5 * scale,
          cy + 8 * scale - bounce,
          4 * scale,
          8 * scale
        );
        // Stone claws
        ctx.fillStyle = "#1c1917";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale + i * 1.2 * scale, cy + 16 * scale - bounce);
          ctx.lineTo(cx - 8.5 * scale + i * 1.2 * scale, cy + 18 * scale - bounce);
          ctx.lineTo(cx - 7.5 * scale + i * 1.2 * scale, cy + 16 * scale - bounce);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx + 6 * scale + i * 1.2 * scale, cy + 16 * scale - bounce);
          ctx.lineTo(cx + 5.5 * scale + i * 1.2 * scale, cy + 18 * scale - bounce);
          ctx.lineTo(cx + 6.5 * scale + i * 1.2 * scale, cy + 16 * scale - bounce);
          ctx.fill();
        }

        // Magnificent stone mane - flowing carved stone tendrils
        ctx.save();
        ctx.translate(cx, cy - 10 * scale - bounce);
        for (let i = 0; i < 14; i++) {
          const angle = ((i * Math.PI * 2) / 14) + maneWave;
          const maneLen = (9 + Math.sin(t * 3 + i) * 2) * scale;
          const maneGrad = ctx.createLinearGradient(
            0, 0,
            Math.cos(angle) * maneLen,
            Math.sin(angle) * maneLen
          );
          maneGrad.addColorStop(0, "#78716c");
          maneGrad.addColorStop(0.4, "#a8a29e");
          maneGrad.addColorStop(0.7, "#d6d3d1");
          maneGrad.addColorStop(1, `rgba(231, 229, 228, ${glowPulse * 0.6})`);
          ctx.fillStyle = maneGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            Math.cos(angle + 0.2) * maneLen * 0.7,
            Math.sin(angle + 0.2) * maneLen * 0.7,
            Math.cos(angle) * maneLen,
            Math.sin(angle) * maneLen
          );
          ctx.quadraticCurveTo(
            Math.cos(angle - 0.2) * maneLen * 0.7,
            Math.sin(angle - 0.2) * maneLen * 0.7,
            0, 0
          );
          ctx.fill();
        }
        ctx.restore();

        // Fearsome lion head - carved stone
        const headGrad = ctx.createRadialGradient(
          cx, cy - 12 * scale - bounce,
          0,
          cx, cy - 12 * scale - bounce,
          7 * scale
        );
        headGrad.addColorStop(0, "#d6d3d1");
        headGrad.addColorStop(0.5, "#a8a29e");
        headGrad.addColorStop(1, "#78716c");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale - bounce,
          7 * scale,
          6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Fierce muzzle
        ctx.fillStyle = "#a8a29e";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 9 * scale - bounce,
          4 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Glowing amber eyes - ancient power - layered glow
        ctx.fillStyle = `rgba(251, 191, 36, ${eyeFlicker * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 14 * scale - bounce, 3.5 * scale, 2.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 14 * scale - bounce, 3.5 * scale, 2.5 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(251, 191, 36, ${eyeFlicker * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 14 * scale - bounce, 2.5 * scale, 1.8 * scale, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 14 * scale - bounce, 2.5 * scale, 1.8 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(251, 191, 36, ${eyeFlicker})`;
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 14 * scale - bounce, 1.8 * scale, 1.2 * scale, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 14 * scale - bounce, 1.8 * scale, 1.2 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Slit pupils
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale,
          cy - 14 * scale - bounce,
          0.5 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale,
          cy - 14 * scale - bounce,
          0.5 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Snarling mouth with fangs
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 8 * scale - bounce,
          2.5 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        // Stone fangs
        ctx.fillStyle = "#e7e5e4";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx - 1 * scale, cy - 8 * scale - bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 1 * scale, cy - 8 * scale - bounce);
        ctx.fill();

        // Nose
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 10 * scale - bounce,
          1.5 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Glowing rune on forehead - ancient power - layered glow
        ctx.fillStyle = `rgba(251, 191, 36, ${glowPulse * 0.3})`;
        ctx.font = `${6 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("⚜", cx, cy - 16 * scale - bounce);
        ctx.fillStyle = `rgba(251, 191, 36, ${glowPulse})`;
        ctx.font = `${4 * scale}px serif`;
        ctx.fillText("⚜", cx, cy - 16 * scale - bounce);
        break;
      }
      case "necromancer": {
        // NECROMANCER - Death magic wielder with undead aura
        const deathPulse = 0.5 + Math.sin(t * 2) * 0.4;
        const skullFloat = Math.sin(t * 1.5) * 2 * scale;

        // Sickly green death aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(34, 197, 94, ${deathPulse * 0.25})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Black death robes
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 11 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 10 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 11 * scale,
          cy - bounce,
          cx + 9 * scale,
          cy + 14 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Green trim
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 10 * scale - bounce);
        ctx.moveTo(cx + 3 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Skeletal face with hood
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale - bounce,
          7 * scale,
          5 * scale,
          0,
          Math.PI,
          0
        );
        ctx.fill();
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hollow glowing eyes - layered glow
        ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Floating skull
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(
          cx + 10 * scale,
          cy - 4 * scale - bounce + skullFloat,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(
          cx + 9 * scale,
          cy - 5 * scale - bounce + skullFloat,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 11 * scale,
          cy - 5 * scale - bounce + skullFloat,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }
      case "shadow_knight": {
        // SHADOW KNIGHT - Armored dark warrior
        const darkPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const swordGleam = Math.sin(t * 4) * 0.15;

        // Dark aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(99, 102, 241, ${darkPulse * 0.25})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dark plate armor
        const armorGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        armorGrad.addColorStop(0, "#1e1b4b");
        armorGrad.addColorStop(0.3, "#312e81");
        armorGrad.addColorStop(0.5, "#3730a3");
        armorGrad.addColorStop(0.7, "#312e81");
        armorGrad.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 12 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Helmet
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 14 * scale - bounce,
          6 * scale,
          5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#312e81";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 15 * scale - bounce,
          5 * scale,
          4 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();

        // Visor slit with glowing eyes
        ctx.fillStyle = "#0f0a1a";
        ctx.fillRect(
          cx - 4 * scale,
          cy - 15 * scale - bounce,
          8 * scale,
          2 * scale
        );
        // Layered glow for eyes
        ctx.fillStyle = "rgba(129, 140, 248, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#818cf8";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dark sword
        ctx.save();
        ctx.translate(cx + 10 * scale, cy - 2 * scale - bounce);
        ctx.rotate(-0.3 + swordGleam);
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(-1.5 * scale, -12 * scale, 3 * scale, 14 * scale);
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(-2.5 * scale, 0, 5 * scale, 2 * scale);
        ctx.fillStyle = `rgba(129, 140, 248, ${0.5 + swordGleam * 2})`;
        ctx.fillRect(-0.5 * scale, -10 * scale, 1 * scale, 8 * scale);
        ctx.restore();
        break;
      }
    }
  }, [type, size, time, animated]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
// =============================================================================
// REGION/MAP ICONS
// =============================================================================
export type RegionType = "grassland" | "desert" | "winter" | "volcanic";
export const RegionIcon: React.FC<{
  type: RegionType;
  size?: number;
  locked?: boolean;
}> = ({ type, size = 60, locked = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 60;
    let bgColor = "#4a7c59";
    switch (type) {
      case "grassland":
        bgColor = "#4a7c59";
        break;
      case "desert":
        bgColor = "#c4a35a";
        break;
      case "winter":
        bgColor = "#6ba3be";
        break;
      case "volcanic":
        bgColor = "#8b3a3a";
        break;
    }
    ctx.fillStyle = locked ? "#4a4a4a" : bgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = locked ? "#333" : darkenColor(bgColor, 30);
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
    if (locked) {
      ctx.fillStyle = "#666";
      ctx.fillRect(cx - 8 * scale, cy - 2 * scale, 16 * scale, 14 * scale);
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy - 6 * scale, 6 * scale, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(cx, cy + 4 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    switch (type) {
      case "grassland":
        ctx.fillStyle = "#5d4037";
        ctx.fillRect(cx - 3 * scale, cy, 6 * scale, 14 * scale);
        ctx.fillStyle = "#2e7d32";
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#388e3c";
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "desert":
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(cx - 4 * scale, cy - 8 * scale, 8 * scale, 22 * scale);
        ctx.fillRect(cx - 14 * scale, cy - 4 * scale, 10 * scale, 6 * scale);
        ctx.fillRect(cx - 14 * scale, cy - 10 * scale, 6 * scale, 10 * scale);
        ctx.fillRect(cx + 4 * scale, cy, 10 * scale, 6 * scale);
        ctx.fillRect(cx + 8 * scale, cy - 8 * scale, 6 * scale, 12 * scale);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx + 12 * scale, cy - 14 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "winter":
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2.5 * scale;
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((i * Math.PI) / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -18 * scale);
          ctx.moveTo(0, -10 * scale);
          ctx.lineTo(-6 * scale, -14 * scale);
          ctx.moveTo(0, -10 * scale);
          ctx.lineTo(6 * scale, -14 * scale);
          ctx.stroke();
          ctx.restore();
        }
        break;
      case "volcanic":
        ctx.fillStyle = "#5d4037";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 20 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ff4400";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 10 * scale);
        ctx.quadraticCurveTo(
          cx,
          cy - 18 * scale,
          cx + 6 * scale,
          cy - 10 * scale
        );
        ctx.fill();
        ctx.fillStyle = "rgba(100,100,100,0.6)";
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 18 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 22 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }, [type, size, locked]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
// =============================================================================
// ANIMATED DECORATIVE SPRITES
// =============================================================================
export const AnimatedCastle: React.FC<{ size?: number }> = ({ size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 50);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2 + 20;
    const scale = size / 200;
    const t = time * 0.1;
    // Ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 60 * scale, 80 * scale, 25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Main castle base
    const baseGrad = ctx.createLinearGradient(
      cx - 60 * scale,
      0,
      cx + 60 * scale,
      0
    );
    baseGrad.addColorStop(0, "#4a3a2a");
    baseGrad.addColorStop(0.5, "#6b5b4b");
    baseGrad.addColorStop(1, "#4a3a2a");
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 70 * scale, cy + 50 * scale);
    ctx.lineTo(cx - 60 * scale, cy - 30 * scale);
    ctx.lineTo(cx + 60 * scale, cy - 30 * scale);
    ctx.lineTo(cx + 70 * scale, cy + 50 * scale);
    ctx.closePath();
    ctx.fill();
    // Castle wall detail
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(cx - 50 * scale, cy - 10 * scale, 100 * scale, 60 * scale);
    // Main gate
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(cx - 20 * scale, cy + 50 * scale);
    ctx.lineTo(cx - 20 * scale, cy + 10 * scale);
    ctx.arc(cx, cy + 10 * scale, 20 * scale, Math.PI, 0);
    ctx.lineTo(cx + 20 * scale, cy + 50 * scale);
    ctx.closePath();
    ctx.fill();
    // Draw towers
    const drawTowerFn = (x: number, y: number, w: number, h: number) => {
      const towerGrad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      towerGrad.addColorStop(0, "#5a4a3a");
      towerGrad.addColorStop(0.5, "#7a6a5a");
      towerGrad.addColorStop(1, "#5a4a3a");
      ctx.fillStyle = towerGrad;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y + h / 2);
      ctx.lineTo(x - w / 2 + 5, y - h / 2);
      ctx.lineTo(x + w / 2 - 5, y - h / 2);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8b4513";
      ctx.beginPath();
      ctx.moveTo(x - w / 2 - 5, y - h / 2);
      ctx.lineTo(x, y - h / 2 - w);
      ctx.lineTo(x + w / 2 + 5, y - h / 2);
      ctx.closePath();
      ctx.fill();
    };
    drawTowerFn(cx - 55 * scale, cy - 20 * scale, 30 * scale, 80 * scale);
    drawTowerFn(cx + 55 * scale, cy - 20 * scale, 30 * scale, 80 * scale);
    drawTowerFn(cx, cy - 50 * scale, 35 * scale, 100 * scale);
    // Windows with glow
    const windowGlow = 0.7 + Math.sin(t * 2) * 0.3;
    ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 15 * scale;
    ctx.fillRect(cx - 45 * scale, cy, 8 * scale, 12 * scale);
    ctx.fillRect(cx - 45 * scale, cy - 20 * scale, 8 * scale, 12 * scale);
    ctx.fillRect(cx + 37 * scale, cy, 8 * scale, 12 * scale);
    ctx.fillRect(cx + 37 * scale, cy - 20 * scale, 8 * scale, 12 * scale);
    ctx.shadowBlur = 0;
    // Flags
    const drawFlagFn = (x: number, y: number, s: number, color: string) => {
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(x - 2 * s, y, 4 * s, 25 * s);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + 2 * s, y);
      const flagW = 20 * s;
      const flagH = 15 * s;
      for (let i = 0; i <= flagW; i += 2) {
        const wave = Math.sin(t * 3 + i * 0.3) * 3 * s * (i / flagW);
        ctx.lineTo(x + 2 * s + i, y + wave);
      }
      ctx.lineTo(x + 2 * s + flagW, y + flagH);
      for (let i = flagW; i >= 0; i -= 2) {
        const wave = Math.sin(t * 3 + i * 0.3) * 3 * s * (i / flagW);
        ctx.lineTo(x + 2 * s + i, y + flagH + wave);
      }
      ctx.closePath();
      ctx.fill();
    };
    drawFlagFn(cx - 55 * scale, cy - 95 * scale, scale, "#ff6b35");
    drawFlagFn(cx + 55 * scale, cy - 95 * scale, scale, "#ff6b35");
    drawFlagFn(cx, cy - 145 * scale, scale * 1.3, "#ffd700");
  }, [size, time]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
export const MarchingEnemies: React.FC<{ size?: number }> = ({
  size = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 80);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = 60 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, 60);
    const t = time * 0.15;
    const colors = ["#ff6600", "#4a90d9", "#f5f5dc", "#2a2a4e", "#f0f0f0"];
    for (let i = 0; i < 8; i++) {
      const x = ((i * 45 + t * 30) % (size + 50)) - 25;
      const bounce = Math.abs(Math.sin(t * 2 + i)) * 5;
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x, 50, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(x, 35 - bounce, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.fillStyle = "#ffe0bd";
      ctx.beginPath();
      ctx.arc(x, 18 - bounce, 8, 0, Math.PI * 2);
      ctx.fill();
      // Hair
      ctx.fillStyle = "#4a3728";
      ctx.beginPath();
      ctx.ellipse(x, 12 - bounce, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(x - 3, 17 - bounce, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 3, 17 - bounce, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, time]);
  return <canvas ref={canvasRef} style={{ width: size, height: 60 }} />;
};
