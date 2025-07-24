import { ClockConfig } from "@/types/chess";

// Predefined timer configurations for common tournament formats
export const TIMER_CONFIGS: Record<string, ClockConfig> = {
  // Sudden Death configurations
  BLITZ_3MIN: {
    mode: 'SUDDEN_DEATH',
    baseMillis: 3 * 60 * 1000, // 3 minutes
  },
  
  BLITZ_5MIN: {
    mode: 'SUDDEN_DEATH',
    baseMillis: 5 * 60 * 1000, // 5 minutes
  },
  
  RAPID_15MIN: {
    mode: 'SUDDEN_DEATH',
    baseMillis: 15 * 60 * 1000, // 15 minutes
  },
  
  CLASSICAL_60MIN: {
    mode: 'SUDDEN_DEATH',
    baseMillis: 60 * 60 * 1000, // 60 minutes
  },

  // Simple Delay configurations
  BLITZ_3MIN_5SEC_DELAY: {
    mode: 'SIMPLE_DELAY',
    baseMillis: 3 * 60 * 1000, // 3 minutes
    delayMillis: 5 * 1000, // 5 second delay
  },
  
  RAPID_15MIN_10SEC_DELAY: {
    mode: 'SIMPLE_DELAY',
    baseMillis: 15 * 60 * 1000, // 15 minutes
    delayMillis: 10 * 1000, // 10 second delay
  },

  // Bronstein Delay configurations
  BLITZ_3MIN_3SEC_BRONSTEIN: {
    mode: 'BRONSTEIN_DELAY',
    baseMillis: 3 * 60 * 1000, // 3 minutes
    delayMillis: 3 * 1000, // 3 second Bronstein delay
  },
  
  RAPID_15MIN_5SEC_BRONSTEIN: {
    mode: 'BRONSTEIN_DELAY',
    baseMillis: 15 * 60 * 1000, // 15 minutes
    delayMillis: 5 * 1000, // 5 second Bronstein delay
  },

  // Fischer Increment configurations
  BLITZ_3MIN_2SEC_INC: {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 3 * 60 * 1000, // 3 minutes
    incMillis: 2 * 1000, // 2 second increment
  },
  
  BLITZ_5MIN_3SEC_INC: {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 5 * 60 * 1000, // 5 minutes
    incMillis: 3 * 1000, // 3 second increment
  },
  
  RAPID_15MIN_10SEC_INC: {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 15 * 60 * 1000, // 15 minutes
    incMillis: 10 * 1000, // 10 second increment
  },

  // Multi-Stage configurations
  WORLD_CHAMPIONSHIP: {
    mode: 'MULTI_STAGE',
    baseMillis: 90 * 60 * 1000, // 90 minutes for first 40 moves
    incMillis: 30 * 1000, // 30 second increment from move 1
    stages: [
      {
        afterMoves: 40,
        addMillis: 30 * 60 * 1000, // Add 30 minutes after move 40
      }
    ]
  },
  
  CANDIDATES_TOURNAMENT: {
    mode: 'MULTI_STAGE',
    baseMillis: 100 * 60 * 1000, // 100 minutes for first 40 moves
    stages: [
      {
        afterMoves: 40,
        addMillis: 50 * 60 * 1000, // Add 50 minutes after move 40
        incMillis: 30 * 1000, // 30 second increment from move 41
      }
    ]
  },
  
  CLASSICAL_TOURNAMENT: {
    mode: 'MULTI_STAGE',
    baseMillis: 90 * 60 * 1000, // 90 minutes for first 40 moves
    stages: [
      {
        afterMoves: 40,
        addMillis: 30 * 60 * 1000, // Add 30 minutes after move 40
      },
      {
        afterMoves: 60,
        addMillis: 15 * 60 * 1000, // Add 15 minutes after move 60
        incMillis: 30 * 1000, // 30 second increment from move 61
      }
    ]
  },

  // Online platform popular formats
  LICHESS_BULLET: {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 1 * 60 * 1000, // 1 minute
    incMillis: 1 * 1000, // 1 second increment
  },
  
  CHESS_COM_BLITZ: {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 5 * 60 * 1000, // 5 minutes
    incMillis: 5 * 1000, // 5 second increment
  },
  
  FIDE_RAPID: {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 15 * 60 * 1000, // 15 minutes
    incMillis: 10 * 1000, // 10 second increment
  },
};

// Helper function to get configuration by key
export function getTimerConfig(key: string): ClockConfig | undefined {
  return TIMER_CONFIGS[key];
}

// Helper function to create custom configuration
export function createCustomConfig(
  mode: ClockConfig['mode'],
  baseMinutes: number,
  options: {
    delaySeconds?: number;
    incrementSeconds?: number;
    stages?: Array<{
      afterMoves: number;
      addMinutes: number;
      incrementSeconds?: number;
    }>;
  } = {}
): ClockConfig {
  const config: ClockConfig = {
    mode,
    baseMillis: baseMinutes * 60 * 1000,
  };

  if (options.delaySeconds) {
    config.delayMillis = options.delaySeconds * 1000;
  }

  if (options.incrementSeconds) {
    config.incMillis = options.incrementSeconds * 1000;
  }

  if (options.stages) {
    config.stages = options.stages.map(stage => ({
      afterMoves: stage.afterMoves,
      addMillis: stage.addMinutes * 60 * 1000,
      incMillis: stage.incrementSeconds ? stage.incrementSeconds * 1000 : undefined,
    }));
  }

  return config;
}

// Helper function to format time for display
export function formatConfigTime(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  } else if (seconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
}

// Helper function to get display name for timer mode
export function getTimerModeDisplayName(mode: ClockConfig['mode']): string {
  switch (mode) {
    case 'SUDDEN_DEATH':
      return 'Sudden Death';
    case 'SIMPLE_DELAY':
      return 'Simple Delay';
    case 'BRONSTEIN_DELAY':
      return 'Bronstein Delay';
    case 'FISCHER_INCREMENT':
      return 'Fischer Increment';
    case 'MULTI_STAGE':
      return 'Multi-Stage';
    default:
      return 'Unknown';
  }
}
