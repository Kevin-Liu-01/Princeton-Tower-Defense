import { headers } from "next/headers";

import { SITE_URL, GAME_STATS } from "./constants";

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_ALT =
  "Princeton Tower Defense - Free Browser Tower Defense Game with 26 Levels, 9 Heroes, and 100+ Enemies";

export async function getBaseUrl(): Promise<string> {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  try {
    const headersList = await headers();
    const host = headersList.get("host");
    if (host) {
      const protocol = host.includes("localhost") ? "http" : "https";
      return `${protocol}://${host}`;
    }
  } catch {
    /* headers() unavailable outside request context */
  }

  return SITE_URL;
}

export async function getOGFonts(baseUrl: string) {
  const [bold, regular] = await Promise.all([
    fetch(`${baseUrl}/fonts/bc-novatica-cyr/BCNovaticaCyr-Bold.ttf`).then(
      (r) => r.arrayBuffer(),
    ),
    fetch(`${baseUrl}/fonts/bc-novatica-cyr/BCNovaticaCyr-Regular.ttf`).then(
      (r) => r.arrayBuffer(),
    ),
  ]);
  return [
    {
      name: "bc-novatica-cyr",
      data: bold,
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      name: "bc-novatica-cyr",
      data: regular,
      style: "normal" as const,
      weight: 400 as const,
    },
  ];
}

const W = 1200;
const H = 630;
const FC = "#b48c3c";
const FG = "#d4a84a";
const CS = 56;
const FONT = "bc-novatica-cyr, sans-serif";

const TOWERS = [
  "cannon",
  "library",
  "lab",
  "arch",
  "club",
  "station",
  "mortar",
] as const;

const CORNER_SVG = (
  <svg viewBox="0 0 70 70" width={CS} height={CS}>
    <path
      d="M0 0 L0 52 Q5 47 10 44 Q16 41 22 40 L22 22 L40 22 Q41 16 44 10 Q47 5 52 0 Z"
      fill="rgba(180,140,60,0.15)"
      stroke={FC}
      strokeWidth="1.8"
    />
    <path
      d="M2 2 L2 40 Q7 36 14 34 L14 14 L34 14 Q36 7 40 2 Z"
      fill="none"
      stroke={FC}
      strokeWidth="1"
      opacity="0.5"
    />
    <path
      d="M5 30 Q9 26 16 23 Q23 20 30 18"
      fill="none"
      stroke={FG}
      strokeWidth="2"
      opacity="0.8"
    />
    <path
      d="M30 5 Q26 9 23 16 Q20 23 18 30"
      fill="none"
      stroke={FG}
      strokeWidth="2"
      opacity="0.8"
    />
    <path d="M9 9 L14 3 L19 9 L14 15 Z" fill={FG} opacity="0.9" />
    <path d="M24 6 L26 4 L28 6 L26 8 Z" fill={FG} opacity="0.6" />
    <path d="M6 24 L4 26 L6 28 L8 26 Z" fill={FG} opacity="0.6" />
    <circle cx="34" cy="10" r="1.8" fill={FG} opacity="0.7" />
    <circle cx="10" cy="34" r="1.8" fill={FG} opacity="0.7" />
  </svg>
);

const CORNERS = [
  { x: 0, y: 0, r: 0 },
  { x: W - CS, y: 0, r: 90 },
  { x: W - CS, y: H - CS, r: 180 },
  { x: 0, y: H - CS, r: 270 },
] as const;

