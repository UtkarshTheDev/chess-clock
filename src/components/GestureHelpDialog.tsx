import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface GestureHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const gestures = [
  { action: "Normal Move", gesture: "Single tap the timer", icon: "👆" },
  { action: "Check Move", gesture: "Double tap the timer", icon: "👆👆" },
  { action: "Checkmate", gesture: "Long press the timer", icon: "👆⏱️" },
  { action: "Play/Pause", gesture: "Use control buttons", icon: "⏯️" },
] as const;

export const GestureHelpDialog: React.FC<GestureHelpDialogProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Gestures & Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {gestures.map(({ action, gesture, icon }) => (
                <div
                  key={action}
                  className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-neutral-300">{action}</span>
                  </div>
                  <span className="text-white font-medium text-sm">{gesture}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
