"use client";
import React, { useRef, useEffect, useState } from "react";
import { Clock, RefreshCw, Wind } from "lucide-react";
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
    const scale = size / 150;
    const t = time * 0.05;

    // Ominous glow
    const glowPulse = 0.3 + Math.sin(t * 2) * 0.15;
    ctx.shadowColor = "#8b0000";
    ctx.shadowBlur = 25 * scale * glowPulse;

    // Broken shield base
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50 * scale);
    ctx.lineTo(cx - 45 * scale, cy - 30 * scale);
    ctx.lineTo(cx - 45 * scale, cy + 20 * scale);
    ctx.lineTo(cx, cy + 50 * scale);
    ctx.lineTo(cx + 45 * scale, cy + 20 * scale);
    ctx.lineTo(cx + 45 * scale, cy - 30 * scale);
    ctx.closePath();
    ctx.fill();

    // Shield crack effect
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, cy - 45 * scale);
    ctx.lineTo(cx - 5 * scale, cy - 20 * scale);
    ctx.lineTo(cx - 15 * scale, cy);
    ctx.lineTo(cx - 5 * scale, cy + 20 * scale);
    ctx.lineTo(cx - 10 * scale, cy + 40 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 15 * scale, cy - 35 * scale);
    ctx.lineTo(cx + 10 * scale, cy - 10 * scale);
    ctx.lineTo(cx + 20 * scale, cy + 15 * scale);
    ctx.stroke();

    // Skull
    ctx.fillStyle = "#d4d4d4";
    ctx.beginPath();
    ctx.arc(cx, cy - 10 * scale, 28 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Jaw
    ctx.beginPath();
    ctx.arc(cx, cy + 15 * scale, 20 * scale, 0, Math.PI);
    ctx.fill();

    // Eye sockets
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(
      cx - 12 * scale,
      cy - 12 * scale,
      8 * scale,
      10 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      cx + 12 * scale,
      cy - 12 * scale,
      8 * scale,
      10 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Glowing red eyes
    const eyeGlow = 0.5 + Math.sin(t * 3) * 0.5;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 10 * scale;
    ctx.beginPath();
    ctx.arc(cx - 12 * scale, cy - 12 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 12 * scale, cy - 12 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Nose hole
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5 * scale);
    ctx.lineTo(cx - 5 * scale, cy + 5 * scale);
    ctx.lineTo(cx + 5 * scale, cy + 5 * scale);
    ctx.closePath();
    ctx.fill();

    // Teeth
    ctx.fillStyle = "#e8e8e8";
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(
        cx + i * 5 * scale - 2 * scale,
        cy + 15 * scale,
        4 * scale,
        8 * scale
      );
    }

    // Cracks on skull
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 5 * scale, cy - 35 * scale);
    ctx.lineTo(cx - 10 * scale, cy - 20 * scale);
    ctx.lineTo(cx - 5 * scale, cy - 10 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 8 * scale, cy - 30 * scale);
    ctx.lineTo(cx + 15 * scale, cy - 15 * scale);
    ctx.stroke();

    // Dark smoke/mist effect
    ctx.shadowBlur = 0;
    for (let i = 0; i < 5; i++) {
      const smokeX = cx + Math.sin(t * 2 + i) * 30 * scale;
      const smokeY =
        cy + 40 * scale - Math.abs(Math.sin(t + i * 0.5)) * 20 * scale;
      const smokeAlpha = 0.1 + Math.sin(t + i) * 0.05;

      ctx.fillStyle = `rgba(50, 0, 0, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, 15 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

// Fallen heroes animation
// const FallenHeroes: React.FC<{ size?: number }> = ({ size = 400 }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [time, setTime] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => setTime((t) => t + 1), 80);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const dpr = window.devicePixelRatio || 1;
//     canvas.width = size * dpr;
//     canvas.height = 80 * dpr;
//     ctx.scale(dpr, dpr);
//     ctx.clearRect(0, 0, size, 80);

//     const t = time * 0.05;
//     const heroes = [
//       { x: size * 0.2, color: "#f97316" },
//       { x: size * 0.4, color: "#8b5cf6" },
//       { x: size * 0.6, color: "#6366f1" },
//       { x: size * 0.8, color: "#78716c" },
//     ];

//     heroes.forEach((hero, i) => {
//       // Fallen on ground
//       const breathe = Math.sin(t * 2 + i) * 2;

//       // Shadow
//       ctx.fillStyle = "rgba(0,0,0,0.4)";
//       ctx.beginPath();
//       ctx.ellipse(hero.x, 65, 25, 8, 0, 0, Math.PI * 2);
//       ctx.fill();

//       // Body - lying down
//       ctx.fillStyle = hero.color;
//       ctx.save();
//       ctx.translate(hero.x, 55);
//       ctx.rotate(Math.PI / 2 + (i % 2 === 0 ? 0.2 : -0.2));
//       ctx.beginPath();
//       ctx.ellipse(0, 0, 14, 20 + breathe, 0, 0, Math.PI * 2);
//       ctx.fill();

//       // Head
//       ctx.fillStyle = "#d4c4b4";
//       ctx.beginPath();
//       ctx.arc(-22, 0, 10, 0, Math.PI * 2);
//       ctx.fill();

//       // X eyes (knocked out)
//       ctx.strokeStyle = "#333";
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.moveTo(-25, -3);
//       ctx.lineTo(-22, 0);
//       ctx.moveTo(-22, -3);
//       ctx.lineTo(-25, 0);
//       ctx.moveTo(-19, -3);
//       ctx.lineTo(-16, 0);
//       ctx.moveTo(-16, -3);
//       ctx.lineTo(-19, 0);
//       ctx.stroke();

//       ctx.restore();

//       // Soul wisps rising
//       const soulAlpha = 0.2 + Math.sin(t * 2 + i) * 0.1;
//       ctx.fillStyle = `rgba(150, 150, 200, ${soulAlpha})`;
//       const soulY = 40 - ((t * 2) % 30);
//       ctx.beginPath();
//       ctx.arc(
//         hero.x + Math.sin(t + i) * 5,
//         soulY,
//         5 + Math.sin(t * 3 + i) * 2,
//         0,
//         Math.PI * 2
//       );
//       ctx.fill();
//     });
//   }, [size, time]);

//   return <canvas ref={canvasRef} style={{ width: size, height: 80 }} />;
// };

// Marching enemies (victorious)
const VictoriousEnemies: React.FC<{ size?: number }> = ({ size = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 70);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = 70 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, 70);

    const t = time * 0.1;

    // Victorious enemies marching
    for (let i = 0; i < 10; i++) {
      const x = ((i * 50 + t * 20) % (size + 60)) - 30;
      const bounce = Math.abs(Math.sin(t * 3 + i)) * 8;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x, 60, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle =
        i % 3 === 0 ? "#660000" : i % 3 === 1 ? "#004400" : "#330044";
      ctx.beginPath();
      ctx.ellipse(x, 42 - bounce, 11, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.arc(x, 24 - bounce, 9, 0, Math.PI * 2);
      ctx.fill();

      // Glowing eyes
      ctx.fillStyle = "#ff3333";
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(x - 3, 22 - bounce, 2, 0, Math.PI * 2);
      ctx.arc(x + 3, 22 - bounce, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Raised weapon (victory pose)
      ctx.fillStyle = "#444";
      ctx.save();
      ctx.translate(x + 10, 30 - bounce);
      ctx.rotate(-1.2 + Math.sin(t * 2 + i) * 0.3);
      ctx.fillRect(-2, -22, 4, 26);
      ctx.fillStyle = "#666";
      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(-6, -20);
      ctx.lineTo(6, -20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }, [size, time]);

  return <canvas ref={canvasRef} style={{ width: size, height: 70 }} />;
};

// Destroyed tower sprite
const DestroyedTower: React.FC<{ x: number; size?: number }> = ({
  x,
  size = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 100);
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
    const cy = size / 2 + 5;
    const scale = size / 60;
    const t = time * 0.1;

    // Rubble base
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15 * scale, 20 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Broken tower walls
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.moveTo(cx - 15 * scale, cy + 10 * scale);
    ctx.lineTo(cx - 12 * scale, cy - 10 * scale);
    ctx.lineTo(cx - 5 * scale, cy - 15 * scale);
    ctx.lineTo(cx - 8 * scale, cy + 5 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 8 * scale, cy + 12 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 5 * scale);
    ctx.lineTo(cx + 5 * scale, cy - 12 * scale);
    ctx.lineTo(cx + 15 * scale, cy + 8 * scale);
    ctx.closePath();
    ctx.fill();

    // Scattered stones
    ctx.fillStyle = "#555";
    ctx.fillRect(cx - 18 * scale, cy + 8 * scale, 6 * scale, 4 * scale);
    ctx.fillRect(cx + 10 * scale, cy + 10 * scale, 5 * scale, 3 * scale);
    ctx.fillRect(cx - 5 * scale, cy + 12 * scale, 4 * scale, 3 * scale);

    // Smoke
    const smokeAlpha = 0.3 + Math.sin(t) * 0.1;
    ctx.fillStyle = `rgba(80, 80, 80, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(
      cx + Math.sin(t) * 3 * scale,
      cy - 10 * scale - (t % 20),
      8 * scale,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      cx - 5 * scale + Math.sin(t + 1) * 2 * scale,
      cy - 15 * scale - ((t + 5) % 20),
      6 * scale,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [size, time, x]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        position: "absolute",
        left: x,
        bottom: 0,
      }}
    />
  );
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

  return (
    <div className="w-full h-screen bg-gradient-to-br from-stone-900 via-stone-950 to-black flex flex-col items-center justify-center text-stone-300 relative overflow-hidden">
      {/* Dark fog effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[300px] h-[100px] rounded-full bg-red-950/20 blur-3xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />

      {/* Skull/defeat icon */}
      <div className="z-10 mb-1">
        <DefeatSprite size={130} />
      </div>

      {/* Title */}
      <div className="relative mb-6 z-10">
        <h1
          className="text-7xl font-bold text-red-950 tracking-widest drop-shadow-2xl"
          style={{ textShadow: "4px 4px 0 rgba(0, 0, 0, 1)" }}
        >
          DEFEAT
        </h1>
        <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-red-900 to-transparent" />
      </div>
      <p className="text-3xl text-red-400">{levelName}</p>

      {/* Message */}
      <div className=" text-red-800/80 mb-3 tracking-wide drop-shadow-lg z-10">
        The Kingdom Has Fallen
      </div>

      {/* Stats Grid */}
      <div className="bg-stone-800/50 rounded-lg p-2 mb-3 border border-red-900">
        <div className="grid grid-cols-2 gap-4">
          {/* Time Survived */}
          <div className="text-center bg-stone-700/30 p-3 rounded-lg">
            <div className="text-red-400 text-sm mb-1">
              <Clock size={14} className="inline mb-0.5 mr-1" />
              Time Survived
            </div>
            <div className="text-2xl font-bold text-gray-300">
              {formatTime(timeSpent)}
            </div>
            {bestTime && (
              <div className="text-xs text-gray-500">
                Best: {formatTime(bestTime)}
              </div>
            )}
          </div>

          {/* Waves */}
          <div className="text-center bg-stone-700/30 p-3 rounded-lg">
            <div className="text-red-400 text-sm mb-1">
              <Wind size={14} className="inline mb-0.5 mr-1" />
              Waves
            </div>
            <div className="text-2xl font-bold text-gray-300">
              {waveReached} / {totalWaves}
            </div>
            <div className="text-xs text-gray-500">
              {waveProgress}% complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-stone-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${waveProgress}%` }}
            />
          </div>
        </div>

        {/* Attempt Counter */}
        <div className="mt-3 text-xs text-gray-500">Attempt #{timesPlayed}</div>
      </div>

      {/* Encouragement */}
      <div className="bg-stone-800/50 rounded-lg mb-3 p-2 border border-red-900">
        <p className="text-gray-400 text-sm">
          {waveProgress >= 75
            ? "So close! You can do this!"
            : waveProgress >= 50
            ? "Halfway there - keep pushing!"
            : waveProgress >= 25
            ? "Learning the level... try new strategies!"
            : "Every defeat is a lesson. Rise again, defender!"}
        </p>
      </div>

      {/* Fallen heroes */}
      {/* <div className="mb-4 z-10">
        <FallenHeroes size={350} />
      </div> */}

      {/* Victorious enemies */}
      <div className="mb-8 relative z-10 opacity-70">
        <VictoriousEnemies size={400} />
        {/* Destroyed towers in background */}
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <DestroyedTower x={-30} size={50} />
          <DestroyedTower x={90} size={45} />
          <DestroyedTower x={170} size={55} />
          <DestroyedTower x={270} size={48} />
          <DestroyedTower x={370} size={52} />
        </div>
      </div>

      {/* Retry button */}
      <button
        onClick={resetGame}
        className="z-10 px-14 py-5 bg-gradient-to-b from-stone-700 to-stone-900 hover:from-stone-600 hover:to-stone-800 transition-all text-xl font-bold border-4 border-stone-950 shadow-2xl rounded-lg hover:scale-105"
        style={{
          clipPath:
            "polygon(10% 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0 85%, 0 15%)",
        }}
      >
        <span className="flex items-center gap-3 text-stone-300">
          <RefreshCw size={24} /> TRY AGAIN
        </span>
      </button>
    </div>
  );
}

export default DefeatScreen;
