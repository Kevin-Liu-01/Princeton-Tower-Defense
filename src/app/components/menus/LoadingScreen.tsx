"use client";
import { ChevronLeft, MapPin, Shield, Star, Swords } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

import { LEVEL_DATA } from "../../constants";
import {
  LOADING_TIPS,
  LOADING_LORE,
  DEFAULT_LOADING_THEME,
} from "../../constants/loadingAssets";
import type { LoadingTheme } from "../../constants/loadingAssets";
import type { RegionType } from "../../sprites";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";
import { WORLD_LEVELS } from "./world-map/worldMapData";

const REGION_LABEL: Record<string, string> = {
  desert: "Sahara Sands",
  grassland: "Princeton Grounds",
  swamp: "Murky Marshes",
  volcanic: "Volcanic Depths",
  winter: "Frozen Frontier",
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const DIFFICULTY_COLOR: Record<number, string> = {
  1: "rgba(80,200,120,0.85)",
  2: "rgba(240,180,40,0.85)",
  3: "rgba(220,80,60,0.85)",
};

interface LoadingScreenProps {
  progress: number;
  loaded: number;
  total: number;
  context: "worldmap" | "battle";
  levelName?: string;
  levelId?: string;
  theme?: LoadingTheme;
  onBack?: () => void;
}

const CONTEXT_TITLES: Record<string, string> = {
  battle: "MARCHING TO BATTLE",
  worldmap: "PREPARING THE KINGDOM",
};

const CONTEXT_ICONS: Record<string, typeof Shield> = {
  battle: Swords,
  worldmap: Shield,
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49_297) * 233_280;
  return x - Math.floor(x);
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

const EMBER_COUNT = 22;
const EMBERS = Array.from({ length: EMBER_COUNT }, (_, i) => ({
  delay: round(seededRandom(i + 300) * 10, 3),
  duration: round(9 + seededRandom(i + 200) * 14, 3),
  id: i,
  opacity: round(0.15 + seededRandom(i + 400) * 0.45, 4),
  size: round(1 + seededRandom(i + 100) * 2.5, 3),
  variant: i % 4,
  x: round(seededRandom(i) * 100, 3),
}));

function useAnimatedProgress(target: number): number {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) {
        return;
      }
      const diff = target - displayRef.current;
      const step = diff * 0.08 + (diff > 0 ? 0.003 : 0);
      displayRef.current = Math.min(
        target,
        displayRef.current + Math.max(step, 0)
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

function EmberField({ theme }: { theme: LoadingTheme }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMBERS.map((e) => {
        const color = theme.emberColors[e.variant];
        return (
          <div
            key={e.id}
            className="absolute rounded-full"
            style={{
              animation: `emberRise${e.variant} ${e.duration}s ${e.delay}s linear infinite`,
              background: `radial-gradient(circle, rgba(${theme.accentRgb},${e.opacity}) 0%, ${color}${Math.round(
                e.opacity * 0.4 * 255
              )
                .toString(16)
                .padStart(2, "0")} 60%, transparent 100%)`,
              bottom: "-4%",
              boxShadow: `0 0 ${round(e.size * 2, 3)}px rgba(${theme.accentRgb},${round(e.opacity * 0.35, 4)})`,
              height: `${e.size}px`,
              left: `${e.x}%`,
              width: `${e.size}px`,
            }}
          />
        );
      })}
    </div>
  );
}

const RING_R = 56;

