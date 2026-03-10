import React from "react";
import {
  AlertTriangle,
  Route,
  Swords,
  Target,
  Wand2,
} from "lucide-react";
import type { EnemyType, WaveGroup } from "../../../types";
import { ENEMY_DATA } from "../../../constants";
import { ENEMY_OPTIONS } from "../constants";
import { formatAssetName } from "../utils/gridUtils";

interface WaveDesignerPanelProps {
  usingCustomWaves: boolean;
  customWaves: WaveGroup[][];
  templateWaves: WaveGroup[][];
  waveTemplate: string;
  waveTemplateOptions: { value: string; label: string }[];
  onStartCustomWaves: () => void;
  onUseTemplateWaves: () => void;
  onApplyPresetWaves: (presetId: string) => void;
  onAddWave: () => void;
  onRemoveWave: (waveIndex: number) => void;
  onAddWaveGroup: (waveIndex: number) => void;
  onUpdateWaveGroup: (waveIndex: number, groupIndex: number, patch: Partial<WaveGroup>) => void;
  onRemoveWaveGroup: (waveIndex: number, groupIndex: number) => void;
}

export const WaveDesignerPanel: React.FC<WaveDesignerPanelProps> = ({
  usingCustomWaves,
  customWaves,
  templateWaves,
  waveTemplate,
  waveTemplateOptions,
  onStartCustomWaves,
  onUseTemplateWaves,
  onApplyPresetWaves,
  onAddWave,
  onRemoveWave,
  onAddWaveGroup,
  onUpdateWaveGroup,
  onRemoveWaveGroup,
}) => {
  return (
    <div className="rounded-xl border border-amber-800/30 bg-gradient-to-b from-stone-900/80 to-stone-950/80 p-3 text-xs">
      <div className="text-[11px] uppercase tracking-wider text-amber-200/90 font-medium mb-2.5 inline-flex items-center gap-1.5">
        <Swords size={13} />
        Wave Designer
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={onStartCustomWaves}
          className={`rounded border px-2 py-1.5 text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors ${usingCustomWaves
            ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
            : "border-amber-700/60 bg-stone-900/70 text-amber-300/85 hover:bg-stone-800/80"
            }`}
        >
          <Wand2 size={11} />
          Custom
        </button>
        <button
          onClick={onUseTemplateWaves}
          className={`rounded border px-2 py-1.5 text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors ${usingCustomWaves
            ? "border-amber-700/60 bg-stone-900/70 text-amber-300/85 hover:bg-stone-800/80"
            : "border-emerald-500/70 bg-emerald-600/20 text-emerald-100"
            }`}
        >
          <Route size={11} />
          Template
        </button>
      </div>

      <div className="mb-2 rounded border border-amber-900/60 bg-black/20 px-2 py-1 text-[11px] text-amber-300/80 inline-flex items-center gap-1.5">
        <Route size={11} />
        {usingCustomWaves
          ? `${customWaves.length} custom wave(s)`
          : `Template: ${waveTemplate}`}
      </div>

      {!usingCustomWaves ? (
        <TemplateWavesView
          templateWaves={templateWaves}
          waveTemplateOptions={waveTemplateOptions}
          waveTemplate={waveTemplate}
          onApplyPresetWaves={onApplyPresetWaves}
        />
      ) : (
        <CustomWavesEditor
          customWaves={customWaves}
          onAddWave={onAddWave}
          onRemoveWave={onRemoveWave}
          onAddWaveGroup={onAddWaveGroup}
          onUpdateWaveGroup={onUpdateWaveGroup}
          onRemoveWaveGroup={onRemoveWaveGroup}
        />
      )}
    </div>
  );
};

