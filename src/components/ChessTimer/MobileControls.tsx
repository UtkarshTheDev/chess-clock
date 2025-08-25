import { motion } from "framer-motion";
import ControlButton from "./ControlButton";
import { Play, Pause, HelpCircle, RefreshCcw } from "lucide-react";
import { 
  ANIMATION_CSS_CLASSES,
  prefersReducedMotion,
  controlsButtonsContainer,
  controlButtonVariant,
  smoothTween
} from "@/utils/timerAnimations";

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
}) => {
  const shouldUseReducedMotion = prefersReducedMotion();
  
  return (
    <motion.div 
      className={`px-6 py-4 bg-black/30 backdrop-blur-md rounded-2xl mx-6 ${
        isMobile && !shouldUseReducedMotion ? ANIMATION_CSS_CLASSES.willChangeTransform : ''
      } shadow-lg border border-white/10`}
      // Ultra-smooth positioning animation
      animate={isMobile && !shouldUseReducedMotion ? {
        y: animatedPosition === 'top' ? -15 : animatedPosition === 'bottom' ? 15 : 0,
        opacity: 1,
        scale: 1
      } : undefined}
      transition={isMobile && !shouldUseReducedMotion ? smoothTween : undefined}
      // Set initial position for mobile
      initial={isMobile && !shouldUseReducedMotion ? {
        y: 0,
        opacity: 1,
        scale: 1
      } : undefined}
      // Fallback for reduced motion
      style={shouldUseReducedMotion ? {
        transform: `translateY(${animatedPosition === 'top' ? -15 : animatedPosition === 'bottom' ? 15 : 0}px)`,
        transition: 'none'
      } : undefined}
    >
      {/* Buttons row with staggered entrance */}
      <motion.div 
        className="flex items-center justify-center gap-6"
        variants={!shouldUseReducedMotion ? controlsButtonsContainer : undefined}
        initial={!shouldUseReducedMotion ? 'hidden' : undefined}
        animate={!shouldUseReducedMotion ? 'show' : undefined}
      >
        <motion.div variants={!shouldUseReducedMotion ? controlButtonVariant : undefined}>
          <ControlButton
            onClick={onTogglePause}
            icon={isRunning ? <Pause /> : <Play />}
          />
        </motion.div>
        <motion.div variants={!shouldUseReducedMotion ? controlButtonVariant : undefined}>
          <ControlButton
            onClick={onShowHelp}
            icon={<HelpCircle />}
          />
        </motion.div>
        <motion.div variants={!shouldUseReducedMotion ? controlButtonVariant : undefined}>
          <ControlButton onClick={onReset} icon={<RefreshCcw />} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MobileControls;
