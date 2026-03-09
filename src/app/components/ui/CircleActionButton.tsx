"use client";

import React from "react";

interface CircleActionButtonProps {
  x: number;
  y: number;
  size: number;
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
}

export function CircleActionButton({
  x,
  y,
  size,
  icon,
  label,
  subLabel,
  onClick,
  disabled = false,
  borderColor,
  glowColor,
  bgGradient,
}: CircleActionButtonProps) {
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
          onClick();
        }}
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
    </div>
  );
}
