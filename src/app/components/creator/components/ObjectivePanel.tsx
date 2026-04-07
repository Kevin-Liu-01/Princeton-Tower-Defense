import {
  AlertTriangle,
  ChessRook,
  Download,
  MapPin,
  Sparkles,
  Trash2,
} from "lucide-react";
import React from "react";

import type { CustomSpecialTowerConfig } from "../../../customLevels/types";
import type { SpecialTowerType } from "../../../types";
import { OBJECTIVE_TYPE_STATS, SPECIAL_TOWER_TYPES } from "../constants";
import type { CreatorDraftState } from "../types";

interface ObjectivePanelProps {
  draft: CreatorDraftState;
  waveTemplateOptions: { value: string; label: string }[];
  onChangeType: (index: number, type: SpecialTowerType) => void;
  onChangeHp: (index: number, hp: number) => void;
  onRemove: (index: number) => void;
  onImportObjectives: (presetId: string) => void;
}

const ObjectiveRow: React.FC<{
  entry: CustomSpecialTowerConfig;
  index: number;
  onChangeType: (index: number, type: SpecialTowerType) => void;
  onChangeHp: (index: number, hp: number) => void;
  onRemove: (index: number) => void;
}> = ({ entry, index, onChangeType, onChangeHp, onRemove }) => {
  const stats = OBJECTIVE_TYPE_STATS[entry.type];
  return (
    <div className="rounded-lg border border-purple-800/25 bg-purple-950/15 p-2 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
          <ChessRook size={10} className="text-purple-300" />
        </div>
        <select
          value={entry.type}
          onChange={(event) =>
            onChangeType(index, event.target.value as SpecialTowerType)
          }
          className="flex-1 rounded-md border border-amber-800/30 bg-stone-950/60 px-2 py-1 text-[11px] text-amber-200 outline-none focus:border-amber-500/50"
        >
          {SPECIAL_TOWER_TYPES.map((type) => (
            <option key={type} value={type}>
              {OBJECTIVE_TYPE_STATS[type].title}
            </option>
          ))}
        </select>
        {entry.type === "vault" && (
          <div className="flex items-center gap-1">
            <span className="text-amber-400/60 text-[9px] uppercase">HP</span>
            <input
              type="number"
              min={1}
              max={3000}
              value={entry.hp ?? 800}
              onChange={(event) =>
                onChangeHp(index, Number(event.target.value))
              }
              className="w-14 rounded-md border border-amber-800/30 bg-stone-950/60 px-1.5 py-1 text-[11px] text-amber-200 outline-none tabular-nums"
            />
          </div>
        )}
        <button
          onClick={() => onRemove(index)}
          className="rounded-md border border-red-800/30 bg-red-900/15 p-1 hover:bg-red-800/25 transition-colors text-red-400/70 hover:text-red-300"
          title="Remove objective"
        >
          <Trash2 size={10} />
        </button>
      </div>
      <div className="flex items-center gap-3 text-[10px]">
        <span className="text-amber-300/60 inline-flex items-center gap-0.5">
          <Sparkles size={8} /> {stats.effect}
        </span>
      </div>
      <div className="text-[10px] text-amber-500/50 inline-flex items-center gap-0.5">
        <MapPin size={8} />
        {entry.pos ? `${entry.pos.x}, ${entry.pos.y}` : "Not placed"}
      </div>
    </div>
  );
};

export const ObjectivePanel: React.FC<ObjectivePanelProps> = ({
  draft,
  waveTemplateOptions,
  onChangeType,
  onChangeHp,
  onRemove,
  onImportObjectives,
}) => (
  <div className="rounded-xl border border-amber-800/30 bg-gradient-to-b from-stone-900/80 to-stone-950/80 p-3 text-xs">
    <div className="text-[11px] uppercase tracking-wider text-amber-200/90 font-medium mb-2.5 inline-flex items-center gap-1.5">
      <ChessRook size={13} />
      Objectives
      <span className="text-amber-400/40 normal-case tracking-normal font-normal text-[10px]">
        {draft.specialTowers.length} placed
      </span>
    </div>

    {draft.specialTowers.length === 0 ? (
      <div className="rounded-lg border border-amber-800/20 bg-stone-950/40 px-3 py-3 text-[11px] text-amber-500/40 text-center">
        No objectives placed yet.
        <br />
        <span className="text-[10px]">
          Drag from the Obj tab in the palette, or select Obj and click the map.
        </span>
      </div>
    ) : (
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
        {draft.specialTowers.map((entry, index) => (
          <ObjectiveRow
            key={`${entry.type}-${index}`}
            entry={entry}
            index={index}
            onChangeType={onChangeType}
            onChangeHp={onChangeHp}
            onRemove={onRemove}
          />
        ))}
      </div>
    )}

    <div className="mt-2 rounded-md border border-cyan-800/30 bg-cyan-950/15 p-2">
      <span className="text-[10px] text-cyan-300/70 inline-flex items-center gap-1 mb-1 font-medium uppercase tracking-wide">
        <Download size={9} />
        Import Objectives from Preset
      </span>
      <select
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) {
            onImportObjectives(event.target.value);
            event.target.value = "";
          }
        }}
        className="w-full rounded border border-cyan-700/40 bg-stone-950/80 px-2 py-1 text-xs text-cyan-200 outline-none focus:border-cyan-400/60"
        title="Replaces objectives with the selected preset's objectives"
      >
        <option value="" disabled>
          Select preset...
        </option>
        {waveTemplateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-[9px] text-cyan-500/40 mt-0.5">
        Only changes objectives
      </p>
    </div>
  </div>
);
