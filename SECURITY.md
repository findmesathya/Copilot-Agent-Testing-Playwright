# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The Microsoft Copilot Playwright Testing Suite team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [security@yourdomain.com](mailto:security@yourdomain.com)

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- You should receive a response within 48 hours
- We will work with you to understand and validate the issue
- We will provide an estimated timeline for addressing the issue
- We will notify you when the issue is fixed

## Security Considerations

This project involves:

### API Key Management
- **OpenAI API Keys**: Store in `.env` files, never commit to repository
- **Authentication Tokens**: Stored in `playwright/.auth/` (gitignored)
- **Environment Variables**: Use `.env.example` as template, never commit actual `.env`

### Browser Security
- **Remote Debugging**: Uses `--remote-debugging-port=9222` for browser connection
- **Local Execution**: Tests run locally, no remote code execution
- **Authentication**: Uses existing browser sessions, no credential storage

### Data Privacy
- **Screenshots**: May contain sensitive information, stored locally only
- **Videos**: Full browser recordings, ensure no sensitive data visible
- **Test Data**: All conversation data stored locally, not transmitted

### Best Practices
- Always review screenshots and videos before sharing
- Use test accounts for Copilot testing, not production accounts
- Regularly rotate API keys
- Keep dependencies updated
- Run tests in isolated environments

## Known Security Considerations

### Browser Debugging Port
The tests require Microsoft Edge to run with `--remote-debugging-port=9222`. This:
- Opens a local debugging interface
- Should only be used in development/testing environments
- Should not be used on production systems
- Automatically closes when Edge is closed

### OpenAI API Integration
- API calls include screenshot data (base64 encoded images)
- Data is sent to OpenAI's servers for analysis
- Follow OpenAI's data usage policies
- Consider using test data only

### Local File Access
The project creates and accesses local files:
- Screenshots in `./screenshots/`
- Videos in `./test-results/`
- Authentication data in `./playwright/.auth/`
- All file access is within the project directory

## Dependencies

We regularly monitor our dependencies for security vulnerabilities using:
- `npm audit`
- GitHub Security Advisories
- Dependabot alerts

To check for vulnerabilities:
```bash
npm audit
npm audit fix
```

## Updates and Patches

Security updates will be released as:
- Patch versions (1.0.x) for security fixes
- Documentation updates for security guidance
- Immediate notifications for critical vulnerabilities

Subscribe to releases to get notified of security updates.

---

**Remember**: Never commit sensitive information like API keys, passwords, or authentication tokens to the repository.
