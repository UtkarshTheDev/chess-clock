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
