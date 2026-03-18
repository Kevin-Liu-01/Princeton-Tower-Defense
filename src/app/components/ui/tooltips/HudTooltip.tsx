"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface HudTooltipProps {
  label: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
  delay?: number;
  disabled?: boolean;
}

const TOOLTIP_DELAY = 400;
const GAP = 6;
const PAD = 8;

export const HudTooltip: React.FC<HudTooltipProps> = ({
  label,
  children,
  position = "bottom",
  delay = TOOLTIP_DELAY,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<{ left: number; top: number; arrowOff: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (disabled) {
      return;
    }
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay, disabled]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
    setStyle(null);
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!visible || !wrapperRef.current || !tooltipRef.current) {
      return;
    }

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const centerX = wrapperRect.left + wrapperRect.width / 2;

    let left = centerX - tooltipWidth / 2;
    if (left < PAD) {
      left = PAD;
    }
    if (left + tooltipWidth > window.innerWidth - PAD) {
      left = window.innerWidth - PAD - tooltipWidth;
    }

    const top = position === "top" ? wrapperRect.top - GAP - tooltipHeight : wrapperRect.bottom + GAP;
    const arrowOff = centerX - left;

    setStyle({ left, top, arrowOff });
  }, [visible, position, label]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onPointerDown={hide}
    >
      {children}
      {visible && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none select-none hidden md:block"
            style={{
              left: style?.left ?? -9999,
              top: style?.top ?? -9999,
              opacity: style ? 1 : 0,
              background: "rgba(10,10,15,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.88)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
            }}
          >
            {label}
            {style && (
              <div
                className={`absolute w-2 h-2 rotate-45 ${position === "bottom" ? "-top-1" : "-bottom-1"}`}
                style={{
                  left: style.arrowOff,
                  transform: "translateX(-50%)",
                  background: "rgba(10,10,15,0.95)",
                  borderLeft: position === "bottom" ? "1px solid rgba(255,255,255,0.1)" : "none",
                  borderTop: position === "bottom" ? "1px solid rgba(255,255,255,0.1)" : "none",
                  borderRight: position === "top" ? "1px solid rgba(255,255,255,0.1)" : "none",
                  borderBottom: position === "top" ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};
