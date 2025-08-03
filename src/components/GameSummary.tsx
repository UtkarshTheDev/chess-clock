import { motion } from "framer-motion";
import { useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useTimerTypeStore } from "@/stores/timerTypeStore";
import { Crown, Play, Home, Handshake, BarChart3, Users, TrendingUp, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./ui/CustomTooltip";
import { type PlayerStats, type MoveRecord } from "@/stores/statsStore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

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
}) => {
  const { getDetailedDisplayName } = useTimerTypeStore();

  return (
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
      {winner === "draw" ? (
        <Handshake className="w-8 h-8 text-blue-400" />
      ) : (
        <Crown className="w-8 h-8 text-amber-400" />
      )}
      <h2 className="text-2xl font-bold text-white">
        {winner === "draw" ? "Draw" : `${winner} Wins!`}
      </h2>
      {winner === "draw" ? (
        <Handshake className="w-8 h-8 text-blue-400" />
      ) : (
        <Crown className="w-8 h-8 text-amber-400" />
      )}
    </motion.div>
    <p className="text-neutral-400">{reason}</p>
    <div className="mt-2 text-sm text-neutral-500">
      Timer Type: {getDetailedDisplayName()}
    </div>
  </motion.div>
  );
};

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
    {tooltip ? (
      <Tooltip text={tooltip}>
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </Tooltip>
    ) : (
      <div className="space-y-1">
        <p className="text-sm text-neutral-400">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    )}
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
            <div className="flex items-center gap-2">
              <span className="text-white">{time.toFixed(1)}s</span>
              <span className="text-neutral-500">({moves} moves)</span>
            </div>
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

