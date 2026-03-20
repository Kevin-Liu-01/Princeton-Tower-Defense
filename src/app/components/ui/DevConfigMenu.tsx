"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Wrench } from "lucide-react";
import type { GameState, WaveGroup } from "../../types";
import type { GameProgress } from "../../hooks/useLocalStorage";
import { LEVEL_WAVES } from "../../constants/waves";

interface DevLevelOption {
  id: string;
  name: string;
}

interface DevActionResult {
  ok: boolean;
  message: string;
}

interface DevPerfSnapshot {
  fps: number;
  frameMs: number;
  updateMs: number;
  renderMs: number;
  quality: "high" | "medium" | "low";
  towers: number;
  enemies: number;
  troops: number;
  projectiles: number;
  effects: number;
  particles: number;
}

interface DevConfigMenuProps {
  gameState: GameState;
  selectedMap: string;
  levelOptions: DevLevelOption[];
  progress: GameProgress;
  devPerfEnabled: boolean;
  setDevPerfEnabled: (enabled: boolean) => void;
  devPerfSnapshot: DevPerfSnapshot;
  currentWave: number;
  totalWaves: number;
  waveInProgress: boolean;
  onUnlockLevel: (levelId: string) => void;
  onLockLevel: (levelId: string) => void;
  onUnlockAllLevels: () => void;
  onSetLevelStars: (levelId: string, stars: number) => void;
  onReplaceProgress: (candidate: unknown) => DevActionResult;
  onGrantPawPoints: (amount: number) => void;
  onAdjustLives: (delta: number) => void;
  onInstantVictory: () => void;
  onInstantLose: () => void;
  onSkipWave: () => void;
  onSkipToWave: (waveIndex: number) => void;
  onKillAllEnemies: () => void;
}

const clampStars = (value: number): number =>
  Math.max(0, Math.min(3, Math.round(value)));

