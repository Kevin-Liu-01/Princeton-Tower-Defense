// Princeton Tower Defense - Hooks Exports
// Centralized exports for custom React hooks

export {
  useGameState,
  type GameStateData,
  type GameStateActions,
} from "./useGameState";

export {
  useGameLoop,
  processGameUpdate,
  type GameLoopConfig,
  type GameLoopCallbacks,
  type GameUpdateContext,
} from "./useGameLoop";
