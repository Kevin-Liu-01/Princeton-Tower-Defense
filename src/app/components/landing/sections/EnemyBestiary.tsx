"use client";
import Image from "next/image";
import React from "react";

import { ENEMY_DATA } from "../../../constants/enemies";
import { EnemySprite } from "../../../sprites/enemies";
import type { EnemyType, MapTheme } from "../../../types";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { CardFrame } from "../CardFrame";
import { LANDING_THEME, oklchBg } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import { MapSectionHeader } from "./mapElements";
import { SpriteDisplay } from "./SpriteDisplay";

const T = LANDING_THEME;

interface BestiaryEntry {
  type: EnemyType;
  region?: MapTheme;
  threat: "boss" | "elite" | "minion";
}

const ROW_A: BestiaryEntry[] = [
  { region: "desert", threat: "boss", type: "phoenix" },
  { region: "desert", threat: "elite", type: "djinn" },
  { threat: "minion", type: "skeleton_knight" },
  { region: "swamp", threat: "boss", type: "swamp_hydra" },
  { region: "grassland", threat: "elite", type: "ancient_ent" },
  { threat: "boss", type: "lich" },
  { threat: "boss", type: "death_knight" },
  { region: "desert", threat: "elite", type: "basilisk" },
  { threat: "elite", type: "dark_knight" },
  { region: "winter", threat: "boss", type: "frost_colossus" },
  { region: "volcanic", threat: "elite", type: "volcanic_drake" },
  { threat: "boss", type: "skeleton_king" },
];

const ROW_B: BestiaryEntry[] = [
  { region: "grassland", threat: "elite", type: "giant_eagle" },
  { region: "swamp", threat: "minion", type: "marsh_troll" },
  { region: "desert", threat: "elite", type: "manticore" },
  { region: "winter", threat: "elite", type: "wendigo" },
  { region: "volcanic", threat: "elite", type: "lava_golem" },
  { threat: "elite", type: "warlock" },
  { threat: "boss", type: "doom_herald" },
  { region: "grassland", threat: "boss", type: "brood_mother" },
  { region: "winter", threat: "boss", type: "mammoth" },
  { region: "grassland", threat: "elite", type: "dire_bear" },
  { threat: "minion", type: "bone_mage" },
  { threat: "elite", type: "hellhound" },
];

const THREAT = {
  boss: { color: "#ef4444", icon: "\u2620", label: "BOSS" },
  elite: { color: "#f59e0b", icon: "\u2666", label: "ELITE" },
  minion: { color: "#6b7280", icon: "", label: "" },
} as const;

const CARD_W = 130;
const CARD_H = 158;
const SPRITE_VIS = 80;
const SPRITE_SCALE = 2.2;
const SPRITE_CANVAS = Math.round(SPRITE_VIS * SPRITE_SCALE);

