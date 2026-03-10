import React from "react";
import {
  Compass,
  Landmark,
  Layers,
  MapPin,
  Paintbrush,
  Sparkles,
  Swords,
  Target,
  X,
} from "lucide-react";
import type { CreatorDraftState } from "../types";
import type { MapTheme } from "../../../types";
import { THEME_OPTIONS } from "../constants";
import { formatAssetName } from "../utils/gridUtils";

interface CreatorHeaderProps {
  draft: CreatorDraftState;
  selectedPresetId: string;
  waveTemplateOptions: { value: string; label: string }[];
  onUpdateDraft: (patch: Partial<CreatorDraftState>) => void;
  onApplyMapPreset: (presetId: string) => void;
  onClose: () => void;
}

export const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  draft,
  selectedPresetId,
  waveTemplateOptions,
  onUpdateDraft,
  onApplyMapPreset,
  onClose,
}) => {
  return (
    <div className="px-4 py-3 border-b border-amber-800/50 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-950/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-wide text-amber-100 inline-flex items-center gap-2">
            <Layers size={18} />
            Creator Sandbox
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/80">
            Design custom maps with paths, decorations, hazards, and wave configurations.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg border border-amber-700/50 bg-amber-900/30 hover:bg-amber-800/45 transition-colors"
          title="Close Creator"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
          <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
            <MapPin size={11} />
            Map Name
          </span>
          <input
            value={draft.name}
            onChange={(event) => onUpdateDraft({ name: event.target.value })}
            placeholder="My Custom Map"
            className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2.5 py-1 text-xs outline-none focus:border-amber-400"
          />
        </label>

        <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
          <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
            <Compass size={11} />
            Slug
          </span>
          <input
            value={draft.slug}
            onChange={(event) => onUpdateDraft({ slug: event.target.value })}
            placeholder="my-custom-map"
            className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2.5 py-1 text-xs outline-none focus:border-amber-400"
          />
        </label>

        <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
          <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
            <Paintbrush size={11} />
            Theme
          </span>
          <select
            value={draft.theme}
            onChange={(event) => onUpdateDraft({ theme: event.target.value as MapTheme })}
            className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
          >
            {THEME_OPTIONS.map((theme) => (
              <option key={theme} value={theme}>
                {formatAssetName(theme)}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
          <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
            <Target size={11} />
            Difficulty
          </span>
          <select
            value={draft.difficulty}
            onChange={(event) =>
              onUpdateDraft({ difficulty: Number(event.target.value) as 1 | 2 | 3 })
            }
            className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
          >
            <option value={1}>Easy</option>
            <option value={2}>Medium</option>
            <option value={3}>Hard</option>
          </select>
        </label>

        <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
          <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
            <Sparkles size={11} />
            Start Points
          </span>
          <input
            type="number"
            min={150}
            max={2500}
            value={draft.startingPawPoints}
            onChange={(event) =>
              onUpdateDraft({ startingPawPoints: Number(event.target.value) })
            }
            className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
            title="Starting paw points"
          />
        </label>

        <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
          <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
            <Swords size={11} />
            Map Preset
          </span>
          <select
            value={selectedPresetId}
            onChange={(event) => onApplyMapPreset(event.target.value)}
            className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
          >
            {waveTemplateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-2 block rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-1">
        <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
          <Landmark size={11} />
          Description
        </span>
        <textarea
          value={draft.description}
          onChange={(event) => onUpdateDraft({ description: event.target.value })}
          placeholder="Describe the map's encounter flow and style..."
          className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-3 py-1.5 text-xs outline-none focus:border-amber-400 min-h-[42px]"
        />
      </label>
    </div>
  );
};
