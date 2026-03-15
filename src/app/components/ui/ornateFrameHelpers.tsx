import React from "react";

const D2R = Math.PI / 180;
const CARDINAL = [0, 90, 180, 270];
const INTERCARDINAL = [45, 135, 225, 315];
const CLOCK_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

interface FrameOpts {
  cx: number;
  outerR: number;
  midR: number;
  color: string;
  dimColor: string;
  prefix: string;
  glowFilter?: string;
}

/**
 * Hero frame: solid outer ring, long-dash inner ring,
 * 4 cardinal chevron notches, 4 intercardinal round studs.
 */
export function heroFrameElements(o: FrameOpts): React.ReactElement[] {
  const { cx, outerR, midR, color, dimColor, prefix, glowFilter } = o;
  const rW = Math.max(0.8, outerR * 0.03);
  const chDepth = Math.max(3, outerR * 0.12);
  const chSpread = Math.max(2.5, outerR * 0.1);
  const chWidth = Math.max(1, outerR * 0.04);
  const studR = Math.max(1.5, outerR * 0.065);
  const dashLen = Math.max(6, outerR * 0.22);

  const els: React.ReactElement[] = [
    <circle key={`${prefix}or`} cx={cx} cy={cx} r={outerR} fill="none"
      stroke={color} strokeWidth={rW} />,
    <circle key={`${prefix}ir`} cx={cx} cy={cx} r={midR} fill="none"
      stroke={dimColor} strokeWidth={0.5}
      strokeDasharray={`${dashLen.toFixed(1)} 3`} />,
  ];

  for (const deg of CARDINAL) {
    const rad = (deg - 90) * D2R;
    const c = Math.cos(rad), s = Math.sin(rad);
    const pc = -s, ps = c;
    const tipX = cx + (outerR + 1) * c;
    const tipY = cx + (outerR + 1) * s;
    const baseR = outerR - chDepth;
    const lX = cx + baseR * c + chSpread * pc;
    const lY = cx + baseR * s + chSpread * ps;
    const rX = cx + baseR * c - chSpread * pc;
    const rY = cx + baseR * s - chSpread * ps;
    els.push(
      <path key={`${prefix}cv${deg}`}
        d={`M${lX.toFixed(1)},${lY.toFixed(1)} L${tipX.toFixed(1)},${tipY.toFixed(1)} L${rX.toFixed(1)},${rY.toFixed(1)}`}
        fill="none" stroke={color} strokeWidth={chWidth}
        strokeLinejoin="round" strokeLinecap="round"
        filter={glowFilter} />
    );
  }

  for (const deg of INTERCARDINAL) {
    const rad = (deg - 90) * D2R;
    els.push(
      <circle key={`${prefix}sd${deg}`}
        cx={cx + outerR * Math.cos(rad)}
        cy={cx + outerR * Math.sin(rad)}
        r={studR} fill={dimColor} />
    );
  }

  return els;
}

/**
 * Spell frame: dotted outer ring, 12 radial whisker lines,
 * 4 cardinal sparkle crosses, 4 intercardinal tiny triangles.
 */
export function spellFrameElements(o: FrameOpts): React.ReactElement[] {
  const { cx, outerR, midR, color, dimColor, prefix, glowFilter } = o;
  const dotW = Math.max(1, outerR * 0.04);
  const dotGap = Math.max(3.5, outerR * 0.13);
  const wIn = midR - Math.max(2, outerR * 0.06);
  const wOut = outerR - 1;
  const starArm = Math.max(2.5, outerR * 0.1);
  const starW = Math.max(0.7, outerR * 0.03);
  const triSz = Math.max(1.5, outerR * 0.06);

  const els: React.ReactElement[] = [
    <circle key={`${prefix}dr`} cx={cx} cy={cx} r={outerR} fill="none"
      stroke={color} strokeWidth={dotW}
      strokeDasharray={`0 ${dotGap.toFixed(1)}`} strokeLinecap="round" />,
  ];

  for (const deg of CLOCK_ANGLES) {
    const rad = (deg - 90) * D2R;
    const c = Math.cos(rad), s = Math.sin(rad);
    els.push(
      <line key={`${prefix}wk${deg}`}
        x1={cx + wIn * c} y1={cx + wIn * s}
        x2={cx + wOut * c} y2={cx + wOut * s}
        stroke={dimColor} strokeWidth={0.4} strokeLinecap="round" />
    );
  }

  for (const deg of CARDINAL) {
    const rad = (deg - 90) * D2R;
    const px = cx + outerR * Math.cos(rad);
    const py = cx + outerR * Math.sin(rad);
    els.push(
      <g key={`${prefix}sk${deg}`} filter={glowFilter}>
        <line x1={px - starArm} y1={py} x2={px + starArm} y2={py}
          stroke={color} strokeWidth={starW} strokeLinecap="round" />
        <line x1={px} y1={py - starArm} x2={px} y2={py + starArm}
          stroke={color} strokeWidth={starW} strokeLinecap="round" />
      </g>
    );
  }

  for (const deg of INTERCARDINAL) {
    const rad = (deg - 90) * D2R;
    const px = cx + outerR * Math.cos(rad);
    const py = cx + outerR * Math.sin(rad);
    els.push(
      <polygon key={`${prefix}tp${deg}`}
        points={`${px},${(py - triSz).toFixed(1)} ${(px + triSz * 0.8).toFixed(1)},${(py + triSz * 0.5).toFixed(1)} ${(px - triSz * 0.8).toFixed(1)},${(py + triSz * 0.5).toFixed(1)}`}
        fill={dimColor}
        transform={`rotate(${deg} ${px} ${py})`} />
    );
  }

  return els;
}
