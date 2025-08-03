import { TimerModeHandler, TimerState, TimerDisplayInfo } from "@/types/chess";

// Sudden Death Timer Mode
export class SuddenDeathHandler implements TimerModeHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMoveStart(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    return {
      moveStartTime: Date.now(),
    };
  }

  onMoveComplete(player: "white" | "black", _moveTime: number, state: TimerState): Partial<TimerState> {
    const moveCount = player === "white" ? state.whiteMoveCount + 1 : state.blackMoveCount + 1;
    
    return {
      [player === "white" ? "whiteMoveCount" : "blackMoveCount"]: moveCount,
      moveStartTime: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTick(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    // Simple countdown - no special logic needed
    return {};
  }

  getDisplayInfo(player: "white" | "black", state: TimerState): TimerDisplayInfo {
    const mainTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    return { mainTime };
  }
}

// Simple Delay Timer Mode (US Delay)
export class SimpleDelayHandler implements TimerModeHandler {
  onMoveStart(player: "white" | "black", state: TimerState): Partial<TimerState> {
    const delayMillis = state.config.delayMillis || 0;
    
    return {
      moveStartTime: Date.now(),
      [player === "white" ? "whiteDelayRemaining" : "blackDelayRemaining"]: delayMillis / 1000,
    };
  }

  onMoveComplete(player: "white" | "black", _moveTime: number, state: TimerState): Partial<TimerState> {
    const moveCount = player === "white" ? state.whiteMoveCount + 1 : state.blackMoveCount + 1;
    
    return {
      [player === "white" ? "whiteMoveCount" : "blackMoveCount"]: moveCount,
      [player === "white" ? "whiteDelayRemaining" : "blackDelayRemaining"]: undefined,
      moveStartTime: null,
    };
  }

  onTick(player: "white" | "black", state: TimerState): Partial<TimerState> {
    const delayRemaining = player === "white" ? state.whiteDelayRemaining : state.blackDelayRemaining;
    
    if (delayRemaining && delayRemaining > 0) {
      // During delay period - countdown delay, not main time
      return {
        [player === "white" ? "whiteDelayRemaining" : "blackDelayRemaining"]: delayRemaining - 1,
      };
    }
    
    // Delay expired, countdown main time normally
    return {};
  }

  getDisplayInfo(player: "white" | "black", state: TimerState): TimerDisplayInfo {
    const mainTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    const delayTime = player === "white" ? state.whiteDelayRemaining : state.blackDelayRemaining;
    
    return {
      mainTime,
      delayTime,
      isInDelay: delayTime !== undefined && delayTime > 0,
    };
  }
}

// Bronstein Delay Timer Mode
export class BronsteinDelayHandler implements TimerModeHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMoveStart(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    return {
      moveStartTime: Date.now(),
    };
  }

  onMoveComplete(player: "white" | "black", moveTime: number, state: TimerState): Partial<TimerState> {
    const delayMillis = state.config.delayMillis || 0;
    const compensationTime = Math.min(moveTime, delayMillis / 1000);
    const moveCount = player === "white" ? state.whiteMoveCount + 1 : state.blackMoveCount + 1;
    
    // Add compensation time back to the player's clock
    const currentTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    const newTime = currentTime + compensationTime;
    
    return {
      [player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"]: newTime,
      [player === "white" ? "whiteMoveCount" : "blackMoveCount"]: moveCount,
      moveStartTime: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTick(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    // Main time counts down immediately
    return {};
  }

  getDisplayInfo(player: "white" | "black", state: TimerState): TimerDisplayInfo {
    const mainTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    const delayMillis = state.config.delayMillis || 0;
    
    return {
      mainTime,
      delayTime: delayMillis / 1000,
    };
  }
}

// Fischer Increment Timer Mode
export class FischerIncrementHandler implements TimerModeHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMoveStart(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    return {
      moveStartTime: Date.now(),
    };
  }

  onMoveComplete(player: "white" | "black", _moveTime: number, state: TimerState): Partial<TimerState> {
    const incMillis = state.config.incMillis || 0;
    const moveCount = player === "white" ? state.whiteMoveCount + 1 : state.blackMoveCount + 1;
    
    // Add increment to player's time
    const currentTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    const newTime = currentTime + (incMillis / 1000);
    
    return {
      [player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"]: newTime,
      [player === "white" ? "whiteMoveCount" : "blackMoveCount"]: moveCount,
      moveStartTime: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTick(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    // Main time counts down normally
    return {};
  }

  getDisplayInfo(player: "white" | "black", state: TimerState): TimerDisplayInfo {
    const mainTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    const incMillis = state.config.incMillis || 0;

    return {
      mainTime,
      pendingIncrement: incMillis / 1000,
    };
  }
}

// Multi-Stage Timer Mode (Classical Tournament Controls)
export class MultiStageHandler implements TimerModeHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMoveStart(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    return {
      moveStartTime: Date.now(),
    };
  }

  onMoveComplete(player: "white" | "black", _moveTime: number, state: TimerState): Partial<TimerState> {
    const moveCount = player === "white" ? state.whiteMoveCount + 1 : state.blackMoveCount + 1;
    const stageIndex = player === "white" ? state.whiteStageIndex : state.blackStageIndex;

    let updates: Partial<TimerState> = {
      [player === "white" ? "whiteMoveCount" : "blackMoveCount"]: moveCount,
      moveStartTime: null,
    };

    // Check for stage transitions
    const stages = state.config.stages || [];
    if (stageIndex < stages.length) {
      const currentStage = stages[stageIndex];

      if (moveCount >= currentStage.afterMoves) {
        // Stage transition - add time and possibly update increment
        const currentTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
        const newTime = currentTime + (currentStage.addMillis / 1000);

        updates = {
          ...updates,
          [player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"]: newTime,
          [player === "white" ? "whiteStageIndex" : "blackStageIndex"]: stageIndex + 1,
        };
      }
    }

    // Apply increment if configured for current stage
    const currentStageIncrement = this.getCurrentStageIncrement(player, state);
    if (currentStageIncrement > 0) {
      const currentTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
      const timeWithIncrement = (updates[player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"] as number) || currentTime;

      updates[player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"] =
        timeWithIncrement + (currentStageIncrement / 1000);
    }

    return updates;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTick(_player: "white" | "black", _state: TimerState): Partial<TimerState> {
    // Main time counts down normally
    return {};
  }

  getDisplayInfo(player: "white" | "black", state: TimerState): TimerDisplayInfo {
    const mainTime = player === "white" ? state.whiteTimeRemaining : state.blackTimeRemaining;
    const moveCount = player === "white" ? state.whiteMoveCount : state.blackMoveCount;
    const stageIndex = player === "white" ? state.whiteStageIndex : state.blackStageIndex;

    const stages = state.config.stages || [];
    let stageInfo = "";
    let pendingIncrement = 0;

    if (stageIndex < stages.length) {
      const currentStage = stages[stageIndex];
      const movesUntilStage = currentStage.afterMoves - moveCount;

      if (movesUntilStage > 0) {
        stageInfo = `+${Math.floor(currentStage.addMillis / 60000)}min after ${movesUntilStage} moves`;
      }
    }

    const currentStageIncrement = this.getCurrentStageIncrement(player, state);
    if (currentStageIncrement > 0) {
      pendingIncrement = currentStageIncrement / 1000;
    }

    return {
      mainTime,
      stageInfo: stageInfo || undefined,
      pendingIncrement: pendingIncrement > 0 ? pendingIncrement : undefined,
    };
  }

  private getCurrentStageIncrement(player: "white" | "black", state: TimerState): number {
    const stageIndex = player === "white" ? state.whiteStageIndex : state.blackStageIndex;
    const stages = state.config.stages || [];

    // Check if current stage has specific increment
    if (stageIndex < stages.length && stages[stageIndex].incMillis !== undefined) {
      return stages[stageIndex].incMillis!;
    }

    // Fall back to base increment
    return state.config.incMillis || 0;
  }
}

// Timer Mode Factory
export function createTimerModeHandler(mode: string): TimerModeHandler {
  switch (mode) {
    case 'SUDDEN_DEATH':
      return new SuddenDeathHandler();
    case 'SIMPLE_DELAY':
      return new SimpleDelayHandler();
    case 'BRONSTEIN_DELAY':
      return new BronsteinDelayHandler();
    case 'FISCHER_INCREMENT':
      return new FischerIncrementHandler();
    case 'MULTI_STAGE':
      return new MultiStageHandler();
    default:
      throw new Error(`Unknown timer mode: ${mode}`);
  }
}
