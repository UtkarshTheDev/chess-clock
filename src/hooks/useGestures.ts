import { useCallback, useRef, useEffect } from "react";

// Define a more specific event type
type GestureEvent = React.MouseEvent | React.TouchEvent;

interface GestureHandlers {
  onSingleTap?: (e: GestureEvent) => void;
  onTwoFingerTap?: (e: GestureEvent) => void;
  onLongPress?: (e: GestureEvent) => void;
  onGestureStart?: (e: GestureEvent) => void;
  onGestureEnd?: (e: GestureEvent) => void;
  onCancel?: (e: GestureEvent) => void;
}

interface GestureOptions {
  longPressDelay?: number;
}

export default function useGestures(
  handlers: GestureHandlers,
  options: GestureOptions = {}
) {
  const { longPressDelay = 500 } = options;
  
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const longPressTimeout = useRef<NodeJS.Timeout>();
  const isLongPress = useRef<boolean>(false);

  const clearTimeouts = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = undefined;
    }
  }, []);

  const handleStart = useCallback((e: GestureEvent) => {
    isLongPress.current = false;

    if ("touches" in e && e.touches.length > 1) {
        // This is a multi-touch event, so we can skip the long press logic
        clearTimeouts();
        return;
    }

    if (handlersRef.current.onGestureStart) {
      handlersRef.current.onGestureStart(e);
    }

    if (handlersRef.current.onLongPress) {
      longPressTimeout.current = setTimeout(() => {
        isLongPress.current = true;
        if (handlersRef.current.onLongPress) {
            handlersRef.current.onLongPress(e);
        }
      }, longPressDelay);
    }
  }, [longPressDelay, clearTimeouts]);

  const handleEnd = useCallback((e: GestureEvent) => {
    if (handlersRef.current.onGestureEnd) {
      handlersRef.current.onGestureEnd(e);
    }

    clearTimeouts();

    if (isLongPress.current) {
      return;
    }

    if ("touches" in e && e.touches.length > 0) {
        // This is a multi-touch gesture that is ending, but not a tap
        return;
    }

    // Check for two-finger tap on touch end
    if ("changedTouches" in e && e.changedTouches.length === 2) {
        if (handlersRef.current.onTwoFingerTap) {
            handlersRef.current.onTwoFingerTap(e);
            return;
        }
    }
    
    // Fallback for single tap
    if (handlersRef.current.onSingleTap) {
        handlersRef.current.onSingleTap(e);
    }
  }, [clearTimeouts]);

  const handleCancel = useCallback((e: GestureEvent) => {
    clearTimeouts();
    isLongPress.current = false;
    if (handlersRef.current.onGestureEnd) {
      handlersRef.current.onGestureEnd(e);
    }
    if (handlersRef.current.onCancel) {
        handlersRef.current.onCancel(e);
    }
  }, [clearTimeouts]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
        // Immediately handle two-finger tap on start
        if (handlersRef.current.onTwoFingerTap) {
            handlersRef.current.onTwoFingerTap(e);
        }
        clearTimeouts();
        return;
    }
    handleStart(e);
  }


  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleCancel,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleEnd,
    onTouchCancel: handleCancel,
  };
}