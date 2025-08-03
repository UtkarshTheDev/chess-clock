# Contributing to Chess Timer

Thank you for your interest in contributing to Chess Timer! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/yourusername/chess-timer.git
   cd chess-timer
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using bun (recommended for faster installs)
   bun install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Verify Setup**
   - Open [http://localhost:3000](http://localhost:3000)
   - Ensure the timer loads and basic functionality works

## 📋 How to Contribute

### Types of Contributions
- 🐛 **Bug Reports** - Help us identify and fix issues
- ✨ **Feature Requests** - Suggest new functionality
- 🔧 **Code Contributions** - Implement features or fix bugs
- 📚 **Documentation** - Improve guides and API docs
- 🎨 **UI/UX Improvements** - Enhance user experience
- 🧪 **Tests** - Add or improve test coverage

### Before You Start
1. **Check existing issues** - Avoid duplicate work
2. **Create an issue** - Discuss your idea before implementing
3. **Get feedback** - Ensure your contribution aligns with project goals

## 🔧 Development Guidelines

### Code Style
We use ESLint and Prettier for consistent code formatting:

```bash
# Check linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript
- Use strict TypeScript - no `any` types unless absolutely necessary
- Define proper interfaces for all data structures
- Use type assertions sparingly and document why they're needed

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Follow the existing component structure in `src/components/`
- Use Radix UI primitives when possible for accessibility

### State Management
- Use Zustand stores for global state
- Keep component state local when possible
- Follow the existing store patterns in `src/stores/`

### Testing Requirements
All contributions should include appropriate tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

#### Test Guidelines
- **Unit Tests** - For utility functions and timer logic
- **Component Tests** - For React components
- **Integration Tests** - For timer engine and mode handlers
- **Edge Cases** - Test boundary conditions and error states

#### Required Test Coverage
- New features: 80%+ test coverage
- Bug fixes: Include regression tests
- Timer modes: Test all timing scenarios

### Timer Engine Development
When working on timer functionality:

1. **Understand the Architecture**
   - `TimerEngine` - Core timer logic
   - `TimerModeHandler` - Interface for different modes
   - `TimerStore` - React state management

2. **Adding New Timer Modes**
   - Implement `TimerModeHandler` interface
   - Add comprehensive tests
   - Update configuration types
   - Document the new mode

3. **Testing Timer Logic**
   - Use Jest fake timers for time-based tests
   - Test edge cases (timeouts, pausing, resuming)
   - Verify state transitions

## 📝 Pull Request Process

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes
- Follow the coding guidelines above
- Write or update tests
- Update documentation if needed

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Check linting
npm run lint

# Verify build
npm run build
```

### 4. Commit Your Changes
Use conventional commit messages:

```bash
# Features
git commit -m "feat: add new timer mode for bullet chess"

# Bug fixes
git commit -m "fix: resolve timer pause issue on mobile"

# Documentation
git commit -m "docs: update API documentation for timer modes"

# Tests
git commit -m "test: add edge case tests for Fischer increment"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- **Clear title** describing the change
- **Detailed description** of what was changed and why
- **Screenshots** for UI changes
- **Testing notes** for reviewers

### 6. Code Review Process
- All PRs require at least one review
- Address feedback promptly
- Keep discussions constructive and respectful
- Be open to suggestions and improvements

## 🐛 Bug Reports

When reporting bugs, please include:

### Required Information
- **Environment** (OS, browser, Node.js version)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or videos if applicable
- **Console errors** if any

### Bug Report Template
```markdown
**Environment:**
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Browser: [e.g., Chrome 120, Firefox 121, Safari 17]
- Node.js: [e.g., 18.17.0]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
A clear description of what you expected to happen.

**Actual Behavior:**
A clear description of what actually happened.

**Screenshots:**
If applicable, add screenshots to help explain your problem.

**Additional Context:**
Add any other context about the problem here.
```

## ✨ Feature Requests

For new features, please provide:
- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought of
- **Implementation notes** - Technical considerations if any

## 🎯 Priority Areas

We're particularly interested in contributions for:

### High Priority
- 🧪 **Test Coverage** - Improving test coverage for existing features
- 🐛 **Bug Fixes** - Resolving open issues
- ♿ **Accessibility** - Making the app more accessible
- 📱 **Mobile Experience** - Improving mobile usability

### Medium Priority
- 🎨 **UI Polish** - Visual improvements and animations
- ⚡ **Performance** - Optimizing timer accuracy and responsiveness
- 🔧 **Developer Experience** - Better tooling and documentation

### Future Features
- 🌐 **Multiplayer Support** - Online chess timer functionality
- 🏆 **Tournament Features** - Advanced tournament management
- 📊 **Analytics** - Enhanced game statistics and insights

## 💬 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative
- Help others learn and grow
- Share knowledge and resources
- Provide constructive feedback
- Celebrate others' contributions

### Be Professional
- Keep discussions on-topic
- Avoid personal attacks or harassment
- Report inappropriate behavior
- Maintain confidentiality when appropriate

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Code Reviews** - Technical discussions on PRs

### Response Times
- **Issues** - We aim to respond within 48 hours
- **Pull Requests** - Initial review within 72 hours
- **Questions** - Community typically responds within 24 hours

## 🏆 Recognition

Contributors are recognized in several ways:
- **README Credits** - Listed in the acknowledgments section
- **Release Notes** - Mentioned in version release notes
- **GitHub Profile** - Contributions show on your GitHub profile

## 📚 Additional Resources

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Project-Specific Docs
- [API Documentation](API.md) - Timer engine and interfaces
- [Architecture Overview](docs/ARCHITECTURE.md) - System design
- [Testing Guide](docs/TESTING.md) - Detailed testing instructions

---

Thank you for contributing to Chess Timer! Your efforts help make chess more accessible and enjoyable for players worldwide. 🎯♟️
