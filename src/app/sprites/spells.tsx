"use client";
import React, { useRef, useCallback } from "react";

import type { SpellType } from "../types";
import { setupSpriteCanvas, useSpriteTicker, SPRITE_PAD } from "./hooks";

export const SpellSprite: React.FC<{
  type: SpellType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 36, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = Math.ceil(size * SPRITE_PAD);
  const renderSpell = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = setupSpriteCanvas(canvas, canvasSize, canvasSize);
      if (!ctx) {
        return;
      }
      const offset = (canvasSize - size) / 2;
      ctx.translate(offset, offset);
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
            const auraGrad = ctx.createRadialGradient(
              cx,
              cy,
              0,
              cx,
              cy,
              layerRadius
            );
            auraGrad.addColorStop(
              0,
              `rgba(255, 200, 50, ${0.15 - layer * 0.03})`
            );
            auraGrad.addColorStop(
              0.5,
              `rgba(255, 80, 0, ${0.12 - layer * 0.02})`
            );
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
              const py =
                cy + Math.sin(angle) * dist - Math.sin(t * 4 + i) * 2.5 * scale;
              const particleSize = (1.8 + Math.sin(t * 5 + i) * 0.6) * scale;
              const particleGrad = ctx.createRadialGradient(
                px,
                py,
                0,
                px,
                py,
                particleSize * 2
              );
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
          ctx.shadowBlur = 6 * scale;
          const coreGrad = ctx.createRadialGradient(
            cx - 2.5 * scale,
            cy - 2.5 * scale,
            0,
            cx,
            cy,
            14 * scale * pulseScale
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
              if (j === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          }
          ctx.restore();

          // Rising flame tongues
          ctx.shadowBlur = 4 * scale;
          for (let i = 0; i < 5; i++) {
            const flameAngle =
              (i * Math.PI * 2) / 5 +
              (animated ? Math.sin(t * 2 + i) * 0.3 : 0);
            const flameHeight =
              (7 + (animated ? Math.sin(t * 5 + i * 2) * 3.5 : 0)) * scale;
            const baseX = cx + Math.cos(flameAngle) * 7 * scale;
            const baseY = cy + Math.sin(flameAngle) * 7 * scale;
            const tipX =
              cx + Math.cos(flameAngle) * (12 + flameHeight / scale) * scale;
            const tipY =
              cy + Math.sin(flameAngle) * (12 + flameHeight / scale) * scale;

            const flameGrad = ctx.createLinearGradient(
              baseX,
              baseY,
              tipX,
              tipY
            );
            flameGrad.addColorStop(0, "#ffff88");
            flameGrad.addColorStop(0.4, "#ff8800");
            flameGrad.addColorStop(1, "rgba(200, 0, 0, 0)");
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            const perpX = Math.cos(flameAngle + Math.PI / 2) * 3 * scale;
            const perpY = Math.sin(flameAngle + Math.PI / 2) * 3 * scale;
            ctx.quadraticCurveTo(
              baseX + perpX,
              baseY + perpY,
              cx + Math.cos(flameAngle) * 5 * scale,
              cy + Math.sin(flameAngle) * 5 * scale
            );
            ctx.quadraticCurveTo(baseX - perpX, baseY - perpY, tipX, tipY);
            ctx.fill();
          }

          // Bright center highlight
          ctx.shadowBlur = 0;
          const highlightGrad = ctx.createRadialGradient(
            cx - 2.5 * scale,
            cy - 2.5 * scale,
            0,
            cx,
            cy,
            6 * scale
          );
          highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          highlightGrad.addColorStop(0.5, "rgba(255, 255, 200, 0.4)");
          highlightGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
          ctx.fillStyle = highlightGrad;
          ctx.beginPath();
          ctx.arc(
            cx - 2.5 * scale,
            cy - 2.5 * scale,
            6 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        }
        case "lightning": {
          // === THUNDERSTRIKE - Crackling electric devastation ===
          const flickerIntensity = animated ? 0.7 + Math.random() * 0.3 : 1;
          const boltOffset = animated ? (Math.random() - 0.5) * 2 * scale : 0;

          // Electric storm aura
          const stormGrad = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            18 * scale
          );
          stormGrad.addColorStop(
            0,
            `rgba(200, 220, 255, ${0.3 * flickerIntensity})`
          );
          stormGrad.addColorStop(
            0.4,
            `rgba(100, 150, 255, ${0.2 * flickerIntensity})`
          );
          stormGrad.addColorStop(
            0.7,
            `rgba(80, 100, 200, ${0.1 * flickerIntensity})`
          );
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
          ctx.shadowBlur = 6 * scale * flickerIntensity;
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
          ctx.shadowBlur = 4 * scale * flickerIntensity;
          ctx.strokeStyle = `rgba(200, 220, 255, ${0.9 * flickerIntensity})`;
          ctx.lineWidth = 3.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx + 2 * scale + boltOffset, cy - 16 * scale);
          ctx.lineTo(cx - 4 * scale + boltOffset * 0.5, cy - 4 * scale);
          ctx.lineTo(cx + 4 * scale + boltOffset * 0.3, cy - 2 * scale);
          ctx.lineTo(cx - 2 * scale + boltOffset * 0.7, cy + 16 * scale);
          ctx.stroke();

          // Hot white core
          ctx.shadowBlur = 3 * scale * flickerIntensity;
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
          ctx.shadowBlur = 3 * scale * flickerIntensity;
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
          ctx.shadowBlur = 5 * scale * flickerIntensity;
          ctx.shadowColor = "#ffffff";
          const topOrbGrad = ctx.createRadialGradient(
            cx + 2 * scale + boltOffset,
            cy - 16 * scale,
            0,
            cx + 2 * scale + boltOffset,
            cy - 16 * scale,
            4 * scale
          );
          topOrbGrad.addColorStop(0, "#ffffff");
          topOrbGrad.addColorStop(0.4, "rgba(200, 220, 255, 0.8)");
          topOrbGrad.addColorStop(1, "rgba(100, 150, 255, 0)");
          ctx.fillStyle = topOrbGrad;
          ctx.beginPath();
          ctx.arc(
            cx + 2 * scale + boltOffset,
            cy - 16 * scale,
            4 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const bottomOrbGrad = ctx.createRadialGradient(
            cx - 2 * scale + boltOffset * 0.7,
            cy + 16 * scale,
            0,
            cx - 2 * scale + boltOffset * 0.7,
            cy + 16 * scale,
            5 * scale
          );
          bottomOrbGrad.addColorStop(0, "#ffffff");
          bottomOrbGrad.addColorStop(0.3, "rgba(200, 220, 255, 0.9)");
          bottomOrbGrad.addColorStop(0.6, "rgba(150, 180, 255, 0.5)");
          bottomOrbGrad.addColorStop(1, "rgba(100, 150, 255, 0)");
          ctx.fillStyle = bottomOrbGrad;
          ctx.beginPath();
          ctx.arc(
            cx - 2 * scale + boltOffset * 0.7,
            cy + 16 * scale,
            5 * scale,
            0,
            Math.PI * 2
          );
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
          const mistGrad = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            18 * scale
          );
          mistGrad.addColorStop(
            0,
            `rgba(200, 240, 255, ${0.3 * pulseIntensity})`
          );
          mistGrad.addColorStop(
            0.5,
            `rgba(100, 200, 255, ${0.15 * pulseIntensity})`
          );
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
            cx - 1 * scale,
            cy - 1 * scale,
            0,
            cx,
            cy,
            5 * scale
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
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();

          // Bright center highlight
          ctx.shadowBlur = 0;
          const highlightGrad = ctx.createRadialGradient(
            cx - 1 * scale,
            cy - 1 * scale,
            0,
            cx,
            cy,
            2.5 * scale
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
        case "hex_ward": {
          // === HEX WARD - occult curse sigil with watchful eye ===
          const rotationAngle = animated ? t * 0.7 : 0;
          const pulseScale = animated ? 1 + Math.sin(t * 3.5) * 0.06 : 1;
          const runePulse = animated ? 0.7 + Math.sin(t * 5.5) * 0.3 : 1;

          const auraGrad = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            18 * scale
          );
          auraGrad.addColorStop(0, `rgba(232, 121, 249, ${0.28 * pulseScale})`);
          auraGrad.addColorStop(
            0.5,
            `rgba(168, 85, 247, ${0.16 * pulseScale})`
          );
          auraGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rotationAngle);
          ctx.strokeStyle = `rgba(232, 121, 249, ${0.8 * runePulse})`;
          ctx.shadowColor = "#d946ef";
          ctx.shadowBlur = 8 * scale * runePulse;
          ctx.lineWidth = 1.6 * scale;

          // Outer hexagon
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI) / 3;
            const px = Math.cos(angle) * 15 * scale * pulseScale;
            const py = Math.sin(angle) * 15 * scale * pulseScale;
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();

          // Inner triangle lattice
          ctx.beginPath();
          for (let i = 0; i <= 3; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
            const px = Math.cos(angle) * 9.5 * scale;
            const py = Math.sin(angle) * 9.5 * scale;
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
          ctx.rotate(Math.PI);
          ctx.beginPath();
          for (let i = 0; i <= 3; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
            const px = Math.cos(angle) * 9.5 * scale;
            const py = Math.sin(angle) * 9.5 * scale;
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
          ctx.restore();

          // Orbiting rune shards
          if (animated) {
            for (let i = 0; i < 6; i++) {
              const shardAngle = t * 1.6 + (i * Math.PI * 2) / 6;
              const sx = cx + Math.cos(shardAngle) * 14 * scale;
              const sy = cy + Math.sin(shardAngle) * 8 * scale;
              const shardSize = (1.8 + Math.sin(t * 6 + i) * 0.4) * scale;
              ctx.fillStyle = `rgba(244, 114, 182, ${0.65 + Math.sin(t * 4 + i) * 0.15})`;
              ctx.beginPath();
              ctx.moveTo(sx, sy - shardSize);
              ctx.lineTo(sx + shardSize * 0.7, sy);
              ctx.lineTo(sx, sy + shardSize);
              ctx.lineTo(sx - shardSize * 0.7, sy);
              ctx.closePath();
              ctx.fill();
            }
          }

          // Central eye
          const eyeGrad = ctx.createLinearGradient(
            cx - 8 * scale,
            cy,
            cx + 8 * scale,
            cy
          );
          eyeGrad.addColorStop(0, "#4c1d95");
          eyeGrad.addColorStop(0.5, "#c084fc");
          eyeGrad.addColorStop(1, "#4c1d95");
          ctx.fillStyle = eyeGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 9 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#1f1135";
          ctx.beginPath();
          ctx.ellipse(cx, cy, 4.5 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          const irisGrad = ctx.createRadialGradient(
            cx - 1.2 * scale,
            cy - 1.2 * scale,
            0,
            cx,
            cy,
            3.4 * scale
          );
          irisGrad.addColorStop(0, "rgba(255,255,255,0.95)");
          irisGrad.addColorStop(0.35, "#f5d0fe");
          irisGrad.addColorStop(0.7, "#e879f9");
          irisGrad.addColorStop(1, "#7e22ce");
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, 3.4 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(
            cx - 1.2 * scale,
            cy - 1.4 * scale,
            1.2 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        }
        case "payday": {
          // === FORTUNE'S BLESSING - Divine golden treasure magic ===
          const rotationAngle = animated ? t * 0.5 : 0;
          const pulseScale = animated ? 1 + Math.sin(t * 3) * 0.06 : 1;
          const shimmer = animated ? Math.sin(t * 6) : 0;

          // Divine golden aura
          const auraGrad = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            18 * scale
          );
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
          ctx.shadowBlur = 5 * scale;

          for (let i = 3; i >= 0; i--) {
            const coinY = cy + 4 * scale - i * 4 * scale;
            const coinScale = 1 - i * 0.05;

            // Coin edge (3D depth)
            if (i < 3) {
              ctx.fillStyle = "#a67c00";
              ctx.beginPath();
              ctx.ellipse(
                cx,
                coinY + 2 * scale,
                11 * scale * coinScale,
                5.5 * scale * coinScale,
                0,
                0,
                Math.PI
              );
              ctx.fill();
            }

            // Main coin face gradient
            const coinGrad = ctx.createLinearGradient(
              cx - 10 * scale,
              coinY - 5 * scale,
              cx + 10 * scale,
              coinY + 5 * scale
            );
            coinGrad.addColorStop(0, "#fff5b8");
            coinGrad.addColorStop(0.2, "#ffd700");
            coinGrad.addColorStop(0.5, "#ffec8b");
            coinGrad.addColorStop(0.8, "#daa520");
            coinGrad.addColorStop(1, "#b8860b");
            ctx.fillStyle = coinGrad;
            ctx.beginPath();
            ctx.ellipse(
              cx,
              coinY,
              11 * scale * coinScale,
              5.5 * scale * coinScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Coin rim
            ctx.strokeStyle = "#8b6914";
            ctx.lineWidth = 1.2 * scale;
            ctx.stroke();

            // Inner decorative circle
            ctx.strokeStyle = `rgba(139, 105, 20, ${0.6 + shimmer * 0.2})`;
            ctx.lineWidth = 0.8 * scale;
            ctx.beginPath();
            ctx.ellipse(
              cx,
              coinY,
              8 * scale * coinScale,
              4 * scale * coinScale,
              0,
              0,
              Math.PI * 2
            );
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
            cx - 5 * scale,
            cy - 12 * scale,
            cx + 5 * scale,
            cy - 2 * scale
          );
          dollarGrad.addColorStop(0, "#5a4a10");
          dollarGrad.addColorStop(0.5, "#8b6914");
          dollarGrad.addColorStop(1, "#5a4a10");
          ctx.fillStyle = dollarGrad;
          ctx.fillText("$", cx, cy - 7 * scale);

          // Radiant sparkle bursts
          ctx.shadowColor = "#ffdd00";
          ctx.shadowBlur = 3 * scale;
          const sparklePositions = [
            { phase: 0, size: 2.5, x: -13, y: -8 },
            { phase: 1, size: 2.2, x: 13, y: -6 },
            { phase: 2, size: 2, x: -11, y: 6 },
            { phase: 3, size: 2.3, x: 12, y: 8 },
            { phase: 4, size: 2.8, x: 0, y: -14 },
          ];
          sparklePositions.forEach(({ x, y, size, phase }) => {
            const sparkAlpha = animated
              ? 0.6 + Math.sin(t * 4 + phase) * 0.4
              : 0.8;
            const sparkScale = animated
              ? size * (0.8 + Math.sin(t * 5 + phase) * 0.3)
              : size;
            ctx.fillStyle = `rgba(255, 255, 220, ${sparkAlpha})`;

            // Draw 4-pointed sparkle
            ctx.beginPath();
            ctx.moveTo(cx + x * scale, cy + y * scale - sparkScale * scale);
            ctx.lineTo(
              cx + x * scale + sparkScale * 0.3 * scale,
              cy + y * scale
            );
            ctx.lineTo(cx + x * scale, cy + y * scale + sparkScale * scale);
            ctx.lineTo(
              cx + x * scale - sparkScale * 0.3 * scale,
              cy + y * scale
            );
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx + x * scale - sparkScale * scale, cy + y * scale);
            ctx.lineTo(
              cx + x * scale,
              cy + y * scale + sparkScale * 0.3 * scale
            );
            ctx.lineTo(cx + x * scale + sparkScale * scale, cy + y * scale);
            ctx.lineTo(
              cx + x * scale,
              cy + y * scale - sparkScale * 0.3 * scale
            );
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
          const summonAura = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            18 * scale
          );
          summonAura.addColorStop(
            0,
            `rgba(150, 100, 255, ${0.25 * pulseIntensity})`
          );
          summonAura.addColorStop(
            0.5,
            `rgba(100, 50, 200, ${0.15 * pulseIntensity})`
          );
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
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
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
              ctx.arc(
                cx + particleX * scale,
                cy + particleY * scale,
                1.2 * scale,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }

          // Three heroic figures
          const warriors = [
            { armor: "#7744dd", delay: 0, x: -9, y: 3 },
            { armor: "#7744dd", delay: 1, x: 9, y: 3 },
            { armor: "#9966ff", delay: 2, x: 0, y: -5 },
          ];

          warriors.forEach(({ x, y, armor, delay }) => {
            const yOffset = animated ? Math.sin(t * 2 + delay) * 1.5 : 0;
            const glowIntensity = animated
              ? 0.7 + Math.sin(t * 3 + delay) * 0.3
              : 1;
            const wx = cx + x * scale;
            const wy = cy + y * scale - yOffset * scale;

            // Warrior glow aura
            const warriorAura = ctx.createRadialGradient(
              wx,
              wy,
              0,
              wx,
              wy,
              8 * scale
            );
            warriorAura.addColorStop(
              0,
              `rgba(150, 100, 255, ${0.2 * glowIntensity})`
            );
            warriorAura.addColorStop(1, "rgba(100, 50, 200, 0)");
            ctx.fillStyle = warriorAura;
            ctx.beginPath();
            ctx.arc(wx, wy, 8 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Body/Cape
            const capeGrad = ctx.createLinearGradient(
              wx - 5 * scale,
              wy,
              wx + 5 * scale,
              wy
            );
            capeGrad.addColorStop(0, "#4a2288");
            capeGrad.addColorStop(0.5, armor);
            capeGrad.addColorStop(1, "#4a2288");
            ctx.fillStyle = capeGrad;
            ctx.beginPath();
            ctx.moveTo(wx, wy - 2 * scale);
            ctx.quadraticCurveTo(
              wx - 7 * scale,
              wy + 2 * scale,
              wx - 5 * scale,
              wy + 9 * scale
            );
            ctx.lineTo(wx - 3 * scale, wy + 7 * scale);
            ctx.lineTo(wx, wy + 9 * scale);
            ctx.lineTo(wx + 3 * scale, wy + 7 * scale);
            ctx.lineTo(wx + 5 * scale, wy + 9 * scale);
            ctx.quadraticCurveTo(
              wx + 7 * scale,
              wy + 2 * scale,
              wx,
              wy - 2 * scale
            );
            ctx.fill();

            // Armor chestplate
            ctx.fillStyle = "#5533aa";
            ctx.beginPath();
            ctx.ellipse(
              wx,
              wy + 1 * scale,
              4 * scale,
              5 * scale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Head
            ctx.fillStyle = "#ffdbac";
            ctx.beginPath();
            ctx.arc(wx, wy - 5 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Helmet
            const helmetGrad = ctx.createLinearGradient(
              wx - 4 * scale,
              wy - 8 * scale,
              wx + 4 * scale,
              wy - 4 * scale
            );
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
            ctx.ellipse(
              wx,
              wy - 10 * scale,
              1.5 * scale,
              3 * scale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Eyes (glowing)
            ctx.fillStyle = `rgba(200, 180, 255, ${glowIntensity})`;
            ctx.shadowColor = "#aa88ff";
            ctx.shadowBlur = 4 * scale * glowIntensity;
            ctx.beginPath();
            ctx.arc(
              wx - 1.5 * scale,
              wy - 5 * scale,
              1 * scale,
              0,
              Math.PI * 2
            );
            ctx.arc(
              wx + 1.5 * scale,
              wy - 5 * scale,
              1 * scale,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;

            // Shield (front warrior only)
            if (x === 0) {
              const shieldGrad = ctx.createLinearGradient(
                wx - 6 * scale,
                wy,
                wx + 2 * scale,
                wy
              );
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
    },
    [type, size, canvasSize, animated]
  );

  useSpriteTicker(animated, 30, renderSpell);

  return (
    <canvas ref={canvasRef} style={{ height: canvasSize, width: canvasSize }} />
  );
};
