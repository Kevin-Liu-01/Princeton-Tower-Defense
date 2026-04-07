import type { LucideIcon } from "lucide-react";
import { Shield, Swords, Crown, Sparkles, Map, Skull } from "lucide-react";

// ─── Landing page theme (warm gold/amber on dark) ─────────────────────────────

export const LANDING_THEME = {
  accent: "#d4a84a",
  accentBright: "#f5c842",
  accentBrightRgb: "245,200,66",
  accentDark: "#8a6420",
  accentDarkRgb: "138,100,32",
  accentRgb: "212,168,74",
  bg: "rgb(12,8,4)",
  bgRgb: "12,8,4",
  frameColor: "#b48c3c",
  frameGlow: "#d4a84a",
  princeton: "#F58025",
  princetonRgb: "245,128,37",
} as const;

export const LANDING_BG_IMAGE = "/images/new/gameplay_grounds.png";

export const LANDING_TAGLINE =
  "Defend the campus. Command heroes. Master the arcane.";

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface FeatureStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const LANDING_STATS: FeatureStat[] = [
  { icon: Map, label: "Levels", value: "26" },
  { icon: Shield, label: "Towers", value: "7" },
  { icon: Crown, label: "Heroes", value: "9" },
  { icon: Sparkles, label: "Spells", value: "6" },
  { icon: Map, label: "Regions", value: "5" },
  { icon: Skull, label: "Enemies", value: "100+" },
];

// ─── Lore quotes ──────────────────────────────────────────────────────────────

export const LANDING_LORE = [
  "\u201CThe shadows gather at the gates. Ancient towers stand resolute, their arcane fires burning eternal against the darkness.\u201D",
  "\u201CFrom Nassau Hall\u2019s spires, the signal fires burn \u2014 a call to arms across the realm.\u201D",
  "\u201CWhere scholars once debated philosophy, war machines now stand vigilant.\u201D",
  "\u201CEvery stone laid in defense carries the weight of a thousand prayers.\u201D",
  "\u201CThe old roads remember peace. The towers remember why it ended.\u201D",
];

// ─── Ember particle configs (seeded for determinism) ──────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49_297) * 233_280;
  return x - Math.floor(x);
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export interface EmberConfig {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  variant: number;
}

const EMBER_COUNT = 18;

export const LANDING_EMBERS: EmberConfig[] = Array.from(
  { length: EMBER_COUNT },
  (_, i) => ({
    delay: round(seededRandom(i + 800) * 12, 3),
    duration: round(10 + seededRandom(i + 700) * 16, 3),
    id: i,
    opacity: round(0.12 + seededRandom(i + 900) * 0.4, 4),
    size: round(1.2 + seededRandom(i + 600) * 2.8, 3),
    variant: i % 4,
    x: round(seededRandom(i + 500) * 100, 3),
  })
);

export const LANDING_EMBER_COLORS = [
  "#d4a84a",
  "#f5c842",
  "#b48c3c",
  "#8a6420",
] as const;

// ─── Crossfade slideshow ──────────────────────────────────────────────────────

export const CROSSFADE_INTERVAL_MS = 5000;
export const CROSSFADE_TRANSITION_MS = 1500;

export const HERO_SLIDESHOW_IMAGES = [
  "/images/new/gameplay_grounds.png",
  "/images/new/gameplay_desert.png",
  "/images/new/gameplay_swamp.png",
  "/images/new/gameplay_winter.png",
  "/images/new/gameplay_volcano.png",
] as const;

// ─── Gameplay showcase (OG screenshots with UI) ──────────────────────────────

export interface ShowcaseSlide {
  src: string;
  label: string;
}

export const GAMEPLAY_SHOWCASE: ShowcaseSlide[] = [
  { label: "Grasslands", src: "/images/new/gameplay_grounds_ui.png" },
  { label: "Desert Sands", src: "/images/new/gameplay_desert_ui.png" },
  { label: "Murky Swamp", src: "/images/new/gameplay_swamp_ui.png" },
  { label: "Frozen Wastes", src: "/images/new/gameplay_winter_ui.png" },
  { label: "Volcanic Realm", src: "/images/new/gameplay_volcano_ui.png" },
];

