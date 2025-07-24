// Timer Configuration Types
export interface ClockConfig {
  mode: 'SUDDEN_DEATH' | 'SIMPLE_DELAY' | 'BRONSTEIN_DELAY' | 'FISCHER_INCREMENT' | 'MULTI_STAGE';
  baseMillis: number;
  delayMillis?: number;
  incMillis?: number;
  stages?: {
    afterMoves: number;
    addMillis: number;
    incMillis?: number;
  }[];
  incBefore?: boolean;
}

// Timer State Types
export interface TimerState {
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  isRunning: boolean;
  activePlayer: "white" | "black" | null;
  config: ClockConfig;

  // Mode-specific state
  whiteDelayRemaining?: number;
  blackDelayRemaining?: number;
  whitePendingIncrement?: number;
  blackPendingIncrement?: number;
  whiteMoveCount: number;
  blackMoveCount: number;
  whiteStageIndex: number;
  blackStageIndex: number;

  // Move tracking
  lastMoveStartTime: number | null;
  moveStartTime: number | null;
  initialTime: number;
}

// Timer Mode Handler Interface
export interface TimerModeHandler {
  onMoveStart(player: "white" | "black", state: TimerState): Partial<TimerState>;
  onMoveComplete(player: "white" | "black", moveTime: number, state: TimerState): Partial<TimerState>;
  onTick(player: "white" | "black", state: TimerState): Partial<TimerState>;
  getDisplayInfo(player: "white" | "black", state: TimerState): TimerDisplayInfo;
}

export interface TimerDisplayInfo {
  mainTime: number;
  delayTime?: number;
  pendingIncrement?: number;
  stageInfo?: string;
  isInDelay?: boolean;
}

// Existing types for backward compatibility
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
