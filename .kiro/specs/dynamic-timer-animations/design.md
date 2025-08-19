# Design Document

## Overview

The dynamic timer animations feature enhances the mobile chess timer interface by implementing smooth height transitions for timer squares based on the active player state. The design leverages Framer Motion's animation capabilities to create premium-quality transitions while maintaining the existing visual design and ensuring optimal performance.

## Architecture

### Component Hierarchy
```
ChessTimer (index.tsx)
├── TimerSquare (black) - Container with dynamic height
├── MobileControls - Animated positioning between squares
└── TimerSquare (white) - Container with dynamic height
```

### Animation System
- **Animation Library**: Framer Motion (already integrated)
- **Animation Type**: Transform-based height animations with layout transitions
- **Performance Target**: 60fps with smooth easing curves
- **State Management**: React state for animation triggers, Zustand store for timer state

## Components and Interfaces

### 1. Enhanced ChessTimer Component (index.tsx)

#### New State Management
```typescript
interface AnimationState {
  topSquareHeight: string;
  bottomSquareHeight: string;
  controlsPosition: 'center' | 'top' | 'bottom';
}

const [animationState, setAnimationState] = useState<AnimationState>({
  topSquareHeight: '40vh',
  bottomSquareHeight: '40vh', 
  controlsPosition: 'center'
});
```

#### Height Calculation Logic
```typescript
const calculateHeights = (activePlayer: 'white' | 'black' | null) => {
  const baseHeight = 90; // 90vh total, 10vh for margins
  
  if (!activePlayer) {
    return {
      topSquareHeight: `${baseHeight * 0.4}vh`, // 36vh
      bottomSquareHeight: `${baseHeight * 0.4}vh`, // 36vh
      controlsPosition: 'center' as const
    };
  }
  
  if (activePlayer === 'black') { // Top player active
    return {
      topSquareHeight: `${baseHeight * 0.7}vh`, // 63vh
      bottomSquareHeight: `${baseHeight * 0.2}vh`, // 18vh
      controlsPosition: 'bottom' as const
    };
  } else { // Bottom player active
    return {
      topSquareHeight: `${baseHeight * 0.2}vh`, // 18vh
      bottomSquareHeight: `${baseHeight * 0.7}vh`, // 63vh
      controlsPosition: 'top' as const
    };
  }
};
```

#### Animation Trigger Effect
```typescript
useEffect(() => {
  const newState = calculateHeights(activePlayer);
  setAnimationState(newState);
}, [activePlayer]);
```

### 2. Enhanced TimerSquare Component

#### Dynamic Height Props
```typescript
interface TimerSquareProps {
  // ... existing props
  animatedHeight?: string;
  animationDuration?: number;
}
```

#### Motion Configuration
```typescript
const heightVariants = {
  default: { height: '40vh' },
  active: { height: '70vh' },
  inactive: { height: '20vh' }
};

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
  duration: 0.9
};
```

### 3. Enhanced MobileControls Component

#### Animated Positioning
```typescript
interface MobileControlsProps {
  // ... existing props
  animatedPosition: 'center' | 'top' | 'bottom';
  animationDuration?: number;
}

const positionVariants = {
  center: { y: 0, opacity: 1 },
  top: { y: -20, opacity: 1 },
  bottom: { y: 20, opacity: 1 }
};
```

## Data Models

### Animation Configuration
```typescript
interface AnimationConfig {
  duration: number; // 0.8-1.0 seconds
  easing: string; // "easeInOut" or custom cubic-bezier
  stiffness: number; // Spring physics parameter
  damping: number; // Spring physics parameter
  mass: number; // Spring physics parameter
}

const ANIMATION_CONFIG: AnimationConfig = {
  duration: 0.9,
  easing: "easeInOut",
  stiffness: 300,
  damping: 30,
  mass: 0.8
};
```

### Layout State
```typescript
interface LayoutState {
  activePlayer: 'white' | 'black' | null;
  topSquareHeight: string;
  bottomSquareHeight: string;
  controlsPosition: 'center' | 'top' | 'bottom';
  isAnimating: boolean;
}
```

## Error Handling

### Animation Fallbacks
- **Reduced Motion**: Respect `prefers-reduced-motion` media query
- **Performance Degradation**: Fallback to CSS transitions if frame rate drops
- **State Conflicts**: Debounce rapid state changes to prevent animation conflicts

### Error Recovery
```typescript
const handleAnimationError = (error: Error) => {
  console.warn('Animation error:', error);
  // Fallback to immediate state change without animation
  setAnimationState(calculateHeights(activePlayer));
};
```

## Testing Strategy

### Unit Tests
1. **Height Calculation Logic**
   - Test `calculateHeights()` function with all player states
   - Verify percentage calculations are correct
   - Test edge cases (null activePlayer, rapid changes)

2. **Animation State Management**
   - Test state transitions between all combinations
   - Verify animation triggers fire correctly
   - Test cleanup on component unmount

### Integration Tests
1. **Component Interaction**
   - Test timer square height changes with active player switches
   - Verify mobile controls position updates correctly
   - Test simultaneous animations don't conflict

2. **Performance Tests**
   - Measure frame rate during animations
   - Test rapid state changes (stress test)
   - Verify memory usage doesn't increase over time

### Visual Regression Tests
1. **Layout Verification**
   - Screenshot tests for all animation states
   - Verify margins and spacing remain consistent
   - Test on different screen sizes

2. **Animation Quality**
   - Record animation sequences for smoothness verification
   - Test easing curves match design specifications
   - Verify no visual glitches during transitions

## Implementation Phases

### Phase 1: Core Animation Infrastructure
- Implement height calculation logic
- Add animation state management to ChessTimer
- Create basic height transitions for TimerSquare components

### Phase 2: Controls Animation
- Implement MobileControls positioning animation
- Synchronize all animations to run simultaneously
- Add animation configuration and easing

### Phase 3: Performance Optimization
- Implement transform-based animations where possible
- Add reduced motion support
- Optimize for 60fps performance

### Phase 4: Polish and Testing
- Fine-tune easing curves and timing
- Add comprehensive test coverage
- Performance testing and optimization

## Technical Considerations

### Performance Optimizations
1. **Transform-based Animations**: Use `transform: scaleY()` instead of height changes where possible
2. **Layout Batching**: Group layout changes to minimize reflows
3. **Animation Scheduling**: Use `requestAnimationFrame` for smooth transitions
4. **Memory Management**: Cleanup animation listeners and timers

### Responsive Design
- Maintain existing breakpoint behavior (md: and above)
- Ensure animations only apply to mobile view
- Preserve desktop layout unchanged

### Accessibility
- Respect `prefers-reduced-motion` setting
- Maintain keyboard navigation during animations
- Ensure screen readers can follow state changes

## Integration Points

### Existing Systems
- **Timer Store**: Read activePlayer state for animation triggers
- **Gesture System**: Ensure animations don't interfere with touch handling
- **Sound Effects**: Coordinate with existing audio feedback
- **Haptic Feedback**: Maintain existing vibration patterns

### CSS Integration
- Preserve all existing Tailwind classes
- Add animation-specific classes only where needed
- Maintain responsive design patterns