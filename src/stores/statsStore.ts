import { create } from "zustand";

export interface MoveRecord {
  moveNumber: number;
  by: "white" | "black";
  time: number;
  type: "normal" | "check" | "checkmate";
  timeRemaining: number;
  phase: "opening" | "middlegame" | "endgame";
}

export interface PhaseStats {
  totalTime: number;
  averageTime: number;
  moveCount: number;
}

export interface PlayerStats {
  totalTimeUsed: number;
  timeRemaining: number;
  averageTimePerMove: number;
  fastestMove: number;
  slowestMove: number;
  quickMoves: number;
  moveHistory: MoveRecord[];
  phaseStats: {
    opening: PhaseStats;
    middlegame: PhaseStats;
    endgame: PhaseStats;
  };
}

interface StatsState {
  whiteStats: PlayerStats;
  blackStats: PlayerStats;
  currentMoveStartTime: Date | null;
  moveHistory: MoveRecord[];
  gameStartTime: Date | null; // Add this
  gameEndTime: Date | null; // Add this
  gameSummary: {
    winner: string;
    endReason: string;
    whiteStats: PlayerStats;
    blackStats: PlayerStats;
    totalMoves: number;
    gameStartTime: Date | null;
    gameEndTime: Date;
    timeRatio: number;
  } | null;

  // Actions
  recordMove: (
    player: "white" | "black",
    time: number,
    moveType?: "normal" | "check" | "checkmate",
    timeRemaining?: number
  ) => void;
  recordCheck: (player: "white" | "black") => void;
  startGame: () => void;
  endGame: (winner: "white" | "black", reason: string) => void;
  resetStats: () => void;
  setGameSummary: (winner: "white" | "black" | "draw", reason: string) => void;
}

const initialPlayerStats: PlayerStats = {
  totalTimeUsed: 0,
  timeRemaining: 0,
  averageTimePerMove: 0,
  fastestMove: Infinity,
  slowestMove: 0,
  quickMoves: 0,
  phaseStats: {
    opening: { totalTime: 0, averageTime: 0, moveCount: 0 },
    middlegame: { totalTime: 0, averageTime: 0, moveCount: 0 },
    endgame: { totalTime: 0, averageTime: 0, moveCount: 0 },
  },
  moveHistory: [],
};

export const useStatsStore = create<StatsState>((set, get) => ({
  whiteStats: initialPlayerStats,
  blackStats: initialPlayerStats,
  currentMoveStartTime: null,
  moveHistory: [],
  gameStartTime: null,
  gameEndTime: null,
  gameSummary: null,
  recordMove: (
    player: "white" | "black",
    time: number,
    moveType = "normal",
    timeRemaining = 0
  ) => {
    const state = get();
    const currentTime = new Date();
    const moveTime = state.currentMoveStartTime
      ? (currentTime.getTime() - state.currentMoveStartTime.getTime()) / 1000
      : time;

    const playerStats =
      player === "white" ? state.whiteStats : state.blackStats;
    const totalMoves = playerStats.moveHistory.length;

    // Calculate initial time (game duration) from first move's timeRemaining + time used
    const firstMove = playerStats.moveHistory[0];
    const initialTime = firstMove
      ? firstMove.timeRemaining + firstMove.time
      : timeRemaining + moveTime;

    // Quick moves: less than 1% of game duration
    // Slow moves: more than 5% of game duration
    const isQuickMove = moveTime < initialTime * 0.01;

    const phase =
      totalMoves <= 20
        ? "opening"
        : totalMoves <= 40
        ? "middlegame"
        : "endgame";

    const newMove: MoveRecord = {
      moveNumber: totalMoves + 1,
      by: player,
      time: moveTime,
      type: moveType,
      timeRemaining,
      phase,
    };

    // Calculate fastest move excluding first two moves
    const validMovesForFastest = playerStats.moveHistory.slice(2);
    const currentFastestMove =
      validMovesForFastest.length > 0
        ? Math.min(...validMovesForFastest.map((m) => m.time))
        : moveTime;
    const newFastestMove =
      totalMoves <= 1 ? moveTime : Math.min(currentFastestMove, moveTime);

    const updatedStats = {
      ...playerStats,
      totalTimeUsed: playerStats.totalTimeUsed + moveTime,
      timeRemaining,
      averageTimePerMove:
        (playerStats.totalTimeUsed + moveTime) / (totalMoves + 1),
      fastestMove: newFastestMove,
      slowestMove: Math.max(playerStats.slowestMove, moveTime),
      quickMoves: isQuickMove
        ? playerStats.quickMoves + 1
        : playerStats.quickMoves,
      phaseStats: {
        ...playerStats.phaseStats,
        [phase]: {
          totalTime: playerStats.phaseStats[phase].totalTime + moveTime,
          averageTime:
            (playerStats.phaseStats[phase].totalTime + moveTime) /
            (playerStats.phaseStats[phase].moveCount + 1),
          moveCount: playerStats.phaseStats[phase].moveCount + 1,
        },
      },
      moveHistory: [...playerStats.moveHistory, newMove],
    };

    set((state) => ({
      ...(player === "white"
        ? { whiteStats: updatedStats }
        : { blackStats: updatedStats }),
      currentMoveStartTime: currentTime,
      moveHistory: [...state.moveHistory, newMove],
    }));
  },

  recordCheck: (player) => {
    set(
      (state) =>
        ({
          currentMoveStartTime: new Date(),
        } as Partial<StatsState>)
    );
    get().recordMove(player, 0, "check");
  },

  setGameSummary: (winner: "white" | "black" | "draw", reason: string) => {
    set({
      gameSummary: {
        winner,
        endReason: reason,
        whiteStats: get().whiteStats,
        blackStats: get().blackStats,
        totalMoves: get().moveHistory.length,
        gameStartTime: get().gameStartTime,
        gameEndTime: new Date(),
        timeRatio: calculateTimeRatio(get().whiteStats, get().blackStats),
      },
    });
  },

  startGame: () => {
    set({
      gameStartTime: new Date(),
      whiteStats: { ...initialPlayerStats },
      blackStats: { ...initialPlayerStats },
      moveHistory: [],
      currentMoveStartTime: null,
      gameSummary: null,
    } as Partial<StatsState>);
  },

  endGame: (winner, reason) => {
    const endTime = new Date();
    const state = get();

    // Record the final move if it's a checkmate
    if (reason === "checkmate") {
      state.recordMove(winner, 0, "checkmate");
    }

    set({
      gameEndTime: endTime,
      gameSummary: {
        winner,
        endReason: reason,
        whiteStats: state.whiteStats,
        blackStats: state.blackStats,
        totalMoves: state.moveHistory.length,
        gameStartTime: state.gameStartTime,
        gameEndTime: endTime,
        timeRatio:
          state.whiteStats.totalTimeUsed /
          (state.blackStats.totalTimeUsed || 1),
      },
    } as Partial<StatsState>);
  },

  resetStats: () => {
    set({
      whiteStats: { ...initialPlayerStats },
      blackStats: { ...initialPlayerStats },
      moveHistory: [],
      gameStartTime: null,
      gameEndTime: null,
      currentMoveStartTime: null,
      gameSummary: null,
    } as Partial<StatsState>);
  },
}));

function calculateTimeRatio(whiteStats: PlayerStats, blackStats: PlayerStats) {
  return whiteStats.totalTimeUsed / (blackStats.totalTimeUsed || 1);
}
