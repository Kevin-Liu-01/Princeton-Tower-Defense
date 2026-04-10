"use client";
import React from "react";

import { LANDING_THEME } from "../landingConstants";

const T = LANDING_THEME;

function rgba(rgb: string, a: number): string {
  return `rgba(${rgb},${a})`;
}

// ─── Map Grid Lines (cartographic latitude/longitude) ─────────────────────────

const GRID_LINES_H = [18, 36, 54, 72, 88];
const GRID_LINES_V = [18, 36, 54, 72, 88];
const GRID_TICKS = [10, 27, 45, 63, 81, 93];

export function MapGrid() {
  const line = rgba(T.accentRgb, 0.08);
  const tick = rgba(T.accentRgb, 0.14);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      {GRID_LINES_H.map((y) => (
        <line
          key={`h${y}`}
          x1="3%"
          y1={`${y}%`}
          x2="97%"
          y2={`${y}%`}
          stroke={line}
          strokeWidth="0.5"
          strokeDasharray="6,14"
        />
      ))}
      {GRID_LINES_V.map((x) => (
        <line
          key={`v${x}`}
          x1={`${x}%`}
          y1="3%"
          x2={`${x}%`}
          y2="97%"
          stroke={line}
          strokeWidth="0.5"
          strokeDasharray="6,14"
        />
      ))}
      {GRID_TICKS.map((p) => (
        <React.Fragment key={`t${p}`}>
          <line
            x1={`${p}%`}
            y1="0.5%"
            x2={`${p}%`}
            y2="2.2%"
            stroke={tick}
            strokeWidth="0.5"
          />
          <line
            x1={`${p}%`}
            y1="97.8%"
            x2={`${p}%`}
            y2="99.5%"
            stroke={tick}
            strokeWidth="0.5"
          />
          <line
            x1="0.5%"
            y1={`${p}%`}
            x2="2.2%"
            y2={`${p}%`}
            stroke={tick}
            strokeWidth="0.5"
          />
          <line
            x1="97.8%"
            y1={`${p}%`}
            x2="99.5%"
            y2={`${p}%`}
            stroke={tick}
            strokeWidth="0.5"
          />
        </React.Fragment>
      ))}
    </svg>
  );
}

// ─── Ornate Corner Piece ──────────────────────────────────────────────────────

function CornerOrnament({
  flipX = false,
  flipY = false,
}: {
  flipX?: boolean;
  flipY?: boolean;
}) {
  const c = rgba(T.accentRgb, 0.28);
  const c2 = rgba(T.accentBrightRgb, 0.18);
  return (
    <svg
      viewBox="0 0 70 70"
      style={{
        height: 52,
        transform: `${flipX ? "scaleX(-1)" : ""} ${flipY ? "scaleY(-1)" : ""}`,
        width: 52,
      }}
      fill="none"
    >
      <path d="M0,0 L30,0 L30,3 L3,3 L3,30 L0,30 Z" fill={c} />
      <path d="M7,0 L7,7 L0,7" stroke={c2} strokeWidth="0.6" />
      <path d="M12,12 L16,7 L20,12 L16,17 Z" fill={c} />
      <circle cx="16" cy="12" r="1.8" fill={c2} />
      <line
        x1="22"
        y1="3"
        x2="42"
        y2="3"
        stroke={rgba(T.accentRgb, 0.1)}
        strokeWidth="0.5"
      />
      <line
        x1="3"
        y1="22"
        x2="3"
        y2="42"
        stroke={rgba(T.accentRgb, 0.1)}
        strokeWidth="0.5"
      />
      <circle cx="36" cy="3" r="1" fill={rgba(T.accentRgb, 0.12)} />
      <circle cx="3" cy="36" r="1" fill={rgba(T.accentRgb, 0.12)} />
    </svg>
  );
}

// ─── Map Border Frame ─────────────────────────────────────────────────────────

const EDGE_DIAMOND_STYLE = { height: 14, width: 14 };

