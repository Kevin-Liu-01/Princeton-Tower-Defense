import React from "react";
import { FolderOpen, Pencil, Play } from "lucide-react";
import type { CustomLevelDefinition } from "../../../customLevels/types";
import { formatAssetName } from "../utils/gridUtils";

interface SavedMapsPanelProps {
  customLevels: CustomLevelDefinition[];
  activeId?: string;
  onLoadLevel: (level: CustomLevelDefinition) => void;
  onPlayLevel: (levelId: string) => void;
}

const DIFFICULTY_DOT: Record<number, string> = {
  1: "bg-emerald-400",
  2: "bg-amber-400",
  3: "bg-red-400",
};

export const SavedMapsPanel: React.FC<SavedMapsPanelProps> = ({
  customLevels,
  activeId,
  onLoadLevel,
  onPlayLevel,
}) => {
  return (
    <div className="rounded-xl border border-amber-800/30 bg-gradient-to-b from-stone-900/80 to-stone-950/80 p-3 text-xs">
      <div className="text-[11px] uppercase tracking-wider text-amber-200/90 font-medium mb-2 inline-flex items-center gap-1.5">
        <FolderOpen size={13} />
        Saved Maps
        {customLevels.length > 0 && (
          <span className="text-amber-400/40 normal-case tracking-normal font-normal">
            ({customLevels.length})
          </span>
        )}
      </div>
      <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
        {customLevels.length === 0 ? (
          <div className="rounded-lg border border-amber-800/20 bg-stone-950/40 p-3 text-[11px] text-amber-500/40 text-center">
            No custom maps yet.
          </div>
        ) : (
          customLevels.map((level) => {
            const isActive = level.id === activeId;
            return (
              <div
                key={level.id}
                className={`rounded-lg border p-2 transition-all ${isActive
                  ? "border-amber-500/40 bg-amber-900/15"
                  : "border-amber-800/20 bg-stone-950/30 hover:bg-stone-900/40"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] text-amber-100 font-medium truncate flex items-center gap-1.5">
                      {level.name}
                      {isActive && (
                        <span className="text-[8px] uppercase tracking-wider text-amber-400/70 font-normal border border-amber-500/30 bg-amber-500/10 px-1 py-px rounded">
                          editing
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-400/50 mt-0.5 inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[level.difficulty] ?? "bg-amber-400"}`} />
                      {formatAssetName(level.theme)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onLoadLevel(level)}
                      className="rounded-md border border-amber-700/30 bg-amber-900/15 px-2 py-1 text-[10px] text-amber-200 hover:bg-amber-800/25 transition-colors inline-flex items-center gap-1"
                    >
                      <Pencil size={9} />
                      Edit
                    </button>
                    <button
                      onClick={() => onPlayLevel(level.id)}
                      className="rounded-md border border-emerald-600/30 bg-emerald-900/15 px-2 py-1 text-[10px] text-emerald-200 hover:bg-emerald-800/25 transition-colors inline-flex items-center gap-1"
                    >
                      <Play size={9} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
