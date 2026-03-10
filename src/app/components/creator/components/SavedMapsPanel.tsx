import React from "react";
import { MapPin, Play } from "lucide-react";
import type { CustomLevelDefinition } from "../../../customLevels/types";

interface SavedMapsPanelProps {
  customLevels: CustomLevelDefinition[];
  activeId?: string;
  onLoadLevel: (level: CustomLevelDefinition) => void;
  onPlayLevel: (levelId: string) => void;
}

export const SavedMapsPanel: React.FC<SavedMapsPanelProps> = ({
  customLevels,
  activeId,
  onLoadLevel,
  onPlayLevel,
}) => {
  return (
    <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2.5 text-xs">
      <div className="text-amber-200 font-medium mb-1 inline-flex items-center gap-1.5">
        <MapPin size={12} />
        Saved Maps
        {customLevels.length > 0 && (
          <span className="text-amber-400/70 font-normal">({customLevels.length})</span>
        )}
      </div>
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {customLevels.length === 0 ? (
          <div className="rounded-md border border-amber-900/70 bg-black/20 p-2 text-xs text-amber-300/70">
            No custom maps yet. Create one above!
          </div>
        ) : (
          customLevels.map((level) => {
            const isActive = level.id === activeId;
            return (
              <div
                key={level.id}
                className={`rounded-md border p-2 transition-colors ${isActive
                  ? "border-amber-500/60 bg-amber-900/20"
                  : "border-amber-800/40 bg-black/30 hover:bg-black/40"
                  }`}
              >
                <div className="text-sm text-amber-100 font-medium truncate">
                  {level.name}
                  {isActive && (
                    <span className="ml-1.5 text-[9px] uppercase tracking-wider text-amber-400/80 font-normal">
                      editing
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-amber-400/70 mb-1">
                  {level.theme} &middot; diff {level.difficulty}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onLoadLevel(level)}
                    className="rounded border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-[11px] hover:bg-amber-800/35 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onPlayLevel(level.id)}
                    className="rounded border border-emerald-700/60 bg-emerald-900/25 px-2 py-1 text-[11px] hover:bg-emerald-800/35 transition-colors inline-flex items-center gap-1"
                  >
                    <Play size={10} />
                    Play
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
