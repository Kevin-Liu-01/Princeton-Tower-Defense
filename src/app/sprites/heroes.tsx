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
    let cy = size * 0.48;
    const scale = size / 72;
    const t = time * 0.08;
    const bounce = animated ? Math.sin(t) * 1.5 : 0;
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16 * scale, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    switch (type) {
      case "tiger": {
        cy += 6 * scale;
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

        ctx.fillStyle = "#2a2020";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        const leftFlameGrad = ctx.createRadialGradient(0, 2 * scale, 4 * scale, 0, 2 * scale, 14 * scale);
        leftFlameGrad.addColorStop(0, "#ff7020");
        leftFlameGrad.addColorStop(0.5, "#e04010");
        leftFlameGrad.addColorStop(1, "#a02000");
        ctx.fillStyle = leftFlameGrad;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1a1515";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#b06030";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

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

        ctx.fillStyle = "#2a2020";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        const rightFlameGrad = ctx.createRadialGradient(0, 2 * scale, 4 * scale, 0, 2 * scale, 14 * scale);
        rightFlameGrad.addColorStop(0, "#ff7020");
        rightFlameGrad.addColorStop(0.5, "#e04010");
        rightFlameGrad.addColorStop(1, "#a02000");
        ctx.fillStyle = rightFlameGrad;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1a1515";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#b06030";
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

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

        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-5 * scale, -2 * scale, 10 * scale, 14 * scale, 3 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

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

        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-5 * scale, -2 * scale, 10 * scale, 14 * scale, 3 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        ctx.fillStyle = "#a05828";
        ctx.beginPath();
        ctx.roundRect(-4 * scale, 10 * scale, 8 * scale, 8 * scale, 2 * scale);
        ctx.fill();
        ctx.strokeStyle = "#c07848";
        ctx.stroke();
        ctx.restore();

        // === ARMOR SKIRT (PTERUGES/TASSETS) - V shape ===
        for (let i = 0; i < 5; i++) {
          const plateX = cx + (-10 + i * 5) * scale;
          const distFromCenter = Math.abs(-10 + i * 5);
          const vDrop = (10 - distFromCenter) * 0.4 * scale;
          const plateY = cy + 14 * scale + bounce + vDrop;
          const plateH = 7 * scale + vDrop * 0.5;
          const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
          plateGrad.addColorStop(0, "#c07848");
          plateGrad.addColorStop(1, "#a05828");
          ctx.fillStyle = plateGrad;
          ctx.beginPath();
          ctx.moveTo(plateX - 2 * scale, plateY);
          ctx.lineTo(plateX + 2 * scale, plateY);
          ctx.lineTo(plateX + 1.5 * scale, plateY + plateH);
          ctx.lineTo(plateX - 1.5 * scale, plateY + plateH);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#6a3818";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
        }

        // === MAIN ARMOR BODY ===
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

        // Tiger-stripe decorative patterns on armor (clipped to body)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 16 * scale + bounce);
        ctx.closePath();
        ctx.clip();

        ctx.strokeStyle = "#c06020";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 6 * scale + bounce);
        ctx.quadraticCurveTo(cx - 8 * scale, cy + 2 * scale + bounce, cx - 10 * scale, cy + 10 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 10 * scale, cy - 6 * scale + bounce);
        ctx.quadraticCurveTo(cx + 8 * scale, cy + 2 * scale + bounce, cx + 10 * scale, cy + 10 * scale + bounce);
        ctx.stroke();

        ctx.strokeStyle = "#3a2010";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy - 4 * scale + bounce);
        ctx.quadraticCurveTo(cx - 9 * scale, cy + 3 * scale + bounce, cx - 11 * scale, cy + 12 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 11 * scale, cy - 4 * scale + bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy + 3 * scale + bounce, cx + 11 * scale, cy + 12 * scale + bounce);
        ctx.stroke();
        ctx.restore();

        // Bronze ornamental trim lines on chest armor
        ctx.strokeStyle = "#c07848";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 2 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 8 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy + 8 * scale + bounce);
        ctx.stroke();

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

        // Red gem accents on body (matching shoulder gems)
        ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx - 8 * scale, cy - 8 * scale + bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 8 * scale, cy - 8 * scale + bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + 10 * scale + bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === BRONZE BELT / WAIST GUARD ===
        const beltGrad = ctx.createLinearGradient(cx - 13 * scale, cy + 12 * scale + bounce, cx + 13 * scale, cy + 12 * scale + bounce);
        beltGrad.addColorStop(0, "#8a4820");
        beltGrad.addColorStop(0.5, "#c07848");
        beltGrad.addColorStop(1, "#8a4820");
        ctx.fillStyle = beltGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 13 * scale, cy + 12 * scale + bounce, 26 * scale, 4 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#6a3818";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy + 14 * scale + bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === GORGET (NECK GUARD) ===
        ctx.save();
        const gorgetGrad = ctx.createLinearGradient(cx - 11 * scale, cy - 13 * scale + bounce, cx + 11 * scale, cy - 13 * scale + bounce);
        gorgetGrad.addColorStop(0, "#8a4820");
        gorgetGrad.addColorStop(0.5, "#c07848");
        gorgetGrad.addColorStop(1, "#8a4820");
        ctx.fillStyle = gorgetGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 13 * scale + bounce, 11 * scale, 3 * scale, 0, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();
        ctx.restore();

        // === TIGER HEAD ===
        // Main head shape - vibrant orange fur
        ctx.fillStyle = "#e86a10";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20 * scale + bounce, 12 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // === TIGER HELMET / CROWN ===
        // Brow guard / visor across forehead
        const browGrad = ctx.createLinearGradient(cx - 13 * scale, cy - 24 * scale + bounce, cx + 13 * scale, cy - 24 * scale + bounce);
        browGrad.addColorStop(0, "#b06030");
        browGrad.addColorStop(0.5, "#d08050");
        browGrad.addColorStop(1, "#b06030");
        ctx.fillStyle = browGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 13 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx + 13 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx + 11 * scale, cy - 21 * scale + bounce);
        ctx.lineTo(cx - 11 * scale, cy - 21 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Left cheek guard
        const leftCheekGrad = ctx.createLinearGradient(cx - 14 * scale, cy - 24 * scale + bounce, cx - 10 * scale, cy - 14 * scale + bounce);
        leftCheekGrad.addColorStop(0, "#d08050");
        leftCheekGrad.addColorStop(1, "#b06030");
        ctx.fillStyle = leftCheekGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 13 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx - 12 * scale, cy - 13 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy - 14 * scale + bounce);
        ctx.lineTo(cx - 11 * scale, cy - 21 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Right cheek guard
        const rightCheekGrad = ctx.createLinearGradient(cx + 14 * scale, cy - 24 * scale + bounce, cx + 10 * scale, cy - 14 * scale + bounce);
        rightCheekGrad.addColorStop(0, "#d08050");
        rightCheekGrad.addColorStop(1, "#b06030");
        ctx.fillStyle = rightCheekGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 13 * scale, cy - 24 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 18 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy - 13 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 11 * scale, cy - 21 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Raised bronze ridge / crest on top of helmet
        const crestGrad = ctx.createLinearGradient(cx, cy - 36 * scale + bounce, cx, cy - 26 * scale + bounce);
        crestGrad.addColorStop(0, "#d08050");
        crestGrad.addColorStop(1, "#b06030");
        ctx.fillStyle = crestGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 2.5 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 1 * scale, cy - 36 * scale + bounce);
        ctx.lineTo(cx + 1 * scale, cy - 36 * scale + bounce);
        ctx.lineTo(cx + 2.5 * scale, cy - 26 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d08050";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Tiger ears (poking through helmet)
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
        cy += 6 * scale;
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const eyeGlow = 0.7 + Math.sin(t * 3) * 0.3;
        const capeWave = animated ? Math.sin(t * 2) * 0.06 : 0;

        // Cyan/teal magical aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * scale);
        auraGrad.addColorStop(0, `rgba(100, 200, 220, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.6, `rgba(70, 150, 180, ${auraPulse * 0.12})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 24 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === LARGE SQUARE CAPE (behind body) ===
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);
        ctx.rotate(capeWave);

        const capeW = 24 * scale;
        const capeH = 36 * scale;
        const capeBottomWave = animated ? Math.sin(t * 2.5) * 1.5 * scale : 0;
        const capeSideWave = animated ? Math.sin(t * 2) * 1 * scale : 0;

        // Main cape body - wide rectangular shape
        const capeGrad = ctx.createLinearGradient(0, -6 * scale, 0, capeH);
        capeGrad.addColorStop(0, "#2a3a70");
        capeGrad.addColorStop(0.15, "#1a2a58");
        capeGrad.addColorStop(0.4, "#3040a0");
        capeGrad.addColorStop(0.7, "#2838a0");
        capeGrad.addColorStop(0.85, "#1a2870");
        capeGrad.addColorStop(1, "#0e1840");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(-12 * scale, -6 * scale);
        ctx.lineTo(-capeW / 2 + capeSideWave, 4 * scale);
        ctx.lineTo(-capeW / 2 - 1 * scale + capeSideWave, capeH - 2 * scale + capeBottomWave);
        ctx.lineTo(-capeW / 2 + 2 * scale, capeH + capeBottomWave);
        ctx.lineTo(capeW / 2 - 2 * scale, capeH - capeBottomWave);
        ctx.lineTo(capeW / 2 + 1 * scale - capeSideWave, capeH - 2 * scale - capeBottomWave);
        ctx.lineTo(capeW / 2 - capeSideWave, 4 * scale);
        ctx.lineTo(12 * scale, -6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0a1530";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Cape inner shadow panel (depth)
        const innerGrad = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, capeH);
        innerGrad.addColorStop(0, "rgba(10, 15, 40, 0.3)");
        innerGrad.addColorStop(0.5, "rgba(30, 40, 80, 0.15)");
        innerGrad.addColorStop(1, "rgba(10, 15, 30, 0.35)");
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.moveTo(-6 * scale, 0);
        ctx.lineTo(-8 * scale, capeH - 4 * scale);
        ctx.lineTo(8 * scale, capeH - 4 * scale);
        ctx.lineTo(6 * scale, 0);
        ctx.closePath();
        ctx.fill();

        // Vertical fold lines
        ctx.strokeStyle = "#1a2868";
        ctx.lineWidth = 0.7 * scale;
        const foldXs = [-8, -3, 3, 8];
        for (const fx of foldXs) {
          const fWave = animated ? Math.sin(t * 2.2 + fx * 0.4) * 0.6 * scale : 0;
          ctx.beginPath();
          ctx.moveTo(fx * scale, -2 * scale);
          ctx.lineTo((fx + 0.3) * scale + fWave, capeH - 6 * scale);
          ctx.stroke();
        }

        // Silver trim on ALL four edges
        ctx.strokeStyle = "#a0b0d0";
        ctx.lineWidth = 1.4 * scale;
        // Left edge
        ctx.beginPath();
        ctx.moveTo(-12 * scale, -6 * scale);
        ctx.lineTo(-capeW / 2 + capeSideWave, 4 * scale);
        ctx.lineTo(-capeW / 2 - 1 * scale + capeSideWave, capeH - 2 * scale + capeBottomWave);
        ctx.lineTo(-capeW / 2 + 2 * scale, capeH + capeBottomWave);
        ctx.stroke();
        // Right edge
        ctx.beginPath();
        ctx.moveTo(12 * scale, -6 * scale);
        ctx.lineTo(capeW / 2 - capeSideWave, 4 * scale);
        ctx.lineTo(capeW / 2 + 1 * scale - capeSideWave, capeH - 2 * scale - capeBottomWave);
        ctx.lineTo(capeW / 2 - 2 * scale, capeH - capeBottomWave);
        ctx.stroke();
        // Bottom edge
        ctx.beginPath();
        ctx.moveTo(-capeW / 2 + 2 * scale, capeH + capeBottomWave);
        ctx.lineTo(capeW / 2 - 2 * scale, capeH - capeBottomWave);
        ctx.stroke();
        // Top clasp edge
        ctx.strokeStyle = "#b0c0e0";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(-12 * scale, -6 * scale);
        ctx.lineTo(12 * scale, -6 * scale);
        ctx.stroke();

        // Corner clasps
        ctx.fillStyle = "#90a0c8";
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(sx * 11 * scale, -5 * scale, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // === LEFT ARM WITH SHIELD ===
        ctx.save();
        ctx.translate(cx - 18 * scale, cy - 8 * scale + bounce);
        ctx.rotate(-0.3);

        // Large layered pauldron
        const lpOuterGrad = ctx.createRadialGradient(-2 * scale, -1 * scale, 0, -2 * scale, 0, 12 * scale);
        lpOuterGrad.addColorStop(0, "#5a6ab0");
        lpOuterGrad.addColorStop(0.5, "#4a5a9a");
        lpOuterGrad.addColorStop(1, "#2a3a5a");
        ctx.fillStyle = lpOuterGrad;
        ctx.beginPath();
        ctx.ellipse(-2 * scale, 0, 10 * scale, 7 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();
        // Inner ridge
        ctx.fillStyle = "#4a5a90";
        ctx.beginPath();
        ctx.ellipse(-2 * scale, -0.5 * scale, 7 * scale, 4.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Center gem
        ctx.fillStyle = `rgba(100, 220, 255, ${eyeGlow})`;
        ctx.shadowColor = "#64e0ff";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(-2 * scale, -0.5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Rivets around edge
        ctx.fillStyle = "#90a0c8";
        for (let r = 0; r < 5; r++) {
          const rAngle = (r / 5) * Math.PI * 2 - 0.2;
          ctx.beginPath();
          ctx.arc(-2 * scale + Math.cos(rAngle) * 8 * scale, Math.sin(rAngle) * 5.5 * scale, 0.7 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Upper arm
        ctx.fillStyle = "#3a4a7a";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 8 * scale, 5.5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a5a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Gauntlet
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(-2 * scale, 16 * scale, 5 * scale, 5.5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.stroke();
        ctx.restore();

        // === MAIN ARMOR BODY (enlarged) ===
        const armorGrad = ctx.createLinearGradient(cx - 16 * scale, cy, cx + 16 * scale, cy);
        armorGrad.addColorStop(0, "#1a2a4a");
        armorGrad.addColorStop(0.25, "#2a3a6a");
        armorGrad.addColorStop(0.4, "#3a4a7a");
        armorGrad.addColorStop(0.5, "#4a5a9a");
        armorGrad.addColorStop(0.6, "#3a4a7a");
        armorGrad.addColorStop(0.75, "#2a3a6a");
        armorGrad.addColorStop(1, "#1a2a4a");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 20 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 16 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 20 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0a1a3a";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Horizontal silver trim bands across chest
        ctx.strokeStyle = "#8898b8";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 13 * scale, cy + 4 * scale + bounce);
        ctx.lineTo(cx + 13 * scale, cy + 4 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 12 * scale + bounce);
        ctx.lineTo(cx + 12 * scale, cy + 12 * scale + bounce);
        ctx.stroke();

        // Center chest emblem - M symbol (cyan glow, larger)
        ctx.fillStyle = "#7acce0";
        ctx.shadowColor = "#7acce0";
        ctx.shadowBlur = 5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 7 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx, cy + 3 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy + 7 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy + 7 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy + 3 * scale + bounce);
        ctx.lineTo(cx, cy + 7 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy + 3 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy + 7 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Armor rivets - cyan accents (two columns, 5 rows)
        ctx.fillStyle = "#5090b0";
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(cx - 10 * scale, cy - 2 * scale + i * 5 * scale + bounce, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 10 * scale, cy - 2 * scale + i * 5 * scale + bounce, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        // Extra inner rivets near trim bands
        ctx.fillStyle = "#6aa0c0";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(cx - 7 * scale, cy - 3 * scale + i * 6 * scale + bounce, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 7 * scale, cy - 3 * scale + i * 6 * scale + bounce, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === ARMOR SKIRT (pteruges/tassets, wider) - V shape ===
        for (let i = 0; i < 7; i++) {
          const plateX = cx + (-15 + i * 5) * scale;
          const distFromCenter = Math.abs(-15 + i * 5);
          const vDrop = (15 - distFromCenter) * 0.35 * scale;
          const plateY = cy + 14 * scale + bounce + vDrop;
          const plateW = 4.5 * scale;
          const plateH = 7 * scale + vDrop * 0.5;
          const skirtGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
          skirtGrad.addColorStop(0, "#3a4a7a");
          skirtGrad.addColorStop(1, "#2a3a6a");
          ctx.fillStyle = skirtGrad;
          ctx.beginPath();
          ctx.moveTo(plateX - plateW / 2, plateY);
          ctx.lineTo(plateX + plateW / 2, plateY);
          ctx.lineTo(plateX + plateW / 2 - 0.8 * scale, plateY + plateH);
          ctx.lineTo(plateX - plateW / 2 + 0.8 * scale, plateY + plateH);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#5a6aaa";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          ctx.fillStyle = "#8898b8";
          ctx.beginPath();
          ctx.arc(plateX, plateY + 1.2 * scale, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === RIGHT ARM ===
        ctx.save();
        ctx.translate(cx + 18 * scale, cy - 8 * scale + bounce);
        ctx.rotate(0.35);

        // Large layered pauldron
        const rpOuterGrad = ctx.createRadialGradient(2 * scale, -1 * scale, 0, 2 * scale, 0, 12 * scale);
        rpOuterGrad.addColorStop(0, "#5a6ab0");
        rpOuterGrad.addColorStop(0.5, "#4a5a9a");
        rpOuterGrad.addColorStop(1, "#2a3a5a");
        ctx.fillStyle = rpOuterGrad;
        ctx.beginPath();
        ctx.ellipse(2 * scale, 0, 10 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();
        // Inner ridge
        ctx.fillStyle = "#4a5a90";
        ctx.beginPath();
        ctx.ellipse(2 * scale, -0.5 * scale, 7 * scale, 4.5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Center gem
        ctx.fillStyle = `rgba(100, 220, 255, ${eyeGlow})`;
        ctx.shadowColor = "#64e0ff";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(2 * scale, -0.5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Rivets around edge
        ctx.fillStyle = "#90a0c8";
        for (let r = 0; r < 5; r++) {
          const rAngle = (r / 5) * Math.PI * 2 + 0.2;
          ctx.beginPath();
          ctx.arc(2 * scale + Math.cos(rAngle) * 8 * scale, Math.sin(rAngle) * 5.5 * scale, 0.7 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Upper arm
        ctx.fillStyle = "#3a4a7a";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 8 * scale, 5.5 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a5a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Gauntlet
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(2 * scale, 16 * scale, 5 * scale, 5.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        ctx.restore();

        // === GORGET (neck guard, wider) ===
        const gorgetGrad = ctx.createLinearGradient(cx - 14 * scale, cy - 10 * scale + bounce, cx + 14 * scale, cy - 10 * scale + bounce);
        gorgetGrad.addColorStop(0, "#5868a0");
        gorgetGrad.addColorStop(0.3, "#6878a8");
        gorgetGrad.addColorStop(0.5, "#8898c8");
        gorgetGrad.addColorStop(0.7, "#6878a8");
        gorgetGrad.addColorStop(1, "#5868a0");
        ctx.fillStyle = gorgetGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy - 8 * scale + bounce);
        ctx.quadraticCurveTo(cx - 14 * scale, cy - 11 * scale + bounce, cx - 10 * scale, cy - 13 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 13 * scale + bounce);
        ctx.quadraticCurveTo(cx + 14 * scale, cy - 11 * scale + bounce, cx + 12 * scale, cy - 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#a0b0d0";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        // Gorget center accent
        ctx.fillStyle = "#a0b8d8";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10.5 * scale + bounce, 2.5 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // === ANGULAR SQUARISH HELMET ===
        {
          const hY = cy - 18 * scale + bounce;
          const hW = 12 * scale;
          const hH = 14 * scale;

          // Main helmet shell - flat-topped, angular
          const helmetGrad = ctx.createLinearGradient(cx - hW, hY - hH, cx + hW, hY + 4 * scale);
          helmetGrad.addColorStop(0, "#5a6ab0");
          helmetGrad.addColorStop(0.3, "#4a5a9a");
          helmetGrad.addColorStop(0.6, "#3a4a7a");
          helmetGrad.addColorStop(1, "#1a2a4a");
          ctx.fillStyle = helmetGrad;
          ctx.beginPath();
          ctx.moveTo(cx - hW, hY - 4 * scale);
          ctx.lineTo(cx - hW + 1 * scale, hY - hH + 3 * scale);
          ctx.lineTo(cx - hW + 4 * scale, hY - hH);
          ctx.lineTo(cx + hW - 4 * scale, hY - hH);
          ctx.lineTo(cx + hW - 1 * scale, hY - hH + 3 * scale);
          ctx.lineTo(cx + hW, hY - 4 * scale);
          ctx.lineTo(cx + hW - 1 * scale, hY + 4 * scale);
          ctx.lineTo(cx - hW + 1 * scale, hY + 4 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#0a1a3a";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();

          // Brow plate - horizontal ridge above visor
          ctx.fillStyle = "#4a5a90";
          ctx.beginPath();
          ctx.moveTo(cx - hW + 1 * scale, hY - 2 * scale);
          ctx.lineTo(cx - hW - 1 * scale, hY - 3 * scale);
          ctx.lineTo(cx + hW + 1 * scale, hY - 3 * scale);
          ctx.lineTo(cx + hW - 1 * scale, hY - 2 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#a0b0d0";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();

          // Horizontal panel lines across helmet
          ctx.strokeStyle = "rgba(100, 120, 180, 0.3)";
          ctx.lineWidth = 0.6 * scale;
          for (const ly of [-8, -5]) {
            ctx.beginPath();
            ctx.moveTo(cx - hW + 2 * scale, hY + ly * scale);
            ctx.lineTo(cx + hW - 2 * scale, hY + ly * scale);
            ctx.stroke();
          }

          // Silver trim along top edge
          ctx.strokeStyle = "#b0c0e0";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - hW + 4 * scale, hY - hH);
          ctx.lineTo(cx + hW - 4 * scale, hY - hH);
          ctx.stroke();

          // Raised central crest/ridge
          const crestGrad = ctx.createLinearGradient(cx - 2 * scale, hY - hH - 10 * scale, cx + 2 * scale, hY - hH);
          crestGrad.addColorStop(0, "#7080c0");
          crestGrad.addColorStop(0.5, "#8090d0");
          crestGrad.addColorStop(1, "#5060a0");
          ctx.fillStyle = crestGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 2 * scale, hY - hH + 2 * scale);
          ctx.lineTo(cx - 2.5 * scale, hY - hH - 4 * scale);
          ctx.lineTo(cx, hY - hH - 16 * scale);
          ctx.lineTo(cx + 2.5 * scale, hY - hH - 4 * scale);
          ctx.lineTo(cx + 2 * scale, hY - hH + 2 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#a0b0d0";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Crest highlight
          ctx.strokeStyle = "#c0d0f0";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, hY - hH + 1 * scale);
          ctx.lineTo(cx, hY - hH - 15 * scale);
          ctx.stroke();

          // Side spikes flanking crest
          for (const sx of [-1, 1]) {
            ctx.fillStyle = "#4a5a8a";
            ctx.beginPath();
            ctx.moveTo(cx + sx * 5 * scale, hY - hH - 2 * scale);
            ctx.lineTo(cx + sx * 6 * scale, hY - hH - 10 * scale);
            ctx.lineTo(cx + sx * 3.5 * scale, hY - hH - 2 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#2a3a6a";
            ctx.lineWidth = 0.7 * scale;
            ctx.stroke();
          }

          // Angular cheek guards / side wings
          for (const sx of [-1, 1]) {
            const wGrad = ctx.createLinearGradient(cx + sx * hW, hY, cx + sx * (hW + 8 * scale), hY - 4 * scale);
            wGrad.addColorStop(0, "#4a5a8a");
            wGrad.addColorStop(1, "#2a3a6a");
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            ctx.moveTo(cx + sx * hW, hY - 4 * scale);
            ctx.lineTo(cx + sx * (hW + 4 * scale), hY - 8 * scale);
            ctx.lineTo(cx + sx * (hW + 7 * scale), hY - 6 * scale);
            ctx.lineTo(cx + sx * (hW + 5 * scale), hY - 2 * scale);
            ctx.lineTo(cx + sx * hW, hY + 2 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#a0b0d0";
            ctx.lineWidth = 0.6 * scale;
            ctx.stroke();
          }

          // Corner rivets on helmet
          ctx.fillStyle = "#90a0c0";
          for (const [rx, ry] of [[-hW + 3 * scale, -hH + 1 * scale], [hW - 3 * scale, -hH + 1 * scale], [-hW + 2 * scale, 2 * scale], [hW - 2 * scale, 2 * scale]]) {
            ctx.beginPath();
            ctx.arc(cx + rx, hY + ry, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Face plate / visor - angular dark slit (shifted up)
          const faceOff = -3 * scale;
          ctx.fillStyle = "#0a1020";
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY - 2 * scale + faceOff);
          ctx.lineTo(cx - 10 * scale, hY + faceOff);
          ctx.lineTo(cx - 9 * scale, hY + 3 * scale + faceOff);
          ctx.lineTo(cx + 9 * scale, hY + 3 * scale + faceOff);
          ctx.lineTo(cx + 10 * scale, hY + faceOff);
          ctx.lineTo(cx + 9 * scale, hY - 2 * scale + faceOff);
          ctx.closePath();
          ctx.fill();

          // Silver accent lines on visor edges
          ctx.strokeStyle = "#8898b8";
          ctx.lineWidth = 0.6 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY - 2 * scale + faceOff);
          ctx.lineTo(cx + 9 * scale, hY - 2 * scale + faceOff);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY + 3 * scale + faceOff);
          ctx.lineTo(cx + 9 * scale, hY + 3 * scale + faceOff);
          ctx.stroke();

          // Vertical nose guard
          ctx.strokeStyle = "#3a4a7a";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, hY - 3 * scale + faceOff);
          ctx.lineTo(cx, hY + 3 * scale + faceOff);
          ctx.stroke();

          // Glowing cyan eyes behind visor
          ctx.fillStyle = `rgba(100, 220, 255, ${eyeGlow})`;
          ctx.shadowColor = "#64e0ff";
          ctx.shadowBlur = 8 * scale;
          ctx.beginPath();
          ctx.ellipse(cx - 4 * scale, hY + 0.5 * scale + faceOff, 2.5 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 4 * scale, hY + 0.5 * scale + faceOff, 2.5 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Angular chin guard
          ctx.fillStyle = "#3a4a7a";
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale, hY + 4 * scale + faceOff);
          ctx.lineTo(cx - 10 * scale, hY + 8 * scale + faceOff);
          ctx.lineTo(cx - 4 * scale, hY + 11 * scale + faceOff);
          ctx.lineTo(cx, hY + 12 * scale + faceOff);
          ctx.lineTo(cx + 4 * scale, hY + 11 * scale + faceOff);
          ctx.lineTo(cx + 10 * scale, hY + 8 * scale + faceOff);
          ctx.lineTo(cx + 8 * scale, hY + 4 * scale + faceOff);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#a0b0d0";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();

          // Chin guard vent slits
          ctx.strokeStyle = "#0a1020";
          ctx.lineWidth = 0.5 * scale;
          for (let vs = -2; vs <= 2; vs++) {
            ctx.beginPath();
            ctx.moveTo(cx + vs * 2 * scale, hY + 6 * scale + faceOff);
            ctx.lineTo(cx + vs * 2 * scale, hY + 10 * scale + faceOff);
            ctx.stroke();
          }
        }

        // === M-SHIELD (held by left arm, larger & ornate) ===
        ctx.save();
        ctx.translate(cx - 18 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.15);

        // Outer shield shape (bigger)
        const shieldGrad = ctx.createLinearGradient(-10 * scale, -12 * scale, 10 * scale, 14 * scale);
        shieldGrad.addColorStop(0, "#5a9aaa");
        shieldGrad.addColorStop(0.3, "#6aacbc");
        shieldGrad.addColorStop(0.5, "#5a9aaa");
        shieldGrad.addColorStop(0.7, "#4a8a9a");
        shieldGrad.addColorStop(1, "#3a6a7a");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -13 * scale);
        ctx.lineTo(-10 * scale, -8 * scale);
        ctx.lineTo(-10 * scale, 6 * scale);
        ctx.lineTo(0, 15 * scale);
        ctx.lineTo(10 * scale, 6 * scale);
        ctx.lineTo(10 * scale, -8 * scale);
        ctx.closePath();
        ctx.fill();
        // Bold silver rim
        ctx.strokeStyle = "#c0d0e0";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Inner decorative border
        ctx.strokeStyle = "rgba(160, 200, 220, 0.5)";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -10 * scale);
        ctx.lineTo(-7.5 * scale, -6 * scale);
        ctx.lineTo(-7.5 * scale, 4.5 * scale);
        ctx.lineTo(0, 12 * scale);
        ctx.lineTo(7.5 * scale, 4.5 * scale);
        ctx.lineTo(7.5 * scale, -6 * scale);
        ctx.closePath();
        ctx.stroke();

        // Shield face panel gradient
        const facePanelGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
        facePanelGrad.addColorStop(0, "rgba(120, 210, 230, 0.15)");
        facePanelGrad.addColorStop(1, "rgba(60, 100, 120, 0.05)");
        ctx.fillStyle = facePanelGrad;
        ctx.beginPath();
        ctx.moveTo(0, -10 * scale);
        ctx.lineTo(-7.5 * scale, -6 * scale);
        ctx.lineTo(-7.5 * scale, 4.5 * scale);
        ctx.lineTo(0, 12 * scale);
        ctx.lineTo(7.5 * scale, 4.5 * scale);
        ctx.lineTo(7.5 * scale, -6 * scale);
        ctx.closePath();
        ctx.fill();

        // M emblem on shield (larger, glowing)
        ctx.fillStyle = "#7acce0";
        ctx.shadowColor = "#7acce0";
        ctx.shadowBlur = 5 * scale;
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

        // Corner rivets on shield
        ctx.fillStyle = "#a0c0d0";
        const shieldRivets: [number, number][] = [[0, -11], [-9, -7], [9, -7], [-9, 5], [9, 5], [0, 13]];
        for (const [rx, ry] of shieldRivets) {
          ctx.beginPath();
          ctx.arc(rx * scale, ry * scale, 0.9 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gauntlet gripping shield top
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(0, -10 * scale, 4.5 * scale, 3.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        ctx.restore();

        // === HAMMER (held by right arm, bigger & ornate) ===
        ctx.save();
        ctx.translate(cx + 17 * scale, cy + 2 * scale + bounce);
        ctx.rotate(0.25);

        // Handle with leather wrapping
        const handleGrad = ctx.createLinearGradient(-2 * scale, -30 * scale, 2 * scale, 4 * scale);
        handleGrad.addColorStop(0, "#9a7518");
        handleGrad.addColorStop(0.5, "#8b6914");
        handleGrad.addColorStop(1, "#7a5810");
        ctx.fillStyle = handleGrad;
        ctx.beginPath();
        ctx.roundRect(-2 * scale, -30 * scale, 4 * scale, 34 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#6b4904";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Grip wrapping
        ctx.strokeStyle = "#5a3808";
        ctx.lineWidth = 0.5 * scale;
        for (let gw = 0; gw < 6; gw++) {
          const gy = -6 * scale + gw * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(-2 * scale, gy);
          ctx.lineTo(2 * scale, gy + 1.5 * scale);
          ctx.stroke();
        }
        // Handle pommel
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();

        // Grip collar (where handle meets head)
        ctx.fillStyle = "#5a6a9a";
        ctx.beginPath();
        ctx.ellipse(0, -30 * scale, 3.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hammer head (bigger)
        const hammerGrad = ctx.createLinearGradient(-10 * scale, -40 * scale, 10 * scale, -30 * scale);
        hammerGrad.addColorStop(0, "#2a3a5a");
        hammerGrad.addColorStop(0.2, "#4a5a7a");
        hammerGrad.addColorStop(0.5, "#6a7ab0");
        hammerGrad.addColorStop(0.8, "#4a5a7a");
        hammerGrad.addColorStop(1, "#2a3a5a");
        ctx.fillStyle = hammerGrad;
        ctx.beginPath();
        ctx.roundRect(-10 * scale, -42 * scale, 20 * scale, 13 * scale, 2.5 * scale);
        ctx.fill();
        ctx.strokeStyle = "#1a2a4a";
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();

        // Face details on hammer head
        ctx.fillStyle = "#3a4a6a";
        ctx.fillRect(-7 * scale, -40 * scale, 2.5 * scale, 9 * scale);
        ctx.fillRect(4.5 * scale, -40 * scale, 2.5 * scale, 9 * scale);
        // Silver trim lines
        ctx.strokeStyle = "#8898b8";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(-10 * scale, -36 * scale);
        ctx.lineTo(10 * scale, -36 * scale);
        ctx.stroke();

        // Glowing cyan gem on hammer face
        ctx.fillStyle = `rgba(100, 220, 255, ${eyeGlow})`;
        ctx.shadowColor = "#64e0ff";
        ctx.shadowBlur = 5 * scale;
        ctx.beginPath();
        ctx.arc(0, -36 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gauntlet gripping handle
        ctx.fillStyle = "#4a5a8a";
        ctx.beginPath();
        ctx.ellipse(0, -4 * scale, 4.5 * scale, 4 * scale, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a3a6a";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();
        ctx.restore();

        break;
      }
      case "rocky": {
        cy += 10 * scale;
        ctx.save();
        ctx.translate(cx - 3 * scale, cy);
        ctx.scale(1.2, 1.2);
        ctx.translate(-cx, -cy);
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const hop = animated ? Math.abs(Math.sin(t * 5)) * 2 : 0;
        const gemPulse = Math.sin(t * 2.5) * 0.3 + 0.7;

        // Warm amber/stone aura with inner glow
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28 * scale);
        auraGrad.addColorStop(0, `rgba(200, 140, 60, ${auraPulse * 0.35})`);
        auraGrad.addColorStop(0.3, `rgba(180, 120, 60, ${auraPulse * 0.2})`);
        auraGrad.addColorStop(0.6, `rgba(140, 90, 40, ${auraPulse * 0.1})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 28 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Stone dust particles
        if (animated) {
          for (let p = 0; p < 5; p++) {
            const pPhase = (t * 0.4 + p * 0.35) % 1.5;
            const pAngle = p * 1.25 + t * 0.3;
            const pR = 10 * scale + pPhase * 14 * scale;
            const pX = cx + Math.cos(pAngle) * pR;
            const pY = cy + Math.sin(pAngle) * pR * 0.6 - pPhase * 6 * scale + bounce - hop;
            const pAlpha = Math.max(0, 1 - pPhase / 1.5) * 0.5;
            ctx.fillStyle = `rgba(150, 130, 100, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(pX, pY, (1 + pPhase) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // === BUSHY TAIL (behind body) ===
        const tailWave = animated ? Math.sin(t * 2) * 0.1 : 0;
        ctx.save();
        ctx.translate(cx + 6 * scale, cy - 1 * scale + bounce - hop);
        ctx.rotate(0.3 + tailWave);

        const tailGrad = ctx.createRadialGradient(6 * scale, -8 * scale, 0, 6 * scale, -8 * scale, 22 * scale);
        tailGrad.addColorStop(0, "#e0b848");
        tailGrad.addColorStop(0.3, "#d8a840");
        tailGrad.addColorStop(0.6, "#a07020");
        tailGrad.addColorStop(1, "#6a4020");
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12 * scale, -8 * scale, 15 * scale, -24 * scale);
        ctx.quadraticCurveTo(18 * scale, -36 * scale, 10 * scale, -34 * scale);
        ctx.quadraticCurveTo(2 * scale, -32 * scale, -2 * scale, -20 * scale);
        ctx.quadraticCurveTo(-4 * scale, -8 * scale, 0, 0);
        ctx.closePath();
        ctx.fill();
        // Tail fur tufts
        ctx.strokeStyle = "#c89830";
        ctx.lineWidth = 1 * scale;
        for (let ft = 0; ft < 5; ft++) {
          const ftPos = 0.1 + ft * 0.18;
          const ftX = 6 * scale * (1 - ftPos) + (1 - ftPos) * 4 * scale;
          const ftY = -8 * scale - ftPos * 24 * scale;
          ctx.beginPath();
          ctx.moveTo(ftX - 2 * scale, ftY);
          ctx.quadraticCurveTo(ftX + 4 * scale, ftY - 3 * scale, ftX + 2 * scale, ftY + 2 * scale);
          ctx.stroke();
        }
        // Raccoon banding on tail
        ctx.fillStyle = "rgba(40, 25, 8, 0.6)";
        for (let b = 0; b < 5; b++) {
          const bPos = 0.1 + b * 0.17;
          ctx.beginPath();
          ctx.ellipse(
            6 * scale * (1 - bPos), -8 * scale - bPos * 24 * scale,
            5.5 * scale * (1 - bPos * 0.3), 2.5 * scale, 0.3, 0, Math.PI * 2
          );
          ctx.fill();
        }
        // Tail tip highlight
        ctx.fillStyle = "#f0d060";
        ctx.beginPath();
        ctx.ellipse(8 * scale, -32 * scale, 3 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === LARGE GARGOYLE WINGS ===
        const flapAngle = animated ? Math.sin(t * 1.8) * 0.35 : 0;
        for (const side of [-1, 1]) {
          const isStone = side === -1;
          ctx.save();
          ctx.translate(cx + side * 10 * scale, cy + bounce - hop);
          ctx.scale(side, 1);
          ctx.rotate(0.1 + flapAngle);

          // Shoulder joint
          ctx.fillStyle = isStone ? "#605850" : "#8a5810";
          ctx.beginPath();
          ctx.arc(0, 0, 3 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Main wing arm bone
          ctx.strokeStyle = isStone ? "#686060" : "#9a6818";
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-12 * scale, -10 * scale, -28 * scale, -22 * scale);
          ctx.stroke();
          // Bone highlight
          ctx.strokeStyle = isStone ? "rgba(140, 130, 120, 0.3)" : "rgba(200, 160, 80, 0.3)";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(-1 * scale, -1 * scale);
          ctx.quadraticCurveTo(-11 * scale, -11 * scale, -27 * scale, -23 * scale);
          ctx.stroke();

          // Forearm bone
          ctx.strokeStyle = isStone ? "#585050" : "#8a5010";
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-28 * scale, -22 * scale);
          ctx.quadraticCurveTo(-32 * scale, -18 * scale, -36 * scale, -12 * scale);
          ctx.stroke();

          // Wing membrane - large multi-section
          const memGrad = ctx.createLinearGradient(0, 0, -36 * scale, -12 * scale);
          if (isStone) {
            memGrad.addColorStop(0, "rgba(120, 110, 100, 0.85)");
            memGrad.addColorStop(0.3, "rgba(90, 80, 70, 0.8)");
            memGrad.addColorStop(0.6, "rgba(70, 60, 50, 0.7)");
            memGrad.addColorStop(1, "rgba(50, 45, 38, 0.55)");
          } else {
            memGrad.addColorStop(0, "rgba(210, 160, 60, 0.85)");
            memGrad.addColorStop(0.3, "rgba(180, 130, 40, 0.8)");
            memGrad.addColorStop(0.6, "rgba(150, 100, 30, 0.7)");
            memGrad.addColorStop(1, "rgba(120, 80, 20, 0.55)");
          }
          ctx.fillStyle = memGrad;
          ctx.beginPath();
          ctx.moveTo(0, 4 * scale);
          ctx.lineTo(-28 * scale, -22 * scale);
          ctx.lineTo(-36 * scale, -12 * scale);
          ctx.lineTo(-34 * scale, -4 * scale);
          ctx.lineTo(-30 * scale, 2 * scale);
          ctx.lineTo(-24 * scale, 6 * scale);
          ctx.lineTo(-16 * scale, 10 * scale);
          ctx.lineTo(-8 * scale, 10 * scale);
          ctx.closePath();
          ctx.fill();

          // Finger bones (4 bones fanning out from elbow)
          const elbowX = -28 * scale;
          const elbowY = -22 * scale;
          ctx.strokeStyle = isStone ? "#787068" : "#b07818";
          ctx.lineWidth = 1.8 * scale;
          const fingerTips: [number, number][] = [
            [-36 * scale, -12 * scale],
            [-34 * scale, -4 * scale],
            [-30 * scale, 2 * scale],
            [-24 * scale, 6 * scale],
          ];
          for (const tip of fingerTips) {
            ctx.beginPath();
            ctx.moveTo(elbowX, elbowY);
            ctx.lineTo(tip[0], tip[1]);
            ctx.stroke();
          }

          // Membrane vein lines
          ctx.strokeStyle = isStone ? "rgba(60, 50, 40, 0.35)" : "rgba(120, 80, 20, 0.35)";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-14 * scale, -8 * scale);
          ctx.quadraticCurveTo(-22 * scale, -14 * scale, -33 * scale, -8 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-10 * scale, -4 * scale);
          ctx.quadraticCurveTo(-18 * scale, -6 * scale, -30 * scale, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-6 * scale, 0);
          ctx.quadraticCurveTo(-14 * scale, 2 * scale, -24 * scale, 4 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-4 * scale, 4 * scale);
          ctx.quadraticCurveTo(-10 * scale, 6 * scale, -18 * scale, 8 * scale);
          ctx.stroke();

          // Wing tip claws at each finger tip
          ctx.fillStyle = isStone ? "#3a3434" : "#5a3008";
          for (const tip of fingerTips) {
            ctx.beginPath();
            ctx.moveTo(tip[0], tip[1]);
            ctx.lineTo(tip[0] - 2 * scale, tip[1] - 2 * scale);
            ctx.lineTo(tip[0] + 0.5 * scale, tip[1] + 1 * scale);
            ctx.closePath();
            ctx.fill();
          }

          // Wing leading edge highlight
          ctx.strokeStyle = isStone ? "rgba(150, 140, 130, 0.5)" : "rgba(240, 200, 100, 0.5)";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-12 * scale, -10 * scale, -28 * scale, -22 * scale);
          ctx.lineTo(-36 * scale, -12 * scale);
          ctx.stroke();

          // Membrane inner glow
          if (isStone) {
            ctx.fillStyle = `rgba(0, 180, 200, ${0.04 + gemPulse * 0.03})`;
          } else {
            ctx.fillStyle = `rgba(200, 160, 60, ${0.06 + auraPulse * 0.04})`;
          }
          ctx.beginPath();
          ctx.moveTo(-10 * scale, -4 * scale);
          ctx.quadraticCurveTo(-20 * scale, -12 * scale, -30 * scale, -6 * scale);
          ctx.quadraticCurveTo(-24 * scale, 0, -14 * scale, 2 * scale);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        // === HALF-FUR / HALF-STONE BODY ===
        // Right side: golden-brown fur
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, cy - 16 * scale + bounce - hop, 16 * scale, 36 * scale);
        ctx.clip();
        const furGrad = ctx.createRadialGradient(cx + 4 * scale, cy + 2 * scale + bounce - hop, 0, cx, cy + 2 * scale + bounce - hop, 16 * scale);
        furGrad.addColorStop(0, "#e0b848");
        furGrad.addColorStop(0.4, "#d8a840");
        furGrad.addColorStop(0.7, "#a07020");
        furGrad.addColorStop(1, "#6a4020");
        ctx.fillStyle = furGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * scale + bounce - hop, 14 * scale, 16 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Fur texture tufts (right side)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, cy - 14 * scale + bounce - hop, 15 * scale, 30 * scale);
        ctx.clip();
        ctx.strokeStyle = "rgba(180, 130, 50, 0.4)";
        ctx.lineWidth = 0.8 * scale;
        for (let ft = 0; ft < 6; ft++) {
          const ftX = cx + 3 * scale + ft * 2 * scale;
          const ftY = cy - 8 * scale + ft * 4 * scale + bounce - hop;
          ctx.beginPath();
          ctx.moveTo(ftX, ftY);
          ctx.quadraticCurveTo(ftX + 2 * scale, ftY - 2 * scale, ftX + 1 * scale, ftY + 2 * scale);
          ctx.stroke();
        }
        ctx.restore();

        // Left side: grey stone
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 16 * scale, cy - 16 * scale + bounce - hop, 16 * scale, 36 * scale);
        ctx.clip();
        const stoneGrad = ctx.createRadialGradient(cx - 4 * scale, cy + 2 * scale + bounce - hop, 0, cx, cy + 2 * scale + bounce - hop, 16 * scale);
        stoneGrad.addColorStop(0, "#989088");
        stoneGrad.addColorStop(0.4, "#808078");
        stoneGrad.addColorStop(0.7, "#686060");
        stoneGrad.addColorStop(1, "#3a3434");
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * scale + bounce - hop, 14 * scale, 16 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Stone texture - carved lines (left side)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 15 * scale, cy - 14 * scale + bounce - hop, 15 * scale, 30 * scale);
        ctx.clip();
        ctx.strokeStyle = "rgba(30, 25, 20, 0.35)";
        ctx.lineWidth = 0.7 * scale;
        for (let cl = 0; cl < 4; cl++) {
          const clX = cx - 4 * scale - cl * 2.5 * scale;
          const clY = cy - 6 * scale + cl * 4 * scale + bounce - hop;
          ctx.beginPath();
          ctx.moveTo(clX, clY);
          ctx.lineTo(clX - 3 * scale, clY + 2 * scale);
          ctx.lineTo(clX - 2 * scale, clY + 5 * scale);
          ctx.stroke();
        }
        ctx.restore();

        // Cream belly (right side only)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 2 * scale, cy - 8 * scale + bounce - hop, 14 * scale, 26 * scale);
        ctx.clip();
        const bellyGrad = ctx.createRadialGradient(cx + 2 * scale, cy + 4 * scale + bounce - hop, 0, cx + 2 * scale, cy + 4 * scale + bounce - hop, 10 * scale);
        bellyGrad.addColorStop(0, "#fff8e8");
        bellyGrad.addColorStop(0.7, "#f0e8d0");
        bellyGrad.addColorStop(1, "#e0d0b0");
        ctx.fillStyle = bellyGrad;
        ctx.beginPath();
        ctx.ellipse(cx + 2 * scale, cy + 4 * scale + bounce - hop, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Center seam (jagged glowing)
        ctx.strokeStyle = "rgba(100, 70, 40, 0.6)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12 * scale + bounce - hop);
        ctx.lineTo(cx + 0.8 * scale, cy - 6 * scale + bounce - hop);
        ctx.lineTo(cx - 0.5 * scale, cy + bounce - hop);
        ctx.lineTo(cx + 0.5 * scale, cy + 6 * scale + bounce - hop);
        ctx.lineTo(cx - 0.3 * scale, cy + 12 * scale + bounce - hop);
        ctx.stroke();
        // Amber glow at seam
        ctx.strokeStyle = `rgba(200, 160, 60, ${0.15 + auraPulse * 0.15})`;
        ctx.shadowColor = "#c8a040";
        ctx.shadowBlur = 3 * scale;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10 * scale + bounce - hop);
        ctx.lineTo(cx + 0.5 * scale, cy + bounce - hop);
        ctx.lineTo(cx, cy + 10 * scale + bounce - hop);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Stone cracks on left side (more detailed)
        ctx.strokeStyle = "rgba(30, 25, 20, 0.55)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 6 * scale + bounce - hop);
        ctx.lineTo(cx - 10 * scale, cy + bounce - hop);
        ctx.lineTo(cx - 12 * scale, cy + 6 * scale + bounce - hop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 2 * scale + bounce - hop);
        ctx.lineTo(cx - 6 * scale, cy + 4 * scale + bounce - hop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 4 * scale + bounce - hop);
        ctx.lineTo(cx - 14 * scale, cy + 10 * scale + bounce - hop);
        ctx.stroke();

        // Stone plating chips on left (more)
        ctx.fillStyle = "#706860";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + bounce - hop);
        ctx.lineTo(cx - 16 * scale, cy + 4 * scale + bounce - hop);
        ctx.lineTo(cx - 14 * scale, cy + 8 * scale + bounce - hop);
        ctx.lineTo(cx - 12 * scale, cy + 4 * scale + bounce - hop);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#605850";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 8 * scale + bounce - hop);
        ctx.lineTo(cx - 10 * scale, cy + 12 * scale + bounce - hop);
        ctx.lineTo(cx - 8 * scale, cy + 14 * scale + bounce - hop);
        ctx.lineTo(cx - 6 * scale, cy + 11 * scale + bounce - hop);
        ctx.closePath();
        ctx.fill();

        // === STONE ARM/CLAW (left) ===
        const armSwing = animated ? Math.sin(t * 2.5) * 0.08 : 0;
        const tossPhase = animated ? (t * 1.1) % 1 : 0;

        ctx.save();
        ctx.translate(cx - 12 * scale, cy + bounce - hop);
        ctx.rotate(-0.4 + armSwing);
        // Stone upper arm
        const stoneArmGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 10 * scale);
        stoneArmGrad.addColorStop(0, "#787068");
        stoneArmGrad.addColorStop(1, "#585050");
        ctx.fillStyle = stoneArmGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 4.5 * scale, 6 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#484040";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Stone forearm
        ctx.fillStyle = "#686058";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 10 * scale, 3.5 * scale, 4 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Stone claw tips (sharper, more detailed)
        ctx.fillStyle = "#484040";
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.moveTo(-1.5 * scale + c * 1.5 * scale, 13 * scale);
          ctx.lineTo(-2 * scale + c * 1.5 * scale, 18 * scale);
          ctx.lineTo(-1 * scale + c * 1.5 * scale, 13 * scale);
          ctx.closePath();
          ctx.fill();
        }
        // Crack detail on arm
        ctx.strokeStyle = "rgba(30, 25, 20, 0.4)";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 2 * scale);
        ctx.lineTo(1 * scale, 7 * scale);
        ctx.stroke();
        ctx.restore();

        // === FUR PAW (right) - tossing stone ===
        ctx.save();
        ctx.translate(cx + 12 * scale, cy + bounce - hop);
        ctx.rotate(0.3 - armSwing - (animated ? Math.sin(tossPhase * Math.PI) * 0.3 : 0));
        // Fur upper arm
        const furArmGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 10 * scale);
        furArmGrad.addColorStop(0, "#c09030");
        furArmGrad.addColorStop(1, "#a07020");
        ctx.fillStyle = furArmGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 4.5 * scale, 6 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8a5810";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Fur forearm
        ctx.fillStyle = "#a07020";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 10 * scale, 3.5 * scale, 4 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Paw pad
        ctx.fillStyle = "#8a5810";
        ctx.beginPath();
        ctx.ellipse(0, 13 * scale, 3.5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Paw pads (little circles)
        ctx.fillStyle = "#d0a060";
        for (let pd = 0; pd < 3; pd++) {
          ctx.beginPath();
          ctx.arc(-1.5 * scale + pd * 1.5 * scale, 12.5 * scale, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        // Fur tufts on arm
        ctx.strokeStyle = "rgba(180, 130, 50, 0.5)";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(3 * scale, 2 * scale);
        ctx.quadraticCurveTo(5 * scale, 0, 4 * scale, 3 * scale);
        ctx.stroke();
        ctx.restore();

        // Tossed stone projectile
        if (animated) {
          const stoneY = -Math.sin(tossPhase * Math.PI) * 18 * scale;
          const stoneX = Math.sin(tossPhase * Math.PI) * 2 * scale;
          const stoneR = 3 * scale;
          ctx.fillStyle = "#706860";
          ctx.beginPath();
          ctx.arc(cx + 12 * scale + stoneX, cy - 4 * scale + stoneY + bounce - hop, stoneR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#484040";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Cracks on stone
          ctx.strokeStyle = "rgba(30, 20, 10, 0.5)";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + 12 * scale + stoneX - 1 * scale, cy - 4 * scale + stoneY + bounce - hop);
          ctx.lineTo(cx + 12 * scale + stoneX + 1 * scale, cy - 5 * scale + stoneY + bounce - hop);
          ctx.stroke();
        }

        // === HALF-FUR / HALF-STONE HEAD ===
        const headY = cy - 14 * scale + bounce - hop;

        // Right half: squirrel fur (richer gradient)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, headY - 14 * scale, 14 * scale, 28 * scale);
        ctx.clip();
        const headFurGrad = ctx.createRadialGradient(cx + 3 * scale, headY - 2 * scale, 0, cx, headY, 12 * scale);
        headFurGrad.addColorStop(0, "#d8a838");
        headFurGrad.addColorStop(0.5, "#c09030");
        headFurGrad.addColorStop(1, "#906818");
        ctx.fillStyle = headFurGrad;
        ctx.beginPath();
        ctx.ellipse(cx, headY, 12 * scale, 11 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Left half: stone gargoyle (richer gradient)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 14 * scale, headY - 14 * scale, 14 * scale, 28 * scale);
        ctx.clip();
        const headStoneGrad = ctx.createRadialGradient(cx - 3 * scale, headY - 2 * scale, 0, cx, headY, 12 * scale);
        headStoneGrad.addColorStop(0, "#908880");
        headStoneGrad.addColorStop(0.5, "#787068");
        headStoneGrad.addColorStop(1, "#484040");
        ctx.fillStyle = headStoneGrad;
        ctx.beginPath();
        ctx.ellipse(cx, headY, 12 * scale, 11 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Head center seam with glow
        ctx.strokeStyle = "rgba(80, 60, 40, 0.6)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, headY - 10 * scale);
        ctx.lineTo(cx + 0.5 * scale, headY - 3 * scale);
        ctx.lineTo(cx - 0.5 * scale, headY + 4 * scale);
        ctx.lineTo(cx, headY + 10 * scale);
        ctx.stroke();
        ctx.strokeStyle = `rgba(200, 160, 60, ${0.1 + auraPulse * 0.1})`;
        ctx.shadowColor = "#c8a040";
        ctx.shadowBlur = 2 * scale;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, headY - 8 * scale);
        ctx.lineTo(cx, headY + 8 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Gargoyle cracks on left head (more)
        ctx.strokeStyle = "rgba(30, 25, 20, 0.5)";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, headY - 8 * scale);
        ctx.lineTo(cx - 8 * scale, headY - 2 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, headY - 5 * scale);
        ctx.lineTo(cx - 10 * scale, headY + 2 * scale);
        ctx.stroke();

        // Right ear (squirrel fur - bigger, more detail)
        ctx.fillStyle = "#b07818";
        ctx.beginPath();
        ctx.ellipse(cx + 9 * scale, headY - 8 * scale, 4 * scale, 6 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#906010";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        ctx.fillStyle = "#e8b8a0";
        ctx.beginPath();
        ctx.ellipse(cx + 9 * scale, headY - 8 * scale, 2.5 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Fur tuft at ear base
        ctx.fillStyle = "#c09030";
        ctx.beginPath();
        ctx.ellipse(cx + 7 * scale, headY - 4 * scale, 2 * scale, 1.5 * scale, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Left ear (stone gargoyle horn - more detailed)
        const hornGrad = ctx.createLinearGradient(cx - 7 * scale, headY - 6 * scale, cx - 12 * scale, headY - 18 * scale);
        hornGrad.addColorStop(0, "#686060");
        hornGrad.addColorStop(0.5, "#585050");
        hornGrad.addColorStop(1, "#484040");
        ctx.fillStyle = hornGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, headY - 6 * scale);
        ctx.lineTo(cx - 13 * scale, headY - 18 * scale);
        ctx.lineTo(cx - 10 * scale, headY - 17 * scale);
        ctx.lineTo(cx - 9 * scale, headY - 5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#3a3434";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Horn ridges
        ctx.strokeStyle = "rgba(80, 70, 60, 0.5)";
        ctx.lineWidth = 0.5 * scale;
        for (let hr = 0; hr < 3; hr++) {
          const hrY = headY - 8 * scale - hr * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 7.5 * scale - hr * 0.8 * scale, hrY);
          ctx.lineTo(cx - 9.5 * scale - hr * 0.5 * scale, hrY - 1 * scale);
          ctx.stroke();
        }

        // Brow ridges
        ctx.fillStyle = "#706860";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, headY - 4 * scale);
        ctx.quadraticCurveTo(cx - 5 * scale, headY - 6 * scale, cx - 2 * scale, headY - 4 * scale);
        ctx.lineTo(cx - 2 * scale, headY - 3 * scale);
        ctx.quadraticCurveTo(cx - 5 * scale, headY - 5 * scale, cx - 8 * scale, headY - 3 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#b08028";
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale, headY - 4 * scale);
        ctx.quadraticCurveTo(cx + 5 * scale, headY - 6 * scale, cx + 8 * scale, headY - 4 * scale);
        ctx.lineTo(cx + 8 * scale, headY - 3 * scale);
        ctx.quadraticCurveTo(cx + 5 * scale, headY - 5 * scale, cx + 2 * scale, headY - 3 * scale);
        ctx.closePath();
        ctx.fill();

        // Right eye (squirrel, warm golden - more detailed)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx + 5 * scale, headY - 1 * scale, 3.5 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9a7020";
        ctx.beginPath();
        ctx.arc(cx + 5 * scale, headY - 1 * scale, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(cx + 5 * scale, headY - 1 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx + 6 * scale, headY - 2 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eye outline
        ctx.strokeStyle = "#5a3a0a";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.ellipse(cx + 5 * scale, headY - 1 * scale, 3.5 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Left eye (gargoyle, glowing cyan gem - more detailed)
        ctx.fillStyle = `rgba(0, 200, 224, ${gemPulse})`;
        ctx.shadowColor = "#00c8e0";
        ctx.shadowBlur = 6 * scale;
        ctx.beginPath();
        ctx.arc(cx - 5 * scale, headY - 1 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#40e0ff";
        ctx.beginPath();
        ctx.arc(cx - 5 * scale, headY - 1 * scale, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c0ffff";
        ctx.beginPath();
        ctx.arc(cx - 5 * scale, headY - 1 * scale, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Stone eye socket
        ctx.strokeStyle = "#484040";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, headY - 1 * scale, 3.5 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Cream muzzle (right side)
        ctx.fillStyle = "#f5f0e8";
        ctx.beginPath();
        ctx.ellipse(cx + 2 * scale, headY + 5 * scale, 5 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Stone muzzle (left side)
        ctx.fillStyle = "#787068";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, headY + 5 * scale, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose (bigger, more detailed)
        ctx.fillStyle = "#2a1a0a";
        ctx.beginPath();
        ctx.ellipse(cx, headY + 4 * scale, 2.5 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4a3020";
        ctx.beginPath();
        ctx.arc(cx - 0.8 * scale, headY + 3.5 * scale, 0.6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, headY + 6 * scale);
        ctx.quadraticCurveTo(cx, headY + 7.5 * scale, cx + 2 * scale, headY + 6 * scale);
        ctx.stroke();

        // Whiskers (right side - long)
        ctx.strokeStyle = "rgba(90, 60, 30, 0.5)";
        ctx.lineWidth = 0.4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, headY + 5 * scale);
        ctx.lineTo(cx + 10 * scale, headY + 3 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, headY + 5.5 * scale);
        ctx.lineTo(cx + 10 * scale, headY + 6 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, headY + 6 * scale);
        ctx.lineTo(cx + 9 * scale, headY + 8 * scale);
        ctx.stroke();

        // Whisker dots
        ctx.fillStyle = "#5a3a1a";
        ctx.beginPath();
        ctx.arc(cx + 3 * scale, headY + 5 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, headY + 4.5 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3.5 * scale, headY + 5.5 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Fur cheek tuft (right)
        ctx.fillStyle = "#d0a030";
        ctx.beginPath();
        ctx.ellipse(cx + 8 * scale, headY + 2 * scale, 3 * scale, 2 * scale, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case "tenor": {
        cy += 6 * scale;
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const mouthVibrato = animated ? Math.sin(t * 5) * 0.5 : 0;
        const gemPulse = Math.sin(t * 2.5) * 0.3 + 0.7;

        // Purple sonic aura (layered for richness)
        for (let layer = 0; layer < 2; layer++) {
          const auraGrad = ctx.createRadialGradient(cx, cy, layer * 6 * scale, cx, cy, (26 + layer * 4) * scale);
          auraGrad.addColorStop(0, `rgba(160, 80, 200, ${(auraPulse * 0.2) / (layer + 1)})`);
          auraGrad.addColorStop(0.5, `rgba(120, 50, 160, ${(auraPulse * 0.12) / (layer + 1)})`);
          auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, (26 + layer * 4) * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Animated sonic rings
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

        // === LARGE FLOWING PURPLE CAPE WITH GOLD EDGE (behind body) ===
        const capeWave = animated ? Math.sin(t * 2) * 0.06 : 0;
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);
        const capeGrad = ctx.createLinearGradient(-18 * scale, 0, 18 * scale, 32 * scale);
        capeGrad.addColorStop(0, "#2a1050");
        capeGrad.addColorStop(0.3, "#3a1870");
        capeGrad.addColorStop(0.5, "#2a1050");
        capeGrad.addColorStop(0.7, "#3a1870");
        capeGrad.addColorStop(1, "#1a0838");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(-14 * scale, -2 * scale);
        ctx.quadraticCurveTo(-22 * scale + capeWave * 40, 14 * scale, -20 * scale + capeWave * 55, 32 * scale);
        ctx.quadraticCurveTo(-14 * scale + capeWave * 30, 36 * scale, -6 * scale, 34 * scale);
        ctx.quadraticCurveTo(0, 38 * scale + capeWave * 15, 6 * scale, 34 * scale);
        ctx.quadraticCurveTo(14 * scale - capeWave * 30, 36 * scale, 20 * scale - capeWave * 55, 32 * scale);
        ctx.quadraticCurveTo(22 * scale - capeWave * 40, 14 * scale, 14 * scale, -2 * scale);
        ctx.closePath();
        ctx.fill();
        // Cape inner folds
        ctx.fillStyle = "rgba(60, 20, 90, 0.3)";
        ctx.beginPath();
        ctx.moveTo(-4 * scale, 6 * scale);
        ctx.quadraticCurveTo(-10 * scale + capeWave * 20, 20 * scale, -7 * scale, 30 * scale);
        ctx.quadraticCurveTo(0, 26 * scale, 7 * scale, 30 * scale);
        ctx.quadraticCurveTo(10 * scale - capeWave * 20, 20 * scale, 4 * scale, 6 * scale);
        ctx.closePath();
        ctx.fill();
        // GOLD trim along entire cape edge
        ctx.strokeStyle = "#d4a030";
        ctx.shadowColor = "#e0b840";
        ctx.shadowBlur = 3 * scale;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-14 * scale, -2 * scale);
        ctx.quadraticCurveTo(-22 * scale + capeWave * 40, 14 * scale, -20 * scale + capeWave * 55, 32 * scale);
        ctx.quadraticCurveTo(-14 * scale + capeWave * 30, 36 * scale, -6 * scale, 34 * scale);
        ctx.quadraticCurveTo(0, 38 * scale + capeWave * 15, 6 * scale, 34 * scale);
        ctx.quadraticCurveTo(14 * scale - capeWave * 30, 36 * scale, 20 * scale - capeWave * 55, 32 * scale);
        ctx.quadraticCurveTo(22 * scale - capeWave * 40, 14 * scale, 14 * scale, -2 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // === DEEP PURPLE ROBE WITH VERTICAL STRIPES + GOLD TRIM ===
        const robeGrad = ctx.createLinearGradient(cx - 16 * scale, cy - 8 * scale, cx + 16 * scale, cy + 16 * scale);
        robeGrad.addColorStop(0, "#2a1050");
        robeGrad.addColorStop(0.2, "#3a1870");
        robeGrad.addColorStop(0.5, "#4a2090");
        robeGrad.addColorStop(0.8, "#3a1870");
        robeGrad.addColorStop(1, "#2a1050");
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

        // Vertical stripes on robe
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 18 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx, cy - 14 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx + 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 18 * scale + bounce);
        ctx.closePath();
        ctx.clip();
        ctx.strokeStyle = "rgba(80, 40, 140, 0.5)";
        ctx.lineWidth = 1.2 * scale;
        for (let stripe = -7; stripe <= 7; stripe++) {
          ctx.beginPath();
          ctx.moveTo(cx + stripe * 4 * scale, cy - 14 * scale + bounce);
          ctx.lineTo(cx + stripe * 4 * scale, cy + 18 * scale + bounce);
          ctx.stroke();
        }
        ctx.restore();

        // THICK GOLD TRIM on robe edges
        ctx.strokeStyle = "#d4a030";
        ctx.shadowColor = "#e0b840";
        ctx.shadowBlur = 2 * scale;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 18 * scale + bounce);
        ctx.lineTo(cx - 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 12 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, cy + 18 * scale + bounce);
        ctx.lineTo(cx + 16 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 12 * scale + bounce);
        ctx.stroke();
        // Gold bottom hem
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy + 18 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy + 18 * scale + bounce);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // === V-SHAPED ROBE SKIRT PLATES ===
        for (let i = 0; i < 7; i++) {
          const plateX = cx + (-12 + i * 4) * scale;
          const distFromCenter = Math.abs(-12 + i * 4);
          const vDrop = (12 - distFromCenter) * 0.4 * scale;
          const plateY = cy + 17 * scale + bounce + vDrop;
          const plateH = 6 * scale + vDrop * 0.4;
          const plateW = 3.5 * scale;
          const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
          plateGrad.addColorStop(0, "#4a2078");
          plateGrad.addColorStop(0.5, "#381860");
          plateGrad.addColorStop(1, "#2a1048");
          ctx.fillStyle = plateGrad;
          ctx.beginPath();
          ctx.moveTo(plateX - plateW / 2, plateY);
          ctx.lineTo(plateX + plateW / 2, plateY);
          ctx.lineTo(plateX + plateW / 2 - 0.6 * scale, plateY + plateH);
          ctx.lineTo(plateX - plateW / 2 + 0.6 * scale, plateY + plateH);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#6a30a0";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Gold trim on each plate bottom
          ctx.strokeStyle = "#c89828";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(plateX - plateW / 2 + 0.8 * scale, plateY + plateH - 0.5 * scale);
          ctx.lineTo(plateX + plateW / 2 - 0.8 * scale, plateY + plateH - 0.5 * scale);
          ctx.stroke();
        }

        // Robe front opening with darker lapels
        for (const side of [-1, 1]) {
          ctx.fillStyle = "#3a1868";
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 8 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 16 * scale, cy + 10 * scale + bounce);
          ctx.lineTo(cx + side * 14 * scale, cy + 10 * scale + bounce);
          ctx.closePath();
          ctx.fill();
          // Gold inner lapel edge
          ctx.strokeStyle = "#c89828";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 14 * scale, cy + 10 * scale + bounce);
          ctx.stroke();
        }

        // Golden sash/cummerbund (wider, bolder)
        const sashGrad = ctx.createLinearGradient(cx - 10 * scale, cy + 4 * scale, cx + 10 * scale, cy + 9 * scale);
        sashGrad.addColorStop(0, "#b88020");
        sashGrad.addColorStop(0.3, "#d4a030");
        sashGrad.addColorStop(0.5, "#e8c050");
        sashGrad.addColorStop(0.7, "#d4a030");
        sashGrad.addColorStop(1, "#b88020");
        ctx.fillStyle = sashGrad;
        ctx.fillRect(cx - 8 * scale, cy + 4 * scale + bounce, 16 * scale, 5 * scale);
        ctx.strokeStyle = "#9a6810";
        ctx.lineWidth = 0.8 * scale;
        ctx.strokeRect(cx - 8 * scale, cy + 4 * scale + bounce, 16 * scale, 5 * scale);
        // Gold buckle center
        ctx.fillStyle = "#f0d060";
        ctx.beginPath();
        ctx.roundRect(cx - 2 * scale, cy + 5 * scale + bounce, 4 * scale, 3 * scale, 0.5 * scale);
        ctx.fill();

        // White ruffled shirt front
        ctx.fillStyle = "#f0f0f0";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 4 * scale, cy + 4 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy + 4 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d8d8d8";
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 4; i++) {
          const rY = cy - 6 * scale + i * 3 * scale + bounce;
          ctx.beginPath();
          ctx.moveTo(cx - 3.5 * scale, rY);
          ctx.quadraticCurveTo(cx, rY + 1.5 * scale, cx + 3.5 * scale, rY);
          ctx.stroke();
        }

        // Purple bow tie with gold gem
        ctx.fillStyle = "#5a20a0";
        ctx.shadowColor = "#8050d0";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 11 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 5 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 11 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 5 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Gold gem center
        ctx.fillStyle = "#e8c040";
        ctx.shadowColor = "#f0d060";
        ctx.shadowBlur = 5 * scale * gemPulse;
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * scale + bounce, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // BIG GOLD EPAULETS with fringe
        for (const side of [-1, 1]) {
          // Epaulet base
          const epGrad = ctx.createRadialGradient(cx + side * 15 * scale, cy - 10 * scale + bounce, 0, cx + side * 15 * scale, cy - 10 * scale + bounce, 6 * scale);
          epGrad.addColorStop(0, "#f0d060");
          epGrad.addColorStop(0.5, "#d4a030");
          epGrad.addColorStop(1, "#b08020");
          ctx.fillStyle = epGrad;
          ctx.beginPath();
          ctx.ellipse(cx + side * 15 * scale, cy - 10 * scale + bounce, 6 * scale, 3.5 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#9a6810";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          // Gold fringe
          ctx.strokeStyle = "#d4a030";
          ctx.lineWidth = 1 * scale;
          for (let f = 0; f < 5; f++) {
            ctx.beginPath();
            ctx.moveTo(cx + side * (12 + f * 1.2) * scale, cy - 7.5 * scale + bounce);
            ctx.lineTo(cx + side * (12 + f * 1.2) * scale, cy - 4 * scale + bounce);
            ctx.stroke();
          }
        }

        // === CONDUCTOR ARMS ===
        const armGesture = animated ? Math.sin(t * 2) * 0.25 : 0;

        // Left arm
        ctx.save();
        ctx.translate(cx - 15 * scale, cy - 4 * scale + bounce);
        ctx.rotate(-0.9 + armGesture);
        // Upper arm - purple sleeve with gold shoulder ring
        {
          const upperGrad = ctx.createLinearGradient(-5 * scale, -2 * scale, 5 * scale, 10 * scale);
          upperGrad.addColorStop(0, "#4a2090");
          upperGrad.addColorStop(0.5, "#3a1870");
          upperGrad.addColorStop(1, "#2a1050");
          ctx.fillStyle = upperGrad;
          ctx.beginPath();
          ctx.ellipse(0, 3 * scale, 5.5 * scale, 7 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1a0838";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Gold shoulder ring
          ctx.strokeStyle = "#d4a030";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.ellipse(0, -2 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Forearm - separate segment
        {
          const forearmGrad = ctx.createLinearGradient(-4 * scale, 8 * scale, 4 * scale, 16 * scale);
          forearmGrad.addColorStop(0, "#3a1870");
          forearmGrad.addColorStop(1, "#2a1050");
          ctx.fillStyle = forearmGrad;
          ctx.beginPath();
          ctx.ellipse(-1 * scale, 12 * scale, 4.5 * scale, 5 * scale, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1a0838";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Gold elbow band
          ctx.strokeStyle = "#c89828";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.ellipse(-0.5 * scale, 8 * scale, 4.8 * scale, 1.5 * scale, 0.1, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Gold ornate cuff with filigree
        ctx.fillStyle = "#d4a030";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 16 * scale, 5.5 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f0d060";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 15 * scale, 4.5 * scale, 1.5 * scale, 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#b08020";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 16 * scale, 5.5 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
        ctx.stroke();
        // Hand with fingers
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 19 * scale, 3.5 * scale, 4 * scale, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e0c0a0";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        for (let f = 0; f < 5; f++) {
          const fingerAngle = -0.5 + f * 0.25;
          ctx.fillStyle = "#ffe0bd";
          ctx.beginPath();
          ctx.ellipse(Math.cos(fingerAngle) * 3 * scale, 21 * scale + Math.sin(fingerAngle) * scale, 1 * scale, 2.5 * scale, fingerAngle, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#e0c0a0";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
        }
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(cx + 15 * scale, cy - 4 * scale + bounce);
        ctx.rotate(0.9 - armGesture);
        // Upper arm
        {
          const upperGrad = ctx.createLinearGradient(-5 * scale, -2 * scale, 5 * scale, 10 * scale);
          upperGrad.addColorStop(0, "#4a2090");
          upperGrad.addColorStop(0.5, "#3a1870");
          upperGrad.addColorStop(1, "#2a1050");
          ctx.fillStyle = upperGrad;
          ctx.beginPath();
          ctx.ellipse(0, 3 * scale, 5.5 * scale, 7 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1a0838";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#d4a030";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.ellipse(0, -2 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Forearm
        {
          const forearmGrad = ctx.createLinearGradient(-4 * scale, 8 * scale, 4 * scale, 16 * scale);
          forearmGrad.addColorStop(0, "#3a1870");
          forearmGrad.addColorStop(1, "#2a1050");
          ctx.fillStyle = forearmGrad;
          ctx.beginPath();
          ctx.ellipse(1 * scale, 12 * scale, 4.5 * scale, 5 * scale, -0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1a0838";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#c89828";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.ellipse(0.5 * scale, 8 * scale, 4.8 * scale, 1.5 * scale, -0.1, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Gold ornate cuff
        ctx.fillStyle = "#d4a030";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 16 * scale, 5.5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f0d060";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.ellipse(1 * scale, 15 * scale, 4.5 * scale, 1.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#b08020";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(1 * scale, 16 * scale, 5.5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        // Hand holding conductor's baton
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(0, 19 * scale, 3.5 * scale, 4 * scale, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e0c0a0";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        for (let f = 0; f < 5; f++) {
          const fingerAngle = 0.5 - f * 0.25;
          ctx.fillStyle = "#ffe0bd";
          ctx.beginPath();
          ctx.ellipse(Math.cos(fingerAngle) * 3 * scale, 21 * scale + Math.sin(fingerAngle) * scale, 1 * scale, 2.5 * scale, fingerAngle, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#e0c0a0";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
        }
        // Conductor's baton
        ctx.strokeStyle = "#f0e8d0";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(1 * scale, 18 * scale);
        ctx.lineTo(4 * scale, 4 * scale);
        ctx.stroke();
        ctx.fillStyle = "#d4a030";
        ctx.beginPath();
        ctx.arc(4 * scale, 3.5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // === HEAD ===
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 18 * scale + bounce, 10 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark pompadour hair
        const hairGrad = ctx.createRadialGradient(cx, cy - 26 * scale + bounce, 0, cx, cy - 24 * scale + bounce, 14 * scale);
        hairGrad.addColorStop(0, "#2a1505");
        hairGrad.addColorStop(0.5, "#1a0a00");
        hairGrad.addColorStop(1, "#0f0500");
        ctx.fillStyle = hairGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 18 * scale + bounce);
        ctx.bezierCurveTo(cx - 12 * scale, cy - 26 * scale + bounce, cx - 10 * scale, cy - 34 * scale + bounce, cx - 5 * scale, cy - 32 * scale + bounce);
        ctx.bezierCurveTo(cx - 2 * scale, cy - 36 * scale + bounce, cx + 2 * scale, cy - 36 * scale + bounce, cx + 5 * scale, cy - 32 * scale + bounce);
        ctx.bezierCurveTo(cx + 10 * scale, cy - 34 * scale + bounce, cx + 12 * scale, cy - 26 * scale + bounce, cx + 10 * scale, cy - 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(100, 65, 35, 0.5)";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 30 * scale + bounce, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a0a00";
        ctx.beginPath();
        ctx.ellipse(cx - 10 * scale, cy - 20 * scale + bounce, 3 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10 * scale, cy - 20 * scale + bounce, 3 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Wide open singing mouth
        const mouthHeight = 5 + mouthVibrato;
        ctx.fillStyle = "#3a1a1a";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale + bounce, 5 * scale, mouthHeight * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cc6060";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 11 * scale + bounce, 3 * scale, 2 * scale, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 17 * scale + bounce, 4 * scale, 1.5 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Closed happy eyes
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 20 * scale + bounce, 2.5 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 4 * scale, cy - 20 * scale + bounce, 2.5 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(cx - 4 * scale, cy - 25 * scale + bounce, cx - 2 * scale, cy - 23 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 7 * scale, cy - 24 * scale + bounce);
        ctx.quadraticCurveTo(cx + 4 * scale, cy - 25 * scale + bounce, cx + 2 * scale, cy - 23 * scale + bounce);
        ctx.stroke();

        // Popped collar with gold edge
        for (const side of [-1, 1]) {
          ctx.fillStyle = "#3a1868";
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 10 * scale, cy - 17 * scale + bounce);
          ctx.lineTo(cx + side * 13 * scale, cy - 15 * scale + bounce);
          ctx.lineTo(cx + side * 9 * scale, cy - 8 * scale + bounce);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#d4a030";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 10 * scale, cy - 17 * scale + bounce);
          ctx.lineTo(cx + side * 13 * scale, cy - 15 * scale + bounce);
          ctx.stroke();
        }

        // === PURPLE MUSICAL NOTES ORBITING HEAD ===
        {
          const headY = cy - 18 * scale + bounce;
          const noteSymbols = ["♪", "♫", "♩", "♬", "♪", "♫", "♩", "♬"];
          const noteCount = 8;
          for (let i = 0; i < noteCount; i++) {
            const angle = (i * Math.PI * 2 / noteCount) + (animated ? t * 0.8 : 0);
            const orbitRx = 16 * scale;
            const orbitRy = 8 * scale;
            const bobY = animated ? Math.sin(t * 2 + i * 1.2) * 2 * scale : 0;
            const noteX = cx + Math.cos(angle) * orbitRx;
            const noteY = headY + Math.sin(angle) * orbitRy + bobY - 4 * scale;
            const depth = 0.6 + Math.sin(angle) * 0.4;
            const noteSize = (6 + depth * 4) * scale;
            ctx.font = `bold ${noteSize}px serif`;
            ctx.textAlign = "center";
            ctx.fillStyle = `rgba(180, 80, 240, ${0.6 + depth * 0.35})`;
            ctx.shadowColor = "#b050f0";
            ctx.shadowBlur = 6 * scale * depth;
            ctx.fillText(noteSymbols[i], noteX, noteY);
          }
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "scott": {
        cy += 6 * scale;
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const letterFloat = animated ? t * 0.5 : 0;
        const penStroke = animated ? Math.sin(t * 3) * 0.04 : 0;

        // Cyan literary aura (layered)
        for (let layer = 0; layer < 2; layer++) {
          const auraGrad = ctx.createRadialGradient(cx, cy, layer * 5 * scale, cx, cy, (26 + layer * 4) * scale);
          auraGrad.addColorStop(0, `rgba(0, 200, 200, ${(auraPulse * 0.22) / (layer + 1)})`);
          auraGrad.addColorStop(0.5, `rgba(0, 160, 180, ${(auraPulse * 0.12) / (layer + 1)})`);
          auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, (26 + layer * 4) * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === CYAN WORDS ORBITING HEAD ===
        {
          const headY = cy - 18 * scale + bounce;
          const words = ["GATSBY", "dream", "green", "light", "OLD", "SPORT", "hope", "boats"];
          const wordCount = 8;
          for (let i = 0; i < wordCount; i++) {
            const angle = (i * Math.PI * 2 / wordCount) + (animated ? letterFloat : 0);
            const orbitRx = 18 * scale;
            const orbitRy = 9 * scale;
            const bobY = animated ? Math.sin(t * 1.5 + i * 0.9) * 2 * scale : 0;
            const wordX = cx + Math.cos(angle) * orbitRx;
            const wordY = headY + Math.sin(angle) * orbitRy + bobY - 4 * scale;
            const depth = 0.6 + Math.sin(angle) * 0.4;
            const fontSize = (4 + depth * 3 + (i % 2)) * scale;
            ctx.font = `italic ${fontSize}px Georgia`;
            ctx.textAlign = "center";
            ctx.fillStyle = `rgba(0, 220, 210, ${0.45 + depth * 0.4})`;
            ctx.shadowColor = "#00e0d0";
            ctx.shadowBlur = 5 * scale * depth;
            ctx.fillText(words[i], wordX, wordY);
          }
          ctx.shadowBlur = 0;
        }

        // === DARK CAPE WITH CYAN TRIM (behind body) ===
        const capeWave = animated ? Math.sin(t * 2.5) * 0.06 : 0;
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);
        const capeGrad = ctx.createLinearGradient(-16 * scale, 0, 16 * scale, 28 * scale);
        capeGrad.addColorStop(0, "#1a2a30");
        capeGrad.addColorStop(0.3, "#253840");
        capeGrad.addColorStop(0.5, "#1a2a30");
        capeGrad.addColorStop(0.7, "#253840");
        capeGrad.addColorStop(1, "#101820");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(-12 * scale, 0);
        ctx.quadraticCurveTo(-20 * scale + capeWave * 40, 14 * scale, -18 * scale + capeWave * 55, 30 * scale);
        ctx.quadraticCurveTo(-12 * scale + capeWave * 30, 34 * scale, -6 * scale, 32 * scale);
        ctx.quadraticCurveTo(0, 36 * scale + capeWave * 15, 6 * scale, 32 * scale);
        ctx.quadraticCurveTo(12 * scale - capeWave * 30, 34 * scale, 18 * scale - capeWave * 55, 30 * scale);
        ctx.quadraticCurveTo(20 * scale - capeWave * 40, 14 * scale, 12 * scale, 0);
        ctx.closePath();
        ctx.fill();
        // Cape inner folds
        ctx.fillStyle = "rgba(0, 40, 50, 0.3)";
        ctx.beginPath();
        ctx.moveTo(-4 * scale, 6 * scale);
        ctx.quadraticCurveTo(-9 * scale + capeWave * 20, 18 * scale, -6 * scale, 28 * scale);
        ctx.quadraticCurveTo(0, 24 * scale, 6 * scale, 28 * scale);
        ctx.quadraticCurveTo(9 * scale - capeWave * 20, 18 * scale, 4 * scale, 6 * scale);
        ctx.closePath();
        ctx.fill();
        // Cyan shimmer along cape edge
        ctx.strokeStyle = "#00d0c8";
        ctx.shadowColor = "#00e0d8";
        ctx.shadowBlur = 5 * scale;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(-18 * scale + capeWave * 55, 30 * scale);
        ctx.quadraticCurveTo(0, 36 * scale + capeWave * 15, 18 * scale - capeWave * 55, 30 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Cyan cape clasps
        ctx.fillStyle = "#40d0d0";
        ctx.shadowColor = "#00e0e0";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.arc(-9 * scale, 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(9 * scale, 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#208080";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        ctx.restore();

        // === DARK CHARCOAL ROBE BODY ===
        const robeGrad = ctx.createLinearGradient(cx - 16 * scale, cy - 8 * scale, cx + 16 * scale, cy + 16 * scale);
        robeGrad.addColorStop(0, "#1a2228");
        robeGrad.addColorStop(0.2, "#283438");
        robeGrad.addColorStop(0.5, "#2e3e42");
        robeGrad.addColorStop(0.8, "#283438");
        robeGrad.addColorStop(1, "#1a2228");
        ctx.fillStyle = robeGrad;
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
        ctx.strokeStyle = "#0a1418";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Robe trim - cyan glow
        ctx.strokeStyle = "#00c8c0";
        ctx.shadowColor = "#00e0d8";
        ctx.shadowBlur = 5 * scale;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx - 14 * scale, cy - 4 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 12 * scale, cy + 16 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 4 * scale + bounce);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Robe lapels (dark with cyan inner edge)
        for (const side of [-1, 1]) {
          const lapelGrad = ctx.createLinearGradient(cx + side * 5 * scale, cy - 10 * scale, cx + side * 14 * scale, cy + 6 * scale);
          lapelGrad.addColorStop(0, "#2a3a40");
          lapelGrad.addColorStop(0.5, "#1e2e34");
          lapelGrad.addColorStop(1, "#142228");
          ctx.fillStyle = lapelGrad;
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 12 * scale, cy - 8 * scale + bounce);
          ctx.lineTo(cx + side * 12 * scale, cy + 6 * scale + bounce);
          ctx.lineTo(cx + side * 5 * scale, cy + 5 * scale + bounce);
          ctx.closePath();
          ctx.fill();
          // Inner cyan edge on lapel
          ctx.strokeStyle = "rgba(0, 200, 200, 0.3)";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, cy - 10 * scale + bounce);
          ctx.lineTo(cx + side * 5 * scale, cy + 5 * scale + bounce);
          ctx.stroke();
        }

        // Subtle text embroidery on robe (cyan)
        ctx.fillStyle = "rgba(0, 180, 180, 0.2)";
        ctx.font = `italic ${4.5 * scale}px Georgia`;
        ctx.textAlign = "center";
        ctx.fillText("So we beat on...", cx, cy + 2 * scale + bounce);
        ctx.fillText("boats against", cx, cy + 8 * scale + bounce);

        // Dark sash with cyan-gem buckle
        ctx.fillStyle = "#1a2a2e";
        ctx.fillRect(cx - 12 * scale, cy + 6 * scale + bounce, 24 * scale, 3 * scale);
        ctx.strokeStyle = "#0a1a20";
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(cx - 12 * scale, cy + 6 * scale + bounce, 24 * scale, 3 * scale);
        ctx.fillStyle = "#00d0c8";
        ctx.shadowColor = "#00ffe0";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.roundRect(cx - 2.5 * scale, cy + 5.5 * scale + bounce, 5 * scale, 4 * scale, 1 * scale);
        ctx.fill();
        ctx.shadowBlur = 0;

        // White shirt peek with ruffles
        ctx.fillStyle = "#e8e8e8";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 12 * scale + bounce);
        ctx.lineTo(cx - 5 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 5 * scale, cy - 4 * scale + bounce);
        ctx.lineTo(cx + 4 * scale, cy - 12 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d0d0d0";
        ctx.lineWidth = 0.8 * scale;
        for (let i = 0; i < 3; i++) {
          const rY = cy - 10 * scale + i * 2.5 * scale + bounce;
          ctx.beginPath();
          ctx.moveTo(cx - 3.5 * scale, rY);
          ctx.quadraticCurveTo(cx, rY + 1.5 * scale, cx + 3.5 * scale, rY);
          ctx.stroke();
        }

        // Cyan tie
        const tieGrad = ctx.createLinearGradient(cx, cy - 10 * scale, cx, cy + 6 * scale);
        tieGrad.addColorStop(0, "#00b8b0");
        tieGrad.addColorStop(0.5, "#008888");
        tieGrad.addColorStop(1, "#006060");
        ctx.fillStyle = tieGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10 * scale + bounce);
        ctx.lineTo(cx - 3 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 3 * scale, cy + 2 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Cyan buttons
        for (let row = 0; row < 3; row++) {
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#40c8c0";
            ctx.shadowColor = "#00e0d8";
            ctx.shadowBlur = 2 * scale;
            ctx.beginPath();
            ctx.arc(cx + side * 4 * scale, cy - 4 * scale + row * 4 * scale + bounce, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;

        // === ORNATE LAYERED EPAULETTES ===
        for (const side of [-1, 1]) {
          const epX = cx + side * 13 * scale;
          const epY = cy - 10 * scale + bounce;
          // Outer plate - dark charcoal with cyan edge
          const outerGrad = ctx.createRadialGradient(epX, epY, 0, epX, epY, 6 * scale);
          outerGrad.addColorStop(0, "#506068");
          outerGrad.addColorStop(0.6, "#3a4850");
          outerGrad.addColorStop(1, "#283438");
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.ellipse(epX, epY, 7 * scale, 4 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#2a3a40";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Raised middle plate
          const midGrad = ctx.createRadialGradient(epX, epY - 0.5 * scale, 0, epX, epY, 5 * scale);
          midGrad.addColorStop(0, "#687880");
          midGrad.addColorStop(0.7, "#506068");
          midGrad.addColorStop(1, "#3a4850");
          ctx.fillStyle = midGrad;
          ctx.beginPath();
          ctx.ellipse(epX, epY - 0.5 * scale, 5.5 * scale, 3 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          // Center raised dome
          ctx.fillStyle = "#708890";
          ctx.beginPath();
          ctx.ellipse(epX, epY - 0.8 * scale, 3 * scale, 1.8 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          // Cyan glow ring
          ctx.strokeStyle = "#00b8b0";
          ctx.shadowColor = "#00e0d8";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.ellipse(epX, epY - 0.5 * scale, 5 * scale, 2.8 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Glowing cyan center gem
          ctx.fillStyle = `rgba(0, 220, 220, ${0.7 + Math.sin(t * 2.5) * 0.2})`;
          ctx.shadowColor = "#00e8e0";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(epX, epY - 0.8 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Decorative rivets around outer edge
          ctx.fillStyle = "#90a0a8";
          for (let r = 0; r < 6; r++) {
            const rAngle = (r / 6) * Math.PI * 2 + side * 0.3;
            const rX = epX + Math.cos(rAngle) * 5.8 * scale;
            const rY = epY + Math.sin(rAngle) * 3.2 * scale;
            ctx.beginPath();
            ctx.arc(rX, rY, 0.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          // Fringe tassels - longer with cyan bead tips
          const fringeWave = animated ? Math.sin(t * 2 + side) * 0.3 : 0;
          ctx.lineWidth = 0.7 * scale;
          for (let f = 0; f < 7; f++) {
            const fAngle = (f / 6 - 0.5) * 1.2 + side * 0.3;
            const fStartX = epX + Math.cos(fAngle + Math.PI * 0.5) * 6 * scale * side;
            const fStartY = epY + 3 * scale;
            const fLen = (4 + Math.sin(f * 1.5) * 1.5) * scale;
            const fWobble = animated ? Math.sin(t * 3 + f * 0.8) * 0.8 * scale : 0;
            ctx.strokeStyle = "#506068";
            ctx.beginPath();
            ctx.moveTo(fStartX, fStartY);
            ctx.lineTo(fStartX + fWobble, fStartY + fLen);
            ctx.stroke();
            // Cyan bead at tassel tip
            ctx.fillStyle = `rgba(0, 200, 210, ${0.5 + fringeWave * 0.3})`;
            ctx.beginPath();
            ctx.arc(fStartX + fWobble, fStartY + fLen + 0.5 * scale, 0.6 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // === ARMS IN WRITING POSE ===
        const holdingMotion = animated ? Math.sin(t * 1.5) * 0.05 : 0;
        const writeX = cx - 2 * scale;
        const writeY = cy + 8 * scale + bounce;

        // --- Open book (held in front, between both hands) ---
        ctx.save();
        ctx.translate(writeX, writeY);
        ctx.rotate(-0.05);
        // Book cover (dark blue)
        ctx.fillStyle = "#0e2238";
        ctx.beginPath();
        ctx.roundRect(-9 * scale, -1 * scale, 18 * scale, 12 * scale, 1.5 * scale);
        ctx.fill();
        ctx.strokeStyle = "#061828";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Left page
        const leftPageGrad = ctx.createLinearGradient(-8 * scale, 0, 0, 10 * scale);
        leftPageGrad.addColorStop(0, "#f8f0e0");
        leftPageGrad.addColorStop(1, "#e8dcc8");
        ctx.fillStyle = leftPageGrad;
        ctx.beginPath();
        ctx.roundRect(-8 * scale, 0, 8 * scale, 10 * scale, [1 * scale, 0, 0, 1 * scale]);
        ctx.fill();
        // Right page
        const rightPageGrad = ctx.createLinearGradient(0, 0, 8 * scale, 10 * scale);
        rightPageGrad.addColorStop(0, "#f5edd8");
        rightPageGrad.addColorStop(1, "#efe4d0");
        ctx.fillStyle = rightPageGrad;
        ctx.beginPath();
        ctx.roundRect(0, 0, 8 * scale, 10 * scale, [0, 1 * scale, 1 * scale, 0]);
        ctx.fill();
        // Spine crease
        ctx.strokeStyle = "#c0b090";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -0.5 * scale);
        ctx.lineTo(0, 10.5 * scale);
        ctx.stroke();
        // Page shadow along spine
        ctx.fillStyle = "rgba(160, 140, 110, 0.15)";
        ctx.fillRect(-1 * scale, 0, 2 * scale, 10 * scale);
        // Written text lines on left page
        ctx.strokeStyle = "#3a5070";
        ctx.lineWidth = 0.4 * scale;
        for (let ln = 0; ln < 5; ln++) {
          const lineY = 1.5 * scale + ln * 1.8 * scale;
          ctx.beginPath();
          ctx.moveTo(-7 * scale, lineY);
          ctx.lineTo(-1.5 * scale, lineY);
          ctx.stroke();
        }
        // Animated writing on right page
        if (animated) {
          const writePhase = (t * 0.8) % 4;
          const linesWritten = Math.floor(writePhase);
          ctx.strokeStyle = `rgba(0, 120, 140, 0.6)`;
          ctx.lineWidth = 0.4 * scale;
          for (let ln = 0; ln < Math.min(linesWritten, 4); ln++) {
            const lineY = 1.5 * scale + ln * 1.8 * scale;
            ctx.beginPath();
            ctx.moveTo(1.5 * scale, lineY);
            ctx.lineTo(7 * scale, lineY);
            ctx.stroke();
          }
          if (linesWritten < 4) {
            const partialProgress = writePhase - linesWritten;
            const lineY = 1.5 * scale + linesWritten * 1.8 * scale;
            ctx.beginPath();
            ctx.moveTo(1.5 * scale, lineY);
            ctx.lineTo(1.5 * scale + partialProgress * 5.5 * scale, lineY);
            ctx.stroke();
          }
        } else {
          ctx.strokeStyle = "rgba(0, 120, 140, 0.6)";
          ctx.lineWidth = 0.4 * scale;
          for (let ln = 0; ln < 3; ln++) {
            const lineY = 1.5 * scale + ln * 1.8 * scale;
            ctx.beginPath();
            ctx.moveTo(1.5 * scale, lineY);
            ctx.lineTo(7 * scale, lineY);
            ctx.stroke();
          }
        }
        // Gold trim on book cover edges
        ctx.strokeStyle = "#c0a030";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.roundRect(-9 * scale, -1 * scale, 18 * scale, 12 * scale, 1.5 * scale);
        ctx.stroke();
        // "GATSBY" title embossed on front cover bottom edge
        ctx.fillStyle = "#c0a030";
        ctx.font = `bold ${2 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("GATSBY", 0, 12.5 * scale);
        ctx.restore();

        // --- Left arm (supporting book from below) ---
        ctx.save();
        ctx.translate(cx - 10 * scale, cy - 2 * scale + bounce);
        ctx.rotate(0.25 + holdingMotion);
        // Shoulder seam ring
        ctx.strokeStyle = "rgba(0, 160, 170, 0.3)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.ellipse(0, -1 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Upper arm
        const lUpperGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 8 * scale);
        lUpperGrad.addColorStop(0, "#303c42");
        lUpperGrad.addColorStop(0.5, "#283438");
        lUpperGrad.addColorStop(1, "#1e2a30");
        ctx.fillStyle = lUpperGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 5 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2428";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Elbow accent band
        ctx.strokeStyle = "rgba(0, 180, 180, 0.25)";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.ellipse(0.5 * scale, 9 * scale, 4.5 * scale, 1.5 * scale, 0.1, 0, Math.PI * 2);
        ctx.stroke();
        // Forearm (angled inward toward book)
        const lForeGrad = ctx.createLinearGradient(-3 * scale, 9 * scale, 3 * scale, 16 * scale);
        lForeGrad.addColorStop(0, "#283438");
        lForeGrad.addColorStop(1, "#1a2228");
        ctx.fillStyle = lForeGrad;
        ctx.beginPath();
        ctx.ellipse(1 * scale, 12 * scale, 4.5 * scale, 5 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2428";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Ornate cuff
        const lCuffGrad = ctx.createLinearGradient(-5 * scale, 15 * scale, 5 * scale, 17 * scale);
        lCuffGrad.addColorStop(0, "#384850");
        lCuffGrad.addColorStop(0.5, "#2a3a42");
        lCuffGrad.addColorStop(1, "#1e2e34");
        ctx.fillStyle = lCuffGrad;
        ctx.beginPath();
        ctx.ellipse(1 * scale, 16 * scale, 5.5 * scale, 2.5 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 210, 210, 0.5)";
        ctx.shadowColor = "#00d0d0";
        ctx.shadowBlur = 3 * scale;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(1 * scale, 16 * scale, 5.5 * scale, 2.5 * scale, 0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Hand cupping under book
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(2 * scale, 18 * scale, 3.5 * scale, 2.5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e0c0a0";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Finger outlines (curled under book)
        ctx.strokeStyle = "#ddb898";
        ctx.lineWidth = 0.5 * scale;
        for (let fi = 0; fi < 4; fi++) {
          const fx = 0.5 * scale + fi * 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(fx, 19.5 * scale);
          ctx.quadraticCurveTo(fx + 0.5 * scale, 21 * scale, fx - 0.3 * scale, 20 * scale);
          ctx.stroke();
        }
        ctx.restore();

        // --- Right arm with fountain pen (writing on book) ---
        ctx.save();
        ctx.translate(cx + 10 * scale, cy - 2 * scale + bounce);
        ctx.rotate(-0.15 - holdingMotion + penStroke);
        // Shoulder seam ring
        ctx.strokeStyle = "rgba(0, 160, 170, 0.3)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.ellipse(0, -1 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Upper arm
        const rUpperGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 8 * scale);
        rUpperGrad.addColorStop(0, "#303c42");
        rUpperGrad.addColorStop(0.5, "#283438");
        rUpperGrad.addColorStop(1, "#1e2a30");
        ctx.fillStyle = rUpperGrad;
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 5 * scale, 6 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2428";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Elbow accent band
        ctx.strokeStyle = "rgba(0, 180, 180, 0.25)";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.ellipse(-0.5 * scale, 9 * scale, 4.5 * scale, 1.5 * scale, -0.1, 0, Math.PI * 2);
        ctx.stroke();
        // Forearm (angled inward toward book)
        const rForeGrad = ctx.createLinearGradient(-3 * scale, 9 * scale, 3 * scale, 16 * scale);
        rForeGrad.addColorStop(0, "#283438");
        rForeGrad.addColorStop(1, "#1a2228");
        ctx.fillStyle = rForeGrad;
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 12 * scale, 4.5 * scale, 5 * scale, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2428";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Ornate cuff
        const rCuffGrad = ctx.createLinearGradient(-5 * scale, 15 * scale, 5 * scale, 17 * scale);
        rCuffGrad.addColorStop(0, "#384850");
        rCuffGrad.addColorStop(0.5, "#2a3a42");
        rCuffGrad.addColorStop(1, "#1e2e34");
        ctx.fillStyle = rCuffGrad;
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 16 * scale, 5.5 * scale, 2.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 210, 210, 0.5)";
        ctx.shadowColor = "#00d0d0";
        ctx.shadowBlur = 3 * scale;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 16 * scale, 5.5 * scale, 2.5 * scale, -0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Hand gripping pen
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(-2 * scale, 18 * scale, 3 * scale, 2.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e0c0a0";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Fingers curled around pen
        ctx.strokeStyle = "#ddb898";
        ctx.lineWidth = 0.5 * scale;
        for (let fi = 0; fi < 3; fi++) {
          ctx.beginPath();
          ctx.arc(-2.5 * scale + fi * 1.2 * scale, 19 * scale, 1.2 * scale, -0.5, Math.PI * 0.8);
          ctx.stroke();
        }
        // Fountain pen (angled down toward book)
        ctx.save();
        ctx.translate(-2 * scale, 18 * scale);
        ctx.rotate(0.5);
        // Pen barrel
        ctx.fillStyle = "#1a1a2a";
        ctx.beginPath();
        ctx.roundRect(-1 * scale, -6 * scale, 2 * scale, 14 * scale, 0.5 * scale);
        ctx.fill();
        ctx.strokeStyle = "#0a0a1a";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Barrel ring
        ctx.fillStyle = "#c0a030";
        ctx.beginPath();
        ctx.roundRect(-1.5 * scale, -5 * scale, 3 * scale, 1.8 * scale, 0.3 * scale);
        ctx.fill();
        // Pen clip
        ctx.strokeStyle = "#c0a030";
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(1 * scale, -5 * scale);
        ctx.lineTo(1 * scale, 0);
        ctx.lineTo(0.5 * scale, 0.5 * scale);
        ctx.stroke();
        // Gold nib
        ctx.fillStyle = "#c0a030";
        ctx.beginPath();
        ctx.moveTo(-0.8 * scale, 8 * scale);
        ctx.lineTo(0, 12 * scale);
        ctx.lineTo(0.8 * scale, 8 * scale);
        ctx.closePath();
        ctx.fill();
        // Nib slit
        ctx.strokeStyle = "#806010";
        ctx.lineWidth = 0.3 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 8 * scale);
        ctx.lineTo(0, 11.5 * scale);
        ctx.stroke();
        // Ink at nib tip (touching book)
        ctx.fillStyle = `rgba(0, 180, 210, ${0.5 + (animated ? Math.sin(t * 3) * 0.2 : 0)})`;
        ctx.shadowColor = "#00c8e0";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        ctx.arc(0, 12 * scale, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.restore();

        // === MINIMAL HELMET - side protections (behind head) ===
        {
          const hY = cy - 18 * scale + bounce;
          ctx.save();
          // Left side guard
          ctx.fillStyle = "#2a3a40";
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, hY - 6 * scale);
          ctx.quadraticCurveTo(cx - 14 * scale, hY - 2 * scale, cx - 13 * scale, hY + 4 * scale);
          ctx.lineTo(cx - 11 * scale, hY + 5 * scale);
          ctx.quadraticCurveTo(cx - 12 * scale, hY - 1 * scale, cx - 9 * scale, hY - 4 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#00c0b8";
          ctx.shadowColor = "#00e0d8";
          ctx.shadowBlur = 3 * scale;
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Right side guard
          ctx.fillStyle = "#2a3a40";
          ctx.beginPath();
          ctx.moveTo(cx + 10 * scale, hY - 6 * scale);
          ctx.quadraticCurveTo(cx + 14 * scale, hY - 2 * scale, cx + 13 * scale, hY + 4 * scale);
          ctx.lineTo(cx + 11 * scale, hY + 5 * scale);
          ctx.quadraticCurveTo(cx + 12 * scale, hY - 1 * scale, cx + 9 * scale, hY - 4 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#00c0b8";
          ctx.shadowColor = "#00e0d8";
          ctx.shadowBlur = 3 * scale;
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Connecting band across top
          ctx.strokeStyle = "#3a4a50";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, hY - 6 * scale);
          ctx.quadraticCurveTo(cx, hY - 10 * scale, cx + 10 * scale, hY - 6 * scale);
          ctx.stroke();
          ctx.strokeStyle = "#00c0b8";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
          ctx.restore();
        }

        // === HEAD ===
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 18 * scale + bounce, 10 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark brown hair with bangs
        ctx.fillStyle = "#3a2210";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy - 18 * scale + bounce);
        ctx.quadraticCurveTo(cx - 12 * scale, cy - 28 * scale + bounce, cx - 6 * scale, cy - 28 * scale + bounce);
        ctx.quadraticCurveTo(cx - 2 * scale, cy - 30 * scale + bounce, cx, cy - 28 * scale + bounce);
        ctx.quadraticCurveTo(cx + 2 * scale, cy - 30 * scale + bounce, cx + 6 * scale, cy - 28 * scale + bounce);
        ctx.quadraticCurveTo(cx + 12 * scale, cy - 28 * scale + bounce, cx + 10 * scale, cy - 18 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        // Side hair
        ctx.beginPath();
        ctx.ellipse(cx - 9 * scale, cy - 18 * scale + bounce, 3.5 * scale, 6 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 9 * scale, cy - 18 * scale + bounce, 3.5 * scale, 6 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Bangs across forehead
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 22 * scale + bounce);
        ctx.quadraticCurveTo(cx - 4 * scale, cy - 18 * scale + bounce, cx, cy - 21 * scale + bounce);
        ctx.quadraticCurveTo(cx + 4 * scale, cy - 18 * scale + bounce, cx + 8 * scale, cy - 22 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy - 26 * scale + bounce);
        ctx.lineTo(cx - 10 * scale, cy - 26 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Blue-grey eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx - 4 * scale, cy - 18 * scale + bounce, 3 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 4 * scale, cy - 18 * scale + bounce, 3 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3a6888";
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 18 * scale + bounce, 1.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 18 * scale + bounce, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 18 * scale + bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 18 * scale + bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 19 * scale + bounce, 0.6 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 5 * scale, cy - 19 * scale + bounce, 0.6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === GLASSES (on top of eyes) ===
        {
          const eyeY = cy - 18 * scale + bounce;
          // Left lens - round frame
          ctx.strokeStyle = "#1a2a30";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.ellipse(cx - 4 * scale, eyeY, 3.8 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Right lens - round frame
          ctx.beginPath();
          ctx.ellipse(cx + 4 * scale, eyeY, 3.8 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Bridge between lenses
          ctx.beginPath();
          ctx.moveTo(cx - 0.5 * scale, eyeY - 0.5 * scale);
          ctx.quadraticCurveTo(cx, eyeY - 1.5 * scale, cx + 0.5 * scale, eyeY - 0.5 * scale);
          ctx.stroke();
          // Temple arms extending to side guards
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 7.5 * scale, eyeY);
          ctx.lineTo(cx - 11 * scale, eyeY + 1 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 7.5 * scale, eyeY);
          ctx.lineTo(cx + 11 * scale, eyeY + 1 * scale);
          ctx.stroke();
          // Subtle cyan lens glint
          ctx.fillStyle = "rgba(0, 200, 210, 0.12)";
          ctx.beginPath();
          ctx.ellipse(cx - 4 * scale, eyeY, 3.5 * scale, 2.7 * scale, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 4 * scale, eyeY, 3.5 * scale, 2.7 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Slight smile
        ctx.strokeStyle = "#8a6a4a";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale + bounce, 2.5 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // === WRITING TRAIL - cyan words flowing from pen ===
        if (animated) {
          ctx.textAlign = "center";
          const trailWords = ["the", "green", "light", "across", "the", "bay"];
          for (let i = 0; i < 5; i++) {
            const wordPhase = (t * 0.35 + i * 0.3) % 1.8;
            const wordX = cx + 12 * scale + wordPhase * 8 * scale + Math.sin(t + i) * 3 * scale;
            const wordY = cy + 10 * scale - wordPhase * 16 * scale + bounce;
            const alpha = Math.max(0, 1 - wordPhase / 1.8) * 0.7;
            ctx.font = `italic ${(5 + (i % 2)) * scale}px Georgia`;
            ctx.fillStyle = `rgba(0, 210, 200, ${alpha})`;
            ctx.shadowColor = "#00d8d0";
            ctx.shadowBlur = 4 * scale;
            ctx.globalAlpha = alpha;
            ctx.fillText(trailWords[i % trailWords.length], wordX, wordY);
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "captain": {
        cy += 10 * scale;
        // CAPTAIN - Ornate Red/Grey Knight with Sword, Red Plume, Gold Accents
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const plumeWave = animated ? Math.sin(t * 3) * 0.1 : 0;

        // Orange/fire heroic aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(220, 120, 20, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(180, 60, 10, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === FLOWING RED CAPE (behind body) ===
        const capeWave = animated ? Math.sin(t * 2) * 0.08 : 0;
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);

        // Cape main body - flowing orange/fire fabric
        const capeGrad = ctx.createLinearGradient(-16 * scale, 0, 16 * scale, 24 * scale);
        capeGrad.addColorStop(0, "#ee6600");
        capeGrad.addColorStop(0.3, "#dd4400");
        capeGrad.addColorStop(0.6, "#cc3300");
        capeGrad.addColorStop(1, "#882200");
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

        // Gold trim on cape edges
        ctx.strokeStyle = "#d4aa00";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(-10 * scale, 0);
        ctx.quadraticCurveTo(-18 * scale + capeWave * 40, 12 * scale, -16 * scale + capeWave * 60, 28 * scale);
        ctx.quadraticCurveTo(-14 * scale + capeWave * 40, 32 * scale, -10 * scale + capeWave * 20, 30 * scale);
        ctx.quadraticCurveTo(-4 * scale, 34 * scale + capeWave * 20, 0, 32 * scale);
        ctx.quadraticCurveTo(4 * scale, 34 * scale - capeWave * 20, 10 * scale - capeWave * 20, 30 * scale);
        ctx.quadraticCurveTo(14 * scale - capeWave * 40, 32 * scale, 16 * scale - capeWave * 60, 28 * scale);
        ctx.quadraticCurveTo(18 * scale - capeWave * 40, 12 * scale, 10 * scale, 0);
        ctx.stroke();

        // Cape clasp at shoulders
        ctx.fillStyle = "#d4aa00";
        ctx.beginPath();
        ctx.arc(-8 * scale, 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(8 * scale, 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#aa8800";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        ctx.restore();

        // === ORNATE ARMOR BODY ===
        // Main chest plate - dark/black with gold trim
        const armorGrad = ctx.createLinearGradient(cx - 12 * scale, cy, cx + 12 * scale, cy);
        armorGrad.addColorStop(0, "#1a1a1a");
        armorGrad.addColorStop(0.3, "#2a2a2a");
        armorGrad.addColorStop(0.5, "#333333");
        armorGrad.addColorStop(0.7, "#2a2a2a");
        armorGrad.addColorStop(1, "#1a1a1a");
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
        ctx.strokeStyle = "#d4aa00";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Gold trim bands on chest plate
        ctx.strokeStyle = "#c8a020";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx + 11 * scale, cy - 6 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 10.5 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx + 10.5 * scale, cy + 2 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 10 * scale + bounce);
        ctx.lineTo(cx + 10 * scale, cy + 10 * scale + bounce);
        ctx.stroke();

        // Red V-chevron on chest
        ctx.fillStyle = "#cc2222";
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx - 6 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx, cy + 4 * scale + bounce);
        ctx.lineTo(cx + 6 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 8 * scale + bounce);
        ctx.lineTo(cx, cy + 8 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d4aa00";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Gold diamond emblem in center of V
        ctx.fillStyle = "#d4aa00";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 2.5 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx, cy + 6 * scale + bounce);
        ctx.lineTo(cx + 2.5 * scale, cy + 2 * scale + bounce);
        ctx.closePath();
        ctx.fill();

        // Red gem in center
        ctx.fillStyle = "#ff4444";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * scale + bounce, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gold filigree on chest armor
        ctx.save();
        ctx.strokeStyle = "#c8a020";
        ctx.lineWidth = 0.6 * scale;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 6 * scale + bounce);
        ctx.quadraticCurveTo(cx - 6 * scale, cy - 3 * scale + bounce, cx - 4 * scale, cy + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 6 * scale + bounce);
        ctx.quadraticCurveTo(cx + 6 * scale, cy - 3 * scale + bounce, cx + 4 * scale, cy + bounce);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.restore();

        // Gold rivets on armor sides
        ctx.fillStyle = "#d4aa00";
        for (const rx of [-10, -8, 8, 10]) {
          for (const ry of [-4, 4, 12]) {
            ctx.beginPath();
            ctx.arc(cx + rx * scale, cy + ry * scale + bounce, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Gorget (neck guard)
        const gorgetGrad = ctx.createLinearGradient(cx - 8 * scale, cy - 12 * scale + bounce, cx + 8 * scale, cy - 12 * scale + bounce);
        gorgetGrad.addColorStop(0, "#2a2a2a");
        gorgetGrad.addColorStop(0.5, "#3a3a3a");
        gorgetGrad.addColorStop(1, "#2a2a2a");
        ctx.fillStyle = gorgetGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 * scale + bounce, 10 * scale, 3 * scale, 0, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d4aa00";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Armor skirt (pteruges/tassets) - V shape
        const skirtPositions = [-10, -6, -2, 2, 6, 10];
        for (let si = 0; si < skirtPositions.length; si++) {
          const sx = cx + skirtPositions[si] * scale;
          const distFromCenter = Math.abs(skirtPositions[si]);
          const vDrop = (10 - distFromCenter) * 0.4 * scale;
          const skirtY = cy + 14 * scale + bounce + vDrop;
          const plateH = 6 * scale + vDrop * 0.5;
          const plateGrad = ctx.createLinearGradient(sx, skirtY, sx, skirtY + plateH);
          plateGrad.addColorStop(0, "#2a2a2a");
          plateGrad.addColorStop(0.5, "#1a1a1a");
          plateGrad.addColorStop(1, "#111111");
          ctx.fillStyle = plateGrad;
          ctx.beginPath();
          ctx.moveTo(sx - 1.75 * scale, skirtY);
          ctx.lineTo(sx + 1.75 * scale, skirtY);
          ctx.lineTo(sx + 1.25 * scale, skirtY + plateH);
          ctx.lineTo(sx - 1.25 * scale, skirtY + plateH);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#bb2222";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(sx - 1.5 * scale, skirtY + plateH - 0.5 * scale);
          ctx.lineTo(sx + 1.5 * scale, skirtY + plateH - 0.5 * scale);
          ctx.stroke();
        }

        // === ORNATE SHOULDER ARMOR ===
        for (const sx of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + sx * 18 * scale, cy - 6 * scale + bounce);

          const pauldronGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
          pauldronGrad.addColorStop(0, "#3a3a3a");
          pauldronGrad.addColorStop(0.5, "#2a2a2a");
          pauldronGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = pauldronGrad;
          ctx.beginPath();
          ctx.ellipse(0, 2 * scale, 8 * scale, 7 * scale, sx * -0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          // Inner gold ring
          ctx.strokeStyle = "#c8a020";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.ellipse(0, 2 * scale, 5.5 * scale, 4.5 * scale, sx * -0.2, 0, Math.PI * 2);
          ctx.stroke();

          // Gold rivet center
          ctx.fillStyle = "#d4aa00";
          ctx.beginPath();
          ctx.arc(0, 2 * scale, 2 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Red gem on pauldron
          ctx.fillStyle = "#cc3333";
          ctx.shadowColor = "#ff4444";
          ctx.shadowBlur = 3 * scale;
          ctx.beginPath();
          ctx.arc(0, 2 * scale, 1.3 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // === ARM UPPER SECTIONS (behind weapons) ===
        const armSwing = animated ? Math.sin(t * 2) * 0.06 : 0;

        // --- Left upper arm + elbow + forearm ---
        ctx.save();
        ctx.translate(cx - 20 * scale, cy - 10 * scale + bounce);
        ctx.rotate(-0.15 + armSwing);
        {
          const uGrad = ctx.createLinearGradient(-5 * scale, -2 * scale, 5 * scale, 10 * scale);
          uGrad.addColorStop(0, "#2a2a2a");
          uGrad.addColorStop(0.4, "#222222");
          uGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = uGrad;
          ctx.beginPath();
          ctx.ellipse(0, 4 * scale, 5.5 * scale, 7 * scale, -0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.ellipse(0, -1 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "#bb2222";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.ellipse(0, 1 * scale, 5.2 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();

          const eGrad = ctx.createRadialGradient(0, 10 * scale, 0, 0, 10 * scale, 5 * scale);
          eGrad.addColorStop(0, "#3a3a3a");
          eGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = eGrad;
          ctx.beginPath();
          ctx.ellipse(0, 10 * scale, 4.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#c8a020";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          ctx.fillStyle = "#cc3333";
          ctx.beginPath();
          ctx.arc(0, 10 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();

          const fGrad = ctx.createLinearGradient(-4 * scale, 11 * scale, 4 * scale, 19 * scale);
          fGrad.addColorStop(0, "#2a2a2a");
          fGrad.addColorStop(0.5, "#222222");
          fGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.ellipse(-0.5 * scale, 15 * scale, 5 * scale, 6 * scale, 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();
        }
        ctx.restore();

        // --- Right upper arm + elbow + forearm ---
        ctx.save();
        ctx.translate(cx + 20 * scale, cy - 10 * scale + bounce);
        ctx.rotate(0.2 - armSwing);
        {
          const uGrad = ctx.createLinearGradient(-5 * scale, -2 * scale, 5 * scale, 10 * scale);
          uGrad.addColorStop(0, "#2a2a2a");
          uGrad.addColorStop(0.4, "#222222");
          uGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = uGrad;
          ctx.beginPath();
          ctx.ellipse(0, 4 * scale, 5.5 * scale, 7 * scale, 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.ellipse(0, -1 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "#bb2222";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.ellipse(0, 1 * scale, 5.2 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();

          const eGrad = ctx.createRadialGradient(0, 10 * scale, 0, 0, 10 * scale, 5 * scale);
          eGrad.addColorStop(0, "#3a3a3a");
          eGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = eGrad;
          ctx.beginPath();
          ctx.ellipse(0, 10 * scale, 4.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#c8a020";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          ctx.fillStyle = "#cc3333";
          ctx.beginPath();
          ctx.arc(0, 10 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();

          const fGrad = ctx.createLinearGradient(-4 * scale, 11 * scale, 4 * scale, 19 * scale);
          fGrad.addColorStop(0, "#2a2a2a");
          fGrad.addColorStop(0.5, "#222222");
          fGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.ellipse(0.5 * scale, 15 * scale, 5 * scale, 6 * scale, -0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();
        }
        ctx.restore();

        // === ORNATE HELMET ===
        {
          const hY = cy - 20 * scale + bounce;

          // Main helmet shell - dark/black
          const helmetGrad = ctx.createRadialGradient(cx - 2 * scale, hY - 2 * scale, 0, cx, hY, 13 * scale);
          helmetGrad.addColorStop(0, "#3a3a3a");
          helmetGrad.addColorStop(0.3, "#2a2a2a");
          helmetGrad.addColorStop(0.6, "#1a1a1a");
          helmetGrad.addColorStop(1, "#0e0e0e");
          ctx.fillStyle = helmetGrad;
          ctx.beginPath();
          ctx.ellipse(cx, hY, 12 * scale, 11 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1.2 * scale;
          ctx.stroke();

          // Gold highlight arc on dome
          ctx.strokeStyle = "rgba(212, 170, 0, 0.4)";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.ellipse(cx, hY, 10 * scale, 9 * scale, 0, -Math.PI * 0.8, -Math.PI * 0.2);
          ctx.stroke();

          // Gold brow ridge
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 12 * scale, hY - 1 * scale);
          ctx.lineTo(cx + 12 * scale, hY - 1 * scale);
          ctx.stroke();
          // Upper panel line - subtle gold
          ctx.strokeStyle = "rgba(200, 160, 32, 0.35)";
          ctx.lineWidth = 0.6 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, hY - 6 * scale);
          ctx.lineTo(cx + 10 * scale, hY - 6 * scale);
          ctx.stroke();

          // Cheek guards - dark with gold edge
          for (const sx of [-1, 1]) {
            const wGrad = ctx.createLinearGradient(cx + sx * 11 * scale, hY, cx + sx * 20 * scale, hY - 8 * scale);
            wGrad.addColorStop(0, "#1a1a1a");
            wGrad.addColorStop(0.5, "#2a2a2a");
            wGrad.addColorStop(1, "#333333");
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            ctx.moveTo(cx + sx * 10 * scale, hY - 3 * scale);
            ctx.quadraticCurveTo(cx + sx * 15 * scale, hY - 8 * scale, cx + sx * 20 * scale, hY - 14 * scale);
            ctx.quadraticCurveTo(cx + sx * 19 * scale, hY - 10 * scale, cx + sx * 18 * scale, hY - 6 * scale);
            ctx.quadraticCurveTo(cx + sx * 16 * scale, hY - 2 * scale, cx + sx * 12 * scale, hY + 2 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#c8a020";
            ctx.lineWidth = 0.7 * scale;
            ctx.stroke();
          }

          // Gold studs on helmet sides
          ctx.fillStyle = "#d4aa00";
          ctx.strokeStyle = "#aa8800";
          ctx.lineWidth = 0.4 * scale;
          for (const sx of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(cx + sx * 10.5 * scale, hY - 1 * scale, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          // Fire/orange crest ridge
          const crestGrad = ctx.createLinearGradient(cx, hY - 20 * scale, cx, hY);
          crestGrad.addColorStop(0, "#ffaa00");
          crestGrad.addColorStop(0.2, "#ee6600");
          crestGrad.addColorStop(0.5, "#dd3300");
          crestGrad.addColorStop(0.8, "#cc2200");
          crestGrad.addColorStop(1, "#881100");
          ctx.fillStyle = crestGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 2.5 * scale, hY + 2 * scale);
          ctx.lineTo(cx - 3.5 * scale, hY - 6 * scale);
          ctx.lineTo(cx - 2 * scale, hY - 14 * scale);
          ctx.lineTo(cx, hY - 18 * scale);
          ctx.lineTo(cx + 2 * scale, hY - 14 * scale);
          ctx.lineTo(cx + 3.5 * scale, hY - 6 * scale);
          ctx.lineTo(cx + 2.5 * scale, hY + 2 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#661100";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Fire plume - compact flame effect
          ctx.save();
          ctx.translate(cx, hY - 12 * scale);
          ctx.rotate(plumeWave);
          // Main flame body
          const plumeGrad = ctx.createRadialGradient(0, -4 * scale, 0, 0, -3 * scale, 10 * scale);
          plumeGrad.addColorStop(0, "#ffcc00");
          plumeGrad.addColorStop(0.3, "#ff8800");
          plumeGrad.addColorStop(0.6, "#ee4400");
          plumeGrad.addColorStop(1, "#882200");
          ctx.fillStyle = plumeGrad;
          ctx.beginPath();
          ctx.ellipse(0, -5 * scale, 3.5 * scale, 8 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          // Side flame wisps
          ctx.fillStyle = "#ee6600";
          ctx.beginPath();
          ctx.ellipse(-2.5 * scale, -4 * scale, 2 * scale, 6 * scale, -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#dd4400";
          ctx.beginPath();
          ctx.ellipse(2.5 * scale, -4 * scale, 2 * scale, 6 * scale, 0.15, 0, Math.PI * 2);
          ctx.fill();
          // Bright yellow tip
          ctx.fillStyle = "#ffdd44";
          ctx.beginPath();
          ctx.ellipse(0, -10 * scale, 1.5 * scale, 4 * scale, plumeWave * 2, 0, Math.PI * 2);
          ctx.fill();
          // Flame stroke lines
          ctx.strokeStyle = "rgba(255, 200, 50, 0.3)";
          ctx.lineWidth = 0.5 * scale;
          for (let ps = -1; ps <= 1; ps++) {
            ctx.beginPath();
            ctx.moveTo(ps * 1 * scale, -1 * scale);
            ctx.quadraticCurveTo(ps * 1.5 * scale, -7 * scale, ps * 0.5 * scale, -12 * scale);
            ctx.stroke();
          }
          ctx.restore();

          // Visor - angular dark slit with gold frame
          ctx.fillStyle = "#0a0a0a";
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY - 1 * scale);
          ctx.lineTo(cx - 10 * scale, hY + 1 * scale);
          ctx.lineTo(cx - 8 * scale, hY + 4 * scale);
          ctx.lineTo(cx + 8 * scale, hY + 4 * scale);
          ctx.lineTo(cx + 10 * scale, hY + 1 * scale);
          ctx.lineTo(cx + 9 * scale, hY - 1 * scale);
          ctx.closePath();
          ctx.fill();
          // Gold visor frame
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();
          // Vertical nose guard
          ctx.strokeStyle = "#2a2a2a";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, hY - 2 * scale);
          ctx.lineTo(cx, hY + 4 * scale);
          ctx.stroke();
          // Horizontal visor bars
          ctx.strokeStyle = "rgba(40, 40, 40, 0.5)";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale, hY + 1.5 * scale);
          ctx.lineTo(cx + 8 * scale, hY + 1.5 * scale);
          ctx.stroke();

          // Menacing red eye glow
          ctx.fillStyle = `rgba(220, 50, 50, ${0.7 + Math.sin(t * 3) * 0.3})`;
          ctx.shadowColor = "#ff3333";
          ctx.shadowBlur = 8 * scale;
          ctx.beginPath();
          ctx.ellipse(cx - 4 * scale, hY + 1.5 * scale, 2.5 * scale, 1 * scale, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 4 * scale, hY + 1.5 * scale, 2.5 * scale, 1 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Angular chin guard - dark with gold trim
          const chinGrad = ctx.createLinearGradient(cx - 8 * scale, hY + 4 * scale, cx + 8 * scale, hY + 12 * scale);
          chinGrad.addColorStop(0, "#2a2a2a");
          chinGrad.addColorStop(0.5, "#1a1a1a");
          chinGrad.addColorStop(1, "#111111");
          ctx.fillStyle = chinGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY + 4 * scale);
          ctx.lineTo(cx - 10 * scale, hY + 8 * scale);
          ctx.lineTo(cx - 5 * scale, hY + 12 * scale);
          ctx.lineTo(cx, hY + 13 * scale);
          ctx.lineTo(cx + 5 * scale, hY + 12 * scale);
          ctx.lineTo(cx + 10 * scale, hY + 8 * scale);
          ctx.lineTo(cx + 9 * scale, hY + 4 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Vent slits
          ctx.strokeStyle = "#0a0a0a";
          ctx.lineWidth = 0.5 * scale;
          for (let vs = -2; vs <= 2; vs++) {
            ctx.beginPath();
            ctx.moveTo(cx + vs * 2.5 * scale, hY + 6 * scale);
            ctx.lineTo(cx + vs * 2 * scale, hY + 11 * scale);
            ctx.stroke();
          }
          // Gold mouthguard accent
          ctx.strokeStyle = "#c8a020";
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale, hY + 5 * scale);
          ctx.lineTo(cx + 8 * scale, hY + 5 * scale);
          ctx.stroke();
        }

        // === ORNATE SWORD (held by right arm) ===
        ctx.save();
        ctx.translate(cx + 18 * scale, cy + 4 * scale + bounce);
        ctx.rotate(0.4);

        // Blade - polished silver with fuller groove
        const bladeGrad = ctx.createLinearGradient(-2 * scale, 0, 2 * scale, 0);
        bladeGrad.addColorStop(0, "#7a8a9a");
        bladeGrad.addColorStop(0.3, "#b0c0d0");
        bladeGrad.addColorStop(0.5, "#e0f0ff");
        bladeGrad.addColorStop(0.7, "#b0c0d0");
        bladeGrad.addColorStop(1, "#7a8a9a");
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -28 * scale);
        ctx.lineTo(0, -36 * scale);
        ctx.lineTo(2 * scale, -28 * scale);
        ctx.lineTo(2 * scale, -4 * scale);
        ctx.lineTo(-2 * scale, -4 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5a6a7a";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        // Fuller (groove down center)
        ctx.strokeStyle = "rgba(80, 100, 120, 0.4)";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -32 * scale);
        ctx.lineTo(0, -6 * scale);
        ctx.stroke();
        // Blade edge highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.4 * scale;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, -28 * scale);
        ctx.lineTo(-1.5 * scale, -5 * scale);
        ctx.stroke();

        // Ornate crossguard with swept ends - gold
        const guardGrad = ctx.createLinearGradient(-7 * scale, -4 * scale, 7 * scale, -1 * scale);
        guardGrad.addColorStop(0, "#aa8000");
        guardGrad.addColorStop(0.3, "#d4aa00");
        guardGrad.addColorStop(0.5, "#e8c020");
        guardGrad.addColorStop(0.7, "#d4aa00");
        guardGrad.addColorStop(1, "#aa8000");
        ctx.fillStyle = guardGrad;
        ctx.beginPath();
        ctx.moveTo(-7 * scale, -4 * scale);
        ctx.quadraticCurveTo(-7.5 * scale, -5.5 * scale, -6 * scale, -5 * scale);
        ctx.lineTo(6 * scale, -5 * scale);
        ctx.quadraticCurveTo(7.5 * scale, -5.5 * scale, 7 * scale, -4 * scale);
        ctx.lineTo(6 * scale, -2 * scale);
        ctx.quadraticCurveTo(5.5 * scale, -1 * scale, 5 * scale, -2 * scale);
        ctx.lineTo(-5 * scale, -2 * scale);
        ctx.quadraticCurveTo(-5.5 * scale, -1 * scale, -6 * scale, -2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#886600";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Red gems on crossguard ends
        ctx.fillStyle = "#dd3333";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 3 * scale;
        ctx.beginPath();
        ctx.arc(-5.5 * scale, -3.5 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5.5 * scale, -3.5 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Leather grip with wrapping
        ctx.fillStyle = "#5a2010";
        ctx.beginPath();
        ctx.roundRect(-2 * scale, -1 * scale, 4 * scale, 10 * scale, 1 * scale);
        ctx.fill();
        ctx.strokeStyle = "#3a1008";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Grip wraps
        ctx.strokeStyle = "#7a3818";
        ctx.lineWidth = 0.5 * scale;
        for (let gw = 0; gw < 4; gw++) {
          const gy = 0 + gw * 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-2 * scale, gy);
          ctx.lineTo(2 * scale, gy + 1 * scale);
          ctx.stroke();
        }

        // Ornate pommel - gold
        const pommelGrad = ctx.createRadialGradient(0, 11 * scale, 0, 0, 11 * scale, 3 * scale);
        pommelGrad.addColorStop(0, "#e8c020");
        pommelGrad.addColorStop(0.7, "#d4aa00");
        pommelGrad.addColorStop(1, "#aa8000");
        ctx.fillStyle = pommelGrad;
        ctx.beginPath();
        ctx.arc(0, 11 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#886600";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        // Red gem on pommel
        ctx.fillStyle = "#cc3333";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        ctx.arc(0, 11 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // === BATTLE STANDARD / FLAG (held by left hand) ===
        ctx.save();
        ctx.translate(cx - 18 * scale, cy + 6 * scale + bounce);
        ctx.rotate(-0.08);

        // Flag pole - gold with grip rings
        const poleGrad = ctx.createLinearGradient(-1.2 * scale, -42 * scale, 1.2 * scale, 2 * scale);
        poleGrad.addColorStop(0, "#c8a020");
        poleGrad.addColorStop(0.5, "#e0c040");
        poleGrad.addColorStop(1, "#aa8800");
        ctx.fillStyle = poleGrad;
        ctx.beginPath();
        ctx.roundRect(-1.2 * scale, -42 * scale, 2.4 * scale, 44 * scale, 0.5 * scale);
        ctx.fill();
        ctx.strokeStyle = "#886600";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Grip rings
        ctx.strokeStyle = "#c8a020";
        ctx.lineWidth = 0.6 * scale;
        for (let gr = 0; gr < 3; gr++) {
          ctx.beginPath();
          ctx.ellipse(0, -2 * scale + gr * 3 * scale, 1.5 * scale, 0.6 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Ornate gold finial - spearpoint shape
        ctx.fillStyle = "#d4aa00";
        ctx.beginPath();
        ctx.moveTo(0, -48 * scale);
        ctx.lineTo(-2 * scale, -43 * scale);
        ctx.lineTo(-1.5 * scale, -42 * scale);
        ctx.lineTo(1.5 * scale, -42 * scale);
        ctx.lineTo(2 * scale, -43 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#aa8800";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        // Finial ball
        ctx.fillStyle = "#e0b820";
        ctx.beginPath();
        ctx.arc(0, -42 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#b09010";
        ctx.stroke();

        // Triangle pennant
        const flagWave = animated ? Math.sin(t * 2.5) : 0;
        const pennantGrad = ctx.createLinearGradient(-1 * scale, -40 * scale, -20 * scale, -30 * scale);
        pennantGrad.addColorStop(0, "#dd2828");
        pennantGrad.addColorStop(0.4, "#cc1818");
        pennantGrad.addColorStop(1, "#990808");
        ctx.fillStyle = pennantGrad;
        ctx.beginPath();
        ctx.moveTo(-1 * scale, -40 * scale);
        ctx.quadraticCurveTo(-10 * scale + flagWave * 2 * scale, -38 * scale, -18 * scale + flagWave * 3 * scale, -32 * scale);
        ctx.quadraticCurveTo(-10 * scale + flagWave * 2 * scale, -26 * scale, -1 * scale, -24 * scale);
        ctx.closePath();
        ctx.fill();
        // Gold border
        ctx.strokeStyle = "#d4a030";
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();
        // Inner highlight
        ctx.fillStyle = "rgba(255, 100, 100, 0.25)";
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, -38 * scale);
        ctx.quadraticCurveTo(-8 * scale + flagWave * 1.5 * scale, -36 * scale, -14 * scale + flagWave * 2 * scale, -32 * scale);
        ctx.quadraticCurveTo(-8 * scale + flagWave * 1.5 * scale, -28 * scale, -1.5 * scale, -26 * scale);
        ctx.closePath();
        ctx.fill();
        // Star emblem on pennant
        const starX = -8 * scale + flagWave * 1.5 * scale;
        const starY = -32 * scale;
        ctx.fillStyle = "#f0d060";
        ctx.shadowColor = "#f0d060";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        for (let sp = 0; sp < 5; sp++) {
          const sAngle = sp * Math.PI * 2 / 5 - Math.PI / 2;
          const sAngle2 = sAngle + Math.PI / 5;
          const outerR = 2.5 * scale;
          const innerR = 1 * scale;
          if (sp === 0) ctx.moveTo(starX + Math.cos(sAngle) * outerR, starY + Math.sin(sAngle) * outerR);
          else ctx.lineTo(starX + Math.cos(sAngle) * outerR, starY + Math.sin(sAngle) * outerR);
          ctx.lineTo(starX + Math.cos(sAngle2) * innerR, starY + Math.sin(sAngle2) * innerR);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Gold tassel at pennant tip
        ctx.strokeStyle = "#d4a030";
        ctx.lineWidth = 0.7 * scale;
        const tipX = -18 * scale + flagWave * 3 * scale;
        const tWave = animated ? Math.sin(t * 3.5) * 0.8 * scale : 0;
        for (let ts = 0; ts < 3; ts++) {
          ctx.beginPath();
          ctx.moveTo(tipX, -32 * scale + (ts - 1) * 1.5 * scale);
          ctx.lineTo(tipX - 3 * scale + tWave, -32 * scale + (ts - 1) * 2 * scale);
          ctx.stroke();
        }
        ctx.fillStyle = "#d4a030";
        for (let ts = 0; ts < 3; ts++) {
          ctx.beginPath();
          ctx.arc(tipX - 3 * scale + tWave, -32 * scale + (ts - 1) * 2 * scale, 0.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // === GAUNTLETS + HANDS (in front of weapons) ===
        // Left gauntlet
        ctx.save();
        ctx.translate(cx - 20 * scale, cy - 10 * scale + bounce);
        ctx.rotate(-0.15 + armSwing);
        {
          const gGrad = ctx.createLinearGradient(-5 * scale, 19 * scale, 5 * scale, 24 * scale);
          gGrad.addColorStop(0, "#d4aa00");
          gGrad.addColorStop(0.5, "#c89800");
          gGrad.addColorStop(1, "#aa8000");
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.ellipse(-0.5 * scale, 21 * scale, 5.5 * scale, 4.5 * scale, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#aa8000";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#e0c040";
          ctx.lineWidth = 0.6 * scale;
          ctx.beginPath();
          ctx.ellipse(-0.5 * scale, 22.5 * scale, 4.5 * scale, 1.2 * scale, 0.1, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#c8a020";
          ctx.strokeStyle = "#aa8000";
          ctx.lineWidth = 0.4 * scale;
          for (let fi = 0; fi < 4; fi++) {
            const fx = -2.5 * scale + fi * 1.5 * scale;
            ctx.beginPath();
            ctx.moveTo(fx - 0.6 * scale, 24.5 * scale);
            ctx.lineTo(fx, 27 * scale);
            ctx.lineTo(fx + 0.6 * scale, 24.5 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.ellipse(-4 * scale, 23 * scale, 1.2 * scale, 2 * scale, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        // Right gauntlet
        ctx.save();
        ctx.translate(cx + 20 * scale, cy - 10 * scale + bounce);
        ctx.rotate(0.2 - armSwing);
        {
          const gGrad = ctx.createLinearGradient(-5 * scale, 19 * scale, 5 * scale, 24 * scale);
          gGrad.addColorStop(0, "#d4aa00");
          gGrad.addColorStop(0.5, "#c89800");
          gGrad.addColorStop(1, "#aa8000");
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.ellipse(0.5 * scale, 21 * scale, 5.5 * scale, 4.5 * scale, -0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#aa8000";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          ctx.strokeStyle = "#e0c040";
          ctx.lineWidth = 0.6 * scale;
          ctx.beginPath();
          ctx.ellipse(0.5 * scale, 22.5 * scale, 4.5 * scale, 1.2 * scale, -0.1, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#c8a020";
          ctx.strokeStyle = "#aa8000";
          ctx.lineWidth = 0.4 * scale;
          for (let fi = 0; fi < 4; fi++) {
            const fx = -1.5 * scale + fi * 1.5 * scale;
            ctx.beginPath();
            ctx.moveTo(fx - 0.6 * scale, 24.5 * scale);
            ctx.lineTo(fx, 27 * scale);
            ctx.lineTo(fx + 0.6 * scale, 24.5 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.ellipse(4.5 * scale, 23 * scale, 1.2 * scale, 2 * scale, 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        break;
      }
      case "engineer": {
        cy += 6 * scale;
        const dataPulse = Math.sin(t * 5) * 0.5 + 0.5;
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const idleSway = animated ? Math.sin(t * 0.7) * 0.5 : 0;
        const toolFidget = animated ? Math.sin(t * 1.2) * 0.08 : 0;

        // Tech/electric aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(50, 150, 220, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(30, 120, 200, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating circuit lines + sparks
        if (animated) {
          ctx.strokeStyle = `rgba(0, 200, 255, ${dataPulse * 0.3})`;
          ctx.lineWidth = 0.8 * scale;
          for (let i = 0; i < 6; i++) {
            const circAngle = t * 0.5 + i * Math.PI * 0.333;
            const circR = 18 * scale;
            const cxP = cx + Math.cos(circAngle) * circR;
            const cyP = cy - 6 * scale + Math.sin(circAngle) * circR * 0.5;
            ctx.beginPath();
            ctx.moveTo(cxP, cyP);
            ctx.lineTo(cxP + 3 * scale, cyP);
            ctx.lineTo(cxP + 3 * scale, cyP - 3 * scale);
            ctx.stroke();
          }
          // Electric sparks
          for (let s = 0; s < 3; s++) {
            const sparkPhase = (t * 1.5 + s * 0.8) % 2;
            if (sparkPhase < 0.3) {
              const sAngle = s * Math.PI * 0.7 + t;
              const sx = cx + Math.cos(sAngle) * 14 * scale;
              const sy = cy - 4 * scale + Math.sin(sAngle) * 8 * scale;
              ctx.fillStyle = `rgba(255, 255, 100, ${(0.3 - sparkPhase) * 3})`;
              ctx.shadowColor = "#ffff60";
              ctx.shadowBlur = 4 * scale;
              ctx.beginPath();
              ctx.arc(sx, sy + bounce, 1.5 * scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }

        // === BIG BACKPACK (behind body) ===
        {
          const bpX = cx;
          const bpY = cy + bounce;
          const bpGrad = ctx.createLinearGradient(bpX - 14 * scale, bpY - 12 * scale, bpX + 14 * scale, bpY + 18 * scale);
          bpGrad.addColorStop(0, "#3e5030");
          bpGrad.addColorStop(0.4, "#4a5a36");
          bpGrad.addColorStop(0.8, "#3a4a2c");
          bpGrad.addColorStop(1, "#2e3e22");
          ctx.fillStyle = bpGrad;
          ctx.beginPath();
          ctx.roundRect(bpX - 14 * scale, bpY - 12 * scale, 28 * scale, 30 * scale, 3 * scale);
          ctx.fill();
          ctx.strokeStyle = "#2a3a1e";
          ctx.lineWidth = 1.2 * scale;
          ctx.stroke();

          // Main compartment flap
          ctx.fillStyle = "#4a5a36";
          ctx.beginPath();
          ctx.roundRect(bpX - 12 * scale, bpY - 10 * scale, 24 * scale, 14 * scale, 2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#3a4a2c";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Buckle straps on flap
          for (const fx of [-6, 0, 6]) {
            ctx.fillStyle = "#5a5030";
            ctx.fillRect(bpX + fx * scale - 1.2 * scale, bpY - 10 * scale, 2.4 * scale, 3 * scale);
            ctx.fillStyle = "#8a8a6a";
            ctx.beginPath();
            ctx.arc(bpX + fx * scale, bpY - 8 * scale, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Lower compartment
          ctx.fillStyle = "#3a4a2c";
          ctx.beginPath();
          ctx.roundRect(bpX - 12 * scale, bpY + 6 * scale, 24 * scale, 10 * scale, 2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#2e3e22";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Side pockets
          for (const sx of [-1, 1]) {
            ctx.fillStyle = "#3a4a2c";
            ctx.beginPath();
            ctx.roundRect(bpX + sx * 14 * scale - (sx > 0 ? 0 : 5 * scale), bpY - 4 * scale, 5 * scale, 14 * scale, 1.5 * scale);
            ctx.fill();
            ctx.strokeStyle = "#2a3a1e";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
            // Pocket snap
            ctx.fillStyle = "#8a8a6a";
            ctx.beginPath();
            ctx.arc(bpX + sx * 16 * scale + (sx > 0 ? -2.5 : 2.5) * scale, bpY - 2 * scale, 0.6 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Straps (visible above body)
          ctx.strokeStyle = "#5a5030";
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(bpX - 8 * scale, bpY - 12 * scale);
          ctx.lineTo(bpX - 10 * scale, bpY - 6 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bpX + 8 * scale, bpY - 12 * scale);
          ctx.lineTo(bpX + 10 * scale, bpY - 6 * scale);
          ctx.stroke();

          // Antenna with blinking light
          ctx.fillStyle = "#5a5a5a";
          ctx.fillRect(bpX + 8 * scale, bpY - 20 * scale, 1.5 * scale, 10 * scale);
          ctx.fillStyle = `rgba(255, 60, 60, ${0.5 + dataPulse * 0.5})`;
          ctx.shadowColor = "#ff3030";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(bpX + 8.75 * scale, bpY - 20 * scale, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Secondary antenna
          ctx.fillStyle = "#4a4a4a";
          ctx.fillRect(bpX - 8 * scale, bpY - 16 * scale, 1 * scale, 6 * scale);
          ctx.fillStyle = `rgba(0, 200, 255, ${0.4 + dataPulse * 0.4})`;
          ctx.shadowColor = "#00ccff";
          ctx.shadowBlur = 3 * scale;
          ctx.beginPath();
          ctx.arc(bpX - 7.5 * scale, bpY - 16 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Bedroll / tube attached to top
          ctx.fillStyle = "#6a6048";
          ctx.beginPath();
          ctx.ellipse(bpX, bpY - 13 * scale, 10 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#5a5030";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Bedroll ties
          ctx.strokeStyle = "#5a5030";
          ctx.lineWidth = 0.8 * scale;
          for (const tx of [-5, 0, 5]) {
            ctx.beginPath();
            ctx.moveTo(bpX + tx * scale, bpY - 15.5 * scale);
            ctx.lineTo(bpX + tx * scale, bpY - 10.5 * scale);
            ctx.stroke();
          }
        }

        // === HEAVY ARMORED EXOSUIT BODY ===
        {
          const bY = bounce;
          // Outer exosuit shell
          const suitGrad = ctx.createLinearGradient(cx - 16 * scale, cy, cx + 16 * scale, cy);
          suitGrad.addColorStop(0, "#2a3a20");
          suitGrad.addColorStop(0.2, "#3a4a2e");
          suitGrad.addColorStop(0.5, "#4a5a38");
          suitGrad.addColorStop(0.8, "#3a4a2e");
          suitGrad.addColorStop(1, "#2a3a20");
          ctx.fillStyle = suitGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 14 * scale, cy + 18 * scale + bY);
          ctx.lineTo(cx - 16 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx - 10 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx, cy - 14 * scale + bY);
          ctx.lineTo(cx + 10 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx + 16 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 14 * scale, cy + 18 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#1e2e18";
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          // Gunmetal chest plate
          const chestGrad = ctx.createLinearGradient(cx - 12 * scale, cy - 13 * scale, cx + 12 * scale, cy - 2 * scale);
          chestGrad.addColorStop(0, "#3a3a42");
          chestGrad.addColorStop(0.3, "#4a4a58");
          chestGrad.addColorStop(0.5, "#58586a");
          chestGrad.addColorStop(0.7, "#4a4a58");
          chestGrad.addColorStop(1, "#3a3a42");
          ctx.fillStyle = chestGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, cy - 2 * scale + bY);
          ctx.lineTo(cx - 14 * scale, cy - 10 * scale + bY);
          ctx.quadraticCurveTo(cx, cy - 15 * scale + bY, cx + 14 * scale, cy - 10 * scale + bY);
          ctx.lineTo(cx + 10 * scale, cy - 2 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#2a2a32";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();

          // Yellow hazard chevron on chest
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.moveTo(cx - 8 * scale, cy - 10 * scale + bY);
          ctx.lineTo(cx - 6 * scale, cy - 10 * scale + bY);
          ctx.lineTo(cx, cy - 4 * scale + bY);
          ctx.lineTo(cx + 6 * scale, cy - 10 * scale + bY);
          ctx.lineTo(cx + 8 * scale, cy - 10 * scale + bY);
          ctx.lineTo(cx, cy - 2 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#b89008";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Power core in center of chevron
          const coreGlow = 0.6 + dataPulse * 0.4;
          ctx.fillStyle = `rgba(0, 200, 255, ${coreGlow})`;
          ctx.shadowColor = "#00c8ff";
          ctx.shadowBlur = 6 * scale;
          ctx.beginPath();
          ctx.arc(cx, cy - 6 * scale + bY, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Core ring
          ctx.strokeStyle = "#4a4a58";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.arc(cx, cy - 6 * scale + bY, 2.8 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Rivets on chest plate
          ctx.fillStyle = "#7a7a82";
          for (const rx of [-10, -6, 6, 10]) {
            ctx.beginPath();
            ctx.arc(cx + rx * scale, cy - 8 * scale + bY, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Gorget (neck armor)
          const gorgetGrad = ctx.createLinearGradient(cx - 8 * scale, cy - 13 * scale + bY, cx + 8 * scale, cy - 13 * scale + bY);
          gorgetGrad.addColorStop(0, "#3a3a42");
          gorgetGrad.addColorStop(0.5, "#4a4a55");
          gorgetGrad.addColorStop(1, "#3a3a42");
          ctx.fillStyle = gorgetGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy - 12 * scale + bY, 8 * scale, 2.5 * scale, 0, Math.PI, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#2a2a32";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Belly/midriff plate
          ctx.fillStyle = "#7a6a4a";
          ctx.beginPath();
          ctx.roundRect(cx - 10 * scale, cy - 1 * scale + bY, 20 * scale, 9 * scale, 2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#5a4a30";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Belly segmentation
          ctx.strokeStyle = "#4a3a22";
          ctx.lineWidth = 0.5 * scale;
          for (const seg of [-5, 0, 5]) {
            ctx.beginPath();
            ctx.moveTo(cx + seg * scale, cy - 0.5 * scale + bY);
            ctx.lineTo(cx + seg * scale, cy + 7.5 * scale + bY);
            ctx.stroke();
          }
          // Horizontal seam
          ctx.strokeStyle = "#5a4a30";
          ctx.lineWidth = 0.6 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, cy + 3.5 * scale + bY);
          ctx.lineTo(cx + 10 * scale, cy + 3.5 * scale + bY);
          ctx.stroke();

          // Armor seam line
          ctx.strokeStyle = "#2a3a1e";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 15 * scale, cy - 2 * scale + bY);
          ctx.lineTo(cx + 15 * scale, cy - 2 * scale + bY);
          ctx.stroke();
        }

        // === HEAVY SHOULDER PAULDRONS ===
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + side * 15 * scale, cy - 8 * scale + bounce);

          // Outer pauldron shell
          const outerGrad = ctx.createRadialGradient(0, -1 * scale, 2 * scale, 0, 0, 12 * scale);
          outerGrad.addColorStop(0, "#7a8a58");
          outerGrad.addColorStop(0.4, "#5a6a42");
          outerGrad.addColorStop(0.8, "#3a4a2c");
          outerGrad.addColorStop(1, "#2a3a1e");
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, 11 * scale, 8.5 * scale, side * -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1e2e18";
          ctx.lineWidth = 1.3 * scale;
          ctx.stroke();

          // Inner ridge plate
          const innerGrad = ctx.createRadialGradient(0, -1 * scale, 0, 0, 0, 7 * scale);
          innerGrad.addColorStop(0, "#8a9a64");
          innerGrad.addColorStop(0.6, "#6a7a4e");
          innerGrad.addColorStop(1, "#4a5a36");
          ctx.fillStyle = innerGrad;
          ctx.beginPath();
          ctx.ellipse(0, -0.5 * scale, 7.5 * scale, 5.5 * scale, side * -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a4a2c";
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();

          // Layered armor ridges
          ctx.strokeStyle = "#4a5a36";
          ctx.lineWidth = 0.6 * scale;
          for (const ridgeY of [-3, -1, 1, 3]) {
            ctx.beginPath();
            ctx.ellipse(0, ridgeY * scale, (8 - Math.abs(ridgeY) * 0.8) * scale, 1 * scale, side * -0.15, 0, Math.PI);
            ctx.stroke();
          }

          // Armor rivets (6 in a circle)
          ctx.fillStyle = "#8a8a6a";
          for (let rv = 0; rv < 6; rv++) {
            const rAngle = rv * Math.PI * 0.333 + Math.PI * 0.167;
            ctx.beginPath();
            ctx.arc(Math.cos(rAngle) * 6 * scale, Math.sin(rAngle) * 4.5 * scale, 0.7 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#5a5a42";
            ctx.lineWidth = 0.3 * scale;
            ctx.stroke();
          }

          // Equipment pod with glowing indicator
          ctx.fillStyle = "#2a2a3a";
          ctx.beginPath();
          ctx.roundRect(side * 3 * scale - 3 * scale, -3.5 * scale, 6 * scale, 5 * scale, 1.5 * scale);
          ctx.fill();
          ctx.strokeStyle = "#1a1a2a";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
          const podColor = side > 0
            ? `rgba(255, 60, 60, ${0.5 + dataPulse * 0.4})`
            : `rgba(0, 200, 255, ${0.5 + dataPulse * 0.4})`;
          ctx.fillStyle = podColor;
          ctx.shadowColor = side > 0 ? "#ff3030" : "#00ccff";
          ctx.shadowBlur = 5 * scale;
          ctx.beginPath();
          ctx.arc(side * 3 * scale, -1 * scale, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Yellow hazard V-stripe
          ctx.fillStyle = "#eab308";
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(-7 * scale, -5.5 * scale);
          ctx.lineTo(-5 * scale, -6 * scale);
          ctx.lineTo(0, -3 * scale);
          ctx.lineTo(5 * scale, -6 * scale);
          ctx.lineTo(7 * scale, -5.5 * scale);
          ctx.lineTo(0, -1.5 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.restore();
        }

        // === HEAVY UTILITY BELT WITH POUCHES ===
        {
          const beltY = cy + 8 * scale + bounce;
          // Belt base
          const beltGrad = ctx.createLinearGradient(cx - 14 * scale, beltY, cx + 14 * scale, beltY);
          beltGrad.addColorStop(0, "#4a4020");
          beltGrad.addColorStop(0.5, "#6a5a38");
          beltGrad.addColorStop(1, "#4a4020");
          ctx.fillStyle = beltGrad;
          ctx.fillRect(cx - 14 * scale, beltY, 28 * scale, 3.5 * scale);
          ctx.strokeStyle = "#3a3018";
          ctx.lineWidth = 1 * scale;
          ctx.strokeRect(cx - 14 * scale, beltY, 28 * scale, 3.5 * scale);

          // Belt pouches
          const pouchData = [
            { x: -11, w: 3.5, h: 4.5, c: "#4a4a30" },
            { x: -6, w: 4, h: 5, c: "#5a5038" },
            { x: 0, w: 4.5, h: 5.5, c: "#4a4a30" },
            { x: 6, w: 4, h: 5, c: "#5a5038" },
            { x: 11, w: 3.5, h: 4.5, c: "#4a4a30" },
          ];
          for (const p of pouchData) {
            ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.roundRect(cx + p.x * scale - p.w / 2 * scale, beltY + 3 * scale, p.w * scale, p.h * scale, 1 * scale);
            ctx.fill();
            ctx.strokeStyle = "#3a3a20";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
            // Pouch flap with shadow
            const flapGrad = ctx.createLinearGradient(0, beltY + 3 * scale, 0, beltY + 4.5 * scale);
            flapGrad.addColorStop(0, "#5a5a38");
            flapGrad.addColorStop(1, p.c);
            ctx.fillStyle = flapGrad;
            ctx.fillRect(cx + p.x * scale - p.w / 2 * scale, beltY + 3 * scale, p.w * scale, 1.5 * scale);
            // Snap button
            ctx.fillStyle = "#9a9a78";
            ctx.beginPath();
            ctx.arc(cx + p.x * scale, beltY + 3.8 * scale, 0.6 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Belt buckle (gear emblem)
          ctx.fillStyle = "#eab308";
          ctx.shadowColor = "#eab308";
          ctx.shadowBlur = 3 * scale;
          ctx.beginPath();
          ctx.roundRect(cx - 2.5 * scale, beltY - 0.3 * scale, 5 * scale, 4 * scale, 0.8 * scale);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Gear teeth on buckle
          ctx.strokeStyle = "#b89008";
          ctx.lineWidth = 0.4 * scale;
          ctx.beginPath();
          ctx.arc(cx, beltY + 1.7 * scale, 1.5 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Thigh rig pouches (below belt, on sides)
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#5a5030";
            ctx.fillRect(cx + side * 10 * scale, beltY + 6 * scale, side * 2.5 * scale, 5 * scale);
            const tpGrad = ctx.createLinearGradient(0, beltY + 6 * scale, 0, beltY + 12 * scale);
            tpGrad.addColorStop(0, "#4a4a30");
            tpGrad.addColorStop(1, "#3a3a22");
            ctx.fillStyle = tpGrad;
            ctx.beginPath();
            ctx.roundRect(cx + side * 10 * scale + (side > 0 ? 0 : -4.5) * scale, beltY + 6 * scale, 4.5 * scale, 6 * scale, 1 * scale);
            ctx.fill();
            ctx.strokeStyle = "#3a3a20";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
            // Tool loops on thigh
            ctx.strokeStyle = "#5a5030";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.arc(cx + side * 12 * scale, beltY + 8 * scale, 1.5 * scale, 0, Math.PI);
            ctx.stroke();
          }
        }

        // === LAYER 1: ARMS (behind rifle) ===
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + side * 16 * scale, cy - 4 * scale + bounce);
          ctx.rotate(side * (side < 0 ? -0.2 : 0.15) + (side < 0 ? toolFidget : -toolFidget));
          {
            // Upper arm
            const armGrad = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 14 * scale);
            armGrad.addColorStop(0, "#4a5a36");
            armGrad.addColorStop(0.5, "#3e4e2e");
            armGrad.addColorStop(1, "#354528");
            ctx.fillStyle = armGrad;
            ctx.beginPath();
            ctx.ellipse(0, 6 * scale, 6 * scale, 10 * scale, side * -0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#2a3a1e";
            ctx.lineWidth = 0.8 * scale;
            ctx.stroke();

            // Armored forearm plate
            const plateGrad = ctx.createLinearGradient(-4 * scale, 8 * scale, 4 * scale, 15 * scale);
            plateGrad.addColorStop(0, "#4a4a58");
            plateGrad.addColorStop(0.5, "#58586a");
            plateGrad.addColorStop(1, "#3a3a48");
            ctx.fillStyle = plateGrad;
            ctx.beginPath();
            ctx.roundRect(-4 * scale, 8 * scale, 8 * scale, 7 * scale, 2 * scale);
            ctx.fill();
            ctx.strokeStyle = "#2a2a38";
            ctx.lineWidth = 0.7 * scale;
            ctx.stroke();

            // Forearm plate highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.beginPath();
            ctx.roundRect(-3 * scale, 8.5 * scale, 6 * scale, 2 * scale, 1 * scale);
            ctx.fill();

            // Elbow guard
            ctx.fillStyle = "#5a5a62";
            ctx.beginPath();
            ctx.ellipse(0, 8 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#3a3a42";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();

            // Rivet on elbow
            ctx.fillStyle = "#8a8a78";
            ctx.beginPath();
            ctx.arc(0, 8 * scale, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // === LAYER 2: RIFLE (held across body) ===
        ctx.save();
        ctx.translate(cx + 2 * scale, cy + 6 * scale + bounce);
        ctx.rotate(-0.5 + toolFidget);
        {
          // Receiver body
          const rifleGrad = ctx.createLinearGradient(-3 * scale, -18 * scale, 3 * scale, 6 * scale);
          rifleGrad.addColorStop(0, "#2a2a2a");
          rifleGrad.addColorStop(0.3, "#1e1e1e");
          rifleGrad.addColorStop(0.6, "#2a2a2a");
          rifleGrad.addColorStop(1, "#1a1a1a");
          ctx.fillStyle = rifleGrad;
          ctx.beginPath();
          ctx.roundRect(-2.5 * scale, -18 * scale, 5 * scale, 22 * scale, 1 * scale);
          ctx.fill();
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Barrel
          const barrelGrad = ctx.createLinearGradient(-1.2 * scale, -28 * scale, 1.2 * scale, -18 * scale);
          barrelGrad.addColorStop(0, "#3a3a3a");
          barrelGrad.addColorStop(0.5, "#2a2a2a");
          barrelGrad.addColorStop(1, "#3a3a3a");
          ctx.fillStyle = barrelGrad;
          ctx.fillRect(-1.2 * scale, -28 * scale, 2.4 * scale, 12 * scale);
          ctx.strokeStyle = "#1a1a1a";
          ctx.lineWidth = 0.3 * scale;
          ctx.strokeRect(-1.2 * scale, -28 * scale, 2.4 * scale, 12 * scale);

          // Muzzle brake with slits
          ctx.fillStyle = "#2a2a2a";
          ctx.beginPath();
          ctx.roundRect(-2.2 * scale, -30 * scale, 4.4 * scale, 3 * scale, 0.5 * scale);
          ctx.fill();
          ctx.strokeStyle = "#1a1a1a";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          // Muzzle slits
          ctx.strokeStyle = "#444444";
          ctx.lineWidth = 0.3 * scale;
          for (const sy of [-29.5, -28.5, -27.5]) {
            ctx.beginPath();
            ctx.moveTo(-1.8 * scale, sy * scale);
            ctx.lineTo(1.8 * scale, sy * scale);
            ctx.stroke();
          }

          // Foregrip
          ctx.fillStyle = "#3a3020";
          ctx.beginPath();
          ctx.roundRect(-2 * scale, -12 * scale, 4 * scale, 5 * scale, 1 * scale);
          ctx.fill();
          ctx.strokeStyle = "#2a2018";
          ctx.lineWidth = 0.4 * scale;
          ctx.stroke();

          // Scope mount rail
          ctx.fillStyle = "#3a3a3a";
          ctx.fillRect(-1.8 * scale, -18 * scale, 3.6 * scale, 1 * scale);

          // Scope
          ctx.fillStyle = "#3a3a48";
          ctx.beginPath();
          ctx.roundRect(-1.8 * scale, -17 * scale, 3.6 * scale, 8 * scale, 1.2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#2a2a38";
          ctx.lineWidth = 0.4 * scale;
          ctx.stroke();
          // Scope lens glow
          ctx.fillStyle = `rgba(80, 160, 255, ${0.3 + dataPulse * 0.3})`;
          ctx.shadowColor = "#4090ff";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(0, -17 * scale, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Scope reticle ring
          ctx.strokeStyle = "#2a2a38";
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.arc(0, -17 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Trigger guard
          ctx.strokeStyle = "#333333";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(1 * scale, -2 * scale);
          ctx.quadraticCurveTo(3 * scale, 1 * scale, 1 * scale, 2 * scale);
          ctx.stroke();

          // Stock
          const stockGrad = ctx.createLinearGradient(-3.5 * scale, 3 * scale, 3.5 * scale, 14 * scale);
          stockGrad.addColorStop(0, "#4a3828");
          stockGrad.addColorStop(0.5, "#3a2818");
          stockGrad.addColorStop(1, "#2a1e10");
          ctx.fillStyle = stockGrad;
          ctx.beginPath();
          ctx.roundRect(-3.5 * scale, 3 * scale, 7 * scale, 11 * scale, 2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#2a1e10";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
          // Stock buttpad
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.roundRect(-3 * scale, 12 * scale, 6 * scale, 2 * scale, 0.8 * scale);
          ctx.fill();

          // Magazine
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.roundRect(2.2 * scale, -7 * scale, 3 * scale, 6 * scale, 0.8 * scale);
          ctx.fill();
          ctx.strokeStyle = "#b89008";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          // Magazine ribs
          ctx.strokeStyle = "#ca9a08";
          ctx.lineWidth = 0.3 * scale;
          for (const ry of [-5, -3, -1]) {
            ctx.beginPath();
            ctx.moveTo(2.5 * scale, (ry - 0.8) * scale);
            ctx.lineTo(4.8 * scale, (ry - 0.8) * scale);
            ctx.stroke();
          }
        }
        ctx.restore();

        // === LAYER 3: GLOVED HANDS (in front of rifle) ===
        // Left hand (on foregrip)
        ctx.save();
        ctx.translate(cx - 8 * scale, cy + 2 * scale + bounce);
        ctx.rotate(-0.3 + toolFidget);
        {
          // Glove base
          const gloveGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 5 * scale);
          gloveGrad.addColorStop(0, "#4a4a42");
          gloveGrad.addColorStop(1, "#3a3a32");
          ctx.fillStyle = gloveGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, 5 * scale, 4 * scale, -0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#2a2a22";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Finger segments
          for (let f = 0; f < 4; f++) {
            const fAngle = -0.8 + f * 0.4;
            const fx = Math.cos(fAngle) * 4 * scale;
            const fy = Math.sin(fAngle) * 3 * scale;
            ctx.fillStyle = "#3a3a32";
            ctx.beginPath();
            ctx.ellipse(fx, fy, 1.5 * scale, 1 * scale, fAngle, 0, Math.PI * 2);
            ctx.fill();
          }
          // Armored knuckle plate
          ctx.fillStyle = "#5a5a52";
          ctx.beginPath();
          ctx.roundRect(-3 * scale, -2.5 * scale, 6 * scale, 2 * scale, 0.5 * scale);
          ctx.fill();
        }
        ctx.restore();

        // Right hand (on grip/trigger)
        ctx.save();
        ctx.translate(cx + 6 * scale, cy + 10 * scale + bounce);
        ctx.rotate(-0.4 + toolFidget);
        {
          const gloveGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 5 * scale);
          gloveGrad.addColorStop(0, "#4a4a42");
          gloveGrad.addColorStop(1, "#3a3a32");
          ctx.fillStyle = gloveGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, 5 * scale, 4 * scale, -0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#2a2a22";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Finger segments
          for (let f = 0; f < 4; f++) {
            const fAngle = -0.9 + f * 0.4;
            const fx = Math.cos(fAngle) * 4 * scale;
            const fy = Math.sin(fAngle) * 3 * scale;
            ctx.fillStyle = "#3a3a32";
            ctx.beginPath();
            ctx.ellipse(fx, fy, 1.5 * scale, 1 * scale, fAngle, 0, Math.PI * 2);
            ctx.fill();
          }
          // Trigger finger
          ctx.fillStyle = "#3a3a32";
          ctx.beginPath();
          ctx.ellipse(2 * scale, -2 * scale, 1 * scale, 2 * scale, -0.3, 0, Math.PI * 2);
          ctx.fill();
          // Armored knuckle plate
          ctx.fillStyle = "#5a5a52";
          ctx.beginPath();
          ctx.roundRect(-3 * scale, -2.5 * scale, 6 * scale, 2 * scale, 0.5 * scale);
          ctx.fill();
        }
        ctx.restore();

        // === WRENCH ON TOOLBELT ===
        ctx.save();
        ctx.translate(cx - 12 * scale, cy + 10 * scale + bounce);
        ctx.rotate(0.25);
        {
          // Wrench shaft
          const shaftGrad = ctx.createLinearGradient(-1.2 * scale, 0, 1.2 * scale, 0);
          shaftGrad.addColorStop(0, "#8a8a92");
          shaftGrad.addColorStop(0.5, "#a0a0a8");
          shaftGrad.addColorStop(1, "#7a7a82");
          ctx.fillStyle = shaftGrad;
          ctx.beginPath();
          ctx.roundRect(-1.2 * scale, 0, 2.4 * scale, 9 * scale, 0.4 * scale);
          ctx.fill();
          ctx.strokeStyle = "#5a5a62";
          ctx.lineWidth = 0.4 * scale;
          ctx.stroke();
          // Wrench head (open jaw)
          const jawGrad = ctx.createLinearGradient(-3.5 * scale, 8 * scale, 3.5 * scale, 8 * scale);
          jawGrad.addColorStop(0, "#9a9aa0");
          jawGrad.addColorStop(0.5, "#b0b0b8");
          jawGrad.addColorStop(1, "#8a8a92");
          ctx.fillStyle = jawGrad;
          ctx.beginPath();
          ctx.moveTo(-2.5 * scale, 7.5 * scale);
          ctx.lineTo(-3.5 * scale, 11 * scale);
          ctx.lineTo(-0.5 * scale, 11 * scale);
          ctx.lineTo(-0.5 * scale, 7.5 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(2.5 * scale, 7.5 * scale);
          ctx.lineTo(3.5 * scale, 11 * scale);
          ctx.lineTo(0.5 * scale, 11 * scale);
          ctx.lineTo(0.5 * scale, 7.5 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#6a6a72";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          // Yellow grip wrapping
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 0.6 * scale;
          for (const gy of [1, 2.5, 4]) {
            ctx.beginPath();
            ctx.moveTo(-1.2 * scale, gy * scale);
            ctx.lineTo(1.2 * scale, (gy + 0.5) * scale);
            ctx.stroke();
          }
        }
        ctx.restore();

        // Small wrench tucked in belt (right side)
        ctx.save();
        ctx.translate(cx + 10 * scale, cy + 10 * scale + bounce);
        ctx.rotate(-0.3);
        {
          ctx.fillStyle = "#8a8a92";
          ctx.beginPath();
          ctx.roundRect(-0.9 * scale, 0, 1.8 * scale, 6 * scale, 0.3 * scale);
          ctx.fill();
          ctx.strokeStyle = "#6a6a72";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          // Wrench head
          ctx.strokeStyle = "#7a7a82";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.arc(0, 6.5 * scale, 1.5 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#8a8a92";
          ctx.beginPath();
          ctx.arc(0, 6.5 * scale, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // === HEAD + HELMET ===
        {
          const hX = cx + idleSway;
          const hY = cy - 16 * scale + bounce;

          // Face
          const faceGrad = ctx.createRadialGradient(hX, hY, 0, hX, hY, 9 * scale);
          faceGrad.addColorStop(0, "#ddb088");
          faceGrad.addColorStop(0.7, "#c89868");
          faceGrad.addColorStop(1, "#b88858");
          ctx.fillStyle = faceGrad;
          ctx.beginPath();
          ctx.ellipse(hX, hY, 9 * scale, 8 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#a07858";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Chin/jawline shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
          ctx.beginPath();
          ctx.ellipse(hX, hY + 3 * scale, 7 * scale, 4 * scale, 0, 0, Math.PI);
          ctx.fill();

          // Determined grin
          ctx.strokeStyle = "#8b6655";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.arc(hX, hY + 5 * scale, 2 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
          ctx.stroke();

          // Angular tactical hardhat
          const helmetGrad = ctx.createRadialGradient(
            hX - 2 * scale, hY - 8 * scale, 0,
            hX, hY - 4 * scale, 16 * scale
          );
          helmetGrad.addColorStop(0, "#ffdd44");
          helmetGrad.addColorStop(0.3, "#eab308");
          helmetGrad.addColorStop(0.7, "#c89a08");
          helmetGrad.addColorStop(1, "#8a6a08");
          ctx.fillStyle = helmetGrad;
          ctx.beginPath();
          ctx.moveTo(hX - 13 * scale, hY - 4 * scale);
          ctx.lineTo(hX - 11 * scale, hY - 11 * scale);
          ctx.quadraticCurveTo(hX - 6 * scale, hY - 16 * scale, hX, hY - 15 * scale);
          ctx.quadraticCurveTo(hX + 6 * scale, hY - 16 * scale, hX + 11 * scale, hY - 11 * scale);
          ctx.lineTo(hX + 13 * scale, hY - 4 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#7a5a08";
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          // Helmet highlight arc
          ctx.strokeStyle = "rgba(255, 255, 200, 0.25)";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.arc(hX - 2 * scale, hY - 10 * scale, 7 * scale, -0.8 * Math.PI, -0.3 * Math.PI);
          ctx.stroke();

          // Central ridge
          ctx.fillStyle = "#ca9a08";
          ctx.beginPath();
          ctx.moveTo(hX - 1.5 * scale, hY - 15 * scale);
          ctx.lineTo(hX - 0.8 * scale, hY - 5 * scale);
          ctx.lineTo(hX + 0.8 * scale, hY - 5 * scale);
          ctx.lineTo(hX + 1.5 * scale, hY - 15 * scale);
          ctx.closePath();
          ctx.fill();

          // Helmet brim
          const brimGrad = ctx.createLinearGradient(hX - 14 * scale, hY - 4 * scale, hX + 14 * scale, hY - 4 * scale);
          brimGrad.addColorStop(0, "#9a7a08");
          brimGrad.addColorStop(0.5, "#c8a008");
          brimGrad.addColorStop(1, "#9a7a08");
          ctx.fillStyle = brimGrad;
          ctx.beginPath();
          ctx.moveTo(hX - 14 * scale, hY - 4 * scale);
          ctx.lineTo(hX - 13 * scale, hY - 6 * scale);
          ctx.lineTo(hX + 13 * scale, hY - 6 * scale);
          ctx.lineTo(hX + 14 * scale, hY - 4 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#6a4a08";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Side rail systems
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#5a5a5a";
            ctx.beginPath();
            ctx.roundRect(hX + side * 10 * scale - (side > 0 ? 0 : 3) * scale, hY - 11 * scale, 3 * scale, 7 * scale, 0.5 * scale);
            ctx.fill();
            ctx.strokeStyle = "#4a4a4a";
            ctx.lineWidth = 0.4 * scale;
            ctx.stroke();
          }

          // Ear protection / comms modules
          for (const side of [-1, 1]) {
            const comGrad = ctx.createRadialGradient(hX + side * 12 * scale, hY - 2 * scale, 0, hX + side * 12 * scale, hY - 2 * scale, 4 * scale);
            comGrad.addColorStop(0, "#3a3a3a");
            comGrad.addColorStop(1, "#1a1a1a");
            ctx.fillStyle = comGrad;
            ctx.beginPath();
            ctx.roundRect(hX + side * 12 * scale - 2.5 * scale, hY - 5 * scale, 5 * scale, 6 * scale, 1.5 * scale);
            ctx.fill();
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
            // Comm speaker grille
            ctx.strokeStyle = "#4a4a4a";
            ctx.lineWidth = 0.3 * scale;
            for (const gy of [-3, -1.5, 0]) {
              ctx.beginPath();
              ctx.moveTo(hX + side * 12 * scale - 1.5 * scale, hY + gy * scale);
              ctx.lineTo(hX + side * 12 * scale + 1.5 * scale, hY + gy * scale);
              ctx.stroke();
            }
            // Comm indicator
            ctx.fillStyle = `rgba(0, 200, 100, ${0.4 + dataPulse * 0.3})`;
            ctx.shadowColor = "#00cc66";
            ctx.shadowBlur = 2 * scale;
            ctx.beginPath();
            ctx.arc(hX + side * 12 * scale, hY - 1 * scale, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Headlamp housing
          ctx.fillStyle = "#4a4a4a";
          ctx.beginPath();
          ctx.roundRect(hX - 3.5 * scale, hY - 11 * scale, 7 * scale, 3.5 * scale, 1.2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#333333";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
          // Headlamp lens glow
          ctx.fillStyle = `rgba(255, 255, 220, ${0.7 + dataPulse * 0.3})`;
          ctx.shadowColor = "#ffffcc";
          ctx.shadowBlur = 8 * scale;
          ctx.beginPath();
          ctx.ellipse(hX, hY - 9.5 * scale, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Headlamp reflector ring
          ctx.strokeStyle = "#6a6a6a";
          ctx.lineWidth = 0.4 * scale;
          ctx.beginPath();
          ctx.ellipse(hX, hY - 9.5 * scale, 2.8 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();

          // NVG Array (quad tubes)
          const nvgY = hY - 2 * scale;
          // NVG bridge mount
          ctx.fillStyle = "#111111";
          ctx.beginPath();
          ctx.roundRect(hX - 8 * scale, nvgY - 1 * scale, 16 * scale, 2.5 * scale, 0.8 * scale);
          ctx.fill();
          ctx.strokeStyle = "#0a0a0a";
          ctx.lineWidth = 0.4 * scale;
          ctx.stroke();
          // NVG tubes
          const nvgTubes = [-5.5, -2, 2, 5.5];
          for (let i = 0; i < 4; i++) {
            const tubeX = hX + nvgTubes[i] * scale;
            const tw = 2.8 * scale;
            const tl = 4 * scale;
            // Tube housing
            ctx.fillStyle = "#1a1a1a";
            ctx.beginPath();
            ctx.roundRect(tubeX - tw / 2, nvgY + 1 * scale, tw, tl, 0.5 * scale);
            ctx.fill();
            ctx.strokeStyle = "#0a0a0a";
            ctx.lineWidth = 0.3 * scale;
            ctx.stroke();
            // Lens glow
            const nvgGlow = 0.6 + Math.sin(t * 3.5 + i * 1.2) * 0.15 + dataPulse * 0.15;
            ctx.fillStyle = `rgba(0, 255, 80, ${nvgGlow})`;
            ctx.shadowColor = "#00ff50";
            ctx.shadowBlur = 5 * scale;
            ctx.beginPath();
            ctx.arc(tubeX, nvgY + 1 * scale + tl, 1.3 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Lens ring
            ctx.strokeStyle = "#333333";
            ctx.lineWidth = 0.4 * scale;
            ctx.beginPath();
            ctx.arc(tubeX, nvgY + 1 * scale + tl, 1.5 * scale, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Helmet side indicator lights
          ctx.fillStyle = `rgba(0, 255, 130, ${0.6 + dataPulse * 0.3})`;
          ctx.shadowColor = "#00ff88";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(hX - 9 * scale, hY - 9 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255, 60, 40, ${0.6 + dataPulse * 0.3})`;
          ctx.shadowColor = "#ff3030";
          ctx.beginPath();
          ctx.arc(hX + 9 * scale, hY - 9 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Holographic gear projections (floating)
        if (animated) {
          for (let g = 0; g < 3; g++) {
            const gAngle = t * 0.8 + g * Math.PI * 0.667;
            const gR = 22 * scale;
            const gx = cx + Math.cos(gAngle) * gR;
            const gy = cy - 4 * scale + Math.sin(gAngle) * gR * 0.4;
            const gAlpha = 0.2 + dataPulse * 0.15;
            // Outer gear ring
            ctx.strokeStyle = `rgba(234, 179, 8, ${gAlpha})`;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.arc(gx, gy + bounce, 3.5 * scale, 0, Math.PI * 2);
            ctx.stroke();
            // Inner hub
            ctx.fillStyle = `rgba(234, 179, 8, ${gAlpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(gx, gy + bounce, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Gear teeth
            ctx.strokeStyle = `rgba(234, 179, 8, ${gAlpha})`;
            ctx.lineWidth = 0.8 * scale;
            for (let tooth = 0; tooth < 8; tooth++) {
              const tAngle = (tooth * Math.PI) / 4 + t * (g % 2 === 0 ? 1 : -1);
              ctx.beginPath();
              ctx.moveTo(gx + Math.cos(tAngle) * 3.5 * scale, gy + bounce + Math.sin(tAngle) * 3.5 * scale);
              ctx.lineTo(gx + Math.cos(tAngle) * 5 * scale, gy + bounce + Math.sin(tAngle) * 5 * scale);
              ctx.stroke();
            }
          }
        }
        break;
      }
    }
  }, [type, size, animated]);

  useSpriteTicker(animated, 50, renderHero);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
