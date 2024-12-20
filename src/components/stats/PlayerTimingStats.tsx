import { motion } from "motion/react";
import { PlayerStats } from "@/types/chess";
import { Clock, Zap, Timer, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerTimingStatsProps {
  player: "white" | "black";
  stats: PlayerStats;
  opponent: PlayerStats;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  comparison,
  tooltip,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  comparison?: number;
  tooltip?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className={cn(
      "p-4 rounded-xl",
      "bg-white/5 backdrop-blur-sm",
      "border border-white/10",
      "transition-colors duration-200",
      "hover:bg-white/10"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/10">
        <Icon className="w-5 h-5 text-white/80" />
      </div>
      <div>
        <div className="text-sm text-white/60">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">{value}</span>
          {comparison !== undefined && (
            <span
              className={cn(
                "text-sm",
                comparison > 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {comparison > 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(comparison)}%
            </span>
          )}
        </div>
      </div>
    </div>
    {tooltip && <div className="mt-2 text-xs text-white/50">{tooltip}</div>}
  </motion.div>
);

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlayerTimingStats = ({
  player,
  stats,
  opponent,
}: PlayerTimingStatsProps) => {
  const timeComparison =
    opponent.totalTimeUsed === 0
      ? 0
      : Math.round(
          ((opponent.totalTimeUsed - stats.totalTimeUsed) /
            opponent.totalTimeUsed) *
            100
        );

  const quickMovesPercentage =
    stats.moveHistory.length === 0
      ? 0
      : Math.round((stats.quickMoves / stats.moveHistory.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h4
        className={cn(
          "text-lg font-medium",
          player === "white" ? "text-white" : "text-neutral-300"
        )}
      >
        {player === "white" ? "White" : "Black"} Player Stats
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          icon={Clock}
          label="Total Time Used"
          value={formatTime(stats.totalTimeUsed)}
          comparison={timeComparison}
          tooltip="Compared to opponent's time usage"
        />

        <StatCard
          icon={Timer}
          label="Time Remaining"
          value={formatTime(stats.timeRemaining)}
        />

        <StatCard
          icon={Zap}
          label="Quick Moves"
          value={`${quickMovesPercentage}%`}
          tooltip={`${stats.quickMoves} moves under 10 seconds`}
        />

        <StatCard
          icon={Clock}
          label="Average Move Time"
          value={`${Math.round(stats.averageTimePerMove)}s`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <motion.div
          className="p-4 rounded-xl bg-white/5 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-white/60">Move Times</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Fastest Move:</span>
              <span className="text-green-400 font-medium">
                {Math.round(stats.fastestMove)}s
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Slowest Move:</span>
              <span className="text-red-400 font-medium">
                {Math.round(stats.slowestMove)}s
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-4 rounded-xl bg-white/5 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-white/60">Time Distribution</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Quick Moves:</span>
              <span className="text-white font-medium">{stats.quickMoves}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Total Moves:</span>
              <span className="text-white font-medium">
                {stats.moveHistory.length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
