"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface HudTooltipProps {
  label: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
  delay?: number;
  disabled?: boolean;
}

const TOOLTIP_DELAY = 400;

export const HudTooltip: React.FC<HudTooltipProps> = ({
  label,
  children,
  position = "bottom",
  delay = TOOLTIP_DELAY,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nudge, setNudge] = useState(0);

  const show = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay, disabled]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible || !wrapperRef.current) {
      setNudge(0);
      return;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const pad = 8;

    const tooltipEl = wrapperRef.current.querySelector("[data-hud-tooltip]") as HTMLElement | null;
    if (!tooltipEl) return;
    const tipWidth = tooltipEl.offsetWidth;
    const halfTip = tipWidth / 2;

    if (centerX - halfTip < pad) {
      setNudge(pad - (centerX - halfTip));
    } else if (centerX + halfTip > window.innerWidth - pad) {
      setNudge(window.innerWidth - pad - (centerX + halfTip));
    } else {
      setNudge(0);
    }
  }, [visible]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onPointerDown={hide}
    >
      {children}
      {visible && (
        <div
          data-hud-tooltip
          className={`absolute left-1/2 z-[1400] px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none select-none hidden md:block ${
            position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
          style={{
            transform: `translateX(calc(-50% + ${nudge}px))`,
            background: "rgba(10,10,15,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.88)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
          }}
        >
          {label}
          <div
            className={`absolute left-1/2 w-2 h-2 rotate-45 ${
              position === "bottom" ? "-top-1" : "-bottom-1"
            }`}
            style={{
              transform: `translateX(calc(-50% - ${nudge}px))`,
              background: "rgba(10,10,15,0.95)",
              borderLeft: position === "bottom" ? "1px solid rgba(255,255,255,0.1)" : "none",
              borderTop: position === "bottom" ? "1px solid rgba(255,255,255,0.1)" : "none",
              borderRight: position === "top" ? "1px solid rgba(255,255,255,0.1)" : "none",
              borderBottom: position === "top" ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}
          />
        </div>
      )}
    </div>
  );
};
