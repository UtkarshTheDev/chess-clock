/**
 * Timer Animation Utilities
 * 
 * This module provides animation configuration constants and height calculation logic
 * for dynamic timer square animations in mobile view.
 */

// Animation configuration interface
export interface AnimationConfig {
  duration: number; // 0.8-1.0 seconds
  easing: string; // "easeInOut" or custom cubic-bezier
  stiffness: number; // Spring physics parameter
  damping: number; // Spring physics parameter
  mass: number; // Spring physics parameter
}

// Animation configuration constants
export const ANIMATION_CONFIG: AnimationConfig = {
  duration: 0.9,
  easing: "easeInOut",
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

// Spring transition configuration for Framer Motion
export const springTransition = {
  type: "spring" as const,
  stiffness: ANIMATION_CONFIG.stiffness,
  damping: ANIMATION_CONFIG.damping,
  mass: ANIMATION_CONFIG.mass,
  duration: ANIMATION_CONFIG.duration
};

// Animation state interface
export interface AnimationState {
  topSquareHeight: string;
  bottomSquareHeight: string;
  controlsPosition: 'center' | 'top' | 'bottom';
}

// Height calculation constants
const BASE_HEIGHT = 90; // 90vh total, 10vh reserved for margins
const DEFAULT_HEIGHT_RATIO = 0.4; // 40% for each square in default state
const ACTIVE_HEIGHT_RATIO = 0.7; // 70% for active player square
const INACTIVE_HEIGHT_RATIO = 0.2; // 20% for inactive player square

/**
 * Calculates height values and controls position based on active player state
 * 
 * @param activePlayer - The currently active player ('white', 'black', or null)
 * @returns AnimationState object with height values and controls position
 */
export const calculateHeights = (activePlayer: 'white' | 'black' | null): AnimationState => {
  // Helper function to round and format height values
  const formatHeight = (ratio: number): string => {
    return `${Math.round(BASE_HEIGHT * ratio)}vh`;
  };

  // Default state: both squares at 40% height, controls centered
  if (!activePlayer) {
    return {
      topSquareHeight: formatHeight(DEFAULT_HEIGHT_RATIO), // 36vh
      bottomSquareHeight: formatHeight(DEFAULT_HEIGHT_RATIO), // 36vh
      controlsPosition: 'center'
    };
  }
  
  // Top player (black) active: top square 70%, bottom square 20%
  if (activePlayer === 'black') {
    return {
      topSquareHeight: formatHeight(ACTIVE_HEIGHT_RATIO), // 63vh
      bottomSquareHeight: formatHeight(INACTIVE_HEIGHT_RATIO), // 18vh
      controlsPosition: 'bottom'
    };
  }
  
  // Bottom player (white) active: top square 20%, bottom square 70%
  return {
    topSquareHeight: formatHeight(INACTIVE_HEIGHT_RATIO), // 18vh
    bottomSquareHeight: formatHeight(ACTIVE_HEIGHT_RATIO), // 63vh
    controlsPosition: 'top'
  };
};

// Height variants for Framer Motion
export const heightVariants = {
  default: { height: `${Math.round(BASE_HEIGHT * DEFAULT_HEIGHT_RATIO)}vh` },
  active: { height: `${Math.round(BASE_HEIGHT * ACTIVE_HEIGHT_RATIO)}vh` },
  inactive: { height: `${Math.round(BASE_HEIGHT * INACTIVE_HEIGHT_RATIO)}vh` }
};

// Position variants for mobile controls
export const positionVariants = {
  center: { y: 0, opacity: 1 },
  top: { y: -20, opacity: 1 },
  bottom: { y: 20, opacity: 1 }
};