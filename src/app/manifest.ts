import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Princeton Tower Defense",
    short_name: "Princeton TD",
    description:
      "Free browser tower defense game set at Princeton University. Build campus-themed towers, summon heroes, cast spells, and defend Nassau Hall across 23 levels.",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#1a1a2e",
    theme_color: "#E87722",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/images/logos/princeton-td-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logos/princeton-td-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    screenshots: [
      {
        src: "/images/gameplay-latest.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Princeton Tower Defense gameplay on campus map",
      },
      {
        src: "/images/promo/gameplay-desert.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Desert region — Sahara Sands level",
      },
      {
        src: "/images/promo/gameplay-winter.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Winter region — Frozen Frontier level",
      },
    ],
  };
}
