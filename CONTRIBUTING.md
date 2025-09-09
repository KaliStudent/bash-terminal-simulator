# Contributing to Bash Terminal Simulator

Thank you for your interest in contributing to the Bash Terminal Simulator! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm run install-all`
4. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test your changes thoroughly
7. Commit your changes: `git commit -m "Add your feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a Pull Request

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/bash-terminal-simulator.git
cd bash-terminal-simulator

# Install dependencies
npm run install-all

# Start development server
npm run dev
```

## Code Style Guidelines

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Use consistent indentation (2 spaces)

### CSS
- Use the existing CSS classes and structure
- Follow the terminal theme color scheme
- Use consistent naming conventions
- Keep styles organized and commented

## Adding New Commands

To add new bash commands to the simulator:

1. Edit `server/services/bashSimulator.js`
2. Add your command to the `executeCommand` method
3. Implement the command logic
4. Update the help text in the `help()` method
5. Test thoroughly

Example:
```javascript
case 'yourcommand':
  return this.yourCommand(args);
```

## Adding New Features

### Backend
1. Create new routes in `server/routes/`
2. Add database migrations if needed
3. Update API documentation
4. Add proper error handling

### Frontend
1. Create React components in `client/src/components/`
2. Update routing if needed
3. Add proper state management
4. Ensure responsive design

## Testing

Before submitting a pull request:

1. Test all new functionality thoroughly
2. Test with different user roles (admin/student)
3. Test edge cases and error conditions
4. Ensure no breaking changes to existing features
5. Test on different browsers if applicable

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows the style guidelines
- [ ] All tests pass
- [ ] New features are documented
- [ ] No console errors or warnings
- [ ] Responsive design works on different screen sizes

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, browser, Node.js version
6. **Screenshots**: If applicable

## Feature Requests

When requesting features, please include:

1. **Use Case**: Why this feature would be useful
2. **Proposed Solution**: How you think it should work
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches
- Help maintain a positive community environment

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue with the "question" label
2. Contact the maintainers
3. Check existing issues and discussions

Thank you for contributing to the Bash Terminal Simulator! 🚀