interface RingMark {
  deg: number;
  cx: string;
  cy: string;
}
interface RingTick {
  deg: number;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

function ringPoint(deg: number, r: number): { x: string; y: string } {
  const rad = (deg * Math.PI) / 180;
  return {
    x: (Math.cos(rad) * r).toFixed(2),
    y: (Math.sin(rad) * r).toFixed(2),
  };
}

const CARDINAL_MARKS: RingMark[] = [0, 90, 180, 270].map((deg) => {
  const p = ringPoint(deg, RING_R);
  return { cx: p.x, cy: p.y, deg };
});

const INTERCARDINAL_MARKS: RingMark[] = [45, 135, 225, 315].map((deg) => {
  const p = ringPoint(deg, RING_R);
  return { cx: p.x, cy: p.y, deg };
});

const TICK_MARKS: RingTick[] = [30, 60, 120, 150, 210, 240, 300, 330].map(
  (deg) => {
    const inner = ringPoint(deg, RING_R - 2);
    const outer = ringPoint(deg, RING_R + 2);
    return { deg, x1: inner.x, x2: outer.x, y1: inner.y, y2: outer.y };
  }
);

function LogoShield({
  isComplete,
  theme,
}: {
  isComplete: boolean;
  theme: LoadingTheme;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: 128, width: 128 }}
    >
      <div
        className="absolute inset-[-20px] rounded-full"
        style={{
          animation: "pulseGlow 4s ease-in-out infinite",
          background: `radial-gradient(circle, rgba(${theme.accentRgb},0.1) 0%, rgba(${theme.accentDarkRgb},0.04) 50%, transparent 75%)`,
        }}
      />

      <svg
        className="absolute"
        viewBox="-60 -60 120 120"
        style={{
          animation: "slowSpin 40s linear infinite",
          filter: `drop-shadow(0 0 6px rgba(${theme.accentRgb},0.2))`,
          height: 128,
          width: 128,
        }}
        fill="none"
      >
        <circle
          cx="0"
          cy="0"
          r={RING_R}
          stroke={theme.accentDark}
          strokeWidth="1"
          opacity="0.3"
        />
        <circle
          cx="0"
          cy="0"
          r={RING_R - 5}
          stroke={theme.accentDark}
          strokeWidth="0.5"
          opacity="0.15"
        />
        {CARDINAL_MARKS.map((m) => (
          <g
            key={m.deg}
            transform={`translate(${m.cx},${m.cy}) rotate(${m.deg})`}
          >
            <path
              d="M0 -4 L2.5 0 L0 4 L-2.5 0 Z"
              fill={theme.accent}
              opacity="0.7"
            />
            <path
              d="M0 -2.5 L1.5 0 L0 2.5 L-1.5 0 Z"
              fill={theme.frameGlow}
              opacity="0.5"
            />
          </g>
        ))}
        {INTERCARDINAL_MARKS.map((m) => (
          <circle
            key={m.deg}
            cx={m.cx}
            cy={m.cy}
            r="1.5"
            fill={theme.accent}
            opacity="0.45"
          />
        ))}
        {TICK_MARKS.map((m) => (
          <line
            key={m.deg}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            stroke={theme.accentDark}
            strokeWidth="0.6"
            opacity="0.25"
          />
        ))}
      </svg>

      <div
        className="relative w-[88px] h-[88px] flex items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(150deg, rgba(${theme.accentDarkRgb},0.55) 0%, rgba(${theme.bgRgb},0.92) 50%, rgba(${theme.bgRgb},0.98) 100%)`,
          border: `2.5px solid rgba(${theme.accentDarkRgb},0.4)`,
          boxShadow: isComplete
            ? `0 0 40px rgba(${theme.accentRgb},0.25), 0 0 80px rgba(${theme.accentRgb},0.08), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.3)`
            : `0 0 25px rgba(${theme.accentDarkRgb},0.12), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 6px rgba(0,0,0,0.3)`,
          transition: "box-shadow 1s ease-out",
        }}
      >
        <div
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{ border: `1px solid rgba(${theme.accentDarkRgb},0.12)` }}
        />
        <Image
          src="/images/logos/princeton-td-logo.svg"
          alt="Princeton TD"
          width={52}
          height={52}
          priority
          style={{
            filter: `drop-shadow(0 0 10px rgba(${theme.accentRgb},0.4))`,
          }}
        />
      </div>
    </div>
  );
}

