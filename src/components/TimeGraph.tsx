import { Line } from "react-chartjs-2";
import { useStatsStore } from "@/stores/statsStore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  TooltipItem,
} from "chart.js";
import { motion } from "motion/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const TimeGraph = () => {
  const { gameSummary } = useStatsStore();

  if (!gameSummary) return null;

  const whiteMoves = gameSummary.whiteStats.moveHistory;
  const blackMoves = gameSummary.blackStats.moveHistory;

  const data = {
    labels: Array.from(
      { length: Math.max(whiteMoves.length, blackMoves.length) },
      (_, i) => i + 1
    ),
    datasets: [
      {
        label: "White",
        data: whiteMoves.map((move) => ({
          x: move.moveNumber,
          y: move.time,
          phase: move.phase,
          type: move.type,
        })),
        borderColor: "rgba(219, 234, 254, 0.8)",
        backgroundColor: "rgba(219, 234, 254, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(219, 234, 254, 0.8)",
        pointBorderColor: "rgba(219, 234, 254, 0.8)",
      },
      {
        label: "Black",
        data: blackMoves.map((move) => ({
          x: move.moveNumber,
          y: move.time,
          phase: move.phase,
          type: move.type,
        })),
        borderColor: "rgba(55, 65, 81, 0.8)",
        backgroundColor: "rgba(55, 65, 81, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(55, 65, 81, 0.8)",
        pointBorderColor: "rgba(55, 65, 81, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeInOutCubic",
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: "system-ui",
            size: 13,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 14,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          title: function (tooltipItems: TooltipItem<"line">[]) {
            return `Move ${tooltipItems[0].parsed.x}`;
          },
          label: function (tooltipItem: TooltipItem<"line">) {
            const move = tooltipItem.raw as {
              y: number;
              phase: string;
              type: string;
            };
            const timeStr = move.y.toFixed(1);
            const phaseStr =
              move.phase.charAt(0).toUpperCase() + move.phase.slice(1);
            const typeStr = move.type !== "normal" ? ` (${move.type})` : "";

            return [
              `${tooltipItem.dataset.label}: ${timeStr}s${typeStr}`,
              `Phase: ${phaseStr}`,
            ];
          },
          labelTextColor: function (tooltipItem: TooltipItem<"line">) {
            return tooltipItem.dataset.label === "White"
              ? "rgba(219, 234, 254, 1)"
              : "rgba(55, 65, 81, 1)";
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Move Number",
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Time (seconds)",
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 12,
          },
        },
      },
    },
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/50"
    >
      <h3 className="text-xl font-bold text-white mb-4">Time Usage Trends</h3>
      <div className="h-[24rem] sm:h-[26rem] md:h-80 lg:h-96">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

export default TimeGraph;
