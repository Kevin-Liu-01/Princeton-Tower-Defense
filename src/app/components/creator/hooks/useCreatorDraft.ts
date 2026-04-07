import { useCallback, useMemo, useRef, useState } from "react";

import { LEVEL_WAVES } from "../../../constants";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
  CustomPlacedTowerConfig,
  CustomSpecialTowerConfig,
} from "../../../customLevels/types";
import type { WaveGroup } from "../../../types";
import type {
  DecorationCategory,
  HazardType,
  MapDecoration,
  MapHazard,
} from "../../../types";
import {
  DEFAULT_PRESET_ID,
  LANDMARK_OPTIONS,
  HAZARD_OPTIONS_BY_THEME,
  ALL_HAZARD_OPTIONS,
  MAP_PRESET_TEMPLATES,
  DECORATION_OPTIONS_BY_THEME,
} from "../constants";
import type {
  CreatorDraftState,
  MapPresetTemplate,
  PresetSection,
  SelectionTarget,
} from "../types";
import type { GridPoint } from "../types";
import {
  cloneDraftState,
  createDefaultPresetWaves,
  createDefaultWaveGroup,
  createEmptyDraft,
  levelToDraft,
  validateDraft,
} from "../utils/draftUtils";
import { exportMapToFile, importMapFromFile } from "../utils/mapFileIO";
import { removeSelection } from "../utils/selectionUtils";

const cloneDecorations = (
  decorations: MapDecoration[] | undefined
): MapDecoration[] =>
  (decorations ?? []).map((deco) => ({ ...deco, pos: { ...deco.pos } }));

const cloneHazards = (hazards: MapHazard[] | undefined): MapHazard[] =>
  (hazards ?? []).map((hazard) => ({
    ...hazard,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
    pos: hazard.pos ? { ...(hazard.pos as GridPoint) } : hazard.pos,
  }));

export interface CreatorDraftActions {
  draft: CreatorDraftState;
  draftRef: React.RefObject<CreatorDraftState>;
  setDraft: React.Dispatch<React.SetStateAction<CreatorDraftState>>;
  pushDraftHistory: (nextDraft: CreatorDraftState) => void;
  applyDraftUpdate: (
    updater: (prev: CreatorDraftState) => CreatorDraftState
  ) => void;
  undoDraft: () => void;
  redoDraft: () => void;
  resetDraft: () => void;
  loadLevel: (level: CustomLevelDefinition) => void;
  saveDraft: () => void;
  deleteCurrentDraft: () => void;
  eraseSelection: (
    selection: SelectionTarget | null,
    clearSelection: () => void
  ) => void;
  applyMapPreset: (presetId: string) => void;
  applyPresetSections: (presetId: string, sections: PresetSection[]) => void;
  applyPresetWaves: (presetId: string) => void;
  applyPresetObjectives: (presetId: string) => void;
  exportMap: () => void;
  importMap: () => Promise<void>;
  validationStatus: string[];
  errors: string[];
  notice: string | null;
  clearMessages: () => void;
  undoStack: CreatorDraftState[];
  redoStack: CreatorDraftState[];
  selectedPresetId: string;
  mapPresetById: Map<string, MapPresetTemplate>;
  waveTemplateOptions: { value: string; label: string }[];
  usingCustomWaves: boolean;
  templateWaves: WaveGroup[][];
  startCustomWaves: () => void;
  useTemplateWaves: () => void;
  addWave: () => void;
  removeWave: (waveIndex: number) => void;
  addWaveGroup: (waveIndex: number) => void;
  updateWaveGroup: (
    waveIndex: number,
    groupIndex: number,
    patch: Partial<WaveGroup>
  ) => void;
  removeWaveGroup: (waveIndex: number, groupIndex: number) => void;
}

