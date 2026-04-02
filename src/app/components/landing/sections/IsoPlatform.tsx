import React from "react";

interface IsoPlatformProps {
  width: number;
  depth?: number;
  color: string;
  glowColor?: string;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - amount;
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

export function IsoPlatform({
  width,
  depth = 6,
  color,
  glowColor,
  className,
}: IsoPlatformProps) {
  const halfW = width / 2;
  const halfH = width / 4;

  const svgHeight = halfH + depth + 2;
  const svgWidth = width + 2;

  const cx = svgWidth / 2;
  const topY = 1;
  const midY = topY + halfH;
  const botY = midY + depth;

  const topFace = `${cx},${topY} ${cx + halfW},${midY} ${cx},${midY + halfH} ${cx - halfW},${midY}`;

  const leftFace = `${cx - halfW},${midY} ${cx},${midY + halfH} ${cx},${botY + halfH} ${cx - halfW},${botY}`;
  const rightFace = `${cx + halfW},${midY} ${cx},${midY + halfH} ${cx},${botY + halfH} ${cx + halfW},${botY}`;

  const topColor = lighten(color, 0.15);
  const leftColor = darken(color, 0.35);
  const rightColor = darken(color, 0.55);

  const glow = glowColor ?? color;
  const [gr, gg, gb] = hexToRgb(glow);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <filter id={`iso-glow-${color.replace("#", "")}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Soft glow beneath */}
      <ellipse
        cx={cx}
        cy={midY + depth / 2}
        rx={halfW * 0.8}
        ry={halfH * 0.6}
        fill={`rgba(${gr},${gg},${gb},0.12)`}
      />

      {/* Left face */}
      <polygon
        points={leftFace}
        fill={leftColor}
        stroke={darken(color, 0.65)}
        strokeWidth="0.5"
      />

      {/* Right face */}
      <polygon
        points={rightFace}
        fill={rightColor}
        stroke={darken(color, 0.65)}
        strokeWidth="0.5"
      />

      {/* Top face */}
      <polygon
        points={topFace}
        fill={topColor}
        stroke={lighten(color, 0.3)}
        strokeWidth="0.5"
      />

      {/* Highlight line on top edge */}
      <line
        x1={cx - halfW}
        y1={midY}
        x2={cx}
        y2={topY}
        stroke={lighten(color, 0.5)}
        strokeWidth="0.5"
        opacity="0.6"
      />
      <line
        x1={cx}
        y1={topY}
        x2={cx + halfW}
        y2={midY}
        stroke={lighten(color, 0.4)}
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  );
}
