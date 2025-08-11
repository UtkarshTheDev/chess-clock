import { TimerMode } from "@/stores/timerTypeStore";
import { TimerOff, Pause, RotateCcw, Hourglass, TimerReset } from "lucide-react";
import { createCustomConfig } from "@/lib/timerConfigs";

export const types = [
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

interface TimerModeSelectorProps {
  selectedMode: TimerMode;
  onModeSelect: (mode: TimerMode) => void;
}

const TimerModeSelector: React.FC<TimerModeSelectorProps> = ({ selectedMode, onModeSelect }) => (
  <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3 border-t border-neutral-500">
    <h2 className="text-lg font-semibold font-ubuntu">Timer Modes</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full justify-center items-center">
      {types.map((typeItem, index) => (
        <button
          key={index}
          onClick={() => onModeSelect(typeItem.mode)}
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
);

export default TimerModeSelector;
