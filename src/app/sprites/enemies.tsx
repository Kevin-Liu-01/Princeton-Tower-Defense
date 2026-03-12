"use client";
import React, { useRef, useCallback } from "react";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";

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
  | "athlete"
  | "tiger_fan"
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
  harpy: "#7c3aed",
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
  const renderEnemy = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupSpriteCanvas(canvas, size, size);
    if (!ctx) return;
    const cx = size / 2;
    let cy = size / 2;
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
        const beakOpen = Math.max(0, Math.sin(t * 5)) * 0.3;
        const tailSwish = Math.sin(t * 2.5) * 0.4;
        const maneWave = Math.sin(t * 3.5) * 0.1;

        // Spectral energy trail behind when animated
        if (animated) {
          for (let i = 0; i < 6; i++) {
            const trailAlpha = (1 - i / 6) * 0.15 * flamePulse;
            const trailY = cy + floatOffset - bounce + i * 2.5 * scale;
            const trailSize = (8 - i * 0.8) * scale;
            ctx.fillStyle = `rgba(6, 182, 212, ${trailAlpha})`;
            ctx.beginPath();
            ctx.ellipse(cx, trailY + 8 * scale, trailSize, trailSize * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Layered aura glow rings
        for (let ring = 3; ring >= 0; ring--) {
          const ringSize = (12 + ring * 3) * scale;
          const ringAlpha = flamePulse * (0.08 + ring * 0.04);
          const auraGrad = ctx.createRadialGradient(cx, cy - 2 * scale, ringSize * 0.6, cx, cy - 2 * scale, ringSize);
          auraGrad.addColorStop(0, `rgba(34, 211, 211, ${ringAlpha})`);
          auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(cx, cy - 2 * scale - bounce + floatOffset, ringSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tail with cyan flame tip
        ctx.save();
        ctx.translate(cx, cy + 10 * scale - bounce + floatOffset);
        ctx.rotate(0.3 + tailSwish);
        ctx.strokeStyle = "#22d3d3";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(6 * scale, 2 * scale, 10 * scale, -2 * scale);
        ctx.quadraticCurveTo(13 * scale, -5 * scale, 14 * scale, -3 * scale);
        ctx.stroke();
        // Flame tip
        const tipX = 14 * scale;
        const tipY = -3 * scale;
        const flameGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 4 * scale);
        flameGrad.addColorStop(0, `rgba(255, 255, 255, ${flamePulse * 0.8})`);
        flameGrad.addColorStop(0.3, `rgba(34, 211, 211, ${flamePulse * 0.7})`);
        flameGrad.addColorStop(0.6, `rgba(6, 182, 212, ${flamePulse * 0.4})`);
        flameGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(34, 211, 211, ${flamePulse})`;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY - 3 * scale);
        ctx.quadraticCurveTo(tipX + 1.5 * scale, tipY - 1 * scale, tipX + 2 * scale, tipY + 2 * scale);
        ctx.quadraticCurveTo(tipX, tipY + 0.5 * scale, tipX - 2 * scale, tipY + 2 * scale);
        ctx.quadraticCurveTo(tipX - 1.5 * scale, tipY - 1 * scale, tipX, tipY - 3 * scale);
        ctx.fill();
        ctx.restore();

        // Hind legs (lion clawed)
        for (const lx of [-1, 1]) {
          ctx.fillStyle = "#22d3d3";
          ctx.beginPath();
          ctx.ellipse(cx + lx * 4.5 * scale, cy + 10 * scale - bounce + floatOffset, 2.5 * scale, 5 * scale, lx * 0.15, 0, Math.PI * 2);
          ctx.fill();
          // Claws
          for (let c = 0; c < 3; c++) {
            ctx.fillStyle = "#a8a29e";
            ctx.beginPath();
            ctx.moveTo(cx + lx * (3 + c * 1.2) * scale, cy + 14.5 * scale - bounce + floatOffset);
            ctx.lineTo(cx + lx * (3.3 + c * 1.2) * scale, cy + 16.5 * scale - bounce + floatOffset);
            ctx.lineTo(cx + lx * (2.7 + c * 1.2) * scale, cy + 16 * scale - bounce + floatOffset);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Multi-layered wings - 3 layers with different cyan shades
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + side * 6 * scale, cy - 4 * scale - bounce + floatOffset);
          ctx.rotate(side * (0.5 + wingFlap));

          // Layer 3 (outermost, darkest)
          ctx.fillStyle = "#065f6c";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(side * 12 * scale, -8 * scale, side * 17 * scale, -1 * scale);
          ctx.quadraticCurveTo(side * 12 * scale, 4 * scale, 0, 3 * scale);
          ctx.fill();

          // Layer 2 (middle)
          ctx.fillStyle = "#0891b2";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(side * 10 * scale, -6.5 * scale, side * 14 * scale, 0);
          ctx.quadraticCurveTo(side * 10 * scale, 3 * scale, 0, 2.5 * scale);
          ctx.fill();

          // Layer 1 (innermost, brightest)
          ctx.fillStyle = "#22d3ee";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(side * 7 * scale, -4.5 * scale, side * 10 * scale, 0.5 * scale);
          ctx.quadraticCurveTo(side * 7 * scale, 2.5 * scale, 0, 2 * scale);
          ctx.fill();

          // Feather edge details
          ctx.strokeStyle = "rgba(165, 243, 252, 0.6)";
          ctx.lineWidth = 0.6 * scale;
          for (let f = 0; f < 5; f++) {
            const frac = (f + 1) / 6;
            const fx = side * 17 * frac * scale;
            const fy = -6 * frac * scale + 3 * frac * frac * scale;
            ctx.beginPath();
            ctx.moveTo(fx * 0.5, fy * 0.3);
            ctx.lineTo(fx, fy + 1 * scale);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Lion body
        const bodyGrad = ctx.createRadialGradient(cx, cy + 2 * scale - bounce + floatOffset, 2 * scale, cx, cy + 2 * scale - bounce + floatOffset, 10 * scale);
        bodyGrad.addColorStop(0, "#5eead4");
        bodyGrad.addColorStop(0.6, "#22d3d3");
        bodyGrad.addColorStop(1, "#0891b2");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * scale - bounce + floatOffset, 7 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tiger stripes on lion body
        ctx.strokeStyle = "rgba(8, 145, 178, 0.6)";
        ctx.lineWidth = 1 * scale;
        const stripeOffsets = [-4, -1.5, 1, 3.5, 6];
        for (const sOff of stripeOffsets) {
          ctx.beginPath();
          ctx.moveTo(cx - 4 * scale, cy + sOff * scale - bounce + floatOffset);
          ctx.quadraticCurveTo(cx, cy + (sOff - 1) * scale - bounce + floatOffset, cx + 4 * scale, cy + sOff * scale - bounce + floatOffset);
          ctx.stroke();
        }

        // Chest armor/harness
        ctx.fillStyle = "#71717a";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 4 * scale - bounce + floatOffset);
        ctx.lineTo(cx + 5 * scale, cy - 4 * scale - bounce + floatOffset);
        ctx.lineTo(cx + 4 * scale, cy + 2 * scale - bounce + floatOffset);
        ctx.lineTo(cx - 4 * scale, cy + 2 * scale - bounce + floatOffset);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#a1a1aa";
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
        // Rival emblem on chest
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * scale - bounce + floatOffset, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 3 * scale - bounce + floatOffset);
        ctx.lineTo(cx + 1 * scale, cy - 1 * scale - bounce + floatOffset);
        ctx.lineTo(cx - 1 * scale, cy - 1 * scale - bounce + floatOffset);
        ctx.closePath();
        ctx.stroke();
        // Harness straps
        ctx.strokeStyle = "#52525b";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 4 * scale - bounce + floatOffset);
        ctx.lineTo(cx - 6 * scale, cy - 6 * scale - bounce + floatOffset);
        ctx.moveTo(cx + 5 * scale, cy - 4 * scale - bounce + floatOffset);
        ctx.lineTo(cx + 6 * scale, cy - 6 * scale - bounce + floatOffset);
        ctx.stroke();

        // Front legs (eagle taloned)
        for (const lx of [-1, 1]) {
          ctx.fillStyle = "#5eead4";
          ctx.beginPath();
          ctx.ellipse(cx + lx * 5 * scale, cy + 8 * scale - bounce + floatOffset, 2 * scale, 4.5 * scale, lx * 0.1, 0, Math.PI * 2);
          ctx.fill();
          // Talons
          for (let tc = 0; tc < 3; tc++) {
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.moveTo(cx + lx * (4 + tc * 1) * scale, cy + 12 * scale - bounce + floatOffset);
            ctx.lineTo(cx + lx * (4.3 + tc * 1) * scale, cy + 14.5 * scale - bounce + floatOffset);
            ctx.lineTo(cx + lx * (3.7 + tc * 1) * scale, cy + 14 * scale - bounce + floatOffset);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Mane around neck/head transition
        ctx.fillStyle = "#2dd4bf";
        for (let m = 0; m < 10; m++) {
          const ma = (m / 10) * Math.PI * 2 + maneWave;
          const mr = 5.5 * scale;
          const mx = cx + Math.cos(ma) * mr;
          const my = cy - 7 * scale - bounce + floatOffset + Math.sin(ma) * mr * 0.4;
          ctx.beginPath();
          ctx.ellipse(mx, my, 2 * scale, 3 * scale, ma + Math.PI * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eagle head
        const headGrad = ctx.createRadialGradient(cx, cy - 10 * scale - bounce + floatOffset, 1 * scale, cx, cy - 10 * scale - bounce + floatOffset, 6 * scale);
        headGrad.addColorStop(0, "#a7f3d0");
        headGrad.addColorStop(0.5, "#5eead4");
        headGrad.addColorStop(1, "#2dd4bf");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * scale - bounce + floatOffset, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Ear tufts (owl-like)
        for (const ex of [-1, 1]) {
          ctx.fillStyle = "#14b8a6";
          ctx.beginPath();
          ctx.moveTo(cx + ex * 4 * scale, cy - 14 * scale - bounce + floatOffset);
          ctx.lineTo(cx + ex * 5.5 * scale, cy - 20 * scale - bounce + floatOffset);
          ctx.lineTo(cx + ex * 3 * scale, cy - 15 * scale - bounce + floatOffset);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#5eead4";
          ctx.beginPath();
          ctx.moveTo(cx + ex * 4.2 * scale, cy - 15 * scale - bounce + floatOffset);
          ctx.lineTo(cx + ex * 5 * scale, cy - 19 * scale - bounce + floatOffset);
          ctx.lineTo(cx + ex * 3.5 * scale, cy - 15.5 * scale - bounce + floatOffset);
          ctx.closePath();
          ctx.fill();
        }

        // Detailed beak with open/close
        ctx.fillStyle = "#fbbf24";
        // Upper beak
        ctx.beginPath();
        ctx.moveTo(cx - 2.5 * scale, cy - 8.5 * scale - bounce + floatOffset);
        ctx.quadraticCurveTo(cx, cy - 10 * scale - bounce + floatOffset, cx + 2.5 * scale, cy - 8.5 * scale - bounce + floatOffset);
        ctx.lineTo(cx, cy - 5 * scale - bounce + floatOffset);
        ctx.closePath();
        ctx.fill();
        // Lower beak (animated open)
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(cx - 1.8 * scale, cy - 7 * scale - bounce + floatOffset);
        ctx.lineTo(cx, cy - (4 - beakOpen * 3) * scale - bounce + floatOffset);
        ctx.lineTo(cx + 1.8 * scale, cy - 7 * scale - bounce + floatOffset);
        ctx.closePath();
        ctx.fill();
        // Beak edge highlight
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 0.4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2.5 * scale, cy - 8.5 * scale - bounce + floatOffset);
        ctx.lineTo(cx, cy - 5 * scale - bounce + floatOffset);
        ctx.lineTo(cx + 2.5 * scale, cy - 8.5 * scale - bounce + floatOffset);
        ctx.stroke();

        // Glowing eyes - layered glow
        for (const ex of [-1, 1]) {
          const eyeX = cx + ex * 2.5 * scale;
          const eyeY = cy - 12 * scale - bounce + floatOffset;
          ctx.fillStyle = `rgba(34, 211, 211, ${flamePulse * 0.3})`;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 3 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(34, 211, 211, ${flamePulse * 0.6})`;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 1.3 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 0.6 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "archer": {
        cy += 4 * scale;
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
        cy += 4 * scale;
        // MAGE PROFESSOR - Powerful spellcaster with arcane staff
        const magicPulse = 0.6 + Math.sin(t * 3) * 0.4;
        const orbFloat = Math.sin(t * 2) * 2 * scale;
        const runeRotation = t * 0.8;
        const particleTime = t * 2;
        const bookHover = Math.sin(t * 1.8) * 1.5 * scale;
        const robeWave = Math.sin(t * 1.2) * 1.5;

        // --- ENHANCED LAYERED MAGICAL AURA ---
        const outerAura = ctx.createRadialGradient(
          cx, cy - 4 * scale, 2 * scale,
          cx, cy - 4 * scale, 18 * scale
        );
        outerAura.addColorStop(0, `rgba(139, 92, 246, ${magicPulse * 0.1})`);
        outerAura.addColorStop(0.5, `rgba(109, 40, 217, ${magicPulse * 0.06})`);
        outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        const innerAura = ctx.createRadialGradient(
          cx, cy - 2 * scale, 0,
          cx, cy - 2 * scale, 14 * scale
        );
        innerAura.addColorStop(0, `rgba(167, 139, 250, ${magicPulse * 0.25})`);
        innerAura.addColorStop(0.7, `rgba(139, 92, 246, ${magicPulse * 0.1})`);
        innerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // --- ARCANE RUNE CIRCLE AT FEET ---
        ctx.save();
        ctx.translate(cx, cy + 14 * scale - bounce);
        ctx.rotate(runeRotation);

        ctx.strokeStyle = `rgba(139, 92, 246, ${magicPulse * 0.4})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(167, 139, 250, ${magicPulse * 0.3})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Rune symbols around the circle
        ctx.fillStyle = `rgba(196, 181, 253, ${magicPulse * 0.5})`;
        for (let ri = 0; ri < 6; ri++) {
          const ra = (ri / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(ra) * 9.5 * scale, Math.sin(ra) * 3 * scale, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // --- FLOWING ROBES (multi-layer with tattered hem) ---
        // Back robe layer (darker)
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, cy + 15 * scale - bounce);
        ctx.quadraticCurveTo(cx - 12 * scale, cy + 2 * scale - bounce, cx - 6 * scale, cy - 8 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx + 12 * scale, cy + 2 * scale - bounce, cx + 10 * scale, cy + 15 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Main robe body
        const robeGrad = ctx.createLinearGradient(cx - 9 * scale, cy, cx + 9 * scale, cy);
        robeGrad.addColorStop(0, "#4c1d95");
        robeGrad.addColorStop(0.3, "#6d28d9");
        robeGrad.addColorStop(0.5, "#7c3aed");
        robeGrad.addColorStop(0.7, "#6d28d9");
        robeGrad.addColorStop(1, "#4c1d95");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(cx - 11 * scale, cy - bounce, cx - 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 11 * scale, cy - bounce, cx + 9 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Tattered hem
        ctx.fillStyle = "#4c1d95";
        for (let hi = 0; hi < 7; hi++) {
          const hx = cx + (hi - 3) * 2.8 * scale;
          const hy = cy + 14 * scale - bounce;
          const hLen = (1.5 + Math.sin(hi * 1.3) * 1) * scale + robeWave * 0.2 * scale;
          ctx.beginPath();
          ctx.moveTo(hx - 1.2 * scale, hy);
          ctx.lineTo(hx, hy + hLen);
          ctx.lineTo(hx + 1.2 * scale, hy);
          ctx.closePath();
          ctx.fill();
        }

        // Robe embroidery - arcane symbols
        ctx.strokeStyle = `rgba(196, 181, 253, ${0.25 + magicPulse * 0.15})`;
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy + 2 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy + 5 * scale - bounce);
        ctx.lineTo(cx - 2 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy + 7 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy + 1 * scale - bounce);
        ctx.lineTo(cx + 2 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 5 * scale - bounce);
        ctx.lineTo(cx + 3 * scale, cy + 8 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 2 * scale - bounce);
        ctx.lineTo(cx, cy + 10 * scale - bounce);
        ctx.stroke();

        // Robe fold shadows
        ctx.strokeStyle = "rgba(30, 10, 60, 0.2)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(cx - 5 * scale, cy + 4 * scale - bounce, cx - 6 * scale, cy + 13 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(cx + 5 * scale, cy + 4 * scale - bounce, cx + 6 * scale, cy + 13 * scale - bounce);
        ctx.stroke();

        // --- SHOULDER CAPE / COLLAR ---
        const capeGrad = ctx.createLinearGradient(
          cx - 8 * scale, cy - 10 * scale,
          cx + 8 * scale, cy - 8 * scale
        );
        capeGrad.addColorStop(0, "#5b21b6");
        capeGrad.addColorStop(0.5, "#7c3aed");
        capeGrad.addColorStop(1, "#5b21b6");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx - 9 * scale, cy - 10 * scale - bounce, cx - 4 * scale, cy - 12 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 12 * scale - bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy - 10 * scale - bounce, cx + 8 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx, cy - 4 * scale - bounce, cx - 8 * scale, cy - 6 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Cape ornate trim
        ctx.strokeStyle = "#ddd6fe";
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx - 9 * scale, cy - 10 * scale - bounce, cx - 4 * scale, cy - 12 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale, cy - 6 * scale - bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy - 10 * scale - bounce, cx + 4 * scale, cy - 12 * scale - bounce);
        ctx.stroke();

        // --- BELT WITH POUCHES & POTIONS ---
        ctx.fillStyle = "#78350f";
        ctx.fillRect(cx - 6 * scale, cy + 1 * scale - bounce, 12 * scale, 1.8 * scale);

        // Belt buckle
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(cx - 1.2 * scale, cy + 0.6 * scale - bounce, 2.4 * scale, 2.4 * scale);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(cx - 0.5 * scale, cy + 1 * scale - bounce, 1 * scale, 1.2 * scale);

        // Left pouch
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 2.8 * scale - bounce);
        ctx.quadraticCurveTo(cx - 5.5 * scale, cy + 5 * scale - bounce, cx - 4 * scale, cy + 5 * scale - bounce);
        ctx.lineTo(cx - 3 * scale, cy + 2.8 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Right potion bottle
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(cx + 4.5 * scale, cy + 4 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#92400e";
        ctx.fillRect(cx + 4 * scale, cy + 2.5 * scale - bounce, 1 * scale, 1.2 * scale);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(cx + 4.2 * scale, cy + 3.7 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // --- FACE DETAIL ---
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 13 * scale - bounce, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Skin shadow under hat brim
        ctx.fillStyle = "rgba(180, 140, 80, 0.2)";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15 * scale - bounce, 4 * scale, 1.5 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Determined brow ridge
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 14.5 * scale - bounce);
        ctx.lineTo(cx - 1 * scale, cy - 15 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy - 14.5 * scale - bounce);
        ctx.lineTo(cx + 1 * scale, cy - 15 * scale - bounce);
        ctx.stroke();

        // Eyes with layered glow
        ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale, cy - 14 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy - 14 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        ctx.arc(cx - 1.5 * scale, cy - 14 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * scale, cy - 14 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(cx - 1.8 * scale, cy - 14.3 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1.2 * scale, cy - 14.3 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Mouth - determined expression
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 1.5 * scale, cy - 11.5 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy - 11.5 * scale - bounce);
        ctx.stroke();

        // --- DETAILED WIZARD HAT ---
        const hatGrad = ctx.createLinearGradient(cx, cy - 32 * scale, cx, cy - 16 * scale);
        hatGrad.addColorStop(0, "#1e0533");
        hatGrad.addColorStop(0.4, "#3b0764");
        hatGrad.addColorStop(1, "#4c1d95");
        ctx.fillStyle = hatGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 16 * scale - bounce);
        ctx.quadraticCurveTo(cx - 3 * scale, cy - 24 * scale - bounce, cx + 2 * scale, cy - 32 * scale - bounce);
        ctx.quadraticCurveTo(cx + 4 * scale, cy - 30 * scale - bounce, cx + 3 * scale, cy - 28 * scale - bounce);
        ctx.quadraticCurveTo(cx + 1 * scale, cy - 22 * scale - bounce, cx + 6 * scale, cy - 16 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Hat brim
        const brimGrad = ctx.createLinearGradient(cx - 8 * scale, cy - 17 * scale, cx + 8 * scale, cy - 16 * scale);
        brimGrad.addColorStop(0, "#2e0550");
        brimGrad.addColorStop(0.5, "#4c1d95");
        brimGrad.addColorStop(1, "#2e0550");
        ctx.fillStyle = brimGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 16.5 * scale - bounce, 8 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat band
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(cx - 6 * scale, cy - 18 * scale - bounce, 12 * scale, 1.5 * scale);

        // Hat buckle
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx - 1.5 * scale, cy - 19 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy - 19 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale, cy - 17 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#3b0764";
        ctx.fillRect(cx - 0.7 * scale, cy - 18.5 * scale - bounce, 1.4 * scale, 1 * scale);

        // Hat star decoration
        ctx.fillStyle = `rgba(196, 181, 253, ${0.3 + magicPulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 22 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // --- HANDS WITH ARCANE ENERGY ---
        // Left hand
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx - 7 * scale, cy - 3 * scale - bounce, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Fingers
        for (let fi = 0; fi < 4; fi++) {
          const fa = -0.8 + fi * 0.4;
          ctx.fillStyle = "#fef3c7";
          ctx.beginPath();
          ctx.ellipse(
            cx - 7 * scale + Math.cos(fa) * 2.2 * scale,
            cy - 3 * scale - bounce + Math.sin(fa) * 2.2 * scale,
            0.5 * scale, 1 * scale, fa, 0, Math.PI * 2
          );
          ctx.fill();
        }

        // Arcane sparks between fingers
        if (animated) {
          ctx.fillStyle = `rgba(167, 139, 250, ${magicPulse * 0.6})`;
          for (let si = 0; si < 3; si++) {
            const sparkX = cx - 7 * scale + Math.sin(t * 5 + si * 2) * 2 * scale;
            const sparkY = cy - 3 * scale - bounce + Math.cos(t * 5 + si * 2) * 2 * scale;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 0.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- ENHANCED STAFF ---
        // Staff shaft with wood grain
        const staffGrad = ctx.createLinearGradient(
          cx + 10 * scale, cy - 14 * scale,
          cx + 12 * scale, cy + 12 * scale
        );
        staffGrad.addColorStop(0, "#92400e");
        staffGrad.addColorStop(0.3, "#78350f");
        staffGrad.addColorStop(0.6, "#92400e");
        staffGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = staffGrad;
        ctx.fillRect(cx + 10 * scale, cy - 14 * scale - bounce, 2 * scale, 26 * scale);

        // Staff metal rings
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(cx + 9.5 * scale, cy - 13 * scale - bounce, 3 * scale, 1 * scale);
        ctx.fillRect(cx + 9.5 * scale, cy - 8 * scale - bounce, 3 * scale, 0.8 * scale);
        ctx.fillRect(cx + 9.5 * scale, cy + 8 * scale - bounce, 3 * scale, 1 * scale);

        // Staff bottom cap
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy + 12 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Orb cradle prongs
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 10 * scale, cy - 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 8 * scale, cy - 17 * scale - bounce + orbFloat,
          cx + 9 * scale, cy - 18 * scale - bounce + orbFloat
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 12 * scale, cy - 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 14 * scale, cy - 17 * scale - bounce + orbFloat,
          cx + 13 * scale, cy - 18 * scale - bounce + orbFloat
        );
        ctx.stroke();

        // Staff orb - layered crystal glow
        ctx.fillStyle = `rgba(109, 40, 217, ${magicPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 17 * scale - bounce + orbFloat, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 17 * scale - bounce + orbFloat, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(167, 139, 250, ${magicPulse * 0.7})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 17 * scale - bounce + orbFloat, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(221, 214, 254, ${magicPulse})`;
        ctx.beginPath();
        ctx.arc(cx + 11 * scale, cy - 17 * scale - bounce + orbFloat, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Orb inner energy swirl
        if (animated) {
          ctx.strokeStyle = `rgba(221, 214, 254, ${magicPulse * 0.5})`;
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.arc(cx + 11 * scale, cy - 17 * scale - bounce + orbFloat, 2.5 * scale, t * 2, t * 2 + Math.PI);
          ctx.stroke();
        }

        // --- OPEN SPELLBOOK floating near hip ---
        ctx.save();
        ctx.translate(cx - 9 * scale, cy + 2 * scale - bounce + bookHover);
        ctx.rotate(-0.15);

        ctx.fillStyle = "#78350f";
        ctx.fillRect(-3 * scale, -2 * scale, 6 * scale, 4.5 * scale);
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(-2.5 * scale, -1.5 * scale, 2.2 * scale, 3.5 * scale);
        ctx.fillRect(0.3 * scale, -1.5 * scale, 2.2 * scale, 3.5 * scale);
        ctx.fillStyle = "#5a2508";
        ctx.fillRect(-0.3 * scale, -2 * scale, 0.6 * scale, 4.5 * scale);

        // Arcane text lines
        ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + magicPulse * 0.3})`;
        for (let li = 0; li < 3; li++) {
          ctx.fillRect(-2 * scale, (-0.8 + li * 1) * scale, 1.5 * scale, 0.3 * scale);
          ctx.fillRect(0.6 * scale, (-0.8 + li * 1) * scale, 1.5 * scale, 0.3 * scale);
        }

        // Book glow
        const bookGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 4 * scale);
        bookGlow.addColorStop(0, `rgba(139, 92, 246, ${magicPulse * 0.15})`);
        bookGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bookGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // --- FLOATING ARCANE PARTICLES ---
        if (animated) {
          ctx.fillStyle = `rgba(196, 181, 253, ${magicPulse * 0.6})`;
          for (let pi = 0; pi < 8; pi++) {
            const pAngle = particleTime + pi * (Math.PI * 2 / 8);
            const pRadius = (8 + Math.sin(t * 1.5 + pi) * 3) * scale;
            const px = cx + Math.cos(pAngle) * pRadius;
            const py = cy - 4 * scale - bounce + Math.sin(pAngle) * pRadius * 0.5 + Math.sin(t * 2 + pi * 0.7) * 2 * scale;
            const pSize = (0.4 + Math.sin(t * 3 + pi) * 0.2) * scale;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

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
        // STORM HARPY - Majestic terror of the skies with iridescent plumage
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
              ctx.fillStyle = `rgba(167, 139, 250, ${emberAlpha * 0.5})`;
              ctx.beginPath();
              ctx.arc(emberX, emberY, emberSize * 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = `rgba(167, 139, 250, ${emberAlpha})`;
              ctx.beginPath();
              ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Multi-layer flame aura
        const outerAura = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 22 * scale);
        outerAura.addColorStop(0, `rgba(167, 139, 250, ${flamePulse * 0.15})`);
        outerAura.addColorStop(0.5, `rgba(124, 58, 237, ${flamePulse * 0.08})`);
        outerAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAura;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        const innerAura = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 14 * scale);
        innerAura.addColorStop(0, `rgba(139, 92, 246, ${flamePulse * 0.3})`);
        innerAura.addColorStop(0.6, `rgba(124, 58, 237, ${flamePulse * 0.12})`);
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
          tailGrad.addColorStop(0, "#6d28d9");
          tailGrad.addColorStop(0.4, "#7c3aed");
          tailGrad.addColorStop(0.7, "#8b5cf6");
          tailGrad.addColorStop(1, "#a78bfa");
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.moveTo(-1.5 * scale, 0);
          ctx.quadraticCurveTo(-2 * scale, tailLen * 0.5, -0.5 * scale, tailLen);
          ctx.lineTo(0.5 * scale, tailLen);
          ctx.quadraticCurveTo(2 * scale, tailLen * 0.5, 1.5 * scale, 0);
          ctx.fill();
          // Feather center line
          ctx.strokeStyle = "#4c1d95";
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, tailLen * 0.9);
          ctx.stroke();
          // Energy tip
          ctx.fillStyle = `rgba(196, 181, 253, ${flamePulse * 0.8})`;
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
        ctx.fillStyle = "#5b21b6";
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
          featherGrad.addColorStop(0, "#6d28d9");
          featherGrad.addColorStop(0.5, "#7c3aed");
          featherGrad.addColorStop(0.8, "#8b5cf6");
          featherGrad.addColorStop(1, "#a78bfa");
          ctx.fillStyle = featherGrad;
          ctx.beginPath();
          ctx.moveTo(-1.2 * scale, 0);
          ctx.quadraticCurveTo(-1.5 * scale, featherLen * 0.6, 0, featherLen);
          ctx.quadraticCurveTo(1.5 * scale, featherLen * 0.6, 1.2 * scale, 0);
          ctx.fill();
          // Feather barbs
          ctx.strokeStyle = "#4c1d95";
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, featherLen * 0.85);
          ctx.stroke();
          // Feather tip glow
          ctx.fillStyle = `rgba(196, 181, 253, ${flamePulse * 0.9})`;
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
          ctx.fillStyle = "#7c3aed";
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
        ctx.fillStyle = "#5b21b6";
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
          featherGrad.addColorStop(0, "#6d28d9");
          featherGrad.addColorStop(0.5, "#7c3aed");
          featherGrad.addColorStop(0.8, "#8b5cf6");
          featherGrad.addColorStop(1, "#a78bfa");
          ctx.fillStyle = featherGrad;
          ctx.beginPath();
          ctx.moveTo(-1.2 * scale, 0);
          ctx.quadraticCurveTo(-1.5 * scale, featherLen * 0.6, 0, featherLen);
          ctx.quadraticCurveTo(1.5 * scale, featherLen * 0.6, 1.2 * scale, 0);
          ctx.fill();
          ctx.strokeStyle = "#4c1d95";
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, featherLen * 0.85);
          ctx.stroke();
          ctx.fillStyle = `rgba(196, 181, 253, ${flamePulse * 0.9})`;
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
          ctx.fillStyle = "#7c3aed";
          ctx.beginPath();
          ctx.ellipse(0, featherLen * 0.5, 1 * scale, featherLen * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Scaled demonic body with detailed texture
        const bodyGrad = ctx.createLinearGradient(cx - 6 * scale, cy - 8 * scale, cx + 6 * scale, cy + 10 * scale);
        bodyGrad.addColorStop(0, "#4c1d95");
        bodyGrad.addColorStop(0.2, "#5b21b6");
        bodyGrad.addColorStop(0.5, "#6d28d9");
        bodyGrad.addColorStop(0.8, "#5b21b6");
        bodyGrad.addColorStop(1, "#4c1d95");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * scale - bounce + breathe, 6 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chest plumage
        const chestGrad = ctx.createRadialGradient(cx, cy - 2 * scale - bounce, 0, cx, cy - 2 * scale - bounce, 5 * scale);
        chestGrad.addColorStop(0, "#f5f3ff");
        chestGrad.addColorStop(0.5, "#ede9fe");
        chestGrad.addColorStop(1, "#ddd6fe");
        ctx.fillStyle = chestGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2 * scale - bounce + breathe, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Detailed scale pattern
        ctx.strokeStyle = "#4c1d95";
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
        ctx.fillStyle = "#5b21b6";
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
        ctx.strokeStyle = "#4c1d95";
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
          crestGrad.addColorStop(0, "#7c3aed");
          crestGrad.addColorStop(0.6, "#8b5cf6");
          crestGrad.addColorStop(1, "#a78bfa");
          ctx.fillStyle = crestGrad;
          ctx.beginPath();
          ctx.moveTo(-0.8 * scale, 0);
          ctx.quadraticCurveTo(-1 * scale, -crestLen * 0.5, 0, -crestLen);
          ctx.quadraticCurveTo(1 * scale, -crestLen * 0.5, 0.8 * scale, 0);
          ctx.fill();
          // Energy tip
          ctx.fillStyle = `rgba(196, 181, 253, ${flamePulse})`;
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
        ctx.strokeStyle = "#92400e";
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
        ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + flamePulse * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(-2.2 * scale, -1 * scale, 2.2 * scale, 2.8 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(2.2 * scale, -1 * scale, 2.2 * scale, 2.8 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Iris
        ctx.fillStyle = "#f59e0b";
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
        const robeWave = Math.sin(t * 1.2) * 2;
        const staffSway = Math.sin(t * 1.8) * 0.06;
        const wispDrift = Math.sin(t * 2.5) * 3 * scale;

        // Dark ritual circle on the ground
        ctx.save();
        ctx.translate(cx, cy + 13 * scale - bounce);
        ctx.scale(1, 0.35);
        const ritualGrad = ctx.createRadialGradient(0, 0, 2 * scale, 0, 0, 14 * scale);
        ritualGrad.addColorStop(0, `rgba(34, 197, 94, ${deathPulse * 0.3})`);
        ritualGrad.addColorStop(0.5, `rgba(22, 163, 74, ${deathPulse * 0.15})`);
        ritualGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ritualGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(34, 197, 94, ${deathPulse * 0.5})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 12.5 * scale, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const ra = (i / 6) * Math.PI * 2 + t * 0.3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ra) * 8 * scale, Math.sin(ra) * 8 * scale);
          ctx.lineTo(Math.cos(ra) * 13 * scale, Math.sin(ra) * 13 * scale);
          ctx.stroke();
        }
        ctx.restore();

        // Sickly green death aura - enhanced layered
        const auraGrad = ctx.createRadialGradient(cx, cy - 2 * scale, 0, cx, cy - 2 * scale, 18 * scale);
        auraGrad.addColorStop(0, `rgba(34, 197, 94, ${deathPulse * 0.3})`);
        auraGrad.addColorStop(0.4, `rgba(22, 163, 74, ${deathPulse * 0.15})`);
        auraGrad.addColorStop(0.7, `rgba(16, 185, 129, ${deathPulse * 0.08})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Soul wisps floating around the body
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const wa = t * (1.2 + i * 0.3) + i * 1.3;
            const wd = (8 + i * 3) * scale;
            const wx = cx + Math.cos(wa) * wd;
            const wy = cy - 4 * scale + Math.sin(wa * 0.7) * 6 * scale - bounce + wispDrift * (i % 2 === 0 ? 1 : -1);
            const wAlpha = 0.3 + Math.sin(t * 3 + i) * 0.2;
            const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, 2.5 * scale);
            wGrad.addColorStop(0, `rgba(74, 222, 128, ${wAlpha})`);
            wGrad.addColorStop(0.5, `rgba(34, 197, 94, ${wAlpha * 0.5})`);
            wGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            ctx.arc(wx, wy, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(187, 247, 208, ${wAlpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(wx, wy, 0.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Staff with skull on top - positioned to the left
        ctx.save();
        ctx.translate(cx - 11 * scale, cy - 2 * scale - bounce);
        ctx.rotate(-0.12 + staffSway);
        // Staff shaft
        const staffGrad = ctx.createLinearGradient(0, -18 * scale, 0, 16 * scale);
        staffGrad.addColorStop(0, "#3f3f46");
        staffGrad.addColorStop(0.5, "#27272a");
        staffGrad.addColorStop(1, "#18181b");
        ctx.fillStyle = staffGrad;
        ctx.fillRect(-1.2 * scale, -16 * scale, 2.4 * scale, 30 * scale);
        // Staff skull
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(0, -18 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d4d4d8";
        ctx.beginPath();
        ctx.arc(0, -18 * scale, 3 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.fill();
        // Skull eyes on staff
        ctx.fillStyle = `rgba(34, 197, 94, ${deathPulse})`;
        ctx.beginPath();
        ctx.arc(-1.2 * scale, -19 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(1.2 * scale, -19 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Green crystal beneath staff skull
        ctx.fillStyle = `rgba(34, 197, 94, ${0.7 + Math.sin(t * 3) * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(0, -14 * scale);
        ctx.lineTo(2 * scale, -15.5 * scale);
        ctx.lineTo(0, -17 * scale);
        ctx.lineTo(-2 * scale, -15.5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(74, 222, 128, ${deathPulse * 0.6})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        ctx.restore();

        // Black death robes with tattered hem
        const robeGrad = ctx.createLinearGradient(cx - 10 * scale, cy - 10 * scale, cx + 10 * scale, cy + 14 * scale);
        robeGrad.addColorStop(0, "#0f172a");
        robeGrad.addColorStop(0.6, "#0c0f1a");
        robeGrad.addColorStop(1, "#020617");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(cx - 11 * scale, cy - bounce, cx - 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 11 * scale, cy - bounce, cx + 9 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Tattered robe hem - jagged bottom edges
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 14 * scale - bounce);
        for (let i = 0; i < 8; i++) {
          const hx = cx + (-9 + i * 2.25) * scale + Math.sin(t * 1.5 + i) * 0.5 * scale;
          const hy = cy + (14 + (i % 2 === 0 ? 3 : 1.5)) * scale - bounce + robeWave * (i % 3 === 0 ? 0.5 : -0.3);
          ctx.lineTo(hx, hy);
        }
        ctx.lineTo(cx + 9 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Green trim lines on robes
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx - 3.5 * scale, cy - bounce, cx - 4 * scale, cy + 10 * scale - bounce);
        ctx.moveTo(cx + 3 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(cx + 3.5 * scale, cy - bounce, cx + 4 * scale, cy + 10 * scale - bounce);
        ctx.stroke();
        // Center robe seam
        ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6 * scale - bounce);
        ctx.lineTo(cx, cy + 12 * scale - bounce);
        ctx.stroke();

        // Shoulder clasps with skull motifs
        for (const sx of [-1, 1]) {
          ctx.fillStyle = "#a1a1aa";
          ctx.beginPath();
          ctx.arc(cx + sx * 5.5 * scale, cy - 9 * scale - bounce, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#d4d4d8";
          ctx.beginPath();
          ctx.arc(cx + sx * 5.5 * scale, cy - 9 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.arc(cx + sx * 5 * scale, cy - 9.5 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
          ctx.arc(cx + sx * 6 * scale, cy - 9.5 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bony hands extending from sleeves
        for (const hx of [-1, 1]) {
          const handX = cx + hx * 9 * scale;
          const handY = cy + 4 * scale - bounce;
          ctx.fillStyle = "#fef3c7";
          ctx.beginPath();
          ctx.ellipse(handX, handY, 2 * scale, 1.5 * scale, hx * 0.3, 0, Math.PI * 2);
          ctx.fill();
          // Bony fingers
          for (let f = 0; f < 4; f++) {
            ctx.strokeStyle = "#fde68a";
            ctx.lineWidth = 0.6 * scale;
            ctx.beginPath();
            ctx.moveTo(handX + hx * 1.5 * scale, handY - 0.5 * scale + f * 0.8 * scale);
            ctx.lineTo(handX + hx * 3.5 * scale, handY - 1 * scale + f * 1 * scale + Math.sin(t * 2 + f) * 0.3 * scale);
            ctx.stroke();
          }
          // Green energy between fingers
          if (animated) {
            ctx.fillStyle = `rgba(34, 197, 94, ${deathPulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(handX + hx * 2.5 * scale, handY, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Book of the dead strapped to belt
        ctx.fillStyle = "#292524";
        ctx.save();
        ctx.translate(cx + 6 * scale, cy + 6 * scale - bounce);
        ctx.rotate(0.15);
        ctx.fillRect(-2 * scale, -2.5 * scale, 4 * scale, 5 * scale);
        ctx.strokeStyle = "#78716c";
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(-2 * scale, -2.5 * scale, 4 * scale, 5 * scale);
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(0, 0, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Book strap
        ctx.strokeStyle = "#57534e";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -1 * scale);
        ctx.lineTo(-3 * scale, -2 * scale);
        ctx.moveTo(-2 * scale, 1 * scale);
        ctx.lineTo(-3 * scale, 2 * scale);
        ctx.stroke();
        ctx.restore();

        // Phylactery (soul container) hanging from neck
        const phylGlow = 0.6 + Math.sin(t * 2.5) * 0.4;
        ctx.fillStyle = `rgba(34, 197, 94, ${phylGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Chain
        ctx.strokeStyle = "#71717a";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx, cy - 8 * scale - bounce, cx + 2 * scale, cy - 10 * scale - bounce);
        ctx.stroke();
        // Gem body
        ctx.fillStyle = `rgba(22, 163, 74, ${0.8 + Math.sin(t * 3) * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy - 7.5 * scale - bounce);
        ctx.lineTo(cx, cy - 5.5 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale, cy - 7.5 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(74, 222, 128, ${phylGlow})`;
        ctx.lineWidth = 0.4 * scale;
        ctx.stroke();

        // Enhanced hood with deeper shadows
        const hoodGrad = ctx.createRadialGradient(cx, cy - 13 * scale - bounce, 1 * scale, cx, cy - 13 * scale - bounce, 7 * scale);
        hoodGrad.addColorStop(0, "#020617");
        hoodGrad.addColorStop(0.5, "#0f172a");
        hoodGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = hoodGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 12 * scale - bounce, 7.5 * scale, 5.5 * scale, 0, Math.PI, 0);
        ctx.fill();
        // Hood peak
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 16 * scale - bounce);
        ctx.quadraticCurveTo(cx, cy - 21 * scale - bounce, cx + 5 * scale, cy - 16 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Skeletal face
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Cheekbones / skull contour
        ctx.strokeStyle = "rgba(217, 199, 155, 0.5)";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 13 * scale - bounce, 2 * scale, 0.3 * Math.PI, 0.8 * Math.PI);
        ctx.moveTo(cx + 0.5 * scale, cy - 12.5 * scale - bounce);
        ctx.arc(cx + 2 * scale, cy - 13 * scale - bounce, 2 * scale, 0.2 * Math.PI, 0.7 * Math.PI);
        ctx.stroke();
        // Nasal cavity
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 13.5 * scale - bounce);
        ctx.lineTo(cx - 0.6 * scale, cy - 12.5 * scale - bounce);
        ctx.lineTo(cx + 0.6 * scale, cy - 12.5 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Hollow glowing eyes - layered glow
        ctx.fillStyle = `rgba(34, 197, 94, ${deathPulse * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 2.8 * scale, 3.2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 2.8 * scale, 3.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(34, 197, 94, ${deathPulse * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 1.8 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 1.8 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4ade80";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 15 * scale - bounce, 1 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, cy - 15 * scale - bounce, 1 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner skull glow from hood
        if (animated) {
          const innerGlow = ctx.createRadialGradient(cx, cy - 14 * scale - bounce, 0, cx, cy - 14 * scale - bounce, 6 * scale);
          innerGlow.addColorStop(0, `rgba(34, 197, 94, ${deathPulse * 0.15})`);
          innerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = innerGlow;
          ctx.beginPath();
          ctx.arc(cx, cy - 14 * scale - bounce, 6 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Multiple floating skulls orbiting at different distances
        const skullData = [
          { dist: 12, speed: 1.3, phase: 0, size: 3 },
          { dist: 10, speed: -1.0, phase: Math.PI * 0.7, size: 2.5 },
          { dist: 14, speed: 0.8, phase: Math.PI * 1.4, size: 2.8 },
          { dist: 9, speed: -1.6, phase: Math.PI * 0.3, size: 2.2 },
        ];
        for (const skull of skullData) {
          const sa = t * skull.speed + skull.phase;
          const sdx = cx + Math.cos(sa) * skull.dist * scale;
          const sdy = cy - 4 * scale + Math.sin(sa) * skull.dist * 0.4 * scale - bounce + Math.sin(t * 1.5 + skull.phase) * 2 * scale;
          // Skull head
          ctx.fillStyle = "#fef3c7";
          ctx.beginPath();
          ctx.arc(sdx, sdy, skull.size * scale, 0, Math.PI * 2);
          ctx.fill();
          // Jaw
          ctx.fillStyle = "#fde68a";
          ctx.beginPath();
          ctx.ellipse(sdx, sdy + skull.size * 0.5 * scale, skull.size * 0.7 * scale, skull.size * 0.35 * scale, 0, 0, Math.PI);
          ctx.fill();
          // Skull eyes
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.arc(sdx - skull.size * 0.35 * scale, sdy - skull.size * 0.2 * scale, skull.size * 0.28 * scale, 0, Math.PI * 2);
          ctx.arc(sdx + skull.size * 0.35 * scale, sdy - skull.size * 0.2 * scale, skull.size * 0.28 * scale, 0, Math.PI * 2);
          ctx.fill();
          // Green trail behind skull
          if (animated) {
            ctx.fillStyle = `rgba(34, 197, 94, ${0.15 + Math.sin(t * 2 + skull.phase) * 0.1})`;
            const trailAngle = sa - skull.speed * 0.3;
            const trailX = cx + Math.cos(trailAngle) * skull.dist * scale;
            const trailY = cy - 4 * scale + Math.sin(trailAngle) * skull.dist * 0.4 * scale - bounce;
            ctx.beginPath();
            ctx.arc(trailX, trailY, skull.size * 0.7 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case "shadow_knight": {
        // SHADOW KNIGHT - Armored dark warrior with void corruption
        const darkPulse = 0.5 + Math.sin(t * 2) * 0.3;
        const swordGleam = Math.sin(t * 4) * 0.15;
        const voidGlow = 0.6 + Math.sin(t * 3) * 0.3;
        const capeFlow = Math.sin(t * 1.5) * 0.12;
        const walkCycle = Math.sin(t * 2.5);

        // Dark aura - expanded
        const auraGrad = ctx.createRadialGradient(
          cx, cy - 2 * scale, 0,
          cx, cy - 2 * scale, 18 * scale
        );
        auraGrad.addColorStop(0, `rgba(99, 102, 241, ${darkPulse * 0.3})`);
        auraGrad.addColorStop(0.5, `rgba(139, 92, 246, ${darkPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale - bounce, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Void tendrils rising from ground
        if (animated) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.4})`;
          ctx.lineWidth = 1 * scale;
          for (let i = 0; i < 4; i++) {
            const tx = cx - 6 * scale + i * 4 * scale;
            ctx.beginPath();
            ctx.moveTo(tx, cy + 14 * scale - bounce);
            ctx.bezierCurveTo(
              tx + Math.sin(t * 2 + i) * 2 * scale, cy + 8 * scale - bounce,
              tx - Math.cos(t * 2 + i) * 2 * scale, cy + 2 * scale - bounce,
              tx + Math.sin(t * 3 + i) * 3 * scale, cy - 4 * scale - bounce
            );
            ctx.stroke();
          }
        }

        // Cape/cloak flowing behind with tattered edges
        ctx.fillStyle = "#0f0a1a";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy - 8 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 10 * scale - capeFlow * 8 * scale, cy + 4 * scale - bounce,
          cx - 9 * scale, cy + 16 * scale - bounce
        );
        for (let i = 0; i < 5; i++) {
          const jx = cx - 9 * scale + i * 4.5 * scale;
          const jy = cy + 16 * scale - bounce + (i % 2) * 2 * scale
            + Math.sin(t * 3 + i) * scale;
          ctx.lineTo(jx, jy);
        }
        ctx.quadraticCurveTo(
          cx + 10 * scale + capeFlow * 8 * scale, cy + 4 * scale - bounce,
          cx + 7 * scale, cy - 8 * scale - bounce
        );
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.25})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Articulated legs with greaves and sabatons
        const leftLeg = walkCycle * 0.2;
        const rightLeg = -walkCycle * 0.2;

        // Left leg
        ctx.save();
        ctx.translate(cx - 4 * scale, cy + 5 * scale - bounce);
        ctx.rotate(leftLeg);
        const lGreave = ctx.createLinearGradient(0, 0, 0, 8 * scale);
        lGreave.addColorStop(0, "#3f3f46");
        lGreave.addColorStop(0.5, "#27272a");
        lGreave.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = lGreave;
        ctx.fillRect(-2.5 * scale, 0, 5 * scale, 8 * scale);
        ctx.fillStyle = "#52525b";
        ctx.beginPath();
        ctx.arc(0, 8 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(0, 8 * scale);
        ctx.rotate(Math.max(0, -walkCycle) * 0.25);
        ctx.fillStyle = "#27272a";
        ctx.fillRect(-2 * scale, 0, 4 * scale, 6 * scale);
        ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.4})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, 2 * scale);
        ctx.lineTo(1.5 * scale, 2 * scale);
        ctx.stroke();
        ctx.fillStyle = "#3f3f46";
        ctx.beginPath();
        ctx.ellipse(0.5 * scale, 6 * scale, 3 * scale, 1.5 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(cx + 4 * scale, cy + 5 * scale - bounce);
        ctx.rotate(rightLeg);
        const rGreave = ctx.createLinearGradient(0, 0, 0, 8 * scale);
        rGreave.addColorStop(0, "#3f3f46");
        rGreave.addColorStop(0.5, "#27272a");
        rGreave.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = rGreave;
        ctx.fillRect(-2.5 * scale, 0, 5 * scale, 8 * scale);
        ctx.fillStyle = "#52525b";
        ctx.beginPath();
        ctx.arc(0, 8 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(0, 8 * scale);
        ctx.rotate(Math.max(0, walkCycle) * 0.25);
        ctx.fillStyle = "#27272a";
        ctx.fillRect(-2 * scale, 0, 4 * scale, 6 * scale);
        ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.4})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, 2 * scale);
        ctx.lineTo(1.5 * scale, 2 * scale);
        ctx.stroke();
        ctx.fillStyle = "#3f3f46";
        ctx.beginPath();
        ctx.ellipse(-0.5 * scale, 6 * scale, 3 * scale, 1.5 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dark plate armor - expanded with segments and runes
        const armorGrad = ctx.createLinearGradient(
          cx - 9 * scale, cy, cx + 9 * scale, cy
        );
        armorGrad.addColorStop(0, "#1e1b4b");
        armorGrad.addColorStop(0.2, "#312e81");
        armorGrad.addColorStop(0.4, "#3730a3");
        armorGrad.addColorStop(0.5, "#4338ca");
        armorGrad.addColorStop(0.6, "#3730a3");
        armorGrad.addColorStop(0.8, "#312e81");
        armorGrad.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale, cy + 8 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx - 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 6 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 4 * scale - bounce);
        ctx.lineTo(cx + 9 * scale, cy + 8 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Armor center line and horizontal segment
        ctx.strokeStyle = "#1e1b4b";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9 * scale - bounce);
        ctx.lineTo(cx, cy + 6 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 2 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy - 2 * scale - bounce);
        ctx.stroke();

        // Void rune on chest plate
        ctx.strokeStyle = `rgba(139, 92, 246, ${darkPulse * 0.7})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy + 1 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 1 * scale - bounce);
        ctx.lineTo(cx, cy + 3 * scale - bounce);
        ctx.moveTo(cx - 1.5 * scale, cy + 1 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy + 1 * scale - bounce);
        ctx.stroke();

        // Shoulder pauldrons with dark runes
        ctx.fillStyle = "#3f3f46";
        ctx.beginPath();
        ctx.ellipse(cx - 10 * scale, cy - 7 * scale - bounce, 4 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10 * scale, cy - 7 * scale - bounce, 4 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Pauldron spikes
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx - 14 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx - 10 * scale, cy - 8 * scale - bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 12 * scale, cy - 9 * scale - bounce);
        ctx.lineTo(cx + 14 * scale, cy - 15 * scale - bounce);
        ctx.lineTo(cx + 10 * scale, cy - 8 * scale - bounce);
        ctx.fill();
        // Pauldron rune gems
        ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx - 10 * scale, cy - 7 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 10 * scale, cy - 7 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Detailed helmet with horned crest and menacing visor
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale - bounce, 6.5 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#312e81";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15.5 * scale - bounce, 5.5 * scale, 4.5 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Horned crest
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 18 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 7 * scale, cy - 24 * scale - bounce,
          cx - 9 * scale, cy - 27 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx - 6 * scale, cy - 23 * scale - bounce,
          cx - 4 * scale, cy - 18 * scale - bounce
        );
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, cy - 18 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 7 * scale, cy - 24 * scale - bounce,
          cx + 9 * scale, cy - 27 * scale - bounce
        );
        ctx.quadraticCurveTo(
          cx + 6 * scale, cy - 23 * scale - bounce,
          cx + 4 * scale, cy - 18 * scale - bounce
        );
        ctx.fill();

        // Crown spikes
        ctx.fillStyle = "#27272a";
        for (let i = 0; i < 3; i++) {
          const sa = -Math.PI * 0.3 + i * Math.PI * 0.3;
          ctx.beginPath();
          ctx.moveTo(
            cx + Math.cos(sa) * 5.5 * scale,
            cy - 17 * scale - bounce
          );
          ctx.lineTo(
            cx + Math.cos(sa) * 6.5 * scale,
            cy - 20 * scale - bounce
          );
          ctx.lineTo(
            cx + Math.cos(sa + 0.15) * 5.5 * scale,
            cy - 17 * scale - bounce
          );
          ctx.fill();
        }

        // Menacing visor
        ctx.fillStyle = "#0f0a1a";
        ctx.fillRect(
          cx - 4.5 * scale, cy - 15.5 * scale - bounce,
          9 * scale, 2.5 * scale
        );
        ctx.fillStyle = "#050208";
        ctx.fillRect(
          cx - 4 * scale, cy - 15 * scale - bounce,
          8 * scale, 1.5 * scale
        );
        ctx.fillRect(
          cx - 0.75 * scale, cy - 15 * scale - bounce,
          1.5 * scale, 4 * scale
        );

        // Glowing eyes behind visor
        ctx.fillStyle = "rgba(129, 140, 248, 0.3)";
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14.5 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14.5 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(139, 92, 246, ${darkPulse + 0.3})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14.5 * scale - bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14.5 * scale - bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Shield on left arm with void sigil
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - bounce);
        ctx.rotate(-0.15 + walkCycle * 0.06);
        const shieldGrad = ctx.createLinearGradient(
          -3 * scale, -5 * scale, 3 * scale, 5 * scale
        );
        shieldGrad.addColorStop(0, "#27272a");
        shieldGrad.addColorStop(0.5, "#3f3f46");
        shieldGrad.addColorStop(1, "#27272a");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -5 * scale);
        ctx.lineTo(-4 * scale, -3 * scale);
        ctx.lineTo(-4 * scale, 4 * scale);
        ctx.lineTo(0, 7 * scale);
        ctx.lineTo(4 * scale, 4 * scale);
        ctx.lineTo(4 * scale, -3 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#52525b";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
        // Void sigil
        ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.7})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.arc(0, 1 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -1 * scale);
        ctx.lineTo(0, 3 * scale);
        ctx.moveTo(-1.5 * scale, 1 * scale);
        ctx.lineTo(1.5 * scale, 1 * scale);
        ctx.stroke();
        ctx.restore();

        // Enhanced dark sword with soul-draining effects
        ctx.save();
        ctx.translate(cx + 11 * scale, cy - 2 * scale - bounce);
        ctx.rotate(-0.3 + swordGleam - walkCycle * 0.06);
        // Blade with gradient
        const bladeGrad = ctx.createLinearGradient(0, 0, 0, -14 * scale);
        bladeGrad.addColorStop(0, "#27272a");
        bladeGrad.addColorStop(0.5, "#3f3f46");
        bladeGrad.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, 0);
        ctx.lineTo(-2 * scale, -12 * scale);
        ctx.lineTo(0, -15 * scale);
        ctx.lineTo(2 * scale, -12 * scale);
        ctx.lineTo(1.5 * scale, 0);
        ctx.closePath();
        ctx.fill();
        // Blade edge glow
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 + swordGleam * 2})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -2 * scale);
        ctx.lineTo(0, -13 * scale);
        ctx.stroke();
        // Soul-drain energy trail
        if (animated) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${darkPulse * 0.5})`;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(0, -4 * scale);
          ctx.bezierCurveTo(
            -1.5 * scale, -7 * scale,
            1.5 * scale, -10 * scale,
            0, -13 * scale
          );
          ctx.stroke();
        }
        // Blade rune dots
        ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow * 0.6})`;
        ctx.beginPath();
        ctx.arc(0, -5 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(0, -8 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(0, -11 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Crossguard
        ctx.fillStyle = "#52525b";
        ctx.fillRect(-3 * scale, -1 * scale, 6 * scale, 2 * scale);
        ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
        ctx.beginPath();
        ctx.arc(-2.5 * scale, 0, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(2.5 * scale, 0, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Grip
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(-1 * scale, 0, 2 * scale, 5 * scale);
        // Pommel gem
        ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
        ctx.beginPath();
        ctx.arc(0, 5.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
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
        const mandibleOpen = 0.3 + Math.sin(t * 3) * 0.3;
        const headY = cy - 10 * scale - bounce + wormUndulate * 0.5;

        // Sandy dust cloud base
        const dustGrad = ctx.createRadialGradient(cx, cy + 10 * scale, 0, cx, cy + 10 * scale, 22 * scale);
        dustGrad.addColorStop(0, `rgba(161, 98, 7, ${mawPulse * 0.35})`);
        dustGrad.addColorStop(0.5, `rgba(120, 53, 15, ${mawPulse * 0.15})`);
        dustGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10 * scale - bounce, 22 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sand spray particles
        if (animated) {
          for (let i = 0; i < 10; i++) {
            const sprayAngle = t * 1.5 + i * Math.PI * 2 / 10;
            const sprayDist = (12 + Math.sin(t * 3 + i * 1.7) * 6) * scale;
            const sprayX = cx + Math.cos(sprayAngle) * sprayDist;
            const sprayY = cy + 8 * scale + Math.sin(sprayAngle) * sprayDist * 0.3 - bounce;
            const sprayAlpha = 0.4 + Math.sin(t * 4 + i * 2.1) * 0.3;
            const spraySize = (1 + Math.sin(t * 2 + i) * 0.5) * scale;
            ctx.fillStyle = `rgba(161, 98, 7, ${sprayAlpha})`;
            ctx.beginPath();
            ctx.arc(sprayX, sprayY, spraySize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Tail tip with stinger
        const tailX = cx + wormUndulate * 0.6 * scale;
        const tailY = cy + 18 * scale - bounce + wormUndulate * 0.8;
        ctx.fillStyle = "#713f12";
        ctx.beginPath();
        ctx.ellipse(tailX, tailY, 4 * scale, 3 * scale, wormUndulate * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY - 3 * scale);
        ctx.lineTo(tailX - 1.5 * scale, tailY + 4 * scale);
        ctx.lineTo(tailX + 1.5 * scale, tailY + 4 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(74, 222, 128, ${mawPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(tailX, tailY + 4.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Body segments (7 segments with articulated undulation)
        for (let i = 6; i >= 0; i--) {
          const segProgress = i / 6;
          const segY = cy + (6 - i) * 4.5 * scale - bounce + wormUndulate * (i * 0.15);
          const segX = cx + wormUndulate * (0.4 - i * 0.08) * scale + Math.sin(t * 2.5 + i * 0.8) * 1.5 * scale;
          const segW = (9 - i * 0.5) * scale;
          const segH = segW * 0.55;

          // Darker band between segments
          if (i < 6) {
            ctx.fillStyle = "#451a03";
            ctx.beginPath();
            ctx.ellipse(segX, segY + 2 * scale, segW * 0.85, 1.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Segment body with gradient
          const segGrad = ctx.createLinearGradient(segX - segW, segY, segX + segW, segY);
          segGrad.addColorStop(0, "#713f12");
          segGrad.addColorStop(0.3, i % 2 === 0 ? "#a16207" : "#92400e");
          segGrad.addColorStop(0.5, i % 2 === 0 ? "#ca8a04" : "#a16207");
          segGrad.addColorStop(0.7, i % 2 === 0 ? "#a16207" : "#92400e");
          segGrad.addColorStop(1, "#713f12");
          ctx.fillStyle = segGrad;
          ctx.beginPath();
          ctx.ellipse(segX, segY, segW, segH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Carapace ridges on each segment
          ctx.strokeStyle = `rgba(202, 138, 4, ${0.4 + segProgress * 0.3})`;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.ellipse(segX, segY - segH * 0.2, segW * 0.8, segH * 0.35, 0, Math.PI + 0.3, Math.PI * 2 - 0.3);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(segX, segY - segH * 0.4, segW * 0.5, segH * 0.2, 0, Math.PI + 0.5, Math.PI * 2 - 0.5);
          ctx.stroke();

          // Rough sandy texture dots
          for (let d = 0; d < 4; d++) {
            const dotAngle = d * Math.PI * 0.5 + i * 0.7;
            const dotR = segW * 0.5;
            ctx.fillStyle = `rgba(113, 63, 18, ${0.3 + Math.sin(i + d) * 0.15})`;
            ctx.beginPath();
            ctx.arc(
              segX + Math.cos(dotAngle) * dotR,
              segY + Math.sin(dotAngle) * segH * 0.4,
              0.8 * scale, 0, Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Head base
        const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, 11 * scale);
        headGrad.addColorStop(0, "#92400e");
        headGrad.addColorStop(0.6, "#78350f");
        headGrad.addColorStop(1, "#451a03");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(cx, headY, 11 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Head carapace plate
        ctx.fillStyle = "#713f12";
        ctx.beginPath();
        ctx.ellipse(cx, headY - 4 * scale, 9 * scale, 5 * scale, 0, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = "rgba(202, 138, 4, 0.5)";
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.ellipse(cx, headY - 5 * scale, 7 * scale, 3 * scale, 0, Math.PI + 0.3, -0.3);
        ctx.stroke();

        // Multiple small eyes around the maw
        for (let i = 0; i < 6; i++) {
          const eyeAngle = -Math.PI * 0.7 + (i / 5) * Math.PI * 0.4 - Math.PI * 0.15;
          const eyeDist = 8.5 * scale;
          const eyeX = cx + Math.cos(eyeAngle) * eyeDist;
          const eyeY = headY + Math.sin(eyeAngle) * eyeDist * 0.7;
          const eyeSize = (1 + (i % 2) * 0.4) * scale;
          ctx.fillStyle = `rgba(239, 68, 68, ${mawPulse * 0.8})`;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(254, 243, 199, ${mawPulse * 0.5})`;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer mandibles (left pair)
        ctx.save();
        ctx.translate(cx - 7 * scale, headY + 2 * scale);
        ctx.rotate(-0.6 - mandibleOpen);
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-2 * scale, -8 * scale);
        ctx.lineTo(-0.5 * scale, -7 * scale);
        ctx.lineTo(1 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(cx - 5 * scale, headY + 3 * scale);
        ctx.rotate(-0.4 - mandibleOpen * 0.7);
        ctx.fillStyle = "#5c2d0e";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-1.5 * scale, -6 * scale);
        ctx.lineTo(0, -5 * scale);
        ctx.lineTo(1 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Outer mandibles (right pair)
        ctx.save();
        ctx.translate(cx + 7 * scale, headY + 2 * scale);
        ctx.rotate(0.6 + mandibleOpen);
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(2 * scale, -8 * scale);
        ctx.lineTo(0.5 * scale, -7 * scale);
        ctx.lineTo(-1 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(cx + 5 * scale, headY + 3 * scale);
        ctx.rotate(0.4 + mandibleOpen * 0.7);
        ctx.fillStyle = "#5c2d0e";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1.5 * scale, -6 * scale);
        ctx.lineTo(0, -5 * scale);
        ctx.lineTo(-1 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Open maw (dark interior)
        ctx.fillStyle = "#0c0a09";
        ctx.beginPath();
        ctx.ellipse(cx, headY, 7 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner teeth ring (outer row)
        ctx.fillStyle = "#fef3c7";
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const tx = cx + Math.cos(angle) * 5.5 * scale;
          const ty = headY + Math.sin(angle) * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(angle) * 2.5 * scale, ty + Math.sin(angle) * 2 * scale);
          ctx.lineTo(tx + Math.cos(angle + 0.25) * 0.5 * scale, ty + Math.sin(angle + 0.25) * 0.5 * scale);
          ctx.closePath();
          ctx.fill();
        }

        // Inner teeth ring (inner row, offset)
        ctx.fillStyle = "#fde68a";
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + 0.3;
          const tx = cx + Math.cos(angle) * 3.5 * scale;
          const ty = headY + Math.sin(angle) * 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(angle) * 1.5 * scale, ty + Math.sin(angle) * 1 * scale);
          ctx.lineTo(tx + Math.cos(angle + 0.4) * 0.3 * scale, ty + Math.sin(angle + 0.4) * 0.3 * scale);
          ctx.closePath();
          ctx.fill();
        }

        // Acid drip from maw
        if (animated) {
          for (let i = 0; i < 3; i++) {
            const dripX = cx + (i - 1) * 3 * scale + Math.sin(t * 2 + i) * scale;
            const dripY = headY + 5 * scale + ((t * 1.5 + i * 0.7) % 1.5) * 6 * scale;
            const dripAlpha = 0.6 - ((t * 1.5 + i * 0.7) % 1.5) * 0.4;
            if (dripAlpha > 0) {
              ctx.fillStyle = `rgba(74, 222, 128, ${dripAlpha})`;
              ctx.beginPath();
              ctx.ellipse(dripX, dripY, 1 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Inner glow (digestive fire)
        const innerGlowGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, 4 * scale);
        innerGlowGrad.addColorStop(0, `rgba(239, 68, 68, ${mawPulse * 0.7})`);
        innerGlowGrad.addColorStop(0.5, `rgba(220, 38, 38, ${mawPulse * 0.4})`);
        innerGlowGrad.addColorStop(1, `rgba(127, 29, 29, ${mawPulse * 0.1})`);
        ctx.fillStyle = innerGlowGrad;
        ctx.beginPath();
        ctx.arc(cx, headY, 3.5 * scale, 0, Math.PI * 2);
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
        const bcy = cy - 4 * scale - bounce - wailFloat;

        // Ground shadow trail
        const shadowGrad = ctx.createRadialGradient(cx, cy + 14 * scale, 0, cx, cy + 14 * scale, 14 * scale);
        shadowGrad.addColorStop(0, "rgba(15, 23, 42, 0.25)");
        shadowGrad.addColorStop(0.6, "rgba(15, 23, 42, 0.1)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14 * scale, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ethereal white glow
        const spiritGrad = ctx.createRadialGradient(cx, bcy, 0, cx, bcy, 20 * scale);
        spiritGrad.addColorStop(0, `rgba(226, 232, 240, ${screamPulse * 0.5})`);
        spiritGrad.addColorStop(0.4, `rgba(203, 213, 225, ${screamPulse * 0.3})`);
        spiritGrad.addColorStop(0.7, `rgba(186, 196, 210, ${screamPulse * 0.12})`);
        spiritGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = spiritGrad;
        ctx.beginPath();
        ctx.arc(cx, bcy, 20 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Spectral chains trailing from body
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.25 + screamPulse * 0.15})`;
        ctx.lineWidth = 1.2 * scale;
        for (let c = 0; c < 2; c++) {
          const chainX = cx + (c === 0 ? -6 : 6) * scale;
          ctx.beginPath();
          ctx.moveTo(chainX, bcy + 4 * scale);
          for (let link = 0; link < 6; link++) {
            const lx = chainX + Math.sin(t * 2 + link * 1.2 + c * Math.PI) * 3 * scale;
            const ly = bcy + 4 * scale + (link + 1) * 3.5 * scale;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
          for (let link = 0; link < 6; link++) {
            const lx = chainX + Math.sin(t * 2 + link * 1.2 + c * Math.PI) * 3 * scale;
            const ly = bcy + 4 * scale + (link + 1) * 3.5 * scale;
            ctx.fillStyle = `rgba(148, 163, 184, ${0.2 - link * 0.03})`;
            ctx.beginPath();
            ctx.arc(lx, ly, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Wail distortion rings
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const ringPhase = (t * 1.5 + i * 0.8) % 4;
            const ringRadius = (6 + ringPhase * 5) * scale;
            const ringAlpha = 0.35 - ringPhase * 0.08;
            if (ringAlpha > 0) {
              ctx.strokeStyle = `rgba(148, 163, 184, ${ringAlpha})`;
              ctx.lineWidth = (1.5 - ringPhase * 0.2) * scale;
              ctx.beginPath();
              ctx.ellipse(cx, bcy - 6 * scale, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }

        // Soul wisps - floating spirits being dragged along
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const soulAngle = t * (0.8 + i * 0.2) + i * (Math.PI / 2);
            const soulR = (12 + Math.sin(t + i * 2) * 4) * scale;
            const soulX = cx + Math.cos(soulAngle) * soulR;
            const soulY = bcy + Math.sin(soulAngle) * soulR * 0.5 + 3 * scale;
            const soulAlpha = 0.2 + Math.sin(t * 3 + i) * 0.1;
            const soulGrad = ctx.createRadialGradient(soulX, soulY, 0, soulX, soulY, 3 * scale);
            soulGrad.addColorStop(0, `rgba(226, 232, 240, ${soulAlpha})`);
            soulGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = soulGrad;
            ctx.beginPath();
            ctx.ellipse(soulX, soulY, 2 * scale, 3 * scale, Math.sin(t + i) * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Tattered robes with ragged edges
        const robeGrad = ctx.createLinearGradient(cx, bcy - 6 * scale, cx, bcy + 18 * scale);
        robeGrad.addColorStop(0, "rgba(241, 245, 249, 0.9)");
        robeGrad.addColorStop(0.5, "rgba(226, 232, 240, 0.6)");
        robeGrad.addColorStop(0.8, "rgba(203, 213, 225, 0.25)");
        robeGrad.addColorStop(1, "rgba(203, 213, 225, 0)");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, bcy + 14 * scale);
        ctx.lineTo(cx - 12 * scale + Math.sin(t * 3) * scale, bcy + 16 * scale);
        ctx.lineTo(cx - 8 * scale + Math.sin(t * 3.5) * scale, bcy + 13 * scale);
        ctx.lineTo(cx - 6 * scale + Math.sin(t * 2.8) * scale, bcy + 17 * scale);
        ctx.lineTo(cx - 3 * scale, bcy + 14 * scale);
        ctx.lineTo(cx - scale + Math.sin(t * 4) * scale, bcy + 18 * scale);
        ctx.lineTo(cx + scale, bcy + 15 * scale);
        ctx.lineTo(cx + 3 * scale + Math.sin(t * 3.2) * scale, bcy + 17 * scale);
        ctx.lineTo(cx + 6 * scale + Math.sin(t * 2.5) * scale, bcy + 13 * scale);
        ctx.lineTo(cx + 8 * scale + Math.sin(t * 3.7) * scale, bcy + 16 * scale);
        ctx.lineTo(cx + 12 * scale + Math.sin(t * 3) * scale, bcy + 15 * scale);
        ctx.lineTo(cx + 10 * scale, bcy + 14 * scale);
        ctx.quadraticCurveTo(cx + 13 * scale, bcy, cx + 7 * scale, bcy - 10 * scale);
        ctx.quadraticCurveTo(cx, bcy - 18 * scale, cx - 7 * scale, bcy - 10 * scale);
        ctx.quadraticCurveTo(cx - 13 * scale, bcy, cx - 10 * scale, bcy + 14 * scale);
        ctx.closePath();
        ctx.fill();

        // Reaching hands/arms - outstretched ghostly hands
        ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, bcy - 2 * scale);
        ctx.quadraticCurveTo(
          cx - 14 * scale + Math.sin(t * 2) * 2 * scale, bcy - 6 * scale,
          cx - 16 * scale + Math.sin(t * 2.5) * 2 * scale, bcy - 10 * scale
        );
        ctx.stroke();
        const lhx = cx - 16 * scale + Math.sin(t * 2.5) * 2 * scale;
        const lhy = bcy - 10 * scale;
        for (let f = 0; f < 3; f++) {
          const fAngle = -Math.PI * 0.6 + f * 0.3 + Math.sin(t * 3 + f) * 0.15;
          ctx.beginPath();
          ctx.moveTo(lhx, lhy);
          ctx.lineTo(lhx + Math.cos(fAngle) * 3 * scale, lhy + Math.sin(fAngle) * 3 * scale);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(cx + 7 * scale, bcy - 2 * scale);
        ctx.quadraticCurveTo(
          cx + 14 * scale + Math.sin(t * 2 + 1) * 2 * scale, bcy - 6 * scale,
          cx + 16 * scale + Math.sin(t * 2.5 + 1) * 2 * scale, bcy - 10 * scale
        );
        ctx.stroke();
        const rhx = cx + 16 * scale + Math.sin(t * 2.5 + 1) * 2 * scale;
        const rhy = bcy - 10 * scale;
        for (let f = 0; f < 3; f++) {
          const fAngle = -Math.PI * 0.4 - f * 0.3 + Math.sin(t * 3 + f + 1) * 0.15;
          ctx.beginPath();
          ctx.moveTo(rhx, rhy);
          ctx.lineTo(rhx + Math.cos(fAngle) * 3 * scale, rhy + Math.sin(fAngle) * 3 * scale);
          ctx.stroke();
        }

        // Flowing ghostly form (main body)
        const ghostGrad = ctx.createLinearGradient(cx, bcy - 14 * scale, cx, bcy + 8 * scale);
        ghostGrad.addColorStop(0, "rgba(241, 245, 249, 0.95)");
        ghostGrad.addColorStop(0.5, "rgba(226, 232, 240, 0.8)");
        ghostGrad.addColorStop(1, "rgba(226, 232, 240, 0.4)");
        ctx.fillStyle = ghostGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, bcy + 6 * scale);
        ctx.quadraticCurveTo(cx - 10 * scale, bcy - 2 * scale, cx - 6 * scale, bcy - 12 * scale);
        ctx.quadraticCurveTo(cx, bcy - 18 * scale, cx + 6 * scale, bcy - 12 * scale);
        ctx.quadraticCurveTo(cx + 10 * scale, bcy - 2 * scale, cx + 8 * scale, bcy + 6 * scale);
        ctx.closePath();
        ctx.fill();

        // Flowing hair - spectral strands streaming upward
        ctx.strokeStyle = "rgba(226, 232, 240, 0.65)";
        ctx.lineWidth = 1.2 * scale;
        for (let i = 0; i < 7; i++) {
          const hairStart = cx + (i - 3) * 2 * scale;
          const hairLen = (12 + Math.sin(t * 2 + i) * 3) * scale;
          const hairSway = Math.sin(t * 3 + i * 0.7) * 3 * scale;
          ctx.beginPath();
          ctx.moveTo(hairStart, bcy - 12 * scale);
          ctx.quadraticCurveTo(
            hairStart + hairSway, bcy - 12 * scale - hairLen * 0.5,
            hairStart + hairSway * 1.5 + Math.sin(t * 2 + i * 1.3) * 2 * scale, bcy - 12 * scale - hairLen
          );
          ctx.stroke();
        }
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = "rgba(241, 245, 249, 0.5)";
        for (let side = -1; side <= 1; side += 2) {
          ctx.beginPath();
          ctx.moveTo(cx + side * 5 * scale, bcy - 10 * scale);
          ctx.quadraticCurveTo(
            cx + side * 8 * scale + Math.sin(t * 2.5 + side) * 2 * scale, bcy - 16 * scale,
            cx + side * 6 * scale + Math.sin(t * 1.8 + side) * 4 * scale, bcy - 22 * scale
          );
          ctx.stroke();
        }

        // Wailing face
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.arc(cx, bcy - 8 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hollow eyes - deeper sockets
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, bcy - 9 * scale, 1.8 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2.5 * scale, bcy - 9 * scale, 1.8 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye socket glow
        ctx.fillStyle = `rgba(148, 163, 184, ${0.3 + screamPulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, bcy - 9 * scale, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, bcy - 9 * scale, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tear streaks from hollow eyes
        ctx.strokeStyle = `rgba(147, 197, 253, ${0.35 + screamPulse * 0.2})`;
        ctx.lineWidth = 0.8 * scale;
        for (let side = -1; side <= 1; side += 2) {
          const tearX = cx + side * 2.5 * scale;
          ctx.beginPath();
          ctx.moveTo(tearX, bcy - 7 * scale);
          ctx.quadraticCurveTo(
            tearX + side * 0.5 * scale + Math.sin(t * 4) * 0.3 * scale, bcy - 3 * scale,
            tearX + side * scale, bcy + 2 * scale
          );
          ctx.stroke();
          const dropY = bcy + 2 * scale + Math.sin(t * 3 + side) * scale;
          ctx.fillStyle = `rgba(147, 197, 253, ${0.25 + Math.sin(t * 5 + side) * 0.15})`;
          ctx.beginPath();
          ctx.arc(tearX + side * scale, dropY, 0.7 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Screaming mouth - wide open
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.ellipse(cx, bcy - 4 * scale, 3 * scale, 4 * scale + screamPulse * 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner mouth detail
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx, bcy - 4 * scale, 2 * scale, 3 * scale + screamPulse * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "juggernaut": {
        // ENDOWED CHAIR - Massive armored academic authority
        const heavyStep = Math.sin(t * 1.5) * 1;
        const powerGlow = 0.5 + Math.sin(t * 2) * 0.3;
        const runePulse = 0.3 + Math.sin(t * 3) * 0.3;
        const capeWave = Math.sin(t * 2.5) * 2;
        const by = cy - bounce + heavyStep;

        // Ground crack / stomp impact
        if (animated) {
          const stompIntensity = Math.max(0, Math.sin(t * 1.5));
          if (stompIntensity > 0.7) {
            const crackAlpha = (stompIntensity - 0.7) * 3;
            ctx.strokeStyle = `rgba(68, 64, 60, ${crackAlpha * 0.6})`;
            ctx.lineWidth = 1 * scale;
            for (let i = 0; i < 5; i++) {
              const crackAngle = (i / 5) * Math.PI - Math.PI * 0.5;
              const crackLen = (4 + i * 2) * scale;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(crackAngle) * 8 * scale, by + 14 * scale);
              ctx.lineTo(
                cx + Math.cos(crackAngle) * (8 * scale + crackLen),
                by + 14 * scale + Math.sin(crackAngle + 0.5) * 3 * scale
              );
              ctx.stroke();
            }
            // Dust/debris particles from stomp
            for (let i = 0; i < 6; i++) {
              const debrisAngle = t * 2 + i * Math.PI / 3;
              const debrisDist = (8 + stompIntensity * 8) * scale;
              const dx = cx + Math.cos(debrisAngle) * debrisDist;
              const dy = by + 14 * scale - Math.abs(Math.sin(t * 3 + i)) * 4 * scale;
              ctx.fillStyle = `rgba(120, 113, 108, ${crackAlpha * 0.5})`;
              ctx.beginPath();
              ctx.arc(dx, dy, (0.8 + Math.sin(i) * 0.4) * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Authority aura with power particles
        const auraGrad = ctx.createRadialGradient(cx, by, 0, cx, by, 24 * scale);
        auraGrad.addColorStop(0, `rgba(68, 64, 60, ${powerGlow * 0.35})`);
        auraGrad.addColorStop(0.4, `rgba(120, 113, 108, ${powerGlow * 0.2})`);
        auraGrad.addColorStop(0.7, `rgba(161, 98, 7, ${powerGlow * 0.08})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, by, 24 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating energy particles around the aura
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const pAngle = t * 0.8 + i * Math.PI / 4;
            const pDist = (16 + Math.sin(t * 1.5 + i * 1.3) * 4) * scale;
            const px = cx + Math.cos(pAngle) * pDist;
            const py = by - 4 * scale + Math.sin(pAngle) * pDist * 0.4;
            const pAlpha = 0.3 + Math.sin(t * 2.5 + i * 1.7) * 0.25;
            const pSize = (1 + Math.sin(t * 3 + i) * 0.5) * scale;
            ctx.fillStyle = `rgba(251, 191, 36, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Cape / academic regalia flowing behind
        const capeGrad = ctx.createLinearGradient(cx, by - 14 * scale, cx, by + 16 * scale);
        capeGrad.addColorStop(0, "#1c1917");
        capeGrad.addColorStop(0.4, "#292524");
        capeGrad.addColorStop(1, "#0c0a09");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, by - 10 * scale);
        ctx.quadraticCurveTo(cx - 16 * scale + capeWave * scale, by + 4 * scale, cx - 14 * scale + capeWave * 0.5 * scale, by + 18 * scale);
        ctx.lineTo(cx - 8 * scale + capeWave * 0.3 * scale, by + 20 * scale);
        ctx.lineTo(cx + 8 * scale - capeWave * 0.3 * scale, by + 20 * scale);
        ctx.lineTo(cx + 14 * scale - capeWave * 0.5 * scale, by + 18 * scale);
        ctx.quadraticCurveTo(cx + 16 * scale - capeWave * scale, by + 4 * scale, cx + 10 * scale, by - 10 * scale);
        ctx.closePath();
        ctx.fill();

        // Gold embroidery on cape
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 + powerGlow * 0.2})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale + capeWave * 0.4 * scale, by + 14 * scale);
        ctx.quadraticCurveTo(cx, by + 12 * scale, cx + 12 * scale - capeWave * 0.4 * scale, by + 14 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale + capeWave * 0.3 * scale, by + 17 * scale);
        ctx.quadraticCurveTo(cx, by + 15 * scale, cx + 10 * scale - capeWave * 0.3 * scale, by + 17 * scale);
        ctx.stroke();

        // Heavy armored legs/boots
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, by + 8 * scale);
        ctx.lineTo(cx - 8 * scale, by + 14 * scale);
        ctx.lineTo(cx - 10 * scale, by + 16 * scale);
        ctx.lineTo(cx - 4 * scale, by + 16 * scale);
        ctx.lineTo(cx - 3 * scale, by + 8 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, by + 8 * scale);
        ctx.lineTo(cx + 8 * scale, by + 14 * scale);
        ctx.lineTo(cx + 10 * scale, by + 16 * scale);
        ctx.lineTo(cx + 4 * scale, by + 16 * scale);
        ctx.lineTo(cx + 3 * scale, by + 8 * scale);
        ctx.closePath();
        ctx.fill();

        // Boot metal trim
        ctx.strokeStyle = "#78716c";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, by + 16 * scale);
        ctx.lineTo(cx - 4 * scale, by + 16 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, by + 16 * scale);
        ctx.lineTo(cx + 10 * scale, by + 16 * scale);
        ctx.stroke();

        // Knee guards
        ctx.fillStyle = "#44403c";
        ctx.beginPath();
        ctx.ellipse(cx - 5 * scale, by + 10 * scale, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 5 * scale, by + 10 * scale, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Massive armored body (torso) with overlapping plates
        const armorGrad = ctx.createLinearGradient(cx - 14 * scale, by, cx + 14 * scale, by);
        armorGrad.addColorStop(0, "#1c1917");
        armorGrad.addColorStop(0.2, "#3f3f46");
        armorGrad.addColorStop(0.35, "#57534e");
        armorGrad.addColorStop(0.5, "#6b7280");
        armorGrad.addColorStop(0.65, "#57534e");
        armorGrad.addColorStop(0.8, "#3f3f46");
        armorGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, by + 10 * scale);
        ctx.lineTo(cx - 15 * scale, by - 2 * scale);
        ctx.lineTo(cx - 11 * scale, by - 12 * scale);
        ctx.lineTo(cx + 11 * scale, by - 12 * scale);
        ctx.lineTo(cx + 15 * scale, by - 2 * scale);
        ctx.lineTo(cx + 12 * scale, by + 10 * scale);
        ctx.closePath();
        ctx.fill();

        // Overlapping armor plate lines
        ctx.strokeStyle = "rgba(107, 114, 128, 0.4)";
        ctx.lineWidth = 0.7 * scale;
        for (let i = 0; i < 4; i++) {
          const plateY = by - 8 * scale + i * 5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx - (12 - i * 0.5) * scale, plateY);
          ctx.quadraticCurveTo(cx, plateY + 1.5 * scale, cx + (12 - i * 0.5) * scale, plateY);
          ctx.stroke();
        }

        // Rivets on armor
        ctx.fillStyle = "#9ca3af";
        for (let i = 0; i < 3; i++) {
          const rivetY = by - 6 * scale + i * 5 * scale;
          ctx.beginPath();
          ctx.arc(cx - 10 * scale, rivetY, 0.8 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 10 * scale, rivetY, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gold trim bands
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 13 * scale, by - 1 * scale);
        ctx.lineTo(cx + 13 * scale, by - 1 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, by + 7 * scale);
        ctx.lineTo(cx + 11 * scale, by + 7 * scale);
        ctx.stroke();

        // Glowing runes etched into armor
        ctx.strokeStyle = `rgba(251, 191, 36, ${runePulse})`;
        ctx.lineWidth = 0.6 * scale;
        // Left rune
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, by - 5 * scale);
        ctx.lineTo(cx - 5 * scale, by - 8 * scale);
        ctx.lineTo(cx - 3 * scale, by - 5 * scale);
        ctx.lineTo(cx - 5 * scale, by - 3 * scale);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, by - 8 * scale);
        ctx.lineTo(cx - 5 * scale, by - 3 * scale);
        ctx.stroke();
        // Right rune
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, by - 5 * scale);
        ctx.lineTo(cx + 5 * scale, by - 8 * scale);
        ctx.lineTo(cx + 7 * scale, by - 5 * scale);
        ctx.lineTo(cx + 5 * scale, by - 3 * scale);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, by - 8 * scale);
        ctx.lineTo(cx + 5 * scale, by - 3 * scale);
        ctx.stroke();
        // Center rune
        ctx.beginPath();
        ctx.arc(cx, by + 3 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, by + 1 * scale);
        ctx.lineTo(cx, by + 5 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, by + 3 * scale);
        ctx.lineTo(cx + 2 * scale, by + 3 * scale);
        ctx.stroke();

        // Left shoulder pauldron
        const leftPauldronGrad = ctx.createRadialGradient(
          cx - 14 * scale, by - 10 * scale, 0,
          cx - 14 * scale, by - 10 * scale, 7 * scale
        );
        leftPauldronGrad.addColorStop(0, "#6b7280");
        leftPauldronGrad.addColorStop(0.5, "#4b5563");
        leftPauldronGrad.addColorStop(1, "#1f2937");
        ctx.fillStyle = leftPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(cx - 14 * scale, by - 10 * scale, 7 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Pauldron edge highlight
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(cx - 14 * scale, by - 10 * scale, 7 * scale, 5 * scale, -0.2, Math.PI + 0.5, -0.5);
        ctx.stroke();
        // Glowing rune on left pauldron
        ctx.fillStyle = `rgba(251, 191, 36, ${runePulse * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx - 14 * scale, by - 10 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(251, 191, 36, ${runePulse * 0.5})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(cx - 14 * scale, by - 10 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Right shoulder pauldron
        const rightPauldronGrad = ctx.createRadialGradient(
          cx + 14 * scale, by - 10 * scale, 0,
          cx + 14 * scale, by - 10 * scale, 7 * scale
        );
        rightPauldronGrad.addColorStop(0, "#6b7280");
        rightPauldronGrad.addColorStop(0.5, "#4b5563");
        rightPauldronGrad.addColorStop(1, "#1f2937");
        ctx.fillStyle = rightPauldronGrad;
        ctx.beginPath();
        ctx.ellipse(cx + 14 * scale, by - 10 * scale, 7 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(cx + 14 * scale, by - 10 * scale, 7 * scale, 5 * scale, 0.2, Math.PI + 0.5, -0.5);
        ctx.stroke();
        ctx.fillStyle = `rgba(251, 191, 36, ${runePulse * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx + 14 * scale, by - 10 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(251, 191, 36, ${runePulse * 0.5})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(cx + 14 * scale, by - 10 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Shield on left side with university crest
        ctx.save();
        ctx.translate(cx - 16 * scale, by + 2 * scale);
        ctx.rotate(-0.15);
        const shieldGrad = ctx.createLinearGradient(-6 * scale, -8 * scale, 6 * scale, 8 * scale);
        shieldGrad.addColorStop(0, "#4b5563");
        shieldGrad.addColorStop(0.3, "#6b7280");
        shieldGrad.addColorStop(0.5, "#9ca3af");
        shieldGrad.addColorStop(0.7, "#6b7280");
        shieldGrad.addColorStop(1, "#374151");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -9 * scale);
        ctx.lineTo(6 * scale, -6 * scale);
        ctx.lineTo(7 * scale, 0);
        ctx.lineTo(4 * scale, 6 * scale);
        ctx.lineTo(0, 9 * scale);
        ctx.lineTo(-4 * scale, 6 * scale);
        ctx.lineTo(-7 * scale, 0);
        ctx.lineTo(-6 * scale, -6 * scale);
        ctx.closePath();
        ctx.fill();
        // Shield border
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();
        // University crest - shield inner design
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 + powerGlow * 0.3})`;
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(-3 * scale, -4 * scale);
        ctx.lineTo(3 * scale, -4 * scale);
        ctx.lineTo(3 * scale, 2 * scale);
        ctx.lineTo(0, 5 * scale);
        ctx.lineTo(-3 * scale, 2 * scale);
        ctx.closePath();
        ctx.stroke();
        // Crest horizontal bar
        ctx.beginPath();
        ctx.moveTo(-3 * scale, -1 * scale);
        ctx.lineTo(3 * scale, -1 * scale);
        ctx.stroke();
        // Crest vertical bar
        ctx.beginPath();
        ctx.moveTo(0, -4 * scale);
        ctx.lineTo(0, 5 * scale);
        ctx.stroke();
        // Crest diamond
        ctx.fillStyle = `rgba(251, 191, 36, ${runePulse * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, -3 * scale);
        ctx.lineTo(1.5 * scale, -1 * scale);
        ctx.lineTo(0, 1 * scale);
        ctx.lineTo(-1.5 * scale, -1 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Massive helmet
        const helmetGrad = ctx.createRadialGradient(cx, by - 14 * scale, 0, cx, by - 14 * scale, 9 * scale);
        helmetGrad.addColorStop(0, "#3f3f46");
        helmetGrad.addColorStop(0.5, "#292524");
        helmetGrad.addColorStop(1, "#1c1917");
        ctx.fillStyle = helmetGrad;
        ctx.beginPath();
        ctx.arc(cx, by - 14 * scale, 9 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Helmet face plate
        ctx.fillStyle = "#27272a";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, by - 12 * scale);
        ctx.lineTo(cx - 7 * scale, by - 18 * scale);
        ctx.lineTo(cx + 7 * scale, by - 18 * scale);
        ctx.lineTo(cx + 6 * scale, by - 12 * scale);
        ctx.closePath();
        ctx.fill();

        // Helmet nose guard
        ctx.fillStyle = "#3f3f46";
        ctx.beginPath();
        ctx.moveTo(cx, by - 18 * scale);
        ctx.lineTo(cx - 1 * scale, by - 11 * scale);
        ctx.lineTo(cx + 1 * scale, by - 11 * scale);
        ctx.closePath();
        ctx.fill();

        // Golden crown on helmet
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, by - 21 * scale);
        ctx.lineTo(cx - 5 * scale, by - 25 * scale);
        ctx.lineTo(cx - 3 * scale, by - 21 * scale);
        ctx.lineTo(cx - 1 * scale, by - 24 * scale);
        ctx.lineTo(cx, by - 26 * scale);
        ctx.lineTo(cx + 1 * scale, by - 24 * scale);
        ctx.lineTo(cx + 3 * scale, by - 21 * scale);
        ctx.lineTo(cx + 5 * scale, by - 25 * scale);
        ctx.lineTo(cx + 7 * scale, by - 21 * scale);
        ctx.closePath();
        ctx.fill();
        // Crown jewels
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(cx, by - 25 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, by - 23.5 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, by - 23.5 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing visor slit
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, by - 15 * scale);
        ctx.lineTo(cx - 5 * scale, by - 16 * scale);
        ctx.lineTo(cx + 5 * scale, by - 16 * scale);
        ctx.lineTo(cx + 6 * scale, by - 15 * scale);
        ctx.lineTo(cx + 5 * scale, by - 13 * scale);
        ctx.lineTo(cx - 5 * scale, by - 13 * scale);
        ctx.closePath();
        ctx.fill();
        // Glowing eyes behind visor
        ctx.fillStyle = `rgba(251, 191, 36, ${powerGlow})`;
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, by - 14.5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2.5 * scale, by - 14.5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Eye glow bloom
        const eyeGlowGrad = ctx.createRadialGradient(cx, by - 14.5 * scale, 0, cx, by - 14.5 * scale, 5 * scale);
        eyeGlowGrad.addColorStop(0, `rgba(251, 191, 36, ${powerGlow * 0.3})`);
        eyeGlowGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = eyeGlowGrad;
        ctx.beginPath();
        ctx.ellipse(cx, by - 14.5 * scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Giant hammer (upgraded)
        ctx.save();
        ctx.translate(cx + 14 * scale, by - 2 * scale);
        ctx.rotate(0.1 + Math.sin(t * 1.5) * 0.05);
        // Hammer shaft
        const shaftGrad = ctx.createLinearGradient(-1.5 * scale, -10 * scale, 1.5 * scale, 14 * scale);
        shaftGrad.addColorStop(0, "#a8a29e");
        shaftGrad.addColorStop(0.5, "#78716c");
        shaftGrad.addColorStop(1, "#57534e");
        ctx.fillStyle = shaftGrad;
        ctx.fillRect(-1.5 * scale, -10 * scale, 3 * scale, 24 * scale);
        // Hammer head
        const hammerGrad = ctx.createLinearGradient(-7 * scale, -14 * scale, 7 * scale, -8 * scale);
        hammerGrad.addColorStop(0, "#374151");
        hammerGrad.addColorStop(0.3, "#6b7280");
        hammerGrad.addColorStop(0.5, "#9ca3af");
        hammerGrad.addColorStop(0.7, "#6b7280");
        hammerGrad.addColorStop(1, "#374151");
        ctx.fillStyle = hammerGrad;
        ctx.fillRect(-7 * scale, -14 * scale, 14 * scale, 7 * scale);
        // Hammer gold inlay
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 0.7 * scale;
        ctx.strokeRect(-6 * scale, -13 * scale, 12 * scale, 5 * scale);
        // Hammer rune glow
        ctx.fillStyle = `rgba(251, 191, 36, ${runePulse * 0.7})`;
        ctx.beginPath();
        ctx.arc(0, -10.5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
        // ANCIENT ALUMNUS - Ultimate mega boss flying dragon
        const wingFlap = Math.sin(t * 3) * 8;
        const fireBreath = 0.6 + Math.sin(t * 4) * 0.4;
        const dragonFloat = Math.sin(t * 1.5) * 3;
        const chestPulse = 0.5 + Math.sin(t * 2.5) * 0.3;
        const tailSway = Math.sin(t * 2) * 4;
        const auraPulse = 0.3 + Math.sin(t * 1.8) * 0.15;
        const jawOpen = 1.5 + Math.sin(t * 3.5) * 0.8;
        const dy = -bounce - dragonFloat;

        // === DARK MAGIC AURA (outermost layer) ===
        const auraGrad = ctx.createRadialGradient(cx, cy + dy, 4 * scale, cx, cy + dy, 30 * scale);
        auraGrad.addColorStop(0, `rgba(80, 0, 30, ${auraPulse * 0.5})`);
        auraGrad.addColorStop(0.4, `rgba(120, 0, 50, ${auraPulse * 0.3})`);
        auraGrad.addColorStop(0.7, `rgba(60, 0, 80, ${auraPulse * 0.15})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + dy, 30 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Aura inner ring
        const auraRingGrad = ctx.createRadialGradient(cx, cy + dy, 8 * scale, cx, cy + dy, 26 * scale);
        auraRingGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        auraRingGrad.addColorStop(0.6, `rgba(139, 0, 50, ${auraPulse * 0.12})`);
        auraRingGrad.addColorStop(0.85, `rgba(180, 20, 60, ${auraPulse * 0.08})`);
        auraRingGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraRingGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + dy, 26 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Floating ember particles in aura
        if (animated) {
          for (let i = 0; i < 10; i++) {
            const emberAngle = t * 0.8 + (i * Math.PI * 2) / 10;
            const emberDist = (14 + Math.sin(t * 1.2 + i * 1.7) * 8) * scale;
            const ex = cx + Math.cos(emberAngle) * emberDist;
            const ey = cy + dy + Math.sin(emberAngle) * emberDist * 0.6 - Math.abs(Math.sin(t + i)) * 4 * scale;
            const emberSize = (0.6 + Math.sin(t * 3 + i * 2) * 0.4) * scale;
            const emberAlpha = 0.4 + Math.sin(t * 2.5 + i) * 0.3;
            const emberColors = ["rgba(255, 100, 20,", "rgba(255, 180, 40,", "rgba(200, 30, 60,"];
            ctx.fillStyle = `${emberColors[i % 3]} ${emberAlpha})`;
            ctx.beginPath();
            ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // === MASSIVE FIRE AURA ===
        const dragonGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 22 * scale);
        dragonGrad.addColorStop(0, `rgba(159, 18, 57, ${fireBreath * 0.35})`);
        dragonGrad.addColorStop(0.5, `rgba(225, 29, 72, ${fireBreath * 0.2})`);
        dragonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = dragonGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale + dy, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === TAIL (behind body) ===
        ctx.strokeStyle = "#6b0c2a";
        ctx.lineWidth = 3 * scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx, cy + 8 * scale + dy);
        const tailSegs = 7;
        for (let i = 1; i <= tailSegs; i++) {
          const segFrac = i / tailSegs;
          const segSway = tailSway * segFrac * 1.5;
          const tx = cx + segSway + Math.sin(t * 2.2 + i * 0.6) * 2 * scale * segFrac;
          const ty = cy + 8 * scale + dy + i * 3.2 * scale;
          ctx.lineTo(tx, ty);
        }
        ctx.stroke();

        // Tail body fill
        for (let i = 0; i < tailSegs; i++) {
          const segFrac = i / tailSegs;
          const segSway1 = tailSway * segFrac * 1.5 + Math.sin(t * 2.2 + i * 0.6) * 2 * scale * segFrac;
          const segSway2 = tailSway * ((i + 1) / tailSegs) * 1.5 + Math.sin(t * 2.2 + (i + 1) * 0.6) * 2 * scale * ((i + 1) / tailSegs);
          const tx1 = cx + segSway1;
          const ty1 = cy + 8 * scale + dy + i * 3.2 * scale;
          const tx2 = cx + segSway2;
          const ty2 = cy + 8 * scale + dy + (i + 1) * 3.2 * scale;
          const tailWidth = (3.5 - i * 0.4) * scale;
          ctx.fillStyle = i % 2 === 0 ? "#7f1d2d" : "#6b0c2a";
          ctx.beginPath();
          ctx.moveTo(tx1 - tailWidth, ty1);
          ctx.lineTo(tx2 - tailWidth * 0.7, ty2);
          ctx.lineTo(tx2 + tailWidth * 0.7, ty2);
          ctx.lineTo(tx1 + tailWidth, ty1);
          ctx.closePath();
          ctx.fill();
        }

        // Tail blade
        const bladeSway = tailSway * 1.5 + Math.sin(t * 2.2 + tailSegs * 0.6) * 2 * scale;
        const bladeX = cx + bladeSway;
        const bladeY = cy + 8 * scale + dy + tailSegs * 3.2 * scale;
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.moveTo(bladeX, bladeY - 1 * scale);
        ctx.lineTo(bladeX - 3 * scale, bladeY + 4 * scale);
        ctx.lineTo(bladeX, bladeY + 2.5 * scale);
        ctx.lineTo(bladeX + 3 * scale, bladeY + 4 * scale);
        ctx.closePath();
        ctx.fill();

        // Tail flame tip
        if (animated) {
          const tailFlameAlpha = 0.5 + Math.sin(t * 5) * 0.3;
          ctx.fillStyle = `rgba(255, 120, 20, ${tailFlameAlpha})`;
          ctx.beginPath();
          ctx.arc(bladeX, bladeY + 4.5 * scale, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255, 200, 50, ${tailFlameAlpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(bladeX, bladeY + 4.5 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // === WINGS (behind body, with bone structure and membrane) ===
        const wingBoneColor = "#5c0a1e";
        const wingMembraneColor = "rgba(136, 19, 55, 0.7)";
        const wingVeinColor = "rgba(100, 10, 40, 0.5)";

        // Left wing membrane (scalloped edges with pointed finger tips)
        ctx.fillStyle = wingMembraneColor;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 4 * scale + dy);
        ctx.quadraticCurveTo(cx - 12 * scale, cy - 15 * scale + dy - wingFlap, cx - 24 * scale, cy - 11 * scale + dy - wingFlap * 0.8);
        ctx.quadraticCurveTo(cx - 18 * scale, cy - 5 * scale + dy - wingFlap * 0.6, cx - 27 * scale, cy - 2 * scale + dy - wingFlap * 0.4);
        ctx.quadraticCurveTo(cx - 19 * scale, cy + 3 * scale + dy - wingFlap * 0.2, cx - 16 * scale, cy + 7 * scale + dy);
        ctx.quadraticCurveTo(cx - 10 * scale, cy + 6 * scale + dy, cx - 6 * scale, cy + 2 * scale + dy);
        ctx.closePath();
        ctx.fill();

        // Left wing bone segments
        ctx.strokeStyle = wingBoneColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 4 * scale + dy);
        ctx.quadraticCurveTo(cx - 12 * scale, cy - 13 * scale + dy - wingFlap, cx - 24 * scale, cy - 11 * scale + dy - wingFlap * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 2 * scale + dy);
        ctx.quadraticCurveTo(cx - 14 * scale, cy - 6 * scale + dy - wingFlap * 0.6, cx - 27 * scale, cy - 2 * scale + dy - wingFlap * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 1 * scale + dy);
        ctx.quadraticCurveTo(cx - 10 * scale, cy + 1 * scale + dy - wingFlap * 0.3, cx - 16 * scale, cy + 7 * scale + dy);
        ctx.stroke();

        // Left wing veins
        ctx.strokeStyle = wingVeinColor;
        ctx.lineWidth = 0.7 * scale;
        for (let v = 0; v < 4; v++) {
          const vFrac = (v + 1) / 5;
          ctx.beginPath();
          const vx1 = cx - 6 * scale - vFrac * 12 * scale;
          const vy1 = cy - 4 * scale + dy - wingFlap * vFrac * 0.5;
          const vx2 = vx1 - 3 * scale;
          const vy2 = vy1 + 6 * scale + wingFlap * 0.1;
          ctx.moveTo(vx1, vy1);
          ctx.lineTo(vx2, vy2);
          ctx.stroke();
        }

        // Right wing membrane (scalloped edges with pointed finger tips)
        ctx.fillStyle = wingMembraneColor;
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 4 * scale + dy);
        ctx.quadraticCurveTo(cx + 12 * scale, cy - 15 * scale + dy - wingFlap, cx + 24 * scale, cy - 11 * scale + dy - wingFlap * 0.8);
        ctx.quadraticCurveTo(cx + 18 * scale, cy - 5 * scale + dy - wingFlap * 0.6, cx + 27 * scale, cy - 2 * scale + dy - wingFlap * 0.4);
        ctx.quadraticCurveTo(cx + 19 * scale, cy + 3 * scale + dy - wingFlap * 0.2, cx + 16 * scale, cy + 7 * scale + dy);
        ctx.quadraticCurveTo(cx + 10 * scale, cy + 6 * scale + dy, cx + 6 * scale, cy + 2 * scale + dy);
        ctx.closePath();
        ctx.fill();

        // Right wing bone segments
        ctx.strokeStyle = wingBoneColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 4 * scale + dy);
        ctx.quadraticCurveTo(cx + 12 * scale, cy - 13 * scale + dy - wingFlap, cx + 24 * scale, cy - 11 * scale + dy - wingFlap * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 2 * scale + dy);
        ctx.quadraticCurveTo(cx + 14 * scale, cy - 6 * scale + dy - wingFlap * 0.6, cx + 27 * scale, cy - 2 * scale + dy - wingFlap * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy + 1 * scale + dy);
        ctx.quadraticCurveTo(cx + 10 * scale, cy + 1 * scale + dy - wingFlap * 0.3, cx + 16 * scale, cy + 7 * scale + dy);
        ctx.stroke();

        // Right wing veins
        ctx.strokeStyle = wingVeinColor;
        ctx.lineWidth = 0.7 * scale;
        for (let v = 0; v < 4; v++) {
          const vFrac = (v + 1) / 5;
          ctx.beginPath();
          const vx1 = cx + 6 * scale + vFrac * 12 * scale;
          const vy1 = cy - 4 * scale + dy - wingFlap * vFrac * 0.5;
          const vx2 = vx1 + 3 * scale;
          const vy2 = vy1 + 6 * scale + wingFlap * 0.1;
          ctx.moveTo(vx1, vy1);
          ctx.lineTo(vx2, vy2);
          ctx.stroke();
        }

        // === LEGS / CLAWS (behind body lower portion) ===
        const legColor = "#6b0c2a";
        const clawColor = "#1c1917";

        // Left leg
        ctx.fillStyle = legColor;
        ctx.save();
        ctx.translate(cx - 5 * scale, cy + 6 * scale + dy);
        ctx.rotate(-0.15);
        ctx.fillRect(-1.5 * scale, 0, 3 * scale, 7 * scale);
        ctx.restore();
        // Left foot/claws
        ctx.fillStyle = clawColor;
        const leftFootX = cx - 5.5 * scale;
        const leftFootY = cy + 13 * scale + dy;
        ctx.beginPath();
        ctx.moveTo(leftFootX - 1 * scale, leftFootY);
        ctx.lineTo(leftFootX - 3 * scale, leftFootY + 2.5 * scale);
        ctx.lineTo(leftFootX - 0.5 * scale, leftFootY + 1 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(leftFootX, leftFootY);
        ctx.lineTo(leftFootX, leftFootY + 3 * scale);
        ctx.lineTo(leftFootX + 0.5 * scale, leftFootY + 1 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(leftFootX + 1 * scale, leftFootY);
        ctx.lineTo(leftFootX + 3 * scale, leftFootY + 2.5 * scale);
        ctx.lineTo(leftFootX + 0.5 * scale, leftFootY + 1 * scale);
        ctx.fill();

        // Right leg
        ctx.fillStyle = legColor;
        ctx.save();
        ctx.translate(cx + 5 * scale, cy + 6 * scale + dy);
        ctx.rotate(0.15);
        ctx.fillRect(-1.5 * scale, 0, 3 * scale, 7 * scale);
        ctx.restore();
        // Right foot/claws
        ctx.fillStyle = clawColor;
        const rightFootX = cx + 5.5 * scale;
        const rightFootY = cy + 13 * scale + dy;
        ctx.beginPath();
        ctx.moveTo(rightFootX - 1 * scale, rightFootY);
        ctx.lineTo(rightFootX - 3 * scale, rightFootY + 2.5 * scale);
        ctx.lineTo(rightFootX - 0.5 * scale, rightFootY + 1 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(rightFootX, rightFootY);
        ctx.lineTo(rightFootX, rightFootY + 3 * scale);
        ctx.lineTo(rightFootX + 0.5 * scale, rightFootY + 1 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(rightFootX + 1 * scale, rightFootY);
        ctx.lineTo(rightFootX + 3 * scale, rightFootY + 2.5 * scale);
        ctx.lineTo(rightFootX + 0.5 * scale, rightFootY + 1 * scale);
        ctx.fill();

        // === DRAGON BODY ===
        const bodyGrad = ctx.createLinearGradient(cx - 8 * scale, cy + dy, cx + 8 * scale, cy + dy);
        bodyGrad.addColorStop(0, "#4c0519");
        bodyGrad.addColorStop(0.3, "#7f1d2d");
        bodyGrad.addColorStop(0.5, "#9f1239");
        bodyGrad.addColorStop(0.7, "#7f1d2d");
        bodyGrad.addColorStop(1, "#4c0519");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + dy, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // === BELLY PLATES ===
        const bellyGrad = ctx.createLinearGradient(cx, cy - 6 * scale + dy, cx, cy + 8 * scale + dy);
        bellyGrad.addColorStop(0, "rgba(190, 50, 80, 0.4)");
        bellyGrad.addColorStop(0.5, "rgba(220, 80, 100, 0.3)");
        bellyGrad.addColorStop(1, "rgba(190, 50, 80, 0.4)");
        ctx.fillStyle = bellyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 1 * scale + dy, 4 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly plate segments
        ctx.strokeStyle = "rgba(160, 40, 70, 0.35)";
        ctx.lineWidth = 0.6 * scale;
        for (let i = 0; i < 6; i++) {
          const plateY = cy - 5 * scale + i * 2.5 * scale + dy;
          const plateW = (3.5 - Math.abs(i - 2.5) * 0.6) * scale;
          ctx.beginPath();
          ctx.moveTo(cx - plateW, plateY);
          ctx.quadraticCurveTo(cx, plateY + 0.8 * scale, cx + plateW, plateY);
          ctx.stroke();
        }

        // === BODY SCALES PATTERN ===
        ctx.fillStyle = "#be123c";
        for (let row = 0; row < 5; row++) {
          const rowY = cy - 6 * scale + row * 3.2 * scale + dy;
          const rowWidth = (6 - Math.abs(row - 2) * 1.2) * scale;
          const scaleCount = 3 + (row < 4 ? 1 : 0);
          for (let s = 0; s < scaleCount; s++) {
            const sx = cx - rowWidth + (s * 2 * rowWidth) / (scaleCount - 1 || 1);
            ctx.beginPath();
            ctx.arc(sx, rowY, 1.4 * scale, 0, Math.PI);
            ctx.fill();
          }
        }

        // Scale highlight
        ctx.fillStyle = "rgba(220, 60, 90, 0.3)";
        for (let row = 0; row < 4; row++) {
          const rowY = cy - 5.5 * scale + row * 3.2 * scale + dy;
          const rowWidth = (5 - Math.abs(row - 1.5) * 1.0) * scale;
          for (let s = 0; s < 3; s++) {
            const sx = cx - rowWidth + (s * 2 * rowWidth) / 2;
            ctx.beginPath();
            ctx.arc(sx, rowY - 0.3 * scale, 0.7 * scale, Math.PI, Math.PI * 2);
            ctx.fill();
          }
        }

        // === CHEST GLOW (internal fire) ===
        const chestGlowGrad = ctx.createRadialGradient(
          cx, cy - 2 * scale + dy, 0,
          cx, cy - 2 * scale + dy, 6 * scale
        );
        chestGlowGrad.addColorStop(0, `rgba(255, 160, 30, ${chestPulse * 0.45})`);
        chestGlowGrad.addColorStop(0.3, `rgba(255, 80, 20, ${chestPulse * 0.3})`);
        chestGlowGrad.addColorStop(0.6, `rgba(200, 30, 10, ${chestPulse * 0.15})`);
        chestGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = chestGlowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale + dy, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Chest core
        ctx.fillStyle = `rgba(255, 220, 100, ${chestPulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * scale + dy, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === DORSAL SPINES (back ridge) ===
        const spineColor1 = "#4c0519";
        const spineColor2 = "#881337";
        for (let i = 0; i < 7; i++) {
          const spineY = cy - 8 * scale + i * 2.5 * scale + dy;
          const spineH = (3.5 - Math.abs(i - 3) * 0.5) * scale;
          const spineW = (1.2 - Math.abs(i - 3) * 0.1) * scale;
          ctx.fillStyle = i % 2 === 0 ? spineColor1 : spineColor2;
          ctx.beginPath();
          ctx.moveTo(cx - spineW, spineY);
          ctx.lineTo(cx, spineY - spineH);
          ctx.lineTo(cx + spineW, spineY);
          ctx.closePath();
          ctx.fill();
        }

        // === NECK ===
        const neckGrad = ctx.createLinearGradient(cx - 4 * scale, cy - 10 * scale + dy, cx + 4 * scale, cy - 10 * scale + dy);
        neckGrad.addColorStop(0, "#5c0a1e");
        neckGrad.addColorStop(0.5, "#9f1239");
        neckGrad.addColorStop(1, "#5c0a1e");
        ctx.fillStyle = neckGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 8 * scale + dy);
        ctx.quadraticCurveTo(cx - 5 * scale, cy - 11 * scale + dy, cx - 3 * scale, cy - 13 * scale + dy);
        ctx.lineTo(cx + 3 * scale, cy - 13 * scale + dy);
        ctx.quadraticCurveTo(cx + 5 * scale, cy - 11 * scale + dy, cx + 4 * scale, cy - 8 * scale + dy);
        ctx.closePath();
        ctx.fill();

        // Neck scales
        ctx.fillStyle = "rgba(190, 18, 60, 0.4)";
        for (let i = 0; i < 3; i++) {
          const ny = cy - 9 * scale - i * 1.5 * scale + dy;
          ctx.beginPath();
          ctx.arc(cx, ny, 1.2 * scale, 0, Math.PI);
          ctx.fill();
        }

        // === HEAD ===
        const headGrad = ctx.createRadialGradient(
          cx, cy - 15 * scale + dy, 1 * scale,
          cx, cy - 15 * scale + dy, 6 * scale
        );
        headGrad.addColorStop(0, "#be123c");
        headGrad.addColorStop(0.6, "#9f1239");
        headGrad.addColorStop(1, "#7f1d2d");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15 * scale + dy, 6 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = "#9f1239";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 18.5 * scale + dy, 3.5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nostrils
        ctx.fillStyle = "#4c0519";
        ctx.beginPath();
        ctx.ellipse(cx - 1.2 * scale, cy - 19 * scale + dy, 0.6 * scale, 0.4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 1.2 * scale, cy - 19 * scale + dy, 0.6 * scale, 0.4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nostril smoke
        if (animated) {
          for (let n = 0; n < 2; n++) {
            const nDir = n === 0 ? -1 : 1;
            const smokeAlpha = 0.2 + Math.sin(t * 4 + n) * 0.1;
            ctx.fillStyle = `rgba(80, 80, 80, ${smokeAlpha})`;
            ctx.beginPath();
            ctx.arc(
              cx + nDir * 1.5 * scale + Math.sin(t * 3 + n) * 0.5 * scale,
              cy - 20 * scale + dy - Math.abs(Math.sin(t * 2 + n)) * 2 * scale,
              0.8 * scale, 0, Math.PI * 2
            );
            ctx.fill();
          }
        }

        // === JAW (open mouth with teeth) ===
        // Lower jaw
        ctx.fillStyle = "#7f1d2d";
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy - 16 * scale + dy);
        ctx.quadraticCurveTo(cx, cy - 14 * scale + jawOpen * scale + dy, cx + 3 * scale, cy - 16 * scale + dy);
        ctx.quadraticCurveTo(cx + 2 * scale, cy - 15 * scale + dy, cx, cy - 15.5 * scale + dy);
        ctx.quadraticCurveTo(cx - 2 * scale, cy - 15 * scale + dy, cx - 3 * scale, cy - 16 * scale + dy);
        ctx.closePath();
        ctx.fill();

        // Mouth interior
        ctx.fillStyle = `rgba(200, 40, 20, ${0.6 + chestPulse * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15.5 * scale + jawOpen * 0.3 * scale + dy, 2.5 * scale, jawOpen * 0.4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper fangs
        ctx.fillStyle = "#fef3c7";
        const fangLen = 1.8 * scale;
        // Left fang
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 17 * scale + dy);
        ctx.lineTo(cx - 2.3 * scale, cy - 17 * scale + fangLen + dy);
        ctx.lineTo(cx - 1.7 * scale, cy - 17 * scale + dy);
        ctx.closePath();
        ctx.fill();
        // Right fang
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale, cy - 17 * scale + dy);
        ctx.lineTo(cx + 2.3 * scale, cy - 17 * scale + fangLen + dy);
        ctx.lineTo(cx + 1.7 * scale, cy - 17 * scale + dy);
        ctx.closePath();
        ctx.fill();
        // Small teeth
        ctx.fillStyle = "#e8e0d0";
        for (let tooth = 0; tooth < 3; tooth++) {
          const toothX = cx - 1 * scale + tooth * 1 * scale;
          ctx.beginPath();
          ctx.moveTo(toothX - 0.3 * scale, cy - 17 * scale + dy);
          ctx.lineTo(toothX, cy - 17 * scale + 0.8 * scale + dy);
          ctx.lineTo(toothX + 0.3 * scale, cy - 17 * scale + dy);
          ctx.closePath();
          ctx.fill();
        }

        // === HORNS (enhanced with ridges) ===
        // Left horn
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 17 * scale + dy);
        ctx.quadraticCurveTo(cx - 6 * scale, cy - 21 * scale + dy, cx - 8 * scale, cy - 24 * scale + dy);
        ctx.lineTo(cx - 6.5 * scale, cy - 22 * scale + dy);
        ctx.quadraticCurveTo(cx - 4.5 * scale, cy - 19 * scale + dy, cx - 3 * scale, cy - 17.5 * scale + dy);
        ctx.closePath();
        ctx.fill();
        // Left horn ridges
        ctx.strokeStyle = "rgba(60, 50, 40, 0.4)";
        ctx.lineWidth = 0.4 * scale;
        for (let r = 0; r < 3; r++) {
          const rFrac = (r + 1) / 4;
          const rx = cx - 4 * scale - rFrac * 3 * scale;
          const ry = cy - 17 * scale - rFrac * 5.5 * scale + dy;
          ctx.beginPath();
          ctx.moveTo(rx - 0.8 * scale, ry + 0.5 * scale);
          ctx.lineTo(rx + 0.8 * scale, ry - 0.5 * scale);
          ctx.stroke();
        }

        // Right horn
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 17 * scale + dy);
        ctx.quadraticCurveTo(cx + 6 * scale, cy - 21 * scale + dy, cx + 8 * scale, cy - 24 * scale + dy);
        ctx.lineTo(cx + 6.5 * scale, cy - 22 * scale + dy);
        ctx.quadraticCurveTo(cx + 4.5 * scale, cy - 19 * scale + dy, cx + 3 * scale, cy - 17.5 * scale + dy);
        ctx.closePath();
        ctx.fill();
        // Right horn ridges
        ctx.strokeStyle = "rgba(60, 50, 40, 0.4)";
        ctx.lineWidth = 0.4 * scale;
        for (let r = 0; r < 3; r++) {
          const rFrac = (r + 1) / 4;
          const rx = cx + 4 * scale + rFrac * 3 * scale;
          const ry = cy - 17 * scale - rFrac * 5.5 * scale + dy;
          ctx.beginPath();
          ctx.moveTo(rx - 0.8 * scale, ry - 0.5 * scale);
          ctx.lineTo(rx + 0.8 * scale, ry + 0.5 * scale);
          ctx.stroke();
        }

        // Small secondary horns
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 15 * scale + dy);
        ctx.lineTo(cx - 6.5 * scale, cy - 18 * scale + dy);
        ctx.lineTo(cx - 4.5 * scale, cy - 15.5 * scale + dy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, cy - 15 * scale + dy);
        ctx.lineTo(cx + 6.5 * scale, cy - 18 * scale + dy);
        ctx.lineTo(cx + 4.5 * scale, cy - 15.5 * scale + dy);
        ctx.closePath();
        ctx.fill();

        // === EYE GLOW HALO ===
        const eyeGlowGrad1 = ctx.createRadialGradient(
          cx - 2.5 * scale, cy - 15 * scale + dy, 0,
          cx - 2.5 * scale, cy - 15 * scale + dy, 3.5 * scale
        );
        eyeGlowGrad1.addColorStop(0, `rgba(251, 191, 36, ${fireBreath * 0.5})`);
        eyeGlowGrad1.addColorStop(0.5, `rgba(251, 150, 20, ${fireBreath * 0.2})`);
        eyeGlowGrad1.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = eyeGlowGrad1;
        ctx.beginPath();
        ctx.arc(cx - 2.5 * scale, cy - 15 * scale + dy, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        const eyeGlowGrad2 = ctx.createRadialGradient(
          cx + 2.5 * scale, cy - 15 * scale + dy, 0,
          cx + 2.5 * scale, cy - 15 * scale + dy, 3.5 * scale
        );
        eyeGlowGrad2.addColorStop(0, `rgba(251, 191, 36, ${fireBreath * 0.5})`);
        eyeGlowGrad2.addColorStop(0.5, `rgba(251, 150, 20, ${fireBreath * 0.2})`);
        eyeGlowGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = eyeGlowGrad2;
        ctx.beginPath();
        ctx.arc(cx + 2.5 * scale, cy - 15 * scale + dy, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === GLOWING EYES ===
        ctx.fillStyle = `rgba(251, 191, 36, ${fireBreath})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, cy - 15 * scale + dy, 1.8 * scale, 1.3 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2.5 * scale, cy - 15 * scale + dy, 1.8 * scale, 1.3 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Eye slit pupils
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.ellipse(cx - 2.5 * scale, cy - 15 * scale + dy, 0.4 * scale, 1.1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 2.5 * scale, cy - 15 * scale + dy, 0.4 * scale, 1.1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye bright core
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx - 2.8 * scale, cy - 15.3 * scale + dy, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 2.2 * scale, cy - 15.3 * scale + dy, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === FIRE BREATH (dramatic multi-layer) ===
        if (animated) {
          // Outer fire glow cone
          const fireGlowGrad = ctx.createRadialGradient(
            cx, cy - 20 * scale + dy, 1 * scale,
            cx, cy - 24 * scale + dy, 10 * scale
          );
          fireGlowGrad.addColorStop(0, `rgba(255, 100, 20, ${fireBreath * 0.35})`);
          fireGlowGrad.addColorStop(0.5, `rgba(255, 60, 10, ${fireBreath * 0.15})`);
          fireGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = fireGlowGrad;
          ctx.beginPath();
          ctx.arc(cx, cy - 23 * scale + dy, 8 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Fire stream base
          ctx.fillStyle = `rgba(220, 40, 10, ${fireBreath * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(cx - 2 * scale, cy - 19 * scale + dy);
          ctx.quadraticCurveTo(cx - 4 * scale, cy - 24 * scale + dy, cx - 2 * scale + Math.sin(t * 6) * 2 * scale, cy - 28 * scale + dy);
          ctx.lineTo(cx + 2 * scale + Math.sin(t * 6 + 1) * 2 * scale, cy - 28 * scale + dy);
          ctx.quadraticCurveTo(cx + 4 * scale, cy - 24 * scale + dy, cx + 2 * scale, cy - 19 * scale + dy);
          ctx.closePath();
          ctx.fill();

          // Fire stream core (bright)
          ctx.fillStyle = `rgba(255, 200, 50, ${fireBreath * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(cx - 1 * scale, cy - 19 * scale + dy);
          ctx.quadraticCurveTo(cx - 1.5 * scale, cy - 23 * scale + dy, cx + Math.sin(t * 7) * scale, cy - 26 * scale + dy);
          ctx.quadraticCurveTo(cx + 1.5 * scale, cy - 23 * scale + dy, cx + 1 * scale, cy - 19 * scale + dy);
          ctx.closePath();
          ctx.fill();

          // Fire particles (large)
          for (let i = 0; i < 8; i++) {
            const fp = (t * 3 + i * 1.3) % 6;
            const fx = cx + Math.sin(t * 4 + i * 2) * (2 + fp) * scale;
            const fy = cy - 20 * scale + dy - fp * 2 * scale;
            const fSize = (2.5 - fp * 0.35) * scale;
            const fAlpha = Math.max(0, 0.7 - fp * 0.12);
            if (fSize > 0) {
              const fireColors = [
                `rgba(255, 220, 50, ${fAlpha})`,
                `rgba(255, 140, 20, ${fAlpha})`,
                `rgba(255, 60, 10, ${fAlpha})`,
                `rgba(200, 30, 5, ${fAlpha})`
              ];
              ctx.fillStyle = fireColors[i % 4];
              ctx.beginPath();
              ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Ember sparks flying upward
          for (let i = 0; i < 6; i++) {
            const sparkPhase = (t * 2.5 + i * 1.1) % 5;
            const sparkX = cx + Math.sin(t * 3 + i * 2.5) * (3 + sparkPhase * 1.5) * scale;
            const sparkY = cy - 22 * scale + dy - sparkPhase * 3 * scale;
            const sparkAlpha = Math.max(0, 0.8 - sparkPhase * 0.18);
            const sparkSize = (0.8 - sparkPhase * 0.12) * scale;
            if (sparkSize > 0) {
              ctx.fillStyle = `rgba(255, 255, 150, ${sparkAlpha})`;
              ctx.beginPath();
              ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // === WING EDGE GLOW (energy along wing tips) ===
        if (animated) {
          const wingGlowAlpha = 0.2 + Math.sin(t * 3) * 0.1;
          ctx.strokeStyle = `rgba(255, 120, 40, ${wingGlowAlpha})`;
          ctx.lineWidth = 1.2 * scale;
          // Left wing edge glow
          ctx.beginPath();
          ctx.moveTo(cx - 22 * scale, cy - 10 * scale + dy - wingFlap * 0.8);
          ctx.lineTo(cx - 24 * scale, cy - 2 * scale + dy - wingFlap * 0.4);
          ctx.quadraticCurveTo(cx - 20 * scale, cy + 4 * scale + dy - wingFlap * 0.2, cx - 14 * scale, cy + 6 * scale + dy);
          ctx.stroke();
          // Right wing edge glow
          ctx.beginPath();
          ctx.moveTo(cx + 22 * scale, cy - 10 * scale + dy - wingFlap * 0.8);
          ctx.lineTo(cx + 24 * scale, cy - 2 * scale + dy - wingFlap * 0.4);
          ctx.quadraticCurveTo(cx + 20 * scale, cy + 4 * scale + dy - wingFlap * 0.2, cx + 14 * scale, cy + 6 * scale + dy);
          ctx.stroke();
        }
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
      case "tiger_fan": {
        // TIGER FAN - Passionate figure with sign
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
        const pulseGlow = 0.4 + Math.sin(t * 3) * 0.2;

        // Toxic puddle - pooling poison beneath
        ctx.fillStyle = "rgba(54, 83, 20, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx + shamble * 0.2 * scale, cy + 13 * scale - bounce, 12 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(77, 124, 15, 0.25)";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale + shamble * 0.3 * scale, cy + 13 * scale - bounce, 8 * scale, 2.5 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(101, 163, 13, 0.2)";
        ctx.lineWidth = 0.5 * scale;
        for (let r = 0; r < 3; r++) {
          const rippleR = (4 + r * 3 + (t * 1.5 + r) % 4) * scale;
          ctx.beginPath();
          ctx.ellipse(cx + shamble * 0.2 * scale, cy + 13 * scale - bounce, rippleR, rippleR * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Toxic aura
        const bogGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 * scale);
        bogGrad.addColorStop(0, "rgba(54, 83, 20, 0.25)");
        bogGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bogGrad;
        ctx.beginPath();
        ctx.arc(cx + shamble * 0.3 * scale, cy - bounce, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Asymmetric lumpy body
        ctx.fillStyle = "#365314";
        ctx.beginPath();
        ctx.moveTo(cx - 9 * scale + shamble * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.quadraticCurveTo(cx - 12 * scale, cy + 4 * scale - bounce, cx - 10 * scale, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(cx - 6 * scale, cy - 11 * scale - bounce, cx - 1 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(cx + 3 * scale, cy - 12 * scale - bounce, cx + 7 * scale, cy - 7 * scale - bounce);
        ctx.quadraticCurveTo(cx + 11 * scale, cy - 1 * scale - bounce, cx + 10 * scale, cy + 6 * scale - bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy + 11 * scale - bounce, cx + 7 * scale - shamble * 0.2 * scale, cy + 12 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Body texture - mottled darker patches
        ctx.fillStyle = "#2d4a0e";
        ctx.beginPath();
        ctx.ellipse(cx - 4 * scale, cy + 2 * scale - bounce, 4 * scale, 3 * scale, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 5 * scale, cy - 2 * scale - bounce, 3 * scale, 2.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 1 * scale, cy + 7 * scale - bounce, 3.5 * scale, 2 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Slime highlights
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 2 * scale - bounce, 3 * scale, 2 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 4 * scale, cy + 4 * scale - bounce, 2 * scale, 1.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Vine tangles wrapping around body
        ctx.strokeStyle = "#2d4a0e";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, cy - 3 * scale - bounce);
        ctx.quadraticCurveTo(cx - 3 * scale, cy - 6 * scale - bounce, cx + 2 * scale, cy - 3 * scale - bounce);
        ctx.quadraticCurveTo(cx + 6 * scale, cy - 1 * scale - bounce, cx + 9 * scale, cy - 4 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy + 5 * scale - bounce);
        ctx.quadraticCurveTo(cx - 1 * scale, cy + 3 * scale - bounce, cx + 4 * scale, cy + 6 * scale - bounce);
        ctx.stroke();
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy - 5 * scale - bounce, 1.5 * scale, 0.8 * scale, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 5 * scale, cy - 2 * scale - bounce, 1.2 * scale, 0.6 * scale, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Embedded objects - skull fragment
        ctx.fillStyle = "#d6d3d1";
        ctx.strokeStyle = "#a8a29e";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(cx + 3 * scale, cy + 1 * scale - bounce, 1.5 * scale, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(cx + 2.5 * scale, cy + 0.5 * scale - bounce, 0.3 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Rib bone
        ctx.strokeStyle = "#d6d3d1";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy + 4 * scale - bounce);
        ctx.quadraticCurveTo(cx - 3 * scale, cy + 2 * scale - bounce, cx - 4 * scale, cy - bounce);
        ctx.stroke();
        // Stray twig
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy + 5 * scale - bounce);
        ctx.lineTo(cx + 8 * scale, cy + 3 * scale - bounce);
        ctx.lineTo(cx + 7 * scale, cy + 2 * scale - bounce);
        ctx.stroke();

        // Bioluminescent spots
        ctx.fillStyle = `rgba(134, 239, 172, ${pulseGlow * 0.7})`;
        ctx.beginPath();
        ctx.arc(cx - 6 * scale, cy - 1 * scale - bounce, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 7 * scale, cy + 3 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy + 6 * scale - bounce, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3 * scale, cy + 8 * scale - bounce, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(187, 247, 208, ${pulseGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx - 6 * scale, cy - 1 * scale - bounce, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 7 * scale, cy + 3 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Antennae/stalks - fungal growths from top
        ctx.strokeStyle = "#4d7c0f";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 9 * scale - bounce);
        ctx.quadraticCurveTo(cx - 4 * scale, cy - 14 * scale - bounce, cx - 3 * scale, cy - 17 * scale - bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 5 * scale, cy - 15 * scale - bounce, cx + 6 * scale, cy - 18 * scale - bounce);
        ctx.stroke();
        ctx.fillStyle = `rgba(163, 230, 53, ${pulseGlow})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 17 * scale - bounce, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 6 * scale, cy - 18 * scale - bounce, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(163, 230, 53, ${pulseGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 17 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 6 * scale, cy - 18 * scale - bounce, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Gaping maw with teeth
        ctx.fillStyle = "#1a2e05";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2 * scale - bounce, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d6d3d1";
        for (let ti = -3; ti <= 3; ti++) {
          const toothX = cx + ti * 1.2 * scale;
          const isTop = ti % 2 === 0;
          ctx.beginPath();
          if (isTop) {
            ctx.moveTo(toothX - 0.4 * scale, cy - 3.5 * scale - bounce);
            ctx.lineTo(toothX, cy - 1.5 * scale - bounce);
            ctx.lineTo(toothX + 0.4 * scale, cy - 3.5 * scale - bounce);
          } else {
            ctx.moveTo(toothX - 0.4 * scale, cy - 0.5 * scale - bounce);
            ctx.lineTo(toothX, cy - 2.5 * scale - bounce);
            ctx.lineTo(toothX + 0.4 * scale, cy - 0.5 * scale - bounce);
          }
          ctx.fill();
        }

        // Eye stalks with glowing eyes
        ctx.fillStyle = "#84cc16";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale + shamble * 0.1 * scale, cy - 6 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale + shamble * 0.1 * scale, cy - 7 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a2e05";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 6 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 7 * scale - bounce, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(132, 204, 22, ${pulseGlow * 0.4})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 6 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 7 * scale - bounce, 3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Multiple dripping tendrils
        ctx.strokeStyle = "#4d7c0f";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, cy + 4 * scale - bounce);
        ctx.quadraticCurveTo(cx - 10 * scale, cy + 9 * scale - bounce + sludgeDrip, cx - 9 * scale, cy + 14 * scale - bounce);
        ctx.stroke();
        ctx.lineWidth = 1.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * scale, cy + 8 * scale - bounce);
        ctx.quadraticCurveTo(cx - 5 * scale, cy + 12 * scale - bounce - sludgeDrip * 0.5, cx - 4 * scale, cy + 16 * scale - bounce);
        ctx.stroke();
        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy + 5 * scale - bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy + 10 * scale - bounce + sludgeDrip * 0.7, cx + 8 * scale, cy + 15 * scale - bounce);
        ctx.stroke();
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeStyle = "#3f6212";
        ctx.beginPath();
        ctx.moveTo(cx + 8 * scale, cy + 2 * scale - bounce);
        ctx.quadraticCurveTo(cx + 13 * scale, cy + 6 * scale - bounce - sludgeDrip * 0.3, cx + 12 * scale, cy + 12 * scale - bounce);
        ctx.stroke();

        // Dripping muck particles + toxic bubbles
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const dripY = cy + 8 * scale + (t * 3 + i * 2) % 8 * scale;
            const dripX = cx - 5 * scale + i * 3 * scale + shamble * 0.2 * scale;
            ctx.fillStyle = `rgba(77, 124, 15, ${0.5 - ((t * 3 + i * 2) % 8) / 16})`;
            ctx.beginPath();
            ctx.ellipse(dripX, dripY - bounce, 1 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          for (let b = 0; b < 4; b++) {
            const bubblePhase = (t * 2.5 + b * 1.7) % 4;
            const bubbleX = cx + (-6 + b * 4) * scale + shamble * 0.1 * scale;
            const bubbleY = cy - 3 * scale + b * 2 * scale - bounce;
            const bubbleSize = (0.5 + bubblePhase * 0.4) * scale;
            const bubbleAlpha = bubblePhase < 3 ? 0.4 - bubblePhase * 0.1 : 0;
            if (bubbleAlpha > 0) {
              ctx.strokeStyle = `rgba(163, 230, 53, ${bubbleAlpha})`;
              ctx.lineWidth = 0.4 * scale;
              ctx.beginPath();
              ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }
        break;
      }
      case "will_o_wisp": {
        // WILL-O'-WISP - Floating spirit light
        const wispFloat = Math.sin(t * 3) * 6;
        const wispPulse = 0.5 + Math.sin(t * 5) * 0.4;
        const wispDrift = Math.sin(t * 2) * 3;
        const colorShift = Math.sin(t * 1.5) * 0.5 + 0.5;
        const flickerPhase = Math.sin(t * 7) * 0.3 + Math.sin(t * 11) * 0.2;
        const wcx = cx + wispDrift * scale;
        const wcy = cy - 4 * scale - bounce - wispFloat;

        // Mesmerizing spiral pattern in the outer glow
        ctx.save();
        ctx.translate(wcx, wcy);
        ctx.rotate(t * 0.8);
        for (let i = 0; i < 3; i++) {
          const spiralAngle = t * 1.2 + i * (Math.PI * 2 / 3);
          const spiralR = (10 + Math.sin(t * 2 + i) * 2) * scale;
          const sx = Math.cos(spiralAngle) * spiralR;
          const sy = Math.sin(spiralAngle) * spiralR;
          const spiralGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 4 * scale);
          spiralGrad.addColorStop(0, `rgba(163, 230, 53, ${0.15 + wispPulse * 0.1})`);
          spiralGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = spiralGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Ethereal glow with color shift (green-to-yellow oscillation)
        const glowR = Math.round(132 + colorShift * 80);
        const glowG = Math.round(204 + colorShift * 45);
        const glowB = Math.round(22 - colorShift * 10);
        const wispGrad = ctx.createRadialGradient(wcx, wcy, 0, wcx, wcy, 18 * scale);
        wispGrad.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, ${wispPulse * 0.5})`);
        wispGrad.addColorStop(0.4, `rgba(${glowR + 20}, ${glowG}, ${glowB + 20}, ${wispPulse * 0.3})`);
        wispGrad.addColorStop(0.7, `rgba(${glowR}, ${glowG}, ${glowB}, ${wispPulse * 0.1})`);
        wispGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = wispGrad;
        ctx.beginPath();
        ctx.arc(wcx, wcy, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Light rays emanating from core
        ctx.save();
        ctx.translate(wcx, wcy);
        for (let i = 0; i < 8; i++) {
          const rayAngle = (i * Math.PI / 4) + Math.sin(t * 2 + i) * 0.2;
          const rayLen = (8 + Math.sin(t * 3 + i * 1.5) * 3) * scale;
          const rayAlpha = 0.08 + wispPulse * 0.06;
          ctx.strokeStyle = `rgba(254, 249, 195, ${rayAlpha})`;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(Math.cos(rayAngle) * 4 * scale, Math.sin(rayAngle) * 4 * scale);
          ctx.lineTo(Math.cos(rayAngle) * rayLen, Math.sin(rayAngle) * rayLen);
          ctx.stroke();
        }
        ctx.restore();

        // Ghostly ectoplasmic tail/trail
        const tailGrad = ctx.createLinearGradient(wcx, wcy, wcx - 3 * scale, wcy + 18 * scale);
        tailGrad.addColorStop(0, "rgba(132, 204, 22, 0.6)");
        tailGrad.addColorStop(0.4, "rgba(163, 230, 53, 0.3)");
        tailGrad.addColorStop(1, "rgba(163, 230, 53, 0)");
        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(wcx - 3 * scale, wcy + 2 * scale);
        ctx.quadraticCurveTo(
          wcx - 5 * scale + Math.sin(t * 4) * 2 * scale,
          wcy + 8 * scale,
          wcx - 2 * scale + Math.sin(t * 3) * 3 * scale,
          wcy + 14 * scale
        );
        ctx.quadraticCurveTo(
          wcx + Math.sin(t * 2.5) * 2 * scale,
          wcy + 18 * scale,
          wcx + 1 * scale + Math.sin(t * 3.5) * 2 * scale,
          wcy + 22 * scale
        );
        ctx.lineTo(wcx + 3 * scale + Math.sin(t * 3.5) * scale, wcy + 20 * scale);
        ctx.quadraticCurveTo(
          wcx + 2 * scale + Math.sin(t * 2.5) * scale,
          wcy + 15 * scale,
          wcx + 4 * scale + Math.sin(t * 4) * scale,
          wcy + 8 * scale
        );
        ctx.quadraticCurveTo(wcx + 3 * scale, wcy + 3 * scale, wcx + 3 * scale, wcy + 2 * scale);
        ctx.closePath();
        ctx.fill();

        // Trailing particles (expanded)
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const trailX = wcx - i * 1.5 * scale + Math.sin(t * 3 + i * 0.8) * 2 * scale;
            const trailY = wcy + i * 2 * scale + Math.cos(t * 2 + i) * scale;
            const trailAlpha = 0.5 - i * 0.06;
            const trailSize = (2.5 - i * 0.25) * scale;
            if (trailAlpha > 0 && trailSize > 0) {
              ctx.fillStyle = `rgba(163, 230, 53, ${trailAlpha})`;
              ctx.beginPath();
              ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Core flame body with flicker effect (irregular shape)
        const flameGrad = ctx.createRadialGradient(wcx, wcy, 0, wcx, wcy, 7 * scale);
        flameGrad.addColorStop(0, "#fef9c3");
        flameGrad.addColorStop(0.3, `rgb(${Math.round(132 + colorShift * 50)}, ${Math.round(204 + colorShift * 30)}, 22)`);
        flameGrad.addColorStop(0.7, "#65a30d");
        flameGrad.addColorStop(1, "rgba(101, 163, 13, 0)");
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        const flamePoints = 12;
        for (let i = 0; i <= flamePoints; i++) {
          const angle = (i / flamePoints) * Math.PI * 2;
          const flicker = 1 + Math.sin(t * 8 + angle * 3) * 0.25 + Math.sin(t * 13 + angle * 5) * 0.15;
          const topStretch = angle > Math.PI * 0.75 && angle < Math.PI * 1.25 ? 1.3 : 1;
          const r = 6 * scale * flicker * topStretch;
          const fx = wcx + Math.cos(angle) * r;
          const fy = wcy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(fx, fy);
          else ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        ctx.fill();

        // Flame tip that flickers upward
        ctx.fillStyle = `rgba(254, 249, 195, ${0.4 + flickerPhase * 0.3})`;
        ctx.beginPath();
        const tipHeight = (4 + Math.sin(t * 9) * 2 + Math.sin(t * 14) * 1.5) * scale;
        ctx.moveTo(wcx - 2.5 * scale, wcy - 3 * scale);
        ctx.quadraticCurveTo(wcx - scale + Math.sin(t * 6) * scale, wcy - tipHeight - 3 * scale, wcx, wcy - tipHeight - 5 * scale);
        ctx.quadraticCurveTo(wcx + scale + Math.sin(t * 7) * scale, wcy - tipHeight - 3 * scale, wcx + 2.5 * scale, wcy - 3 * scale);
        ctx.closePath();
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = `rgba(254, 249, 195, ${wispPulse})`;
        ctx.beginPath();
        ctx.arc(wcx, wcy, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Skull face detail - hollow eyes
        const faceAlpha = 0.6 + wispPulse * 0.25;
        ctx.fillStyle = `rgba(22, 101, 52, ${faceAlpha})`;
        ctx.beginPath();
        ctx.ellipse(wcx - 2 * scale, wcy - 1 * scale, 1.2 * scale, 1.6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(wcx + 2 * scale, wcy - 1 * scale, 1.2 * scale, 1.6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Skull nose cavity
        ctx.fillStyle = `rgba(22, 101, 52, ${faceAlpha * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(wcx, wcy + 0.5 * scale);
        ctx.lineTo(wcx - 0.6 * scale, wcy + 1.8 * scale);
        ctx.lineTo(wcx + 0.6 * scale, wcy + 1.8 * scale);
        ctx.closePath();
        ctx.fill();

        // Ethereal mouth - wavering grin
        ctx.strokeStyle = `rgba(22, 101, 52, ${faceAlpha * 0.8})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(wcx - 2 * scale, wcy + 2.5 * scale);
        ctx.quadraticCurveTo(wcx - scale, wcy + 3.5 * scale + Math.sin(t * 4) * 0.5 * scale, wcx, wcy + 3 * scale);
        ctx.quadraticCurveTo(wcx + scale, wcy + 3.5 * scale + Math.sin(t * 4 + 1) * 0.5 * scale, wcx + 2 * scale, wcy + 2.5 * scale);
        ctx.stroke();

        // Orbiting smaller wisps (3 satellite lights)
        for (let i = 0; i < 3; i++) {
          const orbitAngle = t * (2 + i * 0.3) + i * (Math.PI * 2 / 3);
          const orbitR = (10 + Math.sin(t * 1.5 + i) * 2) * scale;
          const orbitX = wcx + Math.cos(orbitAngle) * orbitR;
          const orbitY = wcy + Math.sin(orbitAngle) * orbitR * 0.6;
          const orbGrad = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, 3 * scale);
          orbGrad.addColorStop(0, `rgba(254, 249, 195, ${0.7 + Math.sin(t * 6 + i) * 0.2})`);
          orbGrad.addColorStop(0.5, "rgba(163, 230, 53, 0.4)");
          orbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(orbitX, orbitY, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          if (animated) {
            for (let j = 1; j <= 3; j++) {
              const trailAngle = orbitAngle - j * 0.3;
              const tx = wcx + Math.cos(trailAngle) * orbitR;
              const ty = wcy + Math.sin(trailAngle) * orbitR * 0.6;
              ctx.fillStyle = `rgba(163, 230, 53, ${0.3 - j * 0.08})`;
              ctx.beginPath();
              ctx.arc(tx, ty, (1.5 - j * 0.3) * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Particle field - floating embers/sparks
        if (animated) {
          for (let i = 0; i < 10; i++) {
            const seed = i * 137.5;
            const px = wcx + Math.sin(t * 1.2 + seed) * (12 + i * 1.5) * scale;
            const py = wcy + Math.cos(t * 0.9 + seed) * (8 + i) * scale - Math.sin(t * 2 + seed) * 3 * scale;
            const pAlpha = 0.15 + Math.sin(t * 3 + seed) * 0.12;
            const pSize = (0.8 + Math.sin(t * 4 + seed) * 0.4) * scale;
            ctx.fillStyle = `rgba(${Math.round(200 + colorShift * 55)}, ${Math.round(230 + colorShift * 25)}, ${Math.round(50 - colorShift * 30)}, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case "swamp_troll": {
        // SWAMP TROLL - Massive regenerating brute
        const trollStomp = Math.sin(t * 1.2) * 2;
        const clubSwing = Math.sin(t * 1.5) * 10;
        const regenPulse = 0.3 + Math.sin(t * 2.5) * 0.15;

        // Ground crack/mud - impact area at feet
        ctx.fillStyle = "rgba(60, 40, 20, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 15 * scale - bounce + trollStomp, 13 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(40, 25, 10, 0.5)";
        ctx.lineWidth = 0.8 * scale;
        for (let i = 0; i < 5; i++) {
          const crackAngle = (i / 5) * Math.PI - Math.PI * 0.1;
          const crackLen = (4 + i * 1.5) * scale;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(crackAngle) * 4 * scale, cy + 15 * scale - bounce + trollStomp);
          ctx.lineTo(cx + Math.cos(crackAngle) * crackLen, cy + 15 * scale - bounce + trollStomp + Math.sin(crackAngle) * 2 * scale);
          ctx.stroke();
        }

        // Murky aura
        const trollGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * scale);
        trollGrad.addColorStop(0, "rgba(77, 124, 15, 0.2)");
        trollGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = trollGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + trollStomp, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Regeneration glow - subtle green healing pulse
        const regenGrad = ctx.createRadialGradient(cx, cy - bounce + trollStomp, 2 * scale, cx, cy - bounce + trollStomp, 16 * scale);
        regenGrad.addColorStop(0, `rgba(134, 239, 172, ${regenPulse * 0.3})`);
        regenGrad.addColorStop(0.5, `rgba(74, 222, 128, ${regenPulse * 0.15})`);
        regenGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = regenGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce + trollStomp, 16 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Large flat feet with claws
        ctx.fillStyle = "#3f6212";
        ctx.beginPath();
        ctx.ellipse(cx - 6 * scale, cy + 14 * scale - bounce + trollStomp, 5 * scale, 2.5 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 6 * scale, cy + 14 * scale - bounce + trollStomp, 5 * scale, 2.5 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#44403c";
        for (let f = -1; f <= 1; f++) {
          ctx.beginPath();
          ctx.moveTo(cx - 6 * scale + f * 2.5 * scale, cy + 14 * scale - bounce + trollStomp);
          ctx.lineTo(cx - 6 * scale + f * 3.5 * scale, cy + 17 * scale - bounce + trollStomp);
          ctx.lineTo(cx - 6 * scale + f * 1.5 * scale, cy + 14.5 * scale - bounce + trollStomp);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx + 6 * scale + f * 2.5 * scale, cy + 14 * scale - bounce + trollStomp);
          ctx.lineTo(cx + 6 * scale + f * 3.5 * scale, cy + 17 * scale - bounce + trollStomp);
          ctx.lineTo(cx + 6 * scale + f * 1.5 * scale, cy + 14.5 * scale - bounce + trollStomp);
          ctx.fill();
        }

        // Massive body
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy + 14 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx - 13 * scale, cy - bounce + trollStomp, cx - 8 * scale, cy - 10 * scale - bounce + trollStomp);
        ctx.lineTo(cx + 8 * scale, cy - 10 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx + 13 * scale, cy - bounce + trollStomp, cx + 11 * scale, cy + 14 * scale - bounce + trollStomp);
        ctx.closePath();
        ctx.fill();

        // Thick warty skin - bumps on body
        ctx.fillStyle = "#3d6b0c";
        const wartPositions: [number, number][] = [
          [-5, -4], [3, -1], [-7, 3], [6, 6], [-2, 8], [8, 1], [-8, -2], [4, 9],
        ];
        for (const [wx, wy] of wartPositions) {
          ctx.beginPath();
          ctx.arc(cx + wx * scale, cy + wy * scale - bounce + trollStomp, (0.8 + Math.abs(wx % 3) * 0.3) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#5a8f1a";
        for (const [wx, wy] of wartPositions) {
          ctx.beginPath();
          ctx.arc(cx + wx * scale - 0.3 * scale, cy + wy * scale - 0.3 * scale - bounce + trollStomp, 0.4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Belly detail - lighter chest area with stretch marks
        const bellyGrad = ctx.createRadialGradient(
          cx, cy + 4 * scale - bounce + trollStomp, 0,
          cx, cy + 4 * scale - bounce + trollStomp, 7 * scale
        );
        bellyGrad.addColorStop(0, "#6b8e23");
        bellyGrad.addColorStop(0.7, "#5a7c1a");
        bellyGrad.addColorStop(1, "rgba(77, 124, 15, 0)");
        ctx.fillStyle = bellyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4 * scale - bounce + trollStomp, 6 * scale, 7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(54, 83, 20, 0.4)";
        ctx.lineWidth = 0.5 * scale;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + i * 2 * scale, cy + 1 * scale - bounce + trollStomp);
          ctx.quadraticCurveTo(cx + i * 2.5 * scale, cy + 5 * scale - bounce + trollStomp, cx + i * 1.8 * scale, cy + 9 * scale - bounce + trollStomp);
          ctx.stroke();
        }

        // Mossy patches on body
        ctx.fillStyle = "#365314";
        ctx.beginPath();
        ctx.ellipse(cx - 4 * scale, cy - 2 * scale - bounce + trollStomp, 3 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5 * scale, cy + 4 * scale - bounce + trollStomp, 2.5 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Shoulder moss patches with lichen
        ctx.fillStyle = "#2d4a0e";
        ctx.beginPath();
        ctx.ellipse(cx - 10 * scale, cy - 6 * scale - bounce + trollStomp, 3.5 * scale, 2 * scale, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10 * scale, cy - 6 * scale - bounce + trollStomp, 3 * scale, 1.8 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a3b18a";
        ctx.beginPath();
        ctx.arc(cx - 10 * scale, cy - 6 * scale - bounce + trollStomp, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 9 * scale, cy - 5.5 * scale - bounce + trollStomp, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Parasitic growths - mushrooms
        ctx.fillStyle = "#a16207";
        ctx.fillRect(cx - 9 * scale - 0.5 * scale, cy - 4 * scale - bounce + trollStomp, 1 * scale, 3 * scale);
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.ellipse(cx - 9 * scale, cy - 5 * scale - bounce + trollStomp, 2 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx - 9.5 * scale, cy - 5.3 * scale - bounce + trollStomp, 0.4 * scale, 0, Math.PI * 2);
        ctx.arc(cx - 8.3 * scale, cy - 4.8 * scale - bounce + trollStomp, 0.3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a16207";
        ctx.fillRect(cx + 7 * scale, cy + 1 * scale - bounce + trollStomp, 0.8 * scale, 2.5 * scale);
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.ellipse(cx + 7.4 * scale, cy + 0.5 * scale - bounce + trollStomp, 1.5 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Vine growths
        ctx.strokeStyle = "#365314";
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 3 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx - 8 * scale, cy - 6 * scale - bounce + trollStomp, cx - 11 * scale, cy - 5 * scale - bounce + trollStomp);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy + 2 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx + 7 * scale, cy - 1 * scale - bounce + trollStomp, cx + 10 * scale, cy + 1 * scale - bounce + trollStomp);
        ctx.stroke();

        // Muscular left arm
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, cy - 6 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx - 16 * scale, cy - 4 * scale - bounce + trollStomp, cx - 15 * scale, cy + 2 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx - 14 * scale, cy + 4 * scale - bounce + trollStomp, cx - 11 * scale, cy + 2 * scale - bounce + trollStomp);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#3f6212";
        ctx.beginPath();
        ctx.arc(cx - 15 * scale, cy + 3 * scale - bounce + trollStomp, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#365314";
        for (let k = -1; k <= 1; k++) {
          ctx.beginPath();
          ctx.arc(cx - 15 * scale + k * 1.5 * scale, cy + 2 * scale - bounce + trollStomp, 0.7 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Right arm (holding club)
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.moveTo(cx + 11 * scale, cy - 6 * scale - bounce + trollStomp);
        ctx.quadraticCurveTo(cx + 16 * scale, cy - 4 * scale - bounce + trollStomp, cx + 14 * scale, cy - bounce + trollStomp);
        ctx.quadraticCurveTo(cx + 13 * scale, cy + 2 * scale - bounce + trollStomp, cx + 11 * scale, cy - bounce + trollStomp);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = "#4d7c0f";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 14 * scale - bounce + trollStomp, 7 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brow ridge
        ctx.fillStyle = "#3f6212";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 16 * scale - bounce + trollStomp, 6 * scale, 1.5 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Flat wide nose/snout
        ctx.fillStyle = "#3f6212";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 12 * scale - bounce + trollStomp, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2d4a0e";
        ctx.beginPath();
        ctx.arc(cx - 1 * scale, cy - 11.8 * scale - bounce + trollStomp, 0.6 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 1 * scale, cy - 11.8 * scale - bounce + trollStomp, 0.6 * scale, 0, Math.PI * 2);
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
        ctx.strokeStyle = "#365314";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 16 * scale - bounce + trollStomp);
        ctx.lineTo(cx - 2 * scale, cy - 15.5 * scale - bounce + trollStomp);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5 * scale, cy - 16 * scale - bounce + trollStomp);
        ctx.lineTo(cx + 2 * scale, cy - 15.5 * scale - bounce + trollStomp);
        ctx.stroke();

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

        // Club with spikes
        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 4 * scale - bounce + trollStomp);
        ctx.rotate(clubSwing * Math.PI / 180);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-2 * scale, -10 * scale, 4 * scale, 14 * scale);
        ctx.fillStyle = "#57534e";
        ctx.beginPath();
        ctx.arc(0, -10 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#44403c";
        for (let s = 0; s < 4; s++) {
          const sAngle = s * Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(sAngle) * 3.5 * scale, -10 * scale + Math.sin(sAngle) * 3.5 * scale);
          ctx.lineTo(Math.cos(sAngle) * 6 * scale, -10 * scale + Math.sin(sAngle) * 6 * scale);
          ctx.lineTo(Math.cos(sAngle + 0.3) * 3 * scale, -10 * scale + Math.sin(sAngle + 0.3) * 3 * scale);
          ctx.fill();
        }
        ctx.restore();

        // Dripping moss/slime
        if (animated) {
          for (let i = 0; i < 6; i++) {
            const dripPhase = (t * 2 + i * 1.3) % 6;
            const dripX = cx + (-8 + i * 3.2) * scale;
            const dripStartY = cy + 2 * scale - bounce + trollStomp;
            const dripY = dripStartY + dripPhase * 3 * scale;
            const dripAlpha = Math.max(0, 0.6 - dripPhase / 6);
            ctx.fillStyle = `rgba(77, 124, 15, ${dripAlpha})`;
            ctx.beginPath();
            ctx.ellipse(dripX, dripY, 0.8 * scale, (1.2 + dripPhase * 0.3) * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
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
        // GIANT SCORPION - Armored desert predator with chitinous plating
        const clawSnap = Math.sin(t * 3) * 8;
        const tailCurl = Math.sin(t * 2) * 10;
        const legWalk = animated ? t * 4 : 0;
        const venomPulse = 0.5 + Math.sin(t * 4) * 0.5;
        const mandibleOpen = Math.sin(t * 4) * 0.15;

        // Shadow beneath body
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 13 * scale - bounce, 15 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Sand dust cloud
        ctx.fillStyle = "rgba(120, 53, 15, 0.12)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 11 * scale - bounce, 16 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sand particles kicked up by legs
        if (animated) {
          ctx.fillStyle = "rgba(194, 139, 65, 0.4)";
          for (let sp = 0; sp < 8; sp++) {
            const spx = cx + Math.sin(t * 3 + sp * 1.7) * 13 * scale;
            const spy = cy + 10 * scale - bounce - Math.abs(Math.sin(t * 4 + sp * 2.1)) * 4 * scale;
            const spr = (0.5 + Math.sin(t * 5 + sp) * 0.3) * scale;
            ctx.beginPath();
            ctx.arc(spx, spy, spr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- 8 LEGS (4 per side) with articulation ---
        ctx.lineCap = "round";
        for (let side = -1; side <= 1; side += 2) {
          for (let li = 0; li < 4; li++) {
            const legPhase = Math.sin(legWalk + li * 1.2 + (side > 0 ? Math.PI : 0)) * 2 * scale;
            const baseX = cx + side * (3 + li * 2.2) * scale;
            const baseY = cy + (2 - li * 1.5) * scale - bounce;
            const midX = baseX + side * 5 * scale;
            const midY = baseY + 4 * scale + legPhase;
            const tipX = midX + side * 3 * scale;
            const tipY = midY + 4 * scale;

            // Upper leg segment
            const legUpperGrad = ctx.createLinearGradient(baseX, baseY, midX, midY);
            legUpperGrad.addColorStop(0, "#78350f");
            legUpperGrad.addColorStop(1, "#6b2f0a");
            ctx.strokeStyle = legUpperGrad;
            ctx.lineWidth = 2.2 * scale;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(midX, midY);
            ctx.stroke();

            // Knee joint
            ctx.fillStyle = "#5a2508";
            ctx.beginPath();
            ctx.arc(midX, midY, 1 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Lower leg segment
            const legLowerGrad = ctx.createLinearGradient(midX, midY, tipX, tipY);
            legLowerGrad.addColorStop(0, "#6b2f0a");
            legLowerGrad.addColorStop(1, "#4a1e06");
            ctx.strokeStyle = legLowerGrad;
            ctx.lineWidth = 1.6 * scale;
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Tiny claw at leg tip
            ctx.fillStyle = "#3d1a05";
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX + side * 1.2 * scale, tipY + 1 * scale);
            ctx.lineTo(tipX + side * 0.2 * scale, tipY + 1.5 * scale);
            ctx.closePath();
            ctx.fill();
          }
        }

        // --- BODY SEGMENTS (5 segments rear to front) ---
        // Rear abdomen
        const bodyGrad1 = ctx.createRadialGradient(cx, cy + 6 * scale - bounce, 0, cx, cy + 6 * scale - bounce, 9 * scale);
        bodyGrad1.addColorStop(0, "#a0520f");
        bodyGrad1.addColorStop(0.5, "#92400e");
        bodyGrad1.addColorStop(0.8, "#78350f");
        bodyGrad1.addColorStop(1, "#5a2508");
        ctx.fillStyle = bodyGrad1;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6 * scale - bounce, 9 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Carapace ridges on rear
        ctx.strokeStyle = "rgba(146, 64, 14, 0.5)";
        ctx.lineWidth = 0.8 * scale;
        for (let ri = -1; ri <= 1; ri++) {
          ctx.beginPath();
          ctx.moveTo(cx - 5 * scale, cy + (5 + ri * 2) * scale - bounce);
          ctx.lineTo(cx + 5 * scale, cy + (5 + ri * 2) * scale - bounce);
          ctx.stroke();
        }

        // Chitin highlight on rear
        ctx.fillStyle = "rgba(210, 150, 80, 0.15)";
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, cy + 4 * scale - bounce, 4 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Mid-rear segment
        const bodyGrad2 = ctx.createRadialGradient(cx, cy + 1 * scale - bounce, 0, cx, cy + 1 * scale - bounce, 8 * scale);
        bodyGrad2.addColorStop(0, "#a0520f");
        bodyGrad2.addColorStop(0.6, "#78350f");
        bodyGrad2.addColorStop(1, "#5a2508");
        ctx.fillStyle = bodyGrad2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 1 * scale - bounce, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mid-rear ridge
        ctx.strokeStyle = "rgba(100, 40, 10, 0.35)";
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy + 1 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy + 1 * scale - bounce);
        ctx.stroke();

        // Middle segment
        const bodyGrad3 = ctx.createRadialGradient(cx, cy - 3.5 * scale - bounce, 0, cx, cy - 3.5 * scale - bounce, 7.5 * scale);
        bodyGrad3.addColorStop(0, "#a0520f");
        bodyGrad3.addColorStop(0.5, "#78350f");
        bodyGrad3.addColorStop(1, "#5a2508");
        ctx.fillStyle = bodyGrad3;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 3.5 * scale - bounce, 7.5 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chitin highlight on mid
        ctx.fillStyle = "rgba(180, 120, 60, 0.2)";
        ctx.beginPath();
        ctx.ellipse(cx - 1 * scale, cy - 4.5 * scale - bounce, 3 * scale, 2 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Front-mid segment (thorax)
        const bodyGrad4 = ctx.createRadialGradient(cx, cy - 7.5 * scale - bounce, 0, cx, cy - 7.5 * scale - bounce, 7 * scale);
        bodyGrad4.addColorStop(0, "#92400e");
        bodyGrad4.addColorStop(0.6, "#78350f");
        bodyGrad4.addColorStop(1, "#5a2508");
        ctx.fillStyle = bodyGrad4;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 7.5 * scale - bounce, 7 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Longitudinal ridges on thorax
        ctx.strokeStyle = "rgba(100, 40, 10, 0.3)";
        ctx.lineWidth = 0.7 * scale;
        for (let ri = -2; ri <= 2; ri++) {
          ctx.beginPath();
          ctx.moveTo(cx + ri * 2 * scale, cy - 9.5 * scale - bounce);
          ctx.lineTo(cx + ri * 2 * scale, cy - 5.5 * scale - bounce);
          ctx.stroke();
        }

        // Head / prosoma
        const scorpHeadGrad = ctx.createRadialGradient(cx, cy - 11 * scale - bounce, 0, cx, cy - 11 * scale - bounce, 6 * scale);
        scorpHeadGrad.addColorStop(0, "#a0520f");
        scorpHeadGrad.addColorStop(0.5, "#78350f");
        scorpHeadGrad.addColorStop(1, "#5a2508");
        ctx.fillStyle = scorpHeadGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 11 * scale - bounce, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chitin gloss on head
        ctx.fillStyle = "rgba(210, 150, 80, 0.18)";
        ctx.beginPath();
        ctx.ellipse(cx - 1 * scale, cy - 12 * scale - bounce, 2.5 * scale, 1.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // --- MULTIPLE EYES (8 in a row) ---
        ctx.fillStyle = "#fbbf24";
        for (let ei = 0; ei < 8; ei++) {
          const ex = cx + (ei - 3.5) * 1.2 * scale;
          const ey = cy - 12.5 * scale - bounce;
          const er = (ei >= 2 && ei <= 5) ? 1.0 * scale : 0.6 * scale;
          ctx.beginPath();
          ctx.arc(ex, ey, er, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eye shine highlights
        ctx.fillStyle = "rgba(255, 255, 200, 0.5)";
        for (let ei = 2; ei <= 5; ei++) {
          ctx.beginPath();
          ctx.arc(cx + (ei - 3.5) * 1.2 * scale - 0.3 * scale, cy - 12.8 * scale - bounce, 0.35 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- MANDIBLES ---
        ctx.strokeStyle = "#5a2508";
        ctx.lineWidth = 1.5 * scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx - 2 * scale, cy - 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx - 4 * scale,
          cy - 16 * scale - bounce - mandibleOpen * 10 * scale,
          cx - 3 * scale,
          cy - 17 * scale - bounce
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 2 * scale, cy - 14 * scale - bounce);
        ctx.quadraticCurveTo(
          cx + 4 * scale,
          cy - 16 * scale - bounce - mandibleOpen * 10 * scale,
          cx + 3 * scale,
          cy - 17 * scale - bounce
        );
        ctx.stroke();

        // Mandible tips
        ctx.fillStyle = "#3d1a05";
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 17 * scale - bounce, 0.6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 3 * scale, cy - 17 * scale - bounce, 0.6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // --- ENHANCED CLAWS / PINCERS ---
        // Left claw
        ctx.save();
        ctx.translate(cx - 7.5 * scale, cy - 9 * scale - bounce);
        ctx.rotate(-0.3 - clawSnap * Math.PI / 180 * 0.5);

        // Claw arm with gradient
        const leftArmGrad = ctx.createLinearGradient(0, 0, -8 * scale, 0);
        leftArmGrad.addColorStop(0, "#92400e");
        leftArmGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = leftArmGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-3 * scale, -1.5 * scale);
        ctx.lineTo(-8 * scale, -2.5 * scale);
        ctx.lineTo(-8 * scale, 1 * scale);
        ctx.lineTo(-3 * scale, 1.5 * scale);
        ctx.closePath();
        ctx.fill();

        // Arm highlight
        ctx.fillStyle = "rgba(180, 120, 60, 0.2)";
        ctx.beginPath();
        ctx.ellipse(-4 * scale, -0.3 * scale, 2.5 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper pincer jaw
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.moveTo(-8 * scale, -2.5 * scale);
        ctx.quadraticCurveTo(
          -13 * scale,
          -4.5 * scale - clawSnap * 0.08 * scale,
          -11.5 * scale,
          -1 * scale
        );
        ctx.lineTo(-8 * scale, 0);
        ctx.closePath();
        ctx.fill();

        // Lower pincer jaw
        ctx.fillStyle = "#7a3510";
        ctx.beginPath();
        ctx.moveTo(-8 * scale, 1 * scale);
        ctx.quadraticCurveTo(
          -13 * scale,
          3.5 * scale + clawSnap * 0.08 * scale,
          -11.5 * scale,
          0
        );
        ctx.lineTo(-8 * scale, 0);
        ctx.closePath();
        ctx.fill();

        // Serration teeth on inner jaws
        ctx.fillStyle = "#4a1e06";
        for (let si = 0; si < 4; si++) {
          const sx = -8.5 * scale - si * 0.9 * scale;
          const syu = -1.5 * scale - clawSnap * 0.02 * scale;
          ctx.beginPath();
          ctx.moveTo(sx, syu);
          ctx.lineTo(sx - 0.4 * scale, syu + 0.7 * scale);
          ctx.lineTo(sx + 0.4 * scale, syu + 0.3 * scale);
          ctx.closePath();
          ctx.fill();
        }
        for (let si = 0; si < 4; si++) {
          const sx = -8.5 * scale - si * 0.9 * scale;
          const syl = 0.5 * scale + clawSnap * 0.02 * scale;
          ctx.beginPath();
          ctx.moveTo(sx, syl);
          ctx.lineTo(sx - 0.4 * scale, syl - 0.7 * scale);
          ctx.lineTo(sx + 0.4 * scale, syl - 0.3 * scale);
          ctx.closePath();
          ctx.fill();
        }

        // Pincer edge highlight
        ctx.strokeStyle = "rgba(210, 150, 80, 0.25)";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-8 * scale, -2.5 * scale);
        ctx.quadraticCurveTo(-12 * scale, -4 * scale, -11.5 * scale, -1 * scale);
        ctx.stroke();

        ctx.restore();

        // Right claw (mirrored)
        ctx.save();
        ctx.translate(cx + 7.5 * scale, cy - 9 * scale - bounce);
        ctx.rotate(0.3 + clawSnap * Math.PI / 180 * 0.5);

        const rightArmGrad = ctx.createLinearGradient(0, 0, 8 * scale, 0);
        rightArmGrad.addColorStop(0, "#92400e");
        rightArmGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = rightArmGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(3 * scale, -1.5 * scale);
        ctx.lineTo(8 * scale, -2.5 * scale);
        ctx.lineTo(8 * scale, 1 * scale);
        ctx.lineTo(3 * scale, 1.5 * scale);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(180, 120, 60, 0.2)";
        ctx.beginPath();
        ctx.ellipse(4 * scale, -0.3 * scale, 2.5 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.moveTo(8 * scale, -2.5 * scale);
        ctx.quadraticCurveTo(
          13 * scale,
          -4.5 * scale - clawSnap * 0.08 * scale,
          11.5 * scale,
          -1 * scale
        );
        ctx.lineTo(8 * scale, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#7a3510";
        ctx.beginPath();
        ctx.moveTo(8 * scale, 1 * scale);
        ctx.quadraticCurveTo(
          13 * scale,
          3.5 * scale + clawSnap * 0.08 * scale,
          11.5 * scale,
          0
        );
        ctx.lineTo(8 * scale, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#4a1e06";
        for (let si = 0; si < 4; si++) {
          const sx = 8.5 * scale + si * 0.9 * scale;
          const syu = -1.5 * scale - clawSnap * 0.02 * scale;
          ctx.beginPath();
          ctx.moveTo(sx, syu);
          ctx.lineTo(sx + 0.4 * scale, syu + 0.7 * scale);
          ctx.lineTo(sx - 0.4 * scale, syu + 0.3 * scale);
          ctx.closePath();
          ctx.fill();
        }
        for (let si = 0; si < 4; si++) {
          const sx = 8.5 * scale + si * 0.9 * scale;
          const syl = 0.5 * scale + clawSnap * 0.02 * scale;
          ctx.beginPath();
          ctx.moveTo(sx, syl);
          ctx.lineTo(sx + 0.4 * scale, syl - 0.7 * scale);
          ctx.lineTo(sx - 0.4 * scale, syl - 0.3 * scale);
          ctx.closePath();
          ctx.fill();
        }

        ctx.strokeStyle = "rgba(210, 150, 80, 0.25)";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(8 * scale, -2.5 * scale);
        ctx.quadraticCurveTo(12 * scale, -4 * scale, 11.5 * scale, -1 * scale);
        ctx.stroke();

        ctx.restore();

        // --- MULTI-SEGMENTED TAIL (5 joints) ---
        const tailJoints: { x: number; y: number }[] = [];
        let tjx = cx;
        let tjy = cy + 7 * scale - bounce;
        tailJoints.push({ x: tjx, y: tjy });
        const tailAngles = [
          -0.6 + tailCurl * 0.01,
          -1.0 + tailCurl * 0.015,
          -1.3 + tailCurl * 0.02,
          -1.5 + tailCurl * 0.025,
          -1.6 + tailCurl * 0.03,
        ];
        const segLen = 4 * scale;
        for (let ti = 0; ti < 5; ti++) {
          tjx = tjx - Math.cos(tailAngles[ti]) * segLen;
          tjy = tjy + Math.sin(tailAngles[ti]) * segLen - 2.5 * scale;
          tailJoints.push({ x: tjx, y: tjy });
        }

        // Draw tail segments with decreasing thickness
        for (let ti = 0; ti < tailJoints.length - 1; ti++) {
          const tw = (3.5 - ti * 0.5) * scale;
          const j0 = tailJoints[ti];
          const j1 = tailJoints[ti + 1];

          const tSegGrad = ctx.createLinearGradient(j0.x, j0.y, j1.x, j1.y);
          tSegGrad.addColorStop(0, "#78350f");
          tSegGrad.addColorStop(0.5, "#92400e");
          tSegGrad.addColorStop(1, "#78350f");
          ctx.strokeStyle = tSegGrad;
          ctx.lineWidth = tw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(j0.x, j0.y);
          ctx.lineTo(j1.x, j1.y);
          ctx.stroke();

          // Joint node
          ctx.fillStyle = "#6b2f0a";
          ctx.beginPath();
          ctx.arc(j1.x, j1.y, tw * 0.45, 0, Math.PI * 2);
          ctx.fill();

          // Segment ridge highlight
          ctx.fillStyle = "rgba(180, 120, 60, 0.15)";
          ctx.beginPath();
          ctx.arc(
            (j0.x + j1.x) / 2 - 0.5 * scale,
            (j0.y + j1.y) / 2 - 0.5 * scale,
            tw * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // --- STINGER ---
        const stingerBase = tailJoints[tailJoints.length - 1];
        const stingerTipX = stingerBase.x - 2 * scale;
        const stingerTipY = stingerBase.y - 4 * scale;

        // Stinger body
        const stingerGrad = ctx.createLinearGradient(stingerBase.x, stingerBase.y, stingerTipX, stingerTipY);
        stingerGrad.addColorStop(0, "#b45309");
        stingerGrad.addColorStop(1, "#1a0a00");
        ctx.fillStyle = stingerGrad;
        ctx.beginPath();
        ctx.moveTo(stingerBase.x - 2 * scale, stingerBase.y);
        ctx.lineTo(stingerTipX, stingerTipY);
        ctx.lineTo(stingerBase.x + 2 * scale, stingerBase.y);
        ctx.closePath();
        ctx.fill();

        // Stinger glint
        ctx.fillStyle = "rgba(255, 220, 150, 0.3)";
        ctx.beginPath();
        ctx.arc(stingerTipX + 0.3 * scale, stingerTipY + 1 * scale, 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Venomous glow aura
        const venomGlow = ctx.createRadialGradient(
          stingerTipX, stingerTipY, 0,
          stingerTipX, stingerTipY, 6 * scale
        );
        venomGlow.addColorStop(0, `rgba(163, 230, 53, ${venomPulse * 0.4})`);
        venomGlow.addColorStop(0.5, `rgba(132, 204, 22, ${venomPulse * 0.15})`);
        venomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = venomGlow;
        ctx.beginPath();
        ctx.arc(stingerTipX, stingerTipY, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Venom drip
        if (animated) {
          const dripProgress = (t * 20) % (8 * scale);
          const dripAlpha = 1 - dripProgress / (8 * scale);
          ctx.fillStyle = `rgba(163, 230, 53, ${dripAlpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(stingerTipX, stingerTipY + dripProgress, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Secondary smaller drip offset in time
          const drip2 = (t * 20 + 4 * scale) % (8 * scale);
          const drip2Alpha = 1 - drip2 / (8 * scale);
          ctx.fillStyle = `rgba(163, 230, 53, ${drip2Alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(stingerTipX + 0.3 * scale, stingerTipY + drip2, 0.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

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
        // MOUNTAIN YETI - Massive ice titan with primal fury
        const yetiWalk = Math.sin(t * 1.5);
        const frostBreath = 0.5 + Math.sin(t * 2) * 0.3;
        const frostPulse = 0.6 + Math.sin(t * 2.5) * 0.4;
        const armSwing = Math.sin(t * 1.5) * 8;
        const bodyBob = Math.abs(Math.sin(t * 1.5)) * scale;

        // Blizzard aura
        const yetiGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 * scale);
        yetiGrad.addColorStop(0, `rgba(224, 242, 254, ${frostBreath * 0.3})`);
        yetiGrad.addColorStop(0.5, `rgba(186, 230, 253, ${frostBreath * 0.15})`);
        yetiGrad.addColorStop(0.7, `rgba(147, 197, 253, ${frostPulse * 0.08})`);
        yetiGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = yetiGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - bounce, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Snow swirl particles around the body
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const snowAngle = t * 1.5 + i * Math.PI * 0.25;
            const snowDist = (10 + Math.sin(t + i) * 4) * scale;
            const snowX = cx + Math.cos(snowAngle) * snowDist;
            const snowY = cy - 4 * scale + Math.sin(snowAngle) * snowDist * 0.4 - bounce;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - (i % 4) / 8})`;
            ctx.beginPath();
            ctx.arc(snowX, snowY, (1 + Math.sin(t * 3 + i) * 0.5) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Articulated legs with massive furry thighs and clawed feet
        const leftLegSwing = yetiWalk * 0.15;
        const rightLegSwing = -yetiWalk * 0.15;

        // Left leg
        ctx.save();
        ctx.translate(cx - 6 * scale, cy + 6 * scale - bounce);
        ctx.rotate(leftLegSwing);
        ctx.fillStyle = "#bae6fd";
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * scale, 7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Clawed foot
        ctx.translate(0, 8 * scale);
        ctx.rotate(Math.max(0, -yetiWalk) * 0.2);
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.ellipse(1 * scale, 2 * scale, 4.5 * scale, 2 * scale, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Toe claws
        ctx.fillStyle = "#0f172a";
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(-2 * scale + c * 2 * scale, 3.5 * scale);
          ctx.lineTo(-1.5 * scale + c * 2 * scale, 5.5 * scale);
          ctx.lineTo(-1 * scale + c * 2 * scale, 3.5 * scale);
          ctx.fill();
        }
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(cx + 6 * scale, cy + 6 * scale - bounce);
        ctx.rotate(rightLegSwing);
        ctx.fillStyle = "#bae6fd";
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * scale, 7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.ellipse(0, 4 * scale, 4 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(0, 8 * scale);
        ctx.rotate(Math.max(0, yetiWalk) * 0.2);
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.ellipse(-1 * scale, 2 * scale, 4.5 * scale, 2 * scale, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(-2 * scale + c * 2 * scale, 3.5 * scale);
          ctx.lineTo(-1.5 * scale + c * 2 * scale, 5.5 * scale);
          ctx.lineTo(-1 * scale + c * 2 * scale, 3.5 * scale);
          ctx.fill();
        }
        ctx.restore();

        // Massive furry body with muscle definition
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.moveTo(cx - 12 * scale, cy + 10 * scale - bounce - bodyBob);
        ctx.quadraticCurveTo(
          cx - 15 * scale, cy - 2 * scale - bounce - bodyBob,
          cx - 10 * scale, cy - 12 * scale - bounce - bodyBob
        );
        ctx.lineTo(cx + 10 * scale, cy - 12 * scale - bounce - bodyBob);
        ctx.quadraticCurveTo(
          cx + 15 * scale, cy - 2 * scale - bounce - bodyBob,
          cx + 12 * scale, cy + 10 * scale - bounce - bodyBob
        );
        ctx.closePath();
        ctx.fill();

        // Belly with darker fur and muscle definition
        ctx.fillStyle = "#bae6fd";
        ctx.beginPath();
        ctx.ellipse(
          cx, cy + 2 * scale - bounce - bodyBob,
          7 * scale, 8 * scale, 0, 0, Math.PI * 2
        );
        ctx.fill();
        // Chest muscle lines
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8 * scale - bounce - bodyBob);
        ctx.lineTo(cx, cy + 4 * scale - bounce - bodyBob);
        ctx.stroke();
        // Chest scars / battle marks
        ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 4 * scale - bounce - bodyBob);
        ctx.lineTo(cx - 1 * scale, cy - 1 * scale - bounce - bodyBob);
        ctx.moveTo(cx - 3 * scale, cy - 3 * scale - bounce - bodyBob);
        ctx.lineTo(cx - 5 * scale, cy - 1 * scale - bounce - bodyBob);
        ctx.stroke();

        // Enhanced fur texture with layered shading
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 6; i++) {
          const fx = cx - 10 * scale + i * 4 * scale;
          ctx.beginPath();
          ctx.moveTo(fx, cy - 6 * scale - bounce - bodyBob);
          ctx.lineTo(
            fx + Math.sin(i) * 2 * scale,
            cy + 4 * scale - bounce - bodyBob
          );
          ctx.stroke();
        }
        ctx.strokeStyle = "#7dd3fc";
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 4; i++) {
          const fx = cx - 8 * scale + i * 5 * scale;
          ctx.beginPath();
          ctx.moveTo(fx + 1 * scale, cy - 4 * scale - bounce - bodyBob);
          ctx.lineTo(fx + 1.5 * scale, cy + 2 * scale - bounce - bodyBob);
          ctx.stroke();
        }

        // Ice crystals embedded in shoulders and back
        ctx.fillStyle = `rgba(147, 197, 253, ${0.7 + frostPulse * 0.3})`;
        const crystalPositions = [
          [-9, -8], [-7, -10], [9, -8], [7, -10], [0, -11]
        ];
        for (const [ox, oy] of crystalPositions) {
          const ix = cx + ox * scale;
          const iy = cy + oy * scale - bounce - bodyBob;
          ctx.beginPath();
          ctx.moveTo(ix, iy - 2.5 * scale);
          ctx.lineTo(ix + 1.5 * scale, iy);
          ctx.lineTo(ix, iy + 2.5 * scale);
          ctx.lineTo(ix - 1.5 * scale, iy);
          ctx.closePath();
          ctx.fill();
        }

        // Head with pronounced brow
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.ellipse(
          cx, cy - 16 * scale - bounce - bodyBob,
          8 * scale, 6.5 * scale, 0, 0, Math.PI * 2
        );
        ctx.fill();

        // Brow ridge
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.ellipse(
          cx, cy - 19 * scale - bounce - bodyBob,
          7 * scale, 2.5 * scale, 0, Math.PI, Math.PI * 2
        );
        ctx.fill();

        // Horns/tusks
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, cy - 14 * scale - bounce - bodyBob);
        ctx.quadraticCurveTo(
          cx - 10 * scale, cy - 12 * scale - bounce - bodyBob,
          cx - 12 * scale, cy - 16 * scale - bounce - bodyBob
        );
        ctx.quadraticCurveTo(
          cx - 9 * scale, cy - 13 * scale - bounce - bodyBob,
          cx - 6 * scale, cy - 13.5 * scale - bounce - bodyBob
        );
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, cy - 14 * scale - bounce - bodyBob);
        ctx.quadraticCurveTo(
          cx + 10 * scale, cy - 12 * scale - bounce - bodyBob,
          cx + 12 * scale, cy - 16 * scale - bounce - bodyBob
        );
        ctx.quadraticCurveTo(
          cx + 9 * scale, cy - 13 * scale - bounce - bodyBob,
          cx + 6 * scale, cy - 13.5 * scale - bounce - bodyBob
        );
        ctx.fill();

        // Face fur pattern (lighter)
        ctx.fillStyle = "#f0f9ff";
        ctx.beginPath();
        ctx.ellipse(
          cx, cy - 15 * scale - bounce - bodyBob,
          5 * scale, 4 * scale, 0, 0, Math.PI * 2
        );
        ctx.fill();

        // Fierce eyes with icy glow
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.ellipse(
          cx - 3 * scale, cy - 16 * scale - bounce - bodyBob,
          2.2 * scale, 1.5 * scale, -0.15, 0, Math.PI * 2
        );
        ctx.ellipse(
          cx + 3 * scale, cy - 16 * scale - bounce - bodyBob,
          2.2 * scale, 1.5 * scale, 0.15, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = `rgba(56, 189, 248, ${frostBreath + 0.2})`;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 16 * scale - bounce - bodyBob, 1.2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 16 * scale - bounce - bodyBob, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Snout / nose
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.ellipse(
          cx, cy - 14 * scale - bounce - bodyBob,
          2 * scale, 1 * scale, 0, 0, Math.PI * 2
        );
        ctx.fill();

        // Roaring mouth with massive fangs
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * scale - bounce - bodyBob, 3.5 * scale, 0, Math.PI);
        ctx.fill();
        // Upper fangs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx - 2.5 * scale, cy - 12 * scale - bounce - bodyBob);
        ctx.lineTo(cx - 2 * scale, cy - 9.5 * scale - bounce - bodyBob);
        ctx.lineTo(cx - 1.5 * scale, cy - 12 * scale - bounce - bodyBob);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 2.5 * scale, cy - 12 * scale - bounce - bodyBob);
        ctx.lineTo(cx + 2 * scale, cy - 9.5 * scale - bounce - bodyBob);
        ctx.lineTo(cx + 1.5 * scale, cy - 12 * scale - bounce - bodyBob);
        ctx.fill();
        // Row of smaller teeth
        ctx.fillStyle = "#e2e8f0";
        for (let tooth = 0; tooth < 3; tooth++) {
          const tx = cx - 1 * scale + tooth * 1 * scale;
          ctx.beginPath();
          ctx.moveTo(tx, cy - 12 * scale - bounce - bodyBob);
          ctx.lineTo(tx + 0.4 * scale, cy - 10.8 * scale - bounce - bodyBob);
          ctx.lineTo(tx + 0.8 * scale, cy - 12 * scale - bounce - bodyBob);
          ctx.fill();
        }

        // Frost breath visible from mouth
        if (animated) {
          ctx.fillStyle = `rgba(200, 240, 255, ${frostBreath * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 11 * scale - bounce - bodyBob);
          ctx.quadraticCurveTo(
            cx + 6 * scale + Math.sin(t * 4) * 2 * scale,
            cy - 13 * scale - bounce - bodyBob,
            cx + 10 * scale, cy - 11 * scale - bounce - bodyBob
          );
          ctx.quadraticCurveTo(
            cx + 6 * scale, cy - 10 * scale - bounce - bodyBob,
            cx, cy - 11 * scale - bounce - bodyBob
          );
          ctx.fill();
        }

        // Massive arms with stride swing
        ctx.fillStyle = "#e0f2fe";
        ctx.save();
        ctx.translate(cx - 12 * scale, cy - 6 * scale - bounce - bodyBob);
        ctx.rotate(-0.3 + armSwing * Math.PI / 180);
        ctx.fillRect(-3.5 * scale, 0, 7 * scale, 14 * scale);
        // Arm fur detail
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 3 * scale);
        ctx.lineTo(-2.5 * scale, 6 * scale);
        ctx.moveTo(1 * scale, 4 * scale);
        ctx.lineTo(0.5 * scale, 8 * scale);
        ctx.stroke();
        // Icicle claws on left hand
        ctx.fillStyle = `rgba(147, 197, 253, ${0.8 + frostPulse * 0.2})`;
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(-2 * scale + c * 2 * scale, 14 * scale);
          ctx.lineTo(-1.5 * scale + c * 2 * scale, 17 * scale);
          ctx.lineTo(-1 * scale + c * 2 * scale, 14 * scale);
          ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(cx + 12 * scale, cy - 6 * scale - bounce - bodyBob);
        ctx.rotate(0.3 - armSwing * Math.PI / 180);
        ctx.fillStyle = "#e0f2fe";
        ctx.fillRect(-3.5 * scale, 0, 7 * scale, 14 * scale);
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(-1 * scale, 3 * scale);
        ctx.lineTo(-1.5 * scale, 6 * scale);
        ctx.moveTo(2 * scale, 4 * scale);
        ctx.lineTo(1.5 * scale, 8 * scale);
        ctx.stroke();
        ctx.fillStyle = `rgba(147, 197, 253, ${0.8 + frostPulse * 0.2})`;
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(-2 * scale + c * 2 * scale, 14 * scale);
          ctx.lineTo(-1.5 * scale + c * 2 * scale, 17 * scale);
          ctx.lineTo(-1 * scale + c * 2 * scale, 14 * scale);
          ctx.fill();
        }
        ctx.restore();

        break;
      }
      case "ice_witch": {
        // FROST SORCERESS - Elegant ice mage
        const magicPulse = 0.6 + Math.sin(t * 3) * 0.4;
        const staffGlow = Math.sin(t * 4) * 0.2;
        const capeFlow = Math.sin(t * 1.5) * 3;
        const hairFlow = Math.sin(t * 2) * 2;
        const breathPulse = Math.max(0, Math.sin(t * 2.5)) * 0.6;
        const frostShimmer = 0.5 + Math.sin(t * 5) * 0.3;

        // Snowflake mandala ground effect
        ctx.save();
        ctx.translate(cx, cy + 13 * scale - bounce);
        ctx.scale(1, 0.3);
        const mandalaGrad = ctx.createRadialGradient(0, 0, 2 * scale, 0, 0, 15 * scale);
        mandalaGrad.addColorStop(0, `rgba(147, 197, 253, ${magicPulse * 0.25})`);
        mandalaGrad.addColorStop(0.5, `rgba(96, 165, 250, ${magicPulse * 0.12})`);
        mandalaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mandalaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(191, 219, 254, ${magicPulse * 0.4})`;
        ctx.lineWidth = 0.6 * scale;
        // Snowflake arms on the mandala
        for (let i = 0; i < 6; i++) {
          const sa = (i / 6) * Math.PI * 2 + t * 0.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(sa) * 12 * scale, Math.sin(sa) * 12 * scale);
          ctx.stroke();
          // Branches on each arm
          const midX = Math.cos(sa) * 7 * scale;
          const midY = Math.sin(sa) * 7 * scale;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + Math.cos(sa + 0.5) * 3 * scale, midY + Math.sin(sa + 0.5) * 3 * scale);
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + Math.cos(sa - 0.5) * 3 * scale, midY + Math.sin(sa - 0.5) * 3 * scale);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Ice magic aura - enhanced
        const witchGrad = ctx.createRadialGradient(cx, cy - 4 * scale, 0, cx, cy - 4 * scale, 18 * scale);
        witchGrad.addColorStop(0, `rgba(96, 165, 250, ${magicPulse * 0.35})`);
        witchGrad.addColorStop(0.3, `rgba(147, 197, 253, ${magicPulse * 0.2})`);
        witchGrad.addColorStop(0.6, `rgba(191, 219, 254, ${magicPulse * 0.1})`);
        witchGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = witchGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * scale - bounce, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Cape/mantle flowing behind with frost particles
        ctx.save();
        ctx.translate(cx, cy - 8 * scale - bounce);
        const capeGrad = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 22 * scale);
        capeGrad.addColorStop(0, "#1e3a8a");
        capeGrad.addColorStop(0.5, "#1e40af");
        capeGrad.addColorStop(1, "#172554");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(-5 * scale, -2 * scale);
        ctx.quadraticCurveTo(-10 * scale + capeFlow * 0.4 * scale, 8 * scale, -12 * scale + capeFlow * 0.6 * scale, 22 * scale);
        ctx.lineTo(-7 * scale + capeFlow * 0.3 * scale, 22 * scale);
        ctx.quadraticCurveTo(-6 * scale, 6 * scale, -3 * scale, -1 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5 * scale, -2 * scale);
        ctx.quadraticCurveTo(10 * scale - capeFlow * 0.4 * scale, 8 * scale, 12 * scale - capeFlow * 0.6 * scale, 22 * scale);
        ctx.lineTo(7 * scale - capeFlow * 0.3 * scale, 22 * scale);
        ctx.quadraticCurveTo(6 * scale, 6 * scale, 3 * scale, -1 * scale);
        ctx.closePath();
        ctx.fill();
        // Frost particles trailing off cape edges
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const px = (-11 + i * 0.5 + capeFlow * 0.5) * scale + Math.sin(t * 3 + i * 1.5) * 1.5 * scale;
            const py = (18 + i * 1.5) * scale;
            ctx.fillStyle = `rgba(191, 219, 254, ${0.4 - i * 0.08})`;
            ctx.beginPath();
            ctx.arc(px, py, (1.2 - i * 0.15) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          for (let i = 0; i < 4; i++) {
            const px = (11 - i * 0.5 - capeFlow * 0.5) * scale + Math.sin(t * 3 + i * 1.5 + 2) * 1.5 * scale;
            const py = (18 + i * 1.5) * scale;
            ctx.fillStyle = `rgba(191, 219, 254, ${0.4 - i * 0.08})`;
            ctx.beginPath();
            ctx.arc(px, py, (1.2 - i * 0.15) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // Elegant robes with fur trim
        const robeGrad = ctx.createLinearGradient(cx - 8 * scale, cy - 10 * scale, cx + 8 * scale, cy + 14 * scale);
        robeGrad.addColorStop(0, "#2563eb");
        robeGrad.addColorStop(0.3, "#3b82f6");
        robeGrad.addColorStop(0.7, "#1e40af");
        robeGrad.addColorStop(1, "#1e3a8a");
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale + capeFlow * 0.3 * scale, cy + 14 * scale - bounce);
        ctx.quadraticCurveTo(cx - 9 * scale, cy - bounce, cx - 5 * scale, cy - 10 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 10 * scale - bounce);
        ctx.quadraticCurveTo(cx + 9 * scale, cy - bounce, cx + 8 * scale - capeFlow * 0.3 * scale, cy + 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();

        // Fur trim at robe edges
        ctx.fillStyle = "#e2e8f0";
        for (let i = 0; i < 12; i++) {
          const frac = i / 11;
          const fx = cx + (-8 + 16 * frac) * scale + capeFlow * 0.3 * (frac - 0.5) * scale;
          const fy = cy + 14 * scale - bounce;
          ctx.beginPath();
          ctx.arc(fx, fy, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        // Fur trim at neckline
        for (let i = 0; i < 6; i++) {
          const frac = i / 5;
          const nx = cx + (-4 + 8 * frac) * scale;
          const ny = cy - 10 * scale - bounce;
          ctx.beginPath();
          ctx.arc(nx, ny, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Embroidered snowflake patterns on robe
        ctx.strokeStyle = `rgba(147, 197, 253, ${frostShimmer * 0.5})`;
        ctx.lineWidth = 0.5 * scale;
        const snowflakePositions = [
          { x: -3, y: 0 }, { x: 2, y: 4 }, { x: -4, y: 7 }, { x: 3, y: 9 },
        ];
        for (const sp of snowflakePositions) {
          const sx = cx + sp.x * scale;
          const sy = cy + sp.y * scale - bounce;
          for (let arm = 0; arm < 6; arm++) {
            const a = (arm / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(a) * 1.5 * scale, sy + Math.sin(a) * 1.5 * scale);
            ctx.stroke();
          }
        }

        // Ornate belt with ice gem clasp
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(cx - 6 * scale, cy + 1 * scale - bounce, 12 * scale, 1.5 * scale);
        ctx.fillStyle = `rgba(56, 189, 248, ${0.8 + staffGlow})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 0.5 * scale - bounce);
        ctx.lineTo(cx + 1.5 * scale, cy + 1.8 * scale - bounce);
        ctx.lineTo(cx, cy + 3 * scale - bounce);
        ctx.lineTo(cx - 1.5 * scale, cy + 1.8 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#bfdbfe";
        ctx.lineWidth = 0.3 * scale;
        ctx.stroke();

        // Hands with frost energy between fingers
        for (const hx of [-1, 1]) {
          const handX = cx + hx * 7 * scale;
          const handY = cy + 2 * scale - bounce;
          ctx.fillStyle = "#e0f2fe";
          ctx.beginPath();
          ctx.ellipse(handX, handY, 2 * scale, 1.5 * scale, hx * 0.2, 0, Math.PI * 2);
          ctx.fill();
          // Frost patterns on hands
          ctx.strokeStyle = `rgba(147, 197, 253, ${frostShimmer})`;
          ctx.lineWidth = 0.3 * scale;
          ctx.beginPath();
          ctx.arc(handX, handY, 1.2 * scale, 0, Math.PI);
          ctx.stroke();
          // Frost energy between fingers
          if (animated && hx === -1) {
            const frostGlow = ctx.createRadialGradient(handX, handY, 0, handX, handY, 3 * scale);
            frostGlow.addColorStop(0, `rgba(96, 165, 250, ${magicPulse * 0.4})`);
            frostGlow.addColorStop(1, "rgba(96, 165, 250, 0)");
            ctx.fillStyle = frostGlow;
            ctx.beginPath();
            ctx.arc(handX, handY, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Pale face with frost patterns
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * scale - bounce, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Frost patterns on visible skin
        ctx.strokeStyle = `rgba(147, 197, 253, ${frostShimmer * 0.6})`;
        ctx.lineWidth = 0.4 * scale;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 13 * scale - bounce, 1.5 * scale, 0.8, 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 3 * scale, cy - 13 * scale - bounce, 1.5 * scale, 1.0, 2.4);
        ctx.stroke();
        // Subtle cheek blush (frost-kissed)
        ctx.fillStyle = "rgba(191, 219, 254, 0.3)";
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 13 * scale - bounce, 1.5 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 13 * scale - bounce, 1.5 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flowing hair - long white/silver flowing behind with frost particles
        const hairGrad = ctx.createLinearGradient(cx, cy - 18 * scale - bounce, cx - 6 * scale, cy + 2 * scale - bounce);
        hairGrad.addColorStop(0, "#f1f5f9");
        hairGrad.addColorStop(0.4, "#e2e8f0");
        hairGrad.addColorStop(1, "#cbd5e1");
        ctx.fillStyle = hairGrad;
        // Hair strands flowing to the left
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, cy - 17 * scale - bounce);
        ctx.quadraticCurveTo(cx - 7 * scale + hairFlow * 0.5 * scale, cy - 10 * scale - bounce, cx - 8 * scale + hairFlow * 0.7 * scale, cy - 2 * scale - bounce);
        ctx.quadraticCurveTo(cx - 9 * scale + hairFlow * 0.8 * scale, cy + 2 * scale - bounce, cx - 7 * scale + hairFlow * 0.6 * scale, cy + 4 * scale - bounce);
        ctx.lineTo(cx - 5 * scale + hairFlow * 0.3 * scale, cy + 2 * scale - bounce);
        ctx.quadraticCurveTo(cx - 6 * scale, cy - 6 * scale - bounce, cx - 3 * scale, cy - 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        // Right side hair
        ctx.beginPath();
        ctx.moveTo(cx + 4 * scale, cy - 17 * scale - bounce);
        ctx.quadraticCurveTo(cx + 6 * scale - hairFlow * 0.3 * scale, cy - 10 * scale - bounce, cx + 7 * scale - hairFlow * 0.4 * scale, cy - 4 * scale - bounce);
        ctx.quadraticCurveTo(cx + 7.5 * scale - hairFlow * 0.5 * scale, cy - bounce, cx + 6 * scale - hairFlow * 0.3 * scale, cy + 2 * scale - bounce);
        ctx.lineTo(cx + 4.5 * scale, cy - bounce);
        ctx.quadraticCurveTo(cx + 5 * scale, cy - 8 * scale - bounce, cx + 3 * scale, cy - 14 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        // Hair frost particles
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const hpx = cx - 7 * scale + hairFlow * 0.6 * scale + Math.sin(t * 2.5 + i * 1.3) * 2 * scale;
            const hpy = cy + (-2 + i * 1.5) * scale - bounce;
            ctx.fillStyle = `rgba(219, 234, 254, ${0.4 - i * 0.06})`;
            ctx.beginPath();
            ctx.arc(hpx, hpy, (0.8 - i * 0.08) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Frost breath mist
        if (animated) {
          for (let i = 0; i < 3; i++) {
            const bx = cx + (1 + i * 1.5) * scale + Math.sin(t * 4 + i) * 0.8 * scale;
            const by = cy - 12 * scale - bounce - i * 0.8 * scale;
            ctx.fillStyle = `rgba(191, 219, 254, ${breathPulse * (0.3 - i * 0.08)})`;
            ctx.beginPath();
            ctx.arc(bx, by, (1.5 - i * 0.3) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Detailed ice crown with 5 points and gem
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, cy - 17 * scale - bounce);
        ctx.lineTo(cx - 4 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx - 2.5 * scale, cy - 18.5 * scale - bounce);
        ctx.lineTo(cx - 1 * scale, cy - 23 * scale - bounce);
        ctx.lineTo(cx, cy - 19 * scale - bounce);
        ctx.lineTo(cx + 1 * scale, cy - 23 * scale - bounce);
        ctx.lineTo(cx + 2.5 * scale, cy - 18.5 * scale - bounce);
        ctx.lineTo(cx + 4 * scale, cy - 22 * scale - bounce);
        ctx.lineTo(cx + 5 * scale, cy - 17 * scale - bounce);
        ctx.closePath();
        ctx.fill();
        // Crown edge highlight
        ctx.strokeStyle = "#bfdbfe";
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        // Center gem on crown
        ctx.fillStyle = `rgba(56, 189, 248, ${0.8 + staffGlow})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 19.5 * scale - bounce, 1.3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(cx - 0.3 * scale, cy - 20 * scale - bounce, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing blue eyes
        ctx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 14 * scale - bounce, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
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

        // Enhanced ice staff with frost tendrils
        ctx.save();
        ctx.translate(cx + 9 * scale, cy - bounce);
        // Staff shaft with gradient
        const shaftGrad = ctx.createLinearGradient(0, -16 * scale, 0, 14 * scale);
        shaftGrad.addColorStop(0, "#93c5fd");
        shaftGrad.addColorStop(0.5, "#bfdbfe");
        shaftGrad.addColorStop(1, "#dbeafe");
        ctx.fillStyle = shaftGrad;
        ctx.fillRect(-1.2 * scale, -14 * scale, 2.4 * scale, 26 * scale);
        // Frost tendrils wrapping the shaft
        ctx.strokeStyle = `rgba(147, 197, 253, ${frostShimmer * 0.7})`;
        ctx.lineWidth = 0.6 * scale;
        for (let i = 0; i < 5; i++) {
          const ty = -12 * scale + i * 5 * scale;
          ctx.beginPath();
          ctx.moveTo(-1.5 * scale, ty);
          ctx.quadraticCurveTo(2.5 * scale, ty + 1.5 * scale, -1.5 * scale, ty + 3 * scale);
          ctx.stroke();
        }
        // Ice crystal orb on top
        const orbGrad = ctx.createRadialGradient(0, -18 * scale, 0.5 * scale, 0, -18 * scale, 4.5 * scale);
        orbGrad.addColorStop(0, `rgba(219, 234, 254, ${0.9 + staffGlow})`);
        orbGrad.addColorStop(0.3, `rgba(96, 165, 250, ${0.7 + staffGlow})`);
        orbGrad.addColorStop(0.7, `rgba(59, 130, 246, ${0.5 + staffGlow})`);
        orbGrad.addColorStop(1, "rgba(30, 64, 175, 0.3)");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.moveTo(0, -14 * scale);
        ctx.lineTo(3.5 * scale, -18 * scale);
        ctx.lineTo(0, -22 * scale);
        ctx.lineTo(-3.5 * scale, -18 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(191, 219, 254, ${0.6 + staffGlow})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
        // Inner crystal light
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + staffGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(-0.5 * scale, -18.5 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Crystal glow aura
        if (animated) {
          const crystalGlow = ctx.createRadialGradient(0, -18 * scale, 1 * scale, 0, -18 * scale, 6 * scale);
          crystalGlow.addColorStop(0, `rgba(96, 165, 250, ${magicPulse * 0.2})`);
          crystalGlow.addColorStop(1, "rgba(96, 165, 250, 0)");
          ctx.fillStyle = crystalGlow;
          ctx.beginPath();
          ctx.arc(0, -18 * scale, 6 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Multiple floating ice shards (8) in orbit
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const angle = t * 1.5 + i * Math.PI * 0.25;
            const dist = (10 + Math.sin(t + i * 0.8) * 2) * scale;
            const ix = cx + Math.cos(angle) * dist;
            const iy = cy - 4 * scale + Math.sin(angle) * dist * 0.4 - bounce;
            const shardAlpha = 0.5 + Math.sin(t * 2 + i) * 0.3;
            const shardSize = (1.5 + Math.sin(t * 1.5 + i * 0.5) * 0.5) * scale;
            ctx.fillStyle = `rgba(191, 219, 254, ${shardAlpha})`;
            ctx.save();
            ctx.translate(ix, iy);
            ctx.rotate(angle + t * 0.5);
            ctx.beginPath();
            ctx.moveTo(0, -shardSize * 1.3);
            ctx.lineTo(shardSize, 0);
            ctx.lineTo(0, shardSize * 1.3);
            ctx.lineTo(-shardSize, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = `rgba(219, 234, 254, ${shardAlpha * 0.5})`;
            ctx.lineWidth = 0.3 * scale;
            ctx.stroke();
            ctx.restore();
          }
        }
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
        // EMBER GUARD - Elite infernal knight forged in volcanic fire
        const guardStomp = Math.sin(t * 1.5) * 1;
        const emberGlow = 0.5 + Math.sin(t * 3) * 0.3;
        const swordFlame = Math.sin(t * 5) * 0.2;
        const walkCycle = t * 2;
        const leftLegAngle = Math.sin(walkCycle) * 0.3;
        const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.3;
        const leftKnee = Math.max(0, Math.sin(walkCycle)) * 0.4;
        const rightKnee = Math.max(0, Math.sin(walkCycle + Math.PI)) * 0.4;
        const armorPulse = 0.4 + Math.sin(t * 2.5) * 0.3;
        const bodyBob = Math.abs(Math.sin(walkCycle)) * 0.5 * scale;
        const baseY = cy - bounce + guardStomp + bodyBob;

        // Infernal aura - outer ring
        const guardGrad = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, 22 * scale);
        guardGrad.addColorStop(0, `rgba(251, 191, 36, ${emberGlow * 0.15})`);
        guardGrad.addColorStop(0.3, `rgba(194, 65, 12, ${emberGlow * 0.25})`);
        guardGrad.addColorStop(0.6, `rgba(234, 88, 12, ${emberGlow * 0.12})`);
        guardGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = guardGrad;
        ctx.beginPath();
        ctx.arc(cx, baseY, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Inner heat glow
        const innerGlow = ctx.createRadialGradient(cx, baseY - 2 * scale, 0, cx, baseY - 2 * scale, 14 * scale);
        innerGlow.addColorStop(0, `rgba(255, 255, 200, ${emberGlow * 0.08})`);
        innerGlow.addColorStop(0.5, `rgba(251, 191, 36, ${emberGlow * 0.1})`);
        innerGlow.addColorStop(1, "rgba(249, 115, 22, 0)");
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(cx, baseY - 2 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Ember particles
        if (animated) {
          for (let i = 0; i < 8; i++) {
            const emberPhase = (t * 2 + i * 0.5) % 4;
            const emberX = cx + Math.sin(t * 2 + i * 1.3) * 12 * scale;
            const emberY = baseY - 6 * scale - emberPhase * 4 * scale;
            const emberAlpha = 0.7 - emberPhase / 6;
            const emberSize = (1.5 - emberPhase * 0.2) * scale;
            if (emberAlpha > 0) {
              ctx.fillStyle = `rgba(251, 146, 60, ${emberAlpha})`;
              ctx.beginPath();
              ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Heat distortion particles
        if (animated) {
          for (let i = 0; i < 5; i++) {
            const heatPhase = (t * 1.5 + i * 0.4) % 1;
            const heatX = cx + Math.sin(t * 1.2 + i * 1.8) * 8 * scale;
            const heatY = baseY - 10 * scale - heatPhase * 18 * scale;
            const heatAlpha = 0.15 * (1 - heatPhase);
            ctx.fillStyle = `rgba(251, 191, 36, ${heatAlpha})`;
            ctx.beginPath();
            ctx.arc(heatX, heatY, (2 + heatPhase * 2) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Fire glow pool underneath
        ctx.fillStyle = `rgba(251, 146, 60, ${emberGlow * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(cx, baseY + 16 * scale, 12 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, baseY + 16 * scale, 10 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // === ARTICULATED LEGS ===
        const thighLen = 8 * scale;
        const shinLen = 7 * scale;
        const legW = 3.5 * scale;

        // Left leg
        ctx.save();
        ctx.translate(cx - 4.5 * scale, baseY + 10 * scale);
        ctx.rotate(leftLegAngle);

        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.moveTo(-legW, 0);
        ctx.lineTo(legW, 0);
        ctx.lineTo(legW * 0.8, thighLen);
        ctx.lineTo(-legW * 0.8, thighLen);
        ctx.closePath();
        ctx.fill();

        // Left thigh armor band
        ctx.strokeStyle = "#9a3412";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(-legW, thighLen * 0.4);
        ctx.lineTo(legW, thighLen * 0.4);
        ctx.stroke();

        // Left knee pivot
        ctx.translate(0, thighLen);

        // Left molten knee glow
        ctx.fillStyle = `rgba(251, 191, 36, ${emberGlow * 0.7})`;
        ctx.beginPath();
        ctx.arc(0, 0, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 200, ${emberGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Left shin
        ctx.save();
        ctx.rotate(leftKnee);

        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.moveTo(-legW * 0.8, 0);
        ctx.lineTo(legW * 0.8, 0);
        ctx.lineTo(legW, shinLen);
        ctx.lineTo(-legW, shinLen);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#9a3412";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(-legW * 0.8, shinLen * 0.5);
        ctx.lineTo(legW * 0.8, shinLen * 0.5);
        ctx.stroke();

        // Left shin ember crack
        ctx.strokeStyle = `rgba(249, 115, 22, ${armorPulse * 0.5})`;
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(0, shinLen * 0.2);
        ctx.lineTo(-legW * 0.3, shinLen * 0.6);
        ctx.stroke();

        // Left boot
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.ellipse(0, shinLen + 1 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left boot spike
        ctx.fillStyle = "#1a0a02";
        ctx.beginPath();
        ctx.moveTo(-3.5 * scale, shinLen);
        ctx.lineTo(-5 * scale, shinLen - 2.5 * scale);
        ctx.lineTo(-2.5 * scale, shinLen - 0.5 * scale);
        ctx.fill();

        // Left boot sole glow
        ctx.fillStyle = `rgba(251, 146, 60, ${emberGlow * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(0, shinLen + 2 * scale, 3 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // left shin
        ctx.restore(); // left leg

        // Right leg
        ctx.save();
        ctx.translate(cx + 4.5 * scale, baseY + 10 * scale);
        ctx.rotate(rightLegAngle);

        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.moveTo(-legW, 0);
        ctx.lineTo(legW, 0);
        ctx.lineTo(legW * 0.8, thighLen);
        ctx.lineTo(-legW * 0.8, thighLen);
        ctx.closePath();
        ctx.fill();

        // Right thigh armor band
        ctx.strokeStyle = "#9a3412";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(-legW, thighLen * 0.4);
        ctx.lineTo(legW, thighLen * 0.4);
        ctx.stroke();

        // Right knee pivot
        ctx.translate(0, thighLen);

        // Right molten knee glow
        ctx.fillStyle = `rgba(251, 191, 36, ${emberGlow * 0.7})`;
        ctx.beginPath();
        ctx.arc(0, 0, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 200, ${emberGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Right shin
        ctx.save();
        ctx.rotate(rightKnee);

        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.moveTo(-legW * 0.8, 0);
        ctx.lineTo(legW * 0.8, 0);
        ctx.lineTo(legW, shinLen);
        ctx.lineTo(-legW, shinLen);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#9a3412";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(-legW * 0.8, shinLen * 0.5);
        ctx.lineTo(legW * 0.8, shinLen * 0.5);
        ctx.stroke();

        // Right shin ember crack
        ctx.strokeStyle = `rgba(249, 115, 22, ${armorPulse * 0.5})`;
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(0, shinLen * 0.2);
        ctx.lineTo(legW * 0.3, shinLen * 0.6);
        ctx.stroke();

        // Right boot
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.ellipse(0, shinLen + 1 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right boot spike
        ctx.fillStyle = "#1a0a02";
        ctx.beginPath();
        ctx.moveTo(3.5 * scale, shinLen);
        ctx.lineTo(5 * scale, shinLen - 2.5 * scale);
        ctx.lineTo(2.5 * scale, shinLen - 0.5 * scale);
        ctx.fill();

        // Right boot sole glow
        ctx.fillStyle = `rgba(251, 146, 60, ${emberGlow * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(0, shinLen + 2 * scale, 3 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // right shin
        ctx.restore(); // right leg

        // === HEAVY PLATE ARMOR BODY ===
        const armorGrad = ctx.createLinearGradient(cx - 12 * scale, baseY, cx + 12 * scale, baseY);
        armorGrad.addColorStop(0, "#7c2d12");
        armorGrad.addColorStop(0.2, "#c2410c");
        armorGrad.addColorStop(0.35, "#ea580c");
        armorGrad.addColorStop(0.5, "#c2410c");
        armorGrad.addColorStop(0.65, "#ea580c");
        armorGrad.addColorStop(0.8, "#c2410c");
        armorGrad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * scale, baseY + 12 * scale);
        ctx.lineTo(cx - 12 * scale, baseY - 2 * scale);
        ctx.lineTo(cx - 9 * scale, baseY - 10 * scale);
        ctx.lineTo(cx - 4 * scale, baseY - 12 * scale);
        ctx.lineTo(cx, baseY - 13 * scale);
        ctx.lineTo(cx + 4 * scale, baseY - 12 * scale);
        ctx.lineTo(cx + 9 * scale, baseY - 10 * scale);
        ctx.lineTo(cx + 12 * scale, baseY - 2 * scale);
        ctx.lineTo(cx + 10 * scale, baseY + 12 * scale);
        ctx.closePath();
        ctx.fill();

        // Chest plate vertical segments
        ctx.strokeStyle = "#1a0a02";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * scale, baseY - 10 * scale);
        ctx.lineTo(cx - 6 * scale, baseY - 2 * scale);
        ctx.lineTo(cx - 7 * scale, baseY + 6 * scale);
        ctx.moveTo(cx + 7 * scale, baseY - 10 * scale);
        ctx.lineTo(cx + 6 * scale, baseY - 2 * scale);
        ctx.lineTo(cx + 7 * scale, baseY + 6 * scale);
        ctx.stroke();

        // Center plate line
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 12 * scale);
        ctx.lineTo(cx, baseY + 8 * scale);
        ctx.stroke();

        // Horizontal armor bands
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * scale, baseY - 8 * scale);
        ctx.lineTo(cx + 8 * scale, baseY - 8 * scale);
        ctx.moveTo(cx - 10 * scale, baseY - 2 * scale);
        ctx.lineTo(cx + 10 * scale, baseY - 2 * scale);
        ctx.moveTo(cx - 9 * scale, baseY + 4 * scale);
        ctx.lineTo(cx + 9 * scale, baseY + 4 * scale);
        ctx.moveTo(cx - 8 * scale, baseY + 9 * scale);
        ctx.lineTo(cx + 8 * scale, baseY + 9 * scale);
        ctx.stroke();

        // Glowing armor cracks - extensive network
        ctx.strokeStyle = `rgba(251, 146, 60, ${armorPulse})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * scale, baseY - 6 * scale);
        ctx.lineTo(cx - 6 * scale, baseY);
        ctx.lineTo(cx - 5 * scale, baseY + 6 * scale);
        ctx.moveTo(cx + 3 * scale, baseY - 4 * scale);
        ctx.lineTo(cx + 5 * scale, baseY + 2 * scale);
        ctx.lineTo(cx + 4 * scale, baseY + 8 * scale);
        ctx.moveTo(cx - 2 * scale, baseY + 2 * scale);
        ctx.lineTo(cx + 2 * scale, baseY + 4 * scale);
        ctx.moveTo(cx - 3 * scale, baseY - 9 * scale);
        ctx.lineTo(cx - 1 * scale, baseY - 7 * scale);
        ctx.moveTo(cx + 1 * scale, baseY - 8 * scale);
        ctx.lineTo(cx + 3 * scale, baseY - 6 * scale);
        ctx.stroke();

        // Crack glow hotspots
        ctx.fillStyle = `rgba(251, 191, 36, ${armorPulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx - 5 * scale, baseY, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, baseY + 2 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx - 1 * scale, baseY - 7 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === ENHANCED EMBER CORE ===
        const coreGrad = ctx.createRadialGradient(
          cx, baseY - 5 * scale, 0,
          cx, baseY - 5 * scale, 5 * scale,
        );
        coreGrad.addColorStop(0, `rgba(255, 255, 220, ${emberGlow})`);
        coreGrad.addColorStop(0.3, `rgba(251, 191, 36, ${emberGlow * 0.9})`);
        coreGrad.addColorStop(0.6, `rgba(249, 115, 22, ${emberGlow * 0.6})`);
        coreGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, baseY - 5 * scale, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Core rune - cross
        ctx.strokeStyle = `rgba(255, 255, 220, ${emberGlow * 0.8})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 8 * scale);
        ctx.lineTo(cx, baseY - 2 * scale);
        ctx.moveTo(cx - 3 * scale, baseY - 5 * scale);
        ctx.lineTo(cx + 3 * scale, baseY - 5 * scale);
        ctx.stroke();

        // Core rune - diamond
        ctx.strokeStyle = `rgba(255, 255, 200, ${emberGlow * 0.6})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 7.5 * scale);
        ctx.lineTo(cx + 2.5 * scale, baseY - 5 * scale);
        ctx.lineTo(cx, baseY - 2.5 * scale);
        ctx.lineTo(cx - 2.5 * scale, baseY - 5 * scale);
        ctx.closePath();
        ctx.stroke();

        // Core inner bright spot
        ctx.fillStyle = `rgba(255, 255, 255, ${emberGlow * 0.4})`;
        ctx.beginPath();
        ctx.arc(cx, baseY - 5 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === SHOULDER PAULDRONS WITH SPIKES ===
        // Left pauldron
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.ellipse(cx - 12 * scale, baseY - 10 * scale, 5 * scale, 3.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Left pauldron spikes
        ctx.fillStyle = "#1a0a02";
        ctx.beginPath();
        ctx.moveTo(cx - 15 * scale, baseY - 11 * scale);
        ctx.lineTo(cx - 18 * scale, baseY - 16 * scale);
        ctx.lineTo(cx - 14 * scale, baseY - 12 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 13 * scale, baseY - 13 * scale);
        ctx.lineTo(cx - 14 * scale, baseY - 18 * scale);
        ctx.lineTo(cx - 11 * scale, baseY - 14 * scale);
        ctx.fill();

        // Left pauldron ember edge
        ctx.strokeStyle = `rgba(251, 146, 60, ${armorPulse * 0.5})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.arc(cx - 12 * scale, baseY - 10 * scale, 4 * scale, Math.PI * 0.8, Math.PI * 1.5);
        ctx.stroke();

        // Right pauldron
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.ellipse(cx + 12 * scale, baseY - 10 * scale, 5 * scale, 3.5 * scale, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Right pauldron spikes
        ctx.fillStyle = "#1a0a02";
        ctx.beginPath();
        ctx.moveTo(cx + 15 * scale, baseY - 11 * scale);
        ctx.lineTo(cx + 18 * scale, baseY - 16 * scale);
        ctx.lineTo(cx + 14 * scale, baseY - 12 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 13 * scale, baseY - 13 * scale);
        ctx.lineTo(cx + 14 * scale, baseY - 18 * scale);
        ctx.lineTo(cx + 11 * scale, baseY - 14 * scale);
        ctx.fill();

        // Right pauldron ember edge
        ctx.strokeStyle = `rgba(251, 146, 60, ${armorPulse * 0.5})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.arc(cx + 12 * scale, baseY - 10 * scale, 4 * scale, -Math.PI * 0.5, Math.PI * 0.2);
        ctx.stroke();

        // === ARMS WITH HEAVY GAUNTLETS ===
        // Left arm
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.moveTo(cx - 11 * scale, baseY - 9 * scale);
        ctx.quadraticCurveTo(cx - 15 * scale, baseY - 2 * scale, cx - 14 * scale, baseY + 6 * scale);
        ctx.lineTo(cx - 11 * scale, baseY + 6 * scale);
        ctx.quadraticCurveTo(cx - 12 * scale, baseY - 1 * scale, cx - 10 * scale, baseY - 8 * scale);
        ctx.fill();

        // Left arm armor band
        ctx.strokeStyle = "#7c2d12";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * scale, baseY - 1 * scale);
        ctx.lineTo(cx - 11 * scale, baseY - 1 * scale);
        ctx.stroke();

        // Left gauntlet
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.arc(cx - 13 * scale, baseY + 7 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Left gauntlet claws
        ctx.fillStyle = "#1a0a02";
        for (let c = 0; c < 4; c++) {
          const clawAngle = 0.4 + c * 0.3;
          ctx.beginPath();
          ctx.moveTo(
            cx - 13 * scale + Math.cos(clawAngle) * 2.5 * scale,
            baseY + 7 * scale + Math.sin(clawAngle) * 2.5 * scale,
          );
          ctx.lineTo(
            cx - 13 * scale + Math.cos(clawAngle) * 5 * scale,
            baseY + 7 * scale + Math.sin(clawAngle) * 4 * scale,
          );
          ctx.lineTo(
            cx - 13 * scale + Math.cos(clawAngle + 0.15) * 2.5 * scale,
            baseY + 7 * scale + Math.sin(clawAngle + 0.15) * 2.5 * scale,
          );
          ctx.fill();
        }

        // Left gauntlet glow
        ctx.fillStyle = `rgba(251, 146, 60, ${armorPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx - 13 * scale, baseY + 7 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Right arm
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.moveTo(cx + 11 * scale, baseY - 9 * scale);
        ctx.quadraticCurveTo(cx + 16 * scale, baseY - 4 * scale, cx + 15 * scale, baseY + 4 * scale);
        ctx.lineTo(cx + 12 * scale, baseY + 4 * scale);
        ctx.quadraticCurveTo(cx + 13 * scale, baseY - 3 * scale, cx + 10 * scale, baseY - 8 * scale);
        ctx.fill();

        // Right arm armor band
        ctx.strokeStyle = "#7c2d12";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 14 * scale, baseY - 2 * scale);
        ctx.lineTo(cx + 11 * scale, baseY - 2 * scale);
        ctx.stroke();

        // Right gauntlet
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.arc(cx + 14 * scale, baseY + 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Right gauntlet claws
        ctx.fillStyle = "#1a0a02";
        for (let c = 0; c < 3; c++) {
          const clawAngle = -0.3 - c * 0.3;
          ctx.beginPath();
          ctx.moveTo(
            cx + 14 * scale + Math.cos(clawAngle) * 2.5 * scale,
            baseY + 5 * scale + Math.sin(clawAngle) * 2.5 * scale,
          );
          ctx.lineTo(
            cx + 14 * scale + Math.cos(clawAngle) * 5 * scale,
            baseY + 5 * scale + Math.sin(clawAngle) * 4 * scale,
          );
          ctx.lineTo(
            cx + 14 * scale + Math.cos(clawAngle - 0.15) * 2.5 * scale,
            baseY + 5 * scale + Math.sin(clawAngle - 0.15) * 2.5 * scale,
          );
          ctx.fill();
        }

        // === HELMET ===
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.arc(cx, baseY - 16 * scale, 7.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Helmet dome highlight
        const helmetGrad = ctx.createRadialGradient(
          cx - 1 * scale, baseY - 18 * scale, 0,
          cx, baseY - 16 * scale, 7 * scale,
        );
        helmetGrad.addColorStop(0, "#ea580c");
        helmetGrad.addColorStop(0.5, "#9a3412");
        helmetGrad.addColorStop(1, "#7c2d12");
        ctx.fillStyle = helmetGrad;
        ctx.beginPath();
        ctx.arc(cx, baseY - 16 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Helmet crown ridge
        ctx.fillStyle = "#9a3412";
        ctx.beginPath();
        ctx.ellipse(cx, baseY - 18.5 * scale, 6 * scale, 3.5 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Helmet face plate
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.moveTo(cx - 5 * scale, baseY - 18 * scale);
        ctx.lineTo(cx - 6 * scale, baseY - 14 * scale);
        ctx.lineTo(cx - 4 * scale, baseY - 11 * scale);
        ctx.lineTo(cx, baseY - 10 * scale);
        ctx.lineTo(cx + 4 * scale, baseY - 11 * scale);
        ctx.lineTo(cx + 6 * scale, baseY - 14 * scale);
        ctx.lineTo(cx + 5 * scale, baseY - 18 * scale);
        ctx.closePath();
        ctx.fill();

        // === HELMET HORNS ===
        ctx.fillStyle = "#451a03";
        // Left horn
        ctx.beginPath();
        ctx.moveTo(cx - 6 * scale, baseY - 19 * scale);
        ctx.quadraticCurveTo(cx - 10 * scale, baseY - 21 * scale, cx - 11 * scale, baseY - 26 * scale);
        ctx.lineTo(cx - 8 * scale, baseY - 21 * scale);
        ctx.quadraticCurveTo(cx - 7 * scale, baseY - 18 * scale, cx - 5 * scale, baseY - 17 * scale);
        ctx.fill();
        // Right horn
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, baseY - 19 * scale);
        ctx.quadraticCurveTo(cx + 10 * scale, baseY - 21 * scale, cx + 11 * scale, baseY - 26 * scale);
        ctx.lineTo(cx + 8 * scale, baseY - 21 * scale);
        ctx.quadraticCurveTo(cx + 7 * scale, baseY - 18 * scale, cx + 5 * scale, baseY - 17 * scale);
        ctx.fill();

        // Horn glow tips
        ctx.fillStyle = `rgba(251, 146, 60, ${emberGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx - 11 * scale, baseY - 26 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 11 * scale, baseY - 26 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === ENHANCED FLAME PLUME ===
        // Base plume
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 21 * scale);
        ctx.quadraticCurveTo(cx - 3 * scale, baseY - 25 * scale, cx, baseY - 29 * scale);
        ctx.quadraticCurveTo(cx + 3 * scale, baseY - 25 * scale, cx, baseY - 21 * scale);
        ctx.fill();

        // Mid flame layer
        ctx.fillStyle = `rgba(234, 88, 12, ${0.7 + swordFlame})`;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 22 * scale);
        ctx.quadraticCurveTo(
          cx - 2 * scale + Math.sin(t * 7) * 1 * scale,
          baseY - 27 * scale,
          cx, baseY - 32 * scale + Math.sin(t * 6) * 1.5 * scale,
        );
        ctx.quadraticCurveTo(
          cx + 2 * scale - Math.sin(t * 7) * 1 * scale,
          baseY - 27 * scale,
          cx, baseY - 22 * scale,
        );
        ctx.fill();

        // Bright inner flame
        ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + swordFlame})`;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 23 * scale);
        ctx.quadraticCurveTo(
          cx + Math.sin(t * 9) * 0.8 * scale,
          baseY - 28 * scale,
          cx, baseY - 30 * scale + Math.sin(t * 8) * 1 * scale,
        );
        ctx.quadraticCurveTo(
          cx - Math.sin(t * 9) * 0.8 * scale,
          baseY - 27 * scale,
          cx, baseY - 23 * scale,
        );
        ctx.fill();

        // White-hot tip
        ctx.fillStyle = `rgba(255, 255, 220, ${0.4 + swordFlame * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, baseY - 28 * scale + Math.sin(t * 6) * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Visor slit with glowing eyes
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(cx - 4.5 * scale, baseY - 17 * scale, 9 * scale, 2.5 * scale);
        ctx.fillStyle = `rgba(251, 191, 36, ${emberGlow})`;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * scale, baseY - 15.8 * scale, 1.5 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 2 * scale, baseY - 15.8 * scale, 1.5 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow halos
        ctx.fillStyle = `rgba(255, 255, 200, ${emberGlow * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx - 2 * scale, baseY - 15.8 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, baseY - 15.8 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // === FLAMING GREATSWORD ===
        ctx.save();
        ctx.translate(cx + 14 * scale, baseY - 2 * scale);
        ctx.rotate(-0.2);

        // Sword handle
        ctx.fillStyle = "#451a03";
        ctx.fillRect(-1.5 * scale, -2 * scale, 3 * scale, 6 * scale);

        // Crossguard
        ctx.fillStyle = "#7c2d12";
        ctx.beginPath();
        ctx.ellipse(0, -2 * scale, 4 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crossguard center gem
        ctx.fillStyle = `rgba(251, 191, 36, ${emberGlow * 0.6})`;
        ctx.beginPath();
        ctx.arc(0, -2 * scale, 1 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Metal blade
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(-1.5 * scale, -3 * scale);
        ctx.lineTo(0, -18 * scale);
        ctx.lineTo(1.5 * scale, -3 * scale);
        ctx.closePath();
        ctx.fill();

        // Blade molten edge
        const bladeGrad = ctx.createLinearGradient(0, -3 * scale, 0, -17 * scale);
        bladeGrad.addColorStop(0, `rgba(251, 191, 36, ${emberGlow})`);
        bladeGrad.addColorStop(0.5, `rgba(254, 243, 199, ${emberGlow})`);
        bladeGrad.addColorStop(1, `rgba(251, 191, 36, ${emberGlow * 0.8})`);
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-0.8 * scale, -4 * scale);
        ctx.lineTo(0, -17 * scale);
        ctx.lineTo(0.8 * scale, -4 * scale);
        ctx.closePath();
        ctx.fill();

        // Blade center glow line
        ctx.strokeStyle = `rgba(255, 255, 200, ${emberGlow * 0.6})`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -4 * scale);
        ctx.lineTo(0, -16 * scale);
        ctx.stroke();

        // Flame tip effect
        ctx.fillStyle = `rgba(251, 146, 60, ${0.6 + swordFlame})`;
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -17 * scale);
        ctx.quadraticCurveTo(0, -22 * scale + Math.sin(t * 8) * scale, 2 * scale, -17 * scale);
        ctx.closePath();
        ctx.fill();

        // Sword fire aura
        ctx.fillStyle = `rgba(251, 191, 36, ${(0.3 + swordFlame) * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(-1 * scale, -5 * scale);
        ctx.quadraticCurveTo(
          -3 * scale + Math.sin(t * 7) * scale, -12 * scale,
          0, -19 * scale + Math.sin(t * 6) * scale,
        );
        ctx.quadraticCurveTo(
          3 * scale - Math.sin(t * 7) * scale, -12 * scale,
          1 * scale, -5 * scale,
        );
        ctx.fill();

        // Sword embers
        if (animated) {
          for (let i = 0; i < 4; i++) {
            const sEmberPhase = (t * 3 + i * 0.3) % 1;
            const sEmberX = Math.sin(t * 6 + i * 2) * 2 * scale;
            const sEmberY = -5 * scale - sEmberPhase * 14 * scale;
            ctx.fillStyle = `rgba(255, 255, 200, ${(1 - sEmberPhase) * 0.7})`;
            ctx.beginPath();
            ctx.arc(sEmberX, sEmberY, (1 - sEmberPhase) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

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
  }, [type, size, animated]);

  useSpriteTicker(animated, 60, renderEnemy);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
