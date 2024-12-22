import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";

export const usePhaseTransition = () => {
  const [currentPhase, setCurrentPhase] = useState<
    "opening" | "middleGame" | "endGame"
  >("opening");
  const moveHistory = useStatsStore((state) => state.moveHistory);
  const totalMoves = moveHistory.length;

  const phaseColors = {
    opening: "#4F46E5", // Indigo
    middleGame: "#0EA5E9", // Sky Blue
    endGame: "#A855F7", // Purple
  } as const;

  useEffect(() => {
    if (totalMoves <= 20) setCurrentPhase("opening");
    else if (totalMoves <= 40) setCurrentPhase("middleGame");
    else setCurrentPhase("endGame");
  }, [totalMoves]);

  return {
    currentPhase,
    phaseColor: phaseColors[currentPhase],
  };
};
