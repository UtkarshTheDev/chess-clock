import StatCard from "./StatCard";
import PhaseStats from "./PhaseStats";
import { type PlayerStats, type MoveRecord } from "@/stores/statsStore";

const OverviewStats = ({ stats }: { stats: PlayerStats }) => {
  const totalMoves = stats.moveHistory.length;
  const quickMovesPercentage = totalMoves > 0 ? ((stats.quickMoves / totalMoves) * 100).toFixed(1) : '0';

  const timePressureMoves = stats.moveHistory.filter(move => move.timeRemaining < 30).length;
  const criticalMoves = stats.moveHistory.filter(move => move.type !== 'normal').length;
  const consistencyScore = totalMoves > 0 ? Math.max(0, 100 - (
    stats.moveHistory.reduce((acc: number, move: MoveRecord) =>
      acc + Math.pow(move.time - stats.averageTimePerMove, 2), 0) / totalMoves
  ) * 2).toFixed(1) : '0';

  return (
    <div className="space-y-6">
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

      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Time Pressure"
            value={timePressureMoves.toString()}
            tooltip="Moves made with less than 30 seconds remaining"
          />
          <StatCard
            label="Critical Moves"
            value={criticalMoves.toString()}
            tooltip="Number of checks and checkmates"
          />
          <StatCard
            label="Consistency"
            value={`${consistencyScore}%`}
            tooltip="Consistency in move timing (higher is better)"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Phase Breakdown</h4>
        <PhaseStats stats={stats} />
      </div>
    </div>
  );
};

export default OverviewStats;
