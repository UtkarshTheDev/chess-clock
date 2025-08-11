import { type PlayerStats } from "@/stores/statsStore";

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

export default PhaseStats;
