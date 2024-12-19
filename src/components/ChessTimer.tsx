import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
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
  X,
} from "lucide-react";
import GameSummary from "@/components/GameSummary";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { vibrate } from "@/utils/haptics";
import useDoubleTap from "@/hooks/useDoubleTap";
import useLongPress from "@/hooks/useLongPress";
import { cn } from "@/lib/utils";
import type { GameEndReason } from "@/types/chess";
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
    return "bg-gradient-to-br from-red-600/90 to-red-700/90";
  } else if (timePercentage <= 50) {
    return "bg-gradient-to-br from-yellow-500/90 to-yellow-600/90";
  } else if (timePercentage >= 90) {
    return "bg-gradient-to-br from-green-500/90 to-green-600/90";
  }
  return player === "white" ? "bg-white" : "bg-black";
};

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

interface ChessTimerProps {
  onReset: () => void;
}

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
  const initialTime = 15 * 60; // 15 minutes
  const { playMove, playCheck, playGameEnd, playGameStart } = useSoundEffects();
  const { currentPhase, phaseColor } = usePhaseTransition();

  // Add timer interval
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
  }, [isRunning, activePlayer, whiteTimeRemaining, blackTimeRemaining]);

  // Desktop Controls
  const DesktopControls = () => (
    <div className="hidden md:flex absolute top-6 left-1/2 -translate-x-1/2 gap-8">
      <ControlButton
        onClick={() => initializeTime(15)}
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

  // Mobile Controls
  const MobileControls = () => (
    <div className="md:hidden flex items-center gap-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <ControlButton
        onClick={isRunning ? pauseTimer : resumeTimer}
        icon={isRunning ? <Pause /> : <Play />}
      />
      <ControlButton
        onClick={() => setShowGestureHelp(true)}
        icon={<HelpCircle />}
      />
      <ControlButton onClick={() => initializeTime(15)} icon={<RefreshCcw />} />
    </div>
  );

  // Timer Square Component
  const TimerSquare = ({
    player,
    time,
  }: {
    player: "white" | "black";
    time: number;
  }) => {
    const isActive = activePlayer === player;
    const timeBasedColor = getTimeBasedColor(time, initialTime, player);

    return (
      <motion.div
        className={cn(
          "w-full max-w-[40%] max-h-[60vh] h-full",
          "relative cursor-pointer rounded-2xl",
          "transition-all duration-300",
          !isActive && (player === "white" ? "bg-white" : "bg-black"),
          isActive && timeBasedColor,
          isActive && "border-4",
          isActive && phaseColor,
          !isActive && "border-2 border-neutral-700",
          "shadow-lg backdrop-blur-sm",
          "sm:max-w-[45%] md:max-w-[40%]"
        )}
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-sourGummy text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold",
              player === "white" ? "text-black" : "text-white",
              isActive && player === "white" && "text-white",
              isActive && player === "black" && "text-black"
            )}
          >
            {formatTime(time)}
          </span>
        </div>

        <motion.div
          className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4"
          initial={false}
        >
          <ActionButton
            variant="check"
            onClick={() => isActive && handleCheck()}
            disabled={!isActive}
            icon={<Check className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Check"
          />
          <ActionButton
            variant="checkmate"
            onClick={() =>
              isActive &&
              setConfirmationState({
                isOpen: true,
                type: "checkmate",
                player: activePlayer,
              })
            }
            disabled={!isActive}
            icon={<Trophy className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Checkmate"
          />
          <ActionButton
            variant="draw"
            onClick={() =>
              isActive &&
              setConfirmationState({
                isOpen: true,
                type: "draw",
                player: activePlayer,
              })
            }
            disabled={!isActive}
            icon={<Handshake className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Draw"
          />
        </motion.div>
      </motion.div>
    );
  };

  // Game logic handlers
  const handlePlayerMove = () => {
    if (activePlayer && isRunning) {
      playMove();
      switchActivePlayer();
      useStatsStore
        .getState()
        .recordMove(
          activePlayer,
          0,
          "normal",
          activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
        );
    }
  };

  const handleCheck = () => {
    if (!activePlayer || !isRunning) return;

    playCheck();
    vibrate([100, 50, 100]);

    const timeRemaining =
      activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining;

    useStatsStore
      .getState()
      .recordMove(activePlayer, 0, "check", timeRemaining);

    // Switch active player after recording check
    switchActivePlayer();
  };

  const handleCheckmate = () => {
    if (!activePlayer || !isRunning) return;

    pauseTimer();
    const timeRemaining =
      activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining;

    // Record the final move
    useStatsStore
      .getState()
      .recordMove(activePlayer, 0, "checkmate", timeRemaining);

    // End the game and set the game summary
    useStatsStore.getState().setGameSummary(activePlayer, "checkmate");

    // Show the game summary after a short delay to ensure stats are updated
    setTimeout(() => {
      setShowSummary(true);
      playGameEnd();
      vibrate([200, 100, 200]);
    }, 100);
  };

  const handleDraw = () => {
    if (!activePlayer || !isRunning) return;

    pauseTimer();

    // End the game and set the game summary
    useStatsStore.getState().setGameSummary("draw", "by agreement");

    // Show the game summary after a short delay to ensure stats are updated
    setTimeout(() => {
      setShowSummary(true);
      playGameEnd();
      vibrate([200, 100, 200]);
    }, 100);
  };

  const handleGameEnd = (
    reason: "check" | "checkmate" | "draw" | "timeout"
  ) => {
    if (!activePlayer) return;

    pauseTimer();

    const winner =
      reason === "timeout"
        ? activePlayer === "white"
          ? "black"
          : "white"
        : activePlayer;

    // Record the final move with the game-ending move type
    useStatsStore
      .getState()
      .recordMove(
        winner,
        0,
        "normal",
        winner === "white" ? whiteTimeRemaining : blackTimeRemaining
      );

    // Set game summary
    if (reason === "draw") {
      useStatsStore.getState().setGameSummary("draw", "by agreement");
    } else if (reason === "timeout") {
      useStatsStore.getState().setGameSummary(winner, "timeout");
    } else {
      useStatsStore.getState().setGameSummary(winner, reason);
    }

    // Show the game summary after a short delay to ensure stats are updated
    setTimeout(() => {
      setShowSummary(true);
      playGameEnd();
      vibrate([200, 100, 200]);
    }, 100);
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      if (confirmationState.type === "checkmate") {
        handleCheckmate();
      } else if (confirmationState.type === "draw") {
        handleDraw();
      }
    }
    setConfirmationState({ isOpen: false, type: null, player: null });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") handlePlayerMove();
      if (e.code === "Enter") handleCheck();
      if (e.code === "Tab") {
        e.preventDefault();
        handleCheckmate();
      }
      if (e.code === "KeyP") {
        isRunning ? pauseTimer() : resumeTimer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, activePlayer]);

  return (
    <motion.div className="max-sm:h-full w-full h-[93vh]  relative overflow-hidden">
      <DesktopControls />

      <div className="flex h-full items-center justify-center lg:gap-20 gap-12 max-sm:gap-y-16 max-lg:flex-col">
        <TimerSquare player="black" time={blackTimeRemaining} />
        <MobileControls />
        <TimerSquare player="white" time={whiteTimeRemaining} />
      </div>

      {/* Desktop Keyboard Shortcuts */}
      <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2">
        <KeyboardShortcuts />
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <GameSummary
                onNewGame={() => {
                  setShowSummary(false);
                  initializeTime(15);
                  useStatsStore.getState().resetStats();
                  playGameStart();
                }}
                onExit={() => {
                  setShowSummary(false);
                  useStatsStore.getState().resetStats();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GestureHelpDialog
        isOpen={showGestureHelp}
        onClose={() => setShowGestureHelp(false)}
      />

      {confirmationState.isOpen && (
        <ConfirmationModal
          type={confirmationState.type!}
          onConfirm={() => handleConfirmation(true)}
          onCancel={() => handleConfirmation(false)}
        />
      )}
    </motion.div>
  );
};
