/**
 * Unit tests for MobileControls position animations
 * Tests the implementation of task 4: MobileControls component position animations
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MobileControls from '../components/ChessTimer/MobileControls';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, animate, transition, initial, ...props }: any) => (
      <div 
        className={className} 
        data-testid="mobile-controls-motion"
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-initial={JSON.stringify(initial)}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

// Mock the animation utilities
jest.mock('@/utils/timerAnimations', () => ({
  positionVariants: {
    center: { y: 0, opacity: 1 },
    top: { y: -20, opacity: 1 },
    bottom: { y: 20, opacity: 1 }
  },
  springTransition: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
    duration: 0.9
  }
}));

describe('MobileControls Position Animations', () => {
  const defaultProps = {
    isRunning: false,
    onTogglePause: jest.fn(),
    onShowHelp: jest.fn(),
    onReset: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Structure', () => {
    test('should render as motion.div when isMobile is true', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      expect(motionDiv).toBeInTheDocument();
    });

    test('should maintain existing CSS classes', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      expect(motionDiv.className).toContain('md:hidden');
      expect(motionDiv.className).toContain('flex');
      expect(motionDiv.className).toContain('items-center');
      expect(motionDiv.className).toContain('gap-4');
      expect(motionDiv.className).toContain('my-4');
      expect(motionDiv.className).toContain('mb-6');
      expect(motionDiv.className).toContain('justify-center');
    });

    test('should render all control buttons', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      // Should have 3 buttons (play/pause, help, reset)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Position Animation Props', () => {
    test('should apply center position variant when animatedPosition is center', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      expect(animate.y).toBe(0);
      expect(animate.opacity).toBe(1);
    });

    test('should apply top position variant when animatedPosition is top', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="top"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      expect(animate.y).toBe(-20);
      expect(animate.opacity).toBe(1);
    });

    test('should apply bottom position variant when animatedPosition is bottom', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="bottom"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      expect(animate.y).toBe(20);
      expect(animate.opacity).toBe(1);
    });

    test('should default to center position when animatedPosition is not provided', () => {
      render(
        <MobileControls 
          {...defaultProps}
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      expect(animate.y).toBe(0);
      expect(animate.opacity).toBe(1);
    });
  });

  describe('Mobile vs Desktop Behavior', () => {
    test('should not apply animations when isMobile is false', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="top"
          isMobile={false}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const transitionData = motionDiv.getAttribute('data-transition');
      const initialData = motionDiv.getAttribute('data-initial');
      
      // Should not have animation props when not mobile
      expect(animateData).toBe('null');
      expect(transitionData).toBe('null');
      expect(initialData).toBe('null');
    });

    test('should apply spring transition when isMobile is true', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const transitionData = motionDiv.getAttribute('data-transition');
      const transition = transitionData ? JSON.parse(transitionData) : {};
      
      expect(transition.type).toBe('spring');
      expect(transition.stiffness).toBe(300);
      expect(transition.damping).toBe(30);
      expect(transition.mass).toBe(0.8);
      expect(transition.duration).toBe(0.9);
    });

    test('should set initial position when isMobile is true', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="bottom"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const initialData = motionDiv.getAttribute('data-initial');
      const initial = initialData ? JSON.parse(initialData) : {};
      
      expect(initial.y).toBe(20);
      expect(initial.opacity).toBe(1);
    });
  });

  describe('Requirements Verification', () => {
    test('should meet requirement 2.1: controls animate to center between squares', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      // Center position should have y: 0
      expect(animate.y).toBe(0);
      expect(animate.opacity).toBe(1);
    });

    test('should meet requirement 2.2: controls position below expanded top square', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="bottom"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      // Bottom position should have positive y value
      expect(animate.y).toBe(20);
      expect(animate.opacity).toBe(1);
    });

    test('should meet requirement 2.3: controls position above expanded bottom square', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="top"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const animateData = motionDiv.getAttribute('data-animate');
      const animate = animateData ? JSON.parse(animateData) : {};
      
      // Top position should have negative y value
      expect(animate.y).toBe(-20);
      expect(animate.opacity).toBe(1);
    });

    test('should meet requirement 2.4: synchronized timing with timer squares', () => {
      render(
        <MobileControls 
          {...defaultProps}
          animatedPosition="center"
          isMobile={true}
        />
      );
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      const transitionData = motionDiv.getAttribute('data-transition');
      const transition = transitionData ? JSON.parse(transitionData) : {};
      
      // Should use same spring transition as timer squares
      expect(transition.type).toBe('spring');
      expect(transition.stiffness).toBe(300);
      expect(transition.damping).toBe(30);
      expect(transition.mass).toBe(0.8);
      expect(transition.duration).toBe(0.9);
    });
  });

  describe('Prop Handling', () => {
    test('should handle all existing props correctly', () => {
      const mockProps = {
        isRunning: true,
        onTogglePause: jest.fn(),
        onShowHelp: jest.fn(),
        onReset: jest.fn(),
        animatedPosition: 'top' as const,
        isMobile: true,
      };

      render(<MobileControls {...mockProps} />);
      
      // Component should render without errors
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      expect(motionDiv).toBeInTheDocument();
      
      // Should maintain all existing functionality
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    test('should work with default prop values', () => {
      render(<MobileControls {...defaultProps} />);
      
      const motionDiv = screen.getByTestId('mobile-controls-motion');
      expect(motionDiv).toBeInTheDocument();
      
      // Should default to center position and non-mobile behavior
      const animateData = motionDiv.getAttribute('data-animate');
      expect(animateData).toBe('null'); // No animation when isMobile defaults to false
    });
  });
});