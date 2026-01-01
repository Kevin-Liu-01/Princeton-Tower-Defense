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
  tiger: "#ff8c00",
  mathey: "#6366f1",
  rocky: "#78716c",
  tenor: "#8b5cf6",
  scott: "#14b8a6",
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
        bodyGrad.addColorStop(0.6, "#ff6600");
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
        ctx.shadowBlur = 6 * scale;
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
        // Knight armor body
        const armorGrad = ctx.createLinearGradient(
          cx - 14 * scale,
          cy,
          cx + 14 * scale,
          cy
        );
        armorGrad.addColorStop(0, "#6a6a7a");
        armorGrad.addColorStop(0.3, "#9a9aaa");
        armorGrad.addColorStop(0.5, "#cacaca");
        armorGrad.addColorStop(0.7, "#9a9aaa");
        armorGrad.addColorStop(1, "#6a6a7a");
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
        ctx.strokeStyle = "#4a4a5a";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Armor segments
        ctx.strokeStyle = "#5a5a6a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + bounce);
        ctx.lineTo(cx + 10 * scale, cy + bounce);
        ctx.moveTo(cx - 9 * scale, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 9 * scale, cy + 6 * scale + bounce);
        ctx.stroke();

        // Princeton crest
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx, cy + 8 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy + 2 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Helmet
        ctx.fillStyle = "#7a7a8a";
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
        // Visor
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(
          cx - 7 * scale,
          cy - 20 * scale + bounce,
          14 * scale,
          3 * scale
        );
        // Crest
        ctx.fillStyle = "#ff6b6b";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy - 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 28 * scale + bounce,
          3 * scale,
          6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Shield
        ctx.fillStyle = "#4338ca";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy + 8 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy + 12 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 4 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(
          cx - 14 * scale,
          cy + 4 * scale + bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
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
        // Tuxedo body
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

        // White shirt front
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 10 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Bow tie
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy - 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 16 * scale + bounce, 9 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Slicked back hair
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

        // Closed singing eyes
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

        // Singing mouth
        ctx.fillStyle = "#4a2020";
        const mouthSize = animated ? 3 + Math.sin(t * 1.5) * 0.5 : 3;
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

        // Musical notes
        if (animated) {
          ctx.fillStyle = `rgba(139, 92, 246, ${0.6 + Math.sin(t * 2) * 0.3})`;
          ctx.font = `${10 * scale}px Arial`;
          for (let i = 0; i < 2; i++) {
            const notePhase = (t * 0.5 + i * 0.5) % 1.5;
            const noteX =
              cx + 12 * scale + Math.sin(notePhase * Math.PI) * 5 * scale;
            const noteY = cy - 12 * scale - notePhase * 12 * scale + bounce;
            ctx.globalAlpha = Math.max(0, 1 - notePhase / 1.5);
            ctx.fillText(i % 2 === 0 ? "♪" : "♫", noteX, noteY);
          }
          ctx.globalAlpha = 1;
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
// ENEMY SPRITES - Matching rendering.ts human-like style
// =============================================================================
export type EnemyType =
  | "frosh"
  | "sophomore"
  | "junior"
  | "senior"
  | "grad"
  | "professor"
  | "dean"
  | "trustee";

export const ENEMY_COLORS: Record<EnemyType, string> = {
  frosh: "#4ade80",
  sophomore: "#60a5fa",
  junior: "#f472b6",
  senior: "#a78bfa",
  grad: "#fb923c",
  professor: "#ef4444",
  dean: "#8b5cf6",
  trustee: "#fbbf24",
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
        // Freshman - nervous student with hoodie and backpack
        // Backpack
        ctx.fillStyle = "#2255aa";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + 2 * scale - bounce,
          8 * scale,
          10 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Hoodie body
        const hoodieGrad = ctx.createLinearGradient(
          cx - 8 * scale,
          cy,
          cx + 8 * scale,
          cy
        );
        hoodieGrad.addColorStop(0, "#ff6600");
        hoodieGrad.addColorStop(0.5, "#ff8833");
        hoodieGrad.addColorStop(1, "#ff6600");
        ctx.fillStyle = hoodieGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 10 * scale,
          cy - 2 * scale - bounce,
          cx - 5 * scale,
          cy - 8 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 10 * scale,
          cy - 2 * scale - bounce,
          cx + 8 * scale,
          cy + 12 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();

        // Head (skin tone)
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Nervous big eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale,
          cy - 13 * scale - bounce,
          2.5 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 13 * scale - bounce,
          2.5 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Pupils (darting)
        const pupilOffset = animated ? Math.sin(t * 2) * 0.8 * scale : 0;
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale + pupilOffset,
          cy - 13 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale + pupilOffset,
          cy - 13 * scale - bounce,
          1.2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Worried eyebrows
        ctx.strokeStyle = "#5a3825";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4.5 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx - 0.5 * scale, cy - 15 * scale - bounce);
        ctx.moveTo(cx + 4.5 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx + 0.5 * scale, cy - 15 * scale - bounce);
        ctx.stroke();

        // Small frown
        ctx.strokeStyle = "#8b6655";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 8 * scale - bounce,
          2 * scale,
          0.2 * Math.PI,
          0.8 * Math.PI
        );
        ctx.stroke();

        // Lanyard
        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale, cy + 4 * scale - bounce);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          cx - 3 * scale,
          cy + 2 * scale - bounce,
          4 * scale,
          5 * scale
        );
        break;
      }

      case "sophomore": {
        // Confident student with coffee
        // Body (casual shirt)
        const shirtGrad = ctx.createLinearGradient(
          cx,
          cy - 8 * scale,
          cx,
          cy + 12 * scale
        );
        shirtGrad.addColorStop(0, "#4a90d9");
        shirtGrad.addColorStop(1, "#3a70b9");
        ctx.fillStyle = shirtGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 12 * scale - bounce);
        ctx.lineTo(cx - 9 * scale, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy - 10 * scale - bounce,
          cx + 9 * scale,
          cy - 4 * scale - bounce
        );
        ctx.lineTo(cx + 8 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Jeans hint
        ctx.fillStyle = "#3a5a8a";
        ctx.fillRect(
          cx - 5 * scale,
          cy + 8 * scale - bounce,
          4 * scale,
          6 * scale
        );
        ctx.fillRect(
          cx + 1 * scale,
          cy + 8 * scale - bounce,
          4 * scale,
          6 * scale
        );

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Messy hair
        ctx.fillStyle = "#4a3728";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 17 * scale - bounce,
          6 * scale,
          3.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        for (let i = 0; i < 4; i++) {
          const angle = -0.5 + i * 0.35;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(angle) * 4 * scale,
            cy - 18 * scale - bounce
          );
          ctx.lineTo(
            cx + Math.cos(angle) * 6 * scale,
            cy - 22 * scale - bounce + Math.sin(t + i) * 1
          );
          ctx.lineWidth = 1.5 * scale;
          ctx.strokeStyle = "#4a3728";
          ctx.stroke();
        }

        // Confident eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale,
          cy - 13 * scale - bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 13 * scale - bounce,
          2 * scale,
          2.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#2a5a3a";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 13 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 13 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Smirk
        ctx.strokeStyle = "#8b6655";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 0.5 * scale,
          cy - 9 * scale - bounce,
          2 * scale,
          0.9 * Math.PI,
          0.1 * Math.PI,
          true
        );
        ctx.stroke();

        // Coffee cup
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          cx + 10 * scale,
          cy - 2 * scale - bounce,
          4 * scale,
          6 * scale
        );
        ctx.fillStyle = "#6b4423";
        ctx.fillRect(
          cx + 10 * scale,
          cy - 0.5 * scale - bounce,
          4 * scale,
          2 * scale
        );
        break;
      }

      case "junior": {
        // Stressed academic with glasses and books
        // Stack of books
        const bookColors = ["#8b0000", "#00008b", "#006400"];
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = bookColors[i];
          ctx.fillRect(
            cx - 11 * scale,
            cy - 2 * scale - bounce + i * 2 * scale,
            7 * scale,
            1.8 * scale
          );
        }

        // Body (button-up)
        ctx.fillStyle = "#f5f5dc";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy + 12 * scale - bounce);
        ctx.lineTo(cx - 8 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 7 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glasses
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.rect(
          cx - 5 * scale,
          cy - 15 * scale - bounce,
          4 * scale,
          3 * scale
        );
        ctx.rect(
          cx + 1 * scale,
          cy - 15 * scale - bounce,
          4 * scale,
          3 * scale
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 1 * scale, cy - 13.5 * scale - bounce);
        ctx.lineTo(cx + 1 * scale, cy - 13.5 * scale - bounce);
        ctx.stroke();

        // Tired eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale,
          cy - 13.5 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale,
          cy - 13.5 * scale - bounce,
          1.2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 13.5 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 13.5 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Dark circles
        ctx.fillStyle = "rgba(100, 80, 120, 0.4)";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale,
          cy - 11 * scale - bounce,
          1.5 * scale,
          0.6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale,
          cy - 11 * scale - bounce,
          1.5 * scale,
          0.6 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Disheveled hair
        ctx.fillStyle = "#3a2a1a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 17 * scale - bounce,
          6 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        const stressTwitch = animated ? Math.sin(t * 2.5) * 0.8 : 0;
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale + stressTwitch, cy - 19 * scale - bounce);
        ctx.lineTo(cx - 5 * scale + stressTwitch, cy - 23 * scale - bounce);
        ctx.moveTo(cx + 2 * scale, cy - 19 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 22 * scale - bounce);
        ctx.stroke();
        break;
      }

      case "senior": {
        // Confident senior with blazer
        // Body (blazer)
        const blazerGrad = ctx.createLinearGradient(
          cx - 9 * scale,
          cy,
          cx + 9 * scale,
          cy
        );
        blazerGrad.addColorStop(0, "#1a1a2e");
        blazerGrad.addColorStop(0.5, "#2a2a4e");
        blazerGrad.addColorStop(1, "#1a1a2e");
        ctx.fillStyle = blazerGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Tie
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale, cy + 6 * scale - bounce);
        ctx.lineTo(cx, cy + 8 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy + 6 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Styled hair
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 19 * scale - bounce,
          6 * scale,
          3 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 17 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 7 * scale,
          cy - 22 * scale - bounce,
          cx - 3 * scale,
          cy - 23 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx,
          cy - 21 * scale - bounce,
          cx + 3 * scale,
          cy - 20 * scale - bounce
        );
        ctx.lineTo(cx + 5 * scale, cy - 17 * scale - bounce);
        ctx.fill();

        // Confident eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale,
          cy - 15 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 15 * scale - bounce,
          1.5 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#2a4a2a";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 15 * scale - bounce,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale,
          cy - 15 * scale - bounce,
          0.8 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Confident smirk
        ctx.strokeStyle = "#8b6655";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 11 * scale - bounce,
          2 * scale,
          0.1 * Math.PI,
          0.9 * Math.PI
        );
        ctx.stroke();

        // Diploma
        ctx.fillStyle = "#f5f5dc";
        ctx.save();
        ctx.translate(cx + 11 * scale, cy + 2 * scale - bounce);
        ctx.rotate(0.3);
        ctx.fillRect(-1.5 * scale, -5 * scale, 3 * scale, 10 * scale);
        ctx.fillStyle = "#8b0000";
        ctx.fillRect(-2 * scale, -5 * scale, 4 * scale, 1 * scale);
        ctx.restore();
        break;
      }

      case "grad": {
        // Exhausted grad student with lab coat
        const exhaustion = animated ? Math.sin(t * 0.5) * 1.5 : 0;

        // Body
        ctx.fillStyle = "#6a8a9a";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 9 * scale, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(
          cx,
          cy - 10 * scale - bounce,
          cx + 9 * scale,
          cy - 4 * scale - bounce
        );
        ctx.lineTo(cx + 8 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Lab coat sides
        ctx.fillStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 2 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 9 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 2 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(
          cx + exhaustion * 0.3,
          cy - 13 * scale - bounce,
          7 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Messy hair
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.ellipse(
          cx + exhaustion * 0.3,
          cy - 18 * scale - bounce,
          7 * scale,
          3.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(
            cx - 5 * scale + i * 2.5 * scale + exhaustion * 0.3,
            cy - 20 * scale - bounce
          );
          ctx.lineTo(
            cx -
              6 * scale +
              i * 2.5 * scale +
              Math.sin(t + i) * 1 +
              exhaustion * 0.3,
            cy - 24 * scale - bounce
          );
          ctx.lineWidth = 1.2 * scale;
          ctx.strokeStyle = "#5a4a3a";
          ctx.stroke();
        }

        // Very tired eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale + exhaustion * 0.3,
          cy - 14 * scale - bounce,
          2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale + exhaustion * 0.3,
          cy - 14 * scale - bounce,
          2 * scale,
          1.5 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#8b7b6b";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale + exhaustion * 0.3,
          cy - 14 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 2.5 * scale + exhaustion * 0.3,
          cy - 14 * scale - bounce,
          0.7 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Heavy dark circles
        ctx.fillStyle = "rgba(80, 60, 100, 0.5)";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale + exhaustion * 0.3,
          cy - 11.5 * scale - bounce,
          2 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale + exhaustion * 0.3,
          cy - 11.5 * scale - bounce,
          2 * scale,
          1 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Large coffee cup
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          cx + 9 * scale,
          cy - 6 * scale - bounce,
          4 * scale,
          8 * scale
        );
        ctx.fillStyle = "#4a3020";
        ctx.fillRect(
          cx + 9 * scale,
          cy - 4 * scale - bounce,
          4 * scale,
          3 * scale
        );
        break;
      }

      case "professor": {
        // Distinguished professor with tweed
        // Body (tweed jacket)
        ctx.fillStyle = "#6a5a4a";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 3 * scale - bounce);
        ctx.lineTo(cx, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 3 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Elbow patches
        ctx.fillStyle = "#8b7b6b";
        ctx.beginPath();
        ctx.ellipse(
          cx - 10 * scale,
          cy + 2 * scale - bounce,
          2.5 * scale,
          3.5 * scale,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 10 * scale,
          cy + 2 * scale - bounce,
          2.5 * scale,
          3.5 * scale,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Bow tie
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy - 4 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy - 4 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Gray hair (balding)
        ctx.fillStyle = "#9a9a9a";
        ctx.beginPath();
        ctx.arc(
          cx - 5 * scale,
          cy - 17 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 5 * scale,
          cy - 17 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Glasses
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.3 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 15 * scale - bounce,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 15 * scale - bounce,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx - 0.5 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 0.5 * scale, cy - 15 * scale - bounce);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 15 * scale - bounce,
          0.9 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 15 * scale - bounce,
          0.9 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Stern mouth
        ctx.strokeStyle = "#8b6655";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy - 10 * scale - bounce);
        ctx.stroke();
        break;
      }

      case "dean": {
        // Important dean with robes and crown
        // Body (formal robes)
        const robeGrad = ctx.createLinearGradient(
          cx - 10 * scale,
          cy,
          cx + 10 * scale,
          cy
        );
        robeGrad.addColorStop(0, "#4a1a6a");
        robeGrad.addColorStop(0.5, "#6a2a8a");
        robeGrad.addColorStop(1, "#4a1a6a");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 11 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 11 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Gold trim
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Silver hair
        ctx.fillStyle = "#c0c0c0";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 19 * scale - bounce,
          6 * scale,
          3 * scale,
          0,
          0,
          Math.PI
        );
        ctx.fill();

        // Crown
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 20 * scale - bounce);
        ctx.lineTo(cx - 5 * scale, cy - 24 * scale - bounce);
        ctx.lineTo(cx - 2.5 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx, cy - 26 * scale - bounce);
        ctx.lineTo(cx + 2.5 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 24 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 20 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Jewel
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(cx, cy - 23.5 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Stern eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.ellipse(
          cx - 2.5 * scale,
          cy - 15 * scale - bounce,
          1.3 * scale,
          1.8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 2.5 * scale,
          cy - 15 * scale - bounce,
          1.3 * scale,
          1.8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Disapproving frown
        ctx.strokeStyle = "#8b6655";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy - 10 * scale - bounce,
          2 * scale,
          0.2 * Math.PI,
          0.8 * Math.PI
        );
        ctx.stroke();
        break;
      }

      case "trustee": {
        // Wealthy trustee with top hat
        // Body (fine suit)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Gold vest
        ctx.fillStyle = "#daa520";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy + 10 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy + 10 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 8 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Top hat
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(
          cx - 6 * scale,
          cy - 26 * scale - bounce,
          12 * scale,
          10 * scale
        );
        ctx.fillRect(
          cx - 8 * scale,
          cy - 18 * scale - bounce,
          16 * scale,
          2 * scale
        );
        // Gold band
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
          cx - 6 * scale,
          cy - 20 * scale - bounce,
          12 * scale,
          2 * scale
        );

        // Monocle
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(
          cx + 3 * scale,
          cy - 15 * scale - bounce,
          3.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx + 6.5 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 10 * scale - bounce);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 2.5 * scale,
          cy - 15 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 15 * scale - bounce,
          1 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Mustache
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 6 * scale,
          cy - 11 * scale - bounce,
          cx - 5 * scale,
          cy - 9 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx,
          cy - 10 * scale - bounce,
          cx + 5 * scale,
          cy - 9 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 6 * scale,
          cy - 11 * scale - bounce,
          cx + 4 * scale,
          cy - 10 * scale - bounce
        );
        ctx.closePath();
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

      // Body (shirt)
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(x, 35 - bounce, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head (skin tone)
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
