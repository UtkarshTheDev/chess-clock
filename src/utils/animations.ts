import { animate } from "motion/react";

export const playPhaseTransition = async (
  element: HTMLElement,
  color: string
) => {
  await animate(
    element,
    { borderColor: [element.style.borderColor, color, color] },
    { duration: 0.5, ease: "easeInOut" }
  );
};

export const playCheckAnimation = async (element: HTMLElement) => {
  await animate(
    element,
    { scale: [1, 1.05, 1] },
    { duration: 0.3, ease: "easeInOut" }
  );
};

export const playCheckmateAnimation = async () => {
  // Import and use canvas-confetti for victory animation
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};
