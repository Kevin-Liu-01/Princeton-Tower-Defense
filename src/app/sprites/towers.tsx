"use client";
import React, { useRef, useCallback } from "react";
import type { TowerType } from "../types";
import { ISO_Y_RATIO } from "../constants";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";
import { lightenColor } from "./utils";

export const TowerSprite: React.FC<{
  type: TowerType;
  size?: number;
  level?: number;
  upgrade?: "A" | "B";
  animated?: boolean;
}> = ({ type, size = 48, level = 1, upgrade, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTower = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupSpriteCanvas(canvas, size, size);
    if (!ctx) return;
    const cx = size / 2;
    const cy = size / 2;
    // Unified scale - all towers fit in a consistent box
    const s = size / 52; // Standard scale for all towers
    const t = time * 0.05;

    // All towers now use consistent bounds:
    // - Top: cy - 22*s (about 42% from top)
    // - Bottom: cy + 22*s (about 42% from bottom)
    // - Left/Right: cx ± 20*s
    // This ensures no clipping regardless of tower type

    switch (type) {
      case "cannon": {
        // =====================================================================
        // NASSAU CANNON - Dark Military Bunker with Orange Vents
        // Based on reference: Dark gray/black bunker with glowing orange vents
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal base platform
        ctx.fillStyle = "#3a3a3a";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 18 * s;
          const py = cy + 16 * s + Math.sin(angle) * 9 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Base top surface (lighter)
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 16 * s;
          const py = cy + 12 * s + Math.sin(angle) * 8 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Main bunker body - isometric cube
        // Back face
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy + 10 * s);
        ctx.lineTo(cx - 12 * s, cy - 6 * s);
        ctx.lineTo(cx + 12 * s, cy - 6 * s);
        ctx.lineTo(cx + 14 * s, cy + 10 * s);
        ctx.closePath();
        ctx.fill();

        // Left face (dark)
        const leftGrad = ctx.createLinearGradient(cx - 14 * s, cy, cx - 2 * s, cy);
        leftGrad.addColorStop(0, "#252528");
        leftGrad.addColorStop(1, "#35353a");
        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy + 10 * s);
        ctx.lineTo(cx - 12 * s, cy - 6 * s);
        ctx.lineTo(cx - 2 * s, cy - 2 * s);
        ctx.lineTo(cx - 2 * s, cy + 14 * s);
        ctx.closePath();
        ctx.fill();

        // Right face (lighter)
        const rightGrad = ctx.createLinearGradient(cx + 2 * s, cy, cx + 14 * s, cy);
        rightGrad.addColorStop(0, "#35353a");
        rightGrad.addColorStop(1, "#45454a");
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 14 * s, cy + 10 * s);
        ctx.lineTo(cx + 12 * s, cy - 6 * s);
        ctx.lineTo(cx + 2 * s, cy - 2 * s);
        ctx.lineTo(cx + 2 * s, cy + 14 * s);
        ctx.closePath();
        ctx.fill();

        // Top face
        ctx.fillStyle = "#3a3a3f";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy - 6 * s);
        ctx.lineTo(cx - 2 * s, cy - 10 * s);
        ctx.lineTo(cx + 12 * s, cy - 6 * s);
        ctx.lineTo(cx + 2 * s, cy - 2 * s);
        ctx.closePath();
        ctx.fill();

        // Panel lines on faces
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 0.5 * s;
        // Left face panels
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, cy - 4 * s);
        ctx.lineTo(cx - 8 * s, cy + 8 * s);
        ctx.stroke();
        // Right face panels
        ctx.beginPath();
        ctx.moveTo(cx + 10 * s, cy - 4 * s);
        ctx.lineTo(cx + 8 * s, cy + 8 * s);
        ctx.stroke();
        if (level >= 2) {
          ctx.beginPath();
          ctx.moveTo(cx - 10 * s, cy + 2 * s);
          ctx.lineTo(cx - 2 * s, cy + 2 * s);
          ctx.stroke();
        }
        if (level >= 3) {
          ctx.fillStyle = "#3a3a3f";
          ctx.beginPath();
          ctx.arc(cx + 6 * s, cy + 4 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Orange glowing vents on left face
        const ventGlow = animated ? 0.6 + Math.sin(t * 4) * 0.3 : 0.7;
        const ventCount = 2 + level;
        // Vent housings
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx - 11 * s, cy - 2 * s, 4 * s, ventCount * 2 * s);
        // Vent slats with glow
        ctx.fillStyle = `rgba(255, 120, 20, ${ventGlow})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 8 * s;
        for (let i = 0; i < ventCount; i++) {
          ctx.fillRect(cx - 10.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
        }
        ctx.shadowBlur = 0;

        // Orange glowing vents on right face
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx + 7 * s, cy - 2 * s, 4 * s, ventCount * 2 * s);
        ctx.fillStyle = `rgba(255, 120, 20, ${ventGlow})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 8 * s;
        for (let i = 0; i < ventCount; i++) {
          ctx.fillRect(cx + 7.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
        }
        ctx.shadowBlur = 0;

        // Central turret dome
        ctx.fillStyle = "#2d2d32";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38383d";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Turret ring detail
        ctx.strokeStyle = level >= 3 ? "#c9a227" : "#4a4a4f";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 9 * s, 9 * s, 4.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Cannon barrel assembly
        ctx.save();
        ctx.translate(cx + 2 * s, cy - 10 * s);
        ctx.rotate(-0.25);

        // Barrel mount
        ctx.fillStyle = "#2a2a2f";
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main barrel
        const barrelGrad = ctx.createLinearGradient(0, -4 * s, 0, 4 * s);
        barrelGrad.addColorStop(0, "#4a4a4f");
        barrelGrad.addColorStop(0.3, "#3a3a3f");
        barrelGrad.addColorStop(0.7, "#2a2a2f");
        barrelGrad.addColorStop(1, "#1a1a1f");
        ctx.fillStyle = barrelGrad;
        ctx.beginPath();
        ctx.moveTo(0, -3.5 * s);
        ctx.lineTo(22 * s, -2.5 * s);
        ctx.lineTo(22 * s, 2.5 * s);
        ctx.lineTo(0, 3.5 * s);
        ctx.closePath();
        ctx.fill();

        // Barrel reinforcement rings
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#55555a";
        ctx.fillRect(5 * s, -4 * s, 3 * s, 8 * s);
        if (level >= 2) ctx.fillRect(12 * s, -3.5 * s, 2.5 * s, 7 * s);
        if (level >= 3) ctx.fillRect(18 * s, -3 * s, 2 * s, 6 * s);

        // Muzzle brake
        ctx.fillStyle = "#3a3a3f";
        ctx.fillRect(21 * s, -3.5 * s, 4 * s, 7 * s);
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.ellipse(25 * s, 0, 3 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle glow
        ctx.fillStyle = `rgba(255, 100, 0, ${ventGlow * 0.5})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 10 * s;
        ctx.beginPath();
        ctx.arc(26 * s, 0, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Antenna/sensor on top
        ctx.fillStyle = "#2a2a2f";
        ctx.fillRect(cx - 1 * s, cy - 18 * s, 2 * s, 6 * s);
        ctx.fillStyle = "#00ff00";
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 4 * s;
        ctx.beginPath();
        ctx.arc(cx, cy - 19 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(180, 195, 210, 0.1)" : "rgba(255, 180, 0, 0.1)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const gPulse = animated ? 0.5 + Math.sin(t * 8) * 0.3 : 0.6;
            ctx.fillStyle = `rgba(200, 210, 220, ${gPulse * 0.6})`;
            ctx.shadowColor = "#b0c0d0";
            ctx.shadowBlur = 15 * s;
            ctx.beginPath();
            ctx.arc(cx + 18 * s, cy - 14 * s, 3.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (animated) {
              for (let i = 0; i < 4; i++) {
                const bx = cx + (20 + i * 2) * s;
                const by = cy - (14 + Math.sin(t * 10 + i) * 2) * s;
                ctx.fillStyle = `rgba(${180 + i * 20}, ${190 + i * 15}, ${200 + i * 10}, ${0.6 - i * 0.12})`;
                ctx.beginPath();
                ctx.arc(bx, by, (1.2 - i * 0.2) * s, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.strokeStyle = `rgba(180, 195, 210, ${gPulse * 0.4})`;
            ctx.lineWidth = 1.5 * s;
            ctx.setLineDash([2 * s, 2 * s]);
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          } else {
            const fPulse = animated ? 0.5 + Math.sin(t * 4) * 0.25 : 0.6;
            if (animated) {
              for (let i = 0; i < 5; i++) {
                const fx = cx + (16 + i * 2.5) * s;
                const fy = cy - (12 + Math.sin(t * 5 + i) * 2.5) * s;
                ctx.fillStyle = `rgba(255, ${80 + i * 40}, 0, ${fPulse * (1 - i * 0.15)})`;
                ctx.shadowColor = "#ff4400";
                ctx.shadowBlur = 8 * s;
                ctx.beginPath();
                ctx.arc(fx, fy, (2.5 - i * 0.3) * s, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.shadowBlur = 0;
            }
            ctx.fillStyle = `rgba(255, 200, 0, ${fPulse * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 14 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, "#ff6600", upgrade);
        break;
      }
      case "library": {
        // =====================================================================
        // FIRESTONE LIBRARY - Purple Gothic Tower with Ornate Architecture
        // Based on reference: Tall purple/gray stone tower with pointed spire
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal base platform
        ctx.fillStyle = "#4a4050";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 16 * s;
          const py = cy + 17 * s + Math.sin(angle) * 8 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Base platform top
        ctx.fillStyle = "#5a5060";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 14 * s;
          const py = cy + 14 * s + Math.sin(angle) * 7 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Main tower body - left face (darker purple-gray)
        const leftWallGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
        leftWallGrad.addColorStop(0, "#3a3545");
        leftWallGrad.addColorStop(1, "#4a4555");
        ctx.fillStyle = leftWallGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy + 12 * s);
        ctx.lineTo(cx - 10 * s, cy - 8 * s);
        ctx.lineTo(cx, cy - 4 * s);
        ctx.lineTo(cx, cy + 16 * s);
        ctx.closePath();
        ctx.fill();

        // Main tower body - right face (lighter)
        const rightWallGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
        rightWallGrad.addColorStop(0, "#4a4555");
        rightWallGrad.addColorStop(1, "#5a5565");
        ctx.fillStyle = rightWallGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s, cy + 12 * s);
        ctx.lineTo(cx + 10 * s, cy - 8 * s);
        ctx.lineTo(cx, cy - 4 * s);
        ctx.lineTo(cx, cy + 16 * s);
        ctx.closePath();
        ctx.fill();

        // Stone block pattern - left face
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * s;
        for (let row = 0; row < 5; row++) {
          const y = cy + 10 * s - row * 4 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 11 * s + row * 0.5 * s, y);
          ctx.lineTo(cx - 1 * s, y);
          ctx.stroke();
        }
        // Stone block pattern - right face
        for (let row = 0; row < 5; row++) {
          const y = cy + 10 * s - row * 4 * s;
          ctx.beginPath();
          ctx.moveTo(cx + 1 * s, y);
          ctx.lineTo(cx + 11 * s - row * 0.5 * s, y);
          ctx.stroke();
        }

        // Window glow colors (defined early for level-based details)
        const glowIntensity = (animated ? 0.6 + Math.sin(t * 2) * 0.3 : 0.8) * (0.7 + level * 0.1);
        const libR = level === 4 && upgrade === "A" ? 255 : level === 4 && upgrade === "B" ? 100 : 160;
        const libG = level === 4 && upgrade === "A" ? 140 : level === 4 && upgrade === "B" ? 180 : 80;
        const libB = level === 4 && upgrade === "A" ? 40 : level === 4 && upgrade === "B" ? 255 : 220;
        const libShadow = level === 4 && upgrade === "A" ? "#ff8c28" : level === 4 && upgrade === "B" ? "#64b4ff" : "#a050dc";

        // Level 2+: Decorative shield/crest emblem on left face
        if (level >= 2) {
          const crestX = cx - 7 * s;
          const crestY = cy - 5 * s;
          ctx.fillStyle = level >= 3 ? "#c9a227" : "#6a6575";
          ctx.beginPath();
          ctx.moveTo(crestX, crestY - 1 * s);
          ctx.lineTo(crestX + 1 * s, crestY);
          ctx.lineTo(crestX, crestY + 1 * s);
          ctx.lineTo(crestX - 1 * s, crestY);
          ctx.closePath();
          ctx.fill();
        }

        // Decorative trim bands
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#6a6575";
        ctx.fillRect(cx - 11 * s, cy + 8 * s, 10 * s, 1.5 * s);
        ctx.fillRect(cx + 1 * s, cy + 8 * s, 10 * s, 1.5 * s);
        ctx.fillRect(cx - 10 * s, cy - 2 * s, 9 * s, 1.5 * s);
        ctx.fillRect(cx + 1 * s, cy - 2 * s, 9 * s, 1.5 * s);

        // Level 3+: Second row of smaller windows below main arched windows
        if (level >= 3) {
          const smallWinY = cy + 8 * s;
          ctx.fillStyle = "#1a1520";
          ctx.fillRect(cx - 9 * s, smallWinY, 3 * s, 2 * s);
          ctx.fillRect(cx + 6 * s, smallWinY, 3 * s, 2 * s);
          ctx.fillStyle = `rgba(${libR}, ${libG}, ${libB}, ${glowIntensity * 0.7})`;
          ctx.shadowColor = libShadow;
          ctx.shadowBlur = 4 * s;
          ctx.fillRect(cx - 8.5 * s, smallWinY + 0.25 * s, 2 * s, 1.5 * s);
          ctx.fillRect(cx + 6.5 * s, smallWinY + 0.25 * s, 2 * s, 1.5 * s);
          ctx.shadowBlur = 0;
        }

        // Purple arched windows - left side
        ctx.fillStyle = "#1a1520";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * s, cy + 6 * s);
        ctx.lineTo(cx - 9 * s, cy + 2 * s);
        ctx.arc(cx - 7 * s, cy + 2 * s, 2 * s, Math.PI, 0);
        ctx.lineTo(cx - 5 * s, cy + 6 * s);
        ctx.closePath();
        ctx.fill();
        // Window glow
        ctx.fillStyle = `rgba(${libR}, ${libG}, ${libB}, ${glowIntensity})`;
        ctx.shadowColor = libShadow;
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 8.5 * s, cy + 5.5 * s);
        ctx.lineTo(cx - 8.5 * s, cy + 2.5 * s);
        ctx.arc(cx - 7 * s, cy + 2.5 * s, 1.5 * s, Math.PI, 0);
        ctx.lineTo(cx - 5.5 * s, cy + 5.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Purple arched windows - right side
        ctx.fillStyle = "#1a1520";
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s, cy + 6 * s);
        ctx.lineTo(cx + 5 * s, cy + 2 * s);
        ctx.arc(cx + 7 * s, cy + 2 * s, 2 * s, Math.PI, 0);
        ctx.lineTo(cx + 9 * s, cy + 6 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(${libR}, ${libG}, ${libB}, ${glowIntensity})`;
        ctx.shadowColor = libShadow;
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 5.5 * s, cy + 5.5 * s);
        ctx.lineTo(cx + 5.5 * s, cy + 2.5 * s);
        ctx.arc(cx + 7 * s, cy + 2.5 * s, 1.5 * s, Math.PI, 0);
        ctx.lineTo(cx + 8.5 * s, cy + 5.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Large circular rose window (center, upper)
        ctx.fillStyle = "#1a1520";
        ctx.beginPath();
        ctx.arc(cx, cy - 5 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        // Rose window glow
        const roseGrad = ctx.createRadialGradient(cx, cy - 5 * s, 0, cx, cy - 5 * s, 3.5 * s);
        roseGrad.addColorStop(0, `rgba(${Math.min(libR + 40, 255)}, ${Math.min(libG + 40, 255)}, ${Math.min(libB + 35, 255)}, ${glowIntensity})`);
        roseGrad.addColorStop(0.5, `rgba(${libR}, ${libG}, ${libB}, ${glowIntensity * 0.8})`);
        roseGrad.addColorStop(1, `rgba(${Math.floor(libR * 0.6)}, ${Math.floor(libG * 0.5)}, ${Math.floor(libB * 0.8)}, ${glowIntensity * 0.5})`);
        ctx.fillStyle = roseGrad;
        ctx.shadowColor = libShadow;
        ctx.shadowBlur = 10 * s;
        ctx.beginPath();
        ctx.arc(cx, cy - 5 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Rose window spokes
        ctx.strokeStyle = "#2a2535";
        ctx.lineWidth = 0.6 * s;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 5 * s);
          ctx.lineTo(cx + Math.cos(angle) * 3 * s, cy - 5 * s + Math.sin(angle) * 3 * s);
          ctx.stroke();
        }

        // Tower top/roof section
        ctx.fillStyle = "#3a3545";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, cy - 8 * s);
        ctx.lineTo(cx - 8 * s, cy - 12 * s);
        ctx.lineTo(cx + 8 * s, cy - 12 * s);
        ctx.lineTo(cx + 10 * s, cy - 8 * s);
        ctx.closePath();
        ctx.fill();

        // Gothic spire
        ctx.fillStyle = "#4a4555";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy - 12 * s);
        ctx.lineTo(cx, cy - 22 * s);
        ctx.lineTo(cx + 6 * s, cy - 12 * s);
        ctx.closePath();
        ctx.fill();
        // Spire highlight
        ctx.fillStyle = "#5a5565";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx + 6 * s, cy - 12 * s);
        ctx.lineTo(cx + 2 * s, cy - 12 * s);
        ctx.lineTo(cx, cy - 18 * s);
        ctx.closePath();
        ctx.fill();

        // Spire orb with purple glow
        ctx.fillStyle = `rgba(${Math.min(libR + 20, 255)}, ${Math.min(libG + 20, 255)}, ${Math.min(libB + 35, 255)}, ${glowIntensity})`;
        ctx.shadowColor = libShadow;
        ctx.shadowBlur = 8 * s;
        ctx.beginPath();
        ctx.arc(cx, cy - 22 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy - 22 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Corner buttresses/pillars
        ctx.fillStyle = "#3a3545";
        // Left buttress
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy + 12 * s);
        ctx.lineTo(cx - 14 * s, cy + 8 * s);
        ctx.lineTo(cx - 12 * s, cy - 6 * s);
        ctx.lineTo(cx - 10 * s, cy - 8 * s);
        ctx.lineTo(cx - 10 * s, cy + 10 * s);
        ctx.closePath();
        ctx.fill();
        // Right buttress
        ctx.fillStyle = "#5a5565";
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s, cy + 12 * s);
        ctx.lineTo(cx + 14 * s, cy + 8 * s);
        ctx.lineTo(cx + 12 * s, cy - 6 * s);
        ctx.lineTo(cx + 10 * s, cy - 8 * s);
        ctx.lineTo(cx + 10 * s, cy + 10 * s);
        ctx.closePath();
        ctx.fill();

        // Entrance door
        ctx.fillStyle = "#1a1520";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * s, cy + 16 * s);
        ctx.lineTo(cx - 3 * s, cy + 11 * s);
        ctx.arc(cx, cy + 11 * s, 3 * s, Math.PI, 0);
        ctx.lineTo(cx + 3 * s, cy + 16 * s);
        ctx.closePath();
        ctx.fill();
        // Door glow
        ctx.fillStyle = `rgba(${libR}, ${libG}, ${libB}, ${glowIntensity * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, cy + 15 * s);
        ctx.lineTo(cx - 2 * s, cy + 12 * s);
        ctx.arc(cx, cy + 12 * s, 2 * s, Math.PI, 0);
        ctx.lineTo(cx + 2 * s, cy + 15 * s);
        ctx.closePath();
        ctx.fill();

        // Floating magic particles
        if (animated) {
          ctx.fillStyle = `rgba(${Math.min(libR + 20, 255)}, ${Math.min(libG + 40, 255)}, ${Math.min(libB + 35, 255)}, ${0.5 + Math.sin(t * 3) * 0.3})`;
          for (let i = 0; i < 2 + level * 2; i++) {
            const particleAngle = t * 0.8 + (i * Math.PI * 2) / 5;
            const particleR = 10 * s + Math.sin(t * 2 + i) * 2 * s;
            const px = cx + Math.cos(particleAngle) * particleR;
            const py = cy - 5 * s + Math.sin(particleAngle) * particleR * 0.4;
            ctx.beginPath();
            ctx.arc(px, py, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(180, 130, 40, 0.12)" : "rgba(80, 160, 255, 0.15)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const sPulse = animated ? 0.4 + Math.sin(t * 3) * 0.25 : 0.5;
            ctx.strokeStyle = `rgba(200, 150, 50, ${sPulse * 0.6})`;
            ctx.lineWidth = 1.5 * s;
            if (animated) {
              for (let i = 0; i < 3; i++) {
                const ringR = (6 + ((t * 8 + i * 4) % 12)) * s;
                const ringAlpha = Math.max(0, 1 - ((t * 8 + i * 4) % 12) / 12);
                ctx.strokeStyle = `rgba(200, 150, 50, ${ringAlpha * 0.6})`;
                ctx.beginPath();
                ctx.ellipse(cx, cy + 12 * s, ringR, ringR * 0.4, 0, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
            ctx.fillStyle = `rgba(180, 130, 40, ${sPulse * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 14 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(140, 100, 30, ${sPulse * 0.5})`;
            ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.moveTo(cx - 8 * s, cy + 14 * s);
            ctx.lineTo(cx - 3 * s, cy + 10 * s);
            ctx.lineTo(cx + 2 * s, cy + 15 * s);
            ctx.lineTo(cx + 7 * s, cy + 11 * s);
            ctx.stroke();
          } else {
            const iPulse = animated ? 0.5 + Math.sin(t * 2.5) * 0.3 : 0.6;
            ctx.fillStyle = `rgba(180, 220, 255, ${iPulse * 0.25})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8 * s, 16 * s, 8 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            if (animated) {
              ctx.fillStyle = `rgba(200, 240, 255, ${0.5 + Math.sin(t * 3) * 0.3})`;
              for (let i = 0; i < 6; i++) {
                const sAngle = t * 0.5 + (i * Math.PI) / 3;
                const sr = (8 + Math.sin(t + i) * 3) * s;
                const sx = cx + Math.cos(sAngle) * sr;
                const sy = cy - 2 * s + Math.sin(sAngle) * sr * 0.4;
                drawStar(ctx, sx, sy, 1.5 * s, 0.5 * s);
              }
            }
            ctx.fillStyle = `rgba(100, 200, 255, ${iPulse})`;
            ctx.shadowColor = "#66ccff";
            ctx.shadowBlur = 8 * s;
            ctx.beginPath();
            ctx.arc(cx, cy - 22 * s, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, level === 4 && upgrade === "A" ? "#ff8c28" : level === 4 && upgrade === "B" ? "#64b4ff" : "#b464ff", upgrade);
        break;
      }
      case "lab": {
        // =====================================================================
        // E-QUAD LAB - Industrial Tesla Coil with Cyan Energy Orb
        // Based on reference: Blue-gray industrial building with glowing orb
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal base platform
        ctx.fillStyle = "#3a4550";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 16 * s;
          const py = cy + 17 * s + Math.sin(angle) * 8 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Base top surface
        ctx.fillStyle = "#4a5560";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 14 * s;
          const py = cy + 14 * s + Math.sin(angle) * 7 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Main building body - left face (darker blue-gray)
        const leftLabGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
        leftLabGrad.addColorStop(0, "#2a3a45");
        leftLabGrad.addColorStop(1, "#3a4a55");
        ctx.fillStyle = leftLabGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy + 12 * s);
        ctx.lineTo(cx - 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy + 2 * s);
        ctx.lineTo(cx, cy + 16 * s);
        ctx.closePath();
        ctx.fill();

        // Main building body - right face (lighter)
        const rightLabGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
        rightLabGrad.addColorStop(0, "#3a4a55");
        rightLabGrad.addColorStop(1, "#4a5a65");
        ctx.fillStyle = rightLabGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s, cy + 12 * s);
        ctx.lineTo(cx + 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy + 2 * s);
        ctx.lineTo(cx, cy + 16 * s);
        ctx.closePath();
        ctx.fill();

        // Building top face
        ctx.fillStyle = "#4a5a65";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy - 6 * s);
        ctx.lineTo(cx + 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Industrial panel lines - left
        ctx.strokeStyle = "#1a2a35";
        ctx.lineWidth = 0.6 * s;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 10 * s + i * 3 * s, cy + 10 * s);
          ctx.lineTo(cx - 9 * s + i * 3 * s, cy);
          ctx.stroke();
        }
        // Industrial panel lines - right
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + 4 * s + i * 3 * s, cy + 10 * s);
          ctx.lineTo(cx + 3 * s + i * 3 * s, cy);
          ctx.stroke();
        }

        // Cyan glowing windows - left face
        const labGlow = animated ? 0.6 + Math.sin(t * 2) * 0.25 : 0.7;
        ctx.fillStyle = "#0a1520";
        ctx.fillRect(cx - 9 * s, cy + 4 * s, 5 * s, 5 * s);
        ctx.fillStyle = `rgba(0, 200, 255, ${labGlow})`;
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 6 * s;
        ctx.fillRect(cx - 8 * s, cy + 5 * s, 3 * s, 3 * s);
        ctx.shadowBlur = 0;

        // Cyan glowing windows - right face
        ctx.fillStyle = "#0a1520";
        ctx.fillRect(cx + 4 * s, cy + 4 * s, 5 * s, 5 * s);
        ctx.fillStyle = `rgba(0, 200, 255, ${labGlow})`;
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 6 * s;
        ctx.fillRect(cx + 5 * s, cy + 5 * s, 3 * s, 3 * s);
        ctx.shadowBlur = 0;

        // Ventilation unit on top
        ctx.fillStyle = "#3a4a55";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy - 4 * s);
        ctx.lineTo(cx - 5 * s, cy - 8 * s);
        ctx.lineTo(cx + 5 * s, cy - 8 * s);
        ctx.lineTo(cx + 6 * s, cy - 4 * s);
        ctx.closePath();
        ctx.fill();
        // Vent slots
        ctx.fillStyle = "#1a2a35";
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx - 4 * s + i * 3 * s, cy - 7 * s, 2 * s, 2 * s);
        }

        // Tesla coil tower (taller) - moved down to connect with base
        ctx.fillStyle = "#2a3a45";
        ctx.fillRect(cx - 2 * s, cy - 17 * s, 4 * s, 9 * s);
        // Tower highlight
        ctx.fillStyle = "#3a4a55";
        ctx.fillRect(cx, cy - 17 * s, 2 * s, 9 * s);

        // Coil rings (copper colored) - spread out more, moved down
        ctx.strokeStyle = level >= 3 ? "#c9a227" : "#b8860b";
        ctx.lineWidth = (1.5 + (level >= 3 ? 0.5 : 0)) * s;
        // Extra ring at the bottom
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4.5 * s, 6 * s, 1.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Main coil rings
        for (let i = 0; i < 3 + level; i++) {
          const ringY = cy - 7 * s - i * 2.5 * s;
          const ringW = 5.5 * s - i * 0.5 * s;
          ctx.beginPath();
          ctx.ellipse(cx, ringY, ringW, 1.5 * s, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Energy orb at top - large cyan glow - moved down
        const orbY = cy - 19 * s;
        const orbScale = 0.8 + level * 0.1;
        const orbPulse = (animated ? 1 + Math.sin(t * 3) * 0.15 : 1) * orbScale;
        // Outer glow
        const orbGrad = ctx.createRadialGradient(cx, orbY, 0, cx, orbY, 8 * s * orbPulse);
        orbGrad.addColorStop(0, `rgba(100, 255, 255, ${labGlow})`);
        orbGrad.addColorStop(0.3, `rgba(0, 200, 255, ${labGlow * 0.7})`);
        orbGrad.addColorStop(0.6, `rgba(0, 150, 255, ${labGlow * 0.4})`);
        orbGrad.addColorStop(1, "rgba(0, 100, 200, 0)");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(cx, orbY, 8 * s * orbPulse, 0, Math.PI * 2);
        ctx.fill();

        // Main orb
        ctx.fillStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 15 * s;
        ctx.beginPath();
        ctx.arc(cx, orbY, 5 * s * orbPulse, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, orbY, 2.5 * s * orbPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Electric arcs emanating from orb
        if (animated) {
          ctx.strokeStyle = `rgba(100, 255, 255, ${0.7 + Math.sin(t * 5) * 0.3})`;
          ctx.lineWidth = 1.2 * s;
          for (let i = 0; i < 3 + level * 2; i++) {
            const arcAngle = t * 2 + (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(cx, orbY);
            let ax = cx, ay = orbY;
            for (let j = 0; j < 4; j++) {
              const dist = (3 + j * 2.5) * s;
              const jitter = Math.sin(t * 12 + i * 2 + j) * 2 * s;
              ax = cx + Math.cos(arcAngle) * dist + jitter;
              ay = orbY + Math.sin(arcAngle) * dist * 0.5 + jitter * 0.5;
              ctx.lineTo(ax, ay);
            }
            ctx.stroke();
          }
        }

        // Ground electricity effect
        if (animated) {
          ctx.strokeStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(t * 8) * 0.2})`;
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 3; i++) {
            const boltX = cx - 8 * s + i * 8 * s;
            ctx.beginPath();
            ctx.moveTo(boltX, cy + 12 * s);
            ctx.lineTo(boltX + 1.5 * s, cy + 8 * s);
            ctx.lineTo(boltX - 0.5 * s, cy + 6 * s);
            ctx.lineTo(boltX + 1 * s, cy + 4 * s);
            ctx.stroke();
          }
        }

        // Engineering emblem (gear icon)
        ctx.fillStyle = "#00ccff";
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 4 * s;
        ctx.beginPath();
        ctx.arc(cx, cy + 10 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2a3a45";
        ctx.beginPath();
        ctx.arc(cx, cy + 10 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Level 2+: Second smaller set of windows on building faces
        if (level >= 2) {
          const smallWinSize = 2 * s;
          ctx.fillStyle = "#0a1520";
          ctx.fillRect(cx - 9 * s, cy + 0 * s, smallWinSize, smallWinSize);
          ctx.fillRect(cx + 7 * s, cy + 0 * s, smallWinSize, smallWinSize);
          ctx.fillStyle = `rgba(0, 200, 255, ${labGlow * 0.8})`;
          ctx.shadowColor = "#00ccff";
          ctx.shadowBlur = 4 * s;
          ctx.fillRect(cx - 8.5 * s, cy + 0.25 * s, smallWinSize - 0.5 * s, smallWinSize - 0.5 * s);
          ctx.fillRect(cx + 7.5 * s, cy + 0.25 * s, smallWinSize - 0.5 * s, smallWinSize - 0.5 * s);
          ctx.shadowBlur = 0;
        }

        // Level 3+: Pipe/conduit details connecting coil to building
        if (level >= 3) {
          ctx.strokeStyle = "#3a4a55";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 2 * s, cy - 4.5 * s);
          ctx.lineTo(cx - 6 * s, cy + 2 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 2 * s, cy - 4.5 * s);
          ctx.lineTo(cx + 6 * s, cy + 2 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4.5 * s);
          ctx.lineTo(cx, cy + 4 * s);
          ctx.stroke();
        }

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(50, 200, 80, 0.1)" : "rgba(255, 220, 50, 0.12)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const bPulse = animated ? 0.5 + Math.sin(t * 5) * 0.3 : 0.6;
            ctx.strokeStyle = `rgba(80, 220, 100, ${bPulse * 0.8})`;
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 19 * s);
            ctx.lineTo(cx, cy - 30 * s);
            ctx.stroke();
            ctx.fillStyle = `rgba(100, 255, 120, ${bPulse})`;
            ctx.shadowColor = "#50ff60";
            ctx.shadowBlur = 12 * s;
            ctx.beginPath();
            ctx.arc(cx, cy - 30 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (animated) {
              for (let i = 0; i < 4; i++) {
                const lAngle = t * 2 + (i * Math.PI) / 2;
                const lx = cx + Math.cos(lAngle) * 5 * s;
                const ly = cy - 30 * s + Math.sin(lAngle) * 2 * s;
                ctx.strokeStyle = `rgba(80, ${200 + i * 15}, 100, ${0.6 - i * 0.1})`;
                ctx.lineWidth = 1 * s;
                ctx.beginPath();
                ctx.moveTo(cx, cy - 30 * s);
                ctx.lineTo(lx, ly);
                ctx.stroke();
              }
            }
          } else {
            const cPulse = animated ? 0.5 + Math.sin(t * 4) * 0.3 : 0.6;
            if (animated) {
              ctx.strokeStyle = `rgba(255, 220, 80, ${cPulse * 0.8})`;
              ctx.lineWidth = 1.5 * s;
              for (let i = 0; i < 5; i++) {
                const arcAngle = t * 3 + (i * Math.PI * 2) / 5;
                const endX = cx + Math.cos(arcAngle) * 14 * s;
                const endY = cy + Math.sin(arcAngle) * 7 * s;
                ctx.beginPath();
                ctx.moveTo(cx, cy - 19 * s);
                let ax = cx, ay = cy - 19 * s;
                for (let j = 0; j < 3; j++) {
                  ax += (endX - cx) / 3 + Math.sin(t * 10 + i + j) * 2 * s;
                  ay += (endY - (cy - 19 * s)) / 3 + Math.cos(t * 10 + i + j) * s;
                  ctx.lineTo(ax, ay);
                }
                ctx.stroke();
              }
            }
            const orbPositions = [
              { x: cx - 8 * s, y: cy - 5 * s },
              { x: cx + 8 * s, y: cy - 5 * s },
              { x: cx, y: cy + 2 * s },
            ];
            for (const orb of orbPositions) {
              ctx.fillStyle = `rgba(255, 220, 80, ${cPulse * 0.6})`;
              ctx.shadowColor = "#ffdd44";
              ctx.shadowBlur = 6 * s;
              ctx.beginPath();
              ctx.arc(orb.x, orb.y, 2 * s, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowBlur = 0;
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, "#00ffff", upgrade);
        break;
      }
      case "arch": {
        // =====================================================================
        // BLAIR ARCH - Gothic Arch with Central Spire and Dynamic Portal
        // Tan stone base with thick arch and single central triangle spike
        // Energy: green default, RED for Shockwave (A), BLUE for Symphony (B)
        // =====================================================================

        // Dynamic energy colors based on upgrade
        const eR = level === 4 && upgrade === "A" ? 255 : level === 4 && upgrade === "B" ? 100 : 100;
        const eG = level === 4 && upgrade === "A" ? 80 : level === 4 && upgrade === "B" ? 180 : 255;
        const eB = level === 4 && upgrade === "A" ? 80 : level === 4 && upgrade === "B" ? 255 : 150;
        const eShadow = level === 4 && upgrade === "A" ? "#ff3030" : level === 4 && upgrade === "B" ? "#4090ff" : "#50ff80";
        const eIndicator = level === 4 && upgrade === "A" ? "#ff5050" : level === 4 && upgrade === "B" ? "#64b4ff" : "#50ff80";

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal base platform (tan/sandstone color)
        ctx.fillStyle = "#8a7a60";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 18 * s;
          const py = cy + 17 * s + Math.sin(angle) * 9 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Base top (lighter tan)
        ctx.fillStyle = "#9a8a70";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 16 * s;
          const py = cy + 14 * s + Math.sin(angle) * 8 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Level 2+: Rune circle on base platform
        if (level >= 2) {
          ctx.strokeStyle = `rgba(${eR}, ${eG}, ${eB}, 0.2)`;
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 14 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // THICK ARCH STRUCTURE - Main body
        // Left wall of arch (dark tan)
        const leftArchGrad = ctx.createLinearGradient(cx - 16 * s, cy, cx - 6 * s, cy);
        leftArchGrad.addColorStop(0, "#7a6a50");
        leftArchGrad.addColorStop(1, "#8a7a60");
        ctx.fillStyle = leftArchGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 16 * s, cy + 12 * s);
        ctx.lineTo(cx - 14 * s, cy - 4 * s);
        ctx.lineTo(cx - 6 * s, cy - 2 * s);
        ctx.lineTo(cx - 8 * s, cy + 14 * s);
        ctx.closePath();
        ctx.fill();

        // Right wall of arch (lighter tan)
        const rightArchGrad = ctx.createLinearGradient(cx + 6 * s, cy, cx + 16 * s, cy);
        rightArchGrad.addColorStop(0, "#8a7a60");
        rightArchGrad.addColorStop(1, "#9a8a70");
        ctx.fillStyle = rightArchGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 16 * s, cy + 12 * s);
        ctx.lineTo(cx + 14 * s, cy - 4 * s);
        ctx.lineTo(cx + 6 * s, cy - 2 * s);
        ctx.lineTo(cx + 8 * s, cy + 14 * s);
        ctx.closePath();
        ctx.fill();

        // Thick arch top connecting walls (stone lintel)
        ctx.fillStyle = "#8a7a60";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy - 4 * s);
        ctx.lineTo(cx - 12 * s, cy - 10 * s);
        ctx.lineTo(cx + 12 * s, cy - 10 * s);
        ctx.lineTo(cx + 14 * s, cy - 4 * s);
        ctx.lineTo(cx + 6 * s, cy - 2 * s);
        ctx.lineTo(cx - 6 * s, cy - 2 * s);
        ctx.closePath();
        ctx.fill();

        // Top surface of arch
        ctx.fillStyle = "#9a8a70";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy - 10 * s);
        ctx.lineTo(cx, cy - 14 * s);
        ctx.lineTo(cx + 12 * s, cy - 10 * s);
        ctx.closePath();
        ctx.fill();

        // Stone block pattern on arch walls
        ctx.strokeStyle = level >= 3 ? "rgba(180,150,60,0.15)" : "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.5 * s;
        for (let row = 0; row < 3 + level; row++) {
          const y = cy + 10 * s - row * (16 / (3 + level)) * s;
          ctx.beginPath();
          ctx.moveTo(cx - 14 * s + row * s, y);
          ctx.lineTo(cx - 7 * s, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 7 * s, y);
          ctx.lineTo(cx + 14 * s - row * s, y);
          ctx.stroke();
        }

        // Level 2+: Vertical pilaster detail on walls
        if (level >= 2) {
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 11 * s, cy + 12 * s);
          ctx.lineTo(cx - 10 * s, cy - 3 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 11 * s, cy + 12 * s);
          ctx.lineTo(cx + 10 * s, cy - 3 * s);
          ctx.stroke();
        }

        // Level 3+: Decorative string course with gold trim
        if (level >= 3) {
          ctx.strokeStyle = "#c9a227";
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 15 * s, cy + 4 * s);
          ctx.lineTo(cx - 7 * s, cy + 4 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 7 * s, cy + 4 * s);
          ctx.lineTo(cx + 15 * s, cy + 4 * s);
          ctx.stroke();
        }

        // CENTRAL TRIANGLE SPIRE
        ctx.fillStyle = "#7a6a50";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx - 6 * s, cy - 10 * s);
        ctx.lineTo(cx, cy - 12 * s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#9a8a70";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx + 6 * s, cy - 10 * s);
        ctx.lineTo(cx, cy - 12 * s);
        ctx.closePath();
        ctx.fill();

        // Level 3+: Spire window slit
        if (level >= 3) {
          ctx.fillStyle = `rgba(${eR}, ${eG}, ${eB}, 0.5)`;
          ctx.fillRect(cx - 0.5 * s, cy - 18 * s, 1 * s, 4 * s);
        }

        // Spire orb at top (dynamic energy color)
        const portalGlow = (animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6) * (0.7 + level * 0.1);
        ctx.fillStyle = `rgba(${eR}, ${eG}, ${eB}, ${portalGlow})`;
        ctx.shadowColor = eShadow;
        ctx.shadowBlur = 8 * s;
        ctx.beginPath();
        ctx.arc(cx, cy - 22 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy - 22 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner arch opening (dark)
        ctx.fillStyle = "#1a1a10";
        ctx.beginPath();
        ctx.arc(cx, cy, 8 * s, Math.PI, 0);
        ctx.lineTo(cx + 8 * s, cy + 14 * s);
        ctx.lineTo(cx - 8 * s, cy + 14 * s);
        ctx.closePath();
        ctx.fill();

        // PORTAL GLOW (dynamic energy color)
        const portalGrad = ctx.createRadialGradient(cx, cy + 4 * s, 0, cx, cy + 4 * s, 10 * s);
        portalGrad.addColorStop(0, `rgba(${Math.min(eR + 20, 255)}, ${eG}, ${Math.min(eB + 20, 255)}, ${portalGlow})`);
        portalGrad.addColorStop(0.4, `rgba(${eR}, ${Math.max(eG - 35, 0)}, ${Math.max(eB - 50, 0)}, ${portalGlow * 0.8})`);
        portalGrad.addColorStop(0.7, `rgba(${Math.floor(eR * 0.5)}, ${Math.floor(eG * 0.7)}, ${Math.floor(eB * 0.6)}, ${portalGlow * 0.5})`);
        portalGrad.addColorStop(1, `rgba(${Math.floor(eR * 0.2)}, ${Math.floor(eG * 0.4)}, ${Math.floor(eB * 0.35)}, ${portalGlow * 0.2})`);
        ctx.fillStyle = portalGrad;
        ctx.shadowColor = eShadow;
        ctx.shadowBlur = 15 * s;
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * s, 6 * s, Math.PI, 0);
        ctx.lineTo(cx + 6 * s, cy + 12 * s);
        ctx.lineTo(cx - 6 * s, cy + 12 * s);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing windows on arch walls (dynamic energy color)
        ctx.fillStyle = "#1a2a1a";
        ctx.fillRect(cx - 12 * s, cy - 2 * s, 3 * s, (3 + level) * s);
        ctx.fillRect(cx + 9 * s, cy - 2 * s, 3 * s, (3 + level) * s);
        ctx.fillStyle = `rgba(${eR}, ${Math.max(eG - 35, 0)}, ${Math.max(eB - 50, 0)}, ${portalGlow})`;
        ctx.shadowColor = eShadow;
        ctx.shadowBlur = 4 * s;
        ctx.fillRect(cx - 11.5 * s, cy - 1.5 * s, 2 * s, (2 + level) * s);
        ctx.fillRect(cx + 9.5 * s, cy - 1.5 * s, 2 * s, (2 + level) * s);
        ctx.shadowBlur = 0;

        // Level 2+: Extra pair of smaller windows
        if (level >= 2) {
          ctx.fillStyle = "#1a2a1a";
          ctx.fillRect(cx - 12 * s, cy + 5 * s, 2.5 * s, 3 * s);
          ctx.fillRect(cx + 9.5 * s, cy + 5 * s, 2.5 * s, 3 * s);
          ctx.fillStyle = `rgba(${eR}, ${eG}, ${eB}, ${portalGlow * 0.6})`;
          ctx.fillRect(cx - 11.5 * s, cy + 5.5 * s, 1.5 * s, 2 * s);
          ctx.fillRect(cx + 10 * s, cy + 5.5 * s, 1.5 * s, 2 * s);
        }

        // Portal swirl effect (dynamic color)
        if (animated) {
          ctx.strokeStyle = `rgba(${Math.min(eR + 50, 255)}, ${eG}, ${Math.min(eB + 30, 255)}, ${0.5 + Math.sin(t * 3) * 0.3})`;
          ctx.lineWidth = 1.2 * s;
          for (let i = 0; i < 1 + level; i++) {
            const spiralOffset = t * 2.5 + i * Math.PI * 0.67;
            ctx.beginPath();
            for (let j = 0; j < 15; j++) {
              const angle = spiralOffset + j * 0.35;
              const radius = 1 * s + j * 0.4 * s;
              const sx = cx + Math.cos(angle) * radius;
              const sy = cy + 5 * s + Math.sin(angle) * radius * 0.5;
              if (j === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
          }
        }

        // Musical notes emanating from portal (dynamic color)
        if (animated) {
          ctx.fillStyle = `rgba(${eR}, ${eG}, ${eB}, ${0.6 + Math.sin(t * 4) * 0.3})`;
          ctx.font = `${3 * s}px serif`;
          ctx.textAlign = "center";
          const noteY = cy - ((t * 15) % 12) * s;
          const noteAlpha = Math.max(0, 1 - ((t * 15) % 12) / 12);
          ctx.globalAlpha = noteAlpha;
          ctx.fillText("♪", cx - 3 * s, noteY);
          ctx.fillText("♫", cx + 3 * s, noteY + 2 * s);
          if (level >= 3) ctx.fillText("♬", cx, noteY - 3 * s);
          ctx.globalAlpha = 1;
        }

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(255, 60, 30, 0.12)" : "rgba(80, 140, 255, 0.12)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const wPulse = animated ? 0.5 + Math.sin(t * 6) * 0.3 : 0.6;
            ctx.fillStyle = `rgba(255, 60, 30, ${wPulse})`;
            ctx.shadowColor = "#ff3c1e";
            ctx.shadowBlur = 10 * s;
            ctx.beginPath();
            ctx.arc(cx, cy - 22 * s, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (animated) {
              ctx.strokeStyle = `rgba(255, 80, 40, ${wPulse * 0.5})`;
              ctx.lineWidth = 1.5 * s;
              for (let i = 0; i < 3; i++) {
                const ringR = (4 + ((t * 10 + i * 4) % 14)) * s;
                const ringAlpha = Math.max(0, 1 - ((t * 10 + i * 4) % 14) / 14);
                ctx.strokeStyle = `rgba(255, 80, 40, ${ringAlpha * 0.6})`;
                ctx.beginPath();
                ctx.ellipse(cx, cy + 4 * s, ringR, ringR * 0.35, 0, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
          } else {
            const hPulse = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
            ctx.fillStyle = `rgba(80, 150, 255, ${hPulse * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 4 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(100, 180, 255, ${hPulse})`;
            ctx.shadowColor = "#4090ff";
            ctx.shadowBlur = 10 * s;
            ctx.beginPath();
            ctx.arc(cx, cy - 22 * s, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (animated) {
              ctx.fillStyle = `rgba(120, 200, 255, ${0.5 + Math.sin(t * 3) * 0.3})`;
              ctx.font = `${4 * s}px serif`;
              ctx.textAlign = "center";
              for (let i = 0; i < 3; i++) {
                const nAngle = t * 1.5 + (i * Math.PI * 2) / 3;
                const nr = 10 * s;
                const nx = cx + Math.cos(nAngle) * nr;
                const ny = cy - 5 * s + Math.sin(nAngle) * nr * 0.4;
                ctx.fillText(i % 2 === 0 ? "♪" : "♫", nx, ny);
              }
            }
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, eIndicator, upgrade);
        break;
      }
      case "club": {
        // =====================================================================
        // EATING CLUB - Elegant Green Colonial Mansion with Columns
        // Based on reference: Green mansion with white columns, $ symbol
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal base platform
        ctx.fillStyle = "#3a4a3a";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 16 * s;
          const py = cy + 17 * s + Math.sin(angle) * 8 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Base top
        ctx.fillStyle = "#4a5a4a";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 14 * s;
          const py = cy + 14 * s + Math.sin(angle) * 7 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Main building body - left face (dark green)
        const leftClubGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
        leftClubGrad.addColorStop(0, "#1a4a1a");
        leftClubGrad.addColorStop(1, "#2a5a2a");
        ctx.fillStyle = leftClubGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy + 12 * s);
        ctx.lineTo(cx - 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy + 2 * s);
        ctx.lineTo(cx, cy + 16 * s);
        ctx.closePath();
        ctx.fill();

        // Main building body - right face (lighter green)
        const rightClubGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
        rightClubGrad.addColorStop(0, "#2a5a2a");
        rightClubGrad.addColorStop(1, "#3a6a3a");
        ctx.fillStyle = rightClubGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s, cy + 12 * s);
        ctx.lineTo(cx + 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy + 2 * s);
        ctx.lineTo(cx, cy + 16 * s);
        ctx.closePath();
        ctx.fill();

        // Building top face
        ctx.fillStyle = "#3a6a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy - 6 * s);
        ctx.lineTo(cx + 10 * s, cy - 2 * s);
        ctx.lineTo(cx, cy + 2 * s);
        ctx.closePath();
        ctx.fill();

        // Decorative trim bands
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#4a7a4a";
        ctx.fillRect(cx - 11 * s, cy + 6 * s, 10 * s, 1 * s);
        ctx.fillRect(cx + 1 * s, cy + 6 * s, 10 * s, 1 * s);
        ctx.fillRect(cx - 10 * s, cy - 1 * s, 9 * s, 1 * s);
        ctx.fillRect(cx + 1 * s, cy - 1 * s, 9 * s, 1 * s);

        // Roof structure
        ctx.fillStyle = "#1a3a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy - 4 * s);
        ctx.lineTo(cx, cy - 16 * s);
        ctx.lineTo(cx + 14 * s, cy - 4 * s);
        ctx.closePath();
        ctx.fill();
        // Roof highlight
        ctx.fillStyle = "#2a4a2a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 16 * s);
        ctx.lineTo(cx + 14 * s, cy - 4 * s);
        ctx.lineTo(cx + 10 * s, cy - 4 * s);
        ctx.lineTo(cx, cy - 12 * s);
        ctx.closePath();
        ctx.fill();

        // Roof shingle lines
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * s;
        for (let i = 0; i < 3; i++) {
          const y = cy - 6 * s - i * 3 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 12 * s + i * 3 * s, y);
          ctx.lineTo(cx + 12 * s - i * 3 * s, y);
          ctx.stroke();
        }

        // Level 2+: Dormer windows on roof
        if (level >= 2) {
          ctx.fillStyle = "#0a1a0a";
          ctx.fillRect(cx - 4 * s, cy - 9 * s, 3 * s, 2 * s);
          ctx.fillStyle = "rgba(255, 215, 100, 0.6)";
          ctx.fillRect(cx - 3.7 * s, cy - 8.7 * s, 2.4 * s, 1.4 * s);
        }
        if (level >= 3) {
          ctx.fillStyle = "#0a1a0a";
          ctx.fillRect(cx + 2 * s, cy - 8 * s, 3 * s, 2 * s);
          ctx.fillStyle = "rgba(255, 215, 100, 0.6)";
          ctx.fillRect(cx + 2.3 * s, cy - 7.7 * s, 2.4 * s, 1.4 * s);
        }

        // GLASS DISPLAY WINDOWS / SCREENS on front facade
        const screenGlow = animated ? 0.5 + Math.sin(t * 2) * 0.2 : 0.6;

        // Left display screen frame
        ctx.fillStyle = "#1a3a1a";
        ctx.fillRect(cx - 8 * s, cy + 3 * s, 5 * s, 8 * s);
        // Left screen glass with warm glow
        ctx.fillStyle = `rgba(255, 220, 150, ${screenGlow * 0.8})`;
        ctx.shadowColor = "#ffdc96";
        ctx.shadowBlur = 5 * s;
        ctx.fillRect(cx - 7.5 * s, cy + 3.5 * s, 4 * s, 7 * s);
        ctx.shadowBlur = 0;
        // Left screen grid pattern
        ctx.strokeStyle = "#2a4a2a";
        ctx.lineWidth = 0.4 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 5.5 * s, cy + 3.5 * s);
        ctx.lineTo(cx - 5.5 * s, cy + 10.5 * s);
        ctx.moveTo(cx - 7.5 * s, cy + 7 * s);
        ctx.lineTo(cx - 3.5 * s, cy + 7 * s);
        ctx.stroke();

        // Right display screen frame
        ctx.fillStyle = "#1a3a1a";
        ctx.fillRect(cx + 3 * s, cy + 3 * s, 5 * s, 8 * s);
        // Right screen glass with warm glow
        ctx.fillStyle = `rgba(255, 220, 150, ${screenGlow * 0.8})`;
        ctx.shadowColor = "#ffdc96";
        ctx.shadowBlur = 5 * s;
        ctx.fillRect(cx + 3.5 * s, cy + 3.5 * s, 4 * s, 7 * s);
        ctx.shadowBlur = 0;
        // Right screen grid pattern
        ctx.strokeStyle = "#2a4a2a";
        ctx.lineWidth = 0.4 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 5.5 * s, cy + 3.5 * s);
        ctx.lineTo(cx + 5.5 * s, cy + 10.5 * s);
        ctx.moveTo(cx + 3.5 * s, cy + 7 * s);
        ctx.lineTo(cx + 7.5 * s, cy + 7 * s);
        ctx.stroke();

        // Decorative awning over entrance
        ctx.fillStyle = "#2a5a2a";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, cy + 3 * s);
        ctx.lineTo(cx, cy + 1 * s);
        ctx.lineTo(cx + 4 * s, cy + 3 * s);
        ctx.closePath();
        ctx.fill();
        // Awning stripes
        ctx.fillStyle = "#3a6a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, cy + 2.5 * s);
        ctx.lineTo(cx, cy + 1.5 * s);
        ctx.lineTo(cx + 2 * s, cy + 2.5 * s);
        ctx.closePath();
        ctx.fill();

        // Entrance door (grand wooden door)
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(cx - 2.5 * s, cy + 7 * s, 5 * s, 7 * s);
        // Door arch
        ctx.beginPath();
        ctx.arc(cx, cy + 7 * s, 2.5 * s, Math.PI, 0);
        ctx.fill();
        // Door panels
        ctx.strokeStyle = "#1a0a00";
        ctx.lineWidth = 0.4 * s;
        ctx.strokeRect(cx - 2 * s, cy + 8 * s, 1.5 * s, 2.5 * s);
        ctx.strokeRect(cx + 0.5 * s, cy + 8 * s, 1.5 * s, 2.5 * s);
        ctx.strokeRect(cx - 2 * s, cy + 11 * s, 1.5 * s, 2 * s);
        ctx.strokeRect(cx + 0.5 * s, cy + 11 * s, 1.5 * s, 2 * s);
        // Gold door knocker
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx, cy + 11 * s, 0.6 * s, 0, Math.PI * 2);
        ctx.fill();

        // Side windows with warm glow
        const windowGlow = animated ? 0.5 + Math.sin(t * 2) * 0.2 : 0.6;
        ctx.fillStyle = "#0a1a0a";
        ctx.fillRect(cx - 10 * s, cy + 5 * s, 3 * s, 4 * s);
        ctx.fillRect(cx + 7 * s, cy + 5 * s, 3 * s, 4 * s);
        ctx.fillStyle = `rgba(255, 215, 100, ${windowGlow})`;
        ctx.shadowColor = "#ffd764";
        ctx.shadowBlur = 4 * s;
        ctx.fillRect(cx - 9.5 * s, cy + 5.5 * s, 2 * s, 3 * s);
        ctx.fillRect(cx + 7.5 * s, cy + 5.5 * s, 2 * s, 3 * s);
        ctx.shadowBlur = 0;

        // FLOATING DOLLAR SIGN with golden glow
        const dollarY = cy - 12 * s + (animated ? Math.sin(t * 2) * 1.5 * s : 0);

        // Yellow aura behind dollar sign
        const auraGrad = ctx.createRadialGradient(cx, dollarY, 0, cx, dollarY, 12 * s);
        auraGrad.addColorStop(0, `rgba(255, 215, 0, ${windowGlow * 0.5})`);
        auraGrad.addColorStop(0.4, `rgba(255, 200, 0, ${windowGlow * 0.3})`);
        auraGrad.addColorStop(0.7, `rgba(255, 180, 0, ${windowGlow * 0.15})`);
        auraGrad.addColorStop(1, "rgba(255, 150, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, dollarY, 12 * s, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting yellow circles
        if (animated) {
          for (let i = 0; i < 1 + level; i++) {
            const orbitAngle = t * 1.5 + (i * Math.PI * 2) / 3;
            const orbitRadius = 8 * s;
            const orbX = cx + Math.cos(orbitAngle) * orbitRadius;
            const orbY = dollarY + Math.sin(orbitAngle) * orbitRadius * ISO_Y_RATIO;
            const orbSize = 1.5 * s + Math.sin(t * 3 + i) * 0.3 * s;
            ctx.fillStyle = `rgba(255, 230, 100, ${0.7 + Math.sin(t * 4 + i) * 0.2})`;
            ctx.shadowColor = "#ffee66";
            ctx.shadowBlur = 6 * s;
            ctx.beginPath();
            ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }

        // Orbit ring traces
        ctx.strokeStyle = `rgba(255, 215, 0, ${windowGlow * 0.3})`;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.ellipse(cx, dollarY, 8 * s, 3.2 * s, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Dollar sign
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = (10 + level * 2) * s;
        ctx.font = `bold ${(8 + level) * s}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, dollarY);

        // Expanding rings effect
        if (animated) {
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 - (t % 1) * 0.35})`;
          ctx.lineWidth = 1 * s;
          const ringSize = 4 * s + ((t * 10) % 6) * s;
          ctx.beginPath();
          ctx.ellipse(cx, dollarY, ringSize, ringSize * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Decorative ivy/garden elements
        ctx.fillStyle = "#1a5a1a";
        const ivyPositions = [
          { x: cx - 11 * s, y: cy + 10 * s },
          { x: cx + 10 * s, y: cy + 9 * s },
        ];
        for (const ivy of ivyPositions) {
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(ivy.x + (i % 2) * 1.5 * s, ivy.y - i * 1.5 * s, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Level 2+: Garden hedge/bush in front
        if (level >= 2) {
          ctx.fillStyle = "#1a5a1a";
          const hedgeY = cy + 15 * s;
          ctx.beginPath();
          ctx.arc(cx - 4 * s, hedgeY, 2 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 3 * s, hedgeY, 1.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
        // Level 3+: Lamp post on left side
        if (level >= 3) {
          ctx.fillStyle = "#2a2020";
          ctx.fillRect(cx - 10 * s, cy + 2 * s, 0.6 * s, 8 * s);
          ctx.fillStyle = "#3a3030";
          ctx.fillRect(cx - 10.3 * s, cy + 1 * s, 1.2 * s, 1.5 * s);
          ctx.fillStyle = `rgba(255, 215, 100, ${windowGlow})`;
          ctx.shadowColor = "#ffd764";
          ctx.shadowBlur = 4 * s;
          ctx.beginPath();
          ctx.arc(cx - 9.7 * s, cy + 2 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(255, 215, 0, 0.12)" : "rgba(50, 120, 255, 0.1)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const mPulse = animated ? 0.5 + Math.sin(t * 3) * 0.3 : 0.6;
            if (animated) {
              for (let i = 0; i < 4; i++) {
                const cAngle = t * 2 + (i * Math.PI) / 2;
                const cr = 12 * s;
                const coinX = cx + Math.cos(cAngle) * cr;
                const coinY = cy - 8 * s + Math.sin(cAngle) * cr * 0.3;
                ctx.fillStyle = `rgba(255, 215, 0, ${0.6 + Math.sin(t * 4 + i) * 0.2})`;
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 4 * s;
                ctx.beginPath();
                ctx.ellipse(coinX, coinY, 2 * s, 1.5 * s, cAngle * 0.5, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.shadowBlur = 0;
            }
            ctx.fillStyle = `rgba(255, 215, 0, ${mPulse * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const rPulse = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
            ctx.fillStyle = `rgba(50, 120, 255, ${rPulse * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(80, 150, 255, ${rPulse})`;
            ctx.shadowColor = "#5096ff";
            ctx.shadowBlur = 8 * s;
            drawStar(ctx, cx, cy - 16 * s, 4 * s, 2 * s);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(80, 150, 255, ${rPulse * 0.6})`;
            ctx.lineWidth = 1.5 * s;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8 * s, 14 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, "#ffd700", upgrade);
        break;
      }
      case "station": {
        // =====================================================================
        // DINKY STATION - Red Victorian Railway Station with Clock Tower
        // Based on reference: Red brick building with prominent clock tower
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal base platform
        ctx.fillStyle = "#4a4040";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 18 * s;
          const py = cy + 18 * s + Math.sin(angle) * 9 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Platform top
        ctx.fillStyle = "#5a5050";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 16 * s;
          const py = cy + 15 * s + Math.sin(angle) * 8 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Yellow safety stripe on platform edge
        ctx.fillStyle = "#d4a520";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = cx + Math.cos(angle) * 17 * s;
          const py = cy + 16 * s + Math.sin(angle) * 8.5 * s;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // TRAIN TRACKS in front of building
        // Track bed (gravel)
        ctx.fillStyle = "#5a5040";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * s, cy + 18 * s);
        ctx.lineTo(cx - 18 * s, cy + 14 * s);
        ctx.lineTo(cx + 18 * s, cy + 14 * s);
        ctx.lineTo(cx + 20 * s, cy + 18 * s);
        ctx.closePath();
        ctx.fill();

        // Wooden track ties
        ctx.fillStyle = "#4a3020";
        for (let i = -5; i <= 5; i++) {
          ctx.save();
          ctx.translate(cx + i * 3.5 * s, cy + 16 * s);
          ctx.beginPath();
          ctx.moveTo(-1.2 * s, -1 * s);
          ctx.lineTo(-0.8 * s, -2.5 * s);
          ctx.lineTo(0.8 * s, -2.5 * s);
          ctx.lineTo(1.2 * s, -1 * s);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Metal rails (two parallel lines)
        ctx.strokeStyle = "#6a6a6a";
        ctx.lineWidth = 1 * s;
        // Left rail
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy + 15 * s);
        ctx.lineTo(cx + 18 * s, cy + 15 * s);
        ctx.stroke();
        // Right rail
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy + 17 * s);
        ctx.lineTo(cx + 18 * s, cy + 17 * s);
        ctx.stroke();

        // Rail highlights
        ctx.strokeStyle = "#8a8a8a";
        ctx.lineWidth = 0.4 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy + 14.7 * s);
        ctx.lineTo(cx + 18 * s, cy + 14.7 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy + 16.7 * s);
        ctx.lineTo(cx + 18 * s, cy + 16.7 * s);
        ctx.stroke();

        // Main building - left face (dark red brick)
        const leftStationGrad = ctx.createLinearGradient(cx - 12 * s, cy, cx, cy);
        leftStationGrad.addColorStop(0, "#5a1a1a");
        leftStationGrad.addColorStop(1, "#7a2a2a");
        ctx.fillStyle = leftStationGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy + 13 * s);
        ctx.lineTo(cx - 10 * s, cy);
        ctx.lineTo(cx, cy + 4 * s);
        ctx.lineTo(cx, cy + 17 * s);
        ctx.closePath();
        ctx.fill();

        // Main building - right face (lighter red)
        const rightStationGrad = ctx.createLinearGradient(cx, cy, cx + 12 * s, cy);
        rightStationGrad.addColorStop(0, "#7a2a2a");
        rightStationGrad.addColorStop(1, "#8a3a3a");
        ctx.fillStyle = rightStationGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s, cy + 13 * s);
        ctx.lineTo(cx + 10 * s, cy);
        ctx.lineTo(cx, cy + 4 * s);
        ctx.lineTo(cx, cy + 17 * s);
        ctx.closePath();
        ctx.fill();

        // Building top face
        ctx.fillStyle = "#8a3a3a";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, cy);
        ctx.lineTo(cx, cy - 4 * s);
        ctx.lineTo(cx + 10 * s, cy);
        ctx.lineTo(cx, cy + 4 * s);
        ctx.closePath();
        ctx.fill();

        // Brick pattern - horizontal lines
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 0.4 * s;
        for (let row = 0; row < 5; row++) {
          const y = cy + 10 * s - row * 3 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * s + row * 0.5 * s, y);
          ctx.lineTo(cx - 1 * s, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 1 * s, y);
          ctx.lineTo(cx + 10 * s - row * 0.5 * s, y);
          ctx.stroke();
        }

        // Level 2+: Chimney on right side of building
        if (level >= 2) {
          ctx.fillStyle = "#5a1a1a";
          ctx.fillRect(cx + 8 * s, cy - 7 * s, 2 * s, 5 * s);
        }

        // Decorative trim
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#9a4a4a";
        ctx.fillRect(cx - 10 * s, cy + 6 * s, 9 * s, 1 * s);
        ctx.fillRect(cx + 1 * s, cy + 6 * s, 9 * s, 1 * s);

        // Roof overhang
        ctx.fillStyle = "#4a1010";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy);
        ctx.lineTo(cx - 12 * s, cy - 3 * s);
        ctx.lineTo(cx + 12 * s, cy - 3 * s);
        ctx.lineTo(cx + 14 * s, cy);
        ctx.closePath();
        ctx.fill();
        // Roof edge detail
        ctx.strokeStyle = "#6a2020";
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy);
        ctx.lineTo(cx + 14 * s, cy);
        ctx.stroke();

        // CLOCK TOWER
        // Tower left face
        ctx.fillStyle = "#6a1a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy - 2 * s);
        ctx.lineTo(cx - 5 * s, cy - 16 * s);
        ctx.lineTo(cx, cy - 14 * s);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();

        // Tower right face (lighter)
        ctx.fillStyle = "#8a2a2a";
        ctx.beginPath();
        ctx.moveTo(cx + 6 * s, cy - 2 * s);
        ctx.lineTo(cx + 5 * s, cy - 16 * s);
        ctx.lineTo(cx, cy - 14 * s);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();

        // Tower front face
        ctx.fillStyle = "#7a2020";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, cy - 16 * s);
        ctx.lineTo(cx, cy - 18 * s);
        ctx.lineTo(cx + 5 * s, cy - 16 * s);
        ctx.lineTo(cx, cy - 14 * s);
        ctx.closePath();
        ctx.fill();

        // Tower brick lines
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 0.4 * s;
        for (let row = 0; row < 6; row++) {
          const y = cy - 4 * s - row * 2 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 5 * s, y);
          ctx.lineTo(cx, y - 1 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, y - 1 * s);
          ctx.lineTo(cx + 5 * s, y);
          ctx.stroke();
        }

        // Tower pointed roof
        ctx.fillStyle = "#4a1010";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy - 16 * s);
        ctx.lineTo(cx, cy - 22 * s);
        ctx.lineTo(cx + 6 * s, cy - 16 * s);
        ctx.lineTo(cx, cy - 18 * s);
        ctx.closePath();
        ctx.fill();
        // Roof highlight
        ctx.fillStyle = "#5a2020";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx + 6 * s, cy - 16 * s);
        ctx.lineTo(cx + 3 * s, cy - 16.5 * s);
        ctx.lineTo(cx, cy - 20 * s);
        ctx.closePath();
        ctx.fill();

        // Clock face (large, prominent)
        ctx.fillStyle = "#f5f5e8";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        // Clock frame
        ctx.strokeStyle = level >= 3 ? "#c9a227" : "#4a3020";
        ctx.lineWidth = (level >= 3 ? 1 : 0.6) * s;
        ctx.stroke();

        // Clock hour markers
        ctx.fillStyle = "#2a1a10";
        for (let i = 0; i < 12; i++) {
          const markerAngle = (i * Math.PI) / 6 - Math.PI / 2;
          const mx = cx + Math.cos(markerAngle) * 3.2 * s;
          const my = cy - 10 * s + Math.sin(markerAngle) * 3.2 * s;
          ctx.beginPath();
          ctx.arc(mx, my, 0.3 * s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Clock hands (animated)
        const hourAngle = animated ? t * 0.1 : Math.PI / 4;
        const minuteAngle = animated ? t * 1.2 : Math.PI / 2;
        ctx.strokeStyle = "#1a0a00";
        ctx.lineWidth = 1 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10 * s);
        ctx.lineTo(cx + Math.cos(hourAngle - Math.PI / 2) * 2 * s, cy - 10 * s + Math.sin(hourAngle - Math.PI / 2) * 2 * s);
        ctx.stroke();
        ctx.lineWidth = 0.6 * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10 * s);
        ctx.lineTo(cx + Math.cos(minuteAngle - Math.PI / 2) * 3 * s, cy - 10 * s + Math.sin(minuteAngle - Math.PI / 2) * 3 * s);
        ctx.stroke();
        ctx.lineCap = "butt";

        // Clock center dot
        ctx.fillStyle = "#1a0a00";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * s, 0.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // Level 3+: Weather vane on top of roof
        if (level >= 3) {
          ctx.strokeStyle = "#3a2020";
          ctx.lineWidth = 0.4 * s;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 22 * s);
          ctx.lineTo(cx, cy - 26 * s);
          ctx.stroke();
          ctx.fillStyle = "#5a3030";
          ctx.beginPath();
          ctx.moveTo(cx - 1.5 * s, cy - 25 * s);
          ctx.lineTo(cx + 1.5 * s, cy - 25 * s);
          ctx.lineTo(cx, cy - 26 * s);
          ctx.closePath();
          ctx.fill();
        }

        // Station windows with warm glow
        const windowGlow = (animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7) * (0.7 + level * 0.1);
        // Left windows
        ctx.fillStyle = "#1a0808";
        ctx.fillRect(cx - 9 * s, cy + 8 * s, 4 * s, 4 * s);
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
        ctx.shadowColor = "#ffcc66";
        ctx.shadowBlur = 5 * s;
        ctx.fillRect(cx - 8.5 * s, cy + 8.5 * s, 3 * s, 3 * s);
        ctx.shadowBlur = 0;

        // Right windows
        ctx.fillStyle = "#1a0808";
        ctx.fillRect(cx + 5 * s, cy + 8 * s, 4 * s, 4 * s);
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
        ctx.shadowColor = "#ffcc66";
        ctx.shadowBlur = 5 * s;
        ctx.fillRect(cx + 5.5 * s, cy + 8.5 * s, 3 * s, 3 * s);
        ctx.shadowBlur = 0;

        // Entrance door (arched)
        ctx.fillStyle = "#2a1808";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * s, cy + 15 * s);
        ctx.lineTo(cx - 3 * s, cy + 8 * s);
        ctx.arc(cx, cy + 8 * s, 3 * s, Math.PI, 0);
        ctx.lineTo(cx + 3 * s, cy + 15 * s);
        ctx.closePath();
        ctx.fill();
        // Door frame
        ctx.strokeStyle = "#4a3020";
        ctx.lineWidth = 0.5 * s;
        ctx.stroke();
        // Door window glow
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx, cy + 8 * s, 2 * s, Math.PI, 0);
        ctx.fill();

        // DINKY Station sign
        ctx.fillStyle = level >= 3 ? "#2a1a00" : "#1a1a1a";
        ctx.fillRect(cx - 10 * s, cy + 2 * s, 20 * s, 3 * s);
        if (level >= 3) {
          ctx.strokeStyle = "#c9a227";
          ctx.lineWidth = 0.5 * s;
          ctx.strokeRect(cx - 10 * s, cy + 2 * s, 20 * s, 3 * s);
        }
        ctx.fillStyle = "#c9a227";
        ctx.font = `bold ${2.8 * s}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DINKY", cx, cy + 3.5 * s);

        // Lamp post
        ctx.fillStyle = "#2a2020";
        ctx.fillRect(cx + 10 * s, cy + 2 * s, 1 * s, 10 * s);
        // Lamp
        ctx.fillStyle = "#3a3030";
        ctx.fillRect(cx + 9 * s, cy + 1 * s, 3 * s, 2 * s);
        ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
        ctx.shadowColor = "#ffcc66";
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.arc(cx + 10.5 * s, cy + 2 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(255, 140, 40, 0.1)" : "rgba(140, 50, 200, 0.1)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const sPulse = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
            ctx.fillStyle = `rgba(255, 160, 60, ${sPulse * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 10 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            if (animated) {
              ctx.fillStyle = `rgba(255, 140, 40, ${0.5 + Math.sin(t * 3) * 0.3})`;
              for (let i = 0; i < 4; i++) {
                const lAngle = t * 0.8 + (i * Math.PI) / 2;
                const lr = (10 + Math.sin(t + i) * 2) * s;
                const lx = cx + Math.cos(lAngle) * lr;
                const ly = cy + 5 * s + Math.sin(lAngle) * lr * 0.4;
                ctx.beginPath();
                ctx.ellipse(lx, ly, 1.5 * s, 1 * s, lAngle, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.fillStyle = "#c9a227";
            ctx.font = `bold ${4 * s}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("U", cx, cy - 22 * s);
          } else {
            const rPulse = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
            ctx.fillStyle = `rgba(140, 50, 200, ${rPulse * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(160, 80, 255, ${rPulse})`;
            ctx.shadowColor = "#a050ff";
            ctx.shadowBlur = 6 * s;
            ctx.beginPath();
            ctx.moveTo(cx - 3 * s, cy - 22 * s);
            ctx.lineTo(cx, cy - 26 * s);
            ctx.lineTo(cx + 3 * s, cy - 22 * s);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(200, 150, 255, ${rPulse * 0.8})`;
            ctx.beginPath();
            ctx.arc(cx, cy - 23 * s, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, "#ff6600", upgrade);
        break;
      }
      case "mortar": {
        // =====================================================================
        // PALMER MORTAR - Stacked hex-prism tiers with ammo foundation
        // =====================================================================

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 18 * s, 20 * s, 9 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iron hex foundation wall
        const sbGrad = ctx.createLinearGradient(cx - 16 * s, 0, cx + 16 * s, 0);
        sbGrad.addColorStop(0, "#2a2a32");
        sbGrad.addColorStop(0.35, "#4a4a52");
        sbGrad.addColorStop(0.65, "#3e3e46");
        sbGrad.addColorStop(1, "#222228");
        ctx.fillStyle = sbGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14 * s, 17 * s, 8.5 * s, 0, 0, Math.PI);
        ctx.lineTo(cx - 17 * s, cy + 10 * s);
        ctx.ellipse(cx, cy + 10 * s, 17 * s, 8.5 * s, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#5a5a62";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10 * s, 17 * s, 8.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Concrete pad
        ctx.fillStyle = "#3a3a42";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 9 * s, 15 * s, 7.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Isometric ammo crates (right side) and shell rack (left side)
        {
          const pw = 0.5;  // ISO_PRISM_W_FACTOR
          const pd = 0.25; // ISO_PRISM_D_FACTOR

          // Ammo crates (stacked isometric boxes)
          for (let c = 0; c < Math.min(level, 3); c++) {
            const crX = cx + (10 + c * 1.2) * s;
            const crY = cy + (4.5 - c * 3.2) * s;
            const cW = (3.2 - c * 0.3) * s;
            const cD = (2.5 - c * 0.2) * s;
            const cH = 2.8 * s;
            const w = cW * pw;
            const d = cD * pd;

            const baseColors = c === 0
              ? { top: "#5a6a3a", left: "#4a5a2a", right: "#3a4a1a" }
              : { top: "#4a5a32", left: "#3a4a22", right: "#2a3a14" };

            // Back-left face
            ctx.fillStyle = baseColors.left;
            ctx.beginPath();
            ctx.moveTo(crX, crY - d);
            ctx.lineTo(crX - w, crY);
            ctx.lineTo(crX - w, crY - cH);
            ctx.lineTo(crX, crY - cH - d);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 0.3 * s;
            ctx.stroke();

            // Back-right face
            ctx.fillStyle = baseColors.right;
            ctx.beginPath();
            ctx.moveTo(crX, crY - d);
            ctx.lineTo(crX + w, crY);
            ctx.lineTo(crX + w, crY - cH);
            ctx.lineTo(crX, crY - cH - d);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 0.3 * s;
            ctx.stroke();

            // Front-left face
            ctx.fillStyle = baseColors.left;
            ctx.beginPath();
            ctx.moveTo(crX - w, crY);
            ctx.lineTo(crX, crY + d);
            ctx.lineTo(crX, crY + d - cH);
            ctx.lineTo(crX - w, crY - cH);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.lineWidth = 0.3 * s;
            ctx.stroke();

            // Front-right face
            ctx.fillStyle = baseColors.right;
            ctx.beginPath();
            ctx.moveTo(crX + w, crY);
            ctx.lineTo(crX, crY + d);
            ctx.lineTo(crX, crY + d - cH);
            ctx.lineTo(crX + w, crY - cH);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.25)";
            ctx.lineWidth = 0.3 * s;
            ctx.stroke();

            // Top face (isometric diamond)
            ctx.fillStyle = baseColors.top;
            ctx.beginPath();
            ctx.moveTo(crX, crY - cH - d);
            ctx.lineTo(crX - w, crY - cH);
            ctx.lineTo(crX, crY - cH + d);
            ctx.lineTo(crX + w, crY - cH);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 0.3 * s;
            ctx.stroke();

            // Iron strap across front-right face
            ctx.fillStyle = "rgba(80,75,60,0.5)";
            const strapY = crY - cH * 0.45;
            ctx.fillRect(crX + 0.3 * s, strapY - 0.4 * s, w * 0.85, 0.8 * s);

            // Stencil label on front-right face
            ctx.fillStyle = "#ffaa00";
            ctx.fillRect(crX + w * 0.15, crY - cH * 0.7, w * 0.55, 0.6 * s);
          }

          // Shell rack (left side, isometric vertical rack with shell tips)
          if (level >= 1) {
            const rX = cx - 10 * s;
            const rY = cy + 5 * s;
            const rW = 2 * s * pw;
            const rD = 3.5 * s * pd;
            const rH = (4 + level * 2) * s;

            // Rack frame (isometric box)
            ctx.fillStyle = "#3a2818";
            ctx.beginPath();
            ctx.moveTo(rX - rW, rY);
            ctx.lineTo(rX, rY + rD);
            ctx.lineTo(rX, rY + rD - rH);
            ctx.lineTo(rX - rW, rY - rH);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#2a1808";
            ctx.beginPath();
            ctx.moveTo(rX + rW, rY);
            ctx.lineTo(rX, rY + rD);
            ctx.lineTo(rX, rY + rD - rH);
            ctx.lineTo(rX + rW, rY - rH);
            ctx.closePath();
            ctx.fill();

            // Top face
            ctx.fillStyle = "#4a3828";
            ctx.beginPath();
            ctx.moveTo(rX, rY - rH - rD);
            ctx.lineTo(rX - rW, rY - rH);
            ctx.lineTo(rX, rY - rH + rD);
            ctx.lineTo(rX + rW, rY - rH);
            ctx.closePath();
            ctx.fill();

            // Shells (isometric ellipses stacked vertically)
            const shellCount = level + 1;
            for (let sh = 0; sh < shellCount; sh++) {
              const shY = rY - (1.5 + sh * 2.2) * s;
              // Shell body
              ctx.fillStyle = level >= 3 ? "#8a7a50" : "#7a6a48";
              ctx.beginPath();
              ctx.ellipse(rX, shY, 1.4 * s, 0.8 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              // Shell tip
              ctx.fillStyle = "#5a5a62";
              ctx.beginPath();
              ctx.arc(rX - 0.8 * s, shY - 0.3 * s, 0.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Shared cradle arm geometry (isometric rectangular prism, same iso system as hex prisms)
        const isoOff = (dx: number, dy: number) => ({ x: dx, y: dy * ISO_Y_RATIO });
        const beamW = 3 * s;
        const beamD = 3.5 * s;
        const hw = beamW * 0.5;
        const hd = beamD * 0.5;
        const crossSection = [
          isoOff(-hw, -hd), // back-left
          isoOff(hw, -hd),  // back-right
          isoOff(hw, hd),   // front-right
          isoOff(-hw, hd),  // front-left
        ];

        const tierRadii = [14 * s, 11 * s, 8 * s];
        const tierHeights = [6 * s, 5 * s, 4 * s];
        const tierDarks = ["#2a2a2e", "#2e2e34", "#32323a"];
        const tierLights = ["#606068", "#686870", "#72727a"];

        // Pre-compute tierY for arm positioning (sum of tier heights)
        const totalTierH = tierHeights[0] + tierHeights[1] + tierHeights[2];
        const tierYFinal = cy + 6 * s - totalTierH;

        // Helper to draw a single cradle arm
        const drawCradleArm = (armSide: -1 | 1) => {
          const armCx = cx + armSide * (tierRadii[0] + 2 * s);
          const armTopYi = tierYFinal + 1 * s;
          const armBotYi = cy + 5 * s;
          const leanX = armSide * -1.5 * s;
          const topX = armCx + leanX;
          const topY = armTopYi;
          const botX = armCx;
          const botY = armBotYi;

          const faceColors = [
            "#423c4a", // back
            armSide === 1 ? "#3a3442" : "#5e586a", // right
            "#545060", // front
            armSide === -1 ? "#3a3442" : "#5e586a", // left
          ];
          const drawOrder = armSide === 1 ? [0, 3, 1, 2] : [0, 1, 3, 2];

          for (const fi of drawOrder) {
            const ni = (fi + 1) % 4;
            ctx.fillStyle = faceColors[fi];
            ctx.beginPath();
            ctx.moveTo(botX + crossSection[fi].x, botY + crossSection[fi].y);
            ctx.lineTo(botX + crossSection[ni].x, botY + crossSection[ni].y);
            ctx.lineTo(topX + crossSection[ni].x, topY + crossSection[ni].y);
            ctx.lineTo(topX + crossSection[fi].x, topY + crossSection[fi].y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#302a36";
            ctx.lineWidth = 0.4 * s;
            ctx.stroke();
          }

          // Top cap (isometric parallelogram)
          ctx.fillStyle = "#6a6478";
          ctx.beginPath();
          ctx.moveTo(topX + crossSection[0].x, topY + crossSection[0].y);
          for (let ci = 1; ci < 4; ci++)
            ctx.lineTo(topX + crossSection[ci].x, topY + crossSection[ci].y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#302a36";
          ctx.lineWidth = 0.4 * s;
          ctx.stroke();

          // Highlight edge on front-facing vertical edge
          ctx.strokeStyle = "rgba(180,175,190,0.25)";
          ctx.lineWidth = 0.6 * s;
          ctx.beginPath();
          ctx.moveTo(botX + crossSection[2].x, botY + crossSection[2].y);
          ctx.lineTo(topX + crossSection[2].x, topY + crossSection[2].y);
          ctx.stroke();

          // Cross-brace detail (horizontal stiffener at mid-height)
          const midY = (topY + botY) * 0.5;
          const midX = (topX + botX) * 0.5;
          ctx.strokeStyle = "#504a58";
          ctx.lineWidth = 0.7 * s;
          ctx.beginPath();
          ctx.moveTo(midX + crossSection[2].x, midY + crossSection[2].y);
          ctx.lineTo(midX + crossSection[3].x, midY + crossSection[3].y);
          ctx.stroke();

          // Trunnion pivot bolt (isometric ellipse)
          const boltX = topX;
          const boltY = topY + 3 * s;
          ctx.fillStyle = "#5e586a";
          ctx.beginPath();
          ctx.ellipse(boltX, boltY, 1.6 * s, 1 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#908a9a";
          ctx.beginPath();
          ctx.ellipse(boltX - 0.2 * s, boltY - 0.15 * s, 0.85 * s, 0.55 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bottom anchor rivet
          ctx.fillStyle = "#605a6a";
          ctx.beginPath();
          ctx.ellipse(botX, botY - 1.5 * s, 0.8 * s, 0.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
        };

        // LEFT arm drawn FIRST (behind mortar body, isometric back)
        drawCradleArm(-1);

        // 3 stacked tiers (wide at bottom, narrow at top)
        let tierY = cy + 6 * s;

        for (let ti = 0; ti < 3; ti++) {
          const tr = tierRadii[ti];
          const th = tierHeights[ti];

          // Tier cylinder side
          const tGrad = ctx.createLinearGradient(cx - tr, 0, cx + tr, 0);
          tGrad.addColorStop(0, tierDarks[ti]);
          tGrad.addColorStop(0.3, tierLights[ti]);
          tGrad.addColorStop(0.7, tierLights[ti]);
          tGrad.addColorStop(1, tierDarks[ti]);
          ctx.fillStyle = tGrad;
          ctx.beginPath();
          ctx.ellipse(cx, tierY, tr, tr * 0.5, 0, 0, Math.PI);
          ctx.lineTo(cx - tr, tierY - th);
          ctx.ellipse(cx, tierY - th, tr, tr * 0.5, 0, Math.PI, 0, true);
          ctx.closePath();
          ctx.fill();

          // Tier top face
          const topGrad = ctx.createRadialGradient(cx - 1 * s, tierY - th - 1 * s, 0, cx, tierY - th, tr);
          topGrad.addColorStop(0, lightenColor(tierLights[ti], 15));
          topGrad.addColorStop(0.6, tierLights[ti]);
          topGrad.addColorStop(1, tierDarks[ti]);
          ctx.fillStyle = topGrad;
          ctx.beginPath();
          ctx.ellipse(cx, tierY - th, tr, tr * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Metal band at top of tier
          const bandColor = level >= 3 ? "#c9a227" : "#505058";
          ctx.strokeStyle = bandColor;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.ellipse(cx, tierY - th + 0.5 * s, tr * 1.02, tr * 0.51, 0, 0, Math.PI);
          ctx.stroke();

          tierY -= th;
        }

        // Top rim (flared, wider than top tier)
        const rimR = tierRadii[2] * 1.2;
        ctx.strokeStyle = level >= 3 ? "#c9a227" : "#505058";
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.ellipse(cx, tierY, rimR, rimR * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = level >= 3 ? "#d4aa30" : "#686870";
        ctx.beginPath();
        ctx.ellipse(cx, tierY, rimR, rimR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // RIGHT arm drawn AFTER mortar body (isometric front)
        drawCradleArm(1);

        // Dark bore opening
        ctx.fillStyle = "#0a0808";
        ctx.beginPath();
        ctx.ellipse(cx, tierY, tierRadii[2] * 0.75, tierRadii[2] * 0.375, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bore glow (animated)
        if (animated) {
          const glowPulse = 0.25 + Math.sin(t * 3) * 0.15;
          ctx.fillStyle = `rgba(255, 100, 20, ${glowPulse})`;
          ctx.shadowColor = "#ff4400";
          ctx.shadowBlur = 6 * s;
          ctx.beginPath();
          ctx.ellipse(cx, tierY, tierRadii[2] * 0.4, tierRadii[2] * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Level 2+: Targeting scope/sight on right side
        if (level >= 2) {
          const scopeX = cx + tierRadii[2] + 3 * s;
          ctx.strokeStyle = "#505058";
          ctx.lineWidth = 0.5 * s;
          ctx.beginPath();
          ctx.moveTo(scopeX, tierY);
          ctx.lineTo(scopeX, tierY - 6 * s);
          ctx.stroke();
          ctx.fillStyle = "#505058";
          ctx.beginPath();
          ctx.arc(scopeX, tierY - 6 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
        // Level 3+: Reinforcement plates and scope pennant
        if (level >= 3) {
          const plateFill = "#686870";
          ctx.fillStyle = plateFill;
          ctx.fillRect(cx - 4 * s, cy + 4 * s, 3 * s, 2 * s);
          ctx.fillRect(cx + 1 * s, cy + 2 * s, 2.5 * s, 1.5 * s);
          ctx.fillRect(cx - 2 * s, cy + 3 * s, 2 * s, 1.5 * s);
          const scopeX = cx + tierRadii[2] + 3 * s;
          ctx.fillStyle = "#8a3030";
          ctx.beginPath();
          ctx.moveTo(scopeX, tierY - 6 * s);
          ctx.lineTo(scopeX + 1.5 * s, tierY - 8 * s);
          ctx.lineTo(scopeX + 0.5 * s, tierY - 6 * s);
          ctx.closePath();
          ctx.fill();
        }

        // Level 4 upgrade effects
        if (level === 4 && upgrade) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = upgrade === "A" ? "rgba(100, 150, 220, 0.1)" : "rgba(255, 80, 20, 0.12)";
          ctx.fillRect(0, 0, size, size);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          if (upgrade === "A") {
            const tPulse = animated ? 0.5 + Math.sin(t * 4) * 0.3 : 0.6;
            ctx.strokeStyle = `rgba(100, 180, 255, ${tPulse * 0.7})`;
            ctx.lineWidth = 1 * s;
            if (animated) {
              const radarAngle = t * 3;
              ctx.beginPath();
              ctx.moveTo(cx, tierY);
              ctx.lineTo(
                cx + Math.cos(radarAngle) * 8 * s,
                tierY + Math.sin(radarAngle) * 4 * s
              );
              ctx.stroke();
            }
            ctx.strokeStyle = `rgba(100, 180, 255, ${tPulse * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(cx, tierY, 8 * s, 4 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `rgba(100, 180, 255, ${tPulse * 0.5})`;
            ctx.beginPath();
            ctx.arc(cx, tierY - 2 * s, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const ePulse = animated ? 0.5 + Math.sin(t * 3) * 0.3 : 0.6;
            ctx.fillStyle = `rgba(255, 60, 0, ${ePulse * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 12 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            if (animated) {
              for (let i = 0; i < 6; i++) {
                const ey = cy + 10 * s - ((t * 6 + i * 3) % 18) * s;
                const ex = cx + Math.sin(t * 2 + i * 1.5) * 8 * s;
                const eAlpha = Math.max(0, 1 - ((t * 6 + i * 3) % 18) / 18);
                ctx.fillStyle = `rgba(255, ${80 + i * 20}, 0, ${eAlpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(ex, ey, (1.5 - eAlpha * 0.5) * s, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.fillStyle = `rgba(255, 100, 0, ${ePulse})`;
            ctx.shadowColor = "#ff6400";
            ctx.shadowBlur = 10 * s;
            ctx.beginPath();
            ctx.ellipse(cx, tierY, tierRadii[2] * 0.6, tierRadii[2] * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        drawLevelIndicator(ctx, cx, cy, s, level, "#ff6600", upgrade);
        break;
      }
    }
  }, [type, size, level, upgrade, animated]);

  useSpriteTicker(animated, 50, renderTower);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR?: number,
) {
  const inner = innerR ?? outerR * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : inner;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawLevelIndicator(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  level: number,
  color: string,
  upgrade?: "A" | "B",
) {
  const starCount = Math.min(level, 3);
  if (starCount > 0) {
    const totalW = (starCount - 1) * 6 * s;
    const startX = cx - totalW / 2;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4 * s;
    for (let i = 0; i < starCount; i++) {
      drawStar(ctx, startX + i * 6 * s, cy + 22 * s, 2.5 * s);
    }
    ctx.shadowBlur = 0;
  }
  if (level === 4 && upgrade) {
    const badgeColor = upgrade === "A" ? "#ff6b6b" : "#4ecdc4";
    ctx.fillStyle = badgeColor;
    ctx.shadowColor = badgeColor;
    ctx.shadowBlur = 6 * s;
    ctx.beginPath();
    ctx.arc(cx + 12 * s, cy + 22 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${3.5 * s}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(upgrade, cx + 12 * s, cy + 22 * s);
  }
}
