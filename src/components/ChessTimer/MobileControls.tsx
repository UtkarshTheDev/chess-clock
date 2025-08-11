import ControlButton from "./ControlButton";
import { Play, Pause, HelpCircle, RefreshCcw } from "lucide-react";

interface MobileControlsProps {
  isRunning: boolean;
  onTogglePause: () => void;
  onShowHelp: () => void;
  onReset: () => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  isRunning,
  onTogglePause,
  onShowHelp,
  onReset,
}) => (
  <div className="md:hidden flex items-center gap-4 my-4 mb-6 justify-center">
    <ControlButton
      onClick={onTogglePause}
      icon={isRunning ? <Pause /> : <Play />}
    />
    <ControlButton
      onClick={onShowHelp}
      icon={<HelpCircle />}
    />
    <ControlButton onClick={onReset} icon={<RefreshCcw />} />
  </div>
);

export default MobileControls;
