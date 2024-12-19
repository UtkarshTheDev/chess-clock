import { useCallback, useRef } from "react";

export default function useLongPress(callback: () => void, ms = 500) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const start = useCallback(() => {
    timeoutRef.current = setTimeout(callback, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: stop,
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
  };
}
