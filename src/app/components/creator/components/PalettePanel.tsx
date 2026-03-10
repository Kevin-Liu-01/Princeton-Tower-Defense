import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChessRook,
  Landmark,
  Paintbrush,
  Search,
  Sword,
  Wand2,
} from "lucide-react";
import type {
  DecorationCategory,
  HazardType,
  MapTheme,
  SpecialTowerType,
  TowerType,
} from "../../../types";
import type { PaletteDragPayload, ToolMode } from "../types";
import {
  ALL_HAZARD_OPTIONS,
  CHALLENGE_DECORATIONS,
  DECORATION_OPTIONS_BY_THEME,
  HAZARD_OPTIONS_BY_THEME,
  LANDMARK_OPTIONS,
  OBJECTIVE_TYPE_STATS,
  SPECIAL_TOWER_TYPES,
  TOWER_DISPLAY_NAMES,
  TOWER_TYPE_OPTIONS,
  UNIVERSAL_DECORATIONS,
} from "../constants";
import { formatAssetName } from "../utils/gridUtils";
import { AssetChip } from "./AssetChip";

type PaletteTab = "decoration" | "landmark" | "hazard" | "objective" | "tower";

interface PalettePanelProps {
  theme: MapTheme;
  selectedDecorationType: DecorationCategory;
  selectedLandmarkType: DecorationCategory;
  selectedHazardType: HazardType;
  selectedObjectiveType: SpecialTowerType;
  selectedTowerType: TowerType;
  onSelectDecoration: (type: DecorationCategory) => void;
  onSelectLandmark: (type: DecorationCategory) => void;
  onSelectHazard: (type: HazardType) => void;
  onSelectObjective: (type: SpecialTowerType) => void;
  onSelectTower: (type: TowerType) => void;
  onToolSelect: (tool: ToolMode) => void;
}

const TAB_CONFIG: { key: PaletteTab; label: string; icon: typeof Paintbrush; color: string }[] = [
  { key: "decoration", label: "Deco", icon: Paintbrush, color: "amber" },
  { key: "landmark", label: "Land", icon: Landmark, color: "sky" },
  { key: "hazard", label: "Hazard", icon: AlertTriangle, color: "red" },
  { key: "objective", label: "Obj", icon: ChessRook, color: "purple" },
  { key: "tower", label: "Tower", icon: Sword, color: "blue" },
];

const getDisplayName = (tab: PaletteTab, value: string): string => {
  if (tab === "tower") return TOWER_DISPLAY_NAMES[value as TowerType] ?? formatAssetName(value);
  if (tab === "objective") return OBJECTIVE_TYPE_STATS[value as SpecialTowerType]?.title ?? formatAssetName(value);
  return formatAssetName(value);
};

