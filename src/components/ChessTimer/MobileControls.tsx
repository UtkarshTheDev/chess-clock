import { motion } from "framer-motion";
import ControlButton from "./ControlButton";
import { Play, Pause, HelpCircle, RefreshCcw } from "lucide-react";
import { positionVariants, springTransition } from "@/utils/timerAnimations";

interface MobileControlsProps {
  isRunning: boolean;
  onTogglePause: () => void;
  onShowHelp: () => void;
  onReset: () => void;
  animatedPosition?: 'center' | 'top' | 'bottom';
  isMobile?: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  isRunning,
  onTogglePause,
  onShowHelp,
  onReset,
  animatedPosition = 'center',
  isMobile = false,
}) => (
  <motion.div 
    className="md:hidden flex items-center gap-4 my-4 mb-6 justify-center"
    // Only animate position on mobile
    animate={isMobile ? positionVariants[animatedPosition] : undefined}
    transition={isMobile ? springTransition : undefined}
    // Set initial position for mobile
    initial={isMobile ? positionVariants[animatedPosition] : undefined}
  >
    <ControlButton
      onClick={onTogglePause}
      icon={isRunning ? <Pause /> : <Play />}
    />
    <ControlButton
      onClick={onShowHelp}
      icon={<HelpCircle />}
    />
    <ControlButton onClick={onReset} icon={<RefreshCcw />} />
  </motion.div>
);

export default MobileControls;
