import type { MutableRefObject } from "react";

import { setPerformanceSettings } from "../../rendering/performance";
import type { EntityCounts } from "./renderScene";
import type { RenderQuality } from "./runtimeConfig";
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
  updateMs: number;
  renderMs: number;
  quality: RenderQuality;
  towers: number;
  enemies: number;
  troops: number;
  projectiles: number;
  effects: number;
  particles: number;
}

export function startGameLoop(
  refs: GameLoopRefs,
  setRenderDprCap: (fn: (prev: number) => number) => void,
  setDevPerfSnapshot: (snap: DevPerfSnapshot) => void
): () => void {
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

      refs.devPerfUpdateMsRef.current =
        refs.devPerfUpdateMsRef.current * 0.9 + updateMs * 0.1;
      refs.devPerfRenderMsRef.current =
        refs.devPerfRenderMsRef.current * 0.9 + renderMs * 0.1;

      if (timestamp - refs.devPerfLastPublishedAtRef.current >= 250) {
        refs.devPerfLastPublishedAtRef.current = timestamp;
        const counts = refs.entityCountsRef.current;
        const frameMs = refs.rollingFrameMsRef.current;
        setDevPerfSnapshot({
          effects: counts.effects,
          enemies: counts.enemies,
          fps: Math.round(1000 / Math.max(1, frameMs)),
          frameMs: Number(frameMs.toFixed(1)),
          particles: counts.particles,
          projectiles: counts.projectiles,
          quality: refs.renderQualityRef.current,
          renderMs: Number(refs.devPerfRenderMsRef.current.toFixed(2)),
          towers: counts.towers,
          troops: counts.troops,
          updateMs: Number(refs.devPerfUpdateMsRef.current.toFixed(2)),
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
  };
}
