import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTimerTypeStore } from "@/stores/timerTypeStore";
import { type PlayerStats } from "@/stores/statsStore";
import { TrendingUp } from "lucide-react";

const PerformanceInsights = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const { config, getDisplayName } = useTimerTypeStore();

  const getSuddenDeathInsights = () => {
    const whiteTimeUsage = whiteStats.totalTimeUsed;
    const blackTimeUsage = blackStats.totalTimeUsed;
    const initialTime = config.baseMillis / 1000;
    const insights = [];

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

    insights.push({
      type: 'info',
      title: 'Multi-Stage Analysis',
      description: 'Multi-stage time controls require different strategies for each phase. Monitor time usage across stages.',
      icon: '📊'
    });

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

export default PerformanceInsights;
