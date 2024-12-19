import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ActionButtonProps {
  variant: "check" | "checkmate" | "draw";
  onClick: () => void;
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
      base: "bg-gradient-to-br from-emerald-500/40 to-emerald-600/50 border-emerald-500/50 text-emerald-100 hover:from-emerald-500/50 hover:to-emerald-600/60 shadow-emerald-900/20",
      disabled: "bg-neutral-800/40 border-neutral-700/40 text-neutral-500",
    },
    checkmate: {
      base: "bg-gradient-to-br from-amber-500/40 to-amber-600/50 border-amber-500/50 text-amber-100 hover:from-amber-500/50 hover:to-amber-600/60 shadow-amber-900/20",
      disabled: "bg-neutral-800/40 border-neutral-700/40 text-neutral-500",
    },
    draw: {
      base: "bg-gradient-to-br from-blue-500/40 to-blue-600/50 border-blue-500/50 text-blue-100 hover:from-blue-500/50 hover:to-blue-600/60 shadow-blue-900/20",
      disabled: "bg-neutral-800/40 border-neutral-700/40 text-neutral-500",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg",
        "border-2 transition-all duration-200",
        "flex items-center gap-2",
        "font-medium text-sm",
        "shadow-lg hover:shadow-xl backdrop-blur-md",
        "transform hover:-translate-y-0.5",
        disabled ? variants[variant].disabled : variants[variant].base
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      initial={false}
    >
      <motion.span
        initial={false}
        animate={{ rotate: 0 }}
        className="transform transition-transform"
      >
        {icon}
      </motion.span>
      <span className="font-semibold tracking-wide">{label}</span>
    </motion.button>
  );
};
