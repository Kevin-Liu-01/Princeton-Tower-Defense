"use client";

import React from "react";
import type { CustomLevelDefinition, CustomLevelDraftInput, CustomLevelUpsertResult } from "../../../customLevels/types";
import type { GameSettings, QualityPreset, SettingsCategory } from "../../../constants/settings";
import { CreatorModal } from "../../creator";
import { CodexModal, type CodexTabId } from "../CodexModal";
import { CreditsModal } from "../CreditsModal";
import { SettingsModal } from "../SettingsModal";

interface SettingsState {
  settings: GameSettings;
  updateCategory: <K extends SettingsCategory>(
    category: K,
    patch: Partial<GameSettings[K]>,
  ) => void;
  applyPreset: (preset: QualityPreset) => void;
  resetToDefaults: () => void;
  resetCategory: (category: SettingsCategory) => void;
}

interface WorldMapModalsProps {
  showCodex: boolean;
  codexTab: CodexTabId;
  onCloseCodex: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
  settingsState: SettingsState;
  onDevModeChange?: (enabled: boolean) => void;
  showCredits: boolean;
  onCloseCredits: () => void;
  showCreator: boolean;
  onCloseCreator: () => void;
  customLevels: CustomLevelDefinition[];
  onSaveCustomLevel: (draft: CustomLevelDraftInput) => CustomLevelUpsertResult;
  onDeleteCustomLevel: (levelId: string) => void;
  onPlayCustomLevel: (levelId: string) => void;
}

export function WorldMapModals({
  showCodex,
  codexTab,
  onCloseCodex,
  showSettings,
  onCloseSettings,
  settingsState,
  onDevModeChange,
  showCredits,
  onCloseCredits,
  showCreator,
  onCloseCreator,
  customLevels,
  onSaveCustomLevel,
  onDeleteCustomLevel,
  onPlayCustomLevel,
}: WorldMapModalsProps) {
  return (
    <>
      {showCodex && <CodexModal onClose={onCloseCodex} defaultTab={codexTab} />}
      {showSettings && (
        <SettingsModal
          onClose={onCloseSettings}
          settings={settingsState.settings}
          updateCategory={settingsState.updateCategory}
          applyPreset={settingsState.applyPreset}
          resetToDefaults={settingsState.resetToDefaults}
          resetCategory={settingsState.resetCategory}
          onDevModeChange={onDevModeChange}
        />
      )}
      {showCredits && <CreditsModal onClose={onCloseCredits} />}
      {showCreator && (
        <CreatorModal
          isOpen={showCreator}
          onClose={onCloseCreator}
          customLevels={customLevels}
          onSaveLevel={onSaveCustomLevel}
          onDeleteLevel={onDeleteCustomLevel}
          onPlayLevel={onPlayCustomLevel}
        />
      )}
    </>
  );
}
