import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  type: "checkmate" | "draw";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  type,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const content = {
    checkmate: {
      title: "Confirm Checkmate",
      description:
        "Are you sure you want to declare checkmate? This will end the game.",
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      confirmText: "Checkmate",
      confirmClass: "bg-gradient-to-r from-yellow-600 to-yellow-500",
    },
    draw: {
      title: "Confirm Draw",
      description:
        "Are you sure you want to declare a draw? This will end the game.",
      icon: <Handshake className="w-8 h-8 text-blue-500" />,
      confirmText: "Draw",
      confirmClass: "bg-gradient-to-r from-blue-600 to-blue-500",
    },
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
          <div className="flex items-center gap-4 mb-4">
            {content.icon}
            <h2 className="text-xl font-bold text-white">{content.title}</h2>
          </div>
          <p className="text-neutral-300 mb-6">{content.description}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "px-4 py-2 rounded-lg text-white font-medium transition-all",
                "hover:shadow-lg hover:scale-105",
                content.confirmClass
              )}
            >
              {content.confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
