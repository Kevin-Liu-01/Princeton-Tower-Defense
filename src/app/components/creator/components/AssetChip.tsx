import { GripVertical } from "lucide-react";
import React from "react";

import type { PaletteDragPayload } from "../types";

interface AssetChipProps {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onSelect: () => void;
  dragPayload: PaletteDragPayload;
}

export const AssetChip: React.FC<AssetChipProps> = ({
  label,
  icon,
  active,
  onSelect,
  dragPayload,
}) => (
  <button
    draggable
    onDragStart={(event) => {
      event.dataTransfer.setData(
        "application/princeton-td-asset",
        JSON.stringify(dragPayload)
      );
      event.dataTransfer.effectAllowed = "copy";
    }}
    onClick={onSelect}
    className={`group inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] cursor-grab active:cursor-grabbing transition-all leading-tight ${
      active
        ? "border-amber-400/60 bg-amber-500/20 text-amber-100 shadow-sm shadow-amber-500/10"
        : "border-amber-900/40 bg-stone-900/50 text-amber-300/70 hover:bg-stone-800/60 hover:text-amber-200 hover:border-amber-700/40"
    }`}
    title={`${label} — drag to place`}
  >
    <GripVertical
      size={10}
      className="text-amber-500/30 group-hover:text-amber-400/50 shrink-0 -ml-0.5"
    />
    {icon && <span className="shrink-0 opacity-70">{icon}</span>}
    <span className="truncate">{label}</span>
  </button>
);