function CreatureCard({ entry }: { entry: BestiaryEntry }) {
  const data = ENEMY_DATA[entry.type];
  if (!data) {
    return null;
  }

  const threat = THREAT[entry.threat];
  const isBoss = entry.threat === "boss";
  const hasBadge = entry.threat !== "minion";

  return (
    <CardFrame
      accent={data.color}
      glow={isBoss ? `${data.color}15` : undefined}
      className="flex-shrink-0 group transition-transform duration-300 hover:scale-[1.06]"
    >
      <div
        className="relative flex flex-col rounded overflow-hidden"
        style={{
          width: CARD_W,
          height: CARD_H,
          background: `linear-gradient(170deg, ${data.color}08, rgba(16,12,8,0.95) 50%)`,
          boxShadow: `inset 0 0 ${isBoss ? 24 : 16}px rgba(0,0,0,0.5)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 24px ${data.color}12` }}
        />

        <div
          className="w-full flex justify-center items-center flex-shrink-0"
          style={{
            height: 20,
            background: hasBadge
              ? `linear-gradient(180deg, ${threat.color}18, ${threat.color}06)`
              : "transparent",
            borderBottom: hasBadge
              ? `1px solid ${threat.color}25`
              : "1px solid transparent",
          }}
        >
          {hasBadge && (
            <span
              className="text-[7px] font-black uppercase tracking-[0.18em]"
              style={{
                color: threat.color,
                textShadow: `0 0 8px ${threat.color}40`,
              }}
            >
              {threat.icon} {threat.label}
            </span>
          )}
        </div>

        <div className="relative flex-1 flex items-center justify-center">
          <div
            className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${data.color}18, transparent 70%)`,
            }}
          />
          <SpriteDisplay visualSize={SPRITE_VIS} canvasScale={SPRITE_SCALE}>
            <EnemySprite
              type={entry.type}
              size={SPRITE_CANVAS}
              region={entry.region}
            />
          </SpriteDisplay>
        </div>

        <div
          className="w-full px-2 py-1.5 flex flex-col items-center gap-0.5 flex-shrink-0"
          style={{
            background: `linear-gradient(to top, ${data.color}14, transparent)`,
            borderTop: `1px solid ${data.color}12`,
          }}
        >
          <div
            className="w-8 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${data.color}40, transparent)`,
            }}
          />
          <span
            className="text-[9px] sm:text-[10px] font-bold text-center uppercase tracking-wide leading-tight w-full line-clamp-2"
            style={{
              color: "rgba(255,255,255,0.88)",
              textShadow: `0 0 10px ${data.color}50, 0 1px 3px rgba(0,0,0,0.8)`,
            }}
          >
            {data.name}
          </span>
        </div>
      </div>
    </CardFrame>
  );
}

function MarqueeRow({
  entries,
  reverse,
  speed,
}: {
  entries: BestiaryEntry[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...entries, ...entries];
  return (
    <div className="w-full" style={{ overflowX: "clip", overflowY: "visible" }}>
      <div
        className={
          reverse
            ? "animate-landing-marquee-reverse"
            : "animate-landing-marquee"
        }
        style={{
          animationDuration: speed ? `${speed}s` : undefined,
          display: "flex",
          gap: "0.75rem",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {doubled.map((entry, i) => (
          <CreatureCard key={`${entry.type}-${i}`} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export function EnemyBestiary() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/new/gameplay_volcano.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover"
          style={{
            filter: "brightness(0.25) saturate(0.5) blur(1.5px)",
            transform: "scale(1.05)",
          }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg in oklch, ${oklchBg(0.88)} 0%, ${oklchBg(0.3)} 20%, ${oklchBg(0.2)} 50%, ${oklchBg(0.3)} 80%, ${oklchBg(0.88)} 100%),
            radial-gradient(in oklch, transparent 20%, ${oklchBg(0.5)} 100%)
          `,
        }}
      />
      <div className="absolute inset-0 landing-texture-dots pointer-events-none opacity-40" />
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <OrnateFrame
          className="w-full h-full"
          cornerSize={40}
          borderVariant="compact"
        >
          <div className="w-full h-full" />
        </OrnateFrame>
      </div>

      {/* Fog effect at edges */}
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom in oklch, ${T.bgOklch}, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top in oklch, ${T.bgOklch}, transparent)`,
        }}
      />

      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader title="The Bestiary" />

        {/* Marquee rows */}
        <div className="relative space-y-5 sm:space-y-6 py-3">
          {/* Edge fades */}
          <div
            className="absolute left-0 top-0 bottom-0 w-28 sm:w-44 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right in oklch, ${T.bgOklch}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-28 sm:w-44 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left in oklch, ${T.bgOklch}, transparent)`,
            }}
          />

          <MarqueeRow entries={ROW_A} speed={38} />
          <MarqueeRow entries={ROW_B} reverse speed={44} />
        </div>

        {/* Threat legend */}
        <div className="flex justify-center gap-8 mt-10 sm:mt-12">
          {(["boss", "elite", "minion"] as const).map((t) => {
            const info = THREAT[t];
            return (
              <div key={t} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: info.color,
                    boxShadow: `0 0 8px ${info.color}40`,
                  }}
                />
                <span
                  className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: `${info.color}88` }}
                >
                  {t === "minion" ? "Common" : info.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
