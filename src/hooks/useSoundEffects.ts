import useSound from "use-sound";

export const useSoundEffects = () => {
  const [playMove] = useSound("/sounds/move.mp3", { volume: 0.75 });
  const [playCheck] = useSound("/sounds/check.mp3", { volume: 0.9 });
  const [playGameEnd] = useSound("/sounds/end.webm", { volume: 1 });
  const [playPhaseChange] = useSound("/sounds/phase.mp3", { volume: 0.7 });
  const [playGameStart] = useSound("/sounds/start.mp3", { volume: 0.8 });

  return {
    playMove,
    playCheck,
    playGameEnd,
    playPhaseChange,
    playGameStart,
  };
};