export function MapBorder() {
  const borderOuter = rgba(T.accentRgb, 0.16);
  const borderInner = rgba(T.accentRgb, 0.07);
  const diamond = rgba(T.accentRgb, 0.22);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-3 sm:inset-5 md:inset-7 rounded-sm"
        style={{ border: `1.5px solid ${borderOuter}` }}
      >
        <div
          className="absolute inset-[5px] rounded-[1px]"
          style={{ border: `0.5px solid ${borderInner}` }}
        />
      </div>

      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 md:top-7 md:left-7">
        <CornerOrnament />
      </div>
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 md:top-7 md:right-7">
        <CornerOrnament flipX />
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 md:bottom-7 md:left-7">
        <CornerOrnament flipY />
      </div>
      <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 md:bottom-7 md:right-7">
        <CornerOrnament flipX flipY />
      </div>

      {/* Edge midpoint diamonds */}
      <svg
        viewBox="0 0 20 20"
        className="absolute top-[10px] sm:top-[14px] md:top-[22px] left-1/2 -translate-x-1/2"
        style={EDGE_DIAMOND_STYLE}
      >
        <path d="M10,2 L14,10 L10,18 L6,10 Z" fill={diamond} />
      </svg>
      <svg
        viewBox="0 0 20 20"
        className="absolute bottom-[10px] sm:bottom-[14px] md:bottom-[22px] left-1/2 -translate-x-1/2"
        style={EDGE_DIAMOND_STYLE}
      >
        <path d="M10,2 L14,10 L10,18 L6,10 Z" fill={diamond} />
      </svg>
      <svg
        viewBox="0 0 20 20"
        className="absolute left-[10px] sm:left-[14px] md:left-[22px] top-1/2 -translate-y-1/2"
        style={EDGE_DIAMOND_STYLE}
      >
        <path d="M10,2 L14,10 L10,18 L6,10 Z" fill={diamond} />
      </svg>
      <svg
        viewBox="0 0 20 20"
        className="absolute right-[10px] sm:right-[14px] md:right-[22px] top-1/2 -translate-y-1/2"
        style={EDGE_DIAMOND_STYLE}
      >
        <path d="M10,2 L14,10 L10,18 L6,10 Z" fill={diamond} />
      </svg>
    </div>
  );
}

// ─── Mountain Range Silhouettes ───────────────────────────────────────────────

const SNOW_PEAKS = [
  { x: 310, y: 52 },
  { x: 590, y: 42 },
  { x: 730, y: 26 },
  { x: 1010, y: 34 },
];

