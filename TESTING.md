# Test Suite Documentation

## Overview

FitTrack includes a comprehensive test suite covering unit tests, component tests, integration tests, and E2E tests. The test suite is built with:

- **Vitest**: Fast unit test framework (for component tests and logic)
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end (E2E) testing

## Test Structure

```
tests/
├── setup.ts                    # Global test setup (mocks, utilities)
├── test-utils.tsx             # Custom render function with providers
├── components/                 # Component tests
│   ├── LoginView.test.tsx
│   ├── SignupView.test.tsx
│   └── AccountView.test.tsx
├── hooks/                      # Hook tests
│   └── usePersistentState.test.tsx
├── lib/                        # Library/utility tests
│   └── api.test.ts
└── hello-world.spec.ts         # Playwright E2E example
```

## Running Tests

### Unit & Component Tests (Vitest)

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# Run specific test file
npm test -- LoginView.test.tsx

# Run tests matching pattern
npm test -- --grep "LoginView"

# Coverage report
npm test:coverage
```

### Test UI (Interactive Dashboard)

```bash
npm run test:ui
```

Opens an interactive dashboard at `http://localhost:51204/__vitest__/` to see test results, filter, and debug.

### End-to-End Tests (Playwright)

```bash
npm run test:e2e

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/hello-world.spec.ts
```

## Test Coverage

Current coverage includes:

### Component Tests
- **LoginView**: Form validation, error handling, async submit, navigation
- **SignupView**: Form validation, password matching, email format, async submit
- **AccountView**: User info display, logout functionality, data isolation notice

### Hook Tests
- **usePersistentState**: Initialization, localStorage persistence, updater functions, complex objects

### API Tests
- **apiGet**: GET requests, authorization headers, error handling
- **apiSet**: PUT requests, content-type headers, data persistence
- **apiDelete**: DELETE requests, token verification

### E2E Tests
- Login/signup user flow (ready to implement)
- Multi-user data isolation (ready to implement)
- Protected routes (ready to implement)

## Writing New Tests

### Component Test Template

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { YourComponent } from '../../src/components/YourComponent';

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders component', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });
});
```

### Hook Test Template

```tsx
import { renderHook, act } from '@testing-library/react';
import { useYourHook } from '../../src/hooks/useYourHook';

describe('useYourHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current).toEqual(expectedValue);
  });

  it('updates state', () => {
    const { result } = renderHook(() => useYourHook());
    
    act(() => {
      result.current.updateFunction();
    });
    
    expect(result.current).toEqual(newValue);
  });
});
```

## Best Practices

1. **Use `render` from test-utils**: Ensures components have access to AuthProvider and other global providers
2. **Test user behavior**: Focus on what users do, not implementation details
3. **Clean up**: `beforeEach` handles localStorage cleanup
4. **Mock external APIs**: Use `vi.fn()` for mocking fetch and hooks
5. **Async operations**: Use `waitFor` for async updates
6. **Descriptive names**: Test names should clearly state what is being tested

## Debugging Tests

### Debug output in test

```tsx
import { screen, debug } from '@testing-library/react';

it('example', () => {
  render(<Component />);
  debug(); // Prints the DOM
  screen.debug(screen.getByRole('button')); // Prints specific element
});
```

### Run single test

```bash
npm test -- --grep "specific test name"
```

### Use Vitest UI

```bash
npm run test:ui
```

Click on test to see detailed output and errors.

## CI/CD Integration

Add to GitHub Actions or CI pipeline:

```yaml
- name: Run tests
  run: npm test -- --run

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Next Steps

1. **Implement E2E tests** for critical user flows:
   - User registration and login
   - Workout plan creation and execution
   - Data isolation between users

2. **Increase coverage** to 80%+ across all components

3. **Performance tests** for large workout datasets

4. **Visual regression tests** for UI consistency

5. **API contract tests** with backend mocking

## Troubleshooting

### Tests timeout
Increase timeout in `vitest.config.ts`:
```tsx
test: {
  testTimeout: 10000, // 10 seconds
}
```

### localStorage not clearing
Ensure `tests/setup.ts` is included in `setupFiles`

### Component not rendering
Check that component is wrapped with `render` from `test-utils`, not direct `render`

### Mock not working
Clear mocks: `vi.clearAllMocks()` in `beforeEach`
