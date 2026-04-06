"use client";
import React, { useRef, useEffect, useState, lazy, Suspense } from "react";
import Image from "next/image";
import { MapPin, Lock, Clapperboard } from "lucide-react";
import { PANEL, GOLD, NEUTRAL, SELECTED, dividerGradient, panelGradient } from "../ui/system/theme";

const BattlefieldPreviewCanvas = lazy(
  () =>
    import("./BattlefieldPreviewCanvas").then((m) => ({
      default: m.BattlefieldPreviewCanvas,
    }))
);

const SLIDESHOW_IMAGES = [
  "/images/new/gameplay_grounds.png",
  "/images/new/gameplay_desert.png",
  "/images/new/gameplay_swamp.png",
  "/images/new/gameplay_winter.png",
  "/images/new/gameplay_volcano.png",
];

const CYCLE_INTERVAL_MS = 6000;

export const BattlefieldPreview: React.FC<{
  animTime: number;
  onSelectFarthestLevel?: () => void;
}> = ({ animTime, onSelectFarthestLevel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCanvasAnimation, setShowCanvasAnimation] = useState(false);

  useEffect(() => {
    const idx =
      Math.floor(animTime / (CYCLE_INTERVAL_MS / 1000)) %
      SLIDESHOW_IMAGES.length;
    setCurrentIndex(idx);
  }, [animTime]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex h-full flex-col items-center justify-center text-center relative overflow-hidden"
    >
      <div className="relative z-10 w-full h-full overflow-hidden">
        {showCanvasAnimation ? (
          <Suspense
            fallback={
              <div className="absolute inset-0 bg-[#0a0806] flex items-center justify-center">
                <span className="text-amber-400/60 text-xs animate-pulse">
                  Loading animation...
                </span>
              </div>
            }
          >
            <BattlefieldPreviewCanvas animTime={animTime} />
          </Suspense>
        ) : (
          <>
            {/* Background image slideshow */}
            {SLIDESHOW_IMAGES.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover object-center transition-opacity duration-1000 pointer-events-none"
                style={{ opacity: i === currentIndex ? 0.65 : 0 }}
                priority={i === 0}
              />
            ))}

            {/* Warm panel gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: panelGradient, opacity: 0.55 }}
            />
            {/* Radial vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, transparent 30%, ${PANEL.bgDark} 95%)`,
              }}
            />
          </>
        )}

        <div
          className="relative flex w-full items-center justify-center backdrop-blur-xs p-4 sm:p-8 h-full overflow-hidden"

        >
          {/* Inner ghost border */}
          <div
            className="absolute inset-[3px] rounded-[14px] pointer-events-none z-10"
            style={{ border: `1px solid ${GOLD.innerBorder10}` }}
          />

          <div className="flex flex-col items-center relative z-20">
            {/* Decorative top flourish */}
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-px"
              style={{ background: dividerGradient }}
            />

            <button
              onClick={onSelectFarthestLevel}
              className="size-14 sm:size-24 rounded-full flex items-center justify-center mb-2 sm:mb-4 backdrop-blur-sm hover:scale-110 transition-all cursor-pointer active:scale-95 group relative"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `2px solid ${GOLD.border35}`,
                boxShadow: `0 0 20px ${GOLD.glow07}, inset 0 0 12px ${GOLD.glow04}`,
              }}
            >
              <div
                className="absolute inset-[3px] rounded-full pointer-events-none"
                style={{ border: `1px solid ${GOLD.innerBorder10}` }}
              />
              <MapPin
                size={28}
                className="sm:hidden text-amber-400 drop-shadow-lg group-hover:text-amber-200 transition-colors"
              />
              <MapPin
                size={40}
                className="hidden sm:block text-amber-400 drop-shadow-lg group-hover:text-amber-200 transition-colors"
              />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-amber-100 mb-1 sm:mb-2 drop-shadow-lg tracking-wide">
              Defend the Realm!
            </h3>
            <p className="text-amber-400/80 text-xs sm:text-sm max-w-xs drop-shadow-md leading-relaxed text-center">
              Tap the pin above or any unlocked location on the map to begin
              your campaign!
            </p>

            {/* Decorative divider */}
            <div className="my-3 sm:my-5 flex items-center gap-3 w-full max-w-[200px]">
              <div
                className="flex-1 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${GOLD.border30})`,
                }}
              />
              <div
                className="w-2 h-2 rotate-45"
                style={{
                  background: GOLD.border35,
                  border: `1px solid ${GOLD.accentBorder40}`,
                }}
              />
              <div
                className="flex-1 h-px"
                style={{
                  background: `linear-gradient(90deg, ${GOLD.border30}, transparent)`,
                }}
              />
            </div>

            {/* Legend items */}
            <div className="flex items-center gap-3 text-xs text-amber-300">
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`,
                  border: `1.5px solid ${GOLD.accentBorder40}`,
                  boxShadow: `0 0 8px ${GOLD.accentGlow08}`,
                }}
              />
              <span className="font-medium tracking-wide">
                = Unlocked Location
              </span>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center gap-3 text-xs text-amber-300/70">
              <div
                className="w-4 h-4 flex items-center justify-center rounded-full animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                  border: `1.5px solid ${NEUTRAL.border}`,
                  boxShadow: `0 0 6px ${NEUTRAL.glow}`,
                }}
              >
                <Lock size={10} className="text-gray-400" />
              </div>
              <span className="font-medium tracking-wide">
                = Locked Location
              </span>
            </div>

            {/* Decorative bottom flourish */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-px"
              style={{ background: dividerGradient }}
            />
          </div>
        </div>

        {/* Easter egg: toggle live canvas animation */}
        <button
          onClick={() => setShowCanvasAnimation((v) => !v)}
          className="absolute bottom-2 right-2 z-30 p-1.5 rounded-md transition-all hover:scale-110 opacity-20 hover:opacity-80"
          style={{
            background: "rgba(20,16,12,0.6)",
            border: "1px solid rgba(180,140,60,0.15)",
          }}
          title="Toggle live animation"
        >
          <Clapperboard
            size={12}
            className={
              showCanvasAnimation ? "text-amber-300" : "text-amber-600/60"
            }
          />
        </button>
      </div>
    </div>
  );
};
