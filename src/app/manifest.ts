import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Princeton Tower Defense",
    short_name: "Princeton TD",
    description:
      "Free browser tower defense game set at Princeton University. Build campus-themed towers, summon heroes, cast spells, and defend Nassau Hall across 25+ levels.",
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
        src: "/images/new/gameplay_grounds_ui.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Princeton Tower Defense gameplay on campus grounds",
      },
      {
        src: "/images/new/gameplay_desert_ui.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Desert region - Sahara Sands level",
      },
      {
        src: "/images/new/gameplay_swamp_ui.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Swamp region - Murky Marshes level",
      },
      {
        src: "/images/new/gameplay_winter_ui.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Winter region - Frozen Frontier level",
      },
      {
        src: "/images/new/gameplay_volcano_ui.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Volcanic region - Volcanic Depths level",
      },
    ],
  };
}
