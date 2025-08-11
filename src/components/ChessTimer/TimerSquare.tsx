import { motion } from "framer-motion";
import { useState } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { cn } from "@/lib/utils";
import useGestures from "@/hooks/useGestures";
import { ActionButton } from "../ui/ActionButton";
import { Check, Trophy, Handshake } from "lucide-react";
import { formatTime } from "./formatTime";

interface TimerSquareProps {
  player: "white" | "black";
  time: number;
  isActive: boolean;
  isRunning: boolean;
  onSingleTap: (player: "white" | "black") => void;
  onTwoFingerTap: (player: "white" | "black") => void;
  onLongPress: (player: "white" | "black") => void;
  onCheck: () => void;
  onCheckmate: () => void;
  onDraw: () => void;
}

export const TimerSquare = ({
  player,
  time,
  isActive,
  isRunning,
  onSingleTap,
  onTwoFingerTap,
  onLongPress,
  onCheck,
  onCheckmate,
  onDraw,
}: TimerSquareProps) => {
  const { initialTime, whiteDisplayInfo, blackDisplayInfo } = useTimerStore();
  const displayInfo = player === "white" ? whiteDisplayInfo : blackDisplayInfo;
  const [isGestureActive, setIsGestureActive] = useState(false);

  const getTimeBasedBackground = () => {
    const timePercentage = (time / initialTime) * 100;
    if (timePercentage <= 10) return "bg-gradient-to-br from-red-500 to-red-700 text-white";
    if (timePercentage <= 50) return "bg-gradient-to-br from-amber-400 to-yellow-600 text-black";
    if (timePercentage >= 90) return "bg-gradient-to-br from-emerald-400 to-green-600 text-white";
    if (player === "white") return "bg-gradient-to-br from-gray-100 to-white text-black";
    return "bg-gradient-to-br from-gray-900 to-black text-white";
  };

  const getPlayerBackground = () => {
    if (player === "white") return "bg-white text-black";
    return "bg-gradient-to-br from-gray-900 to-black text-white";
  };

  const getTimeBasedBorderColor = () => {
    const timePercentage = (time / initialTime) * 100;
    if (timePercentage <= 10) return "border-red-500";
    if (timePercentage <= 50) return "border-yellow-400";
    if (timePercentage >= 90) return "border-green-400";
    return player === "white" ? "border-gray-400" : "border-gray-600";
  };

  const getBorderColor = () => {
    if (!isRunning) return player === "white" ? "border-gray-400" : "border-gray-600";
    if (isActive) return player === "white" ? "border-white" : "border-gray-300";
    return getTimeBasedBorderColor();
  };

  const getBackground = () => {
    if (!isRunning) return getPlayerBackground();
    if (isActive) return getTimeBasedBackground();
    return getPlayerBackground();
  };

  const gestureHandlers = useGestures({
    onSingleTap: (event: React.MouseEvent | React.TouchEvent) => {
      if (event && event.target) {
        const target = event.target as HTMLElement;
        const isActionButton = target.closest('[data-action-button]') || target.closest('.action-button-container');
        if (isActionButton) return;
      }
      onSingleTap(player);
    },
    onTwoFingerTap: () => onTwoFingerTap(player),
    onLongPress: () => onLongPress(player),
    onGestureStart: () => {
      if (isActive && isRunning) setIsGestureActive(true);
    },
    onGestureEnd: () => setIsGestureActive(false),
  });

  return (
    <motion.div
      {...gestureHandlers}
      className={cn(
        "w-full max-w-[98%] md:max-h-[60vh] h-full",
        "relative cursor-pointer rounded-2xl",
        "transition-all duration-300",
        getBackground(),
        isActive && "scale-105 z-10",
        isGestureActive && isActive && "scale-110 shadow-2xl",
        isActive ? "border-4" : "border-2",
        getBorderColor(),
        isActive ? (player === "black" ? "ring-1 ring-gray-300/30" : "") : "",
        !isActive && player === "white" ? "ring-1 ring-gray-400/50" : "",
        isGestureActive && isActive ? "shadow-2xl" : "shadow-lg",
        "backdrop-blur-sm",
        "sm:max-w-[90%] md:max-w-[90%] max-h-[45vh]"
      )}
    >
      <div className="flex flex-col items-center justify-center h-full pb-16 sm:pb-20">
        {displayInfo && (displayInfo.delayTime !== undefined || displayInfo.pendingIncrement !== undefined || displayInfo.stageInfo) && (
          <div className="mb-2 text-center">
            {displayInfo.isInDelay && displayInfo.delayTime !== undefined && (
              <div className={cn("text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border", player === "white" ? "text-yellow-800 bg-yellow-100/95 border-yellow-300" : "text-yellow-200 bg-yellow-900/90 border-yellow-600")}>
                Delay: {Math.ceil(displayInfo.delayTime)}s
              </div>
            )}
            {displayInfo.pendingIncrement !== undefined && displayInfo.pendingIncrement > 0 && (
              <div className={cn("text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border mt-1", player === "white" ? "text-green-800 bg-green-100/95 border-green-300" : "text-green-200 bg-green-900/90 border-green-600")}>
                +{displayInfo.pendingIncrement}s after move
              </div>
            )}
            {displayInfo.stageInfo && (
              <div className={cn("text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border mt-1", player === "white" ? "text-blue-800 bg-blue-100/95 border-blue-300" : "text-blue-200 bg-blue-900/90 border-blue-600")}>
                {displayInfo.stageInfo}
              </div>
            )}
          </div>
        )}
        <span className="font-unbounded text-8xl mt-12 sm:text-[7.5rem] lg:text-[9rem] font-bold leading-none select-none">
          {formatTime(time)}
        </span>
      </div>
      <motion.div
        className={cn(
          "absolute inset-x-0 bottom-4 w-fit mx-auto z-20 action-button-container",
          "flex flex-nowrap items-center",
          "gap-2 sm:gap-3 px-2.5 py-2 sm:px-3 sm:py-2.5",
          "rounded-2xl border",
          "max-w-[calc(100%-16px)]",
          isRunning && isActive && (player === "white" ? "bg-neutral-900/70 border-black/30 ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl" : "bg-white/15 border-white/25 ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"),
          isRunning && !isActive && (player === "white" ? "bg-gradient-to-tr from-neutral-950/80 to-neutral-800/60 border-neutral-900/40 ring-1 ring-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl" : "bg-white/10 border-white/15 shadow-xl backdrop-blur-md"),
          !isRunning && (player === "white" ? "bg-gradient-to-tr from-neutral-950/70 to-neutral-800/50 border-neutral-900/30 ring-1 ring-white/10 shadow-lg backdrop-blur-md" : "bg-white/8 border-white/10 shadow-lg backdrop-blur-sm")
        )}
        initial={false}
        animate={{
          opacity: isRunning ? (isActive ? 1 : 0.9) : 0.85,
          scale: isRunning ? (isActive ? 1 : 0.99) : 0.99,
          y: isRunning ? (isActive ? 0 : 2) : 2,
          filter: isRunning ? "saturate(1)" : "saturate(0.95)",
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        data-action-button-container="true"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ActionButton variant="check" onClick={(e) => { e?.preventDefault(); e?.stopPropagation(); if (isActive && isRunning) onCheck(); }} disabled={!isActive || !isRunning} icon={<Check className="w-5 h-5" />} label="Check" />
        <ActionButton variant="checkmate" onClick={(e) => { e?.preventDefault(); e?.stopPropagation(); if (isActive && isRunning) onCheckmate(); }} disabled={!isActive || !isRunning} icon={<Trophy className="w-5 h-5" />} label="Mate" />
        <ActionButton variant="draw" onClick={(e) => { e?.preventDefault(); e?.stopPropagation(); if (isActive && isRunning) onDraw(); }} disabled={!isActive || !isRunning} icon={<Handshake className="w-5 h-5" />} label="Draw" />
      </motion.div>
    </motion.div>
  );
};
