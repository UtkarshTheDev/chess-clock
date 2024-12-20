import { useCallback, useRef } from "react";

export default function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const lastTap = useRef<number>(0);

  const handleTouchStart = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      onDoubleTap();
    }
    lastTap.current = now;
  }, [onDoubleTap, delay]);

  return {
    onTouchStart: handleTouchStart,
  };
}
