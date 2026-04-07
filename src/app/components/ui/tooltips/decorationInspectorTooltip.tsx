"use client";

import { Eye } from "lucide-react";
import React from "react";

import type { Decoration, Position } from "../../../types";
import { getDecorationVolumeSpec, worldToGrid } from "../../../utils";
import { GOLD, PANEL, panelGradient } from "../system/theme";
import { getTooltipPosition } from "./tooltipPositioning";

interface DecorationInspectorTooltipProps {
  decoration: Decoration;
  position: Position;
}

const HEIGHT_TAG_COLORS: Record<string, string> = {
  ground: "text-stone-400",
  landmark: "text-purple-400",
  medium: "text-sky-400",
  short: "text-emerald-400",
  tall: "text-amber-400",
};

const Row: React.FC<{
  label: string;
  value: string;
  valueClass?: string;
}> = ({ label, value, valueClass }) => (
  <div className="flex justify-between text-[10px]">
    <span className="text-amber-500/60 uppercase tracking-wider">{label}</span>
    <span className={valueClass ?? "text-amber-100/90 font-medium"}>
      {value}
    </span>
  </div>
);

export const DecorationInspectorTooltip: React.FC<
  DecorationInspectorTooltipProps
> = ({ decoration, position }) => {
  const volume = getDecorationVolumeSpec(decoration.type, decoration.heightTag);
  const gridPos = worldToGrid({ x: decoration.x, y: decoration.y });
  const displayName = decoration.type
    .replaceAll("_", " ")
    .replaceAll(/\b\w/g, (char) => char.toUpperCase());
  const coords = getTooltipPosition(position, { height: 190, width: 220 });
  const tagColor = HEIGHT_TAG_COLORS[volume.heightTag] ?? "text-stone-400";

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        background: panelGradient,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `0 0 20px ${GOLD.glow07}`,
        left: coords.left,
        top: coords.top,
        width: 220,
        zIndex: 260,
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <div
        className="px-3 py-1.5 relative z-10"
        style={{
          background: PANEL.bgWarmMid,
          borderBottom: `1px solid ${GOLD.border25}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Eye className="text-cyan-400" size={14} />
          <span className="font-bold text-amber-200 text-sm">
            {displayName}
          </span>
        </div>
        <div className="text-[9px] text-amber-500/70 uppercase tracking-wider mt-0.5">
          Decoration Inspector
        </div>
      </div>
      <div className="px-3 py-2 space-y-1">
        <Row label="Type" value={decoration.type} />
        <Row label="Height" value={volume.heightTag} valueClass={tagColor} />
        <Row label="Scale" value={decoration.scale.toFixed(2)} />
        <Row label="Variant" value={String(decoration.variant)} />
        <Row
          label="Grid"
          value={`(${Number(gridPos.x.toFixed(1))}, ${Number(gridPos.y.toFixed(1))})`}
        />
        <Row
          label="World"
          value={`(${Math.round(decoration.x)}, ${Math.round(decoration.y)})`}
        />
        <Row
          label="Rotation"
          value={`${(decoration.rotation * (180 / Math.PI)).toFixed(0)}°`}
        />
      </div>
    </div>
  );
};
