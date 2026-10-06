import type { MutableRefObject } from "react";

import { clearEnemySpriteCache } from "../../rendering/enemies/enemySpriteCache";
import { setPerformanceSettings } from "../../rendering/performance";
import type { EntityCounts } from "./renderScene";
import {
  DEV_CONFIG_MENU_ENABLED,
  QUALITY_DOWNGRADE_TARGET,
  QUALITY_DOWNGRADE_THRESHOLD,
  QUALITY_DPR_CAP,
  QUALITY_SHADOW_MULTIPLIER,
  QUALITY_TRANSITION_COOLDOWN_MS,
  QUALITY_TRANSITION_MAX_COOLDOWN_MS,
  QUALITY_UPGRADE_TARGET,
  QUALITY_UPGRADE_THRESHOLD,
} from "./runtimeConfig";

type RenderQuality = keyof typeof QUALITY_DPR_CAP;

export interface GameLoopRefs {
  lastTimeRef: MutableRefObject<number>;
  gameLoopRef: MutableRefObject<number | undefined>;
  rollingFrameMsRef: MutableRefObject<number>;
  qualityLastChangedAtRef: MutableRefObject<number>;
  qualityThresholdSustainedSinceRef: MutableRefObject<number>;
  qualityCooldownMsRef: MutableRefObject<number>;
  renderQualityRef: MutableRefObject<RenderQuality>;
  gameSpeedRef: MutableRefObject<number>;
  devPerfEnabledRef: MutableRefObject<boolean>;
  devPerfLastPublishedAtRef: MutableRefObject<number>;
  devPerfUpdateMsRef: MutableRefObject<number>;
  devPerfRenderMsRef: MutableRefObject<number>;
  entityCountsRef: MutableRefObject<EntityCounts>;
  updateGameRef: MutableRefObject<(deltaTime: number) => void>;
  renderRef: MutableRefObject<() => void>;
  flushParticleQueueRef: MutableRefObject<() => void>;
}

export interface DevPerfSnapshot {
  fps: number;
  frameMs: number;
  frameP95Ms: number;
  updateMs: number;
  updateP95Ms: number;
  renderMs: number;
  renderP95Ms: number;
  sampleCount: number;
  quality: RenderQuality;
  towers: number;
  enemies: number;
  troops: number;
  projectiles: number;
  effects: number;
  particles: number;
}

interface PerformanceSampleWindow {
  count: number;
  cursor: number;
  values: Float64Array;
}

const PERFORMANCE_SAMPLE_CAPACITY = 120;
const PERFORMANCE_PERCENTILE = 0.95;

const createPerformanceSampleWindow = (): PerformanceSampleWindow => ({
  count: 0,
  cursor: 0,
  values: new Float64Array(PERFORMANCE_SAMPLE_CAPACITY),
});

const addPerformanceSample = (
  window: PerformanceSampleWindow,
  value: number
): void => {
  window.values[window.cursor] = value;
  window.cursor = (window.cursor + 1) % PERFORMANCE_SAMPLE_CAPACITY;
  window.count = Math.min(window.count + 1, PERFORMANCE_SAMPLE_CAPACITY);
};

const getPerformancePercentile = (
  window: PerformanceSampleWindow,
  percentile: number
): number => {
  if (window.count === 0) {
    return 0;
  }

  const sortedValues = window.values
    .slice(0, window.count)
    .toSorted((a, b) => a - b);
  const percentileIndex = Math.max(
    0,
    Math.ceil(sortedValues.length * percentile) - 1
  );
  return sortedValues[percentileIndex] ?? 0;
};

