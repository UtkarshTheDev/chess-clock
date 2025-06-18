import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useTimerStore } from "../stores/timerStore";
import { useStatsStore } from "@/stores/statsStore";
import {
  Check,
  Trophy,
  RefreshCcw,
  Play,
  Pause,
  HelpCircle,
  Handshake,
} from "lucide-react";
import GameSummary from "@/components/GameSummary";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { vibrate } from "@/utils/haptics";
import useDoubleTap from "@/hooks/useDoubleTap";
import useLongPress from "@/hooks/useLongPress";
import { cn } from "@/lib/utils";
import { usePhaseTransition } from "@/hooks/usePhaseTransition";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { GestureHelpDialog } from "./GestureHelpDialog";
import { ActionButton } from "./ui/ActionButton";

interface ControlButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  icon,
  label,
  className,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg",
        "backdrop-blur-md shadow-lg",
        "transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "text-white",
        "bg-neutral-800/50 hover:bg-neutral-700/50",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      {label && <span className="text-sm font-medium">{label}</span>}
    </motion.button>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const getTimeBasedColor = (
  timeRemaining: number,
  initialTime: number,
  player: "white" | "black"
) => {
  const timePercentage = (timeRemaining / initialTime) * 100;

  if (timePercentage <= 10) {
    return "bg-gradient-to-br from-red-600/90 to-red-700/90 text-white";
  } else if (timePercentage <= 50) {
    return "bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 text-black";
  } else if (timePercentage >= 90) {
    return "bg-gradient-to-br from-green-500/90 to-green-600/90 text-white";
  }
  return player === "white" ? "bg-white text-black" : "bg-black text-white";
};

interface ChessTimerProps {
  onReset?: () => void;
}

interface ConfirmationState {
  isOpen: boolean;
  type: "checkmate" | "draw" | null;
  player: "white" | "black" | null;
}

