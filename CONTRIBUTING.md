# Contributing to Microsoft Copilot Playwright Testing Suite

Thank you for your interest in contributing! This project welcomes contributions and suggestions.

## Ways to Contribute

- 🐛 **Report bugs** and issues
- 💡 **Suggest new features** or improvements
- 📖 **Improve documentation**
- 🔧 **Submit pull requests** with bug fixes or features
- 🧪 **Add new test scenarios** for different Copilot agents
- 🎨 **Enhance the HTML report** templates

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/copilot-playwright-testing.git
   cd copilot-playwright-testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:browsers
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key for testing LLM features
   ```

4. **Run tests to ensure everything works**
   ```bash
   npm run test-openai  # Check OpenAI integration
   npm run test:copilot-conversation  # Run a sample conversation test
   ```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add/update tests as needed
   - Update documentation if required

3. **Test your changes**
   ```bash
   npm test
   npm run generate-report
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add support for new Copilot agent"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper type annotations
- Use meaningful variable and function names

### Testing
- Write tests for new features
- Use descriptive test names
- Include proper error handling
- Add console logging for debugging

### Documentation
- Update README.md for new features
- Add inline code comments for complex logic
- Include examples in documentation

## Adding New Test Scenarios

### New Copilot Agents
1. Add the agent name to the configuration
2. Update selectors if needed
3. Test with both LLM and fallback modes
4. Add documentation for the new agent

### New Conversation Types
1. Create new prompt templates
2. Add LLM analysis prompts if needed
3. Test conversation flow
4. Update report generation if required

## Reporting Issues

When reporting issues, please include:

- **Clear description** of the problem
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Screenshots or videos** if applicable
- **Test logs** from the console

## Feature Requests

For new features, please provide:

- **Clear description** of the feature
- **Use case** and benefits
- **Proposed implementation** approach
- **Examples** of how it would work

## Code of Conduct

This project follows a standard code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Questions?

- 💬 **Discussions**: Use GitHub Discussions for general questions
- 🐛 **Issues**: Use GitHub Issues for bug reports and feature requests
- 📧 **Email**: Contact maintainers for sensitive topics

Thank you for helping make this project better! 🚀
