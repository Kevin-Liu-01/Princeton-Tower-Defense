"use client";
import React, { useState, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Gamepad2,
  ChevronUp,
  Camera,
  X as XIcon,
} from "lucide-react";
import type { Position } from "../../types";
import { PANEL, GOLD, panelGradient } from "./system/theme";
import { useSettings } from "../../hooks/useSettings";

// =============================================================================
// CAMERA CONTROLS — Compact, unified floating HUD
// =============================================================================

interface CameraControlsProps {
  setCameraOffset: React.Dispatch<React.SetStateAction<Position>>;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
  defaultOffset?: Position;
}

const MOVE_STEP = 30;
const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;

interface DpadButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  keyHint: string;
  className?: string;
}

function DpadButton({ onClick, icon, keyHint, className = "" }: DpadButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center gap-px rounded-lg transition-all
        hover:brightness-150 hover:scale-110 active:scale-90 ${className}`}
      style={{
        width: 32,
        height: 34,
        background: PANEL.bgDeep,
        border: `1px solid ${GOLD.border25}`,
        boxShadow: `inset 0 0 4px ${GOLD.glow04}`,
      }}
    >
      <span className="text-amber-400 group-hover:text-amber-300 mt-0.5">{icon}</span>
      <span className="text-[7px] font-mono font-bold text-amber-500/40 group-hover:text-amber-400/60 leading-none -mt-px">
        {keyHint}
      </span>
    </button>
  );
}

interface KeyBadgeProps {
  label: string;
}

function KeyBadge({ label }: KeyBadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-mono text-[8px] font-bold text-amber-300/70 shrink-0"
      style={{
        background: PANEL.bgDeep,
        border: `1px solid ${GOLD.border25}`,
        minWidth: 24,
      }}
    >
      {label}
    </span>
  );
}

interface ShortcutRowProps {
  keyLabel: string;
  description: string;
}

function ShortcutRow({ keyLabel, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      <KeyBadge label={keyLabel} />
      <span className="text-[9px] text-amber-400/60">{description}</span>
    </div>
  );
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  setCameraOffset,
  setCameraZoom,
  defaultOffset = { x: -40, y: -60 },
}) => {
  const { settings } = useSettings();
  const showDpad = settings.ui.showCameraDpad;
  const showControls = settings.ui.showControlsReference;
  const [expanded, setExpanded] = useState(false);

  const moveUp = useCallback(() => setCameraOffset((p) => ({ ...p, y: p.y + MOVE_STEP })), [setCameraOffset]);
  const moveDown = useCallback(() => setCameraOffset((p) => ({ ...p, y: p.y - MOVE_STEP })), [setCameraOffset]);
  const moveLeft = useCallback(() => setCameraOffset((p) => ({ ...p, x: p.x + MOVE_STEP })), [setCameraOffset]);
  const moveRight = useCallback(() => setCameraOffset((p) => ({ ...p, x: p.x - MOVE_STEP })), [setCameraOffset]);
  const resetCamera = useCallback(() => setCameraOffset(defaultOffset), [setCameraOffset, defaultOffset]);
  const zoomIn = useCallback(() => setCameraZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX)), [setCameraZoom]);
  const zoomOut = useCallback(() => setCameraZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN)), [setCameraZoom]);

  if (!showDpad && !showControls) return null;

  if (!expanded) {
    return (
      <div className="pointer-events-auto hidden sm:block">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
          style={{
            background: panelGradient,
            border: `1.5px solid ${GOLD.border25}`,
            boxShadow: `0 0 12px ${GOLD.glow07}, inset 0 0 6px ${GOLD.glow04}`,
          }}
          title="Show camera & controls"
        >
          <Gamepad2 size={13} className="text-amber-400/80" />
          <ChevronUp size={11} className="text-amber-500/50" />
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto hidden sm:block">
      <div
        className="rounded-xl backdrop-blur-sm shadow-lg relative overflow-hidden"
        style={{
          background: panelGradient,
          border: `1.5px solid ${GOLD.border30}`,
          boxShadow: `0 0 20px ${GOLD.glow07}, inset 0 0 12px ${GOLD.glow04}`,
          minWidth: 160,
        }}
      >
        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1 relative z-10">
          <div className="flex items-center gap-1.5">
            <Gamepad2 size={11} className="text-amber-400/60" />
            <span
              className="text-[9px] text-amber-200/90 font-bold tracking-[0.15em] uppercase"
              style={{ textShadow: "0 0 8px rgba(180,140,60,0.3)" }}
            >
              Controls
            </span>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="p-0.5 rounded-md transition-all hover:bg-amber-800/30"
            title="Collapse"
          >
            <XIcon size={10} className="text-amber-500/60 hover:text-amber-300" />
          </button>
        </div>

        {/* Camera D-pad */}
        {showDpad && (
          <div className="px-2.5 pb-1.5 relative z-10">
            <div
              className="p-1.5 rounded-lg"
              style={{
                background: PANEL.bgDeep,
                border: `1px solid ${GOLD.border25}`,
                boxShadow: "inset 0 0 8px rgba(0,0,0,0.3)",
              }}
            >
              {/* Cross-shaped D-pad */}
              <div className="flex flex-col items-center gap-0.5">
                <DpadButton onClick={moveUp} icon={<ArrowUp size={12} />} keyHint="W" />
                <div className="flex items-center gap-0.5">
                  <DpadButton onClick={moveLeft} icon={<ArrowLeft size={12} />} keyHint="A" />
                  <button
                    onClick={resetCamera}
                    className="flex items-center justify-center rounded-lg transition-all hover:brightness-150 hover:scale-110 active:scale-90"
                    style={{
                      width: 32,
                      height: 34,
                      background: "rgba(180,140,60,0.08)",
                      border: `1px solid ${GOLD.border25}`,
                    }}
                    title="Reset camera"
                  >
                    <RotateCcw size={10} className="text-amber-500/50" />
                  </button>
                  <DpadButton onClick={moveRight} icon={<ArrowRight size={12} />} keyHint="D" />
                </div>
                <DpadButton onClick={moveDown} icon={<ArrowDown size={12} />} keyHint="S" />
              </div>

              {/* Zoom row */}
              <div className="flex items-center gap-1 mt-1.5 pt-1.5" style={{ borderTop: `1px solid ${GOLD.border25}` }}>
                <button
                  onClick={zoomOut}
                  className="flex-1 flex items-center justify-center py-1 rounded-md transition-all hover:brightness-150 active:scale-95"
                  style={{ background: PANEL.bgDeep, border: `1px solid ${GOLD.border25}` }}
                  title="Zoom out (−)"
                >
                  <ZoomOut size={12} className="text-amber-400" />
                </button>
                <span className="text-[7px] font-mono text-amber-500/40 px-0.5">scroll</span>
                <button
                  onClick={zoomIn}
                  className="flex-1 flex items-center justify-center py-1 rounded-md transition-all hover:brightness-150 active:scale-95"
                  style={{ background: PANEL.bgDeep, border: `1px solid ${GOLD.border25}` }}
                  title="Zoom in (+)"
                >
                  <ZoomIn size={12} className="text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts */}
        {showControls && (
          <div
            className="px-2.5 pb-2 relative z-10"
            style={showDpad ? { paddingTop: 2 } : { paddingTop: 0 }}
          >
            {showDpad && (
              <div className="mb-1.5" style={{ borderTop: `1px solid ${GOLD.innerBorder08}` }} />
            )}
            <div className="flex flex-col gap-1">
              <ShortcutRow keyLabel="ESC" description="Deselect" />
              <ShortcutRow keyLabel="F2" description="Photo Mode" />
              {!showDpad && (
                <>
                  <ShortcutRow keyLabel="WASD" description="Move Camera" />
                  <ShortcutRow keyLabel="+/−" description="Zoom" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
