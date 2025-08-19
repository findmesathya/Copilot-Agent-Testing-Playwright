# Authentication Guide for Microsoft Copilot Tests

This guide explains how to use Playwright's authentication system for testing Microsoft Copilot without manually logging in each time.

## Overview

The authentication system uses Playwright's built-in `storageState` feature to persist login sessions across test runs. This means you only need to authenticate once, and subsequent tests will use the saved authentication state.

## Authentication Setup

### Step 1: Run the Authentication Setup

Before running any Microsoft Copilot tests, you need to set up authentication:

```bash
npm run auth:setup
```

This command will:
1. Open a visible browser window (Microsoft Edge/Chrome)
2. Navigate to the Microsoft login page
3. Automatically fill in your email (saraveen@microsoft.com)
4. Wait for you to enter your password and complete any MFA steps
5. Save the authentication state to `.auth/user.json`

### Step 2: Complete Manual Login Steps

When the authentication setup runs, you'll need to manually:
1. Enter your password when prompted
2. Complete any multi-factor authentication (MFA) if required
3. Accept any consent screens that appear

The test will automatically detect when authentication is complete and save the session.

## Running Authenticated Tests

Once authentication is set up, you can run Copilot tests using:

```bash
# Run basic Copilot tests with authentication
npm run test:copilot

# Run Page Object Model Copilot tests with authentication
npm run test:copilot-pom

# Run Copilot tests in headed mode (browser visible)
npm run test:copilot-headed
```

## Project Configuration

The authentication system uses specific browser projects:

- **setup**: Handles the initial authentication process
- **chromium-auth**: Runs tests with saved authentication state
- **msedge**: Runs tests on Microsoft Edge (may require separate auth)

## Authentication Files

- `tests/auth.setup.ts` - Authentication setup script
- `playwright/.auth/user.json` - Saved authentication state (auto-generated)
- `playwright/.auth/` - Directory for authentication files (auto-created)

## Troubleshooting

### Authentication Expired

If tests fail due to expired authentication, re-run:
```bash
npm run auth:setup
```

### Different User Account

To use a different Microsoft account:
1. Delete the `playwright/.auth/user.json` file
2. Update the email in `tests/auth.setup.ts` if needed
3. Run `npm run auth:setup` again

### Browser-Specific Issues

If Edge browser tests have authentication issues:
- Use the `--project=chromium-auth` flag for most reliable authentication
- Edge may require separate authentication setup

## Security Notes

- Authentication files are excluded from version control (`.gitignore`)
- The setup script only handles email input automatically
- Password and MFA steps must be completed manually for security
- Authentication state expires periodically and needs renewal

## Alternative Approaches

If the authentication system doesn't work for your use case:
- `tests/copilot-existing-browser.spec.ts` - Connects to an existing browser session
- Manual login each test run (default behavior without auth setup)

## Commands Summary

```bash
# Set up authentication (run first) - opens visible browser
npm run auth:setup

# Alternative: Run authentication in headless mode (background)
npm run auth:setup-headless

# Run authenticated Copilot tests
npm run test:copilot
npm run test:copilot-pom
npm run test:copilot-headed

# Run tests without authentication
npm run test:copilot-existing  # Uses existing browser
npm run test:copilot-edge      # Uses Edge browser
```
