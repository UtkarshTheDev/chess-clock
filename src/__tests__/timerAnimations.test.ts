import {
  calculateHeights,
  ANIMATION_CONFIG,
  springTransition,
  heightVariants,
  positionVariants,
  AnimationState
} from '../utils/timerAnimations';

describe('Timer Animation Utilities', () => {
  describe('ANIMATION_CONFIG', () => {
    test('should have correct animation configuration values', () => {
      expect(ANIMATION_CONFIG.duration).toBe(0.9);
      expect(ANIMATION_CONFIG.easing).toBe("easeInOut");
      expect(ANIMATION_CONFIG.stiffness).toBe(300);
      expect(ANIMATION_CONFIG.damping).toBe(30);
      expect(ANIMATION_CONFIG.mass).toBe(0.8);
    });

    test('should have duration within required range (0.8-1.0 seconds)', () => {
      expect(ANIMATION_CONFIG.duration).toBeGreaterThanOrEqual(0.8);
      expect(ANIMATION_CONFIG.duration).toBeLessThanOrEqual(1.0);
    });
  });

  describe('springTransition', () => {
    test('should have correct spring transition configuration', () => {
      expect(springTransition.type).toBe("spring");
      expect(springTransition.stiffness).toBe(ANIMATION_CONFIG.stiffness);
      expect(springTransition.damping).toBe(ANIMATION_CONFIG.damping);
      expect(springTransition.mass).toBe(ANIMATION_CONFIG.mass);
      expect(springTransition.duration).toBe(ANIMATION_CONFIG.duration);
    });
  });

  describe('calculateHeights', () => {
    describe('when activePlayer is null (default state)', () => {
      test('should return equal heights for both squares', () => {
        const result = calculateHeights(null);
        
        expect(result.topSquareHeight).toBe('36vh'); // 90 * 0.4 = 36
        expect(result.bottomSquareHeight).toBe('36vh'); // 90 * 0.4 = 36
        expect(result.controlsPosition).toBe('center');
      });

      test('should match requirement 5.2: Top(40%) + Bottom(40%)', () => {
        const result = calculateHeights(null);
        
        // Both squares should be 40% of 90vh = 36vh
        expect(result.topSquareHeight).toBe('36vh');
        expect(result.bottomSquareHeight).toBe('36vh');
      });
    });

    describe('when activePlayer is black (top player active)', () => {
      test('should return expanded top square and contracted bottom square', () => {
        const result = calculateHeights('black');
        
        expect(result.topSquareHeight).toBe('63vh'); // 90 * 0.7 = 63
        expect(result.bottomSquareHeight).toBe('18vh'); // 90 * 0.2 = 18
        expect(result.controlsPosition).toBe('bottom');
      });

      test('should match requirement 5.3: Top(70%) + Bottom(20%)', () => {
        const result = calculateHeights('black');
        
        // Top square should be 70% of 90vh = 63vh
        // Bottom square should be 20% of 90vh = 18vh
        expect(result.topSquareHeight).toBe('63vh');
        expect(result.bottomSquareHeight).toBe('18vh');
      });

      test('should position controls below expanded top square', () => {
        const result = calculateHeights('black');
        expect(result.controlsPosition).toBe('bottom');
      });
    });

    describe('when activePlayer is white (bottom player active)', () => {
      test('should return contracted top square and expanded bottom square', () => {
        const result = calculateHeights('white');
        
        expect(result.topSquareHeight).toBe('18vh'); // 90 * 0.2 = 18
        expect(result.bottomSquareHeight).toBe('63vh'); // 90 * 0.7 = 63
        expect(result.controlsPosition).toBe('top');
      });

      test('should match requirement 5.4: Top(20%) + Bottom(70%)', () => {
        const result = calculateHeights('white');
        
        // Top square should be 20% of 90vh = 18vh
        // Bottom square should be 70% of 90vh = 63vh
        expect(result.topSquareHeight).toBe('18vh');
        expect(result.bottomSquareHeight).toBe('63vh');
      });

      test('should position controls above expanded bottom square', () => {
        const result = calculateHeights('white');
        expect(result.controlsPosition).toBe('top');
      });
    });

    describe('height calculations precision', () => {
      test('should use 90% of screen height as base (requirement 5.1)', () => {
        const defaultResult = calculateHeights(null);
        const blackResult = calculateHeights('black');
        const whiteResult = calculateHeights('white');

        // All calculations should be based on 90vh
        // Default: 90 * 0.4 = 36vh each
        expect(defaultResult.topSquareHeight).toBe('36vh');
        expect(defaultResult.bottomSquareHeight).toBe('36vh');

        // Black active: 90 * 0.7 = 63vh, 90 * 0.2 = 18vh
        expect(blackResult.topSquareHeight).toBe('63vh');
        expect(blackResult.bottomSquareHeight).toBe('18vh');

        // White active: 90 * 0.2 = 18vh, 90 * 0.7 = 63vh
        expect(whiteResult.topSquareHeight).toBe('18vh');
        expect(whiteResult.bottomSquareHeight).toBe('63vh');
      });

      test('should maintain total height consistency', () => {
        const testCases = [null, 'black' as const, 'white' as const];
        
        testCases.forEach(activePlayer => {
          const result = calculateHeights(activePlayer);
          const topHeight = parseInt(result.topSquareHeight);
          const bottomHeight = parseInt(result.bottomSquareHeight);
          
          // Total should be 81vh (63+18) for active states
          // or 72vh (36+36) for default state
          const expectedTotal = activePlayer ? 81 : 72; // 63+18=81, 36+36=72
          expect(topHeight + bottomHeight).toBe(expectedTotal);
        });
      });
    });

    describe('return type validation', () => {
      test('should return correct AnimationState interface', () => {
        const result = calculateHeights('black');
        
        expect(result).toHaveProperty('topSquareHeight');
        expect(result).toHaveProperty('bottomSquareHeight');
        expect(result).toHaveProperty('controlsPosition');
        
        expect(typeof result.topSquareHeight).toBe('string');
        expect(typeof result.bottomSquareHeight).toBe('string');
        expect(['center', 'top', 'bottom']).toContain(result.controlsPosition);
      });

      test('should return strings ending with "vh"', () => {
        const testCases = [null, 'black' as const, 'white' as const];
        
        testCases.forEach(activePlayer => {
          const result = calculateHeights(activePlayer);
          expect(result.topSquareHeight).toMatch(/^\d+(\.\d+)?vh$/);
          expect(result.bottomSquareHeight).toMatch(/^\d+(\.\d+)?vh$/);
        });
      });
    });

    describe('edge cases and rapid state changes', () => {
      test('should handle rapid state changes consistently', () => {
        const states = [null, 'black' as const, 'white' as const, null, 'black' as const];
        const results = states.map(state => calculateHeights(state));
        
        // Each call should return consistent results for the same input
        expect(results[0]).toEqual(calculateHeights(null));
        expect(results[1]).toEqual(calculateHeights('black'));
        expect(results[2]).toEqual(calculateHeights('white'));
        expect(results[3]).toEqual(calculateHeights(null));
        expect(results[4]).toEqual(calculateHeights('black'));
      });

      test('should be pure function (no side effects)', () => {
        const initialResult = calculateHeights('black');
        
        // Call multiple times
        calculateHeights('white');
        calculateHeights(null);
        calculateHeights('black');
        
        // Should return same result for same input
        const finalResult = calculateHeights('black');
        expect(finalResult).toEqual(initialResult);
      });
    });
  });

  describe('heightVariants', () => {
    test('should have correct height variants for Framer Motion', () => {
      expect(heightVariants.default.height).toBe('36vh'); // 90 * 0.4
      expect(heightVariants.active.height).toBe('63vh'); // 90 * 0.7
      expect(heightVariants.inactive.height).toBe('18vh'); // 90 * 0.2
    });
  });

  describe('positionVariants', () => {
    test('should have correct position variants for mobile controls', () => {
      expect(positionVariants.center).toEqual({ y: 0, opacity: 1 });
      expect(positionVariants.top).toEqual({ y: -20, opacity: 1 });
      expect(positionVariants.bottom).toEqual({ y: 20, opacity: 1 });
    });

    test('should maintain opacity at 1 for all positions', () => {
      Object.values(positionVariants).forEach(variant => {
        expect(variant.opacity).toBe(1);
      });
    });
  });
});