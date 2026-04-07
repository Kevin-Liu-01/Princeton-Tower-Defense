import { headers } from "next/headers";

import { SITE_URL, GAME_STATS } from "./constants";

export const OG_SIZE = { height: 630, width: 1200 };

export const OG_ALT =
  "Princeton Tower Defense - Free Browser Tower Defense Game with 26 Levels, 9 Heroes, and 100+ Enemies";

export async function getBaseUrl(): Promise<string> {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

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
    fetch(`${baseUrl}/fonts/bc-novatica-cyr/BCNovaticaCyr-Bold.ttf`).then((r) =>
      r.arrayBuffer()
    ),
    fetch(`${baseUrl}/fonts/bc-novatica-cyr/BCNovaticaCyr-Regular.ttf`).then(
      (r) => r.arrayBuffer()
    ),
  ]);
  return [
    {
      data: bold,
      name: "bc-novatica-cyr",
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      data: regular,
      name: "bc-novatica-cyr",
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
  { r: 0, x: 0, y: 0 },
  { r: 90, x: W - CS, y: 0 },
  { r: 180, x: W - CS, y: H - CS },
  { r: 270, x: 0, y: H - CS },
] as const;

function renderFrame(): React.ReactElement {
  const grad = `${FC}90`;
  const hLine = `linear-gradient(90deg, transparent, ${grad}, ${FC}, ${grad}, transparent)`;
  const vLine = `linear-gradient(180deg, transparent, ${grad}, ${FC}, ${grad}, transparent)`;

  return (
    <div
      style={{
        display: "flex",
        height: H,
        left: 0,
        position: "absolute",
        top: 0,
        width: W,
      }}
    >
      {/* Outer border */}
      <div
        style={{
          border: "1.5px solid rgba(180,140,60,0.45)",
          display: "flex",
          height: H - 20,
          left: 10,
          position: "absolute",
          top: 10,
          width: W - 20,
        }}
      />
      {/* Inner border */}
      <div
        style={{
          border: "1px solid rgba(180,140,60,0.18)",
          display: "flex",
          height: H - 32,
          left: 16,
          position: "absolute",
          top: 16,
          width: W - 32,
        }}
      />

      {/* Top border accent */}
      <div
        style={{
          background: hLine,
          display: "flex",
          height: 2,
          left: CS,
          position: "absolute",
          top: 10,
          width: W - CS * 2,
        }}
      />
      {/* Bottom border accent */}
      <div
        style={{
          background: hLine,
          display: "flex",
          height: 2,
          left: CS,
          position: "absolute",
          top: H - 12,
          width: W - CS * 2,
        }}
      />
      {/* Left border accent */}
      <div
        style={{
          background: vLine,
          display: "flex",
          height: H - CS * 2,
          left: 10,
          position: "absolute",
          top: CS,
          width: 2,
        }}
      />
      {/* Right border accent */}
      <div
        style={{
          background: vLine,
          display: "flex",
          height: H - CS * 2,
          left: W - 12,
          position: "absolute",
          top: CS,
          width: 2,
        }}
      />

      {/* Center diamonds top + bottom */}
      <div
        style={{
          background: "rgba(212,168,74,0.25)",
          border: `1.5px solid ${FC}`,
          display: "flex",
          height: 14,
          left: W / 2 - 7,
          position: "absolute",
          top: 3,
          transform: "rotate(45deg)",
          width: 14,
        }}
      />
      <div
        style={{
          background: "rgba(212,168,74,0.25)",
          border: `1.5px solid ${FC}`,
          display: "flex",
          height: 14,
          left: W / 2 - 7,
          position: "absolute",
          top: H - 18,
          transform: "rotate(45deg)",
          width: 14,
        }}
      />

      {/* Ornate corner SVGs */}
      {CORNERS.map((c) => (
        <div
          key={`${c.x}-${c.y}`}
          style={{
            display: "flex",
            height: CS,
            left: c.x,
            position: "absolute",
            top: c.y,
            transform: `rotate(${c.r}deg)`,
            width: CS,
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
    { l: "Levels", v: String(GAME_STATS.levels) },
    { l: "Enemies", v: `${GAME_STATS.enemyTypes}+` },
    { l: "Heroes", v: String(GAME_STATS.heroes) },
    { l: "Towers", v: String(GAME_STATS.towers) },
  ];

  return (
    <div
      style={{
        background: "#06060a",
        display: "flex",
        fontFamily: FONT,
        height: H,
        overflow: "hidden",
        position: "relative",
        width: W,
      }}
    >
      {/* Background gameplay image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgUrl}
        width={W}
        height={H}
        alt=""
        style={{ left: 0, opacity: 0.95, position: "absolute", top: 0 }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          background:
            "radial-gradient(ellipse 100% 90% at 50% 45%, rgba(6,6,10,0.1) 0%, rgba(6,6,10,0.65) 80%)",
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: W,
        }}
      />

      {/* Dark band behind content for readability */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(6,6,10,0.5) 0%, rgba(6,6,10,0.35) 30%, rgba(6,6,10,0.2) 50%, rgba(6,6,10,0.4) 70%, rgba(6,6,10,0.7) 100%)",
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: W,
        }}
      />

      {/* Ornate frame */}
      {renderFrame()}

      {/* Content */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          height: "100%",
          justifyContent: "center",
          padding: "36px 40px",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Logo + Title */}
        <div style={{ alignItems: "center", display: "flex", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} width={100} height={100} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#fbbf24",
                display: "flex",
                fontFamily: FONT,
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              PRINCETON
            </div>
            <div
              style={{
                color: "#e4e4e7",
                display: "flex",
                fontFamily: FONT,
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "0.24em",
                lineHeight: 1,
                marginTop: 6,
              }}
            >
              TOWER DEFENSE
            </div>
          </div>
        </div>

        {/* Tower sprites row */}
        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {TOWERS.map((tower) => (
            <div
              key={tower}
              style={{
                alignItems: "center",
                background: "rgba(6,6,10,0.5)",
                border: "1.5px solid rgba(180,140,60,0.3)",
                borderRadius: 8,
                display: "flex",
                height: 180,
                justifyContent: "center",
                width: 120,
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
            alignItems: "center",
            display: "flex",
            gap: 8,
          }}
        >
          {stats.map((s, i) => (
            <div key={s.l} style={{ alignItems: "center", display: "flex" }}>
              {i > 0 && (
                <div
                  style={{
                    background: `${FC}60`,
                    display: "flex",
                    height: 28,
                    marginRight: 8,
                    width: 1,
                  }}
                />
              )}
              <div
                style={{
                  alignItems: "center",
                  background: "rgba(6,6,10,0.5)",
                  border: "1px solid rgba(180,140,60,0.25)",
                  borderRadius: 6,
                  display: "flex",
                  gap: 6,
                  padding: "6px 14px",
                }}
              >
                <div
                  style={{
                    color: "#F58025",
                    display: "flex",
                    fontFamily: FONT,
                    fontSize: 32,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    color: "#a1a1aa",
                    display: "flex",
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
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
            color: "#fbbf24",
            display: "flex",
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.3em",
          }}
        >
          FREE BROWSER GAME · PLAY NOW
        </div>
      </div>
    </div>
  );
}
