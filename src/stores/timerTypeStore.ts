import { create } from "zustand";

export type TimerType = "normal" | "fischer" | "bronstein";

interface TimerTypeState {
  type: TimerType;
  increment: number;
  setTimerType: (type: TimerType) => void;
  setIncrement: (seconds: number) => void;
}

export const useTimerTypeStore = create<TimerTypeState>((set) => ({
  type: "normal",
  increment: 0,
  setTimerType: (type) => set({ type }),
  setIncrement: (seconds) => set({ increment: seconds }),
}));