function summarizeWaveGroups(groups: WaveGroup[]): string {
  const counts = new Map<string, number>();
  for (const g of groups) {
    counts.set(g.type, (counts.get(g.type) ?? 0) + g.count);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");
}

export const DevConfigMenu: React.FC<DevConfigMenuProps> = ({
  gameState,
  selectedMap,
  levelOptions,
  progress,
  devPerfEnabled,
  setDevPerfEnabled,
  devPerfSnapshot,
  currentWave,
  totalWaves,
  waveInProgress,
  onUnlockLevel,
  onLockLevel,
  onUnlockAllLevels,
  onSetLevelStars,
  onReplaceProgress,
  onGrantPawPoints,
  onAdjustLives,
  onInstantVictory,
  onInstantLose,
  onSkipWave,
  onSkipToWave,
  onKillAllEnemies,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [waveBrowserOpen, setWaveBrowserOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string>(
    levelOptions[0]?.id ?? ""
  );
  const [starsInput, setStarsInput] = useState("3");
  const [pawPointsInput, setPawPointsInput] = useState("10000");
  const [progressDraft, setProgressDraft] = useState<string>(() =>
    JSON.stringify(progress, null, 2)
  );
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (!levelOptions.length) return;
    if (!selectedLevelId || !levelOptions.some((option) => option.id === selectedLevelId)) {
      setSelectedLevelId(levelOptions[0].id);
    }
  }, [levelOptions, selectedLevelId]);

  const levelWaves = useMemo(
    () => LEVEL_WAVES[selectedMap] ?? [],
    [selectedMap]
  );

  const levelIsUnlocked = useMemo(
    () => progress.unlockedMaps.includes(selectedLevelId),
    [progress.unlockedMaps, selectedLevelId]
  );

  const currentStars = useMemo(
    () => progress.levelStars[selectedLevelId] ?? 0,
    [progress.levelStars, selectedLevelId]
  );

  const openMenu = () => {
    setProgressDraft(JSON.stringify(progress, null, 2));
    setFeedback(null);
    setIsOpen(true);
  };

  const handleSetStars = () => {
    if (!selectedLevelId) {
      setFeedback({ message: "Pick a level first.", isError: true });
      return;
    }

    const parsed = Number(starsInput);
    if (!Number.isFinite(parsed)) {
      setFeedback({ message: "Stars must be a number.", isError: true });
      return;
    }

    const normalizedStars = clampStars(parsed);
    onSetLevelStars(selectedLevelId, normalizedStars);
    setFeedback({
      message: `Set ${selectedLevelId} to ${normalizedStars} star${normalizedStars === 1 ? "" : "s"}.`,
      isError: false,
    });
  };

  const handleApplyProgressJson = () => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(progressDraft);
    } catch {
      setFeedback({ message: "Invalid JSON format.", isError: true });
      return;
    }

    const result = onReplaceProgress(parsed);
    setFeedback({ message: result.message, isError: !result.ok });
  };

  const handleGrantPawPoints = () => {
    const parsed = Math.round(Number(pawPointsInput));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFeedback({ message: "PawPoints amount must be > 0.", isError: true });
      return;
    }

    onGrantPawPoints(parsed);
    setFeedback({ message: `Granted ${parsed} PawPoints.`, isError: false });
  };

  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-[220] -translate-y-1/2">
      <div className="pointer-events-auto flex justify-end">
        {!isOpen ? (
          <button
            type="button"
            onClick={openMenu}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300/60 bg-black/80 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-100 shadow-lg backdrop-blur"
            title="Open dev config"
          >
            <Wrench size={14} />

            <ChevronDown size={14} />
          </button>
        ) : (
          <div className="w-[360px] max-w-[92vw] rounded-lg border border-amber-300/40 bg-black/85 p-3 text-xs text-amber-100 shadow-2xl backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-200">
                <Wrench size={14} />
                Dev Config
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 rounded border border-amber-300/40 px-2 py-1 font-semibold text-amber-200 hover:bg-amber-950/60"
                title="Close dev config"
              >
                Close
                <ChevronUp size={14} />
              </button>
            </div>

            <div className="space-y-3 max-h-[78dvh] overflow-y-auto pr-1">
              <section className="rounded border border-emerald-300/30 bg-emerald-950/30 p-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wide text-emerald-200">
                    Perf HUD
                  </span>
                  <button
                    type="button"
                    onClick={() => setDevPerfEnabled(!devPerfEnabled)}
                    className={`rounded border px-2 py-1 font-mono ${devPerfEnabled
                        ? "border-emerald-400/70 bg-emerald-900/60 text-emerald-100"
                        : "border-zinc-400/60 bg-zinc-900/60 text-zinc-200"
                      }`}
                  >
                    {devPerfEnabled ? "ON" : "OFF"}
                  </button>
                </div>
                {devPerfEnabled ? (
                  <div className="space-y-1 font-mono text-[11px] text-emerald-100">
                    <div>
                      fps {devPerfSnapshot.fps} | frame {devPerfSnapshot.frameMs}ms
                    </div>
                    <div>
                      update {devPerfSnapshot.updateMs}ms | render {devPerfSnapshot.renderMs}ms
                    </div>
                    <div>quality {devPerfSnapshot.quality}</div>
                    <div>
                      towers {devPerfSnapshot.towers} | enemies {devPerfSnapshot.enemies} | troops {devPerfSnapshot.troops}
                    </div>
                    <div>
                      proj {devPerfSnapshot.projectiles} | fx {devPerfSnapshot.effects} | particles {devPerfSnapshot.particles}
                    </div>
                  </div>
                ) : null}
              </section>

              {gameState === "playing" ? (
                <section className="rounded border border-blue-300/30 bg-blue-950/30 p-2">
                  <div className="mb-2 font-semibold uppercase tracking-wide text-blue-200">
                    In-Game Cheats
                  </div>

                  <div className="mb-2 flex items-center justify-between rounded border border-blue-300/20 bg-blue-900/20 px-2 py-1">
                    <span className="font-mono text-[11px] text-blue-100">
                      Wave {Math.min(currentWave + 1, totalWaves)}/{totalWaves}
                      {waveInProgress ? " (spawning)" : currentWave >= totalWaves ? " (done)" : " (idle)"}
                    </span>
                    <button
                      type="button"
                      disabled={currentWave >= totalWaves}
                      onClick={() => {
                        onSkipWave();
                        setFeedback({
                          message: `Skipped to wave ${Math.min(currentWave + 2, totalWaves)}/${totalWaves}.`,
                          isError: false,
                        });
                      }}
                      className="rounded border border-cyan-300/40 bg-cyan-900/40 px-2 py-0.5 text-[11px] font-semibold text-cyan-100 hover:bg-cyan-800/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Skip Wave
                    </button>
                  </div>

                  {levelWaves.length > 0 && (
                    <div className="mb-2 rounded border border-violet-300/20 bg-violet-900/15">
                      <button
                        type="button"
                        onClick={() => setWaveBrowserOpen((prev) => !prev)}
                        className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-semibold text-violet-200 hover:bg-violet-900/30"
                      >
                        {waveBrowserOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        Wave Browser ({levelWaves.length} waves)
                      </button>
                      {waveBrowserOpen && (
                        <div className="max-h-48 overflow-y-auto border-t border-violet-300/15 px-1 py-1">
                          {levelWaves.map((groups, idx) => {
                            const isCurrent = idx === currentWave;
                            const isPast = idx < currentWave;
                            return (
                              <div
                                key={idx}
                                className={`flex items-start gap-1.5 rounded px-1.5 py-1 ${
                                  isCurrent
                                    ? "bg-violet-700/30 ring-1 ring-violet-400/40"
                                    : isPast
                                      ? "opacity-50"
                                      : ""
                                }`}
                              >
                                <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
                                  <span className="font-mono text-[10px] font-bold text-violet-300">
                                    {idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isCurrent && !waveInProgress}
                                    onClick={() => {
                                      onSkipToWave(idx);
                                      setFeedback({
                                        message: `Jumped to wave ${idx + 1}/${totalWaves}.`,
                                        isError: false,
                                      });
                                    }}
                                    className="rounded border border-violet-400/40 bg-violet-900/40 px-1.5 py-0.5 text-[9px] font-semibold text-violet-100 hover:bg-violet-800/60 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    Jump
                                  </button>
                                </div>
                                <div className="min-w-0 flex-1 text-[10px] leading-snug text-violet-100/80">
                                  {summarizeWaveGroups(groups)}
                                  <span className="ml-1 text-violet-300/50">
                                    ({groups.reduce((sum, g) => sum + g.count, 0)} total)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onKillAllEnemies();
                      setFeedback({ message: "Killed all enemies on screen.", isError: false });
                    }}
                    className="mb-2 w-full rounded border border-rose-300/40 bg-rose-900/40 px-2 py-1 font-semibold text-rose-100 hover:bg-rose-800/50"
                  >
                    Kill All Enemies
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onInstantVictory();
                      setFeedback({ message: "Triggered instant victory.", isError: false });
                    }}
                    className="mb-2 w-full rounded border border-blue-300/40 bg-blue-900/40 px-2 py-1 font-semibold hover:bg-blue-800/50"
                  >
                    Instant Victory
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onInstantLose();
                      setFeedback({ message: "Triggered instant lose.", isError: false });
                    }}
                    className="mb-2 w-full rounded border border-red-300/40 bg-red-900/40 px-2 py-1 font-semibold text-red-200 hover:bg-red-800/50"
                  >
                    Instant Lose
                  </button>

                  <div className="mb-2 grid grid-cols-[90px_auto] gap-2">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={pawPointsInput}
                      onChange={(event) => setPawPointsInput(event.target.value)}
                      className="rounded border border-blue-300/40 bg-black/60 px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={handleGrantPawPoints}
                      className="rounded border border-blue-300/40 bg-blue-900/40 px-2 py-1 font-semibold hover:bg-blue-800/50"
                    >
                      Grant PawPoints
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => onAdjustLives(1)}
                      className="rounded border border-blue-300/40 bg-blue-900/40 px-2 py-1 font-semibold hover:bg-blue-800/50"
                    >
                      +1 Life
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustLives(5)}
                      className="rounded border border-blue-300/40 bg-blue-900/40 px-2 py-1 font-semibold hover:bg-blue-800/50"
                    >
                      +5 Lives
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustLives(-1)}
                      className="rounded border border-blue-300/40 bg-blue-900/40 px-2 py-1 font-semibold hover:bg-blue-800/50"
                    >
                      -1 Life
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustLives(-5)}
                      className="rounded border border-blue-300/40 bg-blue-900/40 px-2 py-1 font-semibold hover:bg-blue-800/50"
                    >
                      -5 Lives
                    </button>
                  </div>
                </section>
              ) : null}

              <section className="rounded border border-amber-300/30 bg-amber-950/30 p-2">
                <div className="mb-2 font-semibold uppercase tracking-wide text-amber-200">
                  Save &amp; Progress
                </div>

                <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-2">
                  <select
                    value={selectedLevelId}
                    onChange={(event) => setSelectedLevelId(event.target.value)}
                    className="rounded border border-amber-300/40 bg-black/60 px-2 py-1 text-[11px]"
                  >
                    {levelOptions.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedLevelId) return;
                      onUnlockLevel(selectedLevelId);
                      setFeedback({ message: `Unlocked ${selectedLevelId}.`, isError: false });
                    }}
                    className="rounded border border-amber-300/40 bg-amber-900/40 px-2 py-1 font-semibold hover:bg-amber-800/50"
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedLevelId) return;
                      onLockLevel(selectedLevelId);
                      setFeedback({ message: `Locked ${selectedLevelId}.`, isError: false });
                    }}
                    className="rounded border border-red-300/40 bg-red-900/35 px-2 py-1 font-semibold text-red-200 hover:bg-red-800/45"
                  >
                    Lock
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-[80px_auto] gap-2">
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={starsInput}
                    onChange={(event) => setStarsInput(event.target.value)}
                    className="rounded border border-amber-300/40 bg-black/60 px-2 py-1"
                    placeholder="0-3"
                  />
                  <button
                    type="button"
                    onClick={handleSetStars}
                    className="rounded border border-amber-300/40 bg-amber-900/40 px-2 py-1 font-semibold hover:bg-amber-800/50"
                  >
                    Set Stars
                  </button>
                </div>

                <div className="mb-2 text-[11px] text-amber-200/90">
                  Level: <span className="font-mono">{selectedLevelId || "(none)"}</span> | unlocked {levelIsUnlocked ? "yes" : "no"} | stars {currentStars}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUnlockAllLevels();
                    setFeedback({ message: "Unlocked all levels.", isError: false });
                  }}
                  className="mb-2 w-full rounded border border-amber-300/40 bg-amber-900/35 px-2 py-1 font-semibold hover:bg-amber-800/50"
                >
                  Unlock All Levels
                </button>

                <div className="mb-2 text-[11px] text-amber-300/85">
                  Unlocked {progress.unlockedMaps.length}/{levelOptions.length} levels
                </div>

                <div className="mb-1 flex items-center justify-between text-[11px] text-amber-200">
                  <span className="font-semibold">Data JSON</span>
                  <button
                    type="button"
                    onClick={() => setProgressDraft(JSON.stringify(progress, null, 2))}
                    className="rounded border border-amber-300/40 px-2 py-0.5 font-semibold hover:bg-amber-900/50"
                  >
                    Reload
                  </button>
                </div>
                <textarea
                  value={progressDraft}
                  onChange={(event) => setProgressDraft(event.target.value)}
                  className="h-28 w-full rounded border border-amber-300/40 bg-black/60 p-2 font-mono text-[10px] leading-relaxed text-amber-100"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={handleApplyProgressJson}
                  className="mt-2 w-full rounded border border-amber-300/40 bg-amber-900/40 px-2 py-1 font-semibold hover:bg-amber-800/50"
                >
                  Apply Data
                </button>
              </section>

              {feedback ? (
                <div
                  className={`rounded border px-2 py-1 text-[11px] ${feedback.isError
                      ? "border-red-400/50 bg-red-950/50 text-red-200"
                      : "border-emerald-400/50 bg-emerald-950/50 text-emerald-200"
                    }`}
                >
                  {feedback.message}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
