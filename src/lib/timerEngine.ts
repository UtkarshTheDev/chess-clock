import { TimerState, ClockConfig, TimerDisplayInfo, TimerModeHandler } from "@/types/chess";
import { createTimerModeHandler } from "./timerModes";

export class ChessTimerEngine {
  private state: TimerState;
  private handler: TimerModeHandler;
  private tickInterval: NodeJS.Timeout | null = null;
  private onStateChange?: (state: TimerState) => void;
  private onTimeout?: (player: "white" | "black") => void;

  constructor(config: ClockConfig, onStateChange?: (state: TimerState) => void, onTimeout?: (player: "white" | "black") => void) {
    this.onStateChange = onStateChange;
    this.onTimeout = onTimeout;
    this.handler = createTimerModeHandler(config.mode);

    this.state = {
      whiteTimeRemaining: config.baseMillis / 1000,
      blackTimeRemaining: config.baseMillis / 1000,
      isRunning: false,
      activePlayer: null,
      config,
      whiteMoveCount: 0,
      blackMoveCount: 0,
      whiteStageIndex: 0,
      blackStageIndex: 0,
      lastMoveStartTime: null,
      moveStartTime: null,
      initialTime: config.baseMillis / 1000,
    };

    // Notify initial state
    this.notifyStateChange();
  }

  // Public API methods
  start(startingPlayer: "white" | "black" = "white"): void {
    if (this.state.isRunning) return;

    this.updateState({
      isRunning: true,
      activePlayer: startingPlayer,
    });

    this.startMove(startingPlayer);
    this.startTicking();
  }

  pause(): void {
    if (!this.state.isRunning) return;

    this.updateState({ isRunning: false });
    this.stopTicking();
  }

  resume(): void {
    if (this.state.isRunning) return;

    // If no active player, start with white
    if (!this.state.activePlayer) {
      this.start("white");
      return;
    }

    this.updateState({ isRunning: true });

    // Restart move timing for the active player
    this.startMove(this.state.activePlayer);
    this.startTicking();
  }

  switchPlayer(): void {
    if (!this.state.isRunning || !this.state.activePlayer) return;

    const currentPlayer = this.state.activePlayer;
    const nextPlayer = currentPlayer === "white" ? "black" : "white";

    // Complete the current player's move
    this.completeMove(currentPlayer);

    // Switch to next player and start their move
    this.updateState({ activePlayer: nextPlayer });
    this.startMove(nextPlayer);
  }

  reset(config?: ClockConfig): void {
    this.stopTicking();
    
    const newConfig = config || this.state.config;
    this.handler = createTimerModeHandler(newConfig.mode);
    
    this.state = {
      whiteTimeRemaining: newConfig.baseMillis / 1000,
      blackTimeRemaining: newConfig.baseMillis / 1000,
      isRunning: false,
      activePlayer: null,
      config: newConfig,
      whiteMoveCount: 0,
      blackMoveCount: 0,
      whiteStageIndex: 0,
      blackStageIndex: 0,
      lastMoveStartTime: null,
      moveStartTime: null,
      initialTime: newConfig.baseMillis / 1000,
    };

    this.notifyStateChange();
  }

  getState(): TimerState {
    return { ...this.state };
  }

  getDisplayInfo(player: "white" | "black"): TimerDisplayInfo {
    return this.handler.getDisplayInfo(player, this.state);
  }

  // Private methods
  private startMove(player: "white" | "black"): void {
    const updates = this.handler.onMoveStart(player, this.state);
    this.updateState(updates);
  }

  private completeMove(player: "white" | "black"): void {
    const moveTime = this.calculateMoveTime();
    const updates = this.handler.onMoveComplete(player, moveTime, this.state);
    this.updateState(updates);
  }

  private calculateMoveTime(): number {
    if (!this.state.moveStartTime) return 0;
    return (Date.now() - this.state.moveStartTime) / 1000;
  }

  private startTicking(): void {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick(): void {
    if (!this.state.isRunning || !this.state.activePlayer) return;

    const player = this.state.activePlayer;

    // Let the handler process the tick (for delay modes)
    const handlerUpdates = this.handler.onTick(player, this.state);

    // Apply handler updates first
    if (Object.keys(handlerUpdates).length > 0) {
      this.updateState(handlerUpdates);
    }

    // Check if we should decrement main time
    const shouldDecrementMainTime = this.shouldDecrementMainTime(player);

    if (shouldDecrementMainTime) {
      const currentTime = player === "white" ? this.state.whiteTimeRemaining : this.state.blackTimeRemaining;

      if (currentTime <= 0) {
        // Time's up!
        this.handleTimeout(player);
        return;
      }

      // Decrement main time
      const newTime = Math.max(0, currentTime - 1);

      this.updateState({
        [player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"]: newTime,
      });
    }
  }

  private shouldDecrementMainTime(player: "white" | "black"): boolean {
    // For Simple Delay mode, don't decrement main time if delay is active
    if (this.state.config.mode === 'SIMPLE_DELAY') {
      const delayRemaining = player === "white" ? this.state.whiteDelayRemaining : this.state.blackDelayRemaining;
      return !delayRemaining || delayRemaining <= 0;
    }
    
    // For all other modes, always decrement main time
    return true;
  }

  private handleTimeout(player: "white" | "black"): void {
    this.pause();
    if (this.onTimeout) {
      this.onTimeout(player);
    }
  }

  private updateState(updates: Partial<TimerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  // Utility methods for external use
  addTime(player: "white" | "black", seconds: number): void {
    const currentTime = player === "white" ? this.state.whiteTimeRemaining : this.state.blackTimeRemaining;
    this.updateState({
      [player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"]: currentTime + seconds,
    });
  }

  setTime(player: "white" | "black", seconds: number): void {
    this.updateState({
      [player === "white" ? "whiteTimeRemaining" : "blackTimeRemaining"]: seconds,
    });
  }

  getMoveCount(player: "white" | "black"): number {
    return player === "white" ? this.state.whiteMoveCount : this.state.blackMoveCount;
  }

  getCurrentStage(player: "white" | "black"): number {
    return player === "white" ? this.state.whiteStageIndex : this.state.blackStageIndex;
  }

  // Cleanup
  destroy(): void {
    this.stopTicking();
  }
}
