"use client";
import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { GameState } from "../../types";

interface VictoryScreenProps {
  setGameState: (state: GameState) => void;
  resetGame: () => void;
  starsEarned: number;
  lives: number;
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
    const scale = size / 150;
    const t = time * 0.1;

    // Glow effect
    const glowIntensity = 0.4 + Math.sin(t * 2) * 0.2;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 30 * scale * glowIntensity;

    // Trophy base
    ctx.fillStyle = "#8b6914";
    ctx.beginPath();
    ctx.moveTo(cx - 35 * scale, cy + 55 * scale);
    ctx.lineTo(cx + 35 * scale, cy + 55 * scale);
    ctx.lineTo(cx + 30 * scale, cy + 45 * scale);
    ctx.lineTo(cx - 30 * scale, cy + 45 * scale);
    ctx.closePath();
    ctx.fill();

    // Base detail
    ctx.fillStyle = "#a67c00";
    ctx.fillRect(cx - 25 * scale, cy + 48 * scale, 50 * scale, 4 * scale);

    // Trophy stem
    ctx.fillStyle = "#b8860b";
    ctx.beginPath();
    ctx.moveTo(cx - 8 * scale, cy + 45 * scale);
    ctx.lineTo(cx + 8 * scale, cy + 45 * scale);
    ctx.lineTo(cx + 12 * scale, cy + 15 * scale);
    ctx.lineTo(cx - 12 * scale, cy + 15 * scale);
    ctx.closePath();
    ctx.fill();

    // Trophy cup
    const cupGrad = ctx.createLinearGradient(
      cx - 40 * scale,
      0,
      cx + 40 * scale,
      0
    );
    cupGrad.addColorStop(0, "#b8860b");
    cupGrad.addColorStop(0.3, "#ffd700");
    cupGrad.addColorStop(0.5, "#ffec8b");
    cupGrad.addColorStop(0.7, "#ffd700");
    cupGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = cupGrad;

    ctx.beginPath();
    ctx.moveTo(cx - 35 * scale, cy - 40 * scale);
    ctx.quadraticCurveTo(cx - 45 * scale, cy, cx - 25 * scale, cy + 15 * scale);
    ctx.lineTo(cx + 25 * scale, cy + 15 * scale);
    ctx.quadraticCurveTo(cx + 45 * scale, cy, cx + 35 * scale, cy - 40 * scale);
    ctx.lineTo(cx - 35 * scale, cy - 40 * scale);
    ctx.fill();

    // Cup rim
    ctx.fillStyle = "#ffec8b";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 40 * scale, 35 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 40 * scale, 30 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Handles
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 6 * scale;
    ctx.lineCap = "round";

    // Left handle
    ctx.beginPath();
    ctx.arc(
      cx - 42 * scale,
      cy - 15 * scale,
      15 * scale,
      -Math.PI * 0.3,
      Math.PI * 0.7
    );
    ctx.stroke();

    // Right handle
    ctx.beginPath();
    ctx.arc(
      cx + 42 * scale,
      cy - 15 * scale,
      15 * scale,
      Math.PI * 0.3,
      Math.PI * 1.3
    );
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Star emblem on cup
    ctx.fillStyle = "#fff8dc";
    drawStar(ctx, cx, cy - 15 * scale, 12 * scale, 6 * scale);

    // Sparkles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t;
      const dist = 50 + Math.sin(t * 2 + i) * 10;
      const sparkleX = cx + Math.cos(angle) * dist * scale;
      const sparkleY = cy - 10 * scale + Math.sin(angle) * dist * scale * 0.6;
      const sparkleSize = (3 + Math.sin(t * 3 + i * 2) * 2) * scale;
      const alpha = 0.5 + Math.sin(t * 2 + i) * 0.5;

      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      drawStar(ctx, sparkleX, sparkleY, sparkleSize, sparkleSize * 0.4);
    }
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

