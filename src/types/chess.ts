export interface GamePhaseStats {
  totalMoves: number;
  totalTime: number;
  averageTime: number;
}

export interface MoveStats {
  longestMoveTime: number;
  shortestMoveTime: number;
  averageMoveTime: number;
  totalMoves: number;
  totalChecks: number;
  totalTimeSpent: number;
  openingStats: GamePhaseStats;
  middleGameStats: GamePhaseStats;
  endGameStats: GamePhaseStats;
  timeInCheck: number;
  movesUnderPressure: number;
  timeManagementScore: number;
  decisionSpeed: number;
}

export type GameEndReason = "checkmate" | "timeout" | "resignation" | "draw";

export interface GameSummary {
  winner: "white" | "black" | "draw";
  endReason: GameEndReason;
  whiteStats: PlayerStats;
  blackStats: PlayerStats;
  totalMoves: number;
  gameStartTime: Date;
  gameEndTime: Date;
  timeRatio: number;
}

export interface MoveRecord {
  moveNumber?: number;
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
  phaseStats: {
    opening: PhaseStats;
    middlegame: PhaseStats;
    endgame: PhaseStats;
  };
  moveHistory: MoveRecord[];
}