export const PalettePanel: React.FC<PalettePanelProps> = ({
  theme,
  selectedDecorationType,
  selectedLandmarkType,
  selectedHazardType,
  selectedObjectiveType,
  selectedTowerType,
  onSelectDecoration,
  onSelectLandmark,
  onSelectHazard,
  onSelectObjective,
  onSelectTower,
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
    let source: string[];
    switch (tab) {
      case "decoration":
        source = [...decorationOptions];
        break;
      case "landmark":
        source = [...LANDMARK_OPTIONS];
        break;
      case "hazard":
        source = [...hazardOptions];
        break;
      case "objective":
        source = [...SPECIAL_TOWER_TYPES];
        break;
      case "tower":
        source = [...TOWER_TYPE_OPTIONS];
        break;
      default:
        source = [];
    }
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter((option) => {
      const displayName = getDisplayName(tab, option);
      return option.toLowerCase().includes(term) || displayName.toLowerCase().includes(term);
    });
  }, [tab, search, decorationOptions, hazardOptions]);

  const tabIcon = TAB_CONFIG.find((t) => t.key === tab)?.icon ?? Paintbrush;

  const toolModeForTab = (t: PaletteTab): ToolMode => {
    if (t === "objective") return "special_tower";
    if (t === "tower") return "tower";
    return t as ToolMode;
  };

  const handleTabClick = (nextTab: PaletteTab) => {
    setTab(nextTab);
    onToolSelect(toolModeForTab(nextTab));
  };

  const isActive = (option: string): boolean => {
    switch (tab) {
      case "decoration": return selectedDecorationType === option;
      case "landmark": return selectedLandmarkType === option;
      case "hazard": return selectedHazardType === option;
      case "objective": return selectedObjectiveType === option;
      case "tower": return selectedTowerType === option;
      default: return false;
    }
  };

  const handleSelect = (option: string) => {
    switch (tab) {
      case "decoration":
        onSelectDecoration(option as DecorationCategory);
        onToolSelect("decoration");
        break;
      case "landmark":
        onSelectLandmark(option as DecorationCategory);
        onToolSelect("landmark");
        break;
      case "hazard":
        onSelectHazard(option as HazardType);
        onToolSelect("hazard");
        break;
      case "objective":
        onSelectObjective(option as SpecialTowerType);
        onToolSelect("special_tower");
        break;
      case "tower":
        onSelectTower(option as TowerType);
        onToolSelect("tower");
        break;
    }
  };

  const getDragPayload = (option: string): PaletteDragPayload => {
    if (tab === "objective") return { kind: "objective", value: option };
    if (tab === "tower") return { kind: "tower", value: option };
    return { kind: tab as PaletteDragPayload["kind"], value: option };
  };

  const showThemeToggle = tab === "decoration" || tab === "hazard";

  return (
    <div className="rounded-xl border border-amber-800/30 bg-gradient-to-b from-stone-900/80 to-stone-950/80 p-3">
      <div className="text-[11px] uppercase tracking-wider text-amber-200/90 font-medium mb-2.5 inline-flex items-center gap-1.5">
        <Wand2 size={13} />
        Asset Palette
      </div>

      {/* Tab row */}
      <div className="flex gap-0.5 mb-2.5 bg-stone-950/60 rounded-lg p-0.5">
        {TAB_CONFIG.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              className={`flex-1 rounded-md px-1 py-1.5 text-[10px] inline-flex items-center justify-center gap-0.5 transition-all font-medium ${active
                ? "bg-amber-500/20 text-amber-100 shadow-sm shadow-amber-500/10 border border-amber-500/30"
                : "text-amber-400/60 hover:text-amber-300/80 hover:bg-stone-800/50 border border-transparent"
                }`}
            >
              <Icon size={10} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search + show all toggle */}
      <div className="mb-2 flex gap-1.5">
        <label className="relative flex-1">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400/50"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${TAB_CONFIG.find(t => t.key === tab)?.label ?? ""}...`}
            className="w-full rounded-lg border border-amber-800/30 bg-stone-950/70 pl-7 pr-2 py-1.5 text-xs text-amber-200 outline-none focus:border-amber-500/50 placeholder:text-amber-500/30 transition-colors"
          />
        </label>
        {showThemeToggle && (
          <button
            onClick={() => setShowAllThemes(!showAllThemes)}
            className={`rounded-lg border px-2.5 py-1 text-[10px] whitespace-nowrap transition-all font-medium ${showAllThemes
              ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
              : "border-amber-800/30 bg-stone-950/50 text-amber-400/60 hover:bg-stone-800/60"
              }`}
            title={showAllThemes ? "Showing all themes" : "Showing current theme only"}
          >
            {showAllThemes ? "All" : formatAssetName(theme)}
          </button>
        )}
      </div>

      {/* Items grid */}
      <div className="max-h-60 overflow-y-auto pr-0.5 scrollbar-thin">
        <div className="grid grid-cols-2 gap-1">
          {paletteOptions.length === 0 ? (
            <div className="col-span-2 rounded-lg border border-amber-900/40 bg-black/20 p-3 text-[11px] text-amber-400/50 text-center">
              No matches for &ldquo;{search}&rdquo;
            </div>
          ) : (
            paletteOptions.map((option) => (
              <AssetChip
                key={`${tab}-${option}`}
                label={getDisplayName(tab, option)}
                icon={React.createElement(tabIcon, { size: 11 })}
                active={isActive(option)}
                onSelect={() => handleSelect(option)}
                dragPayload={getDragPayload(option)}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-2 text-[10px] text-amber-400/40 flex items-center justify-between">
        <span>{paletteOptions.length} items</span>
        <span>click or drag to place</span>
      </div>
    </div>
  );
};
