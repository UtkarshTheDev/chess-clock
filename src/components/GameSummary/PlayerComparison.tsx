import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip } from "../ui/CustomTooltip";
import { Bar } from 'react-chartjs-2';
import { type PlayerStats } from "@/stores/statsStore";

const ComparisonCard = ({
  label,
  whiteValue,
  blackValue,
  tooltip,
  format = (val: number) => val.toFixed(1)
}: {
  label: string;
  whiteValue: number;
  blackValue: number;
  tooltip?: string;
  format?: (val: number) => string;
}) => {
  const whiteFormatted = format(whiteValue);
  const blackFormatted = format(blackValue);
  const whiteBetter = whiteValue < blackValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5"
    >
      {tooltip ? (
        <Tooltip text={tooltip}>
          <div className="space-y-3">
            <p className="text-sm text-neutral-400 text-center">{label}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("text-center p-2 rounded", whiteBetter && "bg-green-500/10")}>
                <p className="text-xs text-neutral-500">White</p>
                <p className="text-lg font-semibold text-white">{whiteFormatted}</p>
              </div>
              <div className={cn("text-center p-2 rounded", !whiteBetter && "bg-green-500/10")}>
                <p className="text-xs text-neutral-500">Black</p>
                <p className="text-lg font-semibold text-white">{blackFormatted}</p>
              </div>
            </div>
          </div>
        </Tooltip>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400 text-center">{label}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className={cn("text-center p-2 rounded", whiteBetter && "bg-green-500/10")}>
              <p className="text-xs text-neutral-500">White</p>
              <p className="text-lg font-semibold text-white">{whiteFormatted}</p>
            </div>
            <div className={cn("text-center p-2 rounded", !whiteBetter && "bg-green-500/10")}>
              <p className="text-xs text-neutral-500">Black</p>
              <p className="text-lg font-semibold text-white">{blackFormatted}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const PlayerComparison = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const whiteTotalMoves = whiteStats.moveHistory.length;
  const blackTotalMoves = blackStats.moveHistory.length;
  const whiteQuickMovesPercentage = whiteTotalMoves > 0 ? (whiteStats.quickMoves / whiteTotalMoves) * 100 : 0;
  const blackQuickMovesPercentage = blackTotalMoves > 0 ? (blackStats.quickMoves / blackTotalMoves) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Player Comparison</h3>
        <p className="text-sm text-neutral-400">Side-by-side performance analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComparisonCard
          label="Total Time Used"
          whiteValue={whiteStats.totalTimeUsed}
          blackValue={blackStats.totalTimeUsed}
          tooltip="Total time spent during the game"
          format={(val) => `${val.toFixed(1)}s`}
        />
        <ComparisonCard
          label="Average Move Time"
          whiteValue={whiteStats.averageTimePerMove}
          blackValue={blackStats.averageTimePerMove}
          tooltip="Average time per move"
          format={(val) => `${val.toFixed(1)}s`}
        />
        <ComparisonCard
          label="Fastest Move"
          whiteValue={whiteStats.fastestMove}
          blackValue={blackStats.fastestMove}
          tooltip="Quickest move made (excluding first 2 moves)"
          format={(val) => `${val.toFixed(1)}s`}
        />
        <ComparisonCard
          label="Slowest Move"
          whiteValue={whiteStats.slowestMove}
          blackValue={blackStats.slowestMove}
          tooltip="Longest move made"
          format={(val) => `${val.toFixed(1)}s`}
        />
        <ComparisonCard
          label="Quick Moves"
          whiteValue={whiteQuickMovesPercentage}
          blackValue={blackQuickMovesPercentage}
          tooltip="Percentage of moves made under 10 seconds"
          format={(val) => `${val.toFixed(1)}%`}
        />
        <ComparisonCard
          label="Total Moves"
          whiteValue={whiteTotalMoves}
          blackValue={blackTotalMoves}
          tooltip="Total number of moves made"
          format={(val) => val.toString()}
        />
      </div>

      <div className="bg-neutral-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/5">
        <h4 className="text-lg font-semibold text-white mb-3 sm:mb-4 text-center">Phase-Based Time Distribution</h4>
        <div className="relative h-[240px] sm:h-[300px] md:h-[340px]">
          {(() => {
            const whiteTotals = [
              whiteStats.phaseStats.opening.totalTime,
              whiteStats.phaseStats.middlegame.totalTime,
              whiteStats.phaseStats.endgame.totalTime,
            ];
            const blackTotals = [
              blackStats.phaseStats.opening.totalTime,
              blackStats.phaseStats.middlegame.totalTime,
              blackStats.phaseStats.endgame.totalTime,
            ];
            const maxVal = Math.max(...whiteTotals, ...blackTotals);
            return (
              <Bar
                data={{
                  labels: ['Opening', 'Middlegame', 'Endgame'],
                  datasets: [
                    {
                      label: 'White',
                      data: whiteTotals,
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      borderColor: 'rgba(255,255,255,0.9)',
                      borderWidth: 1,
                    },
                    {
                      label: 'Black',
                      data: blackTotals,
                      backgroundColor: 'rgba(156, 163, 175, 0.8)',
                      borderColor: 'rgba(156,163,175,0.9)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 300, easing: 'easeOutQuad' },
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        color: 'rgb(255, 255, 255)',
                        font: { size: 11 },
                      },
                    },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: 'rgb(156, 163, 175)',
                        font: { size: 10 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 3,
                      },
                      grid: { color: 'rgba(156, 163, 175, 0.08)' },
                    },
                    y: {
                      beginAtZero: true,
                      suggestedMax: maxVal * 1.1,
                      ticks: {
                        color: 'rgb(156, 163, 175)',
                        font: { size: 10 },
                        maxTicksLimit: 4,
                      },
                      grid: { color: 'rgba(156, 163, 175, 0.08)' },
                    },
                  },
                }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default PlayerComparison;
