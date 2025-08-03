import { ChessTimerEngine } from '../lib/timerEngine';
import { ClockConfig } from '../types/chess';

// Mock timers for testing
jest.useFakeTimers();

describe('ChessTimerEngine', () => {
  let engine: ChessTimerEngine;
  let mockStateChange: jest.Mock;
  let mockTimeout: jest.Mock;

  const suddenDeathConfig: ClockConfig = {
    mode: 'SUDDEN_DEATH',
    baseMillis: 5 * 60 * 1000, // 5 minutes
  };

  const fischerConfig: ClockConfig = {
    mode: 'FISCHER_INCREMENT',
    baseMillis: 3 * 60 * 1000, // 3 minutes
    incMillis: 2 * 1000, // 2 second increment
  };

  beforeEach(() => {
    mockStateChange = jest.fn();
    mockTimeout = jest.fn();
    engine = new ChessTimerEngine(suddenDeathConfig, mockStateChange, mockTimeout);
  });

  afterEach(() => {
    engine.destroy();
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    test('should initialize with correct state', () => {
      const state = engine.getState();
      expect(state.whiteTimeRemaining).toBe(300); // 5 minutes
      expect(state.blackTimeRemaining).toBe(300);
      expect(state.isRunning).toBe(false);
      expect(state.activePlayer).toBeNull();
      expect(state.config).toEqual(suddenDeathConfig);
    });

    test('should call state change callback on initialization', () => {
      expect(mockStateChange).toHaveBeenCalled();
    });
  });

  describe('Timer Control', () => {
    test('should start timer correctly', () => {
      engine.start('white');
      const state = engine.getState();
      
      expect(state.isRunning).toBe(true);
      expect(state.activePlayer).toBe('white');
      expect(mockStateChange).toHaveBeenCalled();
    });

    test('should pause timer correctly', () => {
      engine.start('white');
      engine.pause();
      const state = engine.getState();
      
      expect(state.isRunning).toBe(false);
      expect(state.activePlayer).toBe('white'); // Player remains the same
    });

    test('should resume timer correctly', () => {
      engine.start('white');
      engine.pause();
      engine.resume();
      const state = engine.getState();
      
      expect(state.isRunning).toBe(true);
      expect(state.activePlayer).toBe('white');
    });

    test('should not start if already running', () => {
      engine.start('white');

      engine.start('black'); // Should be ignored
      const stateAfter = engine.getState();
      
      expect(stateAfter.activePlayer).toBe('white'); // Should remain white
      expect(stateAfter.isRunning).toBe(true);
    });
  });

  describe('Player Switching', () => {
    test('should switch players correctly', () => {
      engine.start('white');
      engine.switchPlayer();
      const state = engine.getState();
      
      expect(state.activePlayer).toBe('black');
      expect(state.whiteMoveCount).toBe(1);
    });

    test('should not switch if timer is not running', () => {
      engine.switchPlayer(); // Timer not started
      const state = engine.getState();
      
      expect(state.activePlayer).toBeNull();
      expect(state.whiteMoveCount).toBe(0);
    });

    test('should handle Fischer increment on player switch', () => {
      const fischerEngine = new ChessTimerEngine(fischerConfig, mockStateChange, mockTimeout);
      fischerEngine.start('white');
      
      // Simulate some time passing
      jest.advanceTimersByTime(10000); // 10 seconds
      
      fischerEngine.switchPlayer();
      const state = fischerEngine.getState();
      
      expect(state.activePlayer).toBe('black');
      expect(state.whiteTimeRemaining).toBe(172); // 180 - 10 + 2 (increment)
      
      fischerEngine.destroy();
    });
  });

  describe('Time Management', () => {
    test('should countdown time correctly', () => {
      engine.start('white');
      
      // Advance time by 5 seconds
      jest.advanceTimersByTime(5000);
      
      const state = engine.getState();
      expect(state.whiteTimeRemaining).toBe(295); // 300 - 5
      expect(state.blackTimeRemaining).toBe(300); // Unchanged
    });

    test('should handle timeout correctly', () => {
      engine.start('white');
      
      // Advance time beyond available time
      jest.advanceTimersByTime(301000); // 301 seconds
      
      expect(mockTimeout).toHaveBeenCalledWith('white');
      const state = engine.getState();
      expect(state.isRunning).toBe(false);
    });

    test('should add time correctly', () => {
      engine.addTime('white', 30);
      const state = engine.getState();
      expect(state.whiteTimeRemaining).toBe(330); // 300 + 30
    });

    test('should set time correctly', () => {
      engine.setTime('black', 600);
      const state = engine.getState();
      expect(state.blackTimeRemaining).toBe(600);
    });
  });

  describe('Display Info', () => {
    test('should return correct display info for sudden death', () => {
      const displayInfo = engine.getDisplayInfo('white');
      expect(displayInfo.mainTime).toBe(300);
      expect(displayInfo.delayTime).toBeUndefined();
      expect(displayInfo.pendingIncrement).toBeUndefined();
    });

    test('should return correct display info for Fischer increment', () => {
      const fischerEngine = new ChessTimerEngine(fischerConfig, mockStateChange, mockTimeout);
      const displayInfo = fischerEngine.getDisplayInfo('white');
      
      expect(displayInfo.mainTime).toBe(180); // 3 minutes
      expect(displayInfo.pendingIncrement).toBe(2);
      
      fischerEngine.destroy();
    });
  });

  describe('Reset Functionality', () => {
    test('should reset to initial state', () => {
      engine.start('white');
      jest.advanceTimersByTime(10000); // 10 seconds
      engine.switchPlayer();
      
      engine.reset();
      const state = engine.getState();
      
      expect(state.whiteTimeRemaining).toBe(300);
      expect(state.blackTimeRemaining).toBe(300);
      expect(state.isRunning).toBe(false);
      expect(state.activePlayer).toBeNull();
      expect(state.whiteMoveCount).toBe(0);
      expect(state.blackMoveCount).toBe(0);
    });

    test('should reset with new configuration', () => {
      const newConfig: ClockConfig = {
        mode: 'FISCHER_INCREMENT',
        baseMillis: 10 * 60 * 1000, // 10 minutes
        incMillis: 5 * 1000, // 5 second increment
      };
      
      engine.reset(newConfig);
      const state = engine.getState();
      
      expect(state.whiteTimeRemaining).toBe(600); // 10 minutes
      expect(state.config).toEqual(newConfig);
    });
  });

  describe('Utility Methods', () => {
    test('should return correct move count', () => {
      engine.start('white');
      engine.switchPlayer(); // White move 1
      engine.switchPlayer(); // Black move 1
      
      expect(engine.getMoveCount('white')).toBe(1);
      expect(engine.getMoveCount('black')).toBe(1);
    });

    test('should return correct stage index', () => {
      expect(engine.getCurrentStage('white')).toBe(0);
      expect(engine.getCurrentStage('black')).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid player switches', () => {
      engine.start('white');
      
      // Rapid switches
      for (let i = 0; i < 10; i++) {
        engine.switchPlayer();
      }
      
      const state = engine.getState();
      expect(state.whiteMoveCount).toBe(5);
      expect(state.blackMoveCount).toBe(5);
      expect(state.activePlayer).toBe('white'); // Should end on white
    });

    test('should handle pause/resume cycles', () => {
      engine.start('white');
      jest.advanceTimersByTime(5000); // 5 seconds
      
      engine.pause();
      jest.advanceTimersByTime(10000); // 10 seconds (should not count)
      
      engine.resume();
      jest.advanceTimersByTime(3000); // 3 seconds
      
      const state = engine.getState();
      expect(state.whiteTimeRemaining).toBe(292); // 300 - 5 - 3 = 292
    });

    test('should handle destroy correctly', () => {
      engine.start('white');
      engine.destroy();

      // Timer should stop ticking
      jest.advanceTimersByTime(10000);
      const state = engine.getState();
      expect(state.whiteTimeRemaining).toBe(300); // Should not have changed
    });
  });

  describe('Simple Delay Mode', () => {
    test('should handle delay correctly', () => {
      const delayConfig: ClockConfig = {
        mode: 'SIMPLE_DELAY',
        baseMillis: 3 * 60 * 1000, // 3 minutes
        delayMillis: 5 * 1000, // 5 second delay
      };

      const delayEngine = new ChessTimerEngine(delayConfig, mockStateChange, mockTimeout);
      delayEngine.start('white');

      // During delay period, main time should not decrease
      jest.advanceTimersByTime(3000); // 3 seconds
      let state = delayEngine.getState();
      expect(state.whiteTimeRemaining).toBe(180); // Should remain 180
      expect(state.whiteDelayRemaining).toBe(2); // Delay should decrease

      // After delay expires, main time should decrease
      jest.advanceTimersByTime(3000); // 3 more seconds (total 6, delay expired after 5)
      state = delayEngine.getState();
      expect(state.whiteTimeRemaining).toBe(179); // 180 - 1 second after delay
      expect(state.whiteDelayRemaining).toBe(0);

      delayEngine.destroy();
    });
  });

  describe('Multi-Stage Mode', () => {
    test('should handle stage transitions', () => {
      const multiStageConfig: ClockConfig = {
        mode: 'MULTI_STAGE',
        baseMillis: 90 * 60 * 1000, // 90 minutes
        incMillis: 30 * 1000, // 30 second increment
        stages: [
          {
            afterMoves: 2, // Small number for testing
            addMillis: 30 * 60 * 1000, // Add 30 minutes
          }
        ]
      };

      const multiEngine = new ChessTimerEngine(multiStageConfig, mockStateChange, mockTimeout);
      multiEngine.start('white');

      // Make moves to trigger stage transition
      multiEngine.switchPlayer(); // White move 1
      multiEngine.switchPlayer(); // Black move 1, White move 2 (should trigger stage)

      const state = multiEngine.getState();
      expect(state.whiteStageIndex).toBe(1); // Advanced to next stage
      expect(state.whiteTimeRemaining).toBeGreaterThan(5400); // Should have added time + increment

      multiEngine.destroy();
    });
  });
});
