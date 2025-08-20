import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        "flex items-center gap-3 px-6 py-3 rounded-xl", // Increased padding for larger touch area
        "backdrop-blur-md shadow-lg",
        "transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "text-white",
        "bg-neutral-800/60 hover:bg-neutral-700/60", // Slightly more opaque
        "border border-white/10", // Added border for better definition
        "min-h-[48px] min-w-[48px]", // Minimum touch target size
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-lg">{icon}</span>
      {label && <span className="text-base font-medium">{label}</span>}
    </motion.button>
  );
};

export default ControlButton;
