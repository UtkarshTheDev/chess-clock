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
  Pause,
  RotateCcw,
} from "lucide-react";
import { useTimerTypeStore, TimerMode } from "@/stores/timerTypeStore";
// import ChessTimer from "@/components/ChessTimer";
import { useStatsStore } from "@/stores/statsStore";
import { createCustomConfig } from "@/lib/timerConfigs";
import ChessTimer from "../components/ChessTimer";

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
      title: "Sudden Death",
      mode: "SUDDEN_DEATH" as TimerMode,
      description: "Standard countdown",
      icon: <TimerOff className="w-5 h-5 text-white" />,
      config: (baseMinutes: number) => createCustomConfig("SUDDEN_DEATH", baseMinutes),
    },
    {
      title: "Simple Delay",
      mode: "SIMPLE_DELAY" as TimerMode,
      description: "US Delay: 5s",
      icon: <Pause className="w-5 h-5 text-white" />,
      config: (baseMinutes: number) => createCustomConfig("SIMPLE_DELAY", baseMinutes, { delaySeconds: 5 }),
    },
    {
      title: "Bronstein",
      mode: "BRONSTEIN_DELAY" as TimerMode,
      description: "Bronstein: 3s",
      icon: <RotateCcw className="w-5 h-5 text-white" />,
      config: (baseMinutes: number) => createCustomConfig("BRONSTEIN_DELAY", baseMinutes, { delaySeconds: 3 }),
    },
    {
      title: "Fischer",
      mode: "FISCHER_INCREMENT" as TimerMode,
      description: "Increment: +5s",
      icon: <Hourglass className="w-5 h-5 text-white" />,
      config: (baseMinutes: number) => createCustomConfig("FISCHER_INCREMENT", baseMinutes, { incrementSeconds: 5 }),
    },
    {
      title: "Multi-Stage",
      mode: "MULTI_STAGE" as TimerMode,
      description: "Tournament style",
      icon: <TimerReset className="w-5 h-5 text-white" />,
      config: (baseMinutes: number) => {
        if (baseMinutes >= 60) {
          // Classical tournament format
          return createCustomConfig("MULTI_STAGE", 90, {
            incrementSeconds: 30,
            stages: [{ afterMoves: 40, addMinutes: 30 }]
          });
        } else {
          // Rapid tournament format
          return createCustomConfig("MULTI_STAGE", baseMinutes, {
            incrementSeconds: 10,
            stages: [{ afterMoves: 30, addMinutes: baseMinutes / 2 }]
          });
        }
      },
    },
  ];

  const { initializeTimer, setTimeoutCallback } = useTimerStore();
  const { setConfig } = useTimerTypeStore();
  const [time, setTime] = useState(15);
  const [selectedMode, setSelectedMode] = useState<TimerMode>("SUDDEN_DEATH");
  const [gameState, setGameState] = useState<GameState>("home");

  const setTimer = () => {
    // Get the selected timer type configuration
    const selectedTypeObj = types.find((t) => t.mode === selectedMode);
    if (selectedTypeObj) {
      // Create the configuration
      const config = selectedTypeObj.config(time);

      // Set the configuration in stores
      setConfig(config);
      initializeTimer(config);

      // Set timeout callback for game end handling
      setTimeoutCallback((player: "white" | "black") => {
        // Handle timeout - this will be called when a player runs out of time
        console.log(`${player} ran out of time!`);
        // You can add game end logic here
      });
    }

    // Start the stats tracking
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
        <div className="mt-0 space-y-2 flex flex-col items-center justify-center">
          <Image
            src={"/logo.png"}
            width={72}
            height={72}
            className="w-16"
            alt="ChessTicks - Professional Chess Timer and Tournament Clock Logo"
            priority
          />
          <h1 className="text-lg font-bold text-white tracking-normal font-unbounded">
            Chess Ticks
          </h1>
        </div>

        <div className="mt-4 flex justify-center items-center w-full flex-col space-y-6">
          {/* Duration Section */}
          <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3">
            <h2 className="text-lg font-semibold font-ubuntu">Duration</h2>
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
            <h2 className="text-lg font-semibold font-ubuntu">Timer Modes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full justify-center items-center">
              {types.map((typeItem, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMode(typeItem.mode)}
                  className={`border ${
                    selectedMode === typeItem.mode
                      ? "border-white bg-green-500"
                      : "border-neutral-800 bg-primary"
                  } hover:border-neutral-300 w-full flex flex-col items-center justify-center p-3 hover:bg-green-600 rounded-lg transition-all duration-300 group cursor-pointer`}
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    {typeItem.icon}
                    <span className="text-sm text-white font-bold group-hover:text-white transition-colors duration-300">
                      {typeItem.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      selectedMode === typeItem.mode
                        ? "text-white"
                        : "text-neutral-400"
                    } group-hover:text-white transition-colors duration-300 text-center`}
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
    <>
      {/* Hidden SEO Content */}
      <div className="sr-only">
        <h1>ChessTicks - Professional Chess Timer and Tournament Clock</h1>
        <p>
          Professional chess timer application supporting all five major tournament time control formats:
          Sudden Death, Fischer Increment, Simple Delay, Bronstein Delay, and Multi-Stage timers.
          Perfect for chess players, tournaments, blitz games, rapid games, and classical chess matches.
          Free online chess clock with professional features including gesture controls, audio feedback,
          and comprehensive game statistics. Compatible with FIDE tournament regulations and popular
          online chess platforms like Chess.com and Lichess.
        </p>
        <h2>Supported Chess Timer Modes</h2>
        <ul>
          <li>Sudden Death Timer - Classic countdown format for blitz and rapid games</li>
          <li>Fischer Increment Timer - Adds time after each move, popular on online platforms</li>
          <li>Simple Delay Timer - US Chess Federation standard with delay before countdown</li>
          <li>Bronstein Delay Timer - European standard with time compensation</li>
          <li>Multi-Stage Timer - World Championship and tournament formats with multiple phases</li>
        </ul>
        <h2>Chess Time Controls Supported</h2>
        <ul>
          <li>Bullet Chess (1-3 minutes) - Ultra-fast games with increment</li>
          <li>Blitz Chess (3-5 minutes) - Quick games for casual and competitive play</li>
          <li>Rapid Chess (10-25 minutes) - Standard tournament format</li>
          <li>Classical Chess (60+ minutes) - Long-form tournament and match play</li>
        </ul>
      </div>

      <main
        className="flex flex-col items-center min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-[#121212]"
        role="main"
        aria-label="Chess Timer Application"
      >
        {renderContent()}
      </main>
    </>
  );
}
