"use client";

import React, { useCallback, useState } from "react";
import type {
  DecorationCategory,
  HazardType,
  SpecialTowerType,
  TowerType,
} from "../../types";
import type { CreatorModalProps, ToolMode } from "./types";
import { TOWER_TYPE_OPTIONS } from "./constants";
import { useCreatorDraft } from "./hooks/useCreatorDraft";
import { useCreatorCamera } from "./hooks/useCreatorCamera";
import { useCreatorBoard } from "./hooks/useCreatorBoard";
import { BaseModal } from "../ui/BaseModal";
import { CreatorHeader } from "./components/CreatorHeader";
import { CreatorCanvas } from "./components/CreatorCanvas";
import { InspectorPanel } from "./components/InspectorPanel";
import { SavedMapsPanel } from "./components/SavedMapsPanel";
import { ToolbeltPanel } from "./components/ToolbeltPanel";
import { PalettePanel } from "./components/PalettePanel";
import { ObjectivePanel } from "./components/ObjectivePanel";
import { WaveDesignerPanel } from "./components/WaveDesignerPanel";

export const CreatorModal: React.FC<CreatorModalProps> = ({
  isOpen,
  onClose,
  customLevels,
  onSaveLevel,
  onDeleteLevel,
  onPlayLevel,
}) => {
  const [tool, setTool] = useState<ToolMode>("select");
  const [selectedDecorationType, setSelectedDecorationType] =
    useState<DecorationCategory>("tree");
  const [selectedLandmarkType, setSelectedLandmarkType] =
    useState<DecorationCategory>("nassau_hall");
  const [selectedHazardType, setSelectedHazardType] =
    useState<HazardType>("poison_fog");
  const [selectedObjectiveType, setSelectedObjectiveType] =
    useState<SpecialTowerType>("beacon");
  const [selectedTowerType, setSelectedTowerType] =
    useState<TowerType>("cannon");

  const draftActions = useCreatorDraft(onSaveLevel, onDeleteLevel);
  const camera = useCreatorCamera();
  const board = useCreatorBoard(
    tool,
    selectedDecorationType,
    selectedLandmarkType,
    selectedHazardType,
    selectedObjectiveType,
    selectedTowerType,
    draftActions,
    camera,
  );

  const { draft, setDraft, applyDraftUpdate } = draftActions;

  const handleToolSelect = useCallback((nextTool: ToolMode): void => {
    setTool(nextTool);
  }, []);

  const handleResetAll = useCallback((): void => {
    draftActions.resetDraft();
    camera.resetCamera();
    setTool("select");
    setSelectedDecorationType("tree");
    setSelectedLandmarkType("nassau_hall");
    setSelectedHazardType("poison_fog");
    setSelectedObjectiveType("beacon");
    setSelectedTowerType("cannon");
    board.clearSelection();
  }, [draftActions, camera, board]);

  const handleLoadLevel = useCallback(
    (level: Parameters<typeof draftActions.loadLevel>[0]): void => {
      draftActions.loadLevel(level);
      setTool("select");
      board.clearSelection();
    },
    [draftActions, board]
  );

  const handleUpdateDraft = useCallback(
    (patch: Partial<typeof draft>): void => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        draftActions.draftRef.current = next;
        return next;
      });
    },
    [setDraft, draftActions.draftRef]
  );

  const handleUpdateDecorationSize = useCallback(
    (index: number, size: number): void => {
      applyDraftUpdate((prev) => {
        const next = [...prev.decorations];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, size };
        return { ...prev, decorations: next };
      });
    },
    [applyDraftUpdate]
  );

  const handleUpdateHazardRadius = useCallback(
    (index: number, radius: number): void => {
      applyDraftUpdate((prev) => {
        const next = [...prev.hazards];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, radius };
        return { ...prev, hazards: next };
      });
    },
    [applyDraftUpdate]
  );

  const handleChangeObjectiveType = useCallback(
    (index: number, type: SpecialTowerType): void => {
      applyDraftUpdate((prev) => {
        const next = [...prev.specialTowers];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, type };
        return { ...prev, specialTowers: next };
      });
    },
    [applyDraftUpdate]
  );

  const handleChangeObjectiveHp = useCallback(
    (index: number, hp: number): void => {
      applyDraftUpdate((prev) => {
        const next = [...prev.specialTowers];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, hp };
        return { ...prev, specialTowers: next };
      });
    },
    [applyDraftUpdate]
  );

  const handleRemoveObjective = useCallback(
    (index: number): void => {
      applyDraftUpdate((prev) => ({
        ...prev,
        specialTowers: prev.specialTowers.filter((_, i) => i !== index),
      }));
    },
    [applyDraftUpdate]
  );

  const handleToggleAllowedTower = useCallback(
    (type: TowerType): void => {
      applyDraftUpdate((prev) => {
        const current = prev.allowedTowers;
        if (current.length === 0) {
          const allExceptThis = TOWER_TYPE_OPTIONS.filter((t) => t !== type);
          return { ...prev, allowedTowers: allExceptThis };
        }
        if (current.includes(type)) {
          const next = current.filter((t) => t !== type);
          return { ...prev, allowedTowers: next };
        }
        const next = [...current, type];
        if (next.length === TOWER_TYPE_OPTIONS.length) {
          return { ...prev, allowedTowers: [] };
        }
        return { ...prev, allowedTowers: next };
      });
    },
    [applyDraftUpdate]
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick={false}
      zClass="z-[90]"
      blurClass="backdrop-blur-md"
      backdropBg="rgba(0,0,0,0.85)"
      paddingClass="p-1.5 sm:p-3"
    >
      <div className="w-full h-full rounded-2xl border border-amber-700/30 bg-gradient-to-b from-[#1a130a] to-[#0d0804] text-amber-100 flex flex-col overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <CreatorHeader
          draft={draft}
          selectedPresetId={draftActions.selectedPresetId}
          waveTemplateOptions={draftActions.waveTemplateOptions}
          onUpdateDraft={handleUpdateDraft}
          onApplyMapPreset={draftActions.applyMapPreset}
          onApplyPresetSections={draftActions.applyPresetSections}
          onClose={onClose}
        />

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_340px] gap-2 p-2">
          {/* Left panel */}
          <div className="space-y-2 overflow-y-auto">
            <InspectorPanel
              draft={draft}
              tool={tool}
              hoverPoint={board.hoverPoint}
              selection={board.selection}
              validationStatus={draftActions.validationStatus}
              errors={draftActions.errors}
              notice={draftActions.notice}
              onSave={draftActions.saveDraft}
              onPlaytest={() => draft.id && onPlayLevel(draft.id)}
              onDelete={draftActions.deleteCurrentDraft}
              onEraseSelection={() => draftActions.eraseSelection(board.selection, board.clearSelection)}
              onNewMap={handleResetAll}
              onExportMap={draftActions.exportMap}
              onImportMap={draftActions.importMap}
              onUpdateDecorationSize={handleUpdateDecorationSize}
              onUpdateHazardRadius={handleUpdateHazardRadius}
            />
            <SavedMapsPanel
              customLevels={customLevels}
              activeId={draft.id}
              onLoadLevel={handleLoadLevel}
              onPlayLevel={onPlayLevel}
            />
          </div>

          {/* Center canvas */}
          <CreatorCanvas
            draft={draft}
            tool={tool}
            zoom={camera.zoom}
            viewBoxX={camera.viewBoxX}
            viewBoxY={camera.viewBoxY}
            viewBoxWidth={camera.viewBoxWidth}
            viewBoxHeight={camera.viewBoxHeight}
            boardRef={board.boardRef}
            selection={board.selection}
            hoverPoint={board.hoverPoint}
            isBoardDragOver={board.isBoardDragOver}
            undoCount={draftActions.undoStack.length}
            redoCount={draftActions.redoStack.length}
            decorationCount={draft.decorations.length}
            hazardCount={draft.hazards.length}
            onUndo={draftActions.undoDraft}
            onRedo={draftActions.redoDraft}
            onZoomIn={camera.zoomIn}
            onZoomOut={camera.zoomOut}
            onToolSelect={handleToolSelect}
            onBoardPointerDown={board.handleBoardPointerDown}
            onBoardPointerMove={board.handleBoardPointerMove}
            onBoardPointerUp={board.handleBoardPointerUp}
            onBoardPointerLeave={board.handleBoardPointerLeave}
            onBoardWheel={board.handleBoardWheel}
            onDropOnBoard={board.handleDropOnBoard}
            onBoardDragOver={board.handleBoardDragOver}
            onBoardDragLeave={board.handleBoardDragLeave}
            startDragTarget={board.startDragTarget}
          />

          {/* Right panel */}
          <aside className="rounded-2xl border border-amber-800/20 bg-stone-950/30 p-2 overflow-y-auto space-y-2">
            <ToolbeltPanel
              draft={draft}
              tool={tool}
              selection={board.selection}
              onToolSelect={handleToolSelect}
              onToggleAllowedTower={handleToggleAllowedTower}
            />

            <PalettePanel
              theme={draft.theme}
              selectedDecorationType={selectedDecorationType}
              selectedLandmarkType={selectedLandmarkType}
              selectedHazardType={selectedHazardType}
              selectedObjectiveType={selectedObjectiveType}
              selectedTowerType={selectedTowerType}
              onSelectDecoration={(type) => {
                setSelectedDecorationType(type);
                handleToolSelect("decoration");
              }}
              onSelectLandmark={(type) => {
                setSelectedLandmarkType(type);
                handleToolSelect("landmark");
              }}
              onSelectHazard={(type) => {
                setSelectedHazardType(type);
                handleToolSelect("hazard");
              }}
              onSelectObjective={(type) => {
                setSelectedObjectiveType(type);
                handleToolSelect("special_tower");
              }}
              onSelectTower={(type) => {
                setSelectedTowerType(type);
                handleToolSelect("tower");
              }}
              onToolSelect={handleToolSelect}
            />

            <ObjectivePanel
              draft={draft}
              waveTemplateOptions={draftActions.waveTemplateOptions}
              onChangeType={handleChangeObjectiveType}
              onChangeHp={handleChangeObjectiveHp}
              onRemove={handleRemoveObjective}
              onImportObjectives={draftActions.applyPresetObjectives}
            />

            <WaveDesignerPanel
              usingCustomWaves={draftActions.usingCustomWaves}
              customWaves={draft.customWaves}
              templateWaves={draftActions.templateWaves}
              waveTemplate={draft.waveTemplate}
              waveTemplateOptions={draftActions.waveTemplateOptions}
              onStartCustomWaves={draftActions.startCustomWaves}
              onUseTemplateWaves={draftActions.useTemplateWaves}
              onApplyPresetWaves={draftActions.applyPresetWaves}
              onAddWave={draftActions.addWave}
              onRemoveWave={draftActions.removeWave}
              onAddWaveGroup={draftActions.addWaveGroup}
              onUpdateWaveGroup={draftActions.updateWaveGroup}
              onRemoveWaveGroup={draftActions.removeWaveGroup}
            />
          </aside>
        </div>
      </div>
    </BaseModal>
  );
};

export default CreatorModal;
