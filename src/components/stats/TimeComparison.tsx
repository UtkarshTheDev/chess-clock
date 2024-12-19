import { motion } from "motion/react";
import { PlayerStats } from "@/types/chess";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeComparisonProps {
  whiteStats: PlayerStats;
  blackStats: PlayerStats;
}

const TimeComparison = ({ whiteStats, blackStats }: TimeComparisonProps) => {
  const calculateTimeRatio = (whiteTime: number, blackTime: number) => {
    if (blackTime === 0) return 0;
    return ((whiteTime - blackTime) / blackTime) * 100;
  };

  const whiteTimeRatio = calculateTimeRatio(
    whiteStats.totalTimeUsed,
    blackStats.totalTimeUsed
  );
  const blackTimeRatio = -whiteTimeRatio; // Inverse for black

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
        <h4 className="text-lg font-medium text-white">White Player</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-white/60">Time Ratio:</span>
          <span
            className={cn(
              "text-lg font-semibold",
              whiteTimeRatio > 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {whiteTimeRatio > 0 ? (
              <ArrowUpRight className="w-5 h-5 inline" />
            ) : (
              <ArrowDownRight className="w-5 h-5 inline" />
            )}
            {Math.abs(whiteTimeRatio).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
        <h4 className="text-lg font-medium text-white">Black Player</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-white/60">Time Ratio:</span>
          <span
            className={cn(
              "text-lg font-semibold",
              blackTimeRatio > 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {blackTimeRatio > 0 ? (
              <ArrowUpRight className="w-5 h-5 inline" />
            ) : (
              <ArrowDownRight className="w-5 h-5 inline" />
            )}
            {Math.abs(blackTimeRatio).toFixed(1)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeComparison;
