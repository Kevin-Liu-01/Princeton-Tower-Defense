"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  ArrowRight,
  Clock,
  Heart,
  Star,
  Sparkles,
  Crown,
  Swords,
} from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { GOLD, DIVIDER, VICTORY, OVERLAY, panelGradient } from "../ui/theme";

// Helper to format time as mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface CategoryRatings {
  speed: number;
  survival: number;
  strategy: number;
  overall: number;
}

const SPEED_THRESHOLDS = { three: 15, two: 25 }; // seconds per wave
const SURVIVAL_THRESHOLDS = { three: 18, two: 10 }; // lives remaining out of 20

export function calculateCategoryRatings(
  timeSpent: number,
  lives: number,
  totalWaves: number,
): CategoryRatings {
  const secsPerWave = totalWaves > 0 ? timeSpent / totalWaves : timeSpent;

  const speed =
    secsPerWave <= SPEED_THRESHOLDS.three
      ? 3
      : secsPerWave <= SPEED_THRESHOLDS.two
        ? 2
        : 1;
  const survival =
    lives >= SURVIVAL_THRESHOLDS.three
      ? 3
      : lives >= SURVIVAL_THRESHOLDS.two
        ? 2
        : 1;
  const strategy =
    speed >= 3 && survival >= 3 ? 3 : speed >= 2 && survival >= 2 ? 2 : 1;
  const overall = Math.floor((speed + survival + strategy) / 3);

  return { speed, survival, strategy, overall };
}

interface VictoryScreenProps {
  starsEarned: number;
  lives: number;
  timeSpent: number;
  bestTime?: number;
  bestHearts?: number;
  levelName: string;
  resetGame: () => void;
  overlay?: boolean;
  totalWaves?: number;
}

