<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Microsoft Copilot Playwright Testing Project

This project focuses on automated testing of Microsoft Copilot's Prompt Coach Agent functionality using Playwright.

## Project Guidelines

- All tests should follow Playwright best practices
- Use TypeScript for type safety
- Implement Page Object Model (POM) pattern where appropriate
- Handle dynamic content and potential UI changes gracefully
- Always include proper error handling for elements that might not appear
- Use descriptive test names and organize tests logically
- Prefer stable selectors and avoid brittle locators

## Test Structure

- Basic functionality tests: `copilot-prompt-coach.spec.ts`
- Page Object Model tests: `copilot-prompt-coach-pom.spec.ts`
- Authentication setup: `auth.setup.ts`
- Existing browser tests: `copilot-existing-browser.spec.ts`

## Key Considerations

- Microsoft Copilot interface can change frequently - tests should be resilient
- Handle authentication flows appropriately using Playwright's storageState
- Consider rate limiting and avoid aggressive automation
- Test across different viewports and browsers
- Use appropriate wait strategies for dynamic content
- Ensure proper handling of Microsoft authentication and MFA flows
