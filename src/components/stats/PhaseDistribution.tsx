import { motion } from "motion/react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { PlayerStats } from "@/types/chess";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PhaseDistributionProps {
  whiteStats: PlayerStats;
  blackStats: PlayerStats;
}

const phaseColors = {
  opening: "#4F46E5", // Indigo
  middlegame: "#0EA5E9", // Sky
  endgame: "#A855F7", // Purple
};

const PhaseDistribution = ({
  whiteStats,
  blackStats,
}: PhaseDistributionProps) => {
  const createPieData = useCallback(
    (stats: PlayerStats) => ({
      labels: ["Opening", "Middlegame", "Endgame"],
      datasets: [
        {
          data: [
            stats.phaseStats.opening.totalTime,
            stats.phaseStats.middlegame.totalTime,
            stats.phaseStats.endgame.totalTime,
          ],
          backgroundColor: Object.values(phaseColors),
          borderWidth: 0,
        },
      ],
    }),
    []
  );

  const createOptions = useCallback(
    (stats: PlayerStats): ChartOptions<"doughnut"> => ({
      cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              const total = stats.totalTimeUsed || 1;
              const pct = Math.round((value / total) * 100);
              return `${Math.round(value)}s (${pct}%)`;
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    }),
    []
  );

  const PhaseIndicator = ({
    phase,
    color,
  }: {
    phase: string;
    color: string;
  }) => (
    <div className="flex items-center gap-2">
      <div className={cn("w-3.5 h-3.5 rounded-full")} style={{ backgroundColor: color }} />
      <span className="text-base text-white/85">{phase}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* White Player */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">White</h4>
        <motion.div className="relative h-72 md:h-56" whileTap={{ scale: 0.98 }}>
          <Doughnut
            data={createPieData(whiteStats)}
            options={createOptions(whiteStats)}
          />
        </motion.div>
        <div className="flex justify-around mt-4">
          {Object.entries(phaseColors).map(([phase, color]) => (
            <PhaseIndicator key={phase} phase={phase} color={color} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-white/80">
          {Object.entries(whiteStats.phaseStats).map(([phase, stats]) => (
            <div key={phase} className="text-center">
              <div>{stats.moveCount} moves</div>
              <div>{Math.round(stats.averageTime)}s avg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Black Player */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Black</h4>
        <motion.div className="relative h-72 md:h-56" whileTap={{ scale: 0.98 }}>
          <Doughnut
            data={createPieData(blackStats)}
            options={createOptions(blackStats)}
          />
        </motion.div>
        <div className="flex justify-around mt-4">
          {Object.entries(phaseColors).map(([phase, color]) => (
            <PhaseIndicator key={phase} phase={phase} color={color} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-white/80">
          {Object.entries(blackStats.phaseStats).map(([phase, stats]) => (
            <div key={phase} className="text-center">
              <div>{stats.moveCount} moves</div>
              <div>{Math.round(stats.averageTime)}s avg</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PhaseDistribution;