export function MapMountains() {
  return (
    <div className="absolute top-0 left-0 right-0 h-[18%] sm:h-[22%] pointer-events-none overflow-hidden opacity-60">
      <svg
        viewBox="0 0 1400 180"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <path
          d="M-20,180 L60,128 L110,148 L180,82 L230,118 L310,52 L380,98 L450,62 L530,108 L590,42 L660,88 L730,26 L800,78 L870,46 L940,92 L1010,34 L1080,80 L1150,56 L1220,102 L1300,70 L1370,122 L1420,180Z"
          fill={rgba(T.accentDarkRgb, 0.09)}
          stroke={rgba(T.accentRgb, 0.05)}
          strokeWidth="0.5"
        />
        <path
          d="M-20,180 L80,138 L160,108 L240,142 L320,72 L400,118 L480,88 L560,58 L640,106 L720,68 L800,116 L880,82 L960,128 L1040,96 L1120,138 L1200,112 L1280,146 L1360,128 L1420,180Z"
          fill={rgba(T.bgRgb, 0.8)}
          stroke={rgba(T.accentRgb, 0.07)}
          strokeWidth="0.5"
        />
        {SNOW_PEAKS.map((p, i) => (
          <path
            key={i}
            d={`M${p.x - 12},${p.y + 16} L${p.x},${p.y} L${p.x + 12},${p.y + 16}`}
            stroke={rgba(T.accentRgb, 0.1)}
            strokeWidth="0.6"
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Sea Waves (bottom edge) ──────────────────────────────────────────────────

function waveRow(yBase: number, amplitude: number, flip: boolean): string {
  const segs = Array.from({ length: 15 }, (_, i) => {
    const x0 = i * 100;
    const a = flip ? -amplitude : amplitude;
    return `Q${x0 + 25},${yBase - a} ${x0 + 50},${yBase} Q${x0 + 75},${yBase + a} ${x0 + 100},${yBase}`;
  });
  return `M-20,${yBase} ${segs.join(" ")}`;
}

export function MapWaves() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[10%] pointer-events-none overflow-hidden opacity-40">
      <svg
        viewBox="0 0 1500 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
      >
        {[
          { amp: 6, flip: false, op: 0.4, y: 15 },
          { amp: 8, flip: true, op: 0.5, y: 35 },
          { amp: 6, flip: false, op: 0.6, y: 55 },
          { amp: 7, flip: true, op: 0.7, y: 75 },
          { amp: 5, flip: false, op: 0.8, y: 92 },
        ].map((w, i) => (
          <path
            key={i}
            d={waveRow(w.y, w.amp, w.flip)}
            stroke={rgba(T.accentRgb, 0.04 * w.op)}
            strokeWidth="0.7"
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Dotted Adventure Trails ──────────────────────────────────────────────────

const TRAIL_PATHS = [
  { d: "M60,820 Q220,680 380,540", op: 0.08 },
  { d: "M940,790 Q780,640 610,530", op: 0.08 },
  { d: "M120,180 Q280,290 410,410", op: 0.06 },
  { d: "M880,150 Q750,280 600,400", op: 0.05 },
];

const TRAIL_MARKS = [
  [60, 820],
  [940, 790],
  [120, 180],
  [880, 150],
];

export function MapTrails() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      fill="none"
    >
      {TRAIL_PATHS.map((t, i) => (
        <path
          key={i}
          d={t.d}
          stroke={rgba(T.accentRgb, t.op)}
          strokeWidth="1.8"
          strokeDasharray="5,9"
          className="animate-map-trail"
        />
      ))}
      {TRAIL_MARKS.map(([x, y], i) => (
        <g key={i} opacity="0.12">
          <line
            x1={x - 6}
            y1={y - 6}
            x2={x + 6}
            y2={y + 6}
            stroke={T.accent}
            strokeWidth="1.5"
          />
          <line
            x1={x + 6}
            y1={y - 6}
            x2={x - 6}
            y2={y + 6}
            stroke={T.accent}
            strokeWidth="1.5"
          />
          <circle
            cx={x}
            cy={y}
            r="3"
            fill="none"
            stroke={T.accent}
            strokeWidth="0.8"
            opacity="0.6"
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Location Markers ─────────────────────────────────────────────────────────

interface LocationDef {
  label: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

const MAP_LOCATIONS: LocationDef[] = [
  { label: "Nassau Hall", left: "10%", top: "20%" },
  { label: "Poe Field", right: "9%", top: "30%" },
  { bottom: "32%", label: "Carnegie Lake", left: "7%" },
  { bottom: "24%", label: "The Caldera", right: "10%" },
  { label: "Frozen Peak", right: "24%", top: "14%" },
  { bottom: "38%", label: "Dark Marsh", right: "22%" },
];

function LocationMarker({ label, ...pos }: LocationDef) {
  return (
    <div
      className="absolute flex flex-col items-center gap-0.5 animate-map-marker"
      style={pos as React.CSSProperties}
    >
      <svg viewBox="0 0 14 18" style={{ height: 14, width: 11 }}>
        <path
          d="M7,1 L12,5 L12,13 L7,17 L2,13 L2,5 Z"
          fill={rgba(T.accentDarkRgb, 0.25)}
          stroke={rgba(T.accentRgb, 0.3)}
          strokeWidth="0.6"
        />
        <circle cx="7" cy="8" r="2" fill={rgba(T.accentBrightRgb, 0.3)} />
      </svg>
      <span
        className="text-[7px] sm:text-[8px] uppercase tracking-[0.12em] whitespace-nowrap font-medium"
        style={{ color: rgba(T.accentRgb, 0.18) }}
      >
        {label}
      </span>
    </div>
  );
}

export function MapLocations() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {MAP_LOCATIONS.map((loc) => (
        <LocationMarker key={loc.label} {...loc} />
      ))}
    </div>
  );
}

// ─── Cartouche (decorative title frame) ───────────────────────────────────────

export function MapCartouche({ children }: { children: React.ReactNode }) {
  const border = rgba(T.accentRgb, 0.14);
  const borderInner = rgba(T.accentRgb, 0.06);
  const ornament = rgba(T.accentRgb, 0.28);
  const ornamentLine = rgba(T.accentRgb, 0.22);
  const bg = rgba(T.accentDarkRgb, 0.05);

  return (
    <div className="relative">
      <div className="absolute -inset-x-5 -inset-y-3 sm:-inset-x-8 sm:-inset-y-5 pointer-events-none">
        <div
          className="absolute inset-0 rounded-sm"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <div
            className="absolute inset-[3px] rounded-[1px]"
            style={{ border: `0.5px solid ${borderInner}` }}
          />
        </div>

        {/* Top ornament */}
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div
            className="w-5 sm:w-8 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${ornamentLine})`,
            }}
          />
          <div
            className="w-2.5 h-2.5 rotate-45"
            style={{
              background: rgba(T.bgRgb, 1),
              border: `1px solid ${ornament}`,
            }}
          />
          <div
            className="w-5 sm:w-8 h-px"
            style={{
              background: `linear-gradient(90deg, ${ornamentLine}, transparent)`,
            }}
          />
        </div>

        {/* Bottom ornament */}
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div
            className="w-5 sm:w-8 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${ornamentLine})`,
            }}
          />
          <div
            className="w-2.5 h-2.5 rotate-45"
            style={{
              background: rgba(T.bgRgb, 1),
              border: `1px solid ${ornament}`,
            }}
          />
          <div
            className="w-5 sm:w-8 h-px"
            style={{
              background: `linear-gradient(90deg, ${ornamentLine}, transparent)`,
            }}
          />
        </div>

        {/* Side filigree lines */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6"
          style={{
            background: `linear-gradient(180deg, transparent, ${ornamentLine}, transparent)`,
          }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6"
          style={{
            background: `linear-gradient(180deg, transparent, ${ornamentLine}, transparent)`,
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

// ─── Parchment Texture Overlay ────────────────────────────────────────────────

export function ParchmentOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Warm aged stain patches */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 40% 35% at 22% 28%, ${rgba(T.accentDarkRgb, 0.08)}, transparent),
            radial-gradient(ellipse 35% 45% at 78% 72%, ${rgba(T.accentDarkRgb, 0.06)}, transparent),
            radial-gradient(ellipse 50% 30% at 50% 50%, ${rgba(T.accentDarkRgb, 0.04)}, transparent)
          `,
        }}
      />
      {/* Fine dot grain */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${rgba(T.accentRgb, 0.025)} 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}

// ─── Shared Section Header (cartographic style) ──────────────────────────────

export function MapSectionHeader({
  subtitle,
  title,
  description,
  subtitleColor,
}: {
  subtitle?: string;
  title: string;
  description?: string;
  subtitleColor?: string;
}) {
  const sc = subtitleColor ?? rgba(T.accentRgb, 0.35);
  return (
    <div className="text-center mt-8 sm:mt-12 mb-8 sm:mb-10 px-6">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div
          className="w-6 sm:w-10 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${rgba(T.accentRgb, 0.2)})`,
          }}
        />
        <p
          className="text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase"
          style={{ color: sc }}
        >
          {subtitle}
        </p>
        <div
          className="w-6 sm:w-10 h-px"
          style={{
            background: `linear-gradient(90deg, ${rgba(T.accentRgb, 0.2)}, transparent)`,
          }}
        />
      </div>
      <h2
        className="text-3xl sm:text-5xl font-bold tracking-wide font-cinzel"
        style={{
          color: T.accent,
          textShadow: `0 0 60px ${rgba(T.accentRgb, 0.3)}, 0 4px 12px rgba(0,0,0,0.6)`,
        }}
      >
        {title}
      </h2>
      <div className="flex items-center justify-center gap-2 mt-3">
        <div
          className="w-10 sm:w-14 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${rgba(T.accentRgb, 0.15)})`,
          }}
        />
        <div
          className="w-1.5 h-1.5 rotate-45"
          style={{ border: `1px solid ${rgba(T.accentRgb, 0.25)}` }}
        />
        <div
          className="w-10 sm:w-14 h-px"
          style={{
            background: `linear-gradient(90deg, ${rgba(T.accentRgb, 0.15)}, transparent)`,
          }}
        />
      </div>
      {description && (
        <p
          className="text-[10px] sm:text-xs mt-4 max-w-lg mx-auto leading-relaxed italic"
          style={{ color: rgba(T.accentRgb, 0.22) }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Section Background (parchment grid + vignette) ───────────────────────────

export function MapSectionBg({
  tint,
  gridOpacity = 0.04,
}: {
  tint?: string;
  gridOpacity?: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${rgba(T.accentRgb, gridOpacity)} 1px, transparent 1px),
            linear-gradient(90deg, ${rgba(T.accentRgb, gridOpacity)} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {tint && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${tint}, transparent 60%)`,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 40px 60px -20px ${T.bg}, inset 0 -40px 60px -20px ${T.bg}`,
        }}
      />
    </div>
  );
}

// ─── Content Panel with ornate corners ────────────────────────────────────────

export function MapContentPanel({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  const c = accent ?? T.accent;
  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        className="absolute -top-2 -left-2 w-7 h-7 pointer-events-none"
        style={{
          borderLeft: `2px solid ${c}22`,
          borderTop: `2px solid ${c}22`,
        }}
      >
        <div
          className="absolute top-[3px] left-[3px] w-1.5 h-1.5 rotate-45"
          style={{ background: `${c}18` }}
        />
      </div>
      <div
        className="absolute -top-2 -right-2 w-7 h-7 pointer-events-none"
        style={{
          borderRight: `2px solid ${c}22`,
          borderTop: `2px solid ${c}22`,
        }}
      >
        <div
          className="absolute top-[3px] right-[3px] w-1.5 h-1.5 rotate-45"
          style={{ background: `${c}18` }}
        />
      </div>
      <div
        className="absolute -bottom-2 -left-2 w-7 h-7 pointer-events-none"
        style={{
          borderBottom: `2px solid ${c}22`,
          borderLeft: `2px solid ${c}22`,
        }}
      >
        <div
          className="absolute bottom-[3px] left-[3px] w-1.5 h-1.5 rotate-45"
          style={{ background: `${c}18` }}
        />
      </div>
      <div
        className="absolute -bottom-2 -right-2 w-7 h-7 pointer-events-none"
        style={{
          borderBottom: `2px solid ${c}22`,
          borderRight: `2px solid ${c}22`,
        }}
      >
        <div
          className="absolute bottom-[3px] right-[3px] w-1.5 h-1.5 rotate-45"
          style={{ background: `${c}18` }}
        />
      </div>
      <div
        className="absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 pointer-events-none"
        style={{ background: `${c}1a`, border: `0.5px solid ${c}30` }}
      />
      <div
        className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 pointer-events-none"
        style={{ background: `${c}1a`, border: `0.5px solid ${c}30` }}
      />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${c}18, transparent)`,
        }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${c}18, transparent)`,
        }}
      />
      {children}
    </div>
  );
}

// ─── Section Border Frame (ornate border for landing sections) ────────────────

function SectionCornerSvg({
  flipX,
  flipY,
}: {
  flipX?: boolean;
  flipY?: boolean;
}) {
  const c = rgba(T.accentRgb, 0.22);
  const c2 = rgba(T.accentBrightRgb, 0.14);
  const xf = [flipX ? "scaleX(-1)" : "", flipY ? "scaleY(-1)" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <svg
      viewBox="0 0 50 50"
      style={{ height: 36, transform: xf || undefined, width: 36 }}
      fill="none"
    >
      <path d="M0,0 L24,0 L24,2.5 L2.5,2.5 L2.5,24 L0,24 Z" fill={c} />
      <path d="M6,0 L6,6 L0,6" stroke={c2} strokeWidth="0.5" />
      <path d="M10,10 L13,6 L16,10 L13,14 Z" fill={c} />
      <circle cx="13" cy="10" r="1.5" fill={c2} />
      <line
        x1="18"
        y1="2.5"
        x2="34"
        y2="2.5"
        stroke={rgba(T.accentRgb, 0.08)}
        strokeWidth="0.4"
      />
      <line
        x1="2.5"
        y1="18"
        x2="2.5"
        y2="34"
        stroke={rgba(T.accentRgb, 0.08)}
        strokeWidth="0.4"
      />
    </svg>
  );
}

export function SectionBorderFrame({ accent }: { accent?: string }) {
  const borderOuter = accent ? `${accent}14` : rgba(T.accentRgb, 0.1);
  const borderInner = accent ? `${accent}08` : rgba(T.accentRgb, 0.05);
  const diamond = accent ? `${accent}1a` : rgba(T.accentRgb, 0.15);

  return (
    <div className="absolute inset-x-3 inset-y-2 sm:inset-x-5 sm:inset-y-3 lg:inset-x-8 lg:inset-y-4 pointer-events-none z-[1]">
      <div
        className="absolute inset-0 rounded-sm"
        style={{ border: `1px solid ${borderOuter}` }}
      >
        <div
          className="absolute inset-[3px] rounded-[1px]"
          style={{ border: `0.5px solid ${borderInner}` }}
        />
      </div>

      <div className="absolute top-0 left-0">
        <SectionCornerSvg />
      </div>
      <div className="absolute top-0 right-0">
        <SectionCornerSvg flipX />
      </div>
      <div className="absolute bottom-0 left-0">
        <SectionCornerSvg flipY />
      </div>
      <div className="absolute bottom-0 right-0">
        <SectionCornerSvg flipX flipY />
      </div>

      <svg
        viewBox="0 0 16 16"
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ height: 10, width: 10 }}
      >
        <path d="M8,1 L12,8 L8,15 L4,8 Z" fill={diamond} />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
        style={{ height: 10, width: 10 }}
      >
        <path d="M8,1 L12,8 L8,15 L4,8 Z" fill={diamond} />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ height: 10, width: 10 }}
      >
        <path d="M8,1 L12,8 L8,15 L4,8 Z" fill={diamond} />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
        style={{ height: 10, width: 10 }}
      >
        <path d="M8,1 L12,8 L8,15 L4,8 Z" fill={diamond} />
      </svg>
    </div>
  );
}

// ─── Section Transition Divider ───────────────────────────────────────────────

export function MapSectionDivider() {
  return (
    <div className="relative py-2 flex items-center justify-center">
      <div
        className="w-full max-w-xs h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${rgba(T.accentRgb, 0.12)}, transparent)`,
        }}
      />
      <div className="absolute flex items-center gap-3">
        <div
          className="w-1 h-1 rotate-45"
          style={{ background: rgba(T.accentRgb, 0.2) }}
        />
        <div
          className="w-2 h-2 rotate-45"
          style={{
            background: rgba(T.bgRgb, 1),
            border: `1px solid ${rgba(T.accentRgb, 0.2)}`,
          }}
        />
        <div
          className="w-1 h-1 rotate-45"
          style={{ background: rgba(T.accentRgb, 0.2) }}
        />
      </div>
    </div>
  );
}

