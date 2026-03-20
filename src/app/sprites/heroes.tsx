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

        // Warm orange/amber backlight
        {
          const blGrad = ctx.createRadialGradient(cx, cy + 4 * scale, 0, cx, cy + 4 * scale, 48 * scale);
          blGrad.addColorStop(0, "rgba(255, 160, 40, 0.32)");
          blGrad.addColorStop(0.2, "rgba(255, 120, 30, 0.20)");
          blGrad.addColorStop(0.45, "rgba(220, 80, 15, 0.10)");
          blGrad.addColorStop(0.7, "rgba(180, 50, 10, 0.04)");
          blGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = blGrad;
          ctx.beginPath();
          ctx.arc(cx, cy + 4 * scale, 48 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fiery orange/red aura (layered)
        for (let layer = 0; layer < 2; layer++) {
          const auraGrad = ctx.createRadialGradient(cx, cy, layer * 4 * scale, cx, cy, (30 + layer * 5) * scale);
          auraGrad.addColorStop(0, `rgba(255, 120, 40, ${(auraPulse * 0.32) / (layer + 1)})`);
          auraGrad.addColorStop(0.4, `rgba(230, 70, 15, ${(auraPulse * 0.16) / (layer + 1)})`);
          auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, (30 + layer * 5) * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === TIGER TAIL (behind everything) ===
        {
          const tailWave = animated ? Math.sin(t * 1.8) * 0.15 : 0;
          ctx.save();
          ctx.translate(cx + 8 * scale, cy + 6 * scale + bounce);
          ctx.rotate(0.3 + tailWave);
          ctx.lineCap = "round";

          // Tail base fur (thick orange)
          const tailGrad = ctx.createLinearGradient(0, 0, 14 * scale, -24 * scale);
          tailGrad.addColorStop(0, "#e87820");
          tailGrad.addColorStop(0.4, "#e06a10");
          tailGrad.addColorStop(0.8, "#d05a00");
          tailGrad.addColorStop(1, "#1a1a1a");
          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = 5.5 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(
            6 * scale, -4 * scale,
            12 * scale + tailWave * 10, -10 * scale,
            16 * scale + tailWave * 15, -14 * scale
          );
          ctx.bezierCurveTo(
            18 * scale + tailWave * 18, -18 * scale,
            17 * scale + tailWave * 20, -22 * scale,
            14 * scale + tailWave * 18, -24 * scale
          );
          ctx.stroke();

          // Lighter center highlight
          ctx.strokeStyle = "#f0a050";
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(1 * scale, -1 * scale);
          ctx.bezierCurveTo(
            7 * scale, -5 * scale,
            13 * scale + tailWave * 10, -11 * scale,
            16 * scale + tailWave * 14, -14 * scale
          );
          ctx.stroke();

          // Dark stripes wrapping around tail
          ctx.strokeStyle = "#1a1008";
          ctx.lineWidth = 2.5 * scale;
          for (let ts = 0; ts < 5; ts++) {
            const tPos = 0.15 + ts * 0.17;
            const tx = tPos * 16 * scale + tailWave * tPos * 14;
            const ty = -tPos * 20 * scale;
            ctx.beginPath();
            ctx.moveTo(tx - 3 * scale, ty - 1.5 * scale);
            ctx.quadraticCurveTo(tx, ty + 2 * scale, tx + 3 * scale, ty + 0.5 * scale);
            ctx.stroke();
          }

          // Black tip
          ctx.strokeStyle = "#1a1008";
          ctx.lineWidth = 5 * scale;
          ctx.beginPath();
          ctx.moveTo(14 * scale + tailWave * 18, -24 * scale);
          ctx.bezierCurveTo(
            13 * scale + tailWave * 17, -27 * scale,
            11 * scale + tailWave * 15, -28 * scale,
            10 * scale + tailWave * 14, -26 * scale
          );
          ctx.stroke();

          // Fur edge tufts
          ctx.strokeStyle = "#c85800";
          ctx.lineWidth = 1 * scale;
          for (let ft = 0; ft < 4; ft++) {
            const fPos = 0.2 + ft * 0.2;
            const fx = fPos * 15 * scale + tailWave * fPos * 12;
            const fy = -fPos * 19 * scale;
            ctx.beginPath();
            ctx.moveTo(fx + 2.5 * scale, fy);
            ctx.lineTo(fx + 4 * scale, fy - 1 * scale);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(fx - 2.5 * scale, fy);
            ctx.lineTo(fx - 4 * scale, fy + 1 * scale);
            ctx.stroke();
          }

          ctx.lineCap = "butt";
          ctx.restore();
        }

        // === MASSIVE MECHANICAL SHOULDER PADS (behind body) ===
        const armSwing = animated ? Math.sin(t * 2) * 0.05 : 0;

        // Left shoulder pad - large circular mechanical design
        ctx.save();
        ctx.translate(cx - 22 * scale, cy - 4 * scale + bounce);
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
        ctx.translate(cx + 22 * scale, cy - 4 * scale + bounce);
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

        // === ARMORED TIGER ARMS ===
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + side * 22 * scale, cy + 8 * scale + bounce);
          ctx.rotate(side * (0.3 - armSwing * side));

          // Upper arm (bronze armor plate)
          const uaGrad = ctx.createLinearGradient(-5 * scale, -2 * scale, 5 * scale, 12 * scale);
          uaGrad.addColorStop(0, "#c07848");
          uaGrad.addColorStop(0.3, "#b06838");
          uaGrad.addColorStop(0.7, "#a05828");
          uaGrad.addColorStop(1, "#8a4820");
          ctx.fillStyle = uaGrad;
          ctx.beginPath();
          ctx.roundRect(-5 * scale, -2 * scale, 10 * scale, 14 * scale, 3 * scale);
          ctx.fill();
          ctx.strokeStyle = "#d08858";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          // Armor band
          ctx.fillStyle = "#d09060";
          ctx.fillRect(-5 * scale, 3 * scale, 10 * scale, 1.5 * scale);
          // Rivet
          ctx.fillStyle = "#e0a070";
          ctx.beginPath();
          ctx.arc(0, 7 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Elbow joint
          ctx.fillStyle = "#8a4820";
          ctx.beginPath();
          ctx.ellipse(0, 12 * scale, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#6a3818";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Forearm (orange fur showing)
          const faGrad = ctx.createLinearGradient(-4 * scale, 13 * scale, 4 * scale, 22 * scale);
          faGrad.addColorStop(0, "#e07020");
          faGrad.addColorStop(0.5, "#d86818");
          faGrad.addColorStop(1, "#c85a10");
          ctx.fillStyle = faGrad;
          ctx.beginPath();
          ctx.roundRect(-4 * scale, 13 * scale, 8 * scale, 9 * scale, 2 * scale);
          ctx.fill();
          ctx.strokeStyle = "#a04810";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();
          // Forearm stripes
          ctx.strokeStyle = "#1a1008";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(-3 * scale, 16 * scale);
          ctx.lineTo(3 * scale, 17 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-2.5 * scale, 19 * scale);
          ctx.lineTo(2.5 * scale, 19.5 * scale);
          ctx.stroke();

          // Paw with claws
          ctx.fillStyle = "#e87820";
          ctx.beginPath();
          ctx.ellipse(0, 18 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          // Paw pads
          ctx.fillStyle = "#f0a050";
          ctx.beginPath();
          ctx.ellipse(0, 18.5 * scale, 3.5 * scale, 2 * scale, 0, 0, Math.PI);
          ctx.fill();
          // Claws
          ctx.fillStyle = "#f8f0e0";
          for (let c = -2; c <= 2; c++) {
            ctx.beginPath();
            ctx.moveTo(c * 1.8 * scale, 20 * scale);
            ctx.lineTo(c * 1.8 * scale - side * 0.3 * scale, 22.5 * scale);
            ctx.lineTo(c * 1.8 * scale + 0.8 * scale, 20.5 * scale);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }

        // === ARMOR SKIRT (PTERUGES) - V shape ===
        {
          const skirtPlates = [
            { x: -16, w: 4.5, drop: 0 },
            { x: -10, w: 4.5, drop: 1 },
            { x: -5, w: 5, drop: 3 },
            { x: 0, w: 5, drop: 4 },
            { x: 5, w: 5, drop: 3 },
            { x: 10, w: 4.5, drop: 1 },
            { x: 16, w: 4.5, drop: 0 },
          ];
          for (const plate of skirtPlates) {
            const px = cx + plate.x * scale;
            const pY = cy + 14 * scale + bounce + plate.drop * scale;
            const pH = 8 * scale + plate.drop * 0.6 * scale;
            const pW = plate.w * scale;
            // Plate body
            const pGrad = ctx.createLinearGradient(px, pY, px, pY + pH);
            pGrad.addColorStop(0, "#d08050");
            pGrad.addColorStop(0.3, "#c07040");
            pGrad.addColorStop(0.7, "#a05828");
            pGrad.addColorStop(1, "#803818");
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.moveTo(px - pW / 2, pY);
            ctx.lineTo(px + pW / 2, pY);
            ctx.lineTo(px + pW / 2 - 0.5 * scale, pY + pH);
            ctx.quadraticCurveTo(px, pY + pH + 1.5 * scale, px - pW / 2 + 0.5 * scale, pY + pH);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#6a3818";
            ctx.lineWidth = 0.7 * scale;
            ctx.stroke();
            // Bronze trim at top of plate
            ctx.fillStyle = "#d8905a";
            ctx.fillRect(px - pW / 2, pY, pW, 1.5 * scale);
            // Center rivet
            ctx.fillStyle = "#e0a070";
            ctx.beginPath();
            ctx.arc(px, pY + 2.5 * scale, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Embossed line
            ctx.strokeStyle = "#b06838";
            ctx.lineWidth = 0.4 * scale;
            ctx.beginPath();
            ctx.moveTo(px, pY + 3.5 * scale);
            ctx.lineTo(px, pY + pH - 1 * scale);
            ctx.stroke();
          }
        }

        // === MAIN ARMOR BODY ===
        {
          const bY = bounce;
          // Base armor — layered dark bronze (wider torso)
          const bodyGrad = ctx.createLinearGradient(cx - 18 * scale, cy - 6 * scale, cx + 18 * scale, cy + 14 * scale);
          bodyGrad.addColorStop(0, "#3a2818");
          bodyGrad.addColorStop(0.15, "#4a3828");
          bodyGrad.addColorStop(0.4, "#5a4838");
          bodyGrad.addColorStop(0.6, "#4a3828");
          bodyGrad.addColorStop(0.85, "#3a2818");
          bodyGrad.addColorStop(1, "#2a1c10");
          ctx.fillStyle = bodyGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 16 * scale, cy + 16 * scale + bY);
          ctx.lineTo(cx - 18 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx - 11 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx, cy - 14 * scale + bY);
          ctx.lineTo(cx + 11 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx + 18 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 16 * scale, cy + 16 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#1a1008";
          ctx.lineWidth = 1.2 * scale;
          ctx.stroke();

          // Tiger-stripe patterns (clipped)
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx - 16 * scale, cy + 16 * scale + bY);
          ctx.lineTo(cx - 18 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx - 11 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx, cy - 14 * scale + bY);
          ctx.lineTo(cx + 11 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx + 18 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 16 * scale, cy + 16 * scale + bY);
          ctx.closePath();
          ctx.clip();
          // Bold orange stripes
          ctx.strokeStyle = "#d06820";
          ctx.lineWidth = 2.2 * scale;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 14 * scale, cy - 6 * scale + bY);
            ctx.bezierCurveTo(cx + side * 12 * scale, cy - 1 * scale + bY, cx + side * 13 * scale, cy + 5 * scale + bY, cx + side * 15 * scale, cy + 12 * scale + bY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + side * 9 * scale, cy - 8 * scale + bY);
            ctx.bezierCurveTo(cx + side * 7 * scale, cy - 2 * scale + bY, cx + side * 8 * scale, cy + 4 * scale + bY, cx + side * 10 * scale, cy + 14 * scale + bY);
            ctx.stroke();
          }
          // Dark shadow stripes
          ctx.strokeStyle = "rgba(26, 16, 8, 0.5)";
          ctx.lineWidth = 1.2 * scale;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 15.5 * scale, cy - 4 * scale + bY);
            ctx.bezierCurveTo(cx + side * 13.5 * scale, cy + 2 * scale + bY, cx + side * 14 * scale, cy + 8 * scale + bY, cx + side * 16 * scale, cy + 14 * scale + bY);
            ctx.stroke();
          }
          ctx.restore();

          // Bronze chest plate overlay
          const chestGrad = ctx.createLinearGradient(cx - 13 * scale, cy - 14 * scale, cx + 13 * scale, cy + 2 * scale);
          chestGrad.addColorStop(0, "rgba(208, 136, 80, 0.35)");
          chestGrad.addColorStop(0.5, "rgba(176, 96, 48, 0.18)");
          chestGrad.addColorStop(1, "rgba(208, 136, 80, 0.25)");
          ctx.fillStyle = chestGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 13 * scale, cy - 2 * scale + bY);
          ctx.lineTo(cx - 11 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx, cy - 14 * scale + bY);
          ctx.lineTo(cx + 11 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx + 13 * scale, cy - 2 * scale + bY);
          ctx.closePath();
          ctx.fill();

          // Horizontal trim bands (bronze with glow)
          ctx.strokeStyle = "#d08858";
          ctx.shadowColor = "#ff8030";
          ctx.shadowBlur = 2 * scale;
          ctx.lineWidth = 1.4 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 17 * scale, cy - 2 * scale + bY);
          ctx.lineTo(cx + 17 * scale, cy - 2 * scale + bY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 15 * scale, cy + 8 * scale + bY);
          ctx.lineTo(cx + 15 * scale, cy + 8 * scale + bY);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Bronze V-chevron
          ctx.strokeStyle = "#c06830";
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 12 * scale, cy - 8 * scale + bY);
          ctx.lineTo(cx, cy + 2 * scale + bY);
          ctx.lineTo(cx + 12 * scale, cy - 8 * scale + bY);
          ctx.stroke();
          ctx.strokeStyle = "#e0a068";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 10 * scale, cy - 7 * scale + bY);
          ctx.lineTo(cx, cy + 0 * scale + bY);
          ctx.lineTo(cx + 10 * scale, cy - 7 * scale + bY);
          ctx.stroke();

          // Center chest emblem — ornate diamond with tiger head
          const emblemGrad = ctx.createRadialGradient(cx, cy + 2 * scale + bY, 0, cx, cy + 2 * scale + bY, 6 * scale);
          emblemGrad.addColorStop(0, "#e0a870");
          emblemGrad.addColorStop(0.5, "#c07840");
          emblemGrad.addColorStop(1, "#9a5020");
          ctx.fillStyle = emblemGrad;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4 * scale + bY);
          ctx.lineTo(cx - 5 * scale, cy + 2 * scale + bY);
          ctx.lineTo(cx, cy + 8 * scale + bY);
          ctx.lineTo(cx + 5 * scale, cy + 2 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#e0a868";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          // Tiger head silhouette in emblem
          ctx.fillStyle = "#1a1008";
          ctx.beginPath();
          ctx.arc(cx, cy + 1.5 * scale + bY, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 1.5 * scale, cy + 0 * scale + bY);
            ctx.lineTo(cx + side * 2.8 * scale, cy - 1.8 * scale + bY);
            ctx.lineTo(cx + side * 0.5 * scale, cy - 0.5 * scale + bY);
            ctx.fill();
          }
          // Emblem glow
          ctx.fillStyle = `rgba(255, 100, 30, ${gemGlow * 0.3})`;
          ctx.beginPath();
          ctx.arc(cx, cy + 2 * scale + bY, 4 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Bronze studs along sides
          ctx.fillStyle = "#d08858";
          ctx.strokeStyle = "#b06838";
          ctx.lineWidth = 0.5 * scale;
          for (let i = 0; i < 4; i++) {
            const sy = cy - 2 * scale + i * 4 * scale + bY;
            for (const side of [-1, 1]) {
              ctx.beginPath();
              ctx.arc(cx + side * 10 * scale, sy, 1.4 * scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
            if (i < 3) {
              ctx.strokeStyle = "#b06838";
              ctx.lineWidth = 0.5 * scale;
              ctx.beginPath();
              ctx.moveTo(cx - 10 * scale, sy);
              ctx.lineTo(cx + 10 * scale, sy);
              ctx.stroke();
            }
          }

          // Red gem accents (brighter glow)
          ctx.fillStyle = `rgba(240, 60, 40, ${gemGlow})`;
          ctx.shadowColor = "#ff2200";
          ctx.shadowBlur = 6 * scale;
          for (const pos of [[-12, -8], [12, -8], [0, 10]]) {
            ctx.beginPath();
            ctx.arc(cx + pos[0] * scale, cy + pos[1] * scale + bY, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;

          // Connecting armor bands
          for (const side of [-1, 1]) {
            ctx.strokeStyle = "#d08858";
            ctx.lineWidth = 2.5 * scale;
            ctx.beginPath();
            ctx.moveTo(cx + side * 18 * scale, cy - 4 * scale + bY);
            ctx.quadraticCurveTo(cx + side * 20 * scale, cy - 9 * scale + bY, cx + side * 21 * scale, cy - 4 * scale + bY);
            ctx.stroke();
          }

          // Orange trim glow along armor edges
          ctx.strokeStyle = "#e08030";
          ctx.shadowColor = "#ff6020";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 16 * scale, cy + 16 * scale + bY);
          ctx.lineTo(cx - 18 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx - 11 * scale, cy - 12 * scale + bY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 16 * scale, cy + 16 * scale + bY);
          ctx.lineTo(cx + 18 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 11 * scale, cy - 12 * scale + bY);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // === BRONZE BELT / WAIST GUARD ===
        {
          const bY = bounce;
          const beltGrad = ctx.createLinearGradient(cx - 18 * scale, cy + 12 * scale + bY, cx + 18 * scale, cy + 12 * scale + bY);
          beltGrad.addColorStop(0, "#7a3818");
          beltGrad.addColorStop(0.3, "#a05828");
          beltGrad.addColorStop(0.5, "#c07848");
          beltGrad.addColorStop(0.7, "#a05828");
          beltGrad.addColorStop(1, "#7a3818");
          ctx.fillStyle = beltGrad;
          ctx.beginPath();
          ctx.roundRect(cx - 18 * scale, cy + 12 * scale + bY, 36 * scale, 4 * scale, 1 * scale);
          ctx.fill();
          ctx.strokeStyle = "#6a3818";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          // Belt segments
          ctx.strokeStyle = "#8a4820";
          ctx.lineWidth = 0.4 * scale;
          for (const bx of [-12, -6, 6, 12]) {
            ctx.beginPath();
            ctx.moveTo(cx + bx * scale, cy + 12 * scale + bY);
            ctx.lineTo(cx + bx * scale, cy + 16 * scale + bY);
            ctx.stroke();
          }
          // Belt rivets
          ctx.fillStyle = "#d08858";
          for (const bx of [-14, -7, 7, 14]) {
            ctx.beginPath();
            ctx.arc(cx + bx * scale, cy + 14 * scale + bY, 0.7 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          // Center gem buckle
          ctx.fillStyle = `rgba(220, 50, 50, ${gemGlow})`;
          ctx.shadowColor = "#ff0000";
          ctx.shadowBlur = 5 * scale;
          ctx.beginPath();
          ctx.arc(cx, cy + 14 * scale + bY, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Buckle frame
          ctx.strokeStyle = "#d08858";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.arc(cx, cy + 14 * scale + bY, 2.8 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }

        // === GORGET (NECK GUARD) ===
        {
          const gorgetGrad = ctx.createLinearGradient(cx - 16 * scale, cy - 13 * scale + bounce, cx + 16 * scale, cy - 13 * scale + bounce);
          gorgetGrad.addColorStop(0, "#8a4820");
          gorgetGrad.addColorStop(0.3, "#c07848");
          gorgetGrad.addColorStop(0.5, "#d08858");
          gorgetGrad.addColorStop(0.7, "#c07848");
          gorgetGrad.addColorStop(1, "#8a4820");
          ctx.fillStyle = gorgetGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy - 13 * scale + bounce, 16 * scale, 3.5 * scale, 0, 0, Math.PI);
          ctx.fill();
          ctx.strokeStyle = "#d08858";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
          // Gorget rivets
          ctx.fillStyle = "#e0a070";
          for (const gx of [-12, -6, 0, 6, 12]) {
            ctx.beginPath();
            ctx.arc(cx + gx * scale, cy - 12 * scale + bounce, 0.6 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // === TIGER HEAD ===
        {
          const hY = cy - 20 * scale + bounce;

          // Helmet dome shell (dark steel wrapping around head)
          {
            const hdGrad = ctx.createRadialGradient(cx, hY + 1 * scale, 0, cx, hY + 1 * scale, 16 * scale);
            hdGrad.addColorStop(0, "#3a3a44");
            hdGrad.addColorStop(0.5, "#2c2c36");
            hdGrad.addColorStop(0.8, "#1e1e28");
            hdGrad.addColorStop(1, "#14141e");
            ctx.fillStyle = hdGrad;
            ctx.beginPath();
            ctx.ellipse(cx, hY + 1 * scale, 15.5 * scale, 13.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#daa520";
            ctx.lineWidth = 0.8 * scale;
            ctx.stroke();
          }

          // Back fur volume (dark undercoat behind head)
          ctx.fillStyle = "#a04800";
          ctx.beginPath();
          ctx.ellipse(cx, hY + 1 * scale, 13.5 * scale, 11.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main head — radial gradient for depth
          const headGrad = ctx.createRadialGradient(cx, hY - 1 * scale, 0, cx, hY + 2 * scale, 12 * scale);
          headGrad.addColorStop(0, "#f08828");
          headGrad.addColorStop(0.4, "#e87820");
          headGrad.addColorStop(0.7, "#d86810");
          headGrad.addColorStop(1, "#b85008");
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.ellipse(cx, hY, 12 * scale, 10 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cheek fur puffs
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#f09830";
            ctx.beginPath();
            ctx.ellipse(cx + side * 10 * scale, hY + 2 * scale, 4 * scale, 5 * scale, side * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Fur texture strokes on head
          ctx.strokeStyle = "rgba(26, 16, 8, 0.3)";
          ctx.lineWidth = 0.5 * scale;
          for (let fi = 0; fi < 12; fi++) {
            const fAngle = (fi / 12) * Math.PI * 2;
            const fR = 8 * scale;
            const fx = cx + Math.cos(fAngle) * fR;
            const fy = hY + Math.sin(fAngle) * fR * 0.8;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(fAngle) * 3 * scale, fy + Math.sin(fAngle) * 2.5 * scale);
            ctx.stroke();
          }

          // === TIGER HELMET / CROWN ===
          // Brow guard / visor (dark steel with gold trim)
          {
            const browGrad = ctx.createLinearGradient(cx - 14 * scale, hY - 4 * scale, cx + 14 * scale, hY - 4 * scale);
            browGrad.addColorStop(0, "#2a2a34");
            browGrad.addColorStop(0.3, "#3a3a44");
            browGrad.addColorStop(0.5, "#4a4a54");
            browGrad.addColorStop(0.7, "#3a3a44");
            browGrad.addColorStop(1, "#2a2a34");
            ctx.fillStyle = browGrad;
            ctx.beginPath();
            ctx.moveTo(cx - 14 * scale, hY - 3 * scale);
            ctx.quadraticCurveTo(cx - 15 * scale, hY - 5.5 * scale, cx - 12 * scale, hY - 6 * scale);
            ctx.lineTo(cx + 12 * scale, hY - 6 * scale);
            ctx.quadraticCurveTo(cx + 15 * scale, hY - 5.5 * scale, cx + 14 * scale, hY - 3 * scale);
            ctx.lineTo(cx + 11 * scale, hY - 1 * scale);
            ctx.lineTo(cx - 11 * scale, hY - 1 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#daa520";
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
            // Gold trim line on visor
            ctx.strokeStyle = "#e8c840";
            ctx.lineWidth = 0.6 * scale;
            ctx.beginPath();
            ctx.moveTo(cx - 11 * scale, hY - 5 * scale);
            ctx.lineTo(cx + 11 * scale, hY - 5 * scale);
            ctx.stroke();
            // Gold brow rivets
            ctx.fillStyle = "#f0d860";
            for (const rx of [-9, -4.5, 0, 4.5, 9]) {
              ctx.beginPath();
              ctx.arc(cx + rx * scale, hY - 2.5 * scale, 0.8 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Cheek guards (dark steel plates with gold trim)
          for (const side of [-1, 1]) {
            const cgGrad = ctx.createLinearGradient(cx + side * 14 * scale, hY - 4 * scale, cx + side * 10 * scale, hY + 6 * scale);
            cgGrad.addColorStop(0, "#2c2c36");
            cgGrad.addColorStop(0.5, "#222230");
            cgGrad.addColorStop(1, "#1a1a26");
            ctx.fillStyle = cgGrad;
            ctx.beginPath();
            ctx.moveTo(cx + side * 13 * scale, hY - 4 * scale);
            ctx.bezierCurveTo(
              cx + side * 16 * scale, hY - 2 * scale,
              cx + side * 16 * scale, hY + 4 * scale,
              cx + side * 13 * scale, hY + 8 * scale
            );
            ctx.lineTo(cx + side * 11 * scale, hY + 6 * scale);
            ctx.bezierCurveTo(
              cx + side * 13 * scale, hY + 3 * scale,
              cx + side * 13 * scale, hY - 1 * scale,
              cx + side * 11 * scale, hY - 1 * scale
            );
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#daa520";
            ctx.lineWidth = 0.8 * scale;
            ctx.stroke();
            // Gold hinge rivet
            ctx.fillStyle = "#f0d860";
            ctx.beginPath();
            ctx.arc(cx + side * 13 * scale, hY + 1.5 * scale, 0.7 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Nose guard (nasal strip down center of face)
          {
            const ngGrad = ctx.createLinearGradient(cx - 1.5 * scale, hY, cx + 1.5 * scale, hY);
            ngGrad.addColorStop(0, "#1a1a24");
            ngGrad.addColorStop(0.35, "#3a3a44");
            ngGrad.addColorStop(0.5, "#4a4a54");
            ngGrad.addColorStop(0.65, "#3a3a44");
            ngGrad.addColorStop(1, "#1a1a24");
            ctx.fillStyle = ngGrad;
            ctx.beginPath();
            ctx.moveTo(cx - 1.5 * scale, hY - 5 * scale);
            ctx.lineTo(cx - 1.2 * scale, hY + 1 * scale);
            ctx.quadraticCurveTo(cx, hY + 2 * scale, cx + 1.2 * scale, hY + 1 * scale);
            ctx.lineTo(cx + 1.5 * scale, hY - 5 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#daa520";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
          }

          // Gold crest ridge (running front to back on helmet top)
          {
            const crGrad = ctx.createLinearGradient(cx - 2 * scale, hY, cx + 2 * scale, hY);
            crGrad.addColorStop(0, "#8a7010");
            crGrad.addColorStop(0.3, "#daa520");
            crGrad.addColorStop(0.5, "#f0d860");
            crGrad.addColorStop(0.7, "#daa520");
            crGrad.addColorStop(1, "#8a7010");
            ctx.fillStyle = crGrad;
            ctx.beginPath();
            ctx.moveTo(cx - 1.5 * scale, hY - 6 * scale);
            ctx.lineTo(cx - 1.8 * scale, hY + 4 * scale);
            ctx.quadraticCurveTo(cx, hY + 5 * scale, cx + 1.8 * scale, hY + 4 * scale);
            ctx.lineTo(cx + 1.5 * scale, hY - 6 * scale);
            ctx.quadraticCurveTo(cx, hY - 7 * scale, cx - 1.5 * scale, hY - 6 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#e8c840";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
          }

          // Tiger ears (poking through helmet)
          for (const side of [-1, 1]) {
            // Outer ear
            ctx.fillStyle = "#d06000";
            ctx.beginPath();
            ctx.moveTo(cx + side * 9 * scale, hY - 6 * scale);
            ctx.bezierCurveTo(
              cx + side * 11 * scale, hY - 10 * scale,
              cx + side * 13 * scale, hY - 13 * scale,
              cx + side * 14 * scale, hY - 14 * scale
            );
            ctx.lineTo(cx + side * 5 * scale, hY - 8 * scale);
            ctx.closePath();
            ctx.fill();
            // Inner ear
            ctx.fillStyle = "#ffb898";
            ctx.beginPath();
            ctx.moveTo(cx + side * 8.5 * scale, hY - 7 * scale);
            ctx.bezierCurveTo(
              cx + side * 10 * scale, hY - 10 * scale,
              cx + side * 11.5 * scale, hY - 12 * scale,
              cx + side * 12 * scale, hY - 12.5 * scale
            );
            ctx.lineTo(cx + side * 6.5 * scale, hY - 8 * scale);
            ctx.closePath();
            ctx.fill();
            // Ear fur tufts
            ctx.strokeStyle = "#c05800";
            ctx.lineWidth = 0.8 * scale;
            ctx.beginPath();
            ctx.moveTo(cx + side * 9.5 * scale, hY - 6.5 * scale);
            ctx.lineTo(cx + side * 10.5 * scale, hY - 5 * scale);
            ctx.stroke();
          }

          // Ear armor rings (gold)
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#daa520";
            ctx.beginPath();
            ctx.arc(cx + side * 10 * scale, hY - 7 * scale, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#f0d860";
            ctx.lineWidth = 0.4 * scale;
            ctx.stroke();
          }

          // === GOLD CROWN (5 pointed tines with red gems) ===
          {
            const crY = hY - 8 * scale;
            const crHW = 9 * scale;
            const crH = 6 * scale;
            const crPoints = 5;

            // Crown base band (gold gradient)
            const crBaseG = ctx.createLinearGradient(cx - crHW, crY, cx + crHW, crY);
            crBaseG.addColorStop(0, "#8a7010");
            crBaseG.addColorStop(0.2, "#c9a227");
            crBaseG.addColorStop(0.4, "#e8c840");
            crBaseG.addColorStop(0.5, "#f0d860");
            crBaseG.addColorStop(0.6, "#e8c840");
            crBaseG.addColorStop(0.8, "#c9a227");
            crBaseG.addColorStop(1, "#8a7010");
            ctx.fillStyle = crBaseG;
            ctx.beginPath();
            ctx.moveTo(cx - crHW, crY);
            ctx.lineTo(cx + crHW, crY);
            ctx.lineTo(cx + crHW, crY + 2.5 * scale);
            ctx.lineTo(cx - crHW, crY + 2.5 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#f0d860";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();

            // Crown pointed tines
            const crPtG = ctx.createLinearGradient(cx, crY - crH, cx, crY);
            crPtG.addColorStop(0, "#f8e880");
            crPtG.addColorStop(0.3, "#e8c840");
            crPtG.addColorStop(0.6, "#daa520");
            crPtG.addColorStop(1, "#c9a227");
            ctx.fillStyle = crPtG;
            ctx.beginPath();
            ctx.moveTo(cx - crHW, crY);
            for (let p = 0; p < crPoints; p++) {
              const pt = p / (crPoints - 1);
              const px = cx - crHW + pt * crHW * 2;
              const tipH = p === Math.floor(crPoints / 2) ? crH * 1.15 : crH * (0.75 + Math.abs(pt - 0.5) * 0.4);
              ctx.lineTo(px, crY - tipH);
              if (p < crPoints - 1) {
                const midX = px + (crHW * 2 / (crPoints - 1)) * 0.5;
                ctx.lineTo(midX, crY - crH * 0.2);
              }
            }
            ctx.lineTo(cx + crHW, crY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#8a7010";
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
            // Crown highlight on left edge
            ctx.strokeStyle = "rgba(255, 240, 160, 0.5)";
            ctx.lineWidth = 0.6 * scale;
            ctx.beginPath();
            ctx.moveTo(cx - crHW, crY);
            for (let p = 0; p < 3; p++) {
              const pt = p / (crPoints - 1);
              const px = cx - crHW + pt * crHW * 2;
              const tipH = p === Math.floor(crPoints / 2) ? crH * 1.15 : crH * (0.75 + Math.abs(pt - 0.5) * 0.4);
              ctx.lineTo(px, crY - tipH);
              if (p < 2) {
                const midX = px + (crHW * 2 / (crPoints - 1)) * 0.5;
                ctx.lineTo(midX, crY - crH * 0.2);
              }
            }
            ctx.stroke();

            // Red gems on each crown point
            ctx.shadowColor = "#ff2200";
            ctx.shadowBlur = 4 * scale * gemGlow;
            for (let p = 0; p < crPoints; p++) {
              const pt = p / (crPoints - 1);
              const gx = cx - crHW + pt * crHW * 2;
              const tipH = p === Math.floor(crPoints / 2) ? crH * 1.15 : crH * (0.75 + Math.abs(pt - 0.5) * 0.4);
              const gy = crY - tipH + 1.5 * scale;
              const gemR = p === Math.floor(crPoints / 2) ? 1.2 * scale : 0.9 * scale;
              const crGemG = ctx.createRadialGradient(gx - gemR * 0.3, gy - gemR * 0.3, 0, gx, gy, gemR);
              crGemG.addColorStop(0, "#ff6060");
              crGemG.addColorStop(0.4, "#ee2020");
              crGemG.addColorStop(1, "#880000");
              ctx.fillStyle = crGemG;
              ctx.beginPath();
              ctx.arc(gx, gy, gemR, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowBlur = 0;

            // Crown base band rivets
            ctx.fillStyle = "#f0d860";
            for (let br = 0; br < 7; br++) {
              const brX = cx - crHW + 1.5 * scale + (br * (crHW * 2 - 3 * scale)) / 6;
              ctx.beginPath();
              ctx.arc(brX, crY + 1.25 * scale, 0.5 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Head stripes (curved, detailed)
          ctx.strokeStyle = "#1a1008";
          ctx.lineWidth = 2 * scale;
          ctx.lineCap = "round";
          // Center stripe
          ctx.beginPath();
          ctx.moveTo(cx, hY - 10 * scale);
          ctx.lineTo(cx, hY - 3 * scale);
          ctx.stroke();
          // Side stripes (curved)
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 3 * scale, hY - 9 * scale);
            ctx.quadraticCurveTo(cx + side * 4 * scale, hY - 5 * scale, cx + side * 3 * scale, hY - 1 * scale);
            ctx.stroke();
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.moveTo(cx + side * 6 * scale, hY - 7 * scale);
            ctx.quadraticCurveTo(cx + side * 7 * scale, hY - 3 * scale, cx + side * 8 * scale, hY + 1 * scale);
            ctx.stroke();
            ctx.lineWidth = 2 * scale;
          }
          ctx.lineCap = "butt";

          // White muzzle with gradient
          const muzzleGrad = ctx.createRadialGradient(cx, hY + 3 * scale, 0, cx, hY + 3 * scale, 6 * scale);
          muzzleGrad.addColorStop(0, "#fff8f0");
          muzzleGrad.addColorStop(0.6, "#f8f0e0");
          muzzleGrad.addColorStop(1, "#e8d8c0");
          ctx.fillStyle = muzzleGrad;
          ctx.beginPath();
          ctx.ellipse(cx, hY + 3 * scale, 6.5 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Muzzle fur texture
          ctx.strokeStyle = "rgba(200, 180, 160, 0.3)";
          ctx.lineWidth = 0.4 * scale;
          for (let mi = 0; mi < 6; mi++) {
            const mx = cx + (mi - 2.5) * 2 * scale;
            ctx.beginPath();
            ctx.moveTo(mx, hY + 1 * scale);
            ctx.lineTo(mx + 0.3 * scale, hY + 4 * scale);
            ctx.stroke();
          }

          // Glowing green eyes — detailed with iris
          for (const side of [-1, 1]) {
            const ex = cx + side * 5 * scale;
            const ey = hY - 2 * scale;
            // Eye white (slight)
            ctx.fillStyle = "#e0e8a0";
            ctx.beginPath();
            ctx.ellipse(ex, ey, 3.2 * scale, 2.6 * scale, side * -0.1, 0, Math.PI * 2);
            ctx.fill();
            // Iris — radial gradient
            const irisGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 2.5 * scale);
            irisGrad.addColorStop(0, "#ccff44");
            irisGrad.addColorStop(0.4, "#88dd22");
            irisGrad.addColorStop(0.8, "#44aa00");
            irisGrad.addColorStop(1, "#226600");
            ctx.fillStyle = irisGrad;
            ctx.beginPath();
            ctx.ellipse(ex, ey, 2.5 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pupil (vertical slit)
            ctx.fillStyle = "#0a0a0a";
            ctx.beginPath();
            ctx.ellipse(ex, ey, 0.8 * scale, 2 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            // Catchlight
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(ex + side * 0.6 * scale, ey - 0.8 * scale, 0.6 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Eye glow
            ctx.shadowColor = "#66ff33";
            ctx.shadowBlur = 6 * scale;
            ctx.fillStyle = "rgba(100, 255, 50, 0.15)";
            ctx.beginPath();
            ctx.ellipse(ex, ey, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Angry brow ridges (thick, angular)
          ctx.fillStyle = "#c04800";
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 9 * scale, hY - 5.5 * scale);
            ctx.lineTo(cx + side * 2 * scale, hY - 3.5 * scale);
            ctx.lineTo(cx + side * 2.5 * scale, hY - 2.5 * scale);
            ctx.lineTo(cx + side * 9 * scale, hY - 3.5 * scale);
            ctx.closePath();
            ctx.fill();
          }

          // Nose — detailed triangular with nostrils
          ctx.fillStyle = "#2a1a0a";
          ctx.beginPath();
          ctx.moveTo(cx, hY + 2 * scale);
          ctx.bezierCurveTo(cx - 1.5 * scale, hY + 3 * scale, cx - 2.8 * scale, hY + 4.5 * scale, cx - 2 * scale, hY + 5 * scale);
          ctx.lineTo(cx + 2 * scale, hY + 5 * scale);
          ctx.bezierCurveTo(cx + 2.8 * scale, hY + 4.5 * scale, cx + 1.5 * scale, hY + 3 * scale, cx, hY + 2 * scale);
          ctx.closePath();
          ctx.fill();
          // Nose highlight
          ctx.fillStyle = "rgba(60, 40, 20, 0.5)";
          ctx.beginPath();
          ctx.ellipse(cx, hY + 3.5 * scale, 1 * scale, 0.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          // Nostrils
          ctx.fillStyle = "#1a1008";
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(cx + side * 1.2 * scale, hY + 4.8 * scale, 0.5 * scale, 0.35 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Whisker dots
          ctx.fillStyle = "#1a1008";
          for (const side of [-1, 1]) {
            for (let wi = 0; wi < 3; wi++) {
              ctx.beginPath();
              ctx.arc(cx + side * (2.5 + wi * 1) * scale, hY + 5.5 * scale + wi * 0.5 * scale, 0.35 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Whiskers
          ctx.strokeStyle = "#f8f0e0";
          ctx.lineWidth = 0.5 * scale;
          for (const side of [-1, 1]) {
            for (let wi = 0; wi < 3; wi++) {
              const wy = hY + 5 * scale + wi * 1.2 * scale;
              ctx.beginPath();
              ctx.moveTo(cx + side * 3 * scale, wy);
              ctx.lineTo(cx + side * 10 * scale, wy + (wi - 1) * 1 * scale);
              ctx.stroke();
            }
          }

          // Mouth line
          ctx.strokeStyle = "#3a1a08";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, hY + 5 * scale);
          ctx.lineTo(cx, hY + 6 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 2.5 * scale, hY + 6.5 * scale);
          ctx.quadraticCurveTo(cx, hY + 7.5 * scale, cx + 2.5 * scale, hY + 6.5 * scale);
          ctx.stroke();

          // Open mouth with fangs
          ctx.fillStyle = "#4a1a0a";
          ctx.beginPath();
          ctx.ellipse(cx, hY + 7.5 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI);
          ctx.fill();
          // Tongue
          ctx.fillStyle = "#cc5050";
          ctx.beginPath();
          ctx.ellipse(cx, hY + 8.5 * scale, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI);
          ctx.fill();
          // Fangs
          ctx.fillStyle = "#fff8f0";
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 3 * scale, hY + 6 * scale);
            ctx.lineTo(cx + side * 2 * scale, hY + 10 * scale);
            ctx.lineTo(cx + side * 1 * scale, hY + 6 * scale);
            ctx.closePath();
            ctx.fill();
          }
          // Small upper teeth
          ctx.fillStyle = "#f8f0e8";
          for (let ti = -1; ti <= 1; ti++) {
            ctx.beginPath();
            ctx.moveTo(cx + ti * 1.2 * scale, hY + 6.2 * scale);
            ctx.lineTo(cx + ti * 1.2 * scale, hY + 7.2 * scale);
            ctx.lineTo(cx + ti * 1.2 * scale + 0.5 * scale, hY + 6.5 * scale);
            ctx.closePath();
            ctx.fill();
          }
        }
        break;
      }
      case "mathey": {
        cy += 6 * scale;
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const eyeGlow = 0.7 + Math.sin(t * 3) * 0.3;
        const capeWave = animated ? Math.sin(t * 2) * 0.06 : 0;

        // Cool silver/blue backlight
        {
          const blGrad = ctx.createRadialGradient(cx, cy + 4 * scale, 0, cx, cy + 4 * scale, 42 * scale);
          blGrad.addColorStop(0, "rgba(140, 180, 220, 0.16)");
          blGrad.addColorStop(0.3, "rgba(100, 150, 210, 0.09)");
          blGrad.addColorStop(0.6, "rgba(60, 110, 180, 0.04)");
          blGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = blGrad;
          ctx.beginPath();
          ctx.arc(cx, cy + 4 * scale, 42 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cyan/teal magical aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * scale);
        auraGrad.addColorStop(0, `rgba(100, 200, 220, ${auraPulse * 0.25})`);
        auraGrad.addColorStop(0.6, `rgba(70, 150, 180, ${auraPulse * 0.12})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 24 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === FLOWING KNIGHT CAPE (behind body) ===
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);
        ctx.rotate(capeWave);
        {
          const cw = capeWave;
          // Main cape body
          const capeGrad = ctx.createLinearGradient(0, -6 * scale, 0, 30 * scale);
          capeGrad.addColorStop(0, "#2a3a70");
          capeGrad.addColorStop(0.15, "#1a2a58");
          capeGrad.addColorStop(0.35, "#3040a0");
          capeGrad.addColorStop(0.6, "#2838a0");
          capeGrad.addColorStop(0.85, "#1a2870");
          capeGrad.addColorStop(1, "#0e1840");
          ctx.fillStyle = capeGrad;
          ctx.beginPath();
          // Start at left shoulder
          ctx.moveTo(-14 * scale, -6 * scale);
          // Left side billows outward
          ctx.bezierCurveTo(
            -26 * scale + cw * 30, 0,
            -30 * scale + cw * 45, 12 * scale,
            -28 * scale + cw * 55, 22 * scale
          );
          // Left bottom scallop
          ctx.quadraticCurveTo(-22 * scale + cw * 35, 28 * scale, -14 * scale, 26 * scale);
          ctx.quadraticCurveTo(-8 * scale, 30 * scale + cw * 12, -4 * scale, 27 * scale);
          // Center bottom drape
          ctx.quadraticCurveTo(0, 32 * scale + cw * 10, 4 * scale, 27 * scale);
          ctx.quadraticCurveTo(8 * scale, 30 * scale - cw * 12, 14 * scale, 26 * scale);
          // Right bottom scallop
          ctx.quadraticCurveTo(22 * scale - cw * 35, 28 * scale, 28 * scale - cw * 55, 22 * scale);
          // Right side billows outward
          ctx.bezierCurveTo(
            30 * scale - cw * 45, 12 * scale,
            26 * scale - cw * 30, 0,
            14 * scale, -6 * scale
          );
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#0a1530";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();

          // Inner shadow panel
          ctx.fillStyle = "rgba(10, 15, 40, 0.3)";
          ctx.beginPath();
          ctx.moveTo(-6 * scale, 0);
          ctx.quadraticCurveTo(-10 * scale + cw * 15, 14 * scale, -8 * scale, 24 * scale);
          ctx.quadraticCurveTo(0, 20 * scale, 8 * scale, 24 * scale);
          ctx.quadraticCurveTo(10 * scale - cw * 15, 14 * scale, 6 * scale, 0);
          ctx.closePath();
          ctx.fill();

          // Side fold highlights
          for (const side of [-1, 1]) {
            ctx.fillStyle = "rgba(40, 60, 140, 0.15)";
            ctx.beginPath();
            ctx.moveTo(side * 10 * scale, -2 * scale);
            ctx.bezierCurveTo(
              side * 20 * scale + cw * side * 20, 6 * scale,
              side * 24 * scale + cw * side * 30, 16 * scale,
              side * 20 * scale + cw * side * 35, 22 * scale
            );
            ctx.quadraticCurveTo(side * 14 * scale, 18 * scale, side * 10 * scale, 10 * scale);
            ctx.closePath();
            ctx.fill();
          }

          // Vertical fold lines
          ctx.strokeStyle = "#1a2868";
          ctx.lineWidth = 0.7 * scale;
          for (const fx of [-8, -3, 3, 8]) {
            const fWave = animated ? Math.sin(t * 2.2 + fx * 0.4) * 0.6 * scale : 0;
            ctx.beginPath();
            ctx.moveTo(fx * scale, -2 * scale);
            ctx.quadraticCurveTo((fx + 0.5) * scale + fWave, 14 * scale, (fx + 0.3) * scale + fWave, 24 * scale);
            ctx.stroke();
          }

          // Silver trim along edges
          ctx.strokeStyle = "#a0b0d0";
          ctx.lineWidth = 1.6 * scale;
          ctx.beginPath();
          ctx.moveTo(-14 * scale, -6 * scale);
          ctx.bezierCurveTo(-26 * scale + cw * 30, 0, -30 * scale + cw * 45, 12 * scale, -28 * scale + cw * 55, 22 * scale);
          ctx.quadraticCurveTo(-22 * scale + cw * 35, 28 * scale, -14 * scale, 26 * scale);
          ctx.quadraticCurveTo(-8 * scale, 30 * scale + cw * 12, -4 * scale, 27 * scale);
          ctx.quadraticCurveTo(0, 32 * scale + cw * 10, 4 * scale, 27 * scale);
          ctx.quadraticCurveTo(8 * scale, 30 * scale - cw * 12, 14 * scale, 26 * scale);
          ctx.quadraticCurveTo(22 * scale - cw * 35, 28 * scale, 28 * scale - cw * 55, 22 * scale);
          ctx.bezierCurveTo(30 * scale - cw * 45, 12 * scale, 26 * scale - cw * 30, 0, 14 * scale, -6 * scale);
          ctx.stroke();

          // Top clasp edge
          ctx.strokeStyle = "#b0c0e0";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(-14 * scale, -6 * scale);
          ctx.lineTo(14 * scale, -6 * scale);
          ctx.stroke();

          // Shoulder clasps
          ctx.fillStyle = "#90a0c8";
          for (const sx of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(sx * 13 * scale, -5 * scale, 1.8 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#6070a0";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
          }
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
        cy += 6 * scale;
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

        // Deep purple/magenta backlight
        {
          const blGrad = ctx.createRadialGradient(cx, cy + 4 * scale, 0, cx, cy + 4 * scale, 42 * scale);
          blGrad.addColorStop(0, "rgba(180, 60, 200, 0.16)");
          blGrad.addColorStop(0.3, "rgba(140, 40, 180, 0.09)");
          blGrad.addColorStop(0.6, "rgba(100, 20, 140, 0.04)");
          blGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = blGrad;
          ctx.beginPath();
          ctx.arc(cx, cy + 4 * scale, 42 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

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
        {
          const cw = capeWave;
          const capeGrad = ctx.createLinearGradient(-28 * scale, 0, 28 * scale, 38 * scale);
          capeGrad.addColorStop(0, "#2a1050");
          capeGrad.addColorStop(0.2, "#3a1870");
          capeGrad.addColorStop(0.4, "#2a1050");
          capeGrad.addColorStop(0.6, "#3a1870");
          capeGrad.addColorStop(0.8, "#2a1050");
          capeGrad.addColorStop(1, "#1a0838");
          ctx.fillStyle = capeGrad;
          ctx.beginPath();
          ctx.moveTo(-14 * scale, -2 * scale);
          // Left side - wide billowing curve
          ctx.bezierCurveTo(
            -28 * scale + cw * 30, 2 * scale,
            -34 * scale + cw * 50, 18 * scale,
            -30 * scale + cw * 60, 34 * scale
          );
          // Left bottom curve
          ctx.quadraticCurveTo(-22 * scale + cw * 35, 40 * scale, -10 * scale, 38 * scale);
          // Center bottom drape
          ctx.quadraticCurveTo(-4 * scale, 42 * scale + cw * 15, 0, 40 * scale);
          ctx.quadraticCurveTo(4 * scale, 42 * scale - cw * 15, 10 * scale, 38 * scale);
          // Right bottom curve
          ctx.quadraticCurveTo(22 * scale - cw * 35, 40 * scale, 30 * scale - cw * 60, 34 * scale);
          // Right side - wide billowing curve
          ctx.bezierCurveTo(
            34 * scale - cw * 50, 18 * scale,
            28 * scale - cw * 30, 2 * scale,
            14 * scale, -2 * scale
          );
          ctx.closePath();
          ctx.fill();

          // Inner cape shadow panel (depth)
          ctx.fillStyle = "rgba(15, 5, 30, 0.35)";
          ctx.beginPath();
          ctx.moveTo(-6 * scale, 4 * scale);
          ctx.quadraticCurveTo(-12 * scale + cw * 20, 20 * scale, -8 * scale, 34 * scale);
          ctx.quadraticCurveTo(0, 30 * scale, 8 * scale, 34 * scale);
          ctx.quadraticCurveTo(12 * scale - cw * 20, 20 * scale, 6 * scale, 4 * scale);
          ctx.closePath();
          ctx.fill();

          // Side fold highlights
          for (const side of [-1, 1]) {
            ctx.fillStyle = "rgba(80, 30, 120, 0.2)";
            ctx.beginPath();
            ctx.moveTo(side * 10 * scale, 0);
            ctx.quadraticCurveTo(side * 22 * scale + cw * side * 25, 16 * scale, side * 18 * scale + cw * side * 30, 32 * scale);
            ctx.quadraticCurveTo(side * 14 * scale, 28 * scale, side * 10 * scale, 18 * scale);
            ctx.closePath();
            ctx.fill();
          }

          // Gold trim along entire cape edge
          ctx.strokeStyle = "#d4a030";
          ctx.shadowColor = "#e0b840";
          ctx.shadowBlur = 3 * scale;
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-14 * scale, -2 * scale);
          ctx.bezierCurveTo(
            -28 * scale + cw * 30, 2 * scale,
            -34 * scale + cw * 50, 18 * scale,
            -30 * scale + cw * 60, 34 * scale
          );
          ctx.quadraticCurveTo(-22 * scale + cw * 35, 40 * scale, -10 * scale, 38 * scale);
          ctx.quadraticCurveTo(-4 * scale, 42 * scale + cw * 15, 0, 40 * scale);
          ctx.quadraticCurveTo(4 * scale, 42 * scale - cw * 15, 10 * scale, 38 * scale);
          ctx.quadraticCurveTo(22 * scale - cw * 35, 40 * scale, 30 * scale - cw * 60, 34 * scale);
          ctx.bezierCurveTo(
            34 * scale - cw * 50, 18 * scale,
            28 * scale - cw * 30, 2 * scale,
            14 * scale, -2 * scale
          );
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
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

        // Teal/emerald backlight
        {
          const blGrad = ctx.createRadialGradient(cx, cy + 4 * scale, 0, cx, cy + 4 * scale, 48 * scale);
          blGrad.addColorStop(0, "rgba(0, 230, 200, 0.35)");
          blGrad.addColorStop(0.2, "rgba(0, 200, 180, 0.22)");
          blGrad.addColorStop(0.45, "rgba(0, 160, 150, 0.12)");
          blGrad.addColorStop(0.7, "rgba(0, 120, 120, 0.05)");
          blGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = blGrad;
          ctx.beginPath();
          ctx.arc(cx, cy + 4 * scale, 48 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cyan literary aura (layered)
        for (let layer = 0; layer < 2; layer++) {
          const auraGrad = ctx.createRadialGradient(cx, cy, layer * 5 * scale, cx, cy, (30 + layer * 5) * scale);
          auraGrad.addColorStop(0, `rgba(0, 220, 210, ${(auraPulse * 0.35) / (layer + 1)})`);
          auraGrad.addColorStop(0.4, `rgba(0, 180, 190, ${(auraPulse * 0.18) / (layer + 1)})`);
          auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, (30 + layer * 5) * scale, 0, Math.PI * 2); ctx.fill();
        }

        // === SPLIT CAPE — TWO PANELS (behind everything) ===
        {
          const capeWave = animated ? Math.sin(t * 2.5) * 0.06 : 0;
          const cw = capeWave;
          ctx.save();
          ctx.translate(cx, cy - 8 * scale + bounce);

          for (const side of [-1, 1]) {
            const sw = side * cw;
            const panelGrad = ctx.createLinearGradient(side * 2 * scale, -2 * scale, side * 30 * scale, 38 * scale);
            panelGrad.addColorStop(0, "#2a4450");
            panelGrad.addColorStop(0.25, "#345868");
            panelGrad.addColorStop(0.5, "#2a4858");
            panelGrad.addColorStop(0.75, "#304e60");
            panelGrad.addColorStop(1, "#1a3040");
            ctx.fillStyle = panelGrad;
            ctx.beginPath();
            ctx.moveTo(side * 3 * scale, -1 * scale);
            ctx.lineTo(side * 16 * scale, -2 * scale);
            ctx.bezierCurveTo(
              side * 22 * scale + sw * 6, 0,
              side * 28 * scale + sw * 12, 6 * scale,
              side * 28 * scale + sw * 14, 14 * scale
            );
            ctx.bezierCurveTo(
              side * 27 * scale + sw * 14, 20 * scale,
              side * 24 * scale + sw * 13, 26 * scale,
              side * 22 * scale + sw * 12, 28 * scale + sw * 4
            );
            ctx.bezierCurveTo(
              side * 18 * scale + sw * 8, 27 * scale,
              side * 12 * scale + sw * 4, 22 * scale,
              side * 7 * scale, 14 * scale
            );
            ctx.bezierCurveTo(
              side * 5.5 * scale, 8 * scale,
              side * 4 * scale, 3 * scale,
              side * 3 * scale, -1 * scale
            );
            ctx.closePath();
            ctx.fill();

            // Inner fold shadow
            ctx.fillStyle = "rgba(0, 30, 40, 0.3)";
            ctx.beginPath();
            ctx.moveTo(side * 6 * scale, 4 * scale);
            ctx.quadraticCurveTo(side * 6.2 * scale, 9 * scale, side * 6.5 * scale, 14 * scale);
            ctx.lineTo(side * 8 * scale, 14 * scale);
            ctx.quadraticCurveTo(side * 7.8 * scale, 9 * scale, side * 7.5 * scale, 4 * scale);
            ctx.closePath();
            ctx.fill();

            // Outer fold highlight
            ctx.fillStyle = "rgba(0, 80, 90, 0.1)";
            ctx.beginPath();
            ctx.moveTo(side * 15 * scale, 0);
            ctx.bezierCurveTo(
              side * 20 * scale + sw * 6, 4 * scale,
              side * 25 * scale + sw * 10, 8 * scale,
              side * 25 * scale + sw * 10, 10 * scale
            );
            ctx.bezierCurveTo(
              side * 25 * scale + sw * 11, 14 * scale,
              side * 24 * scale + sw * 12, 18 * scale,
              side * 23 * scale + sw * 12, 20 * scale
            );
            ctx.quadraticCurveTo(side * 18 * scale, 14 * scale, side * 15 * scale, 8 * scale);
            ctx.closePath();
            ctx.fill();

            // Vertical fold crease
            ctx.strokeStyle = "rgba(0, 50, 60, 0.25)";
            ctx.lineWidth = 0.5 * scale;
            ctx.beginPath();
            ctx.moveTo(side * 15 * scale, 2 * scale);
            ctx.quadraticCurveTo(side * 18 * scale + sw * 8, 10 * scale, side * 20 * scale + sw * 10, 14 * scale);
            ctx.quadraticCurveTo(side * 20 * scale + sw * 11, 19 * scale, side * 20 * scale + sw * 12, 24 * scale);
            ctx.stroke();

            // Cyan shimmer along outer edge
            ctx.strokeStyle = "#00d0c8";
            ctx.shadowColor = "#00e0d8";
            ctx.shadowBlur = 4 * scale;
            ctx.lineWidth = 1.2 * scale;
            ctx.beginPath();
            ctx.moveTo(side * 16 * scale, -2 * scale);
            ctx.bezierCurveTo(
              side * 22 * scale + sw * 6, 0,
              side * 28 * scale + sw * 12, 6 * scale,
              side * 28 * scale + sw * 14, 14 * scale
            );
            ctx.bezierCurveTo(
              side * 27 * scale + sw * 14, 20 * scale,
              side * 24 * scale + sw * 13, 26 * scale,
              side * 22 * scale + sw * 12, 28 * scale + sw * 4
            );
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Cape clasp at shoulder
            ctx.fillStyle = "#40d0d0";
            ctx.shadowColor = "#00e0e0";
            ctx.shadowBlur = 3 * scale;
            ctx.beginPath();
            ctx.arc(side * 14 * scale, -0.5 * scale, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#208080";
            ctx.lineWidth = 0.6 * scale;
            ctx.stroke();
          }
          ctx.restore();
        }

        // === CYAN WORDS ORBITING HEAD ===
        {
          const headY = cy - 18 * scale + bounce;
          const words = ["GATSBY", "dream", "green", "light", "old sport", "jazz", "hope", "bay"];
          const wordCount = 8;
          for (let i = 0; i < wordCount; i++) {
            const angle = (i * Math.PI * 2 / wordCount) + (animated ? t * 0.6 : 0);
            const orbitRx = 18 * scale;
            const orbitRy = 9 * scale;
            const bobY = animated ? Math.sin(t * 2 + i * 1.2) * 2 * scale : 0;
            const wordX = cx + Math.cos(angle) * orbitRx;
            const wordY = headY + Math.sin(angle) * orbitRy + bobY - 4 * scale;
            const depth = 0.6 + Math.sin(angle) * 0.4;
            const fontSize = (4 + depth * 3) * scale;
            ctx.font = `italic bold ${fontSize}px Georgia`;
            ctx.textAlign = "center";
            ctx.fillStyle = `rgba(0, 230, 220, ${0.5 + depth * 0.4})`;
            ctx.shadowColor = "#00ffe0";
            ctx.shadowBlur = 6 * scale * depth;
            ctx.fillText(words[i], wordX, wordY);
          }
          ctx.shadowBlur = 0;
        }

        // === WIDE TRENCH COAT ===
        {
          const bY = bounce;
          // Main coat body
          const coatGrad = ctx.createLinearGradient(cx - 22 * scale, cy - 10 * scale, cx + 22 * scale, cy + 18 * scale);
          coatGrad.addColorStop(0, "#283a42");
          coatGrad.addColorStop(0.15, "#345060");
          coatGrad.addColorStop(0.4, "#3e5e68");
          coatGrad.addColorStop(0.6, "#345060");
          coatGrad.addColorStop(0.85, "#2c4450");
          coatGrad.addColorStop(1, "#203840");
          ctx.fillStyle = coatGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 20 * scale, cy + 14 * scale + bY);
          ctx.lineTo(cx - 21 * scale, cy + 4 * scale + bY);
          ctx.lineTo(cx - 20 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx - 12 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx, cy - 14 * scale + bY);
          ctx.lineTo(cx + 12 * scale, cy - 12 * scale + bY);
          ctx.lineTo(cx + 20 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 21 * scale, cy + 4 * scale + bY);
          ctx.lineTo(cx + 20 * scale, cy + 14 * scale + bY);
          ctx.quadraticCurveTo(cx, cy + 10 * scale + bY, cx - 20 * scale, cy + 14 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#1a2830";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();

          // Coat front opening seam (center line)
          ctx.strokeStyle = "#1e3038";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 12 * scale + bY);
          ctx.lineTo(cx, cy + 12 * scale + bY);
          ctx.stroke();

          // Coat side seams
          ctx.strokeStyle = "#1e3038";
          ctx.lineWidth = 0.5 * scale;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 12 * scale, cy - 12 * scale + bY);
            ctx.lineTo(cx + side * 15 * scale, cy + 14 * scale + bY);
            ctx.stroke();
          }

          // Cloth armored skirt (hanging tabard strips)
          {
            const clothPositions = [-18, -13, -8, -3, 3, 8, 13, 18];
            const capeWv = animated ? Math.sin(t * 2.5) * 0.4 : 0;
            for (let ci = 0; ci < clothPositions.length; ci++) {
              const cp = clothPositions[ci];
              const csx = cx + cp * scale;
              const dist = Math.abs(cp);
              const vDrop = (14 - dist) * 0.3 * scale;
              const sway = animated ? Math.sin(t * 2 + ci * 0.9) * 0.6 * scale : 0;
              const tabY = cy + 14 * scale + bY + vDrop;
              const tabW = 4 * scale;
              const tabH = 8 * scale + vDrop * 0.4;

              const clothGrad = ctx.createLinearGradient(csx, tabY, csx, tabY + tabH);
              clothGrad.addColorStop(0, "#2c4450");
              clothGrad.addColorStop(0.35, "#345868");
              clothGrad.addColorStop(0.7, "#284050");
              clothGrad.addColorStop(1, "#1e3440");
              ctx.fillStyle = clothGrad;
              ctx.beginPath();
              ctx.moveTo(csx - tabW / 2, tabY);
              ctx.lineTo(csx + tabW / 2, tabY);
              ctx.quadraticCurveTo(
                csx + tabW / 2 - 0.3 * scale + sway, tabY + tabH * 0.6,
                csx + tabW / 2 - 0.8 * scale + sway, tabY + tabH
              );
              ctx.quadraticCurveTo(
                csx + sway * 0.5, tabY + tabH + 1.5 * scale + capeWv * scale,
                csx - tabW / 2 + 0.8 * scale + sway, tabY + tabH
              );
              ctx.quadraticCurveTo(
                csx - tabW / 2 + 0.3 * scale + sway, tabY + tabH * 0.6,
                csx - tabW / 2, tabY
              );
              ctx.closePath();
              ctx.fill();

              // Cloth fold highlight
              ctx.fillStyle = "rgba(80, 140, 160, 0.12)";
              ctx.beginPath();
              ctx.moveTo(csx - 0.5 * scale, tabY + 1 * scale);
              ctx.quadraticCurveTo(csx + sway * 0.3, tabY + tabH * 0.5, csx + 0.3 * scale + sway, tabY + tabH - 1 * scale);
              ctx.lineTo(csx - 0.3 * scale + sway, tabY + tabH - 1 * scale);
              ctx.quadraticCurveTo(csx + sway * 0.3, tabY + tabH * 0.5, csx + 0.5 * scale, tabY + 1 * scale);
              ctx.closePath();
              ctx.fill();

              // Stitching along top edge
              ctx.strokeStyle = "#00c8c0";
              ctx.lineWidth = 0.4 * scale;
              ctx.beginPath();
              ctx.moveTo(csx - tabW / 2 + 0.5 * scale, tabY + 0.5 * scale);
              ctx.lineTo(csx + tabW / 2 - 0.5 * scale, tabY + 0.5 * scale);
              ctx.stroke();

              // Bottom fringe accent
              ctx.strokeStyle = "#00a8a0";
              ctx.lineWidth = 0.6 * scale;
              ctx.beginPath();
              ctx.moveTo(csx - tabW / 2 + 1 * scale + sway, tabY + tabH - 0.3 * scale);
              ctx.quadraticCurveTo(csx + sway * 0.5, tabY + tabH + 0.8 * scale + capeWv * 0.5 * scale, csx + tabW / 2 - 1 * scale + sway, tabY + tabH - 0.3 * scale);
              ctx.stroke();

              // Small decorative stud at top center
              ctx.fillStyle = "#00d0c8";
              ctx.shadowColor = "#00e0d8";
              ctx.shadowBlur = 2 * scale;
              ctx.beginPath();
              ctx.arc(csx, tabY + 1.8 * scale, 0.5 * scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }

          // Cyan trim along coat edges
          ctx.strokeStyle = "#00e0d8";
          ctx.shadowColor = "#00ffe8";
          ctx.shadowBlur = 6 * scale;
          ctx.lineWidth = 1.4 * scale;
          // Left edge
          ctx.beginPath();
          ctx.moveTo(cx - 20 * scale, cy + 14 * scale + bY);
          ctx.lineTo(cx - 21 * scale, cy + 4 * scale + bY);
          ctx.lineTo(cx - 20 * scale, cy - 4 * scale + bY);
          ctx.stroke();
          // Right edge
          ctx.beginPath();
          ctx.moveTo(cx + 20 * scale, cy + 14 * scale + bY);
          ctx.lineTo(cx + 21 * scale, cy + 4 * scale + bY);
          ctx.lineTo(cx + 20 * scale, cy - 4 * scale + bY);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Lapel flaps (over the coat body)
          for (const side of [-1, 1]) {
            const lapelGrad = ctx.createLinearGradient(cx + side * 3 * scale, cy - 8 * scale, cx + side * 18 * scale, cy + 8 * scale);
            lapelGrad.addColorStop(0, "#385868");
            lapelGrad.addColorStop(0.5, "#2c4858");
            lapelGrad.addColorStop(1, "#203a48");
            ctx.fillStyle = lapelGrad;
            ctx.beginPath();
            ctx.moveTo(cx + side * 4 * scale, cy - 6 * scale + bY);
            ctx.lineTo(cx + side * 18 * scale, cy - 4 * scale + bY);
            ctx.quadraticCurveTo(cx + side * 19 * scale, cy + 2 * scale + bY, cx + side * 17 * scale, cy + 8 * scale + bY);
            ctx.lineTo(cx + side * 4 * scale, cy + 6 * scale + bY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 200, 200, 0.2)";
            ctx.lineWidth = 0.6 * scale;
            ctx.beginPath();
            ctx.moveTo(cx + side * 4 * scale, cy - 6 * scale + bY);
            ctx.lineTo(cx + side * 4 * scale, cy + 6 * scale + bY);
            ctx.stroke();
          }

          // White shirt peek
          ctx.fillStyle = "#e8e8e8";
          ctx.beginPath();
          ctx.moveTo(cx - 3.5 * scale, cy - 14 * scale + bY);
          ctx.lineTo(cx - 4 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 4 * scale, cy - 4 * scale + bY);
          ctx.lineTo(cx + 3.5 * scale, cy - 14 * scale + bY);
          ctx.closePath();
          ctx.fill();
          // Ruffle details
          ctx.strokeStyle = "#d0d0d0";
          ctx.lineWidth = 0.7 * scale;
          for (let i = 0; i < 3; i++) {
            const rY = cy - 11 * scale + i * 2.5 * scale + bY;
            ctx.beginPath();
            ctx.moveTo(cx - 3 * scale, rY);
            ctx.quadraticCurveTo(cx, rY + 1.5 * scale, cx + 3 * scale, rY);
            ctx.stroke();
          }

          // Cyan tie
          const tieGrad = ctx.createLinearGradient(cx, cy - 10 * scale, cx, cy + 6 * scale);
          tieGrad.addColorStop(0, "#00b8b0");
          tieGrad.addColorStop(0.5, "#008888");
          tieGrad.addColorStop(1, "#006060");
          ctx.fillStyle = tieGrad;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 10 * scale + bY);
          ctx.lineTo(cx - 2.5 * scale, cy + 1 * scale + bY);
          ctx.lineTo(cx, cy + 6 * scale + bY);
          ctx.lineTo(cx + 2.5 * scale, cy + 1 * scale + bY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#006860";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();

          // Belt / sash
          const beltGrad = ctx.createLinearGradient(cx - 18 * scale, cy + 6 * scale + bY, cx + 18 * scale, cy + 6 * scale + bY);
          beltGrad.addColorStop(0, "#283e48");
          beltGrad.addColorStop(0.5, "#345060");
          beltGrad.addColorStop(1, "#283e48");
          ctx.fillStyle = beltGrad;
          ctx.fillRect(cx - 18 * scale, cy + 6 * scale + bY, 36 * scale, 3 * scale);
          ctx.strokeStyle = "#0a1a20";
          ctx.lineWidth = 0.5 * scale;
          ctx.strokeRect(cx - 18 * scale, cy + 6 * scale + bY, 36 * scale, 3 * scale);
          // Cyan gem buckle
          ctx.fillStyle = "#00d0c8";
          ctx.shadowColor = "#00ffe0";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.roundRect(cx - 2.5 * scale, cy + 5.5 * scale + bY, 5 * scale, 4 * scale, 1 * scale);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Double-breasted buttons
          for (let row = 0; row < 3; row++) {
            for (const side of [-1, 1]) {
              ctx.fillStyle = "#40c8c0";
              ctx.shadowColor = "#00e0d8";
              ctx.shadowBlur = 2 * scale;
              ctx.beginPath();
              ctx.arc(cx + side * 5 * scale, cy - 2 * scale + row * 4 * scale + bY, 1 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.shadowBlur = 0;

          // Subtle text embroidery on coat
          ctx.fillStyle = "rgba(0, 220, 210, 0.25)";
          ctx.font = `italic ${4 * scale}px Georgia`;
          ctx.textAlign = "center";
          ctx.fillText("So we beat on...", cx, cy + 2 * scale + bY);
        }

        // === ARMS + BOOK IN BENT-ELBOW WRITING POSE ===
        {
          const holdingMotion = animated ? Math.sin(t * 1.5) * 0.03 : 0;
          const bookX = cx - 2 * scale;
          const bookY = cy + 2 * scale + bounce;

          // Shared arm coordinates
          const lShoulderX = cx - 14 * scale;
          const lShoulderY = cy - 8 * scale + bounce;
          const lElbowX = cx - 20 * scale;
          const lElbowY = cy + 6 * scale + bounce;
          const lWristX = cx - 8 * scale;
          const lWristY = cy + 6 * scale + bounce + holdingMotion * 5 * scale;
          const rShoulderX = cx + 14 * scale;
          const rShoulderY = cy - 8 * scale + bounce;
          const rElbowX = cx + 20 * scale;
          const rElbowY = cy + 4 * scale + bounce;
          const rWristX = cx + 6 * scale + holdingMotion * 3 * scale;
          const rWristY = cy + 4 * scale + bounce + penStroke * 4 * scale;

          // --- LAYER 1: Arm tubes (both arms) ---

          // Left upper arm
          const luGrad = ctx.createLinearGradient(lShoulderX, lShoulderY, lElbowX, lElbowY);
          luGrad.addColorStop(0, "#446070");
          luGrad.addColorStop(0.5, "#385868");
          luGrad.addColorStop(1, "#304e5c");
          ctx.fillStyle = luGrad;
          ctx.beginPath();
          ctx.moveTo(lShoulderX - 4 * scale, lShoulderY);
          ctx.quadraticCurveTo(
            (lShoulderX + lElbowX) / 2 - 5 * scale, (lShoulderY + lElbowY) / 2,
            lElbowX - 4 * scale, lElbowY
          );
          ctx.quadraticCurveTo(lElbowX, lElbowY + 3 * scale, lElbowX + 4 * scale, lElbowY);
          ctx.quadraticCurveTo(
            (lShoulderX + lElbowX) / 2 + 5 * scale, (lShoulderY + lElbowY) / 2,
            lShoulderX + 4 * scale, lShoulderY
          );
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#142028";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Left forearm
          const lfGrad = ctx.createLinearGradient(lElbowX, lElbowY, lWristX, lWristY);
          lfGrad.addColorStop(0, "#385868");
          lfGrad.addColorStop(0.5, "#325060");
          lfGrad.addColorStop(1, "#284450");
          ctx.fillStyle = lfGrad;
          ctx.beginPath();
          ctx.moveTo(lElbowX - 3.5 * scale, lElbowY);
          ctx.quadraticCurveTo(
            (lElbowX + lWristX) / 2 - 3 * scale, (lElbowY + lWristY) / 2 + 2 * scale,
            lWristX - 3 * scale, lWristY
          );
          ctx.quadraticCurveTo(lWristX, lWristY + 2 * scale, lWristX + 3 * scale, lWristY);
          ctx.quadraticCurveTo(
            (lElbowX + lWristX) / 2 + 3 * scale, (lElbowY + lWristY) / 2 - 2 * scale,
            lElbowX + 3.5 * scale, lElbowY
          );
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#142028";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Right upper arm
          const ruGrad = ctx.createLinearGradient(rShoulderX, rShoulderY, rElbowX, rElbowY);
          ruGrad.addColorStop(0, "#446070");
          ruGrad.addColorStop(0.5, "#385868");
          ruGrad.addColorStop(1, "#304e5c");
          ctx.fillStyle = ruGrad;
          ctx.beginPath();
          ctx.moveTo(rShoulderX - 4 * scale, rShoulderY);
          ctx.quadraticCurveTo(
            (rShoulderX + rElbowX) / 2 - 4 * scale, (rShoulderY + rElbowY) / 2,
            rElbowX - 3.5 * scale, rElbowY
          );
          ctx.quadraticCurveTo(rElbowX, rElbowY + 3 * scale, rElbowX + 3.5 * scale, rElbowY);
          ctx.quadraticCurveTo(
            (rShoulderX + rElbowX) / 2 + 4 * scale, (rShoulderY + rElbowY) / 2,
            rShoulderX + 4 * scale, rShoulderY
          );
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#142028";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Right forearm
          const rfGrad = ctx.createLinearGradient(rElbowX, rElbowY, rWristX, rWristY);
          rfGrad.addColorStop(0, "#385868");
          rfGrad.addColorStop(0.5, "#325060");
          rfGrad.addColorStop(1, "#284450");
          ctx.fillStyle = rfGrad;
          ctx.beginPath();
          ctx.moveTo(rElbowX + 3.5 * scale, rElbowY);
          ctx.quadraticCurveTo(
            (rElbowX + rWristX) / 2 + 3 * scale, (rElbowY + rWristY) / 2 - 2 * scale,
            rWristX + 3 * scale, rWristY
          );
          ctx.quadraticCurveTo(rWristX, rWristY + 2 * scale, rWristX - 3 * scale, rWristY);
          ctx.quadraticCurveTo(
            (rElbowX + rWristX) / 2 - 3 * scale, (rElbowY + rWristY) / 2 + 2 * scale,
            rElbowX - 3.5 * scale, rElbowY
          );
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#142028";
          ctx.lineWidth = 0.6 * scale;
          ctx.stroke();

          // Forearm wrinkles (both)
          ctx.strokeStyle = "rgba(20, 32, 40, 0.4)";
          ctx.lineWidth = 0.35 * scale;
          for (let wi = 1; wi <= 3; wi++) {
            const wt = wi / 4;
            const lwx = lElbowX + (lWristX - lElbowX) * wt;
            const lwy = lElbowY + (lWristY - lElbowY) * wt;
            ctx.beginPath();
            ctx.moveTo(lwx - 2.5 * scale, lwy - 1 * scale);
            ctx.quadraticCurveTo(lwx, lwy + 1 * scale, lwx + 2.5 * scale, lwy - 1 * scale);
            ctx.stroke();
            const rwx = rElbowX + (rWristX - rElbowX) * wt;
            const rwy = rElbowY + (rWristY - rElbowY) * wt;
            ctx.beginPath();
            ctx.moveTo(rwx - 2.5 * scale, rwy - 1 * scale);
            ctx.quadraticCurveTo(rwx, rwy + 1 * scale, rwx + 2.5 * scale, rwy - 1 * scale);
            ctx.stroke();
          }

          // --- LAYER 2: Elbow joints (on top of tubes) ---

          // Left elbow wrinkle arcs + joint
          ctx.strokeStyle = "rgba(20, 32, 40, 0.45)";
          ctx.lineWidth = 0.4 * scale;
          for (let ei = -1; ei <= 1; ei++) {
            ctx.beginPath();
            ctx.arc(lElbowX, lElbowY + ei * 1.5 * scale, 3.5 * scale, -0.4, 0.4);
            ctx.stroke();
          }
          ctx.fillStyle = "#3a5862";
          ctx.beginPath();
          ctx.ellipse(lElbowX, lElbowY, 4.5 * scale, 3.5 * scale, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1a2a30";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Right elbow wrinkle arcs + joint
          ctx.strokeStyle = "rgba(20, 32, 40, 0.45)";
          ctx.lineWidth = 0.4 * scale;
          for (let ei = -1; ei <= 1; ei++) {
            ctx.beginPath();
            ctx.arc(rElbowX, rElbowY + ei * 1.5 * scale, 3.5 * scale, Math.PI - 0.4, Math.PI + 0.4);
            ctx.stroke();
          }
          ctx.fillStyle = "#3a5862";
          ctx.beginPath();
          ctx.ellipse(rElbowX, rElbowY, 4.5 * scale, 3.5 * scale, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1a2a30";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // --- LAYER 3: Shoulder caps (on top of arm tubes) ---
          for (const side of [-1, 1]) {
            const sx = side === -1 ? lShoulderX : rShoulderX;
            const sy = side === -1 ? lShoulderY : rShoulderY;
            const capGrad = ctx.createRadialGradient(sx, sy - 1 * scale, 0, sx, sy, 7 * scale);
            capGrad.addColorStop(0, "#506c78");
            capGrad.addColorStop(0.4, "#446070");
            capGrad.addColorStop(1, "#345060");
            ctx.fillStyle = capGrad;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1a2a30";
            ctx.lineWidth = 0.6 * scale;
            ctx.stroke();
            // Highlight arc
            ctx.strokeStyle = "rgba(0, 200, 200, 0.15)";
            ctx.lineWidth = 0.8 * scale;
            ctx.beginPath();
            ctx.arc(sx, sy, 4 * scale, -Math.PI * 0.8, -Math.PI * 0.2);
            ctx.stroke();
            // Cyan stud
            ctx.fillStyle = "#40c0b8";
            ctx.beginPath();
            ctx.arc(sx, sy - 0.5 * scale, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // --- LAYER 4: Book ---
          ctx.save();
          ctx.translate(bookX, bookY);
          ctx.rotate(-0.03 + holdingMotion * 0.2);
          {
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            ctx.ellipse(0, 12 * scale, 10 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            const bookGrad = ctx.createLinearGradient(-9 * scale, -1 * scale, 9 * scale, 12 * scale);
            bookGrad.addColorStop(0, "#0e2238");
            bookGrad.addColorStop(0.5, "#122840");
            bookGrad.addColorStop(1, "#0a1c30");
            ctx.fillStyle = bookGrad;
            ctx.beginPath();
            ctx.roundRect(-9 * scale, -1 * scale, 18 * scale, 12 * scale, 1.5 * scale);
            ctx.fill();
            ctx.strokeStyle = "#061828";
            ctx.lineWidth = 0.6 * scale;
            ctx.stroke();
            const leftPG = ctx.createLinearGradient(-8 * scale, 0, 0, 10 * scale);
            leftPG.addColorStop(0, "#faf2e4");
            leftPG.addColorStop(0.5, "#f4ead6");
            leftPG.addColorStop(1, "#ece0cc");
            ctx.fillStyle = leftPG;
            ctx.beginPath();
            ctx.roundRect(-8 * scale, 0, 8 * scale, 10 * scale, [1 * scale, 0, 0, 1 * scale]);
            ctx.fill();
            const rightPG = ctx.createLinearGradient(0, 0, 8 * scale, 10 * scale);
            rightPG.addColorStop(0, "#f7efdc");
            rightPG.addColorStop(0.5, "#f2e8d4");
            rightPG.addColorStop(1, "#ede2ce");
            ctx.fillStyle = rightPG;
            ctx.beginPath();
            ctx.roundRect(0, 0, 8 * scale, 10 * scale, [0, 1 * scale, 1 * scale, 0]);
            ctx.fill();
            ctx.strokeStyle = "#b0a080";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(0, -0.5 * scale);
            ctx.lineTo(0, 10.5 * scale);
            ctx.stroke();
            ctx.fillStyle = "rgba(160, 140, 110, 0.18)";
            ctx.fillRect(-1.2 * scale, 0, 2.4 * scale, 10 * scale);
            ctx.strokeStyle = "#3a5070";
            ctx.lineWidth = 0.4 * scale;
            for (let ln = 0; ln < 5; ln++) {
              const lineY = 1.5 * scale + ln * 1.8 * scale;
              const lineW = 5.5 - (ln % 2) * 0.8;
              ctx.beginPath();
              ctx.moveTo(-7 * scale, lineY);
              ctx.lineTo((-7 + lineW) * scale, lineY);
              ctx.stroke();
            }
            if (animated) {
              const writePhase = (t * 0.8) % 4;
              const linesWritten = Math.floor(writePhase);
              ctx.strokeStyle = "rgba(0, 120, 140, 0.6)";
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
            ctx.strokeStyle = "#c0a030";
            ctx.lineWidth = 0.6 * scale;
            ctx.beginPath();
            ctx.roundRect(-9 * scale, -1 * scale, 18 * scale, 12 * scale, 1.5 * scale);
            ctx.stroke();
            for (const corner of [[-8, -0.5], [7, -0.5], [-8, 9.5], [7, 9.5]]) {
              ctx.fillStyle = "#c0a030";
              ctx.beginPath();
              ctx.arc(corner[0] * scale, corner[1] * scale, 0.6 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "#c0a030";
            ctx.font = `bold ${2 * scale}px Georgia`;
            ctx.textAlign = "center";
            ctx.fillText("GATSBY", 0, 12.5 * scale);
          }
          ctx.restore();

          // --- LAYER 5: Cuffs + hands (on top of everything) ---

          // Left cuff + hand
          ctx.fillStyle = "#506c78";
          ctx.beginPath();
          ctx.ellipse(lWristX, lWristY, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0, 200, 200, 0.3)";
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();
          ctx.fillStyle = "#40c0b8";
          ctx.beginPath();
          ctx.arc(lWristX + 2.5 * scale, lWristY, 0.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffe8c8";
          ctx.beginPath();
          ctx.ellipse(lWristX + 2 * scale, lWristY + 2 * scale, 3.5 * scale, 2 * scale, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#dbb890";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          for (let fi = 0; fi < 4; fi++) {
            ctx.fillStyle = fi % 2 === 0 ? "#f8d8b4" : "#f0d0ac";
            ctx.beginPath();
            ctx.ellipse(lWristX + fi * 1.5 * scale, lWristY + 3.5 * scale, 0.8 * scale, 1.2 * scale, 0.1 * fi, 0, Math.PI);
            ctx.fill();
          }
          ctx.fillStyle = "#f8d8b4";
          ctx.beginPath();
          ctx.ellipse(lWristX - 1.5 * scale, lWristY + 1 * scale, 1 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Right cuff + hand
          ctx.fillStyle = "#506c78";
          ctx.beginPath();
          ctx.ellipse(rWristX, rWristY, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0, 200, 200, 0.3)";
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();
          ctx.fillStyle = "#40c0b8";
          ctx.beginPath();
          ctx.arc(rWristX - 2.5 * scale, rWristY, 0.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffe8c8";
          ctx.beginPath();
          ctx.ellipse(rWristX - 1 * scale, rWristY + 2 * scale, 3.5 * scale, 2 * scale, -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#dbb890";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          for (let fi = 0; fi < 2; fi++) {
            ctx.fillStyle = fi === 0 ? "#f8d8b4" : "#f4d4b0";
            ctx.beginPath();
            ctx.ellipse(rWristX - 2 * scale + fi * 1.5 * scale, rWristY + 3.5 * scale, 0.7 * scale, 1.5 * scale, -0.2, 0, Math.PI);
            ctx.fill();
          }
          for (let fi = 0; fi < 2; fi++) {
            ctx.fillStyle = fi === 0 ? "#f4d4b0" : "#f0d0ac";
            ctx.beginPath();
            ctx.ellipse(rWristX + 1 * scale + fi * 1.2 * scale, rWristY + 3 * scale, 0.7 * scale, 1 * scale, 0.1, 0, Math.PI);
            ctx.fill();
          }
          ctx.fillStyle = "#f8d8b4";
          ctx.beginPath();
          ctx.ellipse(rWristX - 3.5 * scale, rWristY + 1 * scale, 1 * scale, 2 * scale, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Fountain pen (on top of right hand)
          ctx.save();
          ctx.translate(rWristX - 1 * scale, rWristY + 2 * scale);
          ctx.rotate(-0.6 + penStroke);
          const penGrad = ctx.createLinearGradient(-1.2 * scale, -8 * scale, 1.2 * scale, 8 * scale);
          penGrad.addColorStop(0, "#1a1a2e");
          penGrad.addColorStop(0.3, "#141428");
          penGrad.addColorStop(0.7, "#101028");
          penGrad.addColorStop(1, "#1a1a2e");
          ctx.fillStyle = penGrad;
          ctx.beginPath();
          ctx.moveTo(-1.3 * scale, -8 * scale);
          ctx.quadraticCurveTo(-1.5 * scale, 0, -1 * scale, 8 * scale);
          ctx.lineTo(1 * scale, 8 * scale);
          ctx.quadraticCurveTo(1.5 * scale, 0, 1.3 * scale, -8 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#0a0a1a";
          ctx.lineWidth = 0.3 * scale;
          ctx.stroke();
          ctx.fillStyle = "#c8a830";
          ctx.fillRect(-1.6 * scale, -7.5 * scale, 3.2 * scale, 1.5 * scale);
          ctx.fillStyle = "#c0a030";
          ctx.fillRect(-1.4 * scale, -2 * scale, 2.8 * scale, 0.8 * scale);
          ctx.fillStyle = "#c0a030";
          ctx.fillRect(-1.2 * scale, 3 * scale, 2.4 * scale, 0.6 * scale);
          ctx.strokeStyle = "#c0a030";
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.moveTo(1.3 * scale, -6 * scale);
          ctx.lineTo(1.3 * scale, -1 * scale);
          ctx.lineTo(0.8 * scale, 0);
          ctx.stroke();
          const nibGrad = ctx.createLinearGradient(-0.8 * scale, 8 * scale, 0.8 * scale, 14 * scale);
          nibGrad.addColorStop(0, "#d4b030");
          nibGrad.addColorStop(0.5, "#c0a020");
          nibGrad.addColorStop(1, "#a08818");
          ctx.fillStyle = nibGrad;
          ctx.beginPath();
          ctx.moveTo(-0.9 * scale, 8 * scale);
          ctx.lineTo(0, 14 * scale);
          ctx.lineTo(0.9 * scale, 8 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#806010";
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 9 * scale);
          ctx.lineTo(0, 13.5 * scale);
          ctx.stroke();
          ctx.fillStyle = "#806010";
          ctx.beginPath();
          ctx.arc(0, 9.5 * scale, 0.25 * scale, 0, Math.PI * 2);
          ctx.fill();
          const inkPulse = 0.5 + (animated ? Math.sin(t * 3) * 0.25 : 0);
          ctx.fillStyle = `rgba(0, 180, 210, ${inkPulse})`;
          ctx.shadowColor = "#00c8e0";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(0, 14 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // === SIDE HELMET (behind head) ===
        {
          const hY = cy - 18 * scale + bounce;

          for (const side of [-1, 1]) {
            // Cheek guard plate — large, covering temple to jaw
            const guardGrad = ctx.createLinearGradient(
              cx + side * 8 * scale, hY - 8 * scale,
              cx + side * 16 * scale, hY + 10 * scale
            );
            guardGrad.addColorStop(0, "#466878");
            guardGrad.addColorStop(0.3, "#3a5868");
            guardGrad.addColorStop(0.7, "#304e5c");
            guardGrad.addColorStop(1, "#284450");
            ctx.fillStyle = guardGrad;
            ctx.beginPath();
            ctx.moveTo(cx + side * 9 * scale, hY - 10 * scale);
            ctx.bezierCurveTo(
              cx + side * 14 * scale, hY - 9 * scale,
              cx + side * 16 * scale, hY - 4 * scale,
              cx + side * 15 * scale, hY + 2 * scale
            );
            ctx.bezierCurveTo(
              cx + side * 14.5 * scale, hY + 7 * scale,
              cx + side * 13 * scale, hY + 10 * scale,
              cx + side * 10 * scale, hY + 12 * scale
            );
            ctx.quadraticCurveTo(
              cx + side * 9 * scale, hY + 10 * scale,
              cx + side * 9 * scale, hY + 6 * scale
            );
            ctx.bezierCurveTo(
              cx + side * 10 * scale, hY + 2 * scale,
              cx + side * 10 * scale, hY - 4 * scale,
              cx + side * 9 * scale, hY - 10 * scale
            );
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#1a2228";
            ctx.lineWidth = 0.7 * scale;
            ctx.stroke();

            // Outer edge trim (cyan glow)
            ctx.strokeStyle = "#00c8c0";
            ctx.shadowColor = "#00e0d8";
            ctx.shadowBlur = 3 * scale;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(cx + side * 9 * scale, hY - 10 * scale);
            ctx.bezierCurveTo(
              cx + side * 14 * scale, hY - 9 * scale,
              cx + side * 16 * scale, hY - 4 * scale,
              cx + side * 15 * scale, hY + 2 * scale
            );
            ctx.bezierCurveTo(
              cx + side * 14.5 * scale, hY + 7 * scale,
              cx + side * 13 * scale, hY + 10 * scale,
              cx + side * 10 * scale, hY + 12 * scale
            );
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Inner highlight stripe
            ctx.fillStyle = "rgba(0, 160, 160, 0.08)";
            ctx.beginPath();
            ctx.moveTo(cx + side * 10 * scale, hY - 7 * scale);
            ctx.bezierCurveTo(
              cx + side * 13 * scale, hY - 5 * scale,
              cx + side * 14 * scale, hY,
              cx + side * 13 * scale, hY + 5 * scale
            );
            ctx.lineTo(cx + side * 12 * scale, hY + 4 * scale);
            ctx.bezierCurveTo(
              cx + side * 12.5 * scale, hY - 1 * scale,
              cx + side * 12 * scale, hY - 4 * scale,
              cx + side * 10.5 * scale, hY - 6 * scale
            );
            ctx.closePath();
            ctx.fill();

            // Rivets along the cheek guard
            ctx.fillStyle = "#00c8c0";
            for (const ry of [-5, 0, 5, 9]) {
              ctx.beginPath();
              ctx.arc(cx + side * 13 * scale, hY + ry * scale, 0.6 * scale, 0, Math.PI * 2);
              ctx.fill();
            }

            // Ear cutout detail
            ctx.fillStyle = "#1a2830";
            ctx.beginPath();
            ctx.ellipse(cx + side * 11 * scale, hY + 1 * scale, 2 * scale, 3 * scale, side * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#00a8a0";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
          }

          // Headband connecting both guards across the top
          const bandGrad = ctx.createLinearGradient(cx - 10 * scale, hY - 12 * scale, cx + 10 * scale, hY - 8 * scale);
          bandGrad.addColorStop(0, "#3a5868");
          bandGrad.addColorStop(0.5, "#466878");
          bandGrad.addColorStop(1, "#3a5868");
          ctx.fillStyle = bandGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY - 10 * scale);
          ctx.quadraticCurveTo(cx, hY - 14 * scale, cx + 9 * scale, hY - 10 * scale);
          ctx.quadraticCurveTo(cx, hY - 12 * scale, cx - 9 * scale, hY - 10 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#00c8c0";
          ctx.shadowColor = "#00e0d8";
          ctx.shadowBlur = 3 * scale;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY - 10 * scale);
          ctx.quadraticCurveTo(cx, hY - 14 * scale, cx + 9 * scale, hY - 10 * scale);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Center gem on headband
          ctx.fillStyle = "#00e0d8";
          ctx.shadowColor = "#00ffe0";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(cx, hY - 12.5 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#208888";
          ctx.lineWidth = 0.4 * scale;
          ctx.stroke();
        }

        // === HEAD + FACE (angular) ===
        {
          const hY = cy - 18 * scale + bounce;

          // Angular face shape — not a circle, a polygon path with defined cheekbones and jaw
          const faceGrad = ctx.createRadialGradient(cx, hY - 1 * scale, 0, cx, hY + 2 * scale, 12 * scale);
          faceGrad.addColorStop(0, "#ffe8cc");
          faceGrad.addColorStop(0.4, "#fddcb8");
          faceGrad.addColorStop(0.8, "#ecc8a0");
          faceGrad.addColorStop(1, "#debb90");
          ctx.fillStyle = faceGrad;
          ctx.beginPath();
          ctx.moveTo(cx, hY - 10 * scale);
          ctx.bezierCurveTo(cx + 5 * scale, hY - 10 * scale, cx + 9 * scale, hY - 7 * scale, cx + 10 * scale, hY - 3 * scale);
          // Right cheekbone (angular)
          ctx.lineTo(cx + 10 * scale, hY + 1 * scale);
          ctx.lineTo(cx + 9 * scale, hY + 4 * scale);
          // Jaw angle
          ctx.lineTo(cx + 7 * scale, hY + 7 * scale);
          // Chin — pointed
          ctx.quadraticCurveTo(cx + 4 * scale, hY + 10 * scale, cx, hY + 11 * scale);
          ctx.quadraticCurveTo(cx - 4 * scale, hY + 10 * scale, cx - 7 * scale, hY + 7 * scale);
          // Left jaw angle
          ctx.lineTo(cx - 9 * scale, hY + 4 * scale);
          ctx.lineTo(cx - 10 * scale, hY + 1 * scale);
          // Left cheekbone
          ctx.lineTo(cx - 10 * scale, hY - 3 * scale);
          ctx.bezierCurveTo(cx - 9 * scale, hY - 7 * scale, cx - 5 * scale, hY - 10 * scale, cx, hY - 10 * scale);
          ctx.closePath();
          ctx.fill();

          // Jaw shadow for angularity
          ctx.fillStyle = "rgba(180, 130, 90, 0.12)";
          ctx.beginPath();
          ctx.moveTo(cx - 9 * scale, hY + 4 * scale);
          ctx.lineTo(cx - 7 * scale, hY + 7 * scale);
          ctx.quadraticCurveTo(cx - 4 * scale, hY + 10 * scale, cx, hY + 11 * scale);
          ctx.quadraticCurveTo(cx + 4 * scale, hY + 10 * scale, cx + 7 * scale, hY + 7 * scale);
          ctx.lineTo(cx + 9 * scale, hY + 4 * scale);
          ctx.quadraticCurveTo(cx + 8 * scale, hY + 6 * scale, cx, hY + 9 * scale);
          ctx.quadraticCurveTo(cx - 8 * scale, hY + 6 * scale, cx - 9 * scale, hY + 4 * scale);
          ctx.closePath();
          ctx.fill();

          // Cheekbone highlight
          for (const side of [-1, 1]) {
            ctx.fillStyle = "rgba(255, 240, 220, 0.15)";
            ctx.beginPath();
            ctx.ellipse(cx + side * 7.5 * scale, hY + 0.5 * scale, 2.5 * scale, 1.5 * scale, side * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Subtle cheek hollows (below cheekbone)
          for (const side of [-1, 1]) {
            ctx.fillStyle = "rgba(180, 130, 100, 0.08)";
            ctx.beginPath();
            ctx.ellipse(cx + side * 6 * scale, hY + 3.5 * scale, 2 * scale, 2.5 * scale, side * 0.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Ears (partially hidden by helmet)
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#f0d0a8";
            ctx.beginPath();
            ctx.ellipse(cx + side * 10.5 * scale, hY + 1 * scale, 1.8 * scale, 3 * scale, side * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#d8b890";
            ctx.lineWidth = 0.3 * scale;
            ctx.stroke();
          }

          // Nose — sharper, more defined bridge
          ctx.strokeStyle = "#d0a078";
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + 0.3 * scale, hY - 2 * scale);
          ctx.lineTo(cx + 1.2 * scale, hY + 1 * scale);
          ctx.quadraticCurveTo(cx + 1.5 * scale, hY + 2.5 * scale, cx + 0.5 * scale, hY + 3 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 0.5 * scale, hY + 3 * scale);
          ctx.quadraticCurveTo(cx, hY + 3.8 * scale, cx + 0.5 * scale, hY + 3 * scale);
          ctx.stroke();
          // Nostril shadows
          ctx.fillStyle = "rgba(180, 130, 100, 0.2)";
          ctx.beginPath();
          ctx.ellipse(cx - 0.8 * scale, hY + 3.2 * scale, 0.6 * scale, 0.4 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx + 0.8 * scale, hY + 3.2 * scale, 0.6 * scale, 0.4 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // === DETAILED HAIR ===

          // Back hair mass (behind face, provides overall volume)
          ctx.fillStyle = "#1e1008";
          ctx.beginPath();
          ctx.moveTo(cx - 11.5 * scale, hY + 3 * scale);
          ctx.bezierCurveTo(cx - 14 * scale, hY - 2 * scale, cx - 13 * scale, hY - 14 * scale, cx - 7 * scale, hY - 14 * scale);
          ctx.quadraticCurveTo(cx - 2 * scale, hY - 16.5 * scale, cx + 1 * scale, hY - 15 * scale);
          ctx.quadraticCurveTo(cx + 5 * scale, hY - 16.5 * scale, cx + 8 * scale, hY - 14 * scale);
          ctx.bezierCurveTo(cx + 13 * scale, hY - 13 * scale, cx + 14 * scale, hY - 2 * scale, cx + 11.5 * scale, hY + 3 * scale);
          ctx.closePath();
          ctx.fill();

          // Main hair body — layered gradient
          const hairGrad = ctx.createLinearGradient(cx - 6 * scale, hY - 15 * scale, cx + 6 * scale, hY - 4 * scale);
          hairGrad.addColorStop(0, "#3e2818");
          hairGrad.addColorStop(0.3, "#2e1c0e");
          hairGrad.addColorStop(0.6, "#3a2414");
          hairGrad.addColorStop(1, "#221408");
          ctx.fillStyle = hairGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 11 * scale, hY - 4 * scale);
          ctx.bezierCurveTo(cx - 12 * scale, hY - 9 * scale, cx - 11.5 * scale, hY - 14 * scale, cx - 6 * scale, hY - 13.5 * scale);
          ctx.quadraticCurveTo(cx - 1 * scale, hY - 15.5 * scale, cx + 1 * scale, hY - 14 * scale);
          ctx.quadraticCurveTo(cx + 4 * scale, hY - 15.5 * scale, cx + 7 * scale, hY - 13.5 * scale);
          ctx.bezierCurveTo(cx + 11.5 * scale, hY - 14 * scale, cx + 12 * scale, hY - 9 * scale, cx + 11 * scale, hY - 4 * scale);
          ctx.closePath();
          ctx.fill();

          // Sideburns — tapered, neat
          for (const side of [-1, 1]) {
            const sbGrad = ctx.createLinearGradient(
              cx + side * 9 * scale, hY - 6 * scale,
              cx + side * 11 * scale, hY + 6 * scale
            );
            sbGrad.addColorStop(0, "#2a1808");
            sbGrad.addColorStop(0.5, "#221408");
            sbGrad.addColorStop(1, "#1a1006");
            ctx.fillStyle = sbGrad;
            ctx.beginPath();
            ctx.moveTo(cx + side * 10.5 * scale, hY - 6 * scale);
            ctx.bezierCurveTo(
              cx + side * 12.5 * scale, hY - 3 * scale,
              cx + side * 12 * scale, hY + 2 * scale,
              cx + side * 11 * scale, hY + 5 * scale
            );
            ctx.quadraticCurveTo(cx + side * 10 * scale, hY + 6 * scale, cx + side * 9.5 * scale, hY + 4 * scale);
            ctx.bezierCurveTo(
              cx + side * 10.5 * scale, hY + 1 * scale,
              cx + side * 11 * scale, hY - 2 * scale,
              cx + side * 10 * scale, hY - 5 * scale
            );
            ctx.closePath();
            ctx.fill();
          }

          // Side-parted bangs — main left sweep (wider, more dramatic)
          const bangGrad = ctx.createLinearGradient(cx + 2 * scale, hY - 14 * scale, cx - 10 * scale, hY - 5 * scale);
          bangGrad.addColorStop(0, "#382010");
          bangGrad.addColorStop(0.5, "#2e180c");
          bangGrad.addColorStop(1, "#241208");
          ctx.fillStyle = bangGrad;
          ctx.beginPath();
          ctx.moveTo(cx + 2 * scale, hY - 13 * scale);
          ctx.bezierCurveTo(cx - 1 * scale, hY - 11 * scale, cx - 5 * scale, hY - 9.5 * scale, cx - 8 * scale, hY - 7 * scale);
          ctx.bezierCurveTo(cx - 10 * scale, hY - 5.5 * scale, cx - 11 * scale, hY - 5 * scale, cx - 11 * scale, hY - 4 * scale);
          ctx.lineTo(cx - 11.5 * scale, hY - 7 * scale);
          ctx.bezierCurveTo(cx - 11 * scale, hY - 11 * scale, cx - 7 * scale, hY - 13 * scale, cx - 3 * scale, hY - 14 * scale);
          ctx.quadraticCurveTo(cx, hY - 15 * scale, cx + 2 * scale, hY - 13 * scale);
          ctx.closePath();
          ctx.fill();

          // Right sweep (shorter, neater)
          ctx.fillStyle = "#2e180c";
          ctx.beginPath();
          ctx.moveTo(cx + 2 * scale, hY - 13 * scale);
          ctx.bezierCurveTo(cx + 5 * scale, hY - 12 * scale, cx + 8 * scale, hY - 10 * scale, cx + 10.5 * scale, hY - 6 * scale);
          ctx.lineTo(cx + 11 * scale, hY - 4 * scale);
          ctx.lineTo(cx + 11.5 * scale, hY - 7 * scale);
          ctx.bezierCurveTo(cx + 11 * scale, hY - 11 * scale, cx + 7 * scale, hY - 13.5 * scale, cx + 4 * scale, hY - 14 * scale);
          ctx.quadraticCurveTo(cx + 3 * scale, hY - 14 * scale, cx + 2 * scale, hY - 13 * scale);
          ctx.closePath();
          ctx.fill();

          // Individual hair strand lines (left sweep)
          ctx.strokeStyle = "rgba(60, 36, 18, 0.5)";
          ctx.lineWidth = 0.35 * scale;
          const strandData = [
            [1, -13, -3, -10.5, -7, -8, -10, -5],
            [0, -13, -4, -10, -8, -7.5, -11, -4.5],
            [-1, -12.5, -5, -9.5, -9, -7, -10.5, -5.5],
            [2, -12, -2, -10, -6, -8.5, -9, -6.5],
          ];
          for (const s of strandData) {
            ctx.beginPath();
            ctx.moveTo(cx + s[0] * scale, hY + s[1] * scale);
            ctx.bezierCurveTo(
              cx + s[2] * scale, hY + s[3] * scale,
              cx + s[4] * scale, hY + s[5] * scale,
              cx + s[6] * scale, hY + s[7] * scale
            );
            ctx.stroke();
          }
          // Right sweep strands
          const rStrandData = [
            [2.5, -12.5, 5, -11, 8, -9, 10, -6],
            [3, -12, 6, -10.5, 9, -8, 10.5, -5],
            [2, -12, 4.5, -10, 7, -8.5, 9.5, -6.5],
          ];
          for (const s of rStrandData) {
            ctx.beginPath();
            ctx.moveTo(cx + s[0] * scale, hY + s[1] * scale);
            ctx.bezierCurveTo(
              cx + s[2] * scale, hY + s[3] * scale,
              cx + s[4] * scale, hY + s[5] * scale,
              cx + s[6] * scale, hY + s[7] * scale
            );
            ctx.stroke();
          }

          // Hair sheen highlights (two glossy patches)
          ctx.fillStyle = "rgba(120, 80, 50, 0.14)";
          ctx.beginPath();
          ctx.ellipse(cx - 4 * scale, hY - 11 * scale, 4.5 * scale, 1.8 * scale, -0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(110, 75, 45, 0.10)";
          ctx.beginPath();
          ctx.ellipse(cx + 5 * scale, hY - 10.5 * scale, 3 * scale, 1.5 * scale, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Part line
          ctx.strokeStyle = "rgba(16, 8, 4, 0.5)";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + 2 * scale, hY - 13.5 * scale);
          ctx.quadraticCurveTo(cx + 1.5 * scale, hY - 11 * scale, cx + 2 * scale, hY - 8 * scale);
          ctx.stroke();

          // === FACE FEATURES ===

          // Eyebrows (strong, angular)
          ctx.strokeStyle = "#2a1808";
          ctx.lineWidth = 1.3 * scale;
          ctx.lineCap = "round";
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 7 * scale, hY - 3.5 * scale);
            ctx.quadraticCurveTo(cx + side * 4 * scale, hY - 6 * scale, cx + side * 1.5 * scale, hY - 4.5 * scale);
            ctx.stroke();
          }
          ctx.lineCap = "butt";

          // Eye whites
          ctx.fillStyle = "#f8f4f0";
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(cx + side * 4 * scale, hY - 1 * scale, 3.2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Iris (blue-grey, with detail ring)
          for (const side of [-1, 1]) {
            const ex = cx + side * 4 * scale;
            const ey = hY - 1 * scale;
            const irisGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 2 * scale);
            irisGrad.addColorStop(0, "#5088a8");
            irisGrad.addColorStop(0.5, "#3a6888");
            irisGrad.addColorStop(0.8, "#2a4868");
            irisGrad.addColorStop(1, "#1e3050");
            ctx.fillStyle = irisGrad;
            ctx.beginPath();
            ctx.arc(ex, ey, 1.8 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Limbal ring
            ctx.strokeStyle = "#1e3050";
            ctx.lineWidth = 0.3 * scale;
            ctx.stroke();
            // Pupil
            ctx.fillStyle = "#080808";
            ctx.beginPath();
            ctx.arc(ex, ey, 0.85 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Catchlights
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(ex + side * 0.5 * scale, ey - 0.7 * scale, 0.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex - side * 0.3 * scale, ey + 0.5 * scale, 0.25 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Upper eyelids (thicker, more defined)
          ctx.strokeStyle = "#4a2a16";
          ctx.lineWidth = 0.8 * scale;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(cx + side * 4 * scale, hY - 1 * scale, 3 * scale, -Math.PI * 0.95, -Math.PI * 0.05);
            ctx.stroke();
          }

          // Square wire-frame glasses
          ctx.strokeStyle = "#1a2830";
          ctx.lineWidth = 0.2 * scale;
          for (const side of [-1, 1]) {
            const lx = cx + side * 4 * scale;
            const ly = hY - 1 * scale;
            ctx.beginPath();
            ctx.roundRect(lx - 3.8 * scale, ly - 1.6 * scale, 7.6 * scale, 3.2 * scale, 0.4 * scale);
            ctx.stroke();
          }
          // Bridge
          ctx.lineWidth = 0.2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + 0.2 * scale, hY - 1.5 * scale);
          ctx.lineTo(cx - 0.2 * scale, hY - 1.5 * scale);
          ctx.stroke();
          // Temple arms
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx + side * 7.8 * scale, hY - 1 * scale);
            ctx.lineTo(cx + side * 11 * scale, hY);
            ctx.stroke();
          }
          // Subtle cyan lens tint
          ctx.fillStyle = "rgba(0, 200, 210, 0.05)";
          for (const side of [-1, 1]) {
            const lx = cx + side * 4 * scale;
            const ly = hY - 1 * scale;
            ctx.beginPath();
            ctx.roundRect(lx - 3.5 * scale, ly - 1.3 * scale, 7 * scale, 2.6 * scale, 0.3 * scale);
            ctx.fill();
          }

          // Mouth — slight knowing smirk (asymmetric)
          ctx.strokeStyle = "#8a6040";
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - 2.5 * scale, hY + 5.5 * scale);
          ctx.quadraticCurveTo(cx - 0.5 * scale, hY + 7 * scale, cx + 2.5 * scale, hY + 5.2 * scale);
          ctx.stroke();
          // Lower lip
          ctx.fillStyle = "rgba(220, 160, 140, 0.18)";
          ctx.beginPath();
          ctx.ellipse(cx, hY + 6.5 * scale, 2 * scale, 0.7 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          // Chin dimple
          ctx.fillStyle = "rgba(180, 130, 100, 0.1)";
          ctx.beginPath();
          ctx.ellipse(cx, hY + 9 * scale, 1 * scale, 0.6 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // === UPTURNED COLLAR (above face, side panels only) ===
        {
          const bY = bounce;
          for (const side of [1, -1]) {
            const collarGrad = ctx.createLinearGradient(
              cx + side * 9 * scale, cy - 14 * scale,
              cx + side * 18 * scale, cy - 2 * scale
            );
            collarGrad.addColorStop(0, "#3a5868");
            collarGrad.addColorStop(0.4, "#4a6878");
            collarGrad.addColorStop(0.8, "#345060");
            collarGrad.addColorStop(1, "#284450");
            ctx.fillStyle = collarGrad;
            ctx.beginPath();
            ctx.moveTo(cx + side * 5 * scale, cy - 14 * scale + bY);
            ctx.quadraticCurveTo(cx + side * 13 * scale, cy - 19 * scale + bY, cx + side * 17 * scale, cy - 13 * scale + bY);
            ctx.lineTo(cx + side * 16 * scale, cy - 4 * scale + bY);
            ctx.lineTo(cx + side * 9 * scale, cy - 6 * scale + bY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#1e3038";
            ctx.lineWidth = 0.7 * scale;
            ctx.stroke();

            ctx.fillStyle = "#4a6878";
            ctx.beginPath();
            ctx.moveTo(cx + side * 10 * scale, cy - 13 * scale + bY);
            ctx.quadraticCurveTo(cx + side * 13 * scale, cy - 17 * scale + bY, cx + side * 16 * scale, cy - 12 * scale + bY);
            ctx.lineTo(cx + side * 15 * scale, cy - 5 * scale + bY);
            ctx.lineTo(cx + side * 10 * scale, cy - 7 * scale + bY);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "#00d8d0";
            ctx.shadowColor = "#00ffe0";
            ctx.shadowBlur = 4 * scale;
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(cx + side * 9 * scale, cy - 14 * scale + bY);
            ctx.quadraticCurveTo(cx + side * 13 * scale, cy - 19 * scale + bY, cx + side * 17 * scale, cy - 13 * scale + bY);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // === ORNATE LAYERED EPAULETTES (above collar) ===
        for (const side of [-1, 1]) {
          const epX = cx + side * 16 * scale;
          const epY = cy - 10 * scale + bounce;
          const outerGrad = ctx.createRadialGradient(epX, epY, 0, epX, epY, 8 * scale);
          outerGrad.addColorStop(0, "#607880");
          outerGrad.addColorStop(0.6, "#4a6068");
          outerGrad.addColorStop(1, "#385058");
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.ellipse(epX, epY, 9 * scale, 5 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a5058";
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();
          const midGrad = ctx.createRadialGradient(epX, epY - 0.5 * scale, 0, epX, epY, 7 * scale);
          midGrad.addColorStop(0, "#7a9098");
          midGrad.addColorStop(0.7, "#607880");
          midGrad.addColorStop(1, "#4a6068");
          ctx.fillStyle = midGrad;
          ctx.beginPath();
          ctx.ellipse(epX, epY - 0.5 * scale, 7 * scale, 3.5 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#8aa0a8";
          ctx.beginPath();
          ctx.ellipse(epX, epY - 0.8 * scale, 3.5 * scale, 2 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#00b8b0";
          ctx.shadowColor = "#00e0d8";
          ctx.shadowBlur = 4 * scale;
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.ellipse(epX, epY - 0.5 * scale, 6.5 * scale, 3.3 * scale, side * 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(0, 220, 220, ${0.7 + Math.sin(t * 2.5) * 0.2})`;
          ctx.shadowColor = "#00e8e0";
          ctx.shadowBlur = 4 * scale;
          ctx.beginPath();
          ctx.arc(epX, epY - 0.8 * scale, 1.4 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#90a0a8";
          for (let r = 0; r < 8; r++) {
            const rAngle = (r / 8) * Math.PI * 2 + side * 0.3;
            const rX = epX + Math.cos(rAngle) * 7.5 * scale;
            const rY = epY + Math.sin(rAngle) * 4 * scale;
            ctx.beginPath();
            ctx.arc(rX, rY, 0.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          const fringeWave = animated ? Math.sin(t * 2 + side) * 0.3 : 0;
          ctx.lineWidth = 0.7 * scale;
          for (let f = 0; f < 9; f++) {
            const fAngle = (f / 8 - 0.5) * 1.2 + side * 0.3;
            const fStartX = epX + Math.cos(fAngle + Math.PI * 0.5) * 8 * scale * side;
            const fStartY = epY + 4 * scale;
            const fLen = (4 + Math.sin(f * 1.5) * 1.5) * scale;
            const fWobble = animated ? Math.sin(t * 3 + f * 0.8) * 0.8 * scale : 0;
            ctx.strokeStyle = "#506068";
            ctx.beginPath();
            ctx.moveTo(fStartX, fStartY);
            ctx.lineTo(fStartX + fWobble, fStartY + fLen);
            ctx.stroke();
            ctx.fillStyle = `rgba(0, 200, 210, ${0.5 + fringeWave * 0.3})`;
            ctx.beginPath();
            ctx.arc(fStartX + fWobble, fStartY + fLen + 0.5 * scale, 0.6 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // === WRITING TRAIL - cyan words flowing from pen ===
        if (animated) {
          ctx.textAlign = "center";
          const trailWords = ["the", "green", "light", "across", "the", "bay"];
          for (let i = 0; i < 4; i++) {
            const wordPhase = (t * 0.3 + i * 0.35) % 2.0;
            const drift = Math.sin(t * 0.8 + i * 1.3) * 4 * scale;
            const wordX = cx + 14 * scale + wordPhase * 7 * scale + drift;
            const wordY = cy + 8 * scale - wordPhase * 14 * scale + bounce;
            const alpha = Math.max(0, 1 - wordPhase / 2.0) * 0.55;
            const fontSize = (3.5 + (1 - wordPhase / 2.0) * 1.5) * scale;
            ctx.font = `italic ${fontSize}px Georgia`;
            ctx.fillStyle = `rgba(0, 220, 210, ${alpha})`;
            ctx.shadowColor = "#00ffe0";
            ctx.shadowBlur = 3 * scale * alpha;
            ctx.globalAlpha = alpha;
            ctx.fillText(trailWords[i % trailWords.length], wordX, wordY);
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        break;
      }
      case "captain": {
        cy += 6 * scale;
        // CAPTAIN - Ornate Red/Grey Knight with Sword, Red Plume, Gold Accents
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const plumeWave = animated ? Math.sin(t * 3) * 0.1 : 0;

        // Crimson/gold backlight
        {
          const blGrad = ctx.createRadialGradient(cx, cy + 4 * scale, 0, cx, cy + 4 * scale, 42 * scale);
          blGrad.addColorStop(0, "rgba(220, 50, 30, 0.16)");
          blGrad.addColorStop(0.3, "rgba(200, 80, 20, 0.09)");
          blGrad.addColorStop(0.6, "rgba(160, 40, 10, 0.04)");
          blGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = blGrad;
          ctx.beginPath();
          ctx.arc(cx, cy + 4 * scale, 42 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Orange/fire heroic aura
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * scale);
        auraGrad.addColorStop(0, `rgba(220, 120, 20, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(180, 60, 10, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === FLOWING FIRE CAPE (behind body) ===
        const capeWave = animated ? Math.sin(t * 2) * 0.08 : 0;
        ctx.save();
        ctx.translate(cx, cy - 8 * scale + bounce);
        {
          const cw = capeWave;
          // Cape main body - flowing orange/fire fabric
          const capeGrad = ctx.createLinearGradient(-28 * scale, -2 * scale, 28 * scale, 28 * scale);
          capeGrad.addColorStop(0, "#ff7700");
          capeGrad.addColorStop(0.2, "#ee5500");
          capeGrad.addColorStop(0.4, "#dd3300");
          capeGrad.addColorStop(0.6, "#cc2200");
          capeGrad.addColorStop(0.8, "#aa1800");
          capeGrad.addColorStop(1, "#771100");
          ctx.fillStyle = capeGrad;
          ctx.beginPath();
          // Start at left shoulder
          ctx.moveTo(-12 * scale, -2 * scale);
          // Left side - sweeping outward
          ctx.bezierCurveTo(
            -24 * scale + cw * 30, 2 * scale,
            -30 * scale + cw * 48, 12 * scale,
            -26 * scale + cw * 58, 22 * scale
          );
          // Left bottom with scalloped flame-like edge
          ctx.quadraticCurveTo(-20 * scale + cw * 35, 30 * scale, -14 * scale, 27 * scale);
          ctx.quadraticCurveTo(-10 * scale, 32 * scale + cw * 10, -5 * scale, 28 * scale);
          // Center bottom drape
          ctx.quadraticCurveTo(-2 * scale, 34 * scale + cw * 8, 0, 30 * scale);
          ctx.quadraticCurveTo(2 * scale, 34 * scale - cw * 8, 5 * scale, 28 * scale);
          // Right bottom scallop
          ctx.quadraticCurveTo(10 * scale, 32 * scale - cw * 10, 14 * scale, 27 * scale);
          ctx.quadraticCurveTo(20 * scale - cw * 35, 30 * scale, 26 * scale - cw * 58, 22 * scale);
          // Right side
          ctx.bezierCurveTo(
            30 * scale - cw * 48, 12 * scale,
            24 * scale - cw * 30, 2 * scale,
            12 * scale, -2 * scale
          );
          ctx.closePath();
          ctx.fill();

          // Inner shadow/fold
          ctx.fillStyle = "rgba(80, 20, 0, 0.25)";
          ctx.beginPath();
          ctx.moveTo(-5 * scale, 4 * scale);
          ctx.quadraticCurveTo(-10 * scale + cw * 25, 14 * scale, -7 * scale, 24 * scale);
          ctx.quadraticCurveTo(0, 20 * scale, 7 * scale, 24 * scale);
          ctx.quadraticCurveTo(10 * scale - cw * 25, 14 * scale, 5 * scale, 4 * scale);
          ctx.closePath();
          ctx.fill();

          // Side fold highlights (fire glow)
          for (const side of [-1, 1]) {
            ctx.fillStyle = "rgba(255, 120, 20, 0.12)";
            ctx.beginPath();
            ctx.moveTo(side * 8 * scale, 0);
            ctx.bezierCurveTo(
              side * 18 * scale + cw * side * 22, 6 * scale,
              side * 24 * scale + cw * side * 30, 14 * scale,
              side * 18 * scale + cw * side * 34, 22 * scale
            );
            ctx.quadraticCurveTo(side * 12 * scale, 18 * scale, side * 8 * scale, 10 * scale);
            ctx.closePath();
            ctx.fill();
          }

          // Gold trim along full edge
          ctx.strokeStyle = "#d4aa00";
          ctx.shadowColor = "#e0b840";
          ctx.shadowBlur = 3 * scale;
          ctx.lineWidth = 2.2 * scale;
          ctx.beginPath();
          ctx.moveTo(-12 * scale, -2 * scale);
          ctx.bezierCurveTo(-24 * scale + cw * 30, 2 * scale, -30 * scale + cw * 48, 12 * scale, -26 * scale + cw * 58, 22 * scale);
          ctx.quadraticCurveTo(-20 * scale + cw * 35, 30 * scale, -14 * scale, 27 * scale);
          ctx.quadraticCurveTo(-10 * scale, 32 * scale + cw * 10, -5 * scale, 28 * scale);
          ctx.quadraticCurveTo(-2 * scale, 34 * scale + cw * 8, 0, 30 * scale);
          ctx.quadraticCurveTo(2 * scale, 34 * scale - cw * 8, 5 * scale, 28 * scale);
          ctx.quadraticCurveTo(10 * scale, 32 * scale - cw * 10, 14 * scale, 27 * scale);
          ctx.quadraticCurveTo(20 * scale - cw * 35, 30 * scale, 26 * scale - cw * 58, 22 * scale);
          ctx.bezierCurveTo(30 * scale - cw * 48, 12 * scale, 24 * scale - cw * 30, 2 * scale, 12 * scale, -2 * scale);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Gold shoulder clasps
          for (const side of [-1, 1]) {
            ctx.fillStyle = "#d4aa00";
            ctx.beginPath();
            ctx.arc(side * 10 * scale, 0, 2.8 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#aa8800";
            ctx.lineWidth = 0.6 * scale;
            ctx.stroke();
            // Gem in clasp
            ctx.fillStyle = "#cc3333";
            ctx.beginPath();
            ctx.arc(side * 10 * scale, 0, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // === ORNATE ARMOR BODY ===
        // Main chest plate - grey steel with gold trim, curved bottom
        const armorGrad = ctx.createLinearGradient(cx - 16 * scale, cy, cx + 16 * scale, cy);
        armorGrad.addColorStop(0, "#4a4e54");
        armorGrad.addColorStop(0.2, "#5a6068");
        armorGrad.addColorStop(0.4, "#6a7280");
        armorGrad.addColorStop(0.5, "#788898");
        armorGrad.addColorStop(0.6, "#6a7280");
        armorGrad.addColorStop(0.8, "#5a6068");
        armorGrad.addColorStop(1, "#4a4e54");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 16 * scale, cy + 12 * scale + bounce);
        ctx.quadraticCurveTo(cx - 16.5 * scale, cy + 2 * scale + bounce, cx - 15 * scale, cy - 2 * scale + bounce);
        ctx.lineTo(cx - 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx, cy - 13 * scale + bounce);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale + bounce);
        ctx.lineTo(cx + 15 * scale, cy - 2 * scale + bounce);
        ctx.quadraticCurveTo(cx + 16.5 * scale, cy + 2 * scale + bounce, cx + 16 * scale, cy + 12 * scale + bounce);
        // Curved bottom
        ctx.quadraticCurveTo(cx + 12 * scale, cy + 18 * scale + bounce, cx, cy + 20 * scale + bounce);
        ctx.quadraticCurveTo(cx - 12 * scale, cy + 18 * scale + bounce, cx - 16 * scale, cy + 12 * scale + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d4aa00";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Silver specular highlight on chest plate
        ctx.save();
        ctx.globalAlpha = 0.18;
        const specGrad = ctx.createRadialGradient(cx - 3 * scale, cy - 4 * scale + bounce, 0, cx, cy + bounce, 14 * scale);
        specGrad.addColorStop(0, "#e0e8f0");
        specGrad.addColorStop(0.3, "#c0c8d0");
        specGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 4 * scale + bounce, 8 * scale, 10 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();

        // Gold trim bands on chest plate
        ctx.strokeStyle = "#c8a020";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, cy - 6 * scale + bounce);
        ctx.lineTo(cx + 14 * scale, cy - 6 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 15.5 * scale, cy + 2 * scale + bounce);
        ctx.lineTo(cx + 15.5 * scale, cy + 2 * scale + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 15 * scale, cy + 10 * scale + bounce);
        ctx.quadraticCurveTo(cx, cy + 12 * scale + bounce, cx + 15 * scale, cy + 10 * scale + bounce);
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
        for (const rx of [-14, -12, 12, 14]) {
          for (const ry of [-4, 4, 12]) {
            ctx.beginPath();
            ctx.arc(cx + rx * scale, cy + ry * scale + bounce, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Gorget (neck guard)
        const gorgetGrad = ctx.createLinearGradient(cx - 8 * scale, cy - 12 * scale + bounce, cx + 8 * scale, cy - 12 * scale + bounce);
        gorgetGrad.addColorStop(0, "#586068");
        gorgetGrad.addColorStop(0.5, "#6a7880");
        gorgetGrad.addColorStop(1, "#586068");
        ctx.fillStyle = gorgetGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 * scale + bounce, 10 * scale, 3 * scale, 0, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d4aa00";
        ctx.lineWidth = 0.8 * scale;
        ctx.stroke();

        // Armor skirt (pteruges/tassets) - V shape, 7 wide segments
        {
          const skirtPositions = [-15, -10, -5, 0, 5, 10, 15];
          for (const sp of skirtPositions) {
            const sx = cx + sp * scale;
            const distFromCenter = Math.abs(sp);
            const vDrop = (15 - distFromCenter) * 0.35 * scale;
            const skirtY = cy + 14 * scale + bounce + vDrop;
            const pW = 4.5 * scale;
            const pH = 7 * scale + vDrop * 0.5;
            const plateGrad = ctx.createLinearGradient(sx, skirtY, sx, skirtY + pH);
            plateGrad.addColorStop(0, "#606870");
            plateGrad.addColorStop(0.3, "#546068");
            plateGrad.addColorStop(0.7, "#4a5660");
            plateGrad.addColorStop(1, "#404c56");
            ctx.fillStyle = plateGrad;
            ctx.beginPath();
            ctx.moveTo(sx - pW / 2, skirtY);
            ctx.lineTo(sx + pW / 2, skirtY);
            ctx.lineTo(sx + pW / 2 - 0.6 * scale, skirtY + pH);
            ctx.quadraticCurveTo(sx, skirtY + pH + 1.2 * scale, sx - pW / 2 + 0.6 * scale, skirtY + pH);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#d4aa00";
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
            // Gold trim at top
            ctx.fillStyle = "#c8a020";
            ctx.fillRect(sx - pW / 2, skirtY, pW, 1.2 * scale);
            // Red accent stripe at bottom
            ctx.strokeStyle = "#bb2222";
            ctx.lineWidth = 0.8 * scale;
            ctx.beginPath();
            ctx.moveTo(sx - pW / 2 + 0.8 * scale, skirtY + pH - 0.8 * scale);
            ctx.lineTo(sx + pW / 2 - 0.8 * scale, skirtY + pH - 0.8 * scale);
            ctx.stroke();
            // Center rivet
            ctx.fillStyle = "#d4aa00";
            ctx.beginPath();
            ctx.arc(sx, skirtY + 2.5 * scale, 0.7 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // === ORNATE SHOULDER ARMOR ===
        for (const sx of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + sx * 18 * scale, cy - 6 * scale + bounce);

          const pauldronGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
          pauldronGrad.addColorStop(0, "#788898");
          pauldronGrad.addColorStop(0.5, "#606870");
          pauldronGrad.addColorStop(1, "#4a5660");
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
          uGrad.addColorStop(0, "#606870");
          uGrad.addColorStop(0.4, "#586068");
          uGrad.addColorStop(1, "#4a5660");
          ctx.fillStyle = uGrad;
          ctx.beginPath();
          ctx.ellipse(0, 4 * scale, 5.5 * scale, 7 * scale, -0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a4248";
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
          eGrad.addColorStop(0, "#6a7880");
          eGrad.addColorStop(1, "#4a5660");
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
          fGrad.addColorStop(0, "#606870");
          fGrad.addColorStop(0.5, "#586068");
          fGrad.addColorStop(1, "#4a5660");
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.ellipse(-0.5 * scale, 15 * scale, 5 * scale, 6 * scale, 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a4248";
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
          uGrad.addColorStop(0, "#606870");
          uGrad.addColorStop(0.4, "#586068");
          uGrad.addColorStop(1, "#4a5660");
          ctx.fillStyle = uGrad;
          ctx.beginPath();
          ctx.ellipse(0, 4 * scale, 5.5 * scale, 7 * scale, 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a4248";
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
          eGrad.addColorStop(0, "#6a7880");
          eGrad.addColorStop(1, "#4a5660");
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
          fGrad.addColorStop(0, "#606870");
          fGrad.addColorStop(0.5, "#586068");
          fGrad.addColorStop(1, "#4a5660");
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.ellipse(0.5 * scale, 15 * scale, 5 * scale, 6 * scale, -0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a4248";
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();
        }
        ctx.restore();

        // === ORNATE HELMET ===
        {
          const hY = cy - 20 * scale + bounce;

          // Main helmet shell - grey steel
          const helmetGrad = ctx.createRadialGradient(cx - 2 * scale, hY - 2 * scale, 0, cx, hY, 13 * scale);
          helmetGrad.addColorStop(0, "#8a94a0");
          helmetGrad.addColorStop(0.3, "#6a7880");
          helmetGrad.addColorStop(0.6, "#546068");
          helmetGrad.addColorStop(1, "#404c56");
          ctx.fillStyle = helmetGrad;
          ctx.beginPath();
          ctx.ellipse(cx, hY, 12 * scale, 11 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d4aa00";
          ctx.lineWidth = 1.2 * scale;
          ctx.stroke();

          // Silver highlight arc on dome
          ctx.strokeStyle = "rgba(200, 210, 220, 0.45)";
          ctx.lineWidth = 1.2 * scale;
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

          // Cheek guards - grey steel with gold edge
          for (const sx of [-1, 1]) {
            const wGrad = ctx.createLinearGradient(cx + sx * 11 * scale, hY, cx + sx * 20 * scale, hY - 8 * scale);
            wGrad.addColorStop(0, "#4a5660");
            wGrad.addColorStop(0.5, "#5a6870");
            wGrad.addColorStop(1, "#6a7880");
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

          // Fire/orange crest ridge (shorter)
          const crestGrad = ctx.createLinearGradient(cx, hY - 14 * scale, cx, hY);
          crestGrad.addColorStop(0, "#ffaa00");
          crestGrad.addColorStop(0.2, "#ee6600");
          crestGrad.addColorStop(0.5, "#dd3300");
          crestGrad.addColorStop(0.8, "#cc2200");
          crestGrad.addColorStop(1, "#881100");
          ctx.fillStyle = crestGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 2.5 * scale, hY + 2 * scale);
          ctx.lineTo(cx - 3.5 * scale, hY - 4 * scale);
          ctx.lineTo(cx - 2 * scale, hY - 8 * scale);
          ctx.lineTo(cx, hY - 10 * scale);
          ctx.lineTo(cx + 2 * scale, hY - 8 * scale);
          ctx.lineTo(cx + 3.5 * scale, hY - 4 * scale);
          ctx.lineTo(cx + 2.5 * scale, hY + 2 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#661100";
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Fire plume - short wide crest
          ctx.save();
          ctx.translate(cx, hY - 8 * scale);
          ctx.rotate(plumeWave);
          // Main flame body — wider and shorter
          const plumeGrad = ctx.createRadialGradient(0, -2 * scale, 0, 0, -1 * scale, 7 * scale);
          plumeGrad.addColorStop(0, "#ffcc00");
          plumeGrad.addColorStop(0.3, "#ff8800");
          plumeGrad.addColorStop(0.6, "#ee4400");
          plumeGrad.addColorStop(1, "#882200");
          ctx.fillStyle = plumeGrad;
          ctx.beginPath();
          ctx.ellipse(0, -2 * scale, 5 * scale, 5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          // Side flame wisps — wider spread
          ctx.fillStyle = "#ee6600";
          ctx.beginPath();
          ctx.ellipse(-3.5 * scale, -1.5 * scale, 2.5 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#dd4400";
          ctx.beginPath();
          ctx.ellipse(3.5 * scale, -1.5 * scale, 2.5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
          ctx.fill();
          // Bright yellow tip — shorter
          ctx.fillStyle = "#ffdd44";
          ctx.beginPath();
          ctx.ellipse(0, -5 * scale, 2 * scale, 2.5 * scale, plumeWave * 2, 0, Math.PI * 2);
          ctx.fill();
          // Flame stroke lines — shorter
          ctx.strokeStyle = "rgba(255, 200, 50, 0.3)";
          ctx.lineWidth = 0.5 * scale;
          for (let ps = -1; ps <= 1; ps++) {
            ctx.beginPath();
            ctx.moveTo(ps * 1.5 * scale, 0);
            ctx.quadraticCurveTo(ps * 2 * scale, -3 * scale, ps * 0.5 * scale, -6 * scale);
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
          ctx.strokeStyle = "#586068";
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, hY - 2 * scale);
          ctx.lineTo(cx, hY + 4 * scale);
          ctx.stroke();
          // Horizontal visor bars
          ctx.strokeStyle = "rgba(80, 96, 104, 0.5)";
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

          // Angular chin guard - grey steel with gold trim
          const chinGrad = ctx.createLinearGradient(cx - 8 * scale, hY + 4 * scale, cx + 8 * scale, hY + 12 * scale);
          chinGrad.addColorStop(0, "#5a6870");
          chinGrad.addColorStop(0.5, "#4a5660");
          chinGrad.addColorStop(1, "#3a4850");
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
          ctx.strokeStyle = "#2a3038";
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

        // Flag pole - gold with grip rings (shorter)
        const poleGrad = ctx.createLinearGradient(-1 * scale, -28 * scale, 1 * scale, 2 * scale);
        poleGrad.addColorStop(0, "#c8a020");
        poleGrad.addColorStop(0.5, "#e0c040");
        poleGrad.addColorStop(1, "#aa8800");
        ctx.fillStyle = poleGrad;
        ctx.beginPath();
        ctx.roundRect(-1 * scale, -28 * scale, 2 * scale, 30 * scale, 0.5 * scale);
        ctx.fill();
        ctx.strokeStyle = "#886600";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Grip rings
        ctx.strokeStyle = "#c8a020";
        ctx.lineWidth = 0.5 * scale;
        for (let gr = 0; gr < 3; gr++) {
          ctx.beginPath();
          ctx.ellipse(0, -2 * scale + gr * 2.5 * scale, 1.3 * scale, 0.5 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Ornate gold finial - spearpoint shape (smaller)
        ctx.fillStyle = "#d4aa00";
        ctx.beginPath();
        ctx.moveTo(0, -32 * scale);
        ctx.lineTo(-1.5 * scale, -29 * scale);
        ctx.lineTo(-1.2 * scale, -28 * scale);
        ctx.lineTo(1.2 * scale, -28 * scale);
        ctx.lineTo(1.5 * scale, -29 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#aa8800";
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();
        // Finial ball
        ctx.fillStyle = "#e0b820";
        ctx.beginPath();
        ctx.arc(0, -28 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#b09010";
        ctx.stroke();

        // Triangle pennant (smaller)
        const flagWave = animated ? Math.sin(t * 2.5) : 0;
        const pennantGrad = ctx.createLinearGradient(-1 * scale, -27 * scale, -13 * scale, -21 * scale);
        pennantGrad.addColorStop(0, "#dd2828");
        pennantGrad.addColorStop(0.4, "#cc1818");
        pennantGrad.addColorStop(1, "#990808");
        ctx.fillStyle = pennantGrad;
        ctx.beginPath();
        ctx.moveTo(-1 * scale, -27 * scale);
        ctx.quadraticCurveTo(-7 * scale + flagWave * 1.5 * scale, -25.5 * scale, -13 * scale + flagWave * 2 * scale, -21 * scale);
        ctx.quadraticCurveTo(-7 * scale + flagWave * 1.5 * scale, -16.5 * scale, -1 * scale, -15 * scale);
        ctx.closePath();
        ctx.fill();
        // Gold border
        ctx.strokeStyle = "#d4a030";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        // Inner highlight
        ctx.fillStyle = "rgba(255, 100, 100, 0.25)";
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, -25.5 * scale);
        ctx.quadraticCurveTo(-6 * scale + flagWave * 1 * scale, -24 * scale, -10 * scale + flagWave * 1.5 * scale, -21 * scale);
        ctx.quadraticCurveTo(-6 * scale + flagWave * 1 * scale, -18 * scale, -1.5 * scale, -16.5 * scale);
        ctx.closePath();
        ctx.fill();
        // Star emblem on pennant
        const starX = -6 * scale + flagWave * 1 * scale;
        const starY = -21 * scale;
        ctx.fillStyle = "#f0d060";
        ctx.shadowColor = "#f0d060";
        ctx.shadowBlur = 2 * scale;
        ctx.beginPath();
        for (let sp = 0; sp < 5; sp++) {
          const sAngle = sp * Math.PI * 2 / 5 - Math.PI / 2;
          const sAngle2 = sAngle + Math.PI / 5;
          const outerR = 1.8 * scale;
          const innerR = 0.7 * scale;
          if (sp === 0) ctx.moveTo(starX + Math.cos(sAngle) * outerR, starY + Math.sin(sAngle) * outerR);
          else ctx.lineTo(starX + Math.cos(sAngle) * outerR, starY + Math.sin(sAngle) * outerR);
          ctx.lineTo(starX + Math.cos(sAngle2) * innerR, starY + Math.sin(sAngle2) * innerR);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Gold tassel at pennant tip
        ctx.strokeStyle = "#d4a030";
        ctx.lineWidth = 0.6 * scale;
        const tipX = -13 * scale + flagWave * 2 * scale;
        const tWave = animated ? Math.sin(t * 3.5) * 0.6 * scale : 0;
        for (let ts = 0; ts < 3; ts++) {
          ctx.beginPath();
          ctx.moveTo(tipX, -21 * scale + (ts - 1) * 1.2 * scale);
          ctx.lineTo(tipX - 2.5 * scale + tWave, -21 * scale + (ts - 1) * 1.5 * scale);
          ctx.stroke();
        }
        ctx.fillStyle = "#d4a030";
        for (let ts = 0; ts < 3; ts++) {
          ctx.beginPath();
          ctx.arc(tipX - 2.5 * scale + tWave, -21 * scale + (ts - 1) * 1.5 * scale, 0.4 * scale, 0, Math.PI * 2);
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
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1.15, 1.15);
        ctx.translate(-cx, -cy);
        const dataPulse = Math.sin(t * 5) * 0.5 + 0.5;
        const auraPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const idleSway = animated ? Math.sin(t * 0.7) * 0.5 : 0;
        const toolFidget = animated ? Math.sin(t * 1.2) * 0.08 : 0;

        // Electric blue/yellow backlight
        {
          const blGrad = ctx.createRadialGradient(cx, cy + 4 * scale, 0, cx, cy + 4 * scale, 42 * scale);
          blGrad.addColorStop(0, "rgba(60, 160, 240, 0.16)");
          blGrad.addColorStop(0.25, "rgba(80, 180, 220, 0.10)");
          blGrad.addColorStop(0.5, "rgba(200, 200, 60, 0.06)");
          blGrad.addColorStop(0.7, "rgba(100, 140, 200, 0.03)");
          blGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = blGrad;
          ctx.beginPath();
          ctx.arc(cx, cy + 4 * scale, 42 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

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
        ctx.restore();
        break;
      }
    }
  }, [type, size, animated]);

  useSpriteTicker(animated, 50, renderHero);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
