"use client";

import React, { useState, useRef, useCallback } from "react";

interface CircleActionButtonProps {
  x: number;
  y: number;
  size: number;
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  tooltip?: string;
  onClick: () => void;
  disabled?: boolean;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
}

const LONG_PRESS_MS = 400;

export function CircleActionButton({
  x,
  y,
  size,
  icon,
  label,
  subLabel,
  tooltip,
  onClick,
  disabled = false,
  borderColor,
  glowColor,
  bgGradient,
}: CircleActionButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    if (!tooltip) return;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowTooltip(true);
    }, LONG_PRESS_MS);
  }, [tooltip]);

  const handlePointerUp = useCallback(() => {
    clearTimer();
    if (didLongPress.current) {
      setShowTooltip(false);
      didLongPress.current = false;
    }
  }, [clearTimer]);

  const handlePointerLeave = useCallback(() => {
    clearTimer();
    setShowTooltip(false);
    didLongPress.current = false;
  }, [clearTimer]);

  return (
    <div
      className="fixed flex flex-col items-center pointer-events-none"
      style={{
        left: x,
        top: y - size / 2,
        transform: "translateX(-50%)",
        zIndex: 201,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (didLongPress.current) return;
          onClick();
        }}
        onMouseEnter={tooltip ? () => setShowTooltip(true) : undefined}
        onMouseLeave={tooltip ? () => setShowTooltip(false) : undefined}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        disabled={disabled}
        className={`pointer-events-auto rounded-full flex items-center justify-center transition-all duration-150 ${
          disabled
            ? "opacity-50 cursor-not-allowed grayscale"
            : "hover:scale-110 hover:brightness-125 active:scale-95 cursor-pointer"
        }`}
        style={{
          width: size,
          height: size,
          background: bgGradient,
          border: `2.5px solid ${borderColor}`,
          boxShadow: disabled
            ? "0 2px 4px rgba(0,0,0,0.5)"
            : `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 2px 8px rgba(0,0,0,0.6)`,
        }}
      >
        {icon}
      </button>

      {/* Label + cost */}
      <div
        className="text-center pointer-events-none whitespace-nowrap flex flex-col items-center"
        style={{ marginTop: 2 }}
      >
        <div
          className="font-extrabold leading-tight px-1.5 py-0.5 rounded"
          style={{
            fontSize: 11,
            color: "#fff",
            background: "rgba(0,0,0,0.65)",
            textShadow: "0 1px 2px rgba(0,0,0,1)",
          }}
        >
          {label}
        </div>
        {subLabel && (
          <div
            className="font-bold leading-tight px-1 rounded mt-px"
            style={{
              fontSize: 10,
              color: "rgba(255,210,80,0.95)",
              background: "rgba(0,0,0,0.5)",
              textShadow: "0 1px 2px rgba(0,0,0,1)",
            }}
          >
            {subLabel}
          </div>
        )}
      </div>

      {/* Tooltip (hover / long-press) */}
      {tooltip && showTooltip && (
        <div
          className="pointer-events-none absolute left-1/2 flex flex-col items-center"
          style={{
            bottom: size + 8,
            transform: "translateX(-50%)",
            zIndex: 999,
          }}
        >
          <div
            className="rounded-lg px-3 py-2"
            style={{
              width: 220,
              fontSize: 12,
              lineHeight: 1.4,
              color: "#fff",
              background: "rgba(0,0,0,0.88)",
              border: `1px solid ${borderColor}`,
              boxShadow: `0 0 8px ${glowColor}, 0 4px 12px rgba(0,0,0,0.6)`,
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              whiteSpace: "normal",
              textAlign: "center",
            }}
          >
            {tooltip}
          </div>
          <div
            style={{
              width: 10,
              height: 10,
              marginTop: -5.5,
              background: "rgba(0,0,0,0.88)",
              borderRight: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}
    </div>
  );
}
