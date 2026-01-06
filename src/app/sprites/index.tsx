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
        // Nassau Cannon - Artillery tower with isometric base
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 12 * scale,
          18 * scale,
          9 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Mechanical base - left face
        ctx.fillStyle = "#4a4a52";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 4 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Right face
        ctx.fillStyle = "#3a3a42";
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 4 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Top face
        ctx.fillStyle = "#5a5a62";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 8 * scale);
        ctx.lineTo(cx, cy - 4 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 8 * scale);
        ctx.closePath();
        ctx.fill();
        // Tech vents (glowing)
        const ventGlow = 0.5 + Math.sin(t * 4) * 0.3;
        ctx.fillStyle = `rgba(255, 102, 0, ${ventGlow})`;
        ctx.fillRect(cx - 8 * scale, cy - 2 * scale, 3 * scale, 6 * scale);
        ctx.fillRect(cx + 5 * scale, cy - 2 * scale, 3 * scale, 6 * scale);
        // Turret base
        ctx.fillStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 10 * scale,
          10 * scale,
          6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Cannon barrel
        ctx.fillStyle = "#2a2a2a";
        ctx.save();
        ctx.translate(cx, cy - 10 * scale);
        ctx.rotate(-0.4);
        ctx.fillRect(0, -4 * scale, 22 * scale, 8 * scale);
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(8 * scale, -5 * scale, 3 * scale, 10 * scale);
        ctx.fillRect(16 * scale, -5 * scale, 3 * scale, 10 * scale);
        // Muzzle glow
        ctx.fillStyle = `rgba(255, 100, 0, ${ventGlow})`;
        ctx.beginPath();
        ctx.arc(22 * scale, 0, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Level indicator
        if (level > 1) {
          ctx.fillStyle = "#ffd700";
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 18 * scale, 3 * scale);
          }
        }
        break;
      }
      case "library": {
        // Firestone Library - Gothic magic tower
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 12 * scale,
          16 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Main building - left face
        ctx.fillStyle = "#6b5b4b";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 2 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Right face
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 2 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Gothic pointed roof
        ctx.fillStyle = "#4a3a2a";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy - 6 * scale);
        ctx.lineTo(cx, cy - 28 * scale);
        ctx.lineTo(cx + 16 * scale, cy - 6 * scale);
        ctx.closePath();
        ctx.fill();
        // Roof highlight
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28 * scale);
        ctx.lineTo(cx + 16 * scale, cy - 6 * scale);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale);
        ctx.closePath();
        ctx.fill();
        // Gothic window
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 6 * scale);
        ctx.lineTo(cx - 5 * scale, cy - 2 * scale);
        ctx.quadraticCurveTo(
          cx,
          cy - 8 * scale,
          cx + 5 * scale,
          cy - 2 * scale
        );
        ctx.lineTo(cx + 5 * scale, cy + 6 * scale);
        ctx.closePath();
        ctx.fill();
        // Window glow
        const glowIntensity = animated ? 0.6 + Math.sin(t * 2) * 0.3 : 0.8;
        ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity})`;
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 10 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy + 5 * scale);
        ctx.lineTo(cx - 4 * scale, cy - 1 * scale);
        ctx.quadraticCurveTo(
          cx,
          cy - 6 * scale,
          cx + 4 * scale,
          cy - 1 * scale
        );
        ctx.lineTo(cx + 4 * scale, cy + 5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Spire
        ctx.fillStyle = "#3a2a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 28 * scale);
        ctx.lineTo(cx, cy - 36 * scale);
        ctx.lineTo(cx + 2 * scale, cy - 28 * scale);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "lab": {
        // E-Quad Lab - Tesla/electric tower
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 12 * scale,
          14 * scale,
          7 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Industrial building - left
        ctx.fillStyle = "#3d5a6b";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 10 * scale, cy - 10 * scale);
        ctx.lineTo(cx, cy - 6 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Right
        ctx.fillStyle = "#2d4a5a";
        ctx.beginPath();
        ctx.moveTo(cx + 12 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 10 * scale, cy - 10 * scale);
        ctx.lineTo(cx, cy - 6 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Dome
        ctx.fillStyle = "#4d6a7b";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale, 10 * scale, Math.PI, 0);
        ctx.fill();
        // Tesla coil
        ctx.strokeStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = animated ? 12 * scale : 8 * scale;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 18 * scale);
        ctx.lineTo(cx, cy - 32 * scale);
        ctx.stroke();
        // Energy orb
        const orbPulse = animated ? 1 + Math.sin(t * 3) * 0.2 : 1;
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(cx, cy - 32 * scale, 5 * scale * orbPulse, 0, Math.PI * 2);
        ctx.fill();
        // Electric arcs
        if (animated) {
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 1.5 * scale;
          for (let i = 0; i < 4; i++) {
            const angle = t * 2 + (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 32 * scale);
            ctx.lineTo(
              cx + Math.cos(angle) * 8 * scale,
              cy - 32 * scale + Math.sin(angle) * 8 * scale
            );
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        break;
      }
      case "arch": {
        // Blair Arch - Sound/music tower
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 12 * scale,
          18 * scale,
          9 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Left pillar
        ctx.fillStyle = "#7b6b55";
        ctx.fillRect(cx - 16 * scale, cy - 18 * scale, 8 * scale, 30 * scale);
        ctx.fillStyle = "#6b5b45";
        ctx.fillRect(cx - 16 * scale, cy - 18 * scale, 4 * scale, 30 * scale);
        // Right pillar
        ctx.fillStyle = "#7b6b55";
        ctx.fillRect(cx + 8 * scale, cy - 18 * scale, 8 * scale, 30 * scale);
        ctx.fillStyle = "#8b7b65";
        ctx.fillRect(cx + 12 * scale, cy - 18 * scale, 4 * scale, 30 * scale);
        // Arch
        ctx.fillStyle = "#8b7b65";
        ctx.beginPath();
        ctx.arc(cx, cy - 18 * scale, 12 * scale, Math.PI, 0);
        ctx.lineTo(cx + 16 * scale, cy - 18 * scale);
        ctx.arc(cx, cy - 18 * scale, 16 * scale, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        // Inner arch (portal)
        ctx.fillStyle = "#2a1a1a";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale, 8 * scale, Math.PI, 0);
        ctx.lineTo(cx + 8 * scale, cy + 8 * scale);
        ctx.lineTo(cx - 8 * scale, cy + 8 * scale);
        ctx.closePath();
        ctx.fill();
        // Portal glow
        const portalGlow = animated ? 0.4 + Math.sin(t * 2) * 0.2 : 0.5;
        ctx.fillStyle = `rgba(180, 100, 255, ${portalGlow})`;
        ctx.shadowColor = "#b464ff";
        ctx.shadowBlur = 10 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale, 6 * scale, Math.PI, 0);
        ctx.lineTo(cx + 6 * scale, cy + 4 * scale);
        ctx.lineTo(cx - 6 * scale, cy + 4 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Sound waves
        if (animated) {
          ctx.strokeStyle = `rgba(180, 100, 255, ${0.6 - (t % 1) * 0.5})`;
          ctx.lineWidth = 2 * scale;
          for (let i = 1; i <= 2; i++) {
            const waveSize = (4 + ((t * 10) % 10) + i * 4) * scale;
            ctx.beginPath();
            ctx.arc(cx, cy - 5 * scale, waveSize, -0.8, 0.8);
            ctx.stroke();
          }
        }
        break;
      }
      case "club": {
        // Eating Club - Economy/buff tower
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 12 * scale,
          16 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Building - left
        ctx.fillStyle = "#2d6b2d";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 4 * scale);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Right
        ctx.fillStyle = "#1d5b1d";
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 4 * scale);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Roof
        ctx.fillStyle = "#1a4a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy - 4 * scale);
        ctx.lineTo(cx, cy - 22 * scale);
        ctx.lineTo(cx + 16 * scale, cy - 4 * scale);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = "#5d3a1a";
        ctx.fillRect(cx - 4 * scale, cy, 8 * scale, 10 * scale);
        // Dollar sign
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 6 * scale;
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, cy - 12 * scale);
        ctx.shadowBlur = 0;
        break;
      }
      case "station": {
        // Dinky Station - Troop spawner
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
        // Station building - left
        ctx.fillStyle = "#8b2a2a";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 16 * scale, cy - 2 * scale);
        ctx.lineTo(cx, cy + 2 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Right
        ctx.fillStyle = "#7b1a1a";
        ctx.beginPath();
        ctx.moveTo(cx + 16 * scale, cy + 14 * scale);
        ctx.lineTo(cx + 16 * scale, cy - 2 * scale);
        ctx.lineTo(cx, cy + 2 * scale);
        ctx.lineTo(cx, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Roof
        ctx.fillStyle = "#6b0000";
        ctx.fillRect(cx - 18 * scale, cy - 8 * scale, 36 * scale, 8 * scale);
        // Windows
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 4 * scale;
        ctx.fillRect(cx - 14 * scale, cy + 2 * scale, 6 * scale, 6 * scale);
        ctx.fillRect(cx + 8 * scale, cy + 2 * scale, 6 * scale, 6 * scale);
        ctx.shadowBlur = 0;
        // Flag
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12 * scale);
        ctx.lineTo(cx, cy - 26 * scale);
        ctx.lineTo(cx + 10 * scale, cy - 22 * scale);
        ctx.lineTo(cx, cy - 18 * scale);
        ctx.fill();
        // Train tracks
        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 22 * scale, cy + 12 * scale);
        ctx.lineTo(cx + 22 * scale, cy + 12 * scale);
        ctx.stroke();
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
// SPELL SPRITES
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
    const scale = size / 40;
    const t = time * 0.1;
    switch (type) {
      case "fireball": {
        const flameHeight = animated ? 14 + Math.sin(t * 3) * 2 : 14;
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 15 * scale;
        const fireGrad = ctx.createRadialGradient(
          cx,
          cy + 2 * scale,
          0,
          cx,
          cy,
          flameHeight * scale
        );
        fireGrad.addColorStop(0, "#ffffff");
        fireGrad.addColorStop(0.15, "#ffff00");
        fireGrad.addColorStop(0.4, "#ff8800");
        fireGrad.addColorStop(0.7, "#ff4400");
        fireGrad.addColorStop(1, "#cc0000");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - flameHeight * scale);
        ctx.quadraticCurveTo(
          cx + 12 * scale,
          cy - 8 * scale,
          cx + 12 * scale,
          cy + 4 * scale
        );
        ctx.quadraticCurveTo(
          cx + 10 * scale,
          cy + 14 * scale,
          cx,
          cy + 12 * scale
        );
        ctx.quadraticCurveTo(
          cx - 10 * scale,
          cy + 14 * scale,
          cx - 12 * scale,
          cy + 4 * scale
        );
        ctx.quadraticCurveTo(
          cx - 12 * scale,
          cy - 8 * scale,
          cx,
          cy - flameHeight * scale
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffff88";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale);
        ctx.quadraticCurveTo(
          cx + 5 * scale,
          cy,
          cx + 4 * scale,
          cy + 5 * scale
        );
        ctx.quadraticCurveTo(
          cx,
          cy + 7 * scale,
          cx - 4 * scale,
          cy + 5 * scale
        );
        ctx.quadraticCurveTo(cx - 5 * scale, cy, cx, cy - 6 * scale);
        ctx.fill();
        break;
      }
      case "lightning": {
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 12 * scale;
        ctx.fillStyle = "#ffdd00";
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale, cy - 16 * scale);
        ctx.lineTo(cx - 2 * scale, cy - 3 * scale);
        ctx.lineTo(cx + 6 * scale, cy - 3 * scale);
        ctx.lineTo(cx - 8 * scale, cy + 16 * scale);
        ctx.lineTo(cx + 2 * scale, cy + 3 * scale);
        ctx.lineTo(cx - 6 * scale, cy + 3 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        if (animated) {
          ctx.strokeStyle = "#ffff88";
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const angle = t * 2 + (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.cos(angle) * 10 * scale,
              cy + Math.sin(angle) * 10 * scale
            );
            ctx.stroke();
          }
        }
        break;
      }
      case "freeze": {
        ctx.shadowColor = "#00ddff";
        ctx.shadowBlur = 10 * scale;
        ctx.strokeStyle = "#00ddff";
        ctx.fillStyle = "#aaffff";
        ctx.lineWidth = 2.5 * scale;
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((i * Math.PI) / 3 + (animated ? t * 0.5 : 0));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -14 * scale);
          ctx.moveTo(0, -7 * scale);
          ctx.lineTo(-5 * scale, -10 * scale);
          ctx.moveTo(0, -7 * scale);
          ctx.lineTo(5 * scale, -10 * scale);
          ctx.moveTo(0, -11 * scale);
          ctx.lineTo(-3 * scale, -14 * scale);
          ctx.moveTo(0, -11 * scale);
          ctx.lineTo(3 * scale, -14 * scale);
          ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "payday": {
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 12 * scale;
        for (let i = 2; i >= 0; i--) {
          ctx.fillStyle = i === 0 ? "#ffd700" : "#daa520";
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy + 6 * scale - i * 5 * scale,
            14 * scale,
            7 * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.strokeStyle = "#b8860b";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.fillStyle = "#8b6914";
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, cy - 2 * scale);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffff88";
        const sparkleOffset = animated ? Math.sin(t) * 2 : 0;
        ctx.beginPath();
        ctx.arc(
          cx - 12 * scale,
          cy - 10 * scale + sparkleOffset,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 12 * scale,
          cy - 8 * scale - sparkleOffset,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }
      case "reinforcements": {
        const positions = [
          { x: cx - 10 * scale, y: cy + 5 * scale },
          { x: cx + 10 * scale, y: cy + 5 * scale },
          { x: cx, y: cy - 5 * scale },
        ];
        positions.forEach((pos, i) => {
          const yOffset = animated ? Math.sin(t + i) * 2 : 0;
          ctx.fillStyle = i === 2 ? "#9966ff" : "#7744dd";
          ctx.beginPath();
          ctx.ellipse(
            pos.x,
            pos.y + 5 * scale + yOffset,
            6 * scale,
            8 * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#ffdbac";
          ctx.beginPath();
          ctx.arc(
            pos.x,
            pos.y - 4 * scale + yOffset,
            5 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#666";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y - 6 * scale + yOffset, 5 * scale, Math.PI, 0);
          ctx.fill();
        });
        ctx.shadowColor = "#9966ff";
        ctx.shadowBlur = 10 * scale;
        ctx.strokeStyle = "#9966ff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
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
  catapult: "#854d0e",
  warlock: "#7c3aed",
  crossbowman: "#78716c",
  hexer: "#ec4899",
  harpy: "#f97316",
  wyvern: "#22c55e",
  specter: "#06b6d4",
  berserker: "#ef4444",
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
            ctx.fillStyle = `rgba(74, 222, 128, ${
              0.5 + Math.sin(t * 3 + i) * 0.2
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

        // Possessed glowing eyes
        ctx.fillStyle = "#4ade80";
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 14 * scale - bounce,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 14 * scale - bounce,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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
            ctx.fillStyle = `rgba(96, 165, 250, ${
              0.4 + Math.sin(t * 2 + i) * 0.2
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
        ctx.fillStyle = "#3b82f6";
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 15 * scale - bounce,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 15 * scale - bounce,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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

        // Glowing spell orb in hand
        ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse})`;
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 11 * scale,
          cy + 2 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#dbeafe";
        ctx.beginPath();
        ctx.arc(
          cx + 11 * scale,
          cy + 2 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
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
        ctx.fillStyle = "#7c3aed";
        ctx.shadowColor = "#7c3aed";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale + twitch * 0.3,
          cy - 15.5 * scale - bounce,
          0.9 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale + twitch * 0.3,
          cy - 15.5 * scale - bounce,
          0.9 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
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
            ctx.fillStyle = `rgba(31, 41, 55, ${
              0.3 + Math.sin(t * 2 + i) * 0.1
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
        ctx.fillStyle = "#db2777";
        ctx.shadowColor = "#db2777";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 15 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 15 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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
            ctx.fillStyle = `rgba(254, 243, 199, ${
              0.7 + Math.sin(t + i) * 0.2
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
        // Dilated orange pupils
        ctx.fillStyle = "#fb923c";
        ctx.shadowColor = "#fb923c";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale + twitch,
          cy - 15 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale + twitch,
          cy - 15 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
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
            ctx.fillStyle = `rgba(254, 226, 226, ${
              0.6 + Math.sin(t * 2 + i) * 0.2
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

        // Glowing red eyes
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 5 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 16 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 16 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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
        // Magic spark
        ctx.fillStyle = `rgba(239, 68, 68, ${powerPulse})`;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(0, -6 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
            ctx.fillStyle = `rgba(126, 34, 206, ${
              0.5 + Math.sin(t * 2 + i) * 0.2
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
        // Power gem
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse})`;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

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
        // Power gem on top
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse})`;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
        ctx.fillStyle = "#a855f7";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 5 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 17 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 17 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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
            ctx.fillStyle = `rgba(251, 191, 36, ${
              0.7 + Math.sin(t * 2 + i) * 0.2
            })`;
            ctx.shadowColor = "#fbbf24";
            ctx.shadowBlur = 3 * scale;
            ctx.beginPath();
            ctx.ellipse(
              coinX,
              coinY,
              2 * scale,
              1.2 * scale,
              t + i,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
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
        // Golden hat band
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 3 * scale;
        ctx.fillRect(
          cx - 5 * scale,
          cy - 25 * scale - bounce,
          10 * scale,
          2 * scale
        );
        ctx.shadowBlur = 0;

        // Golden monocle
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 2.5 * scale,
          cy - 16 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5.5 * scale, cy - 16 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 8 * scale,
          cy - 14 * scale - bounce,
          cx + 9 * scale,
          cy - 10 * scale - bounce
        );
        ctx.stroke();
        ctx.shadowBlur = 0;

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
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 16 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 16 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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

        // Glowing eyes
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#22d3d3";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 12 * scale - bounce + floatOffset,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 12 * scale - bounce + floatOffset,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "archer": {
        // ARCHER STUDENT - Nimble ranged attacker with bow
        const drawPull = Math.sin(t * 2) * 0.1;

        // Green hood and cloak
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 10 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 9 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 10 * scale,
          cy - bounce,
          cx + 8 * scale,
          cy + 12 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Face
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hood
        ctx.fillStyle = "#047857";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 15 * scale - bounce,
          6 * scale,
          4 * scale,
          0,
          Math.PI,
          0
        );
        ctx.fill();

        // Focused eyes
        ctx.fillStyle = "#065f46";
        ctx.beginPath();
        ctx.ellipse(
          cx - 1.5 * scale,
          cy - 14 * scale - bounce,
          0.8 * scale,
          1.2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 1.5 * scale,
          cy - 14 * scale - bounce,
          0.8 * scale,
          1.2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Bow
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(cx + 10 * scale, cy - 2 * scale - bounce, 8 * scale, -0.7, 0.7);
        ctx.stroke();
        // Bowstring
        ctx.strokeStyle = "#a8a29e";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(
          cx + 10 * scale + Math.cos(-0.7) * 8 * scale,
          cy - 2 * scale - bounce + Math.sin(-0.7) * 8 * scale
        );
        ctx.lineTo(
          cx + 8 * scale - drawPull * 20 * scale,
          cy - 2 * scale - bounce
        );
        ctx.lineTo(
          cx + 10 * scale + Math.cos(0.7) * 8 * scale,
          cy - 2 * scale - bounce + Math.sin(0.7) * 8 * scale
        );
        ctx.stroke();

        // Arrow
        ctx.fillStyle = "#78350f";
        ctx.fillRect(
          cx + 6 * scale - drawPull * 18 * scale,
          cy - 2.5 * scale - bounce,
          8 * scale,
          1 * scale
        );
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(
          cx + 14 * scale - drawPull * 18 * scale,
          cy - 2 * scale - bounce
        );
        ctx.lineTo(
          cx + 16 * scale - drawPull * 18 * scale,
          cy - 2 * scale - bounce
        );
        ctx.lineTo(
          cx + 14 * scale - drawPull * 18 * scale,
          cy - 3 * scale - bounce
        );
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

        // Glowing purple eyes
        ctx.fillStyle = "#8b5cf6";
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 1.5 * scale,
          cy - 14 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 1.5 * scale,
          cy - 14 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Staff with glowing orb
        ctx.fillStyle = "#78350f";
        ctx.fillRect(
          cx + 10 * scale,
          cy - 10 * scale - bounce,
          2 * scale,
          20 * scale
        );
        ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse})`;
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 11 * scale,
          cy - 12 * scale - bounce + orbFloat,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "catapult": {
        // SIEGE ENGINE - Heavy war machine with trebuchet
        const armSwing = Math.sin(t * 1.5) * 0.1;
        const loadPulse = 0.5 + Math.sin(t * 2) * 0.3;

        // Wooden frame base
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 12 * scale - bounce);
        ctx.lineTo(cx - 12 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx + 12 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Wheels
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.arc(
          cx - 7 * scale,
          cy + 10 * scale - bounce,
          4 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 7 * scale,
          cy + 10 * scale - bounce,
          4 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(
          cx - 7 * scale,
          cy + 10 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 7 * scale,
          cy + 10 * scale - bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Trebuchet arm
        ctx.save();
        ctx.translate(cx, cy + 2 * scale - bounce);
        ctx.rotate(-0.5 + armSwing);
        ctx.fillStyle = "#92400e";
        ctx.fillRect(-2 * scale, -16 * scale, 4 * scale, 18 * scale);
        // Counterweight
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Projectile basket
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(0, -14 * scale, 3 * scale, 0, Math.PI);
        ctx.fill();
        // Glowing projectile
        ctx.fillStyle = `rgba(251, 146, 60, ${loadPulse})`;
        ctx.shadowColor = "#fb923c";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(0, -14 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Support frame
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 4 * scale - bounce);
        ctx.closePath();
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
        ctx.fillStyle = "#a855f7";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 5 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 15 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 15 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Magic orb in hand
        ctx.fillStyle = `rgba(168, 85, 247, ${voidPulse})`;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 10 * scale,
          cy + 2 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "crossbowman": {
        // CROSSBOWMAN - Armored ranged soldier
        const aimSway = Math.sin(t * 2) * 0.05;

        // Leather armor body
        const armorGrad = ctx.createLinearGradient(
          cx - 8 * scale,
          cy,
          cx + 8 * scale,
          cy
        );
        armorGrad.addColorStop(0, "#57534e");
        armorGrad.addColorStop(0.5, "#78716c");
        armorGrad.addColorStop(1, "#57534e");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 10 * scale,
          cy - bounce,
          cx - 5 * scale,
          cy - 9 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 10 * scale,
          cy - bounce,
          cx + 8 * scale,
          cy + 12 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Head with hood
        ctx.fillStyle = "#44403c";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e7e5e4";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Focused eyes
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(
          cx - 1.5 * scale,
          cy - 15 * scale - bounce,
          0.8 * scale,
          1.2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 1.5 * scale,
          cy - 15 * scale - bounce,
          0.8 * scale,
          1.2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Crossbow
        ctx.save();
        ctx.translate(cx + 8 * scale, cy - 2 * scale - bounce);
        ctx.rotate(aimSway);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-1 * scale, -2 * scale, 8 * scale, 4 * scale);
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -5 * scale);
        ctx.lineTo(0, 5 * scale);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case "hexer": {
        // HEXER - Pink curse witch with floating runes
        const hexPulse = 0.6 + Math.sin(t * 2) * 0.4;

        // Pink hex aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(236, 72, 153, ${hexPulse * 0.25})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dark witch robes
        ctx.fillStyle = "#581c87";
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

        // Witch hat
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx, cy - 28 * scale - bounce);
        ctx.lineTo(cx + 7 * scale, cy - 16 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(
          cx - 8 * scale,
          cy - 17 * scale - bounce,
          16 * scale,
          2 * scale
        );

        // Pale face
        ctx.fillStyle = "#fce7f3";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing pink eyes
        ctx.fillStyle = "#ec4899";
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 1.5 * scale,
          cy - 14 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 1.5 * scale,
          cy - 14 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case "harpy": {
        // HARPY - Winged creature with feathers
        const wingFlap = Math.sin(t * 8) * 0.4;

        // Wings
        ctx.save();
        ctx.translate(cx - 6 * scale, cy - 4 * scale - bounce);
        ctx.rotate(-0.5 - wingFlap);
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-8 * scale, -4 * scale, -12 * scale, 0);
        ctx.quadraticCurveTo(-8 * scale, 2 * scale, 0, 2 * scale);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 6 * scale, cy - 4 * scale - bounce);
        ctx.rotate(0.5 + wingFlap);
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8 * scale, -4 * scale, 12 * scale, 0);
        ctx.quadraticCurveTo(8 * scale, 2 * scale, 0, 2 * scale);
        ctx.fill();
        ctx.restore();

        // Feathered body
        ctx.fillStyle = "#ea580c";
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

        // Head
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Sharp eyes
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 13 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          -0.2,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2 * scale,
          cy - 13 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0.2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Beak
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 11 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy - 9 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "wyvern": {
        // WYVERN - Dragon-like creature
        const wingFlap = Math.sin(t * 6) * 0.35;
        const breathPulse = 0.5 + Math.sin(t * 3) * 0.3;

        // Large wings
        ctx.save();
        ctx.translate(cx - 5 * scale, cy - 2 * scale - bounce);
        ctx.rotate(-0.4 - wingFlap);
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10 * scale, -6 * scale, -14 * scale, 0);
        ctx.lineTo(-12 * scale, 3 * scale);
        ctx.lineTo(-8 * scale, 2 * scale);
        ctx.lineTo(-4 * scale, 4 * scale);
        ctx.lineTo(0, 2 * scale);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(cx + 5 * scale, cy - 2 * scale - bounce);
        ctx.rotate(0.4 + wingFlap);
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(10 * scale, -6 * scale, 14 * scale, 0);
        ctx.lineTo(12 * scale, 3 * scale);
        ctx.lineTo(8 * scale, 2 * scale);
        ctx.lineTo(4 * scale, 4 * scale);
        ctx.lineTo(0, 2 * scale);
        ctx.fill();
        ctx.restore();

        // Serpentine body
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 2 * scale - bounce,
          5 * scale,
          9 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Dragon head
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 12 * scale - bounce,
          5 * scale,
          4.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Glowing eyes
        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#fef08a";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * scale,
          cy - 13 * scale - bounce,
          1 * scale,
          1.3 * scale,
          -0.15,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2 * scale,
          cy - 13 * scale - bounce,
          1 * scale,
          1.3 * scale,
          0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Fire breath hint
        ctx.fillStyle = `rgba(251, 146, 60, ${breathPulse * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy - 5 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy - 5 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "specter": {
        // SPECTER - Ghostly floating entity
        const floatOffset = Math.sin(t * 2) * 3 * scale;
        const ghostPulse = 0.4 + Math.sin(t * 3) * 0.3;

        // Ethereal glow
        const glowGrad = ctx.createRadialGradient(
          cx,
          cy - 4 * scale,
          0,
          cx,
          cy - 4 * scale,
          14 * scale
        );
        glowGrad.addColorStop(0, `rgba(6, 182, 212, ${ghostPulse * 0.3})`);
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 4 * scale - bounce + floatOffset,
          14 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Ghostly body
        ctx.fillStyle = `rgba(6, 182, 212, ${0.5 + ghostPulse * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy + 10 * scale - bounce + floatOffset);
        ctx.quadraticCurveTo(
          cx - 5 * scale,
          cy + 14 * scale - bounce + floatOffset,
          cx - 3 * scale,
          cy + 10 * scale - bounce + floatOffset
        );
        ctx.quadraticCurveTo(
          cx,
          cy + 16 * scale - bounce + floatOffset,
          cx + 3 * scale,
          cy + 10 * scale - bounce + floatOffset
        );
        ctx.quadraticCurveTo(
          cx + 5 * scale,
          cy + 14 * scale - bounce + floatOffset,
          cx + 7 * scale,
          cy + 10 * scale - bounce + floatOffset
        );
        ctx.quadraticCurveTo(
          cx + 10 * scale,
          cy - bounce + floatOffset,
          cx + 6 * scale,
          cy - 10 * scale - bounce + floatOffset
        );
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale - bounce + floatOffset);
        ctx.quadraticCurveTo(
          cx - 10 * scale,
          cy - bounce + floatOffset,
          cx - 7 * scale,
          cy + 10 * scale - bounce + floatOffset
        );
        ctx.fill();

        // Hollow eyes
        ctx.fillStyle = "#0e7490";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale,
          cy - 6 * scale - bounce + floatOffset,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 6 * scale - bounce + floatOffset,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 6.5 * scale - bounce + floatOffset,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 6.5 * scale - bounce + floatOffset,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }
      case "berserker": {
        // BERSERKER - Raging warrior with battle fury
        const ragePulse = 0.6 + Math.sin(t * 4) * 0.4;
        const shake = animated ? Math.sin(t * 10) * scale * 0.5 : 0;

        // Rage aura
        const auraGrad = ctx.createRadialGradient(
          cx,
          cy - 2 * scale,
          0,
          cx,
          cy - 2 * scale,
          14 * scale
        );
        auraGrad.addColorStop(0, `rgba(239, 68, 68, ${ragePulse * 0.3})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(
          cx + shake,
          cy - 2 * scale - bounce,
          14 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Muscular body
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.ellipse(
          cx + shake,
          cy + 2 * scale - bounce,
          8 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Bare chest with scars
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.ellipse(
          cx + shake,
          cy - 2 * scale - bounce,
          5 * scale,
          6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale + shake, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 2 * scale + shake, cy + bounce - bounce);
        ctx.stroke();

        // Fierce head
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(
          cx + shake,
          cy - 12 * scale - bounce,
          5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Wild hair
        ctx.fillStyle = "#7c2d12";
        for (let i = 0; i < 6; i++) {
          const hairAngle = -Math.PI * 0.5 + i * Math.PI * 0.2 - 0.5;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(hairAngle) * 4 * scale + shake,
            cy - 15 * scale - bounce
          );
          ctx.lineTo(
            cx + Math.cos(hairAngle) * 7 * scale + shake,
            cy - 18 * scale - bounce + Math.sin(t * 3 + i) * scale
          );
          ctx.lineTo(
            cx + Math.cos(hairAngle + 0.2) * 4 * scale + shake,
            cy - 15 * scale - bounce
          );
          ctx.fill();
        }

        // Rage eyes
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale + shake,
          cy - 13 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale + shake,
          cy - 13 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Battle axe
        ctx.fillStyle = "#78350f";
        ctx.fillRect(
          cx + 9 * scale + shake,
          cy - 8 * scale - bounce,
          2 * scale,
          16 * scale
        );
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale + shake, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 14 * scale + shake,
          cy - 6 * scale - bounce,
          cx + 8 * scale + shake,
          cy - 2 * scale - bounce
        );
        ctx.fill();
        break;
      }
      case "golem": {
        // STONE GOLEM - Animated rock construct
        const rumble = animated ? Math.sin(t * 8) * 0.5 * scale : 0;
        const glowPulse = 0.5 + Math.sin(t * 2) * 0.3;

        // Massive stone body
        ctx.fillStyle = "#78716c";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale + rumble, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 11 * scale + rumble, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 6 * scale + rumble, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 6 * scale + rumble, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 11 * scale + rumble, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 10 * scale + rumble, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Stone texture lines
        ctx.strokeStyle = "#57534e";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale + rumble, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 4 * scale + rumble, cy + 2 * scale - bounce);
        ctx.moveTo(cx - 8 * scale + rumble, cy + 6 * scale - bounce);
        ctx.lineTo(cx + 6 * scale + rumble, cy + 8 * scale - bounce);
        ctx.stroke();

        // Boulder head
        ctx.fillStyle = "#a8a29e";
        ctx.beginPath();
        ctx.ellipse(
          cx + rumble,
          cy - 14 * scale - bounce,
          7 * scale,
          5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Glowing rune eyes
        ctx.fillStyle = `rgba(251, 146, 60, ${glowPulse})`;
        ctx.shadowColor = "#fb923c";
        ctx.shadowBlur = 5 * scale;
        ctx.beginPath();
        ctx.rect(
          cx - 4 * scale + rumble,
          cy - 15.5 * scale - bounce,
          2.5 * scale,
          1.5 * scale
        );
        ctx.rect(
          cx + 1.5 * scale + rumble,
          cy - 15.5 * scale - bounce,
          2.5 * scale,
          1.5 * scale
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rune on chest
        ctx.fillStyle = `rgba(251, 146, 60, ${glowPulse * 0.8})`;
        ctx.shadowColor = "#fb923c";
        ctx.shadowBlur = 4 * scale;
        ctx.font = `${5 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("ᚨ", cx + rumble, cy + 4 * scale - bounce);
        ctx.shadowBlur = 0;
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

        // Hollow glowing eyes
        ctx.fillStyle = "#22c55e";
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 5 * scale;
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
        ctx.shadowBlur = 0;

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
        ctx.fillStyle = "#818cf8";
        ctx.shadowColor = "#818cf8";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 2 * scale,
          cy - 14 * scale - bounce,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2 * scale,
          cy - 14 * scale - bounce,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

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
