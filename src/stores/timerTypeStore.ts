import { create } from "zustand";
import { ClockConfig } from "@/types/chess";

// Legacy timer types for backward compatibility
export type TimerType = "normal" | "fischer" | "bronstein";

// New timer modes
export type TimerMode = ClockConfig['mode'];

interface TimerTypeState {
  // Current configuration
  config: ClockConfig;

  // Legacy properties for backward compatibility
  type: TimerType;
  increment: number;

  // Actions
  setConfig: (config: ClockConfig) => void;
  setTimerType: (type: TimerType) => void;
  setIncrement: (seconds: number) => void;

  // Helper methods
  getDisplayName: () => string;
  getDescription: () => string;
  getDetailedDisplayName: () => string;
}

// Default configuration
const defaultConfig: ClockConfig = {
  mode: 'SUDDEN_DEATH',
  baseMillis: 15 * 60 * 1000, // 15 minutes
};

export const useTimerTypeStore = create<TimerTypeState>((set, get) => ({
  config: defaultConfig,
  type: "normal", // Legacy
  increment: 0, // Legacy

  setConfig: (config: ClockConfig) => {
    // Update legacy properties for backward compatibility
    let legacyType: TimerType = "normal";
    let legacyIncrement = 0;

    switch (config.mode) {
      case 'SUDDEN_DEATH':
        legacyType = "normal";
        break;
      case 'FISCHER_INCREMENT':
        legacyType = "fischer";
        legacyIncrement = (config.incMillis || 0) / 1000;
        break;
      case 'BRONSTEIN_DELAY':
        legacyType = "bronstein";
        legacyIncrement = (config.delayMillis || 0) / 1000;
        break;
      case 'SIMPLE_DELAY':
      case 'MULTI_STAGE':
        legacyType = "normal"; // No direct legacy equivalent
        break;
    }

    set({
      config,
      type: legacyType,
      increment: legacyIncrement,
    });
  },

  setTimerType: (type: TimerType) => {
    const state = get();
    let newConfig: ClockConfig;

    switch (type) {
      case "normal":
        newConfig = {
          mode: 'SUDDEN_DEATH',
          baseMillis: state.config.baseMillis,
        };
        break;
      case "fischer":
        newConfig = {
          mode: 'FISCHER_INCREMENT',
          baseMillis: state.config.baseMillis,
          incMillis: state.increment * 1000,
        };
        break;
      case "bronstein":
        newConfig = {
          mode: 'BRONSTEIN_DELAY',
          baseMillis: state.config.baseMillis,
          delayMillis: state.increment * 1000,
        };
        break;
    }

    set({
      config: newConfig,
      type,
    });
  },

  setIncrement: (seconds: number) => {
    const state = get();
    const newConfig = { ...state.config };

    if (state.config.mode === 'FISCHER_INCREMENT') {
      newConfig.incMillis = seconds * 1000;
    } else if (state.config.mode === 'BRONSTEIN_DELAY') {
      newConfig.delayMillis = seconds * 1000;
    }

    set({
      config: newConfig,
      increment: seconds,
    });
  },

  getDisplayName: () => {
    const state = get();
    switch (state.config.mode) {
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
  },

  getDescription: () => {
    const state = get();
    const config = state.config;

    switch (config.mode) {
      case 'SUDDEN_DEATH':
        return 'Standard countdown';
      case 'SIMPLE_DELAY':
        return `Delay: ${(config.delayMillis || 0) / 1000}s`;
      case 'BRONSTEIN_DELAY':
        return `Bronstein: ${(config.delayMillis || 0) / 1000}s`;
      case 'FISCHER_INCREMENT':
        return `Increment: +${(config.incMillis || 0) / 1000}s`;
      case 'MULTI_STAGE':
        const stages = config.stages?.length || 0;
        return `${stages} stage${stages !== 1 ? 's' : ''}`;
      default:
        return '';
    }
  },

  getDetailedDisplayName: () => {
    const state = get();
    const config = state.config;

    switch (config.mode) {
      case 'SUDDEN_DEATH':
        return 'Sudden Death';
      case 'SIMPLE_DELAY':
        return `Delay ${(config.delayMillis || 0) / 1000}s`;
      case 'BRONSTEIN_DELAY':
        return `Bronstein ${(config.delayMillis || 0) / 1000}s`;
      case 'FISCHER_INCREMENT':
        return `Fischer +${(config.incMillis || 0) / 1000}s`;
      case 'MULTI_STAGE':
        const hasIncrement = config.incMillis && config.incMillis > 0;
        return hasIncrement ? `Multi-Stage +${config.incMillis / 1000}s` : 'Multi-Stage';
      default:
        return 'Unknown';
    }
  },
}));
