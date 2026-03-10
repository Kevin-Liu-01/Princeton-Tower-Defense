"use client";

import React, { useCallback, useState } from "react";
import type {
  DecorationCategory,
  HazardType,
  SpecialTowerType,
} from "../../types";
import type { CreatorModalProps, ToolMode } from "./types";
import { useCreatorDraft } from "./hooks/useCreatorDraft";
import { useCreatorCamera } from "./hooks/useCreatorCamera";
import { useCreatorBoard } from "./hooks/useCreatorBoard";
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

  const draftActions = useCreatorDraft(onSaveLevel, onDeleteLevel);
  const camera = useCreatorCamera();
  const board = useCreatorBoard(
    tool,
    selectedDecorationType,
    selectedLandmarkType,
    selectedHazardType,
    draftActions,
    camera,
  );

  const { draft, setDraft, applyDraftUpdate } = draftActions;

  const handleToolSelect = useCallback((nextTool: ToolMode): void => {
    setTool(nextTool);
    if (nextTool === "decoration") {/* palette auto-selects */}
    if (nextTool === "landmark") {/* palette auto-selects */}
    if (nextTool === "hazard") {/* palette auto-selects */}
  }, []);

  const handleResetAll = useCallback((): void => {
    draftActions.resetDraft();
    camera.resetCamera();
    setTool("select");
    setSelectedDecorationType("tree");
    setSelectedLandmarkType("nassau_hall");
    setSelectedHazardType("poison_fog");
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
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [setDraft]
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

  const handleToggleObjective = useCallback(
    (enabled: boolean): void => {
      applyDraftUpdate((prev) => ({ ...prev, specialTowerEnabled: enabled }));
    },
    [applyDraftUpdate]
  );

  const handleChangeObjectiveType = useCallback(
    (type: SpecialTowerType): void => {
      applyDraftUpdate((prev) => ({ ...prev, specialTowerType: type }));
    },
    [applyDraftUpdate]
  );

  const handleChangeObjectiveHp = useCallback(
    (hp: number): void => {
      applyDraftUpdate((prev) => ({ ...prev, specialTowerHp: hp }));
    },
    [applyDraftUpdate]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full h-full rounded-2xl border border-amber-700/60 bg-gradient-to-b from-[#20170d] to-[#110b06] text-amber-100 flex flex-col overflow-hidden shadow-[0_0_45px_rgba(0,0,0,0.65)]">
        <CreatorHeader
          draft={draft}
          selectedPresetId={draftActions.selectedPresetId}
          waveTemplateOptions={draftActions.waveTemplateOptions}
          onUpdateDraft={handleUpdateDraft}
          onApplyMapPreset={draftActions.applyMapPreset}
          onClose={onClose}
        />

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)_360px] gap-3 p-3">
          {/* Left panel */}
          <div className="space-y-3 overflow-y-auto">
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
          <aside className="rounded-2xl border border-amber-900/60 bg-black/25 p-3 overflow-y-auto space-y-3">
            <ToolbeltPanel
              draft={draft}
              tool={tool}
              selection={board.selection}
              onToolSelect={handleToolSelect}
            />

            <PalettePanel
              theme={draft.theme}
              selectedDecorationType={selectedDecorationType}
              selectedLandmarkType={selectedLandmarkType}
              selectedHazardType={selectedHazardType}
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
              onToolSelect={handleToolSelect}
            />

            <ObjectivePanel
              draft={draft}
              onToggleEnabled={handleToggleObjective}
              onChangeType={handleChangeObjectiveType}
              onChangeHp={handleChangeObjectiveHp}
            />

            <WaveDesignerPanel
              usingCustomWaves={draftActions.usingCustomWaves}
              customWaves={draft.customWaves}
              templateWaves={draftActions.templateWaves}
              waveTemplate={draft.waveTemplate}
              waveTemplateOptions={draftActions.waveTemplateOptions}
              onStartCustomWaves={draftActions.startCustomWaves}
              onUseTemplateWaves={draftActions.useTemplateWaves}
              onApplyMapPreset={draftActions.applyMapPreset}
              onAddWave={draftActions.addWave}
              onRemoveWave={draftActions.removeWave}
              onAddWaveGroup={draftActions.addWaveGroup}
              onUpdateWaveGroup={draftActions.updateWaveGroup}
              onRemoveWaveGroup={draftActions.removeWaveGroup}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreatorModal;
