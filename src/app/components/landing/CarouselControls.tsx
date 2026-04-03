"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LANDING_THEME } from "./landingConstants";

const T = LANDING_THEME;

export function useCarousel(count: number, autoPlayMs = 0) {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!autoPlayMs || count <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((p) => (p + 1) % count);
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [count, autoPlayMs]);

  const pauseBriefly = useCallback(() => {
    pausedRef.current = true;
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(
      () => { pausedRef.current = false; },
      Math.max(autoPlayMs * 2, 6000),
    );
  }, [autoPlayMs]);

  useEffect(
    () => () => { if (resumeRef.current) clearTimeout(resumeRef.current); },
    [],
  );

  const next = useCallback(() => { setActive((p) => (p + 1) % count); pauseBriefly(); }, [count, pauseBriefly]);
  const prev = useCallback(() => { setActive((p) => (p - 1 + count) % count); pauseBriefly(); }, [count, pauseBriefly]);
  const goTo = useCallback((i: number) => { setActive(i); pauseBriefly(); }, [pauseBriefly]);

  return { active, next, prev, goTo };
}

export function CarouselDots({
  count,
  active,
  onDot,
  accent,
}: {
  count: number;
  active: number;
  onDot: (i: number) => void;
  accent?: string;
}) {
  const color = accent ?? T.accent;
  return (
    <div className="flex gap-2.5 justify-center mt-6">
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            onClick={() => onDot(i)}
            className="relative cursor-pointer transition-all duration-300 group"
            style={{
              width: isActive ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: isActive ? color : `rgba(${T.accentRgb},0.12)`,
              boxShadow: isActive ? `0 0 12px ${color}55, 0 0 4px ${color}33` : "none",
              border: `1px solid ${isActive ? `${color}66` : `rgba(${T.accentRgb},0.08)`}`,
            }}
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)`,
                  animation: "landing-shimmer 2.5s ease-in-out infinite",
                }}
              />
            )}
            {!isActive && (
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: `${color}25` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function CarouselArrow({
  direction,
  onClick,
  accent,
}: {
  direction: "left" | "right";
  onClick: () => void;
  accent?: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  const color = accent ?? T.accent;
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group ${
        direction === "left" ? "left-2 sm:left-3" : "right-2 sm:right-3"
      }`}
      style={{
        background: "rgba(0,0,0,0.65)",
        border: `1.5px solid ${color}30`,
        backdropFilter: "blur(12px)",
        boxShadow: `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 20px ${color}25, inset 0 0 10px ${color}08`,
          border: `1.5px solid ${color}55`,
          borderRadius: "9999px",
        }}
      />
      <Icon size={20} className="relative z-10 transition-colors duration-200" style={{ color: `${color}bb` }} />
    </button>
  );
}
