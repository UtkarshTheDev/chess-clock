import { useCallback, useRef } from "react";

export default function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const lastTap = useRef<number>(0);
  const tapCount = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleTap = useCallback(() => {
    const now = Date.now();
    tapCount.current += 1;

    if (tapCount.current === 1) {
      // First tap - start timer
      timeoutRef.current = setTimeout(() => {
        tapCount.current = 0;
      }, delay);
    } else if (tapCount.current === 2) {
      // Second tap - trigger double tap
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      tapCount.current = 0;
      onDoubleTap();
    }
  }, [onDoubleTap, delay]);

  return {
    onTouchStart: handleTap,
    onClick: handleTap,
  };
}
