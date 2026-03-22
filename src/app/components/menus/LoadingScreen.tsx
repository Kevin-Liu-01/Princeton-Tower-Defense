"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Shield, Swords } from "lucide-react";
import { LOADING_TIPS, LOADING_LORE } from "../../constants/loadingAssets";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";

interface LoadingScreenProps {
  progress: number;
  loaded: number;
  total: number;
  context: "worldmap" | "battle";
  levelName?: string;
}

const CONTEXT_CONFIG = {
  worldmap: {
    title: "PREPARING THE KINGDOM",
    subtitle: "Marshalling the realm\u2019s defenses\u2026",
    bgImage: "/images/new/gameplay_grounds.png",
    icon: Shield,
  },
  battle: {
    title: "MARCHING TO BATTLE",
    subtitle: "Assembling your forces\u2026",
    bgImage: "/images/new/gameplay_volcano.png",
    icon: Swords,
  },
} as const;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

const EMBER_COUNT = 22;
const EMBERS = Array.from({ length: EMBER_COUNT }, (_, i) => ({
  id: i,
  x: round(seededRandom(i) * 100, 3),
  size: round(1 + seededRandom(i + 100) * 2.5, 3),
  duration: round(9 + seededRandom(i + 200) * 14, 3),
  delay: round(seededRandom(i + 300) * 10, 3),
  opacity: round(0.15 + seededRandom(i + 400) * 0.45, 4),
  variant: i % 4,
}));

function useAnimatedProgress(target: number): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      const diff = target - displayRef.current;
      const step = diff * 0.055 + (diff > 0 ? 0.002 : 0);
      displayRef.current = Math.min(
        target,
        displayRef.current + Math.max(step, 0),
      );
      setDisplay(displayRef.current);
      if (Math.abs(target - displayRef.current) > 0.001) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        displayRef.current = target;
        setDisplay(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return display;
}

