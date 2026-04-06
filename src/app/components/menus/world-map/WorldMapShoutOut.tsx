"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { GOLD, panelGradient } from "../../ui/system/theme";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { SITE_URL } from "../../../seo/constants";

const SHARE_TEXT = `@kevskgs made a fire free browser TD game with 25+ levels, 5 heroes, and spells ⚔️🏰🐅\n\nTry it out 👇`;

const SHARE_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  SHARE_TEXT
)}&url=${encodeURIComponent(`${SITE_URL}/`)}&hashtags=${encodeURIComponent(
  "gamedev,indiegame,towerdefense,princeton"
)}`;

const BG_IMAGE = "/images/new/gameplay_grounds.png";

export function WorldMapShoutOut() {
  return (
    <div className="hidden xl:block flex-shrink-0 pt-3 pb-3">
      <OrnateFrame
        className="rounded-xl shadow-xl overflow-hidden"
        style={{ border: `1.5px solid ${GOLD.border25}` }}
        cornerSize={20}
        showBorders={true}
        showSideBorders={true}
        sideBorderVariant="compact"
        showTopBottomBorders={false}
      >
        <a
          href={SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden"
          style={{
            background: panelGradient,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{
              backgroundImage: `url(${BG_IMAGE})`,
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,14,8,0.82) 0%, rgba(40,28,16,0.65) 50%, rgba(20,14,8,0.80) 100%)",
            }}
          />

          <div className="relative flex flex-col items-center justify-center gap-1.5 px-4 py-[1.25rem]">
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{
                background:
                  "linear-gradient(180deg, #fde68a 0%, #d4a84a 60%, #92400e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Enjoying the game?
            </span>

            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white/90 group-hover:text-white transition-colors"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span
                className="text-sm font-bold tracking-wide group-hover:brightness-125 transition-all"
                style={{
                  color: "#fde68a",
                  textShadow:
                    "0 1px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,200,60,0.2)",
                }}
              >
                Shout Us Out!
              </span>
              <ExternalLink
                size={12}
                className="text-amber-400/60 group-hover:text-amber-400 transition-colors"
              />
            </div>

            <span className="text-[8px] text-amber-200/40 font-medium tracking-wide">
              Share on X / Twitter
            </span>
          </div>

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 20px ${GOLD.glow07}`,
            }}
          />
        </a>
      </OrnateFrame>
    </div>
  );
}
