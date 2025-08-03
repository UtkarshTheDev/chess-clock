import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useTimerStore } from "../stores/timerStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTimerTypeStore } from "@/stores/timerTypeStore";
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
import useGestures from "@/hooks/useGestures";
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
  // Always round down to whole seconds for display
  const totalSeconds = Math.floor(seconds);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  // Format based on duration
  if (hours > 0) {
    // Format as H:MM:SS for times over an hour
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    // Format as MM:SS for times under an hour
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
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
    switchActivePlayer,
    pauseTimer,
    resumeTimer,
    initialTime,
    whiteDisplayInfo,
    blackDisplayInfo
  } = useTimerStore();

  const { getDetailedDisplayName } = useTimerTypeStore();

  const [showSummary, setShowSummary] = useState(false);
  const [showGestureHelp, setShowGestureHelp] = useState(false);
  const [gestureNotification, setGestureNotification] = useState<string | null>(null);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(
    {
      isOpen: false,
      type: null,
      player: null,
    }
  );

  const { playMove, playCheck, playGameEnd, playGameStart } = useSoundEffects();
  const { currentPhase } = usePhaseTransition();

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
    // Reset will be handled by the parent component
    setShowSummary(false);
    playGameStart();
    useStatsStore.getState().resetStats();
  }, [onReset, playGameStart]);

  // Set up timeout callback
  useEffect(() => {
    const store = useTimerStore.getState();

    // Set timeout callback
    store.setTimeoutCallback(() => {
      handleGameEnd("timeout");
    });
  }, [handleGameEnd]);

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

  // Show gesture notification
  const showGestureNotification = useCallback((message: string) => {
    setGestureNotification(message);
    setTimeout(() => setGestureNotification(null), 1500);
  }, []);

  const handleSingleTap = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Normal Move");
        handlePlayerMove();
        vibrate([50]);
      }
    },
    [activePlayer, isRunning, handlePlayerMove, showGestureNotification]
  );

  const handleTwoFingerTap = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Check Move");
        handleCheck();
        vibrate([100, 50, 100]);
      }
    },
    [activePlayer, isRunning, handleCheck, showGestureNotification]
  );

  

  // Handle long press for checkmate
  const handleLongPress = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Checkmate");
        setConfirmationState({
          isOpen: true,
          type: "checkmate",
          player,
        });
        vibrate([200]);
      }
    },
    [activePlayer, isRunning, showGestureNotification]
  );

  // Get phase indicator style
  const getPhaseInfo = useCallback(() => {
    switch (currentPhase) {
      case "opening":
        return { 
          color: "#4F46E5", 
          label: "Opening Phase",
          gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
          icon: "♟" // Chess pawn for opening
        };
      case "middlegame":
        return { 
          color: "#0EA5E9", 
          label: "Middle Game",
          gradient: "bg-gradient-to-r from-sky-500 to-blue-500",
          icon: "♞" // Chess knight for middle game
        };
      case "endgame":
        return { 
          color: "#A855F7", 
          label: "End Game",
          gradient: "bg-gradient-to-r from-purple-600 to-indigo-600",
          icon: "♚" // Chess king for endgame
        };
      default:
        return { 
          color: "#6B7280", 
          label: "Game",
          gradient: "bg-gradient-to-r from-gray-600 to-gray-700",
          icon: "♜" // Chess rook as default
        };
    }
  }, [currentPhase]);

  const phaseInfo = getPhaseInfo();

  const TimerSquare = ({
    player,
    time,
    isActive,
    isRunning,
  }: {
    player: "white" | "black";
    time: number;
    isActive: boolean;
    showPhaseIndicator: boolean;
    isRunning: boolean;
  }) => {
    const displayInfo = player === "white" ? whiteDisplayInfo : blackDisplayInfo;
    const [isGestureActive, setIsGestureActive] = useState(false);
    // Get time-based color for background
    const getTimeBasedBackground = () => {
      const timePercentage = (time / initialTime) * 100;
      
      if (timePercentage <= 10) {
        // Critical time - vibrant red gradient
        return "bg-gradient-to-br from-red-500 to-red-700 text-white";
      } else if (timePercentage <= 50) {
        // Warning time - vibrant yellow/amber gradient
        return "bg-gradient-to-br from-amber-400 to-yellow-600 text-black";
      } else if (timePercentage >= 90) {
        // Plenty of time - vibrant green gradient
        return "bg-gradient-to-br from-emerald-400 to-green-600 text-white";
      }
      
      // Default colors based on player with subtle gradient
      if (player === "white") {
        return "bg-gradient-to-br from-gray-100 to-white text-black";
      } else {
        return "bg-gradient-to-br from-gray-900 to-black text-white";
      }
    };
    
    // Get player-specific background color
    const getPlayerBackground = () => {
      if (player === "white") {
        return "bg-white text-black";
      } else {
        // Use a nice gradient for black background
        return "bg-gradient-to-br from-gray-900 to-black text-white";
      }
    };
    
    // Get time-based border color
    const getTimeBasedBorderColor = () => {
      const timePercentage = (time / initialTime) * 100;
      
      if (timePercentage <= 10) {
        return "border-red-500";
      } else if (timePercentage <= 50) {
        return "border-yellow-400";
      } else if (timePercentage >= 90) {
        return "border-green-400";
      }
      
      // Default border color - make white border more visible
      return player === "white" ? "border-gray-400" : "border-gray-600";
    };

    // Get appropriate border color based on game state and active player
    const getBorderColor = () => {
      if (!isRunning) {
        // When game is not running, use player color for border
        return player === "white" ? "border-gray-400" : "border-gray-600";
      } else if (isActive) {
        // When game is running and this player is active, use player color for border
        return player === "white" ? "border-white" : "border-gray-300";
      } else {
        // When game is running but this player is not active, use time-based border
        // This ensures both black and white show time-based borders when not active
        return getTimeBasedBorderColor();
      }
    };

    // Get appropriate background color
    const getBackground = () => {
      if (!isRunning) {
        // When game is not running, use player colors
        return getPlayerBackground();
      } else if (isActive) {
        // When game is running and this player is active, use time-based background
        // This ensures both black and white show time-based backgrounds when active
        return getTimeBasedBackground();
      } else {
        // When game is running but this player is not active, use player colors
        return getPlayerBackground();
      }
    };

    // Determine if we need to add a background to action buttons for better contrast
    // Apply to white background cards, whether active or not
    const needsContrastBackground = player === "white";
    
    const gestureHandlers = useGestures({
      onSingleTap: (event: React.MouseEvent | React.TouchEvent) => {
        // Check if the click came from an action button
        if (event && event.target) {
          const target = event.target as HTMLElement;
          const isActionButton = target.closest('[data-action-button]') || target.closest('.action-button-container');
          if (isActionButton) {
            return;
          }
        }
        handleSingleTap(player);
      },
      onTwoFingerTap: () => handleTwoFingerTap(player),
      onLongPress: () => handleLongPress(player),
      onGestureStart: () => {
        if (isActive && isRunning) {
          setIsGestureActive(true);
        }
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
          // Use the dynamic background function
          getBackground(),
          // Scale up active card and increase z-index to avoid border overlap
          isActive && "scale-105 z-10",
          // Add gesture feedback
          isGestureActive && isActive && "scale-110 shadow-2xl",
          // Border: use dynamic border color logic
          isActive ? "border-4" : "border-2",
          getBorderColor(),
          // Add subtle ring effect for better visibility
          isActive ? (player === "black" ? "ring-1 ring-gray-300/30" : "") : "",
          // Add additional outline for white timer when not active to improve border visibility
          !isActive && player === "white" ? "ring-1 ring-gray-400/50" : "",
          // Enhanced shadow during gesture
          isGestureActive && isActive ? "shadow-2xl" : "shadow-lg",
          "backdrop-blur-sm",
          "sm:max-w-[90%] md:max-w-[90%] max-h-[45vh]"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {/* Timer Mode Info */}
          {displayInfo && (displayInfo.delayTime !== undefined || displayInfo.pendingIncrement !== undefined || displayInfo.stageInfo) && (
            <div className="mb-2 text-center">
              {displayInfo.isInDelay && displayInfo.delayTime !== undefined && (
                <div className={cn(
                  "text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border",
                  player === "white"
                    ? "text-yellow-800 bg-yellow-100/95 border-yellow-300"
                    : "text-yellow-200 bg-yellow-900/90 border-yellow-600"
                )}>
                  Delay: {Math.ceil(displayInfo.delayTime)}s
                </div>
              )}
              {displayInfo.pendingIncrement !== undefined && displayInfo.pendingIncrement > 0 && (
                <div className={cn(
                  "text-sm font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border mt-1",
                  player === "white"
                    ? "text-green-800 bg-green-100/95 border-green-300"
                    : "text-green-200 bg-green-900/90 border-green-600"
                )}>
                  +{displayInfo.pendingIncrement}s after move
                </div>
              )}
              {displayInfo.stageInfo && (
                <div className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border mt-1",
                  player === "white"
                    ? "text-blue-800 bg-blue-100/95 border-blue-300"
                    : "text-blue-200 bg-blue-900/90 border-blue-600"
                )}>
                  {displayInfo.stageInfo}
                </div>
              )}
            </div>
          )}

          {/* Main Time Display */}
          <span className="font-sourGummy text-8xl lg:text-9xl font-bold">
            {formatTime(time)}
          </span>
        </div>

        {/* Action Buttons */}
        <motion.div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-20 action-button-container",
            // Add semi-transparent background for buttons on white background for better contrast
            needsContrastBackground ? "p-2 rounded-lg bg-gray-800/30 backdrop-blur-md" : ""
          )}
          initial={false}
          data-action-button-container="true"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ActionButton
            variant="check"
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (isActive && isRunning) {
                handleCheck();
              }
            }}
            disabled={!isActive || !isRunning}
            icon={<Check className="w-5 h-5" />}
            label="Check"
          />
          <ActionButton
            variant="checkmate"
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (isActive && isRunning) {
                setConfirmationState({
                  isOpen: true,
                  type: "checkmate",
                  player,
                });
              }
            }}
            disabled={!isActive || !isRunning}
            icon={<Trophy className="w-5 h-5" />}
            label="Checkmate"
          />
          <ActionButton
            variant="draw"
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (isActive && isRunning) {
                setConfirmationState({
                  isOpen: true,
                  type: "draw",
                  player,
                });
              }
            }}
            disabled={!isActive || !isRunning}
            icon={<Handshake className="w-5 h-5" />}
            label="Draw"
          />
        </motion.div>
      </motion.div>
    );
  };

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
        {/* Top Control Bar with Phase Indicator and Controls */}
        <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-6">
          {/* Reset Button */}
          <div className="hidden md:block">
            <ControlButton
              onClick={handleReset}
              icon={<RefreshCcw />}
              label="Reset"
            />
          </div>
          
          {/* Central Phase Indicator and Timer Type */}
          <div className="flex-grow flex flex-col items-center gap-2">
            {/* Phase Indicator */}
            <div
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium shadow-md",
                "flex items-center gap-2",
                phaseInfo.gradient
              )}
            >
              <span className="text-white text-lg">{phaseInfo.icon}</span>
              <span className="text-white">{phaseInfo.label}</span>
            </div>

            {/* Timer Type Display */}
            <div className="px-3 py-1 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 shadow-lg">
              <span className="text-neutral-100 text-xs font-semibold">
                {getDetailedDisplayName()}
              </span>
            </div>
          </div>
          
          {/* Play/Pause Button */}
          <div className="hidden md:block">
            <ControlButton
              onClick={isRunning ? pauseTimer : resumeTimer}
              icon={isRunning ? <Pause /> : <Play />}
              label={isRunning ? "Pause" : "Play"}
            />
          </div>
        </div>
        
        <div className="md:flex max-md:flex-col h-full w-full">
          {/* Black Timer Container - No phase background */}
          <div
            className={cn(
              "flex-1 md:flex-row flex items-center justify-center",
              "cursor-pointer select-none md:h-full h-[40vh]",
              activePlayer === "black" ? "opacity-100" : "opacity-50"
            )}
          >
            <TimerSquare
              player="black"
              time={blackTimeRemaining}
              isActive={activePlayer === "black"}
              showPhaseIndicator={false}
              isRunning={isRunning}
            />
          </div>

          <MobileControls />

          {/* White Timer Container - No phase background */}
          <div
            className={cn(
              "flex-1 md:flex-row flex items-center justify-center",
              "cursor-pointer select-none md:h-full h-[40vh]",
              activePlayer === "white" ? "opacity-100" : "opacity-50"
            )}
          >
            <TimerSquare
              player="white"
              time={whiteTimeRemaining}
              isActive={activePlayer === "white"}
              showPhaseIndicator={false}
              isRunning={isRunning}
            />
          </div>
        </div>

        {/* Gesture Notification */}
        <AnimatePresence>
          {gestureNotification && (
            <motion.div
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-2 rounded-lg bg-neutral-900/90 border border-neutral-700 text-white font-medium shadow-lg backdrop-blur-md">
                {gestureNotification}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
