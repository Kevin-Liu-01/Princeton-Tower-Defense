"use client";
import React, { useRef, useEffect, useState } from "react";
import type { TowerType, HeroType, SpellType } from "../types";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function darkenColor(color: string, amount: number): string {
  const hex = color?.replace("#", "");
  const r = Math.max(0, parseInt(hex?.substr(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex?.substr(2, 2), 16) - amount);
  const b = Math.max(0, parseInt(hex?.substr(4, 2), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function lightenColor(color: string, amount: number): string {
  const hex = color?.replace("#", "");
  const r = Math.min(255, parseInt(hex?.substr(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex?.substr(2, 2), 16) + amount);
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
        // Nassau Cannon - Artillery tower
        // Base platform
        ctx.fillStyle = "#4a4a4a";
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

        // Stone base
        ctx.fillStyle = "#5a5a5a";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 8 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 8 * scale);
        ctx.lineTo(cx + 14 * scale, cy + 10 * scale);
        ctx.closePath();
        ctx.fill();

        // Battlements
        ctx.fillStyle = "#6a6a6a";
        for (let i = -1; i <= 1; i += 2) {
          ctx.fillRect(
            cx + i * 8 * scale - 4 * scale,
            cy - 14 * scale,
            8 * scale,
            8 * scale
          );
        }

        // Turret base
        ctx.fillStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 6 * scale,
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
        ctx.translate(cx, cy - 6 * scale);
        ctx.rotate(-0.4);
        ctx.fillRect(0, -4 * scale, 22 * scale, 8 * scale);
        // Barrel rings
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(8 * scale, -5 * scale, 3 * scale, 10 * scale);
        ctx.fillRect(16 * scale, -5 * scale, 3 * scale, 10 * scale);
        // Muzzle
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(20 * scale, -5 * scale, 4 * scale, 10 * scale);
        ctx.restore();

        // Level stars
        if (level > 1) {
          ctx.fillStyle = "#ffd700";
          for (let i = 0; i < Math.min(level - 1, 3); i++) {
            drawStar(ctx, cx - 8 + i * 8, cy + 18 * scale, 3 * scale);
          }
        }
        break;
      }

      case "library": {
        // Firestone Library - Magic tower with gothic architecture
        // Shadow
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

        // Main building
        ctx.fillStyle = "#6b5344";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 6 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 6 * scale);
        ctx.lineTo(cx + 14 * scale, cy + 10 * scale);
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

        // Roof detail
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28 * scale);
        ctx.lineTo(cx + 16 * scale, cy - 6 * scale);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale);
        ctx.closePath();
        ctx.fill();

        // Gothic window (pointed arch)
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
        // Base
        ctx.fillStyle = "#2d4a5a";
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

        // Industrial building
        ctx.fillStyle = "#3d5a6b";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 10 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 10 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 12 * scale, cy + 10 * scale);
        ctx.closePath();
        ctx.fill();

        // Dome
        ctx.fillStyle = "#4d6a7b";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale, 10 * scale, Math.PI, 0);
        ctx.fill();

        // Tesla coil base
        ctx.fillStyle = "#2a3a4a";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 18 * scale,
          6 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
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

        // Pistons
        ctx.fillStyle = "#5a6a7a";
        const pistonExtend = animated ? Math.sin(t * 4) * 3 * scale : 0;
        ctx.fillRect(
          cx - 16 * scale,
          cy - 5 * scale + pistonExtend,
          4 * scale,
          12 * scale
        );
        ctx.fillRect(
          cx + 12 * scale,
          cy - 5 * scale - pistonExtend,
          4 * scale,
          12 * scale
        );
        break;
      }

      case "arch": {
        // Blair Arch - Sound/music tower
        // Foundation
        ctx.fillStyle = "#5b4b3f";
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

        // Right pillar
        ctx.fillRect(cx + 8 * scale, cy - 18 * scale, 8 * scale, 30 * scale);

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

        // Keystone
        ctx.fillStyle = "#9b8b75";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 28 * scale);
        ctx.lineTo(cx, cy - 32 * scale);
        ctx.lineTo(cx + 4 * scale, cy - 28 * scale);
        ctx.lineTo(cx + 3 * scale, cy - 24 * scale);
        ctx.lineTo(cx - 3 * scale, cy - 24 * scale);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case "club": {
        // Eating Club - Economy/buff tower
        // Shadow
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

        // Building
        ctx.fillStyle = "#2d6b2d";
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 12 * scale, cy - 4 * scale);
        ctx.lineTo(cx + 12 * scale, cy - 4 * scale);
        ctx.lineTo(cx + 14 * scale, cy + 10 * scale);
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

        // Dollar sign emblem
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 6 * scale;
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, cy - 12 * scale);
        ctx.shadowBlur = 0;

        // Coins at base
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.ellipse(
          cx - 8 * scale,
          cy + 8 * scale,
          4 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 8 * scale,
          cy + 8 * scale,
          4 * scale,
          2 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }

      case "station": {
        // Dinky Station - Troop spawner
        // Platform
        ctx.fillStyle = "#6b1a1a";
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

        // Station building
        ctx.fillStyle = "#8b2a2a";
        ctx.fillRect(cx - 16 * scale, cy - 2 * scale, 32 * scale, 16 * scale);

        // Roof
        ctx.fillStyle = "#6b0000";
        ctx.fillRect(cx - 18 * scale, cy - 8 * scale, 36 * scale, 8 * scale);

        // Roof overhang
        ctx.fillStyle = "#5b0000";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy - 8 * scale);
        ctx.lineTo(cx - 18 * scale, cy - 12 * scale);
        ctx.lineTo(cx + 18 * scale, cy - 12 * scale);
        ctx.lineTo(cx + 20 * scale, cy - 8 * scale);
        ctx.closePath();
        ctx.fill();

        // Door
        ctx.fillStyle = "#3a1a0a";
        ctx.fillRect(cx - 5 * scale, cy + 2 * scale, 10 * scale, 12 * scale);

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

        // Flag pole
        ctx.fillStyle = "#4a3020";
        ctx.fillRect(cx - 1 * scale, cy - 26 * scale, 2 * scale, 16 * scale);

        // Train tracks hint
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
// HERO SPRITES
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
    const bounce = animated ? Math.sin(time * 0.15) * 2 : 0;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18 * scale, 14 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body with gradient
    const bodyGrad = ctx.createRadialGradient(
      cx,
      cy + bounce,
      0,
      cx,
      cy + bounce,
      18 * scale
    );
    bodyGrad.addColorStop(0, lightenColor(color, 40));
    bodyGrad.addColorStop(0.6, color);
    bodyGrad.addColorStop(1, darkenColor(color, 50));
    ctx.fillStyle = bodyGrad;
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
    ctx.strokeStyle = darkenColor(color, 60);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Type-specific features
    switch (type) {
      case "tiger":
        // Tiger stripes
        ctx.strokeStyle = darkenColor(color, 60);
        ctx.lineWidth = 2.5 * scale;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + i * 6 * scale, cy - 2 * scale + bounce);
          ctx.lineTo(cx + i * 6 * scale, cy + 10 * scale + bounce);
          ctx.stroke();
        }
        // Ears
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          cx - 10 * scale,
          cy - 14 * scale + bounce,
          5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 10 * scale,
          cy - 14 * scale + bounce,
          5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Inner ears
        ctx.fillStyle = "#ffb6c1";
        ctx.beginPath();
        ctx.arc(
          cx - 10 * scale,
          cy - 14 * scale + bounce,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 10 * scale,
          cy - 14 * scale + bounce,
          2.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Face
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * scale + bounce, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.ellipse(
          cx - 4 * scale,
          cy - 7 * scale + bounce,
          2.5 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.ellipse(
          cx + 4 * scale,
          cy - 7 * scale + bounce,
          2.5 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Nose
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(cx, cy - 3 * scale + bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "mathey":
        // Roman helmet
        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale + bounce, 12 * scale, Math.PI, 0);
        ctx.fill();
        // Helmet crest
        ctx.fillStyle = "#ff6b6b";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 20 * scale + bounce,
          4 * scale,
          8 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Face
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale + bounce, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 3 * scale,
          cy - 5 * scale + bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 3 * scale,
          cy - 5 * scale + bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Shield
        ctx.fillStyle = "#4338ca";
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + bounce);
        ctx.lineTo(cx - 16 * scale, cy + 12 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy + bounce);
        ctx.closePath();
        ctx.fill();
        // Shield emblem
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(
          cx - 13 * scale,
          cy + 8 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;

      case "rocky":
        // Rock body texture
        ctx.fillStyle = "#5a5a5a";
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2 * scale;
        // Cracks
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale + i * 6 * scale, cy - 5 * scale + bounce);
          ctx.lineTo(cx - 8 * scale + i * 6 * scale, cy + 10 * scale + bounce);
          ctx.stroke();
        }
        // Face area
        ctx.fillStyle = "#6a6a6a";
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale + bounce, 9 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Glowing eyes
        ctx.fillStyle = "#ffaa00";
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(
          cx - 4 * scale,
          cy - 5 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4 * scale,
          cy - 5 * scale + bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        break;

      case "tenor":
        // Face
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * scale + bounce, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eyes (singing expression)
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 4 * scale,
          cy - 7 * scale + bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4 * scale,
          cy - 7 * scale + bounce,
          2 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Mouth (open, singing)
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy - 1 * scale + bounce,
          4 * scale,
          3 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Musical notes floating
        ctx.fillStyle = "#8b5cf6";
        ctx.font = `${12 * scale}px Arial`;
        const noteOffset = animated ? Math.sin(time * 0.1) * 3 : 0;
        ctx.fillText(
          "♪",
          cx - 14 * scale,
          cy - 12 * scale + bounce + noteOffset
        );
        ctx.fillText(
          "♫",
          cx + 8 * scale,
          cy - 16 * scale + bounce - noteOffset
        );
        // Microphone
        ctx.fillStyle = "#333";
        ctx.fillRect(
          cx + 12 * scale,
          cy - 4 * scale + bounce,
          3 * scale,
          14 * scale
        );
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(
          cx + 13.5 * scale,
          cy - 6 * scale + bounce,
          5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;

      case "scott":
        // Face
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * scale + bounce, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Glasses
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(
          cx - 5 * scale,
          cy - 7 * scale + bounce,
          4 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 5 * scale,
          cy - 7 * scale + bounce,
          4 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx - 1 * scale, cy - 7 * scale + bounce);
        ctx.lineTo(cx + 1 * scale, cy - 7 * scale + bounce);
        ctx.stroke();
        // Eyes behind glasses
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(
          cx - 5 * scale,
          cy - 7 * scale + bounce,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 5 * scale,
          cy - 7 * scale + bounce,
          1.5 * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
        // Quill pen
        ctx.fillStyle = "#14b8a6";
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 6 * scale + bounce);
        ctx.rotate(0.5);
        ctx.fillRect(-2 * scale, -18 * scale, 4 * scale, 22 * scale);
        // Feather tip
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(0, -18 * scale);
        ctx.lineTo(-4 * scale, -24 * scale);
        ctx.lineTo(4 * scale, -24 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Book
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(
          cx - 16 * scale,
          cy + 4 * scale + bounce,
          10 * scale,
          12 * scale
        );
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
          cx - 15 * scale,
          cy + 5 * scale + bounce,
          8 * scale,
          1.5 * scale
        );
        break;
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

        // Inner flame
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

        // Electric sparks
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

        // Snowflake arms
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((i * Math.PI) / 3 + (animated ? t * 0.5 : 0));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -14 * scale);
          // Branches
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

        // Center crystal
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      case "payday": {
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 12 * scale;

        // Coins stack
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

        // Dollar sign
        ctx.fillStyle = "#8b6914";
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, cy - 2 * scale);
        ctx.shadowBlur = 0;

        // Sparkles
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
        // Three soldiers in formation
        const positions = [
          { x: cx - 10 * scale, y: cy + 5 * scale },
          { x: cx + 10 * scale, y: cy + 5 * scale },
          { x: cx, y: cy - 5 * scale },
        ];

        positions.forEach((pos, i) => {
          const yOffset = animated ? Math.sin(t + i) * 2 : 0;
          // Body
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
          // Head
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
          // Helmet
          ctx.fillStyle = "#666";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y - 6 * scale + yOffset, 5 * scale, Math.PI, 0);
          ctx.fill();
        });

        // Glow effect
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
// ENEMY SPRITES
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
    const scale = size / 40;
    const color = ENEMY_COLORS[type];
    const bounce = animated ? Math.abs(Math.sin(time * 0.15)) * 3 : 0;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy + 2 * scale - bounce,
      10 * scale,
      12 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = darkenColor(color, 40);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Head
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.arc(cx, cy - 10 * scale - bounce, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (angry)
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(
      cx - 3 * scale,
      cy - 11 * scale - bounce,
      2 * scale,
      0,
      Math.PI * 2
    );
    ctx.arc(
      cx + 3 * scale,
      cy - 11 * scale - bounce,
      2 * scale,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Type-specific features
    switch (type) {
      case "frosh":
        // Beanie
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(cx, cy - 15 * scale - bounce, 6 * scale, Math.PI, 0);
        ctx.fill();
        // Propeller
        ctx.fillStyle = "#ffd700";
        ctx.save();
        ctx.translate(cx, cy - 20 * scale - bounce);
        ctx.rotate(animated ? time * 0.3 : 0);
        ctx.fillRect(-6 * scale, -1 * scale, 12 * scale, 2 * scale);
        ctx.restore();
        break;

      case "sophomore":
        // Backpack
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(
          cx - 12 * scale,
          cy - 4 * scale - bounce,
          6 * scale,
          12 * scale
        );
        break;

      case "junior":
        // Coffee cup
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(
          cx + 8 * scale,
          cy - 2 * scale - bounce,
          5 * scale,
          8 * scale
        );
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          cx + 9 * scale,
          cy - 1 * scale - bounce,
          3 * scale,
          2 * scale
        );
        break;

      case "senior":
        // Graduation cap
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(
          cx - 8 * scale,
          cy - 18 * scale - bounce,
          16 * scale,
          3 * scale
        );
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx, cy - 22 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 18 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        // Tassel
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy - 16 * scale - bounce);
        ctx.stroke();
        break;

      case "grad":
        // Lab coat
        ctx.fillStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx - 12 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 12 * scale, cy + 14 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 6 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        break;

      case "professor":
        // Glasses
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          cx - 4 * scale,
          cy - 11 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.arc(
          cx + 4 * scale,
          cy - 11 * scale - bounce,
          3 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx - 1 * scale, cy - 11 * scale - bounce);
        ctx.lineTo(cx + 1 * scale, cy - 11 * scale - bounce);
        ctx.stroke();
        // Bow tie
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 6 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 2 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        break;

      case "dean":
        // Crown
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 16 * scale - bounce);
        ctx.lineTo(cx - 8 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx, cy - 24 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 18 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy - 16 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        break;

      case "trustee":
        // Top hat
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(
          cx - 7 * scale,
          cy - 26 * scale - bounce,
          14 * scale,
          12 * scale
        );
        ctx.fillRect(
          cx - 10 * scale,
          cy - 16 * scale - bounce,
          20 * scale,
          3 * scale
        );
        // Gold band
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
          cx - 7 * scale,
          cy - 18 * scale - bounce,
          14 * scale,
          2 * scale
        );
        // Monocle
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          cx + 4 * scale,
          cy - 11 * scale - bounce,
          4 * scale,
          0,
          Math.PI * 2
        );
        ctx.moveTo(cx + 8 * scale, cy - 11 * scale - bounce);
        ctx.lineTo(cx + 12 * scale, cy - 5 * scale - bounce);
        ctx.stroke();
        break;
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

    // Background circle
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
      // Lock icon
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

    // Region-specific icon
    switch (type) {
      case "grassland":
        // Tree
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
        // Cactus
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(cx - 4 * scale, cy - 8 * scale, 8 * scale, 22 * scale);
        ctx.fillRect(cx - 14 * scale, cy - 4 * scale, 10 * scale, 6 * scale);
        ctx.fillRect(cx - 14 * scale, cy - 10 * scale, 6 * scale, 10 * scale);
        ctx.fillRect(cx + 4 * scale, cy, 10 * scale, 6 * scale);
        ctx.fillRect(cx + 8 * scale, cy - 8 * scale, 6 * scale, 12 * scale);
        // Sun
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx + 12 * scale, cy - 14 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "winter":
        // Snowflake
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
        // Volcano
        ctx.fillStyle = "#5d4037";
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, cy + 14 * scale);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale);
        ctx.lineTo(cx + 20 * scale, cy + 14 * scale);
        ctx.closePath();
        ctx.fill();
        // Lava
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
        // Smoke
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

    // Portcullis
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 2 * scale;
    for (let i = -15; i <= 15; i += 10) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale, cy + 50 * scale);
      ctx.lineTo(cx + i * scale, cy + 10 * scale);
      ctx.stroke();
    }

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

      // Conical roof
      ctx.fillStyle = "#8b4513";
      ctx.beginPath();
      ctx.moveTo(x - w / 2 - 5, y - h / 2);
      ctx.lineTo(x, y - h / 2 - w);
      ctx.lineTo(x + w / 2 + 5, y - h / 2);
      ctx.closePath();
      ctx.fill();

      // Battlements
      ctx.fillStyle = "#6a5a4a";
      const bw = w / 4;
      for (let i = -1.5; i <= 1.5; i++) {
        ctx.fillRect(x + i * bw - bw / 3, y - h / 2 - 5, bw * 0.6, 10);
      }
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

    // Banner
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(cx - 25 * scale, cy - 30 * scale);
    ctx.lineTo(cx + 25 * scale, cy - 30 * scale);
    ctx.lineTo(cx + 25 * scale, cy - 15 * scale);
    ctx.lineTo(cx, cy - 5 * scale);
    ctx.lineTo(cx - 25 * scale, cy - 15 * scale);
    ctx.closePath();
    ctx.fill();

    // Shield emblem
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 28 * scale);
    ctx.lineTo(cx - 8 * scale, cy - 22 * scale);
    ctx.lineTo(cx - 8 * scale, cy - 12 * scale);
    ctx.lineTo(cx, cy - 8 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 12 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 22 * scale);
    ctx.closePath();
    ctx.fill();
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
    const colors = ["#4ade80", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

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
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.arc(x, 18 - bounce, 8, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(x - 3, 16 - bounce, 2, 0, Math.PI * 2);
      ctx.arc(x + 3, 16 - bounce, 2, 0, Math.PI * 2);
      ctx.fill();

      // Weapon
      ctx.fillStyle = "#666";
      ctx.save();
      ctx.translate(x + 8, 25 - bounce);
      ctx.rotate(Math.sin(t * 2 + i) * 0.3);
      ctx.fillRect(-2, -20, 4, 25);
      ctx.fillStyle = "#aaa";
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(-5, -18);
      ctx.lineTo(5, -18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: 60 }} />;
};
