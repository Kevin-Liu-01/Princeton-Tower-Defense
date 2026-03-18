"use client";

import Link from "next/link";
import Image from "next/image";
import { OrnateFrame } from "@/app/components/ui/primitives/OrnateFrame";
import PrincetonTDLogo from "@/app/components/ui/primitives/PrincetonTDLogo";
import { GOLD, dividerGradient, panelGradient } from "@/app/components/ui/system/theme";
import { SCREENSHOTS, SCREENSHOT_LABELS } from "@/app/constants/notFoundScreenshots";

export default function NotFound() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/new/gameplay_grounds_ui.png"
          alt=""
          fill
          className="object-cover"
          style={{
            opacity: 0.15,
            filter: "blur(3px) saturate(0.6)",
          }}
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 70%)",
          }}
        />
      </div>

      <OrnateFrame
        className="fixed inset-0 z-10 h-screen w-screen"
        cornerSize={56}
        cornerVariant="standard"
        borderVariant="standard"
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center px-6 py-8 sm:px-10 sm:py-10"
          style={{
            background: panelGradient,
            border: `1px solid ${GOLD.border30}`,
            boxShadow: `0 0 40px ${GOLD.glow04}, inset 0 1px 0 ${GOLD.innerBorder08}`,
          }}
        >
          <div className="flex flex-col items-center gap-5 max-w-2xl w-full">
            <PrincetonTDLogo size="h-20 w-20 sm:h-24 sm:w-24" />

            <div className="flex flex-col items-center gap-1">
              <h1
                className="text-6xl sm:text-7xl font-black tracking-wider"
                style={{
                  background:
                    "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter:
                    "drop-shadow(0 2px 8px rgba(245,158,11,0.4)) drop-shadow(0 0 20px rgba(251,191,36,0.2))",
                }}
              >
                404
              </h1>
              <p
                className="text-lg sm:text-xl font-semibold tracking-wide text-center"
                style={{ color: "rgba(253,230,138,0.9)" }}
              >
                This realm does not exist
              </p>
            </div>

            <div
              className="w-4/5 h-px my-1"
              style={{ background: dividerGradient }}
            />

            <p
              className="text-sm sm:text-base text-center leading-relaxed max-w-md"
              style={{ color: "rgba(217,180,120,0.7)" }}
            >
              The path you seek has been lost to the mists. Perhaps the enemy
              has overrun this route&mdash;return to the battlefield and defend
              Princeton!
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mt-2">
              {SCREENSHOTS.map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-video rounded-lg overflow-hidden"
                  style={{
                    border: `1px solid ${GOLD.innerBorder12}`,
                    boxShadow: `0 0 8px ${GOLD.glow04}`,
                  }}
                >
                  <Image
                    src={src}
                    alt={SCREENSHOT_LABELS[i]}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 30vw, 180px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)",
                    }}
                  />
                  <span
                    className="absolute bottom-1 left-1.5 text-[10px] sm:text-xs font-medium"
                    style={{ color: "rgba(253,230,138,0.75)" }}
                  >
                    {SCREENSHOT_LABELS[i]}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="w-4/5 h-px my-1"
              style={{ background: dividerGradient }}
            />

            <Link
              href="/"
              className="group relative mt-1 px-8 py-3 rounded-lg font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(180deg, rgba(180,130,30,0.92) 0%, rgba(120,78,15,0.95) 100%)",
                color: "rgba(41, 24, 8, 0.96)",
                textShadow: "0 1px 0 rgba(255, 235, 180, 0.18)",
                border: `1px solid ${GOLD.border35}`,
                boxShadow: `0 0 12px ${GOLD.glow07}, 0 4px 12px rgba(0,0,0,0.4)`,
              }}
            >
              Return to Battle
            </Link>

            <p
              className="text-xs tracking-wider uppercase mt-2"
              style={{ color: "rgba(180,140,60,0.35)" }}
            >
              Princeton Tower Defense
            </p>
          </div>
        </div>
      </OrnateFrame>
    </div>
  );
}