function renderFrame(): React.ReactElement {
  const grad = `${FC}90`;
  const hLine = `linear-gradient(90deg, transparent, ${grad}, ${FC}, ${grad}, transparent)`;
  const vLine = `linear-gradient(180deg, transparent, ${grad}, ${FC}, ${grad}, transparent)`;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        display: "flex",
      }}
    >
      {/* Outer border */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          width: W - 20,
          height: H - 20,
          display: "flex",
          border: "1.5px solid rgba(180,140,60,0.45)",
        }}
      />
      {/* Inner border */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: W - 32,
          height: H - 32,
          display: "flex",
          border: "1px solid rgba(180,140,60,0.18)",
        }}
      />

      {/* Top border accent */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: CS,
          width: W - CS * 2,
          height: 2,
          display: "flex",
          background: hLine,
        }}
      />
      {/* Bottom border accent */}
      <div
        style={{
          position: "absolute",
          top: H - 12,
          left: CS,
          width: W - CS * 2,
          height: 2,
          display: "flex",
          background: hLine,
        }}
      />
      {/* Left border accent */}
      <div
        style={{
          position: "absolute",
          left: 10,
          top: CS,
          width: 2,
          height: H - CS * 2,
          display: "flex",
          background: vLine,
        }}
      />
      {/* Right border accent */}
      <div
        style={{
          position: "absolute",
          left: W - 12,
          top: CS,
          width: 2,
          height: H - CS * 2,
          display: "flex",
          background: vLine,
        }}
      />

      {/* Center diamonds top + bottom */}
      <div
        style={{
          position: "absolute",
          top: 3,
          left: W / 2 - 7,
          width: 14,
          height: 14,
          display: "flex",
          transform: "rotate(45deg)",
          background: "rgba(212,168,74,0.25)",
          border: `1.5px solid ${FC}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: H - 18,
          left: W / 2 - 7,
          width: 14,
          height: 14,
          display: "flex",
          transform: "rotate(45deg)",
          background: "rgba(212,168,74,0.25)",
          border: `1.5px solid ${FC}`,
        }}
      />

      {/* Ornate corner SVGs */}
      {CORNERS.map((c) => (
        <div
          key={`${c.x}-${c.y}`}
          style={{
            position: "absolute",
            top: c.y,
            left: c.x,
            width: CS,
            height: CS,
            display: "flex",
            transform: `rotate(${c.r}deg)`,
          }}
        >
          {CORNER_SVG}
        </div>
      ))}
    </div>
  );
}

export function renderOGImage(baseUrl: string): React.ReactElement {
  const bgUrl = `${baseUrl}/images/new/gameplay_grounds.png`;
  const logoUrl = `${baseUrl}/images/og-thumbs/logo.png`;

  const stats = [
    { v: String(GAME_STATS.levels), l: "Levels" },
    { v: `${GAME_STATS.enemyTypes}+`, l: "Enemies" },
    { v: String(GAME_STATS.heroes), l: "Heroes" },
    { v: String(GAME_STATS.towers), l: "Towers" },
  ];

  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#06060a",
        fontFamily: FONT,
      }}
    >
      {/* Background gameplay image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgUrl}
        width={W}
        height={H}
        alt=""
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.95 }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: "flex",
          background:
            "radial-gradient(ellipse 100% 90% at 50% 45%, rgba(6,6,10,0.1) 0%, rgba(6,6,10,0.65) 80%)",
        }}
      />

      {/* Dark band behind content for readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: "flex",
          background:
            "linear-gradient(180deg, rgba(6,6,10,0.5) 0%, rgba(6,6,10,0.35) 30%, rgba(6,6,10,0.2) 50%, rgba(6,6,10,0.4) 70%, rgba(6,6,10,0.7) 100%)",
        }}
      />

      {/* Ornate frame */}
      {renderFrame()}

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "36px 40px",
          gap: 24,
          position: "relative",
        }}
      >
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} width={100} height={100} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 700,
                color: "#fbbf24",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                fontFamily: FONT,
              }}
            >
              PRINCETON
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 700,
                color: "#e4e4e7",
                lineHeight: 1,
                letterSpacing: "0.24em",
                marginTop: 6,
                fontFamily: FONT,
              }}
            >
              TOWER DEFENSE
            </div>
          </div>
        </div>

        {/* Tower sprites row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {TOWERS.map((tower) => (
            <div
              key={tower}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 120,
                height: 180,
                borderRadius: 8,
                background: "rgba(6,6,10,0.5)",
                border: "1.5px solid rgba(180,140,60,0.3)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${baseUrl}/images/og-thumbs/towers/${tower}.png`}
                width={200}
                height={200}
                alt=""
                style={{ display: "flex" }}
              />
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {stats.map((s, i) => (
            <div key={s.l} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div
                  style={{
                    display: "flex",
                    width: 1,
                    height: 28,
                    background: `${FC}60`,
                    marginRight: 8,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 6,
                  background: "rgba(6,6,10,0.5)",
                  border: "1px solid rgba(180,140,60,0.25)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#F58025",
                    lineHeight: 1,
                    fontFamily: FONT,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#a1a1aa",
                    letterSpacing: "0.06em",
                    fontFamily: FONT,
                  }}
                >
                  {s.l}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            fontSize: 18,
            fontWeight: 700,
            color: "#fbbf24",
            letterSpacing: "0.3em",
            fontFamily: FONT,
          }}
        >
          FREE BROWSER GAME · PLAY NOW
        </div>
      </div>
    </div>
  );
}