// Animated trophy with sparkles
const TrophySprite: React.FC<{ size?: number }> = ({ size = 150 }) => {
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
    const cy = size / 2;
    const s = size / 150;
    const t = time * 0.1;

    // --- Ambient radial glow behind trophy ---
    const ambientGlow = ctx.createRadialGradient(cx, cy - 5 * s, 10 * s, cx, cy - 5 * s, 75 * s);
    const ambientAlpha = 0.15 + Math.sin(t * 1.5) * 0.05;
    ambientGlow.addColorStop(0, `rgba(255,215,0,${ambientAlpha})`);
    ambientGlow.addColorStop(0.5, `rgba(255,180,0,${ambientAlpha * 0.4})`);
    ambientGlow.addColorStop(1, "rgba(255,180,0,0)");
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, size, size);

    // --- Pedestal / Multi-tier base ---
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8 * s;

    // Bottom tier
    const baseGrad = ctx.createLinearGradient(cx - 38 * s, 0, cx + 38 * s, 0);
    baseGrad.addColorStop(0, "#6b4f10");
    baseGrad.addColorStop(0.3, "#8b6914");
    baseGrad.addColorStop(0.5, "#a67c00");
    baseGrad.addColorStop(0.7, "#8b6914");
    baseGrad.addColorStop(1, "#6b4f10");
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 38 * s, cy + 60 * s);
    ctx.lineTo(cx + 38 * s, cy + 60 * s);
    ctx.lineTo(cx + 34 * s, cy + 52 * s);
    ctx.lineTo(cx - 34 * s, cy + 52 * s);
    ctx.closePath();
    ctx.fill();

    // Base trim line
    ctx.fillStyle = "#daa520";
    ctx.fillRect(cx - 35 * s, cy + 53 * s, 70 * s, 2 * s);

    // Middle tier
    const midBaseGrad = ctx.createLinearGradient(cx - 30 * s, 0, cx + 30 * s, 0);
    midBaseGrad.addColorStop(0, "#7a5c12");
    midBaseGrad.addColorStop(0.5, "#b8860b");
    midBaseGrad.addColorStop(1, "#7a5c12");
    ctx.fillStyle = midBaseGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 30 * s, cy + 52 * s);
    ctx.lineTo(cx + 30 * s, cy + 52 * s);
    ctx.lineTo(cx + 26 * s, cy + 44 * s);
    ctx.lineTo(cx - 26 * s, cy + 44 * s);
    ctx.closePath();
    ctx.fill();

    // Decorative engraving dots on base
    ctx.fillStyle = "#daa520";
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx + i * 8 * s, cy + 56 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // --- Stem with ornate knob ---
    const stemGrad = ctx.createLinearGradient(cx - 10 * s, 0, cx + 10 * s, 0);
    stemGrad.addColorStop(0, "#8b6914");
    stemGrad.addColorStop(0.3, "#c8a020");
    stemGrad.addColorStop(0.5, "#daa520");
    stemGrad.addColorStop(0.7, "#c8a020");
    stemGrad.addColorStop(1, "#8b6914");
    ctx.fillStyle = stemGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 7 * s, cy + 44 * s);
    ctx.lineTo(cx + 7 * s, cy + 44 * s);
    ctx.lineTo(cx + 10 * s, cy + 20 * s);
    ctx.lineTo(cx - 10 * s, cy + 20 * s);
    ctx.closePath();
    ctx.fill();

    // Decorative knob at stem-cup junction
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffec8b";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20 * s, 10 * s, 2.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stem ring
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 32 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Main Cup Body ---
    ctx.shadowColor = "#ffd700";
    const glowPulse = 0.5 + Math.sin(t * 2) * 0.2;
    ctx.shadowBlur = 25 * s * glowPulse;

    const cupGrad = ctx.createLinearGradient(cx - 42 * s, 0, cx + 42 * s, 0);
    cupGrad.addColorStop(0, "#8b6914");
    cupGrad.addColorStop(0.15, "#b8860b");
    cupGrad.addColorStop(0.35, "#ffd700");
    cupGrad.addColorStop(0.5, "#ffe66d");
    cupGrad.addColorStop(0.65, "#ffd700");
    cupGrad.addColorStop(0.85, "#b8860b");
    cupGrad.addColorStop(1, "#8b6914");
    ctx.fillStyle = cupGrad;

    ctx.beginPath();
    ctx.moveTo(cx - 36 * s, cy - 42 * s);
    ctx.bezierCurveTo(cx - 48 * s, cy - 10 * s, cx - 40 * s, cy + 10 * s, cx - 22 * s, cy + 20 * s);
    ctx.lineTo(cx + 22 * s, cy + 20 * s);
    ctx.bezierCurveTo(cx + 40 * s, cy + 10 * s, cx + 48 * s, cy - 10 * s, cx + 36 * s, cy - 42 * s);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Cup inner shadow (depth)
    const innerShadow = ctx.createLinearGradient(cx, cy - 42 * s, cx, cy - 25 * s);
    innerShadow.addColorStop(0, "rgba(0,0,0,0.25)");
    innerShadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = innerShadow;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 40 * s, 30 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vertical highlight streak on cup
    const streakGrad = ctx.createLinearGradient(cx - 5 * s, cy - 35 * s, cx + 5 * s, cy + 10 * s);
    streakGrad.addColorStop(0, "rgba(255,255,220,0.35)");
    streakGrad.addColorStop(0.5, "rgba(255,255,220,0.15)");
    streakGrad.addColorStop(1, "rgba(255,255,220,0)");
    ctx.fillStyle = streakGrad;
    ctx.beginPath();
    ctx.ellipse(cx - 8 * s, cy - 15 * s, 6 * s, 30 * s, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // --- Cup Rim (ornate double ellipse) ---
    ctx.fillStyle = "#ffec8b";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 42 * s, 36 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const rimGrad = ctx.createLinearGradient(cx - 32 * s, cy - 42 * s, cx + 32 * s, cy - 42 * s);
    rimGrad.addColorStop(0, "#b8860b");
    rimGrad.addColorStop(0.3, "#daa520");
    rimGrad.addColorStop(0.5, "#c8a020");
    rimGrad.addColorStop(0.7, "#daa520");
    rimGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 42 * s, 31 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner cup darkness
    ctx.fillStyle = "#5a4000";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 42 * s, 27 * s, 4.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Ornate Handles with curled tips ---
    ctx.lineWidth = 5 * s;
    ctx.lineCap = "round";

    // Left handle
    const lhGrad = ctx.createLinearGradient(cx - 58 * s, cy - 25 * s, cx - 38 * s, cy - 5 * s);
    lhGrad.addColorStop(0, "#b8860b");
    lhGrad.addColorStop(0.5, "#ffd700");
    lhGrad.addColorStop(1, "#b8860b");
    ctx.strokeStyle = lhGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 38 * s, cy - 30 * s);
    ctx.bezierCurveTo(cx - 58 * s, cy - 28 * s, cx - 58 * s, cy + 5 * s, cx - 40 * s, cy + 2 * s);
    ctx.stroke();
    // Left handle curl
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.arc(cx - 38 * s, cy + 4 * s, 4 * s, Math.PI * 0.5, Math.PI * 2);
    ctx.stroke();

    // Right handle
    const rhGrad = ctx.createLinearGradient(cx + 38 * s, cy - 25 * s, cx + 58 * s, cy - 5 * s);
    rhGrad.addColorStop(0, "#b8860b");
    rhGrad.addColorStop(0.5, "#ffd700");
    rhGrad.addColorStop(1, "#b8860b");
    ctx.strokeStyle = rhGrad;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + 38 * s, cy - 30 * s);
    ctx.bezierCurveTo(cx + 58 * s, cy - 28 * s, cx + 58 * s, cy + 5 * s, cx + 40 * s, cy + 2 * s);
    ctx.stroke();
    // Right handle curl
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.arc(cx + 38 * s, cy + 4 * s, 4 * s, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Handle jewel dots
    ctx.fillStyle = "#ffe66d";
    ctx.beginPath();
    ctx.arc(cx - 54 * s, cy - 12 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 54 * s, cy - 12 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    // --- Decorative band on cup ---
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 32 * s, cy - 8 * s);
    ctx.bezierCurveTo(cx - 20 * s, cy - 12 * s, cx + 20 * s, cy - 12 * s, cx + 32 * s, cy - 8 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 30 * s, cy - 2 * s);
    ctx.bezierCurveTo(cx - 18 * s, cy - 6 * s, cx + 18 * s, cy - 6 * s, cx + 30 * s, cy - 2 * s);
    ctx.stroke();

    // --- Center emblem: ornate star with jewel ---
    // Outer star glow
    ctx.shadowColor = "#fff8dc";
    ctx.shadowBlur = 8 * s;
    ctx.fillStyle = "#fff8dc";
    drawStar(ctx, cx, cy - 18 * s, 14 * s, 7 * s);
    ctx.shadowBlur = 0;

    // Inner star
    ctx.fillStyle = "#ffd700";
    drawStar(ctx, cx, cy - 18 * s, 10 * s, 5 * s);

    // Center ruby jewel
    const jewelGrad = ctx.createRadialGradient(cx - 1 * s, cy - 20 * s, 0, cx, cy - 18 * s, 5 * s);
    jewelGrad.addColorStop(0, "#ff6b6b");
    jewelGrad.addColorStop(0.4, "#dc143c");
    jewelGrad.addColorStop(1, "#8b0000");
    ctx.fillStyle = jewelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 18 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Jewel highlight
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(cx - 1.5 * s, cy - 20 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // --- Laurel wreath on sides of cup ---
    ctx.strokeStyle = "rgba(218,165,32,0.5)";
    ctx.lineWidth = 1 * s;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const leafY = cy - 30 * s + i * 8 * s;
        const leafX = cx + side * (20 + i * 2) * s;
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(side * (0.3 + i * 0.15));
        ctx.beginPath();
        ctx.ellipse(0, 0, 2 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- Animated sparkle effects ---
    // Cross sparkles (rotating)
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + t * 0.8;
      const dist = (48 + Math.sin(t * 2 + i * 1.3) * 12) * s;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy - 8 * s + Math.sin(angle) * dist * 0.55;
      const sparkleSize = (2.5 + Math.sin(t * 3 + i * 2.5) * 1.8) * s;
      const alpha = 0.4 + Math.sin(t * 2.5 + i * 1.1) * 0.4;

      if (alpha > 0.15) {
        ctx.fillStyle = `rgba(255, 236, 139, ${alpha})`;
        // Draw cross sparkle
        ctx.fillRect(sx - sparkleSize * 0.15, sy - sparkleSize, sparkleSize * 0.3, sparkleSize * 2);
        ctx.fillRect(sx - sparkleSize, sy - sparkleSize * 0.15, sparkleSize * 2, sparkleSize * 0.3);
      }
    }

    // Small floating gold particles
    for (let i = 0; i < 6; i++) {
      const pAngle = (i / 6) * Math.PI * 2 + t * 1.2;
      const pDist = (60 + Math.sin(t * 1.5 + i * 2) * 8) * s;
      const px = cx + Math.cos(pAngle) * pDist;
      const py = cy - 5 * s + Math.sin(pAngle) * pDist * 0.5;
      const pAlpha = 0.3 + Math.sin(t * 4 + i * 3) * 0.3;
      ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

// Animated star rating
const StarRating: React.FC<{ earned: number; size?: number }> = ({ earned, size = 80 }) => {
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
    const width = size * 3.5;
    canvas.width = width * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, size);

    const t = time * 0.1;

    for (let i = 0; i < 3; i++) {
      const cx = size * 0.6 + i * size * 1.1;
      const cy = size / 2;
      const isEarned = i < earned;
      const delay = i * 0.5;
      const starScale = isEarned ? 1 + Math.sin(t * 2 - delay) * 0.1 : 1;
      const rotation = isEarned ? Math.sin(t - delay) * 0.1 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.scale(starScale, starScale);

      if (isEarned) {
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 20;
        const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
        starGrad.addColorStop(0, "#ffec8b");
        starGrad.addColorStop(0.5, "#ffd700");
        starGrad.addColorStop(1, "#b8860b");
        ctx.fillStyle = starGrad;
      } else {
        ctx.fillStyle = "#3a3020";
      }

      drawStar(ctx, 0, 0, size * 0.4, size * 0.2);

      if (isEarned) {
        ctx.fillStyle = "#ffec8b";
        drawStar(ctx, 0, -2, size * 0.2, size * 0.1);
      }

      ctx.restore();

      if (isEarned) {
        for (let j = 0; j < 4; j++) {
          const sparkleAngle = (j / 4) * Math.PI * 2 + t * 2;
          const sparkleX = cx + Math.cos(sparkleAngle) * size * 0.5;
          const sparkleY = cy + Math.sin(sparkleAngle) * size * 0.5;
          const alpha = 0.3 + Math.sin(t * 3 + j + i) * 0.3;
          ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [earned, size, time]);

  return <canvas ref={canvasRef} style={{ width: size * 3.5, height: size }} />;
};

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

const CATEGORY_CONFIG: {
  key: keyof Omit<CategoryRatings, "overall">;
  label: string;
  icon: typeof Clock;
  color: string;
  fillClass: string;
  emptyClass: string;
}[] = [
    {
      key: "speed",
      label: "Speed",
      icon: Clock,
      color: "text-blue-400/85",
      fillClass: "text-blue-400 fill-blue-400",
      emptyClass: "text-blue-900/40",
    },
    {
      key: "survival",
      label: "Survival",
      icon: Heart,
      color: "text-red-400/85",
      fillClass: "text-red-400 fill-red-400",
      emptyClass: "text-red-900/40",
    },
    {
      key: "strategy",
      label: "Strategy",
      icon: Swords,
      color: "text-amber-500/85",
      fillClass: "text-amber-400 fill-amber-400",
      emptyClass: "text-amber-900/40",
    },
  ];

const CategoryRatingRow: React.FC<{
  icon: typeof Clock;
  label: string;
  stars: number;
  iconColor: string;
  fillClass: string;
  emptyClass: string;
}> = ({ icon: Icon, label, stars, iconColor, fillClass, emptyClass }) => (
  <div
    className="rounded-lg px-3 py-2 flex items-center justify-between"
    style={{
      background:
        "linear-gradient(90deg, rgba(120,80,20,0.14), rgba(180,140,60,0.16), rgba(120,80,20,0.14))",
      border: "1px solid rgba(180,140,60,0.25)",
    }}
  >
    <div className="flex items-center gap-2">
      <Icon size={13} className={iconColor} />
      <span className="text-[10px] font-bold text-amber-400/75 tracking-[0.15em] uppercase">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-0.5">
      {[...Array(3)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < stars ? fillClass : emptyClass}
        />
      ))}
    </div>
  </div>
);

export function VictoryScreen({
  starsEarned: _starsEarned,
  lives,
  timeSpent,
  bestTime,
  bestHearts,
  levelName,
  resetGame,
  overlay = false,
  totalWaves = 10,
}: VictoryScreenProps) {
  void _starsEarned;
  const ratings = calculateCategoryRatings(timeSpent, lives, totalWaves);
  const displayStars = ratings.overall;
  const isNewBestTime = !bestTime || timeSpent < bestTime;
  const isNewBestHearts = !bestHearts || lives > bestHearts;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const victoryMessage =
    displayStars === 3
      ? "A flawless defense! The realm shall sing of this triumph for ages!"
      : displayStars === 2
        ? "A valiant victory! The enemy retreats in disarray!"
        : "By the narrowest of margins... the kingdom stands.";

  return (
    <div
      className={`${overlay
        ? "absolute inset-0 z-[400] flex flex-col items-center justify-center overflow-auto pointer-events-auto"
        : "w-full h-screen flex flex-col items-center justify-center relative overflow-auto"
        } ${overlay ? `transition-opacity duration-500 ${showContent ? "opacity-100" : "opacity-0"}` : ""}`}
      style={{
        background: overlay
          ? "rgba(12, 9, 5, 0.38)"
          : "linear-gradient(180deg, #1c1610 0%, #2a1f10 40%, #1c1610 100%)",
        backdropFilter: overlay ? "blur(1.5px) saturate(0.9)" : undefined,
        WebkitBackdropFilter: overlay ? "blur(1.5px) saturate(0.9)" : undefined,
      }}
    >
      {!overlay && (
        <>
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(180,140,60,0.08), transparent)",
            }}
          />

          {/* Floating golden particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  width: `${1 + (i % 3)}px`,
                  height: `${1 + (i % 3)}px`,
                  left: `${(i * 4.3) % 100}%`,
                  top: `${(i * 7.1) % 100}%`,
                  background: `rgba(255, 200, 80, ${0.15 + (i % 4) * 0.08})`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Main panel */}
      <div className={`relative z-10 max-w-xl w-full mx-4 transition-all duration-500 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <OrnateFrame
          className="rounded-2xl border-2 border-amber-800/50 shadow-2xl"
          cornerSize={48}
          showBorders={true}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: panelGradient,
              boxShadow: `inset 0 0 30px ${GOLD.glow07}, 0 8px 40px ${OVERLAY.black60}`,
            }}
          >
            {/* Inner border glow */}
            <div className="absolute inset-[3px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder12}` }} />

            {/* ===== Trophy + Title Header ===== */}
            <div className="flex flex-col items-center pt-5 sm:pt-8 pb-2 sm:pb-3 relative"
              style={{ background: "linear-gradient(180deg, rgba(180,140,60,0.1) 0%, transparent 100%)" }}
            >
              <TrophySprite size={80} />

              <h1
                className="text-3xl sm:text-5xl font-black tracking-[0.15em] sm:tracking-[0.25em] mt-2"
                style={{
                  color: "#fcd34d",
                  textShadow: "0 0 50px rgba(252,211,77,0.4), 0 0 20px rgba(252,211,77,0.25), 0 3px 0 #7a5c10, 0 4px 8px rgba(0,0,0,0.7)",
                }}
              >
                VICTORY
              </h1>

              {/* Ornate divider with crown */}
              <div className="flex items-center gap-3 mt-3 w-full px-6 sm:px-10">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold50} 30%, ${GOLD.bright60} 100%)` }} />
                <div className="p-1.5 rounded-full" style={{ background: `linear-gradient(135deg, ${GOLD.border30}, rgba(120,80,20,0.2))`, border: `1px solid ${GOLD.border40}` }}>
                  <Crown size={12} className="text-amber-400" />
                </div>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, transparent, ${DIVIDER.gold50} 30%, ${GOLD.bright60} 100%)` }} />
              </div>

              {/* Level name */}
              <p className="text-sm text-amber-300/85 tracking-[0.3em] uppercase mt-2 font-semibold">
                {levelName}
              </p>
            </div>

            {/* ===== Star Rating ===== */}
            <div className="flex justify-center py-1">
              <StarRating earned={displayStars} size={55} />
            </div>

            {/* Rating label */}
            <div className="flex items-center justify-center mb-1">
              <div className="px-4 py-1 rounded-full" style={{
                background: "linear-gradient(135deg, rgba(180,140,60,0.15), rgba(120,80,20,0.1))",
                border: `1px solid ${GOLD.border25}`,
              }}>
                <span className="text-[11px] font-bold text-amber-300 tracking-[0.3em] uppercase">
                  {displayStars === 3 ? "★ Legendary ★" : displayStars === 2 ? "Heroic" : "Survived"}
                </span>
              </div>
            </div>

            {/* Flavor text */}
            <p className="text-[11px] sm:text-xs text-amber-400/65 italic text-center px-5 sm:px-10 mb-2 sm:mb-3 leading-relaxed">
              &ldquo;{victoryMessage}&rdquo;
            </p>

            {/* ===== Ornate Divider ===== */}
            <div className="px-6">
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border35} 20%, ${GOLD.bright45} 50%, ${GOLD.border35} 80%, transparent)` }} />
            </div>

            {/* ===== Stats Grid ===== */}
            <div className="px-3 sm:px-5 py-3 sm:py-4">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Time */}
                <div className="rounded-xl p-3 relative" style={{
                  background: `linear-gradient(135deg, ${VICTORY.blueCardBg}, ${VICTORY.blueCardBgDark})`,
                  border: `1.5px solid rgba(100,120,180,0.35)`,
                  boxShadow: "inset 0 0 12px rgba(80,100,160,0.08)",
                }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock size={12} className="text-blue-400/80" />
                    <span className="text-[10px] font-bold text-blue-400/70 tracking-[0.2em] uppercase">Time</span>
                  </div>
                  <div className="text-2xl font-black text-blue-300" style={{ textShadow: "0 0 14px rgba(96,165,250,0.3)" }}>
                    {formatTime(timeSpent)}
                  </div>
                  {isNewBestTime ? (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Sparkles size={10} className="text-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase animate-pulse">New Best!</span>
                    </div>
                  ) : bestTime ? (
                    <span className="text-[9px] text-blue-400/50 mt-1 block">Best: {formatTime(bestTime)}</span>
                  ) : null}
                </div>

                {/* Lives */}
                <div className="rounded-xl p-3 relative" style={{
                  background: `linear-gradient(135deg, ${VICTORY.redCardBg}, ${VICTORY.redCardBgDark})`,
                  border: `1.5px solid rgba(180,80,80,0.35)`,
                  boxShadow: "inset 0 0 12px rgba(160,60,60,0.08)",
                }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Heart size={12} className="text-red-400/80" />
                    <span className="text-[10px] font-bold text-red-400/70 tracking-[0.2em] uppercase">Lives</span>
                  </div>
                  <div className={`text-2xl font-black ${lives >= 15 ? "text-emerald-400" : lives >= 7 ? "text-yellow-400" : "text-red-400"}`}>
                    {lives}/20
                  </div>
                  {isNewBestHearts ? (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Sparkles size={10} className="text-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase animate-pulse">New Best!</span>
                    </div>
                  ) : bestHearts ? (
                    <span className="text-[9px] text-red-400/50 mt-1 block">Best: {bestHearts}/20</span>
                  ) : null}
                </div>
              </div>

              {/* Category rating breakdown */}
              <div className="mt-2.5 flex flex-col gap-1.5">
                {CATEGORY_CONFIG.map((cat) => (
                  <CategoryRatingRow
                    key={cat.key}
                    icon={cat.icon}
                    label={cat.label}
                    stars={ratings[cat.key]}
                    iconColor={cat.color}
                    fillClass={cat.fillClass}
                    emptyClass={cat.emptyClass}
                  />
                ))}
              </div>
            </div>

            {/* ===== Ornate Divider ===== */}
            <div className="px-6">
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border35} 20%, ${GOLD.bright45} 50%, ${GOLD.border35} 80%, transparent)` }} />
            </div>

            {/* ===== Continue Button ===== */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex justify-center">
              <button
                onClick={() => resetGame()}
                className="group relative px-6 sm:px-10 py-2.5 sm:py-3 rounded-xl font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm transition-all duration-200 hover:scale-105 hover:brightness-110"
                style={{
                  background: `linear-gradient(180deg, ${VICTORY.btnLight} 0%, ${VICTORY.btnDark} 100%)`,
                  border: `1.5px solid ${GOLD.bright60}`,
                  color: "#fff2c8",
                  textShadow: "0 0 12px rgba(252,211,77,0.3), 0 2px 4px rgba(0,0,0,0.6)",
                  boxShadow: `inset 0 1px 0 ${OVERLAY.white15}, 0 4px 16px ${OVERLAY.black40}, 0 0 24px rgba(180,140,60,0.15)`,
                }}
              >
                <span className="flex items-center gap-2 sm:gap-2.5">
                  <Swords size={14} />
                  Onwards
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
}

export default VictoryScreen;
