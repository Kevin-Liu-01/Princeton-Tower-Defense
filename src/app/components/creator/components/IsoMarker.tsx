import React from "react";
import type { GridPoint } from "../types";
import { gridToIso } from "../utils/isoMath";

interface IsoMarkerProps {
  point: GridPoint;
  label: string;
  fill: string;
  stroke: string;
  selected: boolean;
  highlighted?: boolean;
  danger?: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
}

export const IsoMarker: React.FC<IsoMarkerProps> = ({
  point,
  label,
  fill,
  stroke,
  selected,
  highlighted = false,
  danger = false,
  onPointerDown,
}) => {
  const isoPoint = gridToIso(point);
  const markerRadius = label.length > 2 ? 12 : 9;
  const hasEmphasis = selected || highlighted;
  const auraFill = danger
    ? "rgba(248, 113, 113, 0.30)"
    : selected
      ? "rgba(255,255,255,0.24)"
      : "rgba(251, 191, 36, 0.22)";
  const ringStroke = danger
    ? "rgba(252, 165, 165, 0.96)"
    : selected
      ? "rgba(255,255,255,0.96)"
      : "rgba(253, 230, 138, 0.9)";

  return (
    <g
      onPointerDown={onPointerDown}
      transform={`translate(${isoPoint.x}, ${isoPoint.y - 7})`}
      className="cursor-grab active:cursor-grabbing"
      role="button"
      aria-label={label}
    >
      <circle
        cx={0}
        cy={0}
        r={markerRadius + (selected ? 4.2 : highlighted ? 3.3 : 0)}
        fill={hasEmphasis ? auraFill : "transparent"}
      />
      <circle
        cx={0}
        cy={0}
        r={markerRadius + (selected ? 2.3 : highlighted ? 1.5 : 0)}
        fill="none"
        stroke={hasEmphasis ? ringStroke : "transparent"}
        strokeWidth={1.5}
        strokeDasharray={selected ? undefined : "3 2"}
      />
      <circle
        cx={0}
        cy={0}
        r={markerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2.8 : highlighted ? 2.1 : 1.6}
      />
      <text
        x={0}
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={label.length > 2 ? 8 : 10}
        fontWeight={700}
        fill="rgba(16,10,2,0.9)"
      >
        {label}
      </text>
    </g>
  );
};
