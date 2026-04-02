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
    <div className="flex gap-2 justify-center mt-5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          className="w-2 h-2 rounded-full transition-all duration-400 cursor-pointer"
          style={{
            background: i === active ? color : `rgba(${T.accentRgb},0.15)`,
            transform: i === active ? "scale(1.5)" : "scale(1)",
            boxShadow: i === active ? `0 0 8px ${color}66` : "none",
          }}
        />
      ))}
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
      className={`absolute top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 ${
        direction === "left" ? "left-2 sm:left-3" : "right-2 sm:right-3"
      }`}
      style={{
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Icon size={18} style={{ color: `${color}cc` }} />
    </button>
  );
}
