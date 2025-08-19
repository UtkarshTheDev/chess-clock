/**
 * Integration test for MobileControls position animations with ChessTimer
 * Verifies that task 4 integrates correctly with the existing animation system
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
    div: ({ children, className, animate, transition, initial, ...props }: any) => (
      <div 
        className={className} 
        data-testid={className?.includes('md:hidden') ? 'mobile-controls-motion' : 'timer-square-motion'}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-initial={JSON.stringify(initial)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

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

describe('MobileControls Integration with ChessTimer', () => {
  beforeEach(() => {
    (useTimerStore as jest.Mock).mockReturnValue(mockTimerStore);
    (useTimerTypeStore as jest.Mock).mockReturnValue(mockTimerTypeStore);
    
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600, // Mobile width
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render MobileControls with correct animation props in default state', () => {
    render(<ChessTimer />);
    
    const mobileControls = screen.getByTestId('mobile-controls-motion');
    expect(mobileControls).toBeInTheDocument();
    
    const animateData = mobileControls.getAttribute('data-animate');
    const animate = animateData ? JSON.parse(animateData) : {};
    
    // Should be in center position for default state (no active player)
    expect(animate.y).toBe(0);
    expect(animate.opacity).toBe(1);
  });

  test('should position controls at bottom when top player (black) is active', () => {
    const mockStoreWithBlackActive = {
      ...mockTimerStore,
      activePlayer: 'black' as const,
    };
    (useTimerStore as jest.Mock).mockReturnValue(mockStoreWithBlackActive);
    
    render(<ChessTimer />);
    
    const mobileControls = screen.getByTestId('mobile-controls-motion');
    const animateData = mobileControls.getAttribute('data-animate');
    const animate = animateData ? JSON.parse(animateData) : {};
    
    // Should be in bottom position when top player is active
    expect(animate.y).toBe(20);
    expect(animate.opacity).toBe(1);
  });

  test('should position controls at top when bottom player (white) is active', () => {
    const mockStoreWithWhiteActive = {
      ...mockTimerStore,
      activePlayer: 'white' as const,
    };
    (useTimerStore as jest.Mock).mockReturnValue(mockStoreWithWhiteActive);
    
    render(<ChessTimer />);
    
    const mobileControls = screen.getByTestId('mobile-controls-motion');
    const animateData = mobileControls.getAttribute('data-animate');
    const animate = animateData ? JSON.parse(animateData) : {};
    
    // Should be in top position when bottom player is active
    expect(animate.y).toBe(-20);
    expect(animate.opacity).toBe(1);
  });

  test('should use same spring transition as timer squares', () => {
    render(<ChessTimer />);
    
    const mobileControls = screen.getByTestId('mobile-controls-motion');
    const timerSquares = screen.getAllByTestId('timer-square-motion');
    
    const mobileTransitionData = mobileControls.getAttribute('data-transition');
    const mobileTransition = mobileTransitionData ? JSON.parse(mobileTransitionData) : {};
    
    // Get transition from one of the timer squares
    const timerTransitionData = timerSquares[0]?.getAttribute('data-transition');
    const timerTransition = timerTransitionData ? JSON.parse(timerTransitionData) : {};
    
    // Should have matching transition configurations
    expect(mobileTransition.type).toBe(timerTransition.type);
    expect(mobileTransition.stiffness).toBe(timerTransition.stiffness);
    expect(mobileTransition.damping).toBe(timerTransition.damping);
    expect(mobileTransition.mass).toBe(timerTransition.mass);
    expect(mobileTransition.duration).toBe(timerTransition.duration);
  });

  test('should not animate on desktop view', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    render(<ChessTimer />);
    
    const mobileControls = screen.getByTestId('mobile-controls-motion');
    const animateData = mobileControls.getAttribute('data-animate');
    const transitionData = mobileControls.getAttribute('data-transition');
    
    // Should not have animation props on desktop
    expect(animateData).toBe('null');
    expect(transitionData).toBe('null');
  });

  test('should maintain existing MobileControls functionality', () => {
    render(<ChessTimer />);
    
    const mobileControls = screen.getByTestId('mobile-controls-motion');
    
    // Should maintain existing CSS classes
    expect(mobileControls.className).toContain('md:hidden');
    expect(mobileControls.className).toContain('flex');
    expect(mobileControls.className).toContain('items-center');
    expect(mobileControls.className).toContain('gap-4');
    expect(mobileControls.className).toContain('justify-center');
    
    // Should have all control buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3); // At least the mobile control buttons
  });
});