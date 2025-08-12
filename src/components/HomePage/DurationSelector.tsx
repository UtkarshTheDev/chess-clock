import { Zap, Clock, Timer } from "lucide-react";

interface Duration {
  title: string;
  time: string;
  duration: number;
  icon: React.ReactNode;
}

const durations: Duration[] = [
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

interface DurationSelectorProps {
  selectedTime: number;
  onTimeSelect: (duration: number) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ selectedTime, onTimeSelect }) => (
  <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3">
    <h2 className="text-lg font-semibold font-ubuntu">Duration</h2>
    <div className="grid grid-cols-3 gap-4 w-full justify-center items-center">
      {durations.map((duration, index) => (
        <button
          key={index}
          onClick={() => onTimeSelect(duration.duration)}
          className={`cursor-target border ${
            selectedTime === duration.duration
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
              selectedTime === duration.duration
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
);

export default DurationSelector;
