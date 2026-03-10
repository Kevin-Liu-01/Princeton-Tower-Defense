import React from "react";
import {
  AlertTriangle,
  Check,
  ChessRook,
  Circle,
  Compass,
  GitBranch,
  Paintbrush,
  Route,
  Shield,
  Sword,
  Target,
  User,
} from "lucide-react";
import type { CreatorDraftState, ToolMode, SelectionTarget } from "../types";
import type { TowerType } from "../../../types";
import { TOOL_OPTIONS, TOWER_DISPLAY_NAMES, TOWER_TYPE_OPTIONS, OBJECTIVE_TYPE_STATS } from "../constants";
import { formatPointLabel, formatAssetName } from "../utils/gridUtils";
import { getPointFromSelection } from "../utils/selectionUtils";

interface ToolbeltPanelProps {
  draft: CreatorDraftState;
  tool: ToolMode;
  selection: SelectionTarget | null;
  onToolSelect: (tool: ToolMode) => void;
  onToggleAllowedTower: (type: TowerType) => void;
}

const StatusDot: React.FC<{ ok: boolean; count?: number }> = ({ ok, count }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${ok ? "text-emerald-400" : "text-amber-500/70"}`}>
    {ok ? <Check size={10} strokeWidth={3} /> : <Circle size={8} />}
    {count !== undefined && <span className="tabular-nums">{count}</span>}
  </span>
);

export const ToolbeltPanel: React.FC<ToolbeltPanelProps> = ({
  draft,
  tool,
  selection,
  onToolSelect,
  onToggleAllowedTower,
}) => {
  const primaryReady = draft.primaryPath.length >= 4;
  const secondaryReady = draft.secondaryPath.length === 0 || draft.secondaryPath.length >= 4;
  const hasHero = Boolean(draft.heroSpawn);
  const hasName = Boolean(draft.name.trim());

  return (
    <div className="rounded-xl border border-amber-800/30 bg-gradient-to-b from-stone-900/80 to-stone-950/80 p-3">
      <div className="text-[11px] uppercase tracking-wider text-amber-200/90 font-medium mb-2.5 inline-flex items-center gap-1.5">
        <Compass size={13} />
        Tools & Setup
      </div>

      {/* Map checklist */}
      <div className="mb-3 rounded-lg border border-amber-800/25 bg-stone-950/50 p-2 space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mb-1">Map Checklist</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-amber-300/80">
            <StatusDot ok={hasName} /> Name
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300/80">
            <StatusDot ok={hasHero} /> Hero Spawn
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300/80">
            <StatusDot ok={primaryReady} count={draft.primaryPath.length} /> Path A
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300/80">
            <StatusDot ok={secondaryReady} count={draft.secondaryPath.length} /> Path B
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px] text-amber-400/60 pt-1 border-t border-amber-800/20 mt-1">
          <span className="inline-flex items-center gap-1">
            <Paintbrush size={9} /> {draft.decorations.length} deco
          </span>
          <span className="inline-flex items-center gap-1">
            <AlertTriangle size={9} /> {draft.hazards.length} hazard
          </span>
          <span className="inline-flex items-center gap-1">
            <ChessRook size={9} /> {draft.specialTowers.length} obj
          </span>
          <span className="inline-flex items-center gap-1">
            <Sword size={9} /> {draft.placedTowers.length} tower
          </span>
        </div>
      </div>

      {/* Tool buttons */}
      <div className="grid grid-cols-2 gap-1 mb-3">
        {TOOL_OPTIONS.map((entry) => {
          const Icon = entry.icon;
          const isActive = tool === entry.key;
          return (
            <button
              key={entry.key}
              onClick={() => onToolSelect(entry.key)}
              className={`rounded-lg border px-2 py-1.5 text-[11px] transition-all inline-flex items-center gap-1.5 font-medium ${isActive
                ? "border-amber-400/50 bg-amber-500/20 text-amber-100 shadow-sm shadow-amber-500/10"
                : "border-amber-900/40 bg-stone-900/50 text-amber-300/70 hover:bg-stone-800/60 hover:text-amber-200"
                }`}
            >
              <Icon size={12} />
              {entry.label}
            </button>
          );
        })}
      </div>

      {/* Allowed towers */}
      <div className="rounded-lg border border-amber-800/25 bg-stone-950/50 p-2">
        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mb-1.5 inline-flex items-center gap-1">
          <Shield size={9} />
          Allowed Towers
          <span className="text-amber-500/40 normal-case tracking-normal ml-0.5">
            {draft.allowedTowers.length === 0 ? "(all)" : `(${draft.allowedTowers.length})`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {TOWER_TYPE_OPTIONS.map((type) => {
            const isAllowed = draft.allowedTowers.length === 0 || draft.allowedTowers.includes(type);
            return (
              <button
                key={type}
                onClick={() => onToggleAllowedTower(type)}
                className={`rounded-md border px-1.5 py-1 text-[10px] text-left transition-all inline-flex items-center gap-1 ${isAllowed
                  ? "border-emerald-600/30 bg-emerald-900/15 text-emerald-300/90"
                  : "border-red-800/20 bg-red-900/10 text-red-400/50 line-through"
                  }`}
                title={isAllowed ? `${TOWER_DISPLAY_NAMES[type]} allowed` : `${TOWER_DISPLAY_NAMES[type]} restricted`}
              >
                {isAllowed ? <Check size={9} /> : <Circle size={8} />}
                <span className="truncate">{TOWER_DISPLAY_NAMES[type]}</span>
              </button>
            );
          })}
        </div>
        <div className="text-[9px] text-amber-500/35 mt-1">
          Empty = all allowed. Click to restrict.
        </div>
      </div>
    </div>
  );
};
