import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActionButtonProps {
  variant: "check" | "checkmate" | "draw";
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

export const ActionButton = ({
  variant,
  onClick,
  disabled,
  icon,
  label,
}: ActionButtonProps) => {
  const variants = {
    check: {
      base: "bg-gradient-to-br from-emerald-500/70 to-emerald-600/80 border-emerald-500/70 text-emerald-50 hover:from-emerald-500/80 hover:to-emerald-600/90 shadow-emerald-900/30",
      disabled: "bg-neutral-700/80 border-neutral-600/70 text-neutral-200 shadow-neutral-900/20",
    },
    checkmate: {
      base: "bg-gradient-to-br from-amber-500/70 to-amber-600/80 border-amber-500/70 text-amber-50 hover:from-amber-500/80 hover:to-amber-600/90 shadow-amber-900/30",
      disabled: "bg-neutral-700/80 border-neutral-600/70 text-neutral-200 shadow-neutral-900/20",
    },
    draw: {
      base: "bg-gradient-to-br from-blue-500/70 to-blue-600/80 border-blue-500/70 text-blue-50 hover:from-blue-500/80 hover:to-blue-600/90 shadow-blue-900/30",
      disabled: "bg-neutral-700/80 border-neutral-600/70 text-neutral-200 shadow-neutral-900/20",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      data-action-button={variant}
      className={cn(
        "px-4 py-2 rounded-lg",
        "border-2 transition-all duration-200",
        "flex items-center gap-2",
        "font-medium text-sm",
        "shadow-lg hover:shadow-xl backdrop-blur-md",
        "transform hover:-translate-y-0.5",
        disabled ? variants[variant].disabled : variants[variant].base,
        // Additional disabled state styling for better visual feedback
        disabled && "opacity-75 cursor-not-allowed"
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      initial={false}
    >
      <motion.span
        initial={false}
        animate={{ rotate: 0 }}
        className={cn(
          "transform transition-transform",
          disabled && "opacity-90"
        )}
      >
        {icon}
      </motion.span>
      <span className={cn(
        "font-semibold tracking-wide",
        disabled && "opacity-90"
      )}>
        {label}
      </span>
    </motion.button>
  );
};