export function startGameLoop(
  refs: GameLoopRefs,
  setRenderDprCap: (fn: (prev: number) => number) => void,
  setDevPerfSnapshot: (snap: DevPerfSnapshot) => void
): () => void {
  // A fresh battle must not inherit the previous loop's elapsed frame time.
  refs.lastTimeRef.current = 0;
  const frameSamples = createPerformanceSampleWindow();
  const updateSamples = createPerformanceSampleWindow();
  const renderSamples = createPerformanceSampleWindow();

  const gameLoop = (timestamp: number) => {
    const rawDelta = refs.lastTimeRef.current
      ? timestamp - refs.lastTimeRef.current
      : 0;
    const cappedDelta = Math.min(rawDelta, 100);
    const sampleMs = Math.max(8, cappedDelta || 16.7);
    refs.rollingFrameMsRef.current =
      refs.rollingFrameMsRef.current * 0.9 + sampleMs * 0.1;

    if (
      timestamp - refs.qualityLastChangedAtRef.current >
      refs.qualityCooldownMsRef.current
    ) {
      const avgFrameMs = refs.rollingFrameMsRef.current;
      const currentQuality = refs.renderQualityRef.current;
      let nextQuality: RenderQuality = currentQuality;

      if (avgFrameMs > QUALITY_DOWNGRADE_THRESHOLD[currentQuality]) {
        nextQuality = QUALITY_DOWNGRADE_TARGET[currentQuality];
      } else if (avgFrameMs < QUALITY_UPGRADE_THRESHOLD[currentQuality]) {
        nextQuality = QUALITY_UPGRADE_TARGET[currentQuality];
      }

      if (nextQuality !== currentQuality) {
        const sustainedSince = refs.qualityThresholdSustainedSinceRef.current;
        if (sustainedSince === 0) {
          refs.qualityThresholdSustainedSinceRef.current = timestamp;
        } else if (timestamp - sustainedSince > 750) {
          refs.renderQualityRef.current = nextQuality;
          refs.qualityLastChangedAtRef.current = timestamp;
          refs.qualityThresholdSustainedSinceRef.current = 0;

          refs.qualityCooldownMsRef.current = Math.min(
            refs.qualityCooldownMsRef.current * 2,
            QUALITY_TRANSITION_MAX_COOLDOWN_MS
          );

          const nextDprCap = QUALITY_DPR_CAP[nextQuality];
          setRenderDprCap((prev) =>
            Math.abs(prev - nextDprCap) > 0.001 ? nextDprCap : prev
          );
          setPerformanceSettings({
            shadowQualityMultiplier: QUALITY_SHADOW_MULTIPLIER[nextQuality],
          });
        }
      } else {
        refs.qualityThresholdSustainedSinceRef.current = 0;

        if (
          refs.qualityCooldownMsRef.current > QUALITY_TRANSITION_COOLDOWN_MS
        ) {
          refs.qualityCooldownMsRef.current = Math.max(
            QUALITY_TRANSITION_COOLDOWN_MS,
            refs.qualityCooldownMsRef.current - cappedDelta
          );
        }
      }
    }

    const deltaTime = cappedDelta * refs.gameSpeedRef.current;
    refs.lastTimeRef.current = timestamp;
    const shouldSampleDevPerf =
      DEV_CONFIG_MENU_ENABLED && refs.devPerfEnabledRef.current;
    if (shouldSampleDevPerf) {
      const updateStart = performance.now();
      refs.updateGameRef.current(deltaTime);
      const updateMs = performance.now() - updateStart;
      refs.flushParticleQueueRef.current();

      const renderStart = performance.now();
      refs.renderRef.current();
      const renderMs = performance.now() - renderStart;

      if (rawDelta > 0) {
        addPerformanceSample(frameSamples, rawDelta);
      }
      addPerformanceSample(updateSamples, updateMs);
      addPerformanceSample(renderSamples, renderMs);

      refs.devPerfUpdateMsRef.current =
        refs.devPerfUpdateMsRef.current * 0.9 + updateMs * 0.1;
      refs.devPerfRenderMsRef.current =
        refs.devPerfRenderMsRef.current * 0.9 + renderMs * 0.1;

      if (timestamp - refs.devPerfLastPublishedAtRef.current >= 250) {
        refs.devPerfLastPublishedAtRef.current = timestamp;
        const counts = refs.entityCountsRef.current;
        const frameMs = refs.rollingFrameMsRef.current;
        const frameP95Ms = getPerformancePercentile(
          frameSamples,
          PERFORMANCE_PERCENTILE
        );
        const updateP95Ms = getPerformancePercentile(
          updateSamples,
          PERFORMANCE_PERCENTILE
        );
        const renderP95Ms = getPerformancePercentile(
          renderSamples,
          PERFORMANCE_PERCENTILE
        );
        setDevPerfSnapshot({
          effects: counts.effects,
          enemies: counts.enemies,
          fps: Math.round(1000 / Math.max(1, frameMs)),
          frameMs: Number(frameMs.toFixed(1)),
          frameP95Ms: Number(frameP95Ms.toFixed(1)),
          particles: counts.particles,
          projectiles: counts.projectiles,
          quality: refs.renderQualityRef.current,
          renderMs: Number(refs.devPerfRenderMsRef.current.toFixed(2)),
          renderP95Ms: Number(renderP95Ms.toFixed(2)),
          sampleCount: frameSamples.count,
          towers: counts.towers,
          troops: counts.troops,
          updateMs: Number(refs.devPerfUpdateMsRef.current.toFixed(2)),
          updateP95Ms: Number(updateP95Ms.toFixed(2)),
        });
      }
    } else {
      refs.updateGameRef.current(deltaTime);
      refs.flushParticleQueueRef.current();
      refs.renderRef.current();
    }
    refs.gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  refs.gameLoopRef.current = requestAnimationFrame(gameLoop);
  return () => {
    if (refs.gameLoopRef.current) {
      cancelAnimationFrame(refs.gameLoopRef.current);
    }
    clearEnemySpriteCache();
  };
}
