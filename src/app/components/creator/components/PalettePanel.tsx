import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Landmark,
  Paintbrush,
  Search,
  Wand2,
} from "lucide-react";
import type {
  DecorationCategory,
  HazardType,
  MapTheme,
} from "../../../types";
import type { PaletteDragPayload, ToolMode } from "../types";
import {
  ALL_HAZARD_OPTIONS,
  CHALLENGE_DECORATIONS,
  DECORATION_OPTIONS_BY_THEME,
  HAZARD_OPTIONS_BY_THEME,
  LANDMARK_OPTIONS,
  UNIVERSAL_DECORATIONS,
} from "../constants";
import { formatAssetName } from "../utils/gridUtils";
import { AssetChip } from "./AssetChip";

type PaletteTab = "decoration" | "landmark" | "hazard";

interface PalettePanelProps {
  theme: MapTheme;
  selectedDecorationType: DecorationCategory;
  selectedLandmarkType: DecorationCategory;
  selectedHazardType: HazardType;
  onSelectDecoration: (type: DecorationCategory) => void;
  onSelectLandmark: (type: DecorationCategory) => void;
  onSelectHazard: (type: HazardType) => void;
  onToolSelect: (tool: ToolMode) => void;
}

export const PalettePanel: React.FC<PalettePanelProps> = ({
  theme,
  selectedDecorationType,
  selectedLandmarkType,
  selectedHazardType,
  onSelectDecoration,
  onSelectLandmark,
  onSelectHazard,
  onToolSelect,
}) => {
  const [tab, setTab] = useState<PaletteTab>("decoration");
  const [search, setSearch] = useState<string>("");
  const [showAllThemes, setShowAllThemes] = useState(false);

  const decorationOptions = useMemo(() => {
    const themeDecos = DECORATION_OPTIONS_BY_THEME[theme] ?? [];
    if (showAllThemes) {
      const allDecos = new Set<DecorationCategory>(themeDecos);
      for (const decos of Object.values(DECORATION_OPTIONS_BY_THEME)) {
        for (const d of decos) allDecos.add(d);
      }
      for (const d of UNIVERSAL_DECORATIONS) allDecos.add(d);
      for (const d of CHALLENGE_DECORATIONS) allDecos.add(d);
      return Array.from(allDecos);
    }
    const combined = new Set<DecorationCategory>(themeDecos);
    for (const d of UNIVERSAL_DECORATIONS) combined.add(d);
    return Array.from(combined);
  }, [theme, showAllThemes]);

  const hazardOptions = useMemo(() => {
    if (showAllThemes) return ALL_HAZARD_OPTIONS;
    return HAZARD_OPTIONS_BY_THEME[theme] ?? ALL_HAZARD_OPTIONS;
  }, [theme, showAllThemes]);

  const paletteOptions = useMemo(() => {
    const source: string[] =
      tab === "decoration"
        ? [...decorationOptions]
        : tab === "landmark"
          ? [...LANDMARK_OPTIONS]
          : [...hazardOptions];
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter((option) => option.toLowerCase().includes(term));
  }, [tab, search, decorationOptions, hazardOptions]);

  const tabIcon =
    tab === "decoration" ? Paintbrush : tab === "landmark" ? Landmark : AlertTriangle;

  const handleTabClick = (nextTab: PaletteTab) => {
    setTab(nextTab);
    if (nextTab === "decoration") onToolSelect("decoration");
    else if (nextTab === "landmark") onToolSelect("landmark");
    else onToolSelect("hazard");
  };

  return (
    <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2.5">
      <div className="text-xs uppercase tracking-wider text-amber-200 mb-2 inline-flex items-center gap-1.5">
        <Wand2 size={12} />
        Palette
        <span className="text-amber-400/60 text-[9px] lowercase font-normal tracking-normal ml-1">
          {formatAssetName(theme)}
        </span>
      </div>

      {/* Tab row */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        {(["decoration", "landmark", "hazard"] as PaletteTab[]).map((t) => {
          const Icon = t === "decoration" ? Paintbrush : t === "landmark" ? Landmark : AlertTriangle;
          const label = t === "decoration" ? "Deco" : t === "landmark" ? "Landmark" : "Hazard";
          return (
            <button
              key={t}
              onClick={() => handleTabClick(t)}
              className={`rounded-md border px-2 py-1 text-[11px] inline-flex items-center justify-center gap-1 transition-colors ${tab === t
                ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                : "border-amber-900/60 bg-stone-900/70 text-amber-300/80 hover:bg-stone-800/80"
                }`}
            >
              <Icon size={11} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Search + show all toggle */}
      <div className="mb-2 flex gap-2">
        <label className="relative flex-1">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400/70"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="search assets..."
            className="w-full rounded-md border border-amber-700/60 bg-stone-950 pl-7 pr-2 py-1.5 text-xs outline-none focus:border-amber-400"
          />
        </label>
        {tab !== "landmark" && (
          <button
            onClick={() => setShowAllThemes(!showAllThemes)}
            className={`rounded-md border px-2 py-1 text-[10px] whitespace-nowrap transition-colors ${showAllThemes
              ? "border-amber-400/70 bg-amber-500/15 text-amber-200"
              : "border-amber-900/60 bg-stone-900/70 text-amber-400/70 hover:bg-stone-800/80"
              }`}
            title={showAllThemes ? "Showing all themes" : "Showing current theme only"}
          >
            {showAllThemes ? "All" : formatAssetName(theme)}
          </button>
        )}
      </div>

      {/* Items grid */}
      <div className="max-h-56 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-1">
          {paletteOptions.length === 0 ? (
            <div className="col-span-2 rounded border border-amber-900/60 bg-black/20 p-2 text-[11px] text-amber-300/70">
              No matches for &ldquo;{search}&rdquo;
            </div>
          ) : (
            paletteOptions.map((option) => (
              <AssetChip
                key={`${tab}-${option}`}
                label={formatAssetName(option)}
                icon={React.createElement(tabIcon, { size: 11 })}
                active={
                  (tab === "decoration" && selectedDecorationType === option) ||
                  (tab === "landmark" && selectedLandmarkType === option) ||
                  (tab === "hazard" && selectedHazardType === option)
                }
                onSelect={() => {
                  if (tab === "decoration") {
                    onSelectDecoration(option as DecorationCategory);
                    onToolSelect("decoration");
                  } else if (tab === "landmark") {
                    onSelectLandmark(option as DecorationCategory);
                    onToolSelect("landmark");
                  } else {
                    onSelectHazard(option as HazardType);
                    onToolSelect("hazard");
                  }
                }}
                dragPayload={{ kind: tab as PaletteDragPayload["kind"], value: option }}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-1.5 text-[10px] text-amber-400/60">
        {paletteOptions.length} items &middot; drag onto map or click to select
      </div>
    </div>
  );
};
