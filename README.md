# Chess Timer ⏱️

A modern, feature-rich chess timer application built with Next.js and TypeScript. Designed for chess players of all levels, from casual games to tournament play.

![Chess Timer](public/logo.png)

## ✨ Features

### 🏆 Tournament-Grade Timer Modes
- **Sudden Death** - Classic time control where each player gets a fixed amount of time
- **Simple Delay** - Adds a delay period before the main time starts counting down
- **Bronstein Delay** - Time used during the delay period is added back to the main time
- **Fischer Increment** - Adds a fixed amount of time after each move
- **Multi-Stage** - Complex tournament formats with multiple time controls (e.g., World Championship format)

### 🎮 Interactive Features
- **Gesture Controls** - Single tap for moves, two-finger tap for check, long press for checkmate
- **Sound Effects** - Audio feedback for moves, checks, and game events
- **Haptic Feedback** - Vibration feedback on mobile devices
- **Keyboard Shortcuts** - Quick access to timer functions
- **Visual Animations** - Smooth transitions and phase indicators

### 📊 Game Analytics
- **Move Statistics** - Track average move time and game phases
- **Game Summary** - Detailed post-game analysis
- **Performance Charts** - Visual representation of time usage

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** - Easy on the eyes for long gaming sessions
- **Smooth Animations** - Powered by Framer Motion
- **Accessibility** - Keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chess-timer.git
   cd chess-timer
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm
   pnpm install

   # Using bun
   bun install
   ```

3. **Start the development server**
   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev

   # Using pnpm
   pnpm dev

   # Using bun
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Basic Timer Operation
1. **Select Timer Mode** - Choose from the five tournament timer modes
2. **Set Time Control** - Configure base time and increments/delays
3. **Start Game** - Tap the start button to begin
4. **Make Moves** - Tap your side of the timer after each move
5. **Special Moves** - Use gestures for check (two-finger tap) or checkmate (long press)

### Timer Modes Explained

#### Sudden Death
Perfect for blitz and rapid games. Each player gets a fixed amount of time.
- **Example**: 5 minutes per player

#### Simple Delay
Adds a delay before your main time starts counting down.
- **Example**: 3 minutes + 5 second delay

#### Bronstein Delay
Time used during the delay is added back to your main time.
- **Example**: 15 minutes + 10 second Bronstein delay

#### Fischer Increment
Adds time to your clock after each move.
- **Example**: 3 minutes + 2 second increment

#### Multi-Stage
Complex tournament formats with multiple phases.
- **Example**: 90 minutes for 40 moves, then 30 minutes for the rest + 30 second increment

### Gesture Controls
- **Single Tap** - Normal move
- **Two-Finger Tap** - Check move (plays special sound)
- **Long Press** - Checkmate (ends game with confirmation)

### Keyboard Shortcuts
- **Spacebar** - Switch active player / Make move
- **P** - Pause/Resume timer
- **R** - Reset timer
- **Escape** - Return to home screen

## 🛠️ Development

### Project Structure
```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Core timer logic and utilities
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── __tests__/          # Test files
```

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Testing**: Jest
- **Icons**: Lucide React
- **Sound**: use-sound (Howler.js)

### Timer Engine Architecture
The timer engine is built with a modular architecture:
- **TimerEngine** - Core timer logic and state management
- **TimerModeHandler** - Interface for different timer modes
- **TimerStore** - Zustand store for React state management

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chess community for feedback and feature requests
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [shadcn/ui](https://ui.shadcn.com/) for beautiful component designs
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/chess-timer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/chess-timer/discussions)
- **Email**: your.email@example.com

## 🗺️ Roadmap

- [ ] Online multiplayer support
- [ ] Tournament management features
- [ ] Custom timer presets
- [ ] Game recording and replay
- [ ] Integration with chess.com and Lichess
- [ ] Mobile app (React Native)

---

**Made with ❤️ for the chess community**
