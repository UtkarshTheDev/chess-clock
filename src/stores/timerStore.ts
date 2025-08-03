import { create } from "zustand";
import { ClockConfig, TimerState as EngineTimerState, TimerDisplayInfo } from "@/types/chess";
import { ChessTimerEngine } from "@/lib/timerEngine";

interface TimerStoreState {
  // Engine state
  engine: ChessTimerEngine | null;
  timerState: EngineTimerState | null;

  // Display state
  whiteDisplayInfo: TimerDisplayInfo | null;
  blackDisplayInfo: TimerDisplayInfo | null;

  // Backward compatibility
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  isRunning: boolean;
  activePlayer: "white" | "black" | null;
  initialTime: number;
  lastMoveStartTime: number | null;

  // Actions
  initializeTimer: (config: ClockConfig) => void;
  initializeTime: (initialTimeInMinutes: number) => void; // Backward compatibility
  switchActivePlayer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;

  // New actions
  startTimer: (startingPlayer?: "white" | "black") => void;
  updateDisplayInfo: () => void;
  setTimeoutCallback: (callback: (player: "white" | "black") => void) => void;

  // Backward compatibility actions
  decrementWhiteTime: () => void;
  decrementBlackTime: () => void;
  formatTime: (seconds: number) => string;
  addIncrement: (player: "white" | "black", amount: number) => void;
  setTimerType: (type: "normal" | "fischer" | "bronstein") => void;
  setIncrement: (seconds: number) => void;
  setBronsteinDelay: (seconds: number) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStoreState>((set, get) => {
  let timeoutCallback: ((player: "white" | "black") => void) | null = null;

  const updateFromEngine = (engineState: EngineTimerState) => {
    const state = get();

    // Update display info
    const whiteDisplayInfo = state.engine?.getDisplayInfo("white") || null;
    const blackDisplayInfo = state.engine?.getDisplayInfo("black") || null;

    set({
      timerState: engineState,
      whiteDisplayInfo,
      blackDisplayInfo,
      // Backward compatibility
      whiteTimeRemaining: engineState.whiteTimeRemaining,
      blackTimeRemaining: engineState.blackTimeRemaining,
      isRunning: engineState.isRunning,
      activePlayer: engineState.activePlayer,
      lastMoveStartTime: engineState.moveStartTime,
    });
  };

  const handleTimeout = (player: "white" | "black") => {
    if (timeoutCallback) {
      timeoutCallback(player);
    }
  };

  return {
    // Initial state
    engine: null,
    timerState: null,
    whiteDisplayInfo: null,
    blackDisplayInfo: null,
    whiteTimeRemaining: 0,
    blackTimeRemaining: 0,
    isRunning: false,
    activePlayer: null,
    initialTime: 15 * 60, // 15 minutes default
    lastMoveStartTime: null,

    initializeTimer: (config: ClockConfig) => {
      const state = get();

      try {
        // Cleanup existing engine
        if (state.engine) {
          state.engine.destroy();
        }

        // Create new engine
        const engine = new ChessTimerEngine(config, updateFromEngine, handleTimeout);

        set({
          engine,
          initialTime: config.baseMillis / 1000,
        });

        // Initial state update
        updateFromEngine(engine.getState());
      } catch (error) {
        console.error('Failed to initialize timer engine:', error);
      }
    },

    initializeTime: (initialTimeInMinutes: number) => {
      // Backward compatibility - create a sudden death config
      const config: ClockConfig = {
        mode: 'SUDDEN_DEATH',
        baseMillis: initialTimeInMinutes * 60 * 1000,
      };

      get().initializeTimer(config);
    },

    switchActivePlayer: () => {
      const state = get();
      if (state.engine) {
        state.engine.switchPlayer();
      }
    },

    startTimer: (startingPlayer: "white" | "black" = "white") => {
      const state = get();
      if (state.engine) {
        state.engine.start(startingPlayer);
      }
    },

    updateDisplayInfo: () => {
      const state = get();
      if (state.engine) {
        const whiteDisplayInfo = state.engine.getDisplayInfo("white");
        const blackDisplayInfo = state.engine.getDisplayInfo("black");

        set({
          whiteDisplayInfo,
          blackDisplayInfo,
        });
      }
    },

    pauseTimer: () => {
      const state = get();
      if (state.engine) {
        state.engine.pause();
      }
    },

    resumeTimer: () => {
      const state = get();

      if (state.engine) {
        try {
          if (!state.isRunning && !state.activePlayer) {
            // First start - begin with white
            state.engine.start("white");
          } else {
            // Resume existing game
            state.engine.resume();
          }
        } catch (error) {
          console.error('Error in resumeTimer:', error);
        }
      }
    },

    resetTimer: () => {
      const state = get();
      if (state.engine) {
        state.engine.reset();
      }
    },

    // Backward compatibility methods
    tick: () => {
      // This is now handled by the engine internally
    },

    decrementWhiteTime: () => {
      // This is now handled by the engine internally
    },

    decrementBlackTime: () => {
      // This is now handled by the engine internally
    },

    formatTime: (seconds: number) => {
      // Always round down to whole seconds for display
      const totalSeconds = Math.floor(seconds);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const remainingSeconds = totalSeconds % 60;

      const pad = (num: number) => num.toString().padStart(2, "0");

      if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
      }
      return `${pad(minutes)}:${pad(remainingSeconds)}`;
    },

    addIncrement: (player: "white" | "black", amount: number) => {
      const state = get();
      if (state.engine) {
        state.engine.addTime(player, amount);
      }
    },

    // Legacy compatibility methods (no-op)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setTimerType: (_type: "normal" | "fischer" | "bronstein") => {
      // Legacy method - configuration is now handled via initializeTimer
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setIncrement: (_seconds: number) => {
      // Legacy method - configuration is now handled via initializeTimer
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setBronsteinDelay: (_seconds: number) => {
      // Legacy method - configuration is now handled via initializeTimer
    },

    setTimeoutCallback: (callback: (player: "white" | "black") => void) => {
      timeoutCallback = callback;
    },
  };
});
