import { useState } from 'react';
import { useTimerTypeStore } from '@/stores/timerTypeStore';
import { type PlayerStats, type MoveRecord } from '@/stores/statsStore';
import { Line, Bar } from 'react-chartjs-2';
import { cn } from '@/lib/utils';
import StatCard from './StatCard';
import type { ChartOptions } from 'chart.js';

const TimeAnalysis = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const { config, getDisplayName } = useTimerTypeStore();
  const [chartType, setChartType] = useState<'timeRemaining' | 'moveTime' | 'phaseAnalysis'>('timeRemaining');

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

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300, easing: 'easeOutQuad' as const },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(255, 255, 255)',
          font: { size: 11 },
        },
      },
      title: {
        display: true,
        text: chartType === 'timeRemaining' ? 'Time Remaining Over Moves' :
              chartType === 'moveTime' ? 'Move Time Analysis' : 'Phase-Based Time Usage',
        color: 'rgb(255, 255, 255)',
        font: { size: 12 },
      },
      tooltip: {
        enabled: true,
        usePointStyle: true,
        boxPadding: 4,
        padding: 8,
        bodyFont: { size: 12 },
        titleFont: { size: 12 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.08)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: { size: 10 },
          maxTicksLimit: 5,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.08)',
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

      <div className="bg-neutral-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/5">
        <div className="relative h-[260px] sm:h-[320px] md:h-[360px]">
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
      </div>

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

export default TimeAnalysis;
