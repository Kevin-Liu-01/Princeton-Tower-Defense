"use client";
import React, { useRef, useEffect } from "react";
import { setupSpriteCanvas } from "./hooks";
import { drawRegionIcon, type RegionType } from "./regionIconDrawing";

export type { RegionType } from "./regionIconDrawing";

const REGION_FRAME_PALETTES: Record<RegionType, {
  ringLight: string; ringMid: string; ringDark: string;
  border: string; edge: string; notch: string;
  innerLight: string; innerDark: string;
}> = {
  grassland: {
    ringLight: "#8AA858", ringMid: "#6A8840", ringDark: "#4A6828",
    border: "#90B860", edge: "rgba(160,220,120,0.25)",
    notch: "#A0C868", innerLight: "#5A7838", innerDark: "#3A5020",
  },
  swamp: {
    ringLight: "#6FAFA1", ringMid: "#508878", ringDark: "#346858",
    border: "#6CBCAC", edge: "rgba(120,200,180,0.25)",
    notch: "#80C8B8", innerLight: "#446F66", innerDark: "#24443D",
  },
  desert: {
    ringLight: "#BE9B5C", ringMid: "#9A7A3C", ringDark: "#705828",
    border: "#C8A860", edge: "rgba(220,185,100,0.25)",
    notch: "#D4B468", innerLight: "#876431", innerDark: "#50381B",
  },
  winter: {
    ringLight: "#78A4C8", ringMid: "#5880A0", ringDark: "#3A5E78",
    border: "#80B0D0", edge: "rgba(140,190,240,0.25)",
    notch: "#90C0E0", innerLight: "#486C8C", innerDark: "#274158",
  },
  volcanic: {
    ringLight: "#AA5238", ringMid: "#883828", ringDark: "#602018",
    border: "#B85838", edge: "rgba(220,110,70,0.25)",
    notch: "#CC6848", innerLight: "#7A3828", innerDark: "#4A1C10",
  },
};

