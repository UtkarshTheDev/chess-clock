import { motion } from "motion/react";
import { useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { Clock, Trophy, Swords, Crown, Play, Home, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PlayerStats, type MoveRecord } from "@/stores/statsStore";

interface GameSummaryProps {
  onNewGame: () => void;
  onExit: () => void;
}

const WinnerBanner = ({
  winner,
  reason,
}: {
  winner: string;
  reason: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 text-center border-b border-white/5"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="flex items-center justify-center gap-3 mb-2"
    >
      <Crown className="w-8 h-8 text-amber-400" />
      <h2 className="text-2xl font-bold text-white">{winner} Wins!</h2>
      <Crown className="w-8 h-8 text-amber-400" />
    </motion.div>
    <p className="text-neutral-400">{reason}</p>
  </motion.div>
);

const StatCard = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5"
  >
    <div className="space-y-1">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  </motion.div>
);

interface PhaseStatsProps {
  stats: PlayerStats;
}

const PhaseStats = ({ stats }: PhaseStatsProps) => {
  const totalTime = stats.totalTimeUsed;
  const phaseData = [
    {
      phase: "Opening",
      time: stats.phaseStats.opening.totalTime,
      moves: stats.phaseStats.opening.moveCount,
    },
    {
      phase: "Middlegame",
      time: stats.phaseStats.middlegame.totalTime,
      moves: stats.phaseStats.middlegame.moveCount,
    },
    {
      phase: "Endgame",
      time: stats.phaseStats.endgame.totalTime,
      moves: stats.phaseStats.endgame.moveCount,
    },
  ];

  return (
    <div className="space-y-2">
      {phaseData.map(({ phase, time, moves }) => (
        <div key={phase} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">{phase}</span>
            <span className="text-white">{time.toFixed(1)}s</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              style={{ width: `${(time / totalTime) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalysisStats = ({ stats }: { stats: PlayerStats }) => {
  const totalMoves = stats.moveHistory.length;
  const firstMove = stats.moveHistory[0];
  const initialTime = firstMove ? firstMove.timeRemaining + firstMove.time : 0;

  const slowMoves = stats.moveHistory.filter(
    (move: MoveRecord) => move.time > initialTime * 0.05
  ).length;

  const criticalMoves = stats.moveHistory.filter(
    (move: MoveRecord) => move.type !== "normal"
  ).length;

  const averageMoveTime =
    stats.moveHistory.reduce((acc, move) => acc + move.time, 0) / totalMoves;
  const timeVariance =
    stats.moveHistory.reduce(
      (acc, move) => acc + Math.pow(move.time - averageMoveTime, 2),
      0
    ) / totalMoves;
  const consistencyScore = Math.max(0, 100 - timeVariance * 2).toFixed(1);

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Quick Moves"
        value={`${stats.quickMoves}`}
        tooltip={`Moves taking less than ${(initialTime * 0.01).toFixed(
          1
        )}s (1% of game duration)`}
      />
      <StatCard
        label="Slow Moves"
        value={`${slowMoves}`}
        tooltip={`Moves taking more than ${(initialTime * 0.05).toFixed(
          1
        )}s (5% of game duration)`}
      />
      <StatCard
        label="Critical Moves"
        value={`${criticalMoves}`}
        tooltip="Number of check and checkmate moves"
      />
      <StatCard
        label="Time Variance"
        value={`${timeVariance.toFixed(1)}`}
        tooltip="Variance in move times (lower is more consistent)"
      />
      <StatCard
        label="Consistency"
        value={`${consistencyScore}%`}
        tooltip="Overall consistency in move timing"
      />
      <StatCard
        label="Avg Time Left"
        value={`${(stats.timeRemaining / totalMoves).toFixed(1)}s`}
        tooltip="Average time remaining after each move"
      />
    </div>
  );
};

const OverviewStats = ({ stats }: { stats: PlayerStats }) => {
  const totalMoves = stats.moveHistory.length;
  const quickMovesPercentage = ((stats.quickMoves / totalMoves) * 100).toFixed(
    1
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Total Time"
        value={`${stats.totalTimeUsed.toFixed(1)}s`}
        tooltip="Total time used in the game"
      />
      <StatCard
        label="Average Move"
        value={`${stats.averageTimePerMove.toFixed(1)}s`}
        tooltip="Average time per move"
      />
      <StatCard
        label="Fastest Move"
        value={`${stats.fastestMove.toFixed(1)}s`}
        tooltip="Fastest move (excluding first 2 moves)"
      />
      <StatCard
        label="Slowest Move"
        value={`${stats.slowestMove.toFixed(1)}s`}
        tooltip="Slowest move of the game"
      />
      <StatCard
        label="Quick Moves"
        value={`${quickMovesPercentage}%`}
        tooltip="Percentage of moves made under 10 seconds"
      />
      <StatCard
        label="Total Moves"
        value={totalMoves.toString()}
        tooltip="Total number of moves made"
      />
    </div>
  );
};

interface PlayerStatsSectionProps {
  player: "white" | "black";
  stats: PlayerStats;
  isOverview?: boolean;
}

const PlayerStatsSection = ({
  player,
  stats,
  isOverview = true,
}: PlayerStatsSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            player === "white" ? "bg-white" : "bg-black"
          )}
        />
        <h3 className="text-xl font-bold text-white capitalize">{player}</h3>
      </div>

      {isOverview ? (
        <OverviewStats stats={stats} />
      ) : (
        <>
          <AnalysisStats stats={stats} />
          <PhaseStats stats={stats} />
        </>
      )}
    </motion.div>
  );
};

const MoveItem = ({
  move,
  isFastest,
  isSlowest,
}: {
  move: MoveRecord;
  isFastest: boolean;
  isSlowest: boolean;
}) => {
  const getTypeIcon = () => {
    switch (move.type) {
      case "check":
        return <Check className="w-4 h-4 text-yellow-400" />;
      case "checkmate":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  const getPhaseColor = () => {
    switch (move.phase) {
      case "opening":
        return "text-blue-400";
      case "middlegame":
        return "text-purple-400";
      case "endgame":
        return "text-red-400";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg",
        "flex items-center justify-between",
        "transition-all duration-200",
        "border border-transparent",
        isFastest && "bg-green-500/20 border-green-500/30",
        isSlowest && "bg-red-500/20 border-red-500/30",
        !isFastest && !isSlowest && "hover:bg-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400 w-6">{move.moveNumber}.</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium capitalize",
              move.by === "white" ? "text-white" : "text-neutral-300"
            )}
          >
            {move.by}
          </span>
          {getTypeIcon()}
        </div>
        <span className={cn("text-xs font-medium capitalize", getPhaseColor())}>
          {move.phase}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-400">
            {move.time.toFixed(1)}s
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <span>{move.timeRemaining.toFixed(0)}s</span>
          <span>left</span>
        </div>
      </div>
    </div>
  );
};

const GameSummary = ({ onNewGame, onExit }: GameSummaryProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "moves">(
    "overview"
  );
  const { gameSummary } = useStatsStore();

  if (!gameSummary) {
    return null;
  }

  const renderMoveHistory = () => {
    const allMoves = [
      ...gameSummary.whiteStats.moveHistory,
      ...gameSummary.blackStats.moveHistory,
    ].sort((a, b) => a.moveNumber - b.moveNumber);

    const fastestMove = Math.min(...allMoves.map((m) => m.time));
    const slowestMove = Math.max(...allMoves.map((m) => m.time));

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Move History</h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {allMoves.map((move) => (
            <MoveItem
              key={`${move.by}-${move.moveNumber}`}
              move={move}
              isFastest={move.time === fastestMove}
              isSlowest={move.time === slowestMove}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-neutral-900/95 rounded-xl shadow-2xl max-w-5xl mx-auto backdrop-blur-md max-h-[90vh] flex flex-col">
      <WinnerBanner
        winner={gameSummary.winner}
        reason={gameSummary.endReason}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Game Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-400">Winner</h3>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-medium text-white">
                  {gameSummary.winner === "draw"
                    ? "Draw"
                    : `${gameSummary.winner} wins!`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-400">
                End Reason
              </h3>
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-blue-500" />
                <span className="text-lg font-medium text-white capitalize">
                  {gameSummary.endReason}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">Statistics</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "overview"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "analysis"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab("moves")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "moves"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                Moves
              </button>
            </div>
          </div>

          {activeTab === "moves" ? (
            renderMoveHistory()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-400">White</h4>
                {activeTab === "overview" ? (
                  <OverviewStats stats={gameSummary.whiteStats} />
                ) : (
                  <AnalysisStats stats={gameSummary.whiteStats} />
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-400">Black</h4>
                {activeTab === "overview" ? (
                  <OverviewStats stats={gameSummary.blackStats} />
                ) : (
                  <AnalysisStats stats={gameSummary.blackStats} />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={onNewGame}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium",
              "bg-gradient-to-r from-blue-600 to-blue-500",
              "hover:shadow-lg hover:scale-105 transition-all",
              "w-full sm:w-auto"
            )}
          >
            <Play className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={onExit}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium",
              "bg-neutral-800 hover:bg-neutral-700",
              "transition-colors",
              "w-full sm:w-auto"
            )}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSummary;
