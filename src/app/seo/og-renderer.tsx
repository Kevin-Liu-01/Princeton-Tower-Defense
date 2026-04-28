import { headers } from "next/headers";

import { WORLD_LEVELS } from "../components/menus/world-map/worldMapData";
import { LEVEL_DATA } from "../constants/maps";
import { SITE_URL, GAME_STATS } from "./constants";

type LevelNode = (typeof WORLD_LEVELS)[number];

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

const TOWER_CARD_INFO: Record<
  string,
  {
    name: string;
    bgTop: string;
    bgBottom: string;
    accent: string;
    imgSize?: number;
    offsetY?: number;
  }
> = {
  arch: {
    accent: "#60a5fa",
    bgBottom: "#12122a",
    bgTop: "#2e2e5c",
    name: "Blair Arch",
    offsetY: 14,
  },
  cannon: {
    accent: "#f87171",
    bgBottom: "#1e120e",
    bgTop: "#5c2e1c",
    name: "Nassau Cannon",
    offsetY: 7,
  },
  club: {
    accent: "#f59e0b",
    bgBottom: "#1e1a0e",
    bgTop: "#504418",
    imgSize: 150,
    name: "Eating Club",
  },
  lab: {
    accent: "#facc15",
    bgBottom: "#141c0e",
    bgTop: "#304c1c",
    name: "E-Quad Lab",
    offsetY: 7,
  },
  library: {
    accent: "#67e8f9",
    bgBottom: "#0e1822",
    bgTop: "#1c3a5a",
    imgSize: 170,
    offsetY: 4,
    name: "Firestone Library",
  },
  mortar: {
    accent: "#fb923c",
    bgBottom: "#1e160e",
    bgTop: "#503818",
    imgSize: 150,
    name: "Palmer Mortar",
    offsetY: 14,
  },
  station: {
    accent: "#a78bfa",
    bgBottom: "#1c0e1c",
    bgTop: "#4c1c4c",
    name: "Dinky Station",
    imgSize: 150,
    offsetY: 24,
  },
};

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

      {/* Center diamond finials — one centered on each edge of the outer
          frame line, with a faceted gem look (gradient body + bright pip).
          The outer-border line lives at offset 10 so we centre each diamond
          at offset 11 (=10 + 1px stroke half-width) from its edge. */}
      {(
        [
          { cx: W / 2, cy: 15 },
          { cx: W / 2, cy: H - 15 },
          { cx: 15, cy: H / 2 },
          { cx: W - 15, cy: H / 2 },
        ] as const
      ).map((d) => {
        const size = 18;
        return (
          <div
            key={`${d.cx}-${d.cy}`}
            style={{
              display: "flex",
              height: size,
              left: d.cx - size / 2,
              position: "absolute",
              top: d.cy - size / 2,
              width: size,
            }}
          >
            {/* Faceted body */}
            <div
              style={{
                background: `linear-gradient(135deg, ${FG} 0%, ${FC} 50%, #6a4d18 100%)`,
                border: `1.5px solid ${FG}`,
                boxShadow: `0 0 10px rgba(212,168,74,0.55), inset 0 0 4px rgba(255,240,180,0.35)`,
                display: "flex",
                height: size,
                left: 0,
                position: "absolute",
                top: 0,
                transform: "rotate(45deg)",
                width: size,
              }}
            />
            {/* Bright sparkle pip */}
            <div
              style={{
                background: "rgba(255,245,200,0.85)",
                borderRadius: 99,
                display: "flex",
                height: 4,
                left: size / 2 - 2,
                position: "absolute",
                top: size / 2 - 2,
                width: 4,
              }}
            />
          </div>
        );
      })}

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

const BG = "rgb(32,24,14)";
const BG_RGBA = "32,24,14";

const MAP_STRIP_W = 160;

