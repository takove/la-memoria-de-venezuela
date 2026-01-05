# Frontend Testing Guide

## Test Structure

La Memoria de Venezuela frontend uses a comprehensive testing strategy combining:

- **Unit Tests**: Component logic, utilities, and data transformations
- **Integration Tests**: API communication, state management, user flows
- **E2E Tests**: Full page interactions using Playwright

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Watch mode (development)
pnpm test

# Run once with coverage
pnpm test:ci

# Coverage report
pnpm test:cov

# UI Dashboard
pnpm test:ui
```

### End-to-End Tests (Playwright)

```bash
# Run all e2e tests
pnpm test:e2e

# UI mode (interactive)
pnpm test:e2e:ui

# Debug mode (step through)
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e -- homepage.spec.ts

# Run in specific browser
pnpm test:e2e -- --project=firefox
```

## Test Files

### Unit Tests
- `tests/unit/components.test.ts` - Component rendering and behavior
- `tests/unit/integration.test.ts` - Integration tests for stores, API, data flows

### E2E Tests
- `tests/e2e/homepage.spec.ts` - Homepage navigation, language toggle, responsiveness
- `tests/e2e/officials.spec.ts` - Officials listing, filtering, detail pages
- `tests/e2e/pages.spec.ts` - Sanctions, search, cases, memorial, about pages

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage on services and utilities
- **E2E Tests**: Critical user paths (search, filter, navigation)
- **Integration Tests**: API interactions, state management

## Writing New Tests

### E2E Test Pattern

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should do something specific", async ({ page }) => {
    await page.goto("/path");
    
    const element = page.locator("selector");
    await expect(element).toBeVisible();
    
    await element.click();
    await page.waitForLoadState("networkidle");
    
    expect(page.url()).toContain("/expected-path");
  });
});
```

### Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("ComponentName", () => {
  it("should render correctly", () => {
    // Arrange
    const props = { label: "Test" };
    
    // Act
    const result = render(Component, { props });
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` branch
- Pull requests
- Pre-commit hook (configured in `.husky`)

### GitHub Actions

Tests are run in CI with:
- `pnpm test:ci` - Unit tests with coverage
- `pnpm test:e2e` - E2E tests (runs only on main branch)

## Best Practices

1. **Test User Behavior**: Test what users do, not implementation details
2. **Avoid Implementation Details**: Use accessible selectors (`data-testid`, text, roles)
3. **Write Descriptive Names**: Test names should explain what they test
4. **Keep Tests Fast**: Use `waitForLoadState` instead of hard waits
5. **Handle Dynamic Content**: Test with `data-testid` attributes
6. **Bilingual Testing**: Include Spanish and English text matching
7. **Accessibility**: Verify ARIA labels, semantic HTML, keyboard navigation

## Common Issues

### Tests Timeout
- Increase timeout in specific test: `test.setTimeout(10000)`
- Check if API is actually running: `http://localhost:3000/api/v1/health`

### Selector Issues
- Use `page.screenshot()` to debug selectors
- Use `page.pause()` to pause execution
- Check inspector with `page.locator("selector").isVisible()`

### API Errors
- Verify backend is running on `http://localhost:3000`
- Check if database migrations are applied
- Verify environment variables are set

## Debugging Tests

### Interactive Mode
```bash
# Run with Playwright Inspector
pnpm test:e2e:debug

# Step through test and inspect elements
# Use Inspector console to run Playwright commands
```

### Screenshots & Videos
Playwright automatically captures:
- Screenshots on failure: `test-results/`
- Videos of test runs: Enable in `playwright.config.ts`

### View Test Report
```bash
# Open HTML report after running tests
pnpm test:e2e
npx playwright show-report
```

## Performance Testing

Monitor test execution time:
```bash
# Run with timing information
pnpm test:e2e --reporter=list
```

## Accessibility Testing

Each test includes checks for:
- Heading hierarchy (`<h1>`, `<h2>`, etc.)
- Image alt text
- ARIA labels on buttons
- Keyboard navigation
- Color contrast (can add with `axe-playwright`)

## Code Coverage

After running tests, check coverage:

```bash
# Generate coverage report
pnpm test:cov

# View HTML report
open coverage/index.html
```

Target coverage levels:
- Statements: 70%+
- Branches: 65%+
- Functions: 70%+
- Lines: 70%+

## Contributing

When adding new features:

1. Write e2e test for user flow
2. Write unit tests for components
3. Ensure all tests pass: `pnpm test:ci && pnpm test:e2e`
4. Check coverage report
5. Run accessibility checks
6. Commit with tests included

---

For more information, see:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/svelte)
