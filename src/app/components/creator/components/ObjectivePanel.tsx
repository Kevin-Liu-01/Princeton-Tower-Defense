import React from "react";
import {
  AlertTriangle,
  ChessRook,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { SpecialTowerType } from "../../../types";
import type { CreatorDraftState } from "../types";
import {
  OBJECTIVE_TYPE_STATS,
  SPECIAL_TOWER_TYPES,
} from "../constants";
import { formatAssetName } from "../utils/gridUtils";

interface ObjectivePanelProps {
  draft: CreatorDraftState;
  onToggleEnabled: (enabled: boolean) => void;
  onChangeType: (type: SpecialTowerType) => void;
  onChangeHp: (hp: number) => void;
}

export const ObjectivePanel: React.FC<ObjectivePanelProps> = ({
  draft,
  onToggleEnabled,
  onChangeType,
  onChangeHp,
}) => {
  const stats = OBJECTIVE_TYPE_STATS[draft.specialTowerType];

  return (
    <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2.5 text-xs">
      <div className="text-amber-200 font-medium mb-2 inline-flex items-center gap-1.5">
        <Sparkles size={12} />
        Objective
      </div>

      <label className="inline-flex items-center gap-2 mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.specialTowerEnabled}
          onChange={(event) => onToggleEnabled(event.target.checked)}
          className="accent-amber-500"
        />
        <span className="text-amber-200">Enable Objective</span>
      </label>

      <div className={`space-y-2 transition-opacity ${draft.specialTowerEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={draft.specialTowerType}
            onChange={(event) => onChangeType(event.target.value as SpecialTowerType)}
            className="rounded border border-amber-700/60 bg-stone-950 px-2 py-1.5 text-xs"
          >
            {SPECIAL_TOWER_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatAssetName(type)}
              </option>
            ))}
          </select>
          {draft.specialTowerType === "vault" ? (
            <div className="flex items-center gap-1">
              <span className="text-amber-400/80 text-[10px]">HP</span>
              <input
                type="number"
                min={1}
                max={3000}
                value={draft.specialTowerHp}
                onChange={(event) => onChangeHp(Number(event.target.value))}
                className="flex-1 rounded border border-amber-700/60 bg-stone-950 px-2 py-1.5 text-xs"
              />
            </div>
          ) : (
            <div className="rounded border border-amber-900/60 bg-black/25 px-2 py-1.5 text-amber-400/80 inline-flex items-center gap-1.5">
              <ChessRook size={11} />
              HP auto
            </div>
          )}
        </div>

        <div className="rounded border border-amber-900/60 bg-black/25 px-2 py-1.5 text-[11px] text-amber-300/85 space-y-1">
          <div className="font-medium text-amber-200">{stats.title}</div>
          <div className="inline-flex items-start gap-1.5">
            <Sparkles size={11} className="mt-[1px] shrink-0" />
            <span>{stats.effect}</span>
          </div>
          <div className="inline-flex items-start gap-1.5">
            <AlertTriangle size={11} className="mt-[1px] shrink-0" />
            <span>{stats.risk}</span>
          </div>
        </div>

        <div className="rounded border border-amber-900/60 bg-black/25 px-2 py-1.5 text-[11px] text-amber-400/80 inline-flex items-center gap-1.5">
          <MapPin size={11} />
          {draft.specialTowerPos
            ? `Placed at ${draft.specialTowerPos.x},${draft.specialTowerPos.y}`
            : "Not placed — use Objective tool to place"}
        </div>
      </div>
    </div>
  );
};
