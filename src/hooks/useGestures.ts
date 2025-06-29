import { useCallback, useRef, useEffect } from "react";

interface GestureHandlers {
  onSingleTap?: () => void;
  onLongPress?: () => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onCancel?: () => void;
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

  const handleStart = useCallback(() => {
    isLongPress.current = false;

    if (handlersRef.current.onGestureStart) {
      handlersRef.current.onGestureStart();
    }

    if (handlersRef.current.onLongPress) {
      longPressTimeout.current = setTimeout(() => {
        isLongPress.current = true;
        if (handlersRef.current.onLongPress) {
            handlersRef.current.onLongPress();
        }
      }, longPressDelay);
    }
  }, [longPressDelay]);

  const handleEnd = useCallback(() => {
    if (handlersRef.current.onGestureEnd) {
      handlersRef.current.onGestureEnd();
    }

    clearTimeout(longPressTimeout.current);

    if (isLongPress.current) {
      return;
    }

    if (handlersRef.current.onSingleTap) {
        handlersRef.current.onSingleTap();
    }
  }, []);

  const handleCancel = useCallback(() => {
    clearTimeouts();
    isLongPress.current = false;
    if (handlersRef.current.onGestureEnd) {
      handlersRef.current.onGestureEnd();
    }
    if (handlersRef.current.onCancel) {
        handlersRef.current.onCancel();
    }
  }, [clearTimeouts]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
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