// Animated star rating
const StarRating: React.FC<{ earned: number; size?: number }> = ({
  earned,
  size = 80,
}) => {
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

      // Animation delay for each star
      const delay = i * 0.5;
      const starScale = isEarned ? 1 + Math.sin(t * 2 - delay) * 0.1 : 1;
      const rotation = isEarned ? Math.sin(t - delay) * 0.1 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.scale(starScale, starScale);

      if (isEarned) {
        // Glow
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 20;

        // Star gradient
        const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
        starGrad.addColorStop(0, "#ffec8b");
        starGrad.addColorStop(0.5, "#ffd700");
        starGrad.addColorStop(1, "#b8860b");
        ctx.fillStyle = starGrad;
      } else {
        ctx.fillStyle = "#3a3020";
      }

      drawStar(ctx, 0, 0, size * 0.4, size * 0.2);

      // Inner detail for earned stars
      if (isEarned) {
        ctx.fillStyle = "#ffec8b";
        drawStar(ctx, 0, -2, size * 0.2, size * 0.1);
      }

      ctx.restore();

      // Sparkles for earned stars
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

// Celebrating heroes
const CelebratingHeroes: React.FC<{ size?: number }> = ({ size = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = 100 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, 100);

    const t = time * 0.1;
    const heroes = [
      { x: size * 0.15, color: "#f97316", name: "T" },
      { x: size * 0.35, color: "#8b5cf6", name: "Te" },
      { x: size * 0.5, color: "#6366f1", name: "M" },
      { x: size * 0.65, color: "#78716c", name: "R" },
      { x: size * 0.85, color: "#14b8a6", name: "S" },
    ];

    heroes.forEach((hero, i) => {
      const bounce = Math.abs(Math.sin(t * 2 + i * 0.8)) * 15;
      const armWave = Math.sin(t * 3 + i) * 0.5;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(hero.x, 85, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = hero.color;
      ctx.beginPath();
      ctx.ellipse(hero.x, 60 - bounce, 16, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = "#ffdbac";
      ctx.beginPath();
      ctx.arc(hero.x, 35 - bounce, 12, 0, Math.PI * 2);
      ctx.fill();

      // Happy face
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(hero.x - 4, 33 - bounce, 2, 0, Math.PI * 2);
      ctx.arc(hero.x + 4, 33 - bounce, 2, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hero.x, 38 - bounce, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Raised arm
      ctx.fillStyle = hero.color;
      ctx.save();
      ctx.translate(hero.x + 12, 50 - bounce);
      ctx.rotate(-1.2 + armWave);
      ctx.fillRect(-4, -20, 8, 22);
      // Hand
      ctx.fillStyle = "#ffdbac";
      ctx.beginPath();
      ctx.arc(0, -22, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Confetti around each hero
      for (let j = 0; j < 3; j++) {
        const confettiY = (t * 50 + j * 30 + i * 20) % 100;
        const confettiX = hero.x + Math.sin(t + j + i) * 25;
        const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"];
        ctx.fillStyle = colors[(i + j) % colors.length];
        ctx.fillRect(confettiX - 3, confettiY - 3, 6, 6);
      }
    });
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: 100 }} />;
};

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number
) {
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

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  setGameState,
  resetGame,
  starsEarned,
  lives,
}) => {
  return (
    <div
      className="w-full h-screen bg-gradient-to-br from-yellow-700 via-amber-800 to-orange-900 flex flex-col items-center justify-center text-amber-100 relative overflow-hidden"
      style={{ fontFamily: "'Cinzel', serif" }}
    >
      {/* Animated background rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-[200%] h-8 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent origin-left"
            style={{
              transform: `rotate(${i * 30}deg)`,
              animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-50" />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                "#ff6b6b",
                "#ffd93d",
                "#6bcb77",
                "#4d96ff",
                "#9966ff",
              ][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Trophy */}
      <div className="z-10 mb-4">
        <TrophySprite size={140} />
      </div>

      {/* Title */}
      <div className="relative mb-6 z-10">
        <h1
          className="text-6xl md:text-8xl font-bold text-amber-200 tracking-widest drop-shadow-2xl"
          style={{ textShadow: "4px 4px 0 rgba(92, 33, 4, 1)" }}
        >
          VICTORY!
        </h1>
        <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </div>

      {/* Star Rating */}
      <div className="mb-6 z-10">
        <StarRating earned={starsEarned} size={70} />
      </div>

      {/* Victory message */}
      <div className="text-2xl md:text-3xl text-amber-400 mb-2 tracking-wide drop-shadow-lg z-10">
        {starsEarned === 3 && "★ Perfect Defense! ★"}
        {starsEarned === 2 && "Strong Defense!"}
        {starsEarned === 1 && "Victory Achieved!"}
      </div>

      <div className="text-lg md:text-xl text-amber-300 mb-6 z-10">
        Lives Remaining: {lives}/20
      </div>

      {/* Celebrating heroes */}
      <div className="mb-8 z-10">
        <CelebratingHeroes size={350} />
      </div>

      {/* Button */}
      <div className="flex gap-4 z-10">
        <button
          onClick={() => {
            resetGame();
          }}
          className="px-10 py-4 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 transition-all text-xl font-bold border-4 border-amber-900 shadow-2xl rounded-lg hover:scale-105"
          style={{
            clipPath:
              "polygon(10% 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0 85%, 0 15%)",
          }}
        >
          <span className="flex items-center gap-3">
            <ArrowLeft size={24} /> CONTINUE
          </span>
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
