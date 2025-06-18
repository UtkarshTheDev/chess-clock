import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";

export const usePhaseTransition = () => {
  const [currentPhase, setCurrentPhase] = useState<
    "opening" | "middlegame" | "endgame"
  >("opening");
  const moveHistory = useStatsStore((state) => state.moveHistory);
  const totalMoves = moveHistory.length;

  const phaseColors = {
    opening: "bg-blue-500/20", // Light blue background
    middlegame: "bg-yellow-500/20", // Light yellow background
    endgame: "bg-red-500/20", // Light red background
  } as const;

  useEffect(() => {
    if (totalMoves <= 20) setCurrentPhase("opening");
    else if (totalMoves <= 40) setCurrentPhase("middlegame");
    else setCurrentPhase("endgame");
  }, [totalMoves]);

  return {
    currentPhase,
    phaseColor: phaseColors[currentPhase],
  };
};
