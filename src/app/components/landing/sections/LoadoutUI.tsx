"use client";
import React from "react";

export interface StatBarData {
  label: string;
  pct: number;
  display: string;
}

export function StatBar({
  label,
  pct,
  display,
  color,
}: StatBarData & { color: string }) {
  const clamped = Math.max(0, Math.min(100, pct * 100));
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider w-12 text-right flex-shrink-0"
        style={{ color: `${color}77` }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-[6px] sm:h-[7px] rounded-[2px] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-[2px] transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
            boxShadow: `0 0 6px ${color}33`,
          }}
        />
      </div>
      <span
        className="text-[8px] sm:text-[10px] font-bold tabular-nums w-11 flex-shrink-0 text-right"
        style={{ color: `${color}bb` }}
      >
        {display}
      </span>
    </div>
  );
}

export function PanelCorners({ color }: { color: string }) {
  const bright = `${color}44`;
  const dim = `${color}22`;
  return (
    <>
      <div
        className="absolute top-0 left-0 w-5 h-px pointer-events-none"
        style={{ background: bright }}
      />
      <div
        className="absolute top-0 left-0 h-5 w-px pointer-events-none"
        style={{ background: bright }}
      />
      <div
        className="absolute top-0 right-0 w-5 h-px pointer-events-none"
        style={{ background: dim }}
      />
      <div
        className="absolute top-0 right-0 h-5 w-px pointer-events-none"
        style={{ background: dim }}
      />
      <div
        className="absolute bottom-0 left-0 w-5 h-px pointer-events-none"
        style={{ background: dim }}
      />
      <div
        className="absolute bottom-0 left-0 h-5 w-px pointer-events-none"
        style={{ background: dim }}
      />
      <div
        className="absolute bottom-0 right-0 w-5 h-px pointer-events-none"
        style={{ background: dim }}
      />
      <div
        className="absolute bottom-0 right-0 h-5 w-px pointer-events-none"
        style={{ background: dim }}
      />
    </>
  );
}

export function SlotCorners({ color }: { color: string }) {
  return (
    <>
      <div
        className="absolute top-0 left-0 w-3 h-px pointer-events-none"
        style={{ background: `${color}30` }}
      />
      <div
        className="absolute top-0 left-0 h-3 w-px pointer-events-none"
        style={{ background: `${color}30` }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-px pointer-events-none"
        style={{ background: `${color}18` }}
      />
      <div
        className="absolute bottom-0 right-0 h-3 w-px pointer-events-none"
        style={{ background: `${color}18` }}
      />
    </>
  );
}
