/**
 * Optimized Animation Hook
 * 
 * This hook provides performance-optimized animation state management using:
 * - useLayoutEffect for better timing and reduced layout thrashing
 * - Performance monitoring to ensure 60fps target
 * - Transform-based animations instead of layout-triggering properties
 * - Reduced motion support
 */

import { useLayoutEffect, useState, useRef, useCallback } from 'react';
import { 
  AnimationState, 
  calculateHeights, 
  performanceMonitor, 
  prefersReducedMotion,
  PerformanceMetrics 
} from '@/utils/timerAnimations';

interface UseOptimizedAnimationsOptions {
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Callback for performance metrics */
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  /** Whether to use transform-based animations */
  useTransformAnimations?: boolean;
}

interface UseOptimizedAnimationsReturn {
  animationState: AnimationState;
  isAnimating: boolean;
  performanceMetrics: PerformanceMetrics | null;
  shouldUseReducedMotion: boolean;
}

export const useOptimizedAnimations = (
  activePlayer: 'white' | 'black' | null,
  options: UseOptimizedAnimationsOptions = {}
): UseOptimizedAnimationsReturn => {
  const {
    enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
    onPerformanceUpdate
  } = options;

  // Animation state
  const [animationState, setAnimationState] = useState<AnimationState>(() => 
    calculateHeights(null)
  );
  
  // Animation status tracking
  const [isAnimating, setIsAnimating] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [shouldUseReducedMotion] = useState(() => prefersReducedMotion());
  
  // Refs for cleanup and debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringRef = useRef(false);

  // Performance monitoring callback
  const handlePerformanceUpdate = useCallback((metrics: PerformanceMetrics) => {
    setPerformanceMetrics(metrics);
    onPerformanceUpdate?.(metrics);
    
    // Warn if performance is poor
    if (!metrics.isPerformant && process.env.NODE_ENV === 'development') {
      console.warn('Animation performance degraded:', metrics);
    }
  }, [onPerformanceUpdate]);

  // Start performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    if (!enablePerformanceMonitoring || isMonitoringRef.current || shouldUseReducedMotion) {
      return;
    }
    
    isMonitoringRef.current = true;
    performanceMonitor.startMonitoring();
  }, [enablePerformanceMonitoring, shouldUseReducedMotion]);

  // Stop performance monitoring
  const stopPerformanceMonitoring = useCallback(() => {
    if (!isMonitoringRef.current) return;
    
    isMonitoringRef.current = false;
    const metrics = performanceMonitor.stopMonitoring();
    handlePerformanceUpdate(metrics);
  }, [handlePerformanceUpdate]);

  // Optimized animation state update using useLayoutEffect
  useLayoutEffect(() => {
    // Clear any existing timeouts to debounce rapid changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // For reduced motion, update immediately without animation
    if (shouldUseReducedMotion) {
      const newState = calculateHeights(activePlayer);
      setAnimationState(newState);
      return;
    }

    // Debounce rapid state changes
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        // Start performance monitoring before animation
        startPerformanceMonitoring();
        setIsAnimating(true);
        
        // Calculate new animation state
        const newAnimationState = calculateHeights(activePlayer);
        
        // Use requestAnimationFrame for smooth state updates
        requestAnimationFrame(() => {
          setAnimationState(newAnimationState);
          
          // Set animation completion timeout
          animationTimeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
            stopPerformanceMonitoring();
          }, 1000); // Match animation duration + buffer
        });
        
      } catch (error) {
        console.warn('Animation state update error:', error);
        
        // Fallback to immediate state change
        const fallbackState = calculateHeights(activePlayer);
        setAnimationState(fallbackState);
        setIsAnimating(false);
        
        if (isMonitoringRef.current) {
          stopPerformanceMonitoring();
        }
      }
    }, 16); // ~1 frame delay for debouncing (60fps = 16.67ms per frame)

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [activePlayer, shouldUseReducedMotion, startPerformanceMonitoring, stopPerformanceMonitoring]);

  // Cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (isMonitoringRef.current) {
        performanceMonitor.reset();
      }
    };
  }, []);

  return {
    animationState,
    isAnimating,
    performanceMetrics,
    shouldUseReducedMotion
  };
};