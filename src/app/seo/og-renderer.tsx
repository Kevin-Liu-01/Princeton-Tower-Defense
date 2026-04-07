import { headers } from "next/headers";

import { SITE_URL, GAME_STATS } from "./constants";

const OG_SCREENSHOTS = [
  { file: "gameplay_grounds", label: "Grounds" },
  { file: "gameplay_swamp", label: "Marshes" },
  { file: "gameplay_desert", label: "Desert" },
  { file: "gameplay_winter", label: "Frozen" },
  { file: "gameplay_volcano", label: "Volcanic" },
] as const;

const OG_STATS = [
  { value: String(GAME_STATS.levels), label: "LEVELS" },
  { value: `${GAME_STATS.enemyTypes}+`, label: "ENEMIES" },
  { value: String(GAME_STATS.heroes), label: "HEROES" },
] as const;

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

export function renderOGImage(baseUrl: string): React.ReactElement {
  const logoUrl = `${baseUrl}/images/og-thumbs/logo.png`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow - top center */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: 350,
          width: 500,
          height: 350,
          background:
            "radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Ambient glow - bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: 200,
          width: 800,
          height: 350,
          background:
            "radial-gradient(ellipse, rgba(245,128,37,0.09) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 4,
          background:
            "linear-gradient(90deg, transparent 5%, #b45309 25%, #fbbf24 50%, #b45309 75%, transparent 95%)",
          display: "flex",
        }}
      />

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1200,
          height: 4,
          background:
            "linear-gradient(90deg, transparent 5%, #b45309 25%, #fbbf24 50%, #b45309 75%, transparent 95%)",
          display: "flex",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          width: "100%",
          height: "100%",
          padding: "44px 40px",
        }}
      >
        {/* Header: Logo + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} width={80} height={80} alt="" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 54,
                fontWeight: 900,
                color: "#fbbf24",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              PRINCETON
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 27,
                fontWeight: 700,
                color: "#d4d4d8",
                lineHeight: 1,
                letterSpacing: "0.18em",
                marginTop: 6,
              }}
            >
              TOWER DEFENSE
            </div>
          </div>
        </div>

        {/* Screenshots row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {OG_SCREENSHOTS.map((ss) => (
            <div
              key={ss.file}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "2.5px solid rgba(245,128,37,0.45)",
                  boxShadow:
                    "0 4px 24px rgba(0,0,0,0.6), 0 0 12px rgba(245,128,37,0.1)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${baseUrl}/images/og-thumbs/${ss.file}.png`}
                  width={200}
                  height={105}
                  alt=""
                />
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#71717a",
                  letterSpacing: "0.15em",
                }}
              >
                {ss.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Stats pills */}
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {OG_STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 32px",
                borderRadius: 999,
                border: "2px solid rgba(245,128,37,0.3)",
                background: "rgba(245,128,37,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#F58025",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#a1a1aa",
                  letterSpacing: "0.1em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 14,
            fontWeight: 700,
            color: "#92400e",
            letterSpacing: "0.3em",
          }}
        >
          FREE BROWSER GAME · PLAY NOW
        </div>
      </div>
    </div>
  );
}
