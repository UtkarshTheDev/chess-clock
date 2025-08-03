import {
  TIMER_CONFIGS,
  getTimerConfig,
  createCustomConfig,
  formatConfigTime,
  getTimerModeDisplayName
} from '../lib/timerConfigs';

describe('Timer Configurations', () => {
  describe('TIMER_CONFIGS', () => {
    test('should contain all expected configurations', () => {
      const expectedConfigs = [
        'BLITZ_3MIN',
        'BLITZ_5MIN',
        'RAPID_15MIN',
        'CLASSICAL_60MIN',
        'BLITZ_3MIN_5SEC_DELAY',
        'RAPID_15MIN_10SEC_DELAY',
        'BLITZ_3MIN_3SEC_BRONSTEIN',
        'RAPID_15MIN_5SEC_BRONSTEIN',
        'BLITZ_3MIN_2SEC_INC',
        'BLITZ_5MIN_3SEC_INC',
        'RAPID_15MIN_10SEC_INC',
        'WORLD_CHAMPIONSHIP',
        'CANDIDATES_TOURNAMENT',
        'CLASSICAL_TOURNAMENT',
        'LICHESS_BULLET',
        'CHESS_COM_BLITZ',
        'FIDE_RAPID',
      ];

      expectedConfigs.forEach(configKey => {
        expect(TIMER_CONFIGS[configKey]).toBeDefined();
      });
    });

    test('should have correct sudden death configurations', () => {
      expect(TIMER_CONFIGS.BLITZ_3MIN).toEqual({
        mode: 'SUDDEN_DEATH',
        baseMillis: 3 * 60 * 1000,
      });

      expect(TIMER_CONFIGS.CLASSICAL_60MIN).toEqual({
        mode: 'SUDDEN_DEATH',
        baseMillis: 60 * 60 * 1000,
      });
    });

    test('should have correct delay configurations', () => {
      expect(TIMER_CONFIGS.BLITZ_3MIN_5SEC_DELAY).toEqual({
        mode: 'SIMPLE_DELAY',
        baseMillis: 3 * 60 * 1000,
        delayMillis: 5 * 1000,
      });

      expect(TIMER_CONFIGS.BLITZ_3MIN_3SEC_BRONSTEIN).toEqual({
        mode: 'BRONSTEIN_DELAY',
        baseMillis: 3 * 60 * 1000,
        delayMillis: 3 * 1000,
      });
    });

    test('should have correct increment configurations', () => {
      expect(TIMER_CONFIGS.BLITZ_3MIN_2SEC_INC).toEqual({
        mode: 'FISCHER_INCREMENT',
        baseMillis: 3 * 60 * 1000,
        incMillis: 2 * 1000,
      });

      expect(TIMER_CONFIGS.LICHESS_BULLET).toEqual({
        mode: 'FISCHER_INCREMENT',
        baseMillis: 1 * 60 * 1000,
        incMillis: 1 * 1000,
      });
    });

    test('should have correct multi-stage configurations', () => {
      expect(TIMER_CONFIGS.WORLD_CHAMPIONSHIP).toEqual({
        mode: 'MULTI_STAGE',
        baseMillis: 90 * 60 * 1000,
        incMillis: 30 * 1000,
        stages: [
          {
            afterMoves: 40,
            addMillis: 30 * 60 * 1000,
          }
        ]
      });

      expect(TIMER_CONFIGS.CLASSICAL_TOURNAMENT).toEqual({
        mode: 'MULTI_STAGE',
        baseMillis: 90 * 60 * 1000,
        stages: [
          {
            afterMoves: 40,
            addMillis: 30 * 60 * 1000,
          },
          {
            afterMoves: 60,
            addMillis: 15 * 60 * 1000,
            incMillis: 30 * 1000,
          }
        ]
      });
    });
  });

  describe('getTimerConfig', () => {
    test('should return correct configuration for valid key', () => {
      const config = getTimerConfig('BLITZ_5MIN');
      expect(config).toEqual({
        mode: 'SUDDEN_DEATH',
        baseMillis: 5 * 60 * 1000,
      });
    });

    test('should return undefined for invalid key', () => {
      const config = getTimerConfig('INVALID_KEY');
      expect(config).toBeUndefined();
    });
  });

  describe('createCustomConfig', () => {
    test('should create sudden death configuration', () => {
      const config = createCustomConfig('SUDDEN_DEATH', 10);
      expect(config).toEqual({
        mode: 'SUDDEN_DEATH',
        baseMillis: 10 * 60 * 1000,
      });
    });

    test('should create simple delay configuration', () => {
      const config = createCustomConfig('SIMPLE_DELAY', 5, { delaySeconds: 3 });
      expect(config).toEqual({
        mode: 'SIMPLE_DELAY',
        baseMillis: 5 * 60 * 1000,
        delayMillis: 3 * 1000,
      });
    });

    test('should create Bronstein delay configuration', () => {
      const config = createCustomConfig('BRONSTEIN_DELAY', 15, { delaySeconds: 5 });
      expect(config).toEqual({
        mode: 'BRONSTEIN_DELAY',
        baseMillis: 15 * 60 * 1000,
        delayMillis: 5 * 1000,
      });
    });

    test('should create Fischer increment configuration', () => {
      const config = createCustomConfig('FISCHER_INCREMENT', 3, { incrementSeconds: 2 });
      expect(config).toEqual({
        mode: 'FISCHER_INCREMENT',
        baseMillis: 3 * 60 * 1000,
        incMillis: 2 * 1000,
      });
    });

    test('should create multi-stage configuration', () => {
      const config = createCustomConfig('MULTI_STAGE', 90, {
        incrementSeconds: 30,
        stages: [
          { afterMoves: 40, addMinutes: 30 },
          { afterMoves: 60, addMinutes: 15, incrementSeconds: 30 }
        ]
      });

      expect(config).toEqual({
        mode: 'MULTI_STAGE',
        baseMillis: 90 * 60 * 1000,
        incMillis: 30 * 1000,
        stages: [
          {
            afterMoves: 40,
            addMillis: 30 * 60 * 1000,
            incMillis: undefined,
          },
          {
            afterMoves: 60,
            addMillis: 15 * 60 * 1000,
            incMillis: 30 * 1000,
          }
        ]
      });
    });

    test('should create configuration with no options', () => {
      const config = createCustomConfig('SUDDEN_DEATH', 20);
      expect(config).toEqual({
        mode: 'SUDDEN_DEATH',
        baseMillis: 20 * 60 * 1000,
      });
    });
  });

  describe('formatConfigTime', () => {
    test('should format seconds only', () => {
      expect(formatConfigTime(5000)).toBe('5s');
      expect(formatConfigTime(30000)).toBe('30s');
    });

    test('should format minutes only', () => {
      expect(formatConfigTime(60000)).toBe('1m');
      expect(formatConfigTime(300000)).toBe('5m');
      expect(formatConfigTime(3600000)).toBe('60m');
    });

    test('should format minutes and seconds', () => {
      expect(formatConfigTime(65000)).toBe('1m 5s');
      expect(formatConfigTime(125000)).toBe('2m 5s');
      expect(formatConfigTime(3665000)).toBe('61m 5s');
    });

    test('should handle zero time', () => {
      expect(formatConfigTime(0)).toBe('0s');
    });
  });

  describe('getTimerModeDisplayName', () => {
    test('should return correct display names', () => {
      expect(getTimerModeDisplayName('SUDDEN_DEATH')).toBe('Sudden Death');
      expect(getTimerModeDisplayName('SIMPLE_DELAY')).toBe('Simple Delay');
      expect(getTimerModeDisplayName('BRONSTEIN_DELAY')).toBe('Bronstein Delay');
      expect(getTimerModeDisplayName('FISCHER_INCREMENT')).toBe('Fischer Increment');
      expect(getTimerModeDisplayName('MULTI_STAGE')).toBe('Multi-Stage');
    });

    test('should handle unknown mode', () => {
      // Testing runtime behavior with invalid mode parameter
      type InvalidMode = 'UNKNOWN_MODE';
      expect(getTimerModeDisplayName('UNKNOWN_MODE' as InvalidMode as Parameters<typeof getTimerModeDisplayName>[0])).toBe('Unknown');
    });
  });

  describe('Configuration Validation', () => {
    test('all predefined configurations should be valid', () => {
      Object.values(TIMER_CONFIGS).forEach(config => {
        expect(config.mode).toBeDefined();
        expect(config.baseMillis).toBeGreaterThan(0);
        
        if (config.delayMillis !== undefined) {
          expect(config.delayMillis).toBeGreaterThan(0);
        }
        
        if (config.incMillis !== undefined) {
          expect(config.incMillis).toBeGreaterThan(0);
        }
        
        if (config.stages) {
          config.stages.forEach((stage: { afterMoves: number; addMillis: number; incMillis?: number }) => {
            expect(stage.afterMoves).toBeGreaterThan(0);
            expect(stage.addMillis).toBeGreaterThan(0);
            if (stage.incMillis !== undefined) {
              expect(stage.incMillis).toBeGreaterThan(0);
            }
          });
        }
      });
    });

    test('tournament configurations should follow FIDE standards', () => {
      // World Championship format
      const worldChamp = TIMER_CONFIGS.WORLD_CHAMPIONSHIP;
      expect(worldChamp.baseMillis).toBe(90 * 60 * 1000); // 90 minutes
      expect(worldChamp.incMillis).toBe(30 * 1000); // 30 second increment
      expect(worldChamp.stages).toHaveLength(1);
      expect(worldChamp.stages![0].afterMoves).toBe(40);
      expect(worldChamp.stages![0].addMillis).toBe(30 * 60 * 1000); // 30 minutes

      // FIDE Rapid format
      const fideRapid = TIMER_CONFIGS.FIDE_RAPID;
      expect(fideRapid.baseMillis).toBe(15 * 60 * 1000); // 15 minutes
      expect(fideRapid.incMillis).toBe(10 * 1000); // 10 second increment
    });
  });
});