const MoveItem = ({
  move,
  isFastest,
  isSlowest,
}: {
  move: MoveRecord;
  isFastest: boolean;
  isSlowest: boolean;
}) => {
  const getPhaseColor = () => {
    switch (move.phase) {
      case "opening":
        return "text-blue-400";
      case "middlegame":
        return "text-yellow-400";
      case "endgame":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-lg",
        "bg-white/5 backdrop-blur-sm",
        "border border-white/10",
        isFastest && "border-green-500/50",
        isSlowest && "border-red-500/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Move {move.moveNumber}</span>
          <span className={cn("text-sm font-medium", getPhaseColor())}>
            {move.phase ? move.phase.charAt(0).toUpperCase() + move.phase.slice(1) : 'Unknown'}
          </span>
        </div>
        <span className="text-sm font-medium text-white">
          {move.time.toFixed(1)}s
        </span>
      </div>
    </motion.div>
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
    stats.moveHistory.reduce((acc: number, move: MoveRecord) => acc + move.time, 0) / totalMoves;
  const timeVariance =
    stats.moveHistory.reduce(
      (acc: number, move: MoveRecord) => acc + Math.pow(move.time - averageMoveTime, 2),
      0
    ) / totalMoves;
  const consistencyScore = Math.max(0, 100 - timeVariance * 2).toFixed(1);
  const moveHistory = [...stats.moveHistory].sort((a, b) => b.time - a.time);
  const fastestMove = moveHistory[moveHistory.length - 1];
  const slowestMove = moveHistory[0];

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
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Phase Analysis
          </h3>
          <PhaseStats stats={stats} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Move History
          </h3>
          <div className="space-y-2">
            {moveHistory.map((move) => (
              <MoveItem
                key={move.moveNumber}
                move={move}
                isFastest={move === fastestMove}
                isSlowest={move === slowestMove}
              />
            ))}
          </div>
        </div>
      </div>
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

// New Player Comparison Component
const PlayerComparison = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
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
    const whiteBetter = whiteValue < blackValue; // For time-based metrics, less is usually better

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

      {/* Phase Comparison Chart */}
      <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-white/5">
        <h4 className="text-lg font-semibold text-white mb-4 text-center">Phase-Based Time Distribution</h4>
        <Bar
          data={{
            labels: ['Opening', 'Middlegame', 'Endgame'],
            datasets: [
              {
                label: 'White',
                data: [
                  whiteStats.phaseStats.opening.totalTime,
                  whiteStats.phaseStats.middlegame.totalTime,
                  whiteStats.phaseStats.endgame.totalTime,
                ],
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
              {
                label: 'Black',
                data: [
                  blackStats.phaseStats.opening.totalTime,
                  blackStats.phaseStats.middlegame.totalTime,
                  blackStats.phaseStats.endgame.totalTime,
                ],
                backgroundColor: 'rgba(156, 163, 175, 0.8)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
                labels: {
                  color: 'rgb(255, 255, 255)',
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: 'rgb(156, 163, 175)',
                },
                grid: {
                  color: 'rgba(156, 163, 175, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: 'rgb(156, 163, 175)',
                },
                grid: {
                  color: 'rgba(156, 163, 175, 0.1)',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// New Time Analysis Component with interactive charts
const TimeAnalysis = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const { config, getDisplayName } = useTimerTypeStore();
  const [chartType, setChartType] = useState<'timeRemaining' | 'moveTime' | 'phaseAnalysis'>('timeRemaining');

  // Prepare data for time remaining chart
  const allMoves = [...whiteStats.moveHistory, ...blackStats.moveHistory]
    .sort((a, b) => a.moveNumber - b.moveNumber);

  const whiteTimeData = whiteStats.moveHistory.map((move: MoveRecord) => move.timeRemaining);
  const blackTimeData = blackStats.moveHistory.map((move: MoveRecord) => move.timeRemaining);
  const moveNumbers = Array.from({length: Math.max(whiteStats.moveHistory.length, blackStats.moveHistory.length)}, (_, i) => i + 1);

  const timeRemainingData = {
    labels: moveNumbers,
    datasets: [
      {
        label: 'White Time Remaining',
        data: whiteTimeData,
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Black Time Remaining',
        data: blackTimeData,
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        tension: 0.1,
      },
    ],
  };

  // Prepare data for move time chart
  const whiteMoveTimeData = whiteStats.moveHistory.map((move: MoveRecord) => move.time);
  const blackMoveTimeData = blackStats.moveHistory.map((move: MoveRecord) => move.time);

  const moveTimeData = {
    labels: moveNumbers,
    datasets: [
      {
        label: 'White Move Time',
        data: whiteMoveTimeData,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      },
      {
        label: 'Black Move Time',
        data: blackMoveTimeData,
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
      },
    ],
  };

  // Prepare data for phase analysis
  const phaseData = {
    labels: ['Opening', 'Middlegame', 'Endgame'],
    datasets: [
      {
        label: 'White',
        data: [
          whiteStats.phaseStats.opening.totalTime,
          whiteStats.phaseStats.middlegame.totalTime,
          whiteStats.phaseStats.endgame.totalTime,
        ],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.4)'],
      },
      {
        label: 'Black',
        data: [
          blackStats.phaseStats.opening.totalTime,
          blackStats.phaseStats.middlegame.totalTime,
          blackStats.phaseStats.endgame.totalTime,
        ],
        backgroundColor: ['rgba(156, 163, 175, 0.8)', 'rgba(156, 163, 175, 0.6)', 'rgba(156, 163, 175, 0.4)'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(255, 255, 255)',
        },
      },
      title: {
        display: true,
        text: chartType === 'timeRemaining' ? 'Time Remaining Over Moves' :
              chartType === 'moveTime' ? 'Move Time Analysis' : 'Phase-Based Time Usage',
        color: 'rgb(255, 255, 255)',
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Time Usage Analysis</h3>
        <p className="text-sm text-neutral-400">
          Interactive time usage patterns for {getDisplayName()}
          {config.mode === 'FISCHER_INCREMENT' && ` (+${(config.incMillis || 0) / 1000}s increment)`}
          {(config.mode === 'SIMPLE_DELAY' || config.mode === 'BRONSTEIN_DELAY') && ` (${(config.delayMillis || 0) / 1000}s delay)`}
        </p>
      </div>

      {/* Chart Type Selector */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setChartType('timeRemaining')}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium transition-all",
            chartType === 'timeRemaining'
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:text-white"
          )}
        >
          Time Remaining
        </button>
        <button
          onClick={() => setChartType('moveTime')}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium transition-all",
            chartType === 'moveTime'
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:text-white"
          )}
        >
          Move Times
        </button>
        <button
          onClick={() => setChartType('phaseAnalysis')}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium transition-all",
            chartType === 'phaseAnalysis'
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:text-white"
          )}
        >
          Phase Analysis
        </button>
      </div>

      {/* Chart Display */}
      <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-white/5">
        {chartType === 'timeRemaining' && (
          <Line data={timeRemainingData} options={chartOptions} />
        )}
        {chartType === 'moveTime' && (
          <Bar data={moveTimeData} options={chartOptions} />
        )}
        {chartType === 'phaseAnalysis' && (
          <Bar data={phaseData} options={chartOptions} />
        )}
      </div>

      {/* Timer-Mode-Specific Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Avg White Move"
          value={`${whiteStats.averageTimePerMove.toFixed(1)}s`}
          tooltip="Average time per move for White"
        />
        <StatCard
          label="Avg Black Move"
          value={`${blackStats.averageTimePerMove.toFixed(1)}s`}
          tooltip="Average time per move for Black"
        />

        {config.mode === 'FISCHER_INCREMENT' && (
          <StatCard
            label="Increment Value"
            value={`+${(config.incMillis || 0) / 1000}s`}
            tooltip="Time added after each move"
          />
        )}

        {(config.mode === 'SIMPLE_DELAY' || config.mode === 'BRONSTEIN_DELAY') && (
          <StatCard
            label="Delay Period"
            value={`${(config.delayMillis || 0) / 1000}s`}
            tooltip={config.mode === 'SIMPLE_DELAY' ? 'Delay before main time counts down' : 'Bronstein delay period'}
          />
        )}

        {config.mode === 'MULTI_STAGE' && (
          <StatCard
            label="Stages"
            value={`${(config.stages?.length || 0) + 1}`}
            tooltip="Number of time control stages"
          />
        )}

        <StatCard
          label="Time Difference"
          value={`${Math.abs(whiteStats.totalTimeUsed - blackStats.totalTimeUsed).toFixed(1)}s`}
          tooltip="Difference in total time used"
        />

        {config.mode === 'SUDDEN_DEATH' && (
          <StatCard
            label="Longest Move"
            value={`${Math.max(whiteStats.slowestMove, blackStats.slowestMove).toFixed(1)}s`}
            tooltip="Longest move in the game"
          />
        )}
      </div>
    </div>
  );
};

// New Performance Insights Component with timer-mode-specific analysis
const PerformanceInsights = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const { config, getDisplayName } = useTimerTypeStore();

  // Timer-mode-specific analysis functions
  const getSuddenDeathInsights = () => {
    const whiteTimeUsage = whiteStats.totalTimeUsed;
    const blackTimeUsage = blackStats.totalTimeUsed;
    const initialTime = config.baseMillis / 1000;

    const insights = [];

    // Time depletion analysis
    const whiteTimeUsagePercent = (whiteTimeUsage / initialTime) * 100;
    const blackTimeUsagePercent = (blackTimeUsage / initialTime) * 100;

    if (whiteTimeUsagePercent > 90) {
      insights.push({
        type: 'warning',
        title: 'White Time Pressure',
        description: 'White used over 90% of available time. Consider faster decision-making in similar positions.',
        icon: '⚠️'
      });
    }

    if (blackTimeUsagePercent > 90) {
      insights.push({
        type: 'warning',
        title: 'Black Time Pressure',
        description: 'Black used over 90% of available time. Consider faster decision-making in similar positions.',
        icon: '⚠️'
      });
    }

    // Endgame time management
    const whiteEndgameTime = whiteStats.phaseStats.endgame.totalTime;
    const blackEndgameTime = blackStats.phaseStats.endgame.totalTime;

    if (whiteEndgameTime > whiteStats.phaseStats.opening.totalTime + whiteStats.phaseStats.middlegame.totalTime) {
      insights.push({
        type: 'tip',
        title: 'White Endgame Focus',
        description: 'White spent significant time in the endgame. This shows good calculation but consider time management.',
        icon: '💡'
      });
    }

    if (blackEndgameTime > blackStats.phaseStats.opening.totalTime + blackStats.phaseStats.middlegame.totalTime) {
      insights.push({
        type: 'tip',
        title: 'Black Endgame Focus',
        description: 'Black spent significant time in the endgame. This shows good calculation but consider time management.',
        icon: '💡'
      });
    }

    return insights;
  };

  const getFischerIncrementInsights = () => {
    const increment = (config.incMillis || 0) / 1000;
    const insights = [];

    // Time banking analysis
    const whiteAvgMoveTime = whiteStats.averageTimePerMove;
    const blackAvgMoveTime = blackStats.averageTimePerMove;

    if (whiteAvgMoveTime < increment) {
      insights.push({
        type: 'positive',
        title: 'White Time Banking',
        description: `White is effectively banking time (avg ${whiteAvgMoveTime.toFixed(1)}s vs ${increment}s increment).`,
        icon: '✅'
      });
    }

    if (blackAvgMoveTime < increment) {
      insights.push({
        type: 'positive',
        title: 'Black Time Banking',
        description: `Black is effectively banking time (avg ${blackAvgMoveTime.toFixed(1)}s vs ${increment}s increment).`,
        icon: '✅'
      });
    }

    // Long-term time management
    if (whiteAvgMoveTime > increment * 2) {
      insights.push({
        type: 'warning',
        title: 'White Time Consumption',
        description: `White is using more than 2x the increment per move. Consider faster play to build time reserves.`,
        icon: '⚠️'
      });
    }

    return insights;
  };

  const getDelayInsights = () => {
    const delay = (config.delayMillis || 0) / 1000;
    const insights = [];

    // Quick decision analysis
    const whiteQuickMoves = whiteStats.quickMoves;
    const blackQuickMoves = blackStats.quickMoves;
    const whiteTotalMoves = whiteStats.moveHistory.length;
    const blackTotalMoves = blackStats.moveHistory.length;

    const whiteQuickPercent = whiteTotalMoves > 0 ? (whiteQuickMoves / whiteTotalMoves) * 100 : 0;
    const blackQuickPercent = blackTotalMoves > 0 ? (blackQuickMoves / blackTotalMoves) * 100 : 0;

    if (whiteQuickPercent > 60) {
      insights.push({
        type: 'positive',
        title: 'White Delay Utilization',
        description: `White made ${whiteQuickPercent.toFixed(1)}% of moves quickly, effectively using the ${delay}s delay.`,
        icon: '✅'
      });
    }

    if (blackQuickPercent > 60) {
      insights.push({
        type: 'positive',
        title: 'Black Delay Utilization',
        description: `Black made ${blackQuickPercent.toFixed(1)}% of moves quickly, effectively using the ${delay}s delay.`,
        icon: '✅'
      });
    }

    return insights;
  };

  const getMultiStageInsights = () => {
    const insights = [];

    // Stage adaptation analysis
    insights.push({
      type: 'info',
      title: 'Multi-Stage Analysis',
      description: 'Multi-stage time controls require different strategies for each phase. Monitor time usage across stages.',
      icon: '📊'
    });

    // Opening preparation efficiency
    const whiteOpeningAvg = whiteStats.phaseStats.opening.averageTime;
    const blackOpeningAvg = blackStats.phaseStats.opening.averageTime;

    if (whiteOpeningAvg < 30) {
      insights.push({
        type: 'positive',
        title: 'White Opening Preparation',
        description: 'White showed good opening preparation with quick early moves.',
        icon: '✅'
      });
    }

    if (blackOpeningAvg < 30) {
      insights.push({
        type: 'positive',
        title: 'Black Opening Preparation',
        description: 'Black showed good opening preparation with quick early moves.',
        icon: '✅'
      });
    }

    return insights;
  };

  // Get insights based on timer mode
  const getTimerSpecificInsights = () => {
    switch (config.mode) {
      case 'SUDDEN_DEATH':
        return getSuddenDeathInsights();
      case 'FISCHER_INCREMENT':
        return getFischerIncrementInsights();
      case 'SIMPLE_DELAY':
      case 'BRONSTEIN_DELAY':
        return getDelayInsights();
      case 'MULTI_STAGE':
        return getMultiStageInsights();
      default:
        return [];
    }
  };

  const insights = getTimerSpecificInsights();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Performance Insights</h3>
        <p className="text-sm text-neutral-400">
          Timer-specific analysis for {getDisplayName()}
        </p>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-lg border",
                insight.type === 'positive' && "bg-green-500/10 border-green-500/30",
                insight.type === 'warning' && "bg-yellow-500/10 border-yellow-500/30",
                insight.type === 'tip' && "bg-blue-500/10 border-blue-500/30",
                insight.type === 'info' && "bg-neutral-500/10 border-neutral-500/30"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{insight.icon}</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-sm text-neutral-300">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-lg border border-white/5 text-center">
          <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-neutral-400">No specific insights available for this game.</p>
          <p className="text-sm text-neutral-500 mt-2">
            Play more games to get personalized performance analysis.
          </p>
        </div>
      )}
    </div>
  );
};

// Enhanced Move History Component
const EnhancedMoveHistory = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const allMoves = [...whiteStats.moveHistory, ...blackStats.moveHistory]
    .sort((a, b) => a.moveNumber - b.moveNumber);

  const fastestMove = allMoves.reduce((fastest, move) =>
    move.time < fastest.time ? move : fastest, allMoves[0]);
  const slowestMove = allMoves.reduce((slowest, move) =>
    move.time > slowest.time ? move : slowest, allMoves[0]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Move History</h3>
        <p className="text-sm text-neutral-400">Detailed move-by-move analysis</p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {allMoves.map((move) => (
          <MoveItem
            key={`${move.by}-${move.moveNumber}`}
            move={move}
            isFastest={move === fastestMove}
            isSlowest={move === slowestMove}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced tab types for the new 5-tab structure
type TabType = "overview" | "comparison" | "timeAnalysis" | "insights" | "moveHistory";

const GameSummary = ({ onNewGame, onExit }: GameSummaryProps) => {
  const { gameSummary } = useStatsStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  if (!gameSummary) {
    console.error('GameSummary: No game summary data available');
    return null;
  }

  const { winner, endReason, whiteStats, blackStats } = gameSummary;

  // Safety checks for required data
  if (!winner || !endReason || !whiteStats || !blackStats) {
    console.error('GameSummary: Missing required game data', { winner, endReason, whiteStats: !!whiteStats, blackStats: !!blackStats });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-neutral-900 rounded-2xl p-6 text-white text-center">
          <p>Error loading game summary</p>
          <button onClick={onExit} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-neutral-900 rounded-2xl shadow-xl border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <WinnerBanner
          winner={winner}
          reason={endReason}
        />

        <div className="flex p-2 gap-1 border-b border-white/5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "overview"
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            <BarChart3 className="w-3 h-3" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "comparison"
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Users className="w-3 h-3" />
            Compare
          </button>
          <button
            onClick={() => setActiveTab("timeAnalysis")}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "timeAnalysis"
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Clock className="w-3 h-3" />
            Time
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "insights"
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            <TrendingUp className="w-3 h-3" />
            Insights
          </button>
          <button
            onClick={() => setActiveTab("moveHistory")}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "moveHistory"
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            <History className="w-3 h-3" />
            Moves
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {activeTab === "overview" && (
              <OverviewStats
                stats={
                  winner === "white"
                    ? whiteStats
                    : blackStats
                }
              />
            )}
            {activeTab === "comparison" && (
              <PlayerComparison
                whiteStats={whiteStats}
                blackStats={blackStats}
              />
            )}
            {activeTab === "timeAnalysis" && (
              <TimeAnalysis
                whiteStats={whiteStats}
                blackStats={blackStats}
              />
            )}
            {activeTab === "insights" && (
              <PerformanceInsights
                whiteStats={whiteStats}
                blackStats={blackStats}
              />
            )}
            {activeTab === "moveHistory" && (
              <EnhancedMoveHistory
                whiteStats={whiteStats}
                blackStats={blackStats}
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex gap-3 flex-wrap sm:flex-nowrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExit}
            className="flex-1 flex items-center justify-center text-slate-300 gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Exit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewGame}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors text-sm font-medium"
          >
            <Play className="w-4 h-4" />
                        New Game
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            };

            export default GameSummary;