function drawRegionFrame(ctx: CanvasRenderingContext2D, size: number, type: RegionType, locked: boolean) {
  const p = REGION_FRAME_PALETTES[type];
  const r = size * 0.14;
  const pad = 1.5;

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, pad + 2, pad + 2.5, size - pad * 2, size - pad * 2, r);
  ctx.fill();

  const ringGrad = ctx.createLinearGradient(0, 0, size, size);
  if (locked) {
    ringGrad.addColorStop(0, "#4A4A4A");
    ringGrad.addColorStop(0.5, "#3A3A3A");
    ringGrad.addColorStop(1, "#2A2A2A");
  } else {
    ringGrad.addColorStop(0, p.ringLight);
    ringGrad.addColorStop(0.5, p.ringMid);
    ringGrad.addColorStop(1, p.ringDark);
  }
  ctx.fillStyle = ringGrad;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, r);
  ctx.fill();

  ctx.strokeStyle = locked ? "#505050" : p.border;
  ctx.lineWidth = 2;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, r);
  ctx.stroke();

  ctx.strokeStyle = locked ? "rgba(100,100,100,0.15)" : p.edge;
  ctx.lineWidth = 1;
  roundRect(ctx, pad + 2.5, pad + 2.5, size - pad * 2 - 5, size - pad * 2 - 5, r * 0.8);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, pad - 0.5, pad - 0.5, size - pad * 2 + 1, size - pad * 2 + 1, r + 0.5);
  ctx.stroke();

  if (!locked) {
    ctx.fillStyle = p.notch;
    const cx = size / 2;
    const cy = size / 2;
    const half = size / 2 - pad - 1;
    const corners = [
      [pad + 3, pad + 3], [size - pad - 3, pad + 3],
      [pad + 3, size - pad - 3], [size - pad - 3, size - pad - 3],
    ];
    for (const [nx, ny] of corners) {
      ctx.beginPath();
      ctx.arc(nx, ny, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const midpoints = [
      [cx, pad + 1], [cx, size - pad - 1],
      [pad + 1, cy], [size - pad - 1, cy],
    ];
    for (const [nx, ny] of midpoints) {
      ctx.beginPath();
      ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const inset = size * 0.15;
  const innerGrad = ctx.createLinearGradient(inset, inset, size - inset, size - inset);
  if (locked) {
    innerGrad.addColorStop(0, "#333028");
    innerGrad.addColorStop(1, "#201D18");
  } else {
    innerGrad.addColorStop(0, p.innerLight);
    innerGrad.addColorStop(1, p.innerDark);
  }
  ctx.fillStyle = innerGrad;
  roundRect(ctx, inset, inset, size - inset * 2, size - inset * 2, r * 0.55);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, inset, inset, size - inset * 2, size - inset * 2, r * 0.55);
  ctx.stroke();

  if (!locked) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, inset + 1, inset + 1, size - inset * 2 - 2, size - inset * 2 - 2, r * 0.45);
    ctx.fill();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const CHALLENGE_SIGIL_PALETTES: Record<RegionType, {
  sigilFill: string; sigilStroke: string; centerDot: string;
}> = {
  grassland: { sigilFill: "#2E7F42", sigilStroke: "#D2F7B0", centerDot: "#E7FFD6" },
  swamp:     { sigilFill: "#2D7268", sigilStroke: "#C8FFF1", centerDot: "#DBFFF8" },
  desert:    { sigilFill: "#A9782D", sigilStroke: "#FFE8AE", centerDot: "#FFF1CA" },
  winter:    { sigilFill: "#3A79A9", sigilStroke: "#D5EEFF", centerDot: "#E8F6FF" },
  volcanic:  { sigilFill: "#9D2D19", sigilStroke: "#FFD8A6", centerDot: "#FFF3CC" },
};

function drawChallengeSigil(ctx: CanvasRenderingContext2D, scale: number, type: RegionType) {
  const p = CHALLENGE_SIGIL_PALETTES[type];

  ctx.fillStyle = p.sigilFill;
  ctx.beginPath();
  ctx.moveTo(0, -11 * scale);
  ctx.lineTo(9 * scale, 0);
  ctx.lineTo(0, 11 * scale);
  ctx.lineTo(-9 * scale, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = p.sigilStroke;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.moveTo(-6.5 * scale, 6 * scale);
  ctx.lineTo(6.5 * scale, -6 * scale);
  ctx.moveTo(-6.5 * scale, -6 * scale);
  ctx.lineTo(6.5 * scale, 6 * scale);
  ctx.stroke();

  ctx.fillStyle = p.centerDot;
  ctx.beginPath();
  ctx.arc(0, 0, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export const RegionIcon: React.FC<{
  type: RegionType;
  size?: number;
  locked?: boolean;
  framed?: boolean;
  challenge?: boolean;
  sandbox?: boolean;
}> = ({ type, size = 60, locked = false, framed = false, challenge = false, sandbox = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupSpriteCanvas(canvas, size, size);
    if (!ctx) return;
    const cx = size / 2;
    const cy = size / 2;

    if (framed) {
      drawRegionFrame(ctx, size, type, locked);
    }

    if (locked && !framed) {
      ctx.globalAlpha = 0.35;
    }

    if (sandbox) {
      const s = framed ? size / 52 : size / 36;
      ctx.save();
      ctx.translate(cx, cy);
      if (locked) ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#D4A84B";
      ctx.beginPath();
      ctx.ellipse(0, 7 * s, 10 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      const bodyGrad = ctx.createLinearGradient(-6 * s, -5 * s, 6 * s, 5 * s);
      bodyGrad.addColorStop(0, "#E8C45A");
      bodyGrad.addColorStop(1, "#C49030");
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(-6 * s, -3 * s, 12 * s, 9 * s);
      ctx.fillStyle = "#D4A84B";
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * 3.5 * s - 1.2 * s, -6 * s, 2.4 * s, 3 * s);
      }
      ctx.fillStyle = "#6B4020";
      ctx.beginPath();
      ctx.arc(0, 3 * s, 2 * s, Math.PI, 0);
      ctx.lineTo(2 * s, 5.5 * s);
      ctx.lineTo(-2 * s, 5.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8B5020";
      ctx.fillRect(-0.4 * s, -10 * s, 0.8 * s, 5 * s);
      ctx.fillStyle = "#FF6830";
      ctx.beginPath();
      ctx.moveTo(0.4 * s, -10 * s);
      ctx.lineTo(5.5 * s, -9 * s);
      ctx.lineTo(5 * s, -7 * s);
      ctx.lineTo(0.4 * s, -6.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (challenge) {
      const sigScale = framed ? size / 48 : size / 32;
      ctx.save();
      ctx.translate(cx, cy);
      if (locked) ctx.globalAlpha = 0.35;
      drawChallengeSigil(ctx, sigScale, type);
      ctx.restore();
      return;
    }

    const iconScale = framed ? size / 42 : size / 28;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(iconScale, iconScale);
    drawRegionIcon(ctx, type);
    ctx.restore();
  }, [type, size, locked, framed, challenge]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};
