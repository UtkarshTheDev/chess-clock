import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import GlareHover from "@/Animations/GlareHover/GlareHover";

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
      disabled: "bg-neutral-800/80 border-neutral-600/80 text-neutral-100/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    },
    checkmate: {
      base: "bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/25",
      disabled: "bg-neutral-800/80 border-neutral-600/80 text-neutral-100/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    },
    draw: {
      base: "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25",
      disabled: "bg-neutral-800/80 border-neutral-600/80 text-neutral-100/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-action-button={variant}
      className={cn(
        // Touch-friendly targets with responsive padding
        "min-h-[44px] min-w-[44px] rounded-xl",
        "px-3 py-2 sm:px-4 sm:py-2.5",
        // Layout and transitions
        "border-2 transition-all duration-300",
        "flex items-center gap-2 sm:gap-2.5",
        "font-semibold text-[12px] sm:text-sm whitespace-nowrap",
        "backdrop-blur-md relative overflow-hidden",
        "transform hover:-translate-y-1 active:translate-y-0",
        disabled ? variants[variant].disabled : variants[variant].base,
        // Subtle outline for clarity over glass containers
        "ring-1 ring-white/10",
        // Additional disabled state styling for better visual feedback
        disabled && "opacity-100 cursor-not-allowed hover:translate-y-0"
      )}
      whileHover={{
        scale: disabled ? 1 : 1.05,
        boxShadow: disabled ? undefined : "0 10px 25px rgba(0, 0, 0, 0.2)"
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={false}
    >
      {/* Glare overlay (non-interactive) for premium feel */}
      {!disabled && (
        <div className="absolute inset-0 pointer-events-none">
          <GlareHover
            width="100%"
            height="100%"
            background="transparent"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.18}
            glareAngle={-25}
            glareSize={220}
            transitionDuration={700}
            className="!border-transparent !bg-transparent"
            style={{ pointerEvents: "none" }}
          />
        </div>
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
        {/* Icon scales down slightly on very small screens */}
        <span className="inline-flex items-center justify-center">
          {icon}
        </span>
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