function EmberField() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMBERS.map((e) => (
        <div
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: `${e.x}%`,
            bottom: "-4%",
            width: `${e.size}px`,
            height: `${e.size}px`,
            background: `radial-gradient(circle, rgba(255,180,50,${e.opacity}) 0%, rgba(255,120,20,${round(e.opacity * 0.4, 4)}) 60%, transparent 100%)`,
            boxShadow: `0 0 ${round(e.size * 2, 3)}px rgba(255,160,40,${round(e.opacity * 0.35, 4)})`,
            animation: `emberRise${e.variant} ${e.duration}s ${e.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function LogoShield({ isComplete }: { isComplete: boolean }) {
  const ringR = 56;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
      {/* Soft background glow */}
      <div
        className="absolute inset-[-20px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.1) 0%, rgba(180,140,60,0.04) 50%, transparent 75%)",
          animation: "pulseGlow 4s ease-in-out infinite",
        }}
      />

      {/* SVG ornamental ring */}
      <svg
        className="absolute"
        viewBox={`-${ringR + 4} -${ringR + 4} ${(ringR + 4) * 2} ${(ringR + 4) * 2}`}
        style={{
          width: 128,
          height: 128,
          animation: "slowSpin 40s linear infinite",
          filter: "drop-shadow(0 0 6px rgba(212,168,74,0.2))",
        }}
        fill="none"
      >
        {/* Outer ring */}
        <circle cx="0" cy="0" r={ringR} stroke="#b48c3c" strokeWidth="1" opacity="0.3" />
        {/* Inner ring */}
        <circle cx="0" cy="0" r={ringR - 5} stroke="#b48c3c" strokeWidth="0.5" opacity="0.15" />
        {/* Cardinal diamonds (N, E, S, W) */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = Math.cos(rad) * ringR;
          const cy = Math.sin(rad) * ringR;
          return (
            <g key={deg} transform={`translate(${cx},${cy}) rotate(${deg})`}>
              <path d="M0 -4 L2.5 0 L0 4 L-2.5 0 Z" fill="#d4a84a" opacity="0.7" />
              <path d="M0 -2.5 L1.5 0 L0 2.5 L-1.5 0 Z" fill="#f59e0b" opacity="0.5" />
            </g>
          );
        })}
        {/* Intercardinal small dots */}
        {[45, 135, 225, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = Math.cos(rad) * ringR;
          const cy = Math.sin(rad) * ringR;
          return <circle key={deg} cx={cx} cy={cy} r="1.5" fill="#d4a84a" opacity="0.45" />;
        })}
        {/* Tick marks every 30deg (excluding cardinals/intercardinals) */}
        {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = Math.cos(rad) * (ringR - 2);
          const y1 = Math.sin(rad) * (ringR - 2);
          const x2 = Math.cos(rad) * (ringR + 2);
          const y2 = Math.sin(rad) * (ringR + 2);
          return (
            <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b48c3c" strokeWidth="0.6" opacity="0.25" />
          );
        })}
      </svg>

      {/* Shield circle */}
      <div
        className="relative w-[88px] h-[88px] flex items-center justify-center rounded-full"
        style={{
          background:
            "linear-gradient(150deg, rgba(120,80,22,0.95) 0%, rgba(60,38,12,0.97) 50%, rgba(35,22,8,0.98) 100%)",
          border: "2.5px solid rgba(180,140,60,0.4)",
          boxShadow: isComplete
            ? "0 0 40px rgba(251,191,36,0.25), 0 0 80px rgba(251,191,36,0.08), inset 0 1px 0 rgba(255,220,100,0.12), inset 0 -2px 6px rgba(0,0,0,0.3)"
            : "0 0 25px rgba(180,140,60,0.12), inset 0 1px 0 rgba(255,220,100,0.08), inset 0 -2px 6px rgba(0,0,0,0.3)",
          transition: "box-shadow 1s ease-out",
        }}
      >
        {/* Inner border highlight */}
        <div
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(180,140,60,0.12)" }}
        />
        <Image
          src="/images/logos/princeton-td-logo.svg"
          alt="Princeton TD"
          width={52}
          height={52}
          priority
          style={{
            filter: "drop-shadow(0 0 10px rgba(251,191,36,0.4))",
          }}
        />
      </div>
    </div>
  );
}

function TitleOrnament({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: 18,
        height: 18,
        transform: flip ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 0 4px rgba(245,158,11,0.3))",
      }}
    >
      <path
        d="M4 12 L9 7 L12 10 L15 7 L20 12 L15 17 L12 14 L9 17 Z"
        fill="#f59e0b"
        opacity="0.7"
      />
      <path
        d="M6 12 L9 9 L12 12 L15 9 L18 12 L15 15 L12 12 L9 15 Z"
        fill="#d97706"
        opacity="0.5"
      />
      <path
        d="M12 8 L14 12 L12 16 L10 12 Z"
        fill="#fbbf24"
        opacity="0.9"
      />
    </svg>
  );
}

function GoldFlourish() {
  return (
    <svg
      viewBox="0 0 320 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ maxWidth: 300, height: 20 }}
    >
      {/* Left line */}
      <path d="M0 10 L120 10" stroke="#b48c3c" strokeWidth="1" opacity="0.55" />
      <path d="M15 7.5 L110 7.5" stroke="#b48c3c" strokeWidth="0.4" opacity="0.25" />
      <path d="M25 12.5 L105 12.5" stroke="#b48c3c" strokeWidth="0.3" opacity="0.18" />
      {/* Right line */}
      <path d="M200 10 L320 10" stroke="#b48c3c" strokeWidth="1" opacity="0.55" />
      <path d="M210 7.5 L305 7.5" stroke="#b48c3c" strokeWidth="0.4" opacity="0.25" />
      <path d="M215 12.5 L295 12.5" stroke="#b48c3c" strokeWidth="0.3" opacity="0.18" />
      {/* Center medallion */}
      <path d="M160 2 L168 10 L160 18 L152 10 Z" fill="#f59e0b" opacity="0.2" stroke="#f59e0b" strokeWidth="1" />
      <path d="M160 4.5 L165.5 10 L160 15.5 L154.5 10 Z" fill="none" stroke="#d4a84a" strokeWidth="0.7" opacity="0.6" />
      <circle cx="160" cy="10" r="2.8" fill="#f59e0b" opacity="0.85" />
      <circle cx="160" cy="10" r="1.4" fill="#b48c3c" opacity="0.5" />
      {/* Inner diamonds */}
      <path d="M135 10 L138 7.5 L141 10 L138 12.5 Z" fill="#f59e0b" opacity="0.5" />
      <path d="M179 10 L182 7.5 L185 10 L182 12.5 Z" fill="#f59e0b" opacity="0.5" />
      {/* Outer diamonds */}
      <path d="M125 10 L127 8.5 L129 10 L127 11.5 Z" fill="#d4a84a" opacity="0.35" />
      <path d="M191 10 L193 8.5 L195 10 L193 11.5 Z" fill="#d4a84a" opacity="0.35" />
      {/* Scroll curls */}
      <path d="M120 10 Q125 5 132 8" fill="none" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      <path d="M200 10 Q195 5 188 8" fill="none" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      <path d="M120 10 Q125 15 132 12" fill="none" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      <path d="M200 10 Q195 15 188 12" fill="none" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      {/* Dots along lines */}
      <circle cx="45" cy="10" r="1.2" fill="#d4a84a" opacity="0.45" />
      <circle cx="80" cy="10" r="0.9" fill="#d4a84a" opacity="0.35" />
      <circle cx="240" cy="10" r="0.9" fill="#d4a84a" opacity="0.35" />
      <circle cx="275" cy="10" r="1.2" fill="#d4a84a" opacity="0.45" />
      {/* Line end caps */}
      <path d="M0 10 L4 7 L8 10 L4 13 Z" fill="#b48c3c" opacity="0.3" />
      <path d="M312 10 L316 7 L320 10 L316 13 Z" fill="#b48c3c" opacity="0.3" />
    </svg>
  );
}

function ProgressBar({
  progress,
  isComplete,
}: {
  progress: number;
  isComplete: boolean;
}) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <div className="w-full max-w-sm relative">
      {/* Ornamental bar frame */}
      <div
        className="relative px-2 py-2.5 rounded-lg"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,20,10,0.6) 0%, rgba(22,14,8,0.5) 100%)",
          border: "1px solid rgba(180,140,60,0.15)",
          boxShadow:
            "inset 0 0 12px rgba(0,0,0,0.15), 0 0 8px rgba(180,140,60,0.04)",
        }}
      >
        {/* End cap ornaments */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px]"
          style={{ width: 6, height: 18 }}
        >
          <svg viewBox="0 0 6 18" fill="none" className="w-full h-full">
            <path d="M5 0 L0 4 L0 14 L5 18" stroke="#b48c3c" strokeWidth="1" opacity="0.5" fill="none" />
            <circle cx="2" cy="9" r="1.5" fill="#d4a84a" opacity="0.5" />
          </svg>
        </div>
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[1px]"
          style={{ width: 6, height: 18 }}
        >
          <svg viewBox="0 0 6 18" fill="none" className="w-full h-full">
            <path d="M1 0 L6 4 L6 14 L1 18" stroke="#b48c3c" strokeWidth="1" opacity="0.5" fill="none" />
            <circle cx="4" cy="9" r="1.5" fill="#d4a84a" opacity="0.5" />
          </svg>
        </div>

        {/* The actual bar */}
        <div
          className="h-[18px] rounded-md overflow-hidden relative"
          style={{
            background: "rgba(10,6,3,0.95)",
            border: isComplete
              ? "1px solid rgba(251,191,36,0.5)"
              : "1px solid rgba(180,140,60,0.25)",
            boxShadow: isComplete
              ? "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 14px rgba(251,191,36,0.1)"
              : "inset 0 2px 6px rgba(0,0,0,0.6)",
            transition: "border-color 0.6s, box-shadow 0.6s",
          }}
        >
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute top-[2px] bottom-[2px] w-px z-10 pointer-events-none"
              style={{
                left: `${mark}%`,
                background:
                  pct >= mark
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.025)",
              }}
            />
          ))}

          <div
            className="h-full rounded-[5px] relative overflow-hidden"
            style={{
              width: `${pct}%`,
              background: isComplete
                ? "linear-gradient(90deg, rgba(190,140,25,1), rgba(245,185,35,1), rgba(255,210,60,1), rgba(245,185,35,1), rgba(190,140,25,1))"
                : "linear-gradient(90deg, rgba(120,78,12,0.95), rgba(185,135,25,1), rgba(200,155,35,1), rgba(185,135,25,1), rgba(120,78,12,0.95))",
              boxShadow: isComplete
                ? "0 0 20px rgba(251,191,36,0.5), inset 0 -1px 2px rgba(0,0,0,0.2)"
                : "0 0 10px rgba(220,170,40,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)",
              transition: "background 0.5s, box-shadow 0.5s",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                animation: "loadingShimmer 2s ease-in-out infinite",
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-[40%]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
                borderRadius: "inherit",
              }}
            />
          </div>

          <div
            className="absolute inset-[1px] rounded-[5px] pointer-events-none"
            style={{ border: "1px solid rgba(180,140,60,0.04)" }}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.25em] transition-colors duration-500"
          style={{
            color: isComplete
              ? "rgba(252,211,77,0.9)"
              : "rgba(180,140,60,0.5)",
            textShadow: isComplete
              ? "0 0 12px rgba(251,191,36,0.3)"
              : "none",
          }}
        >
          {isComplete ? "Ready" : "Loading"}
        </span>
        <span
          className="text-[12px] font-bold tabular-nums transition-colors duration-500"
          style={{
            color: isComplete
              ? "rgba(252,211,77,1)"
              : "rgba(252,211,77,0.7)",
            textShadow: isComplete
              ? "0 0 10px rgba(251,191,36,0.3)"
              : "none",
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

function TipDisplay({ context }: { context: "worldmap" | "battle" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * LOADING_TIPS.length));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const swapTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % LOADING_TIPS.length);
        setVisible(true);
      }, 400);
      return () => clearTimeout(swapTimer);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const IconComponent = CONTEXT_CONFIG[context].icon;

  return (
    <OrnateFrame
      className="max-w-sm w-full rounded-xl"
      cornerVariant="compact"
      cornerSize={22}
      borderVariant="compact"
      showSideBorders={false}
      color="#8a6e30"
      glowColor="#b48c3c"
    >
      <div
        className="w-full text-center px-6 py-4 rounded-xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(38,26,12,0.7) 0%, rgba(28,18,8,0.6) 100%)",
          border: "1px solid rgba(140,108,40,0.15)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Inner glow along top edge */}
        <div
          className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,168,74,0.25), transparent)",
          }}
        />
        <div className="flex items-center justify-center gap-2.5 mb-2.5">
          <div
            className="w-4 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(180,140,60,0.4))",
            }}
          />
          <IconComponent
            size={12}
            className="text-amber-500/40"
            strokeWidth={1.5}
          />
          <span className="text-[9px] font-bold text-amber-400/50 uppercase tracking-[0.25em]">
            Tip
          </span>
          <IconComponent
            size={12}
            className="text-amber-500/40"
            strokeWidth={1.5}
          />
          <div
            className="w-4 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(180,140,60,0.4), transparent)",
            }}
          />
        </div>
        <p
          className="text-[12px] text-amber-200/60 leading-relaxed italic"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.35s ease-in-out",
          }}
        >
          &ldquo;{LOADING_TIPS[currentIndex]}&rdquo;
        </p>
      </div>
    </OrnateFrame>
  );
}

function LoreQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * LOADING_LORE.length));
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 max-w-xs">
      <div
        className="w-12 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,140,60,0.2), transparent)",
        }}
      />
      <p className="text-[10px] text-amber-300/30 italic text-center leading-relaxed">
        {LOADING_LORE[quoteIndex]}
      </p>
    </div>
  );
}

export function LoadingScreen({
  progress,
  loaded,
  total,
  context,
  levelName,
}: LoadingScreenProps) {
  const config = CONTEXT_CONFIG[context];
  const animatedProgress = useAnimatedProgress(progress);
  const isComplete = progress >= 1;
  const [stageVisible, setStageVisible] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    const delays = [80, 320, 560, 820, 1100];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setStageVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <OrnateFrame
      className="fixed inset-0 h-screen z-[9999]"
      cornerSize={52}
      cornerVariant="standard"
      borderVariant="standard"
      sideBorderVariant="standard"
      topBottomBorderVariant="standard"
      borderScale={1.1}
      color="#b48c3c"
      glowColor="#d4a84a"
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ background: "rgb(18,11,6)" }}
      >
        {/* Background image - prominent, warm, with depth */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-[-8%]"
            style={{
              width: "116%",
              height: "116%",
              animation: "kenBurns 28s ease-in-out infinite alternate",
            }}
          >
            <Image
              src={config.bgImage}
              alt=""
              fill
              priority
              sizes="120vw"
              className="object-cover"
              style={{ opacity: 0.32, filter: "blur(1.5px) saturate(0.7)" }}
            />
          </div>
          {/* Warm color wash over image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(80,45,12,0.25) 0%, rgba(40,20,5,0.15) 40%, rgba(18,11,6,0.3) 100%)",
              mixBlendMode: "multiply",
            }}
          />
          {/* Radial vignette - softer to show more bg */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at center 42%, transparent 0%, rgba(18,11,6,0.45) 40%, rgba(18,11,6,0.92) 75%)",
            }}
          />
          {/* Bottom gradient for readability */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2/5"
            style={{
              background:
                "linear-gradient(to top, rgba(18,11,6,0.98) 0%, rgba(18,11,6,0.6) 50%, transparent 100%)",
            }}
          />
          {/* Top gradient for readability */}
          <div
            className="absolute top-0 left-0 right-0 h-1/5"
            style={{
              background:
                "linear-gradient(to bottom, rgba(18,11,6,0.7) 0%, transparent 100%)",
            }}
          />
        </div>

        <EmberField />

        {/* Center content: logo + title + tip + lore */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 w-full max-w-md">
          {/* Logo */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: stageVisible[0] ? 1 : 0,
              transform: stageVisible[0] ? "translateY(0)" : "translateY(14px)",
            }}
          >
            <LogoShield isComplete={isComplete} />
          </div>

          {/* Title */}
          <div
            className="flex flex-col items-center gap-1.5 transition-all duration-700 ease-out"
            style={{
              opacity: stageVisible[1] ? 1 : 0,
              transform: stageVisible[1] ? "translateY(0)" : "translateY(14px)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <TitleOrnament />
              <h1
                className="text-lg sm:text-xl font-bold tracking-[0.25em] uppercase"
                style={{
                  color: "rgb(252,211,77)",
                  textShadow:
                    "0 0 30px rgba(251,191,36,0.35), 0 2px 4px rgba(0,0,0,0.6)",
                }}
              >
                {context === "battle" && levelName ? levelName : config.title}
              </h1>
              <TitleOrnament flip />
            </div>
            <p className="text-[11px] text-amber-400/50 font-medium tracking-wider mt-0.5">
              {config.subtitle}
            </p>
            {/* Decorative flourish divider */}
            <div className="w-full flex justify-center mt-2.5 mb-1">
              <GoldFlourish />
            </div>
          </div>

          {/* Tip */}
          <div
            className="w-full flex justify-center transition-all duration-700 ease-out"
            style={{
              opacity: stageVisible[3] ? 1 : 0,
              transform: stageVisible[3] ? "translateY(0)" : "translateY(14px)",
            }}
          >
            <TipDisplay context={context} />
          </div>

          {/* Lore */}
          <div
            className="transition-all duration-700 ease-out mt-1"
            style={{
              opacity: stageVisible[4] ? 1 : 0,
              transform: stageVisible[4] ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <LoreQuote />
          </div>
        </div>

        {/* Bottom-anchored progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center px-6 pb-10 transition-all duration-700 ease-out"
          style={{
            opacity: stageVisible[2] ? 1 : 0,
            transform: stageVisible[2] ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <div className="w-full max-w-lg">
            <ProgressBar progress={animatedProgress} isComplete={isComplete} />
            <p className="text-[9px] text-amber-600/25 font-mono tabular-nums mt-1 tracking-wider text-center">
              {loaded} / {total} assets
            </p>
          </div>
        </div>

        {/* CSS animations */}
        <style jsx>{`
          @keyframes loadingShimmer {
            0% {
              transform: translateX(-150%);
            }
            100% {
              transform: translateX(250%);
            }
          }
          @keyframes emberRise0 {
            0% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0;
            }
            6% {
              opacity: 1;
            }
            50% {
              transform: translateY(-55vh) translateX(18px) scale(0.6);
            }
            100% {
              transform: translateY(-112vh) translateX(-8px) scale(0.15);
              opacity: 0;
            }
          }
          @keyframes emberRise1 {
            0% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0;
            }
            6% {
              opacity: 1;
            }
            50% {
              transform: translateY(-55vh) translateX(-22px) scale(0.65);
            }
            100% {
              transform: translateY(-112vh) translateX(12px) scale(0.2);
              opacity: 0;
            }
          }
          @keyframes emberRise2 {
            0% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0;
            }
            6% {
              opacity: 1;
            }
            50% {
              transform: translateY(-55vh) translateX(30px) scale(0.55);
            }
            100% {
              transform: translateY(-112vh) translateX(5px) scale(0.1);
              opacity: 0;
            }
          }
          @keyframes emberRise3 {
            0% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0;
            }
            6% {
              opacity: 1;
            }
            50% {
              transform: translateY(-55vh) translateX(-14px) scale(0.7);
            }
            100% {
              transform: translateY(-112vh) translateX(-22px) scale(0.15);
              opacity: 0;
            }
          }
          @keyframes pulseGlow {
            0%,
            100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.12);
              opacity: 0.55;
            }
          }
          @keyframes slowSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes kenBurns {
            0% {
              transform: scale(1) translate(0, 0);
            }
            100% {
              transform: scale(1.06) translate(-0.8%, -0.6%);
            }
          }
        `}</style>
      </div>
    </OrnateFrame>
  );
}

/**
 * Overlays children (typically a LoadingScreen) on top of content.
 * When `visible` transitions to false, fades out over `fadeDurationMs`
 * then unmounts entirely so it no longer blocks interaction.
 */
export function LoadingOverlay({
  visible,
  children,
  fadeDurationMs = 600,
}: {
  visible: boolean;
  children: React.ReactNode;
  fadeDurationMs?: number;
}) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), fadeDurationMs);
      return () => clearTimeout(t);
    }
  }, [visible, fadeDurationMs]);

  if (!mounted) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeDurationMs}ms ease-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
