"use client";

import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timerStore";
import Image from "next/image";
import { useState } from "react";
import {
  Clock,
  Timer,
  Zap,
  TimerOff,
  Hourglass,
  TimerReset,
  PlayIcon,
} from "lucide-react";
import { useTimerTypeStore, TimerType } from "@/stores/timerTypeStore";
import { ChessTimer } from "@/components/ChessTimer";

type GameState = "home" | "playing";

export default function Home() {
  const durations = [
    {
      title: "Blitz",
      time: "5 mins",
      duration: 5,
      icon: <Zap className="w-5 h-5 text-white" />,
    },
    {
      title: "Rapid",
      time: "15 mins",
      duration: 15,
      icon: <Clock className="w-5 h-5 text-white" />,
    },
    {
      title: "Classical",
      time: "60 mins",
      duration: 60,
      icon: <Timer className="w-5 h-5 text-white" />,
    },
  ];

  const types = [
    {
      title: "Fischer",
      type: "fischer" as TimerType,
      increment: 5,
      description: "Increment: +5 sec",
      icon: <Hourglass className="w-5 h-5 text-white" />,
    },
    {
      title: "Normal",
      type: "normal" as TimerType,
      increment: 0,
      description: "Standard",
      icon: <TimerOff className="w-5 h-5 text-white" />,
    },
    {
      title: "Bronstein",
      type: "bronstein" as TimerType,
      increment: 3,
      description: "Delay: +3 sec",
      icon: <TimerReset className="w-5 h-5 text-white" />,
    },
  ];

  const { initializeTime } = useTimerStore();
  const { setTimerType, setIncrement } = useTimerTypeStore();
  const [time, setTime] = useState(15);
  const [selectedType, setSelectedType] = useState<TimerType>("normal");
  const [gameState, setGameState] = useState<GameState>("home");

  const setTimer = () => {
    initializeTime(time);
    const selectedTypeObj = types.find((t) => t.type === selectedType);
    if (selectedTypeObj) {
      setTimerType(selectedTypeObj.type);
      setIncrement(selectedTypeObj.increment);
    }
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
    setSelectedType("normal");
    useTimerStore.getState().resetTimer();
  };

  const renderContent = () => {
    if (gameState === "playing") {
      return <ChessTimer onReset={resetGame} />;
    }

    return (
      <>
        <div className="mt-0 space-y-2 flex flex-col items-center justify-center">
          <Image
            src={"/logo.png"}
            width={72}
            height={72}
            className="w-16"
            alt="logo"
          />
          <h2 className="text-lg font-bold text-white tracking-tighter font-unbounded">
            Chess Clock
          </h2>
        </div>

        <div className="mt-4 flex justify-center items-center w-full flex-col space-y-6">
          {/* Duration Section */}
          <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3">
            <h2 className="text-lg font-bold font-ubuntu">Duration</h2>
            <div className="grid grid-cols-3 gap-4 w-full justify-center items-center">
              {durations.map((duration, index) => (
                <button
                  key={index}
                  onClick={() => setTime(duration.duration)}
                  className={`border ${
                    time === duration.duration
                      ? "border-white bg-green-500"
                      : "border-neutral-800 bg-primary"
                  } hover:border-neutral-300 w-full flex flex-col items-center justify-center p-4  hover:bg-green-600 rounded-lg transition-all duration-300 group cursor-pointer`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {duration.icon}
                    <span className="text-lg text-white font-bold group-hover:text-white transition-colors duration-300">
                      {duration.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs text-neutral-400 ${
                      time === duration.duration
                        ? "text-white"
                        : "text-neutral-400"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    {duration.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Section */}
          <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3 border-t border-neutral-500">
            <h2 className="text-lg font-bold font-ubuntu">Type</h2>
            <div className="grid grid-cols-3 gap-4 w-full justify-center items-center">
              {types.map((typeItem, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedType(typeItem.type)}
                  className={`border ${
                    selectedType === typeItem.type
                      ? "border-white bg-green-500"
                      : "border-neutral-800 bg-primary"
                  } hover:border-neutral-300 w-full flex flex-col items-center justify-center p-4 hover:bg-green-600 rounded-lg transition-all duration-300 group cursor-pointer`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {typeItem.icon}
                    <span className="text-lg text-white font-bold group-hover:text-white transition-colors duration-300">
                      {typeItem.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      selectedType === typeItem.type
                        ? "text-white"
                        : "text-neutral-400"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    {typeItem.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center items-center w-full fixed bottom-4 left-0 right-0 px-8">
          <Button
            className="w-full mb-4 font-unbounded text-xl font-bold text-white bg-green-500 border border-neutral-300  hover:border-white hover:bg-green-600 transition-all duration-300 rounded-lg flex items-center justify-center py-6 "
            onClick={startGame}
          >
            <PlayIcon width={24} height={24} /> Start Now
          </Button>
        </div>
      </>
    );
  };

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-[#121212]">
      {renderContent()}
    </main>
  );
}
