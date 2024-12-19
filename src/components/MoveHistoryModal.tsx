import { motion } from "motion/react";
import { useStatsStore } from "@/stores/statsStore";
import { ChevronLeft, Clock, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoveHistoryModalProps {
  onBack: () => void;
}

interface MoveItemProps {
  moveNumber: number | undefined;
  time: number;
  type: "normal" | "check" | "checkmate";
  isQuickMove: boolean;
  isFastest: boolean;
  isSlowest: boolean;
}

const MoveItem = ({
  moveNumber,
  time,
  type,
  isQuickMove,
  isFastest,
  isSlowest,
}: MoveItemProps) => {
  const getTypeIcon = () => {
    switch (type) {
      case "check":
        return <Check className="w-4 h-4 text-yellow-400" />;
      case "checkmate":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "px-3 py-2 rounded-lg",
        "flex items-center justify-between",
        "transition-colors duration-200",
        isFastest && "bg-green-500/20",
        isSlowest && "bg-red-500/20",
        !isFastest && !isSlowest && "hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-white/60 w-8">{moveNumber}.</span>
        <div className="flex items-center gap-1">
          {getTypeIcon()}
          {isQuickMove && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs"
            >
              Quick
            </motion.div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-white/60" />
        <span
          className={cn(
            "text-sm",
            isFastest && "text-green-400 font-medium",
            isSlowest && "text-red-400 font-medium",
            !isFastest && !isSlowest && "text-white/80"
          )}
        >
          {time.toFixed(1)}s
        </span>
      </div>
    </motion.div>
  );
};

export const MoveHistoryModal = ({ onBack }: MoveHistoryModalProps) => {
  const { moveHistory } = useStatsStore();

  // Find fastest and slowest moves
  const fastestMove =
    moveHistory.length > 0 ? Math.min(...moveHistory.map((m) => m.time)) : 0;
  const slowestMove =
    moveHistory.length > 0 ? Math.max(...moveHistory.map((m) => m.time)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-2xl font-bold text-white">Move History</h2>
      </div>

      {/* Move List */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 max-w-4xl mx-auto">
          {/* White Moves */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white mb-4">White Moves</h3>
            {moveHistory
              .filter((move) => move.by === "white")
              .map((move) => (
                <MoveItem
                  key={move.moveNumber}
                  moveNumber={move.moveNumber}
                  time={move.time}
                  type={move.type}
                  isQuickMove={move.time < 10}
                  isFastest={move.time === fastestMove}
                  isSlowest={move.time === slowestMove}
                />
              ))}
          </div>

          {/* Black Moves */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white mb-4">Black Moves</h3>
            {moveHistory
              .filter((move) => move.by === "black")
              .map((move) => (
                <MoveItem
                  key={move.moveNumber}
                  moveNumber={move.moveNumber}
                  time={move.time}
                  type={move.type}
                  isQuickMove={move.time < 10}
                  isFastest={move.time === fastestMove}
                  isSlowest={move.time === slowestMove}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/20" />
          <span>Fastest Move</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20" />
          <span>Slowest Move</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/20" />
          <span>Quick Move (&lt;10s)</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-yellow-400" />
          <span>Check</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Checkmate</span>
        </div>
      </div>
    </motion.div>
  );
};
