# Implementation Plan

- [x] 1. Create animation configuration and height calculation utilities





  - Create a new utility file for animation constants and height calculation logic
  - Implement `calculateHeights()` function that returns height values based on active player state
  - Define animation configuration constants for duration, easing, and spring physics
  - Write unit tests for height calculation logic with all player state combinations
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Add animation state management to ChessTimer component





  - Add new state interface `AnimationState` to track square heights and controls position
  - Implement `useState` hook for animation state in ChessTimer component
  - Create `useEffect` hook that triggers animation state updates when `activePlayer` changes
  - Add debouncing logic to handle rapid state changes without animation conflicts
  - _Requirements: 1.4, 2.4_

- [x] 3. Implement dynamic height animations for timer square containers





  - Modify the timer square container divs in ChessTimer to use Framer Motion's `motion.div`
  - Add `animate` prop with height values from animation state
  - Configure spring transition with premium easing curves (0.8-1.0 second duration)
  - Ensure only mobile view (below md breakpoint) applies height animations
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x] 4. Enhance MobileControls component with position animations





  - Convert MobileControls wrapper to Framer Motion `motion.div`
  - Add position variants for center, top, and bottom states
  - Implement smooth positioning animation that centers controls between timer squares
  - Synchronize controls animation timing with timer square height animations
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5. Optimize animations for 60fps performance
  - Replace height-based animations with `transform: scaleY()` where possible for better performance
  - Add `will-change` CSS property to animated elements
  - Implement `useLayoutEffect` for animation timing to prevent layout thrashing
  - Add performance monitoring to ensure 60fps target is maintained
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 6. Add accessibility and reduced motion support
  - Implement `prefers-reduced-motion` media query detection
  - Create fallback behavior that uses instant state changes when reduced motion is preferred
  - Ensure keyboard navigation and screen reader compatibility during animations
  - Add ARIA live regions to announce state changes for accessibility
  - _Requirements: 4.4_

- [ ] 7. Preserve existing styling and responsive behavior
  - Verify all existing Tailwind classes, colors, fonts, and visual effects remain unchanged
  - Ensure desktop view (md breakpoint and above) is completely unaffected by animations
  - Test that opacity changes for active/inactive players still work correctly
  - Maintain all existing gesture handling and touch interactions
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Add comprehensive error handling and fallbacks
  - Implement try-catch blocks around animation state updates
  - Add fallback to CSS transitions if Framer Motion animations fail
  - Create error recovery mechanism that resets to default state on animation errors
  - Add console warnings for animation performance issues
  - _Requirements: 3.4_

- [ ] 9. Write integration tests for animation behavior
  - Create tests that verify height changes occur when active player switches
  - Test that mobile controls position updates correctly with timer square animations
  - Verify simultaneous animations don't cause conflicts or performance issues
  - Add tests for rapid state changes to ensure smooth handling
  - _Requirements: 1.4, 2.4, 3.4_

- [ ] 10. Fine-tune animation timing and easing curves
  - Test different spring physics parameters to achieve premium feel
  - Adjust animation duration to hit the 0.8-1.0 second target
  - Implement custom easing curves if needed for more natural motion
  - Add animation completion callbacks to ensure proper state synchronization
  - _Requirements: 3.1, 3.2_