function renderMapStrip(
  baseUrl: string,
  side: "left" | "right"
): React.ReactElement {
  const fadeDir = side === "left" ? "270deg" : "90deg";
  const stripFile = side === "left" ? "strip-left.png" : "strip-right.png";

  return (
    <div
      style={{
        display: "flex",
        height: H,
        left: side === "left" ? 0 : W - MAP_STRIP_W,
        position: "absolute",
        top: 0,
        width: MAP_STRIP_W,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${baseUrl}/images/og/${stripFile}`}
        width={MAP_STRIP_W}
        height={H}
        alt=""
        style={{ display: "flex", objectFit: "cover" }}
      />
      <div
        style={{
          background: `linear-gradient(180deg, ${BG} 0%, transparent 20%, transparent 80%, ${BG} 100%)`,
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: MAP_STRIP_W,
        }}
      />
      <div
        style={{
          background: `linear-gradient(${fadeDir}, transparent 40%, ${BG} 100%)`,
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: MAP_STRIP_W,
        }}
      />
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
        background: BG,
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
        style={{ left: 0, opacity: 0.35, position: "absolute", top: 0 }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          background: `radial-gradient(ellipse 100% 90% at 50% 45%, rgba(${BG_RGBA},0.1) 0%, rgba(${BG_RGBA},0.7) 80%)`,
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: W,
        }}
      />

      {/* Vertical gradient for readability */}
      <div
        style={{
          background: `linear-gradient(180deg, rgba(${BG_RGBA},0.6) 0%, rgba(${BG_RGBA},0.3) 30%, rgba(${BG_RGBA},0.15) 50%, rgba(${BG_RGBA},0.4) 70%, rgba(${BG_RGBA},0.8) 100%)`,
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: W,
        }}
      />

      {/* Map preview strips */}
      {renderMapStrip(baseUrl, "left")}
      {renderMapStrip(baseUrl, "right")}

      {/* Ornate frame */}
      {renderFrame()}

      {/* Content */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 22,
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

        {/* Tower carousel panel */}
        <div
          style={{
            background: `rgba(${BG_RGBA},0.7)`,
            border: "1.5px solid rgba(180,140,60,0.25)",
            borderRadius: 12,
            display: "flex",
            justifyContent: "center",
            padding: "14px 20px",
          }}
        >
          <div
            style={{
              alignItems: "flex-end",
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {TOWERS.map((tower) => {
              const info = TOWER_CARD_INFO[tower];
              const sz = info.imgSize ?? 180;
              return (
                <div
                  key={tower}
                  style={{
                    alignItems: "center",
                    background: `linear-gradient(170deg, ${info.bgTop}, ${info.bgBottom})`,
                    border: `1.5px solid ${info.accent}30`,
                    borderRadius: 8,
                    boxShadow: `0 2px 10px rgba(0,0,0,0.4), inset 0 0 12px rgba(0,0,0,0.3)`,
                    display: "flex",
                    height: 148,
                    justifyContent: "center",
                    overflow: "hidden",
                    width: 112,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${baseUrl}/images/og-thumbs/towers/${tower}.png`}
                    width={sz}
                    height={sz}
                    alt=""
                    style={{
                      display: "flex",
                      marginTop: info.offsetY ?? 0,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 4,
          }}
        >
          {stats.map((s, i) => (
            <div key={s.l} style={{ alignItems: "center", display: "flex" }}>
              {i > 0 && (
                <div
                  style={{
                    background: "rgba(212,168,74,0.15)",
                    display: "flex",
                    height: 32,
                    marginRight: 4,
                    width: 1,
                  }}
                />
              )}
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    color: "#F58025",
                    display: "flex",
                    fontFamily: FONT,
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    color: "rgba(212,168,74,0.35)",
                    display: "flex",
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                  }}
                >
                  {s.l.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            alignItems: "center",
            background:
              "linear-gradient(180deg, rgba(190,138,30,0.95) 0%, rgba(120,78,15,0.98) 100%)",
            border: "2px solid rgba(212,168,74,0.6)",
            borderRadius: 12,
            boxShadow:
              "0 0 40px rgba(212,168,74,0.15), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
            color: "rgba(255,240,200,0.95)",
            display: "flex",
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 700,
            justifyContent: "center",
            letterSpacing: "0.2em",
            padding: "14px 44px",
          }}
        >
          ENTER THE REALM
        </div>
      </div>
    </div>
  );
}

const REGION_BG: Record<LevelNode["region"], string> = {
  desert: "/images/new/gameplay_desert.png",
  grassland: "/images/new/gameplay_grounds.png",
  swamp: "/images/new/gameplay_swamp.png",
  volcanic: "/images/new/gameplay_volcano.png",
  winter: "/images/new/gameplay_winter.png",
};

const REGION_LABEL: Record<LevelNode["region"], string> = {
  desert: "Sahara Sands",
  grassland: "Princeton Grounds",
  swamp: "Murky Marshes",
  volcanic: "Volcanic Depths",
  winter: "Frozen Frontier",
};

const REGION_ACCENT: Record<LevelNode["region"], string> = {
  desert: "#f4b942",
  grassland: "#7bc96f",
  swamp: "#a3c44b",
  volcanic: "#f87171",
  winter: "#7dd3fc",
};

const KIND_LABEL: Record<NonNullable<LevelNode["kind"]> | "campaign", string> =
  {
    campaign: "Campaign",
    challenge: "Challenge",
    sandbox: "Sandbox",
  };

export function findLevelById(levelId: string): LevelNode | undefined {
  return WORLD_LEVELS.find((l) => l.id === levelId);
}

export function renderLevelOGImage(
  baseUrl: string,
  level: LevelNode
): React.ReactElement {
  const region = REGION_LABEL[level.region];
  const accent = REGION_ACCENT[level.region];
  const kind = KIND_LABEL[level.kind ?? "campaign"];
  const previewPath =
    LEVEL_DATA[level.id]?.previewImage ?? REGION_BG[level.region];
  const previewUrl = `${baseUrl}${previewPath}`;
  const logoUrl = `${baseUrl}/images/og-thumbs/logo.png`;

  // Scale title to fit the bottom-left zone — long names need to step down so
  // they don't blow past the right edge of the safe area.
  const nameLen = level.name.length;
  const titleSize =
    nameLen > 22 ? 84 : nameLen > 16 ? 110 : nameLen > 11 ? 132 : 148;

  return (
    <div
      style={{
        background: BG,
        display: "flex",
        fontFamily: FONT,
        height: H,
        overflow: "hidden",
        position: "relative",
        width: W,
      }}
    >
      {/* Full-bleed level preview as the background. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        width={W}
        height={H}
        alt=""
        style={{
          display: "flex",
          left: 0,
          objectFit: "cover",
          position: "absolute",
          top: 0,
        }}
      />

      {/* Top-to-bottom darkening gradient — heavier at the corners where the
          logo and level name sit, almost transparent through the middle so
          the preview reads clearly. */}
      <div
        style={{
          background: `linear-gradient(180deg, rgba(${BG_RGBA},0.78) 0%, rgba(${BG_RGBA},0.18) 22%, rgba(${BG_RGBA},0) 45%, rgba(${BG_RGBA},0.35) 65%, rgba(${BG_RGBA},0.92) 100%)`,
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: W,
        }}
      />

      {/* Subtle vignette to anchor the corners. */}
      <div
        style={{
          background: `radial-gradient(ellipse 100% 80% at 50% 50%, transparent 55%, rgba(${BG_RGBA},0.45) 100%)`,
          display: "flex",
          height: H,
          left: 0,
          position: "absolute",
          top: 0,
          width: W,
        }}
      />

      {/* Region accent wash in the bottom-left where the title sits. */}
      <div
        style={{
          background: `radial-gradient(ellipse 50% 40% at 0% 100%, ${accent}28 0%, ${accent}00 70%)`,
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

      {/* Top-left: PTD logo + wordmark */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 18,
          left: 60,
          position: "absolute",
          top: 56,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} width={64} height={64} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              color: "#fbbf24",
              display: "flex",
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.005em",
              lineHeight: 1,
              textShadow: "0 2px 10px rgba(0,0,0,0.7)",
            }}
          >
            PRINCETON
          </div>
          <div
            style={{
              color: "rgba(228,228,231,0.85)",
              display: "flex",
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.24em",
              lineHeight: 1,
              textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            TOWER DEFENSE
          </div>
        </div>
      </div>

      {/* Bottom-left: region/kind eyebrow + level name */}
      <div
        style={{
          bottom: 60,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          left: 60,
          maxWidth: W - 120,
          position: "absolute",
        }}
      >
        {/* Region · Kind eyebrow with accent rule */}
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          <div
            style={{
              background: accent,
              borderRadius: 2,
              boxShadow: `0 0 12px ${accent}aa`,
              display: "flex",
              height: 28,
              width: 4,
            }}
          />
          <div
            style={{
              color: accent,
              display: "flex",
              fontFamily: FONT,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              textTransform: "uppercase",
            }}
          >
            {region} · {kind}
          </div>
        </div>

        {/* Level name */}
        <div
          style={{
            color: "#fbbf24",
            display: "flex",
            fontFamily: FONT,
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 0.92,
            textShadow:
              "0 4px 28px rgba(0,0,0,0.85), 0 0 48px rgba(251,191,36,0.22)",
          }}
        >
          {level.name}
        </div>
      </div>
    </div>
  );
}
