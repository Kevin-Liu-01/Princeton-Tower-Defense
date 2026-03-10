import { useCallback, useMemo, useRef, useState } from "react";
import { LEVEL_WAVES } from "../../../constants";
import type { WaveGroup } from "../../../types";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
  CustomPlacedTowerConfig,
  CustomSpecialTowerConfig,
} from "../../../customLevels/types";
import type {
  CreatorDraftState,
  MapPresetTemplate,
  PresetSection,
  SelectionTarget,
} from "../types";
import type { DecorationCategory, HazardType, MapDecoration, MapHazard } from "../../../types";
import {
  DEFAULT_PRESET_ID,
  LANDMARK_OPTIONS,
  HAZARD_OPTIONS_BY_THEME,
  ALL_HAZARD_OPTIONS,
  MAP_PRESET_TEMPLATES,
  DECORATION_OPTIONS_BY_THEME,
} from "../constants";
import {
  cloneDraftState,
  createDefaultPresetWaves,
  createDefaultWaveGroup,
  createEmptyDraft,
  levelToDraft,
  validateDraft,
} from "../utils/draftUtils";
import { removeSelection } from "../utils/selectionUtils";
import { exportMapToFile, importMapFromFile } from "../utils/mapFileIO";
import type { GridPoint } from "../types";

const cloneDecorations = (decorations: MapDecoration[] | undefined): MapDecoration[] =>
  (decorations ?? []).map((deco) => ({ ...deco, pos: { ...deco.pos } }));

const cloneHazards = (hazards: MapHazard[] | undefined): MapHazard[] =>
  (hazards ?? []).map((hazard) => ({
    ...hazard,
    pos: hazard.pos ? { ...(hazard.pos as GridPoint) } : hazard.pos,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
  }));

export interface CreatorDraftActions {
  draft: CreatorDraftState;
  draftRef: React.RefObject<CreatorDraftState>;
  setDraft: React.Dispatch<React.SetStateAction<CreatorDraftState>>;
  pushDraftHistory: (nextDraft: CreatorDraftState) => void;
  applyDraftUpdate: (updater: (prev: CreatorDraftState) => CreatorDraftState) => void;
  undoDraft: () => void;
  redoDraft: () => void;
  resetDraft: () => void;
  loadLevel: (level: CustomLevelDefinition) => void;
  saveDraft: () => void;
  deleteCurrentDraft: () => void;
  eraseSelection: (selection: SelectionTarget | null, clearSelection: () => void) => void;
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
  updateWaveGroup: (waveIndex: number, groupIndex: number, patch: Partial<WaveGroup>) => void;
  removeWaveGroup: (waveIndex: number, groupIndex: number) => void;
}