export function useCreatorDraft(
  onSaveLevel: (draft: CustomLevelDraftInput) => CustomLevelUpsertResult,
  onDeleteLevel: (levelId: string) => void
): CreatorDraftActions {
  const [draft, setDraft] = useState<CreatorDraftState>(createEmptyDraft);
  const [undoStack, setUndoStack] = useState<CreatorDraftState[]>([]);
  const [redoStack, setRedoStack] = useState<CreatorDraftState[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>(DEFAULT_PRESET_ID);

  const draftRef = useRef<CreatorDraftState>(draft);

  const clearMessages = useCallback(() => {
    setErrors([]);
    setNotice(null);
  }, []);

  const waveTemplateOptions = useMemo(
    () =>
      MAP_PRESET_TEMPLATES.map((preset) => ({
        label: preset.label,
        value: preset.id,
      })),
    []
  );

  const mapPresetById = useMemo(
    () =>
      new Map<string, MapPresetTemplate>(
        MAP_PRESET_TEMPLATES.map((preset) => [preset.id, preset])
      ),
    []
  );

  const resolvePresetId = useCallback(
    (presetId: string): string =>
      mapPresetById.has(presetId) ? presetId : DEFAULT_PRESET_ID,
    [mapPresetById]
  );

  const pushDraftHistory = useCallback((nextDraft: CreatorDraftState): void => {
    const prev = draftRef.current;
    if (nextDraft === prev) {
      return;
    }
    setUndoStack((stack) => [...stack.slice(-119), cloneDraftState(prev)]);
    setRedoStack([]);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, []);

  const applyDraftUpdate = useCallback(
    (updater: (prev: CreatorDraftState) => CreatorDraftState): void => {
      const prev = draftRef.current;
      const next = updater(prev);
      if (next === prev) {
        return;
      }
      pushDraftHistory(next);
    },
    [pushDraftHistory]
  );

  const undoDraft = useCallback((): void => {
    setUndoStack((stack) => {
      if (stack.length === 0) {
        return stack;
      }
      const previous = stack.at(-1);
      setRedoStack((future) => [...future, cloneDraftState(draftRef.current)]);
      const restored = cloneDraftState(previous);
      draftRef.current = restored;
      setDraft(restored);
      return stack.slice(0, -1);
    });
  }, []);

  const redoDraft = useCallback((): void => {
    setRedoStack((stack) => {
      if (stack.length === 0) {
        return stack;
      }
      const next = stack.at(-1);
      setUndoStack((past) => [...past, cloneDraftState(draftRef.current)]);
      const restored = cloneDraftState(next);
      draftRef.current = restored;
      setDraft(restored);
      return stack.slice(0, -1);
    });
  }, []);

  const resetDraft = useCallback((): void => {
    const empty = createEmptyDraft();
    draftRef.current = empty;
    setDraft(empty);
    setSelectedPresetId(DEFAULT_PRESET_ID);
    setUndoStack([]);
    setRedoStack([]);
    clearMessages();
  }, [clearMessages]);

  const loadLevel = useCallback(
    (level: CustomLevelDefinition): void => {
      const nextDraft = levelToDraft(level);
      const presetId = resolvePresetId(nextDraft.waveTemplate);
      const normalizedDraft =
        nextDraft.waveTemplate === presetId
          ? nextDraft
          : { ...nextDraft, waveTemplate: presetId };
      draftRef.current = normalizedDraft;
      setDraft(normalizedDraft);
      setSelectedPresetId(presetId);
      setUndoStack([]);
      setRedoStack([]);
      clearMessages();
    },
    [resolvePresetId, clearMessages]
  );

  const saveDraft = useCallback((): void => {
    const currentDraft = draftRef.current;
    const validationErrors = validateDraft(currentDraft);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setNotice(null);
      return;
    }

    const payload: CustomLevelDraftInput = {
      allowedTowers:
        currentDraft.allowedTowers.length > 0
          ? currentDraft.allowedTowers
          : undefined,
      customWaves:
        currentDraft.customWaves.length > 0
          ? currentDraft.customWaves.map((wave) =>
              wave.map((group) => ({ ...group }))
            )
          : undefined,
      decorations: currentDraft.decorations,
      description: currentDraft.description,
      difficulty: currentDraft.difficulty,
      hazards: currentDraft.hazards,
      heroSpawn: currentDraft.heroSpawn ?? undefined,
      id: currentDraft.id,
      name: currentDraft.name,
      placedTowers:
        currentDraft.placedTowers.length > 0
          ? currentDraft.placedTowers
          : undefined,
      primaryPath: currentDraft.primaryPath,
      secondaryPath:
        currentDraft.secondaryPath.length > 0
          ? currentDraft.secondaryPath
          : undefined,
      slug: currentDraft.slug,
      specialTower:
        currentDraft.specialTowers.length === 1
          ? currentDraft.specialTowers[0]
          : undefined,
      specialTowers:
        currentDraft.specialTowers.length > 0
          ? currentDraft.specialTowers
          : undefined,
      startingPawPoints: currentDraft.startingPawPoints,
      theme: currentDraft.theme,
      waveTemplate: currentDraft.waveTemplate,
    };

    const result = onSaveLevel(payload);
    if (!result.ok || !result.level) {
      setErrors(result.errors ?? ["Failed to save map."]);
      setNotice(null);
      return;
    }

    const nextDraft = levelToDraft(result.level);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    setSelectedPresetId(resolvePresetId(nextDraft.waveTemplate));
    setUndoStack([]);
    setRedoStack([]);
    setNotice(`Saved "${result.level.name}". Ready to playtest.`);
    setErrors([]);
  }, [onSaveLevel, resolvePresetId]);

  const deleteCurrentDraft = useCallback((): void => {
    const currentDraft = draftRef.current;
    if (!currentDraft.id) {
      return;
    }
    if (!window.confirm(`Delete "${currentDraft.name || currentDraft.id}"?`)) {
      return;
    }
    onDeleteLevel(currentDraft.id);
    resetDraft();
  }, [onDeleteLevel, resetDraft]);

  const eraseSelection = useCallback(
    (selection: SelectionTarget | null, clearSelection: () => void): void => {
      if (!selection) {
        return;
      }
      applyDraftUpdate((prev) => removeSelection(prev, selection));
      clearSelection();
    },
    [applyDraftUpdate]
  );

  const applyMapPreset = useCallback(
    (presetId: string): void => {
      const nextPresetId = resolvePresetId(presetId);
      const preset = mapPresetById.get(nextPresetId);
      if (!preset) {
        return;
      }

      const presetDecorations = cloneDecorations(preset.decorations);
      const presetHazards = cloneHazards(preset.hazards);
      const specialTowers: CustomSpecialTowerConfig[] =
        preset.specialTowers.map((st) => ({
          hp: st.hp,
          pos: { ...st.pos },
          type: st.type,
        }));

      applyDraftUpdate((prev) => ({
        ...prev,
        customWaves: [],
        decorations: presetDecorations,
        difficulty: preset.difficulty ?? prev.difficulty,
        hazards: presetHazards,
        heroSpawn: preset.heroSpawn ? { ...preset.heroSpawn } : prev.heroSpawn,
        primaryPath: preset.primaryPath
          ? preset.primaryPath.map((p) => ({ ...p }))
          : prev.primaryPath,
        secondaryPath: preset.secondaryPath
          ? preset.secondaryPath.map((p) => ({ ...p }))
          : [],
        specialTowers,
        startingPawPoints: preset.startingPawPoints ?? prev.startingPawPoints,
        theme: preset.theme ?? prev.theme,
        waveTemplate: nextPresetId,
      }));

      setSelectedPresetId(nextPresetId);
      setNotice(
        nextPresetId === DEFAULT_PRESET_ID
          ? 'Applied "Default" preset: blank map + 1 starter wave.'
          : `Loaded "${preset.label}" defaults.`
      );
      setErrors([]);
    },
    [resolvePresetId, mapPresetById, applyDraftUpdate]
  );

  const applyPresetSections = useCallback(
    (presetId: string, sections: PresetSection[]): void => {
      const nextPresetId = resolvePresetId(presetId);
      const preset = mapPresetById.get(nextPresetId);
      if (!preset || sections.length === 0) {
        return;
      }

      const sectionSet = new Set(sections);

      applyDraftUpdate((prev) => {
        const next = { ...prev };

        if (sectionSet.has("theme")) {
          next.theme = preset.theme ?? prev.theme;
          next.difficulty = preset.difficulty ?? prev.difficulty;
          next.startingPawPoints =
            preset.startingPawPoints ?? prev.startingPawPoints;
        }
        if (sectionSet.has("waves")) {
          next.waveTemplate = nextPresetId;
          next.customWaves = [];
        }
        if (sectionSet.has("paths")) {
          if (preset.primaryPath) {
            next.primaryPath = preset.primaryPath.map((p) => ({ ...p }));
          }
          next.secondaryPath = preset.secondaryPath
            ? preset.secondaryPath.map((p) => ({ ...p }))
            : [];
          if (preset.heroSpawn) {
            next.heroSpawn = { ...preset.heroSpawn };
          }
        }
        if (sectionSet.has("decorations")) {
          next.decorations = cloneDecorations(preset.decorations);
        }
        if (sectionSet.has("hazards")) {
          next.hazards = cloneHazards(preset.hazards);
        }
        if (sectionSet.has("objectives")) {
          next.specialTowers = preset.specialTowers.map((st) => ({
            hp: st.hp,
            pos: { ...st.pos },
            type: st.type,
          }));
        }

        return next;
      });

      const sectionNames = sections.map((s) =>
        s === "theme" ? "theme/settings" : s
      );
      setNotice(`Imported ${sectionNames.join(", ")} from "${preset.label}".`);
      setErrors([]);
    },
    [resolvePresetId, mapPresetById, applyDraftUpdate]
  );

  const applyPresetWaves = useCallback(
    (presetId: string): void => {
      applyPresetSections(presetId, ["waves"]);
    },
    [applyPresetSections]
  );

  const applyPresetObjectives = useCallback(
    (presetId: string): void => {
      applyPresetSections(presetId, ["objectives"]);
    },
    [applyPresetSections]
  );

  const exportMap = useCallback((): void => {
    exportMapToFile(draftRef.current);
    setNotice("Map exported to file.");
  }, [draftRef]);

  const importMap = useCallback(async (): Promise<void> => {
    try {
      const imported = await importMapFromFile();
      pushDraftHistory(draftRef.current);
      setDraft(imported);
      draftRef.current = imported;
      setNotice(`Imported "${imported.name || "Untitled"}".`);
      setErrors([]);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Import failed."]);
    }
  }, [draftRef, pushDraftHistory, setDraft]);

  // Wave editing
  const startCustomWaves = useCallback((): void => {
    applyDraftUpdate((prev) => {
      if (prev.customWaves.length > 0) {
        return prev;
      }
      return { ...prev, customWaves: [[createDefaultWaveGroup()]] };
    });
  }, [applyDraftUpdate]);

  const useTemplateWaves = useCallback((): void => {
    applyDraftUpdate((prev) => {
      if (prev.customWaves.length === 0) {
        return prev;
      }
      return { ...prev, customWaves: [] };
    });
  }, [applyDraftUpdate]);

  const addWave = useCallback((): void => {
    applyDraftUpdate((prev) => ({
      ...prev,
      customWaves: [...prev.customWaves, [createDefaultWaveGroup()]],
    }));
  }, [applyDraftUpdate]);

  const removeWave = useCallback(
    (waveIndex: number): void => {
      applyDraftUpdate((prev) => {
        const nextWaves = prev.customWaves.filter(
          (_, index) => index !== waveIndex
        );
        return { ...prev, customWaves: nextWaves };
      });
    },
    [applyDraftUpdate]
  );

  const addWaveGroup = useCallback(
    (waveIndex: number): void => {
      applyDraftUpdate((prev) => {
        const next = prev.customWaves.map((wave, index) =>
          index === waveIndex ? [...wave, createDefaultWaveGroup()] : wave
        );
        return { ...prev, customWaves: next };
      });
    },
    [applyDraftUpdate]
  );

  const updateWaveGroup = useCallback(
    (
      waveIndex: number,
      groupIndex: number,
      patch: Partial<WaveGroup>
    ): void => {
      applyDraftUpdate((prev) => {
        const wave = prev.customWaves[waveIndex];
        if (!wave) {
          return prev;
        }
        const group = wave[groupIndex];
        if (!group) {
          return prev;
        }
        const nextWaves = [...prev.customWaves];
        const nextWave = [...wave];
        nextWave[groupIndex] = { ...group, ...patch };
        nextWaves[waveIndex] = nextWave;
        return { ...prev, customWaves: nextWaves };
      });
    },
    [applyDraftUpdate]
  );

  const removeWaveGroup = useCallback(
    (waveIndex: number, groupIndex: number): void => {
      applyDraftUpdate((prev) => {
        const wave = prev.customWaves[waveIndex];
        if (!wave) {
          return prev;
        }
        const nextWave = wave.filter((_, index) => index !== groupIndex);
        const nextWaves = [...prev.customWaves];
        if (nextWave.length === 0) {
          nextWaves.splice(waveIndex, 1);
        } else {
          nextWaves[waveIndex] = nextWave;
        }
        return { ...prev, customWaves: nextWaves };
      });
    },
    [applyDraftUpdate]
  );

  const validationStatus = useMemo(() => validateDraft(draft), [draft]);
  const usingCustomWaves = draft.customWaves.length > 0;
  const templateWaves = useMemo(
    () =>
      draft.waveTemplate === DEFAULT_PRESET_ID
        ? createDefaultPresetWaves()
        : (LEVEL_WAVES[draft.waveTemplate] ?? []),
    [draft.waveTemplate]
  );

  return {
    addWave,
    addWaveGroup,
    applyDraftUpdate,
    applyMapPreset,
    applyPresetObjectives,
    applyPresetSections,
    applyPresetWaves,
    clearMessages,
    deleteCurrentDraft,
    draft,
    draftRef,
    eraseSelection,
    errors,
    exportMap,
    importMap,
    loadLevel,
    mapPresetById,
    notice,
    pushDraftHistory,
    redoDraft,
    redoStack,
    removeWave,
    removeWaveGroup,
    resetDraft,
    saveDraft,
    selectedPresetId,
    setDraft,
    startCustomWaves,
    templateWaves,
    undoDraft,
    undoStack,
    updateWaveGroup,
    useTemplateWaves,
    usingCustomWaves,
    validationStatus,
    waveTemplateOptions,
  };
}
