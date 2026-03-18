import React from "react";

const D2R = Math.PI / 180;
const CARDINAL = [0, 90, 180, 270];
const INTERCARDINAL = [45, 135, 225, 315];
const CLOCK_ANGLES = Array.from({ length: 12 }, (_, index) => index * 30);

interface FrameOpts {
  cx: number;
  outerR: number;
  midR: number;
  color: string;
  dimColor: string;
  prefix: string;
  glowFilter?: string;
}

export function heroFrameElements(options: FrameOpts): React.ReactElement[] {
  const { cx, outerR, midR, color, dimColor, prefix, glowFilter } = options;
  const ringWidth = Math.max(0.8, outerR * 0.03);
  const chevronDepth = Math.max(3, outerR * 0.12);
  const chevronSpread = Math.max(2.5, outerR * 0.1);
  const chevronWidth = Math.max(1, outerR * 0.04);
  const studRadius = Math.max(1.5, outerR * 0.065);
  const dashLength = Math.max(6, outerR * 0.22);

  const elements: React.ReactElement[] = [
    <circle key={`${prefix}or`} cx={cx} cy={cx} r={outerR} fill="none" stroke={color} strokeWidth={ringWidth} />,
    <circle
      key={`${prefix}ir`}
      cx={cx}
      cy={cx}
      r={midR}
      fill="none"
      stroke={dimColor}
      strokeWidth={0.5}
      strokeDasharray={`${dashLength.toFixed(1)} 3`}
    />,
  ];

  for (const degree of CARDINAL) {
    const radians = (degree - 90) * D2R;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const perpCos = -sin;
    const perpSin = cos;
    const tipX = cx + (outerR + 1) * cos;
    const tipY = cx + (outerR + 1) * sin;
    const baseRadius = outerR - chevronDepth;
    const leftX = cx + baseRadius * cos + chevronSpread * perpCos;
    const leftY = cx + baseRadius * sin + chevronSpread * perpSin;
    const rightX = cx + baseRadius * cos - chevronSpread * perpCos;
    const rightY = cx + baseRadius * sin - chevronSpread * perpSin;

    elements.push(
      <path
        key={`${prefix}cv${degree}`}
        d={`M${leftX.toFixed(1)},${leftY.toFixed(1)} L${tipX.toFixed(1)},${tipY.toFixed(1)} L${rightX.toFixed(1)},${rightY.toFixed(1)}`}
        fill="none"
        stroke={color}
        strokeWidth={chevronWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={glowFilter}
      />,
    );
  }

  for (const degree of INTERCARDINAL) {
    const radians = (degree - 90) * D2R;
    elements.push(
      <circle
        key={`${prefix}sd${degree}`}
        cx={cx + outerR * Math.cos(radians)}
        cy={cx + outerR * Math.sin(radians)}
        r={studRadius}
        fill={dimColor}
      />,
    );
  }

  return elements;
}

export function spellFrameElements(options: FrameOpts): React.ReactElement[] {
  const { cx, outerR, midR, color, dimColor, prefix, glowFilter } = options;
  const dotWidth = Math.max(1, outerR * 0.04);
  const dotGap = Math.max(3.5, outerR * 0.13);
  const whiskerInner = midR - Math.max(2, outerR * 0.06);
  const whiskerOuter = outerR - 1;
  const starArm = Math.max(2.5, outerR * 0.1);
  const starWidth = Math.max(0.7, outerR * 0.03);
  const triangleSize = Math.max(1.5, outerR * 0.06);

  const elements: React.ReactElement[] = [
    <circle
      key={`${prefix}dr`}
      cx={cx}
      cy={cx}
      r={outerR}
      fill="none"
      stroke={color}
      strokeWidth={dotWidth}
      strokeDasharray={`0 ${dotGap.toFixed(1)}`}
      strokeLinecap="round"
    />,
  ];

  for (const degree of CLOCK_ANGLES) {
    const radians = (degree - 90) * D2R;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    elements.push(
      <line
        key={`${prefix}wk${degree}`}
        x1={cx + whiskerInner * cos}
        y1={cx + whiskerInner * sin}
        x2={cx + whiskerOuter * cos}
        y2={cx + whiskerOuter * sin}
        stroke={dimColor}
        strokeWidth={0.4}
        strokeLinecap="round"
      />,
    );
  }

  for (const degree of CARDINAL) {
    const radians = (degree - 90) * D2R;
    const pointX = cx + outerR * Math.cos(radians);
    const pointY = cx + outerR * Math.sin(radians);
    elements.push(
      <g key={`${prefix}sk${degree}`} filter={glowFilter}>
        <line x1={pointX - starArm} y1={pointY} x2={pointX + starArm} y2={pointY} stroke={color} strokeWidth={starWidth} strokeLinecap="round" />
        <line x1={pointX} y1={pointY - starArm} x2={pointX} y2={pointY + starArm} stroke={color} strokeWidth={starWidth} strokeLinecap="round" />
      </g>,
    );
  }

  for (const degree of INTERCARDINAL) {
    const radians = (degree - 90) * D2R;
    const pointX = cx + outerR * Math.cos(radians);
    const pointY = cx + outerR * Math.sin(radians);
    elements.push(
      <polygon
        key={`${prefix}tp${degree}`}
        points={`${pointX},${(pointY - triangleSize).toFixed(1)} ${(pointX + triangleSize * 0.8).toFixed(1)},${(pointY + triangleSize * 0.5).toFixed(1)} ${(pointX - triangleSize * 0.8).toFixed(1)},${(pointY + triangleSize * 0.5).toFixed(1)}`}
        fill={dimColor}
        transform={`rotate(${degree} ${pointX} ${pointY})`}
      />,
    );
  }

  return elements;
}
