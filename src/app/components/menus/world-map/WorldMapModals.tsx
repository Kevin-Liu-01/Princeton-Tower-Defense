"use client";

import dynamic from "next/dynamic";
import React from "react";

import type {
  GameSettings,
  QualityPreset,
  SettingsCategory,
} from "../../../constants/settings";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
} from "../../../customLevels/types";
import type { CodexTabId } from "../CodexModal";

const CreatorModal = dynamic(() =>
  import("../../creator/CreatorModal").then((module) => module.CreatorModal)
);
const CodexModal = dynamic(() =>
  import("../CodexModal").then((module) => module.CodexModal)
);
const CreditsModal = dynamic(() =>
  import("../CreditsModal").then((module) => module.CreditsModal)
);
const SettingsModal = dynamic(() =>
  import("../SettingsModal").then((module) => module.SettingsModal)
);

interface SettingsState {
  settings: GameSettings;
  updateCategory: <K extends SettingsCategory>(
    category: K,
    patch: Partial<GameSettings[K]>
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
