"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { GOLD, dividerGradient, panelGradient } from "../../ui/system/theme";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { SITE_URL } from "../../../seo/constants";

const SHARE_TEXT = `@kevskgs made a fire free browser TD game with 26 levels, 9 heroes, and spells ⚔️🏰🐅\n\nTry it out 👇`;

const SHARE_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  SHARE_TEXT
)}&url=${encodeURIComponent(`${SITE_URL}/`)}&hashtags=${encodeURIComponent(
  "gamedev,indiegame,towerdefense,princeton"
)}`;

const BG_IMAGE = "/images/new/gameplay_grounds.png";

interface WorldMapShoutOutProps {
  visible?: boolean;
}

export function WorldMapShoutOut({ visible = true }: WorldMapShoutOutProps) {
  return (
    <div
      className="hidden xl:block flex-shrink-0 pt-3 pb-3 transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
      }}
    >
      <OrnateFrame
        className="rounded-xl shadow-xl overflow-hidden"
        style={{ border: `2px solid ${GOLD.border30}` }}
        cornerSize={20}
        borderVariant="compact"
        showBorders={true}
        showSideBorders={true}
        showTopBottomBorders={false}
      >
        <a
          href={SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden"
          style={{
            background: panelGradient,
            boxShadow: `inset 0 0 20px ${GOLD.glow04}`,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${BG_IMAGE})` }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-px opacity-50"
            style={{ background: dividerGradient }}
          />

          <div className="relative flex flex-col items-center justify-center gap-1.5 px-4 py-[1.15rem]">
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{
                background:
                  "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #92400e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Enjoying the game?
            </span>

            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 transition-colors"
                style={{ color: "#fcd34d" }}
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span
                className="text-sm font-bold tracking-wide group-hover:brightness-125 transition-all"
                style={{
                  color: "#fcd34d",
                  textShadow: "0 0 10px rgba(252,211,77,0.15)",
                }}
              >
                Shout Us Out!
              </span>
              <ExternalLink
                size={12}
                className="text-amber-500/50 group-hover:text-amber-400 transition-colors"
              />
            </div>

            <span className="text-[8px] font-medium tracking-wide text-amber-500/50">
              Share on X / Twitter
            </span>
          </div>

          <div
            className="h-px opacity-40"
            style={{ background: dividerGradient }}
          />

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
