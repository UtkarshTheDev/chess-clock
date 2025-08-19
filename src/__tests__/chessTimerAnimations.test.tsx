/**
 * Integration tests for ChessTimer dynamic height animations
 * Tests the implementation of task 3: timer square container animations
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChessTimer } from '../components/ChessTimer';
import { useTimerStore } from '../stores/timerStore';
import { useTimerTypeStore } from '../stores/timerTypeStore';

// Mock the stores
jest.mock('../stores/timerStore');
jest.mock('../stores/timerTypeStore');
jest.mock('../stores/statsStore');
jest.mock('../hooks/useSoundEffects');
jest.mock('../hooks/usePhaseTransition');

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, animate, transition, style, ...props }: any) => (
      <div 
        className={className} 
        style={style}
        data-testid="motion-div"
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock window.innerWidth for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024, // Desktop width by default
});

const mockTimerStore = {
  whiteTimeRemaining: 600000,
  blackTimeRemaining: 600000,
  isRunning: false,
  activePlayer: null,
  switchActivePlayer: jest.fn(),
  pauseTimer: jest.fn(),
  resumeTimer: jest.fn(),
  setTimeoutCallback: jest.fn(),
  lastMoveStartTime: null,
};

const mockTimerTypeStore = {
  getDetailedDisplayName: jest.fn(() => 'Test Timer'),
};

describe('ChessTimer Dynamic Height Animations', () => {
  beforeEach(() => {
    (useTimerStore as jest.Mock).mockReturnValue(mockTimerStore);
    (useTimerTypeStore as jest.Mock).mockReturnValue(mockTimerTypeStore);
    
    // Reset window width
    window.innerWidth = 1024;
    
    // Mock resize event
    global.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Timer Square Container Structure', () => {
    test('should render timer square containers as motion.div elements', () => {
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      
      // Should have at least 2 motion.div elements for timer squares
      // (plus potentially others for other animations)
      expect(motionDivs.length).toBeGreaterThanOrEqual(2);
    });

    test('should apply correct CSS classes to timer square containers', () => {
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      
      // Find timer square containers (they should have specific classes)
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && 
        div.className.includes('items-center') &&
        div.className.includes('justify-center')
      );
      
      expect(timerSquareContainers).toHaveLength(2);
      
      timerSquareContainers.forEach(container => {
        expect(container.className).toContain('flex-1');
        expect(container.className).toContain('md:flex-row');
        expect(container.className).toContain('flex');
        expect(container.className).toContain('items-center');
        expect(container.className).toContain('justify-center');
        expect(container.className).toContain('cursor-pointer');
        expect(container.className).toContain('select-none');
        expect(container.className).toContain('md:h-full');
      });
    });
  });

  describe('Desktop View (md breakpoint and above)', () => {
    beforeEach(() => {
      window.innerWidth = 1024; // Desktop width
    });

    test('should not apply height animations on desktop', () => {
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      timerSquareContainers.forEach(container => {
        const animateData = container.getAttribute('data-animate');
        const animate = animateData ? JSON.parse(animateData) : {};
        
        // Height should be undefined for desktop
        expect(animate.height).toBeUndefined();
      });
    });

    test('should maintain existing desktop styling', () => {
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('md:h-full')
      );
      
      timerSquareContainers.forEach(container => {
        expect(container.className).toContain('md:h-full');
      });
    });
  });

  describe('Mobile View (below md breakpoint)', () => {
    beforeEach(() => {
      window.innerWidth = 600; // Mobile width
    });

    test('should apply height animations on mobile with default state', () => {
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      expect(timerSquareContainers).toHaveLength(2);
      
      timerSquareContainers.forEach(container => {
        const animateData = container.getAttribute('data-animate');
        const animate = animateData ? JSON.parse(animateData) : {};
        
        // Should have height animation on mobile
        expect(animate.height).toBeDefined();
        expect(animate.height).toMatch(/^\d+vh$/);
      });
    });

    test('should apply spring transition configuration on mobile', () => {
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      timerSquareContainers.forEach(container => {
        const transitionData = container.getAttribute('data-transition');
        const transition = transitionData ? JSON.parse(transitionData) : {};
        
        // Should have spring transition configuration
        expect(transition.type).toBe('spring');
        expect(transition.stiffness).toBe(300);
        expect(transition.damping).toBe(30);
        expect(transition.mass).toBe(0.8);
        expect(transition.duration).toBe(0.9);
      });
    });
  });

  describe('Animation State Integration', () => {
    test('should use animation state for height values', () => {
      // Mock active player state
      const mockStoreWithActivePlayer = {
        ...mockTimerStore,
        activePlayer: 'black' as const,
      };
      (useTimerStore as jest.Mock).mockReturnValue(mockStoreWithActivePlayer);
      
      window.innerWidth = 600; // Mobile width
      
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      expect(timerSquareContainers).toHaveLength(2);
      
      // Check that height values are applied from animation state
      timerSquareContainers.forEach(container => {
        const animateData = container.getAttribute('data-animate');
        const animate = animateData ? JSON.parse(animateData) : {};
        
        expect(animate.height).toMatch(/^(18|63)vh$/); // Should be either 18vh or 63vh for active state
      });
    });

    test('should handle null activePlayer (default state)', () => {
      window.innerWidth = 600; // Mobile width
      
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      timerSquareContainers.forEach(container => {
        const animateData = container.getAttribute('data-animate');
        const animate = animateData ? JSON.parse(animateData) : {};
        
        // Should use default height (36vh) when no active player
        expect(animate.height).toBe('36vh');
      });
    });
  });

  describe('Requirements Verification', () => {
    test('should meet requirement 1.1: active timer square expands', () => {
      const mockStoreWithActivePlayer = {
        ...mockTimerStore,
        activePlayer: 'black' as const,
      };
      (useTimerStore as jest.Mock).mockReturnValue(mockStoreWithActivePlayer);
      
      window.innerWidth = 600; // Mobile width
      
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      // One container should have 63vh (active), one should have 18vh (inactive)
      const heights = timerSquareContainers.map(container => {
        const animateData = container.getAttribute('data-animate');
        const animate = animateData ? JSON.parse(animateData) : {};
        return animate.height;
      });
      
      expect(heights).toContain('63vh'); // Active player height
      expect(heights).toContain('18vh'); // Inactive player height
    });

    test('should meet requirement 3.1: premium easing curves', () => {
      window.innerWidth = 600; // Mobile width
      
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      timerSquareContainers.forEach(container => {
        const transitionData = container.getAttribute('data-transition');
        const transition = transitionData ? JSON.parse(transitionData) : {};
        
        // Should use spring transition for premium feel
        expect(transition.type).toBe('spring');
        expect(transition.stiffness).toBeGreaterThan(0);
        expect(transition.damping).toBeGreaterThan(0);
      });
    });

    test('should meet requirement 3.2: 0.8-1.0 second duration', () => {
      window.innerWidth = 600; // Mobile width
      
      render(<ChessTimer />);
      
      const motionDivs = screen.getAllByTestId('motion-div');
      const timerSquareContainers = motionDivs.filter(div => 
        div.className.includes('flex-1') && div.className.includes('md:h-full')
      );
      
      timerSquareContainers.forEach(container => {
        const transitionData = container.getAttribute('data-transition');
        const transition = transitionData ? JSON.parse(transitionData) : {};
        
        // Duration should be within required range
        expect(transition.duration).toBeGreaterThanOrEqual(0.8);
        expect(transition.duration).toBeLessThanOrEqual(1.0);
      });
    });
  });
});