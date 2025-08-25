export const formatTime = (seconds: number): string => {
  // Always round down to whole seconds for display
  const totalSeconds = Math.floor(seconds);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  // Format based on duration
  if (hours > 0) {
    // Format as H:MM:SS for times over an hour
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    // Format as MM:SS for times under an hour
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
};

// Structured time parts helper for UI rendering
export interface TimeParts {
  hasHours: boolean;
  hours12?: number; // 12-hour formatted hour value when hasHours is true
  minutes: string; // 2-digit minutes
  seconds: string; // 2-digit seconds
}

/**
 * Returns UI-friendly time parts.
 * - Hours are converted to 12-hour format with range 1..12 when present
 * - Minutes/seconds are always zero-padded to 2 digits
 */
export const getTimeParts = (seconds: number): TimeParts => {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const hasHours = hours > 0;
  const hours12 = hasHours ? (((hours - 1) % 12) + 1) : undefined;

  return {
    hasHours,
    hours12,
    minutes: minutes.toString().padStart(2, "0"),
    seconds: remainingSeconds.toString().padStart(2, "0"),
  };
};
