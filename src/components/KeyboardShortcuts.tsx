import { motion } from "motion/react";

const shortcuts = [
  { key: "Space", action: "Normal Move" },
  { key: "Enter", action: "Check Move" },
  { key: "Tab", action: "Checkmate" },
  { key: "P", action: "Play/Pause" },
] as const;

export const KeyboardShortcuts: React.FC = () => {
  return (
    <motion.div
      className="flex gap-6 px-6 py-3 rounded-xl bg-black/20 backdrop-blur-md"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {shortcuts.map(({ key, action }) => (
        <motion.div
          key={key}
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-neutral-400">{action}:</span>
          <kbd className="px-2 py-1 rounded bg-neutral-800 text-white font-mono text-sm">
            {key}
          </kbd>
        </motion.div>
      ))}
    </motion.div>
  );
};
