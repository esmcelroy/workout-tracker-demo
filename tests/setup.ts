import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch for API calls with proper response structure
global.fetch = vi.fn((url: string) => {
  // Extract key from URL pattern /api/data/:key
  const match = url.match(/\/api\/data\/([^/?]+)/);
  const key = match ? match[1] : null;
  
  // Get value from localStorage for the key
  const value = key ? localStorage.getItem(key) : null;
  
  // API expects { data: <value> } structure
  const responseData = value ? { data: JSON.parse(value) } : { data: null };
  
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
  } as Response);
}) as unknown as typeof fetch;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.matchMedia for prefers-reduced-motion
const mockMatchMedia = (query: string) => {
  const isReducedMotion = query === '(prefers-reduced-motion: reduce)';
  return {
    matches: isReducedMotion ? false : query === '(prefers-reduced-motion: no-preference)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(mockMatchMedia),
});

// Add jest-axe matchers to expect
expect.extend(toHaveNoViolations);