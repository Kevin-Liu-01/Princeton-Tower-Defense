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
}) => {
  return (
    <button
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/princeton-td-asset",
          JSON.stringify(dragPayload)
        );
      }}
      onClick={onSelect}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] cursor-grab active:cursor-grabbing transition-colors ${active
        ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
        : "border-amber-900/60 bg-stone-900/70 text-amber-300/80 hover:bg-stone-800/80"
        }`}
      title="drag onto sandbox"
    >
      {icon}
      {label}
    </button>
  );
};
