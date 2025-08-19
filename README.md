# 🤖 Microsoft Copilot Playwright Testing Suite

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Microsoft Edge](https://img.shields.io/badge/Microsoft_Edge-0078D7?style=for-the-badge&logo=Microsoft-edge&logoColor=white)](https://www.microsoft.com/edge)

An advanced automated testing framework for Microsoft Copilot agents featuring **LLM-powered conversation analysis**, **video recording**, and **beautiful HTML reports**.

![Demo](https://img.shields.io/badge/Demo-Available-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

### 🎯 **Intelligent Testing**
- **Multi-Agent Support**: Test any Copilot Agent (Prompt Coach, Researcher, Analyst, CAPEPilot, etc.)
- **LLM-Powered Conversations**: Uses GPT-4o to analyze screenshots and generate contextual follow-up responses
- **Smart Flow Control**: AI determines when conversations should naturally end
- **Fallback Logic**: Works with or without OpenAI API key

### 🎬 **Comprehensive Recording**
- **Full Video Recording**: Complete test execution with browser interactions
- **Screenshot Capture**: Individual images at each conversation turn
- **Visual Analysis**: Screenshots analyzed by LLM for intelligent responses
- **HD Quality**: 1280x720 video recording for clear viewing

### 📊 **Beautiful Reporting**
- **Interactive HTML Reports**: Professional reports with embedded video and screenshots
- **Test Metadata**: Duration, status, LLM mode, and configuration details
- **Screenshot Gallery**: Click-to-expand image viewer with modal support
- **Microsoft Design**: Clean, modern UI following Microsoft design principles

### 🔐 **Flexible Authentication**
- **Existing Browser Connection**: Connect to your already-authenticated Edge session
- **Persistent Login**: Playwright's storageState for saved authentication
- **Multiple Approaches**: Support for different authentication scenarios

### 🏗️ **Robust Architecture**
- **Page Object Model**: Organized, maintainable test structure
- **Cross-Browser Support**: Chromium and Microsoft Edge
- **Resilient Selectors**: Handles dynamic UI changes gracefully
- **TypeScript**: Full type safety and IntelliSense support

## Project Structure

```
├── tests/
│   ├── auth.setup.ts                        # Microsoft authentication setup
│   ├── copilot-prompt-coach.spec.ts        # Microsoft Copilot Prompt Coach tests
│   ├── copilot-prompt-coach-pom.spec.ts    # Copilot Page Object Model tests
│   ├── copilot-existing-browser.spec.ts    # Intelligent conversation tests with LLM analysis
│   └── copilot-generic-agent-testing.spec.ts # Multi-agent testing framework
├── screenshots/                            # Auto-generated conversation screenshots
├── playwright/.auth/                       # Authentication state storage (auto-generated)
├── playwright.config.ts                   # Playwright configuration
├── tsconfig.json                          # TypeScript configuration
├── .env.example                           # Environment variables template
├── AUTHENTICATION-GUIDE.md               # Detailed authentication setup guide
└── package.json                          # Project dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**
- **Microsoft Edge** browser
- **OpenAI API Key** (optional, for LLM analysis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/copilot-playwright-testing.git
   cd copilot-playwright-testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install:browsers
   ```

4. **Configure OpenAI API (Optional)**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

5. **Start Edge with debugging enabled**
   ```bash
   # Windows
   "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222

   # macOS
   /Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge --remote-debugging-port=9222

   # Linux
   microsoft-edge --remote-debugging-port=9222
   ```

6. **Run your first test**
   ```bash
   npm run test:conversation-with-report
   ```

## LLM-Powered Conversation Setup

For intelligent conversation analysis using GPT-4o:

1. Get an OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your-actual-openai-api-key-here
   ```

**Note**: Without the API key, tests will fall back to simple conversation logic.

## Video Recording & Reporting

The tests automatically record video of the entire conversation process and generate comprehensive HTML reports.

### What's Recorded:
- **Complete Test Execution**: Full browser interaction from start to finish
- **Agent Selection**: Search and selection process for Copilot agents
- **Conversation Flow**: Each message exchange and response
- **LLM Analysis**: Visual feedback of screenshot analysis (when enabled)
- **Screenshots**: Individual images captured at each conversation turn

### Generated Reports Include:
- **Video Playback**: Full test execution video with browser interactions
- **Screenshot Gallery**: Organized view of each conversation turn
- **Test Metadata**: Duration, status, LLM mode, and configuration details
- **Interactive Features**: Click screenshots for full-size view

### Report Generation:
```bash
# Generate report after running tests
npm run generate-report

# Open report in browser
npm run open-report

# Complete workflow: test + report + open
npm run test:conversation-with-report
```

The HTML report is saved as `conversation-test-report.html` and includes all artifacts from your test run.

## Running Tests

### Intelligent Conversation Tests with Video Recording (Recommended)
```bash
# Run conversation test with video recording and generate HTML report
npm run test:conversation-with-report

# Or run individual steps:
npm run test:copilot-conversation  # Run test with video recording
npm run generate-report            # Generate HTML report with video and screenshots
npm run open-report                # Open report in browser
```

### Other Test Options
```bash
# Run with existing authenticated Edge browser (no video)
npm run test:copilot-existing

# Run multi-agent testing framework
npm run test:copilot-generic

### Specific Test Suites
```bash
# Microsoft Copilot tests (requires authentication setup first)
npm run auth:setup             # Set up authentication (run first)
npm run test:copilot           # Basic Copilot tests
npm run test:copilot-pom       # Copilot POM tests
npm run test:copilot-edge      # Run on MS Edge specifically
npm run test:copilot-headed    # With visible browser
npm run test:copilot-existing  # Use existing browser session
```

### Interactive Mode
```bash
# Run tests with browser visible
npm run test:headed

# Run tests in UI mode for debugging
npm run test:ui

# Debug tests step by step
npm run test:debug
```

### View Test Reports
```bash
npm run test:report
```

## Test Coverage

### Microsoft Copilot Tests (`copilot-prompt-coach.spec.ts`)
- ✅ Persistent authentication using Playwright storageState
- ✅ Load Copilot chat interface with saved login
- ✅ Access Prompt Coach Agent
- ✅ Send example prompts and messages
- ✅ Handle conversation flows
- ✅ Test different prompt types
- ✅ Verify accessibility features
- ✅ Cross-browser support (Chromium, MS Edge)

### Authentication Setup

Before running Microsoft Copilot tests, set up authentication to avoid manual login each time:

```bash
# Set up authentication (run this first - requires manual password entry)
npm run auth:setup
```

This opens a browser where you'll manually enter your password and complete any MFA steps. The authentication state is saved for future test runs.

For detailed authentication instructions, see [AUTHENTICATION-GUIDE.md](./AUTHENTICATION-GUIDE.md).

### Running Copilot Tests

```bash
# First-time setup (manual password entry required)
npm run auth:setup

# Run authenticated Copilot tests
npm run test:copilot

# Run Copilot tests with browser visible
npm run test:copilot-headed

# Run Copilot tests on Microsoft Edge
npm run test:copilot-edge

# Run Copilot Page Object Model tests
npm run test:copilot-pom

# Alternative: Connect to existing browser session
npm run test:copilot-existing
```

### Copilot Page Object Model Tests (`copilot-prompt-coach-pom.spec.ts`)
- ✅ Structured POM implementation for Copilot
- ✅ Reusable chat and messaging actions
- ✅ Conversation flow management
- ✅ Creative prompt testing

## Configuration

The project is configured to:
- Run tests in parallel for faster execution
- Capture screenshots on failure
- Record videos for failed tests
- Generate detailed HTML reports
- Special MS Edge configuration for Microsoft Copilot tests

## Key Features

### Resilient Selectors
Tests use stable selectors that are less likely to break with UI changes:
```typescript
// Preferred approach
page.locator('input[name="search_query"]')
page.locator('#video-title')
```

### Error Handling
Graceful handling of dynamic elements:
```typescript
try {
  await page.getByRole('button', { name: /accept all|accept/i }).click({ timeout: 5000 });
} catch {
  // Cookie banner might not appear, continue with test
}
```

### Wait Strategies
Appropriate waiting for dynamic content:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('#contents ytd-video-renderer');
```

## Best Practices Implemented

1. **Stable Locators**: Uses data attributes and semantic selectors
2. **Error Handling**: Graceful degradation when elements are not found
3. **Wait Strategies**: Proper waiting for dynamic content
4. **Page Object Model**: Organized, maintainable code structure
5. **Cross-Browser Testing**: Ensures compatibility across different browsers
6. **Mobile Testing**: Responsive design verification

## Troubleshooting

### Common Issues

1. **Tests failing due to authentication**: Ensure you've run the authentication setup first
2. **Microsoft Copilot UI changes**: Tests are designed to be resilient to minor UI changes
3. **Rate limiting**: Add delays if encountering rate limiting issues
4. **Network issues**: Tests include network idle waits for better stability

### Debugging

Use the following commands for debugging:
```bash
# Run specific test with headed browser
npx playwright test tests/copilot-prompt-coach.spec.ts --headed --project=chromium-auth

# Debug with step-by-step execution
npx playwright test tests/copilot-prompt-coach.spec.ts --debug

# Generate and view trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Contributing

When adding new tests:
1. Follow the existing naming convention
2. Include proper error handling
3. Use descriptive test names
4. Add comments for complex logic
5. Ensure tests work across all configured browsers

## License

ISC License
