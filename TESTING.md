# Testing Strategy

This document outlines the testing strategy for the CTI Dashboard application.

## Overview

The testing strategy is divided into three main categories:

1. **Unit Tests (Backend)** - Test individual functions and services
2. **E2E Tests (Frontend)** - Test complete user workflows
3. **Postman Tests (API)** - Manual API testing and validation

## Unit Tests (Backend)

### Location
- `backend/src/__tests__/`

### Test Files
- `auth.middleware.test.ts` - Authentication and authorization middleware
- `user.service.test.ts` - User service functionality
- `organization.service.test.ts` - Organization service functionality

### Running Tests
```bash
cd backend
npm test
```

### What We Test
- **Authentication Middleware**: Token verification, role-based access control, endpoint skipping
- **Service Classes**: Method existence, basic functionality, error handling
- **Data Validation**: Input validation and error responses

### Test Structure
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## E2E Tests (Frontend)

### Location
- `web-app/src/__tests__/e2e/`

### Test Files
- `auth.spec.ts` - Authentication flows
- `organizations.spec.ts` - Organization management workflows

### Running Tests
```bash
cd web-app
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with UI for debugging
npm run test:e2e:headed   # Run with browser visible
```

### What We Test
- **Page Navigation**: Routes load correctly
- **Authentication**: Login/logout flows
- **User Interface**: Elements are present and visible
- **Cross-browser Compatibility**: Tests run on Chrome, Firefox, Safari

### Test Structure
```typescript
test.describe('Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/route');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Postman Testing (API)

### Purpose
- Manual API testing and validation
- Documentation of expected responses
- Quick debugging of endpoints
- Authorization matrix testing

### What We Test
- **All API Endpoints**: GET, POST, PUT, DELETE operations
- **Authentication**: Token validation and role enforcement
- **Data Validation**: Request/response format validation
- **Error Handling**: Proper error codes and messages

### Test Matrix
| Endpoint | Method | Admin | Editor | Viewer | Unassigned |
|----------|--------|-------|--------|--------|------------|
| `/users` | GET | ✅ | ✅ | ✅ | ✅ |
| `/users` | POST | ✅ | ❌ | ❌ | ❌ |
| `/organizations` | GET | ✅ | ✅ | ✅ | ✅ |
| `/organizations` | POST | ✅ | ✅ | ✅ | ✅ |
| `/organizations/{id}` | DELETE | ✅ | ❌ | ❌ | ❌ |
| `/incidents` | GET | ✅ | ✅ | ✅ | ✅ |
| `/incidents` | POST | ✅ | ✅ | ❌ | ❌ |
| `/incidents/{id}` | DELETE | ✅ | ✅ | ❌ | ❌ |

## CI/CD Integration

### GitHub Actions Workflow
- **Backend Tests**: Run on every push/PR to main
- **Frontend Tests**: Run on every push/PR to main
- **Deployment**: Only deploy if all tests pass

### Workflow Steps
1. **Test Backend**: Unit tests, linting, TypeScript compilation
2. **Test Frontend**: E2E tests, build verification
3. **Deploy Backend**: Cloud Functions deployment
4. **Deploy Frontend**: Firebase Hosting deployment

## Test Data Management

### Backend Tests
- Use mocked Firestore database
- No real data persistence
- Isolated test environments

### E2E Tests
- Use local development server
- No authentication required for basic tests
- Focus on UI/UX validation

### Postman Tests
- Use real Firebase tokens
- Test against staging/production environment
- Validate actual authorization matrix

## Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Mock external dependencies
- Test both success and failure cases

### E2E Tests
- Test user workflows, not implementation details
- Use data attributes for selectors when possible
- Keep tests independent and isolated
- Focus on critical user paths

### API Tests
- Test all HTTP methods for each endpoint
- Validate response schemas
- Test error conditions
- Document expected behaviors

## Running All Tests

### Local Development
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd web-app && npm run test:e2e

# Both (from root)
npm run test:all
```

### CI/CD Pipeline
Tests run automatically on:
- Pull requests to main branch
- Pushes to main branch
- Manual workflow triggers

## Coverage Goals

- **Backend**: 80%+ code coverage
- **Frontend**: Critical user paths covered
- **API**: All endpoints tested with all roles

## Troubleshooting

### Common Issues
1. **E2E Tests Failing**: Check if dev server is running
2. **Backend Tests Failing**: Verify mock setup
3. **Postman Tests Failing**: Check token validity

### Debug Commands
```bash
# Debug E2E tests
npm run test:e2e:ui

# Debug backend tests
npm run test:watch

# Check test coverage
npm run test:coverage
``` 