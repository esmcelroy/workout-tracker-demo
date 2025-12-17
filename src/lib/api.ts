/**
 * API Service Layer
 * Generic fetch-based client for backend communication
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'fittrack_auth_token';

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Retrieve data for a key
 */
export async function apiGet<T>(key: string): Promise<T | null> {
  const response = await fetch(`${API_BASE}/data/${key}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`API GET failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data as T;
}

/**
 * Store/update data for a key
 */
export async function apiSet<T>(key: string, data: T): Promise<T> {
  const response = await fetch(`${API_BASE}/data/${key}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(`API SET failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data as T;
}

/**
 * Delete data for a key
 */
export async function apiDelete(key: string): Promise<void> {
  const response = await fetch(`${API_BASE}/data/${key}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API DELETE failed: ${response.statusText}`);
  }
}

/**
 * List all keys
 */
export async function apiListKeys(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/keys`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API LIST failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.keys;
}

/**
 * Export all data from the backend
 */
export async function apiExport(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API EXPORT failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to export data:', error);
    return {};
  }
}

/**
 * Import data into the backend
 */
export async function apiImport(data: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(`API IMPORT failed: ${response.statusText}`);
  }
}