function TitleOrnament({
  flip,
  theme,
}: {
  flip?: boolean;
  theme: LoadingTheme;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: `drop-shadow(0 0 4px rgba(${theme.accentRgb},0.3))`,
        height: 18,
        transform: flip ? "scaleX(-1)" : undefined,
        width: 18,
      }}
    >
      <path
        d="M4 12 L9 7 L12 10 L15 7 L20 12 L15 17 L12 14 L9 17 Z"
        fill={theme.accent}
        opacity="0.7"
      />
      <path
        d="M6 12 L9 9 L12 12 L15 9 L18 12 L15 15 L12 12 L9 15 Z"
        fill={theme.accentDark}
        opacity="0.5"
      />
      <path
        d="M12 8 L14 12 L12 16 L10 12 Z"
        fill={theme.frameGlow}
        opacity="0.9"
      />
    </svg>
  );
}

function AccentFlourish({ theme }: { theme: LoadingTheme }) {
  return (
    <svg
      viewBox="0 0 320 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ height: 20, maxWidth: 300 }}
    >
      <path
        d="M0 10 L120 10"
        stroke={theme.accentDark}
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M15 7.5 L110 7.5"
        stroke={theme.accentDark}
        strokeWidth="0.4"
        opacity="0.25"
      />
      <path
        d="M25 12.5 L105 12.5"
        stroke={theme.accentDark}
        strokeWidth="0.3"
        opacity="0.18"
      />
      <path
        d="M200 10 L320 10"
        stroke={theme.accentDark}
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M210 7.5 L305 7.5"
        stroke={theme.accentDark}
        strokeWidth="0.4"
        opacity="0.25"
      />
      <path
        d="M215 12.5 L295 12.5"
        stroke={theme.accentDark}
        strokeWidth="0.3"
        opacity="0.18"
      />
      <path
        d="M160 2 L168 10 L160 18 L152 10 Z"
        fill={theme.accent}
        opacity="0.2"
        stroke={theme.accent}
        strokeWidth="1"
      />
      <path
        d="M160 4.5 L165.5 10 L160 15.5 L154.5 10 Z"
        fill="none"
        stroke={theme.frameGlow}
        strokeWidth="0.7"
        opacity="0.6"
      />
      <circle cx="160" cy="10" r="2.8" fill={theme.accent} opacity="0.85" />
      <circle cx="160" cy="10" r="1.4" fill={theme.accentDark} opacity="0.5" />
      <path
        d="M135 10 L138 7.5 L141 10 L138 12.5 Z"
        fill={theme.accent}
        opacity="0.5"
      />
      <path
        d="M179 10 L182 7.5 L185 10 L182 12.5 Z"
        fill={theme.accent}
        opacity="0.5"
      />
      <path
        d="M125 10 L127 8.5 L129 10 L127 11.5 Z"
        fill={theme.frameGlow}
        opacity="0.35"
      />
      <path
        d="M191 10 L193 8.5 L195 10 L193 11.5 Z"
        fill={theme.frameGlow}
        opacity="0.35"
      />
      <path
        d="M120 10 Q125 5 132 8"
        fill="none"
        stroke={theme.frameGlow}
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M200 10 Q195 5 188 8"
        fill="none"
        stroke={theme.frameGlow}
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M120 10 Q125 15 132 12"
        fill="none"
        stroke={theme.frameGlow}
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M200 10 Q195 15 188 12"
        fill="none"
        stroke={theme.frameGlow}
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      <circle cx="45" cy="10" r="1.2" fill={theme.frameGlow} opacity="0.45" />
      <circle cx="80" cy="10" r="0.9" fill={theme.frameGlow} opacity="0.35" />
      <circle cx="240" cy="10" r="0.9" fill={theme.frameGlow} opacity="0.35" />
      <circle cx="275" cy="10" r="1.2" fill={theme.frameGlow} opacity="0.45" />
      <path
        d="M0 10 L4 7 L8 10 L4 13 Z"
        fill={theme.accentDark}
        opacity="0.3"
      />
      <path
        d="M312 10 L316 7 L320 10 L316 13 Z"
        fill={theme.accentDark}
        opacity="0.3"
      />
    </svg>
  );
}