const ConfirmationModal = ({
  type,
  onConfirm,
  onCancel,
}: {
  type: "checkmate" | "draw";
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const content = {
    checkmate: {
      title: "Confirm Checkmate",
      description:
        "Are you sure you want to declare checkmate? This will end the game.",
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      confirmText: "Checkmate",
      confirmClass: "bg-gradient-to-r from-yellow-600 to-yellow-500",
    },
    draw: {
      title: "Confirm Draw",
      description:
        "Are you sure you want to declare a draw? This will end the game.",
      icon: <Handshake className="w-8 h-8 text-blue-500" />,
      confirmText: "Draw",
      confirmClass: "bg-gradient-to-r from-blue-600 to-blue-500",
    },
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal content */}
        <motion.div
          className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
          <div className="flex items-center gap-4 mb-4">
            {content.icon}
            <h2 className="text-xl font-bold text-white">{content.title}</h2>
          </div>
          <p className="text-neutral-300 mb-6">{content.description}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "px-4 py-2 rounded-lg text-white font-medium transition-all",
                "hover:shadow-lg hover:scale-105",
                content.confirmClass
              )}
            >
              {content.confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const ChessTimer = ({ onReset }: ChessTimerProps) => {
  const {
    whiteTimeRemaining,
    blackTimeRemaining,
    isRunning,
    activePlayer,
    initializeTime,
    switchActivePlayer,
    pauseTimer,
    resumeTimer,
    initialTime,
  } = useTimerStore();

  const [showSummary, setShowSummary] = useState(false);
  const [showGestureHelp, setShowGestureHelp] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(
    {
      isOpen: false,
      type: null,
      player: null,
    }
  );

  const { playMove, playCheck, playGameEnd, playGameStart } = useSoundEffects();
  const { currentPhase, phaseColor } = usePhaseTransition();

  const handleGameEnd = useCallback(
    (reason: "check" | "checkmate" | "draw" | "timeout") => {
      if (!activePlayer) return;

      pauseTimer();
      const winner =
        reason === "timeout"
          ? activePlayer === "white"
            ? "black"
            : "white"
          : activePlayer;

      useStatsStore
        .getState()
        .recordMove(
          winner,
          0,
          reason === "checkmate" ? "checkmate" : "normal",
          winner === "white" ? whiteTimeRemaining : blackTimeRemaining
        );

      if (reason === "draw") {
        useStatsStore.getState().setGameSummary("draw", "by agreement");
      } else if (reason === "timeout") {
        useStatsStore.getState().setGameSummary(winner, "timeout");
      } else {
        useStatsStore.getState().setGameSummary(winner, reason);
      }

      setTimeout(() => {
        setShowSummary(true);
        playGameEnd();
        vibrate([200, 100, 200]);
      }, 100);
    },
    [
      activePlayer,
      pauseTimer,
      whiteTimeRemaining,
      blackTimeRemaining,
      playGameEnd,
    ]
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
    initializeTime(initialTime / 60);
    setShowSummary(false);
    playGameStart();
    useStatsStore.getState().resetStats();
  }, [onReset, initializeTime, playGameStart, initialTime]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && activePlayer) {
      interval = setInterval(() => {
        if (activePlayer === "white") {
          if (whiteTimeRemaining <= 0) {
            handleGameEnd("timeout");
            return;
          }
          useTimerStore.getState().decrementWhiteTime();
        } else {
          if (blackTimeRemaining <= 0) {
            handleGameEnd("timeout");
            return;
          }
          useTimerStore.getState().decrementBlackTime();
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isRunning,
    activePlayer,
    whiteTimeRemaining,
    blackTimeRemaining,
    handleGameEnd,
  ]);

  const handlePlayerMove = useCallback(() => {
    if (activePlayer && isRunning) {
      // Get the actual move time from the timerStore
      const lastMoveTime = useTimerStore.getState().lastMoveStartTime;
      const moveTime = lastMoveTime
        ? (Date.now() - lastMoveTime) / 1000
        : 0;
        
      playMove();
      switchActivePlayer();
      useStatsStore
        .getState()
        .recordMove(
          activePlayer,
          moveTime,
          "normal",
          activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
        );
    }
  }, [
    activePlayer,
    isRunning,
    playMove,
    switchActivePlayer,
    whiteTimeRemaining,
    blackTimeRemaining,
  ]);

  const handleCheck = useCallback(() => {
    if (activePlayer && isRunning) {
      // Get the actual move time from the timerStore
      const lastMoveTime = useTimerStore.getState().lastMoveStartTime;
      const moveTime = lastMoveTime
        ? (Date.now() - lastMoveTime) / 1000
        : 0;
        
      playCheck();
      vibrate([100]);
      switchActivePlayer();
      
      // Record the check move with actual time
      useStatsStore
        .getState()
        .recordMove(
          activePlayer,
          moveTime,
          "check",
          activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
        );
    }
  }, [
    activePlayer,
    isRunning,
    playCheck,
    switchActivePlayer,
    whiteTimeRemaining,
    blackTimeRemaining,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) {
        return;
      }

      type KeyActions = {
        [key: string]: () => void;
      };

      const actions: KeyActions = {
        Space: () => handlePlayerMove(),
        Enter: () => handleCheck(),
        Tab: () => {
          e.preventDefault();
          pauseTimer();
          setConfirmationState({
            isOpen: true,
            type: "checkmate",
            player: activePlayer,
          });
        },
        KeyP: () => {
          if (isRunning) {
            pauseTimer();
          } else {
            resumeTimer();
          }
        },
      };

      const action = actions[e.code as keyof typeof actions];
      if (action) {
        action();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isRunning,
    handlePlayerMove,
    handleCheck,
    pauseTimer,
    resumeTimer,
    activePlayer,
  ]);

  const getPhaseBasedStyle = useCallback(() => {
    switch (currentPhase) {
      case "opening":
        return "border-blue-500";
      case "middlegame":
        return "border-yellow-500";
      case "endgame":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  }, [currentPhase]);

  // Handle double tap for check
  const onDoubleTap = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer) {
        handleCheck();
      }
    },
    [activePlayer, handleCheck]
  );

  // Handle long press for checkmate
  const onLongPress = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer) {
        setConfirmationState({
          isOpen: true,
          type: "checkmate",
          player,
        });
        vibrate([200]);
      }
    },
    [activePlayer]
  );

  const TimerSquare = ({
    player,
    time,
    isActive,
  }: {
    player: "white" | "black";
    time: number;
    isActive: boolean;
  }) => {
    return (
      <motion.div
        {...useDoubleTap(() => onDoubleTap(player))}
        {...useLongPress(() => onLongPress(player), 500)}
        className={cn(
          "w-full max-w-[98%] md:max-h-[60vh] h-full",
          "relative cursor-pointer rounded-2xl",
          "transition-all duration-300",
          getTimeBasedColor(time, initialTime, player),
          isActive && "scale-105 ring-2 ring-white/50",
          isActive && "border-4",
          isActive && phaseColor,
          !isActive && "border-2 border-neutral-700",
          "shadow-lg backdrop-blur-sm",
          "sm:max-w-[90%] md:max-w-[90%] max-h-[45vh]"
        )}
      >
        <div className="flex items-center justify-center h-full">
          <span className="font-sourGummy text-8xl lg:text-9xl font-bold">
            {formatTime(time)}
          </span>
        </div>

        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4"
          initial={false}
        >
          <ActionButton
            variant="check"
            onClick={() => isActive && handleCheck()}
            disabled={!isActive}
            icon={<Check className="w-5 h-5" />}
            label="Check"
          />
          <ActionButton
            variant="checkmate"
            onClick={() =>
              isActive &&
              setConfirmationState({
                isOpen: true,
                type: "checkmate",
                player,
              })
            }
            disabled={!isActive}
            icon={<Trophy className="w-5 h-5" />}
            label="Checkmate"
          />
          <ActionButton
            variant="draw"
            onClick={() =>
              isActive &&
              setConfirmationState({
                isOpen: true,
                type: "draw",
                player,
              })
            }
            disabled={!isActive}
            icon={<Handshake className="w-5 h-5" />}
            label="Draw"
          />
        </motion.div>
      </motion.div>
    );
  };

  const DesktopControls = () => (
    <div className="hidden md:flex absolute top-6 left-1/2 -translate-x-1/2 gap-8">
      <ControlButton
        onClick={handleReset}
        icon={<RefreshCcw />}
        label="Reset"
      />
      <ControlButton
        onClick={isRunning ? pauseTimer : resumeTimer}
        icon={isRunning ? <Pause /> : <Play />}
        label={isRunning ? "Pause" : "Play"}
      />
    </div>
  );

  const MobileControls = () => (
    <div className="md:hidden flex items-center gap-4 my-4 mb-6 justify-center">
      <ControlButton
        onClick={isRunning ? pauseTimer : resumeTimer}
        icon={isRunning ? <Pause /> : <Play />}
      />
      <ControlButton
        onClick={() => setShowGestureHelp(true)}
        icon={<HelpCircle />}
      />
      <ControlButton onClick={handleReset} icon={<RefreshCcw />} />
    </div>
  );

  return (
    <motion.div className="h-full w-full md:h-[93vh]">
      <div className="relative h-full flex flex-col">
        <div className="md:flex max-md:flex-col h-full w-full">
          {/* Black Timer */}
          <div
            className={cn(
              "flex-1 md:flex-row flex items-center justify-center",
              "cursor-pointer select-none md:h-full h-[40vh]",
              activePlayer === "black" ? `opacity-100 ${getPhaseBasedStyle()}` : "opacity-50",

            )}
          >
            <TimerSquare
              player="black"
              time={blackTimeRemaining}
              isActive={activePlayer === "black"}
            />
          </div>

          <DesktopControls />
          <MobileControls />

          {/* White Timer */}
          <div
            className={cn(
              "flex-1 md:flex-row flex items-center justify-center",
              "cursor-pointer select-none md:h-full h-[40vh]",
              activePlayer === "white" ?  `opacity- 100 ${getPhaseBasedStyle()}` : "opacity-50",

            )}
          >
            <TimerSquare
              player="white"
              time={whiteTimeRemaining}
              isActive={activePlayer === "white"}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2">
          <KeyboardShortcuts />
        </div>

        {/* Modals and Dialogs */}
        {showGestureHelp && (
          <GestureHelpDialog
            isOpen={showGestureHelp}
            onClose={() => setShowGestureHelp(false)}
          />
        )}

        {confirmationState.isOpen && confirmationState.type && (
          <ConfirmationModal
            type={confirmationState.type}
            onConfirm={() => {
              if (confirmationState.type === "checkmate") {
                handleGameEnd("checkmate");
              } else if (confirmationState.type === "draw") {
                handleGameEnd("draw");
              }
              setConfirmationState({
                isOpen: false,
                type: null,
                player: null,
              });
            }}
            onCancel={() =>
              setConfirmationState({
                isOpen: false,
                type: null,
                player: null,
              })
            }
          />
        )}

        {showSummary && (
          <GameSummary
            onNewGame={() => {
              if (onReset) onReset();
              initializeTime(initialTime / 60);
              setShowSummary(false);
              playGameStart();
              useStatsStore.getState().resetStats();
            }}
            onExit={() => setShowSummary(false)}
          />
        )}
      </div>
    </motion.div>
  );
};
