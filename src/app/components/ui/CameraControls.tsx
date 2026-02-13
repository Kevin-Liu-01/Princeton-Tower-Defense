"use client";
import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftCircle,
  ArrowRightCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Position } from "../../types";
import { PANEL, GOLD, panelGradient } from "./theme";

// =============================================================================
// CAMERA CONTROLS COMPONENT
// =============================================================================

interface CameraControlsProps {
  setCameraOffset: React.Dispatch<React.SetStateAction<Position>>;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
  defaultOffset?: Position;
}

const dpadBtnStyle: React.CSSProperties = {
  background: PANEL.bgDeep,
  border: `1px solid ${GOLD.border25}`,
  boxShadow: `inset 0 0 6px ${GOLD.glow04}`,
};

export const CameraControls: React.FC<CameraControlsProps> = ({
  setCameraOffset,
  setCameraZoom,
  defaultOffset = { x: -40, y: -60 },
}) => {
  return (
    <div
      className="absolute top-2 right-2 flex flex-col gap-1.5"
      style={{ zIndex: 60 }}
    >
      {/* Camera Panel */}
      <div
        className="p-2.5 rounded-xl backdrop-blur-sm shadow-lg relative"
        style={{
          background: panelGradient,
          border: `1.5px solid ${GOLD.border30}`,
          boxShadow: `0 0 20px ${GOLD.glow07}, inset 0 0 12px ${GOLD.glow04}`,
        }}
      >
        {/* Inner ghost border */}
        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />

        <div
          className="text-[9px] text-amber-200 mb-1.5 font-bold text-center tracking-[0.15em] uppercase relative z-10"
          style={{ textShadow: `0 0 8px rgba(180,140,60,0.3)` }}
        >
          Camera
        </div>

        {/* D-pad grid */}
        <div
          className="grid grid-cols-3 gap-0.5 p-1 rounded-lg relative z-10"
          style={{
            background: PANEL.bgDeep,
            border: `1px solid ${GOLD.border25}`,
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.3)`,
          }}
        >
          <div></div>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, y: p.y + 30 }))}
            className="p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            style={dpadBtnStyle}
          >
            <ArrowUpCircle size={14} className="text-amber-400" />
          </button>
          <div></div>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, x: p.x + 30 }))}
            className="p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            style={dpadBtnStyle}
          >
            <ArrowLeftCircle size={14} className="text-amber-400" />
          </button>
          <button
            onClick={() => setCameraOffset(defaultOffset)}
            className="p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center text-amber-300 text-[10px]"
            style={dpadBtnStyle}
          >
            ●
          </button>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, x: p.x - 30 }))}
            className="p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            style={dpadBtnStyle}
          >
            <ArrowRightCircle size={14} className="text-amber-400" />
          </button>
          <div></div>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, y: p.y - 30 }))}
            className="p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            style={dpadBtnStyle}
          >
            <ArrowDownCircle size={14} className="text-amber-400" />
          </button>
          <div></div>
        </div>

        {/* Zoom buttons */}
        <div className="flex gap-1 mt-1.5 relative z-10">
          <button
            onClick={() => setCameraZoom((z) => Math.min(z + 0.15, 2.5))}
            className="flex-1 p-1.5 rounded-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            style={dpadBtnStyle}
          >
            <ZoomIn size={14} className="text-amber-400" />
          </button>
          <button
            onClick={() => setCameraZoom((z) => Math.max(z - 0.15, 0.6))}
            className="flex-1 p-1.5 rounded-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            style={dpadBtnStyle}
          >
            <ZoomOut size={14} className="text-amber-400" />
          </button>
        </div>
      </div>

      {/* Controls help panel */}
      <div
        className="hidden sm:block p-2.5 rounded-xl backdrop-blur-sm shadow-lg relative"
        style={{
          background: panelGradient,
          border: `1.5px solid ${GOLD.border25}`,
          boxShadow: `0 0 15px ${GOLD.glow07}, inset 0 0 10px ${GOLD.glow04}`,
        }}
      >
        {/* Inner ghost border */}
        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />

        <div
          className="text-[9px] text-amber-200 font-bold tracking-[0.15em] mb-1.5 text-center uppercase relative z-10"
          style={{ textShadow: `0 0 8px rgba(180,140,60,0.3)` }}
        >
          Controls
        </div>

        <div className="flex flex-col gap-1 relative z-10">
          {[
            { key: "WASD", desc: "Move Camera" },
            { key: "+/−", desc: "Zoom In / Out" },
            { key: "ESC", desc: "Unselect" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-[9px]">
              <span
                className="font-mono px-1.5 py-0.5 rounded text-amber-200 text-[8px] font-bold"
                style={{
                  background: PANEL.bgDeep,
                  border: `1px solid ${GOLD.border25}`,
                }}
              >
                {item.key}
              </span>
              <span className="text-amber-300/80">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
