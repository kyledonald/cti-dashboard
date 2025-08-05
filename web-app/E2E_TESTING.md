# E2E Testing with Playwright

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the `web-app` directory:

```bash
# Test user credentials (create this user in your production environment)
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password

# Optional: Set base URL for different environments
BASE_URL=http://localhost:5173

# Optional: Run in headed mode (see browser)
HEADLESS=false
```

### 2. Create Test User

1. **Create a test user in your production environment:**
   - Email: `your-test-user@example.com`
   - Password: `your-test-password`
   - Role: `admin` (to test all features)
   - Organization: Create a test organization

2. **Ensure the test user has:**
   - Admin permissions
   - Access to all features
   - A test organization to work with

### 3. Run E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test comprehensive-user-journey.spec.ts

# Run with UI mode (interactive)
npm run test:e2e:ui
```

## 🎯 Test Coverage

### Comprehensive User Journey Test

The main E2E test covers multiple functional requirements:

- **FR01**: User Authentication & Dashboard Access
- **FR02**: User Logout
- **FR03**: User Account Updates
- **FR04/FR05**: User Role Management
- **FR06/FR07**: CVE Management
- **FR08**: AI Summary Generation & PDF Export

### Test Flow

1. **Login** → Dashboard access
2. **Settings** → Profile update
3. **Organization** → User role management
4. **CVEs** → High CVSS filtering & detail viewing
5. **Incidents** → Create incident & AI summary
6. **Logout** → Session termination

## 🔧 Configuration

### Playwright Config

- **Base URL**: Configurable via `BASE_URL` env var
- **Headless Mode**: Toggle with `HEADLESS=false`
- **Browsers**: Chrome, Firefox, Safari
- **Timeouts**: 30s global, 10s expect
- **Screenshots**: On failure
- **Videos**: On failure

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run E2E Tests
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    BASE_URL: ${{ secrets.BASE_URL }}
  run: npm run test:e2e
```

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Verify test user credentials
   - Check if user exists in production
   - Ensure user has proper permissions

2. **Element Not Found**
   - Check if selectors match your UI
   - Verify page structure hasn't changed
   - Use `page.pause()` for debugging

3. **Timeout Errors**
   - Increase timeout in config
   - Check network connectivity
   - Verify backend is running

### Debug Mode

```bash
# Run with debug logging
DEBUG=pw:api npm run test:e2e

# Pause on failure
npx playwright test --debug

# Show browser
npx playwright test --headed
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🔒 Security Notes

- **Never commit real credentials** to version control
- **Use environment variables** for sensitive data
- **Create dedicated test accounts** with minimal permissions
- **Clean up test data** after tests complete

## 🎉 Success Criteria

A successful E2E test run should:

- ✅ Complete the full user journey
- ✅ Test all major functional requirements
- ✅ Handle error cases gracefully
- ✅ Generate comprehensive reports
- ✅ Run in CI/CD pipeline 