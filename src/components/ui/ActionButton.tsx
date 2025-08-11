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
      base: "bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25",
      disabled: "bg-neutral-600/90 border-neutral-500/70 text-neutral-300 shadow-lg shadow-neutral-900/20",
    },
    checkmate: {
      base: "bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/25",
      disabled: "bg-neutral-600/90 border-neutral-500/70 text-neutral-300 shadow-lg shadow-neutral-900/20",
    },
    draw: {
      base: "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25",
      disabled: "bg-neutral-600/90 border-neutral-500/70 text-neutral-300 shadow-lg shadow-neutral-900/20",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      data-action-button={variant}
      className={cn(
        "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-xl", // Responsive padding
        "border border-2 transition-all duration-300",
        "flex items-center gap-1 sm:gap-2", // Reduced gap on mobile
        "font-semibold text-xs sm:text-sm", // Smaller text on mobile
        "backdrop-blur-md relative overflow-hidden",
        "transform hover:-translate-y-1 active:translate-y-0",
        disabled ? variants[variant].disabled : variants[variant].base,
        // Enhanced styling for better visibility on white backgrounds
        "ring-1 ring-black/10",
        // Additional disabled state styling for better visual feedback
        disabled && "opacity-60 cursor-not-allowed hover:translate-y-0",
        // Touch-friendly improvements
        "touch-manipulation select-none"
      )}
      whileHover={{
        scale: disabled ? 1 : 1.05,
        boxShadow: disabled ? undefined : "0 10px 25px rgba(0, 0, 0, 0.2)"
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={false}
    >
      {/* Subtle shine effect for premium feel */}
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}

      <motion.span
        initial={false}
        animate={{ rotate: 0 }}
        whileHover={{ rotate: disabled ? 0 : 5, scale: disabled ? 1 : 1.1 }}
        className={cn(
          "transform transition-all duration-200 relative z-10",
          disabled && "opacity-80"
        )}
      >
        {icon}
      </motion.span>
      <span className={cn(
        "font-bold tracking-wide relative z-10",
        disabled && "opacity-80"
      )}>
        {label}
      </span>
    </motion.button>
  );
};
