"use client";

import { useTimerStore } from "@/stores/timerStore";
import { useState } from "react";
import { useTimerTypeStore, TimerMode } from "@/stores/timerTypeStore";
import { ChessTimer } from "@/components/ChessTimer";
import { useStatsStore } from "@/stores/statsStore";
import Silk from "@/Backgrounds/Silk/Silk";
import Header from "@/components/HomePage/Header";
import DurationSelector from "@/components/HomePage/DurationSelector";
import TimerModeSelector, {
  types,
} from "@/components/HomePage/TimerModeSelector";
import StartGameButton from "@/components/HomePage/StartGameButton";
import SeoContent from "@/components/HomePage/SeoContent";

type GameState = "home" | "playing";

export default function Home() {
  const { initializeTimer, setTimeoutCallback } = useTimerStore();
  const { setConfig } = useTimerTypeStore();
  const [time, setTime] = useState(15);
  const [selectedMode, setSelectedMode] = useState<TimerMode>("SUDDEN_DEATH");
  const [gameState, setGameState] = useState<GameState>("home");

  const setTimer = () => {
    const selectedTypeObj = types.find((t) => t.mode === selectedMode);
    if (selectedTypeObj) {
      const config = selectedTypeObj.config(time);
      setConfig(config);
      initializeTimer(config);
      setTimeoutCallback((player: "white" | "black") => {
        console.log(`${player} ran out of time!`);
      });
    }
    useStatsStore.getState().startGame();
  };

  const startGame = async () => {
    try {
      setTimer();
      setGameState("playing");
    } catch (err) {
      console.error(err);
    }
  };

  const resetGame = () => {
    setGameState("home");
    setTime(15);
    setSelectedMode("SUDDEN_DEATH");
    useTimerStore.getState().resetTimer();
  };

  const renderContent = () => {
    if (gameState === "playing") {
      return <ChessTimer onReset={resetGame} />;
    }

    return (
      <>
        <Header />
        <div className="mt-4 flex justify-center items-center w-full flex-col space-y-6">
          <DurationSelector selectedTime={time} onTimeSelect={setTime} />
          <TimerModeSelector
            selectedMode={selectedMode}
            onModeSelect={setSelectedMode}
          />
        </div>
        <StartGameButton onClick={startGame} />
      </>
    );
  };

  return (
    <>
      <SeoContent />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Silk
          speed={12}
          scale={1}
          color="#242424"
          noiseIntensity={3}
          rotation={6}
        />
      </div>
      <main
        className="flex flex-col items-center min-h-screen px-4 py-6 sm:px-6 lg:px-8"
        role="main"
        aria-label="Chess Timer Application"
      >
        {renderContent()}
      </main>
    </>
  );
}
