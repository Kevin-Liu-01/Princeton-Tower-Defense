import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#1a1a2e",
    categories: ["games", "entertainment"],
    description:
      "Free browser tower defense game set at Princeton University. Build campus-themed towers, summon heroes, cast spells, and defend Nassau Hall across 26 levels.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "512x512",
        src: "/images/logos/princeton-td-logo.png",
        type: "image/png",
      },
      {
        sizes: "any",
        src: "/images/logos/princeton-td-logo.svg",
        type: "image/svg+xml",
      },
    ],
    name: "Princeton Tower Defense",
    orientation: "landscape",
    screenshots: [
      {
        label: "Princeton Tower Defense gameplay on campus grounds",
        sizes: "2966x1826",
        src: "/images/new/gameplay_grounds_ui.png",
        type: "image/png",
      },
      {
        label: "Desert region - Sahara Sands level",
        sizes: "2964x1828",
        src: "/images/new/gameplay_desert_ui.png",
        type: "image/png",
      },
      {
        label: "Swamp region - Murky Marshes level",
        sizes: "2968x1824",
        src: "/images/new/gameplay_swamp_ui.png",
        type: "image/png",
      },
      {
        label: "Winter region - Frozen Frontier level",
        sizes: "2970x1820",
        src: "/images/new/gameplay_winter_ui.png",
        type: "image/png",
      },
      {
        label: "Volcanic region - Volcanic Depths level",
        sizes: "2962x1814",
        src: "/images/new/gameplay_volcano_ui.png",
        type: "image/png",
      },
      {
        label: "Sandbox Arena battle",
        sizes: "2964x1790",
        src: "/images/new/gameplay_sandbox_ui.png",
        type: "image/png",
      },
      {
        label: "World map with campaign progression",
        sizes: "2978x1828",
        src: "/images/promo/worldmap.png",
        type: "image/png",
      },
    ],
    short_name: "Princeton TD",
    start_url: "/",
    theme_color: "#E87722",
  };
}
