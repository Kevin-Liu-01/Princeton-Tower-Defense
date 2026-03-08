"use client";
import React, { useRef, useCallback } from "react";
import type { HeroType } from "../types";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";

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
  const renderHero = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupSpriteCanvas(canvas, size, size);
    if (!ctx) return;
    const cx = size / 2;
    let cy = size / 2;
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
        cy += 8 * scale;
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

        // === LEFT ARM WITH SHIELD ===
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 8 * scale + bounce);
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
        ctx.translate(cx + 14 * scale, cy - 8 * scale + bounce);
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

        // === M-SHIELD (held by left arm, overlapping body edge) ===
        ctx.save();
        ctx.translate(cx - 14 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.15);

        const shieldGrad = ctx.createLinearGradient(-7 * scale, -9 * scale, 7 * scale, 10 * scale);
        shieldGrad.addColorStop(0, "#4a7a8a");
        shieldGrad.addColorStop(0.3, "#5a9aaa");
        shieldGrad.addColorStop(0.6, "#4a8a9a");
        shieldGrad.addColorStop(1, "#3a6a7a");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -10 * scale);
        ctx.lineTo(-8 * scale, -6 * scale);
        ctx.lineTo(-8 * scale, 5 * scale);
        ctx.lineTo(0, 12 * scale);
        ctx.lineTo(8 * scale, 5 * scale);
        ctx.lineTo(8 * scale, -6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#b0c0d0";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // M emblem
        ctx.fillStyle = "#7acce0";
        ctx.shadowColor = "#7acce0";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(-5 * scale, 5 * scale);
        ctx.lineTo(-5 * scale, -3 * scale);
        ctx.lineTo(-2.5 * scale, -3 * scale);
        ctx.lineTo(0, 1.5 * scale);
        ctx.lineTo(2.5 * scale, -3 * scale);
        ctx.lineTo(5 * scale, -3 * scale);
        ctx.lineTo(5 * scale, 5 * scale);
        ctx.lineTo(3 * scale, 5 * scale);
        ctx.lineTo(3 * scale, 0);
        ctx.lineTo(0, 5 * scale);
        ctx.lineTo(-3 * scale, 0);
        ctx.lineTo(-3 * scale, 5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gauntlet gripping shield top
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(0, -8 * scale, 4 * scale, 3.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        ctx.restore();

        // === HAMMER (held by right arm, angled over shoulder) ===
        ctx.save();
        ctx.translate(cx + 13 * scale, cy + 2 * scale + bounce);
        ctx.rotate(0.25);

        // Wooden handle running through gauntlet
        ctx.fillStyle = "#8b6914";
        ctx.beginPath();
        ctx.roundRect(-1.8 * scale, -28 * scale, 3.6 * scale, 32 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#6b4904";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Gauntlet gripping the handle (mid-shaft)
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(0, -2 * scale, 4.5 * scale, 4 * scale, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Hammer head
        const hammerGrad = ctx.createLinearGradient(-7 * scale, -34 * scale, 7 * scale, -28 * scale);
        hammerGrad.addColorStop(0, "#2a3a5a");
        hammerGrad.addColorStop(0.3, "#4a5a7a");
        hammerGrad.addColorStop(0.5, "#6070a0");
        hammerGrad.addColorStop(0.7, "#4a5a7a");
        hammerGrad.addColorStop(1, "#2a3a5a");
        ctx.fillStyle = hammerGrad;
        ctx.beginPath();
        ctx.roundRect(-7 * scale, -36 * scale, 14 * scale, 10 * scale, 2 * scale);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Hammer face details
        ctx.fillStyle = "#3a4a6a";
        ctx.fillRect(-5 * scale, -34 * scale, 2 * scale, 6 * scale);
        ctx.fillRect(3 * scale, -34 * scale, 2 * scale, 6 * scale);
        ctx.restore();

        break;
      }
      case "rocky": {
        cy += 4 * scale;
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
        cy += 8 * scale;
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
        cy += 4 * scale;
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
        cy += 4 * scale;
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

        // === SWORD (held by right arm) ===
        ctx.save();
        ctx.translate(cx + 14 * scale, cy + 10 * scale + bounce);
        ctx.rotate(0.45);

        // Blade - silver with shine
        const bladeGrad = ctx.createLinearGradient(-1.5 * scale, 0, 1.5 * scale, 0);
        bladeGrad.addColorStop(0, "#8a9aaa");
        bladeGrad.addColorStop(0.5, "#d0e0f0");
        bladeGrad.addColorStop(1, "#8a9aaa");
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, -24 * scale);
        ctx.lineTo(0, -30 * scale);
        ctx.lineTo(1.5 * scale, -24 * scale);
        ctx.lineTo(1.5 * scale, -2 * scale);
        ctx.lineTo(-1.5 * scale, -2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#6a7a8a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Crossguard
        ctx.fillStyle = "#a0a8b0";
        ctx.beginPath();
        ctx.roundRect(-5 * scale, -3 * scale, 10 * scale, 3 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c0c8d0";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Red gems on crossguard
        ctx.fillStyle = "#cc3333";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        ctx.arc(-3.5 * scale, -1.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.arc(3.5 * scale, -1.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Handle grip
        ctx.fillStyle = "#6a2a1a";
        ctx.beginPath();
        ctx.roundRect(-1.8 * scale, 0, 3.6 * scale, 8 * scale, 1 * scale);
        ctx.fill();

        // Pommel
        ctx.fillStyle = "#a0a8b0";
        ctx.beginPath();
        ctx.arc(0, 10 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Gauntlet gripping the handle
        ctx.fillStyle = "#7a7a7a";
        ctx.beginPath();
        ctx.ellipse(0, 3 * scale, 4 * scale, 3.5 * scale, 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a0a8b0";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        ctx.restore();

        // === FLAG (held by left hand, pole upright) ===
        ctx.save();
        ctx.translate(cx - 12 * scale, cy + 14 * scale + bounce);
        ctx.rotate(-0.1);

        // Flag pole
        ctx.fillStyle = "#c0c8d0";
        ctx.fillRect(-1 * scale, -38 * scale, 2 * scale, 40 * scale);
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(-1 * scale, -38 * scale, 2 * scale, 40 * scale);

        // Pennant triangle pointing left
        ctx.fillStyle = "#cc2222";
        ctx.beginPath();
        ctx.moveTo(-1 * scale, -36 * scale);
        ctx.lineTo(-14 * scale, -30 * scale);
        ctx.lineTo(-1 * scale, -24 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#990000";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Gold finial on top
        ctx.fillStyle = "#d4aa00";
        ctx.beginPath();
        ctx.arc(0, -39 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#aa8800";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Gauntlet gripping the pole
        ctx.fillStyle = "#7a7a7a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 4 * scale, 3.5 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a0a8b0";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        ctx.restore();
        break;
      }
      case "engineer": {
        cy += 4 * scale;
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

        // Left arm - holding multimeter/device
        ctx.save();
        ctx.translate(cx - 13 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.4 + workMotion);

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

        // Device body (drawn before glove so glove overlaps it)
        ctx.fillStyle = "#2a2a3a";
        ctx.beginPath();
        ctx.roundRect(-3 * scale, 12 * scale, 6 * scale, 10 * scale, 1.5 * scale);
        ctx.fill();
        ctx.strokeStyle = "#1a1a2a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Device screen
        ctx.fillStyle = `rgba(50, 200, 150, ${0.6 + electricPulse * 0.4})`;
        ctx.shadowColor = "#32c896";
        ctx.shadowBlur = 3 * scale;
        ctx.fillRect(-2 * scale, 13 * scale, 4 * scale, 4 * scale);
        ctx.shadowBlur = 0;

        // Device antenna
        ctx.fillStyle = "#6a6a7a";
        ctx.fillRect(-0.5 * scale, 8 * scale, 1 * scale, 5 * scale);
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(0, 7.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Work glove gripping device (on top)
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 4.5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();

        // Electric spark from device
        if (sparkFlash) {
          ctx.strokeStyle = "#66ccff";
          ctx.shadowColor = "#66ccff";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-2 * scale, 22 * scale);
          ctx.lineTo(-4 * scale, 26 * scale);
          ctx.lineTo(-1 * scale, 24 * scale);
          ctx.lineTo(-3 * scale, 28 * scale);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // Right arm - holding wrench
        ctx.save();
        ctx.translate(cx + 13 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.15 - workMotion);

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

        // Wrench handle (drawn before glove, extends up from hand)
        ctx.fillStyle = "#6a6a7a";
        ctx.beginPath();
        ctx.roundRect(-1.5 * scale, 6 * scale, 3 * scale, 14 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#5a5a6a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Wrench jaw (open-end at bottom)
        ctx.fillStyle = "#7a7a8a";
        ctx.beginPath();
        ctx.moveTo(-3 * scale, 18 * scale);
        ctx.lineTo(-3 * scale, 22 * scale);
        ctx.lineTo(-0.5 * scale, 20 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(3 * scale, 18 * scale);
        ctx.lineTo(3 * scale, 22 * scale);
        ctx.lineTo(0.5 * scale, 20 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5a5a6a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Work glove gripping wrench (on top, at mid-handle)
        ctx.fillStyle = "#5a4a3a";
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 4.5 * scale, 4 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();

        // Electric spark from wrench
        if (sparkFlash) {
          ctx.strokeStyle = "#66ccff";
          ctx.shadowColor = "#66ccff";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(2 * scale, 28 * scale);
          ctx.lineTo(5 * scale, 30 * scale);
          ctx.lineTo(3 * scale, 32 * scale);
          ctx.lineTo(6 * scale, 36 * scale);
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
  }, [type, size, animated]);

  useSpriteTicker(animated, 50, renderHero);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
