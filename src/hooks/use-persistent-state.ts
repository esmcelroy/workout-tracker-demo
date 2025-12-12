/**
 * usePersistentState Hook
 * 
 * Replaces GitHub Spark's useKV hook with a custom implementation
 * that communicates with a backend API. Maintains the same interface
 * so existing code requires minimal changes.
 * 
 * Usage:
 *   const [plans, setPlans] = usePersistentState<WorkoutPlan[]>('workout-plans', []);
 * 
 * Note: Keys are automatically scoped to the current user when authenticated
 */

import { useState, useCallback, useEffect } from 'react';
import { apiGet, apiSet } from '@/lib/api';

type UpdateFn<T> = (current: T) => T;
type SetStateAction<T> = T | UpdateFn<T>;

/**
 * Hook that persists state to a backend API
 * Maintains API compatibility with GitHub Spark's useKV
 * Automatically scopes keys with user ID when authenticated
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: {
    /** Skip initial load from API (useful for testing) */
    skipLoad?: boolean;
    /** Delay before persisting to backend (ms) */
    debounceMs?: number;
  }
): [T, (value: SetStateAction<T>) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(!options?.skipLoad);

  // Load initial data from API
  useEffect(() => {
    if (options?.skipLoad) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await apiGet<T>(key);
        if (isMounted) {
          setState(data ?? defaultValue);
        }
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        if (isMounted) {
          // Fall back to default value on error
          setState(defaultValue);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [key, defaultValue, options?.skipLoad]);

  // Persist state to API with optional debouncing
  const setPersistentState = useCallback(
    (value: SetStateAction<T>) => {
      const nextState = typeof value === 'function' ? (value as UpdateFn<T>)(state) : value;

      // Save to API
      const saveToApi = async () => {
        try {
          await apiSet(key, nextState);
        } catch (error) {
          console.error(`Failed to persist ${key}:`, error);
          // State is still updated locally, but failed to sync with backend
          // In a production system, could implement retry logic or user notification
        }
      };

      if (options?.debounceMs && options.debounceMs > 0) {
        // Debounce API calls
        const timeoutId = setTimeout(saveToApi, options.debounceMs);
        return () => clearTimeout(timeoutId);
      } else {
        // Fire and forget API call
        saveToApi();
      }

      setState(nextState);
    },
    [key, state, options?.debounceMs]
  );

  return [state, setPersistentState];
}

/**
 * Fallback hook for when API is unavailable
 * Uses localStorage instead for resilience
 */
export function usePersistentStateLocal<T>(
  key: string,
  defaultValue: T
): [T, (value: SetStateAction<T>) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistentState = useCallback(
    (value: SetStateAction<T>) => {
      setState((prev) => {
        const nextState = typeof value === 'function' ? (value as UpdateFn<T>)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextState));
        } catch (error) {
          console.error(`Failed to save to localStorage: ${key}`, error);
        }
        return nextState;
      });
    },
    [key]
  );

  return [state, setPersistentState];
}
