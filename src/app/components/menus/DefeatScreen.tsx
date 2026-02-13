"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  Clock,
  RefreshCw,
  Skull,
  Shield,
  Swords,
  Wind,
  Flame,
} from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { GOLD, DEFEAT, OVERLAY, RED_CARD } from "../ui/theme";

// Helper to format time as mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface DefeatScreenProps {
  resetGame: () => void;
  timeSpent: number;
  waveReached: number;
  totalWaves: number;
  levelName: string;
  bestTime?: number;
  timesPlayed: number;
}

// Animated broken shield/skull sprite
const DefeatSprite: React.FC<{ size?: number }> = ({ size = 150 }) => {
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
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const s = size / 150;
    const t = time * 0.05;

    // --- Ambient dark red glow ---
    const ambientGlow = ctx.createRadialGradient(cx, cy, 10 * s, cx, cy, 75 * s);
    const ambAlpha = 0.12 + Math.sin(t * 1.5) * 0.04;
    ambientGlow.addColorStop(0, `rgba(139,0,0,${ambAlpha})`);
    ambientGlow.addColorStop(0.5, `rgba(80,0,0,${ambAlpha * 0.5})`);
    ambientGlow.addColorStop(1, "rgba(80,0,0,0)");
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, size, size);

    // --- Crossed Bones behind skull ---
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawBone = (x1: number, y1: number, x2: number, y2: number) => {
      const boneGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      boneGrad.addColorStop(0, "#c8c0b0");
      boneGrad.addColorStop(0.3, "#e8e0d4");
      boneGrad.addColorStop(0.5, "#d8d0c0");
      boneGrad.addColorStop(0.7, "#e8e0d4");
      boneGrad.addColorStop(1, "#c8c0b0");
      ctx.strokeStyle = boneGrad;
      ctx.lineWidth = 7 * s;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Bone knobs at ends
      const knobR = 5 * s;
      for (const [kx, ky] of [[x1, y1], [x2, y2]]) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * knobR * 0.5;
        const ny = dx / len * knobR * 0.5;
        ctx.fillStyle = "#d8d0c0";
        ctx.beginPath();
        ctx.arc(kx + nx, ky + ny, knobR * 0.7, 0, Math.PI * 2);
        ctx.arc(kx - nx, ky - ny, knobR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawBone(cx - 42 * s, cy + 38 * s, cx + 42 * s, cy - 38 * s);
    drawBone(cx + 42 * s, cy + 38 * s, cx - 42 * s, cy - 38 * s);

    // --- Broken shield behind skull ---
    ctx.shadowColor = "#8b0000";
    const shieldGlowPulse = 0.3 + Math.sin(t * 2) * 0.15;
    ctx.shadowBlur = 20 * s * shieldGlowPulse;

    // Shield - left half (slightly separated/cracked)
    const shieldGradL = ctx.createLinearGradient(cx - 48 * s, cy - 30 * s, cx, cy + 10 * s);
    shieldGradL.addColorStop(0, "#4a4a4a");
    shieldGradL.addColorStop(0.4, "#555555");
    shieldGradL.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = shieldGradL;
    ctx.beginPath();
    ctx.moveTo(cx - 2 * s, cy - 50 * s);
    ctx.lineTo(cx - 46 * s, cy - 30 * s);
    ctx.lineTo(cx - 46 * s, cy + 18 * s);
    ctx.lineTo(cx - 2 * s, cy + 48 * s);
    ctx.lineTo(cx - 2 * s, cy - 50 * s);
    ctx.closePath();
    ctx.fill();

    // Shield - right half
    const shieldGradR = ctx.createLinearGradient(cx, cy - 30 * s, cx + 48 * s, cy + 10 * s);
    shieldGradR.addColorStop(0, "#505050");
    shieldGradR.addColorStop(0.4, "#5a5a5a");
    shieldGradR.addColorStop(1, "#404040");
    ctx.fillStyle = shieldGradR;
    ctx.beginPath();
    ctx.moveTo(cx + 2 * s, cy - 50 * s);
    ctx.lineTo(cx + 46 * s, cy - 30 * s);
    ctx.lineTo(cx + 46 * s, cy + 18 * s);
    ctx.lineTo(cx + 2 * s, cy + 48 * s);
    ctx.lineTo(cx + 2 * s, cy - 50 * s);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Shield border trim (ornate)
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50 * s);
    ctx.lineTo(cx - 46 * s, cy - 30 * s);
    ctx.lineTo(cx - 46 * s, cy + 18 * s);
    ctx.lineTo(cx, cy + 48 * s);
    ctx.lineTo(cx + 46 * s, cy + 18 * s);
    ctx.lineTo(cx + 46 * s, cy - 30 * s);
    ctx.closePath();
    ctx.stroke();

    // Shield inner border
    ctx.strokeStyle = "rgba(100,80,60,0.4)";
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 44 * s);
    ctx.lineTo(cx - 40 * s, cy - 26 * s);
    ctx.lineTo(cx - 40 * s, cy + 14 * s);
    ctx.lineTo(cx, cy + 42 * s);
    ctx.lineTo(cx + 40 * s, cy + 14 * s);
    ctx.lineTo(cx + 40 * s, cy - 26 * s);
    ctx.closePath();
    ctx.stroke();

    // Shield cracks (more detailed, branching)
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5 * s;
    // Main vertical crack
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50 * s);
    ctx.lineTo(cx - 3 * s, cy - 30 * s);
    ctx.lineTo(cx + 2 * s, cy - 15 * s);
    ctx.lineTo(cx - 4 * s, cy);
    ctx.lineTo(cx + 1 * s, cy + 20 * s);
    ctx.lineTo(cx, cy + 48 * s);
    ctx.stroke();
    // Branch cracks
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, cy - 30 * s);
    ctx.lineTo(cx - 20 * s, cy - 22 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 2 * s, cy - 15 * s);
    ctx.lineTo(cx + 22 * s, cy - 8 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy);
    ctx.lineTo(cx - 25 * s, cy + 8 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 1 * s, cy + 20 * s);
    ctx.lineTo(cx + 18 * s, cy + 28 * s);
    ctx.stroke();

    // Shield rivets along border
    ctx.fillStyle = "#7a6a5a";
    const rivetPositions = [
      [-42, -28], [-44, -5], [-40, 14], [-20, 38],
      [42, -28], [44, -5], [40, 14], [20, 38],
      [-20, -45], [20, -45],
    ];
    for (const [rx, ry] of rivetPositions) {
      ctx.beginPath();
      ctx.arc(cx + rx * s, cy + ry * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Skull (detailed, centered on shield) ---
    // Skull shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 24 * s, 22 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skull cranium with gradient
    const skullGrad = ctx.createRadialGradient(cx - 3 * s, cy - 18 * s, 2 * s, cx, cy - 10 * s, 30 * s);
    skullGrad.addColorStop(0, "#f0ece4");
    skullGrad.addColorStop(0.3, "#e0d8cc");
    skullGrad.addColorStop(0.7, "#c8c0b0");
    skullGrad.addColorStop(1, "#a09888");
    ctx.fillStyle = skullGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 10 * s, 28 * s, 0, Math.PI * 2);
    ctx.fill();

    // Cheekbones
    ctx.fillStyle = "#d8d0c0";
    ctx.beginPath();
    ctx.ellipse(cx - 18 * s, cy + 2 * s, 10 * s, 8 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 18 * s, cy + 2 * s, 10 * s, 8 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Jaw with gradient
    const jawGrad = ctx.createLinearGradient(cx, cy + 8 * s, cx, cy + 28 * s);
    jawGrad.addColorStop(0, "#d8d0c0");
    jawGrad.addColorStop(1, "#b0a898");
    ctx.fillStyle = jawGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 20 * s, cy + 8 * s);
    ctx.quadraticCurveTo(cx - 22 * s, cy + 22 * s, cx - 12 * s, cy + 26 * s);
    ctx.lineTo(cx + 12 * s, cy + 26 * s);
    ctx.quadraticCurveTo(cx + 22 * s, cy + 22 * s, cx + 20 * s, cy + 8 * s);
    ctx.closePath();
    ctx.fill();

    // Jaw line separation
    ctx.strokeStyle = "rgba(100,90,80,0.35)";
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 20 * s, cy + 10 * s);
    ctx.quadraticCurveTo(cx, cy + 14 * s, cx + 20 * s, cy + 10 * s);
    ctx.stroke();

    // Eye sockets (deeper, more shaped)
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.moveTo(cx - 18 * s, cy - 15 * s);
    ctx.quadraticCurveTo(cx - 22 * s, cy - 8 * s, cx - 12 * s, cy - 4 * s);
    ctx.quadraticCurveTo(cx - 5 * s, cy - 8 * s, cx - 6 * s, cy - 18 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 18 * s, cy - 15 * s);
    ctx.quadraticCurveTo(cx + 22 * s, cy - 8 * s, cx + 12 * s, cy - 4 * s);
    ctx.quadraticCurveTo(cx + 5 * s, cy - 8 * s, cx + 6 * s, cy - 18 * s);
    ctx.closePath();
    ctx.fill();

    // Glowing red eyes with pulsing inner glow
    const eyeGlow = 0.5 + Math.sin(t * 3) * 0.5;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 12 * s * eyeGlow;
    ctx.fillStyle = `rgba(255, 20, 20, ${eyeGlow * 0.9})`;
    ctx.beginPath();
    ctx.arc(cx - 13 * s, cy - 11 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 13 * s, cy - 11 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 150, 100, ${eyeGlow * 0.6})`;
    ctx.beginPath();
    ctx.arc(cx - 14 * s, cy - 13 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 12 * s, cy - 13 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Nose cavity (triangular, more detailed)
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.moveTo(cx - 1 * s, cy - 3 * s);
    ctx.lineTo(cx - 6 * s, cy + 6 * s);
    ctx.quadraticCurveTo(cx, cy + 8 * s, cx + 6 * s, cy + 6 * s);
    ctx.closePath();
    ctx.fill();

    // Teeth (individual, slightly irregular for realism)
    ctx.fillStyle = "#e8e4d8";
    const teeth = [-12, -8, -4, 0, 4, 8, 12];
    const teethH = [7, 8, 7, 6, 7, 8, 7];
    for (let i = 0; i < teeth.length; i++) {
      const tx = cx + teeth[i] * s;
      const tw = 3.2 * s;
      const th = teethH[i] * s;
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(tx - tw / 2, cy + 12 * s, tw, th);
      // Tooth gap line
      ctx.strokeStyle = "rgba(100,80,60,0.3)";
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2, cy + 12 * s);
      ctx.lineTo(tx - tw / 2, cy + 12 * s + th);
      ctx.stroke();
    }

    // Skull bone texture / cracks
    ctx.strokeStyle = "rgba(150,140,125,0.5)";
    ctx.lineWidth = 0.8 * s;
    // Forehead cracks
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy - 36 * s);
    ctx.lineTo(cx - 8 * s, cy - 25 * s);
    ctx.lineTo(cx - 3 * s, cy - 18 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6 * s, cy - 33 * s);
    ctx.lineTo(cx + 12 * s, cy - 22 * s);
    ctx.stroke();
    // Temporal line
    ctx.beginPath();
    ctx.moveTo(cx - 26 * s, cy - 5 * s);
    ctx.quadraticCurveTo(cx - 20 * s, cy - 20 * s, cx - 10 * s, cy - 30 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 26 * s, cy - 5 * s);
    ctx.quadraticCurveTo(cx + 20 * s, cy - 20 * s, cx + 10 * s, cy - 30 * s);
    ctx.stroke();

    // --- Dark energy wisps (floating, animated) ---
    for (let i = 0; i < 8; i++) {
      const wAngle = (i / 8) * Math.PI * 2 + t * 0.7;
      const wDist = (45 + Math.sin(t * 1.5 + i * 2) * 15) * s;
      const wx = cx + Math.cos(wAngle) * wDist;
      const wy = cy + Math.sin(wAngle) * wDist * 0.6;
      const wAlpha = 0.08 + Math.sin(t * 2 + i * 1.5) * 0.06;
      const wSize = (12 + Math.sin(t + i) * 5) * s;

      const wispGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wSize);
      wispGrad.addColorStop(0, `rgba(139, 0, 0, ${wAlpha * 1.5})`);
      wispGrad.addColorStop(0.5, `rgba(80, 0, 0, ${wAlpha})`);
      wispGrad.addColorStop(1, "rgba(60, 0, 0, 0)");
      ctx.fillStyle = wispGrad;
      ctx.beginPath();
      ctx.arc(wx, wy, wSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Floating embers / dark particles ---
    for (let i = 0; i < 6; i++) {
      const eAngle = (i / 6) * Math.PI * 2 + t * 1.2;
      const eDist = (55 + Math.sin(t * 2 + i * 3) * 10) * s;
      const ex = cx + Math.cos(eAngle) * eDist;
      const ey = cy + Math.sin(eAngle) * eDist * 0.5;
      const eAlpha = 0.3 + Math.sin(t * 3 + i * 2) * 0.3;
      ctx.fillStyle = `rgba(180, 30, 30, ${eAlpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Rising smoke wisps (bottom) ---
    for (let i = 0; i < 4; i++) {
      const smokeX = cx + Math.sin(t * 1.5 + i * 1.8) * 25 * s;
      const smokeYBase = cy + 45 * s;
      const smokeYOff = Math.abs(Math.sin(t * 0.8 + i * 0.7)) * 25 * s;
      const smokeAlpha = 0.06 + Math.sin(t * 0.5 + i) * 0.03;
      const smokeSize = (18 + Math.sin(t + i) * 5) * s;
      const smokeGrad = ctx.createRadialGradient(smokeX, smokeYBase - smokeYOff, 0, smokeX, smokeYBase - smokeYOff, smokeSize);
      smokeGrad.addColorStop(0, `rgba(40, 0, 0, ${smokeAlpha * 2})`);
      smokeGrad.addColorStop(1, "rgba(30, 0, 0, 0)");
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(smokeX, smokeYBase - smokeYOff, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

export function DefeatScreen({
  resetGame,
  timeSpent,
  waveReached,
  totalWaves,
  levelName,
  bestTime,
  timesPlayed,
}: DefeatScreenProps) {
  const waveProgress = Math.round((waveReached / totalWaves) * 100);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const defeatMessage =
    waveProgress >= 75
      ? "The darkness nearly fell... so close, yet so far."
      : waveProgress >= 50
        ? "The battle was fierce, but the enemy proved too strong."
        : waveProgress >= 25
          ? "The horde overwhelmed our defenses. Regroup and try again."
          : "A crushing defeat... but every fall teaches a hard lesson.";

  const encouragement =
    waveProgress >= 75
      ? "You were on the brink of victory! One more push!"
      : waveProgress >= 50
        ? "Halfway there — refine your strategy and strike again."
        : waveProgress >= 25
          ? "Study the enemy waves. Knowledge is power, defender."
          : "Every great defender started from nothing. Rise again!";

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-auto"
      style={{
        background: "linear-gradient(180deg, #0d0808 0%, #1a0c0c 40%, #0d0808 100%)",
      }}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,0,0,0.06), transparent)",
      }} />

      {/* Drifting ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${1 + (i % 2)}px`,
              height: `${1 + (i % 2)}px`,
              left: `${(i * 5.7) % 100}%`,
              top: `${(i * 6.3) % 100}%`,
              background: `rgba(200, ${40 + (i % 3) * 20}, 0, ${0.12 + (i % 4) * 0.06})`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Main panel */}
      <div className={`relative z-10 max-w-xl w-full mx-4 transition-all duration-500 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <OrnateFrame
          className="rounded-2xl overflow-hidden border-2 border-red-900/50 shadow-2xl"
          cornerSize={48}
          showBorders={true}
          color="#7f1d1d"
          glowColor="#dc2626"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(30,18,18,0.98) 0%, rgba(18,10,10,0.99) 100%)",
              boxShadow: `inset 0 0 30px ${DEFEAT.glow06}, 0 8px 40px ${OVERLAY.black60}`,
            }}
          >
            {/* Inner border glow */}
            <div className="absolute inset-[3px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${DEFEAT.innerBorder12}` }} />

            {/* ===== Skull + Title Header ===== */}
            <div className="flex flex-col items-center pt-8 pb-3 relative"
              style={{ background: `linear-gradient(180deg, ${DEFEAT.glow07} 0%, transparent 100%)` }}
            >
              <DefeatSprite size={110} />

              <h1
                className="text-5xl font-black tracking-[0.25em] mt-2"
                style={{
                  color: "#991b1b",
                  textShadow: "0 0 40px rgba(153,27,27,0.35), 0 3px 0 #300808, 0 4px 8px rgba(0,0,0,0.6)",
                }}
              >
                DEFEAT
              </h1>

              {/* Ornate divider with skull */}
              <div className="flex items-center gap-3 mt-3 w-full px-10">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEFEAT.border40} 30%, ${DEFEAT.accent50} 100%)` }} />
                <div className="p-1.5 rounded-full" style={{ background: `linear-gradient(135deg, ${DEFEAT.border25}, rgba(80,10,10,0.2))`, border: `1px solid ${DEFEAT.border35}` }}>
                  <Skull size={12} className="text-red-700/80" />
                </div>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, transparent, ${DEFEAT.border40} 30%, ${DEFEAT.accent50} 100%)` }} />
              </div>

              {/* Level name */}
              <p className="text-sm text-red-400/60 tracking-[0.3em] uppercase mt-2 font-semibold">
                {levelName}
              </p>
            </div>

            {/* Flavor text */}
            <p className="text-[10px] text-red-900/50 italic text-center px-10 mb-3 leading-relaxed">
              &ldquo;{defeatMessage}&rdquo;
            </p>

            {/* ===== Ornate Divider ===== */}
            <div className="px-6">
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEFEAT.border30} 20%, ${DEFEAT.accent40} 50%, ${DEFEAT.border30} 80%, transparent)` }} />
            </div>

            {/* ===== Stats Grid ===== */}
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Time survived */}
                <div className="rounded-xl p-3 relative" style={{
                  background: "linear-gradient(135deg, rgba(35,30,38,0.6), rgba(25,22,30,0.4))",
                  border: "1.5px solid rgba(100,90,120,0.2)",
                  boxShadow: "inset 0 0 12px rgba(80,70,100,0.05)",
                }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock size={11} className="text-stone-500/70" />
                    <span className="text-[9px] font-bold text-stone-500/60 tracking-[0.2em] uppercase">Time</span>
                  </div>
                  <div className="text-xl font-black text-stone-400/80">
                    {formatTime(timeSpent)}
                  </div>
                  {bestTime ? (
                    <span className="text-[8px] text-stone-600/40 mt-1 block">Best: {formatTime(bestTime)}</span>
                  ) : null}
                </div>

                {/* Waves reached */}
                <div className="rounded-xl p-3 relative" style={{
                  background: "linear-gradient(135deg, rgba(45,22,22,0.6), rgba(35,15,15,0.4))",
                  border: `1.5px solid ${DEFEAT.border20}`,
                  boxShadow: "inset 0 0 12px rgba(139,0,0,0.05)",
                }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Wind size={11} className="text-red-800/60" />
                    <span className="text-[9px] font-bold text-red-800/50 tracking-[0.2em] uppercase">Waves</span>
                  </div>
                  <div className="text-xl font-black text-red-400/70">
                    {waveReached}/{totalWaves}
                  </div>
                  <span className="text-[8px] text-red-900/40 mt-1 block">{waveProgress}% cleared</span>
                </div>
              </div>

              {/* Wave progress bar */}
              <div className="mt-2.5 rounded-xl p-2.5" style={{
                background: `linear-gradient(90deg, ${DEFEAT.glow06}, ${DEFEAT.innerBorder10}, ${DEFEAT.glow06})`,
                border: `1.5px solid ${DEFEAT.border15}`,
              }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Swords size={11} className="text-red-800/50" />
                    <span className="text-[9px] font-bold text-red-800/50 tracking-[0.15em] uppercase">Battle Progress</span>
                  </div>
                  <span className="text-[9px] text-red-400/50 font-bold">{waveProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: DEFEAT.progressBg }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${waveProgress}%`,
                      background: "linear-gradient(90deg, #7f1d1d, #dc2626, #f87171)",
                      boxShadow: "0 0 8px rgba(220,38,38,0.3)",
                    }}
                  />
                </div>
              </div>

              {/* Attempt counter */}
              <div className="mt-2.5 rounded-xl p-2.5 flex items-center justify-between" style={{
                background: "linear-gradient(90deg, rgba(60,50,40,0.08), rgba(60,50,40,0.12), rgba(60,50,40,0.08))",
                border: "1.5px solid rgba(80,70,60,0.15)",
              }}>
                <div className="flex items-center gap-1.5">
                  <Shield size={11} className="text-stone-600/50" />
                  <span className="text-[9px] font-bold text-stone-600/50 tracking-[0.15em] uppercase">Attempt</span>
                </div>
                <span className="text-xs font-black text-stone-500/60">#{timesPlayed}</span>
              </div>
            </div>

            {/* ===== Ornate Divider ===== */}
            <div className="px-6">
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEFEAT.border30} 20%, ${DEFEAT.accent40} 50%, ${DEFEAT.border30} 80%, transparent)` }} />
            </div>

            {/* ===== Encouragement ===== */}
            <div className="px-5 py-3">
              <div className="rounded-xl p-3 flex items-start gap-2.5" style={{
                background: "linear-gradient(135deg, rgba(120,80,20,0.08), rgba(80,50,10,0.06))",
                border: `1.5px solid ${GOLD.innerBorder12}`,
                boxShadow: "inset 0 0 10px rgba(180,140,60,0.03)",
              }}>
                <Flame size={13} className="text-amber-700/50 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[8px] font-bold text-amber-600/40 tracking-[0.2em] uppercase">Wisdom</span>
                  <p className="text-[10px] text-amber-600/50 leading-relaxed mt-0.5">{encouragement}</p>
                </div>
              </div>
            </div>

            {/* ===== Ornate Divider ===== */}
            <div className="px-6">
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEFEAT.border30} 20%, ${DEFEAT.accent40} 50%, ${DEFEAT.border30} 80%, transparent)` }} />
            </div>

            {/* ===== Retry Button ===== */}
            <div className="px-6 py-5 flex justify-center">
              <button
                onClick={resetGame}
                className="group relative px-10 py-3 rounded-xl font-bold tracking-[0.2em] uppercase text-sm transition-all duration-200 hover:scale-105 hover:brightness-110"
                style={{
                  background: `linear-gradient(180deg, ${DEFEAT.btnLight} 0%, ${DEFEAT.btnDark} 100%)`,
                  border: `1.5px solid ${RED_CARD.accent35}`,
                  color: "#e8a090",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  boxShadow: `inset 0 1px 0 ${OVERLAY.white08}, 0 4px 16px ${OVERLAY.black40}, 0 0 20px rgba(139,0,0,0.08)`,
                }}
              >
                <span className="flex items-center gap-2.5">
                  <RefreshCw size={15} />
                  Try Again
                  <Swords size={15} />
                </span>
              </button>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
}

export default DefeatScreen;
