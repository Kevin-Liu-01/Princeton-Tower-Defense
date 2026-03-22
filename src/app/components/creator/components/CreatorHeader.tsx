import React, { useCallback, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  Layers,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import type { CreatorDraftState, PresetSection } from "../types";
import { ALL_PRESET_SECTIONS, PRESET_SECTION_LABELS } from "../types";
import type { MapTheme } from "../../../types";
import { THEME_OPTIONS } from "../constants";
import { formatAssetName } from "../utils/gridUtils";

interface CreatorHeaderProps {
  draft: CreatorDraftState;
  selectedPresetId: string;
  waveTemplateOptions: { value: string; label: string }[];
  onUpdateDraft: (patch: Partial<CreatorDraftState>) => void;
  onApplyMapPreset: (presetId: string) => void;
  onApplyPresetSections: (presetId: string, sections: PresetSection[]) => void;
  onClose: () => void;
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Easy", color: "text-emerald-300" },
  2: { label: "Medium", color: "text-amber-300" },
  3: { label: "Hard", color: "text-red-300" },
};

export const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  draft,
  selectedPresetId,
  waveTemplateOptions,
  onUpdateDraft,
  onApplyMapPreset,
  onApplyPresetSections,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [importPresetId, setImportPresetId] = useState(selectedPresetId);
  const [importSections, setImportSections] = useState<Set<PresetSection>>(
    () => new Set(ALL_PRESET_SECTIONS)
  );

  const toggleImportSection = useCallback((section: PresetSection) => {
    setImportSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handleImportSelected = useCallback(() => {
    const sections = ALL_PRESET_SECTIONS.filter((s) => importSections.has(s));
    if (sections.length === 0) return;
    onApplyPresetSections(importPresetId, sections);
  }, [importPresetId, importSections, onApplyPresetSections]);

  return (
    <div className="px-4 py-2.5 border-b border-amber-700/40 bg-gradient-to-r from-amber-950/40 via-stone-950/60 to-amber-950/40">
      {/* Top row: title + essential fields + close */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/40 flex items-center justify-center">
            <Layers size={16} className="text-amber-200" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-amber-100 leading-tight">
              Map Creator
            </h2>
            <p className="text-[10px] text-amber-400/60 leading-tight">
              {formatAssetName(draft.theme)} &middot; {DIFFICULTY_LABELS[draft.difficulty]?.label}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <input
            value={draft.name}
            onChange={(event) => onUpdateDraft({ name: event.target.value })}
            placeholder="Map Name"
            className="flex-1 min-w-[120px] max-w-[260px] rounded-lg border border-amber-700/50 bg-stone-900/80 px-3 py-1.5 text-sm text-amber-100 outline-none focus:border-amber-400/80 placeholder:text-amber-500/40 transition-colors"
          />

          <select
            value={draft.theme}
            onChange={(event) => onUpdateDraft({ theme: event.target.value as MapTheme })}
            className="rounded-lg border border-amber-700/50 bg-stone-900/80 px-2 py-1.5 text-xs text-amber-200 outline-none focus:border-amber-400/80"
          >
            {THEME_OPTIONS.map((theme) => (
              <option key={theme} value={theme}>
                {formatAssetName(theme)}
              </option>
            ))}
          </select>

          <select
            value={draft.difficulty}
            onChange={(event) =>
              onUpdateDraft({ difficulty: Number(event.target.value) as 1 | 2 | 3 })
            }
            className="rounded-lg border border-amber-700/50 bg-stone-900/80 px-2 py-1.5 text-xs text-amber-200 outline-none focus:border-amber-400/80"
          >
            <option value={1}>Easy</option>
            <option value={2}>Medium</option>
            <option value={3}>Hard</option>
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-amber-700/50 bg-stone-900/80 px-2 py-1 shrink-0">
            <Sparkles size={11} className="text-amber-400/70" />
            <input
              type="number"
              min={150}
              max={2500}
              value={draft.startingPawPoints}
              onChange={(event) =>
                onUpdateDraft({ startingPawPoints: Number(event.target.value) })
              }
              className="w-14 bg-transparent text-xs text-amber-200 outline-none tabular-nums"
              title="Starting paw points"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <select
              value={selectedPresetId}
              onChange={(event) => onApplyMapPreset(event.target.value)}
              className="rounded-lg border border-violet-600/50 bg-violet-950/40 px-2 py-1.5 text-xs text-violet-200 outline-none focus:border-violet-400/80 max-w-[140px]"
              title="Overwrites waves, paths, decorations, hazards, objectives, and theme from this preset"
            >
              {waveTemplateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-[9px] text-violet-400/60 whitespace-nowrap">Full Preset</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg border border-amber-700/40 bg-stone-900/50 hover:bg-stone-800/70 transition-colors text-amber-300/80"
            title={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-amber-700/40 bg-stone-900/50 hover:bg-red-900/40 hover:border-red-700/50 transition-colors text-amber-300/80 hover:text-red-200"
            title="Close Creator"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Expandable detail row */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-amber-800/30 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wide text-amber-400/60 inline-flex items-center gap-1">
                <Compass size={9} />
                Slug
              </span>
              <input
                value={draft.slug}
                onChange={(event) => onUpdateDraft({ slug: event.target.value })}
                placeholder="my-custom-map"
                className="w-full rounded-md border border-amber-700/40 bg-stone-900/60 px-2 py-1 text-xs text-amber-200 outline-none focus:border-amber-400/70"
              />
            </label>
            <label className="space-y-0.5 col-span-2 md:col-span-3">
              <span className="text-[10px] uppercase tracking-wide text-amber-400/60 inline-flex items-center gap-1">
                <MapPin size={9} />
                Description
              </span>
              <input
                value={draft.description}
                onChange={(event) => onUpdateDraft({ description: event.target.value })}
                placeholder="Describe the map..."
                className="w-full rounded-md border border-amber-700/40 bg-stone-900/60 px-2 py-1 text-xs text-amber-200 outline-none focus:border-amber-400/70"
              />
            </label>
          </div>

          {/* Selective preset import */}
          <div className="rounded-lg border border-cyan-700/30 bg-cyan-950/20 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-cyan-300/70 font-medium mb-1.5 inline-flex items-center gap-1.5">
              <Download size={10} />
              Import from Preset
            </div>
            <div className="flex items-end gap-3">
              <label className="space-y-0.5">
                <span className="text-[10px] text-cyan-400/60">Source</span>
                <select
                  value={importPresetId}
                  onChange={(event) => setImportPresetId(event.target.value)}
                  className="block rounded-md border border-cyan-700/40 bg-stone-950/80 px-2 py-1 text-xs text-cyan-200 outline-none focus:border-cyan-400/70"
                >
                  {waveTemplateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                {ALL_PRESET_SECTIONS.map((section) => (
                  <label
                    key={section}
                    className="inline-flex items-center gap-1 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={importSections.has(section)}
                      onChange={() => toggleImportSection(section)}
                      className="accent-cyan-500 w-3 h-3"
                    />
                    <span className={`text-[11px] ${importSections.has(section) ? "text-cyan-100" : "text-cyan-400/50"}`}>
                      {PRESET_SECTION_LABELS[section]}
                    </span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleImportSelected}
                disabled={importSections.size === 0}
                className="shrink-0 rounded-md border border-cyan-600/50 bg-cyan-700/30 px-3 py-1 text-[11px] text-cyan-100 hover:bg-cyan-600/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
