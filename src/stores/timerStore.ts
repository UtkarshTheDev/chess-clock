import { create } from "zustand";

interface TimerState {
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  isRunning: boolean;
  activePlayer: "white" | "black" | null;
  type: "normal" | "fischer" | "bronstein";
  increment: number;
  bronsteinDelay: number;
  lastMoveStartTime: number | null;
  initialTime: number;

  // Actions
  initializeTime: (initialTimeInMinutes: number) => void;
  switchActivePlayer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tick: () => void;
  formatTime: (seconds: number) => string;
  resetTimer: () => void;
  addIncrement: (player: "white" | "black", amount: number) => void;
  decrementWhiteTime: () => void;
  decrementBlackTime: () => void;
  setTimerType: (type: "normal" | "fischer" | "bronstein") => void;
  setIncrement: (seconds: number) => void;
  setBronsteinDelay: (seconds: number) => void;
}

export const useTimerStore = create<TimerState>((set, get) => {
  const addIncrement = (player: "white" | "black", amount: number) =>
    set((state) => ({
      whiteTimeRemaining:
        player === "white"
          ? state.whiteTimeRemaining + amount
          : state.whiteTimeRemaining,
      blackTimeRemaining:
        player === "black"
          ? state.blackTimeRemaining + amount
          : state.blackTimeRemaining,
    }));

  return {
    // Initial state
    whiteTimeRemaining: 0,
    blackTimeRemaining: 0,
    isRunning: false,
    activePlayer: null,
    type: "normal" as const,
    increment: 0,
    bronsteinDelay: 0,
    lastMoveStartTime: null,
    initialTime: 15 * 60, // 15 minutes default

    initializeTime: (initialTimeInMinutes: number) => {
      const timeInSeconds = initialTimeInMinutes * 60;
      set({
        whiteTimeRemaining: timeInSeconds,
        blackTimeRemaining: timeInSeconds,
        isRunning: false,
        activePlayer: "white",
        initialTime: timeInSeconds,
        lastMoveStartTime: null,
      });
    },

    switchActivePlayer: () => {
      const state = get();
      const { activePlayer, type, increment, lastMoveStartTime } = state;

      // Handle time compensation based on timer type
      if (activePlayer && lastMoveStartTime) {
        const moveTime = Date.now() - lastMoveStartTime;
        const compensationTime = Math.min(moveTime, increment * 1000);

        if (type === "bronstein") {
          // Add compensation time for Bronstein delay
          if (activePlayer === "white") {
            set((state) => ({
              whiteTimeRemaining:
                state.whiteTimeRemaining + compensationTime / 1000,
            }));
          } else {
            set((state) => ({
              blackTimeRemaining:
                state.blackTimeRemaining + compensationTime / 1000,
            }));
          }
        } else if (type === "fischer") {
          // Add increment for Fischer time control
          addIncrement(activePlayer, increment);
        }
      }

      // Switch active player and record start time
      set({
        activePlayer: activePlayer === "white" ? "black" : "white",
        lastMoveStartTime: Date.now(),
      });
    },

    pauseTimer: () => {
      set({ isRunning: false });
    },

    resumeTimer: () => {
      set((state) => ({
        isRunning: true,
        lastMoveStartTime: state.activePlayer ? Date.now() : null,
      }));
    },

    tick: () => {
      const { activePlayer, whiteTimeRemaining, blackTimeRemaining } = get();

      if (activePlayer === "white" && whiteTimeRemaining > 0) {
        set({ whiteTimeRemaining: whiteTimeRemaining - 1 });
      } else if (activePlayer === "black" && blackTimeRemaining > 0) {
        set({ blackTimeRemaining: blackTimeRemaining - 1 });
      }
    },

    decrementWhiteTime: () =>
      set((state) => ({
        whiteTimeRemaining: Math.max(0, state.whiteTimeRemaining - 1),
      })),

    decrementBlackTime: () =>
      set((state) => ({
        blackTimeRemaining: Math.max(0, state.blackTimeRemaining - 1),
      })),

    formatTime: (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      const pad = (num: number) => num.toString().padStart(2, "0");

      if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
      }
      return `${pad(minutes)}:${pad(remainingSeconds)}`;
    },

    resetTimer: () =>
      set({
        whiteTimeRemaining: 0,
        blackTimeRemaining: 0,
        isRunning: false,
        activePlayer: null,
        lastMoveStartTime: null,
      }),

    setTimerType: (type: "normal" | "fischer" | "bronstein") => set({ type }),

    setIncrement: (seconds: number) => set({ increment: seconds }),

    setBronsteinDelay: (seconds: number) => set({ bronsteinDelay: seconds }),

    addIncrement,
  };
});