// ─── Hero & Spell gallery ─────────────────────────────────────────────────────

export interface CharacterDisplay {
  id: string;
  name: string;
  image: string;
  color: string;
}

export const HERO_GALLERY: CharacterDisplay[] = [
  {
    color: "#f97316",
    id: "tiger",
    image: "/images/heroes/tiger-action.png",
    name: "Princeton Tiger",
  },
  {
    color: "#8b5cf6",
    id: "tenor",
    image: "/images/heroes/tenor-action.png",
    name: "Acapella Tenor",
  },
  {
    color: "#6366f1",
    id: "mathey",
    image: "/images/heroes/mathey-action.png",
    name: "Mathey Knight",
  },
  {
    color: "#8a7020",
    id: "rocky",
    image: "/images/heroes/rocky-action.png",
    name: "Rocky Raccoon",
  },
  {
    color: "#14b8a6",
    id: "scott",
    image: "/images/heroes/scott-action.png",
    name: "F. Scott",
  },
  {
    color: "#dc2626",
    id: "captain",
    image: "/images/heroes/captain-action.png",
    name: "General Mercer",
  },
  {
    color: "#eab308",
    id: "engineer",
    image: "/images/heroes/engineer-action.png",
    name: "BSE Engineer",
  },
  {
    color: "#e67e22",
    id: "nassau",
    image: "/images/heroes/nassau-action.png",
    name: "Nassau Phoenix",
  },
  {
    color: "#059669",
    id: "ivy",
    image: "/images/heroes/ivy-action.png",
    name: "Ivy Warden",
  },
];

export const SPELL_GALLERY: CharacterDisplay[] = [
  {
    color: "#ef4444",
    id: "fireball",
    image: "/images/spells/fireball-action.png",
    name: "Fireball Strike",
  },
  {
    color: "#a855f7",
    id: "lightning",
    image: "/images/spells/lightning-action.png",
    name: "Chain Lightning",
  },
  {
    color: "#38bdf8",
    id: "freeze",
    image: "/images/spells/freeze-action.png",
    name: "Arctic Freeze",
  },
  {
    color: "#c084fc",
    id: "hex_ward",
    image: "/images/spells/hex-ward-action.png",
    name: "Hex Ward",
  },
  {
    color: "#eab308",
    id: "payday",
    image: "/images/spells/payday-action.png",
    name: "Paw Point Payday",
  },
  {
    color: "#22c55e",
    id: "reinforcements",
    image: "/images/spells/reinforcements-action.png",
    name: "Reinforcements",
  },
];

// ─── Battle preview showcase ──────────────────────────────────────────────────

export interface BattlePreviewSlide {
  src: string;
  label: string;
}

export const BATTLE_PREVIEW_SLIDES: BattlePreviewSlide[] = [
  { label: "Nassau Hall", src: "/images/previews/nassau.png" },
  { label: "Poe Field", src: "/images/previews/poe.png" },
  { label: "Carnegie Lake", src: "/images/previews/carnegie.png" },
  { label: "Frozen Glacier", src: "/images/previews/glacier.png" },
  { label: "The Caldera", src: "/images/previews/caldera.png" },
  { label: "Ancient Pyramid", src: "/images/previews/pyramid.png" },
  { label: "Witch's Hut", src: "/images/previews/witch_hut.png" },
  { label: "Mountain Fortress", src: "/images/previews/fortress.png" },
];

// ─── All landing image URLs (for preloading) ─────────────────────────────────

export function getLandingImageUrls(): string[] {
  return [
    ...HERO_SLIDESHOW_IMAGES,
    ...GAMEPLAY_SHOWCASE.map((s) => s.src),
    ...HERO_GALLERY.map((h) => h.image),
    ...SPELL_GALLERY.map((s) => s.image),
    ...BATTLE_PREVIEW_SLIDES.map((b) => b.src),
  ];
}
