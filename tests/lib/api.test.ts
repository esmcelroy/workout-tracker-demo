import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiGet, apiSet, apiDelete } from '../../src/lib/api';

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  describe('apiGet', () => {
    it('sends GET request to correct endpoint', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await apiGet('test-key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-key'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes authorization header when token exists', async () => {
      localStorage.setItem('fittrack_auth_token', 'test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await apiGet('test-key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('returns parsed response data', async () => {
      const mockData = { id: '1', name: 'Test Plan' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await apiGet('test-key');

      expect(result).toEqual(mockData);
    });

    it('throws error on failed request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(apiGet('test-key')).rejects.toThrow();
    });

    it('throws error on network failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiGet('test-key')).rejects.toThrow('Network error');
    });
  });

  describe('apiSet', () => {
    it('sends PUT request with data', async () => {
      const mockData = { id: '1', name: 'Test Plan' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      await apiSet('test-key', mockData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-key'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ data: mockData }),
        })
      );
    });

    it('includes content-type and authorization headers', async () => {
      localStorage.setItem('fittrack_auth_token', 'test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiSet('test-key', { data: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('returns persisted data', async () => {
      const mockData = { id: '1', name: 'Test Plan' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await apiSet('test-key', mockData);

      expect(result).toEqual(mockData);
    });
  });

  describe('apiDelete', () => {
    it('sends DELETE request to correct endpoint', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiDelete('test-key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-key'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('includes authorization header', async () => {
      localStorage.setItem('fittrack_auth_token', 'test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiDelete('test-key');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('succeeds even without token for public endpoints', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiDelete('test-key');

      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