export function useCreatorDraft(
  onSaveLevel: (draft: CustomLevelDraftInput) => CustomLevelUpsertResult,
  onDeleteLevel: (levelId: string) => void,
): CreatorDraftActions {
  const [draft, setDraft] = useState<CreatorDraftState>(createEmptyDraft);
  const [undoStack, setUndoStack] = useState<CreatorDraftState[]>([]);
  const [redoStack, setRedoStack] = useState<CreatorDraftState[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_PRESET_ID);

  const draftRef = useRef<CreatorDraftState>(draft);

  const clearMessages = useCallback(() => {
    setErrors([]);
    setNotice(null);
  }, []);

  const waveTemplateOptions = useMemo(
    () => MAP_PRESET_TEMPLATES.map((preset) => ({ value: preset.id, label: preset.label })),
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
    if (nextDraft === prev) return;
    setUndoStack((stack) => [...stack.slice(-119), cloneDraftState(prev)]);
    setRedoStack([]);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, []);

  const applyDraftUpdate = useCallback(
    (updater: (prev: CreatorDraftState) => CreatorDraftState): void => {
      const prev = draftRef.current;
      const next = updater(prev);
      if (next === prev) return;
      pushDraftHistory(next);
    },
    [pushDraftHistory]
  );

  const undoDraft = useCallback((): void => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1];
      setRedoStack((future) => [...future, cloneDraftState(draftRef.current)]);
      const restored = cloneDraftState(previous);
      draftRef.current = restored;
      setDraft(restored);
      return stack.slice(0, -1);
    });
  }, []);

  const redoDraft = useCallback((): void => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
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
      id: currentDraft.id,
      slug: currentDraft.slug,
      name: currentDraft.name,
      description: currentDraft.description,
      theme: currentDraft.theme,
      difficulty: currentDraft.difficulty,
      startingPawPoints: currentDraft.startingPawPoints,
      waveTemplate: currentDraft.waveTemplate,
      customWaves:
        currentDraft.customWaves.length > 0
          ? currentDraft.customWaves.map((wave) => wave.map((group) => ({ ...group })))
          : undefined,
      primaryPath: currentDraft.primaryPath,
      secondaryPath:
        currentDraft.secondaryPath.length > 0 ? currentDraft.secondaryPath : undefined,
      heroSpawn: currentDraft.heroSpawn ?? undefined,
      specialTower:
        currentDraft.specialTowers.length === 1
          ? currentDraft.specialTowers[0]
          : undefined,
      specialTowers:
        currentDraft.specialTowers.length > 0
          ? currentDraft.specialTowers
          : undefined,
      placedTowers:
        currentDraft.placedTowers.length > 0
          ? currentDraft.placedTowers
          : undefined,
      allowedTowers:
        currentDraft.allowedTowers.length > 0
          ? currentDraft.allowedTowers
          : undefined,
      decorations: currentDraft.decorations,
      hazards: currentDraft.hazards,
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
    if (!currentDraft.id) return;
    if (!window.confirm(`Delete "${currentDraft.name || currentDraft.id}"?`)) return;
    onDeleteLevel(currentDraft.id);
    resetDraft();
  }, [onDeleteLevel, resetDraft]);

  const eraseSelection = useCallback(
    (selection: SelectionTarget | null, clearSelection: () => void): void => {
      if (!selection) return;
      applyDraftUpdate((prev) => removeSelection(prev, selection));
      clearSelection();
    },
    [applyDraftUpdate]
  );

  const applyMapPreset = useCallback(
    (presetId: string): void => {
      const nextPresetId = resolvePresetId(presetId);
      const preset = mapPresetById.get(nextPresetId);
      if (!preset) return;

      const presetDecorations = cloneDecorations(preset.decorations);
      const presetHazards = cloneHazards(preset.hazards);

      const specialTowers: CustomSpecialTowerConfig[] = preset.specialTower
        ? [{ pos: { ...preset.specialTower.pos }, type: preset.specialTower.type, hp: preset.specialTower.hp }]
        : [];

      applyDraftUpdate((prev) => ({
        ...prev,
        theme: preset.theme ?? prev.theme,
        difficulty: preset.difficulty ?? prev.difficulty,
        startingPawPoints: preset.startingPawPoints ?? prev.startingPawPoints,
        waveTemplate: nextPresetId,
        customWaves: [],
        specialTowers,
        decorations: presetDecorations,
        hazards: presetHazards,
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
      if (!preset || sections.length === 0) return;

      const sectionSet = new Set(sections);

      applyDraftUpdate((prev) => {
        const next = { ...prev };

        if (sectionSet.has("theme")) {
          next.theme = preset.theme ?? prev.theme;
          next.difficulty = preset.difficulty ?? prev.difficulty;
          next.startingPawPoints = preset.startingPawPoints ?? prev.startingPawPoints;
        }
        if (sectionSet.has("waves")) {
          next.waveTemplate = nextPresetId;
          next.customWaves = [];
        }
        if (sectionSet.has("decorations")) {
          next.decorations = cloneDecorations(preset.decorations);
        }
        if (sectionSet.has("hazards")) {
          next.hazards = cloneHazards(preset.hazards);
        }
        if (sectionSet.has("objectives")) {
          next.specialTowers = preset.specialTower
            ? [{ pos: { ...preset.specialTower.pos }, type: preset.specialTower.type, hp: preset.specialTower.hp }]
            : [];
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
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Import failed."]);
    }
  }, [draftRef, pushDraftHistory, setDraft]);

  // Wave editing
  const startCustomWaves = useCallback((): void => {
    applyDraftUpdate((prev) => {
      if (prev.customWaves.length > 0) return prev;
      return { ...prev, customWaves: [[createDefaultWaveGroup()]] };
    });
  }, [applyDraftUpdate]);

  const useTemplateWaves = useCallback((): void => {
    applyDraftUpdate((prev) => {
      if (prev.customWaves.length === 0) return prev;
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
        const nextWaves = prev.customWaves.filter((_, index) => index !== waveIndex);
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
    (waveIndex: number, groupIndex: number, patch: Partial<WaveGroup>): void => {
      applyDraftUpdate((prev) => {
        const wave = prev.customWaves[waveIndex];
        if (!wave) return prev;
        const group = wave[groupIndex];
        if (!group) return prev;
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
        if (!wave) return prev;
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
        : LEVEL_WAVES[draft.waveTemplate] ?? [],
    [draft.waveTemplate]
  );

  return {
    draft,
    draftRef,
    setDraft,
    pushDraftHistory,
    applyDraftUpdate,
    undoDraft,
    redoDraft,
    resetDraft,
    loadLevel,
    saveDraft,
    deleteCurrentDraft,
    eraseSelection,
    applyMapPreset,
    applyPresetSections,
    applyPresetWaves,
    applyPresetObjectives,
    exportMap,
    importMap,
    validationStatus,
    errors,
    notice,
    clearMessages,
    undoStack,
    redoStack,
    selectedPresetId,
    mapPresetById,
    waveTemplateOptions,
    usingCustomWaves,
    templateWaves,
    startCustomWaves,
    useTemplateWaves,
    addWave,
    removeWave,
    addWaveGroup,
    updateWaveGroup,
    removeWaveGroup,
  };
}