// ─── Battle Scene Backdrop (gameplay screenshot behind sprites) ───────────────

export function BattleBackdrop({
  src,
  accent,
  intensity = 0.35,
}: {
  src: string;
  accent: string;
  intensity?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "blur(1.5px) saturate(0.5) brightness(0.35)",
          opacity: intensity,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 50%, ${accent}18, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, transparent, rgba(12,8,4,0.92))`,
        }}
      />
    </div>
  );
}

// ─── Stat Block (shared RPG-style stat display) ──────────────────────────────

export function StatBlock({
  label,
  value,
  accent,
  wide,
}: {
  label: string;
  value: string;
  accent: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl overflow-hidden ${wide ? "px-5 py-3.5 min-w-[90px]" : "px-4 py-3 min-w-[72px]"}`}
      style={{
        background: `linear-gradient(160deg, ${accent}14, ${accent}06)`,
        border: `1px solid ${accent}20`,
        boxShadow: `inset 0 1px 0 ${accent}08`,
      }}
    >
      <div
        className="absolute top-0 left-2 right-2 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
        }}
      />
      <span
        className={`font-black tabular-nums leading-none ${wide ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}
        style={{ color: accent, textShadow: `0 0 20px ${accent}25` }}
      >
        {value}
      </span>
      <span
        className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.25em] mt-1.5"
        style={{ color: `${accent}55` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Compass Direction Labels (non-rotating overlay) ──────────────────────────

export function CompassDirections() {
  const c = rgba(T.accentRgb, 0.25);
  const positions = [
    { label: "N", left: "50%", top: -18, transform: "translateX(-50%)" },
    { bottom: -18, label: "S", left: "50%", transform: "translateX(-50%)" },
    { label: "E", right: -18, top: "50%", transform: "translateY(-50%)" },
    { label: "W", left: -18, top: "50%", transform: "translateY(-50%)" },
  ];

  return (
    <>
      {positions.map((p) => (
        <span
          key={p.label}
          className="absolute text-[8px] font-bold tracking-wider"
          style={{ color: c, ...p } as React.CSSProperties}
        >
          {p.label}
        </span>
      ))}
    </>
  );
}