const TemplateWavesView: React.FC<{
  templateWaves: WaveGroup[][];
  waveTemplateOptions: { value: string; label: string }[];
  waveTemplate: string;
  onApplyPresetWaves: (presetId: string) => void;
}> = ({ templateWaves, waveTemplateOptions, waveTemplate, onApplyPresetWaves }) => {
  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-[11px] text-amber-400/80 inline-flex items-center gap-1.5 mb-1">
          <Target size={11} />
          Wave Template
          <span className="text-amber-500/50 font-normal">(waves only)</span>
        </span>
        <select
          value={waveTemplate}
          onChange={(event) => onApplyPresetWaves(event.target.value)}
          className="w-full rounded border border-amber-700/60 bg-stone-950 px-2 py-1 text-xs"
        >
          {waveTemplateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {templateWaves.length > 0 ? (
        <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
          {templateWaves.map((wave, waveIndex) => (
            <div
              key={`template-wave-${waveIndex}`}
              className="rounded border border-amber-900/60 bg-black/20 p-2"
            >
              <div className="mb-1.5 text-[11px] text-amber-200 inline-flex items-center gap-1.5">
                <Target size={11} />
                Wave {waveIndex + 1}
                <span className="text-amber-400/60 font-normal">
                  ({wave.length} group{wave.length !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="space-y-1">
                {wave.map((group, groupIndex) => {
                  const enemyName = ENEMY_DATA[group.type]?.name ?? group.type;
                  return (
                    <div
                      key={`template-wave-${waveIndex}-group-${groupIndex}`}
                      className="grid grid-cols-[minmax(0,1fr)_44px_62px_56px] gap-1 rounded border border-amber-900/50 bg-stone-950/60 px-1.5 py-1 text-[10px]"
                    >
                      <span className="text-amber-100 truncate" title={enemyName}>
                        {enemyName}
                      </span>
                      <span className="text-amber-300/90 text-right">
                        x{group.count}
                      </span>
                      <span className="text-amber-300/80 text-right">
                        {group.interval}ms
                      </span>
                      <span className="text-amber-400/75 text-right">
                        {group.delay ? `+${group.delay}` : "start"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded border border-amber-900/60 bg-black/20 p-2 text-[11px] text-amber-300/75 inline-flex items-center gap-1.5">
          <AlertTriangle size={11} />
          No wave plan found for this preset.
        </div>
      )}
    </div>
  );
};

const CustomWavesEditor: React.FC<{
  customWaves: WaveGroup[][];
  onAddWave: () => void;
  onRemoveWave: (waveIndex: number) => void;
  onAddWaveGroup: (waveIndex: number) => void;
  onUpdateWaveGroup: (waveIndex: number, groupIndex: number, patch: Partial<WaveGroup>) => void;
  onRemoveWaveGroup: (waveIndex: number, groupIndex: number) => void;
}> = ({
  customWaves,
  onAddWave,
  onRemoveWave,
  onAddWaveGroup,
  onUpdateWaveGroup,
  onRemoveWaveGroup,
}) => {
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {customWaves.map((wave, waveIndex) => (
        <div
          key={`wave-${waveIndex}`}
          className="rounded border border-amber-900/60 bg-black/20 p-2"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] text-amber-200 inline-flex items-center gap-1.5">
              <Target size={11} />
              Wave {waveIndex + 1}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddWaveGroup(waveIndex)}
                className="rounded border border-amber-700/60 bg-amber-900/25 px-1.5 py-0.5 text-[10px] hover:bg-amber-800/35 transition-colors"
              >
                + Group
              </button>
              <button
                onClick={() => onRemoveWave(waveIndex)}
                className="rounded border border-red-700/60 bg-red-900/25 px-1.5 py-0.5 text-[10px] hover:bg-red-800/30 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            {wave.map((group, groupIndex) => (
              <div
                key={`wave-${waveIndex}-group-${groupIndex}`}
                className="grid grid-cols-[minmax(0,1fr)_64px_74px_56px_24px] gap-1"
              >
                <select
                  value={group.type}
                  onChange={(event) =>
                    onUpdateWaveGroup(waveIndex, groupIndex, {
                      type: event.target.value as EnemyType,
                    })
                  }
                  className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                >
                  {ENEMY_OPTIONS.map((enemyType) => {
                    const name = ENEMY_DATA[enemyType]?.name ?? enemyType;
                    return (
                      <option key={enemyType} value={enemyType}>
                        {name}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={group.count}
                  onChange={(event) =>
                    onUpdateWaveGroup(waveIndex, groupIndex, {
                      count: Math.max(1, Number(event.target.value)),
                    })
                  }
                  className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                  title="count"
                />
                <input
                  type="number"
                  min={80}
                  max={5000}
                  value={group.interval}
                  onChange={(event) =>
                    onUpdateWaveGroup(waveIndex, groupIndex, {
                      interval: Math.max(80, Number(event.target.value)),
                    })
                  }
                  className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                  title="interval (ms)"
                />
                <input
                  type="number"
                  min={0}
                  max={15000}
                  value={group.delay ?? 0}
                  onChange={(event) =>
                    onUpdateWaveGroup(waveIndex, groupIndex, {
                      delay: Math.max(0, Number(event.target.value)),
                    })
                  }
                  className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                  title="delay (ms)"
                />
                <button
                  onClick={() => onRemoveWaveGroup(waveIndex, groupIndex)}
                  className="rounded border border-red-700/60 bg-red-900/25 text-[10px] hover:bg-red-800/30 transition-colors"
                  title="remove group"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={onAddWave}
        className="w-full rounded border border-amber-700/60 bg-amber-900/25 px-2 py-1.5 text-[11px] hover:bg-amber-800/35 transition-colors"
      >
        + Add Wave
      </button>
    </div>
  );
};
