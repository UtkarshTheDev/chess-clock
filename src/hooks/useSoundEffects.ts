import useSound from "use-sound";

export const useSoundEffects = () => {
  const [playMove] = useSound("/sounds/move.mp3", { volume: 0.4 });
  const [playCheck] = useSound("/sounds/check.mp3", { volume: 0.5 });
  const [playGameEnd] = useSound("/sounds/end.webm", { volume: 0.6 });
  const [playPhaseChange] = useSound("/sounds/phase.mp3", { volume: 0.4 });
  const [playGameStart] = useSound("/sounds/start.mp3", { volume: 0.5 });

  return {
    playMove,
    playCheck,
    playGameEnd,
    playPhaseChange,
    playGameStart,
  };
};
