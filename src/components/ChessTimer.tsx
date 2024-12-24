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
// import type { GameEndReason } from "@/types/chess";
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
  onReset?: () => void;
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

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
    initializeTime(15);
    setShowSummary(false);
    playGameStart();
    useStatsStore.getState().resetStats();
  }, [onReset, initializeTime, playGameStart]);

  const getPhaseBasedStyle = useCallback(() => {
    switch (currentPhase) {
      case "opening":
        return "border-blue-500";
      case "middleGame":
        return "border-yellow-500";
      case "endGame":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  }, [currentPhase]);

  const handlePlayerMove = useCallback(() => {
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
  }, [
    activePlayer,
    isRunning,
    playMove,
    switchActivePlayer,
    whiteTimeRemaining,
    blackTimeRemaining,
  ]);

  const handleCheck = useCallback(() => {
    if (!activePlayer || !isRunning) return;

    playCheck();
    vibrate([100, 50, 100]);

    const timeRemaining =
      activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining;

    useStatsStore
      .getState()
      .recordMove(activePlayer, 0, "check", timeRemaining);

    switchActivePlayer();
  }, [
    activePlayer,
    isRunning,
    playCheck,
    switchActivePlayer,
    whiteTimeRemaining,
    blackTimeRemaining,
  ]);

  const handleCheckmate = useCallback(() => {
    if (!activePlayer || !isRunning) return;
    handleGameEnd("checkmate");
  }, [activePlayer, isRunning, handleGameEnd]);

  const handleDraw = useCallback(() => {
    if (!isRunning) return;
    handleGameEnd("draw");
  }, [isRunning, handleGameEnd]);

  const handleConfirmation = useCallback(
    (confirmed: boolean) => {
      if (confirmed) {
        if (confirmationState.type === "checkmate") {
          handleCheckmate();
        } else if (confirmationState.type === "draw") {
          handleDraw();
        }
      }
      setConfirmationState({
        isOpen: false,
        type: null,
        player: null,
      });
    },
    [confirmationState.type, handleCheckmate, handleDraw]
  );

  const doubleTapHandler = useCallback(() => {
    if (activePlayer) {
      handleCheck();
    }
  }, [activePlayer, handleCheck]);

  const longPressHandler = useCallback(() => {
    if (activePlayer) {
      setConfirmationState({
        isOpen: true,
        type: "checkmate",
        player: activePlayer,
      });
    }
  }, [activePlayer]);

  const doubleTap = useDoubleTap(doubleTapHandler, 300);
  const longPress = useLongPress(longPressHandler, 3000);

  const gestureHandlers = {
    ...doubleTap,
    ...longPress,
    onClick: handlePlayerMove,
  };

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
          // Pause timer immediately
          // handleCheckmate();
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
    handleCheckmate,
    pauseTimer,
    resumeTimer,
    activePlayer,
  ]);

  const renderTimerSquare = (player: "white" | "black") => {
    const isActive = activePlayer === player;
    const timeRemaining =
      player === "white" ? whiteTimeRemaining : blackTimeRemaining;

    return (
      <motion.div
        className={cn(
          "flex-1 md:flex-row  flex items-center justify-center",
          "cursor-pointer select-none md:h-full h-[40vh]",
          isActive ? "opacity-100" : "opacity-50",
          getPhaseBasedStyle()
        )}
        {...(isActive ? gestureHandlers : {})}
      >
        <TimerSquare player={player} time={timeRemaining} isActive={isActive} />
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
    <div className="md:hidden flex items-center gap-4 my-4 mb-6 justify-center ">
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

  const TimerSquare = ({
    player,
    time,
    isActive,
  }: {
    player: "white" | "black";
    time: number;
    isActive: boolean;
  }) => {
    const timeBasedColor = getTimeBasedColor(time, initialTime, player);

    return (
      <motion.div
        className={cn(
          "w-full max-w-[98%] md:max-h-[60vh] h-full",
          "relative cursor-pointer rounded-2xl",
          "transition-all duration-300",
          !isActive && (player === "white" ? "bg-white" : "bg-black"),
          isActive && timeBasedColor,
          isActive && "border-4",
          isActive && phaseColor,
          !isActive && "border-2 border-neutral-700",
          "shadow-lg backdrop-blur-sm",
          "sm:max-w-[90%] md:max-w-[90%] max-h-[45vh] "
        )}
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className=" flex items-center justify-center h-full">
          <span
            className={cn(
              "font-sourGummy text-8xl lg:text-9xl font-bold",
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
            onClick={handleCheck}
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

  return (
    <motion.div className="h-full w-full md:h-[93vh]">
      <div className="relative h-full flex flex-col">
        <div className="md:flex max-md:flex-col  h-full w-full">
          {renderTimerSquare("black")}

          <DesktopControls />
          <MobileControls />
          {renderTimerSquare("white")}
        </div>

        <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2">
          <KeyboardShortcuts />
        </div>

        {showGestureHelp && (
          <GestureHelpDialog
            isOpen={showGestureHelp}
            onClose={() => setShowGestureHelp(false)}
          />
        )}

        {confirmationState.isOpen && (
          <ConfirmationModal
            type={confirmationState.type!}
            onConfirm={() => handleConfirmation(true)}
            onCancel={() => handleConfirmation(false)}
          />
        )}

        {showSummary && (
          <GameSummary
            onNewGame={handleReset}
            onExit={() => setShowSummary(false)}
          />
        )}
      </div>
    </motion.div>
  );
};
