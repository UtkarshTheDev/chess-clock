import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";

export const usePhaseTransition = () => {
  const [currentPhase, setCurrentPhase] = useState<
    "opening" | "middlegame" | "endgame"
  >("opening");
  const moveHistory = useStatsStore((state) => state.moveHistory);
  const totalMoves = moveHistory.length;

  const phaseColors = {
    opening: "#4F46E5", // Indigo
    middlegame: "#0EA5E9", // Sky Blue
    endgame: "#A855F7", // Purple
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
