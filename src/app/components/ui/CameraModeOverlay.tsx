"use client";
import { Camera, X } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

// =============================================================================
// CAMERA MODE OVERLAY
// Minimal HUD shown during camera/photo mode — just controls + shutter flash.
// =============================================================================

interface CameraModeOverlayProps {
  onCapture: () => Promise<boolean>;
  onExit: () => void;
}

export const CameraModeOverlay: React.FC<CameraModeOverlayProps> = ({
  onCapture,
  onExit,
}) => {
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (capturing) {
      return;
    }
    setCapturing(true);
    const ok = await onCapture();
    if (ok) {
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }
    setCapturing(false);
  }, [onCapture, capturing]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCapture();
      }
      if (e.key === "Escape" || e.key === "F2") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleCapture, onExit]);

  return (
    <>
      {/* Shutter flash */}
      {flash && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            animation: "flashFade 200ms ease-out forwards",
            background: "rgba(255,255,255,0.85)",
            zIndex: 9999,
          }}
        />
      )}

      {/* Top bar with exit + instructions */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl"
        style={{
          backdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.15)",
          zIndex: 500,
        }}
      >
        <Camera size={16} className="text-white/80" />
        <span className="text-white/90 text-xs font-medium tracking-wide">
          Photo Mode
        </span>
        <span className="text-white/50 text-[10px] mx-1">|</span>
        <span className="text-white/60 text-[10px]">
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[9px]">
            Space
          </kbd>{" "}
          or{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[9px]">
            Enter
          </kbd>{" "}
          to capture
        </span>
        <span className="text-white/50 text-[10px] mx-1">|</span>
        <span className="text-white/60 text-[10px]">
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[9px]">
            Esc
          </kbd>{" "}
          to exit
        </span>
        <button
          onClick={onExit}
          className="ml-2 p-1 rounded-md hover:bg-white/10 transition-colors"
          title="Exit photo mode"
        >
          <X size={14} className="text-white/70" />
        </button>
      </div>

      {/* Bottom capture button */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        style={{ zIndex: 500 }}
      >
        <button
          onClick={handleCapture}
          disabled={capturing}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{
            backdropFilter: "blur(8px)",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow: "0 0 20px rgba(255,255,255,0.1)",
          }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center group-hover:border-white transition-colors">
            <div className="w-6 h-6 rounded-full bg-white/90 group-hover:bg-white transition-colors" />
          </div>
          <span className="text-white/90 text-sm font-medium">Capture</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes flashFade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};
