import { create } from "zustand";
import type { MoveRecord } from "@/types/chess";

interface MoveHistoryState {
  moveHistory: MoveRecord[];
  addMove: (move: MoveRecord) => void;
  resetHistory: () => void;
}

export const useMoveHistoryStore = create<MoveHistoryState>((set) => ({
  moveHistory: [],
  addMove: (move) =>
    set((state) => ({ moveHistory: [...state.moveHistory, move] })),
  resetHistory: () => set({ moveHistory: [] }),
}));
