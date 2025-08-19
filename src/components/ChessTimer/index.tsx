import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTimerTypeStore } from "@/stores/timerTypeStore";
import { RefreshCcw, Play, Pause } from "lucide-react";
import GameSummary from "@/components/GameSummary";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { vibrate } from "@/utils/haptics";
import { cn } from "@/lib/utils";
import { usePhaseTransition } from "@/hooks/usePhaseTransition";
import { KeyboardShortcuts } from "../KeyboardShortcuts";
import { GestureHelpDialog } from "../GestureHelpDialog";
import ControlButton from "./ControlButton";
import ConfirmationModal from "./ConfirmationModal";
import { TimerSquare } from "./TimerSquare";
import MobileControls from "./MobileControls";
import { AnimationState, calculateHeights, springTransition } from "@/utils/timerAnimations";

interface ChessTimerProps {
  onReset?: () => void;
}

interface ConfirmationState {
  isOpen: boolean;
  type: "checkmate" | "draw" | null;
  player: "white" | "black" | null;
}

export const ChessTimer = ({ onReset }: ChessTimerProps) => {
  const {
    whiteTimeRemaining,
    blackTimeRemaining,
    isRunning,
    activePlayer,
    switchActivePlayer,
    pauseTimer,
    resumeTimer,
  } = useTimerStore();

  const { getDetailedDisplayName } = useTimerTypeStore();

  const [showSummary, setShowSummary] = useState(false);
  const [showGestureHelp, setShowGestureHelp] = useState(false);
  const [gestureNotification, setGestureNotification] = useState<string | null>(null);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    type: null,
    player: null,
  });

  // Animation state management
  const [animationState, setAnimationState] = useState<AnimationState>(() => 
    calculateHeights(null) // Initialize with default state
  );
  
  // Mobile breakpoint state for responsive animations
  const [isMobile, setIsMobile] = useState(false);
  
  // Debouncing ref for rapid state changes
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playMove, playCheck, playGameEnd, playGameStart } = useSoundEffects();
  const { currentPhase } = usePhaseTransition();

  // Handle responsive breakpoint detection for mobile animations
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    // Check initial state
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Animation state update effect with debouncing
  useEffect(() => {
    // Clear any existing timeout to debounce rapid changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout to update animation state after a brief delay
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        const newAnimationState = calculateHeights(activePlayer);
        setAnimationState(newAnimationState);
        // Debug log for development (can be removed in production)
        console.log('Animation state updated:', { activePlayer, newAnimationState });
      } catch (error) {
        console.warn('Animation state update error:', error);
        // Fallback to immediate state change without animation
        setAnimationState(calculateHeights(activePlayer));
      }
    }, 50); // 50ms debounce delay to handle rapid state changes

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [activePlayer]);

  // Cleanup debounce timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleGameEnd = useCallback(
    (reason: "check" | "checkmate" | "draw" | "timeout") => {
      if (!activePlayer) return;

      pauseTimer();
      const winner = reason === "timeout" ? (activePlayer === "white" ? "black" : "white") : activePlayer;

      useStatsStore.getState().recordMove(
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
    [activePlayer, pauseTimer, whiteTimeRemaining, blackTimeRemaining, playGameEnd]
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
    setShowSummary(false);
    playGameStart();
    useStatsStore.getState().resetStats();
  }, [onReset, playGameStart]);

  useEffect(() => {
    const store = useTimerStore.getState();
    store.setTimeoutCallback(() => {
      handleGameEnd("timeout");
    });
  }, [handleGameEnd]);

  const handlePlayerMove = useCallback(() => {
    if (activePlayer && isRunning) {
      const lastMoveTime = useTimerStore.getState().lastMoveStartTime;
      const moveTime = lastMoveTime ? (Date.now() - lastMoveTime) / 1000 : 0;
      playMove();
      switchActivePlayer();
      useStatsStore.getState().recordMove(
        activePlayer,
        moveTime,
        "normal",
        activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
      );
    }
  }, [activePlayer, isRunning, playMove, switchActivePlayer, whiteTimeRemaining, blackTimeRemaining]);

  const handleCheck = useCallback(() => {
    if (activePlayer && isRunning) {
      const lastMoveTime = useTimerStore.getState().lastMoveStartTime;
      const moveTime = lastMoveTime ? (Date.now() - lastMoveTime) / 1000 : 0;
      playCheck();
      vibrate([100]);
      switchActivePlayer();
      useStatsStore.getState().recordMove(
        activePlayer,
        moveTime,
        "check",
        activePlayer === "white" ? whiteTimeRemaining : blackTimeRemaining
      );
    }
  }, [activePlayer, isRunning, playCheck, switchActivePlayer, whiteTimeRemaining, blackTimeRemaining]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) return;
      const actions: { [key: string]: () => void } = {
        Space: () => handlePlayerMove(),
        Enter: () => handleCheck(),
        Tab: () => {
          e.preventDefault();
          pauseTimer();
          setConfirmationState({ isOpen: true, type: "checkmate", player: activePlayer });
        },
        KeyP: () => (isRunning ? pauseTimer() : resumeTimer()),
      };
      const action = actions[e.code as keyof typeof actions];
      if (action) action();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, handlePlayerMove, handleCheck, pauseTimer, resumeTimer, activePlayer]);

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

  const handleLongPress = useCallback(
    (player: "white" | "black") => {
      if (player === activePlayer && isRunning) {
        showGestureNotification("Checkmate");
        setConfirmationState({ isOpen: true, type: "checkmate", player });
        vibrate([200]);
      }
    },
    [activePlayer, isRunning, showGestureNotification]
  );

  const getPhaseInfo = useCallback(() => {
    switch (currentPhase) {
      case "opening": return { color: "#4F46E5", label: "Opening Phase", gradient: "bg-gradient-to-r from-blue-600 to-indigo-600", icon: "♟" };
      case "middlegame": return { color: "#0EA5E9", label: "Middle Game", gradient: "bg-gradient-to-r from-sky-500 to-blue-500", icon: "♞" };
      case "endgame": return { color: "#A855F7", label: "End Game", gradient: "bg-gradient-to-r from-purple-600 to-indigo-600", icon: "♚" };
      default: return { color: "#6B7280", label: "Game", gradient: "bg-gradient-to-r from-gray-600 to-gray-700", icon: "♜" };
    }
  }, [currentPhase]);

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div className="h-full w-full md:h-[93vh]">
      <div className="relative h-full flex flex-col">
        <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-6">
          <div className="hidden md:block">
            <ControlButton onClick={handleReset} icon={<RefreshCcw />} label="Reset" />
          </div>
          <div className="flex-grow flex flex-col items-center gap-2">
            <div className={cn("px-4 py-2 rounded-full text-sm font-medium shadow-md", "flex items-center gap-2", phaseInfo.gradient)}>
              <span className="text-white text-lg">{phaseInfo.icon}</span>
              <span className="text-white">{phaseInfo.label}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 shadow-lg">
              <span className="text-neutral-100 text-xs font-semibold">{getDetailedDisplayName()}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <ControlButton onClick={isRunning ? pauseTimer : resumeTimer} icon={isRunning ? <Pause /> : <Play />} label={isRunning ? "Pause" : "Play"} />
          </div>
        </div>
        <div className="md:flex max-lg:flex-col h-full w-full">
          <motion.div 
            className={cn(
              "flex-1 md:flex-row flex items-center justify-center",
              "cursor-pointer select-none",
              // Desktop: fixed full height, Mobile: animated height
              "md:h-full",
              activePlayer === "black" ? "opacity-100" : "opacity-50"
            )}
            // Only animate height on mobile (below md breakpoint)
            animate={{
              height: isMobile ? animationState.topSquareHeight : undefined
            }}
            transition={isMobile ? springTransition : undefined}
            // Set initial height for mobile
            style={{
              height: !isMobile ? undefined : animationState.topSquareHeight
            }}
          >
            <TimerSquare
              player="black"
              time={blackTimeRemaining}
              isActive={activePlayer === "black"}
              isRunning={isRunning}
              onSingleTap={handleSingleTap}
              onTwoFingerTap={handleTwoFingerTap}
              onLongPress={handleLongPress}
              onCheck={handleCheck}
              onCheckmate={() => setConfirmationState({ isOpen: true, type: "checkmate", player: "black" })}
              onDraw={() => setConfirmationState({ isOpen: true, type: "draw", player: "black" })}
            />
          </motion.div>
          <MobileControls 
            isRunning={isRunning} 
            onTogglePause={isRunning ? pauseTimer : resumeTimer} 
            onShowHelp={() => setShowGestureHelp(true)} 
            onReset={handleReset}
            animatedPosition={animationState.controlsPosition}
            isMobile={isMobile}
          />
          <motion.div 
            className={cn(
              "flex-1 md:flex-row flex items-center justify-center",
              "cursor-pointer select-none",
              // Desktop: fixed full height, Mobile: animated height
              "md:h-full",
              activePlayer === "white" ? "opacity-100" : "opacity-50"
            )}
            // Only animate height on mobile (below md breakpoint)
            animate={{
              height: isMobile ? animationState.bottomSquareHeight : undefined
            }}
            transition={isMobile ? springTransition : undefined}
            // Set initial height for mobile
            style={{
              height: !isMobile ? undefined : animationState.bottomSquareHeight
            }}
          >
            <TimerSquare
              player="white"
              time={whiteTimeRemaining}
              isActive={activePlayer === "white"}
              isRunning={isRunning}
              onSingleTap={handleSingleTap}
              onTwoFingerTap={handleTwoFingerTap}
              onLongPress={handleLongPress}
              onCheck={handleCheck}
              onCheckmate={() => setConfirmationState({ isOpen: true, type: "checkmate", player: "white" })}
              onDraw={() => setConfirmationState({ isOpen: true, type: "draw", player: "white" })}
            />
          </motion.div>
        </div>
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
        <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2">
          <KeyboardShortcuts />
        </div>
        {showGestureHelp && <GestureHelpDialog isOpen={showGestureHelp} onClose={() => setShowGestureHelp(false)} />}
        {confirmationState.isOpen && confirmationState.type && (
          <ConfirmationModal
            type={confirmationState.type}
            onConfirm={() => {
              if (confirmationState.type === "checkmate") handleGameEnd("checkmate");
              else if (confirmationState.type === "draw") handleGameEnd("draw");
              setConfirmationState({ isOpen: false, type: null, player: null });
            }}
            onCancel={() => setConfirmationState({ isOpen: false, type: null, player: null })}
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
