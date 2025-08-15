import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useStatsStore } from "@/stores/statsStore";
import {
  Play,
  Home,
  BarChart3,
  Users,
  Clock,
  History,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
} from "chart.js";

import WinnerBanner from "./WinnerBanner";
import OverviewStats from "./OverviewStats";
import PlayerComparison from "./PlayerComparison";
import TimeAnalysis from "./TimeAnalysis";
import PerformanceInsights from "./PerformanceInsights";
import MoveHistory from "./MoveHistory";

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

const customStyles = `
  .game-summary-dialog {
    contain: layout style;
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.4);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.6);
    background-clip: content-box;
  }

  /* Horizontal scrolling behavior for the tab list on small screens */
  .tablist-scroll {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  .tablist-scroll::-webkit-scrollbar {
    height: 8px;
  }
  .tablist-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .tablist-scroll::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.4);
    border-radius: 4px;
  }
  .tablist-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.6);
  }

  .tooltip-container {
    position: relative;
    overflow: visible;
  }

  .tooltip-container [data-tooltip] {
    max-width: calc(100vw - 2rem);
    word-wrap: break-word;
  }

  @media (max-width: 768px) {
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .tablist-scroll::-webkit-scrollbar {
      height: 4px;
    }
  }
`;

interface GameSummaryProps {
  onNewGame: () => void;
  onExit: () => void;
}

type TabType =
  | "overview"
  | "comparison"
  | "timeAnalysis"
  | "insights"
  | "moveHistory";

const GameSummary = ({ onNewGame, onExit }: GameSummaryProps) => {
  const { gameSummary } = useStatsStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    if (typeof document !== "undefined") {
      const styleId = "game-summary-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = customStyles;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (!gameSummary) {
    console.error("GameSummary: No game summary data available");
    return null;
  }

  const { winner, endReason, whiteStats, blackStats } = gameSummary;

  if (!winner || !endReason || !whiteStats || !blackStats) {
    console.error("GameSummary: Missing required game data", {
      winner,
      endReason,
      whiteStats: !!whiteStats,
      blackStats: !!blackStats,
    });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-neutral-900 rounded-2xl p-6 text-white text-center">
          <p>Error loading game summary</p>
          <button
            onClick={onExit}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
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
        className="w-full max-w-5xl bg-neutral-900 rounded-2xl shadow-xl border border-white/10 max-h-[95vh] overflow-hidden flex flex-col game-summary-dialog"
      >
        <WinnerBanner winner={winner} reason={endReason} />

        <div className="flex justify-center px-3 sm:px-6 py-2 border-b border-white/5">
          <div
            role="tablist"
            aria-label="Game summary sections"
            className="relative w-full max-w-full overflow-x-auto tablist-scroll"
          >
            <div className="flex flex-nowrap gap-1 bg-neutral-800/50 p-1 rounded-xl backdrop-blur-sm min-w-max">
              <button
                role="tab"
                aria-selected={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                  activeTab === "overview"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                )}
              >
                <BarChart3 className="w-3 h-3" />
                Overview
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "comparison"}
                onClick={() => setActiveTab("comparison")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                  activeTab === "comparison"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Users className="w-3 h-3" />
                Compare
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "timeAnalysis"}
                onClick={() => setActiveTab("timeAnalysis")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                  activeTab === "timeAnalysis"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Clock className="w-3 h-3" />
                Time
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "insights"}
                onClick={() => setActiveTab("insights")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                  activeTab === "insights"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                )}
              >
                <TrendingUp className="w-3 h-3" />
                Insights
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "moveHistory"}
                onClick={() => setActiveTab("moveHistory")}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                  activeTab === "moveHistory"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                )}
              >
                <History className="w-3 h-3" />
                Moves
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-8 max-w-full overflow-hidden min-h-0">
            {activeTab === "overview" && (
              <OverviewStats
                stats={winner === "white" ? whiteStats : blackStats}
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
              <MoveHistory
                whiteStats={whiteStats}
                blackStats={blackStats}
              />
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/80 via-neutral-700/60 to-neutral-800/80 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative p-4 flex gap-3 flex-wrap sm:flex-nowrap">
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onExit}
              className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neutral-700 to-neutral-600 hover:from-neutral-600 hover:to-neutral-500 transition-all duration-300 text-white font-medium shadow-lg border border-white/10 backdrop-blur-sm"
            >
              <motion.div
                whileHover={{ rotate: -10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Home className="w-5 h-5 text-neutral-300 group-hover:text-white transition-colors" />
              </motion.div>
              <span className="text-neutral-200 group-hover:text-white transition-colors">
                Exit
              </span>
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewGame}
              className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 transition-all duration-300 text-white font-medium shadow-lg shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="relative z-10"
              >
                <Play className="w-5 h-5 text-blue-100 group-hover:text-white transition-colors" />
              </motion.div>
              <span className="relative z-10 text-blue-100 group-hover:text-white transition-colors font-semibold">
                New Game
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameSummary;
