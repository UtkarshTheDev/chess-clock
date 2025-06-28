import { useCallback, useRef } from "react";

interface GestureHandlers {
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
}

interface GestureOptions {
  doubleTapDelay?: number;
  longPressDelay?: number;
}

export default function useGestures(
  handlers: GestureHandlers,
  options: GestureOptions = {}
) {
  const { doubleTapDelay = 300, longPressDelay = 500 } = options;
  
  const tapCount = useRef<number>(0);
  const singleTapTimeout = useRef<NodeJS.Timeout>();
  const longPressTimeout = useRef<NodeJS.Timeout>();
  const isLongPress = useRef<boolean>(false);

  const clearTimeouts = useCallback(() => {
    if (singleTapTimeout.current) {
      clearTimeout(singleTapTimeout.current);
      singleTapTimeout.current = undefined;
    }
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const handleStart = useCallback(() => {
    isLongPress.current = false;

    // Trigger gesture start callback
    if (handlers.onGestureStart) {
      handlers.onGestureStart();
    }

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimeout.current = setTimeout(() => {
        console.log("Long press detected");
        isLongPress.current = true;
        clearTimeouts();
        tapCount.current = 0;
        handlers.onLongPress!();
      }, longPressDelay);
    }
  }, [handlers.onLongPress, handlers.onGestureStart, longPressDelay, clearTimeouts]);

  const handleEnd = useCallback(() => {
    // Trigger gesture end callback
    if (handlers.onGestureEnd) {
      handlers.onGestureEnd();
    }

    // Clear long press timer
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }

    // If it was a long press, don't process tap
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }

    tapCount.current += 1;

    if (tapCount.current === 1) {
      // First tap - wait for potential second tap
      singleTapTimeout.current = setTimeout(() => {
        if (tapCount.current === 1 && handlers.onSingleTap) {
          console.log("Single tap detected");
          handlers.onSingleTap();
        }
        tapCount.current = 0;
      }, doubleTapDelay);
    } else if (tapCount.current === 2) {
      // Second tap - trigger double tap
      console.log("Double tap detected");
      clearTimeouts();
      tapCount.current = 0;
      if (handlers.onDoubleTap) {
        handlers.onDoubleTap();
      }
    }
  }, [handlers.onSingleTap, handlers.onDoubleTap, handlers.onGestureEnd, doubleTapDelay, clearTimeouts]);

  const handleCancel = useCallback(() => {
    clearTimeouts();
    isLongPress.current = false;
  }, [clearTimeouts]);

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleCancel,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchCancel: handleCancel,
  };
}
