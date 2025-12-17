import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePersistentState } from '../../src/hooks/use-persistent-state';

describe('usePersistentState Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Mock API calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 404,
        json: async () => ({ data: null }),
      } as Response)
    ) as any;
  });

  it('initializes with default value when no data exists', async () => {
    const { result } = renderHook(() => usePersistentState('test-key', 'default-value'));
    
    await waitFor(() => {
      expect(result.current[0]).toBe('default-value');
    });
  });

  it('persists value via API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    });

    const { result } = renderHook(() => usePersistentState('test-key', 'initial'));

    await waitFor(() => {
      expect(result.current[0]).toBe('initial');
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'updated' }),
    });

    act(() => {
      result.current[1]('updated');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('updated');
    });

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('test-key'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('retrieves persisted value from API on mount', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'stored-value' }),
    });

    const { result } = renderHook(() => usePersistentState('test-key', 'default'));
    
    await waitFor(() => {
      expect(result.current[0]).toBe('stored-value');
    });
  });

  it('supports updater functions', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { count: 0 } }),
    });

    const { result } = renderHook(() => usePersistentState('test-key', { count: 0 }));

    await waitFor(() => {
      expect(result.current[0]).toEqual({ count: 0 });
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { count: 1 } }),
    });

    act(() => {
      result.current[1]((prev) => ({ count: prev.count + 1 }));
    });

    await waitFor(() => {
      expect(result.current[0].count).toBe(1);
    });
  });

  it('handles array persistence', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { result } = renderHook(() => usePersistentState('test-array', [] as string[]));

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: ['item1', 'item2'] }),
    });

    act(() => {
      result.current[1]((prev) => [...prev, 'item1', 'item2']);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(['item1', 'item2']);
    });
  });

  it('handles complex object persistence', async () => {
    const initialObject = {
      user: { id: '1', name: 'Test' },
      settings: { theme: 'dark' },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: initialObject }),
    });

    const { result } = renderHook(() => usePersistentState('test-object', initialObject));

    await waitFor(() => {
      expect(result.current[0]).toEqual(initialObject);
    });

    const updatedObject = {
      user: { id: '1', name: 'Test' },
      settings: { theme: 'light' },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: updatedObject }),
    });

    act(() => {
      result.current[1]((prev) => ({
        ...prev,
        settings: { theme: 'light' },
      }));
    });

    await waitFor(() => {
      expect(result.current[0].settings.theme).toBe('light');
      expect(result.current[0].user.id).toBe('1');
    });
  });
});
