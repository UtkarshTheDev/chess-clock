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

export default ControlButton;
