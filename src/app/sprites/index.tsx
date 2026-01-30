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

        // Orange glowing vents on left face
        const ventGlow = animated ? 0.6 + Math.sin(t * 4) * 0.3 : 0.7;
        // Vent housings
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx - 11 * s, cy - 2 * s, 4 * s, 8 * s);
        // Vent slats with glow
        ctx.fillStyle = `rgba(255, 120, 20, ${ventGlow})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 8 * s;
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(cx - 10.5 * s, cy - 1 * s + i * 2 * s, 3 * s, 1 * s);
        }
        ctx.shadowBlur = 0;

        // Orange glowing vents on right face
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx + 7 * s, cy - 2 * s, 4 * s, 8 * s);
        ctx.fillStyle = `rgba(255, 120, 20, ${ventGlow})`;
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 8 * s;
        for (let i = 0; i < 4; i++) {
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
        ctx.strokeStyle = "#4a4a4f";
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
        ctx.fillStyle = "#55555a";
        ctx.fillRect(5 * s, -4 * s, 3 * s, 8 * s);
        ctx.fillRect(12 * s, -3.5 * s, 2.5 * s, 7 * s);
        ctx.fillRect(18 * s, -3 * s, 2 * s, 6 * s);

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

        // Level indicator
        if (level > 1) {
          ctx.fillStyle = "#ff6600";
          ctx.shadowColor = "#ff6600";
          ctx.shadowBlur = 4 * s;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 6 * s + i * 6 * s, cy + 22 * s, 2.5 * s);
          }
          ctx.shadowBlur = 0;
        }
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

        // Decorative trim bands
        ctx.fillStyle = "#6a6575";
        ctx.fillRect(cx - 11 * s, cy + 8 * s, 10 * s, 1.5 * s);
        ctx.fillRect(cx + 1 * s, cy + 8 * s, 10 * s, 1.5 * s);
        ctx.fillRect(cx - 10 * s, cy - 2 * s, 9 * s, 1.5 * s);
        ctx.fillRect(cx + 1 * s, cy - 2 * s, 9 * s, 1.5 * s);

        // Purple arched windows - left side
        const glowIntensity = animated ? 0.6 + Math.sin(t * 2) * 0.3 : 0.8;
        ctx.fillStyle = "#1a1520";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * s, cy + 6 * s);
        ctx.lineTo(cx - 9 * s, cy + 2 * s);
        ctx.arc(cx - 7 * s, cy + 2 * s, 2 * s, Math.PI, 0);
        ctx.lineTo(cx - 5 * s, cy + 6 * s);
        ctx.closePath();
        ctx.fill();
        // Window glow
        ctx.fillStyle = `rgba(160, 80, 220, ${glowIntensity})`;
        ctx.shadowColor = "#a050dc";
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
        ctx.fillStyle = `rgba(160, 80, 220, ${glowIntensity})`;
        ctx.shadowColor = "#a050dc";
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
        roseGrad.addColorStop(0, `rgba(200, 120, 255, ${glowIntensity})`);
        roseGrad.addColorStop(0.5, `rgba(160, 80, 220, ${glowIntensity * 0.8})`);
        roseGrad.addColorStop(1, `rgba(100, 40, 180, ${glowIntensity * 0.5})`);
        ctx.fillStyle = roseGrad;
        ctx.shadowColor = "#c080ff";
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
        ctx.fillStyle = `rgba(180, 100, 255, ${glowIntensity})`;
        ctx.shadowColor = "#b464ff";
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
        ctx.fillStyle = `rgba(160, 80, 220, ${glowIntensity * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, cy + 15 * s);
        ctx.lineTo(cx - 2 * s, cy + 12 * s);
        ctx.arc(cx, cy + 12 * s, 2 * s, Math.PI, 0);
        ctx.lineTo(cx + 2 * s, cy + 15 * s);
        ctx.closePath();
        ctx.fill();

        // Floating magic particles
        if (animated) {
          ctx.fillStyle = `rgba(180, 120, 255, ${0.5 + Math.sin(t * 3) * 0.3})`;
          for (let i = 0; i < 5; i++) {
            const particleAngle = t * 0.8 + (i * Math.PI * 2) / 5;
            const particleR = 10 * s + Math.sin(t * 2 + i) * 2 * s;
            const px = cx + Math.cos(particleAngle) * particleR;
            const py = cy - 5 * s + Math.sin(particleAngle) * particleR * 0.4;
            ctx.beginPath();
            ctx.arc(px, py, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Level stars
        if (level > 1) {
          ctx.fillStyle = "#b464ff";
          ctx.shadowColor = "#b464ff";
          ctx.shadowBlur = 4 * s;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 6 * s + i * 6 * s, cy + 22 * s, 2.5 * s);
          }
          ctx.shadowBlur = 0;
        }
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
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 1.5 * s;
        // Extra ring at the bottom
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4.5 * s, 6 * s, 1.5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Main coil rings
        for (let i = 0; i < 5; i++) {
          const ringY = cy - 7 * s - i * 2.5 * s;
          const ringW = 5.5 * s - i * 0.5 * s;
          ctx.beginPath();
          ctx.ellipse(cx, ringY, ringW, 1.5 * s, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Energy orb at top - large cyan glow - moved down
        const orbY = cy - 19 * s;
        const orbPulse = animated ? 1 + Math.sin(t * 3) * 0.15 : 1;
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
          for (let i = 0; i < 6; i++) {
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

        // Level stars
        if (level > 1) {
          ctx.fillStyle = "#00ffff";
          ctx.shadowColor = "#00ffff";
          ctx.shadowBlur = 4 * s;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 6 * s + i * 6 * s, cy + 22 * s, 2.5 * s);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "arch": {
        // =====================================================================
        // BLAIR ARCH - Gothic Arch with Central Spire and Green Portal
        // Tan stone base with thick arch and single central triangle spike
        // =====================================================================

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
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.5 * s;
        for (let row = 0; row < 4; row++) {
          const y = cy + 10 * s - row * 4 * s;
          ctx.beginPath();
          ctx.moveTo(cx - 14 * s + row * s, y);
          ctx.lineTo(cx - 7 * s, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 7 * s, y);
          ctx.lineTo(cx + 14 * s - row * s, y);
          ctx.stroke();
        }

        // CENTRAL TRIANGLE SPIRE
        // Left face of spire (darker)
        ctx.fillStyle = "#7a6a50";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx - 6 * s, cy - 10 * s);
        ctx.lineTo(cx, cy - 12 * s);
        ctx.closePath();
        ctx.fill();

        // Right face of spire (lighter)
        ctx.fillStyle = "#9a8a70";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx + 6 * s, cy - 10 * s);
        ctx.lineTo(cx, cy - 12 * s);
        ctx.closePath();
        ctx.fill();

        // Spire orb at top
        const portalGlow = animated ? 0.5 + Math.sin(t * 2) * 0.25 : 0.6;
        ctx.fillStyle = `rgba(100, 255, 150, ${portalGlow})`;
        ctx.shadowColor = "#64ff96";
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

        // GREEN PORTAL GLOW
        const greenGrad = ctx.createRadialGradient(cx, cy + 4 * s, 0, cx, cy + 4 * s, 10 * s);
        greenGrad.addColorStop(0, `rgba(120, 255, 150, ${portalGlow})`);
        greenGrad.addColorStop(0.4, `rgba(80, 220, 100, ${portalGlow * 0.8})`);
        greenGrad.addColorStop(0.7, `rgba(40, 180, 80, ${portalGlow * 0.5})`);
        greenGrad.addColorStop(1, `rgba(20, 100, 50, ${portalGlow * 0.2})`);
        ctx.fillStyle = greenGrad;
        ctx.shadowColor = "#50ff80";
        ctx.shadowBlur = 15 * s;
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * s, 6 * s, Math.PI, 0);
        ctx.lineTo(cx + 6 * s, cy + 12 * s);
        ctx.lineTo(cx - 6 * s, cy + 12 * s);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Green glowing windows on arch walls
        ctx.fillStyle = "#1a2a1a";
        ctx.fillRect(cx - 12 * s, cy - 2 * s, 3 * s, 5 * s);
        ctx.fillRect(cx + 9 * s, cy - 2 * s, 3 * s, 5 * s);
        ctx.fillStyle = `rgba(80, 220, 100, ${portalGlow})`;
        ctx.shadowColor = "#50dc64";
        ctx.shadowBlur = 4 * s;
        ctx.fillRect(cx - 11.5 * s, cy - 1.5 * s, 2 * s, 4 * s);
        ctx.fillRect(cx + 9.5 * s, cy - 1.5 * s, 2 * s, 4 * s);
        ctx.shadowBlur = 0;

        // Portal swirl effect
        if (animated) {
          ctx.strokeStyle = `rgba(150, 255, 180, ${0.5 + Math.sin(t * 3) * 0.3})`;
          ctx.lineWidth = 1.2 * s;
          for (let i = 0; i < 3; i++) {
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

        // Musical notes emanating from portal
        if (animated) {
          ctx.fillStyle = `rgba(100, 255, 150, ${0.6 + Math.sin(t * 4) * 0.3})`;
          ctx.font = `${3 * s}px serif`;
          ctx.textAlign = "center";
          const noteY = cy - ((t * 15) % 12) * s;
          const noteAlpha = Math.max(0, 1 - ((t * 15) % 12) / 12);
          ctx.globalAlpha = noteAlpha;
          ctx.fillText("♪", cx - 3 * s, noteY);
          ctx.fillText("♫", cx + 3 * s, noteY + 2 * s);
          ctx.globalAlpha = 1;
        }

        // Level stars
        if (level > 1) {
          ctx.fillStyle = "#50ff80";
          ctx.shadowColor = "#50ff80";
          ctx.shadowBlur = 4 * s;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 6 * s + i * 6 * s, cy + 22 * s, 2.5 * s);
          }
          ctx.shadowBlur = 0;
        }
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
        ctx.fillStyle = "#4a7a4a";
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
          for (let i = 0; i < 3; i++) {
            const orbitAngle = t * 1.5 + (i * Math.PI * 2) / 3;
            const orbitRadius = 8 * s;
            const orbX = cx + Math.cos(orbitAngle) * orbitRadius;
            const orbY = dollarY + Math.sin(orbitAngle) * orbitRadius * 0.4; // Flatten for isometric
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
        ctx.shadowBlur = 12 * s;
        ctx.font = `bold ${10 * s}px Arial`;
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

        // Level stars
        if (level > 1) {
          ctx.fillStyle = "#ffd700";
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 4 * s;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 6 * s + i * 6 * s, cy + 22 * s, 2.5 * s);
          }
          ctx.shadowBlur = 0;
        }
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

        // Decorative trim
        ctx.fillStyle = "#9a4a4a";
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
        ctx.strokeStyle = "#4a3020";
        ctx.lineWidth = 0.6 * s;
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

        // Station windows with warm glow
        const windowGlow = animated ? 0.6 + Math.sin(t * 2) * 0.2 : 0.7;
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
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx - 10 * s, cy + 2 * s, 20 * s, 3 * s);
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

        // Level stars
        if (level > 1) {
          ctx.fillStyle = "#ff6600";
          ctx.shadowColor = "#ff6600";
          ctx.shadowBlur = 4 * s;
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 6 * s + i * 6 * s, cy + 22 * s, 2.5 * s);
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
    const scale = size / 62;
    const t = time * 0.08;
    const bounce = animated ? Math.sin(t) * 1.5 : 0;
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16 * scale, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    switch (type) {
      case "tiger": {
        // PRINCETON TIGER - Mechanical Warrior with Bronze/Orange Armor
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const gemGlow = 0.6 + Math.sin(t * 3) * 0.4;

        // Fiery orange/red aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(255, 100, 30, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(220, 60, 10, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === MASSIVE MECHANICAL SHOULDER PADS (behind body) ===
        const armSwing = animated ? Math.sin(t * 2) * 0.05 : 0;

        // Left shoulder pad - large circular mechanical design
        ctx.save();
        ctx.translate(cx - 16 * scale, cy - 4 * scale + bounce);
        ctx.rotate(-0.15 + armSwing);

        // Outer ring - dark metal
        ctx.fillStyle = "#2a2020";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Orange/red flame pattern ring
        const leftFlameGrad = ctx.createRadialGradient(0, 2 * scale, 4 * scale, 0, 2 * scale, 14 * scale);
        leftFlameGrad.addColorStop(0, "#ff7020");
        leftFlameGrad.addColorStop(0.5, "#e04010");
        leftFlameGrad.addColorStop(1, "#a02000");
        ctx.fillStyle = leftFlameGrad;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Inner dark ring
        ctx.fillStyle = "#1a1515";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Center bronze ring with glowing red gem
        ctx.fillStyle = "#b06030";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Red gem center
        ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bronze decorative bolts around edge
        ctx.fillStyle = "#c07040";
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.arc(
            Math.cos(angle) * 10 * scale,
            2 * scale + Math.sin(angle) * 10 * scale,
            1.5 * scale, 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // Right shoulder pad - large circular mechanical design
        ctx.save();
        ctx.translate(cx + 16 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.15 - armSwing);

        // Outer ring - dark metal
        ctx.fillStyle = "#2a2020";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Orange/red flame pattern ring
        const rightFlameGrad = ctx.createRadialGradient(0, 2 * scale, 4 * scale, 0, 2 * scale, 14 * scale);
        rightFlameGrad.addColorStop(0, "#ff7020");
        rightFlameGrad.addColorStop(0.5, "#e04010");
        rightFlameGrad.addColorStop(1, "#a02000");
        ctx.fillStyle = rightFlameGrad;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Inner dark ring
        ctx.fillStyle = "#1a1515";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Center bronze ring with glowing red gem
        ctx.fillStyle = "#b06030";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Red gem center
        ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bronze decorative bolts around edge
        ctx.fillStyle = "#c07040";
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.arc(
            Math.cos(angle) * 10 * scale,
            2 * scale + Math.sin(angle) * 10 * scale,
            1.5 * scale, 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // === MECHANICAL ARMS ===
        // Left arm
        ctx.save();
        ctx.translate(cx - 18 * scale, cy + 8 * scale + bounce);
        ctx.rotate(-0.3 + armSwing);

        // Bronze forearm armor
        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-5 * scale, -2 * scale, 10 * scale, 14 * scale, 3 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Bronze fist
        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-4 * scale, 10 * scale, 8 * scale, 8 * scale, 2 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.stroke();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(cx + 18 * scale, cy + 8 * scale + bounce);
        ctx.rotate(0.3 - armSwing);

        // Bronze forearm armor
        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-5 * scale, -2 * scale, 10 * scale, 14 * scale, 3 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Bronze fist
        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-4 * scale, 10 * scale, 8 * scale, 8 * scale, 2 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.stroke();
        ctx.restore();

        // === MAIN ARMOR BODY ===
        // Dark leather/metal chest piece with warm undertone
        const bodyGrad = ctx.createLinearGradient(cx - 12 * scale, cy, cx + 12 * scale, cy);
        bodyGrad.addColorStop(0, "#2a2220");
        bodyGrad.addColorStop(0.3, "#3a3230");
        bodyGrad.addColorStop(0.5, "#4a4240");
        bodyGrad.addColorStop(0.7, "#3a3230");
        bodyGrad.addColorStop(1, "#2a2220");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 16 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Bronze trim V-pattern
        ctx.strokeStyle = "#b06030";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx, cy + 4 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 6 * scale + bounce);
        ctx.stroke();

        // Center chest emblem - bronze/copper diamond
        ctx.fillStyle = "#b06030";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx, cy + 8 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy + 2 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Decorative bronze studs
        ctx.fillStyle = "#a05030";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(cx - 6 * scale, cy - 2 * scale + i * 4 * scale + bounce, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 6 * scale, cy - 2 * scale + i * 4 * scale + bounce, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === TIGER HEAD ===
        // Main head shape - vibrant orange fur
        ctx.fillStyle = "#e86a10";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20 * scale + bounce, 12 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tiger ears
        ctx.fillStyle = "#d05a00";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 34 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 28 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 9 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 34 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 28 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Inner ears - pink
        ctx.fillStyle = "#ffb8a0";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 27 * scale + bounce);
        ctx.lineTo(cx - 11 * scale, cy - 32 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 28 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale, cy - 27 * scale + bounce);
        ctx.lineTo(cx + 11 * scale, cy - 32 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 28 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Tiger stripes on head
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 28 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy - 22 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 28 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 22 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 30 * scale + bounce);
        ctx.lineTo(cx, cy - 24 * scale + bounce);
        ctx.stroke();

        // White muzzle area
        ctx.fillStyle = "#fff8f0";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 17 * scale + bounce, 6 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing green eyes (fierce and distinctive)
        ctx.shadowColor = "#66ff33";
        ctx.shadowBlur = 6 * scale;
        ctx.fillStyle = "#aaff44";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 22 * scale + bounce, 3 * scale, 2.5 * scale, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy - 22 * scale + bounce, 3 * scale, 2.5 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Angry eyebrows
        ctx.fillStyle = "#d04000";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy - 23 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 24 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy - 23 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 24 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Pupils
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 22 * scale + bounce, 1.2 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy - 22 * scale + bounce, 1.2 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Black nose
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 18 * scale + bounce);
        ctx.lineTo(cx - 2.5 * scale, cy - 15.5 * scale + bounce);
        ctx.lineTo(cx + 2.5 * scale, cy - 15.5 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Open mouth with fangs
        ctx.fillStyle = "#4a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 13 * scale + bounce, 4 * scale, 3 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Tongue
        ctx.fillStyle = "#cc5555";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 11 * scale + bounce, 2.5 * scale, 2 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Fangs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 14 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 1 * scale, cy - 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 1 * scale, cy - 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "mathey": {
        // MATHEY KNIGHT - Silver/Blue Armored Knight with M Shield and Hammer
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const eyeGlow = 0.7 + Math.sin(t * 3) * 0.3;

        // Cyan/teal magical aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * scale);
        auraGrad.addColorStop(0, `rgba(100, 200, 220, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.6, `rgba(70, 150, 180, ${auraPulse * 0.12})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 24 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === HAMMER (behind body) ===
        ctx.save();
        ctx.translate(cx + 16 * scale, cy - 8 * scale + bounce);
        ctx.rotate(0.4);

        // Long wooden handle
        ctx.fillStyle = "#8b6914";
        ctx.beginPath();
        ctx.roundRect(-2 * scale, -8 * scale, 4 * scale, 32 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#6b4904";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Hammer head - dark blue metal
        const hammerGrad = ctx.createLinearGradient(-8 * scale, -14 * scale, 8 * scale, -8 * scale);
        hammerGrad.addColorStop(0, "#2a3a5a");
        hammerGrad.addColorStop(0.3, "#4a5a7a");
        hammerGrad.addColorStop(0.5, "#6070a0");
        hammerGrad.addColorStop(0.7, "#4a5a7a");
        hammerGrad.addColorStop(1, "#2a3a5a");
        ctx.fillStyle = hammerGrad;
        ctx.beginPath();
        ctx.roundRect(-8 * scale, -16 * scale, 16 * scale, 10 * scale, 2 * scale);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Hammer face details
        ctx.fillStyle = "#3a4a6a";
        ctx.fillRect(-6 * scale, -14 * scale, 2 * scale, 6 * scale);
        ctx.fillRect(4 * scale, -14 * scale, 2 * scale, 6 * scale);
        ctx.restore();

        // === LEFT ARM WITH SHIELD ===
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.3);

        // Pauldron (shoulder armor) - dark blue
        const leftPauldronGrad = ctx.createLinearGradient(-6 * scale, -4 * scale, 6 * scale, 6 * scale);
        leftPauldronGrad.addColorStop(0, "#3a4a6a");
        leftPauldronGrad.addColorStop(0.5, "#5060a0");
        leftPauldronGrad.addColorStop(1, "#2a3a5a");
        ctx.fillStyle = leftPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(-2 * scale, 0, 7 * scale, 6 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Upper arm armor - dark blue
        ctx.fillStyle = "#3a4a7a";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 8 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a5a";
        ctx.stroke();

        // Gauntlet - dark blue
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(-2 * scale, 16 * scale, 4.5 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.stroke();
        ctx.restore();

        // M-SHIELD (prominent, in front)
        ctx.save();
        ctx.translate(cx - 18 * scale, cy + 2 * scale + bounce);

        // Shield main body - cyan/teal with silver border
        const shieldGrad = ctx.createLinearGradient(-8 * scale, -10 * scale, 8 * scale, 12 * scale);
        shieldGrad.addColorStop(0, "#4a7a8a");
        shieldGrad.addColorStop(0.3, "#5a9aaa");
        shieldGrad.addColorStop(0.6, "#4a8a9a");
        shieldGrad.addColorStop(1, "#3a6a7a");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -12 * scale);
        ctx.lineTo(-10 * scale, -8 * scale);
        ctx.lineTo(-10 * scale, 6 * scale);
        ctx.lineTo(0, 14 * scale);
        ctx.lineTo(10 * scale, 6 * scale);
        ctx.lineTo(10 * scale, -8 * scale);
        ctx.closePath();
        ctx.fill();

        // Silver border
        ctx.strokeStyle = "#b0c0d0";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // M emblem - stylized cyan M
        ctx.fillStyle = "#7acce0";
        ctx.shadowColor = "#7acce0";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, 6 * scale);
        ctx.lineTo(-6 * scale, -4 * scale);
        ctx.lineTo(-3 * scale, -4 * scale);
        ctx.lineTo(0, 2 * scale);
        ctx.lineTo(3 * scale, -4 * scale);
        ctx.lineTo(6 * scale, -4 * scale);
        ctx.lineTo(6 * scale, 6 * scale);
        ctx.lineTo(4 * scale, 6 * scale);
        ctx.lineTo(4 * scale, 0);
        ctx.lineTo(0, 6 * scale);
        ctx.lineTo(-4 * scale, 0);
        ctx.lineTo(-4 * scale, 6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Small shields on sides of main shield
        ctx.fillStyle = "#5a8a9a";
        ctx.beginPath();
        ctx.moveTo(-12 * scale, -4 * scale);
        ctx.lineTo(-14 * scale, 0);
        ctx.lineTo(-12 * scale, 4 * scale);
        ctx.lineTo(-10 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(12 * scale, -4 * scale);
        ctx.lineTo(14 * scale, 0);
        ctx.lineTo(12 * scale, 4 * scale);
        ctx.lineTo(10 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // === MAIN ARMOR BODY - Dark Blue ===
        const armorGrad = ctx.createLinearGradient(cx - 12 * scale, cy, cx + 12 * scale, cy);
        armorGrad.addColorStop(0, "#1a2a4a");
        armorGrad.addColorStop(0.3, "#3a4a7a");
        armorGrad.addColorStop(0.5, "#4a5a9a");
        armorGrad.addColorStop(0.7, "#3a4a7a");
        armorGrad.addColorStop(1, "#1a2a4a");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy + 16 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0a1a3a";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Center chest emblem - M symbol (cyan glow)
        ctx.fillStyle = "#7acce0";
        ctx.shadowColor = "#7acce0";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx, cy + 2 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx, cy + 6 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy + 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Armor rivets - cyan accents
        ctx.fillStyle = "#5090b0";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(cx - 7 * scale, cy + i * 5 * scale + bounce, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 7 * scale, cy + i * 5 * scale + bounce, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === RIGHT ARM ===
        ctx.save();
        ctx.translate(cx + 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.35);

        // Pauldron - dark blue
        const rightPauldronGrad = ctx.createLinearGradient(-6 * scale, -4 * scale, 6 * scale, 6 * scale);
        rightPauldronGrad.addColorStop(0, "#2a3a5a");
        rightPauldronGrad.addColorStop(0.5, "#5060a0");
        rightPauldronGrad.addColorStop(1, "#3a4a6a");
        ctx.fillStyle = rightPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(2 * scale, 0, 7 * scale, 6 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Upper arm armor - dark blue
        ctx.fillStyle = "#3a4a7a";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 8 * scale, 5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a5a";
        ctx.stroke();

        // Gauntlet gripping hammer - dark blue
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(2 * scale, 16 * scale, 4.5 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.stroke();
        ctx.restore();

        // === HELMET ===
        // Main helmet dome - dark blue
        const helmetGrad = ctx.createRadialGradient(cx, cy - 20 * scale + bounce, 0, cx, cy - 20 * scale + bounce, 12 * scale);
        helmetGrad.addColorStop(0, "#5060a0");
        helmetGrad.addColorStop(0.5, "#3a4a7a");
        helmetGrad.addColorStop(1, "#1a2a4a");
        ctx.fillStyle = helmetGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20 * scale + bounce, 11 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0a1a3a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Helmet spikes on top - dark blue with cyan tips
        ctx.fillStyle = "#4a5a8a";
        // Center spike
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 28 * scale + bounce);
        ctx.lineTo(cx, cy - 36 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 28 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.stroke();
        // Left spike
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 7 * scale, cy - 32 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy - 26 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Right spike
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx + 7 * scale, cy - 32 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 26 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Face plate / visor - dark slit
        ctx.fillStyle = "#0a1020";
        ctx.beginPath();
        ctx.roundRect(cx - 8 * scale, cy - 22 * scale + bounce, 16 * scale, 6 * scale, 1 * scale);
        ctx.fill();

        // Glowing cyan eyes behind visor
        ctx.fillStyle = `rgba(100, 220, 255, ${eyeGlow})`;
        ctx.shadowColor = "#64e0ff";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.ellipse(cx - 4 * scale, cy - 19 * scale + bounce, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 4 * scale, cy - 19 * scale + bounce, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Helmet chin guard - dark blue
        ctx.fillStyle = "#3a4a7a";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 14 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 14 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5a6a7a";
        ctx.stroke();
        break;
      }
      case "rocky": {
        // ROCKY THE SQUIRREL - Natural brown squirrel mascot holding glowing acorn
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const acornGlow = 0.6 + Math.sin(t * 3) * 0.4;

        // Warm amber/brown magical aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * scale);
        auraGrad.addColorStop(0, `rgba(180, 120, 60, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.6, `rgba(140, 90, 40, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 24 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === FLUFFY TAIL (behind body) ===
        const tailWave = animated ? Math.sin(t * 2) * 0.1 : 0;
        ctx.save();
        ctx.translate(cx + 10 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.3 + tailWave);

        // Main tail - rich brown fluffy
        const tailGrad = ctx.createRadialGradient(6 * scale, -8 * scale, 0, 6 * scale, -8 * scale, 20 * scale);
        tailGrad.addColorStop(0, "#a07050");
        tailGrad.addColorStop(0.5, "#8a5a3a");
        tailGrad.addColorStop(1, "#6a4020");
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12 * scale, -8 * scale, 14 * scale, -22 * scale);
        ctx.quadraticCurveTo(16 * scale, -32 * scale, 8 * scale, -30 * scale);
        ctx.quadraticCurveTo(0, -28 * scale, -2 * scale, -18 * scale);
        ctx.quadraticCurveTo(-4 * scale, -8 * scale, 0, 0);
        ctx.closePath();
        ctx.fill();

        // Tail fur stripes - darker brown
        ctx.strokeStyle = "#5a3a20";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(4 * scale, -6 * scale);
        ctx.quadraticCurveTo(10 * scale, -14 * scale, 10 * scale, -24 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2 * scale, -10 * scale);
        ctx.quadraticCurveTo(6 * scale, -18 * scale, 6 * scale, -26 * scale);
        ctx.stroke();
        ctx.restore();

        // === BODY - Round squirrel body ===
        // Main body - warm brown
        const bodyGrad = ctx.createRadialGradient(cx, cy + 4 * scale + bounce, 0, cx, cy + 4 * scale + bounce, 16 * scale);
        bodyGrad.addColorStop(0, "#a07050");
        bodyGrad.addColorStop(0.6, "#8a5a3a");
        bodyGrad.addColorStop(1, "#6a4020");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4 * scale + bounce, 14 * scale, 16 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // White/cream belly patch
        ctx.fillStyle = "#f5f0e8";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6 * scale + bounce, 10 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // === LITTLE ARMS ===
        const armSwing = animated ? Math.sin(t * 2.5) * 0.08 : 0;

        // Left arm (holding acorn)
        ctx.save();
        ctx.translate(cx - 10 * scale, cy + bounce);
        ctx.rotate(-0.5 + armSwing);

        ctx.fillStyle = "#8a5a3a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 4 * scale, 7 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Tiny paw
        ctx.fillStyle = "#7a4a2a";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 3.5 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right arm (holding acorn)
        ctx.save();
        ctx.translate(cx + 10 * scale, cy + bounce);
        ctx.rotate(0.5 - armSwing);

        ctx.fillStyle = "#8a5a3a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 4 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Tiny paw
        ctx.fillStyle = "#7a4a2a";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 3.5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === GLOWING ACORN (held by both paws) ===
        ctx.save();
        ctx.translate(cx - 8 * scale, cy + 6 * scale + bounce);

        // Acorn glow aura - warm amber
        const acornAuraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
        acornAuraGrad.addColorStop(0, `rgba(220, 160, 60, ${acornGlow * 0.6})`);
        acornAuraGrad.addColorStop(0.5, `rgba(180, 120, 40, ${acornGlow * 0.3})`);
        acornAuraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = acornAuraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Acorn cap - dark brown
        ctx.fillStyle = "#5a3a1a";
        ctx.beginPath();
        ctx.ellipse(0, -3 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cap texture
        ctx.strokeStyle = "#4a2a10";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(0, -3 * scale, 3 * scale, 0, Math.PI);
        ctx.stroke();

        // Acorn body - warm amber/orange
        ctx.fillStyle = "#c87030";
        ctx.shadowColor = "#e89050";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Acorn highlight
        ctx.fillStyle = "#e8a060";
        ctx.beginPath();
        ctx.ellipse(-1.5 * scale, 1 * scale, 1.5 * scale, 2 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === SQUIRREL HEAD ===
        // Main head - round and cute
        ctx.fillStyle = "#a07050";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale + bounce, 12 * scale, 11 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cheek patches - lighter tan
        ctx.fillStyle = "#c0906a";
        ctx.beginPath();
        ctx.ellipse(cx - 7 * scale, cy - 12 * scale + bounce, 4 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 7 * scale, cy - 12 * scale + bounce, 4 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Ears - round squirrel ears
        ctx.fillStyle = "#8a5a3a";
        ctx.beginPath();
        ctx.ellipse(cx - 9 * scale, cy - 22 * scale + bounce, 4 * scale, 5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 9 * scale, cy - 22 * scale + bounce, 4 * scale, 5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Inner ears - pink
        ctx.fillStyle = "#e8b8a0";
        ctx.beginPath();
        ctx.ellipse(cx - 9 * scale, cy - 22 * scale + bounce, 2.5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 9 * scale, cy - 22 * scale + bounce, 2.5 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Face markings - cream muzzle
        ctx.fillStyle = "#f5f0e8";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 * scale + bounce, 5 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Big cute eyes with glasses effect
        // Eye whites
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 16 * scale + bounce, 4 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy - 16 * scale + bounce, 4 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye rims (glasses-like) - dark brown
        ctx.strokeStyle = "#5a3a1a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 16 * scale + bounce, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + 5 * scale, cy - 16 * scale + bounce, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Bridge between eyes
        ctx.beginPath();
        ctx.moveTo(cx - 1 * scale, cy - 16 * scale + bounce);
        ctx.lineTo(cx + 1 * scale, cy - 16 * scale + bounce);
        ctx.stroke();

        // Pupils - big and cute (blue eyes!)
        ctx.fillStyle = "#2a5a8a";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 16 * scale + bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy - 16 * scale + bounce, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Black pupils
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 16 * scale + bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy - 16 * scale + bounce, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 17 * scale + bounce, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 6 * scale, cy - 17 * scale + bounce, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Small black nose
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 9 * scale + bounce, 2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute smile
        ctx.strokeStyle = "#5a3a1a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale + bounce, 2 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Whisker dots
        ctx.fillStyle = "#5a3a1a";
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(cx + side * 3 * scale, cy - 8 * scale + bounce, 0.5 * scale, 0, Math.PI * 2);
          ctx.arc(cx + side * 4 * scale, cy - 9 * scale + bounce, 0.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "tenor": {
        // TENOR - Bard with striped outfit, hat, singing with music notes
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const mouthVibrato = animated ? Math.sin(t * 5) * 0.5 : 0;

        // Purple musical aura with concentric rings
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(150, 80, 180, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(120, 60, 150, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Animated concentric sound rings - purple
        if (animated) {
          for (let ring = 0; ring < 3; ring++) {
            const ringPhase = (t * 0.3 + ring * 0.3) % 1;
            const ringRadius = 12 * scale + ringPhase * 16 * scale;
            ctx.strokeStyle = `rgba(180, 100, 220, ${(1 - ringPhase) * 0.4})`;
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // === FLOWING PURPLE/BLACK ROBE/COAT ===
        const robeGrad = ctx.createLinearGradient(cx - 14 * scale, cy, cx + 14 * scale, cy);
        robeGrad.addColorStop(0, "#2a1040");
        robeGrad.addColorStop(0.3, "#4a2060");
        robeGrad.addColorStop(0.5, "#5a2870");
        robeGrad.addColorStop(0.7, "#4a2060");
        robeGrad.addColorStop(1, "#2a1040");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 18 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Bright purple lapels (filled, not just stroked)
        ctx.fillStyle = "#9060c0";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy + 8 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy + 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 16 * scale, cy + 8 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Glowing purple trim on lapels
        ctx.strokeStyle = "#b080e0";
        ctx.shadowColor = "#b080e0";
        ctx.shadowBlur = 4 * scale;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy + 8 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 8 * scale + bounce);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Purple pocket squares / accents on both sides
        ctx.fillStyle = "#b070d0";
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy + 3 * scale + bounce);
        ctx.lineTo(cx - 11 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx - 9 * scale, cy + 3 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 11 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 3 * scale + bounce);
        ctx.lineTo(cx + 11 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 9 * scale, cy + 3 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Striped shirt/vest front
        ctx.fillStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy + 14 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Horizontal stripes on shirt
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1.5 * scale;
        for (let i = 0; i < 7; i++) {
          const stripeY = cy - 6 * scale + i * 3 * scale + bounce;
          ctx.beginPath();
          ctx.moveTo(cx - 5 * scale, stripeY);
          ctx.lineTo(cx + 5 * scale, stripeY);
          ctx.stroke();
        }

        // Purple bow tie with glow
        ctx.fillStyle = "#a060d0";
        ctx.shadowColor = "#c080ff";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 11 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 5 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 11 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 5 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c080f0";
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale + bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === EXPRESSIVE ARMS ===
        const armGesture = animated ? Math.sin(t * 2) * 0.2 : 0;

        // Left arm - dramatic gesture outward
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.rotate(-0.8 + armGesture);

        // Purple sleeve
        const leftSleeveGrad = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 12 * scale);
        leftSleeveGrad.addColorStop(0, "#3a1850");
        leftSleeveGrad.addColorStop(0.5, "#5a2870");
        leftSleeveGrad.addColorStop(1, "#2a1040");
        ctx.fillStyle = leftSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright purple cuff with glow
        ctx.fillStyle = "#a060c0";
        ctx.shadowColor = "#c080ff";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 14 * scale, 4.5 * scale, 2.5 * scale, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hand extended outward
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 3.5 * scale, 4 * scale, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spread fingers
        for (let f = 0; f < 5; f++) {
          const fingerAngle = -0.5 + f * 0.25;
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

        // Right arm - dramatic gesture outward
        ctx.save();
        ctx.translate(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.8 - armGesture);

        // Purple sleeve
        const rightSleeveGrad = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 12 * scale);
        rightSleeveGrad.addColorStop(0, "#2a1040");
        rightSleeveGrad.addColorStop(0.5, "#5a2870");
        rightSleeveGrad.addColorStop(1, "#3a1850");
        ctx.fillStyle = rightSleeveGrad;
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright purple cuff with glow
        ctx.fillStyle = "#a060c0";
        ctx.shadowColor = "#c080ff";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 14 * scale, 4.5 * scale, 2.5 * scale, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hand extended outward
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 3.5 * scale, 4 * scale, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spread fingers
        for (let f = 0; f < 5; f++) {
          const fingerAngle = 0.5 - f * 0.25;
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

        // === HEAD ===
        // Face - warm skin tone
        ctx.fillStyle = "#e8c090";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 18 * scale + bounce, 10 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wide open singing mouth - very expressive
        const mouthHeight = 5 + mouthVibrato;
        ctx.fillStyle = "#3a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale + bounce, 5 * scale, mouthHeight * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tongue inside
        ctx.fillStyle = "#cc6060";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 11 * scale + bounce, 3 * scale, 2 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Teeth hint at top of mouth
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 17 * scale + bounce, 4 * scale, 1.5 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Closed happy eyes (curved lines)
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 20 * scale + bounce, 2.5 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 4 * scale, cy - 20 * scale + bounce, 2.5 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Happy eyebrow lines
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(cx - 4 * scale, cy - 25 * scale + bounce, cx - 2 * scale, cy - 23 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 7 * scale, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(cx + 4 * scale, cy - 25 * scale + bounce, cx + 2 * scale, cy - 23 * scale + bounce);
        ctx.stroke();

        // === STRIPED HAT ===
        // Hat brim
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 26 * scale + bounce, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat dome with stripes
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 30 * scale + bounce, 9 * scale, 6 * scale, 0, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - 30 * scale + bounce, 9 * scale, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - 9 * scale, cy - 36 * scale + bounce, 18 * scale, 6 * scale);

        // Hat top rounded
        ctx.beginPath();
        ctx.ellipse(cx, cy - 36 * scale + bounce, 9 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal stripes on hat
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1.5 * scale;
        for (let i = 0; i < 4; i++) {
          const stripeY = cy - 28 * scale - i * 2.5 * scale + bounce;
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale + i * scale, stripeY);
          ctx.lineTo(cx + 8 * scale - i * scale, stripeY);
          ctx.stroke();
        }

        // === FLOATING MUSICAL NOTES ===
        if (animated) {
          // Purple/magenta notes floating up and around
          ctx.font = `bold ${10 * scale}px serif`;
          for (let i = 0; i < 4; i++) {
            const notePhase = (t * 0.4 + i * 0.35) % 1.5;
            const angle = (i * Math.PI / 2) + t * 0.5;
            const radius = 16 * scale + notePhase * 10 * scale;
            const noteX = cx + Math.cos(angle) * radius;
            const noteY = cy - 10 * scale - notePhase * 12 * scale + bounce;

            ctx.fillStyle = `rgba(200, 100, 255, ${(1 - notePhase / 1.5) * 0.9})`;
            ctx.shadowColor = "#c864ff";
            ctx.shadowBlur = 4 * scale;
            ctx.globalAlpha = Math.max(0, 1 - notePhase / 1.5);
            ctx.fillText(["♪", "♫", "♩", "♬"][i % 4], noteX, noteY);
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "scott": {
        // F. SCOTT FITZGERALD - Writer with brown wavy hair, glasses, teal sweater, holding gold book
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const letterFloat = animated ? t * 0.5 : 0;

        // Teal/cyan literary aura with floating letters
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(30, 140, 130, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(20, 110, 100, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating letters/words in background - teal colored
        if (animated) {
          ctx.font = `${8 * scale}px serif`;
          const letters = ["G", "l", "o", "r", "y", "G", "r", "e", "a", "t", "B", "e", "a", "u", "t", "y", "S"];
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2 / 12) + letterFloat;
            const radius = 18 * scale + Math.sin(letterFloat + i) * 4 * scale;
            const letterX = cx + Math.cos(angle) * radius;
            const letterY = cy - 8 * scale + Math.sin(angle) * radius * 0.6;
            const alpha = 0.3 + Math.sin(letterFloat + i * 0.5) * 0.2;
            ctx.fillStyle = `rgba(80, 200, 180, ${alpha})`;
            ctx.fillText(letters[i % letters.length], letterX, letterY);
          }
        }

        // === TEAL SWEATER/JACKET BODY ===
        const sweaterGrad = ctx.createLinearGradient(cx - 14 * scale, cy, cx + 14 * scale, cy);
        sweaterGrad.addColorStop(0, "#0a4a4a");
        sweaterGrad.addColorStop(0.3, "#0d6060");
        sweaterGrad.addColorStop(0.5, "#108080");
        sweaterGrad.addColorStop(0.7, "#0d6060");
        sweaterGrad.addColorStop(1, "#0a4a4a");
        ctx.fillStyle = sweaterGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 16 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // White collar peeking out
        ctx.fillStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 12 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // === ARMS ===
        const holdingMotion = animated ? Math.sin(t * 1.5) * 0.05 : 0;

        // Left arm - holding book
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.3 + holdingMotion);

        // Teal sweater sleeve
        ctx.fillStyle = "#0d6060";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hand holding book
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 15 * scale, 3.5 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right arm - supporting book
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.3 - holdingMotion);

        // Teal sweater sleeve
        ctx.fillStyle = "#0d6060";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hand supporting book
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 15 * scale, 3.5 * scale, 4 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === TEAL/CYAN BOOK (held in front) ===
        ctx.save();
        ctx.translate(cx, cy + 4 * scale + bounce);

        // Book glow - cyan
        ctx.shadowColor = "#40c0c0";
        ctx.shadowBlur = 8 * scale;

        // Book cover - deep burgundy/maroon
        ctx.fillStyle = "#5a1a2a";
        ctx.beginPath();
        ctx.roundRect(-8 * scale, -6 * scale, 16 * scale, 14 * scale, 2 * scale);
        ctx.fill();

        // Cyan decorative border
        ctx.strokeStyle = "#30a0a0";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.roundRect(-7 * scale, -5 * scale, 14 * scale, 12 * scale, 1 * scale);
        ctx.stroke();

        // Cyan emblem/design on cover
        ctx.fillStyle = "#50d0d0";
        ctx.beginPath();
        ctx.moveTo(0, -3 * scale);
        ctx.lineTo(-3 * scale, 1 * scale);
        ctx.lineTo(0, 5 * scale);
        ctx.lineTo(3 * scale, 1 * scale);
        ctx.closePath();
        ctx.fill();

        // Teal lines decoration
        ctx.strokeStyle = "#208080";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(-5 * scale, -3 * scale);
        ctx.lineTo(-5 * scale, 5 * scale);
        ctx.moveTo(5 * scale, -3 * scale);
        ctx.lineTo(5 * scale, 5 * scale);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();

        // === HEAD ===
        // Face
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 18 * scale + bounce, 10 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wavy brown hair
        ctx.fillStyle = "#5a3a20";
        // Main hair mass
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 18 * scale + bounce);
        ctx.quadraticCurveTo(cx - 12 * scale, cy - 28 * scale + bounce, cx - 6 * scale, cy - 28 * scale + bounce);
        ctx.quadraticCurveTo(cx - 2 * scale, cy - 30 * scale + bounce, cx, cy - 28 * scale + bounce);
        ctx.quadraticCurveTo(cx + 2 * scale, cy - 30 * scale + bounce, cx + 6 * scale, cy - 28 * scale + bounce);
        ctx.quadraticCurveTo(cx + 12 * scale, cy - 28 * scale + bounce, cx + 10 * scale, cy - 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Hair waves/texture
        ctx.fillStyle = "#4a2a10";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 20 * scale + bounce);
        ctx.quadraticCurveTo(cx - 6 * scale, cy - 24 * scale + bounce, cx - 4 * scale, cy - 22 * scale + bounce);
        ctx.quadraticCurveTo(cx - 2 * scale, cy - 26 * scale + bounce, cx, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(cx + 2 * scale, cy - 28 * scale + bounce, cx + 4 * scale, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(cx + 6 * scale, cy - 26 * scale + bounce, cx + 8 * scale, cy - 22 * scale + bounce);
        ctx.stroke();

        // Side hair swoops
        ctx.fillStyle = "#5a3a20";
        ctx.beginPath();
        ctx.ellipse(cx - 9 * scale, cy - 18 * scale + bounce, 3 * scale, 5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 9 * scale, cy - 18 * scale + bounce, 3 * scale, 5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Round glasses
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1.5 * scale;
        // Left lens
        ctx.beginPath();
        ctx.arc(cx - 4.5 * scale, cy - 18 * scale + bounce, 4 * scale, 0, Math.PI * 2);
        ctx.stroke();
        // Right lens
        ctx.beginPath();
        ctx.arc(cx + 4.5 * scale, cy - 18 * scale + bounce, 4 * scale, 0, Math.PI * 2);
        ctx.stroke();
        // Bridge
        ctx.beginPath();
        ctx.moveTo(cx - 0.5 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 0.5 * scale, cy - 18 * scale + bounce);
        ctx.stroke();
        // Temple arms
        ctx.beginPath();
        ctx.moveTo(cx - 8.5 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy - 16 * scale + bounce);
        ctx.moveTo(cx + 8.5 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 16 * scale + bounce);
        ctx.stroke();

        // Eyes behind glasses
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.ellipse(cx - 4.5 * scale, cy - 18 * scale + bounce, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 4.5 * scale, cy - 18 * scale + bounce, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 3.5 * scale, cy - 19 * scale + bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 5.5 * scale, cy - 19 * scale + bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Thoughtful slight smile
        ctx.strokeStyle = "#8a6a4a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale + bounce, 2.5 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
      }
      case "captain": {
        // CAPTAIN - Ornate Red/Grey Knight with Sword, Red Plume, Gold Accents
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const plumeWave = animated ? Math.sin(t * 3) * 0.1 : 0;

        // Red/gold heroic aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(180, 50, 50, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.5, `rgba(150, 30, 30, ${auraPulse * 0.12})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === SWORD (behind body) ===
        ctx.save();
        ctx.translate(cx + 18 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.5);

        // Blade - silver with shine
        const bladeGrad = ctx.createLinearGradient(-2 * scale, 0, 2 * scale, 0);
        bladeGrad.addColorStop(0, "#8a9aaa");
        bladeGrad.addColorStop(0.5, "#d0e0f0");
        bladeGrad.addColorStop(1, "#8a9aaa");
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, -20 * scale);
        ctx.lineTo(0, -26 * scale);
        ctx.lineTo(1.5 * scale, -20 * scale);
        ctx.lineTo(1.5 * scale, 4 * scale);
        ctx.lineTo(-1.5 * scale, 4 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#6a7a8a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Ornate crossguard - silver with red gems
        ctx.fillStyle = "#a0a8b0";
        ctx.beginPath();
        ctx.roundRect(-6 * scale, 2 * scale, 12 * scale, 4 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c0c8d0";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Red gems on crossguard
        ctx.fillStyle = "#cc3333";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.arc(-4 * scale, 4 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(4 * scale, 4 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Handle - dark red leather
        ctx.fillStyle = "#6a2a1a";
        ctx.beginPath();
        ctx.roundRect(-2 * scale, 6 * scale, 4 * scale, 10 * scale, 1 * scale);
        ctx.fill();

        // Pommel - silver ball
        ctx.fillStyle = "#a0a8b0";
        ctx.beginPath();
        ctx.arc(0, 18 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === FLOWING RED CAPE (behind body) ===
        const capeWave = animated ? Math.sin(t * 2) * 0.08 : 0;
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);

        // Cape main body - flowing red fabric
        const capeGrad = ctx.createLinearGradient(-16 * scale, 0, 16 * scale, 24 * scale);
        capeGrad.addColorStop(0, "#cc2222");
        capeGrad.addColorStop(0.4, "#aa1111");
        capeGrad.addColorStop(0.7, "#881111");
        capeGrad.addColorStop(1, "#660808");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        // Left cape edge
        ctx.moveTo(-10 * scale, 0);
        ctx.quadraticCurveTo(-18 * scale + capeWave * 40, 12 * scale, -16 * scale + capeWave * 60, 28 * scale);
        ctx.quadraticCurveTo(-14 * scale + capeWave * 40, 32 * scale, -10 * scale + capeWave * 20, 30 * scale);
        // Bottom edge with waves
        ctx.quadraticCurveTo(-4 * scale, 34 * scale + capeWave * 20, 0, 32 * scale);
        ctx.quadraticCurveTo(4 * scale, 34 * scale - capeWave * 20, 10 * scale - capeWave * 20, 30 * scale);
        // Right cape edge
        ctx.quadraticCurveTo(14 * scale - capeWave * 40, 32 * scale, 16 * scale - capeWave * 60, 28 * scale);
        ctx.quadraticCurveTo(18 * scale - capeWave * 40, 12 * scale, 10 * scale, 0);
        ctx.closePath();
        ctx.fill();

        // Cape inner shadow/fold
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.moveTo(-4 * scale, 4 * scale);
        ctx.quadraticCurveTo(-8 * scale + capeWave * 30, 16 * scale, -6 * scale + capeWave * 30, 26 * scale);
        ctx.quadraticCurveTo(-2 * scale, 22 * scale, 0, 28 * scale);
        ctx.quadraticCurveTo(2 * scale, 22 * scale, 6 * scale - capeWave * 30, 26 * scale);
        ctx.quadraticCurveTo(8 * scale - capeWave * 30, 16 * scale, 4 * scale, 4 * scale);
        ctx.closePath();
        ctx.fill();

        // Cape clasp at shoulders
        ctx.fillStyle = "#c0c8d0";
        ctx.beginPath();
        ctx.arc(-8 * scale, 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(8 * scale, 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        ctx.restore();

        // === ORNATE ARMOR BODY ===
        // Main chest plate - grey with red trim
        const armorGrad = ctx.createLinearGradient(cx - 12 * scale, cy, cx + 12 * scale, cy);
        armorGrad.addColorStop(0, "#5a5a5a");
        armorGrad.addColorStop(0.3, "#7a7a7a");
        armorGrad.addColorStop(0.5, "#9a9a9a");
        armorGrad.addColorStop(0.7, "#7a7a7a");
        armorGrad.addColorStop(1, "#5a5a5a");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy + 16 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Red decorative chest panel
        ctx.fillStyle = "#bb2222";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx, cy + 14 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#c0c8d0";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Silver chest emblem
        ctx.fillStyle = "#b0b8c0";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy + 1 * scale + bounce);
        ctx.lineTo(cx, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy + 1 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Red gem in center
        ctx.fillStyle = "#ff4444";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy + 1 * scale + bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === ORNATE SHOULDER ARMOR ===
        // Left pauldron - large and decorative
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 6 * scale + bounce);

        // Main pauldron shape
        const leftPauldronGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
        leftPauldronGrad.addColorStop(0, "#9a9a9a");
        leftPauldronGrad.addColorStop(0.5, "#7a7a7a");
        leftPauldronGrad.addColorStop(1, "#5a5a5a");
        ctx.fillStyle = leftPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, 8 * scale, 7 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c0c8d0";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Red accent stripe
        ctx.fillStyle = "#bb2222";
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, 5 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Silver rivet center
        ctx.fillStyle = "#d0d8e0";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right pauldron
        ctx.save();
        ctx.translate(cx + 14 * scale, cy - 6 * scale + bounce);

        const rightPauldronGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
        rightPauldronGrad.addColorStop(0, "#9a9a9a");
        rightPauldronGrad.addColorStop(0.5, "#7a7a7a");
        rightPauldronGrad.addColorStop(1, "#5a5a5a");
        ctx.fillStyle = rightPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, 8 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c0c8d0";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        ctx.fillStyle = "#bb2222";
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, 5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#d0d8e0";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === ARMS ===
        const armSwing = animated ? Math.sin(t * 2) * 0.06 : 0;

        // Left arm
        ctx.save();
        ctx.translate(cx - 16 * scale, cy + 2 * scale + bounce);
        ctx.rotate(-0.25 + armSwing);

        // Grey armored sleeve
        ctx.fillStyle = "#6a6a6a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 4.5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Gauntlet - grey with silver trim
        ctx.fillStyle = "#7a7a7a";
        ctx.beginPath();
        ctx.ellipse(0, 15 * scale, 4 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a0a8b0";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(cx + 16 * scale, cy + 2 * scale + bounce);
        ctx.rotate(0.3 - armSwing);

        ctx.fillStyle = "#6a6a6a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 4.5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        ctx.fillStyle = "#7a7a7a";
        ctx.beginPath();
        ctx.ellipse(0, 15 * scale, 4 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a0a8b0";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        ctx.restore();

        // === ORNATE HELMET ===
        // Main helmet dome - grey
        const helmetGrad = ctx.createRadialGradient(cx, cy - 20 * scale + bounce, 0, cx, cy - 20 * scale + bounce, 12 * scale);
        helmetGrad.addColorStop(0, "#9a9a9a");
        helmetGrad.addColorStop(0.5, "#7a7a7a");
        helmetGrad.addColorStop(1, "#5a5a5a");
        ctx.fillStyle = helmetGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20 * scale + bounce, 11 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Red crest/ridge on top
        ctx.fillStyle = "#cc2222";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 28 * scale + bounce);
        ctx.lineTo(cx, cy - 32 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy - 28 * scale + bounce);
        ctx.lineTo(cx + 2 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx - 2 * scale, cy - 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Red plume flowing from top
        ctx.save();
        ctx.translate(cx, cy - 32 * scale + bounce);
        ctx.rotate(plumeWave);

        // Multiple plume feathers
        ctx.fillStyle = "#dd3333";
        ctx.beginPath();
        ctx.ellipse(0, -8 * scale, 3 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cc2222";
        ctx.beginPath();
        ctx.ellipse(-2 * scale, -6 * scale, 2 * scale, 8 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#bb1111";
        ctx.beginPath();
        ctx.ellipse(2 * scale, -6 * scale, 2 * scale, 8 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Face guard/visor - dark slit
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.roundRect(cx - 7 * scale, cy - 22 * scale + bounce, 14 * scale, 5 * scale, 1 * scale);
        ctx.fill();

        // Silver trim around visor
        ctx.strokeStyle = "#c0c8d0";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.roundRect(cx - 8 * scale, cy - 23 * scale + bounce, 16 * scale, 7 * scale, 2 * scale);
        ctx.stroke();

        // Menacing eye glow
        ctx.fillStyle = `rgba(220, 50, 50, ${0.7 + Math.sin(t * 3) * 0.3})`;
        ctx.shadowColor = "#ff3333";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.ellipse(cx - 3.5 * scale, cy - 20 * scale + bounce, 2 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 3.5 * scale, cy - 20 * scale + bounce, 2 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Chin guard
        ctx.fillStyle = "#7a7a7a";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 16 * scale + bounce);
        ctx.lineTo(cx - 7 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 7 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 16 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5a5a5a";
        ctx.stroke();

        // Small flag/banner behind (optional decorative)
        ctx.fillStyle = "#cc2222";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy - 14 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy - 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#990000";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        break;
      }
      case "engineer": {
        // ENGINEER - Tech Specialist with Goggles/Visor, Yellow Hard Hat, Green Fatigues, Electric Sparks
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const sparkFlash = animated ? Math.random() > 0.7 : false;
        const electricPulse = 0.5 + Math.sin(t * 5) * 0.5;

        // Electric blue tech aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(50, 150, 220, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(30, 120, 200, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === ELECTRIC SPARKS (behind body) ===
        if (animated) {
          // Left side sparks
          ctx.strokeStyle = `rgba(100, 200, 255, ${electricPulse})`;
          ctx.shadowColor = "#66ccff";
          ctx.shadowBlur = 6 * scale;
          ctx.lineWidth = 1.5 * scale;

          for (let i = 0; i < 3; i++) {
            const sparkX = cx - 16 * scale + Math.random() * 4 * scale;
            const sparkY = cy - 4 * scale + i * 8 * scale + bounce;
            if (Math.random() > 0.5) {
              ctx.beginPath();
              ctx.moveTo(sparkX, sparkY);
              ctx.lineTo(sparkX - 4 * scale, sparkY - 2 * scale);
              ctx.lineTo(sparkX - 2 * scale, sparkY - 4 * scale);
              ctx.lineTo(sparkX - 6 * scale, sparkY - 6 * scale);
              ctx.stroke();
            }
          }

          // Right side sparks
          for (let i = 0; i < 3; i++) {
            const sparkX = cx + 16 * scale + Math.random() * 4 * scale;
            const sparkY = cy - 4 * scale + i * 8 * scale + bounce;
            if (Math.random() > 0.5) {
              ctx.beginPath();
              ctx.moveTo(sparkX, sparkY);
              ctx.lineTo(sparkX + 4 * scale, sparkY - 2 * scale);
              ctx.lineTo(sparkX + 2 * scale, sparkY - 4 * scale);
              ctx.lineTo(sparkX + 6 * scale, sparkY - 6 * scale);
              ctx.stroke();
            }
          }
          ctx.shadowBlur = 0;
        }

        // === MAIN BODY - Green Military Fatigues ===
        // Green fatigue jacket
        const fatigueGrad = ctx.createLinearGradient(cx - 12 * scale, cy, cx + 12 * scale, cy);
        fatigueGrad.addColorStop(0, "#3a5a3a");
        fatigueGrad.addColorStop(0.3, "#4a6a4a");
        fatigueGrad.addColorStop(0.5, "#5a7a5a");
        fatigueGrad.addColorStop(0.7, "#4a6a4a");
        fatigueGrad.addColorStop(1, "#3a5a3a");
        ctx.fillStyle = fatigueGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 16 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Chest pockets on fatigues
        ctx.fillStyle = "#3a5030";
        ctx.beginPath();
        ctx.roundRect(cx - 9 * scale, cy - 4 * scale + bounce, 6 * scale, 5 * scale, 1 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx + 3 * scale, cy - 4 * scale + bounce, 6 * scale, 5 * scale, 1 * scale);
        ctx.fill();

        // Pocket flaps
        ctx.strokeStyle = "#2a4020";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy - 4 * scale + bounce);
        ctx.moveTo(cx + 3 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 9 * scale, cy - 4 * scale + bounce);
        ctx.stroke();

        // Tech display on chest (like a tablet/screen)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.roundRect(cx - 3 * scale, cy + 2 * scale + bounce, 6 * scale, 5 * scale, 1 * scale);
        ctx.fill();

        // Screen with display
        ctx.fillStyle = `rgba(50, 200, 150, ${0.7 + electricPulse * 0.3})`;
        ctx.shadowColor = "#32c896";
        ctx.shadowBlur = 3 * scale;
        ctx.fillRect(cx - 2.5 * scale, cy + 2.5 * scale + bounce, 5 * scale, 3.5 * scale);
        ctx.shadowBlur = 0;

        // Display lines
        ctx.strokeStyle = "#1a4a3a";
        ctx.lineWidth = 0.5 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 2 * scale, cy + 3 * scale + i * 1 * scale + bounce);
          ctx.lineTo(cx + 2 * scale, cy + 3 * scale + i * 1 * scale + bounce);
          ctx.stroke();
        }

        // Utility belt
        ctx.fillStyle = "#5a5030";
        ctx.fillRect(cx - 11 * scale, cy + 8 * scale + bounce, 22 * scale, 4 * scale);
        ctx.strokeStyle = "#4a4020";
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(cx - 11 * scale, cy + 8 * scale + bounce, 22 * scale, 4 * scale);

        // Tools/pouches on belt
        ctx.fillStyle = "#4a4a30";
        ctx.beginPath();
        ctx.roundRect(cx - 9 * scale, cy + 9 * scale + bounce, 4 * scale, 5 * scale, 1 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx + 5 * scale, cy + 9 * scale + bounce, 4 * scale, 5 * scale, 1 * scale);
        ctx.fill();

        // === ARMS WITH ELECTRICAL TOOLS ===
        const workMotion = animated ? Math.sin(t * 2.5) * 0.1 : 0;

        // Left arm - holding some kind of device
        ctx.save();
        ctx.translate(cx - 13 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.5 + workMotion);

        // Green fatigue sleeve
        ctx.fillStyle = "#4a6a4a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rolled up cuff
        ctx.fillStyle = "#5a7a5a";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 4.5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Work glove
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 4 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Electric spark from hand
        if (sparkFlash) {
          ctx.strokeStyle = "#66ccff";
          ctx.shadowColor = "#66ccff";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-2 * scale, 20 * scale);
          ctx.lineTo(-4 * scale, 24 * scale);
          ctx.lineTo(-1 * scale, 22 * scale);
          ctx.lineTo(-3 * scale, 28 * scale);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // Right arm - with tool/wrench
        ctx.save();
        ctx.translate(cx + 13 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.5 - workMotion);

        // Green fatigue sleeve
        ctx.fillStyle = "#4a6a4a";
        ctx.beginPath();
        ctx.ellipse(0, 6 * scale, 5 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rolled up cuff
        ctx.fillStyle = "#5a7a5a";
        ctx.beginPath();
        ctx.ellipse(0, 12 * scale, 4.5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Work glove gripping tool
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 4 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Wrench/tool in hand
        ctx.fillStyle = "#6a6a7a";
        ctx.beginPath();
        ctx.roundRect(-1.5 * scale, 18 * scale, 3 * scale, 12 * scale, 1 * scale);
        ctx.fill();
        // Wrench head
        ctx.beginPath();
        ctx.roundRect(-3 * scale, 28 * scale, 6 * scale, 3 * scale, 1 * scale);
        ctx.fill();

        // Electric spark from tool
        if (sparkFlash) {
          ctx.strokeStyle = "#66ccff";
          ctx.shadowColor = "#66ccff";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(2 * scale, 30 * scale);
          ctx.lineTo(5 * scale, 32 * scale);
          ctx.lineTo(3 * scale, 34 * scale);
          ctx.lineTo(6 * scale, 38 * scale);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // === HEAD WITH GOGGLES/VISOR ===
        // Face
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 16 * scale + bounce, 9 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tech visor/goggles - wide band across eyes
        const visorGrad = ctx.createLinearGradient(cx - 10 * scale, cy - 18 * scale, cx + 10 * scale, cy - 18 * scale);
        visorGrad.addColorStop(0, "#2a4a5a");
        visorGrad.addColorStop(0.5, "#3a6a8a");
        visorGrad.addColorStop(1, "#2a4a5a");
        ctx.fillStyle = visorGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 10 * scale, cy - 20 * scale + bounce, 20 * scale, 6 * scale, 2 * scale);
        ctx.fill();
        ctx.strokeStyle = "#1a2a3a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Glowing visor lens
        ctx.fillStyle = `rgba(100, 200, 255, ${0.6 + electricPulse * 0.4})`;
        ctx.shadowColor = "#66ccff";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.roundRect(cx - 8 * scale, cy - 19 * scale + bounce, 16 * scale, 4 * scale, 1 * scale);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Visor reflection line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 18 * scale + bounce);
        ctx.stroke();

        // Small confident smile
        ctx.strokeStyle = "#8a6a4a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale + bounce, 2 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // === YELLOW HARD HAT ===
        // Main hat dome
        const hatGrad = ctx.createRadialGradient(cx, cy - 24 * scale + bounce, 0, cx, cy - 24 * scale + bounce, 12 * scale);
        hatGrad.addColorStop(0, "#ffd700");
        hatGrad.addColorStop(0.5, "#e6b800");
        hatGrad.addColorStop(1, "#cc9900");
        ctx.fillStyle = hatGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 24 * scale + bounce, 10 * scale, Math.PI, 0);
        ctx.fill();

        // Hat brim
        ctx.fillStyle = "#d4a500";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 22 * scale + bounce, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ridge on top of hat
        ctx.fillStyle = "#e6c000";
        ctx.beginPath();
        ctx.roundRect(cx - 8 * scale, cy - 30 * scale + bounce, 16 * scale, 3 * scale, 1 * scale);
        ctx.fill();

        // Hat ventilation holes (decorative)
        ctx.fillStyle = "#b89500";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, cy - 26 * scale + bounce, 2 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy - 26 * scale + bounce, 2 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat lamp/light
        ctx.fillStyle = animated ? `rgba(255, 255, 200, ${0.6 + Math.sin(t * 3) * 0.3})` : "#fff";
        ctx.shadowColor = "#ffff88";
        ctx.shadowBlur = animated ? 8 * scale : 0;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 32 * scale + bounce, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Lamp housing
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.roundRect(cx - 2 * scale, cy - 31 * scale + bounce, 4 * scale, 3 * scale, 1 * scale);
        ctx.fill();
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
  | "shadow_knight"
  // New enemy types
  | "cultist"
  | "plaguebearer"
  | "thornwalker"
  | "sandworm"
  | "frostling"
  | "infernal"
  | "banshee"
  | "juggernaut"
  | "assassin"
  | "dragon"
  // Region-specific common troops - Forest
  | "freshman"
  | "athlete"
  | "protestor"
  // Region-specific common troops - Swamp
  | "bog_creature"
  | "will_o_wisp"
  | "swamp_troll"
  // Region-specific common troops - Desert
  | "nomad"
  | "scorpion"
  | "scarab"
  // Region-specific common troops - Winter
  | "snow_goblin"
  | "yeti"
  | "ice_witch"
  // Region-specific common troops - Volcanic
  | "magma_spawn"
  | "fire_imp"
  | "ember_guard";
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
      case "cultist": {
        // FINALS WEEK CULTIST - Sleep-deprived zealot with dark ritual energy
        const cultPulse = 0.5 + Math.sin(t * 2.5) * 0.3;
        const candleFlicker = Math.sin(t * 8) * 0.2;

        // Dark ritual aura
        const auraGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 14 * scale);
        auraGrad.addColorStop(0, `rgba(124, 45, 18, ${cultPulse * 0.3})`);
        auraGrad.addColorStop(0.6, `rgba(100, 30, 10, ${cultPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tattered brown robes
        const robeGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy);
        robeGrad.addColorStop(0, "#3d1a0a");
        robeGrad.addColorStop(0.5, "#7c2d12");
        robeGrad.addColorStop(1, "#3d1a0a");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(cx - 10 * scale, cy - bounce, cx - 5 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(cx + 10 * scale, cy - bounce, cx + 8 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Hood
        ctx.fillStyle = "#2a1508";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 * scale - bounce, 7 * scale, 5 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Shadowed face
        ctx.fillStyle = "#d4c4b0";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tired dark-circled eyes
        ctx.fillStyle = "#1a0a05";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 13 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 13 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Red exhausted glow
        ctx.fillStyle = `rgba(239, 68, 68, ${cultPulse})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 13 * scale - bounce, 0.6 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 13 * scale - bounce, 0.6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Coffee cup/candle in hand
        ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + candleFlicker})`;
        ctx.beginPath();
        ctx.arc(cx + 9 * scale, cy - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#854d0e";
        ctx.fillRect(cx + 7 * scale, cy + 2 * scale - bounce, 4 * scale, 6 * scale);
        break;
      }
      case "plaguebearer": {
        // FLU SEASON CARRIER - Sickly figure spreading disease
        const sickPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const coughOffset = animated ? Math.random() * 0.5 : 0;

        // Toxic green aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16 * scale);
        auraGrad.addColorStop(0, `rgba(101, 163, 13, ${sickPulse * 0.25})`);
        auraGrad.addColorStop(0.7, `rgba(77, 124, 15, ${sickPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Sickly green particles
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const angle = t * 0.8 + i * Math.PI * 0.4;
            const dist = 8 * scale + Math.sin(t + i) * 3 * scale;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist * 0.5 - bounce;
            ctx.fillStyle = `rgba(163, 230, 53, ${0.4 + Math.sin(t * 2 + i) * 0.2})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Hunched body in dirty rags
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 13 * scale - bounce);
        ctx.quadraticCurveTo(cx - 10 * scale, cy + 2 * scale - bounce, cx - 4 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx + 10 * scale, cy + 2 * scale - bounce, cx + 9 * scale, cy + 13 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Sickly pale head
        ctx.fillStyle = "#c4e0a4";
        ctx.beginPath();
        ctx.arc(cx + coughOffset * scale, cy - 10 * scale - bounce, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Green spots
        ctx.fillStyle = "#84cc16";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 8 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 12 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tired sick eyes
        ctx.fillStyle = "#365314";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 11 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 11 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tissue box
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx + 7 * scale, cy + 2 * scale - bounce, 5 * scale, 4 * scale);
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(cx + 7.5 * scale, cy + 2.5 * scale - bounce, 4 * scale, 1 * scale);
        break;
      }
      case "thornwalker": {
        // IVY OVERGROWTH - Living vegetation monster
        const vineSway = Math.sin(t * 1.5) * 2;
        const thornPulse = 0.6 + Math.sin(t * 3) * 0.2;

        // Dark green nature aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 * scale);
        auraGrad.addColorStop(0, `rgba(22, 101, 52, ${thornPulse * 0.2})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Twisted vine body
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale + vineSway * 0.3 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(cx - 12 * scale, cy - bounce, cx - 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 12 * scale, cy - bounce, cx + 8 * scale - vineSway * 0.3 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Vine tendrils
        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 3; i++) {
          const angle = -Math.PI / 4 + i * Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * 4 * scale, cy - 5 * scale - bounce);
          ctx.quadraticCurveTo(
            cx + Math.cos(angle) * 10 * scale + vineSway * 0.5 * scale,
            cy - 8 * scale - bounce,
            cx + Math.cos(angle) * 12 * scale + vineSway * scale,
            cy - 4 * scale - bounce
          );
          ctx.stroke();
        }

        // Thorns
        ctx.fillStyle = "#7c2d12";
        for (let i = 0; i < 6; i++) {
          const tx = cx - 6 * scale + i * 2.5 * scale;
          const ty = cy - 2 * scale + Math.sin(i * 1.5) * 3 * scale - bounce;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - 1 * scale, ty + 2 * scale);
          ctx.lineTo(tx + 1 * scale, ty + 2 * scale);
          ctx.closePath();
          ctx.fill();
        }

        // Flower head (corrupted)
        ctx.fillStyle = "#14532d";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eye in center
        ctx.fillStyle = `rgba(239, 68, 68, ${thornPulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fca5a5";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "sandworm": {
        // THESIS DEVOURER - Massive burrowing creature
        const wormUndulate = Math.sin(t * 2) * 3;
        const mawPulse = 0.7 + Math.sin(t * 4) * 0.3;

        // Sandy dust cloud
        const dustGrad = ctx.createRadialGradient(cx, cy + 8 * scale, 0, cx, cy + 8 * scale, 18 * scale);
        dustGrad.addColorStop(0, `rgba(161, 98, 7, ${mawPulse * 0.3})`);
        dustGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8 * scale - bounce, 18 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Segmented worm body emerging
        for (let i = 3; i >= 0; i--) {
          const segY = cy + (4 - i) * 6 * scale - bounce + wormUndulate * (i * 0.2);
          const segSize = (8 - i * 0.8) * scale;
          ctx.fillStyle = i % 2 === 0 ? "#a16207" : "#854d0e";
          ctx.beginPath();
          ctx.ellipse(cx + wormUndulate * (0.3 - i * 0.1) * scale, segY, segSize, segSize * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Head/maw
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale - bounce + wormUndulate * 0.5, 10 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Open maw with teeth
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8 * scale - bounce + wormUndulate * 0.5, 7 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Teeth ring
        ctx.fillStyle = "#fef3c7";
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const tx = cx + Math.cos(angle) * 5 * scale;
          const ty = cy - 8 * scale - bounce + wormUndulate * 0.5 + Math.sin(angle) * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(angle) * 2 * scale, ty + Math.sin(angle) * 1.5 * scale);
          ctx.lineTo(tx + Math.cos(angle + 0.3) * 0.5 * scale, ty + Math.sin(angle + 0.3) * 0.5 * scale);
          ctx.closePath();
          ctx.fill();
        }

        // Inner glow
        ctx.fillStyle = `rgba(239, 68, 68, ${mawPulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale - bounce + wormUndulate * 0.5, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "frostling": {
        // WINTER BREAK GHOST - Ethereal ice spirit
        const frostFloat = Math.sin(t * 2) * 4;
        const shimmer = 0.6 + Math.sin(t * 5) * 0.3;

        // Icy ethereal glow
        const frostGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 16 * scale);
        frostGrad.addColorStop(0, `rgba(125, 211, 252, ${shimmer * 0.4})`);
        frostGrad.addColorStop(0.5, `rgba(186, 230, 253, ${shimmer * 0.2})`);
        frostGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = frostGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce - frostFloat, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating ice particles
        if (animated) {
          for (let i = 0; i < 6; i++) {
            const angle = t * 1.2 + i * Math.PI / 3;
            const dist = 10 * scale + Math.sin(t * 2 + i) * 2 * scale;
            const px = cx + Math.cos(angle) * dist;
            const py = cy - 4 * scale + Math.sin(angle) * dist * 0.4 - bounce - frostFloat;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(t * 3 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(px, py, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Ghostly body
        const bodyGrad = ctx.createLinearGradient(cx, cy - 15 * scale, cx, cy + 10 * scale);
        bodyGrad.addColorStop(0, "rgba(186, 230, 253, 0.9)");
        bodyGrad.addColorStop(0.5, "rgba(125, 211, 252, 0.7)");
        bodyGrad.addColorStop(1, "rgba(125, 211, 252, 0)");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 10 * scale - bounce - frostFloat);
        ctx.quadraticCurveTo(cx - 10 * scale, cy - bounce - frostFloat, cx - 6 * scale, cy - 12 * scale - bounce - frostFloat);
        ctx.quadraticCurveTo(cx, cy - 18 * scale - bounce - frostFloat, cx + 6 * scale, cy - 12 * scale - bounce - frostFloat);
        ctx.quadraticCurveTo(cx + 10 * scale, cy - bounce - frostFloat, cx + 8 * scale, cy + 10 * scale - bounce - frostFloat);
        ctx.closePath();
        ctx.fill();

        // Face area
        ctx.fillStyle = "rgba(240, 249, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale - bounce - frostFloat, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing cyan eyes
        ctx.fillStyle = `rgba(34, 211, 238, ${shimmer})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 11 * scale - bounce - frostFloat, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 11 * scale - bounce - frostFloat, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 11 * scale - bounce - frostFloat, 0.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 11 * scale - bounce - frostFloat, 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "infernal": {
        // BURNOUT DEMON - Fire elemental of overwork
        const flamePulse = 0.6 + Math.sin(t * 4) * 0.4;
        const flameWaver = Math.sin(t * 6) * 2;

        // Intense fire aura
        const fireGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 18 * scale);
        fireGrad.addColorStop(0, `rgba(220, 38, 38, ${flamePulse * 0.4})`);
        fireGrad.addColorStop(0.4, `rgba(251, 146, 60, ${flamePulse * 0.25})`);
        fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Flame particles
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const angle = t * 2 + i * Math.PI / 4;
            const dist = 6 * scale + Math.sin(t * 3 + i) * 4 * scale;
            const px = cx + Math.cos(angle) * dist * 0.8;
            const py = cy - 6 * scale + Math.sin(angle) * dist * 0.3 - bounce - Math.abs(Math.sin(t * 4 + i)) * 4 * scale;
            ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + Math.sin(t * 5 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Demonic body (dark core)
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 11 * scale, cy - bounce, cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 11 * scale, cy - bounce, cx + 9 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Flame edges
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 9 * scale + flameWaver * 0.5 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx - 2 * scale + flameWaver * 0.3 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale - flameWaver * 0.4 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 7 * scale, cy - 8 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Burning eyes
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 5 * scale - bounce, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 5 * scale - bounce, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 5 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 5 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "banshee": {
        // GRADE WAILING SPIRIT - Ghostly screaming figure
        const wailFloat = Math.sin(t * 2.5) * 5;
        const screamPulse = 0.5 + Math.sin(t * 6) * 0.3;

        // Ethereal white glow
        const spiritGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 18 * scale);
        spiritGrad.addColorStop(0, `rgba(226, 232, 240, ${screamPulse * 0.5})`);
        spiritGrad.addColorStop(0.5, `rgba(203, 213, 225, ${screamPulse * 0.25})`);
        spiritGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = spiritGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce - wailFloat, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Sound wave rings
        if (animated) {
          for (let i = 0; i < 3; i++) {
            const ringRadius = (8 + i * 4 + (t * 2 % 4)) * scale;
            const ringAlpha = 0.3 - i * 0.1 - (t * 0.5 % 1) * 0.1;
            if (ringAlpha > 0) {
              ctx.strokeStyle = `rgba(148, 163, 184, ${ringAlpha})`;
              ctx.lineWidth = 1 * scale;
              ctx.beginPath();
              ctx.arc(cx, cy - 8 * scale - bounce - wailFloat, ringRadius, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }

        // Flowing ghostly form
        const ghostGrad = ctx.createLinearGradient(cx, cy - 18 * scale, cx, cy + 12 * scale);
        ghostGrad.addColorStop(0, "rgba(241, 245, 249, 0.95)");
        ghostGrad.addColorStop(0.6, "rgba(226, 232, 240, 0.7)");
        ghostGrad.addColorStop(1, "rgba(226, 232, 240, 0)");
        ctx.fillStyle = ghostGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 12 * scale - bounce - wailFloat);
        ctx.quadraticCurveTo(cx - 12 * scale, cy - 2 * scale - bounce - wailFloat, cx - 6 * scale, cy - 14 * scale - bounce - wailFloat);
        ctx.quadraticCurveTo(cx, cy - 20 * scale - bounce - wailFloat, cx + 6 * scale, cy - 14 * scale - bounce - wailFloat);
        ctx.quadraticCurveTo(cx + 12 * scale, cy - 2 * scale - bounce - wailFloat, cx + 10 * scale, cy + 12 * scale - bounce - wailFloat);
        ctx.closePath();
        ctx.fill();

        // Wailing face
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale - bounce - wailFloat, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hollow eyes
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 11 * scale - bounce - wailFloat, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 11 * scale - bounce - wailFloat, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Screaming mouth
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 7 * scale - bounce - wailFloat, 2.5 * scale, 3.5 * scale + screamPulse * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "juggernaut": {
        // ENDOWED CHAIR - Massive armored academic authority
        const heavyStep = Math.sin(t * 1.5) * 1;
        const powerGlow = 0.5 + Math.sin(t * 2) * 0.3;

        // Authority aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 * scale);
        auraGrad.addColorStop(0, `rgba(68, 64, 60, ${powerGlow * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(120, 113, 108, ${powerGlow * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + heavyStep, 20 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Massive armored body
        const armorGrad = ctx.createLinearGradient(cx - 12 * scale, cy, cx + 12 * scale, cy);
        armorGrad.addColorStop(0, "#1c1917");
        armorGrad.addColorStop(0.3, "#44403c");
        armorGrad.addColorStop(0.5, "#57534e");
        armorGrad.addColorStop(0.7, "#44403c");
        armorGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 14 * scale - bounce + heavyStep);
        ctx.lineTo(cx - 14 * scale, cy - 2 * scale - bounce + heavyStep);
        ctx.lineTo(cx - 10 * scale, cy - 12 * scale - bounce + heavyStep);
        ctx.lineTo(cx + 10 * scale, cy - 12 * scale - bounce + heavyStep);
        ctx.lineTo(cx + 14 * scale, cy - 2 * scale - bounce + heavyStep);
        ctx.lineTo(cx + 12 * scale, cy + 14 * scale - bounce + heavyStep);
        ctx.closePath();
        ctx.fill();

        // Gold trim
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy - bounce + heavyStep);
        ctx.lineTo(cx + 12 * scale, cy - bounce + heavyStep);
        ctx.stroke();

        // Massive helmet
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce + heavyStep, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Golden crown on helmet
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 20 * scale - bounce + heavyStep);
        ctx.lineTo(cx - 4 * scale, cy - 23 * scale - bounce + heavyStep);
        ctx.lineTo(cx - 2 * scale, cy - 20 * scale - bounce + heavyStep);
        ctx.lineTo(cx, cy - 24 * scale - bounce + heavyStep);
        ctx.lineTo(cx + 2 * scale, cy - 20 * scale - bounce + heavyStep);
        ctx.lineTo(cx + 4 * scale, cy - 23 * scale - bounce + heavyStep);
        ctx.lineTo(cx + 6 * scale, cy - 20 * scale - bounce + heavyStep);
        ctx.closePath();
        ctx.fill();

        // Glowing visor
        ctx.fillStyle = "#0f0f0f";
        ctx.fillRect(cx - 5 * scale, cy - 15 * scale - bounce + heavyStep, 10 * scale, 3 * scale);
        ctx.fillStyle = `rgba(251, 191, 36, ${powerGlow})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce + heavyStep, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce + heavyStep, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Giant hammer
        ctx.fillStyle = "#78716c";
        ctx.fillRect(cx + 10 * scale, cy - 10 * scale - bounce + heavyStep, 3 * scale, 20 * scale);
        ctx.fillStyle = "#44403c";
        ctx.fillRect(cx + 6 * scale, cy - 14 * scale - bounce + heavyStep, 10 * scale, 6 * scale);
        break;
      }
      case "assassin": {
        // CURVE WRECKER - Lightning fast shadowy figure
        const dashBlur = animated ? Math.sin(t * 8) * 3 : 0;
        const stealthPulse = 0.4 + Math.sin(t * 4) * 0.2;

        // Speed blur trail
        if (animated) {
          for (let i = 1; i <= 3; i++) {
            ctx.fillStyle = `rgba(30, 27, 75, ${0.15 - i * 0.04})`;
            ctx.beginPath();
            ctx.ellipse(cx - i * 4 * scale, cy - bounce, 6 * scale, 10 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Dark shadow aura
        const shadowGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 12 * scale);
        shadowGrad.addColorStop(0, `rgba(30, 27, 75, ${stealthPulse * 0.4})`);
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(cx + dashBlur * 0.3 * scale, cy - 2 * scale - bounce, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Sleek dark body
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale + dashBlur * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 8 * scale, cy - bounce, cx - 4 * scale, cy - 12 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 12 * scale - bounce);
        ctx.quadraticCurveTo(cx + 8 * scale, cy - bounce, cx + 6 * scale - dashBlur * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Hood
        ctx.fillStyle = "#0f0a1a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 12 * scale - bounce, 5 * scale, 4 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Shadowed face
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing purple eyes
        ctx.fillStyle = `rgba(167, 139, 250, ${0.6 + stealthPulse})`;
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale, cy - 15 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy - 15 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dual daggers
        ctx.fillStyle = "#6366f1";
        ctx.save();
        ctx.translate(cx - 8 * scale, cy - bounce);
        ctx.rotate(-0.5);
        ctx.fillRect(-1 * scale, -6 * scale, 2 * scale, 8 * scale);
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 8 * scale, cy - bounce);
        ctx.rotate(0.5);
        ctx.fillRect(-1 * scale, -6 * scale, 2 * scale, 8 * scale);
        ctx.restore();
        break;
      }
      case "dragon": {
        // ANCIENT ALUMNUS - Massive flying dragon
        const wingFlap = Math.sin(t * 3) * 8;
        const fireBreath = 0.6 + Math.sin(t * 4) * 0.4;
        const dragonFloat = Math.sin(t * 1.5) * 3;

        // Massive fire aura
        const dragonGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 22 * scale);
        dragonGrad.addColorStop(0, `rgba(159, 18, 57, ${fireBreath * 0.35})`);
        dragonGrad.addColorStop(0.5, `rgba(225, 29, 72, ${fireBreath * 0.2})`);
        dragonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = dragonGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce - dragonFloat, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = "#881337";
        // Left wing
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 4 * scale - bounce - dragonFloat);
        ctx.quadraticCurveTo(
          cx - 18 * scale,
          cy - 12 * scale - bounce - dragonFloat - wingFlap,
          cx - 20 * scale,
          cy + 2 * scale - bounce - dragonFloat - wingFlap * 0.5
        );
        ctx.quadraticCurveTo(cx - 12 * scale, cy + 4 * scale - bounce - dragonFloat, cx - 6 * scale, cy + 2 * scale - bounce - dragonFloat);
        ctx.closePath();
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 4 * scale - bounce - dragonFloat);
        ctx.quadraticCurveTo(
          cx + 18 * scale,
          cy - 12 * scale - bounce - dragonFloat - wingFlap,
          cx + 20 * scale,
          cy + 2 * scale - bounce - dragonFloat - wingFlap * 0.5
        );
        ctx.quadraticCurveTo(cx + 12 * scale, cy + 4 * scale - bounce - dragonFloat, cx + 6 * scale, cy + 2 * scale - bounce - dragonFloat);
        ctx.closePath();
        ctx.fill();

        // Dragon body
        const bodyGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy);
        bodyGrad.addColorStop(0, "#4c0519");
        bodyGrad.addColorStop(0.5, "#9f1239");
        bodyGrad.addColorStop(1, "#4c0519");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - bounce - dragonFloat, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Scales pattern
        ctx.fillStyle = "#be123c";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy - 4 * scale + i * 4 * scale - bounce - dragonFloat, 3 * scale, 0, Math.PI);
          ctx.fill();
        }

        // Head
        ctx.fillStyle = "#9f1239";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale - bounce - dragonFloat, 6 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 16 * scale - bounce - dragonFloat);
        ctx.lineTo(cx - 7 * scale, cy - 22 * scale - bounce - dragonFloat);
        ctx.lineTo(cx - 3 * scale, cy - 17 * scale - bounce - dragonFloat);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 16 * scale - bounce - dragonFloat);
        ctx.lineTo(cx + 7 * scale, cy - 22 * scale - bounce - dragonFloat);
        ctx.lineTo(cx + 3 * scale, cy - 17 * scale - bounce - dragonFloat);
        ctx.fill();

        // Glowing eyes
        ctx.fillStyle = `rgba(251, 191, 36, ${fireBreath})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce - dragonFloat, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce - dragonFloat, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce - dragonFloat, 0.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce - dragonFloat, 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Fire breath particles
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const fx = cx + (Math.random() - 0.5) * 6 * scale;
            const fy = cy - 10 * scale - bounce - dragonFloat - i * 2 * scale;
            ctx.fillStyle = `rgba(251, 191, 36, ${0.6 - i * 0.15})`;
            ctx.beginPath();
            ctx.arc(fx, fy, (2 - i * 0.3) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case "freshman": {
        // LOST FRESHMAN - Confused wandering student
        const confusedSway = Math.sin(t * 2) * 2;
        const blinkRate = Math.sin(t * 5) > 0.9 ? 0.2 : 1;

        // Slight confusion aura
        const confuseGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 12 * scale);
        confuseGrad.addColorStop(0, "rgba(134, 239, 172, 0.15)");
        confuseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = confuseGrad;
        ctx.beginPath();
        ctx.arc(cx + confusedSway * 0.3 * scale, cy - 2 * scale - bounce, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Simple student body - green shirt
        ctx.fillStyle = "#86efac";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale + confusedSway * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 8 * scale, cy - bounce, cx - 5 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx + 8 * scale, cy - bounce, cx + 7 * scale - confusedSway * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#fcd9b6";
        ctx.beginPath();
        ctx.arc(cx + confusedSway * 0.15 * scale, cy - 12 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Messy hair
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 15 * scale - bounce);
        ctx.quadraticCurveTo(cx - 5 * scale, cy - 19 * scale - bounce, cx - 2 * scale, cy - 18 * scale - bounce);
        ctx.quadraticCurveTo(cx + 1 * scale, cy - 20 * scale - bounce, cx + 3 * scale, cy - 18 * scale - bounce);
        ctx.quadraticCurveTo(cx + 5 * scale, cy - 19 * scale - bounce, cx + 4 * scale, cy - 15 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Wide confused eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 13 * scale - bounce, 1.5 * scale, 2 * scale * blinkRate, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 13 * scale - bounce, 1.5 * scale, 2 * scale * blinkRate, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 13 * scale - bounce, 0.7 * scale * blinkRate, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 13 * scale - bounce, 0.7 * scale * blinkRate, 0, Math.PI * 2);
        ctx.fill();

        // Question mark above head
        ctx.fillStyle = "#22c55e";
        ctx.font = `bold ${6 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("?", cx + confusedSway * 0.5 * scale, cy - 20 * scale - bounce);

        // Backpack
        ctx.fillStyle = "#15803d";
        ctx.fillRect(cx - 6 * scale, cy - 4 * scale - bounce, 4 * scale, 8 * scale);
        break;
      }
      case "athlete": {
        // VARSITY RUNNER - Fast athletic figure
        const runCycle = Math.sin(t * 6) * 3;
        const armSwing = Math.sin(t * 6) * 15;

        // Speed lines
        if (animated) {
          ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
          ctx.lineWidth = 1 * scale;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 10 * scale - i * 4 * scale, cy - 2 * scale + i * 2 * scale - bounce);
            ctx.lineTo(cx - 14 * scale - i * 4 * scale, cy - 2 * scale + i * 2 * scale - bounce);
            ctx.stroke();
          }
        }

        // Athletic body - orange jersey
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 10 * scale - bounce + runCycle * 0.3);
        ctx.quadraticCurveTo(cx - 7 * scale, cy - bounce, cx - 4 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx + 7 * scale, cy - bounce, cx + 6 * scale, cy + 10 * scale - bounce - runCycle * 0.3);
        ctx.closePath();
        ctx.fill();

        // Jersey number
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${5 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("1", cx, cy + 2 * scale - bounce);

        // Running legs
        ctx.fillStyle = "#fcd9b6";
        ctx.save();
        ctx.translate(cx - 2 * scale, cy + 10 * scale - bounce);
        ctx.rotate((runCycle * 0.1));
        ctx.fillRect(-1.5 * scale, 0, 3 * scale, 6 * scale);
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 2 * scale, cy + 10 * scale - bounce);
        ctx.rotate((-runCycle * 0.1));
        ctx.fillRect(-1.5 * scale, 0, 3 * scale, 6 * scale);
        ctx.restore();

        // Head
        ctx.fillStyle = "#fcd9b6";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Headband
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(cx - 5 * scale, cy - 14 * scale - bounce, 10 * scale, 2 * scale);

        // Determined eyes
        ctx.fillStyle = "#422006";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 12 * scale - bounce, 1 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 12 * scale - bounce, 1 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Swinging arms
        ctx.fillStyle = "#fcd9b6";
        ctx.save();
        ctx.translate(cx - 5 * scale, cy - 6 * scale - bounce);
        ctx.rotate(armSwing * Math.PI / 180);
        ctx.fillRect(-1 * scale, 0, 2 * scale, 6 * scale);
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 5 * scale, cy - 6 * scale - bounce);
        ctx.rotate(-armSwing * Math.PI / 180);
        ctx.fillRect(-1 * scale, 0, 2 * scale, 6 * scale);
        ctx.restore();
        break;
      }
      case "protestor": {
        // CAMPUS PROTESTOR - Passionate figure with sign
        const chantBob = Math.sin(t * 3) * 1.5;
        const signWave = Math.sin(t * 2) * 5;

        // Passion aura
        const passionGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 12 * scale);
        passionGrad.addColorStop(0, "rgba(239, 68, 68, 0.15)");
        passionGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = passionGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce - chantBob, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Body - red shirt
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy + 12 * scale - bounce - chantBob);
        ctx.quadraticCurveTo(cx - 8 * scale, cy - bounce - chantBob, cx - 5 * scale, cy - 8 * scale - bounce - chantBob);
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale - bounce - chantBob);
        ctx.quadraticCurveTo(cx + 8 * scale, cy - bounce - chantBob, cx + 7 * scale, cy + 12 * scale - bounce - chantBob);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#fcd9b6";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce - chantBob, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce - chantBob, 4 * scale, Math.PI, 0);
        ctx.fill();

        // Determined face
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 12 * scale - bounce - chantBob, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 12 * scale - bounce - chantBob, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Open mouth (chanting)
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 9 * scale - bounce - chantBob, 1.5 * scale, 1 * scale + Math.abs(chantBob) * 0.3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Protest sign
        ctx.save();
        ctx.translate(cx + 8 * scale, cy - 4 * scale - bounce - chantBob);
        ctx.rotate(signWave * Math.PI / 180);
        // Stick
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-1 * scale, -2 * scale, 2 * scale, 16 * scale);
        // Sign board
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(-6 * scale, -12 * scale, 12 * scale, 10 * scale);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(-6 * scale, -12 * scale, 12 * scale, 10 * scale);
        // Sign text
        ctx.fillStyle = "#ef4444";
        ctx.font = `bold ${3 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("!!!", 0, -6 * scale);
        ctx.restore();
        break;
      }
      case "bog_creature": {
        // BOG LURKER - Shambling swamp horror
        const sludgeDrip = Math.sin(t * 2) * 2;
        const shamble = Math.sin(t * 1.5) * 1.5;

        // Toxic aura
        const bogGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 * scale);
        bogGrad.addColorStop(0, "rgba(54, 83, 20, 0.25)");
        bogGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bogGrad;
        ctx.beginPath();
        ctx.arc(cx + shamble * 0.3 * scale, cy - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dripping muck particles
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const dripY = cy + 8 * scale + (t * 3 + i * 2) % 8 * scale;
            const dripX = cx - 4 * scale + i * 3 * scale + shamble * 0.2 * scale;
            ctx.fillStyle = `rgba(77, 124, 15, ${0.5 - ((t * 3 + i * 2) % 8) / 16})`;
            ctx.beginPath();
            ctx.ellipse(dripX, dripY - bounce, 1 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Lumpy body
        ctx.fillStyle = "#365314";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale + shamble * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 11 * scale, cy + 2 * scale - bounce, cx - 8 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx - 4 * scale, cy - 10 * scale - bounce, cx, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx + 4 * scale, cy - 10 * scale - bounce, cx + 8 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx + 11 * scale, cy + 2 * scale - bounce, cx + 9 * scale - shamble * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Slime highlights
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 2 * scale - bounce, 3 * scale, 2 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Glowing eyes
        ctx.fillStyle = "#84cc16";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale + shamble * 0.1 * scale, cy - 4 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale + shamble * 0.1 * scale, cy - 4 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a2e05";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 4 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 4 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dripping tendrils
        ctx.strokeStyle = "#4d7c0f";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 4 * scale - bounce);
        ctx.quadraticCurveTo(cx - 8 * scale, cy + 10 * scale - bounce + sludgeDrip, cx - 7 * scale, cy + 14 * scale - bounce);
        ctx.stroke();
        break;
      }
      case "will_o_wisp": {
        // WILL-O'-WISP - Floating spirit light
        const wispFloat = Math.sin(t * 3) * 6;
        const wispPulse = 0.5 + Math.sin(t * 5) * 0.4;
        const wispDrift = Math.sin(t * 2) * 3;

        // Ethereal glow
        const wispGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 16 * scale);
        wispGrad.addColorStop(0, `rgba(132, 204, 22, ${wispPulse * 0.5})`);
        wispGrad.addColorStop(0.4, `rgba(163, 230, 53, ${wispPulse * 0.3})`);
        wispGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = wispGrad;
        ctx.beginPath();
        ctx.arc(cx + wispDrift * scale, cy - 4 * scale - bounce - wispFloat, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Trailing particles
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const trailX = cx + wispDrift * scale - i * 2 * scale;
            const trailY = cy - 4 * scale - bounce - wispFloat + i * 1.5 * scale;
            ctx.fillStyle = `rgba(163, 230, 53, ${0.4 - i * 0.08})`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, (2 - i * 0.3) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Core flame body
        const flameGrad = ctx.createRadialGradient(
          cx + wispDrift * scale, cy - 4 * scale - bounce - wispFloat, 0,
          cx + wispDrift * scale, cy - 4 * scale - bounce - wispFloat, 6 * scale
        );
        flameGrad.addColorStop(0, "#fef9c3");
        flameGrad.addColorStop(0.3, "#84cc16");
        flameGrad.addColorStop(0.7, "#65a30d");
        flameGrad.addColorStop(1, "rgba(101, 163, 13, 0)");
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(cx + wispDrift * scale, cy - 4 * scale - bounce - wispFloat, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = `rgba(254, 249, 195, ${wispPulse})`;
        ctx.beginPath();
        ctx.arc(cx + wispDrift * scale, cy - 4 * scale - bounce - wispFloat, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Face-like features in the glow
        ctx.fillStyle = `rgba(22, 101, 52, ${0.6 + wispPulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale + wispDrift * scale, cy - 5 * scale - bounce - wispFloat, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale + wispDrift * scale, cy - 5 * scale - bounce - wispFloat, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "swamp_troll": {
        // SWAMP TROLL - Massive regenerating brute
        const trollStomp = Math.sin(t * 1.2) * 2;
        const clubSwing = Math.sin(t * 1.5) * 10;

        // Murky aura
        const trollGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        trollGrad.addColorStop(0, "rgba(77, 124, 15, 0.2)");
        trollGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = trollGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + trollStomp, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Massive body
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy + 14 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx - 13 * scale, cy - bounce + trollStomp, cx - 8 * scale, cy - 10 * scale - bounce + trollStomp);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx + 13 * scale, cy - bounce + trollStomp, cx + 11 * scale, cy + 14 * scale - bounce + trollStomp);
        ctx.closePath();
        ctx.fill();

        // Mossy patches
        ctx.fillStyle = "#365314";
        ctx.beginPath();
        ctx.ellipse(cx - 4 * scale, cy - 2 * scale - bounce + trollStomp, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy + 4 * scale - bounce + trollStomp, 2.5 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale - bounce + trollStomp, 7 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyes
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 14 * scale - bounce + trollStomp, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 14 * scale - bounce + trollStomp, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a2e05";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 14 * scale - bounce + trollStomp, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 14 * scale - bounce + trollStomp, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tusks
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 10 * scale - bounce + trollStomp);
        ctx.lineTo(cx - 6 * scale, cy - 6 * scale - bounce + trollStomp);
        ctx.lineTo(cx - 3 * scale, cy - 9 * scale - bounce + trollStomp);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 10 * scale - bounce + trollStomp);
        ctx.lineTo(cx + 6 * scale, cy - 6 * scale - bounce + trollStomp);
        ctx.lineTo(cx + 3 * scale, cy - 9 * scale - bounce + trollStomp);
        ctx.fill();

        // Club
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 4 * scale - bounce + trollStomp);
        ctx.rotate(clubSwing * Math.PI / 180);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-2 * scale, -10 * scale, 4 * scale, 14 * scale);
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.arc(0, -10 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "nomad": {
        // DESERT NOMAD - Robed desert wanderer
        const sandStep = Math.sin(t * 2) * 1;
        const cloakWave = Math.sin(t * 1.5) * 2;

        // Desert heat shimmer
        const heatGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12 * scale);
        heatGrad.addColorStop(0, "rgba(161, 98, 7, 0.15)");
        heatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + sandStep, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Flowing robes
        const robeGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy);
        robeGrad.addColorStop(0, "#78350f");
        robeGrad.addColorStop(0.5, "#a16207");
        robeGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale + cloakWave * 0.3 * scale, cy + 14 * scale - bounce + sandStep);
        ctx.quadraticCurveTo(cx - 9 * scale, cy - bounce + sandStep, cx - 5 * scale, cy - 10 * scale - bounce + sandStep);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce + sandStep);
        ctx.quadraticCurveTo(cx + 9 * scale, cy - bounce + sandStep, cx + 8 * scale - cloakWave * 0.3 * scale, cy + 14 * scale - bounce + sandStep);
        ctx.closePath();
        ctx.fill();

        // Headwrap
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce + sandStep, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a16207";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15 * scale - bounce + sandStep, 5 * scale, 3 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Face wrap leaving eyes
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(cx - 5 * scale, cy - 15 * scale - bounce + sandStep, 10 * scale, 3 * scale);

        // Dark eyes
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce + sandStep, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce + sandStep, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Walking staff
        ctx.fillStyle = "#78350f";
        ctx.fillRect(cx + 8 * scale, cy - 12 * scale - bounce + sandStep, 2 * scale, 26 * scale);
        break;
      }
      case "scorpion": {
        // GIANT SCORPION - Armored desert predator
        const clawSnap = Math.sin(t * 3) * 8;
        const tailCurl = Math.sin(t * 2) * 10;

        // Sand dust
        ctx.fillStyle = "rgba(120, 53, 15, 0.15)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10 * scale - bounce, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Segmented body
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * scale - bounce, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx, cy - 6 * scale - bounce, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail segments
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 4 * scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx, cy + 6 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 4 * scale,
          cy + 10 * scale - bounce,
          cx - 6 * scale - tailCurl * 0.3 * scale,
          cy + 4 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx - 8 * scale - tailCurl * 0.5 * scale,
          cy - 4 * scale - bounce,
          cx - 4 * scale - tailCurl * 0.3 * scale,
          cy - 12 * scale - bounce
        );
        ctx.stroke();

        // Stinger
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale - tailCurl * 0.3 * scale, cy - 12 * scale - bounce);
        ctx.lineTo(cx - 2 * scale - tailCurl * 0.2 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx - 6 * scale - tailCurl * 0.4 * scale, cy - 13 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Claws
        ctx.fillStyle = "#92400e";
        // Left claw
        ctx.save();
        ctx.translate(cx - 8 * scale, cy - 4 * scale - bounce);
        ctx.rotate(-0.3 - clawSnap * Math.PI / 180 * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-6 * scale, -2 * scale);
        ctx.lineTo(-5 * scale, 2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Right claw
        ctx.save();
        ctx.translate(cx + 8 * scale, cy - 4 * scale - bounce);
        ctx.rotate(0.3 + clawSnap * Math.PI / 180 * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(6 * scale, -2 * scale);
        ctx.lineTo(5 * scale, 2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Eyes
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 8 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 8 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "scarab": {
        // SACRED SCARAB - Golden beetle
        const scurry = Math.sin(t * 8) * 1;
        const wingShimmer = 0.6 + Math.sin(t * 4) * 0.3;

        // Golden glow
        const scarabGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 10 * scale);
        scarabGrad.addColorStop(0, `rgba(251, 191, 36, ${wingShimmer * 0.3})`);
        scarabGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = scarabGrad;
        ctx.beginPath();
        ctx.arc(cx + scurry * scale, cy - 2 * scale - bounce, 10 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Shell
        const shellGrad = ctx.createLinearGradient(cx - 5 * scale, cy - 6 * scale, cx + 5 * scale, cy + 4 * scale);
        shellGrad.addColorStop(0, "#fbbf24");
        shellGrad.addColorStop(0.5, "#f59e0b");
        shellGrad.addColorStop(1, "#d97706");
        ctx.fillStyle = shellGrad;
        ctx.beginPath();
        ctx.ellipse(cx + scurry * scale, cy - bounce, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell pattern
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + scurry * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + scurry * scale, cy + 6 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + scurry * scale, cy - 2 * scale - bounce, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Head
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(cx + scurry * scale, cy - 10 * scale - bounce, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale + scurry * scale, cy - 11 * scale - bounce);
        ctx.lineTo(cx - 4 * scale + scurry * scale, cy - 14 * scale - bounce);
        ctx.moveTo(cx + 2 * scale + scurry * scale, cy - 11 * scale - bounce);
        ctx.lineTo(cx + 4 * scale + scurry * scale, cy - 14 * scale - bounce);
        ctx.stroke();

        // Legs
        ctx.strokeStyle = "#92400e";
        for (let i = 0; i < 3; i++) {
          const legY = cy - 4 * scale + i * 4 * scale - bounce;
          const legAnim = Math.sin(t * 8 + i) * 2;
          ctx.beginPath();
          ctx.moveTo(cx - 5 * scale + scurry * scale, legY);
          ctx.lineTo(cx - 9 * scale + scurry * scale + legAnim * scale, legY + 2 * scale);
          ctx.moveTo(cx + 5 * scale + scurry * scale, legY);
          ctx.lineTo(cx + 9 * scale + scurry * scale - legAnim * scale, legY + 2 * scale);
          ctx.stroke();
        }
        break;
      }
      case "snow_goblin": {
        // FROST GOBLIN - Mischievous ice creature
        const goblinHop = Math.sin(t * 4) * 2;
        const frostBreath = 0.5 + Math.sin(t * 3) * 0.3;

        // Cold aura
        const frostGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 12 * scale);
        frostGrad.addColorStop(0, `rgba(147, 197, 253, ${frostBreath * 0.25})`);
        frostGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = frostGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce - goblinHop, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Small hunched body
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 10 * scale - bounce - goblinHop);
        ctx.quadraticCurveTo(cx - 7 * scale, cy - bounce - goblinHop, cx - 4 * scale, cy - 6 * scale - bounce - goblinHop);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale - bounce - goblinHop);
        ctx.quadraticCurveTo(cx + 7 * scale, cy - bounce - goblinHop, cx + 6 * scale, cy + 10 * scale - bounce - goblinHop);
        ctx.closePath();
        ctx.fill();

        // Frost patterns on body
        ctx.strokeStyle = "#bfdbfe";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 2 * scale - bounce - goblinHop);
        ctx.lineTo(cx - 3 * scale, cy + 4 * scale - bounce - goblinHop);
        ctx.moveTo(cx + 2 * scale, cy - bounce - goblinHop);
        ctx.lineTo(cx + 1 * scale, cy + 5 * scale - bounce - goblinHop);
        ctx.stroke();

        // Large head
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 * scale - bounce - goblinHop, 6 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pointy ears
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 10 * scale - bounce - goblinHop);
        ctx.lineTo(cx - 9 * scale, cy - 14 * scale - bounce - goblinHop);
        ctx.lineTo(cx - 4 * scale, cy - 8 * scale - bounce - goblinHop);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, cy - 10 * scale - bounce - goblinHop);
        ctx.lineTo(cx + 9 * scale, cy - 14 * scale - bounce - goblinHop);
        ctx.lineTo(cx + 4 * scale, cy - 8 * scale - bounce - goblinHop);
        ctx.fill();

        // Big mischievous eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 10 * scale - bounce - goblinHop, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 10 * scale - bounce - goblinHop, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e40af";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 10 * scale - bounce - goblinHop, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 10 * scale - bounce - goblinHop, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Sharp-toothed grin
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * scale - bounce - goblinHop, 2 * scale, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 1.5 * scale + i * scale, cy - 6 * scale - bounce - goblinHop);
          ctx.lineTo(cx - 1 * scale + i * scale, cy - 5 * scale - bounce - goblinHop);
          ctx.lineTo(cx - 0.5 * scale + i * scale, cy - 6 * scale - bounce - goblinHop);
          ctx.fill();
        }

        // Ice claws
        ctx.fillStyle = "#bfdbfe";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy + 2 * scale - bounce - goblinHop);
        ctx.lineTo(cx - 10 * scale, cy + 4 * scale - bounce - goblinHop);
        ctx.lineTo(cx - 6 * scale, cy + 4 * scale - bounce - goblinHop);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 7 * scale, cy + 2 * scale - bounce - goblinHop);
        ctx.lineTo(cx + 10 * scale, cy + 4 * scale - bounce - goblinHop);
        ctx.lineTo(cx + 6 * scale, cy + 4 * scale - bounce - goblinHop);
        ctx.fill();
        break;
      }
      case "yeti": {
        // MOUNTAIN YETI - Massive ice titan
        const yetiStomp = Math.sin(t * 1.2) * 2;
        const frostBreath = 0.5 + Math.sin(t * 2) * 0.3;
        const armSwing = Math.sin(t * 1.5) * 8;

        // Blizzard aura
        const yetiGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 * scale);
        yetiGrad.addColorStop(0, `rgba(224, 242, 254, ${frostBreath * 0.3})`);
        yetiGrad.addColorStop(0.5, `rgba(186, 230, 253, ${frostBreath * 0.15})`);
        yetiGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = yetiGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + yetiStomp, 20 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Snow particles
        if (animated) {
          for (let i = 0; i < 6; i++) {
            const snowX = cx + Math.sin(t * 2 + i * 1.5) * 12 * scale;
            const snowY = cy - 10 * scale + (t * 2 + i) % 4 * 6 * scale - bounce + yetiStomp;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - ((t * 2 + i) % 4) / 8})`;
            ctx.beginPath();
            ctx.arc(snowX, snowY, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Massive furry body
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 14 * scale - bounce + yetiStomp);
        ctx.quadraticCurveTo(cx - 14 * scale, cy - bounce + yetiStomp, cx - 10 * scale, cy - 12 * scale - bounce + yetiStomp);
        ctx.lineTo(cx + 10 * scale, cy - 12 * scale - bounce + yetiStomp);
        ctx.quadraticCurveTo(cx + 14 * scale, cy - bounce + yetiStomp, cx + 12 * scale, cy + 14 * scale - bounce + yetiStomp);
        ctx.closePath();
        ctx.fill();

        // Fur texture
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale + i * 4 * scale, cy - 4 * scale - bounce + yetiStomp);
          ctx.lineTo(cx - 8 * scale + i * 4 * scale + Math.sin(i) * 2 * scale, cy + 6 * scale - bounce + yetiStomp);
          ctx.stroke();
        }

        // Head
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 16 * scale - bounce + yetiStomp, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fierce eyes
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 16 * scale - bounce + yetiStomp, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 16 * scale - bounce + yetiStomp, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(56, 189, 248, ${frostBreath})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 16 * scale - bounce + yetiStomp, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 16 * scale - bounce + yetiStomp, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Roaring mouth
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce + yetiStomp, 3 * scale, 0, Math.PI);
        ctx.fill();
        // Fangs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 12 * scale - bounce + yetiStomp);
        ctx.lineTo(cx - 2 * scale, cy - 10 * scale - bounce + yetiStomp);
        ctx.lineTo(cx - 1 * scale, cy - 12 * scale - bounce + yetiStomp);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale, cy - 12 * scale - bounce + yetiStomp);
        ctx.lineTo(cx + 2 * scale, cy - 10 * scale - bounce + yetiStomp);
        ctx.lineTo(cx + 1 * scale, cy - 12 * scale - bounce + yetiStomp);
        ctx.fill();

        // Massive arms
        ctx.fillStyle = "#e0f2fe";
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - 6 * scale - bounce + yetiStomp);
        ctx.rotate(-0.3 + armSwing * Math.PI / 180);
        ctx.fillRect(-3 * scale, 0, 6 * scale, 14 * scale);
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 6 * scale - bounce + yetiStomp);
        ctx.rotate(0.3 - armSwing * Math.PI / 180);
        ctx.fillRect(-3 * scale, 0, 6 * scale, 14 * scale);
        ctx.restore();
        break;
      }
      case "ice_witch": {
        // FROST SORCERESS - Elegant ice mage
        const magicPulse = 0.6 + Math.sin(t * 3) * 0.4;
        const staffGlow = Math.sin(t * 4) * 0.2;
        const capeFlow = Math.sin(t * 1.5) * 3;

        // Ice magic aura
        const witchGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 16 * scale);
        witchGrad.addColorStop(0, `rgba(96, 165, 250, ${magicPulse * 0.35})`);
        witchGrad.addColorStop(0.5, `rgba(147, 197, 253, ${magicPulse * 0.2})`);
        witchGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = witchGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating ice crystals
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const angle = t * 1.5 + i * Math.PI * 0.5;
            const dist = 10 * scale;
            const ix = cx + Math.cos(angle) * dist;
            const iy = cy - 4 * scale + Math.sin(angle) * dist * 0.4 - bounce;
            ctx.fillStyle = `rgba(191, 219, 254, ${0.5 + Math.sin(t * 2 + i) * 0.3})`;
            ctx.save();
            ctx.translate(ix, iy);
            ctx.rotate(angle);
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

        // Elegant robes
        const robeGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy);
        robeGrad.addColorStop(0, "#1e40af");
        robeGrad.addColorStop(0.5, "#3b82f6");
        robeGrad.addColorStop(1, "#1e40af");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale + capeFlow * 0.3 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(cx - 9 * scale, cy - bounce, cx - 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy - bounce, cx + 8 * scale - capeFlow * 0.3 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Frost patterns on robes
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy + 8 * scale - bounce);
        ctx.moveTo(cx + 4 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy + 10 * scale - bounce);
        ctx.stroke();

        // Pale face
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Ice crown/tiara
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy - 21 * scale - bounce);
        ctx.lineTo(cx - 1 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx, cy - 23 * scale - bounce);
        ctx.lineTo(cx + 1 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy - 21 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 17 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Glowing blue eyes
        ctx.fillStyle = `rgba(56, 189, 248, ${magicPulse})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Ice staff
        ctx.fillStyle = "#bfdbfe";
        ctx.fillRect(cx + 8 * scale, cy - 14 * scale - bounce, 2 * scale, 26 * scale);
        // Staff crystal
        ctx.fillStyle = `rgba(56, 189, 248, ${0.7 + staffGlow})`;
        ctx.beginPath();
        ctx.moveTo(cx + 9 * scale, cy - 14 * scale - bounce);
        ctx.lineTo(cx + 12 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 18 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "magma_spawn": {
        // MAGMA SPAWN - Living lava elemental
        const lavaPulse = 0.6 + Math.sin(t * 3) * 0.4;
        const bubblePop = Math.sin(t * 6);
        const lavaFlow = Math.sin(t * 2) * 2;

        // Intense heat aura
        const magmaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16 * scale);
        magmaGrad.addColorStop(0, `rgba(234, 88, 12, ${lavaPulse * 0.4})`);
        magmaGrad.addColorStop(0.5, `rgba(249, 115, 22, ${lavaPulse * 0.25})`);
        magmaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = magmaGrad;
        ctx.beginPath();
        ctx.arc(cx + lavaFlow * 0.3 * scale, cy - bounce, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Lava drips
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const dripX = cx - 4 * scale + i * 3 * scale;
            const dripY = cy + 8 * scale + (t * 3 + i * 2) % 6 * scale - bounce;
            ctx.fillStyle = `rgba(251, 146, 60, ${0.7 - ((t * 3 + i * 2) % 6) / 12})`;
            ctx.beginPath();
            ctx.ellipse(dripX, dripY, 1 * scale, 2 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Molten body
        const bodyGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 2 * scale, cx, cy - 2 * scale, 12 * scale);
        bodyGrad.addColorStop(0, "#fbbf24");
        bodyGrad.addColorStop(0.4, "#ea580c");
        bodyGrad.addColorStop(0.8, "#9a3412");
        bodyGrad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale + lavaFlow * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 10 * scale, cy - bounce, cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx, cy - 14 * scale - bounce, cx + 6 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 10 * scale, cy - bounce, cx + 9 * scale - lavaFlow * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Lava cracks
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy + 4 * scale - bounce);
        ctx.moveTo(cx + 3 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 6 * scale - bounce);
        ctx.stroke();

        // Bubbling surface
        ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + bubblePop * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 6 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 3 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing eyes
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 8 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 8 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 8 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 8 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "fire_imp": {
        // FIRE IMP - Small mischievous demon
        const impHop = Math.sin(t * 5) * 3;
        const flameFlicker = 0.6 + Math.sin(t * 8) * 0.3;
        const tailWag = Math.sin(t * 4) * 15;

        // Fire aura
        const impGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 12 * scale);
        impGrad.addColorStop(0, `rgba(251, 146, 60, ${flameFlicker * 0.3})`);
        impGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = impGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce - impHop, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Spark particles
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const sparkX = cx + Math.sin(t * 4 + i * 2) * 6 * scale;
            const sparkY = cy - 8 * scale - bounce - impHop - (t * 3 + i) % 4 * 3 * scale;
            ctx.fillStyle = `rgba(251, 191, 36, ${0.6 - ((t * 3 + i) % 4) / 8})`;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Small demonic body
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 8 * scale - bounce - impHop);
        ctx.quadraticCurveTo(cx - 6 * scale, cy - bounce - impHop, cx - 4 * scale, cy - 6 * scale - bounce - impHop);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale - bounce - impHop);
        ctx.quadraticCurveTo(cx + 6 * scale, cy - bounce - impHop, cx + 5 * scale, cy + 8 * scale - bounce - impHop);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale - bounce - impHop, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 13 * scale - bounce - impHop);
        ctx.lineTo(cx - 5 * scale, cy - 18 * scale - bounce - impHop);
        ctx.lineTo(cx - 2 * scale, cy - 14 * scale - bounce - impHop);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy - 13 * scale - bounce - impHop);
        ctx.lineTo(cx + 5 * scale, cy - 18 * scale - bounce - impHop);
        ctx.lineTo(cx + 2 * scale, cy - 14 * scale - bounce - impHop);
        ctx.fill();

        // Mischievous eyes
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 10 * scale - bounce - impHop, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 10 * scale - bounce - impHop, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 10 * scale - bounce - impHop, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 10 * scale - bounce - impHop, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Grinning mouth
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale - bounce - impHop, 2 * scale, 0, Math.PI);
        ctx.fill();

        // Pointed tail
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 6 * scale - bounce - impHop);
        ctx.quadraticCurveTo(
          cx - 4 * scale + tailWag * 0.1 * scale,
          cy + 10 * scale - bounce - impHop,
          cx - 2 * scale + tailWag * 0.2 * scale,
          cy + 14 * scale - bounce - impHop
        );
        ctx.stroke();
        // Arrow tip
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale + tailWag * 0.2 * scale, cy + 14 * scale - bounce - impHop);
        ctx.lineTo(cx - 4 * scale + tailWag * 0.2 * scale, cy + 12 * scale - bounce - impHop);
        ctx.lineTo(cx - 1 * scale + tailWag * 0.2 * scale, cy + 16 * scale - bounce - impHop);
        ctx.lineTo(cx + tailWag * 0.2 * scale, cy + 12 * scale - bounce - impHop);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "ember_guard": {
        // EMBER GUARD - Elite infernal knight
        const guardStomp = Math.sin(t * 1.5) * 1;
        const emberGlow = 0.5 + Math.sin(t * 3) * 0.3;
        const swordFlame = Math.sin(t * 5) * 0.2;

        // Infernal aura
        const guardGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        guardGrad.addColorStop(0, `rgba(194, 65, 12, ${emberGlow * 0.35})`);
        guardGrad.addColorStop(0.5, `rgba(234, 88, 12, ${emberGlow * 0.2})`);
        guardGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = guardGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + guardStomp, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Ember particles
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const emberX = cx + Math.sin(t * 2 + i * 1.3) * 10 * scale;
            const emberY = cy - 6 * scale - (t * 2 + i) % 4 * 4 * scale - bounce + guardStomp;
            ctx.fillStyle = `rgba(251, 146, 60, ${0.6 - ((t * 2 + i) % 4) / 8})`;
            ctx.beginPath();
            ctx.arc(emberX, emberY, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Heavy plate armor body
        const armorGrad = ctx.createLinearGradient(cx - 10 * scale, cy, cx + 10 * scale, cy);
        armorGrad.addColorStop(0, "#7c2d12");
        armorGrad.addColorStop(0.3, "#c2410c");
        armorGrad.addColorStop(0.5, "#ea580c");
        armorGrad.addColorStop(0.7, "#c2410c");
        armorGrad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale - bounce + guardStomp);
        ctx.lineTo(cx - 11 * scale, cy - 2 * scale - bounce + guardStomp);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale - bounce + guardStomp);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale - bounce + guardStomp);
        ctx.lineTo(cx + 11 * scale, cy - 2 * scale - bounce + guardStomp);
        ctx.lineTo(cx + 10 * scale, cy + 14 * scale - bounce + guardStomp);
        ctx.closePath();
        ctx.fill();

        // Glowing armor cracks
        ctx.strokeStyle = `rgba(251, 146, 60, ${emberGlow})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 4 * scale - bounce + guardStomp);
        ctx.lineTo(cx - 5 * scale, cy + 6 * scale - bounce + guardStomp);
        ctx.moveTo(cx + 3 * scale, cy - 2 * scale - bounce + guardStomp);
        ctx.lineTo(cx + 4 * scale, cy + 8 * scale - bounce + guardStomp);
        ctx.stroke();

        // Helmet
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce + guardStomp, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9a3412";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 16 * scale - bounce + guardStomp, 6 * scale, 4 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Flame plume on helmet
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 18 * scale - bounce + guardStomp);
        ctx.quadraticCurveTo(cx - 2 * scale, cy - 22 * scale - bounce + guardStomp, cx, cy - 26 * scale - bounce + guardStomp);
        ctx.quadraticCurveTo(cx + 2 * scale, cy - 22 * scale - bounce + guardStomp, cx, cy - 18 * scale - bounce + guardStomp);
        ctx.fill();

        // Visor with glowing eyes
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(cx - 5 * scale, cy - 15 * scale - bounce + guardStomp, 10 * scale, 3 * scale);
        ctx.fillStyle = `rgba(251, 191, 36, ${emberGlow})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce + guardStomp, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce + guardStomp, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Flaming sword
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 4 * scale - bounce + guardStomp);
        ctx.rotate(-0.2);
        // Blade
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-1.5 * scale, -14 * scale, 3 * scale, 16 * scale);
        // Flame effect on blade
        ctx.fillStyle = `rgba(251, 146, 60, ${0.6 + swordFlame})`;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -14 * scale);
        ctx.lineTo(0, -18 * scale);
        ctx.lineTo(2 * scale, -14 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + swordFlame})`;
        ctx.fillRect(-0.5 * scale, -12 * scale, 1 * scale, 10 * scale);
        // Guard
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(-3 * scale, 0, 6 * scale, 2 * scale);
        ctx.restore();
        break;
      }
      default: {
        // Fallback generic enemy - simple skull/creature
        const genericPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const color = "#888888";

        // Simple aura
        ctx.fillStyle = `${color}40`;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx, cy - bounce, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = `rgba(255, 255, 255, ${genericPulse})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 4 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 4 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 4 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 4 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
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