function ProgressBar({
  progress,
  isComplete,
  theme,
}: {
  progress: number;
  isComplete: boolean;
  theme: LoadingTheme;
}) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <div className="w-full relative">
      <div
        className="relative"
        style={{
          background: `linear-gradient(180deg, rgba(${theme.bgRgb},0.6) 0%, rgba(${theme.bgRgb},0.5) 100%)`,
          borderTop: `1px solid rgba(${theme.accentDarkRgb},0.25)`,
          boxShadow: `0 -4px 16px rgba(0,0,0,0.3), 0 -1px 8px rgba(${theme.accentDarkRgb},0.06)`,
        }}
      >
        <div
          className="h-[14px] overflow-hidden relative"
          style={{
            background: `rgba(${theme.bgRgb},0.95)`,
            boxShadow: isComplete
              ? `inset 0 2px 6px rgba(0,0,0,0.6), 0 0 14px rgba(${theme.accentRgb},0.1)`
              : "inset 0 2px 6px rgba(0,0,0,0.6)",
            transition: "box-shadow 0.6s",
          }}
        >
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute top-[2px] bottom-[2px] w-px z-10 pointer-events-none"
              style={{
                background:
                  pct >= mark
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.025)",
                left: `${mark}%`,
              }}
            />
          ))}

          <div
            className="h-full relative overflow-hidden"
            style={{
              background: isComplete
                ? theme.barGradientComplete
                : theme.barGradient,
              boxShadow: isComplete
                ? `0 0 20px rgba(${theme.accentRgb},0.5), inset 0 -1px 2px rgba(0,0,0,0.2)`
                : `0 0 10px rgba(${theme.accentRgb},0.3), inset 0 -1px 2px rgba(0,0,0,0.2)`,
              transition: "background 0.5s, box-shadow 0.5s",
              width: `${pct}%`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                animation: "loadingShimmer 2s ease-in-out infinite",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
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
            className="absolute inset-[1px] pointer-events-none"
            style={{ border: `1px solid rgba(${theme.accentDarkRgb},0.04)` }}
          />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-[10px] font-bold tabular-nums transition-colors duration-500"
          style={{
            color: isComplete
              ? `rgba(${theme.accentRgb},1)`
              : `rgba(${theme.accentRgb},0.7)`,
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {isComplete ? "Ready" : `${Math.round(pct)}%`}
        </span>
      </div>
    </div>
  );
}

function TipDisplay({
  context,
  theme,
}: {
  context: "worldmap" | "battle";
  theme: LoadingTheme;
}) {
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

  const IconComponent = CONTEXT_ICONS[context] ?? Shield;

  return (
    <OrnateFrame
      className="max-w-sm w-full rounded-xl"
      cornerVariant="compact"
      cornerSize={22}
      borderVariant="compact"
      showSideBorders={false}
      color={theme.accentDark}
      glowColor={theme.frameColor}
    >
      <div
        className="w-full text-center px-6 py-4 rounded-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(${theme.bgRgb},0.7) 0%, rgba(${theme.bgRgb},0.6) 100%)`,
          border: `1px solid rgba(${theme.accentDarkRgb},0.15)`,
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${theme.accentRgb},0.25), transparent)`,
          }}
        />
        <div className="flex items-center justify-center gap-2.5 mb-2.5">
          <div
            className="w-4 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(${theme.accentDarkRgb},0.4))`,
            }}
          />
          <IconComponent
            size={12}
            style={{ color: `rgba(${theme.accentRgb},0.4)` }}
            strokeWidth={1.5}
          />
          <span
            className="text-[9px] font-bold uppercase tracking-[0.25em]"
            style={{ color: `rgba(${theme.accentRgb},0.5)` }}
          >
            Tip
          </span>
          <IconComponent
            size={12}
            style={{ color: `rgba(${theme.accentRgb},0.4)` }}
            strokeWidth={1.5}
          />
          <div
            className="w-4 h-px"
            style={{
              background: `linear-gradient(90deg, rgba(${theme.accentDarkRgb},0.4), transparent)`,
            }}
          />
        </div>
        <p
          className="text-[12px] leading-relaxed italic"
          style={{
            color: `rgba(${theme.accentRgb},0.6)`,
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

function LoreQuote({ theme }: { theme: LoadingTheme }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * LOADING_LORE.length));
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 max-w-xs">
      <div
        className="w-12 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${theme.accentDarkRgb},0.2), transparent)`,
        }}
      />
      <p
        className="text-[10px] italic text-center leading-relaxed"
        style={{ color: `rgba(${theme.accentRgb},0.3)` }}
      >
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
  levelId,
  theme: themeProp,
  onBack,
}: LoadingScreenProps) {
  const theme = themeProp ?? DEFAULT_LOADING_THEME;
  const animatedProgress = useAnimatedProgress(progress);
  const isComplete = progress >= 1;

  const levelMeta = useLevelMeta(levelId);
  const isBattle = context === "battle" && !!levelMeta;

  const title = isBattle
    ? levelMeta.name
    : context === "battle" && levelName
      ? levelName
      : (CONTEXT_TITLES[context] ?? "LOADING");
  const { subtitle } = theme;
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
      }, delay)
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
      color={theme.frameColor}
      glowColor={theme.frameGlow}
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center overflow-y-auto"
        style={{ background: theme.bg }}
      >
        <BattleBackground theme={theme} />

        <EmberField theme={theme} />

        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
            style={{
              background: `linear-gradient(135deg, rgba(${theme.bgRgb},0.85) 0%, rgba(${theme.bgRgb},0.7) 100%)`,
              border: `1px solid rgba(${theme.accentDarkRgb},0.3)`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            <ChevronLeft
              size={16}
              style={{ color: `rgba(${theme.accentRgb},0.7)` }}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: `rgba(${theme.accentRgb},0.6)` }}
            >
              Back
            </span>
          </button>
        )}

        {isBattle ? (
          <BattleLevelContent
            meta={levelMeta}
            title={title}
            isComplete={isComplete}
            theme={theme}
            stageVisible={stageVisible}
          />
        ) : (
          <WorldMapLoadingContent
            title={title}
            subtitle={subtitle}
            theme={theme}
            context={context}
            isComplete={isComplete}
            stageVisible={stageVisible}
          />
        )}

        <div
          className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-700 ease-out"
          style={{
            opacity: stageVisible[2] ? 1 : 0,
            transform: stageVisible[2] ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <ProgressBar
            progress={animatedProgress}
            isComplete={isComplete}
            theme={theme}
          />
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

// ─── Level metadata hook ──────────────────────────────────────────────────────

interface LevelMeta {
  name: string;
  region: RegionType;
  regionLabel: string;
  difficulty: 1 | 2 | 3;
  difficultyLabel: string;
  difficultyColor: string;
  description: string;
  tags: string[];
  kind: string;
  previewImage?: string;
}

function useLevelMeta(levelId?: string): LevelMeta | null {
  if (!levelId) {
    return null;
  }
  const levelData = LEVEL_DATA[levelId];
  const worldLevel = WORLD_LEVELS.find((l) => l.id === levelId);
  if (!levelData && !worldLevel) {
    return null;
  }

  const name = levelData?.name ?? worldLevel?.name ?? levelId;
  const region = (worldLevel?.region ??
    levelData?.region ??
    "grassland") as RegionType;
  const difficulty = (worldLevel?.difficulty ?? levelData?.difficulty ?? 1) as
    | 1
    | 2
    | 3;
  const description =
    worldLevel?.description?.replaceAll("\n", " ") ??
    levelData?.description ??
    "";
  const tags = worldLevel?.tags ?? [];
  const kind = worldLevel?.kind ?? "campaign";

  return {
    description,
    difficulty,
    difficultyColor: DIFFICULTY_COLOR[difficulty],
    difficultyLabel: DIFFICULTY_LABEL[difficulty],
    kind,
    name,
    previewImage: levelData?.previewImage,
    region,
    regionLabel: REGION_LABEL[region] ?? region,
    tags,
  };
}

// ─── Battle-context level content ─────────────────────────────────────────────

function BattleLevelContent({
  meta,
  title,
  isComplete,
  theme,
  stageVisible,
}: {
  meta: LevelMeta;
  title: string;
  isComplete: boolean;
  theme: LoadingTheme;
  stageVisible: boolean[];
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-5 px-6 w-full max-w-lg">
      {/* Logo + Level name + subtitle */}
      <div
        className="flex flex-col items-center gap-2 transition-all duration-700 ease-out"
        style={{
          opacity: stageVisible[0] ? 1 : 0,
          transform: stageVisible[0] ? "translateY(0)" : "translateY(14px)",
        }}
      >
        <LogoShield isComplete={isComplete} theme={theme} />
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-center"
          style={{
            color: theme.accent,
            textShadow: `0 0 30px rgba(${theme.accentRgb},0.35), 0 2px 4px rgba(0,0,0,0.6)`,
          }}
        >
          {title}
        </h1>
        <div className="flex items-center gap-3 mt-0.5">
          <span
            className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: `rgba(${theme.accentRgb},0.55)` }}
          >
            <MapPin size={12} />
            {meta.regionLabel}
          </span>
          <span
            className="w-px h-3"
            style={{ background: `rgba(${theme.accentRgb},0.2)` }}
          />
          <span
            className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: meta.difficultyColor }}
          >
            <Star size={12} />
            {meta.difficultyLabel}
          </span>
          {meta.kind === "challenge" && (
            <>
              <span
                className="w-px h-3"
                style={{ background: `rgba(${theme.accentRgb},0.2)` }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(196,64,88,0.85)" }}
              >
                Challenge
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preview image */}
      {meta.previewImage && (
        <div
          className="w-full max-w-sm transition-all duration-700 ease-out"
          style={{
            opacity: stageVisible[1] ? 1 : 0,
            transform: stageVisible[1]
              ? "translateY(0) scale(1)"
              : "translateY(10px) scale(0.97)",
          }}
        >
          <OrnateFrame
            className="rounded-lg"
            cornerSize={28}
            cornerVariant="standard"
            borderVariant="standard"
            color={theme.frameColor}
            glowColor={theme.frameGlow}
          >
            <div
              className="aspect-video relative overflow-hidden rounded-sm"
              style={{
                boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(${theme.accentRgb},0.08)`,
              }}
            >
              <Image
                src={meta.previewImage}
                alt={`${meta.name} preview`}
                fill
                sizes="(max-width: 640px) 90vw, 400px"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 60%, rgba(${theme.bgRgb},0.4) 100%)`,
                }}
              />
            </div>
          </OrnateFrame>
        </div>
      )}

      {/* Description + tags */}
      <div
        className="flex flex-col items-center gap-2 transition-all duration-700 ease-out"
        style={{
          opacity: stageVisible[3] ? 1 : 0,
          transform: stageVisible[3] ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <p
          className="text-center text-sm leading-relaxed max-w-xs"
          style={{ color: `rgba(${theme.accentRgb},0.5)` }}
        >
          {meta.description}
        </p>
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: `rgba(${theme.accentDarkRgb},0.15)`,
                  border: `1px solid rgba(${theme.accentDarkRgb},0.2)`,
                  color: `rgba(${theme.accentRgb},0.5)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Loading tip */}
      <div
        className="w-full flex justify-center transition-all duration-700 ease-out"
        style={{
          opacity: stageVisible[4] ? 1 : 0,
          transform: stageVisible[4] ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <TipDisplay context="battle" theme={theme} />
      </div>
    </div>
  );
}

// ─── World-map loading content (generic) ──────────────────────────────────────

function WorldMapLoadingContent({
  title,
  subtitle,
  theme,
  context,
  isComplete,
  stageVisible,
}: {
  title: string;
  subtitle: string;
  theme: LoadingTheme;
  context: "worldmap" | "battle";
  isComplete: boolean;
  stageVisible: boolean[];
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 px-6 w-full max-w-md">
      <div
        className="transition-all duration-700 ease-out"
        style={{
          opacity: stageVisible[0] ? 1 : 0,
          transform: stageVisible[0] ? "translateY(0)" : "translateY(14px)",
        }}
      >
        <LogoShield isComplete={isComplete} theme={theme} />
      </div>

      <div
        className="flex flex-col items-center gap-1.5 transition-all duration-700 ease-out"
        style={{
          opacity: stageVisible[1] ? 1 : 0,
          transform: stageVisible[1] ? "translateY(0)" : "translateY(14px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <TitleOrnament theme={theme} />
          <h1
            className="text-lg sm:text-xl font-bold tracking-[0.25em] uppercase"
            style={{
              color: theme.accent,
              textShadow: `0 0 30px rgba(${theme.accentRgb},0.35), 0 2px 4px rgba(0,0,0,0.6)`,
            }}
          >
            {title}
          </h1>
          <TitleOrnament flip theme={theme} />
        </div>
        <p
          className="text-[11px] font-medium tracking-wider mt-0.5"
          style={{ color: `rgba(${theme.accentRgb},0.5)` }}
        >
          {subtitle}
        </p>
        <div className="w-full flex justify-center mt-2.5 mb-1">
          <AccentFlourish theme={theme} />
        </div>
      </div>

      <div
        className="w-full flex justify-center transition-all duration-700 ease-out"
        style={{
          opacity: stageVisible[3] ? 1 : 0,
          transform: stageVisible[3] ? "translateY(0)" : "translateY(14px)",
        }}
      >
        <TipDisplay context={context} theme={theme} />
      </div>

      <div
        className="transition-all duration-700 ease-out mt-1"
        style={{
          opacity: stageVisible[4] ? 1 : 0,
          transform: stageVisible[4] ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <LoreQuote theme={theme} />
      </div>
    </div>
  );
}

// ─── Background layer (level-aware) ──────────────────────────────────────────

function BattleBackground({ theme }: { theme: LoadingTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-[-8%]"
        style={{
          animation: "kenBurns 28s ease-in-out infinite alternate",
          height: "116%",
          width: "116%",
        }}
      >
        <Image
          src={theme.bgImage}
          alt=""
          fill
          priority
          sizes="120vw"
          className="object-cover"
          style={{ filter: "blur(1.5px) saturate(0.7)", opacity: 0.32 }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${theme.washRgb},0.25) 0%, rgba(${theme.washRgb},0.15) 40%, rgba(${theme.bgRgb},0.3) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at center 42%, transparent 0%, rgba(${theme.bgRgb},0.45) 40%, rgba(${theme.bgRgb},0.92) 75%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5"
        style={{
          background: `linear-gradient(to top, rgba(${theme.bgRgb},0.98) 0%, rgba(${theme.bgRgb},0.6) 50%, transparent 100%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-1/5"
        style={{
          background: `linear-gradient(to bottom, rgba(${theme.bgRgb},0.7) 0%, transparent 100%)`,
        }}
      />
    </div>
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

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: `opacity ${fadeDurationMs}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Lightweight dark curtain for scene changes where assets are already cached
 * but the canvas needs a few frames to repaint. Fades to transparent then unmounts.
 */
export function SceneTransitionOverlay({
  visible,
  fadeDurationMs = 500,
}: {
  visible: boolean;
  fadeDurationMs?: number;
}) {
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), fadeDurationMs);
      return () => clearTimeout(t);
    }
  }, [visible, fadeDurationMs]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        background: "linear-gradient(180deg, #0c0804 0%, #1a0f06 100%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: `opacity ${fadeDurationMs}ms ease-out`,
      }}
    />
  );
}
