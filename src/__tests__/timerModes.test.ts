import { 
  SuddenDeathHandler, 
  SimpleDelayHandler, 
  BronsteinDelayHandler, 
  FischerIncrementHandler, 
  MultiStageHandler,
  createTimerModeHandler 
} from '../lib/timerModes';
import { TimerState, ClockConfig } from '../types/chess';

// Helper function to create a basic timer state
const createTimerState = (config: ClockConfig): TimerState => ({
  whiteTimeRemaining: config.baseMillis / 1000,
  blackTimeRemaining: config.baseMillis / 1000,
  isRunning: false,
  activePlayer: null,
  config,
  whiteMoveCount: 0,
  blackMoveCount: 0,
  whiteStageIndex: 0,
  blackStageIndex: 0,
  lastMoveStartTime: null,
  moveStartTime: null,
  initialTime: config.baseMillis / 1000,
});

describe('Timer Mode Handlers', () => {
  describe('SuddenDeathHandler', () => {
    let handler: SuddenDeathHandler;
    let state: TimerState;

    beforeEach(() => {
      handler = new SuddenDeathHandler();
      state = createTimerState({
        mode: 'SUDDEN_DEATH',
        baseMillis: 5 * 60 * 1000, // 5 minutes
      });
    });

    test('should start move correctly', () => {
      const updates = handler.onMoveStart('white', state);
      expect(updates.moveStartTime).toBeDefined();
      expect(typeof updates.moveStartTime).toBe('number');
    });

    test('should complete move and increment move count', () => {
      const updates = handler.onMoveComplete('white', 10, state);
      expect(updates.whiteMoveCount).toBe(1);
      expect(updates.moveStartTime).toBeNull();
    });

    test('should not modify time on tick', () => {
      const updates = handler.onTick('white', state);
      expect(Object.keys(updates)).toHaveLength(0);
    });

    test('should return correct display info', () => {
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(300); // 5 minutes in seconds
      expect(displayInfo.delayTime).toBeUndefined();
      expect(displayInfo.pendingIncrement).toBeUndefined();
    });
  });

  describe('SimpleDelayHandler', () => {
    let handler: SimpleDelayHandler;
    let state: TimerState;

    beforeEach(() => {
      handler = new SimpleDelayHandler();
      state = createTimerState({
        mode: 'SIMPLE_DELAY',
        baseMillis: 5 * 60 * 1000, // 5 minutes
        delayMillis: 5 * 1000, // 5 second delay
      });
    });

    test('should start move with delay', () => {
      const updates = handler.onMoveStart('white', state);
      expect(updates.moveStartTime).toBeDefined();
      expect(updates.whiteDelayRemaining).toBe(5);
    });

    test('should complete move and clear delay', () => {
      state.whiteDelayRemaining = 3;
      const updates = handler.onMoveComplete('white', 10, state);
      expect(updates.whiteMoveCount).toBe(1);
      expect(updates.whiteDelayRemaining).toBeUndefined();
      expect(updates.moveStartTime).toBeNull();
    });

    test('should countdown delay during tick', () => {
      state.whiteDelayRemaining = 3;
      const updates = handler.onTick('white', state);
      expect(updates.whiteDelayRemaining).toBe(2);
    });

    test('should not countdown delay when delay is zero', () => {
      state.whiteDelayRemaining = 0;
      const updates = handler.onTick('white', state);
      expect(Object.keys(updates)).toHaveLength(0);
    });

    test('should return correct display info during delay', () => {
      state.whiteDelayRemaining = 3;
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(300);
      expect(displayInfo.delayTime).toBe(3);
      expect(displayInfo.isInDelay).toBe(true);
    });

    test('should return correct display info when delay expired', () => {
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(300);
      expect(displayInfo.delayTime).toBeUndefined();
      expect(displayInfo.isInDelay).toBe(false);
    });
  });

  describe('BronsteinDelayHandler', () => {
    let handler: BronsteinDelayHandler;
    let state: TimerState;

    beforeEach(() => {
      handler = new BronsteinDelayHandler();
      state = createTimerState({
        mode: 'BRONSTEIN_DELAY',
        baseMillis: 5 * 60 * 1000, // 5 minutes
        delayMillis: 3 * 1000, // 3 second delay
      });
    });

    test('should start move correctly', () => {
      const updates = handler.onMoveStart('white', state);
      expect(updates.moveStartTime).toBeDefined();
    });

    test('should add compensation time up to delay limit', () => {
      state.whiteTimeRemaining = 290; // 10 seconds used
      const updates = handler.onMoveComplete('white', 2, state); // 2 second move
      expect(updates.whiteTimeRemaining).toBe(292); // 290 + 2 seconds compensation
      expect(updates.whiteMoveCount).toBe(1);
    });

    test('should limit compensation to delay amount', () => {
      state.whiteTimeRemaining = 290; // 10 seconds used
      const updates = handler.onMoveComplete('white', 5, state); // 5 second move (longer than 3s delay)
      expect(updates.whiteTimeRemaining).toBe(293); // 290 + 3 seconds max compensation
    });

    test('should not modify time on tick', () => {
      const updates = handler.onTick('white', state);
      expect(Object.keys(updates)).toHaveLength(0);
    });

    test('should return correct display info', () => {
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(300);
      expect(displayInfo.delayTime).toBe(3);
    });
  });

  describe('FischerIncrementHandler', () => {
    let handler: FischerIncrementHandler;
    let state: TimerState;

    beforeEach(() => {
      handler = new FischerIncrementHandler();
      state = createTimerState({
        mode: 'FISCHER_INCREMENT',
        baseMillis: 5 * 60 * 1000, // 5 minutes
        incMillis: 5 * 1000, // 5 second increment
      });
    });

    test('should start move correctly', () => {
      const updates = handler.onMoveStart('white', state);
      expect(updates.moveStartTime).toBeDefined();
    });

    test('should add increment after move', () => {
      state.whiteTimeRemaining = 290; // 10 seconds used
      const updates = handler.onMoveComplete('white', 10, state);
      expect(updates.whiteTimeRemaining).toBe(295); // 290 + 5 seconds increment
      expect(updates.whiteMoveCount).toBe(1);
    });

    test('should not modify time on tick', () => {
      const updates = handler.onTick('white', state);
      expect(Object.keys(updates)).toHaveLength(0);
    });

    test('should return correct display info', () => {
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(300);
      expect(displayInfo.pendingIncrement).toBe(5);
    });
  });

  describe('MultiStageHandler', () => {
    let handler: MultiStageHandler;
    let state: TimerState;

    beforeEach(() => {
      handler = new MultiStageHandler();
      state = createTimerState({
        mode: 'MULTI_STAGE',
        baseMillis: 90 * 60 * 1000, // 90 minutes
        incMillis: 30 * 1000, // 30 second increment
        stages: [
          {
            afterMoves: 40,
            addMillis: 30 * 60 * 1000, // Add 30 minutes after move 40
          }
        ]
      });
    });

    test('should start move correctly', () => {
      const updates = handler.onMoveStart('white', state);
      expect(updates.moveStartTime).toBeDefined();
    });

    test('should add increment during normal moves', () => {
      state.whiteTimeRemaining = 5000; // Some time remaining
      state.whiteMoveCount = 20; // Before stage transition
      const updates = handler.onMoveComplete('white', 30, state);
      expect(updates.whiteTimeRemaining).toBe(5030); // Added 30 second increment
      expect(updates.whiteMoveCount).toBe(21);
    });

    test('should trigger stage transition at correct move count', () => {
      state.whiteTimeRemaining = 1000; // Some time remaining
      state.whiteMoveCount = 39; // Move 40 will trigger stage transition
      const updates = handler.onMoveComplete('white', 30, state);
      expect(updates.whiteMoveCount).toBe(40);
      expect(updates.whiteStageIndex).toBe(1); // Advanced to next stage
      expect(updates.whiteTimeRemaining).toBe(2830); // 1000 + 1800 (30 min) + 30 (increment)
    });

    test('should return correct display info before stage transition', () => {
      state.whiteMoveCount = 35;
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(5400); // 90 minutes
      expect(displayInfo.pendingIncrement).toBe(30);
      expect(displayInfo.stageInfo).toContain('5 moves'); // 40 - 35 = 5 moves until stage
    });

    test('should return correct display info after stage transition', () => {
      state.whiteMoveCount = 45;
      state.whiteStageIndex = 1; // After stage transition
      const displayInfo = handler.getDisplayInfo('white', state);
      expect(displayInfo.mainTime).toBe(5400);
      expect(displayInfo.pendingIncrement).toBe(30);
      expect(displayInfo.stageInfo).toBeUndefined(); // No more stages
    });
  });

  describe('createTimerModeHandler', () => {
    test('should create correct handler for each mode', () => {
      expect(createTimerModeHandler('SUDDEN_DEATH')).toBeInstanceOf(SuddenDeathHandler);
      expect(createTimerModeHandler('SIMPLE_DELAY')).toBeInstanceOf(SimpleDelayHandler);
      expect(createTimerModeHandler('BRONSTEIN_DELAY')).toBeInstanceOf(BronsteinDelayHandler);
      expect(createTimerModeHandler('FISCHER_INCREMENT')).toBeInstanceOf(FischerIncrementHandler);
      expect(createTimerModeHandler('MULTI_STAGE')).toBeInstanceOf(MultiStageHandler);
    });

    test('should throw error for unknown mode', () => {
      expect(() => createTimerModeHandler('UNKNOWN_MODE')).toThrow('Unknown timer mode: UNKNOWN_MODE');
    });
  });
});
