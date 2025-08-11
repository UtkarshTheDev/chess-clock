import { motion } from "framer-motion";
import { Crown, Handshake, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimerTypeStore } from "@/stores/timerTypeStore";
import ShinyText from "../../TextAnimations/ShinyText/ShinyText";

function ShinyWinnerText({ winner }: { winner: string }) {
  const text = winner === "draw" ? "Game Drawn" : `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!`;
  return (
    <ShinyText
      text={text}
      disabled={false}
      speed={7}
      className="text-4xl"
    />
  );
}

interface WinnerBannerProps {
  winner: string;
  reason: string;
}

const WinnerBanner = ({ winner, reason }: WinnerBannerProps) => {
  const { getDetailedDisplayName } = useTimerTypeStore();

  const getWinnerColors = () => {
    if (winner === "draw") {
      return {
        gradient: "from-blue-600 via-blue-500 to-blue-600",
        iconColor: "text-blue-300",
        textColor: "text-blue-100",
        bgOverlay: "bg-blue-500/10"
      };
    }
    return {
      gradient: "from-amber-600 via-yellow-500 to-amber-600",
      iconColor: "text-amber-300",
      textColor: "text-amber-100",
      bgOverlay: "bg-amber-500/10"
    };
  };

  const colors = getWinnerColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-8 text-center border-b border-white/10",
        "bg-gradient-to-r", colors.gradient,
        "before:absolute before:inset-0 before:bg-black/20 before:backdrop-blur-sm"
      )}
    >
      <div className={cn("absolute inset-0", colors.bgOverlay)} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          {winner === "draw" ? (
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Handshake className={cn("w-12 h-12", colors.iconColor)} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ rotate: -180, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            >
              <Crown className={cn("w-12 h-12", colors.iconColor)} />
            </motion.div>
          )}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "mb-2 tracking-wide font-unbounded",
            colors.textColor,
            "drop-shadow-lg"
          )}
        >
          <ShinyWinnerText winner={winner} />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <p className="text-[24px] font-medium text-white/90 capitalize font-ubuntu">
            {reason === "timeout" ? "Time Forfeit" :
             reason === "checkmate" ? "Checkmate" :
             reason === "by agreement" ? "By Agreement" :
             reason}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm font-ubuntuCondensed text-white/80">
            <Clock className="w-4 h-4" />
            <span>{getDetailedDisplayName()}</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WinnerBanner;
